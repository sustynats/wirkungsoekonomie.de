import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {manualEdition, renderManualArticle} from '../../scripts/news/manual-editorial.mjs';

const root = new URL('../../', import.meta.url).pathname;
const manifest = JSON.parse(fs.readFileSync(root + 'content/news/manual/editions.json', 'utf8'));
const record = manifest.entries.find(e => e.source_layout === 'approved_attachment');
const source = fs.readFileSync(root + 'content/news/manual/' + record.source_file, 'utf8');

test('approved attachment keeps the signed original and separates publication metadata', () => {
  const edition = manualEdition(record, source, {root});
  assert.equal(edition.slug, record.slug);
  assert.ok(edition.body_markdown.includes('**Natalie Weber | Meinung & Analyse | 13. Oktober 2026**'));
  assert.ok(edition.body_markdown.includes('## Meine persönliche Einordnung'));
  assert.ok(edition.body_markdown.includes('## Quellen und Nachweise'));
  assert.match(renderManualArticle(edition), /news-author-perspective/);
  assert.match(renderManualArticle(edition), /data-editorial-explanatory-visual/);
  assert.throws(() => manualEdition({...record, publication_approved:false}, source, {root}), /AUTHORITY_REQUIRED/);
  assert.throws(() => manualEdition(record, source + ' ', {root}), /HASH_MISMATCH/);
  assert.throws(() => manualEdition({...record, publication_metadata:{...record.publication_metadata,slug:'wrong-slug'}}, source, {root}), /SLUG_INVALID/);
});
