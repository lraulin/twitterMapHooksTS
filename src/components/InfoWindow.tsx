import React from "react";
import Tweet from "react-tweet";
import { className } from "postcss-selector-parser";
import { Status } from "../types/twitter-d";

type Props = {
  tweet: Status;
};

const InfoWindow = ({ tweet, ...props }: Props) => {
  return (
    <Tweet
      className={className}
      data={tweet}
      linkProps={{ target: "_blank", rel: "noreferrer" }}
      key={tweet.id_str}
    />
  );
};

export default InfoWindow;
