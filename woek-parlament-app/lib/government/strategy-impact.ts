import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { OverviewAssessmentData } from "@/lib/presentation/overview-assessment";
import type { PublicMaturityProjection } from "@/lib/presentation/public-maturity";

export const ACTION_PLAN_META_ID = "WOEK-META-BUND-AKTIONSPLAN-NACHHALTIGKEIT-2026";
export const ACTION_PLAN_ANALYSIS_VERSION = "DRAFT_2026-07-16";

export type ActionPlanMission = {
  parent: typeof ACTION_PLAN_META_ID;
  version: typeof ACTION_PLAN_ANALYSIS_VERSION;
  mission: number;
  id: string;
  title: string;
  lead: string;
  mode: "IMPACT_POTENTIAL_EX_ANTE";
  target: string;
  path: { A: string; M: string; delta_Z: string; R: string };
  risk: string;
  monitor: string[];
  indicator_rule: string;
  direction: "OPEN_TO_CONTEXT";
  evidence: string;
  source: string;
};

export type StrategySource = {
  title: string;
  institution: string;
  url: string;
  documentType: string;
  documentDate: string | null;
  role: "DECISION_FACT" | "EX_ANTE_EVIDENCE" | "NORMATIVE_REFERENCE" | "CALCULATION_INPUT";
  temporalClass: "AVAILABLE_AT_DECISION_TIME" | "CURRENT_REFERENCE";
  abstract: string;
  locations: string[];
  usedBy: "ALL" | "META_AND_M04" | "META";
};

export type StrategyQualityLayer = {
  id: string;
  title: string;
  text: string;
};

export type MissionDeepDive = {
  missionId: string;
  overview: OverviewAssessmentData;
  officialAnchor: string;
  evidenceMaturity: string;
  problemReview: { status: string; text: string; bottleneck?: string };
  goalReview: { status: string; text: string };
  path: { A: string; M: string; deltaZ: string; R: string };
  qualityLayers: StrategyQualityLayer[];
  recommendationStatus: string;
};

const root = path.join(process.cwd(), "data", "government", "strategy-impact");

function readJsonl<T>(name: string): T[] {
  return readFileSync(path.join(root, name), "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as T);
}

export function getActionPlanMissions() {
  return [
    ...readJsonl<ActionPlanMission>("aktionsplan-nachhaltigkeit-2026-missions-01-10.jsonl"),
    ...readJsonl<ActionPlanMission>("aktionsplan-nachhaltigkeit-2026-missions-11-19.jsonl"),
  ].sort((left, right) => left.mission - right.mission);
}

export function getActionPlanMission(id: string) {
  return getActionPlanMissions().find((mission) => mission.id === id);
}

export function getActionPlanMetaMarkdown() {
  return readFileSync(path.join(root, "aktionsplan-nachhaltigkeit-2026-meta.md"), "utf8");
}

export function strategySourceHashes() {
  const names = [
    "aktionsplan-nachhaltigkeit-2026-meta.md",
    "aktionsplan-nachhaltigkeit-2026-missions-01-10.jsonl",
    "aktionsplan-nachhaltigkeit-2026-missions-11-19.jsonl",
    "reviewed-deep-dives-20260820.json",
  ];
  return Object.fromEntries(names.map((name) => [name, createHash("sha256").update(readFileSync(path.join(root, name))).digest("hex")]));
}

export const actionPlanMetaAssessment: OverviewAssessmentData = {
  assessmentLabel: "Überwiegend positives strukturelles Wirkungspotenzial",
  impactCoreSummary: "Der Entwurf übersetzt die Nachhaltigkeitsstrategie in 19 ressortübergreifende Missionen mit konkreteren Zielen, Maßnahmen, Meilensteinen und teilweise Wirkungskennzahlen.",
  editorialSummary: "Der Entwurf besitzt überwiegend positives strukturelles Wirkungspotenzial für staatliche Wirkungsorientierung. Der entscheidende offene Punkt ist nicht, ob Nachhaltigkeit vorkommt, sondern ob der finale Plan Instrument, Mechanismus, Zustandsänderung, Indikatorfunktion, Gegenfaktum, Alternativenvergleich und spätere Zurechnung konsistent und verbindlich verbindet.",
  keyFinding: "Ohne einheitliche Kausal- und Evaluationsarchitektur kann eine zusätzliche Berichts- und Kennzahlenschicht entstehen, in der Mittelabfluss, Projektzahl oder Umsetzungsstand als Wirkung erscheinen.",
  directionLabel: "Überwiegend positives strukturelles Potenzial; Kausalität und Zurechnung bleiben offen",
  directionKind: "conditional",
  evidenceSummary: "Dokument- und Governance-Design sind durch die Beteiligungsfassung hoch belegt. Tatsächliche Outcome- oder Impact-Wirkung ist noch nicht beobachtbar; Attribution ist noch nicht reif.",
  realityCheckSummary: "Ex-ante-Potenzial der Beteiligungsfassung; ein Reality Check steht bis zur Umsetzung und Beobachtung realer Zustandsänderungen aus.",
};

export const actionPlanMetaPaths = [
  {
    title: "Mission Governance",
    A: "19 konkrete Missionen mit Zuständigkeit, Zielen und späteren Maßnahmenpaketen",
    M: "ressortübergreifende Probleme werden stärker als gemeinsame Umsetzungsaufgaben organisiert",
    deltaZ: "Verantwortlichkeit, Koordination und Umsetzungsfokus können steigen",
    R: "Demokratie – staatliche Handlungsfähigkeit; Mensch und Planet je Mission",
    risk: "Missionen können zu einer zusätzlichen Berichtsschicht werden, wenn Ressortentscheidungen, Budgets und Evaluation nicht tatsächlich daran gekoppelt sind.",
  },
  {
    title: "Wirkungsorientierte Haushaltssteuerung",
    A: "Fortschritts- und Wirkungskennzahlen für das Sondervermögen Infrastruktur und Klimaneutralität",
    M: "Investitionen werden nicht nur nach Mittelabfluss, sondern stärker nach Ergebnis und Wirkung beobachtet",
    deltaZ: "Mittelallokation und Nachsteuerung können zielgenauer werden",
    R: "Demokratie – Handlungsfähigkeit; Wirtschaft und Planet abhängig vom Programm",
    risk: "Leicht messbare Outputs können schwer messbare Outcomes verdrängen; ein fehlendes Gegenfaktum lässt Mitnahmeeffekte unsichtbar.",
  },
  {
    title: "Wirkungsorientiertere Gesetzgebung",
    A: "frühere, vollständigere Nachhaltigkeitsprüfung mit stärkerer Ex-ante-Effektbetrachtung",
    M: "Zielkonflikte und Nebenwirkungen werden vor Kabinetts- und Parlamentsentscheidung sichtbarer",
    deltaZ: "Entwürfe können frühzeitig verbessert oder verworfen werden",
    R: "Mensch, Planet und Demokratie; SDG und SDG+; Recht separat",
    risk: "Rein formale Compliance ohne nachvollziehbare Wirkmechanismen und Optionsvergleich.",
  },
  {
    title: "Wirkungslernen",
    A: "Ziele, Meilensteine, Monitoring und teilweise Wirksamkeitsmessung",
    M: "Umsetzung und reale Zustände werden über Zeit beobachtbar",
    deltaZ: "politische Lern- und Nachsteuerungsfähigkeit kann steigen",
    R: "Demokratie – lernfähige Steuerung",
    risk: "Wenn Ex-ante-Hypothesen nicht versioniert erhalten bleiben, kann später nicht sauber geprüft werden, was ursprünglich erwartet wurde.",
  },
];

export const actionPlanMetaQualityLayers: StrategyQualityLayer[] = [
  { id: "material-omissions", title: "Materielle Auslassungen", text: "Die Beteiligungsfassung enthält keinen für alle Missionen einheitlich verpflichtenden Mindeststandard für Baseline, Mechanismus, Zustandsziel, Datenfunktion, Gegenfaktum oder Contribution-Ansatz, Alternativenvergleich, Verteilung, Schutzgrenzen und Recheck. Diese Lücke betrifft die planweite Verbindlichkeit; sie bedeutet nicht, dass jedes einzelne Missionsdesign alle Elemente vermissen lässt." },
  { id: "policy-coherence", title: "Policy-Kohärenz", text: "Ressort- und sektorübergreifende Missionen besitzen positives Kohärenzpotenzial. Eine explizite Cross-Mission-Interaktionsmatrix für Synergien, Zielkonflikte, Doppelsteuerung, widersprüchliche Anreize und Bund-, EU- oder Länder-Abhängigkeiten bleibt in der Beteiligungsfassung offen." },
  { id: "delivery-feasibility", title: "Umsetzungs- und Delivery-Realismus", text: "Der Staatssekretärsausschuss schafft Governance, doch die praktische Umsetzung bleibt missionsspezifisch. Zuständigkeit, Personal-, IT-, Beschaffungs-, Genehmigungs- und Vollzugskapazität, Sequenz sowie externe Abhängigkeiten müssen getrennt vom Policy Design sichtbar werden." },
  { id: "resource-financing", title: "Ressourcen, Finanzierung und Opportunitätskosten", text: "Für die heterogenen 19 Missionen ist kein seriöser planweiter Finanzierungs- oder Additionalitätsbefund möglich. Mittelherkunft, Zusätzlichkeit, reale Engpässe, Lebenszyklus- und Betriebskosten sowie Opportunitätskosten müssen auf Ebene der jeweiligen Mission oder ihrer Child-Cases geprüft werden." },
  { id: "spatial-distribution", title: "Räumliche und betroffenenbezogene Verteilung", text: "Stadt und Land, Regionen, Einkommens- und Altersgruppen, Haushalte und Unternehmen, vulnerable Gruppen und zukünftige Generationen müssen missionsspezifisch geprüft werden; eine planweite Verteilungseinordnung ist nicht belastbar aggregierbar." },
  { id: "international-leakage", title: "Internationale Spillover und Leakage", text: "Nationale Zielerreichung darf importierte Emissionen, Ressourcen- oder Soziallasten nicht verstecken. Internationale Verlagerungswirkungen sind überall dort gesondert zu prüfen, wo sie materiell sind." },
  { id: "robustness", title: "Robustheit und Stress-Test", text: "Für materielle Missionen bleibt zu prüfen, ob Zielpfade auch bei plausiblen Energiepreis-, Zins-, Fachkräfte-, Klimaextrem- oder geopolitischen Abweichungen tragen. Die Beteiligungsfassung besitzt keinen einheitlichen planweiten Stress-Test-Standard." },
  { id: "lock-in", title: "Reversibilität und Lock-in", text: "Langfristige Infrastruktur-, Technologie- und Investitionspfade müssen missionsspezifisch auf Pfadabhängigkeit, irreversible Lock-ins, Übergangskosten und spätere Korrekturmöglichkeiten geprüft werden. Es gibt keinen zulässigen Meta-Saldo über diese Risiken." },
  { id: "falsification", title: "Falsifikation und Recheck", text: "Der positive Governance-Befund wird gestützt, wenn die finale Fassung je materieller Mission klarere Outcome-Ziele, Mechanismen, Zuständigkeiten, Datenfunktionen, Reviewtermine und Nachsteuerungslogik enthält. Er wird geschwächt, wenn Missionen überwiegend Maßnahmen- oder Outputlisten bleiben, und teilweise widerlegt, wenn Monitoring dauerhaft ohne erkennbare Entscheidungskopplung bleibt." },
  { id: "lifecycle", title: "Politischer Lebenslauf", text: "Kabinettserarbeitungsauftrag vom 5. November 2025 → Beteiligungsfassung vom 16. Juli 2026 → Konsultation → amtlich angekündigte finale Fassung → missionsspezifische Maßnahmen, Rechtsakte und Programme → Implementation → Outcome oder Observation → Reality Check → Revision." },
  { id: "version", title: "Versionsvergleich", text: "Die Beteiligungsfassung vom 16. Juli 2026 bleibt unverändert erhalten. Eine finale Fassung wird als neue Fachfassung geführt; das Delta umfasst mindestens Missionen, Ziele, Instrumente, Kennzahlen und Datenfunktionen, Verantwortlichkeit, Ressourcen, Governance und Wirkungsmessung." },
  { id: "coverage", title: "Abdeckung und Reife", text: "Meta-Fall und 19 Missionsrecords liegen als Ex-ante-Analyse der Beteiligungsfassung vor. Es handelt sich weder um eine finale Plananalyse noch um eine belastbare Attribution bereits eingetretener Wirkung." },
];

export const actionPlanSources: StrategySource[] = [
  {
    title: "Aktionsplan Nachhaltigkeit – Beteiligungsfassung 2026",
    institution: "Bundesregierung / Bundeskanzleramt",
    url: "https://www.bundesregierung.de/resource/blob/992814/2447318/ce245dd460c58c39c04a87878f68608a/2026-07-16-aktionsplan-nachhaltigkeit-data.pdf?download=1",
    documentType: "Amtliche Beteiligungsfassung (PDF)",
    documentDate: "2026-07-16",
    role: "DECISION_FACT",
    temporalClass: "AVAILABLE_AT_DECISION_TIME",
    abstract: "Die amtliche Beteiligungsfassung enthält die fünf Handlungsfelder und 19 Missionen des ersten Entwurfs. Sie belegt Ziele, Instrumente, Meilensteine und angekündigte Kennzahlen; eine eingetretene Wirkung oder kausale Zurechnung folgt daraus nicht.",
    locations: ["gesamte Beteiligungsfassung", "Mission 2: Seiten 9–10", "Mission 4: Seiten 11–12"],
    usedBy: "ALL",
  },
  {
    title: "Aktionsplan Nachhaltigkeit – amtlicher Veröffentlichungsstand",
    institution: "Bundesregierung / Bundeskanzleramt",
    url: "https://www.bundesregierung.de/breg-de/aktuelles/aktionsplan-nachhaltigkeit-2392096",
    documentType: "Amtliche Informationsseite",
    documentDate: "2026-07-16",
    role: "DECISION_FACT",
    temporalClass: "CURRENT_REFERENCE",
    abstract: "Die Bundesregierung führt den veröffentlichten Text als ersten Entwurf beziehungsweise Beteiligungsfassung mit 19 Missionen. Die Seite dokumentiert Konsultation und Planungsstand; eine spätere finale Fassung muss als eigene Version hinzukommen.",
    locations: ["Status der Beteiligungsfassung", "19 Missionen", "Konsultation und Zeitplan"],
    usedBy: "ALL",
  },
  {
    title: "Deutsche Nachhaltigkeitsstrategie 2025",
    institution: "Bundesregierung",
    url: "https://www.bundesregierung.de/breg-de/aktuelles/deutsche-nachhaltigkeitsstrategie-2025-2332540",
    documentType: "Strategische Ziel- und Indikatorenbaseline",
    documentDate: "2025-01-29",
    role: "NORMATIVE_REFERENCE",
    temporalClass: "CURRENT_REFERENCE",
    abstract: "Die Deutsche Nachhaltigkeitsstrategie 2025 ist der strategische Ziel- und Indikatorenrahmen, auf dem der Aktionsplan aufbaut. Sie wird als Referenzbaseline geführt und nicht rückwirkend als Wirkung der seit Mai 2025 amtierenden Bundesregierung ausgegeben.",
    locations: ["strategischer Referenzrahmen", "Ziele und Indikatoren"],
    usedBy: "ALL",
  },
  {
    title: "Gemeinsame Geschäftsordnung der Bundesministerien – §§ 43 und 44",
    institution: "Bundesministerium der Justiz / Bundesregierung",
    url: "https://www.verwaltungsvorschriften-im-internet.de/bsvwvbund_21072009_O11313012.htm",
    documentType: "Amtliche Verfahrens- und Rechtsquelle",
    documentDate: null,
    role: "NORMATIVE_REFERENCE",
    temporalClass: "CURRENT_REFERENCE",
    abstract: "Die GGO verlangt bereits heute die Betrachtung wesentlicher Gesetzesfolgen, beabsichtigter Wirkungen, unbeabsichtigter Nebenwirkungen, nachhaltiger Entwicklung, langfristiger Wirkungen, anderer Lösungsmöglichkeiten und möglicher späterer Erfolgskontrolle. Der WÖk-Mehrwert darf deshalb nicht als erstmalige Folgenprüfung dargestellt werden.",
    locations: ["§ 43 Absatz 1", "§ 44 Absätze 1 und 7"],
    usedBy: "META_AND_M04",
  },
  {
    title: "Erfahrungsbericht zur Nachhaltigkeitsprüfung und eNAP",
    institution: "Staatssekretärsausschuss für nachhaltige Entwicklung / Bundesregierung",
    url: "https://www.bundesregierung.de/resource/blob/2196306/2253682/2d019561674ad7af4f11e19d4aa4fc71/2024-01-18-sta-nhk-beschluss-vom-27-november-2023-data.pdf?download=1",
    documentType: "Amtlicher Erfahrungsbericht (PDF)",
    documentDate: "2023-11-27",
    role: "EX_ANTE_EVIDENCE",
    temporalClass: "AVAILABLE_AT_DECISION_TIME",
    abstract: "Der Erfahrungsbericht dokumentiert positive Rückmeldungen zur Nutzbarkeit von eNAP ebenso wie einzelne Hinweise auf Starrheit, fehlende Hilfestellung bei Zielkonflikten und Bedarf an stärkerer Ergebnis-, Wechselwirkungs- und Spilloverorientierung. Einzelne Ressort-Rückmeldungen werden nicht verallgemeinert.",
    locations: ["Seiten 2–3", "Seiten 9–11"],
    usedBy: "META_AND_M04",
  },
  {
    title: "Amtliches Monitoring der Deutschen Nachhaltigkeitsstrategie",
    institution: "Statistisches Bundesamt",
    url: "https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Nachhaltigkeitsindikatoren/Deutsche-Nachhaltigkeit/_inhalt.html",
    documentType: "Amtliche Statistik- und Monitoringseite",
    documentDate: null,
    role: "CALCULATION_INPUT",
    temporalClass: "CURRENT_REFERENCE",
    abstract: "Destatis beobachtet die Entwicklung und Zielerreichung der DNS-Indikatoren. Ein veränderter Indikator dokumentiert einen Zustand oder Trend; er beweist für sich allein keine kausale Wirkung eines einzelnen Gesetzes oder einer Mission.",
    locations: ["Indikatoren und Ziele", "Monitoring und Berichtszyklus"],
    usedBy: "META",
  },
];

function missionOpenAssessment(mission: ActionPlanMission): OverviewAssessmentData {
  return {
    assessmentLabel: "Wirkungseinordnung kontextabhängig und noch offen",
    impactCoreSummary: mission.path.M,
    editorialSummary: mission.target,
    keyFinding: mission.risk,
    directionLabel: "Kontextabhängig; Wirkungsrichtung noch offen",
    directionKind: "open",
    evidenceSummary: "Initialer Entwurfsstand; Evidenz zum Wirkmechanismus ist fachlich noch zu ergänzen.",
    realityCheckSummary: "Ex-ante-Missionsakte; tatsächliche Zustandsänderung und Zurechnung sind noch nicht beobachtbar.",
  };
}

const m02: MissionDeepDive = {
  missionId: "WOEK-AKN-2026-M02",
  overview: {
    assessmentLabel: "Hohes positives Governance-Potenzial – tatsächliche Allokationswirkung noch offen",
    impactCoreSummary: "Der entscheidende Wirkungshebel liegt nicht in einer neuen Investitionssumme, sondern darin, ob aus Monitoring tatsächlich bessere Allokations- und Nachsteuerungsentscheidungen folgen.",
    editorialSummary: "Die Mission besitzt hohes positives Governance-Potenzial, weil sie für das Sondervermögen Infrastruktur und Klimaneutralität Ziele, Fortschritt und Wirkungen sichtbar machen und die Mittelverwendung stärker nach Effektivität und Effizienz steuern will.",
    keyFinding: "Das materielle Risiko ist eine Kennzahlenarchitektur, die Mittelabfluss, Meilensteine oder leicht messbare Outputs als Wirkung behandelt, ohne Additionalität, Lebenszykluskosten, Verteilung und Gegenfaktum sauber zu trennen.",
    directionLabel: "Hohes positives Governance-Potenzial unter klaren Bedingungen",
    directionKind: "conditional",
    evidenceSummary: "Governance-Design: hoch und textlich belegt. Mechanismus: mittel. Tatsächliche bessere Allokation oder Outcome: noch nicht beobachtbar; Zurechnung offen.",
    realityCheckSummary: "Ex ante: Erst dokumentierte Nachsteuerung und beobachtbare Outcomes erlauben einen späteren Reality Check.",
  },
  officialAnchor: "Beteiligungsfassung, Seiten 9–10: Ziele, Fortschritt und Wirkungen kontinuierlich aufzeigen; Fortschritts- und Wirkungskennzahlen für Titel, Titelgruppen und Sondervermögen; mittel- bis langfristig wirkungsorientierte Maßnahmensteuerung. DNS- und SDG-Bezug: 3, 4, 7, 8, 9, 11 und 13.",
  evidenceMaturity: "Governance-Design ist hoch und textlich belegt. Der Mechanismus ist mit mittlerer Evidenz plausibel. Eine tatsächlich bessere Allokation oder Outcome-Wirkung ist noch nicht beobachtbar; die Zurechnung bleibt offen.",
  problemReview: { status: "Problem gut belegt – Reichweite begrenzt", text: "Große Investitionsportfolios können nicht seriös allein über bereitgestellte oder abgerufene Mittel und Baufortschritt bewertet werden. Benötigt werden nachvollziehbare Ziel-, Outcome-, Verteilungs- und Folgekosteninformationen. Nicht behauptet wird, der Bund habe bislang keinerlei Monitoring betrieben; die Mission baut ausdrücklich auf dem SVIK-Monitoring auf.", bottleneck: "Portfolioallokation ohne einheitliche Rückkopplung zu Outcome und Additionalität." },
  goalReview: { status: "Ziel gestützt – Disaggregation erforderlich", text: "Zielgenauere, wirksamere und transparentere Investitionssteuerung ist problemadäquat. Eine Wirkungskennzahl für das Sondervermögen insgesamt darf nur aggregiert werden, wenn methodisch vergleichbare Größen vorliegen. Heterogene Infrastruktur-, Bildungs-, Klima- und Digitalpfade dürfen nicht zu einem scheinpräzisen Gesamtscore verdichtet werden." },
  path: { A: "Fortschritts- und Wirkungsmonitoring, Kennzahlen und Ressortdaten werden an die Steuerung des Sondervermögens gekoppelt.", M: "Informationsasymmetrien über Projektfortschritt und Outcome sinken; schlecht performende Designs können früher erkannt und Mittel oder Designs angepasst werden.", deltaZ: "Im günstigen Fall steigen reale Infrastrukturqualität, Resilienz, Produktivität und Treibhausgasminderung je knapper Ressource – nicht der Mittelabfluss selbst.", R: "Mensch, Planet und Demokratie; DNS und SDGs als Ziel- und Monitoringreferenz; Haushalts- und Kompetenzrecht separat." },
  qualityLayers: [
    { id: "material-omissions", title: "Materielle Auslassungen", text: "Planweit fehlt noch ein verbindlicher Mindeststandard für Additionalität, Gegenfaktum oder Contribution, Lebenszyklus- und Betriebskosten, Verteilung sowie klare Datenfunktion je Kennzahl. Das ist eine Lücke auf Methoden- und Steuerungsebene, nicht die Behauptung, jedes Teilprogramm lasse dies vermissen." },
    { id: "policy-coherence", title: "Policy-Kohärenz", text: "Erforderlich ist ein Crosswalk mit Haushalts- und Investitionssteuerung, Klima- und Transformationsfonds, Fachressortprogrammen sowie Beschaffungs- und Planungsregeln. Sonst drohen parallele Kennzahlenwelten und widersprüchliche Anreize." },
    { id: "delivery-feasibility", title: "Delivery", text: "Das Bundesfinanzministerium kann Standard und Monitoring setzen; Outcome-Daten und Nachsteuerung hängen von allen mittelbewirtschaftenden Ressorts sowie Projekt- und Kommunaldaten ab. Hauptengpässe sind Datenqualität, gemeinsame Definitionen und die tatsächliche Kopplung an Entscheidungen." },
    { id: "resource-financing", title: "Ressourcen und Finanzierung", text: "Wirkungsmessung verursacht eigene Daten- und Evaluationskosten. Diese sind sinnvoll, wenn sie Fehlallokationen vermeiden, dürfen aber nicht nur Berichtsbürokratie erzeugen. Pro Teilprogramm sind reale Bau-, Planungs- und Fachkräfteengpässe statt nominaler Mittel allein zu betrachten." },
    { id: "spatial-distribution", title: "Räumliche Verteilung", text: "Mittel- und Outcome-Verteilung nach Regionen, Stadt und Land, finanzstarken und finanzschwachen Kommunen sowie Nutzergruppen müssen sichtbar sein. Gleiche Mittelhöhe bedeutet nicht gleiche Wirkung." },
    { id: "international-leakage", title: "Internationale Verlagerung", text: "Bei Material-, Energie- und Technologieinvestitionen sind importierte Treibhausgas-, Ressourcen- und Sozialwirkungen zu berücksichtigen, sofern sie materiell sind." },
    { id: "robustness", title: "Robustheit", text: "Kennzahlen und Investitionslogik müssen gegen Zins-, Baukosten-, Fachkräfte-, Energiepreis- und Klimaextremszenarien geprüft werden. Robuste Projekte und Designs dürfen nicht nur im Basisszenario gut aussehen." },
    { id: "lock-in", title: "Reversibilität und Lock-in", text: "Langfristige Infrastruktur erzeugt Pfadabhängigkeit. Monitoring muss Frühwarnsignale vor irreversiblen Lock-ins liefern, nicht erst nach Fertigstellung." },
    { id: "falsification", title: "Was würde die Einordnung verändern?", text: "Der positive Befund wird gestützt, wenn Monitoring nachweislich dokumentierte Design- oder Prioritätsänderungen auslöst und Outcomes sowie Additionalität sichtbar werden. Er wird geschwächt, wenn Berichte überwiegend Mittelabfluss und Meilensteine wiedergeben, und teilweise widerlegt, wenn Kennzahlen dauerhaft ohne erkennbare Entscheidungsrückkopplung bleiben." },
    { id: "lifecycle", title: "Lebenslauf", text: "Rechts- und Haushaltsrahmen des Sondervermögens → Programmtitel und Teilprogramme → Mittelbindung → Umsetzung → State oder Outcome → Monitoring → dokumentierte Nachsteuerung → spätere Evaluation." },
    { id: "version", title: "Versionsdelta", text: "Kennzahlenversprechen des Entwurfs, finale Mission und später tatsächlich implementierte Monitoringmethodik werden getrennt versioniert." },
    { id: "coverage", title: "Abdeckung", text: "Vollständige Ex-ante-Prüfung der Entwurfsmission mit noch offener operationaler Methode; keine Outcome- oder Attributionsreife." },
  ],
  recommendationStatus: "Es wird keine neue WÖk-Handlungsoption aus diesem Review erzeugt. Ein bestehender fachlicher RecommendationRecord zum Sondervermögen oder Haushalt müsste separat per ID verknüpft werden; andernfalls bleibt die Handlungsoption offen.",
};

const m04: MissionDeepDive = {
  missionId: "WOEK-AKN-2026-M04",
  overview: {
    assessmentLabel: "Hohes positives strukturelles Potenzial – Qualität der Prüfung entscheidet",
    impactCoreSummary: "Je früher relevante Neben-, Verteilungs- und Spillovereffekte sichtbar sind, desto eher kann ein Gesetzentwurf noch geändert werden.",
    editorialSummary: "Die Mission besitzt hohes positives strukturelles Wirkungspotenzial, weil Nachhaltigkeitsprüfung verpflichtend für jeden Gesetzentwurf, früher in die Rechtsetzung eingebunden und ressorteinheitlicher ausgestaltet werden soll.",
    keyFinding: "Die Wirkung bleibt davon abhängig, ob die Prüfung echte Wirkmechanismen und Alternativen untersucht oder zu einer schlanken Compliance-Checkliste wird; Akzeptanz eines Vorhabens darf nicht zum Prüfziel werden.",
    directionLabel: "Hohes positives strukturelles Potenzial unter Qualitätsbedingungen",
    directionKind: "conditional",
    evidenceSummary: "Institutionelles Design: hoch und textlich belegt. Erwarteter Mechanismus: mittel bis hoch. Tatsächliche Entwurfsverbesserungen oder Outcomes: noch nicht beobachtbar; Zurechnung offen.",
    realityCheckSummary: "Ex ante: Erst reale Anwendung, dokumentierte Entwurfsänderungen und spätere Outcomes erlauben einen Reality Check.",
  },
  officialAnchor: "Beteiligungsfassung, Seiten 11–12: verpflichtende vollständige Nachhaltigkeitsprüfung für jeden Gesetzentwurf; Verankerung in der GGO; Integration in die neue Frühphase; weniger uneinheitliche Ressortverfahren; Ex-ante-Abschätzungen oder qualitative Effektdarstellungen; Schulungen; internationale Spillover und Umweltnutzen.",
  evidenceMaturity: "Das institutionelle Design ist hoch und textlich belegt; der erwartete Mechanismus ist mit mittlerer bis hoher Evidenz plausibel. Tatsächliche Entwurfsverbesserungen und Outcomes sind noch nicht beobachtbar; die Zurechnung bleibt offen.",
  problemReview: { status: "Problem gut belegt – keine Nullbaseline", text: "Die Beteiligungsfassung benennt unterschiedliche Regelungsorte, Unverbindlichkeit hinsichtlich Gesetzeszielen und uneinheitliche Verfahren oder Handhabungen. Gleichzeitig existieren bereits Gesetzesfolgenabschätzung und Nachhaltigkeitsprüfung. Der Problemkern lautet daher nicht, Folgen würden bisher gar nicht geprüft, sondern dass Nachhaltigkeitseffekte noch nicht durchgängig früh, konsistent, wirkungslogisch und rückgekoppelt in allen Ressorts geprüft werden.", bottleneck: "Späte oder uneinheitliche Effektintegration plus schwacher gemeinsamer Kausal- und Feedbackstandard." },
  goalReview: { status: "Ziel gestützt – Schutzregeln erforderlich", text: "Frühe, vollständige und einheitlichere Nachhaltigkeitsprüfung ist problemadäquat. Zielhierarchie: bessere gesellschaftliche, ökologische und ökonomische Zustände und robustere Rechtsetzung vor besserer Entscheidungsinformation vor Durchführung der Prüfung. Prüfung durchgeführt ist Output, nicht Wirkung." },
  path: { A: "GGO-Regel, frühe Prüfphase, konsolidierte Arbeitshilfen, Schulung und ressortübergreifende Zuständigkeit.", M: "Relevante Zielkonflikte, Spillover und Langfristfolgen werden vor Kabinettsreife eher erkannt; Entwürfe können verändert und verworfene Optionen dokumentiert werden.", deltaZ: "Im günstigen Fall entstehen weniger schädliche Nebenwirkungen, bessere Zielkohärenz, robustere Regulierung und höhere Lernfähigkeit.", R: "Mensch, Planet und Demokratie; DNS als Ziel- und Monitoringreferenz; Grundrechte, Recht und Kompetenz getrennt." },
  qualityLayers: [
    { id: "material-omissions", title: "Materielle Auslassungen", text: "Im Entwurf ist kein einheitlich verpflichtender Problem Review, expliziter Alternativenvergleich, Gegenfaktum oder Contribution-Ansatz und keine spätere Ex-post-Rückkopplung als Mindeststandard erkennbar. Positive und negative Effekte müssen symmetrisch geprüft werden; die Formulierung, positive Effekte könnten zur Akzeptanz beitragen, darf nicht zu Confirmation Bias führen." },
    { id: "policy-coherence", title: "Policy-Kohärenz", text: "Die zentrale Spannung liegt beim gleichzeitigen Ziel des Bürokratierückbaus und einer handhabbaren Rechtsetzung. Ein schlanker Prozess ist positiv, wenn Doppelarbeit sinkt; er ist negativ, wenn fachliche Tiefe oder Betroffenenperspektive gekürzt wird. Vereinfachung darf die Prüfung materieller Effekte nicht entfernen." },
    { id: "delivery-feasibility", title: "Delivery", text: "Bundesjustiz- und Digitalministerium können GGO und Legistik standardisieren. Alle Ressorts brauchen jedoch Kompetenzen, Datenzugang, Zeit und klare Verantwortlichkeit. Schulung ist ein realer Delivery-Hebel, aber keine Garantie für Qualität." },
    { id: "resource-financing", title: "Ressourcen und Finanzierung", text: "Zusätzlicher Prüfaufwand ist gegen vermiedene Fehlregulierung, Nachbesserungs- und Folgekosten zu betrachten. Es gibt keinen künstlichen Bürokratiekosten-Score ohne Vergleich zum Nutzen besserer Entscheidungen." },
    { id: "spatial-distribution", title: "Räumliche und betroffenenbezogene Verteilung", text: "Bundesgesetze können Regionen, Kommunen und Gruppen sehr unterschiedlich treffen. Verteilung muss objektspezifisch in der Prüfung sichtbar werden, nicht nur als nationaler Durchschnitt." },
    { id: "international-leakage", title: "Internationale Spillover", text: "Die Beteiligungsfassung adressiert die internationale Spilloverperspektive bereits ausdrücklich. Nationale Zielerreichung darf importierte Lasten nicht verstecken." },
    { id: "robustness", title: "Robustheit", text: "Bei materiellen Gesetzen sind plausible Szenarien und Annahmen zu Preisen, Klima, Demografie, Nachfrage und Kapazitäten zu prüfen; sonst bleibt die Ex-ante-Einordnung fragil." },
    { id: "lock-in", title: "Reversibilität und Lock-in", text: "Regulatorische, technologische und infrastrukturelle Lock-ins müssen bereits ex ante markiert werden. Reversibilität und Nachsteuerbarkeit sind Teil der Designqualität." },
    { id: "falsification", title: "Was würde die Einordnung verändern?", text: "Der positive Befund wird gestützt, wenn Prüfungen nachweislich früher erfolgen, objektspezifisch sind und dokumentierte Entwurfs- oder Optionsänderungen auslösen. Er wird durch boilerplateartige Standardtexte geschwächt und teilweise widerlegt, wenn formale Vollständigkeit relevante Nebenwirkungen oder Spillover regelmäßig erst nach Inkrafttreten sichtbar werden lässt und keine Feedbackschleife folgt." },
    { id: "lifecycle", title: "Lebenslauf", text: "Problem- und Zieldefinition → Frühphasenprüfung → Referentenentwurf → Ressortabstimmung → Kabinett → parlamentarischer Rechtsakt → Implementation → Outcome oder EvidenceEvent → Ex-post-Recheck → gegebenenfalls Revision." },
    { id: "version", title: "Versionsdelta", text: "Beteiligungsfassung → finale Mission → tatsächliche GGO-Änderung und Arbeitshilfen → reale Anwendung. Plan und eingeführtes Verfahren werden nicht gleichgesetzt." },
    { id: "coverage", title: "Abdeckung", text: "Vollständige Ex-ante-Prüfung der Entwurfsmission bei noch offener Umsetzung; keine Aussage über die spätere Prüfpraxis." },
  ],
  recommendationStatus: "Es wird keine WÖk-Handlungsoption aus diesem Review erzeugt. Die beschriebenen Mindeststandards sind Analyse- und Prüfkriterien, kein automatisch freigegebener RecommendationRecord.",
};

const reviewedDeepDiveOverlays = JSON.parse(readFileSync(path.join(root, "reviewed-deep-dives-20260820.json"), "utf8")) as { records: MissionDeepDive[] };

export const missionDeepDives: Readonly<Record<string, MissionDeepDive>> = {
  [m02.missionId]: m02,
  [m04.missionId]: m04,
  ...Object.fromEntries(reviewedDeepDiveOverlays.records.map((record) => [record.missionId, record])),
};

export function actionPlanAssessmentForMission(mission: ActionPlanMission) {
  return missionDeepDives[mission.id]?.overview ?? missionOpenAssessment(mission);
}

export function actionPlanRouteFor(id: string) {
  return `/regierung/wirkungsanalysen/${encodeURIComponent(id)}`;
}

export function actionPlanRequiredRoutes() {
  return [actionPlanRouteFor(ACTION_PLAN_META_ID), ...getActionPlanMissions().map((mission) => actionPlanRouteFor(mission.id))];
}

export function actionPlanPublicMaturity(title: string, full: boolean): PublicMaturityProjection {
  const openPoints = full
    ? [
      `Für „${title}“ ist tatsächliche Outcome-Wirkung noch nicht beobachtbar.`,
      `Die kausale Zurechnung einer späteren Zustandsänderung zu „${title}“ bleibt bis zu einem belastbaren Gegenfaktum offen.`,
      `Für „${title}“ liegt kein fachlich freigegebener RecommendationRecord vor.`,
    ]
    : [
      `Die vertiefte Problem-, Ziel-, Rechts- und Delivery-Prüfung für „${title}“ ist fachlich noch nicht veröffentlicht.`,
      `Tatsächliche Outcome-Wirkung und Zurechnung von „${title}“ sind noch nicht beobachtbar.`,
      `Für „${title}“ liegt kein fachlich freigegebener RecommendationRecord vor.`,
    ];
  return {
    primary: "EX_ANTE_POTENTIAL_ONLY",
    flags: ["EX_ANTE_POTENTIAL_ONLY", "REALITY_CHECK_PENDING", "ATTRIBUTION_OPEN", "RECOMMENDATION_PENDING"],
    label: full ? "Vertiefte Ex-ante-Einordnung – Wirkung noch nicht beobachtbar" : "Initiale Ex-ante-Einordnung – fachliche Vertiefung offen",
    compactHint: full ? "Ex ante: Wirkung noch nicht beobachtbar; spätere Evidenz und Zurechnung bleiben getrennte Prüfstufen." : "Wirkpfad veröffentlicht; weitergehende fachliche Prüfebenen bleiben transparent offen.",
    assessableNow: [full ? "Wirkungspotenzial, Risiken, Wirkmechanismus und zusätzliche Qualitätslayer sind fachlich veröffentlicht." : "Ziel, initialer Wirkpfad, materielles Risiko und Monitoringgrößen sind fachlich veröffentlicht."],
    openPoints,
    layers: [
      { id: "problem", label: "Problemprüfung", status: full ? "AVAILABLE" : "PENDING", detail: full ? "fachlich veröffentlicht" : "fachliche Vertiefung ausstehend" },
      { id: "goal", label: "Zielprüfung", status: full ? "AVAILABLE" : "PENDING", detail: full ? "fachlich veröffentlicht" : "fachliche Vertiefung ausstehend" },
      { id: "impact", label: "Wirkungspotenzial und Risiken", status: "AVAILABLE", detail: "Ex-ante-Wirkpfad veröffentlicht" },
      { id: "reality", label: "Reality Check", status: "OPEN", detail: "noch nicht beobachtbar" },
      { id: "recommendation", label: "WÖk-Handlungsoption", status: "PENDING", detail: "kein fachlich freigegebener RecommendationRecord" },
      { id: "operationalization", label: "Operationalisierung", status: "OPEN", detail: "mit finaler Fassung und Umsetzung fortzuschreiben" },
    ],
  };
}
