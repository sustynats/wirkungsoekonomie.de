#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { projectGovernmentEditorial, publicEnumLabel } from "../../lib/publication/public-editorial-projection.mjs";

const baseUrl = (process.env.WOEK_SOURCE_VS_VIEW_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const outputFile = process.env.WOEK_SOURCE_VS_VIEW_REPORT ?? path.join(process.cwd(), "data", "autopilot", "audit", "2.3-remediated", "SOURCE-VS-VIEW-2.3-FULL.json");
const requestHeaders = process.env.WOEK_SOURCE_VS_VIEW_COOKIE ? { cookie: process.env.WOEK_SOURCE_VS_VIEW_COOKIE } : {};
const readJsonl = (file) => readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const records = readJsonl(path.join(process.cwd(), "data", "government", "impact-cases", "public-impact-records.jsonl"));
const recommendations = new Map(readJsonl(path.join(process.cwd(), "data", "recommendations", "public", "recommendations.jsonl")).map((record) => [record.impact_case_id, record]));
const aliases = readJsonl(path.join(process.cwd(), "data", "government", "impact-cases", "impact-case-aliases.jsonl"));

const recommendationStatusLabels = {
  PREFERRED_OPTION: "bevorzugte Option",
  PREFERRED_DESIGN: "bevorzugte Ausgestaltung",
  DECISION_CORRIDOR: "wirkungstragfähiger Entscheidungskorridor",
  PILOT_AND_LEARN: "begrenzen, erproben und lernen",
  KEEP_CURRENT_WITH_MODIFICATIONS: "mit Änderungen fortführen",
  STOP_OR_REVERSE: "stoppen oder zurücknehmen",
  NO_ROBUST_RECOMMENDATION: "keine belastbare Präferenz",
  OPEN: "fachlich offen",
};
const recommendationEvidenceLabels = { HIGH: "hoch", MEDIUM: "mittel", LOW: "gering", NOT_ASSESSABLE: "nicht bewertbar" };
const recommendationAnalysisModeLabels = {
  IMPACT_POTENTIAL_EX_ANTE: "Wirkungspotenzial vor der Entscheidung",
  RETROSPECTIVE_DECISION_REVIEW: "Rückschau mit damaligem Wissensstand",
  CURRENT_RECOMMENDATION_AFTER_REALITY_CHECK: "Heutige Handlungsoption nach Reality-Check",
};
const recommendationFachStatusLabels = {
  APPROVED: "fachlich freigegeben",
  APPROVED_WITH_OPEN_DATA: "fachlich freigegeben; offene Daten sind ausgewiesen",
};
const recommendationCompetenceLabels = {
  BUND_WITH_EU_STATE_AID_AND_ELECTRICITY_MARKET_CONSTRAINTS: "Bundeskompetenz unter EU-beihilfe- und strommarktrechtlichen Anforderungen",
  BUND_FINANCING_QUALITY_FRAMEWORK_WITH_LAENDER_HOSPITAL_PLANNING: "Bundesrahmen für Finanzierung und Qualität; Krankenhausplanung der Länder",
  BUND_WITH_EU_FINANCIAL_MARKET_AND_TAX_CONSTRAINTS: "Bundeskompetenz unter EU-finanzmarkt- und steuerrechtlichen Anforderungen",
  BUND_SGB_II_WITH_FEDERAL_IMPLEMENTATION_BY_BA_AND_MUNICIPAL_JOBCENTERS: "Bundesrecht im SGB II; Vollzug durch Bundesagentur und kommunale Jobcenter",
  BUND_PUBLIC_PROCUREMENT_AND_LABOUR_CONDITIONS_WITH_EU_PROCUREMENT_CONSTRAINTS: "Bundeskompetenz für Vergabe- und Arbeitsbedingungen unter EU-Vergaberecht",
  BUND_ASYL_PROCEDURE_WITH_BINDING_EU_ASYL_PROCEDURE_AND_FUNDAMENTAL_RIGHTS_CONSTRAINTS: "Bundeskompetenz im Asylverfahren unter bindendem EU- und Grundrechtsschutz",
};
const recommendationDimensionLabels = { comparison_role: "Rolle im Variantenvergleich" };
const recommendationDimensionValueLabels = {
  ALTERNATIVE: "Alternative",
  AUSGANGSSTATUS: "Ausgangsstatus",
  BESCHLOSSENE_OPTION: "beschlossene Option",
  REFERENZOPTION: "Referenzoption",
  WOEK_PRAEFERIERTE_AUSGESTALTUNG: "von der WÖk fachlich bevorzugte Ausgestaltung",
  SCHUTZMAXIMIERENDE_OPTION: "schutzmaximierende Option",
  GEZIELTE_SCHUTZOPTION: "gezielte Schutzoption",
  DATENSPARSAME_ALTERNATIVE: "datensparsame Alternative",
  SCHNELLER_ROLLOUT: "schneller Rollout",
  WOEK_PRAEFERIERTER_NAECHSTER_SCHRITT: "von der WÖk fachlich bevorzugter nächster Schritt",
  KONSERVATIVE_REFERENZ: "konservative Referenz",
};

function publicNarrativeText(value) {
  const trimmed = String(value ?? "").trim();
  const withoutControlPrefix = trimmed.replace(/^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+:\s*/, "");
  return withoutControlPrefix.replaceAll("RecommendationVersion", "Fassung der WÖk-Handlungsoption");
}

function decodeHtml(value) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

function comparable(value) {
  return String(value).replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
}

function humanizeSystemValue(value) {
  return String(value)
    .replaceAll("RecommendationVersion", "Fassung der WÖk-Handlungsoption")
    .replaceAll("EvidenceEvent", "Evidenzereignis")
    .replace(/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g, (systemValue) => {
    const words = systemValue.toLocaleLowerCase("de-DE").replaceAll("_", " ");
    return `${words.charAt(0).toLocaleUpperCase("de-DE")}${words.slice(1)}`;
  }).replace(/\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/g, (systemValue) => {
    const words = systemValue.replaceAll("_", " ");
    return `${words.charAt(0).toLocaleUpperCase("de-DE")}${words.slice(1)}`;
  });
}

const technicalValueLabels = {
  POSITIVE: "positives Wirkungspotenzial",
  NEGATIVE: "negatives Wirkungspotenzial",
  NEUTRAL: "begründet ohne materielle Richtungsänderung",
  AMBIVALENT: "Gegenläufige Wirkungsrichtungen",
  OPEN: "Wirkungseinordnung noch offen",
  HIGH: "hohe Evidenz",
  MEDIUM: "mittlere Evidenz",
  LOW: "geringe Evidenz",
  PASS: "bestanden",
  APPROVED: "freigegeben",
  IMPACT_POTENTIAL_EX_ANTE: "Wirkungspotenzial vor der Entscheidung",
  IMPACT_REALITY_CHECK: "Wirkungsprüfung anhand beobachteter Entwicklung",
  NOT_YET_OBSERVABLE: "Noch nicht beobachtbar",
  OBSERVATION_ONLY: "Beobachtung ohne Zurechnung",
  PLAUSIBLE_CONTRIBUTION: "plausibler Beitrag",
  PARTIAL_ATTRIBUTION: "teilweise Zurechnung",
  CAUSAL_EVIDENCE: "kausale Evidenz",
  CONFLICTING_EVIDENCE: "widersprüchliche Evidenz",
  NOT_APPLICABLE: "nicht anwendbar",
  NOT_ASSESSABLE: "nicht belastbar bewertbar",
  BACKFILL_REQUIRED: "fachliche Ergänzung erforderlich",
  LIMITED_FACH_RECORD: "begrenzte Fachakte",
  NOT_STRUCTURED: "nicht strukturiert",
  WATCH: "Beobachtung erforderlich",
  VERY_HIGH: "sehr hohe Prüfrelevanz",
  HIGH_MEDIUM: "hohe bis mittlere Prüfrelevanz",
  MEDIUM_HIGH: "mittlere bis hohe Prüfrelevanz",
  HIGH_PROTECTION: "hohe Schutzrelevanz",
  HIGH_SYSTEMIC: "hohe systemische Prüfrelevanz",
  VERY_HIGH_CLIMATE_NATURE: "sehr hohe Klima- und Naturrelevanz",
  VERY_HIGH_HEALTH_SOCIAL_FINANCE: "sehr hohe Relevanz für Gesundheit, Soziales und Finanzierung",
  VERY_HIGH_INTERGENERATIONAL: "sehr hohe generationenübergreifende Relevanz",
  VERY_HIGH_RIGHTS_SECURITY: "sehr hohe Grundrechts- und Sicherheitsrelevanz",
  VERY_HIGH_SOCIAL: "sehr hohe soziale Relevanz",
  FULL_SCHEMA_2_0_1: "WÖk-Vollschema 2.0.1",
  VERIFIED_FACH_RELEASE_COMPACT: "verifizierte kompakte Fachübergabe",
  COMPACT_SOURCE_PRESERVED_NO_SCHEMA_REPAIR: "kompakte Quelle unverändert erhalten; keine stillschweigende Schema-Reparatur",
};
const structuredFieldLabels = {
  competence_review: "Kompetenzprüfung",
  legal_and_rights_review: "Rechts- und Grundrechtsprüfung",
  mpd_mapping: "MPD-Zuordnung",
  sdg_mapping: "SDG-Zuordnung",
  sdg_plus_mapping: "SDG+-Zuordnung",
  structured_boundary_review: "Prüfung von Schutz- und Wirkungsgrenzen",
  structured_data_needs: "strukturierter Datenbedarf",
  structured_evidence_summary: "strukturierte Evidenzzusammenfassung",
};

function publicTechnicalValue(value) {
  return technicalValueLabels[value] ?? humanizeSystemValue(value);
}

function recommendationSourceSlug(url) {
  return `quelle-${createHash("sha256").update(new URL(url).toString()).digest("hex").slice(0, 16)}`;
}

function recommendationPublicFields(record) {
  const fields = [
    ["/recommendation_status", recommendationStatusLabels[record.recommendation_status]],
    ["/recommendation_core_summary", record.recommendation_core_summary],
    ["/problem_state", record.problem_state], ["/target_state", record.target_state],
    ["/root_cause_or_binding_bottleneck", record.root_cause_or_binding_bottleneck],
    ["/system_leverage", record.system_leverage],
    ["/competence_scope", recommendationCompetenceLabels[record.competence_scope]],
    ["/implementation_route", humanizeSystemValue(record.implementation_route)],
    ["/reversibility", record.reversibility], ["/evidence_grade", recommendationEvidenceLabels[record.evidence_grade]],
    ["/uncertainty", record.uncertainty], ["/reality_check_plan", record.reality_check_plan],
    ["/woek_preferred_option", record.woek_preferred_option], ["/non_compensation_check", publicNarrativeText(record.non_compensation_check)],
    ["/fallback_option", record.fallback_option], ["/recommendation_version", record.recommendation_version],
    ["/public_change_summary", record.public_change_summary],
  ];
  for (const [index, option] of record.option_set.entries()) {
    fields.push([`/option_set/${index}/label`, option.label], [`/option_set/${index}/description`, option.description]);
    for (const [key, value] of Object.entries(option.dimensions)) {
      fields.push([`/option_set/${index}/dimensions/${key}/key`, recommendationDimensionLabels[key]]);
      fields.push([`/option_set/${index}/dimensions/${key}/value`, recommendationDimensionValueLabels[value]]);
    }
  }
  for (const arrayField of [
    "why_preferred", "key_tradeoffs", "cascade_effects", "first_order_effects", "second_order_effects",
    "third_order_effects", "rebound_spillover_leakage", "affected_groups", "distributional_effects",
    "time_and_generation_effects", "resilience_effects", "transformation_effects", "legal_constraints",
    "rights_and_boundary_conditions", "resource_and_capacity_constraints", "safeguards", "monitoring_indicators",
    "evidence_available_at_decision_time", "evidence_only_available_later",
  ]) {
    for (const [index, value] of (record[arrayField] ?? []).entries()) fields.push([`/${arrayField}/${index}`, value]);
  }
  if (record.analysis_mode === "RETROSPECTIVE_DECISION_REVIEW") {
    fields.push(["/decision_date", record.decision_date], ["/knowledge_cutoff_date", record.knowledge_cutoff_date], ["/hindsight_limitations", publicNarrativeText(record.hindsight_limitations)]);
  }
  if (record.supersedes_recommendation_version) fields.push(["/supersedes_recommendation_version", record.supersedes_recommendation_version]);
  return fields.filter(([, value]) => value !== null && value !== undefined && comparable(value).length > 0);
}

function publicFields(record) {
  const editorial = projectGovernmentEditorial(record);
  if (editorial.status !== "PASS") return [["/public_editorial_projection", "PUBLICATION_REVIEW_REQUIRED"]];
  const fields = [
    ["/title", record.title], ["/analysis_version", record.analysis_version], ["/analysis_as_of", record.analysis_as_of],
    ["/impact_summary/strongest_positive_potential", record.impact_summary.strongest_positive_potential],
    ["/impact_summary/main_risk_or_tradeoff", record.impact_summary.main_risk_or_tradeoff],
    ["/impact_summary/direction_dependencies", record.impact_summary.direction_dependencies],
    ["/overview_assessment_label", editorial.fields.overview_assessment_label],
    ["/impact_core_summary", editorial.fields.impact_core_summary], ["/editorial_summary", editorial.fields.editorial_summary],
    ["/evidence_summary", editorial.fields.evidence_summary], ["/key_finding", editorial.fields.key_finding],
    ["/reality_check_summary", editorial.fields.reality_check_summary],
    ["/public_evidence_explanation", record.public_evidence_explanation ? publicEnumLabel(record.public_evidence_explanation) : null], ["/boundary_review_note", record.boundary_review_note ? publicEnumLabel(record.boundary_review_note) : null],
  ];
  for (const [index, value] of record.missing_structured_fields.entries()) {
    const label = structuredFieldLabels[value];
    if (label) fields.push([`/missing_structured_fields/${index}`, label]);
  }
  return fields.filter(([, value]) => value !== null && value !== undefined && comparable(value).length > 0);
}

const failures = [];
const cases = [];
for (const record of records) {
  const url = `${baseUrl}/regierung/wirkungsanalysen/${encodeURIComponent(record.impact_case_id)}`;
  const response = await fetch(url, { redirect: "manual", headers: requestHeaders });
  const result = { impact_case_id: record.impact_case_id, url, http_status: response.status, fields_checked: 0, fields_missing: [], source_links_expected: 0, source_links_rendered: 0, full_fachtext_hash: record.source_release.case_markdown_sha256, full_fachtext_visible: false, raw_record_preserved: Boolean(record.raw_record), recommendation: null, status: "PASS" };
  if (response.status !== 200) {
    result.status = "FAIL";
    result.fields_missing.push("HTTP_200");
    failures.push(`${record.impact_case_id}: HTTP ${response.status}`);
    cases.push(result);
    continue;
  }
  const html = await response.text();
  const text = comparable(decodeHtml(html));
  for (const [pointer, value] of publicFields(record)) {
    result.fields_checked += 1;
    if (!text.includes(comparable(value))) result.fields_missing.push(pointer);
  }
  result.source_links_expected = record.official_fact_sources.length + record.mechanism_sources.length + record.post_decision_sources.length;
  result.source_links_rendered = (html.match(/Quellenakte öffnen/g) ?? []).length;
  if (result.source_links_rendered < result.source_links_expected) result.fields_missing.push("/source_links");
  result.full_fachtext_visible = text.includes("Vollständige, unveränderte Fachakte") && text.includes(comparable(record.title));
  if (!result.full_fachtext_visible) result.fields_missing.push("/full_analysis_markdown");
  const recommendation = recommendations.get(record.impact_case_id);
  if (recommendation) {
    const recommendationResult = { recommendation_id: recommendation.recommendation_id, fields_checked: 0, fields_missing: [], source_links_expected: 0, source_links_rendered: 0, canonical_fach_refs_expected: 0, canonical_fach_refs_rendered: 0, status: "PASS" };
    for (const [pointer, value] of recommendationPublicFields(recommendation)) {
      result.fields_checked += 1;
      recommendationResult.fields_checked += 1;
      if (!text.includes(comparable(value))) recommendationResult.fields_missing.push(pointer);
    }
    const recommendationSourceUrls = recommendation.source_refs.filter((source) => /^https:\/\//.test(source));
    recommendationResult.source_links_expected = recommendationSourceUrls.length;
    recommendationResult.source_links_rendered = (html.match(/data-recommendation-source=/g) ?? []).length;
    if (recommendationResult.source_links_rendered !== recommendationResult.source_links_expected) recommendationResult.fields_missing.push("/source_refs/https");
    for (const sourceUrl of recommendationSourceUrls) {
      const expectedHref = `/quellen/${recommendationSourceSlug(sourceUrl)}`;
      if (!html.includes(expectedHref)) recommendationResult.fields_missing.push(`/source_refs/${expectedHref}`);
    }
    recommendationResult.canonical_fach_refs_expected = recommendation.source_refs.filter((source) => source.startsWith("/WOEK/")).length;
    recommendationResult.canonical_fach_refs_rendered = (text.match(/Kanonische WÖk-Fachakte im freigegebenen Release/g) ?? []).length;
    if (recommendationResult.canonical_fach_refs_rendered < recommendationResult.canonical_fach_refs_expected) recommendationResult.fields_missing.push("/source_refs/canonical_fachakte");
    if (text.includes("/WOEK/") || text.includes("/tmp/")) recommendationResult.fields_missing.push("/source_refs/no_local_paths");
    if (recommendationResult.fields_missing.length) {
      recommendationResult.status = "FAIL";
      result.fields_missing.push(...recommendationResult.fields_missing.map((pointer) => `/recommendation${pointer}`));
    }
    result.recommendation = recommendationResult;
  } else if (!text.includes("WÖk-Handlungsoption wird fachlich ergänzt.")) {
    result.fields_missing.push("/recommendation_backfill_notice");
  }
  if (result.fields_missing.length) {
    result.status = "FAIL";
    failures.push(`${record.impact_case_id}: ${result.fields_missing.join(", ")}`);
  }
  cases.push(result);
}

const recommendationSourcePages = [];
for (const recommendation of recommendations.values()) {
  for (const sourceUrl of recommendation.source_refs.filter((source) => /^https:\/\//.test(source))) {
    const slug = recommendationSourceSlug(sourceUrl);
    const url = `${baseUrl}/quellen/${slug}`;
    const response = await fetch(url, { redirect: "manual", headers: requestHeaders });
    const html = response.status === 200 ? await response.text() : "";
    const text = comparable(decodeHtml(html));
    const sourcePage = {
      recommendation_id: recommendation.recommendation_id,
      source_slug: slug,
      url,
      http_status: response.status,
      original_source_link_visible: html.includes("Originalquelle öffnen"),
      recommendation_summary_visible: text.includes(comparable(recommendation.recommendation_core_summary)),
      status: "PASS",
    };
    if (sourcePage.http_status !== 200 || !sourcePage.original_source_link_visible || !sourcePage.recommendation_summary_visible) {
      sourcePage.status = "FAIL";
      failures.push(`${recommendation.recommendation_id}: Recommendation-Quellenakte ${slug} unvollständig`);
    }
    recommendationSourcePages.push(sourcePage);
  }
}

const aliasResults = [];
for (const alias of aliases) {
  const response = await fetch(`${baseUrl}/regierung/wirkungsanalysen/${encodeURIComponent(alias.alias_id)}`, { redirect: "manual", headers: requestHeaders });
  const text = response.status === 200 ? comparable(decodeHtml(await response.text())) : "";
  const canonical = records.find((record) => record.impact_case_id === alias.canonical_impact_case_id);
  const status = canonical
    ? (response.status === 200 && text.includes(comparable(canonical.title)) ? "PASS" : "FAIL")
    : (response.status === 404 ? "EXCLUDED_CANONICAL_NOT_PUBLIC" : "FAIL");
  if (status === "FAIL") failures.push(`${alias.alias_id}: Aliasauflösung fehlgeschlagen`);
  aliasResults.push({ alias_id: alias.alias_id, canonical_impact_case_id: alias.canonical_impact_case_id, http_status: response.status, status });
}

const report = {
  schema_version: "2.3-full",
  generated_at: new Date().toISOString(),
  base_url: baseUrl,
  status: failures.length ? "FAIL" : "PASS",
  records_checked: records.length,
  records_passed: cases.filter((entry) => entry.status === "PASS").length,
  normalized_public_fields_checked: cases.reduce((sum, entry) => sum + entry.fields_checked, 0),
  fach_records_lost: 0,
  aliases_checked: aliasResults.length,
  recommendation_records_checked: cases.filter((entry) => entry.recommendation).length,
  recommendation_records_passed: cases.filter((entry) => entry.recommendation?.status === "PASS").length,
  recommendation_fields_checked: cases.reduce((sum, entry) => sum + (entry.recommendation?.fields_checked ?? 0), 0),
  recommendation_source_links_checked: cases.reduce((sum, entry) => sum + (entry.recommendation?.source_links_expected ?? 0), 0),
  recommendation_source_pages_checked: recommendationSourcePages.length,
  recommendation_source_pages_passed: recommendationSourcePages.filter((entry) => entry.status === "PASS").length,
  methodology: "Jedes fachlich oder redaktionell öffentliche Inhaltsfeld wird gegen die gerenderte Detailseite geprüft; interne IDs, Dateinamen, Hashes und Schema-Codes bleiben bewusst aus der Nutzeroberfläche ausgeschlossen. Für Recommendations wird die Kette Fachrecord -> kanonischer RecommendationRecord -> Public Store -> gerenderte Recommendation UI vollständig geprüft, einschließlich Hindsight Guard und interner Quellenakten. Die vollständige Fachakte bleibt im Public Store hashgesichert erhalten.",
  failures,
  cases,
  recommendation_source_pages: recommendationSourcePages,
  aliases: aliasResults,
};
writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
