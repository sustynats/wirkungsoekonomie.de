import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(ROOT, 'woek-parlament-app');
const LEDGER_PATH = path.join(APP, 'data/state-programmes/fach-reviews/berlin-2026-bsw-v1.json');
const OUTPUT_PATH = path.join(APP, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p50-p53-explicit-v1.json');
const sha256 = (value) => createHash('sha256').update(value, 'utf8').digest('hex');
const ledger = JSON.parse(readFileSync(LEDGER_PATH, 'utf8'));

const snapshots = [
  [50, 5457793475],
  [51, 5459288728],
  [52, 5459304496],
  [53, 5459330996],
].map(([pdf_page, issue_comment_id]) => {
  const relative = 'woek-parlament-app/data/state-programmes/fach-reviews/berlin-2026-bsw-p' + pdf_page + '-authoritative-handoff.md';
  return {
    pdf_page,
    issue: 240,
    issue_comment_id,
    issue_comment_url: 'https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-' + issue_comment_id,
    path: relative,
    file_sha256: sha256(readFileSync(path.join(ROOT, relative), 'utf8')),
  };
});

const frozenObjects = [
  ...ledger.source_units
    .filter((item) => (
      ((item.pdf_page >= 50 && item.pdf_page <= 53) && item.source_unit_id !== 'BE-BSW-P50-U01-bb3d4390ad9a')
      || item.source_unit_id === 'BE-BSW-P54-U01-a226a5a2869e'
    ) && item.atom_count === 0)
    .map((item) => ({
      object_id: item.source_unit_id,
      object_kind: 'SOURCE_UNIT',
      pdf_page: item.pdf_page,
      source_text_sha256: item.source_text_sha256,
      source_locator: item.source_locator,
      exact: item.source_excerpt,
    })),
  ...ledger.effect_atoms
    .filter((item) => item.pdf_page >= 50 && item.pdf_page <= 53)
    .map((item) => ({
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
const set = (state, kind, ...ids) => ids.forEach((object_id) => original.set(object_id, {
  object_id,
  authoritative_terminal_fach_state: state,
  counts_as_effect_object: state === 'EXPLICIT_FACH_APPROVED' || state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
  decision_kind: kind,
}));

set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'COMPOUND_WATERWAY_BEHALA_PARENT', 'BE-BSW-P50-U02-A01-744f6eebc313');
set('NON_EFFECT_GENERIC_EXPECTED_MODE_SHIFT_CLAIM_REVIEWED', 'FREIGHT_MODE_SHIFT_SOURCE_CLAIM', 'BE-BSW-P50-U02-A02-aa113460f360');
set('NON_EFFECT_BENCHMARK_OR_VISION_CLAIM_REVIEWED', 'ARTISTIC_FREIGHT_VISION_REFERENCE', 'BE-BSW-P50-U02-A03-f5a68859a288');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'COMPOUND_FREIGHT_CENTRE_COOPERATION_PARENT', 'BE-BSW-P50-U02-A04-784c88d74c8d');
set('NON_EFFECT_RETROSPECTIVE_SOURCE_CLAIM_REVIEWED', 'GARDENS_OF_THE_WORLD_ROPEWAY_REFERENCE_CLAIM', 'BE-BSW-P50-U03-A01-ce20146eae6e');
set('EXPLICIT_FACH_APPROVED', 'EAST_SOUTHEAST_ROPEWAY_CORRIDOR', 'BE-BSW-P50-U03-A02-083663b9a83a');
set('NON_EFFECT_EXPECTED_AND_TECHNICAL_SOURCE_CLAIMS_REVIEWED', 'ROPEWAY_EXPECTED_OUTCOME_AND_TECHNICAL_CLAIMS', 'BE-BSW-P50-U04-b7b5e38cba91');
set('NON_EFFECT_CONTEXT_REVIEWED', 'STRUCTURAL_HEADING', 'BE-BSW-P50-U05-444316dfb692', 'BE-BSW-P50-U08-aa7c2e1f3a99');
set('NON_EFFECT_DELIVERY_GOAL_REVIEWED', 'TRANSPORT_PROJECT_DELIVERY_GOAL', 'BE-BSW-P50-U06-A01-cc13020452ae');
set('EXPLICIT_FACH_APPROVED', 'CONSTRUCTION_SITE_COORDINATION', 'BE-BSW-P50-U06-A02-b0512c698a0f');
set('EXPLICIT_FACH_APPROVED', 'WORKSITE_DURATION_AND_DELIVERY_DISCIPLINE', 'BE-BSW-P50-U06-A03-dffd5fec36a4');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'CONSTRUCTION_ACCOUNTABILITY_INSTRUMENT_UNSPECIFIED', 'BE-BSW-P50-U06-A04-61f14efc8a9c');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'PLANNING_STREAMLINING_DELTA_UNSPECIFIED', 'BE-BSW-P50-U07-A01-b07518ee0875');
set('EXPLICIT_FACH_APPROVED', 'TRANSPORT_PROJECT_EFFECTIVENESS_PRIORITISATION', 'BE-BSW-P50-U07-A02-6d96a3b07da4');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'COMPOUND_SIGNAL_DIVERSION_TVO_PARENT', 'BE-BSW-P50-U07-A03-2823684f6ec9');
set('NON_EFFECT_NORMATIVE_PROJECT_FRAME_REVIEWED', 'TVO_NORMATIVE_PROJECT_FRAME', 'BE-BSW-P50-U07-A04-eb173bf73c8e');
set('NON_EFFECT_SYSTEM_GOAL_AND_DIAGNOSIS_REVIEWED', 'GROWING_CITY_NETWORK_GOAL', 'BE-BSW-P50-U07-A05-fb65091f2e91');
set('EXPLICIT_FACH_APPROVED', 'TVO_PRECISE_7_2_KM_GAP_CLOSURE', 'BE-BSW-P50-U07-A06-fadc1511d631');
set('NON_EFFECT_HEALTH_AND_PARTICIPATION_SAFEGUARD_REVIEWED', 'TVO_HEALTH_AND_PARTICIPATION_SAFEGUARD', 'BE-BSW-P50-U07-A07-46beff0eff03');

set('NON_EFFECT_CURRENT_EVENT_AND_POLICY_ATTENTION_FRAME_REVIEWED', 'RYANAIR_PLANNED_BASE_CLOSURE_EVENT_FRAME', 'BE-BSW-P51-U01-A01-d75632cf632c');
set('EXPLICIT_FACH_APPROVED', 'INDEPENDENT_CAUSE_AND_IMPACT_TRANSPARENCY_REVIEW', 'BE-BSW-P51-U01-A02-be55471feb8c');
set('NON_EFFECT_CAUSAL_AND_COMPETITIVENESS_FRAME_REVIEWED', 'AVIATION_COST_CAUSAL_FRAME', 'BE-BSW-P51-U01-A03-3ce05439f314');
set('NON_EFFECT_COMPOUND_TARGET_STATE_REVIEWED', 'COMPETITIVENESS_CONNECTIVITY_AFFORDABILITY_GOALS', 'BE-BSW-P51-U02-A01-e4b6e182ca45');
set('EXPLICIT_FACH_APPROVED', 'INTEGRATED_INDUSTRY_AND_TRANSPORT_STRATEGY', 'BE-BSW-P51-U03-A01-e5f4fa2a1a56');
set('NON_EFFECT_NORMATIVE_CAUSAL_FRAME_REVIEWED', 'BERLIN_LOSER_CAUSAL_FRAME', 'BE-BSW-P51-U03-A02-c486a100cbed');

set('NON_EFFECT_HEADING_AND_DIAGNOSTIC_FRAME_REVIEWED', 'FINANCE_AND_TAX_POLICY_HEADING', 'BE-BSW-P52-U01-cc0ecc2c45f4');
set('NON_EFFECT_MULTI_DOMAIN_DIAGNOSIS_AND_RATIONALE_REVIEWED', 'BERLIN_INFRASTRUCTURE_AND_BUDGET_DIAGNOSIS', 'BE-BSW-P52-U02-70cc6c766773');
set('NON_EFFECT_STRUCTURAL_HEADING_REVIEWED', 'DEFENCE_AND_SOCIAL_STATE_HEADING', 'BE-BSW-P52-U06-95b892cfc6a1');
set('NON_EFFECT_FEDERAL_DEFENCE_FISCAL_NARRATIVE_REVIEWED', 'FEDERAL_DEFENCE_FISCAL_NARRATIVE', 'BE-BSW-P52-U07-2666bb212fcd');
set('NON_EFFECT_PROBLEM_DIAGNOSIS_REVIEWED', 'FISCAL_AND_SOCIAL_PROBLEM_DIAGNOSIS', 'BE-BSW-P52-U03-A01-fab5a11db229');
set('NON_EFFECT_DISTRIBUTIONAL_POLICY_PRINCIPLE_REVIEWED', 'DISTRIBUTIONAL_FISCAL_PRINCIPLE', 'BE-BSW-P52-U03-A02-93603e849354');
set('NON_EFFECT_BUDGET_GOVERNANCE_FRAME_REVIEWED', 'BUDGET_PRIORITY_FRAME', 'BE-BSW-P52-U03-A03-5054ca811102');
set('NON_EFFECT_INVESTMENT_PRIORITY_GOAL_REVIEWED', 'MULTI_DOMAIN_INVESTMENT_PRIORITY_GOAL', 'BE-BSW-P52-U04-A01-9a1aa9514249');
set('NON_EFFECT_EXPECTED_OUTCOME_CAUSAL_CLAIM_REVIEWED', 'INVESTMENT_EXPECTED_OUTCOME_CLAIM', 'BE-BSW-P52-U04-A02-af7d2bc68398');
set('NON_EFFECT_FISCAL_DIAGNOSIS_REVIEWED', 'BERLIN_FISCAL_STRESS_DIAGNOSIS', 'BE-BSW-P52-U04-A03-eb866e5e87f9');
set('NON_EFFECT_COMPOUND_EXPENDITURE_CAUSAL_CLAIM_REVIEWED', 'EXPENDITURE_CAUSAL_CLAIM', 'BE-BSW-P52-U04-A04-cff0e5e97afd');
set('NON_EFFECT_QUANTITATIVE_BASELINE_CLAIM_REVIEWED', 'DEBT_PER_CAPITA_CLAIM', 'BE-BSW-P52-U04-A05-4c7f8607981b');
set('NON_EFFECT_FISCAL_PLAN_QUANTITATIVE_CLAIM_REVIEWED', 'PLANNED_NET_BORROWING_CLAIM', 'BE-BSW-P52-U04-A06-a5b0425ed95b');
set('NON_EFFECT_FISCAL_MECHANISM_DIAGNOSIS_REVIEWED', 'INTEREST_BURDEN_DIAGNOSIS', 'BE-BSW-P52-U04-A07-a35994b85087');
set('NON_EFFECT_NORMATIVE_FISCAL_PRINCIPLE_REVIEWED', 'FISCAL_POLICY_PRINCIPLE', 'BE-BSW-P52-U05-A01-ba8d0e12819f');
set('NON_EFFECT_EFFICIENCY_AND_DISTRIBUTION_GOAL_REVIEWED', 'EFFICIENCY_AND_DISTRIBUTION_GOAL', 'BE-BSW-P52-U05-A02-4edb5a82da16');
set('NON_EFFECT_DISTRIBUTIONAL_TARGET_REVIEWED', 'PUBLIC_EXPENDITURE_TARGETING_GOAL', 'BE-BSW-P52-U05-A03-0e9936bea52a');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'UNSPECIFIED_DISTORTION_AND_SUBSIDY_REDUCTION', 'BE-BSW-P52-U05-A04-6fc7cfbc1ca4');

set('NON_EFFECT_STRUCTURAL_HEADING_REVIEWED', 'KONNEXITAET_HEADING', 'BE-BSW-P53-U01-1a61f5118cb8', 'BE-BSW-P53-U05-bd44b0d263cd');
set('NON_EFFECT_FEDERAL_LAND_COST_ATTRIBUTION_FRAME_REVIEWED', 'FEDERAL_TASK_TRANSFER_COST_FRAME', 'BE-BSW-P53-U02-4b618e882c97');
set('EXPLICIT_FACH_APPROVED', 'FULL_COST_RULE_FOR_FEDERAL_TASK_TRANSFERS', 'BE-BSW-P53-U03-A01-7005c1666d35');
set('NON_EFFECT_QUANTITATIVE_MIGRATION_COST_CLAIM_REVIEWED', 'MIGRATION_AND_REFUGEE_COST_CLAIM', 'BE-BSW-P53-U03-A02-fe7442232551');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'UNSPECIFIED_MUNICIPAL_FINANCE_REFORM', 'BE-BSW-P53-U04-A01-f8f9541ecfe1');
set('EXPLICIT_FACH_APPROVED', 'STRONGER_LAENDER_BUNDESRAT_FISCAL_RIGHTS', 'BE-BSW-P53-U04-A02-5c990692eb07');
set('EXPLICIT_FACH_APPROVED', 'EX_ANTE_COUNTERFINANCING_AND_LAENDER_COORDINATION', 'BE-BSW-P53-U04-A03-e167f10fba95');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'UNSPECIFIED_BUREAUCRACY_AND_TAX_LUMP_SUM_REFORM', 'BE-BSW-P53-U06-A01-c98fb85c037a');
set('NON_EFFECT_EXPENDITURE_AND_EFFICIENCY_DIAGNOSIS_REVIEWED', 'CONSULTING_AND_ADMIN_EXPENDITURE_DIAGNOSIS', 'BE-BSW-P53-U06-A02-f218bec02860');
set('NON_EFFECT_EXPECTED_SAVINGS_CLAIM_REVIEWED', 'EXPECTED_SAVINGS_CLAIM', 'BE-BSW-P53-U06-A03-3034e53b9cd5');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'COMPOUND_DIGITAL_COORDINATION_PRIORITISATION_TAX_ENFORCEMENT_PARENT', 'BE-BSW-P53-U06-A04-a6ca6ad2c99e');
set('NON_EFFECT_DISTRIBUTION_AND_ADDITIONALITY_DIAGNOSIS_REVIEWED', 'ECONOMIC_SUPPORT_DISTRIBUTION_DIAGNOSIS', 'BE-BSW-P53-U07-A01-58c0f9bbccbe');
set('EXPLICIT_FACH_APPROVED', 'FAIR_WORK_AND_REGIONAL_VALUE_FUNDING_CONDITIONALITY', 'BE-BSW-P53-U07-A02-5241be2c0ea5');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'COMPOUND_SUBSIDY_CUT_AND_LABOUR_PROGRAMME_PARENT', 'BE-BSW-P53-U07-A03-349b35196172');
set('NON_EFFECT_EFFICIENCY_TARGET_REVIEWED', 'ADMINISTRATION_EFFICIENCY_TARGET', 'BE-BSW-P53-U08-A01-54781cef7a08');
set('EXPLICIT_FACH_APPROVED', 'DISTRICT_SERVICE_PROCESS_OPTIMISATION_AND_DIGITALISATION', 'BE-BSW-P53-U08-A02-41ec9e666fd8');
set('NON_EFFECT_COMPLIANCE_GOAL_REVIEWED', 'TAX_AVOIDANCE_COMPLIANCE_GOAL', 'BE-BSW-P53-U09-A01-93fa76750cf9');
set('EXPLICIT_FACH_APPROVED', 'TAX_OFFICE_STAFFING_AND_CAPACITY', 'BE-BSW-P53-U09-A02-2111bb2b256f');
set('EXPLICIT_FACH_APPROVED', 'STOP_BERLIN_OLYMPIC_BID_AND_FUTURE_SPENDING', 'BE-BSW-P53-U10-A01-4af6868e9c7a');
set('NON_EFFECT_QUANTITATIVE_COST_CLAIM_REVIEWED', 'OLYMPIC_BID_AND_HOSTING_COST_CLAIM', 'BE-BSW-P53-U10-A02-892d7d2279c6');
set('EXPLICIT_FACH_APPROVED', 'REHABILITATE_EXISTING_SPORTS_FACILITIES', 'BE-BSW-P53-U10-A03-df2463a8b007');
set('NON_EFFECT_MULTI_DOMAIN_BUDGET_PRIORITY_GOAL_REVIEWED', 'MULTI_DOMAIN_BUDGET_PRIORITY_GOAL', 'BE-BSW-P53-U10-A04-9ef7985bba8d');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'P53_P54_BROKEN_SENTENCE_FRAGMENT', 'BE-BSW-P53-U10-A05-8d70f09c8667', 'BE-BSW-P54-U01-a226a5a2869e');

const deterministic = [];
const exactText = (id) => {
  const source = sourceObjects.find((item) => item.object_id === id);
  if (!source?.source_text) throw new Error(id + ': exact source text unavailable');
  return source.source_text;
};
const addRecord = ({ prefix, parents, source_text, state, kind, object_kind = 'DETERMINISTIC_SEGMENTATION_REPLACEMENT', parent_joiner = '', source_span, source_span_basis, reconstruction_mode, source_segments }) => {
  const hash = sha256(source_text);
  const record = {
    parent_object_ids: parents,
    ...(parent_joiner ? { parent_joiner } : {}),
    source_text,
    source_span,
    terminal_fach_state: state,
    counts_as_effect_object: state === 'EXPLICIT_FACH_APPROVED' || state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
    decision_kind: kind,
    object_kind,
    object_id: prefix + '-' + hash.slice(0, 12),
    source_text_sha256: hash,
    source_span_basis,
    ...(reconstruction_mode ? { reconstruction_mode } : {}),
    ...(source_segments ? { source_segments } : {}),
  };
  deterministic.push(record);
  return record;
};
const addSlice = (prefix, parent, needle, state, kind) => {
  const text = exactText(parent);
  const start = text.indexOf(needle);
  if (start < 0) throw new Error(parent + ': slice not found: ' + needle);
  return addRecord({
    prefix,
    parents: [parent],
    source_text: needle,
    state,
    kind,
    source_span: { start, end: start + needle.length },
    source_span_basis: 'UTF16_CODE_UNIT_OFFSETS_IN_EXACT_PARENT_SOURCE_TEXT',
  });
};
const addJoined = (prefix, parents, joiner, state, kind, object_kind = 'DETERMINISTIC_CROSS_PAGE_SEMANTIC_REPLACEMENT') => {
  const source_text = parents.map(exactText).join(joiner);
  return addRecord({
    prefix,
    parents,
    parent_joiner: joiner,
    source_text,
    state,
    kind,
    object_kind,
    source_span: { start: 0, end: source_text.length },
    source_span_basis: 'UTF16_CODE_UNIT_OFFSETS_IN_EXACT_JOINED_PARENT_SOURCE_TEXT',
  });
};

addSlice('BE-BSW-P50-U02-A01-C01', 'BE-BSW-P50-U02-A01-744f6eebc313', 'Wir unterstützen den Bund beim Ausbau und der Unterhaltung unserer Binnenwasserstraßen', 'EXPLICIT_FACH_APPROVED', 'FEDERAL_INLAND_WATERWAY_SUPPORT');
addSlice('BE-BSW-P50-U02-A01-C02', 'BE-BSW-P50-U02-A01-744f6eebc313', 'befürworten eine Stärkung der BEHALA', 'EXPLICIT_FACH_APPROVED', 'BEHALA_STRENGTHENING');
addSlice('BE-BSW-P50-U02-A04-C01', 'BE-BSW-P50-U02-A04-784c88d74c8d', 'Errichtung von Güterverteilzentren am Stadtrand', 'EXPLICIT_FACH_APPROVED', 'FREIGHT_DISTRIBUTION_CENTRES_CITY_EDGE');
{
  const parent = 'BE-BSW-P50-U02-A04-784c88d74c8d';
  const phrase = 'Errichtung von Güterverteilzentren am Stadtrand bzw. in Brandenburg';
  const start = exactText(parent).indexOf(phrase);
  if (start < 0) throw new Error(parent + ': authoritative elliptical source span missing');
  addRecord({
    prefix: 'BE-BSW-P50-U02-A04-C02',
    parents: [parent],
    source_text: 'Errichtung von Güterverteilzentren in Brandenburg',
    state: 'EXPLICIT_FACH_APPROVED',
    kind: 'FREIGHT_DISTRIBUTION_CENTRES_BRANDENBURG',
    source_span: { start, end: start + phrase.length },
    source_span_basis: 'AUTHORITATIVE_ELLIPTICAL_LIST_EXPANSION_FROM_EXACT_PARENT_SPAN',
    reconstruction_mode: 'AUTHORITATIVE_ELLIPTICAL_LIST_EXPANSION',
    source_segments: [{ parent_object_id: parent, start, end: start + phrase.length, source_text: phrase }],
  });
}
addSlice('BE-BSW-P50-U02-A04-C03', 'BE-BSW-P50-U02-A04-784c88d74c8d', 'stärker mit unseren Nachbarn zusammenarbeiten', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'FREIGHT_CENTRE_CROSS_STATE_COOPERATION_UNSPECIFIED');
addSlice('BE-BSW-P50-U07-A03-C01', 'BE-BSW-P50-U07-A03-2823684f6ec9', 'Optimierung von Ampelschaltungen', 'EXPLICIT_FACH_APPROVED', 'SIGNAL_OPTIMISATION');
addSlice('BE-BSW-P50-U07-A03-C02', 'BE-BSW-P50-U07-A03-2823684f6ec9', 'bessere Anpassung an Umleitungen und Baustellen', 'EXPLICIT_FACH_APPROVED', 'DIVERSION_AND_CONSTRUCTION_ADAPTATION');
addSlice('BE-BSW-P50-U07-A03-C03', 'BE-BSW-P50-U07-A03-2823684f6ec9', 'Ausbau zentraler Verbindungen wie der Tangentialen Verbindung Ost (TVO)', 'NON_EFFECT_RESTATEMENT_AND_GENERAL_ACTION_PARENT_REVIEWED', 'TVO_GENERAL_ACTION_RESTATEMENT');

addSlice('BE-BSW-P53-U06-A04-C01', 'BE-BSW-P53-U06-A04-a6ca6ad2c99e', 'verbesserte bundeseinheitliche Abstimmung im Bereich der Digitalisierung', 'EXPLICIT_FACH_APPROVED', 'TAX_ADMIN_DIGITAL_INTEROPERABILITY');
addSlice('BE-BSW-P53-U06-A04-C02', 'BE-BSW-P53-U06-A04-a6ca6ad2c99e', 'Priorisierung verschiedener Fachbereiche', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'TAX_ADMIN_FIELD_PRIORITISATION_UNSPECIFIED');
addSlice('BE-BSW-P53-U06-A04-C03', 'BE-BSW-P53-U06-A04-a6ca6ad2c99e', 'einen effizienteren Steuervollzug', 'EXPLICIT_FACH_APPROVED', 'EFFICIENT_TAX_ENFORCEMENT');
addSlice('BE-BSW-P53-U07-A03-C01', 'BE-BSW-P53-U07-A03-349b35196172', 'ineffektive Subventionen gestrichen', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'UNSPECIFIED_SUBSIDY_CUT');
addSlice('BE-BSW-P53-U07-A03-C02', 'BE-BSW-P53-U07-A03-349b35196172', 'die freiwerdenden Mittel zum Beispiel in arbeitsmarktpolitische Programme für Geringqualifizierte investiert werden', 'EXPLICIT_FACH_APPROVED', 'LOW_QUALIFICATION_LABOUR_MARKET_PROGRAMMES');
addJoined('BE-BSW-P53P54-U10U01-M01', ['BE-BSW-P53-U10-A05-8d70f09c8667', 'BE-BSW-P54-U01-a226a5a2869e'], ' ', 'NON_EFFECT_EXPECTED_DISTRIBUTIONAL_OUTCOME_CLAIM_REVIEWED', 'CROSS_PAGE_REALLOCATION_EXPECTED_OUTCOME_CLAIM');

const replacements = new Map();
for (const record of deterministic) {
  for (const parent of record.parent_object_ids) {
    if (!replacements.has(parent)) replacements.set(parent, []);
    replacements.get(parent).push(record.object_id);
  }
}
for (const [parent, ids] of replacements) {
  const decision = original.get(parent);
  if (!decision || decision.authoritative_terminal_fach_state !== 'SOURCE_UNIT_RECLASSIFIED_VERSIONED') throw new Error(parent + ': deterministic parent not versioned');
  decision.replacement_record_ids = ids;
}

if (original.size !== sourceObjects.length) {
  const missing = sourceObjects.map((item) => item.object_id).filter((id) => !original.has(id));
  const extra = [...original.keys()].filter((id) => !byId.has(id));
  throw new Error('original decision coverage drift; missing=' + missing.join(',') + ' extra=' + extra.join(','));
}
const normalize = (state) => state.startsWith('NON_EFFECT_') ? 'NON_EFFECT_CONTEXT_REVIEWED' : state;
const terminalRecords = [...original.values(), ...deterministic];
const counts = terminalRecords.reduce((acc, item) => {
  const state = normalize(item.authoritative_terminal_fach_state || item.terminal_fach_state);
  acc[state] += 1;
  return acc;
}, { EXPLICIT_FACH_APPROVED: 0, REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 0, NON_EFFECT_CONTEXT_REVIEWED: 0, SOURCE_UNIT_RECLASSIFIED_VERSIONED: 0 });
const active = counts.EXPLICIT_FACH_APPROVED + counts.REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON;
if (sourceObjects.length !== 69 || deterministic.length !== 14 || terminalRecords.length !== 83 || active !== 32) {
  throw new Error('set-wise count drift ' + JSON.stringify({ source: sourceObjects.length, deterministic: deterministic.length, terminal: terminalRecords.length, active, counts }));
}

const handoff = {
  schema_version: 'woek-explicit-fach-handoff-2.0',
  handoff_id: 'BE-BSW-P50-P53-EXPLICIT-FACH-2026-V1',
  base_main_commit: 'cf9645c4e15a3dc759f62d51202218348d3f7707',
  artifact_id: ledger.artifact.artifact_id,
  artifact_sha256: ledger.artifact.artifact_sha256,
  artifact_byte_length: ledger.artifact.byte_length,
  artifact_page_count: ledger.artifact.page_count,
  controller: {
    issue: 241,
    issue_comment_id: 5459840094,
    issue_comment_url: 'https://github.com/sustynats/wirkungsoekonomie.de/issues/241#issuecomment-5459840094',
  },
  authoritative_markdowns: snapshots,
  source_objects: sourceObjects,
  original_records: [...original.values()],
  deterministic_records: deterministic,
  deterministic_open_children: [],
  deterministic_child_contract: {
    id_rule: 'stable structural prefix plus first 12 hex characters of SHA-256(exact UTF-8 deterministic source text)',
    source_span_basis: ['UTF16_CODE_UNIT_OFFSETS_IN_EXACT_PARENT_SOURCE_TEXT', 'UTF16_CODE_UNIT_OFFSETS_IN_EXACT_JOINED_PARENT_SOURCE_TEXT', 'AUTHORITATIVE_ELLIPTICAL_LIST_EXPANSION_FROM_EXACT_PARENT_SPAN'],
    semantics_rule: 'IDs, hashes, exact text spans and lineage are mechanical; Fach is copied only from the cited WÖk comments.',
  },
  coverage: {
    protected_fach_terminal_physical_scope: 'P1-P49',
    segmented_physical_pages: [50, 51, 52, 53],
    consumed_cross_page_fragment: 'P54-U01 only; P54 page envelope remains open',
    next_opaque_page_review_envelope_from: 54,
    next_opaque_page_review_envelope_through: 66,
    original_source_object_count: sourceObjects.length,
    original_terminal_record_count: sourceObjects.length,
    deterministic_terminal_record_count: deterministic.length,
    new_terminal_record_count: terminalRecords.length,
    active_terminal_review_leaf_count: active,
    active_explicit_fach_approved_count: counts.EXPLICIT_FACH_APPROVED,
    active_reviewed_not_assessable_count: counts.REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON,
    versioned_parent_or_fragment_count: counts.SOURCE_UNIT_RECLASSIFIED_VERSIONED,
    new_exact_open_child_object_count: 0,
    terminal_status_counts: counts,
    gate: 'BE_BSW_P50_P53_FACH_COMPLETE_PASS_SOURCE_BOUND',
  },
  constraints: {
    fach_inferred_from_source: false,
    dns_synthesized: false,
    recommendation_synthesized: false,
    score_synthesized: false,
    party_wide_judgement_synthesized: false,
    p54_page_envelope_closed: false,
    vercel_action_triggered: false,
  },
};

const encoded = JSON.stringify(handoff, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (readFileSync(OUTPUT_PATH, 'utf8') !== encoded) throw new Error('P50-P53 handoff is not deterministic/current');
} else {
  writeFileSync(OUTPUT_PATH, encoded);
}
console.log(JSON.stringify({ output: path.relative(ROOT, OUTPUT_PATH), counts, deterministic_ids: deterministic.map((item) => item.object_id), gate: handoff.coverage.gate }, null, 2));
