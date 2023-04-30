
import Vue from "vue";
import AsyncComputed from "vue-async-computed";
import { sync } from "vuex-enhanced-router-sync";

import App from "./App.vue"
import createI18n from "../i18n";
import createRouter from "./router";
import createStore from "./store";

// Configure Vue features
Vue.use(AsyncComputed);

Vue.config.productionTip = false;

export async function createApp(
    {
        beforeApp = () => {},
        afterApp = () => {}
    } = {}
) {
    const i18n = createI18n();
    const store = createStore();
    const router = createRouter({store});
    const render = create => create(App);

    await beforeApp({
        i18n,
        router,
        store
    });

    sync(store, router);

    const app = new Vue({
        i18n,
        render,
        router,
        store
    });

    const _ = { app, router, store };

    await afterApp(_);

    return _;
}