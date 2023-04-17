import OPERATORS, {identifier} from "../../db/query-operators.js";

export function makeQuery(alias, query) {
  const where = [];
  const params = [];
  let valid = true;

  const queryParts = Object.entries(query);

  for (let q = 0; q < queryParts.length; q++) {

    const [field, match] = queryParts[q];

    if (match == null) {
      where.push(`(${identifier(field)} IS NULL)`);

    } else if (typeof match !== "object") {
      where.push(`(${identifier(field)} = ?)`);
      params.push(match);

    } else {
      if (OPERATORS.hasOwnProperty(match[0])) {

        const operator = OPERATORS[match[0]](alias, field, match);

        where.push(operator.where);

        if (operator.params?.length) params.push(...operator.params);

      } else {
        where.push('0');
        valid = false;
      }
    }
  }
  return {where, params, valid};
}

export function VALUES(columns) {
  return `(${columns.map(quoteName)}) VALUES (${columns.map(() => '?')})`
}

export function SET(columns) {
  return `${columns.map(c => quoteName(c) + ' = ?')}`
}

export function quoteName(n) {
  return "`" + String(n).replace(/`/g, "``") + "`"
}