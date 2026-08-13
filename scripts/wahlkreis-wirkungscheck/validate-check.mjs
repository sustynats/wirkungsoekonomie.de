#!/usr/bin/env node
/* Leichte Release-Prüfung für den statischen, lokalen Fragebogen. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { resolve } from "node:path";

const root = resolve(new URL("../..", import.meta.url).pathname);
const context = vm.createContext({ window: {} });
for (const file of [
  "assets/js/wahlkreis-wirkungscheck/data-2025.js",
  "assets/js/wahlkreis-wirkungscheck/check-config.js",
  "assets/js/wahlkreis-wirkungscheck/rules.js"
]) {
  vm.runInContext(await readFile(resolve(root, file), "utf8"), context, { filename: file });
}

const data = context.window.WC_DATA;
const rules = context.window.WC_RULE_ENGINE;
const html = await readFile(resolve(root, "werkzeuge/wahlkreis-wirkungscheck/index.html"), "utf8");

assert.equal(data.districts.length, 299, "Der Datensatz muss alle 299 Wahlkreise enthalten.");
assert.ok(data.districts.every((district) => district.nr && district.name && Array.isArray(district.plz)), "Wahlkreis-Suche braucht Nummer, Name und PLZ-Suchhilfe.");
assert.ok(data.districts.every((district) => district.indicators.every((indicator) => indicator.source && indicator.observation && indicator.territorialNote)), "Jeder Indikator braucht Herkunft, Zeitstand und räumlichen Hinweis.");
assert.ok(rules.paths.every(rules.hasApprovedText), "Keine Regel ohne freigegebenen Bedingungstext darf sichtbar werden.");
assert.equal(rules.hasApprovedText({ rule: { conditions: [{ text: "" }], conclusion: { text: "x" } } }), false);
assert.equal(rules.unavailableText, "Die Herleitung dieser Regel ist noch nicht freigegeben.");
assert.equal(rules.evaluate({ q_bundesrolle: ["bund_recht"], q_engpass: ["verfahren"] })[0].rule.id, "R-BUND-RECHT-01");
const detailed = rules.derive({
  q_prioritaeten: ["wohnen"],
  q_top3: ["wohnen"],
  q_zustandsziel: "zugang",
  q_bundesrolle: ["bund_finanzierung"],
  q_engpass: ["finanzierung"],
  q_rote_linie: ["risiko_sozial"]
});
assert.ok(detailed && detailed.federal[0].includes("Förder"), "Die Antworten müssen eine konkrete, themenbezogene Wirkungskette auslösen.");
assert.ok(detailed.risks.some((risk) => risk.includes("positive Netto-Wirkung")), "Rote Linien müssen die Gesamtwirkung als nicht kompensierbare Bedingung begrenzen.");
assert.match(html, /connect-src 'none'/, "Der öffentliche Fragebogen darf keine Netzwerkverbindung aufbauen.");
assert.match(html, /data-2025\.js/);
assert.match(html, /Gesamtwirkung des gewählten Wirkpfads/);
assert.doesNotMatch(html, /mock-data\.js|WC_MOCK/);

console.log("Wahlkreis-Wirkungscheck validiert: 299 Wahlkreise, Quellenfelder, Regeltexte und Offline-CSP.");
