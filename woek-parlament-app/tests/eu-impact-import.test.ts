import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { projectEuEditorial } from "@/lib/publication/public-editorial-projection.mjs";
import { humanizeSystemValue, isMarkdownSeparatorOnly, publicIndicatorLabel } from "@/lib/presentation/labels";

const records = readFileSync("data/eu/impact-cases/public-impact-records.jsonl", "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const meta = JSON.parse(readFileSync("data/eu/impact-cases/public-impact-records-meta.json", "utf8"));
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

test("EU initial handoff preserves all 21 fach-approved cases without a completeness claim", () => {
  assert.equal(records.length, 21);
  assert.equal(new Set(records.map((record) => record.impact_case_id)).size, 21);
  assert.equal(meta.count, 21);
  assert.equal(meta.editorial_public_count, 21);
  assert.equal(meta.editorial_review_count, 0);
  assert.equal(meta.evidence_overlay_count, 5);
  assert.equal(meta.full_eu_coverage_claimed, false);
  assert.equal(meta.fact_coverage_is_not_impact_coverage, true);
});

test("five reviewed EU evidence overlays are projected exactly without changing Fach directions", () => {
  const expected = new Set(["EU-IMPACT-2026-001", "EU-IMPACT-2026-003", "EU-IMPACT-2026-005", "EU-IMPACT-2026-019", "EU-IMPACT-2026-020"]);
  const expectedDirections: Record<string, string> = {
    "EU-IMPACT-2026-001": "AMBIVALENT",
    "EU-IMPACT-2026-003": "POSITIVE",
    "EU-IMPACT-2026-005": "POSITIVE",
    "EU-IMPACT-2026-019": "POSITIVE",
    "EU-IMPACT-2026-020": "AMBIVALENT",
  };
  const overlays = records.filter((record) => record.editorial_evidence_overlay);
  assert.equal(overlays.length, 5);
  assert.deepEqual(new Set(overlays.map((record) => record.impact_case_id)), expected);
  for (const record of overlays) {
    assert.ok(record.evidence_summary.length >= 180, record.impact_case_id);
    assert.ok(record.reality_check_summary.length >= 120, record.impact_case_id);
    assert.ok(record.source_function.length >= 2, record.impact_case_id);
    assert.ok(record.source_refs.every((url: string) => url.startsWith("https://")), record.impact_case_id);
    assert.ok(record.limitations.length >= 2, record.impact_case_id);
    assert.equal(record.primary_direction, expectedDirections[record.impact_case_id]);
    assert.equal(projectEuEditorial(record).fields.evidence_summary, record.evidence_summary);
    assert.equal(projectEuEditorial(record).fields.reality_check_summary, record.reality_check_summary);
  }
});

test("EU cases retain editorial, competence, evidence and exact Fachtext fields", () => {
  for (const record of records) {
    assert.equal(record.publication_status, "APPROVED_INITIAL_FACHREVIEW");
    assert.ok(record.impact_core_summary.length >= 55, record.impact_case_id);
    assert.ok(record.editorial_summary.length >= 90, record.impact_case_id);
    assert.ok(record.key_finding.length >= 20, record.impact_case_id);
    assert.ok(["POSITIVE", "NEGATIVE", "NEUTRAL", "AMBIVALENT", "OPEN"].includes(record.primary_direction));
    assert.ok(["HIGH", "MEDIUM", "LOW", "NOT_ASSESSABLE"].includes(record.evidence_level));
    assert.ok(record.competence_scope);
    assert.ok(record.official_sources.length > 0);
    assert.ok(record.official_sources.every((url: string) => url.startsWith("https://")));
    assert.equal(hash(record.full_analysis_markdown), record.source_release.case_markdown_sha256);
  }
});

test("inherited EU legislation stays explicit and person or institution scores do not exist", () => {
  assert.ok(records.some((record) => record.inherited_legislative_file === true));
  const payload = JSON.stringify(records);
  for (const forbidden of ["commission_score", "mep_score", "party_score", "person_score", "net_impact_score"]) assert.equal(payload.includes(`"${forbidden}"`), false);
});

test("EU public links route through source intermediary pages", () => {
  const component = readFileSync("app/components/eu/EuImpactCase.tsx", "utf8");
  assert.match(component, /sourceDetailHrefForUrl/);
  assert.doesNotMatch(component, /<a[^>]+href=\{source\}/);
});

test("EU public renderer removes machine values without changing Fach records", () => {
  const industrialAct = records.find((record) => record.impact_case_id === "EU-IMPACT-2026-002");
  assert.ok(industrialAct);
  assert.equal(humanizeSystemValue(industrialAct.competence_scope), "Geteilte EU-Zuständigkeit - Binnenmarkt, Umwelt und Industrie");
  assert.equal(humanizeSystemValue(industrialAct.implementation_route[0]), "Ordentliches Gesetzgebungsverfahren");
  assert.equal(humanizeSystemValue(industrialAct.implementation_route[1]), "Umsetzung durch die Mitgliedstaaten - insbesondere Beschaffung und Genehmigung");
  assert.equal(publicIndicatorLabel("low_carbon_material_share"), "Anteil CO2-armer Materialien in der betroffenen Beschaffung");
  assert.equal(
    projectEuEditorial(industrialAct).fields.reality_check_summary,
    "Noch nicht beobachtbar. Der Reality Check beobachtet dafür den Anteil CO2-armer Materialien in der betroffenen Beschaffung und die reale CO2-Intensität der eingesetzten Materialien.",
  );

  const renderedValues = [
    humanizeSystemValue(industrialAct.competence_scope),
    ...industrialAct.implementation_route.map(humanizeSystemValue),
    ...industrialAct.key_indicators.map(publicIndicatorLabel),
    projectEuEditorial(industrialAct).fields.reality_check_summary,
  ].join(" ");
  assert.doesNotMatch(renderedValues, /realitycheckstatus\s*=|_[A-Z][A-Z0-9_]{3,}|\b[a-z]+_[a-z0-9_]+\b|---/i);
});

test("public full-record renderer humanizes audit enums and suppresses Markdown separator residue", () => {
  const auditedValues = [
    "IMPACT_POTENTIAL_EX_ANTE",
    "PORTFOLIO_EX_ANTE",
    "GOVERNMENT_DRAFT",
    "NO_SINGLE_DIRECTION_ALLOWED",
    "VERY_HIGH",
    "STANDARD_WOEK_ANALYSIS",
    "NOT_ASSESSABLE",
    "NOT_APPLICABLE",
    "BACKFILL_REQUIRED",
    "LIMITED_FACH_RECORD",
    "NOT_STRUCTURED",
    "WATCH",
    "reality_check_status = NOT_YET_OBSERVABLE",
  ];
  const renderedValues = auditedValues.map(humanizeSystemValue).join(" ");
  assert.doesNotMatch(renderedValues, /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b|\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/);
  assert.equal(isMarkdownSeparatorOnly("---"), true);
  assert.equal(isMarkdownSeparatorOnly("***"), true);
  assert.equal(isMarkdownSeparatorOnly("___"), true);
  assert.equal(isMarkdownSeparatorOnly("inhaltlich relevanter Bindestrich"), false);
});
