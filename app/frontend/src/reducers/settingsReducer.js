import { createSlice } from "@reduxjs/toolkit";
import { isDev } from "../helpers/helpers";

const viewNames = ["intro"];
const viewNamesDev = ["intro"];

const initialState = () => {
  const otherViews = isDev ? viewNamesDev : viewNames;
  const viewsVisible = [...otherViews];

  const vals = {
    matchResponseSeconds: 1,
    viewsVisible: viewsVisible,
    hasAdmin: isDev,
  };
  return vals;
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState: initialState,
  reducers: {
    setMatchResponseSeconds: (state, actions) => {
      const seconds = actions.payload;
      state.matchResponseSeconds = seconds;
    },
    setViewsVisible: (state, actions) => {
      const viewsVisible = actions.payload;
      state.viewsVisible = viewsVisible;
    },
  },
});

export const { setMatchResponseSeconds, setViewsVisible } =
  settingsSlice.actions;
export default settingsSlice.reducer;
export const getMatchResponseSecondsSelector = (state) =>
  state.settings.matchResponseSeconds;
