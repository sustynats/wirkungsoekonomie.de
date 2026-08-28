import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ledger = JSON.parse(readFileSync("data/state-programmes/fach-reviews/berlin-2026-bsw-v1.json", "utf8"));
const residual = JSON.parse(readFileSync("data/state-programmes/fach-content-residuals/berlin-2026-v3.json", "utf8"));

test("BSW Berlin preserves protected P1-14 and exact issue #240 P15-23 terminals", () => {
  assert.equal(ledger.protected_terminal_stock.length, 3);
  assert.deepEqual(
    ledger.protected_terminal_stock.map((stock: { accepted_terminal_records: unknown[] }) => stock.accepted_terminal_records.length),
    [13, 23, 20],
  );
  const bsw = residual.programmes.find((programme: { party: string }) => programme.party === "BSW");
  assert.ok(bsw);
  assert.equal(bsw.terminal_object_count, 303);
  assert.equal(bsw.terminal_objects.length, 303);
  assert.equal(new Set(bsw.terminal_objects.map((item: { object_id: string }) => item.object_id)).size, 303);
  assert.deepEqual(bsw.terminal_status_counts, {
    EXPLICIT_FACH_APPROVED: 142,
    REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 20,
    NON_EFFECT_CONTEXT_REVIEWED: 115,
    SOURCE_UNIT_RECLASSIFIED_VERSIONED: 26,
  });
});

test("BSW P22 is closed while P23 exact children and pages 24-66 remain current", () => {
  const bsw = residual.programmes.find((programme: { party: string }) => programme.party === "BSW");
  assert.ok(bsw);
  assert.equal(bsw.programme_analysis_complete, false);
  assert.equal(bsw.fach_state, "GENUINE_FACH_REVIEW_REQUIRED");
  assert.equal(bsw.remaining_review_envelope_count, 43);
  assert.equal(bsw.remaining_exact_object_count, 13);
  assert.equal(bsw.remaining_review_scope_count, 56);
  assert.equal(bsw.remaining_review_objects.length, 13);
  assert.deepEqual(
    bsw.remaining_review_envelopes.map((item: { source_locator: string }) => Number(item.source_locator.match(/PDF page (\d+)/)?.[1])),
    Array.from({ length: 43 }, (_, index) => index + 24),
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
  assert.equal(p23.length, 25);
  assert.equal(p23.filter((item: { counts_as_effect_object?: boolean }) => item.counts_as_effect_object === true).length, 9);
  assert.equal(p23.filter((item: { fach_state: string }) => item.fach_state === "SOURCE_UNIT_RECLASSIFIED_VERSIONED").length, 6);
  assert.ok(bsw.remaining_review_objects.every((item: {
    object_id: string;
    source_text_sha256: string;
    fach_state: string;
    materialization_mode: string;
  }) => item.object_id.includes("-P23-")
    && item.object_id.endsWith(item.source_text_sha256.slice(0, 12))
    && item.fach_state === "GENUINE_FACH_REVIEW_REQUIRED"
    && item.materialization_mode === "DETERMINISTIC_SEGMENTATION_ONLY_NO_FACH"));
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
    .filter((atom: { pdf_page: number }) => atom.pdf_page < 14 || atom.pdf_page > 23)
    .every((atom: { atom_id: string }) => !currentIds.has(atom.atom_id)));
  assert.equal(residual.summary.programme_analysis_complete, 3);
  assert.equal(residual.summary.programme_analysis_open, 9);
  assert.equal(residual.summary.remaining_page_review_envelopes, 1258);
  assert.equal(residual.summary.remaining_exact_effect_objects_identified, 13);
  assert.equal(residual.summary.remaining_review_scope_count, 1271);
});
