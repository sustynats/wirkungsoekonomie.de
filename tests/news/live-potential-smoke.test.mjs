import test from 'node:test';
import assert from 'node:assert/strict';
import { completePotential, renderedPotentialErrors } from '../../scripts/news/live-potential-smoke.mjs';

const record = () => ({
  published: true,
  listed: true,
  impact_semantic_review: { status: 'ready', review_job_id: 'review-1' },
  impact_assessment: {
    version: '2.1',
    publication_status: 'ready',
    dimensions: Object.fromEntries(['human','planet','democracy'].map(key => [key, {
      path_status: 'modelled', magnitude: 2, primary_paths: [{label:`${key} path`}],
    }])),
  },
});

test('completePotential requires modelled numeric MPD paths', () => {
  const good = record();
  assert.equal(completePotential(good), true);
  const blank = record();
  Object.assign(blank.impact_assessment.dimensions.planet, {path_status:'insufficient_basis',magnitude:null,primary_paths:[]});
  assert.equal(completePotential(blank), false);
});

test('renderedPotentialErrors rejects dashed/open historical profiles and accepts three numeric bars', () => {
  const good = '<span data-magnitude="2"></span><span data-magnitude="3"></span><span data-magnitude="1"></span>';
  assert.deepEqual(renderedPotentialErrors(good), []);
  const blank = '<div data-path-status="insufficient_basis"><span data-magnitude="open"></span></div>';
  const errors = renderedPotentialErrors(blank, 'card');
  assert.ok(errors.includes('card:NUMERIC_POTENTIAL_BARS_MISSING'));
  assert.ok(errors.includes('card:HISTORICAL_NULL_PROFILE_RENDERED'));
  assert.ok(errors.includes('card:OPEN_MAGNITUDE_RENDERED'));
});
