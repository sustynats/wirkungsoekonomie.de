import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

test('strict artifact link gate resolves dot segments as a browser and rejects missing targets', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-link-gate-'));
  const check = path.resolve('scripts/quality/check-site-links.mjs');
  const page = path.join(root, '_site/bibliothek/beispiel/index.html');
  try {
    fs.mkdirSync(path.dirname(page), {recursive: true});
    fs.mkdirSync(path.join(root, '_site/wirkungslexikon'), {recursive: true});
    fs.writeFileSync(path.join(root, '_site/wirkungslexikon/index.html'), '<title>Lexikon</title>');
    const run = () => spawnSync(process.execPath, [check, '--artifact', '--strict'], {cwd: root, encoding: 'utf8'});
    const links = ['../../../wirkungslexikon/', '../../wirkungslexikon/', '/bibliothek/../wirkungslexikon/', '../../../wirkungslexikon/?q=KII#methodik'];
    fs.writeFileSync(page, '<title>Beispiel</title>' + links.map(href => `<a href="${href}">Lexikon</a>`).join(''));
    const valid = run();
    assert.equal(valid.status, 0, valid.stdout + valid.stderr);
    assert.match(valid.stdout, /0 broken/);
    fs.appendFileSync(page, '<a href="../../../nicht-vorhanden/">Fehlt</a>');
    const missing = run();
    assert.equal(missing.status, 1, missing.stdout + missing.stderr);
    assert.match(missing.stdout, /1 broken/);
    assert.match(fs.readFileSync(path.join(root, 'reports/site-link-integrity-artifact.md'), 'utf8'), /\/nicht-vorhanden\//);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});
