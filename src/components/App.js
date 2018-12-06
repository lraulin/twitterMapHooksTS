import React, { Component } from "react";
import "../styles/App.css";
import Map from "./Map";
import SearchPane from "./SearchPane";
import TweetPane from "./TweetPane";
import Twitter from "twitter-node-client";
import secrets from "../secrets";
import { incidentDictionary } from "../utilities/incidents";
import _ from "lodash";
import where from "node-where";
import geocoder from "geocoder";
import axios from "axios";

const style = {
  // display: "block"
};

class App extends Component {
  state = {
    tweets: {}
  };

  fetchTweets = this.fetchTweets.bind(this);

  fetchTweets(types) {
    // Initialize Twitter library
    const twitter = new Twitter.Twitter(secrets.twitterConfig);
    types.forEach(type => {
      const searchString = incidentDictionary[type].searchString;
      this.searchTwitter(twitter, searchString);
    });
  }

  searchTwitter(twitter, queryString) {
    twitter.getSearch(
      { q: queryString, count: 100 },
      err => console.log(err),
      data => this.addTweets(data)
    );
  }

  addTweets(data) {
    const tweets = this.state.tweets;
    const newTweets = JSON.parse(data).statuses;
    newTweets.forEach(tweet => {
      // add to collection only if it is not already there,
      // and the account is verified
      if (!tweets[tweet.id_str] && tweet.user.verified === true) {
        if (!tweet.coordinates && tweet.user.location) {
          this.getLatLong(tweet);
        }
        tweets[tweet.id_str] = tweet;
      }
    });
    this.setState({ tweets });
  }

  getLatLong(tweet) {
    const location = encodeURIComponent(tweet.user.location);
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${
      secrets.googleMapsApiKey
    }`;
    axios.get(apiUrl).then(res => {
      const lat = res.data.results[0].geometry.location.lat;
      const lng = res.data.results[0].geometry.location.lng;
      tweet.coordinates = {
        Latitude: lat,
        Longitude: lng
      };
    });
  }

  componentDidMount() {}

  render() {
    return (
      <div className="App">
        <div className="container-fluid" style={style}>
          <div className="row">
            <div className="col-sm-2">
              <SearchPane fetchTweets={this.fetchTweets} />
            </div>
            <div className="col-sm-7">
              <Map tweets={Object.entries(this.state.tweets)} />
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
