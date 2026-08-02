import fs from "node:fs";
import path from "node:path";
import { readerFileForRoute, readerRouteAliases, routeSlug } from "../library/reader-route-aliases.mjs";

const ROOT = process.cwd();
const SITE_URL = "https://wirkungsoekonomie.de";
const LIBRARY_ROOT = path.join(ROOT, "bibliothek", "eintraege");
const REFERENCE_ROOT = path.join(ROOT, "referenz");
const DETAILS_PATH = path.join(ROOT, "assets", "data", "library-source-details.json");

function fail(errors, file, message) {
  errors.push(`${path.relative(ROOT, file)}: ${message}`);
}

function textFromHtml(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function heading(html) {
  return textFromHtml(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/iu)?.[1] || "");
}

function getTitle(html) {
  return textFromHtml(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/iu)?.[1] || "");
}

function getDescription(html) {
  return html.match(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*\bcontent=["']([^"']*)["'][^>]*>/iu)?.[1] || "";
}

function getCanonical(html) {
  return html.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["'][^>]*>/iu)?.[1] || "";
}

function routeFor(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  return `/${rel.slice(0, -"index.html".length)}`;
}

function hasNoindex(html) {
  return /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*\bnoindex\b[^"']*["'])[^>]*>/iu.test(html);
}

function hasNoindexFollow(html) {
  return /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*\bnoindex\b[^"']*\bfollow\b[^"']*["'])[^>]*>/iu.test(html);
}

function isRedirect(html) {
  return /<meta\b(?=[^>]*\bhttp-equiv=["']refresh["'])[^>]*>/iu.test(html);
}

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function redirectsTo(html, route) {
  return new RegExp(`<meta\\b(?=[^>]*\\bhttp-equiv=["']refresh["'])(?=[^>]*\\bcontent=["'][^"']*\\burl\\s*=\\s*${escapeRegExp(route)}[^"']*["'])[^>]*>`, "iu").test(html);
}

function localNavigationTargetExists(file, rawHref) {
  const href = String(rawHref || "").split(/[?#]/u, 1)[0];
  if (!href || /^(?:[a-z][a-z0-9+.-]*:\/\/|\/\/)/iu.test(href)) return true;
  const target = href.startsWith("/")
    ? path.join(ROOT, href.replace(/^\/+/, ""))
    : path.resolve(path.dirname(file), href);
  if (!fs.existsSync(target)) return false;
  return !fs.statSync(target).isDirectory() || fs.existsSync(path.join(target, "index.html"));
}

function checkChapterNavigationTargets(errors, file, html) {
  const navigation = html.match(/<nav\b[^>]*\bclass=["'][^"']*\bchapter-bottom-nav\b[^"']*["'][^>]*>([\s\S]*?)<\/nav>/iu)?.[1] || "";
  for (const match of navigation.matchAll(/\bhref=["']([^"']+)["']/giu)) {
    if (!localNavigationTargetExists(file, match[1])) {
      fail(errors, file, "Kapitelnavigation verweist auf ein fehlendes Ziel: " + match[1]);
    }
  }
}

function readerFiles() {
  if (!fs.existsSync(LIBRARY_ROOT)) return [];
  const files = [];
  for (const entry of fs.readdirSync(LIBRARY_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const reader = path.join(LIBRARY_ROOT, entry.name, "lesen");
    if (!fs.existsSync(reader)) continue;
    for (const child of fs.readdirSync(reader, { withFileTypes: true })) {
      if (child.isFile() && child.name === "index.html") files.push(path.join(reader, child.name));
      if (child.isDirectory()) {
        const page = path.join(reader, child.name, "index.html");
        if (fs.existsSync(page)) files.push(page);
      }
    }
  }
  return files;
}

function walkIndexFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const item = path.join(dir, entry.name);
    if (entry.isDirectory()) walkIndexFiles(item, files);
    else if (entry.isFile() && entry.name === "index.html") files.push(item);
  }
  return files;
}

function readerRootFor(file) {
  return path.basename(path.dirname(file)) === "lesen" ? path.dirname(file) : path.join(path.dirname(file), "..");
}

function isReaderRoot(file) {
  return path.basename(path.dirname(file)) === "lesen";
}

function detailSlugFor(file) {
  return path.basename(path.dirname(readerRootFor(file)));
}

function loadDetails() {
  if (!fs.existsSync(DETAILS_PATH)) return new Map();
  const entries = JSON.parse(fs.readFileSync(DETAILS_PATH, "utf8")).entries || [];
  return new Map(entries.filter((entry) => entry?.detailSlug).map((entry) => [entry.detailSlug, entry]));
}

const technicalReaderNote = /\b(?:CodeX|Codex)\b|\b(?:interne[rs]?\s+)?Repository(?:-|\s)*(?:Anweisungen?|Pfade?|Strukturen?|Informationen?|Hinweise?)\b|\bRedaktioneller Hinweis\b|\b(?:Import-Version|Source-Hash|Live-Reference|Reviewstatus|UX-priorisiert|partially-delta-reviewed)\b|\bExportpfad\b|bestätigten DOCX-Fassung/iu;
const pathText = /(?:download-or-document|assets\/downloads|\/(?:bibliothek|eintraege|lesen)\/|index\.html|file:\/\/)/iu;
const errors = [];
const detailsBySlug = loadDetails();
const libraryFiles = readerFiles();
const libraryGroups = new Map();
const aliasBySourceRoute = new Map(readerRouteAliases.map((alias) => [alias.from, alias]));

for (const file of libraryFiles) {
  const root = path.resolve(readerRootFor(file));
  if (!libraryGroups.has(root)) libraryGroups.set(root, []);
  libraryGroups.get(root).push(file);
}

for (const file of libraryFiles) {
  const html = fs.readFileSync(file, "utf8");
  const route = routeFor(file);
  const alias = aliasBySourceRoute.get(route);
  if (alias) {
    const targetFile = readerFileForRoute(ROOT, alias.to);
    if (!fs.existsSync(targetFile)) fail(errors, file, `Alias-Zielroute fehlt: ${alias.to}`);
    if (!hasNoindexFollow(html)) fail(errors, file, "Aliasroute braucht noindex,follow.");
    if (!isRedirect(html)) fail(errors, file, "Aliasroute braucht eine Weiterleitung.");
    if (!redirectsTo(html, alias.to)) fail(errors, file, `Aliasroute muss auf ${alias.to} weiterleiten.`);
    if (getCanonical(html) !== `${SITE_URL}${alias.to}`) {
      fail(errors, file, `Alias-Canonical muss ${SITE_URL}${alias.to} sein.`);
    }
    if (!new RegExp(`<a\\b[^>]*\\bhref=["']${escapeRegExp(alias.to)}["']`, "iu").test(html)) {
      fail(errors, file, "Aliasroute braucht einen sichtbaren Link zum Ziel.");
    }
    continue;
  }
  if (route.includes("-codex")) fail(errors, file, "indexierbare Reader-Route enthält einen redaktionellen Tool-Slug.");
  const title = getTitle(html);
  const description = getDescription(html);
  const expectedCanonical = `${SITE_URL}${routeFor(file)}`;
  const meta = detailsBySlug.get(detailSlugFor(file));
  if (!title || pathText.test(title)) fail(errors, file, "Seitentitel fehlt oder enthält Pfadtext.");
  if (!description || pathText.test(description)) fail(errors, file, "Beschreibung fehlt oder enthält Pfadtext.");
  if (getCanonical(html) !== expectedCanonical) fail(errors, file, `Canonical muss ${expectedCanonical} sein.`);
  if (!heading(html)) fail(errors, file, "sichtbare H1 fehlt.");
  if (!/class=["'][^"']*\bbreadcrumb\b[^"']*["']/iu.test(html)) fail(errors, file, "Brotkrumennavigation fehlt.");
  if (technicalReaderNote.test(textFromHtml(html))) fail(errors, file, "sichtbarer technischer oder redaktioneller Hinweis.");

  if (isReaderRoot(file)) {
    const family = libraryGroups.get(path.resolve(readerRootFor(file))) || [];
    const hasChapters = family.some((candidate) => !isReaderRoot(candidate));
    if (hasChapters && !/class=["'][^"']*\breader-toc\b[^"']*["']/iu.test(html)) {
      fail(errors, file, "Inhaltsübersicht für kapitelweise Lesefassung fehlt.");
    }
  } else {
    if (!/class=["'][^"']*\bchapter-bottom-nav\b[^"']*["']/iu.test(html)) fail(errors, file, "Vor-/Zurück-Navigation fehlt.");
    if (!/<a\b[^>]*href=["']\.\.\/["'][^>]*>\s*Inhaltsübersicht\s*<\/a>/iu.test(html)) {
      fail(errors, file, "Link zur Inhaltsübersicht fehlt.");
    }
  }

  if (!isReaderRoot(file)) checkChapterNavigationTargets(errors, file, html);

  if (!meta?.status) continue;
  const status = String(meta.status).trim().toLocaleLowerCase("de-DE");
  const marker = new RegExp(`\\bdata-reader-status=["']${status.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "iu");
  if (!marker.test(html)) fail(errors, file, `sichtbare Status-Einordnung für „${meta.status}“ fehlt.`);
  if (["ersetzt", "archiviert"].includes(status) && !hasNoindexFollow(html)) {
    fail(errors, file, `historische Fassung „${meta.status}“ braucht noindex,follow.`);
  }
  if (["arbeitsfassung", "ältere fassung", "aktuell", "führend"].includes(status) && hasNoindex(html)) {
    fail(errors, file, `Status „${meta.status}“ darf nicht pauschal noindex sein.`);
  }
}

for (const alias of readerRouteAliases) {
  const sourceFile = readerFileForRoute(ROOT, alias.from);
  const targetFile = readerFileForRoute(ROOT, alias.to);
  if (!fs.existsSync(sourceFile)) {
    errors.push(`Reader-Alias fehlt: ${alias.from}`);
    continue;
  }
  if (!fs.existsSync(targetFile)) {
    errors.push(`Reader-Alias-Ziel fehlt: ${alias.to}`);
    continue;
  }
  const targetHtml = fs.readFileSync(targetFile, "utf8");
  if (hasNoindex(targetHtml) || isRedirect(targetHtml)) {
    fail(errors, targetFile, `Alias-Ziel ${alias.to} muss eine indexierbare Lesefassung bleiben.`);
  }
  const relativeAliasHref = `../${routeSlug(alias.from)}/`;
  const aliasReaderRoot = path.resolve(readerRootFor(sourceFile));
  for (const file of libraryFiles) {
    if (routeFor(file) === alias.from) continue;
    const html = fs.readFileSync(file, "utf8");
    const belongsToAliasReader = path.resolve(readerRootFor(file)) === aliasReaderRoot;
    if (html.includes(alias.from) || (belongsToAliasReader && html.includes(relativeAliasHref))) {
      fail(errors, file, `Navigation verweist noch auf die Aliasroute ${alias.from}.`);
    }
  }
}

const referenceFiles = walkIndexFiles(REFERENCE_ROOT);
const indexedReferenceFiles = referenceFiles.filter((file) => {
  const html = fs.readFileSync(file, "utf8");
  return !hasNoindex(html) && !isRedirect(html);
});

for (const file of indexedReferenceFiles) {
  const html = fs.readFileSync(file, "utf8");
  const title = getTitle(html);
  const description = getDescription(html);
  const expectedCanonical = `${SITE_URL}${routeFor(file)}`;
  if (!title || pathText.test(title)) fail(errors, file, "Seitentitel fehlt oder enthält Pfadtext.");
  if (!description || pathText.test(description)) fail(errors, file, "Beschreibung fehlt oder enthält Pfadtext.");
  if (getCanonical(html) !== expectedCanonical) fail(errors, file, `Canonical muss ${expectedCanonical} sein.`);
  if (technicalReaderNote.test(textFromHtml(html))) fail(errors, file, "sichtbarer technischer oder redaktioneller Hinweis.");
}

const chapterFiles = indexedReferenceFiles
  .filter((file) => /^referenz\/kapitel-\d+(?:-|\/)/u.test(path.relative(ROOT, file).split(path.sep).join("/")))
  .sort((left, right) => Number(path.basename(path.dirname(left)).match(/^kapitel-(\d+)/u)?.[1]) - Number(path.basename(path.dirname(right)).match(/^kapitel-(\d+)/u)?.[1]));

if (!chapterFiles.length) {
  errors.push("referenz: keine öffentlichen Kapitelreader gefunden.");
}

for (const [index, file] of chapterFiles.entries()) {
  const html = fs.readFileSync(file, "utf8");
  if (!heading(html)) fail(errors, file, "Kapitel-H1 fehlt.");
  if (!/class=["'][^"']*\bchapter-bottom-nav\b[^"']*["']/iu.test(html)) fail(errors, file, "Kapitel-Navigation fehlt.");
  if (!/class=["'][^"']*\bbreadcrumb\b[^"']*["']/iu.test(html)) fail(errors, file, "Kapitel-Brotkrume fehlt.");
  if (index > 0 && !/Vorheriges Kapitel/iu.test(html)) fail(errors, file, "Link zum vorherigen Kapitel fehlt.");
  if (index < chapterFiles.length - 1 && !/Nächstes Kapitel/iu.test(html)) fail(errors, file, "Link zum nächsten Kapitel fehlt.");
}

const duplicateChapterTitles = new Map();
for (const file of chapterFiles) {
  const title = getTitle(fs.readFileSync(file, "utf8"));
  if (!duplicateChapterTitles.has(title)) duplicateChapterTitles.set(title, []);
  duplicateChapterTitles.get(title).push(file);
}
for (const [title, files] of duplicateChapterTitles) {
  if (files.length > 1) errors.push(`referenz: doppelter Kapitel-Seitentitel „${title}“ (${files.length} Seiten).`);
}

if (errors.length) {
  const preview = errors.slice(0, 120).join("\n");
  console.error(`Online-Reader-Qualität fehlgeschlagen (${errors.length} Befund(e)):\n${preview}${errors.length > 120 ? `\n… ${errors.length - 120} weitere Befunde` : ""}`);
  process.exit(1);
}

console.log(`Online-Reader-Qualität bestanden: ${libraryFiles.length} Bibliotheksseiten, ${indexedReferenceFiles.length} indexierbare Referenzseiten und ${chapterFiles.length} Kapitelreader geprüft.`);
