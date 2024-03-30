import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App.jsx";
import { store } from "./store";
import { Provider } from "react-redux";
import { dispatch } from "react-redux";
import { setToken } from "./reducers/userReducer";
import { createRoot } from "react-dom/client";

import { BrowserRouter } from "react-router-dom";
import { apiSlice } from "./features/api/apiSlice";

global.$RefreshReg$ = () => {};
global.$RefreshSig$ = () => () => {};

const app = (
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);

if (process.env.RUNMODE != "prod") {
  const apiServer = await import("./api/server");
  const worker = apiServer.worker;
  worker.start({
    onUnhandledRequest: "bypass",
  });
}

const userToken = localStorage.getItem("userToken");
if (userToken != undefined) {
  store.dispatch(setToken(userToken));
}

/* Validate register:
1. Submit register action
2. Upon sucess, obtain token
3. Token is set in storage automatically
4. Obtain result from API using token
*/

const registerData = {
  username: "testuser" + Math.floor(Math.random() * 1000) + 1,
  password: "testpassword",
  isLogin: false,
};

const uponRegister = (result) => {
  // console.log("Register result:");
  // const data = result.data;
  // if (data.success) {
  //   const token = data.token;
  //   store.dispatch(setToken(token));
  // }
};

//store.dispatch(apiSlice.endpoints.registerUser.initiate(registerData)).then(uponRegister)

const root = createRoot(document.getElementById("root"));

root.render(app);
