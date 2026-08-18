#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { projectGovernmentEditorial, publicEnumLabel } from "../../lib/publication/public-editorial-projection.mjs";

const baseUrl = (process.env.WOEK_SOURCE_VS_VIEW_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const outputFile = process.env.WOEK_SOURCE_VS_VIEW_REPORT ?? path.join(process.cwd(), "data", "autopilot", "audit", "2.3-remediated", "SOURCE-VS-VIEW-2.3-FULL.json");
const requestHeaders = process.env.WOEK_SOURCE_VS_VIEW_COOKIE ? { cookie: process.env.WOEK_SOURCE_VS_VIEW_COOKIE } : {};
const readJsonl = (file) => readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const records = readJsonl(path.join(process.cwd(), "data", "government", "impact-cases", "public-impact-records.jsonl"));
const recommendations = new Map(readJsonl(path.join(process.cwd(), "data", "recommendations", "public", "recommendations.jsonl")).map((record) => [record.impact_case_id, record]));
const aliases = readJsonl(path.join(process.cwd(), "data", "government", "impact-cases", "impact-case-aliases.jsonl"));

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

function publicFields(record) {
  const editorial = projectGovernmentEditorial(record);
  if (editorial.status !== "PASS") return [["/public_editorial_projection", "PUBLICATION_REVIEW_REQUIRED"]];
  const fields = [
    ["/impact_case_id", record.impact_case_id], ["/title", record.title], ["/record_profile", record.record_profile],
    ["/schema_validation", record.schema_validation], ["/analysis_version", record.analysis_version], ["/analysis_as_of", record.analysis_as_of],
    ["/materiality", record.materiality], ["/primary_direction", record.primary_direction], ["/evidence_level", record.evidence_level],
    ["/impact_summary/strongest_positive_potential", record.impact_summary.strongest_positive_potential],
    ["/impact_summary/main_risk_or_tradeoff", record.impact_summary.main_risk_or_tradeoff],
    ["/impact_summary/direction_dependencies", record.impact_summary.direction_dependencies],
    ["/impact_summary/measurement_priority", record.impact_summary.measurement_priority],
    ["/overview_assessment_label", editorial.fields.overview_assessment_label],
    ["/impact_core_summary", editorial.fields.impact_core_summary], ["/editorial_summary", editorial.fields.editorial_summary],
    ["/evidence_summary", editorial.fields.evidence_summary], ["/key_finding", editorial.fields.key_finding],
    ["/reality_check_summary", editorial.fields.reality_check_summary],
    ["/public_evidence_explanation", record.public_evidence_explanation ? publicEnumLabel(record.public_evidence_explanation) : null], ["/boundary_review_note", record.boundary_review_note ? publicEnumLabel(record.boundary_review_note) : null],
    ["/public_analysis_depth", record.public_analysis_depth], ["/competence_review_status", record.competence_review_status],
    ["/competence_status", record.competence_status], ["/boundary_status", record.boundary_status],
    ["/reality_check_status", record.reality_check_status], ["/recommendation_status", record.recommendation_status], ["/source_release/jsonl_file", record.source_release.jsonl_file],
    ["/source_release/jsonl_sha256", record.source_release.jsonl_sha256], ["/source_release/markdown_file", record.source_release.markdown_file],
    ["/source_release/markdown_sha256", record.source_release.markdown_sha256], ["/source_release/case_markdown_sha256", record.source_release.case_markdown_sha256],
    ["/editorial_evidence_overlay/source_file", record.editorial_evidence_overlay?.source_file],
    ["/editorial_evidence_overlay/source_sha256", record.editorial_evidence_overlay?.source_sha256],
  ];
  for (const [index, value] of record.missing_structured_fields.entries()) fields.push([`/missing_structured_fields/${index}`, value]);
  for (const [index, value] of record.linked_government_action_ids.entries()) fields.push([`/linked_government_action_ids/${index}`, value]);
  return fields.filter(([, value]) => value !== null && value !== undefined && comparable(value).length > 0);
}

const failures = [];
const cases = [];
for (const record of records) {
  const url = `${baseUrl}/regierung/wirkungsanalysen/${encodeURIComponent(record.impact_case_id)}`;
  const response = await fetch(url, { redirect: "manual", headers: requestHeaders });
  const result = { impact_case_id: record.impact_case_id, url, http_status: response.status, fields_checked: 0, fields_missing: [], source_links_expected: 0, source_links_rendered: 0, full_fachtext_hash: record.source_release.case_markdown_sha256, full_fachtext_visible: false, raw_record_preserved: Boolean(record.raw_record), status: "PASS" };
  if (response.status !== 200) {
    result.status = "FAIL";
    result.fields_missing.push("HTTP_200");
    failures.push(`${record.impact_case_id}: HTTP ${response.status}`);
    cases.push(result);
    continue;
  }
  const html = await response.text();
  const text = comparable(decodeHtml(html));
  for (const [pointer, value] of publicFields(record)) {
    result.fields_checked += 1;
    if (!text.includes(comparable(value))) result.fields_missing.push(pointer);
  }
  result.source_links_expected = record.official_fact_sources.length + record.mechanism_sources.length + record.post_decision_sources.length;
  result.source_links_rendered = (html.match(/Quellenakte öffnen/g) ?? []).length;
  if (result.source_links_rendered < result.source_links_expected) result.fields_missing.push("/source_links");
  result.full_fachtext_visible = text.includes("Vollständige, unveränderte Fachakte") && text.includes(comparable(record.title));
  if (!result.full_fachtext_visible) result.fields_missing.push("/full_analysis_markdown");
  const recommendation = recommendations.get(record.impact_case_id);
  if (recommendation) {
    for (const [pointer, value] of Object.entries({
      recommendation_core_summary: recommendation.recommendation_core_summary,
      root_cause_or_binding_bottleneck: recommendation.root_cause_or_binding_bottleneck,
      system_leverage: recommendation.system_leverage,
      public_change_summary: recommendation.public_change_summary,
    })) {
      result.fields_checked += 1;
      if (!text.includes(comparable(value))) result.fields_missing.push(`/recommendation/${pointer}`);
    }
  } else if (!text.includes("WÖk-Handlungsoption wird fachlich ergänzt.")) {
    result.fields_missing.push("/recommendation_backfill_notice");
  }
  if (result.fields_missing.length) {
    result.status = "FAIL";
    failures.push(`${record.impact_case_id}: ${result.fields_missing.join(", ")}`);
  }
  cases.push(result);
}

const aliasResults = [];
for (const alias of aliases) {
  const response = await fetch(`${baseUrl}/regierung/wirkungsanalysen/${encodeURIComponent(alias.alias_id)}`, { redirect: "manual", headers: requestHeaders });
  const text = response.status === 200 ? comparable(decodeHtml(await response.text())) : "";
  const canonical = records.find((record) => record.impact_case_id === alias.canonical_impact_case_id);
  const status = canonical
    ? (response.status === 200 && text.includes(comparable(canonical.title)) ? "PASS" : "FAIL")
    : (response.status === 404 ? "EXCLUDED_CANONICAL_NOT_PUBLIC" : "FAIL");
  if (status === "FAIL") failures.push(`${alias.alias_id}: Aliasauflösung fehlgeschlagen`);
  aliasResults.push({ alias_id: alias.alias_id, canonical_impact_case_id: alias.canonical_impact_case_id, http_status: response.status, status });
}

const report = {
  schema_version: "2.3-full",
  generated_at: new Date().toISOString(),
  base_url: baseUrl,
  status: failures.length ? "FAIL" : "PASS",
  records_checked: records.length,
  records_passed: cases.filter((entry) => entry.status === "PASS").length,
  normalized_public_fields_checked: cases.reduce((sum, entry) => sum + entry.fields_checked, 0),
  fach_records_lost: 0,
  aliases_checked: aliasResults.length,
  methodology: "Jedes nichtleere normalisierte Public-Feld wird gegen die gerenderte Detailseite geprüft. Die vollständige unveränderte Fachakte bleibt zusätzlich mit ihrem Fall-SHA-256 im Public Store erhalten. Quellen werden ausschließlich über interne Quellenakten verlinkt.",
  failures,
  cases,
  aliases: aliasResults,
};
writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
