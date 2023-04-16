
import Vue from "vue";
import AsyncComputed from "vue-async-computed";
import { sync } from "vuex-enhanced-router-sync";

import createI18n from "@/i18n/index.js";
import vuetify from '@/backend/vuetify.js'
import createRouter from "./router.js";
import createStore from "./store.js";
import CMSApp from "./CMSApp.vue";

// Configure Vue features
Vue.use(AsyncComputed,
  {
    useRawError: true,

    errorHandler(error) {
      console.error(error);
    }
  }
);

Vue.config.devtools = false;
Vue.config.productionTip = false;

export async function createApp(
    {
        beforeApp = () => {},
        afterApp = () => {}
    } = {}
) {
    const i18n = createI18n();
    const router = createRouter();
    const store = createStore();
    const render = create => create(CMSApp);

    const appEnvironment = { i18n, render, router, store, vuetify };

    await beforeApp(appEnvironment);

    sync(store, router);

    appEnvironment.app = new Vue(appEnvironment);

    await afterApp(appEnvironment);

    return appEnvironment;
}