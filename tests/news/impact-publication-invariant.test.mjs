import test from 'node:test';
import assert from 'node:assert/strict';
import { derivePublicationStatus, SEMANTIC_CHECKS } from '../../scripts/news/impact-publication.mjs';
import { persistedImpactAssessmentErrors, assessmentBasis } from '../../scripts/news/migrate-impact-assessments.mjs';
import { publicImpactAssessment } from '../../scripts/news/impact-release.mjs';
import { highStory, validEditorial } from './fixtures/editorial-bridge.mjs';
import { editorialSourceRef } from '../../scripts/news/editorial-analysis.mjs';

const readyReview = () => ({
  status: 'ready',
  checks: Object.fromEntries(SEMANTIC_CHECKS.map(key => [key, {
    status: 'pass',
    rationale: 'Die synthetische Testgrundlage wurde im unabhängigen Prüfpass vollständig geprüft.',
  }])),
  findings: [],
});

function blankPlanetFixture() {
  const record = highStory('potential-publication-invariant');
  record.sources = record.sources.map(source => ({ ...source, source_id: editorialSourceRef(source) }));
  const assessment = structuredClone(validEditorial(record).impact_assessment);
  const sourceId = record.sources[0].source_id;
  assessment.dimensions.planet = {
    path_status: 'insufficient_basis',
    direction: 'open',
    magnitude: null,
    evidence: 'not_assessable',
    data_status: 'missing',
    temporal_status: 'ex_ante',
    likelihood: 'unknown',
    dominance: 'none',
    primary_paths: [],
    secondary_paths: [],
    balance: null,
    rationale: 'Die historische Prüfung hinterließ für diese Dimension eine dokumentierte Wissenslücke.',
    research_pass: 'second_pass',
    research_result: 'Die historische Prüfung modellierte trotz Quellenlektüre keinen belastbaren Pfad.',
    reviewed_source_ids: [sourceId],
  };
  return { record, assessment };
}

test('v2.1 publication defaults fail closed when any MPD potential magnitude is still blank', () => {
  const { record, assessment } = blankPlanetFixture();
  const result = derivePublicationStatus(assessment, record, {
    review: readyReview(),
    secondPassComplete: true,
  });

  assert.notEqual(result.status, 'ready');
  assert.ok(result.issues.includes('IMPACT_FRESH_MODELLED_DIMENSION_REQUIRED:planet'));
});

test('a persisted independently reviewed v2.1 record cannot claim ready while a potential bar is blank', () => {
  const { record, assessment } = blankPlanetFixture();
  assessment.publication_status = 'ready';
  record.impact_assessment = assessment;
  record.impact_semantic_review = { status: 'ready', review_job_id: 'synthetic-independent-review' };
  record.impact_assessment_basis = assessmentBasis(record);

  const errors = persistedImpactAssessmentErrors(record);
  assert.ok(errors.includes('IMPACT_FRESH_MODELLED_DIMENSION_REQUIRED:planet'));
  assert.equal(publicImpactAssessment(record), null);
});
