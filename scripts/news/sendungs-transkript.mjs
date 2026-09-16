// Eigene Transkription der verfolgten Sendungen, wenn der Anbieter keines
// liefert. Ein Nachgesehen-Beitrag braucht den Originalwortlaut mit Zeitmarken
// (so sind alle bisherigen Ausgaben gebaut); ohne Transkript antwortet das
// Redaktionsprofil vertragsgemäß mit SOURCE_VERIFICATION_REQUIRED, und der
// Auftrag bleibt liegen (16.09.: Markus Lanz vom 15.09.). Die Audiospur wird
// aus der Mediendatei gezogen, auf 16 kHz mono reduziert und einmal
// transkribiert; das Ergebnis reist als Auftragsgrundlage mit und wird nie
// veröffentlicht (kein Spiegeln fremder Volltranskripte).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';

// Barrierefreiheit zuerst: ARD und ZDF veröffentlichen amtliche Untertitel für
// Hörgeschädigte (EBU-TT/TTML, teils WebVTT oder SRT). Sie sind genauer als
// jede Maschinenabschrift, kostenlos und tragen Zeitmarken und oft
// Sprecherkürzel. Sie sind daher die erste Wahl für Nachgesehen-Beiträge; eine
// eigene Spracherkennung bleibt die letzte Stufe.
const entities = (value) => String(value)
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#3[49];|&apos;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const plain = (value) => entities(String(value).replace(/<[a-zA-Z:]*br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
export function subtitleSeconds(stamp) {
  const match = String(stamp || '').trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{1,2})(?:[.,](\d{1,3}))?$/);
  if (!match) return null;
  const [, hours, minutes, seconds, fraction] = match;
  return Number(hours || 0) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(`0.${fraction || 0}`);
}

// Ein Abschnitt je Untertitelzeile; aufeinanderfolgende Zeilen mit gleicher
// Sekunde werden zusammengefasst, damit die Zeitmarken lesbar bleiben.
export function parseSubtitleTrack(body, url = '') {
  const text = String(body || '');
  const rows = [];
  if (/<tt:p|<p[^>]*\bbegin=|<tt\b|<tt:tt/i.test(text)) {
    for (const match of text.matchAll(/<(?:tt:)?p\b[^>]*\bbegin="([^"]+)"[^>]*>([\s\S]*?)<\/(?:tt:)?p>/gi)) {
      const start = subtitleSeconds(match[1]), value = plain(match[2]);
      if (start !== null && value) rows.push({ start, text: value });
    }
    if (rows.length) return { format: 'ebu-tt', segments: rows };
  }
  if (/^\uFEFF?WEBVTT/i.test(text.trim()) || /-->/.test(text)) {
    const blocks = text.replace(/\r/g, '').split(/\n\s*\n/);
    for (const block of blocks) {
      const cue = block.match(/(\d{1,2}:\d{2}(?::\d{2})?[.,]\d{1,3}|\d{1,2}:\d{2}:\d{2})\s*-->/);
      if (!cue) continue;
      const start = subtitleSeconds(cue[1]);
      const value = plain(block.split(/-->[^\n]*\n/).slice(1).join('\n'));
      if (start !== null && value) rows.push({ start, text: value });
    }
    if (rows.length) return { format: /^\uFEFF?WEBVTT/i.test(text.trim()) ? 'vtt' : 'srt', segments: rows };
  }
  throw Object.assign(new Error('SUBTITLE_FORMAT_UNKNOWN'), { url, head: text.slice(0, 80) });
}

export async function fetchSubtitleTranscript(url, fetchImpl = fetch, timeoutMs = 30000) {
  if (typeof url !== 'string' || !/^https:\/\//.test(url)) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0 (Wirkungsticker Redaktionsworker)' } });
    if (!response.ok) return null;
    const parsed = parseSubtitleTrack(await response.text(), url);
    const built = buildTranscriptText(parsed.segments);
    if (built.chars < 400) return null;
    return { url, type: `subtitles/${parsed.format}`, origin: 'accessibility_subtitles', segments: built.segments,
      chars: built.chars, truncated: built.truncated, cost_usd: 0, text: built.text };
  } catch { return null; } finally { clearTimeout(timer); }
}

export const TRANSCRIBE_MODEL = 'whisper-1';
export const TRANSCRIBE_URL = 'https://api.openai.com/v1/audio/transcriptions';
// Anbietergrenze 25 MB je Datei; 32 kbit/s mono deckt rund zwei Stunden ab.
export const AUDIO_BITRATE = '32k', AUDIO_MAX_BYTES = 24 * 1024 * 1024;
export const TRANSCRIBE_USD_PER_MINUTE = 0.006;

export function audioSourceFor(episode) {
  const candidates = [episode?.media, episode?.page].filter((url) => typeof url === 'string' && /^https:\/\//.test(url));
  return candidates.find((url) => /\.(mp3|m4a|aac|mp4|m3u8)(\?|$)/i.test(url)) || null;
}

export const timecode = (seconds) => {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60].map((part) => String(part).padStart(2, '0')).join(':');
};

// Zeitmarke je Segment, damit der Beitrag konkrete Passagen belegen kann.
export function buildTranscriptText(segments, { maxChars = 150000 } = {}) {
  const lines = [];
  for (const segment of Array.isArray(segments) ? segments : []) {
    const body = String(segment?.text || '').replace(/\s+/g, ' ').trim();
    if (!body) continue;
    lines.push(`${timecode(segment.start)} ${body}`);
  }
  const text = lines.join('\n');
  return { text: text.slice(0, maxChars), truncated: text.length > maxChars, chars: text.length, segments: lines.length };
}

const run = (file, args, { timeoutMs = 900000 } = {}) => new Promise((resolve, reject) => {
  execFile(file, args, { timeout: timeoutMs, maxBuffer: 8 * 1024 * 1024 }, (error, stdout, stderr) => {
    if (error) reject(Object.assign(new Error('MEDIA_TRANSCODE_FAILED'), { detail: String(stderr || error.message).slice(-400) }));
    else resolve({ stdout, stderr });
  });
});

// Nur die Tonspur, klein gerechnet: kein Video, mono, 16 kHz.
export async function extractAudio(url, { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-audio-')), ffmpeg = 'ffmpeg', exec = run, timeoutMs } = {}) {
  const output = path.join(dir, 'audio.mp3');
  await exec(ffmpeg, ['-nostdin', '-loglevel', 'error', '-y', '-i', url, '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'libmp3lame', '-b:a', AUDIO_BITRATE, output], { timeoutMs });
  const size = fs.existsSync(output) ? fs.statSync(output).size : 0;
  if (!size) throw Object.assign(new Error('MEDIA_TRANSCODE_EMPTY'), { url });
  if (size > AUDIO_MAX_BYTES) throw Object.assign(new Error('MEDIA_AUDIO_TOO_LARGE'), { size });
  return { file: output, size, dir };
}

export async function transcribeAudioFile(file, { apiKey = process.env.OPENAI_API_KEY, model = TRANSCRIBE_MODEL, fetchImpl = fetch, timeoutMs = 900000, language = 'de' } = {}) {
  if (!apiKey) throw Object.assign(new Error('OPENAI_API_KEY_MISSING'), { providerNotCalled: true });
  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(file)], { type: 'audio/mpeg' }), path.basename(file));
  form.append('model', model);
  form.append('language', language);
  form.append('response_format', 'verbose_json');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let payload = null, status = 0;
  try {
    const response = await fetchImpl(TRANSCRIBE_URL, { method: 'POST', body: form, signal: controller.signal, headers: { Authorization: `Bearer ${apiKey}` } });
    status = response.status;
    payload = await response.json().catch(() => null);
    if (!response.ok) throw Object.assign(new Error(`TRANSCRIBE_PROVIDER_ERROR:${status}`), { detail: String(payload?.error?.message || '').slice(0, 200) });
  } finally { clearTimeout(timer); }
  const duration = Number(payload?.duration) || 0;
  const built = buildTranscriptText(payload?.segments);
  if (!built.chars) throw new Error('TRANSCRIBE_EMPTY');
  return { ...built, duration_seconds: duration, model: payload?.model || model,
    cost_usd: Number((Math.ceil(duration / 60) * TRANSCRIBE_USD_PER_MINUTE).toFixed(4)) };
}

// Ergebnis in derselben Form wie ein offizielles Transkript, aber ausdrücklich
// als eigene maschinelle Abschrift gekennzeichnet.
export async function transcribeEpisode(episode, { apiKey, fetchImpl, ffmpeg, exec, transcodeTimeoutMs, transcribeTimeoutMs, cleanup = true } = {}) {
  const url = audioSourceFor(episode);
  if (!url) return null;
  let extracted = null;
  try {
    extracted = await extractAudio(url, { ffmpeg, exec, timeoutMs: transcodeTimeoutMs });
    const result = await transcribeAudioFile(extracted.file, { apiKey, fetchImpl, timeoutMs: transcribeTimeoutMs });
    return { url, type: 'machine_transcript/de', origin: 'openai_whisper', model: result.model,
      duration_seconds: result.duration_seconds, segments: result.segments, chars: result.chars,
      truncated: result.truncated, cost_usd: result.cost_usd, text: result.text };
  } finally {
    if (cleanup && extracted?.dir) { try { fs.rmSync(extracted.dir, { recursive: true, force: true }); } catch { /* best effort */ } }
  }
}
