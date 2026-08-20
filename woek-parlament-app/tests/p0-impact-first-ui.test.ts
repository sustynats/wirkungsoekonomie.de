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
const governmentSourceVsView = source("scripts/quality/check-government-source-vs-view.mjs");
const fullAnalysisText = source("app/components/FullAnalysisText.tsx");
const presentationLabels = source("lib/presentation/labels.ts");
const genericPublicScan = source("scripts/quality/generic-public-editorial-scan.mjs");
const publicMaturity = source("app/components/PublicMaturity.tsx");
const publicMaturityProjection = source("lib/presentation/public-maturity.ts");
const overviewOverrides = JSON.parse(source("data/presentation/overview-assessment-overrides.json"));
const publicApi = source("lib/public-api.ts");
const searchPage = source("app/suche/page.tsx");
const globalStyles = source("app/globals.css");

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
  assert.match(overviewComponent, /<strong>Key Finding:<\/strong> \{publicCopy\.keyFinding\}/);
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
  assert.ok(governmentCard.indexOf("data-woek-substantive-impact") < governmentCard.indexOf("{includeProcess && <GovernmentProcessSection"));
  assert.ok(governmentCard.indexOf("data-woek-source-layer") < governmentCard.indexOf("{includeProcess && <GovernmentProcessSection"));
  const euDetailProcess = euCard.lastIndexOf("data-woek-process-metadata");
  assert.ok(euCard.indexOf("data-woek-substantive-impact") < euDetailProcess);
  assert.ok(euCard.indexOf("<RecommendationSection") < euDetailProcess);
  assert.ok(euCard.indexOf("data-woek-source-layer") < euDetailProcess);
});

test("IMPACT_ANALYSIS_IS_PRIMARY_CONTENT", () => {
  assert.match(decisionDetail, /aria-label="Zusammenfassende WÖk-Bewertung"|<OverviewAssessment/);
  assert.match(governmentCard, /impactCoreSummary: editorial\.fields\.impact_core_summary/);
  assert.match(euCard, /impactCoreSummary: editorial\.fields\.impact_core_summary/);
  assert.ok(decisionDetail.indexOf("<OverviewAssessment") < decisionDetail.indexOf("Status dieser Wirkungsakte"));
});

test("PUBLIC_MATURITY_MAKES_ASSESSABLE_AND_OPEN CLAIMS VISIBLE", () => {
  assert.match(publicMaturity, /Was wir bereits beurteilen können/);
  assert.match(publicMaturity, /Was noch offen ist oder beobachtet werden muss/);
  assert.match(publicMaturity, /Offen bedeutet weder neutral noch null/);
  assert.match(publicMaturity, /Getrennte Prüfebenen/);
  assert.match(publicMaturityProjection, /WÖk-Problemprüfung/);
  assert.match(publicMaturityProjection, /WÖk-Zielprüfung und Zielhierarchie/);
  assert.match(publicMaturityProjection, /Wirkungspotenzial und Wirkungsrisiken/);
  assert.match(publicMaturityProjection, /WÖk-Handlungsoption/);
  assert.match(publicMaturityProjection, /WÖk-Inspirations- und Operationalisierungsmodell/);
});

test("PREVIEW_CARD_HAS_VISIBLE_WOEK_ASSESSMENT", () => {
  assert.match(overviewComponent, /WÖk-Kurzbewertung/);
  assert.match(euSourceVsView, /Executive-WÖk-Zusammenfassung/);
  assert.match(euSourceVsView, /Wirkungspotenzial kompakt/);
  for (const [file, content] of Object.entries({ caseCard, governmentCard, governmentActionCard, euCard, searchResults, sourceDetail })) {
    assert.match(content, /<OverviewAssessment/, file);
  }
});

test("PREVIEW_CARD_HAS_ICONIC_ASSESSMENT", () => {
  assert.match(overviewComponent, /data-woek-assessment-icon/);
  assert.match(overviewComponent, /role="img"/);
  assert.match(overviewComponent, /aria-label=\{iconLabel\}/);
});

test("PREVIEW_CARD_HAS_CASE_SPECIFIC_IMPACT_SUMMARY", () => {
  assert.match(overviewComponent, /Wirkungspotenzial kompakt:/);
  assert.match(overviewComponent, /publicCopy\.summary/);
  assert.doesNotMatch(overviewComponent, /EditorialReviewAssessment/);
  assert.match(publicMaturity, /WÖk-Wirkungsanalyse noch nicht veröffentlicht/);
  assert.match(publicMaturity, /data-woek-fact-only-status="published"/);
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

test("FACT_ONLY_FAILS_CLOSED_WITHOUT_AN_ASSESSMENT_SURFACE", () => {
  for (const [file, content] of Object.entries({ caseCard, governmentActionCard, searchResults, sourceDetail, specialistIndex, mandateIndex, stateProgrammes })) {
    assert.doesNotMatch(content, /EditorialReviewAssessment/, file);
  }
  assert.match(caseCard, /data-woek-preview-card=\{assessment \? "published" : "fact-only"\}/);
  assert.match(governmentActionCard, /assessments\.length \? "published" : "fact-only"/);
  assert.match(publicMaturity, /Faktenakte ohne veröffentlichte WÖk-Wirkungsanalyse/);
});

test("FACT_ONLY_METADATA_AND_CLIENT_PROJECTIONS_FAIL_CLOSED", () => {
  assert.match(decisionDetail, /description: publicParliamentSummary\(item\)/);
  assert.match(publicApi, /publicationStatus: "FACT_ONLY"/);
  assert.match(publicApi, /woekAnalysisPublished: false/);
  assert.match(publicApi, /Eine WÖk-Wirkungsanalyse ist noch nicht veröffentlicht/);
  assert.doesNotMatch(searchPage, /return \{ \.\.\.item, assessment/);
  assert.match(searchPage, /intendedGoal: analysisPublished \? item\.intendedGoal : ""/);
  assert.match(searchPage, /impactPath: analysisPublished \? item\.impactPath : \[\]/);
});

test("PUBLIC_SCHEMA_TERMS_ARE_MAPPED_TO_PLAIN_GERMAN", () => {
  for (const term of ["RecommendationVersion", "EvidenceEvent", "ExternalShock", "WÖkImpactCase", "GovernmentAction", "ParliamentaryCase", "LegalAct", "SourceEvent", "VoteEvent", "IndividualVote", "Climate resource", "BLOCK"]) {
    assert.match(presentationLabels, new RegExp(term.replace(/[+]/g, "\\+")));
  }
  assert.match(source("app/components/FullReviewRecord.tsx"), /humanizeSystemValue\(part\)/);
  assert.match(source("app/components/CompletePublicationSource.tsx"), /humanizeSystemValue\(output\)/);
  assert.doesNotMatch(source("app/components/recommendations/RecommendationSection.tsx"), />RecommendationVersion /);
  assert.doesNotMatch(source("app/regierung/wirkungsanalysen/[id]/page.tsx"), /kein fachlich freigegebenes EvidenceEvent/);
  for (const driver of ["CLIMATE_RESOURCE", "FINANCIAL_SCALE", "HEALTH_SAFETY", "HIGH_UNCERTAINTY_HIGH_HARM", "POPULATION_SCALE"]) {
    assert.match(presentationLabels, new RegExp(`${driver}:`));
  }
  assert.doesNotMatch(stateProgrammes, /Wahlprogramme vor der Landtagswahl Sachsen-Anhalt 2026: Wirkungspotenziale/);
  assert.match(stateProgrammes, /vollständige WÖk-Wirkungsakte/);
});

test("WOEK_ASSESSMENT_LABEL_USES_COMPACT_SANS_SERIF_LEAD_TYPOGRAPHY", () => {
  assert.match(globalStyles, /\.overview-assessment-label\s*\{[\s\S]*?font-family:\s*var\(--schrift-text\)[\s\S]*?font-size:\s*1\.125rem[\s\S]*?font-weight:\s*600[\s\S]*?line-height:\s*1\.45/);
  assert.match(globalStyles, /@media \(min-width:\s*48rem\)[\s\S]*?\.overview-assessment \.overview-assessment-label\s*\{\s*font-size:\s*1\.25rem/);
  assert.match(overviewComponent, /<p className="overview-assessment-label">\{assessment\.assessmentLabel\}<\/p>/);
  assert.doesNotMatch(overviewComponent, /<h[1-6][^>]*className="overview-assessment-label"/);
});

test("NO_GENERIC_INTERNAL_SCHEMA_FIELD_LABELS_IN_PUBLIC_UI", () => {
  for (const label of [
    "Kompetenzprüfung",
    "Rechts- und Grundrechtsprüfung",
    "MPD-Zuordnung",
    "SDG-Zuordnung",
    "SDG+-Zuordnung",
    "Prüfung von Schutz- und Wirkungsgrenzen",
    "strukturierter Datenbedarf",
    "strukturierte Evidenzzusammenfassung",
  ]) {
    assert.match(presentationLabels, new RegExp(label.replace(/[+]/g, "\\+")));
    assert.match(governmentSourceVsView, new RegExp(label.replace(/[+]/g, "\\+")));
  }
  assert.match(governmentCard, /publicStructuredFieldLabel/);
  assert.doesNotMatch(governmentCard, /missing_structured_fields\.map\(publicValue\)/);
  assert.match(genericPublicScan, /GENERIC_INTERNAL_SCHEMA_FIELD_LABEL_VISIBLE/);
  assert.match(genericPublicScan, /NO_GENERIC_INTERNAL_SCHEMA_FIELD_LABELS_IN_PUBLIC_UI/);
});

test("NO_CONTROL_STYLE_BACKTICK_ENUM_STATUS_PRESENTATION", () => {
  assert.match(fullAnalysisText, /publicControlText/);
  assert.match(fullAnalysisText, /`\[\^`\]\+`/);
  assert.match(presentationLabels, /replace\(\/\\s\*=\\s\*\/g, ": "\)/);
  assert.match(presentationLabels, /"Analysis Mode": "Analysemodus"/);
  assert.match(presentationLabels, /"Boundary Review": "Prüfung von Schutz- und Wirkungsgrenzen"/);
  assert.match(presentationLabels, /BOUNDARY_REVIEW: "Prüfung der Schutz- und Wirkungsgrenzen"/);
  assert.match(fullAnalysisText, /humanizeSystemValue\(chapter\.text\)/);
  assert.match(genericPublicScan, /CONTROL_STYLE_PRESENTATION_VISIBLE/);
  assert.match(genericPublicScan, /FULL_RECORD_DETAILS_INCLUDED_IN_SCAN/);
  assert.match(genericPublicScan, /PUBLIC_OPEN_STATE_COPY_INCLUDED_IN_SCAN/);
  assert.match(genericPublicScan, /EU_IMPACT_2026_002_EXTERNAL_RENDER/);
  assert.match(genericPublicScan, /WOEK_IMPACT_BUND_BHH_2027_EXTERNAL_RENDER/);
  assert.match(genericPublicScan, /FACT_ONLY_HEAD_METADATA_FAILS_CLOSED/);
  assert.match(genericPublicScan, /FACT_ONLY_SEARCH_AND_API_FAIL_CLOSED/);
  assert.match(genericPublicScan, /publicHeadDescriptions/);
  assert.doesNotMatch(governmentCard, /data-woek-raw-schema-proof="allowed"/);
  assert.doesNotMatch(source("app/components/recommendations/RecommendationSection.tsx"), /data-woek-raw-schema-proof="allowed"/);
  assert.match(genericPublicScan, /RAW_SCHEMA_TERMS_ONLY_IN_EXPLICIT_TECHNICAL_PROOF/);
});

test("UNKNOWN_PUBLIC_SYSTEM_VALUES_FAIL_CLOSED", () => {
  assert.match(presentationLabels, /export function publicSystemLabel/);
  assert.match(presentationLabels, /export function publicSystemValueLabel/);
  assert.match(presentationLabels, /return systemValueLabels\[value\] \?\? null/);
  assert.match(euCard, /publicSystemValueLabel\(record\.competence_scope\)/);
  assert.match(euCard, /map\(publicIndicatorLabel\)/);
  assert.doesNotMatch(euCard, /humanizeSystemValue\(record\.(?:competence_scope|legal_feasibility_status|legal_status|institutional_actor_role)\)/);
});
