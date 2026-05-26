import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TARGETS = ["erleben", "anwendungen", "werkzeuge", "wirkungsfelder", "werkstatt", "portale"];
const CTA_PATTERN = /Online lesen|Onlinefassung lesen|Vertiefung online lesen|Online-Volltext lesen|Detailkonzept lesen|Detailkonzept öffnen|Dossier lesen|Dossier öffnen|Portal öffnen|Werkzeug öffnen|Tool öffnen|Tool testen|Rechner öffnen|Rechner nutzen|Simulation starten|Seite öffnen|Seitenadresse|Mehr erfahren|Methodik lesen|Methodik öffnen|Wirkungsfeld ansehen|Öffnen/i;

function walk(dir, files = []) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return files;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel, files);
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(rel);
  }
  return files;
}

function routeFor(rel) {
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
  if (/^https?:\/\/(www\.)?wirkungsoekonomie\.de\//i.test(href)) {
    const url = new URL(href);
    return `${url.pathname}${url.hash || ""}`;
  }
  if (/^(https?:|mailto:|tel:|javascript:)/i.test(href)) return href;
  if (href.startsWith("/")) return href;
  const [targetPath, hash = ""] = href.split("#");
  if (!targetPath) return `${routeFor(currentRel)}#${hash}`;
  const currentDir = path.dirname(currentRel);
  const normalized = path.normalize(path.join(currentDir, targetPath)).replaceAll("\\", "/");
  return `${routeFor(normalized)}${hash ? `#${hash}` : ""}`;
}

function currentLabel(text) {
  if (/Online lesen|Onlinefassung|Online-Volltext/i.test(text)) return "Du liest diese Onlinefassung.";
  if (/Seitenadresse/i.test(text)) return "Du liest diese Onlinefassung.";
  if (/Detailkonzept/i.test(text)) return "Du liest dieses Detailkonzept.";
  if (/Dossier/i.test(text)) return "Du liest dieses Dossier.";
  if (/Methodik|Werkzeug/i.test(text)) return "Du bist auf dieser Methodenseite.";
  if (/Tool|Rechner|Simulation/i.test(text)) return "Du nutzt diese Demo.";
  return "Aktuelle Seite";
}

function fixFile(rel) {
  const abs = path.join(ROOT, rel);
  const currentRoute = routeFor(rel).replace(/\/+$/, "") || "/";
  let html = fs.readFileSync(abs, "utf8");
  let changed = 0;

  html = html
    .replace(/Spezifikation online lesen/g, "Methodik anzeigen")
    .replace(/Detailkonzept online lesen/g, "Konzeptpapier lesen")
    .replace(/Dossier online lesen/g, "Dossier lesen")
    .replace(/Zum Detailkonzept/g, "Konzeptpapier lesen")
    .replace(/Zum Konzeptpapier/g, "Konzeptpapier lesen")
    .replace(/Zum Dossier/g, "Dossier lesen")
    .replace(/Online-Volltext lesen/g, "Onlinefassung lesen")
    .replace(/(<a\b[^>]*href=["']#detailkonzept["'][^>]*>)Detailkonzept lesen(<\/a>)/gi, "$1Detailabschnitt anzeigen$2")
    .replace(/(<a\b[^>]*href=["']#einzeldossier["'][^>]*>)Dossier lesen(<\/a>)/gi, "$1Dossierabschnitt anzeigen$2")
    .replace(/(<a\b[^>]*href=["']#risikolabor["'][^>]*>)Risiko-Simulation starten(<\/a>)/gi, "$1Risikolabor ansehen$2");

  html = html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (full, tag, body) => {
    const text = stripTags(body);
    if (!CTA_PATTERN.test(text)) return full;
    const href = attr(tag, "href");
    const normalized = normalizeHref(rel, href);
    const targetRoute = normalized.replace(/#.*$/, "").replace(/\/+$/, "") || "/";
    if (targetRoute !== currentRoute || normalized.includes("#")) return full;
    changed += 1;
    return `<span class="text-note is-current" aria-current="page">${currentLabel(text)}</span>`;
  });

  if (changed > 0 || html !== fs.readFileSync(abs, "utf8")) {
    fs.writeFileSync(abs, html, "utf8");
  }
  return changed;
}

let fixed = 0;
for (const rel of TARGETS.flatMap((target) => walk(target))) fixed += fixFile(rel);
console.log(`Fixed ${fixed} public CTA self-links.`);
