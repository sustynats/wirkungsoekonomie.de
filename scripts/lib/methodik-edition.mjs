import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

export function validateMethodikEdition(root = process.cwd()) {
  const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
  const validHash = value => /^[a-f0-9]{64}$/.test(value);
  const manifest = read('assets/data/methodik-edition-2026-10-16.json');
  const historical = read('assets/data/site-review-pdf-editions.json');
  if (manifest.files.length !== 1) throw new Error('Methodik needs exactly one dated successor edition');
  const edition = manifest.files[0];
  const predecessor = historical.files.find(item => item.filename === edition.supersedes);
  if (!predecessor || predecessor.filename !== 'woek-methodik-integration-2026-09-05.pdf'
      || !validHash(edition.sha256) || hash(edition.source) !== edition.sha256
      || !edition.url.startsWith(`https://github.com/sustynats/wirkungsoekonomie.de/releases/download/${manifest.releaseTag}/`)) {
    throw new Error('Methodik PDF successor or immutable bytes are invalid');
  }
  const required = ['content/site/methodik.json', 'content/site/methodik.inc',
    'scripts/site/build-methodik-explainer.mjs', 'scripts/publications/build-methodik-edition.py',
    'scripts/publications/build-site-review-pdfs.py'];
  if (required.some(file => !validHash(manifest.sourceHashes[file]))) throw new Error('Missing Methodik source binding');
  for (const [file, expected] of Object.entries(manifest.sourceHashes)) {
    if (!validHash(expected) || hash(file) !== expected) throw new Error(`Methodik PDF input changed: ${file}`);
  }
  const successors = manifest.sourceSuccessions;
  if (Object.keys(successors).sort().join('|') !== required.slice(0, 2).sort().join('|')) throw new Error('Unexpected Methodik source succession');
  for (const [file, item] of Object.entries(successors)) {
    if (historical.sourceHashes[file] !== item.predecessorSha256
        || hash(item.archive) !== item.predecessorSha256 || hash(file) !== item.currentSha256
        || manifest.sourceHashes[file] !== item.currentSha256) throw new Error(`Historical Methodik input was not retained: ${file}`);
  }
  const visual = read(manifest.visualReview);
  if (visual.status !== 'PASS' || visual.pdfSha256 !== edition.sha256 || visual.pages.length !== edition.pages
      || new Set(visual.pages.map(item => item.page)).size !== edition.pages
      || visual.pages.some((item, index) => item.page !== index + 1 || item.visualReview !== 'PASS' || !validHash(item.pngSha256))) {
    throw new Error('Methodik full-page visual review is missing or stale');
  }
  const source = read(manifest.sourceReview);
  if (source.status !== 'PASS' || source.sha256 !== edition.sha256 || source.pages !== edition.pages
      || source.authored_paragraphs_and_cells_verified < 100) throw new Error('Methodik source coverage proof is missing');
  const actual = JSON.parse(execFileSync('python3', ['scripts/publications/build-methodik-edition.py', '--check'], {cwd: root, encoding: 'utf8'}));
  if (actual.status !== 'PASS' || actual.sha256 !== edition.sha256) throw new Error('Methodik PDF fails actual source comparison');
  return {manifest, matchesSuccessor(file, expected) {
    const item = successors[file];
    return Boolean(item && expected === item.predecessorSha256 && hash(file) === item.currentSha256);
  }};
}

export function matchesMethodikWebProjection(root, source, expected) {
  if (source !== 'scripts/site/build-reference-update.mjs') return false;
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/methodik-edition-2026-10-16.json')));
  const item = manifest.webProjection;
  const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
  const guide = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/guide-reading-edition-2026-10-12.json')));
  if (item.source !== source || item.guideSha256 !== expected || guide.sources[source] !== expected
      || hash(item.guideArchive) !== expected || hash(item.archive) !== item.beforeSha256
      || hash(source) !== item.afterSha256) return false;
  const unchanged = Object.keys(item.unchangedPdfInputs).sort();
  if (unchanged.join('|') !== ['content/site/reference-update.json', 'scripts/publications/build-guide-reference-pdf.py'].join('|')
      || item.unchangedPdfInputs['content/site/reference-update.json'] !== guide.sourceSuccession['content/site/reference-update.json'].afterSha256
      || item.unchangedPdfInputs['scripts/publications/build-guide-reference-pdf.py'] !== guide.sources['scripts/publications/build-guide-reference-pdf.py']
      || unchanged.some(file => hash(file) !== item.unchangedPdfInputs[file])) return false;
  const withoutPdfCards = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/^const pdfSection = .*;$/m, '');
  if (withoutPdfCards(source) !== withoutPdfCards(item.archive)) return false;
  // The already published consistency addendum predates this change. Retain it,
  // and prove that it was the only change since the 12 October PDF snapshot.
  const previous = fs.readFileSync(path.join(root, item.archive), 'utf8')
    .replace("import { applyCurrentScopeNotice } from '../review/consistency-20261009/reference-core.mjs';\n", '')
    .replace("\n// consistency-20261009: keep the dated current review after historical addenda.\n{ const f='referenz/aktualisierung/index.html'; fs.writeFileSync(f,applyCurrentScopeNotice(fs.readFileSync(f,'utf8'))); }\n", '');
  if (previous !== fs.readFileSync(path.join(root, item.guideArchive), 'utf8')) return false;
  validateMethodikEdition(root);
  return true;
}
