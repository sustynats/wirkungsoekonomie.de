#!/usr/bin/env node

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LEDGER_DIR = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-linke-v1');
const HOOK_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-coverage-hooks/berlin-2026-linke-v1.json');
const REGISTER_PATH = path.join(APP_ROOT, 'data/state-programmes/current-source-registers/berlin-2026-v2.json');
const ARTIFACT_ID = 'BE-AGH-2026-LINKE-WAHLPROGRAMM';
const ARTIFACT_SHA256 = '70be401125217cac46a94d3b0b97b49bd332774342e54fb22a202043bd099c1f';
const CHAPTER_STARTS = [14, 41, 55, 73, 84, 99, 112, 127, 147, 152, 175, 192, 209, 211, 216, 219, 230, 244, 259, 268, 275, 286, 303, 312, 325];
const EXPECTED = {
  sourceUnits: 1648, effectUnits: 1244, contextUnits: 404, multiPageUnits: 176,
  multiAtomUnits: 1088, effectAtoms: 5197,
  logicalDescriptor: 'ae6a0c6ab4210429e0d166fd545ec7a8d1f0b5a6641c1be0fd15c0f6ac922ce6',
  hookDescriptor: '459adf3a540ac10e69c63601101ad1348be8b2e6f5825caa9730c8eca17ec4be',
};
const FORBIDDEN = [
  'affected_group_or_system', 'baseline_or_reference_state', 'mechanism', 'potential_state_change',
  'impact_direction', 'evidence_level', 'competence_and_system_boundary', 'material_risks',
  'protected_interests', 'first_order_effects', 'second_order_effects', 'third_order_effects',
  'distribution_effects', 'resilience_lockin_reversibility', 'time_horizon', 'materiality',
  'uncertainty', 'falsification_or_reality_check', 'problem_review', 'goal_review', 'dns_mapping',
  'recommendation', 'sdg_mapping', 'sdg_plus_mapping', 'party_score',
];

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortDeep(value[key])]));
}
const canonical = (value) => JSON.stringify(sortDeep(value));
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
function unique(values, label) { assert.equal(new Set(values).size, values.length, `${label} must be unique`); }

function loadShards(manifest, refs, type) {
  const records = [];
  for (const ref of refs) {
    const bytes = fs.readFileSync(path.join(LEDGER_DIR, ref.path));
    assert.equal(bytes.length, ref.byte_length, `${ref.path}: byte length mismatch`);
    assert.equal(sha256(bytes), ref.file_sha256, `${ref.path}: byte hash mismatch`);
    const shard = JSON.parse(bytes);
    assert.equal(shard.ledger_id, manifest.ledger_metadata.ledger_id);
    assert.equal(shard.shard_type, type);
    assert.equal(shard.page_from, ref.page_from);
    assert.equal(shard.page_to, ref.page_to);
    assert.equal(shard.records.length, ref.record_count);
    assert.ok(shard.records.every((record) => record.pdf_page >= ref.page_from && record.pdf_page <= ref.page_to));
    records.push(...shard.records);
  }
  return records;
}

export function loadBerlinLinkeReviewBundle() {
  const manifest = readJson(path.join(LEDGER_DIR, 'manifest.json'));
  return {
    manifest,
    sourceUnits: loadShards(manifest, manifest.source_unit_shards, 'SOURCE_UNITS'),
    effectAtoms: loadShards(manifest, manifest.effect_atom_shards, 'EFFECT_ATOMS'),
    hook: readJson(HOOK_PATH), register: readJson(REGISTER_PATH), registerBytes: fs.readFileSync(REGISTER_PATH),
  };
}

export function validateBerlinLinkeReviewBundle(bundle, { verifyLogicalDescriptor = true } = {}) {
  const { manifest, sourceUnits, effectAtoms, hook, register, registerBytes } = bundle;
  const metadata = manifest.ledger_metadata;
  const coverage = metadata.coverage;
  const unhashedManifest = structuredClone(manifest);
  delete unhashedManifest.manifest_sha256;
  assert.equal(manifest.format, 'SHARDED_JSON_LEDGER_V1');
  assert.equal(sha256(canonical(unhashedManifest)), manifest.manifest_sha256, 'LINKE manifest descriptor mismatch');
  if (verifyLogicalDescriptor) {
    assert.equal(sha256(canonical({ ...metadata, source_units: sourceUnits, effect_atoms: effectAtoms })), manifest.logical_descriptor_sha256, 'LINKE logical descriptor mismatch');
  }
  assert.equal(metadata.ledger_id, 'WOEK-BE-LINKE-2026-FULL-PROGRAMME-REVIEW-V1');
  assert.equal(metadata.party, 'Die Linke');
  assert.equal(metadata.artifact.artifact_id, ARTIFACT_ID);
  assert.equal(metadata.artifact.sha256, ARTIFACT_SHA256);
  assert.equal(metadata.artifact.byte_length, 2556826);
  assert.equal(metadata.artifact.page_count, 336);
  assert.equal(metadata.provenance.approval_basis, 'DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26');
  assert.equal(metadata.provenance.approval_authority, 'PROJECT_OWNER_DELEGATED_PROTOCOL');
  assert.equal(metadata.provenance.human_individual_record_review_claimed, false);
  assert.equal(metadata.segmentation_contract.visual_review.includes('ALL_336_PHYSICAL_PAGES'), true);
  assert.equal(metadata.field_policy.missing_evidence_is_neutral, false);
  assert.equal(metadata.zero_approval_basis.includes('not a party-, keyword- or missing-evidence-only downgrade rule'), true);

  assert.equal(sha256(registerBytes), metadata.source_register.sha256);
  const registered = register.parties.find((party) => party.party === 'Die Linke');
  assert.ok(registered, 'LINKE missing from source register');
  assert.equal(registered.canonical_artifact.artifact_id, ARTIFACT_ID);
  assert.equal(registered.canonical_artifact.sha256, ARTIFACT_SHA256);
  assert.equal(registered.canonical_artifact.byte_length, 2556826);
  assert.equal(registered.canonical_artifact.page_count, 336);
  assert.equal(registered.canonical_artifact.artifact_url, metadata.artifact.url);

  assert.equal(metadata.pages.length, 336);
  assert.deepEqual(metadata.pages.map((page) => page.pdf_page), Array.from({ length: 336 }, (_, index) => index + 1));
  assert.ok(metadata.pages.every((page) => page.visual_reviewed && page.page_status !== 'UNREVIEWED'));
  assert.deepEqual(metadata.pages.filter((page) => page.source_unit_count === 0).map((page) => page.pdf_page), [4, 334, 335]);
  assert.ok(metadata.pages.every((page) => /^[0-9a-f]{64}$/.test(page.normalized_page_sha256)));

  assert.equal(sourceUnits.length, EXPECTED.sourceUnits);
  assert.equal(effectAtoms.length, EXPECTED.effectAtoms);
  unique(sourceUnits.map((unit) => unit.source_unit_id), 'LINKE source unit IDs');
  unique(effectAtoms.map((atom) => atom.atom_id), 'LINKE atom IDs');
  unique(effectAtoms.map((atom) => atom.exact_reason), 'LINKE object-specific reasons');
  const unitById = new Map(sourceUnits.map((unit) => [unit.source_unit_id, unit]));
  const atomById = new Map(effectAtoms.map((atom) => [atom.atom_id, atom]));
  let effectUnits = 0; let contextUnits = 0; let multiPageUnits = 0; let multiAtomUnits = 0;
  for (const unit of sourceUnits) {
    assert.match(unit.source_unit_id, /^BE-LINKE-2026-SU-\d{4}$/);
    assert.ok(unit.pdf_pages.every((page, index) => page === unit.pdf_page + index && page >= 1 && page <= 336));
    assert.match(unit.source_locator, /^p\d{3}(?:-p\d{3})?:u\d{4}$/);
    assert.match(unit.source_text_sha256, /^[0-9a-f]{64}$/);
    assert.ok(unit.source_excerpt.length > 0 && unit.source_excerpt.length <= 280);
    unique(unit.atom_ids, `${unit.source_unit_id} atom bindings`);
    if (unit.pdf_pages.length > 1) multiPageUnits += 1;
    if (unit.effect_bearing) {
      effectUnits += 1;
      assert.equal(unit.classification, 'EFFECT_BEARING');
      assert.equal(unit.terminal_status, null);
      assert.ok(unit.atom_ids.length >= 1, `${unit.source_unit_id}: no terminal child atom`);
      if (unit.atom_ids.length > 1) multiAtomUnits += 1;
      for (const atomId of unit.atom_ids) assert.equal(atomById.get(atomId)?.source_unit_id, unit.source_unit_id);
    } else {
      contextUnits += 1;
      assert.equal(unit.classification, 'NON_EFFECT_CONTEXT');
      assert.equal(unit.terminal_status, 'NON_EFFECT_CONTEXT_REVIEWED');
      assert.deepEqual(unit.atom_ids, []);
      assert.ok(unit.exact_reason.includes(unit.source_unit_id));
    }
  }
  assert.equal(effectUnits, EXPECTED.effectUnits);
  assert.equal(contextUnits, EXPECTED.contextUnits);
  assert.equal(multiPageUnits, EXPECTED.multiPageUnits);
  assert.equal(multiAtomUnits, EXPECTED.multiAtomUnits);

  const reviewClasses = new Set();
  for (const atom of effectAtoms) {
    assert.equal(atom.record_id, atom.atom_id);
    assert.match(atom.atom_id, /^BE-LINKE-2026-SU-\d{4}-A\d{2}$/);
    const unit = unitById.get(atom.source_unit_id);
    assert.ok(unit, `${atom.atom_id}: orphan atom`);
    assert.ok(unit.atom_ids.includes(atom.atom_id), `${atom.atom_id}: lost child binding`);
    assert.deepEqual(atom.pdf_pages, unit.pdf_pages);
    assert.equal(atom.source_locator, unit.source_locator);
    assert.equal(atom.source_parent_text_sha256, unit.source_text_sha256);
    assert.ok(['TERMINAL_PUNCTUATION_OR_SEMICOLON_CLAUSE', 'INDEPENDENT_COORDINATED_ACTION_CLAUSE'].includes(atom.atomicity_basis));
    assert.equal(atom.terminal_status, 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON');
    assert.ok(metadata.review_class_requirements[atom.review_class]);
    assert.deepEqual(atom.missing_review_inputs, metadata.review_class_requirements[atom.review_class]);
    assert.ok(atom.exact_reason.includes(atom.atom_id) && atom.exact_reason.includes(atom.review_class) && atom.exact_reason.includes(atom.source_excerpt));
    for (const missing of atom.missing_review_inputs) assert.ok(atom.exact_reason.includes(missing));
    for (const field of FORBIDDEN) assert.ok(!(field in atom), `${atom.atom_id}: forbidden synthesized ${field}`);
    assert.equal(atom.approval_basis, 'DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26');
    assert.equal(atom.approval_authority, 'PROJECT_OWNER_DELEGATED_PROTOCOL');
    assert.equal(atom.human_individual_record_review_claimed, false);
    assert.deepEqual(atom.source_refs, [{ artifact_id: ARTIFACT_ID, artifact_sha256: ARTIFACT_SHA256, locator: atom.source_locator }]);
    reviewClasses.add(atom.review_class);
  }
  assert.equal(reviewClasses.size, 20, 'LINKE reasons collapsed into blanket review classes');
  for (const page of metadata.pages) {
    assert.equal(sourceUnits.filter((unit) => unit.pdf_pages.includes(page.pdf_page)).length, page.source_unit_count);
    assert.equal(effectAtoms.filter((atom) => atom.pdf_pages.includes(page.pdf_page)).length, page.effect_atom_count);
  }
  assert.ok(CHAPTER_STARTS.every((page) => sourceUnits.some((unit) => unit.effect_bearing && unit.pdf_pages.includes(page))), 'chapter-start programme content lost');

  assert.equal(coverage.source_unit_count, EXPECTED.sourceUnits);
  assert.equal(coverage.effect_bearing_source_unit_count, EXPECTED.effectUnits);
  assert.equal(coverage.non_effect_context_source_unit_count, EXPECTED.contextUnits);
  assert.equal(coverage.multi_page_source_unit_count, EXPECTED.multiPageUnits);
  assert.equal(coverage.multi_atom_source_unit_count, EXPECTED.multiAtomUnits);
  assert.equal(coverage.effect_atom_count, EXPECTED.effectAtoms);
  assert.equal(coverage.reviewed_page_count, 336);
  assert.equal(coverage.unaccounted_pages, 0);
  assert.equal(coverage.explicit_fach_approved_count, 0);
  assert.equal(coverage.reviewed_not_assessable_count, EXPECTED.effectAtoms);
  assert.equal(coverage.unterminated_effect_atoms, 0);
  assert.equal(coverage.genuine_fach_review_required_count, 0);
  assert.equal(coverage.all_effect_bearing_atoms_terminal, true);
  assert.equal(coverage.programme_source_object_review_complete, true);

  const unhashedHook = structuredClone(hook); delete unhashedHook.descriptor_sha256;
  assert.equal(sha256(canonical(unhashedHook)), hook.descriptor_sha256, 'LINKE hook descriptor mismatch');
  assert.equal(hook.update_mode, 'PROGRAMME_SCOPED_OVERLAY_DO_NOT_OVERWRITE_SHARED_RESIDUAL');
  assert.equal(hook.target.party, 'Die Linke');
  assert.equal(hook.target.artifact_sha256, ARTIFACT_SHA256);
  assert.equal(hook.input.logical_descriptor_sha256, manifest.logical_descriptor_sha256);
  assert.equal(hook.overlay.programme_analysis_complete, true);
  assert.equal(hook.overlay.effect_credit_allowed, false);
  assert.equal(hook.apply_contract.shared_residual_mutation_performed_by_this_lane, false);
  assert.equal(hook.constraints.vercel_build_triggered, false);

  return {
    artifact_sha256: ARTIFACT_SHA256, reviewed_pages: 336, source_units: sourceUnits.length,
    effect_bearing_source_units: effectUnits, non_effect_context_source_units: contextUnits,
    multi_page_source_units: multiPageUnits, multi_atom_source_units: multiAtomUnits,
    effect_atoms: effectAtoms.length, explicit_fach_approved: 0, reviewed_not_assessable: effectAtoms.length,
    unterminated_effect_atoms: 0, logical_descriptor_sha256: manifest.logical_descriptor_sha256,
    hook_descriptor_sha256: hook.descriptor_sha256, gate: 'PASS',
  };
}

const direct = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (direct) {
  const artifactIndex = process.argv.indexOf('--artifact');
  if (artifactIndex >= 0) {
    assert.ok(process.argv[artifactIndex + 1]);
    execFileSync('python3', [path.join(APP_ROOT, 'scripts/quality/materialize-berlin-linke-fach-review.py'), '--artifact', process.argv[artifactIndex + 1], '--check'], { cwd: APP_ROOT, stdio: 'inherit' });
  }
  console.log(JSON.stringify(validateBerlinLinkeReviewBundle(loadBerlinLinkeReviewBundle())));
}
