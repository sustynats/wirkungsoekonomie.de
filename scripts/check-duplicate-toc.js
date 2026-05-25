import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY_PATH = path.join(ROOT, "assets/data/content-registry.json");
const OUT = path.join(ROOT, "docs/duplicate-toc-audit.md");
const registry = fs.existsSync(REGISTRY_PATH) ? JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8")).entries || [] : [];
const findings = [];

function fileForUrl(url) {
  if (url === "/") return "index.html";
  const clean = url.replace(/^\/+|\/+$/g, "");
  return `${clean}/index.html`;
}

function visibleText(html) {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

for (const entry of registry) {
  if (!["landing", "wirkungsfeld", "tool"].includes(entry.pageType)) continue;
  const rel = fileForUrl(entry.url);
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  const html = fs.readFileSync(abs, "utf8");
  const text = visibleText(html);
  const firstThird = text.slice(0, Math.floor(text.length / 3));
  const tocHits = (firstThird.match(/Inhaltsverzeichnis|toc-card|toc-links/gi) || []).length;
  if (tocHits > 0) {
    findings.push({
      url: entry.url,
      pageType: entry.pageType,
      issue: "Inhaltsverzeichnis im oberen Bereich einer Landing-, Wirkungsfeld- oder Toolseite prüfen.",
    });
  }
}

const lines = [
  "# Duplicate-TOC- und TOC-Placement-Audit",
  "",
  `Stand: ${new Date().toISOString()}`,
  "",
  `- Geprüfte Seiten: ${registry.length}`,
  `- Befunde: ${findings.length}`,
  "",
  findings.length ? "| URL | pageType | Befund |\n| --- | --- | --- |\n" + findings.map((item) => `| ${item.url} | ${item.pageType} | ${item.issue} |`).join("\n") : "Keine TOC-P0-Befunde.",
  "",
];

fs.writeFileSync(OUT, `${lines.join("\n")}\n`);
console.log(`TOC audit: ${findings.length} findings -> docs/duplicate-toc-audit.md`);
