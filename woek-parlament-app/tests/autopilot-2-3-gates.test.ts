import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { bootstrapDisabledResponse, recurringWritersEnabled } from "@/lib/autopilot/runtime-mode";
import { managedDropboxPath, validateManagedPath, woekDropboxRoot } from "@/lib/dropbox/managed-paths";
import { recommendationReviewCandidate, recommendationVersionCanFollow } from "@/lib/recommendation-versioning";
import {
  assertRecommendationHandoffRecord,
  assertRecommendationIsFachApprovedRecord,
  CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS,
  nextOpenRecommendationQueueEntries,
  recommendationBackfillDisposition,
  recommendationBackfillDispositionWithReconciliation,
  recommendationFachStatusEnum,
  shouldSkipRecommendationQueueEntry,
  ZIP_IS_NOT_CANONICAL_SOURCE,
} from "@/lib/recommendation-backfill";

const contracts = path.resolve("data/autopilot/contracts");
const optionSetSchema = JSON.parse(readFileSync(path.join(contracts, "option-set.schema.json"), "utf8"));
const recommendationSchema = JSON.parse(readFileSync(path.join(contracts, "recommendation-record.schema.json"), "utf8"));
const recommendationVersionSchema = JSON.parse(readFileSync(path.join(contracts, "recommendation-version.schema.json"), "utf8"));
const recommendationCandidateSchema = JSON.parse(readFileSync(path.join(contracts, "recommendation-review-candidate.schema.json"), "utf8"));

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(optionSetSchema);
ajv.addSchema(recommendationSchema);
ajv.addSchema(recommendationVersionSchema);
ajv.addSchema(recommendationCandidateSchema);
const validateRecommendation = ajv.getSchema(recommendationSchema.$id)!;

function recommendation() {
  return {
    recommendation_id: "rec:test:1",
    impact_case_id: "WOEK-IMPACT-TEST-1",
    jurisdiction_id: "DE",
    recommendation_status: "PREFERRED_DESIGN",
    analysis_mode: "RETROSPECTIVE_DECISION_REVIEW",
    decision_date: "2026-01-15",
    knowledge_cutoff_date: "2026-01-15",
    evidence_available_at_decision_time: ["Amtliche Unterlage vom 10. Januar 2026"],
    evidence_only_available_later: ["Evaluation vom 1. Juli 2026"],
    hindsight_limitations: "Die spätere Evaluation wird nicht als damals verfügbares Wissen behandelt.",
    problem_state: "Ein klar definierter problematischer Ausgangszustand.",
    target_state: "Ein klar definierter, beobachtbarer Zielzustand.",
    root_cause_or_binding_bottleneck: "Ein objektspezifischer Engpass begrenzt die Zustandsveränderung.",
    option_set: [
      { option_id: "A", label: "Status quo", description: "Das bestehende Instrument bleibt unverändert bestehen.", status_quo: true, dimensions: { reversibility: "mittel" } },
      { option_id: "B", label: "Geänderte Ausgestaltung", description: "Das Instrument wird begrenzt, überprüfbar und reversibel ausgestaltet.", status_quo: false, dimensions: { reversibility: "hoch" } }
    ],
    woek_preferred_option: "B",
    recommendation_core_summary: "Die fachlich freigegebene Option B adressiert den benannten Engpass reversibel und wahrt die dokumentierte Schutzgrenze.",
    why_preferred: ["Sie greift am benannten Engpass an, ohne die Schutzgrenze zu kompensieren."],
    key_tradeoffs: ["Kurzfristiger Vollzugsaufwand steht einer geringeren langfristigen Fehlsteuerung gegenüber."],
    cascade_effects: ["Instrument, Zustandsänderung, Folgereaktion und Rückkopplung bleiben getrennt sichtbar."],
    system_leverage: "Der Hebel setzt vor der stabilisierenden Rückkopplung des Problems an.",
    first_order_effects: ["Direkte Zustandsänderung"],
    second_order_effects: ["Reaktion der Adressaten"],
    third_order_effects: ["Langfristige institutionelle Rückkopplung"],
    affected_groups: ["Betroffene Gruppe"],
    distributional_effects: ["Verteilung wird separat beobachtet"],
    time_and_generation_effects: ["Folgewirkungen werden zeitlich getrennt"],
    resilience_effects: ["Reversibilität erhöht Anpassungsfähigkeit"],
    transformation_effects: ["Lernfähigkeit bleibt erhalten"],
    rebound_spillover_leakage: ["Ausweichreaktionen werden gemessen"],
    competence_scope: "FEDERAL",
    implementation_route: "FEDERAL_LEGISLATION_REQUIRED",
    legal_constraints: ["Grundrechte"],
    rights_and_boundary_conditions: ["Die Schutzgrenze darf nicht durch andere Vorteile kompensiert werden."],
    non_compensation_check: "Die dokumentierte Schutzgrenze bleibt unabhängig von positiven Teilpfaden wirksam.",
    reversibility: "hoch",
    resource_and_capacity_constraints: ["Vollzugskapazität"],
    safeguards: ["Befristung und unabhängige Evaluation"],
    monitoring_indicators: ["Objektspezifischer Zustandsindikator"],
    reality_check_plan: "Der erste Reality Check erfolgt nach einem vollständigen Beobachtungszeitraum.",
    fallback_option: "A",
    evidence_grade: "MEDIUM",
    uncertainty: "Reaktion der Adressaten bleibt offen.",
    recommendation_version: "1.0",
    supersedes_recommendation_version: null,
    triggering_evidence_event_ids: [],
    public_change_summary: "Erste fachlich freigegebene RecommendationVersion.",
    fach_status: "APPROVED",
    source_refs: ["/WOEK/fachreview/recommendation-1.json"]
  };
}

test("canonical Dropbox root is enforced and legacy roots fail closed", () => {
  const previous = process.env.WOEK_DROPBOX_ROOT;
  try {
    process.env.WOEK_DROPBOX_ROOT = "/WOEK";
    assert.equal(woekDropboxRoot(), "/WOEK");
    assert.equal(managedDropboxPath("WOEK-AUTOPILOT", "CONTROL"), "/WOEK/WOEK-AUTOPILOT/CONTROL");
    assert.throws(() => validateManagedPath("/WÖK/WOEK-AUTOPILOT"), /Legacy Dropbox roots/);
    assert.throws(() => validateManagedPath("/W�K/WOEK-AUTOPILOT"), /Legacy Dropbox roots/);
    process.env.WOEK_DROPBOX_ROOT = "/WÖK";
    assert.throws(() => woekDropboxRoot(), /must be exactly/);
  } finally {
    if (previous === undefined) delete process.env.WOEK_DROPBOX_ROOT;
    else process.env.WOEK_DROPBOX_ROOT = previous;
  }
});

test("recurring writers remain disabled during bootstrap", () => {
  const previous = process.env.WOEK_AUTOPILOT_RUNTIME_MODE;
  try {
    process.env.WOEK_AUTOPILOT_RUNTIME_MODE = "INITIAL_BOOTSTRAP_2_3";
    assert.equal(recurringWritersEnabled(), false);
    assert.equal(bootstrapDisabledResponse().production_deploy, "DISABLED_UNTIL_WOEK_EXTERNAL_END_AUDIT");
  } finally {
    if (previous === undefined) delete process.env.WOEK_AUTOPILOT_RUNTIME_MODE;
    else process.env.WOEK_AUTOPILOT_RUNTIME_MODE = previous;
  }
});

test("recommendation schema preserves option, boundary and Hindsight Guard fields", () => {
  const record = recommendation();
  assert.equal(validateRecommendation(record), true, JSON.stringify(validateRecommendation.errors));
  const withoutHindsight = { ...record };
  delete (withoutHindsight as Partial<typeof record>).knowledge_cutoff_date;
  assert.equal(validateRecommendation(withoutHindsight), false);
});

test("recommendation schema rejects technical score shortcuts and unknown fields", () => {
  assert.equal(validateRecommendation({ ...recommendation(), net_score: 2 }), false);
  assert.equal(validateRecommendation({ ...recommendation(), recommendation_status: "AUTO_SCORE_WINNER" }), false);
});

test("recommendation history requires exact supersession and EvidenceEvents trigger review only", () => {
  const first = { impact_case_id: "WOEK-IMPACT-TEST-1", recommendation_version: "1.0", supersedes_recommendation_version: null, triggering_evidence_event_ids: [] };
  const second = { impact_case_id: "WOEK-IMPACT-TEST-1", recommendation_version: "1.1", supersedes_recommendation_version: "1.0", triggering_evidence_event_ids: ["evidence:1"] };
  assert.equal(recommendationVersionCanFollow(null, first), true);
  assert.equal(recommendationVersionCanFollow(first, second), true);
  assert.equal(recommendationVersionCanFollow(first, { ...second, supersedes_recommendation_version: "0.9" }), false);
  const candidate = recommendationReviewCandidate({ impactCaseId: first.impact_case_id, currentRecommendationVersion: first.recommendation_version, evidenceEventIds: ["evidence:1"], createdAt: "2026-08-18T12:00:00Z" });
  assert.equal(candidate.status, "RECOMMENDATION_REVIEW_REQUIRED");
  assert.deepEqual(candidate.triggering_evidence_event_ids, ["evidence:1"]);
  assert.throws(() => recommendationReviewCandidate({ impactCaseId: first.impact_case_id, currentRecommendationVersion: first.recommendation_version, evidenceEventIds: [], createdAt: "2026-08-18T12:00:00Z" }));
});

test("backfill inventory is complete without CodeX-authored recommendations", () => {
  const summary = JSON.parse(readFileSync("data/autopilot/audit/2.3/CODEX-RECOMMENDATION-COMPLETENESS-2.3-SUMMARY.json", "utf8"));
  const queue = readFileSync("data/autopilot/audit/2.3/RECOMMENDATION-BACKFILL-QUEUE-2.3.jsonl", "utf8").split(/\r?\n/).filter(Boolean);
  const publicRecommendations = readFileSync("data/recommendations/public/recommendations.jsonl", "utf8").split(/\r?\n/).filter(Boolean);
  assert.equal(summary.canonical_recommendation_subjects, 133);
  assert.equal(summary.recommendation_required, 133);
  assert.equal(summary.recommendation_content_created_by_codex, 0);
  assert.equal(queue.length, 133);
  assert.equal(publicRecommendations.length, 6);
  assert.deepEqual(publicRecommendations.map((line) => JSON.parse(line).recommendation_id).sort(), [
    "WOEK-REC-BUND-ALTERSVORSORGE-2026-R1",
    "WOEK-REC-BUND-GRUNDSICHERUNG-2026-R1",
    "WOEK-REC-BUND-KHAG-2025-2026-R1",
    "WOEK-REC-BUND-SAFE-COUNTRY-REGULATION-2026-R1",
    "WOEK-REC-BUND-STROMVKG-2026-R1",
    "WOEK-REC-BUND-TARIFTREUE-2025-2026-R1",
  ]);
});

test("recommendation backfill skips only COMPLETED_APPROVED ledger entries", () => {
  const completed = [{
    impact_case_id: "WOEK-IMPACT-TEST-1",
    recommendation_id: "WOEK-REC-TEST-1-R1",
    recommendation_version: "2.3-R1",
    status: "COMPLETED_APPROVED",
  }];
  const review = [{ impact_case_id: "WOEK-IMPACT-TEST-1", status: "REVIEW_REQUIRED" }];
  const blocked = [{ impact_case_id: "WOEK-IMPACT-TEST-1", status: "BLOCKED" }];

  assert.equal(shouldSkipRecommendationQueueEntry("WOEK-IMPACT-TEST-1", completed), true);
  assert.equal(shouldSkipRecommendationQueueEntry("WOEK-IMPACT-TEST-1", review), false);
  assert.equal(shouldSkipRecommendationQueueEntry("WOEK-IMPACT-TEST-1", blocked), false);
  assert.equal(shouldSkipRecommendationQueueEntry("WOEK-IMPACT-UNKNOWN", completed), false);

  const queue = [
    { impact_case_id: "WOEK-IMPACT-TEST-1", priority: "P1" },
    { impact_case_id: "WOEK-IMPACT-TEST-2", priority: "P1" },
    { impact_case_id: "WOEK-IMPACT-TEST-3", priority: "P1" },
  ];
  assert.deepEqual(
    nextOpenRecommendationQueueEntries(queue, completed, 2).map((entry) => entry.impact_case_id),
    ["WOEK-IMPACT-TEST-2", "WOEK-IMPACT-TEST-3"],
  );
});

test("same RecommendationVersion is idempotent and conflicting identities fail closed", () => {
  const incoming = {
    impact_case_id: "WOEK-IMPACT-TEST-1",
    recommendation_id: "WOEK-REC-TEST-1-R1",
    recommendation_version: "2.3-R1",
    recommendation_content_sha256: "a".repeat(64),
    supersedes_recommendation_version: null,
  };

  assert.equal(recommendationBackfillDisposition({
    incoming,
    ledgerRecords: [],
    canonicalRecommendations: [incoming],
  }), "IDEMPOTENT_ALREADY_CANONICAL");

  assert.equal(recommendationBackfillDisposition({
    incoming,
    ledgerRecords: [{ ...incoming, status: "COMPLETED_APPROVED" }],
    canonicalRecommendations: [incoming],
  }), "SKIP_COMPLETED_APPROVED");

  assert.equal(recommendationBackfillDisposition({
    incoming,
    ledgerRecords: [{ ...incoming, recommendation_version: "2.3-R2", status: "COMPLETED_APPROVED" }],
    canonicalRecommendations: [],
  }), "CONFLICT_WITH_COMPLETED_APPROVED");

  assert.equal(recommendationBackfillDisposition({
    incoming,
    ledgerRecords: [],
    canonicalRecommendations: [{ ...incoming, recommendation_version: "2.3-R2" }],
  }), "CONFLICTING_CANONICAL_VERSION");

  assert.equal(recommendationBackfillDisposition({
    incoming,
    ledgerRecords: [],
    canonicalRecommendations: [{ ...incoming, recommendation_content_sha256: "b".repeat(64) }],
  }), "CONFLICTING_CANONICAL_CONTENT");

  assert.equal(recommendationBackfillDisposition({
    incoming: { ...incoming, recommendation_id: "WOEK-REC-TEST-1-R2", recommendation_version: "2.3-R2", supersedes_recommendation_version: "2.3-R1" },
    ledgerRecords: [{ ...incoming, status: "COMPLETED_APPROVED" }],
    canonicalRecommendations: [incoming],
  }), "PROCESS_NEW_APPROVED_VERSION");

  assert.equal(recommendationBackfillDispositionWithReconciliation({
    incoming,
    ledgerRecords: [{ ...incoming, status: "COMPLETED_APPROVED" }],
    canonicalRecommendations: [incoming],
    reconcileCompletedApproved: true,
  }), "PROCESS_RECONCILED_COMPLETED_APPROVED");

  assert.equal(recommendationBackfillDispositionWithReconciliation({
    incoming,
    ledgerRecords: [{ ...incoming, status: "COMPLETED_APPROVED" }],
    canonicalRecommendations: [incoming],
    reconcileCompletedApproved: false,
  }), "SKIP_COMPLETED_APPROVED");
});

test("recommendation gate accepts only fach-approved records and forbids score derivation", () => {
  assert.equal(CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS, true);
  assert.equal(ZIP_IS_NOT_CANONICAL_SOURCE, true);
  assert.throws(() => assertRecommendationIsFachApprovedRecord({
    recommendation_status: "PREFERRED_DESIGN",
    fach_status: "APPROVED_FOR_CODEX_INTEGRATION",
  }), /not fach-approved/);
  assert.deepEqual(recommendationFachStatusEnum, recommendationSchema.properties.fach_status.enum);
  assert.throws(() => assertRecommendationIsFachApprovedRecord({
    recommendation_status: "AUTO_SCORE_WINNER",
    fach_status: "APPROVED",
  }), /Unsupported recommendation_status/);
  assert.throws(() => assertRecommendationIsFachApprovedRecord({
    recommendation_status: "PREFERRED_DESIGN",
    fach_status: "APPROVED",
    net_score: 3,
  }), /forbidden/);
  assert.throws(() => assertRecommendationIsFachApprovedRecord({
    recommendation_status: "PREFERRED_DESIGN",
    fach_status: "OPEN",
  }), /not fach-approved/);

  assert.throws(() => assertRecommendationIsFachApprovedRecord({
    recommendation_status: "PREFERRED_DESIGN",
    fach_status: "APPROVED_FOR_CODEX_INTEGRATION",
  }, { requiredFachStatus: "APPROVED" }), /not fach-approved/);

  assert.equal(assertRecommendationHandoffRecord(recommendation()), true);
  const missingFallback = { ...recommendation() };
  delete (missingFallback as Partial<typeof missingFallback>).fallback_option;
  assert.throws(() => assertRecommendationHandoffRecord(missingFallback), /fallback_option/);
});
