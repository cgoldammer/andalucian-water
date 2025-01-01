import React from "react";
import { CenteredGrid } from "../helpers/helpersUI";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import { texts } from "../texts";
import { CombineWithLink } from "../helpers/Components";

export const AboutView = () => {
  return (
    <CenteredGrid style={{ margin: "20px" }}>
      <Grid xs={12}>
        <Typography variant="h1">About</Typography>
      </Grid>
      <Grid xs={12}>
        <Typography variant="body1">
          Data on water reservoir levels in Andalucia, Spain.
        </Typography>
        {texts.aboutRendered.linkRepoRendered}
        {texts.aboutRendered.linkRawDataRendered}
        <Grid>
          <Typography>
            Contact:{" "}
            <a href="mailto:goldammer.christian@gmail.com">Chris Goldammer</a>
          </Typography>
        </Grid>
      </Grid>
    </CenteredGrid>
  );
};
