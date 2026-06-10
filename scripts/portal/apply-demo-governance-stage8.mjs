import fs from "node:fs";
import path from "node:path";
import {
  demoGovernanceMarkerEnd,
  demoGovernanceMarkerStart,
  renderDemoGovernanceBlock,
} from "../lib/demo-layout-components.mjs";

const root = process.cwd();
const skipDemoGovernance = new Set([
  "erleben/unternehmens-wirkungsprofil/index.html",
  "erleben/wirkungskompass/index.html",
  "erleben/laender-wirkungskompass/index.html",
  "erleben/europa-wirkungskompass/index.html",
  "erleben/welt-wirkungskompass/index.html",
]);

const defaults = {
  assumptions: "Die Demo nutzt vereinfachte Wirkungspfade, Schwellen, Gewichtungen und Beispielwerte. Sie zeigt Struktur und Logik, nicht den finalen Prüfstandard.",
  dataQuality: "Demo-Werte sind modellhaft. Reale Anwendungen brauchen Quellen, Versionen, Datenqualitätsstufen, Unsicherheitsmarkierung und prüfbare Nachweise.",
  not: "Die Demo ersetzt keine amtliche Bewertung, keine Beratung, keine Auditierung, keine Zertifizierung und keine fachliche Einzelfallprüfung.",
  protection: "Keine Personenbewertung, keine automatische Entscheidung, keine Kompensation roter Linien und keine verdeckte Beratung. Datenqualität und Unsicherheit bleiben sichtbar.",
  methods: [
    { label: "Methoden & Werkzeuge", href: "werkzeuge/" },
    { label: "Datenqualität & Assurance", href: "werkzeuge/datenqualitaet-assurance/" },
    { label: "Reverse Merit Order", href: "werkzeuge/reverse-merit-order/" },
  ],
  docs: [
    { label: "Arbeitsbibliothek", href: "werkstatt/arbeitsbibliothek/" },
    { label: "Sprachregelwerk", href: "content/governance/woek-language-rules.md" },
    { label: "Einwände & Schutzgrenzen", href: "einwaende/" },
  ],
  nextText: "Nutze das Ergebnis als Lern- und Diskussionsanstoß und prüfe danach Methodik, Datenlage und passende Wirkungsfelder.",
  next: [
    { label: "Wirkungsfelder", href: "wirkungsfelder/" },
    { label: "Bibliothek", href: "downloads.html" },
  ],
};

const demos = [
  {
    slug: "erleben-hub",
    file: "erleben/index.html",
    title: "Erleben-Hub",
    shows: "Die Seite bündelt interaktive Zugänge, Rechner, Scanner und Beispiele, damit Nutzer:innen die Wirkungslogik praktisch ausprobieren können.",
    next: [{ label: "Methoden & Werkzeuge", href: "werkzeuge/" }, { label: "WÖk auf einer Seite", href: "verstehen/woek-auf-einer-seite/" }],
  },
  {
    slug: "erleben-alias",
    file: "erleben.html",
    title: "Erleben-Hub alte URL",
    shows: "Die alte Erleben-URL bleibt als Einstieg erhalten und verweist weiterhin auf die interaktive Erlebniswelt.",
    next: [{ label: "Kanonische Erleben-Seite", href: "erleben/" }, { label: "Methoden & Werkzeuge", href: "werkzeuge/" }],
  },
  {
    slug: "produktwirkungsrechner",
    file: "erleben/produktwirkungsrechner/index.html",
    title: "Produktwirkungsrechner",
    shows: "Wie Produktdaten, Lieferkette, schwächstes Wirkungsfeld, Steuerlogik und Preiswirkung modellhaft zusammenwirken.",
    methods: [{ label: "Produktscorecards", href: "werkzeuge/produktscorecards/" }, { label: "Digitale Produktpässe", href: "werkzeuge/digitale-produktpaesse/" }, { label: "Reverse Merit Order", href: "werkzeuge/reverse-merit-order/" }],
    docs: [{ label: "Produktbesteuerung durch Wirkung", href: "wirkungsfelder/produkte-konsum/produktbesteuerung-durch-wirkung/" }, { label: "Apfelbeispiel", href: "wirkungsfelder/produkte-konsum/apfelbeispiel/" }],
    next: [{ label: "Produkte & Konsum", href: "wirkungsfelder/produkte-konsum/" }, { label: "Scorecard-Dashboard", href: "scorecard-dashboard.html" }],
  },
  {
    slug: "scorecard-dashboard",
    file: "scorecard-dashboard.html",
    title: "Produktpass- und Scorecard-Dashboard",
    shows: "Wie Produktpassdaten, Wirkungsfelder, Scorecards, externe Kosten und Drill-down-Ansichten modellhaft zusammenlaufen.",
    methods: [{ label: "Scorecards", href: "werkzeuge/scorecards/" }, { label: "WÖk-IDs", href: "werkzeuge/woek-ids/" }, { label: "Datenqualität & Assurance", href: "werkzeuge/datenqualitaet-assurance/" }],
    docs: [{ label: "Produktscorecards", href: "wirkungsfelder/produkte-konsum/produktscorecards-reverse-merit-order-digitale-produktpaesse/" }, { label: "Arbeitsbibliothek Produkte", href: "werkstatt/arbeitsbibliothek/wirkungsfelder/produkte-konsum/" }],
    next: [{ label: "Produkte & Konsum", href: "wirkungsfelder/produkte-konsum/" }, { label: "Produktwirkungsrechner", href: "erleben/produktwirkungsrechner/" }],
  },
  {
    slug: "medienwirkungscheck",
    file: "erleben/medienwirkungscheck/index.html",
    title: "Medienwirkungscheck",
    shows: "Wie Quellenklarheit, Faktenintegrität, Kontextqualität, Diskursverträglichkeit und Korrekturfähigkeit als Wirkungsbedingungen sichtbar werden.",
    methods: [{ label: "Medienwirkungscheck", href: "werkzeuge/medienwirkungscheck/" }, { label: "Scorecards", href: "werkzeuge/scorecards/" }, { label: "Sprach- und Framing-Analyse", href: "werkzeuge/sprach-und-framing-analyse/" }],
    docs: [{ label: "Wirkungsräume gestalten", href: "wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/" }, { label: "Dossier Medien & Demokratie", href: "blog/dossiers/medien-demokratie.html" }],
    next: [{ label: "Medien & Öffentlichkeit", href: "wirkungsfelder/medien-oeffentlichkeit/" }, { label: "Einwände & Schutzgrenzen", href: "einwaende/" }],
  },
  {
    slug: "scanner",
    file: "anwendungen/scanner.html",
    title: "WÖk-Scanner",
    shows: "Wie Texte, Websites, Aussagen, Produkte, Unternehmen oder Entscheidungen als wirkungsökonomische Ersteinschätzung strukturiert werden können.",
    assumptions: "Der Scanner arbeitet mit Eingaben, Demo-Beispielen und strukturierten Kategorien. Er behauptet keine Live-Prüfung und keine finale Bewertung.",
    methods: [{ label: "Wirkungspfad", href: "begriffe/wirkungspfad/" }, { label: "Datenqualität & Assurance", href: "werkzeuge/datenqualitaet-assurance/" }, { label: "WÖk-IDs", href: "werkzeuge/woek-ids/" }],
    docs: [{ label: "Scanner-Konzept", href: "scanner.html" }, { label: "Glossar Wirkung", href: "begriffe/wirkung/" }],
    next: [{ label: "WÖk-Kompass", href: "kompass.html" }, { label: "Methoden & Werkzeuge", href: "werkzeuge/" }],
  },
  {
    slug: "scanner-old-url",
    file: "scanner.html",
    title: "WÖk-Scanner alte URL",
    shows: "Die alte Scanner-URL bleibt erhalten und führt zur Scanner-Anwendung mit Methodik- und Schutzkontext.",
    next: [{ label: "Scanner-Anwendung öffnen", href: "anwendungen/scanner.html" }, { label: "Glossar Wirkung", href: "begriffe/wirkung/" }],
  },
  {
    slug: "impact-controlling-rechner",
    file: "erleben/impact-controlling-rechner/index.html",
    title: "Impact-Controlling-Rechner",
    shows: "Wie Wirkung in Steuerung, Controlling, Risiko, Reporting und Entscheidungsvorbereitung modellhaft eingeordnet wird.",
    methods: [{ label: "Impact Controlling", href: "werkzeuge/impact-controlling/" }, { label: "NWI", href: "werkzeuge/netto-wirkungs-index/" }, { label: "T-SROI", href: "werkzeuge/t-sroi/" }],
    docs: [{ label: "Impact-Controlling-Dossier", href: "werkzeuge/impact-controlling/dossier/" }, { label: "Methodenpapiere", href: "werkzeuge/impact-controlling/methodenpapiere/" }],
    next: [{ label: "Methoden & Werkzeuge", href: "werkzeuge/" }, { label: "Wirtschaft & Unternehmen", href: "wirkungsfelder/wirtschaft-unternehmen/" }],
  },
  {
    slug: "unternehmens-wirkungscheck",
    file: "erleben/unternehmens-wirkungscheck/index.html",
    title: "Unternehmens-Wirkungscheck",
    shows: "Wie Geschäftsmodell, Produkte, Lieferketten, Führung, Risiko, KII und Transformation als Lern- und Prüfstruktur sichtbar werden.",
    methods: [{ label: "Unternehmens-Wirkungscheck", href: "werkzeuge/unternehmens-wirkungscheck/" }, { label: "KII statt KPI", href: "werkzeuge/kii-statt-kpi/" }, { label: "Wirkungsrisiko-Matrix", href: "werkzeuge/wirkungsrisiko-matrix/" }],
    docs: [{ label: "Wirtschaft & Unternehmen", href: "wirkungsfelder/wirtschaft-unternehmen/" }, { label: "Wirkungsorientierte Unternehmensführung", href: "wirkungsfelder/wirtschaft-unternehmen/wirkungsorientierte-unternehmensfuehrung/" }],
    next: [{ label: "Wirtschaft & Unternehmen", href: "wirkungsfelder/wirtschaft-unternehmen/" }, { label: "Impact Controlling", href: "werkzeuge/impact-controlling/" }],
  },
  {
    slug: "automatisierungs-wirkungseinkommensrechner",
    file: "erleben/automatisierungs-wirkungseinkommensrechner/index.html",
    title: "Automatisierungs- und Wirkungseinkommensrechner",
    shows: "Wie Automatisierung, Maschinenleistung, Fondslogik, Übergangsschutz und Wirkungseinkommen modellhaft zusammengedacht werden.",
    methods: [{ label: "Automatisierungsdividende", href: "werkzeuge/automatisierungsdividende/" }, { label: "Wirkungsfonds", href: "werkzeuge/wirkungsfonds/" }, { label: "Wirkungseinkommensteuer", href: "werkzeuge/wirkungseinkommensteuer/" }],
    docs: [{ label: "Arbeit & Einkommen", href: "wirkungsfelder/arbeit-einkommen/" }, { label: "Wenn Maschinen arbeiten", href: "dokumente/wenn-maschinen-arbeiten/" }],
    next: [{ label: "Arbeit & Einkommen", href: "wirkungsfelder/arbeit-einkommen/" }, { label: "Wirkungsfonds", href: "werkzeuge/wirkungsfonds/" }],
  },
  {
    slug: "wirkungsrenten-rechner",
    file: "erleben/wirkungsrenten-rechner/index.html",
    title: "Wirkungsrenten-Rechner",
    shows: "Wie Lebensleistung, Care, Bildung, Pflege, Generationenvertrag und soziale Sicherung als Wirkungsfragen modellhaft sichtbar werden.",
    methods: [{ label: "Wirkungsfonds", href: "werkzeuge/wirkungsfonds/" }, { label: "Wirkungshaushalt", href: "werkzeuge/wirkungshaushalt/" }, { label: "T-SROI", href: "werkzeuge/t-sroi/" }],
    docs: [{ label: "Rente & soziale Sicherung", href: "wirkungsfelder/rente-soziale-sicherung/" }, { label: "Wirkungsrente", href: "referenz/kapitel-058-wirkungsrente/" }],
    next: [{ label: "Rente & soziale Sicherung", href: "wirkungsfelder/rente-soziale-sicherung/" }, { label: "Arbeitsbibliothek Rente", href: "werkstatt/arbeitsbibliothek/wirkungsfelder/rente-soziale-sicherung/" }],
  },
  {
    slug: "wohnwirkungsrechner",
    file: "erleben/wohnwirkungsrechner/index.html",
    title: "Wohnwirkungsrechner",
    shows: "Wie Bezahlbarkeit, Sanierung, Quartier, Energie, Gesundheit, Verdrängungsrisiken und Wohnwirkung modellhaft zusammenwirken.",
    methods: [{ label: "Wirkungshaushalt", href: "werkzeuge/wirkungshaushalt/" }, { label: "Scorecards", href: "werkzeuge/scorecards/" }, { label: "Datenqualität & Assurance", href: "werkzeuge/datenqualitaet-assurance/" }],
    docs: [{ label: "Wohnen & Stadt", href: "wirkungsfelder/wohnen-stadt/" }, { label: "Dossier Wohnen", href: "blog/dossiers/wohnen.html" }],
    next: [{ label: "Wohnen & Stadt", href: "wirkungsfelder/wohnen-stadt/" }, { label: "Arbeitsbibliothek Wohnen", href: "werkstatt/arbeitsbibliothek/wirkungsfelder/wohnen-stadt/" }],
  },
  {
    slug: "wohnwirkungsrechner-stranded-asset",
    file: "erleben/wohnwirkungsrechner/stranded-asset-check/index.html",
    title: "Stranded-Asset-Check Wohnen",
    shows: "Wie Sanierungsbedarf, Taxonomie, Energie, Mietwirkung und Übergangsrisiken bei Immobilien modellhaft sichtbar werden.",
    methods: [{ label: "Wirkungsrisiko-Matrix", href: "werkzeuge/wirkungsrisiko-matrix/" }, { label: "Versicherbarkeits-Resilienzcheck", href: "werkzeuge/versicherbarkeits-resilienzcheck/" }, { label: "Datenqualität & Assurance", href: "werkzeuge/datenqualitaet-assurance/" }],
    docs: [{ label: "Wohnen & Stadt", href: "wirkungsfelder/wohnen-stadt/" }, { label: "Finanzsystem & Kapital", href: "wirkungsfelder/finanzsystem-kapital/" }],
    next: [{ label: "Wohnen & Stadt", href: "wirkungsfelder/wohnen-stadt/" }, { label: "Wohnwirkungsrechner", href: "erleben/wohnwirkungsrechner/" }],
  },
  {
    slug: "wohnwirkungsrechner-vermieter",
    file: "erleben/wohnwirkungsrechner/vermieter-check/index.html",
    title: "Vermieter-Check",
    shows: "Wie Vermietung, Bezahlbarkeit, Sanierung, Energie, Quartier und Mieter:innenschutz als Wirkungsraum modellhaft eingeordnet werden.",
    methods: [{ label: "Scorecards", href: "werkzeuge/scorecards/" }, { label: "Wirkungshaushalt", href: "werkzeuge/wirkungshaushalt/" }, { label: "Wirkungsaudit", href: "werkzeuge/wirkungsaudit/" }],
    docs: [{ label: "Wohnen & Stadt", href: "wirkungsfelder/wohnen-stadt/" }, { label: "Investoren & Vermieter", href: "wirkungsfelder/wohnen-stadt/investoren-vermieter/" }],
    next: [{ label: "Wohnen & Stadt", href: "wirkungsfelder/wohnen-stadt/" }, { label: "Wohnwirkungsrechner", href: "erleben/wohnwirkungsrechner/" }],
  },
  {
    slug: "wirkungsschule-check",
    file: "erleben/wirkungsschule-check/index.html",
    title: "Wirkungsschule-Check",
    shows: "Wie Schulentwicklung, Lernräume, Förderung, Demokratiepraxis, Datenethik und Wirkungskompetenz als Strukturreifegrad sichtbar werden.",
    methods: [{ label: "Wirkungsportfolio", href: "werkzeuge/wirkungsportfolio/" }, { label: "Bildungswirkungsindex", href: "werkzeuge/bildungswirkungsindex-bwk/" }, { label: "Schulraum-Wirkungscheck", href: "werkzeuge/schulraum-wirkungscheck/" }],
    docs: [{ label: "Bildung", href: "wirkungsfelder/bildung/" }, { label: "Wirkungsschule", href: "wirkungsfelder/bildung/wirkungsschule/" }],
    next: [{ label: "Bildung", href: "wirkungsfelder/bildung/" }, { label: "Wirkungsportfolio-Generator", href: "erleben/wirkungsportfolio-generator/" }],
  },
  {
    slug: "wirkungsportfolio-generator",
    file: "erleben/wirkungsportfolio-generator/index.html",
    title: "Wirkungsportfolio-Generator",
    shows: "Wie Lernwege, Projektarbeit, Feedback, Reflexion und Kompetenzprofile als Lerninstrument strukturiert werden können.",
    methods: [{ label: "Wirkungsportfolio", href: "werkzeuge/wirkungsportfolio/" }, { label: "Wirkungspädagogik", href: "begriffe/wirkungspaedagogik/" }, { label: "WÖk-IDs", href: "werkzeuge/woek-ids/" }],
    docs: [{ label: "Bildung", href: "wirkungsfelder/bildung/" }, { label: "Wirkungsschule", href: "wirkungsfelder/bildung/wirkungsschule/" }],
    next: [{ label: "Wirkungsschule-Check", href: "erleben/wirkungsschule-check/" }, { label: "Fach-Zukunft-Generator", href: "erleben/fach-zukunft-generator/" }],
  },
  {
    slug: "wirkungsfoerderungs-check",
    file: "erleben/wirkungsfoerderungs-check/index.html",
    title: "Wirkungsförderungs-Check",
    shows: "Wie präventive Förderung, Potenzialförderung, Mentoring und Unterstützungsräume ohne Stigmatisierung strukturiert werden.",
    methods: [{ label: "Wirkungsportfolio", href: "werkzeuge/wirkungsportfolio/" }, { label: "Scorecards", href: "werkzeuge/scorecards/" }, { label: "Datenqualität & Assurance", href: "werkzeuge/datenqualitaet-assurance/" }],
    docs: [{ label: "Bildung", href: "wirkungsfelder/bildung/" }, { label: "Arbeitsbibliothek Bildung", href: "werkstatt/arbeitsbibliothek/wirkungsfelder/bildung/" }],
    next: [{ label: "Bildung", href: "wirkungsfelder/bildung/" }, { label: "Wirkungsschule-Check", href: "erleben/wirkungsschule-check/" }],
  },
  {
    slug: "fach-zukunft-generator",
    file: "erleben/fach-zukunft-generator/index.html",
    title: "Fach-Zukunft-Modulgenerator",
    shows: "Wie Fächer, lokale Fragen, SDGs/SDG+, Ergebnisformate und Wirkungskompetenz zu Lernmodulen verbunden werden können.",
    methods: [{ label: "Wirkungspädagogik", href: "begriffe/wirkungspaedagogik/" }, { label: "Wirkungsportfolio", href: "werkzeuge/wirkungsportfolio/" }, { label: "WÖk-IDs", href: "werkzeuge/woek-ids/" }],
    docs: [{ label: "Bildung", href: "wirkungsfelder/bildung/" }, { label: "Wirkungsschule", href: "wirkungsfelder/bildung/wirkungsschule/" }],
    next: [{ label: "Wirkungsportfolio-Generator", href: "erleben/wirkungsportfolio-generator/" }, { label: "Akademie", href: "akademie.html" }],
  },
];

function mergeDemo(demo) {
  return {
    ...defaults,
    ...demo,
    methods: demo.methods || defaults.methods,
    docs: demo.docs || defaults.docs,
    next: demo.next || defaults.next,
  };
}

function replaceExistingBlock(html) {
  const pattern = new RegExp(`${demoGovernanceMarkerStart}[\\s\\S]*?${demoGovernanceMarkerEnd}\\n?`, "g");
  return html
    .replace(pattern, "")
    .replaceAll("KPI-Rechner", "Wirkungsindikatoren-Demo");
}

function injectAfterFirstMainSection(html, block) {
  const mainIndex = html.indexOf("<main");
  const firstSectionEnd = html.indexOf("</section>", mainIndex);
  if (mainIndex === -1 || firstSectionEnd === -1) return html;
  const insertAt = firstSectionEnd + "</section>".length;
  return `${html.slice(0, insertAt)}\n${block}${html.slice(insertAt)}`;
}

function writeIfChanged(file, html) {
  const before = fs.readFileSync(file, "utf8");
  if (before !== html) fs.writeFileSync(file, html);
}

function discoverExperienceFiles() {
  const fromList = new Set(demos.map((demo) => demo.file));
  const walk = (dir) => {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = path.posix.join(dir, entry.name);
      if (entry.isDirectory()) walk(rel);
      if (entry.isFile() && entry.name.endsWith(".html")) fromList.add(rel);
    }
  };
  if (fs.existsSync(path.join(root, "erleben"))) walk("erleben");
  return [...fromList].filter((rel) => fs.existsSync(path.join(root, rel))).sort();
}

function demoForFile(rel) {
  const known = demos.find((demo) => demo.file === rel);
  if (known) return mergeDemo(known);
  const title = path.basename(path.dirname(rel)).replaceAll("-", " ");
  return mergeDemo({
    slug: rel.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase(),
    file: rel,
    title,
    shows: "Diese interaktive Seite zeigt eine modellhafte Wirkungslogik und verweist auf passende Methoden, Schutzlinien und Vertiefungen.",
  });
}

function run() {
  const files = discoverExperienceFiles();
  let updated = 0;
  for (const rel of files) {
    const file = path.join(root, rel);
    const demo = demoForFile(rel);
    const html = fs.readFileSync(file, "utf8");
    const cleaned = replaceExistingBlock(html);
    if (skipDemoGovernance.has(rel)) {
      writeIfChanged(file, cleaned);
      updated += 1;
      continue;
    }
    const block = renderDemoGovernanceBlock(root, file, demo);
    const next = injectAfterFirstMainSection(cleaned, block);
    writeIfChanged(file, next);
    updated += 1;
  }
  console.log(`Applied Stage 8 demo governance: ${updated} interactive pages standardized.`);
}

run();
