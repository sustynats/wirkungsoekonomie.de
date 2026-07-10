import fs from "node:fs";
import path from "node:path";
import { evaluateNonCompensation, validateCanvasInstance } from "../../lib/woems/validate-canvas.mjs";

const ROOT = process.cwd();
const methods = JSON.parse(fs.readFileSync(path.join(ROOT, "content/methods/woems-methoden.json"), "utf8"));
const canvases = JSON.parse(fs.readFileSync(path.join(ROOT, "content/methods/woems-canvas.json"), "utf8"));
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

assert(methods.methods.length === 84, "Methoden-Registry enthält nicht 84 Methoden.");
assert(methods.kategorien.length === 8, "Methoden-Registry enthält nicht 8 Kategorien.");
assert(canvases.counts.methodCanvases === 84, "Es fehlen methodenspezifische Canvas.");
assert(canvases.counts.variants === 32, "Es fehlen Canvas-Varianten.");
assert(canvases.canvases.length === 116, "Canvas-Registry enthält nicht 116 Spezifikationen.");

const methodIds = new Set(methods.methods.map((method) => method.id));
const canvasIds = new Set(canvases.canvases.map((canvas) => canvas.id));
assert(methodIds.size === 84, "Doppelte Methoden-ID gefunden.");
assert(canvasIds.size === 116, "Doppelte canvasId gefunden.");

for (const method of methods.methods) {
  assert(/^[A-H]\d{2}$/.test(method.id), `Ungültige Methoden-ID: ${method.id}`);
  for (const key of ["name", "zweck", "kategorie", "kategorieName", "docxSeite", "canvasRef"]) assert(Boolean(method[key]), `${method.id}: ${key} fehlt.`);
  for (const key of ["inputs", "schritte", "outputs", "qualitaetsregeln", "schutzregeln"]) {
    assert(Array.isArray(method[key]), `${method.id}: ${key} ist kein Array.`);
  }
  assert(method.schritte.length > 0, `${method.id}: Schritte fehlen.`);
  assert(method.qualitaetsregeln.length > 0, `${method.id}: Qualitätsregeln fehlen.`);
  assert(method.schutzregeln.length > 0, `${method.id}: Schutzregeln fehlen.`);
  assert(canvasIds.has(method.canvasRef), `${method.id}: canvasRef ist unbekannt.`);
  for (const ref of [...method.schnittstellen.bautAuf, ...method.schnittstellen.fuehrtZu]) assert(methodIds.has(ref), `${method.id}: unbekannte Schnittstelle ${ref}.`);
}

for (const canvas of canvases.canvases) {
  assert(methodIds.has(canvas.methodId), `${canvas.id}: methodId ist unbekannt.`);
  assert(canvas.felder.length > 0, `${canvas.id}: keine Felder.`);
  assert(canvas.pflichtfelder.length === 5, `${canvas.id}: Pflichtfelder unvollständig.`);
  assert(new Set(canvas.felder.map((field) => field.key)).size === canvas.felder.length, `${canvas.id}: doppelte Feldschlüssel.`);
}

const nonCompensation = evaluateNonCompensation({ wirkungsgrenzen: [{ bezeichnung: "Menschenwürde", status: "verletzt" }] });
assert(nonCompensation.decision === "stop_or_redesign" && !nonCompensation.aggregationAllowed, "Nichtkompensation stoppt Grenzverletzung nicht.");

const validCanvas = validateCanvasInstance({
  canvasId: "canvas-A01",
  methodId: "A01",
  version: "1.0",
  datum: "2026-07-10",
  fall: "Testfall",
  verantwortlicheModeration: "Test",
  evidenzstatus: "modelliert",
  unsicherheit: "mittel",
  negativeWirkung: [],
  wirkungsgrenzen: [{ bezeichnung: "Menschenwürde", status: "eingehalten" }],
  offeneFragen: [],
  semantischeCodierung: { farbeNieAllein: true, zusaetzlicheCodierung: ["Text"] },
  felder: {}
}, canvases);
assert(validCanvas.valid, `Gültige Canvas-Instanz wird abgelehnt: ${validCanvas.errors.join("; ")}`);

if (failures.length) {
  console.error(["WÖMS-Registry-Check fehlgeschlagen:", ...failures.map((failure) => `- ${failure}`)].join("\n"));
  process.exit(1);
}
console.log("WÖMS-Registry-Check bestanden: 84 Methoden, 32 Varianten, 116 Canvas-Spezifikationen.");
