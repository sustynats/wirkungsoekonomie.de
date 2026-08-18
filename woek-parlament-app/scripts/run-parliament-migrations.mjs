#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { loadEnvFile, readConfigValue } from "./env-utils.mjs";

const env = loadEnvFile();
const databaseUrl = readConfigValue("DATABASE_URL", env) || readConfigValue("POSTGRES_URL", env) || readConfigValue("SUPABASE_DB_URL", env);
const migrationsDirectory = path.resolve(process.cwd(), "supabase/migrations");
const files = readdirSync(migrationsDirectory)
  .filter((file) => /^\d{12}_[a-z0-9_-]+\.sql$/i.test(file))
  .sort()
  .map((file) => path.join("supabase/migrations", file));

if (!databaseUrl && !readConfigValue("SUPABASE_PROJECT_REF", env)) {
  console.error("Database access is not configured. Set DATABASE_URL, SUPABASE_DB_URL or link the intended Supabase project before running migrations.");
  process.exit(1);
}

for (const file of files) {
  const absoluteFile = path.resolve(process.cwd(), file);
  const command = databaseUrl ? "psql" : "npx";
  const args = databaseUrl
    ? [databaseUrl, "-v", "ON_ERROR_STOP=1", "-f", absoluteFile]
    : ["--yes", "supabase", "db", "query", "--linked", "--file", absoluteFile];
  console.log(`Applying ${file}`);
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`Migration failed: ${file}`);
    process.exit(result.status ?? 1);
  }
}

console.log("Parliament database migrations completed.");
