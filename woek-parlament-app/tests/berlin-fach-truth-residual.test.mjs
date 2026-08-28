import assert from 'node:assert/strict';
import test from 'node:test';

import {
  loadBerlinFachTruthResidual,
  validateBerlinFachTruthResidual,
} from '../scripts/quality/check-berlin-fach-truth-residual.mjs';

test('Berlin Fach-truth residual preserves 3 terminal and exposes 9 open programmes', () => {
  assert.deepEqual(validateBerlinFachTruthResidual(loadBerlinFachTruthResidual()), {
    programmes_terminal: 3,
    programmes_open: 9,
    terminal_source_objects: 371,
    remaining_review_envelopes: 1258,
    remaining_exact_objects: 13,
    remaining_review_scopes: 1271,
    known_segmentation_defects: 2,
    descriptor_sha256: '166ba55c9e841ec5f3bf1b6f8ce293190382e716da74b9ef9d673a70e56e2e85',
    gate: 'FAIL_CLOSED_9_PROGRAMMES_REQUIRE_SOURCE_BOUND_FACH',
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
