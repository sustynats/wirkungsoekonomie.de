import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { buildP23 } from '../scripts/quality/materialize-berlin-spd-p23.mjs';
import { validateP23 } from '../scripts/quality/check-berlin-spd-p23.mjs';

test('P23 binds the whole authoritative set, exact source characters and the cross-page unit once', () => {
  const result = validateP23(buildP23());
  assert.equal(result.source_units, 15);
  assert.equal(result.original_atoms, 39);
  assert.equal(result.children, 20);
  assert.equal(result.terminal_records, 74);
  assert.equal(result.active_rnaa, 34);
  assert.equal(result.zero_count, 40);
  assert.equal(result.remaining_p23_source_objects, 0);
  assert.deepEqual(buildP23(), buildP23());
});
test('P23 rejects wrong source, reason substitution, double counting, omitted children and invented Fach', () => {
  for (const mutate of [
    state => { state.terminal_records[0].source_text = 'Falscher Quelltext'; },
    state => { state.terminal_records.find(row => row.counts_as_effect_object).exact_reason = 'Generic missing evidence'; },
    state => { state.terminal_records.find(row => row.superseded_by).counts_as_effect_object = true; },
    state => { state.terminal_records.push(state.terminal_records[0]); },
    state => { state.terminal_records = state.terminal_records.filter(row => row.object_id !== 'BE-SPD-2026-SU-0273-C01-f625c4b03abb'); },
    state => { state.terminal_records.find(row => row.counts_as_effect_object).impact_direction = 'POSITIVE'; },
    state => { state.coverage.cross_page_objects_consumed_once = []; },
    state => { state.constraints.programme_terminal_claimed = true; },
  ]) {
    const state = buildP23();
    mutate(state);
    assert.throws(() => validateP23(state));
  }
});
test('P23 preserves the source-claim qualification and never turns continuation into a new effect', () => {
  const { terminal_records: records } = buildP23();
  const qualification = records.find(row => row.object_id === 'BE-SPD-2026-SU-0269-A01');
  assert.equal(qualification.counts_as_effect_object, false);
  assert.match(qualification.source_claim_qualification, /as a Union target/);
  for (const row of records.filter(row => row.terminal_fach_state.includes('CONTINUATION'))) assert.equal(row.counts_as_effect_object, false);
  assert.equal(records.filter(row => row.terminal_fach_state === 'EXPLICIT_FACH_APPROVED').length, 0);
});

test('P23 preserves all other Berlin programmes and the exact pre-existing SPD projection', () => {
  const matrix = JSON.parse(readFileSync('data/state-programmes/fach-content-residuals/berlin-2026-v3.json', 'utf8'));
  const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
  // Frozen directly from the fresh P55 merge/base 1db5d993, not calculated from new output.
  assert.equal(hash(matrix.programmes.filter(row => row.party !== 'SPD')), 'aebac94ba5b6fd510c65512fb49f5bc225d3e34e775a7ba55285643a7bd1842b');
  const protectedSpd = matrix.programmes.find(row => row.party === 'SPD').terminal_objects.filter(row => Number(row.object_id.match(/-SU-(\d+)/)?.[1]) <= 265);
  assert.equal(hash(protectedSpd), '07dd6dc959cac72fe3054f5a9cbcd5bdf226bc0660a01a757653c8af94a06403');
});
