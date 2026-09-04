#!/usr/bin/env node
/** Mechanical reference inventory, deliberately not a Fach classifier. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256 } from './check_mv_spd_authority_source_binding.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEDGER = 'woek-parlament-app/data/state-programmes/fach-reviews/mecklenburg-vorpommern-2026-spd-v1/';
export const OUTPUT = 'docs/parlament/audits/mv-spd-p1-p54-reference-inventory-2026-09-04.json';
const read = name => fs.readFileSync(path.resolve(ROOT, name));

export function sourceObjects() {
  return fs.readdirSync(path.resolve(ROOT, LEDGER)).sort().filter(name => /^(source-units|effect-atoms)-/.test(name)).flatMap(name =>
    JSON.parse(read(LEDGER + name)).records.filter(row => row.pdf_page <= 54).map(row => {
      const text = row.policy_action ?? row.source_text_normalized;
      const hash = row.policy_action_sha256 ?? row.source_text_sha256;
      assert.equal(sha256(text), hash);
      return { object_id: row.atom_id ?? row.source_unit_id, source_unit_id: row.source_unit_id, pdf_page: row.pdf_page, source_locator: row.source_locator, source_sha256: hash, source_file: LEDGER + name, text };
    })
  ).sort((a, b) => a.object_id.localeCompare(b.object_id));
}

export function buildReferenceInventory(snapshots) {
  const comments = snapshots.flatMap(({ issue, bytes }) => JSON.parse(bytes).flat().map(comment => ({ ...comment, issue })));
  const candidates = comments.filter(comment => /MV-SPD|MVSPD|Mecklenburg-Vorpommern SPD|MV SPD/i.test(comment.body));
  const records = sourceObjects().map(({ text, ...source }) => {
    const exactId = new RegExp(source.object_id + '(?![A-Z0-9-])');
    return {
      ...source,
      id_reference_comment_ids: comments.filter(comment => exactId.test(comment.body)).map(comment => comment.id),
      hash_reference_comment_ids: comments.filter(comment => comment.body.includes(source.source_sha256)).map(comment => comment.id),
      exact_text_reference_comment_ids: comments.filter(comment => comment.body.includes(text)).map(comment => comment.id),
      terminal_fach_decision: null,
    };
  });
  const result = {
    schema_version: 'woek-fach-reference-inventory-1.0',
    source_commit: '66685e46d0acd9339935babab29bbe2116713143',
    artifact_sha256: 'b2ed331e3bd89b93379df2f9a6adc5d3d10ddf635b0688673bc20c61cdca09bc',
    scope: 'MV_SPD_P1_P54_SOURCE_REFERENCE_INVENTORY_ONLY',
    disclaimer: 'An ID/hash/text occurrence is a candidate reference, not a verified current Fach decision. Superseded/VOID comments may occur. No source role, approval, child, count or frontier is derived from these matches.',
    snapshots: snapshots.map(({ issue, bytes }) => ({ issue, json_sha256: sha256(bytes), comments: JSON.parse(bytes).flat().length })),
    candidate_comments: candidates.map(comment => ({ issue: comment.issue, comment_id: comment.id, url: comment.html_url, body_sha256: sha256(comment.body), title: comment.body.split('\n')[0] })),
    records,
    source_units: records.filter(row => row.object_id === row.source_unit_id).length,
    source_atoms: records.filter(row => row.object_id !== row.source_unit_id).length,
    new_terminal_credit: 0, p1_p54_complete: false, p56_authorised: false,
  };
  result.descriptor_sha256 = sha256(JSON.stringify(result));
  return result;
}

export function validateReferenceInventory(result = JSON.parse(read(OUTPUT))) {
  const { descriptor_sha256: descriptor, ...payload } = result;
  assert.equal(sha256(JSON.stringify(payload)), descriptor, 'REFERENCE_INVENTORY_DESCRIPTOR_DRIFT');
  const actual = sourceObjects().map(({ text: _text, ...source }) => source);
  assert.deepEqual(result.records.map(({ id_reference_comment_ids: _ids, hash_reference_comment_ids: _hashes, exact_text_reference_comment_ids: _texts, terminal_fach_decision: _decision, ...source }) => source), actual, 'REFERENCE_INVENTORY_SOURCE_SET_DRIFT');
  assert.ok(result.records.every(row => row.terminal_fach_decision === null));
  assert.equal(result.new_terminal_credit, 0);
  assert.equal(result.p1_p54_complete, false);
  assert.equal(result.p56_authorised, false);
  return { gate: 'PASS_REFERENCE_INVENTORY_NOT_FACH_COMPLETION', source_units: result.source_units, source_atoms: result.source_atoms, candidate_comments: result.candidate_comments.length, descriptor_sha256: descriptor };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args[0] === '--write') {
    assert.equal(args.length, 3, 'Usage: --write issue-240-snapshot.json issue-241-snapshot.json');
    const result = buildReferenceInventory([240, 241].map((issue, index) => ({ issue, bytes: fs.readFileSync(args[index + 1]) })));
    fs.writeFileSync(path.resolve(ROOT, OUTPUT), JSON.stringify(result, null, 2) + '\n');
  } else assert.equal(args.length, 0, 'Omit arguments to verify the frozen inventory');
  console.log(JSON.stringify(validateReferenceInventory(), null, 2));
}
