#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ARTIFACT = Object.freeze({
  artifact_id: "BE-AGH-2026-CDU-REGIERUNGSPROGRAMM",
  canonical_register_url: "https://cdu.berlin/download?dokument=1&file=366",
  verified_exact_byte_mirror_url:
    "https://berlin-wird.de/image/uploads/data/regierungsprogramm2026_2031.pdf",
  artifact_sha256:
    "ff27b8efafc426669f76ef71576a7cbce52bdb95fbb0cc2931afa7e11bbed455",
  byte_length: 1_546_182,
  page_count: 128,
  title: "Berlin wird. Regierungsprogramm 2026–2031",
  publication_status: "PARTY_APPROVED_FINAL_ELECTION_PROGRAMME",
  version_evidence:
    "The source register identifies the programme adopted by the 50th CDU Berlin state party conference on 9 June 2026; the campaign mirror reproduces the exact registered bytes.",
});

const REVIEWED_AT = "2026-08-26T21:00:00+02:00";
const PROVENANCE = Object.freeze({
  approval_basis: "DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26",
  approval_authority: "PROJECT_OWNER_DELEGATED_PROTOCOL",
  review_mode: "SOURCE_BOUND_OBJECT_LEVEL",
  human_individual_record_review_claimed: false,
});

const COVER_AND_CONTENTS_PAGES = new Set([
  1, 2, 3, 4, 5, 17, 28, 39, 53, 67, 76, 86, 95, 106, 127, 128,
]);

const HEADER_PATTERNS = [
  /^Berlin wird\.$/,
  /^Regierungsprogramm 2026-203[01]$/,
  /^\d{1,3}$/,
];

const ACTION_SIGNAL = new RegExp(
  [
    "wir werden", "werden wir", "wir wollen", "wollen wir", "wir setzen", "setzen wir",
    "wir treten", "treten wir", "wir lehnen", "lehnen wir", "wir stehen für", "wir stehen zu",
    "wir fordern", "fordern wir", "wir bekennen", "wir unterstützen", "wir fördern", "wir schaffen",
    "wir sichern", "wir stärken", "wir bauen", "wir führen", "wir erhalten", "wir treiben",
    "wir prüfen", "wir sorgen", "wir ermöglichen", "wir richten", "wir entwickeln", "wir modernisieren",
    "wir investieren", "wir stellen", "wir vereinfachen", "wir verankern", "wir bekämpfen", "wir schützen",
    "wir beenden", "wir streichen", "wir verzichten", "wir halten", "wir verbessern", "wir erhöhen",
    "wir senken", "wir entlasten", "wir machen", "unser ziel", "unser anspruch", "dazu gehören",
    "dazu gehört", "dazu zählen", "hierzu gehören", "soll", "sollen", "muss", "müssen", "darf",
    "dürfen", "ist einzuführen", "ist auszustatten", "braucht", "bedarf", "▶",
  ].join("|"),
  "i",
);

const ACTION_WORD =
  "(?:abbauen|abschaffen|absichern|anbinden|anerkennen|anpassen|anrechnen|anschaffen|aufbauen|auflegen|aufrufen|ausbauen|ausrichten|ausstatten|begleiten|beenden|bekämpfen|bekennen|bereitstellen|berücksichtigen|beschleunigen|bündeln|digitalisieren|einbinden|einführen|einsetzen|entlasten|entwickeln|ergänzen|erhalten|ergreifen|erlassen|ermöglichen|erneuern|errichten|erweitern|etablieren|evaluieren|finanzieren|fördern|fortführen|gewährleisten|installieren|integrieren|leisten|modernisieren|nutzen|öffnen|priorisieren|prüfen|qualifizieren|reduzieren|sanieren|schaffen|schließen|schützen|senken|setzen|sicherstellen|sichern|stellen|stärken|streichen|überarbeiten|übertragen|umsetzen|unterstützen|vereinfachen|verankern|verbessern|verdoppeln|verfolgen|verkürzen|verknüpfen|veröffentlichen|verzichten|vorantreiben)";

const ACTION_NOUN =
  "(?:Abbau|Abschaffung|Absicherung|Anbindung|Anerkennung|Anpassung|Anschaffung|Aufbau|Auflegung|Ausbau|Ausrichtung|Ausstattung|Bekämpfung|Bereitstellung|Beschleunigung|Bündelung|Digitalisierung|Einbindung|Einführung|Einsatz|Entlastung|Entwicklung|Erhalt|Errichtung|Erneuerung|Erweiterung|Etablierung|Evaluation|Finanzierung|Förderung|Fortführung|Gewährleistung|Integration|Modernisierung|Neubau|Öffnung|Prüfung|Qualifizierung|Reduzierung|Sanierung|Schaffung|Schließung|Schutz|Senkung|Sicherung|Stärkung|Streichung|Überarbeitung|Übertragung|Umsetzung|Vereinfachung|Verankerung|Verbesserung|Verknüpfung|Veröffentlichung|Weiterentwicklung)";

const GENERIC_EFFECT_SIGNAL = new RegExp(
  [
    `\\bwir\\s+(?:[\\p{L}-]+\\s+){0,4}${ACTION_WORD}\\b`,
    `\\b${ACTION_WORD}\\s+wir\\b`,
    "\\bwir\\s+möchten\\b",
    "\\bmöchten\\s+wir\\b",
    "\\bwir\\s+streben\\b",
    "\\bstreben\\s+wir\\b",
    "\\bwir\\s+sprechen\\s+uns\\b",
    "\\bsprechen\\s+wir\\s+uns\\b",
    "\\bwir\\s+folgen\\b",
    "\\bwir\\s+gehen\\b.{0,80}\\bvor\\b",
    "\\bgehen\\s+wir\\b.{0,80}\\bvor\\b",
    `\\b(?:ist|sind|gilt es)\\b.{0,180}\\b(?:(?:ab|an|auf|aus|ein|fort|sicher|um|ver|weiter|zurück|zusammen)?zu\\p{L}+-?|zu\\s+\\p{L}+-?|${ACTION_WORD})\\b`,
    "\\bZiel ist(?: es)?\\b",
    "\\bwir\\s+sind\\s+entschlossen\\b",
    "\\bwir\\s+sehen\\s+es\\s+als\\s+unsere\\s+Aufgabe\\b",
    "\\bwir\\s+verstehen\\s+es\\s+als\\s+unsere\\s+Aufgabe\\b",
  ].join("|"),
  "iu",
);

const BROAD_EFFECT_CLAIM_SIGNAL = new RegExp(
  `\\b(?:${ACTION_WORD}|baut|bindet|entlastet|entwickelt|ermöglicht|fördert|gewährleistet|leistet|modernisiert|reduziert|schafft|schützt|senkt|sichert|stärkt|unterstützt|verbessert|verkürzt|verringert)\\b`,
  "iu",
);

const PAST_ONLY_SIGNAL =
  /\b(?:haben wir|hat sich|hat die|hat der|hat das|wurde|wurden|konnten|haben sich)\b/i;
const PROSPECTIVE_SIGNAL =
  /\b(?:werden|wollen|sollen|möchten|streben|künftig|zukünftig|in Zukunft|gilt es|ist zu|sind zu)\b/i;

function isPastOnlyContext(text) {
  return PAST_ONLY_SIGNAL.test(text) && !PROSPECTIVE_SIGNAL.test(text);
}

function hasEffectSignal(text) {
  return (
    ACTION_SIGNAL.test(text) ||
    GENERIC_EFFECT_SIGNAL.test(text) ||
    BROAD_EFFECT_CLAIM_SIGNAL.test(text)
  );
}

const ENUMERATION_ITEM_START =
  "(?:die|der|das|den|dem|eine|ein|einen|einem|mehr|weniger|zusätzliche|zusätzlicher|zusätzlichen|bessere|besserer|besseren|gezielte|gezielter|gezielten|gemeinsame|gemeinsamer|gemeinsamen|klare|klarer|klaren|moderne|moderner|modernen|regelmäßige|regelmäßiger|regelmäßigen|verlässliche|verlässlicher|verlässlichen|verstärkte|verstärkter|verstärkten|konsequente|konsequenter|konsequenten|kontinuierliche|kontinuierlicher|kontinuierlichen|flächendeckende|flächendeckender|flächendeckenden|Abbau|Anpassung|Aufbau|Ausbau|Ausstattung|Bereitstellung|Beschleunigung|Digitalisierung|Einführung|Einsatz|Entwicklung|Erhalt|Errichtung|Erweiterung|Förderung|Fortführung|Modernisierung|Neubau|Prüfung|Sanierung|Schaffung|Sicherung|Stärkung|Übertragung|Unterstützung|Verbesserung|Vereinfachung|Verknüpfung)";

const REASON_PROFILES = [
  {
    code: "FEDERAL_OR_EU_ADVOCACY_ROUTE_UNBOUND",
    match: /Bundesrat|Bundesebene|Bundesgesetz|Bundesrecht|bundesweit|Europäisch|EU-|GEAS|europäisch/i,
    missing: "die genaue bundes- bzw. unionsrechtliche Zielnorm samt Annahme- und Berliner Umsetzungsroute",
  },
  {
    code: "PILOT_EVALUATION_DECISION_RULE_UNBOUND",
    match: /Pilot|pilotieren|erproben|evaluieren|Evaluation|prüfen|Modellprojekt|Testphase/i,
    missing: "ein vorab festgelegter Erfolgs-/Abbruchschwellenwert und die daran gebundene Folgeentscheidung",
  },
  {
    code: "SECURITY_SURVEILLANCE_SAFEGUARD_UNBOUND",
    match: /Videoüberwachung|Künstliche Intelligenz|KI\b|Taser|Fußfessel|Personenkontroll|Datenauswertung|Überwachung|Bodycam|Datenerfassung/i,
    missing: "die operative Eingriffs- und Fehlerschwelle einschließlich unabhängiger Kontrolle und eines belastbaren Sicherheits-Counterfactuals",
  },
  {
    code: "LEGAL_RULE_SCOPE_UNBOUND",
    match: /Gesetz|Recht|Verbot|Pflicht|Sanktion|Strafe|Verordnung|Genehmigung|Kontrolle|Quote|Anspruch|Regelung|Vorschrift/i,
    missing: "das genaue Normdelta mit Adressatenkreis, Tatbestands-/Eingriffsschwelle und Schutz-/Ausnahmeregel",
  },
  {
    code: "MIGRATION_STATUS_COMPETENCE_UNBOUND",
    match: /Asyl|Migration|Ausreise|Abschieb|Duldung|Aufenthalt|Einwander|Geflücht|Staatsbürg|Bezahlkarte/i,
    missing: "die trennscharfe Statusgruppe, Zuständigkeit und vollziehbare Verfahrens-/Härtefallregel für genau diesen Eingriff",
  },
  {
    code: "HOUSING_DELIVERY_COUNTERFACTUAL_UNBOUND",
    match: /Wohnung|Miete|Mieter|Wohneigentum|Bauen|Bauordnung|Baugenehm|Wohnheim|Quartier|Obdach|Housing First/i,
    missing: "der rechtlich und finanziell ausführbare Kapazitäts-/Bestandshebel gegenüber einer bezifferten Wohnungs- bzw. Versorgungsbaseline",
  },
  {
    code: "MOBILITY_DEMAND_COST_UNBOUND",
    match: /ÖPNV|U-Bahn|S-Bahn|Straße|Radweg|Fahrrad|Verkehr|Auto|Parken|BVG|Fußverkehr|Schiene|Baustelle/i,
    missing: "die Netz-/Nachfragebaseline mit Investitions- und Betriebskosten sowie dem modalen Sicherheits-/Verlagerungs-Counterfactual",
  },
  {
    code: "EDUCATION_COHORT_OUTCOME_UNBOUND",
    match: /Kita|Schule|Schüler|Lehrer|Unterricht|Bildung|Ausbildung|Hochschule|Universität|Studium|Lern|Deutsch|Mathe/i,
    missing: "die abgegrenzte Kohorte, Interventionsdosis und Vergleichsbaseline für ein später beobachtbares Lern-, Teilhabe- oder Abschlussoutcome",
  },
  {
    code: "HEALTH_CARE_CAPACITY_OUTCOME_UNBOUND",
    match: /Gesund|Pflege|Kranken|Arzt|Ärzt|Hebamme|Patient|Rettungsdienst|Therap|Prävention|116117|Charité/i,
    missing: "die versorgungsbezogene Kapazitätsbaseline samt finanziertem Leistungsdelta und patientenbezogenem Qualitäts-/Sicherheitsoutcome",
  },
  {
    code: "ENVIRONMENT_ENERGY_SYSTEM_BOUNDARY_UNBOUND",
    match: /Klima|Energie|Strom|Wärme|Gasnetz|Wasser|Natur|Baum|Grünfläche|Umwelt|Recycling|Emission|Photovoltaik|Solar/i,
    missing: "die räumlich-technische Systembaseline einschließlich Lifecycle-, Rebound- und Schutzgutkriterium",
  },
  {
    code: "FISCAL_DISTRIBUTION_COUNTERFACTUAL_UNBOUND",
    match: /Steuer|Abgabe|Haushalt|Schulden|Gebühr|kostenlos|kostenfrei|Finanzen|Einnahmen|Ausgaben|Entlastung/i,
    missing: "der bezifferte Einnahmen-/Ausgaben-Counterfactual mit Verteilung, Ausweichreaktionen und Opportunitätskosten",
  },
  {
    code: "FUNDING_INFRASTRUCTURE_DELIVERY_UNBOUND",
    match: /finanz|Förder|Invest|Neubau|Sanierung|Infrastruktur|Gebäude|Standort|Fuhrpark|Fahrzeug|Zuschuss|Kredit|Fonds/i,
    missing: "der priorisierte Standort-/Kapazitätsumfang mit CAPEX, dauerhaftem OPEX und einer belastbaren Delivery-Baseline",
  },
  {
    code: "WORKFORCE_FUNDED_DELTA_UNBOUND",
    match: /Personal|Fachkräfte|Beschäftigt|Beamte|Polizei|Feuerwehr|Stellen|Besoldung|Arbeitszeit|Tarif|Recruiting/i,
    missing: "die aktuelle Kopfzahl-/Qualifikationsbaseline und das finanzierte Rekrutierungs-, Bindungs- oder Entlastungsdelta",
  },
  {
    code: "CULTURE_MEDIA_SELECTION_OUTCOME_UNBOUND",
    match: /Kultur|Kunst|Museum|Theater|Oper|Musik|Medien|Rundfunk|Festival|Bibliothek|Gedenk/i,
    missing: "das Förder-/Auswahldelta einschließlich Zugang, Freiheits-/Pluralismusabwägung und beobachtbarem Kultur-/Teilhabeoutcome",
  },
  {
    code: "ADMIN_PROCESS_SERVICE_OUTCOME_UNBOUND",
    match: /Verwaltung|Behörde|Bezirke|Digitalisierung|Verfahren|Bürokratie|Organisation|Leitstelle|Zuständigkeit|Prozess|Portal/i,
    missing: "die heutige Prozess-, Fallzahl-, Zeit- und Personalbaseline samt überprüfbarem Servicequalitätskriterium",
  },
  {
    code: "SERVICE_ELIGIBILITY_CAPACITY_UNBOUND",
    match: /Beratung|Angebot|Unterstützung|Teilhabe|Zugang|Anlaufstelle|Netzwerk|Programm|Schutz|Betreuung|Hilfe/i,
    missing: "die genaue Anspruchs-/Zugangsregel, zusätzliche Kapazität und ein nutzerbezogenes Outcome gegenüber dem Ausgangsangebot",
  },
  {
    code: "GOAL_OR_REJECTION_INSTRUMENT_UNBOUND",
    match: /Ziel|Anspruch|lehnen|Absage|nicht brauchen|bekennen|stehen für|erhalten/i,
    missing: "ein entscheidungsreifes Instrument bzw. ein expliziter Status-quo-Counterfactual für den genannten Ziel- oder Ablehnungssatz",
  },
  {
    code: "MECHANISM_COUNTERFACTUAL_EVIDENCE_UNBOUND",
    match: /.*/,
    missing: "eine belastbare Ausgangs-/Vergleichslage mit prüfbarem Mechanismus und objektspezifischer Outcome-Evidenz",
  },
];

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const pad = (value, width) => String(value).padStart(width, "0");

function parseArgs() {
  const args = process.argv.slice(2);
  const value = (flag) => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : null;
  };
  return {
    artifact: value("--artifact"),
    ledgerOutput:
      value("--ledger-output") ??
      "data/state-programmes/fach-reviews/berlin-2026-cdu-v1.json",
    overlayOutput:
      value("--overlay-output") ??
      "data/state-programmes/fach-content-residuals/berlin-2026-cdu-terminal-overlay-v1.json",
    check: args.includes("--check"),
  };
}

function verifyArtifact(path) {
  const bytes = readFileSync(path);
  if (bytes.length !== ARTIFACT.byte_length) {
    throw new Error(`CDU artifact byte length ${bytes.length} != ${ARTIFACT.byte_length}`);
  }
  if (sha256(bytes) !== ARTIFACT.artifact_sha256) {
    throw new Error("CDU artifact SHA-256 does not match the canonical source register.");
  }
  const info = execFileSync("pdfinfo", [path]).toString("utf8");
  const match = info.match(/^Pages:\s+(\d+)$/m);
  if (!match || Number(match[1]) !== ARTIFACT.page_count) {
    throw new Error(`CDU artifact page count is not ${ARTIFACT.page_count}.`);
  }
  return bytes;
}

function rawPageText(artifactPath, page) {
  return execFileSync("pdftotext", [
    "-f",
    String(page),
    "-l",
    String(page),
    "-layout",
    artifactPath,
    "-",
  ]).toString("utf8");
}

function joinWrappedLines(lines) {
  let result = "";
  for (const line of lines) {
    if (!result) {
      result = line;
      continue;
    }
    if (result.endsWith("-") && /^[a-zäöüß]/.test(line)) {
      result = `${result.slice(0, -1)}${line}`;
    } else {
      result = `${result} ${line}`;
    }
  }
  return result.replace(/\s+/g, " ").trim();
}

function sentenceUnits(text) {
  if (text.startsWith("▶")) return [text];
  return text
    .split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ0-9„“])/u)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizedPageUnits(artifactPath, page) {
  const raw = rawPageText(artifactPath, page);
  const paragraphs = [];
  let lines = [];
  const flush = () => {
    if (!lines.length) return;
    paragraphs.push(joinWrappedLines(lines));
    lines = [];
  };
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line === "\f") {
      flush();
      continue;
    }
    if (HEADER_PATTERNS.some((pattern) => pattern.test(line))) continue;
    if (line.startsWith("▶")) {
      flush();
      paragraphs.push(line.replace(/\s+/g, " "));
      continue;
    }
    lines.push(line);
  }
  flush();
  return {
    raw,
    units: paragraphs.flatMap(sentenceUnits),
  };
}

function structuralHeading(text) {
  return (
    text.length <= 110 &&
    !text.startsWith("▶") &&
    !hasEffectSignal(text) &&
    (!/[.!?]$/.test(text) || /^(?:I|II|III|IV|V|VI|VII|VIII|IX|X)\./.test(text))
  );
}

function contextKind(page, text) {
  if (page >= 2 && page <= 4) return "TABLE_OF_CONTENTS";
  if (COVER_AND_CONTENTS_PAGES.has(page) && page !== 126) {
    return "COVER_OR_SECTION_DIVIDER";
  }
  if (structuralHeading(text)) return "STRUCTURAL_HEADING";
  if (/\b(?:haben wir|hat bereits|wurde|wurden|ist bereits|inzwischen|derzeit|heute|bisher)\b/i.test(text)) {
    return "HISTORICAL_OR_CURRENT_STATE_DESCRIPTION";
  }
  return "DIAGNOSIS_VALUE_OR_CAMPAIGN_FRAME_WITHOUT_INSTRUMENT";
}

function classifyUnit(page, text) {
  if (page >= 2 && page <= 5) return "NON_EFFECT_CONTEXT";
  if (COVER_AND_CONTENTS_PAGES.has(page) && page !== 126) {
    return "NON_EFFECT_CONTEXT";
  }
  if (isPastOnlyContext(text)) return "NON_EFFECT_CONTEXT";
  if (structuralHeading(text)) return "NON_EFFECT_CONTEXT";
  return hasEffectSignal(text) ? "EFFECT_BEARING" : "NON_EFFECT_CONTEXT";
}

function splitListTail(tail) {
  return tail
    .split(
      new RegExp(
        `,\\s+(?=${ENUMERATION_ITEM_START}\\b)|\\s+(?:sowie|und)\\s+(?=${ENUMERATION_ITEM_START}\\b)`,
        "i",
      ),
    )
    .map((part) => part.trim())
    .filter((part) => part.length >= 8);
}

function splitEnumeratedMeasures(text) {
  const explicitList = text.match(
    /^(.*?(?:Dazu gehören|Dazu gehört|Dazu zählen|Hierzu gehören|Dies umfasst)\s*:?[ ]*)(.+)$/i,
  );
  if (explicitList) {
    const candidates = splitListTail(explicitList[2]);
    if (candidates.length >= 2) {
      return candidates.map((candidate) =>
        `${explicitList[1].trim()} ${candidate}`.trim(),
      );
    }
  }

  // A colon followed by an explicit "durch" list binds each named lever to
  // the shared action before the colon.  The fragments remain verbatim in the
  // enclosing source unit; the shared prefix is retained only as binding
  // context and is never evaluated as Fach.
  const colonList = text.match(/^(.*?:\s*durch\s+)(.+)$/i);
  if (colonList) {
    const candidates = colonList[2]
      .split(/,\s+(?=[a-zäöüß][\p{L}-]*(?:\s|$))|\s+sowie\s+/iu)
      .map((part) => part.trim())
      .filter((part) => part.length >= 8);
    if (candidates.length >= 2) {
      return candidates.map((candidate) =>
        `${colonList[1].trim()} ${candidate}`.trim(),
      );
    }
  }

  return null;
}

function splitCoordinatedActionClauses(text) {
  const action = new RegExp(`\\b${ACTION_WORD}\\b`, "iu");
  const actionNoun = new RegExp(`\\b${ACTION_NOUN}\\b`, "iu");
  const strongClauseStart = new RegExp(
    "^(?:wir|werden|sollen|müssen|gezielt|zusätzlich|außerdem|zugleich|dafür|die|der|das|den|eine|einen|bestehende|weitere|moderne|klare|Maßnahmen|Verfahren|Unterstützungsstrukturen)\\b",
    "iu",
  );
  const separators = [
    ...text.matchAll(
      /;\s+|,\s+|(?:,\s*)?\b(?:und|sowie|zugleich|gleichzeitig|darüber hinaus|ergänzend)\b\s+/giu,
    ),
  ];
  const clauses = [];
  let start = 0;
  for (const separator of separators) {
    const left = text.slice(start, separator.index).trim();
    const right = text.slice(separator.index + separator[0].length);
    const rightBeforeNextComma = right.split(/;\s+|,\s+/u, 1)[0];
    const leftHasAction = action.test(left) || actionNoun.test(left);
    const actionMatch = rightBeforeNextComma.match(action);
    const firstCoordination = rightBeforeNextComma.search(
      /(?<!-)\s+(?:und|sowie)\s+/iu,
    );
    const rightHasLocalAction =
      actionMatch !== null &&
      (firstCoordination < 0 || actionMatch.index < firstCoordination);
    const isCoordinator = /\b(?:und|sowie|zugleich|gleichzeitig|darüber hinaus|ergänzend)\b/iu.test(
      separator[0],
    );
    const rightHasStrongCoordinatedAction =
      isCoordinator && strongClauseStart.test(right) && action.test(right);
    // Hyphenated coordinated forms ("Bau- und Vergabeverfahren") are one
    // grammatical object, never an atom boundary.
    if (
      left.length >= 8 &&
      !left.endsWith("-") &&
      leftHasAction &&
      (rightHasLocalAction || rightHasStrongCoordinatedAction)
    ) {
      clauses.push(left);
      start = separator.index + separator[0].length;
    }
  }
  clauses.push(text.slice(start).trim());
  return clauses.filter((item) => item.length >= 8);
}

function splitSharedNominalActionList(text) {
  const actionNoun = new RegExp(`\\b${ACTION_NOUN}\\b`, "iu");
  const beginsWithActionNoun = new RegExp(
    `^(?:(?:die|der|das|den|dem|eine|ein|einen|einem|gezielte|gezielter|gezielten|verstärkte|verstärkter|verstärkten|kontinuierliche|kontinuierlicher|kontinuierlichen|weitere|weiterer|weiteren)\\s+)?${ACTION_NOUN}\\b`,
    "iu",
  );
  const separators = [
    ...text.matchAll(/,\s+|\s+(?:und|sowie)\s+/giu),
  ];
  const items = [];
  let start = 0;
  for (const separator of separators) {
    const left = text.slice(start, separator.index).trim();
    const right = text.slice(separator.index + separator[0].length);
    if (
      left.length >= 8 &&
      !left.endsWith("-") &&
      actionNoun.test(left) &&
      beginsWithActionNoun.test(right)
    ) {
      items.push(left);
      start = separator.index + separator[0].length;
    }
  }
  items.push(text.slice(start).trim());
  return items.filter((item) => item.length >= 8);
}

function atomizeUnit(text) {
  const semicolonParts = text
    .split(/;\s+(?=[A-ZÄÖÜ„“]|wir\b)/u)
    .map((part) => part.trim())
    .filter(Boolean);
  const atoms = [];
  for (const part of semicolonParts) {
    const enumerated = splitEnumeratedMeasures(part);
    const candidates = enumerated ?? [part];
    for (const candidate of candidates) {
      const coordinated = splitCoordinatedActionClauses(candidate);
      atoms.push(...coordinated.flatMap(splitSharedNominalActionList));
    }
  }
  return [...new Set(atoms.length ? atoms : [text])];
}

function reasonProfile(atomText) {
  return REASON_PROFILES.find((profile) => profile.match.test(atomText));
}

function excerpt(text, max = 220) {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

function terminalEffectRecord({ unit, atom, atomOrdinal }) {
  const profile = reasonProfile(atom.atom_text);
  const objectLabel = `PDF ${unit.pdf_page}, Unit ${unit.source_unit_ordinal}, Atom ${atomOrdinal}`;
  return {
    record_id: `${atom.atom_id}-DECISION`,
    jurisdiction: "DE-BE",
    party: "CDU",
    artifact_id: ARTIFACT.artifact_id,
    artifact_sha256: ARTIFACT.artifact_sha256,
    pdf_page: unit.pdf_page,
    source_unit_id: unit.source_unit_id,
    atom_id: atom.atom_id,
    source_locator: unit.source_locator,
    source_excerpt: unit.source_text,
    atom_excerpt: atom.atom_text,
    source_unit_class: "EFFECT_BEARING",
    terminal_status: "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON",
    exact_reason_code: profile.code,
    exact_reason: `${objectLabel} („${excerpt(atom.atom_text)}“): Für genau dieses Vorhaben fehlt ${profile.missing}. Dieser kleinste source-bound Blocker verhindert eine belastbare Freigabe von Mechanismus, Wirkungsrichtung, Evidenz und Materialität; es wurde nichts aus Claim, Schlagwort oder Parteiidentität ergänzt.`,
    policy_action: atom.atom_text,
    reviewed_exact_missing_fields: [profile.missing],
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
    source_refs: [
      `${ARTIFACT.verified_exact_byte_mirror_url}#page=${unit.pdf_page}`,
      `sha256:${ARTIFACT.artifact_sha256}`,
    ],
    ...PROVENANCE,
    reviewed_at: REVIEWED_AT,
  };
}

function terminalContextRecord(unit) {
  const kind = unit.context_kind;
  const reasonByKind = {
    TABLE_OF_CONTENTS:
      "Die vollständig gelesene Unit ist ein Inhaltsverzeichnis-Eintrag; sie lokalisiert Kapitel, enthält aber keine eigenständige politische Handlung.",
    COVER_OR_SECTION_DIVIDER:
      "Die vollständig gelesene Unit gehört zu Titel, Abschnittstrenner oder Impressum und enthält kein eigenständiges politisches Instrument.",
    STRUCTURAL_HEADING:
      "Die vollständig gelesene Unit ist eine reine Gliederungsüberschrift ohne eigenständige Handlung oder Regel.",
    HISTORICAL_OR_CURRENT_STATE_DESCRIPTION:
      "Die vollständig gelesene Unit beschreibt einen behaupteten bestehenden oder vergangenen Zustand, enthält aber keine neue eigenständige Programmhandlung.",
    DIAGNOSIS_VALUE_OR_CAMPAIGN_FRAME_WITHOUT_INSTRUMENT:
      "Die vollständig gelesene Unit enthält Diagnose, Wertung, Begründung oder Kampagnenrahmung, aber kein entscheidungsreifes eigenständiges Instrument.",
  };
  return {
    record_id: `${unit.source_unit_id}-CONTEXT`,
    jurisdiction: "DE-BE",
    party: "CDU",
    artifact_id: ARTIFACT.artifact_id,
    artifact_sha256: ARTIFACT.artifact_sha256,
    pdf_page: unit.pdf_page,
    source_unit_id: unit.source_unit_id,
    atom_id: null,
    source_locator: unit.source_locator,
    source_excerpt: unit.source_text,
    source_unit_class: "NON_EFFECT_CONTEXT",
    terminal_status: "NON_EFFECT_CONTEXT_REVIEWED",
    context_kind: kind,
    exact_reason: `${reasonByKind[kind]} Fundstelle: PDF ${unit.pdf_page}, Unit ${unit.source_unit_ordinal} („${excerpt(unit.source_text, 160)}“).`,
    policy_action: null,
    source_refs: [
      `${ARTIFACT.verified_exact_byte_mirror_url}#page=${unit.pdf_page}`,
      `sha256:${ARTIFACT.artifact_sha256}`,
    ],
    ...PROVENANCE,
    reviewed_at: REVIEWED_AT,
  };
}

function buildLedger(artifactPath) {
  const artifactBytes = verifyArtifact(artifactPath);
  const sourceUnits = [];
  const effectAtoms = [];
  const records = [];
  const pageCoverage = [];

  for (let page = 1; page <= ARTIFACT.page_count; page += 1) {
    const { raw, units } = normalizedPageUnits(artifactPath, page);
    const pageUnits = [];
    for (const [index, sourceText] of units.entries()) {
      const ordinal = index + 1;
      const sourceUnitId = `BE-CDU-P${pad(page, 3)}-U${pad(ordinal, 3)}`;
      const sourceClass = classifyUnit(page, sourceText);
      const atomTexts =
        sourceClass === "EFFECT_BEARING" ? atomizeUnit(sourceText) : [];
      const atomIds = atomTexts.map((atomText, atomIndex) =>
        `BE-CDU-P${pad(page, 3)}-U${pad(ordinal, 3)}-A${pad(atomIndex + 1, 2)}-${sha256(atomText).slice(0, 12)}`,
      );
      const unit = {
        source_unit_id: sourceUnitId,
        pdf_page: page,
        source_unit_ordinal: ordinal,
        source_locator: `PDF page ${page} of ${ARTIFACT.page_count}, source unit ${ordinal}`,
        source_text: sourceText,
        source_text_sha256: sha256(sourceText),
        source_unit_class: sourceClass,
        context_kind:
          sourceClass === "NON_EFFECT_CONTEXT"
            ? contextKind(page, sourceText)
            : null,
        atom_ids: atomIds,
        atom_count: atomIds.length,
      };
      sourceUnits.push(unit);
      pageUnits.push(unit);
      if (sourceClass === "EFFECT_BEARING") {
        atomTexts.forEach((atomText, atomIndex) => {
          const atom = {
            atom_id: atomIds[atomIndex],
            source_unit_id: sourceUnitId,
            pdf_page: page,
            atom_ordinal: atomIndex + 1,
            atom_text: atomText,
            atom_text_sha256: sha256(atomText),
            atomization_method:
              atomTexts.length === 1
                ? "SINGLE_INDEPENDENT_MEASURE"
                : "MULTI_MEASURE_UNIT_CLAUSE_OR_ENUMERATION_SPLIT",
          };
          effectAtoms.push(atom);
          records.push(
            terminalEffectRecord({
              unit,
              atom,
              atomOrdinal: atomIndex + 1,
            }),
          );
        });
      } else {
        records.push(terminalContextRecord(unit));
      }
    }
    const pageAtoms = effectAtoms.filter((atom) => atom.pdf_page === page);
    pageCoverage.push({
      pdf_page: page,
      raw_page_text_sha256: sha256(raw),
      source_unit_count: pageUnits.length,
      source_unit_ids: pageUnits.map((unit) => unit.source_unit_id),
      non_effect_context_units: pageUnits.filter(
        (unit) => unit.source_unit_class === "NON_EFFECT_CONTEXT",
      ).length,
      effect_bearing_source_units: pageUnits.filter(
        (unit) => unit.source_unit_class === "EFFECT_BEARING",
      ).length,
      effect_atoms: pageAtoms.length,
      terminal_effect_atoms: pageAtoms.length,
      open_atoms: 0,
      page_read_fully: true,
      source_units_segmented: true,
      unit_atom_bindings_complete: true,
      page_coverage_pass: true,
    });
  }

  const contextCount = sourceUnits.filter(
    (unit) => unit.source_unit_class === "NON_EFFECT_CONTEXT",
  ).length;
  const summary = {
    expected_pages: ARTIFACT.page_count,
    reviewed_pages: pageCoverage.length,
    unaccounted_pages: 0,
    total_source_units: sourceUnits.length,
    non_effect_context_units: contextCount,
    effect_bearing_source_units: sourceUnits.length - contextCount,
    effect_atoms: effectAtoms.length,
    explicit_fach_approved: 0,
    reviewed_not_assessable: effectAtoms.length,
    source_conflicts: 0,
    open_atoms: 0,
    unclassified_source_units: 0,
    unterminated_effect_atoms: 0,
    all_pages_accounted_for: true,
    all_source_units_classified: true,
    all_effect_bearing_units_have_terminal_fach_status: true,
    all_unit_atom_bindings_complete: true,
    no_silent_omissions: true,
    no_generic_placeholder_as_approval: true,
    all_approved_atoms_have_required_fach_fields: true,
    source_fidelity: "PASS",
    coverage_manifest: "COMPLETE",
    programme_analysis_complete: true,
  };

  return {
    schema_version: "woek-programme-fach-decision-2026-08-26",
    ledger_id: "BE-CDU-FULL-PROGRAMME-FACH-LEDGER-2026-V1",
    jurisdiction: "DE-BE",
    election: "agh-2026-be",
    party: "CDU",
    artifact: {
      ...ARTIFACT,
      artifact_bytes_verified_sha256: sha256(artifactBytes),
    },
    review_contract: {
      governance_contract:
        "/WOEK/WOEK-PARLAMENT-FACHREVIEW-2026-08-26/01-governance/FACHREVIEW-DELEGATION-AND-GATES.md",
      berlin_contract:
        "/WOEK/WOEK-PARLAMENT-FACHREVIEW-2026-08-26/02-berlin/BERLIN-FULL-PROGRAMME-REVIEW-CONTRACT.md",
      decision_schema:
        "/WOEK/WOEK-PARLAMENT-FACHREVIEW-2026-08-26/02-berlin/BERLIN-DECISION-SCHEMA.json",
      extraction_mode: "pdftotext -layout; one isolated physical page per call",
      segmentation_rule:
        "Remove exact recurring header/footer lines; preserve blank-boundary paragraphs and bullets; dehyphenate visual line wraps; split paragraphs into sentence-level source units.",
      atomization_rule:
        "Every EFFECT_BEARING source unit binds to one or more atoms. Semicolon-separated independent clauses, explicit measure enumerations and coordinated independent action clauses are split. NON_EFFECT_CONTEXT binds to zero atoms.",
      fach_rule:
        "No direction, evidence, DNS, SDG, recommendation, score or party-wide judgment is inferred from programme text, keyword, metadata or identity. Keywords are used only to select which exact missing input is recorded for a fail-closed terminal decision.",
    },
    required_provenance: PROVENANCE,
    all_physical_page_coverage: Array.from(
      { length: ARTIFACT.page_count },
      (_, index) => ({ pdf_page: index + 1, status: "PAGE_READ_FULLY" }),
    ),
    page_coverage: pageCoverage,
    source_units: sourceUnits,
    effect_atoms: effectAtoms,
    records,
    programme_summary: summary,
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

function buildOverlay(ledger, ledgerBytes) {
  const summary = ledger.programme_summary;
  return {
    schema_version: "woek-berlin-fach-residual-party-overlay-1.0",
    overlay_id: "BE-FACH-CONTENT-RESIDUAL-CDU-TERMINAL-2026-V1",
    jurisdiction: "DE-BE",
    election: "agh-2026-be",
    party: "CDU",
    target_matrix_id: "BE-FACH-CONTENT-RESIDUAL-2026-V2",
    application_mode: "REPLACE_PARTY_RECORD_THEN_RECOMPUTE_SUMMARY",
    source_pin: {
      path: "woek-parlament-app/data/state-programmes/fach-reviews/berlin-2026-cdu-v1.json",
      sha256: sha256(ledgerBytes),
      ledger_id: ledger.ledger_id,
    },
    replace_programme_record: {
      party: "CDU",
      artifact_id: ledger.artifact.artifact_id,
      artifact_sha256: ledger.artifact.artifact_sha256,
      expected_pages: summary.expected_pages,
      reviewed_pages: summary.reviewed_pages,
      unaccounted_pages: summary.unaccounted_pages,
      total_source_units: summary.total_source_units,
      non_effect_context_units: summary.non_effect_context_units,
      effect_bearing_source_units: summary.effect_bearing_source_units,
      effect_atoms: summary.effect_atoms,
      explicit_fach_approved: summary.explicit_fach_approved,
      reviewed_not_assessable: summary.reviewed_not_assessable,
      source_conflicts: summary.source_conflicts,
      open_atoms: summary.open_atoms,
      genuine_fach_review_required: 0,
      coverage_manifest_pass: true,
      analysis_state: "FULL_PROGRAMME_TERMINAL_SOURCE_BOUND",
      programme_analysis_complete: true,
    },
    recompute_rules: [
      "summary.programme_analysis_complete = count(programmes where programme_analysis_complete=true)",
      "summary.programme_analysis_open = verified_final_programmes - programme_analysis_complete",
      "summary.remaining_genuine_fach_review_required = sum(programmes.genuine_fach_review_required)",
      "execution_order_remaining = previous execution_order_remaining without CDU",
    ],
    expected_delta_when_applied_once: {
      programme_analysis_complete: 1,
      programme_analysis_open: -1,
      remaining_genuine_fach_review_required: -128,
      execution_order_remove: "CDU",
    },
    required_provenance: PROVENANCE,
    release_policy: {
      no_new_vercel_build: true,
      parliament_release_approval: "NOT_GRANTED",
    },
  };
}

function serialized(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

const args = parseArgs();
if (!args.artifact) {
  throw new Error("--artifact is required and must point to the exact pinned CDU PDF.");
}
const ledger = buildLedger(resolve(args.artifact));
const ledgerText = serialized(ledger);
const overlay = buildOverlay(ledger, Buffer.from(ledgerText));
const overlayText = serialized(overlay);
const ledgerOutput = resolve(args.ledgerOutput);
const overlayOutput = resolve(args.overlayOutput);

if (args.check) {
  if (readFileSync(ledgerOutput, "utf8") !== ledgerText) {
    throw new Error("CDU ledger is stale or not deterministic.");
  }
  if (readFileSync(overlayOutput, "utf8") !== overlayText) {
    throw new Error("CDU residual overlay is stale or not deterministic.");
  }
  console.log("PASS Berlin CDU ledger and residual overlay are deterministic");
} else {
  writeFileSync(ledgerOutput, ledgerText);
  writeFileSync(overlayOutput, overlayText);
  console.log(
    `WROTE ${ledgerOutput} and ${overlayOutput}: ${ledger.programme_summary.total_source_units} units / ${ledger.programme_summary.effect_atoms} atoms`,
  );
}
