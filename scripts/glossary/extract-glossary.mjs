import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const guide = path.join(root, "source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.0.md");
const fallback = "WOeK_Begriffsleitfaden_fuehrend_v1.0.md";
const source = fs.existsSync(guide) ? guide : fallback;

if (!fs.existsSync(source)) {
  console.error("Leading glossary guide not found. Add it to source-assets/originals/.");
  process.exit(1);
}

const text = fs.readFileSync(source, "utf8");
const headings = Array.from(text.matchAll(/^#{2,4}\s+(.+)$/gm)).map((match) => match[1].trim());
fs.writeFileSync(
  "public/data/glossary-extract.json",
  `${JSON.stringify({ source, extractedAt: new Date().toISOString(), headings }, null, 2)}\n`
);
console.log(`Extracted ${headings.length} headings from leading glossary guide.`);

