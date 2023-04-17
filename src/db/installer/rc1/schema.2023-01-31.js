

// Maximum length of path is 768.
// This is caused by use of utf8mb4 and MySQL's limit of 3072 bytes per index.
// Truncated to 700 to allow other fields to appear in indexes (e.g. deleted_at in the HistoryTable).

const cmsPath = {
  table: "cmsPath",

  columnDescriptors: [
    {
      name: "created_at",
      type: "TIMESTAMP(6)",
      definition: {DEFAULT: "CURRENT_TIMESTAMP(6)"},
    },
    {
      name: "modified_at",
      type: "TIMESTAMP(6)",
      definition: {
        DEFAULT: "CURRENT_TIMESTAMP(6)",
        ON_UPDATE: "CURRENT_TIMESTAMP(6)",
      },
    },
    {
      name: "published_at",
      type: "TIMESTAMP(6)",
      definition: {DEFAULT: "NULL"}
    },
    {
      name: "parent",
      type: "VARCHAR(700)",
      definition: {NOT_NULL: true}
    },
    {
      name: "name",
      type: "VARCHAR(256)",
      definition: {NOT_NULL: true}
    },
    {
      name: "ext",
      type: "VARCHAR(256)",
      definition: {
        DEFAULT: "'/'",
        NOT_NULL: true,
      }
    },
    {
      name: "valid",
      type: "BOOLEAN",
      definition: {
        GENERATED: {
          AS: `(
              CHAR_LENGTH(parent) + 1 + CHAR_LENGTH(name) + CHAR_LENGTH(ext) <= 700
              AND ((name = '' AND parent = '' AND ext = '') OR (
                parent LIKE '/%'
                AND CHAR_LENGTH(name) > 0
                AND name NOT LIKE '.%'
                AND name NOT LIKE '%/%'
                AND name NOT LIKE '%\\\\%'
                AND IF(ext = '', name NOT LIKE '%.%', ext LIKE '.?%')
              ))
            ) IS TRUE`,
          STORED: true,
        },
        NOT_NULL: true,
      }
    },
    {
      name: "path",
      type: "VARCHAR(700)",
      definition: {
        PRIMARY: true,
        GENERATED: {
          AS: `IF(valid, CONCAT(IF(parent = '/', '', parent), '/', name, ext), NULL)`,
          STORED: true,
        },
        NOT_NULL: true,
      },
    },
    {
      name: "lang",
      type: "VARCHAR(64)",
      definition: {
        NOT_NULL: true,
        DEFAULT: "'und'",
      },
    },
    {
      name: "lang_group",
      type: "BIGINT UNSIGNED",
      definition: {NOT_NULL: true}
    },
    {
      name: "lang_key",
      type: "VARCHAR(128)",
      definition: {
        UNIQUE: true,
        GENERATED: {
          AS: `CONCAT(lang_group, ':', lang)`,
          STORED: true,
        },
        NOT_NULL: true,
      },
    },
    {
      name: "title",
      type: "VARCHAR(1024)",
      definition: {NOT_NULL: true, DEFAULT: "''"}
    },
    {
      name: "meta",
      type: "JSON",
      definition: {DEFAULT: "NULL"}
    },
    {
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
              '$.title', title
            )
          )`,
        }
      }
    },
    {
      name: "page_content",
      type: "JSON",
      definition: {DEFAULT: "NULL"}
    },
    {
      name: "local_data",
      type: "JSON",
      definition: {DEFAULT: "NULL"}
    },
    {
      name: "local_transform",
      type: "VARCHAR(1024)",
      definition: {NOT_NULL: true, DEFAULT: "''"}
    },
  ],
};

const cmsGroup = {
  table: "cmsGroup",

  columnDescriptors: [
    {
      name: "created_at",
      type: "TIMESTAMP(6)",
      definition: {DEFAULT: "CURRENT_TIMESTAMP(6)"},
    },
    {
      name: "modified_at",
      type: "TIMESTAMP(6)",
      definition: {
        DEFAULT: "CURRENT_TIMESTAMP(6)",
        ON_UPDATE: "CURRENT_TIMESTAMP(6)",
      },
    },
    {
      name: "parent_group",
      type: "BIGINT UNSIGNED",
      definition: {NOT_NULL: true}
    },
    {
      name: "id",
      type: "BIGINT UNSIGNED",
      definition: {
        NOT_NULL: true,
        PRIMARY: true,
      }
    },
    {
      name: "shared_route",
      type: "JSON",
      definition: {DEFAULT: "NULL"}
    },
    {
      name: "shared_data",
      type: "JSON",
      definition: {DEFAULT: "NULL"}
    },
    {
      name: "shared_transform",
      type: "VARCHAR(1024)",
      definition: {NOT_NULL: true, DEFAULT: "''"}
    },
  ],
};

export const tables = {
  cmsPath,
  cmsGroup,
};
