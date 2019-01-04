import React from "react";
import Map from "./Map";
import SearchPane from "./SearchPane";
import TweetPane from "./TweetPane";
import PropTypes from "prop-types";
import { fil } from "date-fns/esm/locale";
import { height } from "window-size";

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
          <div className="col-sm-2" style={{ height: "100vh" }}>
            <a
              style={{ width: "100%" }}
              class="btn btn-dark"
              data-toggle="collapse"
              href="#collapseExample"
              role="button"
              aria-expanded="true"
              aria-controls="collapseExample"
            >
              Filter Settings
            </a>
            <div class="collapse show" id="collapseExample">
              <div class="card card-body" style={{ height: "100%" }}>
                <SearchPane
                  fetchTweets={fetchTweets}
                  setFilter={setFilter}
                  numTweets={numTweets}
                  filter={filter}
                />
              </div>
            </div>
          </div>
          <div className="col-sm-7" style={{ height: "100vh" }}>
            <Map filteredTweets={filteredTweets} />
          </div>
          <div
            className="col-sm-3 d-none d-lg-block"
            style={{ height: "100vh" }}
          >
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
