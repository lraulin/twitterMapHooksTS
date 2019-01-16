import React, { useState, useEffect, useRef } from "react";
import "../styles/App.css";
import secrets from "../secrets";
import _ from "lodash";
import firebase from "../firebase";
import createIncidentMap from "../utilities/incident_map";
import SearchPane from "./SearchPane";
import TweetPane from "./TweetPane";
import { TweetHashMap } from "../utilities/types";
import { Status as Tweet, User } from "../types/twitter-d";

const isEmpty = (x: Object) => {
  if (!x) {
    return true;
  } else if (Array.isArray(x) && x.length === 0) {
    return true;
  } else if (Object.keys(x).length === 0) {
    return true;
  } else {
    return false;
  }
};

interface IncidentTypeChecked {
  [key: string]: boolean;
}

interface FilterOptions {
  text: string;
  startDate: Date | null;
  endDate: Date | null;
  incidentTypes: IncidentTypeChecked;
}

function AppContainer() {
  const mapRef = useRef(createIncidentMap());
  const JSON_SERVER_URL = "http://localhost:3001/posts";
  const [mounted, setMounted] = useState(false);
  const [filteredTweets, setFilteredTweets] = useState(null);
  const [filter, setFilter] = useState({
    text: "",
    startDate: null,
    endDate: null,
    incidentTypes: {
      fatalCrash: true,
      pedestrianCrash: true,
      cyclistCrash: true,
      truckCrash: true,
      busCrash: true,
      transitCrash: true,
      transSuicide: true,
      pipeline: true,
      hazmat: true,
      rail: true,
      road: true,
      unsafe: true,
      drone: true
    } as IncidentTypeChecked
  } as FilterOptions);

  const saveLocal = (tweets: TweetHashMap) => {
    localStorage.setItem("tweets", JSON.stringify(tweets));
  };

  const getLocal = () => {
    return JSON.parse(localStorage.getItem("tweets") || "");
  };

  const changeFilterText = (text = "") => {
    console.log(text);
    filter.text = text;
    setFilter(filter);
  };

  const toggleCheckBox = (name = "") => {
    filter.incidentTypes[name] = !filter.incidentTypes[name];
    setFilter(filter);
    applyFilter(filter, getLocal());
  };

  const applyFilter = (opts: FilterOptions, allTweets: Tweet[] = []) => {
    console.log(`Tweets: ${allTweets}`);
    if (!allTweets) return;
    console.log("applying filter...");
    const { startDate, endDate, incidentTypes, text } = opts;
    const selectedTypes = Object.keys(incidentTypes).filter(
      key => incidentTypes[key]
    );
    let tweetList = allTweets;

    // Filters
    const notRetweet = (t: Tweet) => !("retweeted_status" in t);
    const inDateRange = (t: Tweet) => {
      if (startDate && endDate) {
        new Date(t.created_at) >= startDate &&
          new Date(t.created_at) <= endDate;
      } else {
        true;
      }
    };
    const matchesText = (tweet: Tweet) =>
      text.split(" ").some(word => tweet.text.includes(word));
    const hasTypes = (t: Tweet) => {
      if (typeof t.incidentType === "string") {
        return selectedTypes.includes(t.incidentType);
      } else if (Array.isArray(t.incidentType)) {
        // Tweet has an array of incident types; at least one must be selected
        return t.incidentType.some(type => selectedTypes.includes(type));
      }
    };

    // Apply filters if applicable.
    tweetList = tweetList.filter(notRetweet);
    tweetList =
      startDate && endDate ? tweetList.filter(inDateRange) : tweetList;
    tweetList = text ? tweetList.filter(matchesText) : tweetList;
    tweetList = incidentTypes ? tweetList.filter(hasTypes) : tweetList;

    mapRef.current.updateMarkers(tweetList);
  };

  const firebaseInit = async () => {
    await firebase.auth().signOut();
    firebase
      .auth()
      .signInWithEmailAndPassword(
        secrets.firebase.user,
        secrets.firebase.password
      )
      .then(res => {
        console.log("Firebase initialized!");
        firebaseFetch();
      })
      .catch(error => {
        if (error.code === "auth/user-not-found") {
          console.log("Error logging in.");
        }
      });
  };

  const firebaseFetch = () => {
    const ref = firebase.database().ref("tweets");
    // fetch data once if local cache is empty,
    // because the on value listener doesn't always fire immediately when
    // page is reloaded
    if (!getLocal()) {
      console.log("firebaseFetch: Fetching from Firebase...");
      ref
        .once("value")
        .then(snapshot => {
          const fetchedTweets = snapshot.val();
          if (fetchedTweets) {
            saveLocal(fetchedTweets);
            applyFilter(filter, fetchedTweets);
          } else {
            console.log("firebaseFetch: Something went wrong...no tweets...");
          }
        })
        .catch(e => console.log(e));
    } else {
      console.log("firebaseFetch: Tweets already fetched.");
    }
    // make sure we're not creating duplicate listeners
    ref.off();
    // create listener to update state whenever database changes
    ref.on("value", snapshot => {
      const fetchedTweets = snapshot ? snapshot.val() : null;
      if (fetchedTweets) {
        console.log("Retrieved tweets from Firebase!");
        saveLocal(fetchedTweets);
        applyFilter(filter, fetchedTweets);
      }
    });
  };

  const reset = () => {
    const incidentTypes = filter.incidentTypes;
    Object.keys(incidentTypes).forEach(key => (incidentTypes[key] = false));
    const resetFilter: FilterOptions = {
      startDate: null,
      endDate: null,
      incidentTypes,
      text: ""
    };
    setFilter(resetFilter);
    applyFilter(resetFilter);
  };

  const retry = () => {
    // If we don't have Tweets, retry every 2 seconds until we do.
    if (!getLocal()) {
      firebaseInit();
      setTimeout(() => retry(), 2000);
    }
  };

  const initMap = async () => {
    mapRef.current.initMap();

    const tweets = getLocal();
    if (tweets) {
      applyFilter(filter, tweets);
    }
    firebaseInit();
  };

  // ComponentDidMount
  useEffect(() => {
    if (!mounted) {
      initMap();
    }
    setMounted(true);
  }, []);

  return (
    <div className="App">
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-2" style={{ height: "100vh" }}>
            <a
              style={{ width: "100%" }}
              className="btn btn-dark"
              data-toggle="collapse"
              href="#collapseExample"
              role="button"
              aria-expanded="true"
              aria-controls="collapseExample"
            >
              Filter Settings
            </a>
            <div className="collapse show" id="collapseExample">
              <div className="card card-body" style={{ height: "100%" }}>
                <SearchPane
                  setFilter={setFilter}
                  filter={filter}
                  toggleCheckBox={toggleCheckBox}
                  changeFilterText={changeFilterText}
                />
              </div>
            </div>
          </div>
          <div className="col-sm-7" style={{ height: "100vh" }}>
            {/* <Map /> */}
            <div style={{ height: "100vh", width: "100%" }} id="myMap" />;
          </div>
        </div>
        <div className="col-sm-3 d-none d-lg-block" style={{ height: "100vh" }}>
          <TweetPane filteredTweets={filteredTweets} />
        </div>
      </div>
    </div>
  );
}

export default AppContainer;
