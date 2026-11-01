import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
import {readNewsroom, writeNewsroom, newsroomParts} from '../../scripts/news/newsroom-store.mjs';
import {readGitStoryStore} from '../../scripts/news/publish-git.mjs';
import {partDigest, encodeReleasePart, decodeReleasePart, releasePartUrl,
  RELEASE_PART_FORMAT, RELEASE_STORE_FORMAT} from '../../scripts/news/release-part.mjs';
import {prepareReleaseData, restorePreparedReleaseData, publishReleaseData,
  createDataReleaseStore, persistEnabledReleaseData} from '../../scripts/news/release-data.mjs';
import {hydrateReleaseData} from '../../scripts/news/release-hydrate.mjs';

const commit = 'a'.repeat(40), tag = 'wirkungsticker-data-2026-11';
function fixture(t, value = null) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ticker-release-test-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const stories = value || {stories: [{story_id: 'retained', published: true,
    sources: [{url: 'https://example.test/source'}], versions: [{text: 'Grüße 🌍', paid_output: 'unchanged'}],
    approval_hash: 'exact-approval', journal: {calls: 1}}]};
  const newsroom = {source_items: {a: {text: 'Originalquelle 🌍'}}, events: {a: {state: 'retained'}}, decisions: [{receipt: 'unchanged'}]};
  for (const [name, data] of [['stories', stories], ['newsroom', newsroom]]) writeNewsroom(path.join(root, `data/news/${name}.json`), data, {maxPartBytes: 128});
  return {root, stories, newsroom, out: path.join(root, 'archive'), file: path.join(root, 'data/news/stories.json')};
}
function references(plan) {
  return new Map(plan.objects.map(object => [object.sha256, {storage_format: RELEASE_PART_FORMAT,
    tag, asset: object.asset, sha256: object.gzip_sha256, bytes: object.gzip_bytes}]));
}

test('archive restores every raw byte and logical source, paid journal and approval binding into a new directory', async t => {
  const f = fixture(t), original = fs.readFileSync(f.file);
  const plan = prepareReleaseData({root: f.root, out: f.out});
  assert.deepEqual(fs.readFileSync(f.file), original);
  const destination = path.join(f.root, 'restored');
  assert.equal(restorePreparedReleaseData({directory: f.out, destination}).status, 'restored');
  for (const name of ['stories', 'newsroom']) {
    const source = path.join(f.root, `data/news/${name}.json`), restored = path.join(destination, `data/news/${name}.json`);
    assert.deepEqual(fs.readFileSync(restored), fs.readFileSync(source));
    for (const part of newsroomParts(JSON.parse(fs.readFileSync(source))))
      assert.deepEqual(fs.readFileSync(`${restored}.parts/${part.sha256}.json`), fs.readFileSync(`${source}.parts/${part.sha256}.json`));
    assert.deepEqual(readNewsroom(restored), readNewsroom(source));
  }
  assert.throws(() => restorePreparedReleaseData({directory: f.out, destination}), /DESTINATION_EXISTS/);
  assert.equal(plan.stores.length, 2);
});

test('corrupt compressed bytes, inflated content and hostile references fail before a restore writes anything', t => {
  const f = fixture(t), plan = prepareReleaseData({root: f.root, out: f.out});
  const object = plan.objects[0], compressed = fs.readFileSync(path.join(f.out, 'objects', object.asset));
  const part = {sha256: object.sha256, bytes: object.raw_bytes, release: references(plan).get(object.sha256)};
  assert.throws(() => decodeReleasePart(Buffer.from('bad'), part), /CORRUPT/);
  for (const changed of [{asset: '../escape'}, {tag: 'https://evil.test/'}, {bytes: 0}, {sha256: '0'}])
    assert.throws(() => releasePartUrl({...part, release: {...part.release, ...changed}}), /REFERENCE_INVALID/);
  const bomb = gzipSync(Buffer.alloc(part.bytes + 1));
  assert.throws(() => decodeReleasePart(bomb, {...part, release: {...part.release, bytes: bomb.length, sha256: partDigest(bomb)}}), /GZIP_INVALID/);
  fs.writeFileSync(path.join(f.out, 'objects', object.asset), Buffer.from(compressed).fill(0));
  const destination = path.join(f.root, 'failed-restore');
  assert.throws(() => restorePreparedReleaseData({directory: f.out, destination}), /CORRUPT/);
  assert.equal(fs.existsSync(destination), false);
});

test('private pending manuscripts and secrets cannot become public release packages', t => {
  const f = fixture(t, {stories: [{manual_only: true, published: false, private_manuscript: 'private'}]});
  assert.throws(() => prepareReleaseData({root: f.root, out: f.out}), /PRIVATE_CONTENT/);
  writeNewsroom(f.file, {stories: [{published: true, text: 'sk-' + 'a'.repeat(30)}]});
  assert.throws(() => prepareReleaseData({root: f.root, out: f.out}), /SECRET_PATTERN/);
});

test('upload failure and stale source preserve both original manifests; unused plan objects cannot be published', async t => {
  const f = fixture(t), plan = prepareReleaseData({root: f.root, out: f.out});
  const before = fs.readFileSync(f.file);
  await assert.rejects(publishReleaseData({root: f.root, directory: f.out, tag, targetCommit: commit,
    publish: async () => { throw Error('UNCERTAIN_UPLOAD'); }}), /UNCERTAIN_UPLOAD/);
  assert.deepEqual(fs.readFileSync(f.file), before);
  writeNewsroom(f.file, {...f.stories, updated_at: 'newer'});
  await assert.rejects(publishReleaseData({root: f.root, directory: f.out, tag, targetCommit: commit,
    publish: async () => assert.fail('must not publish a stale source')}), /SOURCE_CHANGED/);
  writeNewsroom(f.file, f.stories, {maxPartBytes: 128});
  plan.objects.push({...plan.objects[0], sha256: 'b'.repeat(64), asset: 'b'.repeat(64) + '.json.gz'});
  fs.writeFileSync(path.join(f.out, 'plan.json'), JSON.stringify(plan));
  await assert.rejects(publishReleaseData({root: f.root, directory: f.out, tag, targetCommit: commit,
    publish: async () => assert.fail('must not upload an unreferenced object')}), /UNREFERENCED_OBJECT/);
});

test('existing releases are reused, full buckets continue, and ambiguous uploads are never replayed', async t => {
  const f = fixture(t), plan = prepareReleaseData({root: f.root, out: f.out}), calls = [];
  const store = createDataReleaseStore({run: async args => {
    calls.push(args);
    if (args[0] === 'api') {
      const selected = args.at(-1).split('/').at(-1);
      return JSON.stringify({tag_name: selected, draft: false, assets: selected === tag
        ? Array.from({length: 1000}, (_, i) => ({name: `old-${i}`})) : []});
    }
    assert.equal(args[1], 'upload');
    return '';
  }, download: url => fs.readFileSync(path.join(f.out, 'objects', url.split('/').at(-1)))});
  const refs = await store(plan.objects, {directory: f.out, tag, targetCommit: commit});
  assert.equal(refs.size, plan.objects.length);
  assert.ok([...refs.values()].every(ref => ref.tag === `${tag}-part-2`));
  assert.equal(calls.filter(c => c[1] === 'upload').length, plan.objects.length);
  assert.ok(!calls.flat().includes('--clobber'));
  let uploads = 0;
  const uncertain = createDataReleaseStore({run: async args => {
    if (args[0] === 'api') return JSON.stringify({tag_name: tag, assets: [], draft: false});
    uploads++; throw Error('WRITE_RESULT_UNKNOWN');
  }, download: () => assert.fail('no read after unknown write')});
  await assert.rejects(uncertain(plan.objects, {directory: f.out, tag, targetCommit: commit}), /WRITE_RESULT_UNKNOWN/);
  assert.equal(uploads, 1);
  const reused = createDataReleaseStore({run: async () => assert.fail('unchanged references need no request'),
    download: () => assert.fail('unchanged verified raw bytes need no download')});
  assert.equal((await reused(plan.objects.map(o => ({...o, release: refs.get(o.sha256)})),
    {directory: f.out, tag, targetCommit: commit})).size, plan.objects.length);
});

test('release pointers survive unchanged writes and exact-revision conflict reads without mixing current parts', async t => {
  const f = fixture(t), plan = prepareReleaseData({root: f.root, out: f.out}), refs = references(plan);
  await publishReleaseData({root: f.root, directory: f.out, tag, targetCommit: commit, publish: async () => refs});
  const pinned = fs.readFileSync(f.file);
  const manifest = JSON.parse(pinned);
  assert.equal(manifest.parts_storage, RELEASE_STORE_FORMAT);
  writeNewsroom(f.file, f.stories, {maxPartBytes: 128});
  assert.equal(JSON.parse(fs.readFileSync(f.file)).parts_storage, RELEASE_STORE_FORMAT);
  assert.ok(newsroomParts(JSON.parse(fs.readFileSync(f.file))).every(p => p.release));
  const value = await readGitStoryStore('pinned', async args => {
    assert.equal(args[1], 'pinned:data/news/stories.json');
    return {stdout: pinned.toString()};
  }, {readReleasePart: part => decodeReleasePart(fs.readFileSync(path.join(f.out, 'objects', part.release.asset)), part)});
  assert.deepEqual(value, f.stories);
  assert.deepEqual(readNewsroom(f.file), f.stories);
});

test('default persistence is inert until a verified cutover has explicitly enabled release storage', async t => {
  const f = fixture(t), before = fs.readFileSync(f.file);
  assert.equal((await persistEnabledReleaseData({root: f.root,
    publish: async () => assert.fail('legacy storage cannot trigger a write')})).status, 'not_enabled');
  assert.deepEqual(fs.readFileSync(f.file), before);
});

test('a cold reader verifies released bytes before materializing; cached corruption never triggers a fallback', async t => {
  const f = fixture(t), plan = prepareReleaseData({root: f.root, out: f.out});
  await publishReleaseData({root: f.root, directory: f.out, tag, targetCommit: commit, publish: async () => references(plan)});
  fs.rmSync(`${f.file}.parts`, {recursive: true});
  let downloads = 0;
  const readReleasePart = part => {
    downloads++;
    return decodeReleasePart(fs.readFileSync(path.join(f.out, 'objects', part.release.asset)), part);
  };
  assert.deepEqual(readNewsroom(f.file, undefined, {readReleasePart}), f.stories);
  assert.ok(downloads > 0);
  assert.deepEqual(readNewsroom(f.file, undefined, {readReleasePart: () => assert.fail('must reuse materialized bytes')}), f.stories);
  const part = newsroomParts(JSON.parse(fs.readFileSync(f.file)))[0];
  fs.writeFileSync(`${f.file}.parts/${part.sha256}.json`, 'corrupt');
  assert.throws(() => readNewsroom(f.file, undefined, {readReleasePart: () => assert.fail('must not hide corrupt data')}), /CORRUPT/);
});

test('a prepared plan cannot invent an already published reference or overwrite a conflicting immutable asset', async t => {
  const f = fixture(t), plan = prepareReleaseData({root: f.root, out: f.out});
  plan.objects[0].release = references(plan).get(plan.objects[0].sha256);
  fs.writeFileSync(path.join(f.out, 'plan.json'), JSON.stringify(plan));
  await assert.rejects(publishReleaseData({root: f.root, directory: f.out, tag, targetCommit: commit,
    publish: async () => assert.fail('a plan cannot assert successful publication')}), /UNTRUSTED_REUSE_REFERENCE/);
  const store = createDataReleaseStore({run: async args => {
    assert.equal(args[0], 'api');
    return JSON.stringify({tag_name: tag, draft: false, assets: [{name: plan.objects[0].asset, state: 'uploaded', size: 1}]});
  }, download: () => assert.fail('a known size conflict needs no content read')});
  delete plan.objects[0].release;
  await assert.rejects(store(plan.objects, {directory: f.out, tag, targetCommit: commit}), /EXISTING_ASSET_CONFLICT/);
});

test('cold prefetch bounds concurrency, verifies before caching, and never downloads a legacy or cached store', async t => {
  const f = fixture(t), plan = prepareReleaseData({root: f.root, out: f.out});
  assert.equal((await hydrateReleaseData({root: f.root, downloadPart: async () => assert.fail('legacy network read')})).status, 'not_enabled');
  await publishReleaseData({root: f.root, directory: f.out, tag, targetCommit: commit, publish: async () => references(plan)});
  for (const name of ['stories', 'newsroom']) fs.rmSync(path.join(f.root, `data/news/${name}.json.parts`), {recursive: true});
  let active = 0, peak = 0;
  const downloadPart = async url => {
    active++; peak = Math.max(peak, active);
    await new Promise(resolve => setTimeout(resolve, 2));
    active--;
    return fs.readFileSync(path.join(f.out, 'objects', url.split('/').at(-1)));
  };
  const result = await hydrateReleaseData({root: f.root, downloadPart});
  assert.equal(result.fetched_parts, plan.objects.length);
  assert.ok(peak > 1 && peak <= 4);
  assert.deepEqual(readNewsroom(f.file), f.stories);
  assert.equal((await hydrateReleaseData({root: f.root, downloadPart: async () => assert.fail('cached network read')})).fetched_parts, 0);
  const part = newsroomParts(JSON.parse(fs.readFileSync(f.file)))[0], physical = `${f.file}.parts/${part.sha256}.json`;
  fs.unlinkSync(physical);
  await assert.rejects(hydrateReleaseData({root: f.root, downloadPart: async () => Buffer.from('corrupt')}), /CORRUPT/);
  assert.equal(fs.existsSync(physical), false);
});
