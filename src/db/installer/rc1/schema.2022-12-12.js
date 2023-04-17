

// Maximum length of path is 768.
// This is caused by use of utf8mb4 and MySQL's limit of 3072 bytes per index.
// Truncated to 700 to allow other fields to appear in indexes (e.g. deleted_at in the HistoryTable).

const cmsPage = {
  table: "cmsPage",

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
      name: "valid",
      type: "BOOLEAN",
      definition: {
        GENERATED: {
          AS: `(
              CHAR_LENGTH(parent) + CHAR_LENGTH(name) + 2 <= 700
              AND IF(name = '', parent = '', parent LIKE '/%')
              AND name NOT LIKE '.%'
              AND name NOT LIKE '%/%'
              AND name NOT LIKE '%\\%'
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
          AS: `IF(valid, CONCAT(IF(parent = '/', '', parent), '/', name), NULL)`,
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
      name: "route_data",
      type: "JSON",
      definition: {DEFAULT: "NULL"}
    },
    {
      name: "page_data",
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
  cmsPage
};
