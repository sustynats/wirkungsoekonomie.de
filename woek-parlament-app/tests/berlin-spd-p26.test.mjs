import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { APP_ROOT, HANDOFF, buildP26, sourceCoverage, sha256 } from '../scripts/quality/materialize-berlin-spd-p26.mjs';
import { validateP26 } from '../scripts/quality/check-berlin-spd-p26.mjs';

const load = name => JSON.parse(fs.readFileSync(path.join(APP_ROOT, name)));
test('P26 has exactly the authoritative identity sets, independently selected approved leaves and zero gaps', () => {
  const { result } = buildP26();
  const report = validateP26(result);
  assert.deepEqual([report.source_units, report.original_atoms, report.authorized_children, report.records, report.active_explicit, report.active_rnaa, report.zero_count], [16, 18, 25, 59, 17, 17, 25]);
  const shortId = id => id.replace('BE-SPD-2026-SU-', '').replace(/-([a-f0-9]{12})$/, '');
  assert.deepEqual(result.coverage.explicit_fach_approved_ids.map(shortId).sort(), [
    '0305-C02', '0306-A01', '0306-A02', '0307-C01', '0309-A01',
    '0311-A01', '0311-A02', '0312-C01', '0314-C01', '0317-A01',
    '0317-A02', '0318-A01', '0318-A02-C01', '0318-A02-C02',
    '0318-A02-C03', '0318-A02-C06', '0318-A03-C01',
  ].sort());
  assert.deepEqual(report.missing_authority, []);
  assert.equal(report.fach_page_terminal, true);
  assert.deepEqual(buildP26(), buildP26());
});
test('P26 source coverage finds each removed active leaf and rejects duplicate/overlapping leaves', () => {
  const { result } = buildP26();
  for (const leaf of result.terminal_records.filter(r => r.counts_as_effect_object)) {
    assert.ok(sourceCoverage(result.terminal_records.filter(r => r !== leaf)).uncovered_source_spans.length > 0, leaf.object_id);
    assert.throws(() => sourceCoverage([...result.terminal_records, leaf]), /Overlapping source leaves/);
  }
});
test('P26 refuses rewritten source/Fach, fabricated grades, double counts, altered lineage and unauthorised frontier advancement', () => {
  for (const mutate of [
    s => { s.terminal_records[0].source_text += ' changed'; },
    s => { s.terminal_records.find(r => r.impact_direction).impact_direction = 'POSITIVE'; },
    s => { s.terminal_records.find(r => r.exact_reason).exact_reason = 'generic missing information'; },
    s => { s.terminal_records.find(r => r.superseded_by).counts_as_effect_object = true; },
    s => { s.terminal_records.find(r => r.parent_object_ids).parent_object_ids = ['BE-SPD-2026-SU-0302']; },
    s => { s.terminal_records.find(r => r.shared_reality_check_verbatim).shared_reality_check_verbatim = ''; },
    s => { s.terminal_records.push(s.terminal_records[0]); },
    s => { s.terminal_records.pop(); },
    s => { s.coverage.terminal_pages = [26, 27]; },
    s => { s.coverage.excluded_previously_consumed_cross_page_objects = []; },
    s => { s.constraints.p27_authorised = true; },
    s => { s.terminal_records.find(r => r.counts_as_effect_object).dns_mapping = ['SDG11']; },
  ]) {
    const { result } = buildP26(); mutate(result); assert.throws(() => validateP26(result));
  }
});
test('P26 preserves source law/baseline and batch guards verbatim, including the shared A02 reality check', () => {
  const { result } = buildP26();
  const body = fs.readFileSync(path.join(APP_ROOT, HANDOFF), 'utf8');
  assert.ok(result.assessment_contract_verbatim.length > 500);
  assert.ok(result.cross_object_guards_verbatim.length > 500);
  assert.ok(body.includes(result.assessment_contract_verbatim));
  assert.ok(body.includes(result.cross_object_guards_verbatim));
  const shared = result.terminal_records.filter(r => r.shared_reality_check_verbatim);
  assert.equal(shared.length, 7);
  assert.equal(new Set(shared.map(r => r.shared_reality_check_verbatim)).size, 1);
});
test('P26 projection preserves all 238 protected SPD rows and every other programme, with no SU0302 reuse', () => {
  const matrix = load('data/state-programmes/fach-content-residuals/berlin-2026-v3.json');
  const spd = matrix.programmes.find(r => r.party === 'SPD');
  assert.equal(sha256(JSON.stringify(spd.terminal_objects.filter(r => !r.source_page || r.source_page < 26))), '3b04e53f5dbf7b04c7c4227ec4e367ec47a191359ca822d75c87a7211d8fbd7c');
  assert.equal(sha256(JSON.stringify(matrix.programmes.filter(r => r.party !== 'SPD'))), 'aebac94ba5b6fd510c65512fb49f5bc225d3e34e775a7ba55285643a7bd1842b');
  const { result } = buildP26();
  const projected = spd.terminal_objects.filter(r => r.source_page === 26);
  assert.deepEqual(new Set(projected.map(r => r.object_id)), new Set(result.terminal_records.map(r => r.object_id)));
  for (const row of result.terminal_records) {
    const publicRow = projected.find(r => r.object_id === row.object_id);
    for (const key of Object.keys(row)) assert.deepEqual(publicRow[key], row[key], row.object_id + '/' + key);
  }
  assert.deepEqual(spd.protected_fach_scope.materialized_page_set, [22, 23, 24, 25, 26]);
  assert.deepEqual(spd.protected_fach_scope.next_unreviewed_source_order_frontier, { physical_page: 27, source_unit_from: 'BE-SPD-2026-SU-0319' });
  assert.deepEqual(spd.remaining_review_envelopes.map(r => Number(r.source_locator.match(/PDF page (\d+)/)[1])), Array.from({ length: 40 }, (_, i) => i + 27));
  assert.deepEqual(result.coverage.excluded_previously_consumed_cross_page_objects, ['BE-SPD-2026-SU-0302']);
});
test('Protected BSW source bytes keep their original authority hash', () => {
  const protectedFile = fs.readFileSync(path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p57-authoritative-handoff.md'));
  assert.equal(sha256(protectedFile), '882297a44a9f451f91b56a3838a3dd40272b82c37de5078364d0ed93af0a629d');
});
