import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  ACTION_PLAN_ANALYSIS_VERSION,
  ACTION_PLAN_META_ID,
  actionPlanMetaAssessment,
  actionPlanRequiredRoutes,
  actionPlanSources,
  getActionPlanMissions,
  missionDeepDives,
} from "../lib/government/strategy-impact";

const missions = getActionPlanMissions();

test("approved action-plan meta case and all 19 mission records are restored without an aggregate score", () => {
  assert.equal(ACTION_PLAN_META_ID, "WOEK-META-BUND-AKTIONSPLAN-NACHHALTIGKEIT-2026");
  assert.equal(ACTION_PLAN_ANALYSIS_VERSION, "DRAFT_2026-07-16");
  assert.equal(missions.length, 19);
  assert.equal(new Set(missions.map((mission) => mission.id)).size, 19);
  assert.deepEqual(missions.map((mission) => mission.mission), Array.from({ length: 19 }, (_, index) => index + 1));
  assert.equal(actionPlanRequiredRoutes().length, 20);
  assert.match(actionPlanMetaAssessment.impactCoreSummary, /19 ressortübergreifende Missionen/);
  assert.doesNotMatch(JSON.stringify({ assessment: actionPlanMetaAssessment, missions }), /Gesamtnote|Durchschnittsscore|Wahlempfehlung/);
});

test("ACTION_PLAN_19_OF_19_EXPANDED_FACHREVIEWS", () => {
  assert.deepEqual(Object.keys(missionDeepDives).sort(), [
    ...Array.from({ length: 19 }, (_, index) => `WOEK-AKN-2026-M${String(index + 1).padStart(2, "0")}`),
  ]);
  for (const deepDive of Object.values(missionDeepDives)) {
    assert.ok(deepDive.problemReview.text);
    assert.ok(deepDive.goalReview.text);
    assert.equal(deepDive.qualityLayers.length, 12);
  }
  for (const mission of missions) {
    assert.equal(mission.direction, "OPEN_TO_CONTEXT");
    assert.equal(mission.evidence, "INITIAL_DRAFT; add mechanism evidence");
    assert.ok(mission.path.A && mission.path.M && mission.path.delta_Z && mission.path.R);
    assert.ok(mission.risk && mission.monitor.length > 0);
  }
  assert.equal(JSON.stringify({ assessment: actionPlanMetaAssessment, missions, deepDives: missionDeepDives }).includes("recommendation_id"), false);
});

test("DNS stays a reference framework and every public source has intermediary metadata", () => {
  assert.equal(actionPlanSources.length, 8);
  assert.ok(actionPlanSources.some((source) => source.title === "Deutsche Nachhaltigkeitsstrategie 2025" && source.role === "NORMATIVE_REFERENCE"));
  for (const source of actionPlanSources) {
    assert.doesNotThrow(() => new URL(source.url));
    assert.ok(source.abstract.length > 80);
    assert.ok(source.locations.length > 0);
  }
});

test("renderer keeps impact first and internal states out of normal public sections", () => {
  const component = readFileSync(path.join(process.cwd(), "app/components/government/StrategyImpactCase.tsx"), "utf8");
  const assessmentIndex = component.indexOf("<OverviewAssessment assessment={assessment}");
  const processIndex = component.indexOf("Politischer Lebenslauf und technische Transparenz");
  assert.ok(assessmentIndex >= 0 && processIndex > assessmentIndex);
  assert.match(component, /DNS 2025 ist Referenzrahmen – nicht Regierungswirkung/);
  assert.match(component, /kein fachlich freigegebener RecommendationRecord/);
  assert.doesNotMatch(component, /mission\.direction/);
  assert.doesNotMatch(component, /mission\.evidence/);
});

test("restore-first audit records the recovered canonical Fachbestand", () => {
  const audit = JSON.parse(readFileSync(path.join(process.cwd(), "data/government/strategy-impact/restore-first-audit-20260820.json"), "utf8"));
  assert.equal(audit.result, "PRESENT_AND_RENDERED");
  assert.equal(audit.before.classification, "PRESENT_BUT_ROUTE_OR_NAV_LOST");
  assert.equal(audit.after.meta_impact_cases, 1);
  assert.equal(audit.after.mission_subcases, 19);
  assert.equal(audit.after.full_deep_dives.length, 19);
  assert.equal(audit.after.initial_ex_ante_cases, 0);
  assert.equal(audit.guardrails.no_codex_generated_recommendation, true);
  assert.equal(audit.guardrails.dns_2025_is_reference_not_causality_proof, true);
});
