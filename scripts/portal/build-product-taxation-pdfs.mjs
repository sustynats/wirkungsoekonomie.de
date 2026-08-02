#!/usr/bin/env node
/**
 * Erstellt die aktuellen PDF-Fassungen der sechs Produkt-Detailkonzepte.
 *
 * Die v1.0-PDFs bleiben historische Originale. Diese Exportdateien werden
 * ausschließlich aus den jeweils aktuellen, öffentlich gerenderten Markdown-
 * Quellen erzeugt und tragen deshalb eine eigene v1.1-Nummer.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sofficeCandidates = [
  process.env.WOEK_LIBREOFFICE_PATH,
  process.env.SOFFICE_BIN,
  "/opt/homebrew/bin/soffice",
  "/Applications/LibreOffice.app/Contents/MacOS/soffice",
  "soffice",
].filter(Boolean);
const SOFFICE = sofficeCandidates.find((candidate) => candidate === "soffice" || fs.existsSync(candidate));
const VERSION = "v1.1";
const DATE = "2. August 2026";
const verifyOnly = process.argv.includes("--check") || process.env.WOEK_PDF_BUILD_MODE === "verify";

const documents = [
  {
    source: "docs/produkte-konsum/go8-detailkonzepte/online_volltext_15_produkte-als-wirkungstraeger-lebenszyklus_detailkonzept_v1_0.md",
    output: "assets/downloads/15_woek_produkte_konsum_produkte-als-wirkungstraeger-lebenszyklus_detailkonzept_v1_1.pdf",
    title: "Produkte als Wirkungsträger",
  },
  {
    source: "docs/produkte-konsum/go8-detailkonzepte/online_volltext_16_wirkungsumsatzsteuer-produktwirkungssteuer_detailkonzept_v1_0.md",
    output: "assets/downloads/16_woek_produkte_konsum_wirkungsumsatzsteuer-produktwirkungssteuer_detailkonzept_v1_1.pdf",
    title: "Wirkungsumsatzsteuer / Produktwirkungssteuer",
  },
  {
    source: "docs/produkte-konsum/go8-detailkonzepte/online_volltext_17_produktscorecards-reverse-merit-order-digitale-produktpaesse_detailkonzept_v1_0.md",
    output: "assets/downloads/17_woek_produkte_konsum_produktscorecards-reverse-merit-order-digitale-produktpaesse_detailkonzept_v1_1.pdf",
    title: "Produktscorecards, Reverse Merit Order und digitale Produktpässe",
  },
  {
    source: "docs/produkte-konsum/go9-detailkonzepte/online_volltext_18_18_apfelbeispiel_produktwirkungsrechnung_detailkonzept_v1_0.md",
    output: "assets/downloads/18_woek_produkte_konsum_apfelbeispiel_produktwirkungsrechnung_detailkonzept_v1_1.pdf",
    title: "Das Apfelbeispiel und die Produktwirkungsrechnung im Alltag",
  },
  {
    source: "docs/produkte-konsum/go9-detailkonzepte/online_volltext_19_19_lieferketten_importlogik_wirkungsvorsteuer_detailkonzept_v1_0.md",
    output: "assets/downloads/19_woek_produkte_konsum_lieferketten_importlogik_wirkungsvorsteuer_detailkonzept_v1_1.pdf",
    title: "Lieferketten, Importlogik und Wirkungsvorsteuer",
  },
  {
    source: "docs/produkte-konsum/go9-detailkonzepte/online_volltext_20_20_konzernbeispiel_csrd_produktscorecard_detailkonzept_v1_0.md",
    output: "assets/downloads/20_woek_produkte_konsum_konzernbeispiel_csrd_produktscorecard_detailkonzept_v1_1.pdf",
    title: "Konzern- und Produktgruppenbeispiel: Von CSRD zur Produktscorecard",
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inline(markdown) {
  return escapeHtml(markdown)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2">$1</a>');
}

function tableHtml(lines) {
  const rows = lines.map((line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
  const divider = rows.findIndex((row) => row.every((cell) => /^:?-{3,}:?$/.test(cell)));
  const header = divider > 0 ? rows[0] : null;
  const body = divider > 0 ? rows.slice(divider + 1) : rows;
  return `<table>${header ? `<thead><tr>${header.map((cell) => `<th>${inline(cell)}</th>`).join("")}</tr></thead>` : ""}<tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let list = [];
  let table = [];

  const flushParagraph = () => {
    if (paragraph.length) html.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) html.push(`<ul>${list.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`);
    list = [];
  };
  const flushTable = () => {
    if (table.length) html.push(tableHtml(table));
    table = [];
  };
  const flush = () => {
    flushParagraph();
    flushList();
    flushTable();
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (/^\|/.test(line)) {
      flushParagraph();
      flushList();
      table.push(line);
      continue;
    }
    if (!line && table.length) {
      // Die Quellen trennen Tabellenzeilen teilweise mit Leerzeilen. Die
      // Leerzeile gehört dort zur Tabelle, nicht zu einem neuen Absatz.
      continue;
    }
    flushTable();
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(heading[1].length + 1, 4);
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    if (/^>\s?/.test(line)) {
      flushParagraph();
      flushList();
      html.push(`<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`);
      continue;
    }
    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^(?:[-*]|\d+\.)\s+/, ""));
      continue;
    }
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    paragraph.push(line);
  }
  flush();
  return html.join("\n");
}

function documentHtml({ title, body }) {
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)} · ${VERSION}</title>
  <style>
    @page { size: A4; margin: 18mm 16mm 18mm 16mm; }
    body { color: #172029; font-family: Arial, Helvetica, sans-serif; font-size: 10.2pt; line-height: 1.48; }
    h1, h2, h3, h4 { color: #123e50; page-break-after: avoid; }
    h1 { font-size: 25pt; line-height: 1.12; margin: 0 0 6mm; }
    h2 { font-size: 16pt; border-bottom: 1px solid #78a6a7; margin: 10mm 0 3mm; padding-bottom: 1.5mm; }
    h3 { font-size: 12.5pt; margin: 7mm 0 2mm; }
    h4 { font-size: 11pt; margin: 5mm 0 2mm; }
    p { margin: 0 0 3.2mm; }
    ul { margin: 0 0 3.5mm 5mm; padding-left: 4mm; }
    li { margin: 0 0 1.4mm; }
    blockquote { border-left: 3px solid #d7a23b; color: #33434c; font-style: italic; margin: 5mm 0; padding: 2mm 4mm; }
    table { border-collapse: collapse; font-size: 8.7pt; margin: 4mm 0 5mm; width: 100%; }
    thead { background: #e9f3f2; }
    th, td { border: 0.5pt solid #9aafb4; padding: 2mm; text-align: left; vertical-align: top; }
    tr { page-break-inside: avoid; }
    code { background: #edf1f2; font-family: "Courier New", monospace; font-size: 8.7pt; padding: 0.2mm 0.6mm; }
    a { color: #115d74; }
    .eyebrow { color: #5d6870; font-size: 10pt; font-weight: bold; letter-spacing: 0.04em; text-transform: uppercase; }
    .meta { color: #5d6870; font-size: 9pt; margin-bottom: 7mm; }
  </style>
</head>
<body>
  <p class="eyebrow">Wirkungsökonomie · aktualisierte PDF-Fassung</p>
  <h1>${escapeHtml(title)}</h1>
  <p class="meta">${VERSION} · ${DATE} · Führender Methodenstand: Online-Volltext auf wirkungsoekonomie.de</p>
  <blockquote><strong>Methodischer Hinweis.</strong> Scorecard und FinalScore dokumentieren Wirkungsprofil, Datenqualität und kritische Grenzen. Sie ergeben keinen Steuersatz und keinen Preis. Erst ein unabhängig rechtlich bestimmter Satz <code>t</code> kann in einer transparenten Rechnung <code>P_brutto = P_netto × (1 + t)</code> verwendet werden.</blockquote>
  ${body}
</body>
</html>`;
}

function checkPublishedPdf(document) {
  const outputPath = path.join(ROOT, document.output);
  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 10_000) {
    throw new Error(`Freigegebene PDF fehlt oder ist zu klein: ${document.output}`);
  }
  const header = fs.readFileSync(outputPath).subarray(0, 5).toString("ascii");
  if (header !== "%PDF-") {
    throw new Error(`Freigegebene Datei ist keine PDF: ${document.output}`);
  }
}

if (verifyOnly) {
  for (const document of documents) checkPublishedPdf(document);
  console.log(`Produkt-PDF-Prüfung bestanden: ${documents.length} freigegebene Fassungen.`);
} else {
  const sofficeCheck = spawnSync(SOFFICE, ["--version"], { encoding: "utf8" });
  if (sofficeCheck.status !== 0) {
    throw new Error(`LibreOffice ist nicht verfügbar. Geprüfte Aufrufe: ${sofficeCandidates.join(", ")}`);
  }

  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "woek-product-pdf-v11-"));
  for (const document of documents) {
    const sourcePath = path.join(ROOT, document.source);
    const outputPath = path.join(ROOT, document.output);
    const htmlName = path.basename(outputPath, ".pdf") + ".html";
    const htmlPath = path.join(temp, htmlName);
    fs.writeFileSync(htmlPath, documentHtml({ title: document.title, body: markdownToHtml(fs.readFileSync(sourcePath, "utf8")) }), "utf8");
    const exportResult = spawnSync(SOFFICE, ["--headless", "--convert-to", "pdf", "--outdir", temp, htmlPath], { encoding: "utf8" });
    if (exportResult.status !== 0) {
      throw new Error(`PDF-Export fehlgeschlagen für ${document.title}: ${exportResult.stderr || exportResult.stdout}`);
    }
    const generatedPdf = path.join(temp, path.basename(outputPath));
    if (!fs.existsSync(generatedPdf) || fs.statSync(generatedPdf).size < 10_000) {
      throw new Error(`PDF-Export erzeugte keine brauchbare Datei für ${document.title}.`);
    }
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.copyFileSync(generatedPdf, outputPath);
    console.log(`${document.output} (${fs.statSync(outputPath).size} Bytes)`);
  }
}
