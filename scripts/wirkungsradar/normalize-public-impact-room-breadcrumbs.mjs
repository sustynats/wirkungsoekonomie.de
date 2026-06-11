import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RADAR_DIR = path.join(ROOT, "wirkungsradar");
const REPORT_PATH = path.join(ROOT, "reports/2-0-traceability/public-impact-room-breadcrumbs.json");

const COMPONENTS = [
  ["resonanz-kompass", "Resonanz-Kompass"],
  ["agenda-radar", "Agenda-Radar"],
  ["ursachen-navigator", "Ursachen-Navigator"],
  ["resilienz-prinzipien", "Resilienz-Prinzipien"],
  ["muster", "Aufmerksamkeitsfallen"],
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return entry.isFile() && entry.name === "index.html" ? [absolute] : [];
  });
}

function rootPrefix(file) {
  const from = path.dirname(file);
  const relative = path.relative(from, ROOT).replaceAll(path.sep, "/");
  return relative ? `${relative}/` : "./";
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function finalLabel(inner, relativeFile) {
  const knownLabels = {
    "wirkungsradar/debattenkarten/index.html": "Debattenkarten",
    "wirkungsradar/live/index.html": "Antwortkarten",
    "wirkungsradar/narrative/index.html": "Narrative",
    "wirkungsradar/antwort-playbooks/index.html": "Antwort-Playbooks",
    "wirkungsradar/host-playbook/index.html": "Antwort-Playbooks",
    "wirkungsradar/methode/index.html": "Methode",
    "wirkungsradar/psychologie/index.html": "Psychologie",
    "wirkungsradar/themen/index.html": "Themen",
    "wirkungsradar/narrativ-einreichen/index.html": "Narrativ einreichen",
    "wirkungsradar/pruefprozess/index.html": "Prüfprozess",
  };
  if (knownLabels[relativeFile]) return knownLabels[relativeFile];

  const visible = stripTags(inner);
  const parts = visible
    .split(/\s+\/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const last = parts.at(-1) || "";
  if (last && !["Start", "Wirkungsradar", "Debatten-Kompass", "Öffentlicher Wirkungsraum"].includes(last)) {
    return last;
  }
  if (relativeFile === "wirkungsradar/index.html") return "Debatten-Kompass";
  const segments = relativeFile.split("/");
  return segments.at(-2)?.replaceAll("-", " ") || "Debatten-Kompass";
}

function componentFor(relativeFile) {
  const segments = relativeFile.split("/");
  const second = segments[1];
  const found = COMPONENTS.find(([slug]) => slug === second);
  if (found) return { slug: found[0], label: found[1] };
  return { slug: "wirkungsradar", label: "Debatten-Kompass" };
}

function normalizedBreadcrumb(file, inner) {
  const relativeFile = path.relative(ROOT, file).replaceAll(path.sep, "/");
  const prefix = rootPrefix(file);
  const impactRoom = `<a href="${prefix}oeffentlicher-wirkungsraum/">Öffentlicher Wirkungsraum</a>`;

  if (relativeFile === "wirkungsradar/index.html") {
    return `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="${prefix}index.html">Start</a> / ${impactRoom} / Debatten-Kompass</nav>`;
  }

  const component = componentFor(relativeFile);
  const componentHref = `${prefix}${component.slug === "wirkungsradar" ? "wirkungsradar" : `wirkungsradar/${component.slug}`}/`;
  const label = finalLabel(inner, relativeFile);
  const componentTrail = label === component.label
    ? component.label
    : `<a href="${componentHref}">${component.label}</a> / ${label}`;

  return `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="${prefix}index.html">Start</a> / ${impactRoom} / ${componentTrail}</nav>`;
}

const changed = [];
const skipped = [];

for (const file of walk(RADAR_DIR)) {
  const html = fs.readFileSync(file, "utf8");
  const next = html.replace(/<nav\s+class="breadcrumb"[^>]*>([\s\S]*?)<\/nav>/g, (match, inner) => {
    const visible = stripTags(inner);
    if (!visible.includes("Start")) return match;
    return normalizedBreadcrumb(file, inner);
  });

  if (next !== html) {
    fs.writeFileSync(file, next);
    changed.push(path.relative(ROOT, file).replaceAll(path.sep, "/"));
  } else {
    skipped.push(path.relative(ROOT, file).replaceAll(path.sep, "/"));
  }
}

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(
  REPORT_PATH,
  `${JSON.stringify({
    generated_at: new Date().toISOString(),
    changed_count: changed.length,
    skipped_count: skipped.length,
    changed,
  }, null, 2)}\n`
);

console.log(`Public impact room breadcrumbs normalized: ${changed.length} files changed, ${skipped.length} unchanged.`);
