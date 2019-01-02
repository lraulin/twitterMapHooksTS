import React from "react";
import Map from "./Map";
import SearchPane from "./SearchPane";
import TweetPane from "./TweetPane";
import PropTypes from "prop-types";
import { fil } from "date-fns/esm/locale";

const style = {
  // display: "block"
};

const App = ({
  tweets,
  filteredTweets,
  fetchTweets,
  setFilter,
  numTweets,
  filter,
  ...props
}) => {
  return (
    <div className="App">
      <div className="container-fluid" style={style}>
        <div className="row">
          <div className="col-sm-2">
            <SearchPane
              fetchTweets={fetchTweets}
              setFilter={setFilter}
              numTweets={numTweets}
              filter={filter}
            />
          </div>
          <div className="col-sm-7">
            <Map filteredTweets={filteredTweets} />
            );
          </div>
          <div className="col-sm-3">
            <TweetPane filteredTweets={filteredTweets} />
          </div>
        </div>
      </div>
    </div>
  );
};

App.propTypes = {
  fetchTweets: PropTypes.func,
  tweets: PropTypes.object, // Map
  filteredTweets: PropTypes.array,
  setFilter: PropTypes.func
};

export default App;
