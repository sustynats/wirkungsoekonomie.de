import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { validateConsistencyPdfEditions } from '../../scripts/lib/consistency-pdf-editions.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-edition-guard-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (file, data) => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), typeof data === 'string' ? data : JSON.stringify(data));
  };
  const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
  const names = ['combined.pdf', 'band-i.pdf', 'band-ii.pdf', 'method.pdf', 'standard.pdf', 'learning.pdf', 'nats.pdf'];
  const pages = [1546, 789, 757, 98, 387, 21, 60];
  const releaseTag = 'reviewed-editions';
  const files = names.map((filename, i) => {
    write(`pdf/${filename}`, `checksum fixture ${filename}`);
    return { filename, pages: pages[i], sha256: hash(`pdf/${filename}`), source: `pdf/${filename}`,
      url: `https://github.com/sustynats/wirkungsoekonomie.de/releases/download/${releaseTag}/${filename}` };
  });
  write('review.json', { status: 'PASS', pdfs: files.slice(1).map(f => ({
    pdfSha256: f.sha256, pages: f.pages, visualPageCoverage: f.pages,
  })) });
  write('metadata.json', { status: 'PASS', files: [] });
  write('historical.pdf', 'immutable original fixture');
  const volumes = files.slice(1, 3).map((f, i) => {
    const docx = `source-${i}.docx`;
    write(docx, `source fixture ${i}`);
    return { volume: i === 0 ? 'I' : 'II', filename: f.filename, sha256: f.sha256,
      pages: f.pages, docx, docxSha256: hash(docx) };
  });
  write('content/grundlagen/book-publication-current.json', {
    combined: { filename: files[0].filename, sha256: files[0].sha256 }, volumes,
    deliveryPixelComparison: { status: 'PASS' }, historical: { path: 'historical.pdf', sha256: hash('historical.pdf') },
  });
  write('assets/data/publication-hygiene-2026-09-06.json', { localFiles: {}, sourceCorrections: {} });
  const manifest = { status: 'LOCAL_SOURCE_AND_VISUAL_VERIFICATION_COMPLETE', releaseTag, files, sources: [],
    visualReview: [{ path: 'review.json', sha256: hash('review.json') }], sourceSuccessions: {},
    metadataOnlyCorrections: { review: 'metadata.json', reviewSha256: hash('metadata.json'), files: {} } };
  const save = () => write('assets/data/consistency-pdf-editions-2026-10-11.json', manifest);
  save();
  return { root, manifest, save, write, hash };
}

test('accepts an identified assembly after genuine pagination changes', t => {
  const f = fixture(t);
  assert.equal(validateConsistencyPdfEditions(f.root).manifest.files[0].pages, 1546);
});

test('1525 pages cannot exempt an unrelated publication from its visual review', t => {
  const f = fixture(t);
  f.manifest.files[6].pages = 1525;
  f.save();
  assert.throws(() => validateConsistencyPdfEditions(f.root), /no completed matching visual review/);
});

test('the identified assembly still requires the reviewed volume hashes', t => {
  const f = fixture(t);
  f.write('pdf/combined.pdf', 'unknown replacement');
  f.manifest.files[0].sha256 = f.hash('pdf/combined.pdf');
  f.save();
  assert.throws(() => validateConsistencyPdfEditions(f.root), /not the verified volume assembly/);
});
