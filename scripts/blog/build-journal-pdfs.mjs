#!/usr/bin/env node
/**
 * Baut druckoptimierte PDF-Lesefassungen für alle veröffentlichten Journalartikel.
 *
 * Die PDFs sind bewusst statische Dateien: Sie funktionieren ohne JavaScript,
 * sind direkt verlinkbar und werden im öffentlichen Build nur ausgeliefert,
 * solange sie von einem Journalartikel referenziert werden.
 *
 * Aufruf:
 *   node scripts/blog/build-journal-pdfs.mjs
 *   node scripts/blog/build-journal-pdfs.mjs --only /blog/beispiel.html
 *   node scripts/blog/build-journal-pdfs.mjs --force
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const indexPath = path.join(root, "assets", "data", "blog-index.json");
const outputRoot = path.join(root, "assets", "pdf", "journal");
const manifestPath = path.join(root, "assets", "data", "journal-pdf-manifest.json");
const generatorVersion = "2026-07-29.2";
const onlyArgs = process.argv
  .filter((argument, index, all) => all[index - 1] === "--only")
  .map((value) => normalizeJournalUrl(value));
const force = process.argv.includes("--force");

function normalizeJournalUrl(value = "") {
  const clean = String(value).trim().replace(/^https?:\/\/wirkungsoekonomie\.de/i, "");
  if (!clean) return "";
  const withLeadingSlash = clean.startsWith("/") ? clean : `/${clean}`;
  return withLeadingSlash.replace(/\?.*$/, "").replace(/#.*$/, "");
}

function pdfRelativePath(url) {
  const normalized = normalizeJournalUrl(url);
  if (!normalized.startsWith("/blog/")) {
    throw new Error(`Kein Journalpfad: ${url}`);
  }
  const articlePath = normalized
    .replace(/^\/blog\//, "")
    .replace(/\.html$/i, ".pdf")
    .replace(/\/$/, "/index.pdf");
  return path.posix.join("assets/pdf/journal", articlePath);
}

function sourcePathForUrl(url) {
  return path.join(root, normalizeJournalUrl(url).replace(/^\//, ""));
}

function readManifest() {
  if (!fs.existsSync(manifestPath)) return { version: generatorVersion, entries: {} };
  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    return {
      version: String(parsed.version || ""),
      entries: parsed.entries && typeof parsed.entries === "object" ? parsed.entries : {},
    };
  } catch {
    return { version: generatorVersion, entries: {} };
  }
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function decodeHtml(value = "") {
  return String(value)
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&nbsp;", " ");
}

function stripTags(value = "") {
  return decodeHtml(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function firstMatch(value, patterns) {
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return stripTags(match[1]);
  }
  return "";
}

function extractMain(html) {
  return html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || "";
}

function extractHero(main) {
  return main.match(/<article\b[^>]*class=(?:"[^"]*\bhero\b[^"]*"|'[^']*\bhero\b[^']*')[^>]*>[\s\S]*?<\/article>/i)?.[0] || "";
}

function cleanArticleMarkup(value) {
  return value
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<details\b[^>]*\b(?:no-print|toc-card)\b[^>]*>[\s\S]*?<\/details>/gi, "")
    .replace(/<figure\b[\s\S]*?<\/figure>/gi, "")
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/\s+loading=(?:"[^"]*"|'[^']*')/gi, "")
    .replace(/\s+(?:decoding|fetchpriority)=(?:"[^"]*"|'[^']*')/gi, "");
}

function formatDate(value = "") {
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T12:00:00Z`));
}

function printStyles() {
  return `
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    @page { size: A4; margin: 17mm 16mm 19mm; }
    html, body { margin: 0; padding: 0; background: #fff; color: #20242e; }
    body { font-family: "Source Serif 4", Georgia, "Times New Roman", serif; font-size: 10.4pt; line-height: 1.58; }
    .pdf-cover { min-height: 252mm; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; padding: 20mm 18mm 18mm; background: #0B1020; color: #F6F1E8; break-after: page; page-break-after: always; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .pdf-brand { display: flex; align-items: center; gap: 8pt; color: #D5AD55; font-family: Arial, sans-serif; font-size: 8.5pt; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
    .pdf-mark { width: 14pt; height: 14pt; border: 1.8pt solid #D5AD55; border-radius: 50%; position: relative; flex: none; }
    .pdf-mark::after { content: ""; position: absolute; width: 4.5pt; height: 4.5pt; top: 2.8pt; left: 2.8pt; border-radius: 50%; background: #2F7D5C; }
    .pdf-kicker { margin: 20mm 0 5mm; color: #D5AD55; font-family: Arial, sans-serif; font-size: 9pt; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; }
    .pdf-cover h1 { max-width: 19ch; margin: 0; color: #F6F1E8; font-family: "Source Serif 4", Georgia, serif; font-size: 28pt; line-height: 1.12; letter-spacing: -.015em; }
    .pdf-excerpt { max-width: 52ch; margin: 7mm 0 0; color: #DEE1E8; font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.45; }
    .pdf-figure-note { max-width: 55ch; margin: 12mm 0 0; padding: 4mm 0 0; border-top: 1px solid rgba(213, 173, 85, .45); color: #B9BBC6; font-family: Arial, sans-serif; font-size: 9pt; line-height: 1.45; }
    .pdf-cover-meta { display: flex; justify-content: space-between; gap: 10mm; margin-top: 8mm; color: #B9BBC6; font-family: Arial, sans-serif; font-size: 8.5pt; line-height: 1.45; }
    .pdf-cover-meta strong { display: block; color: #F6F1E8; font-weight: 700; }
    .pdf-document { padding-bottom: 6mm; }
    .pdf-document h1 { margin: 0 0 9pt; color: #0B1020; font-size: 22pt; line-height: 1.18; }
    .pdf-document h2 { margin: 23pt 0 8pt; padding-bottom: 4pt; border-bottom: 1.5pt solid #D5AD55; color: #0B1020; font-size: 16pt; line-height: 1.2; break-after: avoid-page; page-break-after: avoid; }
    .pdf-document h3 { margin: 16pt 0 5pt; color: #174F38; font-size: 12.5pt; line-height: 1.26; break-after: avoid-page; page-break-after: avoid; }
    .pdf-document h4 { margin: 13pt 0 4pt; color: #174F38; font-size: 11pt; line-height: 1.3; break-after: avoid-page; page-break-after: avoid; }
    .pdf-document p { margin: 0 0 8pt; orphans: 3; widows: 3; }
    .pdf-document strong { color: #0B1020; }
    .pdf-document ul, .pdf-document ol { margin: 0 0 9pt 18pt; padding: 0; }
    .pdf-document li { margin: 2.5pt 0; }
    .pdf-document a { color: inherit; text-decoration: none; border-bottom: .45pt solid #9A6F12; }
    .pdf-document blockquote { margin: 13pt 0; padding: 9pt 12pt; border-left: 3pt solid #2F7D5C; background: #F4F7F3; color: #17382d; font-size: 10.2pt; break-inside: avoid; page-break-inside: avoid; }
    .pdf-document blockquote p:last-child { margin-bottom: 0; }
    .pdf-document figure, .pdf-document .article-visual { margin: 16pt 0; break-inside: avoid; page-break-inside: avoid; }
    .pdf-document img { display: block; width: auto; max-width: 100%; max-height: 165mm; margin: 0 auto; object-fit: contain; }
    .pdf-document figcaption { margin-top: 5pt; color: #555; font-family: Arial, sans-serif; font-size: 8.3pt; line-height: 1.35; }
    .pdf-document table, .pdf-document .table-scroll { width: 100% !important; min-width: 0 !important; margin: 12pt 0; overflow: visible !important; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 8.1pt; line-height: 1.35; }
    .pdf-document thead { display: table-header-group; }
    .pdf-document tr { break-inside: avoid; page-break-inside: avoid; }
    .pdf-document th { background: #EAF2ED; color: #0B1020; font-weight: 700; }
    .pdf-document th, .pdf-document td { padding: 5pt; border: .6pt solid #D7DAD5; vertical-align: top; }
    .pdf-document .status-note, .pdf-document .article-status-note { margin: 0 0 13pt; padding: 9pt 11pt; border-left: 3pt solid #9A6F12; background: #FBF6EA; color: #2D2920; }
    .pdf-document .source-entry { margin-bottom: 5pt; padding-left: 8pt; border-left: 1.5pt solid #E8E4DC; color: #444; font-family: Arial, sans-serif; font-size: 8.8pt; line-height: 1.42; }
    .pdf-document .no-print, .pdf-document .toc-card, .pdf-document button, .pdf-document [data-search-exclude] { display: none !important; }
    .pdf-running-footer { display: flex; justify-content: space-between; gap: 8mm; margin: 8mm 0 0; padding: 4mm 16mm 0; border-top: .6pt solid #E8E4DC; color: #6B6E77; font-family: Arial, sans-serif; font-size: 7.5pt; letter-spacing: .035em; }
  `;
}

function renderPdfHtml(entry, sourceHtml, sourceFile) {
  const main = extractMain(sourceHtml);
  if (!main) throw new Error("Kein <main>-Inhalt gefunden");
  const hero = extractHero(main);
  const content = cleanArticleMarkup(main.replace(hero, ""));
  const title = entry.title || firstMatch(sourceHtml, [/<h1[^>]*>([\s\S]*?)<\/h1>/i, /<title>([\s\S]*?)<\/title>/i]);
  const category = entry.category || "Journal";
  const date = formatDate(entry.date || entry.publishedAt || "");
  const readingTime = entry.readingTime ? ` · ${entry.readingTime}` : "";
  const siteUrl = `https://wirkungsoekonomie.de${normalizeJournalUrl(entry.url)}`;
  const baseUrl = pathToFileURL(`${path.dirname(sourceFile)}${path.sep}`).href;
  const hasFigures = /<figure\b|<img\b/i.test(main);

  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <base href="${escapeHtml(baseUrl)}">
    <title>${escapeHtml(title)} - Journal der Wirkungsökonomie</title>
    <style>${printStyles()}</style>
  </head>
  <body>
    <section class="pdf-cover">
      <div>
        <div class="pdf-brand"><span class="pdf-mark" aria-hidden="true"></span>Wirkungsökonomie · Journal</div>
        <p class="pdf-kicker">${escapeHtml(category)}${date ? ` · ${escapeHtml(date)}` : ""}${escapeHtml(readingTime)}</p>
        <h1>${escapeHtml(title)}</h1>
        ${entry.excerpt ? `<p class="pdf-excerpt">${escapeHtml(entry.excerpt)}</p>` : ""}
        ${hasFigures ? '<p class="pdf-figure-note">Abbildungen und interaktive Grafiken sind in der verlinkten Onlinefassung verfügbar.</p>' : ""}
      </div>
      <div class="pdf-cover-meta">
        <div><strong>Digitale Lesefassung</strong>Für Bildschirm und Ausdruck</div>
        <div><strong>Original online</strong>${escapeHtml(siteUrl.replace(/^https:\/\//, ""))}</div>
      </div>
    </section>
    <main class="pdf-document">${content}</main>
    <footer class="pdf-running-footer"><span>Wirkungsökonomie · Journal</span><span>${escapeHtml(siteUrl.replace(/^https:\/\//, ""))}</span></footer>
  </body>
</html>`;
}

function chromeExecutable() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error("Google Chrome oder Chromium wurde nicht gefunden. Setze CHROME_PATH auf den Browserpfad.");
  }
  return found;
}

function renderPdf(browser, html, target, label) {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "woek-journal-pdf-"));
  const temporaryHtml = path.join(temporaryDirectory, "journal.html");
  fs.writeFileSync(temporaryHtml, html, "utf8");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  try {
    execFileSync(browser, [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--allow-file-access-from-files",
      "--no-pdf-header-footer",
      "--virtual-time-budget=1500",
      "--run-all-compositor-stages-before-draw",
      `--print-to-pdf=${target}`,
      pathToFileURL(temporaryHtml).href,
    ], { stdio: "pipe" });
  } catch (error) {
    const details = error.stderr?.toString("utf8").trim();
    throw new Error(`${label}: Chrome konnte das PDF nicht erzeugen${details ? ` (${details})` : ""}`);
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

if (!fs.existsSync(indexPath)) {
  throw new Error("assets/data/blog-index.json fehlt. Zuerst node scripts/blog/build-blog-index.mjs ausführen.");
}

const entries = JSON.parse(fs.readFileSync(indexPath, "utf8"))
  .filter((entry) => entry?.status === "published" && normalizeJournalUrl(entry.url).startsWith("/blog/"))
  .filter((entry) => !onlyArgs.length || onlyArgs.includes(normalizeJournalUrl(entry.url)));
if (!entries.length) {
  throw new Error(onlyArgs.length ? `Kein veröffentlichter Journalartikel für ${onlyArgs.join(", ")}.` : "Keine veröffentlichten Journalartikel gefunden.");
}

const previousManifest = readManifest();
const nextEntries = { ...previousManifest.entries };
let browser = null;
let rendered = 0;
let skipped = 0;

for (const entry of entries) {
  const sourceFile = sourcePathForUrl(entry.url);
  if (!fs.existsSync(sourceFile)) {
    throw new Error(`${entry.url}: Quelldatei fehlt.`);
  }
  const sourceHtml = fs.readFileSync(sourceFile, "utf8");
  const sourceHash = hash(sourceHtml);
  const relativePdfPath = pdfRelativePath(entry.url);
  const outputPath = path.join(root, relativePdfPath);
  const previous = nextEntries[entry.url];

  if (!force && previous?.generatorVersion === generatorVersion && previous?.sourceHash === sourceHash && previous?.pdfPath === `/${relativePdfPath}` && fs.existsSync(outputPath)) {
    skipped += 1;
    continue;
  }

  browser ||= chromeExecutable();
  renderPdf(browser, renderPdfHtml(entry, sourceHtml, sourceFile), outputPath, entry.title || entry.url);
  const size = fs.statSync(outputPath).size;
  if (size < 4_096) {
    throw new Error(`${entry.url}: erzeugtes PDF ist unerwartet klein (${size} Bytes).`);
  }
  nextEntries[entry.url] = {
    generatorVersion,
    sourceHash,
    pdfPath: `/${relativePdfPath}`,
    generatedAt: new Date().toISOString(),
    bytes: size,
  };
  rendered += 1;
  console.log(`PDF erstellt: ${relativePdfPath}`);
}

fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, `${JSON.stringify({
  version: generatorVersion,
  entries: nextEntries,
}, null, 2)}\n`);
console.log(`Journal-PDFs: ${rendered} erstellt, ${skipped} unverändert.`);
