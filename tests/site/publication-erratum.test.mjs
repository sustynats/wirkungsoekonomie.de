import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {applyPublicationErratumNotices} from '../../scripts/lib/publication-erratum.mjs';

test('regenerated publication pages receive the dated notice in a separate deploy artifact', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-erratum-artifact-'));
  const assets = JSON.parse(fs.readFileSync('assets/data/public-release-assets.json', 'utf8')).assets;
  const source = 'docs/gesetze/WStG_2.0_Wirkungssteuerrahmengesetz_Entwurf.pdf';
  const relative = 'werkstatt/gesetze/wirkungssteuergesetz/index.html';
  const file = path.join(root, relative);
  const historical = `<main>\n  <h1>Historischer Entwurf</h1><p>Originaltext bleibt erhalten.</p><a href="${assets[source]}">Original-PDF</a></main>`;
  try {
    fs.mkdirSync(path.dirname(file), {recursive:true});
    fs.writeFileSync(file, historical);
    assert.deepEqual(applyPublicationErratumNotices(root), [relative]);
    const updated = fs.readFileSync(file, 'utf8');
    assert.match(updated, /Fachliches Erratum vom 6\. September 2026/);
    assert.match(updated, /woek-fachpapiere-erratum-2026-09-06\.pdf/);
    assert.ok(updated.includes('<h1>Historischer Entwurf</h1><p>Originaltext bleibt erhalten.</p>'));
    assert.deepEqual(applyPublicationErratumNotices(root), []);
    assert.equal(fs.readFileSync(file, 'utf8'), updated);
    // Simulate a downstream generator replacing the page with a fresh reader.
    fs.writeFileSync(file, historical);
    applyPublicationErratumNotices(root);
    assert.equal(fs.readFileSync(file, 'utf8'), updated);
  } finally {
    fs.rmSync(root, {recursive:true, force:true});
  }
});
