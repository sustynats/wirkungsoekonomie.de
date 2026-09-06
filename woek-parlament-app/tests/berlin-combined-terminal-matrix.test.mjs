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
    programmes_terminal: 4,
    programmes_open: 8,
    terminal_source_objects: 1739,
    remaining_review_envelopes: 1189,
    remaining_exact_objects: 0,
    remaining_review_scopes: 1189,
    known_segmentation_defects: 2,
    descriptor_sha256: matrix.descriptor_sha256,
    gate: 'FAIL_CLOSED_8_PROGRAMMES_REQUIRE_SOURCE_BOUND_FACH',
  });
});

test('legacy combined checker cannot accept a false terminal programme', () => {
  const matrix = loadBerlinCombinedTerminalMatrix();
  const spd = matrix.programmes.find((programme) => programme.party === 'SPD');
  spd.programme_analysis_complete = true;
  spd.fach_state = 'PROGRAMME_ANALYSIS_COMPLETE';
  spd.remaining_review_envelopes = [];
  spd.remaining_review_envelope_count = 0;
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
