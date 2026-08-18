#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const projectRoot = process.cwd();
const fachRoot = process.env.WOEK_GOVERNMENT_FACHRELEASE_ROOT
  ?? path.join(projectRoot, "government-data", "fachrelease", "WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0");
const analysisRoot = path.join(fachRoot, "analysis");
const outputRoot = path.join(projectRoot, "data", "government", "impact-cases");
const importedAt = "2026-08-18T12:30:00Z";

const waves = ["1", "2", "3", "4", "5", "6", "7A", "7B", "8", "9", "10", "11"];

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
  for (let index = 0; index < lines.length; index += 1) {
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
  if (direction.includes("AMBIVALENT") || direction.includes("MIXED") || direction.includes("TRADEOFF")) return "AMBIVALENT";
  if (direction.includes("NEGATIVE") || direction.includes("RISK")) return "NEGATIVE";
  if (direction.includes("POSITIVE")) return "POSITIVE";
  if (direction.includes("NEUTRAL")) return "NEUTRAL";
  return "OPEN";
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

const schema = JSON.parse(readFileSync(path.join(outputRoot, "WOEK-IMPACT-CASE-SCHEMA-2.0.1.json"), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateFull = ajv.compile(schema);

const records = [];
const importAudit = [];
const seenIds = new Set();

for (const wave of waves) {
  const jsonName = wave === "2" ? "GOVERNMENT-IMPACT-CASES-WAVE-2-PUBLIC-INDEX.jsonl" : `GOVERNMENT-IMPACT-CASES-WAVE-${wave}.jsonl`;
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

    records.push({
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
      evidence_level: evidence,
      implementation_status: raw.scope?.implementation_state ?? raw.implementation_state ?? raw.status ?? "OPEN",
      impact_summary: {
        public_summary: publicSummary,
        central_lever: centralLever,
        strongest_positive_potential: positivePotential ?? "",
        main_risk_or_tradeoff: mainRisk ?? "",
        direction_dependencies: fullSummary.direction_dependencies ?? "",
        measurement_priority: fullSummary.measurement_priority ?? stringValue(raw.measurement_priority ?? raw.monitoring),
      },
      boundary_status: mapBoundary(raw.boundary_review ?? { status: raw.boundaries?.length ? "WATCH" : "OPEN" }),
      reality_check_status: mapReality(raw.reality_check_status ?? raw.reality_check),
      linked_government_action_ids: linkedActionIds(raw),
      official_fact_sources: officialSources,
      mechanism_sources: mechanismSources,
      post_decision_sources: postDecisionSources,
      full_analysis_markdown: fullAnalysisMarkdown,
      source_release: {
        jsonl_file: jsonName,
        jsonl_sha256: sha256(jsonContent),
        markdown_file: markdownName,
        markdown_sha256: sha256(markdown),
        case_markdown_sha256: sha256(fullAnalysisMarkdown),
        imported_at: importedAt,
      },
      raw_record: raw,
    });
    importAudit.push({
      impact_case_id: raw.impact_case_id,
      wave,
      record_profile: profile,
      full_schema_valid: fullSchemaValid,
      markdown_section_found: true,
      fach_content_preserved: true,
      publication_status: "APPROVED",
      source_file: jsonName,
    });
  }
}

const fullCount = records.filter((record) => record.record_profile === "FULL_SCHEMA_2_0_1").length;
const compactCount = records.length - fullCount;
const meta = {
  fachrelease: "WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0",
  imported_at: importedAt,
  impact_cases_total: records.length,
  impact_cases_full_schema_2_0_1: fullCount,
  impact_cases_compact_source_preserved: compactCount,
  impact_cases_published: records.length,
  fach_content_loss: 0,
  note: "Sechs Datensätze entsprechen dem Vollschema 2.0.1. Die übrigen freigegebenen Fachwellen liegen als kompakte Fachübergaben vor und werden ohne stillschweigende Schema-Reparatur zusammen mit ihrem vollständigen Fachtext veröffentlicht.",
};

writeJsonl(path.join(outputRoot, "public-impact-records.jsonl"), records);
writeJson(path.join(outputRoot, "public-impact-records-meta.json"), meta);
writeJson(path.join(outputRoot, "fachrelease-import-audit.json"), importAudit);
console.log(JSON.stringify(meta, null, 2));
