#!/usr/bin/env node

import { canonicalPortalHref, portalNavigation } from "../../lib/navigation.ts";
import { canonicalAuditUrl } from "./portal-audit-url.mjs";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const baseUrl = (process.env.WOEK_GOLDEN_STATE_BASE_URL ?? "http://127.0.0.1:3018").replace(/\/$/, "");
const outputFile = process.env.WOEK_GOLDEN_STATE_REPORT ?? path.join(process.cwd(), "data", "autopilot", "audit", "2.3-remediated", "GOLDEN-STATE-B07.json");
const expectedLayers = [
  "DNS_REFERENCE", "PROBLEM_REVIEW", "GOAL_REVIEW", "ACTUAL_IMPACT_ANALYSIS", "RECOMMENDATION",
  "COMMON_TARGETS_COMPARISON",
  "MATERIAL_OMISSIONS", "POLICY_COHERENCE", "DELIVERY_FEASIBILITY", "RESOURCE_FINANCING",
  "SPATIAL_DISTRIBUTION", "INTERNATIONAL_LEAKAGE", "ROBUSTNESS_STRESS_TEST",
  "REVERSIBILITY_LOCKIN", "FALSIFICATION_TRIGGERS", "LIFECYCLE_TRACEABILITY",
  "VERSION_DELTA", "COVERAGE_SCOPE", "COMMUNICATION_MEDIA_EFFECTS", "COMMUNICATION_MEDIA_IMPACT", "REALITY_CHECK",
];
const coreRoutes = [
  "/", "/wirkungsfaelle", "/entscheidungen", "/regierung", "/regierung/wirkungsanalysen",
  "/eu", "/eu/wirkungsfaelle", "/laender", "/laender/sachsen-anhalt", "/suche",
  "/methodik", "/methodik/wirkindikatoren", "/transparenz", "/quellen", "/sitemap.xml",
];
const requiredNavigationTargets = ["/", "/suche", "/aktuell/radar-abo", ...portalNavigation.map((item) => item.href)];

function json(file) { return JSON.parse(readFileSync(file, "utf8")); }
function jsonl(file) { return readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)); }
function sha256(file) { return createHash("sha256").update(readFileSync(file)).digest("hex"); }
function text(value) { return String(value ?? "").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim(); }
function nonEmpty(value) { return Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && (typeof value !== "string" || value.trim().length > 0); }
function findField(value, names) {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some((item) => findField(item, names));
  for (const [key, child] of Object.entries(value)) {
    if (names.has(key) && nonEmpty(child)) return true;
    if (findField(child, names)) return true;
  }
  return false;
}
function contentLayerStatus(record, layer) {
  const aliases = {
    MATERIAL_OMISSIONS: ["material_omissions", "materialOmissions"],
    DNS_REFERENCE: ["dns_reference", "dnsReference", "dns_common_targets"],
    PROBLEM_REVIEW: ["problem_review", "problemReview", "root_cause_or_binding_bottleneck"],
    GOAL_REVIEW: ["goal_review", "goalReview"],
    ACTUAL_IMPACT_ANALYSIS: ["impact_analysis", "impactAnalysis", "impact_paths", "impactPaths", "positive_paths", "negative_paths"],
    RECOMMENDATION: ["recommendation_id", "recommendation_status", "recommendation_core_summary"],
    COMMON_TARGETS_COMPARISON: ["common_targets", "commonTargets", "common_target_review_id"],
    POLICY_COHERENCE: ["policy_coherence", "policyCoherence"],
    DELIVERY_FEASIBILITY: ["delivery_feasibility", "deliveryFeasibility"],
    RESOURCE_FINANCING: ["resource_financing", "resourceFinancing", "resource_and_capacity_constraints"],
    SPATIAL_DISTRIBUTION: ["spatial_distribution", "spatialDistribution"],
    INTERNATIONAL_LEAKAGE: ["international_leakage", "internationalLeakage", "rebound_spillover_leakage"],
    ROBUSTNESS_STRESS_TEST: ["robustness_stress_test", "robustnessStressTest"],
    REVERSIBILITY_LOCKIN: ["reversibility_lockin", "reversibilityLockin", "reversibility"],
    FALSIFICATION_TRIGGERS: ["falsification_triggers", "falsificationTriggers", "reality_check_plan"],
    LIFECYCLE_TRACEABILITY: ["lifecycle_traceability", "lifecycleTraceability", "political_lifecycle"],
    VERSION_DELTA: ["version_delta", "versionDelta", "public_change_summary"],
    COVERAGE_SCOPE: ["coverage_scope", "coverageScope", "analysis_scope"],
    COMMUNICATION_MEDIA_EFFECTS: ["communication_media_effects", "communicationMediaEffects", "mediaPatterns"],
    COMMUNICATION_MEDIA_IMPACT: ["communication_media_impact", "communicationMediaImpact", "communication_review_id"],
    REALITY_CHECK: ["reality_check", "realityCheck", "reality_check_status", "reality_check_summary"],
  };
  return findField(record, new Set(aliases[layer])) ? "PRESENT_IN_APPROVED_FACH_RECORD" : "CONTENT_GAP_REQUIRES_FACH_REVIEW";
}
function unique(values) { return [...new Set(values)].sort(); }
function routeWithoutQuery(value) { return canonicalPortalHref(value).split(/[?#]/)[0]; }
async function fetchRoute(route) {
  try {
    const needsBody = route === "/" || route === "/suche" || route === "/sitemap.xml";
    const response = await fetch(canonicalAuditUrl(`${baseUrl}${route}`), { method: needsBody ? "GET" : "HEAD", redirect: "manual", signal: AbortSignal.timeout(15_000) });
    const body = needsBody ? await response.text() : "";
    return { route, status: response.status, body };
  } catch (error) {
    return { route, status: 0, body: "", error: error instanceof Error ? error.message : String(error) };
  }
}
async function mapLimit(values, limit, fn) {
  const results = new Array(values.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (cursor < values.length) {
      const index = cursor++;
      results[index] = await fn(values[index]);
    }
  }));
  return results;
}

const files = {
  publication_sources: "data/generated/release-1/publication-sources.json",
  content_integrity: "data/content-integrity-manifest.json",
  b07_manifest: "data/method/fachvollstaendigkeit-b07-manifest.json",
  government: "data/government/impact-cases/public-impact-records.jsonl",
  eu: "data/eu/impact-cases/public-impact-records.jsonl",
  recommendations: "data/recommendations/public/recommendations.jsonl",
  common_targets: "data/method/public-common-target-reviews.jsonl",
  parliament: "data/public-working-acts.json",
  jurisdictions: "data/political-jurisdictions.json",
  communication_source_vs_view: "data/autopilot/audit/2.3-remediated/SOURCE-VS-VIEW-COMMUNICATION-MEDIA-IMPACT.json",
  communication_restore_audit: "data/state-programmes/communication-media-impact/restore-first-audit-20260820.json",
  strategy_action_plan_source_vs_view: "data/autopilot/audit/2.3-remediated/SOURCE-VS-VIEW-STRATEGY-ACTION-PLAN.json",
  state_coalition_bw_source_vs_view: "data/autopilot/audit/2.3-remediated/SOURCE-VS-VIEW-BW-COALITION-2026-2031.json",
  state_coalition_bw_commitments: "data/states/baden-wuerttemberg-coalition-commitments.json",
  state_coalition_rlp_source_vs_view: "data/autopilot/audit/2.3-remediated/SOURCE-VS-VIEW-RLP-COALITION-2026-2031.json",
  state_coalition_rlp_commitments: "data/states/rheinland-pfalz-coalition-commitments.json",
};
const publicationSources = json(files.publication_sources).documents;
const integrityCases = json(files.content_integrity).cases;
const b07Manifest = json(files.b07_manifest);
const government = jsonl(files.government);
const eu = jsonl(files.eu);
const recommendations = jsonl(files.recommendations);
const commonTargets = jsonl(files.common_targets);
const parliament = json(files.parliament);
const jurisdictions = json(files.jurisdictions).jurisdictions.filter((entry) => entry.jurisdiction_type === "STATE");
const communicationSourceVsView = json(files.communication_source_vs_view);
const strategySourceVsView = json(files.strategy_action_plan_source_vs_view);
const stateCoalitionBwSourceVsView = json(files.state_coalition_bw_source_vs_view);
const stateCoalitionBwCommitments = json(files.state_coalition_bw_commitments);
const stateCoalitionRlpSourceVsView = json(files.state_coalition_rlp_source_vs_view);
const stateCoalitionRlpCommitments = json(files.state_coalition_rlp_commitments);
const communicationRecords = ["afd", "bsw", "cdu", "spd", "gruene", "linke"].map((party) => json(`data/state-programmes/communication-media-impact/ltw-2026-st-${party}.json`));
const stateSlug = new Map([
  ["DE-BW", "baden-wuerttemberg"], ["DE-BY", "bayern"], ["DE-BE", "berlin"], ["DE-BB", "brandenburg"],
  ["DE-HB", "bremen"], ["DE-HH", "hamburg"], ["DE-HE", "hessen"], ["DE-MV", "mecklenburg-vorpommern"],
  ["DE-NI", "niedersachsen"], ["DE-NW", "nordrhein-westfalen"], ["DE-RP", "rheinland-pfalz"], ["DE-SL", "saarland"],
  ["DE-SN", "sachsen"], ["DE-ST", "sachsen-anhalt"], ["DE-SH", "schleswig-holstein"], ["DE-TH", "thueringen"],
]);

const requiredRoutes = unique([
  ...coreRoutes,
  ...publicationSources.map((source) => source.rendered_route),
  ...government.map((record) => `/regierung/wirkungsanalysen/${encodeURIComponent(record.impact_case_id)}`),
  ...eu.map((record) => `/eu/wirkungsfaelle/${encodeURIComponent(record.impact_case_id)}`),
  ...jurisdictions.map((entry) => `/laender/${stateSlug.get(entry.jurisdiction_id)}`),
  ...communicationSourceVsView.required_routes,
  ...strategySourceVsView.required_routes,
  ...stateCoalitionBwSourceVsView.required_routes,
  ...stateCoalitionRlpSourceVsView.required_routes,
]);
const auditRoutes = ["/", "/suche", "/sitemap.xml"];
const routeResults = await mapLimit(auditRoutes, 1, fetchRoute);

const home = routeResults.find((entry) => entry.route === "/")?.body ?? "";
const homeLinks = new Set([...home.matchAll(/href=["']([^"']+)["']/g)].map((match) => match[1].split(/[?#]/)[0] || "/"));
const navigationTargets = requiredNavigationTargets.map((route) => ({ route, present: homeLinks.has(route) }));
const search = routeResults.find((entry) => entry.route === "/suche")?.body ?? "";
const searchTargets = [
  ...government.map((record) => ({ object_id: record.impact_case_id, route: canonicalPortalHref(`/regierung/wirkungsanalysen/${encodeURIComponent(record.impact_case_id)}`), title_present_in_search_payload: search.includes(`href="/ebenen/bundesregierung/wirkungsanalysen/${encodeURIComponent(record.impact_case_id)}"`) })),
  ...parliament.map((record) => ({ object_id: record.publicWorkingAct?.fullReview?.result?.case_id ?? record.slug, route: `/entscheidungen/${record.slug}`, title_present_in_search_payload: search.includes(`href=\"/entscheidungen/${record.slug}\"`) })),
  ...strategySourceVsView.search_targets.map((route) => ({ object_id: route.split("/").at(-1), route, title_present_in_search_payload: search.includes(`href=\"${canonicalPortalHref(route)}\"`) })),
  ...stateCoalitionBwSourceVsView.search_targets.map((route) => ({ object_id: "BW-COALITION-2026-2031", route, title_present_in_search_payload: search.includes(`href=\"${canonicalPortalHref(route)}\"`) })),
  ...stateCoalitionRlpSourceVsView.search_targets.map((route) => ({ object_id: "RLP-COALITION-2026-2031", route, title_present_in_search_payload: search.includes(`href=\"${canonicalPortalHref(route)}\"`) })),
];
const sitemapBody = routeResults.find((entry) => entry.route === "/sitemap.xml")?.body ?? "";
const sitemapUrls = new Set([...sitemapBody.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname));
const sitemapTargets = unique(requiredRoutes.map(routeWithoutQuery).filter((route) => route !== "/sitemap.xml")).map((route) => ({ route, present: sitemapUrls.has(route) }));
const auditedRouteStatus = new Map(routeResults.map((entry) => [routeWithoutQuery(entry.route), entry]));
const renderedRoutes = requiredRoutes.filter((route) => {
  const pathname = routeWithoutQuery(route);
  if (pathname === "/sitemap.xml") return auditedRouteStatus.get(pathname)?.status === 200;
  return sitemapUrls.has(pathname);
});
const missingRequiredRoutes = requiredRoutes.filter((route) => !renderedRoutes.includes(route)).map((route) => {
  const result = auditedRouteStatus.get(routeWithoutQuery(route));
  return { route, status: result?.status ?? 0, error: result?.error ?? (sitemapUrls.has(routeWithoutQuery(route)) ? "HTTP_AUDIT_FAILED" : "MISSING_FROM_SITEMAP") };
});

const requiredContentPaths = unique([
  ...publicationSources.flatMap((source) => source.required_content_paths.map((pointer) => `${source.id}:${pointer}`)),
  ...integrityCases.flatMap((record) => record.required_content_paths.map((pointer) => `${record.case_id}:${pointer}`)),
  ...communicationSourceVsView.required_content_paths,
  ...strategySourceVsView.required_content_paths,
  ...stateCoalitionBwSourceVsView.required_content_paths,
  ...stateCoalitionRlpSourceVsView.required_content_paths,
]);
const renderedContentPaths = unique([
  ...publicationSources.flatMap((source) => source.rendered_content_paths.map((pointer) => `${source.id}:${pointer}`)),
  ...integrityCases.flatMap((record) => record.rendered_content_paths.map((pointer) => `${record.case_id}:${pointer}`)),
  ...communicationSourceVsView.rendered_content_paths,
  ...strategySourceVsView.rendered_content_paths,
  ...stateCoalitionBwSourceVsView.rendered_content_paths,
  ...stateCoalitionRlpSourceVsView.rendered_content_paths,
]);
const unrenderedContentPaths = unique(requiredContentPaths.filter((pointer) => !renderedContentPaths.includes(pointer)));
const recommendationIds = new Set(recommendations.map((record) => record.impact_case_id));
const commonTargetIds = new Set(commonTargets.map((record) => record.impact_case_id));
const analysisLayersByObject = [
  ...government.map((record) => ({ subsystem: "GOVERNMENT", object_id: record.impact_case_id, DNS_COMMON_TARGETS: commonTargetIds.has(record.impact_case_id) ? "PRESENT_IN_APPROVED_FACH_RECORD" : "CONTENT_GAP_REQUIRES_FACH_REVIEW", BETTER_WOEK_OPTION: recommendationIds.has(record.impact_case_id) ? "PRESENT_IN_APPROVED_FACH_RECORD" : "CONTENT_GAP_REQUIRES_FACH_REVIEW", ...Object.fromEntries(expectedLayers.map((layer) => [layer, contentLayerStatus(record, layer)])) })),
  ...eu.map((record) => ({ subsystem: "EU", object_id: record.impact_case_id, DNS_COMMON_TARGETS: "CONTENT_GAP_REQUIRES_FACH_REVIEW", BETTER_WOEK_OPTION: "CONTENT_GAP_REQUIRES_FACH_REVIEW", ...Object.fromEntries(expectedLayers.map((layer) => [layer, contentLayerStatus(record, layer)])) })),
  ...parliament.map((record) => ({ subsystem: "PARLIAMENT", object_id: record.publicWorkingAct?.fullReview?.result?.case_id ?? record.slug, DNS_COMMON_TARGETS: "CONTENT_GAP_REQUIRES_FACH_REVIEW", BETTER_WOEK_OPTION: "CONTENT_GAP_REQUIRES_FACH_REVIEW", ...Object.fromEntries(expectedLayers.map((layer) => [layer, contentLayerStatus(record, layer)])) })),
  ...communicationRecords.map((record) => ({
    subsystem: "STATE_PROGRAMME",
    object_id: record.programme_source_key,
    DNS_COMMON_TARGETS: "PRESENT_IN_APPROVED_PROGRAMME_ANALYSIS",
    BETTER_WOEK_OPTION: "CONTENT_GAP_REQUIRES_FACH_REVIEW",
    ...Object.fromEntries(expectedLayers.map((layer) => [layer, layer === "COMMUNICATION_MEDIA_IMPACT" ? "PRESENT_IN_APPROVED_FACH_RECORD" : contentLayerStatus(record, layer)])),
  })),
  ...Object.entries(strategySourceVsView.analysis_layers_by_object).map(([object_id, layers]) => ({
    subsystem: "GOVERNMENT_STRATEGY",
    object_id,
    DNS_COMMON_TARGETS: "PRESENT_IN_APPROVED_FACH_RECORD",
    BETTER_WOEK_OPTION: "CONTENT_GAP_REQUIRES_FACH_REVIEW",
    ...Object.fromEntries(expectedLayers.map((layer) => [layer, Array.isArray(layers) && layers.includes(layer) ? "PRESENT_IN_APPROVED_FACH_RECORD" : "CONTENT_GAP_REQUIRES_FACH_REVIEW"])),
  })),
  ...Object.entries(stateCoalitionBwSourceVsView.analysis_layers_by_object).map(([object_id, layers]) => ({
    subsystem: "STATE_COALITION_MANDATE",
    object_id,
    DNS_COMMON_TARGETS: "CONTENT_GAP_REQUIRES_FACH_REVIEW",
    BETTER_WOEK_OPTION: "CONTENT_GAP_REQUIRES_FACH_REVIEW",
    ...Object.fromEntries(expectedLayers.map((layer) => [layer, Array.isArray(layers) && layers.includes(layer) ? "PRESENT_IN_APPROVED_FACH_RECORD" : "CONTENT_GAP_REQUIRES_FACH_REVIEW"])),
  })),
  ...Object.entries(stateCoalitionRlpSourceVsView.analysis_layers_by_object).map(([object_id, layers]) => ({
    subsystem: "STATE_COALITION_MANDATE",
    object_id,
    DNS_COMMON_TARGETS: "CONTENT_GAP_REQUIRES_FACH_REVIEW",
    BETTER_WOEK_OPTION: "CONTENT_GAP_REQUIRES_FACH_REVIEW",
    ...Object.fromEntries(expectedLayers.map((layer) => [layer, Array.isArray(layers) && layers.includes(layer) ? "PRESENT_IN_APPROVED_FACH_RECORD" : "CONTENT_GAP_REQUIRES_FACH_REVIEW"])),
  })),
];
const semanticDiff = b07Manifest.semantic_diff_against_accepted_production;
const failures = [
  ...(unrenderedContentPaths.length ? [`unrendered_content_paths:${unrenderedContentPaths.length}`] : []),
  ...(missingRequiredRoutes.length ? [`missing_required_routes:${missingRequiredRoutes.length}`] : []),
  ...(communicationSourceVsView.status === "PASS" ? [] : ["communication_media_source_vs_view"]),
  ...(strategySourceVsView.status === "PASS" ? [] : ["strategy_action_plan_source_vs_view"]),
  ...(stateCoalitionBwSourceVsView.status === "PASS" ? [] : ["state_coalition_bw_source_vs_view"]),
  ...(stateCoalitionRlpSourceVsView.status === "PASS" ? [] : ["state_coalition_rlp_source_vs_view"]),
  ...(stateCoalitionBwCommitments.source_record_count === 1583 ? [] : [`state_coalition_bw_source_records:${stateCoalitionBwCommitments.source_record_count}`]),
  ...(stateCoalitionBwCommitments.atomic_commitment_count === 1577 ? [] : [`state_coalition_bw_atomic_commitments:${stateCoalitionBwCommitments.atomic_commitment_count}`]),
  ...(stateCoalitionBwCommitments.non_counting_parent_containers?.length === 6 ? [] : [`state_coalition_bw_parent_containers:${stateCoalitionBwCommitments.non_counting_parent_containers?.length ?? 0}`]),
  ...(stateCoalitionBwCommitments.explicit_deep_split_flags_remaining === 0 ? [] : [`state_coalition_bw_deep_split_flags:${stateCoalitionBwCommitments.explicit_deep_split_flags_remaining}`]),
  ...(stateCoalitionRlpCommitments.source_record_count === 1254 ? [] : [`state_coalition_rlp_source_records:${stateCoalitionRlpCommitments.source_record_count}`]),
  ...(stateCoalitionRlpCommitments.atomic_commitment_count === 1254 ? [] : [`state_coalition_rlp_atomic_commitments:${stateCoalitionRlpCommitments.atomic_commitment_count}`]),
  ...(stateCoalitionRlpCommitments.handoff_record_gap_count === 0 ? [] : [`state_coalition_rlp_handoff_gap:${stateCoalitionRlpCommitments.handoff_record_gap_count}`]),
  ...navigationTargets.filter((entry) => !entry.present).map((entry) => `navigation:${entry.route}`),
  ...searchTargets.filter((entry) => !entry.title_present_in_search_payload).map((entry) => `search:${entry.object_id}`),
  ...sitemapTargets.filter((entry) => !entry.present).map((entry) => `sitemap:${entry.route}`),
  ...((semanticDiff.government_public_ids_lost ?? []).map((id) => `government_lost:${id}`)),
  ...((semanticDiff.recommendation_ids_lost ?? []).map((id) => `recommendation_lost:${id}`)),
  ...((semanticDiff.common_target_review_ids_lost ?? []).map((id) => `common_target_lost:${id}`)),
  ...((semanticDiff.fach_content_degraded_to_fact_only_or_open ?? []).map((id) => `fach_degraded:${id}`)),
];
const report = {
  schema_version: "woek-golden-state-b07-1.0",
  status: failures.length ? "FAIL" : "PASS",
  required_content_paths: requiredContentPaths,
  rendered_content_paths: renderedContentPaths,
  unrendered_content_paths: unrenderedContentPaths,
  required_routes: requiredRoutes,
  rendered_routes: renderedRoutes,
  missing_required_routes: missingRequiredRoutes,
  navigation_targets: navigationTargets,
  search_targets: searchTargets,
  sitemap_targets: sitemapTargets,
  analysis_layers_by_object: analysisLayersByObject,
  source_hashes: Object.fromEntries(Object.entries(files).map(([name, file]) => [name, sha256(file)])),
  fach_version: b07Manifest.merge_id,
  renderer_version: "B07_RECONCILED_BW_FULL_RLP_REVIEWED_SCOPE_GOLDEN_STATE_RENDERER_20260821",
  semantic_diff_against_last_accepted_production: semanticDiff,
  coverage: { government: government.length, government_strategy_meta: strategySourceVsView.records.meta, government_strategy_missions: strategySourceVsView.records.missions, eu: eu.length, parliament: parliament.length, recommendations: recommendations.length, common_targets: commonTargets.length, states: jurisdictions.length, state_coalition_documents: stateCoalitionBwSourceVsView.records.documents + stateCoalitionRlpSourceVsView.records.documents, state_coalition_chapters: stateCoalitionBwSourceVsView.records.chapters + stateCoalitionRlpSourceVsView.records.chapters, state_coalition_source_records: stateCoalitionBwCommitments.source_record_count + stateCoalitionRlpCommitments.source_record_count, state_coalition_atomic_commitments: stateCoalitionBwCommitments.atomic_commitment_count + stateCoalitionRlpCommitments.atomic_commitment_count, state_coalition_parent_containers: stateCoalitionBwCommitments.non_counting_parent_containers.length, state_coalition_rlp_declared_records: stateCoalitionRlpCommitments.declared_source_record_count, state_coalition_rlp_handoff_gap: stateCoalitionRlpCommitments.handoff_record_gap_count, communication_media_impact: communicationRecords.length },
  failures,
};
const publicPayload = JSON.stringify(report);
if (/\/(?:Users|private|tmp)\//.test(publicPayload)) report.failures.push("local_path_leak");
report.status = report.failures.length ? "FAIL" : "PASS";
mkdirSync(path.dirname(outputFile), { recursive: true });
writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ status: report.status, routes: `${renderedRoutes.length}/${requiredRoutes.length}`, content_paths: `${renderedContentPaths.length}/${requiredContentPaths.length}`, government: government.length, eu: eu.length, parliament: parliament.length, recommendations: recommendations.length, common_targets: commonTargets.length, states: jurisdictions.length, report: outputFile }, null, 2));
if (report.status !== "PASS") {
  console.error(report.failures.slice(0, 100).join("\n"));
  process.exitCode = 1;
}
