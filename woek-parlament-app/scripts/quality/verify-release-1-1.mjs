#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const failures = [];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function walk(value, visit, key = "", trail = []) {
  visit(value, key, trail);
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walk(entry, visit, String(index), [...trail, key].filter(Boolean)));
  } else if (value && typeof value === "object") {
    Object.entries(value).forEach(([childKey, child]) => walk(child, visit, childKey, [...trail, key].filter(Boolean)));
  }
}

const integration = readJson("data/fachakten/release-1.1-integration-report.json");
assert(integration.publisher === "Institut für Wirkungsökonomie", "Integrationsbericht hat falschen Herausgeber.");
assert(integration.summary?.cases === 28, "Integrationsbericht enthält nicht 28 Fälle.");
assert(integration.summary?.changed_paths === 59, "Erwartet werden 59 korrigierte Wirkpfade.");
assert(integration.summary?.split_paths === 47, "Erwartet werden 47 gesplittete Wirkpfade.");
assert(integration.summary?.lost_fields === 0, "Bei der 1.1-Integration gingen Fachfelder verloren.");

const workingActs = readJson("data/public-working-acts.json");
assert(workingActs.length === 28, "Der öffentliche Entscheidungsbestand enthält nicht 28 Fälle.");
assert(workingActs.every((entry) => entry.fachakteId), "Mindestens ein Fall hat keine erreichbare vollständige Fachakte.");

for (const act of workingActs) {
  walk(act, (value, key, trail) => {
    if (key.toLowerCase().includes("direction") && value === "EVIDENCE_OPEN") {
      failures.push(`${act.slug}: EVIDENCE_OPEN wird weiterhin als Wirkungsrichtung verwendet (${[...trail, key].join(".")}).`);
    }
  });
  const fullRecord = path.join(ROOT, "public/fachakten/dossiers", `${act.fachakteId}.html`);
  assert(fs.existsSync(fullRecord), `${act.slug}: vollständige Fachakte fehlt (${act.fachakteId}).`);
}

const demwig = workingActs.find((entry) => entry.fachakteId === "case-c315ec77-da20-4ff4-9ab0-8321030b085c");
assert(Boolean(demwig), "DemWiG-Fall fehlt im öffentlichen Bestand.");
if (demwig) {
  const mappingText = JSON.stringify(demwig.publicWorkingAct?.normativeMapping ?? {});
  assert(!mappingText.includes("SDG_04"), "DemWiG enthält weiterhin das falsche Mapping SDG 4.");
  assert(!mappingText.includes("SDG_14"), "DemWiG enthält weiterhin das falsche Mapping SDG 14.");
}

const productionIntegrity = readJson("public/fachakten/production-integrity-report.json");
assert(productionIntegrity.result === "PASS", "Fachakten-Produktionsintegrität ist nicht PASS.");
assert(productionIntegrity.cases === 28, "Produktionsintegritätsbericht enthält nicht 28 Fälle.");
assert(productionIntegrity.missing_paths?.length === 0, "Mindestens ein fachlicher Quellpfad fehlt in einer Vollakte.");
assert(productionIntegrity.fallback_overwrites?.length === 0, "Ein Fallback überschreibt fachliche Quelldaten.");

const integrityDir = path.join(ROOT, "public/fachakten/integrity");
const integrityFiles = fs.readdirSync(integrityDir).filter((file) => file.endsWith(".json"));
assert(integrityFiles.length === 28, "Es liegen nicht 28 fallbezogene Integritätsberichte vor.");
for (const file of integrityFiles) {
  const report = readJson(path.join("public/fachakten/integrity", file));
  assert(report.result === "PASS", `${file}: Integritätsstatus ist nicht PASS.`);
  assert(report.missing_paths?.length === 0, `${file}: Fachpfade fehlen.`);
  assert(report.fallback_overwrites?.length === 0, `${file}: Fallback-Überschreibung erkannt.`);
}

const fachanalysen = readJson("data/public-fachanalysen.json");
const geg = fachanalysen.find((entry) => entry.slug === "gebaeudeenergiegesetz-medienwirkung");
assert(Boolean(geg), "GEG-Fachanalyse fehlt.");
if (geg) {
  assert(geg.referenceStatus === "PROPOSED_PENDING_REFERENCE_RECONCILIATION", "GEG-Referenzstatus wurde nicht bewahrt.");
  assert(geg.sources?.length === 20, "GEG-Fachanalyse enthält nicht 20 eingeordnete Quellen.");
  const references = JSON.stringify(geg.referenceFields ?? {});
  assert(references.includes("SDG+ Diskursfähigkeit"), "GEG verwendet nicht die bereinigte SDG+-Bezeichnung Diskursfähigkeit.");
  assert(references.includes("Systemdimension: Wirkungsresilienz"), "GEG weist Wirkungsresilienz nicht als Systemdimension aus.");
  assert(!references.includes("SDG+ Diskurskultur"), "GEG enthält weiterhin die veraltete Bezeichnung Diskurskultur.");
}

for (const slug of ["afd", "bsw", "cdu", "gruene", "linke", "spd"]) {
  assert(
    fs.existsSync(path.join(ROOT, "public/fachakten/dossiers", `sachsen-anhalt-${slug}.html`)),
    `Vollständige Fachakte für Sachsen-Anhalt/${slug} fehlt.`,
  );
}

const publicPdf = path.join(ROOT, "public/downloads/fachanalysen/wirkungsoekonomische-analyse-sondervermoegen-infrastruktur-klimaneutralitaet.pdf");
assert(fs.existsSync(publicPdf), "Bereinigte SVIK-Fachanalyse als PDF fehlt.");

if (failures.length) {
  console.error(`Release-1.1-Prüfung fehlgeschlagen (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Release-1.1-Prüfung PASS: 28 Fälle, Vollakten, Korrekturen, GEG und SVIK vollständig.");
