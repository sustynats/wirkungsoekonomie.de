import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {compactJsonWhitespace, compactPublicRuntimeJson} from '../../scripts/lib/compact-runtime-json.mjs';

test('runtime compaction preserves string escapes and exact numeric literals', () => {
  const source = '{\n  "text": " a \\" b \\\\ c \\n d ",\n  "large": 9007199254740993, "small": 1.234567890123456789e-200,\n "items": [true, false, null, -0]\n}';
  const compact = compactJsonWhitespace(source);
  assert.deepEqual(JSON.parse(compact), JSON.parse(source));
  assert.ok(compact.includes('9007199254740993'));
  assert.ok(compact.includes('1.234567890123456789e-200'));
  assert.ok(compact.includes('null,-0]'));
  assert.equal(compactJsonWhitespace(compact), compact);
  assert.throws(() => compactJsonWhitespace('{invalid}'), SyntaxError);
});

test('only the generated ticker runtime feed is compacted; downloads and approved payloads retain their bytes', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-runtime-json-'));
  const original = '{\n  "message": "Mensch, Planet und Demokratie",\n  "value": null\n}\n';
  try {
    const files = ['wirkungsticker/data/stories.json', 'wirkungslexikon/daten.json', 'assets/downloads/wirkung-messen/kii-arbeitsvorlage.json'];
    for (const file of files) {
      fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true});
      fs.writeFileSync(path.join(root, file), original);
    }
    const saved = compactPublicRuntimeJson(root);
    assert.ok(saved > 0);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, files[0]), 'utf8')), JSON.parse(original));
    for (const file of files.slice(1)) assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), original);
    assert.equal(compactPublicRuntimeJson(root), 0);
    fs.writeFileSync(path.join(root, files[0]), '{invalid}');
    assert.throws(() => compactPublicRuntimeJson(root), SyntaxError);
    assert.equal(fs.readFileSync(path.join(root, files[0]), 'utf8'), '{invalid}');
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});
