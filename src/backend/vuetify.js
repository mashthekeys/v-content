import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import Ripple from 'vuetify/lib/directives/ripple';
import backend from "../../config/backend.js";

Vue.use(Vuetify, {
  directives: {
    Ripple,
  },
});

export default new Vuetify(backend.viewtify ?? {});
