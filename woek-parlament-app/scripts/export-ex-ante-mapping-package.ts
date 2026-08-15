#!/usr/bin/env tsx

import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import referenceSnapshot from "@/data/woek-reference-snapshot.json";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { assertExternalReviewSafe, sha256, stableJson } from "@/lib/review/privacy";

type DatabaseCase = {
  id: string;
  slug: string;
  title: string;
  official_title: string | null;
  decision_date: string | null;
  current_stage: string | null;
};

type ReviewRow = {
  case_id: string;
  review_batch_id: string;
  result_payload: unknown;
  imported_at: string;
};

type BatchCaseRow = {
  package_payload: unknown;
};

type JsonRecord = Record<string, unknown>;

function loadLocalEnvironment() {
  try {
    for (const line of readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const separator = line.indexOf("=");
      if (separator < 1) continue;
      const name = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
      if (name && process.env[name] === undefined) process.env[name] = value;
    }
  } catch {
    // A hosted environment supplies configuration directly.
  }
}

function object(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function records(value: unknown) {
  return Array.isArray(value) ? value.map(object) : [];
}

function isClosedStage(stage: string | null) {
  return /(verkündet|abgelehnt|zurückgezogen|abgeschlossen|erledigt)/i.test(stage ?? "");
}

function referenceStatus() {
  return {
    ...referenceSnapshot,
    review_instruction: "Die lokale Referenzdatei steht noch auf INCOMPLETE_PENDING_TWO_LEADING_REFERENCES. Die öffentliche Bibliothek weist inzwischen einen Begriffsleitfaden v1.4 aus. Deshalb dürfen keine endgültigen WÖk-IDs, Scores, Gewichtungen, Endempfehlungen oder Präferenzurteile als freigegeben ausgegeben werden. Liefere nur eine nachvollziehbare Zuordnungsvorlage mit source_ref und markiere jede Zuordnung PROPOSED_PENDING_REFERENCE_RECONCILIATION."
  };
}

function instructions() {
  return `# WÖk-Ex-ante-Zuordnung – gezielte Nachreichung

## Zweck

Dieses Paket enthält den amtlich abgegrenzten Entscheidungsbestand, die bereits strukturierte Wirkungslogik und die noch offene Zuordnung zum WÖk-Referenzrahmen. Es ist **kein Auftrag zu einem freien Gesamtgutachten** und keine Aufforderung, fehlende Zahlen zu schätzen.

## Was je Fall nachzureichen ist

Erzeuge je Fall genau eine Datei „case-results/<case-id>/ex-ante-mapping-result.json“ mit:

1. case_id, input_package_hash, reference_snapshot_hash unverändert aus ex-ante-mapping-request.json;
2. mapping_status: „PROPOSED_PENDING_REFERENCE_RECONCILIATION“;
3. candidate_woek_mappings: nur passende WÖk-IDs bzw. Referenzbereiche, jeweils mit kurzer Begründung, Wirkpfad-ID und Quellreferenz;
4. sdg_sdgplus_mappings und mpd_dimensions als **analytische Zuordnung, nicht als Wirkungsnachweis**;
5. Screening aller zehn verpflichtenden Politikfelder mit genau einem Status: MATERIAL, INDIRECT, NOT_MATERIAL_IDENTIFIED oder EVIDENCE_OPEN – jeweils mit kurzer Begründung;
6. non_compensation_questions und method_gaps, wenn eine Grenze, ein Vergleichsmaßstab oder eine Regel ungeklärt ist;
7. unresolved_items: fehlende Evidenz, ungeklärte Mehrfachbezüge oder nicht belastbar quantifizierbare Elemente.

## Verbindliche Grenzen

- Wirkungspotenzial, Wirkungsrisiko und später beobachtete Wirkung niemals vermischen.
- Keine Zahlen, Attributionen, Gewichtungen, Schwellenwerte oder Endnoten erfinden.
- Eine SDG-/SDG+- oder Mensch–Planet–Demokratie-Zuordnung ist noch keine positive Netto-Wirkung.
- Keine abschließende Präferenz für eine Abstimmungsoption und keine Personen-, Partei- oder Fraktionsbewertung.
- Die 14 ungeklärten Mehrfachbezüge zwischen Zusagen und Entscheidungen bleiben OPEN_UNRESOLVED_MULTI_LINK. Nicht auflösen, nicht raten und nicht als Negativbefund deuten.
- Jede Zuordnung braucht mindestens einen Verweis auf einen vorhandenen Wirkpfad oder eine amtliche Quelle aus dem jeweiligen Fallpaket.

## Referenz-Gate

Der beiliegende Referenzstatus ist noch nicht zur finalen Freigabe geeignet. Die Ausgabe ist eine fachliche Zuordnungsvorlage. Sie wird erst nach kontrollierter Referenzabstimmung und redaktioneller Prüfung in den produktiven WÖk-Referenzstand übernommen.
`;
}

function requestFor(caseRow: DatabaseCase, review: ReviewRow, packagePayload: unknown) {
  const result = object(review.result_payload);
  const exAnte = object(result.ex_ante);
  const impactPaths = records(exAnte.impact_paths).length ? records(exAnte.impact_paths) : records(result.impact_paths);
  const sourceManifest = records(object(packagePayload).source_manifest).map((source) => ({
    source_id: text(source.source_id),
    title: text(source.title),
    institution: text(source.institution),
    url: text(source.url),
    temporal_class: text(source.temporal_class),
    relevant_locations: source.relevant_locations
  }));
  const inputPackageHash = text(object(packagePayload).package_hash);
  const resultPayload = object(review.result_payload);
  return {
    schema_version: "1.0.0",
    case_id: caseRow.id,
    case_slug: caseRow.slug,
    case_title: caseRow.official_title ?? caseRow.title,
    parliamentary_stage: caseRow.current_stage,
    decision_date: caseRow.decision_date,
    review_scope: isClosedStage(caseRow.current_stage) ? "EX_ANTE_AT_DECISION_TIME" : "EX_ANTE_BEFORE_DECISION",
    input_package_hash: inputPackageHash,
    reference_snapshot_hash: sha256(referenceSnapshot),
    mapping_status_required: "PROPOSED_PENDING_REFERENCE_RECONCILIATION",
    existing_wirkpfade: impactPaths,
    existing_normative_mapping: resultPayload.normative_mapping ?? {},
    existing_data_gaps: resultPayload.data_gaps ?? [],
    existing_counterfactuals: resultPayload.counterfactuals ?? [],
    source_manifest: sourceManifest,
    required_output: {
      candidate_woek_mappings: [{ woek_reference_id: "", scope: "", impact_path_id: "", reason: "", source_refs: [] }],
      sdg_sdgplus_mappings: [{ reference_id: "", reference_type: "OFFICIAL_SDG | WOEK_SDG_PLUS", impact_path_id: "", reason: "", source_refs: [] }],
      mpd_dimensions: [{ dimension: "Mensch | Planet | Demokratie", impact_path_id: "", reason: "", source_refs: [] }],
      ten_policy_field_screening: [{ field: "", status: "MATERIAL | INDIRECT | NOT_MATERIAL_IDENTIFIED | EVIDENCE_OPEN", reason: "", impact_path_refs: [] }],
      non_compensation_questions: [],
      method_gaps: [],
      unresolved_items: []
    }
  };
}

async function packageForReview(review: ReviewRow) {
  const rows = await supabaseRest<BatchCaseRow[]>(
    `parliament.review_batch_cases?review_batch_id=eq.${encodeURIComponent(review.review_batch_id)}&case_id=eq.${encodeURIComponent(review.case_id)}&select=package_payload&limit=1`
  );
  return rows[0]?.package_payload ?? {};
}

async function zipBatch(code: string, rows: Array<{ caseRow: DatabaseCase; review: ReviewRow; packagePayload: unknown }>) {
  const archive = new JSZip();
  const manifest = {
    schema_version: "1.0.0",
    batch_code: code,
    review_type: "EX_ANTE_MAPPING_REVIEW",
    case_count: rows.length,
    created_at: new Date().toISOString(),
    reference_snapshot_hash: sha256(referenceSnapshot),
    open_unresolved_multi_links: 14
  };
  assertExternalReviewSafe(manifest, "ex-ante-mapping-manifest");
  archive.file("manifest.json", stableJson(manifest));
  archive.file("INSTRUCTIONS.md", instructions());
  archive.file("woek-reference-status.json", stableJson(referenceStatus()));
  archive.file("UNRESOLVED_MULTIPLE_COMMITMENT_LINKS.md", "14 Mehrfachbezüge zwischen Zusagen und Entscheidungen bleiben offen. Sie sind nicht Gegenstand dieser Fachnachreichung und dürfen nicht durch Titelähnlichkeit oder politische Annahmen aufgelöst werden.\n");
  for (const item of rows) {
    const folder = `cases/${item.caseRow.id}/`;
    const request = requestFor(item.caseRow, item.review, item.packagePayload);
    assertExternalReviewSafe(request, `ex-ante-mapping-request-${item.caseRow.id}`);
    archive.file(`${folder}ex-ante-mapping-request.json`, stableJson(request));
    archive.file(`${folder}case-package.json`, stableJson(item.packagePayload));
    archive.file(`${folder}existing-structured-review.json`, stableJson(item.review.result_payload));
  }
  const bytes = await archive.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 9 } });
  return { bytes, manifest };
}

async function main() {
  loadLocalEnvironment();
  const outputArgument = process.argv.find((argument) => argument.startsWith("--output-dir="))?.slice("--output-dir=".length);
  const outputDir = path.resolve(outputArgument ?? ".local/review-exports");
  const reviews = await supabaseRest<ReviewRow[]>(
    "parliament.external_review_results?import_status=eq.REVIEW_PROPOSAL&select=case_id,review_batch_id,result_payload,imported_at&order=imported_at.desc&limit=250"
  );
  const latestReviewByCase = new Map<string, ReviewRow>();
  for (const review of reviews) if (!latestReviewByCase.has(review.case_id)) latestReviewByCase.set(review.case_id, review);
  const caseIds = [...latestReviewByCase.keys()];
  if (!caseIds.length) throw new Error("No review proposals available for ex-ante mapping export.");
  const cases = await supabaseRest<DatabaseCase[]>(
    `parliament.cases?id=in.(${caseIds.map(encodeURIComponent).join(",")})&select=id,slug,title,official_title,decision_date,current_stage&limit=250`
  );
  const entries = [] as Array<{ caseRow: DatabaseCase; review: ReviewRow; packagePayload: unknown }>;
  for (const caseRow of cases) {
    const review = latestReviewByCase.get(caseRow.id);
    if (!review) continue;
    entries.push({ caseRow, review, packagePayload: await packageForReview(review) });
  }
  const openCases = entries.filter((entry) => !isClosedStage(entry.caseRow.current_stage));
  const historicalCases = entries.filter((entry) => isClosedStage(entry.caseRow.current_stage));
  const batches = [
    { code: "WOEK-EX-ANTE-MAPPING-2026-0005-A", rows: openCases.slice(0, 10) },
    { code: "WOEK-EX-ANTE-MAPPING-2026-0005-B", rows: openCases.slice(10) },
    { code: "WOEK-EX-ANTE-MAPPING-2026-0005-C", rows: historicalCases }
  ].filter((batch) => batch.rows.length > 0);

  await mkdir(outputDir, { recursive: true });
  const exported: Array<{ file: string; cases: number; package_hash: string }> = [];
  for (const batch of batches) {
    const generated = await zipBatch(batch.code, batch.rows);
    const filename = `${batch.code}.zip`;
    await writeFile(path.join(outputDir, filename), generated.bytes);
    exported.push({ file: filename, cases: batch.rows.length, package_hash: sha256(generated.manifest) });
  }
  const readme = {
    purpose: "Targeted WÖk ex-ante mapping proposal; no final professional opinions.",
    batches: exported,
    total_cases: entries.length,
    open_unresolved_multi_links: 14,
    reference_snapshot_status: referenceSnapshot.status
  };
  assertExternalReviewSafe(readme, "ex-ante-mapping-export-readme");
  await writeFile(path.join(outputDir, "README.json"), `${JSON.stringify(readme, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ output_directory: ".local/review-exports", ...readme }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not export ex-ante mapping packages.");
  process.exit(1);
});
