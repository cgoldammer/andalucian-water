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

const root = createRoot(document.getElementById("root"));

root.render(app);
