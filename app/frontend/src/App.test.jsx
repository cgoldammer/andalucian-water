import {
  getReservoirStates,
  getDailyData,
  db,
  createReservoir,
  createReservoirState,
  createRainfall,
} from "./api/server";
import { getChartData, getTableData } from "./helpers/data";
import { faker } from "@faker-js/faker";

const addMockDataTest = (db, numReservoirs, numDates) => {
  const dateStart = new Date(2021, 1, 1);
  for (let i = 0; i < numReservoirs; i++) {
    const reservoir = db.reservoir.create(createReservoir());

    /* Loop over all dates between dateStart and dateEnd */
    for (let i = 0; i < numDates; i++) {
      const date = new Date(dateStart);
      date.setDate(date.getDate() + i);
      const reservoirState = createReservoirState();
      reservoirState.date = date;
      reservoirState.reservoir = reservoir;
      db.reservoirState.create(reservoirState);

      const rainfall = createRainfall();
      rainfall.date = date;
      rainfall.reservoir = reservoir;
      db.rainfall.create(rainfall);
    }
  }
};

const numReservoirs = 2;
const numDates = 2;
addMockDataTest(db, numReservoirs, numDates);
test("Reservoir States have correct length", () => {
  const states = getReservoirStates();
  expect(states.length).toBe(numReservoirs * numDates);
});

test("Daily data loads", () => {
  const daily = getDailyData();
  console.log("Daily: ", daily);
  expect(daily.length).toBe(numReservoirs * numDates);

  const { dataCleaned, columns } = getTableData(daily);
  console.log(dataCleaned);
  const { series, xvalues } = getChartData(dataCleaned);
  console.log(series);
  expect(series.length).toBe(numReservoirs * 2);
});
