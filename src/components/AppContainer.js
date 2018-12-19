import React, { Component } from "react";
import "../styles/App.css";
import App from "./App";
import Twitter from "twitter-node-client";
import secrets from "../secrets";
import { incidentDictionary } from "../utilities/incidents";
import axios from "axios";
import incidentTypes from "../utilities/incidents";
import _ from "lodash";
import isTweet from "../utilities/isTweet";

// REST API url for mock database
const JSON_SERVER_URL = "http://localhost:3001/posts";

class AppContainer extends Component {
  state = {
    tweets: {},
    filteredTweets: []
  };

  fetchTweets = this.fetchTweets.bind(this);
  applyFilter = this.applyFilter.bind(this);
  applyCategories = this.applyCategories.bind(this);

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
        this.setState({ tweets });
      })
      .catch(e => console.log(e));
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

  applyFilter({ incidentTypes, startDate, endDate, text }) {
    let filteredTweets = Object.values(this.state.tweets);
    const initialCount = filteredTweets.length;

    if (startDate) {
      _.remove(
        filteredTweets,
        t =>
          new Date(t.created_at) < startDate || new Date(t.created_at) > endDate
      );
    }

    if (text) {
      const words = text.split(" ");
      _.remove(
        filteredTweets,
        tweet => !words.some(word => tweet.text.includes(word))
      );
    }

    _.remove(filteredTweets, t => !incidentTypes.includes(t.incidentType));

    const finalCount = filteredTweets.length;
    console.log(`${finalCount} of ${initialCount} Tweets match filter`);
    this.setState({ filteredTweets });
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

  componentDidMount() {
    this.loadData();
    let sqlStrs = [];
    Object.entries(incidentDictionary).forEach(([key, value]) => {
      const sql = [];
      sql.push(key);
      sql.push(value.displayName);
      sql.push(value.searchString);
      sql.push(value.crisisType);
      sql.push(value.regex);
      let sqlStr = `("` + sql.join(`", "`) + `")`;
      sqlStrs.push(sqlStr);
    });
    //const types = incidentTypes.map(incidentType => incidentType.id);
    //this.fetchTweets(types);
  }

  render() {
    return (
      <App
        tweets={this.state.tweets}
        filteredTweets={this.state.filteredTweets}
        fetchTweets={this.fetchTweets}
        applyFilter={this.applyFilter}
      />
    );
  }
}

export default AppContainer;
