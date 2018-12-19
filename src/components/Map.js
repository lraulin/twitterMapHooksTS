import React, { Component } from "react";
import secrets from "../secrets";
import MarkerClusterer from "@google/markerclusterer";

class Map extends Component {
  constructor(props) {
    super(props);
    this.onScriptLoad = this.onScriptLoad.bind(this);
  }

  onScriptLoad() {
    const map = new window.google.maps.Map(
      document.getElementById(this.props.id),
      this.props.options
    );
    this.props.onMapLoad(map);

    // Create an array of alphabetical characters used to label the markers.
    var labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const locations = this.props.filteredTweets.length
      ? this.props.filteredTweets.map(tweet => ({
          lat: tweet.coordinates.Latitude,
          lng: tweet.coordinates.Longitude
        }))
      : [];

    // Add some markers to the map.
    var markers = locations.map(function(location, i) {
      return new window.google.maps.Marker({
        position: location,
        label: labels[i % labels.length]
      });
    });

    // Add a marker clusterer to manage the markers.
    var markerCluster = new MarkerClusterer(map, markers, {
      imagePath:
        "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"
    });
  }

  renderMap() {
    if (!window.google) {
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.src = `https://maps.google.com/maps/api/js?key=${
        secrets.googleMapsApiKey
      }`;
      var x = document.getElementsByTagName("script")[0];
      x.parentNode.insertBefore(s, x);
      // Below is important.
      //We cannot access google.maps until it's finished loading
      s.addEventListener("load", e => {
        this.onScriptLoad();
      });
    } else {
      this.onScriptLoad();
    }
  }

  componentDidUpdate(prevProps) {
    console.log("Map did update");
    console.log(this.props.filteredTweets);
    if (this.props.filteredTweets !== prevProps.filteredTweets) {
      this.renderMap();
    }
  }

  componentDidMount() {
    console.log("Map mounted");
    this.renderMap();
  }

  render() {
    return (
      <div style={{ height: "100vh", width: "100%" }} id={this.props.id} />
    );
  }
}

export default Map;
