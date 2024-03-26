import React from "react";

import { useGetDailyDataQuery, useGetReservoirsQuery } from "./api/apiSlice";
import { FormControl, Input, InputLabel } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { LineChart } from "@mui/x-charts/LineChart";
import { ScatterChart } from "@mui/x-charts/ScatterChart";
import { Select, MenuItem } from "@mui/material";
import { getChartData, getTableData } from "../helpers/data";

export const ReservoirsView = () => {
  const { data, isLoading } = useGetReservoirsQuery();
  if (isLoading || data == undefined) {
    return <div>Loading...</div>;
  }

  const dataCleaned = data.map((row) => {
    return {
      id: row.uuid,
      name: row.name,
      capacity: row.capacity,
      num_states: row.num_states,
    };
  });

  const columns = [
    { field: "id", headerName: "ID", width: 150 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "capacity", headerName: "Capacity", width: 200 },
    { field: "num_states", headerName: "Number of States", width: 200 },
  ];

  return <DataGrid rows={dataCleaned} columns={columns} />;
};

const TimeOptions = {
  DAY: "day",
  YEAR: "year",
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

export const getYAxisWater = (timeOption) => {
  const data = timeOptionData[timeOption];
  return {
    id: data.id,
    scaleType: "linear",
    label: data.label,
    valueFormatter: (value) => value.toFixed(1),
  };
};

export const ScatterChart2 = () => {
  const { data: dataReservoirs, isLoading: isLoadingReservoirs } =
    useGetReservoirsQuery();
  const reservoirUuids =
    dataReservoirs === undefined ? [] : dataReservoirs.map((row) => row.uuid);
  console.log("Reservoir UUIDs: ", reservoirUuids);
  const timeOption = TimeOptions.YEAR;
  const inputs = {
    reservoirUuids: reservoirUuids,
    startDate: yearlyStartDate,
    endDate: yearlyEndDate,
    timeOption: timeOption,
    isFirstOfYear: true,
  };
  const { data, isLoading, error } = useGetDailyDataQuery(inputs);

  if (
    isLoadingReservoirs ||
    dataReservoirs == undefined ||
    isLoading ||
    data == undefined ||
    data.length == 0
  ) {
    return <div>Loading...</div>;
  }

  const { dataCleaned, columns } = getTableData(data, timeOption);

  const getSeriesData = (row) => {
    return {
      x: row.rainAmountCumulativeRelative,
      y: row.volumeDiffRelative,
      fill: row.fill,
      name: row.name,
    };
  };

  const getSeries = (data) => {
    const values = data.map(getSeriesData);
    return {
      label: data[0].reservoirName,
      data: values,
    };
  };

  // To get the series, split the data by
  // reservoirUuid and then map over the data
  // to get the x and y values
  const names = [...new Set(dataCleaned.map((row) => row.reservoirName))];
  const series = names.map((name) => {
    const data = dataCleaned.filter((row) => row.reservoirName == name);
    return getSeries(data);
  });

  console.log("Series: ", series);

  const chart = <ScatterChart series={series} width={800} height={600} />;

  return (
    <div>
      <h1>Reservoir Chart</h1>
      {chart}
      <DataGrid rows={dataCleaned} columns={columns} />
    </div>
  );
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
      {/* <LineChart
        xAxis={xAxis}
        yAxis={yAxis}
        series={series}
        leftAxis="fill"
        rightAxis="rain"
        width={800}
        height={600}
      /> */}
      <DataGrid rows={dataCleaned} columns={columns} />
    </div>
  );
};

const reservoir_default = "guadalteba";
const timeOptionDefault = TimeOptions.DAY;
const defaultStartDate = "2023-08-01";
const defaultEndDate = "2023-10-01";

const yearlyStartDate = "2000-01-01";
const yearlyEndDate = "2024-12-31";

export const ReservoirStateUIView = () => {
  const [startDate, setStartDate] = React.useState(defaultStartDate);
  const [endDate, setEndDate] = React.useState(defaultEndDate);
  const { data, isLoading } = useGetReservoirsQuery();
  const [reservoirUuid, setReservoirUuid] = React.useState("");
  const [timeOption, setTimeOption] = React.useState(timeOptionDefault);

  if (isLoading || data == undefined) {
    return <div>Loading...</div>;
  } else {
    const uuid_default = data.find((row) => row.name == reservoir_default);
    if (reservoirUuid == "" && uuid_default) {
      setReservoirUuid(uuid_default);
    }
  }

  const handleReservoirUuidChange = (event) => {
    const selectedUuid = event.target.value;
    setReservoirUuid(selectedUuid);
  };

  const handleTimeOptionChange = (event) => {
    console.log("Setting time to: ", event.target.value);
    const timeOption = event.target.value;
    if (timeOption == TimeOptions.YEAR) {
      setStartDate(yearlyStartDate);
      setEndDate(yearlyEndDate);
      setTimeOption(timeOption);
    }
    if (timeOption == TimeOptions.DAY) {
      setStartDate(defaultStartDate);
      setEndDate(defaultEndDate);
      setTimeOption(timeOption);
    }
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const inputs = {
    reservoir_uuids: reservoirUuid.uuid,
    start_date: startDate,
    end_date: endDate,
  };

  const inputsValid = inputs.reservoir_uuids != undefined;
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
      <FormControl>
        <InputLabel htmlFor="reservoir">Reservoir</InputLabel>
        <Select
          id="reservoir"
          value={reservoirUuid}
          onChange={handleReservoirUuidChange}
          input={<Input />}
        >
          {data.map((row) => (
            <MenuItem key={row.uuid} value={row}>
              {row.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {dateControls}

      {stateView}
    </div>
  );
};

export const ReservoirStateChart = (props) => {
  const { series, xvalues } = props;

  const yAxis = [
    {
      id: "fill",
      scaleType: "linear",
      label: "Percentage",
      valueFormatter: (value) => `${(value * 100).toFixed(1)}%`,
    },
    {
      id: "rain",
      scaleType: "linear",
      label: "Rainfall",
      valueFormatter: (value) => value.toFixed(1),
    },
  ];

  const xAxis = [
    {
      id: "years",
      data: xvalues,
      scaleType: "band",
      valueFormatter: (value) => value.toString(),
    },
  ];

  return (
    <LineChart
      xAxis={xAxis}
      yAxis={yAxis}
      series={series}
      leftAxis="fill"
      rightAxis="rain"
      width={800}
      height={600}
    />
  );
};

// export const ReservoirStateView = (inputs) => {
//   const {
//     data,
//     isLoading: isLoadingState,
//     error,
//   } = useGetDailyDataQuery(inputs);

//   if (error) {
//     return <div>Error {JSON.stringify(error)}</div>;
//   }

//   if (isLoadingState || data == undefined) {
//     return <div>Loading...</div>;
//   }

//   if (data.length == 0) {
//     return <div>No data found</div>;
//   }

//   const { dataCleaned, columns } = getTableData(data);
//   const { series, xvalues } = getChartData(dataCleaned);

//   return (
//     <div>
//       <ReservoirStateChart series={series} xvalues={xvalues}/>
//       <DataGrid rows={dataCleaned} columns={columns} />
//     </div>
//   );
// };
