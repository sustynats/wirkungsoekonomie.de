// Read-only adapter into the existing opinion/analysis renderer. The editorial
// manuscript is canonical; neither the news store nor a model owns this data.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { escape, renderEditorialMarkdown, renderEditorialMarkdownWithFootnotes } from "./editorial-markdown.mjs";
import {renderEditorialSection} from './editorial-layout.mjs';

export const BOOK_FORMAT = "book_and_impact";
export const EDITORIAL_AUTHOR = Object.freeze({
  name: "Natalie Weber", nickname: "Nats",
  image: "/assets/img/people/natalie-weber-buch-und-wirkung.jpeg",
  image_sha256: "5b5ff38f657f2509d9d858c14c9200397f2d40a5481c047cae82ba59991e162f",
  image_source: "Dropbox /WOEK/WIRKUNGSTICKER-BUCH-UND-WIRKUNG/6787AC7F-7327-4AB1-8482-ABFA3F481B51_1_201_a.jpeg",
  image_alt: "Natalie Weber (Nats) mit ihrem eigenen Buch Die neue Ordnung des Wohlstands",
});
export const MANUAL_DIRECTORY = "content/news/manual";
const sha = value => crypto.createHash("sha256").update(value).digest("hex");
const fail = message => { throw new Error(message); };
const safeFile = value => typeof value === "string" && /^[a-z0-9][a-z0-9_.-]+\.(?:md|jpg)$/.test(value) && !value.includes("..");

export function parseManualFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source);
  if (!match) fail("MANUAL_FRONTMATTER_REQUIRED");
  const data = Object.create(null);
  let arrayKey;
  for (const line of match[1].split(/\r?\n/)) {
    const item = /^  - (.+)$/.exec(line);
    if (item && arrayKey) { data[arrayKey].push(item[1]); continue; }
    const field = /^([a-z_]+):(?: (.+))?$/.exec(line);
    if (!field || ["__proto__", "constructor", "prototype"].includes(field[1]) || Object.hasOwn(data, field[1])) fail("MANUAL_FRONTMATTER_INVALID");
    const [, key, value] = field;
    arrayKey = value === undefined ? key : null;
    data[key] = arrayKey ? [] : /^"/.test(value) ? JSON.parse(value) : value === "true" ? true : /^\d+$/.test(value) ? Number(value) : value;
  }
  return { data, body: source.slice(match[0].length) };
}

export function manualEdition(record, source, { root } = {}) {
  if (record.format !== BOOK_FORMAT || record.manual_only !== true || record.editorial_mode !== "manual_manuscript") fail("MANUAL_PUBLICATION_AUTHORITY_REQUIRED");
  if (record.sha256 !== sha(source)) fail("MANUAL_MANUSCRIPT_HASH_MISMATCH");
  const { data: fm, body } = parseManualFrontmatter(source);
  if (fm.content_type === 'Autorinnenbeitrag') return manualAuthorEdition(record, source, { fm, body, root });
  if (fm.manual_only !== true || fm.format !== "Buch & Wirkung" || fm.content_type !== "buchbesprechung"
    || fm.section !== "Meinung & Analyse" || fm.author_profile !== "reuse_existing_meinung_analyse_profile") fail("MANUAL_FORMAT_INVALID");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fm.slug || "") || record.slug !== fm.slug) fail("MANUAL_SLUG_INVALID");
  for (const field of ["title", "subtitle", "book_title", "book_author", "publisher", "isbn"]) if (typeof fm[field] !== "string" || !fm[field].trim()) fail(`MANUAL_METADATA_REQUIRED:${field}`);
  if (!Number.isInteger(fm.pages) || fm.pages < 1 || !Number.isInteger(fm.year)
    || !/^\d{4}-\d{2}-\d{2}$/.test(fm.publication_date) || !Number.isFinite(Date.parse(record.published_at))
    || !["published", "draft"].includes(record.status)) fail("MANUAL_PUBLICATION_METADATA_INVALID");
  // These exact duplicated Markdown masthead blocks are represented by the
  // shared hero/byline. No prose is shortened, rewritten or normalized.
  const subtype = body.includes("**Buch & Wirkung · Grundlagenbuch**") ? "Grundlagenbuch" : "Buchbesprechung";
  const masthead = `# ${fm.title}\n\n**Buch & Wirkung · ${subtype}**\n\n*${fm.subtitle}*${fm.spoiler_note ? `\n\n> **Hinweis:** ${fm.spoiler_note}` : ""}`;
  if (!body.trimStart().startsWith(masthead)) fail("MANUAL_MASTHEAD_MISMATCH");
  const articleBody = body.trimStart().slice(masthead.length).trimStart();
  const rendered = renderEditorialMarkdown(articleBody);
  const bookSection = rendered.sections.find(s => s.title === "Das Buch");
  if (!bookSection || !rendered.sections.some(s => s.title === "Meine Einordnung")) fail("MANUAL_BOOK_SECTIONS_REQUIRED");
  const cover = record.book_cover;
  if (!cover || !safeFile(cover.file) || !/^https:\/\//.test(cover.source || "") || !cover.credit || !/^[a-f0-9]{64}$/.test(cover.sha256 || "")) fail("MANUAL_OFFICIAL_COVER_REQUIRED");
  if (root) {
    const coverPath = path.join(root, "assets/img/books", cover.file);
    if (!fs.existsSync(coverPath) || sha(fs.readFileSync(coverPath)) !== cover.sha256) fail("MANUAL_COVER_HASH_MISMATCH");
    const portraitPath = path.join(root, EDITORIAL_AUTHOR.image);
    if (!fs.existsSync(portraitPath) || sha(fs.readFileSync(portraitPath)) !== EDITORIAL_AUTHOR.image_sha256) fail("MANUAL_AUTHOR_PORTRAIT_CHANGED");
  }
  return {
    analysis_id: `woek-manual-${sha(fm.slug).slice(0, 16)}`, slug: fm.slug, format: BOOK_FORMAT,
    manual_only: true, editorial_mode: "manual_manuscript", editorial_genre: "book_review", analysis_variant: "standard",
    status: record.status, title: fm.title, subtitle: fm.subtitle, teaser: fm.subtitle,
    seo_description: fm.seo_description || fm.subtitle, published_at: record.published_at, updated_at: record.updated_at || record.published_at,
    reading_time_minutes: Math.ceil(articleBody.split(/\s+/).length / 210), author: EDITORIAL_AUTHOR,
    transparency_note: "Nach der von Natalie Weber entwickelten Methodik der Wirkungsökonomie",
    spoiler_note: fm.spoiler_note, subtype, body_markdown: articleBody, manuscript_sha256: record.sha256,
    rendered, tags: fm.tags || [], sections: [],
    source_snapshot: [...new Set([...articleBody.matchAll(/https:\/\/[^\s)]+/g)].map(m => m[0]))].map(url => ({ url })),
    book: { title: fm.book_title, author: fm.book_author, publisher: fm.publisher, year: fm.year, pages: fm.pages, isbn: fm.isbn,
      cover: `/assets/img/books/${cover.file}`, coverSource: cover.source, coverCredit: cover.credit, coverWidth: cover.width, coverHeight: cover.height },
    manual_related_slugs: record.related_analysis_slugs || [],
    versions: record.versions || [],
  };
}

function manualAuthorEdition(record, source, { fm, body, root }) {
  if (fm.series !== 'Buch & Wirkung' || fm.manual_only !== true || fm.self_authored_work !== true
    || fm.author !== EDITORIAL_AUTHOR.name || fm.book_author !== fm.author) fail('MANUAL_AUTHOR_CONTRIBUTION_INVALID');
  if (record.status !== 'published' || record.publication_approved !== true
    || !Number.isFinite(Date.parse(record.published_at))) fail('MANUAL_PUBLICATION_AUTHORITY_REQUIRED');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fm.slug || '') || record.slug !== fm.slug) fail('MANUAL_SLUG_INVALID');
  for (const key of ['title','subtitle','book_title','book_subtitle','book_landing_page','book_online']) {
    if (typeof fm[key] !== 'string' || !fm[key].trim()) fail(`MANUAL_METADATA_REQUIRED:${key}`);
  }
  const masthead = `# ${fm.title}\n\n**Buch & Wirkung · Persönlicher Autorinnenbeitrag von Nats**\n\n`;
  if (!body.trimStart().startsWith(masthead)) fail('MANUAL_MASTHEAD_MISMATCH');
  // Preserve the original source. Only the obsolete internal approval sentence
  // is excluded from the public rendition, as recorded in the edition manifest.
  let articleBody = body.trimStart().slice(masthead.length);
  for (const note of record.internal_notes || []) {
    if (note !== 'Die persönlichen Wertungen und Wünsche sind ein zur Freigabe durch die Autorin formulierter Entwurf.'
      || !articleBody.includes(note)) fail('MANUAL_INTERNAL_NOTE_INVALID');
    articleBody = articleBody.replace(note, '');
  }
  const volumes = (record.book_volumes || []).map(volume => {
    const cover = volume.book_cover;
    if (!volume.title || !volume.label || !/^https:\/\/www\.amazon\.de\/dp\/[A-Z0-9]{10}$/.test(volume.url || '')
      || !cover || !safeFile(cover.file) || !/^https:\/\//.test(cover.source || '') || !cover.credit
      || !/^[a-f0-9]{64}$/.test(cover.sha256 || '') || !Number.isInteger(cover.width) || !Number.isInteger(cover.height)) fail('MANUAL_OFFICIAL_COVER_REQUIRED');
    if (root && sha(fs.readFileSync(path.join(root, 'assets/img/books', cover.file))) !== cover.sha256) fail('MANUAL_COVER_HASH_MISMATCH');
    return { title: volume.title, label: volume.label, author: fm.book_author, url: volume.url,
      cover: `/assets/img/books/${cover.file}`, coverSource: cover.source, coverCredit: cover.credit, coverWidth: cover.width, coverHeight: cover.height };
  });
  if (volumes.length !== 2) fail('MANUAL_BOOK_VOLUMES_REQUIRED');
  if (root && sha(fs.readFileSync(path.join(root, EDITORIAL_AUTHOR.image))) !== EDITORIAL_AUTHOR.image_sha256) fail('MANUAL_AUTHOR_PORTRAIT_CHANGED');
  return {
    analysis_id: `woek-manual-${sha(fm.slug).slice(0,16)}`, slug: fm.slug, format: BOOK_FORMAT,
    manual_only: true, editorial_mode: 'manual_manuscript', editorial_genre: 'author_contribution', self_authored_work: true,
    analysis_variant: 'standard', status: record.status, title: fm.title, subtitle: fm.subtitle, teaser: fm.subtitle,
    seo_description: fm.subtitle, published_at: record.published_at, updated_at: record.updated_at || record.published_at,
    reading_time_minutes: Math.ceil(articleBody.split(/\s+/).length / 210), author: EDITORIAL_AUTHOR,
    transparency_note: 'Persönlicher Autorinnenbeitrag zum eigenen Grundlagenwerk', subtype: 'Persönlicher Autorinnenbeitrag',
    body_markdown: articleBody, manuscript_sha256: sha(source), rendered: renderEditorialMarkdownWithFootnotes(articleBody),
    tags: ['Buch & Wirkung','Grundlagenwerk','Wirkungsökonomie'], sections: [],
    source_snapshot: [...new Set([...articleBody.matchAll(/https:\/\/[^\s)]+/g)].map(m => m[0]))].map(url => ({ url })),
    book: { ...volumes[0], title: fm.book_title, onlineUrl: fm.book_online, volumes }, manual_related_slugs: record.related_analysis_slugs || [], versions: record.versions || [],
  };
}

export function loadManualEditorials(root) {
  const directory = path.join(root, MANUAL_DIRECTORY), manifest = path.join(directory, "editions.json");
  if (!fs.existsSync(manifest)) return [];
  const data = JSON.parse(fs.readFileSync(manifest, "utf8"));
  if (data.schema_version !== "1.0" || !Array.isArray(data.entries)) fail("MANUAL_MANIFEST_INVALID");
  const slugs = new Set();
  return data.entries.map(record => {
    if (!safeFile(record.source_file) || !record.source_file.endsWith(".md") || slugs.has(record.slug)) fail("MANUAL_SOURCE_OR_DUPLICATE_INVALID");
    slugs.add(record.slug);
    return manualEdition(record, fs.readFileSync(path.join(directory, record.source_file), "utf8"), { root });
  });
}

export function renderBookCover(analysis, { eager = false } = {}) {
  if (analysis.book.volumes) return `<div class="news-book-volumes">${analysis.book.volumes.map(book => renderBookCover({ book }, { eager })).join('')}</div>`;
  const cover = analysis.book;
  return `<figure class="news-book-cover"><img src="${escape(cover.cover)}" width="${cover.coverWidth}" height="${cover.coverHeight}" alt="Offizielles Cover: ${escape(cover.title)} von ${escape(cover.author)}" loading="${eager ? "eager" : "lazy"}" decoding="async"><figcaption><a class="text-link" href="${escape(cover.coverSource)}" target="_blank" rel="noopener noreferrer">${escape(cover.coverCredit)}</a></figcaption></figure>`;
}

export function renderManualArticle(analysis) {
  const cover = analysis.book;
  const contents = `<details class="news-editorial-toc"><summary>${analysis.self_authored_work ? 'Inhalt des Autorinnenbeitrags' : 'Inhalt der Buchbesprechung'}</summary><ol>${analysis.rendered.headings.filter(h => h.level === 2).map(h => `<li><a href="#${h.id}">${escape(h.title)}</a></li>`).join("")}</ol></details>`;
  return contents + analysis.rendered.sections.map(s => {
    const personal = s.title === "Meine Einordnung", book = s.title === "Das Buch";
    if (personal) return renderEditorialSection(s, {portrait: analysis.author.image, portraitAlt: analysis.author.image_alt});
    return `<section class="news-editorial-article__section${personal ? " news-author-perspective" : ""}${book ? " news-book-metadata" : ""}" id="${s.id}"${personal ? ' aria-label="Persönliche Einordnung der Autorin"' : ""}>${book ? `<figure class="news-book-cover"><img src="${escape(cover.cover)}" width="${cover.coverWidth}" height="${cover.coverHeight}" alt="Offizielles Cover: ${escape(cover.title)} von ${escape(cover.author)}" loading="lazy" decoding="async"><figcaption><a class="text-link" href="${escape(cover.coverSource)}" target="_blank" rel="noopener noreferrer">${escape(cover.coverCredit)}</a></figcaption></figure><div>${s.html}</div>` : s.html}</section>`;
  }).join("\n");
}
