import test from 'node:test';
import assert from 'node:assert/strict';
import { topLageEintrag } from '../../scripts/news/lage.mjs';
import { selectEditorialCandidates } from '../../scripts/news/redaktions-kandidaten.mjs';

// Natalie am 17.09.2026: „Zu den Top Lagen gibt es dann jeweils eine
// Meinung&Analyse." Anker ist der staerkste Eintrag der jüngsten Lage - nicht
// die neueste Meldung und nicht die mit den meisten Quellen.
test('der Anker ist der stärkste Eintrag der jüngsten Lage', () => {
  const store = { lagen: [
    { lage_id: '2026-09-17-mittagslage', slot: 'mittagslage', stand: '2026-09-17T10:00:00.000Z', entries: [
      { story_id: 'wt-schwach', score: 3.1, at: '2026-09-17T09:50:00Z' },
      { story_id: 'wt-stark', score: 9.4, at: '2026-09-17T06:10:00Z' },
    ] },
    { lage_id: '2026-09-17-morgenlage', slot: 'morgenlage', stand: '2026-09-17T04:00:00.000Z', entries: [
      { story_id: 'wt-alt', score: 11, at: '2026-09-16T20:00:00Z' },
    ] },
  ] };
  const top = topLageEintrag(store);
  assert.equal(top.story_id, 'wt-stark', 'die stärkste Meldung, nicht die neueste');
  assert.equal(top.lage_id, '2026-09-17-mittagslage', 'aus der jüngsten Lage, nicht aus der stärkeren älteren');
  assert.equal(top.score, 9.4);
  assert.equal(topLageEintrag({ lagen: [] }), null);
  assert.equal(topLageEintrag({ lagen: [{ lage_id: 'x', stand: '2026-09-17T10:00:00Z', entries: [] }] }), null);
  assert.equal(topLageEintrag(undefined), null);
});

const meldung = (id, { score = 90, gewinn = 70, at = '2026-09-17T08:00:00Z' } = {}) => ({
  story_id: id, slug: id, title: `Titel ${id}`, published: true, published_at: at, last_updated: at,
  analysis: { summary: 'x' }, sources: [{ url: 'https://example.org/a' }],
  _score: score, _gewinn: gewinn });

const bewerten = (story) => ({ candidate: true, evidence_gate: { passed: true },
  editorial_analysis_score: story._score, analysis_gain_score: story._gewinn });

test('nur der Anker wird vorgeschlagen, und nur wenn er die Schwellen trägt', () => {
  const stories = [meldung('wt-anker'), meldung('wt-anderer', { score: 99, gewinn: 99 })];
  // Ohne Einschränkung gewinnt der höhere Wert.
  assert.deepEqual(selectEditorialCandidates(stories, '2026-09-17T10:00:00Z', { assess: bewerten })
    .map((c) => c.story.story_id), ['wt-anderer']);
  // Mit Anker wird ausschließlich dieser vorgeschlagen.
  assert.deepEqual(selectEditorialCandidates(stories, '2026-09-17T10:00:00Z',
    { assess: bewerten, restrictTo: new Set(['wt-anker']) }).map((c) => c.story.story_id), ['wt-anker']);
  // Und ein Anker unter der Schwelle erzeugt keine Analyse - keine Quote.
  const schwach = [meldung('wt-schwach', { score: 40, gewinn: 10 })];
  assert.deepEqual(selectEditorialCandidates(schwach, '2026-09-17T10:00:00Z',
    { assess: bewerten, restrictTo: new Set(['wt-schwach']) }), []);
});
