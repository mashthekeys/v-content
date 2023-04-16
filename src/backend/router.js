import VueRouter from "vue-router";
import Vue from "vue";
import CMSMainView from "@/backend/views/CMSMainView.vue";
import CatchAll from "@/components/CatchAll.vue";
import config from "../../config/config.js";

Vue.use(VueRouter);

const BASE_URL = process.env?.BASE_URL || "/";

const routes = [
  {
    name: "cms:en",
    meta: {lang: "en"},
    path: '/',
    title: config.APP_NAME,
    component: CMSMainView,
    props: true,
  },
  {
    name: "error",
    meta: {lang: "mul"},
    path: '*',
    component: CatchAll,
  },
];

export default function createRouter() {
  return new VueRouter({
    mode: 'history',
    base: BASE_URL,
    routes
  });
}
