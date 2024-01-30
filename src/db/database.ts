import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import { ensureDefined } from "../common/util";
import { Database } from "./types";
import CreateEmailTable from "./migrations/create_email_table"; // Import your migration class

// const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_URL = "./db.db";

const sqliteDb = new SQLite(ensureDefined(DATABASE_URL));
const dialect = new SqliteDialect({
  database: sqliteDb,
});

export const db = new Kysely<Database>({
  dialect,
});

async function initializeDatabase(): Promise<void> {
  const tableExists =
    sqliteDb
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
      .get("email") !== undefined;

  if (!tableExists) {
    const createEmailTable = new CreateEmailTable();
    await createEmailTable.up(db);
  }
}

initializeDatabase().catch(console.error);
