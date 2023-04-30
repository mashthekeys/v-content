/* BEGIN Polyfill functionality for older browsers */
import "core-js/features/object/assign";
import elementClosest from "element-closest";
import { loadAsyncComponents } from '@akryum/vue-cli-plugin-ssr/client'

elementClosest(window);
/* END Polyfill functionality for older browsers */

import { createApp } from './site/main.js'

// noinspection JSIgnoredPromiseFromCall
createApp({
  async beforeApp ({
    router
  }) {
    await loadAsyncComponents({ router });
  },

  afterApp ({
    app,
    router,
    store,
  }) {
    store.replaceState(window.__INITIAL_STATE__);

    router.onReady(() => {
      app.$mount('#app');
    })
  }
})
