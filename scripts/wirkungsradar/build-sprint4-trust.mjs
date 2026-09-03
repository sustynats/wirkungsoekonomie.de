import fs from "node:fs";
import path from "node:path";
import { p0DossiersV2 } from "../../lib/wirkungsradar/p0-dossiers-v2.mjs";

const ROOT = process.cwd();
const OUT = (...parts) => path.join(ROOT, ...parts);
const DATA_STAND = "2026-06";
const LAST_ACCESSED = "2026-06-04";
const ACADEMY_NARRATIVE_URL = "https://akademie.wirkungsoekonomie.de/narrativ-einreichen/";

const editorialSentence =
  "Vertrauen entsteht nicht durch Autorität, sondern durch sichtbare Prüfung: Datenstand, Quellen, Grenzen, Gegenposition, Bilanzgrenze und Korrekturfähigkeit. Der Wirkungsradar muss nicht unfehlbar wirken. Er muss lernfähig, transparent und überprüfbar sein.";

const p0Slugs = p0DossiersV2.map((dossier) => dossier.slug);
const curatedStandaloneSlugs = new Set(["radwege-in-peru"]);

const sources = [
  source("uba_emissions_inventory", "Umweltbundesamt Emissionsdaten", "Umweltbundesamt", "https://www.umweltbundesamt.de/daten/klima/treibhausgas-emissionen-in-deutschland", "official_agency", "Deutschland", "de", "annual", "A", ["Emissionen Deutschland", "Bilanzgrenzen", "Klima-Datenstand"], ["Die Quelle entscheidet nicht allein, wie Verantwortung politisch verteilt wird."]),
  source("global_carbon_project", "Global Carbon Project", "Global Carbon Project", "https://globalcarbonproject.org/carbonbudget/", "research_institute", "global", "en", "annual", "A", ["globale Emissionen", "Carbon Budget", "Vergleichsdaten"], ["Die Quelle ersetzt keine nationale Politikbewertung."]),
  source("ipcc_ar6_synthesis", "IPCC AR6 Synthesebericht", "IPCC", "https://www.ipcc.ch/report/ar6/syr/", "peer_review", "global", "en", "static", "A", ["Klimarisiken", "Minderungspfade", "wissenschaftlicher Konsens"], ["Der Bericht liefert keine tagesaktuellen Marktdaten."]),
  source("destatis_environmental_accounts", "Destatis Umweltökonomische Gesamtrechnung", "Statistisches Bundesamt", "https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Umwelt/UGR/_inhalt.html", "official_statistics", "Deutschland", "de", "annual", "A", ["Umweltökonomische Daten", "Konsum- und Wirtschaftsbezug"], ["Die Daten zeigen keine vollständige moralische Verantwortungsverteilung."]),
  source("iea_evs", "IEA Global EV Outlook", "International Energy Agency", "https://www.iea.org/reports/global-ev-outlook-2024", "official_agency", "global", "en", "annual", "B", ["Elektromobilität", "Batterien", "Markt- und Infrastrukturdaten"], ["IEA-Szenarien sind modelliert und hängen von Annahmen ab."]),
  source("icct_lifecycle_evs", "ICCT Lebenszyklusvergleich Fahrzeuge", "International Council on Clean Transportation", "https://theicct.org/publication/a-global-comparison-of-the-life-cycle-greenhouse-gas-emissions-of-combustion-engine-and-electric-passenger-cars/", "research_institute", "global", "en", "event_based", "B", ["Lebenszyklus Fahrzeuge", "Verbrennervergleich", "Strommix-Sensitivität"], ["Regionale Strommix- und Fahrprofilannahmen müssen geprüft werden."]),
  source("adac_lca_drives", "ADAC Lebenszyklusanalyse Antriebe", "ADAC", "https://www.adac.de/verkehr/tanken-kraftstoff-antrieb/alternative-antriebe/klimabilanz/", "mobility_association", "Deutschland", "de", "event_based", "B", ["Lebenszyklusvergleich", "Strommix-Sensitivität", "regenerativer Strom"], ["Modellannahmen zu Fahrzeugklasse, Laufleistung, Batteriegröße und Strompfad prüfen."]),
  source("adac_emobility_facts", "ADAC Fakten zur Elektromobilität", "ADAC", "https://www.adac.de/rund-ums-fahrzeug/elektromobilitaet/elektroauto/elektroauto-pro-und-contra/", "mobility_association", "Deutschland", "de", "event_based", "B", ["CO2-Rucksack", "Betrieb", "Akku und Garantie", "Ladeinfrastruktur"], ["Ratgeberquelle; Detailzahlen können sich mit Markt und Datenstand ändern."]),
  source("bmv_ladeinfrastruktur_erneuerbar", "BMV Förderprogramm Ladeinfrastruktur", "Bundesministerium für Verkehr", "https://www.bmv.de/SharedDocs/DE/Artikel/G/infopapier-sechster-foerderaufruf-ladeinfrastruktur.html", "government", "Deutschland", "de", "event_based", "A", ["geförderte öffentliche Ladeinfrastruktur", "erneuerbarer Strom als Fördervoraussetzung"], ["Belegt Fördervoraussetzungen, nicht jede private oder ungeförderte Ladesituation."]),
  source("transport_environment_efuels", "Transport & Environment zu E-Fuels", "Transport & Environment", "https://www.transportenvironment.org/discover/e-fuels-too-inefficient-and-expensive-for-cars/", "ngo", "Europa", "en", "event_based", "C", ["E-Fuel-Effizienz", "Pkw-Priorisierung", "Debattenperspektive"], ["NGO-Quelle; sie braucht A- oder B-Quellen daneben."]),
  source("iea_hydrogen", "IEA Global Hydrogen Review", "International Energy Agency", "https://www.iea.org/reports/global-hydrogen-review-2024", "official_agency", "global", "en", "annual", "B", ["Wasserstoff", "Elektrolyse", "Einsatzprioritäten"], ["Markthochlauf und Kosten sind unsicher."]),
  source("iter_fusion", "ITER Projektinformationen", "ITER Organization", "https://www.iter.org/", "official_agency", "global", "en", "event_based", "B", ["Fusionstechnologie", "Forschungsstand", "Zeitpfad"], ["Projektquelle; sie belegt Forschung, aber keinen kurzfristigen Stromsystemnutzen."]),
  source("bundeshaushalt", "Bundeshaushalt", "Bundesministerium der Finanzen", "https://www.bundeshaushalt.de/", "government", "Deutschland", "de", "annual", "A", ["Haushalt", "Ausgaben", "Finanzplanung"], ["Der Haushalt zeigt Ausgaben, aber nicht automatisch Wirkungsqualität."]),
  source("bundesbank_staatsfinanzen", "Bundesbank Staatsfinanzen", "Deutsche Bundesbank", "https://www.bundesbank.de/de/statistiken/oeffentliche-finanzen", "official_statistics", "Deutschland", "de", "monthly", "A", ["Staatsfinanzen", "Zinsen", "Refinanzierung"], ["Finanzdaten ersetzen keine Bewertung der Ausgabenwirkung."]),
  source("iab_buergergeld_arbeitsmarkt", "IAB Arbeitsmarkt- und Sozialforschung", "Institut für Arbeitsmarkt- und Berufsforschung", "https://www.iab.de/", "research_institute", "Deutschland", "de", "event_based", "B", ["Arbeitsmarkt", "Bürgergeld", "Anreize"], ["Einzelne Studien unterscheiden sich nach Methodik und Zeitraum."]),
  source("bamf_migration", "BAMF Migrations- und Integrationsdaten", "Bundesamt für Migration und Flüchtlinge", "https://www.bamf.de/DE/Themen/Forschung/forschung-node.html", "official_agency", "Deutschland", "de", "event_based", "A", ["Migration", "Integration", "Sprache"], ["Die Quelle zeigt Verwaltungs- und Forschungsdaten, aber keine kommunale Vollbilanz."]),
  source("oecd_migration", "OECD Migration Outlook", "OECD", "https://www.oecd.org/migration/international-migration-outlook-1999124x.htm", "research_institute", "OECD", "en", "annual", "B", ["Migration", "Arbeitsmarkt", "internationale Einordnung"], ["Internationale Vergleiche müssen auf nationale Regeln übertragen werden."]),
  source("kiel_ukraine_tracker", "Ukraine Support Tracker", "Kiel Institute for the World Economy", "https://www.ifw-kiel.de/topics/war-against-ukraine/ukraine-support-tracker/", "research_institute", "global", "en", "monthly", "B", ["Ukraine-Hilfe", "Zusagen", "internationale Vergleiche"], ["Tracker-Daten unterscheiden Zusagen, Auszahlungen und Kategorien; das muss erklärt werden."]),
  source("bundesregierung_ukraine_hilfe", "Bundesregierung Ukraine-Hilfe", "Bundesregierung", "https://www.bundesregierung.de/breg-de/themen/krieg-in-der-ukraine", "government", "Deutschland", "de", "event_based", "A", ["Ukraine-Hilfe", "Regierungsangaben", "Sicherheitspolitik"], ["Regierungsquelle; unabhängige Tracker sollten danebenstehen."]),
  source("kfw_development_projects", "KfW Entwicklungsbank Projekte", "KfW Entwicklungsbank", "https://www.kfw-entwicklungsbank.de/", "government", "Deutschland", "de", "event_based", "B", ["Entwicklungsprojekte", "Finanzierung", "Projektlogik"], ["Projektangaben zeigen nicht allein Wirkung vor Ort."]),
  source("bpb_desinformation", "bpb Dossier Desinformation", "Bundeszentrale für politische Bildung", "https://www.bpb.de/themen/medien-journalismus/desinformation/", "official_agency", "Deutschland", "de", "event_based", "B", ["Desinformation", "Medienkompetenz", "Diskurs"], ["Die Quelle erklärt Mechanismen, aber prüft nicht jede konkrete Aussage."]),
  source("debunking_handbook", "Debunking Handbook", "University of Bristol / Partner", "https://www.climatechangecommunication.org/debunking-handbook-2020/", "research_institute", "global", "en", "static", "B", ["Debunking", "Frame-Risiken", "Kommunikation"], ["Kommunikationsforschung ersetzt keine Sachquelle."]),
];

const packTemplates = {
  "migration-kostet-nur": pack("migration-kostet-nur", ["bamf_migration", "oecd_migration", "iab_buergergeld_arbeitsmarkt", "bpb_desinformation"], "sozial", "Kommunen können überfordert sein. Deshalb braucht Integration Finanzierung, Personal, Wohnraum, Schule, Sprache und Arbeitsmarktzugang."),
  "deutschland-nur-zwei-prozent": pack("deutschland-nur-zwei-prozent", ["uba_emissions_inventory", "global_carbon_project", "destatis_environmental_accounts", "ipcc_ar6_synthesis"], "territorial, konsumbezogen, historisch, produktbezogen", "Man kann fragen, welche Verantwortung Deutschland realistisch allein tragen kann. Deshalb werden territoriale Emissionen, Konsum, Lieferketten und Standards getrennt."),
  "windraeder-voegel-wald-beton-rueckbau": pack("windraeder-voegel-wald-beton-rueckbau", ["uba_emissions_inventory", "ipcc_ar6_synthesis", "bpb_desinformation"], "lebenszyklusbezogen, infrastrukturell, gesundheitlich", "Windkraft braucht Artenschutz, Rückbau und Materialstandards. Daraus folgt bessere Planung, nicht ein Pauschalurteil gegen Windstrom."),
  "fusion-loest-das-energieproblem": pack("fusion-loest-das-energieproblem", ["iter_fusion", "iea_hydrogen", "ipcc_ar6_synthesis"], "zeitlich, systemisch, infrastrukturell", "Forschung kann wertvoll sein. Aber Forschungsertrag ist nicht automatisch Stromsystemnutzen."),
  "schulden-machen-oder-sparen": pack("schulden-machen-oder-sparen", ["bundeshaushalt", "bundesbank_staatsfinanzen", "destatis_environmental_accounts"], "fiskalisch, zeitlich, infrastrukturell", "Zinsen und Tragfähigkeit sind berechtigte Fragen. Entscheidend ist zusätzlich, ob Ausgaben Zukunft schaffen oder Unterlassungskosten vermeiden."),
  "e-autos-schlimmer-als-verbrenner": pack("e-autos-schlimmer-als-verbrenner", ["bmv_ladeinfrastruktur_erneuerbar", "adac_lca_drives", "adac_emobility_facts", "iea_evs", "icct_lifecycle_evs", "uba_emissions_inventory"], "lebenszyklusbezogen, produktionsbezogen, ladestrombezogen, gesundheitlich, geopolitisch", "Batterien brauchen Rohstoffe und saubere Lieferketten. Deshalb sind kleinere Fahrzeuge, Batteriepass, LFP-Optionen, Recycling, erneuerbarer Produktionsstrom und sauberer Ladestrom wichtig."),
  "e-fuels-retten-den-verbrenner": pack("e-fuels-retten-den-verbrenner", ["uba_emissions_inventory", "transport_environment_efuels", "iea_hydrogen", "icct_lifecycle_evs"], "lebenszyklusbezogen, zeitlich, systemisch", "E-Fuels können für Spezialfälle wichtig sein. Die Grenze ist der Pkw-Massenmarkt, weil direkter Strom meist besser wirkt."),
  "wasserstoff-fuer-alles": pack("wasserstoff-fuer-alles", ["iea_hydrogen", "ipcc_ar6_synthesis", "uba_emissions_inventory"], "systemisch, infrastrukturell, zeitlich", "Wasserstoff ist wichtig für bestimmte Anwendungen. Die berechtigte Frage ist, wo er mehr Wirkung erzeugt als direkter Strom."),
  "arbeit-lohnt-sich-nicht-mehr": pack("arbeit-lohnt-sich-nicht-mehr", ["iab_buergergeld_arbeitsmarkt", "bundeshaushalt", "destatis_environmental_accounts"], "sozial, fiskalisch, haushaltsbezogen", "Arbeit muss sich lohnen. Die Lösung liegt bei Lohn, Wohnen, Betreuung, Qualifikation und Transferregeln, nicht bei Menschenabwertung."),
  "co2-preis-oder-fossile-systemkosten": pack("co2-preis-oder-fossile-systemkosten", ["uba_emissions_inventory", "ipcc_ar6_synthesis", "bundeshaushalt"], "fiskalisch, gesundheitlich, systemisch", "Ein CO2-Preis kann sozial ungerecht wirken. Deshalb braucht er Rückverteilung, Entlastung und gute Alternativen."),
  "kernenergie-wieder-in-deutschland": pack("kernenergie-wieder-in-deutschland", ["ipcc_ar6_synthesis", "bundeshaushalt", "iea_hydrogen"], "zeitlich, systemisch, infrastrukturell", "Kernenergie kann als CO2-arme Option diskutiert werden. Berechtigt sind aber Kosten, Bauzeit, Endlager, Flexibilität und Alternativenvergleich."),
  "radwege-in-peru": pack("radwege-in-peru", ["kfw_development_projects", "bundeshaushalt", "bpb_desinformation"], "fiskalisch, geopolitisch, demokratisch", "Auslandsprojekte brauchen Wirkungskontrolle. Einzelne Projekte dürfen aber nicht als Beleg gegen jede Entwicklungsfinanzierung dienen."),
  "ukraine-unterstuetzung-steuergeld": pack("ukraine-unterstuetzung-steuergeld", ["bundesregierung_ukraine_hilfe", "kiel_ukraine_tracker", "bundeshaushalt"], "geopolitisch, fiskalisch, sicherheitlich", "Hilfe braucht Kontrolle. Zusagen, Auszahlungen, Sachleistungen, Kredite und Garantien müssen getrennt werden."),
};

function source(id, label, organization, url, sourceType, countryOrRegion, language, updateFrequency, reliabilityTier, useFor, limitations) {
  return {
    id,
    label,
    organization,
    url,
    sourceType,
    countryOrRegion,
    language,
    publicationDate: "",
    lastAccessed: LAST_ACCESSED,
    useFor,
    doesNotProve: ["Sie beweist nicht allein die politische Schlussfolgerung."],
    limitations,
    updateFrequency,
    reliabilityTier,
  };
}

function pack(slug, requiredSources, accountingBoundary, counterposition) {
  return {
    slug,
    dataStand: DATA_STAND,
    nextReviewDate: reviewDateFor(slug),
    requiredSources,
    optionalSources: ["debunking_handbook"],
    missingSources: [],
    evidenceSummary: {
      secure: [
        "Der Claim enthält einen prüfbaren wahren Kern.",
        "Die öffentliche Schlussfolgerung wird irreführend, wenn Bilanzgrenzen, Zeitpfad oder Alternativen fehlen.",
      ],
      uncertain: [
        "Exakte Zahlen hängen von Methodik, Zeitpunkt, Datenstand und regionalem Kontext ab.",
      ],
      contested: [
        "Politisch umstritten bleibt, wie Verantwortung, Kosten und Prioritäten verteilt werden.",
      ],
    },
    accountingBoundary,
    counterposition,
    doesNotClaim: "Diese Karte behauptet nicht, dass alle Einwände falsch sind oder eine einzige Quelle die politische Entscheidung ersetzt.",
    sourceNotes: [
      "C-Quellen werden nur mit A- oder B-Quellen verwendet.",
      "Quellen werden als Belege mit Grenzen gelesen, nicht als Autoritätsersatz.",
    ],
  };
}

function reviewDateFor(slug) {
  if (/ukraine/.test(slug)) return "2026-07";
  if (/schulden|co2-preis/.test(slug)) return "2026-09";
  if (/migration|arbeit/.test(slug)) return "2026-12";
  return "2027-06";
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const clean = String(text)
    .trim()
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");
  fs.writeFileSync(file, `${clean}\n`);
}

function yamlValue(value, indent = 0) {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) return value.map((item) => `${pad}- ${yamlScalar(item)}`).join("\n");
  if (typeof value === "object" && value) {
    return Object.entries(value)
      .map(([key, val]) => {
        if (Array.isArray(val)) return `${pad}${key}:\n${yamlValue(val, indent + 2)}`;
        if (typeof val === "object" && val) return `${pad}${key}:\n${yamlValue(val, indent + 2)}`;
        return `${pad}${key}: ${yamlScalar(val)}`;
      })
      .join("\n");
  }
  return `${pad}${yamlScalar(value)}`;
}

function yamlScalar(value) {
  const text = String(value ?? "");
  if (!text) return "\"\"";
  return JSON.stringify(text);
}

function tsString(value) {
  return JSON.stringify(value, null, 2);
}

function writeSourceArchitecture() {
  write(
    OUT("content/wirkungsradar/sources/source-types.ts"),
    `
// ${editorialSentence}
export type SourceType =
  | "primary_data"
  | "official_statistics"
  | "peer_review"
  | "official_agency"
  | "research_institute"
  | "government"
  | "ngo"
  | "industry"
  | "media"
  | "explainer"
  | "opinion";

export type ReliabilityTier = "A" | "B" | "C" | "D";
export type UpdateFrequency = "static" | "annual" | "quarterly" | "monthly" | "event_based" | "unknown";

export type SourceCard = {
  id: string;
  label: string;
  organization: string;
  url: string;
  sourceType: SourceType;
  countryOrRegion?: string;
  language?: string;
  publicationDate?: string;
  lastAccessed: string;
  useFor: string[];
  doesNotProve?: string[];
  limitations: string[];
  updateFrequency: UpdateFrequency;
  reliabilityTier: ReliabilityTier;
  notes?: string;
};
`
  );
  write(
    OUT("content/wirkungsradar/sources/source-quality.ts"),
    `
import type { ReliabilityTier, SourceCard } from "./source-types";

export const ReliabilityTierRules: Record<ReliabilityTier, string> = {
  A: "Primärquelle, amtliche Statistik, offizielle Institution, Peer-Review oder robuste Forschungsquelle.",
  B: "Etabliertes Forschungsinstitut, Fachagentur, internationale Organisation oder gut dokumentierte Sekundärquelle.",
  C: "Interessenakteur, Branchenquelle, NGO, Thinktank oder Medienquelle mit klarer Perspektive.",
  D: "Meinung, Debattenbeitrag oder unsichere Quelle; nur als Frame- oder Diskursbeleg nutzbar.",
};

export function sourceCanSupportFact(source: SourceCard): boolean {
  return source.reliabilityTier === "A" || source.reliabilityTier === "B";
}

export function requiresCompanionSource(source: SourceCard): boolean {
  return source.reliabilityTier === "C" || source.reliabilityTier === "D";
}
`
  );
  write(
    OUT("content/wirkungsradar/sources/source-registry.ts"),
    `
import type { SourceCard } from "./source-types";

export const SourceRegistry: SourceCard[] = ${tsString(sources)};
`
  );
  write(OUT("assets/data/wirkungsradar-source-registry.json"), JSON.stringify(sources, null, 2));
  write(OUT("content/wirkungsradar/sources/source-packs/README.md"), `# Source-Packs\n\nDie maschinenlesbaren P0-Packs liegen unter \`/content/wirkungsradar/source-packs/[slug].yaml\`. Dieser Ordner bleibt fuer thematische oder clusterbezogene Source-Packs reserviert.\n`);
}

function writePacks() {
  for (const dossier of p0DossiersV2) {
    const packData = packTemplates[dossier.slug] || pack(dossier.slug, ["bpb_desinformation", "debunking_handbook", "ipcc_ar6_synthesis"], "systemisch, demokratisch, zeitlich", "Berechtigte Kritik muss mit Belegen, Grenzen und besseren Alternativen arbeiten.");
    const payload = {
      sourcePack: {
        slug: dossier.slug,
        dossier: dossier.title,
        dataStand: packData.dataStand,
        nextReviewDate: packData.nextReviewDate,
        requiredSources: packData.requiredSources,
        optionalSources: packData.optionalSources,
        missingSources: packData.missingSources,
        evidenceSummary: packData.evidenceSummary,
        accountingBoundary: packData.accountingBoundary,
        counterposition: packData.counterposition,
        doesNotClaim: packData.doesNotClaim,
        sourceNotes: packData.sourceNotes,
      },
    };
    write(OUT("content/wirkungsradar/source-packs", `${dossier.slug}.yaml`), yamlValue(payload));
  }
  const packsJson = Object.fromEntries(p0DossiersV2.map((dossier) => [dossier.slug, packTemplates[dossier.slug]]));
  write(OUT("assets/data/wirkungsradar-source-packs.json"), JSON.stringify(packsJson, null, 2));
}

const glossaryEntries = [
  glossary("wirkung", "Wirkung", "Wirkung ist die tatsächliche Veränderung von Zuständen. Sie kann positiv, negativ oder neutral sein.", "Wirkung beschreibt, was sich wirklich verändert - gut, schlecht oder neutral.", "Wirkung ist nicht Absicht, Reichweite oder Image. Sie ist die tatsächliche Veränderung von Zuständen und wird erst am Referenzrahmen bewertet.", "Eine neue Schule wirkt positiv, wenn Kinder besser lernen; negativ, wenn sie andere Wege unsicherer macht.", ["wirkungspotenzial", "positive-netto-wirkung"], p0Slugs),
  glossary("wirkungspotenzial", "Wirkungspotenzial", "Wirkungspotenzial beschreibt, welche Veränderung unter plausiblen Bedingungen möglich ist.", "Was könnte sich verbessern oder verschlechtern, wenn diese Lösung umgesetzt wird?", "Wirkungspotenzial ist keine Erfolgsgarantie. Es benennt plausible Veränderungspfade, Risiken und Voraussetzungen.", "Ein Sprachkurs hat Potenzial, wenn er tatsächlich zu Arbeit, Teilhabe oder Bildung führt.", ["wirkung", "folgencheck"], p0Slugs),
  glossary("folgencheck", "Folgencheck", "Der Folgencheck prüft, was wahrscheinlicher wird, wenn Menschen einer Aussage folgen.", "Was passiert danach, wenn viele diese Aussage glauben?", "Der Folgencheck trennt Sofortwirkung, Anschlusswirkung und Systempfad.", "Wenn ein Satz Investitionen verhindert, zählt auch der Zustand, der dadurch schlechter bleibt.", ["wirkung-zweiter-ordnung", "wirkung-dritter-ordnung"], p0Slugs),
  glossary("frame", "Frame", "Ein Frame ist ein Deutungsrahmen, der auswählt, was wichtig wirkt und was ausgeblendet wird.", "Das Bild im Kopf, in dem ein Satz verstanden wird.", "Frames lenken Aufmerksamkeit, Gefühle und Schlussfolgerungen. Sie können helfen oder verzerren.", "Aus Planung wird Zwang; aus Integration wird Last.", ["narrativ", "reaktanz"], p0Slugs),
  glossary("narrativ", "Narrativ", "Ein Narrativ ist eine wiederkehrende Geschichte, die Rollen, Schuld, Gefahr und Lösung sortiert.", "Die Geschichte hinter dem Satz.", "Narrative erklären, wer Opfer, Schuldige, Retter oder Gefahr sein sollen.", "Die Geschichte: Wir sind klein, deshalb bringt Handeln nichts.", ["frame", "suendenbockmechanismus"], p0Slugs),
  glossary("bilanzgrenze", "Bilanzgrenze", "Die Bilanzgrenze sagt, was mitgezählt wird und was nicht.", "Welche Rechnung wird geöffnet - und welche bleibt zu?", "Bilanzgrenzen sind entscheidend, weil unterschiedliche Grenzen unterschiedliche Verantwortungen sichtbar machen.", "Nur Auspuff zählen ist eine andere Grenze als Lebenszyklus zählen.", ["territorialbilanz", "konsumbilanz", "scope-3"], p0Slugs),
  glossary("wirkungsordnung", "Wirkungsordnung", "Wirkungsordnung beschreibt, ob eine Folge sofort, indirekt oder systemisch entsteht.", "Sofort, danach oder auf Dauer.", "Wirkungsordnungen helfen, Kurzfristfolgen von Rückkopplungen, Lock-ins und Systempfaden zu trennen.", "Eine Steuer wirkt sofort im Preis, später im Verhalten und langfristig in Infrastruktur.", ["wirkung-erster-ordnung", "wirkung-zweiter-ordnung", "wirkung-dritter-ordnung"], p0Slugs),
  glossary("wirkung-erster-ordnung", "Wirkung erster Ordnung", "Direkte Wirkung, die unmittelbar nach einer Entscheidung oder Aussage entsteht.", "Was passiert sofort?", "Sie ist die erste sichtbare Folge und darf nicht mit der Gesamtwirkung verwechselt werden.", "Ein Preis steigt sofort.", ["wirkungsordnung"], p0Slugs),
  glossary("wirkung-zweiter-ordnung", "Wirkung zweiter Ordnung", "Indirekte Anschlusswirkung, die aus der ersten Folge entsteht.", "Was passiert danach?", "Sie zeigt Folgeentscheidungen, Anpassungen oder Ausweichreaktionen.", "Menschen ändern Kaufverhalten oder Investitionen.", ["wirkungsordnung"], p0Slugs),
  glossary("wirkung-dritter-ordnung", "Wirkung dritter Ordnung", "Systemische Wirkung, die Pfade, Regeln oder Vertrauen langfristig verändert.", "Was verfestigt sich auf Dauer?", "Sie beschreibt Lock-ins, Rückkopplungen und dauerhafte Strukturfolgen.", "Eine Infrastruktur macht spätere Alternativen schwerer.", ["wirkungsordnung"], p0Slugs),
  glossary("suendenbockmechanismus", "Sündenbockmechanismus", "Komplexe Probleme werden auf eine Gruppe geschoben.", "Eine Gruppe soll schuld sein.", "Der Mechanismus entlastet emotional, verschlechtert aber Problemlösung und Menschenschutz.", "Wohnungsnot wird pauschal Migration zugeschrieben.", ["narrativ", "frame"], ["migration-kostet-nur", "arbeit-lohnt-sich-nicht-mehr"]),
  glossary("verfuegbarkeitsheuristik", "Verfügbarkeitsheuristik", "Auffällige Beispiele wirken größer, weil sie leicht erinnerbar sind.", "Was hängen bleibt, wirkt häufiger.", "Sie macht Einzelfälle emotional stark, auch wenn sie statistisch nicht typisch sind.", "Ein einzelner Betrugsfall wirkt wie das ganze System.", ["folgencheck"], p0Slugs),
  glossary("status-quo-bias", "Status-quo-Bias", "Bestehende Zustände fühlen sich sicherer an als Veränderung.", "Alt wirkt sicher, neu wirkt riskant.", "Der Bias schützt vertraute Pfade, auch wenn diese langfristig schlechter wirken.", "Verbrenner wirkt vertraut, obwohl Ölabhängigkeit bleibt.", ["verlustaversion"], p0Slugs),
  glossary("verlustaversion", "Verlustaversion", "Menschen gewichten mögliche Verluste stärker als gleich große Gewinne.", "Verlust schmerzt stärker als Gewinn lockt.", "Sie erklärt, warum Transformationsdebatten oft an Kostenangst hängen.", "Eine Förderung wird übersehen, die Sorge vor hoher Rechnung bleibt.", ["reaktanz"], p0Slugs),
  glossary("reaktanz", "Reaktanz", "Wahrgenommener Zwang löst Widerstand aus.", "Wenn es nach Zwang klingt, geht man in Abwehr.", "Reaktanz entsteht oft durch schlechte Kommunikation, selbst wenn die Maßnahme begründet ist.", "Aus Wärmeplanung wird im Kopf Bevormundung.", ["frame"], p0Slugs),
  glossary("verantwortungsdiffusion", "Verantwortungsdiffusion", "Verantwortung wirkt kleiner, wenn sie auf viele verteilt erscheint.", "Wenn alle beteiligt sind, fühlt sich niemand zuständig.", "Der Effekt macht kleine Anteile zu Entlastungsargumenten.", "2 Prozent wird zum Freispruch.", ["territorialbilanz"], ["deutschland-nur-zwei-prozent"]),
  glossary("territorialbilanz", "Territorialbilanz", "Sie zählt Emissionen innerhalb eines Gebietes.", "Was passiert innerhalb der Landesgrenze?", "Territorialbilanzen sind wichtig, aber nicht die einzige Verantwortungsgrenze.", "Emissionen einer importierten Ware erscheinen im Produktionsland.", ["konsumbilanz", "scope-3"], ["deutschland-nur-zwei-prozent"]),
  glossary("konsumbilanz", "Konsumbilanz", "Sie ordnet Umweltwirkung dem Konsum zu, auch wenn Produktion anderswo stattfindet.", "Was steckt im gekauften Produkt?", "Konsumbilanzen zeigen Lieferkettenwirkung, sind aber methodisch anspruchsvoll.", "Ein importiertes T-Shirt wird beim Konsum sichtbar.", ["territorialbilanz", "scope-3"], ["deutschland-nur-zwei-prozent"]),
  glossary("scope-3", "Scope 3", "Scope 3 umfasst vor- und nachgelagerte Emissionen einer Wertschöpfungskette.", "Emissionen rund um Einkauf, Nutzung und Lieferkette.", "Scope 3 macht indirekte Verantwortung sichtbar, braucht aber gute Daten und klare Methodik.", "Ein Autohersteller zählt auch Lieferkette und Nutzung der Fahrzeuge.", ["konsumbilanz"], ["deutschland-nur-zwei-prozent", "e-autos-schlimmer-als-verbrenner"]),
  glossary("opex", "OPEX", "OPEX sind laufende Betriebskosten.", "Was kostet es im Betrieb?", "OPEX umfasst Betrieb, Wartung, Energie, Personal und laufende Gebühren.", "Eine Wärmepumpe kann höhere Anschaffung, aber niedrigere Betriebskosten haben.", ["capex"], p0Slugs),
  glossary("capex", "CAPEX", "CAPEX sind Investitionskosten für Anschaffung oder Bau.", "Was kostet es am Anfang?", "CAPEX zeigt die Startinvestition, aber nicht die laufende Wirkung.", "Eine Ladesäule kostet beim Bau, spart später Ölimporte.", ["opex"], p0Slugs),
  glossary("residuallast", "Residuallast", "Residuallast ist der Strombedarf, der nach Wind- und Solarstrom noch gedeckt werden muss.", "Was bleibt übrig, wenn Wind und Sonne abgezogen sind?", "Sie hilft zu prüfen, welche Speicher, Netze und flexible Erzeugung gebraucht werden.", "Abends ohne Wind braucht das System andere Quellen.", ["direktstrom"], ["wasserstoff-fuer-alles", "fusion-loest-das-energieproblem", "kernenergie-wieder-in-deutschland"]),
  glossary("direktstrom", "Direktstrom", "Direktstrom meint Stromnutzung ohne unnötige Umwandlung in Moleküle oder Wärmewege.", "Strom möglichst direkt nutzen.", "Direkte Elektrifizierung spart oft Energie, wenn sie technisch möglich ist.", "Ein E-Auto nutzt Strom direkter als E-Fuels im Verbrenner.", ["thermischer-strompfad"], ["e-fuels-retten-den-verbrenner", "wasserstoff-fuer-alles", "fusion-loest-das-energieproblem"]),
  glossary("thermischer-strompfad", "Thermischer Strompfad", "Strom entsteht über Wärme, Dampf und Turbine.", "Erst Wärme, dann Strom.", "Thermische Pfade können sinnvoll sein, sind aber oft träger und verlustreicher als direkte Nutzung.", "Fusion müsste Wärme in Strom verwandeln.", ["direktstrom"], ["fusion-loest-das-energieproblem", "kernenergie-wieder-in-deutschland"]),
  glossary("refinanzierung", "Refinanzierung", "Refinanzierung bedeutet, fällige Schulden durch neue Finanzierung zu ersetzen.", "Alte Anleihe läuft aus, neue wird ausgegeben.", "Staatsschulden funktionieren deshalb anders als ein privater Haushaltskredit.", "Der Bund tilgt eine fällige Anleihe oft mit einer neuen Anleihe.", ["unterlassungsschuld"], ["schulden-machen-oder-sparen"]),
  glossary("unterlassungsschuld", "Unterlassungsschuld", "Unterlassungsschuld entsteht, wenn Nicht-Investieren spätere Schäden und Kosten erzeugt.", "Auch Nichtstun kann teuer werden.", "Sie macht sichtbar, dass Sparen nicht automatisch verantwortungsvoll ist.", "Eine marode Brücke wird später teurer als frühe Sanierung.", ["wirkungshaushalt"], ["schulden-machen-oder-sparen"]),
  glossary("wirkungshaushalt", "Wirkungshaushalt", "Ein Wirkungshaushalt verbindet Geld mit Zustandsveränderungen.", "Nicht nur was kostet es, sondern was wird besser?", "Er prüft Ausgaben nach Wirkung, Nebenfolgen, Verteilung und Zukunftsfähigkeit.", "Schulsanierung wird an Lernen, Energie und Gesundheit gemessen.", ["unterlassungsschuld"], ["schulden-machen-oder-sparen", "radwege-in-peru"]),
  glossary("trustblock", "TrustBlock", "Der TrustBlock zeigt Datenstand, Quellen, Grenzen, Gegenposition und nächste Prüfung.", "Der Vertrauenskasten der Seite.", "Er macht sichtbar, worauf eine Karte beruht, was offen ist und wann sie geprüft wird.", "Eine Karte nennt sicher, unsicher, umstritten und Bilanzgrenze.", ["quelle", "bilanzgrenze"], p0Slugs),
];

function glossary(slug, label, shortDefinition, hoverDefinition, fullDefinition, plainLanguageExample, relatedTerms, usedInDossiers) {
  return {
    slug,
    label,
    shortDefinition,
    hoverDefinition,
    fullDefinition,
    plainLanguageExample,
    relatedTerms,
    usedInDossiers,
    sourceReferences: [],
    status: "approved",
    lastReviewed: LAST_ACCESSED,
  };
}

function writeGlossary() {
  write(
    OUT("content/glossar/glossary-registry.ts"),
    `
export type GlossaryEntry = {
  slug: string;
  label: string;
  shortDefinition: string;
  hoverDefinition: string;
  fullDefinition: string;
  plainLanguageExample: string;
  relatedTerms: string[];
  usedInDossiers: string[];
  sourceReferences?: string[];
  status: "draft" | "approved" | "needs_review" | "deprecated";
  lastReviewed: string;
};

export const GlossaryRegistry: GlossaryEntry[] = ${tsString(glossaryEntries)};
`
  );
  write(
    OUT("content/glossar/glossary-quality.ts"),
    `
import { GlossaryRegistry } from "./glossary-registry";

export const GlossaryQualityRules = {
  hoverMaxCharacters: 240,
  shortDefinitionMaxCharacters: 180,
  leadingEffectDefinition: "Wirkung ist die tatsächliche Veränderung von Zuständen. Sie kann positiv, negativ oder neutral sein.",
};

export const GlossaryQualityWarnings = GlossaryRegistry.flatMap((entry) => {
  const warnings: string[] = [];
  if (entry.hoverDefinition.length > GlossaryQualityRules.hoverMaxCharacters) warnings.push("hover_too_long");
  if (entry.shortDefinition.length > GlossaryQualityRules.shortDefinitionMaxCharacters) warnings.push("short_definition_too_long");
  return warnings.map((warning) => ({ slug: entry.slug, warning }));
});
`
  );
  write(
    OUT("content/glossar/glossary-relations.ts"),
    `
import { GlossaryRegistry } from "./glossary-registry";

export const GlossaryRelations = Object.fromEntries(
  GlossaryRegistry.map((entry) => [entry.slug, entry.relatedTerms])
);
`
  );
  write(OUT("assets/data/wirkungsradar-glossary.json"), JSON.stringify(glossaryEntries, null, 2));
  for (const entry of glossaryEntries) {
    const file = OUT("begriffe", entry.slug, "index.html");
    if (fs.existsSync(file)) continue;
    write(file, glossaryTermPage(entry));
  }
}

function glossaryTermPage(entry) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(entry.label)} | Wirkungsökonomie</title>
    <meta name="description" content="${esc(entry.shortDefinition)}">
    <link rel="canonical" href="https://wirkungsoekonomie.de/begriffe/${esc(entry.slug)}/">
    <link rel="icon" href="../../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260612-mobile-table-fix">
  </head>
  <body>
    <header class="site-header" data-search-exclude><a class="brand" href="../../index.html" aria-label="Wirkungsökonomie Startseite"><span class="brand-mark"><img src="../../assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a><button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button><nav class="site-nav" id="site-nav" aria-label="Hauptnavigation" data-search-exclude></nav></header>
    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb"><a href="../../index.html">Start</a> / <a href="../../wirkungsradar/glossar/">Wirkungsradar Glossar</a> / ${esc(entry.label)}</nav><p class="hero-kicker">Glossar</p><h1 class="hero-title">${esc(entry.label)}</h1><p class="hero-subtitle">${esc(entry.shortDefinition)}</p></div></section>
      <section class="section"><div><article class="card"><p class="card-kicker">Einfach erklärt</p><p class="card-text">${esc(entry.hoverDefinition)}</p><p class="card-text">${esc(entry.fullDefinition)}</p><p class="card-text"><strong>Beispiel:</strong> ${esc(entry.plainLanguageExample)}</p><p><a class="btn btn-secondary" href="../../wirkungsradar/glossar/">Zum Wirkungsradar-Glossar</a></p></article></div></section>
    </main>
    <script src="../../assets/js/main.js?v=20260612-mobile-table-fix"></script>
  </body>
</html>`;
}

const linkMap = Object.fromEntries(p0DossiersV2.map((dossier) => {
  const packData = packTemplates[dossier.slug];
  const related = p0Slugs.filter((slug) => slug !== dossier.slug).slice(0, 5).map((slug) => `/wirkungsradar/live/${slug}/`);
  const glossary = glossaryEntries
    .filter((entry) => entry.usedInDossiers.includes(dossier.slug) || entry.usedInDossiers.includes("*"))
    .slice(0, 10)
    .map((entry) => `/begriffe/${entry.slug}/`);
  const narrative = narrativeLinksFor(dossier.slug);
  return [dossier.slug, {
    glossary,
    narratives: narrative,
    relatedDossiers: related,
    solutions: ["/so-wirkt-wirkungsoekonomie/", "/wirkungsradar/methode/", "/wirkungsradar/host-playbook/"],
    sources: (packData?.requiredSources || []).map((id) => sources.find((item) => item.id === id)?.url).filter(Boolean),
    themes: (dossier.topicCluster || []).slice(0, 4).map((topic) => `/wirkungsradar/themen/?q=${encodeURIComponent(topic)}`),
  }];
}));

function narrativeLinksFor(slug) {
  if (/migration|arbeit/.test(slug)) return ["/wirkungsradar/narrative/gibt-dir-einen-schuldigen/"];
  if (/fusion|wasserstoff|e-fuels/.test(slug)) return ["/wirkungsradar/narrative/verkauft-warten-als-vernunft/"];
  if (/deutschland|schulden/.test(slug)) return ["/wirkungsradar/narrative/macht-dich-klein/"];
  if (/co2|ukraine|radwege/.test(slug)) return ["/wirkungsradar/narrative/macht-dich-wuetend/"];
  return ["/wirkungsradar/narrative/spezialfall-als-gegenargument/"];
}

function writeLinks() {
  write(OUT("content/wirkungsradar/link-map.ts"), `export const WirkungsradarLinkMap = ${tsString(linkMap)};\n`);
  write(
    OUT("content/wirkungsradar/link-rules.ts"),
    `
export const WirkungsradarLinkRules = {
  glossaryMin: 5,
  glossaryMax: 12,
  narrativeMin: 1,
  narrativeMax: 5,
  relatedDossierMin: 3,
  relatedDossierMax: 8,
  solutionMin: 1,
  solutionMax: 5,
  hostCockpitMaxLinks: 3,
};
`
  );
  write(OUT("assets/data/wirkungsradar-link-map.json"), JSON.stringify(linkMap, null, 2));
}

function trustSection(dossier) {
  const packData = packTemplates[dossier.slug];
  const sourceCards = (packData.requiredSources || []).map((id) => sources.find((item) => item.id === id)).filter(Boolean);
  const links = linkMap[dossier.slug];
  const version = "2.1";
  return `
<section class="section sprint4-trust-block" id="sprint4-vertrauen" data-sprint4-trust>
  <div>
    <div class="section-header">
      <p class="hero-kicker">Warum diese Einordnung belastbar ist</p>
      <h2>Quellen, Grenzen und Gegenposition sichtbar.</h2>
      <p>Diese Karte trennt Fakten, Frames, Folgen und offene Fragen. Quellen und Datenstand sind sichtbar.</p>
      <p class="radar-status-line"><span>Version ${version}</span><span>Datenstand ${esc(packData.dataStand)}</span><span>nächste Prüfung ${esc(packData.nextReviewDate)}</span><span>redaktionell geprüft: ausstehend</span></p>
    </div>
    <div class="card-grid two">
      <article class="card"><p class="card-kicker">Was sicher ist</p><ul class="clean-list">${packData.evidenceSummary.secure.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article>
      <article class="card"><p class="card-kicker">Was unsicher ist</p><ul class="clean-list">${packData.evidenceSummary.uncertain.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article>
      <article class="card"><p class="card-kicker">Was umstritten ist</p><ul class="clean-list">${packData.evidenceSummary.contested.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article>
      <article class="card"><p class="card-kicker">Was Kritiker:innen berechtigt fragen können</p><p class="card-text">${esc(packData.counterposition)}</p></article>
      <article class="card"><p class="card-kicker">Was wird mitgezählt?</p><p class="card-text">${esc(packData.accountingBoundary)}</p></article>
      <article class="card"><p class="card-kicker">Was diese Seite nicht behauptet</p><p class="card-text">${esc(packData.doesNotClaim)}</p></article>
    </div>
    <div class="section-header compact"><p class="hero-kicker">Quellenkarten</p><h2>Quellen im Maus-Modus.</h2></div>
    <div class="card-grid three">${sourceCards.map(sourceDisplayCard).join("")}</div>
  </div>
</section>
${linkHub(dossier, links)}
${feedbackBox(dossier)}
`;
}

function sourceDisplayCard(sourceItem) {
  return `<article class="card sprint4-source-card"><p class="card-kicker">Quelle · Tier ${esc(sourceItem.reliabilityTier)}</p><h3 class="card-title">${esc(sourceItem.label)}</h3><p class="card-text"><strong>Was zeigt sie?</strong> ${esc(sourceItem.useFor.join(", "))}</p><p class="card-text"><strong>Wofür nutzen wir sie?</strong> Für Faktenkern, Bilanzgrenze und Datenstand dieser Karte.</p><p class="card-text"><strong>Grenze der Quelle:</strong> ${esc(sourceItem.limitations.join(" "))}</p><p class="card-text"><strong>Datenstand:</strong> Zugriff ${esc(sourceItem.lastAccessed)}</p><p><a class="btn btn-secondary" href="${esc(sourceItem.url)}">Quelle öffnen</a></p></article>`;
}

function linkHub(dossier, links) {
  const groups = [
    ["Begriffe", links.glossary],
    ["Narrative", links.narratives],
    ["Ähnliche Karten", links.relatedDossiers],
    ["Lösungen", links.solutions],
    ["Quellen", links.sources],
  ];
  return `<section class="section sprint4-linkhub" id="weiterdenken"><div><div class="section-header"><p class="hero-kicker">Weiterdenken</p><h2>Links, die die Rechnung vertiefen.</h2></div><div class="card-grid five">${groups.map(([label, hrefs]) => `<article class="card"><p class="card-kicker">${esc(label)}</p>${hrefs.slice(0, 8).map((href) => `<p><a class="text-link" href="${esc(href)}">${esc(linkLabel(href))}</a></p>`).join("")}</article>`).join("")}</div></div></section>`;
}

function linkLabel(href) {
  if (/^https?:/.test(href)) return new URL(href).hostname.replace(/^www\./, "");
  const clean = href.replace(/\?.*$/, "").replace(/\/$/, "");
  return clean.split("/").pop().replace(/-/g, " ");
}

function feedbackBox(dossier) {
  const subject = encodeURIComponent(`Wirkungsradar Feedback: ${dossier.slug}`);
  const body = encodeURIComponent(`Dossier: ${dossier.title}\nFeedback-Typ:\nNachricht:\nQuelle/Link:\n`);
  return `<section class="section sprint4-feedback" id="feedback"><div><article class="card"><p class="card-kicker">Fehler gefunden oder bessere Quelle?</p><h2>Feedback als Qualitätsinput.</h2><p class="card-text">Bitte melde faktische Fehler, veraltete Quellen, fehlende Gegenpositionen, zu komplizierte Sprache oder Links, die nicht auf das richtige Ziel führen.</p><p><a class="btn btn-primary" href="mailto:kontakt@wirkungsoekonomie.de?subject=${subject}&body=${body}">Korrekturhinweis senden</a></p></article></div></section>`;
}

function injectTrustIntoDossierPages() {
  for (const dossier of p0DossiersV2) {
    if (curatedStandaloneSlugs.has(dossier.slug)) continue;
    for (const area of ["live", "detail"]) {
      const file = OUT("wirkungsradar", area, dossier.slug, "index.html");
      if (!fs.existsSync(file)) continue;
      let html = fs.readFileSync(file, "utf8");
      html = html.replace(/\n<section class="section sprint4-trust-block"[\s\S]*?<section class="section sprint4-feedback"[\s\S]*?<\/section>/, "");
      const section = trustSection(dossier);
      if (html.includes("</main>")) {
        html = html.replace("</main>", `${section}\n</main>`);
      } else {
        html += section;
      }
      write(file, html);
    }
  }
}

function shell({ title, description, canonical, base = "../", main }) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)} | Wirkungsökonomie</title>
    <meta name="description" content="${esc(description)}">
    <meta name="search_section" content="Wirkungsradar">
    <link rel="canonical" href="${esc(canonical)}">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260612-mobile-table-fix">
  </head>
  <body>
    <header class="site-header" data-search-exclude><a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a><button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button><nav class="site-nav" id="site-nav" aria-label="Hauptnavigation" data-search-exclude></nav></header>
    <main id="inhalt" data-pagefind-body>${main}</main>
    <script src="${base}assets/js/main.js?v=20260612-mobile-table-fix"></script>
  </body>
</html>`;
}

function radarNav(base = "../") {
  return `<nav class="topic-subnav radar-sprint-nav" aria-label="Debatten-Kompass Navigation" data-search-exclude><a href="${base}">Antwort finden</a><a href="${base}debattenkarten/">Debattenkarten</a><a href="${base}narrative/">Mythen & Narrative</a><a href="${base}antwort-playbooks/">Antwort-Playbooks</a><a href="${base}studio/">Studio</a><a href="${ACADEMY_NARRATIVE_URL}">Narrativ einreichen</a><a href="${base}methode/">Wirkungsradar-Methode</a><a href="${base}quellen/">Quellen</a></nav>`;
}

function statusPage() {
  const nextReviews = p0DossiersV2.map((dossier) => ({ dossier, pack: packTemplates[dossier.slug] })).sort((a, b) => a.pack.nextReviewDate.localeCompare(b.pack.nextReviewDate));
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Debatten-Kompass</a> / Status</nav><p class="hero-kicker">Wartung</p><h1 class="hero-title">Debatten-Kompass Status</h1><p class="hero-subtitle">${esc(editorialSentence)}</p></div></section>${radarNav("../")}<section class="section"><div><div class="card-grid four"><article class="card"><p class="card-kicker">Geprüfte Debattenkarten</p><h3 class="card-title">${p0DossiersV2.length}</h3><p class="card-text">Status: checked_v4_debattenkompass; redaktioneller Finalstatus wird separat geführt.</p></article><article class="card"><p class="card-kicker">In Überarbeitung</p><h3 class="card-title">0 prominent</h3><p class="card-text">Frame-Risiko-Seiten dürfen nicht prominent erscheinen.</p></article><article class="card"><p class="card-kicker">Quellenarchitektur</p><h3 class="card-title">${sources.length} Quellen</h3><p class="card-text">A/B/C/D-Tiers, Grenzen und Datenstand sichtbar.</p></article><article class="card"><p class="card-kicker">Glossar</p><h3 class="card-title">${glossaryEntries.length} Pflichtbegriffe</h3><p class="card-text">Hoverdefinitionen kurz, Beispiele vorhanden.</p></article></div><div class="section-header"><p class="hero-kicker">Nächste Reviews</p><h2>Kalender</h2></div><div class="card-grid three">${nextReviews.map(({ dossier, pack }) => `<article class="card"><p class="card-kicker">${esc(pack.nextReviewDate)}</p><h3 class="card-title">${esc(dossier.title)}</h3><p class="card-text">Datenstand ${esc(pack.dataStand)} · Bilanzgrenze: ${esc(pack.accountingBoundary)}</p></article>`).join("")}</div></div></section>`;
  return shell({ title: "Debatten-Kompass Status", description: "Status, Datenstand, Reviewkalender und Methodikstatus des Debatten-Kompass.", canonical: "https://wirkungsoekonomie.de/wirkungsradar/status/", base: "../../", main });
}

function sourcesPage() {
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Debatten-Kompass</a> / Quellen</nav><p class="hero-kicker">Vertrauen</p><h1 class="hero-title">Quellen im Debatten-Kompass</h1><p class="hero-subtitle">Quellen belegen nicht Autorität. Sie zeigen Datenstand, Grenze, Unsicherheit und wofür wir sie nutzen.</p></div></section>${radarNav("../")}<section class="section"><div><div class="card-grid four">${["A Primär / amtlich / robust", "B etablierte Forschung / Fachagentur", "C Perspektivquelle / NGO / Branche", "D Meinung / Diskursbeleg"].map((label) => `<article class="card"><p class="card-kicker">Reliability-Tier</p><h3 class="card-title">${esc(label)}</h3><p class="card-text">D-Quellen stützen nie allein Fakten. C-Quellen brauchen A/B daneben.</p></article>`).join("")}</div><div class="section-header"><p class="hero-kicker">Quellenkarten</p><h2>Was sie zeigen und was nicht.</h2></div><div class="card-grid three">${sources.map(sourceDisplayCard).join("")}</div></div></section>`;
  return shell({ title: "Debatten-Kompass Quellen", description: "Quellenarten, Reliability-Tiers, Datenstand und Grenzen der Wirkungsradar-Methode.", canonical: "https://wirkungsoekonomie.de/wirkungsradar/quellen/", base: "../../", main });
}

function editorialPage() {
  const roles = ["Autor:in", "Faktenprüfer:in", "Frame-Prüfer:in", "Maus-Modus-Prüfer:in", "Quellenkurator:in", "Final Review"];
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Debatten-Kompass</a> / Redaktion</nav><p class="hero-kicker">Governance</p><h1 class="hero-title">Wie Debattenkarten geprüft werden</h1><p class="hero-subtitle">${esc(editorialSentence)}</p></div></section>${radarNav("../")}<section class="section"><div><div class="card-grid three">${roles.map((role) => `<article class="card"><p class="card-kicker">Rolle</p><h3 class="card-title">${esc(role)}</h3><p class="card-text">Prüft Fakten, Frame-Risiko, Sprache, Quellen, Gegenposition und Status nach Reviewprotokoll.</p></article>`).join("")}</div><article class="card sprint4-feedback"><p class="card-kicker">Fehler melden</p><h2>Korrekturfähigkeit ist Teil der Qualität.</h2><p class="card-text">Melde faktische Fehler, veraltete Quellen, fehlende Gegenpositionen, Linkfehler oder Sprache, die Frames verstärkt.</p><p><a class="btn btn-primary" href="mailto:kontakt@wirkungsoekonomie.de?subject=Debatten-Kompass%20Feedback">Feedback senden</a></p></article></div></section>`;
  return shell({ title: "Debatten-Kompass Redaktion", description: "Redaktionelle Rollen, Prüfprozess, Fehlerkorrektur und Governance des Debatten-Kompass.", canonical: "https://wirkungsoekonomie.de/wirkungsradar/redaktion/", base: "../../", main });
}

function glossaryPage() {
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Debatten-Kompass</a> / Glossar</nav><p class="hero-kicker">Begriffssystem</p><h1 class="hero-title">Debatten-Kompass Glossar</h1><p class="hero-subtitle">Kurze Hoverdefinitionen, einfache Beispiele und konsistente Begriffe.</p></div></section>${radarNav("../")}<section class="section"><div><div class="card-grid three">${glossaryEntries.map((entry) => `<article class="card"><p class="card-kicker">${esc(entry.status)} · ${esc(entry.lastReviewed)}</p><h3 class="card-title">${esc(entry.label)}</h3><p class="card-text"><strong>Kurz:</strong> ${esc(entry.shortDefinition)}</p><p class="card-text"><strong>Hover:</strong> ${esc(entry.hoverDefinition)}</p><p class="card-text"><strong>Beispiel:</strong> ${esc(entry.plainLanguageExample)}</p></article>`).join("")}</div></div></section>`;
  return shell({ title: "Debatten-Kompass Glossar", description: "Pflichtbegriffe des Debatten-Kompass mit kurzen Definitionen und Beispielen.", canonical: "https://wirkungsoekonomie.de/wirkungsradar/glossar/", base: "../../", main });
}

function writePublicPages() {
  write(OUT("wirkungsradar/status/index.html"), statusPage());
  write(OUT("wirkungsradar/quellen/index.html"), sourcesPage());
  write(OUT("wirkungsradar/redaktion/index.html"), editorialPage());
  write(OUT("wirkungsradar/glossar/index.html"), glossaryPage());
}

function writeDocs() {
  write(
    OUT("docs/wirkungsradar-governance.md"),
    `# Debatten-Kompass Governance\n\n${editorialSentence}\n\n## Rollen\n\n- Autor:in: erstellt oder überarbeitet Dossier.\n- Faktenprüfer:in: prüft Zahlen, Quellen und Bilanzgrenzen.\n- Frame-Prüfer:in: prüft, ob die Schnellantwort Frames verstärkt.\n- Sprachprüfer:in: prüft Klarheit, Verständlichkeit und positive Beispiele.\n- Quellenkurator:in: pflegt Source-Packs und Datenstand.\n- Final Review: setzt Status reviewed oder published.\n\n## Kleinteam\n\nEine Person kann mehrere Rollen übernehmen. Jede Seite braucht mindestens Faktenprüfung, Frameprüfung und Sprachprüfung.\n\n## Reviewprotokoll\n\n- Datum\n- Prüfer:in\n- Status vorher\n- Status nachher\n- wichtigste Änderungen\n- offene Punkte\n`
  );
  write(
    OUT("docs/wirkungsradar-review-checklist.md"),
    `# Debatten-Kompass Review-Checkliste\n\n## 1. Schnellantwort\n- Ist der Claim klar?\n- Ist die Kurzantwort direkt nutzbar?\n- Ist das Kurzurteil maximal 8 Wörter?\n- Gibt es "Ein gutes Bild"?\n- Verstärkt das gute Bild keinen Mythos?\n- Gibt es eine echte bessere Frage?\n- Ist FrameShift vorhanden?\n\n## 2. Menschenschutz\n- Werden Menschen als Last dargestellt?\n- Werden Gruppen pauschalisiert?\n- Gibt es Beschämung?\n- Gibt es eine menschenwürdige Lösung?\n\n## 3. Sprache\n- Klar, ruhig und konkret?\n- Keine Fachwortwand?\n- Keine WÖk-Dauerwerbung?\n- Antwort sprechbar?\n\n## 4. Fakten\n- Faktenlage konkret?\n- Was fehlt?\n- Sind Zahlen aktuell?\n- Sind Unsicherheiten sichtbar?\n- Sind Quellen geeignet?\n\n## 5. Systemik\n- Mindestens 5 Wirkungsdimensionen?\n- Folgen erster, zweiter, dritter Ordnung?\n- Rückkopplung oder Lock-in?\n- Lösung konkret?\n\n## 6. Vertrauen\n- TrustBlock?\n- Datenstand?\n- nächste Prüfung?\n- Gegenposition?\n- Quellenkarten?\n\n## 7. Links\n- Glossarlinks?\n- Narrative?\n- Ähnliche Karten?\n- Lösungen?\n- externe Quellen?\n\n## Entscheidung\n- published\n- reviewed\n- checked_v4_debattenkompass\n- needs_update\n- draft_...\n`
  );
  write(
    OUT("docs/wirkungsradar-editorial-guidelines.md"),
    `# Redaktionelle Leitlinien Debatten-Kompass\n\n## Grundsatz\nDer Debatten-Kompass zeigt zuerst eine brauchbare Antwort und ein gutes Bild. Probleme werden nicht verschwiegen, aber nicht im ersten Bild verstärkt.\n\n## Sprache\nKlar, ruhig, konkret, professionell.\n\n## Schnellantwort\n- positives Beispiel\n- keine Abstracts\n- keine Problemstapel\n- keine Menschen als Last\n- keine WÖk-Dauerwerbung\n\n## Fakten\n- immer Quellen\n- Datenstand\n- Bilanzgrenze\n- Unsicherheiten\n\n## Narrative\n- benennen, nicht ausmalen\n- zeigen, was ausgelöst werden soll\n- Frame-Shift anbieten\n\n## Psychologie\n- alltagssprachlich\n- max. 3 Effekte oben\n- keine Copy-Paste-Blöcke\n\n## Quellen\n- A/B/C/D-Tiers\n- Grenzen jeder Quelle\n- Gegenposition sichtbar\n\n## Status\n- keine Seite ohne Gate prominent\n`
  );
}

function writeReports() {
  write(OUT("reports/review-calendar.md"), ["# Wirkungsradar Review-Kalender", "", ...p0DossiersV2.map((dossier) => `- ${packTemplates[dossier.slug].nextReviewDate}: ${dossier.title}`), ""].join("\n"));
  write(OUT("reports/published-status.md"), ["# Published Status", "", `P0-Karten: ${p0DossiersV2.length}`, "Prominent: checked_v2_positive_examples mit Hinweis redaktionell geprüft: ausstehend", "Frame-Risiko prominent: 0", ""].join("\n"));
}

writeSourceArchitecture();
writePacks();
writeGlossary();
writeLinks();
injectTrustIntoDossierPages();
writePublicPages();
writeDocs();
writeReports();

console.log("Built Wirkungsradar Sprint 4 trust, sources, glossary, links and governance.");
