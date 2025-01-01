import React from "react";
import { timeOptionDefault, datesDefault } from "../../helpers/defaults";
import Grid from "@mui/material/Unstable_Grid2";
import { timeOptions } from "../../helpers/helpers";
import Typography from "@mui/material/Typography";
import { texts } from "../../texts";
import PropTypes from "prop-types";

import { FormControl, Input, InputLabel } from "@mui/material";
import { Select, MenuItem } from "@mui/material";
import { TimeSeriesChartWithControlsView } from "./TimeSeriesChartView";

export const ReservoirView = (props) => {
  const { reservoirUuid, showDateControls, reservoirName } = props;

  return (
    <Grid container justifyContent="center" alignItems="center" xs={12}>
      <TimeSeriesChartWithControlsView
        title={reservoirName}
        reservoirUuid={reservoirUuid}
      />
    </Grid>
  );
};

ReservoirView.propTypes = {
  reservoirUuid: PropTypes.string.isRequired,
  showDateControls: PropTypes.bool.isRequired,
  reservoirName: PropTypes.string.isRequired,
};
