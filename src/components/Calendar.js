import React from "react";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";

const Calendar = ({ handleChangeDate, startDate, endDate, ...props }) => (
  <>
    <DateRangePicker
      onChange={date => handleChangeDate(date)}
      value={[startDate, endDate]}
    />
  </>
);

export default Calendar;
