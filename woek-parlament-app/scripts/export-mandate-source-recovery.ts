#!/usr/bin/env tsx

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { assertExternalReviewSafe, stableJson } from "@/lib/review/privacy";

type Source = {
  source_key: string;
  title: string;
  publisher: string;
  document_date: string;
  canonical_url: string;
  file_name: string;
};

const sources: Source[] = [
  {
    source_key: "btw-2025-cdu-csu",
    title: "Politikwechsel für Deutschland – Wahlprogramm zur Bundestagswahl 2025",
    publisher: "CDU und CSU",
    document_date: "2025-01-01",
    canonical_url: "https://www.cdu.de/app/uploads/2025/01/km_btw_2025_wahlprogramm_langfassung_ansicht.pdf",
    file_name: "btw-2025-cdu-csu.pdf"
  },
  {
    source_key: "btw-2025-spd",
    title: "Mehr für Dich. Besser für Deutschland. – Regierungsprogramm 2025",
    publisher: "SPD",
    document_date: "2025-01-11",
    canonical_url: "https://www.spd.de/fileadmin/Dokumente/Beschluesse/Programm/SPD_Programm_bf.pdf",
    file_name: "btw-2025-spd.pdf"
  },
  {
    source_key: "btw-2025-gruene",
    title: "Zusammen wachsen – Regierungsprogramm zur Bundestagswahl 2025",
    publisher: "BÜNDNIS 90/DIE GRÜNEN",
    document_date: "2025-01-26",
    canonical_url: "https://cms.gruene.de/uploads/assets/20250318_Regierungsprogramm_DIGITAL_DINA5.pdf",
    file_name: "btw-2025-gruene.pdf"
  },
  {
    source_key: "btw-2025-afd",
    title: "Zeit für Deutschland – Wahlprogramm 2025",
    publisher: "Alternative für Deutschland",
    document_date: "2025-02-03",
    canonical_url: "https://www.afd.de/wp-content/uploads/2025/02/AfD_Bundestagswahlprogramm2025_web.pdf",
    file_name: "btw-2025-afd.pdf"
  },
  {
    source_key: "btw-2025-linke",
    title: "Alle wollen regieren. Wir wollen verändern. – Wahlprogramm 2025",
    publisher: "Die Linke",
    document_date: "2025-01-18",
    canonical_url: "https://www.die-linke.de/fileadmin/user_upload/Wahlprogramm_Langfassung_Linke-BTW25_01.pdf",
    file_name: "btw-2025-linke.pdf"
  },
  {
    source_key: "btw-2025-ssw",
    title: "Deine Stimme für den Norden – Wahlprogramm zur Bundestagswahl 2025",
    publisher: "SSW",
    document_date: "2025-01-11",
    canonical_url: "https://www.ssw.de/fileadmin/user_upload/daten/aktuelles/2025/BTW25/SSW-Wahlprogramm_BTW_2025.pdf",
    file_name: "btw-2025-ssw.pdf"
  },
  {
    source_key: "coalition-2025-cdu-csu-spd",
    title: "Verantwortung für Deutschland – Koalitionsvertrag für die 21. Legislaturperiode",
    publisher: "CDU, CSU und SPD",
    document_date: "2025-04-09",
    canonical_url: "https://www.spd.de/fileadmin/Dokumente/Koalitionsvertrag2025_bf.pdf",
    file_name: "coalition-2025-cdu-csu-spd.pdf"
  }
];

function sha256(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

function commitmentTemplate(source: Source) {
  return {
    schema_version: "1.0.0",
    source_key: source.source_key,
    source_title: source.title,
    commitments: [
      {
        commitment_key: "<eindeutiger-lowercase-kebab-case-schluessel>",
        source_page: "<physische-PDF-Seite>",
        source_location: "<Abschnitt-oder-Zeile>",
        exact_text: "<ausschliesslich-quellengestuetzter-Zusagewortlaut>",
        commitment_type: "<gesetz|foerderung|ziel|pruefung|verbot|fortfuehrung|andere>",
        temporal_scope: null,
        policy_domains: [],
        implementation_level: "<bund|eu|laender-kommunen|mehrere|unklar>",
        dependencies: [],
        source_ref: source.source_key
      }
    ]
  };
}

function instructions() {
  return `# Arbeitsauftrag: vollständiges Zusageregister

Dieses Paket enthält die sieben amtlichen Primärdokumente für Wahlprogramme und Koalitionsvertrag der Bundestagswahl 2025.

## Aufgabe

Erstelle je Dokument ein vollständiges commitment-register.json. Erfasst werden konkrete politische Zusagen: Maßnahmen, Rechts- und Institutionsänderungen, Förderungen, Finanzierungszusagen, Zielwerte, Prüfungen, Evaluationen, Verbote, Aufhebungen, Fortführungen und konkrete internationale Initiativen.

Nicht erfassen: reine Rhetorik, Diagnosen, Rückblicke oder nicht operationalisierte Wertformulierungen. Mehrteilige Zusagen nur dann trennen, wenn Sinn und Bedingungen erhalten bleiben.

## Verbindliche Regeln

- Ausschließlich die sieben mitgelieferten Primärdokumente nutzen.
- Jede Zusage mit exakter physischer PDF-Seite und möglichst genauer Fundstelle ausweisen.
- Keine Wirkungsbewertung, SDG-Zuordnung, politische Präferenz, Gewichtung oder Zahl ergänzen.
- Eine Quelle außerhalb des Dokuments nur als Datenlücke benennen, nicht als Quelle der Zusage verwenden.
- Die mitgelieferten JSON-Vorlagen sind der Ausgabevertrag.

## Rückgabe

Gib ein ZIP mit sieben Dateien zurück:

commitment-registers/<source_key>/commitment-register.json

Zusätzlich: batch-summary.md mit Zahl der Zusagen je Quelle, Abgrenzungsregeln und verbleibenden Mehrdeutigkeiten.
`;
}

async function download(source: Source) {
  const response = await fetch(source.canonical_url, {
    headers: { "user-agent": "Institut-fuer-Wirkungsoekonomie-Quellenarchiv/1.0" },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000)
  });
  if (!response.ok) throw new Error(`${source.source_key}: HTTP ${response.status}.`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength < 10_000 || bytes.byteLength > 20_000_000) {
    throw new Error(`${source.source_key}: unexpected document size.`);
  }
  if (String.fromCharCode(...bytes.slice(0, 4)) !== "%PDF") {
    throw new Error(`${source.source_key}: source is not a PDF.`);
  }
  return bytes;
}

async function main() {
  const outputPath = process.argv.find((value) => value.startsWith("--output="))?.slice(9);
  if (!outputPath) throw new Error("Usage: export-mandate-source-recovery --output=<archive.zip>");

  const downloaded = await Promise.all(sources.map(async (source) => ({ source, bytes: await download(source) })));
  const sourceManifest = downloaded.map(({ source, bytes }) => ({
    ...source,
    retrieved_at: new Date().toISOString(),
    sha256: sha256(bytes),
    size_bytes: bytes.byteLength
  }));
  const manifestBase = {
    package_id: "WOEK-MANDAT-QUELLENPAKET-2026-08-15",
    source_count: sourceManifest.length,
    sources: sourceManifest
  };
  const manifest = { ...manifestBase, package_hash: sha256(new TextEncoder().encode(stableJson(manifestBase))) };
  assertExternalReviewSafe(manifest, "mandate-source-manifest");

  const archive = new JSZip();
  archive.file("manifest.json", stableJson(manifest));
  archive.file("README.md", instructions());
  for (const { source, bytes } of downloaded) {
    archive.file(`sources/${source.file_name}`, bytes, { binary: true, compression: "DEFLATE" });
    archive.file(`commitment-registers/${source.source_key}/commitment-register.template.json`, stableJson(commitmentTemplate(source)));
  }
  const payload = await archive.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 9 } });
  await mkdir(path.dirname(path.resolve(outputPath)), { recursive: true });
  await writeFile(path.resolve(outputPath), payload);
  console.log(JSON.stringify({ output: path.resolve(outputPath), sources: sourceManifest.length, package_hash: manifest.package_hash }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not create mandate source package.");
  process.exit(1);
});
