import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "_site");

const allowedExcel = new Set([
  "assets/downloads/woek-register/WOeK_Master_Items_Public_Research_Register_v2.1.xlsx",
  "assets/downloads/go2-produktionsreihenfolge/woek_go2_produktionsreihenfolge_detailkonzepte_v1_0.xlsx",
]);

const scanExtensions = new Set([".html", ".htm", ".xml", ".txt", ".md", ".svg", ".json", ".js"]);
const linkExtensions = new Set([".html", ".htm", ".xml", ".txt", ".md", ".svg", ".json", ".js"]);
const hardPatterns = [
  [/\.md(?:\b|\?|#|$)/i, "public Markdown link"],
  [/\.(?:doc|docx|rtf)(?:\b|\?|#|$)/i, "public Word/RTF link"],
  [/Möchtest du, dass ich/i, "prompt residue"],
  [/\b(?:ChatGPT|System Prompt|User Prompt|Promptrest|KI-Anweisung)\b/i, "AI/prompt artifact"],
  [/\b(?:TODO|TBD|FIXME|lorem ipsum)\b/i, "placeholder marker"],
  [/\b(?:Source-Hash|Source-Version|Import-Version|Live-Reference-Version|partially-delta-reviewed)\b/i, "technical import metadata"],
  [/technischer Volltextimport|Abschnitts- und Absatz-IDs sind vorbereitet/i, "technical import text"],
  [/\[Button:|>\s*Button:/i, "button label leaked into content"],
  [/Originaldatei\s*:/i, "source filename leaked into content"],
  [/wp-content\/uploads\/go-x\/u\//i, "private upload path"],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function rel(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function normalizeLink(pageFile, rawHref) {
  const clean = String(rawHref || "").split("#")[0].split("?")[0];
  if (!clean || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(clean)) return null;
  if (clean.startsWith("/")) return clean.slice(1);
  const resolved = path.resolve(path.dirname(pageFile), clean);
  if (!resolved.startsWith(root)) return `OUTSIDE:${clean}`;
  return rel(resolved);
}

function linksFrom(content) {
  return [...content.matchAll(/(?:href|src|content|contentUrl)=(?:"|')([^"']+)(?:"|')/gi)].map((match) => match[1]);
}

if (!fs.existsSync(root)) {
  console.error("_site fehlt. Bitte zuerst npm run build:artifact ausführen.");
  process.exit(1);
}

const failures = [];
for (const file of walk(root)) {
  const ext = path.extname(file).toLowerCase();
  const relative = rel(file);
  if (scanExtensions.has(ext)) {
    const content = fs.readFileSync(file, "utf8");
    for (const [pattern, label] of hardPatterns) {
      if (pattern.test(content)) failures.push(`${relative}: ${label}`);
    }
  }
  if (linkExtensions.has(ext)) {
    const content = fs.readFileSync(file, "utf8");
    for (const href of linksFrom(content)) {
      const normalized = normalizeLink(file, href);
      if (!normalized || normalized.startsWith("OUTSIDE:")) continue;
      const targetExt = path.extname(normalized).toLowerCase();
      if ([".doc", ".docx", ".rtf", ".md"].includes(targetExt)) failures.push(`${relative}: verbotener öffentlicher Arbeitsdatei-Link ${href}`);
      if (targetExt === ".xlsx" && !allowedExcel.has(normalized)) failures.push(`${relative}: nicht freigegebener Excel-Link ${href}`);
    }
  }
}

if (failures.length) {
  console.error(`Public hardening check failed (${failures.length} Treffer):`);
  for (const failure of failures.slice(0, 80)) console.error(`- ${failure}`);
  if (failures.length > 80) console.error(`... ${failures.length - 80} weitere Treffer`);
  process.exit(1);
}

console.log("Public hardening check passed.");
