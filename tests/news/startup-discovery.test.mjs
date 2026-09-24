import test from 'node:test';
import assert from 'node:assert/strict';
import { eventSignals, eventCategories, scoreEvent } from '../../scripts/news/event-relevance.mjs';

test('startup financing and operating milestones reach review, without claiming an outcome', () => {
  for (const title of [
    'Recycling-Start-up sichert 20 Millionen Euro Kapital für die Batterieaufbereitung',
    'Jungunternehmen hat Finanzierungsrunde über zehn Millionen Euro für Satelliten abgeschlossen',
    'Start-up nimmt Pilotanlage für Batterierecycling in Betrieb',
    'Startup startet Produktion von Medizinrobotern',
  ]) {
    const source = { title, summary: '', source_id: 'test', url: 'https://example.org/a', published_at: '2026-09-24T12:00:00Z' };
    assert.ok(eventSignals(source).signals.includes('startup_operating_milestone'), title);
    assert.ok(eventCategories([source]).includes('economy'), title);
    const score = scoreEvent({ sources: [source] }, '2026-09-24T13:00:00Z');
    assert.ok(score.total_relevance_score >= 30, title);
    assert.equal(score.score_scope, 'editorial_review_priority_not_truth_or_MPD_direction');
    assert.equal(score.planet, undefined);
  }
});

test('rankings, aspirations, speculation and discounts do not become startup milestones', () => {
  for (const title of [
    'Diese Start-ups könnten bald Milliarden wert sein',
    'Jungfirmen auf der Watchlist: Investoren lieben die Zukunft',
    'Start-up plant Pilotanlage für Recycling',
    'Startup will Produktion von Robotern starten',
    'Start-up könnte zehn Millionen Euro Finanzierung für Batterien erhalten',
    'Rabatt: Startup startet Produktion von Medizinrobotern',
    'Recycling-Start-up erhält einen Preis',
    'Startup hat keine Finanzierung über zehn Millionen Euro für Recycling erhalten',
    'Start-up nimmt Pilotanlage für Recycling nicht in Betrieb',
  ]) assert.ok(!eventSignals({ title }).signals.includes('startup_operating_milestone'), title);
});

test('review signal does not depend on publisher or company identity', () => {
  const signals = ['Alpha', 'Beta'].map(name => eventSignals({ title: `Start-up ${name} sichert zehn Millionen Kapital für Recycling`, publisher_id: name }).signals);
  assert.deepEqual(signals[0], signals[1]);
});
