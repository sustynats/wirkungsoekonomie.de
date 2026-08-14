export const supportedUnits = [
  "UNITLESS",
  "EUR",
  "EUR_PER_YEAR",
  "PERSONS",
  "PERCENT",
  "TONNES_CO2E",
  "KWH",
  "HECTARES",
  "MINUTES",
  "CASES",
  "CASES_PER_100000",
  "INDEX_POINTS"
] as const;

export type Unit = typeof supportedUnits[number] | `COMPOSITE:${string}`;

export type Quantity = { value: number; unit: Unit };

export class UnitValidationError extends Error {}

export function assertFiniteQuantity(value: Quantity) {
  if (!Number.isFinite(value.value)) throw new UnitValidationError("Calculation values must be finite numbers.");
}

export function add(left: Quantity, right: Quantity): Quantity {
  assertFiniteQuantity(left);
  assertFiniteQuantity(right);
  if (left.unit !== right.unit) throw new UnitValidationError(`Cannot add ${left.unit} and ${right.unit}.`);
  return { value: left.value + right.value, unit: left.unit };
}

export function subtract(left: Quantity, right: Quantity): Quantity {
  assertFiniteQuantity(left);
  assertFiniteQuantity(right);
  if (left.unit !== right.unit) throw new UnitValidationError(`Cannot subtract ${right.unit} from ${left.unit}.`);
  return { value: left.value - right.value, unit: left.unit };
}

export function multiply(left: Quantity, right: Quantity): Quantity {
  assertFiniteQuantity(left);
  assertFiniteQuantity(right);
  if (left.unit === "UNITLESS") return { value: left.value * right.value, unit: right.unit };
  if (right.unit === "UNITLESS") return { value: left.value * right.value, unit: left.unit };
  return { value: left.value * right.value, unit: `COMPOSITE:${left.unit}*${right.unit}` };
}

export function divide(left: Quantity, right: Quantity): Quantity {
  assertFiniteQuantity(left);
  assertFiniteQuantity(right);
  if (right.value === 0) throw new UnitValidationError("Division by zero is not permitted.");
  if (left.unit === right.unit) return { value: left.value / right.value, unit: "UNITLESS" };
  if (right.unit === "UNITLESS") return { value: left.value / right.value, unit: left.unit };
  return { value: left.value / right.value, unit: `COMPOSITE:${left.unit}/${right.unit}` };
}
