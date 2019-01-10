import React, { Component } from "react";
import "../styles/App.css";
import App from "./App";
import Twitter from "twitter-node-client";
import secrets from "../secrets";
import { incidentDictionary } from "../utilities/incidents";
import axios from "axios";
import _ from "lodash";
import firebase from "../firebase";
import { isFirstDayOfMonth } from "date-fns/esm";

// REST API url for mock database
const JSON_SERVER_URL = "http://localhost:3001/posts";

class AppContainer extends Component {
  state = {
    tweets: null,
    filteredTweets: null,
    filter: {
      startDate: null,
      endDate: null,
      incidentTypes: null,
      text: undefined
    }
  };

  fetchTweets = this.fetchTweets.bind(this);
  applyFilter = this.applyFilter.bind(this);
  setFilter = this.setFilter.bind(this);
  applyCategories = this.applyCategories.bind(this);
  firebaseFetch = this.firebaseFetch.bind(this);
  firebaseInit = this.firebaseInit.bind(this);
  retry = this.retry.bind(this);

  fetchTweets(types) {
    // Get all Tweets asyncronously
    const twitter = new Twitter.Twitter(secrets.twitterConfig);
    const promises = types.map(type => {
      const searchString = incidentDictionary[type].searchString;
      return this.searchTwitter(twitter, searchString);
    });
    Promise.all(promises)
      .then(
        // merge results into an array of tweet objects
        res => res.reduce((a, c) => a.concat(c["statuses"]), []),
        err => console.log(err)
      )
      .catch(e => console.log(e))
      .then(res => {
        // set lat/lng for tweets with no location data
        const promises = res.map(tweet => this.getLatLong(tweet));
        return Promise.all(promises);
      })
      .catch(e => console.log(e))
      .then(res => {
        // toss out any that still don't have location
        res = res.filter(
          tweet =>
            !!tweet &&
            tweet.coordinates !== null &&
            tweet.coordinates !== undefined
        );

        // store in object to prevent duplicates
        // TODO: reconsider order...dedupe before fetching lat/long
        const tweets = {};
        res.forEach(tweet => (tweets[tweet.id_str] = tweet));
        this.saveData(tweets);
        this.setState({ tweets }, this.applyFilter);
      })
      .catch(e => console.log(e));
  }

  changeFilterText(text) {
    this.setState(prevState => ({
      filter: {
        ...prevState.filter,
        text
      }
    }));
  }

  searchTwitter(twitter, queryString) {
    // Twitter search API call wrapped in a promise
    return new Promise((resolve, reject) =>
      twitter.getSearch(
        { q: queryString + "filter:verified", count: 100 },
        err => reject(err),
        data => resolve(JSON.parse(data))
      )
    ).catch(e => console.log(e));
  }

  getLatLong(tweet) {
    if (tweet.user.location) {
      const location = encodeURIComponent(tweet.user.location);
      const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${
        secrets.googleMapsApiKey
      }`;
      return axios
        .get(apiUrl)
        .then(res => {
          const lat = res.data.results[0].geometry.location.lat;
          const lng = res.data.results[0].geometry.location.lng;
          tweet.coordinates = {
            Latitude: lat,
            Longitude: lng
          };
          return tweet;
        })
        .catch(e => {
          console.log(e);
          console.log("Unfound Location " + tweet.user.location);
        });
    }
  }

  setFilter(filter) {
    this.setState({ filter }, this.applyFilter);
  }

  applyFilter() {
    const { startDate, endDate, incidentTypes, text } = this.state.filter;
    let tweets = Object.values(this.state.tweets);

    const notRetweet = t => !("retweeted_status" in t);

    const inDateRange = t =>
      new Date(t.created_at) >= startDate && new Date(t.created_at) <= endDate;

    const matchesText = tweet => text.some(word => tweet.text.includes(word));

    const hasTypes = t => {
      if (typeof t.incidentType === "string") {
        return incidentTypes.includes(t.incidentType);
      } else if (typeof t.incidentType === "object") {
        // Tweet has an array of incident types; at least one must be selected
        return t.incidentType.some(type => incidentTypes.includes(type));
      }
    };

    // Apply filters if applicable.
    tweets = tweets.filter(notRetweet);
    tweets = startDate && endDate ? tweets.filter(inDateRange) : tweets;
    tweets = text ? tweets.filter(matchesText) : tweets;
    tweets = incidentTypes ? tweets.filter(hasTypes) : tweets;

    this.setState({ filteredTweets: tweets });
  }

  applyCategories(tweets) {
    Object.values(tweets).forEach(tweet => {
      if (tweet.incidentTypes) {
        delete tweet.incidentTypes;
      }
      Object.entries(incidentDictionary).forEach(([key, value]) => {
        if (value.regex.test(tweet.text)) {
          tweet.incidentType = key;
        }
      });
    });
  }

  saveData(data) {
    // save data to mock database and return promise
    if (Object.keys(data).length) {
      axios.post(JSON_SERVER_URL, data);
    }
  }

  loadData() {
    // load data from mock database and return promise
    return axios.get(JSON_SERVER_URL).then(res => {
      if (res.data) {
        this.applyCategories(res.data);
        this.setState(
          {
            tweets: res.data,
            filteredTweets: Object.values(res.data)
          },
          rej => console.log(rej)
        );
      } else {
        console.log("data could not be retrieved");
      }
    });
  }

  firebaseInit() {
    firebase
      .auth()
      .signInWithEmailAndPassword(
        secrets.firebase.user,
        secrets.firebase.password
      )
      .then(res => {
        console.log("Firebase initialized!");
        this.firebaseFetch();
      })
      .catch(error => {
        if (error.code === "auth/user-not-found") {
          console.log("Error logging in.");
        }
      });
  }

  firebaseFetch() {
    console.log("Fetching from Firebase...");
    const ref = firebase.database().ref("tweets");
    // fetch data once if local cache (state.tweets) is empty,
    // because the on value listener doesn't always fire immediately when
    // page is reloaded
    if (!this.state.tweets) {
      ref.once("value").then(snapshot => {
        const tweets = snapshot.val();
        if (tweets) {
          this.setState({ tweets }, this.applyFilter);
        } else {
          console.log("firebaseFetch: Something went wrong...no tweets...");
        }
      });
    }
    // make sure we're not creating duplicate listeners
    ref.off();
    // create listener to update state whenever database changes
    ref.on("value", snapshot => {
      const tweets = snapshot.val();
      if (tweets) {
        console.log("Retrieved tweets from Firebase!");
        this.setState({ tweets }, this.applyFilter);
      }
    });
  }

  reset() {
    const filter = {
      startDate: null,
      endDate: null,
      incidentTypes: null,
      text: null
    };
    this.setState({ filter });
  }

  retry() {
    // If we don't have Tweets, retry every 2 seconds until we do.
    if (!this.state.tweets) {
      this.firebaseInit();
      setTimeout(() => this.retry(), 2000);
    }
  }

  componentDidMount() {
    this.firebaseInit();
    setTimeout(() => this.retry(), 2000);
  }

  render() {
    return (
      <App
        tweets={this.state.tweets}
        filteredTweets={this.state.filteredTweets}
        fetchTweets={this.fetchTweets}
        setFilter={this.setFilter}
        numTweets={_.size(this.state.tweets)}
        filter={this.state.filter}
      />
    );
  }
}

export default AppContainer;
