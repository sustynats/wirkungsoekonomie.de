import assert from 'node:assert/strict';
import test from 'node:test';

import {
  loadBerlinCombinedTerminalMatrix,
  validateBerlinCombinedTerminalMatrix,
} from '../scripts/quality/check-berlin-combined-terminal-matrix.mjs';

test('legacy combined checker resolves to the current fail-closed v3 truth', () => {
  const matrix = loadBerlinCombinedTerminalMatrix();
  assert.equal(matrix.matrix_id, 'BE-FACH-CONTENT-RESIDUAL-2026-V3');
  assert.deepEqual(validateBerlinCombinedTerminalMatrix(matrix), {
    programmes_terminal: 3,
    programmes_open: 9,
    terminal_source_objects: 1376,
    remaining_review_envelopes: 1218,
    remaining_exact_objects: 0,
    remaining_review_scopes: 1218,
    known_segmentation_defects: 2,
    descriptor_sha256: matrix.descriptor_sha256,
    gate: 'FAIL_CLOSED_9_PROGRAMMES_REQUIRE_SOURCE_BOUND_FACH',
  });
});

test('legacy combined checker cannot accept a false terminal programme', () => {
  const matrix = loadBerlinCombinedTerminalMatrix();
  const bsw = matrix.programmes.find((programme) => programme.party === 'BSW');
  bsw.programme_analysis_complete = true;
  bsw.fach_state = 'PROGRAMME_ANALYSIS_COMPLETE';
  bsw.remaining_review_envelopes = [];
  bsw.remaining_review_envelope_count = 0;
  assert.throws(
    () => validateBerlinCombinedTerminalMatrix(matrix, { verifyDescriptor: false, verifyInputs: false }),
    /completion truth drift|open programme lost finite residual/,
  );
});

test('legacy combined checker rejects a dropped programme', () => {
  const matrix = loadBerlinCombinedTerminalMatrix();
  matrix.programmes.pop();
  assert.throws(
    () => validateBerlinCombinedTerminalMatrix(matrix, { verifyDescriptor: false, verifyInputs: false }),
    /Expected values to be strictly equal/,
  );
});
