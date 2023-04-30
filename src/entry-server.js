import {createApp} from './site/main.js'

const prepareUrlForRouting = url => {
  const { BASE_URL } = process.env
  return url.startsWith(BASE_URL.replace(/\/$/, ''))
    ? url.substr(BASE_URL.length)
    : url
}

function langTranslateHandler(router, context) {
  const lang = router.currentRoute?.meta?.lang || 'und';
  if (lang === 'mul' || lang === 'und') {
    context.meta.push(`<meta name="google" content="notranslate">`);
    context.rootAttributes.translate = "no";
  }
  context.rootAttributes.lang = lang;
}

function xmlSafe(string) {
  return (string == null
    ? ''
    : String(string).replace(/[<>&]/g,
        (_) =>
          _==='<' ? '&lt;'
            : _==='>' ? '&gt;'
            : '&amp;'
      )
  );
}

(_ => {
  console.log(_);
  console.warn(_);
})(`${new Date().toISOString()}
  Server Startup
`);

const debug = process.env.NODE_ENV === 'development';

export default async context => {

  context.title = 'SchoolBeat.cymru';

  context.meta = [];
  context.meta.toString = function() { return this.join('') };

  context.rootAttributes = {};
  Object.defineProperty(context.rootAttributes, 'toString', {
    value: function() {
      const attributes = Object.keys(this)
        .map(name => `${name}="${xmlSafe(this[name])}"`);
      return attributes.join(' ');
    }
  });

  const {
    app,
    router,
    store,
  } = await createApp();

  // router.afterHooks.push((to, from) => {});

  const localURL = prepareUrlForRouting(context.url);

  if (debug) {
    console.log(`${new Date().toISOString()}
    ${localURL}`)
  }

  // noinspection ES6MissingAwait
  router.push(localURL);

  const route = await new Promise((resolve, reject) => router.onReady(resolve, reject));

  const match = router.getMatchedComponents();

  if (match.length) {
    context.rendered = () => {

      const canonical = route?.meta?.canonicalUrl?.(context.url);
      if (canonical) context.meta.push(`<link rel="canonical" href="${canonical}">`);

      langTranslateHandler(router, context);

      // After all preFetch hooks are resolved, our store is now
      // filled with the state needed to render the app.
      // When we attach the state to the context, and the `template` option
      // is used for the renderer, the state will automatically be
      // serialized and injected into the HTML as `window.__INITIAL_STATE__`.
      context.state = store.state
    }
  } else {
    // TODO This sends a 500 Internal Server Error when a 404 is desired
    throw new Error(JSON.stringify({errorCode:404, localURL}));
  }

  return app;
}
