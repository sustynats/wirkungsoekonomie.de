import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { validateHostingMigrationPolicy, assessVercelBilling } from "../../scripts/ops/hosting-migration-policy.mjs";

const baseline = JSON.parse(readFileSync(new URL("../../ops/hosting-cost-policy.json", import.meta.url), "utf8"));
test("zero-cost migration policy preserves service, data and rollback protections", () => {
  assert.deepEqual(validateHostingMigrationPolicy(baseline), []);
});
for (const [section, key, unsafe] of [
  ["monthly_budget", "target", 25],
  ["monthly_budget", "ceiling_is_spending_authorization", true],
  ["provider_selection", "vercel_is_default", true],
  ["provider_selection", "automatic_plan_change_allowed", true],
  ["provider_selection", "alternatives_must_be_assessed", ["GITHUB"]],
  ["provider_selection", "new_or_expanded_vercel_requires_technical_necessity", false],
  ["provider_selection", "existing_hosting_is_not_technical_necessity", false],
  ["provider_selection", "new_paid_exception_requires_project_owner_approval", false],
  ["migration", "backup_first", false],
  ["migration", "restore_test_required", false],
  ["migration", "functional_and_access_parity_required", false],
  ["migration", "rollback_required", false],
  ["migration", "capacity_and_zero_additional_cost_check_required", false],
  ["migration", "stop_existing_service_for_cost_policy_alone", true],
  ["migration", "downgrade_requires_dependency_and_limit_audit", false],
  ["migration", "operational_evidence_visibility", "PUBLIC"],
]) {
  test(`rejects unsafe policy ${section}.${key}`, () => {
    const policy = structuredClone(baseline);
    policy[section][key] = unsafe;
    assert.ok(validateHostingMigrationPolicy(policy).length > 0);
    delete policy[section][key];
    assert.ok(validateHostingMigrationPolicy(policy).length > 0);
  });
}
test("malformed alternatives are rejected without crashing the guard", () => {
  for (const value of [{}, "GITHUB ORACLE_OCI", 1, null]) {
    const policy = structuredClone(baseline);
    policy.provider_selection.alternatives_must_be_assessed = value;
    assert.ok(validateHostingMigrationPolicy(policy).length > 0);
  }
});
test("unknown plan is not zero spend", () => {
  for (const team of [null, {}, { billing: {} }, { billing: { plan: "future-plan" } }]) {
    const assessment = assessVercelBilling(team);
    assert.equal(assessment.zeroCostTargetMet, false);
    assert.ok(assessment.failures.length > 0);
  }
});
test("Pro with no old-style add-on field is not a free account", () => {
  const result = assessVercelBilling({ billing: { plan: "pro", invoiceItems: {} } });
  assert.equal(result.zeroCostTargetMet, false);
  assert.ok(result.failures.some((line) => line.includes("current plan is pro")));
});
test("detects current Pro+ Observability entitlement and zero-base usage add-on", () => {
  for (const fields of [
    { entitlements: { observability: { createdAt: 1 } } },
    { invoiceItems: { observabilityBase: { quantity: 1, price: 0 } } },
    { invoiceItems: { observabilityPlus: { quantity: 1 } } },
  ]) {
    const result = assessVercelBilling({ billing: { plan: "pro", ...fields } });
    assert.equal(result.observabilityEnabled, true);
    assert.ok(result.failures.some((line) => line.includes("Observability")));
  }
});
test("Hobby establishes the plan target, not usage limits or external provider costs", () => {
  const result = assessVercelBilling({ billing: { plan: "hobby" } });
  assert.equal(result.zeroCostTargetMet, true);
  assert.deepEqual(result.failures, []);
});
