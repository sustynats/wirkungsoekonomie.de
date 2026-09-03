#!/usr/bin/env node

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RESIDUAL_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-content-residuals/berlin-2026-v3.json');
const LEDGER_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-v1.json');
const OUTPUT_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p34-p43-child-closure-v1.json');
const SNAPSHOTS = [
  [5459615745, 'P34-P35', 'data/state-programmes/fach-reviews/berlin-2026-bsw-p34-p35-child-closure-authoritative-handoff.md'],
  [5459622938, 'P36-P37', 'data/state-programmes/fach-reviews/berlin-2026-bsw-p36-p37-child-closure-authoritative-handoff.md'],
  [5459630827, 'P38-P39', 'data/state-programmes/fach-reviews/berlin-2026-bsw-p38-p39-child-closure-authoritative-handoff.md'],
  [5459634420, 'P40-P41', 'data/state-programmes/fach-reviews/berlin-2026-bsw-p40-p41-child-closure-authoritative-handoff.md'],
  [5459636289, 'P42-P43', 'data/state-programmes/fach-reviews/berlin-2026-bsw-p42-p43-child-closure-authoritative-handoff.md'],
];

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function parseSnapshot(commentId, scope, relativePath) {
  const filePath = path.join(APP_ROOT, relativePath);
  const markdown = fs.readFileSync(filePath, 'utf8');
  const starts = [...markdown.matchAll(/^\d+\.\s+`(BE-BSW-P(?:3[4-9]|4[0-3])-[^`]+)`/gm)];
  const decisions = starts.map((match, index) => {
    const block = markdown.slice(match.index, starts[index + 1]?.index ?? markdown.length);
    const state = block.match(/`terminal_fach_state = ([A-Z0-9_]+)`/)?.[1];
    assert.ok(state, `${match[1]}: terminal_fach_state missing in comment ${commentId}`);
    const explicitCount = block.match(/`counts_as_effect_object = (true|false)`/)?.[1];
    const active = state === 'EXPLICIT_FACH_APPROVED' || state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON';
    if (explicitCount) assert.equal(explicitCount === 'true', active, `${match[1]}: explicit counting role conflicts with terminal state`);
    return {
      object_id: match[1],
      authoritative_terminal_fach_state: state,
      counts_as_effect_object: active,
      issue_comment_id: commentId,
    };
  });
  return {
    snapshot: {
      scope,
      issue_comment_id: commentId,
      issue_comment_url: `https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-${commentId}`,
      path: `woek-parlament-app/${relativePath}`,
      file_sha256: sha256(markdown),
    },
    decisions,
  };
}

function canonicalState(state) {
  return state.startsWith('NON_EFFECT_') ? 'NON_EFFECT_CONTEXT_REVIEWED' : state;
}

function build() {
  const residual = JSON.parse(fs.readFileSync(RESIDUAL_PATH, 'utf8'));
  const ledger = JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf8'));
  const bsw = residual.programmes.find((item) => item.party === 'BSW');
  assert.ok(bsw, 'BSW residual missing');
  const openSource = bsw.remaining_review_objects.filter((item) => /-P(?:3[4-9]|4[0-3])-/.test(item.object_id));
  const closedCommentIds = new Set(SNAPSHOTS.map(([commentId]) => commentId));
  const closedSource = bsw.terminal_objects.filter((item) => (
    /-P(?:3[4-9]|4[0-3])-/.test(item.object_id)
    && closedCommentIds.has(Number(item.fach_handoff?.match(/issuecomment-(\d+)/)?.[1]))
  ));
  assert.ok(openSource.length === 61 || closedSource.length === 61, 'current or predecessor P34-P43 source set must contain 61 exact objects');
  const sourceObjects = openSource.length === 61 ? openSource : closedSource;

  const parsed = SNAPSHOTS.map((item) => parseSnapshot(...item));
  const allDecisions = parsed.flatMap((item) => item.decisions);
  const byId = new Map(allDecisions.map((item) => [item.object_id, item]));
  assert.equal(byId.size, allDecisions.length, 'authoritative child IDs must be unique');
  assert.equal(byId.size, 61, 'authoritative child handoff must contain exactly 61 objects');
  assert.deepEqual([...byId.keys()].sort(), sourceObjects.map((item) => item.object_id).sort(), 'authoritative and current exact child sets differ');

  const currentById = new Map(sourceObjects.map((item) => [item.object_id, item]));
  const childTerminalDecisions = allDecisions.map((decision) => {
    const source = currentById.get(decision.object_id);
    assert.ok(source, `${decision.object_id}: current exact-open source object missing`);
    assert.ok(
      source.fach_state === 'GENUINE_FACH_REVIEW_REQUIRED' || source.materialization_mode === 'LOSSLESS_EXPLICIT_HANDOFF_AFTER_DETERMINISTIC_SEGMENTATION',
      `${decision.object_id}: source object is neither fail-closed predecessor nor current authoritative closure`,
    );
    return {
      object_id: decision.object_id,
      authoritative_terminal_fach_state: decision.authoritative_terminal_fach_state,
      counts_as_effect_object: decision.counts_as_effect_object,
      decision_kind: source.child_role,
      issue_comment_id: decision.issue_comment_id,
    };
  });

  const statusCounts = {
    EXPLICIT_FACH_APPROVED: 0,
    REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 0,
    NON_EFFECT_CONTEXT_REVIEWED: 0,
    SOURCE_UNIT_RECLASSIFIED_VERSIONED: 0,
  };
  for (const decision of childTerminalDecisions) statusCounts[canonicalState(decision.authoritative_terminal_fach_state)] += 1;
  const pageCounts = Object.fromEntries(['P34-P35', 'P36-P37', 'P38-P39', 'P40-P41', 'P42-P43'].map((scope) => [scope, parsed.find((item) => item.snapshot.scope === scope).decisions.length]));
  assert.deepEqual(pageCounts, { 'P34-P35': 12, 'P36-P37': 7, 'P38-P39': 20, 'P40-P41': 18, 'P42-P43': 4 });

  return {
    schema_version: 'woek-explicit-fach-handoff-2.0',
    handoff_id: 'BE-BSW-P34-P43-CHILD-CLOSURE-2026-V1',
    base_main_commit: '5b3bddec9b62c4d21687df8ae8acb0e6e40a403b',
    artifact_id: ledger.artifact.artifact_id,
    artifact_sha256: ledger.artifact.artifact_sha256,
    artifact_byte_length: ledger.artifact.byte_length,
    artifact_page_count: ledger.artifact.page_count,
    controller: {
      issue: 241,
      issue_comment_id: 5459840094,
      issue_comment_url: 'https://github.com/sustynats/wirkungsoekonomie.de/issues/241#issuecomment-5459840094',
      materialization_order: 'CLOSE_EXACT_P34_P43_CHILD_SET_BEFORE_CONTINUING_P50_P66',
    },
    authoritative_markdowns: parsed.map((item) => item.snapshot),
    coverage: {
      source_exact_open_child_count: sourceObjects.length,
      closed_child_terminal_count: childTerminalDecisions.length,
      p34_p35_child_terminal_count: pageCounts['P34-P35'],
      p36_p37_child_terminal_count: pageCounts['P36-P37'],
      p38_p39_child_terminal_count: pageCounts['P38-P39'],
      p40_p41_child_terminal_count: pageCounts['P40-P41'],
      p42_p43_child_terminal_count: pageCounts['P42-P43'],
      active_terminal_review_leaf_count: childTerminalDecisions.filter((item) => item.counts_as_effect_object).length,
      active_explicit_fach_approved_count: statusCounts.EXPLICIT_FACH_APPROVED,
      active_reviewed_not_assessable_count: statusCounts.REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON,
      zero_count_guard_count: statusCounts.NON_EFFECT_CONTEXT_REVIEWED + statusCounts.SOURCE_UNIT_RECLASSIFIED_VERSIONED,
      exact_open_child_object_count_after: 0,
      terminal_status_counts: statusCounts,
      gate: 'BE_BSW_P34_P43_EXACT_CHILD_FACH_RESIDUAL_ZERO',
    },
    child_terminal_decisions: childTerminalDecisions,
    constraints: {
      impact_direction_synthesized: false,
      evidence_level_synthesized: false,
      dns_mapping_synthesized: false,
      recommendation_synthesized: false,
      score_synthesized: false,
      party_wide_judgement_synthesized: false,
      source_text_rewritten: false,
      parent_counting_reopened: false,
      vercel_action_triggered: false,
    },
  };
}

const payload = build();
const encoded = `${JSON.stringify(payload, null, 2)}\n`;
if (process.argv.includes('--check')) {
  assert.equal(fs.readFileSync(OUTPUT_PATH, 'utf8'), encoded, 'P34-P43 child-closure handoff is not deterministic/current');
} else {
  fs.writeFileSync(OUTPUT_PATH, encoded);
}
process.stdout.write(`${JSON.stringify({
  mode: process.argv.includes('--check') ? 'DETERMINISM_CHECK' : 'MATERIALIZE',
  handoff_id: payload.handoff_id,
  closed_child_terminal_count: payload.coverage.closed_child_terminal_count,
  terminal_status_counts: payload.coverage.terminal_status_counts,
  gate: payload.coverage.gate,
}, null, 2)}\n`);
