import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const sources = [
  ["btw-2025-cdu-csu", "Politikwechsel für Deutschland – Wahlprogramm zur Bundestagswahl 2025", "CDU und CSU", "2025-01-01", "https://www.cdu.de/app/uploads/2025/01/km_btw_2025_wahlprogramm_langfassung_ansicht.pdf", "btw-2025-cdu-csu.pdf"],
  ["btw-2025-spd", "Mehr für Dich. Besser für Deutschland. – Regierungsprogramm 2025", "SPD", "2025-01-11", "https://www.spd.de/fileadmin/Dokumente/Beschluesse/Programm/SPD_Programm_bf.pdf", "btw-2025-spd.pdf"],
  ["btw-2025-gruene", "Zusammen wachsen – Regierungsprogramm zur Bundestagswahl 2025", "BÜNDNIS 90/DIE GRÜNEN", "2025-01-26", "https://cms.gruene.de/uploads/assets/20250318_Regierungsprogramm_DIGITAL_DINA5.pdf", "btw-2025-gruene.pdf"],
  ["btw-2025-afd", "Zeit für Deutschland – Wahlprogramm 2025", "Alternative für Deutschland", "2025-02-03", "https://www.afd.de/wp-content/uploads/2025/02/AfD_Bundestagswahlprogramm2025_web.pdf", "btw-2025-afd.pdf"],
  ["btw-2025-linke", "Alle wollen regieren. Wir wollen verändern. – Wahlprogramm 2025", "Die Linke", "2025-01-18", "https://www.die-linke.de/fileadmin/user_upload/Wahlprogramm_Langfassung_Linke-BTW25_01.pdf", "btw-2025-linke.pdf"],
  ["btw-2025-ssw", "Deine Stimme für den Norden – Wahlprogramm zur Bundestagswahl 2025", "SSW", "2025-01-11", "https://www.ssw.de/fileadmin/user_upload/daten/aktuelles/2025/BTW25/SSW-Wahlprogramm_BTW_2025.pdf", "btw-2025-ssw.pdf"],
  ["coalition-2025-cdu-csu-spd", "Verantwortung für Deutschland – Koalitionsvertrag für die 21. Legislaturperiode", "CDU, CSU und SPD", "2025-04-09", "https://www.spd.de/fileadmin/Dokumente/Koalitionsvertrag2025_bf.pdf", "coalition-2025-cdu-csu-spd.pdf"]
].map(([source_key, title, publisher, document_date, canonical_url, file_name]) => ({ source_key, title, publisher, document_date, canonical_url, file_name }));

const output = process.argv.find((value) => value.startsWith("--output="))?.slice(9);
if (!output) throw new Error("Usage: node export-mandate-source-recovery.mjs --output=<directory>");

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const destination = path.resolve(output);
await mkdir(destination, { recursive: true });
await mkdir(path.join(destination, "sources"), { recursive: true });
await mkdir(path.join(destination, "commitment-registers"), { recursive: true });

const downloadedSources = [];
for (const source of sources) {
  const response = await fetch(source.canonical_url, {
    headers: { "user-agent": "Institut-fuer-Wirkungsoekonomie-Quellenarchiv/1.0" },
    redirect: "follow",
    signal: AbortSignal.timeout(30_000)
  });
  if (!response.ok) throw new Error(`${source.source_key}: HTTP ${response.status}`);
  const data = Buffer.from(await response.arrayBuffer());
  if (data.length < 10_000 || data.length > 20_000_000 || data.subarray(0, 4).toString("ascii") !== "%PDF") {
    throw new Error(`${source.source_key}: expected an official PDF.`);
  }
  await writeFile(path.join(destination, "sources", source.file_name), data);
  downloadedSources.push({ ...source, retrieved_at: new Date().toISOString(), sha256: sha256(data), size_bytes: data.length });
  const template = {
    schema_version: "1.0.0",
    source_key: source.source_key,
    source_title: source.title,
    commitments: [{
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
    }]
  };
  const registerPath = path.join(destination, "commitment-registers", source.source_key);
  await mkdir(registerPath, { recursive: true });
  await writeFile(path.join(registerPath, "commitment-register.template.json"), `${JSON.stringify(template, null, 2)}\n`);
}

const manifestBase = { package_id: "WOEK-MANDAT-QUELLENPAKET-2026-08-15", source_count: downloadedSources.length, sources: downloadedSources };
const manifest = { ...manifestBase, package_hash: sha256(JSON.stringify(manifestBase)) };
await writeFile(path.join(destination, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(path.join(destination, "README.md"), `# Vollständiges Primärquellenpaket: Wahlprogramme und Koalitionsvertrag\n\nDieses Paket enthält sieben amtliche Primärdokumente zur Bundestagswahl 2025 sowie eine Vorlage für das vollständige Zusageregister je Quelle.\n\n## Arbeitsauftrag\n\nFür jedes Dokument eine Datei commitment-registers/<source_key>/commitment-register.json erzeugen. Erfasst werden konkrete politische Zusagen: Maßnahmen, Rechts- und Institutionsänderungen, Förderungen, Finanzierungszusagen, Zielwerte, Prüfungen, Evaluationen, Verbote, Aufhebungen, Fortführungen und konkrete internationale Initiativen.\n\nNicht erfassen: reine Rhetorik, Diagnosen, Rückblicke oder nicht operationalisierte Wertformulierungen. Mehrteilige Zusagen nur trennen, wenn Sinn und Bedingungen erhalten bleiben.\n\n- Ausschließlich die sieben Primärdokumente nutzen.\n- Jede Zusage mit physischer PDF-Seite und möglichst genauer Fundstelle ausweisen.\n- Keine Wirkungsbewertung, SDG-Zuordnung, politische Präferenz, Gewichtung oder Zahl ergänzen.\n- Ausgabe zusätzlich: batch-summary.md mit Zusagezahl je Quelle, Abgrenzungsregeln und Mehrdeutigkeiten.\n`);
console.log(JSON.stringify({ output: destination, source_count: downloadedSources.length, package_hash: manifest.package_hash }));
