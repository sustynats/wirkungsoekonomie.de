import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { humanizeSystemValue, publicControlText, publicIndicatorLabel, publicNarrativeText, publicObservatoryQualityFieldLabel, publicObservatoryValueLabel, publicSystemLabel, publicSystemValueLabel } from "@/lib/presentation/labels";
import { euPublicMaturity } from "@/lib/presentation/public-maturity";

test("unknown technical values fail closed instead of becoming title-cased public copy", () => {
  assert.equal(publicSystemLabel("UNREVIEWED_SYSTEM_VALUE"), null);
  assert.equal(publicIndicatorLabel("unreviewed_indicator"), null);
  assert.equal(publicControlText("WATCH_HIGH / POSSIBLE_BLOCK depending final design"), null);
  assert.equal(humanizeSystemValue("UNREVIEWED_SYSTEM_VALUE"), "UNREVIEWED_SYSTEM_VALUE");
});

test("reviewed labels remain available without exposing their control values", () => {
  assert.equal(publicSystemLabel("EU_SHARED"), "geteilte EU-Zuständigkeit");
  assert.equal(publicSystemValueLabel("MIXED_EU_SUPPORTING_EXISTING_DIGITAL_INTERNAL_MARKET_RULES"), "Gemischte EU-Zuständigkeit mit unterstützender Rolle auf Grundlage bestehender Binnenmarkt- und Digitalregeln");
  assert.equal(publicSystemValueLabel("STRATEGY_AND_COMMUNICATION"), "Strategie und Mitteilung der Europäischen Kommission");
  assert.equal(publicIndicatorLabel("low_carbon_material_share"), "Anteil CO2-armer Materialien in der betroffenen Beschaffung");
  assert.equal(publicIndicatorLabel("fimi_detection_time"), "Zeit bis zur Erkennung koordinierter Informationsmanipulation");
  assert.equal(publicControlText("reality_check_status = OBSERVATION_ONLY"), "Reality-Check-Status: Beobachtung ohne Zurechnung");
  assert.equal(publicNarrativeText("BLOCK_WITHOUT_OFFSET: Schutzgrenzen bleiben vorrangig."), "Schutzgrenzen bleiben vorrangig.");
  const reviewedSystemValues = {
    EU_ROUTE_WITH_HIGH_FUNDAMENTAL_RIGHTS_CONSTRAINTS: "EU-Umsetzungsweg mit hohen grundrechtlichen Anforderungen",
    COMMISSION_STRATEGY: "Strategie der Europäischen Kommission",
    DSA_EXISTING_ENFORCEMENT: "Vollzug des bestehenden Digital Services Act",
    MEMBER_STATE_AND_CIVIL_SOCIETY_COORDINATION: "Koordination mit Mitgliedstaaten und Zivilgesellschaft",
    EU_SHARED_MIXED: "Gemischte geteilte EU-Zuständigkeit",
    EU_ROUTE_WITH_CONSTRAINTS: "EU-Umsetzungsweg mit rechtlichen und administrativen Anforderungen",
    MEMBER_STATE_ADMINISTRATION_REQUIRED: "Umsetzung durch Verwaltungen der Mitgliedstaaten erforderlich",
    REGIONAL_LOCAL_IMPLEMENTATION: "Regionale und lokale Umsetzung",
    EU_BUDGET_OR_FUNDING: "EU-Haushalt oder EU-Förderung",
    COMMISSION_EXECUTIVE_STRATEGIC: "strategische Exekutivrolle der Europäischen Kommission",
    IMPACT_POTENTIAL_WITH_IMPLEMENTATION_OBSERVATION: "Wirkungspotenzial mit Beobachtung der Umsetzung",
    WATCH_HIGH: "hohe Schutz- und Beobachtungsrelevanz",
  };
  for (const [value, label] of Object.entries(reviewedSystemValues)) assert.equal(publicSystemValueLabel(value), label);
  for (const indicator of ["network_diffusion_after_response", "false_classification_appeals", "independent_oversight", "media_pluralism", "civil_society_operability", "fundamental_rights_cases"]) {
    assert.ok(publicIndicatorLabel(indicator));
  }
});

test("observatory values use reviewed context labels and unknown tokens fail closed", () => {
  assert.equal(publicObservatoryValueLabel("ACTIVE"), "aktiv");
  assert.equal(publicObservatoryValueLabel("EXTERNAL_CONTEXT"), "externer Kontext");
  assert.equal(publicObservatoryValueLabel("PROVISIONAL_UNTIL_OFFICIAL_VALIDATION"), "vorläufig bis zur amtlichen Validierung");
  assert.equal(publicObservatoryValueLabel("NOT_ESTABLISHED"), "nicht nachgewiesen");
  assert.equal(publicObservatoryValueLabel("HIGH"), "hoch");
  assert.equal(publicObservatoryValueLabel("P1"), null);
  assert.equal(publicObservatoryValueLabel("UNREVIEWED_OBSERVATORY_STATUS"), null);
  assert.equal(publicObservatoryQualityFieldLabel("record_classification"), "Einordnung des Rekordstatus");
  assert.equal(publicObservatoryQualityFieldLabel("unknown_quality_field"), null);
});

test("observatory presentation keeps machine identifiers and internal priority out of editorial copy", () => {
  const page = readFileSync("app/wirkungsobservatorium/page.tsx", "utf8");
  const states = readFileSync("app/laender/page.tsx", "utf8");
  assert.doesNotMatch(states, /im aktuellen Staging bereits/);
  assert.match(states, /im aktuellen Portalstand bereits/);
  assert.doesNotMatch(page, /\{outcome\.outcome_series_id\}/);
  assert.doesNotMatch(page, /state_observation_ids\.join/);
  assert.doesNotMatch(page, /\{candidate\.linked_impact_case_id\}/);
  assert.doesNotMatch(page, /humanizeSystemValue\(candidate\.priority\)/);
  assert.match(page, /publicObservatoryValueLabel/);
  assert.match(page, /Betroffene Zustandsvariablen/);
  assert.match(page, /keine freigegebene öffentliche Bezeichnung/);
});

test("EU public projection uses strict label lookups and suppresses missing labels", () => {
  const component = readFileSync("app/components/eu/EuImpactCase.tsx", "utf8");
  assert.match(component, /publicSystemValueLabel\(record\.competence_scope\)/);
  assert.match(component, /map\(publicIndicatorLabel\)/);
  assert.doesNotMatch(component, /humanizeSystemValue\(record\.(?:competence_scope|legal_feasibility_status|legal_status|institutional_actor_role)\)/);
});

test("EU public maturity never cosmetically humanizes unknown competence or indicator codes", () => {
  const maturity = euPublicMaturity({
    impact_case_id: "EU-IMPACT-TEST",
    title: "Testfall",
    analysis_mode: "IMPACT_POTENTIAL_EX_ANTE",
    evidence_level: "LOW",
    reality_check_status: "NOT_YET_OBSERVABLE",
    key_indicators: ["unknown_metric"],
    competence_scope: "UNREVIEWED_COMPETENCE",
    implementation_route: ["UNREVIEWED_ROUTE"],
  }, {
    assessmentLabel: "Fachlich freigegebene Einordnung",
    impactCoreSummary: "Fallbezogener Wirkmechanismus",
    editorialSummary: "Fallbezogene Kurzbewertung",
    keyFinding: "FALLBEZOGENER BEFUND",
    evidenceSummary: "Fallbezogene Evidenzgrenze",
    realityCheckSummary: "Noch nicht beobachtbar",
  });
  const rendered = JSON.stringify(maturity);
  assert.doesNotMatch(rendered, /Unknown metric|Unreviewed competence|Unreviewed route/);
  assert.match(rendered, /freigegebene öffentliche Bezeichnung/);
  assert.ok(!maturity.assessableNow.some((item) => item.startsWith("Kompetenz- und Umsetzungsrahmen:")));
});
