/* eslint-disable no-unused-expressions */
import React, { Component } from "react";
import GoogleMapReact from "google-map-react";
import secrets from "../secrets";
import _ from "lodash";

const markerIcon = require("../images/map_marker_blue.svg");
const markerStyle = {
  backgroundImage: { markerIcon }
};

const Marker = ({ text, ...props }) => (
  <div className="marker" style={markerStyle} />
);

class Map extends Component {
  static defaultProps = {
    center: {
      lat: 0,
      lng: 0
    },
    zoom: 1
  };

  render() {
    console.log("rendering map");
    const markers = () => {
      console.log("generating markers");
      if (this.props.tweets) {
        try {
          return this.props.tweets.map(tweet => {
            if (tweet.coordinates) {
              console.log(
                `${tweet.coordinates.Latitude}, ${tweet.coordinates.Longitude}`
              );
              return (
                <Marker
                  text="TWEET"
                  lat={tweet.coordinates.Latitude}
                  lng={tweet.coordinates.Longitude}
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
    const markers2 = () => {
      console.log("generating markers");
      if (this.props.tweets) {
        try {
          this.props.tweets.map(tweet => {
            if (tweet.coordinates) {
              console.log(
                `${tweet.coordinates.Latitude}, ${tweet.coordinates.Longitude}`
              );
              return <h1>I CAN SEE IT</h1>;
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
        {markers2()}
        <div style={{ height: "100vh", width: "100%" }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: secrets.googleMapsApiKey }}
            defaultCenter={this.props.center}
            defaultZoom={this.props.zoom}
          >
            <Marker text="HEY!" lat="0" lng="0" />
            {markers()}
          </GoogleMapReact>
        </div>
      </div>
    );
  }
}

export default Map;
