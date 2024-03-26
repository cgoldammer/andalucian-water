import {
  getReservoirStates,
  getDailyData,
  getDB,
  createReservoir,
  createReservoirState,
  createRainfall,
} from "./api/server";
import {
  getChartData,
  getTableData,
  addDay,
  addYear,
  dateString,
} from "./helpers/data";
import { faker } from "@faker-js/faker";

const addMockDataTest = (
  db,
  numReservoirs,
  numDates,
  dateGenerator = addDay
) => {
  const dateStart = new Date(2021, 1, 1);
  for (let i = 0; i < numReservoirs; i++) {
    const reservoir = db.reservoir.create(createReservoir());

    /* Loop over all dates between dateStart and dateEnd */
    for (let i = 0; i < numDates; i++) {
      const date = dateGenerator(dateStart, i);
      const reservoirState = createReservoirState();
      reservoirState.date = dateString(date);
      reservoirState.reservoir = reservoir;
      db.reservoirState.create(reservoirState);

      const rainfall = createRainfall();
      rainfall.date = date;
      rainfall.reservoir = reservoir;
      db.rainfall.create(rainfall);
    }
  }
};

describe("Tests of utilities", () => {
  test("addDay adds a day", () => {
    const date = new Date(2021, 1, 1);
    const newDate = addDay(date, 1);
    expect(newDate.getDate()).toBe(2);
  });

  test("addYear adds a year", () => {
    const date = new Date(2021, 1, 1);
    const newDate = addYear(date, 1);
    expect(newDate.getFullYear()).toBe(2022);
  });
});

const numReservoirs = 2;
const numDates = 2;
describe("Tests with data from db", () => {
  test("Reservoir States have correct length", () => {
    const db = getDB();
    addMockDataTest(db, 2, 2);
    const states = getReservoirStates(db);
    expect(states.length).toBe(numReservoirs * numDates);
  });

  test("Daily data loads", () => {
    const db = getDB();
    addMockDataTest(db, 2, 2);
    const daily = getDailyData(db);
    expect(daily.length).toBe(numReservoirs * numDates);
    const { dataCleaned, columns } = getTableData(daily);
    const { series, xvalues } = getChartData(dataCleaned);
    expect(series.length).toBe(numReservoirs * 2);
  });

  test("Yearly lags are correct with daily data", () => {
    const db = getDB();
    addMockDataTest(db, 2, 2, addDay);
    const daily = getDailyData(db);
    const { dataCleaned, columns } = getTableData(daily);
    expect(columns.map((col) => col.field)).not.toContain("volumeLagged");
  });
  test("Yearly lags are correct with yearly data", () => {
    const db = getDB();
    const numYears = 2;
    const numReservoirs = 2;
    addMockDataTest(db, numReservoirs, numYears, addYear);
    const daily = getDailyData(db);

    const { dataCleaned, columns } = getTableData(daily, "year");
    // Expect that the dataCleaned does  contain the volumeLagged column
    console.log(dataCleaned);
    //console.log(columns);
    expect(columns.map((col) => col.field)).toContain("volumeLagged");

    // The volumeLagged should have (numYears - 1) * numReservoirs non-null values
    const numNonZero = dataCleaned.filter(
      (row) => row.volumeLagged != null
    ).length;
    expect(numNonZero).toBe((numYears - 1) * numReservoirs);
  });
});
