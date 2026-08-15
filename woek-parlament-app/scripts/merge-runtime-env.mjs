#!/usr/bin/env node

import fs from "node:fs";
import { loadEnvFile, stringifyEnv } from "./env-utils.mjs";

const sourceFile = process.argv[2];
if (!sourceFile || !fs.existsSync(sourceFile)) throw new Error("Provide an existing environment file to merge.");
const target = loadEnvFile(".env.local");
const source = loadEnvFile(sourceFile);
const allowlist = new Set([
  "DIP_API_KEY",
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "EDITORIAL_API_TOKEN",
  "EDITORIAL_DASHBOARD_BASE_URL",
  "DISCORD_WEBHOOK_URL",
  "DISCORD_REVIEW_CHANNEL_PRIVATE"
]);
for (const key of allowlist) {
  if (source[key]) target[key] = source[key];
}
fs.writeFileSync(".env.local", stringifyEnv(target), { mode: 0o600 });
console.log("Merged approved runtime configuration keys into protected local configuration.");
