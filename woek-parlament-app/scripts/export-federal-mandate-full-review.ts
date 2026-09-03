#!/usr/bin/env tsx

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import commitmentRegisters from "@/data/generated/release-1/commitment-registers.json";
import commitmentLinks from "@/data/generated/release-1/commitment-links.json";
import referenceSnapshot from "@/data/woek-reference-snapshot.json";
import { assertExternalReviewSafe, sha256, stableJson } from "@/lib/review/privacy";

const batchCode = process.argv.find((argument) => argument.startsWith("--batch-code="))?.slice("--batch-code=".length)
  ?? "WOEK-BUNDESPROGRAMME-UND-KOALITIONSVERTRAG-2026-0001";
const sourceArgument = process.argv.find((argument) => argument.startsWith("--sources="))?.slice("--sources=".length)
  ?? ".local/external-review/mandate/woek-mandat-review-2026-0001.zip";
const outputArgument = process.argv.find((argument) => argument.startsWith("--output="))?.slice("--output=".length)
  ?? `.local/review-exports/${batchCode}.zip`;

function instructionDocument() {
  return `# Fachprüfung: Bundestagswahlprogramme 2025 und Koalitionsvertrag 2025

Dieses Paket enthält die sieben vollständigen Originaldokumente, das bereits quellengebundene Register mit 1.593 Zusagen sowie die dokumentierten Verbindungen Wahlprogramm → Koalitionsvertrag → parlamentarische Entscheidungseinheiten.

## Aufgabe

Erstelle die fehlende vollständige wirkungsökonomische Fachanalyse je Dokument. Das vorhandene Zusageregister ist eine Arbeitsgrundlage, kein ausreichender Endbericht: Jede Aussage muss an der Originalquelle und am individuellen Zusageschlüssel überprüft und, wenn nötig, präzisiert werden.

## Was jede Fachakte leisten muss

1. **Verständliche Kernaussage:** Was schlägt das Dokument in seinen materiellen Bereichen vor? Für wen und mit welchem ausdrücklich benannten Ziel?
2. **Vollständige Analyse der konkreten Zusagen:** Jede materielle Zusage erhält einen eindeutigen, quellengebundenen Wirkpfad oder einen begründeten Status \`NOT_MATERIALLY_ASSESSABLE\` bzw. \`DATA_GAP\`. Mehrere Zusagen dürfen nur mit nachvollziehbarer Sammelreferenz verbunden werden.
3. **Ex-ante-Klarheit:** Wahlprogramme und Koalitionsvertrag beschreiben mögliche Zukunft. Deshalb Wirkungspotenzial, Wirkungsrisiko und später beobachtbare Wirkung strikt trennen.
4. **Bedingungen und Zuständigkeit:** Regeländerung, Finanzierung, Vollzug, Zielgruppen, Bund/Länder/EU, zeitliche Voraussetzungen und Alternativen sichtbar machen.
5. **Referenzrahmen:** Nur tatsächlich berührte SDGs, SDG+, Mensch–Planet–Demokratie und Schutzgrenzen zuordnen. Mapping ist keine festgestellte Wirkung.
6. **Berechnungsvorbereitung:** Wo Quantifizierung sachlich möglich wäre, die notwendigen Ausgangswerte, Gegenfaktumsart, Einheiten, Indikatoren und Quellen nennen. Wo das nicht tragfähig ist: \`NOT_ROBUSTLY_QUANTIFIABLE\` – niemals einen Zahlenwert schätzen.
7. **Verbindung zur Praxis:** Die vorliegenden Programm→Koalition- und Koalition→Parlament-Bezüge prüfen, Korrekturen belegen und nicht mit Umsetzungs- oder Wirkungsnachweisen verwechseln.

## Nicht zulässig

- Keine Partei-, Personen- oder Regierungsrangliste und keine Gesamtpunktzahl.
- Keine zusammenfassende Formel, die unterschiedliche Schutzgüter ohne offengelegte Regel verrechnet.
- Keine erfundenen Daten, Kausalitäten, Quellen oder Zahlen.
- Keine spätere Information als Wissen bei der Bundestagswahl bzw. beim Vertragsschluss darstellen.
- Keine lokalen Pfade, Zugangsdaten, redaktionellen Arbeitsnotizen oder Hinweise auf die Erstellungstechnik in der Rückgabe.

## Rückgabe

Erzeuge eine Ergebnisdatei je Quelle:

\`results/<source_key>/programme-wirkungsakte.json\`

Sie muss dem bereitgestellten Schema entsprechen. Zusätzlich: \`batch-summary.md\` mit Qualitätssicherung, Quellenkonflikten, relevanten Datenlücken, querliegenden Wirkpfaden und methodischen Fragen. Alle unveränderten, bereits tragfähigen Einträge dürfen referenziert werden; alle inhaltlich korrigierten Einträge müssen ihren Zusageschlüssel und ihre Fundstelle nennen.
`;
}

function resultSchema() {
  return {
    schema_version: "1.0.0",
    source_key: "string",
    source_document_hash: "sha256 hex from manifest",
    input_commitment_register_hash: "sha256 hex",
    input_package_hash: "sha256 hex",
    reference_snapshot_id: "string",
    review_status: "COMPLETE | PARTIAL | DATA_GAP",
    plain_language_summary: "string",
    source_summary: { declared_objectives: ["string"], material_policy_domains: ["string"], scope_and_boundary: "string" },
    commitment_assessments: [{
      commitment_key: "must match a supplied register key",
      source_location: "page and section",
      measure: "string",
      intended_change: "string",
      responsible_actors: ["string"],
      impact_potential: [{ path_id: "string", mechanism: "string", expected_state_change: "string", prerequisites: ["string"], counterfactual: "string", evidence_status: "SUPPORTED | LIMITED | DATA_GAP" }],
      impact_risks: [{ risk: "string", conditions: ["string"], affected_groups_or_goods: ["string"], evidence_status: "SUPPORTED | LIMITED | DATA_GAP" }],
      normative_mapping: { sdgs: ["object with ID, direction and rationale"], sdg_plus: ["object with ID, direction and rationale"], human: ["string"], planet: ["string"], democracy: ["string"] },
      non_compensation: [{ concern: "string", status: "NONE_IDENTIFIED | REVIEW_REQUIRED | DATA_GAP", rationale: "string" }],
      calculation_requirements: [{ outcome: "string", baseline: "string", counterfactual: "string", required_operands: ["string"], unit: "string or null", indicator: "string or null", status: "QUANTIFIABLE_WITH_DATA | NOT_ROBUSTLY_QUANTIFIABLE | DATA_GAP" }],
      data_gaps: ["string"]
    }],
    central_impact_paths: ["path IDs"],
    cross_cutting_dependencies: [{ description: "string", commitment_keys: ["string"] }],
    programme_to_coalition_review: [{ programme_commitment_key: "string", status: "string", rationale: "string" }],
    coalition_to_parliament_review: [{ coalition_commitment_key: "string", case_ids: ["string"], status: "string", rationale: "string" }],
    provenance: { reviewed_at: "ISO 8601", source_refs: ["string"] }
  };
}

async function main() {
  const sourceZip = await JSZip.loadAsync(await readFile(path.resolve(sourceArgument)));
  const inputSourceFiles = Object.values(sourceZip.files).filter((entry) => !entry.dir && entry.name.startsWith("sources/"));
  if (inputSourceFiles.length < 14) throw new Error("The source archive does not contain the seven documents and source manifests.");
  const sourceManifestEntry = sourceZip.file("manifest.json");
  if (!sourceManifestEntry) throw new Error("The source archive has no manifest.");
  const sourceManifest = JSON.parse(await sourceManifestEntry.async("string")) as Record<string, unknown>;
  const outputZip = new JSZip();
  for (const sourceFile of inputSourceFiles) outputZip.file(sourceFile.name, await sourceFile.async("uint8array"), { binary: true, compression: "DEFLATE" });

  const inputRegisters = commitmentRegisters as Record<string, unknown>;
  const inputLinks = commitmentLinks as Record<string, unknown>;
  const packageBase = {
    schema_version: "1.0.0",
    batch_code: batchCode,
    review_type: "FEDERAL_PROGRAMME_AND_COALITION_FULL_REVIEW",
    created_at: new Date().toISOString(),
    publisher: "Institut für Wirkungsökonomie",
    source_package_hash: sourceManifest.package_hash,
    commitment_register_hash: sha256(inputRegisters),
    commitment_link_hash: sha256(inputLinks),
    reference_snapshot_id: (referenceSnapshot as { snapshot_id?: string }).snapshot_id ?? "WOEK_REFERENCE_SNAPSHOT",
    source_count: 7,
    commitment_count: 1593
  };
  const manifest = { ...packageBase, package_hash: sha256(packageBase) };
  assertExternalReviewSafe(manifest, "federal-mandate-full-review");
  outputZip.file("manifest.json", stableJson(manifest));
  outputZip.file("BATCH.md", instructionDocument());
  outputZip.file("inputs/commitment-registers.json", stableJson(inputRegisters));
  outputZip.file("inputs/commitment-links.json", stableJson(inputLinks));
  outputZip.file("references/woek-reference-snapshot.json", stableJson(referenceSnapshot));
  outputZip.file("schemas/programme-wirkungsakte.schema.json", stableJson(resultSchema()));
  const archive = await outputZip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 9 } });
  const resolvedOutput = path.resolve(outputArgument);
  await mkdir(path.dirname(resolvedOutput), { recursive: true });
  await writeFile(resolvedOutput, archive);
  console.log(JSON.stringify({ output: resolvedOutput, batch_code: batchCode, sources: 7, commitments: 1593, package_hash: manifest.package_hash }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Bundesprogramm-Fachprüfung konnte nicht exportiert werden.");
  process.exit(1);
});
