#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  BW_COALITION_ROUTE,
  badenWuerttembergCoalitionAssessment,
  badenWuerttembergCoalitionChapters,
  badenWuerttembergCoalitionExistingImpactCases,
  badenWuerttembergCoalitionGovernanceReview,
  badenWuerttembergCoalitionLifecycle,
  badenWuerttembergCoalitionQualityLayers,
  badenWuerttembergCoalitionSources,
} from "../../lib/states/baden-wuerttemberg-coalition";

const baseUrl = (process.env.WOEK_BW_COALITION_BASE_URL ?? "http://127.0.0.1:3018").replace(/\/$/, "");
const output = process.env.WOEK_BW_COALITION_SOURCE_VS_VIEW_REPORT
  ?? path.resolve("data/autopilot/audit/2.3-remediated/SOURCE-VS-VIEW-BW-COALITION-2026-2031.json");
const sourceFiles = [
  "lib/states/baden-wuerttemberg-coalition.ts",
  "app/components/states/StateCoalitionReview.tsx",
  "app/laender/[slug]/mandat-und-praxis/page.tsx",
];

function sourceSlug(url: string) {
  return `quelle-${createHash("sha256").update(new URL(url).toString()).digest("hex").slice(0, 16)}`;
}

function visible(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;/g, "–")
    .replace(/&rarr;/g, "→")
    .replace(/\s+/g, " ")
    .trim()
    .normalize("NFKC");
}

async function fetchRoute(route: string) {
  const response = await fetch(`${baseUrl}${route}`, { signal: AbortSignal.timeout(60_000) });
  return { route, status: response.status, html: await response.text() };
}

async function main() {
const sourceRoutes = badenWuerttembergCoalitionSources.map((source) => `/quellen/${sourceSlug(source.url)}`);
const requiredRoutes = [BW_COALITION_ROUTE, ...sourceRoutes];
const pages = new Map<string, Awaited<ReturnType<typeof fetchRoute>>>();
for (const route of requiredRoutes) pages.set(route, await fetchRoute(route));

const failures: string[] = [];
const requiredContentPaths: string[] = [];
const renderedContentPaths: string[] = [];
const mainPage = pages.get(BW_COALITION_ROUTE)!;
const mainText = visible(mainPage.html);

if (mainPage.status !== 200) failures.push(`${BW_COALITION_ROUTE}:HTTP_${mainPage.status}`);

function verify(pointer: string, value: string | null | undefined) {
  if (!value?.trim()) return;
  const contentPath = `BW-COALITION-2026-2031:${pointer}`;
  requiredContentPaths.push(contentPath);
  if (mainText.includes(value.normalize("NFKC"))) renderedContentPaths.push(contentPath);
  else failures.push(`${contentPath}:NOT_RENDERED`);
}

for (const [field, value] of Object.entries(badenWuerttembergCoalitionAssessment)) {
  if (field !== "directionKind") verify(`/assessment/${field}`, String(value));
}
for (const [field, value] of Object.entries(badenWuerttembergCoalitionGovernanceReview.assessment)) {
  if (field !== "directionKind") verify(`/governance_review/assessment/${field}`, String(value));
}
verify("/governance_review/problem_review", badenWuerttembergCoalitionGovernanceReview.problemReview);
verify("/governance_review/goal_review", badenWuerttembergCoalitionGovernanceReview.goalReview);
badenWuerttembergCoalitionGovernanceReview.paths.forEach((governancePath, index) => {
  for (const [field, value] of Object.entries(governancePath)) verify(`/governance_review/paths/${index}/${field}`, String(value));
});
for (const chapter of badenWuerttembergCoalitionChapters) {
  verify(`/chapters/${chapter.chapter}/title`, chapter.title);
  verify(`/chapters/${chapter.chapter}/maturity`, chapter.maturityLabel);
  verify(`/chapters/${chapter.chapter}/problem_review`, chapter.problemReview);
  verify(`/chapters/${chapter.chapter}/goal_review`, chapter.goalReview);
  for (const [field, value] of Object.entries(chapter.assessment)) {
    if (field !== "directionKind") verify(`/chapters/${chapter.chapter}/assessment/${field}`, String(value));
  }
  chapter.findings.forEach((finding, index) => {
    verify(`/chapters/${chapter.chapter}/findings/${index}/title`, finding.title);
    verify(`/chapters/${chapter.chapter}/findings/${index}/text`, finding.text);
  });
}
for (const [index, layer] of badenWuerttembergCoalitionQualityLayers.entries()) {
  verify(`/quality_layers/${index}/title`, layer.title);
  verify(`/quality_layers/${index}/text`, layer.text);
}
for (const [index, step] of badenWuerttembergCoalitionLifecycle.entries()) verify(`/lifecycle/${index}`, step);
for (const impactCase of badenWuerttembergCoalitionExistingImpactCases) {
  verify(`/existing_impact_cases/${impactCase.id}/title`, impactCase.title);
}

for (const route of sourceRoutes) {
  const page = pages.get(route)!;
  if (page.status !== 200) failures.push(`${route}:HTTP_${page.status}`);
  const text = visible(page.html);
  if (!text.includes("Für diese Analysen verwendet")) failures.push(`${route}:REVERSE_USAGE_MISSING`);
  if (!text.includes("Originalquelle öffnen")) failures.push(`${route}:ORIGINAL_LINK_MISSING`);
  if (!text.includes("Koalitionsvertrag Baden-Württemberg 2026–2031") && !text.includes("Kapitel 3: Wissenschaft, Forschung, Kunst und Medien")) failures.push(`${route}:ANALYSIS_USAGE_MISSING`);
}

const deepChapters = badenWuerttembergCoalitionChapters.filter((chapter) => chapter.maturity === "DEEP_REVIEW").map((chapter) => chapter.chapter);
const invariants = {
  ALL_15_CHAPTERS_HIGH_MATERIALITY_REVIEWED: badenWuerttembergCoalitionChapters.length === 15,
  LATEST_DEEP_REVIEW_SCOPE_IS_1_TO_3: JSON.stringify(deepChapters) === JSON.stringify([1, 2, 3]),
  NO_ARTIFICIAL_OVERALL_DIRECTION: mainText.includes("keine künstliche Gesamtrichtung") && mainText.includes("nicht zu einem Durchschnitt, einer Ampel oder einer Koalitionsnote verrechnet"),
  OFFICIAL_LINKED_DRAFT_LABEL_VISIBLE: mainText.includes("internem Entwurfsvermerk") && mainText.includes("keine byte-identische signierte Endfassung behauptet"),
  BUDGET_RESERVATION_VISIBLE: mainText.includes("Haushaltsvorbehalt") && mainText.includes("Finanzierungsstatus bleibt bedingt"),
  OUTCOME_GOVERNANCE_LAYER_VISIBLE: mainText.includes("Vom Mitteleinsatz zum beobachtbaren Zielzustand") && mainText.includes("Outcome-orientierte Haushalts- und Fördersteuerung") && mainText.includes("weniger neue Evaluationspflichten"),
  EXISTING_FIVE_IMPACT_CASES_REUSED: badenWuerttembergCoalitionExistingImpactCases.length === 5
    && new Set(badenWuerttembergCoalitionExistingImpactCases.map((record) => record.id)).size === 5
    && badenWuerttembergCoalitionExistingImpactCases.every((record) => mainText.includes(record.title)),
  NO_CODEX_RECOMMENDATION: mainText.includes("Eine Empfehlung wird nicht technisch erzeugt") && mainText.includes("nicht automatisch zu einer Empfehlung zusammengesetzt"),
  SOURCE_INTERMEDIARY_REQUIRED: badenWuerttembergCoalitionSources.every((source) => mainPage.html.includes(`/quellen/${sourceSlug(source.url)}`)) && !badenWuerttembergCoalitionSources.some((source) => mainPage.html.includes(`href=\"${source.url}`)),
  IMPLEMENTATION_IS_NOT_IMPACT: mainText.includes("Umsetzung ist nicht Wirkung"),
};
for (const [name, passed] of Object.entries(invariants)) if (!passed) failures.push(`invariant:${name}`);

const rawPublicTokens = ["DEEP_REVIEW", "HIGH_MATERIALITY_REVIEW", "PARTIAL_ANALYSIS_NEEDS_COMPLETION", "OFFICIAL_CURRENTLY_LINKED_CONTRACT_TEXT_WITH_DRAFT_LABEL", "RecommendationRecord", "Child-ImpactCase", "funding_status"];
for (const token of rawPublicTokens) if (mainText.includes(token)) failures.push(`RAW_PUBLIC_TOKEN:${token}`);

const unrenderedContentPaths = requiredContentPaths.filter((pointer) => !renderedContentPaths.includes(pointer));
const fullLayers = [
  "PROBLEM_REVIEW", "GOAL_REVIEW", "ACTUAL_IMPACT_ANALYSIS", "MATERIAL_OMISSIONS", "POLICY_COHERENCE",
  "DELIVERY_FEASIBILITY", "RESOURCE_FINANCING", "SPATIAL_DISTRIBUTION", "INTERNATIONAL_LEAKAGE",
  "ROBUSTNESS_STRESS_TEST", "REVERSIBILITY_LOCKIN", "FALSIFICATION_TRIGGERS", "LIFECYCLE_TRACEABILITY",
  "VERSION_DELTA", "COVERAGE_SCOPE", "REALITY_CHECK",
];
const report = {
  schema_version: "woek-bw-coalition-source-vs-view-1.0",
  status: failures.length ? "FAIL" : "PASS",
  source_files: sourceFiles,
  source_hashes: Object.fromEntries(sourceFiles.map((file) => [file, createHash("sha256").update(readFileSync(path.resolve(file))).digest("hex")])),
  fach_version: "BW_COALITION_2026_2031_ISSUE_239_BATCHES_1_TO_4_WITH_DEEP_REVIEWS_1_TO_3",
  renderer_version: "STATE_COALITION_REVIEW_20260821",
  records: { documents: 1, chapters: badenWuerttembergCoalitionChapters.length, deep_chapters: deepChapters.length, existing_linked_impact_cases: badenWuerttembergCoalitionExistingImpactCases.length },
  required_routes: requiredRoutes,
  rendered_routes: [...pages.values()].filter((page) => page.status === 200).map((page) => page.route),
  missing_required_routes: [...pages.values()].filter((page) => page.status !== 200).map((page) => page.route),
  navigation_targets: ["/laender", "/laender/baden-wuerttemberg", BW_COALITION_ROUTE],
  search_targets: [BW_COALITION_ROUTE],
  sitemap_targets: requiredRoutes,
  analysis_layers_by_object: {
    "BW-COALITION-2026-2031": fullLayers,
    ...Object.fromEntries(badenWuerttembergCoalitionChapters.map((chapter) => [`BW-COALITION-2026-2031-CH${String(chapter.chapter).padStart(2, "0")}`, chapter.maturity === "DEEP_REVIEW" ? fullLayers : ["PROBLEM_REVIEW", "GOAL_REVIEW", "ACTUAL_IMPACT_ANALYSIS", "COVERAGE_SCOPE", "REALITY_CHECK"]])),
  },
  required_content_paths: requiredContentPaths,
  rendered_content_paths: renderedContentPaths,
  unrendered_content_paths: unrenderedContentPaths,
  invariants,
  failures,
};
mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ status: report.status, routes: `${report.rendered_routes.length}/${report.required_routes.length}`, content: `${renderedContentPaths.length}/${requiredContentPaths.length}`, output }, null, 2));
if (failures.length) {
  console.error(failures.slice(0, 100).join("\n"));
  process.exitCode = 1;
}
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
