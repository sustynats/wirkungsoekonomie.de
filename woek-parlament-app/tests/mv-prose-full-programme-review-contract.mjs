import assert from 'node:assert/strict';
import test from 'node:test';

export function registerMvProseFullProgrammeReviewTests({ party, load, validate }) {
  test(`${party}: full programme closes every page and source object`, () => {
    const result = validate(load());
    assert.equal(result.gate, 'PASS_FULL_PROGRAMME_TERMINAL');
    assert.equal(result.genuine_fach_review_required, 0);
    assert.ok(result.source_units > 0);
    assert.ok(result.effect_atoms > 0);
    assert.ok(result.non_effect_context_source_units > 0);
  });

  test(`${party}: rejects synthesized impact direction`, () => {
    const bundle = structuredClone(load());
    bundle.effectAtoms[0].impact_direction = 'POSITIVE';
    assert.throws(() => validate(bundle, { verifyLogicalDescriptor: false }), /synthesized impact_direction/);
  });

  test(`${party}: rejects a source-unit atom binding gap`, () => {
    const bundle = structuredClone(load());
    const unit = bundle.sourceUnits.find((candidate) => candidate.atom_ids.length > 0);
    unit.atom_ids = unit.atom_ids.slice(1);
    assert.throws(() => validate(bundle, { verifyLogicalDescriptor: false }));
  });

  test(`${party}: rejects collapse or hiding of a multi-action source object`, () => {
    const bundle = structuredClone(load());
    const unit = bundle.sourceUnits.find((candidate) => candidate.atom_ids.length > 1);
    assert.ok(unit, `${party}: fixture needs a multi-action source object`);
    unit.effect_bearing = false;
    unit.classification = 'NON_EFFECT_CONTEXT';
    unit.terminal_status = 'NON_EFFECT_CONTEXT_REVIEWED';
    unit.atom_ids = [];
    assert.throws(() => validate(bundle, { verifyLogicalDescriptor: false }));
  });

  test(`${party}: rejects unreasoned context classification`, () => {
    const bundle = structuredClone(load());
    const unit = bundle.sourceUnits.find((candidate) => candidate.classification === 'NON_EFFECT_CONTEXT');
    unit.exact_reason = 'generic context';
    assert.throws(() => validate(bundle, { verifyLogicalDescriptor: false }));
  });
}
