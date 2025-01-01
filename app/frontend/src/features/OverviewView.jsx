import React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { TimeSeriesChartWithControlsView } from "./reservoir/TimeSeriesChartView";
import { texts } from "../texts";

export const OverviewView = () => {
  return (
    <Grid container spacing={2}>
      <TimeSeriesChartWithControlsView
        title={texts.chartNames.total}
        groupVar="one"
      />
    </Grid>
  );
};
