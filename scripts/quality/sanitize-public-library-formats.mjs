import fs from "node:fs";
import path from "node:path";

/**
 * Public-library boundary
 * -----------------------
 * Source material in this repository is deliberately format-rich: it can
 * contain Markdown working files, DOCX source files and archival packages.
 * They are useful while producing the site, but they are not useful public
 * destinations.  A reader needs a stable online page or a cited PDF instead.
 *
 * This normaliser is intentionally stricter than a text replacement:
 * every blocked href must resolve to an existing PDF and, where available, to
 * its public release URL.  An unknown source file is an error, not a hidden
 * button.  That keeps the public layer honest while allowing the internal
 * production formats to remain in their proper source folders.
 */

const ROOT = process.cwd();
const CHECK_ONLY = process.argv.includes("--check");
const RELEASE_MANIFEST = path.join(ROOT, "assets/data/public-release-assets.json");
const BLOCKED_EXTENSIONS = new Set([".doc", ".docx", ".md", ".zip"]);
const SKIP_DIRECTORIES = new Set([
  ".git",
  ".github",
  ".next",
  ".vercel",
  "node_modules",
  "outputs",
  "tmp",
  ".codex-backup",
  "woek-akademie-app",
  "woek-institut-app",
]);

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function walkHtml(directory, files = []) {
  if (!fs.existsSync(directory)) return files;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRECTORIES.has(entry.name)) walkHtml(path.join(directory, entry.name), files);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(path.join(directory, entry.name));
  }
  return files;
}

function splitHref(value = "") {
  const match = String(value).match(/^([^?#]*)([?#][\s\S]*)?$/);
  return { pathname: match?.[1] || "", suffix: match?.[2] || "" };
}

function extension(value = "") {
  return path.extname(splitHref(value).pathname).toLowerCase();
}

function isBlockedHref(value = "") {
  return BLOCKED_EXTENSIONS.has(extension(value));
}

function readReleaseAssets() {
  if (!fs.existsSync(RELEASE_MANIFEST)) return new Map();
  const manifest = JSON.parse(fs.readFileSync(RELEASE_MANIFEST, "utf8"));
  return new Map(Object.entries(manifest.assets || {}));
}

const releaseAssets = readReleaseAssets();

function sourceRootFor(file) {
  const siteRoot = path.join(ROOT, "_site");
  return file === siteRoot || file.startsWith(`${siteRoot}${path.sep}`) ? siteRoot : ROOT;
}

function localAssetKey(file, hrefPath) {
  if (/^(?:https?:)?\/\//i.test(hrefPath) || hrefPath.startsWith("mailto:") || hrefPath.startsWith("tel:")) return "";
  const base = sourceRootFor(file);
  const decoded = (() => {
    try {
      return decodeURI(hrefPath);
    } catch {
      return hrefPath;
    }
  })();
  const absolute = decoded.startsWith("/")
    ? path.resolve(base, `.${decoded}`)
    : path.resolve(path.dirname(file), decoded);
  const key = path.relative(base, absolute);
  if (key.startsWith("..") || path.isAbsolute(key)) return "";
  return toPosix(key);
}

function publicPdfHref(file, rawHref) {
  const { pathname, suffix } = splitHref(rawHref);
  const ext = extension(rawHref);
  if (!isBlockedHref(rawHref)) return { href: rawHref };
  if (/^(?:https?:)?\/\//i.test(pathname)) {
    return { error: `externe Quellformat-URL ohne nachweisbare PDF-Entsprechung: ${rawHref}` };
  }

  const sourceKey = localAssetKey(file, pathname);
  if (!sourceKey) return { error: `Quellformat-URL liegt außerhalb der öffentlichen Website: ${rawHref}` };
  const pdfKey = sourceKey.slice(0, -ext.length) + ".pdf";
  const pdfFile = path.join(ROOT, pdfKey);
  if (!fs.existsSync(pdfFile)) {
    return { error: `keine öffentliche PDF-Entsprechung für ${sourceKey}` };
  }

  // Release assets are deliberately not copied into the deploy artifact.  A
  // manifest entry is therefore the preferred, stable public destination.
  const releaseUrl = releaseAssets.get(pdfKey);
  return { href: `${releaseUrl || `/${pdfKey}`}${suffix}`, kind: "pdf" };
}

function publicAnchorLabel(innerHtml, kind) {
  const text = innerHtml
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:amp|quot|lt|gt);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!/(?:\bDOCX\b|\bMarkdown\b|\bMD\b|\bZIP\b|\bWord\b|herunterladen)/i.test(text)) return innerHtml;
  return kind === "pdf" ? "PDF öffnen" : "Onlinefassung lesen";
}

function normalizeDataFormats(html) {
  return html
    .replace(/\bdata-docx\b/gi, "data-export")
    .replace(/\bdata-md\b/gi, "data-online-source")
    .replace(/\bdata-zip\b/gi, "data-collection")
    .replace(/\bdata-format=(['"])([^'"]*)\1/gi, (_match, quote, value) => {
      const normalized = String(value)
        .split(/[\s,;/]+/)
        .filter(Boolean)
        .map((token) => {
          const lower = token.toLowerCase();
          if (lower === "doc" || lower === "docx") return "pdf";
          if (lower === "md" || lower === "markdown") return "online";
          if (lower === "zip") return "sammlung";
          return token;
        });
      return `data-format=${quote}${normalized.join(" ")}${quote}`;
    });
}

function normalizePublicFormatLanguage(html, pass = 0) {
  let next = normalizeDataFormats(html);

  // File names are production identifiers.  In public prose they obscure the
  // actual choice a reader has, so turn them into the public representation.
  next = next.replace(/[A-Za-zÀ-ÿ0-9_./-]+\.(?:docx|md|zip)\b/gi, (match) => {
    const ext = path.extname(match).toLowerCase();
    if (ext === ".docx") return "PDF-Fassung";
    if (ext === ".zip") return "Dokumentpaket";
    return "Onlinefassung";
  });

  // Collapse paired legacy labels before the generic vocabulary conversion.
  next = next
    .replace(/\bPDF\s*(?:\/|und|&)\s*(?:DOCX|Word)\b/gi, "PDF")
    .replace(/\b(?:DOCX|Word)\s*(?:\/|und|&)\s*PDF\b/gi, "PDF")
    .replace(/\bPDF-\s*und\s*PDF-(?:Downloads?|Fassungen?|Dateien?)\b/gi, "PDF-Downloads")
    .replace(/\bDOCX folgt\b/gi, "PDF verfügbar")
    .replace(/\bDOCX wird ergänzt\b/gi, "PDF-Fassung wird bereitgestellt")
    .replace(/\bDownload-DOCX\b/gi, "PDF-Download")
    .replace(/\bDOCX-Download(?:s)?\b/gi, "PDF-Download")
    .replace(/\bDOCX-?(?:Fassung|Datei|Dateien)\b/gi, "PDF-Fassung")
    .replace(/\bWord-?(?:Fassung|Datei|Dateien)\b/gi, "PDF-Fassung")
    .replace(/\bMarkdown-?(?:Quelle|Datei|Fassung)\b/gi, "Onlinefassung")
    .replace(/\bZIP-?(?:Gesamtpaket|Paket|Download|Downloads)\b/gi, "Dokumentpaket")
    .replace(/\bZIP-Pakete\b/gi, "Dokumentpakete")
    .replace(/\bArbeitsdatei entfernt\b/gi, "Onlinefassung verfügbar")
    .replace(/\bMarkdown\b/gi, "Onlinefassung")
    .replace(/\bDOCX\b/gi, "PDF")
    .replace(/\bWord\b/gi, "PDF")
    .replace(/\bMD\b/g, "Onlinefassung")
    .replace(/\bZIP\b/gi, "Dokumentpaket");

  // A generic conversion can create a repeated "PDF und PDF" phrase.  The
  // fixed point keeps repeated builds stable and the sentence readable.
  for (let pass = 0; pass < 4; pass += 1) {
    const reduced = next
      .replace(/\bPDF\s*(?:\/|und|&)\s*PDF\b/gi, "PDF")
      .replace(/\bPDF\s*,\s*PDF\b/gi, "PDF")
      .replace(/\bPDF-\s*PDF\b/gi, "PDF");
    if (reduced === next) break;
    next = reduced;
  }
  // Some legacy strings carry a hyphen on the source-format token (for
  // example "DOCX- und PDF-Download").  The vocabulary pass turns that into
  // "PDF- und PDF-Download"; one more fixed-point pass then reduces it to
  // the reader-facing singular form.  Bound the loop defensively.
  if (next !== html && pass < 4) return normalizePublicFormatLanguage(next, pass + 1);
  return next;
}

function sanitizeFile(file) {
  const before = fs.readFileSync(file, "utf8");
  const unresolved = [];
  const linked = before.replace(/<a\b([^>]*?)\bhref=(['"])([^'"]+)\2([^>]*)>([\s\S]*?)<\/a>/gi, (match, beforeHref, quote, rawHref, afterHref, innerHtml) => {
    if (!isBlockedHref(rawHref)) return match;
    const publicTarget = publicPdfHref(file, rawHref);
    if (publicTarget.error) {
      unresolved.push(`${path.relative(ROOT, file)}: ${publicTarget.error}`);
      return match;
    }
    const label = publicAnchorLabel(innerHtml, publicTarget.kind);
    return `<a${beforeHref}href=${quote}${publicTarget.href}${quote}${afterHref}>${label}</a>`;
  });

  if (unresolved.length) return { before, after: before, unresolved };
  const after = normalizePublicFormatLanguage(linked);
  return { before, after, unresolved: [] };
}

const pending = [];
const unresolved = [];
for (const file of walkHtml(ROOT)) {
  const result = sanitizeFile(file);
  unresolved.push(...result.unresolved);
  if (result.after !== result.before) pending.push({ file, content: result.after });
}

if (unresolved.length) {
  console.error("Öffentliche Quellformat-Verweise ohne PDF-Entsprechung:");
  for (const finding of unresolved) console.error(`- ${finding}`);
  process.exit(1);
}

if (CHECK_ONLY) {
  if (pending.length) {
    console.error(`Öffentliche Formatnormalisierung hat ${pending.length} ausstehende Datei(en).`);
    for (const item of pending.slice(0, 80)) console.error(`- ${path.relative(ROOT, item.file)}`);
    process.exit(1);
  }
  console.log("Öffentliche Bibliotheksformate sind bereits normalisiert.");
} else {
  for (const item of pending) fs.writeFileSync(item.file, item.content, "utf8");
  console.log(`Öffentliche Bibliotheksformate normalisiert: ${pending.length} Datei(en).`);
}
