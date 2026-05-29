import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "verstehen/regularien-standards");

const groups = [
  ["eu-reporting", "EU-Reporting und Unternehmensdaten", "Welche Daten Unternehmen berichten und wie daraus WÖk-Wirkungsdaten werden."],
  ["produkte-kreislauf", "Produkte, Kreislauf und Lieferketten", "Welche Regeln Produktdaten, Rücknahme, Sorgfalt und Kreislauffähigkeit strukturieren."],
  ["finanzmarkt", "Finanzmarkt, Banken und Risiko", "Wie Kapitalmärkte, Banken, Versicherungen und Ratings Nachhaltigkeits- und Wirkungsrisiken verarbeiten."],
  ["digital-ki", "Digitales, KI und Plattformen", "Welche Regeln digitale Infrastruktur, KI, Plattformen und Datenräume betreffen."],
  ["wissenschaft", "Wissenschaftliche Referenzen und Reports", "Welche Studien und internationalen Referenzen für WÖk-Wirkungslogik wichtig sind."],
  ["sdg", "SDGs, SDG+ und normative Rahmen", "Welche Zielrahmen Wirkung einordnen, ohne selbst ein Steuerungsmodell zu sein."],
];

const standards = [
  {
    id: "csrd",
    title: "CSRD",
    subtitle: "Corporate Sustainability Reporting Directive",
    group: "eu-reporting",
    summary: "EU-Richtlinie zur Nachhaltigkeitsberichterstattung. Sie schafft Unternehmensdaten, aber noch keine Wirkungsrückkopplung.",
    regulates: "Berichtspflichten zu Nachhaltigkeit, Geschäftsmodell, Risiken, Chancen, Auswirkungen und doppelter Wesentlichkeit.",
    data: "Unternehmensberichte, ESRS-Angaben, Nachhaltigkeitskennzahlen, Lageberichtsinformationen.",
    woek: "Für die WÖk ist CSRD ein Datenanschluss: aus Berichtsdaten können WÖk-IDs, Scorecards, NWI, T-SROI und Rückkopplungslogiken entstehen.",
    limits: "CSRD beschreibt und prüft Berichtsdaten. Sie entscheidet nicht automatisch, ob Wirkung positiv, negativ oder rückkopplungsrelevant ist.",
    official: [
      ["EU-Kommission: Corporate sustainability reporting", "https://finance.ec.europa.eu/capital-markets-union-and-financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en"],
      ["EUR-Lex DE: Richtlinie (EU) 2022/2464", "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32022L2464"],
    ],
    related: ["ESRS", "Doppelte Wesentlichkeit", "EU-Taxonomie", "Wirkungsdaten"],
  },
  {
    id: "esrs",
    title: "ESRS",
    subtitle: "European Sustainability Reporting Standards",
    group: "eu-reporting",
    summary: "Europäische Berichtsstandards für Nachhaltigkeitsinformationen im CSRD-Kontext.",
    regulates: "Welche Themen, Datenpunkte und Erläuterungen Unternehmen in CSRD-Berichten offenlegen.",
    data: "Umwelt-, Sozial- und Governanceangaben, darunter Klima, Biodiversität, eigene Belegschaft, Lieferkette, Verbraucher:innen und Geschäftsverhalten.",
    woek: "ESRS können Rohdaten für WÖk-Scorecards liefern. Die WÖk ergänzt eine Wirkungsbewertung und ökonomische Rückkopplung.",
    limits: "ESRS sind kein fertiges Bewertungssystem für Preise, Steuern oder Kapitalwirkung.",
    official: [
      ["EFRAG Sustainability Reporting", "https://www.efrag.org/en/sustainability-reporting"],
      ["EUR-Lex DE: Delegierte Verordnung (EU) 2023/2772", "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32023R2772"],
    ],
    related: ["CSRD", "EFRAG", "WÖk-ID", "Scorecard"],
  },
  {
    id: "eu-taxonomie",
    title: "EU-Taxonomie",
    subtitle: "Klassifikationssystem nachhaltiger Wirtschaftstätigkeiten",
    group: "finanzmarkt",
    summary: "EU-Klassifikation dafür, wann wirtschaftliche Aktivitäten ökologisch nachhaltig gelten können.",
    regulates: "Taxonomiefähigkeit, Taxonomiekonformität und technische Bewertungskriterien für nachhaltige Aktivitäten.",
    data: "Aktivitätsdaten, Umsatz-, CapEx- und OpEx-Anteile sowie Kriterienbezug.",
    woek: "Die Taxonomie kann ökologische Mindest- und Vergleichspunkte liefern. Die WÖk verbindet sie mit Netto-Wirkung und Rückkopplung.",
    limits: "Sie deckt nicht alle sozialen, demokratischen und systemischen Wirkungen ab.",
    official: [
      ["EU-Kommission: EU taxonomy", "https://finance.ec.europa.eu/sustainable-finance/tools-and-standards/eu-taxonomy-sustainable-activities_en"],
      ["EUR-Lex DE: Verordnung (EU) 2020/852", "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32020R0852"],
    ],
    related: ["CSRD", "SFDR", "Kapitalwirkung", "Stranded Assets"],
  },
  {
    id: "sfdr",
    title: "SFDR",
    subtitle: "Sustainable Finance Disclosure Regulation",
    group: "finanzmarkt",
    summary: "EU-Offenlegungsverordnung für nachhaltigkeitsbezogene Informationen im Finanzdienstleistungssektor.",
    regulates: "Transparenzpflichten für Finanzmarktteilnehmer und Finanzprodukte, darunter Nachhaltigkeitsrisiken und Principal Adverse Impacts.",
    data: "Offenlegungen zu Finanzprodukten, Nachhaltigkeitsrisiken, PAI-Indikatoren und Produktkategorien.",
    woek: "SFDR schafft Finanzmarkttransparenz. Die WÖk fragt zusätzlich, ob Kapital tatsächlich positive Netto-Wirkung ermöglicht oder Schäden finanziert.",
    limits: "Offenlegung ist noch keine Wirkung und keine Rückkopplung.",
    official: [
      ["EU-Kommission: SFDR", "https://finance.ec.europa.eu/sustainable-finance/disclosures/sustainability-related-disclosure-financial-services-sector_en"],
      ["EUR-Lex DE: Verordnung (EU) 2019/2088", "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32019R2088"],
    ],
    related: ["EU-Taxonomie", "ESG-Ratings", "Kapitalwirkung"],
  },
  {
    id: "eba-esg-risiken",
    title: "EBA-Leitlinien zu ESG-Risiken",
    subtitle: "Bankenanforderungen ab 11. Januar 2026",
    group: "finanzmarkt",
    summary: "Leitlinien der Europäischen Bankenaufsicht zum Management von Umwelt-, Sozial- und Governance-Risiken.",
    regulates: "Interne Prozesse, Governance, Strategie, Risikomanagement und Pläne für ESG-Risiken in Instituten.",
    data: "Risikodaten, Übergangspläne, Klima- und ESG-Risikotreiber, Portfolio- und Governanceinformationen.",
    woek: "Für die WÖk ist das der Finanzmarktanschluss: Wirkung wird nicht nur Ethik, sondern Kredit-, Kapital-, Resilienz- und Transformationsrisiko.",
    limits: "Die Leitlinien sind Risikomanagement. Sie ersetzen keine gesellschaftliche Wirkungsbewertung und keine demokratische Rückkopplung.",
    official: [
      ["EBA: Final Guidelines on ESG risk management", "https://www.eba.europa.eu/node/17625"],
      ["EBA Guidelines PDF", "https://www.eba.europa.eu/sites/default/files/2025-01/1a0fae0d-fc21-4aa1-9490-12e0997a4265/Final%20Guidelines%20on%20the%20management%20of%20ESG%20risks.pdf"],
    ],
    related: ["Kapitalwirkung", "Wirkungsrisiko", "Resilienz", "ESG"],
  },
  {
    id: "esg-ratings",
    title: "ESG-Ratings und Ratingregulierung",
    subtitle: "Transparenz, Methodik und Aufsicht",
    group: "finanzmarkt",
    summary: "ESG-Ratings beeinflussen Kapitalzugang, Risikowahrnehmung und Investitionsentscheidungen.",
    regulates: "Transparenz und Governance von ESG-Ratinganbietern; in der EU mit Aufsichtsanschluss über ESMA.",
    data: "Ratingmethoden, Scores, Kontroversen, Risikoeinschätzungen, Unternehmensdaten.",
    woek: "Die WÖk nutzt Ratings nicht als Wahrheit, sondern als Datenpunkt. Entscheidend bleibt die nachvollziehbare Wirkungslogik.",
    limits: "Ratings können je nach Methodik stark auseinanderfallen und Wirkung verdecken.",
    official: [
      ["EU-Kommission: ESG rating activities", "https://finance.ec.europa.eu/sustainable-finance/tools-and-standards/esg-rating-activities_en"],
      ["ESMA", "https://www.esma.europa.eu/"],
    ],
    related: ["Scorecard", "NWI", "Datenqualität"],
  },
  {
    id: "gri",
    title: "GRI Standards",
    subtitle: "Global Reporting Initiative",
    group: "eu-reporting",
    summary: "Global verbreitete Standards für Impact-orientierte Nachhaltigkeitsberichterstattung.",
    regulates: "GRI reguliert nicht staatlich, strukturiert aber Berichte über Auswirkungen auf Wirtschaft, Umwelt und Menschen.",
    data: "Themenstandards, Managementansätze, Indikatoren zu Emissionen, Arbeit, Menschenrechten, Lieferketten und Governance.",
    woek: "GRI ist ein wichtiger Datenanschluss für Wirkungsdaten, weil der Blick stärker auf Auswirkungen als nur auf finanzielle Risiken gerichtet ist.",
    limits: "GRI-Berichte sind keine automatische WÖk-Bewertung und erzeugen keine Preis- oder Steuerwirkung.",
    official: [
      ["GRI Standards", "https://www.globalreporting.org/standards/"],
      ["GRI: Standards German translations", "https://www.globalreporting.org/how-to-use-the-gri-standards/gri-standards-german-translations/"],
    ],
    related: ["CSRD", "ESRS", "Wirkungsdaten", "Datenqualität"],
  },
  {
    id: "tnfd-issb",
    title: "TNFD und ISSB",
    subtitle: "Natur-, Klima- und Finanzmarkt-Reporting",
    group: "finanzmarkt",
    summary: "Internationale Rahmen für naturbezogene, klimabezogene und finanzmarktrelevante Nachhaltigkeitsinformationen.",
    regulates: "TNFD ist freiwilliger Natur- und Biodiversitätsrahmen; ISSB entwickelt globale Sustainability-Disclosure-Standards.",
    data: "Klima-, Natur-, Governance-, Strategie-, Risiko- und Kennzahlendaten für Kapitalmärkte.",
    woek: "Sie helfen, Natur- und Klimarisiken kapitalmarktfähig zu beschreiben. Die WÖk ergänzt die Rückkopplung in reale Entscheidungen.",
    limits: "Finanzmarktrelevanz ist nicht identisch mit positiver Netto-Wirkung.",
    official: [
      ["TNFD", "https://tnfd.global/"],
      ["ISSB / IFRS Sustainability", "https://www.ifrs.org/groups/international-sustainability-standards-board/"],
    ],
    related: ["Kapitalwirkung", "Biodiversität", "Wirkungsrisiko"],
  },
  {
    id: "espr-dpp",
    title: "ESPR und Digitaler Produktpass",
    subtitle: "Produktdaten, Ökodesign und Datenräume",
    group: "produkte-kreislauf",
    summary: "Die ESPR schafft den Rahmen für nachhaltigere Produktgestaltung und digitale Produktpässe.",
    regulates: "Produktanforderungen, Informationspflichten und die Grundlage für DPP-Anforderungen je Produktgruppe.",
    data: "Materialien, Haltbarkeit, Reparierbarkeit, Rezyklatanteile, Umweltdaten, Konformitätsinformationen.",
    woek: "DPP-Daten können zur Grundlage für Produktwirkung, WÖk-ID, Scorecards, Reverse Merit Order und Wirkungssteuer werden.",
    limits: "Ein Produktpass liefert Daten. Er bewertet nicht automatisch alle sozialen, ökologischen und demokratischen Wirkungen.",
    official: [
      ["EU-Kommission: Digital Product Passport consultation", "https://single-market-economy.ec.europa.eu/news/commission-launches-consultation-digital-product-passport-2025-04-09_en"],
      ["EUR-Lex DE: Verordnung (EU) 2024/1781", "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32024R1781"],
    ],
    related: ["Digitaler Produktpass", "Produktscorecard", "Reverse Merit Order"],
  },
  {
    id: "batterieverordnung",
    title: "EU-Batterieverordnung",
    subtitle: "Batteriepass, Rücknahme und Kreislaufdaten",
    group: "produkte-kreislauf",
    summary: "Die EU-Batterieverordnung regelt Nachhaltigkeit, Sicherheit, Kennzeichnung und Kreislaufanforderungen für Batterien.",
    regulates: "CO2-Fußabdruck, Rezyklatanteile, Sorgfaltspflichten, Sammlung, Rücknahme, Recycling und Batteriepass.",
    data: "Batteriepassdaten, Materialdaten, CO2-Fußabdruck, Recycling- und Sorgfaltsinformationen.",
    woek: "Sie ist ein konkretes Beispiel dafür, wie Produktdaten, Rücknahme und Kreislaufwirtschaft in Wirkungslogik übersetzt werden können.",
    limits: "Batteriedaten sind produktgruppenspezifisch und müssen in eine breitere Wirkungsbewertung eingebettet werden.",
    official: [
      ["EUR-Lex DE: Verordnung (EU) 2023/1542", "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32023R1542"],
      ["EU-Kommission: Batteries", "https://environment.ec.europa.eu/topics/waste-and-recycling/batteries_en"],
    ],
    related: ["DPP", "Kreislaufwirtschaft", "Produktwirkung"],
  },
  {
    id: "kreislaufwirtschaftsgesetz",
    title: "Kreislaufwirtschaftsgesetz",
    subtitle: "Abfallvermeidung, Wiederverwendung und Recycling in Deutschland",
    group: "produkte-kreislauf",
    summary: "Das deutsche Kreislaufwirtschaftsgesetz setzt den Rahmen für Abfallvermeidung, Verwertung und Ressourcenschonung.",
    regulates: "Abfallhierarchie, Produktverantwortung, Verwertung, Beseitigung und Pflichten entlang der Kreislaufwirtschaft.",
    data: "Abfall-, Recycling-, Rücknahme- und Verwertungsdaten.",
    woek: "Für die WÖk ist es Anschluss an Produktwirkung, Rücknahme, Reverse Logistics, 5. P Planet und Wirkungssteuer.",
    limits: "Das Gesetz regelt Abfall und Kreisläufe, aber nicht vollständig alle vorgelagerten Produktwirkungen.",
    official: [
      ["Gesetze im Internet: KrWG", "https://www.gesetze-im-internet.de/krwg/"],
      ["BMUV: Kreislaufwirtschaft", "https://www.bmuv.de/themen/kreislaufwirtschaft"],
    ],
    related: ["5. P Planet", "Produktwirkung", "DPP"],
  },
  {
    id: "csddd-lieferketten",
    title: "CSDDD und Lieferkettensorgfalt",
    subtitle: "Menschenrechte, Umwelt und Wertschöpfungsketten",
    group: "produkte-kreislauf",
    summary: "Die CSDDD regelt unternehmerische Sorgfaltspflichten für Menschenrechte und Umwelt in Tätigkeiten und Wertschöpfungsketten.",
    regulates: "Risikoanalyse, Prävention, Abhilfe, Monitoring, Beschwerdeverfahren und Klimaplanbezug.",
    data: "Lieferkettenrisiken, Maßnahmen, Abhilfe, Menschenrechts- und Umweltrisiken.",
    woek: "Lieferkettenwirkung wird sichtbar: Wer profitiert, wer trägt Kosten, und welche Schäden bleiben sonst ausgelagert?",
    limits: "Sorgfaltspflichtdaten sind Voraussetzung, aber noch keine vollständige Netto-Wirkungsbewertung.",
    official: [
      ["EU-Kommission: Corporate sustainability due diligence", "https://commission.europa.eu/business-economy-euro/doing-business-eu/corporate-sustainability-due-diligence_en"],
      ["EUR-Lex DE: Richtlinie (EU) 2024/1760", "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32024L1760"],
      ["BAFA: Lieferkettengesetz", "https://www.bafa.de/DE/Lieferketten/lieferketten_node.html"],
    ],
    related: ["Lieferketten", "Menschenrechte", "Wirkungsrisiko"],
  },
  {
    id: "ai-act",
    title: "EU AI Act",
    subtitle: "Risikobasierte KI-Regulierung",
    group: "digital-ki",
    summary: "Der AI Act ist der EU-Rechtsrahmen für künstliche Intelligenz mit risikobasierten Pflichten.",
    regulates: "Verbotene Praktiken, Hochrisiko-KI, Transparenzpflichten, General-Purpose-AI und Governance.",
    data: "KI-Systeminformationen, Risikoklassifikation, technische Dokumentation, Transparenz- und Monitoringdaten.",
    woek: "Die WÖk fragt ergänzend, welche Wirkungen KI auf Arbeit, Einkommen, Medien, Vertrauen, Diskurs, Macht und Institutionen auslöst.",
    limits: "Compliance mit dem AI Act bedeutet nicht automatisch positive Netto-Wirkung.",
    official: [
      ["AI Act Service Desk: Explorer", "https://ai-act-service-desk.ec.europa.eu/en/ai-act-explorer"],
      ["EUR-Lex DE: Verordnung (EU) 2024/1689", "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32024R1689"],
    ],
    related: ["Wirkungsdatenraum", "Folgencheck", "Medienwirkung"],
  },
  {
    id: "dsa-dma",
    title: "DSA und DMA",
    subtitle: "Plattformregulierung, Transparenz und Gatekeeper",
    group: "digital-ki",
    summary: "Digital Services Act und Digital Markets Act strukturieren Plattformverantwortung, Transparenz und Marktmacht.",
    regulates: "Plattformpflichten, Risikobewertung, Transparenz, illegale Inhalte, Werbung, Gatekeeper-Pflichten und Wettbewerb.",
    data: "Transparenzberichte, Risikobewertungen, Werbe- und Moderationsdaten, Plattformmetriken.",
    woek: "Wichtig für Medienwirkung, Resonanzräume, Desinformation, demokratische Stabilität und digitale Selbstbestimmung.",
    limits: "DSA/DMA regulieren Plattformen. Sie liefern noch keine vollständige Folgenbewertung jeder Kommunikationswirkung.",
    official: [
      ["EU-Kommission: Digital Services Act", "https://digital-strategy.ec.europa.eu/en/policies/digital-services-act-package"],
      ["EUR-Lex DE: DSA Verordnung (EU) 2022/2065", "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32022R2065"],
      ["EUR-Lex DE: DMA Verordnung (EU) 2022/1925", "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32022R1925"],
    ],
    related: ["Medienwirkung", "Folgencheck", "Resonanzraum"],
  },
  {
    id: "data-act",
    title: "EU Data Act",
    subtitle: "Datenzugang und Datennutzung",
    group: "digital-ki",
    summary: "Der Data Act regelt Zugang zu und Nutzung von Daten, insbesondere aus vernetzten Produkten und Diensten.",
    regulates: "Datenzugang, Datenweitergabe, Rechte von Nutzer:innen, Cloud-Wechsel und öffentliche Datennutzung in Ausnahmesituationen.",
    data: "Nutzungs-, Produkt-, Maschinen- und IoT-Daten.",
    woek: "Für WÖk-Datenräume relevant, weil Wirkungsmessung Datenzugang, Zweckbindung und Schutz braucht.",
    limits: "Mehr Daten bedeuten nicht automatisch bessere Wirkung. Datenschutz, Qualität und Zweckbindung bleiben entscheidend.",
    official: [
      ["EU-Kommission: Data Act", "https://digital-strategy.ec.europa.eu/en/policies/data-act"],
      ["EUR-Lex DE: Verordnung (EU) 2023/2854", "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32023R2854"],
    ],
    related: ["Wirkungsdatenraum", "Digitaler Produktpass", "Datenqualität"],
  },
  {
    id: "ipcc",
    title: "IPCC Reports",
    subtitle: "Klimawissenschaftliche Referenz",
    group: "wissenschaft",
    summary: "IPCC-Berichte bündeln wissenschaftlichen Kenntnisstand zu Klimawandel, Risiken, Anpassung und Minderung.",
    regulates: "IPCC reguliert nicht. Die Berichte sind wissenschaftliche Referenz für politische und wirtschaftliche Entscheidungen.",
    data: "Klimarisiken, Emissionspfade, Szenarien, Folgen, Anpassung, Minderungsoptionen.",
    woek: "IPCC ist wichtig, weil Klimawirkung nicht ideologisch, sondern wissenschaftlich referenziert werden muss.",
    limits: "IPCC liefert Evidenz und Szenarien, aber keine fertige nationale Steuer- oder Produktlogik.",
    official: [
      ["IPCC Reports", "https://www.ipcc.ch/reports/"],
      ["Deutsche IPCC-Koordinierungsstelle", "https://www.de-ipcc.de/"],
    ],
    related: ["Klima", "Risikomanagement", "Planet"],
  },
  {
    id: "ipbes",
    title: "IPBES",
    subtitle: "Biodiversität und Ökosystemleistungen",
    group: "wissenschaft",
    summary: "IPBES bündelt Wissen zu Biodiversität, Ökosystemleistungen und Naturverlust.",
    regulates: "IPBES reguliert nicht. Es liefert wissenschaftliche Bewertungen für Natur, Biodiversität und Ökosystemleistungen.",
    data: "Biodiversitätszustand, Ökosystemleistungen, Treiber des Naturverlusts, Szenarien und Handlungsoptionen.",
    woek: "Wichtig für Produktwirkung, Landnutzung, Ernährung, Wasser, Gesundheit und planetare Grenzen.",
    limits: "Die Berichte müssen in konkrete Daten-, Preis-, Beschaffungs- und Politikinstrumente übersetzt werden.",
    official: [
      ["IPBES", "https://www.ipbes.net/"],
      ["IPBES Assessments", "https://www.ipbes.net/assessments"],
    ],
    related: ["Biodiversität", "One Health", "Produktwirkung"],
  },
  {
    id: "sdgs-agenda-2030",
    title: "SDGs und Agenda 2030",
    subtitle: "Globaler Zielrahmen nachhaltiger Entwicklung",
    group: "sdg",
    summary: "Die 17 UN-Nachhaltigkeitsziele sind der globale Referenzrahmen, an den die WÖk anschließt.",
    regulates: "Die SDGs regulieren nicht unmittelbar. Sie beschreiben Ziele und Unterziele für nachhaltige Entwicklung.",
    data: "Globale, europäische, deutsche und kommunale SDG-Indikatoren.",
    woek: "Die WÖk nutzt SDGs als Bewertungsrahmen: Wirkung wird daran eingeordnet, ob sie Mensch und Planet stärkt oder schwächt.",
    limits: "SDGs allein erzeugen keine Rückkopplung in Preise, Steuern, Kapital oder Entscheidungen.",
    official: [
      ["UN Sustainable Development Goals", "https://sdgs.un.org/goals"],
      ["SDG-Portal für Kommunen", "https://sdg-portal.de/de/"],
      ["WÖk: SDGs & SDG+", "/verstehen/sdgs-sdgplus/"],
    ],
    related: ["SDG+", "Wirkungsbewertung", "Referenzrahmen"],
  },
  {
    id: "sdg-plus",
    title: "SDG+",
    subtitle: "WÖk-Erweiterung für Demokratie und Institutionen",
    group: "sdg",
    summary: "SDG+ ergänzt die SDGs um demokratische, mediale, rechtsstaatliche und digitale Voraussetzungen.",
    regulates: "SDG+ ist keine amtliche Regulierung, sondern ein transparenter WÖk-Erweiterungsrahmen.",
    data: "Demokratie-, Medienqualitäts-, Rechtsstaats-, Vertrauens-, Diskurs- und digitale Selbstbestimmungsindikatoren.",
    woek: "Ohne demokratische und institutionelle Stabilität können nachhaltige Ziele nicht dauerhaft erreicht werden.",
    limits: "SDG+ muss transparent, überprüfbar und demokratisch kontrolliert bleiben.",
    official: [
      ["WÖk: SDG+ verstehen", "/verstehen/sdgs-sdgplus/#sdgplus"],
      ["WÖk: SDG+ Demokratie", "/verstehen/sdgs-sdgplus/sdgplus-demokratie/"],
    ],
    related: ["Demokratie", "Medienwirkung", "Wirkungskompetenz"],
  },
];

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function layout({ title, description, canonical, body, depth = "../../" }) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)} - Wirkungsökonomie</title>
    <meta name="description" content="${esc(description)}">
    <link rel="canonical" href="https://wirkungsoekonomie.de/${canonical}">
    <meta name="search_title" content="${esc(title)}">
    <meta name="search_description" content="${esc(description)}">
    <meta name="search_type" content="Referenz">
    <meta name="search_section" content="Regeln und Standards">
    <meta name="search_tags" content="CSRD, ESRS, DPP, Digitaler Produktpass, AI Act, EBA, IPCC, Kreislaufwirtschaft, SDGs, EU-Taxonomie, SFDR, CSDDD">
    <link rel="icon" href="${depth}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${depth}assets/css/style.css?v=20260526-regulatory-hub">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="${depth}index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="${depth}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon" aria-hidden="true">☰</span>
        <span class="sr-only">Menü</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation"></nav>
    </header>
    <main data-pagefind-body>
${body}
    </main>
    <footer class="footer">
      <div class="footer-grid">
        <div><p class="hero-kicker">Wirkungsökonomie</p><h2>Die neue Ordnung des Wohlstands</h2><p>Website der Wirkungsökonomie: ein Wissens- und Anwendungsraum, der Wirkung auf Mensch, Planet und Demokratie sichtbar macht.</p></div>
        <a class="btn btn-primary" href="${depth}verstehen/regularien-standards/">Regeln & Standards ansehen</a>
      </div>
    </footer>
    <script src="${depth}assets/js/main.js" defer></script>
  </body>
</html>
`;
}

function chipList(items) {
  return `<div class="tag-list">${items.map((item) => `<span class="tag">${esc(item)}</span>`).join("")}</div>`;
}

function hub() {
  const groupCards = groups
    .map(([id, title, text]) => {
      const count = standards.filter((item) => item.group === id).length;
      return `<a class="card" href="#${id}"><p class="card-kicker">${count} Einträge</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p><span class="text-link">Cluster ansehen</span></a>`;
    })
    .join("");
  const sections = groups
    .map(([id, title, text]) => {
      const cards = standards
        .filter((item) => item.group === id)
        .map((item) => `<article class="card is-document-card">
          <p class="card-kicker">${esc(item.subtitle)}</p>
          <h3 class="card-title">${esc(item.title)}</h3>
          <p class="card-text">${esc(item.summary)}</p>
          <p class="formula-note"><strong>WÖk-Relevanz:</strong> ${esc(item.woek)}</p>
          ${chipList(item.related.slice(0, 4))}
          <a class="text-link" href="${item.id}/">Detailseite lesen</a>
        </article>`)
        .join("");
      return `<section class="section" id="${id}"><div class="section-header"><p class="hero-kicker">Cluster</p><h2>${esc(title)}</h2><p>${esc(text)}</p></div><div class="card-grid three">${cards}</div></section>`;
    })
    .join("");
  return layout({
    title: "Regeln, Standards und Studien",
    description: "Öffentliche Landkarte zu CSRD, ESRS, DPP, AI Act, EBA, Kreislaufwirtschaft, SDGs, IPCC und weiteren Referenzen der Wirkungsökonomie.",
    canonical: "verstehen/regularien-standards/",
    depth: "../../",
    body: `
      <section class="hero">
        <div class="hero-copy">
          <nav class="breadcrumb"><a href="../../index.html">Start</a> / <a href="../sdgs-sdgplus/">Verstehen</a></nav>
          <p class="hero-kicker">Regeln & Standards</p>
          <h1 class="hero-title">Welche Regularien, Standards und Studien für die WÖk wichtig sind.</h1>
          <p class="hero-subtitle">Diese Landkarte bündelt die vorhandenen europäischen Regeln, internationalen Standards, Finanzmarktanforderungen und wissenschaftlichen Referenzen, die für Wirkungsdaten, Produktwirkung, Kapitalwirkung und Rückkopplung relevant sind.</p>
          <p class="card-text">Wichtig: Diese Seite ersetzt keine Rechtsberatung. Sie erklärt, was die Rahmen leisten, welche Daten sie erzeugen und warum sie für die Wirkungsökonomie relevant sind.</p>
          <div class="hero-actions"><a class="btn btn-primary" href="#eu-reporting">Cluster ansehen</a><a class="btn btn-secondary" href="../../methodik/datenbasis.html">Datenbasis verstehen</a></div>
        </div>
      </section>
      <section class="section section-soft">
        <div class="section-header"><p class="hero-kicker">Orientierung</p><h2>Regeln liefern Daten. Die WÖk fragt nach Wirkung.</h2><p>CSRD, ESRS, DPP, AI Act oder EBA-Leitlinien sind keine Wirkungsökonomie. Sie sind Anschlussräume: Sie machen Daten, Pflichten, Risiken und Vergleichspunkte sichtbar. Die WÖk übersetzt diese Informationen in Wirkung, Schutzgrenzen und Rückkopplung.</p></div>
        <div class="card-grid three">${groupCards}</div>
      </section>
      ${sections}
      <section class="section" id="anschluss">
        <div class="card"><p class="hero-kicker">Wie weiter?</p><h2>Von Regulierung zu Wirkung</h2><p>Die zentrale WÖk-Frage lautet: Welche Daten aus diesen Rahmen können helfen, Wirkung auf Mensch, Planet und Demokratie sichtbar, prüfbar und korrigierbar zu machen?</p><div class="portal-card-actions"><a class="btn btn-primary" href="../../workflow.html">Von Daten zum Steuersatz</a><a class="btn btn-secondary" href="../../glossar.html#daten-standards-title">Begriffe im Glossar</a><a class="btn btn-secondary" href="../../werkzeuge/impact-controlling/">Impact Controlling</a></div></div>
      </section>
`,
  });
}

function detail(item) {
  const official = item.official
    .map(([label, href]) => `<li><a class="text-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a></li>`)
    .join("");
  return layout({
    title: item.title,
    description: item.summary,
    canonical: `verstehen/regularien-standards/${item.id}/`,
    depth: "../../../",
    body: `
      <section class="hero">
        <div class="hero-copy">
          <nav class="breadcrumb"><a href="../../../index.html">Start</a> / <a href="../">Regeln & Standards</a></nav>
          <p class="hero-kicker">Regel / Standard / Referenz</p>
          <h1 class="hero-title">${esc(item.title)}</h1>
          <p class="hero-subtitle">${esc(item.subtitle)}</p>
          <p class="card-text">${esc(item.summary)}</p>
          <div class="hero-actions"><a class="btn btn-primary" href="../">Zur Landkarte</a><a class="btn btn-secondary" href="#official">Offizielle Quellen</a></div>
        </div>
      </section>
      <section class="section section-soft">
        <div class="card-grid two">
          <article class="card"><p class="card-kicker">Worum geht es?</p><h2 class="card-title">Was reguliert oder beschreibt das?</h2><p class="card-text">${esc(item.regulates)}</p></article>
          <article class="card"><p class="card-kicker">Daten</p><h2 class="card-title">Welche Informationen entstehen?</h2><p class="card-text">${esc(item.data)}</p></article>
          <article class="card"><p class="card-kicker">WÖk-Relevanz</p><h2 class="card-title">Warum ist das für die Wirkungsökonomie wichtig?</h2><p class="card-text">${esc(item.woek)}</p></article>
          <article class="card"><p class="card-kicker">Grenzen</p><h2 class="card-title">Was leistet es nicht?</h2><p class="card-text">${esc(item.limits)}</p></article>
        </div>
      </section>
      <section class="section" id="official">
        <div class="card"><p class="hero-kicker">Offizielle Quellen</p><h2>Deutsch / EU / Institutionen</h2><ul class="clean-list">${official}</ul></div>
      </section>
      <section class="section">
        <div class="card"><p class="hero-kicker">Verknüpfungen</p><h2>Passende Begriffe und Seiten</h2>${chipList(item.related)}<div class="portal-card-actions"><a class="btn btn-primary" href="../../../glossar.html">Glossar öffnen</a><a class="btn btn-secondary" href="../../../methodik/datenbasis.html">Datenbasis lesen</a><a class="btn btn-secondary" href="../../../verstehen/sdgs-sdgplus/">SDGs & SDG+</a></div></div>
      </section>
`,
  });
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "index.html"), hub(), "utf8");
for (const item of standards) {
  const dir = path.join(outDir, item.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), detail(item), "utf8");
}

console.log(`Regulatory standards hub built: ${standards.length} detail pages.`);
