#!/usr/bin/env node

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUTPUT_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-content-residuals/berlin-2026-v3.json');
const SOURCE_REGISTER_PATH = path.join(APP_ROOT, 'data/state-programmes/current-source-registers/berlin-2026-v2.json');
const ACCEPTED_V1_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-content-residuals/berlin-2026-v1.json');
const REJECTED_V2_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-content-residuals/berlin-2026-v2.json');
const BSW_LEDGER_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-v1.json');
const BSW_P14_HANDOFF_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p14-explicit-v1.json');

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

export const TERMINAL_PROGRAMMES = ['DKP', 'Die PARTEI', 'SGP'];
export const OPEN_PROGRAMMES = [
  'AfD',
  'BÜNDNIS 90/DIE GRÜNEN',
  'BSW',
  'FDP',
  'Tierschutzpartei',
  'Volt',
  'SPD',
  'CDU',
  'Die Linke',
];

const BSW_P01_P05_META = {
  'BE-BSW-P01-CONTEXT': { fach_status: 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', counting_role: 'NON_COUNTING_PROGRAMME_CONTEXT' },
  'BE-BSW-P02P03-SEVEN-DEMANDS': { fach_status: 'SOURCE_UNIT_RECLASSIFIED_VERSIONED', counting_role: 'PROGRAMME_SUMMARY_RESTATEMENT_NON_COUNTING_PARENT' },
  'BE-BSW-FRIEDEN-001': { fach_status: 'EXPLICIT_FACH_APPROVED', impact_direction: 'POSITIVE', evidence_level: 'LOW' },
  'BE-BSW-FRIEDEN-002': { fach_status: 'EXPLICIT_FACH_APPROVED', impact_direction: 'AMBIVALENT', evidence_level: 'LOW' },
  'BE-BSW-FRIEDEN-003': { fach_status: 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', impact_direction: 'OPEN', evidence_level: 'NOT_ASSESSABLE' },
  'BE-BSW-FRIEDEN-004': { fach_status: 'EXPLICIT_FACH_APPROVED', impact_direction: 'POSITIVE', evidence_level: 'LOW' },
  'BE-BSW-FRIEDEN-005': { fach_status: 'EXPLICIT_FACH_APPROVED', impact_direction: 'AMBIVALENT', evidence_level: 'MEDIUM' },
  'BE-BSW-FRIEDEN-006': { fach_status: 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', impact_direction: 'OPEN', evidence_level: 'NOT_ASSESSABLE' },
  'BE-BSW-FRIEDEN-007': { fach_status: 'EXPLICIT_FACH_APPROVED', impact_direction: 'AMBIVALENT', evidence_level: 'LOW' },
  'BE-BSW-FRIEDEN-008': { fach_status: 'EXPLICIT_FACH_APPROVED', impact_direction: 'POSITIVE', evidence_level: 'LOW' },
  'BE-BSW-FRIEDEN-009': { fach_status: 'EXPLICIT_FACH_APPROVED', impact_direction: 'AMBIVALENT', evidence_level: 'LOW' },
  'BE-BSW-FRIEDEN-010': { fach_status: 'EXPLICIT_FACH_APPROVED', impact_direction: 'POSITIVE', evidence_level: 'LOW' },
  'BE-BSW-FRIEDEN-011': { fach_status: 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', impact_direction: 'OPEN', evidence_level: 'NOT_ASSESSABLE' },
};

const BSW_HOUSING_NEW_TERMINALS = {
  'BE-BSW-WOHN-003': { fach_status: 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', impact_direction: 'OPEN', evidence_level: 'NOT_ASSESSABLE' },
  'BE-BSW-WOHN-004': { fach_status: 'EXPLICIT_FACH_APPROVED', impact_direction: 'POSITIVE', evidence_level: 'LOW' },
  'BE-BSW-WOHN-014': { fach_status: 'EXPLICIT_FACH_APPROVED', impact_direction: 'AMBIVALENT', evidence_level: 'MEDIUM' },
  'BE-BSW-WOHN-015': { fach_status: 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', impact_direction: 'OPEN', evidence_level: 'NOT_ASSESSABLE' },
  'BE-BSW-WOHN-016': { fach_status: 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', impact_direction: 'OPEN', evidence_level: 'NOT_ASSESSABLE' },
  'BE-BSW-WOHN-018': { fach_status: 'EXPLICIT_FACH_APPROVED', impact_direction: 'AMBIVALENT', evidence_level: 'MEDIUM' },
  'BE-BSW-WOHN-020': { fach_status: 'EXPLICIT_FACH_APPROVED', impact_direction: 'AMBIVALENT', evidence_level: 'MEDIUM' },
  'BE-BSW-WOHN-022': { fach_status: 'EXPLICIT_FACH_APPROVED', impact_direction: 'AMBIVALENT', evidence_level: 'LOW' },
  'BE-BSW-WOHN-023': { fach_status: 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', impact_direction: 'OPEN', evidence_level: 'NOT_ASSESSABLE' },
};

const BSW_P09_P13_META = [
  ['Cooperatives: land access, funding and project development support', 'EXPLICIT_FACH_APPROVED', 'POSITIVE', 'LOW'],
  ['Preferential public land / 99-year leasehold for cooperatives', 'EXPLICIT_FACH_APPROVED', 'AMBIVALENT', 'LOW'],
  ['Higher non-profit/cooperative share in Land/state-company housing projects', 'EXPLICIT_FACH_APPROVED', 'POSITIVE', 'LOW'],
  ['Strengthen collective bargaining / simplify extension of collective agreements', 'EXPLICIT_FACH_APPROVED', 'AMBIVALENT', 'MEDIUM'],
  ['End precarious work under Land responsibility / restore full public-service tariff application', 'EXPLICIT_FACH_APPROVED', 'POSITIVE', 'MEDIUM'],
  ['Support unions / works and staff councils', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'OPEN', 'NOT_ASSESSABLE'],
  ['Equal pay for equal work at the same employer', 'EXPLICIT_FACH_APPROVED', 'POSITIVE', 'MEDIUM'],
  ['Abolish objective-reason-free fixed-term contracts in the public sector', 'EXPLICIT_FACH_APPROVED', 'AMBIVALENT', 'MEDIUM'],
  ['Reverse spin-offs/new formations and reintegrate cleaning/logistics', 'EXPLICIT_FACH_APPROVED', 'AMBIVALENT', 'LOW'],
  ['Further declarations of general applicability / federal facilitation', 'SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'OPEN', 'NOT_ASSESSABLE'],
  ['Additional counselling points for family benefits and multi-channel application support', 'EXPLICIT_FACH_APPROVED', 'POSITIVE', 'MEDIUM'],
  ['Protect social-service capacity / material, legal and psychosocial help', 'SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'OPEN', 'NOT_ASSESSABLE'],
  ['Early rent-loss prevention / Housing First / emergency accommodation / support', 'SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'OPEN', 'NOT_ASSESSABLE'],
  ['Housing First as sustained citywide standard measure', 'EXPLICIT_FACH_APPROVED', 'POSITIVE', 'MEDIUM'],
  ['Vacancy/misuse/rent-gouging enforcement plus broader allocation rights', 'SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'OPEN', 'NOT_ASSESSABLE'],
  ['Expand drug prevention and harm-reduction/treatment access', 'EXPLICIT_FACH_APPROVED', 'POSITIVE', 'MEDIUM'],
  ['Specialist accommodation for people with addiction who are homeless', 'EXPLICIT_FACH_APPROVED', 'POSITIVE', 'LOW'],
  ['Independent monitoring/control body for youth offices', 'EXPLICIT_FACH_APPROVED', 'AMBIVALENT', 'LOW'],
  ['Long-term district centres / neighbourhood projects / anti-loneliness measures', 'EXPLICIT_FACH_APPROVED', 'POSITIVE', 'LOW'],
  ['Connect Kitas, primary schools and senior facilities', 'EXPLICIT_FACH_APPROVED', 'POSITIVE', 'LOW'],
];

export function sortDeep(value) {
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

function descriptorValid(payload) {
  const unhashed = structuredClone(payload);
  const expected = unhashed.descriptor_sha256;
  delete unhashed.descriptor_sha256;
  return sha256(canonicalJson(unhashed)) === expected;
}

function normalizedLegacyTerminal(item) {
  const fachStatus = item.status === 'EXPLICIT_FACH_REUSED'
    ? 'EXPLICIT_FACH_APPROVED'
    : item.status;
  return {
    object_id: item.object_id,
    object_kind: item.object_kind,
    source_locator: item.source_locator,
    source_state: 'SOURCE_BOUND_VERIFIED',
    segmentation_state: 'OBJECT_BOUNDARY_VERIFIED',
    fach_state: fachStatus,
    materialization_mode: item.status === 'EXPLICIT_FACH_REUSED' ? 'LOSSLESS_EXPLICIT_FACH_REUSE' : 'LOSSLESS_TERMINAL_REUSE',
    fach_handoff: item.verbatim_fach_source ?? null,
    fach_handoff_locator: item.verbatim_fach_locator ?? null,
  };
}

function bswProtectedTerminals(legacyBsw, bswLedger) {
  const stock = new Map(bswLedger.protected_terminal_stock.map((item) => [item.source_range, item]));
  const p01p05 = stock.get('PDF pages 1-5');
  const p09p13 = stock.get('PDF pages 9-13');
  assert.ok(p01p05 && p09p13, 'BSW protected terminal ranges missing');

  const first = p01p05.accepted_terminal_records.map((item) => {
    const exact = BSW_P01_P05_META[item.record_id];
    assert.ok(exact, `${item.record_id}: exact BSW P01-P05 status missing`);
    return {
      object_id: item.record_id,
      object_kind: exact.fach_status === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED' || exact.fach_status === 'NON_EFFECT_CONTEXT_REVIEWED'
        ? 'SOURCE_CONTEXT_OR_RESTATEMENT_OBJECT'
        : 'SOURCE_BOUND_FACH_OBJECT',
      source_locator: 'physical PDF pages 1-5; exact section/object boundary in issue #240 comment 5411235844',
      source_state: 'SOURCE_BOUND_VERIFIED',
      segmentation_state: 'OBJECT_BOUNDARY_VERIFIED',
      fach_state: exact.fach_status,
      ...(exact.counting_role ? { counting_role: exact.counting_role } : {}),
      ...(exact.impact_direction ? { impact_direction: exact.impact_direction } : {}),
      ...(exact.evidence_level ? { evidence_level: exact.evidence_level } : {}),
      materialization_mode: 'LOSSLESS_EXPLICIT_HANDOFF',
      fach_handoff: p01p05.issue_comment_url,
    };
  });

  const housing = legacyBsw.active_source_objects
    .filter((item) => item.object_id.startsWith('BE-BSW-WOHN-'))
    .map((item) => {
      const newer = BSW_HOUSING_NEW_TERMINALS[item.object_id];
      if (newer) {
        return {
          object_id: item.object_id,
          object_kind: 'SOURCE_BOUND_FACH_OBJECT',
          source_locator: item.source_locator,
          source_state: 'SOURCE_BOUND_VERIFIED',
          segmentation_state: 'OBJECT_BOUNDARY_VERIFIED',
          fach_state: newer.fach_status,
          impact_direction: newer.impact_direction,
          evidence_level: newer.evidence_level,
          materialization_mode: 'LOSSLESS_EXPLICIT_HANDOFF',
          fach_handoff: 'https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5399016908',
        };
      }
      assert.equal(item.status, 'EXPLICIT_FACH_REUSED', `${item.object_id}: unexpected pre-existing housing status`);
      return {
        ...normalizedLegacyTerminal(item),
        object_kind: 'SOURCE_BOUND_FACH_OBJECT',
        fach_handoff: item.verbatim_fach_source,
      };
    });

  const later = BSW_P09_P13_META.map(([sourceAnchor, fachStatus, impactDirection, evidenceLevel], index) => ({
    object_id: `BE-BSW-P09P13-HANDOFF-${String(index + 1).padStart(2, '0')}`,
    object_kind: fachStatus === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'
      ? 'SOURCE_RESTATEMENT_PARENT_NON_COUNTING'
      : 'SOURCE_BOUND_FACH_OBJECT',
    source_locator: 'physical PDF pages 9-13',
    source_anchor: sourceAnchor,
    source_state: 'SOURCE_BOUND_VERIFIED',
    segmentation_state: 'OBJECT_BOUNDARY_VERIFIED',
    fach_state: fachStatus,
    impact_direction: impactDirection,
    evidence_level: evidenceLevel,
    materialization_mode: 'LOSSLESS_EXPLICIT_HANDOFF',
    fach_handoff: p09p13.issue_comment_url,
  }));

  const result = [...first, ...housing, ...later];
  assert.equal(result.length, 56, 'BSW protected terminal count drift');
  assert.equal(new Set(result.map((item) => item.object_id)).size, result.length, 'BSW protected terminal IDs must be unique');
  return result;
}

function bswPage14Terminals(bswLedger, handoff) {
  assert.equal(handoff.handoff_id, 'BE-BSW-P14-EXPLICIT-FACH-2026-V1');
  assert.equal(handoff.issue_comment_id, 5449003550);
  assert.equal(handoff.artifact_id, bswLedger.artifact.artifact_id);
  assert.equal(handoff.artifact_sha256, bswLedger.artifact.artifact_sha256);
  assert.deepEqual(handoff.physical_pdf_pages, [14]);
  assert.equal(handoff.records.length, 23);
  assert.deepEqual(handoff.accounting, {
    source_atoms: 23,
    EXPLICIT_FACH_APPROVED: 9,
    REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 2,
    NON_EFFECT_CONTEXT_OR_GOAL_REVIEWED: 12,
    OPEN: 0,
    gate: 'BE_BSW_P14_FACH_COMPLETE_PASS_SOURCE_BOUND_EXPLICIT_REVIEW',
  });
  assert.ok(Object.values(handoff.constraints).every((value) => value === false));

  const sourceById = new Map(bswLedger.effect_atoms
    .filter((item) => item.pdf_page === 14)
    .map((item) => [item.atom_id, item]));
  assert.equal(sourceById.size, 23, 'BSW page-14 source atom count drift');

  return handoff.records.map((decision) => {
    const source = sourceById.get(decision.object_id);
    assert.ok(source, `${decision.object_id}: exact page-14 source atom missing`);
    const { object_id: objectId, fach_status: handoffFachStatus, ...approvedFach } = decision;
    const fachState = handoffFachStatus === 'NON_EFFECT_CONTEXT_OR_GOAL_REVIEWED'
      ? 'NON_EFFECT_CONTEXT_REVIEWED'
      : handoffFachStatus;
    return {
      object_id: objectId,
      object_kind: fachState === 'NON_EFFECT_CONTEXT_REVIEWED'
        ? 'SOURCE_CONTEXT_GOAL_OR_RATIONALE_OBJECT'
        : 'SOURCE_BOUND_FACH_OBJECT',
      source_locator: source.source_locator,
      source_excerpt: source.source_excerpt,
      source_text_sha256: source.atom_text_sha256,
      source_state: 'SOURCE_BOUND_VERIFIED',
      segmentation_state: 'OBJECT_BOUNDARY_VERIFIED',
      fach_state: fachState,
      handoff_fach_status: handoffFachStatus,
      materialization_mode: 'LOSSLESS_EXPLICIT_HANDOFF',
      fach_handoff: handoff.issue_comment_url,
      fach_handoff_locator: `issue #240 comment ${handoff.issue_comment_id}, record ${objectId}`,
      ...approvedFach,
    };
  });
}

function reviewEnvelope(item) {
  return {
    object_id: item.object_id,
    object_kind: 'PHYSICAL_PDF_PAGE_REVIEW_ENVELOPE',
    source_locator: item.source_locator,
    source_state: 'FINAL_SOURCE_ARTIFACT_VERIFIED',
    segmentation_state: 'SEGMENTATION_REVIEW_REQUIRED',
    fach_state: 'GENUINE_FACH_REVIEW_REQUIRED',
    effect_bearing_status: 'NOT_YET_CLASSIFIED',
    counts_as_effect_object: false,
    exact_reason: item.exact_reason,
  };
}

function statusCounts(objects) {
  const counts = {
    EXPLICIT_FACH_APPROVED: 0,
    REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 0,
    NON_EFFECT_CONTEXT_REVIEWED: 0,
    SOURCE_UNIT_RECLASSIFIED_VERSIONED: 0,
  };
  for (const item of objects) counts[item.fach_state] += 1;
  return counts;
}

export function buildBerlinFachTruthResidual() {
  const register = readJson(SOURCE_REGISTER_PATH);
  const acceptedV1 = readJson(ACCEPTED_V1_PATH);
  const rejectedV2 = readJson(REJECTED_V2_PATH);
  const bswLedger = readJson(BSW_LEDGER_PATH);
  const bswP14Handoff = readJson(BSW_P14_HANDOFF_PATH);
  assert.ok(descriptorValid(register), 'Berlin source-register descriptor mismatch');
  assert.ok(descriptorValid(acceptedV1), 'accepted Berlin v1 descriptor mismatch');
  assert.equal(acceptedV1.coverage_summary.programme_analysis_complete, 3);
  assert.equal(rejectedV2.summary.programme_analysis_complete, 12);

  const registerByParty = new Map(register.current_available_final_programme_set.map((item) => [item.party, item]));
  const legacyByParty = new Map(acceptedV1.programmes.map((item) => [item.party, item]));
  const programmes = BINDING_ORDER.map((party, index) => {
    const source = legacyByParty.get(party);
    const registered = registerByParty.get(party);
    assert.ok(source && registered, `${party}: source register or accepted residual entry missing`);
    assert.equal(source.artifact.artifact_id, registered.artifact_id, `${party}: artifact id drift`);
    assert.equal(source.artifact.sha256, registered.sha256, `${party}: artifact SHA drift`);

    const terminalObjects = party === 'BSW'
      ? [...bswProtectedTerminals(source, bswLedger), ...bswPage14Terminals(bswLedger, bswP14Handoff)]
      : source.active_source_objects
        .filter((item) => item.status !== 'GENUINE_FACH_REVIEW_REQUIRED')
        .map(normalizedLegacyTerminal);
    const remaining = party === 'BSW'
      ? source.active_source_objects.filter((item) => {
        if (item.object_kind !== 'UNSEGMENTED_PDF_PAGE_REVIEW_SCOPE') return false;
        const page = Number(item.source_locator.match(/PDF page (\d+)/)?.[1]);
        return page >= 15 && page <= 66;
      })
      : source.active_source_objects.filter((item) => item.status === 'GENUINE_FACH_REVIEW_REQUIRED');
    const reviewEnvelopes = remaining.map(reviewEnvelope);
    const isComplete = TERMINAL_PROGRAMMES.includes(party);

    return {
      binding_order: index + 1,
      party,
      artifact_id: registered.artifact_id,
      artifact_sha256: registered.sha256,
      artifact_page_count: registered.page_count,
      source_state: 'FINAL_SOURCE_ARTIFACT_VERIFIED',
      segmentation_state: isComplete
        ? 'SOURCE_OBJECT_BOUNDARIES_TERMINAL'
        : terminalObjects.length > 0
          ? 'PARTIAL_TERMINAL_WITH_REVIEW_ENVELOPES_OPEN'
          : 'SEGMENTATION_REVIEW_REQUIRED',
      fach_state: isComplete ? 'PROGRAMME_ANALYSIS_COMPLETE' : 'GENUINE_FACH_REVIEW_REQUIRED',
      programme_analysis_complete: isComplete,
      terminal_object_count: terminalObjects.length,
      terminal_status_counts: statusCounts(terminalObjects),
      remaining_review_envelope_count: reviewEnvelopes.length,
      terminal_objects: terminalObjects,
      remaining_review_envelopes: reviewEnvelopes,
    };
  });

  const terminalCounts = programmes.reduce((totals, programme) => {
    for (const [status, count] of Object.entries(programme.terminal_status_counts)) totals[status] += count;
    return totals;
  }, {
    EXPLICIT_FACH_APPROVED: 0,
    REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 0,
    NON_EFFECT_CONTEXT_REVIEWED: 0,
    SOURCE_UNIT_RECLASSIFIED_VERSIONED: 0,
  });
  const remainingReviewEnvelopes = programmes.reduce((sum, programme) => sum + programme.remaining_review_envelope_count, 0);

  const matrix = {
    schema_version: 'woek-berlin-fach-content-residual-3.0',
    matrix_id: 'BE-FACH-CONTENT-RESIDUAL-2026-V3',
    jurisdiction: 'DE-BE',
    election: 'agh-2026-be',
    issue: 240,
    source_as_of: '2026-08-28T07:56:47+02:00',
    status: 'BERLIN_FACH_TRUTH_REMEDIATION_OPEN_9_OF_12',
    controller_authority: {
      authoritative_dod: 'https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5448629781',
      false_terminal_reopen: 'https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5433805305',
      exact_execution_contract: 'https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5448473766',
    },
    canonical_source_register: {
      path: repoPath(SOURCE_REGISTER_PATH),
      file_sha256: fileSha256(SOURCE_REGISTER_PATH),
      descriptor_sha256: register.descriptor_sha256,
      verified_final_programmes: 12,
    },
    accepted_predecessor: {
      matrix_id: acceptedV1.matrix_id,
      path: repoPath(ACCEPTED_V1_PATH),
      file_sha256: fileSha256(ACCEPTED_V1_PATH),
      descriptor_sha256: acceptedV1.descriptor_sha256,
      preservation_rule: 'Reuse only exact terminal Fach objects and the finite source-bound review envelopes; BSW pp. 1-14 are advanced only through explicit issue #240 handoffs.',
    },
    accepted_incremental_handoffs: [
      {
        handoff_id: bswP14Handoff.handoff_id,
        issue_comment_id: bswP14Handoff.issue_comment_id,
        issue_comment_url: bswP14Handoff.issue_comment_url,
        path: repoPath(BSW_P14_HANDOFF_PATH),
        file_sha256: fileSha256(BSW_P14_HANDOFF_PATH),
        artifact_id: bswP14Handoff.artifact_id,
        artifact_sha256: bswP14Handoff.artifact_sha256,
        exact_terminal_object_count: bswP14Handoff.records.length,
        physical_pdf_pages: bswP14Handoff.physical_pdf_pages,
      },
    ],
    rejected_predecessor: {
      matrix_id: rejectedV2.matrix_id,
      path: repoPath(REJECTED_V2_PATH),
      file_sha256: fileSha256(REJECTED_V2_PATH),
      descriptor_sha256: rejectedV2.descriptor_sha256,
      disposition: 'REJECTED_FALSE_TERMINAL_HISTORICAL_EVIDENCE_ONLY',
      rejected_programme_analysis_complete: rejectedV2.summary.programme_analysis_complete,
      rejected_generic_rnaa_count: rejectedV2.summary.terminal_reviewed_not_assessable,
      exact_reason: 'Generic missing-input reasons and malformed fragments cannot establish object-specific REVIEWED_NOT_ASSESSABLE terminality.',
    },
    state_model: {
      source_state: ['FINAL_SOURCE_ARTIFACT_VERIFIED'],
      segmentation_state: ['SOURCE_OBJECT_BOUNDARIES_TERMINAL', 'PARTIAL_TERMINAL_WITH_REVIEW_ENVELOPES_OPEN', 'SEGMENTATION_REVIEW_REQUIRED'],
      fach_state: ['PROGRAMME_ANALYSIS_COMPLETE', 'GENUINE_FACH_REVIEW_REQUIRED'],
      terminal_object_status: ['EXPLICIT_FACH_APPROVED', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'NON_EFFECT_CONTEXT_REVIEWED', 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'],
      invariant: 'Source or segmentation closure never implies Fach terminality.',
    },
    review_envelope_contract: {
      meaning: 'A physical PDF page is a bounded review envelope, not an assertion that the page or every passage on it is effect-bearing.',
      next_step: 'Segment source-bound; classify context versus effect objects; consume only explicit object-level Fach or object-specific RNAA handoffs.',
      effect_object_count_before_segmentation: null,
      missing_effect_object_count_interpretation: 'UNKNOWN_NOT_ZERO',
    },
    known_segmentation_defects: [
      {
        rejected_atom_id: 'BE-SPD-2026-SU-0136-A01',
        source_unit_id: 'BE-SPD-2026-SU-0136',
        source_locator: 'p013:b005@42.52,199.65,286.73,370.03',
        rejected_fragment: 'Wir erhalten',
        segmentation_state: 'MALFORMED_INCOMPLETE_PREDICATE_REASSEMBLY_REQUIRED',
        counts_as_effect_object: false,
        counts_as_fach_terminal: false,
      },
      {
        rejected_atom_id: 'BE-SPD-2026-SU-0136-A03',
        source_unit_id: 'BE-SPD-2026-SU-0136',
        source_locator: 'p013:b005@42.52,199.65,286.73,370.03',
        rejected_fragment: 'Um Einkaufsstraßen attraktiver zu machen,',
        segmentation_state: 'MALFORMED_SUBORDINATE_PURPOSE_FRAGMENT_REASSEMBLY_REQUIRED',
        counts_as_effect_object: false,
        counts_as_fach_terminal: false,
      },
    ],
    binding_order: BINDING_ORDER,
    summary: {
      verified_final_programmes: 12,
      source_ready_programmes: 12,
      programme_analysis_complete: TERMINAL_PROGRAMMES.length,
      programme_analysis_complete_parties: TERMINAL_PROGRAMMES,
      programme_analysis_open: OPEN_PROGRAMMES.length,
      genuine_fach_programmes: OPEN_PROGRAMMES.length,
      genuine_fach_programme_parties: OPEN_PROGRAMMES,
      remaining_genuine_fach_review_required: remainingReviewEnvelopes,
      remaining_page_review_envelopes: remainingReviewEnvelopes,
      remaining_exact_effect_object_count: null,
      terminal_source_objects: Object.values(terminalCounts).reduce((sum, count) => sum + count, 0),
      terminal_status_counts: terminalCounts,
      known_segmentation_defects: 2,
      berlin_completion_gate: 'FAIL_CLOSED_9_PROGRAMMES_REQUIRE_SOURCE_BOUND_FACH',
    },
    programmes,
    execution_order_remaining: OPEN_PROGRAMMES,
    release_policy: {
      github_first: true,
      no_new_vercel_build: true,
      parliament_release_approval: 'NOT_GRANTED',
      vercel_preview: false,
      vercel_build: false,
      vercel_deployment: false,
      owner_rc_request_allowed: false,
    },
    constraints: {
      impact_direction_synthesized: false,
      evidence_level_synthesized: false,
      dns_mapping_synthesized: false,
      recommendation_synthesized: false,
      score_synthesized: false,
      party_wide_judgement_synthesized: false,
      generic_missing_input_rnaa_terminalized: false,
      page_envelope_treated_as_effect_object: false,
      vercel_action_triggered: false,
    },
    hash_definition: 'SHA-256 of canonical JSON (UTF-8, sorted keys, compact separators) excluding descriptor_sha256',
  };
  matrix.descriptor_sha256 = sha256(canonicalJson(matrix));
  return matrix;
}

function main() {
  const check = process.argv.includes('--check');
  const matrix = buildBerlinFachTruthResidual();
  const encoded = `${JSON.stringify(matrix, null, 2)}\n`;
  if (check) {
    assert.equal(fs.readFileSync(OUTPUT_PATH, 'utf8'), encoded, 'Berlin Fach-truth matrix is not deterministic/current');
  } else {
    fs.writeFileSync(OUTPUT_PATH, encoded);
  }
  process.stdout.write(`${JSON.stringify({
    mode: check ? 'DETERMINISM_CHECK' : 'MATERIALIZE',
    matrix_id: matrix.matrix_id,
    programmes_terminal: matrix.summary.programme_analysis_complete,
    programmes_open: matrix.summary.programme_analysis_open,
    remaining_review_envelopes: matrix.summary.remaining_page_review_envelopes,
    descriptor_sha256: matrix.descriptor_sha256,
    gate: matrix.summary.berlin_completion_gate,
  }, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
