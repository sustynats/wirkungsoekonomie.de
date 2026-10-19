import test from 'node:test';
import assert from 'node:assert/strict';
import { coverageAudit, findEventStory, missedNewsRechecks, observedMajorEvents } from '../../scripts/news/coverage-audit.mjs';

const now = '2026-10-19T00:44:20.980Z';
const source = { source_id: 'wdr-nachrichten', publisher_id: 'wdr',
  url: 'https://example.org/kamen-attack', content_hash: 'a'.repeat(64),
  title: 'Messerangriff in Obdachlosenheim: Mann schwer verletzt',
  summary: 'In Kamen wurde ein 60-Jähriger in einer Unterkunft schwer verletzt.',
  published_at: '2026-10-18T15:14:29.000Z', first_seen_at: '2026-10-18T15:34:23.587Z' };
function fixture() {
  const canonical = { story_id: 'canonical', published: true, listed: true, slug: 'canonical',
    published_at: '2026-10-18T14:50:10.442Z', sources: [{ ...source, url: 'https://example.org/first-report', content_hash: 'b'.repeat(64) }],
    living_file: { merged_story_ids: ['archive'] }, versions: [{ version: 1, text: 'Paid original' }],
    pending_update: { reason: 'AI_HOURLY_CALL_LIMIT' } };
  const archive = { story_id: 'archive', published: true, listed: false, slug: 'archive', sources: [{ ...source }],
    retirement: { reason_code: 'MERGED_INTO_LIVING_FILE', preserve_full_publication: true, canonical_story_ids: ['canonical'] },
    versions: [{ version: 1, text: 'Other paid original' }] };
  return { canonical, archive, stories: [canonical, archive], event: observedMajorEvents([source], now)[0] };
}

test('a hash-bound preserved publication resolves to its reciprocal live canonical file, without requeueing', () => {
  const { canonical, stories, event } = fixture();
  assert.ok(event);
  const before = structuredClone(stories);
  assert.equal(findEventStory(event, stories, now), canonical);
  const audit = coverageAudit({ items: [source], observed: [event], stories, now });
  assert.equal(audit.counts.published, 1);
  assert.equal(audit.potential_missed_news.length, 0);
  assert.equal(audit.top_events[0].published_article_id, canonical.story_id);
  assert.equal(audit.top_events[0].public_url, 'https://wirkungsoekonomie.de/wirkungsticker/canonical/');
  assert.deepEqual(missedNewsRechecks({ observed: [event], stories, state: {}, now }), { items: [], events: [] });
  assert.deepEqual(stories, before, 'no text, paid history, source, pending review or routing mutation');
});

test('a new or unknown source edition is not silently declared covered through an archive URL', () => {
  const { stories, event } = fixture();
  for (const changed of [{ content_hash: 'c'.repeat(64) }, { content_hash: undefined }, { content_hash: '' }, { url: 'https://example.org/other-incident' }]) {
    const other = { ...event, sources: event.sources.map(s => ({ ...s, ...changed })) };
    assert.equal(findEventStory(other, stories, now), undefined, JSON.stringify(changed));
  }
});

test('missing, draft, hidden, chained, cyclic, ambiguous and non-reciprocal archive routes remain unresolved', () => {
  const mutations = [
    ({ stories }) => stories.pop(),
    ({ stories }) => stories.shift(),
    ({ canonical }) => { canonical.published = false; },
    ({ canonical }) => { canonical.listed = false; },
    ({ canonical }) => { canonical.retirement = { reason_code: 'MERGED_INTO_LIVING_FILE', canonical_story_ids: ['elsewhere'] }; },
    ({ archive }) => { archive.retirement.canonical_story_ids = ['archive']; },
    ({ archive }) => { archive.retirement.canonical_story_ids = ['canonical', 'elsewhere']; },
    ({ canonical }) => { canonical.living_file.merged_story_ids = []; },
    ({ archive }) => { archive.retirement.preserve_full_publication = false; },
    ({ archive }) => { archive.published = false; },
    ({ stories, canonical }) => stories.push(structuredClone(canonical)),
    ({ stories, canonical, archive }) => {
      stories.push({ ...structuredClone(canonical), story_id: 'other', living_file: { merged_story_ids: ['other-archive'] } },
        { ...structuredClone(archive), story_id: 'other-archive', retirement: { ...archive.retirement, canonical_story_ids: ['other'] } });
    },
  ];
  for (const mutate of mutations) {
    const value = fixture(); mutate(value);
    assert.equal(findEventStory(value.event, value.stories, now), undefined, String(mutate));
  }
});

test('a direct current publication still wins; unreviewed drafts retain their ordinary pending state', () => {
  const { canonical, stories, event } = fixture();
  canonical.sources.push({ ...source });
  assert.equal(findEventStory(event, stories, now), canonical);
  canonical.published = false;
  assert.equal(findEventStory(event, stories, now), canonical);
  const audit = coverageAudit({ items: [source], observed: [event], stories, now });
  assert.equal(audit.counts.published, 0);
  assert.equal(audit.potential_missed_news[0].failure_class, 'E');
});
