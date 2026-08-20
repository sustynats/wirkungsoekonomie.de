#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const baseUrl = (process.env.WOEK_STRATEGY_BASE_URL ?? "http://127.0.0.1:3018").replace(/\/$/, "");
const output = process.env.WOEK_STRATEGY_SOURCE_VS_VIEW_REPORT ?? path.resolve("data/autopilot/audit/2.3-remediated/SOURCE-VS-VIEW-STRATEGY-ACTION-PLAN.json");
const dataDir = path.resolve("data/government/strategy-impact");
const missionFiles = ["aktionsplan-nachhaltigkeit-2026-missions-01-10.jsonl", "aktionsplan-nachhaltigkeit-2026-missions-11-19.jsonl"];
const overlayFiles = ["reviewed-deep-dives-20260820.json", "reviewed-deep-dives-20260820-batch5.json"];
const files = ["aktionsplan-nachhaltigkeit-2026-meta.md", ...missionFiles, ...overlayFiles];
const metaId = "WOEK-META-BUND-AKTIONSPLAN-NACHHALTIGKEIT-2026";
const missions = missionFiles.flatMap((file) => readFileSync(path.join(dataDir, file), "utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse));
const reviewedOverlays = overlayFiles.flatMap((file) => JSON.parse(readFileSync(path.join(dataDir, file), "utf8")).records);
const reviewedDeepDiveIds = new Set(["WOEK-AKN-2026-M02", "WOEK-AKN-2026-M04", ...reviewedOverlays.map((record) => record.missionId)]);
const expectedExpandedDeepDiveIds = new Set(Array.from({ length: 19 }, (_, index) => `WOEK-AKN-2026-M${String(index + 1).padStart(2, "0")}`));
const routes = [`/regierung/wirkungsanalysen/${encodeURIComponent(metaId)}`, ...missions.map((mission) => `/regierung/wirkungsanalysen/${encodeURIComponent(mission.id)}`)];
const sourceUrls = [
  "https://www.bundesregierung.de/resource/blob/992814/2447318/ce245dd460c58c39c04a87878f68608a/2026-07-16-aktionsplan-nachhaltigkeit-data.pdf?download=1",
  "https://www.bundesregierung.de/breg-de/aktuelles/aktionsplan-nachhaltigkeit-2392096",
  "https://www.bundesregierung.de/breg-de/aktuelles/deutsche-nachhaltigkeitsstrategie-2025-2332540",
  "https://www.verwaltungsvorschriften-im-internet.de/bsvwvbund_21072009_O11313012.htm",
  "https://www.bundesregierung.de/resource/blob/2196306/2253682/2d019561674ad7af4f11e19d4aa4fc71/2024-01-18-sta-nhk-beschluss-vom-27-november-2023-data.pdf?download=1",
  "https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Nachhaltigkeitsindikatoren/Deutsche-Nachhaltigkeit/_inhalt.html",
  "https://www.umweltbundesamt.de/themen/wirtschaft-konsum/umweltfreundliche-beschaffung/datenbank-umweltbezogene-beschaffungskriterien",
  "https://www.umweltbundesamt.de/themen/wirtschaft-konsum/umweltfreundliche-beschaffung/lebenszykluskosten",
];
const sourceRoutes = sourceUrls.map((url) => `/quellen/quelle-${createHash("sha256").update(new URL(url).toString()).digest("hex").slice(0, 16)}`);

function visible(html) { return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().normalize("NFKC"); }
async function fetchRoute(route) { const response = await fetch(`${baseUrl}${route}`, { signal: AbortSignal.timeout(60_000) }); return { route, status: response.status, html: await response.text() }; }

const pages = new Map();
for (const route of [...routes, ...sourceRoutes]) pages.set(route, await fetchRoute(route));
const failures = [];
const requiredContentPaths = [];
const renderedContentPaths = [];
for (const mission of missions) {
  const route = `/regierung/wirkungsanalysen/${encodeURIComponent(mission.id)}`;
  const page = pages.get(route);
  if (page.status !== 200) failures.push(`${route}:HTTP_${page.status}`);
  const text = visible(page.html);
  for (const [pointer, value] of Object.entries({ title: mission.title, target: mission.target, A: mission.path.A, M: mission.path.M, deltaZ: mission.path.delta_Z, R: mission.path.R, risk: mission.risk, ...Object.fromEntries(mission.monitor.map((item, index) => [`monitor_${index}`, item])) })) {
    const contentPath = `${mission.id}:/${pointer}`;
    requiredContentPaths.push(contentPath);
    if (text.includes(String(value).normalize("NFKC"))) renderedContentPaths.push(contentPath); else failures.push(`${contentPath}:NOT_RENDERED`);
  }
  if (text.includes("OPEN_TO_CONTEXT") || text.includes("INITIAL_DRAFT")) failures.push(`${mission.id}:RAW_ENUM`);
  if (!page.html.includes("data-woek-preview-assessment=\"published\"")) failures.push(`${mission.id}:ASSESSMENT_MISSING`);
  if (!reviewedDeepDiveIds.has(mission.id)) {
    const coverageNotice = "Für diese Mission liegt im führenden Fachbestand bislang nur der freigegebene Ex-ante-Kern aus Ziel, Wirkpfad, Risiko und Beobachtungsbedarf vor.";
    const contentPath = `${mission.id}:/coverage/open-review-boundary`;
    requiredContentPaths.push(contentPath);
    if (text.includes(coverageNotice)) renderedContentPaths.push(contentPath); else failures.push(`${contentPath}:NOT_RENDERED`);
  }
}
for (const overlay of reviewedOverlays) {
  const route = `/regierung/wirkungsanalysen/${encodeURIComponent(overlay.missionId)}`;
  const text = visible(pages.get(route).html);
  const fields = {
    assessment_label: overlay.overview.assessmentLabel,
    impact_core: overlay.overview.impactCoreSummary,
    editorial_summary: overlay.overview.editorialSummary,
    key_finding: overlay.overview.keyFinding,
    direction_label: overlay.overview.directionLabel,
    evidence_summary: overlay.overview.evidenceSummary,
    reality_check: overlay.overview.realityCheckSummary,
    official_anchor: overlay.officialAnchor,
    evidence_maturity: overlay.evidenceMaturity,
    problem_status: overlay.problemReview.status,
    problem_text: overlay.problemReview.text,
    problem_bottleneck: overlay.problemReview.bottleneck,
    goal_status: overlay.goalReview.status,
    goal_text: overlay.goalReview.text,
    path_A: overlay.path.A,
    path_M: overlay.path.M,
    path_deltaZ: overlay.path.deltaZ,
    path_R: overlay.path.R,
    recommendation_status: overlay.recommendationStatus,
    ...Object.fromEntries(overlay.qualityLayers.flatMap((layer, index) => [[`layer_${index}_title`, layer.title], [`layer_${index}_text`, layer.text]])),
  };
  for (const [pointer, value] of Object.entries(fields)) {
    if (!value) continue;
    const contentPath = `${overlay.missionId}:/review/${pointer}`;
    requiredContentPaths.push(contentPath);
    if (text.includes(String(value).normalize("NFKC"))) renderedContentPaths.push(contentPath); else failures.push(`${contentPath}:NOT_RENDERED`);
  }
}
for (const route of sourceRoutes) {
  const page = pages.get(route);
  if (page.status !== 200) failures.push(`${route}:HTTP_${page.status}`);
  const text = visible(page.html);
  if (!text.includes("Für diese Analysen verwendet")) failures.push(`${route}:REVERSE_USAGE_MISSING`);
  if (!/Original(?:quelle| öffnen| aufrufen)/i.test(text)) failures.push(`${route}:ORIGINAL_LINK_MISSING`);
}
const metaPage = pages.get(routes[0]);
if (metaPage.status !== 200) failures.push(`${routes[0]}:HTTP_${metaPage.status}`);
const metaText = visible(metaPage.html);
for (const required of ["Überwiegend positives strukturelles Wirkungspotenzial", "DNS 2025 ist Referenzrahmen", "Keine Gesamtnote", "Noch keine beobachtbare Wirkung", "19 getrennte Missionsakten"]) if (!metaText.includes(required)) failures.push(`meta:missing:${required}`);
const invariants = {
  DNS_REFERENCE_IS_NOT_CAUSALITY: !metaText.includes("DNS-Ziel erreicht durch"),
  NO_AGGREGATE_SCORE: metaText.includes("nicht zu einem Netto-Gesamtscore addiert") && metaText.includes("Keine Gesamtnote"),
  ACTION_PLAN_19_OF_19_EXPANDED_FACHREVIEWS: reviewedDeepDiveIds.size === 19
    && [...expectedExpandedDeepDiveIds].every((id) => reviewedDeepDiveIds.has(id))
    && missions.every((mission) => {
      const text = visible(pages.get(`/regierung/wirkungsanalysen/${encodeURIComponent(mission.id)}`).html);
      return !text.includes("Vertiefung noch nicht fachlich veröffentlicht")
        && !text.includes("Initiale Ex-ante-Missionsakte");
    }),
  NO_CODEX_RECOMMENDATION: [...reviewedDeepDiveIds].every((id) => {
    const deepDive = reviewedOverlays.find((record) => record.missionId === id);
    const expected = deepDive?.recommendationStatus ?? (id === "WOEK-AKN-2026-M02" ? "Es wird keine neue WÖk-Handlungsoption aus diesem Review erzeugt." : "Es wird keine WÖk-Handlungsoption aus diesem Review erzeugt.");
    return visible(pages.get(`/regierung/wirkungsanalysen/${encodeURIComponent(id)}`).html).includes(expected);
  }),
};
for (const [name, passed] of Object.entries(invariants)) if (!passed) failures.push(`invariant:${name}`);
const unrenderedContentPaths = requiredContentPaths.filter((item) => !renderedContentPaths.includes(item));
const report = {
  schema_version: "woek-strategy-action-plan-source-vs-view-1.0",
  status: failures.length ? "FAIL" : "PASS",
  source_files: files.map((file) => `data/government/strategy-impact/${file}`),
  source_hashes: Object.fromEntries(files.map((file) => [file, createHash("sha256").update(readFileSync(path.join(dataDir, file))).digest("hex")])),
  fach_version: "DRAFT_2026-07-16",
  renderer_version: "STRATEGY_ACTION_PLAN_20260820",
  records: { meta: 1, missions: missions.length, deep_dives: reviewedDeepDiveIds.size },
  required_routes: [...routes, ...sourceRoutes],
  rendered_routes: [...pages.values()].filter((page) => page.status === 200).map((page) => page.route),
  missing_required_routes: [...pages.values()].filter((page) => page.status !== 200).map((page) => page.route),
  navigation_targets: ["/regierung", "/regierung/wirkungsanalysen"],
  search_targets: routes,
  sitemap_targets: [...routes, ...sourceRoutes],
  analysis_layers_by_object: {
    [metaId]: ["DNS_REFERENCE", "ACTUAL_IMPACT_ANALYSIS", "MATERIAL_OMISSIONS", "POLICY_COHERENCE", "DELIVERY_FEASIBILITY", "RESOURCE_FINANCING", "SPATIAL_DISTRIBUTION", "INTERNATIONAL_LEAKAGE", "ROBUSTNESS_STRESS_TEST", "REVERSIBILITY_LOCKIN", "FALSIFICATION_TRIGGERS", "LIFECYCLE_TRACEABILITY", "VERSION_DELTA", "COVERAGE_SCOPE", "REALITY_CHECK"],
    ...Object.fromEntries(missions.map((mission) => [mission.id, ["DNS_REFERENCE", "ACTUAL_IMPACT_ANALYSIS", "COVERAGE_SCOPE", "REALITY_CHECK", ...(reviewedDeepDiveIds.has(mission.id) ? ["PROBLEM_REVIEW", "GOAL_REVIEW", "MATERIAL_OMISSIONS", "POLICY_COHERENCE", "DELIVERY_FEASIBILITY", "RESOURCE_FINANCING", "SPATIAL_DISTRIBUTION", "INTERNATIONAL_LEAKAGE", "ROBUSTNESS_STRESS_TEST", "REVERSIBILITY_LOCKIN", "FALSIFICATION_TRIGGERS", "LIFECYCLE_TRACEABILITY", "VERSION_DELTA"] : [])]])),
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
if (failures.length) { console.error(failures.slice(0, 100).join("\n")); process.exitCode = 1; }
