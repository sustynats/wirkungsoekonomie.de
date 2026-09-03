import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_DIRS = [
  "wirkungsradar/live",
  "wirkungsradar/detail",
  "wirkungsradar/narrative",
  "wirkungsradar/resonanz-kompass",
  "wirkungsradar/agenda-radar",
  "wirkungsradar/ursachen-navigator",
  "wirkungsradar/ursachen",
  "wirkungsradar/resilienz-prinzipien",
  "oeffentlicher-wirkungsraum",
];
const REPORT_PATH = path.join(ROOT, "reports/2-0-traceability/public-impact-room-detail-ux.json");

const HUB_PAGES = new Set([
  "wirkungsradar/live/index.html",
  "wirkungsradar/detail/index.html",
  "wirkungsradar/narrative/index.html",
  "wirkungsradar/resonanz-kompass/index.html",
  "wirkungsradar/agenda-radar/index.html",
  "wirkungsradar/ursachen-navigator/index.html",
  "wirkungsradar/ursachen/index.html",
  "wirkungsradar/resilienz-prinzipien/index.html",
  "oeffentlicher-wirkungsraum/index.html",
]);

const SECTION_MAP = [
  { test: /^wirkungsradar\/live\//, label: "Debattenkarten", href: "wirkungsradar/debattenkarten/" },
  { test: /^wirkungsradar\/detail\//, label: "Debattenkarten", href: "wirkungsradar/debattenkarten/" },
  { test: /^wirkungsradar\/narrative\//, label: "Narrative", href: "wirkungsradar/narrative/" },
  { test: /^wirkungsradar\/resonanz-kompass\//, label: "Resonanz-Kompass", href: "wirkungsradar/resonanz-kompass/" },
  { test: /^wirkungsradar\/agenda-radar\//, label: "Agenda-Radar", href: "wirkungsradar/agenda-radar/" },
  { test: /^wirkungsradar\/ursachen-navigator\//, label: "Ursachen-Navigator", href: "wirkungsradar/ursachen-navigator/" },
  { test: /^wirkungsradar\/ursachen\//, label: "Ursachen", href: "wirkungsradar/ursachen-navigator/" },
  { test: /^wirkungsradar\/resilienz-prinzipien\//, label: "Resilienz-Prinzipien", href: "wirkungsradar/resilienz-prinzipien/" },
  { test: /^oeffentlicher-wirkungsraum\/dossier-/, label: "Methode und Dossiers", href: "oeffentlicher-wirkungsraum/" },
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
  const relative = path.relative(path.dirname(file), ROOT).replaceAll(path.sep, "/");
  return relative ? `${relative}/` : "./";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromHtml(html, fallback) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripTags(h1[1]);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return stripTags(title[1]).split("|")[0].split(" - ")[0].trim();
  return fallback;
}

function sectionFor(relativeFile) {
  return SECTION_MAP.find((entry) => entry.test.test(relativeFile));
}

function normalizeBreadcrumb(html, file, relativeFile) {
  const section = sectionFor(relativeFile);
  if (!section) return html;
  const prefix = rootPrefix(file);
  const title = titleFromHtml(html, "Detailseite");
  const trail = `<a href="${prefix}index.html">Start</a> / <a href="${prefix}oeffentlicher-wirkungsraum/">Öffentlicher Wirkungsraum</a> / <a href="${prefix}${section.href}">${section.label}</a> / ${escapeHtml(title)}`;
  const breadcrumb = `<nav class="breadcrumb" aria-label="Breadcrumb">${trail}</nav>`;
  if (/<nav\s+class="breadcrumb"[^>]*>[\s\S]*?<\/nav>/i.test(html)) {
    return html.replace(/<nav\s+class="breadcrumb"[^>]*>[\s\S]*?<\/nav>/i, breadcrumb);
  }
  return html.replace(/(<section class="hero[^>]*>\s*<div[^>]*>)/i, `$1${breadcrumb}`);
}

function nextSteps(file) {
  const prefix = rootPrefix(file);
  return `<section class="section owr-next-steps" data-owr-next-steps data-search-exclude>
      <div>
        <div class="section-header">
          <p class="hero-kicker">Nächste Schritte</p>
          <h2>Von der Einordnung zur besseren Debatte.</h2>
        </div>
        <div class="card-grid three">
          <article class="card">
            <p class="card-kicker">Antwort finden</p>
            <h3>Passende Debattenkarte öffnen</h3>
            <p>Wenn du konkret reagieren willst: Behauptung, Sofortantwort, Folgencheck, Wirkpfad und Quellen.</p>
            <p><a class="btn btn-secondary" href="${prefix}wirkungsradar/debattenkarten/">Debattenkarten öffnen</a></p>
          </article>
          <article class="card">
            <p class="card-kicker">Narrativ verstehen</p>
            <h3>Das Muster dahinter sehen</h3>
            <p>Wenn dieselbe Geschichte immer wieder auftaucht: Frame, Resonanz, Gefühl und Gegenframe einordnen.</p>
            <p><a class="btn btn-secondary" href="${prefix}wirkungsradar/narrative/">Narrative öffnen</a></p>
          </article>
          <article class="card">
            <p class="card-kicker">Ursache klären</p>
            <h3>Zur Systemfrage gehen</h3>
            <p>Wenn der Aufreger nur Oberfläche ist: Ursache, Bilanzgrenze, Wirkpfad und bessere Hebel prüfen.</p>
            <p><a class="btn btn-secondary" href="${prefix}wirkungsradar/ursachen-navigator/">Ursachen-Navigator öffnen</a></p>
          </article>
        </div>
      </div>
    </section>`;
}

function ensureNextSteps(html, file, relativeFile) {
  if (HUB_PAGES.has(relativeFile)) return html;
  if (!sectionFor(relativeFile)) return html;
  if (html.includes("data-owr-next-steps")) return html;
  const block = nextSteps(file);
  const community = html.search(/<section[^>]+data-community-submission-block/i);
  if (community !== -1) {
    return `${html.slice(0, community)}${block}\n    ${html.slice(community)}`;
  }
  return html.replace(/<\/main>/i, `${block}\n  </main>`);
}

const changed = [];
const files = TARGET_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)));

for (const file of files) {
  const relativeFile = path.relative(ROOT, file).replaceAll(path.sep, "/");
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  html = normalizeBreadcrumb(html, file, relativeFile);
  html = ensureNextSteps(html, file, relativeFile);
  if (html !== before) {
    fs.writeFileSync(file, html);
    changed.push(relativeFile);
  }
}

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, `${JSON.stringify({
  generated_at: new Date().toISOString(),
  changed_count: changed.length,
  changed,
}, null, 2)}\n`);

console.log(`Public impact room detail UX normalized: ${changed.length} files changed.`);
