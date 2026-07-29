#!/usr/bin/env node
/** Verifiziert, dass jede veröffentlichte Journal-URL eine aktuelle PDF-Lesefassung besitzt. */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "assets", "data", "blog-index.json");
const manifestPath = path.join(root, "assets", "data", "journal-pdf-manifest.json");

function pdfRelativePath(url = "") {
  return path.posix.join(
    "assets/pdf/journal",
    String(url)
      .replace(/^https?:\/\/wirkungsoekonomie\.de/i, "")
      .replace(/^\/blog\//, "")
      .replace(/\.html$/i, ".pdf")
      .replace(/\/$/, "/index.pdf"),
  );
}

function sourceHash(url = "") {
  const source = path.join(root, String(url).replace(/^https?:\/\/wirkungsoekonomie\.de/i, "").replace(/^\//, ""));
  if (!fs.existsSync(source)) return "";
  return createHash("sha256").update(fs.readFileSync(source, "utf8")).digest("hex");
}

if (!fs.existsSync(indexPath) || !fs.existsSync(manifestPath)) {
  console.error("Journal-PDF-Index oder -Manifest fehlt.");
  process.exit(1);
}

const entries = JSON.parse(fs.readFileSync(indexPath, "utf8"))
  .filter((entry) => entry?.status === "published" && String(entry.url || "").startsWith("/blog/"));
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const errors = [];

for (const entry of entries) {
  const relativePdfPath = pdfRelativePath(entry.url);
  const output = path.join(root, relativePdfPath);
  const manifestEntry = manifest.entries?.[entry.url];
  if (!fs.existsSync(output)) errors.push(`${entry.url}: PDF fehlt (${relativePdfPath}).`);
  else if (fs.statSync(output).size < 4_096) errors.push(`${entry.url}: PDF ist unerwartet klein.`);
  if (manifestEntry?.pdfPath !== `/${relativePdfPath}`) errors.push(`${entry.url}: Manifestpfad stimmt nicht.`);
  if (!manifestEntry?.generatorVersion || manifestEntry.generatorVersion !== manifest.version) {
    errors.push(`${entry.url}: PDF verwendet nicht den aktuellen Gestaltungstand.`);
  }
  if (!manifestEntry?.sourceHash || manifestEntry.sourceHash !== sourceHash(entry.url)) {
    errors.push(`${entry.url}: PDF ist nicht auf dem aktuellen Inhaltsstand.`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Journal-PDF-Check bestanden: ${entries.length} veröffentlichte Artikel mit aktueller PDF-Lesefassung.`);
