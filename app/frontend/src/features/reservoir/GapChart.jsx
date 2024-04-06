import React from "react";
import { useGetDailyDataQuery, useGetReservoirsQuery } from "../api/apiSlice";
import { TimeOptions } from "../../helpers/helpers";
import { getTableData, addShortfall } from "../../helpers/data";
import { datesDefault } from "../../helpers/defaults";
import { BarChart } from "@mui/x-charts";
import Slider from "@mui/material/Slider";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";

import PropTypes from "prop-types";

export const GapChart = () => {
  const [rainfallExpected, setRainfallExpected] = React.useState(0.5);
  const handleRainfallExpectedChange = (event) => {
    setRainfallExpected(event.target.value);
  };

  const displayAsPercent = (val) => {
    return `${(val * 100).toFixed(0)}%`;
  };

  return (
    <Grid container justifyContent="center" alignItems="center" xs={12}>
      <Grid display="flex" justifyContent="center" alignItems="center" xs={12}>
        <Typography variant="h4">Rain (% of historical)</Typography>
      </Grid>
      <Grid display="flex" justifyContent="center" alignItems="center" xs={6}>
        <Slider
          type="range"
          min={0.2}
          max={0.8}
          step={0.05}
          marks
          value={rainfallExpected}
          onChange={handleRainfallExpectedChange}
        />
      </Grid>
      <Grid display="flex" justifyContent="center" alignItems="center" xs={6}>
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

export const GapChartDisplay = (props) => {
  const { rainfallExpected } = props;
  const { data: dataReservoirs, isLoading: isLoadingReservoirs } =
    useGetReservoirsQuery();
  const reservoirUuids =
    dataReservoirs === undefined ? [] : dataReservoirs.map((row) => row.uuid);
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

  if (
    isLoadingReservoirs ||
    dataReservoirs == undefined ||
    isLoading ||
    data == undefined ||
    data.length == 0
  ) {
    return <div>Gapchart Loading...</div>;
  }

  const { dataCleaned } = getTableData(data, timeOption);

  const dataCleanedLatestYear = addShortfall(
    dataCleaned,
    rainfallExpected
  ).filter((row) => new Date(row.date).getFullYear() == 2023);

  const dataByProvince = dataCleanedLatestYear.reduce((result, row) => {
    const existingProvince = result.find(
      (item) => item.province === row.reservoirProvince
    );
    if (existingProvince) {
      existingProvince.shortfall += row.shortfall;
    } else {
      result.push({
        province: row.reservoirProvince,
        shortfall: row.shortfall,
      });
    }
    return result;
  }, []);

  const seriesProvince = dataByProvince.map((row) => {
    return {
      data: [row.shortfall],
      stack: "Province",
      label: row.province,
    };
  });

  return (
    <Grid container justifyContent="center" alignItems="center" xs={12}>
      <Grid display="flex" justifyContent="center" alignItems="center" xs={12}>
        <Typography variant="h4">Shortfall</Typography>
      </Grid>
      <Grid display="flex" justifyContent="center" alignItems="center" xs={12}>
        <Typography>
          Given the relative rainfall, we can predict the shortfall, which is
          the expected reduction in overall reservoir levels (all in HM3).
        </Typography>
      </Grid>

      <Grid display="flex" justifyContent="center" alignItems="center" xs={12}>
        <BarChart
          series={seriesProvince}
          width={300}
          height={300}
          xAxis={[{ scaleType: "band", data: ["overall"] }]}
          slotProps={{ legend: { hidden: true } }}
        />
        {/* <div style={{ flex: 1 }}>
          <BarChart
            series={seriesReservoir}
            width={300}
            height={300}
            leftAxis={null}
            xAxis={[{ scaleType: "band", data: ["Reservoir"] }]}
            slotProps={{ legend: { hidden: true } }}
          />
        </div> */}
      </Grid>
    </Grid>
  );
};

GapChartDisplay.propTypes = {
  rainfallExpected: PropTypes.number.isRequired,
};
