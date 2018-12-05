import React, { Component } from "react";
import "../styles/App.css";
import Map from "./Map";
import SearchPane from "./SearchPane";
import TweetPane from "./TweetPane";
import Twitter from "twitter-node-client";
import secrets from "../secrets";
import incidents from "../utilities/incidents";

class App extends Component {
  state = {
    tweets: {}
  };

  fetchTweets = this.fetchTweets.bind(this);

  fetchTweets(types) {
    // Initialize Twitter library
    const twitter = new Twitter.Twitter(secrets.twitterConfig);
    const res = this.searchTwitter(twitter, "test");
    console.log(res);
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
      if (!tweets[tweet.id_str]) {
        tweets[tweet.id_str] = tweet;
      }
    });
    this.setState({ tweets });
  }

  componentDidMount() {}

  render() {
    return (
      <div className="App">
        <div className="container">
          <div className="row">
            <div className="col-sm">
              <SearchPane fetchTweets={this.fetchTweets} />
            </div>
            <div className="col-sm">
              <Map />
            </div>
            <div className="col-sm">
              <TweetPane />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
