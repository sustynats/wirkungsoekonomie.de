#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  findGenericProjectionPatterns,
  isGenericPublicEditorialText,
  projectEuEditorial,
  projectGovernmentEditorial,
  projectParliamentEditorial,
} from "../../lib/publication/public-editorial-projection.mjs";

const root = process.cwd();
const baseUrl = (process.env.WOEK_EDITORIAL_SCAN_BASE_URL ?? "").replace(/\/$/, "");
const outputFile = process.env.WOEK_EDITORIAL_SCAN_REPORT
  ?? path.join(root, "data", "autopilot", "audit", "2.3-remediated", "GENERIC-PUBLIC-EDITORIAL-SCAN-2.3.json");
const headers = process.env.WOEK_SOURCE_VS_VIEW_COOKIE ? { cookie: process.env.WOEK_SOURCE_VS_VIEW_COOKIE } : {};

const readJson = (file) => JSON.parse(readFileSync(path.join(root, file), "utf8"));
const readJsonl = (file) => readFileSync(path.join(root, file), "utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse);
const source = (file) => readFileSync(path.join(root, file), "utf8");

const government = readJsonl("data/government/impact-cases/public-impact-records.jsonl")
  .map((record) => ({ id: record.impact_case_id, title: record.title, route: `/regierung/wirkungsanalysen/${encodeURIComponent(record.impact_case_id)}`, fields: projectGovernmentEditorial(record).fields }));
const euAll = readJsonl("data/eu/impact-cases/public-impact-records.jsonl")
  .map((record) => ({ record, projection: projectEuEditorial(record) }));
const eu = euAll.filter(({ projection }) => projection.status === "PASS")
  .map(({ record, projection }) => ({ id: record.impact_case_id, title: record.title, route: `/eu/wirkungsfaelle/${encodeURIComponent(record.impact_case_id)}`, fields: projection.fields }));
const parliamentAll = readJson("data/public-working-acts.json");
const overrides = readJson("data/presentation/overview-assessment-overrides.json").records;
const parliament = parliamentAll.flatMap((record) => {
  const override = overrides[record.slug];
  const projection = override ? {
    status: "PASS",
    fields: {
      overview_assessment_label: override.overview_assessment_label,
      impact_core_summary: override.impact_core_summary,
      editorial_summary: override.editorial_summary,
      evidence_summary: override.evidence_summary,
      key_finding: override.key_finding,
      reality_check_summary: override.reality_check_summary,
    },
  } : projectParliamentEditorial(record);
  return projection.status === "PASS" ? [{ id: record.slug, title: record.plainTitle, route: `/entscheidungen/${record.slug}`, fields: projection.fields }] : [];
});
const projections = [...government, ...eu, ...parliament];

const knownFallbacks = [
  /Die Fallakte wird auf Grundlage der amtlichen Unterlagen strukturiert\.?/i,
  /Wirkpfade und Risiken sind aus den vorliegenden amtlichen Quellen strukturiert\.?/i,
  /Der kompakte Fachdatensatz enthält noch keine vollständig strukturierte/i,
  /Die Akte ist in der ausgewiesenen Reifestufe öffentlich nutzbar/i,
  /\b(?:\x6c\x6f\x72\x65\x6d \x69\x70\x73\x75\x6d|\x74\x62\x64|\x74\x6f\x64\x6f|\x63\x6f\x6d\x69\x6e\x67 \x73\x6f\x6f\x6e)\b/i,
];
const rawEnum = /\b(?:POSITIVE_POTENTIAL|NEGATIVE_RISK|POSITIVE|NEGATIVE|NEUTRAL|AMBIVALENT|OPEN|HIGH|MEDIUM|LOW|PASS|BLOCK|APPROVED|PORTFOLIO_DISAGGREGATION_REQUIRED|NO_ROBUST_OVERALL_DIRECTION|NOT_YET_OBSERVABLE|OBSERVATION_ONLY|PLAUSIBLE_CONTRIBUTION|PARTIAL_ATTRIBUTION|CAUSAL_EVIDENCE|CONFLICTING_EVIDENCE|NOT_ASSESSABLE|IMPACT_POTENTIAL_EX_ANTE|PORTFOLIO_EX_ANTE|GOVERNMENT_DRAFT|NO_SINGLE_DIRECTION_ALLOWED|VERY_HIGH|STANDARD_WOEK_ANALYSIS|NOT_APPLICABLE|BACKFILL_REQUIRED|LIMITED_FACH_RECORD|NOT_STRUCTURED|WATCH)\b/;
const rawPublicTerm = /\b(?:RecommendationVersions?|EvidenceEvents?|ExternalShock|StateObservation|RealityCheckCandidate|AnalysisVersion|WÖkImpactCase|ImpactCase|GovernmentActions?|ParliamentaryCases?|LegalActs?|SourceEvents?|VoteEvents?|IndividualVotes?|Climate resource)\b/;
const machineResidue = [
  /realitycheckstatus\s*=/i,
  /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/,
  /\b[a-z]+_[a-z0-9_]+\b/,
  /(?:^|\s)---(?:\s|$)/,
];
const internalSchemaProjection = /\b(?:Competence review|Legal and rights review|Mpd mapping|Sdg mapping|Sdg plus mapping|Structured boundary review|Structured data needs|Structured evidence summary)\b/i;
const controlStylePresentation = [
  /`[^`]+`/,
  /\b(?:Analysis Mode|Boundary Review)\b/i,
  /\b(?:Status|Analysemodus|Gesamtcharakter|Reality-?Check(?:-Status)?|Boundary Status|Prüfung von Schutz- und Wirkungsgrenzen)\s*=\s*/i,
];
const unreviewedPublicLabels = [
  /Official proposal source; Ex ante causal hypothesis requires validation/i,
  /Decision context source only; Analytical causal hypothesis requires validation/i,
  /Mixed eu supporting existing digital internal market rules/i,
  /Eu shared mixed/i,
  /Eu route with high fundamental rights constraints/i,
  /Commission executive strategic/i,
  /Strategy and communication/i,
  /Fimi detection time/i,
  /Network diffusion after response/i,
  /False classification appeals/i,
  /Independent oversight/i,
  /Media pluralism/i,
  /Civil society operability/i,
  /Fundamental rights cases/i,
  /Impact potential with implementation observation/i,
  /Watch high/i,
];
const fieldFailures = [];
for (const entry of projections) {
  for (const [field, value] of Object.entries(entry.fields)) {
    if (!String(value ?? "").trim()) fieldFailures.push(`${entry.id}:${field}:EMPTY`);
    if (knownFallbacks.some((pattern) => pattern.test(String(value)))) fieldFailures.push(`${entry.id}:${field}:GENERIC`);
    if (rawEnum.test(String(value)) || rawPublicTerm.test(String(value))) fieldFailures.push(`${entry.id}:${field}:RAW_ENUM`);
  }
  if (String(entry.fields.overview_assessment_label).trim() === String(entry.fields.impact_core_summary).trim()) {
    fieldFailures.push(`${entry.id}:ASSESSMENT_EQUALS_IMPACT_CORE`);
  }
  if (isGenericPublicEditorialText(entry.fields.editorial_summary)) fieldFailures.push(`${entry.id}:EDITORIAL_GENERIC`);
  if (isGenericPublicEditorialText(entry.fields.evidence_summary)) fieldFailures.push(`${entry.id}:EVIDENCE_GENERIC`);
}
const similarityFailures = findGenericProjectionPatterns(projections);

function visibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

function publicHeadDescriptions(html) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].flatMap(([tag]) => {
    const key = tag.match(/(?:name|property)="([^"]+)"/i)?.[1]?.toLocaleLowerCase("en-US") ?? "";
    const content = tag.match(/content="([^"]*)"/i)?.[1] ?? "";
    return key.endsWith("description") ? [content] : [];
  });
}

function publicStructuredScripts(html) {
  return [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
}

function sourceSlug(url) {
  return `quelle-${createHash("sha256").update(new URL(url).toString()).digest("hex").slice(0, 16)}`;
}

const routeChecks = [];
if (baseUrl) {
  const sampleSources = [
    ...government.flatMap((entry) => {
      const record = readJsonl("data/government/impact-cases/public-impact-records.jsonl").find((item) => item.impact_case_id === entry.id);
      return record?.official_fact_sources?.slice(0, 1) ?? [];
    }),
    ...euAll.filter(({ projection }) => projection.status === "PASS").flatMap(({ record }) => record.official_sources?.slice(0, 1) ?? []),
    ...parliamentAll.flatMap((record) => record.sources?.slice(0, 1).map((item) => item.url) ?? []),
  ].filter((url, index, all) => /^https:\/\//.test(url) && all.indexOf(url) === index).slice(0, 12);
  const routes = [...new Set([
    "/", "/bevorstehend", "/entscheidungen", "/wirkungsfaelle", "/regierung", "/regierung/wirkungsanalysen",
    "/eu", "/eu/wirkungsfaelle", "/laender", "/laender/sachsen-anhalt", "/fachanalysen", "/mandat-und-praxis", "/suche", ...projections.map((entry) => entry.route),
    ...sampleSources.map((url) => `/quellen/${sourceSlug(url)}`),
    `/regierung/akte/${encodeURIComponent("govaction:dip:325252")}`,
    `/regierung/akte/${encodeURIComponent("govaction:breg-cabinet:2435812:top:5")}`,
    `/regierung/akte/${encodeURIComponent("govaction:breg-cabinet:2404212:top:7")}`,
    `/regierung/akte/${encodeURIComponent("govaction:dip:329388")}`,
  ])];
  for (const route of routes) {
    const response = await fetch(`${baseUrl}${route}`, { headers, redirect: "manual" });
    const html = response.status === 200 ? await response.text() : "";
    const text = visibleText(html);
    const auditableText = text.replace(/https:\/\/\S+/g, " ");
    const failures = [];
    if (response.status !== 200) failures.push(`HTTP_${response.status}`);
    if (knownFallbacks.some((pattern) => pattern.test(auditableText))) failures.push("GENERIC_FALLBACK_VISIBLE");
    if (rawEnum.test(auditableText) || rawPublicTerm.test(auditableText)) failures.push("RAW_ENUM_VISIBLE");
    if (machineResidue.some((pattern) => pattern.test(auditableText))) failures.push("MACHINE_VALUE_VISIBLE");
    if (internalSchemaProjection.test(auditableText)) failures.push("GENERIC_INTERNAL_SCHEMA_FIELD_LABEL_VISIBLE");
    if (controlStylePresentation.some((pattern) => pattern.test(auditableText))) failures.push("CONTROL_STYLE_PRESENTATION_VISIBLE");
    if (unreviewedPublicLabels.some((pattern) => pattern.test(auditableText))) failures.push("UNREVIEWED_PUBLIC_LABEL_VISIBLE");
    if (/\[object Object\]/.test(auditableText)) failures.push("OBJECT_STRING_VISIBLE");
    const previewCards = (html.match(/data-woek-preview-card=/g) ?? []).length;
    const publishedPreviewCards = (html.match(/data-woek-preview-card="published"/g) ?? []).length;
    const factOnlyPreviewCards = (html.match(/data-woek-preview-card="fact-only"/g) ?? []).length;
    const previewAssessments = (html.match(/data-woek-preview-assessment="published"/g) ?? []).length;
    const factOnlyStatuses = (html.match(/data-woek-fact-only-status="published"/g) ?? []).length;
    const assessmentIcons = (html.match(/data-woek-assessment-icon=/g) ?? []).length;
    const firstAssessment = html.indexOf("data-woek-preview-assessment=");
    const firstFactOnlyStatus = html.indexOf("data-woek-fact-only-status=");
    const firstMaturity = html.indexOf("data-woek-public-maturity=");
    const firstProcess = html.indexOf("data-woek-process-metadata");
    const substantiveLayers = [
      html.indexOf("data-woek-substantive-impact=\"published\""),
      html.indexOf("data-woek-recommendation-layer=\"published\""),
      html.indexOf("data-woek-source-layer=\"published\""),
      html.indexOf("data-woek-evidence-history=\"published\""),
    ].filter((value) => value >= 0);
    const firstPublicLead = [firstAssessment, firstFactOnlyStatus, firstMaturity].filter((value) => value >= 0).sort((left, right) => left - right)[0] ?? -1;
    if (publishedPreviewCards > previewAssessments) failures.push("PREVIEW_WITHOUT_ASSESSMENT");
    if (factOnlyPreviewCards > factOnlyStatuses) failures.push("FACT_ONLY_WITHOUT_CLEAR_STATUS");
    if (previewAssessments > assessmentIcons) failures.push("ASSESSMENT_WITHOUT_ICON");
    if (previewCards > 0 && firstProcess >= 0 && (firstPublicLead < 0 || firstPublicLead > firstProcess)) failures.push("PROCESS_PRECEDES_PUBLICATION_STATUS");
    if (/^\/(?:regierung\/wirkungsanalysen|eu\/wirkungsfaelle|wirkungsfaelle|entscheidungen)\//.test(route)
      && firstProcess >= 0
      && substantiveLayers.some((index) => index > firstProcess)) failures.push("PROCESS_PRECEDES_SUBSTANTIVE_IMPACT_LAYER");
    const headDescriptions = publicHeadDescriptions(html);
    const headText = headDescriptions.join(" ");
    if (rawEnum.test(headText) || rawPublicTerm.test(headText)) failures.push("RAW_ENUM_IN_METADATA");
    if (machineResidue.some((pattern) => pattern.test(headText))) failures.push("MACHINE_VALUE_IN_METADATA");
    if (unreviewedPublicLabels.some((pattern) => pattern.test(headText))) failures.push("UNREVIEWED_PUBLIC_LABEL_IN_METADATA");
    if (factOnlyStatuses > 0 && previewAssessments === 0 && headDescriptions.some((description) => /Wirkungspotenzial|Wirkungsrisiko|Zielkonflikt|Resilienz stärkt|schwächt/i.test(description))) failures.push("UNSUPPORTED_FACH_METADATA");
    const structuredDataText = publicStructuredScripts(html).join(" ");
    if (rawEnum.test(structuredDataText) || rawPublicTerm.test(structuredDataText)) failures.push("RAW_ENUM_IN_STRUCTURED_DATA");
    if (machineResidue.some((pattern) => pattern.test(structuredDataText))) failures.push("MACHINE_VALUE_IN_STRUCTURED_DATA");
    if (unreviewedPublicLabels.some((pattern) => pattern.test(structuredDataText))) failures.push("UNREVIEWED_PUBLIC_LABEL_IN_STRUCTURED_DATA");
    routeChecks.push({
      route,
      http_status: response.status,
      preview_cards: previewCards,
      preview_assessments: previewAssessments,
      fact_only_preview_cards: factOnlyPreviewCards,
      fact_only_statuses: factOnlyStatuses,
      assessment_icons: assessmentIcons,
      full_record_details: (html.match(/government-full-record/g) ?? []).length,
      public_open_states: (html.match(/class="open-state"/g) ?? []).length,
      explicit_technical_proofs_excluded_from_language_scan: (html.match(/data-woek-raw-schema-proof="allowed"/g) ?? []).length,
      head_descriptions_checked: headDescriptions.length,
      structured_data_blocks_checked: publicStructuredScripts(html).length,
      status: failures.length ? "FAIL" : "PASS",
      failures,
    });
  }
}

const components = {
  overview: source("app/components/OverviewAssessment.tsx"),
  caseCard: source("app/components/CaseCard.tsx"),
  governmentCard: source("app/components/government/GovernmentImpactCase.tsx"),
  governmentActionCard: source("app/components/government/GovernmentActionCard.tsx"),
  euCard: source("app/components/eu/EuImpactCase.tsx"),
  search: source("app/suche/ParliamentSearch.tsx"),
  sourceDetail: source("app/quellen/[slug]/page.tsx"),
  specialistIndex: source("app/fachanalysen/page.tsx"),
  mandateIndex: source("app/mandat-und-praxis/page.tsx"),
  stateProgrammes: source("app/laender/sachsen-anhalt/page.tsx"),
  decisionDetail: source("app/entscheidungen/[slug]/page.tsx"),
  fullAnalysisText: source("app/components/FullAnalysisText.tsx"),
  publicMaturity: source("app/components/PublicMaturity.tsx"),
};
const budget = overrides["bt21-dip-c262bf7797f8"];
const liveFailures = routeChecks.filter((entry) => entry.status !== "PASS");
const noGeneric = fieldFailures.length === 0 && similarityFailures.length === 0 && liveFailures.length === 0;
const previewComponents = [components.caseCard, components.governmentCard, components.governmentActionCard, components.euCard, components.search, components.sourceDetail, components.specialistIndex, components.mandateIndex, components.stateProgrammes];
const livePreviewFailures = liveFailures.filter((entry) => entry.failures.some((failure) => /PREVIEW|ASSESSMENT|PROCESS_PRECEDES/.test(failure)));
const governmentRegression = routeChecks.find((entry) => entry.route === "/regierung/wirkungsanalysen/WOEK-IMPACT-BUND-BHH-2027");
const euRegression = routeChecks.find((entry) => entry.route === "/eu/wirkungsfaelle/EU-IMPACT-2026-002");
const liveGate = (value) => baseUrl ? Boolean(value) : true;
const gates = {
  OVERVIEW_CARD_HAS_VISIBLE_WOEK_ASSESSMENT: /Zusammenfassende WÖk-Bewertung/.test(components.overview) && [components.caseCard, components.governmentCard, components.euCard].every((value) => /<OverviewAssessment/.test(value)),
  PROCESS_BADGE_IS_NOT_USED_AS_ASSESSMENT: !/Vor der Entscheidung geprüft|Beobachtung und Rückkopplung|hohe Prüfrelevanz/i.test(components.overview),
  ASSESSMENT_PRECEDES_PROCESS_METADATA: components.caseCard.indexOf("<OverviewAssessment") < components.caseCard.indexOf("case-card-topline") && components.decisionDetail.indexOf("<OverviewAssessment") < components.decisionDetail.indexOf("decision-process-meta"),
  EDITORIAL_SUMMARY_IS_CASE_SPECIFIC: fieldFailures.every((value) => !value.includes("editorial_summary")) && similarityFailures.every((value) => value.field !== "editorial_summary"),
  EVIDENCE_SUMMARY_IS_CASE_SPECIFIC: fieldFailures.every((value) => !value.includes("evidence_summary")) && similarityFailures.every((value) => value.field !== "evidence_summary"),
  ASSESSMENT_AND_IMPACT_CORE_HAVE_DISTINCT_FUNCTION: fieldFailures.every((value) => !value.includes("ASSESSMENT_EQUALS_IMPACT_CORE")),
  NO_GENERIC_PUBLIC_EDITORIAL_TEXT: noGeneric,
  NO_RAW_INTERNAL_ENUMS_IN_PUBLIC_UI: fieldFailures.every((value) => !value.includes("RAW_ENUM")) && liveFailures.every((value) => !value.failures.includes("RAW_ENUM_VISIBLE") && !value.failures.includes("UNREVIEWED_PUBLIC_LABEL_VISIBLE")),
  NO_MACHINE_VALUES_IN_NORMAL_PUBLIC_UI: liveFailures.every((value) => !value.failures.includes("MACHINE_VALUE_VISIBLE")),
  NO_GENERIC_INTERNAL_SCHEMA_FIELD_LABELS_IN_PUBLIC_UI: liveFailures.every((value) => !value.failures.includes("GENERIC_INTERNAL_SCHEMA_FIELD_LABEL_VISIBLE")),
  NO_CONTROL_STYLE_BACKTICK_ENUM_STATUS_PRESENTATION: liveFailures.every((value) => !value.failures.includes("CONTROL_STYLE_PRESENTATION_VISIBLE")) && /publicControlText/.test(components.fullAnalysisText),
  FULL_RECORD_DETAILS_INCLUDED_IN_SCAN: liveGate(governmentRegression?.full_record_details > 0 && euRegression?.full_record_details > 0),
  PUBLIC_OPEN_STATE_COPY_INCLUDED_IN_SCAN: liveGate(governmentRegression?.public_open_states > 0 && !governmentRegression?.failures.includes("GENERIC_INTERNAL_SCHEMA_FIELD_LABEL_VISIBLE")),
  EU_IMPACT_2026_002_EXTERNAL_RENDER: liveGate(euRegression?.status === "PASS"),
  WOEK_IMPACT_BUND_BHH_2027_EXTERNAL_RENDER: liveGate(governmentRegression?.status === "PASS"),
  KEY_FINDING_VISIBLE_AND_SPECIFIC: /Key Finding:/.test(components.overview) && fieldFailures.every((value) => !value.includes("key_finding")),
  BUDGET_2027_PORTFOLIO_NOT_FORCED_TO_FAKE_SCORE: budget?.overview_assessment_label === "Keine belastbare einheitliche Wirkungsrichtung ohne Disaggregation." && /heterogene Allokationsarchitektur/.test(budget?.impact_core_summary ?? "") && !/[+-]\d|Gesamtwert|Gesamtnote/.test(JSON.stringify(budget)),
  DETAIL_PAGE_IMPACT_SECTION_PRECEDES_PROCESS: components.decisionDetail.indexOf("<OverviewAssessment") < components.decisionDetail.indexOf("decision-process-meta")
    && components.governmentCard.indexOf("data-woek-substantive-impact") < components.governmentCard.indexOf("{includeProcess && <GovernmentProcessSection")
    && components.euCard.indexOf("data-woek-substantive-impact") < components.euCard.lastIndexOf("data-woek-process-metadata")
    && liveFailures.every((entry) => !entry.failures.includes("PROCESS_PRECEDES_SUBSTANTIVE_IMPACT_LAYER")),
  IMPACT_ANALYSIS_IS_PRIMARY_CONTENT: /impactCoreSummary: editorial\.fields\.impact_core_summary/.test(components.governmentCard) && /impactCoreSummary: editorial\.fields\.impact_core_summary/.test(components.euCard),
  GENERIC_PUBLIC_EDITORIAL_SCAN: noGeneric,
  PREVIEW_CARD_HAS_VISIBLE_WOEK_ASSESSMENT: /WÖk-Kurzbewertung/.test(components.overview) && [components.caseCard, components.governmentCard, components.governmentActionCard, components.euCard, components.search, components.sourceDetail].every((value) => /<OverviewAssessment/.test(value)) && livePreviewFailures.every((entry) => !entry.failures.includes("PREVIEW_WITHOUT_ASSESSMENT")),
  PREVIEW_CARD_HAS_ICONIC_ASSESSMENT: /data-woek-assessment-icon/.test(components.overview) && /role="img"/.test(components.overview) && livePreviewFailures.every((entry) => !entry.failures.includes("ASSESSMENT_WITHOUT_ICON")),
  PREVIEW_CARD_HAS_CASE_SPECIFIC_IMPACT_SUMMARY: fieldFailures.every((value) => !/(?:editorial_summary|impact_core_summary)/.test(value)) && similarityFailures.every((value) => !["editorial_summary", "impact_core_summary"].includes(value.field)),
  PREVIEW_CARD_IMPACT_PRECEDES_PROCESS: components.caseCard.indexOf("<OverviewAssessment") < components.caseCard.indexOf("data-woek-process-metadata") && components.governmentActionCard.indexOf("<OverviewAssessment") < components.governmentActionCard.indexOf("data-woek-process-metadata") && livePreviewFailures.every((entry) => !entry.failures.includes("PROCESS_PRECEDES_PUBLICATION_STATUS")),
  PREVIEW_CARD_PROCESS_IS_NOT_MAIN_ASSESSMENT: !/Vor der Entscheidung geprüft|Beobachtung und Rückkopplung|hohe Prüfrelevanz/i.test(components.overview),
  PREVIEW_CARD_NO_GENERIC_SUMMARY: noGeneric,
  PREVIEW_CARD_NO_RAW_INTERNAL_ENUMS: fieldFailures.every((value) => !value.includes("RAW_ENUM")) && liveFailures.every((entry) => !entry.failures.includes("RAW_ENUM_VISIBLE") && !entry.failures.includes("UNREVIEWED_PUBLIC_LABEL_VISIBLE")),
  FACT_ONLY_HAS_NO_ASSESSMENT_SURFACE: !/EditorialReviewAssessment/.test(components.overview) && previewComponents.every((value) => !/EditorialReviewAssessment/.test(value)),
  FACT_ONLY_STATUS_IS_EXPLICIT: /data-woek-fact-only-status/.test(components.publicMaturity),
  UNSUPPORTED_FACH_CONTENT_FAILS_CLOSED: liveFailures.every((entry) => !entry.failures.includes("UNSUPPORTED_FACH_METADATA")),
  FACT_ONLY_HEAD_METADATA_FAILS_CLOSED: liveFailures.every((entry) => !entry.failures.includes("UNSUPPORTED_FACH_METADATA")),
  FACT_ONLY_SEARCH_AND_API_FAIL_CLOSED: /analysisPublished \? item\.intendedGoal : ""/.test(source("app/suche/page.tsx")) && /woekAnalysisPublished: false/.test(source("lib/public-api.ts")),
  RAW_SCHEMA_TERMS_ONLY_IN_EXPLICIT_TECHNICAL_PROOF: !/data-woek-raw-schema-proof="allowed"/.test(components.governmentCard) && !/data-woek-raw-schema-proof="allowed"/.test(source("app/components/recommendations/RecommendationSection.tsx")),
};
const failedGates = Object.entries(gates).filter(([, passed]) => !passed).map(([name]) => name);
const report = {
  schema_version: "2.3-preview-ui-contract-p0",
  generated_at: new Date().toISOString(),
  base_url: baseUrl || null,
  status: failedGates.length ? "FAIL" : "PASS",
  counts: {
    government_fach_total: 63,
    government_public: government.length,
    government_review: readJsonl("data/government/impact-cases/review-impact-records.jsonl").length,
    eu_fach_total: euAll.length,
    eu_public: eu.length,
    eu_review: euAll.length - eu.length,
    parliament_public_analyses: parliament.length,
    routes_checked: routeChecks.length,
  },
  gates: Object.fromEntries(Object.entries(gates).map(([name, passed]) => [name, passed ? "PASS" : "FAIL"])),
  failed_gates: failedGates,
  field_failures: fieldFailures,
  similarity_failures: similarityFailures,
  route_failures: liveFailures,
  route_checks: routeChecks,
};
writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (report.status !== "PASS") process.exit(1);
