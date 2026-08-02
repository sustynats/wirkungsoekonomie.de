import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicGuide = path.join(root, "content/documents/online/woek-begriffsleitfaden-fuehrend.inc");
const guide = path.join(root, "source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.0.md");
const fallback = "WOeK_Begriffsleitfaden_fuehrend_v1.0.md";
const source = fs.existsSync(publicGuide) ? publicGuide : (fs.existsSync(guide) ? guide : fallback);

if (!fs.existsSync(source)) {
  console.error("Leading glossary guide not found. Add it to source-assets/originals/.");
  process.exit(1);
}

const text = fs.readFileSync(source, "utf8");
const textFromHtml = (value = "") => String(value)
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/\s+/g, " ")
  .trim();
const headings = source.endsWith(".inc")
  ? Array.from(text.matchAll(/<h[2-4]\b[^>]*>([\s\S]*?)<\/h[2-4]>/giu)).map((match) => textFromHtml(match[1]))
  : Array.from(text.matchAll(/^#{2,4}\s+(.+)$/gmu)).map((match) => match[1].trim());
fs.writeFileSync(
  "public/data/glossary-extract.json",
  `${JSON.stringify({ source: path.relative(root, source) || source, extractedAt: new Date().toISOString(), headings }, null, 2)}\n`
);
console.log(`Extracted ${headings.length} headings from leading glossary guide.`);
