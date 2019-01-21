import React from "react";
import Tweet from "react-tweet";
import { className } from "postcss-selector-parser";
import ReactScrollbar from "react-scrollbar";

type Props = {
  filteredTweets: Status[];
};

const TweetPane = ({ filteredTweets }: Props) => {
  return (
    <ReactScrollbar style={{ height: 850 }}>
      {filteredTweets &&
        filteredTweets
          .reverse()
          .map((tweet: Status) => (
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
