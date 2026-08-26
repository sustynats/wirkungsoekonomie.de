#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BINDING_ORDER,
  PROGRAMME_BINDINGS,
  SOURCE_MATURITY_BLOCKER_ORDER,
  buildMvCombinedTerminalMatrix,
  canonicalJson,
  sha256,
} from './materialize-mv-combined-terminal-matrix.mjs';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MATRIX_PATH = path.join(
  APP_ROOT,
  'data/state-programmes/fach-content-residuals/mecklenburg-vorpommern-2026-v2.json',
);
const REGISTER_PATH = path.join(
  APP_ROOT,
  'data/state-programmes/current-source-registers/mecklenburg-vorpommern-2026-v2.json',
);
const SHA256_RE = /^[0-9a-f]{64}$/;
const FORBIDDEN_FACH_FIELDS = new Set([
  'impact_direction', 'evidence_level', 'materiality', 'uncertainty',
  'problem_review', 'goal_review', 'dns_mapping', 'sdg_mapping',
  'sdg_plus_mapping', 'recommendation', 'party_score', 'party_judgement',
]);

function visit(value, callback, pointer = '$') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => visit(item, callback, `${pointer}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    callback(key, item, `${pointer}.${key}`);
    visit(item, callback, `${pointer}.${key}`);
  }
}

function assertExactRegisterState(actual, registerParty) {
  assert.deepEqual(actual, {
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
  });
}

export function loadMvCombinedTerminalMatrix() {
  return JSON.parse(fs.readFileSync(MATRIX_PATH, 'utf8'));
}

export function validateMvCombinedTerminalMatrix(matrix, {
  verifyDescriptor = true,
  verifyInputs = true,
} = {}) {
  if (verifyDescriptor) {
    const unhashed = structuredClone(matrix);
    delete unhashed.descriptor_sha256;
    assert.equal(sha256(canonicalJson(unhashed)), matrix.descriptor_sha256, 'combined MV matrix descriptor mismatch');
  }

  assert.equal(matrix.schema_version, 'woek-mv-fach-content-residual-2.0');
  assert.equal(matrix.matrix_id, 'MV-FACH-CONTENT-RESIDUAL-2026-V2');
  assert.equal(matrix.jurisdiction, 'DE-MV');
  assert.equal(matrix.election, 'ltw-2026-mv');
  assert.equal(matrix.status, 'VERIFIED_FINAL_PROGRAMME_SUBCORPUS_TERMINAL_FULL_CORPUS_FAIL_CLOSED');
  assert.equal(matrix.combined_projection_rule, 'COUNT_AND_BIND_EXISTING_TERMINALS_ONLY_NO_NEW_FACH_SEMANTICS');
  assert.deepEqual(matrix.binding_order, BINDING_ORDER);
  assert.deepEqual(matrix.source_maturity_blocker_order, SOURCE_MATURITY_BLOCKER_ORDER);

  assert.equal(matrix.completion_scope.verified_final_programme_subcorpus_terminal, true);
  assert.equal(matrix.completion_scope.verified_final_programmes_terminal, 12);
  assert.equal(matrix.completion_scope.admitted_party_field_fully_source_mature, false);
  assert.equal(matrix.completion_scope.admitted_party_field_fully_fach_reviewed, false);
  assert.equal(matrix.completion_scope.source_maturity_blockers, 7);
  assert.equal(matrix.release_policy.no_new_vercel_build, true);
  assert.equal(matrix.release_policy.parliament_release_approval, 'NOT_GRANTED');
  assert.equal(matrix.release_policy.vercel_preview, false);
  assert.equal(matrix.release_policy.vercel_build, false);
  assert.equal(matrix.release_policy.vercel_deployment, false);
  assert.ok(Object.values(matrix.constraints).every((value) => value === false));

  visit(matrix, (key, _value, pointer) => {
    assert.ok(!FORBIDDEN_FACH_FIELDS.has(key), `${pointer}: combined matrix introduced forbidden Fach field ${key}`);
  });

  const register = JSON.parse(fs.readFileSync(REGISTER_PATH, 'utf8'));
  const registerByParty = new Map(register.parties.map((party) => [party.party, party]));
  assert.equal(register.coverage.classified_party_count, 19);
  assert.equal(register.coverage.final_election_programme_verified_count, 12);
  assert.equal(register.coverage.final_election_programme_not_verified_count, 7);
  assert.equal(register.coverage.full_final_election_programme_corpus_available, false);
  assert.equal(matrix.current_source_register.full_final_election_programme_corpus_available, false);
  assert.equal(matrix.current_source_register.classified_parties, 19);
  assert.equal(matrix.current_source_register.verified_final_programmes, 12);
  assert.equal(matrix.current_source_register.final_programmes_not_verified, 7);
  assert.match(matrix.current_source_register.file_sha256, SHA256_RE);
  assert.equal(matrix.current_source_register.descriptor_sha256, register.descriptor_sha256);

  assert.equal(matrix.programmes.length, 12);
  assert.equal(new Set(matrix.programmes.map((programme) => programme.party)).size, 12);
  assert.deepEqual(matrix.programmes.map((programme) => programme.party), BINDING_ORDER);
  assert.deepEqual(matrix.programmes.map((programme) => programme.source_register_party), PROGRAMME_BINDINGS.map((binding) => binding.registerParty));

  const totals = {
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
  };
  for (const [index, programme] of matrix.programmes.entries()) {
    const binding = PROGRAMME_BINDINGS[index];
    const registerParty = registerByParty.get(binding.registerParty);
    assert.equal(programme.binding_order, index + 1);
    assert.equal(programme.party, binding.party);
    assert.equal(programme.source_register_party, binding.registerParty);
    assert.equal(programme.programme_slug, binding.profile.slug);
    assert.equal(registerParty.final_election_programme_verified, true);
    assert.equal(programme.artifact.artifact_id, binding.profile.artifactId);
    assert.equal(programme.artifact.artifact_sha256, binding.profile.artifactSha256);
    assert.equal(programme.artifact.byte_length, binding.profile.artifactBytes);
    assert.equal(programme.artifact.page_count, binding.profile.pageCount);
    assert.equal(programme.artifact.source_status, registerParty.source_status);
    assert.equal(programme.artifact.final_election_programme_verified, true);
    assert.equal(programme.review_state, 'PROGRAMME_ANALYSIS_COMPLETE_UNDER_DELEGATED_PROTOCOL');
    assert.equal(programme.programme_analysis_complete, true);
    assert.equal(programme.programme_source_object_review_complete, true);
    assert.equal(programme.effect_credit_allowed, false);
    assert.equal(programme.counts.reviewed_pages, binding.profile.pageCount);
    assert.equal(programme.counts.unaccounted_pages, 0);
    assert.equal(programme.counts.source_units, programme.counts.effect_bearing_source_units + programme.counts.non_effect_context_source_units);
    assert.equal(programme.counts.terminal_source_objects, programme.counts.effect_atoms + programme.counts.non_effect_context_source_units);
    assert.equal(programme.counts.explicit_fach_approved, 0);
    assert.equal(programme.counts.reviewed_not_assessable_with_exact_reason, programme.counts.effect_atoms);
    assert.equal(programme.counts.non_effect_context_reviewed, programme.counts.non_effect_context_source_units);
    assert.equal(programme.counts.genuine_fach_review_required, 0);
    assert.equal(programme.counts.unclassified_source_units, 0);
    assert.equal(programme.counts.unterminated_effect_atoms, 0);
    assert.equal(programme.counts.source_conflicts_without_status, 0);
    for (const key of [
      'ledger_manifest_file_sha256', 'ledger_manifest_sha256', 'logical_descriptor_sha256',
      'source_unit_shard_set_sha256', 'effect_atom_shard_set_sha256',
      'coverage_hook_file_sha256', 'coverage_hook_descriptor_sha256',
    ]) assert.match(programme.coverage_evidence[key], SHA256_RE, `${programme.party}: invalid ${key}`);
    for (const key of Object.keys(totals)) totals[key] += programme.counts[key];
  }

  assert.equal(matrix.source_maturity_blockers.length, 7);
  assert.equal(new Set(matrix.source_maturity_blockers.map((blocker) => blocker.party)).size, 7);
  assert.deepEqual(matrix.source_maturity_blockers.map((blocker) => blocker.party), SOURCE_MATURITY_BLOCKER_ORDER);
  for (const [index, blocker] of matrix.source_maturity_blockers.entries()) {
    const registerParty = registerByParty.get(blocker.party);
    assert.equal(blocker.blocker_order, index + 1);
    assert.equal(registerParty.final_election_programme_verified, false);
    assert.equal(blocker.residual_class, 'SOURCE_MATURITY_BLOCKER');
    assert.equal(blocker.blocking_gate, 'FINAL_ELECTION_PROGRAMME_NOT_VERIFIED');
    assert.equal(blocker.required_transition, 'CURRENT_SOURCE_REGISTER_FINAL_ELECTION_PROGRAMME_VERIFIED_TRUE');
    assert.equal(blocker.fach_review_started, false);
    assert.equal(blocker.fach_semantics_inferred, false);
    assertExactRegisterState(blocker.exact_register_state, registerParty);
  }

  for (const [key, value] of Object.entries(totals)) assert.equal(matrix.summary[key], value, `summary ${key} mismatch`);
  assert.equal(matrix.summary.admitted_parties, 19);
  assert.equal(matrix.summary.source_classified_parties, 19);
  assert.equal(matrix.summary.verified_final_programmes, 12);
  assert.equal(matrix.summary.verified_final_programmes_terminal, 12);
  assert.equal(matrix.summary.verified_final_programmes_open, 0);
  assert.equal(matrix.summary.source_maturity_blockers, 7);
  assert.equal(matrix.summary.silent_omissions, 0);
  assert.equal(matrix.summary.verified_subcorpus_gate, 'PASS_12_OF_12_TERMINAL');
  assert.equal(matrix.summary.full_field_gate, 'FAIL_CLOSED_7_SOURCE_MATURITY_BLOCKERS');

  assert.deepEqual(totals, {
    reviewed_pages: 896,
    unaccounted_pages: 0,
    source_units: 8712,
    effect_bearing_source_units: 4811,
    non_effect_context_source_units: 3901,
    multi_atom_source_units: 1434,
    effect_atoms: 7494,
    terminal_source_objects: 11395,
    explicit_fach_approved: 0,
    reviewed_not_assessable_with_exact_reason: 7494,
    non_effect_context_reviewed: 3901,
    genuine_fach_review_required: 0,
    unclassified_source_units: 0,
    unterminated_effect_atoms: 0,
    source_conflicts_without_status: 0,
  });

  if (verifyInputs) {
    const expected = buildMvCombinedTerminalMatrix();
    assert.equal(canonicalJson(matrix), canonicalJson(expected), 'combined MV matrix is not the exact current manifest/shard/hook projection');
  }

  return {
    verified_programmes_terminal: matrix.summary.verified_final_programmes_terminal,
    source_maturity_blockers: matrix.summary.source_maturity_blockers,
    reviewed_pages: matrix.summary.reviewed_pages,
    source_units: matrix.summary.source_units,
    effect_atoms: matrix.summary.effect_atoms,
    terminal_source_objects: matrix.summary.terminal_source_objects,
    genuine_fach_review_required: matrix.summary.remaining_genuine_fach_review_required,
    descriptor_sha256: matrix.descriptor_sha256,
    verified_subcorpus_gate: matrix.summary.verified_subcorpus_gate,
    full_field_gate: matrix.summary.full_field_gate,
  };
}

function main() {
  process.stdout.write(`${JSON.stringify(validateMvCombinedTerminalMatrix(loadMvCombinedTerminalMatrix()), null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
