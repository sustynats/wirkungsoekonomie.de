import assert from 'node:assert/strict';
import test from 'node:test';

import {
  loadMvFachTruthPending,
  validateMvFachTruthPending,
} from '../scripts/quality/check-mv-fach-truth-pending.mjs';

test('MV current gate rejects the former generic 12/12 terminal projection', () => {
  assert.deepEqual(validateMvFachTruthPending(loadMvFachTruthPending()), {
    source_classified_parties: 19,
    verified_final_programmes: 12,
    verified_final_programmes_currently_proven_fach_terminal: 0,
    verified_final_programmes_requiring_truthful_residual: 12,
    source_maturity_pending: 7,
    exact_remaining_effect_object_count: null,
    rejected_matrix_id: 'MV-FACH-CONTENT-RESIDUAL-2026-V2',
    rejected_matrix_disposition: 'REJECTED_FALSE_TERMINAL_HISTORICAL_EVIDENCE_ONLY',
    rejected_generic_rnaa_count: 7494,
    gate: 'FAIL_CLOSED_MV_FACH_TRUTH_REMEDIATION_REQUIRED_AFTER_BERLIN',
  });
});

test('MV current gate rejects a false source-maturity completion', () => {
  const state = loadMvFachTruthPending();
  state.register.coverage.final_election_programme_not_verified_count = 0;
  assert.throws(() => validateMvFachTruthPending(state), /source-register descriptor drift|Expected values to be strictly equal/);
});

test('MV current gate rejects drift in the historical false terminal claim', () => {
  const state = loadMvFachTruthPending();
  state.rejectedMatrix.summary.verified_final_programmes_terminal = 11;
  assert.throws(() => validateMvFachTruthPending(state), /rejected-matrix descriptor drift|Expected values to be strictly equal/);
});
