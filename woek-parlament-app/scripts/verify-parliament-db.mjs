#!/usr/bin/env node

import { loadEnvFile, readConfigValue } from "./env-utils.mjs";

const env = loadEnvFile();
const baseUrl = readConfigValue("SUPABASE_URL", env) || readConfigValue("NEXT_PUBLIC_SUPABASE_URL", env);
const serviceRoleKey = readConfigValue("SUPABASE_SERVICE_ROLE_KEY", env);
if (!baseUrl || !serviceRoleKey) {
  console.error("Database verification needs SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const tables = [
  "parliament.parliaments",
  "parliament.cases",
  "parliament.source_documents",
  "parliament.document_versions",
  "parliament.decision_units",
  "parliament.document_chunks",
  "parliament.decision_fact_packages",
  "parliament.import_runs",
  "parliament.historical_backfill_checkpoints",
  "parliament.materiality_assessments",
  "parliament.review_batches",
  "parliament.review_batch_cases",
  "parliament.external_review_results",
  "parliament.editorial_tasks",
  "parliament.raw_observations",
  "parliament.formula_registry",
  "parliament.calculation_records",
  "parliament.aggregation_records"
];

let failed = false;
for (const table of tables) {
  const [, tableName] = table.split(".");
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/rest/v1/${tableName}?select=*&limit=1`, {
    method: "HEAD",
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, "Accept-Profile": "parliament" }
  });
  if (response.ok) {
    console.log(`ok ${table}`);
  } else {
    failed = true;
    console.log(`missing-or-inaccessible ${table} (${response.status})`);
  }
}
if (failed) process.exit(1);
console.log("Parliament database verification passed.");
