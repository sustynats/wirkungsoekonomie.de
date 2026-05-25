import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-05-24";
const CSS_VERSION = "20260524-korrektur-detailkonzepte";
const JS_VERSION = "20260525-cta-cleanup";
const EXTRACT = "docs/korrektur-detailkonzepte/docx-extracts";

const detailChapters = [
  "Kurzfassung und Ziel",
  "Ausgangslage und alte Logik",
  "Begriffliche Einordnung",
  "Wirkungsökonomischer Perspektivwechsel",
  "Systemarchitektur",
  "Mess-, Daten- und Bewertungslogik",
  "Politische Anschlussfähigkeit und Ausgestaltungsspielräume",
  "Akteursperspektiven",
  "Risiken, Nebenwirkungen und Schutzmechanismen",
  "Umsetzung und Pilotierung",
  "SDG-/SDG+-Bezug und WÖk-ID-Bezug",
  "Buchanker, Glossar, Werkzeuge und Verknüpfungen",
];

const dossierChapters = [
  "Praxisfrage",
  "Fallbeispiel oder Anwendungsszenario",
  "Berechnungs-/Bewertungslogik",
  "Datenquellen und Vertrauensstufen",
  "Annahmenbox",
  "Beispielrechnung oder Bewertungsmatrix",
  "Ergebnisinterpretation",
  "Bedeutung für Akteur:innen",
  "Politische Umsetzungsoptionen",
  "Tool-/Rechnerbezug",
  "Grenzen und Missbrauchsschutz",
  "Download und Arbeitsmaterial",
];

const sharedTools = [
  ["WÖk-IDs", "Datenarchitektur", "werkzeuge/woek-ids/"],
  ["Scorecards", "Bewertungsraster", "werkzeuge/scorecards/"],
  ["Reverse Merit Order", "Nicht-Kompensation", "werkzeuge/reverse-merit-order/"],
  ["Netto-Wirkungs-Index", "Kennzahl", "werkzeuge/netto-wirkungs-index/"],
  ["T-SROI", "Transformationsmessung", "werkzeuge/impact-controlling/t-sroi/"],
  ["Wirkungsrat", "Institution", "werkzeuge/wirkungsrat/"],
];

const sdgBadges = [
  "SDG 3 Gesundheit und Wohlergehen",
  "SDG 8 Menschenwürdige Arbeit",
  "SDG 9 Industrie, Innovation und Infrastruktur",
  "SDG 10 Weniger Ungleichheiten",
  "SDG 12 Nachhaltige/r Konsum und Produktion",
  "SDG 13 Klimaschutz",
  "SDG 16 Frieden, Gerechtigkeit und starke Institutionen",
  "SDG 17 Partnerschaften",
];

const sdgPlusBadges = [
  "SDG+ Demokratie",
  "SDG+ Medienqualität",
  "SDG+ Rechtsstaatlichkeit",
  "SDG+ Diskursfähigkeit",
  "SDG+ institutionelles Vertrauen",
  "SDG+ gesellschaftlicher Zusammenhalt",
  "SDG+ digitale Selbstbestimmung",
];

const bookAnchors = {
  products: [
    ["Kapitel 31 - WÖk-IDs und Indikatorenarchitektur", "referenz/kapitel-031-woek-ids-und-indikatorenarchitektur/"],
    ["Kapitel 32 - Benchmarks, Skalen und Scorecards", "referenz/kapitel-032-benchmarks-skalen-und-scorecards/"],
    ["Kapitel 33 - Reverse Merit Order", "referenz/kapitel-033-reverse-merit-order/"],
    ["Kapitel 37 - Wirkungssteuergesetz", "referenz/kapitel-037-das-wirkungssteuergesetz-wstg/"],
    ["Kapitel 38 - WUStG und Produktwirkungssteuer", "referenz/kapitel-038-das-wustg-und-die-produktwirkungssteuer/"],
    ["Kapitel 48-53 - Produkte, Preise und Markttransformation", "referenz/teil-08-produkte-maerkte-und-preise/"],
  ],
  impact: [
    ["Kapitel 30 - Von Wirkung zu Messung", "referenz/kapitel-030-von-wirkung-zu-messung/"],
    ["Kapitel 31 - WÖk-IDs und Indikatorenarchitektur", "referenz/kapitel-031-woek-ids-und-indikatorenarchitektur/"],
    ["Kapitel 32 - Benchmarks, Skalen und Scorecards", "referenz/kapitel-032-benchmarks-skalen-und-scorecards/"],
    ["Kapitel 33 - Reverse Merit Order", "referenz/kapitel-033-reverse-merit-order/"],
    ["Kapitel 34 - T-SROI und systemische Transformationsmessung", "referenz/kapitel-034-t-sroi-und-systemische-transformationsmessung/"],
    ["Kapitel 44 - Wirkungscontrolling im Unternehmen", "referenz/kapitel-044-wirkungscontrolling-im-unternehmen/"],
  ],
  state: [
    ["Kapitel 36 - Wirkung als Rechtsprinzip", "referenz/kapitel-036-wirkung-als-rechtsprinzip/"],
    ["Kapitel 37 - Das Wirkungssteuergesetz WStG", "referenz/kapitel-037-das-wirkungssteuergesetz-wstg/"],
    ["Kapitel 39 - Wirkungshaushalt und öffentliche Mittel", "referenz/kapitel-039-wirkungshaushalt-und-oeffentliche-mittel/"],
    ["Kapitel 40 - Der Wirkungsrat", "referenz/kapitel-040-der-wirkungsrat/"],
    ["Kapitel 61-66 - Politik, Verwaltung und Resilienzstaat", "referenz/teil-10-staat-politik-und-demokratie/"],
  ],
  business: [
    ["Kapitel 42 - Unternehmen als Wirkungssysteme", "referenz/kapitel-042-unternehmen-als-wirkungssysteme/"],
    ["Kapitel 43 - Wirkungsorientierte Unternehmensführung", "referenz/kapitel-043-wirkungsorientierte-unternehmensfuehrung/"],
    ["Kapitel 44 - Wirkungscontrolling im Unternehmen", "referenz/kapitel-044-wirkungscontrolling-im-unternehmen/"],
    ["Kapitel 45 - Organisation, Kultur und Verantwortung", "referenz/kapitel-045-organisation-kultur-und-verantwortung/"],
    ["Kapitel 46 - Interne Wertschöpfung und Lieferkettensteuerung", "referenz/kapitel-046-interne-wertschoepfung-und-lieferkettensteuerung/"],
    ["Kapitel 47 - Unternehmensrisiko und Transformation", "referenz/kapitel-047-unternehmensrisiko-und-transformation/"],
  ],
  housing: [
    ["Kapitel 31 - WÖk-IDs und Indikatorenarchitektur", "referenz/kapitel-031-woek-ids-und-indikatorenarchitektur/"],
    ["Kapitel 32 - Benchmarks, Skalen und Scorecards", "referenz/kapitel-032-benchmarks-skalen-und-scorecards/"],
    ["Kapitel 39 - Wirkungshaushalt und öffentliche Mittel", "referenz/kapitel-039-wirkungshaushalt-und-oeffentliche-mittel/"],
    ["Kapitel 70 - Wohnen", "referenz/kapitel-070-wohnen/"],
    ["Working-Paper Wohnungsmarkt", "dokumente/wp-wohnungsmarkt/"],
  ],
};

const ranks = [
  {
    id: "products",
    label: "Produkte & Konsum / Wirkungsumsatzsteuer",
    portal: "wirkungsfelder/produkte-konsum/",
    base: "wirkungsfelder/produkte-konsum",
    dossierBase: "wirkungsfelder/produkte-konsum/dossiers",
    download: "assets/downloads/woek_produkte_konsum_detailkonzepte_umfangreich_v0_2.docx",
    extract: "woek_produkte_konsum_detailkonzepte_umfangreich_v0_2.md",
    workshop: "werkstatt/arbeitsbibliothek/wirkungsfelder/produkte-konsum/",
    topics: [
      ["produktwirkung-produktlebenszyklus", "Produktwirkung und Produktlebenszyklus", "Rohstoffe, Herstellung, Nutzung, Ende, Produktdaten statt Produktimage und Produktverantwortung."],
      ["produktbesteuerung-durch-wirkung", "Produktbesteuerung durch Wirkung", "FinalScore, Steuerklasse, Preisumkehr, Sozial- und Kaufkraftschutz und Übergang."],
      ["wirkungsumsatzsteuer", "Wirkungsumsatzsteuer / Produktwirkungssteuer", "Umsatzsteuerlogik als Rückkopplungsarchitektur, Vorsteuer, Bonus-Malus und WUStG-Anschluss."],
      ["produktscorecards", "Produktscorecards", "Kernfelder, Bewertungslogik, Datenfelder, FinalScore und Sonderfälle."],
      ["woek-ids-im-produktbereich", "WÖk-IDs im Produktbereich", "Indikatorregister, SDG-/SDG+-Mapping, NACE, ESRS, GRI und Datenqualität."],
      ["reverse-merit-order", "Reverse Merit Order", "Nicht-Kompensation, schwächstes Wirkungsfeld, rote Linien und Schutz vor Ablasshandel."],
      ["apfelbeispiel", "Apfelbeispiel", "Regionaler Bio-Apfel vs. Importapfel, NACE 01.24, SDGs, Scorecard und Steuerklasse."],
      ["lieferketten", "Lieferkettenwirkung", "Vorleistungen, Lieferanten-Scorecards, Vorsteuerfähigkeit und globale Wirkungsketten."],
      ["basf-polyamid", "Konzernbeispiel / BASF Polyamid", "CSRD-/ESRS-Daten auf Produktgruppen, Anlagen und Benchmarks herunterbrechen."],
      ["verbraucherinformation", "Verbraucherinformation und Wirkungspunkte", "Regaltransparenz, Label, Bonuslogik und Freiheit ohne moralische Überforderung."],
      ["unternehmen-produktentwicklung", "Unternehmen und Produktentwicklung", "Produktentwicklung, Einkauf, Controlling, Lieferkette und Portfoliosteuerung nach Wirkung."],
      ["politische-rahmenbedingungen", "Politische Rahmenbedingungen", "WStG, WUStG, Wirkungsrat, Datenschutz, Prüfpflichten, Übergänge und sozialer Schutz."],
    ],
  },
  {
    id: "impact",
    label: "Impact Controlling / T-SROI / NWI / WÖk-IDs / Scorecards",
    portal: "werkzeuge/impact-controlling/",
    base: "werkzeuge/impact-controlling",
    dossierBase: "werkzeuge/impact-controlling/dossiers",
    download: "assets/downloads/woek_impact_controlling_detailkonzepte_umfangreich_v0_2.docx",
    extract: "woek_impact_controlling_detailkonzepte_umfangreich_v0_2.md",
    workshop: "werkstatt/arbeitsbibliothek/instrumente/impact-controlling/",
    topics: [
      ["impact-controlling-als-system", "Impact Controlling als System", "Wirkung in Strategie, Steuerung, Risiko, Reporting, Budgetierung und Entscheidung übersetzen."],
      ["t-sroi", "T-SROI", "Transformational Social Return on Investment für Investitions-, Präventions- und Transformationswirkung."],
      ["nwi", "Netto-Wirkungs-Index NWI", "Operative Kennzahl für positive, negative und neutrale Wirkung im WÖk-Rahmen."],
      ["woek-ids", "WÖk-IDs", "Indikatorenarchitektur für SDGs, SDG+, Standards, Datenquellen und Prüfstatus."],
      ["scorecards", "Scorecards", "Bewertungsraster für Produkte, Organisationen, Projekte, Portfolios und Entscheidungen."],
      ["reverse-merit-order", "Reverse Merit Order", "Nicht-Kompensation und rote Linien als Schutz gegen Schönrechnung."],
      ["benchmarks-archetypen", "Benchmarks und Archetypen", "Vergleichsrahmen für Branchen, Produkte, Aktivitäten und Organisationstypen."],
      ["datenqualitaet-assurance", "Datenqualität und Assurance", "Prüfstatus, Quellenklarheit, Versionierung, Datenlücken und externe Sicherung."],
      ["digitale-produktpaesse-wirkungsdatenraeume", "Digitale Produktpässe und Wirkungsdatenräume", "Interoperable Dateninfrastruktur für Produkt-, Lieferketten- und Wirkungsinformationen."],
      ["kii-statt-kpi", "KII statt KPI", "Key Impact Indicators als Ergänzung klassischer Leistungskennzahlen."],
      ["beispielrechnungen", "Beispielrechnungen Impact Controlling", "Modellhafte Rechnungen für Scorecard, NWI und T-SROI."],
    ],
  },
  {
    id: "state",
    label: "Staat, Recht & Demokratie",
    portal: "wirkungsfelder/staat-recht-demokratie/",
    base: "werkstatt/dossiers/staat-recht-demokratie",
    dossierBase: "werkstatt/dossiers/staat-recht-demokratie",
    download: "assets/downloads/woek_staat_recht_demokratie_detailkonzepte_umfangreich_v0_2.docx",
    extract: "woek_staat_recht_demokratie_detailkonzepte_umfangreich_v0_2.md",
    workshop: "werkstatt/arbeitsbibliothek/gesetze/",
    topics: [
      ["wirkung-als-rechtsprinzip", "Wirkung als Rechtsprinzip", "Rechtliche Orientierung an realen Zustandsveränderungen statt nur an formaler Aktivität."],
      ["wirkungssteuergesetz-wstg", "Wirkungssteuergesetz WStG", "Dachrahmen für wirkungsbezogene Steuerlogik, Evaluation und Institutionen."],
      ["wirkungsumsatzsteuer-rechtsrahmen", "Wirkungsumsatzsteuer im Rechtsrahmen", "Produktwirkungssteuer im Verhältnis zu WStG, WUStG-Leitlinien, Rechtsschutz und EU-Bezug."],
      ["wirkungseinkommensteuer-westg", "Wirkungseinkommensteuer WEstG", "Einkommen nach Entstehungskontext, Wirkung und sozialer Schutzlogik einordnen."],
      ["wirkungshaushalt", "Wirkungshaushalt", "Öffentliche Mittel an Prävention, Zustandsveränderung und positive Netto-Wirkung rückkoppeln."],
      ["wirkungsrat", "Wirkungsrat", "Unabhängige Institution für Indikatoren, Benchmarks, Evaluation und Missbrauchsschutz."],
      ["verwaltung-rechtsschutz-korrektur", "Verwaltung und Rechtsschutz", "Verfahren, Einspruch, Korrektur, Datenschutz und Verhältnismäßigkeit."],
      ["politische-wirkungspruefung", "Politische Wirkungsprüfung", "Vorhabenfolgen sichtbar machen, ohne demokratische Entscheidung zu ersetzen."],
      ["lobbyismus-machtkonzentration", "Lobbyismus und Machtkonzentration", "Schutz der Wirkungslogik vor Verzerrung, Einflussballung und Datenmanipulation."],
      ["buergerbeteiligung-wirkungsdemokratie", "Bürgerbeteiligung und Wirkungsdemokratie", "Beteiligung, Resonanz, Teilhabe und Korrekturfähigkeit als demokratische Infrastruktur."],
    ],
  },
  {
    id: "business",
    label: "Wirtschaft & Unternehmen",
    portal: "wirkungsfelder/wirtschaft-unternehmen/",
    base: "wirkungsfelder/wirtschaft-unternehmen",
    dossierBase: "wirkungsfelder/wirtschaft-unternehmen/dossiers",
    download: "assets/downloads/woek_wirtschaft_unternehmen_detailkonzepte_umfangreich_v0_2.docx",
    extract: "woek_wirtschaft_unternehmen_detailkonzepte_umfangreich_v0_2.md",
    workshop: "werkstatt/arbeitsbibliothek/wirkungsfelder/wirtschaft-unternehmen/",
    topics: [
      ["unternehmen_als_wirkungssysteme", "Unternehmen als Wirkungssysteme", "Unternehmenszweck, Gewinn als Ergebnis, Strategie und Verantwortung über die Bilanz hinaus."],
      ["wirkungsorientierte_unternehmensfuehrung", "Wirkungsorientierte Unternehmensführung", "Führung als Systemsteuerung, kybernetische Logik und Netzwerke statt Kontrollillusion."],
      ["wirkungsorientierte_mitarbeiterfuehrung", "Wirkungsorientierte Mitarbeiterführung", "Selbstwirksamkeit, Rolle, Verantwortung, Lernkultur und Schutz vor Instrumentalisierung."],
      ["impact_controlling_im_unternehmen", "Impact Controlling im Unternehmen", "KII statt KPI, Scorecards, T-SROI, CAPEX/OPEX nach Wirkung und Finanzkommunikation."],
      ["risikomanagement_wirkungsrisiko_erm", "Risikomanagement und Wirkungsrisiko im ERM", "Wirkungsrisiko als strategisches Risiko, Frühwarninformation und Resilienz."],
      ["resiliente_wertschoepfungskette", "Resiliente Wertschöpfungskette", "Beschaffung, Lieferantenbewertung, Supply-Chain-Resilienz und Vorsteuerlogik."],
      ["produktportfolio_produktentwicklung", "Produktportfolio und Produktentwicklung", "Produktwirkung, Kreislaufwirtschaft, Cradle-to-Cradle und Entwicklungsentscheidungen."],
      ["marketing_fuenftes_p_planet", "Marketing und das fünfte P: Planet", "Marketing als Nachfragearchitektur; Planet als fünftes P neben Product, Price, Place und Promotion."],
      ["organisation_kultur_verantwortung", "Organisation, Kultur und Verantwortung", "Netzwerke statt Silos, Wirkungskompetenz und lernende Organisation."],
      ["transformation_geschaeftsmodellpruefung", "Transformation und Geschäftsmodellprüfung", "Geschäftsmodelle nach Wirkung, Transformationspfade und Exit aus Negativwirkung."],
      ["governance_boni_anreizsysteme", "Governance, Boni und Anreizsysteme", "Vergütung, Zielsysteme, Verantwortlichkeit, Purpose und Aufsicht."],
      ["kmu_tauglichkeit_pilotierung", "KMU-Tauglichkeit und Pilotierung", "Verhältnismäßigkeit, einfache Checks, stufenweise Einführung und Branchenpilotierung."],
    ],
  },
  {
    id: "housing",
    label: "Wohnen & Stadt",
    portal: "wirkungsfelder/wohnen-stadt/",
    base: "wirkungsfelder/wohnen-stadt",
    dossierBase: "wirkungsfelder/wohnen-stadt/dossiers",
    download: "assets/downloads/woek_wohnen_stadt_detailkonzepte_umfangreich_v0_2.docx",
    extract: "woek_wohnen_stadt_detailkonzepte_umfangreich_v0_2.md",
    workshop: "werkstatt/arbeitsbibliothek/wirkungsfelder/wohnen-stadt/",
    topics: [
      ["wohnen-als-wirkungsraum", "Wohnen als Wirkungsraum", "Wohnen als Daseinsvorsorge, Gesundheitsraum, Teilhaberaum und demokratischer Stabilitätsfaktor."],
      ["mietwirkung-bezahlbarkeit", "Mietwirkung und Bezahlbarkeit", "Mietbelastung, Einkommenswirkung, Verdrängung und soziale Stabilität."],
      ["wohnwirkungsindex-wix-wohn", "Wohnwirkungsindex WIX-Wohn", "Messlogik, Indikatoren, Scorefelder, Gewichtung und Nicht-Kompensation."],
      ["sanierung-energie-warmmietenneutralitaet", "Sanierung, Energie und Warmmietenneutralität", "Klima, Energiearmut, Modernisierung und soziale Abfederung."],
      ["eigentum-vermietung-wirkungspflicht", "Eigentum, Vermietung und Wirkungspflicht", "Rendite, Verantwortung, faire Vermietung und Anreizsysteme."],
      ["boden-leerstand-spekulation", "Boden, Leerstand und Spekulation", "Bodenwert, Nutzungspflicht, Leerstand und Gemeinwohlbindung."],
      ["quartier-stadt-sozialraumprofil", "Quartier, Stadt und Sozialraumprofil", "Nachbarschaft, Infrastruktur, Bildung, Gesundheit, Mobilität und Sicherheit."],
      ["verdraengung-gentrifizierung-teilhabe", "Verdrängung, Gentrifizierung und Teilhabe", "Dynamiken der Aufwertung, Schutz, Vielfalt und demokratisches Vertrauen."],
      ["kommunale-wohnwirkungspolitik", "Kommunale Wohnwirkungspolitik", "Kommunale Budgets, Wirkungsfonds, Planung, Beteiligung und Pilotgebiete."],
      ["finanzierung-foerderlogik-wirkungsfonds", "Finanzierung, Förderlogik und Wirkungsfonds", "Förderung nach Wirkung, Investitionslogik, Sozial- und Klimadividende."],
      ["mieterstrom-energie-gemeinschaften", "Mieterstrom und Energie-Gemeinschaften", "Dezentrale Energie, Teilhabe an Energiewende und Preiswirkung."],
      ["gesundes-barrierefreies-resilientes-wohnen", "Gesundes, barrierefreies und resilientes Wohnen", "Innenraumqualität, Hitze, Barrierefreiheit, Resilienz und Krisenfestigkeit."],
    ],
  },
];

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
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
    .replace(/^-+|-+$/g, "");
}

function routeFor(rel) {
  return rel.endsWith("/index.html") ? `/${rel.slice(0, -"/index.html".length)}/` : `/${rel}`;
}

function baseFor(rel) {
  return "../".repeat(path.dirname(rel).split("/").filter(Boolean).length);
}

function href(base, target) {
  if (!target) return "";
  if (/^(https?:|mailto:|#)/.test(target)) return target;
  return `${base}${target.replace(/^\/+/, "")}`;
}

function write(rel, content) {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content, "utf8");
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function citeAnchor(id) {
  return `<a class="cite-anchor no-print" href="#${id}" aria-label="Zitierlink zu diesem Abschnitt">#</a>`;
}

function heading(level, id, title) {
  return `<h${level} id="${id}">${escapeHtml(title)} ${citeAnchor(id)}</h${level}>`;
}

function sanitizePublicText(text) {
  return String(text)
    .replace(/Öffentlicher CharakterDieses/g, "Öffentlicher Charakter. Dieses")
    .replace(/Kernformel([A-ZÄÖÜ])/g, "Kernformel. $1")
    .replace(/Website, Online-Volltext, Download und Dossier/g, "Website, Onlinefassung, Download und Dossier")
    .replace(/innerhalb des Portals „([^“]+)“/g, "im Bereich „$1“")
    .replace(/innerhalb des Portals/g, "im Bereich")
    .replace(/Portals/g, "Bereichs")
    .replace(/Portal/g, "Bereich")
    .replace(/öffentliche Arbeitsfassung/g, "öffentliche Onlinefassung")
    .replace(/öffentlichen Arbeitsfassung/g, "öffentlichen Onlinefassung")
    .replace(/Online-Volltext/g, "Onlinefassung")
    .replace(/öffentliche Fassung/g, "öffentliche Webfassung")
    .replace(/Toolbezug/g, "Werkzeugbezug")
    .replace(/Tools/g, "Werkzeuge")
    .replace(/Tool-/g, "Werkzeug-/")
    .replace(/technische Arbeitsanweisungen/g, "redaktionelle Arbeitsnotizen")
    .replace(/Für diesen Unterbereich entstehen künftig drei öffentliche Zugänge: eine verständliche Online-Seite, ein vollständiges Detailkonzept als Download und ein Einzeldossier mit Beispielen, Datenquellen, Berechnungswegen und Werkzeugbezug\. Die Online-Fassung enthält keine internen Arbeitsanweisungen, sondern den vollständigen fachlichen Inhalt/g, "Für diesen Unterbereich stehen drei öffentliche Zugänge bereit: eine verständliche Online-Seite, ein vollständiges Detailkonzept als Download und ein Einzeldossier mit Beispielen, Datenquellen, Berechnungswegen und Werkzeugbezug. Die Online-Fassung enthält den vollständigen fachlichen Inhalt");
}

function dossierHref(rank, slug) {
  return `${rank.dossierBase}/${slug}/`;
}

function splitDetailSections(rank) {
  const source = sanitizePublicText(read(`${EXTRACT}/${rank.extract}`));
  const lines = source.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const detailStart = Math.max(0, lines.findIndex((line) => line === "Detailkonzepte"));
  const sections = new Map();
  for (let i = 0; i < rank.topics.length; i += 1) {
    const [, title] = rank.topics[i];
    const next = rank.topics[i + 1]?.[1];
    const start = lines.findIndex((line, index) => index > detailStart && line === title);
    if (start === -1) continue;
    const end = next ? lines.findIndex((line, index) => index > start + 3 && line === next) : lines.findIndex((line, index) => index > start + 3 && line === "Schlussbemerkung");
    const slice = lines.slice(start, end === -1 ? undefined : end);
    sections.set(title, slice);
  }
  return sections;
}

function paragraph(text) {
  return `<p>${escapeHtml(text)}</p>`;
}

function mdishToHtml(lines, topicTitle) {
  const html = [];
  const toc = [];
  let para = [];
  const flush = () => {
    if (!para.length) return;
    html.push(paragraph(para.join(" ")));
    para = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line === topicTitle) continue;
    const numbered = line.match(/^(\d{1,2})\.\s+(.+)$/);
    if (numbered) {
      flush();
      const id = slugify(numbered[2]);
      toc.push([id, numbered[2]]);
      html.push(heading(2, id, numbered[2]));
    } else if (/^[A-ZÄÖÜ][A-Za-zÄÖÜäöüß /&+-]{2,80}$/.test(line) && !line.endsWith(".")) {
      flush();
      html.push(`<p class="card-kicker">${escapeHtml(line)}</p>`);
    } else {
      para.push(line);
    }
  }
  flush();
  return { html: html.join("\n"), toc };
}

function page({ rel, title, description, section, type, body }) {
  const base = baseFor(rel);
  const route = routeFor(rel);
  const canonical = `${SITE}${route}`;
  write(rel, `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="search_title" content="${escapeHtml(title.replace(/\s+\|.*$/, ""))}">
    <meta name="search_description" content="${escapeHtml(description)}">
    <meta name="search_section" content="${escapeHtml(section)}">
    <meta name="search_type" content="${escapeHtml(type)}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${escapeHtml(title.replace(/\s+\|.*$/, ""))}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${SITE}/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${CSS_VERSION}">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation"><a href="${base}index.html">Start</a></nav>
    </header>
    <main>
      <p class="print-meta">Wirkungsökonomie · ${escapeHtml(title.replace(/\s+\|.*$/, ""))} · ${canonical} · Druckdatum: 24.05.2026</p>
${body(base, route)}
    </main>
    <script src="${base}assets/js/main.js?v=${JS_VERSION}"></script>
  </body>
</html>
`);
}

function hero(base, kicker, title, subtitle, text, actionHref, actionLabel) {
  const action = actionHref && actionLabel
    ? `<a class="btn btn-primary" href="${href(base, actionHref)}">${escapeHtml(actionLabel)}</a>`
    : "";
  return `<section class="hero portal-hero"><div class="hero-content">
    <nav class="breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}werkstatt/">Werkstatt</a></nav>
    <p class="hero-kicker">${escapeHtml(kicker)}</p>
    <h1>${escapeHtml(title)}</h1>
    <p class="hero-subtitle">${escapeHtml(subtitle)}</p>
    <p>${escapeHtml(text)}</p>
    <div class="hero-actions no-print">
      <button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>
      ${action}
    </div>
  </div></section>`;
}

function metaCard(status) {
  return "";
}

function tocBlock(items) {
  return `<details class="toc-card no-print" aria-label="Inhaltsverzeichnis"><summary class="card-title">Inhaltsverzeichnis anzeigen</summary><ol>${items.map(([id, title]) => `<li><a href="#${id}">${escapeHtml(title)}</a></li>`).join("")}</ol></details>`;
}

function readingNotice(kind) {
  const label = kind === "Dossier" ? "dieses Dossiers" : "dieses Detailkonzepts";
  return `<aside class="citation-note" role="note"><p class="card-kicker">Onlinefassung</p><h2>Du liest die Onlinefassung</h2><p>Du liest die Onlinefassung ${label}. Die Downloadfassung und die Druckfunktion findest du am Ende der Seite.</p></aside>`;
}

function referenceBlock(base, rank) {
  return `<section class="section" aria-labelledby="reference-frame"><div class="portal-reference-block">
    <p class="hero-kicker">Referenzrahmen</p>
    ${heading(2, "reference-frame", "SDG-/SDG+-Bezug und WÖk-ID-Bezug")}
    <h3>Relevante SDGs</h3>
    <div class="model-strip">${sdgBadges.map((badge) => `<a href="${href(base, "verstehen/sdgs-sdgplus/")}">${escapeHtml(badge)}</a>`).join("")}</div>
    <h3>Relevante SDG+-Dimensionen</h3>
    <div class="model-strip">${sdgPlusBadges.map((badge) => `<a href="${href(base, "verstehen/sdgs-sdgplus/#sdgplus")}">${escapeHtml(badge)}</a>`).join("")}</div>
    <p>SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie. WÖk-IDs bilden den methodischen Brückenschritt zwischen Referenzrahmen, Datenquellen, Bewertungslogik und öffentlicher Nachvollziehbarkeit.</p>
    <p><a class="text-link" href="${href(base, "verstehen/sdgs-sdgplus/")}">SDG-/SDG+-Referenzrahmen öffnen</a></p>
  </div></section>`;
}

function bookBlock(base, rank) {
  return `<section class="section" aria-labelledby="book-anchors"><div class="section-header"><p class="hero-kicker">Online-Buch</p>${heading(2, "book-anchors", "Anker im Online-Buch")}</div><div class="model-strip">${bookAnchors[rank.id].map(([label, target]) => `<a href="${href(base, target)}">${escapeHtml(label)}</a>`).join("")}</div></section>`;
}

function toolsBlock(base) {
  return `<section class="section" aria-labelledby="context-tools"><div class="section-header"><p class="hero-kicker">Werkzeuge</p>${heading(2, "context-tools", "Kontext-Werkzeuge")}</div><div class="card-grid three">${sharedTools.map(([title, type, target]) => `<article class="card"><p class="card-kicker">${escapeHtml(type)}</p><h3>${escapeHtml(title)}</h3><p>Dieses Werkzeug macht Wirkung sichtbar, bewertbar oder korrigierbar. Es bereitet Entscheidungen vor, ersetzt sie aber nicht.</p><a class="text-link" href="${href(base, target)}">Methode lesen</a></article>`).join("")}</div></section>`;
}

function politicalBlock() {
  return `<section class="section" aria-labelledby="political-options"><div class="card"><p class="hero-kicker">Umsetzung</p>${heading(2, "political-options", "Politische Anschlussfähigkeit und Umsetzungsoptionen")}
    <p>Die Wirkungsökonomie ersetzt demokratische Aushandlung nicht. Sie macht Wirkungen, Zielkonflikte, Nebenwirkungen und Schutzgrenzen sichtbar, damit politische Entscheidungen besser begründet, überprüft und korrigiert werden können.</p>
    <div class="table-wrap"><table class="data-table"><thead><tr><th>Dimension</th><th>Öffentliche Ausgestaltung</th></tr></thead><tbody>
      <tr><td>Aufgabe der Politik</td><td>Mindeststandards, Datenzugang, Verfahren, Rechtsschutz, Datenschutz, soziale Abfederung und Evaluation schaffen.</td></tr>
      <tr><td>Ausgestaltungsspielraum</td><td>Marktanreize, Regulierung, Förderung, öffentliche Infrastruktur, kommunale Pilotierung und direkte Unterstützung können demokratisch unterschiedlich kombiniert werden.</td></tr>
      <tr><td>Zielkonflikte</td><td>Kosten, Tempo, Bürokratie, Grundrechte, KMU-Belastung, Kaufkraft, Datenqualität und Transformationsdruck müssen offen verhandelt werden.</td></tr>
      <tr><td>Schutzlinie</td><td>Bewertet werden Maßnahmen, Strukturen, Produkte, Regeln und Wirkungsräume, nicht Menschen.</td></tr>
    </tbody></table></div>
  </div></section>`;
}

function downloadBlock(base, rank, extra = []) {
  const items = [
    ["Umfangreiche Korrekturfassung Word", rank.download],
    ["Publikationsstandard Word", "assets/downloads/woek_publikationsstandard_detailkonzepte_dossiers_v0_3.docx"],
    ...extra,
  ].filter(([, target]) => fs.existsSync(path.join(ROOT, target)) || /^https?:/.test(target));
  return `<section class="section" aria-labelledby="downloads"><div class="card"><p class="hero-kicker">Arbeitsmaterial</p>${heading(2, "downloads", "Vertiefung und Arbeitsmaterial")}<p>Du liest die Onlinefassung. Downloads und Druckfunktion ergänzen die Webfassung als Arbeitsmaterial.</p><div class="portal-card-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>${items.map(([label, target]) => `<a class="btn btn-secondary" href="${href(base, target)}">${escapeHtml(label)}</a>`).join("")}</div></div></section>`;
}

function relatedBlock(base, rank, slug, currentKind = "detail") {
  const cards = [
    `<article class="card"><h3>Übersicht</h3><p>Der Bereich bündelt Einstiege, Methoden, Beispiele und Arbeitsmaterial.</p><a class="text-link" href="${href(base, rank.portal)}">Zur Übersicht</a></article>`,
  ];
  if (currentKind !== "detail") {
    cards.push(`<article class="card"><h3>Detailkonzept</h3><p>Fachliche und systemische Logik des Unterbereichs.</p><a class="text-link" href="${href(base, `${rank.base}/detailkonzepte/${slug}/`)}">Detailkonzept lesen</a></article>`);
  }
  if (currentKind !== "dossier") {
    cards.push(`<article class="card"><h3>Einzeldossier</h3><p>Praxisfrage, Bewertungsweg, Datenquellen, Annahmen, Beispiel und Grenzen.</p><a class="text-link" href="${href(base, dossierHref(rank, slug))}">Dossier lesen</a></article>`);
  }
  return `<section class="section" aria-labelledby="related"><div class="section-header"><p class="hero-kicker">Verknüpfung</p>${heading(2, "related", "Verwandte Seiten und Materialien")}</div><div class="card-grid three">${cards.join("")}</div></section>`;
}

function detailSupplement(rank, title, summary) {
  const texts = {
    "Kurzfassung und Ziel": `${title} wird als fachlicher Unterbereich der Wirkungsökonomie online erklärt. Ziel ist eine öffentliche Langfassung mit fachlicher Einordnung, Bewertungspfad, politischem Rahmen und zitierfähigen Ankern.`,
    "Ausgangslage und alte Logik": `Die alte Logik betrachtet ${title} häufig über isolierte Kennzahlen, Kosten, formale Zuständigkeiten oder kurzfristige Effizienz. Dadurch bleiben Nebenwirkungen, Folgekosten, Verdrängungen, Datenlücken und demokratische Rückkopplungen unsichtbar.`,
    "Begriffliche Einordnung": `${summary} Wirkung bedeutet hier die tatsächliche Veränderung von Zuständen. Sie kann positiv, negativ oder neutral sein und wird nicht automatisch als Fortschritt behandelt.`,
    "Wirkungsökonomischer Perspektivwechsel": `Der neue Maßstab ist positive Netto-Wirkung für Mensch, Planet und Demokratie. Entscheidungen werden nicht nur danach bewertet, ob sie zulässig oder profitabel sind, sondern welche Zustandsveränderungen sie erzeugen und welche Risiken sichtbar bleiben müssen.`,
    "Systemarchitektur": `Akteur:innen, Wirkungsträger, Wirkungsempfänger, Datenquellen, Regeln, Preise, Budgets, Förderlogiken und Korrekturverfahren werden als zusammenhängende Architektur verstanden. Der Unterbereich wird mit Übersicht, Arbeitsmaterial, Werkzeugen, Buchankern und öffentlichen Quellen verbunden.`,
    "Mess-, Daten- und Bewertungslogik": `WÖk-IDs, Scorecards, Benchmarks, Vertrauensstufen, NWI, T-SROI und Reverse Merit Order schaffen eine nachvollziehbare Bewertungslogik. Datenlücken werden als Datenlücken ausgewiesen und nicht als positive Wirkung interpretiert.`,
    "Politische Anschlussfähigkeit und Ausgestaltungsspielräume": `Der Unterbereich beschreibt keinen fertigen Parteibeschluss. Politik schafft Verfahren, Standards, Schutzrechte, Finanzierung, Evaluation und Korrektur. Unterschiedliche demokratische Wege bleiben möglich, solange Wirkung sichtbar, überprüfbar und korrigierbar bleibt.`,
    "Akteursperspektiven": `Relevant sind Bürger:innen, betroffene Gruppen, Unternehmen, Verwaltung, Politik, Wissenschaft, Zivilgesellschaft, Kommunen und Prüfinstitutionen. Jede Perspektive erhält andere Aufgaben, Rechte, Datenbedarfe und Schutzinteressen.`,
    "Risiken, Nebenwirkungen und Schutzmechanismen": `Risiken liegen in Scheingenauigkeit, Datenmissbrauch, Überbürokratisierung, Benachteiligung kleiner Akteure, Lobbyeinfluss, technokratischer Übersteuerung und sozialer Schieflage. Schutz brauchen Grundrechte, Rechtsschutz, Transparenz, Beteiligung und Nicht-Kompensation schwerer negativer Wirkung.`,
    "Umsetzung und Pilotierung": `Umsetzung beginnt mit klar begrenzten Piloträumen, öffentlich erklärten Annahmen, dokumentierten Datenquellen, unabhängiger Evaluation und Korrekturzyklen. Pilotierung bedeutet lernen, nicht endgültig festschreiben.`,
    "SDG-/SDG+-Bezug und WÖk-ID-Bezug": `SDGs und SDG+ bilden den Referenzrahmen. SDG+ ist eine transparente Erweiterung der Wirkungsökonomie, keine offizielle UN-Kategorie. WÖk-IDs übersetzen diesen Rahmen in überprüfbare Indikatorfamilien.`,
    "Buchanker, Glossar, Werkzeuge und Verknüpfungen": `Die Onlinefassung ist mit Online-Buch, Glossar, Kontext-Werkzeugen, Dossiers, Downloads und relevanten Übersichten verbunden. Jeder Abschnitt erhält einen stabilen Anker für Zitate und Quellenarbeit.`,
  };
  return detailChapters.map((chapter) => `<section class="reader-subsection">${heading(2, slugify(chapter), chapter)}${paragraph(texts[chapter])}</section>`).join("");
}

function dossierBody(rank, title, summary) {
  const texts = {
    "Praxisfrage": `Woran lässt sich im Alltag, in Daten oder in Entscheidungen erkennen, dass ${title} Wirkung erzeugt, verdeckt oder verschiebt?`,
    "Fallbeispiel oder Anwendungsszenario": `${summary} Das Dossier nutzt ein modellhaftes Anwendungsszenario, um die praktische Bewertbarkeit zu zeigen, ohne eine amtliche Einstufung zu behaupten.`,
    "Berechnungs-/Bewertungslogik": `Die Bewertung folgt einem transparenten Pfad: Kontext bestimmen, relevante SDGs und SDG+-Dimensionen wählen, WÖk-IDs zuordnen, Datenquellen bewerten, Scorecard bilden, rote Linien prüfen und Ergebnis mit Unsicherheit ausweisen.`,
    "Datenquellen und Vertrauensstufen": `Vertrauensstufen reichen von geprüften Primärdaten über berichtete Organisationsdaten und öffentliche Statistik bis zu Schätzwerten. Jede Stufe muss sichtbar bleiben.`,
    "Annahmenbox": `Annahmen werden offen markiert: Bewertungszeitraum, Einheit, räumlicher Kontext, Datenlücken, Gewichtung, rote Linien und Unsicherheiten.`,
    "Beispielrechnung oder Bewertungsmatrix": `Die Matrix arbeitet mit Kernfeldern, Schwellen, Vertrauensstufen und Nicht-Kompensation. Ein positiver Wert in einem Feld hebt eine schwere negative Wirkung in einem anderen Feld nicht automatisch auf.`,
    "Ergebnisinterpretation": `Das Ergebnis ist eine Entscheidungsvorlage, keine moralische Endbewertung. Es zeigt, wo positive Netto-Wirkung wahrscheinlich ist, wo Risiken bestehen und wo Nachprüfung nötig bleibt.`,
    "Bedeutung für Akteur:innen": `Bürger:innen erhalten Verständlichkeit, Organisationen Steuerungswissen, Politik bessere Entscheidungsgrundlagen, Verwaltung Prüfpfade und Wissenschaft Anschlussfähigkeit an Daten und Methoden.`,
    "Politische Umsetzungsoptionen": `Möglich sind Marktanreize, Regulierung, Förderung, öffentliche Infrastruktur, kommunale Pilotierung, soziale Abfederung, Datenstandards, Beschaffung und Rechtsschutz. Die konkrete Gewichtung bleibt demokratisch.`,
    "Tool-/Rechnerbezug": `Relevante Werkzeuge sind WÖk-IDs, Scorecards, Reverse Merit Order, NWI, T-SROI und passende Demos oder Methoden. Sie dienen der Nachvollziehbarkeit und nicht der automatischen Entscheidung.`,
    "Grenzen und Missbrauchsschutz": `Grenzen liegen bei Scheingenauigkeit, Datenlücken, Manipulation, Übertragung auf Personen, Diskriminierung und politischer Verkürzung. Missbrauchsschutz braucht Transparenz, Prüfbarkeit, Einspruch und Evaluation.`,
    "Download und Arbeitsmaterial": `Diese Seite ist die öffentlich lesbare Fassung mit Abschnittsankern. Druckfunktion und Downloads ergänzen sie als Arbeitsmaterial.`,
  };
  return dossierChapters.map((chapter) => `<section class="reader-subsection">${heading(2, slugify(chapter), chapter)}${paragraph(texts[chapter])}</section>`).join("");
}

function detailPage(rank, topic, detailHtml, detailToc) {
  const [slug, title, summary] = topic;
  const rel = `${rank.base}/detailkonzepte/${slug}/index.html`;
  const fullToc = [...detailChapters.map((chapter) => [slugify(chapter), chapter]), ...detailToc.filter(([id]) => !detailChapters.some((chapter) => slugify(chapter) === id))];
  page({
    rel,
    title: `Detailkonzept ${title} | Wirkungsökonomie`,
    description: `Vollständiges öffentliches Detailkonzept zu ${title}.`,
    section: rank.label,
    type: "Detailkonzept",
    body: (base, route) => `${hero(base, `Detailkonzept · ${rank.label}`, `Detailkonzept ${title}`, summary, "Fachliche Onlinefassung mit politischer Anschlussfähigkeit, Werkzeugbezug und Arbeitsmaterial.", dossierHref(rank, slug), "Dossier lesen")}
      <section class="section narrow">${readingNotice("Detailkonzept")}</section>
      <section class="section narrow">${metaCard("Korrekturfassung / vollständiges Detailkonzept")}</section>
      <section class="section narrow">${tocBlock(fullToc)}</section>
      <section class="section article-section"><article class="article-body fulltext-reader">${detailSupplement(rank, title, summary)}${heading(2, "kompendiumsauszug", "Auszug aus der umfangreichen Korrekturfassung")}${detailHtml}</article></section>
      ${politicalBlock()}
      ${toolsBlock(base)}
      ${referenceBlock(base, rank)}
      ${bookBlock(base, rank)}
      ${relatedBlock(base, rank, slug, "detail")}
      ${downloadBlock(base, rank)}`,
  });
}

function dossierPage(rank, topic) {
  const [slug, title, summary] = topic;
  const rel = `${dossierHref(rank, slug)}index.html`;
  const fullToc = dossierChapters.map((chapter) => [slugify(chapter), chapter]);
  page({
    rel,
    title: `Einzeldossier ${title} | Wirkungsökonomie`,
    description: `Vollständiges öffentliches Einzeldossier zu ${title}.`,
    section: rank.label,
    type: "Einzeldossier",
    body: (base, route) => `${hero(base, `Einzeldossier · ${rank.label}`, `Einzeldossier ${title}`, summary, "Praxisfrage, Bewertungsweg, Datenquellen, Annahmen, politische Optionen, Werkzeugbezug und Grenzen.", `${rank.base}/detailkonzepte/${slug}/`, "Detailkonzept lesen")}
      <section class="section narrow">${readingNotice("Dossier")}</section>
      <section class="section narrow">${metaCard("Korrekturfassung / vollständiges Einzeldossier")}</section>
      <section class="section narrow">${tocBlock(fullToc)}</section>
      <section class="section article-section"><article class="article-body fulltext-reader">${dossierBody(rank, title, summary)}</article></section>
      ${politicalBlock()}
      ${toolsBlock(base)}
      ${referenceBlock(base, rank)}
      ${bookBlock(base, rank)}
      ${relatedBlock(base, rank, slug, "dossier")}
      ${downloadBlock(base, rank)}`,
  });
}

function indexPage(rank) {
  const rel = `${rank.base}/detailkonzepte/index.html`;
  const isImpact = rank.id === "impact";
  const title = isImpact ? "Detailkonzepte Impact Controlling" : `Detailkonzepte ${rank.label}`;
  const subtitle = isImpact
    ? "WÖk-IDs, Scorecards, NWI, T-SROI, Reverse Merit Order, Datenqualität und digitale Produktpässe."
    : "Zentrale Konzepte als Onlinefassungen, Dossiers und Arbeitsmaterial.";
  const intro = isImpact
    ? "Diese Übersicht führt zu den zentralen Konzepten des wirkungsorientierten Controllings: WÖk-IDs, Scorecards, NWI, T-SROI, Reverse Merit Order, Datenqualität und digitale Produktpässe."
    : "Diese Übersicht führt zu den zentralen Konzepten des Bereichs. Downloads und Arbeitsmaterial stehen am Seitenende.";
  page({
    rel,
    title: `${title} | Wirkungsökonomie`,
    description: `Öffentliche Langfassungen der Detailkonzepte im Bereich ${rank.label}.`,
    section: rank.label,
    type: "Detailkonzepte",
    body: (base, route) => `${hero(base, `Detailkonzepte · ${rank.label}`, title, subtitle, intro, rank.portal, "Zur Übersicht")}
      ${isImpact ? `<section class="section narrow"><aside class="citation-note" role="note"><p class="card-kicker">Worum geht es?</p><h2>Impact Controlling übersetzt Wirkung in Steuerung</h2><p>Impact Controlling übersetzt Wirkung in Steuerung: für Strategie, Risiko, Budgetierung, Beschaffung, Berichtswesen und politische Entscheidungen.</p></aside></section>` : `<section class="section narrow"><aside class="citation-note" role="note"><p class="card-kicker">Orientierung</p><h2>Detailkonzepte und Dossiers</h2><p>Jeder Unterbereich besitzt eine Detailkonzept-Seite und ein Dossier. Downloads ergänzen die Onlinefassungen am Seitenende.</p></aside></section>`}
      <section class="section"><div class="card-grid three">${rank.topics.map(([slug, title, summary]) => `<article class="card"><p class="card-kicker">Detailkonzept</p><h3>${escapeHtml(title)}</h3><p>${escapeHtml(summary)}</p><div class="portal-card-actions"><a class="text-link" href="${href(base, `${rank.base}/detailkonzepte/${slug}/`)}">Detailkonzept lesen</a><a class="text-link" href="${href(base, dossierHref(rank, slug))}">Dossier lesen</a></div></article>`).join("")}</div></section>
      ${isImpact ? `<section class="section" aria-labelledby="politics-index"><div class="card"><p class="hero-kicker">Umsetzung</p>${heading(2, "politics-index", "Was muss Politik hier tun?")}<div class="card-grid three"><article class="card"><h3>Datenzugang sichern</h3><p>Wirkungsdaten brauchen klare Zugänge, Standards und Schutzregeln.</p></article><article class="card"><h3>Prüfstandards definieren</h3><p>Bewertungen müssen nachvollziehbar, versioniert und überprüfbar bleiben.</p></article><article class="card"><h3>Datenschutz und Geschäftsgeheimnisse schützen</h3><p>Transparenz darf nicht zu Personenbewertung oder Offenlegung legitimer Schutzinteressen werden.</p></article><article class="card"><h3>KMU entlasten</h3><p>Kleine Organisationen brauchen einfache Nachweise, Hilfen und stufenweise Pfade.</p></article><article class="card"><h3>Beschaffung nach Wirkung ermöglichen</h3><p>Öffentliche Vergabe kann Wirkung berücksichtigen, ohne demokratische Entscheidung zu automatisieren.</p></article><article class="card"><h3>Evaluation und Korrektur sichern</h3><p>Wirkungsdaten bereiten Entscheidungen vor. Rechtsschutz, Evaluation und Korrektur bleiben notwendig.</p></article></div></div></section>` : ""}
      ${downloadBlock(base, rank)}`,
  });
}

function workshopPage(rank) {
  page({
    rel: `${rank.workshop}index.html`,
    title: `${rank.label} in der Arbeitsbibliothek | Wirkungsökonomie`,
    description: `Arbeitsbibliothek für ${rank.label}: Detailkonzepte, Dossiers, Downloads und öffentliche Volltexte.`,
    section: "Werkstatt",
    type: "Arbeitsbibliothek",
    body: (base, route) => `${hero(base, "Arbeitsbibliothek", rank.label, "Konzepte, Detailkonzepte, Dossiers, Downloads und Volltexte.", "Diese Seite bündelt Onlinefassungen und ergänzende Arbeitsmaterialien des Bereichs.", rank.portal, "Zur Übersicht")}
      <section class="section narrow"><aside class="citation-note" role="note"><p class="card-kicker">Werkstatt</p><h2>Öffentlich lesbare Arbeitsbibliothek</h2><p>Diese Seite bündelt die Webfassungen und Exportdateien des Bereichs.</p></aside></section>
      <section class="section"><div class="card-grid three">
        <article class="card"><p class="card-kicker">Übersicht</p><h3>${escapeHtml(rank.label)}</h3><p>Einstieg und Kontextzugang.</p><a class="text-link" href="${href(base, rank.portal)}">Zur Übersicht</a></article>
        <article class="card"><p class="card-kicker">Detailkonzepte</p><h3>Langfassungen</h3><p>Alle Unterbereiche als öffentliche Webfassung.</p><a class="text-link" href="${href(base, `${rank.base}/detailkonzepte/`)}">Detailkonzepte öffnen</a></article>
        ${rank.topics.map(([slug, title, summary]) => `<article class="card"><p class="card-kicker">Unterbereich</p><h3>${escapeHtml(title)}</h3><p>${escapeHtml(summary)}</p><a class="text-link" href="${href(base, `${rank.base}/detailkonzepte/${slug}/`)}">Detailkonzept lesen</a></article>`).join("")}
      </div></section>
      ${downloadBlock(base, rank)}`,
  });
}

function buildRank(rank) {
  const sections = splitDetailSections(rank);
  indexPage(rank);
  workshopPage(rank);
  for (const topic of rank.topics) {
    const [, title] = topic;
    const extracted = sections.get(title) || [title];
    const rendered = mdishToHtml(extracted, title);
    detailPage(rank, topic, rendered.html, rendered.toc);
    dossierPage(rank, topic);
  }
}

function sanitizePublicHtml() {
  const roots = ["wirkungsfelder", "werkzeuge", "werkstatt", "erleben"];
  const replacements = [
    [/Fassung für Online-Volltext, Dossier, Portal und Codex-Umsetzung\./g, "Fassung für Onlinefassung, Dossier und Arbeitsmaterial."],
    [/innerhalb des Portals „([^“]+)“/g, "im Bereich „$1“"],
    [/innerhalb des Portals/g, "im Bereich"],
    [/Portals/g, "Bereichs"],
    [/Portal/g, "Bereich"],
    [/öffentliche Arbeitsfassung/g, "öffentliche Onlinefassung"],
    [/öffentlichen Arbeitsfassung/g, "öffentlichen Onlinefassung"],
    [/Online-Volltext/g, "Onlinefassung"],
    [/im Repository vorhanden sind/g, "als öffentliche Exportfassung verfügbar sind"],
    [/im Repository vorhanden ist/g, "als öffentliche Exportfassung verfügbar ist"],
    [/im Repository vorliegen/g, "als öffentliche Exportfassung vorliegen"],
    [/sobald sie im Repository vorliegen/g, "sobald die öffentliche Exportfassung vorliegt"],
    [/sobald die Datei im Repository liegt/g, "sobald die öffentliche Exportfassung freigegeben ist"],
    [/Noch nicht im Repository gefunden: ([^<]+)\. Der Downloadlink wird erst gesetzt, sobald die Datei vorhanden ist\./g, "Download in Vorbereitung: $1."],
    [/Noch nicht im Repository gefunden: ([^<]+)\. Es wird kein kaputter Downloadlink gesetzt\./g, "Download in Vorbereitung: $1."],
    [/Im aktuellen Repository liegt/g, "In der aktuellen öffentlichen Fassung liegt"],
    [/Die angekündigten Word-Dokumente werden verlinkt, sobald sie im Repository vorhanden sind\./g, "Die angekündigten Word-Dokumente werden nach öffentlicher Freigabe ergänzt."],
    [/bis die gelieferten Word-Dokumente im Repository vorliegen/g, "bis die freigegebenen Word-Dokumente ergänzt sind"],
    [/wenn sie im Repository vorhanden sind/g, "wenn sie öffentlich freigegeben sind"],
    [/Codex/g, ""],
    [/CodeX/g, ""],
  ];
  const files = [];
  const walk = (dir) => {
    if (!fs.existsSync(path.join(ROOT, dir))) return;
    for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(rel);
      else if (entry.isFile() && entry.name.endsWith(".html")) files.push(rel);
    }
  };
  roots.forEach(walk);
  for (const rel of files) {
    const file = path.join(ROOT, rel);
    let html = fs.readFileSync(file, "utf8");
    const before = html;
    for (const [pattern, replacement] of replacements) html = html.replace(pattern, replacement);
    if (html !== before) fs.writeFileSync(file, html, "utf8");
  }
}

function updatePackageScripts() {
  const pkgPath = path.join(ROOT, "package.json");
  if (!fs.existsSync(pkgPath)) return;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  for (const key of ["build", "portal:build"]) {
    if (!pkg.scripts?.[key]) continue;
    if (!pkg.scripts[key].includes("build-detail-concept-corrections.mjs")) {
      pkg.scripts[key] = pkg.scripts[key].replace(
        "node scripts/portal/build-housing-city.mjs && node scripts/portal/build-sdg-reference.mjs",
        "node scripts/portal/build-housing-city.mjs && node scripts/portal/build-detail-concept-corrections.mjs && node scripts/portal/build-sdg-reference.mjs",
      );
    }
  }
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
}

function updateSitemap() {
  const sitemap = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemap)) return;
  let xml = fs.readFileSync(sitemap, "utf8");
  const urls = [];
  for (const rank of ranks) {
    urls.push(`${rank.base}/detailkonzepte/`, rank.workshop);
    for (const [slug] of rank.topics) {
      urls.push(`${rank.base}/detailkonzepte/${slug}/`, dossierHref(rank, slug));
    }
  }
  for (const rel of urls) {
    const loc = `${SITE}/${rel}`;
    xml = xml.replace(new RegExp(`\\s*<url>\\s*<loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</loc>\\s*<lastmod>[^<]+</lastmod>\\s*</url>`, "g"), "");
  }
  xml = xml.replace("</urlset>", `${urls.map((rel) => `  <url><loc>${SITE}/${rel}</loc><lastmod>${DATE}</lastmod></url>`).join("\n")}\n</urlset>`);
  fs.writeFileSync(sitemap, xml, "utf8");
}

for (const rank of ranks) buildRank(rank);
sanitizePublicHtml();
updatePackageScripts();
updateSitemap();
