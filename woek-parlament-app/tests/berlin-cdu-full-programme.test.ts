import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const historicalLedger = JSON.parse(
  readFileSync("data/state-programmes/fach-reviews/berlin-2026-cdu-v1.json", "utf8"),
);
const residual = JSON.parse(
  readFileSync("data/state-programmes/fach-content-residuals/berlin-2026-v3.json", "utf8"),
);

test("CDU historical extraction remains source-inventory evidence", () => {
  assert.equal(historicalLedger.artifact.page_count, 128);
  assert.equal(historicalLedger.source_units.length, 2673);
  assert.equal(historicalLedger.effect_atoms.length, 2041);
  assert.equal(historicalLedger.records.length, 3062);
});

test("CDU current Fach truth remains exactly 128 review envelopes", () => {
  const cdu = residual.programmes.find((programme: { party: string }) => programme.party === "CDU");
  assert.ok(cdu);
  assert.equal(cdu.programme_analysis_complete, false);
  assert.equal(cdu.fach_state, "GENUINE_FACH_REVIEW_REQUIRED");
  assert.equal(cdu.terminal_object_count, 0);
  assert.equal(cdu.remaining_review_envelope_count, 128);
  assert.deepEqual(
    cdu.remaining_review_envelopes.map((item: { source_locator: string }) => Number(item.source_locator.match(/PDF page (\d+)/)?.[1])),
    Array.from({ length: 128 }, (_, index) => index + 1),
  );
  assert.ok(cdu.remaining_review_envelopes.every((item: {
    counts_as_effect_object: boolean;
    effect_bearing_status: string;
    segmentation_state: string;
  }) => item.counts_as_effect_object === false
    && item.effect_bearing_status === "NOT_YET_CLASSIFIED"
    && item.segmentation_state === "SEGMENTATION_REVIEW_REQUIRED"));
});

test("generic CDU RNAA records cannot establish current terminality", () => {
  const cdu = residual.programmes.find((programme: { party: string }) => programme.party === "CDU");
  const currentIds = new Set(cdu.terminal_objects.map((item: { object_id: string }) => item.object_id));
  assert.ok(historicalLedger.effect_atoms.every((atom: { atom_id: string }) => !currentIds.has(atom.atom_id)));
  assert.equal(residual.rejected_predecessor.disposition, "REJECTED_FALSE_TERMINAL_HISTORICAL_EVIDENCE_ONLY");
});
