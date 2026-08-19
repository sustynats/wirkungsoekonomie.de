#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { projectEuEditorial } from "../../lib/publication/public-editorial-projection.mjs";

const baseUrl = process.argv.find((value) => value.startsWith("--base-url="))?.slice("--base-url=".length)?.replace(/\/$/, "");
const reportPath = process.argv.find((value) => value.startsWith("--report="))?.slice("--report=".length);
if (!baseUrl) throw new Error("Usage: check-fachvollstaendigkeit-source-vs-view.mjs --base-url=https://… [--report=…]");

const readJsonl = (file) => readFileSync(file, "utf8").trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const reviews = readJsonl("data/method/public-decision-reviews.jsonl");
const targets = readJsonl("data/method/public-common-target-reviews.jsonl");
const b05DeltaIds = new Set(["bt21-dip-f562f80bc03c", "bt21-dip-a035653fbebc", "bt21-dip-8d2a11d412de", "bt21-dip-c262bf7797f8", "bt21-dip-e89615651d49", "bt21-dip-0b72759f3d8c"]);
const governmentPublic = new Set(readJsonl("data/government/impact-cases/public-impact-records.jsonl").map((record) => record.impact_case_id));
const euEditorialExclusions = new Set(readJsonl("data/eu/impact-cases/public-impact-records.jsonl")
  .filter((record) => projectEuEditorial(record).status !== "PASS")
  .map((record) => record.impact_case_id));

function routeFor(id) {
  if (id.startsWith("WOEK-")) return `/regierung/wirkungsanalysen/${encodeURIComponent(id)}`;
  if (id.startsWith("EU-")) return `/eu/wirkungsfaelle/${encodeURIComponent(id)}`;
  return `/entscheidungen/${encodeURIComponent(id)}`;
}

function expectedPublic(id) {
  if (id.startsWith("WOEK-")) return governmentPublic.has(id);
  if (id.startsWith("EU-")) return !euEditorialExclusions.has(id);
  return true;
}

function plainHtml(html) {
  return html
    .replace(/<details\b[^>]*data-woek-technical-proof[^>]*>[\s\S]*?<\/details>/gi, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, value) => String.fromCodePoint(Number(value)))
    .replace(/&#x([0-9a-f]+);/gi, (_, value) => String.fromCodePoint(Number.parseInt(value, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function normalized(value) {
  return value.replace(/[\u00ad\u200b]/g, "").replace(/\s+/g, " ").trim();
}

function publicReviewProse(value) {
  return value
    .replace(/\bReality Check oder neue RecommendationVersion\b/g, "den Reality Check oder eine neue Fassung der WÖk-Handlungsoption")
    .replace(/\bRecommendationVersion\b/g, "Fassung der WÖk-Handlungsoption");
}

function fachProse(value, found = []) {
  if (typeof value === "string") {
    const text = normalized(value);
    if (text.length >= 7
      && !/^https:\/\//i.test(text)
      && !/^\/WOEK\//.test(text)
      && !/^(?:WOEK|MPD|UN-SDG|DNS|GG|BOUNDARY|RESILIENCE|DE|REF|EU-REG)-[A-Z0-9.+-]+$/.test(text)
      && !/^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/.test(text)) found.push(text);
    return found;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => fachProse(entry, found));
    return found;
  }
  if (value && typeof value === "object") Object.values(value).forEach((entry) => fachProse(entry, found));
  return found;
}

function sourceRefs(review) {
  return [...new Set([
    ...(Array.isArray(review.problem_review?.source_refs) ? review.problem_review.source_refs : []),
    ...(Array.isArray(review.goal_review?.source_refs) ? review.goal_review.source_refs : []),
    ...(Array.isArray(review.official_source_refs) ? review.official_source_refs : []),
  ].filter((source) => /^https:\/\//i.test(source)))];
}

function sourceHref(url) {
  const safe = new URL(url).toString();
  return `/quellen/quelle-${createHash("sha256").update(safe).digest("hex").slice(0, 16)}`;
}

const failures = [];
const results = [];
for (const review of reviews) {
  const route = routeFor(review.impact_case_id);
  const response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
  const shouldPublish = expectedPublic(review.impact_case_id);
  if (!shouldPublish) {
    const pass = response.status === 404;
    results.push({ impact_case_id: review.impact_case_id, route, expected: "FAIL_CLOSED_EXCLUSION", status: response.status, pass });
    if (!pass) failures.push(`${review.impact_case_id}: excluded review returned ${response.status}, expected 404`);
    continue;
  }
  const html = await response.text();
  const text = normalized(plainHtml(html));
  const missingProse = [...new Set(fachProse([review.problem_review, review.goal_review]))].filter((entry) => !text.includes(entry));
  const missingSources = sourceRefs(review).map(sourceHref).filter((href) => !html.includes(`href="${href}"`));
  const rawEnums = [...new Set(JSON.stringify([review.problem_review, review.goal_review]).match(/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g) ?? [])].filter((token) => text.includes(token));
  const orderPass = html.indexOf('data-woek-method-layer="problem"') < html.indexOf('data-woek-method-layer="goal"')
    && html.indexOf('data-woek-method-layer="goal"') < html.indexOf('data-woek-method-layer="impact"');
  const pass = response.status === 200 && missingProse.length === 0 && missingSources.length === 0 && rawEnums.length === 0 && orderPass && !html.includes("/WOEK/");
  results.push({ impact_case_id: review.impact_case_id, route, expected: "PUBLIC_REVIEW", status: response.status, missing_prose: missingProse, missing_source_intermediaries: missingSources, raw_enums: rawEnums, order_pass: orderPass, pass });
  if (!pass) failures.push(`${review.impact_case_id}: source-vs-view failed`);
}

for (const review of targets) {
  const route = routeFor(review.impact_case_id);
  const response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
  const html = await response.text();
  const text = normalized(plainHtml(html));
  const publicMappingProse = review.mappings.flatMap((mapping) => [mapping.target_label, mapping.mechanism_rationale, mapping.limitations]);
  const missingProse = [...new Set(fachProse([review.actual_option.label, review.woek_option.label, publicMappingProse, review.hindsight_guard, review.causal_attribution_disclaimer, review.aggregation_rule]).map(publicReviewProse))].filter((entry) => !text.includes(entry));
  const rawIds = [review.common_targets_review_id, review.recommendation_id, ...review.mappings.map((mapping) => mapping.target_reference_id)].filter((id) => text.includes(id));
  const rawEnums = [...new Set(JSON.stringify(review.mappings).match(/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g) ?? [])].filter((token) => text.includes(token));
  const hasMpd = review.mappings.some((mapping) => /^MPD-/.test(mapping.target_reference_id));
  const hasUnSdg = review.mappings.some((mapping) => /^UN-SDG-/.test(mapping.target_reference_id));
  const contradictoryOpenPoints = [
    hasMpd && /Zuordnung zu Mensch, Planet und Demokratie[^.]{0,120}(?:noch nicht|nicht fachlich freigegeben)/i.test(text) ? "MPD" : null,
    hasUnSdg && /SDG-Zuordnung[^.]{0,120}(?:noch nicht|nicht fachlich freigegeben)/i.test(text) ? "UN_SDG" : null,
    /die strukturierter Datenbedarf/i.test(text) ? "GRAMMAR" : null,
  ].filter(Boolean);
  const pass = response.status === 200 && missingProse.length === 0 && rawIds.length === 0 && rawEnums.length === 0 && contradictoryOpenPoints.length === 0 && !html.includes("/WOEK/");
  results.push({ recommendation_id: review.recommendation_id, impact_case_id: review.impact_case_id, route, expected: "PUBLIC_COMMON_TARGETS", status: response.status, missing_prose: missingProse, raw_ids: rawIds, raw_enums: rawEnums, contradictory_open_points: contradictoryOpenPoints, pass });
  if (!pass) failures.push(`${review.recommendation_id}: Common-Targets source-vs-view failed`);
}

const report = {
  schema_version: "woek-fachvollstaendigkeit-source-vs-view-1.0",
  base_url: baseUrl,
  generated_at: new Date().toISOString(),
  problem_goal_total: reviews.length,
  problem_goal_public: results.filter((result) => result.expected === "PUBLIC_REVIEW").length,
  problem_goal_fail_closed: results.filter((result) => result.expected === "FAIL_CLOSED_EXCLUSION").length,
  common_targets_total: targets.length,
  b05_delta: {
    expected: b05DeltaIds.size,
    checked: results.filter((result) => b05DeltaIds.has(result.impact_case_id)).length,
    passed: results.filter((result) => b05DeltaIds.has(result.impact_case_id) && result.pass).length,
  },
  no_contradictory_open_state_for_published_common_target_layer: results
    .filter((result) => result.expected === "PUBLIC_COMMON_TARGETS")
    .every((result) => result.contradictory_open_points.length === 0),
  pass: failures.length === 0,
  failures,
  results,
};
if (reportPath) writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ status: report.pass ? "PASS" : "FAIL", problem_goal: `${report.problem_goal_total}/${report.problem_goal_total}`, common_targets: `${report.common_targets_total}/${report.common_targets_total}`, public: report.problem_goal_public, fail_closed: report.problem_goal_fail_closed, failures }, null, 2));
if (!report.pass) process.exitCode = 1;
