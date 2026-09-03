import assert from 'node:assert/strict';
import test from 'node:test';
import { load, validate } from '../scripts/quality/check-mv-spd-fach-review.mjs';
import { registerMvProseFullProgrammeReviewTests } from './mv-prose-full-programme-review-contract.mjs';

registerMvProseFullProgrammeReviewTests({ party: 'SPD', load, validate });
test('SPD: exact frozen coverage result remains stable', () => {
  assert.deepEqual(validate(load()), {
    party: 'SPD', artifact_sha256: 'b2ed331e3bd89b93379df2f9a6adc5d3d10ddf635b0688673bc20c61cdca09bc', reviewed_pages: 95,
    source_units: 904, effect_bearing_source_units: 466, non_effect_context_source_units: 438,
    multi_atom_source_units: 223, effect_atoms: 832, reviewed_not_assessable: 832,
    genuine_fach_review_required: 0, logical_descriptor_sha256: 'c4932fbd3110b7e21f1d3e13f78e606f6b98635da1f7b527f812b77ba0641d48',
    hook_descriptor_sha256: '4331b48546873a6d3b8e3d1dda28d2d007dafb78f13960733e84cf238914d3a9', gate: 'PASS_FULL_PROGRAMME_TERMINAL',
  });
});
