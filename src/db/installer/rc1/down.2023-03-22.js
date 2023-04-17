import {definitionToSQL} from "@/db/tools/TableManagement.js";
import {tables} from "./schema.2023-01-31.js";

export default async function down({db}) {

  const routeDescriptor = tables.cmsPath.columnDescriptors.find($ => $.name === "route");

  await db.query(
    `ALTER TABLE \`${tables.cmsPath.table}\`
      MODIFY COLUMN route ${routeDescriptor.type} ${definitionToSQL(routeDescriptor.definition)};`
  );

  await db.query(
    `ALTER TABLE \`${tables.cmsPath.table}$history\`
      MODIFY COLUMN route ${routeDescriptor.type} ${definitionToSQL(routeDescriptor.definition)};`
  );

}