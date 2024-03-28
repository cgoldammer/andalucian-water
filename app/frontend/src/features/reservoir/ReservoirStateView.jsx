import React from "react";

import { useGetDailyDataQuery, useGetReservoirsQuery } from "../api/apiSlice";
import { FormControl, Input, InputLabel } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { LineChart } from "@mui/x-charts/LineChart";
import { ScatterChart } from "@mui/x-charts/ScatterChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { Select, MenuItem } from "@mui/material";
import { getChartData, getTableData } from "../../helpers/data";

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
