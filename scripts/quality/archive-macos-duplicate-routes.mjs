#!/usr/bin/env node
// Archiviert macOS-Duplikat-Artefakte ("… 2.html") verlustfrei und URL-erhaltend.
//
// Hintergrund: Beim Bearbeiten im Finder sind neben zahlreichen kanonischen
// Seiten versehentliche Kopien ("Datei 2.html") entstanden und eingecheckt
// worden. Sie liegen im Deploy und in der Schutz-Baseline (reports/url-baseline.txt),
// dürfen also nicht ersatzlos verschwinden. Ihr Inhalt ist jedoch entweder
// identisch zum kanonischen Geschwister oder eine ältere Fassung, deren Substanz
// die kanonische Seite bereits trägt (die Kopie enthält höchstens veraltetes
// Layout-/Navigations-Beiwerk). Die alte Fassung bleibt über die Git-Historie
// zitierfähig erhalten.
//
// Dieser Post-Processor überführt jede solche Route in einen archivierten
// Redirect-Stub auf das kanonische Geschwister:
//   …/dossier/index 2.html            -> …/dossier/            (index.html)
//   referenz/teil-XX/index 2.html     -> referenz/teil-XX/     (index.html)
//   …/WOeK_…_v1.0 2.html              -> …/WOeK_…_v1.0.html
//
// Bereits als Redirect-Stub vorliegende Kopien (z. B. referenz/version-1-1/
// index 2.html, erzeugt von scripts/reference/enhance-reference-ux.mjs) werden
// nicht angefasst, damit es genau einen Eigentümer pro Route gibt.
//
// Die Bibliothek (scripts/library/build-library-versioning-stage9.mjs) und der
// Suchindex (scripts/search/build-woek-search-index.mjs) blenden die
// " … 2.html"-Routen bereits aus, sodass ausschließlich das kanonische
// Geschwister verlinkt und indexiert wird.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const MACOS_DUPLICATE_HTML = / \d+\.html$/;

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function trackedFiles() {
  const output = execFileSync("git", ["ls-files", "-z"], { cwd: ROOT, encoding: "utf8" });
  return output.split("\0").filter(Boolean);
}

// Kanonisches Geschwister = Pfad ohne den " <n>"-Kopiesuffix vor ".html".
function canonicalSiblingOf(relPath) {
  return relPath.replace(MACOS_DUPLICATE_HTML, ".html");
}

// Ziel relativ zur Kopie: ein "index.html"-Geschwister wird als Verzeichnis
// (./) adressiert, damit die kanonische, saubere URL greift; sonst der Dateiname.
function redirectDestinationFor(canonicalRel) {
  const base = path.basename(canonicalRel);
  return base === "index.html" ? "./" : base;
}

function archiveStubHtml(destination) {
  const safeDestination = esc(destination);
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <meta http-equiv="refresh" content="0; url=${safeDestination}">
    <link rel="canonical" href="${safeDestination}">
    <title>Archivierte Kopie - weitergeleitet</title>
    <script>window.location.replace("${safeDestination}");</script>
  </head>
  <body>
    <main>
      <p>Diese Seite war eine versehentliche Dateikopie und wird auf die
        aktuelle Fassung weitergeleitet.</p>
      <p><a href="${safeDestination}">Zur aktuellen Fassung</a></p>
    </main>
  </body>
</html>`;
}

function isRedirectStub(abs) {
  try {
    return /http-equiv=["']refresh["']/i.test(fs.readFileSync(abs, "utf8"));
  } catch {
    return false;
  }
}

const duplicates = trackedFiles().filter((rel) => MACOS_DUPLICATE_HTML.test(rel));
let archived = 0;
let skippedStub = 0;
let missingCanonical = 0;

for (const rel of duplicates) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  if (isRedirectStub(abs)) {
    // Bereits von einem anderen Generator als Stub gepflegt.
    skippedStub += 1;
    continue;
  }
  const canonicalRel = canonicalSiblingOf(rel);
  if (!fs.existsSync(path.join(ROOT, canonicalRel))) {
    // Ohne kanonisches Geschwister wäre eine Weiterleitung inhaltlich unklar –
    // dann die Kopie unangetastet lassen (kein URL-Verlust, aber sichtbar).
    console.warn(`archive-macos-duplicate-routes: kein kanonisches Geschwister für ${rel} – übersprungen`);
    missingCanonical += 1;
    continue;
  }
  const destination = redirectDestinationFor(canonicalRel);
  const html = `${archiveStubHtml(destination)}\n`;
  const current = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : "";
  if (current !== html) fs.writeFileSync(abs, html);
  archived += 1;
}

console.log(
  `archive-macos-duplicate-routes: ${archived} Kopie-Routen als Redirect-Stub archiviert` +
    ` (bereits Stub: ${skippedStub}, ohne kanonisches Geschwister: ${missingCanonical}).`
);
