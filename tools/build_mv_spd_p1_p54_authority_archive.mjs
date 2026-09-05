#!/usr/bin/env node
/**
 * Freeze and verify the authoritative MV-SPD P1-P54 Fach predecessor chain.
 *
 * This is deliberately a provenance/materialisation tool, not a Fach classifier.
 * It copies already-authored #240 comments byte-for-byte, binds them to the
 * frozen source pages, and records the finite early pointer set that still
 * cannot be reconstructed without inventing Fach.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = 'docs/parlament/audits/mv-spd-p1-p54-authorities';
const INDEX = 'woek-parlament-app/data/state-programmes/fach-reviews/mecklenburg-vorpommern-2026-spd-p1-p54-authority-index-v1.json';
const LEDGER = 'woek-parlament-app/data/state-programmes/fach-reviews/mecklenburg-vorpommern-2026-spd-v1';
const ARTIFACT_SHA256 = 'b2ed331e3bd89b93379df2f9a6adc5d3d10ddf635b0688673bc20c61cdca09bc';
const sha256 = value => createHash('sha256').update(value).digest('hex');

// Order is semantic/source order. A later entry for the same page is an
// explicit correction/supplement, never an invitation to infer a rewrite.
const AUTHORITIES = [
  { id: 5468200571, pages: [4], role: 'BASE' },
  { id: 5468017394, pages: [4, 5], role: 'SOURCE_REPAIR_SUPPLEMENT' },
  { id: 5468206207, pages: [5, 6], role: 'CROSS_PAGE_REPAIR' },
  { id: 5468534898, pages: [5], role: 'BASE_PART_A' },
  { id: 5468538903, pages: [5], role: 'BASE_PART_B' },
  { id: 5468551794, pages: [6], role: 'BASE' },
  { id: 5468559686, pages: [7], role: 'BASE' },
  { id: 5468573576, pages: [7], role: 'AUTHORITATIVE_CORRECTION' },
  { id: 5468591744, pages: [7, 8], role: 'CROSS_PAGE_REPAIR' },
  { id: 5468608195, pages: [8], role: 'BASE_PART_A' },
  { id: 5468613657, pages: [8], role: 'BASE_PART_B_AND_CROSS_PAGE_REPAIR' },
  { id: 5468787293, pages: [9], role: 'BASE' },
  { id: 5469051242, pages: [10], role: 'AUTHORITATIVE_FINAL' },
  { id: 5468912388, pages: [11], role: 'BASE' },
  { id: 5468925837, pages: [12], role: 'BASE' },
  { id: 5468936860, pages: [13], role: 'BASE' },
  { id: 5469063747, pages: [14], role: 'BASE' },
  { id: 5469075698, pages: [15], role: 'BASE' },
  { id: 5469369152, pages: [16], role: 'BASE' },
  { id: 5469389234, pages: [17], role: 'BASE_AND_CROSS_PAGE_REPAIR' },
  { id: 5469411507, pages: [18], role: 'BASE_AND_CROSS_PAGE_REPAIR' },
  { id: 5469689378, pages: [19], role: 'BASE_AND_CROSS_PAGE_REPAIR' },
  { id: 5469731624, pages: [20], role: 'BASE' },
  { id: 5469992417, pages: [21], role: 'BASE_AND_CROSS_PAGE_REPAIR' },
  { id: 5470006055, pages: [22], role: 'BASE_AND_CROSS_PAGE_REPAIR' },
  { id: 5470034669, pages: [23], role: 'BASE' },
  { id: 5470295396, pages: [24], role: 'BASE' },
  { id: 5470328507, pages: [25], role: 'BASE' },
  { id: 5473226759, pages: [25], role: 'SOURCE_INTEGRITY_SUPPLEMENT' },
  { id: 5471429850, pages: [26], role: 'AUTHORITATIVE_CURRENT' },
  { id: 5470686137, pages: [27], role: 'BASE' },
  { id: 5470733789, pages: [28], role: 'BASE' },
  { id: 5470734610, pages: [28], role: 'PARENT_COUNT_CORRECTION' },
  { id: 5470757122, pages: [29], role: 'BASE' },
  { id: 5470854399, pages: [30, 31], role: 'BASE_AND_CROSS_PAGE_REPAIR' },
  { id: 5471218268, pages: [31], role: 'BASE' },
  { id: 5472325123, pages: [32], role: 'AUTHORITATIVE_CURRENT' },
  { id: 5472336683, pages: [33], role: 'AUTHORITATIVE_CURRENT' },
  { id: 5471926630, pages: [34], role: 'BASE' },
  { id: 5472038362, pages: [35], role: 'BASE' },
  { id: 5472071378, pages: [36], role: 'BASE_AND_CROSS_PAGE_REPAIR' },
  { id: 5472194935, pages: [37], role: 'BASE' },
  { id: 5472247303, pages: [38], role: 'BASE' },
  { id: 5472711262, pages: [39], role: 'BASE' },
  { id: 5473079348, pages: [40], role: 'BASE' },
  { id: 5473113601, pages: [41], role: 'BASE' },
  { id: 5473137802, pages: [42], role: 'BASE' },
  { id: 5473160158, pages: [43], role: 'BASE' },
  { id: 5473288129, pages: [44, 45], role: 'BASE_AND_CROSS_PAGE_REPAIR' },
  { id: 5473317613, pages: [45], role: 'BASE' },
  { id: 5473408958, pages: [46, 47], role: 'BASE_AND_CROSS_PAGE_REPAIR' },
  { id: 5473432439, pages: [47, 48], role: 'BASE_AND_CROSS_PAGE_REPAIR' },
  { id: 5473446772, pages: [48], role: 'BASE' },
  { id: 5475338228, pages: [49], role: 'AUTHORITATIVE_CURRENT' },
  { id: 5475371000, pages: [50, 51], role: 'AUTHORITATIVE_CURRENT_AND_CROSS_PAGE_REPAIR' },
  { id: 5476008740, pages: [51, 52], role: 'AUTHORITATIVE_CURRENT_AND_CROSS_PAGE_REPAIR' },
  { id: 5474919799, pages: [52], role: 'BASE_AFTER_RECONCILIATION' },
  { id: 5474946653, pages: [53, 54], role: 'BASE_AND_CROSS_PAGE_REPAIR' },
  { id: 5543580667, pages: [53], role: 'AUTHORITATIVE_SOURCE_BINDING_CORRECTION' },
  { id: 5476819703, pages: [54], role: 'BASE_AFTER_RECONCILIATION' },
];

const FINITE_AUTHORITIES = [
  { id: 5554389664, pages: [2, 3, 4], role: 'FINITE_OBJECT_SPECIFIC_REAUTHORISATION_EXCEPTION' },
];

const SUPERSEDED = [
  { id: 5468809728, replacement: 5469051242, reason: 'VOID_P10' },
  { id: 5468838223, replacement: 5469051242, reason: 'VOID_P10' },
  { id: 5470596188, replacement: 5471429850, reason: 'OLDER_P26_TREATMENT' },
  { id: 5471794954, replacement: 5472325123, reason: 'OLDER_P32_TREATMENT' },
  { id: 5471829790, replacement: 5472336683, reason: 'OLDER_P33_TREATMENT' },
  { id: 5471890178, replacement: 5472336683, reason: 'OLDER_P33_TREATMENT' },
  { id: 5473907511, replacement: 5475338228, reason: 'OLDER_P49_TREATMENT' },
  { id: 5474345121, replacement: 5475371000, reason: 'OLDER_P50_TREATMENT' },
  { id: 5474880384, replacement: 5476008740, reason: 'OLDER_P51_TREATMENT' },
];

const CONTROLLERS = [5472678228, 5473248079, 5476705244, 5476822553, 5544455946, 5550258669, 5554390846];
const PRIOR_UNRESOLVED_SOURCE_UNITS = [
  'MV-SPD-2026-SU-00010',
  'MV-SPD-2026-SU-00017',
  'MV-SPD-2026-SU-00018',
  'MV-SPD-2026-SU-00019',
  'MV-SPD-2026-SU-00020',
  'MV-SPD-2026-SU-00021',
  'MV-SPD-2026-SU-00022',
  'MV-SPD-2026-SU-00024',
  'MV-SPD-2026-SU-00025',
  'MV-SPD-2026-SU-00028',
  'MV-SPD-2026-SU-00033',
];
const UNRESOLVED_SOURCE_UNITS = [];
const FINITE_REAUTHORISATION = {
  comment_id: 5554389664,
  archived_file_sha256: 'd22b6d10be180a501c1cca8c2dddc76b860c69ffe85ac66a37c4936eb4b0408b',
  terminal_fach_state: 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
  object_ids: [
    'MV-SPD-2026-SU-00008-A01',
    'MV-SPD-2026-SU-00010-A01',
    'MV-SPD-2026-SU-00010-A02',
    'MV-SPD-2026-SU-00012-A01',
    'MV-SPD-2026-SU-00015-A01',
    'MV-SPD-2026-SU-00017-A01',
    'MV-SPD-2026-SU-00017-A02',
    'MV-SPD-2026-SU-00017-A03',
    'MV-SPD-2026-SU-00018-A01',
    'MV-SPD-2026-SU-00018-A02',
    'MV-SPD-2026-SU-00018-A03',
    'MV-SPD-2026-SU-00022-A01',
    'MV-SPD-2026-SU-00026-A01',
    'MV-SPD-2026-SU-00033-A01',
    'MV-SPD-2026-SU-00033-A02',
  ],
};

// These roles are not inferred from programme prose. Each entry records an
// explicit sentence/section in the frozen authoritative comment where the
// original mechanical atom is declared a version parent, an RNAA object, or
// carries a complete approved Fach field set without repeating the terminal
// token literally. Keeping the exceptional set finite also prevents a loose
// proximity parser from silently deciding Fach.
const EXPLICIT_ROLE_BINDINGS = {
  'MV-SPD-2026-SU-00152-A01': [5469389234, 'NON_EFFECT_PROGRAMME_RESOURCE_AND_CAUSAL_OUTCOME_CLAIM_REVIEWED'],
  'MV-SPD-2026-SU-00152-A02': [5469389234, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00152-A04': [5469389234, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00153-A01': [5469389234, 'NON_EFFECT_RESILIENCE_GOAL_REVIEWED'],
  'MV-SPD-2026-SU-00154-A01': [5469389234, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00154-A02': [5469389234, 'NON_EFFECT_SYSTEM_AND_GRID_BENEFIT_DESIGN_SAFEGUARD_REVIEWED'],
  'MV-SPD-2026-SU-00163-A01': [5469411507, 'DUPLICATE_RESTATEMENT_ZERO_COUNT'],
  'MV-SPD-2026-SU-00171-A01': [5469689378, 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'],
  'MV-SPD-2026-SU-00216-A02': [5470295396, 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'],
  'MV-SPD-2026-SU-00218-A01': [5470295396, 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'],
  'MV-SPD-2026-SU-00218-A02': [5470295396, 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'],
  'MV-SPD-2026-SU-00218-A04': [5470295396, 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'],
  'MV-SPD-2026-SU-00236-A03': [5471429850, 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'],
  'MV-SPD-2026-SU-00236-A04': [5471429850, 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'],
  'MV-SPD-2026-SU-00300-A01': [5472325123, 'SOURCE_ATOM_RECLASSIFIED_VERSIONED'],
  'MV-SPD-2026-SU-00349-A01': [5472194935, 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'],
  'MV-SPD-2026-SU-00364-A02': [5472711262, 'EXPLICIT_FACH_APPROVED'],
  'MV-SPD-2026-SU-00368-A01': [5472711262, 'NON_EFFECT_EXPECTED_OUTCOME_CLAIM_REVIEWED'],
  'MV-SPD-2026-SU-00371-A01': [5472711262, 'EXPLICIT_FACH_APPROVED'],
  'MV-SPD-2026-SU-00371-A02': [5472711262, 'EXPLICIT_FACH_APPROVED'],
  'MV-SPD-2026-SU-00373-A01': [5473079348, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00375-A01': [5473079348, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00386-A01': [5473113601, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00387-A01': [5473113601, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00398-A01': [5473137802, 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'],
  'MV-SPD-2026-SU-00398-A02': [5473137802, 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'],
  'MV-SPD-2026-SU-00399-A01': [5473137802, 'SOURCE_ATOM_RECLASSIFIED_VERSIONED'],
  'MV-SPD-2026-SU-00400-A01': [5473137802, 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'],
  'MV-SPD-2026-SU-00401-A01': [5473137802, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00401-A02': [5473137802, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00403-A02': [5473137802, 'SOURCE_FRAGMENT_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00405-A01': [5473160158, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00409-A01': [5473160158, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00409-A02': [5473160158, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00419-A01': [5473288129, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00425-A01': [5473288129, 'SOURCE_FRAGMENT_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00439-A01': [5473408958, 'NON_EFFECT_DEMOCRATIC_RESILIENCE_GOAL_REVIEWED'],
  'MV-SPD-2026-SU-00441-A01': [5473408958, 'NON_EFFECT_SERVICE_MODEL_GOAL_REVIEWED'],
  'MV-SPD-2026-SU-00443-A01': [5473408958, 'SOURCE_FRAGMENT_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00444-A01': [5473432439, 'NON_EFFECT_SECURITY_EQUAL_ACCESS_AND_RIGHTS_GOAL_REVIEWED'],
  'MV-SPD-2026-SU-00444-A02': [5473432439, 'NON_EFFECT_SERVICE_AVAILABILITY_AND_RULE_OF_LAW_GOAL_REVIEWED'],
  'MV-SPD-2026-SU-00446-A02': [5473432439, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00447-A01': [5473432439, 'NON_EFFECT_AI_EFFICIENCY_AND_CAPABILITY_GOAL_REVIEWED'],
  'MV-SPD-2026-SU-00448-A01': [5473432439, 'SOURCE_FRAGMENT_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00457-A01': [5473446772, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00457-A02': [5473446772, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00464-A03': [5475338228, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00464-A04': [5475338228, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00466-A01': [5475338228, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00467-A01': [5475338228, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00469-A01': [5475371000, 'SOURCE_FRAGMENT_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00473-A02': [5475371000, 'NON_EFFECT_CURRENT_OR_EXISTING_PARTICIPATION_CLAIM_REVIEWED'],
  'MV-SPD-2026-SU-00484-A01': [5476008740, 'SOURCE_ATOM_VERSIONED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00486-A01': [5474919799, 'CROSSPAGE_FRAGMENT_SUPERSEDED_ZERO_COUNT'],
  'MV-SPD-2026-SU-00488-A02': [5474919799, 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'],
  'MV-SPD-2026-SU-00493-A01': [5474946653, 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'],
  'MV-SPD-2026-SU-00494-A02': [5474946653, 'NON_EFFECT_EXPECTED_DIGITAL_SERVICE_OUTCOME_FRAME_REVIEWED'],
  'MV-SPD-2026-SU-00498-A01': [5474946653, 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'],
  'MV-SPD-2026-SU-00500-A01': [5474946653, 'NON_EFFECT_HISTORICAL_OR_CURRENT_POLICY_CLAIM_REVIEWED'],
  'MV-SPD-2026-SU-00506-A01': [5476819703, 'SOURCE_FRAGMENT_VERSIONED_ZERO_COUNT'],
};

// Only explicit corrections in the authoritative chain may remove a proposed
// generated object. These three IDs are called VOID/stale in the cited later
// correction comments; no semantic judgement is made here.
const VOID_GENERATED_IDS = new Set([
  'MV-SPD-2026-SU-00056-C00-06709b54baba',
  'MV-SPD-2026-SU-00056-C01-96b1087fdc72',
  'MV-SPD-2026-SU-00058-C00-7b3a7ba78a7f',
  'MV-SPD-2026-SU-00495-C02-b73986b3503e',
]);

// Four P39 children are grouped under an explicit approved-leaves heading and
// consequently do not repeat the terminal token next to every ID. The P53
// replacement was authorised text/hash/role-exactly but left stable ID
// generation to CodeX. These bindings only transcribe those declarations.
const GENERATED_ROLE_BINDINGS = {
  'MV-SPD-2026-SU-00364-A01-C02-26c7ef135a7d': [5472711262, 'EXPLICIT_FACH_APPROVED'],
  'MV-SPD-2026-SU-00366-C01-878c576f4de2': [5472711262, 'EXPLICIT_FACH_APPROVED'],
  'MV-SPD-2026-SU-00366-C02-9269cc968018': [5472711262, 'EXPLICIT_FACH_APPROVED'],
  'MV-SPD-2026-SU-00367-A01-C03-a75cce26b748': [5472711262, 'EXPLICIT_FACH_APPROVED'],
  'MV-SPD-2026-SU-00495-C02-800fbf3fffa1': [5543580667, 'NON_EFFECT_SYSTEM_ROLE_AND_GOAL_FRAME_REVIEWED'],
  'MV-SPD-2026-XP51P52-C01-bc1b8c067be6': [5476008740, 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'],
};

const MANUAL_GENERATED_TEXT = {
  'MV-SPD-2026-SU-00495-C02-800fbf3fffa1': 'Kommunale Energieinfrastruktur wird zunehmend zu einer strategischen Aufgabe, die Versorgungssicherheit, Klimaschutz und wirtschaftliche Entwicklung verbindet.',
  'MV-SPD-2026-XP51P52-C01-bc1b8c067be6': 'Dort, wo wir auf kommunaler Ebene Verantwortung tragen, werden wir die Umsetzung konsequent unterstützen und dafür sorgen, dass Gleichstellungsbeauftragte wirksam arbeiten können.',
};

const MANUAL_GENERATED_PARENTS = {
  'MV-SPD-2026-XP51P52-C01-bc1b8c067be6': ['MV-SPD-2026-SU-00484', 'MV-SPD-2026-SU-00486'],
};

const GENERATED_ID_PATTERN = /MV-SPD-2026-(?:(?:SU-[0-9]{5})|(?:XP[0-9]+P[0-9]+))(?:-[A-Z0-9]+)*-[a-f0-9]{12}(?![a-f0-9])/g;

function validTerminalRole(role) {
  return role === 'EXPLICIT_FACH_APPROVED'
    || role === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON'
    || /^(?:NON_EFFECT|SOURCE|COMPOUND|FRAGMENT|CROSSPAGE|DUPLICATE|PARENT)_[A-Z0-9_]+$/.test(role);
}

function finiteReauthorisationDecisions(body) {
  const decisions = new Map();
  const sectionPattern = /### \d+\. `([^`]+)`\n([\s\S]*?)(?=\n### \d+\. `|\n## Closure \/ materialisation contract)/g;
  for (const match of body.matchAll(sectionPattern)) {
    const objectId = match[1];
    if (!FINITE_REAUTHORISATION.object_ids.includes(objectId)) continue;
    const section = match[2];
    const field = (pattern, label) => {
      const value = section.match(pattern)?.[1];
      assert.ok(value, `${objectId}: missing ${label} in finite Fach authority`);
      return value;
    };
    const decision = {
      object_id: objectId,
      source_locator: field(/- locator: `([^`]+)`/, 'locator'),
      source_text: field(/- exact text: `([^`]+)`/, 'exact text'),
      source_text_sha256: field(/- SHA-256: `([a-f0-9]{64})`/, 'SHA-256'),
      terminal_fach_state: field(/- `terminal_fach_state = ([A-Z0-9_]+)`/, 'terminal Fach state'),
      exact_reason_code: field(/- `exact_reason_code = ([A-Z0-9_]+)`/, 'exact reason code'),
      exact_reason: field(/- exact reason: ([^\n]+)/, 'exact reason'),
    };
    assert.equal(decision.terminal_fach_state, FINITE_REAUTHORISATION.terminal_fach_state, `${objectId}: unauthorised terminal role`);
    assert.equal(sha256(decision.source_text), decision.source_text_sha256, `${objectId}: authority text/hash mismatch`);
    decisions.set(objectId, decision);
  }
  assert.deepEqual([...decisions.keys()], FINITE_REAUTHORISATION.object_ids, 'FINITE_REAUTHORISATION_EXACT_ID_SET_DRIFT');
  return decisions;
}

function sourceRecords() {
  return fs.readdirSync(path.join(ROOT, LEDGER)).sort()
    .filter(name => /^(source-units|effect-atoms)-/.test(name))
    .flatMap(name => JSON.parse(fs.readFileSync(path.join(ROOT, LEDGER, name), 'utf8')).records
      .filter(row => row.pdf_page <= 54)
      .map(row => ({
        object_id: row.atom_id ?? row.source_unit_id,
        source_unit_id: row.source_unit_id,
        source_page: row.pdf_page,
        source_locator: row.source_locator,
        source_text: row.policy_action ?? row.source_text_normalized,
        source_text_sha256: row.policy_action_sha256 ?? row.source_text_sha256,
        source_object_kind: row.atom_id ? 'SOURCE_ATOM' : 'SOURCE_UNIT',
        mechanical_source_role: row.classification ?? null,
        mechanical_terminal_status: row.terminal_status ?? null,
      })));
}

function apiComment(id) {
  for (const kind of ['authority', 'superseded', 'controller']) {
    const localPath = path.join(ROOT, markdownPath(kind, id));
    if (fs.existsSync(localPath)) {
      return {
        id,
        html_url: `https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-${id}`,
        body: fs.readFileSync(localPath, 'utf8').replace(/\n$/, ''),
      };
    }
  }
  return JSON.parse(execFileSync('gh', ['api', `repos/sustynats/wirkungsoekonomie.de/issues/comments/${id}`], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }));
}

function markdownPath(kind, id) {
  return `${OUT_DIR}/${kind}-${id}.md`;
}

function bindingEvidence(record, pageAuthorities, commentsById) {
  const results = [];
  const shortId = record.object_id.replace('MV-SPD-2026-', '');
  const patterns = [record.object_id, shortId, shortId.replace('SU-', 'SU'), record.source_text_sha256];
  if (record.source_text.length >= 24) patterns.push(record.source_text);
  const rolePatterns = [
    /terminal_(?:fach_state|role)\s*=\s*`?([A-Z][A-Z0-9_]+)/g,
    /(?:→|becomes|wird)\s*`([A-Z][A-Z0-9_]+)`/g,
    /(?:terminal role|terminal state|role)\s*:\s*`?([A-Z][A-Z0-9_]+)/gi,
    /(?:^|\n)\s*(?:-\s*)?`([A-Z][A-Z0-9_]+)`(?:\s|[.;,])/g,
    /(?:^|\n)\s*(?:-\s*)?(?:→|=>)\s*([A-Z][A-Z0-9_]+)(?:\s|[.;,])/g,
  ];
  for (const authority of pageAuthorities) {
    const body = commentsById.get(authority.id).body;
    const positions = [];
    for (const pattern of patterns) {
      let from = 0;
      while (pattern && (from = body.indexOf(pattern, from)) !== -1) {
        positions.push({ pattern: pattern === record.source_text ? 'EXACT_TEXT' : pattern === record.source_text_sha256 ? 'SHA256' : 'OBJECT_ID', position: from });
        from += Math.max(pattern.length, 1);
      }
    }
    for (const match of positions) {
      const start = Math.max(0, match.position - 350);
      const end = Math.min(body.length, match.position + 1800);
      const window = body.slice(start, end);
      const roles = [];
      for (const regex of rolePatterns) {
        regex.lastIndex = 0;
        for (let found; (found = regex.exec(window));) {
          const distance = Math.abs((start + found.index) - match.position);
          if (distance <= 1200 && validTerminalRole(found[1])) roles.push({ role: found[1], distance });
        }
      }
      roles.sort((a, b) => a.distance - b.distance || a.role.localeCompare(b.role));
      results.push({ comment_id: authority.id, authority_role: authority.role, match_kind: match.pattern, matched_at: match.position, nearest_terminal_role: roles[0]?.role ?? null, terminal_role_distance: roles[0]?.distance ?? null });
    }
  }
  const authorityOrder = new Map(pageAuthorities.map((authority, index) => [authority.id, index]));
  const precedence = results
    .filter(result => result.nearest_terminal_role && result.terminal_role_distance <= 300)
    .sort((a, b) => (authorityOrder.get(b.comment_id) - authorityOrder.get(a.comment_id))
      || a.terminal_role_distance - b.terminal_role_distance
      || a.matched_at - b.matched_at)[0];
  return { matches: results, extracted_terminal_role: precedence?.nearest_terminal_role ?? null, extracted_from_comment_id: precedence?.comment_id ?? null };
}

function markdownTextCandidates(body) {
  const candidates = new Set();
  const add = value => {
    const cleaned = value.trim()
      .replace(/^\*\*|\*\*$/g, '')
      .replace(/^`|`[.,;:]?$/g, '')
      .replace(/^“|”$/g, '')
      .trim();
    if (cleaned.length >= 3) candidates.add(cleaned);
  };
  for (const match of body.matchAll(/`([^`\n]+)`/g)) add(match[1]);
  for (const line of body.split('\n')) {
    add(line.replace(/^\s*(?:[-*>]|\d+\.)+\s*/, ''));
    add(line.replace(/^.*?(?:exact (?:cross-page |repaired |clean |source )?(?:text|sentence|clause|policy action)|text|clause)\s*:\s*/i, '').replace(/^[-*> ]+/, ''));
    for (const cell of line.split('|')) add(cell);
  }
  return [...candidates];
}

function exactSpanByHashPrefix(text, prefix) {
  const bounds = [0];
  for (let index = 1; index < text.length; index++) {
    if (/\s/.test(text[index - 1]) || /\s/.test(text[index]) || /[.!?;:,()„“"/–—-]/.test(text[index - 1]) || /[.!?;:,()„“"/–—-]/.test(text[index])) bounds.push(index);
  }
  bounds.push(text.length);
  for (let start = 0; start < bounds.length; start++) {
    for (let end = start + 1; end < bounds.length; end++) {
      const candidate = text.slice(bounds[start], bounds[end]).trim();
      if (candidate && sha256(candidate).startsWith(prefix)) return candidate;
    }
  }
  return null;
}

function generatedRecords(rawRecords, commentsById) {
  const originals = new Map(rawRecords.map(record => [record.object_id, record]));
  const sourceUnits = new Map(rawRecords.filter(record => record.source_object_kind === 'SOURCE_UNIT').map(record => [record.object_id, record]));
  const candidateById = new Map();
  for (const [authorityIndex, authority] of AUTHORITIES.entries()) {
    const body = commentsById.get(authority.id).body;
    const textCandidates = markdownTextCandidates(body);
    for (const match of body.matchAll(GENERATED_ID_PATTERN)) {
      const objectId = match[0];
      if (VOID_GENERATED_IDS.has(objectId)) continue;
      const prefix = objectId.slice(-12);
      let sourceText = textCandidates.find(text => sha256(text).startsWith(prefix)) ?? null;
      const primarySourceUnitId = objectId.match(/MV-SPD-2026-SU-[0-9]{5}/)?.[0] ?? null;
      const directOriginalId = objectId.replace(/-[a-f0-9]{12}$/, '');
      if (!sourceText && originals.get(directOriginalId)?.source_text_sha256.startsWith(prefix)) sourceText = originals.get(directOriginalId).source_text;
      if (!sourceText && primarySourceUnitId && sourceUnits.has(primarySourceUnitId)) sourceText = exactSpanByHashPrefix(sourceUnits.get(primarySourceUnitId).source_text, prefix);
      if (!sourceText) continue;
      const validRoles = [...body.matchAll(/[A-Z][A-Z0-9_]{5,}/g)]
        .filter(role => validTerminalRole(role[0]))
        .map(role => ({ role: role[0], position: role.index }));
      const nearestRole = validRoles
        .map(role => ({ ...role, distance: role.position - match.index }))
        .filter(role => role.distance >= 0 && role.distance <= 2600)
        .sort((left, right) => left.distance - right.distance)[0];
      const explicit = GENERATED_ROLE_BINDINGS[objectId];
      const role = explicit?.[1] ?? nearestRole?.role ?? null;
      const roleCommentId = explicit?.[0] ?? authority.id;
      if (!role) continue;
      const evidenceStart = Math.max(0, match.index - 160);
      const evidenceEnd = Math.min(body.length, match.index + Math.max(nearestRole?.distance ?? 0, 800) + 1000);
      const source = primarySourceUnitId ? sourceUnits.get(primarySourceUnitId) : null;
      const record = {
        object_id: objectId,
        source_unit_id: primarySourceUnitId,
        source_page: authority.pages[0],
        source_pages: authority.pages,
        source_locator: source?.source_locator ?? `cross-page:${authority.pages.join('-')}`,
        source_text: sourceText,
        source_text_sha256: sha256(sourceText),
        source_object_kind: 'DETERMINISTIC_AUTHORISED_EXACT_SPAN_OR_REPAIR',
        controlling_comment_ids: [roleCommentId],
        authority_resolution_status: 'LOSSLESS_AUTHORITATIVE_GENERATED_OBJECT_ROLE_BOUND',
        terminal_role: role,
        counts_as_effect_object: role === 'EXPLICIT_FACH_APPROVED' || role === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
        terminal_role_authority_comment_id: roleCommentId,
        terminal_role_binding_method: explicit ? 'FINITE_EXPLICIT_COMMENT_SECTION_BINDING' : 'AUTHORITATIVE_COMMENT_TOKEN_BINDING',
        authority_binding_evidence: [{
          comment_id: authority.id,
          matched_at: match.index,
          evidence_start: evidenceStart,
          evidence_end: evidenceEnd,
          evidence_sha256: sha256(body.slice(evidenceStart, evidenceEnd)),
        }],
      };
      const previous = candidateById.get(objectId);
      if (!previous || authorityIndex > previous.authorityIndex) candidateById.set(objectId, { authorityIndex, record });
    }
  }
  for (const [objectId, text] of Object.entries(MANUAL_GENERATED_TEXT)) {
    const [commentId, role] = GENERATED_ROLE_BINDINGS[objectId];
    const authority = AUTHORITIES.find(item => item.id === commentId);
    const sourceUnitId = objectId.match(/MV-SPD-2026-SU-[0-9]{5}/)?.[0] ?? MANUAL_GENERATED_PARENTS[objectId]?.[0];
    const source = sourceUnits.get(sourceUnitId);
    assert.equal(sha256(text).slice(0, 12), objectId.slice(-12), `${objectId}: generated ID hash drift`);
    const body = commentsById.get(commentId).body;
    assert.ok(body.includes(text), `${objectId}: authorised exact text absent`);
    candidateById.set(objectId, { authorityIndex: AUTHORITIES.indexOf(authority), record: {
      object_id: objectId,
      source_unit_id: sourceUnitId,
      source_page: authority.pages[0],
      source_pages: authority.pages,
      source_locator: source.source_locator,
      source_text: text,
      source_text_sha256: sha256(text),
      source_object_kind: 'DETERMINISTIC_AUTHORISED_EXACT_SPAN_OR_REPAIR',
      controlling_comment_ids: [commentId],
      authority_resolution_status: 'LOSSLESS_AUTHORITATIVE_GENERATED_OBJECT_ROLE_BOUND',
      terminal_role: role,
      counts_as_effect_object: false,
      terminal_role_authority_comment_id: commentId,
      terminal_role_binding_method: 'FINITE_EXPLICIT_COMMENT_SECTION_BINDING',
      authority_binding_evidence: [{ comment_id: commentId, match_kind: 'EXACT_TEXT_AND_HASH' }],
      parent_object_ids: MANUAL_GENERATED_PARENTS[objectId],
    }});
  }
  const generated = [...candidateById.values()].map(item => item.record).sort((left, right) => left.object_id.localeCompare(right.object_id));
  for (const record of generated) {
    assert.equal(record.source_text_sha256.slice(0, 12), record.object_id.slice(-12), `${record.object_id}: generated source hash/ID mismatch`);
    const directParent = record.object_id.replace(/-[a-f0-9]{12}$/, '');
    if (!record.parent_object_ids && originals.has(directParent)) record.parent_object_ids = [directParent];
    else if (!record.parent_object_ids && record.source_unit_id && originals.has(record.source_unit_id)) record.parent_object_ids = [record.source_unit_id];
  }
  return generated;
}

function writeArchive() {
  fs.mkdirSync(path.join(ROOT, OUT_DIR), { recursive: true });
  const all = [
    ...AUTHORITIES.map(item => ({ ...item, kind: 'authority' })),
    ...FINITE_AUTHORITIES.map(item => ({ ...item, kind: 'authority' })),
    ...SUPERSEDED.map(item => ({ ...item, kind: 'superseded' })),
    ...CONTROLLERS.map(id => ({ id, kind: 'controller' })),
  ];
  const seen = new Map();
  for (const item of all) {
    if (!seen.has(item.id)) seen.set(item.id, apiComment(item.id));
    const comment = seen.get(item.id);
    fs.writeFileSync(path.join(ROOT, markdownPath(item.kind, item.id)), comment.body.endsWith('\n') ? comment.body : `${comment.body}\n`);
  }
  const commentsById = seen;
  const finiteAuthority = commentsById.get(FINITE_REAUTHORISATION.comment_id);
  assert.ok(finiteAuthority, 'FINITE_REAUTHORISATION_AUTHORITY_MISSING');
  const finiteDecisions = finiteReauthorisationDecisions(finiteAuthority.body);
  const rawRecords = sourceRecords();
  const atomSourceUnitIds = new Set(rawRecords.filter(row => row.source_object_kind === 'SOURCE_ATOM').map(row => row.source_unit_id));
  const originalRecords = rawRecords.map(record => {
    assert.equal(sha256(record.source_text), record.source_text_sha256, `${record.object_id}: source hash drift`);
    const pageAuthorities = AUTHORITIES.filter(item => item.pages.includes(record.source_page));
    const comments = pageAuthorities.map(item => item.id);
    const unresolved = UNRESOLVED_SOURCE_UNITS.includes(record.source_unit_id);
    const mechanicalZero = record.mechanical_source_role === 'NON_EFFECT_CONTEXT' && record.source_object_kind === 'SOURCE_UNIT';
    const finiteDecision = finiteDecisions.get(record.object_id);
    if (finiteDecision) {
      assert.equal(record.source_locator, finiteDecision.source_locator, `${record.object_id}: finite authority locator drift`);
      assert.equal(record.source_text, finiteDecision.source_text, `${record.object_id}: finite authority source text drift`);
      assert.equal(record.source_text_sha256, finiteDecision.source_text_sha256, `${record.object_id}: finite authority source hash drift`);
    }
    const explicitBinding = finiteDecision
      ? [FINITE_REAUTHORISATION.comment_id, finiteDecision.terminal_fach_state]
      : EXPLICIT_ROLE_BINDINGS[record.object_id];
    const binding = finiteDecision
      ? { matches: [{ comment_id: FINITE_REAUTHORISATION.comment_id, match_kind: 'EXACT_ID_TEXT_SHA256_AND_LOCATOR' }], extracted_terminal_role: finiteDecision.terminal_fach_state, extracted_from_comment_id: FINITE_REAUTHORISATION.comment_id }
      : unresolved ? { matches: [], extracted_terminal_role: null, extracted_from_comment_id: null } : bindingEvidence(record, pageAuthorities, commentsById);
    const sourceContainer = !mechanicalZero && record.source_object_kind === 'SOURCE_UNIT' && atomSourceUnitIds.has(record.source_unit_id);
    const terminalRole = mechanicalZero
      ? record.mechanical_terminal_status
      : explicitBinding?.[1] ?? (sourceContainer ? 'SOURCE_CONTAINER_COVERED_ZERO_COUNT' : binding.extracted_terminal_role);
    return {
      ...record,
      controlling_comment_ids: finiteDecision ? [FINITE_REAUTHORISATION.comment_id] : unresolved ? [] : comments,
      authority_resolution_status: unresolved
        ? 'PROTECTED_AUTHORED_REFERENCE_UNRESOLVED'
        : mechanicalZero
          ? 'MECHANICAL_NON_EFFECT_SOURCE_ROLE_ZERO_COUNT'
          : terminalRole
            ? 'LOSSLESS_AUTHORITATIVE_FACH_COMMENT_ROLE_BOUND'
            : 'LOSSLESS_AUTHORITATIVE_FACH_COMMENT_ARCHIVED_ROLE_BINDING_REQUIRED',
      terminal_role: terminalRole,
      counts_as_effect_object: mechanicalZero || sourceContainer ? false : terminalRole === 'EXPLICIT_FACH_APPROVED' || terminalRole === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON' ? true : terminalRole ? false : null,
      authority_binding_evidence: binding.matches,
      terminal_role_authority_comment_id: explicitBinding?.[0] ?? binding.extracted_from_comment_id,
      terminal_role_binding_method: explicitBinding ? 'FINITE_EXPLICIT_COMMENT_SECTION_BINDING' : terminalRole ? 'AUTHORITATIVE_COMMENT_TOKEN_OR_MECHANICAL_CONTAINER' : null,
      ...(finiteDecision ? {
        terminal_fach_state: finiteDecision.terminal_fach_state,
        exact_reason_code: finiteDecision.exact_reason_code,
        exact_reason: finiteDecision.exact_reason,
      } : {}),
    };
  });
  const generated = generatedRecords(rawRecords, commentsById);
  const expectedGenerated = new Set();
  for (const authority of AUTHORITIES) {
    for (const match of commentsById.get(authority.id).body.matchAll(GENERATED_ID_PATTERN)) {
      if (!VOID_GENERATED_IDS.has(match[0])) expectedGenerated.add(match[0]);
    }
  }
  for (const objectId of Object.keys(MANUAL_GENERATED_TEXT)) expectedGenerated.add(objectId);
  assert.deepEqual(generated.map(record => record.object_id), [...expectedGenerated].sort(), 'GENERATED_OBJECT_SOURCE_TEXT_OR_ROLE_BINDING_INCOMPLETE');
  const originalById = new Map(originalRecords.map(record => [record.object_id, record]));
  for (const record of generated) {
    for (const parentId of record.parent_object_ids ?? []) {
      const parent = originalById.get(parentId);
      if (!parent || parent.source_text_sha256 !== record.source_text_sha256) continue;
      parent.authority_resolution_status = 'LOSSLESS_AUTHORITATIVE_FACH_COMMENT_ROLE_BOUND';
      parent.terminal_role = 'SOURCE_OBJECT_VERSIONED_ZERO_COUNT';
      parent.counts_as_effect_object = false;
      parent.terminal_role_authority_comment_id = record.terminal_role_authority_comment_id;
      parent.terminal_role_binding_method = 'DETERMINISTIC_HASH_IDENTICAL_VERSION_PARENT';
      parent.superseded_by = [record.object_id];
    }
  }
  const records = [...originalRecords, ...generated];
  const roleBindingRequired = records.filter(row => row.authority_resolution_status.endsWith('ROLE_BINDING_REQUIRED'));
  const unresolvedSourceUnitIds = [...new Set([
    ...UNRESOLVED_SOURCE_UNITS,
    ...roleBindingRequired.map(row => row.source_unit_id),
  ])].sort();
  const recoverableTerminalPages = Array.from({ length: 54 }, (_, index) => index + 1).filter(page => {
    const pageRecords = records.filter(row => (row.source_pages ?? [row.source_page]).includes(page));
    return pageRecords.length > 0 && pageRecords.every(row => row.terminal_role !== null);
  });
  const comments = [...seen.values()].map(comment => {
    const item = all.find(candidate => candidate.id === comment.id);
    const kind = item.kind;
    const bytes = fs.readFileSync(path.join(ROOT, markdownPath(kind, comment.id)));
    return {
      issue_comment_id: comment.id,
      issue_comment_url: comment.html_url,
      kind,
      pages: item.pages ?? [],
      role: item.role ?? null,
      replacement: item.replacement ?? null,
      reason: item.reason ?? null,
      path: markdownPath(kind, comment.id),
      file_sha256: sha256(bytes),
      byte_length: bytes.length,
      title: comment.body.split('\n')[0],
    };
  }).sort((a, b) => a.issue_comment_id - b.issue_comment_id);
  const result = {
    schema_version: 'woek-mv-spd-authority-archive-1.0',
    artifact_id: 'MV-LTW-2026-SPD-REGIERUNGSPROGRAMM',
    artifact_sha256: ARTIFACT_SHA256,
    scope: 'MV_SPD_P1_P54_PROTECTED_AUTHORED_PREDECESSOR_CHAIN',
    source_rule: 'NO_FACH_DERIVED_FROM_SOURCE_TEXT_KEYWORDS_PARTY_IDENTITY_METADATA_OR_GENERIC_DELEGATED_RNAA',
    comments,
    controller_identified_unresolved_source_unit_ids: UNRESOLVED_SOURCE_UNITS,
    superseded_controller_identified_unresolved_source_unit_ids: PRIOR_UNRESOLVED_SOURCE_UNITS,
    unresolved_source_unit_ids: unresolvedSourceUnitIds,
    source_records: records,
    counts: {
      source_records: records.length,
      source_units: records.filter(row => row.source_object_kind === 'SOURCE_UNIT').length,
      source_atoms: records.filter(row => row.source_object_kind === 'SOURCE_ATOM').length,
      generated_authorised_records: generated.length,
      mechanical_non_effect_zero_count: records.filter(row => row.authority_resolution_status === 'MECHANICAL_NON_EFFECT_SOURCE_ROLE_ZERO_COUNT').length,
      authoritative_role_bound: records.filter(row => row.authority_resolution_status === 'LOSSLESS_AUTHORITATIVE_FACH_COMMENT_ROLE_BOUND').length,
      authoritative_generated_role_bound: records.filter(row => row.authority_resolution_status === 'LOSSLESS_AUTHORITATIVE_GENERATED_OBJECT_ROLE_BOUND').length,
      archived_role_binding_required: records.filter(row => row.authority_resolution_status.endsWith('ROLE_BINDING_REQUIRED')).length,
      unresolved_records: records.filter(row => row.authority_resolution_status === 'PROTECTED_AUTHORED_REFERENCE_UNRESOLVED').length,
    },
    coverage: {
      recoverable_terminal_pages: recoverableTerminalPages,
      unresolved_physical_pages: Array.from({ length: 54 }, (_, index) => index + 1).filter(page => !recoverableTerminalPages.includes(page)),
      active_terminal_review_leaf_ids: records.filter(row => row.counts_as_effect_object).map(row => row.object_id),
      zero_count_ids: records.filter(row => row.counts_as_effect_object === false).map(row => row.object_id),
      authority_pointer_gap_object_ids: records.filter(row => row.terminal_role === null).map(row => row.object_id),
      gate: 'PASS_P1_P54_SOURCE_BOUND_TERMINAL_ZERO_AUTHORITY_POINTER_GAP',
    },
    constraints: {
      generic_delegated_rnaa_used_as_fach: false,
      fach_synthesized: false,
      dns_synthesized: false,
      recommendation_synthesized: false,
      score_synthesized: false,
      vercel_action_triggered: false,
    },
    p1_p54_transaction_complete: true,
    p56_authorised: false,
  };
  result.descriptor_sha256 = sha256(JSON.stringify(result));
  fs.writeFileSync(path.join(ROOT, INDEX), `${JSON.stringify(result, null, 2)}\n`);
  return result;
}

export function validate() {
  const result = JSON.parse(fs.readFileSync(path.join(ROOT, INDEX), 'utf8'));
  const { descriptor_sha256, ...payload } = result;
  assert.equal(sha256(JSON.stringify(payload)), descriptor_sha256, 'AUTHORITY_INDEX_DESCRIPTOR_DRIFT');
  assert.equal(result.artifact_sha256, ARTIFACT_SHA256);
  assert.deepEqual(result.controller_identified_unresolved_source_unit_ids, UNRESOLVED_SOURCE_UNITS);
  assert.deepEqual(result.superseded_controller_identified_unresolved_source_unit_ids, PRIOR_UNRESOLVED_SOURCE_UNITS);
  assert.deepEqual(result.coverage.unresolved_physical_pages, []);
  assert.deepEqual(result.coverage.authority_pointer_gap_object_ids, []);
  assert.equal(result.constraints.fach_synthesized, false);
  assert.equal(result.source_records.filter(row => row.source_object_kind !== 'DETERMINISTIC_AUTHORISED_EXACT_SPAN_OR_REPAIR').length, 965);
  assert.equal(result.counts.source_units, 509);
  assert.equal(result.counts.source_atoms, 456);
  for (const comment of result.comments) {
    const bytes = fs.readFileSync(path.join(ROOT, comment.path));
    assert.equal(sha256(bytes), comment.file_sha256, `${comment.issue_comment_id}: authority bytes drift`);
    assert.equal(bytes.length, comment.byte_length, `${comment.issue_comment_id}: authority length drift`);
  }
  const currentSources = sourceRecords();
  assert.deepEqual(
    result.source_records
      .filter(row => row.source_object_kind !== 'DETERMINISTIC_AUTHORISED_EXACT_SPAN_OR_REPAIR')
      .map(({ controlling_comment_ids: _a, authority_resolution_status: _b, terminal_role: _c, counts_as_effect_object: _d, authority_binding_evidence: _e, terminal_role_authority_comment_id: _f, terminal_role_binding_method: _g, superseded_by: _h, terminal_fach_state: _i, exact_reason_code: _j, exact_reason: _k, ...source }) => source),
    currentSources,
    'SOURCE_LEDGER_DRIFT',
  );
  const finiteRecords = result.source_records.filter(row => FINITE_REAUTHORISATION.object_ids.includes(row.object_id));
  assert.deepEqual(finiteRecords.map(row => row.object_id), FINITE_REAUTHORISATION.object_ids);
  for (const row of finiteRecords) {
    assert.equal(row.terminal_fach_state, FINITE_REAUTHORISATION.terminal_fach_state);
    assert.equal(row.terminal_role, FINITE_REAUTHORISATION.terminal_fach_state);
    assert.equal(row.terminal_role_authority_comment_id, FINITE_REAUTHORISATION.comment_id);
    assert.equal(row.counts_as_effect_object, true);
    assert.ok(row.exact_reason_code);
    assert.ok(row.exact_reason);
  }
  const finiteComment = result.comments.find(comment => comment.issue_comment_id === FINITE_REAUTHORISATION.comment_id);
  assert.equal(finiteComment.file_sha256, FINITE_REAUTHORISATION.archived_file_sha256);
  assert.equal(result.p1_p54_transaction_complete, true);
  assert.equal(result.p56_authorised, false);
  return { gate: 'PASS_LOSSLESS_AUTHORITY_ARCHIVE_FAIL_CLOSED', ...result.counts, descriptor_sha256 };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.slice(2).every(argument => argument === '--write'));
  if (process.argv.includes('--write')) console.log(JSON.stringify(writeArchive().counts, null, 2));
  console.log(JSON.stringify(validate(), null, 2));
}
