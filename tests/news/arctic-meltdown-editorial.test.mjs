import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { loadManualEditorials, parseManualFrontmatter, EDITORIAL_AUTHOR } from '../../scripts/news/manual-editorial.mjs';
import { editorialAnalysisPage, editorialCard } from '../../scripts/news/build.mjs';
import { isManualEditorial, assertAutomatable } from '../../scripts/news/manual-policy.mjs';
import { articleFromPage, articleShareCard } from '../../scripts/news/share-image.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const editions = loadManualEditorials(root);
const edition = editions.find(a => a.slug === 'arctic-meltdown-robert-habeck');
const source = fs.readFileSync(path.join(root, 'content/news/manual/2026-09-28_arctic-meltdown-robert-habeck_buch-und-wirkung.md'), 'utf8');
const { data } = parseManualFrontmatter(source);
const html = editorialAnalysisPage(edition, undefined, { relatedAnalyses: editions.filter(a => edition.manual_related_slugs.includes(a.slug)) });

test('Arctic Meltdown retains the approved pre-publication scope and manual publication authority', () => {
  assert.equal(edition.status, 'published');
  assert.equal(edition.format, 'book_and_impact');
  assert.equal(edition.manual_only, true);
  assert.equal(edition.editorial_mode, 'manual_manuscript');
  assert.equal(data.publication_approved, true);
  assert.equal(data.final_approval_required, true);
  assert.equal(data.book_publication_date, '2026-10-01');
  assert.match(edition.subtitle, /Vorab-Einordnung der offiziellen Leseprobe/);
  assert.match(html, /Ein vollständiges Rezensionsexemplar lag nicht vor/);
  assert.match(html, /1\. Oktober 2026/);
  assert.match(html, /kein abschließendes Urteil über das Gesamtwerk/);
  assert.equal(isManualEditorial(edition), true);
  assert.throws(() => assertAutomatable(edition));
});

test('Arctic Meltdown uses the unchanged uploaded official cover, separately from the fixed portrait', () => {
  const cover = fs.readFileSync(path.join(root, edition.book.cover));
  assert.equal(createHash('sha256').update(cover).digest('hex'), 'daa96c873dfb0a2bf86290d79fe1c72bcb11853787bccee4a035dc67105e3adb');
  assert.equal(edition.author, EDITORIAL_AUTHOR);
  assert.notEqual(edition.book.cover, edition.author.image);
  assert.equal(edition.book.coverWidth, 520);
  assert.equal(edition.book.coverHeight, 839);
  assert.ok(html.includes(edition.book.cover));
  assert.ok(html.includes(edition.author.image));
  assert.match(html, /Offizielles Verlagscover/);
});

test('Arctic Meltdown renders explanatory visuals, accessible table and source links through the shared renderer', () => {
  assert.match(html, /news-editorial-diagram/);
  assert.match(html, /<table/);
  assert.match(html, /scope="col"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /konzeptionelles Prüfschema, keine gemessene Kausalfolge/);
  assert.match(html, /Meine Einordnung/);
  assert.match(html, /Caren Miosga vom 27\. September 2026/);
  assert.match(html, /keine Buchtextgrundlage/);
  assert.doesNotMatch(html, /wartet auf Natalies Freigabe|Privater redaktioneller Entwurf|\/undefined\//);
});

test('Arctic Meltdown has its own canonical, article sharecard, book schema and filterable card', () => {
  const canonical = 'https://wirkungsoekonomie.de/wirkungsticker/analyse/arctic-meltdown-robert-habeck/';
  assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`));
  assert.match(html, /property="og:type" content="article"/);
  const article = articleFromPage(html);
  assert.equal(article.about['@type'], 'Book');
  assert.equal(article.about.image, `https://wirkungsoekonomie.de${edition.book.cover}`);
  const share = articleShareCard(article);
  assert.ok(html.includes(`property="og:image" content="${share.url}"`));
  assert.equal(share.input.headline, edition.title);
  assert.match(editorialCard(edition, undefined, 0), /data-news-format="book_and_impact"/);
});
