import React, { Component } from "react";
import Tweet from "react-tweet";
import { className } from "postcss-selector-parser";
import ReactScrollbar from "react-scrollbar";
import isTweet from "../utilities/isTweet";
import _ from "lodash";
import { filter } from "rsvp";

const myScrollbar = {
  // width: 400,
  height: 850
};

const TweetPane = ({ filteredTweets, ...props }) => {
  return (
    <ReactScrollbar style={myScrollbar}>
      {!!filteredTweets.length &&
        filteredTweets.map(tweet => (
          <Tweet
            className={className}
            data={tweet}
            linkProps={{ target: "_blank", rel: "noreferrer" }}
            key={tweet.id_str}
          />
        ))}
    </ReactScrollbar>
  );
};

export default TweetPane;
