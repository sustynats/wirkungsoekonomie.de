import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-05-24";
const CSS_VERSION = "20260524-finanzsystem-kapital";
const JS_VERSION = "20260523-nachhaltigkeit";
const SRC = "docs/finanzsystem-kapital";
const SOURCE = `${SRC}/source`;
const EXTRACT = `${SRC}/docx-extracts`;
const GO13 = `${SRC}/go13-detailkonzepte`;
const GO14 = `${SRC}/go14-detailkonzepte`;

const documents = [
  {
    key: "konzept",
    title: "Konzeptpapier Finanzsystem & Kapital",
    shortTitle: "Konzeptpapier",
    md: `${EXTRACT}/woek_finanzsystem_kapital_konzeptpapier_v0_1.md`,
    downloads: ["woek_finanzsystem_kapital_konzeptpapier_v0_1.docx"],
    description: "Grundkonzept zu Kapitalwirkung, Finanzierbarkeit, Banken, Versicherungen, Wirkungsfonds und Steuerarchitektur.",
  },
  {
    key: "dossier",
    title: "Gesamtdossier Finanzsystem & Kapital",
    shortTitle: "Gesamtdossier",
    md: `${EXTRACT}/woek_finanzsystem_kapital_gesamtdossier_v0_1.md`,
    downloads: ["woek_finanzsystem_kapital_gesamtdossier_v0_1.docx"],
    description: "Dossier mit Beispielen, Berechnungen, Datenquellen, Fondslogik und Toolbezug.",
  },
  {
    key: "detailkonzepte",
    title: "Detailkonzepte Finanzsystem & Kapital",
    shortTitle: "Detailkonzepte",
    md: `${EXTRACT}/woek_finanzsystem_kapital_detailkonzepte_umfangreich_v0_1.md`,
    downloads: ["woek_finanzsystem_kapital_detailkonzepte_umfangreich_v0_1.docx"],
    description: "Umfangreiche Detailkonzepte für alle Unterbereiche des Finanzsystem- und Kapitalportals.",
  },
  {
    key: "dossiers",
    title: "Einzeldossier-Set Finanzsystem & Kapital",
    shortTitle: "Einzeldossier-Set",
    md: `${EXTRACT}/woek_finanzsystem_kapital_einzeldossier_set_v0_1.md`,
    downloads: ["woek_finanzsystem_kapital_einzeldossier_set_v0_1.docx"],
    description: "Einzeldossiers mit Praxisfrage, Beispiel, Bewertungslogik, Datenquellen, Schutzgrenzen und politischer Umsetzung.",
  },
  {
    key: "tools",
    title: "Tool-Spezifikation Finanzsystem- und Kapitalwirkungs-Tool-Suite",
    shortTitle: "Tool-Spezifikation",
    md: `${SOURCE}/tool_spezifikation_finanzsystem_kapital_tool_suite.md`,
    downloads: [
      "tool_spezifikation_finanzsystem_kapital_tool_suite.md",
      "tool_spezifikation_kapitalwirkungs_und_wirkungsfonds_tool_suite.md",
    ],
    description: "Spezifikation der Tool-Suite für Kapitalwirkungscheck, Portfolio-Rating, Wirkungskredite, Fonds und Versicherbarkeit.",
  },
  {
    key: "quellen",
    title: "Quellenregister Finanzsystem & Kapital",
    shortTitle: "Quellenregister",
    md: `${SOURCE}/online_quellenregister_finanzsystem_kapital.md`,
    downloads: [],
    description: "Offizielle und methodische Anschlussquellen zu Banken, ESG, Taxonomie, SFDR, Ratings, Versicherbarkeit und Due Diligence.",
  },
];

const modules = [
  ["kapital-als-wirkungskraft", "Kapital als Wirkungskraft", "Kapital wird vom Machtmittel zur öffentlichen Wirkungskraft. Es dient Regeneration, Innovation, sozialer Stabilität, Demokratie und Resilienz.", "Kapitalwirkungscheck"],
  ["kapitalwirkung-statt-kapitalrendite", "Kapitalwirkung statt Kapitalrendite", "Kapitalrendite fragt nach finanzieller Rückkehr. Kapitalwirkung fragt, welche Zustandsveränderung durch den Kapitaleinsatz entsteht.", "Kapitalwirkungscheck"],
  ["portfolio-wirkungsrating", "Portfolio-Wirkungsrating und Kapitalwirkungsindex", "Portfolios werden nach positiver Netto-Wirkung, roten Linien, Transformation, Resilienz und Datenqualität geprüft.", "Portfolio-Wirkungsrating"],
  ["banken-wirkungskredite", "Banken, Wirkungskredite und EBA-Anschluss", "Banken werden von Sicherheitenlogik zu Zukunftsfinanzierern weiterentwickelt; EBA-ESG-Risiken bilden einen realen Anschluss.", "Wirkungskredit-Rechner"],
  ["versicherungen-resilienz", "Versicherungen, Versicherbarkeit und Resilienz", "Versicherbarkeit wird zum Wirkungsindikator: Schutzlücken zeigen Systemgrenzen, Prävention und Resilienzpfade.", "Versicherbarkeits- und Resilienzcheck"],
  ["esg-ratings-impact-exchange", "ESG-Ratings, Börsen und Impact Exchange", "ESG-Ratings zeigen Risiken, aber nicht automatisch Wirkung. Wirkungskapitalmärkte brauchen Transparenz und Anti-Greenwashing-Schutz.", "ESG-zu-WÖk-Mapping"],
  ["wirkungsfonds", "Wirkungsfonds als Dacharchitektur", "Wirkungsfonds finanzieren Prävention, Transformation, Resilienz, soziale Entlastung und Zukunftsinfrastruktur.", "Wirkungsfonds-Simulator"],
  ["buergerinnenfonds", "Bürger:innenfonds, Wirkungsrente und Teilhabe am Kapital", "Kapitalzugang wird demokratisiert und mit Altersvorsorge, Wirkungsrendite und Beteiligung an Zukunftsinfrastruktur verbunden.", "Wirkungsfonds-Simulator"],
  ["steuer-und-abgabenarchitektur", "Steuer- und Abgabenarchitektur des Kapitals", "Kapitalbezogene Steuer- und Fondslogiken werden systemisch mit WStG, WUStG, WEstG und Wirkungsfonds verknüpft.", "Steuer- und Fondsarchitektur-Modul"],
  ["automatisierungsdividende", "Automatisierungsdividende und Maschinenwertschöpfung", "Produktivitätsgewinne aus KI, Robotik und autonomen Systemen werden sozial und innovationsfreundlich rückgekoppelt.", "Automatisierungsdividenden-Rechner"],
  ["wirkungsaufsicht-kapitalmissbrauch", "Wirkungsaufsicht, Kapitalmissbrauch und toxische Finanzprodukte", "Finanzaufsicht wird um Wirkungsrisiko, algorithmische Kapitalentscheidungen und demokratiegefährdende Finanzprodukte erweitert.", "Kapitalmissbrauchs- und rote-Linien-Check"],
  ["finanzkompetenz-2-0", "Finanzkompetenz 2.0 und demokratische Kontrolle", "Bürger:innen, Analyst:innen, Banken, Fonds und Aufsicht brauchen Wirkungskompetenz, Systemdenken, Datenkompetenz und KI-Finanzethik.", "Finanzkompetenz-Check"],
];

const go13DetailConcepts = [
  {
    number: "30",
    slug: "kapitalwirkung",
    title: "Kapital als Wirkungskraft und Kapitalwirkung statt Kapitalrendite",
    subtitle: "Kapital bleibt Werkzeug, wird aber nicht länger zum Kompass. Entscheidend ist, welche Zustandsveränderung Kapitalflüsse auslösen.",
    md: `${GO13}/online_volltext_30_30_woek_finanzsystem_kapital_kapitalwirkung_statt_kapitalrendite_detailkonzept_v1_0.md`,
    docx: "30_woek_finanzsystem_kapital_kapitalwirkung_statt_kapitalrendite_detailkonzept_v1_0.docx",
    pdf: "30_woek_finanzsystem_kapital_kapitalwirkung_statt_kapitalrendite_detailkonzept_v1_0.pdf",
    tools: ["Kapitalwirkungscheck", "Portfolio-Wirkungsrating", "WÖk-IDs", "Scorecards", "T-SROI"],
  },
  {
    number: "31",
    slug: "wirkungsfonds",
    title: "Wirkungsfonds als Dacharchitektur",
    subtitle: "Wirkungsfonds bündeln Kapital für Prävention, Transformation, Resilienz und Zukunftsinfrastruktur, ohne demokratische Prioritäten durch Kennzahlen zu ersetzen.",
    md: `${GO13}/online_volltext_31_31_woek_finanzsystem_kapital_wirkungsfonds_dacharchitektur_detailkonzept_v1_0.md`,
    docx: "31_woek_finanzsystem_kapital_wirkungsfonds_dacharchitektur_detailkonzept_v1_0.docx",
    pdf: "31_woek_finanzsystem_kapital_wirkungsfonds_dacharchitektur_detailkonzept_v1_0.pdf",
    tools: ["Wirkungsfonds-Simulator", "T-SROI", "NWI", "Wirkungskredit-Rechner", "WÖk-IDs"],
  },
  {
    number: "32",
    slug: "portfolio-banken-versicherungen-kapitalzugang",
    title: "Portfolio-Wirkungsrating, Banken, Versicherungen und Kapitalzugang",
    subtitle: "Portfolio-, Kredit- und Versicherungslogik werden mit Wirkung, Datenqualität, Resilienz und Finanzmarktanforderungen verbunden.",
    md: `${GO13}/online_volltext_32_32_woek_finanzsystem_kapital_portfolio_banken_versicherungen_kapitalzugang_detailkonzept_v1_0.md`,
    docx: "32_woek_finanzsystem_kapital_portfolio_banken_versicherungen_kapitalzugang_detailkonzept_v1_0.docx",
    pdf: "32_woek_finanzsystem_kapital_portfolio_banken_versicherungen_kapitalzugang_detailkonzept_v1_0.pdf",
    tools: ["Portfolio-Wirkungsrating", "Wirkungskredit-Rechner", "Versicherbarkeits-/Resilienzcheck", "ESG-zu-WÖk-Mapping", "KMU-Datencheck / ESG-zu-WÖk-Mapping"],
  },
];

const go14DetailConcepts = [
  {
    number: "33",
    slug: "esg-ratings-boersen-impact-exchange",
    title: "ESG-Ratings, Börsen und Impact Exchange",
    subtitle: "ESG-Ratings werden vom Risikosignal zur überprüfbaren Kapitalwirkungslogik weiterentwickelt: mit Markttransparenz, WÖk-Mapping und Schutz vor Rating-Arbitrage.",
    md: `${GO14}/online_volltext_33_esg-ratings-boersen-impact-exchange_detailkonzept_v1_0.md`,
    docx: "33_woek_finanzsystem_kapital_esg_ratings_boersen_impact_exchange_detailkonzept_v1_0.docx",
    pdf: "33_woek_finanzsystem_kapital_esg_ratings_boersen_impact_exchange_detailkonzept_v1_0.pdf",
    tools: ["ESG-zu-WÖk-Mapping", "Portfolio-Wirkungsrating", "Kapitalwirkungscheck", "WÖk-IDs", "Scorecards"],
  },
  {
    number: "34",
    slug: "buergerinnenfonds-wirkungsrente-kapitalteilhabe",
    title: "Bürger:innenfonds, Wirkungsrente und Teilhabe am Kapital",
    subtitle: "Kapitalteilhabe, Wirkungsrente und Bürger:innenfonds verbinden Vorsorge, Beteiligung und Gemeinwohlfinanzierung ohne Anlageberatung oder Personenbewertung.",
    md: `${GO14}/online_volltext_34_buergerinnenfonds-wirkungsrente-kapitalteilhabe_detailkonzept_v1_0.md`,
    docx: "34_woek_finanzsystem_kapital_buergerinnenfonds_wirkungsrente_kapitalteilhabe_detailkonzept_v1_0.docx",
    pdf: "34_woek_finanzsystem_kapital_buergerinnenfonds_wirkungsrente_kapitalteilhabe_detailkonzept_v1_0.pdf",
    tools: ["Bürger:innenfonds- und Wirkungsdividenden-Simulator", "Wirkungsfonds-Simulator", "Vermögenswirkungscheck", "Erbschaftswirkungscheck", "T-SROI"],
  },
  {
    number: "35",
    slug: "steuer-abgabenarchitektur-kapital",
    title: "Wirkungsorientierte Steuer- und Abgabenarchitektur des Kapitals",
    subtitle: "Kapitalbezogene Steuern, Abgaben und Fonds werden als demokratisch gestaltbare Rückkopplungsarchitektur beschrieben, nicht als fertige Steuerberatung.",
    md: `${GO14}/online_volltext_35_steuer-abgabenarchitektur-kapital_detailkonzept_v1_0.md`,
    docx: "35_woek_finanzsystem_kapital_steuer_abgabenarchitektur_kapital_detailkonzept_v1_0.docx",
    pdf: "35_woek_finanzsystem_kapital_steuer_abgabenarchitektur_kapital_detailkonzept_v1_0.pdf",
    tools: ["Steuerarchitektur-Navigator", "Automatisierungsdividenden-Rechner", "Maschinenwertschöpfungsbeitrag-Rechner", "Vermögenswirkungscheck", "Erbschaftswirkungscheck"],
  },
];

const financeDetailConcepts = [...go13DetailConcepts, ...go14DetailConcepts];

const toolPages = [
  ["kapitalwirkungscheck", "Kapitalwirkungscheck", "Check", "Macht sichtbar, ob eine Kapitalentscheidung positive Netto-Wirkung ermöglicht oder negative Wirkung skaliert.", "Spezifikation online"],
  ["portfolio-wirkungsrating", "Portfolio-Wirkungsrating", "Rating", "Bewertet Portfolios nach NWI, T-SROI, Resilienz, Datenqualität, Transformationspfad und roten Linien.", "Spezifikation online"],
  ["wirkungskredit-rechner", "Wirkungskredit-Rechner", "Rechner", "Ergänzt Kreditlogik um Wirkungsbonus, Negativwirkungsaufschlag, Datenqualität und Transformationspfad.", "Spezifikation online"],
  ["wirkungsfonds-simulator", "Wirkungsfonds-Simulator", "Simulator", "Zeigt Einzahlungen, Auszahlungen, Fondsarchitektur und mögliche Wirkungsnachweise verschiedener Fondsarten.", "Spezifikation online"],
  ["automatisierungsdividenden-rechner", "Automatisierungsdividenden-Rechner", "Rechner", "Modelliert Maschinenwertschöpfung, Produktivitätsgewinne, Sozialrückkopplung und Wirkungsfonds-Beitrag.", "Spezifikation online"],
  ["versicherbarkeits-resilienzcheck", "Versicherbarkeits-/Resilienzcheck", "Check", "Prüft Prävention, Klima-, Standort-, Lieferketten- und Schutzlückenrisiken für Versicherbarkeit und Resilienz.", "Spezifikation online"],
  ["esg-zu-woek-mapping", "ESG-zu-WÖk-Mapping", "Mapping", "Übersetzt ESG-, CSRD-, ESRS-, Taxonomie- und Ratingdaten in wirkungsökonomische Bewertungslogik.", "Spezifikation online"],
];

const contextTools = [
  ...toolPages.map(([slug, title, type, text, status]) => ({ title, type, text, href: `werkzeuge/${slug}/`, status })),
  { title: "KMU-Datencheck / ESG-zu-WÖk-Mapping", type: "Mapping", text: "Übersetzt vorhandene ESG-, CSRD-, ESRS- und KMU-Datenanforderungen in einfache WÖk-Datenpfade.", href: "werkzeuge/esg-zu-woek-mapping/", status: "Demo in Vorbereitung" },
  { title: "Scorecards", type: "Methode", text: "Machen Indikatoren, Gewichtungen, rote Linien und Bewertungslogik für Produkte, Unternehmen und Kapital vergleichbar.", href: "werkzeuge/scorecards/", status: "Erklärung vorhanden" },
  { title: "T-SROI", type: "Methode", text: "Bewertet Transformationswirkung und Systemhebel im Verhältnis zum Ressourceneinsatz.", href: "werkzeuge/impact-controlling/t-sroi/", status: "Erklärung vorhanden" },
  { title: "NWI", type: "Index", text: "Ordnet operative Netto-Wirkung über positive, negative und neutrale Wirkungen ein.", href: "werkzeuge/netto-wirkungs-index/", status: "Erklärung vorhanden" },
  { title: "WÖk-IDs", type: "Datenarchitektur", text: "Verbinden Wirkungsindikatoren, SDGs, SDG+, Quellen, Standards und Bewertungslogik.", href: "werkzeuge/woek-ids/", status: "Erklärung vorhanden" },
  { title: "Reverse Merit Order", type: "Schutzlogik", text: "Sorgt dafür, dass schwere negative Wirkung nicht durch positive Einzelwerte schöngerechnet wird.", href: "werkzeuge/reverse-merit-order/", status: "Erklärung vorhanden" },
  { title: "Maschinenwertschöpfungsbeitrag-Rechner", type: "Rechner", text: "Modelliert, wie Maschinenleistung und Automatisierungsgewinne sozial, fiskalisch und innovationsfreundlich rückgekoppelt werden könnten.", href: "", status: "Demo in Vorbereitung" },
  { title: "Vermögenswirkungscheck", type: "Check", text: "Prüft modellhaft, ob Kapitalbestände positive Netto-Wirkung ermöglichen, blockieren oder risikoreich konzentrieren.", href: "", status: "Demo in Vorbereitung" },
  { title: "Erbschaftswirkungscheck", type: "Check", text: "Ordnet Erbschafts- und Vermögensübergänge nach Teilhabe, Gemeinwohlfinanzierung, Eigentumsschutz und demokratischer Zumutbarkeit ein.", href: "", status: "Demo in Vorbereitung" },
  { title: "Bürger:innenfonds- und Wirkungsdividenden-Simulator", type: "Simulator", text: "Zeigt modellhaft, wie Kapitalerträge, Fondsarchitektur und Wirkungsdividenden für breite Teilhabe zusammenspielen könnten.", href: "", status: "Demo in Vorbereitung" },
  { title: "Steuerarchitektur-Navigator", type: "Navigator", text: "Verknüpft WStG, WUStG, WEstG, kapitalbezogene Steuern, Abgabenlogik und Wirkungsfonds als Orientierungsmodell.", href: "", status: "Demo in Vorbereitung" },
];

const sdgRefs = [
  ["sdg-8", "SDG 8 Menschenwürdige Arbeit", "Kapital entscheidet über gute Arbeit, Automatisierung, Sozialabgabenbasis und Zukunftsbeschäftigung.", "verstehen/sdgs-sdgplus/sdg-8-menschenwuerdige-arbeit-wirtschaftswachstum/"],
  ["sdg-9", "SDG 9 Industrie, Innovation und Infrastruktur", "Finanzierung lenkt industrielle Transformation, Innovationsfähigkeit und resiliente Infrastruktur.", "verstehen/sdgs-sdgplus/sdg-9-industrie-innovation-infrastruktur/"],
  ["sdg-10", "SDG 10 Weniger Ungleichheiten", "Kapitalzugang, Fonds, Bürger:innenbeteiligung und Absicherung beeinflussen Verteilung und Teilhabe.", "verstehen/sdgs-sdgplus/sdg-10-weniger-ungleichheiten/"],
  ["sdg-11", "SDG 11 Nachhaltige Städte und Gemeinden", "Wohnwirkungsfonds, Stadtresilienz und kommunale Investitionen hängen an Kapital- und Versicherungslogik.", "verstehen/sdgs-sdgplus/sdg-11-nachhaltige-staedte-gemeinden/"],
  ["sdg-12", "SDG 12 Nachhaltiger Konsum und Produktion", "Kapital kann Kreislaufwirtschaft, Produktwirkung, Lieferketten und Ressourcenschutz beschleunigen oder blockieren.", "verstehen/sdgs-sdgplus/sdg-12-nachhaltiger-konsum-produktion/"],
  ["sdg-13", "SDG 13 Klimaschutz", "Klimarisiken, Versicherbarkeit, Stranded Assets und Transformationsfinanzierung sind zentrale Kapitalfragen.", "verstehen/sdgs-sdgplus/sdg-13-klimaschutz/"],
  ["sdg-16", "SDG 16 Frieden, Gerechtigkeit und starke Institutionen", "Finanzaufsicht, Anti-Greenwashing, Rechtsstaatlichkeit und Schutz vor demokratiegefährdenden Kapitalflüssen sind direkte Anschlüsse.", "verstehen/sdgs-sdgplus/sdg-16-frieden-gerechtigkeit-starke-institutionen/"],
  ["sdg-17", "SDG 17 Partnerschaften", "Wirkungsfonds, Banken, Versicherungen, EU-Regulierung, Unternehmen und öffentliche Haushalte brauchen koordinierte Partnerschaften.", "verstehen/sdgs-sdgplus/sdg-17-partnerschaften/"],
  ["sdgplus-demokratie", "SDG+ Demokratie", "Kapital darf demokratische Öffentlichkeit, Teilhabe und Korrekturfähigkeit nicht untergraben.", "verstehen/sdgs-sdgplus/#sdgplus-demokratie"],
  ["sdgplus-medienqualitaet", "SDG+ Medienqualität", "Finanzströme in Desinformation, Plattformmacht oder Qualitätsjournalismus haben demokratische Wirkung.", "verstehen/sdgs-sdgplus/#sdgplus-medienqualitaet"],
  ["sdgplus-rechtsstaatlichkeit", "SDG+ Rechtsstaatlichkeit", "Kapitalaufsicht, Rechtsschutz, Transparenz und Eigentumsordnung brauchen verlässliche rechtsstaatliche Grenzen.", "verstehen/sdgs-sdgplus/#sdgplus-rechtsstaatlichkeit"],
  ["sdgplus-institutionelles-vertrauen", "SDG+ institutionelles Vertrauen", "Finanzsysteme brauchen Vertrauen in Daten, Aufsicht, Verfahren, Beschwerdewege und öffentliche Kontrolle.", "verstehen/sdgs-sdgplus/#sdgplus-institutionelles-vertrauen"],
  ["sdgplus-digitale-selbstbestimmung", "SDG+ digitale Selbstbestimmung", "Algorithmische Kredit-, Rating-, Versicherungs- und Kapitalentscheidungen brauchen Datenrechte und Auditierbarkeit.", "verstehen/sdgs-sdgplus/#sdgplus-digitale-selbstbestimmung"],
];

const bookAnchors = [
  ["Kapitel 3 - Kapital als Werkzeug und falscher Kompass", "referenz/kapitel-003-kapital-als-werkzeug-und-falscher-kompass/"],
  ["Kapitel 31 - WÖk-IDs und Indikatorenarchitektur", "referenz/kapitel-031-woek-ids-und-indikatorenarchitektur/"],
  ["Kapitel 32 - Benchmarks, Skalen und Scorecards", "referenz/kapitel-032-benchmarks-skalen-und-scorecards/"],
  ["Kapitel 33 - Reverse Merit Order", "referenz/kapitel-033-reverse-merit-order/"],
  ["Kapitel 34 - T-SROI", "referenz/kapitel-034-t-sroi-und-systemische-transformationsmessung/"],
  ["Kapitel 35 - Digitale Produktpässe und Wirkungsdatenräume", "referenz/kapitel-035-digitale-produktpaesse-und-wirkungsdatenraeume/"],
  ["Kapitel 37-40 - WStG, Wirkungshaushalt und Wirkungsrat", "referenz/"],
  ["Kapitel 58 - Wirkungsrente", "referenz/"],
  ["Kapitel 59 - Kapitalmärkte und Fonds", "referenz/kapitel-059-kapitalmaerkte-und-fonds/"],
  ["Kapitel 98 - Pilotierung, Kommunen und Fonds", "referenz/"],
];

const related = [
  ["Produkte & Konsum", "Wirkungsfeld", "WUStG, Produktwirkung, Scorecards und Lieferketten liefern Daten für Kapitalzugang und Fondsfähigkeit.", "wirkungsfelder/produkte-konsum/"],
  ["Impact Controlling", "Werkzeugbereich", "T-SROI, NWI, WÖk-IDs und Scorecards bilden die Bewertungsgrundlage für Kapitalwirkung.", "werkzeuge/impact-controlling/"],
  ["Staat, Recht & Demokratie", "Wirkungsfeld", "WStG, Wirkungsrat, Wirkungshaushalt und Rechtsschutz rahmen Kapitalrückkopplung demokratisch.", "wirkungsfelder/staat-recht-demokratie/"],
  ["Wirtschaft & Unternehmen", "Wirkungsfeld", "Finanzmarktanforderungen, CSRD/ESRS, Governance, Risiko und Lieferketten verbinden Unternehmen mit Kapitalwirkung.", "wirkungsfelder/wirtschaft-unternehmen/"],
  ["Arbeit & Einkommen", "Wirkungsfeld", "Automatisierung, Maschinenwertschöpfungsbeitrag und Sozialabgaben-Entkopplung brauchen Finanzierungspfade.", "wirkungsfelder/arbeit-einkommen/"],
  ["Rente & soziale Sicherung", "Wirkungsfeld", "Wirkungsrente, Bürger:innenfonds und Renten-Impact-Fonds verbinden Vorsorge mit Kapitalwirkung.", "wirkungsfelder/rente-soziale-sicherung/"],
  ["Gesundheit & Pflege", "Wirkungsfeld", "Gesundheits- und Pflegefonds machen Prävention, Versorgung und Resilienz finanzierbar.", "wirkungsfelder/gesundheit-pflege/"],
  ["Bildung", "Wirkungsfeld", "Bildungsfonds und Wirkungsschule übersetzen Kapital in langfristige Bildungswirkung.", "wirkungsfelder/bildung/"],
  ["Medien & Öffentlichkeit", "Wirkungsfeld", "Demokratie- und Medienfonds schützen Medienqualität, Quellenklarheit und öffentliche Wahrheitsräume.", "wirkungsfelder/medien-oeffentlichkeit/"],
];

const externalSources = [
  ["EBA Guidelines on management of ESG risks", "Anforderungen an Identifikation, Messung, Management und Monitoring von ESG-Risiken; Anwendung ab 11.01.2026, mit gestaffeltem Anschluss für kleine und nicht komplexe Institute.", "https://www.eba.europa.eu/activities/single-rulebook/regulatory-activities/sustainable-finance/guidelines-management-esg-risks"],
  ["EBA Guidelines on loan origination and monitoring", "Kreditvergabe und Monitoring als realer Anschluss für Wirkungskredit- und Transformationsrisikologik.", "https://www.eba.europa.eu/activities/single-rulebook/regulatory-activities/credit-risk/guidelines-loan-origination-and-monitoring"],
  ["European Commission - CSRD / ESRS", "Unternehmensberichterstattung als Datenbasis für Kapitalwirkung, Risiken und Transformationspfade.", "https://finance.ec.europa.eu/financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en"],
  ["EFRAG - ESRS", "Europäische Nachhaltigkeitsberichtsstandards als methodischer Datenanschluss.", "https://www.efrag.org/en/sustainability-reporting"],
  ["European Commission - EU Taxonomy", "Taxonomie als Klassifikation umweltbezogener Wirtschaftsaktivitäten und Finanzierungsanschluss.", "https://finance.ec.europa.eu/sustainable-finance/tools-and-standards/eu-taxonomy-sustainable-activities_en"],
  ["European Commission - SFDR", "Offenlegung nachhaltigkeitsbezogener Informationen im Finanzdienstleistungssektor.", "https://finance.ec.europa.eu/sustainable-finance/disclosures/sustainability-related-disclosure-financial-services-sector_en"],
  ["European Commission - ESG rating activities", "EU-Regulierung für ESG-Ratinganbieter; Transparenz- und Aufsichtsanschluss über ESMA.", "https://finance.ec.europa.eu/sustainable-finance/tools-and-standards/esg-rating-activities_en"],
  ["EIOPA - Managing sustainability risks", "Versicherungs- und Pensionsaufsicht zu Nachhaltigkeitsrisiken, ORSA, Stress Tests und prudenziellem Umgang.", "https://www.eiopa.europa.eu/managing-sustainability-risks_en"],
  ["EIOPA - Addressing protection gaps", "Versicherungsschutzlücken als Hinweis auf Resilienz-, Präventions- und Systemrisiken.", "https://www.eiopa.europa.eu/browse/sustainable-finance/addressing-protection-gaps_en"],
  ["European Commission - Corporate Sustainability Due Diligence", "Lieferketten- und Sorgfaltspflichten als Daten- und Risikorahmen für Kapitalentscheidungen.", "https://commission.europa.eu/business-economy-euro/doing-business-eu/corporate-sustainability-due-diligence_en"],
  ["OECD Due Diligence Guidance", "Leitlinien für verantwortungsvolles unternehmerisches Handeln und Due Diligence.", "https://mneguidelines.oecd.org/OECD-Due-Diligence-Guidance-for-Responsible-Business-Conduct.pdf"],
];

function esc(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
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
    .slice(0, 100);
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function read(rel) {
  return exists(rel) ? fs.readFileSync(path.join(ROOT, rel), "utf8") : "";
}

function write(rel, html) {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${html.replace(/[ \t]+$/gm, "")}\n`, "utf8");
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

function cite(id) {
  return `<a class="cite-anchor no-print" href="#${esc(id)}" aria-label="Zitierlink zu diesem Abschnitt">#</a>`;
}

function h2(id, text) {
  return `<h2 id="${esc(id)}">${esc(text)} ${cite(id)}</h2>`;
}

function safeLines(text) {
  const forbidden = /(CodeX|Codex|Repository|Build|Sitemap|Dateien anlegen|bitte prüfen|Toolaufruf|Prompt|ChatGPT|Python|interne Aufgabe|Abschlussbericht|Umsetzungsanweisung)/i;
  const internal = /(Online-Umsetzung|Online-Fassung dieses Unterbereichs braucht|eigenständige Online-Unterseite|Downloadfassung vorgesehen|öffentliche Website|Diese Datei ist intern)/i;
  return String(text)
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !forbidden.test(line) && !internal.test(line))
    .filter((line) => !/^Online lesen \/ Downloads$/i.test(line))
    .filter((line) => !/^Online-Volltext ist Hauptzugang/i.test(line));
}

function trimCover(text, markers = []) {
  const lines = safeLines(text);
  const index = lines.findIndex((line) => markers.some((marker) => line === marker || line.startsWith(marker)));
  return (index >= 0 ? lines.slice(index) : lines).join("\n\n");
}

function extractBlock(text, startMatchers, stopMatchers) {
  const lines = safeLines(text);
  const start = lines.findIndex((line) => startMatchers.some((match) => line === match || line.startsWith(match)));
  if (start < 0) return "";
  const stop = lines.findIndex((line, index) => index > start && stopMatchers.some((match) => line === match || line.startsWith(match)));
  return lines.slice(start, stop > start ? stop : undefined).join("\n\n");
}

function mdToHtml(markdown, prefix = "") {
  const rawLines = safeLines(markdown);
  const toc = [];
  const html = [];
  const used = new Set();
  let paragraph = [];
  let list = [];
  let table = [];
  let paraIndex = 0;

  const unique = (raw) => {
    const base = `${prefix}${slugify(raw) || "abschnitt"}`;
    let id = base;
    let n = 2;
    while (used.has(id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    used.add(id);
    return id;
  };

  const inline = (value) => {
    const source = String(value).replace(/\*\*/g, "");
    const parts = [];
    const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let last = 0;
    let match;
    while ((match = pattern.exec(source))) {
      parts.push(esc(source.slice(last, match.index)));
      const label = esc(match[1]);
      const link = esc(match[2]);
      const external = /^https?:/.test(link) ? ' target="_blank" rel="noopener noreferrer"' : "";
      parts.push(`<a href="${link}"${external}>${label}</a>`);
      last = match.index + match[0].length;
    }
    parts.push(esc(source.slice(last)));
    return parts.join("");
  };
  const flushParagraph = () => {
    if (!paragraph.length) return;
    paraIndex += 1;
    const id = unique(`absatz-${String(paraIndex).padStart(3, "0")}`);
    html.push(`<p id="${id}">${inline(paragraph.join(" "))} ${cite(id)}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`);
    list = [];
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table
      .map((line) => line.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()))
      .filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)));
    if (rows.length > 1) {
      const [head, ...body] = rows;
      html.push(`<div class="table-wrap" role="region" aria-label="Tabelle: ${esc(head.join(", "))}" tabindex="0"><table class="data-table"><thead><tr>${head.map((cell) => `<th>${inline(cell)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    }
    table = [];
  };
  const heading = (level, text) => {
    flushParagraph(); flushList(); flushTable();
    const clean = text.replace(/\*\*/g, "");
    const id = unique(clean);
    toc.push({ level, text: clean, id });
    html.push(`<h${level} id="${id}">${esc(clean)} ${cite(id)}</h${level}>`);
  };

  for (const line of rawLines) {
    if (line.startsWith("|") && line.endsWith("|")) {
      flushParagraph(); flushList();
      table.push(line);
      continue;
    }
    const mdHeading = line.match(/^(#{1,4})\s+(.+)$/);
    if (mdHeading) {
      heading(Math.max(2, Math.min(4, mdHeading[1].length)), mdHeading[2]);
      continue;
    }
    if (/^\d+\.\s+Einzeldossier:\s+/.test(line)) {
      heading(2, line.replace(/^\d+\.\s+/, ""));
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const text = line.replace(/^\d+\.\s+/, "");
      const isModule = modules.some(([, title]) => text === title);
      heading(isModule ? 2 : 3, text);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flushParagraph(); flushTable();
      list.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }
    if (/^>\s+/.test(line)) {
      flushParagraph(); flushList(); flushTable();
      html.push(`<blockquote><p>${inline(line.replace(/^>\s+/, ""))}</p></blockquote>`);
      continue;
    }
    if (/^(Executive Summary|Kernthese|Kurzthese|Praxisfrage|Beispiel|Datenquellen|Berechnungslogik|Umsetzung und Schutz|Nicht-amtlicher Modellhinweis|Zweck|Module|Eingaben|Modellhafte Ergebnisgrößen|Schutzlinien|Politische Anschlussfähigkeit und Umsetzungsoptionen|Öffentliche Quellen)$/i.test(line)) {
      heading(3, line);
      continue;
    }
    flushList(); flushTable();
    paragraph.push(line);
  }
  flushParagraph(); flushList(); flushTable();
  return { toc, html: html.join("\n") };
}

function toc(items) {
  if (!items.length) return "";
  return `<nav class="toc-card no-print" aria-label="Inhaltsverzeichnis"><h2 class="card-title">Inhaltsverzeichnis</h2><ol>${items.map((item) => `<li class="toc-level-${esc(item.level)}"><a href="#${esc(item.id)}">${esc(item.text)}</a></li>`).join("")}</ol></nav>`;
}

function page({ rel, title, description, section = "Wirkungsfelder", type = "Portal", body }) {
  const base = baseFor(rel);
  const canonical = `${SITE}${routeFor(rel)}`;
  write(rel, `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="search_title" content="${esc(title.replace(/\s+\|.*$/, ""))}">
    <meta name="search_description" content="${esc(description)}">
    <meta name="search_section" content="${esc(section)}">
    <meta name="search_type" content="${esc(type)}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(title.replace(/\s+\|.*$/, ""))}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${SITE}/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260605-wirkungsraum-stage10">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation"><a href="${base}index.html">Start</a></nav>
    </header>
    <main>
      <p class="print-meta">Wirkungsökonomie · ${esc(title.replace(/\s+\|.*$/, ""))} · ${canonical} · Druckdatum: ${DATE}</p>
${body(base)}
    </main>
    <script src="${base}assets/js/main.js?v=20260605-wirkungsraum-stage10"></script>
  </body>
</html>`);
}

function cards(base, items) {
  return `<div class="card-grid three">${items.map(([title, kicker, text, url, label = "Öffnen"]) => `<article class="card"><p class="card-kicker">${esc(kicker)}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p><div class="portal-card-actions">${url ? `<a class="text-link" href="${href(base, url)}">${esc(label)}</a>` : `<span class="badge">in Ausarbeitung</span>`}</div></article>`).join("")}</div>`;
}

function downloadLinks(base, doc) {
  return doc.downloads
    .filter((file) => exists(`assets/downloads/${file}`))
    .map((file) => `<a class="btn btn-secondary" href="${href(base, `assets/downloads/${file}`)}">${esc(doc.shortTitle)} herunterladen</a>`)
    .join("");
}

function go13DownloadLinks(base, concept) {
  return [concept.docx, concept.pdf]
    .filter((file) => exists(`assets/downloads/${file}`))
    .map((file) => `<a class="btn btn-secondary" href="${href(base, `assets/downloads/${file}`)}">${file.endsWith(".pdf") ? "PDF herunterladen" : "Word herunterladen"}</a>`)
    .join("");
}

function go13DownloadBlock(base, concept) {
  const rows = [
    ["DOCX", concept.docx],
    ["PDF", concept.pdf],
  ].map(([type, file]) => `<tr><th scope="row">${esc(type)}</th><td>${exists(`assets/downloads/${file}`) ? `<a href="${href(base, `assets/downloads/${file}`)}">${esc(file)}</a>` : "in Vorbereitung"}</td></tr>`).join("");
  return `<section class="section" aria-labelledby="go13-downloads"><div class="card"><p class="hero-kicker">Download / Export</p>${h2("go13-downloads", "Detailkonzept herunterladen")}<p>Der Online-Volltext ist der Hauptzugang. DOCX und PDF ergänzen die Lesefassung als Export und Archiv.</p><div class="table-wrap" role="region" aria-label="Downloads zum Detailkonzept" tabindex="0"><table class="data-table"><tbody>${rows}</tbody></table></div></div></section>`;
}

function downloads(base) {
  const rows = documents.map((doc) => `<tr><th scope="row">${esc(doc.shortTitle)}</th><td>${doc.key === "quellen" ? "Online-Quellenregister" : "Fassung"}</td><td>${doc.downloads.filter((file) => exists(`assets/downloads/${file}`)).map((file) => `<a href="${href(base, `assets/downloads/${file}`)}">${esc(file)}</a>`).join("<br>") || "Kein separater Download erforderlich"}</td></tr>`).join("");
  return `<section class="section" aria-labelledby="downloads"><div class="card"><p class="hero-kicker">Dossier & Export</p>${h2("downloads", "Downloads und Druck")}<p>Online-Volltext ist der Hauptzugang. Word- und Markdown-Dateien bleiben ergänzende Export- und Archivfassungen.</p><div class="table-wrap" role="region" aria-label="Downloadbereich" tabindex="0"><table class="data-table"><thead><tr><th>Dokument</th><th>Fassung</th><th>Download</th></tr></thead><tbody>${rows}</tbody></table></div><div class="portal-card-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button></div></div></section>`;
}

function documentUrl(doc) {
  return doc.key === "tools" ? "wirkungsfelder/finanzsystem-kapital/tools/" : `wirkungsfelder/finanzsystem-kapital/${doc.key}/`;
}

function publicationAccess(base) {
  const detailItems = financeDetailConcepts.map((concept) => [concept.title, "Detailkonzept v1.0", concept.subtitle, `wirkungsfelder/finanzsystem-kapital/${concept.slug}/`, "Online lesen"]);
  const items = [...detailItems, ...documents.map((doc) => [doc.shortTitle, "Online-Volltext", doc.description, documentUrl(doc), "Online lesen"])];
  const detailRows = financeDetailConcepts.map((concept) => `<tr><th scope="row">${esc(concept.title)}</th><td><a href="${href(base, `wirkungsfelder/finanzsystem-kapital/${concept.slug}/`)}">online lesen</a></td><td>${[concept.docx, concept.pdf].filter((file) => exists(`assets/downloads/${file}`)).map((file) => `<a href="${href(base, `assets/downloads/${file}`)}">${esc(file)}</a>`).join("<br>")}</td></tr>`).join("");
  const tableRows = `${detailRows}${documents.map((doc) => `<tr><th scope="row">${esc(doc.shortTitle)}</th><td><a href="${href(base, documentUrl(doc))}">online lesen</a></td><td>${doc.downloads.filter((file) => exists(`assets/downloads/${file}`)).map((file) => `<a href="${href(base, `assets/downloads/${file}`)}">${esc(file)}</a>`).join("<br>") || "Online-Seite"}</td></tr>`).join("")}`;
  return `<section class="section" id="publikationszugang" aria-labelledby="publikationszugang-title"><div class="section-header"><p class="hero-kicker">Publikationszugang</p>${h2("publikationszugang-title", "Online lesen und herunterladen")}<p>Alle zentralen Dokumente sind online lesbar und über Abschnittsanker zitierfähig. Downloads sind Export und Archiv, nicht der Hauptzugang.</p></div>${cards(base, items)}<div class="table-wrap no-print" role="region" aria-label="Publikationszugang: Online lesen und herunterladen" tabindex="0"><table class="data-table"><thead><tr><th>Dokument</th><th>Online lesen</th><th>Download</th></tr></thead><tbody>${tableRows}</tbody></table></div></section>`;
}

function go13DetailGrid(base) {
  return `<section class="section" aria-labelledby="finance-detailkonzepte"><div class="section-header"><p class="hero-kicker">Vertiefungen v1.0</p>${h2("finance-detailkonzepte", "Echte Detailkonzepte zu Finanzsystem & Kapital")}<p>Diese Fassungen sind fachliche Vertiefungen mit vollständigem Online-Volltext. Bestehende Portaltexte bleiben als Einstieg und Themenlandkarte erhalten.</p></div><div class="card-grid three">${financeDetailConcepts.map((concept) => `<article class="card"><p class="card-kicker">Detailkonzept · v1.0</p><h3 class="card-title">${esc(concept.title)}</h3><p class="card-text">${esc(concept.subtitle)}</p><div class="portal-card-actions"><a class="text-link" href="${href(base, `wirkungsfelder/finanzsystem-kapital/${concept.slug}/`)}">Online lesen</a><a class="text-link" href="${href(base, `assets/downloads/${concept.pdf}`)}">PDF</a><a class="text-link" href="${href(base, `assets/downloads/${concept.docx}`)}">Word</a></div></article>`).join("")}</div></section>`;
}

function sdgBadge(base, [id, label, text, url], index) {
  const popover = `sdg-popover-${id}-finanz-${index}`;
  return `<span class="sdg-ref" data-sdg-id="${esc(id)}"><a class="sdg-ref-link" href="${href(base, url)}" aria-label="${esc(label)}: ${esc(text)}" aria-describedby="${esc(popover)}">${esc(label)}</a><button class="sdg-ref-info" type="button" aria-label="Kurzbeschreibung zu ${esc(label)}: ${esc(text)}" aria-describedby="${esc(popover)}">i</button><span class="sdg-ref-popover" id="${esc(popover)}" role="tooltip">${esc(text)} <span class="sdg-ref-more">Details öffnen</span></span></span>`;
}

function referenceBlock(base) {
  return `<section class="section" aria-labelledby="sdg-ref"><div class="portal-reference-block"><p class="hero-kicker">Referenzrahmen</p>${h2("sdg-ref", "SDG-/SDG+-Bezug")}<div class="model-strip">${sdgRefs.map((item, index) => sdgBadge(base, item, index)).join("")}</div><p>SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie für demokratische, rechtsstaatliche, mediale, institutionelle und digitale Voraussetzungen positiver Netto-Wirkung.</p><a class="text-link" href="${href(base, "verstehen/sdgs-sdgplus/")}">Alle SDGs und SDG+ im Referenzrahmen ansehen</a></div></section>`;
}

function politicalBlock() {
  const rows = [
    ["Aufgabe der Politik", "Kapitalmärkte so rahmen, dass Risiko, Resilienz und positive Netto-Wirkung für Mensch, Planet und Demokratie in Kapitalzugang, Aufsicht, Steuern und Fonds sichtbar werden."],
    ["Politische Rahmenbedingungen", "CSRD/ESRS-Anschluss, Finanzaufsicht, ESG-Rating-Transparenz, Fondsregeln, Steuerrecht, Datenschutz, Rechtsschutz und proportionale Berichtspflichten."],
    ["Ausgestaltungsspielraum", "Parteien können Tempo, Verbindlichkeit, Freibeträge, Fondsstrukturen, öffentliche oder private Träger, Übergangsfristen und Sozialausgleich unterschiedlich gestalten."],
    ["Zielkonflikte", "Kapitalmobilität, Standortwettbewerb, Eigentumsschutz, Finanzstabilität, Innovationsfreiheit, Bürokratie, Datenschutz und soziale Gerechtigkeit müssen demokratisch austariert werden."],
    ["Rollenverteilung", "EU, Bund, BaFin, EZB, EBA, EIOPA, ESMA, Länder, Kommunen, Banken, Versicherungen, Fonds, Unternehmen, Wissenschaft und Zivilgesellschaft tragen unterschiedliche Verantwortung."],
    ["Übergang und Schutz", "KMU, Sparkassen, Genossenschaftsbanken, Sozialunternehmen und Haushalte brauchen einfache Datenpfade, Übergangsfristen, Härtefallregeln, Anti-Greenwashing-Schutz und Korrekturwege."],
    ["Evaluation und Korrektur", "Wirkungsberichte, Stresstests, Revisionszyklen, Wirkungsrat, öffentliche Konsultation, unabhängige Assurance und Fehlerkultur halten das System lernfähig."],
    ["Parteipolitische Anschlussfähigkeit", "Marktbasierte, sozialstaatliche, kommunale, fondsorientierte, unternehmensbezogene und europäische Wege bleiben möglich."],
    ["Schutz vor Technokratie", "Wirkungsdaten bereiten Entscheidungen vor, ersetzen sie aber nicht. Normative Entscheidungen bleiben demokratisch legitimiert; bewertet werden Kapitalflüsse, Produkte und Strukturen, nicht Menschen."],
  ];
  return `<section class="section" aria-labelledby="political-implementation"><div class="section-header"><p class="hero-kicker">Demokratische Umsetzung</p>${h2("political-implementation", "Politische Anschlussfähigkeit und Umsetzungsoptionen")}<p>Die folgenden politischen Anforderungen beschreiben keinen fertigen Parteibeschluss. Sie markieren den Rahmen, damit Finanzsystem und Kapital demokratisch, rechtsstaatlich und praktisch umgesetzt werden können.</p></div><div class="table-wrap" role="region" aria-label="Politische Anschlussfähigkeit" tabindex="0"><table class="data-table"><tbody>${rows.map(([a, b]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td></tr>`).join("")}</tbody></table></div></section>`;
}

function toolGrid(base) {
  const items = contextTools.map((tool) => [tool.title, `${tool.type} · ${tool.status}`, tool.text, tool.href, "Toolseite öffnen"]);
  return `<section class="section" aria-labelledby="tools"><div class="section-header"><p class="hero-kicker">Kontext-Werkzeuge</p>${h2("tools", "Werkzeuge in diesem Bereich")}<p>Die Werkzeuge sind Modell- und Planungshilfen. Sie ersetzen keine Anlageberatung, keine Kreditentscheidung, keine Steuerberatung, kein Versicherungsrating und keine Aufsichtsentscheidung.</p></div>${cards(base, items)}</section>`;
}

function go13ToolGrid(base, concept) {
  const wanted = new Set(concept.tools);
  const tools = contextTools.filter((tool) => wanted.has(tool.title));
  return `<section class="section" aria-labelledby="tools"><div class="section-header"><p class="hero-kicker">Kontext-Werkzeuge</p>${h2("tools", "Werkzeuge zu diesem Detailkonzept")}<p>Die Werkzeuge sind Modell- und Planungshilfen. Sie ersetzen keine Anlageberatung, keine Kreditentscheidung, keine Steuerberatung, kein Versicherungsrating und keine Aufsichtsentscheidung.</p></div>${cards(base, tools.map((tool) => [tool.title, `${tool.type} · ${tool.status}`, tool.text, tool.href, "Toolseite öffnen"]))}</section>`;
}

function moduleGrid(base) {
  return `<section class="section" aria-labelledby="unterbereiche"><div class="section-header"><p class="hero-kicker">Unterbereiche</p>${h2("unterbereiche", "Zentrale Unterbereiche online lesen")}<p>Jeder Unterbereich besitzt eine eigene Online-Seite mit Detailkonzept, Einzeldossier, Downloads, SDG-/SDG+-Block, Buchankern und Toolbezug.</p></div><div class="card-grid three">${modules.map(([slug, title, text]) => `<article class="card"><p class="card-kicker">Detailkonzept + Dossier</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p><div class="portal-card-actions"><a class="text-link" href="${href(base, `wirkungsfelder/finanzsystem-kapital/${slug}/`)}">Online lesen</a><a class="text-link" href="${href(base, `wirkungsfelder/finanzsystem-kapital/detailkonzepte/#detail-${slugify(title)}`)}">Detailkonzept</a><a class="text-link" href="${href(base, `wirkungsfelder/finanzsystem-kapital/dossiers/#dossier-einzeldossier-${slugify(title)}`)}">Dossier</a></div></article>`).join("")}</div></section>`;
}

function bookBlock(base) {
  return `<section class="section" aria-labelledby="buch"><div class="section-header"><p class="hero-kicker">Online-Buch</p>${h2("buch", "Anker im Online-Buch")}</div><div class="model-strip">${bookAnchors.map(([label, url]) => `<a href="${href(base, url)}">${esc(label)}</a>`).join("")}</div></section>`;
}

function sourcesBlock() {
  return `<section class="section" aria-labelledby="quellen"><div class="card"><p class="hero-kicker">Quellen</p>${h2("quellen", "Quellen und regulatorische Anschlussstellen")}<p>Externe Referenzen dienen als belastbare Anschlussquellen. Externe Links öffnen in einem neuen Tab.</p><div class="card-grid three">${externalSources.map(([label, text, url]) => `<article class="card"><h3 class="card-title">${esc(label)}</h3><p class="card-text">${esc(text)}</p><a class="text-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Externe Quelle öffnen</a></article>`).join("")}</div></div></section>`;
}

function relatedBlock(base) {
  return `<section class="section" aria-labelledby="vernetzung"><div class="section-header"><p class="hero-kicker">Vernetzung</p>${h2("vernetzung", "Verwandte Wirkungsfelder und Werkzeuge")}</div>${cards(base, related)}</section>`;
}

function rankBlock() {
  const rows = [
    ["Produktbesteuerung / WUStG", "Produkte & Konsum + Staat/Recht"],
    ["Impact Controlling / WÖk-IDs", "Werkzeuge"],
    ["WStG / Wirkungsrat / Wirkungshaushalt", "Staat, Recht & Demokratie"],
    ["Unternehmenssteuern / Kapitalmarktdruck", "Wirtschaft & Unternehmen + Finanzsystem & Kapital"],
    ["Sozialabgaben-Entkopplung / Automatisierung", "Arbeit & Einkommen + Unternehmen + Finanzierbarkeit"],
    ["Wirkungsrente", "Rente & soziale Sicherung"],
    ["Bildung, Gesundheit, Wohnen", "Jeweilige Wirkungsfelder plus Finanzierungsseite"],
    ["Wirkungsvermögensteuer / Wirkungserbschaftsteuer", "Finanzsystem & Kapital + Staat/Recht"],
    ["Wirkungsfonds", "Finanzsystem & Kapital als Querschnitt, zusätzlich in allen Fachportalen verlinkt"],
  ];
  return `<section class="section" aria-labelledby="portal-zuordnung"><div class="card"><p class="hero-kicker">Portalzuordnung</p>${h2("portal-zuordnung", "Portal- und Querschnittslogik")}<div class="table-wrap" role="region" aria-label="Portal- und Querschnittszuordnung" tabindex="0"><table class="data-table"><thead><tr><th>Thema</th><th>Zuordnung</th></tr></thead><tbody>${rows.map(([a, b]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td></tr>`).join("")}</tbody></table></div></div></section>`;
}

function protectionBlock() {
  return `<section class="section" aria-labelledby="schutz"><div class="card"><p class="hero-kicker">Schutzgrenzen</p>${h2("schutz", "Keine Anlage-, Kredit-, Steuer- oder Versicherungsentscheidung")}<p>Bewertet werden Kapitalflüsse, Produkte, Portfolios, Institutionen und Rahmenbedingungen, nicht Menschen. Alle Tools sind modellhafte Demonstrationen. Sie sind keine Anlageberatung, keine automatische Kreditablehnung, kein Versicherungsrating, keine Steuerberatung und keine Aufsichtsentscheidung.</p></div></section>`;
}

function portalPage() {
  const md = read(`${SOURCE}/website_inhalt_finanzsystem_kapital.md`);
  const usable = md
    .replace(/\n## Werkzeuge in diesem Bereich[\s\S]*?(?=\n## Politische Anschlussfähigkeit und Umsetzungsoptionen)/i, "\n")
    .replace(/\n## Online lesen \/ Downloads[\s\S]*$/i, "");
  const { toc: t, html } = mdToHtml(usable, "portal-");
  page({
    rel: "wirkungsfelder/finanzsystem-kapital/index.html",
    title: "Finanzsystem & Kapital | Wirkungsökonomie",
    description: "Kapital als Wirkungskraft: Banken, Versicherungen, Fonds, Portfolio-Wirkungsrating, Steuer- und Abgabenarchitektur und demokratische Finanzaufsicht.",
    body: (base) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/")}">Wirkungsfelder</a></nav><p class="hero-kicker">Wirkungsfeld</p><h1>Finanzsystem & Kapital</h1><p class="hero-subtitle">Kapital als Wirkungskraft: Banken, Versicherungen, Fonds, Portfolio-Wirkungsrating, Steuerarchitektur und demokratische Finanzaufsicht.</p><p>Kapital ist in der Wirkungsökonomie kein Feind. Es ist ein Werkzeug. Entscheidend ist, welche Zustände durch Kapitalflüsse wahrscheinlicher werden.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#publikationszugang">Online lesen</a><a class="btn btn-secondary" href="#tools">Tools öffnen</a></div></div><aside class="card"><p class="card-kicker">Leitsatz</p><h2 class="card-title">Rendite ist Folge, nicht Ziel.</h2><p class="card-text">Wirkung ist der Maßstab; Rendite bleibt ein Tragfähigkeitssignal. Finanzierbar werden soll, was positive Netto-Wirkung für Mensch, Planet und Demokratie wahrscheinlicher macht.</p></aside></div></section>${publicationAccess(base)}${go13DetailGrid(base)}${toc(t)}<section class="section" aria-labelledby="portaltext"><div class="prose">${h2("portaltext", "Portaltext online lesen")}${html}</div></section>${moduleGrid(base)}${toolGrid(base)}${rankBlock()}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${relatedBlock(base)}${protectionBlock()}${sourcesBlock()}${downloads(base)}`,
  });
}

function documentPage(doc) {
  const raw = read(doc.md);
  const markers = doc.key === "konzept" ? ["Executive Summary"] : doc.key === "dossier" ? ["Executive Summary"] : doc.key === "detailkonzepte" ? ["1. Kapital als Wirkungskraft"] : doc.key === "dossiers" ? ["1. Einzeldossier: Kapital als Wirkungskraft"] : doc.key === "tools" ? ["# Tool-Spezifikation", "Ziel"] : ["# Quellenregister", "Öffentliche Quellen"];
  const prefix = doc.key === "detailkonzepte" ? "detail-" : doc.key === "dossiers" ? "dossier-" : `${doc.key}-`;
  const { toc: t, html } = mdToHtml(trimCover(raw, markers), prefix);
  const rel = doc.key === "tools" ? "wirkungsfelder/finanzsystem-kapital/tools/index.html" : `wirkungsfelder/finanzsystem-kapital/${doc.key}/index.html`;
  page({
    rel,
    title: `${doc.title} | Wirkungsökonomie`,
    description: `${doc.title} online lesen: zitierfähige Volltextfassung mit Download, SDG-/SDG+-Bezug, Buchankern, Quellen und Druckfunktion.`,
    type: "Online-Volltext",
    body: (base) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/finanzsystem-kapital/")}">Finanzsystem & Kapital</a></nav><p class="hero-kicker">Online-Volltext</p><h1>${esc(doc.title)}</h1><p class="hero-subtitle">${esc(doc.description)}</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#volltext">Online lesen</a>${downloadLinks(base, doc)}</div></div><aside class="card"><p class="card-kicker">Zitierfähig</p><h2 class="card-title">Online lesen, gezielt zitieren</h2><p class="card-text">Diese Fassung ist vollständig online lesbar. Abschnittsanker können direkt zitiert werden; Dateien bleiben Export- und Archivfassungen.</p></aside></div></section>${toc(t)}<section class="section" id="volltext" aria-labelledby="volltext-title"><div class="prose">${h2("volltext-title", `${doc.shortTitle} online lesen`)}${html}</div></section>${doc.key === "tools" || doc.key === "quellen" ? "" : moduleGrid(base)}${toolGrid(base)}${rankBlock()}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${relatedBlock(base)}${protectionBlock()}${sourcesBlock()}${downloads(base)}`,
  });
}

function modulePage([slug, title, summary, toolTitle], index) {
  const detailRaw = read(`${EXTRACT}/woek_finanzsystem_kapital_detailkonzepte_umfangreich_v0_1.md`);
  const dossierRaw = read(`${EXTRACT}/woek_finanzsystem_kapital_einzeldossier_set_v0_1.md`);
  const next = modules[index + 1]?.[1];
  const detail = extractBlock(detailRaw, [`${index + 1}. ${title}`], next ? [`${index + 2}. ${next}`] : []);
  const dossier = extractBlock(dossierRaw, [`${index + 1}. Einzeldossier: ${title}`], modules[index + 1] ? [`${index + 2}. Einzeldossier: ${modules[index + 1][1]}`] : ["Politische Anschlussfähigkeit und Umsetzungsoptionen"]);
  const { toc: t1, html: detailHtml } = mdToHtml(detail, `detail-${slug}-`);
  const { toc: t2, html: dossierHtml } = mdToHtml(dossier, `dossier-${slug}-`);
  const tool = toolPages.find(([, name]) => name === toolTitle) || toolPages[0];
  page({
    rel: `wirkungsfelder/finanzsystem-kapital/${slug}/index.html`,
    title: `${title} | Finanzsystem & Kapital`,
    description: `${title} online lesen: Detailkonzept, Einzeldossier, Toolbezug, politische Anschlussfähigkeit, SDG-/SDG+-Bezug und Downloads.`,
    type: "Detailkonzept und Dossier",
    body: (base) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/finanzsystem-kapital/")}">Finanzsystem & Kapital</a></nav><p class="hero-kicker">Unterbereich · Online-Volltext</p><h1>${esc(title)}</h1><p class="hero-subtitle">${esc(summary)}</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#detailkonzept">Detailkonzept lesen</a><a class="btn btn-secondary" href="#einzeldossier">Dossier lesen</a>${downloadLinks(base, documents[2])}${downloadLinks(base, documents[3])}</div></div><aside class="card"><p class="card-kicker">Primäres Werkzeug</p><h2 class="card-title">${esc(toolTitle)}</h2><p class="card-text">${esc(tool[3])}</p><a class="text-link" href="${href(base, `werkzeuge/${tool[0]}/`)}">Toolseite öffnen</a></aside></div></section><nav class="toc-card no-print" aria-label="Inhaltsverzeichnis"><h2 class="card-title">Inhaltsverzeichnis</h2><ol>${[...t1, ...t2].map((item) => `<li class="toc-level-${esc(item.level)}"><a href="#${esc(item.id)}">${esc(item.text)}</a></li>`).join("")}</ol></nav><section class="section" id="detailkonzept" aria-labelledby="detailkonzept-title"><div class="prose">${h2("detailkonzept-title", "Detailkonzept online lesen")}${detailHtml}</div></section><section class="section" id="einzeldossier" aria-labelledby="einzeldossier-title"><div class="prose">${h2("einzeldossier-title", "Einzeldossier online lesen")}${dossierHtml}</div></section>${toolGrid(base)}${rankBlock()}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${relatedBlock(base)}${protectionBlock()}${sourcesBlock()}${downloads(base)}`,
  });
}

function toolPage([slug, title, type, description, status]) {
  const spec = `${read(`${SOURCE}/tool_spezifikation_finanzsystem_kapital_tool_suite.md`)}\n\n${read(`${SOURCE}/tool_spezifikation_kapitalwirkungs_und_wirkungsfonds_tool_suite.md`)}`;
  const { toc: t, html } = mdToHtml(spec, `tool-${slug}-`);
  page({
    rel: `werkzeuge/${slug}/index.html`,
    title: `${title} | Wirkungsökonomie`,
    description: `${title}: modellhafte Werkzeugseite für Finanzsystem und Kapital mit Spezifikation, Schutzgrenzen und Portalbezug.`,
    section: "Werkzeuge",
    type: "Werkzeug",
    body: (base) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "werkzeuge/")}">Werkzeuge</a></nav><p class="hero-kicker">${esc(type)} · ${esc(status)}</p><h1>${esc(title)}</h1><p class="hero-subtitle">${esc(description)}</p><p>Modellhafte Demonstration. Keine Anlageberatung, keine Kreditentscheidung, keine Steuerberatung, kein Versicherungsrating und keine Aufsichtsentscheidung.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#spezifikation">Spezifikation online lesen</a><a class="btn btn-secondary" href="${href(base, "wirkungsfelder/finanzsystem-kapital/")}">Portal öffnen</a></div></div><aside class="card"><p class="card-kicker">Schutzgrenze</p><h2 class="card-title">Werkzeug unterstützt, entscheidet aber nicht.</h2><p class="card-text">Wirkungsdaten bereiten Entscheidungen vor. Verantwortung, Prioritäten, Rechtsschutz und Zumutbarkeit bleiben menschlich, institutionell und demokratisch legitimiert.</p></aside></div></section>${toc(t)}<section class="section" id="spezifikation" aria-labelledby="spezifikation-title"><div class="prose">${h2("spezifikation-title", "Tool-Spezifikation online lesen")}${html}</div></section>${toolGrid(base)}${rankBlock()}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${relatedBlock(base)}${protectionBlock()}${sourcesBlock()}${downloads(base)}`,
  });
}

function go13DetailPage(concept) {
  const raw = trimCover(read(concept.md), ["## Executive Summary", "Executive Summary"]);
  const { toc: t, html } = mdToHtml(raw, `go13-${concept.slug}-`);
  page({
    rel: `wirkungsfelder/finanzsystem-kapital/${concept.slug}/index.html`,
    title: `${concept.title} | Finanzsystem & Kapital`,
    description: `${concept.title} online lesen: vollständiges Detailkonzept mit Downloads, Quellen, Toolbezug, SDG-/SDG+-Referenz und politischer Anschlussfähigkeit.`,
    type: "Detailkonzept",
    body: (base) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/finanzsystem-kapital/")}">Finanzsystem & Kapital</a></nav><p class="hero-kicker">Detailkonzept · v1.0</p><h1>${esc(concept.title)}</h1><p class="hero-subtitle">${esc(concept.subtitle)}</p><p>Öffentliche Lesefassung. Keine Rechts-, Steuer-, Anlage-, Kredit- oder Finanzberatung.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#volltext">Online lesen</a>${go13DownloadLinks(base, concept)}</div></div><aside class="card"><p class="card-kicker">Online-Volltext</p><h2 class="card-title">Vollständig lesbar und zitierfähig.</h2><p class="card-text">Abschnittsanker ermöglichen direkte Zitate; Downloads bleiben Export und Archiv.</p></aside></div></section>${toc(t)}<section class="section" id="volltext" aria-labelledby="volltext-title"><div class="prose">${h2("volltext-title", "Detailkonzept online lesen")}${html}</div></section>${go13ToolGrid(base, concept)}${rankBlock()}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${relatedBlock(base)}${protectionBlock()}${sourcesBlock()}${go13DownloadBlock(base, concept)}`,
  });
}

function libraryPage() {
  page({
    rel: "werkstatt/arbeitsbibliothek/wirkungsfelder/finanzsystem-kapital/index.html",
    title: "Arbeitsbibliothek Finanzsystem & Kapital | Wirkungsökonomie",
    description: "Arbeitsbibliothek zum Wirkungsfeld Finanzsystem & Kapital mit Konzeptpapier, Gesamtdossier, Detailkonzepten, Einzeldossiers und Tool-Spezifikation.",
    section: "Werkstatt",
    type: "Arbeitsbibliothek",
    body: (base) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "werkstatt/arbeitsbibliothek/")}">Arbeitsbibliothek</a></nav><p class="hero-kicker">Werkstatt · Wirkungsfeld</p><h1>Finanzsystem & Kapital</h1><p class="hero-subtitle">Konzeptpapier, Gesamtdossier, Detailkonzepte, Einzeldossiers und Tool-Spezifikation online lesen und herunterladen.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="${href(base, "wirkungsfelder/finanzsystem-kapital/")}">Portal öffnen</a></div></div><aside class="card"><p class="card-kicker">Arbeitsbibliothek</p><h2 class="card-title">Online-Volltext vor Download.</h2><p class="card-text">Die Werkstatt sammelt die öffentlichen Fassungen, ohne die Website zum Dateiablageort zu machen.</p></aside></div></section>${publicationAccess(base)}${moduleGrid(base)}${toolGrid(base)}${referenceBlock(base)}${bookBlock(base)}${downloads(base)}`,
  });
}

function updateSitemap() {
  const sitemap = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemap)) return;
  const rels = Array.from(new Set([
    "wirkungsfelder/finanzsystem-kapital/",
    "wirkungsfelder/finanzsystem-kapital/konzept/",
    "wirkungsfelder/finanzsystem-kapital/dossier/",
    "wirkungsfelder/finanzsystem-kapital/detailkonzepte/",
    "wirkungsfelder/finanzsystem-kapital/dossiers/",
    "wirkungsfelder/finanzsystem-kapital/tools/",
    "wirkungsfelder/finanzsystem-kapital/quellen/",
    "werkstatt/arbeitsbibliothek/wirkungsfelder/finanzsystem-kapital/",
    ...modules.map(([slug]) => `wirkungsfelder/finanzsystem-kapital/${slug}/`),
    ...financeDetailConcepts.map(({ slug }) => `wirkungsfelder/finanzsystem-kapital/${slug}/`),
    ...toolPages.map(([slug]) => `werkzeuge/${slug}/`),
  ]));
  let xml = fs.readFileSync(sitemap, "utf8");
  for (const rel of rels) {
    xml = xml.replace(new RegExp(`\\s*<url>\\s*<loc>${SITE}/${rel}</loc>\\s*<lastmod>[^<]+</lastmod>\\s*</url>`, "g"), "");
  }
  const entries = rels.map((rel) => `  <url><loc>${SITE}/${rel}</loc><lastmod>${DATE}</lastmod></url>`).join("\n");
  fs.writeFileSync(sitemap, xml.replace("</urlset>", `${entries}\n</urlset>`), "utf8");
}

portalPage();
for (const doc of documents) documentPage(doc);
modules.forEach(modulePage);
financeDetailConcepts.forEach(go13DetailPage);
for (const tool of toolPages) toolPage(tool);
libraryPage();
updateSitemap();

console.log("Finanzsystem & Kapital portal generated.");
