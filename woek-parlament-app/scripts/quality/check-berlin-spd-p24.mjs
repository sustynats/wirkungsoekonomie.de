import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_ROOT, OUTPUT, HANDOFF, DELTA, APPROVED, RNA, buildP24, sha256 } from './materialize-berlin-spd-p24.mjs';

export function validateP24(result = JSON.parse(fs.readFileSync(path.join(APP_ROOT, OUTPUT), 'utf8'))) {
  assert.deepEqual(result, buildP24(), 'Exact authoritative P24 materialisation drift');
  const records = result.terminal_records;
  const byId = new Map(records.map(row => [row.object_id, row]));
  assert.equal(byId.size, records.length);
  const authority = new Map([[5542647318, fs.readFileSync(path.join(APP_ROOT, HANDOFF), 'utf8')], [5555260265, fs.readFileSync(path.join(APP_ROOT, DELTA), 'utf8')]]);
  const forbiddenFields = ['problem_review', 'goal_review', 'dns_mapping', 'recommendation', 'score', 'party_judgement'];
  for (const row of records) {
    assert.equal(sha256(row.source_text), row.source_text_sha256);
    for (const field of forbiddenFields) assert.ok(!(field in row), `Unsupplied Fach: ${field}`);
    assert.equal(row.counts_as_effect_object, [RNA, APPROVED].includes(row.terminal_fach_state));
    if (row.authoritative_fach_text) {
      assert.ok(authority.get(row.fach_issue_comment_id).includes(row.authoritative_fach_text));
      assert.equal(sha256(row.authoritative_fach_text), row.fach_source_sha256);
      assert.ok(authority.get(5555260265).includes(row.correction_binding_text));
      for (const field of ['impact_direction', 'evidence_level', 'exact_reason_code', 'exact_reason']) if (row[field]) assert.ok(`${row.authoritative_fach_text}\n${row.correction_binding_text}`.includes(row[field]), `Nonverbatim ${field}`);
    }
    if (row.terminal_fach_state === RNA) {
      assert.ok(row.exact_reason_code && row.exact_reason);
      assert.ok(!row.impact_direction && !row.evidence_level, 'RNAA must not acquire direction/evidence');
    }
    if (row.terminal_fach_state === APPROVED) assert.ok(row.impact_direction && row.evidence_level);
    for (const parentId of row.parent_object_ids ?? []) {
      const parent = byId.get(parentId);
      assert.ok(parent && !parent.counts_as_effect_object);
      assert.ok(parent.source_text.includes(row.source_text));
      assert.ok((parent.covered_by ?? parent.superseded_by ?? []).includes(row.object_id));
      assert.ok(row.object_id.endsWith(row.source_text_sha256.slice(0, 12)));
    }
    for (const parentId of row.replaces_object_ids ?? []) assert.ok(byId.get(parentId)?.superseded_by?.includes(row.object_id));
    for (const childId of row.superseded_by ?? []) assert.ok(byId.has(childId));
    if (row.source_span_utf16) assert.equal(byId.get(row.source_unit_id).source_text.slice(...row.source_span_utf16), row.source_text);
  }
  const delimiterProof = [];
  for (const unit of records.filter(row => row.source_object_kind === 'SOURCE_UNIT')) {
    const leaves = unit.covered_by ? records.filter(row => row.source_unit_id === unit.object_id && row.object_id !== unit.object_id && !row.superseded_by) : [unit];
    const coverage = new Uint8Array(unit.source_text.length);
    for (const leaf of [...leaves, ...result.grammar_separators.filter(row => row.source_unit_id === unit.object_id)]) {
      const start = unit.source_text.indexOf(leaf.source_text);
      assert.ok(start >= 0);
      const explicitStart = leaf.source_span_utf16?.[0] ?? start;
      assert.equal(unit.source_text.slice(explicitStart, explicitStart + leaf.source_text.length), leaf.source_text);
      if (!leaf.disposition) assert.equal(unit.source_text.indexOf(leaf.source_text, start + 1), -1);
      for (let i = explicitStart; i < explicitStart + leaf.source_text.length; i++) {
        assert.equal(coverage[i], 0, `${unit.object_id}: overlapping leaves`);
        coverage[i] = 1;
      }
    }
    for (let i = 0; i < coverage.length;) {
      if (coverage[i]) { i++; continue; }
      const start = i;
      while (i < coverage.length && !coverage[i]) i++;
      const text = unit.source_text.slice(start, i);
      assert.match(text, /^[\s,;:.]*$/u, `${unit.object_id}: uncovered source clause: ${text}`);
      delimiterProof.push({ source_unit_id: unit.object_id, source_span_utf16: [start, i], source_text: text, role: 'SOURCE_DELIMITER_ONLY_NO_SEMANTIC_CONTENT' });
    }
  }
  for (const withdrawn of result.withdrawn_non_source_objects) assert.ok(!records.some(row => row.source_text_sha256 === withdrawn.source_text_sha256));
  assert.deepEqual(result.coverage.terminal_pages, [24]);
  assert.deepEqual(result.coverage.remaining_p24_source_object_ids, []);
  assert.deepEqual(byId.get('BE-SPD-2026-SU-0290').pdf_pages, [24, 25]);
  assert.deepEqual(result.coverage.cross_page_objects_consumed_once, ['BE-SPD-2026-SU-0290']);
  assert.equal(byId.has('BE-SPD-2026-SU-0291'), false);
  assert.ok(Object.values(result.constraints).every(value => value === false));
  return { gate: result.coverage.gate, source_units: result.coverage.source_unit_ids.length, original_atoms: result.coverage.original_atom_ids.length, children: result.coverage.generated_child_ids.length, terminal_records: records.length, active_explicit: result.coverage.explicit_fach_approved_ids.length, active_rnaa: result.coverage.reviewed_not_assessable_ids.length, zero_count: result.coverage.zero_count_ids.length, non_delimiter_source_coverage: '100%', delimiter_proof: delimiterProof, remaining_p24_source_objects: 0, programme_terminal: false };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(validateP24(), null, 2));
