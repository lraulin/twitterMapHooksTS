import React, { Component } from "react";
import blue_marker from "../images/blue_marker.png";
import red_marker from "../images/red_marker.png";
import CheckboxContainer from "./CheckboxContainer";

const containerStyle = {
  textAlign: "left"
};

const checkBoxes = [
  {
    name: "fatalCrash",
    key: "fatalCrash",
    label: "fatalCrash"
  }
];

class SearchPane extends Component {
  state = {
    allSelected: true,
    selectedTypes: {
      fatalCrash: true,
      pedestrianCrash: true,
      cyclistCrash: true,
      truckCrash: true,
      busCrash: true,
      transitCrash: true,
      transSuicide: true,
      pipeline: true,
      hazmat: true,
      rail: true,
      road: true,
      unsafe: true,
      drone: true
    }
  };

  toggleAll() {
    const trueOrFalse = this.state.allSelected ? false : true;
    const selectedTypes = this.state.selectedTypes;
    for (let type in selectedTypes) {
      selectedTypes[type] = trueOrFalse;
    }
    this.setState({ selectedTypes });
    this.setState({ allSelected: trueOrFalse });
  }

  componentDidMount() {}

  render() {
    return (
      <div id="search-pane-container" style={containerStyle}>
        <div className="form-group" id="categories">
          <label className="section-title">Data Source</label>
          <br />
          <label className="data-type">
            <input type="checkbox" checked id="twitterCkBx" /> Twitter
            <img className="icon-img" src={blue_marker} alt="Blue marker" />
          </label>
          <br />
          <label className="data-type">
            <input type="checkbox" checked id="crisisCkBx" /> Crisis Management
            Center
            <img className="icon-img" src={red_marker} alt="Red marker" />
          </label>
          <label className="section-title">Incident Type</label>
          <br />
          {/* INCIDENT SELECTION */}
          <CheckboxContainer />
          <div className="form-group">
            <label>Start Date</label>
            <br />
            <div className="input-group date" data-provide="datepicker">
              <input type="text" className="form-control" id="startDate" />
              <div className="input-group-addon">
                <span className="glyphicon glyphicon-th" />
              </div>
            </div>
            <label>End Date</label>
            <div className="input-group date" data-provide="datepicker">
              <input type="text" className="form-control" id="endDate" />
              <div className="input-group-addon">
                <span className="glyphicon glyphicon-th" />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              id="date-button"
            >
              Filter by Date
            </button>
          </div>
          <div className="form-group">
            <input
              type="text"
              id="search-text"
              className="input-group form-control"
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              id="search-button"
            >
              Search
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              id="reset-button"
            >
              Reset Map
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default SearchPane;
