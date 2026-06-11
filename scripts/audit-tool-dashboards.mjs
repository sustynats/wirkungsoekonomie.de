import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const modelPath = path.join(ROOT, "content/dashboards/dashboardModels.json");
const inventoryPath = path.join(ROOT, "docs/dashboard-tool-inventory.md");
const reportPath = path.join(ROOT, "docs/dashboard-system-report.md");

const routeRoots = ["werkzeuge", "erleben", "anwendungen", "scorecard-dashboard", "wirkungsfelder"];
const standaloneRoutes = ["scorecard-dashboard.html", "scanner.html", "workflow.html", "erleben.html"];

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function stripHtml(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromHtml(html, fallback) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripHtml(h1[1]);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return stripHtml(title[1]).replace(/\s*[|–-]\s*Wirkungsökonomie.*$/i, "");
  return fallback;
}

function routeFromFile(file) {
  const rel = path.relative(ROOT, file).replaceAll(path.sep, "/");
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"/index.html".length)}/`;
  if (rel.endsWith(".html")) return `/${rel.slice(0, -".html".length)}.html`;
  return `/${rel}`;
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name === "index.html" || entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function routeExists(route) {
  if (!route.startsWith("/")) return false;
  if (route.endsWith(".html")) return fs.existsSync(path.join(ROOT, route.slice(1)));
  return fs.existsSync(path.join(ROOT, route.slice(1), "index.html"));
}

function classifyTool(route, title, html) {
  const text = `${route} ${title} ${stripHtml(html)}`.toLowerCase();
  if (/medien|sprache|framing|desinformation|diskurs|plattform/.test(text)) return "Kommunikation & Demokratie";
  if (/portfolio|fonds|kapital|kredit|steuer|finanz|t-sroi|sroi|einkommen|rente/.test(text)) return "Kapital & Finanzierung";
  if (/daten|register|dpp|produktpass|woek-id|wök-id|assurance|benchmark/.test(text)) return "Daten & Infrastruktur";
  if (/scorecard|nwi|netto|bewert|rechner|mess|indikator|audit/.test(text)) return "Messen & Bewerten";
  if (/rat|haushalt|steuerung|beschaffung|governance|evaluation/.test(text)) return "Rückkopplung & Steuerung";
  return "Grundlagen der Bewertung";
}

function detectSignals(html) {
  const text = html.toLowerCase();
  return {
    hasInputs: /<input\b|<select\b|<textarea\b|<form\b/i.test(html),
    hasScriptLogic: /addEventListener|querySelector|calculate|score|benchmark|finalscore|autoscore/i.test(html),
    mentionsProtection: /nicht amtlich|keine rechts|keine steuer|keine anlage|keine personenbewertung|keine automatische/i.test(text),
    mentionsDataQuality: /datenqualität|datenqualitaet|data quality|unsicherheit|assurance/i.test(text),
    hasRelatedLinks: /verwandte|related|methoden|dokumente|glossar/i.test(text)
  };
}

function collectRoutes() {
  const files = [
    ...routeRoots.flatMap((root) => walk(path.join(ROOT, root))),
    ...standaloneRoutes.map((file) => path.join(ROOT, file)).filter((file) => fs.existsSync(file))
  ];
  const seen = new Set();
  return files
    .map((file) => {
      const route = routeFromFile(file);
      if (seen.has(route)) return null;
      seen.add(route);
      const html = read(file);
      const title = titleFromHtml(html, route);
      return {
        route,
        file: path.relative(ROOT, file).replaceAll(path.sep, "/"),
        title,
        cluster: classifyTool(route, title, html),
        ...detectSignals(html)
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.route.localeCompare(b.route, "de"));
}

function buildInventory(routes, model) {
  const toolRoutes = routes.filter((item) => /^\/(werkzeuge|erleben|anwendungen|scorecard-dashboard|scanner|workflow)/.test(item.route));
  const rows = toolRoutes
    .map((item) => `| ${item.route} | ${item.title.replaceAll("|", "\\|")} | ${item.cluster} | ${item.hasInputs ? "ja" : "nein"} | ${item.mentionsProtection ? "ja" : "nein"} | ${item.mentionsDataQuality ? "ja" : "nein"} |`)
    .join("\n");
  const modelRows = model.dashboardFamilies
    .map((item) => `| ${item.title} | ${item.primaryRoute} | ${item.implementationStatus} | ${routeExists(item.primaryRoute) ? "ja" : "nein"} | ${item.methods.join(", ")} |`)
    .join("\n");

  return `# Dashboard-Tool-Inventar

Stand: 2026-05-31

Dieses Inventar ist die nicht-destruktive Grundlage fuer das Dashboard-System der WÖk-Werkzeuge. Es veraendert keine sichtbaren Seiten, sondern erfasst vorhandene Werkzeug-, Demo- und Rechner-Routen sowie die ersten Pilot-Dashboards.

## Schutzstatus

- Pre-Relaunch-Baseline vorhanden: \`docs/site-baseline-pre-relaunch.json\`
- Pre-Relaunch-Summary vorhanden: \`docs/site-baseline-pre-relaunch-summary.md\`
- Keine bestehende Route wurde geloescht oder umbenannt.
- Dashboard-Arbeit startet als zusaetzliche Modell- und Auditschicht.

## Pilot-Dashboards

| Dashboard | Primaere Route | Modellstatus | Route vorhanden | Methoden |
| --- | --- | --- | --- | --- |
${modelRows}

## Gefundene Werkzeug- und Demo-Routen

| Route | Titel | Cluster | Eingaben/Formular | Schutzlinien | Datenqualitaet |
| --- | --- | --- | --- | --- | --- |
${rows}

## Erste Risiken

- Mehrere Tools sind bereits interaktiv, aber die Nutzerfuehrung ist nicht ueberall gleich aufgebaut.
- Schutzlinien und Datenqualitaet sind nicht auf allen Werkzeugseiten gleich sichtbar.
- Scorecards, NWI, T-SROI, Reverse Merit Order und WÖk-ID sind vorhanden, brauchen aber eine konsistente Dashboard-Erklaerlogik.
- Die naechste Stufe sollte sichtbare Komponenten nur aus diesem Inventar heraus aufbauen und dabei alte Routen erhalten.
`;
}

function buildReport(routes, model) {
  const missingRoutes = model.dashboardFamilies.filter((item) => !routeExists(item.primaryRoute));
  const missingProtection = routes.filter((item) => /^\/(werkzeuge|erleben)/.test(item.route) && item.hasInputs && !item.mentionsProtection);
  const missingDataQuality = routes.filter((item) => /^\/(werkzeuge|erleben)/.test(item.route) && item.hasInputs && !item.mentionsDataQuality);

  return `# Dashboard-System-Report

Stand: 2026-05-31

## Erledigt

- Neues Dashboard-Modell angelegt: \`content/dashboards/dashboardModels.json\`
- Dashboard-Audit angelegt: \`scripts/audit-tool-dashboards.mjs\`
- Werkzeug-/Demo-Inventar erzeugt: \`docs/dashboard-tool-inventory.md\`
- Schutzlinien fuer Dashboard-Modelle festgelegt.
- Fuenf Pilot-Dashboards als Modellgrundlage definiert: Produktwirkung, Scorecard/Produktpass, Impact Controlling, Wohnwirkung, Medienwirkung.

## Offene Umsetzung

- Wiederverwendbare visuelle Dashboard-Komponenten auf den Toolseiten einbauen.
- Pilotseiten schrittweise angleichen, ohne alte Routen oder Toolfunktionen zu entfernen.
- Kontextbezogene FAQ-/Feedback-Module bei Toolseiten wieder konsistent sichtbar machen, sofern im Bestand vorhanden.

## Audit-Ergebnis

- Primaere Pilot-Routen ohne vorhandene Datei: ${missingRoutes.length ? missingRoutes.map((item) => item.primaryRoute).join(", ") : "keine"}
- Interaktive Werkzeugseiten ohne erkannte Schutzlinien: ${missingProtection.length}
- Interaktive Werkzeugseiten ohne erkannte Datenqualitaets-Hinweise: ${missingDataQuality.length}

## Empfehlung

Die naechste Live-Stufe sollte nicht pauschal alle Tools umschreiben, sondern zuerst die fuenf Pilot-Dashboards sichtbar harmonisieren. Danach kann das Layout auf weitere Werkzeugfamilien ausgerollt werden. Dadurch bleiben vorhandene Inhalte, Detailseiten und Routen erhalten.
`;
}

const model = JSON.parse(read(modelPath));
const routes = collectRoutes();

fs.mkdirSync(path.dirname(inventoryPath), { recursive: true });
fs.writeFileSync(inventoryPath, buildInventory(routes, model), "utf8");
fs.writeFileSync(reportPath, buildReport(routes, model), "utf8");

const requiredFields = ["id", "title", "primaryRoute", "dashboardGoal", "inputGroups", "outputGroups", "methods", "redLines", "implementationStatus"];
const failures = [];
for (const dashboard of model.dashboardFamilies) {
  for (const field of requiredFields) {
    if (!dashboard[field] || (Array.isArray(dashboard[field]) && dashboard[field].length === 0)) {
      failures.push(`${dashboard.id || dashboard.title}: missing ${field}`);
    }
  }
}

if (failures.length) {
  console.error("Dashboard audit failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Dashboard audit passed: ${model.dashboardFamilies.length} dashboard models, ${routes.length} routes inventoried.`);
console.log(`Wrote ${path.relative(ROOT, inventoryPath)} and ${path.relative(ROOT, reportPath)}.`);
