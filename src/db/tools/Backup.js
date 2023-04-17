import {identifier} from "../query-operators.js";

export const Backup = {
  async createBackup(db, {table, ignoreError}) {
    const timestamp_ = new Date().toISOString().replace(/[^0-9]/g, '_');

    const backupTable = `backup_${timestamp_}${table}`;

    await db.query(`
      CREATE TABLE ${identifier(backupTable)} AS
      (SELECT * FROM ${identifier(table)});
    `).catch(dbError => {
      if (!ignoreError) throw dbError;
    });

    return {table: backupTable};
  }
};

export default Backup;