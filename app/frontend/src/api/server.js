import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";
import { factory, oneOf, primaryKey } from "@mswjs/data";
import { faker } from "@faker-js/faker";
import seedrandom from "seedrandom";
import { setRandom } from "txtgen";
import { dateString } from "../helpers/data";

import { store } from "../store";

/* RNG setup */
// Set up a seeded random number generator, so that we get
// a consistent set of users / entries each time the page loads.
// This can be reset by deleting this localStorage value,
// or turned off bfy setting `useSeededRNG` to false.
let useSeededRNG = true;

let rng = seedrandom();

if (useSeededRNG) {
  let randomSeedString = localStorage.getItem("randomTimestampSeed");
  let seedDate;

  if (randomSeedString) {
    seedDate = new Date(randomSeedString);
  } else {
    seedDate = new Date();
    randomSeedString = seedDate.toISOString();
    localStorage.setItem("randomTimestampSeed", randomSeedString);
  }

  rng = seedrandom(randomSeedString);
  setRandom(rng);
  faker.seed(seedDate.getTime());
}

export const getDB = () => {
  return factory({
    user: {
      uuid: primaryKey(String),
      name: String,
    },
    location: {
      uuid: primaryKey(String),
      x: Number,
      y: Number,
    },
    reservoir: {
      uuid: primaryKey(String),
      name: String,
      capacity: Number,
    },
    reservoirState: {
      uuid: primaryKey(String),
      date: String,
      volume: Number,
      reservoir: oneOf("reservoir"),
    },
    rainfall: {
      uuid: primaryKey(String),
      date: String,
      amount: Number,
      reservoir: oneOf("reservoir"),
    },
  });
};

export const createReservoir = () => {
  return {
    uuid: faker.datatype.uuid(),
    name: faker.address.city(),
    capacity: faker.datatype.number(),
  };
};

export const createRainfall = () => {
  const date = dateString(faker.date.recent());
  const amount = faker.datatype.number();
  return {
    uuid: faker.datatype.uuid(),
    date,
    amount,
  };
};

export const createReservoirState = () => {
  const date = dateString(faker.date.recent());
  const volume = faker.datatype.number();
  return {
    uuid: faker.datatype.uuid(),
    date,
    volume,
  };
};

const dateStart = new Date(2021, 1, 1);
const numDates = 1;
const numReservoirs = 4;

const addMockData = (db) => {
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
    }
  }

  db.user.create({ uuid: faker.datatype.uuid(), name: "TestUser" });
};

export const getReservoirStates = (db) => {
  const reservoirStates = db.reservoirState.getAll().map((state) => {
    const reservoir = db.reservoir.findFirst({
      where: {
        uuid: {
          equals: state.reservoir.uuid,
        },
      },
    });
    return { ...state, reservoir };
  });
  return reservoirStates;
};

export const getReservoirs = (db) => {
  return db.reservoir.getAll();
};

export const getDailyData = (db) => {
  const reservoirStates = getReservoirStates(db);
  const rainfalls = db.rainfall.getAll();
  const reservoirs = db.reservoir.getAll();

  const dailyData = reservoirStates.map((state) => {
    const rainfall = rainfalls.find((rain) => rain.date == state.date);
    const reservoir = reservoirs.find(
      (reservoir) => reservoir.uuid == state.reservoir.uuid
    );
    return { date: state.date, reservoir_state: state, rainfall, reservoir };
  });
  return dailyData;
};

export const defaultStub = "/fakeApi";

export const handlers = (db, defaultStub = defaultStub) => [
  http.get(defaultStub + "/test/*", () => {
    return HttpResponse.json(
      { message: "Hello from the fake API!" },
      { status: 201 }
    );
  }),
  http.post(defaultStub + "/register", (req, res, ctx) => {
    return res(ctx.json("Basic tokenFromServer"));
  }),
  http.post(defaultStub + "login", (req, res, ctx) => {
    return res(ctx.json("Basic tokenFromServer"));
  }),
  http.get(defaultStub + "/get_reservoirs", () => {
    const reservoirs = getReservoirs(db);
    return HttpResponse.json(reservoirs, { status: 201 });
  }),
  http.get(defaultStub + "/get_user", () => {
    const user = db.user.getAll()[0];
    return HttpResponse.json(user, { status: 201 });
  }),
  http.get(defaultStub + "/get_reservoir_states", () => {
    const matchResponseSeconds = store.getState().settings.matchResponseSeconds;
    const reservoirStates = getReservoirStates(db);
    return HttpResponse.json(
      reservoirStates,
      { status: 201 },
      matchResponseSeconds * 1000
    );
  }),
  http.get(defaultStub + "/get_wide", () => {
    const matchResponseSeconds = store.getState().settings.matchResponseSeconds;

    const dailyData = getDailyData(db);
    return HttpResponse.json(
      dailyData,
      { status: 201 },
      matchResponseSeconds * 1000
    );
  }),
];

export function isJestWorker() {
  return process.env.JEST_WORKER_ID !== undefined;
}

export const worker = isJestWorker()
  ? undefined
  : setupWorker(...handlers(getDB()));

if (!isJestWorker()) {
  addMockData(getDB());
  if (process.env.RUNMODE != "prod") {
    worker.start({
      onUnhandledRequest: "bypass",
    });
  }
}
