import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { buildP24, sha256 } from '../scripts/quality/materialize-berlin-spd-p24.mjs';
import { validateP24 } from '../scripts/quality/check-berlin-spd-p24.mjs';

test('P24 covers every canonical source character with exact supplied Fach, lineage and zero-count roles', () => {
  const result = validateP24(buildP24());
  assert.equal(result.source_units, 10);
  assert.equal(result.original_atoms, 26);
  assert.equal(result.children, 32);
  assert.equal(result.terminal_records, 68);
  assert.equal(result.active_explicit, 16);
  assert.equal(result.active_rnaa, 20);
  assert.equal(result.zero_count, 32);
  assert.equal(result.remaining_p24_source_objects, 0);
  assert.deepEqual(buildP24(), buildP24());
});
test('P24 rejects stale source, reinterpreted Fach, missing children, double counting and unauthorized completion', () => {
  for (const mutate of [
    state => { state.terminal_records[0].source_text = 'Ein sauberes Berlin'; },
    state => { state.terminal_records.find(row => row.impact_direction).impact_direction = 'POSITIVE'; },
    state => { state.terminal_records.find(row => row.exact_reason).exact_reason = 'Missing evidence'; },
    state => { state.terminal_records.find(row => row.superseded_by).counts_as_effect_object = true; },
    state => { state.terminal_records.push(state.terminal_records[0]); },
    state => { state.terminal_records.pop(); },
    state => { state.grammar_separators = []; },
    state => { state.withdrawn_non_source_objects = []; },
    state => { state.coverage.cross_page_objects_consumed_once = []; },
    state => { state.constraints.programme_terminal_claimed = true; },
    state => { state.terminal_records.find(row => row.counts_as_effect_object).dns_mapping = ['SDG11']; },
  ]) {
    const state = buildP24(); mutate(state);
    assert.throws(() => validateP24(state));
  }
});
test('P24 retains lifecycle, distribution, evidence and falsification guards verbatim', () => {
  const state = buildP24();
  const electric = state.terminal_records.find(row => row.object_id === 'BE-SPD-2026-SU-0289-A01');
  assert.match(electric.authoritative_fach_text, /CONTINUATION_OF_INHERITED_IMPLEMENTATION/);
  const u3 = state.terminal_records.find(row => row.source_text_sha256 === 'd74226339accfab5c42df7d5b661d88e022a4e4bf1eeead9708f6c53efe5533d');
  assert.match(u3.authoritative_fach_text, /INHERITED_PROJECT_CONTINUATION/);
  assert.match(state.cross_object_guards_verbatim, /Falsification/);
  assert.match(state.cross_object_guards_verbatim, /Distribution/);
  assert.equal(state.withdrawn_non_source_objects.length, 6);
  assert.equal(state.coverage.unconsumed_successor_source_unit_ids[0], 'BE-SPD-2026-SU-0291');
});
test('P24 preserves protected P1–P23 and all other Berlin programmes byte-for-byte in the projection', () => {
  const matrix = JSON.parse(readFileSync('data/state-programmes/fach-content-residuals/berlin-2026-v3.json', 'utf8'));
  const hash = value => sha256(JSON.stringify(value));
  assert.equal(hash(matrix.programmes.filter(row => row.party !== 'SPD')), 'aebac94ba5b6fd510c65512fb49f5bc225d3e34e775a7ba55285643a7bd1842b');
  const protectedSpd = matrix.programmes.find(row => row.party === 'SPD').terminal_objects.filter(row => Number(row.object_id.match(/-SU-(\d+)/)?.[1]) <= 280);
  assert.equal(hash(protectedSpd), 'd608d4f07a6d6b2b9de84d74aff1ab94717df791e10ef57ab89e0e5866c00022');
});
