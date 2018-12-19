/* eslint-disable no-unused-expressions */
import React, { Component } from "react";
import GoogleMapReact from "google-map-react";
import secrets from "../secrets";
import Marker from "./Marker";
import supercluster from "points-cluster";
import ClusterMarker from "./Markers/ClusterMarker";

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
    console.log("Map Render");
    console.log(this.props.filteredTweets);
    const markersData = () => {
      // return [{id: 02, lat: 202, lng: 35}, ...]
      return this.props.filteredTweets.map(tweet => ({
        id: tweet.id_str,
        lat: tweet.coordinates.Latitude,
        lng: tweet.coordinates.Longitude
      }));
    };
    const getClusters = () => {
      const clusters = supercluster(markersData, {
        minZoom: 0,
        maxZoom: 16,
        radius: 60
      });

      return clusters(this.defaultProps);
    };
    // const markers = () => {
    //   if (this.props.filteredTweets.length) {
    //     try {
    //       return this.props.filteredTweets.map(tweet => {
    //         if (tweet.coordinates) {
    //           return (
    //             <Marker
    //               key={"tweetId_" + tweet.id_str}
    //               text="TWEET"
    //               lat={tweet.coordinates.Latitude}
    //               lng={tweet.coordinates.Longitude}
    //               icon={{ url: markerIcon }}
    //             />
    //           );
    //         } else {
    //           console.log("no coordinates");
    //           return null;
    //         }
    //       });
    //     } catch (e) {
    //       console.log(e);
    //     }
    //   }
    // };

    return (
      <div>
        <div style={{ height: "100vh", width: "100%" }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: secrets.googleMapsApiKey }}
            defaultCenter={this.props.center}
            defaultZoom={this.props.zoom}
          >
            {/* {markers()} */}
            {this.state.clusters.map(item => {
              if (item.numPoints === 1) {
                return (
                  <Marker
                    key={item.id}
                    lat={item.points[0].lat}
                    lng={item.points[0].lng}
                  />
                );
              }

              return (
                <ClusterMarker
                  key={item.id}
                  lat={item.lat}
                  lng={item.lng}
                  points={item.points}
                />
              );
            })}
          </GoogleMapReact>
        </div>
      </div>
    );
  }
}

export default Map;
