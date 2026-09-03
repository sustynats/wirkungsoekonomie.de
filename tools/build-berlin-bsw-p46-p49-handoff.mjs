import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(ROOT, 'woek-parlament-app');
const LEDGER_PATH = path.join(APP, 'data/state-programmes/fach-reviews/berlin-2026-bsw-v1.json');
const OUTPUT_PATH = path.join(APP, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p46-p49-explicit-v1.json');
const sha256 = (value) => createHash('sha256').update(value, 'utf8').digest('hex');
const ledger = JSON.parse(readFileSync(LEDGER_PATH, 'utf8'));

const snapshots = [
  [46, 5458773627],
  [47, 5458802801],
  [48, 5458817464],
  [49, 5457760204],
].map(([pdf_page, issue_comment_id]) => {
  const relative = `woek-parlament-app/data/state-programmes/fach-reviews/berlin-2026-bsw-p${pdf_page}-authoritative-handoff.md`;
  return {
    pdf_page,
    issue: 240,
    issue_comment_id,
    issue_comment_url: `https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-${issue_comment_id}`,
    path: relative,
    file_sha256: sha256(readFileSync(path.join(ROOT, relative), 'utf8')),
  };
});

const frozenObjects = [
  ...ledger.source_units
    .filter((item) => ((item.pdf_page >= 46 && item.pdf_page <= 49) || item.source_unit_id === 'BE-BSW-P50-U01-bb3d4390ad9a') && item.atom_count === 0)
    .map((item) => ({
      object_id: item.source_unit_id,
      object_kind: 'SOURCE_UNIT',
      pdf_page: item.pdf_page,
      source_text_sha256: item.source_text_sha256,
      source_locator: item.source_locator,
      exact: item.source_excerpt,
    })),
  ...ledger.effect_atoms
    .filter((item) => item.pdf_page >= 46 && item.pdf_page <= 49)
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

set('NON_EFFECT_CONTEXT_REVIEWED', 'STRUCTURAL_HEADING',
  'BE-BSW-P46-U03-dd84466dfa6d', 'BE-BSW-P46-U13-53ce8855139b',
  'BE-BSW-P48-U03-381203f1f6b4', 'BE-BSW-P48-U06-152396dd78db',
  'BE-BSW-P49-U01-37ced15760ca', 'BE-BSW-P49-U04-e3f76aa8553d', 'BE-BSW-P49-U07-27589962eae7');
set('NON_EFFECT_PROBLEM_DIAGNOSIS_REVIEWED', 'SOURCE_DIAGNOSIS_AND_SYSTEM_CONTEXT', 'BE-BSW-P48-U02-2b263d920996');

set('EXPLICIT_FACH_APPROVED', 'CO2_PRICE_ABOLITION', 'BE-BSW-P46-U01-A01-3b0a665ac407');
set('NON_EFFECT_CAUSAL_PRICE_MECHANISM_CLAIM_REVIEWED', 'RATIONALE_OR_EXPECTED_CONSEQUENCE', 'BE-BSW-P46-U01-A02-7dc86840e180');
set('NON_EFFECT_AGGREGATE_DISTRIBUTIONAL_CLAIM_REVIEWED', 'SOURCE_DISTRIBUTIONAL_CLAIM', 'BE-BSW-P46-U01-A03-2471cbe08cdb');
set('NON_EFFECT_DISTRIBUTIONAL_GOAL_REVIEWED', 'DISTRIBUTIONAL_GOAL', 'BE-BSW-P46-U02-A01-536ddb5be356');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'ELECTRICITY_PRICE_RELIEF_INSTRUMENT_UNSPECIFIED', 'BE-BSW-P46-U02-A02-26546604a1cb');
set('EXPLICIT_FACH_APPROVED', 'GRID_STORAGE_AND_DIGITAL_INVESTMENT', 'BE-BSW-P46-U02-A03-aa7cbe821f7f');
set('NON_EFFECT_TARGET_STATE_AND_CURRENT_BASELINE_CLAIM_REVIEWED', 'PCK_TARGET_STATE', 'BE-BSW-P46-U04-A01-54e6b9cad917');
set('EXPLICIT_FACH_APPROVED', 'NORD_STREAM_REOPENING_ADVOCACY', 'BE-BSW-P46-U05-A01-17bec11747b0');
set('EXPLICIT_FACH_APPROVED', 'ENERGY_INFRASTRUCTURE_CURTAILMENT_AND_RESERVE', 'BE-BSW-P46-U06-A01-e589e9472c2e');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'MALFORMED_IMPLEMENTATION_LIST_FRAGMENT', 'BE-BSW-P46-U06-A02-2700fb8a3dd2', 'BE-BSW-P46-U06-A03-6d99162ea566');
set('NON_EFFECT_SYSTEM_COHERENCE_DESIGN_GUARD_REVIEWED', 'PV_INFRASTRUCTURE_COHERENCE_GUARD', 'BE-BSW-P46-U07-A01-2b71c19daba9');
set('EXPLICIT_FACH_APPROVED', 'DISTRICT_HEATING_EXPANSION', 'BE-BSW-P46-U08-A01-945bde3bbbc3');
set('NON_EFFECT_EXISTING_GOVERNANCE_BASELINE_AND_COHERENCE_GUARD_REVIEWED', 'MUNICIPAL_HEAT_PLAN_BASELINE', 'BE-BSW-P46-U08-A02-e7124d02b0a5');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'PROJECT_PRIORITY_INSTRUMENT_UNSPECIFIED', 'BE-BSW-P46-U08-A03-1cc17816d759');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'PERMITTING_LAW_AND_SAFEGUARD_DELTA_UNSPECIFIED', 'BE-BSW-P46-U08-A04-8242f3d8bd99');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'MALFORMED_COAL_RETIREMENT_SENTENCE_FRAGMENT', 'BE-BSW-P46-U09-A01-13208906d601', 'BE-BSW-P46-U09-A02-7eb61e4a771f');
set('EXPLICIT_FACH_APPROVED', 'GAS_NETWORK_RETENTION', 'BE-BSW-P46-U09-A03-3103f7bf89c9');
set('EXPLICIT_FACH_APPROVED', 'GASAG_REMUNICIPALISATION', 'BE-BSW-P46-U10-A01-aa039fcae982');
set('EXPLICIT_FACH_APPROVED', 'DEMAND_ALIGNED_GREEN_HYDROGEN_NETWORK', 'BE-BSW-P46-U11-A01-eba398e44626');
set('NON_EFFECT_USE_CASE_PRIORITISATION_RATIONALE_REVIEWED', 'HYDROGEN_USE_CASE_TARGETING', 'BE-BSW-P46-U11-A02-a9008b5b4b6c');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'ENERGY_TECH_COMPONENT_ANTI_RELOCATION_INSTRUMENT_UNSPECIFIED', 'BE-BSW-P46-U12-A01-633dd9f532e4');
set('NON_EFFECT_ECONOMIC_DESIGN_GUARD_REVIEWED', 'LIFECYCLE_ECONOMIC_DESIGN_GUARD', 'BE-BSW-P46-U14-A01-e86a4c8a4bf7');

set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'MALFORMED_HEAT_PUMP_NETWORK_SENTENCE_FRAGMENT', 'BE-BSW-P47-U01-A01-6a2348e8be71', 'BE-BSW-P47-U01-A02-ae417a1a413f');
set('NON_EFFECT_MARGINAL_IMPACT_AND_COST_EFFECTIVENESS_DESIGN_GUARD_REVIEWED', 'MARGINAL_IMPACT_ALLOCATION_GUARD', 'BE-BSW-P47-U02-A01-465b845ac6cc');
set('NON_EFFECT_NORMATIVE_POLICY_PRIORITY_FRAME_REVIEWED', 'ANTI_TARGET_RHETORICAL_FRAME', 'BE-BSW-P47-U02-A02-4164ec1a74e2');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'TECHNOLOGY_RESEARCH_SUPPORT_INSTRUMENT_UNSPECIFIED', 'BE-BSW-P47-U03-A01-dc1476d3a42d');
set('NON_EFFECT_TECHNOLOGY_EXAMPLE_SCOPE_REVIEWED', 'HYDROGEN_AND_SYNTHETIC_FUEL_EXAMPLES', 'BE-BSW-P47-U03-A02-2f013f7c0efb');
set('NON_EFFECT_TECHNOLOGY_COMPARISON_RATIONALE_REVIEWED', 'TECHNOLOGY_PROS_AND_CONS_RATIONALE', 'BE-BSW-P47-U03-A03-b46bd2264eb0');
set('EXPLICIT_FACH_APPROVED', 'CCS_AND_CCU_SUPPORT', 'BE-BSW-P47-U04-A01-48550be8d573');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'MALFORMED_STORAGE_SUPPORT_SENTENCE_FRAGMENT', 'BE-BSW-P47-U05-A01-90ab03ddb969', 'BE-BSW-P47-U05-A02-0683261296fe');
set('NON_EFFECT_RESOURCE_POTENTIAL_AND_EXPECTED_OUTCOME_CLAIM_REVIEWED', 'GEOTHERMAL_RESOURCE_POTENTIAL_CLAIM', 'BE-BSW-P47-U06-A01-28befc44f29e');
set('EXPLICIT_FACH_APPROVED', 'GEOTHERMAL_DEMONSTRATION_AND_RESEARCH', 'BE-BSW-P47-U06-A02-df55264bada6');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'COMPOUND_HEAT_ADAPTATION_LIST_PARENT', 'BE-BSW-P47-U07-A01-ac033f6b604f');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'COMPOUND_WIND_POLICY_PARENT', 'BE-BSW-P47-U08-A01-7cb685beaad5');
set('EXPLICIT_FACH_APPROVED', 'WIND_REPOWERING', 'BE-BSW-P47-U08-A02-1862cc9fddf1');
set('NON_EFFECT_DEFINITION_REVIEWED', 'REPOWERING_DEFINITION', 'BE-BSW-P47-U08-A03-db77b10e4e82');
set('NON_EFFECT_EXPECTED_OUTCOME_CLAIM_REVIEWED', 'REPOWERING_EXPECTED_OUTCOME_CLAIM', 'BE-BSW-P47-U08-A04-82f503052981');

set('NON_EFFECT_NORMATIVE_POLICY_FRAME_REVIEWED', 'MOBILITY_NORMATIVE_FRAME', 'BE-BSW-P48-U01-A01-284b755466f4');
set('NON_EFFECT_MODAL_COHERENCE_GOAL_REVIEWED', 'MODAL_COHERENCE_GOAL', 'BE-BSW-P48-U01-A02-f5a7ad8b6e2e');
set('NON_EFFECT_MULTI_MODAL_TARGET_STATE_REVIEWED', 'MULTIMODAL_TARGET_STATE', 'BE-BSW-P48-U01-A03-eb1521ca39b7');
set('NON_EFFECT_ACCESS_AND_DEPENDENCY_DIAGNOSIS_CLAIM_REVIEWED', 'CAR_DEPENDENCY_SOURCE_CLAIM', 'BE-BSW-P48-U01-A04-06cdde67f23f');
set('NON_EFFECT_POLICY_PRIORITY_AND_SPATIAL_GOAL_REVIEWED', 'OUTER_DISTRICT_TRANSIT_PRIORITY', 'BE-BSW-P48-U04-A01-99aec02f9c87');
set('NON_EFFECT_SERVICE_DEFICIT_DIAGNOSIS_CLAIM_REVIEWED', 'TRANSIT_SERVICE_DEFICIT_SOURCE_CLAIM', 'BE-BSW-P48-U04-A02-dfec33084059');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'COMPOUND_MODAL_EXPANSION_PARENT', 'BE-BSW-P48-U04-A03-e81f62d9b934');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'TWO_CABLE_CAR_PROJECTS_PARENT', 'BE-BSW-P48-U04-A04-21a1989ffc91');
set('EXPLICIT_FACH_APPROVED', 'CABLE_CAR_FARE_AND_NETWORK_INTEGRATION', 'BE-BSW-P48-U04-A05-104c39b0ec69');
set('NON_EFFECT_PROJECT_SELECTION_AND_BENEFIT_TEST_GUARD_REVIEWED', 'U_BAHN_PROJECT_SELECTION_GUARD', 'BE-BSW-P48-U04-A06-58a443380aaf');
set('NON_EFFECT_PROJECT_SELECTION_AND_NETWORK_GAP_GUARD_REVIEWED', 'TRAM_PROJECT_SELECTION_GUARD', 'BE-BSW-P48-U04-A07-68bf517c3fd0');
set('EXPLICIT_FACH_APPROVED', 'BUS_TRAM_NETWORK_REDESIGN', 'BE-BSW-P48-U05-A01-00098694378e');
set('NON_EFFECT_OPTION_SPACE_AND_RATIONALE_REVIEWED', 'FLEXIBLE_TRANSIT_OPTION_SPACE', 'BE-BSW-P48-U05-A02-7f53a793d737');
set('EXPLICIT_FACH_APPROVED', 'LOW_DENSITY_ON_DEMAND_TRANSIT', 'BE-BSW-P48-U05-A03-16ed75cf3524');
set('NON_EFFECT_RESTATEMENT_AND_CONTINUATION_GOAL_REVIEWED', 'ON_DEMAND_CONTINUATION_RESTATEMENT', 'BE-BSW-P48-U05-A04-dbab479d21f7');
set('NON_EFFECT_TECHNOLOGY_OPTION_APPRAISAL_REVIEWED', 'TROLLEYBUS_OPTION_APPRAISAL', 'BE-BSW-P48-U05-A05-40a7121a76db');
set('NON_EFFECT_NORMATIVE_OUTCOME_PRIORITY_FRAME_REVIEWED', 'ACCESSIBILITY_PRIORITY_FRAME', 'BE-BSW-P48-U05-A06-12f6965a428d');
set('NON_EFFECT_INTERGOVERNMENTAL_COHERENCE_GOAL_REVIEWED', 'BERLIN_BRANDENBURG_COOPERATION_GOAL', 'BE-BSW-P48-U07-A01-a0e5c7f0fef9');
set('NON_EFFECT_SPATIAL_DEMAND_CONTEXT_CLAIM_REVIEWED', 'METROPOLITAN_REGION_CONTEXT', 'BE-BSW-P48-U07-A02-2fa72e8f675f');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'COMPOUND_TARIFF_COMMUTER_STUDENT_TICKET_PARENT', 'BE-BSW-P48-U07-A03-ad2e2b61d926');
set('EXPLICIT_FACH_APPROVED', 'PARK_AND_RIDE_AT_CITY_EDGES', 'BE-BSW-P48-U07-A04-08e54cbed207');

set('NON_EFFECT_POLICY_PRIORITY_GOAL_REVIEWED', 'WALKING_PRIORITY_GOAL', 'BE-BSW-P49-U02-A01-d41146ef291e');
set('NON_EFFECT_DESIGN_GOAL_AND_MEASURE_EXAMPLES_REVIEWED', 'WALKING_DESIGN_EXAMPLES', 'BE-BSW-P49-U02-A02-dba137801e68');
set('NON_EFFECT_TARGETING_AND_SAFETY_PRIORITY_REVIEWED', 'VULNERABLE_LOCATION_SAFETY_PRIORITY', 'BE-BSW-P49-U02-A03-7f881af62b46');
set('EXPLICIT_FACH_APPROVED', 'PUBLIC_SPACE_ACCESSIBILITY_LIFECYCLE_INTEGRATION', 'BE-BSW-P49-U03-A01-27963dbe53e9');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'OUTER_DISTRICT_ACCESS_IMPROVEMENT_UNSPECIFIED', 'BE-BSW-P49-U03-A02-caec83208cc7');
set('NON_EFFECT_NETWORK_GOAL_REVIEWED', 'CYCLING_NETWORK_GOAL', 'BE-BSW-P49-U05-A01-4dd451b87b91');
set('NON_EFFECT_CONTINUITY_GOAL_REVIEWED', 'CYCLING_CONTINUITY_GOAL', 'BE-BSW-P49-U05-A02-47ad05759328');
set('NON_EFFECT_SOURCE_DIAGNOSIS_REVIEWED', 'CYCLING_GAP_DIAGNOSIS', 'BE-BSW-P49-U05-A03-b297a18f946b');
set('EXPLICIT_FACH_APPROVED', 'TARGETED_CYCLING_GAP_EXPANSION', 'BE-BSW-P49-U05-A04-0c04cf40f271');
set('EXPLICIT_FACH_APPROVED', 'SAFE_SEPARATED_CYCLING_INFRASTRUCTURE', 'BE-BSW-P49-U06-A01-54abab1cb9e3');
set('EXPLICIT_FACH_APPROVED', 'SEPARATE_TURNING_AND_CYCLING_SIGNAL_PHASES', 'BE-BSW-P49-U06-A02-37cf0ea0a927');
set('NON_EFFECT_SYSTEM_CONTEXT_REVIEWED', 'MOTORISED_INDIVIDUAL_TRANSPORT_CONTEXT', 'BE-BSW-P49-U08-A01-f6e0f95c23da');
set('NON_EFFECT_SOURCE_DIAGNOSIS_AND_DISTRIBUTION_CLAIM_REVIEWED', 'CAR_DEPENDENCY_AND_AFFORDABILITY_CLAIM', 'BE-BSW-P49-U08-A02-9f2809d416c4');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'UNSPECIFIED_CITY_TAX_REJECTION', 'BE-BSW-P49-U08-A03-079d869cea58');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'UNSPECIFIED_CLIMATE_FRIENDLY_DRIVE_SUPPORT', 'BE-BSW-P49-U08-A04-0cf4aff377a0');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'ROAD_BOTTLENECK_AND_TREATMENT_UNSPECIFIED', 'BE-BSW-P49-U09-A01-1400cd99a821');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'FALSE_ORDINAL_SENTENCE_SPLIT', 'BE-BSW-P49-U09-A02-69c0d37055a1', 'BE-BSW-P49-U09-A03-8dbef6f424bb');
set('NON_EFFECT_PARTICIPATION_AND_PROTECTED_INTEREST_SAFEGUARD_REVIEWED', 'A100_PARTICIPATION_SAFEGUARD', 'BE-BSW-P49-U09-A04-631452e7af83');
set('NON_EFFECT_EXPECTED_OUTCOME_CLAIM_REVIEWED', 'A100_EXPECTED_TRAFFIC_RELIEF_CLAIM', 'BE-BSW-P49-U09-A05-6049e3777a4e');
set('NON_EFFECT_NORMATIVE_AND_CAUSAL_FRAME_REVIEWED', 'PARKING_AND_TRAFFIC_DISPLACEMENT_FRAME', 'BE-BSW-P49-U10-A01-c6e046317ca1');
set('EXPLICIT_FACH_APPROVED', 'CONDITIONAL_KIEZBLOCK_REJECTION_RULE', 'BE-BSW-P49-U10-A02-389dc1413687');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'COMPOUND_PARKING_INSTRUMENT_PARENT', 'BE-BSW-P49-U10-A03-92fb10ce4c2e');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'P49_P50_CROSS_PAGE_FREIGHT_DIAGNOSIS_FRAGMENT', 'BE-BSW-P49-U11-b26ec37a3382', 'BE-BSW-P50-U01-bb3d4390ad9a');

const deterministic = [];
const exactText = (id) => {
  const source = sourceObjects.find((item) => item.object_id === id);
  if (!source?.source_text) throw new Error(`${id}: exact source text unavailable`);
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
    object_id: `${prefix}-${hash.slice(0, 12)}`,
    source_text_sha256: hash,
    source_span_basis,
    ...(reconstruction_mode ? { reconstruction_mode } : {}),
    ...(source_segments ? { source_segments } : {}),
  };
  deterministic.push(record);
  return record;
};
const addJoined = (prefix, parents, joiner, state, kind, object_kind = 'DETERMINISTIC_SEGMENTATION_REPLACEMENT') => {
  const source_text = parents.map(exactText).join(joiner);
  return addRecord({ prefix, parents, parent_joiner: joiner, source_text, state, kind, object_kind, source_span: { start: 0, end: source_text.length }, source_span_basis: 'UTF16_CODE_UNIT_OFFSETS_IN_EXACT_JOINED_PARENT_SOURCE_TEXT' });
};
const addSlice = (prefix, parent, needle, state, kind, object_kind = 'DETERMINISTIC_SEGMENTATION_REPLACEMENT') => {
  const text = exactText(parent);
  const start = text.indexOf(needle);
  if (start < 0) throw new Error(`${parent}: slice not found: ${needle}`);
  return addRecord({ prefix, parents: [parent], source_text: needle, state, kind, object_kind, source_span: { start, end: start + needle.length }, source_span_basis: 'UTF16_CODE_UNIT_OFFSETS_IN_EXACT_PARENT_SOURCE_TEXT' });
};

addJoined('BE-BSW-P46-U06-M01', ['BE-BSW-P46-U06-A02-2700fb8a3dd2', 'BE-BSW-P46-U06-A03-6d99162ea566'], ' ', 'NON_EFFECT_IMPLEMENTATION_EXAMPLE_PORTFOLIO_REVIEWED', 'ENERGY_INFRASTRUCTURE_IMPLEMENTATION_EXAMPLE_LIST');
addJoined('BE-BSW-P46-U09-M01', ['BE-BSW-P46-U09-A01-13208906d601', 'BE-BSW-P46-U09-A02-7eb61e4a771f'], ' ', 'EXPLICIT_FACH_APPROVED', 'COAL_RETIREMENT_REPLACEMENT_AVAILABILITY_CONDITION');
addJoined('BE-BSW-P47-U01-M01', ['BE-BSW-P47-U01-A01-6a2348e8be71', 'BE-BSW-P47-U01-A02-ae417a1a413f'], ' ', 'EXPLICIT_FACH_APPROVED', 'LARGE_HEAT_PUMP_NETWORK_AND_THERMAL_STORAGE_INTEGRATION');
addJoined('BE-BSW-P47-U05-M01', ['BE-BSW-P47-U05-A01-90ab03ddb969', 'BE-BSW-P47-U05-A02-0683261296fe'], ' ', 'EXPLICIT_FACH_APPROVED', 'ELECTRICITY_AND_HEAT_STORAGE_DEVELOPMENT_SUPPORT');
addSlice('BE-BSW-P47-U07-A01-C01', 'BE-BSW-P47-U07-A01-ac033f6b604f', 'Baumpflanzungen', 'EXPLICIT_FACH_APPROVED', 'URBAN_TREE_PLANTING');
{
  const parent = 'BE-BSW-P47-U07-A01-ac033f6b604f';
  const phrase = 'Fassaden- und Dachbegrünung';
  const start = exactText(parent).indexOf(phrase);
  addRecord({
    prefix: 'BE-BSW-P47-U07-A01-C02', parents: [parent], source_text: 'Fassadenbegrünung', state: 'EXPLICIT_FACH_APPROVED', kind: 'FACADE_GREENING',
    source_span: { start, end: start + phrase.length }, source_span_basis: 'AUTHORITATIVE_ELLIPTICAL_LIST_EXPANSION_FROM_EXACT_PARENT_SPAN',
    reconstruction_mode: 'AUTHORITATIVE_ELLIPTICAL_LIST_EXPANSION', source_segments: [{ parent_object_id: parent, start, end: start + phrase.length, source_text: phrase }],
  });
}
addSlice('BE-BSW-P47-U07-A01-C03', 'BE-BSW-P47-U07-A01-ac033f6b604f', 'Dachbegrünung', 'EXPLICIT_FACH_APPROVED', 'ROOF_GREENING');
addSlice('BE-BSW-P47-U07-A01-C04', 'BE-BSW-P47-U07-A01-ac033f6b604f', 'offene Wasserflächen', 'EXPLICIT_FACH_APPROVED', 'OPEN_WATER_SURFACES');
addSlice('BE-BSW-P47-U07-A01-C05', 'BE-BSW-P47-U07-A01-ac033f6b604f', 'Trinkwasserbrunnen', 'EXPLICIT_FACH_APPROVED', 'DRINKING_WATER_FOUNTAINS');
addSlice('BE-BSW-P47-U07-A01-C06', 'BE-BSW-P47-U07-A01-ac033f6b604f', 'Kühlräume', 'EXPLICIT_FACH_APPROVED', 'COOLING_ROOMS');
addSlice('BE-BSW-P47-U08-A01-C01', 'BE-BSW-P47-U08-A01-7cb685beaad5', 'Wir fordern den Verzicht auf die Errichtung von Windrädern in Berlin', 'EXPLICIT_FACH_APPROVED', 'NO_NEW_WIND_TURBINES_IN_BERLIN');
addSlice('BE-BSW-P47-U08-A01-C02', 'BE-BSW-P47-U08-A01-7cb685beaad5', 'eine Initiative zur Veränderung des Wind-an-Land-Gesetzes, um die Flächenvorgaben für Windenergieanlagen abzuschaffen', 'EXPLICIT_FACH_APPROVED', 'FEDERAL_WINDBG_AREA_TARGET_REPEAL_INITIATIVE');

for (const [index, needle, kind] of [
  [1, 'U-Bahn', 'TARGETED_U_BAHN_EXPANSION'], [2, 'S-Bahn', 'TARGETED_S_BAHN_EXPANSION'], [3, 'Straßenbahn', 'TARGETED_TRAM_EXPANSION'], [4, 'Bus', 'TARGETED_BUS_EXPANSION'],
]) addSlice(`BE-BSW-P48-U04-A03-C0${index}`, 'BE-BSW-P48-U04-A03-e81f62d9b934', needle, 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', kind);
addSlice('BE-BSW-P48-U04-A04-C01', 'BE-BSW-P48-U04-A04-21a1989ffc91', 'Treptow-Köpenick', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'TREPTOW_KOEPENICK_CABLE_CAR_PROJECT');
addSlice('BE-BSW-P48-U04-A04-C02', 'BE-BSW-P48-U04-A04-21a1989ffc91', 'Pankow Nord', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'PANKOW_NORD_CABLE_CAR_PROJECT');
addSlice('BE-BSW-P48-U07-A03-C01', 'BE-BSW-P48-U07-A03-ad2e2b61d926', 'die Tarifstruktur zwischen Berlin und Brandenburg neu ordnen', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'BERLIN_BRANDENBURG_TARIFF_REORGANISATION');
addSlice('BE-BSW-P48-U07-A03-C02', 'BE-BSW-P48-U07-A03-ad2e2b61d926', 'Pendlerverkehre stärker berücksichtigen', 'NON_EFFECT_DEMAND_PLANNING_AND_DISTRIBUTION_GUARD_REVIEWED', 'COMMUTER_FLOW_PLANNING_GUARD');
addSlice('BE-BSW-P48-U07-A03-C03', 'BE-BSW-P48-U07-A03-ad2e2b61d926', 'uns für ein kostenloses Schülerticket in der gesamten Region einsetzen', 'EXPLICIT_FACH_APPROVED', 'FREE_STUDENT_TICKET_WHOLE_REGION');

addJoined('BE-BSW-P49-U09-A02', ['BE-BSW-P49-U09-A02-69c0d37055a1', 'BE-BSW-P49-U09-A03-8dbef6f424bb'], ' ', 'EXPLICIT_FACH_APPROVED', 'A100_17TH_SECTION_TO_STORKOWER_STRASSE');
addSlice('BE-BSW-P49-U10-A03-C01', 'BE-BSW-P49-U10-A03-92fb10ce4c2e', 'Parkraummanagement', 'EXPLICIT_FACH_APPROVED', 'PARKING_MANAGEMENT');
addSlice('BE-BSW-P49-U10-A03-C02', 'BE-BSW-P49-U10-A03-92fb10ce4c2e', 'Quartiersgaragen', 'EXPLICIT_FACH_APPROVED', 'NEIGHBOURHOOD_GARAGES');
addSlice('BE-BSW-P49-U10-A03-C03', 'BE-BSW-P49-U10-A03-92fb10ce4c2e', 'Ladezonen', 'EXPLICIT_FACH_APPROVED', 'LOADING_ZONES');
addSlice('BE-BSW-P49-U10-A03-C04', 'BE-BSW-P49-U10-A03-92fb10ce4c2e', 'einer besseren Organisation des ruhenden Verkehrs', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'PARKED_TRAFFIC_ORGANISATION_INSTRUMENT_UNSPECIFIED');
addJoined('BE-BSW-P49P50-U11U01-M01', ['BE-BSW-P49-U11-b26ec37a3382', 'BE-BSW-P50-U01-bb3d4390ad9a'], ' ', 'NON_EFFECT_QUANTITATIVE_DIAGNOSIS_AND_NORMATIVE_FRAME_REVIEWED', 'CROSS_PAGE_FREIGHT_DIAGNOSIS', 'DETERMINISTIC_CROSS_PAGE_SEMANTIC_REPLACEMENT');

const replacements = new Map();
for (const record of deterministic) {
  for (const parent of record.parent_object_ids) {
    if (!replacements.has(parent)) replacements.set(parent, []);
    replacements.get(parent).push(record.object_id);
  }
}
for (const [parent, ids] of replacements) {
  const decision = original.get(parent);
  if (!decision || decision.authoritative_terminal_fach_state !== 'SOURCE_UNIT_RECLASSIFIED_VERSIONED') throw new Error(`${parent}: deterministic parent not versioned`);
  decision.replacement_record_ids = ids;
}

if (original.size !== sourceObjects.length) {
  const missing = sourceObjects.map((item) => item.object_id).filter((id) => !original.has(id));
  const extra = [...original.keys()].filter((id) => !byId.has(id));
  throw new Error(`original decision coverage drift; missing=${missing.join(',')} extra=${extra.join(',')}`);
}
const normalize = (state) => state.startsWith('NON_EFFECT_') ? 'NON_EFFECT_CONTEXT_REVIEWED' : state;
const terminalRecords = [...original.values(), ...deterministic];
const counts = terminalRecords.reduce((acc, item) => {
  const state = normalize(item.authoritative_terminal_fach_state || item.terminal_fach_state);
  acc[state] += 1;
  return acc;
}, { EXPLICIT_FACH_APPROVED: 0, REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 0, NON_EFFECT_CONTEXT_REVIEWED: 0, SOURCE_UNIT_RECLASSIFIED_VERSIONED: 0 });
const active = counts.EXPLICIT_FACH_APPROVED + counts.REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON;
if (sourceObjects.length !== 95 || deterministic.length !== 27 || terminalRecords.length !== 122 || active !== 53) throw new Error(`set-wise count drift ${JSON.stringify({ source: sourceObjects.length, deterministic: deterministic.length, terminal: terminalRecords.length, active, counts })}`);

const handoff = {
  schema_version: 'woek-explicit-fach-handoff-2.0',
  handoff_id: 'BE-BSW-P46-P49-EXPLICIT-FACH-2026-V1',
  base_main_commit: '7628b7e45e9e462af5cc92a5b6dcf9f9e714eae5',
  artifact_id: ledger.artifact.artifact_id,
  artifact_sha256: ledger.artifact.artifact_sha256,
  artifact_byte_length: ledger.artifact.byte_length,
  artifact_page_count: ledger.artifact.page_count,
  controller: { issue: 241, issue_comment_id: 5458980983, issue_comment_url: 'https://github.com/sustynats/wirkungsoekonomie.de/issues/241#issuecomment-5458980983' },
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
    protected_fach_terminal_physical_scope: 'P1-P45',
    segmented_physical_pages: [46, 47, 48, 49],
    next_opaque_page_review_envelope_from: 50,
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
    carried_exact_open_child_object_count: 61,
    terminal_status_counts: counts,
    gate: 'BE_BSW_P46_P49_FACH_COMPLETE_PASS_SOURCE_BOUND',
  },
  constraints: { fach_inferred_from_source: false, dns_synthesized: false, recommendation_synthesized: false, score_synthesized: false, party_wide_judgement_synthesized: false },
};

writeFileSync(OUTPUT_PATH, `${JSON.stringify(handoff, null, 2)}\n`);
console.log(JSON.stringify({ output: path.relative(ROOT, OUTPUT_PATH), counts, deterministic_ids: deterministic.map((item) => item.object_id) }, null, 2));
