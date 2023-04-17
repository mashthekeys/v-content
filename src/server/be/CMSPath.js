import crypto from "crypto";
import {makeQuery, SET, VALUES} from "./queryUtil.js";


export class CMSPath {
  constructor(params) {
    this.console = params.console ?? console;

    this.DB = params.DB;
  }

  async deleteById(id) {
    await this.DB.execute(
      "DELETE FROM cmsPath WHERE path = ?",
      [id]
    );

    return true;
  }

  async getById(id) {
    const [rows] = await this.DB.execute(
      "SELECT * FROM cmsPath WHERE path = ?",
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
       FROM cmsPath $1
       WHERE ${(where.join(" AND "))}
       ${LIMIT}`,
      params
    );

    return rows.map($ => ({...$}));
  }

  async findChildren({lang, lang_group, path}) {
    let sql, query;

    if (path != null && lang == null && lang_group == null) {
      query = makeQuery("$1", {parent: path});

      sql = `SELECT $1.path, $1.lang_key 
             FROM cmsPath $1 
             WHERE ${(query.where.join(" AND "))}
      `;
    } else {

      const args = {};
      if (lang != null) args.lang = lang;
      if (lang_group != null) args.lang_group = lang_group;
      if (path != null) args.path = path;

      query = makeQuery("$2", args);

      sql = `SELECT $1.path, $1.lang_key 
             FROM cmsPath $1 
              LEFT JOIN cmsPath $2 
                ON ($1.parent = $2.path)
             WHERE ${(query.where.join(" AND "))}
     `;
    }

    if (!query.valid || !query.where.length) {
      return [];
    }

    const [rows] = await this.DB.execute(
      sql,
      query.params
    );

    return rows.map($ => ({...$}));
  }

  async store(newValues, options = {replace: true}) {
    const {update, replace, insert} = options;

    const table = "cmsPath";

    const data = newValues.data;

    let {parent, name, lang, lang_group} = data;

    const hasPath = typeof newValues.id === "string" || (typeof parent === "string" && typeof name === "string");

    const hasLang = !!(lang && lang_group > 0);

    if (!hasPath) {
      if (insert || replace) {
        throw new Error("Cannot insert or replace without path.");
      }

      if (update && !hasLang) {
        throw new Error("No unique key specified in query");
      }
    }

    if (!lang) {
      lang = "und";
    }

    if (!(lang_group > 0)) {
      // New random BIGINT UNSIGNED
      lang_group = crypto.randomFillSync(new BigUint64Array(1))[0].toString();

      data.lang_group = lang_group;
    }

    // Computed properties
    const lang_key = `${lang_group}:${lang}`;

    const path = parent.length > 1 ? `${parent}/${name}` : `/${name}`;

    const originalPath = newValues.id || path;

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
    const uniqueFields = [hasPath ? "path" : null, hasLang ? "lang_key" : null].filter($ => $ !== null);

    const matchQuery = `SELECT *
       FROM ${table}
       WHERE ${uniqueFields.map(f => f + " = ?").join(" OR ")}`;

    const matchParams = uniqueFields.map(f => f === 'path' ? originalPath : lang_key);

    const [existingRows] = await this.DB.execute(
      matchQuery,
      matchParams
    );

    const exists = existingRows.length > 0;

    if (update || insert) {
      if (update && !exists) {
        throw new Error(`Cannot update: record does not exist: ${JSON.stringify(path)}`);
      }

      if (insert && exists) {
        throw new Error(`Cannot insert: record exists: ${JSON.stringify(path)}`);
      }
    }

    const currentValues = existingRows.find($ => $.path === path);

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
        `UPDATE \`${table}\` SET ${SET(writableFields)} WHERE path = ? OR lang_key = ?`,
        values.concat(path, lang_key)
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

export default CMSPath;
