import assert from 'node:assert/strict';
import test from 'node:test';
import { load, validate } from '../scripts/quality/check-mv-linke-fach-review.mjs';
import { registerMvFullProgrammeReviewTests } from './mv-full-programme-review-contract.mjs';

registerMvFullProgrammeReviewTests({ party: 'Die Linke', load, validate });
test('Die Linke: exact frozen coverage result remains stable', () => {
  assert.deepEqual(validate(load()), {
    party: 'Die Linke', artifact_sha256: 'c26d2be501a05e820ed6761d75d0b2468ffbeb06859b967e3b8836129779fb6e', reviewed_pages: 30,
    source_units: 411, effect_bearing_source_units: 210, non_effect_context_source_units: 201,
    multi_atom_source_units: 137, effect_atoms: 777, reviewed_not_assessable: 777,
    genuine_fach_review_required: 0, logical_descriptor_sha256: '31e857d105e787cb61906141ab38b1081db24db655ae91dfcd903f2aa4fde219',
    hook_descriptor_sha256: 'fccdf9768f94a813c230c2b2288c7fe9153bdcf194dc188872a2fe5d6caa632d', gate: 'PASS_FULL_PROGRAMME_TERMINAL',
  });
});
