import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "public/data/publication-qa-normalization.json");
const htmlTargets = [
  "werkzeuge/index.html",
  "werkstatt/gesetze/wirkungssteuergesetz/index.html",
  "bibliothek/kommunaler-wirkungsindex-kwi-diskussionspapier/index.html",
];

function stripTags(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeGermanText(value) {
  return String(value || "")
    .replaceAll("Pruefpflichten", "Prüfpflichten")
    .replaceAll("Bias-Pruefung", "Bias-Prüfung")
    .replaceAll("Ueberpruefung", "Überprüfung")
    .replaceAll("ueberpruefbar", "überprüfbar")
    .replaceAll("Pruefverfahren", "Prüfverfahren")
    .replaceAll("gepruefte", "geprüfte")
    .replaceAll("geprueft", "geprüft");
}

function normalizeToolSearchAttributes(html) {
  return html
    .replaceAll('<a class="text-link" href="../verstehen/sdgs-sdgplus/#sdgplus">SDG+</a>', "SDG+")
    .replace(/\sdata-search="([^"]*)"/g, (_match, value) => ` data-search="${stripTags(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;")}"`);
}

function normalizeKwiPseudocode(html) {
  return html.replace(
    /<p><br># KWI 1\.0 - stark vereinfachter Pseudocode<br>([\s\S]*?)<br><\/p>/,
    (_match, body) => {
      const code = `# KWI 1.0 - stark vereinfachter Pseudocode\n${body.replaceAll("<br>", "\n").trim()}`;
      return `<pre class="document-code-block"><code>${code}</code></pre>`;
    },
  );
}

let changedFiles = 0;
for (const rel of htmlTargets) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;
  const before = fs.readFileSync(file, "utf8");
  const after = normalizeKwiPseudocode(normalizeGermanText(normalizeToolSearchAttributes(before)));
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changedFiles += 1;
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  status: "checked",
  normalizedHtmlFiles: changedFiles,
  note: "Compatibility QA step. Repairs generated public-language artifacts before the final audit.",
};

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Publication QA normalization compatibility step OK (${changedFiles} HTML files normalized).`);
