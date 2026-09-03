#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const INVENTORY_PATH = resolve(
  APP_ROOT,
  "data/executive-impact/nonblocking-projection-inventory-v1.json",
);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function present(value) {
  return value !== null && value !== undefined && value !== "";
}

const GENERIC_PUBLIC_COPY = [
  /kann verschiedene bereiche verändern/i,
  /hat chancen und risiken/i,
  /unterschiedliche wirkpfade/i,
  /betrifft mensch, planet und demokratie/i,
  /weitere prüfung erforderlich/i,
  /bewertet werden nicht partei oder personen/i,
];

function normalizedCopy(value) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("de-DE")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

const inventory = JSON.parse(await readFile(INVENTORY_PATH, "utf8"));
const { manifest_sha256: manifestSha256, ...manifestPayload } = inventory;

for (const source of inventory.source_snapshot.files) {
  const current = await readFile(resolve(APP_ROOT, source.path), "utf8");
  assert(
    sha256(current) === source.sha256,
    `${source.path}: source hash differs from the inventory binding`,
  );
}

assert(
  manifestSha256 === sha256(JSON.stringify(manifestPayload)),
  "manifest_sha256 does not bind the complete inventory payload",
);
assert(
  inventory.governance.contract_id ===
    "AGGREGATION-AND-MATERIALITY-DECISIONS" &&
    inventory.governance.contract_version === "1.0",
  "governance must bind AGGREGATION-AND-MATERIALITY-DECISIONS v1.0",
);
assert(
  inventory.governance.editorial_protocol ===
    "DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL",
  "delegated editorial protocol provenance is missing",
);
assert(
  inventory.policies.maximum_material_paths === 5,
  "maximum_material_paths must be five",
);
assert(
  inventory.policies.open_is_neutral === false,
  "OPEN must never be treated as NEUTRAL",
);

const expectedTotal = Object.values(inventory.expected_cardinalities).reduce(
  (total, value) => total + value,
  0,
);
assert(inventory.total_records === expectedTotal, "total cardinality mismatch");
assert(
  inventory.records.length === expectedTotal,
  "record array cardinality mismatch",
);
assert(
  JSON.stringify(inventory.actual_cardinalities) ===
    JSON.stringify(inventory.expected_cardinalities),
  "scope cardinalities do not match the approved D scope",
);
assert(
  new Set(inventory.records.map((record) => record.inventory_id)).size ===
    inventory.records.length,
  "inventory_id values must be unique",
);

const publishedBottomLines = inventory.records
  .filter((record) => record.public_bottom_line.status === "AVAILABLE")
  .map((record) => ({
    id: record.inventory_id,
    value:
      typeof record.public_bottom_line.value === "string"
        ? record.public_bottom_line.value
        : [
            record.public_bottom_line.value?.label,
            record.public_bottom_line.value?.summary,
          ]
            .filter(Boolean)
            .join(" "),
  }));
for (const bottomLine of publishedBottomLines) {
  assert(
    bottomLine.value.length >= 40 &&
      !GENERIC_PUBLIC_COPY.some((pattern) => pattern.test(bottomLine.value)),
    `${bottomLine.id}: public bottom line is generic or process-only copy`,
  );
}
const bottomLineGroups = Map.groupBy(
  publishedBottomLines,
  (entry) => normalizedCopy(entry.value),
);
for (const [copy, records] of bottomLineGroups) {
  assert(
    !copy || records.length === 1,
    `near-identical public bottom line across different objects: ${records.map((record) => record.id).join(", ")}`,
  );
}

for (const record of inventory.records) {
  const prefix = record.inventory_id;
  assert(
    ["AVAILABLE", "NOT_AVAILABLE"].includes(record.projection_status),
    `${prefix}: invalid projection_status`,
  );
  assert(
    ["COMPLETE", "PARTIAL_SOURCE_BOUND", "NOT_AVAILABLE"].includes(
      record.processing_status,
    ),
    `${prefix}: invalid processing_status`,
  );
  assert(
    record.communication_projection?.status === "SEPARATE_NOT_PROJECTED",
    `${prefix}: communication must remain a separate non-projected field`,
  );
  assert(
    record.noncompensation &&
      ["AVAILABLE", "NOT_AVAILABLE"].includes(record.noncompensation.status),
    `${prefix}: noncompensation must be visible`,
  );
  if (record.material_paths.status === "AVAILABLE") {
    assert(
      record.material_paths.value.length <= 5,
      `${prefix}: material path projection exceeds max-five`,
    );
  }
  if (record.aggregate_direction.status === "AVAILABLE") {
    assert(
      record.aggregate_direction.value !== "NEUTRAL" ||
        !record.aggregate_direction.source_field_paths.includes(
          "normalized_from_OPEN",
        ),
      `${prefix}: OPEN was normalized to NEUTRAL`,
    );
  }
  for (const component of ["mpd", "sdg", "sdg_plus"]) {
    if (record[component].status !== "AVAILABLE") continue;
    assert(
      Array.isArray(record[component].value) &&
        record[component].value.every((binding) => present(binding.direction)),
      `${prefix}.${component}: every projected mapping must preserve an explicit direction`,
    );
  }
  const requiredAvailable =
    record.aggregate_direction.status === "AVAILABLE" &&
    record.aggregate_materiality.status === "AVAILABLE" &&
    record.editorial_provenance.status === "AVAILABLE";
  assert(
    record.projection_status === (requiredAvailable ? "AVAILABLE" : "NOT_AVAILABLE"),
    `${prefix}: availability does not follow direction + materiality + provenance gate`,
  );
  const processingComponents = [
    "aggregate_direction",
    "aggregate_materiality",
    "editorial_provenance",
    "public_bottom_line",
    "material_paths",
    "mpd",
    "sdg",
    "sdg_plus",
    "evidence",
    "reality_check",
    "noncompensation",
  ];
  const complete = processingComponents.every(
    (component) => record[component]?.status === "AVAILABLE",
  );
  const partial = processingComponents
    .filter((component) => component !== "editorial_provenance")
    .some((component) => record[component]?.status === "AVAILABLE");
  assert(
    record.processing_status ===
      (complete ? "COMPLETE" : partial ? "PARTIAL_SOURCE_BOUND" : "NOT_AVAILABLE"),
    `${prefix}: processing_status does not match required component coverage`,
  );
  for (const [name, component] of Object.entries({
    aggregate_direction: record.aggregate_direction,
    aggregate_materiality: record.aggregate_materiality,
    editorial_provenance: record.editorial_provenance,
    public_bottom_line: record.public_bottom_line,
    material_paths: record.material_paths,
    mpd: record.mpd,
    sdg: record.sdg,
    sdg_plus: record.sdg_plus,
    evidence: record.evidence,
    reality_check: record.reality_check,
    noncompensation: record.noncompensation,
  })) {
    if (component.status !== "NOT_AVAILABLE") continue;
    assert(
      Array.isArray(component.missing_field_paths) &&
        component.missing_field_paths.length > 0,
      `${prefix}.${name}: NOT_AVAILABLE requires exact missing_field_paths`,
    );
    assert(
      typeof component.reason === "string" && component.reason.startsWith(`${record.object_id}:`),
      `${prefix}.${name}: reason must be object-specific`,
    );
  }
}

assert(
  Object.values(inventory.processing_status_counts).reduce(
    (total, value) => total + value,
    0,
  ) === inventory.total_records,
  "processing status counts do not cover every inventory object",
);
for (const status of ["COMPLETE", "PARTIAL_SOURCE_BOUND", "NOT_AVAILABLE"]) {
  assert(
    inventory.processing_status_counts[status] ===
      inventory.records.filter((record) => record.processing_status === status)
        .length,
    `${status}: processing status count differs from records`,
  );
}

const deep = inventory.records.filter(
  (record) => record.scope === "GOVERNMENT_DEEP_6",
);
const historical = inventory.records.filter(
  (record) => record.scope === "HISTORICAL_PARLIAMENT_28",
);
assert(
  deep.some(
    (record) =>
      record.material_paths.status === "NOT_AVAILABLE" &&
      record.material_paths.reason.includes("contains 6 entries"),
  ),
  "the six-to-max-five deep Government gate must be explicit",
);
assert(
  historical.filter((record) => record.material_paths.status === "NOT_AVAILABLE")
    .length === 2,
  "the two historical over-five path sets must remain fail-closed",
);

for (const path of [
  "data/government/impact-cases/public-impact-records.jsonl",
  "data/eu/impact-cases/public-impact-records.jsonl",
]) {
  const sources = (await readFile(resolve(APP_ROOT, path), "utf8"))
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  for (const source of sources) {
    const projected = inventory.records.find(
      (record) => record.object_id === source.impact_case_id,
    );
    assert(projected, `${source.impact_case_id}: source object is missing`);
    assert(
      projected.aggregate_direction.status === "AVAILABLE" &&
        projected.aggregate_direction.value === source.primary_direction,
      `${source.impact_case_id}: explicit direction was changed`,
    );
    if (source.primary_direction === "OPEN") {
      assert(
        projected.aggregate_direction.value === "OPEN",
        `${source.impact_case_id}: OPEN was not preserved exactly`,
      );
    }
  }
}

console.log(
  `PASS nonblocking projection inventory: ${inventory.total_records} objects; ${inventory.available_records} available; ${inventory.not_available_records} fail-closed`,
);
