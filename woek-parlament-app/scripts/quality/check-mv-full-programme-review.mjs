#!/usr/bin/env node

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const REGISTER_PATH = path.join(
  APP_ROOT,
  'data/state-programmes/current-source-registers/mecklenburg-vorpommern-2026-v2.json',
);
const APPROVAL_BASIS = 'DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26';
const APPROVAL_AUTHORITY = 'PROJECT_OWNER_DELEGATED_PROTOCOL';
const REVIEW_MODE = 'SOURCE_BOUND_OBJECT_LEVEL';
const SHA256_RE = /^[0-9a-f]{64}$/;
const FORBIDDEN_FACH_FIELDS = new Set([
  'impact_direction', 'evidence_level', 'materiality', 'uncertainty',
  'problem_review', 'goal_review', 'dns_mapping', 'sdg_mapping',
  'sdg_plus_mapping', 'recommendation', 'party_score', 'party_judgement',
]);

function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortDeep(value[key])]));
}

export function canonicalJson(value) {
  return JSON.stringify(sortDeep(value));
}

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} must be unique`);
}

function loadShards(manifest, refs, expectedType, ledgerDir) {
  const records = [];
  const pageRanges = new Set();
  for (const ref of refs) {
    const shardPath = path.join(ledgerDir, ref.path);
    const bytes = fs.readFileSync(shardPath);
    assert.equal(bytes.length, ref.byte_length, `${ref.path}: byte length mismatch`);
    assert.equal(sha256(bytes), ref.file_sha256, `${ref.path}: byte hash mismatch`);
    const shard = JSON.parse(bytes.toString('utf8'));
    assert.equal(shard.schema_version, '1.0.0');
    assert.equal(shard.ledger_id, manifest.ledger_metadata.ledger_id);
    assert.equal(shard.shard_type, expectedType);
    assert.equal(shard.page_from, ref.page_from);
    assert.equal(shard.page_to, ref.page_to);
    assert.equal(shard.records.length, ref.record_count);
    assert.ok(shard.records.every((record) => record.pdf_page >= ref.page_from && record.pdf_page <= ref.page_to));
    for (let page = ref.page_from; page <= ref.page_to; page += 1) {
      assert.ok(!pageRanges.has(page), `${expectedType}: overlapping page shard ${page}`);
      pageRanges.add(page);
    }
    records.push(...shard.records);
  }
  return { records, pageRanges };
}

export function loadMvReviewBundle(profile) {
  const ledgerDir = path.join(
    APP_ROOT,
    `data/state-programmes/fach-reviews/mecklenburg-vorpommern-2026-${profile.slug}-v1`,
  );
  const manifestPath = path.join(ledgerDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const source = loadShards(manifest, manifest.source_unit_shards, 'SOURCE_UNITS', ledgerDir);
  const atoms = loadShards(manifest, manifest.effect_atom_shards, 'EFFECT_ATOMS', ledgerDir);
  const hookPath = path.join(
    APP_ROOT,
    `data/state-programmes/fach-coverage-hooks/mecklenburg-vorpommern-2026-${profile.slug}-v1.json`,
  );
  return {
    manifest,
    sourceUnits: source.records,
    effectAtoms: atoms.records,
    sourceShardPages: source.pageRanges,
    atomShardPages: atoms.pageRanges,
    hook: JSON.parse(fs.readFileSync(hookPath, 'utf8')),
    register: JSON.parse(fs.readFileSync(REGISTER_PATH, 'utf8')),
    registerBytes: fs.readFileSync(REGISTER_PATH),
  };
}

export function validateMvReviewBundle(bundle, profile, { verifyLogicalDescriptor = true } = {}) {
  const { manifest, sourceUnits, effectAtoms, sourceShardPages, atomShardPages, hook, register, registerBytes } = bundle;
  const metadata = manifest.ledger_metadata;
  const coverage = metadata.coverage;

  assert.equal(manifest.format, 'SHARDED_JSON_LEDGER_V1');
  const unhashedManifest = structuredClone(manifest);
  delete unhashedManifest.manifest_sha256;
  assert.equal(sha256(canonicalJson(unhashedManifest)), manifest.manifest_sha256, 'manifest descriptor mismatch');
  if (verifyLogicalDescriptor) {
    const logical = { ...metadata, source_units: sourceUnits, effect_atoms: effectAtoms };
    assert.equal(sha256(canonicalJson(logical)), manifest.logical_descriptor_sha256, 'logical descriptor mismatch');
  }

  assert.equal(metadata.party, profile.party);
  assert.equal(metadata.jurisdiction, 'mecklenburg-vorpommern');
  assert.equal(metadata.election, 'ltw-2026-mv');
  assert.equal(metadata.artifact.artifact_id, profile.artifactId);
  assert.equal(metadata.artifact.sha256, profile.artifactSha256);
  assert.equal(metadata.artifact.byte_length, profile.artifactBytes);
  assert.equal(metadata.artifact.page_count, profile.pageCount);
  assert.equal(metadata.artifact.url, profile.artifactUrl);
  assert.equal(metadata.provenance.approval_basis, APPROVAL_BASIS);
  assert.equal(metadata.provenance.approval_authority, APPROVAL_AUTHORITY);
  assert.equal(metadata.provenance.review_mode, REVIEW_MODE);
  assert.equal(metadata.provenance.human_individual_record_review_claimed, false);
  assert.equal(sha256(registerBytes), metadata.source_register.sha256);

  const registerParty = register.parties.find((party) => party.party === profile.party);
  assert.ok(registerParty, `${profile.party}: missing from current-source register`);
  assert.equal(registerParty.final_election_programme_verified, true);
  assert.ok(registerParty.source_urls.some((source) => source.url === (profile.registerUrl ?? profile.artifactUrl)));
  if (registerParty.canonical_artifact) {
    assert.equal(registerParty.canonical_artifact.artifact_id, profile.artifactId);
    assert.equal(registerParty.canonical_artifact.sha256, profile.artifactSha256);
    assert.equal(registerParty.canonical_artifact.byte_length, profile.artifactBytes);
    assert.equal(registerParty.canonical_artifact.page_count, profile.pageCount);
  }

  assert.equal(sourceShardPages.size, profile.pageCount);
  assert.equal(atomShardPages.size, profile.pageCount);
  for (let page = 1; page <= profile.pageCount; page += 1) {
    assert.ok(sourceShardPages.has(page));
    assert.ok(atomShardPages.has(page));
  }
  assert.equal(metadata.pages.length, profile.pageCount);
  assert.deepEqual(metadata.pages.map((page) => page.pdf_page), Array.from({ length: profile.pageCount }, (_, index) => index + 1));
  for (const page of metadata.pages) {
    assert.equal(page.page_read_fully, true);
    assert.equal(page.visual_reviewed, true);
    assert.equal(page.page_coverage_pass, true);
    assert.match(page.visual_raster_sha256, SHA256_RE);
    assert.equal(page.source_unit_count, sourceUnits.filter((unit) => unit.pdf_page === page.pdf_page).length);
    assert.equal(page.effect_atom_count, effectAtoms.filter((atom) => atom.pdf_page === page.pdf_page).length);
  }

  assertUnique(sourceUnits.map((unit) => unit.source_unit_id), 'source_unit_id');
  assertUnique(effectAtoms.map((atom) => atom.atom_id), 'atom_id');
  assertUnique(effectAtoms.map((atom) => atom.exact_reason), 'object-bound exact_reason');
  const atomById = new Map(effectAtoms.map((atom) => [atom.atom_id, atom]));
  const unitById = new Map(sourceUnits.map((unit) => [unit.source_unit_id, unit]));
  let effectUnits = 0;
  let contextUnits = 0;
  let multiAtomUnits = 0;

  for (const unit of sourceUnits) {
    assert.ok(unit.pdf_page >= 1 && unit.pdf_page <= profile.pageCount);
    assert.match(unit.source_text_sha256, SHA256_RE);
    assert.ok(unit.source_locator.startsWith(`p${String(unit.pdf_page).padStart(3, '0')}:`));
    assert.equal(sha256(unit.source_text_normalized), unit.source_text_sha256);
    assertUnique(unit.atom_ids, `${unit.source_unit_id}: atom bindings`);
    const markerCount = (unit.source_text_normalized.match(/[●•▪]/g) ?? []).length;
    if (unit.source_visual_role === 'TABLE_OF_CONTENTS') {
      const configuredBlockRefs = profile.tocBlockRefs?.[unit.pdf_page] ?? [];
      const unitBlockRefs = [...unit.source_locator.matchAll(/:sb(\d{3})/g)]
        .map((match) => Number.parseInt(match[1], 10));
      assert.ok(
        (profile.tocPages ?? []).includes(unit.pdf_page)
          || (unitBlockRefs.length > 0 && unitBlockRefs.every((blockRef) => configuredBlockRefs.includes(blockRef)))
          || (unit.pdf_page <= 5 && unit.source_text_normalized.toLocaleLowerCase('de').includes('inhaltsverzeichnis')),
        `${unit.source_unit_id}: unconfigured TABLE_OF_CONTENTS page`,
      );
    }
    if (markerCount > 0 && unit.source_visual_role === 'BODY') {
      assert.equal(unit.effect_bearing, true, `${unit.source_unit_id}: explicit list object classified as context`);
      assert.ok(unit.atom_ids.length >= markerCount, `${unit.source_unit_id}: independent list objects were collapsed`);
    }
    if (unit.classification === 'EFFECT_BEARING') {
      effectUnits += 1;
      assert.equal(unit.effect_bearing, true);
      assert.equal(unit.terminal_status, null);
      assert.equal(unit.classification_basis, 'MECHANICALLY_IDENTIFIED_POLICY_ACTION_CLAUSE');
      assert.equal(unit.exact_reason, null);
      assert.ok(unit.atom_ids.length > 0);
      if (unit.atom_ids.length > 1) multiAtomUnits += 1;
      for (const atomId of unit.atom_ids) assert.equal(atomById.get(atomId)?.source_unit_id, unit.source_unit_id);
    } else {
      contextUnits += 1;
      assert.equal(unit.classification, 'NON_EFFECT_CONTEXT');
      assert.equal(unit.effect_bearing, false);
      assert.equal(unit.terminal_status, 'NON_EFFECT_CONTEXT_REVIEWED');
      assert.match(unit.classification_basis, /_NO_MECHANICALLY_ISOLATED_EFFECT_BEARING_POLICY_OBJECT$/);
      assert.ok(unit.exact_reason.includes(unit.source_unit_id));
      assert.ok(unit.exact_reason.includes(unit.source_locator));
      assert.ok(unit.exact_reason.includes('NON_EFFECT_CONTEXT_REVIEWED'));
      assert.deepEqual(unit.atom_ids, []);
    }
  }

  for (const atom of effectAtoms) {
    assert.equal(atom.record_id, atom.atom_id);
    assert.ok(unitById.has(atom.source_unit_id));
    assert.ok(unitById.get(atom.source_unit_id).atom_ids.includes(atom.atom_id));
    assert.equal(atom.source_locator, unitById.get(atom.source_unit_id).source_locator);
    assert.equal(atom.terminal_status, 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON');
    assert.equal(atom.approval_basis, APPROVAL_BASIS);
    assert.equal(atom.approval_authority, APPROVAL_AUTHORITY);
    assert.equal(atom.review_mode, REVIEW_MODE);
    assert.equal(atom.human_individual_record_review_claimed, false);
    assert.deepEqual(atom.missing_review_inputs, metadata.review_class_requirements[atom.review_class]);
    assert.ok(atom.missing_review_inputs.length >= 6);
    assert.ok(atom.exact_reason.includes(atom.atom_id));
    assert.ok(atom.exact_reason.includes(atom.source_locator));
    assert.ok(atom.exact_reason.includes(atom.review_class));
    for (const missing of atom.missing_review_inputs) assert.ok(atom.exact_reason.includes(missing));
    for (const forbidden of FORBIDDEN_FACH_FIELDS) {
      assert.equal(atom[forbidden], undefined, `${atom.atom_id}: synthesized ${forbidden}`);
    }
    assert.equal(atom.source_refs.length, 1);
    assert.equal(atom.source_refs[0].artifact_id, profile.artifactId);
    assert.equal(atom.source_refs[0].artifact_sha256, profile.artifactSha256);
  }

  assert.equal(coverage.expected_page_count, profile.pageCount);
  assert.equal(coverage.reviewed_page_count, profile.pageCount);
  assert.equal(coverage.unaccounted_pages, 0);
  assert.equal(coverage.source_unit_count, sourceUnits.length);
  assert.equal(coverage.effect_bearing_source_unit_count, effectUnits);
  assert.equal(coverage.non_effect_context_source_unit_count, contextUnits);
  assert.equal(coverage.multi_atom_source_unit_count, multiAtomUnits);
  assert.equal(coverage.effect_atom_count, effectAtoms.length);
  assert.equal(coverage.explicit_fach_approved_count, 0);
  assert.equal(coverage.reviewed_not_assessable_count, effectAtoms.length);
  assert.equal(coverage.non_effect_context_reviewed_count, contextUnits);
  assert.equal(coverage.genuine_fach_review_required_count, 0);
  assert.equal(coverage.unclassified_source_units, 0);
  assert.equal(coverage.unterminated_effect_atoms, 0);
  assert.equal(coverage.source_conflicts_without_status, 0);
  assert.equal(coverage.coverage_manifest_pass, true);
  assert.equal(coverage.programme_source_object_review_complete, true);
  assert.ok(Object.values(metadata.constraints).every((value) => value === false));

  const unhashedHook = structuredClone(hook);
  delete unhashedHook.descriptor_sha256;
  assert.equal(sha256(canonicalJson(unhashedHook)), hook.descriptor_sha256, 'hook descriptor mismatch');
  assert.equal(hook.target.party, profile.party);
  assert.equal(hook.target.artifact_id, profile.artifactId);
  assert.equal(hook.target.artifact_sha256, profile.artifactSha256);
  assert.equal(hook.input.logical_descriptor_sha256, manifest.logical_descriptor_sha256);
  assert.equal(hook.overlay.reviewed_page_count, profile.pageCount);
  assert.equal(hook.overlay.source_unit_count, sourceUnits.length);
  assert.equal(hook.overlay.effect_atom_count, effectAtoms.length);
  assert.equal(hook.overlay.genuine_fach_review_required_count, 0);
  assert.equal(hook.overlay.effect_credit_allowed, false);
  assert.equal(hook.apply_contract.shared_residual_mutation_performed_by_this_lane, false);

  return {
    party: profile.party,
    artifact_sha256: profile.artifactSha256,
    reviewed_pages: profile.pageCount,
    source_units: sourceUnits.length,
    effect_bearing_source_units: effectUnits,
    non_effect_context_source_units: contextUnits,
    multi_atom_source_units: multiAtomUnits,
    effect_atoms: effectAtoms.length,
    reviewed_not_assessable: effectAtoms.length,
    genuine_fach_review_required: 0,
    logical_descriptor_sha256: manifest.logical_descriptor_sha256,
    hook_descriptor_sha256: hook.descriptor_sha256,
    gate: 'PASS_FULL_PROGRAMME_TERMINAL',
  };
}
