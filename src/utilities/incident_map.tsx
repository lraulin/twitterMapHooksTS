/// <reference types="@types/googlemaps" />
/// <reference types="@types/markerclustererplus" />
import secrets from "../secrets";
import MarkerClusterer from "@google/markerclustererplus";
import { createElement } from "react";
import { render } from "react-dom";
import InfoWindow from "../components/InfoWindow";
import { MapOptions, IncidentMap } from "./types";

interface Window {
  google: any;
}

declare var window: Window;

const createIncidentMap = (): IncidentMap => {
  let map:
    | google.maps.Map
    | google.maps.StreetViewPanorama
    | undefined = undefined;
  let markers: google.maps.Marker[] | null = null;
  let markerCluster: MarkerClusterer | null = null;
  let lastInfoWindow: google.maps.InfoWindow | null = null;
  const options: MapOptions = {
    center: {
      lat: 39.8283,
      lng: -98.5795
    },
    zoom: 4
  };

  return {
    tweets: {},
    onScriptLoad() {
      const div = document.getElementById("myMap");
      map = new window.google.maps.Map(div, options);
      console.log("Map ready");
    },
    initMap() {
      if (!window["google"]) {
        const s = document.createElement("script");
        s.type = "text/javascript";
        s.src = `https://maps.google.com/maps/api/js?key=${
          secrets.googleMapsApiKey
        }`;
        const scripts = document.getElementsByTagName("script");
        const x: HTMLScriptElement = scripts[scripts.length - 1];
        // There is definitely a parentnode, but TS requires us to check
        if (x.parentNode) {
          x.parentNode.appendChild(s);
          //We cannot access google.maps until it's finished loading
          console.log("script added. listening for load");
          s.addEventListener("load", e => {
            this.onScriptLoad();
          });
        }
      } else {
        this.onScriptLoad();
      }
    },
    updateMarkers(tweets) {
      if (window["google"]) {
        // remove previous markers, if any
        if (markers && markerCluster) {
          markerCluster.clearMarkers();
        }

        // Add some markers to the map.
        // Ternary operator produces empty list if length is 0, otherwise array of
        // markers.
        const isMarker = (
          m: google.maps.Marker | undefined
        ): m is google.maps.Marker => !!m;
        markers = tweets
          ? tweets
              .map((tweet: Status) => {
                if (tweet.coordinates) {
                  const marker: google.maps.Marker = new window.google.maps.Marker(
                    {
                      position: {
                        lat: tweet.coordinates.Latitude,
                        lng: tweet.coordinates.Longitude
                      }
                    }
                  );
                  const infoWindow: google.maps.InfoWindow = new window.google.maps.InfoWindow(
                    {
                      content: `<div id="infoWindow${tweet.id_str}" />`
                    }
                  );
                  infoWindow.addListener("domready", (e: Event) =>
                    render(
                      createElement(InfoWindow, { tweet: tweet }, null),
                      document.getElementById(`infoWindow${tweet.id_str}`)
                    )
                  );
                  marker.addListener("click", () => {
                    if (lastInfoWindow) lastInfoWindow.close();
                    infoWindow.open(map, marker);
                    lastInfoWindow = infoWindow;
                  });
                  return marker;
                }
              })
              .filter(isMarker)
          : [];

        // Add a marker clusterer to manage the markers, if it doesn't exist.
        if (!markerCluster) {
          markerCluster = new MarkerClusterer(map, markers, {
            imagePath:
              "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"
          });
        }
        // If there wasn't a markerCluster, there is now, but we still need
        // to check because of typescript
        if (markerCluster && markers) markerCluster.addMarkers(markers);
      } else {
        setTimeout(() => this.updateMarkers(tweets), 500);
      }
    }
  };
};

export default createIncidentMap;
