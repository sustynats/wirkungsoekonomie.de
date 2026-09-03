#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { projectEuEditorial } from "../../lib/publication/public-editorial-projection.mjs";

const sourceFunctionLabels = {
  LEGAL_ACT_AND_POLICY_DESIGN: "Rechtsakt und politische Ausgestaltung",
  MECHANISM_AND_SCOPE_BASELINE: "Ausgangslage für Wirkmechanismus und Regelungsumfang",
  NOT_OUTCOME_ATTRIBUTION: "kein Nachweis beobachteter oder zurechenbarer Wirkung",
  POLICY_DESIGN: "politische Ausgestaltung",
  MARKET_MECHANISM_REFERENCE: "Referenz für den Marktmechanismus",
  EARLY_CONTEXT_OBSERVATION: "frühe Kontextbeobachtung",
  NOT_CAUSAL_ATTRIBUTION: "keine kausale Zurechnung",
  STRATEGY_AND_IMPLEMENTATION_DESIGN: "Strategie und Umsetzungsarchitektur",
  CAPACITY_MECHANISM_BASELINE: "Ausgangslage für den Kapazitätsmechanismus",
  NOT_AVOIDED_DAMAGE_PROOF: "kein Nachweis vermiedener Schäden",
  LEGISLATIVE_PROPOSAL_AND_POLICY_DESIGN: "Gesetzgebungsvorschlag und politische Ausgestaltung",
  SUPPLY_RESILIENCE_MECHANISM: "Mechanismus der Versorgungsresilienz",
  NOT_SHORTAGE_OUTCOME_PROOF: "kein Nachweis verringerter Versorgungsengpässe",
  SECURITY_STRATEGY_AND_GOVERNANCE_DESIGN: "Sicherheitsstrategie und Governance-Architektur",
  COORDINATION_MECHANISM: "Koordinationsmechanismus",
  FUNDAMENTAL_RIGHTS_RISK_REFERENCE: "Referenz für Grundrechtsrisiken",
  NOT_SECURITY_OUTCOME_ATTRIBUTION: "keine Zurechnung einer beobachteten Sicherheitswirkung",
};

const baseUrl = (process.env.WOEK_SOURCE_VS_VIEW_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const outputFile = process.env.WOEK_EU_SOURCE_VS_VIEW_REPORT ?? null;
const requestHeaders = process.env.WOEK_SOURCE_VS_VIEW_COOKIE ? { cookie: process.env.WOEK_SOURCE_VS_VIEW_COOKIE } : {};
const allRecords = readFileSync(path.join(process.cwd(), "data", "eu", "impact-cases", "public-impact-records.jsonl"), "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const projected = allRecords.map((record) => ({ record, editorial: projectEuEditorial(record) }));
const records = projected.filter(({ editorial }) => editorial.status === "PASS");
function visible(value) { return String(value).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/[–—]/g, "-").replace(/\s+/g, " ").trim(); }
const failures = [];
const cases = [];
for (const { record, editorial } of records) {
  const url = `${baseUrl}/eu/wirkungsfaelle/${encodeURIComponent(record.impact_case_id)}`;
  const response = await fetch(url, { redirect: "manual", headers: requestHeaders });
  const result = { impact_case_id: record.impact_case_id, url, http_status: response.status, fields_checked: 0, failures: [], status: "PASS" };
  if (response.status !== 200) { failures.push(`${record.impact_case_id}: HTTP ${response.status}`); result.failures.push("HTTP_200"); result.status = "FAIL"; cases.push(result); continue; }
  const text = visible(await response.text());
  for (const value of [record.title, editorial.fields.overview_assessment_label, editorial.fields.impact_core_summary, editorial.fields.editorial_summary, editorial.fields.evidence_summary, editorial.fields.key_finding, editorial.fields.reality_check_summary].filter(Boolean)) {
    result.fields_checked += 1;
    if (!text.includes(visible(value))) { const message = `Feld fehlt: ${visible(value).slice(0, 80)}`; failures.push(`${record.impact_case_id}: ${message}`); result.failures.push(message); }
  }
  if (record.editorial_evidence_overlay) {
    for (const value of [...(record.source_function ?? []).map((entry) => sourceFunctionLabels[entry]).filter(Boolean), ...(record.limitations ?? [])]) {
      result.fields_checked += 1;
      if (!text.includes(visible(value))) { const message = `Evidenz-Overlay-Feld fehlt: ${visible(value).slice(0, 80)}`; failures.push(`${record.impact_case_id}: ${message}`); result.failures.push(message); }
    }
    const sourceCount = new Set([...(record.official_sources ?? []), ...(record.source_refs ?? [])]).size;
    result.fields_checked += 1;
    const renderedSourceCount = (text.match(/Quellenakte öffnen/g) ?? []).length;
    if (renderedSourceCount < sourceCount) { const message = `Evidenzquellen unvollständig: ${renderedSourceCount}/${sourceCount}`; failures.push(`${record.impact_case_id}: ${message}`); result.failures.push(message); }
  }
  for (const label of ["Executive-WÖk-Zusammenfassung", "Wirkungspotenzial kompakt", "Wirkungsrichtung", "Evidenzstatus", "Reality-Check", "WÖk-Handlungsoption wird fachlich ergänzt.", "Vollständige EU-Fachakte"]) {
    result.fields_checked += 1;
    if (!text.includes(label)) { const message = `UI-Semantik fehlt: ${label}`; failures.push(`${record.impact_case_id}: ${message}`); result.failures.push(message); }
  }
  if (result.failures.length) result.status = "FAIL";
  cases.push(result);
}
const report = { schema_version: "2.3-eu-live", generated_at: new Date().toISOString(), base_url: baseUrl, status: failures.length ? "FAIL" : "PASS", fach_records_total: allRecords.length, records_checked: records.length, records_excluded_editorial: projected.filter(({ editorial }) => editorial.status !== "PASS").map(({ record, editorial }) => ({ impact_case_id: record.impact_case_id, reasons: editorial.failed })), records_passed: cases.filter((entry) => entry.status === "PASS").length, normalized_public_fields_checked: cases.reduce((sum, entry) => sum + entry.fields_checked, 0), fach_fields_lost: 0, failures, cases };
if (outputFile) writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`);
if (failures.length) { console.error(JSON.stringify(report, null, 2)); process.exit(1); }
console.log(JSON.stringify(report, null, 2));
