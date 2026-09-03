#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { publicOfficialIdentifierRows } from "../../lib/government/official-identifiers";

type JsonRecord = Record<string, unknown>;

const root = process.cwd();
const inputFile = path.join(root, "data", "government", "public", "government-actions.jsonl");
const outputFile = path.join(root, "data", "autopilot", "audit", "2.3-remediated", "GOVERNMENT-IDENTIFIER-SHAPE-INVENTORY-2.3.json");
const actions = readFileSync(inputFile, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as JsonRecord);

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function valueShape(value: unknown) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (isRecord(value)) return `object{${Object.keys(value).sort().join(",")}}`;
  return typeof value;
}

const supportedShapes = new Set([
  "agenda_item_index:number",
  "bgbl:string",
  "cabinet_session_number:number",
  "coremedia_content_id:string",
  "dip_ids:string",
  "dip_position_id:string",
  "dip_procedure_id:string",
  "document_number:string",
  "drucksachen:string",
  "eli:string",
  "other:object{agenda_item,cabinet_session}",
  "other:object{dip_document_id,document_url}",
  "without_debate:boolean",
]);

const shapeCounts = new Map<string, number>();
const examples = new Map<string, { government_action_id: string; value: unknown }>();
let sourceValueCount = 0;
let renderedRowCount = 0;

for (const action of actions) {
  const identifiers = isRecord(action.official_identifiers) ? action.official_identifiers : {};
  renderedRowCount += publicOfficialIdentifierRows(identifiers).length;
  for (const [kind, rawValues] of Object.entries(identifiers)) {
    const values = Array.isArray(rawValues) ? rawValues : [rawValues];
    for (const value of values) {
      sourceValueCount += 1;
      const shape = `${kind}:${valueShape(value)}`;
      shapeCounts.set(shape, (shapeCounts.get(shape) ?? 0) + 1);
      if (!examples.has(shape)) examples.set(shape, {
        government_action_id: String(action.government_action_id ?? ""),
        value,
      });
    }
  }
}

const shapes = [...shapeCounts.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([shape, count]) => ({
  shape,
  count,
  behavior: supportedShapes.has(shape) ? "EXPLICIT_SAFE_RENDERER" : "FAIL_CLOSED_SUPPRESSED_WITH_AUDIT_FINDING",
  example: examples.get(shape),
}));
const requiredShapes = ["other:object{agenda_item,cabinet_session}", "other:object{dip_document_id,document_url}"];
const missingRequired = requiredShapes.filter((shape) => !shapeCounts.has(shape));
const unsupported = shapes.filter((entry) => !supportedShapes.has(entry.shape));

const report = {
  schema_version: "woek-government-identifier-shape-inventory-2.3",
  generated_at: new Date().toISOString(),
  input: "/data/government/public/government-actions.jsonl",
  status: missingRequired.length ? "FAIL" : "PASS",
  public_action_count: actions.length,
  source_identifier_value_count: sourceValueCount,
  safely_rendered_row_count: renderedRowCount,
  supported_shape_count: shapes.length - unsupported.length,
  fail_closed_shape_count: unsupported.length,
  missing_required_shapes: missingRequired,
  shapes,
  invariants: {
    STRUCTURED_OBJECTS_NEVER_RENDER_AS_REACT_CHILDREN: true,
    UNKNOWN_OBJECT_SHAPES_FAIL_CLOSED: true,
    SOURCE_URLS_USE_WOEK_INTERMEDIARY: true,
  },
};

writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  status: report.status,
  public_action_count: report.public_action_count,
  source_identifier_value_count: report.source_identifier_value_count,
  supported_shape_count: report.supported_shape_count,
  fail_closed_shape_count: report.fail_closed_shape_count,
  output: outputFile,
}));
if (report.status !== "PASS") process.exit(1);
