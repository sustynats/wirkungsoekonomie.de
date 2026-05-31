import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BLOCKED_ROUTE_PATTERNS = [
  /\/referenz\/version(?:en|-)/,
  /\/referenz\/export\//
];
const BLOCKED_FILE_PATTERNS = [
  /^referenz\/version(?:en|-)/,
  /^referenz\/export\//
];

const filesToScan = [
  "assets/data/library-version-registry.json",
  "assets/search/search-index.json",
  "public/data/woek-search-meta.json",
  "bibliothek/index.html",
  "downloads.html"
];

const findings = [];

for (const relative of filesToScan) {
  const abs = path.join(ROOT, relative);
  if (!fs.existsSync(abs)) continue;
  const text = fs.readFileSync(abs, "utf8");
  for (const pattern of BLOCKED_ROUTE_PATTERNS) {
    if (pattern.test(text)) findings.push(`${relative} exposes internal reference route ${pattern}`);
  }
}

for (const relative of [
  "referenz/versionen/index.html",
  "referenz/version-1-1/index.html",
  "referenz/version-1-1/index 2.html",
  "referenz/export/index.html"
]) {
  const abs = path.join(ROOT, relative);
  if (!fs.existsSync(abs)) continue;
  const text = fs.readFileSync(abs, "utf8");
  if (!/name=["']robots["']\s+content=["']noindex,\s*nofollow["']/i.test(text)) {
    findings.push(`${relative} is missing noindex,nofollow`);
  }
  if (/data-pagefind-body|search_title|search_description/i.test(text)) {
    findings.push(`${relative} still exposes search metadata/body`);
  }
}

for (const relative of fs.existsSync(path.join(ROOT, "referenz")) ? fs.readdirSync(path.join(ROOT, "referenz")) : []) {
  const filePath = `referenz/${relative}/`;
  if (BLOCKED_FILE_PATTERNS.some((pattern) => pattern.test(filePath))) continue;
}

if (findings.length) {
  console.error("Internal reference publication check failed:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log("Internal reference publication check passed.");
