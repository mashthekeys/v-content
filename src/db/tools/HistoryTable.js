import {identifier} from "../../db/query-operators.js";
import Immutable from "./Immutable.js";

const getIdentifier = {
  table: $ => identifier(`${$}$history`),
  deleteTrigger: $ => identifier(`${$}$historyDelete`),
  updateTrigger: $ => identifier(`${$}$historyUpdate`),
};

function definitionToSQL(definition) {
  const $ = [];

  const isGenerated = definition.GENERATED != null;

  if (isGenerated) {
    $.push(`GENERATED ALWAYS AS (${definition.GENERATED.AS}) ${definition.GENERATED.STORED ? "STORED" : "VIRTUAL"}`)
  }

  $.push(definition.NOT_NULL ? "NOT NULL" : "NULL");

  if (definition.DEFAULT !== undefined) {
    $.push(`DEFAULT ${definition.DEFAULT}`)
  }

  if (definition.ON_UPDATE !== undefined) {
    $.push(`ON UPDATE ${definition.ON_UPDATE}`)
  }

  if (definition.AUTO_INCREMENT) {
    $.push("AUTO_INCREMENT")
  }

  if (definition.UNIQUE) {
    $.push("UNIQUE")
  }

  if (definition.COLLATE !== undefined) {
    $[isGenerated ? "unshift" : "push"](`COLLATE ${definition.COLLATE}`)
  }

  return $.join(" ");
}





async function dropTriggers(db, triggerName) {
  await db.query(`
      DROP TRIGGER IF EXISTS ${getIdentifier.deleteTrigger(triggerName)};
    `);

  await db.query(`
      DROP TRIGGER IF EXISTS ${getIdentifier.updateTrigger(triggerName)};
    `);
}


async function dropHistoryTable(db, table) {
  await db.query(`
    DROP TABLE IF EXISTS ${getIdentifier.table(table)};
  `);
}


async function createHistoryTable(db, table, columnDescriptors) {
  const primaryKey = columnDescriptors.find($ => $?.definition?.PRIMARY)?.name;

  if (!primaryKey) {
    throw new Error(`No primary key found for ${table}`);
  }

  const columns = columnDescriptors.map(columnDescriptor => {
    let {
      name,
      type,
      definition,
    } = columnDescriptor;

    if (definition?.PRIMARY && !definition.NOT_NULL) {
      definition = {
        ...definition,
        PRIMARY: false, // Primary key will be combined with deleted_at
        NOT_NULL: true
      };
    }

    if (definition?.UNIQUE) {
      definition = {
        ...definition,
        UNIQUE: false,  // Unique keys should be removed
      };
    }

    return `\`${name}\` ${type} ${definitionToSQL(definition)}`
  });

  columns.unshift(
    '`deleted_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)'
  );

  columns.push(
    `PRIMARY KEY (\`${primaryKey}\`, \`deleted_at\`)`,
    `INDEX (\`deleted_at\`)`
  );

  const createQuery = `
    CREATE TABLE ${getIdentifier.table(table)} 
    (${columns})
      ENGINE=InnoDB 
      DEFAULT CHARACTER SET=utf8mb4 COLLATE utf8mb4_0900_bin;
  `;

  console.warn("\n### BEGIN HISTORY TABLE ###\n"
    + createQuery
    + "\n### END HISTORY TABLE ###\n"
  );

  await db.query(createQuery);
}


async function createTriggers(db, triggerName, table, fields) {
  const COPY_TO_HISTORY =
    `INSERT INTO ${(getIdentifier.table(table))} (${fields.map(identifier)})
     VALUES (${fields.map(f => `OLD.${identifier(f)}`)});`;


  await db.query(`
      CREATE TRIGGER ${getIdentifier.updateTrigger(triggerName)}
      BEFORE UPDATE ON \`${table}\`
      FOR EACH ROW BEGIN
        ${COPY_TO_HISTORY}
      END;
    `);


  await db.query(`
      CREATE TRIGGER ${getIdentifier.deleteTrigger(triggerName)}
      BEFORE DELETE ON \`${table}\`
      FOR EACH ROW BEGIN
        ${COPY_TO_HISTORY}
      END;
    `);
}



export const HistoryTable = {
  async installHistory({up, down}, db, {table, columnDescriptors}) {

    if (typeof table !== 'string') {
      throw new TypeError("table must be specified as a string.");
    }

    if (up) {
      if (!Array.isArray(columnDescriptors)) {
        throw new TypeError("columnDescriptors must be specified as an Array.");
      }
      if (!columnDescriptors.length) {
        throw new TypeError("At least one column must be defined.");
      }
      if (typeof columnDescriptors[0] !== "object") {
        throw new TypeError("columnDescriptors must be an array of objects.");
      }
    } else if (!down) {
      throw new Error(`No task to perform (up = ${up}, down = ${down})`);
    }


    if (down || up) {
      await dropTriggers(db, table);
      await dropHistoryTable(db, table);
    }

    if (up) {
      // Remove deleted_at (if present)
      columnDescriptors = columnDescriptors.filter(({name}) => name !== "deleted_at")

      const fields = columnDescriptors.filter(
        ({definition}) => !definition.GENERATED
      ).map(
        ({name}) => name
      );

      await createHistoryTable(db, table, columnDescriptors);
      await createTriggers(db, table, table, fields);
    }
  },

  async replaceImmutable({up, down}, db, {triggerName, table, columnDescriptors}) {
    if (down) {
      throw new Error("This procedure has not been written.");
    }

    if (up) {
      triggerName = triggerName || table;

      // Remove deleted_at (if present)
      columnDescriptors = columnDescriptors.filter(({name}) => name !== "deleted_at")

      const fields = columnDescriptors.filter(
        ({definition}) => !definition.GENERATED
      ).map(
        ({name}) => name
      );

      await Immutable.installTriggers({down: true}, db, {triggerName, table/*, fields*/})

      await createHistoryTable(db, table, columnDescriptors);

      // Transfer existing deleted records to history table
      await db.query(
        `INSERT INTO ${getIdentifier.table(table)} (deleted_at, ${fields.map(identifier)}) 
        SELECT deleted_at, ${fields.map(identifier)} 
        FROM \`${table}\`
        WHERE deleted_at IS NOT NULL`
      );

      // Remove existing deleted records from live table
      await db.query(
        `DELETE FROM \`${table}\` WHERE deleted_at IS NOT NULL`
      );

      await createTriggers(db, table, table, fields);
    }
  },

  async updateTriggers({up, down}, db, {table, columnDescriptors}) {

    if (typeof table !== 'string') {
      throw new TypeError("table must be specified as a string.");
    }

    if (up) {
      if (!Array.isArray(columnDescriptors)) {
        throw new TypeError("columnDescriptors must be specified as an Array.");
      }
      if (!columnDescriptors.length) {
        throw new TypeError("At least one column must be defined.");
      }
      if (typeof columnDescriptors[0] !== "object") {
        throw new TypeError("columnDescriptors must be an array of objects.");
      }
    } else if (!down) {
      throw new Error(`No task to perform (up = ${up}, down = ${down})`);
    }


    if (down || up) {
      await dropTriggers(db, table);
    }

    if (up) {
      // Remove deleted_at (if present)
      columnDescriptors = columnDescriptors.filter(({name}) => name !== "deleted_at")

      const fields = columnDescriptors.filter(
        ({definition}) => !definition.GENERATED
      ).map(
        ({name}) => name
      );

      await createTriggers(db, table, table, fields);
    }
  },
};

export default HistoryTable;