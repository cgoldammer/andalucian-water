import { texts } from "../texts";

export const getChartData = (data, timeOption) => {
  const uuids = [...new Set(data.map((row) => row.groupId))];
  const datesJson = [
    ...new Set(data.map((row) => JSON.stringify(row.date))),
  ].sort();
  const dates = datesJson.map((date) => JSON.parse(date));

  const getValuesForUuid = (uuid, extractor, lineId) => {
    const rows = data.filter((row) => row.groupId == uuid);
    if (rows.length == 0) {
      return null;
    }
    var values = [];
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const row = rows.find(
        (row) => JSON.stringify(row.date) == JSON.stringify(date)
      );
      if (row == undefined || row == null) {
        values.push(null);
        continue;
      }

      const value = extractor(row);
      values.push(value);
    }
    return {
      yAxisKey: lineId == texts.chartLabels.legend.fill ? "fill" : "rain",
      type: "line",
      data: values,
      id: lineId + uuid,
      label: lineId,
    };
  };

  const extractorState = (row) => row.volume / row.capacity;

  const seriesState = uuids.map((uuid) =>
    getValuesForUuid(uuid, extractorState, texts.chartLabels.legend.fill)
  );

  var seriesRain;
  seriesRain = uuids
    .map((uuid) =>
      getValuesForUuid(
        uuid,
        (row) => row.rainAmountCumulativeRelative,
        texts.chartLabels.legend.rain
      )
    )
    .filter((item) => item !== null);

  const hasMultiple = timeOption == "year";
  var series = seriesState;
  if (hasMultiple) {
    series = series.concat(seriesRain);
  }
  return {
    series: series,
    xvalues: dates,
  };
};

export const getTableData = (data, timeOption = "day") => {
  const dataCleaned = data.map((row) => {
    const hasRain = row.has_rainfall && row.rainfall_cumulative != 0;
    const groupId = row.reservoir_uuid
      ? row.reservoir_uuid
      : row.province
      ? row.province
      : "one";
    return {
      id: row.reservoir_uuid + row.date,
      date: row.date,
      volume: row.volume,
      capacity: row.capacity,
      hasRainfall: hasRain,
      reservoirName: row.reservoir_name,
      reservoirProvince: row.province,
      reservoirUuid: row.reservoir_uuid,
      groupId: groupId,
      rainAmount: hasRain ? row.rainfall_amount : null,
      rainAmountCumulative: hasRain ? row.rainfall_cumulative : null,
      rainAmountCumulativeHistorical: hasRain
        ? row.rainfall_cumulative_historical
        : null,
      rainAmountCumulativeRelative: hasRain
        ? row.rainfall_cumulative / row.rainfall_cumulative_historical
        : null,
    };
  });

  const dataAdded = addLaggedVolume(dataCleaned);

  const rainFormatter = (params) =>
    params.value != null ? params.value.toFixed(1) : null;

  const colRain = {
    field: "rainAmount",
    headerName: "Daily Rain",
    width: 100,
    renderCell: rainFormatter,
  };

  const colVolumeLag = {
    field: "volumeLagged",
    headerName: "Volume Lagged",
    width: 100,
  };
  const colVolumeDiffRelative = {
    field: "volumeDiffRelative",
    headerName: "Volume Difference Relative",
    width: 100,
  };

  const columnsRaw = [
    { field: "date", headerName: "Date", width: 100 },
    { field: "volume", headerName: "Volume", width: 100 },
    timeOption == "year" ? colVolumeLag : null,
    timeOption == "year" ? colVolumeDiffRelative : null,
    { field: "reservoirName", headerName: "Reservoir Name", width: 200 },
    { field: "capacity", headerName: "Capacity", width: 100 },
    timeOption == "day" ? colRain : null,
    {
      field: "rainAmountCumulative",
      headerName: "Rain Amount Cumulative",
      width: 200,
      renderCell: rainFormatter,
    },
    {
      field: "rainAmountCumulativeHistorical",
      headerName: "Rain Amount Cumulative Historical",
      width: 200,
      renderCell: rainFormatter,
    },
    {
      field: "rainAmountCumulativeRelative",
      headerName: "Rain Amount Cumulative Relative",
      width: 200,
      renderCell: rainFormatter,
    },
  ];

  // Remove all null columns
  const columns = columnsRaw.filter((item) => item !== null);

  return { dataCleaned: dataAdded, columns };
};

const addReservoirDataToRow = (row, reservoirData) => {
  if (
    reservoirData[row.reservoirUuid] == undefined ||
    reservoirData[row.reservoirUuid].region == undefined
  ) {
    return undefined;
  }
  const reservoir = reservoirData[row.reservoirUuid];
  return {
    ...row,
    reservoirRegionName: reservoir.region.name,
  };
};

export const addReservoirData = (dataCleaned, dataReservoirs) => {
  return dataCleaned.map((row) => addReservoirDataToRow(row, dataReservoirs));
};

/* 
The shortfall (as share of capacity) is calculate as:

constShortfall * (1 - rainfallExpected)

So e.g. if there is no rain, then rainFallExpected is 0
and the shortfall is constShortfall. And if rainfall is
100% of historical average then the shortfall is 0 for all coefficients.
This is consistent with the simple model here:
https://github.com/cgoldammer/andalucian-water/blob/master/app/backend/water/scripts/forecast.ipynb
*/

const paramsPred = {
  Intercept: -0.07592879513010331,
  volume_rel_lag: 0.9654619462999527,
  rainfall_rel: -0.21348097724475792,
  "I(rainfall_rel ** 2)": 0.634333167851502,
  "I(rainfall_rel ** 3)": -0.1829222770794317,
  "rainfall_rel:volume_rel_lag": -0.2283257327468397,
};

export const getPredictions = (row, rainfallExpected) => {
  const capacity = row.capacity;
  const volumeLag = row.volumeLagged;
  const volumeLagRel = volumeLag / capacity;
  const predicted_rel =
    paramsPred["Intercept"] +
    paramsPred["volume_rel_lag"] * volumeLagRel +
    paramsPred["rainfall_rel"] * rainfallExpected +
    paramsPred["I(rainfall_rel ** 2)"] * Math.pow(rainfallExpected, 2) +
    paramsPred["I(rainfall_rel ** 3)"] * Math.pow(rainfallExpected, 3) +
    paramsPred["rainfall_rel:volume_rel_lag"] *
      (volumeLagRel * rainfallExpected);
  const change_rel = predicted_rel - volumeLagRel;
  const change = change_rel * capacity;

  return {
    predicted_rel,
    change_rel,
    change,
  };
};

export const addShortfall = (data, rainfallExpected) => {
  return data.map((row) => {
    const predictions = getPredictions(row, rainfallExpected);
    return {
      ...row,
      ...predictions,
    };
  });
};

export const dateString = (date) => {
  return date.toISOString().split("T")[0];
};

export const addDay = (date, i) => {
  const dateCopy = new Date(date);
  dateCopy.setDate(dateCopy.getDate() + i);
  return dateCopy;
};

export const addYear = (date, i) => {
  const dateCopy = new Date(date);
  dateCopy.setFullYear(dateCopy.getFullYear() + i);
  return dateCopy;
};

export const addLaggedVolume = (data) => {
  const dataWithLaggedVolume = data.map((row) => {
    const originalDate = new Date(row.date);
    const date = dateString(addYear(originalDate, -1));

    const rowLagged = data.find(
      (row2) => row2.date == date && row.reservoirUuid == row2.reservoirUuid
    );
    return {
      ...row,
      volumeLagged: rowLagged ? rowLagged.volume : null,
      volumeDiff: rowLagged ? row.volume - rowLagged.volume : null,
      volumeDiffRelative: rowLagged
        ? (row.volume - rowLagged.volume) / rowLagged.capacity
        : null,
    };
  });

  return dataWithLaggedVolume;
};

const dataByField = (data, getter, outcome = "change") => {
  const res = data.reduce((result, row) => {
    const existing = result.find((item) => item.group === getter(row));
    if (existing) {
      existing[outcome] += row[outcome];
    } else {
      result.push({
        group: getter(row),
        [outcome]: row[outcome],
      });
    }
    return result;
  }, []);
  return res;
};

export const dataByProvince = (data) =>
  dataByField(data, (row) => row.reservoirProvince);

export const dataByRegion = (data) =>
  dataByField(data, (row) => row.reservoirRegionName);

export const aggTypes = {
  province: {
    name: "Province",
    aggFunction: dataByProvince,
    minAxis: -400,
    maxAxis: 800,
  },
  region: {
    name: "Region",
    aggFunction: dataByRegion,
    minAxis: -1000,
    maxAxis: 1800,
  },
};
