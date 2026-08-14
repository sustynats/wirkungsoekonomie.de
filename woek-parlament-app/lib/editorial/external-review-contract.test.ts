import assert from "node:assert/strict";
import test from "node:test";
import { validateHistoricalReviewAgainstPackage } from "./external-review-contract.ts";

function reviewResult(): Record<string, any> {
  return {
    case_id: "case-1",
    review_status: "READY_FOR_EDITORIAL_REVIEW",
    source_completeness: {
      decision_object: true,
      final_version: true,
      decision_outcome: true,
      ex_ante_evidence: true,
      ex_post_evidence: false,
      woek_reference_snapshot: true,
      notes: []
    },
    decision: {
      decision_object: "Amtlich abgegrenzte Entscheidung",
      decision_date: "2025-05-06",
      final_version: "source-1",
      actual_outcome: "ADOPTED",
      vote_type: "OFFICIAL_RESULT",
      vote_result: {},
      sources: [{ source_id: "source-1", title: "Amtliche Quelle", url: "https://example.test/source", location: "S. 1" }]
    },
    ex_ante: {
      knowledge_cutoff: "2025-05-06",
      official_objectives: [],
      available_evidence: [],
      counterfactuals: [],
      impact_paths: [],
      candidate_woek_assessment: { status: "AI_SUGGESTION", candidate_option: null, reasoning_components: [], source_refs: [], uncertainty: "Keine abschließende Einordnung." }
    },
    ex_post: {
      observation_cutoff: "2026-08-14",
      observed_state_changes: [],
      causal_evidence: [],
      side_effects: [],
      impact_paths_confirmed: [],
      impact_paths_not_confirmed: [],
      candidate_woek_assessment: { status: "AI_SUGGESTION", candidate_option: null, reasoning_components: [], source_refs: [], uncertainty: "Noch nicht hinreichend beobachtbar." }
    },
    calculation_requirements: [],
    normative_mapping: { woek_ids: [], sdgs: [], sdg_plus: [], human: [], planet: [], democracy: [] },
    risks_and_boundaries: [],
    data_gaps: [],
    counterarguments: [],
    cross_case_links: [],
    retrospective: {
      candidate_preferred_option_ex_ante: { status: "AI_SUGGESTION", candidate_option: null, reasoning_components: [], source_refs: [], uncertainty: "Kein Vorschlag ohne weitere Evidenz." },
      candidate_preferred_option_ex_post: { status: "AI_SUGGESTION", candidate_option: null, reasoning_components: [], source_refs: [], uncertainty: "Kein Vorschlag ohne weitere Evidenz." },
      status_candidate: "UNRESOLVED",
      learning_points: []
    },
    provenance: {
      woek_reference_snapshot: "snapshot-1",
      exported_package_hash: "package-hash-1",
      review_generated_at: "2026-08-14T10:00:00.000Z",
      source_refs_used: ["source-1"],
      review_system: "ChatGPT"
    }
  };
}

const boundary = {
  caseId: "case-1",
  decisionDate: "2025-05-06",
  referenceSnapshot: "snapshot-1",
  packageHash: "package-hash-1",
  sourceIds: ["source-1"]
};

test("a review only passes when case, cutoff, snapshot and source IDs match its exported package", () => {
  const validation = validateHistoricalReviewAgainstPackage(reviewResult(), boundary);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
});

test("a source outside the package is rejected instead of being added silently", () => {
  const result = reviewResult();
  result.provenance.source_refs_used = ["outside-source"];
  const validation = validateHistoricalReviewAgainstPackage(result, boundary);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes("UNKNOWN_SOURCE_REFERENCE:outside-source"));
});

test("a result cannot be replayed against a different exported package", () => {
  const result = reviewResult();
  result.provenance.exported_package_hash = "different-package";
  const validation = validateHistoricalReviewAgainstPackage(result, boundary);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes("PACKAGE_HASH_MISMATCH"));
});

test("an AI-generated number stays a warning and does not become a calculation input", () => {
  const result = reviewResult();
  result.calculation_requirements = [{
    impact_id: "impact-1",
    baseline: { description: "Baseline", source_refs: ["source-1"] },
    counterfactual: { description: "Status quo", type: "STATUS_QUO", source_refs: ["source-1"] },
    required_operands: [{ name: "missing", unit: "PERSONS", source_refs: ["source-1"], status: "AI_GENERATED_NUMERIC_VALUE" }],
    formula_or_rule: "F-1",
    attribution_requirement: "Quelle erforderlich",
    uncertainty: "Offen",
    source_refs: ["source-1"]
  }];
  const validation = validateHistoricalReviewAgainstPackage(result, boundary);
  assert.equal(validation.valid, true);
  assert.ok(validation.warnings.includes("AI_NUMERIC_VALUE_NOT_USABLE:impact-1:missing"));
});
