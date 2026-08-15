import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "assets/data/blog-index.json");
const forbidden = /\b(armin\s+maiwald|linkedin-fassung|redaktionsanweisung|todo:|platzhalter)\b/i;

if (!fs.existsSync(source)) {
  throw new Error("assets/data/blog-index.json fehlt. Bitte zuerst scripts/blog/build-blog-index.mjs ausführen.");
}

const entries = JSON.parse(fs.readFileSync(source, "utf8"));
if (!Array.isArray(entries)) {
  throw new Error("Journal-Index muss eine Liste sein.");
}

const seen = new Set();
const findings = [];
for (const [index, entry] of entries.entries()) {
  if (!entry.title || !entry.url) findings.push(`Eintrag ${index} ohne title/url`);
  if (entry.url && seen.has(entry.url)) findings.push(`Doppelte URL: ${entry.url}`);
  if (entry.url) seen.add(entry.url);
  const publicText = [entry.title, entry.excerpt, ...(entry.tags || [])].join(" ");
  if (forbidden.test(publicText)) findings.push(`Redaktionsartefakt im Index: ${entry.url || entry.title}`);
}

if (findings.length) {
  console.error(findings.join("\n"));
  process.exit(1);
}

console.log(`Journal index check OK: ${entries.length} entries.`);
