import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {validateConsistencyPdfEditions} from '../../scripts/lib/consistency-pdf-editions.mjs';
const ROOT = process.cwd();
const sha = text => crypto.createHash('sha256').update(text).digest('hex');
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-edition-guard-'));
  const manifestPath = 'assets/data/consistency-pdf-editions-2026-10-11.json';
  const manifest = JSON.parse(fs.readFileSync(manifestPath));
  const book = JSON.parse(fs.readFileSync('content/grundlagen/book-publication-current.json'));
  const files = new Set([manifestPath, 'assets/data/publication-hygiene-2026-09-06.json', 'content/grundlagen/book-publication-current.json', book.historical.path, ...book.volumes.map(v => v.docx), ...manifest.files.map(f => f.source), ...manifest.sources.map(f => f.path), ...manifest.visualReview.map(f => f.path), ...Object.values(manifest.sourceSuccessions).map(f => f.archive), manifest.metadataOnlyCorrections.review, ...Object.values(manifest.metadataOnlyCorrections.files).flatMap(f => [f.source, f.archive])]);
  for (const file of files) {
    const target = path.join(root, file); fs.mkdirSync(path.dirname(target), {recursive:true});
    if (file.endsWith('.json')) fs.copyFileSync(path.join(ROOT, file), target);
    else fs.symlinkSync(path.join(ROOT, file), target);
  }
  const replace = (file, text) => {const target=path.join(root,file);fs.unlinkSync(target);fs.writeFileSync(target,text);};
  return {root, manifest, manifestPath, replace};
}
test('an unchanged review manifest cannot approve tampered current PDF bytes', () => {
  const f=fixture(); try {validateConsistencyPdfEditions(f.root); f.replace(f.manifest.files[5].source, '%PDF unreviewed'); assert.throws(() => validateConsistencyPdfEditions(f.root), /Reviewed PDF changed/);} finally {fs.rmSync(f.root,{recursive:true,force:true});}
});
test('the prior original remains guarded after a real source succession', () => {
  const f=fixture(); try {f.replace(f.manifest.sourceSuccessions['assets/pdf/die-neue-ordnung-des-wohlstands.pdf'].archive, '{}');assert.throws(() => validateConsistencyPdfEditions(f.root), /Historical book changed|Unverified publication source succession/);} finally {fs.rmSync(f.root,{recursive:true,force:true});}
});
test('PASS and matching report checksum do not compensate for a missing reviewed page', () => {
  const f=fixture(); try {
    const item=f.manifest.visualReview.find(v=>v.path.endsWith('explainer-pdf-visual-review.json'));
    const report=JSON.parse(fs.readFileSync(path.join(f.root,item.path)));report.pdfs[0].visualPageCoverage=20;
    const text=JSON.stringify(report);fs.writeFileSync(path.join(f.root,item.path),text);item.sha256=sha(text);fs.writeFileSync(path.join(f.root,f.manifestPath),JSON.stringify(f.manifest));
    assert.throws(() => validateConsistencyPdfEditions(f.root), /no completed matching visual review/);
  } finally {fs.rmSync(f.root,{recursive:true,force:true});}
});
test('unknown later calculator changes require a new reviewed edition', () => {
  const f=fixture(); try {f.replace('assets/js/impact-controlling-rechner.js', 'unreviewed calculation');assert.throws(() => validateConsistencyPdfEditions(f.root), /Current publication input changed/);} finally {fs.rmSync(f.root,{recursive:true,force:true});}
});
