
import {tables as prevTables} from "./schema.2023-01-31.js";

const routeDescriptor = {
  name: "route",
  type: "JSON",
  definition: {
    GENERATED: {
      AS: `JSON_OBJECT(
        'name', lang_key, 
        'path', path, 
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

const cmsPath = {
  table: "cmsPath",

  columnDescriptors: prevTables.cmsPath.columnDescriptors.map(
    descriptor => descriptor.name !== "route" ? descriptor : routeDescriptor
  ),
};

export const tables = {
  cmsPath,
  cmsGroup: prevTables.cmsGroup,
};
