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
assert.doesNotMatch(html, /Arbeitsdatei entferntumentElement/, "Der Artefakt-Scrubber hat Inline-JavaScript beschädigt.");

const executableScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(([, attributes]) => !/\btype\s*=\s*(["'])application\/json\1/i.test(attributes))
  .map(([, , source]) => source);

assert.ok(executableScripts.length > 0, "Kein ausführbares Kompass-Skript im Artefakt gefunden.");
for (const [index, source] of executableScripts.entries()) {
  new vm.Script(source, { filename: "wirkungswahl-kompass-artifact-" + index + ".js" });
}

console.log("Wirkungswahl-Kompass public artifact checks passed.");
