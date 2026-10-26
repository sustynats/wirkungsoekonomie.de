import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {applyReviewedKatzDenialClarification as apply, applyDocumentedKatzDenialClarification} from '../../scripts/news/clarify-katz-denial.mjs';
import {storyPage} from '../../scripts/news/build.mjs';
import {syntheticPotentialAssessment} from './fixtures/impact21.mjs';
import {capacityReview} from './fixtures/capacity-review.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
const at = '2026-10-26T11:00:00.000Z';
function fixture() {
  const paragraph = 'Der synthetische Testbericht beschreibt eine politische Aussage und ausdrücklich offene Einzelheiten. Er bestätigt weder tatsächliche Absichten noch eine eingetretene Wirkung. Der Quellenstand bleibt vorläufig und lässt keine weitergehenden Schlüsse zu. Diese Testbeschreibung ist keine neue Nachricht oder Wirkungsbewertung.';
  const source_summary = `Danach weist der israelische Verteidigungsminister Katz einen Bericht zurück, wonach Israel vor der Wahl keinen Angriff auf den Iran plane.\n\n${paragraph}\n\n${paragraph}`;
  const detail_summary = `Der Verteidigungsminister Katz weist laut den vorliegenden Berichten eine Darstellung zurück, wonach Israel vor der Wahl keinen Angriff auf den Iran plane. ${paragraph}`;
  const analysis = {story_id: 'wt-test-katz', summary: 'Eine synthetische Aussage betrifft öffentliche Information. Ihre möglichen Folgen bleiben offen.', detail_summary,
    why_relevant: 'Eine politische Aussage betrifft die öffentliche Einordnung.', status: 'offen', analysis_type: 'ex_ante', importance: 'mittel',
    impact_potential: 'Ein bedingter Informationspfad bleibt offen.', systemic_relevance: 'Keine systemische Änderung belegt.',
    transformation_potential: 'Keine strukturelle Änderung belegt.', resilience: 'Weitere Klärung bleibt möglich.',
    evidence_level: 'Ein synthetischer Quellenstand.', attribution: 'Keine unabhängige Bestätigung.',
    ...Object.fromEntries(['impact_risks', 'mechanisms', 'first_order', 'second_order', 'third_order', 'side_effects', 'uncertainties', 'watch_next', 'reference_frameworks'].map(k => [k, ['Eine synthetische Annahme bleibt zu prüfen.']])),
    impact_assessment: syntheticPotentialAssessment(), publication_recommendation: true,
    publication_gate: {news_value: 'new_evidence', materiality_factors: ['affected_scope', 'duration'], exceptional_factor: 'none',
      evidence_basis: 'attributed_single_source', duplicate_status: 'new_story', rationale: 'Ein begrenzter synthetischer Sachstand mit ausdrücklich benannten Grenzen.'}};
  const story = {story_id: 'wt-test-katz', title: 'Synthetische Aussage', slug: 'synthetische-aussage', published: true, listed: true,
    published_at: '2026-10-26T08:56:23.731Z', updated_at: '2026-10-26T08:56:23.731Z', last_updated: '2026-10-26T08:56:23.731Z',
    current_version: 1, content_hash: 'paid-content', source_summary, analysis, preanalysis: {filter_version: '4.1'},
    sources: [{source_id: 'official', publisher: 'Synthetische Quelle', url: 'https://official.example/story', title: 'Synthetische Quelle', summary: 'Die Testquelle nennt einen vorgegebenen Sachverhalt und dessen offene Einzelheiten.', content_hash: 'source-hash'}],
    claims: [{claim_id: 'c1', source_id: 'official', claim: 'Eine synthetische Aussage bleibt zugeschrieben.', status: 'single_source_claim'}],
    source_integrity: {status: 'verified', publication_status: 'eligible', checked_at: '2026-10-26T08:57:00Z', issue_codes: [], warning_codes: []},
    versions: [{version: 1, source_summary, analysis: structuredClone(analysis), provider: 'paid-original'}],
    original_potential_assessment: structuredClone(analysis.impact_assessment), impact_assessment: structuredClone(analysis.impact_assessment),
    paid_output_marker: {opaque: 'preserve'}, ai_retry: {retry_count: 1, fingerprint: 'paid'}};
  const reviewed = {story_id: story.story_id, version: 1, published_at: story.published_at, content_hash: story.content_hash,
    summary_sha256: hash(source_summary), ...Object.fromEntries(['analysis', 'sources', 'claims', 'versions'].map(key => [`${key}_sha256`, hash(JSON.stringify(story[key]))]))};
  return {story, reviewed};
}

test('only the two wrong referents change; every paid original, claim and assessment remains', () => {
  const {story, reviewed} = fixture(), original = structuredClone(story);
  const result = apply(story, reviewed, at); assert.equal(result.status, 'applied', JSON.stringify({reason: result.reason, issues: result.issues}));
  const r = result.record;
  assert.deepEqual(story, original, 'preflight never mutates the caller');
  assert.equal(r.current_version, 2); assert.equal(r.published_at, original.published_at);
  assert.match(r.source_summary, /erklärt Verteidigungsminister Katz, Israel plane/);
  assert.match(r.analysis.detail_summary, /Zurückweisung bezieht sich auf den Bericht über einen angeblichen Konflikt/);
  const restored = structuredClone(r.analysis); restored.detail_summary = original.analysis.detail_summary;
  assert.deepEqual(restored, original.analysis);
  for (const key of Object.keys(original)) {
    if (!['source_summary', 'analysis', 'current_version', 'updated_at', 'last_updated', 'versions'].includes(key)) assert.deepEqual(r[key], original[key], key);
  }
  assert.deepEqual(r.versions[0], original.versions[0]);
  assert.equal(r.versions[1].provider, null); assert.equal(r.versions[1].model, null);
  assert.match(r.corrections[0].note, /fälschlich/); assert.match(r.corrections[0].note, /Erstfassung bleibt/);
  const repeated = apply(r, reviewed, '2026-10-27T00:00:00Z');
  assert.equal(repeated.status, 'already_applied'); assert.deepEqual(repeated.record, r);
});

test('changed editions, sources, paid history, holds and source gates refuse the correction atomically', () => {
  for (const change of [
    s => s.current_version++, s => {s.source_summary += ' changed';}, s => {s.analysis.summary += ' changed';},
    s => {s.content_hash = 'new';}, s => {s.sources[0].content_hash = 'new';}, s => {s.claims[0].claim += ' changed';},
    s => {s.versions[0].provider = 'changed';}, s => {s.updated_at = at;}, s => {s.provider_request_hold = {};},
    s => {s.pending_update = {};}, s => {s.review_checkpoint = {};}, s => {s.manual_only = true;},
    s => {s.editorial_approval_hash = 'human';}, s => {s.listed = false;}, s => {s.retirement = {};},
    s => {s.source_integrity.warning_codes.push('OPEN');}, s => {s.source_integrity.checked_at = '2027-01-01T00:00:00Z';},
  ]) {
    const {story, reviewed} = fixture(); change(story); const before = structuredClone(story);
    assert.equal(apply(story, reviewed, at).status, 'held'); assert.deepEqual(story, before);
  }
  const {story, reviewed} = fixture();
  assert.equal(apply(story, reviewed, 'invalid').reason, 'CORRECTION_DATE_INVALID');
  assert.equal(apply(story, reviewed, '2026-10-25T00:00:00Z').status, 'held');
  assert.deepEqual(applyDocumentedKatzDenialClarification([story], at), [], 'synthetic reviews cannot enter the documented production mapping');
});

test('the rendered correction is visible and the first version remains in the reader history', () => {
  const {story, reviewed} = fixture(); const result = apply(story, reviewed, at);
  assert.equal(result.status, 'applied', JSON.stringify({reason: result.reason, issues: result.issues}));
  const {record} = result;
  const html = storyPage(record);
  assert.match(html, /Korrektur vom/); assert.match(html, /fälschlich/);
  assert.match(html, /katz|Katz/); assert.match(html, /Version 1/); assert.match(html, /Version 2/);
});

test('the local wording correction leaves an unchanged capacity review and paid assessment untouched', () => {
  const {story, reviewed} = fixture(); story.pending_update = capacityReview(story, at);
  const before = structuredClone(story);
  const result = apply(story, reviewed, at); assert.equal(result.status, 'applied');
  assert.deepEqual(result.record.pending_update, before.pending_update);
  assert.deepEqual(result.record.impact_assessment, before.impact_assessment);
  assert.deepEqual(result.record.versions[0], before.versions[0]);
});
