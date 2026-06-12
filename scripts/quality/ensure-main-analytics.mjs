import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const JS_VERSION = "20260605-analytics-wirkungsraum";
const excludedDirs = new Set([".git", "node_modules", "_site"]);
const excludedFiles = new Set([
  "templates/header.html",
  "templates/footer.html"
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (excludedDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }
  return files;
}

function relativeAssetBase(file) {
  const dir = path.dirname(file);
  const relative = path.relative(dir, ROOT).replace(/\\/g, "/");
  if (!relative) return "";
  return `${relative}/`;
}

function hasMainScript(html) {
  return /assets\/js\/main\.js(?:\?v=[^"' <]+)?/.test(html);
}

function shouldSkip(file, html) {
  const relative = path.relative(ROOT, file).replace(/\\/g, "/");
  if (excludedFiles.has(relative)) return true;
  if (!/<\/body>/i.test(html)) return true;
  if (/<template\b/i.test(html) && relative.startsWith("templates/")) return true;
  return false;
}

let updated = 0;
let alreadyTracked = 0;
let skipped = 0;

for (const file of walk(ROOT)) {
  const html = fs.readFileSync(file, "utf8");
  if (shouldSkip(file, html)) {
    skipped += 1;
    continue;
  }
  if (hasMainScript(html)) {
    alreadyTracked += 1;
    continue;
  }
  const base = relativeAssetBase(file);
  const script = `    <script src="${base}assets/js/main.js?v=20260612-shell-audio-fix" defer></script>\n`;
  const next = html.replace(/<\/body>/i, `${script}</body>`);
  fs.writeFileSync(file, next);
  updated += 1;
}

console.log(`Analytics main.js coverage OK: ${alreadyTracked} already tracked, ${updated} updated, ${skipped} skipped.`);
