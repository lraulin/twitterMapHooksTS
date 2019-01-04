const admin = require("firebase-admin");
const serviceAccount = require("./incident-report-map-firebase-adminsdk-rx0ey-6ec9058686.json");
const incidentTypes = require("./incidentTypes.js");
const secrets = require("./secrets.js");
const Twitter = require("twitter");
const _ = require("lodash");
const axios = require("axios");

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
  let max_id_str = null;
  let results = null;
  let tweets = [];
  while (tweets.length < 1500 && !rate_limit_exceeded) {
    try {
      results = await clientGet(client, q, max_id_str);
      if (!results.length) {
        console.log(`${incident_type} search: No results`);
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
  applyCategories(tweets);
  tweet_repo = tweet_repo.concat(tweets);
}

async function clientGet(client, q, max_id_str = null) {
  let results = [];
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

function applyCategories(tweets) {
  tweets.forEach(tweet => {
    try {
      if (!Array.isArray(tweet.incidentType)) {
        const types = [];
        Object.keys(incidentTypes).forEach(typeKey => {
          const re = incidentTypes[typeKey].regex;
          if (tweet.text.match(re)) {
            types.push(typeKey);
          }
        });
        if (types) {
          console.log(types);
          tweet.incidentType = types;
        }
      }
    } catch (e) {
      console.log(e);
    }
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

function main() {
  search_all_types();
}

main();
