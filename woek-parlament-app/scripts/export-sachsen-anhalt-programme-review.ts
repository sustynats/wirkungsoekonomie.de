#!/usr/bin/env tsx

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { saxonyAnhaltElectionProgrammes } from "@/data/sachsen-anhalt-election-programmes";
import stateTargets from "@/data/generated/release-1/sachsen-anhalt-target-register.json";
import referenceSnapshot from "@/data/woek-reference-snapshot.json";
import { assertExternalReviewSafe, sha256, stableJson } from "@/lib/review/privacy";

const batchCode = process.argv.find((argument) => argument.startsWith("--batch-code="))?.slice("--batch-code=".length)
  ?? "WOEK-SACHSEN-ANHALT-WAHLPROGRAMME-2026-0001";
const outputArgument = process.argv.find((argument) => argument.startsWith("--output="))?.slice("--output=".length);
const outputPath = path.resolve(outputArgument ?? `.local/review-exports/${batchCode}.zip`);
const maximumAssetBytes = 16 * 1024 * 1024;

type PackagedSource = {
  source_key: string;
  party: string;
  title: string;
  canonical_url: string;
  document_url: string;
  source_format: "PDF" | "TEXT";
  document_status: string;
  decision_date: string | null;
  retrieved_at: string;
  sha256: string;
  byte_length: number;
  filename: string;
};

function sourceTextFromHtml(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#(?:x[0-9a-f]+|\d+);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function downloadPdf(url: string) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "user-agent": "Wirkungsportal-Quellenpruefung/1.0 (+https://parlament.wirkungsoekonomie.de)" },
    signal: AbortSignal.timeout(60_000)
  });
  if (!response.ok) throw new Error(`Quelle nicht abrufbar (${response.status}).`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength < 10_000 || bytes.byteLength > maximumAssetBytes) throw new Error("PDF hat eine unzulässige Größe.");
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") throw new Error("Quelle ist keine PDF-Datei.");
  return bytes;
}

async function downloadWebSource(url: string) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "user-agent": "Wirkungsportal-Quellenpruefung/1.0 (+https://parlament.wirkungsoekonomie.de)" },
    signal: AbortSignal.timeout(60_000)
  });
  if (!response.ok) throw new Error(`Quelle nicht abrufbar (${response.status}).`);
  const text = sourceTextFromHtml(await response.text());
  if (text.length < 20_000) throw new Error("Webquelle enthält zu wenig extrahierbaren Programmtext.");
  return new TextEncoder().encode(text);
}

function reviewInstructions() {
  return `# Fachprüfung: Wahlprogramme Sachsen-Anhalt 2026

Dieses Paket enthält die sechs vorliegenden Originalprogramme für die Landtagswahl in Sachsen-Anhalt sowie den aktuellen WÖk-Referenzsnapshot und die 28 Ziele der Nachhaltigkeitsstrategie des Landes.

## Auftrag

Erstelle für jedes Programm eine vollständige, quellengestützte Wirkungsakte. Die Analyse bewertet weder Menschen noch Parteien. Sie prüft ausschließlich, welche Veränderung die konkret beschriebenen Maßnahmen bei einer Umsetzung plausibel auslösen könnten, welche Bedingungen dafür gelten und welche Risiken, Zielkonflikte oder Datenlücken bestehen.

## Verbindliche Unterscheidungen

- **Wirkungspotenzial:** mögliche zukünftige Zustandsänderung bei Umsetzung.
- **Wirkungsrisiko:** mögliche negative oder unerwünschte Zustandsänderung.
- **Beobachtete Wirkung:** bei Wahlprogrammen grundsätzlich noch nicht aus dem Programm ableitbar.
- **Normative Einordnung:** Zuordnung zum transparenten Referenzrahmen; keine Parteipunktzahl und keine Gesamtnote.

## Je Programm liefern

1. Ein leicht verständliches Kurzprofil: Welche wesentlichen Veränderungen werden vorgeschlagen, für wen und mit welchem beabsichtigten Ziel?
2. Ein vollständiges Zusageregister in \`results/<source_key>/commitment-register.json\`: jede hinreichend konkrete Zusage mit exakter Fundstelle, Zuständigkeit, Voraussetzungen und Politikfeld.
3. Eine vollständige Wirkungsakte in \`results/<source_key>/programme-review.json\` nach dem bereitgestellten Schema. Behandle alle materiellen Zusagen; gleichartige Zusagen dürfen nur mit belegter Sammelreferenz zusammengefasst werden.
4. Eine SDG-/SDG+- und Landeszielzuordnung nur für tatsächlich berührte Ziele, jeweils mit Richtung, Wirkpfad und Unsicherheit. Ein Mapping ist keine festgestellte Wirkung.
5. Pro materiellem Wirkpfad: Ausgangslage, Gegenfaktum, Umsetzungsakteure, Bedingungen, mögliche Indikatoren, Risiken, Nichtkompensationsfragen sowie ausdrücklich fehlende Daten.
6. Drei bis sieben zentrale, besonders entscheidungsrelevante Wirkungspfade als verständliche Übersicht. Diese Auswahl ersetzt nicht die vollständige Akte.

## Nicht zulässig

- Keine Zahlen, Zurechnungsfaktoren, Evidenz oder Wirkungen erfinden.
- Keine Partei-, Personen- oder Regierungsbewertung und keine Rangliste erzeugen.
- Keine spätere Wirkung als schon eingetreten darstellen.
- Keine Quellen außerhalb des Pakets als Beleg für Programmzusagen verwenden. Zusätzliche Evidenz darf ausschließlich als klar bezeichnete Rechercheanforderung oder Datenlücke erscheinen.
- Keine lokalen Pfade, Zugangsdaten oder redaktionellen Arbeitsvermerke in die Rückgabe aufnehmen.

## Rückgabe

Gib ein ZIP mit \`manifest.json\`, den zwölf JSON-Dateien in \`results/\` und \`batch-summary.md\` zurück. Die Rückgabe muss ausschließlich strukturierte, quellengestützte Inhalte enthalten. Fehlende Grundlagen sind als \`DATA_GAP\` zu markieren.
`;
}

function commitmentSchema() {
  return {
    schema_version: "1.0.0",
    source_key: "string",
    source_hash: "sha256 hex",
    commitments: [{
      commitment_key: "lowercase-kebab-case unique key",
      title: "short neutral title",
      commitment_text: "source-bound commitment",
      source_location: { page: "PDF page or web section", section: "optional heading" },
      policy_domain: "string",
      implementation_level: "LAND | FEDERAL | EU | MULTI_LEVEL | UNCLEAR",
      temporal_scope: "string or null",
      implementation_conditions: ["string"],
      data_gaps: ["string"]
    }]
  };
}

function programmeReviewSchema() {
  return {
    schema_version: "1.0.0",
    source_key: "string",
    source_hash: "sha256 hex",
    review_status: "COMPLETE | PARTIAL | DATA_GAP",
    plain_language_summary: "string",
    programme_profile: {
      declared_objectives: ["string"],
      material_policy_domains: ["string"],
      implementation_boundary: "string"
    },
    material_commitments: [{
      commitment_key: "must match commitment register",
      decision_or_measure: "string",
      intended_change: "string",
      affected_groups: ["string"],
      responsible_actors: ["string"],
      impact_potential: [{
        path_id: "string",
        mechanism: "string",
        expected_state_change: "string",
        baseline_required: "string",
        counterfactual_required: "string",
        implementation_conditions: ["string"],
        indicators: ["string"],
        evidence_status: "SUPPORTED | LIMITED | DATA_GAP"
      }],
      impact_risks: [{
        risk: "string",
        affected_groups_or_goods: ["string"],
        trigger_or_condition: "string",
        evidence_status: "SUPPORTED | LIMITED | DATA_GAP"
      }],
      normative_mapping: {
        sdgs: [{ id: "SDG number", direction: "POSITIVE_POTENTIAL | NEGATIVE_RISK | MIXED | OPEN", rationale: "string" }],
        sdg_plus: [{ id: "string", direction: "POSITIVE_POTENTIAL | NEGATIVE_RISK | MIXED | OPEN", rationale: "string" }],
        state_target_ids: ["string"],
        human: ["string"],
        planet: ["string"],
        democracy: ["string"]
      },
      non_compensable_boundaries: [{ concern: "string", status: "NONE_IDENTIFIED | REVIEW_REQUIRED | DATA_GAP", rationale: "string" }],
      calculation_requirements: [{ outcome: "string", baseline: "string", counterfactual: "string", required_operands: ["string"], possible_indicator: "string", data_gap: "string or null" }],
      source_refs: ["source key and location"],
      data_gaps: ["string"]
    }],
    cross_cutting_patterns: [{ pattern: "string", affected_commitment_keys: ["string"], rationale: "string" }],
    central_impact_paths: ["path IDs from material commitments"],
    provenance: { reference_snapshot_id: "string", reviewed_at: "ISO 8601" }
  };
}

async function main() {
  const zip = new JSZip();
  const sourceFiles: PackagedSource[] = [];

  for (const programme of saxonyAnhaltElectionProgrammes) {
    const bytes = programme.downloadUrl
      ? await downloadPdf(programme.downloadUrl)
      : await downloadWebSource(programme.canonicalUrl);
    const extension = programme.sourceFormat === "PDF" ? "pdf" : "txt";
    const filename = `sources/${programme.sourceKey}.${extension}`;
    const source: PackagedSource = {
      source_key: programme.sourceKey,
      party: programme.party,
      title: programme.title,
      canonical_url: programme.canonicalUrl,
      document_url: programme.downloadUrl ?? programme.canonicalUrl,
      source_format: programme.sourceFormat === "PDF" ? "PDF" : "TEXT",
      document_status: programme.documentStatus,
      decision_date: programme.decisionDate,
      retrieved_at: new Date().toISOString(),
      sha256: createHash("sha256").update(bytes).digest("hex"),
      byte_length: bytes.byteLength,
      filename
    };
    sourceFiles.push(source);
    zip.file(filename, bytes, { binary: true, compression: "DEFLATE" });
    zip.file(`sources/${programme.sourceKey}.source.json`, stableJson({ ...source, note: programme.note }));
  }

  const manifestBase = {
    schema_version: "1.0.0",
    batch_code: batchCode,
    review_type: "STATE_ELECTION_PROGRAMME_FULL_REVIEW",
    jurisdiction: "Sachsen-Anhalt",
    election_date: "2026-09-06",
    created_at: new Date().toISOString(),
    source_count: sourceFiles.length,
    sources: sourceFiles,
    reference_snapshot_id: (referenceSnapshot as { snapshot_id?: string }).snapshot_id ?? "WOEK_REFERENCE_SNAPSHOT",
    state_target_register: "references/sachsen-anhalt-target-register.json"
  };
  const manifest = { ...manifestBase, package_hash: sha256(manifestBase) };
  assertExternalReviewSafe(manifest, "sachsen-anhalt-programme-review");

  zip.file("manifest.json", stableJson(manifest));
  zip.file("BATCH.md", reviewInstructions());
  zip.file("schemas/commitment-register.schema.json", stableJson(commitmentSchema()));
  zip.file("schemas/programme-review.schema.json", stableJson(programmeReviewSchema()));
  zip.file("references/woek-reference-snapshot.json", stableJson(referenceSnapshot));
  zip.file("references/sachsen-anhalt-target-register.json", stableJson(stateTargets));

  const archive = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 9 } });
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, archive);
  console.log(JSON.stringify({ output: outputPath, batch_code: batchCode, sources: sourceFiles.length, package_hash: manifest.package_hash }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Wahlprogramm-Paket konnte nicht erstellt werden.");
  process.exit(1);
});
