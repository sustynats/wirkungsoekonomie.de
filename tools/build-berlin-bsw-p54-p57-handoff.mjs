import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(ROOT, 'woek-parlament-app');
const LEDGER_PATH = path.join(APP, 'data/state-programmes/fach-reviews/berlin-2026-bsw-v1.json');
const OUTPUT_PATH = path.join(APP, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p54-p57-explicit-v1.json');
const sha256 = (value) => createHash('sha256').update(value, 'utf8').digest('hex');
const ledger = JSON.parse(readFileSync(LEDGER_PATH, 'utf8'));

const snapshots = [
  [54, 5457955882],
  [55, 5457994484],
  [56, 5458013046],
  [57, 5458103067],
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

const excludedPreviouslyConsumed = new Set([
  'BE-BSW-P54-U01-a226a5a2869e',
]);
const frozenObjects = [
  ...ledger.source_units
    .filter((item) => item.pdf_page >= 54 && item.pdf_page <= 57 && item.atom_count === 0 && !excludedPreviouslyConsumed.has(item.source_unit_id))
    .map((item) => ({
      object_id: item.source_unit_id,
      object_kind: 'SOURCE_UNIT',
      pdf_page: item.pdf_page,
      source_text_sha256: item.source_text_sha256,
      source_locator: item.source_locator,
      exact: item.source_excerpt,
    })),
  ...ledger.effect_atoms
    .filter((item) => item.pdf_page >= 54 && item.pdf_page <= 57)
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
  counts_as_effect_object: state === 'EXPLICIT_FACH_APPROVED' || state.startsWith('EXPLICIT_FACH_APPROVED_') || state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
  decision_kind: kind,
}));

set('NON_EFFECT_CONTEXT_REVIEWED', 'STRUCTURAL_HEADING', 'BE-BSW-P54-U02-71a04ffac2cb', 'BE-BSW-P54-U06-f6154a193610', 'BE-BSW-P54-U09-ec438404117f');
set('NON_EFFECT_DISTRIBUTIONAL_TAX_POLICY_GOAL_AND_FRAME_REVIEWED', 'DISTRIBUTIONAL_TAX_POLICY_GOAL', 'BE-BSW-P54-U03-A01-dc6129e709d1');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'UNSPECIFIED_TAX_LOOPHOLE_AVOIDANCE_AND_EVASION_PACKAGE', 'BE-BSW-P54-U04-A01-86fc9687ba01');
set('NON_EFFECT_EVIDENTIARY_AND_CAUSAL_SOURCE_CLAIM_REVIEWED_WITH_PARTIAL_CURRENT_SUPPORT', 'TAX_ADMINISTRATION_CAPACITY_SOURCE_CLAIM', 'BE-BSW-P54-U04-A02-313715ff652f');
set('NON_EFFECT_COMPETENCE_AND_ADVOCACY_CONTEXT_REVIEWED', 'TAX_COMPETENCE_AND_BUNDESRAT_CONTEXT', 'BE-BSW-P54-U05-A01-0b1e67cac6d5');
set('NON_EFFECT_OVERBROAD_COMPETENCE_AND_EXPECTED_REVENUE_CLAIM_REVIEWED', 'OVERBROAD_TAX_COMPETENCE_CLAIM', 'BE-BSW-P54-U05-A02-352fe7d76b1a');
set('NON_EFFECT_TAX_RATE_BASELINE_AND_COMPARATOR_SOURCE_CONTEXT_REVIEWED', 'TRADE_TAX_RATE_COMPARATOR_CONTEXT', 'BE-BSW-P54-U07-a80f189afb0e');
set('EXPLICIT_FACH_APPROVED', 'BERLIN_TRADE_TAX_MULTIPLIER_UP_TO_460', 'BE-BSW-P54-U08-A01-b87a16d8da71');
set('NON_EFFECT_STATIC_REVENUE_SCENARIO_AND_SECOND_ORDER_OUTCOME_CLAIM_REVIEWED', 'TRADE_TAX_STATIC_REVENUE_AND_ATTRACTIVENESS_SCENARIO', 'BE-BSW-P54-U08-A02-521982dff2ea');
set('NON_EFFECT_TAX_REVENUE_COMPETENCE_AND_EXPECTED_YIELD_CONTEXT_REVIEWED', 'INHERITANCE_AND_WEALTH_TAX_REVENUE_CONTEXT', 'BE-BSW-P54-U10-670bb94d551b');
set('NON_EFFECT_DISTRIBUTIONAL_AND_TAX_EXPENDITURE_DIAGNOSIS_SOURCE_CLAIM_REVIEWED', 'INHERITANCE_TAX_RELIEF_DIAGNOSIS', 'BE-BSW-P54-U11-ba784252aeff');

set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'UNSPECIFIED_LARGE_INHERITANCE_RELIEF_REFORM', 'BE-BSW-P55-U01-A01-da8a10b6eef8');
set('EXPLICIT_FACH_APPROVED_WITH_SCOPE_DEFINITION_GUARD', 'INHERITANCE_ALLOWANCE_AND_FAMILY_HOME_PACKAGE', 'BE-BSW-P55-U01-A02-c58245d3b4ac');
set('NON_EFFECT_LEGAL_HISTORY_PLUS_POLITICAL_CAUSAL_ATTRIBUTION_REVIEWED', 'WEALTH_TAX_LEGAL_AND_POLITICAL_HISTORY', 'BE-BSW-P55-U02-A01-71248b7e908c');
set('NON_EFFECT_REVENUE_ASSIGNMENT_CONTEXT_REVIEWED', 'WEALTH_TAX_LAENDER_REVENUE_ASSIGNMENT', 'BE-BSW-P55-U02-A02-ae5ce1f87592');
set('NON_EFFECT_ADVOCACY_AND_PARENT_RESTATEMENT_REVIEWED', 'WEALTH_TAX_BUNDESRAT_ADVOCACY_PARENT', 'BE-BSW-P55-U02-A03-269102bfaf17');
set('EXPLICIT_FACH_APPROVED', 'PROGRESSIVE_NET_WEALTH_TAX_SCHEDULE', 'BE-BSW-P55-U02-A04-0c31c531f143');
set('NON_EFFECT_CONTEXT_REVIEWED', 'STRUCTURAL_HEADING', 'BE-BSW-P55-U03-3df906bc9542');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'UNSPECIFIED_SHARE_DEAL_LIMITATION', 'BE-BSW-P55-U04-A01-206ce780628e');
set('NON_EFFECT_DISTRIBUTIONAL_AND_TAX_AVOIDANCE_DIAGNOSIS_SOURCE_CLAIM_REVIEWED_WITH_CURRENT_LAW_GUARD', 'SHARE_DEAL_TAX_AVOIDANCE_SOURCE_CLAIM', 'BE-BSW-P55-U04-A02-80b639d24858');
set('NON_EFFECT_HOUSING_AND_TAX_POLICY_GOAL_REVIEWED', 'HOUSING_CONSTRUCTION_AND_ANTI_SPECULATION_GOAL', 'BE-BSW-P55-U05-A01-15a1ef848011');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'COMPOUND_PROPERTY_TAX_RELIEF_AND_SUBSIDY_PARENT', 'BE-BSW-P55-U05-A02-d9f919eabd56');
set('EXPLICIT_FACH_APPROVED', 'CAPITAL_INCOME_PERSONAL_TAX_RATE', 'BE-BSW-P55-U06-A01-dd0e871e218f');
set('NON_EFFECT_STATUS_QUO_POLICY_GUARD_REVIEWED', 'SECURITIES_GAINS_AND_LOSS_OFFSET_STATUS_QUO_GUARD', 'BE-BSW-P55-U06-A02-dffcdce88a1d');
set('EXPLICIT_FACH_APPROVED', 'RENTED_PROPERTY_PRIVATE_SALE_GAIN_TAX', 'BE-BSW-P55-U07-A01-e5d08f11946e');
set('EXPLICIT_FACH_APPROVED_WITH_ASSET_SCOPE_GUARD', 'CRYPTO_AND_GOLD_PRIVATE_SALE_GAIN_TAX', 'BE-BSW-P55-U07-A02-f1a643ac0690');

set('NON_EFFECT_SECTION_CONTEXT_REVIEWED', 'ENVIRONMENT_SECTION_CONTEXT', 'BE-BSW-P56-U01-5a454a999b21');
set('NON_EFFECT_MULTI_PROBLEM_AND_NORMATIVE_ENVIRONMENTAL_FRAME_REVIEWED', 'ENVIRONMENTAL_PROBLEM_AND_NORMATIVE_FRAME', 'BE-BSW-P56-U02-0c2da50b5b95');
set('NON_EFFECT_DISTRIBUTIONAL_ENVIRONMENTAL_GOAL_REVIEWED', 'DISTRIBUTIONAL_ENVIRONMENTAL_GOAL', 'BE-BSW-P56-U03-4b3e7f67a04f');
set('NON_EFFECT_CONTEXT_REVIEWED', 'STRUCTURAL_HEADING', 'BE-BSW-P56-U04-ba7e2cfc5ada', 'BE-BSW-P56-U10-dbfd711bcfa0');
set('NON_EFFECT_NORMATIVE_PUBLIC_GREEN_GOAL_REVIEWED', 'PUBLIC_GREEN_NORMATIVE_GOAL', 'BE-BSW-P56-U05-A01-3a8b61c787f6');
set('NON_EFFECT_EXPECTED_ECOSYSTEM_AND_SOCIAL_SERVICE_CLAIM_REVIEWED', 'GREEN_SPACE_ECOSYSTEM_AND_SOCIAL_OUTCOME_CLAIM', 'BE-BSW-P56-U05-A02-d463e232667b');
set('NON_EFFECT_NORMATIVE_END_STATE_AND_RHETORICAL_FRAME_REVIEWED', 'GREEN_CITY_RHETORICAL_END_STATE', 'BE-BSW-P56-U05-A03-82897ddbd285');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'UNSPECIFIED_PERMANENT_GREEN_AND_ALLOTMENT_PROTECTION', 'BE-BSW-P56-U06-A01-69da8dccb525');
set('EXPLICIT_FACH_APPROVED', 'BINDING_NEW_BUILD_GREENING_REQUIREMENTS', 'BE-BSW-P56-U06-A02-e817079f604c');
set('EXPLICIT_FACH_APPROVED_WITH_SITE_SELECTION_GUARD', 'DESEALING_ASPHALT_SURFACES', 'BE-BSW-P56-U06-A03-7b3df59eacdb');
set('NON_EFFECT_CURRENT_LEGAL_LIFECYCLE_CONTEXT_REVIEWED', 'TREE_LAW_CURRENT_LIFECYCLE_CONTEXT', 'BE-BSW-P56-U07-A01-26fe49e6c5a3');
set('NON_EFFECT_IMPLEMENTATION_GOAL_AND_RESTATEMENT_REVIEWED', 'TREE_OFFENSIVE_IMPLEMENTATION_GOAL', 'BE-BSW-P56-U07-A02-0880a4351ea7');
set('EXPLICIT_FACH_APPROVED', 'TREE_PLANTING_AND_CARE_FINANCING', 'BE-BSW-P56-U07-A03-f2cb64189027');
set('NON_EFFECT_RHETORICAL_ECOSYSTEM_SERVICE_FRAME_REVIEWED', 'TREE_ECOSYSTEM_RHETORICAL_FRAME', 'BE-BSW-P56-U07-A04-bc9c60f42fdd');
set('NON_EFFECT_EXPECTED_TREE_ECOSYSTEM_AND_WELLBEING_OUTCOME_CLAIM_REVIEWED', 'TREE_ECOSYSTEM_AND_WELLBEING_OUTCOME_CLAIM', 'BE-BSW-P56-U07-A05-96a2abc8b9b8');
set('NON_EFFECT_CURRENT_POLICY_DIRECTION_RESTATEMENT_REVIEWED_WITH_ADDITIONALITY_GUARD', 'SPONGE_CITY_CURRENT_POLICY_RESTATEMENT', 'BE-BSW-P56-U08-A01-ef852abf6e1c');
set('EXPLICIT_FACH_APPROVED', 'PUBLIC_DRINKING_WATER_POINTS_EXPANSION', 'BE-BSW-P56-U09-A01-a8fd3c50a880');
set('EXPLICIT_FACH_APPROVED', 'BLUE_GREEN_PUBLIC_SPACE_RETENTION_AND_COOLING', 'BE-BSW-P56-U09-A02-0d968c9c0e2f');
set('NON_EFFECT_BROADER_SCOPE_RESTATEMENT_AND_POLICY_DIRECTION_REVIEWED', 'CROSS_SECTOR_DESEALING_AND_RAINWATER_SCOPE_RESTATEMENT', 'BE-BSW-P56-U09-A03-4eac969acfa4');
set('NON_EFFECT_RHETORICAL_LANDSCAPE_FRAME_REVIEWED', 'BIODIVERSITY_LANDSCAPE_RHETORICAL_FRAME', 'BE-BSW-P56-U11-A01-bc8687a59195');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'FOUR_DISTINCT_LAND_USE_AND_MAINTENANCE_LEVERS', 'BE-BSW-P56-U11-A02-dbffc3ebd2c7');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'P56_P57_BROKEN_SENTENCE_FRAGMENT', 'BE-BSW-P56-U11-A03-727b5dd277d1', 'BE-BSW-P57-U01-17cf2a9d63b6');

set('NON_EFFECT_CONTEXT_REVIEWED', 'STRUCTURAL_HEADING', 'BE-BSW-P57-U02-5651286130a6', 'BE-BSW-P57-U06-583dd7066b3f', 'BE-BSW-P57-U08-c901f1e855e1');
set('NON_EFFECT_MULTI_GOAL_END_STATE_REVIEWED', 'AFFORDABILITY_CLIMATE_AND_SUSTAINABILITY_END_STATE', 'BE-BSW-P57-U03-A01-b6de5f05466b');
set('NON_EFFECT_BROAD_TRANSFORMATION_GOAL_REVIEWED', 'CONSTRUCTION_TRANSFORMATION_GOAL', 'BE-BSW-P57-U03-A02-a613e111c285');
set('EXPLICIT_FACH_APPROVED', 'ECOLOGICAL_MODULAR_CONSTRUCTION_FUNDING', 'BE-BSW-P57-U04-A01-26c8db02d668');
set('EXPLICIT_FACH_APPROVED', 'BIOBASED_CONSTRUCTION_MATERIAL_RESEARCH_FUNDING', 'BE-BSW-P57-U04-A02-cf7ab731924d');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'UNSPECIFIED_REGIONAL_PRODUCTION_ACTOR_MIX', 'BE-BSW-P57-U04-A03-99ff8419a303');
set('NON_EFFECT_SOURCE_CLAIM_AND_SYSTEM_RATIONALE_REVIEWED_WITH_BOUNDARY_GUARD', 'CONSTRUCTION_EMISSIONS_AND_SYSTEM_RATIONALE_SOURCE_CLAIM', 'BE-BSW-P57-U05-0b29878d67cf');
set('NON_EFFECT_DISTRIBUTIONAL_NONCOMPENSATION_GUARD_REVIEWED', 'SOCIAL_DIVISION_NONCOMPENSATION_GUARD', 'BE-BSW-P57-U07-A01-38fd230e452f');
set('NON_EFFECT_TENANT_AFFORDABILITY_AND_ANTI_DISPLACEMENT_GUARD_REVIEWED', 'TENANT_AFFORDABILITY_AND_ANTI_DISPLACEMENT_GUARD', 'BE-BSW-P57-U07-A02-7852c9aca530');
set('NON_EFFECT_GOVERNANCE_AND_ACCEPTANCE_PRINCIPLE_REVIEWED', 'ENVIRONMENTAL_GOVERNANCE_AND_ACCEPTANCE_PRINCIPLE', 'BE-BSW-P57-U07-A03-99af9f1c6d75');
set('NON_EFFECT_EXPECTED_MULTI_OUTCOME_RATIONALE_REVIEWED', 'CLEAN_GREEN_CITY_MULTI_OUTCOME_RATIONALE', 'BE-BSW-P57-U07-A04-4177859d42b2');
set('NON_EFFECT_CAUSAL_TRUST_OUTCOME_CLAIM_REVIEWED', 'PUBLIC_SPACE_TO_TRUST_CAUSAL_CLAIM', 'BE-BSW-P57-U07-A05-c4db0579a7f0');
set('NON_EFFECT_NORMATIVE_POLICY_DESIGN_FRAME_REVIEWED', 'PEOPLE_FIRST_ENVIRONMENTAL_POLICY_FRAME', 'BE-BSW-P57-U07-A06-2dd62ed45722');
set('NON_EFFECT_EXPECTED_EDUCATIONAL_AND_HEALTH_OUTCOME_CLAIM_REVIEWED', 'ENVIRONMENTAL_EDUCATION_OUTCOME_CLAIM', 'BE-BSW-P57-U09-A01-6ddb4afbc3e5');
set('NON_EFFECT_BEHAVIOURAL_CAUSAL_RATIONALE_REVIEWED', 'NATURE_LEARNING_BEHAVIOURAL_CAUSAL_RATIONALE', 'BE-BSW-P57-U09-A02-0e30ef21b357');
set('EXPLICIT_FACH_APPROVED', 'ENVIRONMENTAL_EDUCATION_INSTITUTION_AND_LEARNING_SITE_FUNDING', 'BE-BSW-P57-U09-A03-c13cc150ad48');
set('NON_EFFECT_DELIVERY_AND_FINANCING_GUARD_REVIEWED', 'ENVIRONMENTAL_EDUCATION_FINANCING_GUARD', 'BE-BSW-P57-U09-A04-0d345a906026');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'FUSED_ENVIRONMENTAL_EDUCATION_GOVERNANCE_AND_FUNDING_PARENT', 'BE-BSW-P57-U09-A05-5d5da2733c91');
set('EXPLICIT_FACH_APPROVED', 'REGULAR_CURRICULAR_ENVIRONMENTAL_EDUCATION_FROM_GRADE_ONE', 'BE-BSW-P57-U09-A06-ec9c52b5be06');
set('EXPLICIT_FACH_APPROVED', 'ENVIRONMENTAL_EDUCATION_NETWORK_STRENGTHENING', 'BE-BSW-P57-U09-A07-8ac037ec7699');
set('EXPLICIT_FACH_APPROVED', 'FREE_ENVIRONMENTAL_IDENTIFICATION_AND_LEARNING_APPS', 'BE-BSW-P57-U09-A08-297f29aacf7a');
set('NON_EFFECT_CONTEXT_REVIEWED', 'PRESERVED_STRUCTURAL_HEADING', 'BE-BSW-P57-U10-51b2c038907b');
set('NON_EFFECT_CONTEXT_REVIEWED', 'PRESERVED_REVIEWED_DIAGNOSIS_HISTORY_RATIONALE_OR_REPETITION', 'BE-BSW-P57-U11-c69303be48ee');

const deterministic = [];
const exactText = (id) => {
  const source = sourceObjects.find((item) => item.object_id === id);
  if (!source?.source_text) throw new Error(id + ': exact source text unavailable');
  return source.source_text;
};
const addRecord = ({ prefix, parents, source_text, state, kind, object_kind = 'DETERMINISTIC_SEGMENTATION_REPLACEMENT', parent_joiner = '', source_span, source_span_basis }) => {
  const hash = sha256(source_text);
  const record = {
    parent_object_ids: parents,
    ...(parent_joiner ? { parent_joiner } : {}),
    source_text,
    source_span,
    terminal_fach_state: state,
    counts_as_effect_object: state === 'EXPLICIT_FACH_APPROVED' || state.startsWith('EXPLICIT_FACH_APPROVED_') || state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
    decision_kind: kind,
    object_kind,
    object_id: prefix + '-' + hash.slice(0, 12),
    source_text_sha256: hash,
    source_span_basis,
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
const addJoined = (prefix, parents, joiner, state, kind) => {
  const source_text = parents.map(exactText).join(joiner);
  return addRecord({
    prefix,
    parents,
    parent_joiner: joiner,
    source_text,
    state,
    kind,
    object_kind: 'DETERMINISTIC_CROSS_PAGE_SEMANTIC_REPLACEMENT',
    source_span: { start: 0, end: source_text.length },
    source_span_basis: 'UTF16_CODE_UNIT_OFFSETS_IN_EXACT_JOINED_PARENT_SOURCE_TEXT',
  });
};

addSlice('BE-BSW-P55-U05-A02-C01', 'BE-BSW-P55-U05-A02-d9f919eabd56', 'Deshalb soll sich Berlin in einer Bundesratsinitiative dafür einsetzen, dass die Befreiung vermögensverwaltender Immobiliengesellschaften von der Gewerbesteuer abgeschafft', 'EXPLICIT_FACH_APPROVED', 'PROPERTY_COMPANY_TRADE_TAX_RELIEF_REMOVAL');
addSlice('BE-BSW-P55-U05-A02-C02', 'BE-BSW-P55-U05-A02-d9f919eabd56', 'durch gezielte Fördermaßnahmen ersetzt wird.', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'UNSPECIFIED_TARGETED_REPLACEMENT_SUPPORT');
addSlice('BE-BSW-P56-U11-A02-C01', 'BE-BSW-P56-U11-A02-dbffc3ebd2c7', 'Blühwiesen', 'EXPLICIT_FACH_APPROVED', 'FLOWERING_MEADOWS');
addSlice('BE-BSW-P56-U11-A02-C02', 'BE-BSW-P56-U11-A02-dbffc3ebd2c7', 'Streuobstbestände', 'EXPLICIT_FACH_APPROVED', 'ORCHARD_MEADOW_STOCKS');
addSlice('BE-BSW-P56-U11-A02-C03', 'BE-BSW-P56-U11-A02-dbffc3ebd2c7', 'urbane Landwirtschaft', 'EXPLICIT_FACH_APPROVED', 'URBAN_AGRICULTURE');
addSlice('BE-BSW-P56-U11-A02-C04', 'BE-BSW-P56-U11-A02-dbffc3ebd2c7', 'ökologische Pflege statt kahler Flächenpflege', 'EXPLICIT_FACH_APPROVED', 'ECOLOGICAL_LANDSCAPE_MAINTENANCE');
addJoined('BE-BSW-P56P57-U11U01-M01', ['BE-BSW-P56-U11-A03-727b5dd277d1', 'BE-BSW-P57-U01-17cf2a9d63b6'], ' ', 'NON_EFFECT_EXPECTED_BIODIVERSITY_ECOSYSTEM_RESILIENCE_OUTCOME_AND_RATIONALE_REVIEWED', 'CROSS_PAGE_BIODIVERSITY_OUTCOME_AND_RATIONALE');
addSlice('BE-BSW-P57-U09-A05-C01', 'BE-BSW-P57-U09-A05-5d5da2733c91', 'Berlin soll Umweltbildung als öffentliche Aufgabe begreifen und dauerhaft verankern.', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'ENVIRONMENTAL_EDUCATION_PUBLIC_TASK_INSTITUTIONALISATION_UNSPECIFIED');
addSlice('BE-BSW-P57-U09-A05-C02', 'BE-BSW-P57-U09-A05-5d5da2733c91', 'Wir fordern: Planungssichere Förderung für Projekte, Institutionen und Multiplikatoren, die kontinuierlich Umweltbildung leisten.', 'EXPLICIT_FACH_APPROVED', 'PREDICTABLE_ENVIRONMENTAL_EDUCATION_PROVIDER_FUNDING');

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
const normalize = (state) => state.startsWith('NON_EFFECT_') ? 'NON_EFFECT_CONTEXT_REVIEWED' : state.startsWith('EXPLICIT_FACH_APPROVED_') ? 'EXPLICIT_FACH_APPROVED' : state;
const terminalRecords = [...original.values(), ...deterministic];
const counts = terminalRecords.reduce((acc, item) => {
  const state = normalize(item.authoritative_terminal_fach_state || item.terminal_fach_state);
  acc[state] += 1;
  return acc;
}, { EXPLICIT_FACH_APPROVED: 0, REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 0, NON_EFFECT_CONTEXT_REVIEWED: 0, SOURCE_UNIT_RECLASSIFIED_VERSIONED: 0 });
const active = counts.EXPLICIT_FACH_APPROVED + counts.REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON;
if (sourceObjects.length !== 77 || deterministic.length !== 9 || terminalRecords.length !== 86 || active !== 30) {
  throw new Error('set-wise count drift ' + JSON.stringify({ source: sourceObjects.length, deterministic: deterministic.length, terminal: terminalRecords.length, active, counts }));
}

const handoff = {
  schema_version: 'woek-explicit-fach-handoff-2.0',
  handoff_id: 'BE-BSW-P54-P57-EXPLICIT-FACH-2026-V1',
  base_main_commit: '0ff0b3cda054da34d7c977904e19e01e6d2296b8',
  artifact_id: ledger.artifact.artifact_id,
  artifact_sha256: ledger.artifact.artifact_sha256,
  artifact_byte_length: ledger.artifact.byte_length,
  artifact_page_count: ledger.artifact.page_count,
  controller: {
    issue: 241,
    issue_comment_id: 5460142128,
    issue_comment_url: 'https://github.com/sustynats/wirkungsoekonomie.de/issues/241#issuecomment-5460142128',
  },
  authoritative_markdowns: snapshots,
  source_objects: sourceObjects,
  original_records: [...original.values()],
  deterministic_records: deterministic,
  deterministic_open_children: [],
  deterministic_child_contract: {
    id_rule: 'stable structural prefix plus first 12 hex characters of SHA-256(exact UTF-8 deterministic source text)',
    source_span_basis: ['UTF16_CODE_UNIT_OFFSETS_IN_EXACT_PARENT_SOURCE_TEXT', 'UTF16_CODE_UNIT_OFFSETS_IN_EXACT_JOINED_PARENT_SOURCE_TEXT'],
    semantics_rule: 'IDs, hashes, exact text spans and lineage are mechanical; Fach is copied only from the cited WÖk comments or the two explicitly enumerated unchanged terminal stock records.',
  },
  coverage: {
    protected_fach_terminal_physical_scope: 'P1-P53',
    segmented_physical_pages: [54, 55, 56, 57],
    prior_cross_page_fragment: 'P54-U01 remains consumed by the P53-P54 record materialised in the prior handoff',
    unchanged_pre_reviewed_context: ['BE-BSW-P57-U10-51b2c038907b', 'BE-BSW-P57-U11-c69303be48ee'],
    next_opaque_page_review_envelope_from: 58,
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
    gates: [
      'BE_BSW_P54_FACH_COMPLETE_PASS_SOURCE_BOUND_AFTER_PRIOR_P53_FRAGMENT_CONSUMPTION',
      'BE_BSW_P55_FACH_COMPLETE_PASS_SOURCE_BOUND_AFTER_U05_COMPOUND_REPAIR',
      'BE_BSW_P56_FACH_COMPLETE_PASS_SOURCE_BOUND_AFTER_U11_COMPOUND_AND_P57_FRAGMENT_REPAIRS',
      'BE_BSW_P57_FACH_COMPLETE_PASS_SOURCE_BOUND_AFTER_P56_FRAGMENT_AND_U09_A05_REPAIR',
    ],
  },
  constraints: {
    fach_inferred_from_source: false,
    dns_synthesized: false,
    recommendation_synthesized: false,
    score_synthesized: false,
    party_wide_judgement_synthesized: false,
    p58_page_envelope_closed: false,
    vercel_action_triggered: false,
  },
};

const encoded = JSON.stringify(handoff, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (readFileSync(OUTPUT_PATH, 'utf8') !== encoded) throw new Error('P54-P57 handoff is not deterministic/current');
} else {
  writeFileSync(OUTPUT_PATH, encoded);
}
console.log(JSON.stringify({ output: path.relative(ROOT, OUTPUT_PATH), counts, deterministic_ids: deterministic.map((item) => item.object_id), gates: handoff.coverage.gates }, null, 2));
