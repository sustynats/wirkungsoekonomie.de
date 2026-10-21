import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {PUBLIC_RUNTIME_JSON, compactJsonBytes, compactPublicRuntimeJson} from '../../scripts/quality/compact-public-runtime-json.mjs';
import {writePublicRoutes} from '../../scripts/lib/public-routes.mjs';

const script = new URL('../../scripts/quality/compact-public-runtime-json.mjs', import.meta.url);
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-runtime-json-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const artifact = path.join(root, '_site');
  fs.mkdirSync(artifact);
  const put = (relative, text) => {
    const file = path.join(root, relative);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, text);
    return file;
  };
  return {root, artifact, put};
}

test('removes only the four JSON whitespace bytes outside strings, without reserialization', () => {
  const input = Buffer.from(String.raw` {
    "text" : "  Grüße 😀\t\r\n\" \\ \/ \u0061 ",
    "number" : 9007199254740993, "exponent" : 1.2300e+04,
    "zero" : -0, "duplicate" : 1, "duplicate" : 2,
    "array" : [ true, false, null, { "space" : "   " } ]
  } `);
  const expected = Buffer.from(String.raw`{"text":"  Grüße 😀\t\r\n\" \\ \/ \u0061 ","number":9007199254740993,"exponent":1.2300e+04,"zero":-0,"duplicate":1,"duplicate":2,"array":[true,false,null,{"space":"   "}]}`);
  const output = compactJsonBytes(input);
  assert.deepEqual(output, expected);
  assert.deepEqual(JSON.parse(output), JSON.parse(input));
  assert.deepEqual(compactJsonBytes(output), output);
  assert.ok(Object.is(JSON.parse(output).zero, -0));
});

test('rejects malformed JSON, whitespace inside numbers and invalid UTF-8', () => {
  for (const text of ['', '{"x":1,}', '1 2', 'tr ue', '{"x":"unterminated}', '{"x":"literal\nnewline"}', '\ufeff{}']) {
    assert.throws(() => compactJsonBytes(Buffer.from(text)));
  }
  assert.throws(() => compactJsonBytes(Buffer.from([0x22, 0xff, 0x22])));
});

test('keeps every string byte across escape runs and scalar JSON values', () => {
  for (const value of ['', 'a\\" b', '\\'.repeat(8) + '"  end', '\t\n', '\u00a0', '🧭 " \\']) {
    const json = JSON.stringify({value});
    assert.equal(compactJsonBytes(Buffer.from(` \n\t${json}\r `)).toString(), json);
  }
  for (const json of ['null', 'true', 'false', '-0', '1e+400', '" words "']) {
    assert.equal(compactJsonBytes(Buffer.from(` \r\n${json}\t`)).toString(), json);
  }
});

test('only fixed-path artifact catalogs change; source, readers and hash-bound data stay byte-identical', t => {
  const {root, artifact, put} = fixture(t);
  const original = '{\n  "text": "Complete manuscript -  with spaces", "number": 9007199254740993\n}\n';
  for (const relative of PUBLIC_RUNTIME_JSON) put(`_site/${relative}`, original);
  const protectedPaths = ['data/news/personal-editorials.json', 'data/news/stories.json.parts/abc.json',
    '_site/data/snapshot.json', '_site/wirkungsticker/data/stories.json.parts/abc.json',
    '_site/wirkungsticker/data/app/manifest.json', '_site/wirkungsticker/data/app/items/abc.json',
    '_site/assets/search/search-core-abc.json',
    '_site/assets/data/public-release-assets.json', '_site/assets/data/public-routes.json',
    '_site/downloads/original.json', '_site/bibliothek/reader/index.html'];
  for (const relative of [...PUBLIC_RUNTIME_JSON, ...protectedPaths]) put(relative, original);
  const report = compactPublicRuntimeJson(artifact);
  assert.equal(report.files.length, PUBLIC_RUNTIME_JSON.length);
  assert.ok(report.saved_bytes > 0);
  for (const relative of PUBLIC_RUNTIME_JSON) {
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(artifact, relative))), JSON.parse(original));
  }
  for (const relative of [...PUBLIC_RUNTIME_JSON, ...protectedPaths]) assert.equal(fs.readFileSync(path.join(root, relative), 'utf8'), original);
  assert.equal(compactPublicRuntimeJson(artifact).saved_bytes, 0);
});

test('compacts the fixed public ticker projection while preserving every value and all canonical/frozen source bytes', t => {
  const {root, artifact, put} = fixture(t);
  const relative = 'wirkungsticker/data/stories.json';
  assert.ok(PUBLIC_RUNTIME_JSON.includes(relative));
  const original = String.raw`{
    "schema_version": "1.2", "updated_at": "2026-10-21T19:31:45.521Z",
    "stories": [{"story_id": "test-story", "version": 77,
      "source_summary": "  Complete text\nwith  meaningful spaces, Grüße 😀 and \"quotes\".",
      "sources": [{"url": "https://example.org/source?x=1&y=2"}],
      "large_number": 9007199254740993, "spelling": 1.2300e+04}],
    "editorial_analyses": [{"analysis_id": "test-approved", "teaser": "Unchanged  teaser"}]
  }`;
  const file = put(`_site/${relative}`, original);
  const protectedFiles = [relative, 'data/news/stories.json', 'data/news/stories.json.parts/abc.json',
    'data/news/personal-editorials.json', 'data/news/editorial-analyses.json',
    '_site/wirkungsticker/test-story/index.html', '_site/wirkungsticker/data/app/items/abc.json'];
  for (const name of protectedFiles) put(name, original);
  const report = compactPublicRuntimeJson(artifact);
  const compacted = fs.readFileSync(file);
  assert.deepEqual(report.files.map(entry => entry.path), [relative]);
  assert.ok(report.saved_bytes > 0);
  assert.deepEqual(compacted, compactJsonBytes(Buffer.from(original)));
  assert.deepEqual(JSON.parse(compacted), JSON.parse(original));
  assert.match(compacted.toString(), /9007199254740993/);
  assert.match(compacted.toString(), /1\.2300e\+04/);
  for (const name of protectedFiles) assert.equal(fs.readFileSync(path.join(root, name), 'utf8'), original);
  assert.equal(compactPublicRuntimeJson(artifact).saved_bytes, 0);
});

test('validates all candidates before writing and tolerates absent optional catalogs', t => {
  const {artifact, put} = fixture(t);
  const original = '{ "x" : 1 }\n';
  const first = put(`_site/${PUBLIC_RUNTIME_JSON[0]}`, original);
  put(`_site/${PUBLIC_RUNTIME_JSON.at(-1)}`, '{bad json');
  assert.throws(() => compactPublicRuntimeJson(artifact), /RUNTIME_JSON_INVALID/);
  assert.equal(fs.readFileSync(first, 'utf8'), original);
  const empty = path.join(artifact, 'empty', '_site');
  fs.mkdirSync(empty, {recursive: true});
  assert.deepEqual(compactPublicRuntimeJson(empty), {files: [], saved_bytes: 0});
});

test('preserves the exact routing manifest bytes and its unchanged regeneration gate', t => {
  const {artifact, put} = fixture(t);
  put('_site/index.html', '<html lang="de"><head><title>Home</title><link rel="canonical" href="https://wirkungsoekonomie.de/"></head><body><main><h1>Home</h1></main></body></html>');
  put(`_site/${PUBLIC_RUNTIME_JSON[0]}`, '{ "x" : 1 }\n');
  writePublicRoutes(artifact);
  const manifest = path.join(artifact, 'assets/data/public-routes.json');
  const before = fs.readFileSync(manifest);
  const report = compactPublicRuntimeJson(artifact);
  assert.ok(report.saved_bytes > 0);
  assert.deepEqual(fs.readFileSync(manifest), before);
  assert.doesNotThrow(() => writePublicRoutes(artifact, manifest, {check: true}));
});

test('rejects root, parent and file symlinks, hard links, and non-artifact roots', t => {
  for (const mode of ['root', 'parent', 'file', 'hard']) {
    const {root, artifact, put} = fixture(t);
    const outside = put('outside/woek-id-register.json', '{ "unchanged" : true }\n');
    const before = fs.readFileSync(outside);
    let target = artifact;
    if (mode === 'root') {
      target = path.join(root, 'linked', '_site');
      fs.mkdirSync(path.dirname(target));
      fs.symlinkSync(artifact, target);
    } else if (mode === 'parent') {
      fs.symlinkSync(path.join(root, 'outside'), path.join(artifact, 'assets'));
    } else {
      const file = path.join(artifact, PUBLIC_RUNTIME_JSON[0]);
      fs.mkdirSync(path.dirname(file), {recursive: true});
      if (mode === 'file') fs.symlinkSync(outside, file);
      else fs.linkSync(outside, file);
    }
    assert.throws(() => compactPublicRuntimeJson(target), /RUNTIME_JSON_(?:ARTIFACT_ROOT_REQUIRED|SYMLINK|FILE_INVALID)/);
    assert.deepEqual(fs.readFileSync(outside), before);
    assert.throws(() => compactPublicRuntimeJson(root), /RUNTIME_JSON_ARTIFACT_ROOT_REQUIRED/);
  }
});

test('CLI is artifact-only and does not accept a source-path override', t => {
  const {root, artifact, put} = fixture(t);
  const file = put(`_site/${PUBLIC_RUNTIME_JSON[0]}`, '{ "x": 1 }\n');
  const source = put(PUBLIC_RUNTIME_JSON[0], '{ "x": 1 }\n');
  assert.match(execFileSync(process.execPath, [script.pathname], {cwd: root, encoding: 'utf8'}), /tokens preserved/);
  assert.equal(fs.readFileSync(file, 'utf8'), '{"x":1}');
  assert.equal(fs.readFileSync(source, 'utf8'), '{ "x": 1 }\n');
  assert.throws(() => execFileSync(process.execPath, [script.pathname, artifact], {cwd: root, stdio: 'pipe'}));
});
