import fs from "node:fs";
import path from "node:path";
import { readerFileForRoute, readerRouteAliases, routeSlug } from "./reader-route-aliases.mjs";

const ROOT = process.cwd();
const LIBRARY_ROOT = path.join(ROOT, "bibliothek", "eintraege");
const DETAILS_PATH = path.join(ROOT, "assets", "data", "library-source-details.json");
const SITE_URL = "https://wirkungsoekonomie.de";
const STATUS_MARKER = "data-reader-version-status";
const TOC_START = "<!-- reader-generated-toc:start -->";
const TOC_END = "<!-- reader-generated-toc:end -->";
const ALIAS_BY_SOURCE_ROUTE = new Map(readerRouteAliases.map((alias) => [alias.from, alias]));
const CHAPTER_TITLE_OVERRIDES = new Map(readerRouteAliases.map((alias) => [alias.to, alias.title]));

const STATUS_COPY = new Map([
  ["führend", {
    label: "Führende Fassung",
    text: "Diese Lesefassung ist im Bibliotheksregister als maßgebliche Referenz dieses Dokuments eingeordnet."
  }],
  ["aktuell", {
    label: "Aktuelle Fassung",
    text: "Diese Lesefassung ist im Bibliotheksregister als aktueller Dokumentstand eingeordnet."
  }],
  ["Arbeitsfassung", {
    label: "Arbeitsfassung",
    text: "Diese Lesefassung dokumentiert eine konzeptionelle Ausarbeitung. Modellannahmen und Anwendungsbeispiele sind als solche zu lesen."
  }],
  ["ältere Fassung", {
    label: "Ältere Fassung",
    text: "Diese Lesefassung bleibt für nachvollziehbare Zitate und die Entwicklungsgeschichte zugänglich. Der Dokumenteintrag ordnet ihren Stand ein."
  }],
  ["ersetzt", {
    label: "Historische, ersetzte Fassung",
    text: "Diese Lesefassung bleibt als historische Quelle zugänglich, ist aber nicht der aktuelle fachliche Stand."
  }],
  ["archiviert", {
    label: "Historische Archivfassung",
    text: "Diese Lesefassung bleibt für bestehende Fundstellen zugänglich, ist aber nicht der aktuelle fachliche Stand."
  }]
]);

function textFromHtml(value = "") {
  return String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s*#\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function heading(html) {
  return textFromHtml(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/iu)?.[1] || "");
}

function titleFor(chapter, documentTitle) {
  const base = chapter && chapter !== documentTitle
    ? `${chapter} – ${documentTitle}`
    : `${documentTitle || chapter} – Onlinefassung`;
  const clipped = base.length > 118 ? `${base.slice(0, 115).trimEnd()}…` : base;
  return `${clipped} | Bibliothek der Wirkungsökonomie`;
}

function routeFor(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  return rel.endsWith("/index.html") ? `/${rel.slice(0, -"index.html".length)}` : `/${rel}`;
}

function readerRootRoute(route) {
  return String(route || "").replace(/[^/]+\/$/u, "");
}

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function replaceHref(html, from, to) {
  const pattern = new RegExp(`(href=["'])${escapeRegExp(from)}(["'])`, "giu");
  return html.replace(pattern, (_match, start, end) => `${start}${to}${end}`);
}

function replaceChapterLink(html, from, to, label) {
  const pattern = new RegExp(`(<a\\b[^>]*\\bhref=["'])${escapeRegExp(from)}(["'][^>]*>)([^<]*)(</a>)`, "giu");
  return html.replace(pattern, (_match, start, end, _oldLabel, close) => `${start}${to}${end}${escapeHtml(label)}${close}`);
}

function isReaderAliasFile(file) {
  return ALIAS_BY_SOURCE_ROUTE.has(routeFor(file));
}

function isRedirect(html) {
  return /<meta\b(?=[^>]*\bhttp-equiv=["']refresh["'])[^>]*>/iu.test(html);
}

function redirectStub(alias) {
  const destination = escapeHtml(alias.to);
  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Lesefassung verschoben | Bibliothek der Wirkungsökonomie</title>
    <meta name="robots" content="noindex,follow">
    <meta http-equiv="refresh" content="0; url=${destination}">
    <link rel="canonical" href="${SITE_URL}${destination}">
    <link rel="stylesheet" href="/assets/css/style.css?v=20260712-reader">
  </head>
  <body>
    <main class="section" data-search-exclude>
      <article class="article-shell reference-reader">
        <h1>Diese Lesefassung wurde verschoben</h1>
        <p>Du wirst zur aktuellen, zitierbaren Lesefassung weitergeleitet.</p>
        <p><a class="btn btn-primary" href="${destination}">Zur Lesefassung</a></p>
      </article>
    </main>
  </body>
</html>
`;
}

function migrateReaderRouteAliases() {
  let moved = 0;
  for (const alias of readerRouteAliases) {
    const fromFile = readerFileForRoute(ROOT, alias.from);
    const toFile = readerFileForRoute(ROOT, alias.to);
    const sourceExists = fs.existsSync(fromFile);
    const targetExists = fs.existsSync(toFile);
    const sourceIsRedirect = sourceExists && isRedirect(fs.readFileSync(fromFile, "utf8"));

    if (alias.mode === "rename" && sourceExists && !targetExists && !sourceIsRedirect) {
      fs.mkdirSync(path.dirname(path.dirname(toFile)), { recursive: true });
      fs.renameSync(path.dirname(fromFile), path.dirname(toFile));
      moved += 1;
    }
    if (!fs.existsSync(toFile)) {
      throw new Error(`Reader-Zielroute fehlt für Alias ${alias.id}: ${alias.to}`);
    }
  }
  return moved;
}

function writeReaderRedirectStubs() {
  let written = 0;
  for (const alias of readerRouteAliases) {
    const targetFile = readerFileForRoute(ROOT, alias.to);
    if (!fs.existsSync(targetFile)) {
      throw new Error(`Reader-Zielroute fehlt für Alias ${alias.id}: ${alias.to}`);
    }
    const sourceFile = readerFileForRoute(ROOT, alias.from);
    const stub = redirectStub(alias);
    if (!fs.existsSync(sourceFile) || fs.readFileSync(sourceFile, "utf8") !== stub) {
      fs.mkdirSync(path.dirname(sourceFile), { recursive: true });
      fs.writeFileSync(sourceFile, stub);
      written += 1;
    }
  }
  return written;
}

function repairKnownReaderNavigation(file, html) {
  const route = routeFor(file);
  for (const alias of readerRouteAliases) {
    const oldRelative = `../${routeSlug(alias.from)}/`;
    const newRelative = `../${routeSlug(alias.to)}/`;
    if (alias.mode === "retire" && route === alias.to && alias.predecessor) {
      html = replaceChapterLink(
        html,
        oldRelative,
        `../${routeSlug(alias.predecessor)}/`,
        "← Social Media"
      );
      html = replaceHref(html, alias.from, alias.predecessor);
    } else {
      html = replaceHref(html, oldRelative, newRelative);
      html = replaceHref(html, alias.from, alias.to);
    }
    if (alias.mode === "retire" && route === alias.predecessor) {
      html = replaceChapterLink(html, newRelative, newRelative, `${alias.title} →`);
    }
  }
  return html;
}

function ensurePoliticalStandardToc(html, file) {
  const alias = readerRouteAliases.find((entry) => entry.id === "political-standard-public-content-requirements");
  if (!alias || routeFor(file) !== readerRootRoute(alias.to)) return html;
  const targetHref = `${routeSlug(alias.to)}/`;
  const oldHref = `${routeSlug(alias.from)}/`;
  const item = `<li class="reader-toc-chapter"><a class="reader-toc-link" href="${targetHref}"><span class="reader-toc-num">8</span> ${escapeHtml(alias.title)}</a></li>`;
  const targetPattern = new RegExp(`<li\\b[^>]*\\bclass=["'][^"']*\\breader-toc-chapter\\b[^"']*["'][^>]*>\\s*<a\\b[^>]*\\bhref=["']${escapeRegExp(targetHref)}["'][^>]*>[\\s\\S]*?</a>\\s*</li>`, "iu");
  if (targetPattern.test(html)) return html.replace(targetPattern, item);
  const oldPattern = new RegExp(`<li\\b[^>]*\\bclass=["'][^"']*\\breader-toc-chapter\\b[^"']*["'][^>]*>\\s*<a\\b[^>]*\\bhref=["']${escapeRegExp(oldHref)}["'][^>]*>[\\s\\S]*?</a>\\s*</li>`, "iu");
  if (oldPattern.test(html)) return html.replace(oldPattern, item);
  const sourcesHref = "08-quellen-und-interne-referenzen/";
  const sourceItem = new RegExp(`(<li\\b[^>]*\\bclass=["'][^"']*\\breader-toc-chapter\\b[^"']*["'][^>]*>\\s*<a\\b[^>]*\\bhref=["']${escapeRegExp(sourcesHref)}["'])`, "iu");
  return html.replace(sourceItem, `${item}$1`);
}

function normalizeAliasTargetTocLabels(html, file) {
  if (!isReaderRoot(file)) return html;
  for (const alias of readerRouteAliases.filter((entry) => entry.mode === "retire")) {
    if (routeFor(file) !== readerRootRoute(alias.to)) continue;
    const href = `${routeSlug(alias.to)}/`;
    const pattern = new RegExp(`(<li\\b[^>]*\\bclass=["'][^"']*\\breader-toc-chapter\\b[^"']*["'][^>]*>\\s*<a\\b[^>]*\\bhref=["']${escapeRegExp(href)}["'][^>]*>\\s*<span\\b[^>]*\\breader-toc-num\\b[^>]*>[^<]*<\\/span>)\\s*[^<]*(<\\/a>\\s*<\\/li>)`, "iu");
    html = html.replace(pattern, (_match, start, end) => `${start} ${escapeHtml(alias.title)}${end}`);
  }
  return html;
}

function relativeBase(file) {
  const relative = path.relative(path.dirname(file), ROOT).split(path.sep).join("/");
  return relative ? `${relative}/` : "";
}

function readerFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const reader = path.join(dir, entry.name, "lesen");
    if (!fs.existsSync(reader)) continue;
    for (const child of fs.readdirSync(reader, { withFileTypes: true })) {
      if (child.name === "index.html" && child.isFile()) files.push(path.join(reader, child.name));
      if (child.isDirectory()) {
        const page = path.join(reader, child.name, "index.html");
        if (fs.existsSync(page)) files.push(page);
      }
    }
  }
  return files;
}

function loadDetails() {
  if (!fs.existsSync(DETAILS_PATH)) return new Map();
  try {
    const entries = JSON.parse(fs.readFileSync(DETAILS_PATH, "utf8")).entries || [];
    return new Map(entries.filter((entry) => entry?.detailSlug).map((entry) => [entry.detailSlug, entry]));
  } catch (error) {
    console.warn(`Bibliotheks-Metadaten konnten nicht gelesen werden: ${error.message}`);
    return new Map();
  }
}

function isPathText(value = "") {
  return /(?:^|[\s/])(?:assets|downloads|bibliothek|eintraege|lesen|index\.html)(?:[\s/]|$)|(?:^|[-_/])download-or-document/i.test(value);
}

function publicDocumentTitle(meta, overviewHtml, html) {
  const candidates = [meta?.title, heading(overviewHtml), heading(html)]
    .map((value) => textFromHtml(value).replace(/\s+#\s*$/u, "").trim())
    .filter(Boolean);
  return candidates.find((value) => !isPathText(value)) || "Bibliotheksdokument";
}

function readerRootFor(file) {
  return path.basename(path.dirname(file)) === "lesen" ? path.dirname(file) : path.join(path.dirname(file), "..");
}

function isReaderRoot(file) {
  return path.basename(path.dirname(file)) === "lesen";
}

function normalizeEditorialLabelText(value = "") {
  return String(value)
    .replace(/Mindestanforderungen\s+in\s+CodeX/giu, "Mindestanforderungen für öffentliche Inhalte")
    .replace(/\bund\s+CodeX\b/giu, "öffentliche Begriffsverwendung")
    .replace(/\bCodeX-Umsetzungen?\b/giu, "öffentliche Anwendung");
}

function fallbackChapterTitle(file) {
  const directory = path.basename(path.dirname(file))
    .replace(/^\d+-/u, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!directory) return "Abschnitt";
  const title = directory.charAt(0).toLocaleUpperCase("de-DE") + directory.slice(1);
  const normalized = normalizeEditorialLabelText(title);
  return normalized.charAt(0).toLocaleUpperCase("de-DE") + normalized.slice(1);
}

function statusKey(value = "") {
  return String(value).trim().toLocaleLowerCase("de-DE");
}

function isHistoricalStatus(status) {
  return ["ersetzt", "archiviert"].includes(statusKey(status));
}

function replacementFor(meta, base) {
  const searchable = `${meta?.title || ""} ${meta?.primaryUrl || ""} ${meta?.shortDescription || ""}`.toLocaleLowerCase("de-DE");
  if (/t-sroi|impact.controlling|wirkungscontrolling|working.paper.wohnungsmarkt/u.test(searchable)) {
    return { href: `${base}werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/`, label: "Aktuellen T-SROI-Rechenstandard lesen" };
  }
  if (/gesundheit.*pflege|pflege.*gesundheit/u.test(searchable)) {
    return { href: `${base}wirkungsfelder/gesundheit-pflege/dossiers/`, label: "Korrekturfassung Gesundheit & Pflege lesen" };
  }
  if (/begriffsleitfaden/u.test(searchable)) {
    return { href: `${base}begriffe/`, label: "Aktuelles Glossar öffnen" };
  }
  return null;
}

function statusBlock(meta, documentTitle, file) {
  const status = statusKey(meta?.status);
  const config = STATUS_COPY.get(meta?.status) || STATUS_COPY.get(status);
  if (!config) return "";
  const base = relativeBase(file);
  const documentEntry = `${base}bibliothek/eintraege/${meta.detailSlug}/`;
  const replacement = replacementFor(meta, base);
  const links = [
    replacement ? `<a href="${escapeHtml(replacement.href)}">${escapeHtml(replacement.label)}</a>` : "",
    `<a href="${escapeHtml(documentEntry)}">Dokumenteintrag</a>`
  ].filter(Boolean).join(" · ");
  const statusClass = status.replace(/[^a-z0-9]+/giu, "-").replace(/^-|-$/g, "") || "eingeordnet";
  return `\n        <aside class="notice reader-version-notice reader-version-notice--${statusClass}" ${STATUS_MARKER} data-reader-status="${escapeHtml(status)}">\n          <strong>${escapeHtml(config.label)}</strong>\n          <p>${escapeHtml(config.text)} ${links}</p>\n        </aside>`;
}

function removeStatusBlock(html) {
  return html.replace(new RegExp(`\\s*<aside\\b(?=[^>]*\\b${STATUS_MARKER}\\b)[^>]*>[\\s\\S]*?<\\/aside>`, "giu"), "");
}

function insertStatusBlock(html, block) {
  if (!block) return html;
  const articleStart = html.indexOf("<article");
  const headerEnd = articleStart >= 0 ? html.indexOf("</header>", articleStart) : -1;
  if (headerEnd >= 0) {
    const end = headerEnd + "</header>".length;
    return `${html.slice(0, end)}${block}${html.slice(end)}`;
  }
  const mainOpen = html.indexOf("<main");
  const mainEnd = mainOpen >= 0 ? html.indexOf(">", mainOpen) : -1;
  return mainEnd >= 0 ? `${html.slice(0, mainEnd + 1)}${block}${html.slice(mainEnd + 1)}` : html;
}

function setNoindexFollow(html) {
  const robots = /<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/iu;
  if (robots.test(html)) {
    return html.replace(robots, (tag) => /\bcontent=["'][^"']*["']/iu.test(tag)
      ? tag.replace(/\bcontent=["'][^"']*["']/iu, 'content="noindex,follow"')
      : tag.replace(/\/?\s*>$/u, ' content="noindex,follow">'));
  }
  return html.replace(/<head(\s[^>]*)?>/iu, (head) => `${head}\n    <meta name="robots" content="noindex,follow">`);
}

function normalizeEditorialLabels(html) {
  return normalizeEditorialLabelText(html);
}

function removeEditorialReaderText(html) {
  const technicalNote = /\b(?:codex|codex)\b|\b(?:interne[rs]?\s+)?repository(?:-|\s)*(?:anweisungen?|pfade?|strukturen?|informationen?|hinweise?)\b|\bredaktioneller\s+hinweis\b|\b(?:interne[rs]?\s+)?(?:arbeitsauftrag|prompts?|build[-\s]*(?:schritte?|notizen?)|testnotizen?|ki-anweisungen?)\b/iu;
  const withoutNotes = normalizeEditorialLabels(html)
    .replace(/<(p|li|h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/giu, (block, tag, inner) => technicalNote.test(textFromHtml(inner)) ? "" : block);
  return withoutNotes.replace(/<p\b[^>]*>\s*[-–-]?\s*(?:Anweisungen|Umsetzungen?)\.?\s*<\/p>/giu, "");
}

function updateReaderHeading(html, documentTitle) {
  return html.replace(/(<h1\b[^>]*>)[\s\S]*?(<\/h1>)/iu, `$1${escapeHtml(documentTitle)}$2`);
}

function ensureChapterHeading(html, chapter) {
  if (heading(html)) return html;
  return html.replace(/(<p\b[^>]*\bclass=["'][^"']*hero-kicker[^"']*["'][^>]*>[\s\S]*?<\/p>)/iu, `$1\n          <h1 id="kapitel" class="reader-heading">${escapeHtml(chapter)}<a class="cite-anchor" href="#kapitel" aria-label="Kapitel verlinken" data-copy-anchor>#</a></h1>`);
}

function updateChapterHeading(html, chapter) {
  return html.replace(/(<h1\b[^>]*>)([\s\S]*?)(<\/h1>)/iu, (_match, open, inner, close) => {
    const citeAnchor = inner.match(/<a\b[^>]*\bdata-copy-anchor\b[^>]*>[\s\S]*?<\/a>/iu)?.[0] || "";
    return `${open}${escapeHtml(chapter)}${citeAnchor}${close}`;
  });
}

function chapterPages(readerRoot) {
  if (!fs.existsSync(readerRoot)) return [];
  return fs.readdirSync(readerRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(readerRoot, entry.name, "index.html")))
    .map((entry) => {
      const file = path.join(readerRoot, entry.name, "index.html");
      const html = fs.readFileSync(file, "utf8");
      return {
        slug: entry.name,
        title: normalizeEditorialLabelText(heading(html) || fallbackChapterTitle(file))
      };
    })
    .filter((chapter) => !ALIAS_BY_SOURCE_ROUTE.has(`${routeFor(path.join(readerRoot, chapter.slug, "index.html"))}`));
}

function ensureReaderToc(html, readerRoot) {
  const withoutGenerated = html.replace(new RegExp(`\\s*${TOC_START}[\\s\\S]*?${TOC_END}`, "gu"), "");
  if (/class=["'][^"']*\breader-toc\b[^"']*["']/iu.test(withoutGenerated)) return withoutGenerated;
  const chapters = chapterPages(readerRoot);
  if (!chapters.length) return withoutGenerated;
  const items = chapters.map((chapter, index) => `\n            <li class="reader-toc-chapter"><a class="reader-toc-link" href="${escapeHtml(chapter.slug)}/"><span class="reader-toc-num">${index + 1}</span> ${escapeHtml(chapter.title)}</a></li>`).join("");
  const toc = `\n        ${TOC_START}\n        <section class="term-section-card reader-generated-toc">\n          <p class="section-eyebrow">Inhalt</p>\n          <h2>Inhaltsverzeichnis</h2>\n          <p>Diese Lesefassung ist in ${chapters.length} Abschnitte gegliedert. Jede Überschrift hat eine eigene, zitierbare Adresse.</p>\n          <ol class="reader-toc">${items}\n          </ol>\n        </section>\n        ${TOC_END}`;
  return withoutGenerated.replace(/<\/article>/iu, `${toc}\n      </article>`);
}

function updateBreadcrumb(html, documentTitle) {
  return html.replace(/(<nav\b[^>]*\bclass=["'][^"']*\bbreadcrumb\b[^"']*["'][^>]*>)([\s\S]*?)(<\/nav>)/iu, (match, open, body, close) => {
    const updated = body.replace(/(<a\s+href=["'](?:\.\.\/){1,2}["'][^>]*>)[^<]*(<\/a>)(\s*\/\s*(?:<a[^>]*>\s*Onlinefassung\s*<\/a>|Onlinefassung))/iu, `$1${escapeHtml(documentTitle)}$2$3`);
    return `${open}${updated}${close}`;
  });
}

const movedAliases = migrateReaderRouteAliases();
const detailsBySlug = loadDetails();
let changed = 0;
let pages = 0;
let historicalPages = 0;
let redactedPages = 0;

for (const file of readerFiles(LIBRARY_ROOT)) {
  if (isReaderAliasFile(file)) continue;
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  const readerRoot = readerRootFor(file);
  const overview = path.join(readerRoot, "index.html");
  const overviewHtml = fs.existsSync(overview) ? fs.readFileSync(overview, "utf8") : html;
  const detailSlug = path.basename(path.dirname(readerRoot));
  const meta = detailsBySlug.get(detailSlug) || null;
  const documentTitle = publicDocumentTitle(meta, overviewHtml, html);
  const detectedChapter = heading(html) || (isReaderRoot(file) ? documentTitle : fallbackChapterTitle(file));
  const chapter = CHAPTER_TITLE_OVERRIDES.get(routeFor(file)) || detectedChapter;
  const title = titleFor(chapter, documentTitle);
  const canonical = `${SITE_URL}${routeFor(file)}`;

  const cleaned = removeEditorialReaderText(html);
  if (cleaned !== html) redactedPages += 1;
  html = cleaned;
  html = removeStatusBlock(html);
  if (isReaderRoot(file)) {
    html = updateReaderHeading(html, documentTitle);
    html = ensureReaderToc(html, readerRoot);
    html = ensurePoliticalStandardToc(html, file);
    html = normalizeAliasTargetTocLabels(html, file);
  }
  else {
    html = ensureChapterHeading(html, chapter);
    if (CHAPTER_TITLE_OVERRIDES.has(routeFor(file))) html = updateChapterHeading(html, chapter);
  }
  html = updateBreadcrumb(html, documentTitle);
  html = repairKnownReaderNavigation(file, html);

  if (/<title\b[^>]*>[\s\S]*?<\/title>/iu.test(html)) {
    html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/iu, `<title>${escapeHtml(title)}</title>`);
  }
  const description = `${documentTitle}: ${chapter === documentTitle ? "zitierbare Onlinefassung" : `${chapter}. Zitierbare Onlinefassung`}.`;
  if (/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/iu.test(html)) {
    html = html.replace(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/iu, `<meta name="description" content="${escapeHtml(description)}">`);
  } else {
    html = html.replace(/<\/head>/iu, `    <meta name="description" content="${escapeHtml(description)}">\n  </head>`);
  }
  if (/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/iu.test(html)) {
    html = html.replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/iu, `<link rel="canonical" href="${canonical}">`);
  } else {
    html = html.replace(/<\/head>/iu, `    <link rel="canonical" href="${canonical}">\n  </head>`);
  }
  html = insertStatusBlock(html, statusBlock(meta, documentTitle, file));
  if (isHistoricalStatus(meta?.status)) {
    html = setNoindexFollow(html);
    historicalPages += 1;
  }

  pages += 1;
  if (html !== before) {
    fs.writeFileSync(file, html);
    changed += 1;
  }
}

const writtenAliases = writeReaderRedirectStubs();

console.log(`Onlinefassungs-SEO normalisiert: ${changed}/${pages} Reader-Seiten (Registertitel, Canonical, Status und Historienlogik).`);
console.log(`  Historische Reader noindex,follow: ${historicalPages}; technische Redaktionsreste entfernt: ${redactedPages}.`);
console.log(`  Reader-Routen bereinigt: ${movedAliases} verschoben, ${writtenAliases} Alias-Weiterleitungen geschrieben.`);
