import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  loadMvCombinedTerminalMatrix,
  validateMvCombinedTerminalMatrix,
} from '../scripts/quality/check-mv-combined-terminal-matrix.mjs';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('MV combined matrix terminals all twelve verified programmes and preserves seven source blockers', () => {
  const summary = validateMvCombinedTerminalMatrix(loadMvCombinedTerminalMatrix());
  assert.deepEqual(summary, {
    verified_programmes_terminal: 12,
    source_maturity_blockers: 7,
    reviewed_pages: 896,
    source_units: 8712,
    effect_atoms: 7494,
    terminal_source_objects: 11395,
    genuine_fach_review_required: 0,
    descriptor_sha256: 'f5c0696f9e8c10ece572f26c7188cb97fa99f35a0ce7288d00960735e2523b71',
    verified_subcorpus_gate: 'PASS_12_OF_12_TERMINAL',
    full_field_gate: 'FAIL_CLOSED_7_SOURCE_MATURITY_BLOCKERS',
  });
});

test('MV combined matrix has an independent top-level Python validation gate', () => {
  const result = JSON.parse(execFileSync(
    'python3',
    ['scripts/quality/validate-mv-combined-terminal-matrix.py'],
    { cwd: APP_ROOT, encoding: 'utf8' },
  ));
  assert.equal(result.status, 'PASS');
  assert.equal(result.validator, 'PYTHON_TOP_LEVEL_INDEPENDENT_INPUT_BINDING');
  assert.equal(result.descriptor_sha256, 'f5c0696f9e8c10ece572f26c7188cb97fa99f35a0ce7288d00960735e2523b71');
});

test('MV combined matrix rejects a dropped verified programme', () => {
  const matrix = loadMvCombinedTerminalMatrix();
  matrix.programmes.pop();
  assert.throws(
    () => validateMvCombinedTerminalMatrix(matrix, { verifyDescriptor: false, verifyInputs: false }),
    /Expected values to be strictly equal|12/,
  );
});

test('MV combined matrix rejects a changed binding order', () => {
  const matrix = loadMvCombinedTerminalMatrix();
  [matrix.binding_order[0], matrix.binding_order[1]] = [matrix.binding_order[1], matrix.binding_order[0]];
  assert.throws(
    () => validateMvCombinedTerminalMatrix(matrix, { verifyDescriptor: false, verifyInputs: false }),
    /Expected values to be strictly deep-equal/,
  );
});

test('MV combined matrix rejects a reopened Fach residual', () => {
  const matrix = loadMvCombinedTerminalMatrix();
  matrix.programmes[0].counts.genuine_fach_review_required = 1;
  assert.throws(
    () => validateMvCombinedTerminalMatrix(matrix, { verifyDescriptor: false, verifyInputs: false }),
    /Expected values to be strictly equal/,
  );
});

test('MV combined matrix rejects a drifted isolated-ledger hash pin', () => {
  const matrix = loadMvCombinedTerminalMatrix();
  matrix.programmes[0].coverage_evidence.ledger_manifest_file_sha256 = '0'.repeat(64);
  assert.throws(
    () => validateMvCombinedTerminalMatrix(matrix, { verifyDescriptor: false, verifyInputs: true }),
    /not the exact current manifest\/shard\/hook projection/,
  );
});

test('MV combined matrix rejects new Fach semantics', () => {
  const matrix = loadMvCombinedTerminalMatrix();
  matrix.programmes[0].impact_direction = 'POSITIVE';
  assert.throws(
    () => validateMvCombinedTerminalMatrix(matrix, { verifyDescriptor: false, verifyInputs: false }),
    /forbidden Fach field impact_direction/,
  );
});

test('MV combined matrix rejects a terminal-count inconsistency', () => {
  const matrix = loadMvCombinedTerminalMatrix();
  matrix.programmes[0].counts.terminal_source_objects -= 1;
  assert.throws(
    () => validateMvCombinedTerminalMatrix(matrix, { verifyDescriptor: false, verifyInputs: false }),
    /Expected values to be strictly equal/,
  );
});

test('MV combined matrix rejects a dropped source-maturity blocker', () => {
  const matrix = loadMvCombinedTerminalMatrix();
  matrix.source_maturity_blockers.pop();
  assert.throws(
    () => validateMvCombinedTerminalMatrix(matrix, { verifyDescriptor: false, verifyInputs: false }),
    /Expected values to be strictly equal|7/,
  );
});

test('MV combined matrix rejects promotion of an unverified party', () => {
  const matrix = loadMvCombinedTerminalMatrix();
  matrix.source_maturity_blockers[0].exact_register_state.final_election_programme_verified = true;
  assert.throws(
    () => validateMvCombinedTerminalMatrix(matrix, { verifyDescriptor: false, verifyInputs: false }),
    /Expected values to be strictly deep-equal/,
  );
});

test('MV combined matrix rejects a false full-corpus completion claim', () => {
  const matrix = loadMvCombinedTerminalMatrix();
  matrix.completion_scope.admitted_party_field_fully_source_mature = true;
  assert.throws(
    () => validateMvCombinedTerminalMatrix(matrix, { verifyDescriptor: false, verifyInputs: false }),
    /Expected values to be strictly equal/,
  );
});
