import start from "./start.js"
import {customErrorMiddleware, debugUrlMiddleware} from "./middleware.js";
import {cmsPage} from "./fe/cmsPage.js";
import {cmsRoute} from "./fe/cmsRoute.js";
import installation from "../../config/installation.js";

const {Database} = installation;

const debug = true;

const DB = Database.connect({debug});

start(server => {
  // Server setup
  server.enable('etag');

  if (debug) server.use(debugUrlMiddleware);

  server.use("/route", cmsRoute({DB, debug}));

  server.use("/page", cmsPage({DB, debug}));

  server.use(customErrorMiddleware({debug}));
});

