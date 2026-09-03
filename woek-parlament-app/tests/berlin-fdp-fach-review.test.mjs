import assert from 'node:assert/strict';
import test from 'node:test';

import {
  loadBerlinFdpReviewBundle,
  validateBerlinFdpReviewBundle,
} from '../scripts/quality/check-berlin-fdp-fach-review.mjs';

test('Berlin FDP full-programme ledger closes every source object on all 121 physical pages', () => {
  assert.deepEqual(validateBerlinFdpReviewBundle(loadBerlinFdpReviewBundle()), {
    artifact_sha256: '3e3e1f5cac99864937d79e4d7c9c0bda4a03a71868ba1f25d8bf918766223f32',
    reviewed_pages: 121,
    source_units: 763,
    effect_bearing_source_units: 672,
    non_effect_context_source_units: 91,
    multi_page_source_units: 45,
    multi_atom_source_units: 445,
    effect_atoms: 1706,
    explicit_fach_approved: 0,
    reviewed_not_assessable: 1706,
    unterminated_effect_atoms: 0,
    logical_descriptor_sha256: '2cf2b4baa3c7250ec7faa6c2e7e9e1378697addfa350c7a6997547a1e24b1e51',
    hook_descriptor_sha256: 'fbbbc7f48b0733e5cdb33d3cbe4e3d4fb3b774da525951c9fec01b2b034ef5c8',
    gate: 'PASS',
  });
});

test('Berlin FDP ledger rejects a synthetic direction on an RNAA atom', () => {
  const bundle = loadBerlinFdpReviewBundle();
  bundle.effectAtoms[0].impact_direction = 'POSITIVE';
  assert.throws(
    () => validateBerlinFdpReviewBundle(bundle, { verifyLogicalDescriptor: false }),
    /forbidden synthesized impact_direction/,
  );
});

test('Berlin FDP ledger rejects a lost child binding from a multi-action source unit', () => {
  const bundle = loadBerlinFdpReviewBundle();
  const unit = bundle.sourceUnits.find((candidate) => candidate.atom_ids.length > 1);
  unit.atom_ids = unit.atom_ids.slice(1);
  assert.throws(
    () => validateBerlinFdpReviewBundle(bundle, { verifyLogicalDescriptor: false }),
    /falsy value|orphan atom|atom bindings/,
  );
});
