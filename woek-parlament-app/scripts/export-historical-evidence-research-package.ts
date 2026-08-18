#!/usr/bin/env tsx

import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
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
  review_id: string;
  input_package_hash: string;
  result_payload: unknown;
  imported_at: string;
};

type BatchCaseRow = { package_payload: unknown };
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
    // The hosted environment supplies configuration directly.
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

function readiness(review: ReviewRow) {
  return text(object(object(review.result_payload).retrospective).publication_readiness, "EVIDENCE_REQUIRED");
}

function instructions() {
  return `# Historische Evidenz- und Rückkopplungsrecherche

## Auftrag

Prüfe für jeden Fall ausschließlich, ob seit der parlamentarischen Entscheidung belastbare amtliche oder wissenschaftliche Evidenz für beobachtbare Veränderungen, Vollzug, Nebenwirkungen und mögliche Rückkopplungen verfügbar ist. Die bestehende Wirkungslogik bleibt Grundlage; sie darf nicht durch eine freie politische Bewertung ersetzt werden.

## Priorisierung

- EVIDENCE_REQUIRED: Recherchiere gezielt, ob die angegebenen Datenlücken mit konkreten Quellen, Baselines, Zeitreihen oder Evaluationen geschlossen werden können.
- NOT_YET_ASSESSABLE: Keine Endbewertung erzwingen. Liefere einen Monitoringplan, relevante Indikatoren, erwartete früheste Beobachtungszeitpunkte und seriöse künftige Quellen.

## Strikte Regeln

- Ex ante und ex post streng trennen. Spätere Daten sind niemals damaliges Wissen.
- Beobachtete Entwicklung ist nicht automatisch kausal zurechenbare Wirkung.
- Jede neue Quelle bleibt CANDIDATE_ONLY, bis sie im Backend abrufbar, zeitlich korrekt und inhaltlich geprüft wurde.
- Keine Zahlen, Kausalitäten, Gegenfakten oder Präferenzurteile erfinden.
- Nicht gewählte politische Alternativen als MODELLED, ESTIMATED oder UNRESOLVED kennzeichnen – nie als beobachtet darstellen.
- Keine Personen-, Partei- oder Fraktionsbewertung.

## Rückgabe je Fall

Schreibe „case-results/<case-id>/evidence-research-result.json“:

\`\`\`json
{
  "case_id": "",
  "review_id": "",
  "input_package_hash": "",
  "research_status": "EVIDENCE_FOUND_CANDIDATE | PARTIAL_EVIDENCE | DATA_GAP | NOT_YET_ASSESSABLE",
  "evidence_findings": [
    {
      "finding_id": "",
      "observation_or_claim": "",
      "evidence_type": "BASELINE | OBSERVATION | IMPLEMENTATION | EVALUATION | COUNTERFACTUAL_INPUT | SIDE_EFFECT",
      "value": null,
      "unit": null,
      "observation_period": "",
      "source_candidate": {
        "source_id": "",
        "title": "",
        "institution": "",
        "canonical_url": "https://...",
        "document_date": "YYYY-MM-DD | null",
        "retrieved_at": "YYYY-MM-DD",
        "source_type": "OFFICIAL_STATISTICS | OFFICIAL_EVALUATION | SCIENTIFIC_PRIMARY | PARLIAMENTARY_RECORD | GOVERNMENT_RECORD",
        "temporal_class": "AVAILABLE_AT_DECISION_TIME | PUBLISHED_AFTER_DECISION",
        "relevant_location": "",
        "verification_status": "CANDIDATE_ONLY"
      },
      "what_it_supports": "",
      "what_it_does_not_support": "",
      "causal_limit": ""
    }
  ],
  "remaining_data_gaps": [],
  "monitoring_plan": {
    "indicators": [],
    "baseline_needed": [],
    "earliest_credible_review_date": null,
    "correction_triggers": []
  },
  "counterfactual_status": "ESTABLISHED | CANDIDATE_ONLY | UNRESOLVED",
  "ex_post_assessment": "NO_ROBUST_RETROSPECTIVE_ASSESSMENT | PENDING_EVIDENCE"
}
\`\`\`

Eine beobachtete Veränderung wird nur mit EVIDENCE_FOUND_CANDIDATE zurückgegeben, wenn die Quelle sie tatsächlich belegt. Ein kausales Ergebnis bleibt ausgeschlossen, solange Gegenfaktum, Zurechnung und Unsicherheit nicht tragfähig sind.
`;
}

function requestFor(caseRow: DatabaseCase, review: ReviewRow, packagePayload: unknown) {
  const result = object(review.result_payload);
  const retrospective = object(result.retrospective);
  return {
    schema_version: "1.0.0",
    case_id: caseRow.id,
    case_slug: caseRow.slug,
    case_title: caseRow.official_title ?? caseRow.title,
    decision_date: caseRow.decision_date,
    parliamentary_stage: caseRow.current_stage,
    review_id: review.review_id,
    input_package_hash: review.input_package_hash,
    priority: readiness(review),
    existing_data_gaps: result.data_gaps ?? [],
    existing_counterfactuals: result.counterfactuals ?? [],
    existing_impact_paths: result.impact_paths ?? object(result.ex_ante).impact_paths ?? [],
    existing_ex_post: result.ex_post ?? {},
    existing_source_candidates: retrospective.source_candidates ?? [],
    request: readiness(review) === "NOT_YET_ASSESSABLE"
      ? "Monitoringdaten und künftig geeignete Quellen identifizieren; keine voreilige Ex-post-Bewertung liefern."
      : "Konkrete Evidenzkandidaten mit Fundstelle recherchieren und präzise trennen, was sie belegen und was nicht."
  };
}

async function packageForReview(review: ReviewRow) {
  const rows = await supabaseRest<BatchCaseRow[]>(
    `parliament.review_batch_cases?review_batch_id=eq.${encodeURIComponent(review.review_batch_id)}&case_id=eq.${encodeURIComponent(review.case_id)}&select=package_payload&limit=1`
  );
  return rows[0]?.package_payload ?? {};
}

async function main() {
  loadLocalEnvironment();
  const outputArgument = process.argv.find((argument) => argument.startsWith("--output="))?.slice("--output=".length);
  const output = path.resolve(outputArgument ?? ".local/review-exports/WOEK-HISTORICAL-EVIDENCE-RESEARCH-2026-0006.zip");
  const reviews = await supabaseRest<ReviewRow[]>(
    "parliament.external_review_results?import_status=eq.REVIEW_PROPOSAL&select=case_id,review_batch_id,review_id,input_package_hash,result_payload,imported_at&order=imported_at.desc&limit=250"
  );
  const latest = new Map<string, ReviewRow>();
  for (const review of reviews) if (!latest.has(review.case_id)) latest.set(review.case_id, review);
  const caseIds = [...latest.keys()];
  const cases = await supabaseRest<DatabaseCase[]>(
    `parliament.cases?id=in.(${caseIds.map(encodeURIComponent).join(",")})&select=id,slug,title,official_title,decision_date,current_stage&limit=250`
  );
  const historical = cases.filter((item) => /(verkündet|abgelehnt|zurückgezogen|abgeschlossen|erledigt)/i.test(item.current_stage ?? ""));
  if (historical.length === 0) throw new Error("No historical review proposals were found.");

  const archive = new JSZip();
  const manifest = {
    schema_version: "1.0.0",
    batch_code: "WOEK-HISTORICAL-EVIDENCE-RESEARCH-2026-0006",
    review_type: "HISTORICAL_EVIDENCE_RESEARCH",
    created_at: new Date().toISOString(),
    case_count: historical.length,
    evidence_required: 0,
    not_yet_assessable: 0
  };
  archive.file("INSTRUCTIONS.md", instructions());
  for (const caseRow of historical) {
    const review = latest.get(caseRow.id);
    if (!review) continue;
    const packagePayload = await packageForReview(review);
    const priority = readiness(review);
    if (priority === "NOT_YET_ASSESSABLE") manifest.not_yet_assessable += 1;
    else manifest.evidence_required += 1;
    const request = requestFor(caseRow, review, packagePayload);
    assertExternalReviewSafe(request, `historical-evidence-request-${caseRow.id}`);
    const folder = `cases/${caseRow.id}/`;
    archive.file(`${folder}evidence-research-request.json`, stableJson(request));
    archive.file(`${folder}case-package.json`, stableJson(packagePayload));
    archive.file(`${folder}existing-structured-review.json`, stableJson(review.result_payload));
  }
  const completedManifest = { ...manifest, package_hash: sha256(manifest) };
  assertExternalReviewSafe(completedManifest, "historical-evidence-manifest");
  archive.file("manifest.json", stableJson(completedManifest));
  const bytes = await archive.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 9 } });
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, bytes);
  console.log(JSON.stringify({ output: ".local/review-exports/WOEK-HISTORICAL-EVIDENCE-RESEARCH-2026-0006.zip", cases: historical.length, evidence_required: manifest.evidence_required, not_yet_assessable: manifest.not_yet_assessable }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not export historical evidence package.");
  process.exit(1);
});
