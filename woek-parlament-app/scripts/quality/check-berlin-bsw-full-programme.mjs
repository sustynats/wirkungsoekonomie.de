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
assert.equal(bsw.terminal_object_count, 1308, "BSW exact issue #240 terminal stock drifted");
assert.equal(bsw.remaining_review_envelope_count, 3, "BSW page-envelope residual must be physical PDF pages 64-66");
assert.equal(bsw.remaining_exact_object_count, 0, "BSW P34-P43 exact child residual must be closed");
assert.equal(bsw.remaining_review_scope_count, 3, "BSW finite residual must be exactly the 3 P64-P66 page envelopes");
assert.deepEqual(
  bsw.remaining_review_envelopes.map((item) => Number(item.source_locator.match(/PDF page (\d+)/)?.[1])),
  [64, 65, 66],
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
const p38P41Current = bsw.terminal_objects.filter((item) => /-P(?:38|39|40|41)-|-P38P39-/.test(item.object_id));
const p42P45Current = bsw.terminal_objects.filter((item) => /-P(?:42|43|44|45)-/.test(item.object_id));
const p46P49Current = bsw.terminal_objects.filter((item) => /-P(?:46|47|48|49)-|-P49P50-|-P50-U01-bb3d4390ad9a/.test(item.object_id));
const p50P53Current = bsw.terminal_objects.filter((item) => (
  item.object_id !== "BE-BSW-P50-U01-bb3d4390ad9a"
  && /-P(?:50|51|52|53)-|-P53P54-|-P54-U01-a226a5a2869e/.test(item.object_id)
));
const p54P57Current = bsw.terminal_objects.filter((item) => (
  item.object_id !== "BE-BSW-P54-U01-a226a5a2869e"
  && /-P(?:54|55|56|57)-|-P56P57-/.test(item.object_id)
));
const p58P59Current = bsw.terminal_objects.filter((item) => /-P(?:58|59)-/.test(item.object_id));
const p60P63Current = bsw.terminal_objects.filter((item) => /-P(?:60|61|62|63)-|-P62P63-/.test(item.object_id));
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
assert.equal(bsw.remaining_review_objects.length, 0, "P34-P43 exact child residual set must be zero");
const p24P25Children = p24P25Current.filter((item) => item.object_kind === "DETERMINISTIC_SEGMENTATION_REPLACEMENT");
assert.equal(p24P25Children.length, 23, "P24/P25 deterministic child set drifted");
assert.equal(p24P25Children.filter((item) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 20, "P24/P25 explicit child closure drifted");
assert.equal(p24P25Children.filter((item) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 1, "P24/P25 exact RNAA child closure drifted");
assert.equal(p30P33Current.length, 84, "P30-P33 terminal set drifted");
assert.equal(p30P33Current.filter((item) => item.counts_as_effect_object === true).length, 31, "P30-P33 active terminal leaf set drifted");
assert.equal(p30P33Current.filter((item) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 20, "P30-P33 explicit Fach set drifted");
assert.equal(p30P33Current.filter((item) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 11, "P30-P33 exact RNAA set drifted");
assert.equal(p30P33Current.filter((item) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 4, "P30-P33 versioned parent set drifted");
assert.equal(p34P37Current.length, 92, "P34-P37 terminal set drifted");
assert.equal(p34P37Current.filter((item) => item.counts_as_effect_object === true).length, 30, "P34-P37 active terminal leaf set drifted");
assert.equal(p34P37Current.filter((item) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 23, "P34-P37 explicit Fach set drifted");
assert.equal(p34P37Current.filter((item) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 7, "P34-P37 exact RNAA set drifted");
assert.equal(p34P37Current.filter((item) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 14, "P34-P37 versioned parent/fragment set drifted");
assert.equal(p38P41Current.length, 131, "P38-P41 terminal set drifted");
assert.equal(p38P41Current.filter((item) => item.counts_as_effect_object === true).length, 68, "P38-P41 active terminal leaf set drifted");
assert.equal(p38P41Current.filter((item) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 47, "P38-P41 explicit Fach set drifted");
assert.equal(p38P41Current.filter((item) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 21, "P38-P41 exact RNAA set drifted");
assert.equal(p38P41Current.filter((item) => item.fach_state === "NON_EFFECT_CONTEXT_REVIEWED").length, 47, "P38-P41 zero-count terminal set drifted");
assert.equal(p38P41Current.filter((item) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 16, "P38-P41 versioned parent/fragment set drifted");
assert.equal(p38P41Current.filter((item) => item.parent_object_ids).length, 40, "P38-P41 deterministic terminal set drifted");
assert.equal(bsw.remaining_review_objects.filter((item) => /-P(?:38|39|40|41)-/.test(item.object_id)).length, 0, "P38-P41 exact child residual must be closed");
assert.equal(p42P45Current.length, 78, "P42-P45 terminal set drifted");
assert.equal(p42P45Current.filter((item) => item.counts_as_effect_object === true).length, 32, "P42-P45 active terminal leaf set drifted");
assert.equal(p42P45Current.filter((item) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 22, "P42-P45 explicit Fach set drifted");
assert.equal(p42P45Current.filter((item) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 10, "P42-P45 exact RNAA set drifted");
assert.equal(p42P45Current.filter((item) => item.fach_state === "NON_EFFECT_CONTEXT_REVIEWED").length, 40, "P42-P45 zero-count terminal set drifted");
assert.equal(p42P45Current.filter((item) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 6, "P42-P45 versioned parent set drifted");
assert.equal(p42P45Current.filter((item) => item.parent_object_ids).length, 12, "P42-P45 deterministic terminal set drifted");
assert.equal(bsw.remaining_review_objects.filter((item) => /-P(?:42|43)-/.test(item.object_id)).length, 0, "P42-P43 exact child residual must be closed");
assert.equal(p46P49Current.length, 122, "P46-P49 terminal set drifted");
assert.equal(p46P49Current.filter((item) => item.counts_as_effect_object === true).length, 53, "P46-P49 active terminal leaf set drifted");
assert.equal(p46P49Current.filter((item) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 36, "P46-P49 explicit Fach set drifted");
assert.equal(p46P49Current.filter((item) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 17, "P46-P49 exact RNAA set drifted");
assert.equal(p46P49Current.filter((item) => item.fach_state === "NON_EFFECT_CONTEXT_REVIEWED").length, 51, "P46-P49 zero-count terminal set drifted");
assert.equal(p46P49Current.filter((item) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 18, "P46-P49 versioned parent/fragment set drifted");
assert.equal(p46P49Current.filter((item) => item.parent_object_ids).length, 27, "P46-P49 deterministic terminal set drifted");
assert.equal(p50P53Current.length, 83, "P50-P53 terminal set drifted");
assert.equal(p50P53Current.filter((item) => item.counts_as_effect_object === true).length, 32, "P50-P53 active terminal leaf set drifted");
assert.equal(p50P53Current.filter((item) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 24, "P50-P53 explicit Fach set drifted");
assert.equal(p50P53Current.filter((item) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 8, "P50-P53 exact RNAA set drifted");
assert.equal(p50P53Current.filter((item) => item.fach_state === "NON_EFFECT_CONTEXT_REVIEWED").length, 44, "P50-P53 zero-count terminal set drifted");
assert.equal(p50P53Current.filter((item) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 7, "P50-P53 versioned parent/fragment set drifted");
assert.equal(p50P53Current.filter((item) => item.parent_object_ids).length, 14, "P50-P53 deterministic terminal set drifted");
assert.equal(p54P57Current.length, 86, "P54-P57 terminal set drifted");
assert.equal(p54P57Current.filter((item) => item.counts_as_effect_object === true).length, 30, "P54-P57 active terminal leaf set drifted");
assert.equal(p54P57Current.filter((item) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 23, "P54-P57 explicit Fach set drifted");
assert.equal(p54P57Current.filter((item) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 7, "P54-P57 exact RNAA set drifted");
assert.equal(p54P57Current.filter((item) => item.fach_state === "NON_EFFECT_CONTEXT_REVIEWED").length, 51, "P54-P57 zero-count terminal set drifted");
assert.equal(p54P57Current.filter((item) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 5, "P54-P57 versioned parent/fragment set drifted");
assert.equal(p54P57Current.filter((item) => item.parent_object_ids).length, 9, "P54-P57 deterministic terminal set drifted");
assert.equal(p58P59Current.length, 44, "P58-P59 terminal set drifted");
assert.equal(p58P59Current.filter((item) => item.counts_as_effect_object === true).length, 14, "P58-P59 active terminal leaf set drifted");
assert.equal(p58P59Current.filter((item) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 10, "P58-P59 explicit Fach set drifted");
assert.equal(p58P59Current.filter((item) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 4, "P58-P59 exact RNAA set drifted");
assert.equal(p58P59Current.filter((item) => item.fach_state === "NON_EFFECT_CONTEXT_REVIEWED").length, 28, "P58-P59 zero-count terminal set drifted");
assert.equal(p58P59Current.filter((item) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 2, "P58-P59 versioned parent set drifted");
assert.equal(p58P59Current.filter((item) => item.parent_object_ids).length, 4, "P58-P59 deterministic terminal set drifted");
assert.equal(p60P63Current.length, 97, "P60-P63 terminal set drifted");
assert.equal(p60P63Current.filter((item) => item.counts_as_effect_object === true).length, 25, "P60-P63 active terminal leaf set drifted");
assert.equal(p60P63Current.filter((item) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 12, "P60-P63 explicit Fach set drifted");
assert.equal(p60P63Current.filter((item) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 13, "P60-P63 exact RNAA set drifted");
assert.equal(p60P63Current.filter((item) => item.fach_state === "NON_EFFECT_CONTEXT_REVIEWED").length, 67, "P60-P63 zero-count terminal set drifted");
assert.equal(p60P63Current.filter((item) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 5, "P60-P63 versioned parent set drifted");
assert.equal(p60P63Current.filter((item) => item.parent_object_ids).length, 5, "P60-P63 deterministic terminal set drifted");
assert.ok(
  ledger.effect_atoms.filter((atom) => atom.pdf_page < 14 || atom.pdf_page > 63).every((atom) => !currentIds.has(atom.atom_id)),
  "rejected BSW generic terminal outside explicit pages 14-63 leaked into current truth",
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
  p34P37ExactOpenChildren: bsw.remaining_review_objects.filter((item) => /-P(?:34|35|36|37)-/.test(item.object_id)).length,
  p38P41TerminalObjects: p38P41Current.length,
  p38P41ExactOpenChildren: bsw.remaining_review_objects.filter((item) => /-P(?:38|39|40|41)-/.test(item.object_id)).length,
  p42P45TerminalObjects: p42P45Current.length,
  p42P43ExactOpenChildren: bsw.remaining_review_objects.filter((item) => /-P(?:42|43)-/.test(item.object_id)).length,
  p46P49TerminalObjects: p46P49Current.length,
  p50P53TerminalObjects: p50P53Current.length,
  p54P57TerminalObjects: p54P57Current.length,
  p60P63TerminalObjects: p60P63Current.length,
  programmeAnalysisComplete: bsw.programme_analysis_complete,
}));
