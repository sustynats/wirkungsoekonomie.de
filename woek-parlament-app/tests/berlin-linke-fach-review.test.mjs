import assert from 'node:assert/strict';
import test from 'node:test';

import {
  loadBerlinLinkeReviewBundle,
  validateBerlinLinkeReviewBundle,
} from '../scripts/quality/check-berlin-linke-fach-review.mjs';

test('Berlin Die Linke full-programme ledger closes every object on all 336 physical pages', () => {
  assert.deepEqual(validateBerlinLinkeReviewBundle(loadBerlinLinkeReviewBundle()), {
    artifact_sha256: '70be401125217cac46a94d3b0b97b49bd332774342e54fb22a202043bd099c1f',
    reviewed_pages: 336,
    source_units: 1648,
    effect_bearing_source_units: 1244,
    non_effect_context_source_units: 404,
    multi_page_source_units: 176,
    multi_atom_source_units: 1088,
    effect_atoms: 5197,
    explicit_fach_approved: 0,
    reviewed_not_assessable: 5197,
    unterminated_effect_atoms: 0,
    logical_descriptor_sha256: 'ae6a0c6ab4210429e0d166fd545ec7a8d1f0b5a6641c1be0fd15c0f6ac922ce6',
    hook_descriptor_sha256: '459adf3a540ac10e69c63601101ad1348be8b2e6f5825caa9730c8eca17ec4be',
    gate: 'PASS',
  });
});

test('Berlin Die Linke ledger rejects a synthetic direction', () => {
  const bundle = loadBerlinLinkeReviewBundle();
  bundle.effectAtoms[0].impact_direction = 'POSITIVE';
  assert.throws(() => validateBerlinLinkeReviewBundle(bundle, { verifyLogicalDescriptor: false }), /forbidden synthesized impact_direction/);
});

test('Berlin Die Linke ledger rejects loss of a multi-action child binding', () => {
  const bundle = loadBerlinLinkeReviewBundle();
  const unit = bundle.sourceUnits.find((candidate) => candidate.atom_ids.length > 1);
  unit.atom_ids = unit.atom_ids.slice(1);
  assert.throws(() => validateBerlinLinkeReviewBundle(bundle, { verifyLogicalDescriptor: false }), /lost child binding|falsy value/);
});

test('Berlin Die Linke ledger rejects hiding programme text on a chapter start', () => {
  const bundle = loadBerlinLinkeReviewBundle();
  for (const unit of bundle.sourceUnits.filter((candidate) => candidate.pdf_pages.includes(14) && candidate.effect_bearing)) {
    unit.effect_bearing = false;
    unit.classification = 'NON_EFFECT_CONTEXT';
    unit.terminal_status = 'NON_EFFECT_CONTEXT_REVIEWED';
    unit.atom_ids = [];
    unit.exact_reason = `${unit.source_unit_id} mutation`;
  }
  assert.throws(() => validateBerlinLinkeReviewBundle(bundle, { verifyLogicalDescriptor: false }), /Expected values to be strictly equal|chapter-start programme content lost|lost child binding/);
});
