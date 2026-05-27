import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DOWNLOAD_HREF_RE = /href=["'][^"']+\.(?:pdf|docx?|md|zip)(?:[?#][^"']*)?["']/i;

function rel(file) {
  return path.relative(ROOT, file).replaceAll(path.sep, "/");
}

function htmlFiles(dir) {
  const skip = new Set([".git", "node_modules", ".next", "dist", "outputs", ".cache"]);
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".github") continue;
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...htmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

function text(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function firstTitle(block) {
  const match = block.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i);
  return match ? text(match[1]) : "unbenannter Block";
}

function isPublicationOverview(fileRel) {
  if (fileRel === "downloads.html" || fileRel === "downloads/index.html" || fileRel === "dokumente/index.html" || fileRel === "buch.html") return true;
  if (/^downloads\/[^/]+\/index\.html$/.test(fileRel)) return true;
  if (/^portale\/[^/]+\/index\.html$/.test(fileRel)) return true;
  if (/^portale\/[^/]+\/downloads\/index\.html$/.test(fileRel)) return true;
  if (/^wirkungsfelder\/[^/]+\/index\.html$/.test(fileRel)) return true;
  if (/^werkzeuge\/[^/]+\/index\.html$/.test(fileRel)) return true;
  if (/^werkstatt\/dossiers\/[^/]+\/index\.html$/.test(fileRel)) return true;
  if (fileRel === "werkstatt/arbeitsbibliothek/index.html") return true;
  if (/^werkstatt\/arbeitsbibliothek\/(?:whitepaper|historische-dokumente)\/index\.html$/.test(fileRel)) return true;
  return false;
}

function isDownloadOverview(fileRel) {
  return fileRel === "downloads.html"
    || fileRel === "downloads/index.html"
    || fileRel === "dokumente/index.html"
    || /^downloads\/[^/]+\/index\.html$/.test(fileRel)
    || /^portale\/[^/]+\/downloads\/index\.html$/.test(fileRel);
}

const failures = [];
let checked = 0;

const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
for (const scriptName of ["build", "portal:build"]) {
  if (!packageJson.scripts?.[scriptName]?.includes("scripts/publications/apply-publication-abstracts.mjs")) {
    failures.push(`package.json: npm run ${scriptName} führt apply-publication-abstracts.mjs nicht aus.`);
  }
}

for (const file of htmlFiles(ROOT)) {
  const fileRel = rel(file);
  if (/(^|\/)(impressum|datenschutz)\.html$/.test(fileRel)) continue;
  if (!isPublicationOverview(fileRel)) continue;
  const html = fs.readFileSync(file, "utf8");

  if (fileRel === "downloads.html") {
    for (const match of html.matchAll(/<(article|div)\b[^>]*class=["'][^"']*(?:download-card|download-hero-card)[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi)) {
      const block = match[0];
      if (!DOWNLOAD_HREF_RE.test(block) && !/data-download-card/i.test(block) && !/download-hero-card/i.test(block)) continue;
      checked += 1;
      if (!/data-publication-abstract/i.test(block)) {
        failures.push(`${fileRel}: Downloadkarte ohne Abstract: ${firstTitle(block)}`);
      }
    }
  }

  if (fileRel === "downloads/index.html") {
    for (const match of html.matchAll(/<(article|div)\b[^>]*class=["'][^"']*\bcard\b[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi)) {
      const block = match[0];
      if (!DOWNLOAD_HREF_RE.test(block)) continue;
      checked += 1;
      if (!/data-publication-abstract/i.test(block)) {
        failures.push(`${fileRel}: Downloadkarte ohne Abstract: ${firstTitle(block)}`);
      }
    }
  }

  if (fileRel === "dokumente/index.html") {
    for (const match of html.matchAll(/<article\b[^>]*class=["'][^"']*info-card[^"']*["'][^>]*>[\s\S]*?<\/article>/gi)) {
      const block = match[0];
      if (!DOWNLOAD_HREF_RE.test(block)) continue;
      checked += 1;
      if (!/data-publication-abstract/i.test(block)) {
        failures.push(`${fileRel}: Dokumentkarte ohne Abstract: ${firstTitle(block)}`);
      }
    }
  }

  for (const match of html.matchAll(/<section\b[^>]*(?:id=["'](?:publikationszugang|vertiefung-arbeitsmaterial)["']|aria-labelledby=["'](?:publikationszugang|vertiefung-arbeitsmaterial-title)["'])[^>]*>[\s\S]*?<\/section>/gi)) {
    const section = match[0];
    checked += 1;
    if (!/data-publication-abstract/i.test(section)) {
      failures.push(`${fileRel}: Publikations-/Downloadbereich ohne Abstracts: ${firstTitle(section)}`);
    }
  }

  if (isDownloadOverview(fileRel)) {
    for (const match of html.matchAll(/<section\b[^>]*(?:id=["']downloads["']|aria-labelledby=["']downloads["'])[^>]*>[\s\S]*?<\/section>/gi)) {
      const section = match[0];
      if (!DOWNLOAD_HREF_RE.test(section)) continue;
      checked += 1;
      if (!/data-publication-abstract/i.test(section) && !/<th[^>]*>Kurzbeschreibung<\/th>/i.test(section)) {
        failures.push(`${fileRel}: Downloadbereich ohne Abstracts: ${firstTitle(section)}`);
      }
    }
  }

  for (const match of html.matchAll(/<div\b[^>]*class=["'][^"']*\bcard\b[^"']*["'][^>]*>[\s\S]*?<h2[^>]*>Online lesen und exportieren<\/h2>[\s\S]*?<\/div>/gi)) {
    const block = match[0];
    if (!DOWNLOAD_HREF_RE.test(block)) continue;
    checked += 1;
    if (!/data-publication-abstract/i.test(block)) {
      failures.push(`${fileRel}: Lese-/Exportkarte ohne Abstract: ${firstTitle(block)}`);
    }
  }
}

if (failures.length) {
  console.error(`Publication abstract check failed (${failures.length} findings):`);
  for (const failure of failures.slice(0, 80)) {
    console.error(`- ${failure}`);
  }
  if (failures.length > 80) console.error(`... ${failures.length - 80} weitere Findings`);
  process.exit(1);
}

console.log(`Publication abstract check passed: ${checked} download and reading blocks covered.`);
