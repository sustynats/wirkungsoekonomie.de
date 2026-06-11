import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const glossaryDir = path.join(root, "begriffe");

const forbiddenVisiblePatterns = [
  /\bpublished\b/i,
  /Publikationsstatus/i,
  /Review-Status|Reviewstatus|review_status/i,
  /redaktionell zu prüfen|redaktionell zu pruefen/i,
  /Glossar-Pack/i,
  /professionalisiert/i,
  /deep_glossary_entry/i,
  /Aktualisiert durch:\s*codex/i,
  /No-Delete|no_delete/i,
  /Source-Hash/i,
  /Import-Version/i,
  /interne Arbeitsgrundlage/i,
  /interne Quelle/i,
  /kommt noch/i,
  /in Vorbereitung/i,
  /Keine Einträge/i,
  /Bezug:\s*(defined|strong)\b/i,
  /Für diesen Begriff ist noch kein konkretes Kapitel/i,
];

const forbiddenHrefPattern = /href="[^"]*\.(md|docx?|rtf|txt|csv)([#?"]|$)/i;

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file, files);
    else if (entry.name === "index.html") files.push(file);
  }
  return files;
}

const issues = [];

for (const file of walk(glossaryDir)) {
  const html = fs.readFileSync(file, "utf8");
  const text = visibleText(html);
  for (const pattern of forbiddenVisiblePatterns) {
    const match = text.match(pattern);
    if (match) {
      issues.push({
        file: path.relative(root, file),
        pattern: String(pattern),
        match: match[0],
      });
    }
  }
  const href = html.match(forbiddenHrefPattern);
  if (href) {
    issues.push({
      file: path.relative(root, file),
      pattern: "forbidden public document href",
      match: href[0],
    });
  }
}

if (issues.length) {
  console.error(`Glossar-Public-Hardening failed: ${issues.length} issue(s).`);
  console.error(JSON.stringify(issues.slice(0, 100), null, 2));
  process.exit(1);
}

console.log(`Glossar-Public-Hardening passed for ${walk(glossaryDir).length} glossary detail pages.`);
