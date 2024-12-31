import React from "react";
import { timeOptionDefault, datesDefault } from "../../helpers/defaults";
import Grid from "@mui/material/Unstable_Grid2";
import { timeOptions } from "../../helpers/helpers";
import Typography from "@mui/material/Typography";
import { texts } from "../../texts";
import PropTypes from "prop-types";

import { FormControl, Input, InputLabel } from "@mui/material";
import { Select, MenuItem } from "@mui/material";
import { TimeSeriesChartWithControlsView } from "./TimeSeriesChartView";

export const ReservoirView = (props) => {
  const { reservoirUuid, showDateControls, reservoirName } = props;
  // const [timeOption, setTimeOption] = React.useState(timeOptionDefault);
  // const [startDate, setStartDate] = React.useState(
  //   datesDefault[timeOption].start
  // );
  // const [endDate, setEndDate] = React.useState(datesDefault[timeOption].end);

  // const handleTimeOptionChange = (event) => {
  //   const timeOption = event.target.value;

  //   setStartDate(datesDefault[timeOption].start);
  //   setEndDate(datesDefault[timeOption].end);
  //   setTimeOption(timeOption);
  // };

  // const handleStartDateChange = (event) => {
  //   setStartDate(event.target.value);
  // };

  // const handleEndDateChange = (event) => {
  //   setEndDate(event.target.value);
  // };

  // const inputs = {
  //   reservoirUuids: [reservoirUuid],
  //   startDate: startDate,
  //   endDate: endDate,
  // };

  // const inputsValid = inputs.reservoirUuids != undefined;
  var stateView = <div>Loading...</div>;
  stateView = (
    <TimeSeriesChartWithControlsView
      title={reservoirName}
      reservoirUuid={reservoirUuid}
    />
  );

  // const pickTimeOption = !showDateControls ? (
  //   <div />
  // ) : (
  //   <FormControl>
  //     <InputLabel id="choooseTime" htmlFor="time-option">
  //       <span role="label">{texts.timeOption}</span>
  //     </InputLabel>
  //     <Select
  //       id="time-option"
  //       value={timeOption}
  //       onChange={handleTimeOptionChange}
  //       input={<Input />}
  //     >
  //       <MenuItem value={TimeOptions.DAY}>Day</MenuItem>
  //       <MenuItem value={TimeOptions.YEAR}>Year</MenuItem>
  //     </Select>
  //   </FormControl>
  // );

  // const dateControls =
  //   timeOption == TimeOptions.YEAR ? (
  //     <span></span>
  //   ) : (
  //     <div>
  //       <FormControl>
  //         <InputLabel htmlFor="start-date">Start Date</InputLabel>
  //         <Input
  //           id="start-date"
  //           type="date"
  //           value={startDate}
  //           onChange={handleStartDateChange}
  //         />
  //       </FormControl>
  //       <FormControl>
  //         <InputLabel htmlFor="end-date">End Date</InputLabel>
  //         <Input
  //           id="end-date"
  //           type="date"
  //           value={endDate}
  //           onChange={handleEndDateChange}
  //         />
  //       </FormControl>
  //     </div>
  //   );

  return (
    <Grid container justifyContent="center" alignItems="center" xs={12}>
      {/* {pickTimeOption} */}
      {/* {dateControls} */}
      {stateView}
    </Grid>
  );
};

ReservoirView.propTypes = {
  reservoirUuid: PropTypes.string.isRequired,
  showDateControls: PropTypes.bool.isRequired,
  reservoirName: PropTypes.string.isRequired,
};
