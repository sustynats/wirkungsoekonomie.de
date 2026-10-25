import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyItem, preAnalyzeStory } from '../../scripts/news/lib.mjs';

const now = '2026-10-25T10:56:24.664Z';
const source = (title, summary) => ({
  source_id: 'synthetic-general-feed', publisher: 'Synthetic feed',
  publisher_id: 'synthetic-general-feed', source_type: 'media_rss',
  title, summary, source_topic: 'Politik', priority: 100,
  url: 'https://example.org/news', published_at: now,
});

test('ordinary Formula 1 results stay below the paid admission threshold in general news feeds', () => {
  for (const item of [
    source('Formel 1: Fahrer startet von der Pole Position beim Großen Preis der USA',
      'Es war eine klare Ansage: Der Fahrer hat das Qualifying für sich entschieden und kann Weltmeister werden.'),
    source('Formel-1: Pole-Position beim Rennen',
      'Es war ein enger Wettbewerb. Der Fahrer hat das Qualifying für sich entschieden.'),
    source('F1: Fahrer gewinnt das Qualifying',
      'Es war sein erstes Rennen in dieser Saison. Die Pole-Position ist entschieden.'),
    source('Formula One: driver wins qualifying at the United States Grand Prix',
      'The driver starts the race from pole position.'),
  ]) {
    const story = { story_id: 'synthetic-race', sources: [item],
      ai_retry: { fingerprint: 'retained-paid-input', retry_count: 1 },
      ai_retry_history: [{ fingerprint: 'retained-paid-input', retry_count: 1 }] };
    const before = structuredClone(story);
    assert.ok(classifyItem(item, item, now).score < 30, item.title);
    const result = preAnalyzeStory(story, now);
    assert.ok(result.internal_relevance_score < 30, item.title);
    assert.equal(result.event_score.priority, 'LOW');
    assert.deepEqual(story, before, 'source and paid attempt history remain unchanged');
  }
});

test('material policy, employment and acute safety events in motorsport remain reviewable', () => {
  for (const item of [
    source('Formel 1: Neue Emissionsregeln für den Grand Prix beschlossen',
      'Der Bundestag hat ein bundesweites Gesetz für Klimaschutz und Energieversorgung verabschiedet. Die Reform verändert die Infrastruktur.'),
    source('Formel 1: Rennstall schließt Werk nach dem Grand Prix',
      'Das Unternehmen legt den Standort still. Tausend Beschäftigte verlieren ihren Arbeitsplatz.'),
    source('Formel 1: Messerangriff beim Grand Prix',
      'Die Polizei sperrt den Bereich. Mehrere Menschen wurden verletzt.'),
  ]) {
    assert.ok(preAnalyzeStory({ story_id: 'synthetic-material', sources: [item] }, now)
      .internal_relevance_score >= 30, item.title);
  }
});

test('a numbered formula without a racing-result context is not a sports routine', () => {
  const item = source('Neue Studie: Formel 1 beschreibt die Energieversorgung',
    'Die Forschung untersucht Modelle der Infrastruktur und neue Daten zum Klimaschutz.');
  const result = classifyItem(item, item, now);
  assert.ok(!result.drivers.includes('standardmäßig geringe Relevanz'));
  assert.ok(result.score >= 30);
});
