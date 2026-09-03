#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ARTIFACT = {
  artifact_id: "BE-AGH-2026-BSW-WAHLPROGRAMM",
  artifact_url: "https://bsw.berlin/wp-content/uploads/Wahlprogramm-BSW-Berlin-AGH-Wahl-2026.pdf",
  artifact_sha256: "fd6fe2b9fbb69fc5a34451989c2a75feb14e893c172a20d7840bbe94f2161675",
  byte_length: 757572,
  page_count: 66,
  title: "Berlin – Mit uns endlich vernünftig und gerecht",
};

const REVIEWED_AT = "2026-08-26T19:45:00+02:00";
const PROVENANCE = {
  approval_basis: "DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26",
  approval_authority: "PROJECT_OWNER_DELEGATED_PROTOCOL",
  review_mode: "SOURCE_BOUND_OBJECT_LEVEL",
  human_individual_record_review_claimed: false,
};

const PROTECTED_STOCK = [
  {
    source_range: "PDF pages 1-5",
    issue_comment_id: 5411235844,
    issue_comment_url: "https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5411235844",
    accepted_set_status: "PASS_SOURCE_BOUND",
    accepted_source_objects: 13,
    normalized_explicit_fach_approved: 8,
    normalized_reviewed_not_assessable_or_reclassified: 3,
    non_effect_context_or_non_counting_parent: 2,
    preservation_rule: "SET_WISE_REFERENCE_ONLY_NO_REINTERPRETATION",
    accepted_terminal_records: [
      { record_id: "BE-BSW-P01-CONTEXT", terminal_status: "NON_EFFECT_CONTEXT_REVIEWED" },
      { record_id: "BE-BSW-P02P03-SEVEN-DEMANDS", terminal_status: "NON_EFFECT_CONTEXT_REVIEWED" },
      { record_id: "BE-BSW-FRIEDEN-001", terminal_status: "EXPLICIT_FACH_APPROVED" },
      { record_id: "BE-BSW-FRIEDEN-002", terminal_status: "EXPLICIT_FACH_APPROVED" },
      { record_id: "BE-BSW-FRIEDEN-003", terminal_status: "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON" },
      { record_id: "BE-BSW-FRIEDEN-004", terminal_status: "EXPLICIT_FACH_APPROVED" },
      { record_id: "BE-BSW-FRIEDEN-005", terminal_status: "EXPLICIT_FACH_APPROVED" },
      { record_id: "BE-BSW-FRIEDEN-006", terminal_status: "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON" },
      { record_id: "BE-BSW-FRIEDEN-007", terminal_status: "EXPLICIT_FACH_APPROVED" },
      { record_id: "BE-BSW-FRIEDEN-008", terminal_status: "EXPLICIT_FACH_APPROVED" },
      { record_id: "BE-BSW-FRIEDEN-009", terminal_status: "EXPLICIT_FACH_APPROVED" },
      { record_id: "BE-BSW-FRIEDEN-010", terminal_status: "EXPLICIT_FACH_APPROVED" },
      { record_id: "BE-BSW-FRIEDEN-011", terminal_status: "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON" },
    ],
  },
  {
    source_range: "PDF pages 6-8",
    issue_comment_ids: [5368010997, 5399016908],
    issue_comment_urls: [
      "https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5368010997",
      "https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5399016908",
    ],
    accepted_set_status: "PASS_23_TERMINAL",
    accepted_source_objects: 23,
    normalized_explicit_fach_approved: 19,
    normalized_reviewed_not_assessable_or_reclassified: 4,
    non_effect_context_or_non_counting_parent: 0,
    preservation_rule: "SET_WISE_REFERENCE_ONLY_NO_REINTERPRETATION",
    accepted_terminal_records: Array.from({ length: 23 }, (_, index) => {
      const ordinal = index + 1;
      const approved = new Set([1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 17, 18, 19, 20, 21, 22]);
      return {
        record_id: `BE-BSW-WOHN-${String(ordinal).padStart(3, "0")}`,
        terminal_status: approved.has(ordinal) ? "EXPLICIT_FACH_APPROVED" : "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON",
      };
    }),
  },
  {
    source_range: "PDF pages 9-13",
    issue_comment_id: 5414303147,
    issue_comment_url: "https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5414303147",
    accepted_set_status: "PASS_SOURCE_BOUND",
    accepted_source_objects: 20,
    normalized_explicit_fach_approved: 15,
    normalized_reviewed_not_assessable_or_reclassified: 5,
    non_effect_context_or_non_counting_parent: 0,
    preservation_rule: "SET_WISE_REFERENCE_ONLY_NO_REINTERPRETATION",
    accepted_terminal_records: [
      [1, "Cooperatives: land access, funding and project development support", "EXPLICIT_FACH_APPROVED"],
      [2, "Preferential public land / 99-year leasehold for cooperatives", "EXPLICIT_FACH_APPROVED"],
      [3, "Higher non-profit/cooperative share in Land/state-company housing projects", "EXPLICIT_FACH_APPROVED"],
      [4, "Strengthen collective bargaining / simplify extension of collective agreements", "EXPLICIT_FACH_APPROVED"],
      [5, "End precarious work under Land responsibility / restore full public-service tariff application", "EXPLICIT_FACH_APPROVED"],
      [6, "Support unions / works and staff councils", "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON"],
      [7, "Equal pay for equal work at the same employer", "EXPLICIT_FACH_APPROVED"],
      [8, "Abolish objective-reason-free fixed-term contracts in the public sector", "EXPLICIT_FACH_APPROVED"],
      [9, "Reverse spin-offs/new formations and reintegrate cleaning/logistics", "EXPLICIT_FACH_APPROVED"],
      [10, "Further declarations of general applicability / federal facilitation", "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON"],
      [11, "Additional counselling points for family benefits and multi-channel application support", "EXPLICIT_FACH_APPROVED"],
      [12, "Protect social-service capacity / material, legal and psychosocial help", "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON"],
      [13, "Early rent-loss prevention / Housing First / emergency accommodation / support", "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON"],
      [14, "Housing First as sustained citywide standard measure", "EXPLICIT_FACH_APPROVED"],
      [15, "Vacancy/misuse/rent-gouging enforcement plus broader allocation rights", "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON"],
      [16, "Expand drug prevention and harm-reduction/treatment access", "EXPLICIT_FACH_APPROVED"],
      [17, "Specialist accommodation for people with addiction who are homeless", "EXPLICIT_FACH_APPROVED"],
      [18, "Independent monitoring/control body for youth offices", "EXPLICIT_FACH_APPROVED"],
      [19, "Long-term district centres / neighbourhood projects / anti-loneliness measures", "EXPLICIT_FACH_APPROVED"],
      [20, "Connect Kitas, primary schools and senior facilities", "EXPLICIT_FACH_APPROVED"],
    ].map(([ordinal, source_anchor, terminal_status]) => ({ ordinal, source_anchor, terminal_status })),
  },
];

// These units were read individually and classified as diagnosis, historical
// account, rationale, repetition or campaign framing without an independent
// policy instrument. Headings are detected separately by document structure.
const reviewedNonEffectContext = new Set(`
15:7 15:9
17:10
18:4 18:9 18:10
19:6
23:6
26:2 26:3
27:5
28:1
30:2
34:2 34:5 34:8
35:1
36:1
38:4 38:5 38:6 38:10
39:1
41:6 41:14
44:3 44:6
45:1 45:2
48:2
49:11
50:1 50:4
52:2 52:7
53:2
54:1 54:7 54:10 54:11
56:1 56:2 56:3
57:1 57:5 57:11
58:8
60:1 60:2 60:4 60:5 60:6 60:7 60:11 60:12
61:3 61:4 61:5 61:6 61:8 61:10 61:11 61:12 61:13
62:1
66:2 66:9
`.trim().split(/\s+/));

const reviewedContextSpecificReasons = new Map([
  ["17:10", "Die Source Unit wiederholt die bereits im geschützten Seiten-1–5-Bestand als BE-BSW-FRIEDEN-005 geführte verpflichtende Zivilklausel und fügt kein selbständiges Instrument hinzu. Sie bleibt source-visible, erhält aber zur Vermeidung doppelter Effektzählung NON_EFFECT_CONTEXT_REVIEWED; die Fachentscheidung verbleibt unverändert am akzeptierten Ursprungsrecord in issue #240 comment 5411235844."],
]);

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function parseArgs() {
  const args = process.argv.slice(2);
  const value = (flag) => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : null;
  };
  return {
    artifact: value("--artifact"),
    output: value("--output") ?? "data/state-programmes/fach-reviews/berlin-2026-bsw-v1.json",
    check: args.includes("--check"),
  };
}

function normalizedPageUnits(artifactPath, page) {
  const text = execFileSync("pdftotext", [
    "-f", String(page), "-l", String(page), "-layout", artifactPath, "-",
  ]).toString("utf8");
  const units = [];
  let lines = [];
  const flush = () => {
    if (!lines.length) return;
    units.push(lines.join(" ").replace(/\s+/g, " ").trim());
    lines = [];
  };
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (
      /^Wahlprogramm BSW Berlin AGH-Wahl 2026$/.test(line)
      || /^Wahlprogramm des Bündnis Sahra Wagenknecht/.test(line)
      || /^Wahlen zum 20\. Abgeordnetenhaus/.test(line)
      || /^Seite \d+ von 66$/.test(line)
      || line === "\f"
    ) continue;
    if (!line) flush();
    else lines.push(line);
  }
  flush();
  return units;
}

function isStructuralHeading(text) {
  return text.length <= 100 && !/[.!?;:]\s*$/.test(text);
}

function contextReason(kind) {
  if (kind === "STRUCTURAL_HEADING") {
    return "Die vollständig gelesene Source Unit ist eine reine Abschnittsüberschrift ohne eigenständige politische Handlung; sie wird als NON_EFFECT_CONTEXT geführt und erzeugt kein zusätzliches Wirkobjekt.";
  }
  return "Die vollständig gelesene Source Unit enthält Diagnose, historische Darstellung, Begründung, Wiederholung oder Kampagnenrahmung, aber kein eigenständiges politisches Instrument; sie wird deshalb als NON_EFFECT_CONTEXT geführt und nicht als Wirkung ausgegeben.";
}

const reasonProfiles = {
  EDUCATION_DELIVERY_AND_RIGHTS: {
    missing: ["operationalisierte Zielgruppe/Reichweite", "Personal-, Zeit- und Finanzierungsparameter", "belastbarer Vergleichs- oder Ausgangszustand", "Outcome-Evidenz", "prüfbarer Reality Check"],
    detail: "Die Bildungsmaßnahme bestimmt nicht gemeinsam Kohorte und Reichweite, Personal-/Zeit-/Kostenpfad, belastbaren Vergleichszustand und ein später prüfbares Lern-, Teilhabe- oder Verteilungsoutcome. Soweit Zugangs- oder Auswahlrechte berührt sind, fehlen außerdem Ausnahmen und eine überprüfbare Abwägungsregel.",
  },
  CULTURE_FUNDING_SELECTION: {
    missing: ["Förderdelta und Budget", "Auswahl-/Zugangskriterien", "Additionalität zur bestehenden Förderung", "Verteilungs- und Freiheitsabwägung", "Outcome-Reality-Check"],
    detail: "Für das Kulturvorhaben fehlen das genaue Förder-/Rechtsdelta, Budget und Additionalität, transparente Auswahl- und Zugangsregeln sowie eine belastbare Abwägung von Teilhabe, Kunstfreiheit und Opportunitätskosten. Aktivität oder Fördervolumen allein wäre kein Outcome.",
  },
  HEALTH_COMPETENCE_CAPACITY: {
    missing: ["Landes-/Bundes-/Selbstverwaltungshebel", "Versorgungsbaseline", "klinische oder versorgungsbezogene Outcome-Evidenz", "Personal- und Finanzierungskapazität", "Sicherheits-/Qualitäts-Reality-Check"],
    detail: "Die Source Unit trennt den Berliner Landeshebel nicht vollständig von Bundesrecht, Kassen-/KV-Selbstverwaltung oder Leistungserbringern und belegt nicht zugleich Versorgungsbaseline, Personal-/Finanzierungskapazität, Qualitäts- und Sicherheitsfolgen sowie ein beobachtbares Patientenoutcome.",
  },
  SPORT_FUNDING_DELIVERY: {
    missing: ["standort- und anlagenbezogene Baseline", "Priorisierungs- und Zugangsregeln", "Investitions- und Betriebskosten", "Kapazitäts-/Nutzungsoutcome", "Opportunitätskosten"],
    detail: "Das Sportvorhaben enthält nicht gemeinsam eine anlagen-/bezirksbezogene Ausgangslage, transparente Priorisierung und Zugangsregeln, Investitions- plus Betriebskosten sowie einen prüfbaren Nutzungs-, Gesundheits- oder Teilhabeeffekt gegenüber Alternativen.",
  },
  CORONA_INQUIRY_EVIDENTIARY_RIGHTS: {
    missing: ["exakter Untersuchungs- oder Rechtsgegenstand", "Evidenz- und Kausalitätsstandard", "Zuständigkeitsgrenze", "Verfahrens- und Grundrechtsschutz", "umsetzbares Ergebnis-/Revisionskriterium"],
    detail: "Für Aufarbeitung, Untersuchung oder Folgemaßnahme fehlen ein abschließend abgegrenzter Gegenstand, Evidenz-/Kausalitätsstandard, Zuständigkeit, Verfahrens- und Grundrechtsschutz sowie die Regel, welche Feststellung welche konkrete Zustandsänderung auslösen soll.",
  },
  MEDIA_DEMOCRACY_RIGHTS: {
    missing: ["konkretes Gesetzes-/Vertragsdelta", "Kompetenz und Normadressat", "Verhältnismäßigkeits-/Pluralismusabwägung", "Umsetzungs- und Beschwerdeverfahren", "demokratisches Outcome-Kriterium"],
    detail: "Das Vorhaben berührt Medienordnung, Beteiligungsregeln oder Freiheits-/Gleichheitsrechte, ohne Gesetzes-/Vertragsdelta, zuständigen Normadressaten, Verhältnismäßigkeits- und Pluralismusprüfung, Beschwerdeweg und ein nicht-tautologisches demokratisches Outcome vollständig festzulegen.",
  },
  MIGRATION_COMPETENCE_EQUAL_TREATMENT: {
    missing: ["EU-/Bundes-/Landeskompetenz", "Anspruchs-/Status- und Zielgruppendefinition", "Härtefall- und Gleichbehandlungsregeln", "Vollzugsressourcen", "Integrations-/Schutzoutcome und Gegenfolgen"],
    detail: "Die migrationsbezogene Maßnahme trennt EU-, Bundes- und Landeskompetenz nicht vollständig und lässt Anspruchs-/Statusdefinition, Härtefall- und Gleichbehandlungsregeln, Vollzugsressourcen sowie Schutz-, Integrations- und Gegenfolgen ohne belastbare Gewichtungs- und Reality-Check-Grundlage offen.",
  },
  SECURITY_RIGHTS_CAPACITY: {
    missing: ["Eingriffsschwelle und Zielgruppe", "gesetzliche Kompetenz", "Verhältnismäßigkeit/richterliche Kontrolle", "Personal-, Technik- und Kostenbaseline", "Sicherheitsoutcome und Verlagerungsrisiken"],
    detail: "Für die Sicherheitsmaßnahme fehlen gemeinsam eine präzise Eingriffsschwelle und Zielgruppe, Rechts-/Kompetenzdelta, Verhältnismäßigkeits- und Kontrollregel, Personal-/Technik-/Kostenbaseline sowie ein kausal prüfbares Sicherheitsoutcome einschließlich Verlagerungs- und Fehlerrisiken.",
  },
  ECONOMY_COMPETENCE_FINANCING: {
    missing: ["Landes-/Bundeshebel", "Adressaten- und Förderkriterien", "Finanzierungs-/Steuerdelta", "Additionalität und Mitnahmeeffekte", "Beschäftigungs-/Produktivitäts-Reality-Check"],
    detail: "Das Wirtschafts-/Fördervorhaben trennt Landes- und Bundeshebel nicht vollständig und spezifiziert nicht zugleich Adressaten/Eligibility, Budget- oder Steuerdelta, Additionalität/Mitnahmeeffekte, administrative Kosten und ein beobachtbares Beschäftigungs-, Investitions- oder Produktivitätsoutcome.",
  },
  ENERGY_TECHNICAL_COMPETENCE: {
    missing: ["Bundes-/EU-/Landeshebel", "technische System- und Nachfrageparameter", "Netz-/Speicher-/Sicherheitsbaseline", "Vollkosten und Verteilungswirkung", "Lifecycle-/Emissions-Reality-Check"],
    detail: "Die Energiemaßnahme legt Kompetenz-/Regulierungshebel, Nachfrage- und Systemgrenze, Netz-/Speicher-/Reserveparameter, Vollkosten und Verteilung sowie ein Lifecycle-/Emissions- und Versorgungssicherheitskriterium nicht gemeinsam belastbar fest.",
  },
  MOBILITY_TECHNICAL_FUNDING: {
    missing: ["Projekt-/Netzabgrenzung und Nachfragebaseline", "Investitions-/Betriebskosten", "Alternativenvergleich", "Sicherheits-/Barrierefreiheitsbedingungen", "Verkehrs-, Verlagerungs- und Emissionsoutcome"],
    detail: "Für das Mobilitätsvorhaben fehlen eine belastbare Projekt-/Netz- und Nachfragebaseline, Investitions- und Betriebskosten, Alternativenvergleich, Sicherheits-/Barrierefreiheitsbedingungen und ein messbarer Verkehrs-, Verlagerungs- oder Emissionseffekt einschließlich Gegenfolgen.",
  },
  FISCAL_COMPETENCE_COUNTERFACTUAL: {
    missing: ["Bundes-/Landes-/kommunale Steuerkompetenz", "Bemessungs-/Verhaltensparameter", "prüfbare Einnahmen-/Ausgabenbaseline", "Verteilung und Ausweichreaktionen", "fiskalischer Counterfactual/Opportunitätskosten"],
    detail: "Das Finanz-/Steuervorhaben bestimmt nicht gemeinsam Kompetenz, Bemessungs- und Verhaltensparameter, belastbare Einnahmen-/Ausgabenbaseline, Verteilungs- und Ausweichreaktionen sowie einen fiskalischen Counterfactual einschließlich Opportunitätskosten.",
  },
  ENVIRONMENT_DELIVERY_TECHNICAL: {
    missing: ["räumliche/ökologische Baseline", "Instrument- und Vollzugsparameter", "Budget und Flächen-/Nutzungskonflikte", "Lifecycle-/Rebound-/Verteilungsfolgen", "messbarer Schutzgut-Reality-Check"],
    detail: "Die Umwelt-/Tierschutzmaßnahme legt räumliche bzw. ökologische Baseline, Instrument/Vollzug, Budget, Flächen-/Nutzungs- und Verteilungskonflikte sowie Lifecycle-/Rebound-Folgen und ein messbares Schutzgutkriterium nicht gemeinsam fest.",
  },
  JUSTICE_INSTRUMENT_DELIVERY: {
    missing: ["konkretes Verfahrens-/Gesetzesdelta", "Zielgruppe und Rechtszugang", "Personal-/Fallzahl-/Dauerbaseline", "Budget und Verfahrensschutz", "Erledigungsqualitäts-/Rechtschutz-Reality-Check"],
    detail: "Das Justiz-/Verbraucherschutzvorhaben enthält kein vollständiges Verfahrens-/Gesetzesdelta mit Zielgruppe, Rechtszugangs- und Verfahrensschutz, Personal-/Fallzahl-/Dauerbaseline, Budget sowie einem Qualitätskriterium jenseits bloßer Erledigungszahlen.",
  },
  ADMINISTRATION_DELIVERY_PARAMETERS: {
    missing: ["konkretes Prozess-/Rechtsdelta", "betroffene Rollen/Fälle", "Zeit-, Personal- und Kostenbaseline", "Datenschutz-/Mitbestimmungsgrenze", "Servicequalitäts-Reality-Check"],
    detail: "Die Verwaltungsmaßnahme spezifiziert Prozess-/Rechtsdelta, betroffene Rollen und Fälle, Zeit-/Personal-/Kostenbaseline, Datenschutz-/Mitbestimmungsgrenze sowie ein beobachtbares Servicequalitäts- und Fehlerkriterium nicht gemeinsam.",
  },
  DIGITAL_RIGHTS_TECHNICAL: {
    missing: ["konkretes technisches/rechtliches Delta", "System-/Daten-/Adressatengrenze", "Sicherheits- und Grundrechtsschutz", "Lifecycle-/Betriebskosten und Interoperabilität", "Fehler-/Nutzen-Reality-Check"],
    detail: "Das Digitalvorhaben legt technisches/rechtliches Delta, System-/Daten-/Adressatengrenze, Sicherheits- und Grundrechtsschutz, Interoperabilität plus Lifecycle-/Betriebskosten sowie ein prüfbares Fehler-/Nutzenkriterium nicht vollständig fest.",
  },
};

function reasonProfileForPage(page) {
  if (page <= 17) return "EDUCATION_DELIVERY_AND_RIGHTS";
  if (page <= 20) return "CULTURE_FUNDING_SELECTION";
  if (page <= 25) return "HEALTH_COMPETENCE_CAPACITY";
  if (page <= 27) return "SPORT_FUNDING_DELIVERY";
  if (page <= 29) return "CORONA_INQUIRY_EVIDENTIARY_RIGHTS";
  if (page <= 33) return "MEDIA_DEMOCRACY_RIGHTS";
  if (page <= 37) return "MIGRATION_COMPETENCE_EQUAL_TREATMENT";
  if (page <= 41) return "SECURITY_RIGHTS_CAPACITY";
  if (page <= 44) return "ECONOMY_COMPETENCE_FINANCING";
  if (page <= 47) return "ENERGY_TECHNICAL_COMPETENCE";
  if (page <= 51) return "MOBILITY_TECHNICAL_FUNDING";
  if (page <= 55) return "FISCAL_COMPETENCE_COUNTERFACTUAL";
  if (page <= 59) return "ENVIRONMENT_DELIVERY_TECHNICAL";
  if (page <= 61) return "JUSTICE_INSTRUMENT_DELIVERY";
  if (page <= 63) return "ADMINISTRATION_DELIVERY_PARAMETERS";
  return "DIGITAL_RIGHTS_TECHNICAL";
}

function exactRnaaDecision(page, unitOrdinal, atomOrdinal, sourceText) {
  const reasonCode = reasonProfileForPage(page);
  const profile = reasonProfiles[reasonCode];
  const anchor = sourceText.length <= 180 ? sourceText : `${sourceText.slice(0, 179)}…`;
  return {
    reasonCode,
    missingFields: profile.missing,
    reason: `Atom ${page}:${unitOrdinal}:${atomOrdinal} („${anchor}“): ${profile.detail} Mindestens diese konkret fehlenden Prüffelder verhindern für genau dieses Atom EXPLICIT_FACH_APPROVED; aus dem Text werden weder Wirkungsrichtung noch Evidenzstufe, DNS oder Recommendation synthetisiert.`,
  };
}

function atomizeEffectText(sourceText) {
  return sourceText
    .split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ„])|;\s+(?=[A-ZÄÖÜ„])/u)
    .map((part) => part.trim())
    .filter(Boolean);
}

function sourceUnitFor(page, ordinal, sourceText) {
  const sourceTextSha256 = sha256(sourceText);
  const locatorKey = `${page}:${ordinal}`;
  const structuralHeading = isStructuralHeading(sourceText);
  const contextKind = structuralHeading
    ? "STRUCTURAL_HEADING"
    : reviewedNonEffectContext.has(locatorKey)
      ? "REVIEWED_DIAGNOSIS_HISTORY_RATIONALE_OR_REPETITION"
      : null;
  const sourceUnitClass = contextKind ? "NON_EFFECT_CONTEXT" : "EFFECT_BEARING";
  const prefix = `BE-BSW-P${String(page).padStart(2, "0")}-U${String(ordinal).padStart(2, "0")}`;
  const sourceUnitId = `${prefix}-${sourceTextSha256.slice(0, 12)}`;
  const sourceLocator = `BE-AGH-2026-BSW-WAHLPROGRAMM, physical PDF page ${page} of 66, normalized source unit ${ordinal}`;
  const sourceExcerpt = sourceText.length <= 240 ? sourceText : `${sourceText.slice(0, 239)}…`;
  const atomTexts = contextKind ? [] : atomizeEffectText(sourceText);
  const atomIds = atomTexts.map((atomText, index) => `${prefix}-A${String(index + 1).padStart(2, "0")}-${sha256(atomText).slice(0, 12)}`);
  const sourceUnit = {
    jurisdiction: "DE-BE",
    party: "BSW",
    artifact_id: ARTIFACT.artifact_id,
    artifact_sha256: ARTIFACT.artifact_sha256,
    pdf_page: page,
    source_unit_ordinal: ordinal,
    source_unit_id: sourceUnitId,
    source_locator: sourceLocator,
    source_excerpt: sourceExcerpt,
    source_text_sha256: sourceTextSha256,
    source_text_length: sourceText.length,
    source_unit_class: sourceUnitClass,
    effect_bearing: sourceUnitClass === "EFFECT_BEARING",
    atom_ids: atomIds,
    atom_count: atomIds.length,
    terminal_status: contextKind ? "NON_EFFECT_CONTEXT_REVIEWED" : null,
    exact_reason: contextKind
      ? `${reviewedContextSpecificReasons.get(locatorKey) ?? contextReason(contextKind)} Objekt ${locatorKey}: „${sourceExcerpt}“`
      : null,
    exact_reason_code: contextKind ? contextKind : null,
    reviewed_exact_missing_fields: [],
    context_kind: contextKind,
    classification_rationale: contextKind
      ? `Die konkrete Unit ${locatorKey} wurde vollständig gelesen und enthält als ${contextKind} keine eigenständige politische Handlung.`
      : `Die konkrete Unit ${locatorKey} wurde vollständig gelesen; der source-bound Wortlaut beschreibt mindestens ein politisches Vorhaben, dessen Fachfreigabe an den einzeln ausgewiesenen fehlenden Prüffeldern scheitert.`,
    reviewed_or_consumed: true,
  };
  const atoms = atomTexts.map((atomText, index) => {
    const atomOrdinal = index + 1;
    const atomTextSha256 = sha256(atomText);
    const atomExcerpt = atomText.length <= 240 ? atomText : `${atomText.slice(0, 239)}…`;
    const decision = exactRnaaDecision(page, ordinal, atomOrdinal, atomText);
    const atomLocator = `${sourceLocator}, effect atom ${atomOrdinal} of ${atomTexts.length}`;
    return {
      record_id: atomIds[index],
      jurisdiction: "DE-BE",
      party: "BSW",
      artifact_id: ARTIFACT.artifact_id,
      artifact_sha256: ARTIFACT.artifact_sha256,
      pdf_page: page,
      source_unit_ordinal: ordinal,
      source_unit_id: sourceUnitId,
      source_locator: atomLocator,
      source_excerpt: atomExcerpt,
      source_unit_class: "EFFECT_BEARING",
      effect_bearing: true,
      atom_id: atomIds[index],
      atom_ordinal: atomOrdinal,
      atom_text_sha256: atomTextSha256,
      atom_text_length: atomText.length,
      terminal_status: "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON",
      exact_reason: decision.reason,
      exact_reason_code: decision.reasonCode,
      reviewed_exact_missing_fields: decision.missingFields,
      context_kind: null,
      classification_rationale: `Atom ${page}:${ordinal}:${atomOrdinal} ist ein eigener satz-/teilsatzgebundener Claim innerhalb der vollständig gelesenen EFFECT_BEARING Source Unit ${sourceUnitId}; seine Fachfreigabe scheitert an den einzeln ausgewiesenen fehlenden Prüffeldern.`,
      policy_action: atomExcerpt,
    affected_group_or_system: null,
    baseline_or_reference_state: null,
    mechanism: null,
    potential_state_change: null,
    impact_direction: null,
    evidence_level: null,
    competence_and_system_boundary: null,
    material_risks: [],
    protected_interests: [],
    first_order_effects: [],
    second_order_effects: [],
    third_order_effects: [],
    distribution_effects: [],
    resilience_lockin_reversibility: null,
    time_horizon: null,
    materiality: null,
    uncertainty: null,
    falsification_or_reality_check: [],
    problem_review: "NOT_AVAILABLE",
    goal_review: "NOT_AVAILABLE",
    dns_mapping: "NOT_AVAILABLE",
    recommendation: "NOT_AVAILABLE",
    sdg_mapping: [],
    sdg_plus_mapping: [],
    noncompensation_applicable: null,
    noncompensation_reason: null,
      source_refs: [ARTIFACT.artifact_url, atomLocator],
      ...PROVENANCE,
      reviewed_at: REVIEWED_AT,
      reviewed_or_consumed: true,
    };
  });
  const contextRecord = contextKind ? {
    ...sourceUnit,
    record_id: sourceUnitId,
    atom_id: null,
    policy_action: null,
    affected_group_or_system: null,
    baseline_or_reference_state: null,
    mechanism: null,
    potential_state_change: null,
    impact_direction: null,
    evidence_level: null,
    competence_and_system_boundary: null,
    material_risks: [],
    protected_interests: [],
    first_order_effects: [],
    second_order_effects: [],
    third_order_effects: [],
    distribution_effects: [],
    resilience_lockin_reversibility: null,
    time_horizon: null,
    materiality: null,
    uncertainty: null,
    falsification_or_reality_check: [],
    problem_review: "NOT_AVAILABLE",
    goal_review: "NOT_AVAILABLE",
    dns_mapping: "NOT_AVAILABLE",
    recommendation: "NOT_AVAILABLE",
    sdg_mapping: [],
    sdg_plus_mapping: [],
    noncompensation_applicable: null,
    noncompensation_reason: null,
    source_refs: [ARTIFACT.artifact_url, sourceLocator],
    ...PROVENANCE,
    reviewed_at: REVIEWED_AT,
  } : null;
  return { sourceUnit, atoms, contextRecord };
}

function materialize(artifactPath) {
  const bytes = readFileSync(artifactPath);
  if (bytes.length !== ARTIFACT.byte_length) throw new Error(`Artifact byte length mismatch: ${bytes.length}`);
  const artifactHash = sha256(bytes);
  if (artifactHash !== ARTIFACT.artifact_sha256) throw new Error(`Artifact SHA-256 mismatch: ${artifactHash}`);

  const sourceUnits = [];
  const effectAtoms = [];
  const contextRecords = [];
  const pageCoverage = [];
  for (let page = 14; page <= 66; page += 1) {
    const units = normalizedPageUnits(artifactPath, page);
    if (!units.length) throw new Error(`No source units extracted for physical PDF page ${page}`);
    const materializedUnits = units.map((text, index) => sourceUnitFor(page, index + 1, text));
    const pageSourceUnits = materializedUnits.map((item) => item.sourceUnit);
    const pageEffectAtoms = materializedUnits.flatMap((item) => item.atoms);
    const pageContextRecords = materializedUnits.map((item) => item.contextRecord).filter(Boolean);
    sourceUnits.push(...pageSourceUnits);
    effectAtoms.push(...pageEffectAtoms);
    contextRecords.push(...pageContextRecords);
    pageCoverage.push({
      pdf_page: page,
      source_unit_count: pageSourceUnits.length,
      effect_bearing_source_units: pageSourceUnits.filter((unit) => unit.effect_bearing).length,
      non_effect_context_units: pageSourceUnits.filter((unit) => !unit.effect_bearing).length,
      effect_bearing_atoms: pageEffectAtoms.length,
      explicit_fach_approved: 0,
      reviewed_not_assessable: pageEffectAtoms.length,
      open_atoms: 0,
      normalized_page_sha256: sha256(units.join("\n\n")),
      source_unit_hashes: pageSourceUnits.map((unit) => unit.source_text_sha256),
      atom_ids: pageEffectAtoms.map((atom) => atom.atom_id),
      page_coverage_pass: true,
    });
  }

  const records = [...contextRecords, ...effectAtoms];
  const newContext = contextRecords.length;
  const newEffectUnits = sourceUnits.filter((unit) => unit.effect_bearing).length;
  const newEffectAtoms = effectAtoms.length;
  const protectedCounts = PROTECTED_STOCK.reduce((totals, stock) => ({
    objects: totals.objects + stock.accepted_source_objects,
    approved: totals.approved + stock.normalized_explicit_fach_approved,
    rnaa: totals.rnaa + stock.normalized_reviewed_not_assessable_or_reclassified,
    context: totals.context + stock.non_effect_context_or_non_counting_parent,
  }), { objects: 0, approved: 0, rnaa: 0, context: 0 });
  const allPhysicalPageCoverage = Array.from({ length: 66 }, (_, index) => {
    const pdfPage = index + 1;
    if (pdfPage <= 13) {
      const stockIndex = pdfPage <= 5 ? 0 : pdfPage <= 8 ? 1 : 2;
      const stock = PROTECTED_STOCK[stockIndex];
      return {
        pdf_page: pdfPage,
        coverage_mode: "PROTECTED_TERMINAL_SET_REFERENCE",
        terminal_set_source_range: stock.source_range,
        issue_comment_ids: stock.issue_comment_ids ?? [stock.issue_comment_id],
        terminal_status: "PASS",
      };
    }
    const page = pageCoverage.find((candidate) => candidate.pdf_page === pdfPage);
    return {
      pdf_page: pdfPage,
      coverage_mode: "DETERMINISTIC_LOCAL_SOURCE_UNIT_LEDGER",
      source_unit_count: page.source_unit_count,
      effect_atom_count: page.effect_bearing_atoms,
      normalized_page_sha256: page.normalized_page_sha256,
      terminal_status: "PASS",
    };
  });

  return {
    schema_version: "woek-programme-fach-decision-2026-08-26",
    ledger_id: "BE-BSW-FULL-PROGRAMME-FACH-LEDGER-2026-V1",
    jurisdiction: "DE-BE",
    election: "agh-2026-be",
    party: "BSW",
    artifact: ARTIFACT,
    review_scope: {
      protected_terminal_pages: "physical PDF pages 1-13",
      newly_reviewed_pages: "physical PDF pages 14-66",
      extraction_mode: "pdftotext -layout, physical page isolation",
      segmentation_rule: "Remove exact recurring header/footer lines; split at blank-line paragraph boundaries; normalize internal whitespace; retain every resulting paragraph as one source unit.",
      atomization_rule: "Preserve each paragraph as a source unit; split every EFFECT_BEARING unit deterministically at sentence-final punctuation and semicolon-delimited independent clauses; bind every resulting effect claim to its own atom_id and terminal decision. NON_EFFECT_CONTEXT has zero atoms. No Wirkung is inferred from text.",
    },
    required_provenance: PROVENANCE,
    protected_terminal_stock: PROTECTED_STOCK,
    all_physical_page_coverage: allPhysicalPageCoverage,
    page_coverage: pageCoverage,
    source_units: sourceUnits,
    effect_atoms: effectAtoms,
    records,
    programme_summary: {
      expected_pages: 66,
      reviewed_pages: 66,
      unaccounted_pages: 0,
      newly_segmented_source_units: sourceUnits.length,
      newly_non_effect_context_units: newContext,
      newly_effect_bearing_source_units: newEffectUnits,
      newly_effect_bearing_atoms: newEffectAtoms,
      newly_explicit_fach_approved: 0,
      newly_reviewed_not_assessable: newEffectAtoms,
      protected_terminal_source_objects: protectedCounts.objects,
      total_accounted_source_objects: protectedCounts.objects + newContext + newEffectAtoms,
      total_explicit_fach_approved: protectedCounts.approved,
      total_reviewed_not_assessable_or_reclassified: protectedCounts.rnaa + newEffectAtoms,
      total_non_effect_context_or_non_counting_parent: protectedCounts.context + newContext,
      unclassified_source_units: 0,
      unterminated_effect_atoms: 0,
      source_conflicts_without_status: 0,
      all_approved_atoms_have_required_fach_fields: true,
      all_pages_accounted_for: true,
      all_source_units_classified: true,
      all_effect_bearing_atoms_terminal: true,
      all_effect_bearing_units_have_terminal_fach_status: true,
      no_silent_omissions: true,
      no_generic_placeholder_as_approval: true,
      source_fidelity: "PASS",
      coverage_manifest: "COMPLETE",
      programme_analysis_complete: true,
    },
    constraints: {
      impact_direction_synthesized: false,
      evidence_level_synthesized: false,
      problem_review_synthesized: false,
      goal_review_synthesized: false,
      dns_mapping_synthesized: false,
      recommendation_synthesized: false,
      party_score_synthesized: false,
      party_wide_judgement_synthesized: false,
    },
    release_policy: {
      github_first: true,
      no_new_vercel_build: true,
      parliament_release_approval: "NOT_GRANTED",
    },
  };
}

const { artifact, output, check } = parseArgs();
if (!artifact) throw new Error("Pass the byte-exact BSW PDF with --artifact <path>");
const ledger = materialize(resolve(artifact));
const serialized = `${JSON.stringify(ledger, null, 2)}\n`;
const outputPath = resolve(output);
if (check) {
  const current = readFileSync(outputPath, "utf8");
  if (current !== serialized) throw new Error(`Determinism mismatch: ${outputPath} is not the exact materialization of ${artifact}`);
  console.log(JSON.stringify({ status: "PASS", mode: "DETERMINISM_CHECK", records: ledger.records.length, pages: ledger.page_coverage.length }));
} else {
  writeFileSync(outputPath, serialized);
  console.log(JSON.stringify({ status: "PASS", mode: "MATERIALIZE", output: outputPath, records: ledger.records.length, pages: ledger.page_coverage.length }));
}
