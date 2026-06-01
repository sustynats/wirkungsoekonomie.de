import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const markerStart = "<!-- tool-examples:start -->";
const markerEnd = "<!-- tool-examples:end -->";
const examples = JSON.parse(fs.readFileSync(path.join(root, "assets/data/tool-examples.json"), "utf8"));

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, html) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

function replaceMarked(html, block) {
  const start = html.indexOf(markerStart);
  const end = html.indexOf(markerEnd);
  if (start >= 0 && end > start) {
    return `${html.slice(0, start)}${block}${html.slice(end + markerEnd.length)}`;
  }
  return html.replace("</main>", `${block}\n    </main>`);
}

function ensureScripts(html, prefix) {
  const scripts = [
    `${prefix}assets/js/impact-calculations.js`,
    `${prefix}assets/js/tool-examples-dashboard.js`
  ];
  for (const src of scripts) {
    if (!html.includes(src)) {
      html = html.replace("</body>", `    <script src="${src}" defer></script>\n  </body>`);
    }
  }
  return html;
}

function statusLabel(status) {
  return {
    interactive: "interaktiv",
    model: "modellhaft",
    "in-preparation": "in Vorbereitung"
  }[status] || status;
}

function dashboardKpis() {
  const interactive = examples.filter((item) => item.status === "interactive").length;
  const methodPages = new Set(examples.map((item) => item.methodPage)).size;
  const prepared = examples.filter((item) => item.status === "in-preparation").length;
  const dataQuality = examples.filter((item) => JSON.stringify(item).toLowerCase().includes("datenqualität")).length;
  const rmo = examples.filter((item) => JSON.stringify(item).toLowerCase().includes("reverse merit") || JSON.stringify(item).toLowerCase().includes("nichtkompensation")).length;
  return [
    ["Interaktive Demos", interactive],
    ["Methodenseiten mit Beispiel", methodPages],
    ["Tools in Vorbereitung", prepared],
    ["mit Datenqualitätslogik", dataQuality],
    ["mit Reverse-Merit-Order-Logik", rmo]
  ].map(([label, value]) => `<article class="dashboard-metric"><div><span>${escapeHtml(label)}</span><strong>${value}</strong><small>Werkzeuglogik</small></div></article>`).join("");
}

function renderDashboardPage() {
  const base = read(path.join(root, "werkzeuge/index.html"));
  const rebase = (html) => html
    .replaceAll('href="../', 'href="../../')
    .replaceAll('src="../', 'src="../../')
    .replaceAll('content="https://wirkungsoekonomie.de/werkzeuge/"', 'content="https://wirkungsoekonomie.de/werkzeuge/dashboard/"');
  const head = rebase(base.slice(0, base.indexOf("</head>"))
    .replace(/<title>.*?<\/title>/, "<title>Werkzeug-Dashboard der Wirkungsökonomie | Wirkungsökonomie</title>")
    .replace(/<meta name="description" content=".*?">/, '<meta name="description" content="Interaktive, modellhafte Werkzeugbeispiele der Wirkungsökonomie mit Filtern, Schutzlinien und Methodikbrücken.">') + "</head>");
  const header = rebase(base.slice(base.indexOf("<body>"), base.indexOf("<main>")));
  const footer = rebase(base.slice(base.indexOf("<footer"), base.indexOf("</body>")));
  const body = `${head}
${header}
    <main>
      <section class="hero method-map-hero">
        <div class="hero-grid">
          <div>
            <nav class="breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Werkzeuge</a></nav>
            <p class="hero-kicker">Werkzeug-Dashboard</p>
            <h1 class="hero-title">Werkzeug-Dashboard der Wirkungsökonomie</h1>
            <p class="hero-subtitle">Interaktive Beispiele, Checks, Rechner und Methodik-Demos an einem Ort.</p>
            <p class="hero-text">Alle Beispiele sind modellhaft. Sie zeigen Wirkungslogiken, Datenqualität, Nichtkompensation und nächste Prüfschritte, ohne amtliche Bewertung, Beratung oder automatische Entscheidung zu behaupten.</p>
          </div>
          <aside class="protection-notice" role="note">
            <p class="card-kicker">Schutzlinien</p>
            <h2 class="card-title">Nicht amtlich. Keine Beratung. Keine Personenbewertung.</h2>
            <ul class="protection-notice-list">
              <li>Keine Rechts-, Steuer-, Finanz-, Anlage-, Förder-, Versicherungs-, Medizin- oder Sozialberatung.</li>
              <li>Keine Personenbewertung, keine Gesinnungsbewertung und keine automatische Entscheidung.</li>
              <li>Rote Linien und Datenlücken dürfen positive Einzelwerte nicht überdecken.</li>
            </ul>
          </aside>
        </div>
      </section>
      <section class="section" data-tool-examples-dashboard aria-labelledby="tool-examples-dashboard-title">
        <div class="section-header">
          <p class="hero-kicker">Filtern & vergleichen</p>
          <h2 id="tool-examples-dashboard-title">Alle interaktiven Beispiele</h2>
          <p id="tool-example-count" data-tool-example-count>Beispiele werden geladen.</p>
        </div>
        <div class="dashboard-summary-grid">${dashboardKpis()}</div>
        <form class="tool-filter-panel tool-example-filter-panel" aria-label="Werkzeugbeispiele filtern">
          <label>Suche <input type="search" data-tool-example-search placeholder="Werkzeug, SDG, Cluster oder Zielgruppe"></label>
          <label>Cluster <select data-tool-example-cluster></select></label>
          <label>Demo-Typ <select data-tool-example-type></select></label>
          <label>Zielgruppe <select data-tool-example-target></select></label>
        </form>
        <div class="method-map-grid tool-example-grid" data-tool-example-cards></div>
      </section>
    </main>
${footer}
  </body>
</html>`;
  return ensureScripts(body, "../../");
}

function renderGenericExample(example, prefix) {
  const inputList = (example.inputs || []).slice(0, 6).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const outputList = (example.outputs || []).slice(0, 5).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `${markerStart}
      <section class="section tool-example-block" id="interaktives-beispiel" aria-labelledby="tool-example-title">
        <div class="section-header">
          <p class="hero-kicker">Modellhaft ausprobieren</p>
          <h2 id="tool-example-title">Interaktives Beispiel: ${escapeHtml(example.title)}</h2>
          <p>${escapeHtml(example.shortDescription)}</p>
        </div>
        <aside class="protection-notice" role="note">
          <p class="card-kicker">DemoDisclaimer</p>
          <h3 class="card-title">Modellhafte Demo, keine Beratung</h3>
          <p class="card-text">Diese Demo ist modellhaft. Sie ersetzt keine amtliche Bewertung, keine Prüfung, keine Rechts-, Steuer-, Finanz-, Förder-, Versicherungs-, Medizin- oder Sozialberatung. Bewertet werden Strukturen und Wirkungslogiken, nicht Personen.</p>
        </aside>
        <div class="card-grid three">
          <article class="card">
            <p class="card-kicker">Was du hier siehst</p>
            <h3 class="card-title">Vereinfachte Wirkungslogik</h3>
            <p class="card-text">Dieses Beispiel zeigt eine vereinfachte Wirkungslogik. Es macht Zusammenhänge sichtbar, ersetzt aber keine Prüfung, keine Beratung und keine demokratische Entscheidung.</p>
          </article>
          <article class="card">
            <p class="card-kicker">Eingaben</p>
            <h3 class="card-title">Typische Datenpunkte</h3>
            <ul class="check-list">${inputList}</ul>
          </article>
          <article class="card">
            <p class="card-kicker">Ergebnisbereich</p>
            <h3 class="card-title">Modellhafte Ausgaben</h3>
            <ul class="check-list">${outputList}</ul>
          </article>
          <article class="card">
            <p class="card-kicker">Warum das schwächste Feld zählt</p>
            <h3 class="card-title">Reverse Merit Order</h3>
            <p class="card-text">Das schwächste kritische Wirkungsfeld begrenzt die Gesamtbewertung. Negative Wirkung darf nicht durch positive Einzelwerte kompensiert werden.</p>
          </article>
          <article class="card">
            <p class="card-kicker">Welche Daten fehlen?</p>
            <h3 class="card-title">Datenqualität sichtbar machen</h3>
            <p class="card-text">Fehlende Quellen, Schätzungen, unklare Systemgrenzen oder niedriger Prüfstatus werden als Revisionsbedarf sichtbar.</p>
          </article>
          <article class="card">
            <p class="card-kicker">Nächster sinnvoller Schritt</p>
            <h3 class="card-title">Dashboard öffnen</h3>
            <p class="card-text">Vergleiche dieses Beispiel mit verwandten Werkzeugen im zentralen Werkzeug-Dashboard.</p>
            <div class="portal-card-actions"><a class="text-link" href="${prefix}werkzeuge/dashboard/">Werkzeug-Dashboard öffnen</a></div>
          </article>
        </div>
      </section>
${markerEnd}`;
}

function renderTSROIExample(prefix) {
  return `${markerStart}
      <section class="section tool-example-block" id="interaktives-beispiel" aria-labelledby="tool-example-title" data-tool-example-tsroi>
        <div class="section-header">
          <p class="hero-kicker">Interaktives Beispiel</p>
          <h2 id="tool-example-title">Agri-Solarpark vs. Standard-Solarpark</h2>
          <p>T-SROI wird hier strikt als Transformationskennzahl gezeigt. Der NWI bleibt Eingangsschwelle; rote Linien oder negative Netto-Wirkung blockieren ein positives T-SROI-Ergebnis.</p>
        </div>
        <aside class="protection-notice" role="note">
          <p class="card-kicker">DemoDisclaimer</p>
          <h3 class="card-title">Modellhafte Demo, keine Beratung</h3>
          <p class="card-text">Diese Demo ist modellhaft. Sie ersetzt keine amtliche Bewertung, keine Prüfung, keine Rechts-, Steuer-, Finanz-, Förder-, Versicherungs-, Medizin- oder Sozialberatung. Bewertet werden Strukturen und Wirkungslogiken, nicht Personen.</p>
        </aside>
        <div class="tool-example-lab">
          <form class="tool-example-form" aria-label="T-SROI Modellwerte">
            <label>Investition / Mitteleinsatz <input name="investment" type="number" min="1" step="10000" value="500000"></label>
            <label>geprüfter NWI <input name="nwi" type="range" min="-3" max="3" step="0.1" value="1.2"></label>
            <label>Transformationswirkung <input name="transformation" type="range" min="0" max="100" step="1" value="72"></label>
            <label>systemische Hebelwirkung <input name="systemLeverage" type="range" min="0" max="5" step="0.1" value="2.1"></label>
            <label>Zeitwirkung <input name="timeFactor" type="range" min="0" max="3" step="0.1" value="1.4"></label>
            <label>Resilienzfaktor <input name="resilienceFactor" type="range" min="0" max="3" step="0.1" value="1.3"></label>
            <label>Datenqualität <input name="dataQuality" type="range" min="0" max="1" step="0.05" value="0.75"></label>
            <label class="tool-filter-check"><input name="redLineActive" type="checkbox"> rote Linie aktiv</label>
          </form>
          <div class="tool-example-results" data-tsroi-output aria-live="polite"></div>
        </div>
        <div class="card-grid three">
          <article class="card"><p class="card-kicker">Formel-Template</p><h3 class="card-title">T-SROI-Modellwert</h3><p class="card-text">T-SROI = (T_struktur × H_sys × F_zeit × F_resilienz × Q_daten) / I</p></article>
          <article class="card"><p class="card-kicker">Was diese Demo nicht leistet</p><h3 class="card-title">Keine Netto-Wirkungskennzahl</h3><p class="card-text">T-SROI ersetzt den NWI nicht. Negative Netto-Wirkung, rote Linien oder Datenlücken werden nicht durch Transformationsversprechen überdeckt.</p></article>
          <article class="card"><p class="card-kicker">Nächster sinnvoller Schritt</p><h3 class="card-title">Vergleichen</h3><p class="card-text">Öffne das Dashboard und vergleiche T-SROI mit NWI, Scorecards und Reverse Merit Order.</p><div class="portal-card-actions"><a class="text-link" href="${prefix}werkzeuge/dashboard/">Werkzeug-Dashboard öffnen</a></div></article>
        </div>
      </section>
${markerEnd}`;
}

function injectIntoToolPage(file, example) {
  let html = read(file);
  const rel = path.relative(path.dirname(file), root).replaceAll(path.sep, "/") || ".";
  const prefix = `${rel}/`.replace(/^\.$/, "./");
  const block = example.slug === "t-sroi-agri-solar" ? renderTSROIExample(prefix) : renderGenericExample(example, prefix);
  const anchor = html.indexOf('<section class="section" aria-labelledby="methodenpapier">');
  if (anchor >= 0 && !html.includes(markerStart)) {
    html = `${html.slice(0, anchor)}${block}\n      ${html.slice(anchor)}`;
  } else {
    html = replaceMarked(html, block);
  }
  html = ensureScripts(html, prefix);
  write(file, html);
}

function injectWerkzeugeIndex() {
  const file = path.join(root, "werkzeuge/index.html");
  let html = read(file);
  const block = `${markerStart}
      <section class="section" aria-labelledby="tool-dashboard-teaser-title">
        <div class="section-header">
          <p class="hero-kicker">Interaktive Beispiele &amp; Dashboard</p>
          <h2 id="tool-dashboard-teaser-title">Werkzeuglogik modellhaft ausprobieren</h2>
          <p>Das Dashboard bündelt Rechner, Checks, Radar-Ansichten und Methodik-Demos. Alle Beispiele bleiben modellhaft, nicht amtlich und ohne Personenbewertung.</p>
        </div>
        <div class="card">
          <h3 class="card-title">Werkzeug-Dashboard der Wirkungsökonomie</h3>
          <p class="card-text">Filtere nach Cluster, Demo-Typ und Zielgruppe; vergleiche NWI, T-SROI, Scorecards, Reverse Merit Order, Datenqualität und Governance-Hinweise.</p>
          <div class="portal-card-actions"><a class="btn btn-primary" href="./dashboard/">Werkzeug-Dashboard öffnen</a></div>
        </div>
      </section>
${markerEnd}`;
  html = html.includes(markerStart)
    ? replaceMarked(html, block)
    : html.replace('<section class="section method-orientation-section"', `${block}\n      <section class="section method-orientation-section"`);
  write(file, html);
}

write(path.join(root, "werkzeuge/dashboard/index.html"), renderDashboardPage());
injectWerkzeugeIndex();

for (const example of examples) {
  const file = path.join(root, example.methodPage.replace(/^\//, ""), "index.html");
  if (fs.existsSync(file)) injectIntoToolPage(file, example);
}

console.log(`Tool examples dashboard built: ${examples.length} examples.`);
