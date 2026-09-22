import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readNewsroom, writeNewsroom, repositoryJson } from '../../scripts/news/newsroom-store.mjs';
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
test('replacements clean only generated obsolete parts and oversize records preserve the last manifest', t => {
  const file = fixture(t), value = data();
  writeNewsroom(file, value, { maxPartBytes: 180 });
  fs.writeFileSync(path.join(`${file}.parts`, 'keep.txt'), 'manual');
  const updated = { ...value, decisions: [] };
  writeNewsroom(file, updated, { maxPartBytes: 180 });
  assert.deepEqual(readNewsroom(file), updated);
  assert.equal(fs.readFileSync(path.join(`${file}.parts`, 'keep.txt'), 'utf8'), 'manual');
  assert.throws(() => writeNewsroom(file, { ...value, decisions: ['x'.repeat(500)] }, { maxPartBytes: 180 }), /TOO_LARGE/);
  assert.deepEqual(readNewsroom(file), updated);
});
test('large ordinary JSON stores lose whitespace only', () => {
  const value = { nested: { text: 'ü'.repeat(5 * 1024 * 1024) }, rows: [1, null, false] };
  const bytes = repositoryJson(value);
  assert.deepEqual(JSON.parse(bytes), value);
  assert.equal(bytes, JSON.stringify(value) + '\n');
});
