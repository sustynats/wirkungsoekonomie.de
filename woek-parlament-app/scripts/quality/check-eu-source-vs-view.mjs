#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";

const baseUrl = (process.env.WOEK_SOURCE_VS_VIEW_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const records = readFileSync(path.join(process.cwd(), "data", "eu", "impact-cases", "public-impact-records.jsonl"), "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
function visible(value) { return String(value).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/[–—]/g, "-").replace(/\s+/g, " ").trim(); }
const failures = [];
for (const record of records) {
  const response = await fetch(`${baseUrl}/eu/wirkungsfaelle/${encodeURIComponent(record.impact_case_id)}`, { redirect: "manual" });
  if (response.status !== 200) { failures.push(`${record.impact_case_id}: HTTP ${response.status}`); continue; }
  const text = visible(await response.text());
  for (const value of [record.title, record.impact_core_summary, record.editorial_summary, record.key_finding, record.competence_scope, record.evidence_level === "NOT_ASSESSABLE" ? "Evidenz nicht bewertbar" : null].filter(Boolean)) {
    if (!text.includes(visible(value))) failures.push(`${record.impact_case_id}: Feld fehlt: ${visible(value).slice(0, 80)}`);
  }
  for (const label of ["Richtung:", "Evidenz:", "Reality-Check:", "WÖk-Handlungsoption wird fachlich ergänzt.", "Vollständige EU-Fachakte"]) if (!text.includes(label)) failures.push(`${record.impact_case_id}: UI-Semantik fehlt: ${label}`);
}
if (failures.length) { console.error(JSON.stringify({ status: "FAIL", checked: records.length, failures }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ status: "PASS", checked: records.length, fach_fields_lost: 0 }, null, 2));
