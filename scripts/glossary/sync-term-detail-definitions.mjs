import fs from "node:fs";
import path from "node:path";

const importPath = "content/glossary/imports/wirkungsfinanzpolitik-term-definitions.json";
const checkOnly = process.argv.includes("--check");
const imported = JSON.parse(fs.readFileSync(importPath, "utf8"));
const terms = Array.isArray(imported.terms) ? imported.terms : [];
const errors = [];
let updated = 0;

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

for (const term of terms) {
  const file = path.join("begriffe", term.slug, "index.html");
  if (!fs.existsSync(file)) continue;

  const html = fs.readFileSync(file, "utf8");
  const placeholder = new RegExp(`${escapeRegex(term.canonicalLabel)} im Glossar der Wirkungsökonomie\\.?`, "i");
  const definitionMatch = html.match(/<p class=["']section-eyebrow["']>Definition<\/p>[\s\S]*?<h2[^>]*>[\s\S]*?<\/h2>\s*<p>([\s\S]*?)<\/p>/i);
  const hasPlaceholderDefinition = placeholder.test(definitionMatch?.[1] || "");
  if (!hasPlaceholderDefinition) continue;

  if (checkOnly) {
    errors.push(`${term.slug}: Platzhalter statt Definition`);
    continue;
  }

  const definition = escapeHtml(term.shortDefinition);
  const next = html
    .replace(/(<meta\s+name=["']description["']\s+content=["'])[^"']*(["'][^>]*>)/i, `$1${definition}$2`)
    .replace(/(<p class=["'][^"']*\blead\b[^"']*["'][^>]*>)[\s\S]*?(<\/p>)/i, `$1${definition}$2`)
    .replace(/(<section class=["']term-summary-card["'][\s\S]*?<ul>\s*<li>)[\s\S]*?(<\/li>)/i, `$1${definition}$2`)
    .replace(/(<p class=["']section-eyebrow["']>Definition<\/p>[\s\S]*?<h2[^>]*>[\s\S]*?<\/h2>\s*<p>)[\s\S]*?(<\/p>)/i, `$1${definition}$2`);

  if (next === html) {
    errors.push(`${term.slug}: Definition konnte nicht ersetzt werden`);
    continue;
  }
  fs.writeFileSync(file, next, "utf8");
  updated += 1;
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`${checkOnly ? "Verified" : "Updated"} ${updated} term detail definitions.`);
