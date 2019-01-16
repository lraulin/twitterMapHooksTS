import { Status as Tweet } from "twitter-d";

export interface TweetHashMap {
  [key: string]: Tweet;
}

export interface MapOptions {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
}

export interface IncidentMap {
  tweets: TweetHashMap;
  onScriptLoad(): void;
  initMap(): void;
  updateMarkers(tweets: Array<Tweet>): void;
}

export interface Coordinates {
  Latitude: number;
  Longitude: number;
}
