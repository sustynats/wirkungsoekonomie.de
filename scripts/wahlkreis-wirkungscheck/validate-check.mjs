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
  "assets/js/wahlkreis-wirkungscheck/instruments-2026.js",
  "assets/js/wahlkreis-wirkungscheck/check-config.js",
  "assets/js/wahlkreis-wirkungscheck/rules.js"
]) {
  vm.runInContext(await readFile(resolve(root, file), "utf8"), context, { filename: file });
}

const data = context.window.WC_DATA;
const check = context.window.WC_CHECK;
const rules = context.window.WC_RULE_ENGINE;
const html = await readFile(resolve(root, "werkzeuge/wahlkreis-wirkungscheck/index.html"), "utf8");
const app = await readFile(resolve(root, "assets/js/wahlkreis-wirkungscheck/app.js"), "utf8");
const css = await readFile(resolve(root, "assets/css/wahlkreis-wirkungscheck.css"), "utf8");

assert.equal(data.districts.length, 299, "Der Datensatz muss alle 299 Wahlkreise enthalten.");
assert.equal(check.instruments.length, 6, "Der Fragebogen muss die sechs versionierten WÖK-Instrumente enthalten.");
assert.equal(check.instrumentModuleVersion, "2026.1", "Die Instrumentenreihenfolge braucht einen transparenten Versionsstand.");
assert.equal(
  Array.from(check.instruments, (instrument) => instrument.instrument_id).join(","),
  [
    "WOEK_PRODUCT_IMPACT_TAX",
    "WOEK_NON_COMPENSATION",
    "WOEK_LEGISLATIVE_IMPACT_FEEDBACK",
    "WOEK_IMPACT_BUDGETING",
    "WOEK_FUNDING_FEEDBACK",
    "WOEK_IMPACT_DATA"
  ].join(","),
  "Die Instrumente bleiben stabil geordnet und datengetrieben."
);
assert.ok(check.instrumentQuestions.every((question) => question.question_id && question.answer_type && question.version), "Jede Instrumentenfrage braucht ID, Typ und Versionsstand.");
assert.ok(check.instrumentQuestions.every((question) => question.required === false || (question.answer_options || question.answer_type.startsWith("instrument_"))), "Pflichtfragen brauchen Optionen oder einen expliziten Instrumententyp.");
assert.ok(check.instruments.every((instrument) => Array.isArray(instrument.further_reading) && instrument.further_reading.length), "Jedes Instrument muss weiterführende Website-Inhalte anbieten.");
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
assert.ok(detailed.decisionPlan && detailed.decisionPlan.federalChecks[0].includes("Finanzierungsarchitektur"), "Die Bundesrolle muss einen konkreten Entscheidungscheck auslösen.");
assert.ok(detailed.decisionPlan.bottleneckChecks[0].includes("Finanzierungsprüfung"), "Der Engpass muss die Entscheidungsspezifikation verändern.");
assert.match(html, /connect-src 'self' https:\/\/130\.162\.217\.58\.sslip\.io/, "Nur der ausdrücklich freigegebene WÖK-KI-Dienst darf nach Einwilligung erreichbar sein.");
assert.match(html, /data-2025\.js/);
assert.match(html, /Gesamtwirkung des gewählten Wirkpfads/);
assert.match(html, /Persönliche WÖK-KI-Auswertung · freiwillig/);
assert.match(html, /woek-ai-client\.js/);
assert.match(html, /instruments-2026\.js/);
assert.match(html, /Instrumente wirkungsorientierter Politik/);
assert.match(html, /Keine Personenbewertung/);
assert.match(html, /Modellierter Wirkpfad · Daten und Korrektur/);
assert.match(html, /wc-section wc-band--paper wc-implementation/, "Der politische Umsetzungsrahmen muss das eigene Seitenraster verwenden.");
assert.match(html, /wc-shell/, "Öffentliche Inhaltsabschnitte des Tools brauchen einen seitlichen Abstand.");
assert.doesNotMatch(html, /class="section" aria-labelledby="political-implementation"/, "Der Umsetzungsrahmen darf keine ungestylten Hauptwebsite-Klassen verwenden.");
assert.match(css, /font-family: "Inter";/, "Der Wirkungscheck muss seine Schrift selbst laden.");
assert.match(css, /font-family: "Source Serif 4";/, "Überschriften brauchen die vorgesehene Schrift.");
assert.match(css, /\.wc-implementation__table-wrap/, "Die Umsetzungs-Tabelle braucht einen eigenen responsiven Container.");
assert.match(app, /Freigabelink erstellen/);
assert.match(app, /Wirkpfad mit höchstens fünf Stationen/);
assert.match(app, /renderTrajectory/);
assert.match(app, /lockBaselineResponses/);
assert.match(app, /renderInstrumentReport/);
assert.match(app, /instrument\.instrument_id === id/, "Instrumentkarten müssen über die fachliche Instrument-ID gebunden werden.");
assert.match(app, /Die neutrale Diagnose wurde geändert/);
assert.doesNotMatch(html, /mock-data\.js|WC_MOCK/);

console.log("Wahlkreis-Wirkungscheck validiert: 299 Wahlkreise, Quellenfelder, Regeltexte und Offline-CSP.");
