import * as React from "react";
import { useEffect, useRef, useState } from "react";
import "../styles/App.css";
import secrets from "../secrets";
import _ from "lodash";
import firebase from "../firebase";
import createIncidentMap from "../utilities/incident_map";
import SearchPane from "./SearchPane";
import TweetPane from "./TweetPane";
import { TweetHashMap } from "../utilities/types";
import { Status as Tweet } from "../types/twitter-d";
import { IncidentTypeChecked, FilterOptions } from "../types/mytypes";
import { compose, filter, into, takeLast, uniqBy } from "ramda";

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

const AppContainer = () => {
  const mapRef = useRef(createIncidentMap());
  const JSON_SERVER_URL = "http://localhost:3001/posts";
  const [filteredTweets, setFilteredTweets] = useState<Tweet[]>([]);
  const [filterOptions, setFilterOptions] = useState({
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

  const changeFilterSettings = (settings: FilterOptions) => {
    setFilterOptions(settings);
    applyFilter(settings);
  };

  const toggleCheckBox = (name = "") => {
    filterOptions.incidentTypes[name] = !filterOptions.incidentTypes[name];
    setFilterOptions(filterOptions);
    applyFilter({ tweets: getLocal(), ...filterOptions });
  };

  const applyFilter = ({
    text = filterOptions.text,
    startDate = filterOptions.startDate,
    endDate = filterOptions.endDate,
    incidentTypes = filterOptions.incidentTypes,
    tweets = getLocal() || {}
  }) => {
    if (tweets === {} || !mapRef.current) {
      console.log("No tweets or map");
      return;
    }
    saveLocal(tweets);
    const selectedTypes = Object.keys(incidentTypes).filter(
      key => incidentTypes[key]
    );
    const tweetList = Object.values(tweets);
    console.log(`filtering ${tweetList.length} tweets`);

    // Filters
    const notRetweet = (tweet: Tweet) => !tweet.retweeted_status;
    const inDateRange = (tweet: Tweet) => {
      if (startDate && endDate) {
        return (
          new Date(tweet.created_at) >= startDate &&
          new Date(tweet.created_at) <= endDate
        );
      } else {
        return true;
      }
    };
    const matchesText = (tweet: Tweet) => {
      if (text !== "") {
        return text
          .toLowerCase()
          .split(" ")
          .some((word: string) => tweet.text.toLowerCase().includes(word));
      } else {
        return true;
      }
    };
    const hasTypes = (tweet: Tweet) => {
      if (typeof tweet.incidentType === "string") {
        return selectedTypes.includes(tweet.incidentType);
      } else if (Array.isArray(tweet.incidentType)) {
        return tweet.incidentType.some(type => selectedTypes.includes(type));
      } else {
        return false;
      }
    };

    // Apply filters if applicable.
    const tweetFilter = compose(
      filter(notRetweet),
      filter(inDateRange),
      filter(matchesText),
      filter(hasTypes)
    );

    // Dedup
    const justText = (text: string) => text.slice(0, text.indexOf(" http"));
    const dedupedTweets = uniqBy(
      (tweet: Tweet) => justText(tweet.text),
      // @ts-ignore
      into([] as Tweet[], tweetFilter, tweetList)
    );

    const top7 = takeLast(7, dedupedTweets);
    setFilteredTweets(top7 as React.SetStateAction<Tweet[]>);
    mapRef.current.updateMarkers(filteredTweets);
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
            applyFilter({ tweets: fetchedTweets, ...filterOptions });
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
        applyFilter({ tweets: fetchedTweets, ...filteredTweets });
      }
    });
  };

  const reset = () => {
    const incidentTypes = filterOptions.incidentTypes;
    Object.keys(incidentTypes).forEach(key => (incidentTypes[key] = false));
    const resetFilter: FilterOptions = {
      startDate: null,
      endDate: null,
      incidentTypes,
      text: ""
    };
    setFilterOptions(resetFilter);
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
      applyFilter({ tweets, ...filterOptions });
    }
    firebaseInit();
  };

  // ComponentDidMount
  useEffect(() => {
    initMap();
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
                  setFilter={setFilterOptions}
                  filter={filterOptions}
                  toggleCheckBox={toggleCheckBox}
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
};

export default AppContainer;
