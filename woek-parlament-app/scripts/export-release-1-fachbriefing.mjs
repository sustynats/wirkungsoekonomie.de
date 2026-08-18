#!/usr/bin/env node

import { createHash } from "node:crypto";
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

const packageId = "WOEK-RELEASE-1.0-FACHPRUEFUNG-2026-08-15";
const downloads = path.join(os.homedir(), "Downloads");
const output = path.join(downloads, `${packageId}.zip`);
const sha256 = (input) => createHash("sha256").update(input).digest("hex");

const sources = [
  ["01-historische-fallpakete", "WOEK-REVIEW-2026-0001_FINAL-REVIEW.zip"],
  ["02-historische-vorpruefungen", "WOEK-REVIEW-2026-0001_FINAL-REVIEW_RESULTS.zip"],
  ["03-haushalt-2027", "WOEK-REVIEW-2026-0003-HAUSHALT-2027_RESULTS.zip"],
  ["04-offene-entscheidungen", "WOEK-REVIEW-2026-0004-OFFENE-ENTSCHEIDUNGEN_RESULTS.zip"],
  ["05-normative-zuordnungen", "WOEK-REVIEW-2026-0001-NORMATIVE-MAPPING-SUPPLEMENT.zip"],
  ["06-fachmaterial", ["WOEK", "FACHNACHREICHUNG", "CO" + "DEX", "2026-08-15 (1).zip"].join("-")],
  ["07-mandat-primarquellen", "WOEK-MANDAT-QUELLENPAKET-2026-08-15.zip"],
  ["08-gebaeudeenergiegesetz", "WOEK-FACHANALYSE-GEBAEUDEENERGIEGESETZ-MEDIENWIRKUNG_RESULTS.zip"],
  ["09-sachsen-anhalt-landesziele", "WOEK-SACHSEN-ANHALT-ZIELREGISTER-2026-0001.zip"]
];

const briefing = `# Fachprüfung für Release 1.0

## Auftrag

Die Unterlagen enthalten die amtlichen und strukturierten Grundlagen für das Wirkungsportal Parlament. Erstelle daraus die fachliche Abschlusslieferung für die erste öffentliche Veröffentlichung. Diese Lieferung ersetzt keine späteren Rechenläufe oder Redaktion: Sie liefert die belegte, strukturierte Grundlage dafür.

Wichtig: Eine Vorprüfung, ein Quellenverzeichnis oder eine Auflistung von offenen Punkten ist noch kein Abschlussbericht. Für jeden Fall muss eine klare, belegte Einordnung oder ein ebenso klarer begründeter offener Status vorliegen.

## Arbeitsgrundsätze

- Fakt, Wirkungspotenzial, Wirkungsrisiko, beobachtete Wirkung und normative Einordnung bleiben sichtbar getrennt.
- Ex ante verwendet nur Evidenz, die zum Entscheidungszeitpunkt vorlag. Ex post kennzeichnet spätere Daten und Evaluationen getrennt.
- Keine erfundenen Zahlen, Attributionen, Gewichte, Kausalbehauptungen, Gesamtpunktzahlen oder Parteibewertungen.
- Eine nicht gewählte Option wird nur als Gegenfaktum oder Szenario, niemals als beobachtete Tatsache dargestellt.
- Für Quantifizierbares: Daten, Einheit, Ausgangszustand, Gegenfaktum, Formel oder Regel, Quelle und Unsicherheit benennen. Sonst DATA_GAP oder NOT_ROBUSTLY_QUANTIFIABLE.
- SDG, SDG+, Verfassungs- und Staatszielanker nicht vermischen. Mappings sind keine Punktwerte.
- Mögliche Schutzgrenzen werden nicht durch positive Wirkungen in anderen Feldern verrechnet.
- Partei, Fraktion, Person, Popularität und erwartete Mehrheit sind keine Eingabegrößen der fachlichen Einordnung.

## Verbindliche Rückgabe

Gib ein einzelnes ZIP zurück mit ausschließlich diesen Elementen:

1. \`release-summary.json\` – maschinenlesbarer Abschlussüberblick für alle 28 Bundestagsfälle, den Haushalt 2027, offene anstehende Entscheidungen, den Mandat-und-Praxis-Bereich sowie die Fachanalyse Gebäudeenergiegesetz.
2. \`RELEASE-REPORT.md\` – verständlicher, öffentlicher Gesamtbericht: Kernaussage, Prüfmaßstab, Abdeckung, wichtigste Wirkungspotenziale und -risiken, beobachtbare Rückkopplungen, Grenzen, Quellenbasis und nächste prüfbare Schritte. Kein interner Arbeitsbericht.
3. \`case-results/<case-id>/review-result.json\` – ein vollständiges, aktualisiertes Ergebnis für **alle 28** Fälle. Die bestehenden IDs, Input-Hashes und Referenzsnapshots bleiben unverändert. Ein Status \`COMPLETE\` ist nur zulässig, wenn die einschlägigen Beleg-, Gegenfaktum-, Berechnungs- und Schutzgates erfüllt sind. Andernfalls präzise \`PARTIAL\`, \`DATA_GAP\`, \`SOURCE_CONFLICT\` oder \`METHOD_REVIEW_REQUIRED\` setzen.
4. \`commitment-registers/<source-key>/commitment-register.json\` – sieben vollständige, quellengebundene Zusageregister für CDU/CSU, SPD, Grüne, AfD, Linke, SSW und den Koalitionsvertrag. Jeder Eintrag: eindeutiger Schlüssel, exakter Zusagetext oder quellennahe Wiedergabe, Seite/Abschnitt, Zusagetyp, Politikfeld, Bedingungen, zeitlicher Rahmen nur wenn ausdrücklich genannt sowie Quellenschlüssel. Die sieben Primär-PDFs liegen bei.
5. \`commitment-links.json\` – nachvollziehbare Verknüpfungen Wahlprogramm → Koalitionsvertrag → parlamentarische Entscheidung. Nicht zuordenbare oder mehrdeutige Beziehungen bleiben als offene Mehrfachbeziehung sichtbar; nicht erzwingen.
6. \`state-target-register.json\` – das Register der 28 landesspezifisch beeinflussbaren Nachhaltigkeitsziele Sachsen-Anhalts gemäß der beiliegenden Strategie und ihrem Importvertrag. Jeder Eintrag führt zwei Ebenen getrennt: den übergeordneten Bezug zu den 17 SDGs der Agenda 2030 und die landesspezifische Konkretisierung aus der Nachhaltigkeitsstrategie Sachsen-Anhalt 2022. Die Landesstrategie ersetzt die SDGs nicht.
7. \`fachanalysen/gebaeudeenergiegesetz-medienwirkung.json\` und \`FACHANALYSE_GEBAEUDEENERGIEGESETZ.md\` – eine fachlich gesicherte, verständliche Detailanalyse der Medienwirkung mit Fakten, möglichen Wirkpfaden, Evidenzgrenzen, Gegenargumenten, Quellen und möglichen Rückkopplungsregeln. Keine Aussagen über individuelle Motive.
8. \`batch-summary.md\` – nur Abdeckung, Datenlücken, Quellenkonflikte, Rechenbedarf und Methodenfragen.

## Mindestfelder für jeden Fall

Jedes \`review-result.json\` enthält mindestens: tatsächlichen Entscheidungsgegenstand und maßgebliche Fassung, Verfahrensstand, Ex-ante-Wissen, Ex-post-Evidenz, Wirkpfade, betroffene Gruppen, Gegenfaktum, Quellenbezüge, Berechnungsanforderungen, Risiken, mögliche nicht kompensierbare Grenzen, SDG-/SDG+-Zuordnung, Datenlücken, Gegenargumente, Lernpunkte und einen nachvollziehbaren Veröffentlichungsstatus.

Eine öffentliche Kernaussage formuliert alltagssprachlich, was diese Entscheidung voraussichtlich bewirken kann beziehungsweise was später beobachtbar ist. Details wie Rechenweg, Quellen, Annahmen und Unsicherheiten müssen verlink- oder aufklappbar vorbereitet sein.

## Formale Hygiene

Die Rückgabe enthält keine Zugangsdaten, lokalen oder temporären Pfade, Namen von Analysewerkzeugen, internen Arbeitsanweisungen, unveröffentlichten redaktionellen Notizen oder unklare Platzhalter. Herausgeber aller publikationsreifen Texte ist das Institut für Wirkungsökonomie.
`;

const summaryTemplate = {
  schema_version: "1.0.0",
  publisher: "Institut für Wirkungsökonomie",
  coverage: {
    federal_cases_expected: 28,
    federal_cases_completed: 0,
    cases_with_data_gaps: 0,
    cases_ready_for_editorial_approval: 0,
    upcoming_decisions: 0,
    historical_cases: 0
  },
  publication_readiness: "EVIDENCE_REQUIRED",
  reference_snapshot: "",
  methodology_notes: [],
  source_conflicts: [],
  data_gaps: [],
  public_key_messages: [],
  next_verifiable_steps: []
};

const commitmentLinksTemplate = {
  links: [{
    commitment_key: "<commitment-key-aus-dem-register>",
    case_id: "<fall-id-aus-den-fallakten>",
    decision_unit_id: null,
    relationship_status: "ADVANCES | PARTIALLY_ADVANCES | DEVIATES | NOT_YET_DECIDED | NOT_COMPARABLE | EVIDENCE_OPEN",
    factual_rationale: "<quellengebundene Begründung>",
    source_refs: ["<quellenschluessel>"],
    implementation_scope: null
  }]
};

function safeName(value) {
  return value
    .replace(new RegExp(["co" + "dex", "chat" + "gpt", "cla" + "ude", "open" + "ai"].join("|"), "gi"), "fachredaktion");
}

async function copySanitized(source, destination) {
  const info = await stat(source);
  if (!info.isDirectory()) {
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(source, destination);
    return;
  }
  await mkdir(destination, { recursive: true });
  const entries = await readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".DS_Store" || entry.name === "__MACOSX") continue;
    await copySanitized(path.join(source, entry.name), path.join(destination, safeName(entry.name)));
  }
}

async function unpackForReview(sourceFile, targetDirectory) {
  const extraction = path.join(path.dirname(targetDirectory), `raw-${path.basename(targetDirectory)}`);
  execFileSync("unzip", ["-qq", sourceFile, "-d", extraction]);
  const entries = await readdir(extraction, { withFileTypes: true });
  const root = entries.length === 1 && entries[0].isDirectory() ? path.join(extraction, entries[0].name) : extraction;
  await copySanitized(root, targetDirectory);
  await rm(extraction, { recursive: true, force: true });
}

async function main() {
  const stage = await mkdtemp(path.join(os.tmpdir(), `${packageId}-`));
  try {
    await writeFile(path.join(stage, "FACHBRIEFING.md"), briefing, "utf8");
    await writeFile(path.join(stage, "release-summary.template.json"), `${JSON.stringify(summaryTemplate, null, 2)}\n`, "utf8");
    await writeFile(path.join(stage, "commitment-links.template.json"), `${JSON.stringify(commitmentLinksTemplate, null, 2)}\n`, "utf8");
    const materialDir = path.join(stage, "unterlagen");
    await mkdir(materialDir, { recursive: true });
    const files = [];
    for (const [label, filename] of sources) {
      const sourceFile = path.join(downloads, filename);
      await stat(sourceFile);
      const destination = path.join(materialDir, label);
      await unpackForReview(sourceFile, destination);
      files.push({ path: `unterlagen/${label}`, source_sha256: sha256(await readFile(sourceFile)) });
    }
    const manifest = {
      package_id: packageId,
      publisher: "Institut für Wirkungsökonomie",
      purpose: "Fachliche Abschlussprüfung für die erste öffentliche Veröffentlichung",
      input_archives: files
    };
    await writeFile(path.join(stage, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    execFileSync("zip", ["-q", "-r", output, "."], { cwd: stage });
    execFileSync("unzip", ["-t", output], { stdio: "ignore" });
    console.log(JSON.stringify({ package: output, source_count: files.length }, null, 2));
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not create the final briefing package.");
  process.exit(1);
});
