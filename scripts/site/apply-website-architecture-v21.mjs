import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const STYLE_VERSION = "20260606-nav-cache-fix";
const SCRIPT_VERSION = "20260606-main-cache-fix";

const navigationPath = path.join(ROOT, "assets/data/navigation.json");
const architecturePath = path.join(ROOT, "assets/data/website-architecture-v21.json");

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function relPath(filePath) {
  return path.relative(ROOT, filePath);
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(relativePath, content) {
  const filePath = path.join(ROOT, relativePath);
  ensureDir(filePath);
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`written ${relPath(filePath)}`);
}

function readFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function writeJson(relativePath, data) {
  writeFile(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

const header = [
  { label: "Start", href: "index.html", match: ["index.html"] },
  {
    label: "Verstehen",
    href: "verstehen/",
    match: ["verstehen/", "verstehen.html", "wirkungsoekonomie.html", "wirkungsoekonomie/", "modell.html", "ordnung/", "so-wirkt-wirkungsoekonomie/"],
  },
  {
    label: "Für wen?",
    href: "fuer/",
    match: ["fuer/", "fuer-wen/", "fuer/unternehmen.html", "fuer/buergerinnen.html", "fuer/investoren.html", "fuer/kommunen.html"],
  },
  {
    label: "Wirkungsfelder",
    href: "wirkungsfelder/",
    match: ["wirkungsfelder/", "anwendungen.html"],
  },
  {
    label: "Wirkungssteuerung",
    href: "wirkungssteuerung/",
    match: ["wirkungssteuerung/", "fuer/wirkungssteuer.html", "werkstatt/gesetze/wirkungssteuergesetz/", "werkzeuge/scorecards/", "werkzeuge/t-sroi/"],
  },
  {
    label: "Praxis & Tools",
    href: "werkzeuge/",
    match: [
      "werkzeuge/",
      "tools/",
      "methodik/",
      "workflow.html",
      "scanner.html",
      "anwendungen/scanner.html",
      "scorecard-dashboard.html",
      "erleben/",
      "erleben.html",
      "ausprobieren/",
      "oeffentlicher-wirkungsraum/",
      "wirkungsradar/",
    ],
  },
  {
    label: "Lernen",
    href: "lernen/",
    match: ["lernen/", "akademie.html", "akademie/"],
  },
  {
    label: "Bibliothek",
    href: "bibliothek/",
    match: ["bibliothek/", "downloads.html", "downloads/", "dokumente/", "referenz/", "buch.html", "buch/", "evidenz/", "quellen/", "fachbibliothek/", "blog.html", "blog/", "begriffe/", "glossar.html"],
  },
  {
    label: "Mitmachen",
    href: "mitmachen.html",
    match: ["mitmachen.html", "mitmachen/"],
  },
];

const utilities = [
  { label: "Suche", href: "suche.html", match: ["suche.html"] },
  { label: "WÖk-KI", href: "woek-ki/", match: ["woek-ki/"] },
  { label: "Mein Wirkungsraum", href: "mein-wirkungsraum/", match: ["mein-wirkungsraum/"] },
];

const wirkungsfelder = [
  {
    title: "Mensch & Lebensqualität",
    text: "Gesundheit, Bildung, Pflege, Teilhabe, Alltag und Lebensqualität werden als reale Zustandsveränderungen sichtbar.",
    links: [
      ["Gesundheit & Pflege", "wirkungsfelder/gesundheit-pflege/"],
      ["Bildung", "wirkungsfelder/bildung/"],
      ["Für Bürger:innen", "fuer/buergerinnen.html"],
    ],
  },
  {
    title: "Planet & Ressourcen",
    text: "Klima, Energie, Biodiversität, Rohstoffe, Wasser und Regeneration bilden die Grenze jeder Wirtschafts- und Soziallogik.",
    links: [
      ["Klima, Energie & Ressourcen", "wirkungsfelder/klima-energie-ressourcen/"],
      ["Produkte & Konsum", "wirkungsfelder/produkte-konsum/"],
      ["Reverse Merit Order", "werkzeuge/reverse-merit-order/"],
    ],
  },
  {
    title: "Wirtschaft, Produkte & Unternehmen",
    text: "Unternehmen, Produkte, Lieferketten, Preise und Geschäftsmodelle werden als Wirkungssysteme gelesen.",
    links: [
      ["Wirtschaft & Unternehmen", "wirkungsfelder/wirtschaft-unternehmen/"],
      ["Produkte & Konsum", "wirkungsfelder/produkte-konsum/"],
      ["Für Unternehmen", "fuer/unternehmen.html"],
    ],
  },
  {
    title: "Arbeit, Einkommen & Soziales",
    text: "Leistung, Care, Automatisierung, Einkommen, Rente und soziale Sicherung werden mit Wirkung rückgekoppelt.",
    links: [
      ["Arbeit & Einkommen", "wirkungsfelder/arbeit-einkommen/"],
      ["Wirkungseinkommen", "fuer/wirkungseinkommen.html"],
      ["Wirkungsrente", "fuer/rente.html"],
    ],
  },
  {
    title: "Wohnen, Stadt & Infrastruktur",
    text: "Wohnen ist mehr als Quadratmeter: Bezahlbarkeit, Gesundheit, Energie, Quartier, Boden und öffentliche Infrastruktur wirken zusammen.",
    links: [
      ["Wohnen & Stadt", "wirkungsfelder/wohnen-stadt/"],
      ["Für Mieter:innen", "fuer/mieter.html"],
      ["Kommunen", "fuer/kommunen.html"],
    ],
  },
  {
    title: "Staat, Recht & Demokratie",
    text: "Recht, Haushalt, Verwaltung, Beschaffung, Schutzlinien und demokratische Legitimation werden zur Wirkungsarchitektur.",
    links: [
      ["Staat, Recht & Demokratie", "wirkungsfelder/staat-recht-demokratie/"],
      ["Wirkungshaushalt", "wirkungssteuerung/wirkungshaushalt/"],
      ["Wirkungsrat", "wirkungssteuerung/wirkungsrat/"],
    ],
  },
  {
    title: "Öffentlichkeit, Medien & Resonanz",
    text: "Öffentliche Kommunikation wird als Wirkungsraum gelesen: Aufmerksamkeit, Emotion, Deutung, Resonanz und Verschiebung.",
    links: [
      ["Öffentlicher Wirkungsraum", "oeffentlicher-wirkungsraum/"],
      ["Debattenkarten", "wirkungsradar/debattenkarten/"],
      ["Medien & Öffentlichkeit", "wirkungsfelder/medien-oeffentlichkeit/"],
    ],
  },
  {
    title: "Wissen, Bildung, Wissenschaft & Digitalisierung",
    text: "Wissen, Daten, KI, Forschung, Lernfähigkeit und digitale Infrastruktur entscheiden, ob Wirkung prüfbar wird.",
    links: [
      ["Wissenschaft & Digitalisierung", "wirkungsfelder/wissenschaft-innovation-digitalisierung/"],
      ["Akademie", "akademie.html"],
      ["Wirkungsdatenräume", "werkzeuge/wirkungsdatenraeume/"],
    ],
  },
  {
    title: "Kapital, Banken & Risikomanagement",
    text: "Kapital bleibt Werkzeug. Entscheidend ist, welche Wirkung es verstärkt und welche Risiken es auslagert.",
    links: [
      ["Finanzsystem & Kapital", "wirkungsfelder/finanzsystem-kapital/"],
      ["Kapital & ESG", "wirkungssteuerung/kapital-banken-esg/"],
      ["Risikomanagement", "wirkungssteuerung/risikomanagement/"],
    ],
  },
];

const steuerungPages = [
  ["ueberblick", "Überblick", "Warum Preise, Steuern, Kapital und Einkommen Wirkung berücksichtigen müssen."],
  ["wirkungssteuer", "Wirkungssteuer", "Schädliche Wirkung darf sich nicht länger rechnen; positive Netto-Wirkung soll sich lohnen."],
  ["produktpreise", "Produktpreise", "Was wäre ein ehrlicherer Preis, wenn Schäden und Nutzen sichtbar werden?"],
  ["wustg", "Wirkungsumsatzsteuergesetz", "Wie Produktwirkung in eine Umsatzsteuerlogik übersetzt werden kann."],
  ["wstg", "Wirkungssteuergesetz", "Wie Wirkung als Steuerungsgröße rechtlich anschlussfähig wird."],
  ["westg", "Wirkungseinkommensteuergesetz", "Wie Einkommen, Automatisierung und Wirkung neu verbunden werden können."],
  ["wirkungseinkommen", "Wirkungseinkommen", "Warum Einkommen nicht nur Erwerbsarbeit, sondern gesellschaftliche Wirkung berücksichtigen muss."],
  ["wirkungsrente", "Wirkungsrente", "Wie Lebensleistung, Care, Pflege, Bildung und Stabilität sichtbarer werden."],
  ["wirkungshaushalt", "Wirkungshaushalt", "Wie öffentliche Mittel nach tatsächlicher Wirkung priorisiert werden können."],
  ["wirkungsrat", "Wirkungsrat", "Welche demokratische Schutz- und Prüfarchitektur Wirkungspolitik braucht."],
  ["scorecards", "Scorecards", "Wie Wirkung sichtbar, vergleichbar und prüfbar gemacht wird."],
  ["woek-ids", "WÖk-IDs", "Wie Produkte, Organisationen und Wirkpfade auffindbar und rückverfolgbar werden."],
  ["reverse-merit-order", "Reverse Merit Order", "Warum schwere Schäden nicht durch kleine Vorteile kompensiert werden dürfen."],
  ["csrd-esrs-gri", "CSRD, ESRS und GRI", "Wie Berichtssysteme mit Wirkungssteuerung verbunden werden können."],
  ["digitaler-produktpass", "Digitaler Produktpass", "Wie Produktdaten zur Wirkungsrückkopplung beitragen können."],
  ["kapital-banken-esg", "Kapital, Banken und ESG", "Wie Kapitalflüsse Wirkung, Risiko und Resilienz einpreisen können."],
  ["risikomanagement", "Risikomanagement", "Warum ausgelagerte Wirkung ein reales Risiko für Unternehmen, Staat und Gesellschaft ist."],
  ["lieferketten", "Lieferketten", "Wie Wirkung entlang von Rohstoffen, Arbeit, Transport und Nutzung sichtbar wird."],
  ["beschaffung-foerderung", "Beschaffung & Förderung", "Wie öffentliche Nachfrage und Förderung positive Netto-Wirkung wahrscheinlicher machen."],
];

const anschlussraeume = [
  "Wissenschaft",
  "Politik",
  "Verwaltung & Recht",
  "Praxis & Pilotierung",
  "Wirtschaft & Unternehmen",
  "Finanzsystem, Banken & Versicherungen",
  "Zivilgesellschaft & Bürger:innen",
  "Bildung & Akademie",
  "Medien & Öffentlichkeit",
  "Internationale Standards",
  "Technologie, Daten & Infrastruktur",
  "Kritik, Legitimation & Schutzlinien",
];

function relative(base, href) {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  return `${base}${href.replace(/^\/+/, "")}`;
}

function actionLinks(base, items) {
  return `<div class="hero-actions">
${items.map(([label, href, kind = "secondary"]) => `            <a class="btn btn-${kind}" href="${esc(relative(base, href))}">${esc(label)}</a>`).join("\n")}
          </div>`;
}

function contextSearch(base, placeholder, hidden = "") {
  return `<form class="card document-filter-grid" action="${esc(relative(base, "suche.html"))}" method="get" data-search-exclude>
            <label>Kontextsuche
              <input type="search" name="q" placeholder="${esc(placeholder)}">
            </label>
            ${hidden ? `<input type="hidden" name="bereich" value="${esc(hidden)}">` : ""}
            <button class="btn btn-primary" type="submit">Suchen</button>
          </form>`;
}

function linkList(base, links) {
  return links.map(([label, href]) => `<a class="text-link" href="${esc(relative(base, href))}">${esc(label)}</a>`).join(" · ");
}

function cardGrid(base, items) {
  return `<div class="card-grid two">
${items
  .map(
    (item) => `          <article class="card">
            <p class="card-kicker">${esc(item.kicker || "Einstieg")}</p>
            <h3 class="card-title">${esc(item.title)}</h3>
            <p class="card-text">${esc(item.text)}</p>
            ${item.links ? `<div class="portal-card-actions">${linkList(base, item.links)}</div>` : ""}
          </article>`
  )
  .join("\n")}
        </div>`;
}

function shell({ base, route, title, description, kicker, h1, subtitle, actions, content }) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)} | Wirkungsökonomie</title>
    <meta name="description" content="${esc(description)}">
    <meta name="search_title" content="${esc(title)}">
    <meta name="search_description" content="${esc(description)}">
    <meta name="search_section" content="${esc(kicker)}">
    <meta name="search_type" content="Portal">
    <link rel="canonical" href="${SITE}/${route}">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${STYLE_VERSION}">
  </head>
  <body>
    <header class="site-header" data-search-exclude><a class="brand" href="${base}index.html">Wirkungsökonomie</a><nav class="site-nav" id="site-nav"></nav></header>
    <main data-pagefind-body>
      <section class="hero">
        <div class="hero-copy">
          <p class="hero-kicker">${esc(kicker)}</p>
          <h1 class="hero-title">${esc(h1)}</h1>
          <p class="hero-subtitle">${esc(subtitle)}</p>
          ${actionLinks(base, actions)}
        </div>
      </section>
${content}
    </main>
    <script src="${base}assets/js/main.js?v=${SCRIPT_VERSION}" defer></script>
  </body>
</html>
`;
}

function updateNavigation() {
  const current = JSON.parse(fs.readFileSync(navigationPath, "utf8"));
  const footerGroups = [
    {
      title: "Verstehen",
      items: [
        { label: "Einstieg", href: "verstehen/", match: ["verstehen/"] },
        { label: "WÖk auf einer Seite", href: "verstehen/woek-auf-einer-seite/", match: ["verstehen/woek-auf-einer-seite/"] },
        { label: "So wirkt WÖk", href: "so-wirkt-wirkungsoekonomie/", match: ["so-wirkt-wirkungsoekonomie/"] },
        { label: "Modell", href: "modell.html", match: ["modell.html", "modell/"] },
        { label: "Glossar", href: "begriffe/", match: ["begriffe/", "glossar.html"] },
      ],
    },
    {
      title: "Für wen?",
      items: [
        { label: "Übersicht", href: "fuer/", match: ["fuer/"] },
        { label: "Bürger:innen", href: "fuer/buergerinnen.html", match: ["fuer/buergerinnen.html"] },
        { label: "Unternehmen", href: "fuer/unternehmen.html", match: ["fuer/unternehmen.html"] },
        { label: "Kommunen", href: "fuer/kommunen.html", match: ["fuer/kommunen.html"] },
        { label: "Investor:innen", href: "fuer/investoren.html", match: ["fuer/investoren.html"] },
        { label: "Journalismus", href: "fuer/journalismus.html", match: ["fuer/journalismus.html"] },
      ],
    },
    {
      title: "Wirkungsfelder",
      items: [
        { label: "Alle Wirkungsfelder", href: "wirkungsfelder/", match: ["wirkungsfelder/"] },
        { label: "Mensch & Lebensqualität", href: "wirkungsfelder/gesundheit-pflege/", match: ["wirkungsfelder/gesundheit-pflege/"] },
        { label: "Planet & Ressourcen", href: "wirkungsfelder/klima-energie-ressourcen/", match: ["wirkungsfelder/klima-energie-ressourcen/"] },
        { label: "Wirtschaft & Unternehmen", href: "wirkungsfelder/wirtschaft-unternehmen/", match: ["wirkungsfelder/wirtschaft-unternehmen/"] },
        { label: "Staat, Recht & Demokratie", href: "wirkungsfelder/staat-recht-demokratie/", match: ["wirkungsfelder/staat-recht-demokratie/"] },
        { label: "Öffentlichkeit & Medien", href: "wirkungsfelder/medien-oeffentlichkeit/", match: ["wirkungsfelder/medien-oeffentlichkeit/"] },
      ],
    },
    {
      title: "Wirkungssteuerung",
      items: [
        { label: "Überblick", href: "wirkungssteuerung/", match: ["wirkungssteuerung/"] },
        { label: "Wirkungssteuer", href: "wirkungssteuerung/wirkungssteuer/", match: ["wirkungssteuerung/wirkungssteuer/"] },
        { label: "Produktpreise", href: "wirkungssteuerung/produktpreise/", match: ["wirkungssteuerung/produktpreise/"] },
        { label: "Wirkungshaushalt", href: "wirkungssteuerung/wirkungshaushalt/", match: ["wirkungssteuerung/wirkungshaushalt/"] },
        { label: "Wirkungsrat", href: "wirkungssteuerung/wirkungsrat/", match: ["wirkungssteuerung/wirkungsrat/"] },
        { label: "Scorecards & WÖk-IDs", href: "wirkungssteuerung/scorecards/", match: ["wirkungssteuerung/scorecards/", "wirkungssteuerung/woek-ids/"] },
      ],
    },
    {
      title: "Praxis & Tools",
      items: [
        { label: "Methodenlandkarte", href: "werkzeuge/", match: ["werkzeuge/"] },
        { label: "Öffentlicher Wirkungsraum", href: "oeffentlicher-wirkungsraum/", match: ["oeffentlicher-wirkungsraum/"] },
        { label: "Debattenkarten", href: "wirkungsradar/debattenkarten/", match: ["wirkungsradar/debattenkarten/"] },
        { label: "Tool-Demos", href: "erleben/", match: ["erleben/"] },
        { label: "WÖk-KI", href: "woek-ki/", match: ["woek-ki/"] },
      ],
    },
    {
      title: "Lernen",
      items: [
        { label: "Lernportal", href: "lernen/", match: ["lernen/"] },
        { label: "Akademie", href: "akademie.html", match: ["akademie.html", "akademie/"] },
        { label: "Mein Wirkungsraum", href: "mein-wirkungsraum/", match: ["mein-wirkungsraum/"] },
      ],
    },
    {
      title: "Bibliothek",
      items: [
        { label: "Bibliothek", href: "bibliothek/", match: ["bibliothek/"] },
        { label: "Journal", href: "blog.html", match: ["blog.html", "blog/"] },
        { label: "Online-Buch", href: "referenz/", match: ["referenz/"] },
        { label: "Dokumentenregistry", href: "downloads.html", match: ["downloads.html", "downloads/"] },
        { label: "Quellen", href: "quellen/", match: ["quellen/"] },
        { label: "RSS & Updates", href: "updates/", match: ["updates/"] },
      ],
    },
  ];

  const next = {
    ...current,
    header,
    more: [
      ...utilities,
      { label: "Updates", href: "updates/", match: ["updates/"] },
      { label: "Referenz", href: "referenz/", match: ["referenz/"] },
    ],
    footerGroups,
  };

  fs.writeFileSync(navigationPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log("written assets/data/navigation.json");
}

function renderWirkungsfelderPage() {
  const base = "../";
  const cards = wirkungsfelder.map((field) => ({ kicker: "Wirkungsfeld", title: field.title, text: field.text, links: field.links }));
  return shell({
    base,
    route: "wirkungsfelder/",
    title: "Wirkungsfelder der Wirkungsökonomie",
    description: "Neun Suchräume der Wirkungsökonomie: Mensch, Planet, Wirtschaft, Arbeit, Wohnen, Staat, Öffentlichkeit, Wissen und Kapital.",
    kicker: "Wirkungsfelder",
    h1: "Wo wirkt eine Entscheidung?",
    subtitle:
      "Wirkungsfelder sind keine Themenablage. Sie zeigen, in welchem Lebens-, Wirtschafts- oder Institutionenraum Wirkung sichtbar, bewertet und zurückgekoppelt werden muss.",
    actions: [
      ["Wirkungsfeld suchen", "suche.html", "primary"],
      ["Wirkungssteuerung verstehen", "wirkungssteuerung/", "secondary"],
      ["Für wen öffnen", "fuer/", "secondary"],
    ],
    content: `
      <section class="section section-soft">
        <div class="section-header">
          <p class="hero-kicker">Neun Suchräume</p>
          <h2>Die WÖk ordnet nach Wirkung, nicht nach Ressort.</h2>
          <p>Ein Thema kann mehrere Felder berühren. Deshalb führen die Karten nicht in starre Zuständigkeiten, sondern in Anschlussräume: Alltag, Wirtschaft, Staat, Öffentlichkeit, Wissen und Kapital.</p>
        </div>
        ${contextSearch(base, "z. B. Pflege, T-Shirt, Miete, Kapital, Medien, Klima", "wirkungsfelder")}
        ${cardGrid(base, cards)}
      </section>
      <section class="section">
        <div class="card">
          <p class="card-kicker">Schutzlinie</p>
          <h2 class="card-title">Kein Wirkungsfeld wurde entfernt.</h2>
          <p class="card-text">Alle bisherigen Unterseiten bleiben erreichbar. Diese Übersicht korrigiert nur die Orientierung: Wirkungsfelder sind die Suchräume der gesamten Wirkungsökonomie, nicht bloß eine Sammlung einzelner Themen.</p>
        </div>
      </section>
`,
  });
}

function renderVerstehenPortal() {
  const base = "../";
  return shell({
    base,
    route: "verstehen/",
    title: "Wirkungsökonomie verstehen",
    description: "Ein verständlicher Einstieg in Wirkung, Wirkungspotenzial, positive Netto-Wirkung und Rückkopplung.",
    kicker: "Verstehen",
    h1: "Erst Alltag, dann Fachbegriff.",
    subtitle:
      "Die Wirkungsökonomie beginnt mit einer einfachen Frage: Was verändert sich wirklich - und für wen? Danach kommen Begriffe, Daten, Bewertung und Rückkopplung.",
    actions: [
      ["WÖk auf einer Seite", "verstehen/woek-auf-einer-seite/", "primary"],
      ["So wirkt WÖk", "so-wirkt-wirkungsoekonomie/", "secondary"],
      ["Glossar öffnen", "begriffe/", "secondary"],
    ],
    content: `
      <section class="section section-soft">
        <div class="section-header">
          <p class="hero-kicker">Grundbewegung</p>
          <h2>Vom Preis zur Wirkung.</h2>
          <p>Ein Preis zeigt, was bezahlt wird. Er zeigt nicht automatisch, welche Folgen bei Arbeit, Gesundheit, Klima, Vertrauen oder Demokratie entstehen. Genau diese Blindstelle schließt die Wirkungsökonomie.</p>
        </div>
        ${cardGrid(base, [
          {
            kicker: "Alltag",
            title: "Ein Apfel ist nicht nur ein Apfelpreis.",
            text: "Er enthält Wirkungen auf Boden, Wasser, Arbeit, Transport, Gesundheit, Handel und regionale Versorgung.",
            links: [["Apfelbeispiel öffnen", "wirkungsfelder/produkte-konsum/apfelbeispiel-produktwirkungsrechnung/"]],
          },
          {
            kicker: "System",
            title: "Wirkung ist eine Zustandsveränderung.",
            text: "Eine Absicht, Reichweite oder ein Output ist noch keine Wirkung. Wirkung entsteht, wenn sich reale Zustände verändern.",
            links: [["Begriff Wirkung", "begriffe/wirkung/"]],
          },
          {
            kicker: "Zielgröße",
            title: "Positive Netto-Wirkung.",
            text: "Entscheidend ist, ob Mensch, Planet und Demokratie insgesamt gestärkt werden, ohne schwere Schäden zu verdecken.",
            links: [["Positive Netto-Wirkung", "begriffe/positive-netto-wirkung/"]],
          },
          {
            kicker: "Rückkopplung",
            title: "Wirkung muss Entscheidungen verändern.",
            text: "Sichtbare Wirkung reicht nicht. Sie muss in Preise, Steuern, Kapital, Einkommen, Beschaffung und Regeln zurückfließen.",
            links: [["Wirkungssteuerung", "wirkungssteuerung/"]],
          },
        ])}
      </section>
`,
  });
}

function renderLearningPortal() {
  const base = "../";
  return shell({
    base,
    route: "lernen/",
    title: "Lernen mit der Wirkungsökonomie",
    description: "Lernwege, Akademie, Mein Wirkungsraum, Glossarlernen und Praxispfade der Wirkungsökonomie.",
    kicker: "Lernen",
    h1: "Wirkungskompetenz aufbauen.",
    subtitle:
      "Lernen heißt hier nicht nur Begriffe kennen. Lernen heißt, Wirkpfade zu erkennen, Daten zu prüfen, Zielkonflikte zu verstehen und bessere Rückkopplungen zu entwerfen.",
    actions: [
      ["Akademie öffnen", "akademie.html", "primary"],
      ["Mein Wirkungsraum", "mein-wirkungsraum/", "secondary"],
      ["Glossar lernen", "begriffe/", "secondary"],
    ],
    content: `
      <section class="section section-soft">
        <div class="section-header">
          <p class="hero-kicker">Lernpfade</p>
          <h2>Vom Einstieg zur Anwendung.</h2>
          <p>Die Lernarchitektur verbindet Grundlagen, Glossar, Akademie, Werkzeuge und persönliche Merkliste. Ohne Pflicht-Login, aber mit lokalem Wirkungsraum.</p>
        </div>
        ${cardGrid(base, [
          {
            kicker: "Grundlagen",
            title: "Wirkung verstehen",
            text: "Kurze Einstiege, Begriffe und Beispiele klären den Maßstab.",
            links: [["Verstehen", "verstehen/"], ["WÖk auf einer Seite", "verstehen/woek-auf-einer-seite/"]],
          },
          {
            kicker: "Akademie",
            title: "Strukturiert lernen",
            text: "Akademie-Module bündeln Grundlagen, Methoden, Debattenkompetenz und Praxis.",
            links: [["Akademie", "akademie.html"]],
          },
          {
            kicker: "Persönlich",
            title: "Mein Wirkungsraum",
            text: "Merken, weiterlesen, Notizen, Lernliste und Sammlungen bleiben lokal in deinem Browser.",
            links: [["Mein Wirkungsraum", "mein-wirkungsraum/"]],
          },
          {
            kicker: "Praxis",
            title: "Werkzeuge ausprobieren",
            text: "Demos und Methoden zeigen, wie Wirkung sichtbar und entscheidungsrelevant wird.",
            links: [["Praxis & Tools", "werkzeuge/"], ["Öffentlicher Wirkungsraum", "oeffentlicher-wirkungsraum/"]],
          },
        ])}
      </section>
`,
  });
}

function renderWirkungssteuerungPortal() {
  const base = "../";
  const cards = steuerungPages.map(([slug, title, text]) => ({
    kicker: "Baustein",
    title,
    text,
    links: [[`${title} öffnen`, `wirkungssteuerung/${slug}/`]],
  }));
  return shell({
    base,
    route: "wirkungssteuerung/",
    title: "Wirkungssteuerung",
    description: "Wirkungssteuerung übersetzt Wirkung in Preise, Steuern, Kapital, Einkommen, Beschaffung, Produkte, Haushalte und Regeln.",
    kicker: "Wirkungssteuerung",
    h1: "Wirkung muss in Entscheidungen zurück.",
    subtitle:
      "Die zentrale Frage lautet nicht nur, ob Wirkung sichtbar wird. Die zentrale Frage lautet, ob sie Preise, Steuern, Kapital, Einkommen, Beschaffung, Produkte, Unternehmen und Staat verändert.",
    actions: [
      ["Überblick lesen", "wirkungssteuerung/ueberblick/", "primary"],
      ["Scorecards verstehen", "wirkungssteuerung/scorecards/", "secondary"],
      ["Wirkungsfelder öffnen", "wirkungsfelder/", "secondary"],
    ],
    content: `
      <section class="section section-soft">
        <div class="section-header">
          <p class="hero-kicker">Kernlogik</p>
          <h2>Wirkung statt Kapital als blinder Maßstab.</h2>
          <p>Kapital bleibt Werkzeug. Markt bleibt. Aber die entscheidende Frage wird erweitert: Welche Wirkung erzeugt Kapital - für Mensch, Planet und Demokratie - und wie wird diese Wirkung rückgekoppelt?</p>
        </div>
        ${contextSearch(base, "z. B. Wirkungssteuer, Produktpreis, Rente, Kapital, Beschaffung", "wirkungssteuerung")}
        ${cardGrid(base, cards)}
      </section>
      <section class="section">
        <div class="card">
          <p class="card-kicker">Beispiele</p>
          <h2 class="card-title">Alltagsnah prüfen, dann systemisch steuern.</h2>
          <p class="card-text">Apfel, T-Shirt, Haferdrink und Kuhmilch, BASF Polyamid, Wohnen, Pflegearbeit oder fossile Geschäftsmodelle werden nicht moralisch sortiert. Sie werden danach gelesen, welche Netto-Wirkung sie erzeugen und welche Anreize daraus folgen.</p>
          <div class="portal-card-actions">${linkList(base, [
            ["Apfelbeispiel", "wirkungsfelder/produkte-konsum/apfelbeispiel-produktwirkungsrechnung/"],
            ["Produkte & Konsum", "wirkungsfelder/produkte-konsum/"],
            ["Arbeit & Einkommen", "wirkungsfelder/arbeit-einkommen/"],
          ])}</div>
        </div>
      </section>
`,
  });
}

function renderSteuerungDetail(slug, title, text) {
  const base = "../../";
  return shell({
    base,
    route: `wirkungssteuerung/${slug}/`,
    title: `${title} | Wirkungssteuerung`,
    description: `${title} als Baustein der Wirkungssteuerung: ${text}`,
    kicker: "Wirkungssteuerung",
    h1: title,
    subtitle: text,
    actions: [
      ["Wirkungssteuerung", "wirkungssteuerung/", "primary"],
      ["Wirkungsfelder", "wirkungsfelder/", "secondary"],
      ["Bibliothek", "bibliothek/", "secondary"],
    ],
    content: `
      <section class="section section-soft">
        <div class="section-header">
          <p class="hero-kicker">Einordnung</p>
          <h2>Was wird hier rückgekoppelt?</h2>
          <p>Dieser Baustein gehört zur Wirkungssteuerung. Er verbindet Wirkungspotenzial, Wirkmechanismus, Wirkungsbewertung und mögliche Wirkungslenkung mit realen Entscheidungsräumen.</p>
        </div>
        ${cardGrid(base, [
          {
            kicker: "Ausgangspunkt",
            title: "Der alte Maßstab bleibt zu eng.",
            text: "Geld, Output, Rendite oder Rechtskonformität zeigen nicht automatisch, ob Mensch, Planet und Demokratie gestärkt oder geschädigt werden.",
          },
          {
            kicker: "WÖk-Verschiebung",
            title: "Wirkung wird entscheidungsrelevant.",
            text: "Bewertete Wirkung muss in Preise, Steuern, Kapitalzugang, Beschaffung, Produktgestaltung, Einkommen oder öffentliche Haushalte zurückfließen.",
          },
          {
            kicker: "Schutzlinie",
            title: "Keine automatische Personenbewertung.",
            text: "Bewertet werden Wirkungen von Produkten, Regeln, Organisationen, Investitionen und Systemen - nicht Menschen als moralische Rangliste.",
          },
          {
            kicker: "Anschluss",
            title: "Pilotierbar, prüfbar, kritisierbar.",
            text: "Der Baustein bleibt anschlussfähig für Wissenschaft, Politik, Verwaltung, Unternehmen, Finanzsystem, Bildung und öffentliche Kritik.",
          },
        ])}
      </section>
      <section class="section">
        <div class="card">
          <p class="card-kicker">Nächster Schritt</p>
          <h2 class="card-title">Vom Begriff zur Anwendung.</h2>
          <p class="card-text">Nutze diesen Baustein als Einstieg. Vertiefung liegt in Glossar, Bibliothek, Wirkungsfeldern, Werkzeugen und passenden Dossiers.</p>
          <div class="portal-card-actions">${linkList(base, [
            ["Glossar", "begriffe/"],
            ["Werkzeuge", "werkzeuge/"],
            ["Bibliothek", "bibliothek/"],
          ])}</div>
        </div>
      </section>
`,
  });
}

function renderFuerWenAlias() {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="robots" content="noindex, follow">
    <meta http-equiv="refresh" content="0; url=/fuer/">
    <link rel="canonical" href="${SITE}/fuer/">
    <title>Weiterleitung - Für wen?</title>
    <script>window.location.replace("/fuer/");</script>
  </head>
  <body><main><h1>Weiterleitung zu Für wen?</h1><p><a href="/fuer/">Weiter zu Für wen?</a></p></main></body>
</html>
`;
}

function markerBlock(name, html) {
  return `<!-- ${name}:start -->\n${html.trim()}\n<!-- ${name}:end -->`;
}

function replaceMarkedBlock(relativePath, name, html, insertionNeedle) {
  const filePath = path.join(ROOT, relativePath);
  let text = fs.readFileSync(filePath, "utf8");
  const block = markerBlock(name, html);
  const pattern = new RegExp(`\\n?<!-- ${name}:start -->[\\s\\S]*?<!-- ${name}:end -->\\n?`, "g");
  text = text.replace(pattern, "\n");
  if (!text.includes(insertionNeedle)) {
    console.warn(`needle not found in ${relativePath}: ${insertionNeedle}`);
    return;
  }
  text = text.replace(insertionNeedle, `${block}\n${insertionNeedle}`);
  fs.writeFileSync(filePath, text, "utf8");
  console.log(`updated ${relativePath}`);
}

function updateStartPage() {
  const block = `
<section class="section section-soft" id="wirkungslogik-2-1" aria-labelledby="wirkungslogik-2-1-title">
  <div class="section-header">
    <p class="hero-kicker">Orientierung 2.1</p>
    <h2 id="wirkungslogik-2-1-title">Die Website folgt einer klaren Bewegungslogik.</h2>
    <p>Die Wirkungsökonomie ist nicht zuerst ein Debattentool. Sie ist ein Ordnungsmodell: Wirkung sichtbar machen, bewerten und in Preise, Steuern, Einkommen, Kapital, Produkte, Unternehmen, Staat und Alltag zurückführen.</p>
  </div>
  <div class="card-grid two">
    <article class="card"><p class="card-kicker">1 · Verstehen</p><h3 class="card-title">Was verändert sich wirklich?</h3><p class="card-text">Alltag zuerst: Apfel, T-Shirt, Pflege, Wohnen, Medien, Kapital oder Haushalt. Dann erst Begriffe und Methode.</p><div class="portal-card-actions"><a class="text-link" href="verstehen/">Verstehen öffnen</a></div></article>
    <article class="card"><p class="card-kicker">2 · Wirkungsfelder</p><h3 class="card-title">Wo wirkt es?</h3><p class="card-text">Neun Suchräume ordnen Mensch, Planet, Wirtschaft, Arbeit, Wohnen, Staat, Öffentlichkeit, Wissen und Kapital.</p><div class="portal-card-actions"><a class="text-link" href="wirkungsfelder/">Wirkungsfelder öffnen</a></div></article>
    <article class="card"><p class="card-kicker">3 · Wirkungssteuerung</p><h3 class="card-title">Wie wird Wirkung zurückgekoppelt?</h3><p class="card-text">Wirkungssteuer, Produktpreise, Scorecards, WÖk-IDs, Haushalt, Rente, Einkommen, Kapital und Beschaffung.</p><div class="portal-card-actions"><a class="text-link" href="wirkungssteuerung/">Wirkungssteuerung öffnen</a></div></article>
    <article class="card"><p class="card-kicker">4 · Anschluss finden</p><h3 class="card-title">Wer kann daran weiterarbeiten?</h3><p class="card-text">Wissenschaft, Politik, Verwaltung, Unternehmen, Kapital, Bildung, Medien, Zivilgesellschaft, Standards, Daten und Kritik.</p><div class="portal-card-actions"><a class="text-link" href="bibliothek/#anschluss-finden">Anschlussräume ansehen</a></div></article>
  </div>
</section>
`;
  replaceMarkedBlock("index.html", "architecture-v21-home", block, '<section class="section section-soft maiwald-explainer" data-maiwald-explainer>');
}

function updateBibliothek() {
  const base = "../";
  const block = `
<section class="section section-soft" id="anschluss-finden" aria-labelledby="anschluss-finden-title">
  <div class="section-header">
    <p class="hero-kicker">Anschluss finden</p>
    <h2 id="anschluss-finden-title">Die Bibliothek ist nicht Ablage, sondern Anschlussarchitektur.</h2>
    <p>Jeder Inhalt soll künftig nach Thema, Zielgruppe, Dokumenttyp und Anschlussraum auffindbar sein. Der erste Schritt ist diese Orientierung über die wichtigsten Anschlussräume.</p>
  </div>
  ${contextSearch(base, "z. B. Wissenschaft, Verwaltung, Kapital, Pilotierung, Schutzlinien", "bibliothek")}
  <div class="document-chip-row">
    ${anschlussraeume.map((raum) => `<a class="chip" href="../suche.html?q=${encodeURIComponent(raum)}">${esc(raum)}</a>`).join("\n    ")}
  </div>
</section>
`;
  replaceMarkedBlock("bibliothek/index.html", "architecture-v21-library-anschluss", block, '<section class="section section-muted">');
}

function updateArchitectureRegistry() {
  writeJson("assets/data/website-architecture-v21.json", {
    version: "2.1",
    guidingPrinciple: "Wirkung statt Kapital: Wirkung auf Mensch, Planet und Demokratie sichtbar machen, bewerten und in Entscheidungen zurückkoppeln.",
    navigation: {
      main: header.map((item) => item.label),
      utilities: utilities.map((item) => item.label),
    },
    wirkungsfelder: wirkungsfelder.map((field) => ({ title: field.title, description: field.text })),
    wirkungssteuerung: steuerungPages.map(([slug, title, description]) => ({ slug, title, description })),
    anschlussraeume,
    editorialRules: [
      "Kein Inhalt wird gelöscht; alte URLs bleiben erreichbar oder werden über Alias/Redirect angeschlossen.",
      "Alltag vor Fachbegriff, Beispiel vor System, Orientierung vor Tiefe.",
      "Öffentlicher Wirkungsraum ist ein wichtiger Praxisbereich, aber nicht das Dach der gesamten Website.",
      "Bibliothek, Suche und Portale müssen Anschlussfähigkeit sichtbar machen.",
    ],
  });
}

function buildPages() {
  writeFile("verstehen/index.html", renderVerstehenPortal());
  writeFile("fuer-wen/index.html", renderFuerWenAlias());
  writeFile("lernen/index.html", renderLearningPortal());
  writeFile("wirkungsfelder/index.html", renderWirkungsfelderPage());
  writeFile("wirkungssteuerung/index.html", renderWirkungssteuerungPortal());
  for (const [slug, title, text] of steuerungPages) {
    writeFile(`wirkungssteuerung/${slug}/index.html`, renderSteuerungDetail(slug, title, text));
  }
}

updateNavigation();
updateArchitectureRegistry();
buildPages();
updateStartPage();
updateBibliothek();
