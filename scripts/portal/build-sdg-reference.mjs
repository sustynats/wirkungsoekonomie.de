import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-05-24";
const CSS_VERSION = "20260524-sdg-reference";
const JS_VERSION = "20260523-nachhaltigkeit";

const officialSources = [
  { label: "United Nations - Agenda 2030", url: "https://sdgs.un.org/2030agenda" },
  { label: "UN Sustainable Development Goals", url: "https://sdgs.un.org/goals" },
  { label: "UN Statistics - SDG Indicators", url: "https://unstats.un.org/sdgs/indicators/indicators-list/" },
  { label: "Destatis - SDG-Indikatoren Deutschland", url: "https://sdg-indikatoren.de/" },
  { label: "DNS-Indikatoren - Deutsche Nachhaltigkeitsstrategie", url: "https://dns-indikatoren.de/" },
  { label: "Eurostat SDG Monitoring", url: "https://ec.europa.eu/eurostat/web/sdi" },
  { label: "UNESCO ROAM-X Indicators", url: "https://www.unesco.org/en/articles/how-measure-internet-unescos-internet-universality-roam-x-indicators-now-also-available-russian" },
  { label: "World Justice Project - Rule of Law Factors", url: "https://worldjusticeproject.org/our-work/research-and-data/factors-rule-law" },
  { label: "V-Dem Democracy Reports", url: "https://www.v-dem.net/publications/democracy-reports/" },
  { label: "Reporters Without Borders - Press Freedom Index Methodology", url: "https://rsf.org/en/index-methodologie-2022" },
  { label: "OECD - Drivers of Trust in Public Institutions", url: "https://www.oecd.org/en/publications/oecd-survey-on-drivers-of-trust-in-public-institutions-2024-results_9a20554b-en.html" },
];

const sdgPlusDownload = {
  title: "SDG+ Arbeitspapier herunterladen",
  href: "/assets/downloads/sdgplus_referenzrahmen_wirkungsoekonomie_v0_1.docx",
  file: "assets/downloads/sdgplus_referenzrahmen_wirkungsoekonomie_v0_1.docx",
  description:
    "Das Arbeitspapier enthält die ausführliche Begründung, Definitionen, Unterdimensionen, WÖk-ID-Anschluss, Hover-Texte, Website-Struktur und Quellen zum SDG+-Referenzrahmen.",
};

const sdgs = [
  [1, "Keine Armut", "Armut in allen Formen beenden und soziale Sicherung, Zugang zu Grundversorgung und faire Teilhabe stärken.", "Armut in allen Formen und überall beenden.", "Armut ist wirkungsökonomisch nicht nur Einkommensmangel, sondern ein Zustand eingeschränkter Handlungsfähigkeit, Gesundheit, Bildung, Sicherheit und demokratischer Teilhabe.", ["Arbeit & Einkommen", "Rente & soziale Sicherung", "Wohnen & Stadt"]],
  [2, "Kein Hunger", "Ernährungssicherheit, nachhaltige Landwirtschaft, gesunde Ernährung und resiliente Ernährungssysteme stärken.", "Hunger beenden, Ernährungssicherheit erreichen und nachhaltige Landwirtschaft fördern.", "Ernährungssysteme sind Wirkungsketten: Boden, Wasser, Biodiversität, Arbeit, Gesundheit, Lieferketten und Preise wirken zusammen.", ["Produkte & Konsum", "Klima, Energie & Ressourcen", "Gesundheit & Pflege"]],
  [3, "Gesundheit und Wohlergehen", "Gesundes Leben und Wohlergehen für alle Menschen in allen Altersgruppen fördern.", "Gesundheit und Wohlergehen für alle Menschen fördern.", "Gesundheit ist nicht nur Reparatur von Krankheit. Wirkungsökonomisch zählen Prävention, Resilienz, Pflege, Teilhabe, Umweltbedingungen und psychische Stabilität.", ["Gesundheit & Pflege", "Bildung", "Wohnen & Stadt"]],
  [4, "Hochwertige Bildung", "Inklusive, chancengerechte und hochwertige Bildung sowie lebenslanges Lernen ermöglichen.", "Inklusive, chancengerechte und hochwertige Bildung sowie lebenslanges Lernen fördern.", "Bildung ist eine Wirkungsinfrastruktur: Sie stärkt Selbstwirksamkeit, Urteilskraft, Demokratiekompetenz, Teilhabe, digitale Mündigkeit und Zukunftsfähigkeit.", ["Bildung", "Wissenschaft, Innovation & Digitalisierung", "Arbeit & Einkommen"]],
  [5, "Geschlechtergleichstellung", "Gleichstellung der Geschlechter erreichen und Selbstbestimmung von Frauen und Mädchen stärken.", "Geschlechtergleichstellung erreichen und alle Frauen und Mädchen zur Selbstbestimmung befähigen.", "Geschlechtergerechtigkeit betrifft Zugang, Sicherheit, Care, Einkommen, Repräsentation, Rollenbilder und Schutz vor struktureller Diskriminierung.", ["Bildung", "Arbeit & Einkommen", "Staat, Recht & Demokratie"]],
  [6, "Sauberes Wasser und Sanitäreinrichtungen", "Verfügbarkeit und nachhaltige Bewirtschaftung von Wasser und Sanitärversorgung sichern.", "Wasser und Sanitärversorgung für alle verfügbar machen und nachhaltig bewirtschaften.", "Wasser ist Lebensgrundlage, Gesundheitsfaktor, Produktionsbedingung und ökologische Grenze. Produkt- und Lieferkettenwirkung muss Wasserstress sichtbar machen.", ["Klima, Energie & Ressourcen", "Produkte & Konsum", "Gesundheit & Pflege"]],
  [7, "Bezahlbare und saubere Energie", "Zugang zu bezahlbarer, verlässlicher, nachhaltiger und moderner Energie sichern.", "Zugang zu bezahlbarer, verlässlicher, nachhaltiger und moderner Energie sichern.", "Energie entscheidet über Teilhabe, Industrie, Wohnen, Gesundheit, Klima und Resilienz. Wirkungsökonomisch zählt Versorgungssicherheit innerhalb planetarer Grenzen.", ["Klima, Energie & Ressourcen", "Wohnen & Stadt", "Wirtschaft & Unternehmen"]],
  [8, "Menschenwürdige Arbeit und Wirtschaftswachstum", "Menschenwürdige Arbeit, produktive Beschäftigung und nachhaltige wirtschaftliche Entwicklung fördern.", "Dauerhaftes, inklusives und nachhaltiges Wirtschaften sowie menschenwürdige Arbeit fördern.", "Arbeit wird nicht nur als Erwerbslogik betrachtet, sondern als Wirkung auf Würde, Einkommen, Gesundheit, Teilhabe, Kompetenz und Automatisierungsfolgen.", ["Arbeit & Einkommen", "Wirtschaft & Unternehmen", "Produkte & Konsum"]],
  [9, "Industrie, Innovation und Infrastruktur", "Widerstandsfähige Infrastruktur, nachhaltige Industrialisierung und Innovation fördern.", "Widerstandsfähige Infrastruktur, nachhaltige Industrialisierung und Innovation fördern.", "Innovation erzeugt nicht automatisch positive Wirkung. Entscheidend ist, ob Infrastruktur und Technik positive Netto-Wirkung wahrscheinlicher machen.", ["Wissenschaft, Innovation & Digitalisierung", "Wirtschaft & Unternehmen", "Produkte & Konsum"]],
  [10, "Weniger Ungleichheiten", "Ungleichheiten innerhalb und zwischen Ländern verringern.", "Ungleichheit innerhalb und zwischen Ländern verringern.", "Ungleichheit schwächt Chancen, Gesundheit, Vertrauen, Demokratie und Resilienz. Wirkungsökonomie fragt, welche Regeln Teilhabe erhöhen oder Ausschluss verstärken.", ["Bildung", "Arbeit & Einkommen", "Rente & soziale Sicherung"]],
  [11, "Nachhaltige Städte und Gemeinden", "Städte und Siedlungen inklusiv, sicher, widerstandsfähig und nachhaltig gestalten.", "Städte und Siedlungen inklusiv, sicher, widerstandsfähig und nachhaltig gestalten.", "Orte wirken: Wohnen, Mobilität, Hitze, Sicherheit, soziale Nähe, Bildung, Gesundheit und demokratische Beteiligung entstehen räumlich.", ["Wohnen & Stadt", "Bildung", "Klima, Energie & Ressourcen"]],
  [12, "Nachhaltiger Konsum und Produktion", "Nachhaltige Konsum- und Produktionsmuster sicherstellen.", "Nachhaltige Konsum- und Produktionsmuster sicherstellen.", "Produkte sind Wirkungsträger. SDG 12 ist zentral für Produktscorecards, WÖk-IDs, digitale Produktpässe, Lieferketten und Wirkungsumsatzsteuer.", ["Produkte & Konsum", "Wirtschaft & Unternehmen", "Finanzsystem & Kapital"]],
  [13, "Klimaschutz", "Dringende Maßnahmen zur Bekämpfung des Klimawandels und seiner Folgen ergreifen.", "Dringende Maßnahmen gegen Klimawandel und seine Folgen ergreifen.", "Klima ist Systembedingung. Wirkungsökonomisch müssen Emissionen, Anpassung, Risiko, Versicherbarkeit, soziale Abfederung und Transformationswirkung gemeinsam betrachtet werden.", ["Klima, Energie & Ressourcen", "Wohnen & Stadt", "Finanzsystem & Kapital"]],
  [14, "Leben unter Wasser", "Ozeane, Meere und Meeresressourcen erhalten und nachhaltig nutzen.", "Ozeane, Meere und Meeresressourcen erhalten und nachhaltig nutzen.", "Meere sind ökologische Stabilitätsräume. Produktketten, Chemikalien, Plastik, Ernährung, Energie und Klima wirken auf marine Systeme zurück.", ["Klima, Energie & Ressourcen", "Produkte & Konsum"]],
  [15, "Leben an Land", "Landökosysteme, Wälder, Böden und Biodiversität schützen, wiederherstellen und nachhaltig nutzen.", "Landökosysteme schützen, wiederherstellen und nachhaltig nutzen.", "Biodiversität, Böden, Wälder und Landnutzung sind Grundlage von Ernährung, Gesundheit, Klimaresilienz und langfristiger Wertschöpfung.", ["Klima, Energie & Ressourcen", "Produkte & Konsum", "Wohnen & Stadt"]],
  [16, "Frieden, Gerechtigkeit und starke Institutionen", "Friedliche, inklusive Gesellschaften, Rechtsstaatlichkeit, Zugang zu Recht und wirksame Institutionen fördern.", "Friedliche und inklusive Gesellschaften, Zugang zur Justiz und wirksame Institutionen fördern.", "SDG 16 ist die Brücke zu SDG+: Ohne Rechtsstaatlichkeit, Vertrauen, Demokratie und öffentliche Wahrheit können nachhaltige Ziele nicht stabil erreicht werden.", ["Staat, Recht & Demokratie", "Medien & Öffentlichkeit", "Bildung"]],
  [17, "Partnerschaften", "Globale Partnerschaften, Zusammenarbeit, Finanzierung, Daten und Umsetzungskraft für nachhaltige Entwicklung stärken.", "Umsetzungsmittel stärken und globale Partnerschaften für nachhaltige Entwicklung beleben.", "Wirkung entsteht in Netzwerken: Daten, Finanzierung, Institutionen, Wissenschaft, Kommunen, Unternehmen und Zivilgesellschaft müssen rückkopplungsfähig zusammenarbeiten.", ["Staat, Recht & Demokratie", "Wissenschaft, Innovation & Digitalisierung", "Wirtschaft & Unternehmen"]],
].map(([number, title, hoverText, officialDescription, woekMeaning, fields]) => {
  const slug = sdgSlug(number);
  return {
    id: `sdg-${number}`,
    type: "sdg",
    number,
    title: `SDG ${number} - ${title}`,
    shortTitle: `SDG ${number} ${shorten(title)}`,
    slug,
    url: `/verstehen/sdgs-sdgplus/${slug}/`,
    hoverText,
    officialDescription,
    woekMeaning,
    germanyEuropeRelevance:
      "Für Deutschland und Europa sind nationale Nachhaltigkeitsindikatoren, europäische SDG-Berichte, soziale und ökologische Transformationspfade, Datenqualität und gerechte Übergänge relevant.",
    targets: number === 4 ? sdg4Targets() : [{ code: `${number}.x`, title: "Offizielle Unterziele", summary: "Die vollständige deutschsprachige Kuratierung der Unterziele wird ergänzt. Bis dahin führt die UN-Zielseite zur offiziellen Target-Liste.", officialUrl: `https://sdgs.un.org/goals/goal${number}` }],
    relevantTargetsGermanyEurope: number === 4 ? ["4.1", "4.2", "4.3", "4.4", "4.5", "4.7", "4.a"] : ["wird ergänzt"],
    officialSources: officialSourcesFor(number),
    relatedWirkungsfelder: fields.map((field) => ({ title: field, url: fieldUrl(field), why: `${title} berührt dieses Wirkungsfeld als Bewertungs- und Anschlussrahmen.` })),
    relatedWerkzeuge: relatedToolsFor(number),
    relatedBookAnchors: bookAnchorsFor(number),
  };
});

const sdgPlus = [
  ["demokratie", "Demokratie", "Demokratische Stabilität, Teilhabe, Streitfähigkeit, Minderheitenschutz und Korrekturfähigkeit als Voraussetzung positiver Netto-Wirkung.", "Demokratie beschreibt die Fähigkeit einer Gesellschaft, Macht zu begrenzen, Konflikte friedlich zu bearbeiten, Minderheiten zu schützen und Entscheidungen korrigierbar zu halten."],
  ["medienqualitaet", "Medienqualität", "Qualität öffentlicher Information, journalistische Verantwortung, Quellenklarheit und Schutz vor Desinformation.", "Medienqualität beschreibt die Verlässlichkeit öffentlicher Information, Quellenklarheit, Kontext, Fehlerkorrektur und Schutz vor manipulativer Verzerrung."],
  ["rechtsstaatlichkeit", "Rechtsstaatlichkeit", "Verlässliche Regeln, Grundrechte, Minderheitenschutz, unabhängige Gerichte und Schutz vor Willkür.", "Rechtsstaatlichkeit sichert Grundrechte, Verfahren, Rechtsschutz, Minderheitenschutz und Begrenzung willkürlicher Macht."],
  ["diskursfaehigkeit", "Diskursfähigkeit", "Die Fähigkeit einer Gesellschaft, Konflikte faktenbasiert, respektvoll und demokratisch zu bearbeiten.", "Diskursfähigkeit beschreibt, ob eine Gesellschaft streiten, zuhören, korrigieren und gemeinsame Wirklichkeit herstellen kann."],
  ["institutionelles-vertrauen", "institutionelles Vertrauen", "Vertrauen in Institutionen, Verfahren, Datenqualität, Transparenz und demokratische Korrekturmechanismen.", "Institutionelles Vertrauen entsteht, wenn Verfahren, Daten, Regeln und Verantwortlichkeiten nachvollziehbar, korrigierbar und fair sind."],
  ["gesellschaftlicher-zusammenhalt", "gesellschaftlicher Zusammenhalt", "Soziale Bindung, Zugehörigkeit, Teilhabe, Sicherheit, Fairness und Schutz vor Spaltung.", "Gesellschaftlicher Zusammenhalt beschreibt Zugehörigkeit, Sicherheit, Fairness, Teilhabe und die Fähigkeit, Differenzen auszuhalten."],
  ["digitale-selbstbestimmung", "digitale Selbstbestimmung", "Schutz vor Manipulation, Datenrechte, algorithmische Fairness, digitale Teilhabe und souveräne Nutzung digitaler Räume.", "Digitale Selbstbestimmung beschreibt die Fähigkeit, digitale Räume, Daten, Plattformen und algorithmische Systeme informiert und souverän zu nutzen."],
].map(([key, title, hoverText, definition]) => ({
  id: `sdgplus-${key}`,
  type: "sdgplus",
  title: `SDG+ ${title}`,
  shortTitle: `SDG+ ${title}`,
  slug: `sdgplus-${key}`,
  url: `/verstehen/sdgs-sdgplus/sdgplus-${key}/`,
  hoverText,
  officialDescription: "SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie.",
  woekMeaning: definition,
  germanyEuropeRelevance:
    "Für Deutschland und Europa ist diese Dimension relevant, weil nachhaltige Entwicklung auf demokratische Stabilität, öffentliche Wahrheit, Rechtsstaatlichkeit, Vertrauen, Zusammenhalt und digitale Grundrechte angewiesen ist.",
  targets: [],
  officialSources: [
    { label: "UN SDG 16", url: "https://sdgs.un.org/goals/goal16" },
    { label: "UN SDG 17", url: "https://sdgs.un.org/goals/goal17" },
  ],
  relatedWirkungsfelder: [
    { title: "Staat, Recht & Demokratie", url: "/wirkungsfelder/staat-recht-demokratie/", why: "Institutionen, Recht, Beteiligung und öffentliche Verantwortung sind Kern dieser SDG+-Dimension." },
    { title: "Medien & Öffentlichkeit", url: "/wirkungsfelder/medien-oeffentlichkeit/", why: "Öffentliche Resonanz, Information und Diskursqualität wirken auf demokratische Stabilität." },
    { title: "Bildung", url: "/wirkungsfelder/bildung/", why: "Demokratiekompetenz, Medienkompetenz und digitale Mündigkeit werden gelernt und praktiziert." },
  ],
  relatedWerkzeuge: [
    { title: "WÖk-IDs", url: "/werkzeuge/woek-ids/" },
    { title: "Wirkungsrat", url: "/werkzeuge/wirkungsrat/" },
    { title: "Scorecards", url: "/werkzeuge/scorecards/" },
  ],
  relatedBookAnchors: ["Demokratie als Wirkungsraum", "SDG+ als Erweiterung der Wirkungsökonomie", "Medienqualität und öffentliche Resonanz", "Wirkung als Rechtsprinzip", "Wirkungsrat"],
}));

const sdgPlusDetails = {
  "sdgplus-demokratie": {
    hoverText: "SDG+ Demokratie macht demokratische Stabilitaet, Teilhabe, Streitfaehigkeit und Korrekturfaehigkeit als Wirkungsbedingung sichtbar.",
    woekMeaning: "Demokratie meint in der Wirkungsökonomie mehr als Wahlen und Institutionen. Sie ist ein Wirkungsraum, in dem Wahrheit, Rechtsstaatlichkeit, Beteiligung, Machtbegrenzung, Minderheitenschutz, öffentliche Korrektur und digitale Selbstbestimmung zusammenwirken.",
    whyNeeded: "Die SDGs enthalten mit SDG 16 Frieden, Gerechtigkeit und starke Institutionen. Für eine Wirkungsordnung des 21. Jahrhunderts reicht das nicht aus, weil digitale Öffentlichkeit, Plattformmacht, Desinformation, algorithmische Steuerung, hybride Einflussnahme und Vertrauensverlust demokratische Korrekturfähigkeit beschädigen können.",
    officialSdgConnection: "SDG 16 ist der direkte Anschluss. SDG 4, SDG 10, SDG 11 und SDG 17 sind wichtige Nebenanker, weil Bildung, Ungleichheit, lokale Räume und Partnerschaften demokratische Teilhabe prägen.",
    relatedSdgs: ["sdg-16", "sdg-4", "sdg-10", "sdg-11", "sdg-17"],
    subdimensions: ["freie und faire Wahlen", "Machtbegrenzung und Gewaltenteilung", "Beteiligung und Teilgabe", "Minderheitenschutz und Grundrechte", "demokratische Streitfaehigkeit", "Schutz vor Desinformation und Manipulation", "politische Transparenz und Rechenschaft", "demokratische Resilienz in Krisen"],
    indicatorFamilies: ["Wahlfreiheit und Wahlfairness", "Beteiligungsquoten und Zugangsbarrieren", "Transparenz politischer Finanzierung", "Qualität öffentlicher Konsultationen", "Desinformations- und Manipulationsrisiken", "Vertrauen in demokratische Verfahren", "Schutz von Minderheiten und zivilgesellschaftlichem Raum"],
    redLines: ["Wahlmanipulation", "systematische Einschüchterung politischer Gegner:innen", "Abbau unabhängiger Gerichte", "staatlich organisierte Desinformation", "Ausschluss von Minderheiten aus Teilhabe"],
    fields: ["Staat, Recht & Demokratie", "Medien & Öffentlichkeit", "Bildung", "Wissenschaft, Innovation & Digitalisierung", "Kultur, Identität & Resonanz"],
    tools: ["Wirkungsrat", "Wirkungshaushalt", "WÖk-IDs", "Medienwirkungscheck", "Wirkungsprüfung politischer Sprache"],
  },
  "sdgplus-medienqualitaet": {
    hoverText: "SDG+ Medienqualität bewertet öffentliche Informationsräume: Quellenklarheit, journalistische Verantwortung, Desinformationsschutz und demokratische Orientierung.",
    woekMeaning: "Medienqualität bezeichnet die Fähigkeit öffentlicher Informationsräume, überprüfbare, vielfältige, relevante und kontextualisierte Informationen bereitzustellen, ohne Aufmerksamkeit systematisch gegen Wahrheit, Würde oder Demokratie auszuspielen.",
    whyNeeded: "Reichweite ist keine Orientierung. Medien und Plattformen können Aufmerksamkeit erzeugen und zugleich Vertrauen, Gesundheit, Demokratie oder Minderheitenschutz schwächen. Die klassische SDG-Systematik adressiert Informationsqualität nur indirekt.",
    officialSdgConnection: "SDG 16 ist der institutionelle Anker. SDG 4 ist relevant für Medienbildung. SDG 10 und SDG 17 betreffen Zugang und Kooperation.",
    relatedSdgs: ["sdg-16", "sdg-4", "sdg-10", "sdg-17"],
    subdimensions: ["Quellenklarheit und Transparenz", "journalistische Sorgfalt", "redaktionelle Unabhängigkeit", "Faktenprüfung und Korrekturmechanismen", "Pluralität und Perspektivenvielfalt", "Schutz vor Desinformation", "algorithmische Verstärkungslogiken", "ökonomische Unabhängigkeit von Qualitätsjournalismus"],
    indicatorFamilies: ["Anteil belegter Quellen", "Korrekturrate und Korrekturtransparenz", "Eigentümer- und Finanzierungsstrukturen", "Desinformations-Viralität", "Vielfalt der Quellen und Stimmen", "Trennung von Werbung, Meinung und Nachricht", "Verfügbarkeit lokaler und gemeinwohlorientierter Medien"],
    redLines: ["koordinierte Desinformation", "nicht gekennzeichnete politische Werbung", "systematische Verleumdung von Gruppen", "Gewaltaufrufe", "algorithmische Verstärkung eindeutig falscher oder manipulativer Inhalte ohne Korrekturpfad"],
    fields: ["Medien & Öffentlichkeit", "Staat, Recht & Demokratie", "Bildung", "Wissenschaft, Innovation & Digitalisierung"],
    tools: ["Medienwirkungscheck", "Sprachwirkungsanalyse", "Quellenklarheits-Tool", "WÖk-IDs", "Agentur für Digitale Öffentlichkeit"],
  },
  "sdgplus-rechtsstaatlichkeit": {
    hoverText: "SDG+ Rechtsstaatlichkeit schützt Wirkungssteuerung vor Willkür: unabhängige Gerichte, Grundrechte, Verhältnismäßigkeit und Zugang zu Recht.",
    woekMeaning: "Rechtsstaatlichkeit bezeichnet den Zustand, in dem Macht rechtlich begrenzt, Verfahren nachvollziehbar, Grundrechte wirksam, Gerichte unabhängig und Rechtsschutz zugänglich sind. Ohne Rechtsstaat wird Wirkungsmessung zur Machttechnik.",
    whyNeeded: "Wirkung braucht Regeln, aber Regeln brauchen Grenzen. Daten, Scorecards, Steuern und Bewertung können missbraucht werden. Rechtsstaatlichkeit schützt davor, dass Wirkungssteuerung technokratisch, willkürlich oder repressiv wird.",
    officialSdgConnection: "SDG 16 ist der direkte Anker. SDG 10 und SDG 17 sind relevant, weil Rechtszugang, faire Verfahren und internationale Kooperation Ungleichheit und Machtmissbrauch begrenzen.",
    relatedSdgs: ["sdg-16", "sdg-10", "sdg-17"],
    subdimensions: ["unabhängige Gerichte", "Grundrechte und Minderheitenschutz", "Verhältnismäßigkeit", "Rechtsschutz und Beschwerdewege", "Korruptionsprävention", "offene Verwaltung", "Rechtssicherheit", "Datenschutz und Schutz vor willkürlicher Überwachung"],
    indicatorFamilies: ["Zugang zu Justiz", "Dauer und Fairness von Verfahren", "Unabhängigkeit der Justiz", "Korruptionsrisiko", "Transparenz staatlicher Entscheidungen", "Grundrechtsverletzungen", "Beschwerde- und Einspruchsmöglichkeiten bei automatisierten Entscheidungen"],
    redLines: ["willkürliche Personenbewertung", "Social-Credit-Logik", "fehlender Rechtsschutz gegen automatisierte Entscheidungen", "politische Vereinnahmung von Gerichten", "diskriminierende Rechtsanwendung"],
    fields: ["Staat, Recht & Demokratie", "Medien & Öffentlichkeit", "Finanzsystem & Kapital"],
    tools: ["LawReader", "LawReference", "Wirkungsrat", "Wirkungsprüfung", "Rechtsfolgen-Check"],
  },
  "sdgplus-diskursfaehigkeit": {
    hoverText: "SDG+ Diskursfähigkeit macht sichtbar, ob Gesellschaften Konflikte faktenbasiert, respektvoll und korrekturfähig bearbeiten können.",
    woekMeaning: "Diskursfähigkeit beschreibt die soziale und institutionelle Fähigkeit, Widerspruch auszuhalten, Fakten zu prüfen, Zielkonflikte offen zu verhandeln und Entscheidungen so zu begründen, dass Korrektur möglich bleibt.",
    whyNeeded: "Nachhaltigkeit erzeugt Zielkonflikte: Klima, soziale Sicherheit, Wirtschaft, Migration, Energie, Wohnen, Freiheit und Gesundheit stehen nicht immer spannungsfrei nebeneinander. Ohne Diskursfähigkeit werden Zielkonflikte zu Polarisierung statt zu Lernen.",
    officialSdgConnection: "SDG 16 und SDG 17 sind zentrale Anker. SDG 4 ist relevant, weil Diskursfähigkeit gelernt werden muss.",
    relatedSdgs: ["sdg-16", "sdg-17", "sdg-4"],
    subdimensions: ["Faktenbezug und Quellenfähigkeit", "Respekt und Konfliktfähigkeit", "Ambiguitätstoleranz", "Deliberation und Beteiligung", "Polarisationserkennung", "Korrekturfähigkeit", "Schutz vor Dehumanisierung", "Übersetzung zwischen Fachsprache und Öffentlichkeit"],
    indicatorFamilies: ["Anteil faktenbasierter Begründungen in Verfahren", "Qualität öffentlicher Konsultationen", "Polarisierungsmarker", "Hass- und Dehumanisierungsindikatoren", "Vielfalt der Beteiligten", "Korrektur- und Lernschleifen in politischen Prozessen"],
    redLines: ["Aufruf zur Gewalt", "systematische Entmenschlichung", "gezielte Desinformation in Krisen", "Ausschluss betroffener Gruppen aus Debatten", "Manipulation von Beteiligungsverfahren"],
    fields: ["Medien & Öffentlichkeit", "Bildung", "Staat, Recht & Demokratie", "Kultur, Identität & Resonanz"],
    tools: ["Sprachwirkungsanalyse", "Diskursqualitäts-Check", "Moderations- und Beteiligungsformate", "Wirkungsprüfung politischer Kommunikation"],
  },
  "sdgplus-institutionelles-vertrauen": {
    hoverText: "SDG+ institutionelles Vertrauen beschreibt die begründete Erwartung, dass Institutionen fair, kompetent, transparent und korrigierbar handeln.",
    woekMeaning: "Institutionelles Vertrauen ist nicht blinder Gehorsam. Es ist die begründete Erwartung, dass Institutionen kompetent, fair, transparent, zugänglich, lernfähig und rechenschaftspflichtig handeln.",
    whyNeeded: "Wirkungsökonomie braucht Daten, Institutionen und Rückkopplung. Wenn Menschen nicht vertrauen können, dass Datenqualität, Wirkungsrat, Steuerlogik und politische Entscheidungen fair sind, kippt Wirkungsmessung in Misstrauen.",
    officialSdgConnection: "SDG 16 und SDG 17 sind direkte Anker. SDG 10 ist relevant, weil Ungleichheit Vertrauen schwächt.",
    relatedSdgs: ["sdg-16", "sdg-17", "sdg-10"],
    subdimensions: ["Kompetenz und Leistungsfähigkeit", "Integrität und Korruptionsschutz", "Fairness und Gleichbehandlung", "Offenheit und Transparenz", "Zugänglichkeit und Servicequalität", "Evidenzorientierung", "Fehlerkultur und Korrektur", "Zukunftsverantwortung"],
    indicatorFamilies: ["Vertrauen in Regierung, Verwaltung, Gerichte und Medien", "wahrgenommene Fairness", "Transparenz von Entscheidungen", "Nutzung bester verfügbarer Evidenz", "Beschwerdezugang", "Integritäts- und Korruptionsindikatoren", "Dauer und Verständlichkeit von Verfahren"],
    redLines: ["intransparente Datenverwendung", "politisch gekaperte Bewertung", "fehlender Beschwerdeweg", "Korruption", "Wirkungssimulation oder Greenwashing durch Institutionen"],
    fields: ["Staat, Recht & Demokratie", "Gesundheit & Pflege", "Wohnen & Stadt", "Produkte & Konsum"],
    tools: ["Wirkungsrat", "Wirkungsberichte", "Wirkungshaushalt", "Transparenzdashboard", "Wirkungsprüfung öffentlicher Mittel"],
  },
  "sdgplus-gesellschaftlicher-zusammenhalt": {
    hoverText: "SDG+ gesellschaftlicher Zusammenhalt macht sichtbar, ob Teilhabe, Zugehörigkeit, Sicherheit, Fairness und Schutz vor Spaltung gestärkt werden.",
    woekMeaning: "Gesellschaftlicher Zusammenhalt bezeichnet die Qualität sozialer Räume, Beziehungen und Verfahren, in denen Menschen sich zugehörig, sicher, beteiligt und fair behandelt fühlen. Er ist weder Homogenität noch Anpassungsdruck, sondern pluraler Zusammenhalt.",
    whyNeeded: "Viele SDGs behandeln soziale Fragen, aber die systemische Qualität des Zusammenhalts ist mehr als die Summe einzelner Armuts-, Bildungs- oder Ungleichheitsindikatoren.",
    officialSdgConnection: "SDG 1, 3, 4, 5, 8, 10, 11 und 16 sind besonders relevant. SDG+ verbindet diese Ziele über die Frage, ob Gesellschaft als gemeinsamer Wirkungsraum tragfähig bleibt.",
    relatedSdgs: ["sdg-1", "sdg-3", "sdg-4", "sdg-5", "sdg-8", "sdg-10", "sdg-11", "sdg-16"],
    subdimensions: ["Zugehörigkeit und Anerkennung", "soziale Sicherheit", "gerechte Teilhabe", "regionale Gleichwertigkeit", "Antidiskriminierung", "Generationengerechtigkeit", "öffentliche Räume", "Care, Familie und soziale Netze", "Resilienz gegen Spaltung"],
    indicatorFamilies: ["Einsamkeit und soziale Isolation", "wahrgenommene Zugehörigkeit", "Diskriminierungserfahrungen", "Mietbelastung und Wohnstabilität", "Zugang zu Bildung, Gesundheit und Kultur", "regionale Lebensqualität", "Teilhabequoten", "Armuts- und Prekaritätsrisiken"],
    redLines: ["systematische Ausgrenzung", "gruppenbezogene Menschenfeindlichkeit", "soziale Spaltung durch politische oder wirtschaftliche Anreize", "Verdrängung aus Grundbedarfsräumen", "Normalisierung von Hass oder Entwertung"],
    fields: ["Wohnen & Stadt", "Gesundheit & Pflege", "Bildung", "Arbeit & Einkommen", "Kultur, Identität & Resonanz"],
    tools: ["Wirkungsförderung", "Wirkungsrente", "Wirkungseinkommen", "kommunale Wirkungsbudgets", "Quartierswirkungscheck"],
  },
  "sdgplus-digitale-selbstbestimmung": {
    hoverText: "SDG+ digitale Selbstbestimmung schützt Datenrechte, digitale Teilhabe, algorithmische Fairness und Freiheit vor Manipulation.",
    woekMeaning: "Digitale Selbstbestimmung bezeichnet die Fähigkeit und das Recht, digitale Räume, Daten, Plattformen, KI-Systeme und algorithmische Entscheidungen zu verstehen, zu nutzen, zu kontrollieren und sich gegen Manipulation, Überwachung und Ausschluss zu schützen.",
    whyNeeded: "Seit 2015 haben Plattformmacht, generative KI, Datenökonomien, algorithmische Empfehlungssysteme, Deepfakes und digitale Abhängigkeiten eine neue Wirkungsintensität erreicht. Digitale Selbstbestimmung ist Bedingung von Demokratie, Bildung, Arbeit, Gesundheit und Konsumfreiheit.",
    officialSdgConnection: "SDG 4, SDG 9, SDG 10, SDG 16 und SDG 17 sind zentrale Anker. SDG+ präzisiert Datenrechte, algorithmische Fairness, Plattformmacht und Manipulationsschutz.",
    relatedSdgs: ["sdg-4", "sdg-9", "sdg-10", "sdg-16", "sdg-17"],
    subdimensions: ["Datenschutz und Datenrechte", "algorithmische Transparenz", "algorithmische Fairness", "Schutz vor Manipulation und Dark Patterns", "digitale Teilhabe und Barrierefreiheit", "KI-Kompetenz und Medienkompetenz", "Cyber- und Infrastruktursicherheit", "Schutz von Kindern und vulnerablen Gruppen", "Interoperabilität und offene digitale Infrastruktur"],
    indicatorFamilies: ["Zugang zu digitalen Diensten", "digitale Kompetenzen", "Transparenz automatisierter Entscheidungen", "Beschwerdewege gegen algorithmische Entscheidungen", "Datenschutzverletzungen", "Manipulations- und Dark-Pattern-Risiken", "Cyberresilienz", "KI-Einsatzfolgenabschätzung"],
    redLines: ["biometrische Massenüberwachung ohne Schutz und Rechtsweg", "manipulative Plattformarchitektur", "diskriminierende automatisierte Entscheidungen", "fehlende menschliche Kontrolle bei Hochrisikoentscheidungen", "Datenmissbrauch ohne wirksame Abhilfe"],
    fields: ["Wissenschaft, Innovation & Digitalisierung", "Medien & Öffentlichkeit", "Bildung", "Staat, Recht & Demokratie", "Produkte & Konsum", "Gesundheit & Pflege"],
    tools: ["KI-Wirkungsrisiko-Check", "Datenraum-Reifegradcheck", "Digitale Produktpässe", "Wirkungsscanner", "Algorithmic-Impact-Assessment"],
  },
};

for (const item of sdgPlus) {
  const detail = sdgPlusDetails[item.id];
  Object.assign(item, detail, {
    anchor: `#${item.id}`,
    url: `/verstehen/sdgs-sdgplus/#${item.id}`,
    legacyUrl: `/verstehen/sdgs-sdgplus/${item.slug}/`,
    isOfficialUNGoal: false,
    officialNote: "SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie.",
    relatedWirkungsfelder: detail.fields.map((field) => ({ title: field, url: fieldUrl(field), why: `${item.title} ist in diesem Wirkungsfeld eine Voraussetzung stabiler positiver Netto-Wirkung.` })),
    relatedWerkzeuge: detail.tools.map((title) => ({ title, url: toolUrl(title) })),
  });
}

const references = [...sdgs, ...sdgPlus];
const byId = Object.fromEntries(references.map((item) => [item.id, item]));
let badgeCounter = 0;

function sdg4Targets() {
  return [
    ["4.1", "Primar- und Sekundarbildung", "Kinder und Jugendliche sollen hochwertige Grund- und Sekundarbildung abschließen können."],
    ["4.2", "Frühkindliche Entwicklung", "Frühkindliche Bildung, Betreuung und Entwicklung sollen gute Startchancen ermöglichen."],
    ["4.3", "Berufliche und tertiäre Bildung", "Zugang zu hochwertiger beruflicher, fachlicher und akademischer Bildung soll fairer werden."],
    ["4.4", "Relevante Kompetenzen", "Junge Menschen und Erwachsene sollen Kompetenzen für Arbeit, Teilhabe und Zukunft entwickeln."],
    ["4.5", "Chancengerechtigkeit", "Benachteiligungen und Diskriminierungen im Zugang zu Bildung sollen abgebaut werden."],
    ["4.6", "Grundlegende Lese-, Schreib- und Rechenkompetenzen", "Jugendliche und Erwachsene sollen grundlegende Kompetenzen erwerben können."],
    ["4.7", "Bildung für nachhaltige Entwicklung", "Bildung soll nachhaltige Entwicklung, Menschenrechte, Frieden, Kultur und globale Verantwortung stärken."],
    ["4.a", "Bildungsinfrastruktur", "Lernumgebungen sollen sicher, inklusiv und wirksam gestaltet werden."],
    ["4.b", "Stipendien", "Internationale Bildungszugänge sollen durch Stipendien gestärkt werden."],
    ["4.c", "Lehrkräfte", "Ausbildung und Verfügbarkeit qualifizierter Lehrkräfte sollen verbessert werden."],
  ].map(([code, title, summary]) => ({ code, title, summary, officialUrl: "https://sdgs.un.org/goals/goal4" }));
}

function officialSourcesFor(number) {
  return [
    { label: `UN SDG ${number}`, url: `https://sdgs.un.org/goals/goal${number}` },
    ...officialSources.slice(1),
  ];
}

function relatedToolsFor(number) {
  const common = [{ title: "WÖk-IDs", url: "/werkzeuge/woek-ids/" }, { title: "Scorecards", url: "/werkzeuge/scorecards/" }];
  if (number === 4) return [...common, { title: "Wirkungsportfolio", url: "/werkzeuge/wirkungsportfolio/" }];
  if ([8, 9, 12, 13].includes(number)) return [...common, { title: "Impact Controlling", url: "/werkzeuge/impact-controlling/" }];
  if ([16, 17].includes(number)) return [...common, { title: "Wirkungsrat", url: "/werkzeuge/wirkungsrat/" }];
  return common;
}

function bookAnchorsFor(number) {
  if (number === 4) return ["Bildung als Wirkungsinfrastruktur", "Wirkungskompetenz", "Fach Zukunft", "Von Noten zu Wirkungskompetenzen", "Exkurs: Warum die SDGs der Referenzrahmen der Wirkungsökonomie sind"];
  if (number === 12) return ["Produkte als Wirkungsträger", "Ehrliche Preise", "Produktscorecards", "Konsumwirkung und Verbraucherinformation"];
  if (number === 16) return ["Demokratie als Wirkungsraum", "Wirkung als Rechtsprinzip", "Wirkungsrat", "Öffentlichkeit als Wirkungsraum"];
  return ["Exkurs: Warum die SDGs der Referenzrahmen der Wirkungsökonomie sind", "Wirkung", "Wirkungsbewertung", "Mensch, Planet und Demokratie"];
}

function fieldUrl(field) {
  const map = {
    "Bildung": "/wirkungsfelder/bildung/",
    "Produkte & Konsum": "/wirkungsfelder/produkte-konsum/",
    "Wirtschaft & Unternehmen": "/wirkungsfelder/wirtschaft-unternehmen/",
    "Staat, Recht & Demokratie": "/wirkungsfelder/staat-recht-demokratie/",
    "Wohnen & Stadt": "/wirkungsfelder/wohnen-stadt/",
    "Arbeit & Einkommen": "/wirkungsfelder/arbeit-einkommen/",
    "Rente & soziale Sicherung": "/wirkungsfelder/rente-soziale-sicherung/",
    "Gesundheit & Pflege": "/wirkungsfelder/gesundheit-pflege/",
    "Finanzsystem & Kapital": "/wirkungsfelder/finanzsystem-kapital/",
    "Medien & Öffentlichkeit": "/wirkungsfelder/medien-oeffentlichkeit/",
    "Wissenschaft, Innovation & Digitalisierung": "/wirkungsfelder/wissenschaft-innovation-digitalisierung/",
    "Kultur, Identität & Resonanz": "/wirkungsfelder/kultur-identitaet-resonanz/",
    "Klima, Energie & Ressourcen": "/wirkungsfelder/klima-energie-ressourcen/",
  };
  return map[field] || "/wirkungsfelder/";
}

function toolUrl(title) {
  const map = {
    "Wirkungsrat": "/werkzeuge/wirkungsrat/",
    "Wirkungshaushalt": "/werkzeuge/wirkungshaushalt/",
    "WÖk-IDs": "/werkzeuge/woek-ids/",
    "Digitale Produktpässe": "/werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/",
    "LawReader": "/werkstatt/gesetze/wirkungssteuergesetz/",
    "LawReference": "/werkstatt/gesetze/wirkungssteuergesetz/",
    "Wirkungsprüfung": "/werkzeuge/woek-ids/",
    "Wirkungsberichte": "/werkstatt/",
    "Wirkungsförderung": "/wirkungsfelder/bildung/",
    "Wirkungsrente": "/wirkungsfelder/rente-soziale-sicherung/",
    "Wirkungseinkommen": "/wirkungsfelder/arbeit-einkommen/",
    "Wirkungsscanner": "/erleben.html",
  };
  return map[title] || "/werkzeuge/";
}

function shorten(title) {
  return title
    .replace(" und ", " ")
    .replace("Bezahlbare und saubere ", "")
    .replace("Menschenwürdige Arbeit und ", "")
    .replace("Nachhaltiger ", "")
    .replace("Frieden, Gerechtigkeit und starke ", "");
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "und")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sdgSlug(number) {
  return {
    1: "sdg-1-keine-armut",
    2: "sdg-2-kein-hunger",
    3: "sdg-3-gesundheit-wohlergehen",
    4: "sdg-4-hochwertige-bildung",
    5: "sdg-5-geschlechtergleichstellung",
    6: "sdg-6-sauberes-wasser-sanitaereinrichtungen",
    7: "sdg-7-bezahlbare-saubere-energie",
    8: "sdg-8-menschenwuerdige-arbeit-wirtschaftswachstum",
    9: "sdg-9-industrie-innovation-infrastruktur",
    10: "sdg-10-weniger-ungleichheiten",
    11: "sdg-11-nachhaltige-staedte-gemeinden",
    12: "sdg-12-nachhaltiger-konsum-produktion",
    13: "sdg-13-klimaschutz",
    14: "sdg-14-leben-unter-wasser",
    15: "sdg-15-leben-an-land",
    16: "sdg-16-frieden-gerechtigkeit-starke-institutionen",
    17: "sdg-17-partnerschaften",
  }[number];
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

function externalLink(source) {
  return `<a class="text-link" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)} <span class="sr-only">(externe Quelle)</span></a>`;
}

function page({ rel, title, description, searchSection = "Verstehen", searchType = "Referenz", canonicalOverride = "", headExtra = "", body }) {
  const base = baseFor(rel);
  const route = routeFor(rel);
  const canonical = canonicalOverride || `${SITE}${route}`;
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
    ${headExtra}
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
}

function printActions(extra = "") {
  return `<div class="hero-actions no-print">
      <button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>
      ${extra}
    </div>`;
}

function citeAnchor(id, label = "Zitierlink zu diesem Abschnitt") {
  return `<a class="cite-anchor no-print" href="#${id}" aria-label="${escapeHtml(label)}">#</a>`;
}

function sectionTitle(id, text) {
  return `<h2 id="${id}">${escapeHtml(text)} ${citeAnchor(id)}</h2>`;
}

function badge(item, base = "") {
  const url = href(base, item.url);
  const popoverId = `sdg-popover-${item.id}-${++badgeCounter}`;
  return `<span class="sdg-ref" data-sdg-id="${escapeHtml(item.id)}">
    <a class="sdg-ref-link" href="${url}" aria-label="${escapeHtml(`${item.shortTitle || item.title}: ${item.hoverText}`)}" aria-describedby="${escapeHtml(popoverId)}">${escapeHtml(item.shortTitle || item.title)}</a>
    <button class="sdg-ref-info" type="button" aria-label="${escapeHtml(`Kurzbeschreibung zu ${item.shortTitle || item.title}: ${item.hoverText}`)}" aria-describedby="${escapeHtml(popoverId)}">i</button>
    <span class="sdg-ref-popover" id="${escapeHtml(popoverId)}" role="tooltip">${escapeHtml(item.hoverText)} <span class="sdg-ref-more">Details öffnen</span></span>
  </span>`;
}

function cardGrid(base, items, cols = "three") {
  return `<div class="card-grid ${cols}">
${items.map((item) => `<article class="card">
        ${item.kicker ? `<p class="card-kicker">${escapeHtml(item.kicker)}</p>` : ""}
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <p class="card-text">${escapeHtml(item.text || item.why || "")}</p>
        ${item.url ? `<div class="portal-card-actions"><a class="text-link" href="${href(base, item.url)}">Öffnen</a></div>` : ""}
      </article>`).join("\n")}
    </div>`;
}

function officialReferencesBlock(item) {
  return `<section class="section" aria-labelledby="official-references">
      <div class="card">
        <p class="hero-kicker">Externe Quellen</p>
        ${sectionTitle("official-references", "Offizielle Referenzen")}
        <p class="card-text">Externe Quellen öffnen in einem neuen Tab. Die wirkungsökonomische Einordnung bleibt bewusst auf wirkungsoekonomie.de online lesbar.</p>
        <div class="model-strip">${item.officialSources.map(externalLink).join("")}</div>
      </div>
    </section>`;
}

function exportBlock() {
  return `<section class="section" aria-labelledby="export-title">
      <div class="card">
        <p class="hero-kicker">Dossier & Export</p>
        ${sectionTitle("export-title", "Seite sichern oder weitergeben")}
        <p class="card-text">Diese Referenzseite kann über den Browserdruck als PDF gespeichert werden. Ein kuratiertes Dossier wird später ergänzt.</p>
        <div class="portal-card-actions no-print">
          <button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>
          <span class="prototype-badge">Dossier in Vorbereitung</span>
        </div>
      </div>
    </section>`;
}

function bookBlock(base, anchors) {
  return `<section class="section" aria-labelledby="book-anchors">
      <div class="section-header">
        <p class="hero-kicker">Online-Buch</p>
        ${sectionTitle("book-anchors", "Anker im Online-Buch")}
        <p>Die präzisen Buchanker werden weiter verfeinert. Bis dahin führen die Links auf die Online-Buch-Hauptseite oder vorhandene Kapitel.</p>
      </div>
      <div class="model-strip">${anchors.map((label) => `<a href="${href(base, "referenz/")}">${escapeHtml(label)}</a>`).join("")}</div>
    </section>`;
}

function overviewPage() {
  page({
    rel: "verstehen/sdgs-sdgplus/index.html",
    title: "SDG-/SDG+-Referenzrahmen | Wirkungsökonomie",
    description: "Die Wirkungsökonomie nutzt die 17 SDGs der Agenda 2030 und SDG+ als Referenzrahmen für Wirkungsbewertung: Mensch, Planet, Demokratie, Medienqualität, Rechtsstaatlichkeit, Zusammenhalt und digitale Selbstbestimmung.",
    body: (base) => `<section class="hero portal-hero">
      <div class="hero-grid">
        <div>
          <nav class="breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}verstehen.html">Verstehen</a></nav>
          <p class="hero-kicker">Referenzrahmen</p>
          <h1>SDG-/SDG+-Referenzrahmen</h1>
          <p class="hero-subtitle">Wie die Wirkungsökonomie die 17 Nachhaltigkeitsziele, Agenda 2030 und SDG+ als Bewertungsrahmen nutzt.</p>
          <p>Die Wirkungsökonomie bewertet Wirkung nicht aus privater Moral heraus. Sie braucht einen öffentlich nachvollziehbaren Referenzrahmen. Die 17 Ziele für nachhaltige Entwicklung der Vereinten Nationen bilden dafür den global verhandelten Ausgangspunkt. Sie beschreiben, welche Zustände weltweit verbessert werden sollen: Armut verringern, Gesundheit stärken, Bildung ermöglichen, Ungleichheiten abbauen, Klima und Ökosysteme schützen, Frieden und Institutionen sichern.</p>
          <p>Die SDGs und SDG+ sind deshalb nicht nur Etiketten. Sie sind der Referenzrahmen, an dem positive, negative und neutrale Wirkung eingeordnet werden. Eine Wirkung ist in der Wirkungsökonomie dann positiv, wenn sie auf Mensch, Planet und Demokratie einzahlt. Sie ist negativ, wenn sie diesen Rahmen schwächt, blockiert oder zerstört.</p>
          ${printActions()}
        </div>
        <aside class="citation-note">
          <p class="card-kicker">SDG+ transparent</p>
          <h2>Keine offizielle UN-Kategorie</h2>
          <p>SDG+ ist keine offizielle UN-Kategorie. SDG+ ist eine transparente Erweiterung der Wirkungsökonomie. Sie ergänzt die 17 SDGs um demokratische, mediale, rechtsstaatliche, soziale und digitale Voraussetzungen, ohne die positive Netto-Wirkung für Mensch, Planet und Demokratie nicht stabil erreicht werden kann.</p>
        </aside>
      </div>
    </section>
    <section class="section" aria-labelledby="sdg-list">
      <div class="section-header">
        <p class="hero-kicker">Agenda 2030</p>
        ${sectionTitle("sdg-list", "Die 17 SDGs")}
        <p>Die Sustainable Development Goals sind der gemeinsame Zielrahmen der Agenda 2030. Sie machen sichtbar, dass nachhaltige Entwicklung Armut, Ernährung, Gesundheit, Bildung, Gleichstellung, Wasser, Energie, Arbeit, Industrie, Ungleichheit, Städte, Konsum, Ökosysteme, Frieden und Partnerschaften umfasst.</p>
      </div>
      <div class="sdg-reference-grid">${sdgs.map((item) => `<article class="card"><p class="card-kicker">SDG ${item.number}</p><h3 class="card-title">${escapeHtml(item.title)}</h3><p class="card-text">${escapeHtml(item.hoverText)}</p><div class="portal-card-actions">${badge(item, base)}</div></article>`).join("")}</div>
    </section>
    <section class="section" id="sdgplus" aria-labelledby="why-sdgplus">
      <div class="section-header">
        <p class="hero-kicker">WÖk-Erweiterung</p>
        ${sectionTitle("why-sdgplus", "Warum SDG+?")}
        <p>Die SDGs sind für die Wirkungsökonomie notwendig, aber nicht vollständig ausreichend. Sie sind Zielräume, keine vollständige Rückkopplungsarchitektur. Sie sagen, welche Zustände verbessert werden sollen, erklären aber nicht allein, wie Wirkung in Preise, Steuern, Kapitalzugang, Beschaffung, Haushalt, Medien, Rechtsschutz und demokratische Korrektur zurückgeführt wird.</p>
        <p>Zudem behandeln sie einige Wirkungsräume des 21. Jahrhunderts nicht in der Tiefe, die für Mensch, Planet und Demokratie notwendig ist: digitale Öffentlichkeit, Plattformmacht, Desinformation, algorithmische Manipulation, Medienqualität, Diskursfähigkeit, institutionelles Vertrauen und digitale Selbstbestimmung.</p>
        <p><strong>SDG+ bedeutet daher nicht, die SDGs zu ersetzen. SDG+ bedeutet, sie wirkungsökonomisch zu erweitern.</strong></p>
        <p>SDG+ macht sichtbar, dass eine Wirkung nicht ausreichend positiv sein kann, wenn sie ökologische oder soziale Vorteile erzeugt, aber demokratische Korrekturfähigkeit beschädigt. Ein digitales System kann effizient sein und zugleich Überwachung verstärken. Eine Plattform kann Bildung verbreiten und zugleich Desinformation skalieren. Ein Produkt kann emissionsarm sein und zugleich Menschenrechte verletzen.</p>
      </div>
    </section>
    <section class="section" aria-labelledby="sdgplus-detail">
      <div class="section-header">
        <p class="hero-kicker">SDG+ im Detail</p>
        ${sectionTitle("sdgplus-detail", "Sieben Erweiterungsdimensionen")}
        <p class="scanner-notice"><strong>Pflichthinweis:</strong> SDG+ ist keine offizielle UN-Kategorie. SDG+ ist eine transparente Erweiterung der Wirkungsökonomie. Sie ergänzt die 17 SDGs um demokratische, mediale, rechtsstaatliche, soziale und digitale Voraussetzungen, ohne die positive Netto-Wirkung für Mensch, Planet und Demokratie nicht stabil erreicht werden kann.</p>
      </div>
      <div class="sdg-reference-grid">${sdgPlus.map((item) => `<article class="card"><p class="card-kicker">SDG+</p><h3 class="card-title">${escapeHtml(item.title)}</h3><p class="card-text">${escapeHtml(item.hoverText)}</p><div class="portal-card-actions">${badge(item, base)}</div></article>`).join("")}</div>
    </section>
    ${sdgPlus.map((item) => sdgPlusInlineSection(item, base)).join("")}
    <section class="section" aria-labelledby="usage">
      <div class="section-header">
        <p class="hero-kicker">Website-Logik</p>
        ${sectionTitle("usage", "Wie SDG+ auf der Website verwendet wird")}
        <p>Auf allen Wirkungsfeld- und Werkzeugseiten zeigen SDG-/SDG+-Blöcke nicht nur Badges an, sondern öffnen Referenzen: Hover, Fokus und Tap zeigen eine Kurzdefinition; ein Klick führt auf diese Referenzseite oder den passenden Anker.</p>
        <p>Die Detailbereiche erklären Unterdimensionen, WÖk-Bedeutung, Quellen, Buchanker und Wirkungsgrenzen. Glossar-Begriffe wie SDG, SDG+, Agenda 2030, positive Netto-Wirkung und Mensch, Planet und Demokratie werden damit zitierfähig verknüpft.</p>
      </div>
    </section>
    <section class="section" aria-labelledby="woekids-sdgplus">
      <div class="download-card">
        <div>
          <p class="card-kicker">WÖk-IDs</p>
          ${sectionTitle("woekids-sdgplus", "WÖk-IDs und SDG+")}
          <p class="card-text">WÖk-IDs sind der methodische Brückenschritt zwischen SDG-/SDG+-Referenzrahmen und messbarer Wirkungsbewertung. Für SDG+ werden Indikatorfamilien wie Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, Vertrauen, Zusammenhalt und digitale Selbstbestimmung anschlussfähig gemacht.</p>
        </div>
        <a class="btn btn-secondary no-print" href="${href(base, "werkzeuge/woek-ids/")}">WÖk-IDs öffnen</a>
      </div>
    </section>
    ${sdgPlusDownloadBlock(base)}
    ${officialReferencesBlock({ officialSources })}
    ${bookBlock(base, ["Exkurs: Warum die SDGs der Referenzrahmen der Wirkungsökonomie sind", "SDG+ als Erweiterung der Wirkungsökonomie", "Kapitel 28 - Demokratie als Wirkungsraum", "Kapitel 31 - WÖk-IDs und Indikatorenarchitektur", "Kapitel 32 - Benchmarks, Skalen und Scorecards", "Kapitel 33 - Reverse Merit Order", "Kapitel 36 - Wirkung als Rechtsprinzip", "Kapitel 40 - Wirkungsrat", "Kapitel 102 - Agenda 2030, SDGs, SDG+ und Verschwörungsnarrative"])}
    <section class="section" aria-labelledby="glossary-anchors">
      <div class="section-header">
        <p class="hero-kicker">Glossar</p>
        ${sectionTitle("glossary-anchors", "Glossar- und Begriffanker")}
        <p>Die Begriffe SDGs, SDG+, Agenda 2030, SDG-/SDG+-Referenzrahmen und positive Netto-Wirkung werden im Glossar mit dieser Seite verknüpft.</p>
        <div class="model-strip">
          <a href="${href(base, "glossar.html#begriff-sdgs")}">SDGs</a>
          <a href="${href(base, "glossar.html#begriff-sdg-plus")}">SDG+</a>
          <a href="${href(base, "glossar.html#begriff-agenda-2030")}">Agenda 2030</a>
          <a href="${href(base, "glossar.html#begriff-sdg-sdgplus-referenzrahmen")}">SDG-/SDG+-Referenzrahmen</a>
          <a href="${href(base, "glossar.html#begriff-positive-netto-wirkung")}">Positive Netto-Wirkung</a>
        </div>
      </div>
    </section>
    ${exportBlock()}`,
  });
}

function listBlock(title, items) {
  return `<div class="card">
        <h3 class="card-title">${escapeHtml(title)}</h3>
        <ul class="portal-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>`;
}

function sdgPlusInlineSection(item, base) {
  return `<section class="section" id="${escapeHtml(item.id)}" aria-labelledby="${escapeHtml(item.id)}-title">
      <div class="section-header">
        <p class="hero-kicker">SDG+ Dimension</p>
        <h2 id="${escapeHtml(item.id)}-title">${escapeHtml(item.title)} ${citeAnchor(item.id, `Zitierlink zu ${item.title}`)}</h2>
        <p>${escapeHtml(item.hoverText)}</p>
      </div>
      <div class="card-grid two">
        <article class="card">
          <h3 class="card-title">Definition</h3>
          <p class="card-text">${escapeHtml(item.woekMeaning)}</p>
        </article>
        <article class="card">
          <h3 class="card-title">Warum diese Dimension nötig ist</h3>
          <p class="card-text">${escapeHtml(item.whyNeeded)}</p>
        </article>
      </div>
      <div class="card">
        <h3 class="card-title">Anschluss an offizielle SDGs</h3>
        <p class="card-text">${escapeHtml(item.officialSdgConnection)}</p>
        <div class="model-strip">${item.relatedSdgs.map((id) => badge(byId[id], base)).join("")}</div>
      </div>
      <div class="card-grid two">
        ${listBlock("Unterdimensionen", item.subdimensions)}
        ${listBlock("Mögliche Indikator- und WÖk-ID-Familien", item.indicatorFamilies)}
        ${listBlock("Relevante Wirkungsfelder", item.fields)}
        ${listBlock("Kontextbezogene Werkzeuge", item.tools)}
      </div>
      <div class="scanner-notice" role="note">
        <strong>Wirkungsgrenzen / rote Linien:</strong>
        <ul class="portal-list">${item.redLines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
      </div>
    </section>`;
}

function sdgPlusDownloadBlock(base) {
  const exists = fs.existsSync(path.join(ROOT, sdgPlusDownload.file));
  return `<section class="section" aria-labelledby="sdgplus-download">
      <div class="download-card">
        <div>
          <p class="card-kicker">Download / Dossier</p>
          ${sectionTitle("sdgplus-download", "SDG+ Arbeitspapier")}
          <p class="card-text">${escapeHtml(sdgPlusDownload.description)}</p>
        </div>
        ${exists
          ? `<a class="btn btn-primary no-print" href="${href(base, sdgPlusDownload.href)}">${escapeHtml(sdgPlusDownload.title)}</a>`
          : '<span class="prototype-badge">Arbeitsdokument folgt</span>'}
      </div>
    </section>`;
}

function sdgDetailPage(item) {
  const isPlus = item.type === "sdgplus";
  if (isPlus) {
    page({
      rel: `verstehen/sdgs-sdgplus/${item.slug}/index.html`,
      title: `${item.title} | Wirkungsökonomie`,
      description: `${item.title} ist Teil der kanonischen SDG-/SDG+-Referenzseite.`,
      canonicalOverride: `${SITE}/verstehen/sdgs-sdgplus/#${item.id}`,
      headExtra: `<meta http-equiv="refresh" content="0; url=../#${item.id}">`,
      body: (base) => `<section class="hero portal-hero">
        <div class="hero-content">
          <p class="hero-kicker">Weiterleitung</p>
          <h1>${escapeHtml(item.title)}</h1>
          <p class="hero-subtitle">SDG+ wird auf der kanonischen SDG-/SDG+-Referenzseite geführt.</p>
          <p><a class="btn btn-primary" href="${href(base, `verstehen/sdgs-sdgplus/#${item.id}`)}">Zum Abschnitt ${escapeHtml(item.title)}</a></p>
        </div>
      </section>`,
    });
    return;
  }
  page({
    rel: `verstehen/sdgs-sdgplus/${item.slug}/index.html`,
    title: `${item.title.replace(" - ", " ")} | Wirkungsökonomie`,
    description: isPlus
      ? `${item.title} ist eine transparente Erweiterung der Wirkungsökonomie: ${item.hoverText}`
      : `${item.title} erklärt: offizielle Quellen, Deutschland-/Europa-Bezug, Wirkungsfelder, Werkzeuge und Bedeutung für positive Netto-Wirkung.`,
    body: (base) => `<section class="hero portal-hero">
      <div class="hero-content">
        <nav class="breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}verstehen/sdgs-sdgplus/">SDG-/SDG+-Referenzrahmen</a></nav>
        <p class="hero-kicker">${isPlus ? "SDG+ der Wirkungsökonomie" : "Referenzrahmen · Offizielles UN-Ziel der Agenda 2030"}</p>
        <h1>${escapeHtml(item.title)}</h1>
        <p class="hero-subtitle">${escapeHtml(item.hoverText)}</p>
        <p>${escapeHtml(isPlus ? item.officialDescription : item.officialDescription)}</p>
        ${printActions(`<a class="btn btn-primary" href="${href(base, "verstehen/sdgs-sdgplus/")}">Referenzrahmen öffnen</a>`)}
      </div>
    </section>
    ${isPlus ? sdgPlusNotice() : ""}
    <section class="section" aria-labelledby="short">
      <div class="section-header">
        <p class="hero-kicker">Kurz erklärt</p>
        ${sectionTitle("short", "Kurz erklärt")}
        <p>${escapeHtml(item.officialDescription)}</p>
        <p>Wirkung ist nicht automatisch positiv. Sie beschreibt tatsächliche Zustandsveränderungen, die im Referenzrahmen von SDGs, Agenda 2030 und SDG+ positiv, negativ oder neutral eingeordnet werden können.</p>
      </div>
    </section>
    ${isPlus ? sdgPlusSections(item, base) : sdgSections(item, base)}
    ${bookBlock(base, item.relatedBookAnchors)}
    ${officialReferencesBlock(item)}
    ${exportBlock()}`,
  });
}

function sdgSections(item, base) {
  return `<section class="section" aria-labelledby="targets">
      <div class="section-header">
        <p class="hero-kicker">UN-Zielstruktur</p>
        ${sectionTitle("targets", "Offizielle Unterziele")}
        <p>Die Unterziele werden bewusst kurz paraphrasiert und mit der offiziellen UN-Zielseite verlinkt. Lange offizielle Texte werden nicht kopiert.</p>
      </div>
      ${cardGrid(base, item.targets.map((target) => ({ title: target.code + " " + target.title, text: target.summary, url: target.officialUrl })))}
    </section>
    <section class="section" aria-labelledby="de-eu">
      <div class="section-header">
        <p class="hero-kicker">Deutschland und Europa</p>
        ${sectionTitle("de-eu", "Relevanz für Deutschland und Europa")}
        <p>${escapeHtml(item.germanyEuropeRelevance)}</p>
        <p>Relevante Unterziele im deutschen/europäischen Kontext: ${escapeHtml(item.relevantTargetsGermanyEurope.join(", "))}.</p>
      </div>
    </section>
    ${woekMeaningBlock(item)}
    ${relationsBlock(base, item)}
    ${woekIdsBlock(base)}
    ${sdgPlusInteractionBlock(base, item)}`;
}

function sdgPlusSections(item, base) {
  return `<section class="section" aria-labelledby="why-needed">
      <div class="section-header">
        <p class="hero-kicker">Warum nötig?</p>
        ${sectionTitle("why-needed", "Warum diese Dimension nötig ist")}
        <p>Die 17 SDGs sind der globale Zielrahmen. SDG+ ergänzt sie dort, wo demokratische, mediale, rechtsstaatliche und digitale Voraussetzungen darüber entscheiden, ob nachhaltige Entwicklung stabil erreicht werden kann.</p>
      </div>
    </section>
    ${woekMeaningBlock(item)}
    <section class="section" aria-labelledby="official-sdg-links">
      <div class="section-header">
        <p class="hero-kicker">Offizielle SDG-Bezüge</p>
        ${sectionTitle("official-sdg-links", "Bezug zu offiziellen SDGs")}
        <p>SDG+ ersetzt keine offiziellen UN-Ziele. Es ergänzt insbesondere SDG 16 und SDG 17 und steht häufig in Wechselwirkung mit SDG 4, SDG 10 und SDG 11.</p>
        <div class="model-strip">${["sdg-16", "sdg-17", "sdg-4", "sdg-10", "sdg-11"].map((id) => badge(byId[id], base)).join("")}</div>
      </div>
    </section>
    ${relationsBlock(base, item)}
    ${woekIdsBlock(base)}`;
}

function sdgPlusNotice() {
  return `<section class="section narrow">
      <div class="scanner-notice" role="note">
        <strong>Keine offizielle UN-Kategorie:</strong> SDG+ ist eine transparente Erweiterung der Wirkungsökonomie. Sie ergänzt die SDGs um demokratische, mediale, rechtsstaatliche und digitale Voraussetzungen, ohne die nachhaltige Entwicklung nicht stabil erreicht werden kann.
      </div>
    </section>`;
}

function woekMeaningBlock(item) {
  return `<section class="section" aria-labelledby="woek-meaning">
      <div class="section-header">
        <p class="hero-kicker">Wirkungsökonomie</p>
        ${sectionTitle("woek-meaning", "Wirkungsökonomische Bedeutung")}
        <p>${escapeHtml(item.woekMeaning)}</p>
        <p>Zielgröße ist positive Netto-Wirkung für Mensch, Planet und Demokratie. Negative Wirkung muss sichtbar bleiben und darf nicht durch positive Einzelwerte schöngerechnet werden.</p>
      </div>
    </section>`;
}

function relationsBlock(base, item) {
  return `<section class="section" aria-labelledby="fields">
      <div class="section-header">
        <p class="hero-kicker">Kontext</p>
        ${sectionTitle("fields", "Konkrete Bedeutung in Wirkungsfeldern")}
      </div>
      ${cardGrid(base, item.relatedWirkungsfelder)}
    </section>
    <section class="section" aria-labelledby="tools">
      <div class="section-header">
        <p class="hero-kicker">Methodik</p>
        ${sectionTitle("tools", "Werkzeuge und WÖk-IDs")}
      </div>
      ${cardGrid(base, item.relatedWerkzeuge)}
    </section>`;
}

function woekIdsBlock(base) {
  return `<section class="section" aria-labelledby="woek-ids">
      <div class="download-card">
        <div>
          <p class="card-kicker">WÖk-IDs</p>
          ${sectionTitle("woek-ids", "Relevante WÖk-IDs")}
          <p class="card-text">Die maschinenlesbare SDG-/WÖk-ID-Verknüpfung wird weiter ausgebaut. WÖk-IDs sind der methodische Brückenschritt zwischen SDG-/SDG+-Referenzrahmen und messbarer Wirkungsbewertung.</p>
        </div>
        <a class="btn btn-secondary no-print" href="${href(base, "werkzeuge/woek-ids/")}">WÖk-IDs öffnen</a>
      </div>
    </section>`;
}

function sdgPlusInteractionBlock(base, item) {
  const plus = ["sdgplus-demokratie", "sdgplus-medienqualitaet", "sdgplus-rechtsstaatlichkeit", "sdgplus-diskursfaehigkeit", "sdgplus-institutionelles-vertrauen", "sdgplus-gesellschaftlicher-zusammenhalt", "sdgplus-digitale-selbstbestimmung"];
  return `<section class="section" aria-labelledby="plus-interactions">
      <div class="section-header">
        <p class="hero-kicker">Wechselwirkungen</p>
        ${sectionTitle("plus-interactions", "SDG+ Wechselwirkungen")}
        <p>Dieses SDG kann nur stabil wirken, wenn demokratische, mediale, rechtsstaatliche und digitale Voraussetzungen mitgedacht werden.</p>
        <div class="model-strip">${plus.map((id) => badge(byId[id], base)).join("")}</div>
      </div>
    </section>`;
}

function dataFiles() {
  const serializable = references.map((item) => ({
    id: item.id,
    type: item.type,
    number: item.number || null,
    title: item.title,
    shortTitle: item.shortTitle,
    slug: item.slug,
    anchor: item.anchor || "",
    url: item.url,
    legacyUrl: item.legacyUrl || "",
    isOfficialUNGoal: item.type === "sdg",
    officialNote: item.officialNote || "",
    hoverText: item.hoverText,
    officialDescription: item.officialDescription,
    woekMeaning: item.woekMeaning,
    whyNeeded: item.whyNeeded || "",
    officialSdgConnection: item.officialSdgConnection || "",
    relatedSdgs: item.relatedSdgs || [],
    subdimensions: item.subdimensions || [],
    indicatorFamilies: item.indicatorFamilies || [],
    redLines: item.redLines || [],
    germanyEuropeRelevance: item.germanyEuropeRelevance,
    targets: item.targets,
    relevantTargetsGermanyEurope: item.relevantTargetsGermanyEurope || [],
    officialSources: item.officialSources,
    relatedWirkungsfelder: item.relatedWirkungsfelder,
    relatedWerkzeuge: item.relatedWerkzeuge,
    relatedBookAnchors: item.relatedBookAnchors,
    sdgPlusNote: item.type === "sdgplus" ? "SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie." : "",
  }));
  fs.mkdirSync(path.join(ROOT, "assets/data"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "assets/data/sdg-reference.json"), `${JSON.stringify(serializable, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(ROOT, "assets/js/sdg-data.js"), `window.WOEK_SDG_REFERENCES = ${JSON.stringify(serializable, null, 2)};\n`, "utf8");
}

function enhanceExistingBadges() {
  const htmlFiles = [...fs.readdirSync(ROOT, { recursive: true })]
    .filter((name) => typeof name === "string" && name.endsWith(".html"))
    .filter((name) => !name.startsWith("node_modules/") && !name.startsWith("woek-akademie-app/"));
  for (const rel of htmlFiles) {
    const file = path.join(ROOT, rel);
    let html = fs.readFileSync(file, "utf8");
    if (!html.includes("portal-reference-block")) continue;
    const base = baseFor(rel);
    let updated = html.replace(
      /(<div class="portal-reference-block">[\s\S]*?<div class="model-strip">)([\s\S]*?)(<\/div>)/g,
      (match, prefix, strip, suffix) => {
        const ids = [...strip.matchAll(/data-sdg-id="([^"]+)"/g)].map((hit) => hit[1]);
        const labels = [...strip.matchAll(/<span>([^<]+)<\/span>/g)].map((hit) => hit[1]);
        const items = [...ids.map((id) => byId[id]).filter(Boolean), ...labels.map(findReference).filter(Boolean)];
        return items.length ? `${prefix}${items.map((item) => badge(item, base)).join("")}${suffix}` : match;
      },
    ).replace(
      /(<div class="model-strip">)(\s*(?:<span>[^<]+<\/span>\s*)+)(<\/div>)/g,
      (match, prefix, strip, suffix) => {
        const labels = [...strip.matchAll(/<span>([^<]+)<\/span>/g)].map((hit) => hit[1]);
        const items = labels.map(findReference).filter(Boolean);
        return items.length === labels.length ? `${prefix}${items.map((item) => badge(item, base)).join("")}${suffix}` : match;
      },
    ).replace(
      /SDG\+ ist keine offizielle UN-Kategorie/g,
      `<a class="text-link" href="${href(base, "verstehen/sdgs-sdgplus/#sdgplus")}">SDG+</a> ist keine offizielle UN-Kategorie`,
    );
    updated = updated.replace(
      /<span class="sdg-ref" data-sdg-id="([^"]+)">\s*<a class="sdg-ref-link"[\s\S]*?<\/a>\s*<button class="sdg-ref-info"[\s\S]*?<\/button>\s*<span class="sdg-ref-popover"[\s\S]*?<span class="sdg-ref-more">[\s\S]*?<\/span>\s*<\/span>\s*<\/span>/g,
      (match, id) => byId[id] ? badge(byId[id], base) : match,
    );
    let cleaned;
    do {
      cleaned = updated;
      updated = updated.replace(/(<\/span>\s*<\/span>\s*<\/span>\s*)<\/span>(?=\s*(?:<span class="sdg-ref"|<\/div>))/g, "$1");
    } while (updated !== cleaned);
    if (updated !== html) fs.writeFileSync(file, updated, "utf8");
  }
}

function findReference(label) {
  const normalized = label.toLowerCase().trim();
  const sdgMatch = normalized.match(/^sdg\s*(\d+)/);
  if (sdgMatch) return byId[`sdg-${sdgMatch[1]}`];
  const plusLabel = normalized.replace(/^sdg\+\s*/, "");
  const plus = sdgPlus.find((item) => normalized === item.shortTitle.toLowerCase() || plusLabel === item.shortTitle.toLowerCase().replace(/^sdg\+\s*/, "") || plusLabel === item.title.toLowerCase().replace(/^sdg\+\s*/, ""));
  return plus || null;
}

function aliasPage() {
  page({
    rel: "referenzrahmen/sdgs-sdgplus/index.html",
    title: "SDG-/SDG+-Referenzrahmen | Wirkungsökonomie",
    description: "Alias zur kanonischen SDG-/SDG+-Referenzrahmen-Seite.",
    canonicalOverride: `${SITE}/verstehen/sdgs-sdgplus/`,
    headExtra: '<meta http-equiv="refresh" content="0; url=../../verstehen/sdgs-sdgplus/">',
    body: (base) => `<section class="hero portal-hero">
      <div class="hero-content">
        <p class="hero-kicker">Alias</p>
        <h1>SDG-/SDG+-Referenzrahmen</h1>
        <p class="hero-subtitle">Diese Seite verweist auf die kanonische Referenz unter /verstehen/sdgs-sdgplus/.</p>
        <p><a class="btn btn-primary" href="${href(base, "verstehen/sdgs-sdgplus/")}">Referenzrahmen öffnen</a></p>
      </div>
    </section>`,
  });
}

function enhanceGlossary() {
  const file = path.join(ROOT, "glossar.html");
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  const agendaEntry = '<div><dt id="begriff-agenda-2030">Agenda 2030</dt><dd>Die Agenda 2030 ist der internationale Rahmen der Vereinten Nationen für nachhaltige Entwicklung. Ihre 17 SDGs bilden den globalen Zielrahmen, an den die Wirkungsökonomie anschließt. <a class="text-link" href="verstehen/sdgs-sdgplus/">Mehr zum SDG-/SDG+-Referenzrahmen</a>.</dd></div>';
  if (!html.includes('id="begriff-agenda-2030"')) {
    html = html.replace('<div><dt id="begriff-sdgs">', `${agendaEntry}\n            <div><dt id="begriff-sdgs">`);
  }
  const frameEntry = '<div><dt id="begriff-sdg-sdgplus-referenzrahmen">SDG-/SDG+-Referenzrahmen</dt><dd>Der SDG-/SDG+-Referenzrahmen verbindet die offiziellen 17 Nachhaltigkeitsziele der Vereinten Nationen mit SDG+ als Wirkungsökonomie-Erweiterung. Er dient dazu, positive, negative und neutrale Wirkung öffentlich nachvollziehbar einzuordnen. <a class="text-link" href="verstehen/sdgs-sdgplus/">Referenzrahmen öffnen</a>.</dd></div>';
  if (!html.includes('id="begriff-sdg-sdgplus-referenzrahmen"')) {
    html = html.replace('<div><dt id="begriff-sdgs">', `${frameEntry}\n            <div><dt id="begriff-sdgs">`);
  }
  html = html.replace(
    /<div><dt id="begriff-sdgs">SDGs<\/dt><dd>[\s\S]*?<\/dd><\/div>/,
    '<div><dt id="begriff-sdgs">SDGs</dt><dd>Die Sustainable Development Goals sind die 17 Ziele der Agenda 2030 der Vereinten Nationen. Sie bilden den global verhandelten Referenzrahmen für nachhaltige Entwicklung. In der Wirkungsökonomie dienen sie als zentrale Grundlage zur Bewertung, ob Wirkung Mensch, Planet und Demokratie stärkt oder schwächt. <a class="text-link" href="verstehen/sdgs-sdgplus/">Mehr zum SDG-/SDG+-Referenzrahmen</a>. Verwandt: <a class="text-link" href="#begriff-nachhaltigkeit">Nachhaltigkeit</a>, <a class="text-link" href="#begriff-sdg-plus">SDG+</a>.</dd></div>',
  );
  html = html.replace(
    /<div><dt id="begriff-sdg-plus">SDG\+<\/dt><dd>[\s\S]*?<\/dd><\/div>/,
    '<div><dt id="begriff-sdg-plus">SDG+</dt><dd>SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie. Sie ergänzt die SDGs um Wirkungsfelder, die für demokratische Stabilität zentral sind: Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, gesellschaftlicher Zusammenhalt, institutionelles Vertrauen und digitale Selbstbestimmung. Für Nachhaltigkeit präzisiert SDG+, dass resiliente Systeme auch demokratische Korrekturräume brauchen. <a class="text-link" href="verstehen/sdgs-sdgplus/#sdgplus">Mehr zu SDG+ im Referenzrahmen</a>.</dd></div>',
  );
  html = html.replace(
    /<div><dt id="begriff-positive-netto-wirkung">Positive Netto-Wirkung<\/dt><dd>[\s\S]*?<\/dd><\/div>/,
    '<div><dt id="begriff-positive-netto-wirkung">Positive Netto-Wirkung</dt><dd>Positive Netto-Wirkung ist die Zielgröße der Wirkungsökonomie: eine zusammengeführte Bewertung positiver und negativer Wirkungen für Mensch, Planet und Demokratie unter Beachtung von Wirkungsgrenzen und Nichtkompensation. Der SDG-/SDG+-Referenzrahmen macht öffentlich nachvollziehbar, woran diese Bewertung anschließt. <a class="text-link" href="verstehen/sdgs-sdgplus/">Mehr zum SDG-/SDG+-Referenzrahmen</a>.</dd></div>',
  );
  fs.writeFileSync(file, html, "utf8");
}

function updateSitemap() {
  const sitemapPath = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) return;
  let sitemap = fs.readFileSync(sitemapPath, "utf8");
  for (const item of sdgPlus) {
    const rel = `verstehen/sdgs-sdgplus/${item.slug}`;
    sitemap = sitemap.replace(new RegExp(`\\s*<url>\\s*<loc>${SITE}/${rel}/</loc>\\s*<lastmod>[^<]+</lastmod>\\s*</url>`, "g"), "");
  }
  const urls = ["verstehen/sdgs-sdgplus/", "referenzrahmen/sdgs-sdgplus/", ...sdgs.map((item) => `verstehen/sdgs-sdgplus/${item.slug}/`)];
  const additions = urls
    .filter((url) => !sitemap.includes(`${SITE}/${url}`))
    .map((url) => `  <url>\n    <loc>${SITE}/${url}</loc>\n    <lastmod>${DATE}</lastmod>\n  </url>`)
    .join("\n");
  if (additions) sitemap = sitemap.replace("</urlset>", `${additions}\n</urlset>`);
  fs.writeFileSync(sitemapPath, sitemap, "utf8");
}

function run() {
  cleanupLegacySlugs();
  dataFiles();
  overviewPage();
  aliasPage();
  for (const item of references) sdgDetailPage(item);
  enhanceExistingBadges();
  enhanceGlossary();
  updateSitemap();
  console.log(`SDG reference generated: ${references.length} detail pages.`);
}

function cleanupLegacySlugs() {
  const legacy = [
    "verstehen/sdgs-sdgplus/sdg-6-sauberes-wasser-sanitareinrichtungen",
    "verstehen/sdgs-sdgplus/sdg-8-menschenwurdige-arbeit-wirtschaftswachstum",
    "verstehen/sdgs-sdgplus/sdg-11-nachhaltige-stadte-gemeinden",
  ];
  for (const rel of legacy) {
    const target = path.join(ROOT, rel);
    if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
  }
  const sitemapPath = path.join(ROOT, "sitemap.xml");
  if (fs.existsSync(sitemapPath)) {
    let sitemap = fs.readFileSync(sitemapPath, "utf8");
    for (const rel of legacy) {
      sitemap = sitemap.replace(new RegExp(`\\s*<url>\\s*<loc>${SITE}/${rel}/</loc>\\s*<lastmod>[^<]+</lastmod>\\s*</url>`, "g"), "");
    }
    fs.writeFileSync(sitemapPath, sitemap, "utf8");
  }
}

run();
