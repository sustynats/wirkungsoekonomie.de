import assert from 'node:assert/strict';
import test from 'node:test';
import { load, validate } from '../scripts/quality/check-mv-afd-fach-review.mjs';
import { registerMvProseFullProgrammeReviewTests } from './mv-prose-full-programme-review-contract.mjs';

registerMvProseFullProgrammeReviewTests({ party: 'AfD', load, validate });
test('AfD: exact frozen coverage result remains stable', () => {
  assert.deepEqual(validate(load()), {
    party: 'AfD', artifact_sha256: '44087592fed7d8943d44019722def861947cf72acd203bf3b802deb6873ec8b0', reviewed_pages: 93,
    source_units: 854, effect_bearing_source_units: 342, non_effect_context_source_units: 512,
    multi_atom_source_units: 132, effect_atoms: 523, reviewed_not_assessable: 523,
    genuine_fach_review_required: 0, logical_descriptor_sha256: '03ce0e2d633bcc889b7fd02a5c134200a6cdb2c27c9893bda054252e950efeaa',
    hook_descriptor_sha256: '907eaaa57f1a494e141c3391dff95fa9d439a29dfeecce12270113ff40fc4f8a', gate: 'PASS_FULL_PROGRAMME_TERMINAL',
  });
});
