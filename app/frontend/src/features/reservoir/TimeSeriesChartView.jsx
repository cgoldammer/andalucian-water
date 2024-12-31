import React from "react";
import { timeOptionDefault, datesDefault } from "../../helpers/defaults";
import Grid from "@mui/material/Unstable_Grid2";
import { timeOptions } from "../../helpers/helpers";
import Typography from "@mui/material/Typography";
import { getChartData, getTableData } from "../../helpers/data";
import { axisClasses } from "@mui/x-charts/ChartsAxis";
import { texts } from "../../texts";
import PropTypes from "prop-types";
import { LineChart } from "@mui/x-charts";
import { useGetWideDataQuery, useGetWideAggDataQuery } from "../api/apiSlice";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

export const yAxisWater = {
  id: "rain",
  scaleType: "linear",
  label: texts.labelRainFallYear,
  valueFormatter: (value) => `${(value * 100).toFixed(0)}%`,
};

export const TimeSeriesChartView = ({
  timeOption,
  reservoirUuid,
  groupVar,
}) => {
  const filterType = datesDefault[timeOption].value;

  var postData = {
    filterType,
    timeOption,
    startDate: datesDefault[timeOption].start,
    endDate: datesDefault[timeOption].end,
  };

  if (reservoirUuid != undefined) {
    postData["reservoirUuids"] = [reservoirUuid];
  }
  if (groupVar != undefined) {
    postData["groupVar"] = groupVar;
  }

  const getter =
    reservoirUuid != undefined ? useGetWideDataQuery : useGetWideAggDataQuery;

  const { data, isLoading, error } = getter(postData);

  const yAxisFill = {
    id: "fill",
    scaleType: "linear",
    label: "Fill Rate (%)",
    valueFormatter: (value) => `${(value * 100).toFixed(0)}%`,
  };

  if (error) {
    return <div>Error {JSON.stringify(error)}</div>;
  }

  if (isLoading || data == undefined) {
    return <div>Loading...</div>;
  }

  if (data.length == 0) {
    return <div>No data found</div>;
  }

  if (timeOption == timeOptions.YEAR && data.length > 20) {
    return <div>Too many data points for yearly view</div>;
  }

  const { dataCleaned } = getTableData(data, timeOption);

  const { series, xvalues } = getChartData(dataCleaned, timeOption);

  const xAxis = [
    {
      id: "years",
      data: xvalues,
      scaleType: "band",
      valueFormatter: (value) => value.toString(),
    },
  ];

  const hasMultiple = timeOption == timeOptions.YEAR;
  var yAxis = [yAxisFill];
  if (hasMultiple) {
    yAxis.push(yAxisWater);
  }
  const rightAxis = hasMultiple ? "rain" : undefined;

  return (
    <Grid display="flex" justifyContent="center" alignItems="center" xs={12}>
      <LineChart
        xAxis={xAxis}
        yAxis={yAxis}
        series={series}
        leftAxis="fill"
        rightAxis={rightAxis}
        width={600}
        slotProps={{ legend: { hidden: !hasMultiple } }}
        height={400}
        sx={{
          [`.${axisClasses.left} .${axisClasses.label}`]: {
            transform: "translate(-25px, 0)",
          },
          [`.${axisClasses.right} .${axisClasses.label}`]: {
            transform: "translate(30px, 0)",
          },
        }}
      />
    </Grid>
  );
};

TimeSeriesChartView.propTypes = {
  title: PropTypes.string.isRequired,
  timeOption: PropTypes.string.isRequired,
  reservoirUuid: PropTypes.string,
  groupVar: PropTypes.string,
};

export const TimeSeriesChartWithControlsView = ({
  title,
  reservoirUuid,
  groupVar,
}) => {
  const [timeOption, setTimeOption] = React.useState(timeOptionDefault);

  const handleTimeOptionChange = (event, newTimeOption) => {
    if (newTimeOption !== null) {
      setTimeOption(newTimeOption);
    }
  };

  const toggleButtons = (
    <ToggleButtonGroup
      value={timeOption}
      exclusive
      onChange={handleTimeOptionChange}
      aria-label="time option"
    >
      {Object.keys(timeOptions).map((option) => (
        <ToggleButton key={option} value={option} aria-label={option}>
          {timeOptions[option]}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      size={{ xs: 12 }}
    >
      <Grid
        display="flex"
        justifyContent="center"
        margin="10px;"
        alignItems="center"
        xs={12}
      >
        <Typography variant="h3">{title}</Typography>
      </Grid>
      <Grid
        item
        xs={12}
        display="flex"
        justifyContent="center"
        marginTop="10px"
      >
        {toggleButtons}
      </Grid>
      <Grid item xs={12} display="flex" justifyContent="center">
        <TimeSeriesChartView
          timeOption={timeOptions[timeOption]}
          reservoirUuid={reservoirUuid}
          groupVar={groupVar}
        />
      </Grid>
    </Grid>
  );
};

TimeSeriesChartWithControlsView.propTypes = {
  title: PropTypes.string.isRequired,
  reservoirUuid: PropTypes.string,
  groupVar: PropTypes.string,
};
