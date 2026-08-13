import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import pg from "pg";
import { readConfig } from "./config.js";

const { Pool } = pg;

const config = readConfig();
const pool = new Pool({ connectionString: config.DATABASE_URL });
const migrationDirectory = fileURLToPath(new URL("../migrations/", import.meta.url));

try {
  const files = (await readdir(migrationDirectory)).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) {
    const existing = await pool.query("select 1 from analytics.schema_migrations where version = $1", [file]).catch(() => ({ rowCount: 0 }));
    if (existing.rowCount) continue;
    const sql = await readFile(join(migrationDirectory, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query("insert into analytics.schema_migrations (version) values ($1) on conflict do nothing", [file]);
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
} finally {
  await pool.end();
}
