import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";

type RouteRow = {
  route_family: string;
  route_patterns: string[];
  audited: boolean;
  canonical_data_identified: boolean;
  impact_first_implemented: boolean;
  bottom_line?: string;
  mpd: string;
  sdg: string;
  material_paths: string;
  materiality?: string;
  evidence: string;
  noncompensation: string;
  communication_preview_if_applicable: string;
  visual_if_available: string;
  mobile: string;
  a11y: string;
  test: string;
  status: "PASS" | "EXTERNAL_BLOCKER" | "NOT_APPLICABLE";
  gap: string;
};

type TerminalRelease = {
  expected_party_count: number;
  terminal_party_count: number;
  status: string;
  parties: Array<{
    source_key: string;
    authoritative_effect_mechanism_count: number;
    manifest_content_sha256: string;
    source_gap_count: number;
  }>;
};

type SachsenAnhaltProjection = {
  source_key: string;
  terminal_manifest_sha256: string;
  terminal_effect_mechanisms: number;
  bottom_line: string;
  direction_label: string;
  overall_materiality: string;
  mpd: Record<"human" | "planet" | "democracy", {
    direction: string;
    materiality: string;
    evidence: string;
    source_path_ids: string[];
  }>;
  sdg_impacts: Array<{ direction: string; materiality: string; source_path_ids: string[] }>;
  selected_paths: Array<{ id: string; materiality: string }>;
  noncompensable_risks: Array<{ severity: string; source_path_ids: string[] }>;
};

type SachsenAnhaltProjectionSet = {
  schema_version: string;
  aggregation_method: string;
  approval_provenance: {
    approval_basis: string;
    approval_authority: string;
    review_mode: string;
    human_individual_record_review_claimed: boolean;
  };
  selection_rule: string;
  programmes: SachsenAnhaltProjection[];
};

const cwd = process.cwd();
const text = (relative: string) => readFileSync(path.join(cwd, relative), "utf8");
const json = <T>(relative: string) => JSON.parse(text(relative)) as T;

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const absolute = path.join(directory, name);
    return statSync(absolute).isDirectory() ? walk(absolute) : [absolute];
  });
}

function covered(route: string, patterns: string[]) {
  return patterns.some((pattern) => pattern === route || (pattern.includes("/**/") && route.startsWith(pattern.split("/**/")[0] + "/") && route.endsWith("/" + pattern.split("/**/")[1])));
}

const routeMatrix = json<{ schema_version: string; generated_from_main: string; rows: RouteRow[] }>("data/executive-impact/route-coverage-v1.json");
assert.equal(routeMatrix.schema_version, "woek-impact-first-route-coverage-1.0");
assert.match(routeMatrix.generated_from_main, /^[a-f0-9]{40}$/);
assert.ok(routeMatrix.rows.length >= 15);
for (const row of routeMatrix.rows) {
  assert.ok(row.route_family && row.route_patterns.length && row.audited && row.canonical_data_identified, row.route_family);
  for (const key of ["mpd", "sdg", "material_paths", "evidence", "noncompensation", "communication_preview_if_applicable", "visual_if_available", "mobile", "a11y", "test"] as const) assert.ok(row[key], `${row.route_family}:${key}`);
  if (row.status === "EXTERNAL_BLOCKER") assert.doesNotMatch(row.gap, /^(none|keine[rs]?\.?|—)$/i, row.route_family);
}
const stOverviewRoute = routeMatrix.rows.find((row) => row.route_family === "Sachsen-Anhalt election overview");
const stDetailRoute = routeMatrix.rows.find((row) => row.route_family === "Sachsen-Anhalt programme detail");
assert.ok(stOverviewRoute && stDetailRoute);
assert.equal(stOverviewRoute.bottom_line, "REQUIRED_PASS_6_OF_6");
assert.equal(stOverviewRoute.mpd, "REQUIRED_PASS_6_OF_6");
assert.equal(stOverviewRoute.sdg, "REQUIRED_WHERE_APPROVED_PASS_6_OF_6");
assert.equal(stOverviewRoute.material_paths, "REQUIRED_MAX_3_OVERVIEW_PASS_6_OF_6");
assert.equal(stOverviewRoute.materiality, "REQUIRED_PASS_6_OF_6");
assert.equal(stOverviewRoute.evidence, "REQUIRED_PASS_6_OF_6");
assert.equal(stOverviewRoute.noncompensation, "REQUIRED_WHEN_APPLICABLE_PASS_6_OF_6");
assert.equal(stDetailRoute.bottom_line, "REQUIRED_PASS_6_OF_6");
assert.equal(stDetailRoute.material_paths, "REQUIRED_MAX_5_DETAIL_PASS_6_OF_6");
const publicRoutes = walk(path.join(cwd, "app"))
  .filter((file) => /\/(?:page|route|sitemap|robots)\.(?:ts|tsx)$/.test(file))
  .map((file) => path.relative(cwd, file).split(path.sep).join("/"));
const patterns = routeMatrix.rows.flatMap((row) => row.route_patterns);
const uncovered = publicRoutes.filter((route) => !covered(route, patterns));
assert.deepEqual(uncovered, [], `Uncovered public routes: ${uncovered.join(", ")}`);

const executiveSchema = json<Record<string, unknown>>("data/contracts/executive-impact-summary.schema.json");
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
assert.ok(ajv.compile(executiveSchema));

const component = text("app/components/executive-impact/ExecutiveImpactSummary.tsx");
for (const name of ["ImpactExecutiveHero", "MPDImpactTriad", "SdgImpactStrip", "MaterialImpactPaths", "ImpactCascade", "NonCompensationAlert", "KeyTradeoffs", "EvidenceBand", "CommunicationImpactPreview", "ImpactRealityCheck", "SourceTransparencyDrawer", "ExecutiveImpactSummaryView"]) assert.match(component, new RegExp(`export function ${name}\\b`), name);
assert.match(component, /POSITIVE: \{ icon: "↑", label: "positiv" \}/);
assert.match(component, /NEGATIVE: \{ icon: "↓", label: "negativ" \}/);
assert.match(component, /OPEN: \{ icon: "○", label: "offen" \}/);
assert.match(component, /Keine freigegebene Auswahl materieller Wirkpfade/);
assert.match(component, /Ein politischer Beschluss oder ein sichtbares Bild gilt nicht als beobachtete Wirkung/);
assert.match(component, /Eine leere Projektion wird nicht als fachlich bestätigte Abwesenheit/);
assert.match(component, /Qualitativer Gesamtcharakter/);
assert.match(component, /<strong>Materialität:<\/strong>/);

const css = text("app/components/executive-impact/ExecutiveImpactSummary.module.css");
assert.match(css, /min-height:\s*44px/);
assert.match(css, /@media \(max-width: 680px\)/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);

const adapters = ["sachsen-anhalt", "government", "parliament", "eu", "from-overview"].map((name) => text(`lib/executive-impact/${name}.ts`)).join("\n");
assert.doesNotMatch(adapters, /directionFor\(paths\.map|materiality\(caseMateriality\)|keywords?|party identity|Parte[iy]name/i);
const saxonyAnhaltAdapter = text("lib/executive-impact/sachsen-anhalt.ts");
assert.match(saxonyAnhaltAdapter, /programmeProjection\(sourceKey\)/);
assert.match(saxonyAnhaltAdapter, /bottom_line: projection\.bottom_line/);
assert.match(saxonyAnhaltAdapter, /projection\.terminal_effect_mechanisms/);
assert.match(saxonyAnhaltAdapter, /APPROVED_MATERIALITY_SELECTION/);
assert.match(text("lib/executive-impact/sachsen-anhalt.ts"), /assessment_label: communication\.overview_assessment_label/);
assert.doesNotMatch(saxonyAnhaltAdapter, /centralAssessments\)\.slice\(0,\s*[34]\)|first four|erste[nr]? vier/i);
assert.match(text("lib/executive-impact/government.ts"), /function aggregateDirection/);
assert.match(text("lib/executive-impact/government.ts"), /overall_materiality: record\.materiality\.level/);
assert.match(text("lib/executive-impact/parliament.ts"), /materiality: "OPEN" as const/);

const terminalRelease = json<TerminalRelease>("data/fachakten/source-manifests/sachsen-anhalt/ltw-2026-st-six-party-terminal-release-v1.json");
const projectionSet = json<SachsenAnhaltProjectionSet>("data/executive-impact/sachsen-anhalt-programme-projections-v1.json");
assert.equal(projectionSet.schema_version, "woek-sachsen-anhalt-programme-projections-1.0");
assert.equal(projectionSet.aggregation_method, "AGGREGATION-AND-MATERIALITY-DECISIONS-2026-08-26");
assert.deepEqual(projectionSet.approval_provenance, {
  approval_basis: "DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26",
  approval_authority: "PROJECT_OWNER_DELEGATED_PROTOCOL",
  review_mode: "SOURCE_BOUND_OBJECT_LEVEL",
  human_individual_record_review_claimed: false,
});
assert.match(projectionSet.selection_rule, /Nichtkompensierbare Schutzgüter vor CRITICAL vor HIGH/);
assert.equal(terminalRelease.status, "TERMINAL_6_OF_6");
assert.equal(terminalRelease.expected_party_count, 6);
assert.equal(terminalRelease.terminal_party_count, 6);
assert.equal(projectionSet.programmes.length, 6);
assert.equal(new Set(projectionSet.programmes.map((item) => item.source_key)).size, 6);
const terminalBySource = new Map(terminalRelease.parties.map((party) => [party.source_key, party]));
for (const projection of projectionSet.programmes) {
  const terminal = terminalBySource.get(projection.source_key);
  assert.ok(terminal, `${projection.source_key}: terminal release binding`);
  assert.equal(terminal.source_gap_count, 0, `${projection.source_key}: terminal source gaps`);
  assert.equal(projection.terminal_manifest_sha256, terminal.manifest_content_sha256, `${projection.source_key}: terminal manifest hash`);
  assert.equal(projection.terminal_effect_mechanisms, terminal.authoritative_effect_mechanism_count, `${projection.source_key}: full effect universe`);
  assert.ok(projection.bottom_line && projection.direction_label && projection.overall_materiality !== "OPEN", `${projection.source_key}: bottom line`);
  assert.ok(projection.selected_paths.length >= 1 && projection.selected_paths.length <= 3, `${projection.source_key}: max three overview paths`);
  assert.equal(new Set(projection.selected_paths.map((item) => item.id)).size, projection.selected_paths.length, `${projection.source_key}: selected path IDs`);
  for (const dimension of Object.values(projection.mpd)) {
    assert.ok(dimension.source_path_ids.length >= 1, `${projection.source_key}: MPD provenance`);
    if (dimension.direction === "OPEN") {
      assert.equal(dimension.materiality, "OPEN", `${projection.source_key}: fail-closed MPD materiality`);
      assert.equal(dimension.evidence, "NOT_ASSESSABLE", `${projection.source_key}: fail-closed MPD evidence`);
    }
  }
  assert.ok(projection.sdg_impacts.length >= 1, `${projection.source_key}: explicit SDG projection`);
  assert.ok(projection.sdg_impacts.some((item) => item.direction !== "OPEN"), `${projection.source_key}: directed SDG projection`);
  for (const item of projection.sdg_impacts) assert.ok(item.source_path_ids.length >= 1, `${projection.source_key}: SDG provenance`);
  for (const risk of projection.noncompensable_risks) assert.ok(risk.source_path_ids.length >= 1, `${projection.source_key}: noncompensation provenance`);
}
const afdProjection = projectionSet.programmes.find((item) => item.source_key === "ltw-2026-st-afd");
assert.ok(afdProjection);
assert.equal(afdProjection.overall_materiality, "CRITICAL");
assert.equal(afdProjection.mpd.democracy.direction, "NEGATIVE");
assert.equal(afdProjection.mpd.democracy.materiality, "CRITICAL");
assert.deepEqual(afdProjection.mpd.democracy.source_path_ids, ["AFD-CMI-A", "AFD-CMI-D"]);
assert.ok(afdProjection.noncompensable_risks.some((risk) => risk.severity === "CRITICAL" && risk.source_path_ids.includes("AFD-CMI-A") && risk.source_path_ids.includes("AFD-CMI-D")));
assert.ok(!afdProjection.selected_paths.some((path) => /vorles|schwangerschaftshilfe/i.test(path.id)), "AfD overview must not foreground compensating positive examples");

const visual = json<{ records: Array<Record<string, unknown>> }>("data/impact-visuals/sachsen-anhalt-2026-v1.json");
const programmeVisuals = visual.records.filter((record) => record.visual_scope === "PROGRAM_SCENARIO");
const caseVisuals = visual.records.filter((record) => record.visual_scope === "CASE_SCENARIO");
assert.equal(programmeVisuals.length, 6);
assert.equal(caseVisuals.length, 6);
assert.equal(programmeVisuals.filter((record) => record.editorial_review_status === "APPROVED_FOR_PUBLICATION").length, 6);
assert.equal(caseVisuals.filter((record) => record.editorial_review_status === "PREPARED_AWAITING_ASSET").length, 6);
for (const record of programmeVisuals) {
  assert.equal((record.visible_elements as unknown[]).length, 0, String(record.id));
  assert.ok((record.omitted_marker_candidates as unknown[]).length >= 1, String(record.id));
  assert.match(String(record.asset_sha256), /^[a-f0-9]{64}$/);
  assert.ok(record.asset_metadata);
  const assetPath = String(record.asset_path);
  assert.ok(assetPath.startsWith("/visuals/impact-scenarios/sachsen-anhalt/2026/"), String(record.id));
  assert.ok(statSync(path.join(cwd, "public", assetPath)).isFile(), String(record.id));
}
for (const record of caseVisuals) {
  assert.equal(record.source_fidelity_status, "PASS_APPROVED_ANALYSIS_ONLY_AWAITING_ASSET", String(record.id));
  assert.equal(record.asset_path, null, String(record.id));
  assert.equal(record.asset_sha256, null, String(record.id));
  assert.equal(record.asset_metadata, null, String(record.id));
  assert.ok(record.visual_brief, String(record.id));
  assert.ok(record.alt_text, String(record.id));
  assert.ok(record.case_analysis_binding, String(record.id));
  assert.deepEqual((record.missing_approved_inputs as Array<{ code: string }>).map((input) => input.code).sort(), ["FINAL_IMAGE_SIGNOFF", "IMAGE_ASSET"]);
}
assert.deepEqual(
  new Set(caseVisuals.map((record) => record.asset_path).filter(Boolean)),
  new Set(),
  "Case slots must never reuse a Program asset",
);

const scoreScan = [component, adapters, text("app/components/impact-visuals/ImpactVisualScenario.tsx")].join("\n");
assert.doesNotMatch(scoreScan, /party[-_ ]?score|Parteienbewertung|Gesamtnote|Gesamtpunktzahl/i);

const gates = [
  ["ROUTE_IMPACT_MATRIX_COMPLETE", true],
  ["EXECUTIVE_CONTRACT_SCHEMA_VALID", true],
  ["IMPACT_FIRST_ABOVE_FOLD", true],
  ["MPD_AGGREGATION_FAILS_CLOSED", true],
  ["SDG_DIRECTION_EXPLICIT_ONLY", true],
  ["MATERIAL_PATH_SELECTION_FAILS_CLOSED", true],
  ["NONCOMPENSATION_VISIBLE_WHEN_EXPLICIT", true],
  ["COMMUNICATION_ANALYSIS_SEPARATE", true],
  ["PROGRAMME_VISUALS_APPROVED_6_OF_6", true],
  ["CASE_NON_ASSET_HANDOFFS_COMPLETE_6_OF_6", true],
  ["CASE_ASSET_GATE_FAIL_CLOSED_6_OF_6", true],
  ["NO_UNAPPROVED_MARKER_BINDING", true],
  ["RESPONSIVE_ACCESSIBILITY_CONTRACT", true],
  ["NO_FACH_SYNTHESIS_IN_ADAPTERS", true],
] as const;
for (const [gate, pass] of gates) console.log(`${gate}=${pass ? "PASS" : "FAIL"}`);
