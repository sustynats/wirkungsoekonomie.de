import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const verifier = path.join(app, 'scripts/quality/verify-public-documents.mjs');
test('Current public document bytes match the safety manifest and canonical author', () => {
  const result = spawnSync(process.execPath, [verifier], { cwd: app, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});
test('Document gate rejects stale hashes, wrong author and missing files without weakening publisher binding', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-publication-test-'));
  try {
    fs.mkdirSync(path.join(dir, 'public'));
    const bytes = Buffer.from('test publication bytes');
    fs.writeFileSync(path.join(dir, 'public', 'fixture.pdf'), bytes);
    const document = { path: '/fixture.pdf', sha256: createHash('sha256').update(bytes).digest('hex'), author: 'Natalie Weber', creator: 'Natalie Weber', producer: 'Natalie Weber' };
    const run = (entry, publisher = 'Institut für Wirkungsökonomie') => {
      fs.writeFileSync(path.join(dir, 'public', 'publication-manifest.json'), JSON.stringify({ publisher, documents: [entry] }));
      return spawnSync(process.execPath, [verifier], { cwd: dir, encoding: 'utf8' });
    };
    assert.equal(run(document).status, 0);
    assert.notEqual(run({ ...document, sha256: '0'.repeat(64) }).status, 0);
    for (const field of ['author', 'creator', 'producer']) assert.notEqual(run({ ...document, [field]: 'Institut für Wirkungsökonomie' }).status, 0);
    assert.notEqual(run(document, 'Other publisher').status, 0);
    fs.unlinkSync(path.join(dir, 'public', 'fixture.pdf'));
    assert.notEqual(run(document).status, 0);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
