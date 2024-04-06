import React from "react";
import { CenteredGrid } from "../helpers/helpersUI";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";

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
        <Typography variant="body1">
          See data preparation at{" "}
          <a href="https://github.com/cgoldammer/andalucian-water">
            the Github repo
          </a>
          .
        </Typography>
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
