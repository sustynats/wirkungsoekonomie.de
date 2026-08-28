import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ledger = JSON.parse(readFileSync("data/state-programmes/fach-reviews/berlin-2026-bsw-v1.json", "utf8"));
const residual = JSON.parse(readFileSync("data/state-programmes/fach-content-residuals/berlin-2026-v3.json", "utf8"));

test("BSW Berlin preserves all 79 explicit issue #240 terminals for pages 1-14", () => {
  assert.equal(ledger.protected_terminal_stock.length, 3);
  assert.deepEqual(
    ledger.protected_terminal_stock.map((stock: { accepted_terminal_records: unknown[] }) => stock.accepted_terminal_records.length),
    [13, 23, 20],
  );
  const bsw = residual.programmes.find((programme: { party: string }) => programme.party === "BSW");
  assert.ok(bsw);
  assert.equal(bsw.terminal_object_count, 79);
  assert.equal(bsw.terminal_objects.length, 79);
  assert.equal(new Set(bsw.terminal_objects.map((item: { object_id: string }) => item.object_id)).size, 79);
  assert.deepEqual(bsw.terminal_status_counts, {
    EXPLICIT_FACH_APPROVED: 51,
    REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 11,
    NON_EFFECT_CONTEXT_REVIEWED: 12,
    SOURCE_UNIT_RECLASSIFIED_VERSIONED: 5,
  });
});

test("BSW pages 15-66 remain the exact current review envelope", () => {
  const bsw = residual.programmes.find((programme: { party: string }) => programme.party === "BSW");
  assert.ok(bsw);
  assert.equal(bsw.programme_analysis_complete, false);
  assert.equal(bsw.fach_state, "GENUINE_FACH_REVIEW_REQUIRED");
  assert.equal(bsw.remaining_review_envelope_count, 52);
  assert.deepEqual(
    bsw.remaining_review_envelopes.map((item: { source_locator: string }) => Number(item.source_locator.match(/PDF page (\d+)/)?.[1])),
    Array.from({ length: 52 }, (_, index) => index + 15),
  );
  assert.ok(bsw.remaining_review_envelopes.every((item: {
    object_kind: string;
    segmentation_state: string;
    fach_state: string;
    effect_bearing_status: string;
    counts_as_effect_object: boolean;
  }) => item.object_kind === "PHYSICAL_PDF_PAGE_REVIEW_ENVELOPE"
    && item.segmentation_state === "SEGMENTATION_REVIEW_REQUIRED"
    && item.fach_state === "GENUINE_FACH_REVIEW_REQUIRED"
    && item.effect_bearing_status === "NOT_YET_CLASSIFIED"
    && item.counts_as_effect_object === false));
});

test("the former BSW atom ledger is retained only as rejected historical evidence", () => {
  assert.equal(ledger.effect_atoms.length, 896);
  assert.ok(ledger.effect_atoms.every((atom: { terminal_status: string }) => atom.terminal_status === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON"));
  assert.equal(residual.rejected_predecessor.disposition, "REJECTED_FALSE_TERMINAL_HISTORICAL_EVIDENCE_ONLY");
  const currentIds = new Set(residual.programmes.flatMap((programme: { terminal_objects: { object_id: string }[] }) => (
    programme.terminal_objects.map((item) => item.object_id)
  )));
  const explicitlySuperseded = residual.programmes
    .find((programme: { party: string }) => programme.party === "BSW")
    .terminal_objects
    .filter((item: { fach_handoff?: string }) => item.fach_handoff?.endsWith("issuecomment-5449003550"));
  assert.equal(explicitlySuperseded.length, 23);
  assert.ok(ledger.effect_atoms
    .filter((atom: { pdf_page: number }) => atom.pdf_page !== 14)
    .every((atom: { atom_id: string }) => !currentIds.has(atom.atom_id)));
  assert.equal(residual.summary.programme_analysis_complete, 3);
  assert.equal(residual.summary.programme_analysis_open, 9);
  assert.equal(residual.summary.remaining_page_review_envelopes, 1267);
});
