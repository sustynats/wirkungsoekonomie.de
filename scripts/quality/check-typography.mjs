import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BLOCKED = "–";
const SCAN_TARGETS = [
  "akademie.html",
  "anwendungen.html",
  "begriffe",
  "blog.html",
  "blog",
  "datenschutz.html",
  "dokumente",
  "downloads.html",
  "downloads",
  "erleben.html",
  "erleben",
  "fuer",
  "funktionsweise",
  "glossar.html",
  "index.html",
  "kompass.html",
  "modell.html",
  "ordnung",
  "portale",
  "referenz",
  "referenzrahmen",
  "sdg-plus",
  "suche.html",
  "verstehen",
  "werkzeuge",
  "website-1-0-release",
  "wirkungsoekonomie.html",
  "wirkungsfelder",
  "workflow.html",
  "assets/data",
  "assets/search",
  "public/data",
];

const TEXT_FILE_RE = /\.(html|json|md|txt|xml)$/i;
const findings = [];

function walk(relativePath, files = []) {
  const fullPath = path.join(ROOT, relativePath);
  if (!fs.existsSync(fullPath)) return files;

  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(fullPath, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      walk(path.join(relativePath, entry.name), files);
    }
    return files;
  }

  if (TEXT_FILE_RE.test(relativePath)) files.push(relativePath);
  return files;
}

for (const file of SCAN_TARGETS.flatMap((target) => walk(target))) {
  const text = fs.readFileSync(path.join(ROOT, file), "utf8");
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (line.includes(BLOCKED)) findings.push(`${file}:${index + 1}: ${line.trim()}`);
  });
}

if (findings.length) {
  console.error("Typography check failed: replace long dash '–' with '-' before deployment.");
  console.error(findings.slice(0, 80).join("\n"));
  if (findings.length > 80) console.error(`... ${findings.length - 80} more findings`);
  process.exit(1);
}

console.log("Typography check passed: no long dash found.");
