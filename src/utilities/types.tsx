export interface TweetHashMap {
  [key: string]: Status;
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
  updateMarkers(tweets: Array<Status>): void;
}
