import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {renderDimensionMeters} from '../../scripts/news/visuals.mjs';
import {deriveImpactPresentation} from '../../scripts/news/impact-assessment.mjs';
import {observationContextFingerprint, projectReviewedObservationContext as project} from '../../scripts/news/observation-context.mjs';
import {syntheticPotentialAssessment, syntheticPotentialPath} from './fixtures/impact21.mjs';

test('a separately scoped observation remains readable outside the assessed dimensions', () => {
  const assessment = syntheticPotentialAssessment();
  assessment.observed_effects = [];
  assessment.source_context_observations = [{
    ...syntheticPotentialPath({direction: 'negative', magnitude: 4}),
    dimension: 'human', change: 'Ein belegter Schaden betrifft einen anderen synthetischen Vorgang.',
    mechanism: 'Ein anderer synthetischer Vorgang erklärt diesen berichteten Schaden.',
    reference_space: 'Ein anderer Ort im synthetischen Test.', temporal_status: 'ex_post',
    attribution: 'open', same_target: false, same_baseline: false,
  }];
  assessment.observation_context_correction = {
    at: '2026-10-27T02:53:00.000Z',
    note: 'Die Beobachtung gehört zum getrennten Quellenkontext, nicht zum bewerteten Gegenstand.',
  };
  const before = structuredClone(assessment);
  const html = renderDimensionMeters({impact_assessment: assessment}, {context: {privateImpactPreview: true}});
  assert.match(html, /data-impact-source-context/);
  assert.match(html, /Ein belegter Schaden betrifft einen anderen synthetischen Vorgang/);
  assert.match(html, /Darstellungskorrektur vom 27\.10\.2026/);
  assert.doesNotMatch(html, /wt-impact-additional--observed/);
  assert.equal((html.match(/class="wt-dim wt-dim--/g) || []).length, 3);
  assert.deepEqual(assessment, before);
});

function fixture() {
  const assessment = syntheticPotentialAssessment();
  assessment.observed_effects = [{
    ...syntheticPotentialPath({direction: 'negative', magnitude: 4}),
    dimension: 'human', change: 'Ein belegter Schaden betrifft einen anderen synthetischen Vorgang.',
    reference_space: 'Ein anderer Ort im synthetischen Test.', temporal_status: 'ex_post',
    attribution: 'open', same_target: true, same_baseline: true,
  }];
  const record = {story_id: 'wt-test-context', published: true, published_at: '2026-10-27T02:14:35.937Z',
    impact_assessment: assessment, versions: [{version: 1, assessment: structuredClone(assessment), provider: 'paid-original'}]};
  const reviewed = {story_id: record.story_id, published_at: record.published_at,
    target_label: assessment.evaluation_target.label, profile_sha256: observationContextFingerprint(assessment),
    observation_sha256: createHash('sha256').update(JSON.stringify(assessment.observed_effects[0])).digest('hex'),
    at: '2026-10-27T02:53:00.000Z', note: 'Ein dokumentierter anderer Vorgang bleibt als getrennter Quellenkontext erhalten.'};
  return {assessment, record, reviewed};
}

test('an audited context correction preserves paid data and the complete reported observation', () => {
  const {assessment, record, reviewed} = fixture(), before = structuredClone(record);
  const projected = project(record, assessment, reviewed);
  assert.notEqual(projected, assessment);
  assert.deepEqual(projected.observed_effects, []);
  assert.equal(projected.source_context_observations.length, 1);
  assert.deepEqual({...projected.source_context_observations[0], same_target: true, same_baseline: true}, assessment.observed_effects[0]);
  assert.deepEqual(projected.dimensions, assessment.dimensions, 'no potential, magnitude or protection boundary is reassessed');
  assert.deepEqual(record, before, 'the original assessment and paid history are immutable');
  const view = deriveImpactPresentation(projected);
  assert.deepEqual(view.dimensions.human.observations, []);
  assert.equal(view.dimensions.human.magnitude, assessment.dimensions.human.magnitude);
  assert.equal(view.source_context_observations[0].magnitude, 4);
  const compact = renderDimensionMeters({impact_assessment: projected}, {compact: true, context: {privateImpactPreview: true}});
  assert.doesNotMatch(compact, /anderen synthetischen Vorgang|wt-impact-additional--observed/);
  assert.ok((compact.match(/wt-impact-ring--potential/g) || []).length >= 3);
  assert.equal(project(projected, projected, reviewed), projected, 'an already projected DTO is stable');
});

test('changed editions, targets, observations or claims do not inherit an old editorial correction', () => {
  for (const change of [
    (r, a) => { r.story_id = 'another-story'; },
    (r, a) => { r.published_at = '2026-10-28T00:00:00Z'; },
    (r, a) => { r.published = false; },
    (r, a) => { r.manual_only = true; },
    (r, a) => { r.editorial_approval_hash = 'private-approval'; },
    (r, a) => { a.evaluation_target.label += ' geänderter Gegenstand'; },
    (r, a) => { a.baseline += ' veränderter Vergleich'; },
    (r, a) => { a.dimensions.human.magnitude = 2; },
    (r, a) => { a.observed_effects[0].change += ' geänderter Beleg'; },
    (r, a) => { a.observed_effects.push(structuredClone(a.observed_effects[0])); },
  ]) {
    const {record, assessment, reviewed} = fixture(); change(record, assessment);
    const before = structuredClone(record);
    assert.equal(project(record, assessment, reviewed), assessment);
    assert.deepEqual(record, before);
  }
});

test('public DTOs keep the same semantic binding without private review metadata', () => {
  const {record, assessment, reviewed} = fixture();
  const dto = {...structuredClone(assessment), review: {status: 'ready'}, research_check: {private: true}};
  const {review, research_check, ...publicDto} = dto;
  assert.equal(observationContextFingerprint(publicDto), reviewed.profile_sha256);
  assert.deepEqual(project({}, publicDto, reviewed).source_context_observations, project(record, assessment, reviewed).source_context_observations);
});

test('an unaudited cross-border observation remains an observed effect', () => {
  const {record, assessment} = fixture(), before = structuredClone(record);
  assessment.evaluation_target.label = 'Eine synthetische grenzüberschreitende Maßnahme';
  const unchanged = project(record, assessment);
  assert.equal(unchanged, assessment, 'a different reference space is not a geographic rejection rule');
  assert.equal(deriveImpactPresentation(unchanged).dimensions.human.ringStatus, 'observed');
  assert.deepEqual(record.versions, before.versions);
});
