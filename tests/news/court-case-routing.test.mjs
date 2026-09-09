import test from 'node:test';
import assert from 'node:assert/strict';
import { eventCompatibility } from '../../scripts/news/newsroom.mjs';
import { courtCaseRelation } from '../../scripts/news/court-case-identity.mjs';
import { clusterItems, existingStoryMatch } from '../../scripts/news/lib.mjs';
import { duplicateGroups, fileSubject, mergeLivingFiles, subjectConflict } from '../../scripts/news/living-files.mjs';

const now = '2026-09-09T11:30:00Z';
const first = {
  source_id: 'first', url: 'https://example.org/first', published_at: '2026-09-09T07:59:55Z',
  title: 'EU-Gericht bestätigt: Booking darf eTraveli nicht übernehmen',
  summary: 'Das Gericht der Europäischen Union in Luxemburg bestätigte das Übernahmeverbot. (Az. T-1139/23)',
};
const later = {
  source_id: 'later', url: 'https://example.org/recht/eug-t113923-booking-etraveli-uebernahmeverbot', published_at: '2026-09-09T10:37:00Z',
  title: 'EuG bestätigt Übernahmeverbot: Booking.com darf sich Flüge-Plattform eTraveli nicht einverleiben',
  summary: 'Das Gericht bestätigt das ausgesprochene Übernahmeverbot.',
};
const story = (id, source, extra = {}) => ({
  story_id: id, slug: id, title: source.title, sources: [source], published: true, listed: true,
  published_at: source.published_at, first_seen: source.published_at, last_updated: source.published_at,
  source_summary: source.summary, analysis: { summary: source.summary }, claims: [], current_version: 1,
  versions: [{ version: 1, source_versions: [{ url: source.url }] }], ...extra,
});

test('a full court citation and its exact URL token route the same-day judgment before AI', () => {
  const original = story('original', first);
  assert.equal(eventCompatibility(first, later).reason, 'shared_court_case');
  assert.equal(eventCompatibility(first, later).same_event, true);
  assert.ok(existingStoryMatch(later, { story: original, last_updated: original.last_updated }, now) >= 0.98);
  assert.equal(clusterItems([later], [original], now)[0].story_id, 'original');
  assert.equal(clusterItems([first, later], [], now).length, 1);
  assert.equal(clusterItems([later, first], [], now).length, 1);
});

test('court identity retains jurisdiction prefix, suffix, date and event-stage boundaries', () => {
  const original = story('original', first);
  const variants = [
    { ...later, url: 'https://example.org/eug-t1139230-booking' },
    { ...later, url: 'https://example.org/t113923p-booking' },
    { ...later, url: 'https://example.org/c113923-booking' },
    { ...later, summary: 'Das Gericht entscheidet in der Sache C-1139/23.' },
    { ...later, summary: 'Das Gericht prüft T-1139/23 und T-1140/23.' },
    { ...later, url: 'https://example.org/other?case=t113923#t113923' },
    { ...later, published_at: '2026-09-10T10:37:00Z' },
    { ...later, published_at: undefined },
    { ...later, title: 'Ein Vorschlag zur Übernahme liegt vor', summary: 'Ein neuer Entwurf wurde vorgelegt.' },
  ];
  for (const candidate of variants) {
    assert.equal(eventCompatibility(first, candidate).same_event, false, JSON.stringify(candidate));
    assert.equal(clusterItems([candidate], [original], now)[0].existing_story, null, JSON.stringify(candidate));
  }
  const otherCourt = { ...first, url: 'https://example.org/another-court', summary: 'Das Gericht entscheidet im Verfahren C-1139/23.' };
  assert.equal(subjectConflict(original, story('different', otherCourt)), true);
  assert.equal(clusterItems([otherCourt], [original], now)[0].existing_story, null);
});

test('unrelated numbers and compressed URLs without a full independent citation establish no identity', () => {
  const untyped = { ...first, summary: 'Der Bericht nennt 1139/23.' };
  assert.equal(eventCompatibility(untyped, later).same_event, false);
  assert.equal(eventCompatibility({ ...first, summary: '' }, later).same_event, false);
  assert.equal(courtCaseRelation({ ...first, summary: 'T-1139/230' }, later).status, 'unestablished');
  assert.equal(courtCaseRelation({ ...first, summary: 'T-1139/23P' }, later).status, 'unestablished');
});

test('typed case references work for other parties and typography without a company or publisher dictionary', () => {
  const a = { ...first, title: 'Gericht entscheidet über Netzzugang', summary: 'Das Gericht entschied über Orion und Selene. C-280/26.' };
  const b = { ...later, title: 'Urteil zu Zugangsvorgaben', summary: 'Das Gericht entschied: C\u2011280 / 26.', url: 'https://another.example/judgment' };
  assert.equal(eventCompatibility(a, b).same_event, true);
  assert.equal(clusterItems([a, b], [], now).length, 1);
  assert.equal(courtCaseRelation(a, { ...b, summary: 'C-280/26 P' }).status, 'different');
  assert.equal(courtCaseRelation(a, { ...b, summary: 'C-280/26 R' }).status, 'different');
});

test('a known multi-citation document can update itself but cannot bridge separate documents', () => {
  const joint = { ...first, summary: 'Das Gericht berichtet über T-1139/23 und T-1140/23.' };
  const original = story('joint', joint);
  const updated = { ...joint, summary: `${joint.summary} Eine weitere Begründung wurde veröffentlicht.` };
  assert.equal(eventCompatibility(joint, updated).same_event, true);
  assert.equal(clusterItems([updated], [original], now)[0].story_id, original.story_id);
  assert.equal(clusterItems([{ ...updated, url: 'https://another.example/context' }], [original], now)[0].existing_story, null);
});

test('source metadata, not the generated analysis, controls the event-location guard', () => {
  const original = story('original', first);
  const newer = story('newer', later, { source_summary: 'Das Unternehmen ist bei Online-Hotelbuchungen tätig.' });
  assert.deepEqual(fileSubject(newer, { sourcePlace: true }).places, []);
  assert.equal(subjectConflict(original, newer), false);
  const genuineOtherPlace = story('other-place', { ...later, summary: 'Das Gericht in Berlin bestätigt das Verbot.' });
  assert.equal(subjectConflict(original, genuineOtherPlace), true);
});

test('retrospective consolidation preserves both publications and sends new evidence to normal review', () => {
  const original = story('original', first);
  const newer = story('newer', later, { source_summary: 'Die Marktstellung bei Online-Hotelbuchungen ist betroffen.' });
  const stories = [original, newer];
  const before = structuredClone(stories);
  const groups = duplicateGroups(stories);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].duplicate_ids.length, 1);
  assert.equal(mergeLivingFiles(stories, groups, now).length, 1);
  assert.equal(stories.filter(s => s.listed !== false).length, 1);
  for (let index = 0; index < stories.length; index++) {
    for (const field of ['title', 'analysis', 'claims', 'sources', 'versions', 'published_at', 'current_version']) {
      assert.deepEqual(stories[index][field], before[index][field]);
    }
  }
  const canonical = stories.find(s => s.listed !== false);
  assert.equal(canonical.pending_update.sources.length, 2);
  assert.equal(canonical.pending_update.reason, 'AI_BUDGET_OR_BATCH_LIMIT');
  assert.equal(stories.find(s => s.listed === false).retirement.reason_code, 'MERGED_INTO_LIVING_FILE');
  assert.deepEqual(duplicateGroups(stories), []);
});
