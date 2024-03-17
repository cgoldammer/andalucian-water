import React from "react";

import Grid from "@mui/material/Unstable_Grid2";
import CssBaseline from "@mui/material/CssBaseline";
import { Route, Routes } from "react-router-dom";
import { ThemeProvider, Box , Container, Button, CardMedia, FormControl, Input, InputLabel, FormHelperText, TextField } from "@mui/material"
import Typography from "@mui/material/Typography";

import { texts } from "../texts";
import { theme, Image, NewButton } from "../helpers/helpers";

export function IntroView() {
    return (
      <Grid container spacing={1}>
          <Grid xs={7}>
            <Typography variant="h1">{ texts.projectTag }</Typography>
            <Typography>{ texts.projectDescription }</Typography>
            <Typography>{ texts.projectHow }</Typography>
          </Grid>
          <Grid xs={4}>
          
          </Grid>
        </Grid>
    )
  }