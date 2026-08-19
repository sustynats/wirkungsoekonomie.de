#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { publicIndicatorLabel, publicSystemLabel } from "@/lib/presentation/labels";

const root = process.cwd();
const records = readFileSync(path.join(root, "data/eu/impact-cases/public-impact-records.jsonl"), "utf8")
  .split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const values = new Map<string, { field: string; value: string; label: string | null }>();
for (const record of records) {
  for (const field of ["analysis_mode", "legal_status", "competence_scope", "institutional_actor_role", "legal_feasibility_status", "boundary_status", "reality_check_status"]) {
    const value = String(record[field] ?? "");
    if (value) values.set(`${field}:${value}`, { field, value, label: publicSystemLabel(value) });
  }
  for (const value of record.implementation_route ?? []) values.set(`implementation_route:${value}`, { field: "implementation_route", value, label: publicSystemLabel(value) });
  for (const value of record.key_indicators ?? []) values.set(`key_indicators:${value}`, { field: "key_indicators", value, label: publicIndicatorLabel(value) });
}

const inventory = [...values.values()].sort((left, right) => `${left.field}:${left.value}`.localeCompare(`${right.field}:${right.value}`));
const mapped = inventory.filter((entry) => entry.label);
const missing = inventory.filter((entry) => !entry.label).map(({ field, value }) => ({ field, value, publication_status: "FIELD_SUPPRESSED_REVIEW_REQUIRED" }));
const euComponent = readFileSync(path.join(root, "app/components/eu/EuImpactCase.tsx"), "utf8");
const fullAnalysis = readFileSync(path.join(root, "app/components/FullAnalysisText.tsx"), "utf8");
const strictProjection = /publicSystemValueLabel\(record\.competence_scope\)/.test(euComponent)
  && /map\(publicIndicatorLabel\)/.test(euComponent)
  && !/humanizeSystemValue\(record\.(?:competence_scope|legal_feasibility_status|legal_status|institutional_actor_role)\)/.test(euComponent)
  && /publicControlText/.test(fullAnalysis);
const report = {
  schema_version: "woek-public-label-inventory-1.0",
  generated_at: new Date().toISOString(),
  status: strictProjection ? "PASS_WITH_FIELD_LEVEL_FAIL_CLOSED" : "FAIL",
  reviewed_public_label_count: mapped.length,
  missing_mapping_count: missing.length,
  missing_mapping_behavior: "FIELD_SUPPRESSED_REVIEW_REQUIRED",
  code_must_not_translate_unknown_fach_values: true,
  mapped,
  missing,
};
const output = path.join(root, "data/autopilot/audit/2.3-remediated/PUBLIC-LABEL-INVENTORY-2.3.json");
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ status: report.status, reviewed_public_label_count: mapped.length, missing_mapping_count: missing.length }, null, 2));
if (!strictProjection) process.exit(1);
