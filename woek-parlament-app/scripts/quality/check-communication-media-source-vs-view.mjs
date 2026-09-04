#!/usr/bin/env node

import { canonicalAuditUrl } from "./portal-audit-url.mjs";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const baseUrl = (process.env.WOEK_COMMUNICATION_SOURCE_VS_VIEW_BASE_URL ?? "http://127.0.0.1:3018").replace(/\/$/, "");
const outputFile = process.env.WOEK_COMMUNICATION_SOURCE_VS_VIEW_REPORT ?? path.join(process.cwd(), "data", "autopilot", "audit", "2.3-remediated", "SOURCE-VS-VIEW-COMMUNICATION-MEDIA-IMPACT.json");
const dataDir = path.join(process.cwd(), "data", "state-programmes", "communication-media-impact");
const sourceFiles = ["afd", "bsw", "cdu", "spd", "gruene", "linke"].map((party) => `ltw-2026-st-${party}.json`);

function decode(value) {
  return String(value ?? "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}
function normalized(value) { return decode(value).normalize("NFKC").replace(/[„“”]/g, '"').replace(/[’]/g, "'").replace(/\s+/g, " ").trim(); }
function sourceSlug(url) { return `quelle-${createHash("sha256").update(new URL(url).toString()).digest("hex").slice(0, 16)}`; }
function allPublicStrings(record) {
  const values = [record.overview_assessment_label, record.public_summary, ...record.positive_potentials, ...record.material_risks, record.noncompensation,
    record.evidence.text, record.evidence.mechanism, record.evidence.reach_resonance, record.evidence.observed_outcome, record.evidence.attribution,
    record.coverage_scope, record.assessment_maturity, record.cascade_summary, ...record.open_points];
  for (const pattern of record.patterns) {
    values.push(pattern.title, pattern.source_locator, pattern.communication_unit, pattern.target_or_referent,
      pattern.problem_definition_and_causal_attribution, pattern.ingroup_outgroup_structure, pattern.attention_or_agenda_effect,
      pattern.emotional_activation, pattern.interpretation_effect, pattern.resonance_or_amplification,
      pattern.normalization_or_sayability_shift, pattern.stigmatization_or_dehumanization_review,
      pattern.first_order, pattern.second_order, pattern.third_order, pattern.democratic_resilience_effect,
      ...pattern.protected_interests, pattern.counterfactual, pattern.falsification_recheck_trigger);
  }
  for (const source of record.source_refs) values.push(source.title, source.locator);
  return values.filter((value) => typeof value === "string" && value.trim());
}
const pageCache = new Map();
async function fetchPage(route) {
  if (!pageCache.has(route)) {
    pageCache.set(route, (async () => {
      let lastError = null;
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          const response = await fetch(canonicalAuditUrl(`${baseUrl}${route}`), { redirect: "manual", signal: AbortSignal.timeout(60_000) });
          return { route, status: response.status, html: await response.text() };
        } catch (error) {
          lastError = error;
          if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }
      throw new Error(`Source-vs-View route ${route} failed after 2 attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
    })());
  }
  return pageCache.get(route);
}

const records = sourceFiles.map((file) => ({ file, record: JSON.parse(readFileSync(path.join(dataDir, file), "utf8")) }));
const failures = [];
const requiredContentPaths = [];
const renderedContentPaths = [];
const routeResults = [];
const seenIds = new Set();
for (const { file, record } of records) {
  const route = `/laender/sachsen-anhalt/wahlprogramme/${record.programme_source_key}`;
  const page = await fetchPage(route);
  const visible = normalized(page.html);
  routeResults.push({ route, status: page.status });
  if (page.status !== 200) failures.push(`${record.programme_source_key}:route:${page.status}`);
  if (seenIds.has(record.communication_review_id)) failures.push(`${record.programme_source_key}:duplicate_review_id`);
  seenIds.add(record.communication_review_id);
  if (record.patterns.length !== 5) failures.push(`${record.programme_source_key}:patterns:${record.patterns.length}`);
  if (!page.html.includes('data-woek-analysis-layer="COMMUNICATION_MEDIA_IMPACT"')) failures.push(`${record.programme_source_key}:layer_marker_missing`);
  const sourceUrls = new Set(record.source_refs.map((source) => new URL(source.url).toString()));
  for (const pattern of record.patterns) if (!sourceUrls.has(new URL(pattern.source_url).toString())) failures.push(`${pattern.pattern_id}:source_not_registered`);
  for (const [index, value] of allPublicStrings(record).entries()) {
    const pointer = `${record.communication_review_id}:/public/${index}`;
    requiredContentPaths.push(pointer);
    if (visible.includes(normalized(value))) renderedContentPaths.push(pointer);
    else failures.push(`${record.programme_source_key}:missing_public_text:${String(value).slice(0, 80)}`);
  }
  const allSources = [...record.source_refs, { url: record.fach_source.url }];
  for (const source of allSources) {
    const sourceRoute = `/quellen/${sourceSlug(source.url)}`;
    if (!page.html.includes(`href="${sourceRoute}"`)) failures.push(`${record.programme_source_key}:missing_source_intermediary:${sourceRoute}`);
    const sourcePage = await fetchPage(sourceRoute);
    routeResults.push({ route: sourceRoute, status: sourcePage.status });
    if (sourcePage.status !== 200) failures.push(`${record.programme_source_key}:source_route:${sourceRoute}:${sourcePage.status}`);
    const sourceVisible = normalized(sourcePage.html);
    if (!sourceVisible.includes(normalized(record.public_summary))) failures.push(`${record.programme_source_key}:source_usage_summary_missing:${sourceRoute}`);
    if (!sourcePage.html.includes(`href="${route}#kommunikationswirkung"`)) failures.push(`${record.programme_source_key}:source_usage_link_missing:${sourceRoute}`);
  }
  const rawVisibleLeaks = [record.fach_status, record.restore_classification, record.assessment_icon_kind.toUpperCase(), ...record.patterns.map((pattern) => pattern.frame_or_pattern)]
    .filter((token) => token && visible.includes(token));
  if (rawVisibleLeaks.length) failures.push(`${record.programme_source_key}:raw_internal_values:${rawVisibleLeaks.join(",")}`);
}
const uniqueRoutes = [...new Map(routeResults.map((item) => [item.route, item])).values()];
const unrenderedContentPaths = requiredContentPaths.filter((pointer) => !renderedContentPaths.includes(pointer));
const report = {
  schema_version: "woek-communication-media-source-vs-view-1.0",
  status: failures.length ? "FAIL" : "PASS",
  source_files: sourceFiles.map((file) => `data/state-programmes/communication-media-impact/${file}`),
  records: records.length,
  patterns: records.reduce((sum, item) => sum + item.record.patterns.length, 0),
  required_routes: uniqueRoutes.map((item) => item.route),
  rendered_routes: uniqueRoutes.filter((item) => item.status === 200).map((item) => item.route),
  required_content_paths: requiredContentPaths,
  rendered_content_paths: renderedContentPaths,
  unrendered_content_paths: unrenderedContentPaths,
  gates: {
    COMMUNICATION_MEDIA_IMPACT_SEPARATE_AXIS: failures.every((item) => !item.includes("layer_marker")) ? "PASS" : "FAIL",
    PASSAGE_BOUND_SOURCE_PROVENANCE: failures.every((item) => !item.includes("source_")) ? "PASS" : "FAIL",
    SOURCE_INTERMEDIARY_AND_ANALYSIS_USAGE: failures.every((item) => !item.includes("intermediary") && !item.includes("usage_")) ? "PASS" : "FAIL",
    NO_RAW_INTERNAL_ENUMS_IN_PUBLIC_VIEW: failures.every((item) => !item.includes("raw_internal")) ? "PASS" : "FAIL",
    FULL_FACH_SOURCE_TO_VIEW: unrenderedContentPaths.length === 0 ? "PASS" : "FAIL"
  },
  failures
};
mkdirSync(path.dirname(outputFile), { recursive: true });
writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ status: report.status, records: report.records, patterns: report.patterns, routes: `${report.rendered_routes.length}/${report.required_routes.length}`, content: `${renderedContentPaths.length}/${requiredContentPaths.length}`, report: outputFile }, null, 2));
if (failures.length) { console.error(failures.slice(0, 100).join("\n")); process.exitCode = 1; }
