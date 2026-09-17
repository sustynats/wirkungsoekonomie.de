import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { impactContextPromptRule, impactContextRequirements, POWER_TRIGGER, POWER_TRIGGER_WORDS, ENERGY_TRIGGER } from '../../scripts/news/impact-publication.mjs';
import { buildAnalysisPrompt, claimLedgerFor, preAnalyzeStory } from '../../scripts/news/lib.mjs';
import { detectMediaImpactTrigger } from '../../scripts/news/media-impact.mjs';
import { expandPacketTransport } from '../../scripts/news/evidence-packets.mjs';

// Gemessen am 17.09.2026 aus data/news/usage.json: 11 von 15 Nachbesserungen
// waren fehlende Pflichtteile der Wirkungsbewertung, zweimal genau der
// Machtpfad. Jede Nachbesserung ist ein zweiter bezahlter Aufruf.
test('die Pflichtteile stehen im Auftrag, wenn die Meldung sie verlangt', () => {
  const machtfrage = { title: 'Sondierung zur Regierungsbildung', sources: [{ title: 'Koalition', summary: 'Duldung geprüft' }] };
  const regel = impactContextPromptRule(machtfrage);
  assert.match(regel, /dimensions\.democracy/);
  assert.match(regel, /system_check\.enablement/);
  assert.match(regel, /wird die Antwort verworfen/, 'ohne die Folge ist es eine Bitte');
  assert.match(regel, /quellengebundene Entscheidung/, 'die Bewertung selbst bleibt frei');
  assert.equal(impactContextPromptRule({ title: 'Wetterbericht', sources: [{ title: 'Regen' }] }), '');
});

test('Muster und Auftragstext koennen nicht auseinanderlaufen', () => {
  for (const wort of POWER_TRIGGER_WORDS) assert.ok(POWER_TRIGGER.test(wort), wort);
  assert.ok(POWER_TRIGGER.test('politische-Zusammenarbeit'), 'Bindestrich wie im alten Muster');
  assert.ok(ENERGY_TRIGGER.test('CO2-Bepreisung'));
  assert.equal(impactContextRequirements({ title: 'Koalition' }).central_dimensions.includes('democracy'), true);
});

test('Energie und eingetretener Schaden haben eigene Pflichtteile', () => {
  assert.match(impactContextPromptRule({ title: 'Energiewende beschleunigt' }), /dimensions\.planet/);
  const schaden = impactContextPromptRule({ title: 'Unglück', sources: [{ summary: 'Dabei sind 3 Tote zu beklagen.' }] });
  assert.match(schaden, /observed_effects/);
  assert.doesNotMatch(schaden, /dimensions\.planet/);
});

// Der Hinweis spart Geld, die Belege tragen die Meldung. Bei einem echten
// September-Paket mit 21 Quellen passt beides nicht - dann weicht der Hinweis.
test('Belege gehen dem Hinweis vor, wenn das Paket nicht beides traegt', () => {
  const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/input-limit-regression-20260906.json', import.meta.url)));
  fixture.sources.push(...JSON.parse(fs.readFileSync(new URL('./fixtures/input-limit-growth-20260906.json', import.meta.url))));
  // Derselbe Aufbau wie in packet-growth.test.mjs: der echte Fall vom 06.09.
  fixture.claims = claimLedgerFor(fixture.sources, fixture.story_id, '2026-09-06T07:19:32Z');
  fixture.preanalysis = preAnalyzeStory(fixture);
  fixture.media_trigger = detectMediaImpactTrigger(fixture);
  fixture.currentness = { ...fixture.currentness, comparison_limits: 'Neuere Quellen können noch offene Fragen nicht abschließend klären. '.repeat(18) };
  const prompt = buildAnalysisPrompt([fixture]);
  assert.ok(prompt.length <= 44000);
  assert.equal(prompt.includes('Pflichtteile dieser Meldung'), false, 'der Hinweis weicht');
  const packet = expandPacketTransport(JSON.parse(prompt.split('UNTRUSTED_SOURCE_DATA_BEGIN\n')[1].split('\nUNTRUSTED_SOURCE_DATA_END')[0])[0]);
  assert.equal(packet.sources.length, 21, 'keine Quelle geht verloren');
  const klein = { ...fixture, sources: fixture.sources.slice(0, 2) };
  assert.ok(buildAnalysisPrompt([klein]).includes('Pflichtteile dieser Meldung'), 'im Normalfall steht er da');
});
