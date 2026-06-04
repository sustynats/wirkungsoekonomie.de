import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { StatusBadge } from "../lib/governance-components.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-05-24";
const CSS_VERSION = "20260524-portal-meta-readable";
const JS_VERSION = "20260523-nachhaltigkeit";
const SCHOOL_DOC = "public/downloads/originals/wirkungsoekonomisches_schulkonzept_arbeitsfassung_v0_1.docx";
const SCHOOL_ONLINE = "werkstatt/arbeitsbibliothek/wirkungsfelder/bildung/wirkungsschule/";
const SCHOOL_MD = "docs/bildung/Wirkungsschule_Fassung_v0_1.md";

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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function citeAnchor(id, label = "Zitierlink zu diesem Abschnitt") {
  return `<a class="cite-anchor no-print" href="#${id}" aria-label="${label}">#</a>`;
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
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260604-debate-use-order">
  </head>
  <body>
    ${placeholderHeader(base)}
    <main>
      <p class="print-meta">Wirkungsökonomie · ${title.replace(/\s+\|.*$/, "")} · ${canonical} · Druckdatum: 24.05.2026</p>
${body(base, route)}
    </main>
    <script src="${base}assets/js/main.js?v=20260604-debate-use-order}"></script>
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

function citationNotice(route) {
  return `<aside class="citation-note" role="note">
          <p class="card-kicker">Zitierfähig</p>
          <h2>Online lesen, gezielt zitieren</h2>
          <p>Diese Webfassung stellt neben dem Download stabile Abschnittsanker bereit. Der Link an einer Überschrift oder einem Absatz führt direkt zur zitierfähigen Stelle.</p>
          <p><a class="text-link" href="${route}">Kanonische Seitenadresse öffnen</a></p>
        </aside>`;
}

function markdownToReader(markdown) {
  const lines = markdown
    .replace(/\r\n/g, "\n")
    .replace(/^---[\s\S]*?---\n/, "")
    .split("\n");
  const toc = [];
  const html = [];
  const used = new Set();
  let paragraphCount = 0;

  function uniqueId(base) {
    let id = base || "abschnitt";
    let counter = 2;
    while (used.has(id)) {
      id = `${base}-${counter}`;
      counter += 1;
    }
    used.add(id);
    return id;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].replace(/\*\*/g, "").trim();
      if (level === 1) continue;
      const id = uniqueId(slugify(text));
      toc.push({ level, text, id });
      html.push(`<h${level} id="${id}">${escapeHtml(text)} ${citeAnchor(id)}</h${level}>`);
      continue;
    }
    if (/^\*\*.+\*\*$/.test(line)) {
      const text = line.replace(/^\*\*|\*\*$/g, "");
      const id = uniqueId(slugify(text));
      toc.push({ level: 3, text, id });
      html.push(`<h3 id="${id}">${escapeHtml(text)} ${citeAnchor(id)}</h3>`);
      continue;
    }
    paragraphCount += 1;
    const id = uniqueId(`absatz-${String(paragraphCount).padStart(3, "0")}`);
    html.push(`<p id="${id}">${escapeHtml(line)} ${citeAnchor(id, "Zitierlink zu diesem Absatz")}</p>`);
  }

  return { toc, html: html.join("\n") };
}

function tocList(base, toc) {
  return `<nav class="toc-card" aria-label="Inhaltsverzeichnis">
          <h2>Inhaltsverzeichnis</h2>
          <div class="toc-links">
            ${toc
              .map((item) => `<a class="toc-level-${item.level}" href="#${item.id}">${escapeHtml(item.text)}</a>`)
              .join("")}
          </div>
        </nav>`;
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
            <h2 id="book-anchors">Weiterführende Vertiefung</h2>
            <p>Die folgenden Kapitel und Referenzseiten vertiefen die Systemlogik der Wirkungsfelder.</p>
          </div>
          ${linkList(base, anchors)}
        </div>
      </section>`;
}

function exportBlock(base, pdfHref = "") {
  const dossier = pdfHref
    ? `<a class="btn btn-secondary" href="${href(base, pdfHref)}">Dossier herunterladen</a>`
    : "";
  return `<section class="section" aria-labelledby="export-title">
        <div class="card">
          <p class="hero-kicker">Vertiefung</p>
          <h2 id="export-title">Seite sichern oder weitergeben</h2>
          <p class="card-text">Diese Übersicht kann direkt gedruckt oder als Orientierung für die Vertiefungen genutzt werden.</p>
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
  .map((item) => {
    const lines = ['            <article class="card">'];
    if (item.kicker) lines.push(`              <p class="card-kicker">${item.kicker}</p>`);
    lines.push(`              <h3 class="card-title">${item.title}</h3>`);
    const textMarkup = String(item.text || "").includes("<div")
      ? `<div class="card-text">${item.text}</div>`
      : `<p class="card-text">${item.text}</p>`;
    lines.push(`              ${textMarkup}`);
    if (item.href) {
      lines.push(
        `              <div class="portal-card-actions"><a class="text-link" href="${href(base, item.href)}">${item.linkLabel || "Öffnen"}</a></div>`,
      );
    }
    lines.push("            </article>");
    return lines.join("\n");
  })
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
      ["Schule als Wirkungsraum", "Gebäude, Zeitstruktur, Beziehung, Ernährung, Gesundheit, Beteiligung, Ruhe, Sicherheit und Inklusion wirken auf Lernen."],
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
    docs: [{ label: "Wirkungsrente", href: "referenz/kapitel-058-wirkungsrente/" }, { label: "Kapitel Wirkungsrente", href: "referenz/kapitel-058-wirkungsrente/" }],
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
    docs: [
      { label: "Konzeptpapier Produktbesteuerung durch Wirkung", href: "wirkungsfelder/produkte-konsum/produktbesteuerung-durch-wirkung/" },
      { label: "Dossier Produkte & Konsum", href: "wirkungsfelder/produkte-konsum/dossier/" },
      { label: "Working Paper Produktbesteuerung", href: "assets/pdf/working-paper-produktbesteuerung-durch-wirkung.pdf" },
      { label: "Apfelbeispiel", href: "wirkungsfelder/produkte-konsum/apfelbeispiel/" },
    ],
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
    docs: [
      { label: "Wirkungsräume gestalten", href: "wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/" },
      { label: "Wirkungsräume gestalten Word", href: "assets/downloads/woek_medien_oeffentlichkeit_wirkungsraeume_gestalten_hosting_v1_0.docx" },
      { label: "Medien und Wirkung", href: "assets/pdf/medien-und-wirkung.pdf" },
      { label: "Dossier Medien und Demokratie", href: "blog/dossiers/medien-demokratie.html" },
    ],
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
    docs: [{ label: "Klima, Energie und Ressourcen", href: "wirkungsfelder/klima-energie-ressourcen/" }, { label: "Planet, Koexistenz statt Extraktion", href: "referenz/kapitel-027-planet-koexistenz-statt-extraktion/" }],
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
  const fieldChipMarkup = (field) => `<div class="sdg-chip-row" aria-label="SDG- und SDG+-Bezüge">${[
    ...field.sdgs.slice(0, 3),
    ...(field.plus || sdgPlusDefault).slice(0, 2).map((item) => `SDG+ ${item}`),
  ]
    .map((item) => `<span class="sdg-chip">${escapeHtml(item)}</span>`)
    .join("")}</div>`;

  return page({
    rel: "wirkungsfelder/index.html",
    title: "Wirkungsfelder der Wirkungsökonomie | Wirkungsoekonomie.de",
    description:
      "Die Wirkungsfelder zeigen, wie die Wirkungsökonomie Bildung, Gesundheit, Wohnen, Arbeit, Unternehmen, Produkte, Kapital, Demokratie, Medien, Wissenschaft und Kultur neu ordnet.",
    searchSection: "Wirkungsfelder",
    searchType: "Übersicht",
    body: (base, route) => `<section class="hero">
        <div class="hero-grid">
          <div>
            <p class="hero-kicker">Systemlandkarte</p>
            <h1 class="hero-title">Wirkungsfelder</h1>
            <p class="hero-subtitle">Lebens- und Systembereiche der Wirkungsökonomie</p>
            <p class="hero-text">Die Wirkungsökonomie ist kein einzelnes Instrument und keine lose Sammlung von Konzepten. Sie ist eine neue Steuerungslogik für gesellschaftliche Wirkungsfelder: Bildung, Gesundheit, Wohnen, Arbeit, Unternehmen, Produkte, Kapital, Demokratie, Medien, Wissenschaft, Kultur und ökologische Lebensgrundlagen. Jedes Wirkungsfeld fragt: Welche Zustandsveränderungen entstehen und wie können Preise, Regeln, Förderung, Kapital und Entscheidungen auf positive Netto-Wirkung für Mensch, Planet und Demokratie ausgerichtet werden?</p>
            ${printActions(base)}
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
            <p>Diese Übersicht zeigt zentrale Lebens- und Systembereiche, in denen die Wirkungsökonomie Wirkung sichtbar, bewertbar und in bessere Entscheidungen zurückführbar macht.</p>
          </div>
          ${cardGrid(
            base,
            fields.map((field) => ({
              kicker: "Wirkungsfeld",
              title: field.title,
              text: `${field.short}${fieldChipMarkup(field)}`,
              href: `wirkungsfelder/${field.slug}/`,
              linkLabel: "Wirkungsfeld öffnen",
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
    body: (base, route) => `<section class="hero">
        <div class="hero-grid">
          <div>
            <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${href(base, "wirkungsfelder/")}">Wirkungsfelder</a><span aria-hidden="true">/</span><span>${field.title}</span></nav>
            <p class="hero-kicker">Wirkungsfeld</p>
            <h1 class="hero-title">${data.pageTitle}</h1>
            <p class="hero-subtitle">${data.subtitle}</p>
            <p class="hero-text">${field.short}</p>
            ${printActions(base)}
          </div>
          <aside class="card">
            <p class="card-kicker">Leitplanke</p>
            <h2 class="card-title">Positive Netto-Wirkung wird entscheidungsrelevant.</h2>
            <p class="card-text">Wirkung kann positiv, negativ oder neutral sein. Dieses Portal fragt, welche Netto-Wirkung für Mensch, Planet und Demokratie entsteht und welche Risiken sichtbar bleiben müssen.</p>
          </aside>
        </div>
      </section>
      <section class="section" aria-labelledby="worum-geht-es">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Worum geht es?</p>
            <h2 id="worum-geht-es">Die zentrale Frage</h2>
            <p>${field.question}</p>
          </div>
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
      <section class="section" aria-labelledby="beispiel">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Beispiel</p>
            <h2 id="beispiel">Woran die Verschiebung sichtbar wird</h2>
            <p>Eine Entscheidung in diesem Wirkungsfeld ist nicht nur gut, weil sie Aktivität, Reichweite oder Geldflüsse erzeugt. Sie wird wirkungsökonomisch besser, wenn sie nachvollziehbar positive Folgen stärkt, negative Nebenwirkungen reduziert und Zielkonflikte offenlegt.</p>
          </div>
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
              : '<p class="card-text">Passende Beispiele und Methoden werden über die verknüpften Werkzeuge, Buchanker und Werkstatt-Dokumente erschlossen.</p>'
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
    body: (base, route) => `<section class="hero">
        <div class="hero-grid">
          <div>
            <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${href(base, "wirkungsfelder/")}">Wirkungsfelder</a><span aria-hidden="true">/</span><a href="${href(base, "wirkungsfelder/bildung/")}">Bildung</a><span aria-hidden="true">/</span><span>Wirkungsschule</span></nav>
            <p class="hero-kicker">Bildung</p>
            <h1 class="hero-title">Die Wirkungsschule</h1>
            <p class="hero-subtitle">Ein wirkungsökonomisches Schulkonzept für Zukunft, Demokratie, Selbstwirksamkeit und Wirkungskompetenz.</p>
            <p class="hero-text">Die Wirkungsschule ist kein einzelnes Fach, keine Nachhilfe-Reform und kein neues Etikett für alte Schule. Sie ist ein Schulkonzept, das Schule als Wirkungsraum versteht. Entscheidend ist nicht nur, welche Inhalte vermittelt werden, sondern welche Zustände Schule verändert: Selbstwirksamkeit, Urteilskraft, demokratische Mündigkeit, Gesundheit, Teilhabe, digitale Souveränität, Beziehung, Lernfreude und Zukunftsfähigkeit.</p>
            ${printActions(
              base,
              `<a class="btn btn-primary" href="${href(base, SCHOOL_ONLINE)}">Konzeptpapier online lesen</a>
              <a class="btn btn-secondary" href="${href(base, SCHOOL_DOC)}">Konzeptpapier herunterladen</a>`,
            )}
          </div>
          <aside class="card">
            <p class="card-kicker">Online-Fassung</p>
            <h2 class="card-title">Öffentliche Kurzfassung</h2>
            <p class="card-text">Diese Seite fasst die Logik verständlich zusammen und verweist auf das Konzeptpapier. Sie ersetzt keine vollständige Langfassung.</p>
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
                "Auch Räume wirken. Zeitstrukturen, Pausen, Ernährung, Gesundheit, Licht, Lärm, Beteiligung, Beziehung, Sicherheit und Inklusion beeinflussen Lernen. Eine Wirkungsschule betrachtet deshalb nicht nur Unterricht, sondern den ganzen Schulalltag: Wie fühlt sich Schule an? Wer wird gesehen? Wer wird beschämt? Wer kann mitgestalten? Welche Routinen stärken Vertrauen, Konzentration und Verantwortung?",
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
            <h2 id="konzeptpapier">Konzeptpapier Wirkungsschule online lesen und herunterladen ${citeAnchor("konzeptpapier")}</h2>
            <p class="card-text">Die Online-Fassung ist der erste Zugang zum Konzeptpapier. Die Word-Datei bleibt ergänzend als Downloadfassung erhalten.</p>
          </div>
          <div class="portal-card-actions no-print">
            <a class="btn btn-primary" href="${href(base, SCHOOL_ONLINE)}">Konzeptpapier online lesen</a>
            <a class="btn btn-secondary" href="${href(base, SCHOOL_DOC)}">Konzeptpapier herunterladen</a>
          </div>
        </div>
      </section>
      ${citationNotice(route)}
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

const methodClusters = [
  ["A", "Begriffe, Zielrahmen & Bewertungslogik", "Grundbegriffe und Zielrahmen: Was ist Wirkung, woran wird sie bewertet und was ist die Zielgröße?"],
  ["B", "Datenbasis & Operationalisierung", "Daten, IDs, Register, Quellen und Prüfbarkeit: Wie wird Wirkung adressierbar und belastbar?"],
  ["C", "Bewertungsinstrumente & Kennzahlen", "Aus Daten wird Bewertung: Scorecards, Benchmarks, FinalScore, NWI und Nichtkompensation."],
  ["D", "Impact Controlling & Transformationsmessung", "Bewertung in Management, Investition und Transformation übersetzen."],
  ["E", "Rückkopplung & Steuerung", "Wirkung wird in Preise, Steuern, Haushalt, Beschaffung, Förderung und Entscheidungen zurückgeführt."],
  ["F", "Kapital, Finanzierung & Risiko", "Kapitalflüsse, Portfolios, Fonds, Kredite, Versicherbarkeit und Automatisierungsdividenden nach Wirkung steuern."],
  ["G", "Governance, Qualitätssicherung & Lernen", "Institutionen, Audits, Versionierung und Schutzmechanismen sichern Qualität, Transparenz und Missbrauchsschutz."],
  ["H", "Demos, Rechner & Anwendungschecks", "Modellhafte Anwendungen zum Ausprobieren. Keine amtlichen Bewertungen, keine Beratung, keine Personenbewertung."],
].map(([key, title, text]) => ({ key, title, text }));

const legacyMethodMapTools = [
  ["Impact Controlling", "Dachmethode, die Wirkung in Steuerung, Controlling, Reporting, Risiko, Investition und Entscheidung übersetzt.", "A", "Methodik", "werkzeuge/impact-controlling/", ["T-SROI", "Scorecards", "KII statt KPI"]],
  ["T-SROI", "Transformationswirkung und Systemhebel im Verhältnis zum Ressourceneinsatz bewerten; nicht die operative Netto-Wirkungskennzahl.", "A", "Methodik", "werkzeuge/t-sroi/", ["Impact Controlling", "Wirkungsfonds", "Transformationswirkung"]],
  ["Benchmarks & Archetypen", "Branchen-, Produkt- und Organisationstypen in nachvollziehbare Bewertungsräume übersetzen.", "A", "Methodik", "werkzeuge/benchmarks-archetypen/", ["Scorecards", "WÖk-IDs", "Wirkungsrat"]],
  ["Reverse Merit Order", "Schutzregel: schwere negative Wirkung wird nicht durch positive Einzelwerte kompensiert.", "A", "Methodik", "werkzeuge/reverse-merit-order/", ["Scorecards", "Wirkungsrat", "Wirkungsumsatzsteuer"], "Rote Linien nicht kompensieren."],
  ["Wirkungsrat", "Institution zur Pflege von WÖk-IDs, Benchmarks, Archetypen, Evaluation und Missbrauchsschutz.", "A", "Methodik", "werkzeuge/wirkungsrat/", ["Wirkungsregister", "Wirkungsaudit", "Benchmarks & Archetypen"]],
  ["Netto-Wirkungs-Index", "Operative Netto-Wirkungskennzahl zur Einordnung positiver, negativer und neutraler Wirkung im WÖk-Rahmen.", "B", "Methodik", "werkzeuge/netto-wirkungs-index/", ["Scorecards", "WÖk-IDs", "T-SROI"]],
  ["Scorecards", "Zustandsveränderungen, Nebenwirkungen, Datenqualität und Zielkonflikte entscheidungsfähig machen.", "B", "Methodik", "werkzeuge/scorecards/", ["NWI", "Benchmarks & Archetypen", "Reverse Merit Order"]],
  ["Produktscorecards", "Produkt-, Lieferketten- und Benchmarkdaten in Scores, Datenqualität und FinalScore übersetzen.", "B", "Methodik", "werkzeuge/produktscorecards/", ["Wirkungsumsatzsteuer", "Digitale Produktpässe", "Produktwirkungsrechner"]],
  ["KII statt KPI", "Klassische KPIs um Zustandsveränderungen, Nebenwirkungen und Rückkopplungen ergänzen.", "B", "Methodik", "werkzeuge/kii-statt-kpi/", ["Impact Controlling", "Unternehmens-Wirkungscheck", "Wirkungsrisiko-Matrix"]],
  ["Wirkungsrisiko-Matrix", "Risiken nach Eintritt, Verwundbarkeit, Folgewirkung, Nichtkompensation und demokratischer Korrekturfähigkeit ordnen.", "B", "Methodik", "werkzeuge/wirkungsrisiko-matrix/", ["Hybrid-Risk-Radar", "KI-Wirkungsrisiko-Check", "Resilienz-Radar Kommune"]],
  ["Produktwirkungsrechner", "Modellhafte Demo für FinalScore, Wirkungssteuersatz und Bruttopreis.", "B", "Demo", "erleben/produktwirkungsrechner/", ["Produktscorecards", "Wirkungsumsatzsteuer", "Reverse Merit Order"], "Modellhaft, nicht amtlich, keine Beratung."],
  ["Scorecard-Dashboard", "Interaktive Scorecard-Demo für Bewertungslogik, Dimensionen und Ergebnisdarstellung.", "B", "Demo", "scorecard-dashboard.html", ["Scorecards", "NWI", "Produktscorecards"], "Modellhaft, keine amtliche Bewertung."],
  ["WÖk-Scanner", "Strukturierter Einstieg für Produkte, Unternehmen, Aussagen oder Wirkungspfade.", "B", "Demo", "anwendungen/scanner.html", ["Produktwirkungsrechner", "Medienwirkungscheck", "Unternehmens-Wirkungscheck"], "Modellhaft, keine Beratung und keine automatische Entscheidung."],
  ["Impact-Controlling-Rechner", "Einfache Demo für Scorecard, Netto-Wirkungs-Index und T-SROI.", "B", "Demo", "erleben/impact-controlling-rechner/", ["Impact Controlling", "NWI", "T-SROI"], "Modellhaft, keine Prüfung und keine Beratung."],
  ["Unternehmens-Wirkungscheck", "Prüf- und Lernwerkzeug für Unternehmenswirkung, Risiko, Lieferketten, KII und Transformation.", "B", "Demo", "werkzeuge/unternehmens-wirkungscheck/", ["Impact Controlling", "KII statt KPI", "ESG-zu-WÖk-Mapping"], "Keine Unternehmens- oder Personenbewertung."],
  ["Wohnwirkungsrechner WIX-Wohn", "Modellhafte Demo für Mietbelastung, Energie, Gebäudescore, Sozialraum und WIX-Wohn.", "B", "Demo", "erleben/wohnwirkungsrechner/", ["Sozialraum-Resilienzprofil", "Wirkungshaushalt", "Versicherbarkeits-/Resilienzcheck"], "Modellhaft, keine Rechts- oder Förderberatung."],
  ["Stranded-Asset-Check Wohnen", "Ergänzende Wohn-Demo für Sanierungsdruck, Risiko und Wertstabilität.", "B", "Demo", "erleben/wohnwirkungsrechner/stranded-asset-check/", ["Wohnwirkungsrechner WIX-Wohn", "Versicherbarkeits-/Resilienzcheck", "Wirkungsrisiko-Matrix"], "Modellhaft, keine Anlage- oder Immobilienberatung."],
  ["Vermieter-Check", "Ergänzende Wohn-Demo für Vermietung, Bezahlbarkeit, Sanierung und Quartierswirkung.", "B", "Demo", "erleben/wohnwirkungsrechner/vermieter-check/", ["Wohnwirkungsrechner WIX-Wohn", "Sozialraum-Resilienzprofil", "Wirkungshaushalt"], "Modellhaft, keine Rechts- oder Steuerberatung."],
  ["Wirkungsschule-Check", "Schulentwicklung wirkungsorientiert prüfen: Kompetenzen, Förderung, Räume, Demokratiepraxis und Datenethik.", "B", "Demo", "erleben/wirkungsschule-check/", ["Bildungswirkungsindex", "Schulraum-Wirkungscheck", "Wirkungsportfolio"], "Keine Bewertung von Kindern oder Lehrkräften."],
  ["Wirkungsförderungs-Check", "Präventive Förderung, Potenzialförderung, Mentoring und Teilhabe würdig strukturieren.", "B", "Demo", "erleben/wirkungsfoerderungs-check/", ["Wirkungsschule-Check", "Wirkungsportfolio", "Zugehörigkeits- und Teilgabeindex"], "Keine Personenbewertung."],
  ["Fach-Zukunft-Modulgenerator", "Fächer, lokale Fragen, SDGs/SDG+ und Ergebnisformate zu einem Lernfeld Zukunft verbinden.", "B", "Demo", "erleben/fach-zukunft-generator/", ["Wirkungsschule-Check", "Wirkungsportfolio", "Open-Science-Check"]],
  ["Wirkungsportfolio-Generator", "Lernwege, Projektarbeit, Feedback und Reflexion strukturieren, ohne Kinder zu ranken.", "B", "Demo", "erleben/wirkungsportfolio-generator/", ["Wirkungsportfolio", "Bildungswirkungsindex", "Wirkungsförderungs-Check"], "Keine Ranglisten, keine Personenbewertung."],
  ["Wirkungsportfolio", "Bewertungs- und Entwicklungsinstrument für Bildung, Organisationen oder Projekte.", "B", "Methodik", "werkzeuge/wirkungsportfolio/", ["Wirkungsportfolio-Generator", "Wirkungsschule-Check", "Scorecards"]],
  ["Bildungswirkungsindex / BWK", "Bildungswirkung auf Wissen, Selbstwirksamkeit, Demokratie, Gesundheit, Teilhabe und Resilienz strukturieren.", "B", "Methodik", "werkzeuge/bildungswirkungsindex-bwk/", ["Wirkungsschule-Check", "Schulraum-Wirkungscheck", "Wirkungsportfolio"], "Keine Bewertung einzelner Schüler:innen."],
  ["Schulraum-Wirkungscheck", "Räume, Zeit, Bewegung, Ernährung, Hitzeschutz, Barrierefreiheit und Sicherheit als Bildungswirkung prüfen.", "B", "Methodik", "werkzeuge/schulraum-wirkungscheck/", ["Bildungswirkungsindex", "Wirkungsschule-Check", "Sozialraum-Resilienzprofil"]],
  ["Forschungs-Wirkungscheck", "Forschung nach Mission, Integrität, Transfer, Replikation und Wirkungsbeitrag strukturieren.", "B", "Demo", "werkzeuge/forschungs-wirkungscheck/", ["Open-Science-Check", "Innovations-Wirkungsportfolio", "Wissensrat-/Integritätsregister"]],
  ["Open-Science- und Replikationscheck", "Offenheit, Replizierbarkeit, Datenzugang und wissenschaftliche Integrität prüfen.", "B", "Demo", "werkzeuge/open-science-und-replikationscheck/", ["Forschungs-Wirkungscheck", "Wissensrat-/Integritätsregister", "Datenqualität & Assurance"]],
  ["WÖk-IDs", "Referenzrahmen, Datenquellen, Einheiten, Schwellen, Versionen und Prüfstatus verbinden.", "C", "Methodik", "werkzeuge/woek-ids/", ["Scorecards", "Datenqualität & Assurance", "Wirkungsdatenräume"]],
  ["Datenqualität & Assurance", "Datenqualität, Prüfstatus und Assurance sichern, damit Wirkungsdaten belastbar bleiben.", "C", "Methodik", "werkzeuge/datenqualitaet-assurance/", ["WÖk-IDs", "Wirkungsaudit", "Digitale Produktpässe"], "Datenqualität sichtbar machen."],
  ["Digitale Produktpässe", "Produkt-, Lieferketten- und Prüfdaten als Nachweis- und Lerninfrastruktur vorbereiten.", "C", "In Vorbereitung", "werkzeuge/digitale-produktpaesse/", ["Produktscorecards", "Wirkungsdatenräume", "Datenqualität & Assurance"], "Vorbereitete Methodenseite, keine amtliche Produktklassifikation."],
  ["Wirkungsdatenräume", "Interoperable Datenräume für Wirkungsdaten, Zugriffsrechte, Versionierung und Prüfbarkeit vorbereiten.", "C", "In Vorbereitung", "werkzeuge/wirkungsdatenraeume/", ["WÖk-IDs", "Digitale Produktpässe", "Datenraum-Reifegradcheck"], "Vorbereitete Methodenseite, keine Datenfreigabeentscheidung."],
  ["Digitale Produktpässe und Wirkungsdatenräume", "Bestehende gemeinsame Methodenseite für Produkt-, Lieferketten-, Prüf- und Wirkungsinformationen.", "C", "Methodik", "werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/", ["Digitale Produktpässe", "Wirkungsdatenräume", "Produktscorecards"]],
  ["Datenraum-Reifegradcheck", "Reifegrad von Datenräumen für Wirkung, Interoperabilität, Governance und Anschlussfähigkeit prüfen.", "C", "Demo", "werkzeuge/datenraum-reifegradcheck/", ["Wirkungsdatenräume", "WÖk-IDs", "Datenqualität & Assurance"]],
  ["Digital-Souveränitätscheck", "Digitale Souveränität, Abhängigkeiten, Datenrechte und öffentliche Handlungsfähigkeit prüfen.", "C", "Demo", "werkzeuge/digital-souveraenitaetscheck/", ["Cyberresilienz-Check", "Kritische-Infrastruktur-Monitor", "Wirkungsdatenräume"]],
  ["Cyberresilienz-Check", "Wiederherstellungsfähigkeit, Datenintegrität, Backups, Incident Response und analoge Rückfallebenen bewerten.", "C", "Methodik", "werkzeuge/cyberresilienz-check/", ["Digital-Souveränitätscheck", "Kritische-Infrastruktur-Monitor", "Hybrid-Risk-Radar"]],
  ["Kritische-Infrastruktur-Monitor", "Energie, Wasser, Gesundheit, Verwaltung, Daten, Verkehr und Kommunikation nach Ausfallwirkung prüfen.", "C", "Methodik", "werkzeuge/kritische-infrastruktur-monitor/", ["Infrastruktur-Stabilitätsindex", "Cyberresilienz-Check", "Resilienz-Radar Kommune"]],
  ["Infrastruktur-Stabilitätsindex", "Stabilität, Redundanz, Rückfallebenen, Wartungszustand und Abhängigkeiten kritischer Infrastruktur verdichten.", "C", "Methodik", "werkzeuge/infrastruktur-stabilitaetsindex/", ["Kritische-Infrastruktur-Monitor", "Resilienz-Radar Kommune", "Wirkungshaushalt"]],
  ["Wirkungsregister", "Öffentlich prüfbares Register für Methodenstände, Indikatoren, Versionen, Audits und Korrekturen vorbereiten.", "C", "In Vorbereitung", "werkzeuge/wirkungsregister/", ["Wirkungsrat", "Wirkungsaudit", "WÖk-IDs"], "Vorbereitete Registerlogik, keine amtliche Entscheidung."],
  ["Wissensrat-/Integritätsregister", "Wissenschaftliche Integrität, Replikation, Quellenlage und Registerlogik strukturieren.", "C", "Demo", "werkzeuge/wissensrat-integritaetsregister/", ["Open-Science-Check", "Wirkungsregister", "Forschungs-Wirkungscheck"]],
  ["Wirkungsumsatzsteuer", "Produkt- und Leistungswirkung modellhaft an Steuer- und Preislogik rückkoppeln.", "D", "Methodik", "werkzeuge/wirkungsumsatzsteuer/", ["Produktscorecards", "Reverse Merit Order", "Wirkungssteuergesetz"], "Keine Steuerberatung."],
  ["Wirkungssteuergesetz WStG", "Wirkung als steuerliche Bemessungs- und Steuerungslogik rahmen.", "D", "Methodik", "werkzeuge/wirkungssteuergesetz/", ["Wirkungsumsatzsteuer", "Wirkungseinkommensteuer", "Wirkungshaushalt"], "Keine Rechts- oder Steuerberatung."],
  ["Wirkungseinkommensteuer", "Einkommen nach Höhe, Entstehungskontext und Wirkung bewerten.", "D", "Methodik", "werkzeuge/wirkungseinkommensteuer/", ["Maschinenwertschöpfungsbeitrag", "Automatisierungsdividende", "Wirkungsfonds"], "Keine Steuerberatung."],
  ["Wirkungshaushalt", "Öffentliche Mittel nach Prävention, Resilienz, Zielgruppenwirkung und positiver Netto-Wirkung betrachten.", "D", "Methodik", "werkzeuge/wirkungshaushalt/", ["Öffentliche Beschaffung", "Wirkungsregister", "Wirkungsrat"], "Keine Förderentscheidung."],
  ["Gesundheitswirkungscheck", "Programme, Räume oder Maßnahmen nach Gesundheitsgewinn, Prävention, Teilhabe, Resilienz, Datenqualität und Nebenwirkungen prüfen.", "D", "Methodik", "wirkungsfelder/gesundheit-pflege/tools/gesundheitswirkungscheck/", ["Präventionswirkungslogik", "Pflegewirkungscheck", "T-SROI"], "Keine medizinische Beratung und keine Personenbewertung."],
  ["Präventionswirkungslogik", "Vermiedene Schäden, Lebensqualitätsnutzen, Resilienzbeitrag, Umsetzungskosten und Unsicherheit modellhaft sichtbar machen.", "D", "Methodik", "wirkungsfelder/gesundheit-pflege/tools/praeventionswirkungsrechner/", ["Gesundheitswirkungscheck", "Wirkungshaushalt", "T-SROI"], "Modellhaft, keine Diagnose und keine Beratung."],
  ["Öffentliche Beschaffung", "Beschaffung nach Wirkung, Datenqualität, Rechtsschutz und demokratischer Kontrolle vorbereiten.", "D", "In Vorbereitung", "werkzeuge/oeffentliche-beschaffung/", ["Wirkungshaushalt", "Wirkungsregister", "Datenqualität & Assurance"], "Vorbereitet, keine Vergabe- oder Förderentscheidung."],
  ["Wirkungsaudit", "Prüfpfade, Datenqualität, rote Linien, Korrekturwege und Assurance als Auditlogik vorbereiten.", "D", "In Vorbereitung", "werkzeuge/wirkungsaudit/", ["Datenqualität & Assurance", "Wirkungsregister", "Wirkungsrat"], "Vorbereitet, keine Zertifizierung."],
  ["Maschinenwertschöpfungsbeitrag", "Automatisierte Wertschöpfung in soziale Sicherung und Wirkungsfonds rückkoppeln.", "D", "Methodik", "werkzeuge/maschinenwertschoepfungsbeitrag/", ["Automatisierungsdividende", "Wirkungseinkommensteuer", "Wirkungsfonds"]],
  ["Automatisierungsdividende", "Produktivitätsgewinne in Grundsicherheit, Weiterbildung, Wirkungsfonds und Transformationsschutz verteilen.", "D", "Methodik", "werkzeuge/automatisierungsdividende/", ["Maschinenwertschöpfungsbeitrag", "Wirkungsfonds", "Wirkungsrenten-Rechner"]],
  ["Automatisierungsdividenden-Rechner", "Modellhafte Rechnerseite für Automatisierungsdividende, Finanzsystem und Kapital.", "D", "Demo", "werkzeuge/automatisierungsdividenden-rechner/", ["Automatisierungsdividende", "Wirkungsfonds", "Maschinenwertschöpfungsbeitrag"], "Modellhaft, keine Anlage- oder Förderberatung."],
  ["Automatisierungs- und Wirkungseinkommensrechner", "Modellhafte Demo zu Beitragslücke, Maschinenwertschöpfungsbeitrag, Transformationsbonus und Wirkungseinkommen.", "D", "Demo", "erleben/automatisierungs-wirkungseinkommensrechner/", ["Automatisierungsdividende", "Wirkungseinkommensteuer", "Wirkungsfonds"], "Modellhaft, keine Sozial- oder Steuerberatung."],
  ["Wirkungsrenten-Rechner", "Modellhafte Demo zu Basisrente, Lebenswirkungs-Faktor, Wirkungsdividende und Fondsanteil.", "D", "Demo", "erleben/wirkungsrenten-rechner/", ["Wirkungsfonds", "Automatisierungsdividende", "Wirkungseinkommensteuer"], "Modellhaft, keine Renten- oder Anlageberatung."],
  ["Resilienz-Radar Kommune", "Kommunales Lagebild aus Risiko-, Infrastruktur-, Klima-, Sozialraum-, Cyber- und Vertrauensdaten.", "D", "Methodik", "werkzeuge/resilienz-radar-kommune/", ["Wirkungshaushalt", "Kritische-Infrastruktur-Monitor", "Sozialraum-Resilienzprofil"]],
  ["Sozialraum-Resilienzprofil", "Lokale Resilienz in Quartieren: Anlaufstellen, Nachbarschaft, Gesundheit, Pflege, Hitze, Wasser und Teilhabe.", "D", "Methodik", "werkzeuge/sozialraum-resilienzprofil/", ["Wohnwirkungsrechner", "Resilienz-Radar Kommune", "Wirkungshaushalt"]],
  ["Zugehörigkeits- und Teilgabeindex", "Zugangs- und Mitgestaltungschancen in lokalen Resonanzräumen sichtbar machen.", "D", "Methodik", "werkzeuge/zugehoerigkeits-und-teilgabeindex/", ["Sozialraum-Resilienzprofil", "Integrations-Infrastruktur-Score", "Wirkungsförderungs-Check"], "Keine Bewertung einzelner Personen."],
  ["Integrations-Infrastruktur-Score", "Sprache, Bildung, Verwaltung, Wohnen, Gesundheit, Arbeit und Partizipation als Infrastruktur prüfen.", "D", "Methodik", "werkzeuge/integrations-infrastruktur-score/", ["Sozialraumprofil Migration", "Arbeitsmarkt-Wirkungsmonitor Migration", "Diskursrisiko-Radar Migration"], "Keine Bewertung einzelner Menschen."],
  ["Kommunale Integrationsarchitektur-Check", "Kommunale Strukturen für Integration, Gemeinwesenarbeit, Konfliktmoderation und Beteiligung prüfen.", "D", "Methodik", "werkzeuge/kommunale-integrationsarchitektur-check/", ["Integrations-Infrastruktur-Score", "Sozialraumprofil Migration", "Resilienz-Radar Kommune"]],
  ["Sozialraumprofil Migration und Vielfalt", "Kommunale Sozialräume nach Wohnen, Bildung, Gesundheit, Sicherheit, Teilhabe und digitalem Zugang bewerten.", "D", "Methodik", "werkzeuge/sozialraumprofil-migration-vielfalt/", ["Integrations-Infrastruktur-Score", "Kommunale Integrationsarchitektur-Check", "Zugehörigkeits- und Teilgabeindex"], "Keine Personenbewertung."],
  ["Arbeitsmarkt-Wirkungsmonitor Migration", "Fachkräfteintegration, Anerkennung, faire Arbeit, Ausbeutungsschutz und Ausbildung bewerten.", "D", "Methodik", "werkzeuge/arbeitsmarkt-wirkungsmonitor-migration/", ["Integrations-Infrastruktur-Score", "Diskursrisiko-Radar Migration", "Wirkungseinkommensteuer"]],
  ["Wirkungsfonds", "Fondsarchitektur für Automatisierungsdividende, Wirkungseinkommen, Bildung, Gesundheit, Wohnen, Rente und Demokratie.", "E", "Methodik", "werkzeuge/wirkungsfonds/", ["Wirkungsfonds-Simulator", "Wirkungskredit-Rechner", "Kapitalwirkungscheck"], "Keine Anlageberatung."],
  ["Wirkungsfonds-Simulator", "Modellhafte Simulation für Fondsarchitektur, Kapitalwirkung und Rückkopplung.", "E", "Demo", "werkzeuge/wirkungsfonds-simulator/", ["Wirkungsfonds", "Automatisierungsdividende", "Wirkungsrenten-Rechner"], "Modellhaft, keine Anlageberatung."],
  ["Kapitalwirkungscheck", "Kapitalwirkung, Risiko, Transformationsbeitrag und Wirkungspfad modellhaft prüfen.", "E", "Demo", "werkzeuge/kapitalwirkungscheck/", ["Portfolio-Wirkungsrating", "Wirkungskredit-Rechner", "Wirkungsfonds"], "Keine Anlage- oder Kreditberatung."],
  ["Portfolio-Wirkungsrating", "Portfolios nach Wirkung, Risiko, Resilienz und Transformationsbeitrag modellhaft einordnen.", "E", "Demo", "werkzeuge/portfolio-wirkungsrating/", ["Kapitalwirkungscheck", "ESG-zu-WÖk-Mapping", "Wirkungsfonds"], "Keine Anlageentscheidung."],
  ["Wirkungskredit-Rechner", "Wirkung, Risiko und Finanzierungskonditionen modellhaft verbinden.", "E", "Demo", "werkzeuge/wirkungskredit-rechner/", ["Kapitalwirkungscheck", "Wirkungsfonds", "Datenqualität & Assurance"], "Keine Kreditentscheidung."],
  ["Versicherbarkeits-/Resilienzcheck", "Versicherbarkeit, Resilienz und Risikoreduktion modellhaft prüfen.", "E", "Demo", "werkzeuge/versicherbarkeits-resilienzcheck/", ["Wirkungsrisiko-Matrix", "Kapitalwirkungscheck", "Resilienz-Radar Kommune"], "Keine Versicherungsberatung."],
  ["ESG-zu-WÖk-Mapping", "ESG-Daten in WÖk-Logik, WÖk-IDs, Scorecards und positive Netto-Wirkung übersetzen.", "E", "Demo", "werkzeuge/esg-zu-woek-mapping/", ["WÖk-IDs", "Scorecards", "Portfolio-Wirkungsrating"]],
  ["Innovations-Wirkungsportfolio", "Innovationen nach Wirkungsbeitrag, Lernfähigkeit, Risiko und Skalierungslogik ordnen.", "E", "Demo", "werkzeuge/innovations-wirkungsportfolio/", ["Forschungs-Wirkungscheck", "Kapitalwirkungscheck", "T-SROI"]],
  ["Medienwirkungscheck", "Quellenklarheit, Kontext, Korrekturwege, Manipulationstransparenz und Reichweitenverantwortung prüfen.", "F", "Methodik", "werkzeuge/medienwirkungscheck/", ["Medienwirkungscheck Demo", "Sprach- und Framing-Analyse", "Plattform-Wirkungscheck"], "Keine Personen- oder Gesinnungsbewertung."],
  ["Medienwirkungscheck Demo", "Modellhafte Demo zum Medienwirkungsindex MWIX und öffentlicher Wirkungsqualität.", "F", "Demo", "erleben/medienwirkungscheck/", ["Medienwirkungscheck", "Sprach- und Framing-Analyse", "Desinformations-Risikocheck"], "Modellhaft, nicht amtlich, keine Personenbewertung."],
  ["Sprach- und Framing-Analyse", "Sprache, Frames, Tonalität und Diskurswirkung sichtbar machen, ohne Meinungen zu bewerten.", "F", "Methodik", "werkzeuge/sprach-und-framing-analyse/", ["Medienwirkungscheck", "Politische Wirkungsprüfung", "Diskursrisiko-Radar Migration"], "Keine Bewertung von Gesinnungen oder Personen."],
  ["Plattform-Wirkungscheck", "Empfehlungslogik, Datenzugang, Werbetransparenz, Jugend- und Grundrechtsschutz prüfen.", "F", "Methodik", "werkzeuge/plattform-wirkungscheck/", ["Medienwirkungscheck", "Desinformations-Risikocheck", "Digital-Souveränitätscheck"], "Keine automatische Sperrentscheidung."],
  ["Desinformations-Risikocheck", "Täuschung, Koordination, KI-Einsatz, Reichweite, Zeitkritik und demokratisches Schadenspotenzial strukturieren.", "F", "Methodik", "werkzeuge/desinformations-risikocheck/", ["Medienwirkungscheck", "Hybrid-Risk-Radar", "Plattform-Wirkungscheck"], "Keine Personenbewertung."],
  ["Politische Wirkungsprüfung", "Erst-, Zweit- und Drittwirkungen politischer Maßnahmen sichtbar machen, ohne Parteien moralisch zu sortieren.", "F", "Methodik", "werkzeuge/politische-wirkungspruefung/", ["Wirkungshaushalt", "Sprach- und Framing-Analyse", "Wirkungsrat"], "Keine Wahl- oder Parteienbewertung."],
  ["Diskursrisiko-Radar Migration", "Narrative, Feindseligkeit, Polarisierung, Desinformation und Diskursqualität beobachten.", "F", "Methodik", "werkzeuge/diskursrisiko-radar-migration/", ["Sprach- und Framing-Analyse", "Desinformations-Risikocheck", "Sozialraumprofil Migration"], "Keine Personenbewertung."],
  ["Hybrid-Risk-Radar", "Kombinierte Wirkungsrisiken aus Desinformation, Cyberangriffen, Sabotage, Polarisierung und wirtschaftlichem Druck erkennen.", "F", "Methodik", "werkzeuge/hybrid-risk-radar/", ["Cyberresilienz-Check", "Desinformations-Risikocheck", "Kritische-Infrastruktur-Monitor"]],
  ["KI-Wirkungsrisiko-Check", "Algorithmische Verantwortung, Datenqualität, Bias, Erklärbarkeit und gesellschaftliche Folgewirkung prüfen.", "F", "Demo", "werkzeuge/ki-wirkungsrisiko-check/", ["Plattform-Wirkungscheck", "Datenqualität & Assurance", "Digital-Souveränitätscheck"], "Keine automatische Entscheidung."],
];

const methodPipeline = [
  ["A", "Begriffe & Zielrahmen"],
  ["B", "Daten & IDs"],
  ["C", "Bewertung & Kennzahlen"],
  ["D", "Controlling & Transformation"],
  ["E", "Rückkopplung & Steuerung"],
  ["G", "Governance & Lernen"],
  ["H", "Demos & Anwendung"],
];

const cardsToRestoreOrPrepare = [
  {
    title: "Wirkung",
    text: "Wirkung ist neutral und relational: Sie beschreibt Zustandsveränderungen, Nebenwirkungen und Wechselwirkungen in einem definierten Wirkungsraum.",
    cluster: "A",
    status: "Live",
    target: "begriffe/wirkung/",
    types: ["Grundbegriff"],
    related: ["Wirkungsbewertung", "Netto-Wirkung", "Wirkungsraum"],
  },
  {
    title: "Wirkungspotenzial",
    text: "Wirkungspotenzial beschreibt mögliche, noch nicht eingetretene Wirkung und bleibt von nachgewiesener Wirkung getrennt.",
    cluster: "A",
    status: "Live",
    target: "begriffe/wirkungspotenzial/",
    types: ["Grundbegriff"],
    related: ["Wirkung", "Wirkungsrisiko", "Wirkungsbewertung"],
  },
  {
    title: "Wirkungsrisiko",
    text: "Wirkungsrisiko macht sichtbar, wo erwartete Wirkungen ausbleiben, negative Nebenwirkungen entstehen oder rote Linien berührt werden.",
    cluster: "A",
    status: "Live",
    target: "begriffe/wirkungsrisiko/",
    types: ["Grundbegriff", "Bewertungslogik"],
    related: ["Wirkungsrisiko-Matrix", "Reverse Merit Order", "Datenqualität & Assurance"],
  },
  {
    title: "Wirkungsbewertung",
    text: "Wirkungsbewertung ordnet positive, neutrale und negative Wirkungen im Referenzrahmen von SDGs, Agenda 2030 und SDG+ ein.",
    cluster: "A",
    status: "Live",
    target: "begriffe/wirkungsbewertung/",
    types: ["Bewertungslogik"],
    related: ["Scorecards", "SDGs / Agenda 2030", "SDG+"],
  },
  {
    title: "Netto-Wirkung",
    text: "Netto-Wirkung beschreibt die zusammengeführte Bewertung positiver, negativer und neutraler Wirkungen in einem definierten Wirkungsraum. Sie berücksichtigt Nebenwirkungen, Datenqualität, Systemkontext, Zeitwirkung und Nichtkompensation.",
    cluster: "A",
    status: "Live",
    target: "begriffe/netto-wirkung/",
    types: ["Grundbegriff", "Bewertungslogik"],
    related: ["NWI", "Scorecards", "Reverse Merit Order", "Positive Netto-Wirkung", "Wirkungsbewertung"],
    notice: "Netto-Wirkung ist keine einfache Addition. Schwere negative Wirkung darf nicht durch positive Einzelwerte verdeckt werden.",
  },
  {
    title: "Positive Netto-Wirkung",
    text: "Positive Netto-Wirkung ist die Zielgröße der Wirkungsökonomie: eine tragfähige Gesamtwirkung für Mensch, Planet und Demokratie, ohne schwere negative Wirkungen zu verdecken.",
    cluster: "A",
    status: "Live",
    target: "begriffe/positive-netto-wirkung/",
    types: ["Zielrahmen"],
    related: ["Netto-Wirkung", "SDG+", "Mensch, Planet, Demokratie", "Wirkungsbewertung"],
  },
  {
    title: "Mensch, Planet, Demokratie",
    text: "Mensch, Planet und Demokratie bilden die Zielbrücke, an der positive Netto-Wirkung in der Wirkungsökonomie ausgerichtet wird.",
    cluster: "A",
    status: "Live",
    target: "begriffe/mensch-planet-demokratie/",
    types: ["Zielrahmen"],
    related: ["Positive Netto-Wirkung", "SDG+", "Wirkungsraum"],
  },
  {
    title: "SDGs / Agenda 2030",
    text: "Die SDGs und die Agenda 2030 bilden den globalen Referenzrahmen, an den die WÖk ihre Bewertungslogik anschließt.",
    cluster: "A",
    status: "Live",
    target: "begriffe/sdgs/",
    types: ["Zielrahmen"],
    related: ["SDG+", "Wirkungsbewertung", "Positive Netto-Wirkung"],
  },
  {
    title: "SDG+",
    text: "SDG+ ist die transparente Erweiterung der Wirkungsökonomie für blinde Flecken wie Demokratiequalität, Resilienz, digitale Souveränität und Nichtkompensation. SDG+ ist keine offizielle UN-Kategorie.",
    cluster: "A",
    status: "Live",
    target: "begriffe/sdg-plus/",
    types: ["Zielrahmen"],
    related: ["SDGs / Agenda 2030", "Mensch, Planet, Demokratie", "Wirkungsgrenzen"],
    notice: "SDG+ ergänzt den WÖk-Referenzrahmen transparent und ist nicht amtlich.",
  },
  {
    title: "Wirkungsraum",
    text: "Der Wirkungsraum beschreibt, wo eine Wirkung entsteht, wen sie betrifft, welche Zeiträume gelten und welche Nebenwirkungen sichtbar bleiben müssen.",
    cluster: "A",
    status: "Live",
    target: "begriffe/wirkungsraum/",
    types: ["Grundbegriff", "Bewertungslogik"],
    related: ["Netto-Wirkung", "Wirkungsgrenzen", "Nichtkompensationsprinzip"],
  },
  {
    title: "Wirkungsgrenzen",
    text: "Wirkungsgrenzen markieren rote Linien, Mindestbedingungen und Bereiche, in denen positive Einzelwerte schwere negative Wirkung nicht ausgleichen dürfen.",
    cluster: "A",
    status: "Begriffsseite in Rekonstruktion",
    target: null,
    types: ["Bewertungslogik"],
    related: ["Reverse Merit Order", "Nichtkompensationsprinzip", "Wirkungsrisiko"],
  },
  {
    title: "Nichtkompensationsprinzip",
    text: "Das Nichtkompensationsprinzip verhindert, dass schwere negative Wirkung durch positive Einzelwerte unsichtbar gemacht wird.",
    cluster: "A",
    status: "Live",
    target: "begriffe/nichtkompensationsprinzip/",
    types: ["Bewertungslogik"],
    related: ["Reverse Merit Order", "Wirkungsgrenzen", "Netto-Wirkung"],
  },
  {
    title: "NACE-Mapping",
    text: "NACE-Mapping verbindet Branchenlogik mit WÖk-IDs, Wirkungsfeldern und Datenquellen.",
    cluster: "B",
    status: "In Vorbereitung",
    target: null,
    types: ["Dateninstrument"],
    related: ["WÖk-IDs", "Datenquellen", "Scorecards"],
  },
  {
    title: "WÖk-ID-Register",
    text: "Das öffentliche Forschungsregister macht WÖk-IDs, Quellen, Berechnungslogiken, Datenqualität und Reviewstatus nachvollziehbar.",
    cluster: "B",
    status: "Public Research",
    target: "werkzeuge/woek-id-register/",
    types: ["Register", "Dateninstrument"],
    related: ["WÖk-IDs", "Quellenkatalog", "Datenqualität & Assurance"],
    notice: "Öffentliches Forschungsregister, nicht amtlich und kein finaler Standard.",
  },
  {
    title: "SDG+-Register",
    text: "Das SDG+-Register bereitet die WÖk-Erweiterungen des Referenzrahmens transparent, versionierbar und kritisierbar auf.",
    cluster: "B",
    status: "In Vorbereitung",
    target: null,
    types: ["Register"],
    related: ["SDG+", "WÖk-ID-Register", "Wirkungsrat"],
  },
  {
    title: "Datenquellen",
    text: "Datenquellen bündeln Reporting-, Produkt-, Lieferketten-, Register- und Alltagsdaten für prüfbare Wirkungsbewertungen.",
    cluster: "B",
    status: "In Vorbereitung",
    target: null,
    types: ["Dateninstrument"],
    related: ["Quellenkatalog", "WÖk-IDs", "Datenqualität & Assurance"],
  },
  {
    title: "Quellenkatalog",
    text: "Der Quellenkatalog ordnet externe Standards, Datenquellen und Register nach Nutzung, Status und Prüfbarkeit.",
    cluster: "B",
    status: "In Vorbereitung",
    target: null,
    types: ["Register", "Dateninstrument"],
    related: ["WÖk-ID-Register", "Datenquellen", "Wirkungsaudit"],
  },
  {
    title: "FinalScore",
    text: "Der FinalScore führt Einzelscores, Datenqualität, Benchmarks, Mindestbedingungen und Nichtkompensation in eine entscheidungsfähige Ergebnislogik.",
    cluster: "C",
    status: "In Vorbereitung",
    target: null,
    types: ["Kennzahl", "Bewertungslogik"],
    related: ["Scorecards", "NWI", "Reverse Merit Order"],
  },
  {
    title: "Wohnwirkungsindex / WIX-Wohn",
    text: "WIX-Wohn bündelt Wohnkosten, Energie, Gebäudezustand, Sozialraum und Resilienz zu einer modellhaften Wirkungskennzahl.",
    cluster: "C",
    status: "Methodik",
    target: "wirkungsfelder/wohnen-stadt/detailkonzepte/wohnwirkungsindex-wix-wohn/",
    types: ["Kennzahl"],
    related: ["Wohnwirkungsrechner WIX-Wohn", "Sozialraum-Resilienzprofil", "Wirkungshaushalt"],
  },
  {
    title: "Wirkungscontrolling",
    text: "Wirkungscontrolling operationalisiert Impact Controlling in Planung, Kennzahlen, Abweichungsanalyse, Lernen und Managemententscheidungen.",
    cluster: "D",
    status: "Methodik",
    target: "werkzeuge/impact-controlling/",
    types: ["Managementinstrument"],
    related: ["Impact Controlling", "KII statt KPI", "NWI"],
  },
  {
    title: "Transformationswirkung",
    text: "Transformationswirkung beschreibt, wie stark eine Maßnahme Strukturen, Anreize und Systemhebel in Richtung positiver Netto-Wirkung verändert.",
    cluster: "D",
    status: "In Vorbereitung",
    target: null,
    types: ["Methode"],
    related: ["T-SROI", "Impact Controlling", "Wirkungsportfolio"],
  },
  {
    title: "WStG",
    text: "Das WStG beschreibt Wirkung als rahmende Steuerungs- und Bemessungslogik im Recht, ohne bereits geltendes Recht zu behaupten.",
    cluster: "E",
    status: "Methodik",
    target: "werkzeuge/wirkungssteuergesetz/",
    types: ["Rückkopplungsinstrument"],
    related: ["Wirkungsumsatzsteuer", "Wirkungseinkommensteuer", "Wirkungshaushalt"],
    notice: "Keine Rechts- oder Steuerberatung.",
  },
  {
    title: "WUStG",
    text: "Das WUStG koppelt Produkt- und Leistungswirkung modellhaft an Steuer- und Preislogik zurück.",
    cluster: "E",
    status: "Methodik",
    target: "werkzeuge/wirkungsumsatzsteuer/",
    types: ["Rückkopplungsinstrument"],
    related: ["Produktscorecards", "Reverse Merit Order", "Scorecards"],
    notice: "Keine Steuerberatung und keine amtliche Steuerentscheidung.",
  },
  {
    title: "WEstG",
    text: "Das WEstG ordnet Einkommen nach Höhe, Entstehungskontext und Wirkung als modellhafte Rückkopplungslogik.",
    cluster: "E",
    status: "Methodik",
    target: "werkzeuge/wirkungseinkommensteuer/",
    types: ["Rückkopplungsinstrument"],
    related: ["Maschinenwertschöpfungsbeitrag", "Automatisierungsdividende", "Wirkungsfonds"],
    notice: "Keine Steuerberatung und keine Sozialleistungsentscheidung.",
  },
  {
    title: "Wirkungsförderung",
    text: "Wirkungsförderung richtet Förderlogik an Prävention, Resilienz, Teilhabe und positiver Netto-Wirkung aus.",
    cluster: "E",
    status: "In Vorbereitung",
    target: null,
    types: ["Rückkopplungsinstrument"],
    related: ["Wirkungsförderungs-Check", "Wirkungshaushalt", "Wirkungsregister"],
    notice: "Keine Förderentscheidung.",
  },
  {
    title: "Wirkungspunkte / Bonuslogik",
    text: "Wirkungspunkte und Bonuslogik bereiten Anreize vor, ohne rote Linien oder schwere negative Wirkung zu kompensieren.",
    cluster: "E",
    status: "In Vorbereitung",
    target: null,
    types: ["Rückkopplungsinstrument"],
    related: ["FinalScore", "Reverse Merit Order", "Wirkungsrückkopplung"],
  },
  {
    title: "Wirkungslenkung",
    text: "Wirkungslenkung beschreibt die Rückführung von Bewertung in Preise, Steuern, Beschaffung, Förderung und Entscheidungen.",
    cluster: "E",
    status: "In Vorbereitung",
    target: null,
    types: ["Rückkopplungsinstrument"],
    related: ["Wirkungsrückkopplung", "Wirkungshaushalt", "Wirkungsumsatzsteuer"],
  },
  {
    title: "Wirkungsrückkopplung",
    text: "Wirkungsrückkopplung macht Bewertung handlungswirksam: in Marktpreisen, öffentlicher Steuerung, Kapitalflüssen, Lernschleifen und Korrekturpfaden.",
    cluster: "E",
    status: "In Vorbereitung",
    target: null,
    types: ["Rückkopplungsinstrument"],
    related: ["Wirkungslenkung", "Impact Controlling", "Wirkungsrat"],
  },
  {
    title: "Wirkungskredit",
    text: "Wirkungskredit verbindet Finanzierungskonditionen modellhaft mit Wirkung, Risiko, Datenqualität und Transformationspfad.",
    cluster: "F",
    status: "In Vorbereitung",
    target: null,
    types: ["Kapitalinstrument"],
    related: ["Wirkungskredit-Rechner", "Kapitalwirkungscheck", "Datenqualität & Assurance"],
    notice: "Keine Kreditentscheidung und keine Finanzberatung.",
  },
  {
    title: "Stranded-Asset-Check",
    text: "Der Stranded-Asset-Check macht Übergangs-, Resilienz- und Wertstabilitätsrisiken sichtbar.",
    cluster: "F",
    status: "In Vorbereitung",
    target: null,
    types: ["Check", "Kapitalinstrument"],
    related: ["Stranded-Asset-Check Wohnen", "Versicherbarkeits-/Resilienzcheck", "Wirkungsrisiko-Matrix"],
    notice: "Keine Anlage- oder Immobilienberatung.",
  },
  {
    title: "Wirkungsportfolio Kapital",
    text: "Wirkungsportfolio Kapital ordnet Kapitalflüsse nach Wirkung, Risiko, Resilienz und Transformationsbeitrag.",
    cluster: "F",
    status: "In Vorbereitung",
    target: null,
    types: ["Kapitalinstrument"],
    related: ["Portfolio-Wirkungsrating", "Kapitalwirkungscheck", "Wirkungsfonds"],
    notice: "Keine Anlageentscheidung.",
  },
  {
    title: "Review-/Versionierungslogik",
    text: "Review- und Versionierungslogik hält Methodenstände, Quellen, Benchmarks, Korrekturen und Reviewstatus nachvollziehbar.",
    cluster: "G",
    status: "In Vorbereitung",
    target: null,
    types: ["Governance"],
    related: ["Wirkungsrat", "Wirkungsregister", "Wirkungsaudit"],
  },
  {
    title: "Missbrauchsschutz",
    text: "Missbrauchsschutz bündelt Schutzmechanismen gegen Personenbewertung, Scheingenauigkeit, Greenwashing, Impact-Washing und automatische Entscheidungen.",
    cluster: "G",
    status: "In Vorbereitung",
    target: null,
    types: ["Governance"],
    related: ["Wirkungsrat", "Anti-Greenwashing", "Anti-Impact-Washing"],
  },
  {
    title: "Anti-Greenwashing",
    text: "Anti-Greenwashing macht Datenqualität, Grenzen, Quellen und rote Linien sichtbar, damit positive Einzelclaims nicht überdehnen.",
    cluster: "G",
    status: "In Vorbereitung",
    target: null,
    types: ["Governance"],
    related: ["Missbrauchsschutz", "Datenqualität & Assurance", "Reverse Merit Order"],
  },
  {
    title: "Anti-Impact-Washing",
    text: "Anti-Impact-Washing schützt vor überzogenen Wirkungsbehauptungen, Scheingenauigkeit und der Verwechslung von Potenzial mit eingetretener Wirkung.",
    cluster: "G",
    status: "In Vorbereitung",
    target: null,
    types: ["Governance"],
    related: ["Wirkungspotenzial", "Missbrauchsschutz", "Wirkungsaudit"],
  },
  {
    title: "Beschwerde-/Korrekturpfade",
    text: "Beschwerde- und Korrekturpfade sichern Einspruch, Fehlerkorrektur, Rechtsschutz und demokratische Nachsteuerung.",
    cluster: "G",
    status: "In Vorbereitung",
    target: null,
    types: ["Governance"],
    related: ["Wirkungsrat", "Wirkungsregister", "Review-/Versionierungslogik"],
  },
];

const clusterOverrideByTitle = new Map([
  ["Impact Controlling", "D"],
  ["T-SROI", "D"],
  ["Netto-Wirkungs-Index", "C"],
  ["Scorecards", "C"],
  ["Produktscorecards", "C"],
  ["Benchmarks & Archetypen", "C"],
  ["Reverse Merit Order", "C"],
  ["KII statt KPI", "D"],
  ["Wirkungsportfolio", "D"],
  ["Bildungswirkungsindex / BWK", "C"],
  ["Sozialraum-Resilienzprofil", "C"],
  ["WÖk-IDs", "B"],
  ["Datenqualität & Assurance", "B"],
  ["Digitale Produktpässe", "B"],
  ["Wirkungsdatenräume", "B"],
  ["Digitale Produktpässe und Wirkungsdatenräume", "B"],
  ["Wirkungsregister", "G"],
  ["Wissensrat-/Integritätsregister", "G"],
  ["Wirkungsrat", "G"],
  ["Wirkungsaudit", "G"],
  ["Wirkungsumsatzsteuer", "E"],
  ["Wirkungssteuergesetz WStG", "E"],
  ["Wirkungseinkommensteuer", "E"],
  ["Wirkungshaushalt", "E"],
  ["Öffentliche Beschaffung", "E"],
  ["Wirkungsfonds", "F"],
  ["Wirkungsfonds-Simulator", "H"],
  ["Kapitalwirkungscheck", "F"],
  ["Portfolio-Wirkungsrating", "F"],
  ["Wirkungskredit-Rechner", "H"],
  ["Versicherbarkeits-/Resilienzcheck", "F"],
  ["ESG-zu-WÖk-Mapping", "B"],
  ["Innovations-Wirkungsportfolio", "D"],
  ["Automatisierungsdividende", "F"],
  ["Maschinenwertschöpfungsbeitrag", "F"],
  ["Medienwirkungscheck", "D"],
  ["Sprach- und Framing-Analyse", "D"],
  ["Politische Wirkungsprüfung", "D"],
]);

const titleOverrideByTitle = new Map([["Netto-Wirkungs-Index", "Netto-Wirkungs-Index / NWI"]]);

const typeOverrideByTitle = new Map([
  ["Impact Controlling", ["Managementinstrument"]],
  ["T-SROI", ["Kennzahl", "Methode"]],
  ["Netto-Wirkungs-Index", ["Kennzahl"]],
  ["Netto-Wirkungs-Index / NWI", ["Kennzahl"]],
  ["Scorecards", ["Bewertungsinstrument"]],
  ["Produktscorecards", ["Bewertungsinstrument"]],
  ["Benchmarks & Archetypen", ["Methode"]],
  ["Reverse Merit Order", ["Bewertungslogik"]],
  ["KII statt KPI", ["Managementinstrument"]],
  ["WÖk-IDs", ["Dateninstrument"]],
  ["Datenqualität & Assurance", ["Dateninstrument"]],
  ["Digitale Produktpässe", ["Dateninstrument"]],
  ["Wirkungsdatenräume", ["Dateninstrument"]],
  ["Wirkungsregister", ["Register", "Governance"]],
  ["Wirkungsrat", ["Governance"]],
  ["Wirkungsaudit", ["Governance"]],
  ["Wirkungsfonds", ["Kapitalinstrument"]],
  ["Kapitalwirkungscheck", ["Kapitalinstrument", "Check"]],
  ["Portfolio-Wirkungsrating", ["Kapitalinstrument"]],
  ["Versicherbarkeits-/Resilienzcheck", ["Kapitalinstrument", "Check"]],
  ["Automatisierungsdividende", ["Kapitalinstrument"]],
  ["Maschinenwertschöpfungsbeitrag", ["Kapitalinstrument"]],
]);

const textOverrideByTitle = new Map([
  ["Impact Controlling", "Impact Controlling übersetzt Wirkungsdaten, Scorecards, KII, NWI und T-SROI in Steuerung, Reporting, Risiko, Investition und Entscheidung."],
  ["T-SROI", "Der T-SROI bewertet Transformationswirkung und systemische Hebelwirkung. Er baut auf geprüfter Netto-Wirkung auf, ersetzt aber weder Scorecard noch NWI."],
  ["Netto-Wirkungs-Index", "Der NWI ist die operative Kennzahl für Netto-Wirkung. Er verdichtet Scorecards, WÖk-IDs, Benchmarks, Einzelscores, Datenqualität, Mindestbedingungen und Reverse Merit Order zu einer prüfbaren Netto-Wirkungsbewertung."],
  ["Reverse Merit Order", "Die Reverse Merit Order begrenzt die Gesamtbewertung durch das kritischste zentrale Wirkungsfeld. Sie schützt vor Schönrechnung, Ablasslogik und Greenwashing."],
  ["Wirkungsrat", "Der Wirkungsrat sichert Weiterentwicklung, Evaluation, Versionierung, Benchmarkpflege, Transparenz und Missbrauchsschutz der Wirkungslogik."],
]);

const noticeOverrideByTitle = new Map([
  ["T-SROI", "T-SROI misst nicht noch einmal Netto-Wirkung. Diese Aufgabe liegt beim NWI."],
  ["Netto-Wirkungs-Index", "Der NWI ist keine Transformationskennzahl und kein Ersatz für die Scorecard."],
  ["Reverse Merit Order", "Bewertungsregel und Nichtkompensationslogik: rote Linien werden nicht kompensiert."],
  ["Wirkungsrat", "Governance- und Qualitätssicherungslogik, keine amtliche Entscheidung."],
  ["Impact Controlling", "Managementinstrument, kein Ersatz für menschliche Verantwortung und demokratische Legitimation."],
]);

const demoLikeTitle = (title, status) => status === "Demo" || /(Demo|Rechner|Check|Scanner|Dashboard|Radar|Generator|Monitor|Simulator|Rating)/.test(title);

const methodBucketByCluster = new Map([
  ["A", "Bewertungslogik"],
  ["B", "Daten"],
  ["C", "Bewertung"],
  ["D", "Controlling"],
  ["E", "Rückkopplung"],
  ["F", "Kapital"],
  ["G", "Governance"],
  ["H", "Demo"],
]);

function normalizeMethodTool(raw) {
  const [legacyTitle, legacyText, legacyCluster, legacyStatus, target, related = [], notice = "Bereitet Entscheidungen vor, ersetzt sie aber nicht."] = raw;
  const title = titleOverrideByTitle.get(legacyTitle) || legacyTitle;
  const status = legacyStatus || "Methodik";
  const isDemo = demoLikeTitle(legacyTitle, status);
  const cluster = clusterOverrideByTitle.get(legacyTitle) || (isDemo ? "H" : legacyCluster);
  const types = typeOverrideByTitle.get(title) || typeOverrideByTitle.get(legacyTitle) || (isDemo ? (legacyTitle.includes("Rechner") ? ["Demo", "Rechner"] : legacyTitle.includes("Check") ? ["Demo", "Check"] : ["Demo"]) : ["Methode"]);
  return {
    title,
    text: textOverrideByTitle.get(legacyTitle) || legacyText,
    cluster,
    status,
    target,
    related,
    notice: noticeOverrideByTitle.get(legacyTitle) || notice,
    types,
    isDemo,
    isPrepared: status === "In Vorbereitung" || !target,
    method: methodBucketByCluster.get(cluster) || "Methode",
    oldCluster: legacyCluster,
  };
}

function uniqueMethodTools(tools) {
  const seen = new Set();
  return tools.filter((tool) => {
    const key = tool.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const methodMapTools = uniqueMethodTools([
  ...cardsToRestoreOrPrepare.map((tool) => ({
    status: "Methodik",
    related: [],
    notice: "Bereitet Entscheidungen vor, ersetzt sie aber nicht.",
    types: ["Methode"],
    isDemo: false,
    isPrepared: tool.status === "In Vorbereitung" || !tool.target,
    method: methodBucketByCluster.get(tool.cluster) || "Methode",
    oldCluster: "neu/ergänzt",
    ...tool,
  })),
  ...legacyMethodMapTools.map(normalizeMethodTool),
]);

const preparedToolPages = methodMapTools.filter((tool) => tool.status === "In Vorbereitung" && tool.target);

function relatedToolLinks(base, related = []) {
  const aliases = new Map([
    ["NWI", "Netto-Wirkungs-Index / NWI"],
    ["Netto-Wirkungs-Index", "Netto-Wirkungs-Index / NWI"],
    ["Bildungswirkungsindex", "Bildungswirkungsindex / BWK"],
    ["Wohnwirkungsrechner", "Wohnwirkungsrechner WIX-Wohn"],
    ["Medienwirkungscheck Demo", "Medienwirkungscheck"],
    ["Open-Science-Check", "Open-Science- und Replikationscheck"],
    ["Datenqualität", "Datenqualität & Assurance"],
    ["WÖk-ID", "WÖk-IDs"],
  ]);
  const known = new Map(methodMapTools.map((tool) => [tool.title, tool.target]));
  return related
    .map((title) => {
      const target = known.get(title) || known.get(aliases.get(title));
      return target ? `<a href="${href(base, target)}">${escapeHtml(title)}</a>` : `<span>${escapeHtml(title)}</span>`;
    })
    .join("");
}

function methodTypeBadges(types = []) {
  return types.map((type) => `<span class="method-type-badge">${escapeHtml(type)}</span>`).join("");
}

function plainSearchText(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function methodToolCard(base, tool) {
  const { title, text, cluster, status, target, related = [], notice = "Bereitet Entscheidungen vor, ersetzt sie aber nicht.", types = [], isDemo = false, isPrepared = false, method = "" } = tool;
  const clusterInfo = methodClusters.find((item) => item.key === cluster);
  const action = target
    ? `<a class="text-link" href="${href(base, target)}">Detailseite öffnen</a>`
    : `<span class="method-card-pending">Detailseite in Vorbereitung</span>`;
  const searchText = [title, plainSearchText(text), clusterInfo?.title, status, types.join(" "), related.join(" ")].filter(Boolean).join(" ");
  return `<article class="card method-tool-card" data-method-card data-cluster="${escapeHtml(cluster)}" data-status="${escapeHtml(status)}" data-type="${escapeHtml(types.join(" "))}" data-method="${escapeHtml(method)}" data-demo="${isDemo ? "ja" : "nein"}" data-prepared="${isPrepared ? "ja" : "nein"}" data-search="${escapeHtml(searchText)}">
    <div class="method-tool-card-head">
      <p class="card-kicker">Cluster ${escapeHtml(cluster)} · ${escapeHtml(clusterInfo?.title || "Methoden")}</p>
      ${StatusBadge(status)}
    </div>
    <div class="method-type-row">${methodTypeBadges(types)}</div>
    <h3 class="card-title">${escapeHtml(title)}</h3>
    <p class="card-text">${escapeHtml(text)}</p>
    <p class="method-tool-notice">${escapeHtml(notice)}</p>
    <div class="method-related" aria-label="Verwandte Werkzeuge">${relatedToolLinks(base, related)}</div>
    <div class="portal-card-actions">${action}</div>
  </article>`;
}

function methodClusterSection(base, cluster) {
  const cards = methodMapTools.filter((tool) => tool.cluster === cluster.key).map((tool) => methodToolCard(base, tool)).join("");
  return `<section class="section method-cluster-section" id="cluster-${cluster.key.toLowerCase()}" aria-labelledby="cluster-${cluster.key.toLowerCase()}-title">
    <div>
      <div class="section-header">
        <p class="hero-kicker">Cluster ${escapeHtml(cluster.key)}</p>
        <h2 id="cluster-${cluster.key.toLowerCase()}-title">${escapeHtml(cluster.title)}</h2>
        <p>${escapeHtml(cluster.text)}</p>
      </div>
      <div class="method-map-grid">${cards}</div>
    </div>
  </section>`;
}

const dashboardPilots = [
  {
    title: "Produktwirkung",
    text: "Von Produktdaten über Scorecards, WÖk-ID, Datenqualität und Reverse Merit Order zur nachvollziehbaren Wirkungsorientierung.",
    href: "erleben/produktwirkungsrechner/",
    methods: ["Scorecards", "WÖk-ID", "Reverse Merit Order"],
  },
  {
    title: "Scorecard & Produktpass",
    text: "Messwert, Quelle, Benchmark, Datenqualität und Publikationsreife in einer prüfbaren Scorecard-Logik zusammenführen.",
    href: "scorecard-dashboard/",
    methods: ["DPP", "Datenqualität", "FinalScore"],
  },
  {
    title: "Impact Controlling",
    text: "Operative Netto-Wirkung, Transformationswirkung, Risiko, Audit und Lernschleife getrennt, aber zusammenhängend betrachten.",
    href: "erleben/impact-controlling-rechner/",
    methods: ["NWI", "T-SROI", "Wirkungsaudit"],
  },
  {
    title: "Wohnwirkung",
    text: "Wohnkosten, Energie, Resilienz, soziale Zugänglichkeit und kommunale Pilotoptionen als Wirkungsprofil strukturieren.",
    href: "erleben/wohnwirkungsrechner/",
    methods: ["NWI", "Resilienz", "Sozialraum"],
  },
  {
    title: "Medienwirkung",
    text: "Sprache, Framing, Salienz, Unsicherheit und demokratische Schutzlinien nicht-personalisierend sichtbar machen.",
    href: "erleben/medienwirkungscheck/",
    methods: ["Framing", "SDG+ Demokratie", "Review"],
  },
];

function dashboardPilotSection(base) {
  return `<section class="section" aria-labelledby="dashboard-cockpit-title">
    <div>
      <div class="section-header">
        <p class="hero-kicker">Dashboard-Cockpit</p>
        <h2 id="dashboard-cockpit-title">Fünf Pilotpfade für geführte Werkzeugnutzung</h2>
        <p>Dashboards sollen nicht nur Ergebnisse ausgeben, sondern Fragestellung, Datenqualität, Methode, Schutzlinien und nächsten Schritt sichtbar machen. Die bestehenden Routen bleiben erhalten.</p>
      </div>
      <div class="method-map-grid">
        ${dashboardPilots.map((pilot) => `<article class="card method-tool-card">
          <div class="method-tool-card-head">
            <p class="card-kicker">Pilot-Dashboard</p>
            ${StatusBadge("Arbeitsfassung")}
          </div>
          <h3 class="card-title">${escapeHtml(pilot.title)}</h3>
          <p class="card-text">${escapeHtml(pilot.text)}</p>
          <div class="method-related" aria-label="Methodenlogik">${pilot.methods.map((method) => `<span>${escapeHtml(method)}</span>`).join("")}</div>
          <p class="method-tool-notice">Modellhafte Orientierung, nicht amtlich und keine automatische Entscheidung.</p>
          <div class="portal-card-actions"><a class="text-link" href="${href(base, pilot.href)}">Pilotpfad öffnen</a></div>
        </article>`).join("")}
      </div>
    </div>
  </section>`;
}

function toolOverview() {
  return page({
    rel: "werkzeuge/index.html",
    title: "Methoden & Werkzeuge der Wirkungsökonomie | Methodenlandkarte",
    description:
      "Methodenlandkarte der Wirkungsökonomie: Begriffe, Daten, Bewertung, Kennzahlen, Controlling, Rückkopplung, Kapital, Governance und Demos.",
    searchSection: "Werkzeuge",
    body: (base) => `<section class="hero method-map-hero">
        <div class="hero-grid">
          <div>
            <p class="hero-kicker">Methodenlandkarte</p>
            <h1 class="hero-title">Methoden &amp; Werkzeuge der Wirkungsökonomie</h1>
            <p class="hero-subtitle">Eine Landkarte der Begriffe, Dateninstrumente, Bewertungslogiken, Kennzahlen, Managementinstrumente, Governance-Bausteine und Demos, mit denen Wirkung sichtbar, prüfbar und rückgekoppelt wird.</p>
            <p class="hero-text">Die Karten zeigen keine amtliche Bewertung. Sie trennen bewusst Zielrahmen, operative Kennzahlen, Transformationsmessung, Nichtkompensationsregeln, Governance und modellhafte Anwendungen.</p>
            ${printActions(base)}
          </div>
          <aside class="card">
            <p class="card-kicker">Abgrenzung</p>
            <h2 class="card-title">NWI und T-SROI sind bewusst getrennt.</h2>
            <p class="card-text"><strong>Netto-Wirkung</strong> ist Bewertungslogik und Zielbrücke. <strong>NWI</strong> ist die operative Kennzahl. <strong>T-SROI</strong> bewertet Transformationswirkung und Systemhebel. <strong>Reverse Merit Order</strong> schützt vor Kompensation roter Linien.</p>
          </aside>
        </div>
      </section>
      <section class="section method-orientation-section" aria-labelledby="method-orientation-title">
        <div class="card method-orientation-card">
          <p class="hero-kicker">Orientierung</p>
          <h2 id="method-orientation-title">Begriff, Methode, Kennzahl, Instrument, Institution oder Demo?</h2>
          <p class="card-text">Nicht jede Karte hat dieselbe Funktion: Begriffe erklären den Zielrahmen, WÖk-IDs adressieren Daten, Scorecards bewerten, der NWI verdichtet operativ, T-SROI beschreibt Transformationshebel, Reverse Merit Order setzt Nichtkompensationsgrenzen, der Wirkungsrat sichert Governance und Demos zeigen modellhafte Anwendungen.</p>
        </div>
      </section>
      ${dashboardPilotSection(base)}
      <section class="section" aria-labelledby="method-pipeline-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Pipeline</p>
            <h2 id="method-pipeline-title">Von Zielrahmen zu Anwendung</h2>
          </div>
          <nav class="method-pipeline" aria-label="Methodenpipeline">
            ${methodPipeline.map(([cluster, label]) => `<a href="#cluster-${cluster.toLowerCase()}"><strong>${escapeHtml(cluster)}</strong><span>${escapeHtml(label)}</span></a>`).join("")}
          </nav>
        </div>
      </section>
      <section class="section" aria-labelledby="method-map-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Filter</p>
            <h2 id="method-map-title">Acht Cluster statt gemischter Werkzeugliste</h2>
            <p>Jedes Werkzeug bleibt über seine Detailseite erreichbar. Neue zentrale, aber noch nicht ausgearbeitete Werkzeuge sind als ${StatusBadge("In Vorbereitung")} markiert.</p>
          </div>
          <form class="tool-filter-panel" data-tool-filter aria-label="Methoden und Werkzeuge filtern">
            <label>Suche <input type="search" data-tool-filter-search placeholder="Begriff, Methode oder Demo suchen"></label>
            <label>Cluster <select data-tool-filter-cluster><option value="">Alle Cluster</option>${methodClusters.map((cluster) => `<option value="${cluster.key}">${cluster.key} · ${escapeHtml(cluster.title)}</option>`).join("")}</select></label>
            <label>Typ <select data-tool-filter-type><option value="">Alle Typen</option>${Array.from(new Set(methodMapTools.flatMap((tool) => tool.types || []))).sort().map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("")}</select></label>
            <label>Status <select data-tool-filter-status><option value="">Alle Status</option>${Array.from(new Set(methodMapTools.map((tool) => tool.status))).sort().map((status) => `<option value="${escapeHtml(status)}">${escapeHtml(status)}</option>`).join("")}</select></label>
            <label>Methode <select data-tool-filter-method><option value="">Alle Methodenlogiken</option>${Array.from(new Set(methodMapTools.map((tool) => tool.method).filter(Boolean))).sort().map((method) => `<option value="${escapeHtml(method)}">${escapeHtml(method)}</option>`).join("")}</select></label>
            <label class="tool-filter-check"><input type="checkbox" data-tool-filter-demo> Nur Demos/Rechner/Checks</label>
            <label class="tool-filter-check"><input type="checkbox" data-tool-filter-prepared> Nur in Vorbereitung/Rekonstruktion</label>
          </form>
          <nav class="method-cluster-nav" aria-label="Methodencluster">
            ${methodClusters.map((cluster) => `<a href="#cluster-${cluster.key.toLowerCase()}"><strong>${cluster.key}</strong><span>${escapeHtml(cluster.title)}</span></a>`).join("")}
          </nav>
        </div>
      </section>
      ${methodClusters.map((cluster) => methodClusterSection(base, cluster)).join("")}
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
          ${demoLinks.length ? linkList(base, demoLinks) : '<p class="card-text">Passende Anwendungen werden hier ergänzt, sobald sie öffentlich nutzbar sind.</p>'}
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

function preparedToolPage(tool) {
  const { title, text, cluster, status, target, related = [], notice = "Vorbereitete Methodenseite." } = tool;
  const rel = `${target.replace(/^\/+/, "").replace(/\/?$/, "/")}index.html`;
  const clusterInfo = methodClusters.find((item) => item.key === cluster);
  return page({
    rel,
    title: `${title} | In Vorbereitung`,
    description: text,
    searchSection: "Werkzeuge",
    searchType: "Werkzeug in Vorbereitung",
    body: (base) => `<section class="hero">
        <div class="hero-grid">
          <div>
            <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${href(base, "werkzeuge/")}">Werkzeuge</a><span aria-hidden="true">/</span><span>${escapeHtml(title)}</span></nav>
            <p class="hero-kicker">Werkzeug · ${StatusBadge(status)}</p>
            <h1 class="hero-title">${escapeHtml(title)}</h1>
            <p class="hero-subtitle">${escapeHtml(text)}</p>
            <p class="hero-text">Diese Seite ist als Platzhalter vorbereitet, damit die Methodenlandkarte vollständig bleibt. Sie behauptet noch keine fertige Methodik und ersetzt keine fachliche, rechtliche, steuerliche, finanzielle oder amtliche Prüfung.</p>
            ${printActions(base)}
          </div>
          <aside class="card">
            <p class="card-kicker">Cluster ${escapeHtml(cluster)}</p>
            <h2 class="card-title">${escapeHtml(clusterInfo?.title || "Methoden")}</h2>
            <p class="card-text">${escapeHtml(clusterInfo?.text || "Dieses Werkzeug wird als Methodenbaustein vorbereitet.")}</p>
          </aside>
        </div>
      </section>
      <section class="section" aria-labelledby="schutzlinien">
        <div class="card">
          <p class="hero-kicker">Schutzlinien</p>
          <h2 id="schutzlinien">Noch kein fertiges Werkzeug</h2>
          <p class="card-text">${escapeHtml(notice)}</p>
          <p class="card-text">Die spätere Ausarbeitung muss Datenqualität sichtbar machen, rote Linien respektieren, keine Personen bewerten und keine automatische Entscheidung treffen.</p>
        </div>
      </section>
      <section class="section" aria-labelledby="related-tools">
        <div>
          <div class="section-header"><p class="hero-kicker">Verwandte Werkzeuge</p><h2 id="related-tools">Anschluss in der Methodenlandkarte</h2></div>
          <div class="method-related method-related-large">${relatedToolLinks(base, related)}</div>
        </div>
      </section>
      ${exportBlock(base)}`,
  });
}

function workshopPages() {
  const mainSections = [
    ["Online-Buch", "Die Referenzfassung der Wirkungsökonomie mit Kapiteln, Teilen und Volltext.", "referenz/"],
    ["Arbeitsbibliothek", "Kuratiertes Arbeitsregal für Whitepaper, Working Papers, Gesetze, Methodik und Dossiers.", "werkstatt/arbeitsbibliothek/"],
    ["Whitepaper", "Vertiefende Papiere zu Wirkung, T-SROI, Produkten, Einkommen und Systemarchitektur.", "werkstatt/arbeitsbibliothek/whitepaper/"],
    ["Working Papers", "Vertiefende Papiere, die Modelle und Anwendungsfelder einordnen.", "wissen/working-papers/"],
    ["Gesetze und Rechtsentwürfe", "WStG, WUStG, WEstG und juristische Prüfnotizen.", "werkstatt/arbeitsbibliothek/gesetze/"],
    ["Methodik", "Datenbasis, Standards, Regularien, WÖk-IDs, Scorecards und Evidenzlogik.", "werkstatt/arbeitsbibliothek/methodik/"],
    ["Praxisbeispiele", "Apfelbeispiel, Lieferketten, Konzernbeispiel und kommunale Use Cases.", "werkstatt/arbeitsbibliothek/praxis/"],
    ["Architektur", "Systemmodell und Nachhaltigkeit als Systemarchitektur.", "werkstatt/arbeitsbibliothek/architektur/"],
    ["Dossiers", "Öffentliche Dossiers aus Journal und Werkstatt.", "werkstatt/arbeitsbibliothek/konzepte-dossiers/"],
    ["Historische Dokumente", "Ältere Materialien bleiben auffindbar und werden historisch eingeordnet.", "werkstatt/arbeitsbibliothek/historische-dokumente/"],
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
            <p class="card-kicker">Downloads</p>
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
    ["Konzepte & Dossiers", "Online lesbare Konzeptpapiere, Dossiers und zitierfähige Fassungen.", "werkstatt/arbeitsbibliothek/konzepte-dossiers/"],
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
    ["whitepaper", "Whitepaper", [["T-SROI", "Transformationswirkung und Impact Controlling.", "dokumente/whitepaper-t-sroi/"], ["Folgencheck statt Faktencheck", "Arbeitspapier zur Wirkung politischer Sprache, Frames, Narrativen und demokratischen Resonanzrisiken.", "bibliothek/folgencheck-wirkungspolitische-sprache/"], ["Produktbesteuerung durch Wirkung", "Kanonische Online-Fassung des Produktpapiers.", "werkstatt/whitepaper/produktbesteuerung-durch-wirkung/"], ["Wirkung statt Kapital", "Grundlagen und Paradigmenwechsel.", "assets/pdf/whitepaper-wirkung-statt-kapital.pdf"], ["Wirkungseinkommen", "Einkommen und Wirkung.", "assets/pdf/whitepaper-wirkungseinkommen.pdf"]]],
    ["konzepte-dossiers", "Konzepte & Dossiers", [["Produktbesteuerung durch Wirkung", "Online lesbares Konzeptpapier im Portal Produkte & Konsum.", "wirkungsfelder/produkte-konsum/produktbesteuerung-durch-wirkung/"], ["Dossier Produkte & Konsum", "Rechenmodell, Tarifmatrix, Beispiele und Quellen zur Wirkungsumsatzsteuer.", "wirkungsfelder/produkte-konsum/dossier/"], ["Apfelbeispiel-Dossier", "Einzeldossier mit Bewertungsweg, Annahmen, Datenquellen und Grenzen.", "wirkungsfelder/produkte-konsum/dossiers/apfelbeispiel/"], ["Die Wirkungsschule", "Öffentliche Kurzfassung und Konzeptpapier zur Wirkungsschule.", "wirkungsfelder/bildung/wirkungsschule/"], ["Dossier Wohnen", "Öffentliches Dossier zum Wirkungsfeld Wohnen.", "blog/dossiers/wohnen.html"], ["Dossier Medien & Demokratie", "Öffentliches Dossier zu Medien, Demokratie und Wirkung.", "blog/dossiers/medien-demokratie.html"], ["Grundlagen-Dossier", "Projekt- und Grundlagenmaterialien.", "blog/dossiers/grundlagen.html"]]],
    ["praxis", "Praxisbeispiele", [["Apfelbeispiel", "Produktscorecard und Bonusregel.", "wirkungsfelder/produkte-konsum/apfelbeispiel/"], ["Lieferkette", "Wirkungsökonomie in der Lieferkette.", "wirkungsfelder/produkte-konsum/lieferketten/"], ["Beispiel Konzern", "Konzern- und Produktscorecard.", "wirkungsfelder/produkte-konsum/basf-polyamid/"], ["T-Shirt / Textilbeispiel", "Modellseite für Textilien als Wirkungsträger.", "wirkungsfelder/produkte-konsum/t-shirt/"]]],
    ["soziales", "Soziales", [["Wenn Maschinen arbeiten", "Automatisierung und Wirkungseinkommen.", "dokumente/wenn-maschinen-arbeiten/"], ["Wirkungsrente", "Generationenvertrag und soziale Sicherung.", "referenz/kapitel-058-wirkungsrente/"], ["Wirkungseinkommen", "Grunddividende und Zielmodell.", "referenz/kapitel-057-wirkungseinkommen/"]]],
    ["recht", "Recht", [["Wirkungssteuergesetz WStG", "Rahmenentwurf zur Wirkungssteuerlogik.", "werkstatt/gesetze/wirkungssteuergesetz/"], ["WStG und Produktwirkungssteuer", "Rechts- und Steuerlogik im Grundlagenwerk.", "referenz/kapitel-038-das-wustg-und-die-produktwirkungssteuer/"], ["Wirkungsrat", "Governance und institutionelle Sicherung.", "dokumente/wirkungsrat-konzept/"]]],
    ["architektur", "Architektur", [["Systemmodell", "Systemmodell der Wirkungsökonomie.", "dokumente/systemmodell-der-wirkungsoekonomie/"], ["Klima, Energie und Ressourcen", "Wirkungsfeld für ökologische Systemarchitektur.", "wirkungsfelder/klima-energie-ressourcen/"], ["Prozessarchitektur", "Von Daten zu Steuerlogik.", "workflow.html"]]],
    ["historische-dokumente", "Historische Dokumente", [["Manifest", "Historischer und normativer Ausgangspunkt.", "dokumente/woek-manifest/"], ["Minifest", "Kurzfassung und Orientierung.", "dokumente/minifest-wirkungsoekonomie/"], ["Archivhinweis", "Historische Dokumente einordnen.", "docs/grundlagen/Historische_Dokumente_Hinweis_v1.1.md"]]],
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
  schoolWorkpaperPage();

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

function schoolWorkpaperPage() {
  const sourcePath = path.join(ROOT, SCHOOL_MD);
  const markdown = fs.existsSync(sourcePath)
    ? fs.readFileSync(sourcePath, "utf8")
    : "# Wirkungsökonomisches Schulkonzept\n\nOnline-Volltext wird ergänzt.";
  const reader = markdownToReader(markdown);
  page({
    rel: "werkstatt/arbeitsbibliothek/wirkungsfelder/bildung/wirkungsschule/index.html",
    title: "Konzeptpapier Wirkungsschule online lesen | Werkstatt der Wirkungsökonomie",
    description:
      "Zitierfähige Online-Fassung des wirkungsökonomischen Schulkonzepts mit Abschnittsankern und DOCX-Download.",
    searchSection: "Werkstatt",
    searchType: "Online-Volltext",
    body: (base, route) => `<section class="hero">
        <div class="hero-grid">
          <div>
            <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${href(base, "werkstatt/")}">Werkstatt</a><span aria-hidden="true">/</span><a href="${href(base, "werkstatt/arbeitsbibliothek/")}">Arbeitsbibliothek</a><span aria-hidden="true">/</span><a href="${href(base, "werkstatt/arbeitsbibliothek/wirkungsfelder/bildung/")}">Bildung</a></nav>
            <p class="hero-kicker">Online-Volltext</p>
            <h1 class="hero-title">Wirkungsökonomisches Schulkonzept</h1>
            <p class="hero-subtitle">Von der Schule als Sortiersystem zur Schule als Wirkungsraum.</p>
            <p class="hero-text">Diese Seite macht das Konzeptpapier online lesbar und zitierfähig. Die DOCX-Datei bleibt als ergänzende Downloadfassung erhalten.</p>
            ${printActions(
              base,
              `<a class="btn btn-primary" href="#online-volltext">Online lesen</a>
              <a class="btn btn-secondary" href="${href(base, SCHOOL_DOC)}">DOCX herunterladen</a>
              <a class="btn btn-secondary" href="${href(base, "wirkungsfelder/bildung/wirkungsschule/")}">Kurzfassung öffnen</a>`,
            )}
          </div>
          ${citationNotice(route)}
        </div>
      </section>
      <section class="section" aria-labelledby="toc-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Lesefassung</p>
            <h2 id="toc-title">Konzeptpapier online lesen ${citeAnchor("toc-title")}</h2>
            <p>Alle Überschriften und Absätze haben stabile Anker. Dadurch können einzelne Thesen, Abschnitte oder Definitionen direkt zitiert und verlinkt werden.</p>
          </div>
          ${tocList(base, reader.toc)}
        </div>
      </section>
      <section class="section" aria-labelledby="online-volltext">
        <article class="fulltext-reader citation-reader">
          <h2 id="online-volltext">Online-Volltext ${citeAnchor("online-volltext")}</h2>
          ${reader.html}
        </article>
      </section>
      ${sdgBlock(base, {
        sdgs: fields[0].sdgs,
        plus: fields[0].plus,
        explanation:
          "Das Schulkonzept betrifft Bildung, Gesundheit, Teilhabe, demokratische Institutionen, digitale Selbstbestimmung und Zukunftsfähigkeit als miteinander verbundene Wirkungsräume.",
      })}
      ${bookAnchorBlock(base, fields[0].anchors)}
      <section class="section" aria-labelledby="download-title">
        <div class="download-card">
          <div>
            <p class="card-kicker">Download & Archiv</p>
            <h2 id="download-title">Originaldatei ergänzend herunterladen ${citeAnchor("download-title")}</h2>
            <p class="card-text">Die Online-Fassung ist der Hauptzugang. Die DOCX-Datei bleibt für Archiv, Weitergabe und Bearbeitung erhalten.</p>
          </div>
          <a class="btn btn-primary no-print" href="${href(base, SCHOOL_DOC)}">DOCX herunterladen</a>
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
  for (const tool of preparedToolPages) written.push(preparedToolPage(tool));
  workshopPages();
  console.log("Portal architecture pages generated.");
}

run();
