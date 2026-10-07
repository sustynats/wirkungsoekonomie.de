import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const DESCRIPTION_LIMIT = 360;
const BODY_LIMIT = 420;
const ARRAY_LIMIT = 16;

function unique(values, limit = ARRAY_LIMIT) {
  return Array.from(new Set((values || []).map(value => String(value || '').trim()).filter(Boolean))).slice(0, limit);
}

function canonicalRoute(url) {
  return String(url || '').replace(/#.*$/, '');
}

function isArchiveDetail(url) {
  return /^\/(?:bibliothek|quellenarchiv)\/.+/.test(canonicalRoute(url));
}

function selectPrimaryEntry(entries) {
  return [...entries].sort((left, right) => {
    const leftHasFragment = String(left.url || '').includes('#') ? 1 : 0;
    const rightHasFragment = String(right.url || '').includes('#') ? 1 : 0;
    return leftHasFragment - rightHasFragment
      || Number(right.priority || 0) - Number(left.priority || 0)
      || String(left.title || '').localeCompare(String(right.title || ''), 'de');
  })[0];
}

function compactGroup(entries) {
  const primary = selectPrimaryEntry(entries);
  const sections = entries.filter(entry => entry !== primary);
  const sectionTitles = sections.map(entry => entry.title);
  const body = [primary.body, ...sectionTitles, ...sections.map(entry => entry.description)]
    .map(value => String(value || '').trim())
    .filter(Boolean)
    .join(' ')
    .slice(0, BODY_LIMIT);

  return {
    id: primary.id,
    title: primary.title,
    description: String(primary.description || body).slice(0, DESCRIPTION_LIMIT),
    url: canonicalRoute(primary.url),
    section: primary.section,
    type: primary.type,
    format: primary.format,
    impactSpaces: unique(entries.flatMap(entry => entry.impactSpaces || []), 8),
    standards: unique(entries.flatMap(entry => entry.standards || []), 8),
    instruments: unique(entries.flatMap(entry => entry.instruments || [])),
    tags: unique(entries.flatMap(entry => entry.tags || [])),
    aliases: unique([
      ...(primary.aliases || []),
      ...sectionTitles,
      ...sections.flatMap(entry => entry.aliases || []),
    ]),
    body,
    semanticTerms: unique(entries.flatMap(entry => entry.semanticTerms || []), 12),
    priority: Math.max(...entries.map(entry => Number(entry.priority || 0))),
  };
}

// Keep the full machine-readable source index, while the browser receives one
// compact record per page. Large bibliography and source-archive detail sets
// retain their own browsable hubs and do not block the global entry search.
export function compactSearchEntries(entries) {
  if (!Array.isArray(entries)) throw new TypeError('Search index must be an array.');
  const groups = new Map();
  for (const entry of entries) {
    const route = canonicalRoute(entry?.url);
    if (!route || isArchiveDetail(route)) continue;
    if (!groups.has(route)) groups.set(route, []);
    groups.get(route).push(entry);
  }
  return Array.from(groups.values())
    .map(compactGroup)
    .sort((left, right) => Number(right.priority || 0) - Number(left.priority || 0)
      || String(left.title || '').localeCompare(String(right.title || ''), 'de')
      || String(left.url || '').localeCompare(String(right.url || ''), 'de'));
}

export function buildBrowserSearchIndex(root) {
  const directory = path.join(root, 'assets/search');
  const full = fs.readFileSync(path.join(directory, 'search-index.json'));
  const entries = compactSearchEntries(JSON.parse(full));
  const json = Buffer.from(JSON.stringify(entries));
  const gzip = gzipSync(json, { level: 9, mtime: 0 });
  const hash = crypto.createHash('sha256').update(json).digest('hex').slice(0, 16);
  const stem = `browser-index-${hash}`;
  for (const name of fs.readdirSync(directory)) {
    if (/^browser-index-[a-f0-9]{16}\.json(?:\.gz)?$/.test(name) && !name.startsWith(stem)) fs.unlinkSync(path.join(directory, name));
  }
  fs.writeFileSync(path.join(directory, `${stem}.json`), json);
  fs.writeFileSync(path.join(directory, `${stem}.json.gz`), gzip);
  const manifest = {schemaVersion: 1, version: hash, entries: entries.length, json: `${stem}.json`, gzip: `${stem}.json.gz`, bytes: json.length, gzipBytes: gzip.length};
  fs.writeFileSync(path.join(directory, 'browser-index-manifest.json'), `${JSON.stringify(manifest)}\n`);
  console.log(`Browser search: ${entries.length} entries; ${(full.length/1e6).toFixed(2)} MB full → ${(json.length/1e6).toFixed(2)} MB compact / ${(gzip.length/1e6).toFixed(2)} MB transferred.`);
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) buildBrowserSearchIndex(path.resolve(process.argv.includes('--artifact') ? '_site' : '.'));
