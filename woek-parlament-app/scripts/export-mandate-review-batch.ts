#!/usr/bin/env tsx

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { politicalSourceCatalog } from "@/lib/commitments/source-catalog";
import { assertExternalReviewSafe, sha256, stableJson } from "@/lib/review/privacy";
import referenceSnapshot from "@/data/woek-reference-snapshot.json";

const outputRoot = path.resolve(process.cwd(), ".local/external-review/mandate");
const batchCode = process.argv.find((argument) => argument.startsWith("--batch-code="))?.slice("--batch-code=".length)
  ?? `WOEK-MANDAT-REVIEW-${new Date().getUTCFullYear()}-0001`;
const maximumAssetBytes = 12 * 1024 * 1024;

type SourceAsset = {
  source_key: string;
  source_type: "ELECTION_PROGRAM" | "COALITION_AGREEMENT";
  actor: string;
  title: string;
  canonical_url: string;
  download_asset_url: string;
  document_date: string | null;
  sha256: string;
  filename: string;
  byte_length: number;
};

async function downloadPdf(url: string) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "user-agent": "Wirkungsportal-Source-Review/1.0 (+https://parlament.wirkungsoekonomie.de)" },
    signal: AbortSignal.timeout(60_000)
  });
  if (!response.ok) throw new Error(`Could not fetch an official source (${response.status}).`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength === 0 || bytes.byteLength > maximumAssetBytes) throw new Error("An official source asset has an invalid size.");
  const signature = new TextDecoder().decode(bytes.slice(0, 5));
  if (signature !== "%PDF-") throw new Error("An official source asset is not a PDF.");
  return bytes;
}

function readme(sourceCount: number) {
  return `# Mandat & Praxis – Quellenreview ${batchCode}

Dieses Paket enthält ${sourceCount} amtliche bzw. primäre Dokumente: die Wahlprogramme der im Bundestag vertretenen Parteien zur Bundestagswahl 2025 sowie den Koalitionsvertrag der laufenden Bundesregierung.

## Zweck dieses ersten Review-Schritts

1. Konkrete, prüfbare Zusagen mit genauer Fundstelle aus den Quellen strukturieren.
2. Zusagen nach Politikfeld bündeln und offensichtliche Mehrdeutigkeiten markieren.
3. Für jede Zusage benennen, welche Daten, Wirkpfade, Gegenfaktumfragen und WÖk-Referenzen für einen späteren Wirkungscheck nötig sind.

Der nachfolgende Wirkungscheck ist ein separater Schritt. Er verbindet nur die dafür relevanten Zusagen mit amtlichen finalen Bundestagsfassungen und belastbaren Evidenzquellen. Eine Umsetzung einer Zusage ist keine positive Wirkung per se.

## Ergebnisformat

Erzeuge je Quelldokument eine Datei:

\`results/<source_key>/commitment-register.json\`

mit dem Schema aus \`schemas/commitment-register.schema.json\`. Jeder Eintrag benötigt die exakte Fundstelle. Fehlende Informationen müssen als Datenlücke ausgewiesen werden; keine Zahlen, Wirkungen oder Zurechnungen schätzen.

Zusätzlich:

\`batch-summary.md\`

mit Quellenkonflikten, Mehrdeutigkeiten, wiederkehrenden Zusagetypen und dem Bedarf für den nachfolgenden Wirkungscheck.

## Sicherheits- und Methodenregeln

- Nur die gelieferten Quellen oder klar markierte Datenlücken verwenden.
- Keine lokalen Pfade, Zugangsdaten oder interne Informationen in Ergebnisse schreiben.
- Wirkungspotenzial, beobachtete Wirkung und Wirkungsrisiko klar unterscheiden.
- Partei, Fraktion oder Regierungsstatus sind keine Eingaben in die WÖk-Bewertung.
- Keine Personenbewertung und keine aggregierte Partei- oder Regierungsnote erzeugen.
`;
}

async function main() {
  const zip = new JSZip();
  const assets: SourceAsset[] = [];
  for (const source of politicalSourceCatalog) {
    let bytes: Uint8Array;
    try {
      bytes = await downloadPdf(source.downloadAssetUrl);
    } catch (error) {
      throw new Error(`Source ${source.sourceKey} could not be packaged: ${error instanceof Error ? error.message : "unexpected download error"}`);
    }
    const filename = `${source.sourceKey}.pdf`;
    const hash = createHash("sha256").update(bytes).digest("hex");
    const asset: SourceAsset = {
      source_key: source.sourceKey,
      source_type: source.sourceType,
      actor: source.actor,
      title: source.title,
      canonical_url: source.canonicalUrl,
      download_asset_url: source.downloadAssetUrl,
      document_date: source.documentDate,
      sha256: hash,
      filename: `sources/${filename}`,
      byte_length: bytes.byteLength
    };
    assets.push(asset);
    zip.file(asset.filename, bytes, { binary: true, compression: "STORE" });
    zip.file(`sources/${source.sourceKey}.source.json`, stableJson(asset));
  }

  const manifestWithoutHash = {
    schema_version: "1.0.0",
    batch_code: batchCode,
    review_type: "MANDATE_SOURCE_STRUCTURING",
    created_at: new Date().toISOString(),
    source_count: assets.length,
    sources: assets,
    woek_reference_snapshot: referenceSnapshot
  };
  const manifest = { ...manifestWithoutHash, package_hash: sha256(manifestWithoutHash) };
  assertExternalReviewSafe(manifest, "mandate-review-package");
  zip.file("manifest.json", stableJson(manifest));
  zip.file("BATCH.md", readme(assets.length));
  zip.file("woek/reference-snapshot.json", stableJson(referenceSnapshot));
  zip.file("schemas/commitment-register.schema.json", stableJson({
    schema_version: "1.0.0",
    source_key: "string",
    source_hash: "sha256 hex",
    extracted_at: "ISO 8601 timestamp",
    commitments: [{
      commitment_key: "lowercase-kebab-case unique key",
      title: "short neutral title",
      commitment_text: "exact or faithfully bounded commitment text",
      policy_domain: "nullable string",
      source_location: { page: "string or section/anchor" },
      temporal_scope: "nullable string"
    }]
  }));

  await mkdir(outputRoot, { recursive: true });
  const archive = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 9 } });
  const outputPath = path.join(outputRoot, `${batchCode.toLowerCase()}.zip`);
  await writeFile(outputPath, archive);
  console.log(JSON.stringify({ batch_code: batchCode, output: outputPath, source_count: assets.length, package_hash: manifest.package_hash }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not create mandate review package.");
  process.exit(1);
});
