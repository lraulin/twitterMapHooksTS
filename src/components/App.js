import React from "react";
import Map from "./Map";
import SearchPane from "./SearchPane";
import TweetPane from "./TweetPane";
import PropTypes from "prop-types";

const style = {
  // display: "block"
};

const App = ({
  tweets,
  filteredTweets,
  fetchTweets,
  applyFilter,
  ...props
}) => {
  return (
    <div className="App">
      <div className="container-fluid" style={style}>
        <div className="row">
          <div className="col-sm-2">
            <SearchPane fetchTweets={fetchTweets} applyFilter={applyFilter} />
          </div>
          <div className="col-sm-7">
            {/* <Map filteredTweets={filteredTweets} /> */}
            <Map
              filteredTweets={filteredTweets}
              id="myMap"
              options={{
                center: { lat: 41.0082, lng: 28.9784 },
                zoom: 8
              }}
              onMapLoad={map => {
                var marker = new window.google.maps.Marker({
                  position: { lat: 41.0082, lng: 28.9784 },
                  map: map,
                  title: "Hello Istanbul!"
                });
              }}
            />
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
  applyFilter: PropTypes.func
};

export default App;
