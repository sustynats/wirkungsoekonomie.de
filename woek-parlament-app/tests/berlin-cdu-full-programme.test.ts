import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ledger = JSON.parse(
  readFileSync(
    resolve(root, "data/state-programmes/fach-reviews/berlin-2026-cdu-v1.json"),
    "utf8",
  ),
);

test("CDU accounts for all 128 physical pages", () => {
  assert.equal(ledger.page_coverage.length, 128);
  assert.deepEqual(
    ledger.page_coverage.map((page: { pdf_page: number }) => page.pdf_page),
    Array.from({ length: 128 }, (_, index) => index + 1),
  );
  assert.ok(
    ledger.page_coverage.every(
      (page: { page_read_fully: boolean; page_coverage_pass: boolean }) =>
        page.page_read_fully && page.page_coverage_pass,
    ),
  );
});

test("CDU pinned source materializes to exact reviewed cardinalities", () => {
  assert.deepEqual(
    {
      total_source_units: ledger.programme_summary.total_source_units,
      non_effect_context_units:
        ledger.programme_summary.non_effect_context_units,
      effect_bearing_source_units:
        ledger.programme_summary.effect_bearing_source_units,
      effect_atoms: ledger.programme_summary.effect_atoms,
      records: ledger.records.length,
    },
    {
      total_source_units: 2673,
      non_effect_context_units: 1021,
      effect_bearing_source_units: 1652,
      effect_atoms: 2041,
      records: 3062,
    },
  );
});

test("every source unit binds to zero or one-or-more atoms", () => {
  const atomIds = new Set(
    ledger.effect_atoms.map((atom: { atom_id: string }) => atom.atom_id),
  );
  for (const unit of ledger.source_units) {
    if (unit.source_unit_class === "NON_EFFECT_CONTEXT") {
      assert.deepEqual(unit.atom_ids, []);
    } else {
      assert.ok(unit.atom_ids.length > 0);
      assert.ok(unit.atom_ids.every((atomId: string) => atomIds.has(atomId)));
    }
  }
});

test("every effect atom is terminal without inferred Fach", () => {
  const effectRecords = ledger.records.filter(
    (record: { source_unit_class: string }) =>
      record.source_unit_class === "EFFECT_BEARING",
  );
  assert.equal(effectRecords.length, ledger.effect_atoms.length);
  for (const record of effectRecords) {
    assert.equal(
      record.terminal_status,
      "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON",
    );
    assert.equal(record.impact_direction, null);
    assert.equal(record.evidence_level, null);
    assert.equal(record.dns_mapping, "NOT_AVAILABLE");
    assert.equal(record.recommendation, "NOT_AVAILABLE");
    assert.equal(record.reviewed_exact_missing_fields.length, 1);
  }
  assert.equal(
    new Set(effectRecords.map((record: { exact_reason: string }) => record.exact_reason))
      .size,
    effectRecords.length,
  );
});

test("standalone CDU validator passes", () => {
  execFileSync(
    process.execPath,
    [resolve(root, "scripts/quality/check-berlin-cdu-full-programme.mjs")],
    { cwd: root, stdio: "pipe" },
  );
});
