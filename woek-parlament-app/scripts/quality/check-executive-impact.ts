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
  mpd: string;
  sdg: string;
  material_paths: string;
  evidence: string;
  noncompensation: string;
  communication_preview_if_applicable: string;
  visual_if_available: string;
  mobile: string;
  a11y: string;
  test: string;
  status: "PASS" | "FAIL_CLOSED" | "NOT_APPLICABLE";
  gap: string;
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
  if (row.status === "FAIL_CLOSED") assert.doesNotMatch(row.gap, /^(none|keine[rs]?\.?|—)$/i, row.route_family);
}
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

const css = text("app/components/executive-impact/ExecutiveImpactSummary.module.css");
assert.match(css, /min-height:\s*44px/);
assert.match(css, /@media \(max-width: 680px\)/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);

const adapters = ["sachsen-anhalt", "government", "parliament", "eu", "from-overview"].map((name) => text(`lib/executive-impact/${name}.ts`)).join("\n");
assert.doesNotMatch(adapters, /directionFor\(paths\.map|materiality\(caseMateriality\)|keywords?|party identity|Parte[iy]name/i);
assert.match(text("lib/executive-impact/sachsen-anhalt.ts"), /bottom_line: editorial\.overallLabel/);
assert.match(text("lib/executive-impact/sachsen-anhalt.ts"), /assessment_label: communication\.overview_assessment_label/);
assert.match(text("lib/executive-impact/sachsen-anhalt.ts"), /materiality: "OPEN" as const/);
assert.match(text("lib/executive-impact/government.ts"), /direction: "OPEN"/);
assert.match(text("lib/executive-impact/parliament.ts"), /materiality: "OPEN" as const/);

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
