async function dropTriggers(db, triggerName) {
  await db.query(`
      DROP TRIGGER IF EXISTS \`${triggerName}$immutable_delete\`;
    `);

  await db.query(`
      DROP TRIGGER IF EXISTS \`${triggerName}$immutable_update\`;
    `);
}

async function createTriggers(db, triggerName, table, fields) {
  const immutableFieldsChanged = fields.map(f =>
    `(OLD.\`${f}\` <=> NEW.\`${f}\`)`
  ).join(
    "\n        OR "
  );


  await db.query(`
      CREATE TRIGGER \`${triggerName}$immutable_update\`
      BEFORE UPDATE ON \`${table}\`
      FOR EACH ROW BEGIN
        IF (
          ${immutableFieldsChanged}
        ) THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'IMMUTABLE; table does not allow updates to these fields.';
        ELSEIF (NEW.deleted_at IS NULL) THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'IMMUTABLE; deleted_at must be non-NULL to update.';
        ELSEIF (OLD.deleted_at) THEN
          SET NEW.deleted_at = OLD.deleted_at;
        ELSE
          SET NEW.deleted_at = NOW();
        END IF;
      END;
    `);


  await db.query(`
      CREATE TRIGGER \`${triggerName}$immutable_delete\`
      BEFORE DELETE ON \`${table}\`
      FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'IMMUTABLE; table does not allow deletion.';
    `);
}

export const Immutable = {
  async installTriggers({up, down}, db, {triggerName, table, fields}) {

    if (typeof table !== 'string') {
      throw new TypeError("table must be specified as a string.");
    }

    if (up) {
      if (!Array.isArray(fields)) {
        throw new TypeError("fields must be specified as an Array.");
      }
      if (!fields.length) {
        throw new TypeError("At least one field must be specified.");
      }
    } else if (!down) {
      throw new Error(`No task to perform (up = ${up}, down = ${down})`);
    }

    if (typeof triggerName !== 'string') {
      triggerName = table
    }

    if (down || up) {
      await dropTriggers(db, triggerName);
    }

    if (up) {
      await createTriggers(db, triggerName, table, fields);
    }
  }

};

export default Immutable;