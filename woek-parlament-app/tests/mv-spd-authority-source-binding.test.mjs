import assert from 'node:assert/strict';
import test from 'node:test';
import { assertExactSourceChild, sha256, sourceBindingWitness } from '../../tools/check_mv_spd_authority_source_binding.mjs';
import { validateReferenceInventory } from '../../tools/build_mv_spd_authority_reference_inventory.mjs';

test('every frozen P1–P54 source unit and atom is inventoried without crediting reference matches as Fach', () => {
  const result = validateReferenceInventory();
  assert.equal(result.source_units, 509);
  assert.equal(result.source_atoms, 456);
  assert.equal(result.gate, 'PASS_REFERENCE_INVENTORY_NOT_FACH_COMPLETION');
});

test('MV supplied child with its own correct hash is rejected if absent from its exact frozen parent', () => {
  const result = sourceBindingWitness();
  assert.equal(result.gate, 'PASS_SOURCE_BINDING_REPAIR_VERIFIED');
  assert.deepEqual(result.discrepancies.map(item => item.object_id), [
    'MV-SPD-2026-SU-00495-C02-b73986b3503e', 'MV-SPD-2026-SU-00496', 'MV-SPD-2026-SU-00499',
  ]);
  assert.equal(result.p1_p54_transaction_complete, false);
  assert.equal(result.p56_authorised, false);
  assert.equal(result.discrepancies.filter(item => item.requires_external_binding_delta).length, 1);
  assert.ok(result.discrepancies.every(item => item.terminal_fach_decision === null && item.substitute_fach_authored === false));
});

test('the later explicit P53 repair resolves the historical conflict without inventing a replacement decision', () => {
  const result = sourceBindingWitness();
  assert.equal(result.required_external_delta, null);
  assert.equal(result.repair_authority.comment_id, 5543580667);
  assert.equal(result.repaired_binding.object_id, 'MV-SPD-2026-SU-00495-C02-800fbf3fffa1');
  assert.equal(result.repaired_binding.terminal_fach_state, 'NON_EFFECT_SYSTEM_ROLE_AND_GOAL_FRAME_REVIEWED');
  assert.equal(result.repaired_binding.zero_count, true);
  assert.equal(result.p1_p54_transaction_complete, false);
});

test('source equality validates bytes only, never assigns Fach to the replacement text', () => {
  const parent = { source_text_normalized: 'exact source sentence', source_text_sha256: sha256('exact source sentence') };
  const child = { text: 'source sentence', sha256: sha256('source sentence') };
  assert.doesNotThrow(() => assertExactSourceChild(parent, child));
  assert.deepEqual(Object.keys(child), ['text', 'sha256']);
  assert.throws(() => assertExactSourceChild(parent, { ...child, text: 'other sentence' }), /SUPPLIED_CHILD_HASH_MISMATCH/);
  assert.throws(() => assertExactSourceChild({ ...parent, source_text_normalized: 'changed' }, child), /SOURCE_PARENT_HASH_MISMATCH/);
});
