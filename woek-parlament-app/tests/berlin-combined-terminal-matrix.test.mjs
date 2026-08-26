import assert from 'node:assert/strict';
import test from 'node:test';

import {
  loadBerlinCombinedTerminalMatrix,
  validateBerlinCombinedTerminalMatrix,
} from '../scripts/quality/check-berlin-combined-terminal-matrix.mjs';

test('Berlin combined terminal matrix binds all twelve programmes with zero residual', () => {
  const summary = validateBerlinCombinedTerminalMatrix(loadBerlinCombinedTerminalMatrix());
  assert.deepEqual(summary, {
    programmes_terminal: 12,
    programmes_open: 0,
    pdf_pages_reviewed: 1293,
    html_programme_scopes_reviewed: 1,
    terminal_source_objects: 22334,
    explicit_fach_approved_or_reused: 78,
    reviewed_not_assessable: 19629,
    non_effect_context: 2627,
    genuine_fach_review_required: 0,
    unaccounted_programmes: 0,
    unaccounted_pages: 0,
    descriptor_sha256: 'c8c575cf2ae580773418662603774ced5dde4056e5a04aa33317194049833e7c',
    gate: 'PASS_12_OF_12_TERMINAL',
  });
});

test('Berlin combined terminal matrix rejects a dropped programme', () => {
  const matrix = loadBerlinCombinedTerminalMatrix();
  matrix.programmes.pop();
  assert.throws(
    () => validateBerlinCombinedTerminalMatrix(matrix, { verifyDescriptor: false, verifyInputs: false }),
    /Expected values to be strictly equal|twelve|12/,
  );
});

test('Berlin combined terminal matrix rejects a reopened Fach residual', () => {
  const matrix = loadBerlinCombinedTerminalMatrix();
  matrix.programmes[0].genuine_fach_review_required = 1;
  assert.throws(
    () => validateBerlinCombinedTerminalMatrix(matrix, { verifyDescriptor: false, verifyInputs: false }),
    /Expected values to be strictly equal/,
  );
});

test('Berlin combined terminal matrix rejects a drifted isolated-ledger hash pin', () => {
  const matrix = loadBerlinCombinedTerminalMatrix();
  const spd = matrix.programmes.find((programme) => programme.party === 'SPD');
  spd.coverage_evidence.ledger_manifest_file_sha256 = '0'.repeat(64);
  assert.throws(
    () => validateBerlinCombinedTerminalMatrix(matrix, { verifyDescriptor: false, verifyInputs: true }),
    /not the exact current ledger\/hook projection/,
  );
});

test('Berlin combined terminal matrix rejects new Fach semantics', () => {
  const matrix = loadBerlinCombinedTerminalMatrix();
  matrix.programmes[0].impact_direction = 'POSITIVE';
  assert.throws(
    () => validateBerlinCombinedTerminalMatrix(matrix, { verifyDescriptor: false, verifyInputs: false }),
    /forbidden Fach field impact_direction/,
  );
});

test('Berlin combined terminal matrix rejects a terminal-count inconsistency', () => {
  const matrix = loadBerlinCombinedTerminalMatrix();
  matrix.programmes[0].terminal_status_counts.REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON -= 1;
  assert.throws(
    () => validateBerlinCombinedTerminalMatrix(matrix, { verifyDescriptor: false, verifyInputs: false }),
    /terminal count mismatch/,
  );
});
