import test from 'node:test';
import assert from 'node:assert/strict';
import { crossLanguageSourceSupport } from '../../scripts/news/source-language-support.mjs';
import { sourceIntegrityForStory } from '../../scripts/news/source-integrity.mjs';

const source = { source_id: 'euronews', publisher_id: 'euronews', language: 'en', primary_source: false,
  url: 'https://www.euronews.com/2026/09/11/story', published_at: '2026-09-11T02:30:00Z',
  title: 'Israeli strike in Gaza kills family of four, including two children',
  summary: 'Hospital officials reported an Israeli strike in northern Gaza killed four people, including two children.' };
const story = { story_id: 'translation-fixture', title: 'Gaza: Vier Familienmitglieder bei Angriff in Beit Lahiya getötet',
  source_summary: 'Bei einem israelischen Angriff wurden laut Krankenhaus vier Menschen getötet, darunter zwei Kinder.',
  last_updated: '2026-09-11T03:00:00Z', sources: [source] };
const registry = { sources: [{ source_id: 'euronews', publisher_id: 'euronews', primary_source: false, url: 'https://www.euronews.com/' }] };

test('a translated event retains source identity and receives auditable lexical support', () => {
  const before = structuredClone({ source, story });
  const result = sourceIntegrityForStory(story, registry, [], story.last_updated);
  assert.equal(result.status, 'verified', JSON.stringify(result));
  assert.equal(result.checks[0].checks[0].semantic.translation_support.supported, true);
  assert.deepEqual({ source, story }, before);
});

test('one common place or topic does not establish translated source support', () => {
  for (const [title, source_summary] of [
    ['Gaza: Gespräche über eine Waffenruhe', 'Ein Treffen ist angekündigt.'],
    ['Gaza: Kinder und Familien im Krankenhaus', 'Eine geplante Impfkampagne wird vorgestellt.'],
    ['Vier Familienmitglieder bei Angriff getötet', 'Krankenhaus meldet getötete Kinder.'],
  ]) assert.equal(crossLanguageSourceSupport(source, { ...story, title, source_summary }).supported, false);
});

test('translation support requires known language and a bounded publication period', () => {
  for (const language of ['de', 'fr', undefined]) assert.equal(crossLanguageSourceSupport({ ...source, language }, story).supported, false);
  for (const last_updated of ['', 'invalid', '2026-09-15T03:00:00Z']) assert.equal(crossLanguageSourceSupport(source, { ...story, last_updated }).supported, false);
});

test('translation never overrides publisher, date or subject conflicts', () => {
  const wrongHost = sourceIntegrityForStory({ ...story, sources: [{ ...source, url: 'https://different.example/story' }] }, registry, [], story.last_updated);
  assert.ok(wrongHost.issues.some(x => x.code === 'SOURCE_PUBLISHER_URL_MISMATCH'));
  const future = sourceIntegrityForStory({ ...story, sources: [{ ...source, published_at: '2026-09-11T05:00:00Z' }] }, registry, [], story.last_updated);
  assert.ok(future.issues.some(x => x.code === 'SOURCE_PUBLICATION_DATE_INVALID'));
  const a = { ...source, title: 'Court ruling in Germany: Hamburg police investigate family deaths after attack', summary: '' };
  const b = { ...story, title: 'Hamburg: Französisches Gericht entscheidet über Strafverfolgung in Frankreich', source_summary: 'Die Polizei untersucht Todesfälle nach dem Angriff auf eine Familie.', sources: [a] };
  assert.equal(crossLanguageSourceSupport(a,b).supported, true);
  const conflict = sourceIntegrityForStory(b, registry, [], story.last_updated);
  assert.ok(conflict.issues.some(x => x.code === 'SOURCE_STORY_SUBJECT_CONFLICT'), JSON.stringify(conflict));
});

test('a second topic family works without a source- or place-specific rule', () => {
  const a = { ...source, title: 'Riverton railway flood: injured children taken to hospital', summary: '' };
  const b = { ...story, title: 'Riverton: Verletzte Kinder nach Hochwasser im Bahnverkehr', source_summary: 'Kinder wurden ins Krankenhaus gebracht.' };
  assert.equal(crossLanguageSourceSupport(a,b).supported, true);
});

test('an unpublished reviewed draft uses detection time and registered source language', () => {
  const draft = { ...story, last_updated: undefined, event_detected_at: story.last_updated,
    sources: [{ ...source, language: undefined }] };
  const registered = { sources: registry.sources.map(s => ({ ...s, language: 'en' })) };
  assert.equal(sourceIntegrityForStory(draft, registered, [], story.last_updated).status, 'verified');
});
