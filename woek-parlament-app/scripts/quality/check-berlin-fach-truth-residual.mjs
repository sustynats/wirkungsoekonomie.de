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

  assert.equal(matrix.schema_version, 'woek-berlin-fach-content-residual-3.1');
  assert.equal(matrix.matrix_id, 'BE-FACH-CONTENT-RESIDUAL-2026-V3');
  assert.equal(matrix.base_main_commit, '1a0757682e8d2365eb28218816484c2e1e13d83e');
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
        assert.match(object.segmentation_state, /^(SEGMENTATION_SUPERSEDED_NONCOUNTING_(FRAGMENT|PARENT)|COMPOUND_EFFECT_PARENT_NONCOUNTING|OBJECT_BOUNDARY_VERIFIED)$/);
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
  assert.equal(bsw.terminal_object_count, 198);
  assert.deepEqual(bsw.terminal_status_counts, {
    EXPLICIT_FACH_APPROVED: 92,
    REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 14,
    NON_EFFECT_CONTEXT_REVIEWED: 78,
    SOURCE_UNIT_RECLASSIFIED_VERSIONED: 14,
  });
  assert.deepEqual(
    bsw.remaining_review_envelopes.map((item) => Number(item.source_locator.match(/PDF page (\d+)/)?.[1])),
    Array.from({ length: 47 }, (_, index) => index + 20),
    'BSW page-envelope residual must be exactly physical PDF pages 20-66',
  );
  assert.deepEqual(
    bsw.remaining_review_objects.map((item) => item.object_id),
    [
      'BE-BSW-P19-U01-A02-C01-992a21f6297f',
      'BE-BSW-P19-U01-A02-C02-31ad0fd27481',
      'BE-BSW-P19-U01-A02-C03-54c77aef7b53',
      'BE-BSW-P19-U01-A02-C04-616958496a0d',
      'BE-BSW-P19-U01-A02-C05-7088dc49b909',
      'BE-BSW-P19-U01-A02-C06-6796c889eec8',
      'BE-BSW-P19-U02-A01-C01-389fbaff19ac',
      'BE-BSW-P19-U02-A01-C02-cc9e28e20af3',
    ],
    'BSW P19 exact child residual drift',
  );

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
  assert.equal(summary.remaining_genuine_fach_review_required, 1270);
  assert.equal(summary.remaining_review_scope_count, 1270);
  assert.equal(summary.remaining_page_review_envelopes, 1262);
  assert.equal(summary.remaining_exact_effect_objects_identified, 8);
  assert.equal(summary.remaining_exact_effect_object_count, null);
  assert.equal(summary.terminal_source_objects, 266);
  assert.deepEqual(summary.terminal_status_counts, terminalCounts);
  assert.equal(summary.known_segmentation_defects, 2);
  assert.equal(summary.berlin_completion_gate, 'FAIL_CLOSED_9_PROGRAMMES_REQUIRE_SOURCE_BOUND_FACH');
  assert.equal(terminalObjects, 266);
  assert.equal(remainingEnvelopes, 1262);
  assert.equal(remainingExactObjects, 8);

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
