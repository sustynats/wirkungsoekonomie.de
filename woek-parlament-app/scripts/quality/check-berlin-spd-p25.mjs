import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_ROOT, OUTPUT, HANDOFF, SUPPLEMENT, COMMENT, SUPPLEMENT_COMMENT, RNA, APPROVED, buildP25, sourceCoverage, sha256 } from './materialize-berlin-spd-p25.mjs';

export function validateP25(result = JSON.parse(fs.readFileSync(path.join(APP_ROOT, OUTPUT), 'utf8')), { requireTerminal = false } = {}) {
  assert.deepEqual(result, buildP25(), 'Verbatim P25 authority/source serialization drift');
  const authorities = new Map([[COMMENT, fs.readFileSync(path.join(APP_ROOT, HANDOFF), 'utf8')], [SUPPLEMENT_COMMENT, fs.readFileSync(path.join(APP_ROOT, SUPPLEMENT), 'utf8')]]);
  const rows = result.terminal_records;
  const byId = new Map(rows.map(r => [r.object_id, r]));
  assert.equal(byId.size, rows.length);
  for (const row of rows) {
    assert.equal(sha256(row.source_text), row.source_text_sha256);
    assert.equal(row.counts_as_effect_object, [APPROVED, RNA].includes(row.terminal_fach_state));
    for (const field of ['dns_mapping', 'recommendation', 'score', 'party_judgement']) assert.ok(!(field in row));
    if (row.authoritative_fach_text) {
      assert.ok(authorities.get(row.fach_issue_comment_id)?.includes(row.authoritative_fach_text));
      assert.equal(sha256(row.authoritative_fach_text), row.fach_source_sha256);
      for (const field of ['impact_direction', 'materiality', 'evidence_level', 'exact_reason_code', 'exact_reason']) if (row[field]) assert.ok(row.authoritative_fach_text.includes(row[field]), `Unsupplied ${field}: ${row.object_id}`);
    }
    if (row.terminal_fach_state === RNA) assert.ok(row.exact_reason && row.exact_reason_code && !row.impact_direction && !row.evidence_level);
    if (row.terminal_fach_state === APPROVED) assert.ok(row.impact_direction);
    for (const parentId of row.parent_object_ids ?? []) {
      const parent = byId.get(parentId);
      assert.ok(parent && !parent.counts_as_effect_object && parent.source_text.includes(row.source_text));
      assert.ok((parent.covered_by ?? parent.superseded_by).includes(row.object_id));
      assert.ok(row.object_id.endsWith(row.source_text_sha256.slice(0, 12)));
      assert.equal(byId.get(row.source_unit_id).source_text.slice(...row.source_span_utf16), row.source_text);
    }
    for (const child of row.superseded_by ?? []) assert.ok(byId.get(child)?.parent_object_ids.includes(row.object_id));
  }
  const proof = sourceCoverage(rows);
  assert.deepEqual(proof.uncovered_source_spans, result.coverage.uncovered_source_spans);
  assert.deepEqual(proof.grammar_separators, result.grammar_separators);
  assert.deepEqual(byId.get('BE-SPD-2026-SU-0302').pdf_pages, [25, 26]);
  assert.deepEqual(result.coverage.cross_page_objects_consumed_once, ['BE-SPD-2026-SU-0302']);
  assert.ok(!byId.has('BE-SPD-2026-SU-0290') && !byId.has('BE-SPD-2026-SU-0303'));
  assert.ok(Object.values(result.constraints).every(v => v === false));
  if (requireTerminal) {
    assert.deepEqual(proof.uncovered_source_spans, [], 'P25 source-bound admission BLOCKED: explicit WÖk authority is absent for an exact source span. P25 must not leave the residual; P26 remains unauthorised.');
    assert.deepEqual(result.coverage.terminal_pages, [25]);
    assert.equal(result.coverage.release_or_residual_activation_allowed, true);
  }
  return { serialization_integrity: 'PASS', fach_page_terminal: result.coverage.terminal_pages.includes(25), gate: result.coverage.gate, source_units: result.coverage.source_unit_ids.length, original_atoms: result.coverage.original_atom_ids.length, authorized_children: result.coverage.generated_child_ids.length, records: rows.length, active_explicit: result.coverage.explicit_fach_approved_ids.length, active_rnaa: result.coverage.reviewed_not_assessable_ids.length, zero_count: result.coverage.zero_count_ids.length, missing_authority: proof.uncovered_source_spans };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.slice(2).every(arg => arg === '--require-terminal'));
  console.log(JSON.stringify(validateP25(undefined, { requireTerminal: process.argv.includes('--require-terminal') }), null, 2));
}
