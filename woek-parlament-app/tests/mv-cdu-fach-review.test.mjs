import assert from 'node:assert/strict';
import test from 'node:test';
import { load, validate } from '../scripts/quality/check-mv-cdu-fach-review.mjs';
import { registerMvProseFullProgrammeReviewTests } from './mv-prose-full-programme-review-contract.mjs';

registerMvProseFullProgrammeReviewTests({ party: 'CDU', load, validate });
test('CDU: exact frozen coverage result remains stable', () => {
  assert.deepEqual(validate(load()), {
    party: 'CDU', artifact_sha256: 'a33653bbe873666bf337522c51778e7b32a768e75d716b0e3483781d27a6c72e', reviewed_pages: 139,
    source_units: 1056, effect_bearing_source_units: 632, non_effect_context_source_units: 424,
    multi_atom_source_units: 268, effect_atoms: 1054, reviewed_not_assessable: 1054,
    genuine_fach_review_required: 0, logical_descriptor_sha256: '66df08f4536093c7c4a0f6819c351eed561d274843fa1e6af92c1f2fb7255398',
    hook_descriptor_sha256: '8c85264817e5bf176ef77a7f3965be7a7dbe9685d6ebd579bcc86982b1254e8b', gate: 'PASS_FULL_PROGRAMME_TERMINAL',
  });
});
