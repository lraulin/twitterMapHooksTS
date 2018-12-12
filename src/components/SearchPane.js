import React from "react";
import Checkbox from "./Checkbox";
import camelCase from "../utilities/camelCase";
import incidentTypes from "../utilities/incidents";
import Calendar from "./Calendar";

const containerStyle = {
  textAlign: "left"
  // height: "100%"
};

const createCheckBox = label => ({
  name: camelCase(label),
  key: camelCase(label),
  label
});

class SearchPane extends React.Component {
  state = {
    allSelected: false,
    checkedItems: new Map(),
    startDate: null,
    endDate: null,
    searchText: ""
  };

  handleCheckboxChange = this.handleCheckboxChange.bind(this);
  toggleAll = this.toggleAll.bind(this);
  searchClick = this.searchClick.bind(this);
  handleChangeDate = this.handleChangeDate.bind(this);

  toggleAll(e) {
    // Toggle "All" checkbox
    const onOrOff = !this.state.allSelected;
    this.setState({ allSelected: onOrOff });

    // Toggle all the other checkboxes
    const checkedItems = this.state.checkedItems;
    Array.from(checkedItems.keys()).forEach(key =>
      checkedItems.set(key, onOrOff)
    );
    this.setState(checkedItems);
  }

  searchClick() {
    // Get selected incident types as array of strings
    const selectedTypes = [
      ...new Map(
        [...this.state.checkedItems].filter(([key, value]) => value === true)
      ).keys()
    ];
    // search for tweets with Twitter API
    this.props.fetchTweets(selectedTypes);
  }

  handleCheckboxChange(e) {
    // Toggle the value for the checkbox
    const item = e.target.name;
    const isChecked = e.target.checked;
    this.setState(prevState => ({
      checkedItems: prevState.checkedItems.set(item, isChecked)
    }));

    // Uncheck "All"
    if (this.state.allSelected) {
      this.setState({ allSelected: false });
    }
  }

  handleChangeDate([startDate, endDate]) {
    this.setState({
      startDate,
      endDate
    });
  }

  componentDidUpdate() {
    // Make "All" checked if user checked all manually
    const selectionValues = [...this.state.checkedItems.values()];
    if (!this.state.allSelected && selectionValues.every(x => x === true)) {
      this.setState({ allSelected: true });
    }
  }

  componentDidMount() {
    // initialize the list of selections
    const checkedItems = new Map();
    incidentTypes.forEach(type => checkedItems.set(type.id, false));
    this.setState({ checkedItems });
  }

  render() {
    return (
      <div style={containerStyle}>
        <label key="toggleAll">
          <Checkbox
            name="toggleAll"
            checked={this.state.allSelected}
            onChange={this.toggleAll}
          />
          All
        </label>
        <br />
        {incidentTypes.map(item => (
          <>
            <label key={"label_" + item.id}>
              <Checkbox
                name={item.id}
                key={"checkbox_" + item.id}
                checked={this.state.checkedItems.get(item.id)}
                onChange={this.handleCheckboxChange}
              />
              {item.displayName}
            </label>
            <br key={"br_" + item.id} />
          </>
        ))}
        <Calendar
          handleChangeDate={this.handleChangeDate}
          startDate={this.state.startDate}
          endDate={this.state.endDate}
        />
        <br />
        <label htmlFor="text">Filter by Keywords</label>
        <input
          type="text"
          name="text"
          value={this.state.searchText}
          onChange={e => this.setState({ searchText: e.target.value })}
        />
        <br />
        <button className="btn btn-primary" onClick={this.searchClick}>
          Search
        </button>
      </div>
    );
  }
}

export default SearchPane;
