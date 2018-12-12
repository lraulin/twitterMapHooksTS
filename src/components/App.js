import React from "react";
import Map from "./Map";
import SearchPane from "./SearchPane";
import TweetPane from "./TweetPane";
import PropTypes from "prop-types";

const style = {
  // display: "block"
};

const App = ({ tweets, fetchTweets, ...props }) => {
  return (
    <div className="App">
      <div className="container-fluid" style={style}>
        <div className="row">
          <div className="col-sm-2">
            <SearchPane fetchTweets={fetchTweets} />
          </div>
          <div className="col-sm-7">
            <Map tweets={tweets} />
          </div>
          <div className="col-sm-3">
            <TweetPane tweets={tweets} />
          </div>
        </div>
      </div>
    </div>
  );
};

App.propTypes = {
  fetchTweets: PropTypes.func,
  tweets: PropTypes.object // Map
};

export default App;
