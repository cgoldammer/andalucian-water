import { addDay, dateString } from "./data";
import {
  createReservoir,
  createReservoirState,
  createRainfall,
} from "../api/server";
export const addMockDataTest = (
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
