import React from "react";
import Tweet from "react-tweet";
import { className } from "postcss-selector-parser";
import PropTypes from "prop-types";

const InfoWindow = ({ tweet, ...props }) => {
  return (
    <Tweet
      className={className}
      data={tweet}
      linkProps={{ target: "_blank", rel: "noreferrer" }}
      key={tweet.id_str}
    />
  );
};

InfoWindow.propTypes = {
  tweet: PropTypes.object
};

export default InfoWindow;
