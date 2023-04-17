import pino from "pino";

const logFile = process.env.LOG_FILE;

if (typeof logFile !== "string") {
  throw new TypeError(`Cannot start logging: LOG_FILE is ${typeof logFile}`);
}

export function initLogger(debug) {

  const destination = pino.destination({
    dest: logFile,
    sync: false,
  });

  const logger = pino(destination);

  return new LoggerConsole(logger);
}


const GROUP_HEADER = "#".repeat(40);


class LoggerConsole {
  constructor(logger) {
    this.logger = logger;
  }

  $logger(method, args) {
    let dataObject = {};

    const finalArg = args.length && args[args.length - 1];

    if (typeof finalArg === "object") {
      dataObject = finalArg;
    }

    this.logger[method](dataObject, ...args);
  }

  error(...args) {
    this.$logger("error", args);
  }

  group(label) {
    const message = typeof label !== "undefined"
      ? (GROUP_HEADER + "\n" + label + "\n" + GROUP_HEADER)
      : (GROUP_HEADER);

    this.$logger("info", [message]);
  }

  groupEnd() {
    this.$logger("info", [GROUP_HEADER]);
  }

  info(...args) {
    this.$logger("info", args);
  }

  log(...args) {
    this.$logger("info", args);
  }

  table(table, columns) {
    if (Array.isArray(columns)) {
      table = table.map(object => Object.fromEntries(columns.map(col => [col, object[col]])))
    }

    this.logger.info({table}, "See data.table");
  }

  warn(...args) {
    this.$logger("warn", args);
  }
}