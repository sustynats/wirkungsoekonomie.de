import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import {
  nextPoliticalLifecycleState,
  lifecycleStateForElectionCycle,
  closeTermOnlyAfterOfficialFormation,
  requiresGovernmentMonitoring,
  requiresProgrammeCollection,
} from "@/lib/autopilot/lifecycle";
import { parseOfficialStateElectionDates } from "@/lib/autopilot/election-calendar-core";

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
  assert.equal(requiresGovernmentMonitoring("GOVERNMENT_MONITORING"), true);
  assert.equal(lifecycleStateForElectionCycle("PROGRAMMES_REVIEW"), "PROGRAMME_ANALYSIS");
  assert.equal(lifecycleStateForElectionCycle("ELECTION_COMPLETE"), "ELECTION_RESULT");
  assert.equal(closeTermOnlyAfterOfficialFormation("OFFICIAL_ELECTION_RESULT_FINAL"), false);
  assert.equal(closeTermOnlyAfterOfficialFormation("NEW_GOVERNMENT_FORMED"), true);
});

test("government monitoring and election analysis remain independent state axes", () => {
  const validate = compile("jurisdiction.schema.json");
  assert.equal(validate({
    jurisdiction_id: "DE-ST",
    jurisdiction_type: "STATE",
    name: "Sachsen-Anhalt",
    active_term_id: "st-current",
    active_government_term_id: "st-current",
    government_lifecycle_state: "GOVERNMENT_MONITORING",
    government_monitoring_scope_start: "2026-01-28",
    election_cycle_state: "PROGRAMME_ANALYSIS",
    active_election_cycle_id: "DE-ST-2026",
    next_election_date: "2026-09-06",
    date_precision: "EXACT",
    source_health: "DEGRADED",
    monitoring_enabled: true,
  }), true, JSON.stringify(validate.errors));
});

test("election documents preserve programme versions and official source hashes", () => {
  const validate = compile("election-document.schema.json");
  const record = {
    document_id: "programme-de-st-party-1-v1",
    election_cycle_id: "DE-ST-2026",
    jurisdiction_id: "DE-ST",
    party_id: "party-1",
    title: "Wahlprogramm 2026",
    source_url: "https://example.org/wahlprogramm.pdf",
    publication_date: "2026-04-01",
    retrieved_at: "2026-08-18T12:00:00Z",
    content_hash: "a".repeat(64),
    version: "1",
    supersedes_document_id: null,
    status: "FINAL",
  };
  assert.equal(validate(record), true, JSON.stringify(validate.errors));
  assert.equal(validate({ ...record, party_score: 2 }), false);
});

test("the official election calendar automatically triggers precisely dated state cycles", () => {
  const html = `<table><tr><td>2026</td><td>06.09.</td><td>Sachsen-Anhalt</td><td>Landtagswahl</td></tr><tr><td>20.09.</td><td>Berlin</td><td>Wahl zum Abgeordnetenhaus</td></tr></table>`;
  assert.deepEqual(parseOfficialStateElectionDates(html), [
    { jurisdiction_id: "DE-ST", election_date: "2026-09-06", election_type: "Landtagswahl" },
    { jurisdiction_id: "DE-BE", election_date: "2026-09-20", election_type: "Wahl zum Abgeordnetenhaus" },
  ]);
});

test("election commitments remain source extractions without impact scores", () => {
  const validate = compile("election-commitment.schema.json");
  const record = {
    commitment_id: "commitment-1",
    election_cycle_id: "DE-ST-2026",
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
    jurisdiction_id: "EU",
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

test("competence and higher-law review remains a separate fach-approved axis", () => {
  const validate = compile("competence-legal-review.schema.json");
  const review = {
    competence_scope: "FEDERAL",
    competence_basis: "Die materielle Regelung erfordert eine Änderung von Bundesrecht.",
    competence_sources: ["https://www.gesetze-im-internet.de/gg/"],
    required_external_actor: "Bundesgesetzgeber",
    available_land_route: "Bundesratsinitiative",
    implementation_route: "BUNDESRAT_INITIATIVE",
    legal_feasibility_status: "REQUIRES_FEDERAL_ACTION",
    legal_basis: ["Art. 70 ff. GG"],
    higher_law_constraints: [],
    rights_affected: [],
    legal_uncertainty: null,
    milder_or_alternative_route: null,
    fach_review_status: "APPROVED",
    reviewed_at: "2026-08-18T12:00:00Z",
    review_source_refs: ["https://www.gesetze-im-internet.de/gg/"],
  };
  assert.equal(validate(review), true, JSON.stringify(validate.errors));
  assert.equal(validate({ ...review, impact_direction: "POSITIVE" }), false);
});

test("a baseline handoff makes open coverage explicit", () => {
  const validate = compile("baseline-ready.schema.json");
  const record = {
    baseline_id: "baseline-eu-1",
    jurisdiction_id: "EU",
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
