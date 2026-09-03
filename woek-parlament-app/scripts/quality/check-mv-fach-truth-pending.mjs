#!/usr/bin/env node

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const REGISTER_PATH = path.join(APP_ROOT, 'data/state-programmes/current-source-registers/mecklenburg-vorpommern-2026-v2.json');
const REJECTED_MATRIX_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-content-residuals/mecklenburg-vorpommern-2026-v2.json');

function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortDeep(value[key])]));
}

function descriptor(payload) {
  const value = structuredClone(payload);
  delete value.descriptor_sha256;
  return crypto.createHash('sha256').update(JSON.stringify(sortDeep(value))).digest('hex');
}

export function loadMvFachTruthPending() {
  return {
    register: JSON.parse(fs.readFileSync(REGISTER_PATH, 'utf8')),
    rejectedMatrix: JSON.parse(fs.readFileSync(REJECTED_MATRIX_PATH, 'utf8')),
  };
}

export function validateMvFachTruthPending({ register, rejectedMatrix }) {
  assert.equal(register.descriptor_sha256, descriptor(register), 'MV source-register descriptor drift');
  assert.equal(rejectedMatrix.descriptor_sha256, descriptor(rejectedMatrix), 'MV rejected-matrix descriptor drift');
  assert.equal(register.status, 'CURRENT_SOURCE_CLASSIFICATION_COMPLETE_19_OF_19');
  assert.equal(register.coverage.final_election_programme_verified_count, 12);
  assert.equal(register.coverage.final_election_programme_not_verified_count, 7);
  assert.equal(register.coverage.canonical_current_source_finality_open_count, 1);
  assert.equal(register.coverage.full_final_election_programme_corpus_available, false);

  assert.equal(rejectedMatrix.matrix_id, 'MV-FACH-CONTENT-RESIDUAL-2026-V2');
  assert.equal(rejectedMatrix.summary.verified_final_programmes_terminal, 12);
  assert.equal(rejectedMatrix.summary.reviewed_not_assessable_with_exact_reason, 7494);
  assert.equal(rejectedMatrix.summary.verified_subcorpus_gate, 'PASS_12_OF_12_TERMINAL');
  assert.ok(Object.values(rejectedMatrix.constraints).every((value) => value === false));

  return {
    source_classified_parties: 19,
    verified_final_programmes: 12,
    verified_final_programmes_currently_proven_fach_terminal: 0,
    verified_final_programmes_requiring_truthful_residual: 12,
    source_maturity_pending: 7,
    exact_remaining_effect_object_count: null,
    rejected_matrix_id: rejectedMatrix.matrix_id,
    rejected_matrix_disposition: 'REJECTED_FALSE_TERMINAL_HISTORICAL_EVIDENCE_ONLY',
    rejected_generic_rnaa_count: 7494,
    gate: 'FAIL_CLOSED_MV_FACH_TRUTH_REMEDIATION_REQUIRED_AFTER_BERLIN',
  };
}

function main() {
  process.stdout.write(`${JSON.stringify(validateMvFachTruthPending(loadMvFachTruthPending()), null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
