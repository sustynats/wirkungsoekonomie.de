#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  RLP_COALITION_ROUTE,
  rheinlandPfalzCoalitionAssessment,
  rheinlandPfalzCoalitionAtomicCommitments,
  rheinlandPfalzCoalitionChapters,
  rheinlandPfalzCoalitionCommitmentRegister,
  rheinlandPfalzCoalitionCommitments,
  rheinlandPfalzCoalitionExistingImpactCases,
  rheinlandPfalzCoalitionLifecycle,
  rheinlandPfalzCoalitionQualityLayers,
  rheinlandPfalzCoalitionRelationshipModel,
  rheinlandPfalzCoalitionSources,
} from "../../lib/states/rheinland-pfalz-coalition";

const baseUrl = (process.env.WOEK_RLP_COALITION_BASE_URL ?? "http://127.0.0.1:3018").replace(/\/$/, "");
const output = process.env.WOEK_RLP_COALITION_SOURCE_VS_VIEW_REPORT
  ?? path.resolve("data/autopilot/audit/2.3-remediated/SOURCE-VS-VIEW-RLP-COALITION-2026-2031.json");
const sourceFiles = [
  "data/states/rheinland-pfalz-coalition-commitments.json",
  "lib/states/rheinland-pfalz-coalition.ts",
  "app/components/states/RheinlandPfalzCoalitionReview.tsx",
  "app/components/states/StateCoalitionCommitmentInventory.tsx",
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
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
    .normalize("NFKC");
}

async function fetchRoute(route: string) {
  const response = await fetch(`${baseUrl}${route}`, { signal: AbortSignal.timeout(60_000) });
  return { route, status: response.status, html: await response.text() };
}

async function main() {
  const sourceRoutes = rheinlandPfalzCoalitionSources.map((source) => `/quellen/${sourceSlug(source.url)}`);
  const requiredRoutes = [RLP_COALITION_ROUTE, ...sourceRoutes];
  const pages = new Map<string, Awaited<ReturnType<typeof fetchRoute>>>();
  for (const route of requiredRoutes) pages.set(route, await fetchRoute(route));

  const failures: string[] = [];
  const requiredContentPaths: string[] = [];
  const renderedContentPaths: string[] = [];
  const mainPage = pages.get(RLP_COALITION_ROUTE)!;
  const mainText = visible(mainPage.html);
  if (mainPage.status !== 200) failures.push(`${RLP_COALITION_ROUTE}:HTTP_${mainPage.status}`);

  function verify(pointer: string, value: string | null | undefined) {
    if (!value?.trim()) return;
    const contentPath = `RLP-COALITION-2026-2031:${pointer}`;
    requiredContentPaths.push(contentPath);
    if (mainText.includes(value.normalize("NFKC"))) renderedContentPaths.push(contentPath);
    else failures.push(`${contentPath}:NOT_RENDERED`);
  }

  for (const [field, value] of Object.entries(rheinlandPfalzCoalitionAssessment)) {
    if (field !== "directionKind") verify(`/assessment/${field}`, String(value));
  }
  for (const chapter of rheinlandPfalzCoalitionChapters) {
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
  rheinlandPfalzCoalitionQualityLayers.forEach((layer, index) => {
    verify(`/quality_layers/${index}/title`, layer.title);
    verify(`/quality_layers/${index}/text`, layer.text);
  });
  for (const [field, value] of Object.entries(rheinlandPfalzCoalitionRelationshipModel)) verify(`/relationship_model/${field}`, value);
  for (const record of rheinlandPfalzCoalitionCommitments) {
    verify(`/commitments/${record.commitment_id}/id`, record.commitment_id);
    verify(`/commitments/${record.commitment_id}/text`, record.commitment_text);
    verify(`/commitments/${record.commitment_id}/source_locator`, record.source_locator);
  }
  rheinlandPfalzCoalitionLifecycle.forEach((step, index) => verify(`/lifecycle/${index}`, step));
  for (const impactCase of rheinlandPfalzCoalitionExistingImpactCases) verify(`/existing_impact_cases/${impactCase.id}/title`, impactCase.title);

  for (const route of sourceRoutes) {
    const page = pages.get(route)!;
    if (page.status !== 200) failures.push(`${route}:HTTP_${page.status}`);
    const text = visible(page.html);
    if (!text.includes("Für diese Analysen verwendet")) failures.push(`${route}:REVERSE_USAGE_MISSING`);
    if (!text.includes("Originalquelle öffnen")) failures.push(`${route}:ORIGINAL_LINK_MISSING`);
    if (!text.includes("Koalitionsvertrag Rheinland-Pfalz 2026–2031")) failures.push(`${route}:ANALYSIS_USAGE_MISSING`);
  }

  const missingRecordIdsRendered = rheinlandPfalzCoalitionCommitmentRegister.missing_declared_record_ids.filter((id) => mainText.includes(id));
  if (missingRecordIdsRendered.length) failures.push(`MISSING_RECORDS_SYNTHESIZED:${missingRecordIdsRendered.join(",")}`);
  const invariants = {
    ALL_NINE_CHAPTERS_HIGH_MATERIALITY_REVIEWED: rheinlandPfalzCoalitionChapters.length === 9
      && rheinlandPfalzCoalitionChapters.every((chapter) => chapter.maturity === "HIGH_MATERIALITY_REVIEW"),
    EXACT_EXPLICIT_SOURCE_RECORD_TRANSFER: rheinlandPfalzCoalitionCommitments.length === 302
      && rheinlandPfalzCoalitionAtomicCommitments.length === 302
      && rheinlandPfalzCoalitionCommitmentRegister.source_record_count === 302,
    DECLARED_HANDOFF_GAP_FAILS_CLOSED: rheinlandPfalzCoalitionCommitmentRegister.handoff_record_gap_count === 9
      && rheinlandPfalzCoalitionCommitmentRegister.missing_declared_record_ids.length === 9
      && missingRecordIdsRendered.length === 0,
    CHAPTERS_THREE_TO_NINE_REVIEWED_WITHOUT_SYNTHETIC_ATOMICS: rheinlandPfalzCoalitionCommitmentRegister.chapter_counts
      .filter((entry) => entry.chapter >= 3).every((entry) => entry.atomic_commitments === 0),
    NO_ARTIFICIAL_OVERALL_DIRECTION: mainText.includes("keine belastbare einheitliche Wirkungsrichtung")
      && mainText.includes("weder zu einer Koalitionsnote noch zu einer Ampel oder einem Durchschnitt verrechnet"),
    PROVENANCE_GUARD_VISIBLE: mainText.includes("byte-identische signierte Endfassung ist nicht nachgewiesen"),
    FOUR_EXISTING_IMPACT_CASES_REUSED: rheinlandPfalzCoalitionExistingImpactCases.length === 4
      && rheinlandPfalzCoalitionExistingImpactCases.every((record) => mainText.includes(record.title)),
    NO_CODEX_RECOMMENDATION: mainText.includes("keine fachlich freigegebene Recommendation")
      && mainText.includes("nicht automatisch zu einer Recommendation zusammengesetzt"),
    SOURCE_INTERMEDIARY_REQUIRED: rheinlandPfalzCoalitionSources.every((source) => mainPage.html.includes(`/quellen/${sourceSlug(source.url)}`))
      && !rheinlandPfalzCoalitionSources.some((source) => mainPage.html.includes(`href=\"${source.url}`)),
    IMPLEMENTATION_IS_NOT_IMPACT: mainText.includes("Umsetzung ist nicht Wirkung"),
    PROBLEM_GOAL_IMPACT_ORDER: mainText.indexOf("Problemportfolio") < mainText.indexOf("Zielportfolio")
      && mainText.indexOf("Zielportfolio") < mainText.indexOf("WÖk-Wirkungsprüfung des Mandatsportfolios"),
    DNS_REFERENCE_NON_CAUSAL: mainText.includes("weder Richtungs- noch Kausalitätsnachweis"),
  };
  for (const [name, passed] of Object.entries(invariants)) if (!passed) failures.push(`invariant:${name}`);

  const rawPublicTokens = ["HIGH_MATERIALITY_REVIEW", "PARTIAL_ANALYSIS_NEEDS_COMPLETION", "PARTY_OFFICIAL_REPUBLISHED_CONTRACT_TEXT", "RecommendationRecord", "funding_status"];
  for (const token of rawPublicTokens) if (mainText.includes(token)) failures.push(`RAW_PUBLIC_TOKEN:${token}`);

  const fullLayers = [
    "PROBLEM_REVIEW", "GOAL_REVIEW", "ACTUAL_IMPACT_ANALYSIS", "DNS_REFERENCE", "RECOMMENDATION",
    "MATERIAL_OMISSIONS", "POLICY_COHERENCE", "DELIVERY_FEASIBILITY", "RESOURCE_FINANCING",
    "SPATIAL_DISTRIBUTION", "INTERNATIONAL_LEAKAGE", "ROBUSTNESS_STRESS_TEST", "REVERSIBILITY_LOCKIN",
    "FALSIFICATION_TRIGGERS", "LIFECYCLE_TRACEABILITY", "VERSION_DELTA", "COVERAGE_SCOPE", "REALITY_CHECK",
  ];
  const unrenderedContentPaths = requiredContentPaths.filter((pointer) => !renderedContentPaths.includes(pointer));
  const report = {
    schema_version: "woek-rlp-coalition-source-vs-view-1.0",
    status: failures.length ? "FAIL" : "PASS",
    source_files: sourceFiles,
    source_hashes: Object.fromEntries(sourceFiles.map((file) => [file, createHash("sha256").update(readFileSync(path.resolve(file))).digest("hex")])),
    fach_version: "RLP_COALITION_2026_2031_ISSUE_240_REVIEWED_SCOPE_WITH_EXACT_302_RECORD_HANDOFF",
    renderer_version: "STATE_COALITION_REVIEWED_SCOPE_RENDERER_20260821",
    records: {
      documents: 1,
      chapters: rheinlandPfalzCoalitionChapters.length,
      source_records: rheinlandPfalzCoalitionCommitments.length,
      atomic_commitments: rheinlandPfalzCoalitionAtomicCommitments.length,
      declared_source_records: rheinlandPfalzCoalitionCommitmentRegister.declared_source_record_count,
      handoff_gap: rheinlandPfalzCoalitionCommitmentRegister.handoff_record_gap_count,
      existing_linked_impact_cases: rheinlandPfalzCoalitionExistingImpactCases.length,
    },
    required_routes: requiredRoutes,
    rendered_routes: [...pages.values()].filter((page) => page.status === 200).map((page) => page.route),
    missing_required_routes: [...pages.values()].filter((page) => page.status !== 200).map((page) => page.route),
    navigation_targets: ["/laender", "/laender/rheinland-pfalz", RLP_COALITION_ROUTE],
    search_targets: [RLP_COALITION_ROUTE],
    sitemap_targets: requiredRoutes,
    analysis_layers_by_object: {
      "RLP-COALITION-2026-2031": fullLayers,
      ...Object.fromEntries(rheinlandPfalzCoalitionChapters.map((chapter) => [`RLP-COALITION-2026-2031-CH${String(chapter.chapter).padStart(2, "0")}`, fullLayers])),
      ...Object.fromEntries(rheinlandPfalzCoalitionCommitments.map((record) => [record.commitment_id, ["SOURCE_COVERAGE", "LIFECYCLE_TRACEABILITY", "COVERAGE_SCOPE"]])),
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
