#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { assessEditorialQuality, findGenericEditorialPatterns } from "../lib/publication/editorial-quality.mjs";

const projectRoot = process.cwd();
const fachRoot = process.env.WOEK_GOVERNMENT_FACHRELEASE_ROOT
  ?? path.join(projectRoot, "government-data", "fachrelease", "WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0");
const analysisRoot = path.join(fachRoot, "analysis");
const outputRoot = path.join(projectRoot, "data", "government", "impact-cases");
const importedAt = process.env.WOEK_IMPORT_TIMESTAMP ?? new Date().toISOString();

const waves = ["1", "2", "3", "4", "5", "6", "7A", "7B", "8", "9", "10", "11"];
const editorialManifestName = "GOVERNMENT-EDITORIAL-LAYER-MANIFEST-2.0-2026-08-18.json";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function readJsonl(file) {
  return readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function writeJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeJsonl(file, values) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${values.map((value) => JSON.stringify(value)).join("\n")}\n`);
}

function normalize(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function extractCaseMarkdown(markdown, title, impactCaseId) {
  const lines = markdown.split(/\r?\n/);
  const titleNeedle = normalize(title);
  const titleTokens = titleNeedle.split(" ").filter((token) => token.length >= 3 && !["und", "oder", "mit", "zur", "zum", "der", "die", "das"].includes(token));
  const idTokens = normalize(impactCaseId).split(" ").filter((token) => token.length >= 3);
  let start = -1;
  const exactIdLine = lines.findIndex((line) => line.includes(`\`${impactCaseId}\``));
  if (exactIdLine >= 0) {
    for (let index = exactIdLine; index >= 0; index -= 1) {
      if (/^#\s+/.test(lines[index])) {
        start = index;
        break;
      }
    }
  }
  for (let index = 0; index < lines.length; index += 1) {
    if (start >= 0) break;
    if (!/^#\s+/.test(lines[index])) continue;
    const heading = normalize(lines[index].replace(/^#\s+/, ""));
    if (heading.includes(titleNeedle) || titleNeedle.includes(heading.replace(/^\d+\s+/, ""))) {
      start = index;
      break;
    }
    const tokenMatches = idTokens.filter((token) => heading.includes(token)).length;
    if (tokenMatches >= Math.min(3, idTokens.length)) {
      start = index;
      break;
    }
    const titleTokenMatches = titleTokens.filter((token) => heading.includes(token)).length;
    if (titleTokens.length > 0 && titleTokenMatches / titleTokens.length >= 0.7) {
      start = index;
      break;
    }
  }
  if (start < 0) throw new Error(`Fachtext-Abschnitt nicht gefunden: ${impactCaseId} / ${title}`);
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^#\s+/.test(lines[index])) {
      end = index;
      break;
    }
  }
  return lines.slice(start, end).join("\n").trim();
}

function stringValue(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join("; ");
  if (value && typeof value === "object") return Object.values(value).filter((entry) => typeof entry === "string").join("; ");
  return "";
}

function mapDirection(value) {
  const direction = String(value ?? "OPEN").toUpperCase();
  if (direction.includes("NO_SINGLE_DIRECTION") || direction.includes("PORTFOLIO_DEPENDENT")) return "OPEN";
  if (direction.startsWith("AMBIVALENT") || direction.startsWith("MIXED") || direction.startsWith("TRADEOFF")) return "AMBIVALENT";
  if (direction.startsWith("PREDOMINANTLY_POSITIVE") || direction.startsWith("STRONG_POSITIVE") || direction.startsWith("POSITIVE")) return "POSITIVE";
  if (direction.startsWith("PREDOMINANTLY_NEGATIVE") || direction.startsWith("STRONG_NEGATIVE") || direction.startsWith("NEGATIVE")) return "NEGATIVE";
  if (direction.includes("NEUTRAL")) return "NEUTRAL";
  return "OPEN";
}

function overviewAssessmentLabel(direction, overallCharacter) {
  const overall = String(overallCharacter ?? "").toUpperCase();
  if (overall.includes("NO_SINGLE_DIRECTION")) return "Keine belastbare Gesamtrichtung ohne Portfolio-Aufschlüsselung";
  return {
    POSITIVE: "Überwiegend positives Wirkungspotenzial mit separat sichtbaren Risiken",
    NEGATIVE: "Überwiegend negatives Wirkungspotenzial",
    AMBIVALENT: "Gegenläufige Wirkungspotenziale und Risiken",
    NEUTRAL: "Begründet ohne materielle Richtungsänderung",
    OPEN: "Wirkungsrichtung fachlich offen",
  }[direction] ?? "Wirkungsrichtung fachlich offen";
}

function embeddedImpactCaseIds(markdown) {
  return [...markdown.matchAll(/(?:ImpactCase(?:\/Container)?|ImpactCase-ID):?\*{0,2}\s*`([^`]+)`/g)]
    .map((match) => match[1])
    .filter(Boolean);
}

function mapEvidence(value) {
  const evidence = String(value ?? "NOT_ASSESSABLE").toUpperCase();
  if (evidence.startsWith("HIGH")) return "HIGH";
  if (evidence.startsWith("MEDIUM")) return "MEDIUM";
  if (evidence.startsWith("LOW")) return "LOW";
  return "NOT_ASSESSABLE";
}

function mapReality(value) {
  const raw = typeof value === "object" && value ? value.status : value;
  const status = String(raw ?? "NOT_YET_OBSERVABLE").toUpperCase();
  if (status.includes("NOT_APPLICABLE")) return "NOT_APPLICABLE";
  if (status.includes("CONFLICTING")) return "CONFLICTING_EVIDENCE";
  if (status.includes("CAUSAL")) return "CAUSAL_EVIDENCE";
  if (status.includes("PARTIAL_ATTRIBUTION")) return "PARTIAL_ATTRIBUTION";
  if (status.includes("PLAUSIBLE_CONTRIBUTION")) return "PLAUSIBLE_CONTRIBUTION";
  if (status.includes("OBSERVATION")) return "OBSERVATION_ONLY";
  return "NOT_YET_OBSERVABLE";
}

function mapBoundary(value) {
  if (Array.isArray(value)) {
    const statuses = value.map((item) => String(item?.status ?? "OPEN").toUpperCase());
    if (statuses.includes("BLOCK")) return "BLOCK";
    if (statuses.includes("WATCH")) return "WATCH";
    if (statuses.includes("OPEN")) return "OPEN";
    return "PASS";
  }
  const status = String(value?.status ?? "OPEN").toUpperCase();
  return ["PASS", "WATCH", "BLOCK", "OPEN"].includes(status) ? status : "OPEN";
}

function linkedActionIds(record) {
  if (Array.isArray(record.linked_government_actions)) return record.linked_government_actions;
  if (Array.isArray(record.linked_objects?.government_action_ids)) return record.linked_objects.government_action_ids;
  return [];
}

function loadEditorialLayer() {
  const manifestPath = path.join(analysisRoot, editorialManifestName);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.status !== "LEADING_PUBLIC_EDITORIAL_LAYER") {
    throw new Error(`Ungueltiger Editorial-Layer-Status: ${manifest.status}`);
  }
  const byId = new Map();
  const sourceHashes = {};
  for (const part of manifest.parts) {
    const file = path.join(analysisRoot, part.file);
    const content = readFileSync(file, "utf8");
    sourceHashes[part.file] = sha256(content);
    for (const record of readJsonl(file)) {
      if (byId.has(record.impact_case_id)) throw new Error(`Doppelte Editorial-ID: ${record.impact_case_id}`);
      for (const field of manifest.required_fields) {
        if (!String(record[field] ?? "").trim()) throw new Error(`Editorial-Pflichtfeld fehlt: ${record.impact_case_id} / ${field}`);
      }
      byId.set(record.impact_case_id, record);
    }
  }
  const correctionsPath = path.join(analysisRoot, manifest.corrections_overlay);
  const correctionsContent = readFileSync(correctionsPath, "utf8");
  sourceHashes[manifest.corrections_overlay] = sha256(correctionsContent);
  for (const correction of readJsonl(correctionsPath)) {
    const current = byId.get(correction.impact_case_id);
    if (!current) throw new Error(`Editorial-Korrektur ohne Basisdatensatz: ${correction.impact_case_id}`);
    if (!manifest.required_fields.includes(correction.field)) throw new Error(`Nicht erlaubtes Editorial-Korrekturfeld: ${correction.field}`);
    byId.set(correction.impact_case_id, { ...current, [correction.field]: correction.replacement });
  }
  if (byId.size !== manifest.validation.expected_unique_impact_case_ids) {
    throw new Error(`Editorial-Coverage ${byId.size} statt ${manifest.validation.expected_unique_impact_case_ids}`);
  }
  return { byId, manifest, sourceHashes, manifestHash: sha256(readFileSync(manifestPath, "utf8")) };
}

const schema = JSON.parse(readFileSync(path.join(outputRoot, "WOEK-IMPACT-CASE-SCHEMA-2.0.1.json"), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateFull = ajv.compile(schema);
const editorialLayer = loadEditorialLayer();

const records = [];
const importAudit = [];
const seenIds = new Set();
const aliases = [];

for (const wave of waves) {
  const jsonName = `GOVERNMENT-IMPACT-CASES-WAVE-${wave}.jsonl`;
  const markdownName = `GOVERNMENT-IMPACT-CASES-WAVE-${wave}.md`;
  const jsonPath = path.join(analysisRoot, jsonName);
  const markdownPath = path.join(analysisRoot, markdownName);
  const jsonContent = readFileSync(jsonPath, "utf8");
  const markdown = readFileSync(markdownPath, "utf8");
  const waveRecords = readJsonl(jsonPath);

  for (const raw of waveRecords) {
    if (seenIds.has(raw.impact_case_id)) throw new Error(`Doppelte impact_case_id: ${raw.impact_case_id}`);
    seenIds.add(raw.impact_case_id);
    const fullSchemaValid = Boolean(validateFull(raw));
    const fullAnalysisMarkdown = extractCaseMarkdown(markdown, raw.title, raw.impact_case_id);
    const fullSummary = raw.impact_summary ?? {};
    const compactPaths = Array.isArray(raw.impact_paths) ? raw.impact_paths : [];
    const pathDirections = compactPaths.map((item) => mapDirection(item.direction));
    const overallCharacter = fullSummary.overall_character ?? raw.overall_character ?? raw.direction ?? "OPEN";
    const primaryDirection = pathDirections.includes("AMBIVALENT")
      || (pathDirections.includes("POSITIVE") && pathDirections.includes("NEGATIVE"))
      ? "AMBIVALENT"
      : mapDirection(overallCharacter);
    const evidenceValues = fullSchemaValid
      ? raw.impact_paths.map((item) => item.evidence)
      : [raw.evidence];
    const evidence = evidenceValues.map(mapEvidence).find((value) => value !== "NOT_ASSESSABLE") ?? "NOT_ASSESSABLE";
    const officialSources = fullSchemaValid
      ? raw.references.official_fact_sources
      : raw.official_fact_sources ?? raw.sources ?? [];
    const mechanismSources = fullSchemaValid ? raw.references.mechanism_sources : [];
    const postDecisionSources = fullSchemaValid ? raw.references.post_decision_sources : [];
    const positivePotential = fullSummary.strongest_positive_potential
      ?? raw.strongest_positive_potential
      ?? raw.key_positive_potential
      ?? stringValue(compactPaths.find((item) => mapDirection(item.direction) === "POSITIVE")?.state_change);
    const mainRisk = fullSummary.main_risk_or_tradeoff
      ?? raw.main_risk_or_tradeoff
      ?? raw.key_risk
      ?? stringValue(compactPaths.find((item) => mapDirection(item.direction) === "NEGATIVE")?.state_change);
    const centralLever = fullSummary.central_lever ?? raw.central_lever ?? "";
    const publicSummary = fullSummary.public_summary ?? "";
    const analysisAsOf = raw.scope?.analysis_as_of ?? raw.analysis_as_of ?? "2026-08-17";
    const analysisVersion = raw.analysis_version ?? `2.0-W${wave}`;
    const profile = fullSchemaValid ? "FULL_SCHEMA_2_0_1" : "VERIFIED_FACH_RELEASE_COMPACT";
    const editorial = editorialLayer.byId.get(raw.impact_case_id);
    if (!editorial) throw new Error(`Fuehrender Editorial-Layer fehlt: ${raw.impact_case_id}`);

    const embeddedIds = [...new Set(embeddedImpactCaseIds(fullAnalysisMarkdown))];
    for (const embeddedId of embeddedIds) {
      if (embeddedId !== raw.impact_case_id) aliases.push({
        alias_id: embeddedId,
        canonical_impact_case_id: raw.impact_case_id,
        relationship: "SAME_FACH_CASE_ID_ALIAS",
        source_file: markdownName,
        reason: "Die menschenlesbare Fachakte und die maschinenlesbare Wellenübergabe verwenden unterschiedliche IDs für denselben ausdrücklich bezeichneten ImpactCase.",
      });
    }
    const missingStructuredFields = fullSchemaValid
      ? [raw.scope?.competence_note ? null : "competence_review"].filter(Boolean)
      : ["competence_review", "legal_and_rights_review", "mpd_mapping", "sdg_mapping", "sdg_plus_mapping", "structured_boundary_review", "structured_data_needs", "structured_evidence_summary"];
    const competenceReviewStatus = raw.scope?.competence_note ? "REVIEWED_CONCRETE" : "NOT_STRUCTURED";
    const publicAnalysisDepth = missingStructuredFields.length === 0 ? "FULL_STRUCTURED" : "LIMITED_FACH_RECORD";
    const realitySummary = fullSchemaValid
      ? `${mapReality(raw.reality_check)}. ${raw.reality_check?.attribution ?? "Eine Zurechnung ist nicht als belegt ausgewiesen."}`
      : `${mapReality(raw.reality_check)}. Der kompakte Fachdatensatz enthält noch keine vollständig strukturierte Reality-Check- und Zurechnungsebene.`;
    const evidenceSummaryText = fullSchemaValid
      ? [raw.evidence_summary.fact_evidence, raw.evidence_summary.mechanism_evidence, raw.evidence_summary.effect_evidence, raw.evidence_summary.uncertainty].join(" ")
      : `Fachlicher Evidenzcode: ${String(raw.evidence ?? "NOT_ASSESSABLE")}. Die vollständige strukturierte Trennung von Fakt-, Mechanismus- und Wirkungsevidenz ist in dieser kompakten Übergabe nicht enthalten.`;

    const normalizedRecord = {
      record_profile: profile,
      schema_id: fullSchemaValid ? schema.$id : null,
      schema_validation: fullSchemaValid ? "PASS" : "COMPACT_SOURCE_PRESERVED_NO_SCHEMA_REPAIR",
      impact_case_id: raw.impact_case_id,
      title: raw.title,
      analysis_mode: String(raw.analysis_mode).includes("REALITY") ? "IMPACT_REALITY_CHECK" : "IMPACT_POTENTIAL_EX_ANTE",
      publication_analysis_status: raw.publication_analysis_status ?? "STANDARD_WOEK_ANALYSIS",
      publication_status: "APPROVED",
      analysis_version: analysisVersion,
      analysis_as_of: analysisAsOf,
      materiality: typeof raw.materiality === "object" ? raw.materiality.level : raw.materiality,
      overall_character: String(overallCharacter),
      primary_direction: primaryDirection,
      overview_assessment_label: overviewAssessmentLabel(primaryDirection, overallCharacter),
      evidence_level: evidence,
      evidence_summary_text: evidenceSummaryText,
      implementation_status: raw.scope?.implementation_state ?? raw.implementation_state ?? raw.status ?? "OPEN",
      impact_summary: {
        public_summary: publicSummary,
        central_lever: centralLever,
        strongest_positive_potential: positivePotential ?? "",
        main_risk_or_tradeoff: mainRisk ?? "",
        direction_dependencies: fullSummary.direction_dependencies ?? "",
        measurement_priority: fullSummary.measurement_priority ?? stringValue(raw.measurement_priority ?? raw.monitoring),
      },
      impact_core_summary: editorial.impact_core_summary,
      editorial_summary: editorial.editorial_summary,
      key_finding: editorial.key_finding,
      public_analysis_depth: publicAnalysisDepth,
      missing_structured_fields: missingStructuredFields,
      competence_review_status: competenceReviewStatus,
      competence_status: raw.scope?.competence_note ?? "In der Fachübergabe nicht strukturiert geprüft",
      boundary_status: mapBoundary(raw.boundary_review ?? { status: raw.boundaries?.length ? "WATCH" : "OPEN" }),
      reality_check_status: mapReality(raw.reality_check_status ?? raw.reality_check),
      reality_check_summary: realitySummary,
      recommendation_status: "BACKFILL_REQUIRED",
      linked_government_action_ids: linkedActionIds(raw),
      official_fact_sources: officialSources,
      mechanism_sources: mechanismSources,
      post_decision_sources: postDecisionSources,
      full_analysis_markdown: fullAnalysisMarkdown,
      editorial_source: {
        manifest_file: editorialManifestName,
        manifest_sha256: editorialLayer.manifestHash,
        layer_status: editorialLayer.manifest.status,
      },
      source_release: {
        jsonl_file: jsonName,
        jsonl_sha256: sha256(jsonContent),
        markdown_file: markdownName,
        markdown_sha256: sha256(markdown),
        case_markdown_sha256: sha256(fullAnalysisMarkdown),
        imported_at: importedAt,
      },
      raw_record: raw,
    };
    const editorialQuality = assessEditorialQuality(normalizedRecord);
    records.push({
      ...normalizedRecord,
      publication_status: editorialQuality.status === "PASS" ? "APPROVED" : "BLOCKED_EDITORIAL_QUALITY",
      editorial_quality: editorialQuality,
    });
    importAudit.push({
      impact_case_id: raw.impact_case_id,
      wave,
      record_profile: profile,
      full_schema_valid: fullSchemaValid,
      markdown_section_found: true,
      fach_content_preserved: true,
      publication_status: editorialQuality.status === "PASS" ? "APPROVED" : "BLOCKED_EDITORIAL_QUALITY",
      editorial_quality: editorialQuality,
      source_file: jsonName,
    });
  }
}

const fullCount = records.filter((record) => record.record_profile === "FULL_SCHEMA_2_0_1").length;
const compactCount = records.length - fullCount;
const publicRecords = records.filter((record) => record.publication_status === "APPROVED");
const reviewRecords = records.filter((record) => record.publication_status !== "APPROVED");
const genericEditorialPatterns = findGenericEditorialPatterns(publicRecords);
if (genericEditorialPatterns.length > 0) {
  throw new Error(`GENERIC_EDITORIAL_PATTERN_DETECTED: ${JSON.stringify(genericEditorialPatterns)}`);
}
const meta = {
  fachrelease: "WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0",
  imported_at: importedAt,
  impact_cases_total: records.length,
  impact_cases_full_schema_2_0_1: fullCount,
  impact_cases_compact_source_preserved: compactCount,
  impact_cases_published: publicRecords.length,
  impact_cases_blocked_editorial_quality: reviewRecords.length,
  fach_content_loss: 0,
  editorial_layer_status: editorialLayer.manifest.status,
  editorial_layer_coverage: editorialLayer.byId.size,
  editorial_layer_manifest: editorialManifestName,
  editorial_layer_source_hashes: editorialLayer.sourceHashes,
  note: "Alle 63 Fachdatensätze bleiben verlustfrei erhalten. Öffentlich als fertige WÖk-Analyse erscheinen nur Fälle, die zusätzlich das redaktionelle P0-Gate bestehen. Nicht bestandene Fälle verbleiben mit vollständigem Fachtext im Review-Store; CodeX erzeugt keine Ersatztexte.",
};

writeJsonl(path.join(outputRoot, "public-impact-records.jsonl"), publicRecords);
writeJsonl(path.join(outputRoot, "review-impact-records.jsonl"), reviewRecords);
writeJsonl(path.join(outputRoot, "impact-case-aliases.jsonl"), aliases);
writeJson(path.join(outputRoot, "public-impact-records-meta.json"), meta);
writeJson(path.join(outputRoot, "fachrelease-import-audit.json"), importAudit);
writeJson(path.join(outputRoot, "editorial-pattern-review.json"), genericEditorialPatterns);
console.log(JSON.stringify(meta, null, 2));
