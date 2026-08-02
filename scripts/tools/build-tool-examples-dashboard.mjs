import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "public/data/tool-examples.json");
const markerStart = "<!-- tool-examples:start -->";
const markerEnd = "<!-- tool-examples:end -->";
const args = new Set(process.argv.slice(2));
const orientationOnly = args.has("--method-orientations-only") || args.has("--check-method-orientations");
const checkMethodOrientations = args.has("--check-method-orientations");

const methodOrientationPages = [
  "werkzeuge/arbeitsmarkt-wirkungsmonitor-migration/index.html",
  "werkzeuge/cyberresilienz-check/index.html",
  "werkzeuge/diskursrisiko-radar-migration/index.html",
  "werkzeuge/hybrid-risk-radar/index.html",
  "werkzeuge/infrastruktur-stabilitaetsindex/index.html",
  "werkzeuge/integrations-infrastruktur-score/index.html",
  "werkzeuge/kommunale-integrationsarchitektur-check/index.html",
  "werkzeuge/kritische-infrastruktur-monitor/index.html",
  "werkzeuge/resilienz-radar-kommune/index.html",
  "werkzeuge/sozialraumprofil-migration-vielfalt/index.html",
  "werkzeuge/wirkungsrisiko-matrix/index.html",
  "werkzeuge/zugehoerigkeits-und-teilgabeindex/index.html",
];

const fallbackTools = [
  {
    title: "Unternehmens-Wirkungsprofil Beta",
    text: "UWP-100 Beta bereitet Wirkungsprofile für Unternehmen vor, ohne echte Scores ohne belegte Daten zu erfinden.",
    href: "../erleben/unternehmens-wirkungsprofil/",
    cluster: "H",
    status: "Beta",
    type: "Beta-Tool",
    method: "Wirkungsprofil",
    demo: true,
  },
];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function titleFromHtml(html, file) {
  const title = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return title || path.basename(path.dirname(file));
}

function prefixFor(file) {
  const relative = path.relative(path.dirname(file), root).replaceAll(path.sep, "/") || ".";
  return relative === "." ? "./" : relative + "/";
}

function renderMethodOrientation(title, prefix) {
  return [
    markerStart,
    '      <section class="section tool-example-block" id="interaktives-beispiel" aria-labelledby="tool-example-title">',
    '        <div class="section-header">',
    '          <p class="hero-kicker">Methodik im Beispiel</p>',
    '          <h2 id="tool-example-title">Wirkungslogik im Beispiel: ' + escapeHtml(title) + '</h2>',
    '          <p>Diese Seite ordnet die Wirkungsfrage ein. Im zentralen Werkzeug-Dashboard stehen verwandte modellhafte Beispiele, Schutzlinien und Prüffragen bereit.</p>',
    '        </div>',
    '        <aside class="protection-notice" role="note">',
    '          <p class="card-kicker">Schutzlinien</p>',
    '          <h3 class="card-title">Modellhaft, nicht amtlich</h3>',
    '          <p class="card-text">Diese Einordnung ersetzt keine amtliche Bewertung, keine Prüfung und keine Beratung. Bewertet werden Strukturen, Projekte, Datenqualität und Wirkungslogiken, nicht Personen.</p>',
    '        </aside>',
    '        <div class="card-grid three">',
    '          <article class="card"><p class="card-kicker">Was du hier siehst</p><h3 class="card-title">Methodenanschluss</h3><p class="card-text">Die Seite erklärt die Wirkungslogik, typische Prüffragen und Grenzen. Verwandte Modellbeispiele stehen im zentralen Werkzeug-Dashboard.</p></article>',
    '          <article class="card"><p class="card-kicker">Warum das schwächste Feld zählt</p><h3 class="card-title">Nichtkompensation</h3><p class="card-text">Rote Linien, Datenlücken und kritische negative Wirkung dürfen nicht durch positive Einzelwerte verdeckt werden.</p></article>',
    '          <article class="card"><p class="card-kicker">Nächster sinnvoller Schritt</p><h3 class="card-title">Dashboard öffnen</h3><p class="card-text">Vergleiche verwandte Beispiele im zentralen Werkzeug-Dashboard.</p><div class="portal-card-actions"><a class="text-link" href="' + prefix + 'werkzeuge/dashboard/">Werkzeug-Dashboard öffnen</a></div></article>',
    '        </div>',
    '      </section>',
    markerEnd,
  ].join("\n");
}

function replaceMethodOrientation(html, block, relativePath) {
  const start = html.indexOf(markerStart);
  const end = html.indexOf(markerEnd);
  if (start < 0 || end <= start) {
    throw new Error("Toolbeispiel-Block fehlt: " + relativePath);
  }
  return html.slice(0, start) + block + html.slice(end + markerEnd.length);
}

function syncMethodOrientations() {
  const stale = [];
  let changed = 0;

  for (const relativePath of methodOrientationPages) {
    const file = path.join(root, relativePath);
    if (!fs.existsSync(file)) throw new Error("Toolseite fehlt: " + relativePath);
    const html = fs.readFileSync(file, "utf8");
    const next = replaceMethodOrientation(html, renderMethodOrientation(titleFromHtml(html, file), prefixFor(file)), relativePath);
    if (next !== html) {
      stale.push(relativePath);
      if (!checkMethodOrientations) {
        fs.writeFileSync(file, next, "utf8");
        changed += 1;
      }
    }
  }

  if (checkMethodOrientations && stale.length) {
    throw new Error("Methodenorientierungen sind nicht synchron: " + stale.join(", "));
  }
  return { checked: methodOrientationPages.length, changed };
}

if (!orientationOnly) {
let tools = fallbackTools;
if (fs.existsSync(out)) {
  const existing = JSON.parse(fs.readFileSync(out, "utf8"));
  if (Array.isArray(existing.tools) && existing.tools.length > 0) {
    tools = existing.tools;
    const hasUwp = tools.some((tool) => String(tool.href || "").includes("unternehmens-wirkungsprofil"));
    if (!hasUwp) tools = [...tools, ...fallbackTools];
  }
}

const normalized = {
  generatedAt: new Date().toISOString(),
  count: tools.length,
  tools,
};

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(normalized, null, 2) + "\n");
console.log("Wrote " + tools.length + " tool examples.");
}

const orientationResult = syncMethodOrientations();
console.log("Methodenorientierungen: " + orientationResult.changed + " aktualisiert, " + orientationResult.checked + " geprüft.");
