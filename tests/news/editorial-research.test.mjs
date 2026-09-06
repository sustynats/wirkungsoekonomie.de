import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { editorialAnalysisAssessment, editorialAnalysisValidationErrors, editorialEvidenceGate, editorialResearchSourceErrors, editorialSources, withEditorialResearch, buildEditorialAnalysisPrompt, sanitizeEditorialAnalysis, editorialSourceRef } from '../../scripts/news/editorial-analysis.mjs';
import { buildAnalysisPrompt } from '../../scripts/news/lib.mjs';
import { MEDIA_PROMPT_RULES } from '../../scripts/news/media-impact.mjs';
import { SYSTEMIC_ANALYSIS_RULE } from '../../scripts/news/analysis-principles.mjs';
import { runEditorialAnalyses } from '../../scripts/news/run-editorial-analyses.mjs';
import { loadNewsRegistry } from '../../scripts/news/registry.mjs';
import { editorialAnalysisPage } from '../../scripts/news/build.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const read = relative => JSON.parse(fs.readFileSync(path.join(root, relative)));
const store = read('data/news/editorial-analyses.json');
const record = store.analyses.find(item => item.story_id === 'wt-995822cc0b71a7f8');
const story = read('data/news/stories.json').stories.find(item => item.story_id === record.story_id);
// Keep the single-event-source scenario stable if production later gains
// another report. Changed production material must be allowed to trigger work.
const base = () => ({ ...structuredClone(story), sources: structuredClone(story.sources.slice(0, 1)), source_integrity: { status: 'verified' } });
const research = () => structuredClone(record.source_snapshot.find(source => source.editorial_review));

test('MFR-Analyse besteht Inhaltsgate; SDGs, Kaskaden und Wissensgrenzen sind enthalten', () => {
  const subject = withEditorialResearch(base(), record);
  assert.deepEqual(editorialAnalysisValidationErrors(record, subject), []);
  const text = record.sections.flatMap(s => s.paragraphs).join(' ');
  for (const term of ['SDG 13.1', 'SDG 9.1', 'SDG 10.2', 'SDG 15', 'SDG 16.6', 'SDG 17.14', 'Kaskaden', 'Nichtkompensation', 'Reverse Merit Order', 'keine robuste Rangfolge', 'eNAP']) assert.ok(text.includes(term), term);
  assert.equal(record.editorial_review.empirical_effect_of_mfr_established, false);
});

test('Recherche erweitert nur die Analyse, nicht Ereignisbelege oder Cluster', () => {
  const original = base();
  const subject = withEditorialResearch(original, record);
  assert.equal(original.sources.length, 1);
  assert.equal(subject.sources, original.sources);
  assert.equal(subject.editorial_research_sources.length, 7);
  assert.equal(editorialSources(subject).length, 8);
  assert.equal(editorialEvidenceGate(original).passed, false);
  assert.equal(editorialEvidenceGate(subject).passed, true);
  assert.equal(editorialEvidenceGate(subject).independent_origin_count, 7, 'two Commission documents count once');
});

test('Falsche Zuordnung, URL, Domain, Datum oder veränderte Kurztexte halten die Recherche zurück', () => {
  const variants = [
    s => { s.url = 'https://unrelated.example/fake'; },
    s => { s.canonical_domain = 'different.example'; },
    s => { s.title = 'Anderer Artikel'; },
    s => { s.summary += ' unkontrollierter Zusatz'; },
    s => { s.editorial_review.story_id = 'other-story'; },
    s => { s.editorial_review.status = 'open'; },
    s => { s.published_at = '2999-01-01'; },
    s => { s.source_function = 'primary_evidence'; },
  ];
  for (const mutate of variants) {
    const source = research(); mutate(source);
    assert.ok(editorialResearchSourceErrors(source, story.story_id).length);
    const subject = withEditorialResearch(base(), { source_snapshot: [source] });
    assert.equal(editorialEvidenceGate(subject).passed, false);
    assert.equal(editorialSources(subject).length, 1);
  }
  assert.ok(editorialResearchSourceErrors(null, story.story_id).length);
});

test('Hintergrundrecherche kann ein offenes Ereignis-Integritätsgate nicht überschreiben', () => {
  const subject = withEditorialResearch({ ...base(), source_integrity: { status: 'open' } }, record);
  assert.equal(editorialEvidenceGate(subject).passed, false);
});

test('Unveränderte Recherche ist idempotent; neue geprüfte Inhalte ändern den Fingerabdruck', () => {
  const subject = withEditorialResearch(base(), record);
  const fingerprint = editorialAnalysisAssessment(subject).fingerprint;
  assert.equal(editorialAnalysisAssessment(withEditorialResearch(base(), structuredClone(record))).fingerprint, fingerprint);
  const changed = structuredClone(record);
  const source = changed.source_snapshot.find(s => s.editorial_review);
  source.summary += ' Neuer nachgeprüfter Kontext.';
  source.editorial_review.content_hash = crypto.createHash('sha256').update(source.summary).digest('hex');
  assert.notEqual(editorialAnalysisAssessment(withEditorialResearch(base(), changed)).fingerprint, fingerprint);
});

test('Systemische Grundregel gilt vor und rückwirkend für Meldung, Mediencheck und Deep Dive', () => {
  for (const prompt of [buildAnalysisPrompt([]), MEDIA_PROMPT_RULES.join('\n'), buildEditorialAnalysisPrompt(base(), editorialAnalysisAssessment(base()))]) {
    assert.ok(prompt.includes(SYSTEMIC_ANALYSIS_RULE));
    assert.ok(prompt.indexOf(SYSTEMIC_ANALYSIS_RULE) < prompt.lastIndexOf('UNTRUSTED_SOURCE_DATA'));
  }
});

test('Recherche bleibt untrusted und ist im Prompt nicht als Ereignisbestätigung ausgewiesen', () => {
  const subject = withEditorialResearch(base(), record);
  const prompt = buildEditorialAnalysisPrompt(subject, editorialAnalysisAssessment(subject));
  assert.ok(prompt.includes('keine zusätzlichen Bestätigungen des Ereignisses'));
  const start = prompt.indexOf('\nUNTRUSTED_SOURCE_DATA_BEGIN\n');
  const end = prompt.indexOf('\nUNTRUSTED_SOURCE_DATA_END');
  for (const source of subject.editorial_research_sources) {
    assert.ok(prompt.indexOf(source.summary, start) > start);
    assert.ok(prompt.indexOf(source.summary, start) < end);
  }
  assert.ok(prompt.includes('reference_framework'));
});

test('Quellenlinks pro Abschnitt und sichtbare Rollen bleiben erhalten', () => {
  const subject = withEditorialResearch(base(), record);
  const sanitized = sanitizeEditorialAnalysis(record, subject);
  assert.deepEqual(sanitized.sections[0].source_ids, record.sections[0].source_ids);
  const html = editorialAnalysisPage(record, story);
  for (const text of ['Quellen und Bezugsrahmen:', 'Ziel- und Referenzrahmen', 'Fachlicher Forschungsstand', 'Dokumentstand', 'Die Einordnung auf einen Blick']) assert.ok(html.includes(text), text);
  for (const section of record.sections) for (const id of section.source_ids || []) assert.ok(record.source_snapshot.some(s => s.source_id === id));
});

test('Produktiver Analyseworker überspringt unveränderte geprüfte Analyse ohne KI-Aufruf', async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-mfr-idempotence-'));
  fs.mkdirSync(path.join(temp, 'data/news'), { recursive: true });
  const subject = base();
  const unchanged = { ...record, source_fingerprint: editorialAnalysisAssessment(withEditorialResearch(subject, record)).fingerprint };
  fs.writeFileSync(path.join(temp, 'data/news/stories.json'), JSON.stringify({ stories: [subject] }));
  fs.writeFileSync(path.join(temp, 'data/news/editorial-analyses.json'), JSON.stringify({ ...store, analyses: [unchanged] }));
  let calls = 0;
  const report = await runEditorialAnalyses({ root: temp, registry: loadNewsRegistry(root), execute: true, build: () => {}, callAiImpl: async () => { calls++; throw new Error('No repeated paid generation'); } });
  assert.equal(calls, 0);
  assert.equal(report.ready_for_research, 0);
  assert.equal(report.candidates[0].status, 'published');
  assert.equal(editorialSourceRef(record.source_snapshot[1]), record.source_snapshot[1].source_id);
});
