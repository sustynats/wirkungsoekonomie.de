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
assert.equal(bsw.terminal_object_count, 648, "BSW exact issue #240 terminal stock drifted");
assert.equal(bsw.remaining_review_envelope_count, 29, "BSW page-envelope residual must be physical PDF pages 38-66");
assert.equal(bsw.remaining_exact_object_count, 19, "BSW exact child residual must be the P34-P37 finite set");
assert.equal(bsw.remaining_review_scope_count, 48, "BSW finite residual must be 29 page envelopes plus 19 exact children");
assert.deepEqual(
  bsw.remaining_review_envelopes.map((item) => Number(item.source_locator.match(/PDF page (\d+)/)?.[1])),
  Array.from({ length: 29 }, (_, index) => index + 38),
);
assert.ok(bsw.remaining_review_envelopes.every((item) => (
  item.counts_as_effect_object === false
  && item.effect_bearing_status === "NOT_YET_CLASSIFIED"
  && item.fach_state === "GENUINE_FACH_REVIEW_REQUIRED"
)));
assert.equal(ledger.effect_atoms.length, 896, "historical evidence ledger drifted");
const currentIds = new Set(bsw.terminal_objects.map((item) => item.object_id));
const explicitPage14 = bsw.terminal_objects.filter((item) => item.fach_handoff?.endsWith("issuecomment-5449003550"));
const explicitPages15To19 = bsw.terminal_objects.filter((item) => [
  5449855264, 5449881459, 5449901373, 5450371661, 5451044705,
].some((id) => item.fach_handoff?.endsWith(`issuecomment-${id}`)));
const explicitP19ClosureToP21 = bsw.terminal_objects.filter((item) => [
  5451527622, 5451533796, 5451555353, 5451565159,
].some((id) => item.fach_handoff?.endsWith(`issuecomment-${id}`)));
const explicitP22 = bsw.terminal_objects.filter((item) => [
  5452887573, 5452894797, 5452902986,
].some((id) => item.fach_handoff?.endsWith(`issuecomment-${id}`)));
const p23Current = bsw.terminal_objects.filter((item) => item.object_id.includes("-P23-"));
const p24P25Current = bsw.terminal_objects.filter((item) => item.object_id.includes("-P24-") || item.object_id.includes("-P25-") || item.object_id.includes("-P24P25-"));
const p26P29Current = bsw.terminal_objects.filter((item) => /-P(?:26|27|28|29)-|-P28P29-/.test(item.object_id));
const p30P33Current = bsw.terminal_objects.filter((item) => /-P(?:30|31|32|33)-|-P30P31-/.test(item.object_id));
const p34P37Current = bsw.terminal_objects.filter((item) => /-P(?:34|35|36|37)-|-P34P35-|-P35P36-|-P36P37-/.test(item.object_id));
assert.equal(explicitPage14.length, 23, "explicit page-14 handoff was not consumed exactly");
assert.equal(explicitPages15To19.length, 119, "explicit pages-15-to-19 handoffs were not consumed exactly");
assert.equal(explicitP19ClosureToP21.length, 39, "explicit P19-closure/P20/P21 handoffs were not consumed exactly");
assert.equal(explicitP22.length, 41, "explicit P22 handoffs were not consumed exactly");
assert.equal(explicitP22.filter((item) => item.counts_as_effect_object === true).length, 24, "P22 active terminal leaf set drifted");
assert.equal(explicitP22.filter((item) => item.object_kind === "DETERMINISTIC_SEGMENTATION_REPLACEMENT").length, 12, "P22 deterministic child set drifted");
assert.equal(p23Current.length, 38, "P23 terminal record set drifted");
assert.equal(p23Current.filter((item) => item.counts_as_effect_object === true).length, 22, "P23 active terminal set drifted");
assert.equal(p23Current.filter((item) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 6, "P23 versioned parent set drifted");
assert.equal(p23Current.filter((item) => item.object_kind === "DETERMINISTIC_SEGMENTATION_REPLACEMENT" && item.fach_state === "EXPLICIT_FACH_APPROVED").length, 13, "P23 child closure drifted");
assert.equal(p24P25Current.length, 62, "P24/P25 terminal set drifted");
assert.equal(p26P29Current.length, 113, "P26-P29 terminal set drifted");
assert.equal(p26P29Current.filter((item) => item.counts_as_effect_object === true).length, 31, "P26-P29 active terminal leaf set drifted");
assert.equal(p26P29Current.filter((item) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 26, "P26-P29 explicit Fach set drifted");
assert.equal(p26P29Current.filter((item) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 5, "P26-P29 exact RNAA set drifted");
assert.equal(p26P29Current.filter((item) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 17, "P26-P29 versioned parent set drifted");
assert.equal(bsw.remaining_review_objects.length, 19, "P34-P37 exact child residual set drifted");
assert.ok(bsw.remaining_review_objects.every((item) => item.fach_state === "GENUINE_FACH_REVIEW_REQUIRED" && item.counts_as_effect_object === true));
const p24P25Children = p24P25Current.filter((item) => item.object_kind === "DETERMINISTIC_SEGMENTATION_REPLACEMENT");
assert.equal(p24P25Children.length, 23, "P24/P25 deterministic child set drifted");
assert.equal(p24P25Children.filter((item) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 20, "P24/P25 explicit child closure drifted");
assert.equal(p24P25Children.filter((item) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 1, "P24/P25 exact RNAA child closure drifted");
assert.equal(p30P33Current.length, 84, "P30-P33 terminal set drifted");
assert.equal(p30P33Current.filter((item) => item.counts_as_effect_object === true).length, 31, "P30-P33 active terminal leaf set drifted");
assert.equal(p30P33Current.filter((item) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 20, "P30-P33 explicit Fach set drifted");
assert.equal(p30P33Current.filter((item) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 11, "P30-P33 exact RNAA set drifted");
assert.equal(p30P33Current.filter((item) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 4, "P30-P33 versioned parent set drifted");
assert.equal(p34P37Current.length, 73, "P34-P37 terminal set drifted");
assert.equal(p34P37Current.filter((item) => item.counts_as_effect_object === true).length, 15, "P34-P37 active terminal leaf set drifted");
assert.equal(p34P37Current.filter((item) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 10, "P34-P37 explicit Fach set drifted");
assert.equal(p34P37Current.filter((item) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 5, "P34-P37 exact RNAA set drifted");
assert.equal(p34P37Current.filter((item) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 14, "P34-P37 versioned parent/fragment set drifted");
assert.ok(
  ledger.effect_atoms.filter((atom) => atom.pdf_page < 14 || atom.pdf_page > 37).every((atom) => !currentIds.has(atom.atom_id)),
  "rejected BSW generic terminal outside explicit pages 14-37 leaked into current truth",
);
assert.equal(residual.rejected_predecessor.disposition, "REJECTED_FALSE_TERMINAL_HISTORICAL_EVIDENCE_ONLY");
assert.equal(residual.release_policy.no_new_vercel_build, true);
assert.equal(residual.release_policy.parliament_release_approval, "NOT_GRANTED");

console.log(JSON.stringify({
  status: "PASS_TRUTHFUL_NONZERO_RESIDUAL",
  bswTerminalObjects: bsw.terminal_object_count,
  bswRemainingReviewEnvelopes: bsw.remaining_review_envelope_count,
  bswRemainingExactObjects: bsw.remaining_exact_object_count,
  explicitlySupersededPage14Atoms: explicitPage14.length,
  explicitlySupersededPages15To19Objects: explicitPages15To19.length,
  explicitP19ClosureToP21Objects: explicitP19ClosureToP21.length,
  explicitP22Objects: explicitP22.length,
  p23TerminalObjects: p23Current.length,
  p24P25TerminalObjects: p24P25Current.length,
  p26P29TerminalObjects: p26P29Current.length,
  p30P33TerminalObjects: p30P33Current.length,
  p34P37TerminalObjects: p34P37Current.length,
  p34P37ExactOpenChildren: bsw.remaining_review_objects.length,
  programmeAnalysisComplete: bsw.programme_analysis_complete,
}));
