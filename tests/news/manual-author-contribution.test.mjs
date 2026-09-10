import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadManualEditorials, manualEdition } from '../../scripts/news/manual-editorial.mjs';
import { renderEditorialMarkdownWithFootnotes } from '../../scripts/news/editorial-markdown.mjs';
import { editorialAnalysisPage } from '../../scripts/news/build.mjs';
import { assertAutomatable } from '../../scripts/news/manual-policy.mjs';

const root = process.cwd();
const record = JSON.parse(fs.readFileSync('content/news/manual/editions.json')).entries.find(e => e.book_volumes);
const source = fs.readFileSync('content/news/manual/' + record.source_file, 'utf8');
const article = loadManualEditorials(root).find(e => e.self_authored_work);

test('own work uses both verified current covers with individual links and fixed portrait', () => {
  assert.equal(article.editorial_genre, 'author_contribution');
  assert.equal(article.manual_only, true);
  const html = editorialAnalysisPage(article);
  assert.match(html, /Persönlicher Autorinnenbeitrag/);
  assert.match(html, /Ich stelle hier mein eigenes Buch vor/);
  assert.match(html, /Kostenlos online lesen/);
  assert.equal(article.book.volumes.length, 2);
  for (const volume of article.book.volumes) {
    assert.ok(html.includes(volume.cover)); assert.ok(html.includes(volume.url));
    assert.notEqual(volume.cover, article.author.image);
  }
  assert.doesNotMatch(html, /assets\/img\/book\/cover\.webp|reviewRating|aggregateRating|"datePublished":"undefined"|zur Freigabe durch die Autorin/);
  assert.equal((html.match(/id="source-/g) || []).length, 12);
  assert.doesNotMatch(html, /\[\^|WOEKFOOTNOTE/);
  let cursor = 0;
  for (const section of article.rendered.sections) for (const block of section.blocks) {
    const index = html.indexOf(block, cursor); assert.ok(index >= 0); cursor = index + block.length;
  }
  // The original document, including its historical draft status, is intact.
  assert.ok(source.includes('publication_approved: false'));
  assert.throws(() => assertAutomatable(article), /AUTOMATION_FORBIDDEN/);
});

test('a draft or changed manuscript cannot become a public author contribution', () => {
  for (const changes of [{publication_approved:false},{status:'draft'},{published_at:null}]) {
    assert.throws(() => manualEdition({...record,...changes},source,{root}), /AUTHORITY_REQUIRED/);
  }
  assert.throws(() => manualEdition(record, source+' ',{root}), /HASH_MISMATCH/);
  assert.throws(() => manualEdition({...record,book_volumes:[record.book_volumes[0]]},source,{root}), /VOLUMES_REQUIRED/);
  assert.throws(() => manualEdition({...record,internal_notes:['beliebigen Satz entfernen']},source,{root}), /INTERNAL_NOTE_INVALID/);
});

test('named footnotes preserve text, resolve repeated citations, and reject unsafe or incomplete sources', () => {
  const result = renderEditorialMarkdownWithFootnotes('Befund.[^a] Erneuter Bezug.[^a]\n\n[^a]: [Originalquelle](https://example.org/source).');
  assert.equal((result.html.match(/href="#source-1"/g)||[]).length,2);
  assert.equal((result.html.match(/id="source-1"/g)||[]).length,1);
  assert.match(result.html,/https:\/\/example.org\/source/);
  assert.throws(()=>renderEditorialMarkdownWithFootnotes('Befund.[^missing]'),/MISSING_FOOTNOTE/);
  assert.throws(()=>renderEditorialMarkdownWithFootnotes('[^a]: A\n[^a]: B'),/DUPLICATE_FOOTNOTE/);
  assert.throws(()=>renderEditorialMarkdownWithFootnotes('Befund.[^a]\n\n[^a]: [Quelle](javascript:alert)'),/UNSAFE_LINK/);
});
