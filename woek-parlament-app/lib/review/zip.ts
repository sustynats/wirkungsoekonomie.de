import JSZip from "jszip";
import { assertExternalReviewSafe, stableJson } from "@/lib/review/privacy";
import { reviewBatchPackageSchema, type ReviewBatchPackage } from "@/lib/review/contracts";
import { supabaseRest } from "@/lib/database/supabase-admin";

function batchReadme(batch: ReviewBatchPackage) {
  return `# Wirkungsreview ${batch.batch_code}

Dieser Export enthält ${batch.cases.length} abgegrenzte Fallpakete für eine strukturierte externe Fachprüfung.

## Arbeitsregel

- Nur die im jeweiligen Fallpaket genannten Quellen verwenden oder eine Datenlücke ausweisen.
- Ex-ante- und Ex-post-Informationen strikt trennen.
- Fehlende Zahlen nicht schätzen oder als produktive Rechenwerte ausgeben.
- Das Ergebnis je Fall als \`review-result.json\` im vereinbarten Schema zurückgeben.
- Keine Zugangsdaten, lokalen Pfade oder internen Informationen in das Ergebnis aufnehmen.

Jedes Paket besitzt einen Hash. Das Ergebnis muss diesen Hash als \`input_package_hash\` wiedergeben.

## Rückgabe

- Pro Fall eine Datei unter \`case-results/<case-id>/review-result.json\` ablegen.
- Die vollständige Feldstruktur steht in \`review-result.template.json\`.
- \`REVIEW_INSTRUCTIONS.md\` beschreibt die fachlichen und technischen Übergaberegeln.
- Zusätzlich eine knappe \`batch-summary.md\` mit erledigten Fällen, Datenlücken, Quellenkonflikten und offenen Methodenfragen ablegen.
`;
}

function reviewInstructions() {
  return `# Fachlicher Prüfauftrag

Die Fallpakete enthalten amtliche Entscheidungsdaten, ein Quellenmanifest und nur die für den jeweiligen Prüfauftrag erforderlichen Originalauszüge.

## Verbindliche Arbeitsweise

1. Der je Fall enthaltene \`review_request\` bestimmt, ob eine Ex-ante-Prüfung oder ein historischer Rückblick verlangt wird. Bei einer Ex-ante-Prüfung sind ausschließlich Wirkungspotenziale, Wirkungsrisiken und veränderbare Stellschrauben zu analysieren.
2. Nur \`source_id\`-Werte aus dem jeweiligen \`source_manifest\` referenzieren. Fehlt eine Quelle oder ein Wert, als \`DATA_GAP\` ausweisen.
3. Keine Zahlen, Attributionen, Wahrscheinlichkeiten, Gewichte oder Wirkungsscores erfinden.
4. Wirkpfade, Gegenfaktum, Datenbedarf, Risiken und normative Zuordnungen strukturiert liefern. Rechenanforderungen benennen, aber keine freie Rechenprosa als produktives Ergebnis ausgeben.
5. Eine rückblickende Kategorie nur mit den dokumentierten Wirkpfaden, Quellen, Evidenzgrenzen und Nichtkompensationsfragen begründen.
6. Für jede materielle normativ berührte Dimension \`normative_mapping.tile_mappings\` verwenden. Ausschließlich IDs aus \`normative_reference_catalog\` des jeweiligen Fallpakets verwenden. SDG+, Staatsziele, Grundrechte und Schutzaufträge sind getrennte Ebenen. Tierschutz und Tierwohl sind eigenständig und nie als Biodiversität ausgeben.

## Ergebnisdateien

- Pro Fall: \`case-results/<case-id>/review-result.json\`
- Batchübersicht: \`batch-summary.md\`

Die JSON-Struktur ist in \`review-result.template.json\` vorgegeben. \`case_id\`, \`review_type\`, \`input_package_hash\` und \`woek_reference_snapshot\` müssen aus dem jeweiligen Fallpaket übernommen werden.
`;
}

type StoredSourceText = {
  id: string;
  normalized_text: string | null;
  normalized_text_truncated: boolean;
};

/**
 * The review JSON stays compact; complete official texts are supplied once as
 * searchable sidecar files. This lets an external reviewer inspect a whole
 * bill without putting a million characters into the prompt-sized excerpts.
 */
async function addOfficialSourceTexts(folder: JSZip, casePackage: ReviewBatchPackage["cases"][number]) {
  const entries: Array<{ source_id: string; path: string; character_count: number; truncated: boolean }> = [];
  for (const source of casePackage.source_manifest) {
    const rows = await supabaseRest<StoredSourceText[]>(
      `parliament.document_versions?document_id=eq.${encodeURIComponent(source.source_id)}&select=id,normalized_text,normalized_text_truncated&order=retrieved_at.desc&limit=1`
    );
    const version = rows[0];
    if (!version?.normalized_text) continue;
    const filename = `documents/${source.source_id}.txt`;
    folder.file(filename, version.normalized_text);
    entries.push({
      source_id: source.source_id,
      path: filename,
      character_count: version.normalized_text.length,
      truncated: version.normalized_text_truncated
    });
  }
  folder.file("source-text-manifest.json", stableJson({
    note: "Diese Dateien sind amtliche Volltexte bzw. gespeicherte amtliche Textfassungen. Die source_id verweist auf das Quellenmanifest im case-package.json.",
    documents: entries
  }));
}

function reviewResultTemplate() {
  return {
    schema_version: "1.0.0",
    review_id: "REVIEW-<batch>-<case>",
    case_id: "<case_id_from_case-package>",
    review_type: "FULL_REVIEW",
    input_package_hash: "<package_hash_from_case-package>",
    woek_reference_snapshot: {},
    previous_review_id: null,
    analysis_version: "1.0.0",
    generated_at: "<ISO-8601-datetime>",
    review_status: "COMPLETE",
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
    retrospective: {},
    cross_case_links: [],
    provenance: {
      source_refs_used: [],
      review_generated_at: "<ISO-8601-datetime>"
    }
  };
}

export async function createReviewZip(batch: ReviewBatchPackage, { includeOfficialSourceTexts = false }: { includeOfficialSourceTexts?: boolean } = {}) {
  const parsed = reviewBatchPackageSchema.parse(batch);
  assertExternalReviewSafe(parsed);

  const zip = new JSZip();
  zip.file("manifest.json", stableJson({
    schema_version: parsed.schema_version,
    batch_code: parsed.batch_code,
    review_type: parsed.review_type,
    created_at: parsed.created_at,
    package_hash: parsed.package_hash,
    case_count: parsed.cases.length
  }));
  zip.file("BATCH.md", batchReadme(parsed));
  zip.file("REVIEW_INSTRUCTIONS.md", reviewInstructions());
  zip.file("review-result.template.json", stableJson(reviewResultTemplate()));

  for (const casePackage of parsed.cases) {
    const folder = zip.folder(`cases/${casePackage.case_id}`);
    if (!folder) throw new Error("Could not create review case folder.");
    folder.file("case-package.json", stableJson(casePackage));
    folder.file("README.md", `# ${casePackage.case_title}\n\nReview type: ${casePackage.review_type}\n\nPackage hash: ${casePackage.package_hash}\n`);
    if (includeOfficialSourceTexts) await addOfficialSourceTexts(folder, casePackage);
  }

  const bytes = await zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 9 }
  });
  return {
    bytes,
    filename: `${parsed.batch_code.toLowerCase()}.zip`,
    contentType: "application/zip"
  };
}
