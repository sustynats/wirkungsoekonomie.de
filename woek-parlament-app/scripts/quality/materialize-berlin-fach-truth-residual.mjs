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
const BSW_P15_P19_HANDOFF_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p15-p19-explicit-v1.json');
const BSW_P15_P19_MARKDOWN_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p15-p19-authoritative-handoff.md');
const BSW_P19_CLOSURE_P21_HANDOFF_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p19-closure-p21-explicit-v1.json');
const BSW_P19_CLOSURE_P21_MARKDOWN_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p19-closure-p21-authoritative-handoff.md');
const BSW_P22_HANDOFF_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p22-explicit-v1.json');
const BSW_P22_MARKDOWN_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p22-authoritative-handoff.md');
const BSW_P23_HANDOFF_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p23-explicit-v1.json');
const BSW_P23_MARKDOWN_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p23-authoritative-handoff.md');
const BSW_P23_CLOSURE_P25_HANDOFF_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p23-closure-p25-explicit-v1.json');
const BSW_P23_CLOSURE_MARKDOWN_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p23-child-closure-authoritative-handoff.md');
const BSW_P24_MARKDOWN_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p24-authoritative-handoff.md');
const BSW_P25_MARKDOWN_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p25-authoritative-handoff.md');
const BSW_P26_P29_HANDOFF_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p26-p29-explicit-v1.json');
const BSW_P26_MARKDOWN_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p26-authoritative-handoff.md');
const BSW_P27_MARKDOWN_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p27-authoritative-handoff.md');
const BSW_P28_MARKDOWN_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p28-authoritative-handoff.md');
const BSW_P29_MARKDOWN_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p29-authoritative-handoff.md');
const BSW_P24_P25_CHILD_CLOSURE_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p24-p25-child-closure-v1.json');
const BSW_P24_CHILD_CLOSURE_PART_1_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p24-child-closure-part-1-authoritative-handoff.md');
const BSW_P24_CHILD_CLOSURE_PART_2_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p24-child-closure-part-2-authoritative-handoff.md');
const BSW_P25_CHILD_CLOSURE_PART_1_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p25-child-closure-part-1-authoritative-handoff.md');
const BSW_P25_CHILD_CLOSURE_PART_2_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p25-child-closure-part-2-authoritative-handoff.md');
const BSW_P30_P33_HANDOFF_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p30-p33-explicit-v1.json');
const BSW_P30_MARKDOWN_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p30-authoritative-handoff.md');
const BSW_P31_MARKDOWN_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p31-authoritative-handoff.md');
const BSW_P32_MARKDOWN_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p32-authoritative-handoff.md');
const BSW_P33_MARKDOWN_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p33-authoritative-handoff.md');
const BSW_P34_P37_HANDOFF_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p34-p37-explicit-v1.json');
const BSW_P34_MARKDOWN_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p34-authoritative-handoff.md');
const BSW_P35_MARKDOWN_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p35-authoritative-handoff.md');
const BSW_P36_MARKDOWN_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p36-authoritative-handoff.md');
const BSW_P37_MARKDOWN_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p37-authoritative-handoff.md');

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

function bswP15P19Materialization(bswLedger, handoff) {
  assert.equal(handoff.schema_version, 'woek-explicit-fach-handoff-2.0');
  assert.equal(handoff.handoff_id, 'BE-BSW-P15-P19-EXPLICIT-FACH-2026-V1');
  assert.equal(handoff.base_main_commit, '1a0757682e8d2365eb28218816484c2e1e13d83e');
  assert.equal(handoff.artifact_id, bswLedger.artifact.artifact_id);
  assert.equal(handoff.artifact_sha256, bswLedger.artifact.artifact_sha256);
  assert.equal(handoff.artifact_byte_length, bswLedger.artifact.byte_length);
  assert.equal(handoff.artifact_page_count, bswLedger.artifact.page_count);
  assert.equal(handoff.authoritative_markdown.path, repoPath(BSW_P15_P19_MARKDOWN_PATH));
  assert.equal(handoff.authoritative_markdown.file_sha256, fileSha256(BSW_P15_P19_MARKDOWN_PATH));
  assert.deepEqual(handoff.batches.map((item) => item.issue_comment_id), [5449855264, 5449881459, 5449901373, 5450371661, 5451044705]);
  assert.deepEqual(handoff.coverage, {
    terminal_pages: [15, 16, 17, 18],
    partial_terminal_pages: [19],
    next_page_review_envelope_from: 20,
    next_page_review_envelope_through: 66,
    exact_open_child_object_count: 8,
  });
  assert.ok(Object.values(handoff.constraints).every((value) => value === false));

  const sourceById = new Map([
    ...bswLedger.effect_atoms.map((item) => [item.atom_id, {
      object_kind: 'SOURCE_ATOM',
      source_locator: item.source_locator,
      source_excerpt: item.source_excerpt,
      source_text_sha256: item.atom_text_sha256,
      pdf_page: item.pdf_page,
    }]),
    ...bswLedger.source_units
      .filter((item) => item.atom_count === 0)
      .map((item) => [item.source_unit_id, {
        object_kind: 'SOURCE_UNIT',
        source_locator: item.source_locator,
        source_excerpt: item.source_excerpt,
        source_text_sha256: item.source_text_sha256,
        pdf_page: item.pdf_page,
      }]),
  ]);
  const batchById = new Map(handoff.batches.map((item) => [item.issue_comment_id, item]));
  const handoffSnapshot = {
    path: handoff.authoritative_markdown.path,
    file_sha256: handoff.authoritative_markdown.file_sha256,
  };

  const terminals = handoff.terminal_records.map((decision) => {
    const source = sourceById.get(decision.object_id);
    assert.ok(source, `${decision.object_id}: exact P15-P19 source object missing`);
    assert.ok(source.pdf_page >= 15 && source.pdf_page <= 19, `${decision.object_id}: source page outside handoff`);
    const batch = batchById.get(decision.batch_issue_comment_id);
    assert.ok(batch, `${decision.object_id}: unknown Fach batch`);
    return {
      object_id: decision.object_id,
      object_kind: decision.terminal_fach_state === 'EXPLICIT_FACH_APPROVED'
        ? 'SOURCE_BOUND_FACH_OBJECT'
        : decision.terminal_fach_state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'
          ? 'SOURCE_BOUND_EXACT_RNAA_OBJECT'
          : 'SOURCE_CONTEXT_GOAL_OR_RATIONALE_OBJECT',
      source_locator: source.source_locator,
      source_excerpt: source.source_excerpt,
      source_text_sha256: source.source_text_sha256,
      source_state: 'SOURCE_BOUND_VERIFIED',
      segmentation_state: 'OBJECT_BOUNDARY_VERIFIED',
      fach_state: decision.terminal_fach_state,
      materialization_mode: 'LOSSLESS_VERBATIM_HANDOFF_SNAPSHOT',
      fach_handoff: batch.issue_comment_url,
      fach_handoff_snapshot: handoffSnapshot,
      fach_handoff_locator: decision.fach_payload.locator,
      decision_kind: decision.decision_kind,
    };
  });

  const openObjects = [];
  for (const repair of handoff.segmentation_repairs) {
    const batch = batchById.get(repair.batch_issue_comment_id);
    assert.ok(batch, `${repair.repair_id}: unknown Fach batch`);
    const sources = repair.source_fragment_ids.map((objectId) => {
      const source = sourceById.get(objectId);
      assert.ok(source, `${repair.repair_id}: source object ${objectId} missing`);
      return { object_id: objectId, ...source };
    });
    if (repair.source_full_text) {
      assert.equal(sha256(repair.source_full_text), repair.source_full_text_sha256, `${repair.repair_id}: full source text hash mismatch`);
      assert.equal(repair.source_full_text_sha256, sources[0].source_text_sha256, `${repair.repair_id}: frozen parent hash mismatch`);
    }
    for (const source of sources) {
      terminals.push({
        object_id: source.object_id,
        object_kind: 'SOURCE_SEGMENTATION_SUPERSEDED_NON_COUNTING',
        source_locator: source.source_locator,
        source_excerpt: source.source_excerpt,
        source_text_sha256: source.source_text_sha256,
        source_state: 'SOURCE_BOUND_VERIFIED',
        segmentation_state: repair.old_object_segmentation_state,
        fach_state: repair.old_object_terminal_fach_state,
        counts_as_effect_object: false,
        materialization_mode: 'VERSIONED_SEGMENTATION_SUPERSESSION',
        repair_id: repair.repair_id,
        replacement_object_ids: repair.replacements.map((item) => item.object_id),
        fach_handoff: batch.issue_comment_url,
        fach_handoff_snapshot: handoffSnapshot,
      });
    }
    for (const replacement of repair.replacements) {
      assert.equal(sha256(replacement.source_text), replacement.source_text_sha256, `${replacement.object_id}: deterministic source hash mismatch`);
      assert.ok(replacement.object_id.endsWith(replacement.source_text_sha256.slice(0, 12)), `${replacement.object_id}: deterministic id/hash binding mismatch`);
      const materialized = {
        object_id: replacement.object_id,
        object_kind: 'DETERMINISTIC_SEGMENTATION_REPLACEMENT',
        source_locator: sources.map((item) => item.source_locator).join(' + '),
        source_excerpt: replacement.source_text,
        source_text_sha256: replacement.source_text_sha256,
        source_state: 'SOURCE_BOUND_VERIFIED',
        segmentation_state: 'OBJECT_BOUNDARY_VERIFIED',
        segmentation_origin: 'DETERMINISTIC_PARENT_CHILD_OR_FRAGMENT_REPAIR',
        parent_object_ids: repair.source_fragment_ids,
        repair_id: repair.repair_id,
        fach_state: replacement.terminal_fach_state,
        counts_as_effect_object: replacement.counts_as_effect_object,
        materialization_mode: replacement.terminal_fach_state === 'GENUINE_FACH_REVIEW_REQUIRED'
          ? 'DETERMINISTIC_SEGMENTATION_ONLY_NO_FACH'
          : 'LOSSLESS_EXPLICIT_HANDOFF_AFTER_DETERMINISTIC_SEGMENTATION',
        fach_handoff: batch.issue_comment_url,
        fach_handoff_snapshot: handoffSnapshot,
        ...(replacement.fach_locator ? { fach_handoff_locator: replacement.fach_locator } : {}),
        ...(replacement.exact_reason ? { exact_reason: replacement.exact_reason } : {}),
      };
      if (replacement.terminal_fach_state === 'GENUINE_FACH_REVIEW_REQUIRED') openObjects.push(materialized);
      else terminals.push(materialized);
    }
  }

  assert.equal(handoff.terminal_records.length, 105, 'P15-P19 direct terminal decision count drift');
  assert.equal(terminals.length, 119, 'P15-P19 materialized terminal count drift');
  assert.equal(openObjects.length, 8, 'P19 exact open child count drift');
  assert.equal(new Set([...terminals, ...openObjects].map((item) => item.object_id)).size, terminals.length + openObjects.length, 'P15-P19 materialized ids must be unique');
  return { terminals, openObjects };
}

function bswP19ClosureP21Materialization(bswLedger, priorIncrement, handoff) {
  assert.equal(handoff.schema_version, 'woek-explicit-fach-handoff-2.0');
  assert.equal(handoff.handoff_id, 'BE-BSW-P19-CLOSURE-P21-EXPLICIT-FACH-2026-V1');
  assert.equal(handoff.base_main_commit, '272c427673c3b1da847af5294ed744c84c2b85cd');
  assert.equal(handoff.artifact_id, bswLedger.artifact.artifact_id);
  assert.equal(handoff.artifact_sha256, bswLedger.artifact.artifact_sha256);
  assert.equal(handoff.artifact_byte_length, bswLedger.artifact.byte_length);
  assert.equal(handoff.artifact_page_count, bswLedger.artifact.page_count);
  assert.equal(handoff.authoritative_markdown.path, repoPath(BSW_P19_CLOSURE_P21_MARKDOWN_PATH));
  assert.equal(handoff.authoritative_markdown.file_sha256, fileSha256(BSW_P19_CLOSURE_P21_MARKDOWN_PATH));
  assert.deepEqual(handoff.batches.map((item) => item.issue_comment_id), [5451527622, 5451533796, 5451555353, 5451565159]);
  assert.deepEqual(handoff.coverage, {
    closed_exact_child_object_count: 8,
    terminal_pages: [19, 20, 21],
    next_page_review_envelope_from: 22,
    next_page_review_envelope_through: 66,
    exact_open_child_object_count: 0,
  });
  assert.ok(Object.values(handoff.constraints).every((value) => value === false));

  const sourceById = new Map([
    ...bswLedger.effect_atoms.map((item) => [item.atom_id, {
      object_kind: 'SOURCE_ATOM',
      source_locator: item.source_locator,
      source_excerpt: item.source_excerpt,
      source_text_sha256: item.atom_text_sha256,
      pdf_page: item.pdf_page,
    }]),
    ...bswLedger.source_units
      .filter((item) => item.atom_count === 0)
      .map((item) => [item.source_unit_id, {
        object_kind: 'SOURCE_UNIT',
        source_locator: item.source_locator,
        source_excerpt: item.source_excerpt,
        source_text_sha256: item.source_text_sha256,
        pdf_page: item.pdf_page,
      }]),
    ...priorIncrement.openObjects.map((item) => [item.object_id, { ...item, pdf_page: 19 }]),
  ]);
  const batchById = new Map(handoff.batches.map((item) => [item.issue_comment_id, item]));
  const handoffSnapshot = {
    path: handoff.authoritative_markdown.path,
    file_sha256: handoff.authoritative_markdown.file_sha256,
  };

  const terminals = handoff.terminal_records.map((decision) => {
    const source = sourceById.get(decision.object_id);
    assert.ok(source, `${decision.object_id}: exact P19-closure/P20/P21 source object missing`);
    assert.equal(source.pdf_page, decision.source_page, `${decision.object_id}: physical page drift`);
    const batch = batchById.get(decision.batch_issue_comment_id);
    assert.ok(batch, `${decision.object_id}: unknown Fach batch`);
    assert.ok(['EXPLICIT_FACH_APPROVED', 'NON_EFFECT_CONTEXT_REVIEWED'].includes(decision.terminal_fach_state));
    return {
      object_id: decision.object_id,
      object_kind: source.object_kind === 'DETERMINISTIC_SEGMENTATION_REPLACEMENT'
        ? source.object_kind
        : decision.terminal_fach_state === 'EXPLICIT_FACH_APPROVED'
          ? 'SOURCE_BOUND_FACH_OBJECT'
          : 'SOURCE_CONTEXT_GOAL_OR_RATIONALE_OBJECT',
      source_locator: source.source_locator,
      source_excerpt: source.source_excerpt,
      source_text_sha256: source.source_text_sha256,
      source_state: 'SOURCE_BOUND_VERIFIED',
      segmentation_state: 'OBJECT_BOUNDARY_VERIFIED',
      ...(source.segmentation_origin ? { segmentation_origin: source.segmentation_origin } : {}),
      ...(source.parent_object_ids ? { parent_object_ids: source.parent_object_ids } : {}),
      ...(source.repair_id ? { repair_id: source.repair_id } : {}),
      fach_state: decision.terminal_fach_state,
      ...(source.counts_as_effect_object === true ? { counts_as_effect_object: true } : {}),
      materialization_mode: 'LOSSLESS_VERBATIM_HANDOFF_SNAPSHOT',
      fach_handoff: batch.issue_comment_url,
      fach_handoff_snapshot: handoffSnapshot,
      fach_handoff_locator: decision.fach_payload.locator,
      decision_kind: decision.decision_kind,
    };
  });

  assert.equal(handoff.terminal_records.length, 39, 'P19-closure/P20/P21 terminal decision count drift');
  assert.equal(terminals.filter((item) => item.object_id.includes('-P19-')).length, 8, 'P19 child-closure count drift');
  assert.equal(terminals.filter((item) => item.object_id.includes('-P20-')).length, 7, 'P20 terminal count drift');
  assert.equal(terminals.filter((item) => item.object_id.includes('-P21-')).length, 24, 'P21 terminal count drift');
  assert.equal(new Set(terminals.map((item) => item.object_id)).size, terminals.length, 'P19-closure/P20/P21 ids must be unique');
  return { terminals };
}

function bswP22Materialization(bswLedger, handoff) {
  assert.equal(handoff.schema_version, 'woek-explicit-fach-handoff-2.0');
  assert.equal(handoff.handoff_id, 'BE-BSW-P22-EXPLICIT-FACH-2026-V1');
  assert.equal(handoff.base_main_commit, '130d94a7b4f1ab8d7c6addcd4783123d5d43fdec');
  assert.equal(handoff.artifact_id, bswLedger.artifact.artifact_id);
  assert.equal(handoff.artifact_sha256, bswLedger.artifact.artifact_sha256);
  assert.equal(handoff.artifact_byte_length, bswLedger.artifact.byte_length);
  assert.equal(handoff.artifact_page_count, bswLedger.artifact.page_count);
  assert.equal(handoff.authoritative_markdown.path, repoPath(BSW_P22_MARKDOWN_PATH));
  assert.equal(handoff.authoritative_markdown.file_sha256, fileSha256(BSW_P22_MARKDOWN_PATH));
  assert.equal(handoff.controller.issue_comment_id, 5452905705);
  assert.deepEqual(handoff.batches.map((item) => item.issue_comment_id), [5452887573, 5452894797, 5452902986]);
  assert.deepEqual(handoff.coverage, {
    terminal_pages: [22],
    protected_physical_scope_after_materialization: 'P1-P22',
    next_page_review_envelope_from: 23,
    next_page_review_envelope_through: 66,
    original_source_object_count: 29,
    structural_heading_count: 3,
    deterministic_child_review_object_count: 12,
    total_materialized_terminal_record_count: 41,
    active_terminal_review_leaf_count: 24,
    active_explicit_fach_approved_count: 18,
    active_reviewed_not_assessable_count: 6,
    zero_count_original_record_count: 17,
    exact_open_child_object_count: 0,
    gate: 'BE_BSW_P22_FACH_COMPLETE_PASS_SOURCE_BOUND',
  });
  assert.ok(Object.values(handoff.constraints).every((value) => value === false));

  const sourceObjects = [
    ...bswLedger.effect_atoms
      .filter((item) => item.pdf_page === 22)
      .map((item) => ({
        object_id: item.atom_id,
        object_kind: 'SOURCE_ATOM',
        source_locator: item.source_locator,
        source_excerpt: item.source_excerpt,
        source_text_sha256: item.atom_text_sha256,
        pdf_page: item.pdf_page,
      })),
    ...bswLedger.source_units
      .filter((item) => item.pdf_page === 22 && item.atom_count === 0)
      .map((item) => ({
        object_id: item.source_unit_id,
        object_kind: 'SOURCE_UNIT',
        source_locator: item.source_locator,
        source_excerpt: item.source_excerpt,
        source_text_sha256: item.source_text_sha256,
        pdf_page: item.pdf_page,
      })),
  ];
  assert.equal(sourceObjects.length, 29, 'P22 frozen source-object count drift');
  assert.equal(bswLedger.effect_atoms.filter((item) => item.pdf_page === 22).length, 26, 'P22 source atom count drift');
  assert.equal(bswLedger.source_units.filter((item) => item.pdf_page === 22 && item.atom_count === 0).length, 3, 'P22 structural-heading count drift');
  const sourceById = new Map(sourceObjects.map((item) => [item.object_id, item]));
  assert.equal(sourceById.size, 29, 'P22 frozen source IDs must be unique');
  assert.equal(handoff.original_records.length, 29, 'P22 handoff original-record count drift');
  assert.deepEqual(
    [...new Set(handoff.original_records.map((item) => item.object_id))].sort(),
    [...sourceById.keys()].sort(),
    'P22 handoff must cover the exact frozen source-object set',
  );

  const batchById = new Map(handoff.batches.map((item) => [item.issue_comment_id, item]));
  const handoffSnapshot = {
    path: handoff.authoritative_markdown.path,
    file_sha256: handoff.authoritative_markdown.file_sha256,
  };
  const normalizeFachState = (state) => state.startsWith('NON_EFFECT_') ? 'NON_EFFECT_CONTEXT_REVIEWED' : state;
  const originalTerminals = handoff.original_records.map((decision) => {
    const source = sourceById.get(decision.object_id);
    assert.ok(source, `${decision.object_id}: exact P22 source object missing`);
    assert.equal(source.pdf_page, 22, `${decision.object_id}: physical page drift`);
    const batch = batchById.get(decision.batch_issue_comment_id);
    assert.ok(batch, `${decision.object_id}: unknown P22 Fach batch`);
    const fachState = normalizeFachState(decision.authoritative_terminal_fach_state);
    assert.ok([
      'EXPLICIT_FACH_APPROVED',
      'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
      'NON_EFFECT_CONTEXT_REVIEWED',
      'SOURCE_UNIT_RECLASSIFIED_VERSIONED',
    ].includes(fachState), `${decision.object_id}: unsupported normalized Fach state`);
    const activeLeaf = ['EXPLICIT_FACH_APPROVED', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'].includes(fachState);
    assert.equal(decision.counts_as_effect_object, activeLeaf, `${decision.object_id}: counting role drift`);
    if (fachState === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED') {
      assert.equal(decision.counts_as_effect_object, false, `${decision.object_id}: versioned parent/restatement must be zero-counting`);
    }
    return {
      object_id: decision.object_id,
      object_kind: fachState === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'
        ? 'SOURCE_VERSIONED_PARENT_OR_RESTATEMENT_NON_COUNTING'
        : fachState === 'EXPLICIT_FACH_APPROVED'
          ? 'SOURCE_BOUND_FACH_OBJECT'
          : fachState === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'
            ? 'SOURCE_BOUND_EXACT_RNAA_OBJECT'
            : 'SOURCE_CONTEXT_GOAL_OR_RATIONALE_OBJECT',
      source_locator: source.source_locator,
      source_excerpt: source.source_excerpt,
      source_text_sha256: source.source_text_sha256,
      source_state: 'SOURCE_BOUND_VERIFIED',
      segmentation_state: fachState === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'
        ? 'VERSIONED_PARENT_OR_RESTATEMENT_NON_COUNTING'
        : 'OBJECT_BOUNDARY_VERIFIED',
      fach_state: fachState,
      authoritative_terminal_fach_state: decision.authoritative_terminal_fach_state,
      counts_as_effect_object: decision.counts_as_effect_object,
      ...(decision.replacement_child_ids ? { replacement_child_ids: decision.replacement_child_ids } : {}),
      ...(decision.restatement_target_object_id ? { restatement_target_object_id: decision.restatement_target_object_id } : {}),
      ...(decision.role ? { source_role: decision.role } : {}),
      materialization_mode: 'LOSSLESS_VERBATIM_HANDOFF_SNAPSHOT',
      fach_handoff: batch.issue_comment_url,
      fach_handoff_snapshot: handoffSnapshot,
      fach_handoff_locator: decision.fach_payload.locator,
      decision_kind: decision.decision_kind,
    };
  });

  assert.equal(handoff.deterministic_children.length, 12, 'P22 deterministic child count drift');
  const childTerminals = handoff.deterministic_children.map((decision) => {
    const parent = sourceById.get(decision.parent_object_id);
    assert.ok(parent, `${decision.object_id}: frozen parent missing`);
    const parentDecision = handoff.original_records.find((item) => item.object_id === decision.parent_object_id);
    assert.equal(parentDecision.authoritative_terminal_fach_state, 'SOURCE_UNIT_RECLASSIFIED_VERSIONED', `${decision.object_id}: parent is not versioned`);
    assert.ok(parentDecision.replacement_child_ids.includes(decision.object_id), `${decision.object_id}: parent/child lineage missing`);
    assert.equal(sha256(decision.source_text), decision.source_text_sha256, `${decision.object_id}: exact child-clause hash mismatch`);
    assert.ok(decision.object_id.endsWith(decision.source_text_sha256.slice(0, 12)), `${decision.object_id}: deterministic child id/hash mismatch`);
    assert.ok(['EXPLICIT_FACH_APPROVED', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'].includes(decision.terminal_fach_state));
    assert.equal(decision.counts_as_effect_object, true, `${decision.object_id}: child must be an active review leaf`);
    const batch = batchById.get(decision.batch_issue_comment_id);
    assert.ok(batch, `${decision.object_id}: unknown P22 child Fach batch`);
    return {
      object_id: decision.object_id,
      object_kind: 'DETERMINISTIC_SEGMENTATION_REPLACEMENT',
      source_locator: `${parent.source_locator}; deterministic child clause ${decision.child_role}`,
      source_excerpt: decision.source_text,
      source_text_sha256: decision.source_text_sha256,
      source_state: 'SOURCE_BOUND_VERIFIED',
      segmentation_state: 'OBJECT_BOUNDARY_VERIFIED',
      segmentation_origin: 'DETERMINISTIC_PARENT_CHILD_SPLIT',
      parent_object_ids: [decision.parent_object_id],
      child_role: decision.child_role,
      fach_state: decision.terminal_fach_state,
      counts_as_effect_object: true,
      materialization_mode: 'LOSSLESS_EXPLICIT_HANDOFF_AFTER_DETERMINISTIC_SEGMENTATION',
      fach_handoff: batch.issue_comment_url,
      fach_handoff_snapshot: handoffSnapshot,
      fach_handoff_locator: decision.fach_payload.locator,
    };
  });

  const terminals = [...originalTerminals, ...childTerminals];
  assert.equal(terminals.length, 41, 'P22 total materialized terminal record count drift');
  assert.equal(new Set(terminals.map((item) => item.object_id)).size, terminals.length, 'P22 materialized IDs must be unique');
  const activeLeaves = terminals.filter((item) => item.counts_as_effect_object === true);
  assert.equal(activeLeaves.length, 24, 'P22 active terminal review-leaf count drift');
  assert.equal(activeLeaves.filter((item) => item.fach_state === 'EXPLICIT_FACH_APPROVED').length, 18, 'P22 explicit active-leaf count drift');
  assert.equal(activeLeaves.filter((item) => item.fach_state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON').length, 6, 'P22 RNAA active-leaf count drift');
  assert.equal(originalTerminals.filter((item) => item.counts_as_effect_object === false).length, 17, 'P22 zero-count original role count drift');
  assert.deepEqual(statusCounts(terminals), {
    EXPLICIT_FACH_APPROVED: 18,
    REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 6,
    NON_EFFECT_CONTEXT_REVIEWED: 11,
    SOURCE_UNIT_RECLASSIFIED_VERSIONED: 6,
  });
  const restatement = originalTerminals.find((item) => item.object_id === 'BE-BSW-P22-U02-A07-0cd49822c754');
  assert.equal(restatement.restatement_target_object_id, 'BE-BSW-P22-U02-A04-C02-fd05adab8416');
  assert.equal(restatement.counts_as_effect_object, false);
  return { terminals };
}

function bswP23Materialization(bswLedger, handoff) {
  assert.equal(handoff.schema_version, 'woek-explicit-fach-handoff-2.0');
  assert.equal(handoff.handoff_id, 'BE-BSW-P23-EXPLICIT-FACH-2026-V1');
  assert.equal(handoff.base_main_commit, 'b0209e26bbc93d89070bc89e0c83df7d4ab0269f');
  assert.equal(handoff.artifact_id, bswLedger.artifact.artifact_id);
  assert.equal(handoff.artifact_sha256, bswLedger.artifact.artifact_sha256);
  assert.equal(handoff.artifact_byte_length, bswLedger.artifact.byte_length);
  assert.equal(handoff.artifact_page_count, bswLedger.artifact.page_count);
  assert.equal(handoff.authoritative_markdown.path, repoPath(BSW_P23_MARKDOWN_PATH));
  assert.equal(handoff.authoritative_markdown.file_sha256, fileSha256(BSW_P23_MARKDOWN_PATH));
  assert.equal(handoff.controller.issue_comment_id, 5452695176);
  assert.deepEqual(handoff.batches.map((item) => item.issue_comment_id), [5452692674]);
  assert.deepEqual(handoff.coverage, {
    segmented_physical_pages: [23],
    protected_fach_terminal_physical_scope: 'P1-P22',
    next_opaque_page_review_envelope_from: 24,
    next_opaque_page_review_envelope_through: 66,
    original_source_object_count: 25,
    zero_atom_source_unit_count: 4,
    compound_parent_count: 6,
    terminal_original_record_count: 25,
    active_terminal_review_leaf_count: 9,
    active_explicit_fach_approved_count: 9,
    active_reviewed_not_assessable_count: 0,
    zero_count_original_record_count: 16,
    deterministic_child_review_object_count: 13,
    exact_open_child_object_count: 13,
    gate: 'BE_BSW_P23_CLEAN_RECORDS_TERMINAL_CHILD_FACH_PENDING',
  });
  assert.ok(Object.values(handoff.constraints).every((value) => value === false));

  const sourceObjects = [
    ...bswLedger.effect_atoms
      .filter((item) => item.pdf_page === 23)
      .map((item) => ({
        object_id: item.atom_id,
        object_kind: 'SOURCE_ATOM',
        source_locator: item.source_locator,
        source_excerpt: item.source_excerpt,
        source_text_sha256: item.atom_text_sha256,
        pdf_page: item.pdf_page,
      })),
    ...bswLedger.source_units
      .filter((item) => item.pdf_page === 23 && item.atom_count === 0)
      .map((item) => ({
        object_id: item.source_unit_id,
        object_kind: 'SOURCE_UNIT',
        source_locator: item.source_locator,
        source_excerpt: item.source_excerpt,
        source_text_sha256: item.source_text_sha256,
        pdf_page: item.pdf_page,
      })),
  ];
  assert.equal(sourceObjects.length, 25, 'P23 frozen source-object count drift');
  assert.equal(bswLedger.effect_atoms.filter((item) => item.pdf_page === 23).length, 21, 'P23 source atom count drift');
  assert.equal(bswLedger.source_units.filter((item) => item.pdf_page === 23 && item.atom_count === 0).length, 4, 'P23 zero-atom source-unit count drift');
  const sourceById = new Map(sourceObjects.map((item) => [item.object_id, item]));
  assert.equal(sourceById.size, 25, 'P23 frozen source IDs must be unique');
  assert.equal(handoff.original_records.length, 25, 'P23 handoff original-record count drift');
  assert.deepEqual(
    [...new Set(handoff.original_records.map((item) => item.object_id))].sort(),
    [...sourceById.keys()].sort(),
    'P23 handoff must cover the exact frozen source-object set',
  );

  const batch = handoff.batches[0];
  const handoffSnapshot = {
    path: handoff.authoritative_markdown.path,
    file_sha256: handoff.authoritative_markdown.file_sha256,
  };
  const normalizeFachState = (state) => state.startsWith('NON_EFFECT_') ? 'NON_EFFECT_CONTEXT_REVIEWED' : state;
  const terminals = handoff.original_records.map((decision) => {
    const source = sourceById.get(decision.object_id);
    assert.ok(source, `${decision.object_id}: exact P23 source object missing`);
    assert.equal(source.pdf_page, 23, `${decision.object_id}: physical page drift`);
    const fachState = normalizeFachState(decision.authoritative_terminal_fach_state);
    assert.ok([
      'EXPLICIT_FACH_APPROVED',
      'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
      'NON_EFFECT_CONTEXT_REVIEWED',
      'SOURCE_UNIT_RECLASSIFIED_VERSIONED',
    ].includes(fachState), `${decision.object_id}: unsupported normalized Fach state`);
    const activeLeaf = ['EXPLICIT_FACH_APPROVED', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'].includes(fachState);
    assert.equal(decision.counts_as_effect_object, activeLeaf, `${decision.object_id}: counting role drift`);
    if (fachState === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED') {
      assert.equal(decision.counts_as_effect_object, false, `${decision.object_id}: compound parent must be zero-counting`);
      assert.ok(Array.isArray(decision.replacement_child_ids) && decision.replacement_child_ids.length >= 2, `${decision.object_id}: child lineage missing`);
    }
    return {
      object_id: decision.object_id,
      object_kind: fachState === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'
        ? 'SOURCE_VERSIONED_COMPOUND_PARENT_NON_COUNTING'
        : fachState === 'EXPLICIT_FACH_APPROVED'
          ? 'SOURCE_BOUND_FACH_OBJECT'
          : fachState === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'
            ? 'SOURCE_BOUND_EXACT_RNAA_OBJECT'
            : 'SOURCE_CONTEXT_GOAL_OR_RATIONALE_OBJECT',
      source_locator: source.source_locator,
      source_excerpt: source.source_excerpt,
      source_text_sha256: source.source_text_sha256,
      source_state: 'SOURCE_BOUND_VERIFIED',
      segmentation_state: fachState === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'
        ? 'COMPOUND_EFFECT_PARENT_NONCOUNTING'
        : 'OBJECT_BOUNDARY_VERIFIED',
      fach_state: fachState,
      authoritative_terminal_fach_state: decision.authoritative_terminal_fach_state,
      counts_as_effect_object: decision.counts_as_effect_object,
      ...(decision.replacement_child_ids ? { replacement_child_ids: decision.replacement_child_ids } : {}),
      materialization_mode: 'LOSSLESS_VERBATIM_HANDOFF_SNAPSHOT',
      fach_handoff: batch.issue_comment_url,
      fach_handoff_snapshot: handoffSnapshot,
      fach_handoff_locator: `Issue #240 comment ${batch.issue_comment_id}; exact object ${decision.object_id}`,
      decision_kind: decision.decision_kind,
    };
  });

  assert.equal(handoff.deterministic_children.length, 13, 'P23 deterministic child count drift');
  const openObjects = handoff.deterministic_children.map((child) => {
    const parent = sourceById.get(child.parent_object_id);
    assert.ok(parent, `${child.object_id}: frozen parent missing`);
    const parentDecision = handoff.original_records.find((item) => item.object_id === child.parent_object_id);
    assert.equal(parentDecision.authoritative_terminal_fach_state, 'SOURCE_UNIT_RECLASSIFIED_VERSIONED', `${child.object_id}: parent is not versioned`);
    assert.ok(parentDecision.replacement_child_ids.includes(child.object_id), `${child.object_id}: parent/child lineage missing`);
    assert.equal(parent.source_excerpt.slice(child.source_span.start, child.source_span.end), child.source_text, `${child.object_id}: exact parent source span drift`);
    assert.equal(sha256(child.source_text), child.source_text_sha256, `${child.object_id}: exact child source hash mismatch`);
    assert.ok(child.object_id.endsWith(child.source_text_sha256.slice(0, 12)), `${child.object_id}: deterministic child id/hash mismatch`);
    return {
      object_id: child.object_id,
      object_kind: 'DETERMINISTIC_SEGMENTATION_REPLACEMENT',
      source_locator: `${parent.source_locator}; exact UTF-16 source span ${child.source_span.start}:${child.source_span.end}`,
      source_excerpt: child.source_text,
      source_text_sha256: child.source_text_sha256,
      source_span: child.source_span,
      source_span_basis: handoff.deterministic_child_contract.source_span_basis,
      source_state: 'SOURCE_BOUND_VERIFIED',
      segmentation_state: 'OBJECT_BOUNDARY_VERIFIED',
      segmentation_origin: 'DETERMINISTIC_PARENT_CHILD_SPLIT',
      parent_object_ids: [child.parent_object_id],
      child_role: child.child_role,
      fach_state: handoff.deterministic_child_contract.fach_state,
      counts_as_effect_object: handoff.deterministic_child_contract.counts_as_effect_object,
      materialization_mode: handoff.deterministic_child_contract.materialization_mode,
      exact_reason: handoff.deterministic_child_contract.exact_reason,
      fach_handoff: batch.issue_comment_url,
      fach_handoff_snapshot: handoffSnapshot,
    };
  });

  assert.equal(terminals.length, 25, 'P23 terminal original record count drift');
  assert.equal(openObjects.length, 13, 'P23 exact open child count drift');
  assert.equal(new Set([...terminals, ...openObjects].map((item) => item.object_id)).size, 38, 'P23 current IDs must be unique');
  assert.equal(terminals.filter((item) => item.counts_as_effect_object === true).length, 9, 'P23 active terminal leaf count drift');
  assert.equal(terminals.filter((item) => item.fach_state === 'EXPLICIT_FACH_APPROVED').length, 9, 'P23 explicit terminal count drift');
  assert.equal(terminals.filter((item) => item.counts_as_effect_object === false).length, 16, 'P23 zero-count original count drift');
  assert.deepEqual(statusCounts(terminals), {
    EXPLICIT_FACH_APPROVED: 9,
    REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 0,
    NON_EFFECT_CONTEXT_REVIEWED: 10,
    SOURCE_UNIT_RECLASSIFIED_VERSIONED: 6,
  });
  return { terminals, openObjects };
}

function bswP23ClosureP25Materialization(bswLedger, p23, handoff) {
  assert.equal(handoff.schema_version, 'woek-explicit-fach-handoff-2.0');
  assert.equal(handoff.handoff_id, 'BE-BSW-P23-CHILD-CLOSURE-P25-EXPLICIT-FACH-2026-V1');
  assert.equal(handoff.base_main_commit, '9ada1a33c6fca94f0bb4b5ce45fd17a9686b9d9c');
  assert.equal(handoff.artifact_id, bswLedger.artifact.artifact_id);
  assert.equal(handoff.artifact_sha256, bswLedger.artifact.artifact_sha256);
  assert.equal(handoff.artifact_byte_length, bswLedger.artifact.byte_length);
  assert.equal(handoff.artifact_page_count, bswLedger.artifact.page_count);
  assert.equal(handoff.controller.issue_comment_id, 5455799664);
  assert.ok(Object.values(handoff.constraints).every((value) => value === false));

  const expectedSnapshots = [
    [5455797952, BSW_P23_CLOSURE_MARKDOWN_PATH],
    [5452737343, BSW_P24_MARKDOWN_PATH],
    [5452761537, BSW_P25_MARKDOWN_PATH],
  ];
  assert.equal(handoff.authoritative_markdowns.length, expectedSnapshots.length);
  const snapshotByComment = new Map(handoff.authoritative_markdowns.map((item) => [item.issue_comment_id, item]));
  for (const [commentId, markdownPath] of expectedSnapshots) {
    const snapshot = snapshotByComment.get(commentId);
    assert.ok(snapshot, `authoritative snapshot missing for issue comment ${commentId}`);
    assert.equal(snapshot.path, repoPath(markdownPath));
    assert.equal(snapshot.file_sha256, fileSha256(markdownPath));
  }

  assert.deepEqual(handoff.coverage, {
    protected_fach_terminal_physical_scope: 'P1-P25',
    next_opaque_page_review_envelope_from: 26,
    next_opaque_page_review_envelope_through: 66,
    p23_child_terminal_count: 13,
    p24_original_source_object_count: 28,
    p24_additional_merged_terminal_count: 1,
    p24_deterministic_child_review_object_count: 14,
    p25_original_source_object_count: 9,
    p25_additional_cross_page_merged_terminal_count: 1,
    p25_deterministic_child_review_object_count: 9,
    new_terminal_record_count: 53,
    exact_open_child_object_count: 22,
    gate: 'BE_BSW_P23_P25_CLEAN_RECORDS_TERMINAL_CHILD_FACH_PENDING',
  });

  const p23Snapshot = snapshotByComment.get(5455797952);
  const p23DecisionById = new Map(handoff.p23_child_terminal_decisions.map((item) => [item.object_id, item]));
  assert.equal(p23DecisionById.size, 13, 'P23 child-closure decision count drift');
  assert.deepEqual(
    [...p23DecisionById.keys()].sort(),
    p23.openObjects.map((item) => item.object_id).sort(),
    'P23 child-closure set must equal the exact open set from the predecessor',
  );
  const closedP23Children = p23.openObjects.map((source) => {
    const decision = p23DecisionById.get(source.object_id);
    assert.equal(decision.terminal_fach_state, 'EXPLICIT_FACH_APPROVED');
    assert.equal(decision.counts_as_effect_object, true);
    assert.equal(decision.decision_kind, source.child_role);
    const { exact_reason: _exactReason, ...withoutOpenReason } = source;
    return {
      ...withoutOpenReason,
      fach_state: decision.terminal_fach_state,
      impact_direction: decision.impact_direction,
      evidence_level: decision.evidence_level,
      counts_as_effect_object: true,
      materialization_mode: 'LOSSLESS_EXPLICIT_HANDOFF_AFTER_DETERMINISTIC_SEGMENTATION',
      fach_handoff: p23Snapshot.issue_comment_url,
      fach_handoff_snapshot: {
        path: p23Snapshot.path,
        file_sha256: p23Snapshot.file_sha256,
      },
      fach_handoff_locator: `Issue #240 comment ${p23Snapshot.issue_comment_id}; exact child ${source.object_id}`,
      decision_kind: decision.decision_kind,
    };
  });

  const sourceObjects = [
    ...bswLedger.effect_atoms
      .filter((item) => item.pdf_page === 24 || item.pdf_page === 25)
      .map((item) => ({
        object_id: item.atom_id,
        object_kind: 'SOURCE_ATOM',
        source_locator: item.source_locator,
        source_excerpt: item.source_excerpt,
        source_text_sha256: item.atom_text_sha256,
        pdf_page: item.pdf_page,
      })),
    ...bswLedger.source_units
      .filter((item) => (item.pdf_page === 24 || item.pdf_page === 25) && item.atom_count === 0)
      .map((item) => ({
        object_id: item.source_unit_id,
        object_kind: 'SOURCE_UNIT',
        source_locator: item.source_locator,
        source_excerpt: item.source_excerpt,
        source_text_sha256: item.source_text_sha256,
        pdf_page: item.pdf_page,
      })),
  ];
  assert.equal(sourceObjects.filter((item) => item.pdf_page === 24).length, 28, 'P24 source-object count drift');
  assert.equal(sourceObjects.filter((item) => item.pdf_page === 25).length, 9, 'P25 source-object count drift');
  assert.equal(sourceObjects.length, 37, 'P24/P25 source-object count drift');
  const sourceById = new Map(sourceObjects.map((item) => [item.object_id, item]));
  assert.equal(sourceById.size, sourceObjects.length, 'P24/P25 source IDs must be unique');
  assert.equal(handoff.original_records.length, sourceObjects.length, 'P24/P25 handoff original-record count drift');
  assert.deepEqual(
    handoff.original_records.map((item) => item.object_id).sort(),
    [...sourceById.keys()].sort(),
    'P24/P25 handoff must cover the exact frozen source-object set',
  );

  const childrenByParent = new Map();
  for (const child of handoff.deterministic_children) {
    const list = childrenByParent.get(child.parent_object_id) ?? [];
    list.push(child.object_id);
    childrenByParent.set(child.parent_object_id, list);
  }
  const mergeByParent = new Map();
  for (const merged of handoff.merged_records) {
    for (const parentId of merged.parent_object_ids) mergeByParent.set(parentId, merged.object_id);
  }
  const p24Snapshot = snapshotByComment.get(5452737343);
  const p25Snapshot = snapshotByComment.get(5452761537);
  const normalizeFachState = (state) => state.startsWith('NON_EFFECT_') ? 'NON_EFFECT_CONTEXT_REVIEWED' : state;
  const originalTerminals = handoff.original_records.map((decision) => {
    const source = sourceById.get(decision.object_id);
    assert.ok(source, `${decision.object_id}: exact P24/P25 source object missing`);
    const snapshot = source.pdf_page === 24 ? p24Snapshot : p25Snapshot;
    const fachState = normalizeFachState(decision.authoritative_terminal_fach_state);
    assert.ok([
      'EXPLICIT_FACH_APPROVED',
      'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
      'NON_EFFECT_CONTEXT_REVIEWED',
      'SOURCE_UNIT_RECLASSIFIED_VERSIONED',
    ].includes(fachState), `${decision.object_id}: unsupported normalized Fach state`);
    const activeLeaf = ['EXPLICIT_FACH_APPROVED', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'].includes(fachState);
    assert.equal(decision.counts_as_effect_object, activeLeaf, `${decision.object_id}: counting role drift`);
    const replacementChildIds = childrenByParent.get(decision.object_id);
    const replacementMergedRecordId = mergeByParent.get(decision.object_id);
    if (fachState === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED') {
      assert.equal(decision.counts_as_effect_object, false, `${decision.object_id}: versioned source must be zero-counting`);
      assert.ok(replacementChildIds?.length || replacementMergedRecordId, `${decision.object_id}: replacement lineage missing`);
    }
    const segmentationState = fachState === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'
      ? replacementChildIds?.length
        ? 'COMPOUND_EFFECT_PARENT_NONCOUNTING'
        : 'SEGMENTATION_SUPERSEDED_NONCOUNTING_FRAGMENT'
      : 'OBJECT_BOUNDARY_VERIFIED';
    return {
      object_id: decision.object_id,
      object_kind: fachState === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'
        ? 'SOURCE_VERSIONED_PARENT_OR_FRAGMENT_NON_COUNTING'
        : fachState === 'EXPLICIT_FACH_APPROVED'
          ? 'SOURCE_BOUND_FACH_OBJECT'
          : fachState === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'
            ? 'SOURCE_BOUND_EXACT_RNAA_OBJECT'
            : 'SOURCE_CONTEXT_GOAL_OR_RATIONALE_OBJECT',
      source_locator: source.source_locator,
      source_excerpt: source.source_excerpt,
      source_text_sha256: source.source_text_sha256,
      source_state: 'SOURCE_BOUND_VERIFIED',
      segmentation_state: segmentationState,
      fach_state: fachState,
      authoritative_terminal_fach_state: decision.authoritative_terminal_fach_state,
      counts_as_effect_object: decision.counts_as_effect_object,
      ...(replacementChildIds ? { replacement_child_ids: replacementChildIds } : {}),
      ...(replacementMergedRecordId ? { replacement_merged_record_id: replacementMergedRecordId } : {}),
      materialization_mode: 'LOSSLESS_VERBATIM_HANDOFF_SNAPSHOT',
      fach_handoff: snapshot.issue_comment_url,
      fach_handoff_snapshot: {
        path: snapshot.path,
        file_sha256: snapshot.file_sha256,
      },
      fach_handoff_locator: `Issue #240 comment ${snapshot.issue_comment_id}; exact object ${decision.object_id}`,
      decision_kind: decision.decision_kind,
    };
  });

  assert.equal(handoff.deterministic_children.length, 23, 'P24/P25 deterministic child count drift');
  const terminalChildren = [];
  const openObjects = [];
  for (const child of handoff.deterministic_children) {
    const parent = sourceById.get(child.parent_object_id);
    assert.ok(parent, `${child.object_id}: frozen parent missing`);
    assert.equal(parent.source_excerpt.slice(child.source_span.start, child.source_span.end), child.source_text, `${child.object_id}: exact parent source span drift`);
    assert.equal(sha256(child.source_text), child.source_text_sha256, `${child.object_id}: exact child source hash mismatch`);
    assert.ok(child.object_id.endsWith(child.source_text_sha256.slice(0, 12)), `${child.object_id}: deterministic child id/hash mismatch`);
    const parentDecision = handoff.original_records.find((item) => item.object_id === child.parent_object_id);
    assert.equal(parentDecision.authoritative_terminal_fach_state, 'SOURCE_UNIT_RECLASSIFIED_VERSIONED', `${child.object_id}: parent is not versioned`);
    assert.ok(childrenByParent.get(child.parent_object_id).includes(child.object_id), `${child.object_id}: reverse child lineage drift`);
    const base = {
      object_id: child.object_id,
      object_kind: 'DETERMINISTIC_SEGMENTATION_REPLACEMENT',
      source_locator: `${parent.source_locator}; exact UTF-16 source span ${child.source_span.start}:${child.source_span.end}`,
      source_excerpt: child.source_text,
      source_text_sha256: child.source_text_sha256,
      source_span: child.source_span,
      source_span_basis: handoff.deterministic_child_contract.source_span_basis,
      source_state: 'SOURCE_BOUND_VERIFIED',
      segmentation_state: 'OBJECT_BOUNDARY_VERIFIED',
      segmentation_origin: 'DETERMINISTIC_PARENT_CHILD_SPLIT',
      parent_object_ids: [child.parent_object_id],
      child_role: child.child_role,
      counts_as_effect_object: child.counts_as_effect_object,
    };
    if (child.fach_state === 'GENUINE_FACH_REVIEW_REQUIRED') {
      openObjects.push({
        ...base,
        fach_state: child.fach_state,
        materialization_mode: handoff.deterministic_child_contract.materialization_mode,
        exact_reason: handoff.deterministic_child_contract.exact_reason,
      });
    } else {
      assert.equal(child.fach_state, 'NON_EFFECT_PROBLEM_CLAIM_REVIEWED');
      assert.equal(child.counts_as_effect_object, false);
      terminalChildren.push({
        ...base,
        fach_state: 'NON_EFFECT_CONTEXT_REVIEWED',
        authoritative_terminal_fach_state: child.fach_state,
        materialization_mode: 'LOSSLESS_EXPLICIT_HANDOFF_AFTER_DETERMINISTIC_SEGMENTATION',
        fach_handoff: p24Snapshot.issue_comment_url,
        fach_handoff_snapshot: {
          path: p24Snapshot.path,
          file_sha256: p24Snapshot.file_sha256,
        },
        fach_handoff_locator: `Issue #240 comment ${p24Snapshot.issue_comment_id}; deterministic child ${child.object_id}`,
      });
    }
  }
  assert.equal(terminalChildren.length, 1, 'P24 terminal non-effect child count drift');
  assert.equal(openObjects.length, 22, 'P24/P25 exact open child count drift');

  assert.equal(handoff.merged_records.length, 2, 'P24/P25 merged-record count drift');
  const mergedTerminals = handoff.merged_records.map((decision) => {
    const parents = decision.parent_object_ids.map((objectId) => {
      const parent = sourceById.get(objectId);
      assert.ok(parent, `${decision.object_id}: merged parent ${objectId} missing`);
      assert.equal(mergeByParent.get(objectId), decision.object_id, `${decision.object_id}: reverse merge lineage drift`);
      return parent;
    });
    assert.equal(parents.map((item) => item.source_excerpt).join(' '), decision.source_text, `${decision.object_id}: deterministic merged text drift`);
    assert.equal(sha256(decision.source_text), decision.source_text_sha256, `${decision.object_id}: merged source hash mismatch`);
    assert.ok(decision.object_id.endsWith(decision.source_text_sha256.slice(0, 12)), `${decision.object_id}: merged id/hash mismatch`);
    const snapshot = decision.object_id.includes('P24P25') ? p25Snapshot : p24Snapshot;
    const fachState = normalizeFachState(decision.terminal_fach_state);
    return {
      object_id: decision.object_id,
      object_kind: fachState === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'
        ? 'DETERMINISTIC_MERGED_SOURCE_BOUND_EXACT_RNAA_OBJECT'
        : 'DETERMINISTIC_MERGED_SOURCE_CONTEXT_OBJECT',
      source_locator: parents.map((item) => item.source_locator).join(' + '),
      source_excerpt: decision.source_text,
      source_text_sha256: decision.source_text_sha256,
      source_state: 'SOURCE_BOUND_VERIFIED',
      segmentation_state: 'OBJECT_BOUNDARY_VERIFIED',
      segmentation_origin: decision.merge_role,
      parent_object_ids: decision.parent_object_ids,
      fach_state: fachState,
      authoritative_terminal_fach_state: decision.terminal_fach_state,
      counts_as_effect_object: decision.counts_as_effect_object,
      materialization_mode: 'LOSSLESS_EXPLICIT_HANDOFF_AFTER_DETERMINISTIC_SOURCE_REPAIR',
      fach_handoff: snapshot.issue_comment_url,
      fach_handoff_snapshot: {
        path: snapshot.path,
        file_sha256: snapshot.file_sha256,
      },
      fach_handoff_locator: `Issue #240 comment ${snapshot.issue_comment_id}; deterministic merged record ${decision.object_id}`,
      decision_kind: decision.decision_kind,
      ...(decision.competence_boundary ? { competence_boundary: decision.competence_boundary } : {}),
    };
  });

  const p24P25Terminals = [...originalTerminals, ...terminalChildren, ...mergedTerminals];
  assert.equal(p24P25Terminals.length, 40, 'P24/P25 terminal record count drift');
  assert.deepEqual(statusCounts(p24P25Terminals), {
    EXPLICIT_FACH_APPROVED: 5,
    REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 4,
    NON_EFFECT_CONTEXT_REVIEWED: 18,
    SOURCE_UNIT_RECLASSIFIED_VERSIONED: 13,
  });
  const terminals = [...p23.terminals, ...closedP23Children, ...p24P25Terminals];
  assert.equal(terminals.length, 78, 'P23 closure through P25 terminal record count drift');
  assert.equal(new Set([...terminals, ...openObjects].map((item) => item.object_id)).size, terminals.length + openObjects.length, 'P23-P25 current IDs must be unique');
  assert.deepEqual(statusCounts(terminals), {
    EXPLICIT_FACH_APPROVED: 27,
    REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 4,
    NON_EFFECT_CONTEXT_REVIEWED: 28,
    SOURCE_UNIT_RECLASSIFIED_VERSIONED: 19,
  });
  return { terminals, openObjects, newTerminalRecordCount: closedP23Children.length + p24P25Terminals.length };
}

function bswP26P29Materialization(bswLedger, handoff) {
  assert.equal(handoff.schema_version, 'woek-explicit-fach-handoff-2.0');
  assert.equal(handoff.handoff_id, 'BE-BSW-P26-P29-EXPLICIT-FACH-2026-V1');
  assert.equal(handoff.base_main_commit, 'b33b88ceaa4b16e892fb87743be32927e37a5c9f');
  assert.equal(handoff.artifact_id, bswLedger.artifact.artifact_id);
  assert.equal(handoff.artifact_sha256, bswLedger.artifact.artifact_sha256);
  assert.equal(handoff.artifact_byte_length, bswLedger.artifact.byte_length);
  assert.equal(handoff.artifact_page_count, bswLedger.artifact.page_count);
  assert.equal(handoff.controller.issue_comment_id, 5456983188);
  assert.ok(Object.values(handoff.constraints).every((value) => value === false));

  const expectedSnapshots = [
    [5453271486, BSW_P26_MARKDOWN_PATH],
    [5453313480, BSW_P27_MARKDOWN_PATH],
    [5453972082, BSW_P28_MARKDOWN_PATH],
    [5454011541, BSW_P29_MARKDOWN_PATH],
  ];
  assert.equal(handoff.authoritative_markdowns.length, expectedSnapshots.length);
  const snapshotByComment = new Map(handoff.authoritative_markdowns.map((item) => [item.issue_comment_id, item]));
  for (const [commentId, markdownPath] of expectedSnapshots) {
    const snapshot = snapshotByComment.get(commentId);
    assert.ok(snapshot, `authoritative snapshot missing for issue comment ${commentId}`);
    assert.equal(snapshot.path, repoPath(markdownPath));
    assert.equal(snapshot.file_sha256, fileSha256(markdownPath));
  }
  assert.deepEqual(handoff.coverage, {
    protected_fach_terminal_physical_scope: 'P1-P29',
    next_opaque_page_review_envelope_from: 30,
    next_opaque_page_review_envelope_through: 66,
    physical_pdf_pages: [26, 27, 28, 29],
    original_terminal_record_count: 81,
    deterministic_terminal_record_count: 32,
    new_terminal_record_count: 113,
    active_terminal_review_leaf_count: 31,
    active_explicit_fach_approved_count: 26,
    active_reviewed_not_assessable_count: 5,
    new_exact_open_child_object_count: 0,
    carried_exact_open_child_object_count: 22,
    terminal_status_counts: {
      EXPLICIT_FACH_APPROVED: 26,
      REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 5,
      NON_EFFECT_CONTEXT_REVIEWED: 65,
      SOURCE_UNIT_RECLASSIFIED_VERSIONED: 17,
    },
    gate: 'BE_BSW_P26_P29_FACH_COMPLETE_PASS_SOURCE_BOUND',
  });

  const ledgerById = new Map([
    ...bswLedger.source_units
      .filter((item) => item.pdf_page >= 26 && item.pdf_page <= 29)
      .map((item) => [item.source_unit_id, {
        page: item.pdf_page,
        sha256: item.source_text_sha256,
        source_locator: item.source_locator,
      }]),
    ...bswLedger.effect_atoms
      .filter((item) => item.pdf_page >= 26 && item.pdf_page <= 29)
      .map((item) => [item.atom_id, {
        page: item.pdf_page,
        sha256: item.atom_text_sha256,
        source_locator: item.source_locator,
      }]),
  ]);
  assert.equal(handoff.source_objects.length, 81, 'P26-P29 source-object set drift');
  const sourceById = new Map(handoff.source_objects.map((item) => [item.object_id, item]));
  assert.equal(sourceById.size, handoff.source_objects.length, 'P26-P29 source IDs must be unique');
  for (const source of handoff.source_objects) {
    const ledgerSource = ledgerById.get(source.object_id);
    assert.ok(ledgerSource, `${source.object_id}: frozen ledger object missing`);
    assert.equal(source.pdf_page, ledgerSource.page, `${source.object_id}: physical page drift`);
    assert.equal(source.source_text_sha256, ledgerSource.sha256, `${source.object_id}: frozen source hash drift`);
    assert.equal(sha256(source.source_text), source.source_text_sha256, `${source.object_id}: embedded full source text hash drift`);
  }

  const snapshotForPage = (page) => {
    if (page === 26) return snapshotByComment.get(5453271486);
    if (page === 27) return snapshotByComment.get(5453313480);
    if (page === 28) return snapshotByComment.get(5453972082);
    return snapshotByComment.get(5454011541);
  };
  const normalizeFachState = (state) => state.startsWith('NON_EFFECT_')
    ? 'NON_EFFECT_CONTEXT_REVIEWED'
    : state === 'AMBIVALENT_EXPLICIT_FACH_APPROVED'
      ? 'EXPLICIT_FACH_APPROVED'
      : state;
  const allCurrentIds = new Set([
    ...handoff.original_records.map((item) => item.object_id),
    ...handoff.deterministic_records.map((item) => item.object_id),
  ]);
  assert.equal(allCurrentIds.size, 113, 'P26-P29 current ID set drift');

  const originalTerminals = handoff.original_records.map((decision) => {
    const source = sourceById.get(decision.object_id);
    assert.ok(source, `${decision.object_id}: exact embedded source missing`);
    const fachState = normalizeFachState(decision.authoritative_terminal_fach_state);
    const activeLeaf = ['EXPLICIT_FACH_APPROVED', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'].includes(fachState);
    assert.equal(decision.counts_as_effect_object, activeLeaf, `${decision.object_id}: counting role drift`);
    if (fachState === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED') {
      assert.equal(decision.counts_as_effect_object, false);
      assert.ok(decision.replacement_child_ids?.length, `${decision.object_id}: replacement lineage missing`);
      assert.ok(decision.replacement_child_ids.every((id) => allCurrentIds.has(id)), `${decision.object_id}: replacement ID missing from current set`);
    }
    const snapshot = snapshotForPage(source.pdf_page);
    return {
      object_id: decision.object_id,
      object_kind: fachState === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'
        ? 'SOURCE_VERSIONED_PARENT_OR_FRAGMENT_NON_COUNTING'
        : fachState === 'EXPLICIT_FACH_APPROVED'
          ? 'SOURCE_BOUND_FACH_OBJECT'
          : fachState === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'
            ? 'SOURCE_BOUND_EXACT_RNAA_OBJECT'
            : 'SOURCE_CONTEXT_GOAL_OR_RATIONALE_OBJECT',
      source_locator: ledgerById.get(source.object_id).source_locator,
      source_excerpt: source.source_text,
      source_text_sha256: source.source_text_sha256,
      source_state: 'SOURCE_BOUND_VERIFIED',
      segmentation_state: fachState === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'
        ? 'SOURCE_OR_FRAGMENT_SUPERSEDED_NONCOUNTING'
        : 'OBJECT_BOUNDARY_VERIFIED',
      fach_state: fachState,
      authoritative_terminal_fach_state: decision.authoritative_terminal_fach_state,
      counts_as_effect_object: decision.counts_as_effect_object,
      ...(decision.replacement_child_ids ? { replacement_child_ids: decision.replacement_child_ids } : {}),
      materialization_mode: 'LOSSLESS_VERBATIM_HANDOFF_SNAPSHOT',
      fach_handoff: snapshot.issue_comment_url,
      fach_handoff_snapshot: { path: snapshot.path, file_sha256: snapshot.file_sha256 },
      fach_handoff_locator: `Issue #240 comment ${snapshot.issue_comment_id}; exact object ${decision.object_id}`,
      decision_kind: decision.decision_kind,
    };
  });

  const deterministicTerminals = handoff.deterministic_records.map((decision) => {
    const parents = decision.parent_object_ids.map((id) => {
      const source = sourceById.get(id);
      assert.ok(source, `${decision.object_id}: parent ${id} missing`);
      return source;
    });
    const combined = parents.map((item) => item.source_text).join(decision.parent_joiner);
    assert.equal(combined.slice(decision.source_span.start, decision.source_span.end), decision.source_text, `${decision.object_id}: exact source span drift`);
    assert.equal(sha256(decision.source_text), decision.source_text_sha256, `${decision.object_id}: source hash drift`);
    assert.ok(decision.object_id.endsWith(decision.source_text_sha256.slice(0, 12)), `${decision.object_id}: ID/hash drift`);
    const fachState = normalizeFachState(decision.terminal_fach_state);
    const activeLeaf = ['EXPLICIT_FACH_APPROVED', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'].includes(fachState);
    assert.equal(decision.counts_as_effect_object, activeLeaf, `${decision.object_id}: deterministic counting drift`);
    const snapshot = snapshotForPage(Math.min(...parents.map((item) => item.pdf_page)));
    return {
      object_id: decision.object_id,
      object_kind: decision.object_kind,
      source_locator: parents.map((item) => ledgerById.get(item.object_id).source_locator).join(' + '),
      source_excerpt: decision.source_text,
      source_text_sha256: decision.source_text_sha256,
      source_span: decision.source_span,
      source_span_basis: decision.source_span_basis,
      source_state: 'SOURCE_BOUND_VERIFIED',
      segmentation_state: 'OBJECT_BOUNDARY_VERIFIED',
      segmentation_origin: decision.object_kind,
      parent_object_ids: decision.parent_object_ids,
      fach_state: fachState,
      authoritative_terminal_fach_state: decision.terminal_fach_state,
      counts_as_effect_object: decision.counts_as_effect_object,
      materialization_mode: 'LOSSLESS_EXPLICIT_HANDOFF_AFTER_DETERMINISTIC_SOURCE_REPAIR',
      fach_handoff: snapshot.issue_comment_url,
      fach_handoff_snapshot: { path: snapshot.path, file_sha256: snapshot.file_sha256 },
      fach_handoff_locator: `Issue #240 comment ${snapshot.issue_comment_id}; deterministic record ${decision.object_id}`,
      decision_kind: decision.decision_kind,
      ...(decision.exact_reason_code ? { exact_reason_code: decision.exact_reason_code } : {}),
    };
  });

  const terminals = [...originalTerminals, ...deterministicTerminals];
  assert.equal(terminals.length, 113, 'P26-P29 terminal record count drift');
  assert.deepEqual(statusCounts(terminals), handoff.coverage.terminal_status_counts);
  assert.equal(terminals.filter((item) => item.counts_as_effect_object).length, 31);
  return { terminals, newTerminalRecordCount: terminals.length };
}

function bswP24P25ChildClosureMaterialization(predecessor, handoff) {
  assert.equal(handoff.schema_version, 'woek-explicit-fach-handoff-2.0');
  assert.equal(handoff.handoff_id, 'BE-BSW-P24-P25-CHILD-CLOSURE-2026-V1');
  assert.equal(handoff.base_main_commit, '2f5d5d896eb1a8e851529a31139bfa57b00eca84');
  assert.equal(handoff.artifact_id, 'BE-AGH-2026-BSW-WAHLPROGRAMM');
  assert.equal(handoff.artifact_sha256, 'fd6fe2b9fbb69fc5a34451989c2a75feb14e893c172a20d7840bbe94f2161675');
  assert.equal(handoff.controller.issue_comment_id, 5457255354);
  assert.ok(Object.values(handoff.constraints).every((value) => value === false));

  const expectedSnapshots = [
    [5457221577, BSW_P24_CHILD_CLOSURE_PART_1_PATH],
    [5457228818, BSW_P24_CHILD_CLOSURE_PART_2_PATH],
    [5457240763, BSW_P25_CHILD_CLOSURE_PART_1_PATH],
    [5457248909, BSW_P25_CHILD_CLOSURE_PART_2_PATH],
  ];
  const snapshots = new Map(handoff.authoritative_markdowns.map((item) => [item.issue_comment_id, item]));
  assert.equal(snapshots.size, expectedSnapshots.length);
  for (const [commentId, markdownPath] of expectedSnapshots) {
    const snapshot = snapshots.get(commentId);
    assert.ok(snapshot, `P24/P25 child-closure snapshot missing for ${commentId}`);
    assert.equal(snapshot.path, repoPath(markdownPath));
    assert.equal(snapshot.file_sha256, fileSha256(markdownPath));
  }
  assert.deepEqual(handoff.coverage, {
    source_exact_open_child_count: 22,
    closed_child_terminal_count: 22,
    p24_child_terminal_count: 13,
    p25_child_terminal_count: 9,
    active_terminal_review_leaf_count: 21,
    active_explicit_fach_approved_count: 20,
    active_reviewed_not_assessable_count: 1,
    zero_count_guard_count: 1,
    exact_open_child_object_count_after: 0,
    terminal_status_counts: {
      EXPLICIT_FACH_APPROVED: 20,
      REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 1,
      NON_EFFECT_CONTEXT_REVIEWED: 1,
      SOURCE_UNIT_RECLASSIFIED_VERSIONED: 0,
    },
    gate: 'BE_BSW_P24_P25_EXACT_CHILD_FACH_RESIDUAL_ZERO',
  });

  const decisions = new Map(handoff.child_terminal_decisions.map((item) => [item.object_id, item]));
  assert.equal(decisions.size, 22, 'P24/P25 child-closure decision count drift');
  assert.deepEqual(
    [...decisions.keys()].sort(),
    predecessor.openObjects.map((item) => item.object_id).sort(),
    'P24/P25 child-closure set must equal predecessor exact-open set',
  );
  const p24Part1Ids = new Set(handoff.child_terminal_decisions.slice(0, 6).map((item) => item.object_id));
  const p25Part1Ids = new Set(handoff.child_terminal_decisions.slice(13, 19).map((item) => item.object_id));
  const closed = predecessor.openObjects.map((source) => {
    const decision = decisions.get(source.object_id);
    const normalized = decision.authoritative_terminal_fach_state.startsWith('NON_EFFECT_')
      ? 'NON_EFFECT_CONTEXT_REVIEWED'
      : decision.authoritative_terminal_fach_state;
    assert.ok(['EXPLICIT_FACH_APPROVED', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'NON_EFFECT_CONTEXT_REVIEWED'].includes(normalized));
    assert.equal(decision.counts_as_effect_object, normalized !== 'NON_EFFECT_CONTEXT_REVIEWED', `${source.object_id}: counting drift`);
    const commentId = source.object_id.includes('-P24-')
      ? p24Part1Ids.has(source.object_id) ? 5457221577 : 5457228818
      : p25Part1Ids.has(source.object_id) ? 5457240763 : 5457248909;
    const snapshot = snapshots.get(commentId);
    const { exact_reason: _openReason, ...base } = source;
    return {
      ...base,
      fach_state: normalized,
      authoritative_terminal_fach_state: decision.authoritative_terminal_fach_state,
      counts_as_effect_object: decision.counts_as_effect_object,
      materialization_mode: 'LOSSLESS_EXPLICIT_HANDOFF_AFTER_DETERMINISTIC_SEGMENTATION',
      fach_handoff: snapshot.issue_comment_url,
      fach_handoff_snapshot: { path: snapshot.path, file_sha256: snapshot.file_sha256 },
      fach_handoff_locator: `Issue #240 comment ${commentId}; exact child ${source.object_id}`,
      decision_kind: decision.decision_kind,
    };
  });
  assert.deepEqual(statusCounts(closed), handoff.coverage.terminal_status_counts);
  return { terminals: [...predecessor.terminals, ...closed], closedTerminals: closed, openObjects: [] };
}

function bswP30P33Materialization(bswLedger, handoff) {
  assert.equal(handoff.schema_version, 'woek-explicit-fach-handoff-2.0');
  assert.equal(handoff.handoff_id, 'BE-BSW-P30-P33-EXPLICIT-FACH-2026-V1');
  assert.equal(handoff.base_main_commit, '2f5d5d896eb1a8e851529a31139bfa57b00eca84');
  assert.equal(handoff.artifact_id, bswLedger.artifact.artifact_id);
  assert.equal(handoff.artifact_sha256, bswLedger.artifact.artifact_sha256);
  assert.equal(handoff.artifact_byte_length, bswLedger.artifact.byte_length);
  assert.equal(handoff.artifact_page_count, bswLedger.artifact.page_count);
  assert.equal(handoff.controller.issue_comment_id, 5457255354);
  assert.ok(Object.values(handoff.constraints).every((value) => value === false));

  const expectedSnapshots = [
    [5454047551, BSW_P30_MARKDOWN_PATH],
    [5454095617, BSW_P31_MARKDOWN_PATH],
    [5454152920, BSW_P32_MARKDOWN_PATH],
    [5454551001, BSW_P33_MARKDOWN_PATH],
  ];
  const snapshots = new Map(handoff.authoritative_markdowns.map((item) => [item.issue_comment_id, item]));
  assert.equal(snapshots.size, expectedSnapshots.length);
  for (const [commentId, markdownPath] of expectedSnapshots) {
    const snapshot = snapshots.get(commentId);
    assert.ok(snapshot, `P30-P33 snapshot missing for ${commentId}`);
    assert.equal(snapshot.path, repoPath(markdownPath));
    assert.equal(snapshot.file_sha256, fileSha256(markdownPath));
  }
  assert.deepEqual(handoff.coverage, {
    protected_fach_terminal_physical_scope: 'P1-P33',
    next_opaque_page_review_envelope_from: 34,
    next_opaque_page_review_envelope_through: 66,
    physical_pdf_pages: [30, 31, 32, 33],
    original_terminal_record_count: 78,
    deterministic_terminal_record_count: 6,
    new_terminal_record_count: 84,
    active_terminal_review_leaf_count: 31,
    active_explicit_fach_approved_count: 20,
    active_reviewed_not_assessable_count: 11,
    new_exact_open_child_object_count: 0,
    carried_exact_open_child_object_count: 0,
    terminal_status_counts: {
      EXPLICIT_FACH_APPROVED: 20,
      REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 11,
      NON_EFFECT_CONTEXT_REVIEWED: 49,
      SOURCE_UNIT_RECLASSIFIED_VERSIONED: 4,
    },
    gate: 'BE_BSW_P30_P33_FACH_COMPLETE_PASS_SOURCE_BOUND',
  });

  const ledgerById = new Map([
    ...bswLedger.source_units
      .filter((item) => item.pdf_page >= 30 && item.pdf_page <= 33 && item.atom_count === 0)
      .map((item) => [item.source_unit_id, { page: item.pdf_page, sha256: item.source_text_sha256, source_locator: item.source_locator, source_excerpt: item.source_excerpt }]),
    ...bswLedger.effect_atoms
      .filter((item) => item.pdf_page >= 30 && item.pdf_page <= 33)
      .map((item) => [item.atom_id, { page: item.pdf_page, sha256: item.atom_text_sha256, source_locator: item.source_locator, source_excerpt: item.source_excerpt }]),
  ]);
  const sourceById = new Map(handoff.source_objects.map((item) => [item.object_id, item]));
  assert.equal(ledgerById.size, 78, 'P30-P33 ledger source-object count drift');
  assert.equal(sourceById.size, 78, 'P30-P33 embedded source-object count drift');
  for (const source of handoff.source_objects) {
    const frozen = ledgerById.get(source.object_id);
    assert.ok(frozen, `${source.object_id}: frozen source missing`);
    assert.equal(source.pdf_page, frozen.page, `${source.object_id}: page drift`);
    assert.equal(source.source_text_sha256, frozen.sha256, `${source.object_id}: hash drift`);
    if (source.source_text) assert.equal(sha256(source.source_text), source.source_text_sha256, `${source.object_id}: embedded exact atom text drift`);
    else assert.equal(source.source_excerpt, frozen.source_excerpt, `${source.object_id}: source-unit excerpt drift`);
  }
  assert.deepEqual(handoff.original_records.map((item) => item.object_id).sort(), [...sourceById.keys()].sort());
  const normalize = (state) => state.startsWith('NON_EFFECT_') ? 'NON_EFFECT_CONTEXT_REVIEWED' : state;
  const snapshotForPage = (page) => snapshots.get(page === 30 ? 5454047551 : page === 31 ? 5454095617 : page === 32 ? 5454152920 : 5454551001);
  const allIds = new Set([...handoff.original_records, ...handoff.deterministic_records].map((item) => item.object_id));
  assert.equal(allIds.size, 84, 'P30-P33 current ID set drift');

  const originalTerminals = handoff.original_records.map((decision) => {
    const source = sourceById.get(decision.object_id);
    const fachState = normalize(decision.authoritative_terminal_fach_state);
    const active = fachState === 'EXPLICIT_FACH_APPROVED' || fachState === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON';
    assert.equal(decision.counts_as_effect_object, active, `${decision.object_id}: counting role drift`);
    if (fachState === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED') {
      assert.ok(decision.replacement_record_ids?.length, `${decision.object_id}: replacement lineage missing`);
      assert.ok(decision.replacement_record_ids.every((id) => allIds.has(id)), `${decision.object_id}: replacement ID missing`);
    }
    const snapshot = snapshotForPage(source.pdf_page);
    return {
      object_id: decision.object_id,
      object_kind: fachState === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'
        ? 'SOURCE_VERSIONED_PARENT_OR_FRAGMENT_NON_COUNTING'
        : fachState === 'EXPLICIT_FACH_APPROVED'
          ? 'SOURCE_BOUND_FACH_OBJECT'
          : fachState === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'
            ? 'SOURCE_BOUND_EXACT_RNAA_OBJECT'
            : 'SOURCE_CONTEXT_GOAL_OR_RATIONALE_OBJECT',
      source_locator: ledgerById.get(source.object_id).source_locator,
      source_excerpt: source.source_text ?? source.source_excerpt,
      source_text_sha256: source.source_text_sha256,
      source_state: 'SOURCE_BOUND_VERIFIED',
      segmentation_state: fachState === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED' ? 'SOURCE_OR_FRAGMENT_SUPERSEDED_NONCOUNTING' : 'OBJECT_BOUNDARY_VERIFIED',
      fach_state: fachState,
      authoritative_terminal_fach_state: decision.authoritative_terminal_fach_state,
      counts_as_effect_object: decision.counts_as_effect_object,
      ...(decision.replacement_record_ids ? { replacement_record_ids: decision.replacement_record_ids } : {}),
      materialization_mode: 'LOSSLESS_VERBATIM_HANDOFF_SNAPSHOT',
      fach_handoff: snapshot.issue_comment_url,
      fach_handoff_snapshot: { path: snapshot.path, file_sha256: snapshot.file_sha256 },
      fach_handoff_locator: `Issue #240 comment ${snapshot.issue_comment_id}; exact object ${decision.object_id}`,
      decision_kind: decision.decision_kind,
    };
  });

  const deterministicTerminals = handoff.deterministic_records.map((decision) => {
    const parents = decision.parent_object_ids.map((id) => {
      const source = sourceById.get(id);
      assert.ok(source?.source_text, `${decision.object_id}: exact atom parent ${id} missing`);
      return source;
    });
    let reconstructed;
    if (decision.source_segments) {
      assert.equal(parents.length, 1, `${decision.object_id}: segmented alternative must have one parent`);
      reconstructed = decision.source_segments
        .map((span) => parents[0].source_text.slice(span.start, span.end))
        .join(decision.source_segment_joiner);
    } else {
      const joined = parents.map((item) => item.source_text).join(decision.parent_joiner);
      reconstructed = joined.slice(decision.source_span.start, decision.source_span.end);
    }
    assert.equal(reconstructed, decision.source_text, `${decision.object_id}: deterministic text/span drift`);
    assert.equal(sha256(decision.source_text), decision.source_text_sha256, `${decision.object_id}: deterministic hash drift`);
    assert.ok(decision.object_id.endsWith(decision.source_text_sha256.slice(0, 12)), `${decision.object_id}: deterministic ID/hash drift`);
    const fachState = normalize(decision.terminal_fach_state);
    const active = fachState === 'EXPLICIT_FACH_APPROVED' || fachState === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON';
    assert.equal(decision.counts_as_effect_object, active, `${decision.object_id}: deterministic counting drift`);
    const snapshot = snapshotForPage(Math.min(...parents.map((item) => item.pdf_page)));
    return {
      object_id: decision.object_id,
      object_kind: decision.object_kind,
      source_locator: parents.map((item) => ledgerById.get(item.object_id).source_locator).join(' + '),
      source_excerpt: decision.source_text,
      source_text_sha256: decision.source_text_sha256,
      ...(decision.source_span ? { source_span: decision.source_span } : {}),
      ...(decision.source_segments ? { source_segments: decision.source_segments, source_segment_joiner: decision.source_segment_joiner } : {}),
      source_span_basis: decision.source_span_basis,
      source_state: 'SOURCE_BOUND_VERIFIED',
      segmentation_state: 'OBJECT_BOUNDARY_VERIFIED',
      segmentation_origin: decision.object_kind,
      parent_object_ids: decision.parent_object_ids,
      fach_state: fachState,
      authoritative_terminal_fach_state: decision.terminal_fach_state,
      counts_as_effect_object: decision.counts_as_effect_object,
      materialization_mode: 'LOSSLESS_EXPLICIT_HANDOFF_AFTER_DETERMINISTIC_SOURCE_REPAIR',
      fach_handoff: snapshot.issue_comment_url,
      fach_handoff_snapshot: { path: snapshot.path, file_sha256: snapshot.file_sha256 },
      fach_handoff_locator: `Issue #240 comment ${snapshot.issue_comment_id}; deterministic record ${decision.object_id}`,
      decision_kind: decision.decision_kind,
    };
  });
  const terminals = [...originalTerminals, ...deterministicTerminals];
  assert.equal(terminals.length, 84, 'P30-P33 terminal record count drift');
  assert.deepEqual(statusCounts(terminals), handoff.coverage.terminal_status_counts);
  assert.equal(terminals.filter((item) => item.counts_as_effect_object).length, 31);
  return { terminals, newTerminalRecordCount: terminals.length };
}

function bswP34P37Materialization(bswLedger, handoff) {
  assert.equal(handoff.schema_version, 'woek-explicit-fach-handoff-2.0');
  assert.equal(handoff.handoff_id, 'BE-BSW-P34-P37-EXPLICIT-FACH-2026-V1');
  assert.equal(handoff.base_main_commit, '91dce3c60f90c1cab090ac9bd8ab4b3b01c704e1');
  assert.equal(handoff.artifact_id, bswLedger.artifact.artifact_id);
  assert.equal(handoff.artifact_sha256, bswLedger.artifact.artifact_sha256);
  assert.equal(handoff.artifact_byte_length, bswLedger.artifact.byte_length);
  assert.equal(handoff.artifact_page_count, bswLedger.artifact.page_count);
  assert.equal(handoff.controller.issue_comment_id, 5458291078);
  assert.ok(Object.values(handoff.constraints).every((value) => value === false));

  const expectedSnapshots = [
    [5455124893, BSW_P34_MARKDOWN_PATH],
    [5455153680, BSW_P35_MARKDOWN_PATH],
    [5455190042, BSW_P36_MARKDOWN_PATH],
    [5455197085, BSW_P37_MARKDOWN_PATH],
  ];
  const snapshots = new Map(handoff.authoritative_markdowns.map((item) => [item.issue_comment_id, item]));
  assert.equal(snapshots.size, expectedSnapshots.length);
  for (const [commentId, markdownPath] of expectedSnapshots) {
    const snapshot = snapshots.get(commentId);
    assert.ok(snapshot, `P34-P37 snapshot missing for ${commentId}`);
    assert.equal(snapshot.path, repoPath(markdownPath));
    assert.equal(snapshot.file_sha256, fileSha256(markdownPath));
  }
  assert.deepEqual(handoff.coverage, {
    protected_fach_terminal_physical_scope: 'P1-P33',
    segmented_physical_pages: [34, 35, 36, 37],
    next_opaque_page_review_envelope_from: 38,
    next_opaque_page_review_envelope_through: 66,
    original_source_object_count: 69,
    original_terminal_record_count: 69,
    deterministic_terminal_record_count: 4,
    new_terminal_record_count: 73,
    active_terminal_review_leaf_count: 15,
    active_explicit_fach_approved_count: 10,
    active_reviewed_not_assessable_count: 5,
    versioned_parent_or_fragment_count: 14,
    new_exact_open_child_object_count: 19,
    carried_exact_open_child_object_count: 0,
    terminal_status_counts: {
      EXPLICIT_FACH_APPROVED: 10,
      REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 5,
      NON_EFFECT_CONTEXT_REVIEWED: 44,
      SOURCE_UNIT_RECLASSIFIED_VERSIONED: 14,
    },
    gate: 'BE_BSW_P34_P37_CLEAN_RECORDS_TERMINAL_CHILD_FACH_PENDING',
  });

  const ledgerById = new Map([
    ...bswLedger.source_units
      .filter((item) => item.pdf_page >= 34 && item.pdf_page <= 37 && item.atom_count === 0)
      .map((item) => [item.source_unit_id, { page: item.pdf_page, sha256: item.source_text_sha256, source_locator: item.source_locator, source_excerpt: item.source_excerpt }]),
    ...bswLedger.effect_atoms
      .filter((item) => item.pdf_page >= 34 && item.pdf_page <= 37)
      .map((item) => [item.atom_id, { page: item.pdf_page, sha256: item.atom_text_sha256, source_locator: item.source_locator, source_excerpt: item.source_excerpt }]),
  ]);
  const sourceById = new Map(handoff.source_objects.map((item) => [item.object_id, item]));
  assert.equal(ledgerById.size, 69, 'P34-P37 ledger source-object count drift');
  assert.equal(sourceById.size, 69, 'P34-P37 embedded source-object count drift');
  for (const source of handoff.source_objects) {
    const frozen = ledgerById.get(source.object_id);
    assert.ok(frozen, `${source.object_id}: frozen source missing`);
    assert.equal(source.pdf_page, frozen.page, `${source.object_id}: page drift`);
    assert.equal(source.source_text_sha256, frozen.sha256, `${source.object_id}: hash drift`);
    if (source.source_text) assert.equal(sha256(source.source_text), source.source_text_sha256, `${source.object_id}: embedded exact source text drift`);
    else assert.equal(source.source_excerpt, frozen.source_excerpt, `${source.object_id}: source excerpt drift`);
  }
  assert.deepEqual(handoff.original_records.map((item) => item.object_id).sort(), [...sourceById.keys()].sort());

  const normalize = (state) => state.startsWith('NON_EFFECT_') ? 'NON_EFFECT_CONTEXT_REVIEWED' : state;
  const snapshotForPage = (page) => snapshots.get(page === 34 ? 5455124893 : page === 35 ? 5455153680 : page === 36 ? 5455190042 : 5455197085);
  const allRecords = [...handoff.original_records, ...handoff.deterministic_records, ...handoff.deterministic_open_children];
  const allIds = new Set(allRecords.map((item) => item.object_id));
  assert.equal(allIds.size, 92, 'P34-P37 current ID set drift');

  const originalTerminals = handoff.original_records.map((decision) => {
    const source = sourceById.get(decision.object_id);
    const fachState = normalize(decision.authoritative_terminal_fach_state);
    const active = fachState === 'EXPLICIT_FACH_APPROVED' || fachState === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON';
    assert.equal(decision.counts_as_effect_object, active, `${decision.object_id}: counting role drift`);
    if (fachState === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED') {
      assert.ok(decision.replacement_record_ids?.length, `${decision.object_id}: replacement lineage missing`);
      assert.ok(decision.replacement_record_ids.every((id) => allIds.has(id)), `${decision.object_id}: replacement ID missing`);
    }
    const snapshot = snapshotForPage(source.pdf_page);
    return {
      object_id: decision.object_id,
      object_kind: fachState === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'
        ? 'SOURCE_VERSIONED_PARENT_OR_FRAGMENT_NON_COUNTING'
        : fachState === 'EXPLICIT_FACH_APPROVED'
          ? 'SOURCE_BOUND_FACH_OBJECT'
          : fachState === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'
            ? 'SOURCE_BOUND_EXACT_RNAA_OBJECT'
            : 'SOURCE_CONTEXT_GOAL_OR_RATIONALE_OBJECT',
      source_locator: ledgerById.get(source.object_id).source_locator,
      source_excerpt: source.source_text ?? source.source_excerpt,
      source_text_sha256: source.source_text_sha256,
      source_state: 'SOURCE_BOUND_VERIFIED',
      segmentation_state: fachState === 'SOURCE_UNIT_RECLASSIFIED_VERSIONED' ? 'SOURCE_OR_FRAGMENT_SUPERSEDED_NONCOUNTING' : 'OBJECT_BOUNDARY_VERIFIED',
      fach_state: fachState,
      authoritative_terminal_fach_state: decision.authoritative_terminal_fach_state,
      counts_as_effect_object: decision.counts_as_effect_object,
      ...(decision.replacement_record_ids ? { replacement_record_ids: decision.replacement_record_ids } : {}),
      materialization_mode: 'LOSSLESS_VERBATIM_HANDOFF_SNAPSHOT',
      fach_handoff: snapshot.issue_comment_url,
      fach_handoff_snapshot: { path: snapshot.path, file_sha256: snapshot.file_sha256 },
      fach_handoff_locator: `Issue #240 comment ${snapshot.issue_comment_id}; exact object ${decision.object_id}`,
      decision_kind: decision.decision_kind,
    };
  });

  const reconstruct = (decision) => {
    const parents = decision.parent_object_ids.map((id) => {
      const source = sourceById.get(id);
      assert.ok(source?.source_text, `${decision.object_id}: exact parent ${id} missing`);
      return source;
    });
    let reconstructed;
    if (decision.source_segments) {
      assert.equal(parents.length, 1, `${decision.object_id}: segmented record must have one parent`);
      reconstructed = decision.source_segments
        .map((span) => parents[0].source_text.slice(span.start, span.end))
        .join(decision.source_segment_joiner);
    } else {
      const joined = parents.map((item) => item.source_text).join(decision.parent_joiner ?? '');
      reconstructed = joined.slice(decision.source_span.start, decision.source_span.end);
    }
    assert.equal(reconstructed, decision.source_text, `${decision.object_id}: deterministic text/span drift`);
    assert.equal(sha256(decision.source_text), decision.source_text_sha256, `${decision.object_id}: deterministic hash drift`);
    assert.ok(decision.object_id.endsWith(decision.source_text_sha256.slice(0, 12)), `${decision.object_id}: deterministic ID/hash drift`);
    for (const parent of decision.parent_object_ids) {
      const original = handoff.original_records.find((item) => item.object_id === parent);
      assert.equal(original.authoritative_terminal_fach_state, 'SOURCE_UNIT_RECLASSIFIED_VERSIONED', `${decision.object_id}: parent is not versioned`);
      assert.ok(original.replacement_record_ids.includes(decision.object_id), `${decision.object_id}: reverse parent lineage missing`);
    }
    return parents;
  };

  const deterministicTerminals = handoff.deterministic_records.map((decision) => {
    const parents = reconstruct(decision);
    const fachState = normalize(decision.terminal_fach_state);
    assert.equal(decision.counts_as_effect_object, false, `${decision.object_id}: deterministic context record must count zero`);
    assert.equal(fachState, 'NON_EFFECT_CONTEXT_REVIEWED', `${decision.object_id}: unexpected deterministic terminal state`);
    const snapshot = snapshotForPage(Math.min(...parents.map((item) => item.pdf_page)));
    return {
      object_id: decision.object_id,
      object_kind: decision.object_kind,
      source_locator: parents.map((item) => ledgerById.get(item.object_id).source_locator).join(' + '),
      source_excerpt: decision.source_text,
      source_text_sha256: decision.source_text_sha256,
      ...(decision.source_span ? { source_span: decision.source_span } : {}),
      ...(decision.source_segments ? { source_segments: decision.source_segments, source_segment_joiner: decision.source_segment_joiner } : {}),
      source_span_basis: decision.source_span_basis,
      source_state: 'SOURCE_BOUND_VERIFIED',
      segmentation_state: 'OBJECT_BOUNDARY_VERIFIED',
      segmentation_origin: decision.object_kind,
      parent_object_ids: decision.parent_object_ids,
      fach_state: fachState,
      authoritative_terminal_fach_state: decision.terminal_fach_state,
      counts_as_effect_object: false,
      materialization_mode: 'LOSSLESS_EXPLICIT_HANDOFF_AFTER_DETERMINISTIC_SOURCE_REPAIR',
      fach_handoff: snapshot.issue_comment_url,
      fach_handoff_snapshot: { path: snapshot.path, file_sha256: snapshot.file_sha256 },
      fach_handoff_locator: `Issue #240 comment ${snapshot.issue_comment_id}; deterministic record ${decision.object_id}`,
      decision_kind: decision.decision_kind,
    };
  });

  const openObjects = handoff.deterministic_open_children.map((decision) => {
    const parents = reconstruct(decision);
    const snapshot = snapshotForPage(Math.min(...parents.map((item) => item.pdf_page)));
    return {
      object_id: decision.object_id,
      object_kind: decision.object_kind,
      source_locator: parents.map((item) => ledgerById.get(item.object_id).source_locator).join(' + '),
      source_excerpt: decision.source_text,
      source_text_sha256: decision.source_text_sha256,
      ...(decision.source_span ? { source_span: decision.source_span } : {}),
      ...(decision.source_segments ? { source_segments: decision.source_segments, source_segment_joiner: decision.source_segment_joiner } : {}),
      source_span_basis: decision.source_span_basis,
      source_state: 'SOURCE_BOUND_VERIFIED',
      segmentation_state: 'OBJECT_BOUNDARY_VERIFIED',
      segmentation_origin: decision.object_kind,
      parent_object_ids: decision.parent_object_ids,
      child_role: decision.child_role,
      fach_state: handoff.deterministic_child_contract.open_fach_state,
      counts_as_effect_object: handoff.deterministic_child_contract.open_counts_as_effect_object,
      materialization_mode: handoff.deterministic_child_contract.open_materialization_mode,
      exact_reason: handoff.deterministic_child_contract.exact_reason,
      fach_handoff: snapshot.issue_comment_url,
      fach_handoff_snapshot: { path: snapshot.path, file_sha256: snapshot.file_sha256 },
      fach_handoff_locator: `Issue #240 comment ${snapshot.issue_comment_id}; deterministic child ${decision.object_id}`,
    };
  });

  const terminals = [...originalTerminals, ...deterministicTerminals];
  assert.equal(terminals.length, 73, 'P34-P37 terminal record count drift');
  assert.equal(openObjects.length, 19, 'P34-P37 exact open child count drift');
  assert.deepEqual(statusCounts(terminals), handoff.coverage.terminal_status_counts);
  assert.equal(terminals.filter((item) => item.counts_as_effect_object).length, 15);
  assert.ok(openObjects.every((item) => item.fach_state === 'GENUINE_FACH_REVIEW_REQUIRED' && item.counts_as_effect_object === true));
  return { terminals, openObjects, newTerminalRecordCount: terminals.length };
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
  const bswP15P19Handoff = readJson(BSW_P15_P19_HANDOFF_PATH);
  const bswP19ClosureP21Handoff = readJson(BSW_P19_CLOSURE_P21_HANDOFF_PATH);
  const bswP22Handoff = readJson(BSW_P22_HANDOFF_PATH);
  const bswP23Handoff = readJson(BSW_P23_HANDOFF_PATH);
  const bswP23ClosureP25Handoff = readJson(BSW_P23_CLOSURE_P25_HANDOFF_PATH);
  const bswP26P29Handoff = readJson(BSW_P26_P29_HANDOFF_PATH);
  const bswP24P25ChildClosureHandoff = readJson(BSW_P24_P25_CHILD_CLOSURE_PATH);
  const bswP30P33Handoff = readJson(BSW_P30_P33_HANDOFF_PATH);
  const bswP34P37Handoff = readJson(BSW_P34_P37_HANDOFF_PATH);
  assert.ok(descriptorValid(register), 'Berlin source-register descriptor mismatch');
  assert.ok(descriptorValid(acceptedV1), 'accepted Berlin v1 descriptor mismatch');
  assert.equal(acceptedV1.coverage_summary.programme_analysis_complete, 3);
  assert.equal(rejectedV2.summary.programme_analysis_complete, 12);

  const registerByParty = new Map(register.current_available_final_programme_set.map((item) => [item.party, item]));
  const legacyByParty = new Map(acceptedV1.programmes.map((item) => [item.party, item]));
  const bswIncrement = bswP15P19Materialization(bswLedger, bswP15P19Handoff);
  const bswSuccessor = bswP19ClosureP21Materialization(bswLedger, bswIncrement, bswP19ClosureP21Handoff);
  const bswP22 = bswP22Materialization(bswLedger, bswP22Handoff);
  const bswP23 = bswP23Materialization(bswLedger, bswP23Handoff);
  const bswP23ClosureP25 = bswP23ClosureP25Materialization(bswLedger, bswP23, bswP23ClosureP25Handoff);
  const bswP26P29 = bswP26P29Materialization(bswLedger, bswP26P29Handoff);
  const bswP24P25ChildClosure = bswP24P25ChildClosureMaterialization(bswP23ClosureP25, bswP24P25ChildClosureHandoff);
  const bswP30P33 = bswP30P33Materialization(bswLedger, bswP30P33Handoff);
  const bswP34P37 = bswP34P37Materialization(bswLedger, bswP34P37Handoff);
  const programmes = BINDING_ORDER.map((party, index) => {
    const source = legacyByParty.get(party);
    const registered = registerByParty.get(party);
    assert.ok(source && registered, `${party}: source register or accepted residual entry missing`);
    assert.equal(source.artifact.artifact_id, registered.artifact_id, `${party}: artifact id drift`);
    assert.equal(source.artifact.sha256, registered.sha256, `${party}: artifact SHA drift`);

    const terminalObjects = party === 'BSW'
      ? [...bswProtectedTerminals(source, bswLedger), ...bswPage14Terminals(bswLedger, bswP14Handoff), ...bswIncrement.terminals, ...bswSuccessor.terminals, ...bswP22.terminals, ...bswP24P25ChildClosure.terminals, ...bswP26P29.terminals, ...bswP30P33.terminals, ...bswP34P37.terminals]
      : source.active_source_objects
        .filter((item) => item.status !== 'GENUINE_FACH_REVIEW_REQUIRED')
        .map(normalizedLegacyTerminal);
    const remaining = party === 'BSW'
      ? source.active_source_objects.filter((item) => {
        if (item.object_kind !== 'UNSEGMENTED_PDF_PAGE_REVIEW_SCOPE') return false;
        const page = Number(item.source_locator.match(/PDF page (\d+)/)?.[1]);
        return page >= bswP34P37Handoff.coverage.next_opaque_page_review_envelope_from
          && page <= bswP34P37Handoff.coverage.next_opaque_page_review_envelope_through;
      })
      : source.active_source_objects.filter((item) => item.status === 'GENUINE_FACH_REVIEW_REQUIRED');
    const reviewEnvelopes = remaining.map(reviewEnvelope);
    const reviewObjects = party === 'BSW' ? [...bswP24P25ChildClosure.openObjects, ...bswP34P37.openObjects] : [];
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
        : reviewObjects.length > 0
          ? 'PARTIAL_TERMINAL_WITH_EXACT_OBJECTS_AND_REVIEW_ENVELOPES_OPEN'
        : terminalObjects.length > 0
          ? 'PARTIAL_TERMINAL_WITH_REVIEW_ENVELOPES_OPEN'
          : 'SEGMENTATION_REVIEW_REQUIRED',
      fach_state: isComplete ? 'PROGRAMME_ANALYSIS_COMPLETE' : 'GENUINE_FACH_REVIEW_REQUIRED',
      programme_analysis_complete: isComplete,
      terminal_object_count: terminalObjects.length,
      terminal_status_counts: statusCounts(terminalObjects),
      remaining_review_envelope_count: reviewEnvelopes.length,
      remaining_exact_object_count: reviewObjects.length,
      remaining_review_scope_count: reviewEnvelopes.length + reviewObjects.length,
      terminal_objects: terminalObjects,
      remaining_review_envelopes: reviewEnvelopes,
      remaining_review_objects: reviewObjects,
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
  const remainingExactObjects = programmes.reduce((sum, programme) => sum + programme.remaining_exact_object_count, 0);

  const matrix = {
    schema_version: 'woek-berlin-fach-content-residual-3.2',
    matrix_id: 'BE-FACH-CONTENT-RESIDUAL-2026-V3',
    jurisdiction: 'DE-BE',
    election: 'agh-2026-be',
    issue: 240,
    base_main_commit: '91dce3c60f90c1cab090ac9bd8ab4b3b01c704e1',
    source_as_of: '2026-08-29T00:30:00+02:00',
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
      preservation_rule: 'Reuse only exact terminal Fach objects and finite source-bound residual scopes; BSW physical P1-P33 is source-bound through explicit issue #240 handoffs, P34-P37 are deterministically segmented, the exact P24/P25 child residual is zero, and the exact P34-P37 child residual remains fail-closed.',
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
      {
        handoff_id: bswP15P19Handoff.handoff_id,
        issue_comment_ids: bswP15P19Handoff.batches.map((item) => item.issue_comment_id),
        issue_comment_urls: bswP15P19Handoff.batches.map((item) => item.issue_comment_url),
        path: repoPath(BSW_P15_P19_HANDOFF_PATH),
        file_sha256: fileSha256(BSW_P15_P19_HANDOFF_PATH),
        authoritative_markdown_path: bswP15P19Handoff.authoritative_markdown.path,
        authoritative_markdown_file_sha256: bswP15P19Handoff.authoritative_markdown.file_sha256,
        artifact_id: bswP15P19Handoff.artifact_id,
        artifact_sha256: bswP15P19Handoff.artifact_sha256,
        exact_terminal_object_count: bswIncrement.terminals.length,
        exact_open_child_object_count: bswIncrement.openObjects.length,
        physical_pdf_pages: [15, 16, 17, 18, 19],
      },
      {
        handoff_id: bswP19ClosureP21Handoff.handoff_id,
        issue_comment_ids: bswP19ClosureP21Handoff.batches.map((item) => item.issue_comment_id),
        issue_comment_urls: bswP19ClosureP21Handoff.batches.map((item) => item.issue_comment_url),
        path: repoPath(BSW_P19_CLOSURE_P21_HANDOFF_PATH),
        file_sha256: fileSha256(BSW_P19_CLOSURE_P21_HANDOFF_PATH),
        authoritative_markdown_path: bswP19ClosureP21Handoff.authoritative_markdown.path,
        authoritative_markdown_file_sha256: bswP19ClosureP21Handoff.authoritative_markdown.file_sha256,
        artifact_id: bswP19ClosureP21Handoff.artifact_id,
        artifact_sha256: bswP19ClosureP21Handoff.artifact_sha256,
        exact_terminal_object_count: bswSuccessor.terminals.length,
        exact_open_child_object_count: 0,
        physical_pdf_pages: [19, 20, 21],
      },
      {
        handoff_id: bswP22Handoff.handoff_id,
        issue_comment_ids: bswP22Handoff.batches.map((item) => item.issue_comment_id),
        issue_comment_urls: bswP22Handoff.batches.map((item) => item.issue_comment_url),
        controller_issue_comment_id: bswP22Handoff.controller.issue_comment_id,
        controller_issue_comment_url: bswP22Handoff.controller.issue_comment_url,
        path: repoPath(BSW_P22_HANDOFF_PATH),
        file_sha256: fileSha256(BSW_P22_HANDOFF_PATH),
        authoritative_markdown_path: bswP22Handoff.authoritative_markdown.path,
        authoritative_markdown_file_sha256: bswP22Handoff.authoritative_markdown.file_sha256,
        artifact_id: bswP22Handoff.artifact_id,
        artifact_sha256: bswP22Handoff.artifact_sha256,
        exact_terminal_object_count: bswP22.terminals.length,
        active_terminal_review_leaf_count: bswP22Handoff.coverage.active_terminal_review_leaf_count,
        exact_open_child_object_count: 0,
        physical_pdf_pages: [22],
        gate: bswP22Handoff.coverage.gate,
      },
      {
        handoff_id: bswP23Handoff.handoff_id,
        issue_comment_ids: bswP23Handoff.batches.map((item) => item.issue_comment_id),
        issue_comment_urls: bswP23Handoff.batches.map((item) => item.issue_comment_url),
        controller_issue_comment_id: bswP23Handoff.controller.issue_comment_id,
        controller_issue_comment_url: bswP23Handoff.controller.issue_comment_url,
        path: repoPath(BSW_P23_HANDOFF_PATH),
        file_sha256: fileSha256(BSW_P23_HANDOFF_PATH),
        authoritative_markdown_path: bswP23Handoff.authoritative_markdown.path,
        authoritative_markdown_file_sha256: bswP23Handoff.authoritative_markdown.file_sha256,
        artifact_id: bswP23Handoff.artifact_id,
        artifact_sha256: bswP23Handoff.artifact_sha256,
        exact_terminal_object_count: bswP23.terminals.length,
        active_terminal_review_leaf_count: bswP23Handoff.coverage.active_terminal_review_leaf_count,
        exact_open_child_object_count: bswP23.openObjects.length,
        physical_pdf_pages: [23],
        gate: bswP23Handoff.coverage.gate,
      },
      {
        handoff_id: bswP23ClosureP25Handoff.handoff_id,
        issue_comment_ids: bswP23ClosureP25Handoff.authoritative_markdowns.map((item) => item.issue_comment_id),
        issue_comment_urls: bswP23ClosureP25Handoff.authoritative_markdowns.map((item) => item.issue_comment_url),
        controller_issue_comment_id: bswP23ClosureP25Handoff.controller.issue_comment_id,
        controller_issue_comment_url: bswP23ClosureP25Handoff.controller.issue_comment_url,
        path: repoPath(BSW_P23_CLOSURE_P25_HANDOFF_PATH),
        file_sha256: fileSha256(BSW_P23_CLOSURE_P25_HANDOFF_PATH),
        authoritative_markdown_paths: bswP23ClosureP25Handoff.authoritative_markdowns.map((item) => item.path),
        authoritative_markdown_file_sha256s: bswP23ClosureP25Handoff.authoritative_markdowns.map((item) => item.file_sha256),
        artifact_id: bswP23ClosureP25Handoff.artifact_id,
        artifact_sha256: bswP23ClosureP25Handoff.artifact_sha256,
        exact_terminal_object_count: bswP23ClosureP25.newTerminalRecordCount,
        exact_open_child_object_count: bswP23ClosureP25.openObjects.length,
        physical_pdf_pages: [23, 24, 25],
        gate: bswP23ClosureP25Handoff.coverage.gate,
      },
      {
        handoff_id: bswP26P29Handoff.handoff_id,
        issue_comment_ids: bswP26P29Handoff.authoritative_markdowns.map((item) => item.issue_comment_id),
        issue_comment_urls: bswP26P29Handoff.authoritative_markdowns.map((item) => item.issue_comment_url),
        controller_issue_comment_id: bswP26P29Handoff.controller.issue_comment_id,
        controller_issue_comment_url: bswP26P29Handoff.controller.issue_comment_url,
        path: repoPath(BSW_P26_P29_HANDOFF_PATH),
        file_sha256: fileSha256(BSW_P26_P29_HANDOFF_PATH),
        authoritative_markdown_paths: bswP26P29Handoff.authoritative_markdowns.map((item) => item.path),
        authoritative_markdown_file_sha256s: bswP26P29Handoff.authoritative_markdowns.map((item) => item.file_sha256),
        artifact_id: bswP26P29Handoff.artifact_id,
        artifact_sha256: bswP26P29Handoff.artifact_sha256,
        exact_terminal_object_count: bswP26P29.newTerminalRecordCount,
        active_terminal_review_leaf_count: bswP26P29Handoff.coverage.active_terminal_review_leaf_count,
        exact_open_child_object_count: bswP26P29Handoff.coverage.new_exact_open_child_object_count,
        physical_pdf_pages: bswP26P29Handoff.coverage.physical_pdf_pages,
        gate: bswP26P29Handoff.coverage.gate,
      },
      {
        handoff_id: bswP24P25ChildClosureHandoff.handoff_id,
        issue_comment_ids: bswP24P25ChildClosureHandoff.authoritative_markdowns.map((item) => item.issue_comment_id),
        issue_comment_urls: bswP24P25ChildClosureHandoff.authoritative_markdowns.map((item) => item.issue_comment_url),
        controller_issue_comment_id: bswP24P25ChildClosureHandoff.controller.issue_comment_id,
        controller_issue_comment_url: bswP24P25ChildClosureHandoff.controller.issue_comment_url,
        path: repoPath(BSW_P24_P25_CHILD_CLOSURE_PATH),
        file_sha256: fileSha256(BSW_P24_P25_CHILD_CLOSURE_PATH),
        authoritative_markdown_paths: bswP24P25ChildClosureHandoff.authoritative_markdowns.map((item) => item.path),
        authoritative_markdown_file_sha256s: bswP24P25ChildClosureHandoff.authoritative_markdowns.map((item) => item.file_sha256),
        artifact_id: bswP24P25ChildClosureHandoff.artifact_id,
        artifact_sha256: bswP24P25ChildClosureHandoff.artifact_sha256,
        exact_terminal_object_count: bswP24P25ChildClosure.closedTerminals.length,
        exact_open_child_object_count: bswP24P25ChildClosure.openObjects.length,
        physical_pdf_pages: [24, 25],
        gate: bswP24P25ChildClosureHandoff.coverage.gate,
      },
      {
        handoff_id: bswP30P33Handoff.handoff_id,
        issue_comment_ids: bswP30P33Handoff.authoritative_markdowns.map((item) => item.issue_comment_id),
        issue_comment_urls: bswP30P33Handoff.authoritative_markdowns.map((item) => item.issue_comment_url),
        controller_issue_comment_id: bswP30P33Handoff.controller.issue_comment_id,
        controller_issue_comment_url: bswP30P33Handoff.controller.issue_comment_url,
        path: repoPath(BSW_P30_P33_HANDOFF_PATH),
        file_sha256: fileSha256(BSW_P30_P33_HANDOFF_PATH),
        authoritative_markdown_paths: bswP30P33Handoff.authoritative_markdowns.map((item) => item.path),
        authoritative_markdown_file_sha256s: bswP30P33Handoff.authoritative_markdowns.map((item) => item.file_sha256),
        artifact_id: bswP30P33Handoff.artifact_id,
        artifact_sha256: bswP30P33Handoff.artifact_sha256,
        exact_terminal_object_count: bswP30P33.newTerminalRecordCount,
        active_terminal_review_leaf_count: bswP30P33Handoff.coverage.active_terminal_review_leaf_count,
        exact_open_child_object_count: 0,
        physical_pdf_pages: bswP30P33Handoff.coverage.physical_pdf_pages,
        gate: bswP30P33Handoff.coverage.gate,
      },
      {
        handoff_id: bswP34P37Handoff.handoff_id,
        issue_comment_ids: bswP34P37Handoff.authoritative_markdowns.map((item) => item.issue_comment_id),
        issue_comment_urls: bswP34P37Handoff.authoritative_markdowns.map((item) => item.issue_comment_url),
        controller_issue_comment_id: bswP34P37Handoff.controller.issue_comment_id,
        controller_issue_comment_url: bswP34P37Handoff.controller.issue_comment_url,
        path: repoPath(BSW_P34_P37_HANDOFF_PATH),
        file_sha256: fileSha256(BSW_P34_P37_HANDOFF_PATH),
        authoritative_markdown_paths: bswP34P37Handoff.authoritative_markdowns.map((item) => item.path),
        authoritative_markdown_file_sha256s: bswP34P37Handoff.authoritative_markdowns.map((item) => item.file_sha256),
        artifact_id: bswP34P37Handoff.artifact_id,
        artifact_sha256: bswP34P37Handoff.artifact_sha256,
        exact_terminal_object_count: bswP34P37.newTerminalRecordCount,
        active_terminal_review_leaf_count: bswP34P37Handoff.coverage.active_terminal_review_leaf_count,
        exact_open_child_object_count: bswP34P37.openObjects.length,
        physical_pdf_pages: bswP34P37Handoff.coverage.segmented_physical_pages,
        gate: bswP34P37Handoff.coverage.gate,
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
      segmentation_state: ['SOURCE_OBJECT_BOUNDARIES_TERMINAL', 'PARTIAL_TERMINAL_WITH_REVIEW_ENVELOPES_OPEN', 'PARTIAL_TERMINAL_WITH_EXACT_OBJECTS_AND_REVIEW_ENVELOPES_OPEN', 'SEGMENTATION_REVIEW_REQUIRED'],
      fach_state: ['PROGRAMME_ANALYSIS_COMPLETE', 'GENUINE_FACH_REVIEW_REQUIRED'],
      terminal_object_status: ['EXPLICIT_FACH_APPROVED', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'NON_EFFECT_CONTEXT_REVIEWED', 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'],
      invariant: 'Source or segmentation closure never implies Fach terminality.',
    },
    review_envelope_contract: {
      meaning: 'A physical PDF page is a bounded review envelope, not an assertion that the page or every passage on it is effect-bearing.',
      next_step: 'Segment source-bound; classify context versus effect objects; consume only explicit object-level Fach or object-specific RNAA handoffs.',
      effect_object_count_before_segmentation: null,
      missing_effect_object_count_interpretation: 'UNKNOWN_NOT_ZERO',
      exact_source_bound_effect_objects_already_identified: remainingExactObjects,
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
      remaining_genuine_fach_review_required: remainingReviewEnvelopes + remainingExactObjects,
      remaining_review_scope_count: remainingReviewEnvelopes + remainingExactObjects,
      remaining_page_review_envelopes: remainingReviewEnvelopes,
      remaining_exact_effect_objects_identified: remainingExactObjects,
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
