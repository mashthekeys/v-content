import Vue from "vue";
import VueI18Next from "@panter/vue-i18next";
import i18next from "i18next";

import app_en from "./app.en.json";

Vue.use(VueI18Next);

export default function createI18n(options) {
    options = options || {};

    const {debug, promise} = options;

    const lang = options.lang || 'en';

    const instance = i18next.createInstance({
      contextSeparator: "@",
      pluralSeparator: "@",
    });

    const init = instance.init({
        lng: lang || 'en',
        fallbackLng: ['en', 'dev'],
        debug: !!debug,
        resources: {
            en: {
                translation: app_en
            }
        }
    }).then(() => {
      // instance.addResourceBundle('en', 'namespace', {...data});
    });


  try {
    window.sb_i18next = instance;
  } catch (referenceError) {
    // Ignored
  }

  const i18n = new VueI18Next(instance);

    return (promise
        ? init.then(() => i18n)
        : i18n
    );
}
