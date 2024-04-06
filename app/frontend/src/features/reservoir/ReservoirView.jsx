import React from "react";
import { timeOptionDefault, datesDefault } from "../../helpers/defaults";
import Grid from "@mui/material/Unstable_Grid2";
import { TimeOptions } from "../../helpers/helpers";
import Typography from "@mui/material/Typography";
import { useGetDailyDataQuery } from "../api/apiSlice";
import { getChartData, getTableData } from "../../helpers/data";
import { axisClasses } from "@mui/x-charts/ChartsAxis";
import { texts } from "../../texts";
import PropTypes from "prop-types";
import { LineChart } from "@mui/x-charts";
import { FormControl, Input, InputLabel } from "@mui/material";
import { Select, MenuItem } from "@mui/material";

export const getYAxisWater = (timeOption) => {
  const data = timeOptionData[timeOption];
  return {
    id: data.id,
    scaleType: "linear",
    label: data.label,
    valueFormatter: (value) => `${(value * 100).toFixed(0)}%`,
  };
};

export const timeOptionData = {
  [TimeOptions.DAY]: {
    id: "rain",
    label: "Rainfall",
  },
  [TimeOptions.YEAR]: {
    id: "rain",
    label: "Rainfall Cumulative (% of historical)",
  },
};

export const CreateGraph = (inputs) => {
  const { timeOption } = inputs;
  const isFirstOfYear = timeOption == TimeOptions.YEAR;

  const { data, isLoading, error } = useGetDailyDataQuery({
    isFirstOfYear,
    ...inputs,
  });

  const yAxisFill = {
    id: "fill",
    scaleType: "linear",
    label: "Fill Rate (%)",
    valueFormatter: (value) => `${(value * 100).toFixed(0)}%`,
  };

  const yAxis = [yAxisFill, getYAxisWater(timeOption)];

  if (error) {
    return <div>Error {JSON.stringify(error)}</div>;
  }

  if (isLoading || data == undefined) {
    return <div>Loading...</div>;
  }

  if (data.length == 0) {
    return <div>No data found</div>;
  }

  if (timeOption == TimeOptions.YEAR && data.length > 20) {
    return <div>Too many data points for yearly view</div>;
  }

  const { dataCleaned } = getTableData(data, timeOption);
  const { series, xvalues } = getChartData(dataCleaned, timeOption);

  const reservoirName = dataCleaned[0].reservoirName;

  const xAxis = [
    {
      id: "years",
      data: xvalues,
      scaleType: "band",
      valueFormatter: (value) => value.toString(),
    },
  ];

  return (
    <Grid container justifyContent="center" alignItems="center" xs={12}>
      <Grid display="flex" justifyContent="center" alignItems="center" xs={12}>
        <Typography variant="h4">Yearly view for: {reservoirName}</Typography>
      </Grid>
      <Grid display="flex" justifyContent="center" alignItems="center" xs={12}>
        <LineChart
          xAxis={xAxis}
          yAxis={yAxis}
          series={series}
          leftAxis="fill"
          rightAxis="rain"
          width={600}
          height={400}
          sx={{
            [`.${axisClasses.left} .${axisClasses.label}`]: {
              transform: "translate(-25px, 0)",
            },
            [`.${axisClasses.right} .${axisClasses.label}`]: {
              transform: "translate(30px, 0)",
            },
          }}
        />
      </Grid>
    </Grid>
  );
};

export const ReservoirView = (props) => {
  const { reservoirUuid, showDateControls } = props;
  const [timeOption, setTimeOption] = React.useState(timeOptionDefault);
  const [startDate, setStartDate] = React.useState(
    datesDefault[timeOption].start
  );
  const [endDate, setEndDate] = React.useState(datesDefault[timeOption].end);

  const handleTimeOptionChange = (event) => {
    const timeOption = event.target.value;

    setStartDate(datesDefault[timeOption].start);
    setEndDate(datesDefault[timeOption].end);
    setTimeOption(timeOption);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const inputs = {
    reservoirUuids: [reservoirUuid],
    startDate: startDate,
    endDate: endDate,
  };

  const inputsValid = inputs.reservoirUuids != undefined;
  var stateView = <div>Loading...</div>;
  if (inputsValid) {
    stateView = (
      <CreateGraph
        {...inputs}
        timeOption={timeOption}
        showDateControls={false}
      />
    );
  }

  const pickTimeOption = !showDateControls ? (
    <div />
  ) : (
    <FormControl>
      <InputLabel id="choooseTime" htmlFor="time-option">
        <span role="label">{texts.timeOption}</span>
      </InputLabel>
      <Select
        id="time-option"
        value={timeOption}
        onChange={handleTimeOptionChange}
        input={<Input />}
      >
        <MenuItem value={TimeOptions.DAY}>Day</MenuItem>
        <MenuItem value={TimeOptions.YEAR}>Year</MenuItem>
      </Select>
    </FormControl>
  );

  const dateControls =
    timeOption == TimeOptions.YEAR ? (
      <span></span>
    ) : (
      <div>
        <FormControl>
          <InputLabel htmlFor="start-date">Start Date</InputLabel>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
          />
        </FormControl>
        <FormControl>
          <InputLabel htmlFor="end-date">End Date</InputLabel>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
          />
        </FormControl>
      </div>
    );

  return (
    <Grid container justifyContent="center" alignItems="center" xs={12}>
      {pickTimeOption}
      {dateControls}
      {stateView}
    </Grid>
  );
};

ReservoirView.propTypes = {
  reservoirUuid: PropTypes.string.isRequired,
  showDateControls: PropTypes.bool.isRequired,
};
