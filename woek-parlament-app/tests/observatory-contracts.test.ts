import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import {
  attributionFromTemporalCoOccurrence,
  nextObservationRevision,
  observationRequiresEvidenceEvent,
  realityCheckTrigger,
  requiresPublicEvidenceForAnalysisChange,
} from "@/lib/observatory/rules";

function compile(name: string) {
  const schema = JSON.parse(readFileSync(path.join(process.cwd(), "data", "observatory", "contracts", name), "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv.compile(schema);
}

test("evidence events require public provenance and keep attribution explicit", () => {
  const validate = compile("evidence-event.schema.json");
  const event = {
    evidence_event_id: "evidence-1", event_type: "OUTCOME_RELEASE", title: "Neuer amtlicher Wert",
    concise_public_summary: "Der amtliche Zeitreihenwert wurde veröffentlicht.", observation_date: "2026-08-01",
    publication_date: "2026-08-18", geography: ["DE"], affected_state_variables: ["state-variable-1"],
    official_source_refs: ["https://example.org/source"], source_function: "OUTCOME_DATA", data_quality: "HIGH",
    attribution_status: "OPEN", linked_impact_case_ids: ["impact-1"], relation_to_impact_case: "TRIGGERS_REALITY_CHECK",
    materiality: "MATERIAL", what_changed_or_may_change: "Ein neuer Beobachtungswert ist verfügbar.", publication_status: "APPROVED_PUBLIC",
  };
  assert.equal(validate(event), true, JSON.stringify(validate.errors));
  assert.equal(validate({ ...event, government_score: 1 }), false);
});

test("an analysis version cannot change without a public evidence event", () => {
  assert.equal(requiresPublicEvidenceForAnalysisChange({ analysis_version: "2", supersedes_analysis_version: "1", triggering_evidence_event_ids: [], public_change_summary: "Änderung" }), false);
  assert.equal(requiresPublicEvidenceForAnalysisChange({ analysis_version: "2", supersedes_analysis_version: "1", triggering_evidence_event_ids: ["evidence-1"], public_change_summary: "Neue Evidenz verändert die Einordnung." }), true);
});

test("observation revisions preserve the old observation", () => {
  assert.deepEqual(nextObservationRevision({ observation_id: "obs-v1", revision: 1 }, "obs-v2"), {
    observation_id: "obs-v2", revision: 2, supersedes_observation_id: "obs-v1", revision_status: "REVISED",
  });
});

test("time correlation never creates an automatic attribution", () => {
  assert.equal(attributionFromTemporalCoOccurrence(), "OPEN");
});

test("material observations trigger review while routine values remain observations", () => {
  assert.equal(observationRequiresEvidenceEvent("ROUTINE_OBSERVATION"), false);
  assert.equal(observationRequiresEvidenceEvent("MATERIAL_EARLY_WARNING"), true);
  assert.equal(realityCheckTrigger("EXTERNAL_SHOCK", ["impact-1"]), true);
  assert.equal(realityCheckTrigger("EXTERNAL_SHOCK", []), false);
});

test("an external shock cannot masquerade as a government action", () => {
  const validate = compile("external-shock.schema.json");
  const event = { external_shock_id: "shock-1", shock_type: "DROUGHT", title: "Dürre", observation_date: "2026-08-01", geography: ["DE"], source_refs: ["https://example.org/source"], attribution_status: "EXTERNAL_CONTEXT", object_type: "EXTERNAL_SHOCK" };
  assert.equal(validate(event), true, JSON.stringify(validate.errors));
  assert.equal(validate({ ...event, object_type: "GOVERNMENT_ACTION" }), false);
});
