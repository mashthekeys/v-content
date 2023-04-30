/** Standard server entry point. Usage:
 *
 *    import start from "@/local_modules/abstract-server/start"
 *
 *    start(server => {
 *      // server routes and additional config here.
 *    });
 * */
import "regenerator-runtime/runtime";

import "core-js/features/object/from-entries";

import express from "express";
import LogConsole from "./log-console.js";

export default async function start(options) {
  LogConsole.install();

  console.timestampPreamble();
  console.warn('Server starting');

  /* ============================================================
   * Set up the server
   * ============================================================ */
  const server = express();

  const debug = options.debug = options.debug ?? (process.env.NODE_ENV === 'development');

  const {init, trustProxy} = options;

  const port = (options.port | 0) || 8080;

  server.use(console.timestampMiddleware());

  if (trustProxy) server.set('trust proxy', true);

  /* ============================================================
   * Gracefully handle signals and log end of process
   * ============================================================ */
  let exitTimestamped = false;

  // Allow up to 100 process listeners before warnings appear in the log
  process.setMaxListeners(100);

  process.on("SIGINT", () => {
    console.timestampPreamble();
    exitTimestamped = true;
    console.warn("Exiting due to SIGINT.");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.timestampPreamble();
    exitTimestamped = true;
    console.warn("Exiting due to SIGTERM.");
    process.exit(0);
  });

  process.on("exit", () => {
    exitTimestamped || console.timestampPreamble();
    console.warn("Process terminating.");
  });

  /* ============================================================
   * Run the server
   * ============================================================ */
  await init?.(server, options);

  server.listen(port);

  console.timestampPreamble();
  console.warn("Listening on port " + port);
}