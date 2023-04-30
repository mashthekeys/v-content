import start from "./start.js"
import {customErrorMiddleware, debugUrlMiddleware} from "./middleware.js";
import {cmsPage} from "./fe/cmsPage.js";
import {cmsRoute} from "./fe/cmsRoute.js";
import installation from "../../config/installation.js";
import serverConfig from "../../config/server.js";

const {Database} = installation;

const debug = true;

const DB = Database.connect({debug});

const init = server => {
  // Server setup
  server.enable('etag');

  if (debug) server.use(debugUrlMiddleware);

  server.use("/route", cmsRoute({DB, debug}));

  server.use("/page", cmsPage({DB, debug}));

  server.use(customErrorMiddleware({debug}));
};

start({
  ...serverConfig.server["entry-fe"],
  init,
});

