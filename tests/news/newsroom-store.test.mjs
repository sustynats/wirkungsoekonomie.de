import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readNewsroom, writeNewsroom, repositoryJson, readRepositoryJson, writeRepositoryJson, decodeNewsroom, newsroomParts } from '../../scripts/news/newsroom-store.mjs';
import {readGitStoryStore} from '../../scripts/news/publish-git.mjs';
import {createHash} from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { oversizedGitEntries } from '../../scripts/news/check-git-size.mjs';

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'newsroom-parts-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return path.join(dir, 'newsroom.json');
}
const data = () => ({ schema_version: '1.0', source_items: Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`item-${i}`, { text: 'Grüße 🌍', i }])), events: {}, decisions: Array.from({ length: 31 }, (_, i) => ({ i, verdict: 'behalten' })), metadata: null, updated_at: '2026-09-22T04:00:00Z' });

test('file limit guard rejects oversized staged files before committing', () => {
  assert.deepEqual(oversizedGitEntries([{ file: 'small', bytes: 50 }, { file: 'large', bytes: 101 }], 100), [{ file: 'large', bytes: 101 }]);
});

test('legacy and sharded stores are losslessly interchangeable including unicode and order', t => {
  const file = fixture(t), value = data();
  assert.deepEqual(readNewsroom(file, value), value);
  fs.writeFileSync(file, JSON.stringify(value));
  assert.deepEqual(readNewsroom(file), value);
  const manifest = writeNewsroom(file, value, { maxPartBytes: 180 });
  assert.ok(manifest.fields.find(f => f.key === 'source_items').parts.length > 1);
  for (const f of manifest.fields) for (const p of f.parts || []) assert.ok(p.bytes <= 180);
  assert.deepEqual(readNewsroom(file), value);
  const original = fs.readFileSync(file, 'utf8');
  writeNewsroom(file, value, { maxPartBytes: 180 });
  assert.equal(fs.readFileSync(file, 'utf8'), original);
});
test('missing, corrupt and path-injected parts fail closed instead of losing records', t => {
  const file = fixture(t), value = data();
  const m = writeNewsroom(file, value, { maxPartBytes: 180 });
  const p = m.fields.find(f => f.key === 'source_items').parts[0];
  const part = path.join(`${file}.parts`, `${p.sha256}.json`);
  fs.writeFileSync(part, '[]');
  assert.throws(() => readNewsroom(file), /CORRUPT/);
  writeNewsroom(file, value, { maxPartBytes: 180 });
  fs.unlinkSync(part);
  assert.throws(() => readNewsroom(file), /ENOENT/);
  p.sha256 = '../../escape'; fs.writeFileSync(file, JSON.stringify(m));
  assert.throws(() => readNewsroom(file), /PART_INVALID/);
});
test('replacements clean only generated obsolete parts and failed writes preserve the last manifest', t => {
  const file = fixture(t), value = data();
  writeNewsroom(file, value, { maxPartBytes: 180 });
  fs.writeFileSync(path.join(`${file}.parts`, 'keep.txt'), 'manual');
  const updated = { ...value, decisions: [] };
  writeNewsroom(file, updated, { maxPartBytes: 180 });
  assert.deepEqual(readNewsroom(file), updated);
  assert.equal(fs.readFileSync(path.join(`${file}.parts`, 'keep.txt'), 'utf8'), 'manual');
  assert.throws(() => writeNewsroom(file, { ...value, decisions: [1n] }, { maxPartBytes: 180 }), /BigInt/);
  assert.deepEqual(readNewsroom(file), updated);
});

test('oversized records retain exact histories, source bindings, approval hashes and order', async t => {
  const file = fixture(t);
  const value = {stories: [{story_id: 'small'}, {story_id: 'living', manual_only: true,
    final_approval_required: true, approval_hash: 'unchanged',
    versions: Array.from({length: 140}, (_, i) => ({i, text: 'Grüße 🌍'.repeat(6500), source: `https://example.test/${i}`}))}, {story_id: 'last'}],
    by_id: {a: {text: '🌍'.repeat(100)}, b: false}};
  const fingerprint = createHash('sha256').update(JSON.stringify(value)).digest('hex');
  const manifest = writeNewsroom(file, value);
  assert.equal(manifest.storage_format, 'woek-newsroom-parts-2');
  assert.ok(manifest.fields[0].parts.some(p => p.kind === 'record'));
  for (const part of newsroomParts(manifest)) {
    assert.ok(part.bytes <= 8 * 1024 * 1024);
    JSON.parse(fs.readFileSync(`${file}.parts/${part.sha256}.json`, 'utf8'));
  }
  assert.equal(createHash('sha256').update(JSON.stringify(readNewsroom(file))).digest('hex'), fingerprint);
  const encoded = fs.readFileSync(file);
  writeNewsroom(file, value);
  assert.deepEqual(fs.readFileSync(file), encoded);
  const calls = [];
  const restored = await readGitStoryStore('exact-revision', async args => {
    calls.push(args);
    assert.ok(args[1].startsWith('exact-revision:'));
    return {stdout: args[1].endsWith('stories.json') ? encoded.toString() : fs.readFileSync(`${file}.parts/${path.basename(args[1])}`, 'utf8')};
  });
  assert.deepEqual(restored, value);
  assert.ok(calls.length > 2);
});

test('chunked object records and split UTF-8 round-trip; integrity and missing chunks fail closed', t => {
  const file = fixture(t), value = {records: {first: '🌍'.repeat(70), last: {text: 'ä'.repeat(90)}}};
  const manifest = writeNewsroom(file, value, {maxPartBytes: 64});
  assert.deepEqual(readNewsroom(file), value);
  const record = manifest.fields[0].parts[0];
  const chunk = record.parts[0];
  const partFile = `${file}.parts/${chunk.sha256}.json`;
  fs.writeFileSync(partFile, '"corrupt"');
  assert.throws(() => readNewsroom(file), /CORRUPT/);
  writeNewsroom(file, value, {maxPartBytes: 64});
  fs.unlinkSync(partFile);
  assert.throws(() => readNewsroom(file), /ENOENT/);
  writeNewsroom(file, value, {maxPartBytes: 64});
  const load = part => fs.readFileSync(`${file}.parts/${part.sha256}.json`);
  record.sha256 = '0'.repeat(64);
  assert.throws(() => decodeNewsroom(manifest, load), /RECORD_CORRUPT/);
  record.bytes = 129 * 1024 * 1024;
  assert.throws(() => decodeNewsroom(manifest, load), /RECORD_INVALID/);
  record.parts[0].sha256 = '../../escape';
  record.bytes = 400;
  assert.throws(() => decodeNewsroom(manifest, load), /PART_INVALID/);
  manifest.storage_format = 'woek-newsroom-parts-1';
  assert.throws(() => decodeNewsroom(manifest, load), /RECORD_INVALID/);
});
test('large ordinary JSON stores lose whitespace only', () => {
  const value = { nested: { text: 'ü'.repeat(5 * 1024 * 1024) }, rows: [1, null, false] };
  const bytes = repositoryJson(value);
  assert.deepEqual(JSON.parse(bytes), value);
  assert.equal(bytes, JSON.stringify(value) + '\n');
});

test('canonical story adapter preserves complete records, histories and approvals without changing public JSON', t => {
  const file = path.join(path.dirname(fixture(t)), 'stories.json');
  const value = { schema_version:'1.1', stories:[{story_id:'a',manual_only:true,final_approval_required:true,versions:[{text:'Grüße — 🌍'}],sources:[{url:'https://example.test/'}]}],updated_at:'2026-09-25T20:00:00Z' };
  fs.writeFileSync(file, JSON.stringify(value));
  assert.deepEqual(readRepositoryJson(pathToFileURL(file)), value);
  const manifest = writeRepositoryJson(file, value);
  assert.ok(manifest.storage_format);
  assert.deepEqual(readRepositoryJson(file), value);
  const first = fs.readFileSync(file);
  writeRepositoryJson(file, value);
  assert.deepEqual(fs.readFileSync(file), first);
  const json = path.join(path.dirname(file),'feed.json');
  writeRepositoryJson(json, value);
  assert.deepEqual(JSON.parse(fs.readFileSync(json)), value);
  assert.deepEqual(decodeNewsroom(manifest, part => fs.readFileSync(`${file}.parts/${part.sha256}.json`)),value);
  assert.throws(()=>decodeNewsroom(manifest,()=>Buffer.from('[]')),/CORRUPT/);
});
