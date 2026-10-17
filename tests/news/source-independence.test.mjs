import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {sourceIndependenceTextErrors, validateNewsroomAnalysis} from '../../scripts/news/newsroom.mjs';
import {storyBriefing, repairFields} from '../../scripts/news/openai-transport.mjs';
import {shouldRetryQualityGate} from '../../scripts/news/run.mjs';
import {clarifySourceIndependence, applyReviewedSourceIndependenceClarification, applyDocumentedSourceIndependenceClarifications} from '../../scripts/news/clarify-source-independence.mjs';
import {syntheticPotentialAssessment} from './fixtures/impact21.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
const sources = ['official', 'paper'].map(id => ({source_id: id, publisher_id: id, publisher: id,
  url: `https://${id}.example/story`, title: 'Synthetischer Quellenbericht', summary: 'Ein Bericht nennt eine neue Regel und offene Einzelheiten.',
  content_hash: `source-${id}`, provenance: {origin: `publisher:${id}`, basis: 'publisher_only_origin_unverified', independence_established: false}}));
const code = 'SOURCE_INDEPENDENCE_NOT_ESTABLISHED';

test('possible publisher origins are never briefed as verified independent reporting', () => {
  const briefing = storyBriefing({sources});
  assert.match(briefing, /2 möglicherweise getrennte Herkunftsgruppen/);
  assert.match(briefing, /KEIN Nachweis/);
  assert.match(briefing, /Verlagszuordnung allein bleibt unverifiziert/);
  assert.doesNotMatch(briefing, /hat 2 voneinander unabhängige Herkünfte/);
});

test('reader-copy provenance assertions require two explicitly verified, distinct origins', () => {
  for (const text of ['Zwei voneinander unabhängige journalistische Quellen berichten über den Vorgang.',
    'Mehrere unabhängige Berichte bestätigen den Vorgang.', 'Die Quellen sind voneinander unabhängig.',
    'Nicht nur zwei unabhängige Quellen berichten darüber.']) {
    assert.deepEqual(sourceIndependenceTextErrors({source_summary: text}, sources), [code], text);
    assert.deepEqual(sourceIndependenceTextErrors({source_summary: text}, sources.map(s => ({...s, provenance: {...s.provenance, independence_established: true}}))), [], text);
  }
  const sameOrigin = sources.map(s => ({...s, provenance: {origin: 'agency:shared', independence_established: true}}));
  assert.deepEqual(sourceIndependenceTextErrors({summary: 'Zwei unabhängige Quellen berichten darüber.'}, sameOrigin), [code]);
});

test('local uncertainty, denials, unrelated independence and separate later assertions stay distinct', () => {
  for (const text of ['Keine unabhängigen Quellen bestätigen den Vorgang.',
    'Es gibt nicht zwei unabhängige Quellen.', 'Möglicherweise unabhängige Quellen müssen noch geprüft werden.',
    'Zwei unabhängige Quellen sind nicht nachgewiesen.',
    'Eine unabhängige Bestätigung liegt nicht vor.', 'Die Unabhängigkeit der Quellen ist unbekannt.',
    'Die unabhängige Justiz prüft den Vorfall.']) {
    assert.deepEqual(sourceIndependenceTextErrors({source_summary: text}, sources), [], text);
  }
  assert.deepEqual(sourceIndependenceTextErrors({source_summary: 'Keine unabhängigen Quellen bestätigen den ersten Punkt. Zwei unabhängige Berichte bestätigen aber den zweiten.'}, sources), [code]);
  assert.deepEqual(sourceIndependenceTextErrors({source_summary: 'Nicht bestätigt ist das Motiv, aber zwei unabhängige Quellen berichten über die Tat.'}, sources), [code]);
});

test('the normal new-output gate catches prose even when structured claims stay single-source', () => {
  const analysis = {news_status: 'preliminary', source_summary: 'Zwei voneinander unabhängige journalistische Quellen berichten darüber.',
    event_claims: [{claim: 'Ein Bericht nennt eine neue Regel.', status: 'single_source_claim', evidence: [{source_id: 'official', url: sources[0].url, excerpt: sources[0].summary}]}], followups: []};
  assert.deepEqual(validateNewsroomAnalysis(analysis, {sources}), [code]);
  assert.deepEqual(repairFields([code]), [], 'no additional paid format repair');
  assert.equal(shouldRetryQualityGate('QUALITY_GATE_FAILED', [code], 0), false, 'unchanged evidence is not scheduled for another paid attempt');
});

function correctionFixture() {
  const paragraph = 'Der synthetische Bericht beschreibt den Gegenstand und nennt ausdrücklich offene Einzelheiten zur Umsetzung. Weitere Angaben fehlen im gelieferten Material, weshalb weder zusätzliche Tatsachen noch gesicherte Folgen daraus abgeleitet werden. Die Beschreibung bleibt auf den dokumentierten Quellenstand begrenzt und setzt keine weitergehende Bestätigung voraus. Diese ausdrücklich synthetische Testbeschreibung beschreibt keine wirkliche Entscheidung oder Beobachtung.';
  const source_summary = `Zwei voneinander unabhängige journalistische Quellen berichten über einen synthetischen Vorgang. ${paragraph}\n\n${paragraph}`;
  const analysis = {story_id: 'wt-test', source_summary, summary: 'Die Quelle nennt neue Regeln. Deren mögliche Folgen sind noch offen.',
    detail_summary: Array(5).fill('Der synthetische Bericht beschreibt mögliche Änderungen und ausdrücklich offene Einzelheiten, ohne eine bereits eingetretene Wirkung zu behaupten.').join(' '),
    why_relevant: 'Mögliche Änderungen können den Zugang zu einer Funktion betreffen.', status: 'Entwurf', analysis_type: 'ex_ante', importance: 'hoch',
    impact_potential: 'Ein bedingter möglicher Zugang bleibt zu untersuchen.', systemic_relevance: 'Der beschriebene Referenzraum bleibt begrenzt.',
    transformation_potential: 'Eine strukturelle Änderung ist nicht nachgewiesen.', resilience: 'Rückfallmöglichkeiten bleiben offen.',
    evidence_level: 'Zwei Verlagsseiten, deren Herkunft nicht unabhängig verifiziert ist.', attribution: 'Ein Wirkungsbeitrag ist nicht nachgewiesen.',
    ...Object.fromEntries(['impact_risks', 'mechanisms', 'first_order', 'second_order', 'third_order', 'side_effects', 'uncertainties', 'watch_next', 'reference_frameworks'].map(k => [k, ['Eine synthetische Annahme bleibt zu prüfen.']])),
    impact_assessment: syntheticPotentialAssessment(), publication_recommendation: true,
    publication_gate: {news_value: 'new_evidence', materiality_factors: ['affected_scope', 'duration'], exceptional_factor: 'none',
      evidence_basis: 'attributed_single_source', duplicate_status: 'new_story', rationale: 'Ein neuer quellengebundener Sachstand mit ausdrücklich benannten Grenzen.'}};
  return {story_id: 'wt-test', title: 'Synthetischer Vorgang', slug: 'synthetischer-vorgang', published: true,
    published_at: '2026-10-17T22:03:00Z', updated_at: '2026-10-17T22:03:00Z', last_updated: '2026-10-17T22:03:00Z',
    current_version: 1, preanalysis: {filter_version: '4.1'}, sources: structuredClone(sources), source_summary, analysis,
    claims: [{claim_id: 'c1', source_id: 'official', claim: 'Ein synthetischer Quellenbericht.'}], content_hash: 'original-content-hash',
    original_potential_assessment: structuredClone(analysis.impact_assessment), impact_assessment: structuredClone(analysis.impact_assessment),
    versions: [{version: 1, source_summary, analysis: structuredClone(analysis), provider: 'paid-original'}]};
}

test('the explicit correction preserves the first edition, dates, sources and every assessment', () => {
  const original = correctionFixture(), before = JSON.stringify(original);
  // source_summary is stored separately in production.
  delete original.analysis.source_summary;
  const originalAnalysis = JSON.stringify(original.analysis);
  const options = {expectedSummaryHash: hash(original.source_summary), at: '2026-10-17T22:40:00Z'};
  const {record, unchanged} = clarifySourceIndependence(original, options);
  assert.equal(unchanged, false);
  assert.equal(record.current_version, 2);
  assert.equal(record.published_at, original.published_at);
  assert.equal(record.slug, original.slug);
  assert.equal(record.content_hash, original.content_hash);
  assert.deepEqual(record.sources, original.sources);
  assert.equal(JSON.stringify(record.analysis), originalAnalysis);
  assert.deepEqual(record.impact_assessment, original.impact_assessment);
  assert.deepEqual(record.original_potential_assessment, original.original_potential_assessment);
  assert.deepEqual(record.versions[0], original.versions[0]);
  assert.equal(record.versions[1].provider, null);
  assert.equal(record.versions[1].mode, 'source_provenance_clarification_no_generation');
  assert.match(record.corrections[0].note, /nicht nachgewiesen/);
  assert.equal(record.source_summary, original.source_summary.replace('Zwei voneinander unabhängige journalistische Quellen berichten', 'Zwei journalistische Quellen berichten'));
  assert.equal(clarifySourceIndependence(record, options).unchanged, true);
  const beforeObject = JSON.parse(before); delete beforeObject.analysis.source_summary;
  assert.deepEqual(original, beforeObject, 'the paid first edition is never modified');
  assert.throws(() => clarifySourceIndependence(original, {...options, expectedSummaryHash: '0'.repeat(64)}), /CORRECTION_INPUT_CHANGED/);
  assert.throws(() => clarifySourceIndependence({...original, manual_only: true}, options), /REGULAR_PUBLISHED_STORY_REQUIRED/);
});

test('normal-worker clarification requires every reviewed input and never retries changed editions', () => {
  const original = correctionFixture(); delete original.analysis.source_summary;
  const reviewed = {story_id: original.story_id, version: 1, content_hash: original.content_hash,
    summary_sha256: hash(original.source_summary), analysis_sha256: hash(JSON.stringify(original.analysis))};
  const at = '2026-10-17T22:40:00Z';
  const applied = applyReviewedSourceIndependenceClarification(original, reviewed, at);
  assert.equal(applied.status, 'applied');
  assert.equal(applied.record.current_version, 2);
  assert.equal(applyReviewedSourceIndependenceClarification(applied.record, reviewed, at).status, 'already_applied');
  for (const changed of [{...original, current_version: 2}, {...original, content_hash: 'changed'},
    {...original, analysis: {...original.analysis, summary: 'changed'}}, {...original, source_summary: 'changed'}]) {
    const result = applyReviewedSourceIndependenceClarification(changed, reviewed, at);
    assert.ok(['input_changed', 'held'].includes(result.status));
    assert.equal(result.record, changed);
  }
  const privateStory = {...original, manual_only: true};
  assert.equal(applyReviewedSourceIndependenceClarification(privateStory, reviewed, at).status, 'held');
  assert.equal(applyReviewedSourceIndependenceClarification({...original, story_id: 'different'}, reviewed, at).status, 'not_applicable');
  const unrelated = [original];
  assert.deepEqual(applyDocumentedSourceIndependenceClarifications(unrelated, at), []);
  assert.equal(unrelated[0], original);
  const staleKnown = [{...original, story_id: 'wt-d2fbe3584eaf2016'}];
  assert.equal(applyDocumentedSourceIndependenceClarifications(staleKnown, at)[0].status, 'input_changed');
  assert.equal(staleKnown[0].current_version, 1);
});
