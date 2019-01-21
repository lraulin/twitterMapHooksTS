import React from "react";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import PropTypes from "prop-types";

interface Props {
  startDate: Date | null;
  endDate: Date | null;
  handleChangeDate: (arr: [Date | null, Date | null]) => void;
}

const Calendar = ({ handleChangeDate, startDate, endDate }: Props) => (
  <>
    <DateRangePicker
      onChange={(date: [Date, Date]) => {
        if (date) return handleChangeDate(date);
        else handleChangeDate([null, null]);
      }}
      value={[startDate, endDate]}
    />
  </>
);

Calendar.propTypes = {
  handleChangeDate: PropTypes.func.isRequired,
  startDate: PropTypes.object,
  endDate: PropTypes.object
};

export default Calendar;
