import i18n from "i18next";

import { initReactI18next } from "react-i18next";

import translationEN from "../locales/en/translation.js";
import translationCH from "../locales/ch/translation.js";
import translationSCH from "../locales/sch/translation.js";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        ...translationEN,
      },
    },
    ch: {
      translation: {
        ...translationCH,
      },
    },
    sch: {
      translation: {
        ...translationSCH,
      },
    },
  },
  lng: "ch",
  fallbackLng: "ch",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
