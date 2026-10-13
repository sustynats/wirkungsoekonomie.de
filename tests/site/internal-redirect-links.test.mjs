import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {normalizeInternalRedirectLinks} from '../../scripts/quality/normalize-internal-redirect-links.mjs';

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-redirect-links-'));
  fs.mkdirSync(path.join(root, 'alt'), {recursive: true});
  fs.mkdirSync(path.join(root, 'ziel'), {recursive: true});
  fs.writeFileSync(path.join(root, 'index.html'), '<main><a href="alt/#abschnitt">Ziel</a></main>');
  fs.writeFileSync(path.join(root, 'alt/index.html'), '<meta http-equiv="refresh" content="0; url=../ziel/">');
  fs.writeFileSync(path.join(root, 'ziel/index.html'), '<main id="abschnitt">Inhalt</main>');
  return root;
}

test('rewrites internal anchors to the final route and preserves fragments', () => {
  const root = fixture();
  const result = normalizeInternalRedirectLinks(root);
  assert.equal(result.changedFiles, 1);
  assert.equal(result.changedLinks, 1);
  assert.match(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), /href="\/ziel\/#abschnitt"/);
  assert.equal(normalizeInternalRedirectLinks(root, {check: true}).occurrences.length, 0);
});

test('check mode reports redirect links without changing files', () => {
  const root = fixture();
  const before = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const result = normalizeInternalRedirectLinks(root, {check: true});
  assert.equal(result.occurrences.length, 1);
  assert.equal(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), before);
});
