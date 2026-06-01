import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "docs/public-download-link-audit.md");
const BLOCKED_EXTENSIONS = new Set([".doc", ".docx", ".md", ".zip", ".pdf-fassung", ".pdf-paket"]);
const ANCHOR_PATTERN = /<a\b([^>]*?)\bhref=(["'])([^"']+)\2([^>]*)>([\s\S]*?)<\/a>/gi;
const SKIP_PARTS = [
  `${path.sep}.git${path.sep}`,
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}outputs${path.sep}`,
  `${path.sep}.codex-backup${path.sep}`,
  `${path.sep}woek-akademie-app${path.sep}node_modules${path.sep}`,
  `${path.sep}woek-akademie-app${path.sep}.next${path.sep}`,
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (SKIP_PARTS.some((part) => full.includes(part))) continue;
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function cleanHref(href) {
  return String(href || "").split(/[?#]/)[0];
}

function extname(href) {
  return path.extname(cleanHref(href)).toLowerCase();
}

function isBlocked(href) {
  return BLOCKED_EXTENSIONS.has(extname(href));
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
    // Keep the original path if a legacy URL contains non-URI-safe characters.
  }
  return path.normalize(path.join(ROOT, clean));
}

function sameStemPdfHref(href) {
  return href.replace(/\.(?:docx?|md|zip|pdf-fassung|pdf-paket)(?=([?#]|$))/i, ".pdf");
}

function fileExistsCaseInsensitive(absPath) {
  if (fs.existsSync(absPath)) return absPath;
  const dir = path.dirname(absPath);
  if (!fs.existsSync(dir)) return "";
  const target = path.basename(absPath).toLowerCase();
  const match = fs.readdirSync(dir).find((name) => name.toLowerCase() === target);
  return match ? path.join(dir, match) : "";
}

function pdfExists(htmlFile, href) {
  const candidateHref = sameStemPdfHref(href);
  const candidateAbs = hrefToAbs(htmlFile, candidateHref);
  return candidateAbs && fileExistsCaseInsensitive(candidateAbs) ? candidateHref : "";
}

function stripTags(value) {
  return String(value || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function cleanPdfLabel(inner) {
  const plain = stripTags(inner);
  if (!plain || /^(?:herunterladen|download|öffnen|oeffnen)$/i.test(plain)) return "PDF herunterladen";
  return plain
    .replace(/\bDOCX\b/gi, "PDF")
    .replace(/\bWord(?:-Dokument|-Datei|-Download)?\b/gi, "PDF")
    .replace(/\bMarkdown\b|\bMD\b/gi, "PDF")
    .replace(/\bZIP\b/gi, "PDF");
}

function pendingLabel(href, inner) {
  const extension = extname(href).replace(".", "").toUpperCase();
  const plain = stripTags(inner);
  if (extension === "ZIP" || extension === "PDF-PAKET") return "Gesamtpaket in PDF-Produktion";
  if (/online/i.test(plain)) return "Onlinefassung in Vorbereitung";
  return "PDF-Fassung in Produktion";
}

function rewriteAnchor(htmlFile, stats, fileStats) {
  return (match, before, quote, href, after, inner) => {
    if (!isBlocked(href)) return match;

    fileStats.blocked += 1;
    stats.blocked += 1;

    const pdfHref = pdfExists(htmlFile, href);
    if (pdfHref) {
      fileStats.converted += 1;
      stats.converted += 1;
      return `<a${before}href=${quote}${pdfHref}${quote}${after}>${cleanPdfLabel(inner)}</a>`;
    }

    fileStats.pending += 1;
    stats.pending += 1;
    return `<span class="text-note is-download-pending">${pendingLabel(href, inner)}</span>`;
  };
}

function replaceTextOutsideTags(html, replacer) {
  return html
    .split(/(<[^>]+>)/g)
    .map((part) => part.startsWith("<") ? part : replacer(part))
    .join("");
}

function cleanupText(html) {
  let next = html
    .replace(/\s*·\s*<span class="text-note is-download-pending">PDF-Fassung in Produktion<\/span>/g, "")
    .replace(/\s*·\s*<span class="text-note is-download-pending">Gesamtpaket in PDF-Produktion<\/span>/g, "")
    .replace(/<span class="text-note is-download-pending">PDF-Fassung in Produktion<\/span>\s*·\s*/g, "");

  next = replaceTextOutsideTags(next, (text) => text
    .replace(/PDF\s*(?:\/|und)\s*DOCX/gi, "PDF")
    .replace(/HTML\s*(?:\/|und)\s*DOCX/gi, "HTML")
    .replace(/\.(?:docx?|md|zip)\b/gi, "")
    .replace(/\bDOCX\b/gi, "PDF-Fassung")
    .replace(/\bMD\b/gi, "Onlinefassung")
    .replace(/\bWord-Download\b/gi, "PDF-Fassung")
    .replace(/\bWord-Dokument\b/gi, "PDF-Fassung")
    .replace(/\bWord-Datei\b/gi, "PDF-Fassung")
    .replace(/\bMarkdown-Dateien\b/gi, "Online-Notizen")
    .replace(/\bZIP\b/gi, "PDF-Paket")
    .replace(/PDF-Fassung herunterladen/gi, "PDF herunterladen")
    .replace(/PDF-Fassung-Datei/gi, "PDF-Fassung")
    .replace(/PDF-Fassung-Fassung/gi, "PDF-Fassung"));

  return next
    .replace(/(content=["'][^"']*)\bDOCX\b([^"']*["'])/gi, "$1PDF$2")
    .replace(/(content=["'][^"']*)\bMD\b([^"']*["'])/gi, "$1Onlinefassung$2")
    .replace(/(content=["'][^"']*)\bZIP\b([^"']*["'])/gi, "$1PDF-Paket$2")
    .replace(/\bdata-PDF-Fassung\b/g, "data-docx")
    .replace(/\bdata-PDF-Paket\b/g, "data-zip");
}

const stats = {
  filesScanned: 0,
  filesChanged: 0,
  blocked: 0,
  converted: 0,
  pending: 0,
  affected: [],
};

for (const file of walk(ROOT)) {
  stats.filesScanned += 1;
  const original = fs.readFileSync(file, "utf8");
  const fileStats = { blocked: 0, converted: 0, pending: 0 };
  let next = original.replace(/(<a\b[^>]*href=(["'])([^"']+\.pdf(?:[?#][^"']*)?)\2[^>]*>PDF(?: herunterladen)?<\/a>)\s*(?:·\s*)?<a\b[^>]*href=(["'])([^"']+\.(?:docx?|md)(?:[?#][^"']*)?)\4[^>]*>DOCX(?: herunterladen)?<\/a>/gi, "$1");
  next = next.replace(ANCHOR_PATTERN, rewriteAnchor(file, stats, fileStats));
  next = cleanupText(next);

  if (next !== original) {
    fs.writeFileSync(file, next);
    stats.filesChanged += 1;
    stats.affected.push({
      file: path.relative(ROOT, file),
      blocked: fileStats.blocked,
      converted: fileStats.converted,
      pending: fileStats.pending,
    });
  }
}

const report = [
  "# Public Download Link Audit",
  "",
  "Automatischer Build-Nachlauf für öffentliche Besucherlinks.",
  "",
  "## Ergebnis",
  "",
  `- HTML-Dateien geprüft: ${stats.filesScanned}`,
  `- HTML-Dateien geändert: ${stats.filesChanged}`,
  `- blockierte Rohformat-Links gefunden: ${stats.blocked}`,
  `- auf vorhandene PDF-Fassung umgelegt: ${stats.converted}`,
  `- ohne PDF-Fassung als \"PDF-Fassung in Produktion\" markiert: ${stats.pending}`,
  "",
  "## Regel",
  "",
  "- Öffentliche Besucher:innen erhalten keine direkten DOC/DOCX-, MD- oder ZIP-Downloads.",
  "- Bestehende Dateien werden nicht gelöscht.",
  "- Wenn eine gleichnamige PDF-Fassung vorhanden ist, wird der Link auf PDF umgelegt.",
  "- Wenn keine PDF-Fassung vorhanden ist, bleibt die Onlinefassung sichtbar; der Download wird als PDF-Produktion markiert.",
  "",
  "## Geänderte Dateien",
  "",
  ...stats.affected.map((item) => `- \`${item.file}\`: ${item.blocked} Rohformat-Link(s), ${item.converted} PDF-Umlage(n), ${item.pending} Produktion-Hinweis(e)`),
  "",
];

fs.writeFileSync(REPORT_PATH, report.join("\n"));

console.log(`Public download sanitizer: ${stats.blocked} blocked links, ${stats.converted} converted, ${stats.pending} pending across ${stats.filesChanged} files.`);
