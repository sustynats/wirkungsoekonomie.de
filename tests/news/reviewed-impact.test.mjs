import test from 'node:test';
import assert from 'node:assert/strict';
import { finalizeReviewedImpact } from '../../scripts/news/reviewed-impact.mjs';
import { sha256 } from '../../scripts/news/lib.mjs';
import { SEMANTIC_CHECKS } from '../../scripts/news/impact-publication.mjs';
import { publicImpactAssessment } from '../../scripts/news/impact-release.mjs';
import { syntheticPotentialAssessment, syntheticScopeReview } from './fixtures/impact21.mjs';

const now = '2026-09-14T20:00:00Z';
function fixture() {
  const assessment = syntheticPotentialAssessment();
  const packet = { story_id: 'test-correction', title: 'Synthetischer Prüfgegenstand', expected_content_hash: 'old-source', expected_analysis_hash: 'old-analysis', analysis: { impact_assessment: assessment } };
  const record = { story_id: packet.story_id, title: packet.title, analysis: structuredClone(packet.analysis), impact_assessment: structuredClone(assessment),
    sources: [{ source_id: 'official', title: 'Synthetischer Beleg' }], content_hash: sha256(JSON.stringify(packet)), versions: [{ version: 2 }], editorial_review: {}, published_at: '2026-09-10T00:00:00Z' };
  const receipt = { kind: 'independent_agent_semantic_review', story_id: packet.story_id, review_packet_hash: sha256(JSON.stringify(packet)),
    author_actor: 'test-author', reviewer_actor: 'test-reviewer', reviewed_at: now,
    expected_content_hash: packet.expected_content_hash, expected_analysis_hash: packet.expected_analysis_hash,
    review: { status: 'ready', scope: syntheticScopeReview(assessment), checks: Object.fromEntries(SEMANTIC_CHECKS.map(key => [key, { status: 'pass', rationale: 'Explizite unabhängige synthetische Prüfentscheidung.' }])) } };
  return { record, packet, receipt };
}
test('separate reviewed correction releases all three profiles and preserves original history/date', () => {
  const { record, packet, receipt } = fixture();
  const original = { published: true, published_at: record.published_at, original_potential_assessment: { assessment: 'original immutable forecast' }, observed_effects: [], impact_assessment: { original: true } };
  const saved = structuredClone(record);
  const corrected = finalizeReviewedImpact(record, packet, receipt, original, now);
  assert.deepEqual(record, saved);
  assert.deepEqual(corrected.original_potential_assessment, original.original_potential_assessment);
  assert.equal(corrected.current_potential_assessment.origin, 'retrospective_reassessment');
  assert.equal(corrected.published_at, record.published_at);
  assert.equal(corrected.impact_history.length, 1);
  const publicProfile = publicImpactAssessment(corrected);
  assert.ok(publicProfile);
  for (const dimension of Object.values(publicProfile.dimensions)) assert.equal(dimension.magnitude, 3);
});
test('writer self-approval, mismatched packet, parent or future review cannot release a correction', () => {
  const { record, packet, receipt } = fixture();
  for (const patch of [{ reviewer_actor: receipt.author_actor }, { review_packet_hash: 'wrong' }, { story_id: 'other' },
    { expected_analysis_hash: 'changed' }, { reviewed_at: '2027-01-01T00:00:00Z' }]) {
    assert.throws(() => finalizeReviewedImpact(record, packet, { ...receipt, ...patch }, null, now), /REVIEW_BINDING/);
  }
  assert.throws(() => finalizeReviewedImpact(record, { ...packet, title: 'A subsequent substantive change' }, receipt, null, now), /REVIEW_BINDING/);
});
test('blocked or incomplete independent checks never become public readiness', () => {
  const { record, packet, receipt } = fixture();
  receipt.review.checks.source_fidelity.status = 'fail';
  assert.throws(() => finalizeReviewedImpact(record, packet, receipt, null, now), /REVIEW_FAILED/);
  delete receipt.review.checks.source_fidelity;
  assert.throws(() => finalizeReviewedImpact(record, packet, receipt, null, now), /REVIEW_FAILED/);
});

test('fresh manual release needs the same independent target and baseline witness as the worker', () => {
  const {record,packet,receipt}=fixture();
  delete receipt.review.scope;
  assert.throws(()=>finalizeReviewedImpact(record,packet,receipt,null,now),/IMPACT_SCOPE_REQUIRED/);
});

test('a historical researched null cannot be freshly released even with every independent check marked pass', () => {
  const { record, packet, receipt } = fixture();
  packet.analysis.impact_assessment.dimensions.planet = {
    path_status: 'insufficient_basis', direction: 'open', magnitude: null,
    evidence: 'not_assessable', data_status: 'missing', temporal_status: 'ex_ante',
    likelihood: 'unknown', dominance: 'none', primary_paths: [], secondary_paths: [], balance: null,
    rationale: 'Die historische Prüfung hatte eine dokumentierte Wissenslücke hinterlassen.',
    research_pass: 'second_pass', research_result: 'Historische Recherche abgeschlossen, ohne damals einen Pfad zu modellieren.',
    reviewed_source_ids: ['official'],
  };
  record.analysis = structuredClone(packet.analysis);
  record.impact_assessment = structuredClone(packet.analysis.impact_assessment);
  record.content_hash = receipt.review_packet_hash = sha256(JSON.stringify(packet));
  assert.throws(() => finalizeReviewedImpact(record, packet, receipt, null, now), /IMPACT_FRESH_MODELLED_DIMENSION_REQUIRED:planet/);
});

test('a changed record cannot borrow the unchanged reviewed packet or release an unreviewed assessment', () => {
  const changes = [
    record => { record.impact_assessment.dimensions.human.rationale += ' Nachträglich geändert.'; },
    record => { record.analysis.impact_assessment.dimensions.human.rationale += ' Nachträglich geändert.'; },
    record => { record.impact_assessment.dimensions.human.rationale += ' In beiden Kopien geändert.'; record.analysis.impact_assessment = structuredClone(record.impact_assessment); },
    record => { record.content_hash = 'changed'; },
    record => { record.title = 'Eine nicht geprüfte neue Tatsachenbehauptung'; },
    record => { record.source_summary = 'Eine nachträglich veränderte Nachricht.'; },
  ];
  for (const change of changes) {
    const { record, packet, receipt } = fixture();
    const originalPacket = structuredClone(packet);
    change(record);
    assert.throws(() => finalizeReviewedImpact(record, packet, receipt, null, now), /REVIEW_BINDING/);
    assert.deepEqual(packet, originalPacket);
  }
});
test('invalid time, blank or whitespace-disguised self review and changed original date remain blocked', () => {
  const { record, packet, receipt } = fixture();
  for (const patch of [{ author_actor: ' ' }, { reviewer_actor: ' ' }, { author_actor: {} }, { reviewer_actor: ` ${receipt.author_actor} ` }]) {
    assert.throws(() => finalizeReviewedImpact(record, packet, { ...receipt, ...patch }, null, now), /REVIEW_BINDING/);
  }
  assert.throws(() => finalizeReviewedImpact(record, packet, receipt, null, 'invalid date'), /REVIEW_BINDING/);
  assert.throws(() => finalizeReviewedImpact(record, packet, receipt, { published_at: '2026-09-09T00:00:00Z' }, now), /REVIEW_BINDING/);
});
