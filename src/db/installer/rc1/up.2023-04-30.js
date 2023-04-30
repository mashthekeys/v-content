import {definitionToSQL} from "@/db/tools/TableManagement.js";
import {tables} from "./schema.2023-04-30.js";
import {quoteName} from "@/server/be/queryUtil.js";
import HistoryTable from "@/db/tools/HistoryTable.js";
import Backup from "@/db/tools/Backup.js";

export default async function up({db}) {

  const redirect = tables.cmsPath.columnDescriptors.find($ => $.name === "redirect");
  const route = tables.cmsPath.columnDescriptors.find($ => $.name === "route");

  console.warn("Backup CMS Path table");
  console.warn(await Backup.createBackup(db, tables.cmsPath));

  console.warn("Create column `redirect`");
  await db.query(
    `ALTER TABLE ${quoteName(tables.cmsPath.table)}
      ADD COLUMN redirect ${redirect.type} ${definitionToSQL(redirect.definition)}
      BEFORE route;`
  );

  await db.query(
    `ALTER TABLE ${quoteName(tables.cmsPath.table + "$history")}
      ADD COLUMN redirect ${redirect.type} ${definitionToSQL(redirect.definition)}
      BEFORE route;`
  );

  console.warn("Update definition of `route`");
  await db.query(
    `ALTER TABLE ${quoteName(tables.cmsPath.table)}
      MODIFY COLUMN route ${route.type} ${definitionToSQL(route.definition)};`
  );

  await db.query(
    `ALTER TABLE ${quoteName(tables.cmsPath.table + "$history")}
      MODIFY COLUMN route ${route.type} ${definitionToSQL(route.definition)};`
  );

  console.warn("Update history triggers");
  await HistoryTable.updateTriggers({up: true}, db, tables.cmsPath);
}