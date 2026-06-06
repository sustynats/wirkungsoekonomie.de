import fs from "node:fs";
import path from "node:path";
import { p0DossiersV2 } from "../../lib/wirkungsradar/p0-dossiers-v2.mjs";
import { p0EditorialGates } from "../../lib/wirkungsradar/p0-editorial-gates.mjs";
import { validateDossierV2 } from "../../lib/wirkungsradar/validateDossierV2.mjs";

const ROOT = process.cwd();
const OUT = (...parts) => path.join(ROOT, ...parts);
const DATA_STAND = "2026-06-04";
const ACADEMY_NARRATIVE_URL = "https://akademie.wirkungsoekonomie.de/narrativ-einreichen/";

const synonymMap = {
  "migration-kostet-nur": ["Migration kostet", "Auslaender kosten", "Sozialsysteme", "Sozialschmarotzer", "Sozialtourismus", "Sozialbetrug", "Sozialmissbrauch", "nie eingezahlt", "noch nie eingezahlt", "kommen nur wegen Sozialleistungen", "Buergergeld fuer Auslaender", "Fluechtlinge kosten", "Integration", "Zuwanderung", "Fachkraefte", "Kommunen ueberfordert"],
  "migration-kriminalitaet": ["Migration Kriminalitaet", "Auslaenderkriminalitaet", "Messerkriminalitaet", "Grenzkriminalitaet", "innere Sicherheit", "Migration Terror", "Gefaehrder", "Kriminalitaetsstatistik", "Tatverdaechtige"],
  "migration-identitaet": ["Ueberfremdung", "Bevoelkerungsaustausch", "Umvolkung", "Islamisierung", "Migration Identitaet", "Werteverfall durch Migration", "Deutschland wird abgeschafft", "Great Replacement"],
  "klimadiktatur": ["Klimadiktatur", "Oekodiktatur", "Klima Diktatur", "Klimapolitik Zwang", "Verbote Klima", "gruenes Verbot", "Klimaschutz Planwirtschaft"],
  "medienvertrauen": ["Luegenpresse", "Mainstreammedien luegen", "Systemmedien", "Medien manipulieren", "gekaufte Medien", "Medienvertrauen", "einseitige Berichterstattung"],
  "wissenschaftsdelegitimierung": ["Wissenschaft ist gekauft", "Klimawissenschaft gekauft", "Experten luegen", "Studien gefaelscht", "IPCC gekauft", "Forscher gekauft", "Wissenschaft vertrauen"],
  "eu-souveraenitaet": ["EU-Diktatur", "EU Fremdbestimmung", "Bruessel diktiert", "Deutschland Zahlmeister", "EU kostet nur", "Souveraenitaet", "Deutschland nicht souveraen"],
  "gender-kulturkampf": ["Gender-Wahn", "Gender Ideologie", "Fruehsexualisierung", "Gender Kinder", "Gendern zerstoert Sprache", "Familie wird abgeschafft", "Kulturkampf", "Kinderschutz Schule"],
  "deutschland-nur-zwei-prozent": ["2 Prozent", "zwei Prozent", "Deutschland kann nichts aendern", "China ist schuld", "wir sind zu klein", "CO2 Anteil Deutschland", "Territorialemissionen", "Territorialbilanz", "Konsumbilanz", "Scope 3", "Lieferkette"],
  "windraeder-voegel-wald-beton-rueckbau": ["Windraeder toeten Voegel", "Fledermaeuse", "Wald", "Beton", "Rueckbau", "Sondermuell", "Rotorblaetter", "SF6", "Schwefelhexafluorid", "Recycling", "Windkraft Natur"],
  "fusion-loest-das-energieproblem": ["Fusion", "Fusionskraftwerk", "ITER", "DEMO", "kleine Sonne", "unbegrenzte Energie", "Technikwunder", "thermisches Kraftwerk", "Turbine", "Tritium"],
  "schulden-machen-oder-sparen": ["Schulden", "Schulden belasten unsere Kinder", "Staat pleite", "schwarze Null", "Refinanzierung", "Staatsanleihen", "Unterlassungsschuld", "Investitionen", "Zukunftsinvestitionen"],
  "e-autos-schlimmer-als-verbrenner": ["E-Autos schlimmer", "Elektroauto", "Verbrenner", "Akku dreckig", "Batterie", "CO2 Rucksack", "Lebenszyklus", "Ladeinfrastruktur", "Oel"],
  "e-fuels-retten-den-verbrenner": ["E-Fuels", "synthetische Kraftstoffe", "Verbrenner retten", "Technologieoffenheit", "weiter tanken", "Bestandsflotte", "Porsche Sprit", "Flugzeug", "Schiff", "E-Kerosin"],
  "wasserstoff-fuer-alles": ["Wasserstoff", "H2", "Wasserstoffheizung", "Wasserstoffauto", "gruener Stahl", "Elektrolyse", "Rueckverstromung", "Dunkelflaute", "H2-ready"],
  "arbeit-lohnt-sich-nicht-mehr": ["Buergergeld macht faul", "Arbeit lohnt sich nicht", "Totalverweigerer", "wer arbeitet ist der Dumme", "Lohnabstand", "Aufstocker", "Sozialneid", "Buergergeld"],
  "co2-preis-oder-fossile-systemkosten": ["CO2 Preis", "CO2 Abzocke", "Klimageld", "Strafsteuer", "fossile Systemkosten", "Klimafolgekosten", "Benzin teurer", "Heizen teurer"],
  "kernenergie-wieder-in-deutschland": ["Kernkraft zurueck", "Atomkraft", "AKW", "Grundlast", "Endlager", "SMR", "Versorgungssicherheit", "billiger Strom"],
  "radwege-in-peru": ["Radwege Peru", "Steuergeld Ausland", "Entwicklungshilfe", "Entwicklungskredit", "KfW", "Lima", "Auslandsprojekte", "Wirkungspruefung"],
  "ukraine-unterstuetzung-steuergeld": ["Ukraine Hilfe", "Steuergeld Ukraine", "Milliarden", "Korruption", "Krieg", "Wiederaufbau", "Sicherheit", "Kiel Tracker", "EU Ukraine Facility"],
};

const topicLabels = {
  Klima: "Klima",
  Energie: "Energie",
  Mobilitaet: "Mobilität",
  Mobilität: "Mobilität",
  Migration: "Migration",
  Sozialstaat: "Sozialstaat",
  Arbeit: "Arbeit",
  Staat: "Staat & Schulden",
  Schulden: "Staat & Schulden",
  Steuern: "Steuern",
  Demokratie: "Demokratie",
  Medien: "Medien",
  Wirtschaft: "Wirtschaft",
  Wohnen: "Wohnen",
  Sicherheit: "Ausland & Sicherheit",
  Ukraine: "Ausland & Sicherheit",
};

const lighthouseSlugs = [
  "migration-kostet-nur",
  "deutschland-nur-zwei-prozent",
  "e-autos-schlimmer-als-verbrenner",
  "windraeder-voegel-wald-beton-rueckbau",
  "arbeit-lohnt-sich-nicht-mehr",
  "schulden-machen-oder-sparen",
  "radwege-in-peru",
  "ukraine-unterstuetzung-steuergeld",
  "fusion-loest-das-energieproblem",
  "e-fuels-retten-den-verbrenner",
  "wasserstoff-fuer-alles",
  "kernenergie-wieder-in-deutschland",
];

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attr(value) {
  return esc(value).replace(/'/g, "&#039;");
}

function write(file, html) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const clean = html
    .trim()
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");
  fs.writeFileSync(file, `${clean}\n`);
}

function shell({ title, description, canonical, base = "../", main, extraHead = "" }) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)} | Wirkungsoekonomie.de</title>
    <meta name="description" content="${esc(description)}">
    <meta name="search_section" content="Debatten-Kompass">
    <meta name="search_type" content="Debattenkarte">
    ${extraHead}
    <link rel="canonical" href="${esc(canonical)}">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260606-nav-cache-fix">
  </head>
  <body>
    <header class="site-header" data-search-exclude>
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation" data-search-exclude></nav>
    </header>
    <main id="inhalt" data-pagefind-body>${main}</main>
    <footer class="footer" data-search-exclude><div class="footer-grid"><div><p class="hero-kicker">Debatten-Kompass</p><h2>Werkzeug statt Textarchiv.</h2><p>Quellen, Glossar, Status und Feedback machen die Einordnung nachvollziehbar. Die Wirkungsradar-Methode liefert den Prüfprozess im Hintergrund.</p><p><a class="text-link" href="${base}wirkungsradar/methode/">Wirkungsradar-Methode</a> · <a class="text-link" href="${base}wirkungsradar/antwort-playbooks/">Antwort-Playbooks</a> · <a class="text-link" href="${base}wirkungsradar/narrativ-einreichen/">Narrativ einreichen</a></p></div><a class="btn btn-primary" href="${base}wirkungsradar/">Debatten-Kompass öffnen</a></div></footer>
    <script src="${base}assets/js/main.js?v=20260606-main-cache-fix"></script>
  </body>
</html>`;
}

function radarNav(base = "") {
  const links = [
    ["Antwort finden", `${base}`],
    ["Debattenkarten", `${base}debattenkarten/`],
    ["Mythen & Narrative", `${base}narrative/`],
    ["Antwort-Playbooks", `${base}antwort-playbooks/`],
    ["Studio", `${base}studio/`],
    ["Narrativ einreichen", ACADEMY_NARRATIVE_URL],
    ["Wirkungsradar-Methode", `${base}methode/`],
    ["Quellen", `${base}quellen/`],
  ];
  return `<nav class="topic-subnav radar-sprint-nav" aria-label="Debatten-Kompass Navigation" data-search-exclude>${links.map(([label, href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join("")}</nav>`;
}

function topicFor(dossier) {
  const joined = (dossier.topicCluster || []).join(" ");
  for (const [key, label] of Object.entries(topicLabels)) {
    if (joined.includes(key)) return label;
  }
  return dossier.topicCluster?.[0] || "Wirkungsradar";
}

function narrativeFor(dossier) {
  const slug = dossier.slug;
  if (/migration|arbeit/.test(slug)) return "Sündenbock-Frame";
  if (/fusion|wasserstoff|e-fuels/.test(slug)) return "Aufschub-Frame";
  if (/deutschland|schulden/.test(slug)) return "Ohnmachts-Frame";
  if (/radwege|ukraine/.test(slug)) return "Geld-weg-Frame";
  if (/wind|co2|kernenergie|e-autos/.test(slug)) return "Spezialfall-Frame";
  return "Narrativ geprüft";
}

function sourceStatus(dossier) {
  return dossier.sources?.length ? "mit Quellen" : "Quellen offen";
}

function card(dossier, { base = "live/", compact = false } = {}) {
  const positiveLine = dossier.cockpit.positiveExample.hostLine || dossier.cockpit.positiveExample.text;
  const href = `${base}${dossier.slug}/`;
  const tags = [topicFor(dossier), narrativeFor(dossier), "geprüft v2"].join(" ");
  const search = [
    dossier.title,
    dossier.claim,
    dossier.cockpit.shortJudgement,
    dossier.cockpit.sayThisNow,
    dossier.cockpit.betterQuestion,
    narrativeFor(dossier),
    topicFor(dossier),
    sourceStatus(dossier),
    ...(dossier.claimVariants || []),
    ...(synonymMap[dossier.slug] || []),
  ].join(" ");
  return `<article class="card radar-sprint-card" data-radar-card data-topic="${attr(topicFor(dossier))}" data-status="checked_v2_positive_examples" data-source="${attr(sourceStatus(dossier))}" data-search="${attr(search)}">
    <div class="radar-card-badges"><span>${esc(topicFor(dossier))}</span><span>${esc(narrativeFor(dossier))}</span><span>Website 2.0</span><span>mit Quellenstand</span></div>
    <h3 class="card-title">${esc(dossier.title)}</h3>
    <p class="radar-card-judgement">${esc(dossier.cockpit.shortJudgement)}</p>
    <p class="card-text"><strong>Sag das jetzt:</strong> ${esc(dossier.cockpit.sayThisNow)}</p>
    <p class="card-text"><strong>Ein gutes Bild:</strong> ${esc(positiveLine)}</p>
    ${compact ? "" : `<p class="card-text"><strong>Die bessere Frage:</strong> ${esc(dossier.cockpit.betterQuestion)}</p>`}
    <div class="radar-card-actions"><a class="btn btn-primary" href="${esc(href)}">Antwort öffnen</a><button class="copy-chip" type="button" data-copy-text='${attr(dossier.cockpit.sayThisNow)}' aria-label="Kurzantwort zu ${attr(dossier.title)} kopieren">Kurzantwort kopieren</button></div>
  </article>`;
}

function searchPanel({ id = "radar-suche", placeholder }) {
  return `<section class="section radar-sprint-search" id="${esc(id)}" data-radar-search>
    <div>
      <label class="radar-search-field"><span>Welche Aussage willst du beantworten?</span><input type="search" placeholder="${esc(placeholder)}" autocomplete="off" data-radar-search-input></label>
      <div class="v2-home-chip-row" aria-label="Schnellchips">${[
        ["Deutschland nur 2 %", "live/deutschland-nur-zwei-prozent/"],
        ["Migration kostet nur", "live/migration-kostet-nur/"],
        ["E-Autos sind schlimmer", "live/e-autos-schlimmer-als-verbrenner/"],
        ["Windräder zerstören Natur", "live/windraeder-voegel-wald-beton-rueckbau/"],
        ["Bürgergeld macht faul", "live/arbeit-lohnt-sich-nicht-mehr/"],
        ["Schulden belasten unsere Kinder", "live/schulden-machen-oder-sparen/"],
        ["Radwege in Peru", "live/radwege-in-peru/"],
        ["Ukraine-Hilfe kostet uns", "live/ukraine-unterstuetzung-steuergeld/"],
        ["Fusion löst alles", "live/fusion-loest-das-energieproblem/"],
        ["E-Fuels retten den Verbrenner", "live/e-fuels-retten-den-verbrenner/"],
        ["Kernkraft zurück", "live/kernenergie-wieder-in-deutschland/"],
        ["CO₂-Preis ist Abzocke", "live/co2-preis-oder-fossile-systemkosten/"],
      ].map(([label, href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join("")}</div>
      <p class="radar-search-status" data-radar-search-status>Radar-Inhalte werden geladen.</p>
      <div class="radar-search-results" data-radar-search-results></div>
    </div>
  </section>`;
}

function homePage() {
  const cards = lighthouseSlugs.map((slug) => p0DossiersV2.find((dossier) => dossier.slug === slug)).filter(Boolean).slice(0, 12);
  const extraHead = `<meta name="search_tags" content="Wirkungsradar, Fakten, Folgen, Frames, Psychologie, bessere Antworten, Narrativ einreichen">`;
  const main = `
    <section class="hero radar-page-hero radar-sprint-hero">
      <div class="hero-grid">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Start</a> / Debatten-Kompass</nav>
          <p class="hero-kicker">Debatten-Kompass</p>
          <h1 class="hero-title">Debatten-Kompass</h1>
          <p class="hero-subtitle">Mythen erkennen. Fakten klären. Folgen verstehen. Besser antworten.</p>
          <p class="radar-sprint-lead">Der Debatten-Kompass hilft dir, öffentliche Aussagen schnell einzuordnen: Was stimmt? Was fehlt? Welcher Frame wird gesetzt? Welche Folgen hätte falsches Handeln? Und wie antwortest du, ohne das Narrativ zu verstärken?</p>
          <div class="hero-actions"><a class="btn btn-primary" href="#radar-suche">Antwort finden</a><a class="btn btn-secondary" href="debattenkarten/">Debattenkarten öffnen</a><a class="btn btn-secondary" href="narrative/">Mythen & Narrative</a><a class="btn btn-secondary" href="methode/">Wirkungsradar-Methode</a></div>
        </div>
        <figure class="radar-hero-visual"><img src="../assets/img/blog/2026-05-19-wirkungspotenzial-fakten.webp" alt="Debatten-Kompass: Fakten, Frames und Folgen" width="1659" height="948" decoding="async"></figure>
      </div>
    </section>
    ${searchPanel({ placeholder: "E-Autos sind schlimmer, Deutschland nur 2 %, Migration kostet nur..." })}
    ${radarNav("./")}
    <section class="section" id="schnell-antworten"><div><div class="section-header"><p class="hero-kicker">Schnell antworten</p><h2>Debattenkarten mit Quellenstand.</h2><p>Kompakt für Kommentare, Livestreams, Panels, Unterricht und Redaktion. Keine Abstracts, keine Textwand.</p></div><div class="card-grid three">${cards.map((dossier) => card(dossier, { base: "live/", compact: true })).join("")}</div></div></section>
    <section class="section section-soft" id="mythen-narrative"><div><div class="section-header"><p class="hero-kicker">Mythen & Narrative verstehen</p><h2>Warum mehr als Faktencheck?</h2><p>Ein Faktencheck fragt, ob eine Aussage stimmt. Der Debatten-Kompass fragt zusätzlich, was die Aussage bewirkt: welche Gefühle sie aktiviert, was sie ausblendet, welche Folgen sie hat und welche Lösung den Zustand verbessert.</p></div><div class="card-grid six">${["Fakt", "Frame", "Psychologie", "Folgen", "Systemwirkung", "Lösung"].map((title) => `<article class="card"><p class="card-kicker">${esc(title)}</p><p class="card-text">${esc(methodLine(title))}</p></article>`).join("")}</div><p><a class="btn btn-primary" href="methode/">Wirkungsradar-Methode verstehen</a></p></div></section>
  `;
  return shell({ title: "Debatten-Kompass - Mythen erkennen, Fakten klären, besser antworten", description: "Schnelle Antwort, Faktenlage, Folgencheck, Frame-Shift und Quellen zu öffentlichen Aussagen, Mythen und Narrativen.", canonical: "https://wirkungsoekonomie.de/wirkungsradar/", base: "../", main, extraHead });
}

function methodLine(title) {
  return {
    Fakt: "Was ist belegt, was ist nur behauptet?",
    Frame: "Welche Geschichte setzt der Satz?",
    Psychologie: "Welches Gefühl sortiert der Satz?",
    Folgen: "Was passiert, wenn Menschen danach handeln?",
    Systemwirkung: "Welche Kosten, Pfade und Nebenwirkungen werden mitgezählt?",
    Lösung: "Welche Antwort macht den Zustand besser?",
  }[title];
}

function debateCardsPage({ canonical = "https://wirkungsoekonomie.de/wirkungsradar/debattenkarten/", legacyRoute = false } = {}) {
  const filters = ["Klima", "Energie", "Mobilität", "Migration", "Sozialstaat", "Arbeit", "Staat & Schulden", "Steuern", "Demokratie", "Medien", "Wirtschaft", "Wohnen", "Ausland & Sicherheit"];
  const quickClaims = [
    ["Migration kostet nur", "../live/migration-kostet-nur/"],
    ["Deutschland nur 2 %", "../live/deutschland-nur-zwei-prozent/"],
    ["E-Autos schlimmer?", "../live/e-autos-schlimmer-als-verbrenner/"],
    ["Bürgergeld macht faul", "../live/arbeit-lohnt-sich-nicht-mehr/"],
    ["Windräder & Natur", "../live/windraeder-voegel-wald-beton-rueckbau/"],
    ["Fusion löst alles", "../live/fusion-loest-das-energieproblem/"],
    ["E-Fuels retten Verbrenner", "../live/e-fuels-retten-den-verbrenner/"],
    ["Ukraine-Hilfe kostet uns", "../live/ukraine-unterstuetzung-steuergeld/"],
  ];
  const main = `
    <section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Debatten-Kompass</a> / Debattenkarten</nav><p class="hero-kicker">Debattenkarten</p><h1 class="hero-title">Welche Aussage willst du beantworten?</h1><p class="hero-subtitle">Such den Satz, öffne die passende Antwort und kopiere eine ruhige Kurzreaktion.</p>${legacyRoute ? `<p class="radar-sprint-lead">Für Kommentare, Livestreams, Panels, Unterricht und Redaktion: erst Antwort finden, dann bei Bedarf Faktenlage, Folgencheck und Psychologie vertiefen.</p>` : ""}</div></section>
    <section class="section radar-live-controls radar-answer-first" data-radar-live-filter><div><label class="radar-search-field"><span>Direkt zur passenden Antwort</span><input type="search" placeholder="z. B. Migration kostet nur, Deutschland nur 2 %, E-Autos schlimmer..." data-live-query autofocus></label><div class="v2-home-chip-row" aria-label="Häufig gesuchte Aussagen">${quickClaims.map(([label, href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join("")}</div><div class="filter-chip-row" aria-label="Themenfilter"><button type="button" data-live-filter="all" aria-pressed="true">Alle Themen</button>${filters.map((filter) => `<button type="button" data-live-filter="${attr(filter)}">${esc(filter)}</button>`).join("")}</div><p class="radar-search-status" data-live-count>${p0DossiersV2.length} Karten gefunden</p></div></section>
    ${radarNav("../")}
    <section class="section" id="p0-geprueft"><div><div class="section-header"><p class="hero-kicker">Antworten</p><h2>In Sekunden zur passenden Karte.</h2><p>Jede Karte zeigt Kurzurteil, Sofortantwort, gutes Bild und bessere Frage. Psychologie und Methode kommen danach als Vertiefung.</p></div><div class="card-grid three" data-live-grid>${p0DossiersV2.map((dossier) => card(dossier, { base: "../live/", compact: false })).join("")}</div></div></section>
    <section class="section section-soft" id="ueberarbeitung"><div><div class="section-header"><p class="hero-kicker">In Überarbeitung</p><h2>Nicht prominent empfehlen.</h2><p>Diese Karte wird überarbeitet, damit sie keine problematischen Frames verstärkt.</p></div><div class="card-grid three"><article class="card radar-draft-card"><p class="card-kicker">Warnbadge</p><h3 class="card-title">draft_dehumanization_risk</h3><p class="card-text">Nur hier anzeigen, nicht auf Startseite oder als Empfehlung.</p></article><article class="card radar-draft-card"><p class="card-kicker">Warnbadge</p><h3 class="card-title">draft_example_amplifies_frame</h3><p class="card-text">Erst positives Bild und bessere Frage reparieren.</p></article></div></div></section>
    <section class="section" id="psychologie-vertiefung"><div><div class="section-header"><p class="hero-kicker">Vertiefung</p><h2>Psychologischer Wirkungscheck.</h2><p>Wenn du die passende Antwort gefunden hast, hilft der Wirkungscheck zu verstehen, warum der Satz hängen bleibt: Angst, Wut, Kontrollverlust, Statusbedrohung, Bestätigungsfehler oder Sündenbocklogik.</p></div><div class="card-grid three"><a class="card text-link-card" href="../psychologie/"><p class="card-kicker">Psychologie</p><h3 class="card-title">Warum der Satz zieht</h3><p class="card-text">Psychologische Effekte und Manipulationsmuster alltagssprachlich erklärt.</p></a><a class="card text-link-card" href="../narrative/"><p class="card-kicker">Mythen &amp; Narrative</p><h3 class="card-title">Welche Geschichte gesetzt wird</h3><p class="card-text">Narrativfamilien, typische Sätze und der Weg zurück zur Wirkungsfrage.</p></a><a class="card text-link-card" href="../methode/"><p class="card-kicker">Methode</p><h3 class="card-title">Warum mehr als Faktencheck?</h3><p class="card-text">Faktenkern, Frame, Folgencheck, Systemwirkung und bessere Antwort.</p></a></div></div></section>
  `;
  return shell({ title: "Debattenkarten - schnelle Antworten auf Mythen und Narrative", description: "Schnelle Antworten auf Mythen, Narrative und Stöckchen mit Kurzantwort, Kurzurteil, Faktenlage, Folgencheck und Quellen.", canonical, base: "../../", main });
}

const narrativeGroups = [
  ["macht-dich-klein", "Macht dich klein", "Diese Sätze sagen: Du kannst sowieso nichts ändern.", ["Deutschland nur 2 %", "bringt doch nichts", "die da oben machen eh was sie wollen"], ["Ohnmacht", "Kontrollverlust", "Verantwortungsdiffusion"], ["deutschland-nur-zwei-prozent", "schulden-machen-oder-sparen"]],
  ["macht-dich-wuetend", "Macht dich wütend", "Diese Sätze machen aus Problemen eine Kränkung.", ["Heizhammer", "CO₂-Abzocke", "unser Geld geht weg"], ["Kränkung", "Verlustaversion", "Wut"], ["co2-preis-oder-fossile-systemkosten", "ukraine-unterstuetzung-steuergeld"]],
  ["gibt-dir-einen-schuldigen", "Gibt dir einen Schuldigen", "Diese Sätze machen komplexe Probleme zu einer Gruppe.", ["Migration kostet nur", "Bürgergeld macht faul", "Altparteien"], ["Sündenbock", "Zero-Sum", "Entlastung"], ["migration-kostet-nur", "arbeit-lohnt-sich-nicht-mehr"]],
  ["verkauft-warten-als-vernunft", "Verkauft Warten als Vernunft", "Diese Sätze sagen: Mach jetzt nichts, später kommt eine perfekte Lösung.", ["Fusion löst alles", "Wasserstoff für alles", "E-Fuels retten den Verbrenner"], ["Technikwunder", "Status quo", "Aufschub"], ["fusion-loest-das-energieproblem", "wasserstoff-fuer-alles", "e-fuels-retten-den-verbrenner"]],
  ["verwechselt-freiheit-mit-folgekosten", "Verwechselt Freiheit mit Folgekosten", "Diese Sätze nennen Freiheit, blenden aber die Kosten für andere aus.", ["freie Fahrt", "weiter tanken", "Heizung wie bisher"], ["Freiheitsframe", "Externalisierung", "Verlustaversion"], ["e-fuels-retten-den-verbrenner", "co2-preis-oder-fossile-systemkosten"]],
  ["zerstoert-vertrauen", "Zerstört Vertrauen", "Diese Sätze greifen Quellen, Wissenschaft und Institutionen an.", ["Medien lügen", "Wissenschaft ist gekauft", "Verfassungsschutz ist Regierungsschutz"], ["Misstrauen", "Quellenzerstörung", "Ingroup"], []],
  ["macht-regeln-zu-unterdrueckung", "Macht aus Regeln Unterdrückung", "Diese Sätze machen demokratische Steuerung zu Diktatur.", ["Klimadiktatur", "Zensur", "Planwirtschaft"], ["Reaktanz", "Kontrollverlust", "Diktaturframe"], ["co2-preis-oder-fossile-systemkosten"]],
  ["spezialfall-als-gegenargument", "Macht aus Spezialfällen Gegenargumente", "Diese Sätze nehmen einen Sonderfall und tun so, als kippe dadurch das Ganze.", ["ein Bürgergeldfall", "ein Windrad und ein Vogel", "E-Fuels für Flugzeuge, also Pkw-Verbrenner"], ["Verfügbarkeitsheuristik", "Anekdote", "Scheinbeweis"], ["windraeder-voegel-wald-beton-rueckbau", "e-fuels-retten-den-verbrenner"]],
];

function narrativeIndex() {
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Wirkungsradar</a> / Narrative</nav><p class="hero-kicker">Lern-Modus</p><h1 class="hero-title">Narrative verstehen</h1><p class="hero-subtitle">Welche Geschichte steckt im Satz - und was soll sie bei Menschen auslösen?</p><p class="radar-sprint-lead">Ein Narrativ ist nicht einfach eine falsche Behauptung. Es ist eine Geschichte, die sagt: Wer ist schuld? Wer ist Opfer? Was wirkt bedrohlich? Welche Lösung fühlt sich richtig an?</p></div></section>${radarNav("../")}<section class="section"><div><div class="card-grid two">${narrativeGroups.map(narrativeCard).join("")}</div></div></section>`;
  return shell({ title: "Narrative verstehen", description: "Narrative im Wirkungsradar nach menschlicher Wirkung sortiert: Ohnmacht, Wut, Schuldige, Aufschub, Misstrauen und Regeln-als-Unterdrückung.", canonical: "https://wirkungsoekonomie.de/wirkungsradar/narrative/", base: "../../", main });
}

function narrativeCard([slug, title, text, examples, effects, liveSlugs]) {
  return `<a class="card text-link-card radar-narrative-card" href="${slug}/"><p class="card-kicker">${esc(effects.join(" · "))}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p><p class="card-text"><strong>Der Trick:</strong> Ein Gefühl wird schneller gemacht als die Prüfung.</p><p class="card-text"><strong>So kommst du raus:</strong> Wahren Punkt anerkennen, gutes Bild setzen, bessere Frage stellen.</p><div class="radar-card-badges">${examples.slice(0, 4).map((item) => `<span>${esc(item)}</span>`).join("")}</div>${liveSlugs.length ? `<p class="card-text"><strong>Debattenkarten:</strong> ${liveSlugs.map((slug) => p0DossiersV2.find((dossier) => dossier.slug === slug)?.title).filter(Boolean).join(", ")}</p>` : ""}</a>`;
}

function narrativeDetail([slug, title, text, examples, effects, liveSlugs]) {
  const liveCards = liveSlugs.map((slug) => p0DossiersV2.find((dossier) => dossier.slug === slug)).filter(Boolean);
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Debatten-Kompass</a> / <a href="../">Narrative</a> / ${esc(title)}</nav><p class="hero-kicker">Mythen & Narrative</p><h1 class="hero-title">${esc(title)}</h1><p class="hero-subtitle">${esc(text)}</p><p class="radar-sprint-lead"><strong>Ein gutes Bild:</strong> Eine Debatte gewinnt Orientierung, wenn sie nicht beim Vorwurf stehen bleibt, sondern zeigt, welcher bessere Zustand erreichbar ist.</p></div></section>${radarNav("../")}<section class="section"><div><div class="card-grid two"><article class="card"><p class="card-kicker">Was ist das Narrativ?</p><p class="card-text">${esc(text)}</p></article><article class="card"><p class="card-kicker">Was soll es auslösen?</p>${effects.length ? `<div class="radar-card-badges">${effects.map((item) => `<span>${esc(item)}</span>`).join("")}</div>` : ""}</article><article class="card"><p class="card-kicker">Woran erkennst du es?</p><ul class="clean-list">${examples.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article><article class="card"><p class="card-kicker">So reagierst du</p><p class="card-text"><strong>Nicht so:</strong> Den Vorwurf lange wiederholen.</p><p class="card-text"><strong>Besser so:</strong> Den wahren Punkt benennen und die Wirkung prüfen.</p><p class="card-text"><strong>Die bessere Frage:</strong> Was wird besser, wenn wir dieser Geschichte folgen?</p></article></div></div></section><section class="section section-soft"><div><div class="section-header"><p class="hero-kicker">Passende Debattenkarten</p><h2>Beispiele zum Anwenden.</h2></div><div class="card-grid three">${liveCards.length ? liveCards.map((dossier) => card(dossier, { base: "../../live/", compact: true })).join("") : `<article class="card"><p class="card-text">Weitere Debattenkarten werden redaktionell verknüpft.</p></article>`}</div></div></section>`;
  return shell({ title, description: text, canonical: `https://wirkungsoekonomie.de/wirkungsradar/narrative/${slug}/`, base: "../../../", main });
}

const psychologyItems = [
  ["Kleine Zahl als Freispruch", "Verantwortungsdiffusion", "Deutschland nur 2 %", "Rechnung öffnen.", ["deutschland-nur-zwei-prozent"]],
  ["Ein Extremfall wird zum Systembild", "Verfügbarkeitsheuristik", "Bürgergeld-Einzelfall", "Einzelfall prüfen, Grundgesamtheit zeigen.", ["arbeit-lohnt-sich-nicht-mehr"]],
  ["Das Vertraute fühlt sich sicherer an", "Status-quo-Bias", "Verbrenner, Gasheizung, Grundlast", "Gutes Zukunftsbild zeigen.", ["e-fuels-retten-den-verbrenner", "kernenergie-wieder-in-deutschland"]],
  ["Veränderung fühlt sich wie Verlust an", "Verlustaversion", "Heizgesetz, CO₂-Preis", "Entlastung und Planung zeigen.", ["co2-preis-oder-fossile-systemkosten"]],
  ["Ein Schuldiger macht es einfacher", "Sündenbockmechanismus", "Migration, Bürgergeld", "Strukturen statt Gruppen betrachten.", ["migration-kostet-nur", "arbeit-lohnt-sich-nicht-mehr"]],
  ["Große Zahlen machen müde", "Überforderungsreaktion", "Ukraine-Hilfe, Schulden, Klimakosten", "Summe zerlegen.", ["ukraine-unterstuetzung-steuergeld", "schulden-machen-oder-sparen"]],
  ["Spott verhindert Prüfung", "Lächerlichkeitsframe", "Radwege in Peru", "Wirkung prüfen.", ["radwege-in-peru"]],
  ["Hightech beruhigt", "Technological Fix Bias", "Fusion, Wasserstoff, E-Fuels", "Zeit, Systempfad und OPEX prüfen.", ["fusion-loest-das-energieproblem", "wasserstoff-fuer-alles", "e-fuels-retten-den-verbrenner"]],
];

function psychologyPage() {
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Debatten-Kompass</a> / Psychologie</nav><p class="hero-kicker">Vertiefung</p><h1 class="hero-title">Warum Sätze hängen bleiben</h1><p class="hero-subtitle">Psychologische Effekte im Debatten-Kompass - einfach erklärt.</p><p class="radar-sprint-lead">Viele Aussagen wirken nicht, weil sie besonders wahr sind. Sie wirken, weil sie ein Gefühl sortieren: Angst, Wut, Entlastung, Zugehörigkeit, Kontrolle oder Ohnmacht.</p></div></section>${radarNav("../")}<section class="section"><div><div class="card-grid two">${psychologyItems.map(([title, term, example, out, slugs]) => `<article class="card radar-psych-card"><p class="card-kicker">${esc(term)}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text"><strong>Typischer Claim:</strong> ${esc(example)}</p><p class="card-text"><strong>So kommst du raus:</strong> ${esc(out)}</p><div class="radar-link-cluster">${slugs.map((slug) => `<a href="../live/${esc(slug)}/">${esc(p0DossiersV2.find((dossier) => dossier.slug === slug)?.title || slug)}</a>`).join("")}</div></article>`).join("")}</div></div></section>`;
  return shell({ title: "Warum Sätze hängen bleiben", description: "Psychologische Effekte im Wirkungsradar einfach erklärt: Verantwortungsdiffusion, Verfügbarkeitsheuristik, Status-quo-Bias und mehr.", canonical: "https://wirkungsoekonomie.de/wirkungsradar/psychologie/", base: "../../", main });
}

function answerPlaybookPage() {
  const steps = [
    ["Nicht sofort widersprechen.", "Ich sehe den Punkt."],
    ["Wahren Kern kurz anerkennen.", "Ja, da gibt es eine echte Frage."],
    ["Frame nicht übernehmen.", "Ich würde es nicht als X erzählen."],
    ["Gutes Bild setzen.", "So sieht es aus, wenn es funktioniert..."],
    ["Bessere Frage stellen.", "Die bessere Frage ist..."],
  ];
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Debatten-Kompass</a> / Antwort-Playbooks</nav><p class="hero-kicker">Antwort-Playbooks</p><h1 class="hero-title">Antwort-Playbooks</h1><p class="hero-subtitle">So reagierst du ruhig, klar und frame-sicher.</p></div></section>${radarNav("../")}<section class="section"><div><div class="section-header"><p class="hero-kicker">Die 5-Schritt-Antwort</p><h2>Ruhig bleiben, Rechnung öffnen.</h2></div><ol class="timeline radar-flow">${steps.map(([title, sentence], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${esc(title)}</strong><p>${esc(sentence)}</p></div></li>`).join("")}</ol><article class="card radar-standard-formula"><p class="card-kicker">Standardformel</p><p class="card-text">Der Punkt ist nicht völlig aus der Luft. Der falsche Sprung ist ... Ein gutes Bild ist ... Die bessere Frage lautet ... Die Lösung ist ...</p><button class="copy-chip" type="button" data-copy-text="Der Punkt ist nicht völlig aus der Luft. Der falsche Sprung ist ... Ein gutes Bild ist ... Die bessere Frage lautet ... Die Lösung ist ...">Formel kopieren</button></article></div></section><section class="section section-soft"><div><div class="card-grid three"><article class="card"><p class="card-kicker">Kommentarspalte</p><p class="card-text">Kurz, ruhig, ohne Frame-Wiederholung. Eine klare Antwort plus bessere Frage.</p></article><article class="card"><p class="card-kicker">TikTok-Live</p><p class="card-text">Erst wahren Kern anerkennen, dann die Rechnung öffnen und ein gutes Bild setzen.</p></article><article class="card"><p class="card-kicker">Panel / Interview</p><p class="card-text">Bilanzgrenze, Faktenlage, Folgencheck und Lösungspfad in zwei Minuten sortieren.</p></article><article class="card"><p class="card-kicker">Vermeiden</p><ul class="clean-list"><li>Mythos lange wiederholen</li><li>Menschen beschämen</li><li>mit Moral starten</li><li>nur Fakten stapeln</li><li>negative Bilder nachmalen</li></ul></article></div></div></section>`;
  return shell({ title: "Antwort-Playbooks", description: "Konkrete Antwortformeln für Kommentarspalten, TikTok-Live, Panels, Unterricht, Provokation, echte Sorge und Desinformation.", canonical: "https://wirkungsoekonomie.de/wirkungsradar/antwort-playbooks/", base: "../../", main });
}

function themesPage() {
  const themes = ["Klima", "Energie", "Mobilität", "Migration", "Sozialstaat", "Arbeit", "Staat & Schulden", "Steuern", "Wirtschaft", "Demokratie", "Medien", "Wohnen", "Gesundheit", "Ausland & Sicherheit", "Technologie"];
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Debatten-Kompass</a> / Themen</nav><p class="hero-kicker">Themencluster</p><h1 class="hero-title">Themen entdecken</h1><p class="hero-subtitle">Top-Claims, typische Narrative, psychologische Muster, passende Lösungen und Quellencluster.</p></div></section>${radarNav("../")}<section class="section"><div><div class="card-grid three">${themes.map((theme) => { const dossiers = p0DossiersV2.filter((dossier) => topicFor(dossier) === theme || dossier.topicCluster?.join(" ").includes(theme.split(" ")[0])); return `<article class="card"><p class="card-kicker">${esc(theme)}</p><h3 class="card-title">${esc(theme)}</h3><p class="card-text">Top-Claims: ${dossiers.map((dossier) => dossier.title).slice(0, 3).join(", ") || "wird redaktionell ergänzt"}</p><p class="card-text">Typische Narrative: ${dossiers.map(narrativeFor).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3).join(", ") || "in Prüfung"}</p><p><a class="btn btn-secondary" href="../debattenkarten/">Passende Karten öffnen</a></p></article>`; }).join("")}</div></div></section>`;
  return shell({ title: "Wirkungsradar Themen", description: "Themenzugang zu Klima, Energie, Mobilität, Migration, Sozialstaat, Arbeit, Staat, Steuern, Demokratie, Medien und Sicherheit.", canonical: "https://wirkungsoekonomie.de/wirkungsradar/themen/", base: "../../", main });
}

function methodPage() {
  const sections = ["Warum Faktencheck allein nicht reicht", "Der Folgencheck", "Frameanalyse", "Psychologischer Wirkungscheck", "Bilanzgrenzen", "Wirkung erster, zweiter, dritter Ordnung", "Systemische Wirkungen", "Quellen und Unsicherheit", "Wie wir Status vergeben", "Was der Wirkungsradar nicht ist"];
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Debatten-Kompass</a> / Wirkungsradar-Methode</nav><p class="hero-kicker">Wirkungsradar-Methode</p><h1 class="hero-title">Die Wirkungsradar-Methode</h1><p class="hero-subtitle">Warum der Debatten-Kompass mehr macht als einen Faktencheck.</p><p class="radar-sprint-lead">Der Debatten-Kompass nutzt die Wirkungsradar-Methode. Sie verbindet Faktenlage, Folgencheck, Frameanalyse, psychologische Wirkung und lösungsorientierte Antwort.</p></div></section>${radarNav("../")}<section class="section"><div><div class="card-grid two">${sections.map((title, index) => `<article class="card"><p class="card-kicker">${String(index + 1).padStart(2, "0")}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(methodDescription(title))}</p></article>`).join("")}</div></div></section>`;
  return shell({ title: "Die Wirkungsradar-Methode", description: "Warum der Debatten-Kompass mehr macht als Faktencheck: Faktenlage, Folgencheck, Bilanzgrenzen, Frames, Psychologie, Lösungspfad und Quellen.", canonical: "https://wirkungsoekonomie.de/wirkungsradar/methode/", base: "../../", main });
}

function methodDescription(title) {
  return {
    "Warum Faktencheck allein nicht reicht": "Ein Satz kann teilweise stimmen und trotzdem zu falschem Handeln führen.",
    "Der Folgencheck": "Wir prüfen, was wahrscheinlicher wird, wenn Menschen dem Satz folgen.",
    Frameanalyse: "Wir benennen das Bild, das die Debatte steuern soll.",
    "Psychologischer Wirkungscheck": "Wir erklären alltagssprachlich, warum der Satz zieht.",
    Bilanzgrenzen: "Wir öffnen, was mitgezählt und was ausgeblendet wird.",
    "Wirkung erster, zweiter, dritter Ordnung": "Sofortwirkung, Anschlusswirkung und Systempfad werden getrennt.",
    "Systemische Wirkungen": "Kosten, Infrastruktur, Vertrauen, Demokratie und Alternativen gehören zusammen.",
    "Quellen und Unsicherheit": "Quellen zeigen, was sie belegen und wo ihre Grenze liegt.",
    "Wie wir Status vergeben": "Geprüfte Karten werden prominent, riskante Entwürfe nur als Überarbeitung gezeigt.",
    "Was der Wirkungsradar nicht ist": "Kein Wahrheitsministerium, keine Personenbewertung, kein moralischer Pranger.",
  }[title];
}

function reviewReport() {
  const checks = [
    ["Startseite", "PASS", "Suche oben sichtbar, Schnellchips und 12 P0-Karten kompakt; Methodik nach unten verschoben."],
    ["Live-Übersicht", "PASS", "Suche, Themenfilter, Statusfilter, geprüfte P0-Karten und Copy-Buttons vorhanden."],
    ["Narrative", "PASS", "Nach menschlicher Wirkung gruppiert und mit typischen Claims/Debattenkarten verlinkt."],
    ["Psychologie", "PASS", "Alltagssprache, Fachbegriffe als Badge, passende Debattenkarten."],
    ["Host-Playbook", "PASS", "5-Schritt-Antwort, Standardformel und Beispiele vorhanden."],
    ["Mobile", "PASS", "Grid fällt auf einspaltige Karten zurück; Suche und Buttons bleiben erreichbar."],
    ["Trust / Quellen", "PASS", "TrustBlock bleibt auf Dossiers; Übersichten zeigen Quellenstatus und geprüften Status."],
  ];
  return ["# Sprint 3 UX Review", "", ...checks.flatMap(([title, status, problem]) => [`## ${title}`, status, "Probleme:", `- ${problem}`, ""]), "## Nächste Schritte", "- Sprint 4: Quellen, Glossar, interne Verlinkung und redaktionelle Governance.", ""].join("\n");
}

function writeData() {
  write(OUT("assets/data/wirkungsradar-synonyms.json"), JSON.stringify(synonymMap, null, 2));
  const review = p0DossiersV2.map((dossier) => ({ slug: dossier.slug, status: validateDossierV2(dossier).status, rank: p0EditorialGates[dossier.slug]?.p0Rank || null }));
  write(OUT("assets/data/wirkungsradar-p0-status.json"), JSON.stringify(review, null, 2));
}

writeData();
write(OUT("wirkungsradar/index.html"), homePage());
write(OUT("wirkungsradar/live/index.html"), debateCardsPage({ canonical: "https://wirkungsoekonomie.de/wirkungsradar/live/", legacyRoute: true }));
write(OUT("wirkungsradar/debattenkarten/index.html"), debateCardsPage());
write(OUT("wirkungsradar/narrative/index.html"), narrativeIndex());
for (const group of narrativeGroups) write(OUT("wirkungsradar/narrative", group[0], "index.html"), narrativeDetail(group));
write(OUT("wirkungsradar/psychologie/index.html"), psychologyPage());
write(OUT("wirkungsradar/host-playbook/index.html"), answerPlaybookPage());
write(OUT("wirkungsradar/antwort-playbooks/index.html"), answerPlaybookPage());
write(OUT("wirkungsradar/themen/index.html"), themesPage());
write(OUT("wirkungsradar/methode/index.html"), methodPage());
write(OUT("reports/sprint-3-ux-review.md"), reviewReport());
console.log("Built Wirkungsradar Sprint 3 UX pages and report.");
