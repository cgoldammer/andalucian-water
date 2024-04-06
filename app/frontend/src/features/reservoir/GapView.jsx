import { ReservoirsScatterChart } from "./ReservoirsScatterChart";
import { GapChart } from "./GapChart";
import React from "react";
import Grid from "@mui/material/Unstable_Grid2";

export const GapView = () => {
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      xs={12}
      style={{ margin: "20px" }}
    >
      <GapChart />
      <ReservoirsScatterChart />
    </Grid>
  );
};
