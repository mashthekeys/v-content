import {makeQuery, quoteName, SET, VALUES} from "./queryUtil.js";


export class CMSGroup {
  constructor(params) {
    this.console = params.console ?? console;

    this.DB = params.DB;
  }

  async deleteById(id) {
    await this.DB.execute(
      "DELETE FROM cmsGroup WHERE id = ?",
      [id]
    );

    return true;
  }

  async getById(id) {
    const [rows] = await this.DB.execute(
      "SELECT * FROM cmsGroup WHERE id = ?",
      [id]
    );

    return rows[0];
  }

  async find(query) {
    const result = await this.findAll(query, {limit: 1});

    return result[0];
  }

  async findAll(query, {limit} = {}) {
    const {where, params, valid} = makeQuery("$1", query);

    if (!valid || !where.length) {
      return [];
    }

    const LIMIT = limit > 0 ? `LIMIT ${(+limit).toFixed(0)}` : '';

    const [rows] = await this.DB.execute(
      `SELECT *
       FROM cmsGroup $1
       WHERE ${(where.join(" AND "))}
       ${LIMIT}`,
      params
    );

    return rows.map($ => ({...$}));
  }


  async findChildren(id) {
    let sql, params;

    if (id == null) {
      params = [];

      sql = `SELECT id
             FROM cmsGroup $1 
             WHERE parent_group = 0
             LIMIT 1
      `;
    } else {
      sql = `SELECT id
             FROM cmsGroup
             WHERE parent_group = ?
     `;

      params = [id];
    }

    const [rows] = await this.DB.execute(
      sql,
      params
    );

    return rows.map($ => $.id);
  }

  async store(newValues, options = {replace: true}) {
    const {update, replace, insert} = options;

    const table = "cmsGroup";

    const data = newValues.data;

    let {parent_group, id} = data;

    const hasGroup = (id > 0);

/*
    if (!hasGroup) {
      if (insert || replace) {
        throw new Error("Cannot insert or replace without id.");
      }
    }

    if (!hasGroup) {
      // New random BIGINT UNSIGNED
      id = crypto.randomFillSync(new BigUint64Array(1))[0].toString();

      newValues.id = id;
    }
*/

    // Get field list from DB
    let [[{fields} = {}]] = await this.DB.execute(`
        SELECT JSON_ARRAYAGG(COLUMN_NAME) AS fields
        FROM information_schema.columns
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND GENERATION_EXPRESSION = ''
        ORDER BY ORDINAL_POSITION;`,
      [table]
    );

    if (fields == null || !fields.length) {
      throw new Error(`No writable fields on ${table}`);
    }

    let writableFields = fields.filter(
      f => (f !== 'created_at' && f !== 'modified_at')
    );

    if (update) {
      writableFields = writableFields.filter(key => data.hasOwnProperty(key));

      if (!writableFields.length) {
        throw new Error(`No writable fields in data for ${table}`);
      }
    }

    // Check the PRIMARY and UNIQUE fields
    const uniqueFields = ["id"];

    const matchQuery = `SELECT *
       FROM ${table}
       WHERE ${uniqueFields.map(f => quoteName(f) + " = ?").join(" OR ")}`;

    const matchParams = [newValues.id ?? id];

    const [existingRows] = await this.DB.execute(
      matchQuery,
      matchParams
    );

    const exists = existingRows.length > 0;

    if (update || insert) {
      if (update && !exists) {
        throw new Error(`Cannot update: record does not exist: ${matchParams[0]}`);
      }

      if (insert && exists) {
        throw new Error(`Cannot insert: record exists: ${matchParams[0]}`);
      }
    }

    const currentValues = existingRows.find($ => $.id === id);

    const values = writableFields.map(
      f => data[f] ?? currentValues?.[f] ?? null
    ).map(
      $ => {
        // Catch ISO-format Date values and transform into JS objects.
        if (typeof $ === "string" && /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d*)?Z/.test($)) {
          let [y, m, d, h, i, s, ms] = $.split(/[-T:.Z]/);

          ms = Number(`0.${ms}`) * 1000;

          return new Date(Date.UTC(+y, m - 1, +d, +h, +i, +s, ms | 0));
        } else {
          return $;
        }
      }
    );

    if (update) {
      await this.DB.execute(
        `UPDATE \`${table}\` SET ${SET(writableFields)} WHERE id = ?`,
        values.concat(id)
      );
    } else {
      await this.DB.execute(
        `${replace ? "REPLACE" : "INSERT"} INTO \`${table}\` ${VALUES(writableFields)}`,
        values
      );
    }

    const [resultValues] = await this.DB.execute(
      matchQuery,
      matchParams
    );

    return resultValues.map($ => ({...$}));
  }
}

export default CMSGroup;
