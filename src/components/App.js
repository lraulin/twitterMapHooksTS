import React, { Component } from "react";
import "../styles/App.css";
import Map from "./Map";
import SearchPane from "./SearchPane";
import TweetPane from "./TweetPane";
import Twitter from "twitter-node-client";
import secrets from "../secrets";
import { incidentDictionary } from "../utilities/incidents";
import _ from "lodash";
import axios from "axios";

const style = {
  // display: "block"
};

class App extends Component {
  state = {
    tweets: []
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
      .then(res => {
        const promises = res.map(tweet => this.getLatLong(tweet));
        return Promise.all(promises);
      })
      .then(tweets => {
        // toss out any that still don't have location
        tweets = tweets.filter(
          tweet =>
            !!tweet &&
            tweet.coordinates !== null &&
            tweet.coordinates !== undefined
        );
        this.setState({ tweets });
      });
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
      console.log("getting lat/long for " + tweet.user.name);
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
    return (
      <div className="App">
        <div className="container-fluid" style={style}>
          <div className="row">
            <div className="col-sm-2">
              <SearchPane fetchTweets={this.fetchTweets} />
            </div>
            <div className="col-sm-7">
              <Map tweets={this.state.tweets} />
            </div>
            <div className="col-sm-3">
              <TweetPane />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
