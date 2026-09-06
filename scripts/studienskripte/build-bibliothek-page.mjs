#!/usr/bin/env node
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

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statusLabel(status) {
  if (status === "pilot-arbeitsfassung") return "Pilot-Arbeitsfassung";
  if (status === "rohfassung-v0") return "Rohfassung V0";
  if (status === "studienskript-v1-rohfassung") return "V1-Rohfassung";
  if (status === "studienskript-v1") return "Studienskript V1";
  return status;
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "abschnitt";
}

function inlineHtml(value) {
  const text = String(value ?? "");
  const parts = [];
  const linkPattern = /\[([^\]]+)\]\(([^)\s]+)(?:\s+[^)]*)?\)/g;
  let offset = 0;
  let match;
  const emphasis = (part) => esc(part)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  while ((match = linkPattern.exec(text))) {
    parts.push(emphasis(text.slice(offset, match.index)));
    const href = match[2].trim();
    const external = /^https?:\/\//i.test(href);
    parts.push(`<a class="text-link" href="${esc(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${emphasis(match[1])}</a>`);
    offset = linkPattern.lastIndex;
  }
  parts.push(emphasis(text.slice(offset)));
  return parts.join("");
}

function renderReader(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").replace(/^---[\s\S]*?---\s*/, "").split("\n");
  const toc = [];
  const html = [];
  const used = new Set();
  let paragraph = [];
  let list = [];
  let table = [];
  let paragraphCount = 0;
  const uniqueId = (value) => {
    const base = slugify(value);
    let id = base;
    let suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id);
    return id;
  };
  const flushParagraph = () => {
    if (!paragraph.length) return;
    paragraphCount += 1;
    html.push(`<p id="${uniqueId(`absatz-${paragraphCount}`)}">${inlineHtml(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${inlineHtml(item)}</li>`).join("")}</ul>`);
    list = [];
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table
      .map((row) => row.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()))
      .filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)));
    if (rows.length > 1) {
      const [head, ...body] = rows;
      html.push(`<div class="table-wrap"><table class="data-table"><thead><tr>${head.map((cell) => `<th>${inlineHtml(cell)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inlineHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    }
    table = [];
  };
  const heading = (level, text) => {
    flushParagraph();
    flushList();
    flushTable();
    const plain = String(text).replace(/[*`]/g, "").trim();
    const id = uniqueId(plain);
    toc.push({ level, text: plain, id });
    html.push(`<h${level} id="${id}">${inlineHtml(plain)}</h${level}>`);
  };
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }
    const match = line.match(/^(#{1,4})\s+(.+)$/);
    if (match) {
      heading(Math.max(2, match[1].length), match[2]);
    } else if (line.startsWith("|") && line.endsWith("|")) {
      flushParagraph();
      flushList();
      table.push(line);
    } else if (/^(?:[-*]|\d+\.)\s+/.test(line)) {
      flushParagraph();
      flushTable();
      list.push(line.replace(/^(?:[-*]|\d+\.)\s+/, ""));
    } else {
      flushList();
      flushTable();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  flushTable();
  return { toc, html: html.join("\n") };
}

function buildReaderPage(script) {
  const source = readFileSync(join(ROOT, script.masterPath), "utf8");
  const { toc, html } = renderReader(source);
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
    <link rel="stylesheet" href="${base}assets/css/style.css">
  </head>
  <body>
    <header class="site-header" data-search-exclude>
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a>
      <nav class="site-nav" aria-label="Hauptnavigation"><a href="${base}verstehen/">Verstehen</a><a href="${base}lernen/">Lernen</a><a href="../">Studienskripte</a></nav>
    </header>
    <main data-pagefind-body>
      <section class="hero compact-hero document-library-hero"><p class="hero-kicker">Bibliothek · Studienskript ${esc(script.code)}</p><h1>${esc(script.title)}</h1><p class="hero-subtitle">Öffentliche Lesefassung · redaktionell freigegeben</p><div class="hero-actions"><button class="btn btn-secondary" type="button" onclick="window.print()">Seite drucken</button></div></section>
      <section class="section"><div class="card"><dl class="document-card-meta"><dt>Track</dt><dd>${esc(script.track)}</dd><dt>Status</dt><dd>Freigegebene Lesefassung</dd></dl></div></section>
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
            <p>${scripts.length} redaktionell freigegebene Lesefassungen.</p>
        </div>
        <div class="knowledge-library-grid">
          ${scripts.map((script) => `
          <article class="knowledge-library-card">
            <div class="document-card-badges">
              <span class="status-badge">Studienskript</span>
              <span class="status-badge">${esc(statusLabel(script.status))}</span>
            </div>
            <h3>${esc(script.code)}: ${esc(script.title)}</h3>
            <p>Diese öffentliche Lesefassung ist redaktionell freigegeben. PDF, Video und Präsentationsmaterial können unabhängig davon ergänzt werden.</p>
            <dl class="document-card-meta">
              <dt>Status</dt><dd>Freigegeben</dd>
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
    <header class="site-header" data-search-exclude>
      <a class="brand" href="../../index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="../../assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <nav class="site-nav" aria-label="Hauptnavigation">
        <a href="../../verstehen/">Verstehen</a>
        <a href="../../lernen/">Lernen</a>
        <a href="../">Bibliothek</a>
      </nav>
    </header>
    <main data-pagefind-body>
      <section class="hero compact-hero document-library-hero">
        <p class="hero-kicker">Bibliothek · Studienskripte</p>
        <h1>Studienskripte der WÖk-Akademie</h1>
        <p class="hero-subtitle">Die ausführlichen Vorlesungsskripte sind öffentliche Wissensdokumente. Der Lernraum der Akademie nutzt sie für Reader, Notizen, PDF und Fortschritt; die Bibliothek macht sie frei lesbar und zitierbar.</p>
      </section>
      <section class="section section-muted">
        <div class="section-header">
          <h2>Produktionsstand</h2>
          <p>${releasedScripts.length} Studienskripte sind redaktionell freigegeben und hier online lesbar. Weitere Formate wie PDF, Video und Präsentationen erscheinen separat, sobald sie final vorliegen.</p>
        </div>
      </section>
${sections}
      <section class="section section-muted">
        <div class="section-header">
          <h2>Grenze zu Prüfungen</h2>
          <p>Mini-Quiz und Verständnisfragen können im Skript öffentlich stehen. Zertifikatsprüfungen, Antwortlogik, CorrectAnswer-Felder, Scoring-Regeln und Fallrubrics bleiben geschützt in der Akademie-App.</p>
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
