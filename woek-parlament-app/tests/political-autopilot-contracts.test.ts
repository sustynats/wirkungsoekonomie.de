import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import {
  nextPoliticalLifecycleState,
  lifecycleStateForElectionCycle,
  requiresGovernmentMonitoring,
  requiresProgrammeCollection,
} from "@/lib/autopilot/lifecycle";

function compile(name: string) {
  const schema = JSON.parse(readFileSync(path.join(process.cwd(), "data", "autopilot", "contracts", name), "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv.compile(schema);
}

test("state lifecycle advances only through documented official events", () => {
  assert.equal(nextPoliticalLifecycleState("DORMANT", "OFFICIAL_ELECTION_DATE_CONFIRMED"), "PRE_ELECTION_WATCH");
  assert.equal(nextPoliticalLifecycleState("PRE_ELECTION_WATCH", "OFFICIAL_PROGRAMME_PUBLISHED"), "PROGRAMME_ANALYSIS");
  assert.equal(nextPoliticalLifecycleState("PROGRAMME_ANALYSIS", "OFFICIAL_ELECTION_RESULT_FINAL"), "ELECTION_RESULT");
  assert.equal(nextPoliticalLifecycleState("COALITION_FORMATION", "NEW_GOVERNMENT_FORMED"), "GOVERNMENT_FORMED");
  assert.throws(() => nextPoliticalLifecycleState("DORMANT", "NEW_GOVERNMENT_FORMED"), /INVALID_LIFECYCLE_TRANSITION/);
  assert.equal(requiresProgrammeCollection("PRE_ELECTION_WATCH"), true);
  assert.equal(requiresGovernmentMonitoring("GOVERNMENT_FORMED"), true);
  assert.equal(lifecycleStateForElectionCycle("PROGRAMMES_REVIEW"), "PROGRAMME_ANALYSIS");
  assert.equal(lifecycleStateForElectionCycle("ELECTION_COMPLETE"), "ELECTION_RESULT");
});

test("election commitments remain source extractions without impact scores", () => {
  const validate = compile("election-commitment.schema.json");
  const record = {
    commitment_id: "commitment-1",
    election_cycle_id: "de-st-landtag-2026",
    party_id: "party-1",
    source_document_id: "document-1",
    source_locator: "S. 12",
    promise_text: "Quellengebundener Originaltext",
    problem_assumption: null,
    proposed_instrument: null,
    competence_scope: "OPEN",
    status: "EXTRACTED_NOT_ANALYSED",
    source_fragment_status: "COMPLETE",
  };
  assert.equal(validate(record), true, JSON.stringify(validate.errors));
  assert.equal(validate({ ...record, impact_direction: "POSITIVE" }), false);
});

test("political actions cannot carry a technical impact assessment", () => {
  const validate = compile("political-action.schema.json");
  const record = {
    political_action_id: "eu-action-1",
    jurisdiction_id: "eu",
    object_type: "COMMISSION_ACTION",
    action_type: "LEGISLATIVE_PROPOSAL",
    title_official: "Amtlicher Gegenstand",
    lifecycle_status: "PROPOSED",
    responsible_institution_ids: ["eu-commission"],
    source_event_ids: ["source-1"],
    official_source_refs: ["https://commission.europa.eu/example"],
    inherited_legislative_file: false,
    identity_review_status: "CONFIRMED",
    publication_status: "INTERNAL",
    created_at: "2026-08-18T10:00:00Z",
    updated_at: "2026-08-18T10:00:00Z",
  };
  assert.equal(validate(record), true, JSON.stringify(validate.errors));
  assert.equal(validate({ ...record, party_score: 1 }), false);
});

test("a baseline handoff makes open coverage explicit", () => {
  const validate = compile("baseline-ready.schema.json");
  const record = {
    baseline_id: "baseline-eu-1",
    jurisdiction_id: "eu",
    term_id: "commission-2024-2029",
    created_at: "2026-08-18T10:00:00Z",
    source_cursor: null,
    objects: [],
    source_refs: ["https://commission.europa.eu/"],
    coverage: "PARTIAL",
    open_data_issues: ["Adapter noch nicht freigegeben"],
    candidate_impact_case_ids: [],
    content_hash: "a".repeat(64),
  };
  assert.equal(validate(record), true, JSON.stringify(validate.errors));
  assert.equal(validate({ ...record, coverage: "COMPLETE" }), false);
});
