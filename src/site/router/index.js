import Vue from 'vue'
import VueRouter from 'vue-router'
import cms from "./cms.js";

Vue.use(VueRouter);

const { BASE_URL } = process.env;

export default function createRouter({store}) {

  cms.connectStore(store);

  return new VueRouter({
      mode: 'history',
      base: BASE_URL,
      routes: cms.routes.slice()
  });
}

