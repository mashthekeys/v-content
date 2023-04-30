import {definitionToSQL} from "@/db/tools/TableManagement.js";
import {tables} from "./schema.2023-03-22.js";
import {quoteName} from "@/server/be/queryUtil.js";
import HistoryTable from "@/db/tools/HistoryTable.js";
import Backup from "@/db/tools/Backup.js";

export default async function down({db}) {

  const route = tables.cmsPath.columnDescriptors.find($ => $.name === "route");

  console.warn("Backup CMS Path table");
  console.warn(await Backup.createBackup(db, tables.cmsPath));


  console.warn("UNDO Update history triggers");
  await HistoryTable.updateTriggers({up: true}, db, tables.cmsPath);


  console.warn("UNDO Update definition of `route`");
  await db.query(
    `ALTER TABLE ${quoteName(tables.cmsPath.table)}
      MODIFY COLUMN route ${route.type} ${definitionToSQL(route.definition)};`
  );

  await db.query(
    `ALTER TABLE ${quoteName(tables.cmsPath.table + "$history")}
      MODIFY COLUMN route ${route.type} ${definitionToSQL(route.definition)};`
  );


  console.warn("UNDO Create column `redirect`");
  await db.query(
    `ALTER TABLE ${quoteName(tables.cmsPath.table)}
      DROP COLUMN redirect;`
  );

  await db.query(
    `ALTER TABLE ${quoteName(tables.cmsPath.table + "$history")}
    DROP COLUMN redirect;`
  );

}