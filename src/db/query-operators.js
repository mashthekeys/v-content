export function identifier(field) {
  return `\`${String(field).replace(/`/g, '``')}\``;
}

export const OPERATORS = {
  "IN"(alias, field, expression) {
    if (expression.length > 1000) {
      throw new Error("IN (...) does not support queries with more than 999 values.");
    }
    if (expression.length < 2) {
      // Empty set
      return {where: "FALSE"};
    }

    const params = expression.slice(1);

    const placeholders = new Array(params.length).fill("?");

    return {
      where: `(${alias}.${identifier(field)} IN (${placeholders}))`,
      params,
    };
  },

  "BETWEEN"(alias, field, expression) {
    return {
      where: `(${alias}.${identifier(field)} BETWEEN ? AND ?)`,
      params: [expression[1], expression[2]],
    };
  },

  "<"(alias, field, expression) {
    return {
      where: `(${alias}.${identifier(field)} < ?)`,
      params: expression[1],
    };
  },

  "<="(alias, field, expression) {
    return {
      where: `(${alias}.${identifier(field)} <= ?)`,
      params: expression[1],
    };
  },

  ">"(alias, field, expression) {
    return {
      where: `(${alias}.${identifier(field)} > ?)`,
      params: expression[1],
    };
  },

  ">="(alias, field, expression) {
    return {
      where: `(${alias}.${identifier(field)} >= ?)`,
      params: expression[1],
    };
  },

  /**
   * Compare the field and the supplied value for equality.
   *
   * This provides the syntax for querying JSON values which are objects or
   * arrays – which could be otherwise be interpreted as operators.
   *
   * @param table
   * @param field
   * @param expression
   * @return {{where: string, params: string}}
   */
  "="(table, field, expression) {

    let param = expression[1];

    if (typeof param === "object" && param !== null) {
      param = JSON.stringify(param);
    }

    return {
      where: `(${table}.${identifier(field)} = ?)`,
      params: param,
    };
  },

  "!="(table, field, expression) {
    const equals = OPERATORS["="](table, field, expression);

    return {
      where: `(NOT ${equals.where})`,
      params: equals.params,
    };
  },

  /**
   * Compare the field and the supplied value for equality.
   *
   * This provides the syntax for querying arbitrary JSON values.
   *
   * @param table
   * @param field
   * @param expression
   * @return {{where: string, params: string}}
   */
  "JSON_EQUAL"(table, field, expression) {
    return {
      where: `(${table}.${identifier(field)} = ?)`,
      params: JSON.stringify(expression[1]),
    };
  },

  "CONTAINS"(table, field, expression) {
    return {
      where: `FIND_IN_SET(?, ${table}.${identifier(field)})`,
      params: expression[1],
    };
  },
};

OPERATORS["=="] = OPERATORS["="];

OPERATORS["==="] = OPERATORS["="];

OPERATORS["<>"] = OPERATORS["!="];

OPERATORS["!=="] = OPERATORS["!="];

export default OPERATORS;
