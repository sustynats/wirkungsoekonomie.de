import fs from "node:fs";

const sourcePath = "content/glossary/imports/legacy-detail-definitions.json";
const imported = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const terms = Array.isArray(imported.terms) ? imported.terms : [];
const errors = [];

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

for (const term of terms) {
  const file = `begriffe/${term.slug}/index.html`;
  if (!fs.existsSync(file)) {
    errors.push(`${term.slug}: Detailseite fehlt`);
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  const lead = decodeHtml(html.match(/<p class="lead">([\s\S]*?)<\/p>/)?.[1]);
  const definition = decodeHtml(html.match(/<p class="section-eyebrow">Definition<\/p>[\s\S]*?<p>([\s\S]*?)<\/p>/)?.[1]);
  const meta = decodeHtml(html.match(/<meta name="description" content="([^"]*)">/)?.[1]);
  if (lead !== term.shortDefinition) errors.push(`${term.slug}: Lead weicht von der zentralen Definition ab`);
  if (definition !== term.shortDefinition) errors.push(`${term.slug}: Definitionskarte weicht von der zentralen Definition ab`);
  if (/im Glossar der Wirkungsökonomie\.?$/i.test(meta)) errors.push(`${term.slug}: generische Meta-Beschreibung`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Legacy detail definitions check passed for ${terms.length} terms.`);
