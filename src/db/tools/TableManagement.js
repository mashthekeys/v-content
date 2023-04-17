import {identifier} from "../query-operators.js";

export function definitionToSQL(definition) {
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

async function createTable(db, table, columnDescriptors) {
  const primaryKey = columnDescriptors.find($ => $?.definition?.PRIMARY)?.name;

  if (!primaryKey) {
    throw new Error(`No primary key found for ${table}`);
  }

  const columns = columnDescriptors.map(columnDescriptor => {
    const {
      name,
      type,
      definition,
    } = columnDescriptor;

    return `${identifier(name)} ${type} ${definitionToSQL(definition)}`
  });

  columns.push(
    `PRIMARY KEY (${identifier(primaryKey)})`
  );

  const createQuery = `
    CREATE TABLE ${identifier(table)} 
    (${columns})
      ENGINE=InnoDB 
      DEFAULT CHARACTER SET=utf8mb4 COLLATE utf8mb4_0900_bin;
  `;

  console.warn("\n### BEGIN CREATE TABLE ###\n"
    + createQuery
    + "\n### END CREATE TABLE ###\n"
  );

  await db.query(createQuery);
}


export const TableManagement = {
  async installTable({up, down}, db, {table, columnDescriptors}) {

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


    if (down) {
      await db.query(`DROP TABLE IF EXISTS ${identifier(table)};`);
    }

    if (up) {
      await createTable(db, table, columnDescriptors);
    }
  },

};

export default TableManagement;