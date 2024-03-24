import React from "react";

import { useGetDailyDataQuery, useGetReservoirsQuery } from "./api/apiSlice";
import { FormControl, Input, InputLabel } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { LineChart } from "@mui/x-charts/LineChart";
import { Select, MenuItem } from "@mui/material";

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

  console.log("ReservoirsView dataCleaned: ", dataCleaned);

  const columns = [
    { field: "id", headerName: "ID", width: 150 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "capacity", headerName: "Capacity", width: 200 },
    { field: "num_states", headerName: "Number of States", width: 200 },
  ];

  return <DataGrid rows={dataCleaned} columns={columns} />;
};

export const ReservoirStateUIView = () => {
  const [startDate, setStartDate] = React.useState("2012-01-01");
  const [endDate, setEndDate] = React.useState("2013-03-31");
  const { data, isLoading } = useGetReservoirsQuery();
  const [reservoir_uuids, setReservoirUuids] = React.useState([]);

  if (isLoading || data == undefined) {
    return <div>Loading...</div>;
  }

  /* Console log the data */
  console.log("ReservoirsView data for select: ", data);

  const handleReservoirUuidsChange = (event) => {
    console.log("Event target: ", event.target);
    const selectedUuids = event.target.value;
    setReservoirUuids(selectedUuids);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const inputs = {
    is_first_of_month: false,
    reservoir_uuids: reservoir_uuids.map((row) => row.uuid),
    start_date: startDate,
    end_date: endDate,
  };

  return (
    <div>
      <FormControl>
        <InputLabel htmlFor="reservoir-uuids">Reservoir UUIDs</InputLabel>
        <Select
          id="reservoir-uuids"
          multiple
          value={reservoir_uuids}
          onChange={handleReservoirUuidsChange}
          input={<Input />}
          renderValue={(selected) => selected.map((s) => s.name).join(", ")}
        >
          {data.map((row) => (
            <MenuItem key={row.uuid} value={row}>
              {row.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
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
      {/* <ReservoirsView /> */}
      <ReservoirStateView {...inputs} />
    </div>
  );
};

export const ReservoirStateView = (inputs) => {
  const { data, isLoading: isLoadingState } = useGetDailyDataQuery(inputs);

  if (isLoadingState || data == undefined) {
    return <div>Loading...</div>;
  }
  console.log("Rain data: ", data);

  const { dataCleaned, columns } = getTableData(data);
  const { series, xvalues } = getChartData(dataCleaned);

  console.log("ReservoirStateView dataCleaned: ", dataCleaned);
  console.log("ReservoirStateView series: ", series);

  const yAxis = [
    {
      id: "fill",
      scaleType: "linear",
      label: "Percentage",
      valueFormatter: (value) => value.toString(),
    },
    {
      id: "rain",
      scaleType: "linear",
      label: "Rainfall",
      valueFormatter: (value) => value.toString(),
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
