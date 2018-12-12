import React, { Component } from "react";
import Tweet from "react-tweet";
import { className } from "postcss-selector-parser";

class TweetPane extends Component {
  render() {
    const linkProps = { target: "_blank", rel: "noreferrer" };
    const tweets = Object.values(this.props.tweets);

    return (
      <div id="tweetContainer">
        {tweets &&
          tweets.map(tweet => (
            <Tweet
              className={className}
              data={tweet}
              linkProps={linkProps}
              key={tweet.id_str}
            />
          ))}
      </div>
    );
  }
}

export default TweetPane;
