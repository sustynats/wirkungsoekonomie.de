import assert from 'node:assert/strict';
import test from 'node:test';
import { loadBerlinTierschutzparteiReviewBundle, validateBerlinTierschutzparteiReviewBundle } from '../scripts/quality/check-berlin-tierschutzpartei-fach-review.mjs';

test('Berlin Tierschutzpartei terminal ledger accounts for all 96 pages and every effect atom', () => {
  assert.deepEqual(validateBerlinTierschutzparteiReviewBundle(loadBerlinTierschutzparteiReviewBundle()), {
    artifact_sha256: '1db89d9811e0d546c269c6ad6819603e12841b0d3f7f20f976444858d86cf172',
    reviewed_pages: 96, source_units: 642, effect_bearing_source_units: 580,
    non_effect_context_source_units: 62, multi_page_source_units: 52,
    multi_atom_source_units: 555, effect_atoms: 2389, explicit_fach_approved: 0,
    reviewed_not_assessable: 2389, genuine_fach_review_required: 0,
    unterminated_effect_atoms: 0,
    logical_descriptor_sha256: 'dd3cdf9e0bfbffbf498bf653140bd2fe4d3f14cfb20d8fd0d851a53d3250c8fc',
    hook_descriptor_sha256: 'dead1a33f5d903fcda41e2423d21305b36dab261ae619ff207dc27193757d8da', gate: 'PASS',
  });
});

test('Berlin Tierschutzpartei rejects a synthetic impact direction on RNAA', () => {
  const bundle = loadBerlinTierschutzparteiReviewBundle(); bundle.effectAtoms[0].impact_direction = 'POSITIVE';
  assert.throws(() => validateBerlinTierschutzparteiReviewBundle(bundle, { verifyDescriptors: false }), /forbidden synthesized impact_direction/u);
});

test('Berlin Tierschutzpartei rejects a lost child binding in a multi-action source unit', () => {
  const bundle = loadBerlinTierschutzparteiReviewBundle(); const unit = bundle.sourceUnits.find((candidate) => candidate.atom_ids.length > 1); unit.atom_ids = unit.atom_ids.slice(1);
  assert.throws(() => validateBerlinTierschutzparteiReviewBundle(bundle, { verifyDescriptors: false }), /lost parent binding|lost child binding/u);
});

test('Berlin Tierschutzpartei rejects a tampered shard hash', () => {
  const bundle = loadBerlinTierschutzparteiReviewBundle(); bundle.manifest.source_unit_shards[0].file_sha256 = '0'.repeat(64);
  assert.throws(() => validateBerlinTierschutzparteiReviewBundle(bundle), /manifest descriptor mismatch|logical descriptor mismatch/u);
});
