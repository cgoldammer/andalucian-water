import { createSlice } from "@reduxjs/toolkit";
import { isDev } from "../helpers/helpers";

const viewNames = ["intro", "footer"];

const viewNamesDev = ["table", "map", "chart", "intro", "footer"];

const initialState = () => {
  const adminViews = isDev ? ["admin"] : [];
  const otherViews = isDev ? viewNamesDev : viewNames;
  const viewsVisible = [...otherViews];

  return {
    matchResponseSeconds: 1,
    viewsVisible: viewsVisible,
    hasAdmin: isDev,
  };
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
