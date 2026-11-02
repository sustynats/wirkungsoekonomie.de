import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const BASE = 'https://github.com/sustynats/wirkungsoekonomie.de/releases/download/';

// These sources have been independently archived and their existing public
// release bytes verified. A clean checkout need not retain the large videos;
// a locally regenerated file must never silently use an older release URL.
export function verifyReleasedVideoSources(root, releaseAssets, catalog) {
  if (catalog?.version !== 1 || !catalog.sources || typeof catalog.sources !== 'object'
      || Array.isArray(catalog.sources) || !Object.keys(catalog.sources).length)
    throw Error('RELEASE_VIDEO_CATALOG_INVALID');
  let checked = 0, present = 0;
  for (const [relative, item] of Object.entries(catalog.sources)) {
    if (!/^assets\/video\/[a-z0-9][a-z0-9._-]*\.mp4$/i.test(relative)
        || !/^[a-f0-9]{64}$/.test(item?.sha256 || '')
        || !Number.isSafeInteger(item?.bytes) || item.bytes < 1
        || typeof item?.release_url !== 'string' || !item.release_url.startsWith(BASE)
        || releaseAssets.get(relative) !== item.release_url) {
      throw Error('RELEASE_VIDEO_REFERENCE_INVALID:' + relative);
    }
    const url = new URL(item.release_url);
    if (url.origin !== 'https://github.com' || url.username || url.password || url.search || url.hash
        || !url.pathname.startsWith('/sustynats/wirkungsoekonomie.de/releases/download/'))
      throw Error('RELEASE_VIDEO_REFERENCE_INVALID:' + relative);
    const file = path.join(root, relative);
    if (fs.existsSync(file)) {
      const info = fs.lstatSync(file);
      if (!info.isFile() || info.size !== item.bytes
          || createHash('sha256').update(fs.readFileSync(file)).digest('hex') !== item.sha256) {
        throw Error('RELEASE_VIDEO_BYTES_MISMATCH:' + relative);
      }
      present += 1;
    }
    checked += 1;
  }
  return {checked, present};
}
