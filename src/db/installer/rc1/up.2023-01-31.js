import HistoryTable from "@/db/tools/HistoryTable.js";
import TableManagement from "@/db/tools/TableManagement.js";
import {tables} from "./schema.2023-01-31.js";

export default async function up({db}) {
  await TableManagement.installTable({up: true}, db, tables.cmsGroup);

  await TableManagement.installTable({up: true}, db, tables.cmsPath);

  await HistoryTable.installHistory({up: true}, db, tables.cmsGroup);

  await HistoryTable.installHistory({up: true}, db, tables.cmsPath);
}