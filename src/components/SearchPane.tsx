import * as React from "react";
import incidentTypes from "../utilities/incidents";
import Calendar from "./Calendar";
import Checkbox from "./Checkbox";

type Props = {
  filter: FilterOptions;
  setFilter: React.Dispatch<React.SetStateAction<FilterOptions>>;
  toggleCheckBox: (name?: string) => void;
};

const SearchPane = ({ filter, setFilter, toggleCheckBox }: Props) => {
  const [mounted, setMounted] = React.useState(false);

  const handleChangeDate = ([startDate, endDate]: [
    Date | null,
    Date | null
  ]) => {
    setFilter({ startDate, endDate, ...filter });
  };

  return (
    <div style={{ textAlign: "left" }}>
      <strong>Incident Type</strong>
      <br />
      {incidentTypes.map(item => (
        <React.Fragment key={item.id}>
          <label>
            <Checkbox
              name={item.id}
              checked={filter.incidentTypes[item.id]}
              toggleCheckBox={toggleCheckBox}
            />
            {item.displayName}
          </label>
          <br />
        </React.Fragment>
      ))}
      <strong>Filter by Date</strong>
      <Calendar
        handleChangeDate={handleChangeDate}
        startDate={filter.startDate}
        endDate={filter.endDate}
      />
      <br />
      <label htmlFor="text">
        <strong>Filter by Keywords</strong>
      </label>
      <input
        type="search"
        name="text"
        value={filter.text}
        onChange={e => setFilter({ text: e.target.value, ...filter })}
      />
    </div>
  );
};

export default SearchPane;
