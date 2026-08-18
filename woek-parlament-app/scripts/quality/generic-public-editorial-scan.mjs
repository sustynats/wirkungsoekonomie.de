#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  findGenericProjectionPatterns,
  isGenericPublicEditorialText,
  projectEuEditorial,
  projectGovernmentEditorial,
  projectParliamentEditorial,
} from "../../lib/publication/public-editorial-projection.mjs";

const root = process.cwd();
const baseUrl = (process.env.WOEK_EDITORIAL_SCAN_BASE_URL ?? "").replace(/\/$/, "");
const outputFile = process.env.WOEK_EDITORIAL_SCAN_REPORT
  ?? path.join(root, "data", "autopilot", "audit", "2.3-remediated", "GENERIC-PUBLIC-EDITORIAL-SCAN-2.3.json");
const headers = process.env.WOEK_SOURCE_VS_VIEW_COOKIE ? { cookie: process.env.WOEK_SOURCE_VS_VIEW_COOKIE } : {};

const readJson = (file) => JSON.parse(readFileSync(path.join(root, file), "utf8"));
const readJsonl = (file) => readFileSync(path.join(root, file), "utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse);
const source = (file) => readFileSync(path.join(root, file), "utf8");

const government = readJsonl("data/government/impact-cases/public-impact-records.jsonl")
  .map((record) => ({ id: record.impact_case_id, title: record.title, route: `/regierung/wirkungsanalysen/${encodeURIComponent(record.impact_case_id)}`, fields: projectGovernmentEditorial(record).fields }));
const euAll = readJsonl("data/eu/impact-cases/public-impact-records.jsonl")
  .map((record) => ({ record, projection: projectEuEditorial(record) }));
const eu = euAll.filter(({ projection }) => projection.status === "PASS")
  .map(({ record, projection }) => ({ id: record.impact_case_id, title: record.title, route: `/eu/wirkungsfaelle/${encodeURIComponent(record.impact_case_id)}`, fields: projection.fields }));
const parliamentAll = readJson("data/public-working-acts.json");
const overrides = readJson("data/presentation/overview-assessment-overrides.json").records;
const parliament = parliamentAll.flatMap((record) => {
  const override = overrides[record.slug];
  const projection = override ? {
    status: "PASS",
    fields: {
      overview_assessment_label: override.overview_assessment_label,
      impact_core_summary: override.impact_core_summary,
      editorial_summary: override.editorial_summary,
      evidence_summary: override.evidence_summary,
      key_finding: override.key_finding,
      reality_check_summary: override.reality_check_summary,
    },
  } : projectParliamentEditorial(record);
  return projection.status === "PASS" ? [{ id: record.slug, title: record.plainTitle, route: `/entscheidungen/${record.slug}`, fields: projection.fields }] : [];
});
const projections = [...government, ...eu, ...parliament];

const knownFallbacks = [
  /Die Fallakte wird auf Grundlage der amtlichen Unterlagen strukturiert\.?/i,
  /Wirkpfade und Risiken sind aus den vorliegenden amtlichen Quellen strukturiert\.?/i,
  /Der kompakte Fachdatensatz enthält noch keine vollständig strukturierte/i,
  /Die Akte ist in der ausgewiesenen Reifestufe öffentlich nutzbar/i,
  /\b(?:\x6c\x6f\x72\x65\x6d \x69\x70\x73\x75\x6d|\x74\x62\x64|\x74\x6f\x64\x6f|\x63\x6f\x6d\x69\x6e\x67 \x73\x6f\x6f\x6e)\b/i,
];
const rawEnum = /\b(?:POSITIVE_POTENTIAL|NEGATIVE_RISK|AMBIVALENT|OPEN|PORTFOLIO_DISAGGREGATION_REQUIRED|NO_ROBUST_OVERALL_DIRECTION|NOT_YET_OBSERVABLE|OBSERVATION_ONLY|PLAUSIBLE_CONTRIBUTION|PARTIAL_ATTRIBUTION|CAUSAL_EVIDENCE|CONFLICTING_EVIDENCE|NOT_ASSESSABLE)\b/;
const fieldFailures = [];
for (const entry of projections) {
  for (const [field, value] of Object.entries(entry.fields)) {
    if (!String(value ?? "").trim()) fieldFailures.push(`${entry.id}:${field}:EMPTY`);
    if (knownFallbacks.some((pattern) => pattern.test(String(value)))) fieldFailures.push(`${entry.id}:${field}:GENERIC`);
    if (rawEnum.test(String(value))) fieldFailures.push(`${entry.id}:${field}:RAW_ENUM`);
  }
  if (String(entry.fields.overview_assessment_label).trim() === String(entry.fields.impact_core_summary).trim()) {
    fieldFailures.push(`${entry.id}:ASSESSMENT_EQUALS_IMPACT_CORE`);
  }
  if (isGenericPublicEditorialText(entry.fields.editorial_summary)) fieldFailures.push(`${entry.id}:EDITORIAL_GENERIC`);
  if (isGenericPublicEditorialText(entry.fields.evidence_summary)) fieldFailures.push(`${entry.id}:EVIDENCE_GENERIC`);
}
const similarityFailures = findGenericProjectionPatterns(projections);

function visibleText(html) {
  return html
    .replace(/<details[^>]*class="[^"]*government-technical-proof[^"]*"[^>]*>[\s\S]*?<\/details>/gi, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

function sourceSlug(url) {
  return `quelle-${createHash("sha256").update(new URL(url).toString()).digest("hex").slice(0, 16)}`;
}

const routeChecks = [];
if (baseUrl) {
  const sampleSources = [
    ...government.flatMap((entry) => {
      const record = readJsonl("data/government/impact-cases/public-impact-records.jsonl").find((item) => item.impact_case_id === entry.id);
      return record?.official_fact_sources?.slice(0, 1) ?? [];
    }),
    ...euAll.filter(({ projection }) => projection.status === "PASS").flatMap(({ record }) => record.official_sources?.slice(0, 1) ?? []),
    ...parliamentAll.flatMap((record) => record.sources?.slice(0, 1).map((item) => item.url) ?? []),
  ].filter((url, index, all) => /^https:\/\//.test(url) && all.indexOf(url) === index).slice(0, 12);
  const routes = [...new Set([
    "/", "/bevorstehend", "/entscheidungen", "/wirkungsfaelle", "/regierung", "/regierung/wirkungsanalysen",
    "/eu", "/eu/wirkungsfaelle", "/laender", "/suche", ...projections.map((entry) => entry.route),
    ...sampleSources.map((url) => `/quellen/${sourceSlug(url)}`),
  ])];
  for (const route of routes) {
    const response = await fetch(`${baseUrl}${route}`, { headers, redirect: "manual" });
    const text = response.status === 200 ? visibleText(await response.text()) : "";
    const failures = [];
    if (response.status !== 200) failures.push(`HTTP_${response.status}`);
    if (knownFallbacks.some((pattern) => pattern.test(text))) failures.push("GENERIC_FALLBACK_VISIBLE");
    if (rawEnum.test(text)) failures.push("RAW_ENUM_VISIBLE_OUTSIDE_TECHNICAL_PROOF");
    routeChecks.push({ route, http_status: response.status, status: failures.length ? "FAIL" : "PASS", failures });
  }
}

const components = {
  overview: source("app/components/OverviewAssessment.tsx"),
  caseCard: source("app/components/CaseCard.tsx"),
  governmentCard: source("app/components/government/GovernmentImpactCase.tsx"),
  euCard: source("app/components/eu/EuImpactCase.tsx"),
  decisionDetail: source("app/entscheidungen/[slug]/page.tsx"),
};
const budget = overrides["bt21-dip-c262bf7797f8"];
const liveFailures = routeChecks.filter((entry) => entry.status !== "PASS");
const noGeneric = fieldFailures.length === 0 && similarityFailures.length === 0 && liveFailures.length === 0;
const gates = {
  OVERVIEW_CARD_HAS_VISIBLE_WOEK_ASSESSMENT: /Zusammenfassende WÖk-Bewertung/.test(components.overview) && [components.caseCard, components.governmentCard, components.euCard].every((value) => /<OverviewAssessment/.test(value)),
  PROCESS_BADGE_IS_NOT_USED_AS_ASSESSMENT: !/Vor der Entscheidung geprüft|Beobachtung und Rückkopplung|hohe Prüfrelevanz/i.test(components.overview),
  ASSESSMENT_PRECEDES_PROCESS_METADATA: components.caseCard.indexOf("<OverviewAssessment") < components.caseCard.indexOf("case-card-topline") && components.decisionDetail.indexOf("<OverviewAssessment") < components.decisionDetail.indexOf("decision-process-meta"),
  EDITORIAL_SUMMARY_IS_CASE_SPECIFIC: fieldFailures.every((value) => !value.includes("editorial_summary")) && similarityFailures.every((value) => value.field !== "editorial_summary"),
  EVIDENCE_SUMMARY_IS_CASE_SPECIFIC: fieldFailures.every((value) => !value.includes("evidence_summary")) && similarityFailures.every((value) => value.field !== "evidence_summary"),
  ASSESSMENT_AND_IMPACT_CORE_HAVE_DISTINCT_FUNCTION: fieldFailures.every((value) => !value.includes("ASSESSMENT_EQUALS_IMPACT_CORE")),
  NO_GENERIC_PUBLIC_EDITORIAL_TEXT: noGeneric,
  NO_RAW_INTERNAL_ENUMS_IN_PUBLIC_UI: fieldFailures.every((value) => !value.includes("RAW_ENUM")) && liveFailures.every((value) => !value.failures.includes("RAW_ENUM_VISIBLE_OUTSIDE_TECHNICAL_PROOF")),
  KEY_FINDING_VISIBLE_AND_SPECIFIC: /Key Finding:/.test(components.overview) && fieldFailures.every((value) => !value.includes("key_finding")),
  BUDGET_2027_PORTFOLIO_NOT_FORCED_TO_FAKE_SCORE: budget?.overview_assessment_label === "Keine belastbare einheitliche Wirkungsrichtung ohne Disaggregation." && /heterogene Allokationsarchitektur/.test(budget?.impact_core_summary ?? "") && !/[+-]\d|Gesamtwert|Gesamtnote/.test(JSON.stringify(budget)),
  DETAIL_PAGE_IMPACT_SECTION_PRECEDES_PROCESS: components.decisionDetail.indexOf("<OverviewAssessment") < components.decisionDetail.indexOf("decision-process-meta") && components.governmentCard.indexOf("<OverviewAssessment") < components.governmentCard.indexOf("<FullSchemaDetails"),
  IMPACT_ANALYSIS_IS_PRIMARY_CONTENT: /impactCoreSummary: editorial\.fields\.impact_core_summary/.test(components.governmentCard) && /impactCoreSummary: editorial\.fields\.impact_core_summary/.test(components.euCard),
  GENERIC_PUBLIC_EDITORIAL_SCAN: noGeneric,
};
const failedGates = Object.entries(gates).filter(([, passed]) => !passed).map(([name]) => name);
const report = {
  schema_version: "2.3-final-editorial-p0",
  generated_at: new Date().toISOString(),
  base_url: baseUrl || null,
  status: failedGates.length ? "FAIL" : "PASS",
  counts: {
    government_fach_total: 63,
    government_public: government.length,
    government_review: readJsonl("data/government/impact-cases/review-impact-records.jsonl").length,
    eu_fach_total: euAll.length,
    eu_public: eu.length,
    eu_review: euAll.length - eu.length,
    parliament_public_analyses: parliament.length,
    routes_checked: routeChecks.length,
  },
  gates: Object.fromEntries(Object.entries(gates).map(([name, passed]) => [name, passed ? "PASS" : "FAIL"])),
  failed_gates: failedGates,
  field_failures: fieldFailures,
  similarity_failures: similarityFailures,
  route_failures: liveFailures,
  route_checks: routeChecks,
};
writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (report.status !== "PASS") process.exit(1);
