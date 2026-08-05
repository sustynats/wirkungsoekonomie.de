import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const artifact = path.resolve("_site/werkzeuge/wirkungswahl-kompass/index.html");
assert.ok(fs.existsSync(artifact), "Wirkungswahl-Kompass fehlt im öffentlichen Artefakt.");

const html = fs.readFileSync(artifact, "utf8");
assert.match(html, /In Mein Wirkungsraum speichern/, "Die Speicherfunktion fehlt im Artefakt.");
assert.match(html, /Als PNG laden/, "Der PNG-Export fehlt im Artefakt.");
assert.match(html, /Als PDF laden/, "Der PDF-Export fehlt im Artefakt.");
assert.match(html, /Prioritäten teilen/, "Die Teilen-Funktion fehlt im Artefakt.");
assert.match(html, /Mein Wirkungsraum öffnen/, "Der direkte Link zum Wirkungsraum ist nicht eindeutig beschriftet.");
assert.match(html, /In unabhängiger Prüfung/, "Die sichtbare Prüfkennzeichnung fehlt im Artefakt.");
assert.match(html, /Transparenz zum Prüfstatus/, "Die Erklärung zum Prüfstatus fehlt im Artefakt.");
assert.match(html, /Praxis &amp; Tools/, "Die Einbindung in die Werkzeugnavigation fehlt im Artefakt.");
assert.match(html, /Wirkungsökonomie · Startseite/, "Der Rückweg zur Startseite fehlt im Artefakt.");
assert.match(html, /impressum\.html/, "Der Impressumslink fehlt im Artefakt.");
assert.match(html, /datenschutz\.html/, "Der Link zur Datenschutzerklärung fehlt im Artefakt.");
assert.match(html, /property="og:title" content="Wirkungswahl-Kompass · in unabhängiger Prüfung"/, "Die Teilen-Vorschau enthält keinen passenden Titel.");
assert.match(html, /property="og:description"/, "Die Teilen-Vorschau enthält keine Beschreibung.");
assert.match(html, /property="og:url" content="https:\/\/wirkungsoekonomie\.de\/werkzeuge\/wirkungswahl-kompass\/"/, "Die Teilen-Vorschau enthält keine kanonische URL.");
assert.match(html, /name="twitter:card" content="summary_large_image"/, "Die Teilen-Vorschau enthält keine Twitter-Card-Angabe.");
assert.doesNotMatch(html, /Arbeitsdatei entferntumentElement/, "Der Artefakt-Scrubber hat Inline-JavaScript beschädigt.");

const toolsOverview = path.resolve("_site/werkzeuge/index.html");
assert.ok(fs.existsSync(toolsOverview), "Die Praxis-&-Tools-Übersicht fehlt im öffentlichen Artefakt.");
const toolsHtml = fs.readFileSync(toolsOverview, "utf8");
assert.match(toolsHtml, /<h3 class="card-title">Wirkungswahl-Kompass<\/h3>/, "Die Kompass-Karte fehlt in Praxis & Tools.");
assert.match(toolsHtml, /In unabhängiger Prüfung/, "Der Prüfstatus fehlt auf der Kompass-Karte.");
assert.match(toolsHtml, /252 Parteizuordnungen und 36 Wirkungsanalysen werden zweitgeprüft\./, "Die Prüfhinweise fehlen auf der Kompass-Karte.");
const kompassLink = toolsHtml.match(/href="([^"]+)">Wirkungswahl-Kompass öffnen<\/a>/);
assert.ok(kompassLink, "Der Öffnen-Link der Kompass-Karte fehlt.");
assert.equal(
  new URL(kompassLink[1], "https://wirkungsoekonomie.de/werkzeuge/").pathname,
  "/werkzeuge/wirkungswahl-kompass/",
  "Der Öffnen-Link der Kompass-Karte zeigt nicht auf die öffentliche Kompass-Route.",
);

const executableScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(([, attributes]) => !/\btype\s*=\s*(["'])application\/json\1/i.test(attributes))
  .map(([, , source]) => source);

assert.ok(executableScripts.length > 0, "Kein ausführbares Kompass-Skript im Artefakt gefunden.");
for (const [index, source] of executableScripts.entries()) {
  new vm.Script(source, { filename: "wirkungswahl-kompass-artifact-" + index + ".js" });
}

console.log("Wirkungswahl-Kompass public artifact checks passed.");
