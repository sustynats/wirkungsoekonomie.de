#!/usr/bin/env node
/** Source identity only. This module never derives a Fach decision from text. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LEDGER = 'woek-parlament-app/data/state-programmes/fach-reviews/mecklenburg-vorpommern-2026-spd-v1/';
export const sha256 = value => createHash('sha256').update(value).digest('hex');
export function assertExactSourceChild(parent, child) {
  assert.equal(sha256(parent.source_text_normalized), parent.source_text_sha256, 'SOURCE_PARENT_HASH_MISMATCH');
  assert.equal(sha256(child.text), child.sha256, 'SUPPLIED_CHILD_HASH_MISMATCH');
  assert.ok(parent.source_text_normalized.includes(child.text), 'SUPPLIED_CHILD_NOT_IN_FROZEN_PARENT');
}

export function sourceBindingWitness() {
  const manifest = JSON.parse(readFileSync(resolve(ROOT, LEDGER, 'manifest.json'), 'utf8'));
  const units = JSON.parse(readFileSync(resolve(ROOT, LEDGER, 'source-units-p049-p056.json'), 'utf8')).records;
  const handoffPath = 'docs/parlament/audits/mv-spd-p53-handoff-5474946653.md';
  const handoff = readFileSync(resolve(ROOT, handoffPath), 'utf8');
  const repairPath = 'docs/parlament/audits/mv-spd-p53-binding-delta-5543580667.md';
  const repair = readFileSync(resolve(ROOT, repairPath), 'utf8');
  assert.equal(sha256(handoff), 'f646452303fd526c4ee67ed06374e1eb8f1a26578a9a68f8d659d35c938ed96b', 'HISTORICAL_AUTHORITY_BYTES_CHANGED');
  assert.equal(sha256(repair), '5cd84571caafc2803c08cb7d6b7ba08f04bb8a35352bb64daca7400a8717c37a', 'REPAIR_AUTHORITY_BYTES_CHANGED');
  const find = id => units.find(unit => unit.source_unit_id === id);
  assert.equal(manifest.ledger_metadata.artifact.sha256, 'b2ed331e3bd89b93379df2f9a6adc5d3d10ddf635b0688673bc20c61cdca09bc');
  const discrepancies = [
    {
      object_id: 'MV-SPD-2026-SU-00495-C02-b73986b3503e', parent: 'MV-SPD-2026-SU-00495',
      supplied_text: 'Kommunale Energieinfrastruktur ist dabei ein wichtiger Baustein, der Klima- und Daseinsvorsorge miteinander verbindet.',
      supplied_sha256: 'b73986b3503e39d59da93a89882a76d0b6f81d9947bfcbee5e43d2fd6ddad9ff',
      actual_text: 'Kommunale Energieinfrastruktur wird zunehmend zu einer strategischen Aufgabe, die Versorgungssicherheit, Klimaschutz und wirtschaftliche Entwicklung verbindet.',
      actual_sha256: '800fbf3fffa1976f6bb3ace6110f4b1ea6ad2cfe960cf826ea8600fb82e62598',
      reason: 'SUPPLIED_CHILD_NOT_IN_FROZEN_PARENT', requires_external_binding_delta: true,
    },
    {
      object_id: 'MV-SPD-2026-SU-00496', parent: 'MV-SPD-2026-SU-00496',
      supplied_text: 'Bezahlbares Wohnen und moderne Quartiere', supplied_sha256: null,
      actual_text: 'Gutes und bezahlbares Wohnen',
      actual_sha256: '52c52569def77a0732ef84619b60d2e7d27ca5b0f292b10344fa739f2678545c',
      reason: 'SUPPLIED_SOURCE_LABEL_DIFFERS_FROM_FROZEN_UNIT', requires_external_binding_delta: false,
    },
    {
      object_id: 'MV-SPD-2026-SU-00499', parent: 'MV-SPD-2026-SU-00499',
      supplied_text: 'Bezahlbares Wohnen und moderne Quartiere', supplied_sha256: null,
      actual_text: 'Wohnraum als Daseinsvorsorge in Stadt und Land',
      actual_sha256: '6e12088d19a9035493faf599f712b3a9705fee4213dae3522a20c7464f3709c7',
      reason: 'SUPPLIED_SOURCE_LABEL_DIFFERS_FROM_FROZEN_UNIT', requires_external_binding_delta: false,
    },
  ].map(witness => {
    const parent = find(witness.parent);
    assert.ok(parent);
    assert.equal(sha256(parent.source_text_normalized), parent.source_text_sha256);
    assert.ok(handoff.includes(witness.object_id));
    assert.ok(handoff.includes(witness.supplied_text));
    assert.ok(!parent.source_text_normalized.includes(witness.supplied_text));
    assert.equal(sha256(witness.actual_text), witness.actual_sha256);
    assert.ok(parent.source_text_normalized.includes(witness.actual_text));
    if (witness.supplied_sha256) {
      assert.equal(sha256(witness.supplied_text), witness.supplied_sha256);
      assert.throws(() => assertExactSourceChild(parent, { text: witness.supplied_text, sha256: witness.supplied_sha256 }), /SUPPLIED_CHILD_NOT_IN_FROZEN_PARENT/);
    }
    return { ...witness, source_locator: parent.source_locator, parent_sha256: parent.source_text_sha256, source_page: parent.pdf_page, terminal_fach_decision: null, substitute_fach_authored: false };
  });
  const corrected = discrepancies[0];
  const exactReason = 'this sentence describes the strategic/system role and desired coherence of municipal energy infrastructure across supply security, climate protection and economic development. It does not itself specify a distinct intervention, instrument, resource allocation, delivery trigger, actor obligation or implementation decision. Therefore it is reviewed context/system-role framing, not a separately countable effect-bearing action.';
  const repairedBinding = {
    object_id: 'MV-SPD-2026-SU-00495-C02-' + corrected.actual_sha256.slice(0, 12),
    supersedes_proposed_object_id: corrected.object_id,
    parent_object_id: corrected.parent,
    source_text: corrected.actual_text,
    source_text_sha256: corrected.actual_sha256,
    terminal_fach_state: 'NON_EFFECT_SYSTEM_ROLE_AND_GOAL_FRAME_REVIEWED',
    zero_count: true,
    exact_reason: exactReason,
    authority_comment_id: 5543580667,
  };
  for (const exact of [corrected.actual_text, corrected.actual_sha256, repairedBinding.terminal_fach_state, 'zero_count = true', exactReason]) assert.ok(repair.includes(exact), 'REPAIR_AUTHORITY_BINDING_DRIFT');
  assertExactSourceChild(find(corrected.parent), { text: repairedBinding.source_text, sha256: repairedBinding.source_text_sha256 });
  for (const heading of discrepancies.slice(1)) {
    assert.ok(repair.includes(heading.actual_text));
    assert.ok(repair.includes(heading.actual_sha256));
  }
  return {
    schema_version: 'woek-source-binding-witness-1.0',
    source_artifact: manifest.ledger_metadata.artifact,
    source_ledger: { path: LEDGER + 'manifest.json', file_sha256: sha256(readFileSync(resolve(ROOT, LEDGER, 'manifest.json'))) },
    authority: { issue: 240, comment_id: 5474946653, url: 'https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5474946653', path: handoffPath, file_sha256: sha256(handoff) },
    discrepancies,
    discrepancy_scope: 'HISTORICAL_HANDOFF_5474946653_NOT_CURRENT_BLOCKER',
    repair_authority: { issue: 240, comment_id: 5543580667, url: 'https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5543580667', path: repairPath, file_sha256: sha256(repair) },
    repaired_binding: repairedBinding,
    gate: 'PASS_SOURCE_BINDING_REPAIR_VERIFIED',
    p1_p54_transaction_complete: false, p56_authorised: false,
    required_external_delta: null,
    pending_work: 'The P53 binding delta is supplied and verified, not an external blocker. Complete protected P1–P54 predecessor/approved-stock recovery and lossless materialisation; do not credit this preflight as transaction completion.',
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.stdout.write(JSON.stringify(sourceBindingWitness(), null, 2) + '\n');
}
