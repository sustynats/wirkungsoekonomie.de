import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  assessmentOnlyPublicMaturity,
  factOnlyPublicMaturity,
  governmentPublicMaturity,
  parliamentPublicMaturity,
} from "../lib/presentation/public-maturity";

const assessment = {
  assessmentLabel: "Positives Potenzial unter klaren Bedingungen",
  impactCoreSummary: "Ein präziser Mechanismus verändert einen konkret benannten Zustand.",
  editorialSummary: "Die veröffentlichte Einordnung nennt Potenzial, Risiko und Bedingung fallspezifisch.",
  keyFinding: "DIE BEDINGUNG ENTSCHEIDET",
  evidenceSummary: "Eine konkrete Quelle trägt den Mechanismus, nicht aber eine eingetretene Netto-Wirkung.",
  realityCheckSummary: "Noch nicht beobachtbar.",
};

test("an assessment remains public while separate layers stay open", () => {
  const maturity = governmentPublicMaturity({
    impact_case_id: "case-1",
    title: "Konkreter Testfall",
    analysis_mode: "IMPACT_POTENTIAL_EX_ANTE",
    publication_analysis_status: "FULL_WOEK_ANALYSIS",
    evidence_level: "MEDIUM",
    impact_core_summary: assessment.impactCoreSummary,
    impact_summary: {
      strongest_positive_potential: "Der Zielzustand kann sich verbessern.",
      main_risk_or_tradeoff: "Der Gegenmechanismus kann das Potenzial abschwächen.",
      measurement_priority: "Zielzustand und Gegenmechanismus getrennt messen.",
    },
    missing_structured_fields: [],
    competence_review_status: "REVIEWED_CONCRETE",
    reality_check_status: "NOT_YET_OBSERVABLE",
    reality_check_summary: assessment.realityCheckSummary,
    recommendation_status: "BACKFILL_REQUIRED",
    implementation_status: "PROMULGATED",
    raw_record: {},
  }, assessment);

  assert.equal(maturity.primary, "ASSESSMENT_AVAILABLE_WITH_OPEN_POINTS");
  assert.ok(maturity.assessableNow.some((entry) => entry.includes("präziser Mechanismus")));
  assert.ok(maturity.openPoints.every((entry) => entry.includes("Konkreter Testfall") || entry.startsWith("Noch nicht beobachtbar")));
  assert.equal(maturity.layers.find((entry) => entry.id === "impact")?.status, "AVAILABLE");
  assert.equal(maturity.layers.find((entry) => entry.id === "goal")?.status, "PENDING");
  assert.equal(maturity.layers.find((entry) => entry.id === "recommendation")?.status, "PENDING");
});

test("an ex-ante parliamentary assessment is not presented as observed impact", () => {
  const maturity = parliamentPublicMaturity({
    slug: "case-2",
    plainTitle: "Parlamentarischer Testfall",
    publicWorkingAct: {
      maturity: "EX_ANTE",
      dataGaps: ["Messwert nach Inkrafttreten"],
      counterfactualQuestions: ["Was wäre ohne die Maßnahme geschehen?"],
      editorialSummary: { whatIsKnown: "Der Wirkmechanismus ist fachlich beschrieben." },
    },
  }, assessment);

  assert.equal(maturity.primary, "EX_ANTE_POTENTIAL_ONLY");
  assert.ok(maturity.flags.includes("REALITY_CHECK_PENDING"));
  assert.ok(maturity.flags.includes("ATTRIBUTION_OPEN"));
  assert.ok(maturity.openPoints.some((entry) => entry.includes("noch keine fachlich freigegebene ex-post Wirkungsbeobachtung")));
});

test("fact-only and assessment-only projections fail closed without inventing a direction", () => {
  const fact = factOnlyPublicMaturity("Faktenfall");
  const partial = assessmentOnlyPublicMaturity("Analysefall", assessment);

  assert.equal(fact.primary, "FACT_ONLY");
  assert.match(fact.compactHint, /weder als neutral noch als wirkungslos/);
  assert.equal(fact.layers.find((entry) => entry.id === "impact")?.status, "OPEN");
  assert.equal(partial.primary, "ASSESSMENT_AVAILABLE_WITH_OPEN_POINTS");
  assert.equal(partial.layers.find((entry) => entry.id === "impact")?.status, "AVAILABLE");
  assert.equal(partial.layers.find((entry) => entry.id === "goal")?.status, "PENDING");
});

test("public maturity is rendered before process metadata on every preview family", () => {
  for (const file of [
    "app/components/CaseCard.tsx",
    "app/components/government/GovernmentActionCard.tsx",
    "app/components/government/GovernmentImpactCase.tsx",
    "app/components/eu/EuImpactCase.tsx",
    "app/suche/ParliamentSearch.tsx",
    "app/mandat-und-praxis/page.tsx",
    "app/mandat-und-praxis/[sourceKey]/page.tsx",
    "app/laender/sachsen-anhalt/page.tsx",
    "app/quellen/[slug]/page.tsx",
    "app/fachanalysen/page.tsx",
  ]) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /<PublicMaturity/, file);
    assert.ok(source.indexOf("<PublicMaturity") < source.indexOf("data-woek-process-metadata"), file);
  }
});

test("public glossary links to the canonical central glossary", () => {
  const source = readFileSync("app/components/GlossaryBasics.tsx", "utf8");
  assert.match(source, /https:\/\/wirkungsoekonomie\.de\/begriffe\//);
  assert.doesNotMatch(source, /href="\/begriffe"/);
});
