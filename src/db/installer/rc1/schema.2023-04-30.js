
import {tables as prevTables} from "./schema.2023-03-22.js";

const column_redirect = {
  name: "redirect",
  type: "JSON",
  definition: {
    DEFAULT: "'NULL'",
  }
};

const column_route = {
  name: "route",
  type: "JSON",
  definition: {
    GENERATED: {
      AS: `JSON_OBJECT(
        'name', lang_key, 
        'path', path, 
        'redirect', redirect, 
        'meta', JSON_SET(
          IFNULL(meta, JSON_OBJECT()), 
          '$.lang', lang, 
          '$.title', title,
          '$.modifiedAt', CONCAT(DATE(modified_at), 'T', TIME(modified_at), 'Z'),
          '$.publishedAt', CONCAT(DATE(published_at), 'T', TIME(published_at), 'Z')
        )
      )`,
    }
  }
};

function findAndReplace(array, findFn, ...replacements) {
  const index = array.findIndex(findFn);

  if (index === -1) return array;

  return [
    ...prevTables.cmsPath.columnDescriptors.slice(0, index),
    ...replacements,
    ...prevTables.cmsPath.columnDescriptors.slice(index + 1),
  ];
}

const cmsPath = {
  table: "cmsPath",

  columnDescriptors: findAndReplace(
    prevTables.cmsPath.columnDescriptors,
    $ => $.name === "route",
    column_redirect,
    column_route
  ),
};

export const tables = {
  cmsPath,
  cmsGroup: prevTables.cmsGroup,
};
