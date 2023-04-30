import cms from "./cms.js";

require('isomorphic-fetch');

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export function createStore() {
  return new Vuex.Store({
    modules: {
      cms,
    },

    state: () => ({}),

    mutations: {},

    actions: {},
  });
}

export default createStore;
