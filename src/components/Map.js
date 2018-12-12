/* eslint-disable no-unused-expressions */
import React, { Component } from "react";
import GoogleMapReact from "google-map-react";
import secrets from "../secrets";
import Marker from "./Marker";

import markerIcon from "../images/noun_Map Marker_16968.svg";

class Map extends Component {
  static defaultProps = {
    center: {
      lat: 39.0997,
      lng: -94.5786
    },
    zoom: 4
  };

  render() {
    const markers = () => {
      if (this.props.tweets) {
        const tweets = Object.values(this.props.tweets);
        try {
          return tweets.map(tweet => {
            if (tweet.coordinates) {
              return (
                <Marker
                  key={"tweetId_" + tweet.id_str}
                  text="TWEET"
                  lat={tweet.coordinates.Latitude}
                  lng={tweet.coordinates.Longitude}
                  icon={{ url: markerIcon }}
                />
              );
            } else {
              console.log("no coordinates");
              return null;
            }
          });
        } catch (e) {
          console.log(e);
        }
      }
    };

    return (
      <div>
        <div style={{ height: "100vh", width: "100%" }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: secrets.googleMapsApiKey }}
            defaultCenter={this.props.center}
            defaultZoom={this.props.zoom}
          >
            {markers()}
          </GoogleMapReact>
        </div>
      </div>
    );
  }
}

export default Map;
