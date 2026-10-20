import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const workflow = fs.readFileSync(new URL('../../.github/workflows/wirkungsticker.yml', import.meta.url), 'utf8');
const detection = workflow.match(/^          PUBLIC_FILES=false\n[\s\S]*?(?=^          git commit)/m)?.[0];
assert.ok(detection, 'exercise the actual staged-public-file check from the normal worker');

function detect(t, files, { gitFailure = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-public-files-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const input = path.join(dir, 'changed-files');
  fs.writeFileSync(input, files.join('\n') + '\n');
  fs.writeFileSync(path.join(dir, 'git'), `#!${process.execPath}
const fs = require('node:fs');
if (process.env.TEST_GIT_FAILURE === 'true') process.exit(74);
if (JSON.stringify(process.argv.slice(2)) !== JSON.stringify(['diff', '--cached', '--name-only'])) process.exit(75);
process.stdout.on('error', () => process.exit(76));
process.stdout.write(fs.readFileSync(process.env.TEST_CHANGED_FILES));
`, { mode: 0o700 });
  return spawnSync('bash', ['-c', `set -euo pipefail\n${detection}printf '%s' "$PUBLIC_FILES"`], {
    encoding: 'utf8', timeout: 15000,
    env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, TEST_CHANGED_FILES: input,
      TEST_GIT_FAILURE: String(gitFailure) },
  });
}

test('a new public Lage triggers release even when no story was published', t => {
  const r = detect(t, ['data/news/lagen.json', 'wirkungsticker/lage/2026-10-20-morgenlage/index.html']);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, 'true');
});

test('the staged-file producer is fully read after an early public match', t => {
  const files = ['news/index.html', ...Array.from({ length: 20000 }, (_, i) =>
    `wirkungsticker/quellen/source-${i}/a-long-generated-public-file-name/index.html`)];
  const r = detect(t, files);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, 'true', 'pipefail must not turn an early grep match into a silent skipped release');
});

test('a late public match in a large staged change set is detected', t => {
  const files = [...Array.from({ length: 20000 }, (_, i) => `data/news/stories.json.parts/part-${i}.json`),
    'wirkungsticker/lage/2026-10-20-morgenlage/index.html'];
  const r = detect(t, files);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, 'true');
});

test('private data and unrelated paths alone do not request a public release', t => {
  const r = detect(t, ['data/news/stories.json', 'reports/wirkungsticker-latest-run.json',
    'docs/news/example.md', 'not-wirkungsticker/index.html', 'other/news/index.html']);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, 'false');
});

test('an unreadable staged-file list fails closed instead of silently skipping release', t => {
  const r = detect(t, [], { gitFailure: true });
  assert.notEqual(r.status, 0);
  assert.equal(r.stdout, '');
});
