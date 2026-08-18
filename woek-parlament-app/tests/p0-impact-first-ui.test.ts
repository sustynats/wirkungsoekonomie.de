import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (file: string) => readFileSync(file, "utf8");

const overviewComponent = source("app/components/OverviewAssessment.tsx");
const caseCard = source("app/components/CaseCard.tsx");
const governmentCard = source("app/components/government/GovernmentImpactCase.tsx");
const governmentActionCard = source("app/components/government/GovernmentActionCard.tsx");
const euCard = source("app/components/eu/EuImpactCase.tsx");
const searchResults = source("app/suche/ParliamentSearch.tsx");
const sourceDetail = source("app/quellen/[slug]/page.tsx");
const specialistIndex = source("app/fachanalysen/page.tsx");
const mandateIndex = source("app/mandat-und-praxis/page.tsx");
const stateProgrammes = source("app/laender/sachsen-anhalt/page.tsx");
const decisionDetail = source("app/entscheidungen/[slug]/page.tsx");
const euSourceVsView = source("scripts/quality/check-eu-source-vs-view.mjs");
const overviewOverrides = JSON.parse(source("data/presentation/overview-assessment-overrides.json"));

test("OVERVIEW_CARD_HAS_VISIBLE_WOEK_ASSESSMENT", () => {
  assert.match(overviewComponent, /Zusammenfassende WÖk-Bewertung/);
  for (const [file, content] of Object.entries({ caseCard, governmentCard, euCard, searchResults })) {
    assert.match(content, /<OverviewAssessment/, file);
  }
  for (const file of [
    "app/page.tsx", "app/[section]/page.tsx", "app/wirkungsfaelle/page.tsx",
    "app/regierung/page.tsx", "app/regierung/wirkungsanalysen/page.tsx",
    "app/eu/page.tsx", "app/eu/wirkungsfaelle/page.tsx",
  ]) {
    assert.match(source(file), /<(CaseCard|GovernmentImpactCase|EuImpactCase)/, file);
  }
});

test("PROCESS_BADGE_IS_NOT_USED_AS_ASSESSMENT", () => {
  assert.doesNotMatch(overviewComponent, /Vor der Entscheidung geprüft|Beobachtung und Rückkopplung|hohe Prüfrelevanz/i);
  assert.ok(caseCard.indexOf("<OverviewAssessment") < caseCard.indexOf("<CaseTypeMark"));
  assert.ok(searchResults.indexOf("<OverviewAssessment assessment={item.assessment}") < searchResults.indexOf("<dt>Analysephase</dt>"));
});

test("ASSESSMENT_PRECEDES_PROCESS_METADATA", () => {
  const renderedGovernmentCard = governmentCard.slice(governmentCard.indexOf("export function GovernmentImpactCase"));
  assert.ok(caseCard.indexOf("<OverviewAssessment") < caseCard.indexOf("case-card-topline"));
  assert.ok(renderedGovernmentCard.indexOf("<OverviewAssessment") < renderedGovernmentCard.indexOf("government-impact-summary"));
  assert.ok(searchResults.indexOf("<OverviewAssessment assessment={item.assessment}") < searchResults.indexOf("<dt>Prüfstand</dt>"));
});

test("EDITORIAL_SUMMARY_IS_CASE_SPECIFIC", () => {
  assert.match(governmentCard, /editorialSummary: editorial\.fields\.editorial_summary/);
  assert.match(euCard, /editorialSummary: editorial\.fields\.editorial_summary/);
  const budget = overviewOverrides.records["bt21-dip-c262bf7797f8"];
  assert.match(budget.editorial_summary, /Additionalität|Lebenszyklus|Titelgruppen/);
  assert.doesNotMatch(budget.editorial_summary, /Chancen und (Risiken|Herausforderungen)|Auswirkungen sind vielfältig/i);
});

test("KEY_FINDING_VISIBLE", () => {
  assert.match(overviewComponent, /<strong>Key Finding:<\/strong> \{assessment\.keyFinding\}/);
  assert.match(governmentCard, /keyFinding: editorial\.fields\.key_finding/);
  assert.match(euCard, /keyFinding: editorial\.fields\.key_finding/);
});

test("EVIDENCE_SEPARATE_FROM_DIRECTION", () => {
  assert.match(overviewComponent, /<dt>Wirkungsrichtung<\/dt><dd>\{assessment\.directionLabel\}<\/dd>/);
  assert.match(overviewComponent, /<dt>Evidenzstatus<\/dt><dd>\{assessment\.evidenceSummary\}<\/dd>/);
  assert.ok(overviewComponent.indexOf("<dt>Wirkungsrichtung") < overviewComponent.indexOf("<dt>Evidenzstatus"));
});

test("BUDGET_2027_PORTFOLIO_NOT_FORCED_TO_FAKE_SCORE", () => {
  const budget = overviewOverrides.records["bt21-dip-c262bf7797f8"];
  assert.equal(budget.overview_assessment_label, "Keine belastbare einheitliche Wirkungsrichtung ohne Disaggregation.");
  assert.match(budget.impact_core_summary, /heterogene Allokationsarchitektur/);
  assert.match(budget.key_finding, /nicht als Gesamtscore/);
  assert.doesNotMatch(JSON.stringify(budget), /[+-]\d|Gesamtwert|Gesamtnote/);
});

test("DETAIL_PAGE_IMPACT_SECTION_PRECEDES_PROCESS", () => {
  assert.ok(decisionDetail.indexOf("<OverviewAssessment") < decisionDetail.indexOf("decision-process-meta"));
  assert.ok(governmentCard.indexOf("<OverviewAssessment") < governmentCard.indexOf("<FullSchemaDetails"));
  assert.ok(euCard.indexOf("<OverviewAssessment") < euCard.indexOf("Geerbtes EU-Verfahren"));
});

test("IMPACT_ANALYSIS_IS_PRIMARY_CONTENT", () => {
  assert.match(decisionDetail, /aria-label="Zusammenfassende WÖk-Bewertung"|<OverviewAssessment/);
  assert.match(governmentCard, /impactCoreSummary: editorial\.fields\.impact_core_summary/);
  assert.match(euCard, /impactCoreSummary: editorial\.fields\.impact_core_summary/);
  assert.ok(decisionDetail.indexOf("<OverviewAssessment") < decisionDetail.indexOf("Status dieser Wirkungsakte"));
});

test("PREVIEW_CARD_HAS_VISIBLE_WOEK_ASSESSMENT", () => {
  assert.match(overviewComponent, /WÖk-Kurzbewertung/);
  assert.match(euSourceVsView, /WÖk-Kurzbewertung/);
  assert.match(euSourceVsView, /Wirkungspotenzial kompakt/);
  for (const [file, content] of Object.entries({ caseCard, governmentCard, governmentActionCard, euCard, searchResults, sourceDetail, specialistIndex, mandateIndex, stateProgrammes })) {
    assert.match(content, /<(?:OverviewAssessment|EditorialReviewAssessment)/, file);
  }
});

test("PREVIEW_CARD_HAS_ICONIC_ASSESSMENT", () => {
  assert.match(overviewComponent, /data-woek-assessment-icon/);
  assert.match(overviewComponent, /role="img"/);
  assert.match(overviewComponent, /aria-label=\{iconLabel\}/);
});

test("PREVIEW_CARD_HAS_CASE_SPECIFIC_IMPACT_SUMMARY", () => {
  assert.match(overviewComponent, /Wirkungspotenzial kompakt:/);
  assert.match(overviewComponent, /assessment\.editorialSummary/);
  assert.match(overviewComponent, /EditorialReviewAssessment/);
  assert.match(overviewComponent, /fachlich freigegebene, strukturierte WÖk-Kurzbewertung/);
});

test("PREVIEW_CARD_IMPACT_PRECEDES_PROCESS", () => {
  assert.ok(caseCard.indexOf("<OverviewAssessment") < caseCard.indexOf("data-woek-process-metadata"));
  assert.ok(governmentActionCard.indexOf("<OverviewAssessment") < governmentActionCard.indexOf("data-woek-process-metadata"));
  assert.ok(searchResults.indexOf("<OverviewAssessment") < searchResults.indexOf("data-woek-process-metadata"));
  assert.ok(sourceDetail.indexOf("<OverviewAssessment") < sourceDetail.indexOf("data-woek-process-metadata"));
});

test("PREVIEW_CARD_PROCESS_IS_NOT_MAIN_ASSESSMENT", () => {
  assert.doesNotMatch(overviewComponent, /Vor der Entscheidung geprüft|Beobachtung und Rückkopplung|hohe Prüfrelevanz/i);
  assert.match(overviewComponent, /Wirkungspotenzial kompakt/);
});

test("PREVIEW_CARD_NO_GENERIC_SUMMARY", () => {
  assert.doesNotMatch(overviewComponent, /Die Maßnahme kann Wirkungen entfalten|Es bestehen Chancen und Risiken|Dies muss weiter beobachtet werden/);
  assert.match(source("scripts/quality/generic-public-editorial-scan.mjs"), /PREVIEW_CARD_NO_GENERIC_SUMMARY/);
});

test("PREVIEW_CARD_NO_RAW_INTERNAL_ENUMS", () => {
  assert.doesNotMatch(overviewComponent, />POSITIVE_POTENTIAL<|>NEGATIVE_RISK<|>AMBIVALENT<|>PORTFOLIO_DISAGGREGATION_REQUIRED</);
  assert.match(source("scripts/quality/generic-public-editorial-scan.mjs"), /PREVIEW_CARD_NO_RAW_INTERNAL_ENUMS/);
});
