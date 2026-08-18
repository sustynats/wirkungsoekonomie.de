import { add, assertFiniteQuantity, divide, multiply, subtract, type Quantity, type Unit } from "@/lib/calculation/units";
import { sha256 } from "@/lib/review/privacy";

export type CalculationKind = "QUANTIFIED_OBSERVED_EFFECT" | "QUANTIFIED_EXPECTED_EFFECT" | "RULE_BASED_ASSESSMENT" | "NOT_ROBUSTLY_QUANTIFIABLE";
export type OperandOrigin = "SOURCE" | "DERIVED" | "ASSUMPTION" | "UNVERIFIED_GENERATED_NUMERIC_VALUE";

export type CalculationOperand = Quantity & {
  operandId: string;
  sourceId: string;
  sourceLocation: string;
  observationDate: string | null;
  territorialLevel: string | null;
  qualityStatus: "HIGH" | "MEDIUM" | "LIMITED" | "UNKNOWN";
  origin: OperandOrigin;
};

export type FormulaNode =
  | { op: "OPERAND"; operandId: string }
  | { op: "ADD" | "SUBTRACT" | "MULTIPLY" | "DIVIDE"; left: FormulaNode; right: FormulaNode }
  | { op: "ABS"; value: FormulaNode }
  | { op: "MIN" | "MAX"; values: FormulaNode[] }
  | { op: "CLAMP"; value: FormulaNode; minimum: FormulaNode; maximum: FormulaNode };

export type FormulaDefinition = {
  formulaId: string;
  version: string;
  outputUnit: Unit;
  expression: FormulaNode;
  methodologicalBasis: string;
  status: "ACTIVE" | "RETIRED";
};

export class FormulaEvaluationError extends Error {}

function evaluateNode(node: FormulaNode, operands: Map<string, CalculationOperand>): Quantity {
  if (node.op === "OPERAND") {
    const operand = operands.get(node.operandId);
    if (!operand) throw new FormulaEvaluationError(`Missing calculation operand ${node.operandId}.`);
    if (operand.origin === "UNVERIFIED_GENERATED_NUMERIC_VALUE") {
      throw new FormulaEvaluationError(`Unverified generated numeric operand ${node.operandId} cannot enter a productive calculation.`);
    }
    assertFiniteQuantity(operand);
    return { value: operand.value, unit: operand.unit };
  }
  if (node.op === "ABS") {
    const value = evaluateNode(node.value, operands);
    return { value: Math.abs(value.value), unit: value.unit };
  }
  if (node.op === "ADD") return add(evaluateNode(node.left, operands), evaluateNode(node.right, operands));
  if (node.op === "SUBTRACT") return subtract(evaluateNode(node.left, operands), evaluateNode(node.right, operands));
  if (node.op === "MULTIPLY") return multiply(evaluateNode(node.left, operands), evaluateNode(node.right, operands));
  if (node.op === "DIVIDE") return divide(evaluateNode(node.left, operands), evaluateNode(node.right, operands));
  if (node.op === "MIN" || node.op === "MAX") {
    if (node.values.length === 0) throw new FormulaEvaluationError(`${node.op} requires at least one value.`);
    const values = node.values.map((value) => evaluateNode(value, operands));
    const unit = values[0]?.unit;
    if (!unit || values.some((value) => value.unit !== unit)) throw new FormulaEvaluationError(`${node.op} requires compatible units.`);
    return { value: node.op === "MIN" ? Math.min(...values.map((value) => value.value)) : Math.max(...values.map((value) => value.value)), unit };
  }
  if (node.op !== "CLAMP") throw new FormulaEvaluationError("Unsupported formula operation.");
  const value = evaluateNode(node.value, operands);
  const minimum = evaluateNode(node.minimum, operands);
  const maximum = evaluateNode(node.maximum, operands);
  if (value.unit !== minimum.unit || value.unit !== maximum.unit) throw new FormulaEvaluationError("CLAMP requires compatible units.");
  if (minimum.value > maximum.value) throw new FormulaEvaluationError("CLAMP minimum exceeds maximum.");
  return { value: Math.min(Math.max(value.value, minimum.value), maximum.value), unit: value.unit };
}

export function evaluateFormula(definition: FormulaDefinition, suppliedOperands: CalculationOperand[]) {
  if (definition.status !== "ACTIVE") throw new FormulaEvaluationError(`Formula ${definition.formulaId} is not active.`);
  const operands = new Map(suppliedOperands.map((operand) => [operand.operandId, operand]));
  const result = evaluateNode(definition.expression, operands);
  if (result.unit !== definition.outputUnit) {
    throw new FormulaEvaluationError(`Formula output unit ${result.unit} does not match declared unit ${definition.outputUnit}.`);
  }
  return {
    result,
    calculationHash: sha256({ formula: definition, operands: suppliedOperands.map(({ value, unit, operandId, sourceId }) => ({ value, unit, operandId, sourceId })) })
  };
}
