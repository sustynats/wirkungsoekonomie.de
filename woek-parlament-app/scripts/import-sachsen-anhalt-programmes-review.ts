#!/usr/bin/env tsx

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { saxonyAnhaltElectionProgrammes } from "@/data/sachsen-anhalt-election-programmes";
import { assertExternalReviewSafe, stableJson } from "@/lib/review/privacy";

type JsonRecord = Record<string, unknown>;

const outputPath = path.resolve(process.cwd(), "data/generated/sachsen-anhalt-programme-reviews.json");

function argument(name: string) {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3) ?? null;
}

function record(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("A structured object was expected.");
  return value as JsonRecord;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function entries(zip: JSZip) {
  return Object.values(zip.files).filter((entry) => !entry.dir);
}

function prefixFor(zip: JSZip) {
  const roots = new Set(entries(zip).map((entry) => entry.name.split("/")[0]).filter(Boolean));
  return roots.size === 1 ? `${[...roots][0]}/` : "";
}

async function readJson(zip: JSZip, name: string, prefix = "") {
  const file = zip.file(`${prefix}${name}`);
  if (!file) throw new Error(`Missing ${name}.`);
  return JSON.parse(await file.async("string")) as unknown;
}

function ensureSafeZip(zip: JSZip) {
  if (entries(zip).some((entry) => entry.name.startsWith("/") || entry.name.split("/").includes(".."))) {
    throw new Error("Archive contains an unsafe path.");
  }
}

async function main() {
  const sourceArgument = argument("source");
  const resultArgument = argument("results");
  if (!sourceArgument || !resultArgument) {
    throw new Error("Usage: review:import-sachsen-anhalt-programmes -- --source=/path/to/source.zip --results=/path/to/results.zip");
  }

  const sourceZip = await JSZip.loadAsync(await readFile(path.resolve(sourceArgument)));
  const resultZip = await JSZip.loadAsync(await readFile(path.resolve(resultArgument)));
  ensureSafeZip(sourceZip);
  ensureSafeZip(resultZip);
  const sourceManifest = record(await readJson(sourceZip, "manifest.json", prefixFor(sourceZip)));
  const resultPrefix = prefixFor(resultZip);
  const resultManifest = record(await readJson(resultZip, "manifest.json", resultPrefix));

  const packageHash = text(sourceManifest.package_hash);
  if (!packageHash || text(resultManifest.input_package_hash) !== packageHash) {
    throw new Error("Result package does not match the exported source package.");
  }
  const referenceSnapshot = text(sourceManifest.reference_snapshot_id);
  if (!referenceSnapshot || text(resultManifest.reference_snapshot_id) !== referenceSnapshot) {
    throw new Error("Result package has an incompatible reference snapshot.");
  }

  const sourceRows = Array.isArray(sourceManifest.sources) ? sourceManifest.sources.map(record) : [];
  if (sourceRows.length !== saxonyAnhaltElectionProgrammes.length) throw new Error("Source package must contain all six programme sources.");
  const sourceHashes = new Map(sourceRows.map((source) => [text(source.source_key), text(source.sha256)]));
  const imported: JsonRecord[] = [];

  for (const programme of saxonyAnhaltElectionProgrammes) {
    const expectedHash = sourceHashes.get(programme.sourceKey);
    if (!expectedHash) throw new Error(`Missing source manifest for ${programme.sourceKey}.`);
    const base = `results/${programme.sourceKey}`;
    const commitments = record(await readJson(resultZip, `${base}/commitment-register.json`, resultPrefix));
    const review = record(await readJson(resultZip, `${base}/programme-review.json`, resultPrefix));
    if (text(commitments.source_key) !== programme.sourceKey || text(review.source_key) !== programme.sourceKey) {
      throw new Error(`Source key mismatch for ${programme.sourceKey}.`);
    }
    if (text(commitments.source_hash) !== expectedHash || text(review.source_hash) !== expectedHash) {
      throw new Error(`Source hash mismatch for ${programme.sourceKey}.`);
    }
    const provenance = record(review.provenance);
    if (text(provenance.reference_snapshot_id) !== referenceSnapshot) {
      throw new Error(`Reference snapshot mismatch for ${programme.sourceKey}.`);
    }
    if (!Array.isArray(commitments.commitments) || !Array.isArray(review.material_commitments) || text(review.plain_language_summary).length < 80) {
      throw new Error(`Review for ${programme.sourceKey} is incomplete.`);
    }
    assertExternalReviewSafe({ commitments, review }, `programme-review-${programme.sourceKey}`);
    imported.push({
      source_key: programme.sourceKey,
      commitments: commitments.commitments,
      review
    });
  }

  const publicPayload = {
    schema_version: "1.0.0",
    publisher: "Institut für Wirkungsökonomie",
    input_package_hash: packageHash,
    imported_at: new Date().toISOString(),
    programmes: imported
  };
  assertExternalReviewSafe(publicPayload, "sachsen-anhalt-programme-public-payload");
  await writeFile(outputPath, `${stableJson(publicPayload)}\n`, "utf8");
  console.log(JSON.stringify({ status: "READY_FOR_BUILD", programmes: imported.length, output: "data/generated/sachsen-anhalt-programme-reviews.json" }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Programme reviews could not be imported.");
  process.exit(1);
});
