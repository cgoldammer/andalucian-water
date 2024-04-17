import { ScatterChart } from "@mui/x-charts/ScatterChart";
import Typography from "@mui/material/Typography";
import { useGetReservoirsQuery, useGetDailyDataQuery } from "../api/apiSlice";
import { TimeOptions, valueFormatter } from "../../helpers/helpers";
import React from "react";
import { getTableData } from "../../helpers/data";
import Grid from "@mui/material/Unstable_Grid2";
import { datesDefault } from "../../helpers/defaults";
import { axisClasses } from "@mui/x-charts/ChartsAxis";
import PropTypes from "prop-types";
import { texts } from "../../texts";

export const ReservoirsScatterChart = () => {
  const { data: dataReservoirs, isLoading: isLoadingReservoirs } =
    useGetReservoirsQuery();
  const reservoirUuids =
    dataReservoirs === undefined ? [] : Object.keys(dataReservoirs);
  const timeOption = TimeOptions.YEAR;
  const inputs = {
    reservoirUuids: reservoirUuids || [],
    startDate: datesDefault[timeOption].start,
    endDate: datesDefault[timeOption].end,
    timeOption: timeOption,
    isFirstOfYear: true,
  };
  const { data, isLoading } = useGetDailyDataQuery(inputs, {
    skip: reservoirUuids.length == 0,
  });

  if (
    isLoadingReservoirs ||
    dataReservoirs == undefined ||
    isLoading ||
    data == undefined ||
    data.length == 0
  ) {
    return <div>Loading...</div>;
  }

  const { dataCleaned } = getTableData(data, timeOption);
  const maxRelRain = 1.2;
  const minRelRain = 0.3;

  const getSeriesData = (row, index) => {
    return {
      x: row.rainAmountCumulativeRelative,
      y: row.volumeDiffRelative,
      name: row.reservoirName,
      date: row.date,
      id: `${row.reservoirUuid}-${index}`,
    };
  };

  const getSeries = (data) => {
    const values = data
      .filter((row) => row.rainAmountCumulativeRelative <= maxRelRain)
      .filter((row) => row.rainAmountCumulativeRelative >= minRelRain)
      .map(getSeriesData);
    return {
      label: data[0].reservoirName,
      data: values,
    };
  };

  const dataChart = dataCleaned.filter((row) => row.volumeDiffRelative != null);

  // To get the series, split the data by
  // reservoirUuid and then map over the data
  // to get the x and y values
  const names = [...new Set(dataChart.map((row) => row.reservoirName))];
  const series = names.map((name) => {
    const data = dataChart.filter((row) => row.reservoirName == name);
    return getSeries(data);
  });

  const yAxis = {
    scaleType: "linear",
    label: texts.labelFillRate,
    valueFormatter: valueFormatter,
    tickMinStep: 0.2,
  };

  const xAxis = {
    scaleType: "linear",
    label: texts.labelRainFallYear,
    valueFormatter: valueFormatter,
    tickMinStep: 0.2,
  };

  const CustomItemTooltipContent = (props) => {
    const { itemData, series } = props;
    const row = series.data[itemData.dataIndex];
    const xFormatted = valueFormatter(row.x);
    const yFormatted = valueFormatter(row.y);
    return (
      <div>
        {row.name} {row.date}: {xFormatted} {yFormatted}
      </div>
    );
  };

  CustomItemTooltipContent.propTypes = {
    itemData: PropTypes.object.isRequired,
    series: PropTypes.object.isRequired,
  };

  const chart = (
    <ScatterChart
      slotProps={{ legend: { hidden: true } }}
      series={series}
      width={600}
      height={600}
      tooltip={{ trigger: "item", itemContent: CustomItemTooltipContent }}
      yAxis={[yAxis]}
      xAxis={[xAxis]}
      sx={{
        [`.${axisClasses.left} .${axisClasses.label}`]: {
          transform: "translate(-25px, 0)",
        },
      }}
    />
  );

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      xs={12}
      sx={{ margin: "20px" }}
    >
      <Typography variant="h2">{texts.titleScatter}</Typography>
      <Typography>{texts.descriptionScatter}</Typography>
      {chart}
    </Grid>
  );
};
