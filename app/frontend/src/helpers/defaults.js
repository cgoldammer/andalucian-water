import { timeOptions } from "./helpers";

export const datesDefault = {
  [timeOptions.YEAR]: {
    value: timeOptions.YEAR,
    start: "2000-01-01",
    end: "2024-12-31",
  },
  [timeOptions.MONTH]: {
    value: timeOptions.MONTH,
    start: "2023-01-01",
    end: "2024-12-31",
  },
  [timeOptions.DAY]: {
    value: timeOptions.DAY,
    start: "2024-10-01",
    end: "2024-12-31",
  },
};

export const timeOptionDefault = "YEAR";
