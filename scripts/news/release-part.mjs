// Immutable transport for the existing lossless newsroom parts. No credentials
// are sent to download URLs. The raw and compressed bytes are both pinned.
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {gzipSync, gunzipSync} from 'node:zlib';

export const DATA_REPOSITORY = 'sustynats/wirkungsoekonomie.de';
export const RELEASE_PART_FORMAT = 'woek-release-part-gzip-1';
export const RELEASE_STORE_FORMAT = 'github-release-parts-1';
export const partDigest = bytes => createHash('sha256').update(bytes).digest('hex');
const MAX_PART = 8 * 1024 * 1024;
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
export const validDataTag = tag => typeof tag === 'string'
  && /^wirkungsticker-data-\d{4}-(?:0[1-9]|1[0-2])(?:-part-(?:[2-9]|[1-9]\d+))?$/.test(tag);

export function assertRawPart(bytes, part) {
  if (!hash(part?.sha256) || !Number.isSafeInteger(part.bytes) || part.bytes < 1 || part.bytes > MAX_PART)
    throw Error('RELEASE_PART_INVALID');
  if (!Buffer.isBuffer(bytes) || bytes.length !== part.bytes || partDigest(bytes) !== part.sha256)
    throw Error('RELEASE_PART_RAW_CORRUPT');
  return bytes;
}

export function releasePartUrl(part) {
  const release = part?.release;
  if (!hash(part?.sha256) || !Number.isSafeInteger(part.bytes) || part.bytes < 1 || part.bytes > MAX_PART
      || release?.storage_format !== RELEASE_PART_FORMAT || !validDataTag(release.tag)
      || release.asset !== `${part.sha256}.json.gz` || !hash(release.sha256)
      || !Number.isSafeInteger(release.bytes) || release.bytes < 1 || release.bytes > part.bytes + 65536)
    throw Error('RELEASE_PART_REFERENCE_INVALID');
  return `https://github.com/${DATA_REPOSITORY}/releases/download/${release.tag}/${release.asset}`;
}

export function encodeReleasePart(bytes, part) {
  assertRawPart(bytes, part);
  return gzipSync(bytes, {level: 6});
}

export function decodeReleasePart(bytes, part) {
  releasePartUrl(part);
  if (!Buffer.isBuffer(bytes) || bytes.length !== part.release.bytes || partDigest(bytes) !== part.release.sha256)
    throw Error('RELEASE_PART_COMPRESSED_CORRUPT');
  let raw;
  try { raw = gunzipSync(bytes, {maxOutputLength: part.bytes}); }
  catch { throw Error('RELEASE_PART_GZIP_INVALID'); }
  return assertRawPart(raw, part);
}

export function downloadReleasePart(url, maxBytes) {
  return execFileSync('curl', ['--fail', '--silent', '--show-error', '--location',
    '--proto', '=https', '--proto-redir', '=https', '--connect-timeout', '10',
    '--max-time', '45', '--max-filesize', String(maxBytes), '--url', url],
  {timeout: 50000, maxBuffer: maxBytes + 1024});
}

// Only a declared, pinned release reference can cause a read. A missing legacy
// part remains an error; a corrupt local part is never silently replaced.
export function readReleasedPart(part, {download = downloadReleasePart} = {}) {
  const url = releasePartUrl(part);
  return decodeReleasePart(download(url, part.release.bytes), part);
}
