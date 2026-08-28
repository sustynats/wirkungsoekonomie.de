#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BINDING_ORDER,
  OPEN_PROGRAMMES,
  TERMINAL_PROGRAMMES,
  buildBerlinFachTruthResidual,
  canonicalJson,
  sha256,
} from './materialize-berlin-fach-truth-residual.mjs';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MATRIX_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-content-residuals/berlin-2026-v3.json');

export function loadBerlinFachTruthResidual() {
  return JSON.parse(fs.readFileSync(MATRIX_PATH, 'utf8'));
}

export function validateBerlinFachTruthResidual(matrix, {
  verifyDescriptor = true,
  verifyInputs = true,
} = {}) {
  if (verifyDescriptor) {
    const unhashed = structuredClone(matrix);
    delete unhashed.descriptor_sha256;
    assert.equal(sha256(canonicalJson(unhashed)), matrix.descriptor_sha256, 'Berlin Fach-truth descriptor mismatch');
  }

  assert.equal(matrix.schema_version, 'woek-berlin-fach-content-residual-3.2');
  assert.equal(matrix.matrix_id, 'BE-FACH-CONTENT-RESIDUAL-2026-V3');
  assert.equal(matrix.base_main_commit, '91dce3c60f90c1cab090ac9bd8ab4b3b01c704e1');
  assert.equal(matrix.status, 'BERLIN_FACH_TRUTH_REMEDIATION_OPEN_9_OF_12');
  assert.deepEqual(matrix.binding_order, BINDING_ORDER);
  assert.deepEqual(matrix.execution_order_remaining, OPEN_PROGRAMMES);
  assert.equal(matrix.rejected_predecessor.disposition, 'REJECTED_FALSE_TERMINAL_HISTORICAL_EVIDENCE_ONLY');
  assert.equal(matrix.rejected_predecessor.rejected_programme_analysis_complete, 12);
  assert.ok(matrix.rejected_predecessor.rejected_generic_rnaa_count > 0);
  assert.equal(matrix.accepted_incremental_handoffs[0].issue_comment_id, 5449003550);
  assert.deepEqual(matrix.accepted_incremental_handoffs[1].issue_comment_ids, [5449855264, 5449881459, 5449901373, 5450371661, 5451044705]);
  assert.equal(matrix.accepted_incremental_handoffs[1].exact_terminal_object_count, 119);
  assert.equal(matrix.accepted_incremental_handoffs[1].exact_open_child_object_count, 8);
  assert.deepEqual(matrix.accepted_incremental_handoffs[2].issue_comment_ids, [5451527622, 5451533796, 5451555353, 5451565159]);
  assert.equal(matrix.accepted_incremental_handoffs[2].exact_terminal_object_count, 39);
  assert.equal(matrix.accepted_incremental_handoffs[2].exact_open_child_object_count, 0);
  assert.deepEqual(matrix.accepted_incremental_handoffs[3].issue_comment_ids, [5452887573, 5452894797, 5452902986]);
  assert.equal(matrix.accepted_incremental_handoffs[3].controller_issue_comment_id, 5452905705);
  assert.equal(matrix.accepted_incremental_handoffs[3].exact_terminal_object_count, 41);
  assert.equal(matrix.accepted_incremental_handoffs[3].active_terminal_review_leaf_count, 24);
  assert.equal(matrix.accepted_incremental_handoffs[3].exact_open_child_object_count, 0);
  assert.deepEqual(matrix.accepted_incremental_handoffs[3].physical_pdf_pages, [22]);
  assert.equal(matrix.accepted_incremental_handoffs[3].gate, 'BE_BSW_P22_FACH_COMPLETE_PASS_SOURCE_BOUND');
  assert.deepEqual(matrix.accepted_incremental_handoffs[4].issue_comment_ids, [5452692674]);
  assert.equal(matrix.accepted_incremental_handoffs[4].controller_issue_comment_id, 5452695176);
  assert.equal(matrix.accepted_incremental_handoffs[4].exact_terminal_object_count, 25);
  assert.equal(matrix.accepted_incremental_handoffs[4].active_terminal_review_leaf_count, 9);
  assert.equal(matrix.accepted_incremental_handoffs[4].exact_open_child_object_count, 13);
  assert.deepEqual(matrix.accepted_incremental_handoffs[4].physical_pdf_pages, [23]);
  assert.equal(matrix.accepted_incremental_handoffs[4].gate, 'BE_BSW_P23_CLEAN_RECORDS_TERMINAL_CHILD_FACH_PENDING');
  assert.deepEqual(matrix.accepted_incremental_handoffs[5].issue_comment_ids, [5455797952, 5452737343, 5452761537]);
  assert.equal(matrix.accepted_incremental_handoffs[5].controller_issue_comment_id, 5455799664);
  assert.equal(matrix.accepted_incremental_handoffs[5].exact_terminal_object_count, 53);
  assert.equal(matrix.accepted_incremental_handoffs[5].exact_open_child_object_count, 22);
  assert.deepEqual(matrix.accepted_incremental_handoffs[5].physical_pdf_pages, [23, 24, 25]);
  assert.equal(matrix.accepted_incremental_handoffs[5].gate, 'BE_BSW_P23_P25_CLEAN_RECORDS_TERMINAL_CHILD_FACH_PENDING');
  assert.deepEqual(matrix.accepted_incremental_handoffs[6].issue_comment_ids, [5453271486, 5453313480, 5453972082, 5454011541]);
  assert.equal(matrix.accepted_incremental_handoffs[6].controller_issue_comment_id, 5456983188);
  assert.equal(matrix.accepted_incremental_handoffs[6].exact_terminal_object_count, 113);
  assert.equal(matrix.accepted_incremental_handoffs[6].active_terminal_review_leaf_count, 31);
  assert.equal(matrix.accepted_incremental_handoffs[6].exact_open_child_object_count, 0);
  assert.deepEqual(matrix.accepted_incremental_handoffs[6].physical_pdf_pages, [26, 27, 28, 29]);
  assert.equal(matrix.accepted_incremental_handoffs[6].gate, 'BE_BSW_P26_P29_FACH_COMPLETE_PASS_SOURCE_BOUND');
  assert.deepEqual(matrix.accepted_incremental_handoffs[7].issue_comment_ids, [5457221577, 5457228818, 5457240763, 5457248909]);
  assert.equal(matrix.accepted_incremental_handoffs[7].controller_issue_comment_id, 5457255354);
  assert.equal(matrix.accepted_incremental_handoffs[7].exact_terminal_object_count, 22);
  assert.equal(matrix.accepted_incremental_handoffs[7].exact_open_child_object_count, 0);
  assert.equal(matrix.accepted_incremental_handoffs[7].gate, 'BE_BSW_P24_P25_EXACT_CHILD_FACH_RESIDUAL_ZERO');
  assert.deepEqual(matrix.accepted_incremental_handoffs[8].issue_comment_ids, [5454047551, 5454095617, 5454152920, 5454551001]);
  assert.equal(matrix.accepted_incremental_handoffs[8].controller_issue_comment_id, 5457255354);
  assert.equal(matrix.accepted_incremental_handoffs[8].exact_terminal_object_count, 84);
  assert.equal(matrix.accepted_incremental_handoffs[8].active_terminal_review_leaf_count, 31);
  assert.equal(matrix.accepted_incremental_handoffs[8].exact_open_child_object_count, 0);
  assert.deepEqual(matrix.accepted_incremental_handoffs[8].physical_pdf_pages, [30, 31, 32, 33]);
  assert.equal(matrix.accepted_incremental_handoffs[8].gate, 'BE_BSW_P30_P33_FACH_COMPLETE_PASS_SOURCE_BOUND');
  assert.deepEqual(matrix.accepted_incremental_handoffs[9].issue_comment_ids, [5455124893, 5455153680, 5455190042, 5455197085]);
  assert.equal(matrix.accepted_incremental_handoffs[9].controller_issue_comment_id, 5458291078);
  assert.equal(matrix.accepted_incremental_handoffs[9].exact_terminal_object_count, 73);
  assert.equal(matrix.accepted_incremental_handoffs[9].active_terminal_review_leaf_count, 15);
  assert.equal(matrix.accepted_incremental_handoffs[9].exact_open_child_object_count, 19);
  assert.deepEqual(matrix.accepted_incremental_handoffs[9].physical_pdf_pages, [34, 35, 36, 37]);
  assert.equal(matrix.accepted_incremental_handoffs[9].gate, 'BE_BSW_P34_P37_CLEAN_RECORDS_TERMINAL_CHILD_FACH_PENDING');
  assert.equal(matrix.state_model.invariant, 'Source or segmentation closure never implies Fach terminality.');
  assert.equal(matrix.review_envelope_contract.effect_object_count_before_segmentation, null);
  assert.equal(matrix.review_envelope_contract.missing_effect_object_count_interpretation, 'UNKNOWN_NOT_ZERO');
  assert.ok(Object.values(matrix.constraints).every((value) => value === false));
  assert.equal(matrix.release_policy.no_new_vercel_build, true);
  assert.equal(matrix.release_policy.parliament_release_approval, 'NOT_GRANTED');
  assert.equal(matrix.release_policy.owner_rc_request_allowed, false);

  assert.equal(matrix.programmes.length, 12);
  assert.equal(new Set(matrix.programmes.map((item) => item.party)).size, 12);
  assert.deepEqual(matrix.programmes.map((item) => item.party), BINDING_ORDER);
  const allCurrentObjectIds = new Set();
  let terminalObjects = 0;
  let remainingEnvelopes = 0;
  let remainingExactObjects = 0;
  const terminalCounts = {
    EXPLICIT_FACH_APPROVED: 0,
    REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 0,
    NON_EFFECT_CONTEXT_REVIEWED: 0,
    SOURCE_UNIT_RECLASSIFIED_VERSIONED: 0,
  };

  for (const programme of matrix.programmes) {
    assert.equal(programme.source_state, 'FINAL_SOURCE_ARTIFACT_VERIFIED');
    const shouldBeComplete = TERMINAL_PROGRAMMES.includes(programme.party);
    assert.equal(programme.programme_analysis_complete, shouldBeComplete, `${programme.party}: completion truth drift`);
    assert.equal(programme.fach_state, shouldBeComplete ? 'PROGRAMME_ANALYSIS_COMPLETE' : 'GENUINE_FACH_REVIEW_REQUIRED');
    assert.equal(programme.terminal_object_count, programme.terminal_objects.length);
    assert.equal(programme.remaining_review_envelope_count, programme.remaining_review_envelopes.length);
    assert.equal(programme.remaining_exact_object_count, programme.remaining_review_objects.length);
    assert.equal(programme.remaining_review_scope_count, programme.remaining_review_envelope_count + programme.remaining_exact_object_count);
    if (shouldBeComplete) assert.equal(programme.remaining_review_scope_count, 0);
    else assert.ok(programme.remaining_review_scope_count > 0, `${programme.party}: open programme lost finite residual`);

    for (const object of programme.terminal_objects) {
      assert.ok(!allCurrentObjectIds.has(object.object_id), `duplicate current object id ${object.object_id}`);
      allCurrentObjectIds.add(object.object_id);
      assert.equal(object.source_state, 'SOURCE_BOUND_VERIFIED');
      assert.ok(Object.hasOwn(terminalCounts, object.fach_state), `${object.object_id}: invalid terminal Fach status`);
      if (object.fach_state === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED') {
        assert.match(object.segmentation_state, /^(SEGMENTATION_SUPERSEDED_NONCOUNTING_(FRAGMENT|PARENT)|SOURCE_OR_FRAGMENT_SUPERSEDED_NONCOUNTING|COMPOUND_EFFECT_PARENT_NONCOUNTING|VERSIONED_PARENT_OR_RESTATEMENT_NON_COUNTING|OBJECT_BOUNDARY_VERIFIED)$/);
        if (object.segmentation_state !== 'OBJECT_BOUNDARY_VERIFIED') assert.equal(object.counts_as_effect_object, false);
      } else {
        assert.equal(object.segmentation_state, 'OBJECT_BOUNDARY_VERIFIED');
      }
      terminalCounts[object.fach_state] += 1;
      if (object.fach_state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON') {
        assert.match(object.fach_handoff ?? '', /^https:\/\/github\.com\/sustynats\/wirkungsoekonomie\.de\/issues\/240#issuecomment-/);
      }
    }
    for (const envelope of programme.remaining_review_envelopes) {
      assert.ok(!allCurrentObjectIds.has(envelope.object_id), `duplicate current object id ${envelope.object_id}`);
      allCurrentObjectIds.add(envelope.object_id);
      assert.equal(envelope.object_kind, 'PHYSICAL_PDF_PAGE_REVIEW_ENVELOPE');
      assert.equal(envelope.segmentation_state, 'SEGMENTATION_REVIEW_REQUIRED');
      assert.equal(envelope.fach_state, 'GENUINE_FACH_REVIEW_REQUIRED');
      assert.equal(envelope.effect_bearing_status, 'NOT_YET_CLASSIFIED');
      assert.equal(envelope.counts_as_effect_object, false);
      for (const forbidden of ['impact_direction', 'evidence_level', 'dns_mapping', 'recommendation', 'score']) {
        assert.equal(envelope[forbidden], undefined, `${envelope.object_id}: review envelope synthesized ${forbidden}`);
      }
    }
    for (const object of programme.remaining_review_objects) {
      assert.ok(!allCurrentObjectIds.has(object.object_id), `duplicate current object id ${object.object_id}`);
      allCurrentObjectIds.add(object.object_id);
      assert.equal(object.object_kind, 'DETERMINISTIC_SEGMENTATION_REPLACEMENT');
      assert.equal(object.source_state, 'SOURCE_BOUND_VERIFIED');
      assert.equal(object.segmentation_state, 'OBJECT_BOUNDARY_VERIFIED');
      assert.equal(object.fach_state, 'GENUINE_FACH_REVIEW_REQUIRED');
      assert.equal(object.counts_as_effect_object, true);
      assert.equal(object.materialization_mode, 'DETERMINISTIC_SEGMENTATION_ONLY_NO_FACH');
      assert.ok(object.exact_reason);
      for (const forbidden of ['impact_direction', 'evidence_level', 'dns_mapping', 'recommendation', 'score']) {
        assert.equal(object[forbidden], undefined, `${object.object_id}: open exact object synthesized ${forbidden}`);
      }
    }
    terminalObjects += programme.terminal_object_count;
    remainingEnvelopes += programme.remaining_review_envelope_count;
    remainingExactObjects += programme.remaining_exact_object_count;
  }

  const bsw = matrix.programmes.find((item) => item.party === 'BSW');
  assert.equal(bsw.terminal_object_count, 648);
  assert.deepEqual(bsw.terminal_status_counts, {
    EXPLICIT_FACH_APPROVED: 236,
    REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 46,
    NON_EFFECT_CONTEXT_REVIEWED: 292,
    SOURCE_UNIT_RECLASSIFIED_VERSIONED: 74,
  });
  assert.deepEqual(
    bsw.remaining_review_envelopes.map((item) => Number(item.source_locator.match(/PDF page (\d+)/)?.[1])),
    Array.from({ length: 29 }, (_, index) => index + 38),
    'BSW page-envelope residual must be exactly physical PDF pages 38-66',
  );
  const closedP19Children = [
      'BE-BSW-P19-U01-A02-C01-992a21f6297f',
      'BE-BSW-P19-U01-A02-C02-31ad0fd27481',
      'BE-BSW-P19-U01-A02-C03-54c77aef7b53',
      'BE-BSW-P19-U01-A02-C04-616958496a0d',
      'BE-BSW-P19-U01-A02-C05-7088dc49b909',
      'BE-BSW-P19-U01-A02-C06-6796c889eec8',
      'BE-BSW-P19-U02-A01-C01-389fbaff19ac',
      'BE-BSW-P19-U02-A01-C02-cc9e28e20af3',
  ];
  assert.equal(
    bsw.remaining_review_objects.filter((item) => item.object_id.includes('-P24-') || item.object_id.includes('-P25-')).length,
    0,
    'P24/P25 exact child residual must be closed',
  );
  assert.ok(closedP19Children.every((id) => bsw.terminal_objects.some((item) => item.object_id === id && item.fach_state === 'EXPLICIT_FACH_APPROVED')), 'BSW P19 child closure drift');
  const p22Objects = bsw.terminal_objects.filter((item) => item.object_id.includes('-P22-'));
  assert.equal(p22Objects.length, 41, 'P22 exact terminal object set drift');
  const p22ActiveLeaves = p22Objects.filter((item) => item.counts_as_effect_object === true);
  assert.equal(p22ActiveLeaves.length, 24, 'P22 active terminal leaf set drift');
  assert.equal(p22ActiveLeaves.filter((item) => item.fach_state === 'EXPLICIT_FACH_APPROVED').length, 18);
  assert.equal(p22ActiveLeaves.filter((item) => item.fach_state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON').length, 6);
  const p22Children = p22Objects.filter((item) => item.object_kind === 'DETERMINISTIC_SEGMENTATION_REPLACEMENT');
  assert.equal(p22Children.length, 12, 'P22 deterministic child set drift');
  for (const child of p22Children) {
    assert.equal(child.parent_object_ids.length, 1, `${child.object_id}: parent lineage drift`);
    assert.ok(child.object_id.endsWith(child.source_text_sha256.slice(0, 12)), `${child.object_id}: id/hash drift`);
    const parent = p22Objects.find((item) => item.object_id === child.parent_object_ids[0]);
    assert.ok(parent?.replacement_child_ids?.includes(child.object_id), `${child.object_id}: reverse parent lineage drift`);
    assert.equal(parent.counts_as_effect_object, false, `${parent.object_id}: parent must remain zero-counting`);
  }
  const p22Restatement = p22Objects.find((item) => item.object_id === 'BE-BSW-P22-U02-A07-0cd49822c754');
  assert.equal(p22Restatement.restatement_target_object_id, 'BE-BSW-P22-U02-A04-C02-fd05adab8416');
  assert.equal(p22Restatement.counts_as_effect_object, false);
  const p23Objects = bsw.terminal_objects.filter((item) => item.object_id.includes('-P23-'));
  assert.equal(p23Objects.length, 38, 'P23 exact terminal set drift');
  assert.equal(p23Objects.filter((item) => item.counts_as_effect_object === true).length, 22, 'P23 active terminal leaf set drift');
  assert.equal(p23Objects.filter((item) => item.fach_state === 'EXPLICIT_FACH_APPROVED').length, 22, 'P23 explicit terminal leaf set drift');
  const p23Parents = p23Objects.filter((item) => item.fach_state === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED');
  assert.equal(p23Parents.length, 6, 'P23 versioned parent set drift');
  const p23Children = p23Objects.filter((item) => item.object_kind === 'DETERMINISTIC_SEGMENTATION_REPLACEMENT');
  assert.equal(p23Children.length, 13, 'P23 deterministic child closure set drift');
  for (const child of p23Children) {
    assert.equal(child.parent_object_ids.length, 1, `${child.object_id}: parent lineage drift`);
    assert.ok(child.object_id.endsWith(child.source_text_sha256.slice(0, 12)), `${child.object_id}: id/hash drift`);
    assert.equal(sha256(child.source_excerpt), child.source_text_sha256, `${child.object_id}: source hash drift`);
    const parent = p23Objects.find((item) => item.object_id === child.parent_object_ids[0]);
    assert.ok(parent?.replacement_child_ids?.includes(child.object_id), `${child.object_id}: reverse parent lineage drift`);
    assert.equal(parent.counts_as_effect_object, false, `${parent.object_id}: parent must remain zero-counting`);
    assert.equal(parent.source_excerpt.slice(child.source_span.start, child.source_span.end), child.source_excerpt, `${child.object_id}: exact source span drift`);
    assert.equal(child.fach_state, 'EXPLICIT_FACH_APPROVED', `${child.object_id}: P23 child Fach closure drift`);
  }

  const p24Objects = bsw.terminal_objects.filter((item) => item.object_id.includes('-P24-'));
  const p25Objects = bsw.terminal_objects.filter((item) => item.object_id.includes('-P25-'));
  const crossPage = bsw.terminal_objects.find((item) => item.object_id === 'BE-BSW-P24P25-U10U01-M01-5bdd6ad3ba7e');
  assert.equal(p24Objects.length, 43, 'P24 terminal object set drift');
  assert.equal(p25Objects.length, 18, 'P25 terminal object set drift');
  assert.equal(crossPage?.fach_state, 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'P24-P25 cross-page repair Fach drift');
  const p24P25Children = [
    ...bsw.terminal_objects,
  ].filter((item) => item.object_kind === 'DETERMINISTIC_SEGMENTATION_REPLACEMENT' && (item.object_id.includes('-P24-') || item.object_id.includes('-P25-')));
  assert.equal(p24P25Children.length, 23, 'P24/P25 deterministic child set drift');
  assert.equal(p24P25Children.filter((item) => item.fach_state === 'EXPLICIT_FACH_APPROVED').length, 20, 'P24/P25 explicit child closure drift');
  assert.equal(p24P25Children.filter((item) => item.fach_state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON').length, 1, 'P24/P25 exact RNAA child closure drift');
  assert.equal(p24P25Children.filter((item) => item.fach_state === 'NON_EFFECT_CONTEXT_REVIEWED').length, 2, 'P24/P25 zero-count child set drift');
  for (const child of p24P25Children) {
    assert.equal(child.parent_object_ids.length, 1, `${child.object_id}: P24/P25 parent lineage drift`);
    assert.ok(child.object_id.endsWith(child.source_text_sha256.slice(0, 12)), `${child.object_id}: P24/P25 id/hash drift`);
    assert.equal(sha256(child.source_excerpt), child.source_text_sha256, `${child.object_id}: P24/P25 source hash drift`);
    const parent = bsw.terminal_objects.find((item) => item.object_id === child.parent_object_ids[0]);
    assert.ok(parent?.replacement_child_ids?.includes(child.object_id), `${child.object_id}: P24/P25 reverse parent lineage drift`);
    assert.equal(parent.source_excerpt.slice(child.source_span.start, child.source_span.end), child.source_excerpt, `${child.object_id}: P24/P25 exact source span drift`);
  }
  assert.equal(bsw.remaining_review_objects.filter((item) => item.object_id.includes('-P24-') || item.object_id.includes('-P25-')).length, 0, 'P24/P25 exact child residual count drift');

  const p26P29Objects = bsw.terminal_objects.filter((item) => /-P(?:26|27|28|29)-|-P28P29-/.test(item.object_id));
  assert.equal(p26P29Objects.length, 113, 'P26-P29 terminal set drift');
  assert.equal(p26P29Objects.filter((item) => item.counts_as_effect_object === true).length, 31, 'P26-P29 active terminal leaf set drift');
  assert.equal(p26P29Objects.filter((item) => item.fach_state === 'EXPLICIT_FACH_APPROVED').length, 26, 'P26-P29 explicit Fach set drift');
  assert.equal(p26P29Objects.filter((item) => item.fach_state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON').length, 5, 'P26-P29 exact RNAA set drift');
  assert.equal(p26P29Objects.filter((item) => item.fach_state === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED').length, 17, 'P26-P29 versioned parent set drift');
  const p26P29Deterministic = p26P29Objects.filter((item) => item.parent_object_ids);
  assert.equal(p26P29Deterministic.length, 32, 'P26-P29 deterministic record set drift');
  for (const item of p26P29Objects) {
    assert.equal(sha256(item.source_excerpt), item.source_text_sha256, `${item.object_id}: P26-P29 source hash drift`);
  }
  for (const child of p26P29Deterministic) {
    assert.ok(child.object_id.endsWith(child.source_text_sha256.slice(0, 12)), `${child.object_id}: P26-P29 id/hash drift`);
    assert.ok(child.parent_object_ids.every((id) => bsw.terminal_objects.some((item) => item.object_id === id && item.replacement_child_ids?.includes(child.object_id))), `${child.object_id}: P26-P29 reverse parent lineage drift`);
  }

  const p30P33Objects = bsw.terminal_objects.filter((item) => /-P(?:30|31|32|33)-|-P30P31-/.test(item.object_id));
  assert.equal(p30P33Objects.length, 84, 'P30-P33 terminal set drift');
  assert.equal(p30P33Objects.filter((item) => item.counts_as_effect_object === true).length, 31, 'P30-P33 active terminal leaf set drift');
  assert.equal(p30P33Objects.filter((item) => item.fach_state === 'EXPLICIT_FACH_APPROVED').length, 20, 'P30-P33 explicit Fach set drift');
  assert.equal(p30P33Objects.filter((item) => item.fach_state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON').length, 11, 'P30-P33 exact RNAA set drift');
  assert.equal(p30P33Objects.filter((item) => item.fach_state === 'NON_EFFECT_CONTEXT_REVIEWED').length, 49, 'P30-P33 zero-count terminal set drift');
  assert.equal(p30P33Objects.filter((item) => item.fach_state === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED').length, 4, 'P30-P33 versioned parent set drift');
  const p30P33Deterministic = p30P33Objects.filter((item) => item.parent_object_ids);
  assert.equal(p30P33Deterministic.length, 6, 'P30-P33 deterministic record set drift');
  for (const child of p30P33Deterministic) {
    assert.ok(child.object_id.endsWith(child.source_text_sha256.slice(0, 12)), `${child.object_id}: P30-P33 ID/hash drift`);
    assert.equal(sha256(child.source_excerpt), child.source_text_sha256, `${child.object_id}: P30-P33 source hash drift`);
    assert.ok(child.parent_object_ids.every((id) => bsw.terminal_objects.some((item) => item.object_id === id && item.replacement_record_ids?.includes(child.object_id))), `${child.object_id}: P30-P33 reverse parent lineage drift`);
  }

  const p34P37Objects = bsw.terminal_objects.filter((item) => /-P(?:34|35|36|37)-|-P34P35-|-P35P36-|-P36P37-/.test(item.object_id));
  assert.equal(p34P37Objects.length, 73, 'P34-P37 terminal set drift');
  assert.equal(p34P37Objects.filter((item) => item.counts_as_effect_object === true).length, 15, 'P34-P37 active terminal leaf set drift');
  assert.equal(p34P37Objects.filter((item) => item.fach_state === 'EXPLICIT_FACH_APPROVED').length, 10, 'P34-P37 explicit Fach set drift');
  assert.equal(p34P37Objects.filter((item) => item.fach_state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON').length, 5, 'P34-P37 exact RNAA set drift');
  assert.equal(p34P37Objects.filter((item) => item.fach_state === 'NON_EFFECT_CONTEXT_REVIEWED').length, 44, 'P34-P37 zero-count terminal set drift');
  assert.equal(p34P37Objects.filter((item) => item.fach_state === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED').length, 14, 'P34-P37 versioned parent/fragment set drift');
  const p34P37DeterministicTerminals = p34P37Objects.filter((item) => item.parent_object_ids);
  assert.equal(p34P37DeterministicTerminals.length, 4, 'P34-P37 deterministic terminal record set drift');
  const p34P37Open = bsw.remaining_review_objects.filter((item) => /-P(?:34|35|36|37)-/.test(item.object_id));
  assert.equal(p34P37Open.length, 19, 'P34-P37 exact child residual set drift');
  for (const child of [...p34P37DeterministicTerminals, ...p34P37Open]) {
    assert.ok(child.object_id.endsWith(child.source_text_sha256.slice(0, 12)), `${child.object_id}: P34-P37 ID/hash drift`);
    assert.equal(sha256(child.source_excerpt), child.source_text_sha256, `${child.object_id}: P34-P37 source hash drift`);
    assert.ok(child.parent_object_ids.every((id) => bsw.terminal_objects.some((item) => item.object_id === id && item.replacement_record_ids?.includes(child.object_id))), `${child.object_id}: P34-P37 reverse parent lineage drift`);
  }

  assert.deepEqual(
    matrix.known_segmentation_defects.map((item) => item.rejected_atom_id),
    ['BE-SPD-2026-SU-0136-A01', 'BE-SPD-2026-SU-0136-A03'],
  );
  for (const defect of matrix.known_segmentation_defects) {
    assert.equal(defect.counts_as_effect_object, false);
    assert.equal(defect.counts_as_fach_terminal, false);
    assert.ok(!allCurrentObjectIds.has(defect.rejected_atom_id), `${defect.rejected_atom_id}: malformed fragment remained current`);
  }

  const summary = matrix.summary;
  assert.equal(summary.verified_final_programmes, 12);
  assert.equal(summary.source_ready_programmes, 12);
  assert.equal(summary.programme_analysis_complete, 3);
  assert.deepEqual(summary.programme_analysis_complete_parties, TERMINAL_PROGRAMMES);
  assert.equal(summary.programme_analysis_open, 9);
  assert.equal(summary.genuine_fach_programmes, 9);
  assert.deepEqual(summary.genuine_fach_programme_parties, OPEN_PROGRAMMES);
  assert.equal(summary.remaining_genuine_fach_review_required, 1263);
  assert.equal(summary.remaining_review_scope_count, 1263);
  assert.equal(summary.remaining_page_review_envelopes, 1244);
  assert.equal(summary.remaining_exact_effect_objects_identified, 19);
  assert.equal(summary.remaining_exact_effect_object_count, null);
  assert.equal(summary.terminal_source_objects, 716);
  assert.deepEqual(summary.terminal_status_counts, terminalCounts);
  assert.equal(summary.known_segmentation_defects, 2);
  assert.equal(summary.berlin_completion_gate, 'FAIL_CLOSED_9_PROGRAMMES_REQUIRE_SOURCE_BOUND_FACH');
  assert.equal(terminalObjects, 716);
  assert.equal(remainingEnvelopes, 1244);
  assert.equal(remainingExactObjects, 19);

  if (verifyInputs) {
    const expected = buildBerlinFachTruthResidual();
    assert.equal(canonicalJson(matrix), canonicalJson(expected), 'Berlin Fach-truth matrix is not exact current input projection');
  }

  return {
    programmes_terminal: summary.programme_analysis_complete,
    programmes_open: summary.programme_analysis_open,
    terminal_source_objects: summary.terminal_source_objects,
    remaining_review_envelopes: summary.remaining_page_review_envelopes,
    remaining_exact_objects: summary.remaining_exact_effect_objects_identified,
    remaining_review_scopes: summary.remaining_review_scope_count,
    known_segmentation_defects: summary.known_segmentation_defects,
    descriptor_sha256: matrix.descriptor_sha256,
    gate: summary.berlin_completion_gate,
  };
}

function main() {
  process.stdout.write(`${JSON.stringify(validateBerlinFachTruthResidual(loadBerlinFachTruthResidual()), null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
