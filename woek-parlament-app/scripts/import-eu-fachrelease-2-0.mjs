#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const sourceRoot = process.env.WOEK_EU_FACHRELEASE_ROOT;
if (!sourceRoot) throw new Error("WOEK_EU_FACHRELEASE_ROOT must point to the canonical /WOEK EU fachrelease mirror.");
const fachRoot = path.join(sourceRoot, "FACHREVIEW");
const controlRoot = path.join(sourceRoot, "CONTROL");
const outputRoot = path.join(projectRoot, "data", "eu", "impact-cases");

function sha256(value) { return createHash("sha256").update(value).digest("hex"); }
function readJsonl(file) { return readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)); }
function writeJson(name, value) { mkdirSync(outputRoot, { recursive: true }); writeFileSync(path.join(outputRoot, name), `${JSON.stringify(value, null, 2)}\n`); }
function writeJsonl(name, values) { mkdirSync(outputRoot, { recursive: true }); writeFileSync(path.join(outputRoot, name), values.map((value) => JSON.stringify(value)).join("\n") + "\n"); }

function sectionFor(markdown, id) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => new RegExp(`^#\\s+${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(line));
  if (start < 0) throw new Error(`EU-Fachtext fehlt: ${id}`);
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) if (/^#\s+/.test(lines[index])) { end = index; break; }
  return lines.slice(start, end).join("\n").trim();
}

function direction(value) {
  const raw = String(value ?? "OPEN").toUpperCase();
  if (raw.includes("AMBIVALENT") || raw.includes("MIXED")) return "AMBIVALENT";
  if (raw.startsWith("POSITIVE")) return "POSITIVE";
  if (raw.startsWith("NEGATIVE")) return "NEGATIVE";
  if (raw.startsWith("NEUTRAL")) return "NEUTRAL";
  return "OPEN";
}

function evidence(value, markdown) {
  const raw = String(value ?? "").toUpperCase();
  if (raw.startsWith("HIGH")) return "HIGH";
  if (raw.startsWith("MEDIUM")) return "MEDIUM";
  if (raw.startsWith("LOW")) return "LOW";
  const line = markdown.match(/\*\*Evidenz(?:status|basis)?:\*\*\s*([^\n]+)/i)?.[1]
    ?? markdown.match(/Evidenz\s+(?:für\s+\w+\s+)?(hoch|mittel|gering|low|medium|high)/i)?.[1]
    ?? "";
  if (/hoch|high/i.test(line) && !/mittel-hoch/i.test(line)) return "HIGH";
  if (/mittel|medium/i.test(line)) return "MEDIUM";
  if (/gering|low/i.test(line)) return "LOW";
  return "NOT_ASSESSABLE";
}

const indexFile = path.join(controlRoot, "EU-INITIAL-IMPACT-INDEX-2.0-2026-08-18.jsonl");
const indexContent = readFileSync(indexFile, "utf8");
const byIndex = new Map(readJsonl(indexFile).map((record) => [record.impact_case_id, record]));
const addendumFile = path.join(fachRoot, "EU-WAVE-1-EDITORIAL-COMPETENCE-ADDENDUM-2.0-2026-08-18.jsonl");
const addendumContent = readFileSync(addendumFile, "utf8");
const addenda = new Map(readJsonl(addendumFile).map((record) => [record.extends_impact_case_id, record]));
const records = [];
const audit = [];

for (const wave of [1, 2, 3]) {
  const jsonName = `EU-INITIAL-IMPACT-WAVE-${wave}-2026-08-18.jsonl`;
  const markdownName = `EU-INITIAL-IMPACT-WAVE-${wave}-2026-08-18.md`;
  const jsonContent = readFileSync(path.join(fachRoot, jsonName), "utf8");
  const markdownContent = readFileSync(path.join(fachRoot, markdownName), "utf8");
  for (const raw of readJsonl(path.join(fachRoot, jsonName))) {
    const merged = { ...raw, ...(addenda.get(raw.impact_case_id) ?? {}) };
    const indexed = byIndex.get(raw.impact_case_id);
    if (!indexed) throw new Error(`EU-Index fehlt: ${raw.impact_case_id}`);
    const fullAnalysisMarkdown = sectionFor(markdownContent, raw.impact_case_id);
    const publicRecord = {
      impact_case_id: raw.impact_case_id,
      jurisdiction_id: "EU",
      title: raw.title,
      analysis_mode: raw.analysis_mode,
      legal_status: raw.legal_status,
      impact_core_summary: merged.impact_core_summary ?? raw.effect_core,
      editorial_summary: merged.editorial_summary ?? raw.effect_core,
      key_finding: merged.key_finding ?? "",
      primary_direction: direction(merged.primary_direction ?? indexed.primary_direction ?? raw.directions?.join(" ")),
      evidence_level: evidence(merged.evidence_level, fullAnalysisMarkdown),
      competence_scope: merged.competence_scope ?? "OPEN",
      institutional_actor_role: merged.institutional_actor_role ?? "OPEN",
      implementation_route: Array.isArray(merged.implementation_route) ? merged.implementation_route : [],
      legal_feasibility_status: merged.legal_feasibility_status ?? "OPEN",
      boundary_status: merged.boundary_status ?? raw.boundary_status ?? "OPEN",
      reality_check_status: merged.reality_check_status ?? indexed.reality_check_status ?? raw.reality_check_status ?? "NOT_YET_OBSERVABLE",
      inherited_legislative_file: Boolean(raw.inherited_legislative_file),
      key_indicators: raw.key_indicators ?? [],
      official_sources: raw.official_sources ?? [],
      full_analysis_markdown: fullAnalysisMarkdown,
      publication_status: "APPROVED_INITIAL_FACHREVIEW",
      analysis_version: "2.0-initial",
      analysis_as_of: "2026-08-18",
      source_release: {
        jsonl_file: jsonName,
        jsonl_sha256: sha256(jsonContent),
        markdown_file: markdownName,
        markdown_sha256: sha256(markdownContent),
        case_markdown_sha256: sha256(fullAnalysisMarkdown),
        initial_index_sha256: sha256(indexContent),
        wave_1_addendum_sha256: wave === 1 ? sha256(addendumContent) : null
      },
      raw_record: raw
    };
    const required = [publicRecord.impact_core_summary, publicRecord.editorial_summary, publicRecord.key_finding, publicRecord.primary_direction, publicRecord.evidence_level, publicRecord.competence_scope, publicRecord.reality_check_status];
    const gates = {
      EDITORIAL_SPECIFICITY: publicRecord.editorial_summary.length >= 90,
      IMPACT_CORE_SPECIFICITY: publicRecord.impact_core_summary.length >= 55,
      KEY_FINDING_PRESENT: publicRecord.key_finding.length >= 20,
      DIRECTION_VISIBLE: publicRecord.primary_direction.length > 0,
      EVIDENCE_VISIBLE: publicRecord.evidence_level.length > 0,
      COMPETENCE_VISIBLE: publicRecord.competence_scope.length > 0,
      SOURCE_PROVENANCE: publicRecord.official_sources.length > 0 && publicRecord.official_sources.every((url) => /^https:\/\//.test(url)),
      FULL_FACH_TEXT: publicRecord.full_analysis_markdown.length >= 300,
      REQUIRED_FIELDS: required.every((value) => String(value).trim().length > 0)
    };
    const failed = Object.entries(gates).filter(([, pass]) => !pass).map(([name]) => name);
    if (failed.length) throw new Error(`${raw.impact_case_id}: ${failed.join(", ")}`);
    records.push({ ...publicRecord, publication_gates: gates });
    audit.push({ impact_case_id: raw.impact_case_id, wave, status: "PASS", publication_gates: gates });
  }
}

if (records.length !== 21 || new Set(records.map((record) => record.impact_case_id)).size !== 21) throw new Error("EU initial coverage must be 21 unique cases.");
writeJsonl("public-impact-records.jsonl", records);
writeJson("public-impact-records-meta.json", { status: "INITIALBASELINE_READY_FOR_STAGING", as_of: "2026-08-18", count: records.length, fact_coverage_is_not_impact_coverage: true, full_eu_coverage_claimed: false, recommendation_backfill_required: records.length });
writeJson("fachrelease-import-audit.json", audit);
console.log(JSON.stringify({ status: "PASS", count: records.length }, null, 2));
