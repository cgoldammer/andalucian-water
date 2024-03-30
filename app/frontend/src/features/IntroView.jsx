import React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";

import { texts } from "../texts";

global.$RefreshReg$ = () => {};
global.$RefreshSig$ = () => () => {};

export const IntroView = () => {
  return (
    <Grid container spacing={1}>
      <Grid xs={7}>
        <Typography variant="h1">{texts.projectTag}</Typography>
        <Typography>{texts.projectDescription}</Typography>
        <Typography>{texts.projectHow}</Typography>
      </Grid>
      <Grid xs={4}></Grid>
    </Grid>
  );
};
