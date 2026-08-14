#!/usr/bin/env node

import { loadEnvFile, readConfigValue } from "./env-utils.mjs";

const env = loadEnvFile();
const baseUrl = readConfigValue("SUPABASE_URL", env) || readConfigValue("NEXT_PUBLIC_SUPABASE_URL", env);
const serviceRoleKey = readConfigValue("SUPABASE_SERVICE_ROLE_KEY", env);
if (!baseUrl || !serviceRoleKey) throw new Error("Storage reporting needs server-side Supabase access.");

const response = await fetch(`${baseUrl.replace(/\/$/, "")}/rest/v1/rpc/storage_snapshot`, {
  method: "POST",
  headers: {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    "Content-Profile": "parliament"
  },
  body: "{}"
});
if (!response.ok) throw new Error(`Storage report failed (${response.status}).`);
const rows = await response.json();
const totalBytes = rows.reduce((total, row) => total + Number(row.total_bytes || 0), 0);
console.log(JSON.stringify({ total_bytes: totalBytes, tables: rows }, null, 2));
