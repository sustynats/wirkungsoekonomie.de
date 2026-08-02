#!/usr/bin/env node
/**
 * Replaces legacy full-text routes whose underlying papers contain a
 * person-scoring or automatic individual-decision model. The historical PDF
 * remains reachable as a clearly labelled source; the old HTML URLs never
 * present that model as a current public proposal.
 *
 * This runs after any work-paper import and before sitemap/search generation.
 * `--check` is intentionally write-free and is used by the publication gate.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const checkOnly = process.argv.includes("--check");
const SITE = "https://wirkungsoekonomie.de";

const HISTORICAL_PAGES = [
  {
    route: "dokumente/wenn-maschinen-arbeiten/",
    title: "Wenn Maschinen arbeiten",
    archiveRoute: "bibliothek/wenn-maschinen-arbeiten/",
    pdfRoute: "assets/pdf/wenn-maschinen-arbeiten.pdf",
    successorRoute: "wirkungsfelder/arbeit-einkommen/",
    successorLabel: "Aktuelle Einordnung zu Arbeit & Einkommen öffnen",
    correction: "Die frühere Fassung schlägt persönliche Wirkungskonten sowie automatische Steuer-, Transfer- und Leistungsfolgen vor. Das ist verworfen: Die WÖk bewertet keine Menschen, vergibt keine sozialen Punkte und entscheidet nicht automatisch über Einzelne."
  },
  {
    route: "dokumente/wp-produkte/",
    title: "Produktbesteuerung durch Wirkung",
    archiveRoute: "bibliothek/wp-produkte/",
    pdfRoute: "assets/pdf/working-paper-produktbesteuerung-durch-wirkung.pdf",
    successorRoute: "wirkungsfelder/produkte-konsum/dossier/",
    successorLabel: "Aktuelles Dossier Produkte & Konsum öffnen",
    correction: "Die frühere Fassung ordnet Scores teilweise automatisch Steuerklassen und Preisen zu und dehnt die Logik auf Personen und Einkommen aus. Das ist verworfen: Produktprüfung braucht Rechtsgrundlage, Datenqualität, Prüfung und demokratische Kontrolle."
  },
  {
    route: "dokumente/wp-rente/",
    title: "Working-Paper Rente",
    archiveRoute: "bibliothek/wp-rente/",
    pdfRoute: "public/downloads/originals/WP_Rente.pdf",
    successorRoute: "wirkungsfelder/rente-soziale-sicherung/",
    successorLabel: "Aktuelle Einordnung zu Rente & sozialer Sicherung öffnen",
    correction: "Die frühere Fassung verrechnet Biografien und Wirkungsfaktoren mit individuellen Renten- und Leistungsfolgen. Das ist verworfen: Die WÖk bewertet keine Personen und ersetzt weder Grundsicherung noch Gleichbehandlung, Datenschutz oder Rechtsschutz durch einen Wert."
  }
];

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&#39;");
}

function pageFor(entry) {
  const archive = `../../${entry.archiveRoute}`;
  const pdf = `../../${entry.pdfRoute}`;
  const successor = `../../${entry.successorRoute}`;
  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(entry.title)} – historische Quellenfassung | Wirkungsökonomie</title>
    <meta name="description" content="Historische, ersetzte Quellenfassung mit fachlicher Korrektur und Verweis auf die aktuelle Einordnung.">
    <meta name="robots" content="noindex,follow">
    <link rel="canonical" href="${SITE}/${entry.archiveRoute}">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260802-historical-sources">
  </head>
  <body>
    <header class="site-header" data-search-exclude>
      <a class="brand" href="../../index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="../../assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <nav class="site-nav" aria-label="Hauptnavigation">
        <a href="../../verstehen.html">Verstehen</a>
        <a href="../../wirkungsfelder/">Wirkungsfelder</a>
        <a href="../../bibliothek/">Bibliothek</a>
      </nav>
    </header>
    <main class="section" data-search-exclude>
      <article class="article-shell">
        <nav class="breadcrumb" aria-label="Brotkrumen"><a href="../../bibliothek/">Bibliothek</a> / Historische Quellenfassung</nav>
        <header class="term-detail-hero">
          <p class="hero-kicker">Historische Quellenfassung · ersetzt</p>
          <h1>${escapeHtml(entry.title)}</h1>
          <p class="lead">Dieser frühere Volltext ist nicht mehr der aktuelle fachliche Stand.</p>
        </header>
        <section class="term-section-card callout warning">
          <p class="section-eyebrow">Fachliche Korrektur</p>
          <h2>Was daran nicht mehr gilt</h2>
          <p>${escapeHtml(entry.correction)}</p>
          <p>Kurz gesagt: Nicht Menschen erhalten eine Punktzahl. Prüffähig sind Wirkungen von Angeboten, Entscheidungen und Systemen. Nichtkompensation und Reverse Merit Order sind Schutzgrenzen in dieser Prüfung, keine Abkürzung für Eingriffe in Personenrechte.</p>
        </section>
        <section class="term-section-card">
          <h2>Zum aktuellen Stand</h2>
          <p><a class="btn btn-primary" href="${escapeHtml(successor)}">${escapeHtml(entry.successorLabel)}</a></p>
          <p><a class="btn btn-secondary" href="${escapeHtml(archive)}">Eintrag im historischen Quellenarchiv</a> <a class="text-link" href="${escapeHtml(pdf)}">Historische PDF-Quellenfassung öffnen</a></p>
        </section>
      </article>
    </main>
    <script src="../../assets/js/main.js?v=20260802-historical-sources"></script>
  </body>
</html>
`;
}

function fileFor(route) {
  return path.join(ROOT, route, "index.html");
}

function check(entry) {
  const file = fileFor(entry.route);
  if (!fs.existsSync(file)) return [`${entry.route}: historische Route fehlt`];
  const html = fs.readFileSync(file, "utf8");
  const expected = [
    'name="robots" content="noindex,follow"',
    "Historische Quellenfassung",
    "Fachliche Korrektur",
    entry.successorRoute,
    entry.archiveRoute,
    entry.pdfRoute
  ];
  return expected.filter((needle) => !html.includes(needle))
    .map((needle) => `${entry.route}: erforderlicher Hinweis oder Link fehlt: ${needle}`);
}

if (checkOnly) {
  const errors = HISTORICAL_PAGES.flatMap(check);
  if (errors.length) {
    console.error(`Historische Personen-Scoring-Routen fehlerhaft:\n- ${errors.join("\n- ")}`);
    process.exit(1);
  }
  console.log(`Historische Personen-Scoring-Routen geprüft: ${HISTORICAL_PAGES.length}.`);
} else {
  let written = 0;
  for (const entry of HISTORICAL_PAGES) {
    const file = fileFor(entry.route);
    const html = pageFor(entry);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== html) {
      fs.writeFileSync(file, html);
      written += 1;
    }
  }
  console.log(`Historische Personen-Scoring-Routen normalisiert: ${written} geändert, ${HISTORICAL_PAGES.length} geprüft.`);
}
