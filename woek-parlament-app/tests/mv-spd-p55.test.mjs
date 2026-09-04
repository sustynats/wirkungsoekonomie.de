import assert from 'node:assert/strict';
import test from 'node:test';
import { loadP55, validateP55 } from '../scripts/quality/check-mv-spd-p55.mjs';
import { buildP55, buildSpdResidual } from '../scripts/quality/materialize-mv-spd-p55.mjs';

test('P55 exactly materialises the corrected handoff, all source characters and nine RNAA leaves', () => {
  const result = validateP55(loadP55());
  assert.equal(result.source_units,13);
  assert.equal(result.generated_children,8);
  assert.equal(result.active_rnaa,9);
  assert.equal(result.zero_count_records,20);
  assert.equal(result.p55_residual,0);
  assert.deepEqual(buildP55(),buildP55());
});
test('P55 rejects wrong source binding, invented Fach, duplicate and parent counts', () => {
  for (const mutate of [
    state => {state.handoff.terminal_records[0].source_text='Falscher Text';},
    state => {state.handoff.terminal_records.find(row=>row.counts_as_effect_object).impact_direction='POSITIVE';},
    state => {state.handoff.terminal_records.push(state.handoff.terminal_records[0]);},
    state => {state.handoff.terminal_records.find(row=>row.superseded_by).counts_as_effect_object=true;},
    state => {state.handoff.terminal_records.find(row=>row.counts_as_effect_object).exact_reason='Generic missing evidence';},
  ]) {const state=loadP55();mutate(state);assert.throws(()=>validateP55(state));}
});
test('P55 cannot silently omit an exact-span child or revive a programme terminal', () => {
  const state=loadP55();
  state.handoff.terminal_records=state.handoff.terminal_records.filter(row=>row.object_id!=='MV-SPD-2026-SU-00517-C02-2dcc7c55fc11');
  assert.throws(()=>validateP55(state,{verifyDeterminism:false}),/Dangling lineage|Uncovered source/);
  const residual=buildSpdResidual(buildP55());
  assert.deepEqual(residual.summary.materialised_terminal_pages,[55]);
  assert.equal(residual.summary.protected_authored_pages_pending_technical_reconciliation.length,54);
  assert.equal(residual.summary.pages_without_current_terminal_proof.length,40);
  assert.equal(residual.summary.remaining_technical_page_envelopes.length,94);
  const falseComplete=loadP55();falseComplete.residual.summary.programme_terminal=true;
  assert.throws(()=>validateP55(falseComplete));
});
