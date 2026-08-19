#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const OFFICIAL_REPOSITORY = "https://github.com/sustainabledevelopment-deutschland/sdg-data-pub";
const PUBLIC_SOURCE_BASE = "https://dns-indikatoren.de";

function fail(message) { throw new Error(message); }
function argument(name) { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : undefined; }
function sha256(value) { return createHash("sha256").update(value).digest("hex"); }
function atomicJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp-${process.pid}`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(temporary, file);
}

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') { value += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === "," && !quoted) { values.push(value); value = ""; }
    else value += character;
  }
  values.push(value);
  return values;
}

function plainText(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalized(value) {
  return plainText(value).normalize("NFKC").toLocaleLowerCase("de-DE").replace(/[^a-z0-9äöüß]+/g, " ").trim();
}

function indicatorParts(value) {
  const match = String(value).toLocaleLowerCase("de-DE").match(/^(\d+\.\d+)\.([a-z]+)$/);
  return match ? { base: match[1], suffix: match[2] } : null;
}

function metaMatchesSeed(metaIndicator, seedIndicator) {
  if (metaIndicator === seedIndicator) return true;
  const meta = indicatorParts(metaIndicator);
  const seed = indicatorParts(seedIndicator);
  if (!meta || !seed || meta.base !== seed.base) return false;
  return meta.suffix.includes(seed.suffix) || seed.suffix.startsWith(meta.suffix);
}

function unique(values) { return [...new Set(values.filter((value) => value !== undefined && value !== null && value !== ""))]; }

function extractSources(meta) {
  const urls = Object.entries(meta)
    .filter(([key, value]) => /^source_url_\d+[a-z]?$/.test(key) && typeof value === "string" && value.startsWith("http"))
    .map(([, value]) => value);
  const organisations = Object.entries(meta)
    .filter(([key, value]) => /^source_organisation_\d+_short$/.test(key) && typeof value === "string")
    .map(([, value]) => plainText(value));
  return { urls: unique(urls), organisations: unique(organisations) };
}

function extractComparability(meta) {
  const content = plainText(meta.content_and_progress);
  if (!content) return [];
  return unique(content.split(/(?<=[.!?])\s+/).filter((sentence) => /nicht vergleichbar|vergleichbarkeit|methodisch|zeitreihen?bruch|bruch in der zeitreihe/i.test(sentence))).slice(0, 6);
}

function dataSummary(data) {
  const years = Array.isArray(data.Year) ? data.Year.filter((value) => typeof value === "number") : [];
  const units = Array.isArray(data.Units) ? unique(data.Units.map(plainText)) : [];
  const ignored = new Set(["Year", "Units", "Value", "COMMENT_OBS_0", "COMMENT_OBS_1"]);
  const dimensions = Object.entries(data)
    .filter(([key, value]) => !ignored.has(key) && Array.isArray(value) && unique(value.map(plainText)).length > 1)
    .map(([key]) => key);
  return {
    observation_count: Array.isArray(data.Value) ? data.Value.length : 0,
    first_year: years.length ? Math.min(...years) : null,
    latest_year: years.length ? Math.max(...years) : null,
    units,
    disaggregation_fields: dimensions,
  };
}

function main() {
  const sourceRoot = path.resolve(argument("--source-root") ?? fail("--source-root is required"));
  const canonicalRoot = path.resolve(process.env.WOEK_CANONICAL_LOCAL_ROOT ?? "");
  if (path.basename(canonicalRoot) !== "WOEK") fail("WOEK_CANONICAL_LOCAL_ROOT must point to the local /WOEK mirror");
  const seedPath = path.join(canonicalRoot, "WOEK-WIRKINDIKATORENREGISTER-1.0", "REGISTRY", "DNS-INDICATOR-SOURCE-SEED-1.0.csv");
  const metaRoot = path.join(sourceRoot, "de", "meta");
  const dataRoot = path.join(sourceRoot, "de", "data");
  for (const required of [seedPath, metaRoot, dataRoot]) if (!existsSync(required)) fail(`Required input missing: ${required}`);
  const officialCommit = execFileSync("git", ["-C", sourceRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const rows = readFileSync(seedPath, "utf8").trim().split(/\r?\n/).map(parseCsvLine);
  const header = rows[0];
  const seeds = rows.slice(1).map((row) => Object.fromEntries(header.map((key, index) => [key, row[index] ?? ""])));
  if (seeds.length !== 82 || new Set(seeds.map((seed) => seed.source_indicator_id)).size !== 82) fail("DNS seed must contain exactly 82 unique IDs");

  const metas = readdirSync(metaRoot)
    .filter((file) => file.endsWith(".json") && !["all.json", "schema.json"].includes(file))
    .map((file) => ({ file, value: JSON.parse(readFileSync(path.join(metaRoot, file), "utf8")) }));

  const records = seeds.map((seed) => {
    const matches = metas.filter(({ value }) => metaMatchesSeed(String(value.indicator ?? ""), seed.source_indicator_id));
    if (matches.length !== 1) fail(`Expected one official metadata record for ${seed.source_indicator_id}; found ${matches.length}`);
    const { file: metaFile, value: meta } = matches[0];
    const dataFile = path.join(dataRoot, metaFile);
    if (!existsSync(dataFile)) fail(`Official data file missing for ${seed.source_indicator_id}: ${metaFile}`);
    const data = JSON.parse(readFileSync(dataFile, "utf8"));
    const sources = extractSources(meta);
    const summary = dataSummary(data);
    const currentTarget = plainText(meta.political_target);
    const targetMatch = normalized(currentTarget).includes(normalized(seed.official_target_text_2025));
    const comparabilityNotes = extractComparability(meta);
    const completeness = {
      definition: Boolean(plainText(meta.dns_indicator_definition)),
      political_intention: Boolean(plainText(meta.dns_political_intention)),
      political_target: Boolean(currentTarget),
      target_type: Boolean(plainText(meta.type_target)),
      data_state: Boolean(plainText(meta.data_state)),
      source_urls: sources.urls.length > 0,
      source_organisations: sources.organisations.length > 0,
      units: summary.units.length > 0,
      time_series: summary.observation_count > 0 && summary.first_year !== null && summary.latest_year !== null,
      disaggregation_metadata: summary.disaggregation_fields.length > 0,
      comparability_review: true,
    };
    return {
      indicator_id: `DNS-2025-${seed.source_indicator_id.replace(/\./g, "-").toUpperCase()}`,
      source_indicator_id: seed.source_indicator_id,
      source_indicator_id_pdf: seed.source_indicator_id_pdf,
      sdg_number: Number(seed.SDG),
      official_name_2025: seed.canonical_name,
      official_indicator_bundle_id: String(meta.indicator),
      official_indicator_bundle_name: plainText(meta.indicator_name ?? meta.national_indicator_available),
      official_definition: plainText(meta.dns_indicator_definition),
      official_political_intention: plainText(meta.dns_political_intention),
      official_target_text_2025: seed.official_target_text_2025,
      official_current_target_bundle: currentTarget,
      official_target_type: plainText(meta.type_target),
      official_data_state: plainText(meta.data_state),
      section: plainText(meta.section),
      postulate: plainText(meta.postulate),
      national_geographical_coverage: plainText(meta.national_geographical_coverage),
      national_data_updated_date: meta.national_data_updated_date ?? null,
      national_metadata_updated_date: meta.national_metadata_updated_date ?? null,
      official_source_organisations: sources.organisations,
      official_source_urls: sources.urls,
      source_page_url: `${PUBLIC_SOURCE_BASE}${String(meta.permalink ?? `/${metaFile.replace(/\.json$/, "")}/`)}`,
      official_repository_paths: {
        metadata: `de/meta/${metaFile}`,
        data: `de/data/${metaFile}`,
        headline: `de/headline/${metaFile}`,
      },
      data_summary: summary,
      comparability_notes: comparabilityNotes,
      target_change_review: targetMatch ? "BUNDLED_TARGET_CONTAINS_2025_SEED" : "REVIEW_REQUIRED",
      metadata_completeness: completeness,
      metadata_completeness_count: Object.values(completeness).filter(Boolean).length,
      metadata_expected_count: Object.keys(completeness).length,
      mapping_status: "NO_FACH_REVIEWED_WOEK_MAPPING",
      score_or_direction_inference: "FORBIDDEN",
    };
  });

  const completenessMatrix = records.map((record) => ({
    indicator_id: record.indicator_id,
    source_indicator_id: record.source_indicator_id,
    ...record.metadata_completeness,
    completeness_count: record.metadata_completeness_count,
    expected_count: record.metadata_expected_count,
    target_change_review: record.target_change_review,
  }));
  const registry = {
    schema_version: "woek-dns-official-registry-1.0",
    generated_at: new Date().toISOString(),
    record_count: records.length,
    official_repository: OFFICIAL_REPOSITORY,
    official_repository_commit: officialCommit,
    official_public_source_base: PUBLIC_SOURCE_BASE,
    seed_contract: "/WOEK/WOEK-WIRKINDIKATORENREGISTER-1.0/REGISTRY/DNS-INDICATOR-SOURCE-SEED-1.0.csv",
    seed_sha256: sha256(readFileSync(seedPath)),
    ontology_rule: "Official indicator records are a measurement layer, not WÖk impact claims, scores or recommendations.",
    public_mapping_rule: "No machine mapping is published. Missing fach-reviewed mappings remain explicit and open.",
    records,
  };
  atomicJson(path.resolve("data/indicators/dns-official-registry.json"), registry);
  atomicJson(path.resolve("data/indicators/dns-deep-metadata-completeness.json"), {
    schema_version: "woek-dns-deep-metadata-completeness-1.0",
    generated_at: registry.generated_at,
    official_repository_commit: officialCommit,
    record_count: completenessMatrix.length,
    fully_complete_count: completenessMatrix.filter((record) => record.completeness_count === record.expected_count).length,
    target_change_review_required_count: completenessMatrix.filter((record) => record.target_change_review === "REVIEW_REQUIRED").length,
    records: completenessMatrix,
  });
  console.log(JSON.stringify({ official_commit: officialCommit, records: records.length, fully_complete: completenessMatrix.filter((record) => record.completeness_count === record.expected_count).length, target_review_required: completenessMatrix.filter((record) => record.target_change_review === "REVIEW_REQUIRED").length }, null, 2));
}

main();
