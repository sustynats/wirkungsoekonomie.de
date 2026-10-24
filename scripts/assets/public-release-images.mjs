import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

export const IMAGE_RELEASE_BASE = 'https://github.com/sustynats/wirkungsoekonomie.de/releases/download/woek-public-images-v1/';

// Explicit opt-in only, not a new image generator or a blanket media migration.
// Full content hashes make a changed original require a new immutable asset.
export function publicReleaseImageUrl(relative, bytes) {
  if (!/^assets\/img\/blog\/[a-z0-9][a-z0-9._-]*\.png$/i.test(relative)) {
    throw Error('PUBLIC_RELEASE_IMAGE_PATH_INVALID');
  }
  const digest = createHash('sha256').update(bytes).digest('hex');
  return IMAGE_RELEASE_BASE + relative.replace(/\//g, '__').replace(/\.png$/i, '__' + digest + '.png');
}

export function verifyPublicReleaseImages(root, assets) {
  let checked = 0;
  for (const [relative, url] of assets) {
    if (!relative.startsWith('assets/img/')) continue;
    if (!/^assets\/img\/blog\/[a-z0-9][a-z0-9._-]*\.png$/i.test(relative)) {
      throw Error('PUBLIC_RELEASE_IMAGE_PATH_INVALID');
    }
    const expected = publicReleaseImageUrl(relative, fs.readFileSync(path.join(root, relative)));
    if (url !== expected) throw Error('PUBLIC_RELEASE_IMAGE_BYTES_MISMATCH:' + relative);
    checked += 1;
  }
  return checked;
}
