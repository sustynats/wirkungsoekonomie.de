/** Policy checks only. Never changes a cloud resource, tariff or running service. */
export function validateHostingMigrationPolicy(policy) {
  const failures = [];
  const requireRule = (pass, reason) => { if (!pass) failures.push(reason); };
  const selection = policy?.provider_selection ?? {};
  const budget = policy?.monthly_budget ?? {};
  const migration = policy?.migration ?? {};
  requireRule(selection.vercel_is_default === false, "Vercel must not be the default hosting provider.");
  requireRule(Array.isArray(selection.alternatives_must_be_assessed) &&
    ["GITHUB", "ORACLE_OCI"].every((provider) => selection.alternatives_must_be_assessed.includes(provider)),
  "GitHub and Oracle/OCI alternatives must be assessed before expanding Vercel.");
  requireRule(selection.new_or_expanded_vercel_requires_technical_necessity === true,
    "New or expanded Vercel use requires documented technical necessity.");
  requireRule(selection.existing_hosting_is_not_technical_necessity === true,
    "An existing Vercel deployment does not establish technical necessity.");
  requireRule(selection.automatic_plan_change_allowed === false,
    "Automatic plan changes must remain forbidden.");
  requireRule(selection.new_paid_exception_requires_project_owner_approval === true,
    "New paid exceptions require explicit project-owner approval.");
  requireRule(budget.target === 0, "The target Vercel spend must remain EUR 0.");
  requireRule(budget.ceiling_is_spending_authorization === false,
    "The absolute cost ceiling is not spending authorization.");
  for (const key of ["backup_first", "restore_test_required", "capacity_and_zero_additional_cost_check_required",
    "functional_and_access_parity_required", "rollback_required", "downgrade_requires_dependency_and_limit_audit"]) {
    requireRule(migration[key] === true, `Hosting migration requires ${key}.`);
  }
  requireRule(migration.stop_existing_service_for_cost_policy_alone === false,
    "Cost policy alone must not stop existing production services.");
  requireRule(migration.operational_evidence_visibility === "PRIVATE_ONLY",
    "Operational migration evidence must remain private.");
  return failures;
}

/** Missing billing evidence is unknown, never evidence of zero cost. */
export function assessVercelBilling(team) {
  const billing = team?.billing;
  if (!billing || !["hobby", "pro", "enterprise"].includes(billing.plan)) {
    return { plan: "UNKNOWN", zeroCostTargetMet: false, observabilityEnabled: null,
      failures: ["Vercel billing plan could not be verified."] };
  }
  const failures = [];
  if (billing.plan !== "hobby") failures.push(`The EUR 0 Vercel target is not met: current plan is ${billing.plan}.`);
  const items = billing.invoiceItems;
  // Current Pro+ uses observabilityBase + an entitlement, not observabilityPlus.
  const observabilityEnabled = billing.entitlements?.observability != null ||
    (items?.observabilityBase?.quantity ?? 0) > 0 ||
    (items?.observabilityPlus?.quantity ?? 0) > 0;
  if (observabilityEnabled) failures.push("Vercel Observability is enabled; usage-priced add-on requires review.");
  if (billing.plan !== "hobby" && !items) failures.push("Vercel add-on billing items could not be verified.");
  return { plan: billing.plan, zeroCostTargetMet: billing.plan === "hobby", observabilityEnabled, failures };
}
