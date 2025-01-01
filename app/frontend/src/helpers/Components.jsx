import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";

export const BoxLoading = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        height: "400px",
        alignItems: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export const CombineWithLink = ({ url, text, linkName }) => {
  return (
    <Grid container xs={12}>
      <Typography>{text}</Typography>{" "}
      <a href={url} target="_blank">
        {" "}
        {linkName}
      </a>
    </Grid>
  );
};
