import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ledger = JSON.parse(readFileSync("data/state-programmes/fach-reviews/berlin-2026-bsw-v1.json", "utf8"));
const residual = JSON.parse(readFileSync("data/state-programmes/fach-content-residuals/berlin-2026-v3.json", "utf8"));

test("BSW Berlin preserves protected P1-14 and exact issue #240 P15-49 terminals", () => {
  assert.equal(ledger.protected_terminal_stock.length, 3);
  assert.deepEqual(
    ledger.protected_terminal_stock.map((stock: { accepted_terminal_records: unknown[] }) => stock.accepted_terminal_records.length),
    [13, 23, 20],
  );
  const bsw = residual.programmes.find((programme: { party: string }) => programme.party === "BSW");
  assert.ok(bsw);
  assert.equal(bsw.terminal_object_count, 937);
  assert.equal(bsw.terminal_objects.length, 937);
  assert.equal(new Set(bsw.terminal_objects.map((item: { object_id: string }) => item.object_id)).size, 937);
  assert.deepEqual(bsw.terminal_status_counts, {
    EXPLICIT_FACH_APPROVED: 310,
    REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 84,
    NON_EFFECT_CONTEXT_REVIEWED: 429,
    SOURCE_UNIT_RECLASSIFIED_VERSIONED: 114,
  });
});

test("BSW P24/P25 and P30-P49 are closed while P34-P43 has exact children and P50-P66 stays opaque", () => {
  const bsw = residual.programmes.find((programme: { party: string }) => programme.party === "BSW");
  assert.ok(bsw);
  assert.equal(bsw.programme_analysis_complete, false);
  assert.equal(bsw.fach_state, "GENUINE_FACH_REVIEW_REQUIRED");
  assert.equal(bsw.remaining_review_envelope_count, 17);
  assert.equal(bsw.remaining_exact_object_count, 61);
  assert.equal(bsw.remaining_review_scope_count, 78);
  assert.equal(bsw.remaining_review_objects.length, 61);
  assert.deepEqual(
    bsw.remaining_review_envelopes.map((item: { source_locator: string }) => Number(item.source_locator.match(/PDF page (\d+)/)?.[1])),
    Array.from({ length: 17 }, (_, index) => index + 50),
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
  assert.equal(
    bsw.terminal_objects.filter((item: { object_id: string; fach_handoff?: string }) => (
      item.object_id.includes("-P19-") && item.fach_handoff?.endsWith("issuecomment-5451527622")
    )).length,
    8,
  );
  const p22 = bsw.terminal_objects.filter((item: { object_id: string }) => item.object_id.includes("-P22-"));
  assert.equal(p22.length, 41);
  assert.equal(p22.filter((item: { counts_as_effect_object?: boolean }) => item.counts_as_effect_object === true).length, 24);
  assert.equal(p22.filter((item: { object_kind: string }) => item.object_kind === "DETERMINISTIC_SEGMENTATION_REPLACEMENT").length, 12);
  const restatement = p22.find((item: { object_id: string }) => item.object_id === "BE-BSW-P22-U02-A07-0cd49822c754");
  assert.equal(restatement.restatement_target_object_id, "BE-BSW-P22-U02-A04-C02-fd05adab8416");
  assert.equal(restatement.counts_as_effect_object, false);
  const p23 = bsw.terminal_objects.filter((item: { object_id: string }) => item.object_id.includes("-P23-"));
  assert.equal(p23.length, 38);
  assert.equal(p23.filter((item: { counts_as_effect_object?: boolean }) => item.counts_as_effect_object === true).length, 22);
  assert.equal(p23.filter((item: { fach_state: string }) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 6);
  assert.equal(p23.filter((item: { object_kind: string; fach_state: string }) => item.object_kind === "DETERMINISTIC_SEGMENTATION_REPLACEMENT" && item.fach_state === "EXPLICIT_FACH_APPROVED").length, 13);
  const p26P29 = bsw.terminal_objects.filter((item: { object_id: string }) => /-P(?:26|27|28|29)-|-P28P29-/.test(item.object_id));
  assert.equal(p26P29.length, 113);
  assert.equal(p26P29.filter((item: { counts_as_effect_object?: boolean }) => item.counts_as_effect_object === true).length, 31);
  assert.equal(p26P29.filter((item: { fach_state: string }) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 26);
  assert.equal(p26P29.filter((item: { fach_state: string }) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 5);
  const p24P25Children = bsw.terminal_objects.filter((item: { object_id: string; object_kind: string }) => (
    item.object_kind === "DETERMINISTIC_SEGMENTATION_REPLACEMENT"
      && /-P(?:24|25)-/.test(item.object_id)
  ));
  assert.equal(p24P25Children.length, 23);
  assert.equal(p24P25Children.filter((item: { fach_state: string }) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 20);
  assert.equal(p24P25Children.filter((item: { fach_state: string }) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 1);
  assert.equal(p24P25Children.filter((item: { fach_state: string }) => item.fach_state === "NON_EFFECT_CONTEXT_REVIEWED").length, 2);
  const p30P33 = bsw.terminal_objects.filter((item: { object_id: string }) => /-P(?:30|31|32|33)-|-P30P31-/.test(item.object_id));
  assert.equal(p30P33.length, 84);
  assert.equal(p30P33.filter((item: { counts_as_effect_object?: boolean }) => item.counts_as_effect_object === true).length, 31);
  assert.equal(p30P33.filter((item: { fach_state: string }) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 20);
  assert.equal(p30P33.filter((item: { fach_state: string }) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 11);
  assert.equal(p30P33.filter((item: { fach_state: string }) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 4);
  const p34P37 = bsw.terminal_objects.filter((item: { object_id: string }) => /-P(?:34|35|36|37)-|-P34P35-|-P35P36-|-P36P37-/.test(item.object_id));
  assert.equal(p34P37.length, 73);
  assert.equal(p34P37.filter((item: { counts_as_effect_object?: boolean }) => item.counts_as_effect_object === true).length, 15);
  assert.equal(p34P37.filter((item: { fach_state: string }) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 10);
  assert.equal(p34P37.filter((item: { fach_state: string }) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 5);
  assert.equal(p34P37.filter((item: { fach_state: string }) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 14);
  const p38P41 = bsw.terminal_objects.filter((item: { object_id: string }) => /-P(?:38|39|40|41)-|-P38P39-/.test(item.object_id));
  assert.equal(p38P41.length, 93);
  assert.equal(p38P41.filter((item: { counts_as_effect_object?: boolean }) => item.counts_as_effect_object === true).length, 30);
  assert.equal(p38P41.filter((item: { fach_state: string }) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 18);
  assert.equal(p38P41.filter((item: { fach_state: string }) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 12);
  assert.equal(p38P41.filter((item: { fach_state: string }) => item.fach_state === "NON_EFFECT_CONTEXT_REVIEWED").length, 47);
  assert.equal(p38P41.filter((item: { fach_state: string }) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 16);
  assert.equal(bsw.remaining_review_objects.filter((item: { object_id: string }) => /-P(?:38|39|40|41)-/.test(item.object_id)).length, 38);
  const p42P45 = bsw.terminal_objects.filter((item: { object_id: string }) => /-P(?:42|43|44|45)-/.test(item.object_id));
  assert.equal(p42P45.length, 74);
  assert.equal(p42P45.filter((item: { counts_as_effect_object?: boolean }) => item.counts_as_effect_object === true).length, 29);
  assert.equal(p42P45.filter((item: { fach_state: string }) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 20);
  assert.equal(p42P45.filter((item: { fach_state: string }) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 9);
  assert.equal(p42P45.filter((item: { fach_state: string }) => item.fach_state === "NON_EFFECT_CONTEXT_REVIEWED").length, 39);
  assert.equal(p42P45.filter((item: { fach_state: string }) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 6);
  assert.equal(bsw.remaining_review_objects.filter((item: { object_id: string }) => /-P(?:42|43)-/.test(item.object_id)).length, 4);
  const p46P49 = bsw.terminal_objects.filter((item: { object_id: string }) => /-P(?:46|47|48|49)-|-P49P50-|-P50-U01-bb3d4390ad9a/.test(item.object_id));
  assert.equal(p46P49.length, 122);
  assert.equal(p46P49.filter((item: { counts_as_effect_object?: boolean }) => item.counts_as_effect_object === true).length, 53);
  assert.equal(p46P49.filter((item: { fach_state: string }) => item.fach_state === "EXPLICIT_FACH_APPROVED").length, 36);
  assert.equal(p46P49.filter((item: { fach_state: string }) => item.fach_state === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON").length, 17);
  assert.equal(p46P49.filter((item: { fach_state: string }) => item.fach_state === "NON_EFFECT_CONTEXT_REVIEWED").length, 51);
  assert.equal(p46P49.filter((item: { fach_state: string }) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 18);
  assert.equal(p46P49.filter((item: { parent_object_ids?: string[] }) => item.parent_object_ids).length, 27);
  assert.ok(bsw.remaining_review_objects.every((item: { fach_state: string; counts_as_effect_object: boolean }) => (
    item.fach_state === "GENUINE_FACH_REVIEW_REQUIRED" && item.counts_as_effect_object === true
  )));
});

test("the former BSW atom ledger is retained only as rejected historical evidence", () => {
  assert.equal(ledger.effect_atoms.length, 896);
  assert.ok(ledger.effect_atoms.every((atom: { terminal_status: string }) => atom.terminal_status === "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON"));
  assert.equal(residual.rejected_predecessor.disposition, "REJECTED_FALSE_TERMINAL_HISTORICAL_EVIDENCE_ONLY");
  const currentIds = new Set(residual.programmes.flatMap((programme: { terminal_objects: { object_id: string }[] }) => (
    programme.terminal_objects.map((item) => item.object_id)
  )));
  const explicitlySupersededPage14 = residual.programmes
    .find((programme: { party: string }) => programme.party === "BSW")
    .terminal_objects
    .filter((item: { fach_handoff?: string }) => item.fach_handoff?.endsWith("issuecomment-5449003550"));
  assert.equal(explicitlySupersededPage14.length, 23);
  assert.ok(ledger.effect_atoms
    .filter((atom: { pdf_page: number }) => atom.pdf_page < 14 || atom.pdf_page > 49)
    .every((atom: { atom_id: string }) => !currentIds.has(atom.atom_id)));
  assert.equal(residual.summary.programme_analysis_complete, 3);
  assert.equal(residual.summary.programme_analysis_open, 9);
  assert.equal(residual.summary.remaining_page_review_envelopes, 1232);
  assert.equal(residual.summary.remaining_exact_effect_objects_identified, 61);
  assert.equal(residual.summary.remaining_review_scope_count, 1293);
});
