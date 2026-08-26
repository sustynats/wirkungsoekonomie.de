#!/usr/bin/env node

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MANIFEST_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-afd-v1/manifest.json');
const HOOK_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-coverage-hooks/berlin-2026-afd-v1.json');
const REGISTER_PATH = path.join(APP_ROOT, 'data/state-programmes/current-source-registers/berlin-2026-v2.json');
const APPROVED_REVIEW_PATH = path.join(APP_ROOT, 'data/states/berlin/approved-review-2026-08-18.md');

const ARTIFACT_ID = 'BE-AGH-2026-AFD-LANDESWAHLPROGRAMM';
const ARTIFACT_SHA256 = '949b0c7cc193801c48fa5c859cb0088fae6ed8cb304d47c91bd5eb441af6bd35';
const ARTIFACT_BYTES = 9161383;
const ARTIFACT_PAGES = 99;
const APPROVAL_BASIS = 'DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26';
const APPROVAL_AUTHORITY = 'PROJECT_OWNER_DELEGATED_PROTOCOL';
const REVIEW_MODE = 'SOURCE_BOUND_OBJECT_LEVEL';
const SHA256_RE = /^[0-9a-f]{64}$/;
const FORBIDDEN_SYNTHETIC_FIELDS = [
  'impact_direction', 'evidence_level', 'materiality', 'uncertainty',
  'problem_review', 'goal_review', 'dns_mapping', 'recommendation',
  'sdg_mapping', 'sdg_plus_mapping', 'party_score', 'party_judgement',
];
const ALLOWED_VISUAL_ROLES = new Set([
  'BODY', 'HEADING', 'TABLE_OF_CONTENTS', 'SECTION_COVER',
  'FOOTNOTE_OR_SMALL_PRINT', 'BACK_COVER',
]);
const ALLOWED_ATOMICITY = new Set([
  'TERMINAL_PUNCTUATION_OR_SEMICOLON_CLAUSE',
  'COORDINATED_INDEPENDENT_ACTION_CLAUSE',
]);

function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortDeep(value[key])]));
}

function canonicalJson(value) {
  return JSON.stringify(sortDeep(value));
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function excerpt(value, limit = 280) {
  return value.length <= limit ? value : `${value.slice(0, limit - 1).trimEnd()}…`;
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
    const bytes = fs.readFileSync(path.join(ledgerDir, ref.path));
    assert.equal(bytes.length, ref.byte_length, `${ref.path}: byte length mismatch`);
    assert.equal(sha256(bytes), ref.file_sha256, `${ref.path}: byte hash mismatch`);
    const shard = JSON.parse(bytes.toString('utf8'));
    assert.equal(shard.schema_version, '1.0.0');
    assert.equal(shard.shard_type, expectedType);
    assert.equal(shard.ledger_id, manifest.ledger_metadata.ledger_id);
    assert.equal(shard.page_from, ref.page_from);
    assert.equal(shard.page_to, ref.page_to);
    assert.equal(shard.records.length, ref.record_count);
    assert.ok(shard.records.every((record) => record.pdf_page >= ref.page_from && record.pdf_page <= ref.page_to));
    records.push(...shard.records);
  }
  return records;
}

export function loadBerlinAfdReviewBundle() {
  const manifest = readJson(MANIFEST_PATH);
  return {
    manifest,
    sourceUnits: loadShards(manifest, manifest.source_unit_shards, 'SOURCE_UNITS'),
    effectAtoms: loadShards(manifest, manifest.effect_atom_shards, 'EFFECT_ATOMS'),
    hook: readJson(HOOK_PATH),
    register: readJson(REGISTER_PATH),
    registerBytes: fs.readFileSync(REGISTER_PATH),
    approvedReviewBytes: fs.readFileSync(APPROVED_REVIEW_PATH),
  };
}

export function validateBerlinAfdReviewBundle(bundle, { verifyLogicalDescriptor = true } = {}) {
  const { manifest, sourceUnits, effectAtoms, hook, register, registerBytes, approvedReviewBytes } = bundle;
  const metadata = manifest.ledger_metadata;
  const coverage = metadata.coverage;

  assert.equal(manifest.format, 'SHARDED_JSON_LEDGER_V1');
  const manifestForHash = structuredClone(manifest);
  delete manifestForHash.manifest_sha256;
  assert.equal(sha256(canonicalJson(manifestForHash)), manifest.manifest_sha256, 'manifest descriptor mismatch');
  if (verifyLogicalDescriptor) {
    assert.equal(
      sha256(canonicalJson({ ...metadata, source_units: sourceUnits, effect_atoms: effectAtoms })),
      manifest.logical_descriptor_sha256,
      'logical ledger descriptor mismatch',
    );
  }

  assert.equal(metadata.party, 'AfD');
  assert.equal(metadata.jurisdiction, 'berlin');
  assert.equal(metadata.artifact.artifact_id, ARTIFACT_ID);
  assert.equal(metadata.artifact.sha256, ARTIFACT_SHA256);
  assert.equal(metadata.artifact.byte_length, ARTIFACT_BYTES);
  assert.equal(metadata.artifact.page_count, ARTIFACT_PAGES);
  assert.equal(metadata.provenance.approval_basis, APPROVAL_BASIS);
  assert.equal(metadata.provenance.approval_authority, APPROVAL_AUTHORITY);
  assert.equal(metadata.provenance.review_mode, REVIEW_MODE);
  assert.equal(metadata.provenance.human_individual_record_review_claimed, false);
  assert.equal(sha256(registerBytes), metadata.source_register.sha256);

  const afd = register.parties.find((party) => party.party === 'AfD');
  assert.ok(afd, 'AfD missing from Berlin v2 source register');
  assert.equal(afd.canonical_artifact.artifact_id, ARTIFACT_ID);
  assert.equal(afd.canonical_artifact.sha256, ARTIFACT_SHA256);
  assert.equal(afd.canonical_artifact.byte_length, ARTIFACT_BYTES);
  assert.equal(afd.canonical_artifact.page_count, ARTIFACT_PAGES);
  assert.equal(afd.canonical_artifact.artifact_url, metadata.artifact.url);
  const approvedReviewHash = sha256(approvedReviewBytes);
  assert.ok(metadata.review_inventory.some((entry) => entry.sha256 === approvedReviewHash));
  assert.ok(metadata.zero_approval_basis.includes('no effect atom qualifies for exact Fach reuse'));

  assertUnique(sourceUnits.map((unit) => unit.source_unit_id), 'source_unit_id');
  assertUnique(effectAtoms.map((atom) => atom.atom_id), 'atom_id');
  assertUnique(effectAtoms.map((atom) => atom.record_id), 'record_id');
  assertUnique(effectAtoms.map((atom) => atom.exact_reason), 'object-bound exact_reason');
  const atomById = new Map(effectAtoms.map((atom) => [atom.atom_id, atom]));
  const unitById = new Map(sourceUnits.map((unit) => [unit.source_unit_id, unit]));
  let effectBearingUnits = 0;
  let contextUnits = 0;
  let multiAtomUnits = 0;
  let crossPageUnits = 0;
  let listSourceUnits = 0;
  const visualRoleCounts = new Map();
  const blockRefsByPage = new Map();
  const allBlockRefs = [];

  for (const unit of sourceUnits) {
    assert.match(unit.source_unit_id, /^BE-AFD-2026-SU-\d{4}$/);
    assert.ok(unit.pdf_pages.includes(unit.pdf_page));
    assert.ok(unit.pdf_pages.every((page) => page >= 1 && page <= ARTIFACT_PAGES));
    assert.ok(unit.source_locator.startsWith(`p${String(unit.pdf_page).padStart(3, '0')}:`));
    for (const ref of unit.source_locator.split(';')) {
      assert.match(ref, /^p\d{3}:b\d{3}@[0-9.,-]+$/);
      const refPage = Number(ref.slice(1, 4));
      assert.ok(unit.pdf_pages.includes(refPage), `${unit.source_unit_id}: block ref page not bound to unit`);
      blockRefsByPage.set(refPage, (blockRefsByPage.get(refPage) ?? 0) + 1);
      allBlockRefs.push(ref);
    }
    assert.match(unit.source_text_sha256, SHA256_RE);
    assert.equal(sha256(unit.source_text_normalized), unit.source_text_sha256);
    assert.equal(unit.source_excerpt, excerpt(unit.source_text_normalized));
    assert.ok(ALLOWED_VISUAL_ROLES.has(unit.source_visual_role));
    assert.equal(typeof unit.contains_explicit_list_marker, 'boolean');
    assert.equal(unit.provenance_ref, metadata.provenance.provenance_id);
    assert.equal(unit.reviewed_at, '2026-08-26');
    assertUnique(unit.atom_ids, `${unit.source_unit_id} atom bindings`);
    if (unit.pdf_pages.length > 1) crossPageUnits += 1;
    if (unit.contains_explicit_list_marker) listSourceUnits += 1;
    visualRoleCounts.set(unit.source_visual_role, (visualRoleCounts.get(unit.source_visual_role) ?? 0) + 1);

    if (unit.classification === 'EFFECT_BEARING') {
      effectBearingUnits += 1;
      assert.equal(unit.effect_bearing, true);
      assert.equal(unit.terminal_status, null);
      assert.equal(unit.source_visual_role, 'BODY');
      assert.ok(unit.atom_ids.length > 0, `${unit.source_unit_id}: effect unit has no atoms`);
      if (unit.atom_ids.length > 1) multiAtomUnits += 1;
      for (const atomId of unit.atom_ids) assert.equal(atomById.get(atomId)?.source_unit_id, unit.source_unit_id);
    } else {
      contextUnits += 1;
      assert.equal(unit.classification, 'NON_EFFECT_CONTEXT');
      assert.equal(unit.effect_bearing, false);
      assert.equal(unit.terminal_status, 'NON_EFFECT_CONTEXT_REVIEWED');
      assert.deepEqual(unit.atom_ids, []);
    }
  }
  assert.ok(multiAtomUnits > 0, 'page→source-unit→0..n atom model was not exercised');
  assert.ok(crossPageUnits > 0, 'cross-page source continuations were not preserved');
  assert.ok(listSourceUnits > 0, 'explicit arrow/plus list source units missing');
  assertUnique(allBlockRefs, 'source block refs');
  for (const requiredRole of ['BODY', 'HEADING', 'TABLE_OF_CONTENTS', 'SECTION_COVER', 'BACK_COVER']) {
    assert.ok((visualRoleCounts.get(requiredRole) ?? 0) > 0, `${requiredRole} coverage missing`);
  }

  const exactReasonRequirements = metadata.review_class_requirements;
  const missingSignatures = new Set();
  let listAtoms = 0;
  for (const atom of effectAtoms) {
    const unit = unitById.get(atom.source_unit_id);
    assert.ok(unit, `${atom.atom_id}: missing source unit`);
    assert.equal(atom.record_id, atom.atom_id);
    assert.match(atom.atom_id, /^BE-AFD-2026-SU-\d{4}-A\d{2}$/);
    assert.ok(unit.atom_ids.includes(atom.atom_id), `${atom.atom_id}: source-unit atom binding missing`);
    assert.ok(atom.pdf_pages.includes(atom.pdf_page));
    assert.equal(atom.source_locator, unit.source_locator);
    assert.equal(atom.source_parent_text_sha256, unit.source_text_sha256);
    assert.equal(sha256(atom.source_sentence_normalized), atom.source_sentence_sha256);
    assert.equal(atom.source_text_sha256, atom.source_sentence_sha256);
    assert.ok(unit.source_text_normalized.includes(atom.source_sentence_normalized));
    assert.equal(atom.source_excerpt, excerpt(atom.source_sentence_normalized));
    assert.equal(sha256(atom.policy_action), atom.policy_action_sha256);
    assert.ok(atom.policy_action.length >= 10);
    assert.ok(ALLOWED_ATOMICITY.has(atom.atomicity_basis));
    assert.equal(typeof atom.grammatical_context_inherited_from_source_unit, 'boolean');
    assert.equal(typeof atom.source_list_item, 'boolean');
    if (atom.source_list_item) listAtoms += 1;
    assert.equal(atom.approval_basis, APPROVAL_BASIS);
    assert.equal(atom.approval_authority, APPROVAL_AUTHORITY);
    assert.equal(atom.review_mode, REVIEW_MODE);
    assert.equal(atom.human_individual_record_review_claimed, false);
    assert.equal(atom.reviewed_at, '2026-08-26');
    assert.equal(atom.source_refs.length, 1);
    assert.equal(atom.source_refs[0].artifact_id, ARTIFACT_ID);
    assert.equal(atom.source_refs[0].artifact_sha256, ARTIFACT_SHA256);
    assert.equal(atom.source_refs[0].locator, atom.source_locator);
    assert.equal(atom.terminal_status, 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON');
    assert.ok(exactReasonRequirements[atom.review_class], `${atom.atom_id}: unknown review class`);
    assert.deepEqual(atom.missing_review_inputs, exactReasonRequirements[atom.review_class]);
    assert.ok(atom.missing_review_inputs.length >= 6);
    missingSignatures.add(atom.missing_review_inputs.join('|'));
    assert.ok(atom.exact_reason.includes(atom.atom_id));
    assert.ok(atom.exact_reason.includes(atom.review_class));
    assert.ok(atom.exact_reason.includes(excerpt(atom.policy_action)));
    for (const missing of atom.missing_review_inputs) {
      assert.ok(atom.exact_reason.includes(missing), `${atom.atom_id}: exact reason omits ${missing}`);
    }
    for (const forbidden of FORBIDDEN_SYNTHETIC_FIELDS) {
      assert.equal(atom[forbidden], undefined, `${atom.atom_id}: forbidden synthesized ${forbidden}`);
    }
    assert.equal(atom.existing_fach_stock_overlap, undefined);
  }
  assert.ok(listAtoms >= 190, 'explicit AfD arrow/plus measures were not atomically bound');
  assert.ok(missingSignatures.size >= 15, 'RNAA reasons collapsed into a blanket missing-input formula');

  assert.equal(metadata.pages.length, ARTIFACT_PAGES);
  assert.deepEqual(metadata.pages.map((page) => page.pdf_page), Array.from({ length: ARTIFACT_PAGES }, (_, index) => index + 1));
  assert.ok(metadata.pages.reduce((sum, page) => sum + page.list_or_callout_block_count, 0) >= 90);
  for (const page of metadata.pages) {
    assert.equal(page.visual_reviewed, true);
    assert.equal(page.boxes_tables_and_footnotes_reviewed, true);
    assert.ok(page.source_unit_count > 0, `page ${page.pdf_page}: no classified source unit`);
    assert.equal(blockRefsByPage.get(page.pdf_page), page.preserved_block_count, `page ${page.pdf_page}: preserved block coverage gap`);
    assert.equal(page.preserved_block_count + page.excluded_page_furniture_count, page.text_layer_block_count);
    assert.equal(page.source_unit_count, sourceUnits.filter((unit) => unit.pdf_pages.includes(page.pdf_page)).length);
    assert.equal(page.effect_atom_count, effectAtoms.filter((atom) => atom.pdf_pages.includes(page.pdf_page)).length);
  }

  assert.equal(coverage.expected_page_count, ARTIFACT_PAGES);
  assert.equal(coverage.reviewed_page_count, ARTIFACT_PAGES);
  assert.equal(coverage.unaccounted_pages, 0);
  assert.equal(coverage.source_unit_count, sourceUnits.length);
  assert.equal(coverage.effect_bearing_source_unit_count, effectBearingUnits);
  assert.equal(coverage.non_effect_context_source_unit_count, contextUnits);
  assert.equal(coverage.multi_atom_source_unit_count, multiAtomUnits);
  assert.equal(coverage.effect_atom_count, effectAtoms.length);
  assert.equal(coverage.explicit_fach_approved_count, 0);
  assert.equal(coverage.reused_explicit_fach_record_count, 0);
  assert.equal(coverage.reviewed_not_assessable_count, effectAtoms.length);
  assert.equal(coverage.unclassified_source_units, 0);
  assert.equal(coverage.unterminated_effect_atoms, 0);
  assert.equal(coverage.coverage_manifest_pass, true);
  assert.equal(coverage.programme_source_object_review_complete, true);
  assert.equal(coverage.genuine_fach_review_required_count, 0);
  assert.ok(Object.values(metadata.constraints).every((value) => value === false));

  const hookForHash = structuredClone(hook);
  delete hookForHash.descriptor_sha256;
  assert.equal(sha256(canonicalJson(hookForHash)), hook.descriptor_sha256);
  assert.equal(hook.update_mode, 'PROGRAMME_SCOPED_OVERLAY_DO_NOT_OVERWRITE_SHARED_RESIDUAL');
  assert.equal(hook.target.party, 'AfD');
  assert.equal(hook.target.artifact_id, ARTIFACT_ID);
  assert.equal(hook.target.artifact_sha256, ARTIFACT_SHA256);
  assert.equal(hook.input.logical_descriptor_sha256, manifest.logical_descriptor_sha256);
  assert.equal(hook.overlay.source_unit_count, sourceUnits.length);
  assert.equal(hook.overlay.effect_atom_count, effectAtoms.length);
  assert.equal(hook.overlay.explicit_fach_approved_count, 0);
  assert.equal(hook.overlay.reused_explicit_fach_record_count, 0);
  assert.equal(hook.overlay.reviewed_not_assessable_count, effectAtoms.length);
  assert.equal(hook.overlay.effect_credit_allowed, false);
  assert.equal(hook.apply_contract.preserve_all_other_programmes, true);
  assert.equal(hook.apply_contract.shared_residual_mutation_performed_by_this_lane, false);

  return {
    artifact_sha256: ARTIFACT_SHA256,
    reviewed_pages: ARTIFACT_PAGES,
    source_units: sourceUnits.length,
    effect_bearing_source_units: effectBearingUnits,
    non_effect_context_source_units: contextUnits,
    multi_atom_source_units: multiAtomUnits,
    cross_page_source_units: crossPageUnits,
    list_source_units: listSourceUnits,
    list_effect_atoms: listAtoms,
    effect_atoms: effectAtoms.length,
    explicit_fach_approved: 0,
    reviewed_not_assessable: effectAtoms.length,
    unterminated_effect_atoms: coverage.unterminated_effect_atoms,
    logical_descriptor_sha256: manifest.logical_descriptor_sha256,
    hook_descriptor_sha256: hook.descriptor_sha256,
    gate: 'PASS',
  };
}

export function main() {
  process.stdout.write(`${JSON.stringify(validateBerlinAfdReviewBundle(loadBerlinAfdReviewBundle()), null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
