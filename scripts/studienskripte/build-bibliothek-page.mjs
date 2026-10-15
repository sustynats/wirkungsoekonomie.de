#!/usr/bin/env node
import {renderSiteHeader} from '../lib/site-shell.mjs';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const registry = JSON.parse(readFileSync(join(ROOT, "content", "studienskripte", "index.json"), "utf8"));
const releasedScripts = registry.scripts.filter((script) => script.editorialStatus === "freigegeben");

const byTrack = new Map();
for (const script of releasedScripts) {
  const list = byTrack.get(script.track) ?? [];
  list.push(script);
  byTrack.set(script.track, list);
}

import { historicalPublicScriptBody, historicalHeadingTitle } from './legacy-public-script.mjs';
import { esc, renderReader } from './reader-renderer.mjs';

const legacyAnchors = JSON.parse(readFileSync(join(ROOT, 'content/studienskripte/legacy-public-anchors.json'), 'utf8')).readers;

function buildReaderPage(script) {
  const source = readFileSync(join(ROOT, script.masterPath), "utf8");
  const rendered = renderReader(historicalPublicScriptBody(source));
  const previous = legacyAnchors[script.slug];
  if (!previous) throw new Error('Missing public anchor snapshot: '+script.slug);
  const key = value => historicalHeadingTitle(value).replace(/[*`_]/g,'').trim();
  const oldByTitle = new Map();
  for(const heading of previous.headings){const list=oldByTitle.get(key(heading.text))??[];list.push(heading.id);oldByTitle.set(key(heading.text),list);}
  const idMap = new Map();const used=new Set();
  const toc=rendered.toc.map(item=>{const candidates=oldByTitle.get(key(item.text))??[];let id=candidates.find(value=>!used.has(value))??item.id;used.add(id);idMap.set(item.id,id);return {...item,id};});
  const html=rendered.html.replace(/\bid="([^"]+)"/g,(_,id)=>`id="${esc(idMap.get(id)??id)}"`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  if(new Set(ids).size!==ids.length)throw new Error('Duplicate historical anchor: '+script.slug);
  const aliases=previous.ids.filter(id=>!ids.includes(id)).map(id=>`<span id="${esc(id)}"></span>`).join('');
  const base = "../../../";
  const destination = join(ROOT, script.publicPath, "index.html");
  mkdirSync(join(ROOT, script.publicPath), { recursive: true });
  const page = `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(script.title)} | WÖk-Akademie</title>
    <meta name="description" content="Öffentliche Lesefassung des Studienskripts ${esc(script.code)}: ${esc(script.title)}.">
    <meta name="search_title" content="${esc(script.code)}: ${esc(script.title)}">
    <meta name="search_section" content="Bibliothek · Studienskripte">
    <meta name="search_type" content="Studienskript">
    <meta name="robots" content="noindex,follow">
    <link rel="canonical" href="https://wirkungsoekonomie.de/${esc(script.publicPath)}">
    <link rel="stylesheet" href="${base}assets/css/style.css">
  </head>
  <body>
    ${renderSiteHeader(base, 'de')}
    <main data-pagefind-body>
      <section class="hero compact-hero document-library-hero"><p class="hero-kicker">Bibliothek · Studienskript ${esc(script.code)}</p><h1>${esc(script.title)}</h1><p class="hero-subtitle">Historische Lesefassung</p><div aria-hidden="true" class="historical-anchor-aliases">${aliases}</div><p>Diese Fassung dokumentiert einen früheren Skriptstand. <a href="../v4/">Zu den aktuellen Vorlesungsskripten des Curriculum 4.0</a>.</p><div class="hero-actions"><button class="btn btn-secondary" type="button" onclick="window.print()">Seite drucken</button></div></section>
      <section class="section"><div class="card"><dl class="document-card-meta"><dt>Studienbereich</dt><dd>${esc(script.track)}</dd><dt>Status</dt><dd>Historischer Skriptstand</dd></dl></div></section>
      <section class="section"><nav class="toc-card" aria-label="Inhaltsverzeichnis"><h2>Inhaltsverzeichnis</h2><div class="toc-links">${toc.map((item) => `<a class="toc-level-${item.level}" href="#${item.id}">${esc(item.text)}</a>`).join("")}</div></nav></section>
      <article class="section narrow">${html}</article>
    </main>
    <script src="${base}assets/js/main.js" defer></script>
  </body>
</html>\n`;
  writeFileSync(destination, page, "utf8");
}

function stripEditorialReaderResidue(html) {
  return String(html)
    .replace(/<(p|li)\b[^>]*>(?:(?!<\/?(?:p|li|section|aside|h[1-6]|div|ul|ol)\b)[\s\S])*?\b(?:Codex|Claude|CI\/CD|Markdown-Master|Word-Rohfassung|woek-akademie-app|CODEX-HANDOFF|Vorlesung-Template)\b(?:(?!<\/?(?:p|li|section|aside|h[1-6]|div|ul|ol)\b)[\s\S])*?<\/\1>/gi, "")
    .replace(/<ul>\s*<\/ul>/gi, "")
    .replace(/<p>\s*<\/p>/gi, "");
}

function sanitizeExistingReaderPages() {
  const libraryRoot = join(ROOT, "bibliothek", "studienskripte");
  if (!existsSync(libraryRoot)) return 0;
  let changed = 0;
  for (const entry of readdirSync(libraryRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const page = join(libraryRoot, entry.name, "index.html");
    if (!existsSync(page)) continue;
    const original = readFileSync(page, "utf8");
    const cleaned = stripEditorialReaderResidue(original);
    if (cleaned !== original) {
      writeFileSync(page, cleaned, "utf8");
      changed += 1;
    }
  }
  return changed;
}

const sections = Array.from(byTrack.entries()).map(([track, scripts]) => `
      <section class="section">
        <div class="section-header">
          <h2>${esc(track)}</h2>
            <p>${scripts.length} frühere Lesefassungen.</p>
        </div>
        <div class="knowledge-library-grid">
          ${scripts.map((script) => `
          <article class="knowledge-library-card">
            <div class="document-card-badges">
              <span class="status-badge">Studienskript</span>
              <span class="status-badge">Historische Lesefassung</span>
            </div>
            <h3>${esc(script.code)}: ${esc(script.title)}</h3>
            <p>Diese Lesefassung dokumentiert einen früheren Skriptstand. Der aktuelle Lehrstand steht im Curriculum 4.0.</p>
            <dl class="document-card-meta">
              <dt>Fassung</dt><dd>Historischer Skriptstand</dd>
              <dt>Format</dt><dd>Online-Lesefassung</dd>
            </dl>
            <p><a class="btn btn-primary" href="${esc(script.slug)}/">Lesefassung öffnen</a></p>
          </article>`).join("\n")}
        </div>
      </section>`).join("\n");

const html = `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Studienskripte | Bibliothek der Wirkungsökonomie</title>
    <meta name="description" content="Öffentlich lesbare Studienskripte der WÖk-Akademie: wissenschaftlich anschlussfähig, verständlich erklärt, mit Quellen, Tabellen, Bildern, Formeln und Glossar.">
    <meta name="search_title" content="Studienskripte | Bibliothek der Wirkungsökonomie">
    <meta name="search_description" content="Öffentlich lesbare Studienskripte der WÖk-Akademie mit Quellen, Tabellen, Bildern, Formeln, Glossar und Mini-Quiz.">
    <meta name="search_section" content="Bibliothek">
    <meta name="search_type" content="Studienskript">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260612-mobile-table-fix">
  </head>
  <body>
    ${renderSiteHeader('../../', 'de')}
    <main data-pagefind-body>
      <section class="hero compact-hero document-library-hero">
        <p class="hero-kicker">Bibliothek · Studienskripte</p>
        <h1>Studienskripte der WÖk-Akademie</h1>
        <p class="hero-subtitle">Die ausführlichen Vorlesungsskripte sind öffentliche Wissensdokumente. Der Lernraum der Akademie nutzt sie für Reader, Notizen, PDF und Fortschritt; die Bibliothek macht sie frei lesbar und zitierbar.</p>
      </section>
      <section class="section section-muted">
        <div class="section-header">
          <h2>Frühere Skriptfassungen</h2>
          <p>${releasedScripts.length} frühere Lesefassungen bleiben als Archiv zugänglich. Den aktuellen Lehrstand findest du in den <a href="v4/">178 Vorlesungsskripten des Curriculum 4.0</a>.</p>
        </div>
      </section>
${sections}
      <section class="section section-muted">
        <div class="section-header">
          <h2>Grenze zu Prüfungen</h2>
          <p>Die öffentlichen Skripte enthalten Übungen und Verständnisfragen. Zertifikatsprüfungen und deren Lösungen sind nur im persönlichen Studienraum zugänglich.</p>
        </div>
      </section>
    </main>
    <script src="../../assets/js/main.js" defer></script>
  </body>
</html>
`;

writeFileSync(join(ROOT, "bibliothek", "studienskripte", "index.html"), html.replace(/[ \t]+\n/g, "\n"), "utf8");
for (const script of releasedScripts) buildReaderPage(script);
const cleanedReaderPages = sanitizeExistingReaderPages();
if (cleanedReaderPages) console.log(`Redaktionelle Produktionshinweise aus ${cleanedReaderPages} Studienskript-Lesefassungen entfernt.`);

await import('./build-v4-readers.mjs');
