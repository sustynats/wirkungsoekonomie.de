import test from 'node:test';
import assert from 'node:assert/strict';
import { publicationDateFromHib, createPublicationDateRecovery } from '../../scripts/news/publication-date.mjs';
import { fetchPublicArticle, parseFeed } from '../../scripts/news/lib.mjs';
import { sourceIntegrityForStory } from '../../scripts/news/source-integrity.mjs';
import { runWirkungsticker } from '../../scripts/news/run.mjs';
import { registryErrors } from '../../scripts/news/registry.mjs';

const now = '2026-09-09T00:30:00Z';
const source = {
  source_id: 'bundestag-umwelt', publisher_id: 'bundestag', name: 'Deutscher Bundestag',
  url: 'https://www.bundestag.de/presse/hib/', feed_url: 'https://www.bundestag.de/static/appdata/includes/rss/umwelt.rss',
  source_type: 'official_rss', topic: 'Politik', primary_source: true, enabled: true, role: 'A',
  technical_access: 'verified', official_endpoint_verified: true, legal_use_status: 'metadata_only',
  publication_date_adapter: 'bundestag-hib-date-v1',
  access: { status: 'public', article: 'bounded_public_text', cost_usd: 0 },
};
const registry = { schema_version: '1.0', sources: [source], policy: { resolve_dns: false } };
const item = (id = 1210800) => ({ source_id: source.source_id, publisher_id: 'bundestag', publisher: source.name,
  source_type: source.source_type, primary_source: true, url: `https://www.bundestag.de/presse/hib/kurzmeldungen-${id}`,
  title: 'Verjährte Ordnungsgelder führen zu Einnahmeausfällen', summary: 'Dem Staat sind wegen verjährter Ordnungsgeldforderungen Einnahmen entgangen.',
  published_at: null, source_published_at: null, content_hash: `text-${id}` });
const document = (i = item(), day = '08.09.2026') => ({ final_url: i.url, body: `<html><head><meta name="date" content="${day}"/><meta property="og:title" content="${i.title}"/></head><body><span class="bt-date">${day}</span><h1><span>${i.title}</span></h1><p>Stand: 09.09.2026</p></body></html>` });

test('undated thematic RSS stays undated until matching original metadata is verified', () => {
  const i = item();
  const parsed = parseFeed(`<rss><channel><item><title>${i.title}</title><link>${i.url}</link><description>${i.summary}</description></item></channel></rss>`, source)[0];
  assert.equal(parsed.published_at, null);
  assert.deepEqual(publicationDateFromHib(document(), parsed, now), { published_at: '2026-09-08', published_precision: 'day' });
});

test('publication metadata must agree with the visible article date and exact title', () => {
  for (const change of [
    d => { d.body = d.body.replace('<meta name="date" content="08.09.2026"/>', ''); },
    d => { d.body = d.body.replace('class="bt-date">08.09.2026', 'class="bt-date">07.09.2026'); },
    d => { d.body = d.body.replace('<h1><span>', '<h1>Anderer Bericht<span>'); },
    d => { d.body = d.body.replace('</head>', '<meta name="date" content="08.09.2026"/></head>'); },
    d => { d.body = d.body.replace('</body>', '<span class="bt-date">08.09.2026</span></body>'); },
    d => { d.body = d.body.replace('</head>', '<link rel="canonical" href="https://www.bundestag.de/presse/hib/kurzmeldungen-9999"/></head>'); },
    d => { d.final_url = 'https://www.bundestag.de/presse/hib/kurzmeldungen-9999'; },
    d => { d.final_url = 'https://example.org/presse/hib/kurzmeldungen-1210800'; },
  ]) {
    const d = document(); change(d);
    assert.equal(publicationDateFromHib(d, item(), now), null);
  }
  assert.equal(publicationDateFromHib(document(item(), '31.02.2026'), item(), now), null);
  assert.equal(publicationDateFromHib(document(item(), '10.09.2026'), item(), now), null);
});

test('quotation typography may differ between the RSS title and the exact HIB heading', () => {
  const i = { ...item(1211026), title: 'Grüne fordern "faires" Gewerbemietrecht' };
  for (const title of [
    'Grüne fordern „faires“ Gewerbemietrecht',
    'Grüne fordern “faires” Gewerbemietrecht',
    'Grüne fordern «faires» Gewerbemietrecht',
    'Grüne fordern &quot;faires&quot; Gewerbemietrecht',
  ]) {
    assert.deepEqual(publicationDateFromHib(document({ ...i, title }), i, now),
      { published_at: '2026-09-08', published_precision: 'day' });
  }
  const single = { ...i, title: "Grüne fordern 'faires' Gewerbemietrecht" };
  assert.deepEqual(publicationDateFromHib(document({ ...single, title: 'Grüne fordern ‚faires‘ Gewerbemietrecht' }), single, now),
    { published_at: '2026-09-08', published_precision: 'day' });
  for (const title of [
    'Grüne fordern „anderes“ Gewerbemietrecht',
    'Grüne fordern faires Gewerbemietrecht',
    'Grüne fordern „faires“ Gewerbemietrecht nicht',
  ]) assert.equal(publicationDateFromHib(document({ ...i, title }), i, now), null);
  const conflict = document({ ...i, title: 'Grüne fordern „faires“ Gewerbemietrecht' });
  conflict.body = conflict.body.replace('class="bt-date">08.09.2026', 'class="bt-date">07.09.2026');
  assert.equal(publicationDateFromHib(conflict, i, now), null);
});

test('a failed older parser cache does not postpone a corrected metadata check', async () => {
  const state = {}, i = item();
  await createPublicationDateRecovery({ registry, state, now,
    fetchArticleImpl: async () => document({ ...i, title: 'Nicht derselbe Artikel' }),
  }).recover([i]);
  const saved = Object.values(state.source_publication_dates)[0];
  assert.equal(saved.status, 'open');
  delete saved.parser_revision; // Existing negative cache written before the parser correction.
  let calls = 0;
  const next = createPublicationDateRecovery({ registry, state, now: '2026-09-09T01:00:00Z',
    fetchArticleImpl: async current => { calls++; return document(current); },
  });
  const [recovered] = await next.recover([i]);
  assert.equal(calls, 1);
  assert.equal(recovered.published_at, '2026-09-08');
  assert.equal(next.stats.verified, 1);
});

test('footer, script and comment dates are not publication evidence', () => {
  const d = document();
  d.body = d.body.replace('<meta name="date" content="08.09.2026"/>', '<!-- <meta name="date" content="08.09.2026"/> -->');
  assert.equal(publicationDateFromHib(d, item(), now), null);
  d.body = d.body.replace('</head>', '<script>"<meta name=\'date\' content=\'08.09.2026\'>"</script></head>');
  assert.equal(publicationDateFromHib(d, item(), now), null);
});

test('bounded reads and cache reuse preserve original data and do not invent a clock time', async () => {
  const state = {}, items = [item(), item(1210802)], before = structuredClone(items);
  let calls = 0;
  const recovery = createPublicationDateRecovery({ registry, state, now, fetchArticleImpl: async i => { calls++; return document(i); } });
  const recovered = await recovery.recover(items);
  assert.equal(calls, 2);
  assert.deepEqual(items, before);
  assert.equal(recovered[0].published_at, '2026-09-08');
  assert.equal(recovered[0].source_published_at, '2026-09-08');
  assert.equal(recovered[0].publication_date_evidence.url, items[0].url);
  assert.ok(!JSON.stringify(state).includes('<html>'));
  for (const saved of Object.values(state.source_publication_dates)) delete saved.parser_revision;
  const repeat = createPublicationDateRecovery({ registry, state, now, fetchArticleImpl: async () => { throw new Error('must reuse'); } });
  assert.deepEqual(await repeat.recover(items), recovered);
  assert.equal(repeat.stats.attempted, 0);
  assert.equal(repeat.stats.cached, 2);
  const changed = { ...items[0], summary: 'Ein anderer Quellenstand.' };
  await recovery.recover([changed]);
  assert.equal(calls, 3);
});

test('only the explicit verified source adapter may read undated HIB originals', async () => {
  for (const override of [{ publication_date_adapter: undefined }, { primary_source: false }, { enabled: false }, { role: 'C' },
    { technical_access: 'open' }, { official_endpoint_verified: false }, { legal_use_status: 'open' },
    { access: { status: 'public', article: 'metadata_only' } }]) {
    const recovery = createPublicationDateRecovery({ registry: { ...registry, sources: [{ ...source, ...override }] }, state: {}, now,
      fetchArticleImpl: async () => { throw new Error('must not request'); } });
    assert.deepEqual(await recovery.recover([item()]), [item()]);
    assert.equal(recovery.stats.attempted, 0);
  }
  for (const extra of [{ published_at: '2026-09-08T09:00:00Z' }, { source_published_at: '2026-09-08' },
    { url: 'https://www.bundestag.de/mediathek?videoid=123' }, { url: 'https://www.bundestag.de.evil.example/presse/hib/kurzmeldungen-1210800' }]) {
    const recovery = createPublicationDateRecovery({ registry, state: {}, now, fetchArticleImpl: async () => { throw new Error('must not request'); } });
    await recovery.recover([{ ...item(), ...extra }]);
    assert.equal(recovery.stats.attempted, 0);
  }
});

test('a mistyped adapter or another publisher cannot silently activate this profile', () => {
  assert.deepEqual(registryErrors(registry), []);
  for (const override of [{ publication_date_adapter: 'typo' }, { publisher_id: 'other' }, { url: 'https://example.org/' }, { primary_source: false }]) {
    assert.ok(registryErrors({ ...registry, sources: [{ ...source, ...override }] }).includes('SOURCE_PUBLICATION_DATE_ADAPTER_INVALID:bundestag-umwelt'));
  }
});

test('corrupt, future or differently versioned cached evidence is not applied', async () => {
  for (const override of [{ published_at: '2026-02-31' }, { published_at: '2027-01-01' },
    { checked_at: '2027-01-01' }, { version: 'unknown' }, { published_precision: 'minute' }]) {
    const state = {};
    await createPublicationDateRecovery({ registry, state, now, fetchArticleImpl: async i => document(i) }).recover([item()]);
    Object.assign(Object.values(state.source_publication_dates)[0], override);
    const next = createPublicationDateRecovery({ registry, state, now, fetchArticleImpl: async () => { throw new Error('unavailable'); } });
    const [result] = await next.recover([item()]);
    assert.equal(result.published_at, null);
    assert.equal(next.stats.attempted, 1);
  }
});

test('failures remain held, retry at most hourly, and share the three-read limit', async () => {
  const state = {}, items = Array.from({ length: 6 }, (_, index) => item(1210800 + index));
  const fetchArticleImpl = async () => { throw new Error('ROBOTS_DISALLOWED'); };
  const recovery = createPublicationDateRecovery({ registry, state, now, fetchArticleImpl });
  assert.deepEqual(await recovery.recover(items), items);
  assert.equal(recovery.stats.attempted, 3);
  assert.equal(recovery.stats.held, 3);
  assert.equal(recovery.stats.deferred, 3);
  const again = createPublicationDateRecovery({ registry, state, now: '2026-09-09T01:00:00Z', fetchArticleImpl });
  await again.recover(items.slice(0, 3));
  assert.equal(again.stats.attempted, 0);
  const later = createPublicationDateRecovery({ registry, state, now: '2026-09-09T01:31:00Z', fetchArticleImpl });
  await later.recover(items.slice(0, 3));
  assert.equal(later.stats.attempted, 3);
});

test('shared public-article boundary retains access and paywall protections', async () => {
  let calls = 0;
  await assert.rejects(fetchPublicArticle(item(), { ...source, access: { article: 'metadata_only' } }, { resolve_dns: false }, async () => { calls++; }), /SOURCE_METADATA_ONLY/);
  assert.equal(calls, 0);
  await assert.rejects(fetchPublicArticle(item(), source, { resolve_dns: false }, async () => Response.json({ isAccessibleForFree: false }, { headers: { 'content-type': 'text/html' } })), /ARTICLE_ACCESS_RESTRICTED/);
});

test('verified metadata clears only the date issue, never unrelated integrity issues', async () => {
  const i = { ...item(), publisher_id: 'wrong-publisher' }, story = { title: i.title, sources: [i] };
  const before = sourceIntegrityForStory(story, registry, [], now).issues.map(issue => issue.code);
  const recovery = createPublicationDateRecovery({ registry, state: {}, now, fetchArticleImpl: async i => document(i) });
  const sources = await recovery.recover(story.sources);
  const after = sourceIntegrityForStory({ ...story, sources }, registry, [], now);
  assert.ok(before.includes('SOURCE_PUBLICATION_DATE_INVALID'));
  assert.ok(!after.issues.some(issue => issue.code === 'SOURCE_PUBLICATION_DATE_INVALID'));
  assert.ok(after.issues.some(issue => issue.code === 'SOURCE_PUBLISHER_ID_MISMATCH'));
  assert.equal(after.publication_status, 'hold');
});

test('worker discovers day-dated items before cutoff and carries metadata through normal gates without AI', async () => {
  const oldEnabled = process.env.WOEK_NEWS_AI_ENABLED;
  process.env.WOEK_NEWS_AI_ENABLED = 'false';
  try {
    const i = { ...item(), title: 'Bund beschließt Gesetz für neue Schutzstandards kritischer Infrastruktur', summary: 'Neue Regeln verpflichten Unternehmen und Behörden zu zusätzlichen Schutzmaßnahmen für Stromnetze und Wasserversorgung in Deutschland.' };
    let captured;
    const report = await runWirkungsticker({ dryRun: true, now, registry,
      state: { source_status: { [source.source_id]: { last_success: '2026-09-08T21:00:00Z' } }, seen_items: {}, pending_story_ids: [], relevance_filter_version: '4.0' },
      storyStore: { stories: [] }, usage: { runs: [] }, newsroom: { source_items: {}, events: {}, event_sources: [], discovery_candidates: [], decisions: [] },
      budgetFx: { rate_date: '2026-09-08', rate_usd_per_eur: 1.1614 },
      fetchFeedImpl: async () => ({ final_url: source.feed_url, body: `<rss><channel><item><title>${i.title}</title><link>${i.url}</link><description>${i.summary}</description></item></channel></rss>` }),
      fetchPublicationDateImpl: async current => document(current),
      fetchArticleImpl: async () => { throw new Error('AI is disabled'); },
      callAiImpl: async () => { throw new Error('No paid call permitted'); },
      captureState: value => { captured = value; },
    });
    assert.equal(report.source_date_recovery.verified, 1);
    assert.equal(report.feed_entries_new, 1);
    assert.equal(report.source_integrity_holds.length, 0);
    assert.equal(report.ai_calls, 0);
    assert.equal(report.published_stories, 0);
    assert.equal(captured.storyStore.stories[0].sources[0].published_at, '2026-09-08');
    assert.equal(captured.storyStore.stories[0].sources[0].published_precision, 'day');
    assert.equal(Object.values(captured.newsroom.source_items)[0].publication_date_evidence.version, 'bundestag-hib-date-v1');
  } finally {
    if (oldEnabled === undefined) delete process.env.WOEK_NEWS_AI_ENABLED;
    else process.env.WOEK_NEWS_AI_ENABLED = oldEnabled;
  }
});
