import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  useGetReservoirsJsonQuery,
  useGetReservoirsQuery,
  useGetRegionsJsonQuery,
} from "./api/apiSlice";
import Grid from "@mui/material/Unstable_Grid2";
import { timeOptionDefault, datesDefault } from "../helpers/defaults";
import { TimeSeriesChartWithControlsView } from "./reservoir/TimeSeriesChartView";

export const OverviewView = () => {
  const timeOption = timeOptionDefault;

  return (
    <Grid container spacing={2}>
      <TimeSeriesChartWithControlsView
        title="Total of Andalucia"
        groupVar="one"
      />
    </Grid>
  );
};
