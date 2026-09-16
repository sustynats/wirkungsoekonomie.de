import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { bridgePath, JOB_ID } from '../../scripts/news/bridge/contract.mjs';
import { parseEpisodes, selectNewEpisodes, buildEpisodeRequest, knownEpisodeUrls, pickTranscript, fetchTranscript, proposeEpisodeCandidates, durationSeconds, EPISODE_VERSION, mediathekEpisodes, mediathekQueryBody, episodeKey, loadShows } from '../../scripts/news/sendungs-kandidaten.mjs';
import { parseSubtitleTrack, subtitleSeconds, fetchSubtitleTranscript, buildTranscriptText, timecode, audioSourceFor } from '../../scripts/news/sendungs-transkript.mjs';
import { labelledTitle } from '../../scripts/news/build.mjs';

const now = '2026-09-16T06:00:00.000Z';
const zdf = `<?xml version="1.0"?><rss><channel><title>maybrit illner (AUDIO)</title>
<item><title>Die Denkzettelwahl &#8211; was muss sich &#228;ndern?</title><itunes:summary>Mit Armin Laschet und Cem &#214;zdemir.</itunes:summary><link>https://www.zdf.de/video/talk/maybrit-illner-128/illner-100</link><enclosure url="https://podfileszdf-a.akamaihd.net/x.mp3" length="1" type="audio/mpeg"/><guid>https://www.zdf.de/uri/c27c443c</guid><pubDate>Thu, 10 Sep 2026 22:15:00 +0200</pubDate><itunes:duration>3718</itunes:duration></item>
<item><title>Kurzer Clip</title><link>https://www.zdf.de/video/talk/maybrit-illner-128/clip-100</link><guid>clip</guid><pubDate>Fri, 11 Sep 2026 10:00:00 +0200</pubDate><itunes:duration>00:04:10</itunes:duration></item>
</channel></rss>`;
const mvw = `<rss><channel><item><title><![CDATA[Markus Lanz vom 10. September 2026 (S2026/E98)]]></title><description><![CDATA[Über den Vorschlag des BSW.]]></description><link>https://nrodlzdf-a.akamaihd.net/lanz.mp4</link><guid isPermaLink="false">Xs9R</guid><category><![CDATA[Markus Lanz]]></category><pubDate>Thu, 10 Sep 2026 21:45:00 GMT</pubDate><enclosure url="https://nrodlzdf-a.akamaihd.net/lanz.mp4" length="1" type="video/mp4"/><duration>3678</duration><websiteUrl>https://www.zdf.de/video/talk/markus-lanz-114/lanz-102</websiteUrl></item>
<item><title><![CDATA[Terra X: Etwas anderes]]></title><link>https://nrodlzdf-a.akamaihd.net/terra.mp4</link><guid>t1</guid><category><![CDATA[Terra X]]></category><pubDate>Thu, 10 Sep 2026 20:00:00 GMT</pubDate><duration>1800</duration><websiteUrl>https://www.zdf.de/video/terra-100</websiteUrl></item></channel></rss>`;
const jule = `<rss xmlns:podcast="https://podcastindex.org/namespace/1.0"><channel><item><title>#262 (Wenn die Mitte ihre Mehrheit verliert)</title><link>https://lanz-precht.example/262</link><description>In Sachsen-Anhalt bekommt die AfD 43,8 Prozent.</description><guid isPermaLink="false">g262</guid><pubDate>Thu, 10 Sep 2026 23:01:00 +0000</pubDate><enclosure url="https://cdn.jule.example/262.mp3" type="audio/mpeg" length="1"/><itunes:duration>3338</itunes:duration><podcast:transcript url="https://cdn.jule.example/262.transcript.txt?v=3" type="text/plain"/><podcast:transcript url="https://cdn.jule.example/262.vtt?v=3" type="text/vtt"/></item></channel></rss>`;
const shows = {
  illner: { id: 'maybrit-illner', show_name: 'maybrit illner', kind: 'watched', feed: 'https://feeds.example/illner', provider: 'ZDF', min_duration_seconds: 1500 },
  lanz: { id: 'markus-lanz', show_name: 'Markus Lanz', kind: 'watched', feed: 'https://feeds.example/lanz', match: '^Markus Lanz', provider: 'MVW', min_duration_seconds: 1500 },
  lp: { id: 'lanz-precht', show_name: 'Lanz + Precht', kind: 'listened', feed: 'https://feeds.example/lp', provider: 'Jule', min_duration_seconds: 900 },
};

test('feed items of the three feed shapes become episodes with page, media, transcript and duration; clips and other shows are dropped', () => {
  const [illner, ...restIllner] = parseEpisodes(zdf, shows.illner);
  assert.equal(restIllner.length, 0, 'a four-minute clip is below the show minimum');
  assert.equal(illner.title, 'Die Denkzettelwahl – was muss sich ändern?'); assert.equal(illner.page, 'https://www.zdf.de/video/talk/maybrit-illner-128/illner-100');
  assert.equal(illner.media, 'https://podfileszdf-a.akamaihd.net/x.mp3'); assert.equal(illner.duration, 3718); assert.equal(illner.published_at, '2026-09-10T20:15:00.000Z');
  assert.ok(illner.summary.startsWith('Mit Armin Laschet und Cem Özdemir'));
  const lanz = parseEpisodes(mvw, shows.lanz);
  assert.equal(lanz.length, 1, 'the Terra X item does not match the show');
  assert.equal(lanz[0].page, 'https://www.zdf.de/video/talk/markus-lanz-114/lanz-102'); assert.equal(lanz[0].media, 'https://nrodlzdf-a.akamaihd.net/lanz.mp4'); assert.equal(lanz[0].guid, 'Xs9R');
  const [lp] = parseEpisodes(jule, shows.lp);
  assert.deepEqual(lp.transcripts.map((t) => t.type), ['text/plain', 'text/vtt']);
  assert.equal(pickTranscript(lp.transcripts).type, 'text/vtt', 'time marks win over plain text');
  assert.equal(pickTranscript([]), null);
  assert.equal(durationSeconds('01:02:03'), 3723); assert.equal(durationSeconds('abc'), null);
  assert.throws(() => parseEpisodes('<!DOCTYPE x><rss/>', shows.lp), /SHOW_FEED_INVALID/);
});

test('only recent episodes are selected, newest first and bounded', () => {
  const episodes = [{ published_at: '2026-09-01T00:00:00.000Z', title: 'alt' }, { published_at: '2026-09-15T00:00:00.000Z', title: 'neu' }, { published_at: '2026-09-12T00:00:00.000Z', title: 'mittel' }, { published_at: '2026-09-20T00:00:00.000Z', title: 'zukunft' }];
  assert.deepEqual(selectNewEpisodes(episodes, now, { maxAgeDays: 7, limit: 5 }).map((e) => e.title), ['neu', 'mittel']);
  assert.deepEqual(selectNewEpisodes(episodes, now, { maxAgeDays: 7, limit: 1 }).map((e) => e.title), ['neu']);
});

test('an episode becomes a regular private request with transcript, and never a position of the author', () => {
  const [lp] = parseEpisodes(jule, shows.lp);
  const transcript = { url: 'https://cdn.jule.example/262.vtt?v=3', type: 'text/vtt', chars: 82232, truncated: false, text: 'WEBVTT\n00:00:22.882 --> 00:00:26.375\nSchönen guten Morgen' };
  const { job, fingerprint } = buildEpisodeRequest(lp, shows.lp, { owner: '1234567890123456', now, transcript });
  assert.ok(JOB_ID.test(job.input.job_id)); assert.equal(job.input.job_type, 'editorial_request'); assert.equal(job.input.request.kind, 'listened'); assert.equal(job.intake.kind, 'listened');
  assert.ok(job.input.request.brief.startsWith('Nachgehört: Lanz + Precht – „#262 (Wenn die Mitte ihre Mehrheit verliert)“ vom 11. September 2026.'));
  assert.ok(job.input.request.brief.includes('origin.transcript')); assert.equal(job.input.request.author_notes, '');
  assert.deepEqual(job.input.request.links, ['https://lanz-precht.example/262', 'https://cdn.jule.example/262.mp3', 'https://cdn.jule.example/262.vtt?v=3']);
  assert.equal(job.input.origin.transcript.chars, 82232); assert.equal(job.input.origin.candidate_version, EPISODE_VERSION);
  assert.match(job.candidate.story_id, /^wt-[a-f0-9]{16}$/); assert.equal(job.intake.trigger_type, 'automatic_episode'); assert.equal(job.input.manual_only, true);
  const [lanz] = parseEpisodes(mvw, shows.lanz);
  const plain = buildEpisodeRequest(lanz, shows.lanz, { owner: '1234567890123456', now }).job;
  assert.equal(plain.input.request.kind, 'watched'); assert.ok(plain.input.request.brief.includes('Ein Transkript liegt nicht bei')); assert.equal('transcript' in plain.input.origin, false);
  assert.notEqual(fingerprint, buildEpisodeRequest(lanz, shows.lanz, { owner: 'x', now }).fingerprint);
});

test('episodes Natalie already requested or published are known by URL', () => {
  const known = knownEpisodeUrls({ editions: [{ sources: ['https://www.zdf.de/video/talk/maybrit-illner-128/illner-100?x=1', { url: 'https://cdn.jule.example/1.mp3' }] }], requests: [{ input: { request: { links: ['https://neu-denken.example/s6e5/'] } } }] });
  assert.ok(known.has('https://www.zdf.de/video/talk/maybrit-illner-128/illner-100')); assert.ok(known.has('https://cdn.jule.example/1.mp3')); assert.ok(known.has('https://neu-denken.example/s6e5'));
});

test('transcripts are fetched with a size cap and html or json are flattened', async () => {
  const long = 'x'.repeat(200000);
  const fetchImpl = async (url) => ({ ok: !/missing/.test(url), text: async () => /json/.test(url) ? JSON.stringify([{ startTime: 1.5, speaker: 'A', body: 'Hallo Welt ' + 'und noch viel mehr Text '.repeat(12) }, { startTime: 3, body: 'Zweiter Satz.' }]) : /html/.test(url) ? `<html><body><p>${'Wort '.repeat(100)}</p></body></html>` : long });
  const vtt = await fetchTranscript({ url: 'https://t.example/a.vtt', type: 'text/vtt' }, fetchImpl);
  assert.equal(vtt.chars, 200000); assert.equal(vtt.truncated, true); assert.equal(vtt.text.length, 150000);
  const html = await fetchTranscript({ url: 'https://t.example/a.html', type: 'text/html' }, fetchImpl);
  assert.ok(!html.text.includes('<p>')); assert.ok(html.text.startsWith('Wort Wort'));
  const json = await fetchTranscript({ url: 'https://t.example/a.json', type: 'application/json' }, fetchImpl);
  assert.ok(json.text.startsWith('1.5 A: Hallo Welt'));
  assert.equal(await fetchTranscript({ url: 'https://t.example/missing.vtt', type: 'text/vtt' }, fetchImpl), null);
  assert.equal(await fetchTranscript(null, fetchImpl), null);
});

function fakeSession({ owner = '1234567890123456', links = [] } = {}) {
  const files = new Map(), observations = new Map();
  const jobs = [{ input: { job_id: 'wt_20260911T062716Z_' + 'a'.repeat(24), job_type: 'editorial_request', request: { links } }, status: 'queued', intake: { owner } }];
  const store = { acquire: async () => {}, release: async () => {}, all: async () => jobs.map((j) => ({ input: { job_id: j.input.job_id, job_type: j.input.job_type }, status: j.status })),
    get: async (id) => jobs.find((j) => j.input.job_id === id) || null, put: async (job) => { jobs.push(job); }, observe: async (k, v) => { observations.set(k, v); }, observation: async (k) => observations.get(k) ?? null };
  const transport = { writeAtomic: async (p, v) => { files.set(p, v); } };
  return { session: { store, transport }, files, observations, jobs };
}
const feeds = { 'https://feeds.example/illner': zdf, 'https://feeds.example/lanz': mvw, 'https://feeds.example/lp': jule };
const fetchImpl = async (url) => ({ ok: url in feeds || /transcript|vtt/.test(url), text: async () => feeds[url] || `WEBVTT\n${'00:00:01.000 --> 00:00:02.000\nText mit Inhalt.\n'.repeat(20)}` });

test('new episodes of the followed shows become requests once, newest first, within the daily cap and never for known episodes', async () => {
  const { session, files, jobs } = fakeSession({ links: ['https://www.zdf.de/video/talk/maybrit-illner-128/illner-100'] });
  const report = await proposeEpisodeCandidates({ session, root: '/nonexistent', now, env: {}, fetchImpl, shows: Object.values(shows), limit: 5, maxPerDay: 5, maxAgeDays: 7 });
  assert.equal(report.status, 'ok'); assert.equal(report.fresh_episodes, 2, 'Illner is known, Lanz and Lanz+Precht are new');
  assert.deepEqual(report.proposed.map((p) => [p.show_id, p.kind]), [['lanz-precht', 'listened'], ['markus-lanz', 'watched']]);
  assert.equal(report.proposed[0].transcript_chars > 0, true); assert.equal(report.proposed[0].transcript_origin, 'provider_transcript'); assert.equal(report.proposed[1].transcript_chars, 0);
  assert.equal(jobs.length, 3); assert.equal(files.size, 2);
  for (const job of jobs.slice(1)) assert.ok(files.has(bridgePath('00_INBOX', `${job.input.job_id}.input.json`)));
  const again = await proposeEpisodeCandidates({ session, root: '/nonexistent', now, env: {}, fetchImpl, shows: Object.values(shows), limit: 5, maxPerDay: 5 });
  assert.deepEqual(again.proposed, [], 'each episode is proposed once');
  const capped = fakeSession();
  const first = await proposeEpisodeCandidates({ session: capped.session, root: '/nonexistent', now, env: {}, fetchImpl, shows: Object.values(shows), limit: 1, maxPerDay: 1 });
  assert.equal(first.proposed.length, 1); assert.equal(first.proposed[0].show_id, 'lanz-precht', 'newest first');
  const second = await proposeEpisodeCandidates({ session: capped.session, root: '/nonexistent', now, env: {}, fetchImpl, shows: Object.values(shows), limit: 1, maxPerDay: 1 });
  assert.equal(second.status, 'daily_limit');
  const noOwner = fakeSession({ owner: 'unknown' });
  assert.equal((await proposeEpisodeCandidates({ session: noOwner.session, root: '/nonexistent', now, env: {}, fetchImpl, shows: Object.values(shows) })).status, 'owner_unknown');
  const broken = await proposeEpisodeCandidates({ session: fakeSession().session, root: '/nonexistent', now, env: {}, fetchImpl: async () => ({ ok: false, status: 503 }), shows: Object.values(shows) });
  assert.equal(broken.feed_errors.length, 3); assert.deepEqual(broken.proposed, []);
});

test('feed titles carry the format label exactly once', () => {
  assert.equal(labelledTitle({ format: 'approved_editorial', subtype: 'watched', title: 'Nachgesehen: Die Denkzettelwahl' }), 'Nachgesehen: Die Denkzettelwahl');
  assert.equal(labelledTitle({ format: 'approved_editorial', subtype: 'listened', title: 'Gute Bildung' }), 'Nachgehört: Gute Bildung');
});

const mediathekRows = () => [
  { title: 'Thema und Gäste "maybrit illner" 10. September 2026', timestamp: 1789071300, duration: 25, url_website: 'https://www.zdf.de/video/talk/vorschau-100.html', url_video: 'https://cdn.example/vorschau.mp4', url_subtitle: '', id: 'a' },
  { title: 'Die Denkzettelwahl – was muss sich ändern? - "maybrit illner" vom 10. September 2026 (S2026/E25) (Gebärdensprache)', timestamp: 1789071300, duration: 3718, url_website: 'https://www.zdf.de/video/talk/illner-100', url_video: 'https://cdn.example/illner-dgs.mp4', url_subtitle: '', id: 'b' },
  { title: 'Die Denkzettelwahl – was muss sich ändern? - "maybrit illner" vom 10. September 2026 (S2026/E25)', timestamp: 1789071300, duration: 3718, description: 'Mit Armin Laschet und Cem Özdemir.', url_website: 'https://www.zdf.de/video/talk/illner-100', url_video_low: 'https://cdn.example/illner-low.mp4', url_video: 'https://cdn.example/illner.mp4', url_subtitle: 'https://utstreaming.zdf.de/mtt/illner.xml', id: 'c' },
];
const illner = { id: 'maybrit-illner', show_name: 'maybrit illner', kind: 'watched', mediathek: { title: 'maybrit illner', channel: 'ZDF' }, provider: 'ZDF-Mediathek', min_duration_seconds: 1500 };

test('die Mediathek-Abfrage führt Barrierefreiheitsfassungen zusammen und wählt die Folge mit amtlichen Untertiteln', () => {
  const episodes = mediathekEpisodes(mediathekRows(), illner);
  assert.equal(episodes.length, 1, 'Vorschauclip fällt unter die Mindestdauer, Gebärdenfassung ist dieselbe Folge');
  const [episode] = episodes;
  assert.equal(episode.subtitle_url, 'https://utstreaming.zdf.de/mtt/illner.xml');
  assert.equal(episode.title.endsWith('(S2026/E25)'), true, 'die Kennzeichnung steht nicht im Titel');
  assert.equal(episode.media, 'https://cdn.example/illner-low.mp4', 'kleine Fassung genügt für die Tonspur');
  assert.equal(episode.page, 'https://www.zdf.de/video/talk/illner-100');
  assert.equal(episode.published_at, new Date(1789071300 * 1000).toISOString());
  assert.equal(episode.duration, 3718); assert.ok(episode.summary.startsWith('Mit Armin Laschet'));
  assert.equal(episodeKey('Titel (Gebärdensprache)', 7), episodeKey('Titel', 7));
  assert.equal(episodeKey('Titel (Hörfassung)', 7), episodeKey('Titel  ', 7));
  assert.notEqual(episodeKey('Titel', 7), episodeKey('Titel', 8));
  const body = JSON.parse(mediathekQueryBody(illner));
  assert.deepEqual(body.queries, [{ fields: ['title'], query: 'maybrit illner' }, { fields: ['channel'], query: 'ZDF' }]);
  assert.equal(body.future, false); assert.equal(body.sortBy, 'timestamp');
  const root = fileURLToPath(new URL('../../', import.meta.url));
  assert.ok(loadShows(root).every((show) => show.mediathek || /^https:\/\//.test(show.feed)), 'jede Sendung hat eine Quelle');
});

test('amtliche Untertitel werden als Wortlaut mit Zeitmarken gelesen, in EBU-TT, VTT und SRT', async () => {
  const ebu = `<?xml version="1.0"?><tt:tt xmlns:tt="http://www.w3.org/ns/ttml"><tt:body><tt:div>
    <tt:p xml:id="s0" begin="00:00:01.080" end="00:00:04.000">FB: Erster <tt:span>Satz</tt:span>.</tt:p>
    <tt:p xml:id="s1" begin="00:27:32.400" end="00:27:36.000">Zweiter Satz<tt:br/>mit Umbruch &amp; Zeichen.</tt:p>
    </tt:div></tt:body></tt:tt>`;
  const parsed = parseSubtitleTrack(ebu, 'x.xml');
  assert.equal(parsed.format, 'ebu-tt');
  assert.deepEqual(parsed.segments, [{ start: 1.08, text: 'FB: Erster Satz.' }, { start: 1652.4, text: 'Zweiter Satz mit Umbruch & Zeichen.' }]);
  assert.equal(buildTranscriptText(parsed.segments).text, '00:00:01 FB: Erster Satz.\n00:27:32 Zweiter Satz mit Umbruch & Zeichen.');
  assert.equal(parseSubtitleTrack('WEBVTT\n\n00:00:02.000 --> 00:00:03.000\nHallo.').format, 'vtt');
  assert.equal(parseSubtitleTrack('1\n00:00:02,000 --> 00:00:03,000\nHallo.').format, 'srt');
  assert.throws(() => parseSubtitleTrack('<html><body>Fehlerseite</body></html>'), /SUBTITLE_FORMAT_UNKNOWN/);
  assert.equal(subtitleSeconds('01:02:03.400'), 3723.4); assert.equal(subtitleSeconds('02:03'), 123); assert.equal(subtitleSeconds('nichts'), null);
  assert.equal(timecode(3725.9), '01:02:05');
  const long = Array.from({ length: 40 }, (_, i) => `<tt:p begin="00:00:${String(i).padStart(2, '0')}.000">${'Wort '.repeat(30)}</tt:p>`).join('');
  const track = await fetchSubtitleTranscript('https://utstreaming.example/a.xml', async () => ({ ok: true, text: async () => `<tt:tt>${long}</tt:tt>` }));
  assert.equal(track.origin, 'accessibility_subtitles'); assert.equal(track.type, 'subtitles/ebu-tt'); assert.equal(track.cost_usd, 0);
  assert.ok(track.chars > 400 && track.segments === 40);
  assert.equal(await fetchSubtitleTranscript('https://utstreaming.example/leer.xml', async () => ({ ok: true, text: async () => '<tt:tt><tt:p begin="00:00:01.000">Kurz.</tt:p></tt:tt>' })), null, 'zu kurz zählt nicht');
  assert.equal(await fetchSubtitleTranscript('http://unsicher.example/a.xml', async () => assert.fail('darf nicht abrufen')), null);
  assert.equal(await fetchSubtitleTranscript(null), null);
  assert.equal(audioSourceFor({ media: 'https://cdn.example/a.mp4' }), 'https://cdn.example/a.mp4');
  assert.equal(audioSourceFor({ page: 'https://zdf.example/seite' }), null);
});

test('ohne Wortlaut wartet die Folge auf die Untertitel, danach greift die eigene Abschrift', async () => {
  const now = '2026-09-16T06:00:00.000Z';
  const fresh = { title: 'Markus Lanz vom 15. September 2026', timestamp: Math.floor(Date.parse('2026-09-15T20:45:00Z') / 1000), duration: 4611,
    url_website: 'https://www.zdf.de/video/talk/lanz-99', url_video_low: 'https://cdn.example/lanz.mp4', url_subtitle: '', id: 'neu' };
  const old = { ...fresh, title: 'Markus Lanz vom 8. September 2026', timestamp: Math.floor(Date.parse('2026-09-08T21:15:00Z') / 1000), id: 'alt' };
  const lanz = { id: 'markus-lanz', show_name: 'Markus Lanz', kind: 'watched', mediathek: { title: 'Markus Lanz', channel: 'ZDF' }, provider: 'ZDF-Mediathek', min_duration_seconds: 1500 };
  const session = fakeSession();
  const fetchImpl = async (url, init) => init?.method === 'POST'
    ? { ok: true, json: async () => ({ result: { results: [fresh, old] } }) }
    : { ok: false, status: 404, text: async () => '' };
  const transcribed = [];
  const transcribeImpl = async (episode) => { transcribed.push(episode.title); return { url: episode.media, type: 'machine_transcript/de', origin: 'openai_whisper', segments: 800, chars: 40000, cost_usd: 0.28, text: '00:00:01 Guten Abend.' }; };
  const report = await proposeEpisodeCandidates({ session: session.session, root: '/nonexistent', now, env: {}, fetchImpl, shows: [lanz], limit: 3, maxPerDay: 5, maxAgeDays: 9, transcribeImpl, subtitleWaitHours: 18, maxTranscriptsPerDay: 2 });
  assert.deepEqual(report.waiting_for_subtitles.map((w) => w.title), ['Markus Lanz vom 15. September 2026'], 'die junge Folge wartet auf die Untertitel');
  assert.deepEqual(transcribed, ['Markus Lanz vom 8. September 2026'], 'die ältere Folge wird selbst transkribiert');
  assert.deepEqual(report.proposed.map((p) => [p.title, p.transcript_origin, p.transcript_cost_usd]), [['Markus Lanz vom 8. September 2026', 'openai_whisper', 0.28]]);
  assert.equal(report.transcribed_today, 1); assert.equal(report.transcript_cost_today_usd, 0.28);
  const brief = session.jobs.at(-1).input.request.brief;
  assert.ok(brief.includes('eigene maschinelle Abschrift'), brief.slice(0, 200));
  const capped = await proposeEpisodeCandidates({ session: fakeSession().session, root: '/nonexistent', now, env: {}, fetchImpl, shows: [lanz], limit: 3, maxPerDay: 5, maxAgeDays: 9, transcribeImpl, transcribe: false, subtitleWaitHours: 18 });
  assert.deepEqual(capped.proposed.map((p) => p.transcript_chars), [0], 'ohne Transkription wird die alte Folge ohne Wortlaut eingereiht');
});

test('liegen amtliche Untertitel vor, wird nichts transkribiert und der Auftrag nennt sie verbindlich', async () => {
  const now = '2026-09-16T06:00:00.000Z';
  const session = fakeSession();
  const rows = mediathekRows().map((row) => ({ ...row, timestamp: Math.floor(Date.parse('2026-09-15T18:00:00Z') / 1000) }));
  const track = `<tt:tt>${Array.from({ length: 30 }, (_, i) => `<tt:p begin="00:0${i % 10}:00.000">${'Aussage '.repeat(12)}</tt:p>`).join('')}</tt:tt>`;
  const fetchImpl = async (url, init) => init?.method === 'POST'
    ? { ok: true, json: async () => ({ result: { results: rows } }) }
    : { ok: true, text: async () => track };
  let transcribeCalls = 0;
  const report = await proposeEpisodeCandidates({ session: session.session, root: '/nonexistent', now, env: {}, fetchImpl, shows: [illner], limit: 2, maxPerDay: 5, maxAgeDays: 7,
    transcribeImpl: async () => { transcribeCalls += 1; return null; }, subtitleWaitHours: 18 });
  assert.equal(transcribeCalls, 0, 'amtliche Untertitel schlagen die eigene Abschrift');
  assert.deepEqual(report.proposed.map((p) => p.transcript_origin), ['accessibility_subtitles']);
  assert.equal(report.proposed[0].transcript_cost_usd, 0);
  assert.equal(report.transcribed_today, 0);
  const job = session.jobs.at(-1).input;
  assert.ok(job.request.brief.includes('amtlichen Untertitel'), job.request.brief.slice(0, 240));
  assert.equal(job.origin.transcript.origin, 'accessibility_subtitles');
  assert.ok(job.request.links.includes('https://utstreaming.zdf.de/mtt/illner.xml'));
});

test('eine ohne Wortlaut eingereihte Folge wird genau einmal erneut eingereiht, sobald der Wortlaut vorliegt', async () => {
  const lanz = { id: 'markus-lanz', show_name: 'Markus Lanz', kind: 'watched', mediathek: { title: 'Markus Lanz', channel: 'ZDF' }, provider: 'ZDF-Mediathek', min_duration_seconds: 1500 };
  const row = { title: 'Markus Lanz vom 15. September 2026', timestamp: Math.floor(Date.parse('2026-09-15T20:45:00Z') / 1000), duration: 4611,
    url_website: 'https://www.zdf.de/video/talk/lanz-99', url_video_low: 'https://cdn.example/lanz.mp4', url_subtitle: '', id: 'lanz99' };
  const session = fakeSession();
  const track = `<tt:tt>${Array.from({ length: 30 }, (_, i) => `<tt:p begin="00:1${i % 10}:00.000">${'Aussage '.repeat(12)}</tt:p>`).join('')}</tt:tt>`;
  const feed = (rows) => async (url, init) => init?.method === 'POST' ? { ok: true, json: async () => ({ result: { results: rows } }) } : { ok: true, text: async () => track };
  const options = { session: session.session, root: '/nonexistent', env: {}, shows: [lanz], limit: 2, maxPerDay: 5, maxAgeDays: 7, transcribe: false, subtitleWaitHours: 18 };
  // Erster Auftrag ohne Untertitel, nach dem Wartefenster.
  const first = await proposeEpisodeCandidates({ ...options, now: '2026-09-16T20:00:00.000Z', fetchImpl: feed([row]) });
  assert.deepEqual(first.proposed.map((p) => [p.show_id, p.transcript_origin]), [['markus-lanz', null]]);
  const key = Object.keys(Object.fromEntries(session.observations)).find((k) => k.startsWith('github-episode:markus-lanz:'));
  assert.equal(session.observations.get(key).transcript_origin, null);
  // Ein Vermerk aus der Zeit vor dieser Regel kennt das Feld nicht.
  const legacy = fakeSession();
  legacy.observations.set(Object.keys(Object.fromEntries(session.observations)).find((k) => k.startsWith('github-episode:markus-lanz:')),
    { job_id: 'wt_20260916T052520Z_' + 'a'.repeat(24), at: '2026-09-16T05:25:20.000Z', version: 'sendungs-kandidaten-1', title: 'Markus Lanz vom 15. September 2026' });
  const legacyRun = await proposeEpisodeCandidates({ ...options, session: legacy.session, now: '2026-09-17T06:00:00.000Z', fetchImpl: feed([{ ...row, url_subtitle: 'https://utstreaming.zdf.de/mtt/lanz99.xml' }]) });
  assert.deepEqual(legacyRun.proposed.map((p) => p.transcript_origin), ['accessibility_subtitles'], 'ein Altvermerk ohne Feld gilt als ohne Wortlaut');
  // Ohne Wortlaut bleibt es dabei.
  const again = await proposeEpisodeCandidates({ ...options, now: '2026-09-16T21:00:00.000Z', fetchImpl: feed([row]) });
  assert.deepEqual(again.proposed, []);
  assert.deepEqual(again.waiting_for_subtitles.map((w) => w.retry), [true], 'die Folge wartet weiter auf den Wortlaut');
  // Sobald die Untertitel da sind, genau ein zweiter Auftrag.
  const withSubtitles = [{ ...row, url_subtitle: 'https://utstreaming.zdf.de/mtt/lanz99.xml' }];
  const second = await proposeEpisodeCandidates({ ...options, now: '2026-09-17T06:00:00.000Z', fetchImpl: feed(withSubtitles) });
  assert.deepEqual(second.proposed.map((p) => p.transcript_origin), ['accessibility_subtitles']);
  assert.notEqual(session.jobs.at(-1).input.job_id, session.jobs.at(-2).input.job_id, 'eigener Auftrag, kein Überschreiben');
  assert.ok(session.jobs.at(-1).input.request.brief.includes('Erneuter Auftrag'));
  assert.equal(session.observations.get(key).retried_with_transcript, true);
  const third = await proposeEpisodeCandidates({ ...options, now: '2026-09-17T08:00:00.000Z', fetchImpl: feed(withSubtitles) });
  assert.deepEqual(third.proposed, [], 'kein dritter Auftrag');
  assert.deepEqual(third.waiting_for_subtitles, []);
});

test('ein Wiederholungsversuch nimmt nach dem Wartefenster die eigene Abschrift', async () => {
  const lanz = { id: 'markus-lanz', show_name: 'Markus Lanz', kind: 'watched', mediathek: { title: 'Markus Lanz', channel: 'ZDF' }, provider: 'ZDF-Mediathek', min_duration_seconds: 1500 };
  const row = { title: 'Markus Lanz vom 15. September 2026', timestamp: Math.floor(Date.parse('2026-09-15T20:45:00Z') / 1000), duration: 4611,
    url_website: 'https://www.zdf.de/video/talk/lanz-99', url_video_low: 'https://cdn.example/lanz.mp4', url_subtitle: '', id: 'lanz99' };
  const session = fakeSession();
  const fetchImpl = async (url, init) => init?.method === 'POST' ? { ok: true, json: async () => ({ result: { results: [row] } }) } : { ok: true, text: async () => '' };
  let transcribeCalls = 0;
  const transcribeImpl = async (episode) => { transcribeCalls += 1; return { url: episode.media, type: 'machine_transcript/de', origin: 'openai_whisper', segments: 700, chars: 38000, cost_usd: 0.27, text: '00:00:01 Guten Abend.' }; };
  const options = { session: session.session, root: '/nonexistent', env: {}, shows: [lanz], limit: 2, maxPerDay: 5, maxAgeDays: 7, subtitleWaitHours: 12, transcribeImpl, maxTranscriptsPerDay: 2 };
  // Erster Auftrag: ohne Untertitel und ohne eigene Abschrift eingereiht.
  const first = await proposeEpisodeCandidates({ ...options, transcribe: false, now: '2026-09-16T09:00:00.000Z', fetchImpl });
  assert.deepEqual(first.proposed.map((p) => p.transcript_origin), [null]);
  const key = [...session.observations.keys()].find((k) => k.startsWith('github-episode:markus-lanz:'));
  // Im Wartefenster wartet der Wiederholungsversuch.
  const waiting = await proposeEpisodeCandidates({ ...options, now: '2026-09-16T08:00:00.000Z', fetchImpl });
  assert.deepEqual(waiting.proposed, []); assert.equal(transcribeCalls, 0, 'im Wartefenster wird nicht bezahlt');
  assert.deepEqual(waiting.waiting_for_subtitles.map((w) => w.retry), [true]);
  // Nach dem Wartefenster ohne Untertitel greift die eigene Abschrift.
  const second = await proposeEpisodeCandidates({ ...options, now: '2026-09-16T10:00:00.000Z', fetchImpl });
  assert.equal(transcribeCalls, 1);
  assert.deepEqual(second.proposed.map((p) => [p.transcript_origin, p.transcript_cost_usd]), [['openai_whisper', 0.27]]);
  assert.equal(session.observations.get(key).retried_with_transcript, true);
  assert.ok(session.jobs.at(-1).input.request.brief.includes('Erneuter Auftrag'));
  // Bleibt auch die eigene Abschrift aus, wartet die Folge statt erneut ohne Wortlaut zu laufen.
  const dry = fakeSession();
  dry.observations.set(key, { job_id: 'wt_20260916T052520Z_' + 'a'.repeat(24), at: '2026-09-16T05:25:20.000Z', version: 'sendungs-kandidaten-1', title: row.title, transcript_origin: null });
  const blocked = await proposeEpisodeCandidates({ ...options, session: dry.session, now: '2026-09-16T10:00:00.000Z', fetchImpl, transcribeImpl: async () => null });
  assert.deepEqual(blocked.proposed, []);
  assert.deepEqual(blocked.waiting_for_subtitles.map((w) => w.reason), ['ohne Wortlaut']);
});

test('Lanz wartet bis 14:00 des Folgetags auf die amtlichen Untertitel, danach greift die eigene Abschrift', async () => {
  const { transcriptDeadline, berlinOffsetMinutes, loadShows } = await import('../../scripts/news/sendungs-kandidaten.mjs');
  // Sommerzeit und Winterzeit: der Stichtag ist Berliner Wanduhrzeit.
  assert.equal(transcriptDeadline('2026-09-15T20:45:00.000Z', { day_offset: 1, berlin_hour: 14 }), '2026-09-16T12:00:00.000Z');
  assert.equal(transcriptDeadline('2026-09-15T21:15:00.000Z', { day_offset: 1, berlin_hour: 14 }), '2026-09-16T12:00:00.000Z');
  assert.equal(transcriptDeadline('2026-12-15T22:00:00.000Z', { day_offset: 1, berlin_hour: 14 }), '2026-12-16T13:00:00.000Z');
  assert.equal(transcriptDeadline('2026-09-15T20:45:00.000Z', null), null, 'ohne Regel gilt das Stundenfenster');
  assert.equal(transcriptDeadline('kein Datum', { day_offset: 1 }), null);
  assert.equal(berlinOffsetMinutes(Date.parse('2026-09-16T09:00:00Z')), 120);
  assert.equal(berlinOffsetMinutes(Date.parse('2026-01-16T09:00:00Z')), 60);
  // Die Sendung trägt den Stichtag in der Senderliste.
  const lanzConfig = loadShows(new URL('../../', import.meta.url).pathname).find((show) => show.id === 'markus-lanz');
  assert.deepEqual(lanzConfig.transcript_deadline, { day_offset: 1, berlin_hour: 14 });

  const lanz = { id: 'markus-lanz', show_name: 'Markus Lanz', kind: 'watched', mediathek: { title: 'Markus Lanz', channel: 'ZDF' }, provider: 'ZDF-Mediathek', min_duration_seconds: 1500,
    transcript_deadline: { day_offset: 1, berlin_hour: 14 } };
  const row = { title: 'Markus Lanz vom 15. September 2026', timestamp: Math.floor(Date.parse('2026-09-15T20:45:00Z') / 1000), duration: 4611,
    url_website: 'https://www.zdf.de/video/talk/lanz-99', url_video_low: 'https://cdn.example/lanz.mp4', url_subtitle: '', id: 'lanz99' };
  const fetchImpl = async (url, init) => init?.method === 'POST' ? { ok: true, json: async () => ({ result: { results: [row] } }) } : { ok: true, text: async () => '' };
  let transcribed = 0;
  const transcribeImpl = async (episode) => { transcribed += 1; return { url: episode.media, type: 'machine_transcript/de', origin: 'openai_whisper', segments: 700, chars: 38000, cost_usd: 0.27, text: '00:00:01 Guten Abend.' }; };
  const options = { root: '/nonexistent', env: {}, shows: [lanz], limit: 2, maxPerDay: 5, maxAgeDays: 7, subtitleWaitHours: 12, transcribeImpl, maxTranscriptsPerDay: 2 };
  // Das alte Zwölf-Stunden-Fenster wäre um 08:45 UTC abgelaufen; der Stichtag gilt.
  const early = await proposeEpisodeCandidates({ ...options, session: fakeSession().session, now: '2026-09-16T09:30:00.000Z', fetchImpl });
  assert.deepEqual(early.proposed, []);
  assert.equal(transcribed, 0, 'vor dem Stichtag wird nicht bezahlt');
  assert.deepEqual(early.waiting_for_subtitles.map((w) => w.deadline), ['2026-09-16T12:00:00.000Z']);
  // Nach dem Stichtag greift die eigene Abschrift.
  const late = await proposeEpisodeCandidates({ ...options, session: fakeSession().session, now: '2026-09-16T12:05:00.000Z', fetchImpl });
  assert.equal(transcribed, 1);
  assert.deepEqual(late.proposed.map((p) => p.transcript_origin), ['openai_whisper']);
});

test('scheitert der direkte Zugriff auf die Mediathek, wird die Datei geholt und lokal umgewandelt', async () => {
  const { extractAudio, downloadMedia, MEDIA_USER_AGENT } = await import('../../scripts/news/sendungs-transkript.mjs');
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-audio-test-'));
  // Erster Versuch direkt auf der Adresse, zweiter auf der geholten Datei.
  const calls = [];
  const exec = async (file, args) => {
    calls.push(args[args.indexOf('-i') + 1]);
    if (calls.length === 1) throw Object.assign(new Error('MEDIA_TRANSCODE_FAILED'), { detail: 'Server returned 403 Forbidden' });
    fs.writeFileSync(args.at(-1), Buffer.alloc(2048, 1));
    return { stdout: '', stderr: '' };
  };
  const fetched = [];
  const fetchImpl = async (url, options) => { fetched.push([url, options.headers['User-Agent']]); return { ok: true, headers: { get: () => '2048' }, arrayBuffer: async () => new Uint8Array(2048).buffer }; };
  const result = await extractAudio('https://rodlzdf-a.example/lanz.mp4', { dir, exec, fetchImpl });
  assert.equal(result.downloaded, true);
  assert.equal(result.size, 2048);
  assert.equal(calls.length, 2);
  assert.equal(calls[0], 'https://rodlzdf-a.example/lanz.mp4');
  assert.ok(calls[1].endsWith('source.media'), calls[1]);
  assert.deepEqual(fetched, [['https://rodlzdf-a.example/lanz.mp4', MEDIA_USER_AGENT]]);
  assert.equal(fs.existsSync(path.join(dir, 'source.media')), false, 'die geholte Datei wird aufgeräumt');
  // Der direkte Weg bleibt der Regelfall und holt nichts.
  const straight = await extractAudio('https://rodlzdf-a.example/ok.mp4', { dir: fs.mkdtempSync(path.join(os.tmpdir(), 'woek-audio-test-')),
    exec: async (file, args) => { fs.writeFileSync(args.at(-1), Buffer.alloc(64, 1)); return { stdout: '', stderr: '' }; },
    fetchImpl: async () => assert.fail('kein Download nötig') });
  assert.equal(straight.downloaded, false);
  // Scheitern beide Wege, nennt der Fehler beide Gründe.
  await assert.rejects(() => extractAudio('https://rodlzdf-a.example/kaputt.mp4', { dir: fs.mkdtempSync(path.join(os.tmpdir(), 'woek-audio-test-')),
    exec: async () => { throw Object.assign(new Error('MEDIA_TRANSCODE_FAILED'), { detail: 'moov atom not found' }); }, fetchImpl }),
    (error) => /direkt: moov atom not found/.test(error.detail) && /nach Download: moov atom not found/.test(error.detail));
  // Eine zu große Datei wird nicht geholt.
  await assert.rejects(() => downloadMedia('https://rodlzdf-a.example/riesig.mp4', path.join(dir, 'x'), { fetchImpl: async () => ({ ok: true, headers: { get: () => String(5 * 1024 * 1024 * 1024) } }) }),
    /MEDIA_DOWNLOAD_TOO_LARGE/);
  await assert.rejects(() => downloadMedia('https://rodlzdf-a.example/weg.mp4', path.join(dir, 'x'), { fetchImpl: async () => ({ ok: false, status: 404, headers: { get: () => null } }) }),
    /MEDIA_DOWNLOAD_FAILED/);
});
