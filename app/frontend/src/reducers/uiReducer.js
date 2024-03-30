import { createSlice } from "@reduxjs/toolkit";

const initialState = () => {
  return {
    reservoirUuidSelected: null,
  };
};

export const uiSlice = createSlice({
  name: "ui",
  initialState: initialState(),
  reducers: {
    setReservoirUuidSelected: (state, actions) => {
      console.log("Setting reservoirUuidSelected: ", actions.payload);
      state.reservoirUuidSelected = actions.payload;
    },
  },
});

export const { setReservoirUuidSelected } = uiSlice.actions;
export default uiSlice.reducer;
