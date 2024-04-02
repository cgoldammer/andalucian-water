import React from "react";
import { useGetDailyDataQuery, useGetReservoirsQuery } from "../api/apiSlice";
import { TimeOptions } from "../../helpers/helpers";
import { getChartData, getTableData, addShortfall } from "../../helpers/data";
import { datesDefault } from "../../helpers/defaults";
import { BarChart } from "@mui/x-charts";

export const GapChart = () => {
  const [rainfallExpected, setRainfallExpected] = React.useState(0.5);
  const handleRainfallExpectedChange = (event) => {
    setRainfallExpected(event.target.value);
  };

  return (
    <div>
      <h1>Gap Chart</h1>
      <input
        type="range"
        min={0}
        max={1.5}
        step={0.01}
        value={rainfallExpected}
        onChange={handleRainfallExpectedChange}
      />
      <div>{rainfallExpected}</div>
      <GapChartDisplay rainfallExpected={rainfallExpected} />
    </div>
  );
};

export const GapChartDisplay = (props) => {
  const { rainfallExpected } = props;
  const { data: dataReservoirs, isLoading: isLoadingReservoirs } =
    useGetReservoirsQuery();
  const reservoirUuids =
    dataReservoirs === undefined ? [] : dataReservoirs.map((row) => row.uuid);

  console.log("reservoirUuids", reservoirUuids);
  const timeOption = TimeOptions.YEAR;
  const inputs = {
    reservoirUuids: reservoirUuids,
    startDate: datesDefault[TimeOptions.YEAR].start,
    endDate: datesDefault[TimeOptions.YEAR].end,
    timeOption: timeOption,
    isFirstOfYear: true,
  };
  const { data, isLoading, error } = useGetDailyDataQuery(inputs);

  if (
    isLoadingReservoirs ||
    dataReservoirs == undefined ||
    isLoading ||
    data == undefined ||
    data.length == 0
  ) {
    return <div>Gapchart Loading...</div>;
  }

  const { dataCleaned, columns } = getTableData(data, timeOption);

  const dataCleanedLatestYear = addShortfall(
    dataCleaned,
    rainfallExpected
  ).filter((row) => new Date(row.date).getFullYear() == 2023);

  /* Create bar chart with this data */
  const seriesReservoir = dataCleanedLatestYear.map((row) => {
    return {
      data: [row.shortfall],
      stack: "Reservoir",
      label: row.reservoirName,
    };
  });

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
    <div>
      <h1>Shortfall</h1>
      <div style={{ display: "none" }}>Data rows: {dataReservoirs.length} </div>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <BarChart
            series={seriesProvince}
            width={300}
            height={300}
            xAxis={[{ scaleType: "band", data: ["Province"] }]}
            slotProps={{ legend: { hidden: true } }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <BarChart
            series={seriesReservoir}
            width={300}
            height={300}
            leftAxis={null}
            xAxis={[{ scaleType: "band", data: ["Reservoir"] }]}
            slotProps={{ legend: { hidden: true } }}
          />
        </div>
      </div>
    </div>
  );
};
