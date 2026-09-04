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
  assert.equal(matrix.base_main_commit, '1db5d993bd7149c3c09993bf346f66d6c587a7ee');
  assert.equal(matrix.status, 'BERLIN_FACH_TRUTH_REMEDIATION_OPEN_8_OF_12');
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
  assert.deepEqual(matrix.accepted_incremental_handoffs[10].issue_comment_ids, [5455206683, 5455231227, 5455273381, 5455310139]);
  assert.equal(matrix.accepted_incremental_handoffs[10].controller_issue_comment_id, 5458291078);
  assert.equal(matrix.accepted_incremental_handoffs[10].exact_terminal_object_count, 93);
  assert.equal(matrix.accepted_incremental_handoffs[10].active_terminal_review_leaf_count, 30);
  assert.equal(matrix.accepted_incremental_handoffs[10].exact_open_child_object_count, 38);
  assert.deepEqual(matrix.accepted_incremental_handoffs[10].physical_pdf_pages, [38, 39, 40, 41]);
  assert.equal(matrix.accepted_incremental_handoffs[10].gate, 'BE_BSW_P38_P41_CLEAN_RECORDS_TERMINAL_CHILD_FACH_PENDING');
  assert.deepEqual(matrix.accepted_incremental_handoffs[11].issue_comment_ids, [5458602710, 5458636824, 5458652090, 5458688301]);
  assert.equal(matrix.accepted_incremental_handoffs[11].controller_issue_comment_id, 5458695810);
  assert.equal(matrix.accepted_incremental_handoffs[11].exact_terminal_object_count, 74);
  assert.equal(matrix.accepted_incremental_handoffs[11].active_terminal_review_leaf_count, 29);
  assert.equal(matrix.accepted_incremental_handoffs[11].exact_open_child_object_count, 4);
  assert.deepEqual(matrix.accepted_incremental_handoffs[11].physical_pdf_pages, [42, 43, 44, 45]);
  assert.equal(matrix.accepted_incremental_handoffs[11].gate, 'BE_BSW_P42_P45_CLEAN_RECORDS_TERMINAL_CHILD_FACH_PENDING');
  assert.deepEqual(matrix.accepted_incremental_handoffs[12].issue_comment_ids, [5458773627, 5458802801, 5458817464, 5457760204]);
  assert.equal(matrix.accepted_incremental_handoffs[12].controller_issue_comment_id, 5458980983);
  assert.equal(matrix.accepted_incremental_handoffs[12].exact_terminal_object_count, 122);
  assert.equal(matrix.accepted_incremental_handoffs[12].active_terminal_review_leaf_count, 53);
  assert.equal(matrix.accepted_incremental_handoffs[12].exact_open_child_object_count, 0);
  assert.deepEqual(matrix.accepted_incremental_handoffs[12].physical_pdf_pages, [46, 47, 48, 49]);
  assert.equal(matrix.accepted_incremental_handoffs[12].gate, 'BE_BSW_P46_P49_FACH_COMPLETE_PASS_SOURCE_BOUND');
  assert.deepEqual(matrix.accepted_incremental_handoffs[13].issue_comment_ids, [5457793475, 5459288728, 5459304496, 5459330996]);
  assert.equal(matrix.accepted_incremental_handoffs[13].controller_issue_comment_id, 5459840094);
  assert.equal(matrix.accepted_incremental_handoffs[13].exact_terminal_object_count, 83);
  assert.equal(matrix.accepted_incremental_handoffs[13].active_terminal_review_leaf_count, 32);
  assert.equal(matrix.accepted_incremental_handoffs[13].exact_open_child_object_count, 0);
  assert.deepEqual(matrix.accepted_incremental_handoffs[13].physical_pdf_pages, [50, 51, 52, 53]);
  assert.equal(matrix.accepted_incremental_handoffs[13].consumed_cross_page_fragment, 'P54-U01 only; P54 page envelope remains open');
  assert.equal(matrix.accepted_incremental_handoffs[13].gate, 'BE_BSW_P50_P53_FACH_COMPLETE_PASS_SOURCE_BOUND');
  assert.deepEqual(matrix.accepted_incremental_handoffs[14].issue_comment_ids, [5457955882, 5457994484, 5458013046, 5458103067]);
  assert.equal(matrix.accepted_incremental_handoffs[14].controller_issue_comment_id, 5460142128);
  assert.equal(matrix.accepted_incremental_handoffs[14].exact_terminal_object_count, 86);
  assert.equal(matrix.accepted_incremental_handoffs[14].active_terminal_review_leaf_count, 30);
  assert.equal(matrix.accepted_incremental_handoffs[14].exact_open_child_object_count, 0);
  assert.deepEqual(matrix.accepted_incremental_handoffs[14].physical_pdf_pages, [54, 55, 56, 57]);
  assert.equal(matrix.accepted_incremental_handoffs[14].prior_cross_page_fragment, 'P54-U01 remains consumed by the P53-P54 record materialised in the prior handoff');
  assert.deepEqual(matrix.accepted_incremental_handoffs[14].unchanged_pre_reviewed_context, ['BE-BSW-P57-U10-51b2c038907b', 'BE-BSW-P57-U11-c69303be48ee']);
  assert.deepEqual(matrix.accepted_incremental_handoffs[14].gates, [
    'BE_BSW_P54_FACH_COMPLETE_PASS_SOURCE_BOUND_AFTER_PRIOR_P53_FRAGMENT_CONSUMPTION',
    'BE_BSW_P55_FACH_COMPLETE_PASS_SOURCE_BOUND_AFTER_U05_COMPOUND_REPAIR',
    'BE_BSW_P56_FACH_COMPLETE_PASS_SOURCE_BOUND_AFTER_U11_COMPOUND_AND_P57_FRAGMENT_REPAIRS',
    'BE_BSW_P57_FACH_COMPLETE_PASS_SOURCE_BOUND_AFTER_P56_FRAGMENT_AND_U09_A05_REPAIR',
  ]);
  assert.deepEqual(matrix.accepted_incremental_handoffs[15].issue_comment_ids, [5458180510, 5458279554]);
  assert.equal(matrix.accepted_incremental_handoffs[15].controller_issue_comment_id, 5460667812);
  assert.equal(matrix.accepted_incremental_handoffs[15].exact_terminal_object_count, 44);
  assert.equal(matrix.accepted_incremental_handoffs[15].active_terminal_review_leaf_count, 14);
  assert.equal(matrix.accepted_incremental_handoffs[15].exact_open_child_object_count, 0);
  assert.deepEqual(matrix.accepted_incremental_handoffs[15].physical_pdf_pages, [58, 59]);
  assert.deepEqual(matrix.accepted_incremental_handoffs[15].gates, [
    'BE_BSW_P58_FACH_COMPLETE_PASS_SOURCE_BOUND_AFTER_U05_A03_REPAIR',
    'BE_BSW_P59_FACH_COMPLETE_PASS_SOURCE_BOUND_AFTER_U02_A04_REPAIR',
  ]);
  assert.deepEqual(matrix.accepted_incremental_handoffs[16].issue_comment_ids, [5458289664, 5458936303, 5458947619, 5458958905, 5461127780]);
  assert.equal(matrix.accepted_incremental_handoffs[16].controller_issue_comment_id, 5475379459);
  assert.equal(matrix.accepted_incremental_handoffs[16].exact_terminal_object_count, 97);
  assert.equal(matrix.accepted_incremental_handoffs[16].active_terminal_review_leaf_count, 25);
  assert.equal(matrix.accepted_incremental_handoffs[16].exact_open_child_object_count, 0);
  assert.deepEqual(matrix.accepted_incremental_handoffs[16].physical_pdf_pages, [60, 61, 62, 63]);
  assert.deepEqual(matrix.accepted_incremental_handoffs[16].gates, [
    'BE_BSW_P60_FACH_COMPLETE_PASS_SOURCE_BOUND_ZERO_ACTIVE_EFFECT_LEAVES',
    'BE_BSW_P60_P61_OMITTED_SOURCE_UNITS_FACH_COMPLETE_PASS_SOURCE_BOUND_7_OF_7',
    'BE_BSW_P61_FACH_COMPLETE_PASS_SOURCE_BOUND_ZERO_APPROVED_EFFECT_LEAVES',
    'BE_BSW_P62_FACH_COMPLETE_PASS_SOURCE_BOUND_OBJECT_LEVEL',
    'BE_BSW_P63_FACH_COMPLETE_PASS_SOURCE_BOUND_OBJECT_LEVEL',
  ]);
  assert.deepEqual(matrix.accepted_incremental_handoffs[17].issue_comment_ids, [5458967059, 5458972339, 5458979583, 5476662964]);
  assert.equal(matrix.accepted_incremental_handoffs[17].controller_issue_comment_id, 5475379459);
  assert.equal(matrix.accepted_incremental_handoffs[17].exact_terminal_object_count, 66);
  assert.equal(matrix.accepted_incremental_handoffs[17].active_terminal_review_leaf_count, 18);
  assert.equal(matrix.accepted_incremental_handoffs[17].exact_open_child_object_count, 0);
  assert.deepEqual(matrix.accepted_incremental_handoffs[17].physical_pdf_pages, [64, 65, 66]);
  assert.deepEqual(matrix.accepted_incremental_handoffs[17].gates, [
    'BE_BSW_P64_P65_OMITTED_STRUCTURAL_HEADINGS_FACH_COMPLETE_PASS_SOURCE_BOUND_2_OF_2',
    'BE_BSW_P64_FACH_COMPLETE_PASS_SOURCE_BOUND_OBJECT_LEVEL',
    'BE_BSW_P65_FACH_COMPLETE_PASS_SOURCE_BOUND_ZERO_APPROVED_EFFECT_LEAVES',
    'BE_BSW_P66_FACH_COMPLETE_PASS_SOURCE_BOUND_OBJECT_LEVEL',
    'BE_BSW_FULL_PROGRAMME_FACH_HANDOFF_COMPLETE_PASS_SOURCE_BOUND_66_OF_66',
  ]);
  assert.deepEqual(matrix.accepted_incremental_handoffs[18].issue_comment_ids, [5459615745, 5459622938, 5459630827, 5459634420, 5459636289]);
  assert.equal(matrix.accepted_incremental_handoffs[18].controller_issue_comment_id, 5459840094);
  assert.equal(matrix.accepted_incremental_handoffs[18].exact_terminal_object_count, 61);
  assert.equal(matrix.accepted_incremental_handoffs[18].exact_open_child_object_count, 0);
  assert.deepEqual(matrix.accepted_incremental_handoffs[18].physical_pdf_pages, [34, 35, 36, 37, 38, 39, 40, 41, 42, 43]);
  assert.equal(matrix.accepted_incremental_handoffs[18].gate, 'BE_BSW_P34_P43_EXACT_CHILD_FACH_RESIDUAL_ZERO');
  assert.equal(matrix.accepted_incremental_handoffs.length, 21);
  assert.deepEqual(matrix.accepted_incremental_handoffs[19].issue_comment_ids, [5477750046, 5477758987, 5477766107, 5483568051]);
  assert.equal(matrix.accepted_incremental_handoffs[19].controller_issue_comment_id, 5483571711);
  assert.equal(matrix.accepted_incremental_handoffs[19].latest_controller_refresh_comment_id, 5518066353);
  assert.equal(matrix.accepted_incremental_handoffs[19].exact_terminal_object_count, 36);
  assert.equal(matrix.accepted_incremental_handoffs[19].active_terminal_review_leaf_count, 18);
  assert.equal(matrix.accepted_incremental_handoffs[19].exact_open_child_object_count, 0);
  assert.deepEqual(matrix.accepted_incremental_handoffs[19].physical_pdf_pages, [22]);
  assert.equal(matrix.accepted_incremental_handoffs[19].protected_physical_scope_after_materialization, 'P1-P22');
  assert.equal(matrix.accepted_incremental_handoffs[19].next_source_order_frontier, 'P23 / BE-SPD-2026-SU-0266+');
  assert.equal(matrix.accepted_incremental_handoffs[19].gate, 'BE_SPD_2026_P22_FACH_COMPLETE_PASS_SOURCE_BOUND_AFTER_CANONICAL_FINAL_LEDGER_REPAIR');
  assert.equal(matrix.accepted_incremental_handoffs.length, 21);
  assert.deepEqual(matrix.accepted_incremental_handoffs[20].issue_comment_ids, [5526873010]);
  assert.equal(matrix.accepted_incremental_handoffs[20].exact_terminal_object_count, 74);
  assert.equal(matrix.accepted_incremental_handoffs[20].active_terminal_review_leaf_count, 34);
  assert.equal(matrix.accepted_incremental_handoffs[20].exact_open_child_object_count, 0);
  assert.deepEqual(matrix.accepted_incremental_handoffs[20].physical_pdf_pages, [23]);
  assert.deepEqual(matrix.accepted_incremental_handoffs[20].cross_page_objects_consumed_once, ['BE-SPD-2026-SU-0280']);
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
  const rejectedMalformedObjectIds = new Set(matrix.known_segmentation_defects.map((item) => item.rejected_atom_id));
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
    assert.equal(programme.remaining_review_envelope_count, programme.remaining_review_envelopes.length);
    assert.equal(programme.remaining_exact_object_count, programme.remaining_review_objects.length);
    assert.equal(programme.remaining_review_scope_count, programme.remaining_review_envelope_count + programme.remaining_exact_object_count);
    if (shouldBeComplete) assert.equal(programme.remaining_review_scope_count, 0);
    else assert.ok(programme.remaining_review_scope_count > 0, `${programme.party}: open programme lost finite residual`);

    for (const object of programme.terminal_objects) {
      assert.ok(!rejectedMalformedObjectIds.has(object.object_id), `${object.object_id}: malformed fragment remained current`);
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
    assert.equal(programme.terminal_object_count, programme.terminal_objects.length);
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
  assert.equal(bsw.terminal_object_count, 1374);
  assert.deepEqual(bsw.terminal_status_counts, {
    EXPLICIT_FACH_APPROVED: 435,
    REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 134,
    NON_EFFECT_CONTEXT_REVIEWED: 671,
    SOURCE_UNIT_RECLASSIFIED_VERSIONED: 134,
  });
  assert.deepEqual(bsw.remaining_review_envelopes, []);
  assert.deepEqual(bsw.remaining_review_objects, []);
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

  const spd = matrix.programmes.find((item) => item.party === 'SPD');
  assert.equal(spd.terminal_object_count, 110);
  assert.deepEqual(spd.terminal_status_counts, {
    EXPLICIT_FACH_APPROVED: 16,
    REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 36,
    NON_EFFECT_CONTEXT_REVIEWED: 51,
    SOURCE_UNIT_RECLASSIFIED_VERSIONED: 7,
  });
  assert.equal(spd.remaining_review_envelope_count, 43);
  assert.equal(spd.remaining_exact_object_count, 0);
  assert.equal(spd.remaining_review_scope_count, 43);
  assert.deepEqual(
    spd.remaining_review_envelopes.map((item) => Number(item.source_locator.match(/PDF page (\d+)/)?.[1])),
    Array.from({ length: 43 }, (_, index) => index + 24),
    'SPD page-envelope residual must be exactly physical PDF pages 24-66',
  );
  assert.deepEqual(spd.protected_fach_scope.next_unreviewed_source_order_frontier, {
    physical_page: 24,
    source_unit_from: 'BE-SPD-2026-SU-0281',
  });
  const spdP22 = spd.terminal_objects.filter((item) => Number(item.object_id.match(/-SU-(\d+)/)?.[1]) <= 265);
  assert.equal(spdP22.length, 36, 'Protected P22 set must remain unchanged');
  const spdP23 = spd.terminal_objects.filter((item) => item.source_page === 23);
  assert.equal(spdP23.length, 74);
  assert.equal(spdP23.filter((item) => item.counts_as_effect_object).length, 34);
  assert.equal(spdP23.filter((item) => item.object_kind === 'DETERMINISTIC_SEGMENTATION_REPLACEMENT').length, 20);
  for (const item of spdP23) {
    assert.equal(sha256(item.source_excerpt), item.source_text_sha256);
    if (item.counts_as_effect_object) assert.equal(item.fach_state, 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON');
  }
  assert.equal(spdP22.filter((item) => item.counts_as_effect_object).length, 18);
  assert.equal(spdP22.filter((item) => item.object_kind === 'DETERMINISTIC_SEGMENTATION_REPLACEMENT').length, 5);
  assert.equal(spdP22.find((item) => item.object_id === 'BE-SPD-2026-SU-0249').fach_state, 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON');
  assert.equal(spdP22.find((item) => item.object_id === 'BE-SPD-2026-SU-0249').source_text_sha256, '10a6fd8fc5d67cdb2b35ca28152c496b4eb9c511940cd93a8bea2489de417090');
  assert.equal(spdP22.find((item) => item.object_id === 'BE-SPD-2026-SU-0265').source_text_sha256, 'd34e452e5f6a5dbb4dc2f9878aac0bafc242063dcb5670abb31c1fdc50a252a8');
  assert.equal(spdP22.find((item) => item.object_id === 'BE-SPD-2026-SU-0265-C02-f6f05f020690').fach_state, 'EXPLICIT_FACH_APPROVED');
  for (const child of spdP22.filter((item) => item.object_kind === 'DETERMINISTIC_SEGMENTATION_REPLACEMENT')) {
    assert.ok(child.object_id.endsWith(child.source_text_sha256.slice(0, 12)), `${child.object_id}: deterministic child ID/hash drift`);
    assert.ok(child.parent_object_ids.every((id) => spdP22.some((item) => item.object_id === id && item.counts_as_effect_object === false)));
  }
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
  assert.equal(p34P37Objects.length, 92, 'P34-P37 terminal set drift');
  assert.equal(p34P37Objects.filter((item) => item.counts_as_effect_object === true).length, 30, 'P34-P37 active terminal leaf set drift');
  assert.equal(p34P37Objects.filter((item) => item.fach_state === 'EXPLICIT_FACH_APPROVED').length, 23, 'P34-P37 explicit Fach set drift');
  assert.equal(p34P37Objects.filter((item) => item.fach_state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON').length, 7, 'P34-P37 exact RNAA set drift');
  assert.equal(p34P37Objects.filter((item) => item.fach_state === 'NON_EFFECT_CONTEXT_REVIEWED').length, 48, 'P34-P37 zero-count terminal set drift');
  assert.equal(p34P37Objects.filter((item) => item.fach_state === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED').length, 14, 'P34-P37 versioned parent/fragment set drift');
  const p34P37DeterministicTerminals = p34P37Objects.filter((item) => item.parent_object_ids);
  assert.equal(p34P37DeterministicTerminals.length, 23, 'P34-P37 deterministic terminal record set drift');
  const p34P37Open = bsw.remaining_review_objects.filter((item) => /-P(?:34|35|36|37)-/.test(item.object_id));
  assert.equal(p34P37Open.length, 0, 'P34-P37 exact child residual must be closed');
  for (const child of [...p34P37DeterministicTerminals, ...p34P37Open]) {
    assert.ok(child.object_id.endsWith(child.source_text_sha256.slice(0, 12)), `${child.object_id}: P34-P37 ID/hash drift`);
    assert.equal(sha256(child.source_excerpt), child.source_text_sha256, `${child.object_id}: P34-P37 source hash drift`);
    assert.ok(child.parent_object_ids.every((id) => bsw.terminal_objects.some((item) => item.object_id === id && item.replacement_record_ids?.includes(child.object_id))), `${child.object_id}: P34-P37 reverse parent lineage drift`);
  }

  const p38P41Objects = bsw.terminal_objects.filter((item) => /-P(?:38|39|40|41)-|-P38P39-/.test(item.object_id));
  assert.equal(p38P41Objects.length, 131, 'P38-P41 terminal set drift');
  assert.equal(p38P41Objects.filter((item) => item.counts_as_effect_object === true).length, 68, 'P38-P41 active terminal leaf set drift');
  assert.equal(p38P41Objects.filter((item) => item.fach_state === 'EXPLICIT_FACH_APPROVED').length, 47, 'P38-P41 explicit Fach set drift');
  assert.equal(p38P41Objects.filter((item) => item.fach_state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON').length, 21, 'P38-P41 exact RNAA set drift');
  assert.equal(p38P41Objects.filter((item) => item.fach_state === 'NON_EFFECT_CONTEXT_REVIEWED').length, 47, 'P38-P41 zero-count terminal set drift');
  assert.equal(p38P41Objects.filter((item) => item.fach_state === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED').length, 16, 'P38-P41 versioned parent/fragment set drift');
  const p38P41DeterministicTerminals = p38P41Objects.filter((item) => item.parent_object_ids);
  assert.equal(p38P41DeterministicTerminals.length, 40, 'P38-P41 deterministic terminal record set drift');
  const p38P41Open = bsw.remaining_review_objects.filter((item) => /-P(?:38|39|40|41)-/.test(item.object_id));
  assert.equal(p38P41Open.length, 0, 'P38-P41 exact child residual must be closed');
  for (const child of [...p38P41DeterministicTerminals, ...p38P41Open]) {
    assert.ok(child.object_id.endsWith(child.source_text_sha256.slice(0, 12)), `${child.object_id}: P38-P41 ID/hash drift`);
    assert.equal(sha256(child.source_excerpt), child.source_text_sha256, `${child.object_id}: P38-P41 source hash drift`);
    const parents = child.parent_object_ids.map((id) => bsw.terminal_objects.find((item) => item.object_id === id));
    assert.ok(parents.every(Boolean), `${child.object_id}: P38-P41 parent missing`);
    assert.ok(parents.every((parent) => parent.replacement_record_ids?.includes(child.object_id)), `${child.object_id}: P38-P41 reverse parent lineage drift`);
    const joined = parents.map((parent) => parent.source_excerpt).join(child.parent_joiner ?? '');
    const reconstructed = child.source_segments
      ? child.source_segments.map((span) => joined.slice(span.start, span.end)).join(child.source_segment_joiner)
      : joined.slice(child.source_span.start, child.source_span.end);
    assert.equal(reconstructed, child.source_excerpt, `${child.object_id}: P38-P41 exact span reconstruction drift`);
  }

  const p42P45Objects = bsw.terminal_objects.filter((item) => /-P(?:42|43|44|45)-/.test(item.object_id));
  assert.equal(p42P45Objects.length, 78, 'P42-P45 terminal set drift');
  assert.equal(p42P45Objects.filter((item) => item.counts_as_effect_object === true).length, 32, 'P42-P45 active terminal leaf set drift');
  assert.equal(p42P45Objects.filter((item) => item.fach_state === 'EXPLICIT_FACH_APPROVED').length, 22, 'P42-P45 explicit Fach set drift');
  assert.equal(p42P45Objects.filter((item) => item.fach_state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON').length, 10, 'P42-P45 exact RNAA set drift');
  assert.equal(p42P45Objects.filter((item) => item.fach_state === 'NON_EFFECT_CONTEXT_REVIEWED').length, 40, 'P42-P45 zero-count terminal set drift');
  assert.equal(p42P45Objects.filter((item) => item.fach_state === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED').length, 6, 'P42-P45 versioned parent set drift');
  const p42P45DeterministicTerminals = p42P45Objects.filter((item) => item.parent_object_ids);
  assert.equal(p42P45DeterministicTerminals.length, 12, 'P42-P45 deterministic terminal record set drift');
  const p42P45Open = bsw.remaining_review_objects.filter((item) => /-P(?:42|43)-/.test(item.object_id));
  assert.equal(p42P45Open.length, 0, 'P42-P43 exact child residual must be closed');
  for (const child of [...p42P45DeterministicTerminals, ...p42P45Open]) {
    assert.ok(child.object_id.endsWith(child.source_text_sha256.slice(0, 12)), `${child.object_id}: P42-P45 ID/hash drift`);
    assert.equal(sha256(child.source_excerpt), child.source_text_sha256, `${child.object_id}: P42-P45 source hash drift`);
    const parent = bsw.terminal_objects.find((item) => item.object_id === child.parent_object_ids[0]);
    assert.ok(parent, `${child.object_id}: P42-P45 parent missing`);
    assert.ok(parent.replacement_record_ids?.includes(child.object_id), `${child.object_id}: P42-P45 reverse parent lineage drift`);
    assert.equal(parent.source_excerpt.slice(child.source_span.start, child.source_span.end), child.source_excerpt, `${child.object_id}: P42-P45 exact span reconstruction drift`);
  }

  const p46P49Objects = bsw.terminal_objects.filter((item) => /-P(?:46|47|48|49)-|-P49P50-|-P50-U01-bb3d4390ad9a/.test(item.object_id));
  assert.equal(p46P49Objects.length, 122, 'P46-P49 terminal set drift');
  assert.equal(p46P49Objects.filter((item) => item.counts_as_effect_object === true).length, 53, 'P46-P49 active terminal leaf set drift');
  assert.equal(p46P49Objects.filter((item) => item.fach_state === 'EXPLICIT_FACH_APPROVED').length, 36, 'P46-P49 explicit Fach set drift');
  assert.equal(p46P49Objects.filter((item) => item.fach_state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON').length, 17, 'P46-P49 exact RNAA set drift');
  assert.equal(p46P49Objects.filter((item) => item.fach_state === 'NON_EFFECT_CONTEXT_REVIEWED').length, 51, 'P46-P49 zero-count terminal set drift');
  assert.equal(p46P49Objects.filter((item) => item.fach_state === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED').length, 18, 'P46-P49 versioned parent/fragment set drift');
  const p46P49Deterministic = p46P49Objects.filter((item) => item.parent_object_ids);
  assert.equal(p46P49Deterministic.length, 27, 'P46-P49 deterministic terminal set drift');
  for (const child of p46P49Deterministic) {
    assert.ok(child.object_id.endsWith(child.source_text_sha256.slice(0, 12)), `${child.object_id}: P46-P49 ID/hash drift`);
    assert.equal(sha256(child.source_excerpt), child.source_text_sha256, `${child.object_id}: P46-P49 source hash drift`);
    const parents = child.parent_object_ids.map((id) => bsw.terminal_objects.find((item) => item.object_id === id));
    assert.ok(parents.every(Boolean), `${child.object_id}: P46-P49 parent missing`);
    assert.ok(parents.every((parent) => parent.replacement_record_ids?.includes(child.object_id)), `${child.object_id}: P46-P49 reverse parent lineage drift`);
    if (child.reconstruction_mode === 'AUTHORITATIVE_ELLIPTICAL_LIST_EXPANSION') {
      assert.ok(child.source_segments?.length, `${child.object_id}: authoritative expansion segments missing`);
      for (const segment of child.source_segments) {
        const parent = bsw.terminal_objects.find((item) => item.object_id === segment.parent_object_id);
        assert.equal(parent.source_excerpt.slice(segment.start, segment.end), segment.source_text, `${child.object_id}: authoritative expansion source span drift`);
      }
    } else {
      const joined = parents.map((parent) => parent.source_excerpt).join(child.parent_joiner ?? '');
      assert.equal(joined.slice(child.source_span.start, child.source_span.end), child.source_excerpt, `${child.object_id}: P46-P49 exact reconstruction drift`);
    }
  }

  const p50P53Objects = bsw.terminal_objects.filter((item) => (
    item.object_id !== 'BE-BSW-P50-U01-bb3d4390ad9a'
    && /-P(?:50|51|52|53)-|-P53P54-|-P54-U01-a226a5a2869e/.test(item.object_id)
  ));
  assert.equal(p50P53Objects.length, 83, 'P50-P53 terminal set drift');
  assert.equal(p50P53Objects.filter((item) => item.counts_as_effect_object === true).length, 32, 'P50-P53 active terminal leaf set drift');
  assert.equal(p50P53Objects.filter((item) => item.fach_state === 'EXPLICIT_FACH_APPROVED').length, 24, 'P50-P53 explicit Fach set drift');
  assert.equal(p50P53Objects.filter((item) => item.fach_state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON').length, 8, 'P50-P53 exact RNAA set drift');
  assert.equal(p50P53Objects.filter((item) => item.fach_state === 'NON_EFFECT_CONTEXT_REVIEWED').length, 44, 'P50-P53 zero-count terminal set drift');
  assert.equal(p50P53Objects.filter((item) => item.fach_state === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED').length, 7, 'P50-P53 versioned parent/fragment set drift');
  const p50P53Deterministic = p50P53Objects.filter((item) => item.parent_object_ids);
  assert.equal(p50P53Deterministic.length, 14, 'P50-P53 deterministic terminal set drift');
  for (const child of p50P53Deterministic) {
    assert.ok(child.object_id.endsWith(child.source_text_sha256.slice(0, 12)), `${child.object_id}: P50-P53 ID/hash drift`);
    assert.equal(sha256(child.source_excerpt), child.source_text_sha256, `${child.object_id}: P50-P53 source hash drift`);
    const parents = child.parent_object_ids.map((id) => bsw.terminal_objects.find((item) => item.object_id === id));
    assert.ok(parents.every(Boolean), `${child.object_id}: P50-P53 parent missing`);
    assert.ok(parents.every((parent) => parent.replacement_record_ids?.includes(child.object_id)), `${child.object_id}: P50-P53 reverse parent lineage drift`);
    if (child.reconstruction_mode === 'AUTHORITATIVE_ELLIPTICAL_LIST_EXPANSION') {
      assert.ok(child.source_segments?.length, `${child.object_id}: P50-P53 authoritative expansion segments missing`);
      for (const segment of child.source_segments) {
        const parent = bsw.terminal_objects.find((item) => item.object_id === segment.parent_object_id);
        assert.equal(parent.source_excerpt.slice(segment.start, segment.end), segment.source_text, `${child.object_id}: P50-P53 expansion source span drift`);
      }
    } else {
      const joined = parents.map((parent) => parent.source_excerpt).join(child.parent_joiner ?? '');
      assert.equal(joined.slice(child.source_span.start, child.source_span.end), child.source_excerpt, `${child.object_id}: P50-P53 exact reconstruction drift`);
    }
  }

  const p54P57Objects = bsw.terminal_objects.filter((item) => (
    item.object_id !== 'BE-BSW-P54-U01-a226a5a2869e'
    && /-P(?:54|55|56|57)-|-P56P57-/.test(item.object_id)
  ));
  assert.equal(p54P57Objects.length, 86, 'P54-P57 terminal set drift');
  assert.equal(p54P57Objects.filter((item) => item.counts_as_effect_object === true).length, 30, 'P54-P57 active terminal leaf set drift');
  assert.equal(p54P57Objects.filter((item) => item.fach_state === 'EXPLICIT_FACH_APPROVED').length, 23, 'P54-P57 explicit Fach set drift');
  assert.equal(p54P57Objects.filter((item) => item.fach_state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON').length, 7, 'P54-P57 exact RNAA set drift');
  assert.equal(p54P57Objects.filter((item) => item.fach_state === 'NON_EFFECT_CONTEXT_REVIEWED').length, 51, 'P54-P57 zero-count terminal set drift');
  assert.equal(p54P57Objects.filter((item) => item.fach_state === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED').length, 5, 'P54-P57 versioned parent/fragment set drift');
  const p54P57Deterministic = p54P57Objects.filter((item) => item.parent_object_ids);
  assert.equal(p54P57Deterministic.length, 9, 'P54-P57 deterministic terminal set drift');
  for (const child of p54P57Deterministic) {
    assert.ok(child.object_id.endsWith(child.source_text_sha256.slice(0, 12)), `${child.object_id}: P54-P57 ID/hash drift`);
    assert.equal(sha256(child.source_excerpt), child.source_text_sha256, `${child.object_id}: P54-P57 source hash drift`);
    const parents = child.parent_object_ids.map((id) => bsw.terminal_objects.find((item) => item.object_id === id));
    assert.ok(parents.every(Boolean), `${child.object_id}: P54-P57 parent missing`);
    assert.ok(parents.every((parent) => parent.replacement_record_ids?.includes(child.object_id)), `${child.object_id}: P54-P57 reverse parent lineage drift`);
    const joined = parents.map((parent) => parent.source_excerpt).join(child.parent_joiner ?? '');
    assert.equal(joined.slice(child.source_span.start, child.source_span.end), child.source_excerpt, `${child.object_id}: P54-P57 exact reconstruction drift`);
  }

  const p58P59Objects = bsw.terminal_objects.filter((item) => /-P(?:58|59)-/.test(item.object_id));
  assert.equal(p58P59Objects.length, 44, 'P58-P59 terminal set drift');
  assert.equal(p58P59Objects.filter((item) => item.counts_as_effect_object === true).length, 14, 'P58-P59 active terminal leaf set drift');
  assert.equal(p58P59Objects.filter((item) => item.fach_state === 'EXPLICIT_FACH_APPROVED').length, 10, 'P58-P59 explicit Fach set drift');
  assert.equal(p58P59Objects.filter((item) => item.fach_state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON').length, 4, 'P58-P59 exact RNAA set drift');
  assert.equal(p58P59Objects.filter((item) => item.fach_state === 'NON_EFFECT_CONTEXT_REVIEWED').length, 28, 'P58-P59 zero-count terminal set drift');
  assert.equal(p58P59Objects.filter((item) => item.fach_state === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED').length, 2, 'P58-P59 versioned parent set drift');
  assert.equal(p58P59Objects.filter((item) => item.parent_object_ids).length, 4, 'P58-P59 deterministic terminal set drift');

  const p60P63Objects = bsw.terminal_objects.filter((item) => /-P(?:60|61|62|63)-|-P62P63-/.test(item.object_id));
  assert.equal(p60P63Objects.length, 97, 'P60-P63 terminal set drift');
  assert.equal(p60P63Objects.filter((item) => item.counts_as_effect_object === true).length, 25, 'P60-P63 active terminal leaf set drift');
  assert.equal(p60P63Objects.filter((item) => item.fach_state === 'EXPLICIT_FACH_APPROVED').length, 12, 'P60-P63 explicit Fach set drift');
  assert.equal(p60P63Objects.filter((item) => item.fach_state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON').length, 13, 'P60-P63 exact RNAA set drift');
  assert.equal(p60P63Objects.filter((item) => item.fach_state === 'NON_EFFECT_CONTEXT_REVIEWED').length, 67, 'P60-P63 zero-count terminal set drift');
  assert.equal(p60P63Objects.filter((item) => item.fach_state === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED').length, 5, 'P60-P63 versioned parent/fragment set drift');
  assert.equal(p60P63Objects.filter((item) => item.parent_object_ids).length, 5, 'P60-P63 deterministic terminal set drift');

  const p64P66Objects = bsw.terminal_objects.filter((item) => /-P(?:64|65|66)-/.test(item.object_id));
  assert.equal(p64P66Objects.length, 66, 'P64-P66 terminal set drift');
  assert.equal(p64P66Objects.filter((item) => item.counts_as_effect_object === true).length, 18, 'P64-P66 active terminal leaf set drift');
  assert.equal(p64P66Objects.filter((item) => item.fach_state === 'EXPLICIT_FACH_APPROVED').length, 12, 'P64-P66 explicit Fach set drift');
  assert.equal(p64P66Objects.filter((item) => item.fach_state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON').length, 6, 'P64-P66 exact RNAA set drift');
  assert.equal(p64P66Objects.filter((item) => item.fach_state === 'NON_EFFECT_CONTEXT_REVIEWED').length, 47, 'P64-P66 zero-count terminal set drift');
  assert.equal(p64P66Objects.filter((item) => item.fach_state === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED').length, 1, 'P64-P66 versioned parent set drift');
  assert.equal(p64P66Objects.filter((item) => item.parent_object_ids).length, 3, 'P64-P66 deterministic terminal set drift');

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
  assert.equal(summary.programme_analysis_complete, 4);
  assert.deepEqual(summary.programme_analysis_complete_parties, TERMINAL_PROGRAMMES);
  assert.equal(summary.programme_analysis_open, 8);
  assert.equal(summary.genuine_fach_programmes, 8);
  assert.deepEqual(summary.genuine_fach_programme_parties, OPEN_PROGRAMMES);
  assert.equal(summary.remaining_genuine_fach_review_required, 1192);
  assert.equal(summary.remaining_review_scope_count, 1192);
  assert.equal(summary.remaining_page_review_envelopes, 1192);
  assert.equal(summary.remaining_exact_effect_objects_identified, 0);
  assert.equal(summary.remaining_exact_effect_object_count, null);
  assert.equal(summary.terminal_source_objects, 1552);
  assert.deepEqual(summary.terminal_status_counts, terminalCounts);
  assert.equal(summary.known_segmentation_defects, 2);
  assert.equal(summary.berlin_completion_gate, 'FAIL_CLOSED_8_PROGRAMMES_REQUIRE_SOURCE_BOUND_FACH');
  assert.equal(terminalObjects, 1552);
  assert.equal(remainingEnvelopes, 1192);
  assert.equal(remainingExactObjects, 0);

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
