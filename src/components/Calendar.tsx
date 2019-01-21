import React from "react";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import PropTypes from "prop-types";

type Props = {
  startDate: Date;
  endDate: Date;
  handleChangeDate: ([startDate, endDate]: [Date | null, Date | null]) => void;
};

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
