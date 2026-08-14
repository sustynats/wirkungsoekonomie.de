import JSZip from "jszip";
import { assertExternalReviewSafe, stableJson } from "@/lib/review/privacy";
import { reviewBatchPackageSchema, type ReviewBatchPackage } from "@/lib/review/contracts";

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
`;
}

export async function createReviewZip(batch: ReviewBatchPackage) {
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

  for (const casePackage of parsed.cases) {
    const folder = zip.folder(`cases/${casePackage.case_id}`);
    if (!folder) throw new Error("Could not create review case folder.");
    folder.file("case-package.json", stableJson(casePackage));
    folder.file("README.md", `# ${casePackage.case_title}\n\nReview type: ${casePackage.review_type}\n\nPackage hash: ${casePackage.package_hash}\n`);
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
