#!/usr/bin/env node

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUTPUT_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-content-residuals/berlin-2026-v2.json');
const REGISTER_PATH = path.join(APP_ROOT, 'data/state-programmes/current-source-registers/berlin-2026-v2.json');
const LEGACY_MATRIX_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-content-residuals/berlin-2026-v1.json');
const BSW_LEDGER_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-v1.json');
const CDU_LEDGER_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-cdu-v1.json');
const CDU_OVERLAY_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-content-residuals/berlin-2026-cdu-terminal-overlay-v1.json');

export const BINDING_ORDER = [
  'BSW',
  'SPD',
  'CDU',
  'FDP',
  'Volt',
  'Tierschutzpartei',
  'BÜNDNIS 90/DIE GRÜNEN',
  'AfD',
  'Die Linke',
  'DKP',
  'Die PARTEI',
  'SGP',
];

const MODERN_LEDGERS = [
  ['SPD', 'berlin-2026-spd-v1', 'canonical-flat'],
  ['FDP', 'berlin-2026-fdp-v1', 'canonical-flat'],
  ['Volt', 'berlin-2026-volt-v1', 'canonical-flat'],
  ['Tierschutzpartei', 'berlin-2026-tierschutzpartei-v1', 'plain-nested'],
  ['BÜNDNIS 90/DIE GRÜNEN', 'berlin-2026-gruene-v1', 'canonical-flat'],
  ['AfD', 'berlin-2026-afd-v1', 'canonical-flat'],
  ['Die Linke', 'berlin-2026-linke-v1', 'canonical-flat'],
];

const APPROVAL_BASIS = 'DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26';
const APPROVAL_AUTHORITY = 'PROJECT_OWNER_DELEGATED_PROTOCOL';
const REVIEW_MODE = 'SOURCE_BOUND_OBJECT_LEVEL';
const LEGACY_PARTIES = new Set(['DKP', 'Die PARTEI', 'SGP']);

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

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function fileSha256(filePath) {
  return sha256(fs.readFileSync(filePath));
}

function repoPath(filePath) {
  return `woek-parlament-app/${path.relative(APP_ROOT, filePath).replaceAll(path.sep, '/')}`;
}

function descriptorValid(payload, descriptorField, modes = ['canonical']) {
  const unhashed = structuredClone(payload);
  const expected = unhashed[descriptorField];
  delete unhashed[descriptorField];
  return modes.some((mode) => {
    const encoded = mode === 'plain' ? JSON.stringify(unhashed) : canonicalJson(unhashed);
    return sha256(encoded) === expected;
  });
}

function validateRegister() {
  const register = readJson(REGISTER_PATH);
  assert.ok(descriptorValid(register, 'descriptor_sha256'), 'Berlin v2 source-register descriptor mismatch');
  assert.equal(register.coverage.final_election_programme_verified_count, 12);
  assert.equal(register.current_available_final_programme_set.length, 12);
  const byParty = new Map();
  for (const item of register.current_available_final_programme_set) {
    const party = register.parties.find((candidate) => candidate.party === item.party);
    assert.ok(party?.canonical_artifact, `${item.party}: canonical source artifact missing`);
    assert.equal(party.canonical_artifact.artifact_id, item.artifact_id);
    assert.equal(party.canonical_artifact.sha256, item.sha256);
    byParty.set(item.party, party.canonical_artifact);
  }
  assert.deepEqual([...BINDING_ORDER].sort(), [...byParty.keys()].sort());
  return { register, byParty };
}

function validateArtifact(party, ledgerArtifact, registerArtifact) {
  const artifactId = ledgerArtifact.artifact_id;
  const artifactSha256 = ledgerArtifact.sha256 ?? ledgerArtifact.artifact_sha256;
  const pageCount = ledgerArtifact.page_count;
  assert.equal(artifactId, registerArtifact.artifact_id, `${party}: artifact id drift`);
  assert.equal(artifactSha256, registerArtifact.sha256, `${party}: artifact SHA drift`);
  assert.equal(pageCount, registerArtifact.page_count, `${party}: page count drift`);
}

function loadShards(manifestPath, manifest, refs, expectedType) {
  const records = [];
  for (const ref of refs) {
    const shardPath = path.join(path.dirname(manifestPath), ref.path);
    const bytes = fs.readFileSync(shardPath);
    assert.equal(bytes.length, ref.byte_length, `${ref.path}: byte length mismatch`);
    assert.equal(sha256(bytes), ref.file_sha256, `${ref.path}: file hash mismatch`);
    const shard = JSON.parse(bytes.toString('utf8'));
    assert.equal(shard.shard_type, expectedType);
    assert.equal(shard.records.length, ref.record_count);
    assert.ok(shard.records.every((record) => record.pdf_page >= ref.page_from && record.pdf_page <= ref.page_to));
    records.push(...shard.records);
  }
  return records;
}

function modernProgramme(party, slug, descriptorMode, registerArtifact) {
  const manifestPath = path.join(APP_ROOT, `data/state-programmes/fach-reviews/${slug}/manifest.json`);
  const hookPath = path.join(APP_ROOT, `data/state-programmes/fach-coverage-hooks/${slug}.json`);
  const manifest = readJson(manifestPath);
  const metadata = manifest.ledger_metadata;
  const coverage = metadata.coverage;
  assert.equal(manifest.format, 'SHARDED_JSON_LEDGER_V1');
  assert.ok(descriptorValid(manifest, 'manifest_sha256', descriptorMode === 'plain-nested' ? ['plain', 'canonical'] : ['canonical']));
  assert.equal(metadata.party, party);
  validateArtifact(party, metadata.artifact, registerArtifact);

  const sourceUnits = loadShards(manifestPath, manifest, manifest.source_unit_shards, 'SOURCE_UNITS');
  const effectAtoms = loadShards(manifestPath, manifest, manifest.effect_atom_shards, 'EFFECT_ATOMS');
  assert.equal(sourceUnits.length, coverage.source_unit_count);
  assert.equal(effectAtoms.length, coverage.effect_atom_count);
  const logical = descriptorMode === 'plain-nested'
    ? { metadata, source_units: sourceUnits, effect_atoms: effectAtoms }
    : { ...metadata, source_units: sourceUnits, effect_atoms: effectAtoms };
  const logicalEncoding = descriptorMode === 'plain-nested' ? JSON.stringify(logical) : canonicalJson(logical);
  assert.equal(sha256(logicalEncoding), manifest.logical_descriptor_sha256, `${party}: logical descriptor mismatch`);

  const unitById = new Map(sourceUnits.map((unit) => [unit.source_unit_id, unit]));
  assert.equal(unitById.size, sourceUnits.length, `${party}: duplicate source-unit id`);
  const atomIds = new Set();
  for (const atom of effectAtoms) {
    assert.ok(!atomIds.has(atom.atom_id), `${party}: duplicate atom id ${atom.atom_id}`);
    atomIds.add(atom.atom_id);
    assert.equal(atom.terminal_status, 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON');
    const unit = unitById.get(atom.source_unit_id);
    assert.ok(unit?.atom_ids.includes(atom.atom_id), `${party}: atom binding gap ${atom.atom_id}`);
  }
  const effectUnits = sourceUnits.filter((unit) => unit.effect_bearing);
  const contextUnits = sourceUnits.filter((unit) => !unit.effect_bearing);
  assert.equal(effectUnits.length, coverage.effect_bearing_source_unit_count);
  assert.equal(contextUnits.length, coverage.non_effect_context_source_unit_count);
  assert.ok(contextUnits.every((unit) => unit.terminal_status === 'NON_EFFECT_CONTEXT_REVIEWED'));
  assert.ok(effectUnits.every((unit) => unit.atom_ids.length > 0));
  assert.equal(coverage.explicit_fach_approved_count, 0);
  assert.equal(coverage.reviewed_not_assessable_count, effectAtoms.length);
  assert.equal(coverage.genuine_fach_review_required_count, 0);
  assert.equal(coverage.unaccounted_pages, 0);
  assert.equal(coverage.unterminated_effect_atoms, 0);
  assert.equal(coverage.programme_source_object_review_complete, true);

  const hook = readJson(hookPath);
  assert.ok(descriptorValid(hook, 'descriptor_sha256', descriptorMode === 'plain-nested' ? ['plain', 'canonical'] : ['canonical']));
  assert.equal(hook.target.party, party);
  assert.equal(hook.target.artifact_id, registerArtifact.artifact_id);
  assert.equal(hook.target.artifact_sha256, registerArtifact.sha256);
  assert.equal(hook.input.logical_descriptor_sha256, manifest.logical_descriptor_sha256);
  assert.equal(hook.overlay.source_unit_count, sourceUnits.length);
  assert.equal(hook.overlay.effect_atom_count, effectAtoms.length);
  assert.equal(hook.overlay.explicit_fach_approved_count, 0);
  assert.equal(hook.overlay.reviewed_not_assessable_count, effectAtoms.length);
  assert.equal(hook.overlay.effect_credit_allowed, false);
  assert.equal(hook.apply_contract.preserve_all_other_programmes, true);
  assert.equal(hook.apply_contract.shared_residual_mutation_performed_by_this_lane, false);

  return {
    party,
    artifact_id: registerArtifact.artifact_id,
    artifact_sha256: registerArtifact.sha256,
    media_type: registerArtifact.media_type,
    review_scope_type: 'PDF_PHYSICAL_PAGES',
    reviewed_scope: `PDF pages 1-${registerArtifact.page_count}`,
    expected_pages: registerArtifact.page_count,
    reviewed_pages: coverage.reviewed_page_count,
    unaccounted_pages: 0,
    source_unit_count: sourceUnits.length,
    effect_bearing_source_unit_count: effectUnits.length,
    effect_atom_count: effectAtoms.length,
    terminal_source_objects: contextUnits.length + effectAtoms.length,
    terminal_status_counts: {
      EXPLICIT_FACH_APPROVED: 0,
      EXPLICIT_FACH_REUSED: 0,
      REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: effectAtoms.length,
      NON_EFFECT_CONTEXT_REVIEWED: contextUnits.length,
    },
    genuine_fach_review_required: 0,
    unclassified_source_units: coverage.unclassified_source_units ?? 0,
    unterminated_effect_atoms: coverage.unterminated_effect_atoms,
    source_conflicts: coverage.source_conflicts_without_status ?? 0,
    analysis_state: 'PROGRAMME_ANALYSIS_COMPLETE',
    programme_analysis_complete: true,
    coverage_manifest_pass: true,
    coverage_evidence: {
      type: 'SHARDED_LEDGER_WITH_PROGRAMME_SCOPED_HOOK',
      ledger_manifest_path: repoPath(manifestPath),
      ledger_manifest_file_sha256: fileSha256(manifestPath),
      ledger_manifest_sha256: manifest.manifest_sha256,
      logical_descriptor_sha256: manifest.logical_descriptor_sha256,
      source_unit_shard_count: manifest.source_unit_shards.length,
      effect_atom_shard_count: manifest.effect_atom_shards.length,
      hook_path: repoPath(hookPath),
      hook_file_sha256: fileSha256(hookPath),
      hook_descriptor_sha256: hook.descriptor_sha256,
    },
  };
}

function bswProgramme(registerArtifact) {
  const ledger = readJson(BSW_LEDGER_PATH);
  const summary = ledger.programme_summary;
  assert.equal(ledger.party, 'BSW');
  validateArtifact('BSW', ledger.artifact, registerArtifact);
  assert.equal(ledger.all_physical_page_coverage.length, registerArtifact.page_count);
  assert.equal(ledger.source_units.length, summary.newly_segmented_source_units);
  assert.equal(ledger.effect_atoms.length, summary.newly_effect_bearing_atoms);
  assert.equal(ledger.source_units.filter((unit) => unit.effect_bearing).length, summary.newly_effect_bearing_source_units);
  assert.equal(ledger.source_units.filter((unit) => !unit.effect_bearing).length, summary.newly_non_effect_context_units);
  assert.ok(ledger.effect_atoms.every((atom) => atom.terminal_status === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'));
  assert.equal(summary.total_accounted_source_objects, summary.total_explicit_fach_approved + summary.total_reviewed_not_assessable_or_reclassified + summary.total_non_effect_context_or_non_counting_parent);
  assert.equal(summary.unaccounted_pages, 0);
  assert.equal(summary.unclassified_source_units, 0);
  assert.equal(summary.unterminated_effect_atoms, 0);
  assert.equal(summary.programme_analysis_complete, true);
  assert.ok(Object.values(ledger.constraints).every((value) => value === false));
  const protectedEffectAtoms = summary.total_explicit_fach_approved
    + (summary.total_reviewed_not_assessable_or_reclassified - summary.newly_reviewed_not_assessable);
  return {
    party: 'BSW',
    artifact_id: registerArtifact.artifact_id,
    artifact_sha256: registerArtifact.sha256,
    media_type: registerArtifact.media_type,
    review_scope_type: 'PDF_PHYSICAL_PAGES',
    reviewed_scope: 'PDF pages 1-66',
    expected_pages: 66,
    reviewed_pages: 66,
    unaccounted_pages: 0,
    source_unit_count: ledger.source_units.length,
    effect_bearing_source_unit_count: summary.newly_effect_bearing_source_units,
    effect_atom_count: ledger.effect_atoms.length + protectedEffectAtoms,
    terminal_source_objects: summary.total_accounted_source_objects,
    terminal_status_counts: {
      EXPLICIT_FACH_APPROVED: summary.total_explicit_fach_approved,
      EXPLICIT_FACH_REUSED: 0,
      REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: summary.total_reviewed_not_assessable_or_reclassified,
      NON_EFFECT_CONTEXT_REVIEWED: summary.total_non_effect_context_or_non_counting_parent,
    },
    genuine_fach_review_required: 0,
    unclassified_source_units: 0,
    unterminated_effect_atoms: 0,
    source_conflicts: 0,
    analysis_state: 'PROGRAMME_ANALYSIS_COMPLETE',
    programme_analysis_complete: true,
    coverage_manifest_pass: true,
    coverage_evidence: {
      type: 'FLAT_LEDGER_PLUS_IMMUTABLE_PROTECTED_TERMINAL_STOCK',
      ledger_path: repoPath(BSW_LEDGER_PATH),
      ledger_file_sha256: fileSha256(BSW_LEDGER_PATH),
      ledger_id: ledger.ledger_id,
      ledger_effect_atom_count: ledger.effect_atoms.length,
      protected_terminal_source_object_count: summary.protected_terminal_source_objects,
      protected_terminal_effect_atom_count: protectedEffectAtoms,
    },
  };
}

function cduProgramme(registerArtifact) {
  const ledger = readJson(CDU_LEDGER_PATH);
  const overlay = readJson(CDU_OVERLAY_PATH);
  const summary = ledger.programme_summary;
  assert.equal(ledger.party, 'CDU');
  validateArtifact('CDU', ledger.artifact, registerArtifact);
  assert.equal(ledger.all_physical_page_coverage.length, 128);
  assert.equal(ledger.page_coverage.length, 128);
  assert.equal(ledger.source_units.length, summary.total_source_units);
  assert.equal(ledger.effect_atoms.length, summary.effect_atoms);
  assert.equal(ledger.records.length, summary.non_effect_context_units + summary.effect_atoms);
  assert.equal(ledger.records.filter((record) => record.terminal_status === 'NON_EFFECT_CONTEXT_REVIEWED').length, summary.non_effect_context_units);
  assert.equal(ledger.records.filter((record) => record.terminal_status === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON').length, summary.reviewed_not_assessable);
  assert.equal(summary.unaccounted_pages, 0);
  assert.equal(summary.unclassified_source_units, 0);
  assert.equal(summary.unterminated_effect_atoms, 0);
  assert.equal(summary.programme_analysis_complete, true);
  assert.ok(Object.values(ledger.constraints).every((value) => value === false));
  assert.equal(overlay.party, 'CDU');
  assert.equal(overlay.source_pin.path, repoPath(CDU_LEDGER_PATH));
  assert.equal(overlay.source_pin.sha256, fileSha256(CDU_LEDGER_PATH));
  assert.equal(overlay.source_pin.ledger_id, ledger.ledger_id);
  assert.equal(overlay.replace_programme_record.effect_atoms, summary.effect_atoms);
  assert.equal(overlay.replace_programme_record.reviewed_not_assessable, summary.reviewed_not_assessable);
  assert.equal(overlay.replace_programme_record.genuine_fach_review_required, 0);
  assert.equal(overlay.replace_programme_record.programme_analysis_complete, true);
  return {
    party: 'CDU',
    artifact_id: registerArtifact.artifact_id,
    artifact_sha256: registerArtifact.sha256,
    media_type: registerArtifact.media_type,
    review_scope_type: 'PDF_PHYSICAL_PAGES',
    reviewed_scope: 'PDF pages 1-128',
    expected_pages: 128,
    reviewed_pages: 128,
    unaccounted_pages: 0,
    source_unit_count: summary.total_source_units,
    effect_bearing_source_unit_count: summary.effect_bearing_source_units,
    effect_atom_count: summary.effect_atoms,
    terminal_source_objects: ledger.records.length,
    terminal_status_counts: {
      EXPLICIT_FACH_APPROVED: 0,
      EXPLICIT_FACH_REUSED: 0,
      REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: summary.reviewed_not_assessable,
      NON_EFFECT_CONTEXT_REVIEWED: summary.non_effect_context_units,
    },
    genuine_fach_review_required: 0,
    unclassified_source_units: 0,
    unterminated_effect_atoms: 0,
    source_conflicts: 0,
    analysis_state: 'PROGRAMME_ANALYSIS_COMPLETE',
    programme_analysis_complete: true,
    coverage_manifest_pass: true,
    coverage_evidence: {
      type: 'FLAT_LEDGER_WITH_PROGRAMME_SCOPED_OVERLAY',
      ledger_path: repoPath(CDU_LEDGER_PATH),
      ledger_file_sha256: fileSha256(CDU_LEDGER_PATH),
      ledger_id: ledger.ledger_id,
      overlay_path: repoPath(CDU_OVERLAY_PATH),
      overlay_file_sha256: fileSha256(CDU_OVERLAY_PATH),
      overlay_id: overlay.overlay_id,
    },
  };
}

function legacyProgrammes(registerByParty) {
  const legacy = readJson(LEGACY_MATRIX_PATH);
  assert.ok(descriptorValid(legacy, 'descriptor_sha256'), 'Berlin v1 legacy matrix descriptor mismatch');
  const legacyFileSha256 = fileSha256(LEGACY_MATRIX_PATH);
  return BINDING_ORDER.filter((party) => LEGACY_PARTIES.has(party)).map((party) => {
    const source = legacy.programmes.find((programme) => programme.party === party);
    const registerArtifact = registerByParty.get(party);
    assert.ok(source?.programme_analysis_complete, `${party}: legacy terminal programme missing`);
    validateArtifact(party, source.artifact, registerArtifact);
    assert.deepEqual(source.genuine_residual_ranges, []);
    const statusCounts = {
      EXPLICIT_FACH_APPROVED: 0,
      EXPLICIT_FACH_REUSED: source.active_source_objects.filter((item) => item.status === 'EXPLICIT_FACH_REUSED').length,
      REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: source.active_source_objects.filter((item) => item.status === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON').length,
      NON_EFFECT_CONTEXT_REVIEWED: source.active_source_objects.filter((item) => item.status === 'NON_EFFECT_CONTEXT_REVIEWED').length,
    };
    assert.equal(Object.values(statusCounts).reduce((sum, value) => sum + value, 0), source.active_source_objects.length);
    return {
      party,
      artifact_id: registerArtifact.artifact_id,
      artifact_sha256: registerArtifact.sha256,
      media_type: registerArtifact.media_type,
      review_scope_type: registerArtifact.page_count === null ? 'HTML_NUMBERED_PROGRAMME_POINTS' : 'PDF_PHYSICAL_PAGES',
      reviewed_scope: source.coverage_proof.source_range,
      expected_pages: registerArtifact.page_count,
      reviewed_pages: registerArtifact.page_count,
      unaccounted_pages: 0,
      source_unit_count: null,
      effect_bearing_source_unit_count: null,
      effect_atom_count: source.active_source_objects.length,
      terminal_source_objects: source.active_source_objects.length,
      terminal_status_counts: statusCounts,
      genuine_fach_review_required: 0,
      unclassified_source_units: 0,
      unterminated_effect_atoms: 0,
      source_conflicts: 0,
      analysis_state: 'PROGRAMME_ANALYSIS_COMPLETE',
      programme_analysis_complete: true,
      coverage_manifest_pass: true,
      coverage_evidence: {
        type: 'IMMUTABLE_LEGACY_ISSUE_HANDOFF_PRESERVED_WITHOUT_REINTERPRETATION',
        legacy_matrix_path: repoPath(LEGACY_MATRIX_PATH),
        legacy_matrix_file_sha256: legacyFileSha256,
        legacy_matrix_descriptor_sha256: legacy.descriptor_sha256,
        source_range: source.coverage_proof.source_range,
        handoff: source.coverage_proof.primary_handoff ?? source.coverage_proof.atomic_handoff,
        terminal_confirmation: source.coverage_proof.terminal_confirmation ?? null,
      },
    };
  });
}

export function buildBerlinCombinedTerminalMatrix() {
  const { register, byParty } = validateRegister();
  const programmesByParty = new Map();
  programmesByParty.set('BSW', bswProgramme(byParty.get('BSW')));
  programmesByParty.set('CDU', cduProgramme(byParty.get('CDU')));
  for (const [party, slug, mode] of MODERN_LEDGERS) {
    programmesByParty.set(party, modernProgramme(party, slug, mode, byParty.get(party)));
  }
  for (const programme of legacyProgrammes(byParty)) programmesByParty.set(programme.party, programme);
  const programmes = BINDING_ORDER.map((party, index) => ({
    binding_order: index + 1,
    ...programmesByParty.get(party),
  }));
  assert.equal(programmes.length, 12);
  assert.ok(programmes.every(Boolean));

  const totals = programmes.reduce((result, programme) => {
    for (const [status, count] of Object.entries(programme.terminal_status_counts)) result[status] += count;
    result.terminal += programme.terminal_source_objects;
    result.pdfPages += programme.expected_pages ?? 0;
    return result;
  }, {
    EXPLICIT_FACH_APPROVED: 0,
    EXPLICIT_FACH_REUSED: 0,
    REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 0,
    NON_EFFECT_CONTEXT_REVIEWED: 0,
    terminal: 0,
    pdfPages: 0,
  });

  const matrix = {
    schema_version: 'woek-berlin-fach-content-residual-2.1',
    matrix_id: 'BE-FACH-CONTENT-RESIDUAL-2026-V2',
    jurisdiction: 'DE-BE',
    election: 'agh-2026-be',
    issue: 240,
    source_as_of: '2026-08-26T21:30:00+02:00',
    status: 'BERLIN_FULL_PROGRAMME_REVIEW_TERMINAL_12_OF_12',
    supersedes: {
      matrix_id: 'BE-FACH-CONTENT-RESIDUAL-2026-V1',
      path: repoPath(LEGACY_MATRIX_PATH),
      preservation_rule: 'V1 remains immutable evidence for DKP, Die PARTEI and SGP; V2 binds all twelve verified final-programme terminals without reinterpreting any Fach record.',
    },
    binding_order: BINDING_ORDER,
    status_taxonomy: [
      'EXPLICIT_FACH_APPROVED',
      'EXPLICIT_FACH_REUSED',
      'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
      'NON_EFFECT_CONTEXT_REVIEWED',
    ],
    approval_protocol: APPROVAL_BASIS,
    combined_projection_rule: 'COUNT_AND_BIND_EXISTING_TERMINALS_ONLY_NO_NEW_FACH_SEMANTICS',
    release_policy: {
      github_first: true,
      no_new_vercel_build: true,
      parliament_release_approval: 'NOT_GRANTED',
      vercel_preview: false,
      vercel_build: false,
      vercel_deployment: false,
    },
    constraints: {
      impact_direction_synthesized: false,
      evidence_level_synthesized: false,
      materiality_synthesized: false,
      problem_review_synthesized: false,
      goal_review_synthesized: false,
      dns_mapping_synthesized: false,
      sdg_mapping_synthesized: false,
      recommendation_synthesized: false,
      party_score_synthesized: false,
      party_wide_judgement_synthesized: false,
      existing_terminal_fach_rewritten: false,
    },
    canonical_source_register: {
      path: repoPath(REGISTER_PATH),
      file_sha256: fileSha256(REGISTER_PATH),
      descriptor_sha256: register.descriptor_sha256,
      verified_final_programmes: 12,
    },
    summary: {
      verified_final_programmes: 12,
      programme_analysis_complete: 12,
      programme_analysis_open: 0,
      remaining_genuine_fach_review_required: 0,
      remaining_page_review_envelopes: 0,
      pdf_pages_reviewed: totals.pdfPages,
      html_programme_scopes_reviewed: 1,
      terminal_source_objects: totals.terminal,
      terminal_explicit_fach_approved_or_reused: totals.EXPLICIT_FACH_APPROVED + totals.EXPLICIT_FACH_REUSED,
      terminal_explicit_fach_approved: totals.EXPLICIT_FACH_APPROVED,
      terminal_explicit_fach_reused: totals.EXPLICIT_FACH_REUSED,
      terminal_reviewed_not_assessable: totals.REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON,
      terminal_non_effect_context: totals.NON_EFFECT_CONTEXT_REVIEWED,
      unaccounted_programmes: 0,
      unaccounted_pages: 0,
      unclassified_source_units: 0,
      unterminated_effect_atoms: 0,
      source_conflicts_without_status: 0,
      silent_omissions: 0,
      berlin_completion_gate: 'PASS_12_OF_12_TERMINAL',
    },
    programmes,
    execution_order_remaining: [],
    hash_definition: 'SHA-256 of canonical JSON (UTF-8, sorted keys, compact separators) excluding descriptor_sha256',
  };
  matrix.descriptor_sha256 = sha256(canonicalJson(matrix));
  return matrix;
}

function main() {
  throw new Error(
    'Historical Berlin Combined-v2 materialization is disabled: it contains a rejected false 12/12 terminal claim. ' +
    'Use materialize-berlin-fach-truth-residual.mjs and berlin-2026-v3.json.',
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
