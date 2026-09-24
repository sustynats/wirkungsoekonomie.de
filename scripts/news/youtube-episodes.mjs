// Public channel feeds and public watch-page metadata only. No login, proxy,
// cookies, paid transcript service or download of the video. Access failures
// stay visible source gaps; they are never treated as usable transcripts.
import { decodeXml } from './lib.mjs';
import { buildTranscriptText } from './sendungs-transkript.mjs';

export function episodeUrlKey(value) {
  try {
    const u = new URL(value);
    const host = u.hostname.replace(/^www\./, '');
    const id = host === 'youtu.be' ? u.pathname.slice(1) : host === 'youtube.com'
      ? (u.searchParams.get('v') || u.pathname.match(/^\/(?:live|shorts)\/([^/]+)/)?.[1]) : null;
    if (id && /^[\w-]{11}$/.test(id)) return `https://www.youtube.com/watch?v=${id}`;
    return String(value).replace(/[?#].*$/, '').replace(/\/$/, '');
  } catch { return ''; }
}

const text = (s) => decodeXml(String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')).replace(/<[^>]+>/g, ' ').trim();
const tag = (s, name) => text(s.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1]);
export function parseYouTubeFeed(xml, show) {
  if (typeof xml !== 'string' || /<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('YOUTUBE_FEED_INVALID');
  return [...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/g)].flatMap(([, body]) => {
    const id = tag(body, 'yt:videoId'), title = tag(body, 'title'), date = Date.parse(tag(body, 'published'));
    if (!/^[\w-]{11}$/.test(id) || !title || !Number.isFinite(date)) return [];
    if (/(?:^|\s|#)(?:shorts?|trailer|teaser|vorschau|ausschnitt|highlight)(?:\b|:)/i.test(title)) return [];
    return [{ show_id: show.id, title, page: `https://www.youtube.com/watch?v=${id}`, media: '', guid: `youtube:${id}`,
      summary: tag(body, 'media:description').slice(0, 4000), published_at: new Date(date).toISOString(), duration: null, transcripts: [] }];
  });
}

// Read one balanced JSON value from the public response, never eval script.
export function jsonValueAfter(html, marker) {
  const offset = html.indexOf(marker);
  if (offset < 0) return null;
  const tail = html.slice(offset + marker.length).trimStart();
  let depth = 0, string = false, escaped = false;
  for (let i = 0; i < tail.length; i++) {
    const c = tail[i];
    if (string) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === '"') string = false; continue; }
    if (c === '"') string = true;
    else if (c === '{' || c === '[') depth++;
    else if (c === '}' || c === ']') { if (--depth === 0) { try { return JSON.parse(tail.slice(0, i + 1)); } catch { return null; } } }
  }
  return null;
}

async function readPublic(url, fetchImpl) {
  const response = await fetchImpl(url, { signal: AbortSignal.timeout(20000), redirect: 'error', headers: { 'User-Agent': 'Wirkungsticker/1.0 (+https://wirkungsoekonomie.de/wirkungsticker/)' } });
  if (!response.ok) throw new Error(`YOUTUBE_SOURCE_HTTP_${response.status}`);
  const body = await response.text();
  if (body.length > 5000000) throw new Error('YOUTUBE_SOURCE_TOO_LARGE');
  return body;
}

export async function inspectYouTubeEpisode(episode, show, fetchImpl = fetch) {
  const body = await readPublic(episode.page, fetchImpl);
  const player = jsonValueAfter(body, 'var ytInitialPlayerResponse = ');
  const details = player?.videoDetails;
  const id = new URL(episode.page).searchParams.get('v');
  if (player?.playabilityStatus?.status !== 'OK' || details?.videoId !== id) throw new Error('YOUTUBE_EPISODE_UNAVAILABLE');
  const duration = Number(details.lengthSeconds);
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('YOUTUBE_DURATION_MISSING');
  if (details.channelId !== show.youtube_channel_id) throw new Error('YOUTUBE_CHANNEL_MISMATCH');
  if (details.isLiveContent && player?.microformat?.playerMicroformatRenderer?.liveBroadcastDetails?.isLiveNow) return null;
  if (duration < (show.min_duration_seconds || 900)) return null;
  const tracks = player?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  const track = tracks.filter((t) => /^de(?:-|$)/.test(t.languageCode || '')).sort((a, b) => Number(a.kind === 'asr') - Number(b.kind === 'asr'))[0];
  return { ...episode, duration, youtube_caption: track ? { url: track.baseUrl, automatic: track.kind === 'asr' } : null };
}

export async function fetchYouTubeTranscript(episode, fetchImpl = fetch) {
  if (!episode?.youtube_caption?.url) return null;
  try {
    const url = new URL(episode.youtube_caption.url);
    if (url.protocol !== 'https:' || url.hostname !== 'www.youtube.com' || url.pathname !== '/api/timedtext'
      || url.searchParams.get('v') !== new URL(episode.page).searchParams.get('v')) return null;
    url.searchParams.set('fmt', 'json3');
    const body = await readPublic(url.href, fetchImpl);
    if (!body.trim()) return null;
    const json = JSON.parse(body);
    const segments = (json.events || []).filter((e) => Number.isFinite(e.tStartMs) && Array.isArray(e.segs))
      .map((e) => ({ start: e.tStartMs / 1000, text: e.segs.map((s) => s.utf8 || '').join('') }));
    const built = buildTranscriptText(segments);
    if (built.chars < 400 || built.truncated) return null;
    // Store a stable source URL, never an expiring signed caption URL.
    return { ...built, url: episode.page, type: 'subtitles/youtube', origin: episode.youtube_caption.automatic ? 'youtube_auto_captions' : 'youtube_publisher_captions', cost_usd: 0 };
  } catch { return null; }
}

export const comparableEpisodeTitle = (title, show) => String(title).toLowerCase()
  .replace(String(show.show_name).toLowerCase(), '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
export function matchingPodcastEpisode(video, episodes, show) {
  const title = comparableEpisodeTitle(video.title, show);
  return episodes.find((e) => title.length >= 15 && comparableEpisodeTitle(e.title, show) === title
    && Math.abs(Date.parse(e.published_at) - Date.parse(video.published_at)) <= 36 * 3600000
    && e.duration > 0 && Math.abs(e.duration - video.duration) < 300) || null;
}
