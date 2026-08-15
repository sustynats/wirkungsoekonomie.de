#!/usr/bin/env tsx

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { normativeReferenceRegistry } from "@/lib/normative/reference-registry";
import { assertExternalReviewSafe, sha256, stableJson } from "@/lib/review/privacy";

type CliArguments = {
  source: string;
  results: string;
  output: string;
};

function argument(name: string) {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3);
}

function requiredArguments(): CliArguments {
  const source = argument("source");
  const results = argument("results");
  const output = argument("output");
  if (!source || !results || !output) {
    throw new Error("Usage: export-final-historical-review --source=<review-package.zip> --results=<pre-review-results.zip> --output=<output.zip>");
  }
  return { source, results, output };
}

function finalInstructions() {
  return `# Abschluss-Review: historische Wirkungschecks

## Ziel

Dieses Paket enthält zwölf amtlich abgegrenzte historische Entscheidungen sowie die bereits vorgenommene strukturierte Vorprüfung. Der Auftrag ist **keine** freie Gesamtmeinung. Prüfe je Fall, ob ein belastbarer, publikationsreifer WÖk-Rückblick vorbereitet werden kann – oder präzise, welche fachliche Grundlage noch fehlt.

## Verbindliche Entscheidungsgates

Eine Veröffentlichung als fertiger WÖk-Rückblick darf nur vorgeschlagen werden, wenn sämtliche zutreffenden Gates nachweisbar erfüllt sind:

1. **Entscheidungsgrundlage:** finale Fassung, Beschlussstatus, Datum und Abstimmung sind amtlich belegt.
2. **Ex ante:** Es werden ausschließlich Informationen verwendet, die zum Entscheidungszeitpunkt verfügbar waren.
3. **Ex post:** Beobachtungen, Evaluationen und Zeitreihen sind als spätere Quellen getrennt dokumentiert.
4. **Wirkungslogik:** Wirkpfad, Gegenfaktum, Reichweite und Zurechnung sind belegt oder die Grenze ist ausdrücklich ausgewiesen.
5. **Berechnung:** Für quantitative Aussagen sind Eingangswerte, Einheit, Formel/Regel, Quellen und Unsicherheit nachvollziehbar. Fehlende Werte bleiben DATA_GAP oder NOT_ROBUSTLY_QUANTIFIABLE.
6. **Normativer Rahmen:** Verwendete WÖk-/SDG-/SDG+-Referenzen sind im mitgelieferten Snapshot als führend und vollständig verifizierbar. Bei unvollständigem Snapshot keine endgültige WÖk-Score- oder Präferenzbehauptung.
7. **Nichtkompensation:** Eine mögliche Grenzverletzung wird nicht durch positive Werte anderer Felder verrechnet.
8. **Vollständiger Referenzrahmen:** Jede materielle SDG-, SDG+- oder verfassungs-/staatszielbezogene Einordnung wird als normative_mapping.tile_mappings ausgegeben. Ausschließlich die IDs aus normative_reference_catalog des jeweiligen Fallpakets sind zulässig. SDG+ ist von Staatszielen, Grundrechten und Schutzaufträgen getrennt. Tierschutz und Tierwohl sind ein eigenständiger Prüfbereich neben Biodiversität.

## Fachliche Regeln

- Tatsächliche Entscheidung, Wirkungspotenzial, Wirkungsrisiko und beobachtete Wirkung sprachlich und strukturell trennen.
- Ex ante niemals mit späterem Wissen begründen. Ex post niemals so schreiben, als sei eine nicht gewählte Alternative beobachtet worden.
- Keine Zahlen, Attributionen, Wahrscheinlichkeiten, Gewichtungen oder Skalenwerte erfinden.
- Keine Partei-, Fraktions- oder Personenbewertung erzeugen. Parteizugehörigkeit, Fraktionsstatus oder personenbezogene Merkmale dürfen die fachliche Einordnung nicht beeinflussen.
- Nur fundierte, konkrete Aussagen; bei nicht auflösbarer Kausalität: NO_ROBUST_RETROSPECTIVE_ASSESSMENT.

## Zusätzliche Quellen

Die ursprünglichen Fallpakete enthalten nur ihre bereits gesicherten Quellen. Werden für ein Gate weitere amtliche Statistik, amtliche Evaluation oder wissenschaftliche Primärquelle benötigt, diese **nicht als bereits verifiziert behandeln**. Stattdessen unter retrospective.source_candidates vollständig vorschlagen:

source_id, Titel, Institution, kanonische HTTPS-URL, Veröffentlichungsdatum, Abrufdatum, Quellentyp, genaue Fundstelle, zeitliche Klasse (AVAILABLE_AT_DECISION_TIME oder PUBLISHED_AFTER_DECISION) und wofür die Quelle benötigt wird.

## Rückgabeformat

Für jeden Fall eine aktualisierte Datei:

case-results/<case-id>/review-result.json

Nutze ausschließlich die Felder und Datentypen der beiliegenden review-result.final.template.json. Übernimm case_id, review_type, input_package_hash und woek_reference_snapshot aus dem jeweiligen Fallpaket unverändert.

Als review_status ist nur zulässig: COMPLETE, PARTIAL, DATA_GAP, SOURCE_CONFLICT oder METHOD_REVIEW_REQUIRED.

In retrospective.publication_readiness verwende genau einen Status:

- READY_FOR_EDITORIAL_APPROVAL – alle oben zutreffenden Gates belegt; noch keine automatische Veröffentlichung.
- EVIDENCE_REQUIRED – mindestens ein entscheidungstragender Nachweis fehlt.
- CALCULATION_REQUIRED – belegte Inputs liegen vor, müssen aber erst durch die Rechenengine ausgeführt werden.
- METHOD_REVIEW_REQUIRED – der geltende WÖk-Referenzrahmen oder eine Regel reicht nicht aus.
- NOT_YET_ASSESSABLE – seit der Entscheidung liegt noch keine belastbare Beobachtungsbasis vor.

Eine historische Ergebnis-Kategorie (DECISION_CONFIRMED, DECISION_MOSTLY_CONFIRMED, JUSTIFIABLE_AT_TIME_NOT_CONFIRMED_EX_POST, ALTERNATIVE_PREFERABLE, NO_ROBUST_RETROSPECTIVE_ASSESSMENT) gehört in retrospective.historical_assessment_status und nur dann, wenn ihre begründenden Evidenz- und Gegenfaktum-Gates erfüllt sind.

Zusätzlich eine knappe batch-summary.md ablegen: Fälle je Freigabestatus, fehlende Quellen, Berechnungsbedarf, Methodenfragen und Fälle, die als erste redaktionelle Freigabe geeignet sind.

Keine lokalen Pfade, Zugangsdaten, interne Prozessinformationen oder Namen externer Analysewerkzeuge in die Rückgabe schreiben.
`;
}

function resultTemplate() {
  return {
    schema_version: "1.0.0",
    review_id: "FINAL-REVIEW-<batch>-<case>",
    case_id: "<case_id_from_case-package>",
    review_type: "FULL_REVIEW",
    input_package_hash: "<package_hash_from_case-package>",
    woek_reference_snapshot: {},
    previous_review_id: "<previous_review_id_or_null>",
    analysis_version: "1.1.0",
    generated_at: "<ISO-8601-datetime>",
    review_status: "PARTIAL",
    source_completeness: {},
    decision: {},
    ex_ante: {},
    ex_post: {},
    impact_paths: [],
    impact_domains: [],
    normative_mapping: {
      reference_frame: "SDGs, SDG+ und gegebenenfalls Verfassungs- und Staatszielrahmen",
      mapping_status: "PROVISIONAL",
      tile_mappings: [{
        id: "<ID from normative_reference_catalog>",
        framework: "<SDG | SDG_PLUS | CONSTITUTIONAL_ANCHOR>",
        direction: "<POSITIVE_POTENTIAL | NEGATIVE_RISK | AMBIVALENT | EVIDENCE_OPEN | OBSERVED_POSITIVE | OBSERVED_NEGATIVE>",
        evidence_status: "<evidence status>",
        rationale: "<case-specific, source-based rationale>",
        impact_path_refs: ["<impact path ID>"],
        source_refs: ["<source_id from source_manifest>"]
      }]
    },
    calculation_requirements: [],
    risks: [],
    non_compensable_boundaries: [],
    counterarguments: [],
    counterfactuals: [],
    data_gaps: [],
    source_conflicts: [],
    retrospective: {
      historical_assessment_status: "NO_ROBUST_RETROSPECTIVE_ASSESSMENT",
      publication_readiness: "EVIDENCE_REQUIRED",
      publication_blockers: [],
      source_candidates: [],
      reasoning_components: [],
      learning_points: []
    },
    cross_case_links: [],
    provenance: {
      source_refs_used: [],
      review_generated_at: "<ISO-8601-datetime>"
    }
  };
}

async function copyFiles(from: JSZip, to: JSZip, prefix: string) {
  const entries = Object.values(from.files).filter((entry) => !entry.dir);
  for (const entry of entries) {
    to.file(`${prefix}${entry.name}`, await entry.async("uint8array"), { binary: true, compression: "DEFLATE" });
  }
}

/**
 * The original batch predates the finite, public normative-reference catalog.
 * Enrich only the review copy: its historical input_package_hash remains the
 * hash of the original, immutable case package so a returned review can be
 * matched safely with the imported source version.
 */
async function copyCaseInputWithNormativeCatalog(from: JSZip, to: JSZip) {
  const entries = Object.values(from.files).filter((entry) => !entry.dir);
  for (const entry of entries) {
    if (entry.name.endsWith("/case-package.json")) {
      const casePackage = JSON.parse(await entry.async("text")) as Record<string, unknown>;
      const enriched = {
        ...casePackage,
        normative_reference_catalog: normativeReferenceRegistry
      };
      assertExternalReviewSafe(enriched, `case-input-${String(casePackage.case_id ?? "unknown")}`);
      to.file(`case-input/${entry.name}`, stableJson(enriched));
      continue;
    }
    const content = await entry.async("uint8array");
    to.file(`case-input/${entry.name}`, content, { binary: true, compression: "DEFLATE" });
  }
}

async function main() {
  const args = requiredArguments();
  const [sourceBytes, resultBytes] = await Promise.all([readFile(args.source), readFile(args.results)]);
  const [sourceZip, resultZip] = await Promise.all([JSZip.loadAsync(sourceBytes), JSZip.loadAsync(resultBytes)]);
  const sourceManifest = JSON.parse(await sourceZip.file("manifest.json")?.async("text") ?? "null") as { batch_code?: unknown; case_count?: unknown; package_hash?: unknown } | null;
  if (!sourceManifest || typeof sourceManifest.batch_code !== "string" || typeof sourceManifest.case_count !== "number") {
    throw new Error("The source package has no valid manifest.");
  }

  const output = new JSZip();
  const manifestWithoutHash = {
    schema_version: "1.0.0",
    review_type: "FINAL_HISTORICAL_PUBLICATION_REVIEW",
    origin_batch_code: sourceManifest.batch_code,
    case_count: sourceManifest.case_count,
    created_at: new Date().toISOString(),
    source_package_hash: sourceManifest.package_hash ?? null,
    source_archive_hash: sha256(new Uint8Array(sourceBytes)),
    prior_results_archive_hash: sha256(new Uint8Array(resultBytes))
  };
  const manifest = { ...manifestWithoutHash, package_hash: sha256(manifestWithoutHash) };
  assertExternalReviewSafe(manifest, "final-review-manifest");
  output.file("manifest.json", stableJson(manifest));
  output.file("FINAL_REVIEW_INSTRUCTIONS.md", finalInstructions());
  output.file("NORMATIVE_MAPPING_INSTRUCTIONS.md", await readFile("docs/parlament/review/NORMATIVE_MAPPING_SUPPLEMENT.md", "utf8"));
  output.file("normative-reference-catalog.json", stableJson(normativeReferenceRegistry));
  output.file("review-result.final.template.json", stableJson(resultTemplate()));
  await copyCaseInputWithNormativeCatalog(sourceZip, output);
  await copyFiles(resultZip, output, "prior-review/");

  const archive = await output.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 9 } });
  await mkdir(path.dirname(path.resolve(args.output)), { recursive: true });
  await writeFile(path.resolve(args.output), archive);
  console.log(JSON.stringify({ output: path.resolve(args.output), cases: sourceManifest.case_count, package_hash: manifest.package_hash }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not create final review package.");
  process.exit(1);
});
