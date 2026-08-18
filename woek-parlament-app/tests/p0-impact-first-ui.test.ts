import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (file: string) => readFileSync(file, "utf8");

const overviewComponent = source("app/components/OverviewAssessment.tsx");
const caseCard = source("app/components/CaseCard.tsx");
const governmentCard = source("app/components/government/GovernmentImpactCase.tsx");
const euCard = source("app/components/eu/EuImpactCase.tsx");
const searchResults = source("app/suche/ParliamentSearch.tsx");
const decisionDetail = source("app/entscheidungen/[slug]/page.tsx");
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
  assert.match(governmentCard, /editorialSummary: record\.editorial_summary/);
  assert.match(euCard, /editorialSummary: record\.editorial_summary/);
  const budget = overviewOverrides.records["bt21-dip-c262bf7797f8"];
  assert.match(budget.editorial_summary, /Additionalität|Lebenszyklus|Titelgruppen/);
  assert.doesNotMatch(budget.editorial_summary, /Chancen und (Risiken|Herausforderungen)|Auswirkungen sind vielfältig/i);
});

test("KEY_FINDING_VISIBLE", () => {
  assert.match(overviewComponent, /<strong>Key Finding:<\/strong> \{assessment\.keyFinding\}/);
  assert.match(governmentCard, /keyFinding: record\.key_finding/);
  assert.match(euCard, /keyFinding: record\.key_finding/);
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
  assert.match(governmentCard, /impactCoreSummary: record\.impact_core_summary/);
  assert.match(euCard, /impactCoreSummary: record\.impact_core_summary/);
  assert.ok(decisionDetail.indexOf("<OverviewAssessment") < decisionDetail.indexOf("Status dieser Wirkungsakte"));
});
