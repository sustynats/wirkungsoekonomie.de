#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

const packageId = "WOEK-SACHSEN-ANHALT-ZIELREGISTER-2026-0001";
const sourceUrl = "https://mwu.sachsen-anhalt.de/api/media/230220_Nachhaltigkeitsstrategie_Sachsen-Anhalt-1.pdf?collection=document";
const outputPath = path.join(os.homedir(), "Downloads", `${packageId}.zip`);

const digest = (value) => createHash("sha256").update(value).digest("hex");

const globalSdgFramework = `# SDG-Rahmen für Sachsen-Anhalt

Die Agenda 2030 mit ihren 17 SDGs ist der gemeinsame, übergeordnete
Referenzrahmen für jedes Bundesland. Für Sachsen-Anhalt werden die SDGs nicht
durch die Nachhaltigkeitsstrategie ersetzt: Die Strategie 2022 konkretisiert
sie mit landesspezifischen, versionierten Zielen und Indikatoren.

Jeder importierte Zieleintrag benötigt daher:

- mindestens den einschlägigen SDG-Bezug oder eine begründete offene Zuordnung;
- die eigene landesspezifische Quellenfundstelle;
- eine klare Kennzeichnung, ob ein Zielwert oder nur eine Richtung amtlich
  veröffentlicht ist.

SDG, Landesstrategie und Landesverfassung werden im Portal als getrennte
Ebenen dargestellt und nicht zu einer Gesamtpunktzahl verrechnet.
`;

const readme = `# Fachauftrag: Landesziele Sachsen-Anhalt\n\nDieses Paket enthält die amtliche Nachhaltigkeitsstrategie Sachsen-Anhalt 2022 als Primärquelle und einen verbindlichen Importvertrag.\n\n## Aufgabe\n\nErstelle das vollständige, quellengebundene Register der 28 Nachhaltigkeitsziele, die laut Strategie durch das Land Sachsen-Anhalt beeinflussbar sind.\n\nJeder Eintrag braucht:\n\n- einen verständlichen Zieltitel und die genaue Quellenfundstelle;\n- die zugehörigen SDGs;\n- den Indikatorbezug und einen Zielwert nur, wenn er in der Quelle ausdrücklich steht;\n- den Status QUANTIFIED, DIRECTIONAL oder RULE_BASED;\n- eine kurze Einordnung des Wirkungsraums in Sachsen-Anhalt sowie mögliche Folgen für andere Länder, den Bund, Europa oder globale öffentliche Güter;\n- die klare Trennung zwischen Strategieziel und Landesverfassung.\n\nNicht zulässig sind erfundene Zielwerte, Gewichtungen, Gesamtpunktzahlen oder eine Parteienbewertung.\n\n## Rückgabe\n\nGib ein ZIP mit diesen beiden Dateien zurück:\n\n- state-target-register.json\n- batch-summary.md\n\nDie JSON-Datei muss die Vorlage in diesem Paket erfüllen.\n`;

const contract = `# Importvertrag: landesspezifische SDG-Ziele\n\n## Verbindliche Quelle\n\nNachhaltigkeitsstrategie des Landes Sachsen-Anhalt – Neuauflage 2022, gebilligt am 20. September 2022. Die Strategie enthält 28 Nachhaltigkeitsziele, die durch das Land beeinflussbar sind. Sie ist eine versionierte Landesstrategie und kein Teil der Landesverfassung.\n\n## Regeln\n\n1. Genau 28 unterscheidbare Ziele liefern oder jede Abweichung zur Quellenzählung ausdrücklich begründen.\n2. Für jedes Ziel: Seite, Abschnitt, SDG-Bezug, Indikatorbezug, Zieltyp, Geltungsbeginn.\n3. Einen Zahlenwert nur übernehmen, wenn die Quelle ihn enthält; sonst null.\n4. Landesverfassungsanker nicht als Strategieziel führen.\n5. Wirkungen außerhalb Sachsen-Anhalts als gesonderte, unsichere oder offene Wirkungspfade ausweisen.\n6. Keine partei- oder personenbezogene Einordnung.\n\n## Erwartete Struktur je Ziel\n\n\`\`\`json\n{\n  "id": "st-sa-2022-001",\n  "jurisdiction_id": "sachsen-anhalt",\n  "label": "…",\n  "source_quote": "…",\n  "source_location": { "page": 0, "section": "…" },\n  "sdg_codes": ["SDG_00"],\n  "indicator_refs": ["…"],\n  "target_type": "QUANTIFIED | DIRECTIONAL | RULE_BASED",\n  "target_value": { "value": null, "unit": null, "target_date": null },\n  "measurement_boundary": "…",\n  "effect_space": {\n    "sachsen_anhalt": "…",\n    "other_states_or_federal": "…",\n    "europe_or_global": "…",\n    "status": "EVIDENCE_OPEN | SOURCE_SUPPORTED"\n  },\n  "valid_from": "2022-09-20",\n  "valid_to": null,\n  "source_ref": "sachsen-anhalt-nachhaltigkeitsstrategie-2022"\n}\n\`\`\`\n`;

const template = {
  schema_version: "1.0.0",
  register_id: "sachsen-anhalt-nachhaltigkeitsstrategie-2022",
  jurisdiction_id: "sachsen-anhalt",
  source: {
    title: "Nachhaltigkeitsstrategie des Landes Sachsen-Anhalt – Neuauflage 2022",
    published_at: "2022-09-20",
    source_url: sourceUrl,
    source_sha256: "TO_BE_VERIFIED_AGAINST_INCLUDED_SOURCE",
    declared_target_count: 28
  },
  targets: []
};

async function main() {
  const runDirectory = await mkdir(path.join(os.tmpdir(), `${packageId}-`), { recursive: true }).then(() => path.join(os.tmpdir(), `${packageId}-${Date.now()}`));
  await mkdir(runDirectory, { recursive: true });

  const sourceResponse = await fetch(sourceUrl);
  if (!sourceResponse.ok) throw new Error(`Could not retrieve source document: ${sourceResponse.status}`);
  const source = Buffer.from(await sourceResponse.arrayBuffer());
  if (source.byteLength < 100_000) throw new Error("Source document is unexpectedly small.");

  const sourceHash = digest(source);
  template.source.source_sha256 = sourceHash;
  await writeFile(path.join(runDirectory, "README.md"), readme, "utf8");
  await writeFile(path.join(runDirectory, "IMPORTVERTRAG.md"), contract, "utf8");
  await writeFile(path.join(runDirectory, "SDG_RAHMEN.md"), globalSdgFramework, "utf8");
  await writeFile(path.join(runDirectory, "state-target-register.template.json"), `${JSON.stringify(template, null, 2)}\n`, "utf8");
  await writeFile(path.join(runDirectory, "sachsen-anhalt-nachhaltigkeitsstrategie-2022.pdf"), source);

  const files = ["README.md", "IMPORTVERTRAG.md", "SDG_RAHMEN.md", "state-target-register.template.json", "sachsen-anhalt-nachhaltigkeitsstrategie-2022.pdf"];
  const manifest = {
    package_id: packageId,
    publisher: "Institut für Wirkungsökonomie",
    purpose: "Strukturierte Erfassung landesspezifischer Nachhaltigkeitsziele",
    source_document_sha256: sourceHash,
    files: await Promise.all(files.map(async (file) => {
      const content = await readFile(path.join(runDirectory, file));
      return { path: file, sha256: digest(content), size_bytes: content.byteLength };
    }))
  };
  await writeFile(path.join(runDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const archive = spawnSync("zip", ["-q", "-r", outputPath, "."], { cwd: runDirectory, encoding: "utf8" });
  if (archive.status !== 0) throw new Error(archive.stderr || "Could not create ZIP archive.");
  const verify = spawnSync("unzip", ["-t", outputPath], { encoding: "utf8" });
  if (verify.status !== 0) throw new Error(verify.stderr || "ZIP verification failed.");

  await rm(runDirectory, { recursive: true, force: true });
  console.log(JSON.stringify({ package: path.basename(outputPath), source_sha256: sourceHash, source_bytes: source.byteLength }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not export package.");
  process.exit(1);
});
