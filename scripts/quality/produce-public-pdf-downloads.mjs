import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import os from "node:os";

const ROOT = process.cwd();
const DOWNLOAD_ROOT = path.join(ROOT, "assets/downloads");
const REPORT_PATH = path.join(ROOT, "docs/public-pdf-production-audit.md");
const SOFFICE = process.env.SOFFICE_BIN || "soffice";
const CHROME = process.env.CHROME_BIN || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ANCHOR_PATTERN = /<a\b[^>]*?\bhref=(["'])([^"']+)\1[^>]*>/gi;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && /\.(?:docx?|odt)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

function pdfPathFor(source) {
  return source.replace(/\.(?:docx?|odt)$/i, ".pdf");
}

function rel(file) {
  return path.relative(ROOT, file);
}

function cleanHref(href) {
  return String(href || "").split(/[?#]/)[0];
}

function isExternal(href) {
  return /^(?:https?:)?\/\//i.test(href) && !/^https?:\/\/(?:www\.)?wirkungsoekonomie\.de\//i.test(href);
}

function hrefToAbs(htmlFile, href) {
  let clean = cleanHref(href);
  if (!clean || clean.startsWith("#") || /^(?:mailto|tel):/i.test(clean) || isExternal(clean)) return "";
  clean = clean.replace(/^https?:\/\/(?:www\.)?wirkungsoekonomie\.de\//i, "");
  clean = clean.startsWith("/") ? clean.slice(1) : path.join(path.relative(ROOT, path.dirname(htmlFile)), clean);
  try {
    clean = decodeURIComponent(clean);
  } catch {
    // Keep legacy paths as-is if decoding fails.
  }
  return path.normalize(path.join(ROOT, clean));
}

function walkHtml(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (full.includes(`${path.sep}.git${path.sep}`) || full.includes(`${path.sep}node_modules${path.sep}`)) continue;
    if (entry.isDirectory()) walkHtml(full, out);
    else if (entry.isFile() && entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function markdownTargetsFromPublicHtml() {
  const targets = new Set();
  for (const htmlFile of walkHtml(ROOT)) {
    const html = fs.readFileSync(htmlFile, "utf8");
    let match;
    while ((match = ANCHOR_PATTERN.exec(html))) {
      const href = match[2];
      if (!/\.md(?:[?#]|$)/i.test(href)) continue;
      const abs = hrefToAbs(htmlFile, href);
      if (abs && fs.existsSync(abs) && abs.startsWith(ROOT)) targets.add(abs);
    }
  }
  const knownPublicMarkdownExports = [
    "public/downloads/exports/glossar.md",
  ];
  for (const target of knownPublicMarkdownExports) {
    const abs = path.join(ROOT, target);
    if (fs.existsSync(abs)) targets.add(abs);
  }
  return [...targets].sort((a, b) => rel(a).localeCompare(rel(b)));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function markdownToHtml(markdown) {
  const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let paragraph = [];
  let list = [];
  let code = [];
  let inCode = false;

  function flushParagraph() {
    if (!paragraph.length) return;
    out.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (!list.length) return;
    out.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
    list = [];
  }

  function flushCode() {
    if (!code.length) return;
    out.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
    code = [];
  }

  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(heading[1].length, 4);
      out.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }
    const bullet = /^\s*[-*]\s+(.+)$/.exec(line);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }
    paragraph.push(line.trim());
  }
  flushParagraph();
  flushList();
  flushCode();
  return out.join("\n");
}

function mdTitle(markdown, file) {
  const match = /^#\s+(.+)$/m.exec(markdown);
  return match ? match[1].trim() : path.basename(file, ".md").replace(/[-_]/g, " ");
}

function renderMarkdownPdf(source, target) {
  const markdown = fs.readFileSync(source, "utf8");
  const title = mdTitle(markdown, source);
  const html = `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @page { margin: 22mm 18mm 24mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #0b1020; line-height: 1.5; font-size: 11.5pt; }
    h1, h2, h3, h4 { font-family: Georgia, "Times New Roman", serif; line-height: 1.08; page-break-after: avoid; }
    h1 { font-size: 28pt; margin: 0 0 14mm; }
    h2 { font-size: 18pt; margin: 11mm 0 4mm; }
    h3 { font-size: 14pt; margin: 8mm 0 3mm; }
    p, li { max-width: 150mm; }
    code, pre { font-family: "SFMono-Regular", Consolas, monospace; font-size: 9.5pt; }
    pre { white-space: pre-wrap; background: #f5f1e8; padding: 8pt; border: 1px solid #ded6c8; }
    .meta { color: #2e7656; text-transform: uppercase; font-weight: 700; letter-spacing: .08em; font-size: 8.5pt; margin-bottom: 4mm; }
    .note { border-top: 1px solid #d8d1c5; margin-top: 14mm; padding-top: 5mm; color: #555; font-size: 9.5pt; }
  </style>
</head>
<body>
  <div class="meta">Wirkungsökonomie · PDF-Fassung</div>
  ${markdownToHtml(markdown)}
  <p class="note">Öffentliche PDF-Fassung aus dem WÖk-Produktionsprozess. Markdown-Quellen werden nicht als öffentlicher Download angeboten.</p>
</body>
</html>`;

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "woek-md-pdf-"));
  const tempHtml = path.join(tempDir, "document.html");
  fs.writeFileSync(tempHtml, html);
  const result = spawnSync(CHROME, [
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    `--print-to-pdf=${target}`,
    `file://${tempHtml}`,
  ], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  fs.rmSync(tempDir, { recursive: true, force: true });
  return result;
}

const sources = walk(DOWNLOAD_ROOT).sort((a, b) => rel(a).localeCompare(rel(b)));
const created = [];
const existing = [];
const failed = [];
const markdownCreated = [];
const markdownExisting = [];
const markdownFailed = [];

for (const source of sources) {
  const target = pdfPathFor(source);
  if (fs.existsSync(target)) {
    existing.push(target);
    continue;
  }

  const result = spawnSync(SOFFICE, [
    "--headless",
    "--convert-to",
    "pdf",
    "--outdir",
    path.dirname(source),
    source,
  ], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });

  if (result.status === 0 && fs.existsSync(target)) {
    created.push({ source, target });
  } else {
    failed.push({
      source,
      stderr: String(result.stderr || "").trim(),
      stdout: String(result.stdout || "").trim(),
      status: result.status,
    });
  }
}

const markdownSources = markdownTargetsFromPublicHtml();
for (const source of markdownSources) {
  const target = source.replace(/\.md$/i, ".pdf");
  if (fs.existsSync(target)) {
    markdownExisting.push(target);
    continue;
  }
  const result = renderMarkdownPdf(source, target);
  if (result.status === 0 && fs.existsSync(target)) {
    markdownCreated.push({ source, target });
  } else {
    markdownFailed.push({
      source,
      stderr: String(result.stderr || "").trim(),
      stdout: String(result.stdout || "").trim(),
      status: result.status,
    });
  }
}

const report = [
  "# Public PDF Production Audit",
  "",
  "Automatischer Produktionsschritt für öffentliche Downloadfassungen.",
  "",
  "## Ergebnis",
  "",
  `- DOC/DOCX/ODT-Quellen geprüft: ${sources.length}`,
  `- PDF-Fassungen bereits vorhanden: ${existing.length}`,
  `- PDF-Fassungen neu erzeugt: ${created.length}`,
  `- fehlgeschlagene PDF-Erzeugungen: ${failed.length}`,
  `- öffentlich verlinkte Markdown-Quellen geprüft: ${markdownSources.length}`,
  `- Markdown-PDF-Fassungen bereits vorhanden: ${markdownExisting.length}`,
  `- Markdown-PDF-Fassungen neu erzeugt: ${markdownCreated.length}`,
  `- fehlgeschlagene Markdown-PDF-Erzeugungen: ${markdownFailed.length}`,
  "",
  "## Regel",
  "",
  "- Öffentliche Besucher:innen sollen keine Word-Dateien herunterladen.",
  "- DOC/DOCX/ODT-Quellen unter `assets/downloads` werden in gleichnamige PDF-Fassungen exportiert.",
  "- Markdown- und ZIP-Dateien bleiben nicht öffentlich downloadbar und werden hier bewusst nicht zu Download-PDFs gemacht.",
  "- Bestehende Quelldateien werden nicht gelöscht.",
  "",
  "## Neu erzeugte PDF-Fassungen",
  "",
  ...created.map((item) => `- \`${rel(item.target)}\` aus \`${rel(item.source)}\``),
  "",
  "## Neu erzeugte Markdown-PDF-Fassungen",
  "",
  ...markdownCreated.map((item) => `- \`${rel(item.target)}\` aus \`${rel(item.source)}\``),
  "",
  "## Fehlgeschlagen",
  "",
  ...(failed.length || markdownFailed.length
    ? [...failed, ...markdownFailed].map((item) => `- \`${rel(item.source)}\` (Status ${item.status ?? "unbekannt"}): ${item.stderr || item.stdout || "keine Ausgabe"}`)
    : ["- keine"]),
  "",
];

fs.writeFileSync(REPORT_PATH, report.join("\n"));

console.log(`Public PDF production: ${created.length} created, ${existing.length} existing, ${failed.length} failed from ${sources.length} document sources; ${markdownCreated.length} Markdown PDFs created, ${markdownExisting.length} existing, ${markdownFailed.length} failed from ${markdownSources.length} public Markdown links.`);

if (failed.length || markdownFailed.length) {
  process.exitCode = 1;
}
