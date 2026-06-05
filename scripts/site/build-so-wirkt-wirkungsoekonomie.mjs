import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const BASE = "../";
const OUT = path.join(ROOT, "so-wirkt-wirkungsoekonomie/index.html");

const navigation = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data/navigation.json"), "utf8"));
const headerTemplate = fs.readFileSync(path.join(ROOT, "templates/header.html"), "utf8");
const footerTemplate = fs.readFileSync(path.join(ROOT, "templates/footer.html"), "utf8");

const meta = {
  title: "So wirkt die Wirkungsökonomie | Wirkung statt Kapital",
  pageTitle: "So wirkt die Wirkungsökonomie",
  description:
    "Die Wirkungsökonomie erklärt, wie aus Handlungen, Produkten, Sprache, Medien und politischen Entscheidungen tatsächliche Wirkung wird - und wie diese Wirkung in Preise, Regeln, Kapital und Entscheidungen zurückgekoppelt wird.",
  url: `${SITE}/so-wirkt-wirkungsoekonomie/`,
};

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function withBase(href) {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  return `${BASE}${href.replace(/^\/+/, "")}`;
}

function isActive(item) {
  const matches = item.match || [item.href];
  return matches.some((candidate) => candidate === "so-wirkt-wirkungsoekonomie/" || candidate === "so-wirkt-wirkungsoekonomie.html");
}

function renderNavItem(item) {
  const active = isActive(item);
  return `<a href="${esc(withBase(item.href))}"${active ? ' aria-current="page"' : ""}>${esc(item.label)}</a>`;
}

function renderHeader() {
  return headerTemplate
    .replaceAll("{{BASE}}", BASE)
    .replace("{{HEADER_NAV}}", navigation.header.map(renderNavItem).join("\n      "));
}

function renderFooterGroup(group) {
  return `<div class="footer-nav-group">
        <h3>${esc(group.title)}</h3>
        ${group.items.map((item) => `<a href="${esc(withBase(item.href))}">${esc(item.label)}</a>`).join("\n        ")}
      </div>`;
}

function renderFooter() {
  const legal = (navigation.footerLegal || [])
    .map((item) => `      <a href="${esc(withBase(item.href))}">${esc(item.label)}</a>`)
    .join("\n");
  return footerTemplate
    .replaceAll("{{BASE}}", BASE)
    .replace("{{FOOTER_NAV}}", navigation.footerGroups.map(renderFooterGroup).join("\n      "))
    .replace("{{FOOTER_LEGAL_NAV}}", legal);
}

function ImpactProcess(steps) {
  return `<div class="impact-process" aria-label="Wirkungsprozess">
      ${steps
        .map(
          (step, index) => `<article class="impact-process__step">
        <span class="impact-process__index">${String(index + 1).padStart(2, "0")}</span>
        <h3>${esc(step.title)}</h3>
        <p>${esc(step.text)}</p>
      </article>`
        )
        .join("\n      ")}
    </div>`;
}

function ExampleCards(examples) {
  return `<div class="example-cards">
      ${examples
        .map(
          (example) => `<article class="example-card">
        <p class="card-kicker">${esc(example.kicker)}</p>
        <h3>${esc(example.title)}</h3>
        <p>${esc(example.text)}</p>
        <a class="text-link" href="${esc(withBase(example.href))}">${esc(example.link)}</a>
      </article>`
        )
        .join("\n      ")}
    </div>`;
}

function MythRealityGrid(items) {
  return `<div class="myth-reality-grid">
      ${items
        .map(
          (item) => `<article class="myth-reality-card">
        <div>
          <p class="card-kicker">Missverständnis</p>
          <p>${esc(item.myth)}</p>
        </div>
        <div>
          <p class="card-kicker">Einordnung</p>
          <p>${esc(item.reality)}</p>
        </div>
      </article>`
        )
        .join("\n      ")}
    </div>`;
}

function DefinitionCard(items) {
  return `<div class="definition-card-grid">
      ${items
        .map(
          (item) => `<article class="definition-card">
        <h3>${esc(item.term)}</h3>
        <p>${esc(item.definition)}</p>
      </article>`
        )
        .join("\n      ")}
    </div>`;
}

function FeedbackLoop(items) {
  return `<ol class="feedback-loop">
      ${items
        .map(
          (item) => `<li>
        <span>${esc(item.label)}</span>
        <p>${esc(item.text)}</p>
      </li>`
        )
        .join("\n      ")}
    </ol>`;
}

const processSteps = [
  {
    title: "Ursache",
    text: "Eine Handlung, ein Produkt, eine Regel, ein Medium oder eine Investition setzt einen Wirkpfad in Gang.",
  },
  {
    title: "Wirkpfad",
    text: "Der Wirkpfad beschreibt, über welche materiellen, sozialen, institutionellen oder kommunikativen Zwischenschritte Zustände verändert werden können.",
  },
  {
    title: "Zustandsänderung",
    text: "Erst eine tatsächliche Veränderung von Zuständen ist Wirkung. Eine Absicht, ein Output oder Reichweite allein reicht nicht.",
  },
  {
    title: "Bewertung",
    text: "Positive Wirkung wird am Referenzrahmen SDGs, Agenda 2030 und SDG+ bewertet. Zielgröße ist positive Netto-Wirkung.",
  },
  {
    title: "Rückkopplung",
    text: "Bewertete Wirkung fließt in Preise, Regeln, Kapitalzugang, öffentliche Entscheidungen und Lernprozesse zurück.",
  },
];

const examples = [
  {
    kicker: "Politik",
    title: "Eine Entscheidung verändert Zustände",
    text: "Ein Gesetz wirkt nicht, weil es beschlossen wurde, sondern wenn sich Gesundheit, Teilhabe, Kosten, Freiheit, Vertrauen oder Umweltzustände tatsächlich verändern.",
    href: "fuer/politik.html",
    link: "Politik-Perspektive öffnen",
  },
  {
    kicker: "Produkte",
    title: "Preis und Wirkung werden entkoppelt sichtbar",
    text: "Ein Produkt kann billig sein und trotzdem hohe Folgekosten erzeugen. Die WÖk fragt, welche Netto-Wirkung entlang Herstellung, Nutzung und Entsorgung entsteht.",
    href: "wirkungsfelder/produkte-konsum/",
    link: "Produkte & Konsum ansehen",
  },
  {
    kicker: "Sprache",
    title: "Sprache hat Wirkungspotenzial",
    text: "Bei Sprache wird vorsichtig von Wirkungspotenzial, Resonanzraum und Wirkpfad gesprochen. Entscheidend ist, ob Kommunikation Zustände im öffentlichen Raum verändert.",
    href: "sdg-plus/medien-demokratie/wirkung-politischer-sprache.html",
    link: "Sprachwirkung vertiefen",
  },
  {
    kicker: "Medien",
    title: "Reichweite ist nicht Wirkung",
    text: "Eine hohe Reichweite zeigt Aufmerksamkeit. Wirkung entsteht erst, wenn sich Wissen, Vertrauen, Polarisierung, Beteiligung oder demokratische Qualität verändern.",
    href: "sdg-plus/medien-demokratie.html",
    link: "Medien & Demokratie öffnen",
  },
];

const myths = [
  {
    myth: "Die Wirkungsökonomie bewertet Menschen.",
    reality: "Nein. Sie bewertet Wirkungen von Handlungen, Regeln, Produkten, Organisationen und Systemen. Keine Personenbewertung, keine moralische Rangliste, kein Social Credit.",
  },
  {
    myth: "Die WÖk ist Planwirtschaft.",
    reality: "Nein. Sie erhält dezentrale Entscheidungen, ergänzt sie aber um Wirkungsdaten, Rückkopplung, Schutzgrenzen und demokratisch überprüfbare Regeln.",
  },
  {
    myth: "Die WÖk ist Sprachpolizei.",
    reality: "Nein. Bei Sprache und Medien geht es um Wirkungspotenzial, Resonanzräume und Wirkpfade, nicht um Gesinnungskontrolle oder verbotene Wörterlisten.",
  },
  {
    myth: "Reporting reicht aus.",
    reality: "Nein. Reporting macht sichtbar. Rückkopplung sorgt dafür, dass sichtbare Wirkung Preise, Regeln, Kapital, Beschaffung und Entscheidungen verändert.",
  },
];

const definitions = [
  {
    term: "Wirkung",
    definition: "Tatsächliche, beobachtbare Veränderung von Zuständen. Wirkung ist neutral und relational: Sie kann positiv, negativ, gemischt oder unklar sein.",
  },
  {
    term: "Wirkungspotenzial",
    definition: "Begründete Möglichkeit, dass ein Wirkpfad Zustände verändert. Potenzial ist noch keine gemessene Wirkung.",
  },
  {
    term: "Wirkungsrisiko",
    definition: "Risiko, dass Handlungen, Systeme oder Entscheidungen negative, unbeabsichtigte oder demokratisch problematische Zustandsänderungen auslösen.",
  },
  {
    term: "Positive Netto-Wirkung",
    definition: "Zielgröße der WÖk: positive Wirkung für Mensch, Planet und Demokratie nach Abzug negativer Wirkungen und nicht kompensierbarer Schäden.",
  },
  {
    term: "Wirkungslenkung",
    definition: "Demokratisch begründete Steuerung, die Wirkung in Preise, Regeln, Anreize, Kapital und öffentliche Entscheidungen zurückführt.",
  },
  {
    term: "Wirkungsarchitektur",
    definition: "Gesamtes Zusammenspiel aus Daten, Standards, Institutionen, Schutzgrenzen, Bewertungslogik, Rückkopplung und Kontrolle.",
  },
];

const feedbackItems = [
  {
    label: "Sichtbar machen",
    text: "Wirkungsdaten zeigen, welche Zustände sich verändern und wo nur Absicht, Aktivität oder Reichweite vorliegt.",
  },
  {
    label: "Bewerten",
    text: "Die Bewertung nutzt SDGs, Agenda 2030 und SDG+ und unterscheidet positive, negative, neutrale, unsichere und nicht kompensierbare Wirkung.",
  },
  {
    label: "Priorisieren",
    text: "Reverse Merit Order bedeutet: Schwere negative Wirkungen und Schutzgrenzen werden zuerst behandelt und nicht durch Vorteile an anderer Stelle schöngerechnet.",
  },
  {
    label: "Rückkoppeln",
    text: "Ergebnisse fließen in Preise, Steuern, Beschaffung, Kapitalzugang, Förderung, Standards, Weiterbildung und demokratische Entscheidungen zurück.",
  },
];

const body = `
  ${renderHeader()}
  <main data-pagefind-body class="so-woek-page">
    <section class="hero so-woek-hero">
      <div class="hero-copy">
        <p class="hero-kicker">Wirkungsökonomie verstehen</p>
        <h1>${esc(meta.pageTitle)}</h1>
        <p class="hero-subtitle">Die Wirkungsökonomie erklärt, wie aus Handlungen, Produkten, Sprache, Medien und politischen Entscheidungen tatsächliche Wirkung wird - und wie diese Wirkung in Preise, Regeln, Kapital und Entscheidungen zurückgekoppelt wird.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#wirkungsprozess">Wirkungsmodell ansehen</a>
          <a class="btn btn-secondary" href="${BASE}verstehen.html">Grundlagen öffnen</a>
        </div>
      </div>
      <aside class="hero-fact-panel" aria-label="Kernlogik">
        <p class="card-kicker">Kernformel</p>
        <p><strong>Wirkung ist nicht Absicht, Reichweite oder Kapital.</strong> Wirkung ist tatsächliche Veränderung von Zuständen.</p>
      </aside>
    </section>

    <section class="section">
      <div class="section-header">
        <p class="hero-kicker">Ausgangspunkt</p>
        <h2>Wirkungsblindheit macht gute und schlechte Folgen unsichtbar</h2>
        <p>Viele Systeme messen Umsatz, Kosten, Klicks, Stimmen, Rendite oder Veröffentlichungen. Sie sehen aber nur teilweise, ob sich Zustände für Mensch, Planet und Demokratie verbessern oder verschlechtern.</p>
      </div>
      <div class="card-grid three">
        <article class="card">
          <h3>Absicht ist keine Wirkung</h3>
          <p>Eine gute Absicht beschreibt ein Ziel. Wirkung entsteht erst, wenn sich ein Zustand tatsächlich verändert.</p>
        </article>
        <article class="card">
          <h3>Output ist keine Wirkung</h3>
          <p>Eine Broschüre, ein Gesetz, ein Produkt oder eine Plattform ist ein Ergebnis. Ob daraus Wirkung wird, entscheidet der Wirkpfad.</p>
        </article>
        <article class="card">
          <h3>Reichweite ist keine Wirkung</h3>
          <p>Reichweite zeigt Sichtbarkeit. Sie sagt noch nicht, ob Wissen, Vertrauen, Verhalten, Gesundheit oder demokratische Qualität verändert wurden.</p>
        </article>
      </div>
    </section>

    <section class="section section-muted" id="wirkungsprozess">
      <div class="section-header">
        <p class="hero-kicker">Modell</p>
        <h2>Vom Auslöser zur Rückkopplung</h2>
        <p>Das Wirkungsmodell trennt sauber zwischen Ursache, Wirkungspotenzial, tatsächlicher Wirkung, Bewertung und Rückkopplung. Dadurch wird sichtbar, was wir wissen, was nur plausibel ist und was noch geprüft werden muss.</p>
      </div>
      ${ImpactProcess(processSteps)}
    </section>

    <section class="section">
      <div class="section-header">
        <p class="hero-kicker">Analogie</p>
        <h2>Der Wirkstoff-Vergleich ist nur eine Analogie</h2>
        <p>Wie ein Wirkstoff nicht automatisch heilt, erzeugt auch eine Maßnahme nicht automatisch positive Wirkung. Entscheidend sind Kontext, Dosis, Nebenwirkungen, Wechselwirkungen, Evidenz und Rückkopplung.</p>
      </div>
      <div class="table-wrap so-woek-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Medizinische Analogie</th>
              <th>WÖk-Übertragung</th>
              <th>Grenze der Analogie</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Wirkstoff</td>
              <td>Maßnahme, Produkt, Regel oder Kommunikation mit Wirkungspotenzial</td>
              <td>Menschen, Gesellschaften und Demokratien sind keine Laborobjekte.</td>
            </tr>
            <tr>
              <td>Dosis</td>
              <td>Intensität, Reichweite, Dauer, Zielgruppe und Kontext</td>
              <td>Mehr Reichweite bedeutet nicht automatisch mehr positive Wirkung.</td>
            </tr>
            <tr>
              <td>Nebenwirkung</td>
              <td>Wirkungsrisiko, Zielkonflikt, Verdrängung oder demokratische Folgekosten</td>
              <td>Nicht kompensierbare Schäden dürfen nicht schöngerechnet werden.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="section section-muted">
      <div class="section-header">
        <p class="hero-kicker">Beispiele</p>
        <h2>Vier typische Wirkpfade</h2>
        <p>Die Beispiele zeigen, wie die gleiche Grundlogik in Politik, Produkten, Sprache und Medien angewendet wird, ohne Wirkung mit Absicht, Output oder Reichweite zu verwechseln.</p>
      </div>
      ${ExampleCards(examples)}
    </section>

    <section class="section">
      <div class="section-header">
        <p class="hero-kicker">Steuerungslogik</p>
        <h2>Von Reporting zu Rückkopplung</h2>
        <p>Reporting beschreibt Zustände. Die Wirkungsökonomie geht einen Schritt weiter: Bewertete Wirkung soll entscheidungsrelevant werden - in Preisen, Regeln, öffentlicher Beschaffung, Kapitalzugang und demokratischer Priorisierung.</p>
      </div>
      ${FeedbackLoop(feedbackItems)}
      <div class="principle-callout">
        <h3>Nichtkompensation und Reverse Merit Order</h3>
        <p>Positive Effekte dürfen schwere negative Wirkungen nicht pauschal ausgleichen. Die Reverse Merit Order priorisiert Schutzgrenzen, Grundrechte, demokratische Stabilität und irreversible Schäden, bevor Optimierung oder Effizienzgewinne verrechnet werden.</p>
      </div>
    </section>

    <section class="section section-muted">
      <div class="section-header">
        <p class="hero-kicker">Abgrenzung</p>
        <h2>Was die WÖk nicht ist</h2>
        <p>Die Wirkungsökonomie ist eine Bewertungs- und Rückkopplungsarchitektur. Sie ersetzt keine Demokratie und bewertet keine Menschen.</p>
      </div>
      ${MythRealityGrid(myths)}
    </section>

    <section class="section">
      <div class="section-header">
        <p class="hero-kicker">Mini-Glossar</p>
        <h2>Zentrale Begriffe sauber getrennt</h2>
        <p>Diese Begriffe werden oft vermischt. Die Trennung ist wichtig, damit die WÖk präzise bleibt.</p>
      </div>
      ${DefinitionCard(definitions)}
    </section>

    <section class="section section-muted">
      <div class="community-cta">
        <p class="hero-kicker">Weiterarbeiten</p>
        <h2>Von der Erklärung in die Anwendung</h2>
        <p>Wer die Grundlogik kennt, kann konkrete Wirkungsfelder, Werkzeuge und Demos gezielter lesen: Wirkung sichtbar machen, bewerten und demokratisch rückkoppeln.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${BASE}wirkungsfelder/">Wirkungsfelder öffnen</a>
          <a class="btn btn-secondary" href="${BASE}werkzeuge/">Werkzeuge ansehen</a>
          <a class="btn btn-secondary" href="${BASE}begriffe/">Glossar öffnen</a>
        </div>
      </div>
    </section>
  </main>
  ${renderFooter()}
  <script src="${BASE}assets/js/main.js?v=20260605-wirkungsraum-stage7" defer></script>
  <script src="${BASE}assets/js/search.js" defer></script>
`;

const html = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(meta.title)}</title>
    <meta name="description" content="${esc(meta.description)}">
    <meta name="search_title" content="${esc(meta.pageTitle)}">
    <meta name="search_description" content="${esc(meta.description)}">
    <meta name="search_section" content="Verstehen">
    <meta name="search_type" content="Erklärseite">
    <meta name="search_tags" content="Wirkung, Wirkungsökonomie, Wirkungspotenzial, Wirkungsrisiko, Netto-Wirkung, Rückkopplung, SDG+, Reverse Merit Order, Reporting">
    <link rel="canonical" href="${esc(meta.url)}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(meta.pageTitle)}">
    <meta property="og:description" content="${esc(meta.description)}">
    <meta property="og:url" content="${esc(meta.url)}">
    <link rel="icon" href="${BASE}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${BASE}assets/css/style.css?v=20260605-wirkungsraum-stage7">
  </head>
  <body>
${body}
  </body>
</html>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html, "utf8");
console.log(`Built ${path.relative(ROOT, OUT)}`);
