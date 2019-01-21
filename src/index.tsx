import "bootstrap/dist/css/bootstrap.min.css";
import * as $ from "jquery";
import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./components/App";

///@ts-ignore
window.jQuery = window.$ = $;
require("bootstrap");

ReactDOM.render(<App />, document.getElementById("root"));
