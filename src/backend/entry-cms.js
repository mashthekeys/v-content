/* BEGIN Polyfill functionality for IE11 and other browsers */
import "core-js/stable";
import "regenerator-runtime/runtime";

import "@/util/patch/element-closest.js";
import "@/util/patch/Event.js";
import "@/util/patch/EventTarget.js";
import "@/util/patch/fetch.js";
import "@/util/patch/Object.js";
/* END Polyfill functionality for IE11 and other browsers */

import { loadAsyncComponents } from '@akryum/vue-cli-plugin-ssr/client'

import { createApp } from './main.js'

window.VContentApp = {
  start: (appSelector) => createApp({
    async beforeApp({router}) {
      await loadAsyncComponents({router})
    },

    afterApp({app, router}) {
      router.onReady(() => app.$mount(appSelector));
    }
  })
};
