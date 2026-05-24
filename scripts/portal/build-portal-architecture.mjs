import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-05-24";
const CSS_VERSION = "20260524-portal-architecture";
const JS_VERSION = "20260523-nachhaltigkeit";
const SCHOOL_DOC = "public/downloads/originals/wirkungsoekonomisches_schulkonzept_arbeitsfassung_v0_1.docx";

function routeFor(rel) {
  return rel.endsWith("/index.html") ? `/${rel.slice(0, -"/index.html".length)}/` : `/${rel}`;
}

function baseFor(rel) {
  const depth = path.dirname(rel).split("/").filter(Boolean).length;
  return "../".repeat(depth);
}

function href(base, target) {
  if (!target) return "";
  if (/^(https?:|mailto:|#)/.test(target)) return target;
  return `${base}${target.replace(/^\/+/, "")}`;
}

function placeholderHeader(base) {
  return `<header class="site-header">
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon" aria-hidden="true">☰</span>
        <span class="sr-only">Menü</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation">
        <a href="${base}index.html">Start</a>
      </nav>
    </header>`;
}

function page({ rel, title, description, searchSection, searchType = "Portal", body }) {
  const route = routeFor(rel);
  const base = baseFor(rel);
  const canonical = `${SITE}${route}`;
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const html = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="search_title" content="${title.replace(/\s+\|.*$/, "")}">
    <meta name="search_description" content="${description}">
    <meta name="search_section" content="${searchSection}">
    <meta name="search_type" content="${searchType}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${title.replace(/\s+\|.*$/, "")}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${SITE}/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title.replace(/\s+\|.*$/, "")}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${SITE}/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${CSS_VERSION}">
  </head>
  <body>
    ${placeholderHeader(base)}
    <main>
      <p class="print-meta">Wirkungsökonomie · ${title.replace(/\s+\|.*$/, "")} · ${canonical} · Druckdatum: 24.05.2026</p>
${body(base, route)}
    </main>
    <script src="${base}assets/js/main.js?v=${JS_VERSION}"></script>
  </body>
</html>
`;
  fs.writeFileSync(out, html, "utf8");
  return rel;
}

function printActions(base, secondary = "") {
  return `<div class="hero-actions no-print">
              <button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>
              ${secondary}
            </div>`;
}

function linkList(base, items) {
  return `<div class="model-strip">${items
    .map((item) => `<a href="${href(base, item.href)}">${item.label}</a>`)
    .join("")}</div>`;
}

function sdgBlock(base, { sdgs, plus, explanation }) {
  return `<section class="section" aria-labelledby="sdg-title">
        <div class="portal-reference-block">
          <p class="hero-kicker">Referenzrahmen</p>
          <h2 id="sdg-title">SDG-/SDG+-Bezug</h2>
          <h3>Relevante SDGs</h3>
          <div class="model-strip">${sdgs.map((item) => `<span>${item}</span>`).join("")}</div>
          <h3>Relevante SDG+-Dimensionen</h3>
          <div class="model-strip">${plus.map((item) => `<span>${item}</span>`).join("")}</div>
          <p>${explanation}</p>
          <p>SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie für Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, institutionelles Vertrauen, gesellschaftlichen Zusammenhalt und digitale Selbstbestimmung.</p>
        </div>
      </section>`;
}

function bookAnchorBlock(base, anchors) {
  return `<section class="section" aria-labelledby="book-anchors">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Online-Buch</p>
            <h2 id="book-anchors">Anker im Online-Buch</h2>
            <p>Die präzisen Kapitelanker können weiter verfeinert werden. Bis dahin führen die Links auf vorhandene Referenzkapitel oder auf die Buch-Hauptseite.</p>
          </div>
          ${linkList(base, anchors)}
        </div>
      </section>`;
}

function exportBlock(base, pdfHref = "") {
  const dossier = pdfHref
    ? `<a class="btn btn-secondary" href="${href(base, pdfHref)}">Dossier herunterladen</a>`
    : `<p class="card-text">Dossier in Vorbereitung</p>`;
  return `<section class="section" aria-labelledby="export-title">
        <div class="card">
          <p class="hero-kicker">Dossier & Export</p>
          <h2 id="export-title">Seite sichern oder weitergeben</h2>
          <p class="card-text">Diese Seite kann direkt gedruckt werden. Ein eigenes Dossier wird verlinkt, sobald eine geprüfte PDF-Fassung vorliegt.</p>
          <div class="portal-card-actions no-print">
            <button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>
            ${dossier}
          </div>
        </div>
      </section>`;
}

function cardGrid(base, items, cols = "three") {
  return `<div class="card-grid ${cols}">
${items
  .map(
    (item) => `            <article class="card">
              ${item.kicker ? `<p class="card-kicker">${item.kicker}</p>` : ""}
              <h3 class="card-title">${item.title}</h3>
              <p class="card-text">${item.text}</p>
              ${
                item.href
                  ? `<div class="portal-card-actions"><a class="text-link" href="${href(base, item.href)}">${item.linkLabel || "Öffnen"}</a></div>`
                  : ""
              }
            </article>`,
  )
  .join("\n")}
          </div>`;
}

const sdgPlusDefault = [
  "Demokratie",
  "Medienqualität",
  "Rechtsstaatlichkeit",
  "Diskursfähigkeit",
  "institutionelles Vertrauen",
  "digitale Selbstbestimmung",
];

const bookMain = { label: "Online-Buch Hauptseite", href: "referenz/" };

const fields = [
  {
    slug: "bildung",
    title: "Bildung",
    pageTitle: "Bildung als Wirkungsinfrastruktur",
    subtitle: "Wie die Wirkungsökonomie Schule, Förderung, Fächer, Bewertung und Zukunftskompetenz neu denkt.",
    short:
      "Bildung als Wirkungsinfrastruktur: Schule, Fächer, Bewertung, Wirkungskompetenz, Fach Zukunft, Förderung und digitale Mündigkeit neu denken.",
    status: "ausgebaut / erster Schwerpunkt",
    question: "Welche Zustandsveränderungen erzeugt Bildung in Selbstwirksamkeit, Urteilskraft, Demokratie, Gesundheit, Teilhabe und Zukunftsfähigkeit?",
    sdgs: [
      "SDG 4 Hochwertige Bildung",
      "SDG 3 Gesundheit und Wohlergehen",
      "SDG 5 Geschlechtergleichstellung",
      "SDG 8 Menschenwürdige Arbeit",
      "SDG 10 Weniger Ungleichheiten",
      "SDG 11 Nachhaltige Städte und Gemeinden",
      "SDG 16 Frieden, Gerechtigkeit und starke Institutionen",
      "SDG 17 Partnerschaften",
    ],
    plus: ["Demokratie", "Medienqualität", "digitale Selbstbestimmung", "Diskursfähigkeit", "institutionelles Vertrauen"],
    concepts: [
      ["Die Wirkungsschule", "Ein wirkungsökonomisches Schulkonzept für Zukunft, Demokratie, Selbstwirksamkeit und Wirkungskompetenz.", "wirkungsfelder/bildung/wirkungsschule/"],
      ["Wirkungspädagogik", "Unterricht wird nicht nur als Stoffvermittlung verstanden, sondern als Gestaltung von Lernräumen, Beziehungen, Resonanz, Fragen, Projekten und Verantwortung."],
      ["Fächer neu denken", "Bestehende Fächer verschwinden nicht, sondern werden stärker vernetzt: Mathe, Deutsch, Geschichte, Naturwissenschaft, Ethik, Kunst, Wirtschaft und Informatik werden als Wirkungsräume lesbar."],
      ["Fach Zukunft", "Ein verbindendes Lernfeld für Systemdenken, Mensch, Planet, Demokratie, Risiko, Wirtschaft und Wirkung, Kommunikation, Resonanz, Projekt und Teilgabe."],
      ["Bewertung, Noten und Portfolios", "Noten werden nicht einfach abgeschafft, aber ergänzt: durch Entwicklungsportfolios, Kompetenznachweise, Selbstreflexion, Projektwirkung und Lernfortschritt."],
      ["Wirkungsförderung", "Förderung darf nicht erst beginnen, wenn Kinder scheitern. Sie stärkt Potenziale, verhindert Lernabbrüche und verbindet schulische und außerschulische Unterstützung."],
      ["Digitale Mündigkeit", "Digitale Bildung bedeutet nicht nur Geräteausstattung, sondern Urteilskraft über Daten, Plattformen, KI, Manipulation, Aufmerksamkeit und digitale Selbstbestimmung."],
      ["Demokratiekompetenz", "Demokratie wird nicht nur erklärt, sondern praktiziert: Streitfähigkeit, Minderheitenschutz, Medienkompetenz, Beteiligung, Verantwortung und Rechtsstaatlichkeit."],
      ["Schule als Wirkungsraum", "Gebäude, Zeitstruktur, Beziehung, Ernährung, Bewegung, Beteiligung, Ruhe, Sicherheit und Inklusion wirken auf Lernen."],
      ["Pilotmodell", "Die Wirkungsschule kann als Modellprojekt, Schulprofil oder kommunales Bildungsnetzwerk erprobt werden."],
    ],
    actors: ["Schüler:innen", "Eltern", "Lehrkräfte", "Schulleitungen", "Kommunen", "Bildungspolitik", "Wissenschaft"],
    tools: [
      { label: "Wirkungsportfolio", href: "werkzeuge/wirkungsportfolio/" },
      { label: "Scorecards", href: "werkzeuge/scorecards/" },
      { label: "WÖk-IDs", href: "werkzeuge/woek-ids/" },
      { label: "Wirkungshaushalt", href: "werkzeuge/wirkungshaushalt/" },
    ],
    demos: [
      { label: "WÖk-Kompass", href: "kompass.html" },
      { label: "Wirkungsscanner", href: "anwendungen/scanner.html" },
    ],
    docs: [
      { label: "Konzeptpapier Wirkungsschule", href: SCHOOL_DOC },
      { label: "Arbeitsbibliothek Bildung", href: "werkstatt/arbeitsbibliothek/wirkungsfelder/bildung/" },
      { label: "Handbuch Wirkungskompetenz", href: "assets/pdf/handbuch-wirkungskompetenz.pdf" },
    ],
    anchors: [
      { label: "Bildung als Wirkungsinfrastruktur", href: "referenz/kapitel-067-bildung/" },
      { label: "Wirkungskompetenz", href: "begriffe/wirkungskompetenz/" },
      { label: "Fach Zukunft", href: "referenz/kapitel-067-bildung/" },
      { label: "Wirkungsgeschichte", href: "referenz/kapitel-067-bildung/" },
      { label: "Digitale Mündigkeit", href: "referenz/teil-13-digitalisierung-ki-und-wirkungsdatenraeume/" },
      { label: "Bildung als Netzwerk", href: "referenz/kapitel-067-bildung/" },
      { label: "Von Noten zu Wirkungskompetenzen", href: "referenz/kapitel-067-bildung/" },
      { label: "Bildungszeit", href: "referenz/kapitel-067-bildung/" },
      { label: "Wirkungsportfolio / Bewertung", href: "werkzeuge/wirkungsportfolio/" },
      { label: "Wirkungsschule als Modell", href: "wirkungsfelder/bildung/wirkungsschule/" },
    ],
  },
  {
    slug: "gesundheit-pflege",
    title: "Gesundheit & Pflege",
    short: "Vom System, das Krankheit finanziert, zu einem System, das Gesundheit, Prävention, Pflege, Resilienz und Teilhabe erzeugt.",
    status: "Grundstruktur vorhanden",
    question: "Welche Zustandsveränderungen entstehen in Gesundheit, Prävention, Pflegequalität, Teilhabe und Würde?",
    sdgs: ["SDG 3 Gesundheit und Wohlergehen", "SDG 5 Geschlechtergleichstellung", "SDG 10 Weniger Ungleichheiten", "SDG 16 Starke Institutionen"],
    concepts: ["Prävention als Investition", "Pflege als Systemleistung", "Gesundheitsresilienz", "Teilhabe und Würde"],
    actors: ["Patient:innen", "Pflegende", "Träger", "Kommunen", "Gesundheitspolitik"],
    docs: [{ label: "Kapitel Gesundheit", href: "referenz/kapitel-068-gesundheit/" }, { label: "Kapitel Pflege", href: "referenz/kapitel-069-pflege/" }],
    anchors: [{ label: "Gesundheit", href: "referenz/kapitel-068-gesundheit/" }, { label: "Pflege", href: "referenz/kapitel-069-pflege/" }, bookMain],
  },
  {
    slug: "wohnen-stadt",
    title: "Wohnen & Stadt",
    short: "Wohnen als Wirkungsraum: Bezahlbarkeit, Sicherheit, Gesundheit, Energie, Quartier, Boden und demokratische Teilhabe.",
    status: "Working Paper vorhanden",
    question: "Wie wirken Wohnkosten, Boden, Gebäude, Energie und Quartiere auf Sicherheit, Gesundheit, Teilhabe und Demokratie?",
    sdgs: ["SDG 3 Gesundheit", "SDG 7 Bezahlbare und saubere Energie", "SDG 10 Weniger Ungleichheiten", "SDG 11 Nachhaltige Städte"],
    concepts: ["Bezahlbarkeit", "Quartier als Wirkungsraum", "Sanierung und Mieten", "Boden und Gemeinwohl"],
    actors: ["Mieter:innen", "Eigentümer:innen", "Kommunen", "Wohnungswirtschaft", "Politik"],
    docs: [{ label: "Working Paper Wohnungsmarkt", href: "assets/pdf/working-paper-wohnungsmarkt.pdf" }, { label: "Dossier Wohnen", href: "blog/dossiers/wohnen.html" }],
    anchors: [{ label: "Wohnen", href: "referenz/kapitel-070-wohnen/" }, { label: "Soziales als Investition in Wirkung", href: "referenz/teil-11-gesellschaftliche-grundsysteme/" }, bookMain],
  },
  {
    slug: "arbeit-einkommen",
    title: "Arbeit & Einkommen",
    short: "Leistung, Einkommen, Automatisierung und Sinn neu denken, wenn Wirkung wichtiger wird als reine Erwerbslogik.",
    status: "Konzept vorhanden",
    question: "Welche Arbeit stabilisiert Menschen, Systeme und Zukunft, auch wenn sie heute nicht angemessen bezahlt oder sichtbar wird?",
    sdgs: ["SDG 1 Keine Armut", "SDG 5 Geschlechtergleichstellung", "SDG 8 Menschenwürdige Arbeit", "SDG 10 Weniger Ungleichheiten"],
    concepts: ["Wirkleistung", "Automatisierung", "Care und Sorgearbeit", "Wirkungseinkommen"],
    actors: ["Bürger:innen", "Arbeitgeber", "Sozialversicherung", "Gewerkschaften", "Politik"],
    docs: [{ label: "Wenn Maschinen arbeiten", href: "assets/pdf/wenn-maschinen-arbeiten.pdf" }, { label: "Whitepaper Wirkungseinkommen", href: "assets/pdf/whitepaper-wirkungseinkommen.pdf" }],
    anchors: [{ label: "Arbeit, Automatisierung und Maschinenleistung", href: "referenz/kapitel-056-arbeit-automatisierung-und-maschinenleistung/" }, { label: "Wirkungseinkommen", href: "referenz/kapitel-057-wirkungseinkommen/" }, bookMain],
  },
  {
    slug: "rente-soziale-sicherung",
    title: "Rente & soziale Sicherung",
    short: "Lebensleistung, Care, Bildung, Pflege und Generationenvertrag als Wirkungsfragen statt nur Beitragsbiografie.",
    status: "Working Paper vorhanden",
    question: "Welche Lebensleistung bleibt im heutigen Sicherungssystem unsichtbar, obwohl sie gesellschaftliche Stabilität erzeugt?",
    sdgs: ["SDG 1 Keine Armut", "SDG 3 Gesundheit", "SDG 5 Geschlechtergleichstellung", "SDG 10 Weniger Ungleichheiten"],
    concepts: ["Wirkungsrente", "Generationenvertrag", "Care-Biografien", "Soziale Resilienz"],
    actors: ["Versicherte", "Rentner:innen", "Care-Arbeitende", "Sozialpolitik", "Kommunen"],
    docs: [{ label: "Wirkungsrente Arbeitspapier", href: "docs/soziales/Wirkungsrente_v1.1_Generationenvertrag.md" }, { label: "Kapitel Wirkungsrente", href: "referenz/kapitel-058-wirkungsrente/" }],
    anchors: [{ label: "Wirkungsrente", href: "referenz/kapitel-058-wirkungsrente/" }, { label: "Zeit, Endlichkeit und Generationenverantwortung", href: "referenz/kapitel-029-zeit-endlichkeit-und-generationenverantwortung/" }, bookMain],
  },
  {
    slug: "wirtschaft-unternehmen",
    title: "Wirtschaft & Unternehmen",
    short: "Unternehmen als Wirkungssysteme: Führung, Strategie, Lieferketten, Impact Controlling, Kultur, Risiko und Transformation.",
    status: "Konzept vorhanden",
    question: "Wie werden Geschäftsmodelle, Lieferketten, Kapital und Führung nach positiver Netto-Wirkung entscheidungsrelevant?",
    sdgs: ["SDG 8 Menschenwürdige Arbeit", "SDG 9 Innovation", "SDG 12 Nachhaltige Produktion", "SDG 13 Klimaschutz", "SDG 16 Institutionen"],
    concepts: ["Unternehmen als Wirkungssystem", "Impact Controlling", "Lieferkettensteuerung", "Kultur und Verantwortung"],
    actors: ["Unternehmen", "Investor:innen", "Beschaffung", "Mitarbeitende", "Regulierung"],
    docs: [{ label: "Unternehmen als Wirkungssysteme", href: "referenz/kapitel-042-unternehmen-als-wirkungssysteme/" }, { label: "Whitepaper T-SROI", href: "dokumente/whitepaper-t-sroi/" }],
    anchors: [{ label: "Unternehmen als Wirkungssysteme", href: "referenz/kapitel-042-unternehmen-als-wirkungssysteme/" }, { label: "Wirkungsorientierte Unternehmensführung", href: "referenz/kapitel-043-wirkungsorientierte-unternehmensfuehrung/" }, { label: "Wirkungscontrolling im Unternehmen", href: "referenz/kapitel-044-wirkungscontrolling-im-unternehmen/" }],
  },
  {
    slug: "produkte-konsum",
    title: "Produkte & Konsum",
    short: "Produkte als Wirkungsträger: ehrliche Preise, Scorecards, Produktpässe, Lieferketten und Wirkungssteuer.",
    status: "Konzept vorhanden",
    question: "Welche positiven, negativen und neutralen Zustandsveränderungen entstehen entlang Produkt, Nutzung, Lieferkette und Entsorgung?",
    sdgs: ["SDG 3 Gesundheit", "SDG 6 Wasser", "SDG 8 Arbeit", "SDG 12 Konsum und Produktion", "SDG 13 Klima"],
    concepts: ["Produkte als Wirkungsträger", "Ehrliche Preise", "Produktscorecards", "Digitale Produktpässe"],
    actors: ["Verbraucher:innen", "Hersteller", "Handel", "Prüfstellen", "Politik"],
    demos: [{ label: "Produktwirkung erleben", href: "erleben.html#simulator" }, { label: "Scorecard-Demo", href: "scorecard-dashboard.html" }],
    docs: [{ label: "Working Paper Produktbesteuerung", href: "assets/pdf/working-paper-produktbesteuerung-durch-wirkung.pdf" }, { label: "Apfelbeispiel", href: "dokumente/beispiel-apfel-wirkungssteuer-bonusregel/" }],
    anchors: [{ label: "Produkte als Wirkungsträger", href: "referenz/kapitel-048-produkte-als-wirkungstraeger/" }, { label: "Ehrliche Preise", href: "referenz/kapitel-049-ehrliche-preise/" }, { label: "Produktscorecards", href: "referenz/kapitel-050-produktscorecards/" }, { label: "Apfelbeispiel", href: "referenz/kapitel-051-das-apfelbeispiel/" }],
  },
  {
    slug: "finanzsystem-kapital",
    title: "Finanzsystem & Kapital",
    short: "Kapital als Wirkungskraft statt Selbstzweck: Risiko, Rendite, Fonds, Versicherbarkeit, Investitionswirkung und Transformation.",
    status: "Grundstruktur vorhanden",
    question: "Wie wird Kapitalzugang davon abhängig, welche reale Transformationswirkung und Resilienz eine Investition erzeugt?",
    sdgs: ["SDG 8 Arbeit und Wachstum", "SDG 9 Innovation", "SDG 10 Weniger Ungleichheiten", "SDG 13 Klimaschutz", "SDG 17 Partnerschaften"],
    concepts: ["Kapital als Werkzeug", "T-SROI", "Transformationsrisiko", "Versicherbarkeit"],
    actors: ["Investor:innen", "Banken", "Versicherungen", "Unternehmen", "Regulierung"],
    docs: [{ label: "T-SROI Whitepaper", href: "dokumente/whitepaper-t-sroi/" }, { label: "Kapitalmärkte und Fonds", href: "referenz/kapitel-059-kapitalmaerkte-und-fonds/" }],
    anchors: [{ label: "Kapital als Werkzeug und falscher Kompass", href: "referenz/kapitel-003-kapital-als-werkzeug-und-falscher-kompass/" }, { label: "Kapitalmärkte und Fonds", href: "referenz/kapitel-059-kapitalmaerkte-und-fonds/" }, bookMain],
  },
  {
    slug: "staat-recht-demokratie",
    title: "Staat, Recht & Demokratie",
    short: "Der Staat als Wirkungsarchitektur: Recht, Steuern, Haushalt, Wirkungsrat, Demokratie, Rechtsstaatlichkeit und öffentliche Verantwortung.",
    status: "Konzept vorhanden",
    question: "Welche Regeln, Haushalte und Institutionen machen positive Netto-Wirkung für Mensch, Planet und Demokratie verbindlich?",
    sdgs: ["SDG 10 Weniger Ungleichheiten", "SDG 16 Frieden, Gerechtigkeit und starke Institutionen", "SDG 17 Partnerschaften"],
    concepts: ["Wirkung als Rechtsprinzip", "Wirkungssteuergesetz", "Wirkungshaushalt", "Wirkungsrat"],
    actors: ["Bürger:innen", "Verwaltung", "Parlamente", "Justiz", "Wirkungsrat"],
    docs: [{ label: "Wirkungssteuergesetz", href: "assets/pdf/wirkungssteuergesetz-wstg-oktober-2025.pdf" }, { label: "Wirkungsrat Konzept", href: "dokumente/wirkungsrat-konzept/" }],
    anchors: [{ label: "Wirkung als Rechtsprinzip", href: "referenz/kapitel-036-wirkung-als-rechtsprinzip/" }, { label: "Wirkungssteuergesetz WStG", href: "referenz/kapitel-037-das-wirkungssteuergesetz-wstg/" }, { label: "Wirkungshaushalt", href: "referenz/kapitel-039-wirkungshaushalt-und-oeffentliche-mittel/" }, { label: "Wirkungsrat", href: "referenz/kapitel-040-der-wirkungsrat/" }],
  },
  {
    slug: "medien-oeffentlichkeit",
    title: "Medien & Öffentlichkeit",
    short: "Öffentlichkeit als Wirkungsraum: Wahrheit, Vertrauen, Diskursqualität, Plattformlogik, Desinformation und demokratische Resonanz.",
    status: "Grundstruktur vorhanden",
    question: "Wie wirken Sprache, Reichweite, Plattformen und Informationsarchitektur auf Vertrauen, Wahrheit und demokratische Korrekturfähigkeit?",
    sdgs: ["SDG 4 Bildung", "SDG 10 Weniger Ungleichheiten", "SDG 16 Starke Institutionen"],
    concepts: ["Öffentlichkeit als Wirkungsraum", "Medienqualität", "Plattformlogik", "Desinformation"],
    actors: ["Bürger:innen", "Journalismus", "Plattformen", "Politik", "Wissenschaft"],
    demos: [{ label: "Medienwirkung erleben", href: "erleben.html#medienwirkung" }, { label: "Wirkung politischer Sprache", href: "sdg-plus/medien-demokratie/wirkung-politischer-sprache.html" }],
    docs: [{ label: "Medien und Wirkung", href: "assets/pdf/medien-und-wirkung.pdf" }, { label: "Dossier Medien und Demokratie", href: "blog/dossiers/medien-demokratie.html" }],
    anchors: [{ label: "Öffentlichkeit als Wirkungsraum", href: "referenz/kapitel-074-oeffentlichkeit-als-wirkungsraum/" }, { label: "Plattformlogik und Algorithmen", href: "referenz/kapitel-075-plattformlogik-und-algorithmen/" }, { label: "Diskurskultur", href: "referenz/kapitel-079-diskurskultur/" }],
  },
  {
    slug: "wissenschaft-innovation-digitalisierung",
    title: "Wissenschaft, Innovation & Digitalisierung",
    short: "Wissen, Innovation, Datenräume, KI und Digitalisierung als Infrastruktur gesellschaftlicher Lernfähigkeit.",
    status: "Grundstruktur vorhanden",
    question: "Wie werden Wissen, KI, Datenräume und Innovation zu einer lernfähigen Infrastruktur statt zu blinder Beschleunigung?",
    sdgs: ["SDG 4 Bildung", "SDG 9 Innovation", "SDG 12 Produktion", "SDG 16 Institutionen", "SDG 17 Partnerschaften"],
    concepts: ["Wissenschaft als Wirkungsinfrastruktur", "Wirkungsdatenräume", "KI-Governance", "Innovationswirkung"],
    actors: ["Forschung", "Startups", "Verwaltung", "Unternehmen", "Zivilgesellschaft"],
    docs: [{ label: "Wirkungsdatenräume", href: "referenz/kapitel-081-wirkungsdatenraeume/" }, { label: "KI-Governance", href: "referenz/kapitel-082-ki-governance/" }],
    anchors: [{ label: "Digitalisierung als Infrastruktur", href: "referenz/kapitel-080-digitalisierung-als-infrastruktur-der-wirkungsoekonomie/" }, { label: "Wissenschaft als Wirkungsinfrastruktur", href: "referenz/kapitel-086-wissenschaft-als-wirkungsinfrastruktur/" }, bookMain],
  },
  {
    slug: "kultur-identitaet-resonanz",
    title: "Kultur, Identität & Resonanz",
    short: "Kultur als Resonanzsystem der Demokratie: Sinn, Zugehörigkeit, Identität, Teilhabe und gesellschaftlicher Zusammenhalt.",
    status: "Grundstruktur vorhanden",
    question: "Welche kulturellen Räume stärken Sinn, Zugehörigkeit, Resonanz, Teilhabe und demokratischen Zusammenhalt?",
    sdgs: ["SDG 4 Bildung", "SDG 10 Weniger Ungleichheiten", "SDG 11 Nachhaltige Städte", "SDG 16 Starke Institutionen"],
    concepts: ["Resonanzräume", "Kulturelle Teilhabe", "Identität und Zugehörigkeit", "Demokratische Kultur"],
    actors: ["Bürger:innen", "Kultureinrichtungen", "Kommunen", "Bildung", "Medien"],
    docs: [{ label: "Kultur und Teilhabe", href: "referenz/kapitel-072-kultur-und-teilhabe/" }, { label: "Diskurskultur", href: "referenz/kapitel-079-diskurskultur/" }],
    anchors: [{ label: "Kultur und Teilhabe", href: "referenz/kapitel-072-kultur-und-teilhabe/" }, { label: "Sinn, Selbstwirksamkeit und Beziehung", href: "referenz/kapitel-026-sinn-selbstwirksamkeit-und-beziehung/" }, bookMain],
  },
  {
    slug: "klima-energie-ressourcen",
    title: "Klima, Energie & Ressourcen",
    short: "Planetare Grenzen, Energie, Wasser, Biodiversität, Kreislaufwirtschaft und Regeneration als Grundlage jeder Wirkungsordnung.",
    status: "Grundstruktur vorhanden",
    question: "Wie werden planetare Grenzen, Energie, Wasser, Biodiversität und Ressourcenverbrauch entscheidungsrelevant?",
    sdgs: ["SDG 6 Wasser", "SDG 7 Energie", "SDG 12 Konsum und Produktion", "SDG 13 Klima", "SDG 15 Leben an Land"],
    concepts: ["Planetare Grenzen", "Regeneration", "Kreislaufwirtschaft", "Energie als Infrastruktur"],
    actors: ["Bürger:innen", "Unternehmen", "Energieversorger", "Landwirtschaft", "Politik"],
    docs: [{ label: "Nachhaltigkeit als Systemarchitektur", href: "docs/architektur/Nachhaltigkeit_als_Systemarchitektur_v1.1.md" }, { label: "Planet, Koexistenz statt Extraktion", href: "referenz/kapitel-027-planet-koexistenz-statt-extraktion/" }],
    anchors: [{ label: "Planet, Koexistenz statt Extraktion", href: "referenz/kapitel-027-planet-koexistenz-statt-extraktion/" }, { label: "Wachstum innerhalb planetarer Grenzen", href: "referenz/kapitel-055-wachstum-innovation-und-transformation-innerhalb-planetarer-grenzen/" }, bookMain],
  },
];

function normalizedField(field) {
  return {
    pageTitle: field.pageTitle || field.title,
    subtitle: field.subtitle || field.short,
    plus: field.plus || sdgPlusDefault,
    concepts: (field.concepts || []).map((item) =>
      Array.isArray(item) ? { title: item[0], text: item[1], href: item[2] } : { title: item, text: `${item} wird als Wirkungspfad sichtbar: Welche Zustände verändern sich, für wen, mit welchen Rückkopplungen und Risiken?` },
    ),
    actors: field.actors || ["Bürger:innen", "Organisationen", "Politik", "Wissenschaft"],
    tools: field.tools || [
      { label: "Impact Controlling", href: "werkzeuge/impact-controlling/" },
      { label: "Scorecards", href: "werkzeuge/scorecards/" },
      { label: "WÖk-IDs", href: "werkzeuge/woek-ids/" },
      { label: "Reverse Merit Order", href: "werkzeuge/reverse-merit-order/" },
    ],
    demos: field.demos || [],
    docs: field.docs || [{ label: "Arbeitsbibliothek", href: "werkstatt/arbeitsbibliothek/" }],
    anchors: field.anchors || [bookMain],
  };
}

function fieldOverview() {
  return page({
    rel: "wirkungsfelder/index.html",
    title: "Wirkungsfelder der Wirkungsökonomie | Wirkungsoekonomie.de",
    description:
      "Die Wirkungsfelder zeigen, wie die Wirkungsökonomie Bildung, Gesundheit, Wohnen, Arbeit, Unternehmen, Produkte, Kapital, Demokratie, Medien, Wissenschaft und Kultur neu ordnet.",
    searchSection: "Wirkungsfelder",
    body: (base) => `<section class="hero">
        <div class="hero-grid">
          <div>
            <p class="hero-kicker">Portalarchitektur</p>
            <h1 class="hero-title">Wirkungsfelder</h1>
            <p class="hero-subtitle">Lebens- und Systembereiche der Wirkungsökonomie</p>
            <p class="hero-text">Die Wirkungsökonomie ist kein einzelnes Instrument und keine lose Sammlung von Konzepten. Sie ist eine neue Steuerungslogik für gesellschaftliche Wirkungsfelder: Bildung, Gesundheit, Wohnen, Arbeit, Unternehmen, Produkte, Kapital, Demokratie, Medien, Wissenschaft, Kultur und ökologische Lebensgrundlagen. Jedes Wirkungsfeld fragt: Welche Zustandsveränderungen entstehen und wie können Preise, Regeln, Förderung, Kapital und Entscheidungen auf positive Netto-Wirkung für Mensch, Planet und Demokratie ausgerichtet werden?</p>
            ${printActions(base, `<a class="btn btn-primary" href="${href(base, "wirkungsfelder/bildung/")}">Bildungsportal öffnen</a>`)}
          </div>
          <aside class="card">
            <p class="card-kicker">Begriffslogik</p>
            <h2 class="card-title">Wirkung ist nicht automatisch positiv.</h2>
            <p class="card-text">Wirkung bedeutet tatsächliche Veränderung von Zuständen. Sie kann positiv, negativ oder neutral sein. Bewertet wird sie am Referenzrahmen der SDGs, der Agenda 2030 und SDG+.</p>
          </aside>
        </div>
      </section>
      <section class="section" aria-labelledby="felder-register">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Register</p>
            <h2 id="felder-register">Lebens- und Systembereiche</h2>
            <p>Die Karten ordnen vorhandene Inhalte neu. Bestehende Seiten bleiben erreichbar; die kanonische Portalstruktur liegt hier.</p>
          </div>
          ${cardGrid(
            base,
            fields.map((field) => ({
              kicker: field.status,
              title: field.title,
              text: `${field.short}<br><br><strong>SDG-/SDG+-Bezug:</strong> ${field.sdgs.slice(0, 3).join(", ")}; SDG+ ${(
                field.plus || sdgPlusDefault
              )
                .slice(0, 2)
                .join(", ")}.`,
              href: `wirkungsfelder/${field.slug}/`,
              linkLabel: "Portal öffnen",
            })),
          )}
        </div>
      </section>
      ${sdgBlock(base, {
        sdgs: ["Agenda 2030", "SDG 3", "SDG 4", "SDG 8", "SDG 10", "SDG 11", "SDG 12", "SDG 13", "SDG 16", "SDG 17"],
        plus: sdgPlusDefault,
        explanation:
          "Die SDGs bilden nicht den Menübaum der Website. Sie sind der Referenzrahmen, mit dem Wirkungen anschlussfähig, vergleichbar und überprüfbar werden.",
      })}
      ${bookAnchorBlock(base, [
        { label: "Mensch, Planet und Demokratie", href: "referenz/teil-04-mensch-planet-und-demokratie/" },
        { label: "Gesellschaftliche Grundsysteme", href: "referenz/teil-11-gesellschaftliche-grundsysteme/" },
        { label: "Produkte, Märkte und Preise", href: "referenz/teil-08-produkte-maerkte-und-preise/" },
        { label: "Staat, Politik und Demokratie", href: "referenz/teil-10-staat-politik-und-demokratie/" },
      ])}
      ${exportBlock(base)}`,
  });
}

function fieldPage(field) {
  const data = normalizedField(field);
  return page({
    rel: `wirkungsfelder/${field.slug}/index.html`,
    title:
      field.slug === "bildung"
        ? "Bildung als Wirkungsinfrastruktur | Wirkungsökonomie"
        : `${field.title} | Wirkungsfeld der Wirkungsökonomie`,
    description:
      field.slug === "bildung"
        ? "Das Bildungsportal der Wirkungsökonomie: Wirkungsschule, Wirkungspädagogik, Fach Zukunft, Fächervernetzung, Bewertung, Wirkungsförderung und digitale Mündigkeit."
        : field.short,
    searchSection: "Wirkungsfelder",
    body: (base) => `<section class="hero">
        <div class="hero-grid">
          <div>
            <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${href(base, "wirkungsfelder/")}">Wirkungsfelder</a><span aria-hidden="true">/</span><span>${field.title}</span></nav>
            <p class="hero-kicker">Wirkungsfeld</p>
            <h1 class="hero-title">${data.pageTitle}</h1>
            <p class="hero-subtitle">${data.subtitle}</p>
            <dl class="portal-meta-grid">
              <div><dt>Kurzdefinition</dt><dd>${field.short}</dd></div>
              <div><dt>Zentrale Frage</dt><dd>${field.question}</dd></div>
              <div><dt>Status</dt><dd>${field.status}</dd></div>
            </dl>
            ${printActions(base)}
          </div>
          <aside class="card">
            <p class="card-kicker">Leitplanke</p>
            <h2 class="card-title">Positive Netto-Wirkung wird entscheidungsrelevant.</h2>
            <p class="card-text">Wirkung kann positiv, negativ oder neutral sein. Dieses Portal fragt, welche Netto-Wirkung für Mensch, Planet und Demokratie entsteht und welche Risiken sichtbar bleiben müssen.</p>
          </aside>
        </div>
      </section>
      <section class="section" aria-labelledby="alte-logik">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Alte Logik</p>
            <h2 id="alte-logik">Was heute häufig falsch gemessen wird</h2>
          </div>
          ${cardGrid(base, [
            { title: "Dominanter Maßstab", text: "Heute zählen oft Kosten, Output, Zuständigkeiten, kurzfristige Effizienz oder formale Zielerfüllung stärker als reale Zustandsveränderung." },
            { title: "Was gemessen wird", text: "Gemessen werden vor allem Mittel, Fallzahlen, Abschlüsse, Berichte, Budgets, Reichweite oder Aktivität. Diese Werte sind nützlich, aber nicht ausreichend." },
            { title: "Was unsichtbar bleibt", text: "Unsichtbar bleiben Nebenwirkungen, Prävention, Vertrauen, Teilhabe, Resilienz, langfristige Folgekosten und die Frage, wer die Lasten trägt." },
          ])}
        </div>
      </section>
      <section class="section" aria-labelledby="perspektivwechsel">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Perspektivwechsel</p>
            <h2 id="perspektivwechsel">Wirkungsökonomisch lesen</h2>
          </div>
          ${cardGrid(base, [
            { title: "Neuer Maßstab", text: "Entscheidend ist die tatsächliche Zustandsveränderung: Was wird stabiler, gerechter, gesünder, demokratischer, regenerativer oder resilienter?" },
            { title: "Angestrebte Netto-Wirkung", text: "Ziel ist positive Netto-Wirkung für Mensch, Planet und Demokratie, nicht eine schön gerechnete Einzelkennzahl." },
            { title: "Risiken und Nebenwirkungen", text: "Negative Wirkungen, Datenlücken, Zielkonflikte und kritische Grenzen müssen sichtbar bleiben. Die Reverse Merit Order verhindert beliebige Kompensation." },
          ])}
        </div>
      </section>
      <section class="section" aria-labelledby="konzepte">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Konzepte</p>
            <h2 id="konzepte">Zentrale Konzepte</h2>
          </div>
          ${cardGrid(
            base,
            data.concepts.map((item) => ({ title: item.title, text: item.text, href: item.href, linkLabel: item.href ? "Vertiefen" : "" })),
          )}
        </div>
      </section>
      <section class="section" aria-labelledby="akteure">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Perspektiven</p>
            <h2 id="akteure">Akteursperspektiven</h2>
          </div>
          ${cardGrid(
            base,
            data.actors.map((actor) => ({
              title: `Für ${actor}`,
              text: `Die Perspektive fragt, welche Entscheidungen, Anreize, Schutzräume und Rückkopplungen ${actor} brauchen, damit positive Netto-Wirkung praktisch wird.`,
            })),
          )}
        </div>
      </section>
      <section class="section" aria-labelledby="rahmen">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Politischer Rahmen</p>
            <h2 id="rahmen">Regeln, Förderung und Institutionen</h2>
            <p>Dieses Wirkungsfeld braucht Regeln, Förderlogiken, Datenstandards, Haushaltslogik und demokratische Kontrolle, die Wirkung nicht nur berichten, sondern in Entscheidungen zurückkoppeln.</p>
          </div>
          ${cardGrid(base, [
            { title: "Regeln", text: "Regeln definieren Mindestschutz, Datenqualität, Zuständigkeiten und Missbrauchsschutz." },
            { title: "Förderlogik", text: "Förderung wird an Zustandsveränderungen, Prävention, Lernfähigkeit und positive Netto-Wirkung gebunden." },
            { title: "Institutionen", text: "Wirkungsrat, Verwaltung, Kommunen, Prüfstellen und Wissenschaft sichern Evaluation, Widerspruch und Weiterentwicklung." },
          ])}
        </div>
      </section>
      <section class="section" aria-labelledby="tools">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Werkzeuge & Methoden</p>
            <h2 id="tools">Passende Werkzeuge</h2>
          </div>
          ${linkList(base, data.tools)}
        </div>
      </section>
      <section class="section" aria-labelledby="demos">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Erleben</p>
            <h2 id="demos">Demo und interaktive Zugänge</h2>
          </div>
          ${
            data.demos.length
              ? linkList(base, data.demos)
              : '<p class="card-text">Demo in Vorbereitung. Bis dahin führen Werkzeuge, Buchanker und Werkstatt-Dokumente in die Logik des Wirkungsfelds ein.</p>'
          }
        </div>
      </section>
      <section class="section" aria-labelledby="docs">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Werkstatt</p>
            <h2 id="docs">Dokumente und Arbeitsmaterialien</h2>
          </div>
          ${linkList(base, data.docs)}
        </div>
      </section>
      ${sdgBlock(base, {
        sdgs: field.sdgs,
        plus: data.plus,
        explanation: `${field.title} berührt mehrere SDGs, weil Zustandsveränderungen in diesem Feld selten isoliert bleiben. Die SDG+-Dimensionen machen demokratische, institutionelle und digitale Wirkungen transparent.`,
      })}
      ${bookAnchorBlock(base, data.anchors)}
      ${exportBlock(base)}`,
  });
}

function schoolPage() {
  return page({
    rel: "wirkungsfelder/bildung/wirkungsschule/index.html",
    title: "Die Wirkungsschule | Ein wirkungsökonomisches Schulkonzept",
    description:
      "Die Wirkungsschule denkt Schule als Wirkungsraum: Fächer, Unterricht, Bewertung, Förderung, Demokratie, digitale Mündigkeit und Zukunftskompetenz neu.",
    searchSection: "Wirkungsfelder",
    searchType: "Konzeptseite",
    body: (base) => `<section class="hero">
        <div class="hero-grid">
          <div>
            <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${href(base, "wirkungsfelder/")}">Wirkungsfelder</a><span aria-hidden="true">/</span><a href="${href(base, "wirkungsfelder/bildung/")}">Bildung</a><span aria-hidden="true">/</span><span>Wirkungsschule</span></nav>
            <p class="hero-kicker">Bildung</p>
            <h1 class="hero-title">Die Wirkungsschule</h1>
            <p class="hero-subtitle">Ein wirkungsökonomisches Schulkonzept für Zukunft, Demokratie, Selbstwirksamkeit und Wirkungskompetenz.</p>
            <p class="hero-text">Die Wirkungsschule ist kein einzelnes Fach, keine Nachhilfe-Reform und kein neues Etikett für alte Schule. Sie ist ein Schulkonzept, das Schule als Wirkungsraum versteht. Entscheidend ist nicht nur, welche Inhalte vermittelt werden, sondern welche Zustände Schule verändert: Selbstwirksamkeit, Urteilskraft, demokratische Mündigkeit, Gesundheit, Teilhabe, digitale Souveränität, Beziehung, Lernfreude und Zukunftsfähigkeit.</p>
            ${printActions(base, `<a class="btn btn-primary" href="${href(base, SCHOOL_DOC)}">Konzeptpapier herunterladen</a>`)}
          </div>
          <aside class="card">
            <p class="card-kicker">Arbeitsfassung</p>
            <h2 class="card-title">Öffentliche Kurzfassung</h2>
            <p class="card-text">Diese Seite fasst die Logik verständlich zusammen und verweist auf das Konzeptpapier als Arbeitsfassung. Sie ersetzt keine vollständige Langfassung.</p>
          </aside>
        </div>
      </section>
      <section class="section" aria-labelledby="kurzfassung">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Kurzfassung</p>
            <h2 id="kurzfassung">Schule als Wirkungsraum</h2>
          </div>
          ${cardGrid(base, [
            {
              title: "Warum Schule neu gedacht werden muss",
              text:
                "Schule misst heute häufig Leistung über Noten, Abschlüsse und Vergleichbarkeit. Diese Größen sind nicht wertlos, aber sie reichen nicht aus. Sie zeigen oft, was ein Kind zu einem bestimmten Zeitpunkt reproduzieren kann, aber nicht, ob es Zusammenhänge erkennt, Verantwortung übernimmt, mit Unsicherheit umgehen kann, digitale Räume versteht, demokratisch streiten lernt oder die eigene Wirksamkeit erlebt. Eine wirkungsökonomische Schule fragt deshalb nicht nur: Was wurde gelehrt? Sie fragt: Was hat Lernen im Leben, Denken und Handeln verändert?",
            },
            {
              title: "Wirkungskompetenz als Bildungsziel",
              text:
                "Wirkungskompetenz ist die Fähigkeit, Wirkungen, Nebenwirkungen, Rückkopplungen, Zielkonflikte und Verantwortung zu erkennen und handlungsfähig darauf zu reagieren. Sie verbindet Fachwissen mit Systemdenken, Wahrnehmung, Analyse, Kommunikation, Entscheidung und Reflexion. Damit wird Bildung nicht auf Arbeitsmarktfähigkeit reduziert, sondern als Grundlage einer mündigen, demokratischen und zukunftsfähigen Gesellschaft verstanden.",
            },
            {
              title: "Fächer neu denken",
              text:
                "Die Wirkungsschule schafft Fächer nicht ab. Sie vernetzt sie. Mathematik wird zur Sprache von Mustern, Daten und Modellierung. Deutsch wird zur Sprache von Ausdruck, Deutung und Diskurs. Geschichte wird zur Wirkungsgeschichte: Was hat sich verändert, für wen, wodurch und mit welchen Folgen? Naturwissenschaften zeigen Wechselwirkungen zwischen Mensch, Technik und Planet. Ethik und Politik verbinden Verantwortung, Recht und Demokratie. Informatik und Medienbildung machen digitale Wirkungsräume sichtbar. Kunst und Kultur öffnen Resonanz, Sinn und Ausdruck.",
            },
            {
              title: "Das Fach oder Lernfeld Zukunft",
              text:
                "Das Fach oder Lernfeld Zukunft verbindet bestehende Fächer über reale Fragen: Wie wirkt Hitze auf Gesundheit und Stadtplanung? Wie verändern Algorithmen Öffentlichkeit? Wie hängen Ernährung, Wasser, Boden und Klima zusammen? Wie entsteht Vertrauen in Demokratien? Wie wird Pflege, Arbeit oder Wohnen zukunftsfähig? Zukunft ist kein Zusatzstoff, sondern der gemeinsame Wirkungsraum des Lernens.",
            },
            {
              title: "Wirkungspädagogik",
              text:
                "Wirkungspädagogik versteht Unterricht als Gestaltung von Lernräumen, Beziehungen, Fragen, Projekten und Verantwortung. Lernen wird nicht nur über Stoffmenge beschrieben, sondern über die Fähigkeit, Zusammenhänge zu sehen und handlungsfähig zu werden.",
            },
            {
              title: "Bewertung, Noten und Wirkungsportfolio",
              text:
                "Die Wirkungsschule muss Bewertung neu denken. Noten können Orientierung geben, aber sie dürfen nicht das einzige Bild von Leistung sein. Ergänzend braucht es Entwicklungsportfolios, Kompetenznachweise, Projektreflexionen, Feedback, Selbstbewertung, Teamleistungen und sichtbare Lernwege. Bewertet wird nicht der Wert eines Kindes. Bewertet wird, was es gelernt, verstanden, gestaltet, reflektiert und weiterentwickelt hat.",
            },
            {
              title: "Förderung und Potenzialentwicklung",
              text:
                "Förderung beginnt nicht erst beim Scheitern. Wirkungsförderung stärkt Potenziale frühzeitig, verhindert Lernabbrüche und verbindet schulische sowie außerschulische Unterstützung. Sie umfasst Lernförderung, Mentoring, Dyskalkulie- und LRS-Unterstützung, Sprachförderung, Begabungsförderung, psychosoziale Stabilisierung und digitale Teilhabe. Nicht die Fünf ist der Startpunkt, sondern die Frage, welche Unterstützung positive Entwicklung ermöglicht.",
            },
            {
              title: "Digitale Mündigkeit und Demokratiekompetenz",
              text:
                "Digitale Mündigkeit verbindet Datenverständnis, Plattformlogik, KI, Aufmerksamkeit, Manipulation und digitale Selbstbestimmung. Demokratiekompetenz wird nicht nur erklärt, sondern praktiziert: Streitfähigkeit, Minderheitenschutz, Medienkompetenz, Beteiligung, Verantwortung und Rechtsstaatlichkeit.",
            },
            {
              title: "Schulorganisation, Zeit und Lernräume",
              text:
                "Auch Räume wirken. Zeitstrukturen, Pausen, Ernährung, Bewegung, Licht, Lärm, Beteiligung, Beziehung, Sicherheit und Inklusion beeinflussen Lernen. Eine Wirkungsschule betrachtet deshalb nicht nur Unterricht, sondern den ganzen Schulalltag: Wie fühlt sich Schule an? Wer wird gesehen? Wer wird beschämt? Wer kann mitgestalten? Welche Routinen stärken Vertrauen, Konzentration und Verantwortung?",
            },
            {
              title: "Pilotmodell Wirkungsschule",
              text:
                "Die Wirkungsschule kann als Schulprofil, Modellschule oder kommunales Bildungsnetzwerk erprobt werden. Entscheidend ist ein lernender Ansatz: starten, beobachten, auswerten, korrigieren. Nicht Kinder werden gescored, sondern das System prüft, ob seine Lernräume Würde, Teilhabe, Selbstwirksamkeit, Demokratiekompetenz und Zukunftsfähigkeit stärken.",
            },
          ])}
        </div>
      </section>
      <section class="section" aria-labelledby="konzeptpapier">
        <div class="download-card">
          <div>
            <p class="card-kicker">Konzeptpapier</p>
            <h2 id="konzeptpapier">Konzeptpapier Wirkungsschule herunterladen</h2>
            <p class="card-text">Die Word-Arbeitsfassung ist als Konzeptpapier verlinkt. Es wurde keine neue PDF-Exportpipeline ergänzt.</p>
          </div>
          <a class="btn btn-primary" href="${href(base, SCHOOL_DOC)}">Konzeptpapier herunterladen</a>
        </div>
      </section>
      ${sdgBlock(base, {
        sdgs: fields[0].sdgs,
        plus: fields[0].plus,
        explanation:
          "Die Wirkungsschule verbindet Bildung, Gesundheit, Teilhabe, Demokratie, digitale Selbstbestimmung und Zukunftsfähigkeit. Darum reicht ein einzelnes SDG nicht aus.",
      })}
      ${bookAnchorBlock(base, fields[0].anchors)}
      ${exportBlock(base)}`,
  });
}

const tools = [
  ["impact-controlling", "Impact Controlling", "Der übergeordnete Methodenbereich, der Wirkung in Steuerung, Controlling, Reporting, Risiko und Entscheidung übersetzt.", ["Wirtschaft & Unternehmen", "Staat, Recht & Demokratie"], "referenz/kapitel-044-wirkungscontrolling-im-unternehmen/"],
  ["impact-controlling/t-sroi", "T-SROI", "Transformational Social Return on Investment: ein Instrument zur Bewertung finanzieller, sozialer, ökologischer und systemischer Transformationswirkung.", ["Wirtschaft & Unternehmen", "Finanzsystem & Kapital"], "referenz/kapitel-034-t-sroi-und-systemische-transformationsmessung/"],
  ["netto-wirkungs-index", "Netto-Wirkungs-Index", "Operative Kennzahl zur Einordnung positiver, negativer und neutraler Wirkung innerhalb des WÖk-Rahmens.", ["Produkte & Konsum", "Staat, Recht & Demokratie"], "begriffe/nwi/"],
  ["scorecards", "Scorecards", "Strukturierte Bewertung von Produkten, Aktivitäten, Organisationen oder Entscheidungen anhand von WÖk-IDs, Benchmarks und Wirkungsskalen.", ["Produkte & Konsum", "Wirtschaft & Unternehmen"], "referenz/kapitel-032-benchmarks-skalen-und-scorecards/"],
  ["woek-ids", "WÖk-IDs", "Indikatorenarchitektur, die SDGs, SDG+, NACE, ESRS, GRI und weitere Standards in eine überprüfbare Wirkungslogik überführt.", ["Produkte & Konsum", "Wirtschaft & Unternehmen"], "referenz/kapitel-031-woek-ids-und-indikatorenarchitektur/"],
  ["reverse-merit-order", "Reverse Merit Order", "Schutzregel gegen Schönrechnung: Kritische negative Wirkungen dürfen nicht beliebig durch positive Werte kompensiert werden.", ["Produkte & Konsum", "Staat, Recht & Demokratie"], "referenz/kapitel-033-reverse-merit-order/"],
  ["wirkungssteuergesetz", "Wirkungssteuergesetz", "Rahmengesetzliche Logik, die Wirkung als Bemessungs- und Steuerungsgrundlage in das Steuersystem übersetzt.", ["Staat, Recht & Demokratie"], "referenz/kapitel-037-das-wirkungssteuergesetz-wstg/"],
  ["wirkungsumsatzsteuer", "Wirkungsumsatzsteuer / Produktwirkungssteuer", "Steuerlogik, nach der Produkte und Leistungen anhand ihrer Wirkung auf Mensch, Planet und Demokratie unterschiedlich belastet oder entlastet werden.", ["Produkte & Konsum", "Wirtschaft & Unternehmen"], "referenz/kapitel-038-das-wustg-und-die-produktwirkungssteuer/"],
  ["wirkungseinkommensteuer", "Wirkungseinkommensteuer", "Ansatz, Einkommen nicht nur nach Höhe, sondern nach Entstehungskontext und Wirkung zu bewerten.", ["Arbeit & Einkommen", "Rente & soziale Sicherung"], "referenz/kapitel-057-wirkungseinkommen/"],
  ["wirkungshaushalt", "Wirkungshaushalt", "Öffentliche Mittel werden nicht nur nach Ausgabenlogik, sondern nach realer Zustandsveränderung, Prävention und positiver Netto-Wirkung betrachtet.", ["Staat, Recht & Demokratie", "Wohnen & Stadt"], "referenz/kapitel-039-wirkungshaushalt-und-oeffentliche-mittel/"],
  ["wirkungsrat", "Wirkungsrat", "Unabhängige Institution zur Sicherung, Evaluation und Weiterentwicklung der Wirkungslogik, Indikatoren, Benchmarks und Missbrauchsschutz.", ["Staat, Recht & Demokratie"], "referenz/kapitel-040-der-wirkungsrat/"],
  ["digitale-produktpaesse-wirkungsdatenraeume", "Digitale Produktpässe und Wirkungsdatenräume", "Dateninfrastruktur, die Produkt-, Lieferketten- und Wirkungsinformationen prüfbar, interoperabel und entscheidungsrelevant macht.", ["Produkte & Konsum", "Wissenschaft, Innovation & Digitalisierung"], "referenz/kapitel-035-digitale-produktpaesse-und-wirkungsdatenraeume/"],
  ["wirkungsportfolio", "Wirkungsportfolio", "Bewertungs- und Entwicklungsinstrument für Bildung, Organisationen oder Projekte, das Lernfortschritt, Verantwortung, Wirkungskompetenz und Reflexion sichtbar macht.", ["Bildung", "Wirtschaft & Unternehmen"], "wirkungsfelder/bildung/"],
].map(([slug, title, text, fieldNames, anchor]) => ({ slug, title, text, fieldNames, anchor }));

function toolOverview() {
  return page({
    rel: "werkzeuge/index.html",
    title: "Werkzeuge der Wirkungsökonomie | Wirkung messen, bewerten und rückkoppeln",
    description:
      "Methoden und Instrumente der Wirkungsökonomie: Impact Controlling, T-SROI, Scorecards, WÖk-IDs, Wirkungssteuergesetz, Wirkungshaushalt und Wirkungsrat.",
    searchSection: "Werkzeuge",
    body: (base) => `<section class="hero">
        <div class="hero-grid">
          <div>
            <p class="hero-kicker">Methoden und Instrumente</p>
            <h1 class="hero-title">Werkzeuge der Wirkungsökonomie</h1>
            <p class="hero-subtitle">Methoden, Instrumente und Steuerungslogiken, mit denen Wirkung sichtbar, bewertbar und entscheidungsrelevant wird.</p>
            <p class="hero-text">Werkzeuge sind nicht die Wirkungsfelder selbst. Sie sind die Methoden und Instrumente, die in mehreren Bereichen eingesetzt werden: in Unternehmen, Politik, Produkten, Bildung, Wohnen, Kapital, Medien oder Verwaltung.</p>
            ${printActions(base)}
          </div>
          <aside class="card">
            <p class="card-kicker">Abgrenzung</p>
            <h2 class="card-title">Werkzeuge erklären Methoden. Erleben lässt sie ausprobieren.</h2>
            <p class="card-text">T-SROI ist ein Werkzeug innerhalb von Impact Controlling, nicht der gesamte Bereich. Das Wirkungssteuergesetz ist ein Rahmeninstrument, kein Wirkungsfeld.</p>
          </aside>
        </div>
      </section>
      <section class="section" aria-labelledby="werkzeuge-register">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Register</p>
            <h2 id="werkzeuge-register">Instrumente und Steuerungslogiken</h2>
          </div>
          ${cardGrid(
            base,
            tools.map((tool) => ({ title: tool.title, text: tool.text, href: `werkzeuge/${tool.slug}/`, linkLabel: "Werkzeug öffnen" })),
          )}
        </div>
      </section>
      ${sdgBlock(base, {
        sdgs: ["Agenda 2030", "SDG 8", "SDG 9", "SDG 12", "SDG 13", "SDG 16", "SDG 17"],
        plus: sdgPlusDefault,
        explanation:
          "Werkzeuge übersetzen den Referenzrahmen in Daten, Bewertung, Entscheidung und Lernen. Sie ersetzen die SDGs nicht, sondern machen Wirkungen anschlussfähig.",
      })}
      ${bookAnchorBlock(base, [
        { label: "Von Wirkung zu Messung", href: "referenz/kapitel-030-von-wirkung-zu-messung/" },
        { label: "WÖk-IDs und Indikatorenarchitektur", href: "referenz/kapitel-031-woek-ids-und-indikatorenarchitektur/" },
        { label: "Benchmarks, Skalen und Scorecards", href: "referenz/kapitel-032-benchmarks-skalen-und-scorecards/" },
        { label: "T-SROI", href: "referenz/kapitel-034-t-sroi-und-systemische-transformationsmessung/" },
      ])}
      ${exportBlock(base)}`,
  });
}

function toolPage(tool) {
  const fieldLinks = fields.filter((field) => tool.fieldNames.includes(field.title)).map((field) => ({ label: field.title, href: `wirkungsfelder/${field.slug}/` }));
  const demoLinks =
    tool.slug.includes("score") || tool.slug.includes("woek") || tool.slug.includes("wirkungsumsatzsteuer")
      ? [
          { label: "Produktwirkung erleben", href: "erleben.html#simulator" },
          { label: "Scorecard-Demo", href: "scorecard-dashboard.html" },
        ]
      : tool.slug === "impact-controlling/t-sroi"
        ? [{ label: "Risikodemo", href: "erleben.html#risikolabor" }]
        : [];
  return page({
    rel: `werkzeuge/${tool.slug}/index.html`,
    title: `${tool.title} | Werkzeug der Wirkungsökonomie`,
    description: tool.text,
    searchSection: "Werkzeuge",
    searchType: "Werkzeugseite",
    body: (base) => `<section class="hero">
        <div class="hero-grid">
          <div>
            <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${href(base, "werkzeuge/")}">Werkzeuge</a><span aria-hidden="true">/</span><span>${tool.title}</span></nav>
            <p class="hero-kicker">Werkzeug</p>
            <h1 class="hero-title">${tool.title}</h1>
            <p class="hero-subtitle">${tool.text}</p>
            ${printActions(base)}
          </div>
          <aside class="card">
            <p class="card-kicker">Methodenlogik</p>
            <h2 class="card-title">Dieses Werkzeug ist kein Wirkungsfeld.</h2>
            <p class="card-text">Es wird in mehreren Wirkungsfeldern eingesetzt und muss negative, positive und neutrale Wirkung getrennt sichtbar halten.</p>
          </aside>
        </div>
      </section>
      <section class="section" aria-labelledby="leistung">
        <div>
          <div class="section-header"><p class="hero-kicker">Funktion</p><h2 id="leistung">Was dieses Werkzeug leistet</h2></div>
          ${cardGrid(base, [
            { title: "Einsatz", text: "Das Werkzeug ordnet Daten, Bewertungsfragen und Entscheidungen so, dass Wirkung nicht nur berichtet, sondern rückgekoppelt werden kann." },
            { title: "Grenzen", text: "Es ersetzt keine politische Abwägung und keine demokratische Kontrolle. Datenqualität, Unsicherheit und Zielkonflikte bleiben sichtbar." },
            { title: "Missbrauchsschutz", text: "Reverse Merit Order, Quellenprüfung, Einspruchslogik und transparente Gewichtung schützen vor Schönrechnung und Impact Washing." },
          ])}
        </div>
      </section>
      <section class="section" aria-labelledby="einsatzfelder">
        <div>
          <div class="section-header"><p class="hero-kicker">Anwendung</p><h2 id="einsatzfelder">Wirkungsfelder, in denen das Werkzeug angewendet wird</h2></div>
          ${fieldLinks.length ? linkList(base, fieldLinks) : '<p class="card-text">Dieses Werkzeug ist als Querschnittsinstrument angelegt.</p>'}
        </div>
      </section>
      <section class="section" aria-labelledby="demo">
        <div>
          <div class="section-header"><p class="hero-kicker">Erleben</p><h2 id="demo">Demo und Prototypen</h2></div>
          ${demoLinks.length ? linkList(base, demoLinks) : '<p class="card-text">Demo in Vorbereitung.</p>'}
        </div>
      </section>
      <section class="section" aria-labelledby="werkstatt-docs">
        <div>
          <div class="section-header"><p class="hero-kicker">Werkstatt</p><h2 id="werkstatt-docs">Dokumente und Arbeitsmaterialien</h2></div>
          ${linkList(base, [
            { label: "Arbeitsbibliothek Instrumente", href: "werkstatt/arbeitsbibliothek/instrumente/" },
            { label: "Referenzanker", href: tool.anchor },
            { label: "Downloads", href: "downloads.html" },
          ])}
        </div>
      </section>
      ${sdgBlock(base, {
        sdgs: ["Agenda 2030", "SDG 8", "SDG 9", "SDG 12", "SDG 13", "SDG 16", "SDG 17"],
        plus: sdgPlusDefault,
        explanation:
          "Dieses Werkzeug bewertet keine SDGs als Menüstruktur. Es nutzt SDGs und SDG+ als Referenzrahmen, damit Wirkung anschlussfähig, prüfbar und entscheidungsrelevant wird.",
      })}
      ${bookAnchorBlock(base, [
        { label: tool.title, href: tool.anchor },
        { label: "WÖk-IDs und Indikatorenarchitektur", href: "referenz/kapitel-031-woek-ids-und-indikatorenarchitektur/" },
        { label: "Benchmarks, Skalen und Scorecards", href: "referenz/kapitel-032-benchmarks-skalen-und-scorecards/" },
        bookMain,
      ])}
      ${exportBlock(base)}`,
  });
}

function workshopPages() {
  const mainSections = [
    ["Online-Buch", "Die Referenzfassung der Wirkungsökonomie mit Kapiteln, Teilen und Volltext.", "referenz/"],
    ["Arbeitsbibliothek", "Kuratiertes Arbeitsregal für Whitepaper, Working Papers, Gesetze, Methodik und Dossiers.", "werkstatt/arbeitsbibliothek/"],
    ["Whitepaper", "Vertiefende Papiere zu Wirkung, T-SROI, Produkten, Einkommen und Systemarchitektur.", "werkstatt/arbeitsbibliothek/whitepaper/"],
    ["Working Papers", "Arbeitsstände und Konzeptpapiere, die Modelle und Anwendungsfelder vertiefen.", "wissen/working-papers/"],
    ["Gesetze und Rechtsentwürfe", "WStG, WUStG, WEstG und juristische Prüfnotizen.", "werkstatt/arbeitsbibliothek/gesetze/"],
    ["Methodik", "Datenbasis, Standards, Regularien, WÖk-IDs, Scorecards und Evidenzlogik.", "werkstatt/arbeitsbibliothek/methodik/"],
    ["Praxisbeispiele", "Apfelbeispiel, Lieferketten, Konzernbeispiel und kommunale Use Cases.", "werkstatt/arbeitsbibliothek/praxis/"],
    ["Architektur", "Systemmodell und Nachhaltigkeit als Systemarchitektur.", "werkstatt/arbeitsbibliothek/architektur/"],
    ["Dossiers", "Öffentliche Dossiers aus Journal und Werkstatt.", "blog/dossiers/grundlagen.html"],
    ["Historische Dokumente", "Ältere Arbeitsstände bleiben auffindbar und werden als historisch eingeordnet.", "werkstatt/arbeitsbibliothek/historische-dokumente/"],
    ["Downloads", "Bestehende Download-Seite mit PDFs und Originaldateien.", "downloads.html"],
  ].map(([title, text, href]) => ({ title, text, href, linkLabel: "Öffnen" }));

  page({
    rel: "werkstatt/index.html",
    title: "Werkstatt der Wirkungsökonomie | Buch, Whitepaper, Arbeitspapiere und Dossiers",
    description:
      "Die Werkstatt bündelt Online-Buch, Arbeitsbibliothek, Whitepaper, Working Papers, Gesetzesentwürfe, Methodik, Praxisbeispiele und Dossiers der Wirkungsökonomie.",
    searchSection: "Werkstatt",
    body: (base) => `<section class="hero">
        <div class="hero-grid">
          <div>
            <p class="hero-kicker">Arbeitsgrundlagen</p>
            <h1 class="hero-title">Werkstatt der Wirkungsökonomie</h1>
            <p class="hero-subtitle">Buch, Arbeitsbibliothek, Whitepaper, Working Papers, Gesetze, Dossiers und historische Dokumente.</p>
            <p class="hero-text">Die Werkstatt bündelt die vertiefenden Materialien der Wirkungsökonomie. Hier liegen nicht die schnellen Einstiege, sondern die Arbeitsgrundlagen: das Online-Buch, Whitepaper, Arbeitspapiere, Gesetzesentwürfe, Methodik, Praxisbeispiele, Architekturpapiere, Dossiers und historische Dokumente.</p>
            ${printActions(base)}
          </div>
          <aside class="card">
            <p class="card-kicker">Bestandsschutz</p>
            <h2 class="card-title">Downloads bleiben erhalten.</h2>
            <p class="card-text">Die bestehende Download-Seite bleibt erreichbar und wird als Teil der Werkstatt verlinkt.</p>
          </aside>
        </div>
      </section>
      <section class="section" aria-labelledby="werkstatt-register">
        <div>
          <div class="section-header"><p class="hero-kicker">Register</p><h2 id="werkstatt-register">Arbeitsbereiche</h2></div>
          ${cardGrid(base, mainSections)}
        </div>
      </section>
      ${sdgBlock(base, {
        sdgs: ["Agenda 2030", "SDG 4", "SDG 9", "SDG 12", "SDG 16", "SDG 17"],
        plus: sdgPlusDefault,
        explanation:
          "Die Werkstatt dokumentiert den Referenzrahmen, die methodischen Grundlagen und die Arbeitsstände, aus denen die Wirkungsökonomie weiterlernt.",
      })}
      ${bookAnchorBlock(base, [bookMain, { label: "Referenzteile", href: "referenz/teile/" }, { label: "Volltext", href: "referenz/volltext/" }])}
      ${exportBlock(base)}`,
  });

  const libraryCards = [
    ["Gesetze", "Wirkungssteuergesetz, WUStG, Wirkungshaushalt und rechtliche Prüfnotizen.", "werkstatt/arbeitsbibliothek/gesetze/"],
    ["Methodik", "WÖk-IDs, Scorecards, Datenstandards, Quellenlogik und Bewertungsregeln.", "werkstatt/arbeitsbibliothek/methodik/"],
    ["Whitepaper", "Grundlagen- und Methodenpapiere.", "werkstatt/arbeitsbibliothek/whitepaper/"],
    ["Praxis", "Produktbeispiele, Lieferketten, Konzernbeispiele und Use Cases.", "werkstatt/arbeitsbibliothek/praxis/"],
    ["Soziales", "Arbeit, Einkommen, Rente, Care und soziale Sicherung.", "werkstatt/arbeitsbibliothek/soziales/"],
    ["Recht", "Juristische Prüfnotizen, Risikolandkarten und Verfahrensmodelle.", "werkstatt/arbeitsbibliothek/recht/"],
    ["Architektur", "Systemarchitektur, Nachhaltigkeit, Modell und Wirkungsordnung.", "werkstatt/arbeitsbibliothek/architektur/"],
    ["Historische Dokumente", "Ältere Arbeitsstände und Archivmaterial.", "werkstatt/arbeitsbibliothek/historische-dokumente/"],
    ["Wirkungsfelder", "Arbeitsmaterialien nach Wirkungsfeldern.", "werkstatt/arbeitsbibliothek/wirkungsfelder/"],
    ["Instrumente", "Arbeitsmaterialien nach Werkzeugen.", "werkstatt/arbeitsbibliothek/instrumente/"],
  ].map(([title, text, href]) => ({ title, text, href, linkLabel: "Öffnen" }));

  simpleLibraryPage("werkstatt/arbeitsbibliothek/index.html", "Arbeitsbibliothek", "Arbeitsbibliothek der Wirkungsökonomie", "Whitepaper, Working Papers, Rechtsentwürfe, Methodik, Praxisbeispiele und historische Dokumente.", libraryCards);

  const simplePages = [
    ["gesetze", "Gesetze und Rechtsentwürfe", [["Wirkungssteuergesetz WStG", "Rahmenentwurf zur Wirkungssteuerlogik.", "dokumente/wstg-oktober-2025/"], ["Technische Leitlinien WUStG", "Leitlinien zur Produktwirkungssteuer.", "dokumente/technische-leitlinien-wustg-v2/"], ["Wirkungsrat", "Governance und institutionelle Sicherung.", "dokumente/wirkungsrat-konzept/"]]],
    ["methodik", "Methodik", [["WÖk Master Items", "Indikatorenarchitektur und Master Items.", "dokumente/woek-master-items-final-v1-2/"], ["Datenbasis", "Methodik, Standards und Regularien.", "methodik/datenbasis.html"], ["Scorecard-Demo", "Operative Bewertung sichtbar machen.", "scorecard-dashboard.html"]]],
    ["whitepaper", "Whitepaper", [["T-SROI", "Transformationswirkung und Impact Controlling.", "dokumente/whitepaper-t-sroi/"], ["Wirkung statt Kapital", "Grundlagen und Paradigmenwechsel.", "assets/pdf/whitepaper-wirkung-statt-kapital.pdf"], ["Wirkungseinkommen", "Einkommen und Wirkung.", "assets/pdf/whitepaper-wirkungseinkommen.pdf"]]],
    ["praxis", "Praxisbeispiele", [["Apfelbeispiel", "Produktscorecard und Bonusregel.", "dokumente/beispiel-apfel-wirkungssteuer-bonusregel/"], ["Lieferkette", "Wirkungsökonomie in der Lieferkette.", "dokumente/wirkungsoekonomie-in-der-lieferkette/"], ["Beispiel Konzern", "Konzern- und Produktscorecard.", "dokumente/beispiel-konzern/"]]],
    ["soziales", "Soziales", [["Wenn Maschinen arbeiten", "Automatisierung und Wirkungseinkommen.", "dokumente/wenn-maschinen-arbeiten/"], ["Wirkungsrente", "Generationenvertrag und soziale Sicherung.", "docs/soziales/Wirkungsrente_v1.1_Generationenvertrag.md"], ["Wirkungseinkommen", "Grunddividende und Zielmodell.", "docs/soziales/Wirkungseinkommen_Grunddividende_v1.1_Zielmodell.md"]]],
    ["recht", "Recht", [["Juristische Risikolandkarte", "Rechtsprüfung und Risiken.", "docs/recht/WOeK_Juristische_Risikolandkarte_v1.1.md"], ["WStG Prüfnotiz", "Juristische Prüfung des WStG.", "docs/recht/WStG_2.0_Juristische_Pruefnotiz.md"], ["Wirkungsrat Prüfnotiz", "Governance und Rechtsrahmen.", "docs/recht/Wirkungsrat_Juristische_Pruefnotiz_Governance.md"]]],
    ["architektur", "Architektur", [["Systemmodell", "Systemmodell der Wirkungsökonomie.", "dokumente/systemmodell-der-wirkungsoekonomie/"], ["Nachhaltigkeit als Systemarchitektur", "Architekturpapier.", "docs/architektur/Nachhaltigkeit_als_Systemarchitektur_v1.1.md"], ["Prozessarchitektur", "Von Daten zu Steuerlogik.", "workflow.html"]]],
    ["historische-dokumente", "Historische Dokumente", [["Manifest", "Historischer und normativer Ausgangspunkt.", "dokumente/woek-manifest/"], ["Minifest", "Kurzfassung und Arbeitsstand.", "dokumente/minifest-wirkungsoekonomie/"], ["Archivhinweis", "Historische Dokumente einordnen.", "docs/grundlagen/Historische_Dokumente_Hinweis_v1.1.md"]]],
  ];
  for (const [slug, title, docs] of simplePages) {
    simpleLibraryPage(
      `werkstatt/arbeitsbibliothek/${slug}/index.html`,
      title,
      title,
      "Kuratiertes Arbeitsregal. Bestehende Dokumente bleiben an ihren alten Orten erreichbar und werden hier nur neu verknüpft.",
      docs.map(([title, text, href]) => ({ title, text, href, linkLabel: "Material öffnen" })),
    );
  }

  simpleLibraryPage(
    "werkstatt/arbeitsbibliothek/wirkungsfelder/index.html",
    "Wirkungsfelder in der Arbeitsbibliothek",
    "Arbeitsbibliothek nach Wirkungsfeldern",
    "Materialien werden den neuen Wirkungsfeldern zugeordnet, ohne bestehende Dokumentpfade zu zerstören.",
    fields.map((field) => ({ title: field.title, text: field.short, href: `werkstatt/arbeitsbibliothek/wirkungsfelder/${field.slug}/`, linkLabel: "Regal öffnen" })),
  );
  for (const field of fields) {
    const data = normalizedField(field);
    simpleLibraryPage(
      `werkstatt/arbeitsbibliothek/wirkungsfelder/${field.slug}/index.html`,
      `${field.title} in der Arbeitsbibliothek`,
      field.title,
      `Arbeitsmaterialien zum Wirkungsfeld ${field.title}.`,
      [
        ...data.docs.map((item) => ({ title: item.label, text: "Zugeordnetes Material oder vorhandener Referenzanker.", href: item.href, linkLabel: "Öffnen" })),
        { title: `Portal ${field.title}`, text: "Kanonische Wirkungsfeldseite.", href: `wirkungsfelder/${field.slug}/`, linkLabel: "Portal öffnen" },
      ],
    );
  }
  simpleLibraryPage(
    "werkstatt/arbeitsbibliothek/wirkungsfelder/bildung/wirkungsschule/index.html",
    "Konzeptpapier Wirkungsschule",
    "Wirkungsschule in der Arbeitsbibliothek",
    "Arbeitsfassung und öffentliche Kurzfassung der Wirkungsschule.",
    [
      { title: "Konzeptpapier Wirkungsschule", text: "Word-Arbeitsfassung des wirkungsökonomischen Schulkonzepts.", href: SCHOOL_DOC, linkLabel: "DOCX öffnen" },
      { title: "Kurzfassung Wirkungsschule", text: "Öffentliche Web-Kurzfassung.", href: "wirkungsfelder/bildung/wirkungsschule/", linkLabel: "Kurzfassung öffnen" },
    ],
  );

  simpleLibraryPage(
    "werkstatt/arbeitsbibliothek/instrumente/index.html",
    "Instrumente in der Arbeitsbibliothek",
    "Arbeitsbibliothek nach Instrumenten",
    "Materialien werden den Werkzeugen zugeordnet, ohne bestehende Dokumentpfade zu zerstören.",
    tools
      .filter((tool) => ["wirkungssteuergesetz", "impact-controlling", "impact-controlling/t-sroi", "scorecards", "woek-ids", "wirkungsrat"].includes(tool.slug))
      .map((tool) => ({ title: tool.title, text: tool.text, href: `werkstatt/arbeitsbibliothek/instrumente/${tool.slug.replace("impact-controlling/t-sroi", "t-sroi")}/`, linkLabel: "Regal öffnen" })),
  );
  for (const tool of tools.filter((item) => ["wirkungssteuergesetz", "impact-controlling", "impact-controlling/t-sroi", "scorecards", "woek-ids", "wirkungsrat"].includes(item.slug))) {
    const slug = tool.slug.replace("impact-controlling/t-sroi", "t-sroi");
    simpleLibraryPage(
      `werkstatt/arbeitsbibliothek/instrumente/${slug}/index.html`,
      `${tool.title} in der Arbeitsbibliothek`,
      tool.title,
      `Arbeitsmaterialien zum Werkzeug ${tool.title}.`,
      [
        { title: `Werkzeug ${tool.title}`, text: tool.text, href: `werkzeuge/${tool.slug}/`, linkLabel: "Werkzeug öffnen" },
        { title: "Referenzanker", text: "Passendes Kapitel oder Begriffsanker.", href: tool.anchor, linkLabel: "Referenz öffnen" },
        { title: "Downloads", text: "Bestehende Download-Bibliothek.", href: "downloads.html", linkLabel: "Downloads öffnen" },
      ],
    );
  }
}

function simpleLibraryPage(rel, title, h1, subtitle, cards) {
  page({
    rel,
    title: `${title} | Werkstatt der Wirkungsökonomie`,
    description: subtitle,
    searchSection: "Werkstatt",
    searchType: "Arbeitsbibliothek",
    body: (base) => `<section class="hero">
        <div>
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${href(base, "werkstatt/")}">Werkstatt</a><span aria-hidden="true">/</span><a href="${href(base, "werkstatt/arbeitsbibliothek/")}">Arbeitsbibliothek</a></nav>
          <p class="hero-kicker">Arbeitsbibliothek</p>
          <h1 class="hero-title">${h1}</h1>
          <p class="hero-subtitle">${subtitle}</p>
          ${printActions(base)}
        </div>
      </section>
      <section class="section" aria-labelledby="bibliothek-register">
        <div>
          <div class="section-header"><p class="hero-kicker">Materialien</p><h2 id="bibliothek-register">Zugeordnete Dokumente und Verweise</h2></div>
          ${cardGrid(base, cards)}
        </div>
      </section>
      ${exportBlock(base)}`,
  });
}

function run() {
  const written = [];
  written.push(fieldOverview());
  for (const field of fields) written.push(fieldPage(field));
  written.push(schoolPage());
  written.push(toolOverview());
  for (const tool of tools) written.push(toolPage(tool));
  workshopPages();
  console.log("Portal architecture pages generated.");
}

run();
