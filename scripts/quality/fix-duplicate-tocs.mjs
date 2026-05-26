import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const publicRoots = [
  "wirkungsfelder",
  "werkzeuge",
  "erleben",
  "anwendungen",
  "werkstatt",
  "bibliothek",
  "downloads",
  "dokumente",
  "portale",
  "verstehen",
];

const changed = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith(".html") ? [full] : [];
  });
}

function hasTemplateToc(html) {
  return /\bclass="[^"]*\btoc-card\b/i.test(html) || /aria-label="Inhaltsverzeichnis"/i.test(html);
}

function removePlainTocSections(html) {
  let removed = 0;
  let out = html.replace(/<section\b[^>]*>[\s\S]*?<h[1-3]\b[^>]*>\s*Inhaltsverzeichnis\s*(?:<a\b[\s\S]*?<\/a>)?\s*<\/h[1-3]>[\s\S]*?<\/section>/gi, (match) => {
    if (/\btoc-card\b|\btoc-links\b|aria-label="Inhaltsverzeichnis"/i.test(match)) return match;
    removed += 1;
    return "";
  });

  out = out.replace(/<(nav|details)\b[^>]*class="[^"]*\btoc-card\b[^"]*"[^>]*>\s*<\/\1>/gi, () => {
    removed += 1;
    return "";
  });

  return { html: out, removed };
}

function normalizeTocLabels(html) {
  return html.replace(/(<a\b[^>]*>)(\s*\d{1,3}[\.)]\s+)([^<]+<\/a>)/g, (_match, prefix, _number, label) => `${prefix}${label}`);
}

for (const root of publicRoots) {
  for (const file of walk(path.join(ROOT, root))) {
    const original = fs.readFileSync(file, "utf8");
    if (!hasTemplateToc(original)) continue;
    const cleaned = removePlainTocSections(original);
    const normalized = normalizeTocLabels(cleaned.html);
    if (normalized !== original) {
      fs.writeFileSync(file, normalized);
      changed.push({ file: path.relative(ROOT, file), removed: cleaned.removed });
    }
  }
}

if (changed.length) {
  console.log(`Duplicate TOC cleanup updated ${changed.length} files.`);
  for (const item of changed) {
    console.log(`${item.file}\tremovedPlainTocs=${item.removed}`);
  }
} else {
  console.log("Duplicate TOC cleanup found no changes.");
}
