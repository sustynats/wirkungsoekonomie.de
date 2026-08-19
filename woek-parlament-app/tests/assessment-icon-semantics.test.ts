import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  assessmentIconKindFromStructuredSignal,
  assessmentPresentationModeForOverallCharacter,
  impactRecordAssessmentIconKind,
} from "@/lib/presentation/overview-assessment";

test("reviewed structured directions drive assessment icons without prose inference", () => {
  assert.equal(assessmentIconKindFromStructuredSignal({ direction: "POSITIVE" }), "positive");
  assert.equal(assessmentIconKindFromStructuredSignal({ direction: "NEGATIVE" }), "risk");
  assert.equal(assessmentIconKindFromStructuredSignal({ direction: "AMBIVALENT" }), "ambivalent");
  assert.equal(assessmentIconKindFromStructuredSignal({ direction: "OPEN" }), "open");
  assert.equal(assessmentIconKindFromStructuredSignal({ direction: "NEUTRAL" }), "neutral");
  assert.equal(assessmentIconKindFromStructuredSignal({ direction: "POSITIVE", presentation: "CONDITIONAL" }), "conditional");
  assert.equal(assessmentIconKindFromStructuredSignal({ direction: "AMBIVALENT", presentation: "PROTECTION" }), "protection");
  assert.equal(assessmentIconKindFromStructuredSignal({ direction: "OPEN", presentation: "PORTFOLIO" }), "portfolio");
});

test("unknown directions fail closed and never default to positive", () => {
  assert.equal(assessmentIconKindFromStructuredSignal({ direction: "UNREVIEWED_DIRECTION" }), "unknown");
  assert.notEqual(assessmentIconKindFromStructuredSignal({}), "positive");
});

test("portfolio mode is selected only from reviewed structured overall-character values", () => {
  assert.equal(assessmentPresentationModeForOverallCharacter("NO_SINGLE_DIRECTION_ALLOWED"), "PORTFOLIO");
  assert.equal(assessmentPresentationModeForOverallCharacter("HIGH_TRANSFORMATION_POTENTIAL_NO_SINGLE_DIRECTION_ALLOWED"), "PORTFOLIO");
  assert.equal(assessmentPresentationModeForOverallCharacter("free editorial prose mentioning a portfolio"), "DEFAULT");
  assert.equal(impactRecordAssessmentIconKind({ primary_direction: "OPEN", overall_character: "NO_SINGLE_DIRECTION_ALLOWED" }), "portfolio");
});

test("component binds SVG, class, accessible label and audit marker to the structured kind", () => {
  const component = readFileSync("app/components/OverviewAssessment.tsx", "utf8");
  assert.match(component, /AssessmentIcon directionLabel=\{assessment\.directionLabel\} kind=\{assessment\.directionKind\}/);
  assert.match(component, /data-woek-assessment-direction=\{assessment\.directionKind\}/);
  assert.match(component, /data-woek-assessment-icon=\{kind\}/);
  assert.match(component, /Symbol für Wirkungsrichtung:/);
  assert.doesNotMatch(component, /assessmentIconKind\(label/);
  assert.doesNotMatch(component, /return "positive";/);
});
