import React from "react";
import { useGetDailyDataQuery, useGetReservoirsQuery } from "../api/apiSlice";
import { TimeOptions } from "../../helpers/helpers";
import {
  getTableData,
  addShortfall,
  addReservoirData,
  aggTypes,
} from "../../helpers/data";
import { datesDefault } from "../../helpers/defaults";
import { BarChart, LineChart } from "@mui/x-charts";
import Slider from "@mui/material/Slider";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import { valueFormatter } from "../../helpers/helpers";
import PropTypes from "prop-types";
import { texts, namesRegionsShort } from "../../texts";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { axisClasses } from "@mui/x-charts/ChartsAxis";
const rainFallDefault = 0.6;

export const GapChart = () => {
  const [rainfallExpected, setRainfallExpected] =
    React.useState(rainFallDefault);
  const handleRainfallExpectedChange = (event) => {
    setRainfallExpected(event.target.value);
  };

  const displayAsPercent = (val) => {
    return `${(val * 100).toFixed(0)}%`;
  };

  return (
    <Grid container justifyContent="center" alignItems="center" xs={12}>
      <Grid display="flex" justifyContent="center" alignItems="center" xs={6}>
        <Typography variant="h4">{texts.rainSlider}</Typography>
      </Grid>
      <Grid display="flex" justifyContent="center" alignItems="center" xs={3}>
        <Slider
          type="range"
          min={0.3}
          max={1.2}
          step={0.1}
          marks
          value={rainfallExpected}
          onChange={handleRainfallExpectedChange}
        />
      </Grid>
      <Grid display="flex" justifyContent="center" alignItems="center" xs={3}>
        <Typography variant="h2">
          {displayAsPercent(rainfallExpected)}
        </Typography>
      </Grid>
      <Grid display="flex" justifyContent="center" alignItems="center" xs={12}>
        <GapChartDisplay rainfallExpected={rainfallExpected} />
      </Grid>
    </Grid>
  );
};

const getAll = (data, aggFunction) => {
  // Range from 0.3 to 1.2, steps of 0.1
  const rainfalls = Array.from({ length: 10 }, (_, i) => 0.3 + i * 0.1);
  const getAggForRainFall = (rainfallExpected) => {
    const dataAdded = addShortfall(data, rainfallExpected).filter(
      (row) => new Date(row.date).getFullYear() == 2023
    );
    return aggFunction(dataAdded);
  };

  return rainfalls.map((rainfall) => {
    return {
      data: getAggForRainFall(rainfall),
      rainfall: rainfall,
    };
  });
};

export const GapChartDisplay = (props) => {
  const { rainfallExpected } = props;
  const { data: dataReservoirs, isLoading: isLoadingReservoirs } =
    useGetReservoirsQuery();
  const reservoirUuids =
    dataReservoirs === undefined ? {} : Object.keys(dataReservoirs);
  const timeOption = TimeOptions.YEAR;
  const inputs = {
    reservoirUuids: reservoirUuids,
    startDate: datesDefault[TimeOptions.YEAR].start,
    endDate: datesDefault[TimeOptions.YEAR].end,
    timeOption: timeOption,
    isFirstOfYear: true,
  };
  const { data, isLoading } = useGetDailyDataQuery(inputs, {
    skip: reservoirUuids.length == 0,
  });
  const [aggType, setAggType] = React.useState("province");

  const handleChange = (event, newAlignment) => {
    setAggType(newAlignment);
  };

  if (
    isLoadingReservoirs ||
    dataReservoirs === undefined ||
    Object.keys(dataReservoirs).length === 0 ||
    isLoading ||
    data == undefined ||
    data.length == 0
  ) {
    return <div>Gapchart Loading...</div>;
  }

  const { dataCleaned } = getTableData(data, timeOption);
  const dataCleanedFull = addReservoirData(dataCleaned, dataReservoirs).filter(
    (row) => row !== undefined
  );

  const dataCleanedLatestYear = addShortfall(
    dataCleanedFull,
    rainfallExpected
  ).filter((row) => new Date(row.date).getFullYear() == 2023);

  const aggData = aggTypes[aggType];

  const seriesGrouped = aggData.aggFunction(dataCleanedLatestYear);

  const seriesAgg = {
    data: seriesGrouped.map((row) => row.change),
  };

  const totalChange = dataCleanedLatestYear.reduce(
    (acc, row) => acc + row.change,
    0
  );

  const totalCapacity = dataCleanedLatestYear.reduce(
    (acc, row) => acc + row.capacity,
    0
  );

  const totalRelChange = totalChange / totalCapacity;
  const totalChangeAbs = totalChange < 0 ? -totalChange : totalChange;
  const relChangeAbs = totalRelChange < 0 ? -totalRelChange : totalRelChange;

  const seriesAggNames = seriesGrouped.map((row) =>
    namesRegionsShort[row.group] != undefined
      ? namesRegionsShort[row.group]
      : row.group
  );

  const dataAll = getAll(dataCleanedFull, aggData.aggFunction);

  const groups = dataAll[0].data.map((row) => row.group);
  const getSeriesForGroup = (group) => {
    const dataGroup = dataAll.map(
      (data) => data.data.filter((row) => row.group == group)[0].change
    );
    return {
      data: dataGroup,
      showMark: false,
      label: group,
    };
  };

  const seriesStacked = groups.map((group) => getSeriesForGroup(group));

  const control = {
    value: aggType,
    onChange: handleChange,
    exclusive: true,
  };

  const toggleButtons = (
    <ToggleButtonGroup size="small" aria-label="Small sizes" {...control}>
      <ToggleButton value="province" key="center">
        By Province
      </ToggleButton>
      <ToggleButton value="region" key="left">
        By Water Region
      </ToggleButton>
    </ToggleButtonGroup>
  );

  const lineChart = (
    <LineChart
      series={seriesStacked}
      width={600}
      height={300}
      slotProps={{ legend: { hidden: true } }}
      yAxis={[
        {
          scaleType: "linear",
          min: aggData.minAxis,
          max: aggData.maxAxis,
          label: texts.labelYAxisTotalChange,
        },
      ]}
      xAxis={[
        {
          scaleType: "band",
          data: dataAll.map((data) => data.rainfall),
          valueFormatter: valueFormatter,
          label: texts.labelRainFallYear,
        },
      ]}
      sx={{
        [`.${axisClasses.left} .${axisClasses.label}`]: {
          transform: "translate(-25px, 0)",
        },
      }}
    />
  );

  return (
    <Grid container justifyContent="center" alignItems="center" xs={12}>
      <Grid
        display="flex"
        justifyContent="center"
        alignItems="center"
        xs={12}
        sx={{ margin: "20px" }}
      >
        <Typography variant="h1">
          {texts.getLevelsTextAbs(totalChange > 0, totalChangeAbs.toFixed(0))}
        </Typography>
      </Grid>
      <Grid
        display="flex"
        justifyContent="center"
        alignItems="center"
        xs={12}
        sx={{ margin: "20px" }}
      >
        <Typography variant="h3">
          {texts.getLevelsTextRel(
            totalChange > 0,
            valueFormatter(relChangeAbs)
          )}
        </Typography>
      </Grid>
      <Grid display="flex" justifyContent="center" alignItems="center" xs={12}>
        {toggleButtons}
      </Grid>
      <Grid display="flex" justifyContent="center" alignItems="center" xs={12}>
        <BarChart
          series={[seriesAgg]}
          width={600}
          height={300}
          xAxis={[{ scaleType: "band", data: seriesAggNames }]}
          yAxis={[
            {
              scaleType: "linear",
              min: aggData.minAxis,
              max: aggData.maxAxis,
              label: texts.labelYAxisTotalChange,
            },
          ]} // Set the yAxis range to -500, 500
          slotProps={{ legend: { hidden: true } }}
          sx={{
            [`.${axisClasses.left} .${axisClasses.label}`]: {
              transform: "translate(-10px, 0)",
            },
          }}
        />
      </Grid>
      <Grid
        display="flex"
        justifyContent="center"
        alignItems="center"
        xs={12}
        sx={{ margin: "20px" }}
      >
        <Typography>
          {texts.descriptionGap}{" "}
          <a
            href="https://github.com/cgoldammer/andalucian-water/blob/master/app/backend/water/scripts/forecast.ipynb"
            target="_blank"
            rel="noopener noreferrer"
          >
            {texts.analysisName}
          </a>
        </Typography>
      </Grid>
      <Grid display="flex" justifyContent="center" alignItems="center" xs={12}>
        <Typography variant="h2">{texts.titleRainfallAll}</Typography>
      </Grid>
      <Grid display="flex" justifyContent="center" alignItems="center" xs={12}>
        {lineChart}
      </Grid>
    </Grid>
  );
};

GapChartDisplay.propTypes = {
  rainfallExpected: PropTypes.number.isRequired,
};
