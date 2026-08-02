#!/usr/bin/env node
/**
 * Regression gate for the legacy papers that contain person-scoring or
 * automatic individual-decision proposals. A future edit may retain those
 * historical source texts, but may not expose them as current/indexable
 * content or remove their correction and successor.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const errors = [];

const FAMILIES = [
  {
    id: "wenn-maschinen-arbeiten",
    source: "content/documents/online/wenn-maschinen-arbeiten.inc",
    successor: "wirkungsfelder/arbeit-einkommen/",
    directRoute: "dokumente/wenn-maschinen-arbeiten/",
    archiveRoute: "bibliothek/wenn-maschinen-arbeiten/",
    pdfs: [
      "assets/pdf/wenn-maschinen-arbeiten.pdf",
      "public/downloads/originals/Wenn-Maschinen-arbeiten.pdf"
    ]
  },
  {
    id: "wp-produkte",
    source: "content/documents/online/wp-produkte.inc",
    successor: "wirkungsfelder/produkte-konsum/dossier/",
    directRoute: "dokumente/wp-produkte/",
    archiveRoute: "bibliothek/wp-produkte/",
    pdfs: [
      "assets/pdf/working-paper-produktbesteuerung-durch-wirkung.pdf",
      "public/downloads/originals/WP_Produkte.pdf"
    ]
  },
  {
    id: "wp-rente",
    source: "content/documents/online/wp-rente.inc",
    successor: "wirkungsfelder/rente-soziale-sicherung/",
    directRoute: "dokumente/wp-rente/",
    archiveRoute: "bibliothek/wp-rente/",
    pdfs: ["public/downloads/originals/WP_Rente.pdf"]
  }
];

const HIGH_RISK_PATTERNS = [
  /\b(?:persönlich(?:e[nrms]?|en)?|individuell(?:e[nrms]?|en)?|person(?:enbezogen(?:e[nrms]?|en)?)?)\b.{0,180}\b(?:wirkungs(?:score|wert|faktor|konto|jahr)|wök-id|wirkungs-id|steuer(?:klasse|last)|renten?(?:höhe|faktor|anspruch)|leistungsanspruch|transfer)\b/isu,
  /\b(?:wök-id|wirkungs-id)\b.{0,180}\b(?:person|bürger|individuell|persönlich)\b/isu,
  /\b(?:automatisch|algorithmisch)\b.{0,140}\b(?:steuer(?:klasse|last)|rente(?:nhöhe|nfaktor)?|leistungsanspruch|transfer)\b/isu
];

function readJson(relative) {
  const file = path.join(ROOT, relative);
  if (!fs.existsSync(file)) {
    errors.push(`${relative}: Datei fehlt.`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${relative}: ungültiges JSON (${error.message}).`);
    return null;
  }
}

function htmlFor(route) {
  return path.join(ROOT, route, "index.html");
}

function htmlFilesBelow(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...htmlFilesBelow(target));
    if (entry.isFile() && entry.name === "index.html") files.push(target);
  }
  return files;
}

function assertHistoricalPage(route, successor, label) {
  const file = htmlFor(route);
  if (!fs.existsSync(file)) {
    errors.push(`${route}: ${label} fehlt.`);
    return;
  }
  const html = fs.readFileSync(file, "utf8");
  if (!/name=["']robots["']\s+content=["'][^"']*\bnoindex\b[^"']*\bfollow\b[^"']*["']/iu.test(html)) {
    errors.push(`${route}: ${label} braucht noindex,follow.`);
  }
  if (!/Historische(?:,|\s+) ersetzte Fassung|Historische Quellenfassung/iu.test(html)) {
    errors.push(`${route}: ${label} braucht eine sichtbare historische Einordnung.`);
  }
  if (!html.includes(successor)) {
    errors.push(`${route}: ${label} verweist nicht auf die aktuelle Nachfolgefassung ${successor}.`);
  }
}

function assertHistoricalReader(detail, family) {
  const root = path.join(ROOT, "bibliothek", "eintraege", detail.detailSlug, "lesen");
  const files = htmlFilesBelow(root);
  if (!files.length) {
    // Eine PDF-Quellenfassung genügt. Gibt es zusätzlich eine Lesefassung,
    // muss sie aber dieselben historischen Schutzregeln erfüllen.
    return;
  }
  const prompt = /\b(?:möchtest\s+du|moechtest\s+du|soll\s+ich)\b[\s\S]{0,320}\b(?:abschnitt|kapitel|teil|weiter(?:schreiben|führen)|schreibe(?:n)?)\b/iu;
  for (const file of files) {
    const html = fs.readFileSync(file, "utf8");
    const relative = path.relative(ROOT, file).split(path.sep).join("/");
    if (prompt.test(html)) errors.push(`${relative}: redaktioneller Prozesssatz bleibt in einer historischen Lesefassung sichtbar.`);
    if (!/name=["']robots["']\s+content=["'][^"']*\bnoindex\b[^"']*\bfollow\b[^"']*["']/iu.test(html)) {
      errors.push(`${relative}: historische Lesefassung braucht noindex,follow.`);
    }
    if (!html.includes(family.successor)) {
      errors.push(`${relative}: historische Lesefassung verweist nicht auf die aktuelle Nachfolgefassung.`);
    }
  }
}

const documentModel = readJson("content/documents/documents.json");
const libraryRegistry = readJson("assets/data/library-version-registry.json");
const details = readJson("assets/data/library-source-details.json");
const documents = documentModel?.documents || [];
const registryDocuments = libraryRegistry?.documents || [];
const detailEntries = details?.entries || [];

for (const family of FAMILIES) {
  const sourcePath = path.join(ROOT, family.source);
  if (!fs.existsSync(sourcePath)) {
    errors.push(`${family.source}: historische Quellableitung fehlt.`);
  } else {
    const source = fs.readFileSync(sourcePath, "utf8");
    if (!HIGH_RISK_PATTERNS.some((pattern) => pattern.test(source))) {
      errors.push(`${family.source}: keine hochriskante Personen-/Automatiklogik erkannt; die Schutzprüfung wäre wirkungslos.`);
    }
  }

  const document = documents.find((entry) => entry.id === family.id);
  if (!document) {
    errors.push(`${family.id}: fehlt im kuratierten Dokumentmodell.`);
  } else {
    if (document.status !== "ersetzt") errors.push(`${family.id}: Status muss "ersetzt" sein, ist aber "${document.status}".`);
    if (document.visibility !== "archive") errors.push(`${family.id}: Sichtbarkeit muss "archive" sein, ist aber "${document.visibility}".`);
    if (document.suppressHistoricalText !== true) errors.push(`${family.id}: historischer Volltext darf nicht über die kuratierte Dokumentseite ausgespielt werden.`);
    if (document.successorUrl !== family.successor) errors.push(`${family.id}: falsche Nachfolgefassung "${document.successorUrl || ""}".`);
    if (!document.historicalNotice) errors.push(`${family.id}: fachliche Korrektur fehlt im Dokumentmodell.`);
  }

  assertHistoricalPage(family.directRoute, family.successor, "direkte Altroute");
  assertHistoricalPage(family.archiveRoute, family.successor, "Archivseite");

  for (const pdf of family.pdfs) {
    const record = registryDocuments.find((entry) => entry.urls?.sourcePath === pdf);
    if (!record) {
      errors.push(`${pdf}: fehlt im Versionsregister.`);
    } else {
      if (record.status !== "ersetzt") errors.push(`${pdf}: Versionsregister muss den Status "ersetzt" tragen.`);
      if (record.successorUrl !== family.successor) errors.push(`${pdf}: Versionsregister verweist nicht auf die aktuelle Nachfolgefassung.`);
      if (!record.historicalNotice) errors.push(`${pdf}: Versionsregister enthält keine fachliche Korrektur.`);
    }
  }

  const matchingDetails = detailEntries.filter((entry) => entry.status === "ersetzt" && entry.primaryUrl === family.directRoute);
  if (matchingDetails.length !== 1) {
    errors.push(`${family.id}: keine historische Detailseite mit fachlicher Korrektur und Nachfolgefassung im Bibliotheksregister.`);
  }
  for (const detail of matchingDetails) {
    if (detail.successorUrl !== family.successor || !detail.historicalNotice) {
      errors.push(`${family.id}: historische Detailseite enthält keine vollständige fachliche Korrektur und Nachfolgefassung.`);
    }
    assertHistoricalReader(detail, family);
  }
}

if (errors.length) {
  console.error(`Historische Personen-Scoring-Dokumente: ${errors.length} Regression(en):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`Historische Personen-Scoring-Dokumente geprüft: ${FAMILIES.length} Dokumentfamilien.`);
