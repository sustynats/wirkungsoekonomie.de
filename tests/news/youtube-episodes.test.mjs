import test from 'node:test';
import assert from 'node:assert/strict';
import { episodeUrlKey, parseYouTubeFeed, jsonValueAfter, inspectYouTubeEpisode, fetchYouTubeTranscript, matchingPodcastEpisode } from '../../scripts/news/youtube-episodes.mjs';
import { knownEpisodeUrls, pageObservationKey, loadShows, buildEpisodeRequest, showEpisodes } from '../../scripts/news/sendungs-kandidaten.mjs';

const show = { id: 'serie', show_name: 'Serie', youtube_channel_id: 'UCtest', min_duration_seconds: 900 };
const episode = { title: 'Das Gespräch mit einem Gast - Serie', page: 'https://www.youtube.com/watch?v=abcdefghijk', published_at: '2026-09-24T06:00:00Z', duration: 3600 };
const html = (overrides = {}) => `var ytInitialPlayerResponse = ${JSON.stringify({ playabilityStatus: { status: 'OK' }, videoDetails: { videoId: 'abcdefghijk', channelId: 'UCtest', lengthSeconds: '3600', ...overrides }, captions: { playerCaptionsTracklistRenderer: { captionTracks: [{ languageCode: 'de', kind: 'asr', baseUrl: 'https://www.youtube.com/api/timedtext?v=abcdefghijk&lang=de' }] } } })};`;
test('YouTube identities keep the video, discard only tracking and align short/live links', () => {
  for (const url of ['https://youtu.be/abcdefghijk?t=5', `${episode.page}&t=5`, 'https://www.youtube.com/live/abcdefghijk']) assert.equal(episodeUrlKey(url), episode.page);
  const other = { page: 'https://www.youtube.com/watch?v=lmnopqrstuv' };
  assert.notEqual(pageObservationKey(episode), pageObservationKey(other));
  const known = knownEpisodeUrls({ editions: [{ source_media: { original_url: episode.page } }] });
  assert.ok(known.has(episode.page)); assert.ok(!known.has(other.page));
});
test('Atom feed retains original publication, not updated date; excludes labelled clips and XML entities', () => {
  const entry = (title) => `<entry><yt:videoId>abcdefghijk</yt:videoId><title>${title}</title><published>2026-09-24T06:00:00Z</published><updated>2026-09-25T06:00:00Z</updated><media:description>Inhalt</media:description></entry>`;
  const list = parseYouTubeFeed(`<feed>${entry('Gespräch')}${entry('Ein Trailer')}${entry('#shorts Thema')}</feed>`, show);
  assert.equal(list.length, 1); assert.equal(list[0].published_at, '2026-09-24T06:00:00.000Z');
  assert.throws(() => parseYouTubeFeed('<!ENTITY x><feed/>', show), /INVALID/);
  assert.deepEqual(jsonValueAfter('prefix {"a": "}\\\""}', 'prefix '), { a: '}"' });
});
test('duration and channel must be verified, not guessed from RSS titles', async () => {
  const fetchPage = (details) => async () => ({ ok: true, text: async () => html(details) });
  assert.equal((await inspectYouTubeEpisode(episode, show, fetchPage({}))).duration, 3600);
  assert.equal(await inspectYouTubeEpisode(episode, show, fetchPage({ lengthSeconds: '60' })), null);
  await assert.rejects(inspectYouTubeEpisode(episode, show, fetchPage({ channelId: 'other' })), /CHANNEL_MISMATCH/);
  await assert.rejects(inspectYouTubeEpisode(episode, show, fetchPage({ lengthSeconds: undefined })), /DURATION_MISSING/);
});
test('captions preserve machine provenance and never store signed URLs; empty/blocked responses are not transcripts', async () => {
  const inspected = await inspectYouTubeEpisode(episode, show, async () => ({ ok: true, text: async () => html() }));
  const caption = await fetchYouTubeTranscript(inspected, async () => ({ ok: true, text: async () => JSON.stringify({ events: [{ tStartMs: 3000, segs: [{ utf8: 'Inhalt '.repeat(100) }] }] }) }));
  assert.equal(caption.origin, 'youtube_auto_captions'); assert.equal(caption.url, episode.page); assert.equal(caption.cost_usd, 0); assert.match(caption.text, /^00:00:03/);
  assert.equal(await fetchYouTubeTranscript(inspected, async () => ({ ok: true, text: async () => '' })), null);
  assert.equal(await fetchYouTubeTranscript(inspected, async () => ({ ok: false, status: 403 })), null);
  assert.equal(await fetchYouTubeTranscript({ ...inspected, youtube_caption: { url: 'https://private.example/captions' } }, async () => assert.fail('no off-platform request')), null);
});
test('a podcast fallback requires the same title, a near date and matching duration', () => {
  const audio = { ...episode, title: 'Das Gespräch mit einem Gast', media: 'https://audio.example/e.mp3' };
  assert.equal(matchingPodcastEpisode(episode, [audio], show), audio);
  for (const change of [{ title: 'Anderes Thema' }, { published_at: '2026-09-20' }, { duration: 90 }]) assert.equal(matchingPodcastEpisode(episode, [{ ...audio, ...change }], show), null);
});
test('Mediathek episode without captions uses only its matched official podcast audio', async () => {
  const s = { id: 'caren-miosga', show_name: 'Caren Miosga', kind: 'watched', provider: 'NDR',
    mediathek: { topic: 'Caren Miosga', channel: 'NDR' }, podcast_feed: 'https://www.ndr.de/podcast/carenmiosga146.xml', min_duration_seconds: 2400 };
  const title = 'Wie kommt die Regierung aus der Krise, Herr Söder?';
  const page = 'https://www.ardmediathek.de/video/miosga-11-10';
  const audioPage = 'https://www.ndr.de/fernsehen/sendungen/caren-miosga/miosga-11-10.html';
  const row = { title, timestamp: Date.parse('2026-10-11T19:45:00Z') / 1000, duration: 3593,
    url_website: page, url_video_low: 'https://cdn.example/miosga.mp4', url_subtitle: '', id: 'miosga-11-10' };
  const item = (name, duration = '00:59:57') => `<item><title>${name}</title><link>${audioPage}</link><pubDate>Sun, 11 Oct 2026 21:45:00 +0200</pubDate><itunes:duration>${duration}</itunes:duration><enclosure url="https://cdn.example/miosga.mp3"/></item>`;
  const podcast = `<rss>${item('Anderes Thema')}${item(title)}</rss>`;
  const fetchImpl = async (url, init) => init?.method === 'POST'
    ? { ok: true, json: async () => ({ result: { results: [row] } }) }
    : { ok: true, text: async () => podcast };
  const [episode] = await showEpisodes(s, fetchImpl);
  assert.equal(episode.page, page, 'the video identity remains stable for deduplication');
  assert.equal(episode.media, 'https://cdn.example/miosga.mp3');
  assert.equal(episode.podcast_basis, audioPage);
  assert.equal(episode.delivery_kind, 'listened', 'audio-only analysis is not labelled Nachgesehen');
  const { job } = buildEpisodeRequest(episode, s, { owner: '1234567890123456', now: '2026-10-12T20:00:00Z' });
  assert.equal(job.input.request.kind, 'listened');
  assert.ok(job.input.request.links.includes(audioPage));
  assert.match(job.input.request.brief, /Zeitmarken gelten dann für die Podcastfassung/);
  const [withoutMatch] = await showEpisodes(s, async (url, init) => init?.method === 'POST'
    ? { ok: true, json: async () => ({ result: { results: [row] } }) }
    : { ok: true, text: async () => `<rss>${item('Anderes Thema')}</rss>` });
  assert.equal(withoutMatch.media, row.url_video_low, 'an unrelated audio item cannot replace the video');
  const [ambiguous] = await showEpisodes(s, async (url, init) => init?.method === 'POST'
    ? { ok: true, json: async () => ({ result: { results: [row] } }) }
    : { ok: true, text: async () => `<rss>${item(title)}${item(title)}</rss>` });
  assert.equal(ambiguous.media, row.url_video_low, 'ambiguous audio matches cannot replace the video');
  const [withCaptions] = await showEpisodes(s, async (url, init) => {
    if (init?.method === 'POST') return { ok: true, json: async () => ({ result: { results: [{ ...row, url_subtitle: 'https://cdn.example/miosga.vtt' }] } }) };
    assert.fail('a captioned episode needs no audio fallback');
  });
  assert.equal(withCaptions.delivery_kind, undefined);
  assert.equal(withCaptions.subtitle_url, 'https://cdn.example/miosga.vtt');
});
test('three requested series use existing private approval route; no logos or automatic publication', () => {
  const registered = loadShows().filter((s) => s.youtube_channel_id);
  assert.equal(registered.length, 3);
  for (const s of registered) {
    assert.equal(s.require_transcript, true); assert.equal(s.kind, 'watched');
    const { job } = buildEpisodeRequest({ ...episode, guid: 'youtube:abcdefghijk', transcripts: [] }, s, { owner: '1234567890123456', now: '2026-09-24T12:00:00Z' });
    assert.equal(job.input.manual_only, true); assert.equal(job.input.request.publication_intent, 'final_approval_required'); assert.equal(job.input.request.author_notes, '');
  }
});

test('blocked YouTube metadata falls back only to an unambiguous official audio episode, labelled Nachgehört', async () => {
  const { matchingPodcastFallback } = await import('../../scripts/news/youtube-episodes.mjs');
  const s = { ...show, feed: 'https://example.org/video-feed', podcast_feed: 'https://example.org/podcast-feed', kind: 'watched', provider: 'Test' };
  const audio = { ...episode, page: 'https://example.org/audio-episode', media: 'https://example.org/e.mp3' };
  assert.equal(matchingPodcastFallback({ ...episode, duration: null }, [audio], s), audio);
  assert.equal(matchingPodcastFallback(episode, [audio, audio], s), null, 'mehrdeutige Zuordnung bleibt offen');
  assert.equal(matchingPodcastFallback(episode, [{ ...audio, published_at: '2026-09-01' }], s), null);
  const feed = `<feed><entry><yt:videoId>abcdefghijk</yt:videoId><title>${episode.title}</title><published>${episode.published_at}</published></entry></feed>`;
  const podcast = `<rss><item><title>${episode.title}</title><link>${audio.page}</link><pubDate>${episode.published_at}</pubDate><itunes:duration>3600</itunes:duration><enclosure url="${audio.media}"/></item></rss>`;
  const failures = [];
  const fetchImpl = async url => ({ ok: true, text: async () => url === s.feed ? feed : url === s.podcast_feed ? podcast : 'var ytInitialPlayerResponse = {"playabilityStatus":{"status":"LOGIN_REQUIRED"}};' });
  const list = await showEpisodes(s, fetchImpl, '2026-09-25T12:00:00Z', { onError: e => failures.push(e) });
  assert.equal(list.length, 1); assert.equal(list[0].delivery_kind, 'listened'); assert.equal(list[0].page, audio.page);
  assert.equal(list[0].youtube_caption, undefined); assert.equal(failures[0].fallback, 'official_podcast');
  const { job } = buildEpisodeRequest(list[0], s, { owner: '1234567890123456', now: '2026-09-25T12:00:00Z' });
  assert.equal(job.input.request.kind, 'listened'); assert.match(job.input.request.brief, /^Nachgehört:/);
  assert.equal(job.input.request.publication_intent, 'final_approval_required');
});

test('one inaccessible video does not discard a later accessible episode', async () => {
  const s = { ...show, feed: 'https://example.org/feed' };
  const entry = id => `<entry><yt:videoId>${id}</yt:videoId><title>Gespräch mit einem Gast ${id}</title><published>2026-09-24T06:00:00Z</published></entry>`;
  const failures = [];
  const list = await showEpisodes(s, async url => ({ ok: true, text: async () => url === s.feed
    ? `<feed>${entry('lmnopqrstuv')}${entry('abcdefghijk')}</feed>` : url.includes('lmnopqrstuv') ? '' : html() }), '2026-09-25T12:00:00Z', { onError: e => failures.push(e) });
  assert.equal(list.length, 1); assert.equal(failures.length, 1); assert.equal(list[0].page, episode.page);
});

test('a missing YouTube feed still discovers full episodes from its configured official podcast', async () => {
  const s = { ...show, feed: 'https://example.org/video-feed', podcast_feed: 'https://example.org/podcast-feed', kind: 'watched', max_age_days: 14 };
  const item = (title, duration, date = episode.published_at) => `<item><title>${title}</title><link>https://example.org/audio-${duration}</link><guid>audio-${duration}</guid><pubDate>${date}</pubDate><itunes:duration>${duration}</itunes:duration><enclosure url="https://example.org/${duration}.mp3"/><podcast:transcript url="https://example.org/words.vtt" type="text/vtt"/></item>`;
  const podcast = `<rss>${item(episode.title, 3600)}${item('Ausschnitt', 90)}${item('Alte Folge', 4000, '2026-09-01T06:00:00Z')}${item('Unbekannte Dauer', '')}</rss>`;
  for (const status of [404, 410]) {
    const failures = [];
    const list = await showEpisodes(s, async url => url === s.feed
      ? { ok: false, status } : { ok: true, text: async () => podcast }, '2026-09-25T12:00:00Z', { onError: e => failures.push(e) });
    assert.equal(list.length, 1);
    assert.equal(list[0].guid, 'audio-3600');
    assert.equal(list[0].page, 'https://example.org/audio-3600');
    assert.equal(list[0].published_at, new Date(episode.published_at).toISOString());
    assert.equal(list[0].delivery_kind, 'listened');
    assert.equal(list[0].podcast_basis, list[0].page);
    assert.equal(list[0].youtube_caption, undefined);
    assert.equal(list[0].transcripts[0].url, 'https://example.org/words.vtt');
    assert.deepEqual(failures, [{ show_id: s.id, url: s.feed, error: `SHOW_FEED_HTTP_${status}`, fallback: 'official_podcast' }]);
  }
});

test('podcast feed recovery does not route around access or policy errors', async () => {
  const s = { ...show, feed: 'https://example.org/video-feed', podcast_feed: 'https://example.org/podcast-feed' };
  for (const status of [401, 403, 429, 500]) {
    const calls = [];
    await assert.rejects(showEpisodes(s, async url => { calls.push(url); return { ok: false, status }; }), new RegExp(`SHOW_FEED_HTTP_${status}`));
    assert.deepEqual(calls, [s.feed]);
  }
  const noPodcast = { ...s, podcast_feed: undefined };
  await assert.rejects(showEpisodes(noPodcast, async () => ({ ok: false, status: 404 })), /SHOW_FEED_HTTP_404/);
});

test('an unavailable or empty official podcast keeps the original missing-feed error visible', async () => {
  const s = { ...show, feed: 'https://example.org/video-feed', podcast_feed: 'https://example.org/podcast-feed' };
  const failures = [];
  await assert.rejects(showEpisodes(s, async url => ({ ok: false, status: url === s.feed ? 404 : 403 }), undefined, { onError: e => failures.push(e) }), /SHOW_FEED_HTTP_404/);
  assert.deepEqual(failures, [{ show_id: s.id, url: s.podcast_feed, error: 'SHOW_FEED_HTTP_403' }]);
  await assert.rejects(showEpisodes(s, async url => url === s.feed ? { ok: false, status: 404 }
    : { ok: true, text: async () => '<rss><channel/></rss>' }), /SHOW_FEED_HTTP_404/);
});
