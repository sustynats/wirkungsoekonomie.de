#!/usr/bin/env node

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadMvReviewBundle, validateMvReviewBundle } from './check-mv-full-programme-review.mjs';
import { PROFILE as SPD_PROFILE } from './check-mv-spd-fach-review.mjs';
import { PROFILE as AFD_PROFILE } from './check-mv-afd-fach-review.mjs';
import { PROFILE as CDU_PROFILE } from './check-mv-cdu-fach-review.mjs';
import { PROFILE as LINKE_PROFILE } from './check-mv-linke-fach-review.mjs';
import { PROFILE as GRUENE_PROFILE } from './check-mv-gruene-fach-review.mjs';
import { PROFILE as FDP_PROFILE } from './check-mv-fdp-fach-review.mjs';
import { PROFILE as FREIE_WAEHLER_PROFILE } from './check-mv-freie-waehler-fach-review.mjs';
import { PROFILE as PIRATEN_PROFILE } from './check-mv-piraten-fach-review.mjs';
import { PROFILE as BUENDNIS_C_PROFILE } from './check-mv-buendnis-c-fach-review.mjs';
import { PROFILE as BSW_PROFILE } from './check-mv-bsw-fach-review.mjs';
import { PROFILE as PDF_PROFILE } from './check-mv-pdf-fach-review.mjs';
import { PROFILE as VOLT_PROFILE } from './check-mv-volt-fach-review.mjs';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUTPUT_PATH = path.join(
  APP_ROOT,
  'data/state-programmes/fach-content-residuals/mecklenburg-vorpommern-2026-v2.json',
);
const REGISTER_PATH = path.join(
  APP_ROOT,
  'data/state-programmes/current-source-registers/mecklenburg-vorpommern-2026-v2.json',
);

export const BINDING_ORDER = [
  'SPD',
  'AfD',
  'CDU',
  'Die Linke',
  'Bündnis 90/Die Grünen',
  'FDP',
  'FREIE WÄHLER',
  'PIRATEN',
  'Bündnis C',
  'BSW',
  'Partei des Fortschritts',
  'Volt',
];

export const SOURCE_MATURITY_BLOCKER_ORDER = [
  'Tierschutzpartei',
  'Die PARTEI',
  'ÖDP',
  'Handwerker Partei Deutschland',
  'KPD',
  'Team Freiheit',
  'WIR LEBEN DEMOKRATIE',
];

export const PROGRAMME_BINDINGS = [
  { party: 'SPD', registerParty: 'SPD', profile: SPD_PROFILE },
  { party: 'AfD', registerParty: 'AfD', profile: AFD_PROFILE },
  { party: 'CDU', registerParty: 'CDU', profile: CDU_PROFILE },
  { party: 'Die Linke', registerParty: 'Die Linke', profile: LINKE_PROFILE },
  { party: 'Bündnis 90/Die Grünen', registerParty: 'BÜNDNIS 90/DIE GRÜNEN', profile: GRUENE_PROFILE },
  { party: 'FDP', registerParty: 'FDP', profile: FDP_PROFILE },
  { party: 'FREIE WÄHLER', registerParty: 'FREIE WÄHLER', profile: FREIE_WAEHLER_PROFILE },
  { party: 'PIRATEN', registerParty: 'PIRATEN', profile: PIRATEN_PROFILE },
  { party: 'Bündnis C', registerParty: 'Bündnis C', profile: BUENDNIS_C_PROFILE },
  { party: 'BSW', registerParty: 'BSW', profile: BSW_PROFILE },
  { party: 'Partei des Fortschritts', registerParty: 'PdF', profile: PDF_PROFILE },
  { party: 'Volt', registerParty: 'Volt', profile: VOLT_PROFILE },
];

const APPROVAL_BASIS = 'DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26';

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

function descriptorValid(payload, descriptorField) {
  const unhashed = structuredClone(payload);
  const expected = unhashed[descriptorField];
  delete unhashed[descriptorField];
  return sha256(canonicalJson(unhashed)) === expected;
}

function validateRegister() {
  const register = readJson(REGISTER_PATH);
  assert.ok(descriptorValid(register, 'descriptor_sha256'), 'MV v2 source-register descriptor mismatch');
  assert.equal(register.coverage.classified_party_count, 19);
  assert.equal(register.coverage.final_election_programme_verified_count, 12);
  assert.equal(register.coverage.final_election_programme_not_verified_count, 7);
  assert.equal(register.coverage.full_final_election_programme_corpus_available, false);
  assert.equal(register.parties.length, 19);

  const registerByParty = new Map(register.parties.map((party) => [party.party, party]));
  assert.equal(registerByParty.size, 19, 'MV register party identifiers must be unique');
  assert.deepEqual(
    register.parties.filter((party) => !party.final_election_programme_verified).map((party) => party.party),
    SOURCE_MATURITY_BLOCKER_ORDER,
  );
  for (const binding of PROGRAMME_BINDINGS) {
    const party = registerByParty.get(binding.registerParty);
    assert.ok(party, `${binding.party}: register entry missing`);
    assert.equal(party.final_election_programme_verified, true, `${binding.party}: final programme not verified`);
    assert.equal(party.source_available_for_election_corpus, true, `${binding.party}: election source unavailable`);
  }
  return { register, registerByParty };
}

function programmeProjection(binding, bindingOrder, registerParty) {
  const bundle = loadMvReviewBundle(binding.profile);
  validateMvReviewBundle(bundle, binding.profile);
  const { manifest, hook, sourceUnits, effectAtoms } = bundle;
  const coverage = manifest.ledger_metadata.coverage;
  const ledgerDir = path.join(
    APP_ROOT,
    `data/state-programmes/fach-reviews/mecklenburg-vorpommern-2026-${binding.profile.slug}-v1`,
  );
  const manifestPath = path.join(ledgerDir, 'manifest.json');
  const hookPath = path.join(
    APP_ROOT,
    `data/state-programmes/fach-coverage-hooks/mecklenburg-vorpommern-2026-${binding.profile.slug}-v1.json`,
  );

  assert.equal(manifest.ledger_metadata.party, binding.registerParty);
  assert.equal(hook.target.party, binding.registerParty);
  assert.equal(manifest.ledger_metadata.artifact.artifact_id, hook.target.artifact_id);
  assert.equal(manifest.ledger_metadata.artifact.sha256, hook.target.artifact_sha256);
  assert.equal(manifest.ledger_metadata.source_register.party_source_status, registerParty.source_status);
  assert.equal(manifest.ledger_metadata.source_register.party_final_election_programme_verified, true);
  assert.equal(coverage.explicit_fach_approved_count, 0);
  assert.equal(coverage.reviewed_not_assessable_count, effectAtoms.length);
  assert.equal(coverage.non_effect_context_reviewed_count, sourceUnits.length - coverage.effect_bearing_source_unit_count);
  assert.equal(coverage.genuine_fach_review_required_count, 0);
  assert.equal(coverage.programme_source_object_review_complete, true);
  assert.equal(hook.overlay.programme_analysis_terminal_under_delegated_protocol, true);
  assert.equal(hook.overlay.effect_credit_allowed, false);

  const contextCount = coverage.non_effect_context_source_unit_count;
  return {
    binding_order: bindingOrder,
    party: binding.party,
    source_register_party: binding.registerParty,
    programme_slug: binding.profile.slug,
    artifact: {
      artifact_id: manifest.ledger_metadata.artifact.artifact_id,
      artifact_sha256: manifest.ledger_metadata.artifact.sha256,
      byte_length: manifest.ledger_metadata.artifact.byte_length,
      media_type: manifest.ledger_metadata.artifact.media_type,
      page_count: manifest.ledger_metadata.artifact.page_count,
      source_status: registerParty.source_status,
      final_election_programme_verified: true,
    },
    review_state: 'PROGRAMME_ANALYSIS_COMPLETE_UNDER_DELEGATED_PROTOCOL',
    programme_analysis_complete: true,
    programme_source_object_review_complete: true,
    public_projection_mode: 'FAIL_CLOSED_NO_EFFECT_CREDIT_WITHOUT_EXPLICIT_FACH_APPROVAL',
    effect_credit_allowed: false,
    counts: {
      reviewed_pages: coverage.reviewed_page_count,
      unaccounted_pages: coverage.unaccounted_pages,
      source_units: sourceUnits.length,
      effect_bearing_source_units: coverage.effect_bearing_source_unit_count,
      non_effect_context_source_units: contextCount,
      multi_atom_source_units: coverage.multi_atom_source_unit_count,
      effect_atoms: effectAtoms.length,
      terminal_source_objects: contextCount + effectAtoms.length,
      explicit_fach_approved: coverage.explicit_fach_approved_count,
      reviewed_not_assessable_with_exact_reason: coverage.reviewed_not_assessable_count,
      non_effect_context_reviewed: coverage.non_effect_context_reviewed_count,
      genuine_fach_review_required: coverage.genuine_fach_review_required_count,
      unclassified_source_units: coverage.unclassified_source_units,
      unterminated_effect_atoms: coverage.unterminated_effect_atoms,
      source_conflicts_without_status: coverage.source_conflicts_without_status,
    },
    coverage_evidence: {
      ledger_manifest_path: repoPath(manifestPath),
      ledger_manifest_file_sha256: fileSha256(manifestPath),
      ledger_manifest_sha256: manifest.manifest_sha256,
      logical_descriptor_sha256: manifest.logical_descriptor_sha256,
      source_unit_shard_count: manifest.source_unit_shards.length,
      source_unit_shard_set_sha256: sha256(canonicalJson(manifest.source_unit_shards)),
      effect_atom_shard_count: manifest.effect_atom_shards.length,
      effect_atom_shard_set_sha256: sha256(canonicalJson(manifest.effect_atom_shards)),
      coverage_hook_path: repoPath(hookPath),
      coverage_hook_file_sha256: fileSha256(hookPath),
      coverage_hook_descriptor_sha256: hook.descriptor_sha256,
    },
  };
}

function sourceMaturityBlocker(registerParty, blockerOrder) {
  assert.equal(registerParty.final_election_programme_verified, false);
  return {
    blocker_order: blockerOrder,
    party: registerParty.party,
    residual_class: 'SOURCE_MATURITY_BLOCKER',
    blocking_gate: 'FINAL_ELECTION_PROGRAMME_NOT_VERIFIED',
    exact_register_state: {
      artifact_class: registerParty.artifact_class,
      source_status: registerParty.source_status,
      assessment_maturity: registerParty.assessment_maturity,
      final_election_programme_verified: registerParty.final_election_programme_verified,
      source_available_for_election_corpus: registerParty.source_available_for_election_corpus,
      canonicalization_pending: registerParty.canonicalization_pending,
      public_status_label: registerParty.public_status_label,
      public_status_detail: registerParty.public_status_detail,
      source_urls: registerParty.source_urls,
      canonical_artifact: registerParty.canonical_artifact,
    },
    required_transition: 'CURRENT_SOURCE_REGISTER_FINAL_ELECTION_PROGRAMME_VERIFIED_TRUE',
    fach_review_started: false,
    fach_semantics_inferred: false,
  };
}

export function buildMvCombinedTerminalMatrix() {
  const { register, registerByParty } = validateRegister();
  assert.deepEqual(PROGRAMME_BINDINGS.map((binding) => binding.party), BINDING_ORDER);

  const programmes = PROGRAMME_BINDINGS.map((binding, index) => programmeProjection(
    binding,
    index + 1,
    registerByParty.get(binding.registerParty),
  ));
  const sourceMaturityBlockers = SOURCE_MATURITY_BLOCKER_ORDER.map((party, index) => sourceMaturityBlocker(
    registerByParty.get(party),
    index + 1,
  ));

  const totals = programmes.reduce((result, programme) => {
    for (const [key, value] of Object.entries(programme.counts)) result[key] += value;
    return result;
  }, {
    reviewed_pages: 0,
    unaccounted_pages: 0,
    source_units: 0,
    effect_bearing_source_units: 0,
    non_effect_context_source_units: 0,
    multi_atom_source_units: 0,
    effect_atoms: 0,
    terminal_source_objects: 0,
    explicit_fach_approved: 0,
    reviewed_not_assessable_with_exact_reason: 0,
    non_effect_context_reviewed: 0,
    genuine_fach_review_required: 0,
    unclassified_source_units: 0,
    unterminated_effect_atoms: 0,
    source_conflicts_without_status: 0,
  });

  const matrix = {
    schema_version: 'woek-mv-fach-content-residual-2.0',
    matrix_id: 'MV-FACH-CONTENT-RESIDUAL-2026-V2',
    jurisdiction: 'DE-MV',
    election: 'ltw-2026-mv',
    source_as_of: '2026-08-26',
    status: 'VERIFIED_FINAL_PROGRAMME_SUBCORPUS_TERMINAL_FULL_CORPUS_FAIL_CLOSED',
    binding_order: BINDING_ORDER,
    source_maturity_blocker_order: SOURCE_MATURITY_BLOCKER_ORDER,
    approval_protocol: APPROVAL_BASIS,
    combined_projection_rule: 'COUNT_AND_BIND_EXISTING_TERMINALS_ONLY_NO_NEW_FACH_SEMANTICS',
    completion_scope: {
      verified_final_programme_subcorpus_terminal: true,
      verified_final_programmes_terminal: 12,
      admitted_party_field_fully_source_mature: false,
      admitted_party_field_fully_fach_reviewed: false,
      source_maturity_blockers: 7,
    },
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
      unverified_source_promoted_to_final_programme: false,
    },
    current_source_register: {
      path: repoPath(REGISTER_PATH),
      file_sha256: fileSha256(REGISTER_PATH),
      descriptor_sha256: register.descriptor_sha256,
      classified_parties: register.coverage.classified_party_count,
      verified_final_programmes: register.coverage.final_election_programme_verified_count,
      final_programmes_not_verified: register.coverage.final_election_programme_not_verified_count,
      full_final_election_programme_corpus_available: register.coverage.full_final_election_programme_corpus_available,
    },
    summary: {
      admitted_parties: 19,
      source_classified_parties: 19,
      verified_final_programmes: 12,
      verified_final_programmes_terminal: 12,
      verified_final_programmes_open: 0,
      source_maturity_blockers: 7,
      remaining_genuine_fach_review_required: totals.genuine_fach_review_required,
      ...totals,
      silent_omissions: 0,
      verified_subcorpus_gate: 'PASS_12_OF_12_TERMINAL',
      full_field_gate: 'FAIL_CLOSED_7_SOURCE_MATURITY_BLOCKERS',
    },
    programmes,
    source_maturity_blockers: sourceMaturityBlockers,
    hash_definition: 'SHA-256 of canonical JSON (UTF-8, sorted keys, compact separators) excluding descriptor_sha256',
  };
  matrix.descriptor_sha256 = sha256(canonicalJson(matrix));
  return matrix;
}

function main() {
  const check = process.argv.includes('--check');
  const matrix = buildMvCombinedTerminalMatrix();
  const encoded = `${JSON.stringify(matrix, null, 2)}\n`;
  if (check) {
    assert.equal(fs.readFileSync(OUTPUT_PATH, 'utf8'), encoded, 'combined MV terminal matrix is not deterministic/current');
  } else {
    fs.writeFileSync(OUTPUT_PATH, encoded);
  }
  process.stdout.write(`${JSON.stringify({
    status: 'PASS',
    mode: check ? 'DETERMINISM_CHECK' : 'MATERIALIZE',
    verified_programmes_terminal: matrix.summary.verified_final_programmes_terminal,
    source_maturity_blockers: matrix.summary.source_maturity_blockers,
    reviewed_pages: matrix.summary.reviewed_pages,
    source_units: matrix.summary.source_units,
    effect_atoms: matrix.summary.effect_atoms,
    terminal_source_objects: matrix.summary.terminal_source_objects,
    descriptor_sha256: matrix.descriptor_sha256,
    gate: matrix.summary.full_field_gate,
  }, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
