import React from "react";

import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import "./index.css";
import App from "./App";
import store from "./store/index";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

const title = document.querySelector("title");
title.innerText = i18n.t("site");

const updateTitle = () => {
  document.title = i18n.t("site");
};

i18n.on("languageChanged", updateTitle);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <I18nextProvider i18n={i18n}>
    <Provider store={store}>
      <App />
    </Provider>
  </I18nextProvider>
);
