import start from "./start.js"
import {customErrorMiddleware, debugBodyMiddleware} from "./middleware.js";
import compression from "compression";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import {notifyAdminMiddleware} from "./notifyAdminMiddleware.js";
import {createEmailNotifier} from "./createEmailNotifier.js";
import responseConsole from "@mashthekeys/response-console";
import CMSPath from "./be/CMSPath.js";
import CMSGroup from "./be/CMSGroup.js";
import installation from "../../config/installation.js";
import config from "../../config/config.js";
import serverConfig from "../../config/server.js";

const {Database, Security} = installation;

const debug = true;

const DB = Database.connect({debug});

export function currentUser({DB, debug}) {
  return async (req, res) => {
    const {session, user} = await Security.accessSession(DB, req, res, 'user');

    if (session && user) {
      res.json({
        ...user,
        session
      });
      res.end();
    }
  };
}

function responseConsoleMiddleware(console, bufferLimit = 10240, prefix = null) {
  return function (req, res, next) {
    responseConsole(res, console, bufferLimit, prefix)
      .log(`### BEGIN CMS-BE REQUEST ###
${req.method} ${req.url}
${JSON.stringify(req.body, null, 2)}
### END CMS-BE REQUEST ###
`);

    next();
  }
}

function requestHandler(h) {
  return async (req, res, next) => {
    try {
      await h(req, res);

      res.end();

    } catch (e) {
      try {
        (res.console || console).$notifyAdmin = true;
        (res.console || console).error(e);

        res.console?.flush?.();
      } catch (ignored) {}

      next();
    }
  };
}

function cmsQuery(h) {
  return requestHandler(async (req, res) => {
    const security = await Security.accessSession(DB, req, res, 'cms');

    if (security?.user?.roles?.includes?.("SystemAdmin")) {

      await h(req, res, security);

    } else if (security?.SecurityError != null) {
      const {uid, username, roles} = security?.user ?? {};

      throw new security.SecurityError("No access to CMS", {uid, username, roles});
    } else {
      throw new Error("Not logged in");
    }
  });
}

const init = server => {
  // Server setup
  server.disable('etag');

  if (debug) server.use(debugBodyMiddleware);

  const environment = {DB, debug};

  server.set('json replacer',
    (key, value) => typeof value === 'bigint' ? String(value) : value
  );

  server.use(compression());

  server.use(bodyParser.json());

  server.use(cookieParser());

  server.all('*', responseConsoleMiddleware(console));

  if (serverConfig.notifyEmail?.to != null) {
    const {
      subject = `${config.APP_NAME}: Admin Notification`,
      from,
      to
    } = serverConfig.notifyEmail;

    server.all('*', notifyAdminMiddleware(createEmailNotifier(subject, from, to)));
  }

  server.get('/user', requestHandler(currentUser(environment)));
  server.post('/user', requestHandler(currentUser(environment)));

  const tables = {
    CMSGroup,
    CMSPath,
  };

  function tableConstructor(table) {
    if (!table in tables) {
      throw new Error("Invalid table");
    }

    return tables[table];
  }

  server.post("/id", cmsQuery(async (req, res, security) => {
    const Constructor = tableConstructor(req.body.table);

    const result = await new Constructor(security).getById(req.body.id);

    res.json(result ?? null);
  }));

  server.post("/query", cmsQuery(async (req, res, security) => {
    const Constructor = tableConstructor(req.body.table);

    const result = await new Constructor(security).find(req.body.query);

    res.json(result ?? null);
  }));

  server.post("/queryAll", cmsQuery(async (req, res, security) => {
    const Constructor = tableConstructor(req.body.table);

    const result = await new Constructor(security).findAll(req.body.query);

    res.json(result ?? null);
  }));

  server.post("/delete", cmsQuery(async (req, res, security) => {
    const Constructor = tableConstructor(req.body.table);

    await new Constructor(security).deleteById(req.body.id);

    // HTTP 204 No Content
    res.status(204);
  }));

  server.post("/deleteAll", cmsQuery(async (req, res, security) => {
    const Constructor = tableConstructor(req.body.table);

    await new Constructor(security).deleteAll(req.body.query);

    // HTTP 204 No Content
    res.status(204);
  }));

  server.post("/store", cmsQuery(async (req, res, security) => {
    const Constructor = tableConstructor(req.body.table);

    const result = await new Constructor(security).store(req.body, req.body.command);

    res.json(result ?? null);
  }));

  server.use(customErrorMiddleware({debug}));
};

start({
  ...serverConfig.server["entry-be"],
  init,
});

