import assert from 'node:assert/strict';
import test from 'node:test';

import {
  loadBerlinVoltReviewBundle,
  validateBerlinVoltReviewBundle,
} from '../scripts/quality/check-berlin-volt-fach-review.mjs';

test('Berlin Volt full-programme ledger closes all 113 pages and source-object terminals', () => {
  const summary = validateBerlinVoltReviewBundle(loadBerlinVoltReviewBundle());
  assert.deepEqual(summary, {
    artifact_sha256: '515828c1e965b0ade7025941386a3c6a31a3e91c4fe54b4c0b47b39a4c2c3fb1',
    reviewed_pages: 113,
    source_units: 858,
    effect_bearing_source_units: 423,
    non_effect_context_source_units: 435,
    multi_atom_source_units: 331,
    effect_atoms: 1096,
    explicit_fach_approved: 0,
    reviewed_not_assessable: 1096,
    partial_explicit_fach_stock_overlap_atoms: 2,
    unterminated_effect_atoms: 0,
    logical_descriptor_sha256: '4c48b0c547c559b6e7402505939806f3de4f4fc134495151114b877434b573a9',
    hook_descriptor_sha256: '6b921b35e4f5d6a9f19ed114c307b3a19cee615de6099aa708a33392cb358974',
    gate: 'PASS',
  });
});

test('Berlin Volt ledger rejects a direction synthesized into an RNAA atom', () => {
  const bundle = loadBerlinVoltReviewBundle();
  bundle.effectAtoms[0].impact_direction = 'POSITIVE';
  assert.throws(
    () => validateBerlinVoltReviewBundle(bundle, { verifyLogicalDescriptor: false }),
    /forbidden synthesized impact_direction/,
  );
});

test('Berlin Volt ledger rejects a source-unit atom binding gap', () => {
  const bundle = loadBerlinVoltReviewBundle();
  const effectUnit = bundle.sourceUnits.find((unit) => unit.effect_bearing);
  effectUnit.atom_ids = effectUnit.atom_ids.slice(1);
  assert.throws(
    () => validateBerlinVoltReviewBundle(bundle, { verifyLogicalDescriptor: false }),
    /source-unit atom binding missing|effect unit has no atoms|must be unique/,
  );
});

test('Berlin Volt ledger rejects rewritten partial explicit Fach stock', () => {
  const bundle = loadBerlinVoltReviewBundle();
  const overlapAtom = bundle.effectAtoms.find((atom) => atom.existing_fach_stock_overlap);
  overlapAtom.existing_fach_stock_overlap.preserved_verbatim_fach.impact_potential = 'rewritten';
  assert.throws(
    () => validateBerlinVoltReviewBundle(bundle, { verifyLogicalDescriptor: false }),
    /partial explicit Fach stock was rewritten/,
  );
});
