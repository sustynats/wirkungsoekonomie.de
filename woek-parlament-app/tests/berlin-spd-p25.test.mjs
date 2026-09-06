import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { APP_ROOT, SUPPLEMENT_CHILD, buildP25, sourceCoverage, sha256 } from '../scripts/quality/materialize-berlin-spd-p25.mjs';
import { validateP25 } from '../scripts/quality/check-berlin-spd-p25.mjs';

test('P25 serializes every supplied identity/decision and closes only the authorised missing clause', () => {
  const r = validateP25(buildP25());
  assert.deepEqual([r.source_units, r.original_atoms, r.authorized_children, r.records, r.active_explicit, r.active_rnaa, r.zero_count], [12, 29, 19, 60, 27, 9, 24]);
  assert.equal(r.serialization_integrity, 'PASS');
  assert.equal(r.fach_page_terminal, true);
  assert.deepEqual(r.missing_authority, []);
  const child = buildP25().terminal_records.find(r => r.object_id === SUPPLEMENT_CHILD);
  assert.deepEqual(child.source_span_utf16, [128, 201]);
  assert.equal(child.source_text_sha256, '352663d0d94b92249f85d3d5476e3744ebbbe1a43d432ad54f35d5e054a1f0d5');
  assert.equal(child.fach_issue_comment_id, 5559328151);
  assert.deepEqual(buildP25(), buildP25());
});
test('P25 terminal admission passes only with the supplied gap closure; removing that child restores the exact gap', () => {
  const result = buildP25();
  assert.equal(validateP25(result, { requireTerminal: true }).fach_page_terminal, true);
  result.terminal_records = result.terminal_records.filter(r => r.object_id !== SUPPLEMENT_CHILD);
  const missing = sourceCoverage(result.terminal_records).uncovered_source_spans;
  assert.equal(missing.length, 1);
  assert.equal(missing[0].source_text_sha256, '352663d0d94b92249f85d3d5476e3744ebbbe1a43d432ad54f35d5e054a1f0d5');
  assert.throws(() => validateP25(result, { requireTerminal: true }));
});
test('P25 rejects missing source, rewritten Fach, fabricated grades, double counts, omitted gaps and false frontier advancement', () => {
  for (const mutate of [
    s => { s.terminal_records[0].source_text = 'different source'; },
    s => { s.terminal_records.find(r => r.impact_direction).impact_direction = 'POSITIVE'; },
    s => { s.terminal_records.find(r => r.exact_reason).exact_reason = 'generic missing information'; },
    s => { s.terminal_records.find(r => r.superseded_by).counts_as_effect_object = true; },
    s => { s.terminal_records.push(s.terminal_records[0]); },
    s => { s.terminal_records.pop(); },
    s => { s.coverage.uncovered_source_spans = [{ source_unit_id: 'BE-SPD-2026-SU-0299' }]; },
    s => { s.coverage.terminal_pages = [25, 26]; },
    s => { s.coverage.release_or_residual_activation_allowed = false; },
    s => { s.coverage.cross_page_objects_consumed_once = []; },
    s => { s.terminal_records.find(r => r.object_id.endsWith('C02-be577700ead3')).evidence_level = 'MEDIUM'; },
    s => { s.terminal_records.find(r => r.counts_as_effect_object).dns_mapping = ['SDG11']; },
  ]) { const s = buildP25(); mutate(s); assert.throws(() => validateP25(s)); }
});
test('P25 source coverage independently finds a removed authorised clause and rejects overlapping leaves', () => {
  const rows = buildP25().terminal_records;
  const removed = rows.find(r => r.object_id === 'BE-SPD-2026-SU-0292-A01');
  assert.equal(sourceCoverage(rows.filter(r => r !== removed)).uncovered_source_spans.length, 1);
  assert.throws(() => sourceCoverage([...rows, removed]), /Overlapping source leaves/);
});
test('P25 keeps the batch assessment, lifecycle, distribution, falsification and absent optional grade verbatim', () => {
  const s = buildP25();
  assert.match(s.assessment_contract_verbatim, /Output\/announcement ≠ outcome/);
  assert.match(s.cross_object_guards_verbatim, /Reversibility\/lock-in/);
  assert.match(s.cross_object_guards_verbatim, /Distribution\/spatial/);
  assert.match(s.cross_object_guards_verbatim, /Falsification/);
  assert.equal(s.terminal_records.find(r => r.object_id.endsWith('C02-be577700ead3')).evidence_level, undefined);
});
test('P25 preserves protected P1–P24 and other programmes and derives the untouched candidate frontier', () => {
  const matrix = JSON.parse(fs.readFileSync(path.join(APP_ROOT, 'data/state-programmes/fach-content-residuals/berlin-2026-v3.json')));
  const spd = matrix.programmes.find(r => r.party === 'SPD');
  assert.equal(sha256(JSON.stringify(spd.terminal_objects.filter(r => r.source_page !== 25))), 'eca48473c061f00e17322363bb9b55f82a9bec756ec01f41e613a56c792fbf0f');
  assert.equal(sha256(JSON.stringify(matrix.programmes.filter(r => r.party !== 'SPD'))), 'aebac94ba5b6fd510c65512fb49f5bc225d3e34e775a7ba55285643a7bd1842b');
  assert.deepEqual(spd.protected_fach_scope.next_unreviewed_source_order_frontier, { physical_page: 26, source_unit_from: 'BE-SPD-2026-SU-0303' });
  for (const [p, hash] of [[22, 'e5c8f9d3b18aa4f055239156fd711d7a2daf021b2d25dd97ed2be60afdebce9e'], [23, '95e2b0b205c53e80332652221de330d25e487e849b0e8f759b880a71f82a33a5'], [24, 'ae856310c8381fa2a5ba3cbfaee545616ce1deecfc47ab72c1a6043442bca5f5']]) assert.equal(sha256(fs.readFileSync(path.join(APP_ROOT, `data/state-programmes/fach-reviews/berlin-2026-spd-p${p}-explicit-v1.json`))), hash);
});
test('The supplement preserves the 59 existing prepared records and adds one exact object only', () => {
  const result = buildP25();
  const previous = result.terminal_records.filter(r => r.object_id !== SUPPLEMENT_CHILD).map(r => r.covered_by ? { ...r, covered_by: r.covered_by.filter(id => id !== SUPPLEMENT_CHILD) } : r);
  assert.equal(sha256(JSON.stringify(previous)), '73edd54997f9fad8536e17d8d4724142f12a0ec27de0a3856614eed02ae77d9f');
  const child = result.terminal_records.find(r => r.object_id === SUPPLEMENT_CHILD);
  for (const phrase of ['existing protection boundary', 'false-positive geofencing', 'non-compensation', 'FALSIFICATION_TRIGGER', 'parking/end-of-trip', 'No semantic splitting']) assert.ok(child.authoritative_fach_text.includes(phrase));
  assert.equal(child.materiality, 'MEDIUM_LOCAL / POTENTIALLY_HIGH_FOR_VULNERABLE_PEDESTRIANS');
});
