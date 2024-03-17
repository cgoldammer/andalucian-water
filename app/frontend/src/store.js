import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { apiSlice } from "./features/api/apiSlice";
import userReducer from "./reducers/userReducer";
import settingsReducer from "./reducers/settingsReducer";
const listenerMiddleware = createListenerMiddleware();

// export const updateToken(state, actions) => {
//   const token = actions.payload;
//   state.userData.token = token;
// }

const reducer = {
  [apiSlice.reducerPath]: apiSlice.reducer,
  userData: userReducer,
  settings: settingsReducer,
};

const middleware = (getDefaultMiddleware) =>
  getDefaultMiddleware()
    .prepend(listenerMiddleware.middleware)
    .concat(apiSlice.middleware);

export const store = configureStore({
  reducer: reducer,
  middleware: middleware,
});

export const getUserTokenSelector = (state) => state.userData.token;
export const hasUserTokenSelector = (state) =>
  getUserTokenSelector(state) != undefined;
