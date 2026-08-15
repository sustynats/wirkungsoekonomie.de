import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "docs/local-link-check.md");
const TARGETS = ["index.html", "erleben.html", "suche.html", "begriffe", "wirkungsfelder", "werkzeuge", "erleben", "anwendungen", "downloads", "portale"];

function walk(entry, files = []) {
  if (/\s+\d+\.html$/i.test(entry)) return files;
  const full = path.join(ROOT, entry);
  if (!fs.existsSync(full)) return files;
  const stat = fs.statSync(full);
  if (stat.isFile() && entry.endsWith(".html")) files.push(entry);
  else if (stat.isDirectory()) {
    for (const child of fs.readdirSync(full, { withFileTypes: true })) walk(path.join(entry, child.name), files);
  }
  return files;
}

function attr(tag, name) {
  const match = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag);
  return match ? (match[2] || match[3] || match[4] || "") : "";
}

function fileForHref(rel, href) {
  if (!href || href.startsWith("#") || /^(https?:|mailto:|tel:|javascript:)/i.test(href)) return null;
  const target = href.split("#")[0].split("?")[0];
  if (!target) return null;
  let raw = target.startsWith("/") ? target.slice(1) : path.normalize(path.join(path.dirname(rel), target)).replaceAll("\\", "/");
  raw = raw.replace(/^(\.\.\/)+/, "");
  if (raw.endsWith("/")) return `${raw}index.html`;
  if (path.extname(raw)) return raw;
  return `${raw}/index.html`;
}

const files = [...new Set(TARGETS.flatMap((target) => walk(target)))].sort();
const findings = [];
let checked = 0;
for (const rel of files) {
  const html = fs.readFileSync(path.join(ROOT, rel), "utf8");
  for (const match of html.matchAll(/<a\b([^>]*)>/gi)) {
    const href = attr(match[1], "href");
    const target = fileForHref(rel, href);
    if (!target) continue;
    checked += 1;
    if (!fs.existsSync(path.join(ROOT, target))) findings.push({ rel, href, target });
  }
}

const lines = [
  "# Local Link Check",
  "",
  `Stand: ${new Date().toISOString()}`,
  "",
  `- Geprüfte HTML-Dateien: ${files.length}`,
  `- Geprüfte lokale Links: ${checked}`,
  `- Fehlende Ziele: ${findings.length}`,
  "",
];
if (!findings.length) lines.push("Keine fehlenden lokalen Linkziele gefunden.");
else {
  lines.push("| Datei | href | erwartetes Ziel |", "| --- | --- | --- |");
  for (const item of findings.slice(0, 300)) lines.push(`| \`${item.rel}\` | \`${item.href}\` | \`${item.target}\` |`);
}
fs.writeFileSync(OUT, `${lines.join("\n")}\n`, "utf8");
console.log(`Local link check: ${checked} links, ${findings.length} missing -> docs/local-link-check.md`);
if (findings.length) process.exitCode = 1;
