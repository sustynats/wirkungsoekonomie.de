#!/usr/bin/env node

// Historical filename retained as a truth-remediation gate. The earlier BSW
// ledger over-terminalized pages 14-66 with generic missing-input reasons; it
// remains immutable audit evidence but no longer establishes current Fach.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ledger = JSON.parse(readFileSync("data/state-programmes/fach-reviews/berlin-2026-bsw-v1.json", "utf8"));
const residual = JSON.parse(readFileSync("data/state-programmes/fach-content-residuals/berlin-2026-v3.json", "utf8"));
const bsw = residual.programmes.find((programme) => programme.party === "BSW");

assert.ok(bsw, "BSW missing from current Berlin Fach-truth matrix");
assert.equal(bsw.programme_analysis_complete, false, "BSW must remain open after rejection of generic RNAA terminals");
assert.equal(bsw.terminal_object_count, 79, "BSW exact issue #240 terminal stock drifted");
assert.equal(bsw.remaining_review_envelope_count, 52, "BSW residual must be physical PDF pages 15-66");
assert.deepEqual(
  bsw.remaining_review_envelopes.map((item) => Number(item.source_locator.match(/PDF page (\d+)/)?.[1])),
  Array.from({ length: 52 }, (_, index) => index + 15),
);
assert.ok(bsw.remaining_review_envelopes.every((item) => (
  item.counts_as_effect_object === false
  && item.effect_bearing_status === "NOT_YET_CLASSIFIED"
  && item.fach_state === "GENUINE_FACH_REVIEW_REQUIRED"
)));
assert.equal(ledger.effect_atoms.length, 896, "historical evidence ledger drifted");
const currentIds = new Set(bsw.terminal_objects.map((item) => item.object_id));
const explicitPage14 = bsw.terminal_objects.filter((item) => item.fach_handoff?.endsWith("issuecomment-5449003550"));
assert.equal(explicitPage14.length, 23, "explicit page-14 handoff was not consumed exactly");
assert.ok(
  ledger.effect_atoms.filter((atom) => atom.pdf_page !== 14).every((atom) => !currentIds.has(atom.atom_id)),
  "rejected BSW generic terminal outside the explicit page-14 handoff leaked into current truth",
);
assert.equal(residual.rejected_predecessor.disposition, "REJECTED_FALSE_TERMINAL_HISTORICAL_EVIDENCE_ONLY");
assert.equal(residual.release_policy.no_new_vercel_build, true);
assert.equal(residual.release_policy.parliament_release_approval, "NOT_GRANTED");

console.log(JSON.stringify({
  status: "PASS_TRUTHFUL_NONZERO_RESIDUAL",
  bswTerminalObjects: bsw.terminal_object_count,
  bswRemainingReviewEnvelopes: bsw.remaining_review_envelope_count,
  explicitlySupersededPage14Atoms: explicitPage14.length,
  rejectedHistoricalAtoms: ledger.effect_atoms.length - explicitPage14.length,
  programmeAnalysisComplete: bsw.programme_analysis_complete,
}));
