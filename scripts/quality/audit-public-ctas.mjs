import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "docs/link-audit.md");

const ROOTS = [
  "index.html",
  "erleben.html",
  "suche.html",
  "wirkungsfelder",
  "werkzeuge",
  "erleben",
  "anwendungen",
];

const CTA_PATTERN = /Online lesen|Vertiefung online lesen|Online-Volltext lesen|Detailkonzept lesen|Detailkonzept öffnen|Dossier lesen|Dossier öffnen|Portal öffnen|Werkzeug öffnen|Tool öffnen|Rechner öffnen|Simulation starten|Seite öffnen|Mehr erfahren|Methodik öffnen|Demo öffnen/i;
const TOOL_CLAIM_PATTERN = /Tool öffnen|Rechner öffnen|Simulation starten|Tool testen|Demo testen/i;
const INTERACTIVE_HINT_PATTERN = /<(form|input|select|textarea|button)\b|data-[a-z0-9-]*(calculator|scanner|tool|quiz|simulation)|<script\b/i;

function walk(start, files = []) {
  const abs = path.join(ROOT, start);
  if (!fs.existsSync(abs)) return files;
  const stat = fs.statSync(abs);
  if (stat.isFile() && start.endsWith(".html")) {
    files.push(start);
    return files;
  }
  if (!stat.isDirectory()) return files;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(start, entry.name);
    if (entry.isDirectory()) walk(rel, files);
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(rel);
  }
  return files;
}

function routeFor(rel) {
  if (rel === "index.html") return "/";
  return rel.endsWith("/index.html") ? `/${rel.slice(0, -"/index.html".length)}/` : `/${rel}`;
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function attr(tag, name) {
  const match = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag);
  return match ? (match[2] || match[3] || match[4] || "") : "";
}

function normalizeHref(currentRel, href) {
  if (!href || href === "#") return href || "";
  if (/^(https?:|mailto:|tel:|javascript:)/i.test(href)) return href;
  const [targetPath, hash = ""] = href.split("#");
  if (!targetPath) return `${routeFor(currentRel)}#${hash}`;
  const currentDir = path.dirname(currentRel);
  const normalized = path.normalize(path.join(currentDir, targetPath)).replaceAll("\\", "/");
  return `${routeFor(normalized)}${hash ? `#${hash}` : ""}`;
}

function targetLooksInteractive(route, cache) {
  const rel = route === "/" ? "index.html" : `${route.replace(/^\/+|\/+$/g, "")}/index.html`;
  if (!cache.has(rel)) {
    const abs = path.join(ROOT, rel);
    cache.set(rel, fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : "");
  }
  return INTERACTIVE_HINT_PATTERN.test(cache.get(rel));
}

function audit() {
  const files = [...new Set(ROOTS.flatMap((root) => walk(root)))].sort();
  const htmlCache = new Map();
  const findings = [];
  let ctaCount = 0;

  for (const rel of files) {
    const html = fs.readFileSync(path.join(ROOT, rel), "utf8");
    const currentRoute = routeFor(rel);
    const currentBase = currentRoute.replace(/#.*$/, "").replace(/\/+$/, "") || "/";
    const links = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];

    for (const match of links) {
      const tag = match[1];
      const text = stripTags(match[2]);
      const hrefRaw = attr(tag, "href");
      const classes = attr(tag, "class");
      const isCta = CTA_PATTERN.test(text) || /btn|text-link|portal-card-actions/i.test(classes);
      if (!isCta) continue;
      ctaCount += 1;

      const normalized = normalizeHref(rel, hrefRaw);
      const base = normalized.replace(/#.*$/, "").replace(/\/+$/, "") || "/";
      const samePage = base === currentBase;

      if (!hrefRaw || hrefRaw === "#") {
        findings.push({ severity: "error", rel, text, href: hrefRaw || "(leer)", issue: "CTA ohne echtes Ziel" });
        continue;
      }
      if (samePage && !normalized.includes("#")) {
        findings.push({ severity: "error", rel, text, href: hrefRaw, issue: "Self-Link auf aktuelle Seite" });
      }
      if (samePage && normalized.includes("#") && /Online lesen|Vertiefung online lesen|Online-Volltext lesen|Detailkonzept lesen|Dossier lesen/i.test(text)) {
        findings.push({ severity: "warning", rel, text, href: hrefRaw, issue: "CTA springt nur innerhalb der aktuellen Seite" });
      }
      if (TOOL_CLAIM_PATTERN.test(text) && /^\/[^#]*\/?$/.test(base) && !targetLooksInteractive(base, htmlCache)) {
        findings.push({ severity: "warning", rel, text, href: hrefRaw, issue: "Tool-/Rechner-CTA ohne erkennbare Interaktion auf Zielseite" });
      }
    }
  }

  const errors = findings.filter((item) => item.severity === "error").length;
  const warnings = findings.filter((item) => item.severity === "warning").length;
  const portalOpen = findings.filter((item) => /Portal öffnen/i.test(item.text)).length;
  const selfLinks = findings.filter((item) => item.issue.includes("Self-Link")).length;
  const lines = [
    "# Link- und CTA-Audit",
    "",
    `Stand: ${new Date().toISOString()}`,
    "",
    "## Zusammenfassung",
    "",
    `- Geprüfte HTML-Dateien: ${files.length}`,
    `- Geprüfte CTA-/Button-Links: ${ctaCount}`,
    `- Fehler: ${errors}`,
    `- Warnungen: ${warnings}`,
    `- Self-Links: ${selfLinks}`,
    `- Treffer mit \"Portal öffnen\": ${portalOpen}`,
    "",
    "## Befunde",
    "",
    "| Schwere | Datei | Linktext | href | Befund |",
    "| --- | --- | --- | --- | --- |",
    ...findings.map((item) => `| ${item.severity} | \`${item.rel}\` | ${item.text.replace(/\|/g, "\\|")} | \`${item.href}\` | ${item.issue} |`),
    "",
  ];
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, lines.join("\n"), "utf8");
  console.log(`CTA audit: ${files.length} files, ${errors} errors, ${warnings} warnings -> docs/link-audit.md`);
  if (errors > 0) process.exitCode = 1;
}

audit();
