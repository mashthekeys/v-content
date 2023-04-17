
const LOG_OR_WARN = {
  assert: 'log',
  clear: 'log',
  count: 'log',
  countReset: 'log',
  debug: 'log',
  dir: 'log',
  dirxml: 'log',
  error: 'warn',
  group: 'log',
  groupCollapsed: 'log',
  groupEnd: 'log',
  info: 'log',
  log: 'log',
  profile: 'log',
  profileEnd: 'log',
  table: 'log',
  time: 'log',
  timeEnd: 'log',
  timeLog: 'log',
  timeStamp: 'log',
  trace: 'warn',
  warn: 'warn',
};

export class LogConsole {
  static install() {
    const globalConsole = console;

    if (globalConsole instanceof LogConsole) {
      return globalConsole;
    }

    // noinspection JSValidateTypes
    console = new LogConsole(globalConsole);
  }


  constructor(nextConsole) {
    this.$nextConsole = nextConsole;

    this.$preamble = undefined;

    this.$preambleShown = {};
  }

  timestampPreamble(message) {
    if (message == null) {
      this.setPreamble(`\n${new Date().toISOString()}`);
    } else {
      this.setPreamble(`\n${new Date().toISOString()}\n${message}`);
    }
  }

  timestampMiddleware() {
    return (req, res, next) => {
      this.timestampPreamble();

      next();
    };
  }

  setPreamble(message) {
    this.$preamble = message == null ? undefined : message;

    this.$preambleShown = {};
  }

  $chain(type, args) {
    const preambleType = LOG_OR_WARN[type] || 'warn';

    if (this.$preamble !== undefined && !this.$preambleShown[preambleType]) {
      this.$nextConsole[preambleType](this.$preamble);
      this.$preambleShown[preambleType] = true;
    }

    const next = this.$nextConsole[type] ?? this.$nextConsole.warn;

    next.apply(this.$nextConsole, args)
  }

  both() { this.$chain("warn", arguments); this.$chain("log", arguments) }

  assert() { this.$chain("assert", arguments) }
  clear() { this.$chain("clear", arguments) }
  count() { this.$chain("count", arguments) }
  countReset() { this.$chain("countReset", arguments) }
  debug() { this.$chain("debug", arguments) }
  dir() { this.$chain("dir", arguments) }
  dirxml() { this.$chain("dirxml", arguments) }
  error() { this.$chain("error", arguments) }
  group() { this.$chain("group", arguments) }
  groupCollapsed() { this.$chain("groupCollapsed", arguments) }
  groupEnd() { this.$chain("groupEnd", arguments) }
  info() { this.$chain("info", arguments) }
  log() { this.$chain("log", arguments) }
  profile() { this.$chain("profile", arguments) }
  profileEnd() { this.$chain("profileEnd", arguments) }
  table() { this.$chain("table", arguments) }
  time() { this.$chain("time", arguments) }
  timeEnd() { this.$chain("timeEnd", arguments) }
  timeLog() { this.$chain("timeLog", arguments) }
  timeStamp() { this.$chain("timeStamp", arguments) }
  trace() { this.$chain("trace", arguments) }
  warn() { this.$chain("warn", arguments) }
}


export default LogConsole;