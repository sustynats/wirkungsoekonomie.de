import fs from 'node:fs';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify, isDeepStrictEqual} from 'node:util';
import {fileURLToPath} from 'node:url';
import {readNewsroom, decodeNewsroom, newsroomParts} from './newsroom-store.mjs';
import {hasSecretPattern, newsroomSecretScanText} from './secret-scan.mjs';
import {DATA_REPOSITORY, RELEASE_PART_FORMAT, RELEASE_STORE_FORMAT, partDigest,
  validDataTag, encodeReleasePart, releasePartUrl, decodeReleasePart,
  downloadReleasePart} from './release-part.mjs';

const exec = promisify(execFile);
export const RELEASE_DATA_FILES = ['data/news/stories.json', 'data/news/newsroom.json'];
const validateObject = object => {
  const part = {sha256: object?.sha256, bytes: object?.raw_bytes, release: {
    storage_format: RELEASE_PART_FORMAT, tag: 'wirkungsticker-data-2000-01',
    asset: object?.asset, sha256: object?.gzip_sha256, bytes: object?.gzip_bytes,
  }};
  releasePartUrl(part);
  return part;
};
const validatePlan = plan => {
  if (plan?.storage_format !== 'woek-release-data-plan-1' || !Array.isArray(plan.stores) || !Array.isArray(plan.objects)
      || new Set(plan.stores.map(s => s?.path)).size !== plan.stores.length
      || new Set(plan.objects.map(o => o?.sha256)).size !== plan.objects.length)
    throw Error('RELEASE_DATA_PLAN_INVALID');
  for (const store of plan.stores) if (!RELEASE_DATA_FILES.includes(store?.path)
      || !/^[a-f0-9]{64}$/.test(store.sha256 || '') || !Number.isSafeInteger(store.bytes) || store.bytes < 1)
    throw Error('RELEASE_DATA_STORE_INVALID');
  for (const object of plan.objects) validateObject(object);
};
const atomic = (file, bytes) => {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  const temporary = `${file}.tmp-${process.pid}`;
  try { fs.writeFileSync(temporary, bytes, {mode: 0o600}); fs.renameSync(temporary, file); }
  finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
};
const isNotFound = error => /HTTP 404|release not found/i.test(error?.stderr || error?.message || '');

function assertPublicRecords(value) {
  const visit = object => {
    if (!object || typeof object !== 'object') return;
    if (object.private === true || object.visibility === 'private'
        || (object.manual_only === true && object.published !== true)
        || Object.hasOwn(object, 'private_manuscript') || Object.hasOwn(object, 'raw_output')
        || (Object.hasOwn(object, 'raw_response')
          && !(object.status === 'unknown' && object.raw_response === 'not_confirmed')))
      throw Error('RELEASE_DATA_PRIVATE_CONTENT');
    for (const child of Object.values(object)) if (child && typeof child === 'object') visit(child);
  };
  visit(value);
}

export function assertPublicReleaseData(value) {
  assertPublicRecords(value);
  if (hasSecretPattern(newsroomSecretScanText(value))) throw Error('RELEASE_DATA_SECRET_PATTERN_FOUND');
}

// Preparation is local only. It keeps every raw source byte and serializes no
// personal desk input, secret, approval mutation or newly generated model text.
export function prepareReleaseData({root, out, enabledOnly = false} = {}) {
  root = path.resolve(root || '.'); out = path.resolve(out || 'outputs/ticker-release-data');
  const stores = [], objects = new Map();
  for (const relative of RELEASE_DATA_FILES) {
    const file = path.join(root, relative), original = fs.readFileSync(file);
    const manifest = JSON.parse(original);
    if (enabledOnly && manifest.parts_storage !== RELEASE_STORE_FORMAT) continue;
    const value = readNewsroom(file);
    assertPublicReleaseData(value);
    for (const part of newsroomParts(manifest)) {
      if (part.release) releasePartUrl(part);
      const raw = fs.readFileSync(`${file}.parts/${part.sha256}.json`);
      const compressed = encodeReleasePart(raw, part);
      const previous = objects.get(part.sha256);
      if (previous && previous.raw_bytes !== raw.length) throw Error('RELEASE_DATA_PART_CONFLICT');
      if (previous && part.release && !previous.release) previous.release = part.release;
      if (!previous) objects.set(part.sha256, {
        sha256: part.sha256, raw_bytes: raw.length, gzip_bytes: compressed.length,
        gzip_sha256: partDigest(compressed), asset: `${part.sha256}.json.gz`,
        ...(part.release ? {release: part.release} : {}),
      });
      atomic(path.join(out, 'objects', `${part.sha256}.json.gz`), compressed);
    }
    atomic(path.join(out, relative), original);
    stores.push({path: relative, sha256: partDigest(original), bytes: original.length});
  }
  const plan = {storage_format: 'woek-release-data-plan-1', stores, objects: [...objects.values()]};
  atomic(path.join(out, 'plan.json'), `${JSON.stringify(plan, null, 2)}\n`);
  return plan;
}

// Public asset publishing follows the existing title-image store: fixed repo,
// bounded monthly continuation releases, immutable names and verified reuse.
// An uncertain create/upload stops immediately. A later attempt first reads
// the existing name; no clobber, deletion or blind write retry is available.
export function createDataReleaseStore({
  run = async args => (await exec('gh', args, {timeout: 90000, maxBuffer: 4 * 1024 * 1024})).stdout,
  download = downloadReleasePart,
} = {}) {
  return async (objects, {directory, tag, targetCommit} = {}) => {
    if (!validDataTag(tag) || tag.includes('-part-') || !/^[a-f0-9]{40}$/.test(targetCommit || ''))
      throw Error('RELEASE_DATA_TARGET_INVALID');
    const references = new Map();
    const pending = [];
    for (const object of objects) {
      const part = validateObject(object);
      const bytes = fs.readFileSync(path.join(directory, 'objects', object.asset));
      decodeReleasePart(bytes, part);
      if (object.release) {
        part.release = object.release;
        releasePartUrl(part);
        // The raw bytes and the pinned existing reference were verified on
        // preparation. Retain that exact immutable reference without a write
        // or downloading every unchanged historical part on every worker run.
        references.set(object.sha256, object.release);
      } else pending.push(object);
    }
    for (let bucket = 1; pending.length && bucket <= 32; bucket++) {
      const selected = bucket === 1 ? tag : `${tag}-part-${bucket}`;
      let release;
      try { release = JSON.parse(await run(['api', '--method', 'GET', `repos/${DATA_REPOSITORY}/releases/tags/${selected}`])); }
      catch (error) {
        if (!isNotFound(error)) throw error;
        await run(['release', 'create', selected, '--repo', DATA_REPOSITORY, '--target', targetCommit,
          '--title', `Wirkungsticker-Daten ${selected.slice('wirkungsticker-data-'.length)}`,
          '--notes', 'Unveränderliche, prüfsummengebundene Datenteile des Wirkungstickers. Private Redaktionsentwürfe sind ausgeschlossen.', '--latest=false']);
        release = JSON.parse(await run(['api', '--method', 'GET', `repos/${DATA_REPOSITORY}/releases/tags/${selected}`]));
      }
      if (!Array.isArray(release.assets) || release.tag_name !== selected || release.draft)
        throw Error('RELEASE_DATA_RELEASE_INVALID');
      const existing = new Map(release.assets.map(asset => [asset.name, asset]));
      let available = 1000 - release.assets.length;
      for (let index = 0; index < pending.length;) {
        const object = pending[index], old = existing.get(object.asset);
        if (!old && available < 1) { index++; continue; }
        const reference = {storage_format: RELEASE_PART_FORMAT, tag: selected, asset: object.asset,
          sha256: object.gzip_sha256, bytes: object.gzip_bytes};
        const part = {sha256: object.sha256, bytes: object.raw_bytes, release: reference};
        if (old && (old.state !== 'uploaded' || old.size !== object.gzip_bytes))
          throw Error('RELEASE_DATA_EXISTING_ASSET_CONFLICT');
        if (!old) {
          await run(['release', 'upload', selected, path.join(directory, 'objects', object.asset), '--repo', DATA_REPOSITORY]);
          available--;
        }
        // Download is independent of the upload response and verifies both
        // encodings. No manifest can refer to unverified transport bytes.
        decodeReleasePart(download(releasePartUrl(part), reference.bytes), part);
        references.set(object.sha256, reference); pending.splice(index, 1);
      }
    }
    if (pending.length) throw Error('RELEASE_DATA_CAPACITY_EXHAUSTED');
    return references;
  };
}

export async function publishReleaseData({root, directory, tag, targetCommit,
  publish = createDataReleaseStore()} = {}) {
  root = path.resolve(root || '.'); directory = path.resolve(directory);
  const plan = JSON.parse(fs.readFileSync(path.join(directory, 'plan.json')));
  validatePlan(plan);
  const manifests = [];
  const needed = new Set();
  const knownReferences = new Map();
  for (const store of plan.stores) {
    if (!RELEASE_DATA_FILES.includes(store.path)) throw Error('RELEASE_DATA_STORE_INVALID');
    const bytes = fs.readFileSync(path.join(root, store.path));
    if (partDigest(bytes) !== store.sha256 || bytes.length !== store.bytes) throw Error('RELEASE_DATA_SOURCE_CHANGED');
    const manifest = JSON.parse(bytes);
    const value = readNewsroom(path.join(root, store.path));
    assertPublicReleaseData(value);
    for (const part of newsroomParts(manifest)) {
      needed.add(part.sha256);
      if (part.release) knownReferences.set(part.sha256, [...(knownReferences.get(part.sha256) || []), part.release]);
      const object = plan.objects.find(o => o.sha256 === part.sha256);
      if (!object || object.raw_bytes !== part.bytes) throw Error('RELEASE_DATA_REFERENCE_MISSING');
    }
    manifests.push({file: path.join(root, store.path), manifest});
  }
  if (plan.objects.some(o => !needed.has(o.sha256))) throw Error('RELEASE_DATA_UNREFERENCED_OBJECT');
  for (const object of plan.objects) {
    const known = knownReferences.get(object.sha256) || [];
    if (object.release ? !known.some(reference => isDeepStrictEqual(reference, object.release)) : known.length > 0)
      throw Error('RELEASE_DATA_UNTRUSTED_REUSE_REFERENCE');
  }
  if (!manifests.length) return {status: 'not_enabled', stores: 0, objects: 0};
  const references = await publish(plan.objects, {directory, tag, targetCommit});
  const changes = [];
  for (const {file, manifest} of manifests) {
    if (partDigest(fs.readFileSync(file)) !== plan.stores.find(s => path.join(root, s.path) === file).sha256)
      throw Error('RELEASE_DATA_SOURCE_CHANGED');
    for (const part of newsroomParts(manifest)) {
      const reference = references.get(part.sha256);
      if (!reference) throw Error('RELEASE_DATA_REFERENCE_MISSING');
      part.release = reference; releasePartUrl(part);
    }
    manifest.parts_storage = RELEASE_STORE_FORMAT;
    changes.push({file, bytes: Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`)});
  }
  // All stores and all uploads have been checked before changing any pointer.
  // The existing serial worker commits these small manifests together.
  for (const change of changes) atomic(change.file, change.bytes);
  return {status: 'prepared_for_atomic_git_commit', stores: changes.length, objects: plan.objects.length};
}

export function restorePreparedReleaseData({directory, destination} = {}) {
  directory = path.resolve(directory); destination = path.resolve(destination);
  if (fs.existsSync(destination)) throw Error('RELEASE_DATA_RESTORE_DESTINATION_EXISTS');
  const plan = JSON.parse(fs.readFileSync(path.join(directory, 'plan.json')));
  validatePlan(plan);
  const objects = new Map();
  for (const object of plan.objects) {
    const part = validateObject(object);
    objects.set(object.sha256, decodeReleasePart(fs.readFileSync(path.join(directory, 'objects', object.asset)), part));
  }
  const verified = [];
  for (const store of plan.stores) {
    if (!RELEASE_DATA_FILES.includes(store.path)) throw Error('RELEASE_DATA_STORE_INVALID');
    const manifestBytes = fs.readFileSync(path.join(directory, store.path));
    if (partDigest(manifestBytes) !== store.sha256 || manifestBytes.length !== store.bytes)
      throw Error('RELEASE_DATA_MANIFEST_CORRUPT');
    const manifest = JSON.parse(manifestBytes);
    for (const part of newsroomParts(manifest)) {
      const raw = objects.get(part.sha256);
      if (!raw || raw.length !== part.bytes || partDigest(raw) !== part.sha256) throw Error('RELEASE_DATA_REFERENCE_MISSING');
    }
    decodeNewsroom(manifest, part => objects.get(part.sha256));
    verified.push({store, manifestBytes, manifest});
  }
  for (const {store, manifestBytes, manifest} of verified) {
    atomic(path.join(destination, store.path), manifestBytes);
    for (const part of newsroomParts(manifest)) atomic(path.join(destination, `${store.path}.parts`, `${part.sha256}.json`), objects.get(part.sha256));
    readNewsroom(path.join(destination, store.path));
  }
  return {status: 'restored', stores: verified.length, objects: objects.size};
}

export async function persistEnabledReleaseData({root = process.cwd(), out,
  targetCommit, tag, publish} = {}) {
  const enabled = RELEASE_DATA_FILES.some(relative => {
    const file = path.join(root, relative);
    return fs.existsSync(file) && JSON.parse(fs.readFileSync(file)).parts_storage === RELEASE_STORE_FORMAT;
  });
  if (!enabled) return {status: 'not_enabled', stores: 0, objects: 0};
  const directory = out || path.join(process.env.RUNNER_TEMP || path.join(root, 'outputs'), 'ticker-release-data');
  prepareReleaseData({root, out: directory, enabledOnly: true});
  const commit = targetCommit || (await exec('git', ['rev-parse', 'HEAD'], {cwd: root})).stdout.trim();
  return publishReleaseData({root, directory, tag: tag || `wirkungsticker-data-${new Date().toISOString().slice(0, 7)}`,
    targetCommit: commit, ...(publish ? {publish} : {})});
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, ...flags] = process.argv.slice(2);
  const value = name => flags.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
  const root = value('root') || process.cwd(), directory = value('out') || 'outputs/ticker-release-data';
  try {
    let result;
    if (command === 'prepare') result = prepareReleaseData({root, out: directory, enabledOnly: flags.includes('--enabled-only')});
    else if (command === 'restore') result = restorePreparedReleaseData({directory, destination: value('destination')});
    else if (command === 'persist') result = await persistEnabledReleaseData({root, out: directory, targetCommit: value('commit'), tag: value('tag')});
    else if (command === 'publish') result = await publishReleaseData({root, directory, tag: value('tag'), targetCommit: value('commit')});
    else throw Error('Use prepare, restore, persist or publish with explicit --out, --tag and --commit.');
    console.log(JSON.stringify(result));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
