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
// Die Bibliothek (scripts/library/build-library-versioning-stage9.mjs) und der
// Suchindex (scripts/search/build-woek-search-index.mjs) blenden die
// " … 2.html"-Routen bereits aus, sodass ausschließlich das kanonische
// Geschwister verlinkt und indexiert wird.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const MACOS_DUPLICATE_HTML = / \d+\.html$/;
const CHECK_MODE = process.argv.includes("--check");

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function gitFiles(args) {
  const output = execFileSync("git", ["ls-files", ...args, "-z"], { cwd: ROOT, encoding: "utf8", maxBuffer: 512 * 1024 * 1024,});
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
    <title>Weiterleitung zur aktuellen Fassung</title>
    <script>window.location.replace("${safeDestination}");</script>
  </head>
  <body>
    <main>
      <p>Diese Adresse führt zur aktuellen Fassung.</p>
      <p><a href="${safeDestination}">Zur aktuellen Fassung</a></p>
    </main>
  </body>
</html>`;
}

const duplicates = gitFiles([]).filter((rel) => MACOS_DUPLICATE_HTML.test(rel));
const newDuplicates = gitFiles(["--others", "--exclude-standard"]).filter((rel) => MACOS_DUPLICATE_HTML.test(rel));
let normalized = 0;
let unchanged = 0;
let missingCanonical = 0;
const stale = [];

for (const rel of newDuplicates) {
  console.error(`archive-macos-duplicate-routes: neue Finder-Dublette ist nicht erlaubt: ${rel}`);
}

for (const rel of duplicates) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
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
  if (current === html) {
    unchanged += 1;
    continue;
  }
  if (CHECK_MODE) {
    stale.push(rel);
    continue;
  }
  fs.writeFileSync(abs, html);
  normalized += 1;
}

if (CHECK_MODE) {
  if (stale.length || missingCanonical || newDuplicates.length) {
    for (const rel of stale) console.error(`archive-macos-duplicate-routes: nicht normalisiert: ${rel}`);
    process.exitCode = 1;
  } else {
    console.log(`archive-macos-duplicate-routes: ${unchanged} URL-erhaltende noindex-Weiterleitungen geprüft.`);
  }
} else {
  console.log(
    `archive-macos-duplicate-routes: ${normalized} Kopie-Routen normalisiert` +
      ` (bereits aktuell: ${unchanged}, ohne kanonisches Geschwister: ${missingCanonical}).`
  );
  if (newDuplicates.length) process.exitCode = 1;
}
