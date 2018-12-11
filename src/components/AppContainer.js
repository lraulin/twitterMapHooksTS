import React, { Component } from "react";
import "../styles/App.css";
import App from "./App";
import Twitter from "twitter-node-client";
import secrets from "../secrets";
import { incidentDictionary } from "../utilities/incidents";
import _ from "lodash";
import axios from "axios";

class AppContainer extends Component {
  state = {
    tweets: new Map()
  };

  fetchTweets = this.fetchTweets.bind(this);

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
        res = res
          .filter(
            tweet =>
              !!tweet &&
              tweet.coordinates !== null &&
              tweet.coordinates !== undefined
          )
          .catch(e => console.log(e));

        // store in hash map to prevent duplicates
        // TODO: reconsider order...dedupe before fetching lat/long
        const tweets = new Map();
        res.forEach(x => tweets.set(x.id_str, x));

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

  render() {
    return <App tweets={this.state.tweets} fetchTweets={this.fetchTweets} />;
  }
}

export default AppContainer;
