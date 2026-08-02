import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LEGACY_ROUTE = "werkzeuge/impact-controlling/t-sroi/";
const CURRENT_URL = "https://wirkungsoekonomie.de/werkzeuge/t-sroi/";
const LEGACY_FILE = path.join(ROOT, "werkzeuge/impact-controlling/t-sroi/index.html");
const SKIP_DIRECTORIES = new Set([".git", "node_modules", "tmp"]);
const failures = [];

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (SKIP_DIRECTORIES.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

for (const file of walk(ROOT)) {
  if (file === LEGACY_FILE) continue;
  const html = fs.readFileSync(file, "utf8");
  if (/(href=["'][^"']*)werkzeuge\/impact-controlling\/t-sroi\//iu.test(html)) {
    failures.push(`${path.relative(ROOT, file)}: interner Link verweist noch auf die zusammengeführte T-SROI-Route`);
  }
}

if (!fs.existsSync(LEGACY_FILE)) {
  failures.push("T-SROI-Aliasroute fehlt");
} else {
  const alias = fs.readFileSync(LEGACY_FILE, "utf8");
  if (!/<meta name="robots" content="noindex,follow">/iu.test(alias)) failures.push("T-SROI-Aliasroute ist nicht noindex,follow");
  if (!alias.includes(`<link rel="canonical" href="${CURRENT_URL}">`)) failures.push("T-SROI-Aliasroute hat keinen Canonical auf die führende Route");
  if (!alias.includes(`url=${CURRENT_URL}`)) failures.push("T-SROI-Aliasroute leitet nicht auf die führende Route weiter");
}

const sitemapPath = path.join(ROOT, "sitemap.xml");
if (fs.existsSync(sitemapPath) && fs.readFileSync(sitemapPath, "utf8").includes(`https://wirkungsoekonomie.de/${LEGACY_ROUTE}`)) {
  failures.push("T-SROI-Aliasroute steht noch in der Sitemap");
}

if (failures.length) {
  console.error(["T-SROI-Toolroute-Prüfung fehlgeschlagen:", ...failures.map((entry) => `- ${entry}`)].join("\n"));
  process.exit(1);
}

console.log("T-SROI-Toolroute-Prüfung bestanden: eine führende Toolroute, Alias noindex/canonical und keine verbleibenden internen Aliaslinks.");
