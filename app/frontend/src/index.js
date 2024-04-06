import React from "react";
import { App } from "./App.jsx";
import { store } from "./store";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

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

const root = createRoot(document.getElementById("root"));

root.render(app);
