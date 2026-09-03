#!/usr/bin/env node

// Historical filename retained as a current-truth compatibility gate.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const historicalLedger = JSON.parse(readFileSync("data/state-programmes/fach-reviews/berlin-2026-cdu-v1.json", "utf8"));
const residual = JSON.parse(readFileSync("data/state-programmes/fach-content-residuals/berlin-2026-v3.json", "utf8"));
const cdu = residual.programmes.find((programme) => programme.party === "CDU");

assert.ok(cdu, "CDU missing from current Berlin Fach-truth matrix");
assert.equal(historicalLedger.artifact.page_count, 128);
assert.equal(historicalLedger.effect_atoms.length, 2041);
assert.equal(cdu.programme_analysis_complete, false, "generic RNAA must not make CDU terminal");
assert.equal(cdu.terminal_object_count, 0);
assert.equal(cdu.remaining_review_envelope_count, 128);
assert.ok(cdu.remaining_review_envelopes.every((item) => (
  item.counts_as_effect_object === false
  && item.effect_bearing_status === "NOT_YET_CLASSIFIED"
  && item.fach_state === "GENUINE_FACH_REVIEW_REQUIRED"
)));
assert.equal(residual.rejected_predecessor.disposition, "REJECTED_FALSE_TERMINAL_HISTORICAL_EVIDENCE_ONLY");
assert.equal(residual.release_policy.no_new_vercel_build, true);

console.log(JSON.stringify({
  status: "PASS_TRUTHFUL_NONZERO_RESIDUAL",
  cduHistoricalEffectAtoms: historicalLedger.effect_atoms.length,
  cduTerminalObjects: cdu.terminal_object_count,
  cduRemainingReviewEnvelopes: cdu.remaining_review_envelope_count,
  programmeAnalysisComplete: cdu.programme_analysis_complete,
}));
