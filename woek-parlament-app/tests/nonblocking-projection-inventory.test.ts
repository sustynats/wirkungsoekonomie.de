import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const inventory = JSON.parse(
  readFileSync(
    resolve(
      APP_ROOT,
      "data/executive-impact/nonblocking-projection-inventory-v1.json",
    ),
    "utf8",
  ),
);

test("D scope has the exact approved object cardinalities", () => {
  assert.deepEqual(inventory.actual_cardinalities, {
    SACHSEN_ANHALT_6: 6,
    GOVERNMENT_COMPACT_57: 57,
    GOVERNMENT_DEEP_6: 6,
    EU_21: 21,
    BADEN_WUERTTEMBERG: 1,
    RHEINLAND_PFALZ: 1,
    HISTORICAL_PARLIAMENT_28: 28,
    FEDERAL_PROGRAMMES_6: 6,
    FEDERAL_COALITION_1: 1,
    SPECIALIST_FILE_1: 1,
    OBSERVATORY_1: 1,
  });
  assert.equal(inventory.total_records, 129);
});

test("projection availability is fail-closed and never infers Fach", () => {
  for (const record of inventory.records) {
    const complete =
      record.aggregate_direction.status === "AVAILABLE" &&
      record.aggregate_materiality.status === "AVAILABLE" &&
      record.editorial_provenance.status === "AVAILABLE";
    assert.equal(record.projection_status, complete ? "AVAILABLE" : "NOT_AVAILABLE");
    assert.equal(record.communication_projection.status, "SEPARATE_NOT_PROJECTED");
    assert.ok(record.noncompensation);
    assert.ok(record.public_bottom_line);
    if (record.material_paths.status === "AVAILABLE") {
      assert.ok(record.material_paths.value.length <= 5);
    }
    for (const component of ["mpd", "sdg", "sdg_plus"]) {
      if (record[component].status !== "AVAILABLE") continue;
      assert.ok(
        record[component].value.every(
          (binding: { direction: string }) => Boolean(binding.direction),
        ),
      );
    }
  }
  assert.equal(inventory.policies.open_is_neutral, false);
});

test("processing status requires the complete Impact-First component set", () => {
  const components = [
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
  for (const record of inventory.records) {
    if (record.processing_status !== "COMPLETE") continue;
    assert.ok(
      components.every(
        (component) => record[component].status === "AVAILABLE",
      ),
    );
  }
  assert.deepEqual(inventory.processing_status_counts, {
    COMPLETE: 5,
    PARTIAL_SOURCE_BOUND: 107,
    NOT_AVAILABLE: 17,
  });
});

test("public bottom lines are object-specific and not process descriptions", () => {
  const genericPatterns = [
    /kann verschiedene bereiche verändern/i,
    /hat chancen und risiken/i,
    /unterschiedliche wirkpfade/i,
    /betrifft mensch, planet und demokratie/i,
    /weitere prüfung erforderlich/i,
    /bewertet werden nicht partei oder personen/i,
  ];
  const seen = new Map<string, string>();
  for (const record of inventory.records) {
    if (record.public_bottom_line.status !== "AVAILABLE") continue;
    const value =
      typeof record.public_bottom_line.value === "string"
        ? record.public_bottom_line.value
        : [
            record.public_bottom_line.value.label,
            record.public_bottom_line.value.summary,
          ]
            .filter(Boolean)
            .join(" ");
    assert.ok(value.length >= 40, record.inventory_id);
    assert.ok(!genericPatterns.some((pattern) => pattern.test(value)), record.inventory_id);
    const normalized = value
      .normalize("NFKC")
      .toLocaleLowerCase("de-DE")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
    assert.equal(seen.get(normalized), undefined, record.inventory_id);
    seen.set(normalized, record.inventory_id);
  }
});

test("source-bound materialization is deterministic", () => {
  execFileSync(
    process.execPath,
    [
      resolve(
        APP_ROOT,
        "scripts/quality/materialize-nonblocking-projection-inventory.mjs",
      ),
      "--check",
    ],
    { cwd: APP_ROOT, stdio: "pipe" },
  );
  execFileSync(
    process.execPath,
    [
      resolve(
        APP_ROOT,
        "scripts/quality/check-nonblocking-projection-inventory.mjs",
      ),
    ],
    { cwd: APP_ROOT, stdio: "pipe" },
  );
});
