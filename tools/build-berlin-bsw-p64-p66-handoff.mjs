import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(ROOT, 'woek-parlament-app');
const REVIEW_DIR = path.join(APP, 'data/state-programmes/fach-reviews');
const LEDGER_PATH = path.join(REVIEW_DIR, 'berlin-2026-bsw-v1.json');
const OUTPUT_PATH = path.join(REVIEW_DIR, 'berlin-2026-bsw-p64-p66-explicit-v1.json');
const sha256 = (value) => createHash('sha256').update(value, 'utf8').digest('hex');
const ledger = JSON.parse(readFileSync(LEDGER_PATH, 'utf8'));

const snapshotSpecs = [
  { pdf_page: 64, issue_comment_id: 5458967059, file: 'berlin-2026-bsw-p64-authoritative-handoff.md' },
  { pdf_page: 65, issue_comment_id: 5458972339, file: 'berlin-2026-bsw-p65-authoritative-handoff.md' },
  { pdf_page: 66, issue_comment_id: 5458979583, file: 'berlin-2026-bsw-p66-authoritative-handoff.md' },
  { pdf_pages: [64, 65], issue_comment_id: 5476662964, file: 'berlin-2026-bsw-p64-p65-heading-supplement-authoritative-handoff.md' },
];
const snapshots = snapshotSpecs.map(({ file, ...snapshot }) => {
  const relative = `woek-parlament-app/data/state-programmes/fach-reviews/${file}`;
  return {
    ...snapshot,
    issue: 240,
    issue_comment_url: `https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-${snapshot.issue_comment_id}`,
    path: relative,
    file_sha256: sha256(readFileSync(path.join(ROOT, relative), 'utf8')),
  };
});

const frozenObjects = [
  ...ledger.source_units.filter((item) => item.pdf_page >= 64 && item.pdf_page <= 66 && item.atom_count === 0).map((item) => ({
    object_id: item.source_unit_id,
    object_kind: 'SOURCE_UNIT',
    pdf_page: item.pdf_page,
    source_text_sha256: item.source_text_sha256,
    source_locator: item.source_locator,
    exact: item.source_excerpt,
  })),
  ...ledger.effect_atoms.filter((item) => item.pdf_page >= 64 && item.pdf_page <= 66).map((item) => ({
    object_id: item.atom_id,
    object_kind: 'SOURCE_ATOM',
    pdf_page: item.pdf_page,
    source_text_sha256: item.atom_text_sha256,
    source_locator: item.source_locator,
    exact: item.source_excerpt,
  })),
];
const byId = new Map(frozenObjects.map((item) => [item.object_id, item]));
const sourceObjects = frozenObjects.map(({ exact, source_locator, ...item }) => ({
  ...item,
  ...(sha256(exact) === item.source_text_sha256 ? { source_text: exact } : { source_excerpt: exact }),
}));

const original = new Map();
const set = (state, ...ids) => ids.forEach((object_id) => {
  if (!byId.has(object_id)) throw new Error(`${object_id}: source object missing`);
  if (original.has(object_id)) throw new Error(`${object_id}: duplicate decision`);
  original.set(object_id, {
    object_id,
    authoritative_terminal_fach_state: state,
    counts_as_effect_object: state === 'EXPLICIT_FACH_APPROVED' || state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
    decision_kind: state,
  });
});

set('NON_EFFECT_CONTEXT_REVIEWED',
  'BE-BSW-P64-U01-16248ee5ead4', 'BE-BSW-P64-U02-f238a2e3dcf4',
  'BE-BSW-P64-U04-d764b1f4336f', 'BE-BSW-P64-U06-0317253c025f',
  'BE-BSW-P64-U08-5e95584016f1', 'BE-BSW-P64-U10-8b774263a676',
  'BE-BSW-P64-U12-98633ed5097a', 'BE-BSW-P65-U03-7838c60433d5',
  'BE-BSW-P65-U05-6ca9d9ff0c75', 'BE-BSW-P65-U07-244fe10173c7',
  'BE-BSW-P65-U09-8ce2c5fad26d', 'BE-BSW-P65-U11-08c0b7804db8',
  'BE-BSW-P66-U02-e22e98dadab5', 'BE-BSW-P66-U09-865953508ba9');

set('NON_EFFECT_DIGITAL_POLICY_GOAL_REVIEWED', 'BE-BSW-P64-U03-A01-e31aafd557af');
set('NON_EFFECT_EXPECTED_BENEFIT_CLAIM_REVIEWED', 'BE-BSW-P64-U03-A03-8e5159c9ff28');
set('NON_EFFECT_RIGHTS_AND_ECONOMIC_OPPORTUNITY_PRINCIPLE_REVIEWED', 'BE-BSW-P64-U05-A01-76911b5d4f09');
set('NON_EFFECT_CAUSAL_OR_EXPECTED_OUTCOME_CLAIM_REVIEWED', 'BE-BSW-P64-U05-A02-f0ef4de552f8');
set('NON_EFFECT_PRIVACY_AND_PROPORTIONALITY_SAFEGUARD_REVIEWED', 'BE-BSW-P64-U05-A04-8c8851239a50');
set('NON_EFFECT_OPEN_DATA_GOAL_REVIEWED', 'BE-BSW-P64-U07-A01-dc69a247dbaa');
set('NON_EFFECT_CURRENT_PATH_AND_EXPECTED_OUTCOME_CLAIM_REVIEWED', 'BE-BSW-P64-U07-A02-b593e7fe130d');
set('NON_EFFECT_EXPECTED_USER_AND_MARKET_OUTCOME_CLAIM_REVIEWED', 'BE-BSW-P64-U07-A03-ebb364e654d0');
set('NON_EFFECT_SUSTAINABILITY_REPAIRABILITY_TECH_CONTROL_PRINCIPLE_REVIEWED', 'BE-BSW-P64-U09-A01-29de93aec54e');
set('NON_EFFECT_EXPECTED_REPAIR_MARKET_OUTCOME_CLAIM_REVIEWED', 'BE-BSW-P64-U09-A03-57cf2aa45d44');
set('NON_EFFECT_INCLUSIVE_DIGITALISATION_GOAL_REVIEWED', 'BE-BSW-P64-U11-A01-89debb18e46f');
set('NON_EFFECT_DIGITAL_ACCESS_GOAL_REVIEWED', 'BE-BSW-P64-U11-A02-10b0d0d82062');
set('NON_EFFECT_ANALOGUE_ACCESS_AND_NONCOMPENSATION_GUARD_REVIEWED', 'BE-BSW-P64-U11-A04-a1e38ecd1237');
set('NON_EFFECT_EXPECTED_RIGHTS_AND_MARKET_OUTCOME_CLAIM_REVIEWED', 'BE-BSW-P64-U11-A05-fda2d8b7608b');

set('NON_EFFECT_EXPECTED_INFORMATION_ACCESS_BENEFIT_CLAIM_REVIEWED', 'BE-BSW-P65-U01-A01-a89e509447db');
set('NON_EFFECT_INFORMATION_AUTONOMY_GOAL_REVIEWED', 'BE-BSW-P65-U01-A02-9833c4fb3406');
set('NON_EFFECT_CAUSAL_OR_EXPECTED_OUTCOME_CLAIM_REVIEWED', 'BE-BSW-P65-U01-A03-7601f45a1b70');
set('NON_EFFECT_FREE_EXPRESSION_AND_PROPORTIONALITY_GUARD_REVIEWED', 'BE-BSW-P65-U01-A04-1d6eb01cd71a');
set('NON_EFFECT_PRIVACY_RIGHT_PRINCIPLE_REVIEWED', 'BE-BSW-P65-U02-A01-2bcd14dd17b3');
set('NON_EFFECT_CURRENT_PRACTICE_AND_LEGAL_EVALUATION_CLAIM_REVIEWED', 'BE-BSW-P65-U02-A02-07cf4032f4e4');
set('NON_EFFECT_CAUSAL_AND_DIGNITY_RISK_CLAIM_REVIEWED', 'BE-BSW-P65-U02-A03-75ba79c0ebd1');
set('NON_EFFECT_EXPECTED_AI_BENEFIT_CLAIM_REVIEWED', 'BE-BSW-P65-U04-A01-f854ce389b5c');
set('NON_EFFECT_ALGORITHMIC_ACCOUNTABILITY_AND_NONDISCRIMINATION_GUARD_REVIEWED', 'BE-BSW-P65-U04-A03-450d3ece0004');
set('NON_EFFECT_EXPECTED_INNOVATION_AND_BUSINESS_OUTCOME_CLAIM_REVIEWED', 'BE-BSW-P65-U04-A04-86f3e6fcc165');
set('NON_EFFECT_EFFICIENCY_AND_SUSTAINABILITY_GOAL_REVIEWED', 'BE-BSW-P65-U06-A01-2f940987a765');
set('NON_EFFECT_ENVIRONMENTAL_PERFORMANCE_TARGET_BUNDLE_REVIEWED', 'BE-BSW-P65-U06-A02-b9db2867dba1');
set('NON_EFFECT_EXPECTED_COST_COMPETITIVENESS_AND_ENVIRONMENTAL_BENEFIT_CLAIM_REVIEWED', 'BE-BSW-P65-U06-A03-03f8eeecdcce');
set('NON_EFFECT_COMPETITIVENESS_CLAIM_REVIEWED', 'BE-BSW-P65-U08-A01-0bcd18fc66c5');
set('NON_EFFECT_TRUST_AND_INNOVATION_CAUSAL_CLAIM_REVIEWED', 'BE-BSW-P65-U08-A02-4a1acc063580');
set('NON_EFFECT_COMMON_GOOD_AND_INNOVATION_GOAL_REVIEWED', 'BE-BSW-P65-U10-A01-5868531f0dcd');
set('NON_EFFECT_PUBLIC_FUNDING_OUTCOME_CLAIM_REVIEWED', 'BE-BSW-P65-U10-A02-aac9909a2907');
set('NON_EFFECT_HUMAN_SOVEREIGN_DIGITALISATION_VISION_REVIEWED', 'BE-BSW-P65-U10-A03-f958fa007bf0');

set('NON_EFFECT_FOREIGN_BENCHMARK_AND_SUCCESS_CLAIM_REVIEWED', 'BE-BSW-P66-U08-A02-64a6149d0f69');

set('EXPLICIT_FACH_APPROVED',
  'BE-BSW-P64-U03-A02-d744b0f0c7bd', 'BE-BSW-P64-U03-A04-e81644f6ffe2',
  'BE-BSW-P64-U07-A04-ca0e0f167505', 'BE-BSW-P64-U09-A04-d5704ee883d2',
  'BE-BSW-P64-U11-A03-14594f79efbb', 'BE-BSW-P66-U01-A01-f3ddea2b02c2',
  'BE-BSW-P66-U03-A01-54d8796721c2', 'BE-BSW-P66-U04-A01-1f93125a3d8e',
  'BE-BSW-P66-U05-A01-d33670e9d257', 'BE-BSW-P66-U06-A01-3e80da64cbb4');

set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
  'BE-BSW-P64-U09-A02-e7dc6a8e11bf', 'BE-BSW-P65-U04-A02-7cea8c1ba699',
  'BE-BSW-P65-U08-A03-9a62b902525c', 'BE-BSW-P66-U07-A01-e77ec060a053',
  'BE-BSW-P66-U08-A01-856d33cfc15e');

set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'BE-BSW-P64-U05-A03-26464f3bea35');

const parentId = 'BE-BSW-P64-U05-A03-26464f3bea35';
const parent = sourceObjects.find((item) => item.object_id === parentId);
if (!parent?.source_text) throw new Error(`${parentId}: exact source text unavailable`);
const deterministic = [];
const addSlice = (prefix, needle, state, kind) => {
  const start = parent.source_text.indexOf(needle);
  if (start < 0) throw new Error(`${parentId}: slice not found: ${needle}`);
  const hash = sha256(needle);
  deterministic.push({
    object_id: `${prefix}-${hash.slice(0, 12)}`,
    object_kind: 'DETERMINISTIC_SEGMENTATION_REPLACEMENT',
    parent_object_ids: [parentId],
    source_text: needle,
    source_text_sha256: hash,
    source_span: { start, end: start + needle.length },
    source_span_basis: 'UTF16_CODE_UNIT_OFFSETS_IN_EXACT_PARENT_SOURCE_TEXT',
    terminal_fach_state: state,
    counts_as_effect_object: true,
    decision_kind: kind,
  });
};
addSlice('BE-BSW-P64-U05-A03-C01', 'starke Verschlüsselung', 'EXPLICIT_FACH_APPROVED', 'STRONG_ENCRYPTION_PROMOTION');
addSlice('BE-BSW-P64-U05-A03-C02', 'gemeinfreie Forschung', 'EXPLICIT_FACH_APPROVED', 'PUBLIC_DOMAIN_RESEARCH_PROMOTION');
addSlice('BE-BSW-P64-U05-A03-C03', 'transparente Systeme', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'TRANSPARENCY_OBJECT_ACTOR_SCOPE_UNSPECIFIED');
original.get(parentId).replacement_record_ids = deterministic.map((item) => item.object_id);

if (original.size !== sourceObjects.length) {
  const missing = sourceObjects.map((item) => item.object_id).filter((id) => !original.has(id));
  const extra = [...original.keys()].filter((id) => !byId.has(id));
  throw new Error(`original decision coverage drift; missing=${missing.join(',')} extra=${extra.join(',')}`);
}
const normalize = (state) => state.startsWith('NON_EFFECT_') ? 'NON_EFFECT_CONTEXT_REVIEWED' : state;
const counts = [...original.values(), ...deterministic].reduce((acc, item) => {
  const state = normalize(item.authoritative_terminal_fach_state || item.terminal_fach_state);
  acc[state] += 1;
  return acc;
}, { EXPLICIT_FACH_APPROVED: 0, REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 0, NON_EFFECT_CONTEXT_REVIEWED: 0, SOURCE_UNIT_RECLASSIFIED_VERSIONED: 0 });
const active = counts.EXPLICIT_FACH_APPROVED + counts.REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON;
const expected = { EXPLICIT_FACH_APPROVED: 12, REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 6, NON_EFFECT_CONTEXT_REVIEWED: 47, SOURCE_UNIT_RECLASSIFIED_VERSIONED: 1 };
if (sourceObjects.length !== 63 || deterministic.length !== 3 || active !== 18 || JSON.stringify(counts) !== JSON.stringify(expected)) {
  throw new Error(`set-wise count drift ${JSON.stringify({ source: sourceObjects.length, deterministic: deterministic.length, active, counts })}`);
}

const handoff = {
  schema_version: 'woek-explicit-fach-handoff-2.0',
  handoff_id: 'BE-BSW-P64-P66-EXPLICIT-FACH-2026-V1',
  base_main_commit: 'f5527f40f7a3f0ecca6cab4f5f14c4c0bf5e578b',
  artifact_id: ledger.artifact.artifact_id,
  artifact_sha256: ledger.artifact.artifact_sha256,
  artifact_byte_length: ledger.artifact.byte_length,
  artifact_page_count: ledger.artifact.page_count,
  controller: { issue: 241, issue_comment_id: 5475379459, issue_comment_url: 'https://github.com/sustynats/wirkungsoekonomie.de/issues/241#issuecomment-5475379459' },
  authoritative_markdowns: snapshots,
  source_objects: sourceObjects,
  original_records: [...original.values()],
  deterministic_records: deterministic,
  deterministic_open_children: [],
  coverage: {
    protected_fach_terminal_physical_scope: 'P1-P63',
    segmented_physical_pages: [64, 65, 66],
    next_opaque_page_review_envelope_from: null,
    next_opaque_page_review_envelope_through: null,
    original_source_object_count: sourceObjects.length,
    original_terminal_record_count: sourceObjects.length,
    deterministic_terminal_record_count: deterministic.length,
    new_terminal_record_count: sourceObjects.length + deterministic.length,
    active_terminal_review_leaf_count: active,
    active_explicit_fach_approved_count: counts.EXPLICIT_FACH_APPROVED,
    active_reviewed_not_assessable_count: counts.REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON,
    versioned_parent_or_fragment_count: counts.SOURCE_UNIT_RECLASSIFIED_VERSIONED,
    new_exact_open_child_object_count: 0,
    terminal_status_counts: counts,
    gates: [
      'BE_BSW_P64_P65_OMITTED_STRUCTURAL_HEADINGS_FACH_COMPLETE_PASS_SOURCE_BOUND_2_OF_2',
      'BE_BSW_P64_FACH_COMPLETE_PASS_SOURCE_BOUND_OBJECT_LEVEL',
      'BE_BSW_P65_FACH_COMPLETE_PASS_SOURCE_BOUND_ZERO_APPROVED_EFFECT_LEAVES',
      'BE_BSW_P66_FACH_COMPLETE_PASS_SOURCE_BOUND_OBJECT_LEVEL',
      'BE_BSW_FULL_PROGRAMME_FACH_HANDOFF_COMPLETE_PASS_SOURCE_BOUND_66_OF_66',
    ],
  },
  constraints: { fach_inferred_from_source: false, dns_synthesized: false, recommendation_synthesized: false, score_synthesized: false, party_wide_judgement_synthesized: false, vercel_action_triggered: false },
};
const encoded = `${JSON.stringify(handoff, null, 2)}\n`;
if (process.argv.includes('--check')) {
  if (readFileSync(OUTPUT_PATH, 'utf8') !== encoded) throw new Error('P64-P66 handoff is not deterministic/current');
} else writeFileSync(OUTPUT_PATH, encoded);
console.log(JSON.stringify({ output: path.relative(ROOT, OUTPUT_PATH), counts, active, deterministic_ids: deterministic.map((item) => item.object_id), gates: handoff.coverage.gates }, null, 2));
