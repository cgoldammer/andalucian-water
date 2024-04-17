export const getChartData = (data, timeOption) => {
  const uuids = [...new Set(data.map((row) => row.reservoirUuid))];
  const datesJson = [
    ...new Set(data.map((row) => JSON.stringify(row.date))),
  ].sort();
  const dates = datesJson.map((date) => JSON.parse(date));

  const getValuesForUuid = (uuid, extractor, lineId) => {
    const rows = data.filter((row) => row.reservoirUuid == uuid);
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
      yAxisKey: lineId == "State" ? "fill" : "rain",
      type: "line",
      data: values,
      id: lineId + uuid,
      label: lineId,
    };
  };

  const extractorState = (row) => row.volume / row.capacity;

  const seriesState = uuids.map((uuid) =>
    getValuesForUuid(uuid, extractorState, "State")
  );

  var seriesRain;
  if (timeOption == "day") {
    seriesRain = uuids.map((uuid) =>
      getValuesForUuid(uuid, (row) => row.rainAmount, "Rain")
    );
  } else {
    seriesRain = uuids.map((uuid) =>
      getValuesForUuid(
        uuid,
        (row) => row.rainAmountCumulative / row.rainAmountCumulativeHistorical,
        "Rain"
      )
    );
  }

  const series = seriesState.concat(seriesRain).filter((item) => item !== null);

  return {
    series: series,
    xvalues: dates,
  };
};

export const getTableData = (data, timeOption = "day") => {
  const dataCleaned = data.map((row) => {
    return {
      id: row.reservoir.uuid + row.date,
      date: row.date,
      volume: row.reservoir_state ? row.reservoir_state.volume : null,
      capacity: row.reservoir.capacity,
      reservoirName: row.reservoir.name,
      reservoirProvince: row.reservoir.province,
      reservoirUuid: row.reservoir.uuid,
      rainAmount: row.rainfall ? row.rainfall.amount : null,
      rainAmountCumulative: row.rainfall
        ? row.rainfall.amount_cumulative
        : null,

      rainAmountCumulativeHistorical: row.rainfall
        ? row.rainfall.amount_cumulative_historical
        : null,
      rainAmountCumulativeRelative: row.rainfall
        ? row.rainfall.amount_cumulative /
          row.rainfall.amount_cumulative_historical
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
  Intercept: -0.3,
  volume_rel_lag: 1.0,
  rainfall_rel: 0.3,
  "I((rainfall_rel + 1) ** 0.5)": 0,
  "I((rainfall_rel + 1.5) ** 0.5)": 0,
  "rainfall_rel:volume_rel_lag": 0,
};

export const getPredictions = (row, rainfallExpected) => {
  const capacity = row.capacity;
  const volumeLag = row.volumeLagged;
  const volumeLagRel = volumeLag / capacity;
  const predicted_rel = volumeLagRel - 0.3 + 0.3 * rainfallExpected;
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
      const vals = {
        group: getter(row),
      };
      (vals[outcome] = row[outcome]), result.push(vals);
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
    minAxis: -1200,
    maxAxis: 700,
  },
  region: {
    name: "Region",
    aggFunction: dataByRegion,
    minAxis: -2500,
    maxAxis: 1300,
  },
};
