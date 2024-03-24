export const getChartData = (data) => {
  const uuids = [...new Set(data.map((row) => row.reservoirUuid))];
  const datesJson = [
    ...new Set(data.map((row) => JSON.stringify(row.date))),
  ].sort();
  const dates = datesJson.map((date) => JSON.parse(date));

  console.log("Dates: ", dates);

  const isEmpty = (arr) => {
    const allNulls = arr.every((value) => value === null);
    const allNaNs = arr.every((value) => isNaN(value));
    const noLength = arr.length == 0;
    return allNulls || allNaNs || noLength;
  };

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
      label: lineId + ":" + rows[0].reservoirName,
    };
  };

  const extractorState = (row) => row.volume;

  const seriesState = uuids.map((uuid) =>
    getValuesForUuid(uuid, extractorState, "State")
  );

  const extractorRain = (row) => row.rainAmount;
  const seriesRain = uuids.map((uuid) =>
    getValuesForUuid(uuid, extractorRain, "Rain")
  );
  const series = seriesState.concat(seriesRain).filter((item) => item !== null);

  return {
    series: series,
    xvalues: dates,
  };
};

export const getTableData = (data) => {
  const dataCleaned = data.map((row) => {
    return {
      id: row.reservoir.uuid + row.date,
      date: row.date,
      volume: row.reservoir_state ? row.reservoir_state.volume : null,
      capacity: row.reservoir.capacity,
      reservoirName: row.reservoir.name,
      reservoirUuid: row.reservoir.uuid,
      rainAmount: row.rainfall ? row.rainfall.amount : null,
    };
  });
  const columns = [
    { field: "id", headerName: "ID", width: 150 },
    { field: "date", headerName: "Date", width: 150 },
    { field: "volume", headerName: "Current Volume", width: 200 },
    { field: "capacity", headerName: "Capacity", width: 200 },
    { field: "reservoirName", headerName: "Reservoir", width: 200 },
    { field: "reservoirUuid", headerName: "Reservoir UUID", width: 200 },
  ];

  return { dataCleaned, columns };
};
