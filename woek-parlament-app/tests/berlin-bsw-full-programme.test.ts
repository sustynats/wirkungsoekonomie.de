import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const ledgerBytes = readFileSync("data/state-programmes/fach-reviews/berlin-2026-bsw-v1.json");
const ledger = JSON.parse(ledgerBytes.toString("utf8"));
const residual = JSON.parse(readFileSync("data/state-programmes/fach-content-residuals/berlin-2026-v2.json", "utf8"));

test("BSW Berlin preserves pages 1-13 record-completely and accounts for all 66 physical pages", () => {
  assert.equal(ledger.protected_terminal_stock.length, 3);
  assert.deepEqual(ledger.protected_terminal_stock.map((stock: { accepted_terminal_records: unknown[] }) => stock.accepted_terminal_records.length), [13, 23, 20]);
  assert.equal(ledger.protected_terminal_stock.flatMap((stock: { accepted_terminal_records: unknown[] }) => stock.accepted_terminal_records).length, 56);
  assert.deepEqual(ledger.all_physical_page_coverage.map((page: { pdf_page: number }) => page.pdf_page), Array.from({ length: 66 }, (_, index) => index + 1));
  assert.ok(ledger.all_physical_page_coverage.every((page: { terminal_status: string }) => page.terminal_status === "PASS"));
});

test("BSW pages 14-66 have deterministic object-level terminal decisions without synthetic Fach fields", () => {
  assert.equal(ledger.page_coverage.length, 53);
  assert.equal(ledger.source_units.length, 470);
  assert.equal(new Set(ledger.source_units.map((unit: { source_unit_id: string }) => unit.source_unit_id)).size, 470);
  const effectUnits = ledger.source_units.filter((unit: { effect_bearing: boolean }) => unit.effect_bearing);
  const context = ledger.source_units.filter((unit: { effect_bearing: boolean }) => !unit.effect_bearing);
  assert.equal(effectUnits.length, 286);
  assert.equal(context.length, 184);
  assert.ok(context.every((unit: { terminal_status: string }) => unit.terminal_status === "NON_EFFECT_CONTEXT_REVIEWED"));
  assert.ok(effectUnits.every((unit: { atom_count: number; terminal_status: null }) => unit.atom_count >= 1 && unit.terminal_status === null));
  assert.ok(effectUnits.filter((unit: { atom_count: number }) => unit.atom_count > 1).length >= 200);

  const effects = ledger.effect_atoms;
  assert.equal(effects.length, 896);
  assert.equal(new Set(effects.map((atom: { atom_id: string }) => atom.atom_id)).size, 896);
  assert.ok(effects.every((atom: { terminal_status: string }) => atom.terminal_status === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON"));
  assert.equal(new Set(effects.map((atom: { exact_reason: string }) => atom.exact_reason)).size, effects.length);
  assert.equal(new Set(effects.map((atom: { exact_reason_code: string }) => atom.exact_reason_code)).size, 16);
  assert.ok(effects.every((atom: { reviewed_exact_missing_fields: string[] }) => atom.reviewed_exact_missing_fields.length >= 5));
  assert.equal(ledger.records.length, 1080);
  assert.equal(new Set(ledger.records.map((record: { record_id: string }) => record.record_id)).size, 1080);
  for (const record of effects) {
    assert.equal(record.impact_direction, null);
    assert.equal(record.evidence_level, null);
    assert.equal(record.dns_mapping, "NOT_AVAILABLE");
    assert.equal(record.recommendation, "NOT_AVAILABLE");
  }
  assert.equal(ledger.programme_summary.all_effect_bearing_atoms_terminal, true);
  assert.equal(ledger.programme_summary.unterminated_effect_atoms, 0);
});

test("BSW terminality is hash-bound into the sole current Berlin residual", () => {
  const bsw = residual.programmes.find((programme: { party: string }) => programme.party === "BSW");
  assert.ok(bsw);
  assert.equal(bsw.coverage_evidence.ledger_path, "woek-parlament-app/data/state-programmes/fach-reviews/berlin-2026-bsw-v1.json");
  assert.equal(bsw.coverage_evidence.ledger_file_sha256, createHash("sha256").update(ledgerBytes).digest("hex"));
  assert.equal(bsw.expected_pages, 66);
  assert.equal(bsw.reviewed_pages, 66);
  assert.equal(bsw.terminal_source_objects, 1136);
  assert.equal(bsw.genuine_fach_review_required, 0);
  assert.equal(bsw.programme_analysis_complete, true);
  assert.equal(residual.summary.programme_analysis_complete, 12);
  assert.equal(residual.summary.programme_analysis_open, 0);
  assert.equal(residual.summary.remaining_genuine_fach_review_required, 0);
});
