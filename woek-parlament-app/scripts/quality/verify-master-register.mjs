#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import JSZip from "jszip";

const root = process.cwd();
const canonicalName = "WOeK_Masterregister_v1.4_FINAL_2026-08-16.xlsx";
const canonical = path.join(root, "data", "master-register", canonicalName);
const publicRoot = path.join(root, "public", "downloads", "woek-masterregister", "v1.4");
const publicWorkbook = path.join(publicRoot, canonicalName);
const jsonPath = path.join(publicRoot, "register-v1.4.json");
const csvPath = path.join(publicRoot, "register-v1.4.csv");
const manifestPath = path.join(publicRoot, "manifest.json");

for (const file of [canonical, publicWorkbook, jsonPath, csvPath, manifestPath]) {
  if (!fs.existsSync(file)) throw new Error(`Masterregister-Artefakt fehlt: ${file}`);
}

const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
if (sha256(canonical) !== sha256(publicWorkbook)) {
  throw new Error("Öffentliche XLSX-Datei weicht von der kanonischen Registerquelle ab.");
}

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (data.register_version !== "1.4" || manifest.register_version !== "1.4") throw new Error("Registerversion ist nicht v1.4.");
if (data.publisher !== "Institut für Wirkungsökonomie") throw new Error("Herausgeber des Registerexports ist falsch.");
if (data.items.length !== 621 || data.statistics.woek_ids !== 621) throw new Error("Öffentlicher Export enthält nicht exakt 621 WÖk-IDs.");
if (new Set(data.items.map((item) => item.WOK_ID)).size !== 621) throw new Error("WÖk-IDs sind im öffentlichen Export nicht eindeutig.");
if (data.statistics.indicator_families !== 204 || data.statistics.scoring_rules !== 28) throw new Error("Registerkennzahlen stimmen nicht mit v1.4 überein.");
if (!data.items.some((item) => /WÖk-Kalibrierung/i.test(item.Schwellenkategorie))) throw new Error("WÖk-Kalibrierungsstatus fehlt.");
if (!data.items.some((item) => /offen|validieren|prüfung/i.test(`${item.Schwellenstatus} ${item.Fachlogik_Status}`))) throw new Error("Offene Validierungsstände fehlen.");

const csvLines = fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/);
if (csvLines.length !== 622) throw new Error(`CSV enthält ${csvLines.length} statt 622 Zeilen.`);

const forbidden = /chatgpt|openai|claude|codex|anthropic|\/(?:Users|private|home)\/|file:\/\/|sandbox:/i;
for (const file of [jsonPath, csvPath, manifestPath]) {
  const match = fs.readFileSync(file, "utf8").match(forbidden);
  if (match) throw new Error(`Nicht veröffentlichbare Herkunftsspur in ${file}: ${match[0]}`);
}

const archive = await JSZip.loadAsync(fs.readFileSync(publicWorkbook));
for (const [name, entry] of Object.entries(archive.files)) {
  if (!/\.(xml|rels)$/i.test(name)) continue;
  const content = await entry.async("string");
  const match = content.match(forbidden);
  if (match) throw new Error(`Nicht veröffentlichbare Herkunftsspur in XLSX/${name}: ${match[0]}`);
}
const core = await archive.file("docProps/core.xml")?.async("string");
if (!core?.includes("Institut für Wirkungsökonomie")) throw new Error("Öffentliche XLSX-Metadaten enthalten nicht den korrekten Urheber.");

console.log("WÖk-Masterregister v1.4: Quelle, Viewer-Daten, Downloads und Publikationsschutz verifiziert.");
