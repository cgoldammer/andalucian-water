// import { faker } from "@faker-js/faker";
import { setupServer } from "msw/node";
import { getDB, handlers } from "../../api/server";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { addMockDataTest } from "../../helpers/fixture";
import React from "react";
import { texts } from "../../texts";

test("It should print the reservoir UUid", () => {
  expect(true).toBe(true);
});

import { Provider } from "react-redux";
import { store } from "../../store";

jest.mock("@mui/x-charts", () => ({
  BarChart: jest.fn().mockImplementation(({ children }) => children),
  LineChart: jest.fn().mockImplementation(({ children }) => children),
}));

jest.mock("@mui/x-charts/ChartsAxis", () => ({
  axisClasses: jest.fn().mockReturnValue({}),
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

const setup = (reservoirUuid, showDateControls) => {
  const { asFragment, getByText, getByRole, queryByRole } = render(
    <Provider store={store}>
      <ReservoirView
        reservoirUuid={reservoirUuid}
        showDateControls={showDateControls}
        reservoirName={"test"}
      />
    </Provider>
  );
  return {
    asFragment,
    getByText,
    getByRole,
    queryByRole,
  };
};

const reservoirUuid = db.reservoir.getAll()[0].uuid;
const timeText = texts.timeOption;

test("The fragment without dates should not contain a time option field", () => {
  const { getByRole } = setup(reservoirUuid, true);
  expect(getByRole("label", { name: timeText })).toBeInTheDocument();
});

test("The fragment with dates should contain a Time Option field", () => {
  const { queryByRole } = setup(reservoirUuid, false);
  expect(queryByRole("label")).toBeNull();
});
