#!/usr/bin/env node

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MANIFEST_PATH = path.join(
  APP_ROOT,
  'data/state-programmes/fach-reviews/berlin-2026-spd-v1/manifest.json',
);
const HOOK_PATH = path.join(
  APP_ROOT,
  'data/state-programmes/fach-coverage-hooks/berlin-2026-spd-v1.json',
);
const REGISTER_PATH = path.join(
  APP_ROOT,
  'data/state-programmes/current-source-registers/berlin-2026-v2.json',
);

const ARTIFACT_ID = 'BE-AGH-2026-SPD-WAHLPROGRAMM';
const ARTIFACT_SHA256 = '379f8cfe51309c2782c88a74ef06777d9ef0c07d7c256ddf1d9f361111e6ffc9';
const APPROVAL_BASIS = 'DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26';
const APPROVAL_AUTHORITY = 'PROJECT_OWNER_DELEGATED_PROTOCOL';
const REVIEW_MODE = 'SOURCE_BOUND_OBJECT_LEVEL';
const SHA256_RE = /^[0-9a-f]{64}$/;
const FORBIDDEN_SYNTHETIC_FIELDS = [
  'impact_direction',
  'evidence_level',
  'materiality',
  'uncertainty',
  'problem_review',
  'goal_review',
  'dns_mapping',
  'recommendation',
  'sdg_mapping',
  'sdg_plus_mapping',
  'party_score',
];
const APPROVED_REQUIRED_FIELDS = [
  'affected_group_or_system',
  'baseline_or_reference_state',
  'mechanism',
  'potential_state_change',
  'impact_direction',
  'evidence_level',
  'competence_and_system_boundary',
  'material_risks',
  'time_horizon',
  'materiality',
  'uncertainty',
  'falsification_or_reality_check',
];

function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortDeep(value[key])]),
  );
}

function canonicalJson(value) {
  return JSON.stringify(sortDeep(value));
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} must be unique`);
}

function loadShards(manifest, refs, expectedType) {
  const ledgerDir = path.dirname(MANIFEST_PATH);
  const records = [];

  for (const ref of refs) {
    const shardPath = path.join(ledgerDir, ref.path);
    const bytes = fs.readFileSync(shardPath);
    assert.equal(bytes.length, ref.byte_length, `${ref.path}: byte length mismatch`);
    assert.equal(sha256(bytes), ref.file_sha256, `${ref.path}: byte hash mismatch`);

    const shard = JSON.parse(bytes.toString('utf8'));
    assert.equal(shard.shard_type, expectedType, `${ref.path}: shard type mismatch`);
    assert.equal(shard.ledger_id, manifest.ledger_metadata.ledger_id);
    assert.equal(shard.page_from, ref.page_from);
    assert.equal(shard.page_to, ref.page_to);
    assert.equal(shard.records.length, ref.record_count);
    assert.ok(shard.records.every((record) => (
      record.pdf_page >= ref.page_from && record.pdf_page <= ref.page_to
    )), `${ref.path}: record outside page envelope`);
    records.push(...shard.records);
  }

  return records;
}

export function loadBerlinSpdReviewBundle() {
  const manifest = readJson(MANIFEST_PATH);
  const sourceUnits = loadShards(manifest, manifest.source_unit_shards, 'SOURCE_UNITS');
  const effectAtoms = loadShards(manifest, manifest.effect_atom_shards, 'EFFECT_ATOMS');
  return {
    manifest,
    sourceUnits,
    effectAtoms,
    hook: readJson(HOOK_PATH),
    register: readJson(REGISTER_PATH),
    registerBytes: fs.readFileSync(REGISTER_PATH),
  };
}

export function validateBerlinSpdReviewBundle(bundle, { verifyLogicalDescriptor = true } = {}) {
  const {
    manifest,
    sourceUnits,
    effectAtoms,
    hook,
    register,
    registerBytes,
  } = bundle;
  const metadata = manifest.ledger_metadata;
  const coverage = metadata.coverage;

  assert.equal(manifest.format, 'SHARDED_JSON_LEDGER_V1');
  const manifestForHash = structuredClone(manifest);
  delete manifestForHash.manifest_sha256;
  assert.equal(
    sha256(canonicalJson(manifestForHash)),
    manifest.manifest_sha256,
    'manifest descriptor mismatch',
  );

  const logicalLedger = { ...metadata, source_units: sourceUnits, effect_atoms: effectAtoms };
  if (verifyLogicalDescriptor) {
    assert.equal(
      sha256(canonicalJson(logicalLedger)),
      manifest.logical_descriptor_sha256,
      'logical ledger descriptor mismatch',
    );
  }

  assert.equal(metadata.party, 'SPD');
  assert.equal(metadata.jurisdiction, 'berlin');
  assert.equal(metadata.artifact.artifact_id, ARTIFACT_ID);
  assert.equal(metadata.artifact.sha256, ARTIFACT_SHA256);
  assert.equal(metadata.artifact.byte_length, 663059);
  assert.equal(metadata.artifact.page_count, 66);
  assert.equal(metadata.provenance.approval_basis, APPROVAL_BASIS);
  assert.equal(metadata.provenance.approval_authority, APPROVAL_AUTHORITY);
  assert.equal(metadata.provenance.review_mode, REVIEW_MODE);
  assert.equal(metadata.provenance.human_individual_record_review_claimed, false);

  assert.equal(sha256(registerBytes), metadata.source_register.sha256);
  const spd = register.parties.find((party) => party.party === 'SPD');
  assert.ok(spd, 'SPD missing from Berlin source register');
  assert.equal(spd.canonical_artifact.artifact_id, ARTIFACT_ID);
  assert.equal(spd.canonical_artifact.sha256, ARTIFACT_SHA256);
  assert.equal(spd.canonical_artifact.byte_length, 663059);
  assert.equal(spd.canonical_artifact.page_count, 66);
  assert.equal(spd.canonical_artifact.artifact_url, metadata.artifact.url);

  assertUnique(sourceUnits.map((unit) => unit.source_unit_id), 'source_unit_id');
  assertUnique(effectAtoms.map((atom) => atom.atom_id), 'atom_id');
  assertUnique(effectAtoms.map((atom) => atom.record_id), 'record_id');
  assertUnique(effectAtoms.map((atom) => atom.exact_reason), 'object-bound exact_reason');

  const atomById = new Map(effectAtoms.map((atom) => [atom.atom_id, atom]));
  const unitById = new Map(sourceUnits.map((unit) => [unit.source_unit_id, unit]));
  let effectBearingUnits = 0;
  let contextUnits = 0;
  let multiAtomUnits = 0;

  for (const unit of sourceUnits) {
    assert.match(unit.source_unit_id, /^BE-SPD-2026-SU-\d{4}$/);
    assert.ok(unit.pdf_pages.includes(unit.pdf_page));
    assert.ok(unit.pdf_pages.every((page) => page >= 1 && page <= 66));
    assert.ok(unit.source_locator.startsWith(`p${String(unit.pdf_page).padStart(3, '0')}:`));
    assert.match(unit.source_text_sha256, SHA256_RE);
    assert.ok(unit.source_excerpt.length > 0 && unit.source_excerpt.length <= 280);
    assert.equal(unit.provenance_ref, metadata.provenance.provenance_id);
    assertUnique(unit.atom_ids, `${unit.source_unit_id} atom bindings`);

    if (unit.classification === 'EFFECT_BEARING') {
      effectBearingUnits += 1;
      assert.equal(unit.effect_bearing, true);
      assert.equal(unit.terminal_status, null);
      assert.ok(unit.atom_ids.length > 0, `${unit.source_unit_id}: effect unit has no atoms`);
      if (unit.atom_ids.length > 1) multiAtomUnits += 1;
      for (const atomId of unit.atom_ids) {
        assert.equal(atomById.get(atomId)?.source_unit_id, unit.source_unit_id);
      }
    } else {
      contextUnits += 1;
      assert.equal(unit.classification, 'NON_EFFECT_CONTEXT');
      assert.equal(unit.effect_bearing, false);
      assert.equal(unit.terminal_status, 'NON_EFFECT_CONTEXT_REVIEWED');
      assert.deepEqual(unit.atom_ids, []);
    }
  }
  assert.ok(multiAtomUnits > 0, 'page→source-unit→0..n atom model was not exercised');

  const allowedAtomicity = new Set([
    'TERMINAL_PUNCTUATION_OR_SEMICOLON_CLAUSE',
    'COORDINATED_INDEPENDENT_ACTION_CLAUSE',
  ]);
  const exactReasonRequirements = metadata.review_class_requirements;
  let explicitApproved = 0;
  let reviewedNotAssessable = 0;

  for (const atom of effectAtoms) {
    assert.equal(atom.record_id, atom.atom_id);
    assert.match(atom.atom_id, /^BE-SPD-2026-SU-\d{4}-A\d{2}$/);
    assert.ok(unitById.has(atom.source_unit_id));
    assert.ok(unitById.get(atom.source_unit_id).atom_ids.includes(atom.atom_id));
    assert.ok(atom.pdf_pages.includes(atom.pdf_page));
    assert.equal(atom.source_locator, unitById.get(atom.source_unit_id).source_locator);
    assert.match(atom.source_text_sha256, SHA256_RE);
    assert.match(atom.source_parent_text_sha256, SHA256_RE);
    assert.ok(atom.source_excerpt.length > 0 && atom.source_excerpt.length <= 280);
    assert.ok(atom.policy_action.length > 0 && atom.policy_action.length <= 280);
    assert.ok(allowedAtomicity.has(atom.atomicity_basis));
    assert.equal(typeof atom.grammatical_context_inherited_from_source_unit, 'boolean');
    assert.equal(atom.approval_basis, APPROVAL_BASIS);
    assert.equal(atom.approval_authority, APPROVAL_AUTHORITY);
    assert.equal(atom.review_mode, REVIEW_MODE);
    assert.equal(atom.human_individual_record_review_claimed, false);
    assert.equal(atom.reviewed_at, '2026-08-26');
    assert.equal(atom.source_refs.length, 1);
    assert.equal(atom.source_refs[0].artifact_id, ARTIFACT_ID);
    assert.equal(atom.source_refs[0].artifact_sha256, ARTIFACT_SHA256);
    assert.equal(atom.source_refs[0].locator, atom.source_locator);

    if (atom.terminal_status === 'EXPLICIT_FACH_APPROVED') {
      explicitApproved += 1;
      for (const field of APPROVED_REQUIRED_FIELDS) {
        assert.ok(atom[field] !== undefined && atom[field] !== null && atom[field] !== 'NOT_AVAILABLE');
      }
    } else {
      reviewedNotAssessable += 1;
      assert.equal(atom.terminal_status, 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON');
      assert.ok(exactReasonRequirements[atom.review_class], `${atom.atom_id}: unknown review class`);
      assert.deepEqual(
        atom.missing_review_inputs,
        exactReasonRequirements[atom.review_class],
        `${atom.atom_id}: non-deterministic missing-input list`,
      );
      assert.ok(atom.missing_review_inputs.length >= 5);
      assert.ok(atom.exact_reason.includes(atom.atom_id));
      assert.ok(atom.exact_reason.includes(atom.review_class));
      for (const missing of atom.missing_review_inputs) {
        assert.ok(atom.exact_reason.includes(missing), `${atom.atom_id}: exact reason omits ${missing}`);
      }
      for (const forbidden of FORBIDDEN_SYNTHETIC_FIELDS) {
        assert.equal(atom[forbidden], undefined, `${atom.atom_id}: forbidden synthesized ${forbidden}`);
      }
    }
  }

  assert.equal(metadata.pages.length, 66);
  assert.deepEqual(metadata.pages.map((page) => page.pdf_page), Array.from({ length: 66 }, (_, i) => i + 1));
  for (const page of metadata.pages) {
    assert.equal(page.visual_reviewed, true);
    assert.equal(
      page.source_unit_count,
      sourceUnits.filter((unit) => unit.pdf_pages.includes(page.pdf_page)).length,
    );
    assert.equal(
      page.effect_atom_count,
      effectAtoms.filter((atom) => atom.pdf_pages.includes(page.pdf_page)).length,
    );
  }

  assert.equal(coverage.expected_page_count, 66);
  assert.equal(coverage.reviewed_page_count, 66);
  assert.equal(coverage.unaccounted_pages, 0);
  assert.equal(coverage.source_unit_count, sourceUnits.length);
  assert.equal(coverage.effect_bearing_source_unit_count, effectBearingUnits);
  assert.equal(coverage.non_effect_context_source_unit_count, contextUnits);
  assert.equal(coverage.effect_atom_count, effectAtoms.length);
  assert.equal(coverage.explicit_fach_approved_count, explicitApproved);
  assert.equal(coverage.reviewed_not_assessable_count, reviewedNotAssessable);
  assert.equal(coverage.non_effect_context_reviewed_count, contextUnits);
  assert.equal(coverage.unclassified_source_units, 0);
  assert.equal(coverage.unterminated_effect_atoms, 0);
  assert.equal(coverage.source_conflicts_without_status, 0);
  assert.equal(coverage.coverage_manifest_pass, true);
  assert.equal(coverage.programme_source_object_review_complete, true);
  assert.equal(coverage.reused_explicit_fach_record_count, 0);
  assert.equal(coverage.genuine_fach_review_required_count, 0);

  const constraints = metadata.constraints;
  assert.ok(Object.values(constraints).every((value) => value === false));

  const hookForHash = structuredClone(hook);
  delete hookForHash.descriptor_sha256;
  assert.equal(sha256(canonicalJson(hookForHash)), hook.descriptor_sha256);
  assert.equal(hook.update_mode, 'PROGRAMME_SCOPED_OVERLAY_DO_NOT_OVERWRITE_SHARED_RESIDUAL');
  assert.equal(hook.target.party, 'SPD');
  assert.equal(hook.target.artifact_id, ARTIFACT_ID);
  assert.equal(hook.target.artifact_sha256, ARTIFACT_SHA256);
  assert.equal(hook.input.logical_descriptor_sha256, manifest.logical_descriptor_sha256);
  assert.equal(hook.overlay.source_unit_count, sourceUnits.length);
  assert.equal(hook.overlay.effect_atom_count, effectAtoms.length);
  assert.equal(hook.overlay.explicit_fach_approved_count, explicitApproved);
  assert.equal(hook.overlay.reviewed_not_assessable_count, reviewedNotAssessable);
  assert.equal(hook.overlay.effect_credit_allowed, false);
  assert.equal(hook.apply_contract.preserve_all_other_programmes, true);
  assert.equal(hook.apply_contract.shared_residual_mutation_performed_by_this_lane, false);

  return {
    artifact_sha256: ARTIFACT_SHA256,
    reviewed_pages: coverage.reviewed_page_count,
    source_units: sourceUnits.length,
    effect_bearing_source_units: effectBearingUnits,
    non_effect_context_source_units: contextUnits,
    multi_atom_source_units: multiAtomUnits,
    effect_atoms: effectAtoms.length,
    explicit_fach_approved: explicitApproved,
    reviewed_not_assessable: reviewedNotAssessable,
    unterminated_effect_atoms: coverage.unterminated_effect_atoms,
    logical_descriptor_sha256: manifest.logical_descriptor_sha256,
    hook_descriptor_sha256: hook.descriptor_sha256,
    gate: 'PASS',
  };
}

export function main() {
  const summary = validateBerlinSpdReviewBundle(loadBerlinSpdReviewBundle());
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
