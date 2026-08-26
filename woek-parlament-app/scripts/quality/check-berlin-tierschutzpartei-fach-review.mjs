#!/usr/bin/env node

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIR = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-tierschutzpartei-v1');
const MANIFEST_PATH = path.join(DIR, 'manifest.json');
const HOOK_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-coverage-hooks/berlin-2026-tierschutzpartei-v1.json');
const REGISTER_PATH = path.join(APP_ROOT, 'data/state-programmes/current-source-registers/berlin-2026-v2.json');
const ARTIFACT_ID = 'BE-AGH-2026-TIERSCHUTZPARTEI-WAHLPROGRAMM';
const ARTIFACT_SHA256 = '1db89d9811e0d546c269c6ad6819603e12841b0d3f7f20f976444858d86cf172';
const FORBIDDEN = ['affected_group_or_system', 'baseline_or_reference_state', 'mechanism', 'potential_state_change', 'impact_direction', 'evidence_level', 'competence_and_system_boundary', 'material_risks', 'protected_interests', 'first_order_effects', 'second_order_effects', 'third_order_effects', 'distribution_effects', 'resilience_lockin_reversibility', 'time_horizon', 'materiality', 'uncertainty', 'falsification_or_reality_check', 'problem_review', 'goal_review', 'dns_mapping', 'recommendation', 'sdg_mapping', 'sdg_plus_mapping', 'party_score'];
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const unique = (values, label) => assert.equal(new Set(values).size, values.length, `${label} must be unique`);

function loadShards(manifest, refs, type) {
  const records = [];
  for (const ref of refs) {
    const bytes = fs.readFileSync(path.join(DIR, ref.path));
    assert.equal(bytes.length, ref.byte_length, `${ref.path}: byte length`);
    assert.equal(sha256(bytes), ref.file_sha256, `${ref.path}: file hash`);
    const shard = JSON.parse(bytes);
    assert.equal(shard.schema_version, '1.0.0');
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

export function loadBerlinTierschutzparteiReviewBundle() {
  const manifest = read(MANIFEST_PATH);
  return { manifest, sourceUnits: loadShards(manifest, manifest.source_unit_shards, 'SOURCE_UNITS'), effectAtoms: loadShards(manifest, manifest.effect_atom_shards, 'EFFECT_ATOMS'), hook: read(HOOK_PATH), register: read(REGISTER_PATH), registerBytes: fs.readFileSync(REGISTER_PATH) };
}

export function validateBerlinTierschutzparteiReviewBundle(bundle, { verifyDescriptors = true } = {}) {
  const { manifest, sourceUnits, effectAtoms, hook, register, registerBytes } = bundle;
  const metadata = manifest.ledger_metadata; const coverage = metadata.coverage;
  assert.equal(manifest.format, 'SHARDED_JSON_LEDGER_V1');
  const unhashedManifest = structuredClone(manifest); delete unhashedManifest.manifest_sha256;
  assert.equal(sha256(JSON.stringify(unhashedManifest)), manifest.manifest_sha256, 'Tierschutzpartei manifest descriptor mismatch');
  if (verifyDescriptors) assert.equal(sha256(JSON.stringify({ metadata, source_units: sourceUnits, effect_atoms: effectAtoms })), manifest.logical_descriptor_sha256, 'Tierschutzpartei logical descriptor mismatch');
  assert.equal(metadata.ledger_id, 'WOEK-BE-TIERSCHUTZPARTEI-2026-FULL-PROGRAMME-REVIEW-V1');
  assert.equal(metadata.party, 'Tierschutzpartei');
  assert.equal(metadata.artifact.artifact_id, ARTIFACT_ID);
  assert.equal(metadata.artifact.sha256, ARTIFACT_SHA256);
  assert.equal(metadata.artifact.byte_length, 5583527);
  assert.equal(metadata.artifact.page_count, 96);
  assert.equal(metadata.provenance.approval_basis, 'DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26');
  assert.equal(metadata.provenance.approval_authority, 'PROJECT_OWNER_DELEGATED_PROTOCOL');
  assert.equal(metadata.provenance.review_mode, 'SOURCE_BOUND_OBJECT_LEVEL');
  assert.equal(metadata.provenance.human_individual_record_review_claimed, false);
  assert.equal(sha256(registerBytes), metadata.source_register.sha256);
  const registered = register.parties.find((party) => party.party === 'Tierschutzpartei')?.canonical_artifact;
  assert.equal(registered?.artifact_id, ARTIFACT_ID);
  assert.equal(registered?.sha256, ARTIFACT_SHA256);
  assert.equal(registered?.byte_length, 5583527);
  assert.equal(registered?.page_count, 96);

  assert.equal(metadata.pages.length, 96);
  assert.deepEqual(metadata.pages.map((page) => page.pdf_page), Array.from({ length: 96 }, (_, index) => index + 1));
  assert.ok(metadata.pages.every((page) => page.visual_reviewed && /^[0-9a-f]{64}$/u.test(page.normalized_page_sha256)));
  assert.equal(sourceUnits.length, 642);
  assert.equal(effectAtoms.length, 2389);
  unique(sourceUnits.map((unit) => unit.source_unit_id), 'source_unit_id');
  unique(effectAtoms.map((atom) => atom.atom_id), 'atom_id');
  unique(effectAtoms.map((atom) => atom.exact_reason), 'object-specific exact_reason');
  const units = new Map(sourceUnits.map((unit) => [unit.source_unit_id, unit]));
  const atoms = new Map(effectAtoms.map((atom) => [atom.atom_id, atom]));
  let effectUnits = 0; let contextUnits = 0; let multiPage = 0; let multiAtom = 0;
  for (const unit of sourceUnits) {
    assert.match(unit.source_unit_id, /^BE-TIERSCHUTZ-2026-SU-\d{4}$/u);
    assert.ok(unit.pdf_pages.includes(unit.pdf_page));
    assert.ok(unit.pdf_pages.every((page, index) => page === unit.pdf_page + index && page >= 1 && page <= 96));
    assert.match(unit.source_locator, /^p\d{3}(?:-p\d{3})?:u\d{4}$/u);
    assert.match(unit.source_text_sha256, /^[0-9a-f]{64}$/u);
    assert.ok(unit.source_excerpt.length > 0 && unit.source_excerpt.length <= 280);
    unique(unit.atom_ids, `${unit.source_unit_id} child bindings`);
    if (unit.pdf_pages.length > 1) multiPage += 1;
    if (unit.effect_bearing) {
      effectUnits += 1; assert.equal(unit.classification, 'EFFECT_BEARING'); assert.equal(unit.terminal_status, null); assert.ok(unit.atom_ids.length >= 1);
      if (unit.atom_ids.length > 1) multiAtom += 1;
      for (const atomId of unit.atom_ids) assert.equal(atoms.get(atomId)?.source_unit_id, unit.source_unit_id, `${unit.source_unit_id}: lost child binding`);
    } else {
      contextUnits += 1; assert.equal(unit.classification, 'NON_EFFECT_CONTEXT_REVIEWED'); assert.equal(unit.terminal_status, 'NON_EFFECT_CONTEXT_REVIEWED'); assert.deepEqual(unit.atom_ids, []); assert.ok(unit.exact_reason.includes(unit.source_unit_id));
    }
  }
  assert.equal(effectUnits, 580); assert.equal(contextUnits, 62); assert.equal(multiPage, 52); assert.equal(multiAtom, 555);
  const classes = new Set();
  for (const atom of effectAtoms) {
    assert.equal(atom.record_id, atom.atom_id);
    assert.match(atom.atom_id, /^BE-TIERSCHUTZ-2026-SU-\d{4}-A\d{2}$/u);
    const unit = units.get(atom.source_unit_id); assert.ok(unit, `${atom.atom_id}: orphan atom`); assert.ok(unit.atom_ids.includes(atom.atom_id), `${atom.atom_id}: lost parent binding`);
    assert.deepEqual(atom.pdf_pages, unit.pdf_pages); assert.equal(atom.source_parent_text_sha256, unit.source_text_sha256);
    assert.equal(atom.terminal_status, 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON');
    assert.deepEqual(atom.missing_review_inputs, metadata.review_class_requirements[atom.review_class]); assert.ok(atom.missing_review_inputs.length >= 6);
    assert.ok(atom.exact_reason.includes(atom.atom_id)); assert.ok(atom.exact_reason.includes(atom.review_class)); assert.ok(atom.exact_reason.includes(atom.source_excerpt));
    for (const missing of atom.missing_review_inputs) assert.ok(atom.exact_reason.includes(missing));
    for (const field of FORBIDDEN) assert.ok(!(field in atom), `${atom.atom_id}: forbidden synthesized ${field}`);
    assert.equal(atom.approval_basis, 'DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26'); assert.equal(atom.approval_authority, 'PROJECT_OWNER_DELEGATED_PROTOCOL'); assert.equal(atom.review_mode, 'SOURCE_BOUND_OBJECT_LEVEL'); assert.equal(atom.human_individual_record_review_claimed, false);
    assert.equal(atom.source_refs.length, 1); assert.equal(atom.source_refs[0].artifact_id, ARTIFACT_ID); assert.equal(atom.source_refs[0].artifact_sha256, ARTIFACT_SHA256); assert.equal(atom.source_refs[0].locator, atom.source_locator);
    classes.add(atom.review_class);
  }
  assert.equal(classes.size, 20, 'review reasons collapsed into blanket class');
  for (const page of metadata.pages) {
    assert.equal(sourceUnits.filter((unit) => unit.pdf_pages.includes(page.pdf_page)).length, page.source_unit_count);
    assert.equal(effectAtoms.filter((atom) => atom.pdf_pages.includes(page.pdf_page)).length, page.effect_atom_count);
  }
  assert.deepEqual({ pages: coverage.reviewed_page_count, gaps: coverage.unaccounted_pages, sourceUnits: coverage.source_unit_count, effectUnits: coverage.effect_bearing_source_unit_count, contextUnits: coverage.non_effect_context_source_unit_count, multiPage: coverage.multi_page_source_unit_count, multiAtom: coverage.multi_atom_source_unit_count, atoms: coverage.effect_atom_count, approved: coverage.explicit_fach_approved_count, rnaa: coverage.reviewed_not_assessable_count, genuine: coverage.genuine_fach_review_required_count, unterminated: coverage.unterminated_effect_atoms }, { pages: 96, gaps: 0, sourceUnits: 642, effectUnits: 580, contextUnits: 62, multiPage: 52, multiAtom: 555, atoms: 2389, approved: 0, rnaa: 2389, genuine: 0, unterminated: 0 });
  assert.equal(coverage.programme_source_object_review_complete, true);

  const phrases = effectAtoms.map((atom) => atom.source_excerpt).join('\n');
  for (const anchor of ['Wir schaffen mehr bezahlbaren Wohnraum', 'Wir werden ein umfassendes Artenschutzprogramm umsetzen', 'Wahre Kosten tierlicher Produkte sichtbar machen', 'Tierbörsen und Tiermärkte schaffen wir mittelfristig ab', 'Einsatz von Tieren bei der Polizei Berlin schrittweise beenden']) assert.ok(phrases.includes(anchor), `missing visual/source anchor: ${anchor}`);
  assert.ok(!effectAtoms.some((atom) => /^also Laborfleisch/u.test(atom.source_excerpt)), 'linked p90 text-frame continuation was detached');

  const unhashedHook = structuredClone(hook); delete unhashedHook.descriptor_sha256;
  assert.equal(sha256(JSON.stringify(unhashedHook)), hook.descriptor_sha256, 'Tierschutzpartei hook descriptor mismatch');
  assert.equal(hook.update_mode, 'PROGRAMME_SCOPED_OVERLAY_DO_NOT_OVERWRITE_SHARED_RESIDUAL');
  assert.equal(hook.target.party, 'Tierschutzpartei'); assert.equal(hook.target.artifact_id, ARTIFACT_ID); assert.equal(hook.target.artifact_sha256, ARTIFACT_SHA256);
  assert.equal(hook.input.logical_descriptor_sha256, manifest.logical_descriptor_sha256);
  assert.equal(hook.overlay.programme_analysis_complete, true); assert.equal(hook.overlay.reviewed_page_count, 96); assert.equal(hook.overlay.source_unit_count, 642); assert.equal(hook.overlay.effect_atom_count, 2389); assert.equal(hook.overlay.genuine_fach_review_required_count, 0); assert.equal(hook.overlay.effect_credit_allowed, false);
  assert.equal(hook.apply_contract.shared_residual_mutation_performed_by_this_lane, false); assert.equal(hook.constraints.vercel_build_triggered, false);
  return { artifact_sha256: ARTIFACT_SHA256, reviewed_pages: 96, source_units: 642, effect_bearing_source_units: 580, non_effect_context_source_units: 62, multi_page_source_units: 52, multi_atom_source_units: 555, effect_atoms: 2389, explicit_fach_approved: 0, reviewed_not_assessable: 2389, genuine_fach_review_required: 0, unterminated_effect_atoms: 0, logical_descriptor_sha256: manifest.logical_descriptor_sha256, hook_descriptor_sha256: hook.descriptor_sha256, gate: 'PASS' };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(validateBerlinTierschutzparteiReviewBundle(loadBerlinTierschutzparteiReviewBundle())));
