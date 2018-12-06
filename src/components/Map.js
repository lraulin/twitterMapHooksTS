/* eslint-disable no-unused-expressions */
import React, { Component } from "react";
import GoogleMapReact from "google-map-react";
import secrets from "../secrets";
import where from "node-where";

const AnyReactComponent = ({ text }) => <div>{text}</div>;

class Map extends Component {
  static defaultProps = {
    center: {
      lat: 59.95,
      lng: 30.33
    },
    zoom: 11
  };

  componentDidUpdate() {
    console.log("Map did update");
    console.log(this.props.tweets);
  }

  componentDidMount() {
    console.log(this.props.tweets);
  }

  render() {
    return (
      // Important! Always set the container height explicitly
      <div style={{ height: "100vh", width: "100%" }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: secrets.googleMapsApiKey }}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
        >
          {this.props.tweets &&
            this.props.tweets.forEach(([id, tweet]) => {
              if (tweet.coordinates)
                <AnyReactComponent
                  key={"tweet_marker_" + tweet.id_str}
                  lat={tweet.coordinates.Latitude}
                  lng={tweet.coordinates.Longitude}
                  text={tweet.user.name}
                />;
            })}
        </GoogleMapReact>
      </div>
    );
  }
}

export default Map;
