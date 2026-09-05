import fs from "node:fs";
import path from "node:path";
import { normalizePublicPunctuation } from "./public-punctuation.mjs";

const repoRoot = process.cwd();
const forbidden = String.fromCharCode(0x2014);
const shouldFix = process.argv.includes("--fix");
const skippedDirs = new Set([
  ".git",
  ".github",
  ".claude",
  ".next",
  ".wt-akademie-cards",
  ".wt-akademie-kurse",
  ".wt-akademie-multi",
  ".wt-akademie-read",
  ".wt-inst",
  "_site",
  "build",
  "dist",
  "node_modules",
  "out",
  "woek-akademie-app",
  "woek-institut-app"
]);
const extensions = new Set([
  ".cjs",
  ".css",
  ".html",
  ".inc",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".sql",
  ".ts",
  ".tsx",
  ".txt",
  ".xml",
  ".yaml",
  ".yml"
]);

const defaultTargets = [
  "admin",
  "akademie",
  "app",
  "assets",
  "begriffe",
  "bibliothek",
  "blog",
  "content",
  "docs",
  "glossar",
  "institut",
  "journal",
  "lib",
  "methodik",
  "public",
  "quellen",
  "quellenarchiv",
  "referenz",
  "scripts",
  "templates",
  "werkzeuge",
  "wirkungsfelder",
  "wissen",
  "."
].filter((target, index, all) => all.indexOf(target) === index && fs.existsSync(path.join(repoRoot, target)));

const targets = process.argv.slice(2).filter((arg) => arg !== "--fix");
const roots = targets.length ? targets : defaultTargets;
const offenders = [];
let fixedFiles = 0;

function scan(filePath) {
  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    const name = path.basename(filePath);
    if (skippedDirs.has(name)) return;
    for (const entry of fs.readdirSync(filePath)) scan(path.join(filePath, entry));
    return;
  }
  if (!stat.isFile() || !extensions.has(path.extname(filePath))) return;
  const text = fs.readFileSync(filePath, "utf8");
  if (!text.includes(forbidden)) return;
  const normalized = normalizePublicPunctuation(text, path.extname(filePath));
  if (normalized === text) return;
  if (shouldFix) {
    fs.writeFileSync(filePath, normalized);
    fixedFiles += 1;
  }
  const rel = path.relative(repoRoot, filePath);
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (line.includes(forbidden)) offenders.push(`${rel}:${index + 1}`);
  });
}

for (const target of roots) {
  const absolute = path.join(repoRoot, target);
  if (fs.existsSync(absolute)) scan(absolute);
}

if (offenders.length && !shouldFix) {
  console.error("U+2014 is not allowed in public/deployed text. Use '-' instead.");
  console.error(offenders.slice(0, 200).join("\n"));
  if (offenders.length > 200) console.error(`...and ${offenders.length - 200} more`);
  process.exit(1);
}

if (fixedFiles) {
  console.log(`Normalized U+2014 to '-' in ${fixedFiles} files.`);
}

console.log("Public prose punctuation checked; code, attributes and data preserved.");
