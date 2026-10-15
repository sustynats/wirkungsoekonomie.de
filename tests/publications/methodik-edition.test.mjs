import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {validateMethodikEdition, matchesMethodikWebProjection} from '../../scripts/lib/methodik-edition.mjs';

const ROOT = process.cwd();
const manifestPath = 'assets/data/methodik-edition-2026-10-16.json';

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-methodik-edition-'));
  const manifest = JSON.parse(fs.readFileSync(manifestPath));
  const files = [manifestPath, 'assets/data/site-review-pdf-editions.json',
    ...Object.keys(manifest.sourceHashes), ...manifest.files.map(item => item.source),
    ...Object.values(manifest.sourceSuccessions).map(item => item.archive),
    manifest.visualReview, manifest.sourceReview, 'assets/data/guide-reading-edition-2026-10-12.json',
    manifest.webProjection.source, manifest.webProjection.archive, manifest.webProjection.guideArchive,
    ...Object.keys(manifest.webProjection.unchangedPdfInputs)];
  for (const file of files) {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), {recursive:true});
    fs.symlinkSync(path.join(ROOT, file), target);
  }
  const replace = (file, text) => {
    const target = path.join(root, file);
    fs.unlinkSync(target);
    fs.writeFileSync(target, text);
  };
  return {root, manifest, replace};
}

test('the new current Methodik PDF passes actual source comparison and preserves its predecessor', () => {
  const {manifest, matchesSuccessor} = validateMethodikEdition(ROOT);
  assert.equal(manifest.files[0].pages, 9);
  assert.equal(manifest.files[0].supersedes, 'woek-methodik-integration-2026-09-05.pdf');
  const item = manifest.sourceSuccessions['content/site/methodik.inc'];
  assert.equal(matchesSuccessor('content/site/methodik.inc', item.predecessorSha256), true);
  assert.equal(matchesSuccessor('content/site/methodik.inc', '0'.repeat(64)), false);
});

for (const [label, file, expected] of [
  ['a changed explanation', 'content/site/methodik.inc', /PDF input changed/],
  ['changed historical source text', 'source-assets/history/methodik-20261016/methodik.inc', /not retained/],
  ['unreviewed PDF bytes', 'source-assets/generated/methodik-20261016/pdf/woek-methodik-grundlagen-modelle-verantwortung-2026-10-16.pdf', /immutable bytes/],
]) {
  test(`${label} cannot reuse the old publication approval`, () => {
    const f = fixture();
    try {
      f.replace(file, 'unreviewed replacement');
      assert.throws(() => validateMethodikEdition(f.root), expected);
    } finally {fs.rmSync(f.root, {recursive:true, force:true});}
  });
}

test('a PASS report cannot compensate for a missing visually reviewed page', () => {
  const f = fixture();
  try {
    const report = JSON.parse(fs.readFileSync(path.join(f.root, f.manifest.visualReview)));
    report.pages.pop();
    f.replace(f.manifest.visualReview, JSON.stringify(report));
    assert.throws(() => validateMethodikEdition(f.root), /visual review is missing or stale/);
  } finally {fs.rmSync(f.root, {recursive:true, force:true});}
});

test('PDF access-card changes leave the reference text and its PDF inputs unchanged', () => {
  const f = fixture();
  try {
    const source = f.manifest.webProjection.source;
    const before = f.manifest.webProjection.guideSha256;
    assert.equal(matchesMethodikWebProjection(ROOT, source, before), true);
    const altered = fs.readFileSync(path.join(f.root, source), 'utf8').replace('Historische Publikationen behalten', 'Ungeprüfte Behauptung: Publikationen behalten');
    f.replace(source, altered);
    f.manifest.webProjection.afterSha256 = crypto.createHash('sha256').update(altered).digest('hex');
    f.replace(manifestPath, JSON.stringify(f.manifest));
    assert.equal(matchesMethodikWebProjection(f.root, source, before), false,
      'A resealed checksum cannot approve changed reference prose.');
  } finally {fs.rmSync(f.root, {recursive:true, force:true});}
});

test('a changed reference-PDF input cannot be described as a web-only change', () => {
  const f = fixture();
  try {
    const source = 'content/site/reference-update.json';
    const altered = '{}';
    f.replace(source, altered);
    f.manifest.webProjection.unchangedPdfInputs[source] = crypto.createHash('sha256').update(altered).digest('hex');
    f.replace(manifestPath, JSON.stringify(f.manifest));
    assert.equal(matchesMethodikWebProjection(f.root, f.manifest.webProjection.source, f.manifest.webProjection.guideSha256), false);
  } finally {fs.rmSync(f.root, {recursive:true, force:true});}
});
