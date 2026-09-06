import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_ROOT, OUTPUT, SOURCE, HANDOFF, COMMENT, CHILDREN, RNA, APPROVED, buildP26, sourceCoverage, sha256 } from './materialize-berlin-spd-p26.mjs';

export function validateP26(result = JSON.parse(fs.readFileSync(path.join(APP_ROOT, OUTPUT), 'utf8')), { requireTerminal = true } = {}) {
  const expected = buildP26();
  assert.deepEqual(result, expected.result, 'Verbatim P26 source/Fach serialization drift');
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(APP_ROOT, SOURCE))), expected.fullSource, 'Full canonical P26 source drift');
  const body = fs.readFileSync(path.join(APP_ROOT, HANDOFF), 'utf8');
  const rows = result.terminal_records;
  const byId = new Map(rows.map(row => [row.object_id, row]));
  assert.equal(byId.size, rows.length);
  const childIds = CHILDREN.map(([n, atom, ordinal, hash]) => `BE-SPD-2026-SU-${String(n).padStart(4, '0')}${atom === null ? '' : `-A${String(atom).padStart(2, '0')}`}-C${String(ordinal).padStart(2, '0')}-${hash.slice(0, 12)}`);
  assert.deepEqual(new Set(result.coverage.generated_child_ids), new Set(childIds));
  assert.deepEqual(new Set(rows.map(row => row.object_id)), new Set([...result.coverage.source_unit_ids, ...result.coverage.original_atom_ids, ...childIds]));
  for (const row of rows) {
    assert.equal(sha256(row.source_text), row.source_text_sha256);
    assert.ok(/^BE-SPD-2026-SU-03(?:0[3-9]|1[0-8])(?:-|$)/.test(row.object_id));
    assert.deepEqual(row.pdf_pages, [26]);
    assert.equal(row.counts_as_effect_object, [APPROVED, RNA].includes(row.terminal_fach_state));
    for (const field of ['dns_mapping', 'recommendation', 'score', 'party_judgement']) assert.ok(!(field in row));
    if (row.authoritative_fach_text) {
      assert.equal(row.fach_issue_comment_id, COMMENT);
      assert.ok(body.includes(row.authoritative_fach_text), row.object_id);
      assert.equal(sha256(row.authoritative_fach_text), row.fach_source_sha256);
      for (const field of ['impact_direction', 'evidence_level', 'exact_reason_code', 'exact_reason']) if (row[field]) assert.ok(row.authoritative_fach_text.includes(row[field]), `Unsupplied ${field}: ${row.object_id}`);
    }
    if (row.shared_reality_check_verbatim) assert.ok(body.includes(row.shared_reality_check_verbatim));
    if (row.terminal_fach_state === RNA) assert.ok(row.exact_reason && row.exact_reason_code && !row.impact_direction && !row.evidence_level);
    if (row.terminal_fach_state === APPROVED) assert.ok(row.impact_direction && row.evidence_level);
    for (const parentId of row.parent_object_ids ?? []) {
      const parent = byId.get(parentId);
      assert.ok(parent && !parent.counts_as_effect_object && parent.source_text.includes(row.source_text));
      assert.ok((parent.covered_by ?? parent.superseded_by).includes(row.object_id));
      assert.equal(byId.get(row.source_unit_id).source_text.slice(...row.source_span_utf16), row.source_text);
    }
    for (const child of row.superseded_by ?? []) assert.ok(byId.get(child)?.parent_object_ids.includes(row.object_id));
  }
  const proof = sourceCoverage(rows);
  assert.deepEqual(proof.uncovered_source_spans, result.coverage.uncovered_source_spans);
  assert.deepEqual(proof.grammar_separators, result.grammar_separators);
  assert.deepEqual(result.coverage.cross_page_objects_consumed_once, []);
  assert.deepEqual(result.coverage.excluded_previously_consumed_cross_page_objects, ['BE-SPD-2026-SU-0302']);
  assert.ok(Object.values(result.constraints).every(value => value === false));
  if (requireTerminal) {
    assert.deepEqual(proof.uncovered_source_spans, [], 'P26 exact source coverage is not terminal');
    assert.deepEqual(result.coverage.terminal_pages, [26]);
    assert.equal(result.coverage.release_or_residual_activation_allowed, true);
  }
  return { serialization_integrity: 'PASS', fach_page_terminal: result.coverage.terminal_pages.includes(26), gate: result.coverage.gate, source_units: result.coverage.source_unit_ids.length, original_atoms: result.coverage.original_atom_ids.length, authorized_children: childIds.length, records: rows.length, active_explicit: result.coverage.explicit_fach_approved_ids.length, active_rnaa: result.coverage.reviewed_not_assessable_ids.length, zero_count: result.coverage.zero_count_ids.length, missing_authority: proof.uncovered_source_spans };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.slice(2).every(arg => arg === '--require-terminal'));
  console.log(JSON.stringify(validateP26(), null, 2));
}
