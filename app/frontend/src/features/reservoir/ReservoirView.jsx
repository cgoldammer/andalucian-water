import React from "react";

import { timeOptionDefault, datesDefault } from "../../helpers/defaults";

import { TimeOptions } from "../../helpers/helpers";

import { useGetDailyDataQuery } from "../api/apiSlice";
import { getChartData, getTableData } from "../../helpers/data";
import { DataGrid } from "@mui/x-data-grid";

import { LineChart } from "@mui/x-charts";
import { FormControl, Input, InputLabel } from "@mui/material";
import { Select, MenuItem } from "@mui/material";

export const getYAxisWater = (timeOption) => {
  const data = timeOptionData[timeOption];
  return {
    id: data.id,
    scaleType: "linear",
    label: data.label,
    valueFormatter: (value) => value.toFixed(1),
  };
};

export const timeOptionData = {
  [TimeOptions.DAY]: {
    id: "rain",
    label: "Rainfall",
  },
  [TimeOptions.YEAR]: {
    id: "rain",
    label: "Rainfall Cumulative",
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
    label: "Percentage",
    valueFormatter: (value) => `${(value * 100).toFixed(1)}%`,
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

  const { dataCleaned, columns } = getTableData(data, timeOption);
  const { series, xvalues } = getChartData(dataCleaned, timeOption);

  const xAxis = [
    {
      id: "years",
      data: xvalues,
      scaleType: "band",
      valueFormatter: (value) => value.toString(),
    },
  ];

  return (
    <div>
      <h1>Reservoir State</h1>
      <LineChart
        xAxis={xAxis}
        yAxis={yAxis}
        series={series}
        leftAxis="fill"
        rightAxis="rain"
        width={800}
        height={600}
      />
      <DataGrid rows={dataCleaned} columns={columns} />
    </div>
  );
};

export const ReservoirView = (props) => {
  const { reservoirUuid } = props;
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
    stateView = <CreateGraph {...inputs} timeOption={timeOption} />;
  }

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
    <div>
      <div> {reservoirUuid} </div>
      <FormControl>
        <InputLabel htmlFor="time-option">Time Option</InputLabel>
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
      {dateControls}

      {stateView}
    </div>
  );
};
