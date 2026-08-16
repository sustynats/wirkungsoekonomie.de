import assert from "node:assert/strict";
import test from "node:test";
import { calculateFinalScore, calculateImpactDemo, directionRuleExamples, endToEndExample } from "@/lib/methodology";
import { getMasterRegister, getMasterRegisterItem } from "@/lib/master-register";
import { polarityLabel } from "@/lib/master-register-shared";
import { defaultSearchFilters, searchPortalPages } from "@/lib/search";

test("the didactic counterfactual example returns the documented values", () => {
  assert.deepEqual(calculateImpactDemo(100, 82, 92), {
    observedDelta: -18,
    counterfactualDelta: -8,
    estimatedAdditionalChange: -10
  });
  assert.equal(calculateImpactDemo(Number.NaN, 82, 92), null);
});

test("missing scores remain unassessed and inactive benchmarks are ignored", () => {
  assert.equal(calculateFinalScore({}), null);
  assert.equal(calculateFinalScore({ autoScore: 2, benchmarkScore: -3, benchmarkActive: false, assuranceScore: 1 }), 1);
  assert.equal(calculateFinalScore({ autoScore: 2, benchmarkScore: -2, benchmarkActive: true, assuranceScore: 1 }), -2);
});

test("ex ante status does not erase a documented direction", () => {
  assert.equal(endToEndExample.actualEffectStatus, "NOT_ESTABLISHED_EX_ANTE");
  assert.deepEqual(endToEndExample.targetMappings.map((mapping) => mapping.direction), ["NEGATIVE_RISK", "NEGATIVE_RISK"]);
});

test("the three reviewed rule examples retain target-specific directions", () => {
  const [freeAccess, homeSchool, road] = directionRuleExamples;
  assert.deepEqual(freeAccess?.mappings.map((mapping) => mapping.direction), ["POSITIVE_POTENTIAL", "POSITIVE_POTENTIAL"]);
  assert.deepEqual(homeSchool?.mappings.map((mapping) => mapping.direction), ["NEGATIVE_RISK", "NEGATIVE_RISK"]);
  assert.deepEqual(road?.mappings.map((mapping) => mapping.direction), ["POSITIVE_POTENTIAL", "AMBIVALENT", "NEGATIVE_RISK", "NEGATIVE_RISK"]);
});

test("master register v1.4 is the canonical public register", () => {
  const register = getMasterRegister();
  assert.equal(register.register_version, "1.4");
  assert.equal(register.publisher, "Institut für Wirkungsökonomie");
  assert.equal(register.items.length, 621);
  assert.equal(register.statistics.indicator_families, 204);
  assert.equal(register.statistics.scoring_rules, 28);
  assert.equal(new Set(register.items.map((item) => item.WOK_ID)).size, 621);
  assert.ok(register.items.some((item) => /fachlich zu validieren/i.test(item.Schwellenstatus)));
});

test("register detail lookup and public polarity labels do not expose system enums", () => {
  const item = getMasterRegisterItem("WOK-S-101");
  assert.equal(item?.WOK_ID, "WOK-S-101");
  assert.equal(polarityLabel("higher_is_better"), "Ein höherer Messwert wird günstiger eingeordnet");
  assert.doesNotMatch(polarityLabel("higher_is_better"), /higher_is_better/);
});

test("methodology and master register are discoverable through the portal search", () => {
  const results = searchPortalPages({ ...defaultSearchFilters, query: "Masterregister" });
  assert.equal(results.length, 1);
  assert.equal(results[0]?.path, "/methodik/register");
  assert.equal(searchPortalPages({ ...defaultSearchFilters, query: "", type: "REFERENCE" }).length, 2);
  assert.equal(searchPortalPages({ ...defaultSearchFilters, query: "Masterregister", source: "VERIFIED" }).length, 0);
});
