import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  coverageFromHistory,
  emptyDailyIngestState,
  parseImpactCaseJsonl,
  processDailyBundle,
  reviewTasksFromReport,
  sha256,
  globalGatesPass,
  type DeploymentGates,
  type WoeKImpactCase,
} from "@/lib/government/daily-impact-ingest-core";

const gates: DeploymentGates = {
  data_1_2_validation: "PASS",
  freshness: "PASS",
  p0_source_adapters: "PASS",
  public_export: "PASS",
  source_vs_view_staging: "PASS",
  semantic_ui: "PASS",
  external_re_audit: "PASS",
  updated_at: "2026-08-18T00:00:00Z",
  note: "Test",
};

function impactCase(overrides: Partial<WoeKImpactCase> = {}): WoeKImpactCase {
  return {
    impact_case_id: "WOEK-IMPACT-TEST-1",
    title: "Didaktischer Testfall",
    analysis_mode: "IMPACT_POTENTIAL_EX_ANTE",
    publication_analysis_status: "STANDARD_WOEK_ANALYSIS",
    analysis_version: "2.0.1",
    supersedes_analysis_version: null,
    linked_objects: {
      government_action_ids: ["govaction:test:1"],
      parliament_case_ids: [],
      legal_act_ids: [],
      implementation_object_ids: [],
      programme_ids: [],
      source_event_ids: [],
    },
    scope: {
      intervention: "Ein klar abgegrenztes Instrument",
      policy_object: "Testgegenstand",
      affected_groups: ["Betroffene Gruppe"],
      affected_systems: ["Testsystem"],
      decision_knowledge_cutoff: "2026-08-17",
      analysis_as_of: "2026-08-18",
      competence_note: null,
      implementation_state: "DRAFT",
      effect_start_expected: null,
      effect_maturity_expected: null,
    },
    materiality: { level: "HIGH", rationale: "Materieller Testfall", drivers: ["STRUCTURAL_CHANGE"] },
    impact_summary: {
      central_lever: "Der Testhebel verändert einen Zustand.",
      strongest_positive_potential: "Ein konkret benannter Zustand kann sich verbessern.",
      main_risk_or_tradeoff: "Ein konkret benannter Zustand kann sich verschlechtern.",
      direction_dependencies: "Die Richtung hängt von einer benannten Bedingung ab.",
      measurement_priority: "Die Zustandsvariable wird beobachtet.",
      public_summary: "Maßnahmenspezifische Zusammenfassung.",
      overall_character: "AMBIVALENT",
    },
    impact_paths: [{
      path_id: "P1",
      impact_order: "FIRST",
      trigger: "Instrument",
      mechanism: "Mechanismus",
      state_variable: "Zustand",
      baseline: null,
      state_change: "Mögliche Zustandsveränderung",
      reference: ["SDG 10"],
      direction: "POSITIVE",
      evidence: "MEDIUM",
      data_status: "MODELLED",
      affected_groups: ["Betroffene Gruppe"],
      mpd: ["MENSCH"],
      time_horizon: "MEDIUM",
      conditions: ["Bedingung"],
      risks: ["Risiko"],
      uncertainties: ["Unsicherheit"],
      distributional_effects: ["Verteilungswirkung"],
      indicators: [{ indicator: "Zustandsindikator", function: "OUTCOME", unit: null, preferred_source: "Amtliche Statistik", woek_id: null, woek_id_status: "PENDING_REGISTER_LINK" }],
      sdg_refs: ["SDG 10"],
      sdg_plus_refs: ["SDG+ - demokratische Stabilität"],
      legal_refs: ["Grundgesetz"],
      evidence_basis: ["Mechanismusquelle"],
    }],
    counterfactual: {
      primary_question: "Was wäre ohne das Instrument geschehen?",
      plausible_without_measure: "Der Ausgangstrend hätte sich fortgesetzt.",
      alternative_designs: ["Alternative"],
      identification_strategy: ["Vergleichsgruppe"],
      limitations: ["Begrenzung"],
    },
    implementation_tracking: {
      implementation_questions: ["Wurde das Instrument angewendet?"],
      implementation_indicators: ["Anwendung"],
      known_status: "Entwurf",
      implementation_sources: ["Amtliche Quelle"],
    },
    evidence_summary: {
      fact_evidence: "Amtlicher Entwurf",
      mechanism_evidence: "Mittlere Evidenz",
      effect_evidence: "Noch keine Ex-post-Evidenz",
      uncertainty: "Umsetzungsreaktion offen",
      decision_time_evidence_boundary: "Nur bis 17. August 2026 verfügbare Evidenz.",
    },
    boundary_review: [{ boundary_id: "B1", boundary: "Grundrechte", status: "WATCH", reason: "Beobachten", evidence_basis: ["P1"] }],
    data_needs: [{ data_id: "D1", question: "Ändert sich der Zustand?", data: "Zustandsdaten", function: "OUTCOME", priority: "P0", preferred_source: "Amtliche Statistik" }],
    reality_check: {
      status: "NOT_YET_OBSERVABLE",
      as_of: "2026-08-18",
      observation_window: null,
      observations: [],
      attribution: null,
      original_potentials_status: [{ path_id: "P1", status: "NOT_YET_TESTABLE", reason: "Ex ante" }],
      next_check: "Nach Umsetzung",
    },
    references: {
      official_fact_sources: ["https://example.org/amtlich"],
      mechanism_sources: ["https://example.org/evidenz"],
      post_decision_sources: [],
    },
    fach_review: {
      status: "APPROVED_WITH_OPEN_DATA",
      reviewer: "Institut für Wirkungsökonomie",
      reviewed_at: "2026-08-18T08:00:00+02:00",
      override_ids: [],
      open_questions: ["Ex-post-Daten"],
    },
    change_log: [{ date: "2026-08-18", change: "Erstanalyse", reason: "Daily Ingest" }],
    method_version: "WOEK-POLITICAL-IMPACT-2.0",
    ...overrides,
  };
}

function run(record: WoeKImpactCase, state = emptyDailyIngestState(), customGates = gates) {
  const jsonl = `${JSON.stringify(record)}\n`;
  return processDailyBundle({
    bundle: {
      date: "2026-08-18",
      jsonl: { name: "GOVERNMENT-DAILY-2026-08-18.jsonl", content: jsonl, hash: sha256(jsonl) },
      markdown: { name: "GOVERNMENT-DAILY-2026-08-18.md", content: "# Fachakte", hash: sha256("# Fachakte") },
      sources: { name: "GOVERNMENT-DAILY-SOURCES-2026-08-18.md", content: "# Quellen", hash: sha256("# Quellen") },
    },
    state,
    gates: customGates,
    knownGovernmentActionIds: new Set(["govaction:test:1"]),
    knownParliamentCaseIds: new Set(),
    blockedObjectIds: new Set(),
    now: "2026-08-18T09:00:00Z",
  });
}

test("schema 2.0.1 accepts a complete ImpactCase", () => {
  const parsed = parseImpactCaseJsonl(JSON.stringify(impactCase()));
  assert.equal(parsed.errors.length, 0);
  assert.equal(parsed.records.length, 1);
});

test("OPEN remains a direction and is never converted to NEUTRAL or zero", () => {
  const record = impactCase({ impact_paths: [{ ...impactCase().impact_paths[0], direction: "OPEN", data_status: "MISSING" }] });
  const result = run(record);
  assert.equal(result.accepted[0].record.impact_paths[0].direction, "OPEN");
  assert.equal(JSON.stringify(result.accepted[0].record).includes('"direction":"NEUTRAL"'), false);
});

test("ex ante does not force an open direction", () => {
  const result = run(impactCase());
  assert.equal(result.accepted[0].record.analysis_mode, "IMPACT_POTENTIAL_EX_ANTE");
  assert.equal(result.accepted[0].record.impact_paths[0].direction, "POSITIVE");
});

test("boundary status and separate SDG+, legal and MPD fields are preserved", () => {
  const result = run(impactCase());
  const accepted = result.accepted[0].record;
  assert.equal(accepted.boundary_review[0].status, "WATCH");
  assert.deepEqual(accepted.impact_paths[0].mpd, ["MENSCH"]);
  assert.deepEqual(accepted.impact_paths[0].sdg_plus_refs, ["SDG+ - demokratische Stabilität"]);
  assert.deepEqual(accepted.impact_paths[0].legal_refs, ["Grundgesetz"]);
});

test("person and party scores are rejected by additionalProperties false", () => {
  const unsafe = { ...impactCase(), minister_score: 2 };
  const parsed = parseImpactCaseJsonl(JSON.stringify(unsafe));
  assert.equal(parsed.records.length, 0);
  assert.match(parsed.errors[0].errors.join(" "), /additional properties/i);
});

test("same filename with a changed hash stops the run", () => {
  const first = run(impactCase());
  const state = {
    ...first.state,
    ledger: [{
      date: "2026-08-18", source_file: "GOVERNMENT-DAILY-2026-08-18.jsonl", source_hash: "different", ingested_at: "2026-08-18T08:00:00Z",
      impact_cases_new: 1, impact_cases_updated: 0, lifecycle_updates: 0, reality_check_updates: 0, fact_only_objects: 0, open_data_issues: 0, schema_errors: 0,
      deploy_commit: null, deploy_status: "DEPLOYED" as const,
    }],
  };
  const second = run(impactCase(), state);
  assert.match(second.report.blockers.join(" "), /verändertem Hash/);
  assert.equal(second.accepted.length, 0);
});

test("analysis updates require an exact supersedes_analysis_version", () => {
  const first = run(impactCase());
  const state = { ...first.state, ledger: [] };
  const wrong = impactCase({ analysis_version: "2.0.2", supersedes_analysis_version: "2.0.0" });
  const result = run(wrong, state);
  assert.match(result.report.blockers.join(" "), /supersedes_analysis_version/);
});

test("confirmed overmerge links block integration and deployment", () => {
  const record = impactCase({ linked_objects: { ...impactCase().linked_objects, government_action_ids: ["govaction:dip:321575"] } });
  const jsonl = `${JSON.stringify(record)}\n`;
  const result = processDailyBundle({
    bundle: {
      date: "2026-08-18",
      jsonl: { name: "GOVERNMENT-DAILY-2026-08-18.jsonl", content: jsonl, hash: sha256(jsonl) },
      markdown: { name: "GOVERNMENT-DAILY-2026-08-18.md", content: "# Fachakte", hash: sha256("# Fachakte") },
      sources: { name: "GOVERNMENT-DAILY-SOURCES-2026-08-18.md", content: "# Quellen", hash: sha256("# Quellen") },
    },
    state: emptyDailyIngestState(), gates, knownGovernmentActionIds: new Set(["govaction:dip:321575"]),
    blockedObjectIds: new Set(["govaction:dip:321575"]), now: "2026-08-18T09:00:00Z",
  });
  assert.equal(result.deployAllowed, false);
  assert.equal(result.accepted.length, 0);
  assert.equal(result.report.OPEN_DATA_ISSUES, 1);
});

test("global data gates block deployment without rewriting fach content", () => {
  const result = run(impactCase(), emptyDailyIngestState(), { ...gates, public_export: "FAIL" });
  assert.equal(result.accepted.length, 1);
  assert.equal(result.deployAllowed, false);
  assert.match(result.report.blockers.join(" "), /public_export/);
});

test("NO_NEW_EFFECT_BEARING_CASES is a successful empty daily review", () => {
  const result = processDailyBundle({
    bundle: {
      date: "2026-08-18",
      jsonl: { name: "GOVERNMENT-DAILY-2026-08-18.jsonl", content: "", hash: sha256("") },
      markdown: { name: "GOVERNMENT-DAILY-2026-08-18.md", content: "NO_NEW_EFFECT_BEARING_CASES", hash: sha256("NO_NEW_EFFECT_BEARING_CASES") },
      sources: { name: "GOVERNMENT-DAILY-SOURCES-2026-08-18.md", content: "# Quellen", hash: sha256("# Quellen") },
    },
    state: emptyDailyIngestState(), gates, knownGovernmentActionIds: new Set(), blockedObjectIds: new Set(), now: "2026-08-18T09:00:00Z",
  });
  assert.equal(result.report.SCHEMA_VALID, true);
  assert.equal(result.report.blockers.length, 0);
  assert.equal(result.deployAllowed, false);
});

test("coverage counts ImpactCases rather than GovernmentActions", () => {
  const result = run(impactCase());
  const coverage = coverageFromHistory(result.state.history, 733);
  assert.equal(coverage.fact_actions_public, 733);
  assert.equal(coverage.impact_cases_total, 1);
  assert.equal(coverage.high_materiality_cases_analyzed, 1);
});

test("current production deployment gates match the Data-1.2 release contract", () => {
  const current = JSON.parse(readFileSync("data/government/impact-cases/deployment-gates.json", "utf8"));
  assert.equal(current.known_overmerge_regressions, "PASS");
  assert.equal(current.fach_import, "PASS");
  assert.equal(current.source_vs_view, "PASS");
  assert.equal(current.background_automation, "PASS");
  assert.equal(globalGatesPass(current), true);
});

test("overmerge and schema problems enter durable, correctly routed review queues", () => {
  const record = impactCase({ linked_objects: { ...impactCase().linked_objects, government_action_ids: ["govaction:dip:321575"] } });
  const jsonl = `${JSON.stringify(record)}\n`;
  const result = processDailyBundle({
    bundle: {
      date: "2026-08-18",
      jsonl: { name: "GOVERNMENT-DAILY-2026-08-18.jsonl", content: jsonl, hash: sha256(jsonl) },
      markdown: { name: "GOVERNMENT-DAILY-2026-08-18.md", content: "# Fachakte", hash: sha256("# Fachakte") },
      sources: { name: "GOVERNMENT-DAILY-SOURCES-2026-08-18.md", content: "# Quellen", hash: sha256("# Quellen") },
    },
    state: emptyDailyIngestState(),
    gates,
    knownGovernmentActionIds: new Set(["govaction:dip:321575"]),
    blockedObjectIds: new Set(["govaction:dip:321575"]),
    now: "2026-08-18T09:00:00Z",
  });
  const tasks = reviewTasksFromReport(result.report, "GOVERNMENT-DAILY-2026-08-18.jsonl", "2026-08-18T09:00:00Z");
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].kind, "OPEN_DATA_ISSUE");
  assert.equal(tasks[0].target_release, "GOVERNMENT_DATA_1.2_PLUS");
});

test("UI labels SDG+ as WÖk extension and separates law references", () => {
  const source = readFileSync("app/components/government/GovernmentImpactCase.tsx", "utf8");
  assert.match(source, /SDG\+ - WÖk-Erweiterung/);
  assert.match(source, /Recht und Grundrechte/);
  assert.match(source, /Pfade werden nicht zu einem Punktwert addiert/);
});

test("government production routes remain closed until all gates pass", () => {
  const layout = readFileSync("app/regierung/layout.tsx", "utf8");
  assert.match(layout, /!staging && !governmentPublicationGatesPass\(\)/);
  assert.match(layout, /notFound\(\)/);
});

test("Vercel uses npm build so the approved Dropbox snapshot is materialized", () => {
  const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
  assert.equal(vercel.buildCommand, "npm run build");
  assert.equal(vercel.crons.some((cron: { path: string }) => cron.path === "/api/cron/political-autopilot"), true);
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  assert.match(packageJson.scripts.prebuild, /government:sync-approved/);
  assert.match(packageJson.scripts.prebuild, /parliament:sync-approved/);
});
