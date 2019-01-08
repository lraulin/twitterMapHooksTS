const admin = require("firebase-admin");
const serviceAccount = require("./incident-report-map-firebase-adminsdk-rx0ey-6ec9058686.json");
const incidentTypes = require("./incidentTypes.js");
const secrets = require("./secrets.js");
const Twitter = require("twitter");
const _ = require("lodash");
const axios = require("axios");
const fs = require("fs");

const searchString =
  "fatal crash,fatal car crash,fatal car accident,pedestrian killed,fatal truck accident,fatal truck crash,truck kill,bus kill,cyclist killed,bicyclist killed,pedestrian crash,pedestrian killed,bicyclist crash,bicyclist killed,cyclist crash,cyclist killed,truck crash,truck kill,fatal truck crash,fatal truck accident,bus crash,bus kill,transit crash,transit crash,transit kill,rail suicide,transit suicide,pipeline explosion,pipeline spills,hazardous spill,hazardous spills,train explosion,train explode,bike lane blocked,bus lane blocked,road closed,road closure,road flooded,road washed,bridge closed,bridge out,ran red light,blew red light,blew through red light,drone unauthorized";

const client = new Twitter({
  consumer_key: secrets.twitterConfig.consumerKey,
  consumer_secret: secrets.twitterConfig.consumerSecret,
  access_token_key: secrets.twitterConfig.accessToken,
  access_token_secret: secrets.twitterConfig.accessTokenSecret
});

let tweet_repo = [];
let rate_limit_exceeded = false;

function fbinit() {
  console.log("initialing firebase...");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://incident-report-map.firebaseio.com"
  });

  const db = admin.database();
  const ref = db.ref("tweets");
}

function search_all_types() {
  // initiate a twitter search for each category
  Object.entries(incidentTypes).forEach(([key, value]) => {
    search_twitter(key, value.searchString)
      .then(res => saveData(tweet_repo))
      .catch(e => console.log(e));
  });
}

async function search_twitter(incident_type, search_string) {
  const filters = [
    "-filter:retweets",
    "-filter:nativeretweets",
    "filter:verified"
  ];

  const filter_str = encodeURI(" " + filters.join(" "));

  const q = search_string.replace(" ", "") + filter_str;
  console.log(q);
  let max_id_str = null;
  let results = null;
  let tweets = [];
  while (tweets.length < 1500 && !rate_limit_exceeded) {
    try {
      results = await clientGet(client, q, max_id_str);
      if (!results.length) {
        break;
      }
      max_id_str = results.search_metadata.max_id_str;
      tweets = tweets.concat(results.statuses);
      if (tweets.length === 0) break;
    } catch (e) {
      console.log(e);
      break;
    }
  }
  _.remove(tweets, tweet => tweet.user.verified !== true);
  _.remove(tweets, tweet => !!tweet.retweeted_status);
  categorizeAll(tweets);
  tweet_repo = tweet_repo.concat(tweets);
}

async function clientGet(client, q, max_id_str = null) {
  let results = null;
  const options = { q, tweet_mode: "extended", lang: "en", count: 100 };
  if (max_id_str) options.max_id_str = max_id_str;
  try {
    results = await client.get("search/tweets", options);
  } catch (e) {
    if (e[0] && e[0].code === 88) {
      // rate limit exceeded; stop making requests
      console.log("Rate limit exceeded");
      rate_limit_exceeded = true;
    } else {
      console.log(e);
    }
  }
  return results;
}

function categorizeAll(tweets) {
  tweets.forEach(tweet => {
    try {
      if (!Array.isArray(tweet.incidentType)) {
        categorize(tweet);
      }
    } catch (e) {
      console.log(e);
    }
  });
}

function categorize(tweet) {
  if (!tweet.id_str) {
    throw new TypeError("Not a Tweet!");
  }
  const types = [];
  Object.keys(incidentTypes).forEach(typeKey => {
    const re = incidentTypes[typeKey].regex;
    if (tweet.text.match(re)) {
      types.push(typeKey);
    }
  });
  tweet.incidentType = types;
  return tweet;
}

async function localize(tweet) {
  if (!tweet.id_str) {
    throw new TypeError("Not a Tweet!");
  }

  if (!tweet.coordinates) {
    let location;
    try {
      location = tweet.user.location;
    } catch (e) {
      console.log(e);
      throw new TypeError("Not a Tweet!");
    }
    tweet.coordinates = await getLatLong(location);
  }
  return tweet;
}

async function getLatLong(location) {
  const location = encodeURIComponent(location);
  const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${
    secrets.googleMapsApiKey
  }`;
  return axios
    .get(apiUrl)
    .then(res => {
      const lat = res.data.results[0].geometry.location.lat;
      const lng = res.data.results[0].geometry.location.lng;
      return {
        Latitude: lat,
        Longitude: lng
      };
    })
    .catch(e => {
      console.log(e);
      console.log("Unfound Location " + location);
    });
}

function saveData(data) {
  if (!data) {
    throw new Error("Data is empty");
  }

  if (Array.isArray(data)) {
    const obj = {};
    data.forEach(tweet => (obj[tweet.id_str] = tweet));
    data = obj;
  }

  // save data to mock database and return promise
  const JSON_SERVER_URL = "http://localhost:3001/posts";
  if (Object.keys(data).length) {
    axios.post(JSON_SERVER_URL, data);
  }
}

async function processStream(data) {
  if (data.id_str) {
    if (data.user.verified === false) {
      console.log("User not verified...discarding Tweet.");
      return;
    }
    if (data.retweeted_status) {
      console.log("Tweet is a retweet...discarding.");
      //TODO: check if we have the original Tweet, and add it if not.
      return;
    }
    categorize(data);
    data = await localize(data);
    fbSaveTweet(data);
  }
}

function fbSaveTweet(tweet) {
  // pass
}

function mainSearch() {
  search_all_types();
  console.log(`${tweet_repo.length} tweets found`);
}

function mainStream() {
  var stream = client.stream("statuses/filter", { track: searchString });
  stream.on("data", function(event) {
    console.log(event && event.text);
    writeToFile(
      `\nUTS: ${Date.now()}\n${JSON.stringify(event)}`,
      "tweetStream.json"
    );
  });
}

function writeToFile(text, file) {
  const stream = fs.createWriteStream(file, { flags: "a" });
  stream.write(text + "\n");
  stream.end();
}

mainStream();
