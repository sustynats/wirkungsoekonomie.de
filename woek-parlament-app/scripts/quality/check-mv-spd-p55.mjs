#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_ROOT, OUTPUT, RESIDUAL, buildP55, buildSpdResidual, sha256 } from './materialize-mv-spd-p55.mjs';

export function loadP55() {
  return {handoff: JSON.parse(fs.readFileSync(path.join(APP_ROOT, OUTPUT))), residual: JSON.parse(fs.readFileSync(path.join(APP_ROOT, RESIDUAL)))};
}

export function validateP55({handoff, residual}, {verifyDeterminism = true} = {}) {
  if (verifyDeterminism) {
    assert.deepEqual(handoff, buildP55(), 'P55 lossless handoff/determinism drift');
    assert.deepEqual(residual, buildSpdResidual(handoff), 'P55 set-wise residual drift');
  }
  const rows = handoff.terminal_records;
  const byId = new Map(rows.map(row => [row.object_id, row]));
  assert.equal(byId.size, rows.length, 'Duplicate source/review object');
  for (const row of rows) {
    assert.equal(sha256(row.source_text), row.source_text_sha256, `Source hash drift: ${row.object_id}`);
    assert.equal(row.source_page, 55, 'Scope escape');
    assert.ok([5477877520, 5525358185].includes(row.batch_issue_comment_id));
    assert.equal(row.binding_issue_comment_id, 5525358185);
    for (const key of ['impact_direction','evidence_level','materiality','problem_review','goal_review','dns_mapping','sdg_mapping','recommendation','score','party_judgement']) assert.equal(row[key], undefined, `Unsupplied Fach field ${key}`);
    assert.equal(row.counts_as_effect_object, row.terminal_fach_state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'Wrong effect count role');
    if (row.counts_as_effect_object) {
      assert.ok(row.exact_reason && row.exact_reason_code, 'Missing object-specific exact reason');
      assert.equal(row.superseded_by, undefined, 'Version parent cannot count');
      assert.equal(row.covered_by, undefined, 'Source container cannot count');
    }
    for (const child of row.superseded_by ?? row.covered_by ?? []) assert.ok(byId.has(child), `Dangling lineage: ${child}`);
    for (const parent of row.parent_object_ids ?? []) {
      const source = byId.get(parent);
      assert.ok(source && source.source_text.includes(row.source_text), 'Child not exact parent span');
      assert.ok(!source.counts_as_effect_object, 'Child and parent double counted');
      assert.match(row.object_id, new RegExp(`^${parent}-C[0-9]{2}-${row.source_text_sha256.slice(0,12)}$`));
    }
  }
  // Verify every non-whitespace character of all thirteen source units. No
  // keyword segmentation and no empty-gap inference is permitted.
  const spanProof = [];
  for (const unit of rows.filter(row => row.source_object_kind === 'SOURCE_UNIT')) {
    const covered = new Uint8Array(unit.source_text.length);
    const leaves = rows.filter(row => row.source_unit_id === unit.object_id && !row.superseded_by && !row.covered_by);
    for (const leaf of leaves) {
      const start = unit.source_text.indexOf(leaf.source_text);
      assert.ok(start >= 0, 'Unbound terminal leaf');
      for (let index = start; index < start + leaf.source_text.length; index++) {
        assert.equal(covered[index], 0, `Overlapping leaf at ${unit.object_id}:${index}`);
        covered[index]++;
      }
    }
    const fragment = rows.find(row => row.source_unit_id === unit.object_id && row.excluded_source_prefix);
    if (fragment) {
      assert.equal(fragment.object_id, 'MV-SPD-2026-SU-00510-A01');
      assert.ok(unit.source_text.startsWith(fragment.excluded_source_prefix));
      for (let index=0; index<fragment.excluded_source_prefix.length; index++) covered[index]++;
    }
    const gaps = Array.from({length:unit.source_text.length}, (_, index) => index).filter(index => covered[index] === 0 && !/\s/.test(unit.source_text[index]));
    assert.deepEqual(gaps, [], `Uncovered source characters: ${unit.object_id}`);
    spanProof.push({object_id:unit.object_id,non_whitespace_source_coverage:'PASS'});
  }
  const active = rows.filter(row => row.counts_as_effect_object);
  assert.equal(new Set(active.map(row => row.source_text_sha256)).size, active.length, 'Duplicate effect leaf');
  assert.deepEqual(active.map(row => row.object_id).sort(), [
    'MV-SPD-2026-SU-00510-A02','MV-SPD-2026-SU-00514-A02','MV-SPD-2026-SU-00515-A01','MV-SPD-2026-SU-00518-A01',
    'MV-SPD-2026-SU-00511-A01-C01-101402e0ba43','MV-SPD-2026-SU-00511-A01-C02-fe3198dc01a5',
    'MV-SPD-2026-SU-00517-C01-dbede871c622','MV-SPD-2026-SU-00517-C02-2dcc7c55fc11','MV-SPD-2026-SU-00519-C01-c0ebf23b4206',
  ].sort());
  assert.deepEqual(
    residual.summary.materialised_terminal_pages,
    [1, ...Array.from({ length: 51 }, (_, index) => index + 5)],
    'P1 and P5-P55 must be losslessly materialised from the archived authorities plus P55',
  );
  assert.deepEqual(residual.summary.protected_authored_pages_pending_technical_reconciliation, [2, 3, 4]);
  assert.equal(residual.summary.remaining_technical_page_envelopes.length, 43);
  assert.equal(residual.summary.programme_terminal, false);
  assert.equal(residual.summary.p56_authoring_authorised_by_this_matrix, false);
  assert.equal(residual.summary.exact_remaining_effect_object_count, null);
  assert.deepEqual(residual.summary.p55_residual_source_object_ids, []);
  return {gate:'MV_SPD_P55_FACH_COMPLETE',status:'PASS_SOURCE_BOUND_AFTER_BINDING_REPAIR',source_units:spanProof.length,original_atoms:handoff.coverage.original_atom_ids.length,generated_children:handoff.coverage.generated_child_ids.length,active_rnaa:active.length,zero_count_records:rows.length-active.length,p55_residual:0,span_proof:spanProof,programme_terminal:false,remaining_technical_page_envelopes:residual.summary.remaining_technical_page_envelopes.length,p56_authoring_authorised:false};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(validateP55(loadP55()),null,2));
