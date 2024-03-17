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
    
  },
  reservoirState: {
    uuid: primaryKey(String),
    date: Date,
    currentVolumne: Number,
    reservoir: oneOf('reservoir'),

  },
 
});

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



const addMockData = () => {
  for (let i = 0; i < numLocations; i++) {

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
];

export const worker = setupWorker(...handlers);
