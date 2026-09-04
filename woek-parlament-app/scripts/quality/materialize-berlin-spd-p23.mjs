#!/usr/bin/env node
/** Serialize only the exact finite #240/5526873010 handoff. No text classification. */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIR = 'data/state-programmes/fach-reviews/';
const LEDGER = `${DIR}berlin-2026-spd-v1/`;
export const OUTPUT = `${DIR}berlin-2026-spd-p23-explicit-v1.json`;
export const SOURCE = `${DIR}berlin-2026-spd-p23-full-source-v1.json`;
export const HANDOFF = `${DIR}berlin-2026-spd-p23-authoritative-handoff.md`;
const COMMENT = 5526873010;
const RNA = 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON';
export const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const read = name => fs.readFileSync(path.join(APP_ROOT, name), 'utf8');
const json = name => JSON.parse(read(name));
const sid = number => `BE-SPD-2026-SU-${String(number).padStart(4, '0')}`;
const aid = (number, atom) => `${sid(number)}-A${String(atom).padStart(2, '0')}`;
const pin = name => ({ path: `woek-parlament-app/${name}`, file_sha256: sha256(read(name)) });
const encode = value => `${JSON.stringify(value, null, 2)}\n`;

export function buildP23() {
  assert.equal(sha256(read(`${LEDGER}manifest.json`)), '8711be87e5cc9965f78d799451e1c643422f512a4b2a5aa626caf9eb71b934d0', 'Frozen Berlin SPD manifest bytes changed');
  const manifest = json(`${LEDGER}manifest.json`);
  assert.equal(manifest.logical_descriptor_sha256, 'cec984d14a19663535b13af55d6bd8ffe1c61ab664c09db43162f09a9bf42de6');
  assert.equal(manifest.manifest_sha256, 'b8bb6c6e74abcbfe867067936e0f527b0ae8be8f6ff21b56aa96ec2dfd6e0c24');
  for (const ref of [...manifest.source_unit_shards, ...manifest.effect_atom_shards]) {
    assert.equal(sha256(read(`${LEDGER}${ref.path}`)), ref.file_sha256, `Protected ledger changed: ${ref.path}`);
  }
  const units = json(`${LEDGER}source-units-p19-p24.json`).records.filter(row => row.pdf_page === 23);
  const atoms = json(`${LEDGER}effect-atoms-p19-p24.json`).records.filter(row => row.pdf_page === 23);
  const full = json(SOURCE);
  assert.deepEqual(units.map(row => row.source_unit_id), Array.from({ length: 15 }, (_, i) => sid(266 + i)));
  assert.deepEqual(full.source_units.map(row => row.source_unit_id), units.map(row => row.source_unit_id));
  assert.deepEqual(full.artifact, manifest.ledger_metadata.artifact);
  assert.equal(full.artifact.sha256, '379f8cfe51309c2782c88a74ef06777d9ef0c07d7c256ddf1d9f361111e6ffc9');
  const body = read(HANDOFF);
  assert.equal(sha256(body), '80764145fdd11f92a702b24afae3efde1eaf85c43a1dba2975f452cc3268f299');
  const originals = new Map();
  for (const unit of units) {
    const source = full.source_units.find(row => row.source_unit_id === unit.source_unit_id);
    assert.equal(source.source_locator, unit.source_locator);
    assert.equal(source.pdf_page, unit.pdf_page);
    assert.deepEqual(source.pdf_pages, unit.pdf_pages);
    assert.equal(sha256(source.source_text), unit.source_text_sha256);
    assert.equal(source.source_text_sha256, unit.source_text_sha256);
    originals.set(unit.source_unit_id, { object_id: unit.source_unit_id, source_unit_id: unit.source_unit_id, source_page: 23, pdf_pages: unit.pdf_pages, source_locator: unit.source_locator, source_text: source.source_text, source_text_sha256: unit.source_text_sha256, source_object_kind: 'SOURCE_UNIT' });
  }
  for (const atom of atoms) {
    assert.equal(sha256(atom.policy_action), atom.source_text_sha256);
    assert.ok(originals.get(atom.source_unit_id).source_text.includes(atom.policy_action));
    assert.ok(body.includes(atom.source_text_sha256), `Atom hash not supplied by authority: ${atom.atom_id}`);
    originals.set(atom.atom_id, { object_id: atom.atom_id, source_unit_id: atom.source_unit_id, source_page: 23, pdf_pages: atom.pdf_pages, source_locator: atom.source_locator, source_text: atom.policy_action, source_text_sha256: atom.source_text_sha256, source_object_kind: 'SOURCE_ATOM' });
  }
  const decisions = new Map();
  const generated = [];
  const byId = id => originals.get(id) ?? generated.find(row => row.object_id === id);
  function decide(id, state, extra = {}) {
    assert.ok(byId(id), `Unknown object: ${id}`);
    assert.ok(!decisions.has(id), `Duplicate decision: ${id}`);
    decisions.set(id, { object_id: id, terminal_fach_state: state, counts_as_effect_object: state === RNA, batch_issue_comment_id: COMMENT, ...extra });
  }
  function zero(id, state, exactRole, extra = {}) {
    assert.ok(body.includes(exactRole), `Role not present verbatim in authority: ${id}`);
    decide(id, state, { authoritative_role_text: exactRole, ...extra });
  }
  function rnaa(id, code, group = null) {
    assert.equal(body.split(code).length, 2, `Ambiguous/missing reason: ${code}`);
    const after = body.slice(body.indexOf(code) + code.length);
    const inline = after.match(/^`(?: — |: |; )([^\n]+)/)?.[1];
    const labelled = after.match(/^`\n- Exact reason: ([^\n]+)/)?.[1];
    let reason = inline ?? labelled ?? code;
    if (group) {
      assert.ok(body.includes(group));
      reason = group;
    }
    assert.ok(body.includes(reason));
    decide(id, RNA, { exact_reason_code: code, exact_reason: reason, exact_reason_form: reason === code ? 'AUTHORITATIVE_OBJECT_SPECIFIC_REASON_CODE' : 'VERBATIM_AUTHORITATIVE_PROSE' });
  }
  function child(parent, ordinal, text, hash) {
    assert.equal(sha256(text), hash, `Child text/hash mismatch: ${parent}`);
    assert.ok(body.includes(text) && body.includes(hash), `Child not explicitly supplied: ${parent}`);
    assert.ok(byId(parent).source_text.includes(text));
    const unit = originals.get(byId(parent).source_unit_id);
    const start = unit.source_text.indexOf(text);
    assert.equal(unit.source_text.indexOf(text, start + 1), -1);
    const object_id = `${parent}-C${String(ordinal).padStart(2, '0')}-${hash.slice(0, 12)}`;
    generated.push({ object_id, source_unit_id: unit.object_id, parent_object_ids: [parent], source_page: 23, pdf_pages: unit.pdf_pages, source_locator: unit.source_locator, source_span_utf16: [start, start + text.length], source_text: text, source_text_sha256: hash, source_object_kind: 'DETERMINISTIC_EXACT_SPAN_CHILD' });
    return object_id;
  }

  for (const n of [267, 272, 274, 277]) zero(sid(n), 'NON_EFFECT_CONTEXT_REVIEWED', 'structural heading');
  zero(aid(266, 1), 'NON_EFFECT_GOAL_REVIEWED', 'ACCESS_GOAL');
  zero(aid(269, 1), 'NON_EFFECT_EXTERNAL_LEGAL_CONTEXT_REVIEWED_WITH_SOURCE_CLAIM_QUALIFICATION', 'Do not turn this sentence into a Berlin intervention or legal baseline.', {
    source_claim_qualification: 'The binding EU text says Member States shall put in place measures to **jointly cover, as a Union target**, at least 20% of land and 20% of sea areas by 2030; it is not a blanket rule that Berlin itself must renature 20% of its total area.',
    qualification_source_url: 'https://eur-lex.europa.eu/eli/reg/2024/1991/oj', qualification_locator: 'Art. 1(2)',
  });
  zero(aid(270, 1), 'NON_EFFECT_GOAL_REVIEWED', 'RESILIENCE_GOAL');
  zero(aid(271, 2), 'NON_EFFECT_CONTINUATION_REVIEWED', 'NON_EFFECT_CONTINUATION_REVIEWED');
  zero(aid(271, 4), 'NON_EFFECT_RATIONALE_REVIEWED', 'rationale/intended outcome, zero-count.');
  zero(aid(275, 2), 'NON_EFFECT_INTENDED_MECHANISM_OR_OUTCOME_REVIEWED', 'intended mechanism/outcome statement of A01, not another intervention; zero-count.', { related_effect_object_id: aid(275, 1) });
  zero(aid(275, 3), 'NON_EFFECT_TARGET_REVIEWED', 'directional target without independent scale/instrument beyond A01; zero-count target linked to A01.', { related_effect_object_id: aid(275, 1) });
  zero(aid(276, 1), 'NON_EFFECT_GOAL_REVIEWED', 'legal/quality goal, zero-count; no intervention class specified in this atom.');
  zero(aid(276, 2), 'NON_EFFECT_GOAL_REVIEWED', 'preservation/outcome goal, zero-count.');
  zero(aid(276, 5), 'NON_EFFECT_RATIONALE_REVIEWED', 'rationale fragment, zero-count.');
  zero(aid(279, 1), 'NON_EFFECT_RATIONALE_REVIEWED', 'rationale/intended outcome, zero-count.');

  rnaa(aid(266, 2), 'SPREE_BATHING_SITE_WATER_QUALITY_SAFETY_AND_DELIVERY_DESIGN_UNSPECIFIED');
  rnaa(aid(268, 3), 'KLEINGARTEN_OPENING_AND_BIODIVERSITY_DELIVERY_DESIGN_UNSPECIFIED');
  rnaa(aid(268, 4), 'KLEINGARTEN_NAHERHOLUNG_CONVERSION_SCOPE_ACCESS_AND_RESOURCE_DESIGN_UNSPECIFIED');
  rnaa(aid(268, 5), 'COMMUNITY_GARDENING_SUPPORT_INSTRUMENT_SITE_AND_ACCESS_DESIGN_UNSPECIFIED');
  rnaa(aid(269, 2), 'URBAN_NATURE_EDUCATION_CAMPAIGN_CONTENT_REACH_RESOURCES_AND_OUTCOME_DESIGN_UNSPECIFIED');
  const forestReason = 'exact forest stands/area, species/composition target, climate-site suitability, regeneration success criteria, browsing/herbivory/fire/drought management, recreation/safety trade-offs, timetable/resources and counterfactual are not specified; net resilience/biodiversity/carbon direction cannot be made object-specific without those design choices.';
  rnaa(aid(270, 2), 'NATURE_NEAR_FOREST_CONVERSION_SITE_SPECIES_SCALE_AND_DELIVERY_DESIGN_UNSPECIFIED', forestReason);
  rnaa(aid(270, 3), 'MIXED_FOREST_NATURAL_REGENERATION_SPECIES_SITE_HERBIVORY_AND_CLIMATE_DESIGN_UNSPECIFIED', forestReason);
  rnaa(aid(271, 1), 'VOLUNTEER_REWARD_ELIGIBILITY_VALUE_BUDGET_AND_ADDITIONALITY_UNSPECIFIED');
  rnaa(aid(271, 3), 'KEHRENBÜRGER_EXPANSION_SCALE_RESOURCE_AND_ADDITIONALITY_UNSPECIFIED');
  rnaa(aid(273, 1), 'VETERINARY_ENFORCEMENT_CAPACITY_FTE_FUNDING_TARGETING_AND_OUTCOME_DESIGN_UNSPECIFIED');
  rnaa(aid(273, 2), 'ANIMAL_SHELTER_FINANCING_AMOUNT_DURATION_CAPACITY_AND_SERVICE_STANDARD_UNSPECIFIED');
  rnaa(aid(273, 3), 'CAT_NEUTERING_PIGEON_MANAGEMENT_PROGRAMME_SCOPE_STANDARDS_AND_EVALUATION_UNSPECIFIED');
  rnaa(aid(275, 1), 'RAINWATER_SEWER_DISCONNECTION_SITE_HYDROGEOLOGY_SCALE_FINANCE_AND_CONTAMINATION_GUARDS_UNSPECIFIED');
  rnaa(aid(275, 4), 'CROSS_PROPERTY_RAINWATER_LEGAL_RULE_SCOPE_COST_RIGHTS_AND_TECHNICAL_STANDARD_UNSPECIFIED');
  const waterReason = 'These objects lack the stated design variables in their reason codes; no object-specific net direction/additionality can be bounded from the programme wording alone.';
  rnaa(aid(276, 3), 'EMERGENCY_WELLS_NUMBER_LOCATION_WATER_QUALITY_CAPACITY_MAINTENANCE_AND_ACCESS_UNSPECIFIED', waterReason);
  rnaa(aid(276, 6), 'SOIL_GROUNDWATER_REMEDIATION_SITE_CONTAMINANT_TECHNOLOGY_PRIORITY_FINANCE_AND_SECONDARY_RISK_UNSPECIFIED', waterReason);
  rnaa(aid(276, 7), 'DISTRICT_REMEDIATION_CAPACITY_FTE_BUDGET_ALLOCATION_DURATION_AND_TASK_LINK_UNSPECIFIED', waterReason);
  rnaa(aid(278, 1), 'PACKAGING_TAX_BASE_RATE_EXEMPTIONS_ADMINISTRATION_INCIDENCE_REVENUE_USE_AND_BASELINE_UNSPECIFIED');
  rnaa(aid(279, 2), 'WASTE_EDUCATION_CURRICULUM_DOSE_STAFF_RESOURCE_AND_BEHAVIOURAL_EVALUATION_UNSPECIFIED');
  const circularReason = 'For each, the omitted variables named in the code materially determine additionality, resource/energy balance, quality/downcycling, costs, market displacement and usable circularity; therefore no net object-specific direction is assigned here.';
  const circularCodes = [
    'NONCOMMERCIAL_TEXTILE_SUPPORT_INSTRUMENT_ELIGIBILITY_LOGISTICS_AND_REUSE_STANDARD_UNSPECIFIED',
    'WOOD_RECYCLING_RATE_BASELINE_DEFINITION_FEEDSTOCK_CAPACITY_QUALITY_AND_MARKET_UNSPECIFIED',
    'BERLIN_WASTE_PROCESSING_TECHNOLOGY_STREAM_CAPACITY_LIFECYCLE_AND_RESIDUAL_PATH_UNSPECIFIED',
    'BSR_SORTING_FACILITY_NUMBER_SITE_TECHNOLOGY_CAPACITY_FINANCE_OUTPUT_QUALITY_AND_REJECTS_UNSPECIFIED',
    'BIOTON_HOUSEHOLD_COVERAGE_TARGET_COLLECTION_CAPACITY_COST_AND_PARTICIPATION_DESIGN_UNSPECIFIED',
    'GREEN_WASTE_COMPOST_FEEDSTOCK_LOGISTICS_CONTAMINATION_CAPACITY_QUALITY_AND_USE_UNSPECIFIED',
  ];
  circularCodes.forEach((code, i) => rnaa(aid(280, i + 1), code, circularReason));

  const c268a = child(sid(268), 1, 'Kleingärten stehen für lebendiges, soziales Stadtleben.', '073719e1d0d4063b940874540f82b9238665957a0a85eaf6df041f3285ee18b3');
  zero(c268a, 'NON_EFFECT_RATIONALE_REVIEWED', 'context/rationale zero-count.');
  const c268b = child(sid(268), 2, 'Wir stärken und schützen sie', '6fa2f67b3d2c5d73a90f4dc92226dddeb4c3d184a900d0028df15030d7298288');
  rnaa(c268b, 'KLEINGARTEN_STRENGTHEN_PROTECT_LEGAL_FINANCIAL_AND_LAND_INSTRUMENT_UNSPECIFIED');
  for (const old of [aid(268, 1), aid(268, 2)]) decide(old, 'SOURCE_FRAGMENT_VERSIONED_ZERO_COUNT', { superseded_by: [c268b] });
  generated.find(row => row.object_id === c268b).replaces_object_ids = [aid(268, 1), aid(268, 2)];
  const c269a = child(sid(269), 1, 'Die Biodiversitätsstrategie setzen wir um', '7ea818c99e4cbba2efd770b8b612ee23e48f704ce13b1fc87a0c74e00a50c8f1');
  rnaa(c269a, 'BIODIVERSITY_STRATEGY_VERSION_MEASURE_PORTFOLIO_TIMELINE_RESOURCES_AND_ADDITIONALITY_UNSPECIFIED');
  const c269b = child(sid(269), 2, 'am Berlin Urban Nature Pact halten wir fest', '11a82462367465da0569c8305581cdacde2e667dda857b15a39b9fc48f23391f');
  zero(c269b, 'NON_EFFECT_CONTINUATION_REVIEWED', 'continuation/commitment restatement zero-count.');
  const c269c = child(sid(269), 3, 'und wirken dem Artensterben wirksam entgegen.', '4c69a093fa736ec25483bae876f313dafeba7121d95fb4bc20ba0db4d91cd408');
  zero(c269c, 'NON_EFFECT_GOAL_REVIEWED', 'broad intended outcome/goal zero-count.');
  const c270a = child(sid(270), 1, 'Er bleibt Erholungswald; wirtschaftliche Nutzung bleibt nachrangig.', '3e0638f6596cb3b054567ce2e43b22148160c6afa357f2a64bc7e44e17506413');
  zero(c270a, 'NON_EFFECT_LAND_USE_PRIORITY_GUARD_REVIEWED', 'NON_EFFECT_LAND_USE_PRIORITY_GUARD_REVIEWED');
  const c270b = child(sid(270), 2, 'Den Zustand begleiten wir mit satellitengestütztem Monitoring.', '5017bce4b525baa1e7a053a441ee09a304535d2ed5998889777f12284542e178');
  rnaa(c270b, 'FOREST_SATELLITE_MONITORING_INDICATORS_COVERAGE_CADENCE_DECISION_RULE_AND_COST_UNSPECIFIED');
  const c271 = child(sid(271), 1, 'Wir würdigen freiwilliges Umweltengagement.', 'e4653a9011ec9bcb18597e915d91c0da55feb1c2ccbe680bf671ebe7fd0348db');
  zero(c271, 'NON_EFFECT_RATIONALE_REVIEWED', 'recognition/rationale zero-count.');
  const c273a = child(sid(273), 1, 'Der Hundeführerschein ersetzt die Rasseliste und schafft Sicherheit durch Wissen.', 'f625c4b03abbbc62471e2aca30f36f987d6ceaca0fec0e74fa330274c7f65284');
  rnaa(c273a, 'DOG_LICENCE_REPLACES_BREED_LIST_TEST_TRAINING_SCOPE_TRANSITION_ENFORCEMENT_AND_SAFETY_EVIDENCE_UNSPECIFIED');
  const c273b = child(sid(273), 2, 'Wir schließen den Einsatz von Tieren auf staatlichen Bühnen des Landes aus', '7cd52ea2b7290a09c184c0a26754a381d754285be1934ba4d57221fdbddba668');
  rnaa(c273b, 'STATE_STAGE_ANIMAL_USE_BAN_SCOPE_DEFINITION_EXCEPTIONS_ENFORCEMENT_AND_COUNTERFACTUAL_UNSPECIFIED');
  const c273c = child(sid(273), 3, 'und untersagen weiterhin Auftritte von Zirkussen mit Wildtieren auf landeseigenen Flächen.', 'ed96cf916d6c6e94e4c1470ae1339b4b222641874d198dde8cb29aca83ea6421');
  zero(c273c, 'NON_EFFECT_CONTINUATION_REVIEWED', 'NON_EFFECT_CONTINUATION_REVIEWED');
  const c273d = child(sid(273), 4, 'Die Funktion der*des Landestierschutzbeauftragten bleibt zentrale Stimme für Tiere in Berlin.', '9ba02d48d7f3fa84479ac88356f61efe45ab1baaf8edfb727db9674fc3415e31');
  zero(c273d, 'NON_EFFECT_EXISTING_ROLE_REVIEWED', 'existing-role/status continuation zero-count.');
  const c276a = child(sid(276), 1, 'Eine sichere Trinkwasserversorgung ist lebenswichtig.', '2e37dcd9185fd4af2baef804f0b6b29a61a6ebd497e16f6752d59227ce7b7a44');
  zero(c276a, 'NON_EFFECT_CONTEXT_REVIEWED', 'context/goal zero-count.');
  const c276b = child(sid(276), 2, 'Wir sind uns der drohenden Grundwasserproblematik in Berlin und Brandenburg bewusst', '32891e18ca48d7a25d5d2bafdae793fabb9c0d0c1178267232249f5609248d88');
  zero(c276b, 'NON_EFFECT_CONTEXT_REVIEWED', 'diagnosis/context zero-count.');
  const c276c = child(sid(276), 3, 'und arbeiten verstärkt an gemeinsamen Anpassungsstrategien beider Länder.', '24aa9535a9483c096df4bba2373d4fbe9cc817e4876544513ffe422303a79b45');
  rnaa(c276c, 'BERLIN_BRANDENBURG_GROUNDWATER_ADAPTATION_STRATEGY_CONTENT_GOVERNANCE_TIMELINE_RESOURCE_AND_DECISION_PATH_UNSPECIFIED');
  const c276d = child(aid(276, 4), 1, 'und starten eine Wassersparoffensive', '557bb37df14b214f77490100a561ffba44addd68aa844197c3b2851faba88d57');
  const c276e = child(aid(276, 4), 2, 'sowie eine verstärkte Fokussierung auf Grauwasserlösungen (Aufbereitung von Wasser zur Zweitnutzung) im privaten und öffentlichen Bereich.', '5a23cefed5d48ebf2645052af10707a1254f9ce30d102eb857ebbc759c69fba8');
  decide(aid(276, 4), 'COMPOUND_PARENT_VERSIONED_ZERO_COUNT', { superseded_by: [c276d, c276e] });
  const savingGuard = 'No blanket positive direction may be attached: water savings, hygiene/health, energy, retrofit cost and rebound depend on the missing designs.';
  rnaa(c276d, 'WATER_SAVING_OFFENSIVE_INSTRUMENT_TARGET_SECTOR_BASELINE_RESOURCE_AND_EVALUATION_UNSPECIFIED', savingGuard);
  rnaa(c276e, 'GREYWATER_SUPPORT_TECHNOLOGY_QUALITY_HEALTH_STANDARD_BUILDING_SCOPE_FINANCE_AND_LIFECYCLE_UNSPECIFIED', savingGuard);
  const c278a = child(sid(278), 1, 'Wir stehen zum Zero‑Waste‑Konzept: Vermeidung hat Vorrang vor Verwertung und Entsorgung.', '83665251293d5e5d1e7041acffd182a939e185a9217bf08ae7173b9515f530b5');
  zero(c278a, 'NON_EFFECT_POLICY_PRINCIPLE_REVIEWED', 'policy principle/restatement zero-count.');
  const c278b = child(sid(278), 2, 'Das NochMall‑Kaufhaus und der Reparatur‑Bonus werden fortgeführt.', '195843e54a1cf0ef2a26d2e9ebe998179d98c89bfd122d4382f1cd61ca0b81d6');
  zero(c278b, 'NON_EFFECT_CONTINUATION_REVIEWED', 'continuation zero-count; do not claim new programme effect from `fortgeführt` without a separately evidenced delta.');
  const c279 = child(sid(279), 1, 'Projekttage mit der BSR werden an Berliner Schulen zum Standard.', '6b23ff019563af007a9b48e6f53dd4d384af573b0af5b156a0d1ae18b9e7ff03');
  rnaa(c279, 'BSR_SCHOOL_PROJECT_DAY_FREQUENCY_CONTENT_CAPACITY_RESOURCE_AND_BEHAVIOURAL_EVALUATION_UNSPECIFIED');

  const objects = [...originals.values(), ...generated];
  for (const unit of units) if (!decisions.has(unit.source_unit_id)) {
    decide(unit.source_unit_id, 'SOURCE_CONTAINER_COVERED_ZERO_COUNT', { covered_by: objects.filter(row => row.source_unit_id === unit.source_unit_id && row.object_id !== unit.source_unit_id).map(row => row.object_id) });
  }
  assert.deepEqual([...decisions.keys()].sort(), objects.map(row => row.object_id).sort());
  const terminal_records = objects.map(row => ({ ...row, ...decisions.get(row.object_id) }));
  for (const row of terminal_records) if (row.source_claim_qualification) assert.ok(body.includes(row.source_claim_qualification));
  const active = terminal_records.filter(row => row.counts_as_effect_object);
  const result = {
    schema_version: 'woek-explicit-fach-handoff-2.0',
    handoff_id: 'BE-SPD-P23-CANONICAL-EXPLICIT-FACH-2026-V1',
    base_main_commit: '1db5d993bd7149c3c09993bf346f66d6c587a7ee',
    artifact: manifest.ledger_metadata.artifact,
    authoritative_markdowns: [{ issue_comment_id: COMMENT, issue_comment_url: `https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-${COMMENT}`, ...pin(HANDOFF) }],
    source_ledger: { ...pin(`${LEDGER}manifest.json`), logical_descriptor_sha256: manifest.logical_descriptor_sha256, disposition: 'SOURCE_SCAFFOLD_ONLY_NOT_FACH_AUTHORITY' },
    full_source_proof: pin(SOURCE),
    protected_source_files: fs.readdirSync(path.join(APP_ROOT, LEDGER)).sort().map(name => pin(`${LEDGER}${name}`)),
    protected_p22_handoff: pin(`${DIR}berlin-2026-spd-p22-explicit-v1.json`),
    terminal_records,
    coverage: {
      source_unit_ids: units.map(row => row.source_unit_id),
      original_atom_ids: atoms.map(row => row.atom_id),
      generated_child_ids: generated.map(row => row.object_id),
      active_terminal_review_leaf_ids: active.map(row => row.object_id),
      explicit_fach_approved_ids: [],
      reviewed_not_assessable_ids: active.map(row => row.object_id),
      zero_count_ids: terminal_records.filter(row => !row.counts_as_effect_object).map(row => row.object_id),
      remaining_p23_source_object_ids: [], terminal_pages: [23],
      cross_page_objects_consumed_once: [sid(280)],
      unconsumed_successor_source_unit_ids: json(`${LEDGER}source-units-p19-p24.json`).records.filter(row => row.pdf_page > 23).map(row => row.source_unit_id),
      gate: 'BE_SPD_2026_P23_FACH_COMPLETE_PASS_SOURCE_BOUND_AFTER_LOSSLESS_MATERIALISATION',
    },
    constraints: { fach_synthesized: false, protected_fach_or_source_overwritten: false, generic_delegated_rnaa_used_as_fach: false, dns_synthesized: false, recommendation_synthesized: false, score_synthesized: false, programme_terminal_claimed: false, vercel_action_triggered: false },
  };
  result.descriptor_sha256 = sha256(JSON.stringify(result));
  return result;
}

export function materialize({ check = false } = {}) {
  const result = buildP23();
  if (check) assert.equal(read(OUTPUT), encode(result));
  else fs.writeFileSync(path.join(APP_ROOT, OUTPUT), encode(result));
  return { gate: result.coverage.gate, source_units: result.coverage.source_unit_ids.length, original_atoms: result.coverage.original_atom_ids.length, generated_children: result.coverage.generated_child_ids.length, active_rnaa: result.coverage.reviewed_not_assessable_ids.length, zero_count: result.coverage.zero_count_ids.length, remaining_p23_objects: result.coverage.remaining_p23_source_object_ids.length, programme_terminal: false };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.slice(2).every(arg => arg === '--check'));
  console.log(JSON.stringify(materialize({ check: process.argv.includes('--check') }), null, 2));
}
