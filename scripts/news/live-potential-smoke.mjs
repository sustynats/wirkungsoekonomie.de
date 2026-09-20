import fs from 'node:fs';
import { gunzipSync } from 'node:zlib';
import path from 'node:path';

const ROOT = process.cwd();
const base = String(process.env.WOEK_LIVE_BASE_URL || 'https://wirkungsoekonomie.de').replace(/\/$/, '');
const releaseSha = String(process.env.WOEK_RELEASE_SHA || '').trim();
const attempts = Math.max(1, Number(process.env.WOEK_LIVE_SMOKE_ATTEMPTS || 12));
const delayMs = Math.max(1000, Number(process.env.WOEK_LIVE_SMOKE_DELAY_MS || 10000));
const DIMENSIONS = ['human', 'planet', 'democracy'];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export function completePotential(record) {
  const a = record?.impact_assessment;
  return a?.version === '2.1'
    && a?.publication_status === 'ready'
    && record?.impact_semantic_review?.status === 'ready'
    && Boolean(record?.impact_semantic_review?.review_job_id)
    && DIMENSIONS.every(key => {
      const d = a?.dimensions?.[key];
      return d?.path_status === 'modelled'
        && Number.isInteger(d?.magnitude) && d.magnitude >= 0 && d.magnitude <= 5
        && Array.isArray(d?.primary_paths) && d.primary_paths.length > 0;
    });
}

export function renderedPotentialErrors(html, label = 'surface') {
  const errors = [];
  const magnitudes = String(html || '').match(/data-magnitude="[0-5]"/g) || [];
  if (magnitudes.length < 3) errors.push(`${label}:NUMERIC_POTENTIAL_BARS_MISSING`);
  if (String(html || '').includes('data-path-status="insufficient_basis"')) errors.push(`${label}:HISTORICAL_NULL_PROFILE_RENDERED`);
  if (String(html || '').includes('data-magnitude="open"')) errors.push(`${label}:OPEN_MAGNITUDE_RENDERED`);
  return errors;
}

async function response(url) {
  const result = await fetch(url, {
    redirect: 'follow',
    headers: {
      'cache-control': 'no-cache, no-store, max-age=0',
      pragma: 'no-cache',
      'user-agent': `wirkungsticker-live-potential-smoke/${releaseSha || 'manual'}`,
    },
  });
  if (!result.ok) throw new Error(`HTTP_${result.status}:${url}`);
  return result;
}
async function text(url) { return (await response(url)).text(); }
// Die App-Daten liegen gepackt auf der Seite (app-pages.mjs).
async function json(url) { return JSON.parse(gunzipSync(Buffer.from(await (await response(url)).arrayBuffer())).toString('utf8')); }
const cacheBust = url => `${url}${url.includes('?') ? '&' : '?'}release=${encodeURIComponent(releaseSha || Date.now())}`;

export async function livePotentialCheck({ fetchJson = json, fetchText = text } = {}) {
  const store = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/news/stories.json'), 'utf8'));
  const expectedManifest = JSON.parse(gunzipSync(fs.readFileSync(path.join(ROOT, 'wirkungsticker/data/app/manifest.json.gz'))).toString('utf8'));
  const reviewed = store.stories.filter(record => record.published && record.listed !== false
    && record.impact_assessment?.version === '2.1'
    && record.impact_semantic_review?.status === 'ready');
  const sourceErrors = reviewed.flatMap(record => completePotential(record) ? [] : [`${record.story_id}:SOURCE_READY_PROFILE_INCOMPLETE`]);
  if (sourceErrors.length) return { ok: false, stage: 'source', errors: sourceErrors };

  const liveManifest = await fetchJson(cacheBust(`${base}/wirkungsticker/data/app/manifest.json.gz`));
  if (liveManifest.revision !== expectedManifest.revision) return {
    ok: false, stage: 'propagation', errors: [`MANIFEST_REVISION:${liveManifest.revision || 'missing'}!=${expectedManifest.revision}`],
  };

  const feedMeta = liveManifest.feeds?.['news-alle'];
  if (!feedMeta || !Number.isInteger(feedMeta.pages)) return { ok: false, stage: 'manifest', errors: ['NEWS_FEED_METADATA_MISSING'] };
  const feedItems = [];
  for (let page = 0; page < feedMeta.pages; page += 1) {
    const packet = await fetchJson(cacheBust(`${base}/wirkungsticker/data/app/feeds/news-alle-${page}.json.gz`));
    if (packet.revision !== liveManifest.revision) return { ok: false, stage: 'feed', errors: [`FEED_REVISION_MISMATCH:${page}`] };
    feedItems.push(...(packet.items || []));
  }
  const feedByUrl = new Map(feedItems.map(item => [item.url, item]));
  const errors = [];
  let visible = 0;
  for (const record of reviewed) {
    const relative = `/wirkungsticker/${record.slug}/`;
    const article = await fetchText(cacheBust(`${base}${relative}`));
    errors.push(...renderedPotentialErrors(article, `${record.story_id}:article`));
    const expectedLookup = expectedManifest.lookup?.[relative];
    if (!expectedLookup) continue; // Case-file member: article is public, card is represented by its visible case.
    visible += 1;
    const liveLookup = liveManifest.lookup?.[relative];
    if (!liveLookup?.id) { errors.push(`${record.story_id}:LIVE_LOOKUP_MISSING`); continue; }
    const item = await fetchJson(cacheBust(`${base}/wirkungsticker/data/app/items/${liveLookup.id}.json.gz`));
    errors.push(...renderedPotentialErrors(item?.html, `${record.story_id}:bookmark-item`));
    const feed = feedByUrl.get(relative);
    if (!feed) errors.push(`${record.story_id}:NEWS_FEED_CARD_MISSING`);
    else errors.push(...renderedPotentialErrors(feed.html, `${record.story_id}:news-feed`));
  }
  return { ok: errors.length === 0, stage: errors.length ? 'surface' : 'complete', errors,
    reviewed_profiles: reviewed.length, visible_cards: visible, manifest_revision: liveManifest.revision };
}

async function main() {
  let last;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try { last = await livePotentialCheck(); }
    catch (error) { last = { ok: false, stage: 'network', errors: [String(error?.message || error)] }; }
    console.log(JSON.stringify({ attempt, ...last }));
    if (last.ok) return;
    if (attempt < attempts) await sleep(delayMs);
  }
  throw new Error(`LIVE_POTENTIAL_SMOKE_FAILED:${last?.stage}:${(last?.errors || []).join('|')}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) main();
