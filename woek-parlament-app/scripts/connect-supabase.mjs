#!/usr/bin/env node

import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { stringifyEnv } from "./env-utils.mjs";

const projectRef = process.env.SUPABASE_PROJECT_REF || "fganranxrdyewbjpvubx";

const result = spawnSync("npx", ["--yes", "supabase", "projects", "api-keys", "--project-ref", projectRef, "--reveal", "--output", "json"], { encoding: "utf8" });
if (result.status !== 0) throw new Error((result.stderr || "").trim() || "Could not retrieve Supabase project keys.");

const keys = JSON.parse(result.stdout);
function keyFor(names) {
  const match = keys.find((key) => names.includes(String(key.name || "").toLowerCase()) || names.includes(String(key.type || "").toLowerCase()));
  const value = match?.api_key ?? match?.key ?? match?.value;
  if (!value) throw new Error(`Could not retrieve the required ${names.join("/")} key.`);
  return value;
}

const values = {
  NEXT_PUBLIC_SUPABASE_URL: `https://${projectRef}.supabase.co`,
  SUPABASE_URL: `https://${projectRef}.supabase.co`,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: keyFor(["anon", "publishable"]),
  SUPABASE_SERVICE_ROLE_KEY: keyFor(["service_role", "secret"]),
  SUPABASE_PROJECT_REF: projectRef
};
fs.writeFileSync(".env.local", stringifyEnv(values), { mode: 0o600 });
console.log("Wrote protected local Supabase runtime configuration.");
