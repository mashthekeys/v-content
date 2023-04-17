import mysql from "mysql2/promise";

class DBConnector {
  static getConnection(dbParams) {
    let connectionPromise;

    const open = mysql.createConnection(dbParams);

    const setup = async connection => {
      await connection.execute('SET NAMES utf8mb4');
      await connection.execute(`SET SESSION group_concat_max_len = ${1024 * 1024}`);
      await connection.execute(`SET SESSION time_zone = 'UTC'`);
      return connection;
    };

    connectionPromise = open.then(setup);


    return connectionPromise;
  }

  constructor(options, dbSecrets) {
    this.debug = options.debug;

    this.database = dbSecrets.database;

    this.connect = () => DBConnector.getConnection({
      ...dbSecrets,
      supportBigNumbers: true,
      timezone: '+00:00',
    });
  }

  /** @return {Promise<PromiseConnection>} */
  async connect() {} // Provided by constructor

  async execute() {
    return this.$once('execute', Array.from(arguments));
  }

  async query() {
    return this.$once('query', Array.from(arguments));
  }

  async withConnection(next) {
    const connection = await this.connect();

    const nextConnection = !this.debug ? connection : {
      ...connection,
      query: (...args) => {
        this.writeLog("Connection", "query", ...args);
        return connection.query(...args);
      },
      execute(...args) {
        this.writeLog("Connection", "execute", ...args);
        return connection.execute(...args);
      },
    };

    try {
      await next(nextConnection);
    } catch (nextError) {
      connection.close();
      throw nextError;
    }

    connection.close();
  }

  async withTransaction(next) {
    const connection = await this.connect();

    const nextConnection = !this.debug ? connection : {
      ...connection,
      query: (...args) => {
        this.writeLog("Transaction", "query", ...args);
        return connection.query(...args);
      },
      execute(...args) {
        this.writeLog("Transaction", "execute", ...args);
        return connection.execute(...args);
      },
    };

    try {
      await connection.query("START TRANSACTION");
      await next(nextConnection);
      await connection.query("COMMIT");
    } catch (nextError) {
      try {
        await connection.query("ROLLBACK");
      } catch (ignored) {}

      connection.close();
      throw nextError;
    }

    connection.close();
  }

  async $once(dbMethod, dbArguments) {
    const connection = await this.connect();

    this.debug && this.writeLog("Single", dbMethod, ...dbArguments);

    return connection[dbMethod].apply(connection, dbArguments).then(
      result => {
        connection.close();

        return result;
      },
      dbError => {
        this.debug && this.writeError(dbError, "Single connection", dbMethod, ...dbArguments);

        connection.close();

        throw dbError;
      }
    );
  }

  debugString(x) {
    try {
      if (x === undefined) return "undefined";
      return JSON.stringify(x);
    } catch (ignored) {
      return JSON.stringify({type: typeof x});
    }
  }

  writeError(error, context, type, ...args) {
    console.warn(`== Error in ${context} ${type}\n--Query`);

    console.warn(args.map($ => this.debugString($)).join("\n--\n"));

    console.warn(error);

    console.warn("====");
  }

  writeLog(context, type, ...args) {
    console.log(`== ${context} ${type}\n${
      args.map($ => this.debugString($)).join("\n--\n")
    }\n====`);
  }
}

export default DBConnector;
