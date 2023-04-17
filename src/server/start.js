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

export default async function start(initServer) {
  LogConsole.install();

  console.timestampPreamble();
  console.both('Server started');

  /* ============================================================
   * Set up the server
   * ============================================================ */
  const server = express();

  const PORT = (process.env.PORT | 0) || 8080;

  const {NODE_ENV} = process.env;

  const debug = NODE_ENV === 'development';

  server.use(console.timestampMiddleware());

  server.set('trust proxy', true);

  const options = {debug};

  await initServer(server, options);

  /* ============================================================
   * Gracefully handle signals and log end of process
   * ============================================================ */
  let exitTimestamped = false;

  // Allow up to 100 process listeners before warning appear in the log
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
    console.log("Process terminating.");
  });

  /* ============================================================
   * Run the server
   * ============================================================ */
  server.listen(PORT);
}