import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { projectEuEditorial } from "@/lib/publication/public-editorial-projection.mjs";
import { humanizeSystemValue, publicIndicatorLabel } from "@/lib/presentation/labels";

const records = readFileSync("data/eu/impact-cases/public-impact-records.jsonl", "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const meta = JSON.parse(readFileSync("data/eu/impact-cases/public-impact-records-meta.json", "utf8"));
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

test("EU initial handoff preserves all 21 fach-approved cases without a completeness claim", () => {
  assert.equal(records.length, 21);
  assert.equal(new Set(records.map((record) => record.impact_case_id)).size, 21);
  assert.equal(meta.count, 21);
  assert.equal(meta.full_eu_coverage_claimed, false);
  assert.equal(meta.fact_coverage_is_not_impact_coverage, true);
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
