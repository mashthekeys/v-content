import HistoryTable from "@/db/tools/HistoryTable.js";
import TableManagement from "@/db/tools/TableManagement.js";
import {tables} from "./schema.2022-12-12.js";

export default async function up({db}) {
  await TableManagement.installTable({up: true}, db, tables.cmsPage);

  await HistoryTable.installHistory({up: true}, db, tables.cmsPage);
}