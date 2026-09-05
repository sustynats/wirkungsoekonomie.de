import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

// Keep the full machine-readable index. Ship only fields the browser consumes,
// with the same 1,800-character search horizon as the public search runtime.
export function compactSearchEntries(entries) {
  const strings = ['id', 'title', 'url', 'section', 'type', 'format'];
  const lists = ['aliases', 'tags', 'impactSpaces', 'standards', 'instruments', 'semanticTerms', 'relatedTerms'];
  return entries.map(entry => {
    const result = {};
    for (const key of strings) if (entry[key]) result[key] = String(entry[key]);
    if (entry.description) result.description = String(entry.description).slice(0, 400);
    if (entry.body) result.body = String(entry.body).slice(0, 1800);
    for (const key of lists) if (Array.isArray(entry[key]) && entry[key].length) result[key] = entry[key];
    // semanticText is a redundant concatenation in generated records, but some
    // curated entries have independent terms. Preserve those, within runtime bounds.
    if (entry.semanticText && entry.semanticText !== (entry.semanticTerms || []).join(' ')) result.semanticText = String(entry.semanticText).slice(0, 1800);
    if (entry.priority != null) result.priority = Number(entry.priority) || 0;
    return result;
  });
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
  // Only the compressed browser variant is additional. Older browsers use the
  // existing full JSON, avoiding another ~50 MB duplicate in every deployment.
  fs.writeFileSync(path.join(directory, `${stem}.json.gz`), gzip);
  const manifest = {schemaVersion: 1, version: hash, entries: entries.length, json: 'search-index.json', gzip: `${stem}.json.gz`, bytes: json.length, gzipBytes: gzip.length};
  fs.writeFileSync(path.join(directory, 'browser-index-manifest.json'), `${JSON.stringify(manifest)}\n`);
  console.log(`Browser search: ${entries.length} entries; ${(full.length/1e6).toFixed(2)} MB full → ${(json.length/1e6).toFixed(2)} MB compact / ${(gzip.length/1e6).toFixed(2)} MB transferred.`);
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) buildBrowserSearchIndex(path.resolve(process.argv.includes('--artifact') ? '_site' : '.'));
