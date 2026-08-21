#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const inputPath = path.resolve(process.argv[2] || "");
const outputPath = path.resolve(
  process.argv[3] || path.join(ROOT, "data/master-register/WOeK_Masterregister_v1.5_2026-08-21.xlsx"),
);

if (!process.argv[2]) {
  throw new Error("Usage: build-masterregister-v1.5.mjs <normalized-v1.4.xlsx> [output.xlsx]");
}

const nodeModules = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
if (!nodeModules) {
  throw new Error("CODEX_PRIMARY_RUNTIME_NODE_MODULES is required for @oai/artifact-tool.");
}

const artifactModule = pathToFileURL(
  path.join(nodeModules, "@oai/artifact-tool/dist/artifact_tool.mjs"),
).href;
const { FileBlob, SpreadsheetFile } = await import(artifactModule);

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const itemSheet = workbook.worksheets.getItem("01_Item_Register");
const itemIds = itemSheet.getRange("A5:A625").values.flat().filter(Boolean);
if (itemIds.length !== 621 || new Set(itemIds).size !== 621) {
  throw new Error(`Expected 621 unique WÖk IDs, found ${itemIds.length}/${new Set(itemIds).size}.`);
}

const teal = "#0F766E";
const tealDark = "#0B4F4A";
const tealLight = "#DDF3EF";
const blueLight = "#E8F0FE";
const amberLight = "#FFF3CD";
const grayLight = "#F3F4F6";
const grayBorder = "#D1D5DB";
const white = "#FFFFFF";
const navy = "#17324D";

const formatTitle = (sheet, range) => {
  sheet.getRange(range).format = {
    fill: tealDark,
    font: { bold: true, color: white, size: 16 },
    verticalAlignment: "center",
    wrapText: true,
  };
  sheet.getRange(range).format.rowHeight = 34;
};

const formatSubtitle = (sheet, range) => {
  sheet.getRange(range).format = {
    fill: tealLight,
    font: { color: navy, italic: true },
    verticalAlignment: "center",
    wrapText: true,
  };
  sheet.getRange(range).format.rowHeight = 34;
};

const formatHeader = (sheet, range) => {
  sheet.getRange(range).format = {
    fill: teal,
    font: { bold: true, color: white },
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: grayBorder },
  };
  sheet.getRange(range).format.rowHeight = 32;
};

const formatBody = (sheet, range) => {
  sheet.getRange(range).format = {
    verticalAlignment: "top",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: grayBorder },
  };
};

// Release metadata and explicit ontology/measurement bridge on every retained item.
const overview = workbook.worksheets.getItem("00_Übersicht");
overview.getRange("A1").values = [["WÖk Master Items v1.5 – Zwei-Ebenen- und Staatsarchitektur-Release"]];
overview.getRange("A2").values = [[
  "Stand 21.08.2026 · 621 unveränderte WÖk-IDs · Begriffsleitfaden v1.6 · Masterregister (WAS) und Wirkindikatorenregister (WOMIT) getrennt · amtliche Bundesarchitektur explizit referenziert",
]];
overview.getRange("F19").values = [["v1.5 = führende MasterItems- und Architekturfassung"]];
overview.getRange("F20").values = [["0 IDs ergänzt, entfernt oder umbenannt"]];
overview.getRange("F21").values = [["Offene Zuordnungen bleiben OPEN_REVIEW_REQUIRED"]];
overview.getRange("A34:B36").values = [
  ["11_Two_Level_Architecture", "MasterItem → StateVariable → Indicator → Observation → Analysis / RealityCheck"],
  ["12_State_Reference_Crosswalk", "Amtliche Bundesquellen, interne Quellenseiten und Datenfunktionen"],
  ["13_v1.5_Changelog", "Release-Delta v1.4 → v1.5 und bewusst offen gebliebene Prüfaufgaben"],
];
formatBody(overview, "A34:B36");
overview.getRange("A34:A36").format = { fill: tealLight, font: { bold: true, color: navy }, wrapText: true };

itemSheet.getRange("A1").values = [["01 · WÖk-ID-Register v1.5 – MasterItems"]];
itemSheet.getRange("A2").values = [[
  "621 IDs aus v1.4 unverändert übernommen · zusätzliche Architekturfelder trennen Wirkungsobjekt, Zustandsvariable, Indikator, Beobachtung und Zurechnung · keine offene Zuordnung wurde erfunden",
]];
itemSheet.getRange("AE5:AE625").values = Array.from({ length: 621 }, () => ["v1.5"]);
itemSheet.getRange("AF5:AF625").values = Array.from({ length: 621 }, () => ["2026-08-21"]);

const architectureHeaders = [
  "Ontology_Role",
  "StateVariable_Status",
  "Indicator_Mapping_Status",
  "Indicator_Registry_Reference",
  "Permitted_Data_Functions",
  "Causality_Status",
  "RealityCheck_Role",
  "Architecture_Note",
];
itemSheet.getRange("AH4:AO4").values = [architectureHeaders];
const architectureRows = itemIds.map(() => [
  "MASTER_ITEM",
  "OPEN_REVIEW_REQUIRED",
  "OPEN_REVIEW_REQUIRED",
  "https://parlament.wirkungsoekonomie.de/methodik/wirkindikatoren",
  "BASELINE | TARGET | OUTCOME | DISTRIBUTION | BOUNDARY | CONTEXT | IMPLEMENTATION | OUTPUT | REALITY_CHECK | COUNTERFACTUAL_INPUT",
  "NOT_ESTABLISHED_BY_INDICATOR_MAPPING",
  "ELIGIBLE_AFTER_OBSERVATION_AND_ATTRIBUTION_REVIEW",
  "MasterItem bezeichnet den betrachteten Wirkungsgegenstand. Zustandsvariable und Indikator sind fallbezogen zuzuordnen; Indikator ≠ Wirkung, Zielbezug ≠ Kausalität.",
]);
itemSheet.getRange("AH5:AO625").values = architectureRows;
formatHeader(itemSheet, "AH4:AO4");
formatBody(itemSheet, "AH5:AO625");
itemSheet.getRange("AH5:AH625").format.fill = tealLight;
itemSheet.getRange("AI5:AJ625").format.fill = amberLight;
itemSheet.getRange("AK5:AK625").format.fill = blueLight;
itemSheet.getRange("AL5:AO625").format.fill = grayLight;
itemSheet.getRange("AH:AH").format.columnWidth = 18;
itemSheet.getRange("AI:AJ").format.columnWidth = 24;
itemSheet.getRange("AK:AK").format.columnWidth = 42;
itemSheet.getRange("AL:AL").format.columnWidth = 48;
itemSheet.getRange("AM:AO").format.columnWidth = 38;

// Update internal register references and add the authoritative state sources to the workbook catalog.
const sourceCatalog = workbook.worksheets.getItem("07_Quellenkatalog");
sourceCatalog.getRange("C5:E5").values = [[
  "Führender Begriffsleitfaden der Wirkungsökonomie v1.6",
  "Führende Begriffs-, Methoden- und Redaktionsreferenz einschließlich staatlicher Nachhaltigkeitsarchitektur",
  "21.08.2026",
]];
sourceCatalog.getRange("G5").values = [[
  "Für neue Inhalte verbindlich; DNS/GGO/GFA/eNAP/eGFA werden als bestehende staatliche Architektur behandelt; WÖk ergänzt sie spezifisch.",
]];
sourceCatalog.getRange("C7:E7").values = [[
  "WÖk Master Items v1.5",
  "Kanonisches WÖk-MasterItem-, Scoring-, Quellen- und Governance-Register",
  "v1.5 · 21.08.2026",
]];
sourceCatalog.getRange("G7").values = [[
  "Führende MasterItems-Fassung mit expliziter Zwei-Ebenen-Architektur; 621 IDs unverändert, offene Zuordnungen ausdrücklich offen.",
]];

const legalSourceDocument = JSON.parse(
  await fs.readFile(path.join(ROOT, "content/quellenarchiv/legal-source-records.json"), "utf8"),
);
const legalSources = legalSourceDocument.sources.filter((source) => {
  const number = Number(String(source.code).replace(/\D/g, ""));
  return number >= 9029 && number <= 9037;
});
if (legalSources.length !== 9) {
  throw new Error(`Expected 9 state-architecture sources, found ${legalSources.length}.`);
}
const catalogRows = legalSources.map((source) => [
  source.code,
  source.author,
  source.title,
  `${source.sourceFunction}; Datenfunktion: ${source.dataFunction}`,
  String(source.year),
  source.url,
  source.einordnung,
]);
sourceCatalog.getRange("A53:G61").values = catalogRows;
formatBody(sourceCatalog, "A53:G61");
sourceCatalog.getRange("A53:A61").format = { fill: tealLight, font: { bold: true, color: navy }, wrapText: true };

// Release changes remain machine-readable inside the workbook.
const changelog = workbook.worksheets.getItem("05_Changelog");
changelog.getRange("A24:G29").values = [
  ["CH-020", "Registerarchitektur", "Methodenkorrektur", "v1.4 vermischte Wirkungsgegenstand, Messgröße und Scoring teilweise in einem hybriden Register.", "Masterregister/MasterItems (WAS) und Wirkindikatorenregister (WOMIT) sind als getrennte Ebenen ausgewiesen.", "Indikator ist nicht Wirkung; Messontologie und Wirkungsontologie müssen getrennt bleiben.", "Umgesetzt"],
  ["CH-021", "WÖk-IDs", "Kompatibilität", "621 IDs in v1.4.", "Dieselben 621 IDs in v1.5; keine ID ergänzt, entfernt oder umbenannt.", "Stabile Referenzen und transparente Versionierung.", "Umgesetzt"],
  ["CH-022", "Zuordnungen", "Governance", "StateVariable- und Indicator-Mapping waren nicht als eigene Prüfstatus sichtbar.", "Alle itembezogenen Zuordnungen starten als OPEN_REVIEW_REQUIRED.", "Keine fachliche Zuordnung ohne Quellen-, Mechanismus- und Datenprüfung erfinden.", "Umgesetzt"],
  ["CH-023", "Staatsarchitektur", "Quellenerweiterung", "DNS, GGO/GFA, Nachhaltigkeitsprüfung, eNAP/eGFA und parlamentarische Governance fehlten als zusammenhängender Referenzstrang.", "Amtliche Quellen WÖK-Q-9029 bis WÖK-Q-9037 sind mit Datenfunktion und internem Quellenpfad dokumentiert.", "WÖk ersetzt die bestehende staatliche Architektur nicht, sondern ergänzt sie.", "Umgesetzt"],
  ["CH-024", "Terminologie", "Referenzaktualisierung", "Begriffsleitfaden v1.5.", "Begriffsleitfaden v1.6 mit staatlicher Nachhaltigkeitsarchitektur und Zwei-Ebenen-Registerlogik.", "Glossar, Leitfaden, Register und Portale müssen dieselbe führende Terminologie verwenden.", "Umgesetzt"],
  ["CH-025", "Releasegrenze", "Transparenz", "FINAL konnte als Abschluss aller Fachprüfungen missverstanden werden.", "v1.5 ist die führende Architektur- und MasterItems-Fassung; NACE, Benchmarks, Schwellen und itembezogene Mappings bleiben entsprechend ihrem Prüfstatus offen.", "Versionierung darf offene Wissenschafts- und Datenarbeit nicht verdecken.", "Umgesetzt"],
];
formatBody(changelog, "A24:G29");
changelog.getRange("A24:A29").format = { fill: tealLight, font: { bold: true, color: navy }, wrapText: true };

const method = workbook.worksheets.getItem("09_Methodik_Transparenz");
for (const address of ["E7", "E8", "E10", "E36"]) {
  const cell = method.getRange(address);
  cell.values = [[String(cell.values[0][0] || "").replaceAll("v1.5", "v1.6")]];
}
method.getRange("A44:E45").values = [
  ["G. Release-Interpretation", null, null, null, null],
  ["v1.5", "Führende MasterItems- und Architekturfassung ab 21.08.2026", "621 IDs unverändert; offene Kalibrierungen, Benchmarks, NACE- und Mappingprüfungen bleiben explizit offen.", "Release bedeutet nicht, dass jede Schwelle, Zustandsvariable oder Indikatorzuordnung extern validiert ist.", "Begriffsleitfaden v1.6"],
];
method.getRange("A47:E54").values = [
  ["H. Zwei-Ebenen-Architektur", null, null, null, null],
  ["Ebene", "Leitfrage", "Objekt", "Funktion", "Trennung"],
  ["Masterregister / MasterItems", "WAS betrachten wir?", "MasterItem", "Wirkungsontologie", "Nicht mit Indikator oder Score gleichsetzen."],
  ["Wirkindikatorenregister", "WOMIT beobachten wir reale Zustände?", "Indicator", "Mess-/Beobachtungsontologie", "Indikator ist nicht Wirkung."],
  ["Kette", "MasterItem → StateVariable → Indicator → Observation", "Analysis / RealityCheck", "Attribution und Gegenfaktum separat prüfen", "Beobachtung ist nicht Zurechnung."],
  ["Datenfunktion", "BASELINE | TARGET | OUTCOME | DISTRIBUTION | BOUNDARY", "CONTEXT | IMPLEMENTATION | OUTPUT", "REALITY_CHECK | COUNTERFACTUAL_INPUT", "Directionality ist kein Score."],
  ["Staatsarchitektur", "DNS / GGO-GFA / Nachhaltigkeitsprüfung / eNAP-eGFA", "bestehende institutionelle Architektur", "Referenz-, Prüf-, Governance- und Monitoringfunktion", "Von WÖk-eigenen Ergänzungen getrennt ausweisen."],
  ["WÖk-Ergänzung", "Problem Review → Goal Review → A→M→ΔZ→R", "Optionen, Verteilung, Gegenfaktum, Attribution", "Reality Check und Lernschleife", "Konvergenz mit staatlichen Befunden ist ein valides Ergebnis."],
];
formatBody(method, "A47:E54");
method.getRange("A47:E47").format = { fill: tealDark, font: { bold: true, color: white }, wrapText: true };
method.getRange("A48:E48").format = { fill: teal, font: { bold: true, color: white }, wrapText: true };

const exportSchema = workbook.worksheets.getItem("10_Public_Export_Schema");
const publicSchemaRows = [
  ["Ontology_Role", "01_Item_Register", "Ontology_Role", "Rolle in der Wirkungsontologie", "Ja", "MASTER_ITEM; nicht Indikator oder Wirkung.", "direkt"],
  ["StateVariable_Status", "01_Item_Register", "StateVariable_Status", "Prüfstatus der Zustandsvariablen-Zuordnung", "Ja", "Offene Zuordnung bleibt OPEN_REVIEW_REQUIRED.", "direkt"],
  ["Indicator_Mapping_Status", "01_Item_Register", "Indicator_Mapping_Status", "Prüfstatus der Indikatorzuordnung", "Ja", "Keine automatische Zuordnung aus Zielähnlichkeit.", "direkt"],
  ["Indicator_Registry_Reference", "01_Item_Register", "Indicator_Registry_Reference", "Verweis auf das separate Wirkindikatorenregister", "Ja", "Messontologie bleibt getrennt.", "direkt"],
  ["Permitted_Data_Functions", "01_Item_Register", "Permitted_Data_Functions", "Zulässige Datenfunktionen im konkreten Fall", "Ja", "Funktion muss je Zuordnung bestimmt werden.", "direkt"],
  ["Causality_Status", "01_Item_Register", "Causality_Status", "Grenze der Kausalitätsaussage", "Ja", "Zielbezug und Indikatorzuordnung belegen keine Kausalität.", "direkt"],
  ["RealityCheck_Role", "01_Item_Register", "RealityCheck_Role", "Rolle nach Beobachtung und Attribution", "Ja", "Output, Outcome, Beobachtung und Zurechnung trennen.", "direkt"],
  ["Architecture_Note", "01_Item_Register", "Architecture_Note", "Kanonischer Architekturhinweis", "Ja", "Auf Detailseiten sichtbar machen.", "direkt"],
];
exportSchema.getRange("A37:G44").values = publicSchemaRows;
formatBody(exportSchema, "A37:G44");
exportSchema.getRange("A37:A44").format = { fill: tealLight, font: { bold: true, color: navy }, wrapText: true };

const twoLevel = workbook.worksheets.getOrAdd("11_Two_Level_Architecture");
twoLevel.showGridLines = false;
twoLevel.mergeCells("A1:H1");
twoLevel.mergeCells("A2:H2");
twoLevel.getRange("A1").values = [["11 · Zwei-Ebenen-Architektur: Wirkungsobjekt und Messbeobachtung"]];
twoLevel.getRange("A2").values = [[
  "Masterregister/MasterItems beantworten WAS betrachtet wird. Das separate Wirkindikatorenregister beantwortet WOMIT reale Zustände beobachtet werden.",
]];
formatTitle(twoLevel, "A1:H1");
formatSubtitle(twoLevel, "A2:H2");
twoLevel.getRange("A4:H4").values = [["Ebene", "Leitfrage", "Kernobjekt", "Funktion", "Status", "Verbindung", "Nicht gleichsetzen mit", "Öffentliche Referenz"]];
twoLevel.getRange("A5:H6").values = [
  ["1 · Masterregister / MasterItems", "WAS betrachten wir?", "MasterItem", "Wirkungsontologie", "ACTIVE · v1.5", "MasterItem → StateVariable", "Indicator / Observation / Score", "https://wirkungsoekonomie.de/woek-id-register/"],
  ["2 · Wirkindikatorenregister", "WOMIT beobachten wir reale Zustände?", "Indicator", "Mess- und Beobachtungsontologie", "ACTIVE · separates Register", "StateVariable → Indicator → Observation", "Impact / Attribution / Recommendation", "https://parlament.wirkungsoekonomie.de/methodik/wirkindikatoren"],
];
twoLevel.getRange("A9:E9").values = [["Schritt", "Objekt", "Leitfrage", "Prüfregel", "Status in v1.5"]];
twoLevel.getRange("A10:E14").values = [
  [1, "MasterItem", "Welcher Wirkungsgegenstand wird betrachtet?", "Objekt präzise und fallbezogen bestimmen.", "621 stabile IDs"],
  [2, "StateVariable", "Welcher reale Zustand kann sich verändern?", "Variable, Population, Raum, Zeit und Baseline dokumentieren.", "OPEN_REVIEW_REQUIRED je Item/Fall"],
  [3, "Indicator", "Womit wird dieser Zustand beobachtet?", "Datenfunktion und Provenienz bestimmen; Directionality ist kein Score.", "OPEN_REVIEW_REQUIRED je Item/Fall"],
  [4, "Observation", "Was wurde tatsächlich gemessen oder beobachtet?", "Output ≠ Outcome; fehlende Daten bleiben fehlend.", "Fall- und zeitbezogen"],
  [5, "Analysis / RealityCheck", "Was ist plausibel zurechenbar und was muss revidiert werden?", "Gegenfaktum, Attribution, Unsicherheit und Falsifikation prüfen.", "Erst nach Umsetzung/Beobachtung"],
];
twoLevel.getRange("A17:D17").values = [["Pflichttrennung", "Korrekte Aussage", "Unzulässige Abkürzung", "Gate"]];
twoLevel.getRange("A18:D23").values = [
  ["Indicator / Impact", "Ein Indikator beobachtet einen Zustand.", "Indikator = Wirkung", "INDICATOR_NOT_IMPACT"],
  ["Target / Causality", "Zielbezug ordnet ein.", "Zielbezug = Kausalitätsnachweis", "TARGET_ALIGNMENT_NOT_CAUSALITY"],
  ["Output / Outcome", "Output ist eine erbrachte Leistung; Outcome eine Zustandsänderung.", "Aktivität = Wirkung", "OUTPUT_NOT_OUTCOME"],
  ["Observation / Attribution", "Beobachtung und Zurechnung sind getrennte Prüfschritte.", "Zeitfolge = Verursachung", "OBSERVATION_NOT_ATTRIBUTION"],
  ["State / WÖk", "Die staatliche Architektur besteht bereits; WÖk ergänzt sie spezifisch.", "WÖk ersetzt GFA/eNAP", "STATE_ARCHITECTURE_SEPARATE_FROM_WOEK_ARCHITECTURE"],
  ["Limits / Aggregation", "Harte Schutzgrenzen bleiben nichtkompensierbar.", "Ein Gesamtscore neutralisiert jede Grenzverletzung.", "NON_COMPENSATION_TAUGHT"],
];
formatHeader(twoLevel, "A4:H4");
formatBody(twoLevel, "A5:H6");
formatHeader(twoLevel, "A9:E9");
formatBody(twoLevel, "A10:E14");
formatHeader(twoLevel, "A17:D17");
formatBody(twoLevel, "A18:D23");
twoLevel.getRange("A5:A6").format.fill = tealLight;
twoLevel.getRange("A10:A14").format.fill = tealLight;
twoLevel.getRange("D18:D23").format.fill = blueLight;
twoLevel.getRange("A:H").format.columnWidth = 24;
twoLevel.getRange("B:B").format.columnWidth = 28;
twoLevel.getRange("D:H").format.columnWidth = 36;
twoLevel.freezePanes.freezeRows(4);

const stateCrosswalk = workbook.worksheets.getOrAdd("12_State_Reference_Crosswalk");
stateCrosswalk.showGridLines = false;
stateCrosswalk.mergeCells("A1:H1");
stateCrosswalk.mergeCells("A2:H2");
stateCrosswalk.getRange("A1").values = [["12 · Staatliche Nachhaltigkeitsarchitektur – Quellen- und Funktionscrosswalk"]];
stateCrosswalk.getRange("A2").values = [[
  "Amtliche Primärquellen werden zuerst über interne Quellenseiten eingeordnet. Fehlende öffentliche eNAP-/GFA-Dokumentation bedeutet NOT_PUBLICLY_ESTABLISHED, nicht automatisch NOT_ASSESSED.",
]];
formatTitle(stateCrosswalk, "A1:H1");
formatSubtitle(stateCrosswalk, "A2:H2");
stateCrosswalk.getRange("A4:H4").values = [["Source_ID", "Amtlicher Bereich", "Quellenfunktion", "Datenfunktion", "Interne Quellenseite", "Amtliche Originalquelle", "Prüfstatus", "WÖk-Einordnung"]];
const stateRows = legalSources.map((source) => [
  source.code,
  source.typeLabel,
  source.sourceFunction,
  source.dataFunction,
  `https://wirkungsoekonomie.de/quellenarchiv/${source.code.toLowerCase().replace("wök", "wok")}/`,
  source.url,
  source.reviewStatus === "fuehrend" ? "VERIFIED_PRIMARY_SOURCE" : "VERSIONED_CURRENT_SOURCE",
  source.einordnung,
]);
stateCrosswalk.getRange("A5:H13").values = stateRows;
formatHeader(stateCrosswalk, "A4:H4");
formatBody(stateCrosswalk, "A5:H13");
stateCrosswalk.getRange("A5:A13").format = { fill: tealLight, font: { bold: true, color: navy }, wrapText: true };
stateCrosswalk.getRange("D5:D13").format.fill = blueLight;
stateCrosswalk.getRange("G5:G13").format.fill = grayLight;
stateCrosswalk.getRange("A:A").format.columnWidth = 16;
stateCrosswalk.getRange("B:B").format.columnWidth = 26;
stateCrosswalk.getRange("C:D").format.columnWidth = 42;
stateCrosswalk.getRange("E:F").format.columnWidth = 52;
stateCrosswalk.getRange("G:G").format.columnWidth = 28;
stateCrosswalk.getRange("H:H").format.columnWidth = 56;
stateCrosswalk.freezePanes.freezeRows(4);

const delta = workbook.worksheets.getOrAdd("13_v1.5_Changelog");
delta.showGridLines = false;
delta.mergeCells("A1:F1");
delta.mergeCells("A2:F2");
delta.getRange("A1").values = [["13 · v1.4 → v1.5: Release-Delta und Reifegrenze"]];
delta.getRange("A2").values = [[
  "v1.5 schließt die Architektur- und Quellenlücke, ohne offene fachliche Kalibrierungen oder Zuordnungen als erledigt auszugeben.",
]];
formatTitle(delta, "A1:F1");
formatSubtitle(delta, "A2:F2");
delta.getRange("A4:F4").values = [["Bereich", "v1.4", "v1.5", "Delta", "Status", "Nächste fachliche Arbeit"]];
delta.getRange("A5:F12").values = [
  ["WÖk-IDs", "621", "621", "0 ergänzt · 0 entfernt · 0 umbenannt", "COMPLETE", "IDs stabil halten"],
  ["Registerebenen", "hybride Objekt-/Mess-/Scorelogik", "MasterItems und Wirkindikatorenregister getrennt", "Architektur explizit", "COMPLETE", "Cross-System-Parität erhalten"],
  ["StateVariable-Mapping", "nicht als eigener Status", "OPEN_REVIEW_REQUIRED je Item/Fall", "keine erfundene Zuordnung", "OPEN_BY_DESIGN", "fall- und quellenbezogen kuratieren"],
  ["Indicator-Mapping", "nicht als eigener Status", "OPEN_REVIEW_REQUIRED je Item/Fall", "separates Register referenziert", "OPEN_BY_DESIGN", "Provenienz und Datenfunktion je Mapping prüfen"],
  ["Bundesarchitektur", "nicht als geschlossener Referenzstrang", "DNS/GGO/GFA/eNAP/eGFA/PBnEZ mit Primärquellen", "9 amtliche Referenzen", "COMPLETE", "Versionen beobachten"],
  ["Begriffsleitfaden", "v1.5", "v1.6", "Staats- und Zwei-Ebenen-Architektur ergänzt", "COMPLETE", "Glossarparität prüfen"],
  ["Schwellen/Benchmarks", "teils offen", "unverändert nach Prüfstatus", "keine Scheinschließung", "OPEN_BY_DESIGN", "wissenschaftlich und sektorspezifisch validieren"],
  ["NACE Rev. 2.1", "Migration offen", "unverändert offen", "keine unbelegte Massenmigration", "OPEN_BY_DESIGN", "fachliche Korrespondenzprüfung"],
];
formatHeader(delta, "A4:F4");
formatBody(delta, "A5:F12");
delta.getRange("A5:A12").format = { fill: tealLight, font: { bold: true, color: navy }, wrapText: true };
delta.getRange("E5:E12").format.fill = grayLight;
delta.getRange("A:F").format.columnWidth = 34;
delta.getRange("B:C").format.columnWidth = 40;
delta.getRange("D:F").format.columnWidth = 46;
delta.freezePanes.freezeRows(4);

await fs.mkdir(path.dirname(outputPath), { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

const previewDir = path.join("/tmp", "woek-master-v15-previews");
await fs.mkdir(previewDir, { recursive: true });
for (const sheetName of ["00_Übersicht", "11_Two_Level_Architecture", "12_State_Reference_Crosswalk", "13_v1.5_Changelog"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  const previewPath = path.join(previewDir, `${sheetName.replaceAll(/[^a-zA-Z0-9._-]/g, "-")}.png`);
  await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));
}

const summary = await workbook.inspect({
  kind: "sheet",
  include: "id,name",
  maxChars: 5000,
});
console.log(summary.ndjson);
console.log(`WÖk Master Items v1.5 written: ${outputPath}`);
console.log(`Previews: ${previewDir}`);
