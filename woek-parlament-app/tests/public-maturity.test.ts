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
  assert.ok(maturity.assessableNow.some((entry) => entry.includes("Zielzustand kann sich verbessern")));
  assert.ok(maturity.assessableNow.every((entry) => !entry.includes(assessment.impactCoreSummary)));
  assert.ok(maturity.openPoints.every((entry) => entry.includes("Konkreter Testfall") || entry.startsWith("Noch nicht beobachtbar")));
  assert.equal(maturity.layers.find((entry) => entry.id === "impact")?.status, "AVAILABLE");
  assert.equal(maturity.layers.find((entry) => entry.id === "goal")?.status, "PENDING");
  assert.equal(maturity.layers.find((entry) => entry.id === "recommendation")?.status, "PENDING");
});

test("reviewed Common-Targets layers do not remain contradictory public open points", () => {
  const maturity = governmentPublicMaturity({
    impact_case_id: "WOEK-IMPACT-BUND-GRUNDSICHERUNG-2026",
    title: "Neue Grundsicherung",
    analysis_mode: "IMPACT_REALITY_CHECK",
    publication_analysis_status: "STANDARD_WOEK_ANALYSIS",
    evidence_level: "MEDIUM",
    impact_core_summary: assessment.impactCoreSummary,
    impact_summary: { measurement_priority: "Zustandsänderungen getrennt messen." },
    missing_structured_fields: ["mpd_mapping", "sdg_mapping", "sdg_plus_mapping", "structured_data_needs"],
    competence_review_status: "REVIEWED_CONCRETE",
    reality_check_status: "NOT_YET_OBSERVABLE",
    reality_check_summary: assessment.realityCheckSummary,
    recommendation_status: "APPROVED",
    implementation_status: "IN_FORCE",
    raw_record: {},
  }, assessment, {
    recommendationAvailable: true,
    problemReviewAvailable: true,
    goalReviewAvailable: true,
    reviewedCommonTargetLayers: ["WOEK_MPD", "UN_SDG", "GERMAN_SUSTAINABLE_DEVELOPMENT_STRATEGY_2025"],
  });

  assert.ok(!maturity.openPoints.some((entry) => /Mensch, Planet und Demokratie|SDG-Zuordnung/.test(entry)));
  assert.ok(maturity.openPoints.some((entry) => entry.includes("SDG+-Zuordnung")));
  assert.ok(maturity.openPoints.some((entry) => entry.includes("Prüfung des Datenbedarfs")));
  assert.ok(maturity.openPoints.some((entry) => /ex post belegt|Zustandsänderung/.test(entry)));
  assert.ok(!maturity.openPoints.some((entry) => entry.includes("die strukturierter Datenbedarf")));
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

test("a published problem and goal review remains visible when the impact analysis is not editorially published", () => {
  const maturity = parliamentPublicMaturity({
    slug: "case-review-only",
    plainTitle: "Parlamentarischer Prüfgegenstand",
  }, null, {
    problemReviewAvailable: true,
    goalReviewAvailable: true,
  });

  assert.equal(maturity.primary, "PROBLEM_GOAL_REVIEW_AVAILABLE");
  assert.equal(maturity.layers.find((entry) => entry.id === "problem")?.status, "AVAILABLE");
  assert.equal(maturity.layers.find((entry) => entry.id === "goal")?.status, "AVAILABLE");
  assert.equal(maturity.layers.find((entry) => entry.id === "impact")?.status, "OPEN");
  assert.ok(maturity.openPoints.some((entry) => /weder Neutralität noch Wirkungslosigkeit/.test(entry)));
});

test("portfolio review tokens are translated for public presentation", () => {
  const labelSource = readFileSync("lib/decision-method.ts", "utf8");
  assert.match(labelSource, /PORTFOLIO_HAS_NO_SINGLE_SEPARATELY_VERIFIED_PROBLEM_CLAIM: "für das Gesamtportfolio liegt keine einzelne, separat verifizierte Problembehauptung vor"/);
  const source = readFileSync("app/components/DecisionMethodLayers.tsx", "utf8");
  assert.doesNotMatch(source, /Politische Problemquelle:<\/strong> \{reviewText\(problem\.problem_claim_source\)\}/);
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
    const renderedSource = file.endsWith("GovernmentImpactCase.tsx")
      ? source.slice(source.indexOf("export function GovernmentImpactCase"))
      : source;
    const processMarker = file.endsWith("GovernmentImpactCase.tsx") ? "<GovernmentProcessSection" : "data-woek-process-metadata";
    assert.match(renderedSource, /<PublicMaturity/, file);
    assert.ok(renderedSource.indexOf("<PublicMaturity") < renderedSource.indexOf(processMarker), file);
  }
});

test("fact-only presentation is a publication status, never a WÖk assessment", () => {
  const source = readFileSync("app/components/PublicMaturity.tsx", "utf8");
  const assessmentSource = readFileSync("app/components/OverviewAssessment.tsx", "utf8");
  assert.match(source, /maturity\.primary === "FACT_ONLY"/);
  assert.match(source, /data-woek-fact-only-status="published"/);
  assert.match(source, /WÖk-Wirkungsanalyse noch nicht veröffentlicht/);
  assert.doesNotMatch(assessmentSource, /EditorialReviewAssessment/);
});

test("public glossary links to the canonical central glossary", () => {
  const source = readFileSync("app/components/GlossaryBasics.tsx", "utf8");
  assert.match(source, /https:\/\/wirkungsoekonomie\.de\/begriffe\//);
  assert.doesNotMatch(source, /href="\/begriffe"/);
});
