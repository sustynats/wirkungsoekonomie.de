import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const validHash = value => /^[a-f0-9]{64}$/.test(value);

// A current source may replace a dated publication only when the old input,
// the actual new PDF and its completed visual review are all preserved.
export function validateConsistencyPdfEditions(root = process.cwd()) {
  const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const hash = file => digest(path.join(root, file));
  const manifest = read('assets/data/consistency-pdf-editions-2026-10-11.json');
  const hygiene = read('assets/data/publication-hygiene-2026-09-06.json');
  if (manifest.status !== 'LOCAL_SOURCE_AND_VISUAL_VERIFICATION_COMPLETE' || manifest.files.length !== 7 || new Set(manifest.files.map(f => f.filename)).size !== 7) throw new Error('Incomplete consistency publication review');
  const editions = new Map(manifest.files.map(f => [f.filename, f]));
  for (const item of manifest.files) {
    if (!validHash(item.sha256) || item.pages < 1 || !item.url.startsWith(`https://github.com/sustynats/wirkungsoekonomie.de/releases/download/${manifest.releaseTag}/`)) throw new Error(`Invalid current edition: ${item.filename}`);
    if (!item.source || hash(item.source) !== item.sha256) throw new Error(`Reviewed PDF changed: ${item.filename}`);
  }
  for (const item of manifest.sources) if (!validHash(item.sha256) || hash(item.path) !== item.sha256) throw new Error(`Current publication input changed: ${item.path}`);
  const reviews = manifest.visualReview.map(item => {
    if (hash(item.path) !== item.sha256) throw new Error(`Visual review changed: ${item.path}`);
    const review = read(item.path);
    if (review.status !== 'PASS') throw new Error(`Visual review incomplete: ${item.path}`);
    return review;
  });
  const wholePageReviews = reviews.flatMap(review => review.pdfs || []);
  const methodReviews = reviews.flatMap(review => review.editions || []);
  const book = read('content/grundlagen/book-publication-current.json');
  for (const item of manifest.files) {
    // Only the identified, hash-bound assembly uses the two volume reviews.
    // Page counts change with real corrections and never identify an edition.
    if (item.filename === book.combined.filename) continue;
    const whole = wholePageReviews.find(r => r.pdfSha256 === item.sha256 && r.pages === item.pages && r.visualPageCoverage === item.pages);
    const method = methodReviews.find(r => r.sha256 === item.sha256 && r.pages === item.pages && r.renderedChangedPages.length && r.renderedChangedPages.every(p => p.visualReview === 'PASS'));
    if (!whole && !method) throw new Error(`PDF has no completed matching visual review: ${item.filename}`);
  }
  const combined = editions.get(book.combined.filename);
  if (combined?.sha256 !== book.combined.sha256 || combined.pages !== book.volumes.reduce((n, v) => n + v.pages, 0) || book.deliveryPixelComparison.status !== 'PASS') throw new Error('Combined book is not the verified volume assembly');
  for (const v of book.volumes) if (hash(v.docx) !== v.docxSha256 || editions.get(v.filename)?.sha256 !== v.sha256) throw new Error(`Book source changed: ${v.volume}`);
  if (hash(book.historical.path) !== book.historical.sha256) throw new Error('Historical book changed');
  const successions = manifest.sourceSuccessions;
  for (const [source, item] of Object.entries(successions)) {
    const archived = hash(item.archive);
    const correction = hygiene.localFiles[source] || hygiene.sourceCorrections[source];
    const preserved = archived === item.predecessorSha256 || correction?.beforeSha256 === item.predecessorSha256 && correction.afterSha256 === archived;
    if (!preserved || archived !== item.archivedSha256 || hash(source) !== item.currentSha256 || !editions.has(item.editionFilename)) throw new Error(`Unverified publication source succession: ${source}`);
  }
  const metadata = manifest.metadataOnlyCorrections;
  if (hash(metadata.review) !== metadata.reviewSha256) throw new Error('Metadata-only PDF proof changed');
  const metadataReview = read(metadata.review);
  if (metadataReview.status !== 'PASS') throw new Error('Metadata-only PDF proof incomplete');
  for (const [source, item] of Object.entries(metadata.files)) {
    const proof = metadataReview.files.find(f => f.source === source);
    if (hash(source) !== item.currentSha256 || hash(item.archive) !== item.predecessorSha256 || proof?.currentSha256 !== item.currentSha256 || proof.status !== 'PASS' || proof.identicalPagePixels.length !== item.pages || new Set(proof.identicalPagePixels.map(p => p.page)).size !== item.pages) throw new Error(`Unverified metadata-only PDF correction: ${source}`);
  }
  return {
    manifest,
    matchesSuccessor(source, expected) {
      const item = successions[source];
      const meta = metadata.files[source];
      return Boolean(item && [item.predecessorSha256, item.archivedSha256].includes(expected) && hash(source) === item.currentSha256 || meta && expected === meta.predecessorSha256 && hash(source) === meta.currentSha256);
    },
  };
}
