import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

// Only explicitly reviewed public documents may survive without a Git copy.
// The release manifest supplies the live URL; the catalog binds that URL to
// verified immutable bytes and prevents an unnoticed local replacement.
export function releaseBackedDocuments(root, catalog, releaseAssets, {trackedFiles} = {}) {
  if (catalog?.version !== 1 || !Array.isArray(catalog.documents) || !catalog.documents.length)
    throw Error('RELEASE_DOCUMENT_CATALOG_INVALID');
  const result = new Map();
  const base = '/sustynats/wirkungsoekonomie.de/releases/download/';
  for (const item of catalog.documents) {
    const rel = item?.path;
    if (typeof rel !== 'string' || !/^(?:public\/downloads|assets\/downloads|assets\/pdf)\//.test(rel)
        || !/\.pdf$/i.test(rel) || rel.includes('\\') || rel.includes('\0')
        || rel.split('/').some(part => !part || part === '.' || part === '..')
        || result.has(rel) || !/^[a-f0-9]{64}$/.test(item.sha256 || '')
        || !Number.isSafeInteger(item.bytes) || item.bytes < 1
        || !Number.isSafeInteger(item.pages) || item.pages < 1
        || typeof item.release_url !== 'string' || releaseAssets.get(rel) !== item.release_url) {
      throw Error('RELEASE_DOCUMENT_REFERENCE_INVALID:' + rel);
    }
    const url = new URL(item.release_url);
    const segments = url.pathname.slice(base.length).split('/');
    if (url.origin !== 'https://github.com' || url.username || url.password || url.search || url.hash
        || !url.pathname.startsWith(base) || segments.length !== 2 || segments.some(value => !value))
      throw Error('RELEASE_DOCUMENT_REFERENCE_INVALID:' + rel);
    // Untracked Finder collision copies can be dataless iCloud placeholders.
    // The library does not consume them, and merely opening one can start an
    // uncontrolled download. Guard local bytes only when tracked as a source.
    if (trackedFiles === undefined || trackedFiles?.has(rel)) {
      const local = path.join(root, rel);
      let stat;
      try { stat = fs.lstatSync(local); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      if (stat && (!stat.isFile() || stat.size !== item.bytes
          || createHash('sha256').update(fs.readFileSync(local)).digest('hex') !== item.sha256))
        throw Error('RELEASE_DOCUMENT_BYTES_MISMATCH:' + rel);
    }
    result.set(rel, item);
  }
  return result;
}

export function loadReleaseBackedDocuments(root, trackedFiles) {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/library-release-documents.json')));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/public-release-assets.json')));
  return releaseBackedDocuments(root, catalog, new Map(Object.entries(manifest.assets || {})), {trackedFiles});
}
