#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";

const baseUrl = (process.env.WOEK_SOURCE_VS_VIEW_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const file = path.join(process.cwd(), "data", "government", "impact-cases", "public-impact-records.jsonl");
const records = readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));

function decodeHtml(value) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

function comparable(value) {
  return String(value).replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
}

const failures = [];
for (const record of records) {
  const url = `${baseUrl}/regierung/wirkungsanalysen/${encodeURIComponent(record.impact_case_id)}`;
  const response = await fetch(url, { redirect: "manual" });
  if (response.status !== 200) {
    failures.push(`${record.impact_case_id}: HTTP ${response.status}`);
    continue;
  }
  const text = comparable(decodeHtml(await response.text()));
  const required = [
    record.title,
    record.impact_summary.central_lever,
    record.impact_summary.strongest_positive_potential,
    record.impact_summary.main_risk_or_tradeoff,
  ].filter((value) => comparable(value).length > 0);
  for (const value of required) {
    if (!text.includes(comparable(value))) failures.push(`${record.impact_case_id}: freigegebenes Fachfeld fehlt in der View: ${comparable(value).slice(0, 80)}`);
  }
  for (const label of ["Richtung:", "Evidenz:", "Reality-Check:", "Vollständige Fachakte"]) {
    if (!text.includes(label)) failures.push(`${record.impact_case_id}: UI-Semantik fehlt: ${label}`);
  }
}

if (failures.length) {
  console.error(JSON.stringify({ status: "FAIL", base_url: baseUrl, checked: records.length, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ status: "PASS", base_url: baseUrl, checked: records.length, fach_fields_lost: 0 }, null, 2));
