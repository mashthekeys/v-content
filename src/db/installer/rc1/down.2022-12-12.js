import Backup from "@/db/tools/Backup.js";
import HistoryTable from "@/db/tools/HistoryTable.js";
import TableManagement from "@/db/tools/TableManagement.js";
import {tables} from "./schema.2022-12-12.js";

export default async function down({db}) {
  await Backup.createBackup(db, tables.cmsPage);

  await HistoryTable.installHistory({down: true}, db, tables.cmsPage);

  await TableManagement.installTable({down: true}, db, tables.cmsPage);
}