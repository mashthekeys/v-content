import Backup from "@/db/tools/Backup.js";
import HistoryTable from "@/db/tools/HistoryTable.js";
import TableManagement from "@/db/tools/TableManagement.js";
import {tables} from "./schema.2023-01-31.js";

export default async function down({db}) {
  await Backup.createBackup(db, tables.cmsGroup);

  await Backup.createBackup(db, tables.cmsPath);

  await HistoryTable.installHistory({down: true}, db, tables.cmsGroup);

  await TableManagement.installTable({down: true}, db, tables.cmsPath);

  await db.query(`DROP TABLE IF EXISTS ${tables.cmsGroup.table}`).catch(() => {});

  await db.query(`DROP TABLE IF EXISTS ${tables.cmsPath.table}`).catch(() => {});
}