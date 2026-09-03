import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const artifactDir = path.join(root, "_site");
const baselinePath = path.join(root, "reports/url-baseline.txt");

function walkHtml(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, files);
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function routeFromHtml(file) {
  const relative = path
    .relative(artifactDir, file)
    .split(path.sep)
    .join("/")
    .replace(/\/index\.html$/, "/");
  return relative === "index.html" ? "/" : `/${relative}`;
}

if (!fs.existsSync(artifactDir)) {
  console.error("Missing _site. Run `npm run build && npm run build:artifact` before URL baseline checks.");
  process.exit(1);
}

if (!fs.existsSync(baselinePath)) {
  console.error("Missing reports/url-baseline.txt. Create an intentional baseline before enabling this gate.");
  process.exit(1);
}

const current = new Set(walkHtml(artifactDir).map(routeFromHtml).sort());
const baseline = new Set(
  fs
    .readFileSync(baselinePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean),
);

const removed = [...baseline].filter((route) => !current.has(route)).sort();
const added = [...current].filter((route) => !baseline.has(route)).sort();

console.log(`URL baseline: ${baseline.size}; current: ${current.size}; added: ${added.length}; removed: ${removed.length}`);

if (added.length) {
  console.log("Added URLs (review, allowed):");
  for (const route of added.slice(0, 80)) console.log(`+ ${route}`);
  if (added.length > 80) console.log(`... ${added.length - 80} more`);
}

if (removed.length) {
  console.error("Removed URLs detected (forbidden without an intentional baseline update):");
  for (const route of removed.slice(0, 80)) console.error(`- ${route}`);
  if (removed.length > 80) console.error(`... ${removed.length - 80} more`);
  process.exit(1);
}

console.log("URL baseline gate passed.");
