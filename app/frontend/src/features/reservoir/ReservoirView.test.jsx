// import { faker } from "@faker-js/faker";
import { setupServer, rest } from "msw/node";
import { getDB, handlers } from "../../api/server";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { addMockDataTest } from "../../helpers/fixture";
import React from "react";

test("It should print the reservoir UUid", () => {
  expect(true).toBe(true);
});

import { Provider } from "react-redux";
import { store } from "../../store";

jest.mock("@mui/x-charts", () => ({
  BarChart: jest.fn().mockImplementation(({ children }) => children),
  LineChart: jest.fn().mockImplementation(({ children }) => children),
}));

import { ReservoirView } from "./ReservoirView";

const db = getDB();
addMockDataTest(db, 2, 2);
const fakeServer = setupServer(...handlers(db, "http://localhost:9999"));
fakeServer.listen();

beforeAll(() => {
  fakeServer.listen();
});
afterEach(() => {
  fakeServer.resetHandlers();
});
afterAll(() => fakeServer.close());

const setup = () => {
  const reservoirUuid = db.reservoir.getAll()[0].uuid;
  const { asFragment, getByText } = render(
    <Provider store={store}>
      <ReservoirView reservoirUuid={reservoirUuid} />
    </Provider>
  );
  return {
    asFragment,
    getByText,
  };
};

test("The fragment should contain a Time Option field", () => {
  const reservoirUuid = db.reservoir.getAll()[0].uuid;
  const { asFragment, getByText } = setup();
  expect(getByText("Time Option")).toBeInTheDocument();
});
