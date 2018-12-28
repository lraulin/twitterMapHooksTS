import firebase from "firebase";
import secrets from "./secrets";

const config = {
  apiKey: secrets.firebase.apiKey,
  authDomain: "incident-report-map.firebaseapp.com",
  databaseURL: "https://incident-report-map.firebaseio.com",
  projectId: "incident-report-map",
  storageBucket: "",
  messagingSenderId: secrets.firebase.messagingSenderId
};

firebase.initializeApp(config);

export default firebase;
