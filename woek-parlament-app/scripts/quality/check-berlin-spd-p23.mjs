import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_ROOT, OUTPUT, buildP23, sha256 } from './materialize-berlin-spd-p23.mjs';

export function validateP23(result = JSON.parse(fs.readFileSync(path.join(APP_ROOT, OUTPUT), 'utf8'))) {
  assert.deepEqual(result, buildP23(), 'Exact authoritative P23 materialisation drift');
  const records = result.terminal_records;
  const byId = new Map(records.map(row => [row.object_id, row]));
  assert.equal(byId.size, records.length, 'Duplicate terminal ID');
  const expectedActiveOriginal = [
    [266, 2], [268, 3], [268, 4], [268, 5], [269, 2], [270, 2], [270, 3],
    [271, 1], [271, 3], [273, 1], [273, 2], [273, 3], [275, 1], [275, 4],
    [276, 3], [276, 6], [276, 7], [278, 1], [279, 2],
    [280, 1], [280, 2], [280, 3], [280, 4], [280, 5], [280, 6],
  ].map(([unit, atom]) => `BE-SPD-2026-SU-${String(unit).padStart(4, '0')}-A${String(atom).padStart(2, '0')}`);
  const expectedActiveChild = [
    'BE-SPD-2026-SU-0268-C02-6fa2f67b3d2c',
    'BE-SPD-2026-SU-0269-C01-7ea818c99e4c',
    'BE-SPD-2026-SU-0270-C02-5017bce4b525',
    'BE-SPD-2026-SU-0273-C01-f625c4b03abb',
    'BE-SPD-2026-SU-0273-C02-7cd52ea2b729',
    'BE-SPD-2026-SU-0276-C03-24aa9535a948',
    'BE-SPD-2026-SU-0276-A04-C01-557bb37df14b',
    'BE-SPD-2026-SU-0276-A04-C02-5a23cefed5d4',
    'BE-SPD-2026-SU-0279-C01-6b23ff019563',
  ];
  assert.deepEqual(records.filter(row => row.counts_as_effect_object).map(row => row.object_id).sort(), [...expectedActiveOriginal, ...expectedActiveChild].sort());
  const forbiddenFields = ['impact_direction', 'evidence_level', 'problem_review', 'goal_review', 'dns_mapping', 'recommendation', 'score', 'party_judgement'];
  for (const row of records) {
    assert.equal(sha256(row.source_text), row.source_text_sha256);
    for (const field of forbiddenFields) assert.ok(!(field in row), `Unsupplied Fach field ${field}`);
    assert.equal(row.counts_as_effect_object, row.terminal_fach_state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON');
    if (row.counts_as_effect_object) assert.ok(row.exact_reason && row.exact_reason_code);
    for (const parentId of row.parent_object_ids ?? []) {
      const parent = byId.get(parentId);
      assert.ok(parent && !parent.counts_as_effect_object, 'Child parent is absent/counting');
      assert.ok(parent.source_text.includes(row.source_text));
      assert.ok((parent.covered_by ?? parent.superseded_by ?? []).includes(row.object_id), 'Reverse child lineage absent');
      assert.ok(row.object_id.endsWith(row.source_text_sha256.slice(0, 12)));
    }
    for (const replaced of row.replaces_object_ids ?? []) assert.ok(byId.get(replaced)?.superseded_by?.includes(row.object_id));
    for (const replacement of row.superseded_by ?? []) assert.ok(byId.has(replacement));
    if (row.source_span_utf16) {
      const unit = byId.get(row.source_unit_id);
      assert.equal(unit.source_text.slice(...row.source_span_utf16), row.source_text);
    }
  }
  const delimiterProof = [];
  for (const unit of records.filter(row => row.source_object_kind === 'SOURCE_UNIT')) {
    const leaves = unit.covered_by ? records.filter(row => row.source_unit_id === unit.object_id && row.object_id !== unit.object_id && !row.superseded_by) : [unit];
    const coverage = new Uint8Array(unit.source_text.length);
    for (const leaf of leaves) {
      const start = unit.source_text.indexOf(leaf.source_text);
      assert.ok(start >= 0);
      assert.equal(unit.source_text.indexOf(leaf.source_text, start + 1), -1, 'Ambiguous source span');
      for (let i = start; i < start + leaf.source_text.length; i++) {
        assert.equal(coverage[i], 0, `${unit.object_id}: overlapping review leaves`);
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
  assert.deepEqual(result.coverage.remaining_p23_source_object_ids, []);
  assert.deepEqual(result.coverage.terminal_pages, [23]);
  assert.deepEqual(byId.get('BE-SPD-2026-SU-0280').pdf_pages, [23, 24]);
  assert.deepEqual(result.coverage.cross_page_objects_consumed_once, ['BE-SPD-2026-SU-0280']);
  assert.equal(byId.has('BE-SPD-2026-SU-0281'), false);
  assert.equal(result.constraints.programme_terminal_claimed, false);
  return { gate: result.coverage.gate, source_units: result.coverage.source_unit_ids.length, original_atoms: result.coverage.original_atom_ids.length, children: result.coverage.generated_child_ids.length, terminal_records: records.length, active_rnaa: expectedActiveOriginal.length + expectedActiveChild.length, zero_count: records.filter(row => !row.counts_as_effect_object).length, non_delimiter_source_coverage: '100%', delimiter_proof: delimiterProof, remaining_p23_source_objects: 0, programme_terminal: false };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(validateP23(), null, 2));
