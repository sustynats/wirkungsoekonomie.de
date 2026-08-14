import assert from "node:assert/strict";
import test from "node:test";
import { FormulaError, calculateStateChange, calculationHash, evaluateFormula } from "./formula-engine.ts";

test("a versioned formula produces the same result for the same inputs", () => {
  const formula = { op: "SUBTRACT", args: [{ op: "INPUT", name: "scenario" }, { op: "INPUT", name: "counterfactual" }] } as const;
  const input = { scenario: { value: 28.1, unit: "MINUTES" as const }, counterfactual: { value: 32.3, unit: "MINUTES" as const } };
  const result = evaluateFormula(formula, input);
  assert.equal(result.unit, "MINUTES");
  assert.ok(Math.abs(result.value - -4.2) < 1e-9);
  assert.equal(calculationHash({ operands: input, formulaAst: formula, formulaVersion: "1", referenceSnapshot: "master-items:1.3", assumptionIds: [] }), calculationHash({ operands: input, formulaAst: formula, formulaVersion: "1", referenceSnapshot: "master-items:1.3", assumptionIds: [] }));
});

test("incompatible units cannot be added", () => {
  const formula = { op: "ADD", args: [{ op: "INPUT", name: "cost" }, { op: "INPUT", name: "emissions" }] } as const;
  assert.throws(() => evaluateFormula(formula, { cost: { value: 10, unit: "EUR" }, emissions: { value: 1, unit: "TONNES_CO2E" } }), (error: unknown) => error instanceof FormulaError && error.code === "INCOMPATIBLE_UNITS");
});

test("a lower-is-better indicator flips the interpretation, not the raw observation", () => {
  const result = calculateStateChange({ scenario: { value: 28.1, unit: "MINUTES" }, counterfactual: { value: 32.3, unit: "MINUTES" }, direction: "LOWER_IS_BETTER" });
  assert.ok(Math.abs(result.rawChange.value - -4.2) < 1e-9);
  assert.ok(Math.abs((result.directionAdjustedChange?.value ?? 0) - 4.2) < 1e-9);
});

test("target-range indicators require an explicit normalization rule", () => {
  const result = calculateStateChange({ scenario: { value: 14, unit: "PERCENT" }, counterfactual: { value: 12, unit: "PERCENT" }, direction: "TARGET_RANGE" });
  assert.equal(result.directionAdjustedChange, null);
  assert.equal(result.directionResolved, false);
});
