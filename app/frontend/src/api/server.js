import { http, HttpResponse } from "msw";
import { setupWorker } from 'msw/browser'
import { factory, oneOf, manyOf, primaryKey } from "@mswjs/data";
import { faker } from "@faker-js/faker";
import seedrandom from "seedrandom";
import { defaultImageFilename, positionAndalucia } from "../texts";
import { setRandom } from "txtgen";

import { store } from '../store';
import {
  getRange,
  getRandomSample,
  getRandomSampleShare,
} from "../helpers/helpers";

const numLocations = 5;
const numBlocks = 20;
const ARTIFICIAL_DELAY_MS = 100;

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

export const db = factory({
  user: {
    uuid: primaryKey(String),
    name: String,
  },
  location: {
    uuid: primaryKey(String),
    x: Number,
    y: Number
  },
  reservoir: {
    uuid: primaryKey(String),
    name: String,
    
  },
  reservoirState: {
    uuid: primaryKey(String),
    date: Date,
    volume: Number,
    reservoir: oneOf('reservoir'),

  },
});

const createReservoir = () => {
  return {
    uuid: faker.datatype.uuid(),
    name: faker.address.city(),
  };
}

const createReservoirState = () => {
  const date = faker.date.recent();
  const volume = faker.datatype.number();
  return {
    uuid: faker.datatype.uuid(),
    date,
    volume,
  };

}

const noiseSize = 0.03;
const getRandomLocation = () => {
  const y = positionAndalucia[0] + (rng()-0.5) * noiseSize;
  const x = positionAndalucia[1] + (rng()-0.5) * noiseSize;
  return { x, y };
}

const createLocation = () => {
  const loc = getRandomLocation();
  return {
    uuid: faker.datatype.uuid(),
    x: loc.x,
    y: loc.y
  };
}



const serializeLocation = (location) => {
  return {
    ...location,
  };
};

const dateStart = new Date(2021, 1, 1);
const numDates = 1;
const numReservoirs = 4;

const addMockData = () => {
  for (let i = 0; i < numLocations; i++) {
    db.location.create(createLocation());
  }

  for (let i=0; i < numReservoirs; i++) {
    const reservoir = db.reservoir.create(createReservoir());

    /* Loop over all dates between dateStart and dateEnd */
    for (let i=0; i < numDates; i++) {
      const date = new Date(dateStart);
      date.setDate(date.getDate() + i);
      const reservoirState = createReservoirState();
      reservoirState.date = date;
      reservoirState.reservoir = reservoir;
      db.reservoirState.create(reservoirState);
    }
  }

  db.user.create({ uuid: faker.datatype.uuid(), name: "TestUser" });
}

addMockData();

export const handlers = [
  http.get("/fakeApi/test/*", ({params}) => {
    return HttpResponse.json({message: "Hello from the fake API!"}, { status: 201 })
  }),
  http.post("/fakeApi/register", (req, res, ctx) => {
    return res(ctx.json("Basic tokenFromServer"));
  }),
  http.post("/fakeApi/login", (req, res, ctx) => {
    return res(ctx.json("Basic tokenFromServer"));
  }),
  http.get("/fakeApi/get_user", (req, res, ctx) => {
    const user = db.user.getAll()[0];
    return HttpResponse.json(user, { status: 201 })
  }),
  http.get("/fakeApi/get_reservoir_states", (req, res, ctx) => {
    const matchResponseSeconds = store.getState().settings.matchResponseSeconds;
    console.log("Responding in " + matchResponseSeconds + " seconds")

    const reservoirStates = db.reservoirState.getAll().map(state => {
      /* Retrieve the reservoir from the DB */
      console.log(state.reservoir.uuid)
      const reservoir = db.reservoir.findFirst({
        where:{
          uuid: {
            equals: state.reservoir.uuid,
          },
        } 
      },);
      return { ...state, reservoir};
    });

    console.log("Reservoir states: ", reservoirStates)
    return HttpResponse.json(reservoirStates, { status: 201 }, matchResponseSeconds * 1000)
  })
];

export const worker = setupWorker(...handlers);
