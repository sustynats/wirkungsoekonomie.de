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
  "parliament.public_source_registry",
  "parliament.public_source_usages",
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
  "parliament.external_review_result_revisions",
  "parliament.evidence_candidates",
  "parliament.editorial_tasks",
  "parliament.raw_observations",
  "parliament.formula_registry",
  "parliament.calculation_records",
  "parliament.aggregation_records",
  "parliament.political_source_documents",
  "parliament.policy_commitments",
  "parliament.commitment_decision_links",
  "parliament.commitment_impact_assessments",
  "parliament.members",
  "parliament.vote_events",
  "parliament.member_votes",
  "parliament.member_vote_impact_ledger",
  "parliament.wirkungsradar_subscriptions",
  "parliament.wirkungsradar_subscription_events",
  "parliament.woek_newsletter_subscriptions",
  "parliament.woek_newsletter_subscription_events",
  "parliament.woek_newsletter_daily_metrics",
  "parliament.state_target_registers",
  "parliament.state_targets",
  "parliament.release_deliveries"
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
