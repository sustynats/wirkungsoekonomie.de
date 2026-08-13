#!/usr/bin/env node
/* Mindest-Gate für die nicht indexierte V2-Vorschau. */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("../..", import.meta.url).pathname);
const html = await readFile(resolve(root, "werkzeuge/wirkungscheck-bundestag-v2/index.html"), "utf8");
const app = await readFile(resolve(root, "assets/js/wirkungscheck-bundestag-v2/app.js"), "utf8");
const css = await readFile(resolve(root, "assets/css/wirkungscheck-bundestag-v2.css"), "utf8");

const requiredHtml = [
  'name="robots" content="noindex, nofollow"',
  "Wirkungscheck Bundestag V2 · Vorschau",
  "V2-Vorschau für den Verständlichkeitstest",
  "data-2025.js",
  "wirkungscheck-bundestag-v2/app.js"
];
const requiredApp = [
  'key: "topic"',
  'key: "objective"',
  'key: "bottlenecks"',
  'key: "signals"',
  'key: "boundaries"',
  'key: "constraints"',
  'key: "regionalFeedback"',
  "housing:",
  "care:",
  "sensitivity: false",
  "woekAi: false",
  "regionalCurves: false",
  "answerValueAnalytics: false",
  "Warum sehe ich dieses Ergebnis?",
  "Datenlücke im aktuellen Wahlkreisdatensatz",
  "scrollIntoView({ behavior: \"smooth\", block: \"start\" })"
];
const forbiddenApp = [
  "fetch(",
  "sendBeacon(",
  "WOEK_AI",
  "trajectory",
  "canvas"
];

for (const text of requiredHtml) {
  if (!html.includes(text)) throw new Error(`HTML-Anforderung fehlt: ${text}`);
}
for (const text of requiredApp) {
  if (!app.includes(text)) throw new Error(`V2-Anforderung fehlt: ${text}`);
}
for (const text of forbiddenApp) {
  if (app.includes(text)) throw new Error(`Unzulässige V2-Funktion gefunden: ${text}`);
}
if (!css.includes(".wcv2-option[aria-pressed=\"true\"]")) {
  throw new Error("Mehrfachauswahl-Zustand fehlt.");
}
if (/<script[^>]+(?:woek-ai-client|analytics)/i.test(html)) {
  throw new Error("V2-Vorschau lädt einen nicht freigegebenen Dienst.");
}
console.log("wirkungscheck-bundestag-v2 preview gate: OK");

