import { readRepositoryJson } from './newsroom-store.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { gunzipSync } from 'node:zlib';
import path from 'node:path';
import {isDeepStrictEqual} from 'node:util';
import {projectMissingEvidenceCorrection} from './missing-evidence-zero.mjs';

const ROOT = process.cwd();
const base = String(process.env.WOEK_LIVE_BASE_URL || 'https://wirkungsoekonomie.de').replace(/\/$/, '');
const releaseSha = String(process.env.WOEK_RELEASE_SHA || '').trim();
const attempts = Math.max(1, Number(process.env.WOEK_LIVE_SMOKE_ATTEMPTS || 12));
const delayMs = Math.max(1000, Number(process.env.WOEK_LIVE_SMOKE_DELAY_MS || 10000));
const DIMENSIONS = ['human', 'planet', 'democracy'];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// A release rebuilds App projections. The committed projection can therefore
// predate a canonical-only editorial change; it is not the deployed baseline.
// Read only the manifest from the immutable artifact of that exact deploy run.
export function readExpectedManifest({
  artifactTar = process.env.WOEK_LIVE_EXPECTED_ARTIFACT_TAR,
  sourceCommit = releaseSha,
  root = ROOT,
} = {}) {
  if (sourceCommit && !artifactTar) throw new Error('DEPLOYED_ARTIFACT_REQUIRED');
  let bytes;
  if (artifactTar) {
    const names = execFileSync('tar', ['-tf', artifactTar], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
      .split('\n').filter(name => ['wirkungsticker/data/app/manifest.json.gz', './wirkungsticker/data/app/manifest.json.gz'].includes(name));
    if (names.length !== 1) throw new Error('DEPLOYED_APP_MANIFEST_AMBIGUOUS_OR_MISSING');
    // No archive entry is extracted to disk, including links or relative paths.
    bytes = execFileSync('tar', ['-xOf', artifactTar, names[0]], { maxBuffer: 2 * 1024 * 1024 });
  } else {
    // Explicit local/manual use without a release commit remains supported.
    bytes = fs.readFileSync(path.join(root, 'wirkungsticker/data/app/manifest.json.gz'));
  }
  const manifest = JSON.parse(gunzipSync(bytes, { maxOutputLength: 8 * 1024 * 1024 }).toString('utf8'));
  if (!manifest.revision || typeof manifest.revision !== 'string' || !manifest.feeds || !manifest.lookup) {
    throw new Error('DEPLOYED_APP_MANIFEST_INVALID');
  }
  return manifest;
}

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

const mainContent = html => String(html || '').match(/<main(?:\s[^>]*)?>([\s\S]*?)<\/main>/)?.[1];
// This path is entered only for the canonical, hash-bound historical correction.
// It compares the whole article main/card with the exact deployment artifact;
// an arbitrary null profile or a correction marker cannot authorize it.
export function correctedPotentialErrors(html, expected, label, {article = false} = {}) {
  const actual = article ? mainContent(html) : String(html || '');
  const target = article ? mainContent(expected) : String(expected || '');
  const sections = String(target || '').split(/(?=class="wt-dim wt-dim--(?:human|planet|democracy)")/);
  const planet = sections.filter(s=>s.startsWith('class="wt-dim wt-dim--planet"'));
  const opens = value => (String(value).match(/data-magnitude="open"/g) || []).length;
  const planetOpens = planet.reduce((n,s)=>n+opens(s),0);
  if (!target || !planetOpens || opens(target)!==planetOpens
    || planet.some(s=>opens(s) && !s.includes('data-path-status="insufficient_basis"'))
    || (target.match(/data-magnitude="[0-5]"/g) || []).length < 2
    || article && (!target.includes('data-impact-zero-evidence-correction') || !target.includes('Darstellungskorrektur vom 27.10.2026'))) {
    return [`${label}:HISTORICAL_CORRECTION_ARTIFACT_INVALID`];
  }
  return actual === target ? [] : [`${label}:HISTORICAL_CORRECTION_READBACK_MISMATCH`];
}

export function readExpectedCorrection(record, manifest, {
  artifactTar = process.env.WOEK_LIVE_EXPECTED_ARTIFACT_TAR, root = ROOT,
} = {}) {
  if (projectMissingEvidenceCorrection(record,record.impact_assessment) === record.impact_assessment)
    throw new Error('UNBOUND_HISTORICAL_CORRECTION');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(record.slug || '')) throw new Error('CORRECTION_SLUG_INVALID');
  const read = relative => {
    if (!artifactTar) return fs.readFileSync(path.join(root,relative));
    const names = execFileSync('tar',['-tf',artifactTar],{encoding:'utf8',maxBuffer:16*1024*1024})
      .split('\n').filter(name=>[relative,'./'+relative].includes(name));
    if (names.length !== 1) throw new Error('CORRECTION_ARTIFACT_AMBIGUOUS_OR_MISSING');
    return execFileSync('tar',['-xOf',artifactTar,names[0]],{maxBuffer:16*1024*1024});
  };
  const relative=`/wirkungsticker/${record.slug}/`, id=manifest.lookup?.[relative]?.id;
  if (id && !/^[a-f0-9]{20}$/.test(id)) throw new Error('CORRECTION_APP_ID_INVALID');
  return {article:read(relative.slice(1)+'index.html').toString('utf8'),
    item:id ? JSON.parse(gunzipSync(read(`wirkungsticker/data/app/items/${id}.json.gz`)).toString('utf8')) : null};
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

export async function livePotentialCheck({
  fetchJson = json,
  fetchText = text,
  store = readRepositoryJson(path.join(ROOT, 'data/news/stories.json'), 'utf8'),
  expectedManifest = readExpectedManifest(),
  correctionReader = readExpectedCorrection,
} = {}) {
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
  let visible = 0, corrections = 0;
  for (const record of reviewed) {
    const relative = `/wirkungsticker/${record.slug}/`;
    const correction = projectMissingEvidenceCorrection(record,record.impact_assessment) !== record.impact_assessment
      ? correctionReader(record,expectedManifest) : null;
    if (correction) corrections++;
    const article = await fetchText(cacheBust(`${base}${relative}`));
    errors.push(...(correction ? correctedPotentialErrors(article,correction.article,`${record.story_id}:article`,{article:true}) : renderedPotentialErrors(article, `${record.story_id}:article`)));
    const expectedLookup = expectedManifest.lookup?.[relative];
    if (!expectedLookup) continue; // Case-file member: article is public, card is represented by its visible case.
    visible += 1;
    const liveLookup = liveManifest.lookup?.[relative];
    if (!liveLookup?.id) { errors.push(`${record.story_id}:LIVE_LOOKUP_MISSING`); continue; }
    const item = await fetchJson(cacheBust(`${base}/wirkungsticker/data/app/items/${liveLookup.id}.json.gz`));
    errors.push(...(correction ? correctedPotentialErrors(item?.html,correction.item?.html,`${record.story_id}:bookmark-item`) : renderedPotentialErrors(item?.html, `${record.story_id}:bookmark-item`)));
    if (correction && !isDeepStrictEqual(item,correction.item)) errors.push(`${record.story_id}:BOOKMARK_CORRECTION_ITEM_MISMATCH`);
    const feed = feedByUrl.get(relative);
    if (!feed) errors.push(`${record.story_id}:NEWS_FEED_CARD_MISSING`);
    else {
      errors.push(...(correction ? correctedPotentialErrors(feed.html,correction.item?.html,`${record.story_id}:news-feed`) : renderedPotentialErrors(feed.html, `${record.story_id}:news-feed`)));
      if (correction && !isDeepStrictEqual(feed,correction.item)) errors.push(`${record.story_id}:FEED_CORRECTION_ITEM_MISMATCH`);
    }
  }
  return { ok: errors.length === 0, stage: errors.length ? 'surface' : 'complete', errors,
    reviewed_profiles: reviewed.length-corrections, ...(corrections ? {historical_corrections:corrections} : {}), visible_cards: visible, manifest_revision: liveManifest.revision };
}

async function main() {
  // The immutable tar may be large; read its baseline once, not on every poll.
  const expectedManifest = readExpectedManifest();
  let last;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try { last = await livePotentialCheck({ expectedManifest }); }
    catch (error) { last = { ok: false, stage: 'network', errors: [String(error?.message || error)] }; }
    console.log(JSON.stringify({ attempt, ...last }));
    if (last.ok) return;
    if (attempt < attempts) await sleep(delayMs);
  }
  throw new Error(`LIVE_POTENTIAL_SMOKE_FAILED:${last?.stage}:${(last?.errors || []).join('|')}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) main();
