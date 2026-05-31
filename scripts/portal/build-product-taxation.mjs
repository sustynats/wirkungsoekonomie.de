import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-05-24";
const CSS_VERSION = "20260525-result-interpretation";
const JS_VERSION = "20260525-sprint-2";

const sources = {
  productTax: "docs/praxis/Produktbesteuerung_durch_Wirkung_v1.1.md",
  apple: "docs/praxis/Apfelbeispiel_Produktscorecard_v1.1.md",
  supplyChain: "docs/praxis/Lieferkette_Wirkungsoekonomie_v1.1.md",
  basf: "docs/praxis/Konzern_Produktscorecard_BASF_Polyamid_v1.1.md",
  wstg: "docs/gesetze/WStG_2.0_Wirkungssteuerrahmengesetz_Entwurf.md",
  wustgGuidelines: "docs/gesetze/WUStG_Technische_Leitlinien_v2.1_Entwurf.md",
};

const bookAnchors = [
  ["Kapitel 31 - WÖk-IDs und Indikatorenarchitektur", "referenz/kapitel-031-woek-ids-und-indikatorenarchitektur/"],
  ["Kapitel 32 - Benchmarks, Skalen und Scorecards", "referenz/kapitel-032-benchmarks-skalen-und-scorecards/"],
  ["Kapitel 33 - Reverse Merit Order", "referenz/kapitel-033-reverse-merit-order/"],
  ["Kapitel 35 - Digitale Produktpässe und Wirkungsdatenräume", "referenz/kapitel-035-digitale-produktpaesse-und-wirkungsdatenraeume/"],
  ["Kapitel 37 - Wirkungssteuergesetz", "referenz/kapitel-037-das-wirkungssteuergesetz-wstg/"],
  ["Kapitel 38 - WUStG und Produktwirkungssteuer", "referenz/kapitel-038-das-wustg-und-die-produktwirkungssteuer/"],
  ["Kapitel 48 - Produkte als Wirkungsträger", "referenz/kapitel-048-produkte-als-wirkungstraeger/"],
  ["Kapitel 49 - Ehrliche Preise", "referenz/kapitel-049-ehrliche-preise/"],
  ["Kapitel 50 - Produktscorecards", "referenz/kapitel-050-produktscorecards/"],
  ["Kapitel 51 - Apfelbeispiel", "referenz/kapitel-051-das-apfelbeispiel/"],
  ["Kapitel 52 - Konsumwirkung und Verbraucherinformation", "referenz/kapitel-052-konsumwirkung-und-verbraucherinformation/"],
  ["Kapitel 53 - Markttransformation", "referenz/kapitel-053-markttransformation/"],
];

const productSdgs = [
  "SDG 2 Kein Hunger",
  "SDG 3 Gesundheit und Wohlergehen",
  "SDG 6 Sauberes Wasser",
  "SDG 8 Menschenwürdige Arbeit",
  "SDG 9 Industrie, Innovation und Infrastruktur",
  "SDG 10 Weniger Ungleichheiten",
  "SDG 12 Nachhaltige/r Konsum und Produktion",
  "SDG 13 Klimaschutz",
  "SDG 15 Leben an Land",
  "SDG 16 Frieden, Gerechtigkeit und starke Institutionen",
  "SDG 17 Partnerschaften",
];

const productSdgRefs = [
  ["SDG 2 Kein Hunger", "verstehen/sdgs-sdgplus/sdg-2-kein-hunger/", "Produktwirkung berührt Ernährung, Landwirtschaft, Versorgungssicherheit, Wasser und faire Wertschöpfung."],
  ["SDG 3 Gesundheit und Wohlergehen", "verstehen/sdgs-sdgplus/sdg-3-gesundheit-wohlergehen/", "Produkte können Gesundheit schützen, belasten oder Risiken über Inhaltsstoffe, Nutzung und Information erzeugen."],
  ["SDG 6 Sauberes Wasser", "verstehen/sdgs-sdgplus/sdg-6-sauberes-wasser-sanitaereinrichtungen/", "Wasserverbrauch, Wasserstress, Chemikalien und Abwasser gehören zur Produktwirkung."],
  ["SDG 8 Menschenwürdige Arbeit", "verstehen/sdgs-sdgplus/sdg-8-menschenwuerdige-arbeit-wirtschaftswachstum/", "Lieferketten, Löhne, Arbeitsschutz und Mitbestimmung werden produktbezogen sichtbar."],
  ["SDG 9 Industrie, Innovation und Infrastruktur", "verstehen/sdgs-sdgplus/sdg-9-industrie-innovation-infrastruktur/", "Produktinnovation, Dateninfrastruktur, Reparaturfähigkeit und industrielle Transformation werden rückgekoppelt."],
  ["SDG 10 Weniger Ungleichheiten", "verstehen/sdgs-sdgplus/sdg-10-weniger-ungleichheiten/", "Preise, Kaufkraftschutz, Zugang und Lieferkettenfairness betreffen Verteilungswirkung."],
  ["SDG 12 Nachhaltige/r Konsum und Produktion", "verstehen/sdgs-sdgplus/sdg-12-nachhaltiger-konsum-produktion/", "SDG 12 ist der direkte Referenzanker für Produktwirkung, Scorecards, Produktpässe und ehrliche Preise."],
  ["SDG 13 Klimaschutz", "verstehen/sdgs-sdgplus/sdg-13-klimaschutz/", "Produktklima, Energie, Transport, Nutzung und Entsorgung werden als Systemrisiko sichtbar."],
  ["SDG 15 Leben an Land", "verstehen/sdgs-sdgplus/sdg-15-leben-an-land/", "Rohstoffe, Landnutzung, Biodiversität, Pestizide und Entwaldung wirken über Produkte in Ökosysteme."],
  ["SDG 16 Frieden, Gerechtigkeit und starke Institutionen", "verstehen/sdgs-sdgplus/sdg-16-frieden-gerechtigkeit-starke-institutionen/", "Produktwirkung braucht Rechtsschutz, transparente Institutionen, Korruptionsschutz und Zugang zu Information."],
  ["SDG 17 Partnerschaften", "verstehen/sdgs-sdgplus/sdg-17-partnerschaften/", "Datenräume, Standards, Lieferkettenkooperation und internationale Anschlussfähigkeit sind Umsetzungsbedingungen."],
];

const sdgPlus = [
  "SDG+ Demokratie",
  "SDG+ Medienqualität",
  "SDG+ Rechtsstaatlichkeit",
  "SDG+ Diskursfähigkeit",
  "SDG+ institutionelles Vertrauen",
  "SDG+ gesellschaftlicher Zusammenhalt",
  "SDG+ digitale Selbstbestimmung",
];

const productSdgPlusRefs = [
  ["SDG+ Demokratie", "verstehen/sdgs-sdgplus/#sdgplus-demokratie", "Demokratische Stabilität, Teilhabe, Streitfähigkeit und Korrekturfähigkeit als Wirkungsbedingung."],
  ["SDG+ Medienqualität", "verstehen/sdgs-sdgplus/#sdgplus-medienqualitaet", "Produktinformation, Werbung und Green Claims brauchen Quellenklarheit und Korrekturfähigkeit."],
  ["SDG+ Rechtsstaatlichkeit", "verstehen/sdgs-sdgplus/#sdgplus-rechtsstaatlichkeit", "Wirkungssteuerung braucht Grundrechte, Rechtsschutz, Verhältnismäßigkeit und transparente Verfahren."],
  ["SDG+ Diskursfähigkeit", "verstehen/sdgs-sdgplus/#sdgplus-diskursfaehigkeit", "Zielkonflikte um Preise, Konsum, Klima, Kaufkraft und Übergänge müssen öffentlich verhandelbar bleiben."],
  ["SDG+ institutionelles Vertrauen", "verstehen/sdgs-sdgplus/#sdgplus-institutionelles-vertrauen", "Verbraucher:innen und Unternehmen brauchen Vertrauen in Daten, Prüfstellen, Wirkungsrat und Korrekturwege."],
  ["SDG+ gesellschaftlicher Zusammenhalt", "verstehen/sdgs-sdgplus/#sdgplus-gesellschaftlicher-zusammenhalt", "Ehrliche Preise müssen mit Kaufkraftschutz, Fairness, Übergängen und Teilhabe verbunden werden."],
  ["SDG+ digitale Selbstbestimmung", "verstehen/sdgs-sdgplus/#sdgplus-digitale-selbstbestimmung", "Digitale Produktpässe und Verbraucherinformation dürfen keine Personenbewertung oder Konsumüberwachung erzeugen."],
];

const contextualTools = [
  {
    title: "Wirkungsumsatzsteuer",
    type: "Gesetz / Steuerlogik",
    status: "Erklärung vorhanden",
    href: "werkzeuge/wirkungsumsatzsteuer/",
    lawHref: "werkstatt/leitlinien/wustg/",
    bookHref: "referenz/kapitel-038-das-wustg-und-die-produktwirkungssteuer/",
    short: "Koppelt Produkt- und Leistungsbesteuerung im Pilotmodell an geprüfte Wirkung.",
    why: "Im Produktportal ist sie die Rückkopplung zwischen Scorecard, Steuerklasse, Preis und Konsumentscheidung.",
  },
  {
    title: "Produktscorecards",
    type: "Bewertungsmethode",
    status: "Erklärung vorhanden",
    href: "werkzeuge/produktscorecards/",
    demoHref: "scorecard-dashboard.html",
    bookHref: "referenz/kapitel-050-produktscorecards/",
    short: "Übersetzen Produktdaten, WÖk-IDs und Benchmarks in nachvollziehbare Einzelscores.",
    why: "Sie machen sichtbar, in welchen Feldern ein Produkt positive, negative oder neutrale Wirkung zeigt.",
  },
  {
    title: "WÖk-IDs",
    type: "Datenarchitektur",
    status: "Erklärung vorhanden",
    href: "werkzeuge/woek-ids/",
    bookHref: "referenz/kapitel-031-woek-ids-und-indikatorenarchitektur/",
    short: "Eindeutige Kennungen für Wirkungsindikatoren mit Quelle, Einheit, Schwelle und Version.",
    why: "Sie verhindern, dass Produktwirkung beliebig benannt, doppelt gezählt oder ohne Prüfstatus verwendet wird.",
  },
  {
    title: "Reverse Merit Order",
    type: "Schutzregel",
    status: "Erklärung vorhanden",
    href: "werkzeuge/reverse-merit-order/",
    lawHref: "werkstatt/leitlinien/wustg/#teil-3-bewertungsrahmen",
    bookHref: "referenz/kapitel-033-reverse-merit-order/",
    short: "Das schwächste kritische Wirkungsfeld begrenzt die Gesamtbewertung.",
    why: "Schwere negative Wirkungen dürfen bei Produkten nicht durch gute Einzelwerte schöngerechnet werden.",
  },
  {
    title: "Digitale Produktpässe und Wirkungsdatenräume",
    type: "Dateninfrastruktur",
    status: "Erklärung vorhanden",
    href: "werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/",
    bookHref: "referenz/kapitel-035-digitale-produktpaesse-und-wirkungsdatenraeume/",
    short: "Bündeln Produkt-, Lieferketten-, Prüf- und Wirkungsdaten interoperabel.",
    why: "Ohne prüfbare Datenräume bleibt Produktbesteuerung entweder grob, streitanfällig oder nicht auditierbar.",
  },
  {
    title: "Wirkungsrat",
    type: "Institution",
    status: "Erklärung vorhanden",
    href: "werkzeuge/wirkungsrat/",
    lawHref: "werkstatt/gesetze/wirkungssteuergesetz/#paragraf-29",
    bookHref: "referenz/kapitel-040-der-wirkungsrat/",
    short: "Unabhängige Instanz für Evaluation, Indikatoren, Benchmarks und Missbrauchsschutz.",
    why: "Produktsteuerlogik braucht öffentliche Kontrolle, Korrekturpfade und Schutz vor Lobby- oder Datenmanipulation.",
  },
  {
    title: "Produktwirkungsrechner",
    type: "Demo",
    status: "Prototyp vorhanden",
    href: "erleben/produktwirkungsrechner/",
    demoHref: "erleben/produktwirkungsrechner/",
    bookHref: "referenz/kapitel-050-produktscorecards/",
    short: "Modellhafte Simulation von Scores, FinalScore, Steuerklasse und Bruttopreis.",
    why: "Der Rechner macht die Logik der Wirkungsumsatzsteuer erfahrbar, ohne eine amtliche Einstufung zu behaupten.",
  },
];

const go8ToolRegistry = {
  Produktwirkungsrechner: {
    title: "Produktwirkungsrechner",
    type: "Demo",
    status: "Prototyp vorhanden",
    href: "erleben/produktwirkungsrechner/",
    demoHref: "erleben/produktwirkungsrechner/",
    bookHref: "referenz/kapitel-050-produktscorecards/",
    short: "Modellhafte Simulation von Produktbeispiel, Scores, FinalScore, Steuerklasse und Bruttopreis.",
    why: "Macht die Logik der Wirkungsumsatzsteuer erfahrbar, ohne eine amtliche Einstufung zu behaupten.",
  },
  "Wirkungssteuer-Simulator": {
    title: "Wirkungssteuer-Simulator",
    type: "Toolidee",
    status: "Demo in Vorbereitung",
    href: "",
    short: "Soll unterschiedliche Steuerklassen, Übergangspfade, soziale Abfederung und politische Varianten vergleichbar machen.",
    why: "Die WUSt-Logik braucht nachvollziehbare Szenarien, bevor konkrete Satzhöhen politisch entschieden werden.",
  },
  "Apfel-Rechner": {
    title: "Apfel-Rechner",
    type: "Beispielrechner",
    status: "Demo in Vorbereitung",
    href: "wirkungsfelder/produkte-konsum/apfelbeispiel/",
    short: "Überträgt das Apfelbeispiel in eine nachvollziehbare Scorecard- und Steuerklassenlogik.",
    why: "Das Beispiel zeigt, dass Produktwirkung kontextabhängig ist und nicht aus Herkunft oder Label allein folgt.",
  },
  "T-Shirt-Lieferkettenrechner": {
    title: "T-Shirt-Lieferkettenrechner",
    type: "Beispielrechner",
    status: "Demo in Vorbereitung",
    href: "wirkungsfelder/produkte-konsum/t-shirt/",
    short: "Soll Textilwirkung über Baumwolle, Wasser, Chemie, Arbeit, Transport, Nutzung und Kreislauf modellieren.",
    why: "Textilien zeigen besonders gut, warum Lieferkette, Nutzung und Ende gemeinsam bewertet werden müssen.",
  },
  "Produktscorecard-Generator": {
    title: "Produktscorecard-Generator",
    type: "Toolidee",
    status: "Demo in Vorbereitung",
    href: "werkzeuge/produktscorecards/",
    short: "Soll Produktklassen, Indikatoren, Datenqualität, Scores und FinalScore strukturiert zusammenführen.",
    why: "Ohne Scorecard-Generator bleibt Produktwirkung schwer vergleichbar und schlecht auditierbar.",
  },
  "DPP-Demo": {
    title: "DPP-Demo",
    type: "Dateninfrastruktur",
    status: "Konzeptseite vorhanden",
    href: "werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/",
    short: "Zeigt, wie digitale Produktpässe Produkt-, Material-, Lieferketten-, Reparatur- und Wirkungsdaten tragen können.",
    why: "Produktwirkung braucht ein Produktgedächtnis, das über Hersteller, Handel, Nutzung und Entsorgung hinweg lesbar bleibt.",
  },
  "WÖk-ID-Browser": {
    title: "WÖk-ID-Browser",
    type: "Datenwerkzeug",
    status: "Konzeptseite vorhanden",
    href: "werkzeuge/woek-ids/",
    short: "Soll Indikatorfamilien, Quellen, Einheiten, Schwellen, Versionen und SDG-/SDG+-Bezüge recherchierbar machen.",
    why: "WÖk-IDs verhindern beliebige KPI-Namen und machen Produktwirkung prüfbar.",
  },
  "Lieferketten-Scorecard": {
    title: "Lieferketten-Scorecard",
    type: "Toolidee",
    status: "Demo in Vorbereitung",
    href: "wirkungsfelder/produkte-konsum/lieferketten/",
    short: "Soll Lieferanten, Vorleistungen, Datenqualität, rote Linien und Verbesserungswege produktbezogen bewerten.",
    why: "Produktwirkung entsteht häufig vor dem eigenen Werkstor; Lieferketten brauchen deshalb eine prüfbare Scorecard-Logik.",
  },
  "Vorsteuer- und Bonuslogik-Simulator": {
    title: "Vorsteuer- und Bonuslogik-Simulator",
    type: "Toolidee",
    status: "Demo in Vorbereitung",
    href: "",
    short: "Soll zeigen, wie Vorleistungen, Importlogik, Bonusfähigkeit und negative Wirkung in der WUStG-Logik rückgekoppelt werden.",
    why: "Die Wirkungsumsatzsteuer wird erst belastbar, wenn Lieferkettenwirkung nicht als Durchlaufposten verschwindet.",
  },
  "CSRD-zu-Produktscorecard-Demo": {
    title: "CSRD-zu-Produktscorecard-Demo",
    type: "Toolidee",
    status: "Demo in Vorbereitung",
    href: "wirkungsfelder/wirtschaft-unternehmen/risikomanagement-resilienz-finanzmarkt/",
    short: "Soll Unternehmens- und Berichtsdaten in produktgruppenbezogene Scorecard-Felder übersetzen.",
    why: "CSRD-Daten werden wirkungsökonomisch erst handlungsfähig, wenn sie auf Produktgruppen und Entscheidungen heruntergebrochen werden.",
  },
  "Produktpass-Mapping": {
    title: "Produktpass-Mapping",
    type: "Dateninfrastruktur",
    status: "Konzeptseite vorhanden",
    href: "werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/",
    short: "Verknüpft Produktpass-Felder mit WÖk-IDs, Scorecards, Lieferkettennachweisen und Verbraucherinformation.",
    why: "Digitale Produktpässe brauchen eine Wirkungslogik, damit Daten nicht nur gesammelt, sondern für Rückkopplung genutzt werden.",
  },
};

const externalSources = [
  ["UN SDGs", "https://sdgs.un.org/goals"],
  ["UN SDG Indicators", "https://unstats.un.org/sdgs/indicators/indicators-list/"],
  ["European Commission CSRD", "https://finance.ec.europa.eu/financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en"],
  ["EFRAG ESRS", "https://www.efrag.org/en/sustainability-reporting"],
  ["GRI Standards", "https://www.globalreporting.org/standards/"],
  ["Eurostat NACE", "https://ec.europa.eu/eurostat/web/nace"],
  ["Destatis SDG-Indikatoren", "https://sdg-indikatoren.de/"],
];

const conceptDownloads = [
  {
    label: "Konzeptpapier Word",
    href: "assets/downloads/woek_produkte_konsum_wirkungsumsatzsteuer_konzeptpapier_v0_1.docx",
    required: true,
  },
  {
    label: "Dossier Word",
    href: "assets/downloads/woek_produkte_konsum_wirkungsumsatzsteuer_dossier_v0_1.docx",
    required: true,
  },
  { label: "Working Paper PDF", href: "assets/pdf/working-paper-produktbesteuerung-durch-wirkung.pdf" },
];

const go8ProductDetails = [
  {
    no: "15",
    rel: "wirkungsfelder/produkte-konsum/produkte-als-wirkungstraeger/index.html",
    source: "docs/produkte-konsum/go8-detailkonzepte/online_volltext_15_produkte-als-wirkungstraeger-lebenszyklus_detailkonzept_v1_0.md",
    title: "Produkte als Wirkungsträger | Produkte & Konsum",
    h1: "Produkte als Wirkungsträger",
    subtitle: "Produktwirkung über Lebenszyklus, Lieferkette, Nutzung und Ende denken.",
    description: "Echtes Detailkonzept zu Produkten als Wirkungsträgern: Lebenszyklus, Lieferkette, Nutzung, Ende, WÖk-IDs, Produktverantwortung und Verbraucherinformation.",
    hero: "Dieses Detailkonzept vertieft, warum Produkte in der Wirkungsökonomie nicht nur Waren sind, sondern verdichtete Wirkungsräume aus Rohstoffen, Herstellung, Nutzung, Reparatur, Entsorgung und Information.",
    docx: "assets/downloads/15_woek_produkte_konsum_produkte-als-wirkungstraeger-lebenszyklus_detailkonzept_v1_0.docx",
    pdf: "assets/downloads/15_woek_produkte_konsum_produkte-als-wirkungstraeger-lebenszyklus_detailkonzept_v1_0.pdf",
    detailText: "Lebenszyklus, Produktverantwortung, Verbraucherinformation und Produktdaten als Grundlage ehrlicher Preise.",
    tools: ["Produktwirkungsrechner", "WÖk-ID-Browser", "Produktscorecard-Generator", "DPP-Demo"],
  },
  {
    no: "16",
    rel: "wirkungsfelder/produkte-konsum/wirkungsumsatzsteuer-produktwirkungssteuer/index.html",
    source: "docs/produkte-konsum/go8-detailkonzepte/online_volltext_16_wirkungsumsatzsteuer-produktwirkungssteuer_detailkonzept_v1_0.md",
    title: "Wirkungsumsatzsteuer / Produktwirkungssteuer | Produkte & Konsum",
    h1: "Wirkungsumsatzsteuer / Produktwirkungssteuer",
    subtitle: "Preise, Steuern und Produktwirkung als Rückkopplungsarchitektur.",
    description: "Echtes Detailkonzept zur Wirkungsumsatzsteuer: FinalScore, Steuerklasse, Reverse Merit Order, Vorsteuerlogik, Kaufkraftschutz, KMU-Übergänge und Wirkungsrat.",
    hero: "Diese Vertiefung erklärt die Produktwirkungssteuer als demokratisch kontrollierte Preisrückkopplung: Sie verbietet nicht, sondern macht sichtbar, was der alte Preis verschweigt.",
    docx: "assets/downloads/16_woek_produkte_konsum_wirkungsumsatzsteuer-produktwirkungssteuer_detailkonzept_v1_0.docx",
    pdf: "assets/downloads/16_woek_produkte_konsum_wirkungsumsatzsteuer-produktwirkungssteuer_detailkonzept_v1_0.pdf",
    detailText: "FinalScore, Steuerklassen, Vorsteuerlogik, Nichtkompensation, Kaufkraftschutz und rechtliche Einbettung.",
    tools: ["Wirkungssteuer-Simulator", "Produktwirkungsrechner", "Apfel-Rechner", "T-Shirt-Lieferkettenrechner"],
  },
  {
    no: "17",
    rel: "wirkungsfelder/produkte-konsum/produktscorecards-reverse-merit-order-digitale-produktpaesse/index.html",
    source: "docs/produkte-konsum/go8-detailkonzepte/online_volltext_17_produktscorecards-reverse-merit-order-digitale-produktpaesse_detailkonzept_v1_0.md",
    title: "Produktscorecards, Reverse Merit Order und digitale Produktpässe | Produkte & Konsum",
    h1: "Produktscorecards, Reverse Merit Order und digitale Produktpässe",
    subtitle: "Methodik für Produktwirkung, Datenqualität, Engpasslogik und Markttransparenz.",
    description: "Echtes Detailkonzept zu Produktscorecards, Reverse Merit Order, WÖk-IDs, Datenqualität, digitalen Produktpässen, Assurance und Verbraucherinformation.",
    hero: "Diese Vertiefung beschreibt die operative Brücke zwischen Produktdaten und Wirkungssteuerung: Scorecards, WÖk-IDs, Engpasslogik und digitale Produktpässe.",
    docx: "assets/downloads/17_woek_produkte_konsum_produktscorecards-reverse-merit-order-digitale-produktpaesse_detailkonzept_v1_0.docx",
    pdf: "assets/downloads/17_woek_produkte_konsum_produktscorecards-reverse-merit-order-digitale-produktpaesse_detailkonzept_v1_0.pdf",
    detailText: "Scorecard-Aufbau, Datenqualität, Benchmarks, Reverse Merit Order, DPP und Assurance als Produktgedächtnis.",
    tools: ["Produktscorecard-Generator", "DPP-Demo", "WÖk-ID-Browser", "Produktwirkungsrechner"],
  },
];

const go9ProductDetails = [
  {
    no: "18",
    rel: "wirkungsfelder/produkte-konsum/apfelbeispiel-produktwirkungsrechnung/index.html",
    source: "docs/produkte-konsum/go9-detailkonzepte/online_volltext_18_18_apfelbeispiel_produktwirkungsrechnung_detailkonzept_v1_0.md",
    title: "Das Apfelbeispiel und die Produktwirkungsrechnung im Alltag | Produkte & Konsum",
    h1: "Das Apfelbeispiel und die Produktwirkungsrechnung im Alltag",
    subtitle: "Automatisierte Einstufung, Scorecard, Steuerklasse und Preisschild am kleinsten verständlichen Produktfall.",
    description: "Echtes Detailkonzept zum Apfelbeispiel: Produktidentifikation, Scorecard, Steuerklasse, Preisschild, Verbraucherinformation und Produktwirkungsrechnung im Alltag.",
    hero: "Diese Vertiefung macht die Wirkungsumsatzsteuer am einfachsten Produktfall greifbar: Ein Apfel wird nicht zum Symbol, sondern zum vollständigen Testfall für ehrliche Preise.",
    docx: "assets/downloads/18_woek_produkte_konsum_apfelbeispiel_produktwirkungsrechnung_detailkonzept_v1_0.docx",
    pdf: "assets/downloads/18_woek_produkte_konsum_apfelbeispiel_produktwirkungsrechnung_detailkonzept_v1_0.pdf",
    detailText: "Apfelbeispiel, Produktwirkungsrechnung, Scorecard, Steuerklasse, Preisschild und Alltagstransparenz.",
    tools: ["Apfel-Rechner", "Produktwirkungsrechner", "Produktscorecard-Generator", "DPP-Demo"],
  },
  {
    no: "19",
    rel: "wirkungsfelder/produkte-konsum/lieferketten-importlogik-wirkungsvorsteuer/index.html",
    source: "docs/produkte-konsum/go9-detailkonzepte/online_volltext_19_19_lieferketten_importlogik_wirkungsvorsteuer_detailkonzept_v1_0.md",
    title: "Lieferketten, Importlogik und Wirkungsvorsteuer | Produkte & Konsum",
    h1: "Lieferketten, Importlogik und Wirkungsvorsteuer",
    subtitle: "Wie Wirkung entlang globaler Wertschöpfungsketten steuerlich rückgekoppelt wird.",
    description: "Echtes Detailkonzept zu Lieferketten, Importlogik und Wirkungsvorsteuer: Vorleistungen, Bonuslogik, Importe, DPP, Lieferanten-Scorecards und rote Linien.",
    hero: "Diese Vertiefung zeigt, warum Produktwirkung nicht an der Landesgrenze und nicht beim letzten Hersteller beginnt: Lieferkettenwirkung muss in Vorsteuer- und Bonuslogiken sichtbar bleiben.",
    docx: "assets/downloads/19_woek_produkte_konsum_lieferketten_importlogik_wirkungsvorsteuer_detailkonzept_v1_0.docx",
    pdf: "assets/downloads/19_woek_produkte_konsum_lieferketten_importlogik_wirkungsvorsteuer_detailkonzept_v1_0.pdf",
    detailText: "Lieferketten, Importlogik, Wirkungsvorsteuer, Bonusfähigkeit, Supplier Scorecards und globale Anschlussfähigkeit.",
    tools: ["Lieferketten-Scorecard", "Vorsteuer- und Bonuslogik-Simulator", "T-Shirt-Lieferkettenrechner", "WÖk-ID-Browser"],
  },
  {
    no: "20",
    rel: "wirkungsfelder/produkte-konsum/konzernbeispiel-csrd-produktscorecard/index.html",
    source: "docs/produkte-konsum/go9-detailkonzepte/online_volltext_20_20_konzernbeispiel_csrd_produktscorecard_detailkonzept_v1_0.md",
    title: "Konzern- und Produktgruppenbeispiel: Von CSRD zur Produktscorecard | Produkte & Konsum",
    h1: "Konzern- und Produktgruppenbeispiel: Von CSRD zur Produktscorecard",
    subtitle: "Wie Nachhaltigkeitsberichte in produktbezogene Wirkungs- und Steuerungsdaten übersetzt werden können.",
    description: "Echtes Detailkonzept zum Konzern- und Produktgruppenbeispiel: CSRD/ESRS, Produktgruppen, BASF/Polyamid-Modell, WÖk-IDs, DPP und Produktscorecards.",
    hero: "Diese Vertiefung übersetzt die Berichtsebene in die Produktgruppenebene: Wirkung darf nicht im Konzernmittelwert verschwinden.",
    docx: "assets/downloads/20_woek_produkte_konsum_konzernbeispiel_csrd_produktscorecard_detailkonzept_v1_0.docx",
    pdf: "assets/downloads/20_woek_produkte_konsum_konzernbeispiel_csrd_produktscorecard_detailkonzept_v1_0.pdf",
    detailText: "CSRD-zu-Produktscorecard, Produktgruppen, WÖk-IDs, DPP, Assurance und Konzernsteuerung.",
    tools: ["CSRD-zu-Produktscorecard-Demo", "Produktpass-Mapping", "WÖk-ID-Browser", "Produktscorecard-Generator"],
  },
];

const productSingleDossiers = [
  {
    slug: "wirkungsumsatzsteuer",
    title: "Einzeldossier Wirkungsumsatzsteuer",
    subtitle: "Steuerklassen, FinalScore, Tarifmatrix und Produktwirkungssteuer im Produktportal.",
    focus: "Die Wirkungsumsatzsteuer koppelt Produktpreise im Pilotmodell an geprüfte Produktwirkung. Sie bewertet nicht Konsument:innen, sondern Produkte, Leistungen und Lieferketten entlang von Mensch, Planet, Demokratie und Datenqualität.",
    sections: [
      ["Ausgangspunkt", "Klassische Umsatzsteuer behandelt Produkte weitgehend gleich, obwohl ihre Wirkungen sehr unterschiedlich sein können."],
      ["Modelllogik", "WÖk-IDs, Produktscorecards, FinalScore und Reverse Merit Order führen zu einer modellhaften Steuerklasse."],
      ["Grenze", "Ohne Gesetzgebung, Rechtsschutz, Datenqualität und Wirkungsrat bleibt die WUStG-Logik ein Pilot- und Konzeptmodell."],
    ],
    related: ["Wirkungsumsatzsteuer", "Produktscorecards", "WÖk-IDs", "Reverse Merit Order", "Wirkungsrat"],
    canonical: "werkzeuge/wirkungsumsatzsteuer/",
  },
  {
    slug: "produktscorecards",
    title: "Einzeldossier Produktscorecards",
    subtitle: "Wie Produktdaten in Scores, FinalScore und Steuerklassen übersetzt werden.",
    focus: "Produktscorecards sind das Bewertungsraster der Produktwirkung. Sie machen sichtbar, welche Zustände ein Produkt verändert und welche Datenqualität hinter der Bewertung steht.",
    sections: [
      ["Score-Felder", "Kernfelder wie Mensch, Planet, Demokratie und Datenqualität werden von -3 bis +3 bewertet."],
      ["FinalScore", "Der FinalScore darf kritische negative Wirkungen nicht durch positive Einzelwerte schöngerechnet überdecken."],
      ["Prüfbarkeit", "Jeder Score braucht Quelle, Einheit, Schwelle, Version und Prüfstatus."],
    ],
    related: ["Produktscorecards", "WÖk-IDs", "Reverse Merit Order", "Digitale Produktpässe und Wirkungsdatenräume"],
    canonical: "werkzeuge/produktscorecards/",
  },
  {
    slug: "woek-ids-im-produktbereich",
    title: "Einzeldossier WÖk-IDs im Produktbereich",
    subtitle: "Indikatorenarchitektur für Produktwirkung, Lieferketten und Datenqualität.",
    focus: "WÖk-IDs verbinden SDGs, SDG+, NACE, ESRS, GRI, Benchmarks und Produktdaten zu einer nachvollziehbaren Wirkungslogik.",
    sections: [
      ["Eindeutigkeit", "Eine WÖk-ID verhindert, dass dieselbe Wirkung unter beliebigen Namen mehrfach gezählt wird."],
      ["Produktbezug", "Für Produkte braucht jede WÖk-ID Kontext: Branche, Produktgruppe, Lieferkette, Einheit und Bewertungszeitraum."],
      ["Datenstatus", "Datenlücken werden sichtbar und dürfen nicht als positive Wirkung behandelt werden."],
    ],
    related: ["WÖk-IDs", "Digitale Produktpässe und Wirkungsdatenräume", "Produktscorecards"],
    canonical: "werkzeuge/woek-ids/",
  },
  {
    slug: "reverse-merit-order",
    title: "Einzeldossier Reverse Merit Order",
    subtitle: "Warum das schwächste kritische Wirkungsfeld die Einstufung begrenzt.",
    focus: "Die Reverse Merit Order schützt vor Schönrechnung. Schwere negative Wirkungen bleiben entscheidungsrelevant, auch wenn andere Felder positive Werte zeigen.",
    sections: [
      ["Nicht-Kompensation", "Rote Linien wie schwere Menschenrechtsverletzungen oder massive ökologische Schäden können nicht durch Marketing- oder Effizienzwerte ausgeglichen werden."],
      ["Produktwirkung", "Bei Produkten verhindert die Regel, dass ein positiver Teilscore eine kritische Lieferkettenwirkung verdeckt."],
      ["Governance", "Die Regel braucht transparente Schwellen, öffentliche Begründung und unabhängige Evaluation."],
    ],
    related: ["Reverse Merit Order", "Produktscorecards", "Wirkungsrat"],
    canonical: "werkzeuge/reverse-merit-order/",
  },
  {
    slug: "apfelbeispiel",
    title: "Einzeldossier Apfelbeispiel",
    subtitle: "Regionaler Apfel vs. Chile-Apfel als didaktische Produktscorecard.",
    focus: "Das Apfelbeispiel zeigt, dass Produktwirkung kontextabhängig ist. Regional, bio oder importiert ist nicht automatisch positiv oder negativ; Wasser, Arbeit, Transport, Biodiversität, Lagerung und Datenqualität müssen zusammen betrachtet werden.",
    sections: [
      ["NACE", "Kernobstbau wird als wirtschaftliche Aktivität eingeordnet und mit passenden Wirkungsfeldern verbunden."],
      ["Scorecard", "Klima, Wasser, Biodiversität, Arbeit, Gesundheit und Datenqualität werden modellhaft bewertet."],
      ["Verbraucherinformation", "Die Bewertung soll verständlich machen, warum ein Produkt entlastet oder belastet wird."],
    ],
    related: ["Produktscorecards", "WÖk-IDs", "Reverse Merit Order", "Wirkungsumsatzsteuer"],
    canonical: "wirkungsfelder/produkte-konsum/apfelbeispiel/",
  },
  {
    slug: "lieferketten",
    title: "Einzeldossier Lieferketten",
    subtitle: "Vorleistungen, Datenräume, Vorsteuerlogik und rote Linien in globalen Lieferketten.",
    focus: "Viele Produktwirkungen entstehen vor dem Endprodukt. Lieferketten dürfen deshalb nicht als Schlupfloch für negative Wirkung dienen.",
    sections: [
      ["Vorleistungen", "Positive und negative Wirkung kann in Vorprodukten, Rohstoffen, Transporten, Energie und Arbeit entstehen."],
      ["Vorsteuerlogik", "Positive Vorleistungen können begünstigt werden; negative Wirkungen bleiben sichtbar und können Abschläge auslösen."],
      ["Datenräume", "Digitale Produktpässe und Wirkungsdatenräume schaffen die prüfbare Infrastruktur."],
    ],
    related: ["Digitale Produktpässe und Wirkungsdatenräume", "WÖk-IDs", "Reverse Merit Order", "Wirkungsrat"],
    canonical: "wirkungsfelder/produkte-konsum/lieferketten/",
  },
  {
    slug: "basf-polyamid",
    title: "Einzeldossier BASF Polyamid",
    subtitle: "Von Konzern- und ESRS-Daten zu Produktgruppen und Produktscorecards.",
    focus: "Das Konzernbeispiel zeigt den methodischen Weg von Unternehmensdaten zu Produktgruppen. Es behauptet keine abschließende Echtbewertung eines Unternehmens.",
    sections: [
      ["Konzernmittelwert", "Unternehmensberichte können Wirkung verdecken, wenn sehr unterschiedliche Produktgruppen zusammenfallen."],
      ["Produktgruppe", "NACE, ESRS-Daten, EPDs, Benchmarks und Produktpässe helfen bei der Übersetzung auf Produktgruppen."],
      ["Impact Controlling", "Die Methode verbindet Produktbewertung mit Unternehmenssteuerung und Transformationsrisiko."],
    ],
    related: ["Produktscorecards", "Impact Controlling", "WÖk-IDs", "Digitale Produktpässe und Wirkungsdatenräume"],
    canonical: "wirkungsfelder/produkte-konsum/basf-polyamid/",
  },
  {
    slug: "verbraucherinformation",
    title: "Einzeldossier Verbraucherinformation",
    subtitle: "Wirkungspunkte, Produktlabel, Steuerklassen und Regaltransparenz.",
    focus: "Verbraucherinformation macht Produktwirkung sichtbar, ohne Menschen zu bewerten oder Konsumverhalten zu überwachen.",
    sections: [
      ["Produktlabel", "Informationen müssen verständlich, knapp und prüfbar sein."],
      ["Datenschutz", "Bewertet wird das Produkt, nicht die Person an der Kasse."],
      ["Vertrauen", "Gute Verbraucherinformation braucht Quellenklarheit, Prüfstatus und institutionelle Kontrolle."],
    ],
    related: ["Wirkungsumsatzsteuer", "Produktscorecards", "WÖk-IDs", "Wirkungsrat"],
    canonical: "wirkungsfelder/produkte-konsum/verbraucherinformation/",
  },
  {
    slug: "unternehmen-produktentwicklung",
    title: "Einzeldossier Unternehmen und Produktentwicklung",
    subtitle: "Produktwirkung in Entwicklung, Einkauf, Controlling, Reporting und Lieferketten.",
    focus: "Für Unternehmen wird Produktwirkung steuerungsrelevant: Materialwahl, Lieferanten, Datenqualität, Kreislauf, Risiko und Strategie werden miteinander verbunden.",
    sections: [
      ["Produktentwicklung", "Designentscheidungen wirken auf Reparierbarkeit, Energie, Material, Gesundheit und Kreislauf."],
      ["Einkauf", "Lieferantenbewertung wird Wirkungs- und Datenqualitätsfrage."],
      ["Reporting", "CSRD- und ESRS-Daten werden produktnäher und entscheidungsrelevant."],
    ],
    related: ["Impact Controlling", "Produktscorecards", "WÖk-IDs", "Digitale Produktpässe und Wirkungsdatenräume"],
    canonical: "wirkungsfelder/produkte-konsum/unternehmen/",
  },
  {
    slug: "politische-rahmenbedingungen",
    title: "Einzeldossier politische Rahmenbedingungen",
    subtitle: "WStG, WUStG, Wirkungsrat, Datenschutz, Pilotierung und soziale Abfederung.",
    focus: "Produktbesteuerung durch Wirkung braucht einen demokratisch kontrollierten Rechts- und Institutionenrahmen.",
    sections: [
      ["Recht", "WStG und WUStG müssen Begriffe, Verfahren, Rechtsschutz und Missbrauchsschutz klären."],
      ["Institutionen", "Der Wirkungsrat sichert Indikatoren, Benchmarks, Evaluation und Korrekturpfade."],
      ["Übergang", "Pilotierung, KMU-Schutz, Kaufkraftschutz und europarechtliche Prüfung sind Teil der Einführung."],
    ],
    related: ["Wirkungssteuergesetz", "Wirkungsrat", "Wirkungsumsatzsteuer", "WÖk-IDs"],
    canonical: "wirkungsfelder/produkte-konsum/politische-rahmenbedingungen/",
  },
];

const lawRefs = {
  wstg1: {
    label: "§ 1 WStG",
    href: "werkstatt/gesetze/wirkungssteuergesetz/#paragraf-1",
    text: "Zweck des Gesetzes: Rahmen für steuerliche Rückkopplung nach geprüfter Wirkung.",
  },
  wustg3: {
    label: "§ 3 WUStG",
    href: "werkstatt/leitlinien/wustg/#teil-4-woek-ids-und-indikatorenarchitektur",
    text: "WUStG-Paragrafenseite in Ausarbeitung; die Leitlinien beschreiben Register und WÖk-ID-Architektur.",
  },
  wustg4: {
    label: "§ 4 WUStG",
    href: "werkstatt/leitlinien/wustg/#teil-7-scorecards",
    text: "WUStG-Paragrafenseite in Ausarbeitung; die Leitlinien beschreiben Scorecards je Produkt oder Aktivität.",
  },
  wustg5: {
    label: "§ 5 WUStG",
    href: "werkstatt/leitlinien/wustg/#teil-8-finalscore",
    text: "WUStG-Paragrafenseite in Ausarbeitung; die Leitlinien beschreiben FinalScore und Modell-Steuerklassen.",
  },
  wustg6: {
    label: "§ 6 WUStG",
    href: "werkstatt/leitlinien/wustg/#teil-3-bewertungsrahmen",
    text: "WUStG-Paragrafenseite in Ausarbeitung; die Leitlinien beschreiben Nichtkompensation und rote Linien.",
  },
  wustg7: {
    label: "§ 7 WUStG",
    href: "werkstatt/leitlinien/wustg/#teil-10-vorsteuer-lieferketten-und-anrechnungslogik",
    text: "WUStG-Paragrafenseite in Ausarbeitung; die Leitlinien beschreiben Vorsteuer- und Lieferkettenlogik als Pilotmodell.",
  },
  wustg8: {
    label: "§ 8 WUStG",
    href: "werkstatt/leitlinien/wustg/#teil-13-governance-wirkungsrat-und-evaluation",
    text: "WUStG-Paragrafenseite in Ausarbeitung; die Leitlinien beschreiben Evaluation und Wirkungsrat-Governance.",
  },
};

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

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

function fileExists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inlineMd(value) {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ö/g, "oe")
    .replace(/ä/g, "ae")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/§\s*/g, "paragraf-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function citeAnchor(id, label = "Zitierlink zu diesem Abschnitt") {
  return `<a class="cite-anchor no-print" href="#${id}" aria-label="${escapeHtml(label)}">#</a>`;
}

function citeHeading(level, id, text) {
  return `<h${level} id="${id}">${inlineMd(text)} ${citeAnchor(id)}</h${level}>`;
}

function citationNotice(route) {
  return `<aside class="citation-note" role="note">
      <p class="card-kicker">Zitierfähig</p>
      <h2>Online lesen, gezielt zitieren</h2>
      <p>Diese Webfassung ist der Hauptzugang. Zitierfähige Abschnitte haben stabile Ankerlinks; Downloads bleiben ergänzende Archiv- und Exportfassungen.</p>
      <p><a class="text-link" href="${route}">Kanonische Seitenadresse öffnen</a></p>
    </aside>`;
}

function mdToHtml(markdown, options = {}) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  const toc = [];
  const usedIds = new Set();
  let paragraph = [];
  let list = [];
  let table = [];
  let paragraphCount = 0;

  const uniqueId = (raw) => {
    const base = raw || "abschnitt";
    let id = base;
    let counter = 2;
    while (usedIds.has(id)) {
      id = `${base}-${counter}`;
      counter += 1;
    }
    usedIds.add(id);
    return id;
  };

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join(" ");
    if (options.paragraphAnchors) {
      paragraphCount += 1;
      const id = uniqueId(`${options.paragraphPrefix || "absatz"}-${String(paragraphCount).padStart(3, "0")}`);
      html.push(`<p id="${id}">${inlineMd(text)} ${citeAnchor(id, "Zitierlink zu diesem Absatz")}</p>`);
    } else {
      html.push(`<p>${inlineMd(text)}</p>`);
    }
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${inlineMd(item)}</li>`).join("")}</ul>`);
    list = [];
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.map((line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
    const dividerIndex = rows.findIndex((row) => row.every((cell) => /^:?-{3,}:?$/.test(cell)));
    const header = dividerIndex > 0 ? rows[0] : null;
    const bodyRows = dividerIndex > 0 ? rows.slice(dividerIndex + 1) : rows;
    html.push(`<div class="table-wrap"><table class="data-table">`);
    if (header) {
      html.push(`<thead><tr>${header.map((cell) => `<th>${inlineMd(cell)}</th>`).join("")}</tr></thead>`);
    }
    html.push(`<tbody>${bodyRows.map((row) => `<tr>${row.map((cell) => `<td>${inlineMd(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    table = [];
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
    flushTable();
  };

  for (const line of lines) {
    if (/^\|/.test(line.trim())) {
      flushParagraph();
      flushList();
      table.push(line);
      continue;
    }
    flushTable();

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = uniqueId(options.anchorPrefix ? `${options.anchorPrefix}-${slugify(text)}` : slugify(text));
      toc.push({ level, text, id });
      html.push(options.citeAnchors ? citeHeading(level, id, text) : `<h${level} id="${id}">${inlineMd(text)}</h${level}>`);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^\s*[-*]\s+/, ""));
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^\s*\d+\.\s+/, ""));
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushParagraph();
      flushList();
      html.push(`<blockquote>${inlineMd(line.replace(/^>\s?/, ""))}</blockquote>`);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    paragraph.push(line.trim());
  }
  flushAll();
  return { html: html.join("\n"), toc };
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
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="search_title" content="${escapeHtml(title.replace(/\s+\|.*$/, ""))}">
    <meta name="search_description" content="${escapeHtml(description)}">
    <meta name="search_section" content="${escapeHtml(searchSection)}">
    <meta name="search_type" content="${escapeHtml(searchType)}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${escapeHtml(title.replace(/\s+\|.*$/, ""))}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${SITE}/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title.replace(/\s+\|.*$/, ""))}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${SITE}/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${CSS_VERSION}">
  </head>
  <body>
    <header class="site-header">
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
    </header>
    <main>
      <p class="print-meta">Wirkungsökonomie · ${escapeHtml(title.replace(/\s+\|.*$/, ""))} · ${canonical} · Druckdatum: 24.05.2026</p>
${body(base, route)}
    </main>
    <script src="${base}assets/js/main.js?v=${JS_VERSION}"></script>
  </body>
</html>
`;
  fs.writeFileSync(out, html, "utf8");
  return rel;
}

function printActions(extra = "") {
  return `<div class="hero-actions no-print">
      <button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>
      ${extra}
    </div>`;
}

function tocBlock(base, toc, label = "Inhaltsverzeichnis") {
  const filtered = toc.filter((item) => item.level <= 3);
  if (!filtered.length) return "";
  return `<nav class="toc-card" aria-label="${label}">
      <h2>${label}</h2>
      <ol>${filtered.map((item) => `<li class="toc-level-${item.level}"><a href="#${item.id}">${escapeHtml(item.text)}</a></li>`).join("")}</ol>
    </nav>`;
}

function cardGrid(base, items, cols = "three") {
  return `<div class="card-grid ${cols}">
${items.map((item) => `<article class="card">
        ${item.kicker ? `<p class="card-kicker">${escapeHtml(item.kicker)}</p>` : ""}
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <p class="card-text">${escapeHtml(item.text)}</p>
        ${item.href ? `<div class="portal-card-actions"><a class="text-link" href="${href(base, item.href)}">${escapeHtml(item.label || "Online lesen")}</a></div>` : ""}
      </article>`).join("\n")}
    </div>`;
}

function sectionTitle(id, text) {
  return `<h2 id="${id}">${escapeHtml(text)} ${citeAnchor(id)}</h2>`;
}

function statusMeta(items = []) {
  return "";
}

function dataTable(headers, rows) {
  return `<div class="table-wrap"><table class="data-table">
    <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${inlineMd(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table></div>`;
}

function externalSourcesBlock(base) {
  return `<section class="section" aria-labelledby="external-sources">
      <div class="card">
        <p class="hero-kicker">Externe Quellen</p>
        ${sectionTitle("external-sources", "Offizielle und methodische Referenzen")}
        <p class="card-text">Diese Links führen zu externen Quellen. Die wirkungsökonomische Einordnung steht auf dieser Website online lesbar.</p>
        <div class="model-strip">${externalSources.map(([label, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} <span class="sr-only">(externe Quelle)</span></a>`).join("")}</div>
      </div>
    </section>`;
}

function toolCards(base, tools = contextualTools) {
  return `<section class="section" aria-labelledby="context-tools">
      <div class="section-header">
        <p class="hero-kicker">Kontext-Werkzeuge</p>
        ${sectionTitle("context-tools", "Werkzeuge in diesem Bereich")}
        <p>Diese Methoden und Instrumente werden im Produktportal angewendet. Die kanonische Erklärung liegt jeweils im Methodenregister unter /werkzeuge/.</p>
      </div>
      <div class="card-grid three context-tool-grid">
        ${tools.map((tool) => `<article class="card context-tool-card">
          <p class="card-kicker">${escapeHtml(tool.type)} · ${escapeHtml(tool.status)}</p>
          <h3 class="card-title">${escapeHtml(tool.title)}</h3>
          <p class="card-text">${escapeHtml(tool.short)}</p>
          <p class="card-text"><strong>Warum hier relevant?</strong> ${escapeHtml(tool.why)}</p>
          <div class="portal-card-actions">
            ${tool.href ? `<a class="text-link" href="${href(base, tool.href)}">Erklärung öffnen</a>` : `<span class="prototype-badge">Demo in Vorbereitung</span>`}
            ${tool.demoHref ? `<a class="text-link" href="${href(base, tool.demoHref)}">Demo öffnen</a>` : ""}
            ${tool.lawHref ? `<a class="text-link" href="${href(base, tool.lawHref)}">Gesetz/Leitlinie</a>` : ""}
            ${tool.bookHref ? `<a class="text-link" href="${href(base, tool.bookHref)}">Buchanker</a>` : ""}
          </div>
        </article>`).join("")}
      </div>
    </section>`;
}

function sdgBlock(base, explanation) {
  const renderBadge = ([label, target, text], index) => {
    const id = `product-sdg-${index}-${slugify(label)}`;
    return `<span class="sdg-ref" data-sdg-id="${slugify(label)}">
      <a class="sdg-ref-link" href="${href(base, target)}" aria-label="${escapeHtml(`${label}: ${text}`)}" aria-describedby="${id}">${escapeHtml(label)}</a>
      <button class="sdg-ref-info" type="button" aria-label="${escapeHtml(`Kurzbeschreibung zu ${label}: ${text}`)}" aria-describedby="${id}">i</button>
      <span class="sdg-ref-popover" id="${id}" role="tooltip">${escapeHtml(text)} <span class="sdg-ref-more">Details öffnen</span></span>
    </span>`;
  };
  return `<section class="section" aria-labelledby="sdg-title">
      <div class="portal-reference-block">
        <p class="hero-kicker">Referenzrahmen</p>
        ${sectionTitle("sdg-title", "SDG-/SDG+-Bezug")}
        <h3>Relevante SDGs</h3>
        <div class="model-strip">${productSdgRefs.map((item, index) => renderBadge(item, index + 1)).join("")}</div>
        <h3>Relevante SDG+-Dimensionen</h3>
        <div class="model-strip">${productSdgPlusRefs.map((item, index) => renderBadge(item, index + 100)).join("")}</div>
        <p>${escapeHtml(explanation)}</p>
        <p>SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie für Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, institutionelles Vertrauen, gesellschaftlichen Zusammenhalt und digitale Selbstbestimmung.</p>
      </div>
    </section>`;
}

function politicalBlock(base, context = "dieser Bereich") {
  return `<section class="section" aria-labelledby="political-implementation">
      <div class="card">
        <p class="hero-kicker">Umsetzung</p>
        ${sectionTitle("political-implementation", "Politische Anschlussfähigkeit und Umsetzungsoptionen")}
        <p>Die folgenden politischen Anforderungen beschreiben keinen fertigen Parteibeschluss. Sie markieren den notwendigen Rahmen, damit dieses Wirkungsfeld demokratisch, rechtsstaatlich und praktisch umgesetzt werden kann. Unterschiedliche Parteien können innerhalb dieses Rahmens verschiedene Wege wählen. Entscheidend ist, dass die Wirkung sichtbar, überprüfbar und korrigierbar bleibt.</p>
        ${dataTable(["Ebene", "Aufgabe für Politik und Umsetzung"], [
          ["Aufgabe der Politik", `${context} braucht demokratisch legitimierte Regeln, Datenzugänge, Zuständigkeiten und Korrekturverfahren.`],
          ["Rahmenbedingungen", "Gesetze, technische Leitlinien, Wirkungsrat, Datenschutz, Rechtsschutz, föderale Zuständigkeiten und offene Standards müssen zusammenspielen."],
          ["Ausgestaltungsspielraum", "Tempo, Pilotbereiche, Satzhöhen, Bonus- oder Bonus-Malus-Modelle, Rückverteilung und Branchenprioritäten bleiben politisch entscheidbar."],
          ["Zielkonflikte", "Kaufkraft, Wettbewerbsfähigkeit, Datensparsamkeit, soziale Gerechtigkeit, Innovationsdruck und europäische Anschlussfähigkeit müssen transparent abgewogen werden."],
          ["Rollenverteilung", "EU, Bund, Länder, Kommunen, Verwaltung, Wirtschaft, Wissenschaft und Zivilgesellschaft übernehmen unterschiedliche Aufgaben in Gesetzgebung, Prüfung, Pilotierung und Beteiligung."],
          ["Übergang und Schutz", "Soziale Abfederung, KMU-Schutz, Rechtsschutz, Datenschutz, Kaufkraftschutz, Beteiligung und klare Einspruchswege sind Teil der Einführung."],
          ["Evaluation und Korrektur", "Wirkungsberichte, öffentliche Konsultationen, Revisionszyklen und unabhängige Evaluation sichern, dass die Umsetzung lernfähig bleibt."],
          ["Parteipolitische Anschlussfähigkeit", "Konservative, liberale, sozialdemokratische, grüne, linke, kommunale und wirtschaftsnahe Lesarten können unterschiedliche Instrumentenpfade wählen, ohne die Wirkungslogik aufzugeben."],
        ])}
        <p>Wirkungsdaten bereiten Entscheidungen vor, ersetzen sie aber nicht. Bewertet werden Maßnahmen, Strukturen, Produkte und Wirkungsräume, nicht Menschen.</p>
        <p><a class="text-link" href="${href(base, "wirkungsfelder/staat-recht-demokratie/")}">Staat, Recht &amp; Demokratie als Umsetzungsportal öffnen</a></p>
      </div>
    </section>`;
}

function bookBlock(base, anchors = bookAnchors) {
  return `<section class="section" aria-labelledby="book-anchors">
      <div class="section-header">
        <p class="hero-kicker">Online-Buch</p>
        ${sectionTitle("book-anchors", "Anker im Online-Buch")}
        <p>Diese Kapitel bilden die inhaltliche Wirbelsäule für Produktwirkung, Scorecards, Wirkungssteuer und Markttransformation.</p>
      </div>
      <div class="model-strip">${anchors.map(([label, link]) => `<a href="${href(base, link)}">${escapeHtml(label)}</a>`).join("")}</div>
    </section>`;
}

function downloadBlock(base, items = []) {
  const available = items.filter((item) => !item.required || fileExists(item.href));
  const missing = items.filter((item) => item.required && !fileExists(item.href));
  return `<section class="section" aria-labelledby="downloads">
      <div class="card">
        <p class="hero-kicker">Arbeitsmaterial</p>
        ${sectionTitle("downloads", "Materialien und Downloads")}
        <p class="card-text">Vertiefungen, Dateien und Druckfunktion stehen gesammelt am Ende der Seite.</p>
        <div class="portal-card-actions no-print">
          <button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>
          ${available.length ? available.map((item) => `<a class="btn btn-secondary" href="${href(base, item.href)}">${escapeHtml(item.label)}</a>`).join("") : `<span class="prototype-badge">Dossier in Vorbereitung</span>`}
        </div>
        ${missing.length ? `<p class="card-text">Noch nicht im Repository gefunden: ${missing.map((item) => escapeHtml(item.label)).join(", ")}. Der Downloadlink wird erst gesetzt, sobald die Datei vorhanden ist.</p>` : ""}
      </div>
    </section>`;
}

function lawRef(base, key) {
  const ref = lawRefs[key];
  const id = `lawref-${slugify(ref.label)}-${key}`;
  return `<span class="law-reference">
    <a class="law-reference-link" href="${href(base, ref.href)}" aria-describedby="${id}">${escapeHtml(ref.label)}</a>
    <button class="law-reference-info" type="button" aria-label="Kurzbeschreibung zu ${escapeHtml(ref.label)} anzeigen" aria-describedby="${id}">i</button>
    <span class="reference-popover" id="${id}" role="tooltip">${escapeHtml(ref.text)}</span>
  </span>`;
}

function toolRef(base, label, hrefTarget, description) {
  const id = `toolref-${slugify(label)}`;
  return `<span class="tool-reference">
    <a class="tool-reference-link" href="${href(base, hrefTarget)}" aria-describedby="${id}">${escapeHtml(label)}</a>
    <button class="tool-reference-info" type="button" aria-label="Kurzbeschreibung zu ${escapeHtml(label)} anzeigen" aria-describedby="${id}">i</button>
    <span class="reference-popover" id="${id}" role="tooltip">${escapeHtml(description)}</span>
  </span>`;
}

function introHero({ base, kicker, h1, subtitle, text, actions = "" }) {
  return `<section class="hero portal-hero">
      <div class="hero-content">
        <nav class="breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}wirkungsfelder/">Wirkungsfelder</a> / Produkte &amp; Konsum</nav>
        <p class="hero-kicker">${escapeHtml(kicker)}</p>
        <h1>${escapeHtml(h1)}</h1>
        <p class="hero-subtitle">${escapeHtml(subtitle)}</p>
        <p>${escapeHtml(text)}</p>
        ${printActions(actions)}
      </div>
    </section>`;
}

function productStatus(status = "Konzept / Lesefassung") {
  return statusMeta([
    ["Autorin", "Natalie Weber"],
    ["Referenz", "Wirkungsökonomie"],
    ["Stand", "24.05.2026"],
    ["Version", "v0.1 / Webfassung"],
    ["Status", status],
  ]);
}

function sourceNotice(label) {
  return `<div class="scanner-notice" role="note">
      <strong>Lesefassung.</strong> Diese Seite macht das zugrunde liegende Konzept online lesbar. Fachliche Inhalte werden als Modellannahmen eingeordnet; rechtliche Grenzen bleiben transparent.
  </div>`;
}

function fulltextPage(config) {
  const md = read(config.source).replace(/^# .+\n+/, "");
  const rendered = mdToHtml(md, { citeAnchors: true, paragraphAnchors: true });
  page({
    rel: config.rel,
    title: config.title,
    description: config.description,
    searchSection: "Wirkungsfelder",
    searchType: "Volltext",
    body: (base, route) => `${introHero({
      base,
      kicker: config.kicker,
      h1: config.h1,
      subtitle: config.subtitle,
      text: config.hero,
      actions: config.primaryAction ? `<a class="btn btn-primary" href="${href(base, config.primaryAction.href)}">${escapeHtml(config.primaryAction.label)}</a>` : "",
    })}
    <section class="section narrow">${citationNotice(`${SITE}${routeFor(config.rel)}`)}</section>
    <section class="section narrow">${productStatus(config.status || "Lesefassung")}</section>
    <section class="section narrow">${sourceNotice(config.source)}${tocBlock(base, rendered.toc)}</section>
    <section class="section article-section" aria-labelledby="online-volltext">
      <article class="article-body fulltext-reader">
        ${sectionTitle("online-volltext", "Konzept lesen")}
        ${config.contextIntro ? `<p>${config.contextIntro(base)}</p>` : ""}
        ${rendered.html}
      </article>
    </section>
    ${toolCards(base, config.tools || contextualTools)}
    ${relatedBlocks(base)}
    ${politicalBlock(base, "Produktbesteuerung und Produktwirkung")}
    ${sdgBlock(base, config.sdgText)}
    ${bookBlock(base)}
    ${externalSourcesBlock(base)}
    ${downloadBlock(base, config.downloads || [])}`,
  });
}

function toolsForGo8Detail(detail) {
  return detail.tools
    .map((name) => go8ToolRegistry[name])
    .filter(Boolean);
}

function go8DetailConceptPages() {
  for (const detail of go8ProductDetails) {
    fulltextPage({
      rel: detail.rel,
      source: detail.source,
      title: detail.title,
      description: detail.description,
      kicker: `Detailkonzept ${detail.no} · Produkte & Konsum`,
      h1: detail.h1,
      subtitle: detail.subtitle,
      hero: detail.hero,
      contextIntro: (base) =>
        `Diese Vertiefung ergänzt das Produktportal und verknüpft ${toolRef(base, "WÖk-IDs", "werkzeuge/woek-ids/", "Indikatoren mit Quelle, Einheit, Schwelle und Version.")}, ${toolRef(base, "Produktscorecards", "werkzeuge/produktscorecards/", "Bewertungsraster für Produktwirkung.")}, ${toolRef(base, "Reverse Merit Order", "werkzeuge/reverse-merit-order/", "Schwere negative Wirkung wird nicht schöngerechnet.")} und digitale Produktdaten mit der Wirkungsumsatzsteuer.`,
      tools: toolsForGo8Detail(detail),
      sdgText:
        "Diese Vertiefung ordnet Produktwirkung an SDGs, Agenda 2030 und SDG+ ein. Wirkung ist neutral und relational; Zielgröße ist positive Netto-Wirkung für Mensch, Planet und Demokratie.",
      downloads: [
        { label: "DOCX herunterladen", href: detail.docx, required: true },
        { label: "PDF öffnen", href: detail.pdf, required: true },
        { label: "Produktportal öffnen", href: "wirkungsfelder/produkte-konsum/" },
      ],
    });
  }
}

function go9DetailConceptPages() {
  for (const detail of go9ProductDetails) {
    fulltextPage({
      rel: detail.rel,
      source: detail.source,
      title: detail.title,
      description: detail.description,
      kicker: `Detailkonzept ${detail.no} · Produkte & Konsum`,
      h1: detail.h1,
      subtitle: detail.subtitle,
      hero: detail.hero,
      contextIntro: (base) =>
        `Diese Vertiefung ergänzt das Produktportal und verknüpft ${toolRef(base, "Wirkungsumsatzsteuer", "werkzeuge/wirkungsumsatzsteuer/", "Produktwirkung als Preis- und Steuerfeedback.")}, ${toolRef(base, "WÖk-IDs", "werkzeuge/woek-ids/", "Indikatoren mit Quelle, Einheit, Schwelle und Version.")}, ${toolRef(base, "Scorecards", "werkzeuge/scorecards/", "Bewertungsraster für Produkt-, Lieferketten- und Organisationswirkung.")} und ${toolRef(base, "Reverse Merit Order", "werkzeuge/reverse-merit-order/", "Schwere negative Wirkung wird nicht schöngerechnet.")}.`,
      tools: toolsForGo8Detail(detail),
      sdgText:
        "Diese Vertiefung ordnet Produktwirkung, Lieferkettenwirkung und Produktdaten an SDGs, Agenda 2030 und SDG+ ein. Wirkung ist neutral und relational; Zielgröße ist positive Netto-Wirkung für Mensch, Planet und Demokratie.",
      downloads: [
        { label: "DOCX herunterladen", href: detail.docx, required: true },
        { label: "PDF öffnen", href: detail.pdf, required: true },
        { label: "Produktportal öffnen", href: "wirkungsfelder/produkte-konsum/" },
      ],
    });
  }
}

function relatedBlocks(base) {
  return `<section class="section" aria-labelledby="related">
      <div class="section-header">
        <p class="hero-kicker">Kontext</p>
        ${sectionTitle("related", "Verwandte Seiten")}
      </div>
      ${cardGrid(base, [
        { title: "Produkte & Konsum", text: "Portalübersicht für Produktwirkung, Preise, Lieferketten und Konsumentscheidungen.", href: "wirkungsfelder/produkte-konsum/" },
        { title: "Wirkungsumsatzsteuer", text: "Kanonische Erklärung der produktbezogenen Steuerlogik.", href: "werkzeuge/wirkungsumsatzsteuer/" },
        { title: "Technische Leitlinien WUStG", text: "Methodik für Scorecards, WÖk-IDs, FinalScore und Pilotierung.", href: "werkstatt/leitlinien/wustg/" },
      ])}
    </section>`;
}

function productPortal() {
  page({
    rel: "wirkungsfelder/produkte-konsum/index.html",
    title: "Produkte & Konsum | Wirkungsökonomie",
    description:
      "Wie die Wirkungsökonomie Produktwirkung sichtbar macht und Preise, Steuern, Lieferketten und Konsumentscheidungen an positiver Netto-Wirkung ausrichtet.",
    searchSection: "Wirkungsfelder",
    body: (base, route) => `${introHero({
      base,
      kicker: "Wirkungsfeld",
      h1: "Produkte & Konsum",
      subtitle: "Wie die Wirkungsökonomie Preise, Märkte und Kaufentscheidungen neu ordnet.",
      text:
        "Der heutige Preis eines Produkts zeigt, was es kostet, aber nicht, was es bewirkt. Die Wirkungsökonomie macht Produktwirkung sichtbar und koppelt sie an Preise, Steuern, Lieferketten und Konsumentscheidungen zurück.",
      actions: `<a class="btn btn-primary" href="#konzepte">Konzepte ansehen</a><a class="btn btn-secondary" href="#material">Arbeitsmaterial</a>`,
    })}
    <section class="section" aria-labelledby="price-lie">
      <div class="section-header">
        <p class="hero-kicker">Warum wichtig?</p>
        ${sectionTitle("price-lie", "Warum Produkte & Konsum ein Wirkungsfeld sind")}
        <p>Produkte bündeln Rohstoffe, Arbeit, Energie, Transport, Nutzung, Entsorgung, Werbung und Daten. Konsumentscheidungen wirken deshalb nicht nur privat, sondern auf Lieferketten, Gesundheit, Klima, Arbeitsrechte und Vertrauen.</p>
      </div>
      ${cardGrid(base, [
        { title: "Preise zeigen nicht alles", text: "Der Verkaufspreis bildet Kosten, Margen und Steuern ab, aber kaum Wasserstress, Gesundheitsfolgen, Biodiversität, Arbeitsbedingungen oder Datenqualität." },
        { title: "Produkte tragen Wirkung", text: "Jedes Produkt wirkt über Material, Herstellung, Lieferkette, Nutzung, Reparierbarkeit, Entsorgung und Verbraucherinformation." },
        { title: "Konsum steuert Märkte", text: "Wenn Wirkung sichtbar wird, können Wettbewerb, Beschaffung, Steuern und Kaufentscheidungen bessere Produkte belohnen." },
      ])}
      <figure class="system-visual" role="img" aria-label="Der falsche Preis zeigt Kosten, Marge und Steuer, aber nicht Klima, Wasser, Gesundheit, Arbeitsrechte, Vertrauen und Demokratie.">
        <div class="system-visual-grid">
          <div class="visual-price-card" data-tone="positive">
            <strong>Preis sichtbar</strong>
            <div class="visual-chip-list"><span>Kosten</span><span>Marge</span><span>Steuer</span></div>
          </div>
          <div class="visual-price-card" data-tone="warning">
            <strong>Wirkung oft unsichtbar</strong>
            <div class="visual-chip-list"><span>Klima</span><span>Wasser</span><span>Gesundheit</span><span>Arbeitsrechte</span><span>Vertrauen</span><span>Demokratie</span></div>
          </div>
        </div>
        <figcaption>Die Wirkungsökonomie macht die fehlenden Preisbestandteile nicht moralisch, sondern prüfbar und rückkoppelbar.</figcaption>
      </figure>
      <figure class="system-visual" role="img" aria-label="Produktwirkung entlang der Kette von Rohstoff über Herstellung, Transport, Nutzung, Reparatur und Entsorgung mit Datenqualität und Scorecard.">
        <div class="system-visual-flow six">
          <div class="visual-node"><strong>Rohstoff</strong><span>Herkunft, Wasser, Biodiversität, Rechte.</span></div>
          <div class="visual-node"><strong>Herstellung</strong><span>Energie, Chemie, Arbeit, Sicherheit.</span></div>
          <div class="visual-node"><strong>Transport</strong><span>Distanz, Kühlung, Logistik, Emissionen.</span></div>
          <div class="visual-node"><strong>Nutzung</strong><span>Gesundheit, Energie, Lebensdauer.</span></div>
          <div class="visual-node"><strong>Reparatur</strong><span>Ersatzteile, Modularität, Kreislauf.</span></div>
          <div class="visual-node" data-tone="positive"><strong>Entsorgung</strong><span>Recycling, Schadstoffe, Datenqualität, Scorecard.</span></div>
        </div>
        <figcaption>Produktwirkung entsteht entlang der Kette. Eine Scorecard muss Datenqualität und schwache Felder sichtbar halten.</figcaption>
      </figure>
    </section>
    <section class="section" aria-labelledby="old-vs-woek">
      <div class="section-header">
        <p class="hero-kicker">Systemblick</p>
        ${sectionTitle("old-vs-woek", "Alte Logik vs. WÖk-Logik")}
      </div>
      <figure class="system-visual" role="img" aria-label="Alte Produktlogik verglichen mit WÖk-Logik. Alte Logik misst Gewinn, Wachstum und Output. WÖk-Logik bewertet positive Netto-Wirkung, Schutzgrenzen und Rückkopplung.">
        <div class="system-visual-compare">
          <div class="visual-lane" data-tone="warning"><strong>Alte Logik</strong><div class="visual-chip-list"><span>Gewinn</span><span>Wachstum</span><span>Output</span><span>billiger Preis</span></div></div>
          <div class="visual-lane" data-tone="positive"><strong>WÖk-Logik</strong><div class="visual-chip-list"><span>positive Netto-Wirkung</span><span>Schutzgrenzen</span><span>Datenqualität</span><span>Rückkopplung</span></div></div>
        </div>
        <figcaption>Der Unterschied liegt nicht in mehr Kontrolle, sondern im besseren Maßstab für Preise, Beschaffung und Kapital.</figcaption>
      </figure>
      <div class="comparison-grid">
        <article class="card">
          <p class="card-kicker">Heutige Logik</p>
          <h3 class="card-title">Was oft unsichtbar bleibt</h3>
          <ul class="clean-list">
            <li>Preis zeigt meist Kosten, Marge und Steuer.</li>
            <li>Lieferkettenwirkung bleibt verteilt und schwer prüfbar.</li>
            <li>Schäden können billig bleiben, wenn sie externalisiert werden.</li>
            <li>Verbraucherinformation ist oft zu grob oder werblich.</li>
          </ul>
        </article>
        <article class="card">
          <p class="card-kicker">WÖk-Logik</p>
          <h3 class="card-title">Was anders bewertet wird</h3>
          <ul class="clean-list">
            <li>Produktwirkung wird entlang des Lebenszyklus sichtbar.</li>
            <li>Datenqualität, Scorecards und WÖk-IDs machen Annahmen prüfbar.</li>
            <li>Negative Wirkung begrenzt Entlastung statt schöngerechnet zu werden.</li>
            <li>Preise, Steuern und Beschaffung werden an Wirkung rückgekoppelt.</li>
          </ul>
        </article>
      </div>
    </section>
    <section class="section" id="konzepte" aria-labelledby="concepts">
      <div class="section-header">
        <p class="hero-kicker">Zentrale Konzepte</p>
        ${sectionTitle("concepts", "Was Produkte & Konsum neu sichtbar machen")}
        <p>Die Konzepte sind Einstiegskarten. Vertiefungen und Arbeitsmaterial stehen unten.</p>
      </div>
      ${cardGrid(base, [
        { title: "Produkte als Wirkungsträger", text: "Produkte wirken über Rohstoffe, Herstellung, Transport, Nutzung, Reparatur, Entsorgung und Information. Warum relevant? Wirkung wird vom Einzelkauf bis zur Lieferkette sichtbar.", href: "wirkungsfelder/produkte-konsum/produkte-als-wirkungstraeger/", label: "Konzept lesen" },
        { title: "Wirkungsumsatzsteuer", text: "Steuerlogik wird als Rückkopplung auf geprüfte Produktwirkung verstanden. Warum relevant? Schädliche Wirkung soll sich nicht länger rechnen.", href: "wirkungsfelder/produkte-konsum/wirkungsumsatzsteuer-produktwirkungssteuer/", label: "Konzept lesen" },
        { title: "Produktscorecards", text: "Scorecards bündeln Indikatoren, Datenqualität und Engpasslogik. Warum relevant? Sie machen Bewertungen nachvollziehbar und prüfbar.", href: "wirkungsfelder/produkte-konsum/produktscorecards-reverse-merit-order-digitale-produktpaesse/", label: "Konzept lesen" },
        { title: "Reverse Merit Order", text: "Schwere negative Wirkung kann positive Teilwerte begrenzen. Warum relevant? Schäden werden nicht durch gute Einzelwerte überdeckt.", href: "werkzeuge/reverse-merit-order/", label: "Methodik lesen" },
        { title: "Digitale Produktpässe", text: "Produktdaten werden als Nachweis- und Lerninfrastruktur verstanden. Warum relevant? Ohne Datenqualität bleibt Wirkung Behauptung.", href: "werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/", label: "Methodik lesen" },
        { title: "Verbraucherinformation", text: "Wirkungspunkte, Steuerklassen und Hinweise sollen verständlich werden, ohne Menschen zu bewerten. Warum relevant? Kaufentscheidungen brauchen klare Information.", href: "wirkungsfelder/produkte-konsum/verbraucherinformation/", label: "Vertiefung lesen" },
      ], "three")}
    </section>
    ${toolCards(base)}
    <section class="section" aria-labelledby="try">
      <div class="section-header">
        <p class="hero-kicker">Erleben</p>
        ${sectionTitle("try", "Erleben")}
        <p>Vorhandene Demos werden kontextbezogen verlinkt. Sie sind modellhafte Demonstrationen, keine amtliche Einstufung.</p>
      </div>
      ${cardGrid(base, [
        { title: "Produktwirkungsrechner", text: "Bio-Apfel, Chile-Apfel, T-Shirt oder Polyamid auswählen, Scores prüfen und Steuerklasse simulieren.", href: "erleben/produktwirkungsrechner/", label: "Rechner öffnen" },
        { title: "Produktwirkung prüfen", text: "Interaktive Annäherung an Produktwirkung, Scorecard und Wirkungssteuerlogik.", href: "erleben.html#simulator", label: "Tool testen" },
        { title: "Scorecard-Demo", text: "Bewertungslogik mit Scores, Datenfeldern und visueller Auswertung.", href: "scorecard-dashboard.html", label: "Beispiel ansehen" },
        { title: "Wirkungsscanner", text: "Scanner für erste Wirkungsfragen im Alltag und in Organisationen.", href: "anwendungen/scanner.html", label: "Scanner öffnen" },
      ])}
    </section>
    <section class="section" aria-labelledby="actors">
      <div class="section-header">
        <p class="hero-kicker">Akteursperspektiven</p>
        ${sectionTitle("actors", "Für wen ist das relevant?")}
      </div>
      ${cardGrid(base, [
        { title: "Für Konsument:innen", text: "Produktwirkung wird sichtbar, ohne Menschen selbst zu bewerten oder Kaufverhalten zu überwachen." },
        { title: "Für Hersteller", text: "Produktentwicklung, Materialwahl und Lieferketten werden auf positive Netto-Wirkung rückgekoppelt." },
        { title: "Für Handel", text: "Regaltransparenz, Steuerklasse und Produktdaten können Kaufentscheidungen verständlicher machen." },
        { title: "Für Lieferanten", text: "Datenqualität, faire Übergänge und Verbesserungswege ersetzen pauschale Ausschlüsse." },
        { title: "Für Prüfer:innen", text: "Assurance, WÖk-IDs und DPPs schaffen prüfbare Bewertungswege." },
        { title: "Für Politik und Verwaltung", text: "Pilotierung, Rechtsschutz, Datenschutz und Wirkungsrat sichern die Einführung ab." },
      ])}
    </section>
    <aside class="section related-questions-block" aria-labelledby="product-related-title">
      <div class="section-header">
        <p class="hero-kicker">Passende Fragen</p>
        ${sectionTitle("product-related-title", "Einwände zu Preisen und Produktdaten")}
      </div>
      <div class="related-question-grid">
        <article class="related-question-card"><span>Preisfrage</span><strong>Wird dann alles teurer?</strong><a class="text-link" href="${href(base, "fragen/#teurer")}">Antwort lesen</a></article>
        <article class="related-question-card"><span>Governance</span><strong>Wer entscheidet die Steuerklasse?</strong><a class="text-link" href="${href(base, "fragen/#steuerklasse")}">Antwort lesen</a></article>
        <article class="related-question-card"><span>Daten</span><strong>Was passiert bei fehlenden Daten?</strong><a class="text-link" href="${href(base, "fragen/#fehlende-daten")}">Antwort lesen</a></article>
      </div>
    </aside>
    ${politicalBlock(base, "Dieses Wirkungsfeld")}
    ${sdgBlock(base, "Produktbesteuerung berührt Ernährung, Gesundheit, Wasser, Arbeit, Industrie, Ungleichheit, Konsum, Klima, Biodiversität, Institutionen und internationale Kooperation. SDG+ ergänzt dort, wo Produktdaten, Werbung, Plattformen, Transparenz und Vertrauen demokratische Wirkung entfalten.")}
    ${bookBlock(base)}
    ${externalSourcesBlock(base)}
    <section class="section" id="material" aria-labelledby="material-title">
      <div class="section-header">
        <p class="hero-kicker">Vertiefung und Arbeitsmaterial</p>
        ${sectionTitle("material-title", "Vertiefung, Beispiele und Materialien")}
        <p>Die Materialien stehen am Ende, damit die Seite zuerst Orientierung gibt und dann in die fachliche Vertiefung führt.</p>
      </div>
      ${cardGrid(base, [
        { title: "Produktbesteuerung durch Wirkung", text: "Langfassung mit NACE, WÖk-IDs, Scorecards, Reverse Merit Order und Vorsteuerlogik.", href: "wirkungsfelder/produkte-konsum/produktbesteuerung-durch-wirkung/", label: "Onlinefassung lesen" },
        { title: "Apfelbeispiel", text: "Didaktisches Beispiel für Produktwirkung, Datenqualität, Scorecard und steuerliche Rückkopplung.", href: "wirkungsfelder/produkte-konsum/apfelbeispiel/", label: "Beispiel ansehen" },
        { title: "Lieferketten", text: "Vertiefung zu Vorleistungen, Lieferanten, Produktpässen und roten Linien.", href: "wirkungsfelder/produkte-konsum/lieferketten/", label: "Vertiefung lesen" },
      ])}
    </section>
    ${downloadBlock(base, [
      { label: "Zur Bibliothek", href: "downloads.html" },
      ...conceptDownloads,
      { label: "WStG online lesen", href: "werkstatt/gesetze/wirkungssteuergesetz/" },
      { label: "WUStG-Leitlinien lesen", href: "werkstatt/leitlinien/wustg/" },
    ])}`,
  });
}

function compactContextPage({ rel, title, subtitle, description, sections, related }) {
  page({
    rel,
    title: `${title} | Produkte & Konsum`,
    description,
    searchSection: "Wirkungsfelder",
    body: (base, route) => `${introHero({
      base,
      kicker: "Produkte & Konsum",
      h1: title,
      subtitle,
      text: description,
      actions: `<a class="btn btn-primary" href="${href(base, "wirkungsfelder/produkte-konsum/")}">Zur Portalübersicht</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section">
      <div class="feature-grid">
        ${sections.map((section) => {
          const id = slugify(section.title);
          return `<article class="card" id="${id}"><p class="card-kicker">${escapeHtml(section.kicker)}</p><h2 class="card-title">${escapeHtml(section.title)} ${citeAnchor(id)}</h2><p class="card-text">${escapeHtml(section.text)}</p></article>`;
        }).join("")}
      </div>
    </section>
    ${toolCards(base, related || contextualTools)}
    ${politicalBlock(base, "Diese Produktseite")}
    ${sdgBlock(base, "Diese Seite ordnet Produktwirkung in den Referenzrahmen aus SDGs und SDG+ ein. Entscheidend ist nicht Wirkung schlechthin, sondern positive Netto-Wirkung für Mensch, Planet und Demokratie.")}
    ${bookBlock(base)}
    ${downloadBlock(base, [{ label: "Produktpapier lesen", href: "wirkungsfelder/produkte-konsum/produktbesteuerung-durch-wirkung/" }])}`,
  });
}

function toolPage({ rel, h1, subtitle, description, sections, appliedIn, tools = contextualTools }) {
  page({
    rel,
    title: `${h1} | Wirkungsökonomie`,
    description,
    searchSection: "Werkzeuge",
    searchType: "Werkzeug",
    body: (base, route) => `<section class="hero portal-hero">
      <div class="hero-content">
        <nav class="breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}werkzeuge/">Werkzeuge</a></nav>
        <p class="hero-kicker">Methodenregister</p>
        <h1>${escapeHtml(h1)}</h1>
        <p class="hero-subtitle">${escapeHtml(subtitle)}</p>
        <p>${description}</p>
        ${printActions(`<a class="btn btn-primary" href="${href(base, "wirkungsfelder/produkte-konsum/")}">Im Produktportal anwenden</a>`)}
      </div>
    </section>
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section">
      <div class="feature-grid">${sections.map((section) => {
        const id = slugify(section.title);
        return `<article class="card" id="${id}"><p class="card-kicker">${escapeHtml(section.kicker)}</p><h2 class="card-title">${escapeHtml(section.title)} ${citeAnchor(id)}</h2><p class="card-text">${section.text(base)}</p></article>`;
      }).join("")}</div>
    </section>
    <section class="section" aria-labelledby="applied">
      <div class="section-header"><p class="hero-kicker">Kontext</p>${sectionTitle("applied", "Angewendet in")}</div>
      ${cardGrid(base, appliedIn)}
    </section>
    ${politicalBlock(base, "Dieses Werkzeug")}
    ${sdgBlock(base, "Dieses Werkzeug dient der Bewertung und Rückkopplung von Produkt-, Lieferketten- und Marktwirkung. SDG+ wird als transparente WÖk-Erweiterung für Demokratie, Rechtsstaatlichkeit, Datenintegrität und institutionelles Vertrauen geführt.")}
    ${bookBlock(base)}
    ${downloadBlock(base, [{ label: "WUStG-Leitlinien lesen", href: "werkstatt/leitlinien/wustg/" }, { label: "WStG lesen", href: "werkstatt/gesetze/wirkungssteuergesetz/" }])}`,
  });
}

function lawReader() {
  const md = read(sources.wstg);
  const intro = md.split("\n### § ")[0].replace(/^# .+\n+/, "");
  const renderedIntro = mdToHtml(intro, { citeAnchors: true });
  const matches = [...md.matchAll(/^### §\s+(\d+)\s+([^\n]+)\n([\s\S]*?)(?=^### §\s+\d+\s+|\n## Teil |\n$)/gm)];
  const sections = matches.map((match) => {
    const nr = match[1];
    const title = match[2].trim();
    const body = match[3].trim();
    const parts = {};
    let current = "gesetzestext";
    parts[current] = [];
    for (const raw of body.split("\n")) {
      const line = raw.trim();
      if (/^\*\*Gesetzestext:\*\*/.test(line)) {
        current = "gesetzestext";
        parts[current] = [];
        continue;
      }
      if (/^\*\*Kommentar:\*\*/.test(line)) {
        current = "kommentar";
        parts[current] = [];
        continue;
      }
      if (/^\*\*Begruendung:\*\*|^\*\*Begründung:\*\*/.test(line)) {
        current = "begruendung";
        parts[current] = [];
        continue;
      }
      if (!parts[current]) parts[current] = [];
      parts[current].push(raw);
    }
    const lawText = (parts.gesetzestext || []).join("\n").trim();
    const summary = lawText.split(/\.\s+/)[0]?.replace(/\s+/g, " ").slice(0, 240) || `Paragraf ${nr} des WStG.`;
    return {
      nr,
      title,
      id: `paragraf-${nr}`,
      summary,
      gesetzestext: mdToHtml(lawText).html,
      kommentar: mdToHtml((parts.kommentar || []).join("\n").trim()).html,
      begruendung: mdToHtml((parts.begruendung || []).join("\n").trim()).html,
    };
  });

  page({
    rel: "werkstatt/gesetze/wirkungssteuergesetz/index.html",
    title: "Wirkungssteuergesetz WStG | Online-Gesetzestext mit Kommentaren",
    description: "Online-Fassung des Wirkungssteuergesetzes mit Gesetzestext, Kommentaren, Begründungen und Verweisen zu WUStG, WEstG, Wirkungsrat und Wirkungshaushalt.",
    searchSection: "Werkstatt",
    searchType: "Gesetz",
    body: (base, route) => `<section class="hero portal-hero">
      <div class="hero-content">
        <nav class="breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}werkstatt/">Werkstatt</a> / Gesetze</nav>
        <p class="hero-kicker">LawReader · Entwurf / Zielarchitektur</p>
        <h1>Wirkungssteuergesetz WStG</h1>
        <p class="hero-subtitle">Online-Gesetzestext mit Kurzfassungen, Kommentaren und Begründungen.</p>
        <p>Das WStG 2.0 ist kein geltendes Recht, sondern eine Rahmenfassung für steuerliche Rückkopplung nach positiver Netto-Wirkung für Mensch, Planet und Demokratie.</p>
        ${printActions(`<a class="btn btn-primary" href="${href(base, "docs/gesetze/WStG_2.0_Wirkungssteuerrahmengesetz_Entwurf.md")}">Markdown-Quelle öffnen</a>`)}
      </div>
    </section>
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${sourceNotice(sources.wstg)}
      <nav class="toc-card" aria-label="Inhaltsverzeichnis">
        <h2>Inhaltsverzeichnis</h2>
        <ol>
          <li><a href="#praeambel">Präambel und Einordnung</a></li>
          ${sections.map((section) => `<li><a href="#${section.id}">§ ${section.nr} ${escapeHtml(section.title)}</a></li>`).join("")}
        </ol>
      </nav>
    </section>
    <section class="section article-section">
      <article class="article-body law-reader">
        ${renderedIntro.html}
        ${sections.map((section) => `<section class="law-section" id="${section.id}">
          <p class="card-kicker">§ ${section.nr} WStG</p>
          <h2>§ ${section.nr} ${escapeHtml(section.title)} ${citeAnchor(section.id, `Zitierlink zu § ${section.nr} WStG`)}</h2>
          <div class="law-part law-summary"><h3>Kurzfassung</h3><p>${escapeHtml(section.summary)}.</p></div>
          <div class="law-part"><h3>Gesetzestext</h3>${section.gesetzestext || "<p>Kein eigener Gesetzestext in der Quelle ausgewiesen.</p>"}</div>
          <div class="law-part"><h3>Kommentar</h3>${section.kommentar || "<p>Kein Kommentar in der Quelle ausgewiesen.</p>"}</div>
          <div class="law-part"><h3>Begründung</h3>${section.begruendung || "<p>Keine Begründung in der Quelle ausgewiesen.</p>"}</div>
          <div class="law-part"><h3>Verweise</h3><p><a href="${href(base, "werkstatt/gesetze/wirkungssteuergesetz/#paragraf-1")}">§ 1 WStG</a> · <a href="${href(base, "werkstatt/leitlinien/wustg/")}">Technische Leitlinien WUStG</a> · <a href="${href(base, "werkzeuge/wirkungssteuergesetz/")}">Werkzeugseite Wirkungssteuergesetz</a></p></div>
        </section>`).join("")}
      </article>
    </section>
    ${toolCards(base, contextualTools.filter((tool) => ["Wirkungsumsatzsteuer", "WÖk-IDs", "Reverse Merit Order", "Wirkungsrat"].includes(tool.title)))}
    ${politicalBlock(base, "Das Wirkungssteuergesetz")}
    ${sdgBlock(base, "Das WStG rahmt steuerliche Rückkopplung für Produkte, Einkommen, Kapital, öffentliche Mittel und Governance. Es bezieht sich auf SDGs, Agenda 2030 und SDG+ als Bewertungsrahmen, nicht als Menübaum.")}
    ${bookBlock(base, bookAnchors.filter(([label]) => /Kapitel 36|Kapitel 37|Kapitel 38|Kapitel 39|Kapitel 40|Kapitel 31|Kapitel 32|Kapitel 33/.test(label)))}
    ${downloadBlock(base, [{ label: "Markdown-Quelle ansehen", href: "docs/gesetze/WStG_2.0_Wirkungssteuerrahmengesetz_Entwurf.md" }, { label: "Zur Bibliothek", href: "downloads.html" }])}`,
  });
}

function guidelinesPage() {
  const md = read(sources.wustgGuidelines).replace(/^# .+\n+/, "");
  const rendered = mdToHtml(md, { citeAnchors: true, paragraphAnchors: true });
  page({
    rel: "werkstatt/leitlinien/wustg/index.html",
    title: "Technische Leitlinien WUStG | Wirkungsumsatzsteuer",
    description: "Vollständige Online-Fassung der Technischen Leitlinien zum WUStG mit WÖk-IDs, Scorecards, FinalScore, Reverse Merit Order, Datenqualität und Pilotlogik.",
    searchSection: "Werkstatt",
    searchType: "Leitlinie",
    body: (base, route) => `<section class="hero portal-hero">
      <div class="hero-content">
        <nav class="breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}werkstatt/">Werkstatt</a> / Leitlinien</nav>
        <p class="hero-kicker">Leitlinie · Entwurf / Pilotmodell</p>
        <h1>Technische Leitlinien WUStG</h1>
        <p class="hero-subtitle">Methodikentwurf für Produktscorecards, FinalScore, NWI, digitale Produktpässe und wirkungsbezogene Umsatzsteuer-Pilotierung.</p>
        <p>Diese Online-Fassung ist der Hauptzugang zu den Leitlinien. Sie ersetzt keine Rechtsnorm und erfindet keinen separaten WUStG-Gesetzestext.</p>
        ${printActions(`<a class="btn btn-primary" href="${href(base, "dokumente/technische-leitlinien-wustg-v2/")}">Historische Webfassung öffnen</a>`)}
      </div>
    </section>
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${sourceNotice(sources.wustgGuidelines)}${tocBlock(base, rendered.toc)}</section>
    <section class="section article-section">
      <article class="article-body fulltext-reader">
        ${sectionTitle("online-volltext", "Online-Volltext")}
        <p>Die Leitlinien beziehen sich unter anderem auf ${lawRef(base, "wustg3")}, ${lawRef(base, "wustg4")}, ${lawRef(base, "wustg5")}, ${lawRef(base, "wustg6")}, ${lawRef(base, "wustg7")} und ${lawRef(base, "wustg8")}. Da kein separater vollständiger WUStG-Gesetzestext in der aktuellen Quelle vorliegt, führen diese Verweise auf die passenden Leitlinienabschnitte.</p>
        ${rendered.html}
      </article>
    </section>
    ${toolCards(base)}
    ${politicalBlock(base, "Die WUStG-Leitlinien")}
    ${sdgBlock(base, "Die WUStG-Leitlinien beschreiben die technische Bewertung von Produktwirkung entlang von Konsum, Produktion, Lieferketten, Datenqualität, Rechtsstaatlichkeit und institutioneller Kontrolle.")}
    ${bookBlock(base)}
    ${downloadBlock(base, [{ label: "Historische PDF-Webfassung", href: "dokumente/technische-leitlinien-wustg-v2/" }, { label: "Markdown-Quelle öffnen", href: "docs/gesetze/WUStG_Technische_Leitlinien_v2.1_Entwurf.md" }])}`,
  });
}

function wustgConceptPage() {
  page({
    rel: "werkstatt/gesetze/wirkungsumsatzsteuergesetz/index.html",
    title: "Wirkungsumsatzsteuergesetz WUStG | Konzept und Leitlinien",
    description:
      "Konzeptseite zum Wirkungsumsatzsteuergesetz: kein separater vollständiger Gesetzestext vorhanden; Verweise auf WStG, Produktpapier und Technische Leitlinien WUStG.",
    searchSection: "Werkstatt",
    searchType: "Gesetz",
    body: (base, route) => `<section class="hero portal-hero">
      <div class="hero-content">
        <nav class="breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}werkstatt/">Werkstatt</a> / Gesetze</nav>
        <p class="hero-kicker">Konzept / in Ausarbeitung</p>
        <h1>Wirkungsumsatzsteuergesetz WUStG</h1>
        <p class="hero-subtitle">Konzeptseite zum Produkt- und Umsatzsteuer-Modul der Wirkungsökonomie.</p>
        <p>Im aktuellen Repository liegt kein separater vollständiger WUStG-Gesetzestext vor. Deshalb werden hier keine Paragrafen erfunden. Die Seite verweist auf den WStG-Rahmen, die Technischen Leitlinien und das Produktpapier.</p>
        ${printActions(`<a class="btn btn-primary" href="${href(base, "werkstatt/leitlinien/wustg/")}">Leitlinien lesen</a>`)}
      </div>
    </section>
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section" aria-labelledby="wustg-status">
      <div class="scanner-notice" role="note">
        <strong>Status:</strong> WUStG-Paragrafen wie ${lawRef(base, "wustg5")} und ${lawRef(base, "wustg7")} werden als Referenzen auf die nächstbesten Leitlinienabschnitte geführt. Sie sind keine behauptete geltende Rechtsnorm.
      </div>
      <div class="section-header">
        <p class="hero-kicker">Einordnung</p>
        ${sectionTitle("wustg-status", "Was diese Seite leistet")}
        <p>Sie bündelt die vorhandene WUStG-Logik als Konzept- und Orientierungspunkt, bis ein vollständiger Gesetzestext vorliegt.</p>
      </div>
      ${cardGrid(base, [
        { title: "WStG als Rahmen", text: "Das Wirkungssteuerrahmengesetz definiert Begriffe, Governance, Rechtsschutz und Pilotierung.", href: "werkstatt/gesetze/wirkungssteuergesetz/" },
        { title: "Technische Leitlinien WUStG", text: "Die Leitlinien beschreiben WÖk-IDs, Scorecards, FinalScore, Reverse Merit Order, Datenqualität und Pilotlogik.", href: "werkstatt/leitlinien/wustg/" },
        { title: "Produktbesteuerung durch Wirkung", text: "Das Produktpapier erklärt den Modellbereich online lesbar im Portal Produkte & Konsum.", href: "wirkungsfelder/produkte-konsum/produktbesteuerung-durch-wirkung/" },
      ])}
    </section>
    ${toolCards(base)}
    ${politicalBlock(base, "Das WUStG-Konzept")}
    ${sdgBlock(base, "Das WUStG-Konzept betrifft Produktwirkung, Konsum, Lieferketten, Datenqualität, Rechtsstaatlichkeit und institutionelles Vertrauen. Verbindliche Anwendung setzt Gesetzgebung und Prüfung voraus.")}
    ${bookBlock(base, bookAnchors.filter(([label]) => /Kapitel 31|Kapitel 32|Kapitel 33|Kapitel 35|Kapitel 37|Kapitel 38|Kapitel 48|Kapitel 49|Kapitel 50|Kapitel 51|Kapitel 52|Kapitel 53/.test(label)))}
    ${downloadBlock(base, [{ label: "WUStG-Leitlinien lesen", href: "werkstatt/leitlinien/wustg/" }, { label: "WStG lesen", href: "werkstatt/gesetze/wirkungssteuergesetz/" }])}`,
  });
}

function tShirtPage() {
  page({
    rel: "wirkungsfelder/produkte-konsum/t-shirt/index.html",
    title: "T-Shirt / Textilbeispiel | Produkte & Konsum",
    description: "Modellseite zur Wirkungsbewertung eines T-Shirts: Baumwolle, Wasser, Färbung, Arbeit, Transport, Nutzung, Kreislauf und Produktscorecard.",
    searchSection: "Wirkungsfelder",
    searchType: "Beispiel",
    body: (base, route) => `${introHero({
      base,
      kicker: "Beispiel",
      h1: "T-Shirt / Textilbeispiel",
      subtitle: "Wie Textilien als Wirkungsträger lesbar werden.",
      text: "Ein T-Shirt wirkt nicht erst an der Kasse. Baumwolle, Wasser, Chemikalien, Arbeit, Färbung, Transport, Nutzungsdauer und Kreislauf bestimmen, welche Zustände ein Produkt verändert.",
      actions: `<a class="btn btn-primary" href="${href(base, "erleben/produktwirkungsrechner/")}">Im Rechner ausprobieren</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${productStatus("Beispiel / Modellfassung")}</section>
    <section class="section" aria-labelledby="textilmodell">
      <div class="section-header">
        <p class="hero-kicker">Modellbeispiel</p>
        ${sectionTitle("textilmodell", "Vom Produktpreis zur Produktwirkung")}
        <p>Das Textilbeispiel ist bewusst als Modellfassung gekennzeichnet. Es zeigt, welche Datenfelder eine Produktscorecard braucht; es behauptet keine amtliche Einstufung eines konkreten Herstellers.</p>
      </div>
      ${dataTable(["Kernfeld", "Typische Frage", "Mögliche Datenquelle"], [
        ["Rohstoff", "Wie hoch sind Wasserstress, Pestizid- und Flächenwirkung?", "Lieferantendaten, EPDs, Zertifizierung, Benchmarks"],
        ["Arbeit", "Sind Löhne, Arbeitsschutz, Arbeitszeiten und Vereinigungsfreiheit prüfbar?", "Auditdaten, Beschwerdemechanismen, GRI/ESRS"],
        ["Chemie & Gesundheit", "Welche Färbe-, Veredelungs- und Reststoffwirkungen entstehen?", "Materialdaten, REACH, Prüfberichte"],
        ["Klima & Energie", "Welche Emissionen entstehen entlang der Kette?", "LCA, Energiedaten, Transportdaten"],
        ["Nutzung & Kreislauf", "Wie langlebig, reparierbar, recyclingfähig und schadstoffarm ist das Produkt?", "Produktpass, Materialpass, Rücknahmedaten"],
      ])}
    </section>
    <section class="section" aria-labelledby="textil-score">
      <div class="section-header">
        <p class="hero-kicker">Scorecard</p>
        ${sectionTitle("textil-score", "Scorecard-Logik für Textilien")}
        <p>Die Produktscorecard bewertet Einzelfelder von -3 bis +3. Der FinalScore wird nicht als Durchschnitt schöngerechnet, sondern durch kritische Mindestfelder und die Reverse Merit Order begrenzt.</p>
      </div>
      ${dataTable(["Feld", "Beispielscore", "Begründung in Kurzform"], [
        ["Wasser", "-1", "Hoher regionaler Wasserstress kann die Bewertung begrenzen."],
        ["Arbeit", "0", "Daten vorhanden, aber keine gesicherte positive Wirkung."],
        ["Chemikalien", "-1", "Färbung und Veredelung benötigen zusätzliche Prüfung."],
        ["Klima", "0", "Transport und Energie bleiben relevant, aber nicht allein entscheidend."],
        ["Kreislauf", "+1", "Langlebigkeit oder Rücknahme kann positive Teilwirkung erzeugen."],
      ])}
    </section>
    ${toolCards(base, contextualTools.filter((tool) => ["Produktscorecards", "WÖk-IDs", "Reverse Merit Order", "Digitale Produktpässe und Wirkungsdatenräume", "Produktwirkungsrechner"].includes(tool.title)))}
    ${politicalBlock(base, "Das Textilbeispiel")}
    ${sdgBlock(base, "Textilien berühren Arbeit, Wasser, Gesundheit, Chemikalien, Klima, Konsum, Industrie, Ungleichheit, Datenqualität und Verbraucherinformation.")}
    ${bookBlock(base)}
    ${externalSourcesBlock(base)}
    ${downloadBlock(base, [{ label: "Dossier online lesen", href: "wirkungsfelder/produkte-konsum/dossier/" }, { label: "Produktwirkungsrechner öffnen", href: "erleben/produktwirkungsrechner/" }, ...conceptDownloads])}`,
  });
}

function dossierPage() {
  page({
    rel: "wirkungsfelder/produkte-konsum/dossier/index.html",
    title: "Dossier Produkte & Konsum | Wirkungsumsatzsteuer",
    description: "Online-Dossier zur Wirkungsumsatzsteuer mit Rechenmodell V0.1, Tarifmatrix, Apfelrechnung, T-Shirt, Lieferkettenlogik, BASF Polyamid und Datenquellen.",
    searchSection: "Wirkungsfelder",
    searchType: "Dossier",
    body: (base, route) => `${introHero({
      base,
      kicker: "Dossier",
      h1: "Dossier Produkte & Konsum",
      subtitle: "Rechenmodell V0.1, Tarifmatrix, Beispiele und Quellen zur Wirkungsumsatzsteuer.",
      text: "Dieses Dossier macht die Tabellen und Modellannahmen online lesbar. Es ist eine Fassung, keine amtliche Steuerberechnung und keine Steuerberatung.",
      actions: `<a class="btn btn-primary" href="${href(base, "erleben/produktwirkungsrechner/")}">Produktwirkungsrechner öffnen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${productStatus("Dossier / Fassung")}</section>
    <section class="section narrow">
      <nav class="toc-card" aria-label="Inhaltsverzeichnis">
        <h2>Inhaltsverzeichnis</h2>
        <ol>
          <li><a href="#rechenmodell">Rechenmodell V0.1</a></li>
          <li><a href="#tarifmatrix">Tarifmatrix</a></li>
          <li><a href="#apfelrechnung">Apfelrechnung</a></li>
          <li><a href="#t-shirt-rechnung">T-Shirt-Rechnung</a></li>
          <li><a href="#lieferketten-vorsteuer">Lieferketten-/Vorsteuerbeispiel</a></li>
          <li><a href="#basf-polyamid-scorecard">BASF Polyamid Scorecard</a></li>
          <li><a href="#ei-bonus-malus">Ei-Bonus-/Malusbeispiel</a></li>
          <li><a href="#datenquellen">Datenquellen</a></li>
          <li><a href="#tool-spezifikation">Tool-Spezifikation</a></li>
          <li><a href="#einzeldossiers">Einzeldossiers</a></li>
        </ol>
      </nav>
    </section>
    <section class="section article-section">
      <article class="article-body fulltext-reader">
        ${sectionTitle("rechenmodell", "Rechenmodell V0.1")}
        <p>Das Modell setzt einen Nettopreis, mehrere Kernfeld-Scores und einen FinalScore in Beziehung. Der FinalScore entspricht in dieser Demo dem niedrigsten Kernfeldscore, damit schwere negative Wirkung nicht durch positive Einzelwerte verdeckt wird.</p>
        ${dataTable(["Schritt", "Berechnung", "Hinweis"], [
          ["1", "Nettopreis erfassen", "Preis ohne modellhafte Wirkungsumsatzsteuer."],
          ["2", "Kernfelder von -3 bis +3 bewerten", "Mensch, Planet, Demokratie und Datenqualität als Mindestlogik."],
          ["3", "FinalScore = Minimum der Kernfelder", "Reverse-Merit-Order-Demo, kein amtliches Verfahren."],
          ["4", "Steuersatz aus Tarifmatrix ableiten", "Pilotmatrix V0.1."],
          ["5", "Bruttopreis berechnen", "Nettopreis + modellhafte Steuer."],
        ])}
        ${sectionTitle("tarifmatrix", "Tarifmatrix")}
        ${dataTable(["FinalScore", "Modell-Steuersatz"], [
          ["+3", "0 %"],
          ["+2", "5 %"],
          ["+1", "10 %"],
          ["0", "15 %"],
          ["-1", "20 %"],
          ["-2", "25 %"],
          ["-3", "25-30 %"],
        ])}
        ${sectionTitle("apfelrechnung", "Apfelrechnung")}
        ${dataTable(["Beispiel", "Nettopreis", "Kernfelder", "FinalScore", "Modell-Steuersatz", "Bruttopreis"], [
          ["Regionaler Bio-Apfel", "1,00 EUR", "+2 / +1 / +2 / +1", "+1", "10 %", "1,10 EUR"],
          ["Importierter Chile-Apfel", "1,00 EUR", "0 / -1 / 0 / +1", "-1", "20 %", "1,20 EUR"],
        ])}
        ${sectionTitle("t-shirt-rechnung", "T-Shirt-Rechnung")}
        ${dataTable(["Beispiel", "Nettopreis", "Kritisches Feld", "FinalScore", "Modell-Steuersatz", "Bruttopreis"], [
          ["Robustes Fair-Textil", "30,00 EUR", "Kreislauf +1, Arbeit +1", "+1", "10 %", "33,00 EUR"],
          ["Fast-Fashion-Modell", "12,00 EUR", "Arbeit/Wasser -2", "-2", "25 %", "15,00 EUR"],
        ])}
        ${sectionTitle("lieferketten-vorsteuer", "Lieferketten-/Vorsteuerbeispiel")}
        <p>Vorsteuer- und Bonuslogiken bleiben in dieser Fassung Pilotlogik. Positive Vorleistungen können entlastend wirken; schwere negative Wirkungen bleiben in der Kette sichtbar und können Nichtanrechnung, Prüfpflichten oder Abschläge auslösen.</p>
        ${dataTable(["Vorleistung", "Score", "Mögliche Wirkung im Modell"], [
          ["Geprüfte Recyclingfaser", "+2", "Bonusfähig oder stärker anrechenbar."],
          ["Unklare Chemikalienvorleistung", "-1", "Prüfpflicht und Abschlag."],
          ["Schwere Menschenrechtsverletzung", "-3", "Rote Linie; keine Schönrechnung."],
        ])}
        ${sectionTitle("basf-polyamid-scorecard", "BASF Polyamid Scorecard")}
        <p>Das Polyamid-Beispiel zeigt den methodischen Weg von Konzern- und ESRS-Daten zu Produktgruppen. Es behauptet keine abschließende Echtbewertung eines Unternehmens.</p>
        ${dataTable(["Schritt", "Datenbasis", "Wirkungsökonomischer Zweck"], [
          ["NACE-Zuordnung", "Branche / Aktivität", "Vergleichbarkeit herstellen."],
          ["CSRD/ESRS-Daten", "Konzern- und Standortdaten", "Berichtsdaten produktnäher machen."],
          ["EPDs / Benchmarks", "Material- und Emissionsdaten", "Produktgruppen bewertbar machen."],
          ["Scorecard", "WÖk-IDs und Schwellen", "FinalScore ableiten."],
        ])}
        ${sectionTitle("ei-bonus-malus", "Ei-Bonus-/Malusbeispiel")}
        ${dataTable(["Produkt", "Positive Wirkung", "Negative Wirkung", "Modellhinweis"], [
          ["Ei aus transparenter Freilandhaltung", "Tierwohl, regionale Daten, kurze Wege", "Flächen- und Futterwirkung bleiben relevant", "Mögliche Entlastung nur bei geprüften Daten."],
          ["Billig-Ei mit unklarer Lieferkette", "Günstiger Marktpreis", "Tierwohl, Arbeit, Datenlücken", "Datenlücken werden nicht belohnt."],
        ])}
        ${sectionTitle("datenquellen", "Datenquellen")}
        <p>Für eine belastbare Anwendung kommen offizielle und prüfbare Quellen in Betracht: SDGs, UN-Indikatoren, CSRD, ESRS, GRI, NACE, EPDs, digitale Produktpässe, Lieferantendaten und unabhängige Prüfung.</p>
        ${sectionTitle("tool-spezifikation", "Tool-Spezifikation")}
        <p>Der Produktwirkungsrechner bildet die Logik minimal ab: Produktbeispiel wählen, Nettopreis setzen, Kernfeld-Scores prüfen, FinalScore als Minimum bilden, Modell-Steuersatz ableiten, Bruttopreis und Erklärung anzeigen.</p>
        ${sectionTitle("einzeldossiers", "Einzeldossiers")}
        <p>Die Einzeldossiers vertiefen die Bausteine des Produktportals. Sie sind online lesbar und zitierfähig; Downloads bleiben ergänzende Export- und Archivfassungen.</p>
        ${cardGrid(base, productSingleDossiers.map((item) => ({
          title: item.title,
          text: item.subtitle,
          href: `wirkungsfelder/produkte-konsum/dossiers/${item.slug}/`,
          label: "Einzeldossier lesen",
        })))}
      </article>
    </section>
    ${toolCards(base)}
    ${politicalBlock(base, "Das Produkt-Dossier")}
    ${sdgBlock(base, "Das Dossier verknüpft Produktpreise, Produktdaten, Lieferketten, Verbraucherinformation und Governance mit den SDGs und SDG+ als Referenzrahmen.")}
    ${bookBlock(base)}
    ${externalSourcesBlock(base)}
    ${downloadBlock(base, conceptDownloads)}`,
  });
}

function productSingleDossierPages() {
  for (const item of productSingleDossiers) {
    const selectedTools = contextualTools.filter((tool) => item.related.includes(tool.title));
    page({
      rel: `wirkungsfelder/produkte-konsum/dossiers/${item.slug}/index.html`,
      title: `${item.title} | Produkte & Konsum`,
      description: `${item.subtitle} Online lesbares Einzeldossier mit Kontext-Werkzeugen, SDG-/SDG+-Bezug und Buchankern.`,
      searchSection: "Wirkungsfelder",
      searchType: "Dossier",
      body: (base, route) => `${introHero({
        base,
        kicker: "Einzeldossier · Produkte & Konsum",
        h1: item.title,
        subtitle: item.subtitle,
        text: item.focus,
        actions: `<a class="btn btn-primary" href="${href(base, item.canonical)}">Kanonische Seite öffnen</a>`,
      })}
      <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
      <section class="section narrow">${productStatus("Einzeldossier / Webfassung v0.2")}</section>
      <section class="section narrow">
        <nav class="toc-card" aria-label="Inhaltsverzeichnis">
          <h2>Inhaltsverzeichnis</h2>
          <ol>
            <li><a href="#kurzfassung">Kurzfassung</a></li>
            ${item.sections.map(([title]) => `<li><a href="#${slugify(title)}">${escapeHtml(title)}</a></li>`).join("")}
            <li><a href="#quellen-und-daten">Quellen und Datenquellen</a></li>
          </ol>
        </nav>
      </section>
      <section class="section article-section">
        <article class="article-body fulltext-reader">
          ${sectionTitle("kurzfassung", "Kurzfassung")}
          <p id="kurzfassung-text">${escapeHtml(item.focus)} ${citeAnchor("kurzfassung-text", "Zitierlink zur Kurzfassung")}</p>
          ${item.sections.map(([title, text]) => {
            const id = slugify(title);
            return `${sectionTitle(id, title)}<p id="${id}-text">${escapeHtml(text)} ${citeAnchor(`${id}-text`, `Zitierlink zu ${title}`)}</p>`;
          }).join("")}
          ${sectionTitle("quellen-und-daten", "Quellen und Datenquellen")}
          <p>Dieses Einzeldossier verweist auf die vorhandenen Online-Volltexte des Produktportals, die Technischen Leitlinien WUStG, WStG, SDG-/SDG+-Referenzrahmen, CSRD/ESRS, GRI, NACE und die WÖk-ID-Logik. Nicht vorhandene Word-Dateien werden nicht verlinkt.</p>
        </article>
      </section>
      ${toolCards(base, selectedTools.length ? selectedTools : contextualTools)}
      ${politicalBlock(base, "Dieses Einzeldossier")}
      ${sdgBlock(base, "Das Einzeldossier ordnet Produktwirkung an SDGs und SDG+ an. Wirkung wird als tatsächliche Zustandsveränderung verstanden; Zielgröße ist positive Netto-Wirkung für Mensch, Planet und Demokratie.")}
      ${bookBlock(base)}
      ${externalSourcesBlock(base)}
      ${downloadBlock(base, [
        { label: "Dossier Produkte & Konsum", href: "wirkungsfelder/produkte-konsum/dossier/" },
        { label: "Kanonische Seite", href: item.canonical },
      ])}`,
    });
  }
}

function workshopAliasPages() {
  page({
    rel: "werkstatt/whitepaper/produktbesteuerung-durch-wirkung/index.html",
    title: "Whitepaper Produktbesteuerung durch Wirkung | Werkstatt",
    description: "Werkstatt-Einordnung des Whitepapers Produktbesteuerung durch Wirkung mit kanonischer Online-Fassung im Portal Produkte & Konsum.",
    searchSection: "Werkstatt",
    searchType: "Whitepaper",
    body: (base, route) => `${introHero({
      base,
      kicker: "Werkstatt · Whitepaper",
      h1: "Produktbesteuerung durch Wirkung",
      subtitle: "Kanonische Online-Fassung im Portal Produkte & Konsum.",
      text: "Die Werkstatt führt dieses Whitepaper als Dokumenten- und Quellenebene. Der Hauptzugang ist die online lesbare Fassung im Produktportal.",
      actions: `<a class="btn btn-primary" href="${href(base, "wirkungsfelder/produkte-konsum/produktbesteuerung-durch-wirkung/")}">Online lesen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${productStatus("Werkstatt-Verweis / Whitepaper")}</section>
    ${relatedBlocks(base)}
    ${downloadBlock(base, [{ label: "Online-Volltext öffnen", href: "wirkungsfelder/produkte-konsum/produktbesteuerung-durch-wirkung/" }, ...conceptDownloads])}`,
  });
  page({
    rel: "werkstatt/dossiers/produkte-konsum/index.html",
    title: "Dossier Produkte & Konsum | Werkstatt",
    description: "Werkstatt-Einordnung des Dossiers Produkte & Konsum mit kanonischer Online-Fassung im Produktportal.",
    searchSection: "Werkstatt",
    searchType: "Dossier",
    body: (base, route) => `${introHero({
      base,
      kicker: "Werkstatt · Dossier",
      h1: "Dossier Produkte & Konsum",
      subtitle: "Rechenmodell, Tarifmatrix, Beispiele und Quellen.",
      text: "Die Werkstatt führt das Dossier als Arbeits- und Exportebene. Der Hauptzugang ist die online lesbare Dossierseite im Produktportal.",
      actions: `<a class="btn btn-primary" href="${href(base, "wirkungsfelder/produkte-konsum/dossier/")}">Dossier online lesen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${productStatus("Werkstatt-Verweis / Dossier")}</section>
    ${downloadBlock(base, [{ label: "Dossier online lesen", href: "wirkungsfelder/produkte-konsum/dossier/" }, ...conceptDownloads])}`,
  });
}

function calculatorPage() {
  page({
    rel: "erleben/produktwirkungsrechner/index.html",
    title: "Produktwirkungsrechner | Wirkungsumsatzsteuer erleben",
    description: "Modellhafte Demo: Produktbeispiel wählen, Nettopreis und Scores setzen, FinalScore, Wirkungssteuersatz und Bruttopreis berechnen.",
    searchSection: "Erleben",
    searchType: "Demo",
    body: (base, route) => `<section class="hero portal-hero">
      <div class="hero-content">
        <nav class="breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}erleben.html">Erleben</a></nav>
        <p class="hero-kicker">Demo · Modell V0.1</p>
        <h1>Produktwirkungsrechner</h1>
        <p class="hero-subtitle">Scores, FinalScore, Steuerklasse und Bruttopreis modellhaft ausprobieren.</p>
        <p>Die Demo zeigt, wie die Wirkungsumsatzsteuer als Rückkopplung gedacht werden kann. Sie ist keine amtliche Einstufung und keine Steuerberatung.</p>
        ${printActions(`<a class="btn btn-primary" href="${href(base, "wirkungsfelder/produkte-konsum/")}">Produktportal öffnen</a>`)}
      </div>
    </section>
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${productStatus("Demo / Prototyp")}</section>
    <section class="section product-calculator-section" aria-labelledby="calculator-title">
      <div class="product-calculator" data-product-impact-calculator>
        <div class="section-header">
          <p class="hero-kicker">Rechner</p>
          ${sectionTitle("calculator-title", "Produktwirkung simulieren")}
          <p>FinalScore = niedrigster Score der Kernfelder. Für FinalScore -3 wird in der Demo mit 30 % gerechnet; der Modellkorridor lautet 25-30 %.</p>
        </div>
        <div class="calculator-grid">
          <form class="card calculator-form">
            <label>Produktbeispiel
              <select name="product">
                <option value="bioApfel">Bio-Apfel regional</option>
                <option value="chileApfel">Chile-Apfel importiert</option>
                <option value="tshirt">T-Shirt</option>
                <option value="polyamid">Polyamid Produktgruppe</option>
              </select>
            </label>
            <label>Nettopreis in EUR
              <input name="netPrice" type="number" min="0" step="0.01" value="1.00">
            </label>
            <div class="score-inputs" aria-label="Kernfeld-Scores">
              ${["mensch", "planet", "demokratie", "daten"].map((field) => `<label>${field[0].toUpperCase()}${field.slice(1)}
                <input name="${field}" type="number" min="-3" max="3" step="1" value="0">
              </label>`).join("")}
            </div>
          </form>
          <aside class="card calculator-result" aria-live="polite">
            <p class="card-kicker">Ergebnis</p>
            <h2 id="calc-product-name">Bio-Apfel regional</h2>
            <dl>
              <div><dt>FinalScore</dt><dd data-result="finalScore">+1</dd></div>
              <div><dt>Modell-Steuersatz</dt><dd data-result="taxRate">10 %</dd></div>
              <div><dt>Nettopreis</dt><dd data-result="netPrice">1,00 EUR</dd></div>
              <div><dt>Bruttopreis</dt><dd data-result="grossPrice">1,10 EUR</dd></div>
            </dl>
            <p data-result="explanation">Der FinalScore wird durch das schwächste Kernfeld begrenzt.</p>
            <p class="scanner-notice"><strong>Hinweis:</strong> Modellhafte Demonstration. Keine amtliche Einstufung. Keine Steuerberatung.</p>
          </aside>
        </div>
      </div>
    </section>
    ${toolCards(base, contextualTools.filter((tool) => ["Wirkungsumsatzsteuer", "Produktscorecards", "WÖk-IDs", "Reverse Merit Order", "Digitale Produktpässe und Wirkungsdatenräume"].includes(tool.title)))}
    ${politicalBlock(base, "Der Produktwirkungsrechner")}
    ${sdgBlock(base, "Der Rechner zeigt modellhaft, wie Produktwirkung entlang von Mensch, Planet, Demokratie und Datenqualität bewertet werden könnte.")}
    ${bookBlock(base)}
    ${downloadBlock(base, [{ label: "Dossier online lesen", href: "wirkungsfelder/produkte-konsum/dossier/" }, { label: "Toolkontext öffnen", href: "wirkungsfelder/produkte-konsum/produktbesteuerung-durch-wirkung/" }])}
    <script src="${base}assets/js/produktwirkungsrechner.js?v=20260524-produktrechner"></script>`,
  });
}

function productArbeitsbibliothekPage() {
  page({
    rel: "werkstatt/arbeitsbibliothek/wirkungsfelder/produkte-konsum/index.html",
    title: "Produkte & Konsum in der Arbeitsbibliothek | Werkstatt der Wirkungsökonomie",
    description: "Arbeitsbibliothek zu Produkte & Konsum: Konzeptpapier, Dossier, Beispiele, Leitlinien, Gesetze, Werkzeuge und Demos.",
    searchSection: "Werkstatt",
    searchType: "Arbeitsbibliothek",
    body: (base, route) => `<section class="hero">
      <div>
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${href(base, "werkstatt/")}">Werkstatt</a><span aria-hidden="true">/</span><a href="${href(base, "werkstatt/arbeitsbibliothek/")}">Arbeitsbibliothek</a></nav>
        <p class="hero-kicker">Arbeitsbibliothek · Wirkungsfeld</p>
        <h1 class="hero-title">Produkte &amp; Konsum</h1>
        <p class="hero-subtitle">Konzeptpapiere, Dossiers, Beispiele, Leitlinien und Werkzeuge zum ersten tiefen Modellbereich der Wirkungsökonomie.</p>
        ${printActions(`<a class="btn btn-primary" href="${href(base, "wirkungsfelder/produkte-konsum/")}">Produktportal öffnen</a>`)}
      </div>
    </section>
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section" aria-labelledby="produktbibliothek">
      <div class="section-header">
        <p class="hero-kicker">Regel</p>
        ${sectionTitle("produktbibliothek", "Online lesen vor Download")}
        <p>Konzepte und Dossiers werden hier als Arbeitsbibliothek-Einträge geführt. Der kanonische Zugang bleibt online lesbar und zitierfähig; Word/PDF-Dateien sind ergänzende Export- und Archivfassungen.</p>
      </div>
      ${cardGrid(base, [
        { kicker: "Detailkonzept", title: "Produkte als Wirkungsträger", text: "Go-8-Vertiefung zu Produktwirkung über Lebenszyklus, Lieferkette, Nutzung und Ende.", href: "wirkungsfelder/produkte-konsum/produkte-als-wirkungstraeger/", label: "Online lesen" },
        { kicker: "Detailkonzept", title: "Wirkungsumsatzsteuer / Produktwirkungssteuer", text: "Go-8-Vertiefung zu FinalScore, Steuerklassen, Vorsteuerlogik, Kaufkraftschutz und Wirkungsrat.", href: "wirkungsfelder/produkte-konsum/wirkungsumsatzsteuer-produktwirkungssteuer/", label: "Online lesen" },
        { kicker: "Detailkonzept", title: "Produktscorecards, Reverse Merit Order und digitale Produktpässe", text: "Go-8-Vertiefung zu Scorecards, WÖk-IDs, DPP, Datenqualität und Engpasslogik.", href: "wirkungsfelder/produkte-konsum/produktscorecards-reverse-merit-order-digitale-produktpaesse/", label: "Online lesen" },
        { kicker: "Detailkonzept", title: "Das Apfelbeispiel und die Produktwirkungsrechnung im Alltag", text: "Go-9-Vertiefung zu Scorecard, Steuerklasse, Preisschild und Produktwirkungsrechnung am Alltagsbeispiel.", href: "wirkungsfelder/produkte-konsum/apfelbeispiel-produktwirkungsrechnung/", label: "Online lesen" },
        { kicker: "Detailkonzept", title: "Lieferketten, Importlogik und Wirkungsvorsteuer", text: "Go-9-Vertiefung zu Vorleistungen, Importen, Bonuslogik, Supplier Scorecards und DPP.", href: "wirkungsfelder/produkte-konsum/lieferketten-importlogik-wirkungsvorsteuer/", label: "Online lesen" },
        { kicker: "Detailkonzept", title: "Konzern- und Produktgruppenbeispiel: Von CSRD zur Produktscorecard", text: "Go-9-Vertiefung zu CSRD/ESRS, Produktgruppen, WÖk-IDs und Produktpass-Mapping.", href: "wirkungsfelder/produkte-konsum/konzernbeispiel-csrd-produktscorecard/", label: "Online lesen" },
        { kicker: "Konzeptpapier", title: "Produktbesteuerung durch Wirkung", text: "Kanonische Online-Fassung des Konzeptpapiers zu NACE, WÖk-IDs, Scorecards, Reverse Merit Order, Steuerklassen und Vorsteuerlogik.", href: "wirkungsfelder/produkte-konsum/produktbesteuerung-durch-wirkung/", label: "Online lesen" },
        { kicker: "Dossier", title: "Dossier Produkte & Konsum", text: "Rechenmodell V0.1, Tarifmatrix, Apfelrechnung, T-Shirt-Rechnung, Lieferkettenlogik und Quellen online lesbar.", href: "wirkungsfelder/produkte-konsum/dossier/", label: "Online lesen" },
        { kicker: "Werkstatt", title: "Whitepaper-Eintrag", text: "Werkstatt-Verweis auf das Produktpapier mit Online-Volltext und ergänzenden Downloadhinweisen.", href: "werkstatt/whitepaper/produktbesteuerung-durch-wirkung/", label: "Werkstatt öffnen" },
        { kicker: "Werkstatt", title: "Dossier-Eintrag", text: "Werkstatt-Verweis auf das Dossier Produkte & Konsum.", href: "werkstatt/dossiers/produkte-konsum/", label: "Werkstatt öffnen" },
        { kicker: "Beispiel", title: "Regionaler Apfel vs. Chile-Apfel", text: "Produktscorecard und Wirkungssteuerlogik am Apfelbeispiel.", href: "wirkungsfelder/produkte-konsum/apfelbeispiel/", label: "Online lesen" },
        { kicker: "Beispiel", title: "T-Shirt / Textilbeispiel", text: "Modellseite für Textilien, Arbeit, Wasser, Chemie, Kreislauf und Produktwirkung.", href: "wirkungsfelder/produkte-konsum/t-shirt/", label: "Online lesen" },
        { kicker: "Lieferkette", title: "Wirkungsökonomie in der Lieferkette", text: "Volltext zu Lieferketten, Vorsteuerlogik, Datenräumen und roten Linien.", href: "wirkungsfelder/produkte-konsum/lieferketten/", label: "Online lesen" },
        { kicker: "Konzernbeispiel", title: "Von der CSRD zur Produktscorecard", text: "BASF-/Polyamid-Beispiel für Produktgruppen und Berichtsdaten.", href: "wirkungsfelder/produkte-konsum/basf-polyamid/", label: "Online lesen" },
        { kicker: "Leitlinie", title: "Technische Leitlinien WUStG", text: "Online-Fassung der technischen Leitlinien als Werkstattquelle.", href: "werkstatt/leitlinien/wustg/", label: "Leitlinie lesen" },
        { kicker: "Gesetz", title: "Wirkungssteuergesetz WStG", text: "LawReader mit Paragrafen, Kurzfassungen, Kommentar und Begründung.", href: "werkstatt/gesetze/wirkungssteuergesetz/", label: "Gesetz lesen" },
        { kicker: "Demo", title: "Produktwirkungsrechner", text: "Modellhafte Simulation von Scores, FinalScore, Steuerklasse und Bruttopreis.", href: "erleben/produktwirkungsrechner/", label: "Demo öffnen" },
        { kicker: "Archiv", title: "Working Paper PDF", text: "Bestehende PDF-Fassung bleibt als Archiv- und Exportfassung erreichbar.", href: "assets/pdf/working-paper-produktbesteuerung-durch-wirkung.pdf", label: "PDF öffnen" },
      ])}
    </section>
    ${toolCards(base)}
    ${politicalBlock(base, "Die Arbeitsbibliothek Produkte & Konsum")}
    ${sdgBlock(base, "Die Arbeitsbibliothek ordnet Produktwirkung an SDGs und SDG+ an, ohne die SDGs als Menübaum zu behandeln. Entscheidend bleibt positive Netto-Wirkung für Mensch, Planet und Demokratie.")}
    ${bookBlock(base)}
    ${downloadBlock(base, conceptDownloads)}`,
  });
}

function updateSitemap() {
  const sitemapPath = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) return;
  const urls = [
    "wirkungsfelder/produkte-konsum/",
    ...go8ProductDetails.map((item) => item.rel.replace(/index\.html$/, "")),
    ...go9ProductDetails.map((item) => item.rel.replace(/index\.html$/, "")),
    "wirkungsfelder/produkte-konsum/produktbesteuerung-durch-wirkung/",
    "wirkungsfelder/produkte-konsum/dossier/",
    "wirkungsfelder/produkte-konsum/apfelbeispiel/",
    "wirkungsfelder/produkte-konsum/t-shirt/",
    "wirkungsfelder/produkte-konsum/lieferketten/",
    "wirkungsfelder/produkte-konsum/basf-polyamid/",
    "wirkungsfelder/produkte-konsum/verbraucherinformation/",
    "wirkungsfelder/produkte-konsum/unternehmen/",
    "wirkungsfelder/produkte-konsum/politische-rahmenbedingungen/",
    ...productSingleDossiers.map((item) => `wirkungsfelder/produkte-konsum/dossiers/${item.slug}/`),
    "werkzeuge/wirkungsumsatzsteuer/",
    "werkzeuge/produktscorecards/",
    "werkzeuge/woek-ids/",
    "werkzeuge/reverse-merit-order/",
    "werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/",
    "werkzeuge/wirkungsrat/",
    "werkstatt/gesetze/wirkungssteuergesetz/",
    "werkstatt/gesetze/wirkungsumsatzsteuergesetz/",
    "werkstatt/leitlinien/wustg/",
    "werkstatt/whitepaper/produktbesteuerung-durch-wirkung/",
    "werkstatt/dossiers/produkte-konsum/",
    "werkstatt/arbeitsbibliothek/konzepte-dossiers/",
    "werkstatt/arbeitsbibliothek/wirkungsfelder/produkte-konsum/",
    "erleben/produktwirkungsrechner/",
  ];
  let sitemap = fs.readFileSync(sitemapPath, "utf8");
  for (const rel of urls) {
    sitemap = sitemap.replace(new RegExp(`\\s*<url>\\s*<loc>${SITE}/${rel}</loc>\\s*<lastmod>[^<]+</lastmod>\\s*</url>`, "g"), "");
    sitemap = sitemap.replace(new RegExp(`\\s*<url><loc>${SITE}/${rel}</loc><lastmod>[^<]+</lastmod></url>`, "g"), "");
  }
  const entries = urls.map((rel) => `  <url><loc>${SITE}/${rel}</loc><lastmod>${DATE}</lastmod></url>`).join("\n");
  sitemap = sitemap.replace("</urlset>", `${entries}\n</urlset>`);
  fs.writeFileSync(sitemapPath, sitemap, "utf8");
}

function build() {
  productPortal();
  go8DetailConceptPages();
  go9DetailConceptPages();
  dossierPage();
  productSingleDossierPages();
  tShirtPage();
  fulltextPage({
    rel: "wirkungsfelder/produkte-konsum/produktbesteuerung-durch-wirkung/index.html",
    source: sources.productTax,
    title: "Produktbesteuerung durch Wirkung | Wirkungsumsatzsteuer",
    description: "Vollständige Online-Fassung zur Produktbesteuerung durch Wirkung: NACE, WÖk-IDs, Scorecards, Reverse Merit Order, Steuerklassen und Vorsteuerlogik.",
    kicker: "Online-Volltext",
    h1: "Produktbesteuerung durch Wirkung",
    subtitle: "Wie Produkte nach ihrer Wirkung auf Mensch, Planet und Demokratie besteuert werden können.",
    hero: "Diese Seite bildet das Produktpapier vollständig online ab. Der Hauptzugang ist der Webtext; Downloads bleiben Archiv und Export.",
    contextIntro: (base) => `Die Bewertung erfolgt über ${toolRef(base, "Produktscorecards", "werkzeuge/produktscorecards/", "Bewertungsraster, das Produktdaten in Scores von -3 bis +3 übersetzt.")}, deren FinalScore nach der ${toolRef(base, "Reverse Merit Order", "werkzeuge/reverse-merit-order/", "Das schwächste kritische Wirkungsfeld begrenzt die Einstufung.")} gebildet wird. Die technische Ausgestaltung verweist auf ${lawRef(base, "wustg5")} und ${lawRef(base, "wustg7")}.`,
    sdgText: "Produktbesteuerung durch Wirkung verknüpft Konsum, Produktion, Arbeit, Gesundheit, Klima, Biodiversität, Datenqualität und institutionelle Prüfung. Zielgröße ist positive Netto-Wirkung für Mensch, Planet und Demokratie.",
    downloads: [{ label: "Zum Wirkungsfeld", href: "wirkungsfelder/produkte-konsum/" }, { label: "Zur Bibliothek", href: "downloads.html" }],
  });
  fulltextPage({
    rel: "wirkungsfelder/produkte-konsum/apfelbeispiel/index.html",
    source: sources.apple,
    title: "Regionaler Apfel vs. Chile-Apfel | Wirkungssteuer-Beispiel",
    description: "Wie ein regionaler Bio-Apfel und ein importierter Apfel anhand von SDGs, CSRD/ESRS-Daten, Scorecards und Wirkungssteuer unterschiedlich eingestuft werden.",
    kicker: "Beispiel",
    h1: "Regionaler Apfel vs. Chile-Apfel",
    subtitle: "Wie eine Wirkungssteuer Produkte automatisch und nachvollziehbar einstuft.",
    hero: "Das Apfelbeispiel zeigt didaktisch, dass regional, bio oder importiert nicht automatisch positiv oder negativ ist. Kontext, Datenqualität und rote Linien entscheiden.",
    contextIntro: (base) => `Das Beispiel nutzt NACE 01.24, WÖk-IDs, Scorecard, FinalScore, ${toolRef(base, "Reverse Merit Order", "werkzeuge/reverse-merit-order/", "Das schwächste Wirkungsfeld entscheidet.")} und modellhafte Wirkungsumsatzsteuer. Es ist keine amtliche Einstufung.`,
    sdgText: "Das Apfelbeispiel berührt Ernährung, Wasser, Biodiversität, Arbeit, Gesundheit, Transport, Verpackung und Konsumtransparenz.",
    downloads: [{ label: "Alte Webfassung öffnen", href: "dokumente/beispiel-apfel-wirkungssteuer-bonusregel/" }, { label: "Scorecard-Demo öffnen", href: "scorecard-dashboard.html" }],
  });
  fulltextPage({
    rel: "wirkungsfelder/produkte-konsum/lieferketten/index.html",
    source: sources.supplyChain,
    title: "Wirkungsökonomie in der Lieferkette | Produkte & Konsum",
    description: "Warum globale Lieferketten nicht länger Schlupflöcher für negative Wirkung sein dürfen.",
    kicker: "Online-Volltext",
    h1: "Wirkungsökonomie in der Lieferkette",
    subtitle: "Warum globale Lieferketten nicht länger Schlupflöcher für negative Wirkung sein dürfen.",
    hero: "Lieferketten tragen Wirkung lange vor dem Endprodukt. Diese Seite macht Vorleistungen, rote Linien, Datenqualität, DPPs und faire Übergänge online lesbar.",
    contextIntro: (base) => `Lieferkettenbewertung verweist auf ${lawRef(base, "wustg7")} und ${lawRef(base, "wustg8")}. Vorsteuerlogik bleibt Pilotmodell und setzt Gesetzgebung, Rechtsschutz und Dateninfrastruktur voraus.`,
    sdgText: "Lieferkettenwirkung berührt Arbeit, Ressourcen, Wasser, Klima, Biodiversität, Rechtsstaatlichkeit, Datenintegrität und globale Fairness.",
    downloads: [{ label: "Alte Webfassung öffnen", href: "dokumente/wirkungsoekonomie-in-der-lieferkette/" }, { label: "WUStG-Leitlinien lesen", href: "werkstatt/leitlinien/wustg/" }],
  });
  fulltextPage({
    rel: "wirkungsfelder/produkte-konsum/basf-polyamid/index.html",
    source: sources.basf,
    title: "Von der CSRD zur Produktscorecard | BASF Polyamid",
    description: "Wie Unternehmensdaten auf Produktgruppen heruntergebrochen werden können - Beispiel Polyamid.",
    kicker: "Konzernbeispiel",
    h1: "Von der CSRD zur Produktscorecard",
    subtitle: "Wie Unternehmensdaten auf Produktgruppen heruntergebrochen werden können - Beispiel Polyamid.",
    hero: "Das Beispiel zeigt illustrativ, warum Konzernmittelwerte keine Produktwahrheit sind und wie Produktgruppen über WÖk-IDs, EPDs, DPPs und Scorecards bewertet werden können.",
    contextIntro: (base) => `Die Seite verbindet Produktportal, ${toolRef(base, "Impact Controlling", "werkzeuge/impact-controlling/", "Dachbereich für Wirkung in Steuerung, Reporting, Risiko und Entscheidung.")}, T-SROI und Lieferkettensteuerung. Sie behauptet keine ungesicherten Echtwerte zu BASF oder Polyamid.`,
    sdgText: "Das Konzernbeispiel berührt Industrie, Innovation, Chemikalien, Klima, Kreislauf, Lieferketten, Datenqualität und Unternehmensverantwortung.",
    downloads: [{ label: "Konzernbeispiel öffnen", href: "dokumente/beispiel-konzern/" }, { label: "Impact Controlling öffnen", href: "werkzeuge/impact-controlling/" }],
  });
  calculatorPage();
  workshopAliasPages();
  productArbeitsbibliothekPage();
  compactContextPage({
    rel: "wirkungsfelder/produkte-konsum/verbraucherinformation/index.html",
    title: "Verbraucherinformation",
    subtitle: "Wirkungspunkte, Steuerklassen, Produktlabel und Regaltransparenz ohne Personenbewertung.",
    description: "Verbraucherinformation macht Produktwirkung sichtbar, bewertet aber keine Menschen. Sie zeigt Produktklasse, Datenqualität und Wirkungsfelder datensparsam am Produkt, im Regal oder auf dem Kassenbon.",
    sections: [
      { kicker: "Prinzip", title: "Produkt statt Person", text: "Die Wirkungsökonomie bewertet Produkte, Dienstleistungen und Lieferketten, nicht individuelles Kaufverhalten." },
      { kicker: "Transparenz", title: "Wirkungspunkte und Steuerklasse", text: "Wirkungspunkte können erklären, warum ein Produkt entlastet, neutral behandelt oder belastet wird." },
      { kicker: "Schutz", title: "Keine Konsumüberwachung", text: "Freiwillige Bonusmodelle dürfen nur datensparsam, transparent und ohne Personenbewertung gedacht werden." },
    ],
  });
  compactContextPage({
    rel: "wirkungsfelder/produkte-konsum/unternehmen/index.html",
    title: "Unternehmen und Produktwirkung",
    subtitle: "Was Produktbesteuerung für Produktentwicklung, Einkauf, Lieferketten, Controlling und Reporting bedeutet.",
    description: "Für Unternehmen verschiebt Produktbesteuerung den Blick von pauschalem Umsatz zu Produktgruppen, Lieferketten, Datenqualität und positiven Netto-Wirkungen.",
    sections: [
      { kicker: "Steuerung", title: "Produktentwicklung", text: "Materialwahl, Reparierbarkeit, Kreislauffähigkeit und Lieferantenentwicklung werden steuerungsrelevant." },
      { kicker: "Reporting", title: "Von CSRD zu Produktgruppen", text: "Konzernberichte werden durch produkt- und anlagennahe Daten ergänzt." },
      { kicker: "Controlling", title: "Wirkung in Entscheidungen", text: "Impact Controlling verbindet Produktdaten, Risiken, Investitionen und Transformation." },
    ],
  });
  compactContextPage({
    rel: "wirkungsfelder/produkte-konsum/politische-rahmenbedingungen/index.html",
    title: "Politische Rahmenbedingungen",
    subtitle: "Was Politik, Verwaltung, Wirkungsrat und Steuerrecht schaffen müssen.",
    description: "Produktbesteuerung durch Wirkung braucht Rahmengesetz, technische Leitlinien, Wirkungsrat, Datenschutz, Rechtsschutz, Pilotierung, soziale Abfederung und europarechtliche Prüfung.",
    sections: [
      { kicker: "Recht", title: "WStG und WUStG", text: "Das WStG setzt die Rahmenordnung; WUStG-Leitlinien konkretisieren Produktbewertung und Pilotlogik." },
      { kicker: "Governance", title: "Wirkungsrat", text: "Indikatoren, Benchmarks und Bewertungslogik brauchen unabhängige Evaluation." },
      { kicker: "Übergang", title: "Kaufkraft- und KMU-Schutz", text: "Basisgüter, kleine Unternehmen, Datenlücken und soziale Übergänge müssen berücksichtigt werden." },
    ],
  });
  toolPage({
    rel: "werkzeuge/wirkungsumsatzsteuer/index.html",
    h1: "Wirkungsumsatzsteuer",
    subtitle: "Produktwirkungssteuer der Wirkungsökonomie.",
    description: "Die Wirkungsumsatzsteuer koppelt Steuersätze im Pilotmodell an die messbare Wirkung von Produkten und Dienstleistungen auf Mensch, Planet und Demokratie.",
    sections: [
      { kicker: "Abgrenzung", title: "Nicht pauschal nach Umsatz", text: (base) => `Die Steuerlogik betrachtet Produktwirkung über ${toolRef(base, "Produktscorecards", "werkzeuge/produktscorecards/", "Bewertungsraster für Produktwirkung.")}, WÖk-IDs, FinalScore und Reverse Merit Order.` },
      { kicker: "Rechtsstatus", title: "Pilot- und Modelllogik", text: (base) => `Eine verbindliche Anwendung setzt Gesetzgebung, Rechtsschutz und Dateninfrastruktur voraus. Siehe ${lawRef(base, "wustg5")} und ${lawRef(base, "wustg7")}.` },
      { kicker: "Ziel", title: "Positive Netto-Wirkung", text: () => "Die Zielgröße ist positive Netto-Wirkung für Mensch, Planet und Demokratie, nicht Wirkung schlechthin." },
    ],
    appliedIn: [
      { title: "Produkte & Konsum", text: "Hauptportal für Produktwirkung, Preise und Konsumentscheidungen.", href: "wirkungsfelder/produkte-konsum/" },
      { title: "Produktbesteuerung durch Wirkung", text: "Volltext des Produktpapiers.", href: "wirkungsfelder/produkte-konsum/produktbesteuerung-durch-wirkung/" },
      { title: "Wirkungsumsatzsteuer / Produktwirkungssteuer", text: "Detailkonzept zu FinalScore, Steuerklassen, Vorsteuerlogik, Kaufkraftschutz und Wirkungsrat.", href: "wirkungsfelder/produkte-konsum/wirkungsumsatzsteuer-produktwirkungssteuer/" },
      { title: "Apfelbeispiel und Produktwirkungsrechnung", text: "Alltagsnaher Testfall für Scorecard, Steuerklasse und Verbraucherinformation.", href: "wirkungsfelder/produkte-konsum/apfelbeispiel-produktwirkungsrechnung/" },
      { title: "Lieferketten und Wirkungsvorsteuer", text: "Vorsteuer-, Bonus-, Import- und Lieferantenlogik als Detailkonzept.", href: "wirkungsfelder/produkte-konsum/lieferketten-importlogik-wirkungsvorsteuer/" },
      { title: "CSRD zur Produktscorecard", text: "Konzern- und Produktgruppenbeispiel für produktbezogene Wirkungsdaten.", href: "wirkungsfelder/produkte-konsum/konzernbeispiel-csrd-produktscorecard/" },
      { title: "Lieferketten", text: "Vorsteuer-, Bonus- und Lieferantenlogik.", href: "wirkungsfelder/produkte-konsum/lieferketten/" },
    ],
  });
  toolPage({
    rel: "werkzeuge/produktscorecards/index.html",
    h1: "Produktscorecards",
    subtitle: "Bewertungsraster für Produktwirkung.",
    description: "Produktscorecards übersetzen Produkt-, Lieferketten- und Benchmarkdaten in nachvollziehbare Scores, Datenqualität und FinalScore.",
    sections: [
      { kicker: "Funktion", title: "Von Daten zu Scores", text: () => "Werte werden nicht moralisch behauptet, sondern über Indikatoren, Einheiten, Schwellen, Quellen und Prüfstatus bewertet." },
      { kicker: "Schutzregel", title: "Reverse Merit Order", text: (base) => `Der FinalScore berücksichtigt die ${toolRef(base, "Reverse Merit Order", "werkzeuge/reverse-merit-order/", "Das schwächste kritische Wirkungsfeld begrenzt die Einstufung.")}.` },
      { kicker: "Daten", title: "WÖk-IDs", text: (base) => `Jede Bewertung braucht eindeutige ${toolRef(base, "WÖk-IDs", "werkzeuge/woek-ids/", "Indikatorenarchitektur mit Quelle, Einheit, Schwelle und Version.")}.` },
    ],
    appliedIn: [
      { title: "Apfelbeispiel", text: "Didaktische Produktscorecard für Kernobst.", href: "wirkungsfelder/produkte-konsum/apfelbeispiel/" },
      { title: "BASF Polyamid", text: "Von Konzern- zu Produktgruppendaten.", href: "wirkungsfelder/produkte-konsum/basf-polyamid/" },
      { title: "Scorecard-Demo", text: "Interaktive Modellansicht.", href: "scorecard-dashboard.html" },
    ],
  });
  toolPage({
    rel: "werkzeuge/woek-ids/index.html",
    h1: "WÖk-IDs",
    subtitle: "Indikatorenarchitektur für prüfbare Wirkung.",
    description: "WÖk-IDs verbinden SDGs, SDG+, NACE, ESRS, GRI, Datenquellen, Einheiten, Schwellenwerte und Versionen in einer prüfbaren Wirkungslogik.",
    sections: [
      { kicker: "Eindeutigkeit", title: "Keine beliebigen KPI-Namen", text: () => "Eine WÖk-ID macht sichtbar, welcher Indikator gemeint ist, welche Quelle gilt und welche Version verwendet wird." },
      { kicker: "Anschluss", title: "Standards verbinden", text: () => "NACE, ESRS, GRI, EU-Taxonomie, EPDs und digitale Produktpässe werden über Indikatorfamilien anschlussfähig." },
      { kicker: "Prüfung", title: "Datenqualität", text: () => "Datenqualität, Prüfstatus und Gültigkeitszeitraum verhindern Scheingenauigkeit." },
    ],
    appliedIn: [
      { title: "Produktbesteuerung", text: "Grundlage für Produktwirkung und Steuerlogik.", href: "wirkungsfelder/produkte-konsum/produktbesteuerung-durch-wirkung/" },
      { title: "WUStG-Leitlinien", text: "Technische Ausgestaltung der Indikatoren.", href: "werkstatt/leitlinien/wustg/" },
      { title: "WÖk Master Items", text: "Vorhandenes Register als Ausgangsquelle.", href: "dokumente/woek-master-items-final-v1-2/" },
    ],
  });
  toolPage({
    rel: "werkzeuge/reverse-merit-order/index.html",
    h1: "Reverse Merit Order",
    subtitle: "Das schwächste Wirkungsfeld entscheidet.",
    description: "Die Reverse Merit Order verhindert, dass schwere negative Wirkung durch positive Einzelwerte schöngerechnet wird.",
    sections: [
      { kicker: "Prinzip", title: "Nichtkompensation", text: () => "Kinderarbeit, Zwangsarbeit, schwere Umweltzerstörung oder demokratische Schäden dürfen eine Gesamtbewertung begrenzen." },
      { kicker: "Produktsteuer", title: "Schutz vor Greenwashing", text: (base) => `Im WUStG-Kontext verweist die Schutzregel auf ${lawRef(base, "wustg6")}.` },
      { kicker: "Bewertung", title: "FinalScore begrenzen", text: () => "Gute Klima- oder Kreislaufwerte können rote Linien in Arbeit, Gesundheit oder Biodiversität nicht einfach ausgleichen." },
    ],
    appliedIn: [
      { title: "Produkte & Konsum", text: "Schutzregel der Produktbewertung.", href: "wirkungsfelder/produkte-konsum/" },
      { title: "Apfelbeispiel", text: "Illustrative Anwendung bei Lebensmitteln.", href: "wirkungsfelder/produkte-konsum/apfelbeispiel/" },
      { title: "Lieferketten", text: "Rote Linien entlang der Supply Chain.", href: "wirkungsfelder/produkte-konsum/lieferketten/" },
    ],
  });
  guidelinesPage();
  wustgConceptPage();
  lawReader();
  updateSitemap();
}

build();
