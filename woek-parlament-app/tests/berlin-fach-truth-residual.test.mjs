import assert from 'node:assert/strict';
import test from 'node:test';

import {
  loadBerlinFachTruthResidual,
  validateBerlinFachTruthResidual,
} from '../scripts/quality/check-berlin-fach-truth-residual.mjs';

test('Berlin Fach-truth residual preserves 4 terminal and exposes 8 open programmes', () => {
  assert.deepEqual(validateBerlinFachTruthResidual(loadBerlinFachTruthResidual()), {
    programmes_terminal: 4,
    programmes_open: 8,
    terminal_source_objects: 1442,
    remaining_review_envelopes: 1215,
    remaining_exact_objects: 0,
    remaining_review_scopes: 1215,
    known_segmentation_defects: 2,
    descriptor_sha256: '4e079f6aecc61ea332b6f43e198e6339578a15bd72b16bb29ddc44eaa224e775',
    gate: 'FAIL_CLOSED_8_PROGRAMMES_REQUIRE_SOURCE_BOUND_FACH',
  });
});

test('Berlin Fach-truth residual rejects a false 12/12 terminal claim', () => {
  const matrix = loadBerlinFachTruthResidual();
  matrix.summary.programme_analysis_complete = 12;
  matrix.summary.programme_analysis_open = 0;
  assert.throws(
    () => validateBerlinFachTruthResidual(matrix, { verifyDescriptor: false, verifyInputs: false }),
    /Expected values to be strictly equal/,
  );
});

test('Berlin Fach-truth residual rejects a generic RNAA page-envelope terminalization', () => {
  const matrix = loadBerlinFachTruthResidual();
  const spd = matrix.programmes.find((item) => item.party === 'SPD');
  spd.remaining_review_envelopes[0].fach_state = 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON';
  assert.throws(
    () => validateBerlinFachTruthResidual(matrix, { verifyDescriptor: false, verifyInputs: false }),
    /Expected values to be strictly equal/,
  );
});

test('Berlin Fach-truth residual rejects page envelopes represented as effect objects', () => {
  const matrix = loadBerlinFachTruthResidual();
  const cdu = matrix.programmes.find((item) => item.party === 'CDU');
  cdu.remaining_review_envelopes[0].counts_as_effect_object = true;
  assert.throws(
    () => validateBerlinFachTruthResidual(matrix, { verifyDescriptor: false, verifyInputs: false }),
    /Expected values to be strictly equal/,
  );
});

test('Berlin Fach-truth residual rejects reintroduced malformed SPD fragments', () => {
  const matrix = loadBerlinFachTruthResidual();
  const spd = matrix.programmes.find((item) => item.party === 'SPD');
  spd.terminal_objects.push({
    object_id: 'BE-SPD-2026-SU-0136-A01',
    source_state: 'SOURCE_BOUND_VERIFIED',
    segmentation_state: 'OBJECT_BOUNDARY_VERIFIED',
    fach_state: 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
    fach_handoff: 'https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5433805305',
  });
  spd.terminal_object_count += 1;
  assert.throws(
    () => validateBerlinFachTruthResidual(matrix, { verifyDescriptor: false, verifyInputs: false }),
    /malformed fragment remained current/,
  );
});
