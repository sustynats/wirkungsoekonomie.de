import assert from 'node:assert/strict';
import test from 'node:test';

import {
  loadBerlinSpdReviewBundle,
  validateBerlinSpdReviewBundle,
} from '../scripts/quality/check-berlin-spd-fach-review.mjs';

test('Berlin SPD v4.1 ledger closes all 66 pages and all source-object terminals', () => {
  const summary = validateBerlinSpdReviewBundle(loadBerlinSpdReviewBundle());

  assert.deepEqual(summary, {
    artifact_sha256: '379f8cfe51309c2782c88a74ef06777d9ef0c07d7c256ddf1d9f361111e6ffc9',
    reviewed_pages: 66,
    source_units: 766,
    effect_bearing_source_units: 457,
    non_effect_context_source_units: 309,
    multi_atom_source_units: 332,
    effect_atoms: 1276,
    explicit_fach_approved: 0,
    reviewed_not_assessable: 1276,
    unterminated_effect_atoms: 0,
    logical_descriptor_sha256: 'cec984d14a19663535b13af55d6bd8ffe1c61ab664c09db43162f09a9bf42de6',
    hook_descriptor_sha256: 'f44b5e444ad9e6277f2960004ede6f4e8d1f1b7faf7fb77a23602ff0b2206720',
    gate: 'PASS',
  });
});

test('Berlin SPD ledger rejects a direction synthesized into an RNAA atom', () => {
  const bundle = loadBerlinSpdReviewBundle();
  bundle.effectAtoms[0].impact_direction = 'POSITIVE';

  assert.throws(
    () => validateBerlinSpdReviewBundle(bundle, { verifyLogicalDescriptor: false }),
    /forbidden synthesized impact_direction/,
  );
});

test('Berlin SPD ledger rejects a source-unit atom binding gap', () => {
  const bundle = loadBerlinSpdReviewBundle();
  const effectUnit = bundle.sourceUnits.find((unit) => unit.effect_bearing);
  effectUnit.atom_ids = effectUnit.atom_ids.slice(1);

  assert.throws(
    () => validateBerlinSpdReviewBundle(bundle, { verifyLogicalDescriptor: false }),
    /false == true|effect unit has no atoms|must be unique/,
  );
});
