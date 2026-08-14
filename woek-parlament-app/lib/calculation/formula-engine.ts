import { createHash } from "node:crypto";

/**
 * This is deliberately a small, typed AST evaluator. It accepts no formula
 * strings and never calls eval/Function. A formula must be approved in the
 * registry before it can be attached to an approved calculation record.
 */
export const UNIT_DIMENSIONS = {
  EUR: "CURRENCY",
  EUR_PER_YEAR: "CURRENCY_RATE",
  PERSONS: "COUNT",
  PERCENT: "PERCENTAGE",
  TONNES_CO2E: "MASS_CO2E",
  KWH: "ENERGY",
  HECTARES: "AREA",
  MINUTES: "TIME",
  CASES: "COUNT",
  CASES_PER_100000: "RATE",
  INDEX_POINTS: "INDEX",
  FACTOR: "FACTOR",
  UNITLESS: "UNITLESS"
} as const;

export type UnitCode = keyof typeof UNIT_DIMENSIONS;
export type Quantity = { value: number; unit: UnitCode };
export type FormulaAst =
  | { op: "INPUT"; name: string }
  | { op: "CONST"; value: number; unit: UnitCode }
  | { op: "ADD" | "SUBTRACT" | "MIN" | "MAX"; args: readonly FormulaAst[] }
  | { op: "MULTIPLY" | "DIVIDE"; args: readonly [FormulaAst, FormulaAst] }
  | { op: "ABS"; arg: FormulaAst }
  | { op: "CLAMP"; value: FormulaAst; min: FormulaAst; max: FormulaAst }
  | { op: "WEIGHTED_MEAN"; values: readonly FormulaAst[]; weights: readonly number[] };

export class FormulaError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "FormulaError";
    this.code = code;
  }
}

function finite(value: number, label: string) {
  if (!Number.isFinite(value)) throw new FormulaError("NON_FINITE_VALUE", `${label} must be finite.`);
  return value;
}

function quantity(value: number, unit: UnitCode, label: string): Quantity {
  return { value: finite(value, label), unit };
}

function sameUnit(left: Quantity, right: Quantity, operation: string) {
  if (left.unit !== right.unit) {
    throw new FormulaError(
      "INCOMPATIBLE_UNITS",
      `${operation} requires identical units; received ${left.unit} and ${right.unit}.`
    );
  }
}

function scalarUnit(unit: UnitCode) {
  return unit === "FACTOR" || unit === "UNITLESS";
}

function collapseScalarUnit(left: UnitCode, right: UnitCode): UnitCode {
  return left === "FACTOR" || right === "FACTOR" ? "FACTOR" : "UNITLESS";
}

function multiply(left: Quantity, right: Quantity): Quantity {
  if (scalarUnit(left.unit) && scalarUnit(right.unit)) return quantity(left.value * right.value, collapseScalarUnit(left.unit, right.unit), "multiplication result");
  if (scalarUnit(left.unit)) return quantity(left.value * right.value, right.unit, "multiplication result");
  if (scalarUnit(right.unit)) return quantity(left.value * right.value, left.unit, "multiplication result");
  throw new FormulaError("UNSUPPORTED_UNIT_PRODUCT", `Multiplication requires a FACTOR or UNITLESS operand; received ${left.unit} × ${right.unit}.`);
}

function divide(left: Quantity, right: Quantity): Quantity {
  if (right.value === 0) throw new FormulaError("DIVISION_BY_ZERO", "Division by zero is not permitted.");
  if (scalarUnit(right.unit)) return quantity(left.value / right.value, left.unit, "division result");
  if (left.unit === right.unit) return quantity(left.value / right.value, "FACTOR", "division result");
  throw new FormulaError("UNSUPPORTED_UNIT_DIVISION", `Division requires a scalar denominator or identical units; received ${left.unit} ÷ ${right.unit}.`);
}

function numericArray(items: readonly FormulaAst[], input: Record<string, Quantity>) {
  if (!items.length) throw new FormulaError("EMPTY_OPERATION", "A formula operation needs at least one input.");
  return items.map((item) => evaluateFormula(item, input));
}

export function evaluateFormula(ast: FormulaAst, input: Record<string, Quantity>): Quantity {
  switch (ast.op) {
    case "INPUT": {
      const value = input[ast.name];
      if (!value) throw new FormulaError("MISSING_INPUT", `Required formula input '${ast.name}' is missing.`);
      return quantity(value.value, value.unit, `input ${ast.name}`);
    }
    case "CONST": return quantity(ast.value, ast.unit, "constant");
    case "ADD": {
      const values = numericArray(ast.args, input);
      return values.slice(1).reduce((total, value) => {
        sameUnit(total, value, "Addition");
        return quantity(total.value + value.value, total.unit, "addition result");
      }, values[0]!);
    }
    case "SUBTRACT": {
      const values = numericArray(ast.args, input);
      return values.slice(1).reduce((total, value) => {
        sameUnit(total, value, "Subtraction");
        return quantity(total.value - value.value, total.unit, "subtraction result");
      }, values[0]!);
    }
    case "MIN": {
      const values = numericArray(ast.args, input);
      return values.slice(1).reduce((minimum, value) => {
        sameUnit(minimum, value, "Minimum");
        return value.value < minimum.value ? value : minimum;
      }, values[0]!);
    }
    case "MAX": {
      const values = numericArray(ast.args, input);
      return values.slice(1).reduce((maximum, value) => {
        sameUnit(maximum, value, "Maximum");
        return value.value > maximum.value ? value : maximum;
      }, values[0]!);
    }
    case "MULTIPLY": return multiply(evaluateFormula(ast.args[0], input), evaluateFormula(ast.args[1], input));
    case "DIVIDE": return divide(evaluateFormula(ast.args[0], input), evaluateFormula(ast.args[1], input));
    case "ABS": {
      const value = evaluateFormula(ast.arg, input);
      return quantity(Math.abs(value.value), value.unit, "absolute value");
    }
    case "CLAMP": {
      const value = evaluateFormula(ast.value, input);
      const minimum = evaluateFormula(ast.min, input);
      const maximum = evaluateFormula(ast.max, input);
      sameUnit(value, minimum, "Clamp");
      sameUnit(value, maximum, "Clamp");
      if (minimum.value > maximum.value) throw new FormulaError("INVALID_CLAMP_RANGE", "Clamp minimum must not exceed its maximum.");
      return quantity(Math.min(Math.max(value.value, minimum.value), maximum.value), value.unit, "clamp result");
    }
    case "WEIGHTED_MEAN": {
      if (!ast.values.length || ast.values.length !== ast.weights.length) throw new FormulaError("INVALID_WEIGHTED_MEAN", "Weighted mean values and weights must be non-empty and have the same length.");
      const values = ast.values.map((value) => evaluateFormula(value, input));
      const unit = values[0]!.unit;
      let totalWeight = 0;
      let total = 0;
      values.forEach((value, index) => {
        sameUnit(values[0]!, value, "Weighted mean");
        const weight = finite(ast.weights[index]!, "weight");
        if (weight < 0) throw new FormulaError("NEGATIVE_WEIGHT", "Weighted mean weights must be non-negative.");
        totalWeight += weight;
        total += value.value * weight;
      });
      if (totalWeight === 0) throw new FormulaError("ZERO_TOTAL_WEIGHT", "Weighted mean weights must sum to more than zero.");
      return quantity(total / totalWeight, unit, "weighted mean result");
    }
  }
}

export function calculateStateChange(input: {
  scenario: Quantity;
  counterfactual: Quantity;
  direction: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER" | "TARGET_RANGE" | "NON_MONOTONIC";
}) {
  sameUnit(input.scenario, input.counterfactual, "State change");
  const rawChange = quantity(input.scenario.value - input.counterfactual.value, input.scenario.unit, "state change");
  if (input.direction === "HIGHER_IS_BETTER") return { rawChange, directionAdjustedChange: rawChange, directionResolved: true };
  if (input.direction === "LOWER_IS_BETTER") return { rawChange, directionAdjustedChange: quantity(-rawChange.value, rawChange.unit, "direction-adjusted change"), directionResolved: true };
  // A target range or non-monotonic indicator needs an explicit approved
  // normalization rule; assuming the sign here would fabricate a norm.
  return { rawChange, directionAdjustedChange: null, directionResolved: false };
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, nested]) => [key, canonicalize(nested)]));
  }
  return value;
}

/** Hash only the reproducible computation inputs, never an editorial prose summary. */
export function calculationHash(input: {
  operands: Record<string, Quantity>;
  formulaAst: FormulaAst | null;
  formulaVersion: string | null;
  referenceSnapshot: string;
  assumptionIds: string[];
}) {
  return createHash("sha256").update(JSON.stringify(canonicalize(input))).digest("hex");
}
