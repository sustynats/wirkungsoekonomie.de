#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BINDING_ORDER,
  buildBerlinCombinedTerminalMatrix,
  canonicalJson,
  sha256,
} from './materialize-berlin-combined-terminal-matrix.mjs';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MATRIX_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-content-residuals/berlin-2026-v2.json');
const REGISTER_PATH = path.join(APP_ROOT, 'data/state-programmes/current-source-registers/berlin-2026-v2.json');
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

export function loadBerlinCombinedTerminalMatrix() {
  return JSON.parse(fs.readFileSync(MATRIX_PATH, 'utf8'));
}

export function validateBerlinCombinedTerminalMatrix(matrix, {
  verifyDescriptor = true,
  verifyInputs = true,
} = {}) {
  if (verifyDescriptor) {
    const unhashed = structuredClone(matrix);
    delete unhashed.descriptor_sha256;
    assert.equal(sha256(canonicalJson(unhashed)), matrix.descriptor_sha256, 'combined matrix descriptor mismatch');
  }

  assert.equal(matrix.schema_version, 'woek-berlin-fach-content-residual-2.1');
  assert.equal(matrix.matrix_id, 'BE-FACH-CONTENT-RESIDUAL-2026-V2');
  assert.equal(matrix.status, 'BERLIN_FULL_PROGRAMME_REVIEW_TERMINAL_12_OF_12');
  assert.equal(matrix.combined_projection_rule, 'COUNT_AND_BIND_EXISTING_TERMINALS_ONLY_NO_NEW_FACH_SEMANTICS');
  assert.deepEqual(matrix.binding_order, BINDING_ORDER);
  assert.deepEqual(matrix.execution_order_remaining, []);
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
  const registerByParty = new Map(register.current_available_final_programme_set.map((item) => [item.party, item]));
  assert.equal(matrix.programmes.length, 12);
  assert.equal(new Set(matrix.programmes.map((programme) => programme.party)).size, 12);
  assert.deepEqual(matrix.programmes.map((programme) => programme.party), BINDING_ORDER);

  const totals = {
    terminal: 0,
    explicitApproved: 0,
    explicitReused: 0,
    reviewedNotAssessable: 0,
    context: 0,
    pdfPages: 0,
  };
  for (const [index, programme] of matrix.programmes.entries()) {
    assert.equal(programme.binding_order, index + 1);
    const registerItem = registerByParty.get(programme.party);
    assert.ok(registerItem, `${programme.party}: not in verified final source set`);
    assert.equal(programme.artifact_id, registerItem.artifact_id);
    assert.equal(programme.artifact_sha256, registerItem.sha256);
    assert.equal(programme.analysis_state, 'PROGRAMME_ANALYSIS_COMPLETE');
    assert.equal(programme.programme_analysis_complete, true);
    assert.equal(programme.genuine_fach_review_required, 0);
    assert.equal(programme.unaccounted_pages, 0);
    assert.equal(programme.unclassified_source_units, 0);
    assert.equal(programme.unterminated_effect_atoms, 0);
    assert.equal(programme.source_conflicts, 0);
    assert.equal(programme.coverage_manifest_pass, true);
    const statuses = programme.terminal_status_counts;
    for (const status of matrix.status_taxonomy) assert.equal(Number.isInteger(statuses[status]), true);
    const terminal = Object.values(statuses).reduce((sum, value) => sum + value, 0);
    assert.equal(programme.terminal_source_objects, terminal, `${programme.party}: terminal count mismatch`);
    assert.ok(programme.coverage_evidence?.type);
    totals.terminal += terminal;
    totals.explicitApproved += statuses.EXPLICIT_FACH_APPROVED;
    totals.explicitReused += statuses.EXPLICIT_FACH_REUSED;
    totals.reviewedNotAssessable += statuses.REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON;
    totals.context += statuses.NON_EFFECT_CONTEXT_REVIEWED;
    totals.pdfPages += programme.expected_pages ?? 0;
  }

  const summary = matrix.summary;
  assert.equal(summary.verified_final_programmes, 12);
  assert.equal(summary.programme_analysis_complete, 12);
  assert.equal(summary.programme_analysis_open, 0);
  assert.equal(summary.remaining_genuine_fach_review_required, 0);
  assert.equal(summary.remaining_page_review_envelopes, 0);
  assert.equal(summary.pdf_pages_reviewed, totals.pdfPages);
  assert.equal(summary.html_programme_scopes_reviewed, 1);
  assert.equal(summary.terminal_source_objects, totals.terminal);
  assert.equal(summary.terminal_explicit_fach_approved, totals.explicitApproved);
  assert.equal(summary.terminal_explicit_fach_reused, totals.explicitReused);
  assert.equal(summary.terminal_explicit_fach_approved_or_reused, totals.explicitApproved + totals.explicitReused);
  assert.equal(summary.terminal_reviewed_not_assessable, totals.reviewedNotAssessable);
  assert.equal(summary.terminal_non_effect_context, totals.context);
  assert.equal(summary.unaccounted_programmes, 0);
  assert.equal(summary.unaccounted_pages, 0);
  assert.equal(summary.unclassified_source_units, 0);
  assert.equal(summary.unterminated_effect_atoms, 0);
  assert.equal(summary.source_conflicts_without_status, 0);
  assert.equal(summary.silent_omissions, 0);
  assert.equal(summary.berlin_completion_gate, 'PASS_12_OF_12_TERMINAL');
  assert.equal(totals.terminal, 22334);
  assert.equal(totals.explicitApproved + totals.explicitReused, 78);
  assert.equal(totals.reviewedNotAssessable, 19629);
  assert.equal(totals.context, 2627);
  assert.equal(totals.pdfPages, 1293);

  if (verifyInputs) {
    const expected = buildBerlinCombinedTerminalMatrix();
    assert.equal(canonicalJson(matrix), canonicalJson(expected), 'combined matrix is not the exact current ledger/hook projection');
  }

  return {
    programmes_terminal: summary.programme_analysis_complete,
    programmes_open: summary.programme_analysis_open,
    pdf_pages_reviewed: summary.pdf_pages_reviewed,
    html_programme_scopes_reviewed: summary.html_programme_scopes_reviewed,
    terminal_source_objects: summary.terminal_source_objects,
    explicit_fach_approved_or_reused: summary.terminal_explicit_fach_approved_or_reused,
    reviewed_not_assessable: summary.terminal_reviewed_not_assessable,
    non_effect_context: summary.terminal_non_effect_context,
    genuine_fach_review_required: summary.remaining_genuine_fach_review_required,
    unaccounted_programmes: summary.unaccounted_programmes,
    unaccounted_pages: summary.unaccounted_pages,
    descriptor_sha256: matrix.descriptor_sha256,
    gate: 'PASS_12_OF_12_TERMINAL',
  };
}

function main() {
  process.stdout.write(`${JSON.stringify(validateBerlinCombinedTerminalMatrix(loadBerlinCombinedTerminalMatrix()), null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
