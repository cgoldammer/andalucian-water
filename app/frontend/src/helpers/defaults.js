import { TimeOptions } from "./helpers";

export const datesDefault = {
  [TimeOptions.YEAR]: {
    start: "2000-01-01",
    end: "2024-12-31",
  },
  [TimeOptions.DAY]: {
    start: "2021-01-01",
    end: "2021-01-02",
  },
};

export const timeOptionDefault = TimeOptions.YEAR;
