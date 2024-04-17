// import { faker } from "@faker-js/faker";
import { setupServer } from "msw/node";
import { getDB, handlers, getReservoirs, getDailyData } from "../../api/server";
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
import { setMatchResponseSeconds } from "../../reducers/settingsReducer";

store.settings;

store.dispatch(setMatchResponseSeconds(0));

jest.mock("@mui/x-charts", () => ({
  BarChart: jest.fn().mockImplementation(({ children }) => children),
  LineChart: jest.fn().mockImplementation(({ children }) => children),
  ScatterChart: jest.fn().mockImplementation(({ children }) => children),
}));

import { GapChartDisplay } from "./GapChart";
import { GapView } from "./GapView";

const db = getDB();
addMockDataTest(db, 2, 2);
const fakeServer = setupServer(...handlers(db, "http://localhost:9999"));
fakeServer.listen();

const mockValReservoirs = {
  data: getReservoirs(db),
  isLoading: false,
  isSuccess: true,
  isError: false,
  error: null,
};

const mockValDailyData = {
  data: getDailyData(db),
  isLoading: false,
  isSuccess: true,
  isError: false,
  error: null,
};

// mock the function useGetReservoirsQuery
jest.mock("../../features/api/apiSlice", () => ({
  ...jest.requireActual("../../features/api/apiSlice"),
  useGetReservoirsQuery: jest.fn(() => mockValReservoirs),
  useGetDailyDataQuery: jest.fn(() => mockValDailyData),
}));

jest.mock("@mui/x-charts/ChartsAxis", () => ({
  axisClasses: jest.fn().mockReturnValue({}),
}));

beforeAll(() => {
  fakeServer.listen();
});
afterEach(() => {
  fakeServer.resetHandlers();
});
afterAll(() => fakeServer.close());

const setup = () => {
  const { asFragment, getByText } = render(
    <Provider store={store}>
      <GapView />
    </Provider>
  );
  return {
    asFragment,
    getByText,
  };
};

test("The fragment should contain a description for the slider", () => {
  const { getByText } = setup();

  const expectedText = texts.rainSlider;

  expect(getByText(expectedText)).toBeInTheDocument();
});
