import { commitmentAssessmentImportSchema, commitmentLinkImportSchema, commitmentRegisterSchema } from "@/lib/commitments/contracts";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { assertExternalReviewSafe } from "@/lib/review/privacy";

type SourceRow = { id: string };
type CommitmentRow = { id: string };
type RowId = { id: string };

async function sourceByKey(sourceKey: string) {
  const rows = await supabaseRest<SourceRow[]>(`parliament.political_source_documents?source_key=eq.${encodeURIComponent(sourceKey)}&select=id&limit=1`);
  const source = rows[0];
  if (!source) throw new Error("The political source is not registered.");
  return source;
}

async function commitmentByKey(commitmentKey: string) {
  const rows = await supabaseRest<CommitmentRow[]>(`parliament.policy_commitments?commitment_key=eq.${encodeURIComponent(commitmentKey)}&select=id&limit=1`);
  const commitment = rows[0];
  if (!commitment) throw new Error("The commitment is not registered.");
  return commitment;
}

export async function importCommitmentRegister(input: unknown) {
  const register = commitmentRegisterSchema.parse(input);
  assertExternalReviewSafe(register, "commitment-register");
  const source = await sourceByKey(register.source_key);
  for (const commitment of register.commitments) {
    await supabaseRest("parliament.policy_commitments?on_conflict=commitment_key", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({
        source_document_id: source.id,
        commitment_key: commitment.commitment_key,
        title: commitment.title,
        commitment_text: commitment.commitment_text,
        policy_domain: commitment.policy_domain,
        source_location: commitment.source_location,
        temporal_scope: commitment.temporal_scope,
        // A source-bound extraction is valuable working material, but it is
        // not an editorial approval and is never projected publicly merely by
        // being imported.
        extraction_status: "SOURCE_EXTRACTED",
        source_hash: register.source_hash,
        updated_at: new Date().toISOString()
      })
    });
  }
  await supabaseRest(`parliament.political_source_documents?id=eq.${encodeURIComponent(source.id)}`, {
    method: "PATCH",
      body: JSON.stringify({ source_hash: register.source_hash, publication_status: "STRUCTURED", updated_at: new Date().toISOString() })
  });
  return { sourceKey: register.source_key, importedCommitments: register.commitments.length };
}

export async function importCommitmentDecisionLink(input: unknown) {
  const link = commitmentLinkImportSchema.parse(input);
  assertExternalReviewSafe(link, "commitment-decision-link");
  const commitment = await commitmentByKey(link.commitment_key);
  const caseFilter = link.case_id ? `eq.${encodeURIComponent(link.case_id)}` : "is.null";
  const decisionFilter = link.decision_unit_id ? `eq.${encodeURIComponent(link.decision_unit_id)}` : "is.null";
  const existing = await supabaseRest<RowId[]>(`parliament.commitment_decision_links?commitment_id=eq.${encodeURIComponent(commitment.id)}&case_id=${caseFilter}&decision_unit_id=${decisionFilter}&select=id&limit=1`);
  const payload = {
    commitment_id: commitment.id,
    case_id: link.case_id,
    decision_unit_id: link.decision_unit_id,
    relationship_status: link.relationship_status,
    factual_rationale: link.factual_rationale,
    source_refs: link.source_refs,
    implementation_scope: link.implementation_scope,
    impact_path_refs: link.impact_path_refs,
    official_status_check: link.official_status_check,
    effect_assessment: link.effect_assessment,
    verification_status: "PROPOSED",
    updated_at: new Date().toISOString()
  };
  if (existing[0]) {
    await supabaseRest(`parliament.commitment_decision_links?id=eq.${encodeURIComponent(existing[0].id)}`, { method: "PATCH", body: JSON.stringify(payload) });
  } else {
    await supabaseRest("parliament.commitment_decision_links", { method: "POST", body: JSON.stringify(payload) });
  }
  return { commitmentKey: link.commitment_key, relationshipStatus: link.relationship_status, importStatus: "PROPOSED" };
}

export async function importCommitmentAssessment(input: unknown) {
  const assessment = commitmentAssessmentImportSchema.parse(input);
  assertExternalReviewSafe(assessment, "commitment-impact-assessment");
  const commitment = await commitmentByKey(assessment.commitment_key);
  const caseFilter = assessment.linked_case_id ? `eq.${encodeURIComponent(assessment.linked_case_id)}` : "is.null";
  const existing = await supabaseRest<RowId[]>(`parliament.commitment_impact_assessments?commitment_id=eq.${encodeURIComponent(commitment.id)}&assessment_scope=eq.${assessment.assessment_scope}&linked_case_id=${caseFilter}&select=id&limit=1`);
  const payload = {
    commitment_id: commitment.id,
    assessment_scope: assessment.assessment_scope,
    assessment_status: assessment.assessment_status,
    linked_case_id: assessment.linked_case_id,
    calculation_record_ids: assessment.calculation_record_ids,
    normative_mapping_ids: assessment.normative_mapping_ids,
    boundary_status: assessment.boundary_status,
    reference_snapshot: assessment.reference_snapshot,
    assessment_note: assessment.assessment_note,
    updated_at: new Date().toISOString()
  };
  if (existing[0]) {
    await supabaseRest(`parliament.commitment_impact_assessments?id=eq.${encodeURIComponent(existing[0].id)}`, { method: "PATCH", body: JSON.stringify(payload) });
  } else {
    await supabaseRest("parliament.commitment_impact_assessments", { method: "POST", body: JSON.stringify(payload) });
  }
  return {
    commitmentKey: assessment.commitment_key,
    assessmentScope: assessment.assessment_scope,
    assessmentStatus: assessment.assessment_status,
    importStatus: "PROPOSAL_REQUIRES_EDITORIAL_APPROVAL"
  };
}
