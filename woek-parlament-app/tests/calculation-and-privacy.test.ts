import assert from "node:assert/strict";
import test from "node:test";
import { evaluateFormula, FormulaEvaluationError, type CalculationOperand, type FormulaDefinition } from "@/lib/calculation/formula-engine";
import { UnitValidationError } from "@/lib/calculation/units";
import { assertExternalReviewSafe } from "@/lib/review/privacy";
import { createReviewZip } from "@/lib/review/zip";
import type { ReviewBatchPackage } from "@/lib/review/contracts";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { fetchAllDipPages } from "@/lib/dip";

const sourceOperand = (operandId: string, value: number, unit: CalculationOperand["unit"]): CalculationOperand => ({
  operandId,
  value,
  unit,
  sourceId: "SRC-1",
  sourceLocation: "Tabelle 1",
  observationDate: "2026-08-14",
  territorialLevel: "DE",
  qualityStatus: "HIGH",
  origin: "SOURCE"
});

test("deterministic formula produces the same state change", () => {
  const definition: FormulaDefinition = {
    formulaId: "STATE_CHANGE",
    version: "1.0.0",
    outputUnit: "MINUTES",
    status: "ACTIVE",
    methodologicalBasis: "scenario minus counterfactual",
    expression: { op: "SUBTRACT", left: { op: "OPERAND", operandId: "scenario" }, right: { op: "OPERAND", operandId: "counterfactual" } }
  };
  const first = evaluateFormula(definition, [sourceOperand("scenario", 28.1, "MINUTES"), sourceOperand("counterfactual", 32.3, "MINUTES")]);
  const second = evaluateFormula(definition, [sourceOperand("scenario", 28.1, "MINUTES"), sourceOperand("counterfactual", 32.3, "MINUTES")]);
  assert.ok(Math.abs(first.result.value - (-4.2)) < Number.EPSILON * 32);
  assert.equal(first.result.unit, "MINUTES");
  assert.equal(first.calculationHash, second.calculationHash);
});

test("incompatible units cannot be added", () => {
  const definition: FormulaDefinition = {
    formulaId: "INVALID_ADD",
    version: "1.0.0",
    outputUnit: "EUR",
    status: "ACTIVE",
    methodologicalBasis: "test",
    expression: { op: "ADD", left: { op: "OPERAND", operandId: "money" }, right: { op: "OPERAND", operandId: "emissions" } }
  };
  assert.throws(() => evaluateFormula(definition, [sourceOperand("money", 1, "EUR"), sourceOperand("emissions", 1, "TONNES_CO2E")]), UnitValidationError);
});

test("unverified generated numbers cannot enter a productive calculation", () => {
  const definition: FormulaDefinition = {
    formulaId: "SOURCE_ONLY",
    version: "1.0.0",
    outputUnit: "PERSONS",
    status: "ACTIVE",
    methodologicalBasis: "test",
    expression: { op: "OPERAND", operandId: "proposed" }
  };
  const generated = { ...sourceOperand("proposed", 12, "PERSONS"), origin: "UNVERIFIED_GENERATED_NUMERIC_VALUE" as const };
  assert.throws(() => evaluateFormula(definition, [generated]), FormulaEvaluationError);
});

test("external review exports reject local paths and file URIs", () => {
  const localPath = `/${["Users", "example", "private.txt"].join("/")}`;
  const fileUri = ["file:", "//", "/private/document.pdf"].join("");
  assert.throws(() => assertExternalReviewSafe({ source: localPath }));
  assert.throws(() => assertExternalReviewSafe({ source: fileUri }));
  assert.doesNotThrow(() => assertExternalReviewSafe({ source: "https://dip.bundestag.de/vorgang/123" }));
});

test("review ZIP contains only the defined review contract", async () => {
  const batch: ReviewBatchPackage = {
    schema_version: "1.0.0",
    batch_code: "WOEK-REVIEW-2026-0001",
    review_type: "FULL_REVIEW",
    created_at: "2026-08-14T12:00:00.000Z",
    package_hash: "b".repeat(64),
    cases: [{
      case_id: "11111111-1111-4111-8111-111111111111",
      case_title: "Beispielvorgang",
      review_type: "FULL_REVIEW",
      previous_review_id: null,
      decision: { decision_unit_id: null, decision_object: "Abgegrenzter Gegenstand", decision_date: "2026-08-14", parliamentary_status: "amtlich belegt", final_version: "Fassung 1", actual_outcome: null, vote_type: null, vote_result: {} },
      fact_package: {},
      source_manifest: [{ source_id: "SRC-1", title: "Amtliche Quelle", institution: "Deutscher Bundestag – DIP", url: "https://dip.bundestag.de/vorgang/1", document_date: "2026-08-14", retrieved_at: "2026-08-14T12:00:00.000Z", document_type: "DIP_VORGANG", version: null, temporal_class: "AVAILABLE_AT_DECISION_TIME", relevant_locations: [] }],
      excerpts: [],
      evidence: { ex_ante_source_ids: ["SRC-1"], ex_post_source_ids: [] },
      woek_reference_snapshot: { version: "1" },
      review_request: { questions_to_answer: ["Prüfen"], required_outputs: ["Struktur"], known_data_gaps: [], known_source_conflicts: [], calculation_inputs_available: [], calculation_inputs_missing: [] },
      package_hash: "a".repeat(64)
    }]
  };
  const zip = await createReviewZip(batch);
  assert.equal(zip.filename, "woek-review-2026-0001.zip");
  assert.ok(zip.bytes.byteLength > 0);
});

test("protected-schema writes carry the PostgREST content profile", async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_URL = "https://database.example.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  let requestHeaders: Headers | undefined;
  globalThis.fetch = async (_input, init) => {
    requestHeaders = new Headers(init?.headers);
    return new Response("[]", { status: 201, headers: { "content-type": "application/json" } });
  };

  try {
    await supabaseRest("parliament.parliaments", { method: "POST", body: "{}" });
    assert.equal(requestHeaders?.get("Accept-Profile"), "parliament");
    assert.equal(requestHeaders?.get("Content-Profile"), "parliament");
    assert.equal(requestHeaders?.get("apikey"), "test-key");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  }
});

test("successful minimal database writes do not require a JSON body", async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_URL = "https://database.example.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  globalThis.fetch = async () => new Response(null, { status: 201 });

  try {
    const result = await supabaseRest<void>("parliament.parliaments", { method: "POST", body: "{}" });
    assert.equal(result, undefined);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  }
});

test("DIP's repeated final cursor closes a complete paginated import", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.DIP_API_KEY;
  process.env.DIP_API_KEY = "test-key";
  let requestCount = 0;
  globalThis.fetch = async () => {
    requestCount += 1;
    return Response.json(requestCount === 1
      ? { documents: [{ id: "first" }], cursor: "final-page", numFound: 2 }
      : { documents: [{ id: "second" }], cursor: "final-page", numFound: 2 });
  };

  try {
    const result = await fetchAllDipPages("vorgang");
    assert.equal(result.pageCount, 2);
    assert.deepEqual(result.documents, [{ id: "first" }, { id: "second" }]);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.DIP_API_KEY;
    else process.env.DIP_API_KEY = originalKey;
  }
});
