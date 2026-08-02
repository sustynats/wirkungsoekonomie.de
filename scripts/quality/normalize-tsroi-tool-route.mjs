import fs from "node:fs";
import path from "node:path";
import "./normalize-wirkstoff-analogy.mjs";

const ROOT = process.cwd();
const LEGACY_ROUTE = "werkzeuge/impact-controlling/t-sroi/";
const CURRENT_ROUTE = "werkzeuge/t-sroi/";
const LEGACY_FILE = path.join(ROOT, "werkzeuge/impact-controlling/t-sroi/index.html");
const SKIP_DIRECTORIES = new Set([".git", "node_modules", "tmp"]);

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (SKIP_DIRECTORIES.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

let changed = 0;
for (const file of walk(ROOT)) {
  if (file === LEGACY_FILE) continue;
  const current = fs.readFileSync(file, "utf8");
  const normalized = current.replace(
    /(href=["'][^"']*)werkzeuge\/impact-controlling\/t-sroi\//giu,
    `$1${CURRENT_ROUTE}`,
  );
  if (normalized === current) continue;
  fs.writeFileSync(file, normalized, "utf8");
  changed += 1;
}

const sitemapPath = path.join(ROOT, "sitemap.xml");
if (fs.existsSync(sitemapPath)) {
  const current = fs.readFileSync(sitemapPath, "utf8");
  const normalized = current.replace(
    new RegExp(`\\s*<url><loc>https://wirkungsoekonomie\\.de/${LEGACY_ROUTE}</loc><lastmod>[^<]+</lastmod></url>`, "gu"),
    "",
  );
  if (normalized !== current) {
    fs.writeFileSync(sitemapPath, normalized, "utf8");
    changed += 1;
  }
}

console.log(`T-SROI-Toolroute normalisiert: ${changed} Datei(en) aktualisiert.`);
