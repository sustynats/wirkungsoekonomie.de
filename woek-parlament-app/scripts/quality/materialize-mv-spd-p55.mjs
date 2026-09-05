#!/usr/bin/env node
/** Fixed, owner-supplied P55 decisions only. Never classify programme prose. */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PREFIX = 'data/state-programmes/fach-reviews/';
const LEDGER = `${PREFIX}mecklenburg-vorpommern-2026-spd-v1/`;
export const OUTPUT = `${PREFIX}mecklenburg-vorpommern-2026-spd-p55-explicit-v1.json`;
export const RESIDUAL = 'data/state-programmes/fach-content-residuals/mecklenburg-vorpommern-2026-spd-current-v1.json';
const P1_P54_ARCHIVE = 'data/state-programmes/fach-reviews/mecklenburg-vorpommern-2026-spd-p1-p54-authority-index-v1.json';
const BASE = 5477877520;
const REPAIR = 5525358185;
const RNA = 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON';
const HANDOFFS = [
  [BASE, `${PREFIX}mecklenburg-vorpommern-2026-spd-p55-authoritative-handoff.md`],
  [REPAIR, `${PREFIX}mecklenburg-vorpommern-2026-spd-p55-source-binding-repair-authoritative-handoff.md`],
];
export const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const read = name => fs.readFileSync(path.join(APP_ROOT, name), 'utf8');
const json = name => JSON.parse(read(name));
const sid = number => `MV-SPD-2026-SU-${String(number).padStart(5, '0')}`;
const pin = name => ({ path: `woek-parlament-app/${name}`, file_sha256: sha256(read(name)) });
const encode = value => `${JSON.stringify(value, null, 2)}\n`;

// Hashes are supplied by #240/5525358185, not copied from a generated result.
const UNIT_PINS = {
  510: 'e095d8d18903c0088f39501b6f89bd729eeeb38845b11cee808d8bf3dfab2059',
  511: 'ff1e6588ba96ac6af42d109bb90ed5da504ef7f8acdab05af6ea75011ab3f87a',
  512: '1f388ab0f193a343fe9af98c7b621d3d0eb50f03873ac42c07616d51a5d542b5',
  513: '93e96cb71845a7be2cdba0f1c26ae47e9a9cc4db887d2f2cd9c6ad5b8fa2298b',
  514: '7ceb3c918ce4725a852d145ef6048f5f05c853b3af2f560d6731cd777fc468be',
  515: '753b303697a6fa8d6e472e6d238384ccaf7085da5d27d30deb5f267892e7df8a',
  516: '68df4097c7a3007a40025cf7ecacdbd8be4e104d695877a4445dd69cb9331bc4',
  517: '2f784b38941bba4047ebf2649c252d9dc54e3deaf472093e6d30512d8c6f4bc6',
  518: '14c44ee0457cdb0c6e0df9175c4dece143730e38e0c619dc8b54ab6a80ebf4af',
  519: 'c0ebf23b4206b05f90c2d7ebacd4a3c32ca5940db80397547a6402179acca422',
  520: '22d2b34b744e637cd4da0b7dd4e3cf98b85de8ba4c90c941ba166f12b61895c3',
  521: '98646fd841fe8d457ab323885e5a78db6b85984a7e4a4ba7b0bfb46ef3b879fa',
  522: 'f1d90157008f73969ac06c51becab809285b21dee1a4806bdf9582625ebb6694',
};

export function buildP55() {
  assert.equal(sha256(read(`${LEDGER}manifest.json`)), '1a6a89bee7360f962c1154da8daed8b7cb7fe09c4133d06c58f83d6d192f76b1', 'Protected frozen manifest bytes changed');
  const manifest = json(`${LEDGER}manifest.json`);
  assert.equal(manifest.manifest_sha256, 'a1455a2da491ebd763d5ec36fba3bf813916e2743011c2a2465d37a5da329f41');
  assert.equal(manifest.logical_descriptor_sha256, 'c4932fbd3110b7e21f1d3e13f78e606f6b98635da1f7b527f812b77ba0641d48');
  for (const ref of [...manifest.source_unit_shards, ...manifest.effect_atom_shards]) {
    assert.equal(sha256(read(`${LEDGER}${ref.path}`)), ref.file_sha256, `Protected source shard changed: ${ref.path}`);
  }
  const unitFile = `${LEDGER}source-units-p049-p056.json`;
  const atomFile = `${LEDGER}effect-atoms-p049-p056.json`;
  const sourceUnits = json(unitFile).records.filter(row => row.pdf_page === 55);
  const atoms = json(atomFile).records.filter(row => row.pdf_page === 55);
  assert.deepEqual(atoms.map(row => row.policy_action_sha256), [
    '07870f3980521f6a162b4271c0df2e17042773d61da70b7e0333aac119bff558',
    'd7416b198ff0004c983ff2da2f7d4e15e78e6192d1e0d0141af0127dac93b44a',
    '890794f62c3d603c85a5ab90f3ea75da35169700bec6e138f2f0ee3e19c378d0',
    '310ce3beef66c44f4a348c21a7f266498e10efb4c5d228edefafa59a0e3fcb61',
    '8c7288ae2d945e644b27b9ecc9f44813858f2dd76a3b20df0e0e0a7aed281676',
    '27584f0ca82f42669c7b46de49fbabb9c5ae29d53162b9c5d0162b6c7ffd4720',
    'f37f635a0dff71e00f279b9ab782ed4b06e11edf6b7649b130bb2b3ddc55470d',
    '14c44ee0457cdb0c6e0df9175c4dece143730e38e0c619dc8b54ab6a80ebf4af',
  ]);
  assert.deepEqual(sourceUnits.map(row => row.source_unit_id), Object.keys(UNIT_PINS).map(sid));
  const texts = new Map(HANDOFFS.map(([id, name]) => [id, read(name)]));
  assert.equal(sha256(texts.get(BASE)), '367cafb3dcef9bbe98017d3596bd06c6be54034a43700e25e73b8d7b193d5c0a', 'Authoritative P55 body changed');
  assert.equal(sha256(texts.get(REPAIR)), 'c860ddff055dde32c3440ad67cfe9d7e38b37a234fbe75ee52db85c083fe9e70', 'Authoritative P55 repair body changed');
  const originals = new Map();
  for (const unit of sourceUnits) {
    assert.equal(unit.source_text_sha256, UNIT_PINS[Number(unit.source_unit_id.split('-').at(-1))]);
    assert.equal(sha256(unit.source_text_normalized), unit.source_text_sha256);
    originals.set(unit.source_unit_id, { object_id: unit.source_unit_id, source_unit_id: unit.source_unit_id, source_page: 55, source_locator: unit.source_locator, source_text: unit.source_text_normalized, source_text_sha256: unit.source_text_sha256, source_object_kind: 'SOURCE_UNIT' });
  }
  for (const atom of atoms) {
    assert.equal(sha256(atom.policy_action), atom.policy_action_sha256);
    assert.ok(originals.get(atom.source_unit_id).source_text.includes(atom.policy_action));
    originals.set(atom.atom_id, { object_id: atom.atom_id, source_unit_id: atom.source_unit_id, source_page: 55, source_locator: atom.source_locator, source_text: atom.policy_action, source_text_sha256: atom.policy_action_sha256, source_object_kind: 'SOURCE_ATOM' });
  }
  const records = new Map();
  const generated = [];
  const byId = id => originals.get(id) ?? generated.find(row => row.object_id === id);
  function decide(id, terminal, authority, extra = {}) {
    assert.ok(byId(id), `Unknown exact object: ${id}`);
    assert.ok(!records.has(id), `Duplicate decision: ${id}`);
    records.set(id, { object_id: id, terminal_fach_state: terminal, counts_as_effect_object: terminal === RNA, batch_issue_comment_id: authority, binding_issue_comment_id: REPAIR, ...extra });
  }
  function child(parent, ordinal, text, hash) {
    assert.equal(sha256(text), hash, `Child text/hash mismatch: ${parent}`);
    assert.ok(byId(parent).source_text.includes(text), `Child is not an exact contiguous parent span: ${parent}`);
    const object_id = `${parent}-C${String(ordinal).padStart(2, '0')}-${hash.slice(0, 12)}`;
    const source = byId(parent);
    const unit = originals.get(source.source_unit_id);
    const start = unit.source_text.indexOf(text);
    assert.equal(unit.source_text.indexOf(text, start + 1), -1, `Ambiguous child span: ${object_id}`);
    generated.push({ object_id, source_unit_id: source.source_unit_id, parent_object_ids: [parent], source_page: 55, source_locator: unit.source_locator, source_span_utf16: [start, start + text.length], source_text: text, source_text_sha256: hash, source_object_kind: 'DETERMINISTIC_EXACT_SPAN_CHILD' });
    return object_id;
  }
  function exactReason(authority, code) {
    const body = texts.get(authority);
    assert.equal(body.split(code).length, 2, `Missing/duplicate exact reason code: ${code}`);
    const tail = body.slice(body.indexOf(code) + code.length);
    const match = tail.match(/(?:Exact reason|Reason): ([^\n]+)/);
    assert.ok(match, `Missing exact reason: ${code}`);
    return match[1];
  }
  function rnaa(id, code, authority = BASE) {
    decide(id, RNA, authority, { exact_reason_code: code, exact_reason: exactReason(authority, code) });
  }
  function nonEffect(id, terminal, authority, exact = null) {
    if (exact) assert.ok(texts.get(authority).includes(exact), `Non-effect reason not supplied: ${id}`);
    decide(id, terminal, authority, exact ? { exact_reason: exact } : {});
  }

  const clean = child(`${sid(510)}-A01`, 1, 'Modulares und serielles Bauen bietet große Chancen, schneller und kostengünstiger Wohnraum zu schaffen.', '2523f3522e7593ed5bb14fcaaf36f612e88ce258996e4e38d1f0bc0c2dec09ef');
  decide(`${sid(510)}-A01`, 'SOURCE_FRAGMENT_VERSIONED_ZERO_COUNT', BASE, { superseded_by: [clean], excluded_source_prefix: 'Regierungsprogramm der SPD MV 2026 ', excluded_prefix_role: 'PAGE_HEADER_OR_FOOTER_CONTAMINATION' });
  nonEffect(clean, 'NON_EFFECT_RATIONALE_OR_EXPECTED_MECHANISM_REVIEWED', BASE, 'this sentence states an expected speed/cost advantage of a construction method but does not itself commit to an intervention. It is rationale for the following support pledge, not an independently countable effect-bearing action.');
  rnaa(`${sid(510)}-A02`, 'MODULAR_SERIAL_BUILDING_SUPPORT_INSTRUMENT_SCALE_ELIGIBILITY_FINANCE_STANDARDS_UNSPECIFIED');

  const principle = child(sid(511), 1, 'Beim Umgang mit Grund und Boden gilt für uns der Grundsatz: Gemeinwohl vor Spekulation.', 'abb37d2c88d13c2d4869c12f21c3cfcb8686109fbde9bd98c7b64cc7f21152f8');
  nonEffect(principle, 'NON_EFFECT_GOAL_OR_POLICY_PRINCIPLE_REVIEWED', REPAIR);
  const land1 = child(`${sid(511)}-A01`, 1, 'Wir wollen Kommunen bei der strategischen Grundstücksbevorratung unterstützen', '101402e0ba4305ac3d3a27efceac9e894ffa61bbbbdba7eb9d94ded69b217fe1');
  const land2 = child(`${sid(511)}-A01`, 2, 'und setzen auf eine aktive Bodenpolitik, die bezahlbares Wohnen langfristig sichert.', 'fe3198dc01a5ec920a903ce2ffa5223914a87692f890b4dd03a66b969cc32275');
  decide(`${sid(511)}-A01`, 'COMPOUND_PARENT_VERSIONED_ZERO_COUNT', BASE, { superseded_by: [land1, land2] });
  rnaa(land1, 'MUNICIPAL_LAND_BANKING_SUPPORT_INSTRUMENT_FINANCE_ELIGIBILITY_ACQUISITION_RULES_UNSPECIFIED');
  rnaa(land2, 'ACTIVE_LAND_POLICY_INSTRUMENTS_TENURE_PRICE_SCALE_AND_GOVERNANCE_UNSPECIFIED');

  for (const n of [512, 516, 520]) nonEffect(sid(n), 'NON_EFFECT_CONTEXT_REVIEWED', REPAIR);
  nonEffect(sid(513), 'NON_EFFECT_CURRENT_PROGRAMME_SCOPE_AND_NEED_CONTEXT_REVIEWED', REPAIR, 'It describes current programme geography/eligibility architecture, not a new/change future intervention.');
  nonEffect(`${sid(514)}-A01`, 'NON_EFFECT_NEED_RATIONALE_REVIEWED', BASE, 'the sentence identifies a housing need, target group and desired social outcome, but contains no policy action distinct from the following funding pledge.');
  rnaa(`${sid(514)}-A02`, 'RURAL_ACCESSIBLE_AFFORDABLE_HOUSING_SUPPORT_AMOUNT_ELIGIBILITY_TENURE_SCALE_UNSPECIFIED');
  rnaa(`${sid(515)}-A01`, 'FAMILY_FRIENDLY_QUARTER_DESIGN_INSTRUMENT_STANDARDS_SCOPE_FINANCE_ENFORCEMENT_UNSPECIFIED');
  const role = child(sid(515), 1, 'Das Land wird hier seiner Anregungsfunktion gerecht bleiben.', 'cf131a9755dfad38fb0d9e67dc83726ba8283cc4a1042e52ff6a720752325d9c');
  nonEffect(role, 'NON_EFFECT_ROLE_OR_IMPLEMENTATION_FRAME_REVIEWED', REPAIR);
  nonEffect(`${sid(517)}-A01`, 'NON_EFFECT_GOAL_RATIONALE_REVIEWED', BASE, 'this is a normative objective/assessment criterion, not a bounded intervention. Later concrete building, housing, adaptation or mitigation measures must be reviewed on their own source objects.');
  const energy = child(sid(517), 1, 'Energetische Sanierungen begleiten wir mit Augenmaß, damit sie bezahlbar bleiben.', 'dbede871c6221c95d60997e1221798c28f81347803876e0af5ea72b24297ad93');
  rnaa(energy, 'ENERGETIC_RENOVATION_AFFORDABILITY_SAFEGUARD_INSTRUMENT_COST_ALLOCATION_SCOPE_UNSPECIFIED', REPAIR);
  const access = child(sid(517), 2, 'Barrierefreiheit, altersgerechtes Wohnen und gute Erreichbarkeit von Infrastruktur bleiben verbindliche Leitlinien unserer Wohnungs- und Stadtentwicklungspolitik.', '2dcc7c55fc11122c3ebc030ca9ebf6b4ea26f4bd551b72ca9b629ae8635c680e');
  rnaa(access, 'ACCESSIBILITY_AGEING_INFRASTRUCTURE_GUIDELINES_LEGAL_FORCE_SCOPE_STANDARDS_DELIVERY_UNSPECIFIED', REPAIR);
  rnaa(`${sid(518)}-A01`, 'FUTURE_PROOF_HOUSING_SUPPLY_UNITS_TENURE_LOCATION_FINANCE_STANDARDS_TIMELINE_UNSPECIFIED');
  const homeless = child(sid(519), 1, 'Wir möchten die aktuelle Entwicklung der Obdach- und Wohnungslosenhilfe aufgreifen und neue fachliche Ansätze (z.B. Housing-First) in unserem Bundesland fördern.', 'c0ebf23b4206b05f90c2d7ebacd4a3c32ca5940db80397547a6402179acca422');
  decide(sid(519), 'SOURCE_UNIT_RECLASSIFIED_VERSIONED', REPAIR, { previous_source_role: 'NON_EFFECT_CONTEXT', superseded_by: [homeless] });
  rnaa(homeless, 'HOMELESSNESS_HOUSING_FIRST_SUPPORT_INSTRUMENT_ELIGIBILITY_SCALE_FINANCE_DELIVERY_UNSPECIFIED', REPAIR);
  nonEffect(sid(521), 'NON_EFFECT_HISTORY_CURRENT_POLICY_AND_REPORTED_OUTCOME_REVIEWED', REPAIR);
  nonEffect(sid(522), 'NON_EFFECT_CONTEXT_REVIEWED', REPAIR);

  // Source containers are a provenance role, never a second Fach decision.
  for (const unit of sourceUnits) if (!records.has(unit.source_unit_id)) {
    const children = [...originals.values(), ...generated].filter(row => row.source_unit_id === unit.source_unit_id && row.object_id !== unit.source_unit_id);
    assert.ok(children.length);
    decide(unit.source_unit_id, 'SOURCE_CONTAINER_COVERED_ZERO_COUNT', REPAIR, { covered_by: children.map(row => row.object_id) });
  }
  const allObjects = [...originals.values(), ...generated];
  assert.deepEqual([...records.keys()].sort(), allObjects.map(row => row.object_id).sort());
  const terminal_records = allObjects.map(row => ({ ...row, ...records.get(row.object_id) }));
  const active = terminal_records.filter(row => row.counts_as_effect_object);
  const protectedFiles = fs.readdirSync(path.join(APP_ROOT, LEDGER)).sort().map(name => pin(`${LEDGER}${name}`));
  const output = {
    schema_version: 'woek-explicit-fach-handoff-2.0',
    handoff_id: 'MV-SPD-P55-SOURCE-BOUND-EXPLICIT-2026-V1',
    base_main_commit: '840ea0ce58a573f491b17ee3dd5c9bc160811cc0',
    jurisdiction: 'DE-MV', party: 'SPD',
    artifact: manifest.ledger_metadata.artifact,
    authoritative_markdowns: HANDOFFS.map(([id, name]) => ({ issue_comment_id: id, issue_comment_url: `https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-${id}`, ...pin(name) })),
    source_ledger: { ...pin(`${LEDGER}manifest.json`), logical_descriptor_sha256: manifest.logical_descriptor_sha256, disposition: 'SOURCE_SCAFFOLD_ONLY_GENERIC_DELEGATED_DECISIONS_NOT_FACH_AUTHORITY' },
    protected_source_files: protectedFiles,
    protected_predecessor: { issue_comment_id: 5476819703, physical_pages: Array.from({length:54}, (_,i) => i+1), status: 'AUTHORITATIVE_FACH_SCOPE_PROTECTED_NOT_A_CLAIM_OF_TECHNICAL_MATERIALISATION', existing_ledger_modified: false },
    terminal_records,
    coverage: {
      source_unit_ids: sourceUnits.map(row => row.source_unit_id),
      original_atom_ids: atoms.map(row => row.atom_id),
      generated_child_ids: generated.map(row => row.object_id),
      active_terminal_review_leaf_ids: active.map(row => row.object_id),
      explicit_fach_approved_ids: active.filter(row => row.terminal_fach_state === 'EXPLICIT_FACH_APPROVED').map(row => row.object_id),
      reviewed_not_assessable_ids: active.filter(row => row.terminal_fach_state === RNA).map(row => row.object_id),
      zero_count_ids: terminal_records.filter(row => !row.counts_as_effect_object).map(row => row.object_id),
      remaining_p55_source_object_ids: allObjects.filter(row => !records.has(row.object_id)).map(row => row.object_id),
      terminal_pages: [55],
      gate: 'MV_SPD_P55_FACH_COMPLETE_PASS_SOURCE_BOUND_AFTER_BINDING_REPAIR',
    },
    constraints: { fach_synthesized: false, old_source_or_fach_overwritten: false, generic_delegated_rnaa_used_as_fach: false, dns_synthesized: false, recommendation_synthesized: false, score_synthesized: false, vercel_action_triggered: false },
  };
  output.descriptor_sha256 = sha256(JSON.stringify(output));
  return output;
}

export function buildSpdResidual(handoff) {
  const manifest = json(`${LEDGER}manifest.json`);
  const predecessor = fs.existsSync(path.join(APP_ROOT, P1_P54_ARCHIVE)) ? json(P1_P54_ARCHIVE) : null;
  const terminal = new Set(handoff.coverage.terminal_pages);
  const protectedAuthored = new Set(handoff.protected_predecessor.physical_pages);
  const recoverableTerminalPages = new Set();
  if (predecessor) {
    for (const page of handoff.protected_predecessor.physical_pages) {
      const pageRecords = predecessor.source_records.filter(row => (row.source_pages ?? [row.source_page]).includes(page));
      if (pageRecords.length > 0 && pageRecords.every(row => row.terminal_role !== null)) recoverableTerminalPages.add(page);
    }
  }
  const pages = manifest.ledger_metadata.pages.map(page => ({
    pdf_page: page.pdf_page,
    source_unit_count: page.source_unit_count,
    status: terminal.has(page.pdf_page) || recoverableTerminalPages.has(page.pdf_page) ? 'MATERIALISED_EXACT_SOURCE_BOUND_TERMINAL' : protectedAuthored.has(page.pdf_page) ? 'PROTECTED_AUTHORED_REFERENCE_UNRESOLVED' : 'NO_CURRENT_SOURCE_BOUND_TERMINAL_PROOF',
  }));
  const residual = {
    schema_version: 'woek-current-programme-residual-1.0',
    matrix_id: 'MV-SPD-CURRENT-FACH-RESIDUAL-2026-V1',
    artifact_id: handoff.artifact.artifact_id,
    artifact_sha256: handoff.artifact.sha256,
    explicit_handoffs: [
      ...(predecessor ? [{path:`woek-parlament-app/${P1_P54_ARCHIVE}`,descriptor_sha256:predecessor.descriptor_sha256}] : []),
      {path:`woek-parlament-app/${OUTPUT}`, descriptor_sha256:handoff.descriptor_sha256},
    ],
    pages,
    summary: {
      source_page_count: pages.length,
      materialised_terminal_pages: pages.filter(row => row.status === 'MATERIALISED_EXACT_SOURCE_BOUND_TERMINAL').map(row => row.pdf_page),
      protected_authored_pages_pending_technical_reconciliation: pages.filter(row => row.status === 'PROTECTED_AUTHORED_REFERENCE_UNRESOLVED').map(row => row.pdf_page),
      pages_without_current_terminal_proof: pages.filter(row => row.status === 'NO_CURRENT_SOURCE_BOUND_TERMINAL_PROOF').map(row => row.pdf_page),
      remaining_technical_page_envelopes: pages.filter(row => row.status !== 'MATERIALISED_EXACT_SOURCE_BOUND_TERMINAL').map(row => row.pdf_page),
      p55_residual_source_object_ids: handoff.coverage.remaining_p55_source_object_ids,
      protected_authored_unresolved_source_unit_ids: predecessor?.unresolved_source_unit_ids ?? handoff.protected_predecessor.physical_pages.map(page => `PHYSICAL_P${page}`),
      protected_authored_role_binding_required_ids: predecessor?.source_records.filter(row => row.authority_resolution_status.endsWith('ROLE_BINDING_REQUIRED')).map(row => row.object_id) ?? [],
      exact_remaining_effect_object_count: null,
      programme_terminal: false,
      p56_authoring_authorised_by_this_matrix: false,
      gate: predecessor ? 'FAIL_CLOSED_FINITE_PROTECTED_AUTHORITY_POINTER_GAP' : 'FAIL_CLOSED_PREDECESSOR_MATERIALISATION_NOT_PROVEN',
    },
    counting_rule: 'SET_DIFFERENCE_OF_FROZEN_SOURCE_PAGES_AND_VALIDATED_EXPLICIT_HANDOFF_PAGE_IDS_NOT_GENERIC_RNAA_COUNTS',
  };
  residual.descriptor_sha256 = sha256(JSON.stringify(residual));
  return residual;
}

export function materialize({check = false} = {}) {
  const handoff = buildP55();
  const residual = buildSpdResidual(handoff);
  for (const [name, value] of [[OUTPUT, handoff], [RESIDUAL, residual]]) {
    if (check) assert.equal(read(name), encode(value), `Determinism drift: ${name}`);
    else fs.writeFileSync(path.join(APP_ROOT, name), encode(value));
  }
  return { p55_gate: handoff.coverage.gate, source_units: handoff.coverage.source_unit_ids.length, original_atoms: handoff.coverage.original_atom_ids.length, generated_children: handoff.coverage.generated_child_ids.length, active_terminal_review_leaves: handoff.coverage.active_terminal_review_leaf_ids.length, rnaa: handoff.coverage.reviewed_not_assessable_ids.length, remaining_p55_source_objects: handoff.coverage.remaining_p55_source_object_ids.length, programme_terminal: residual.summary.programme_terminal, remaining_technical_page_envelopes: residual.summary.remaining_technical_page_envelopes.length, p56_authoring_authorised: false };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.slice(2).every(arg => arg === '--check'));
  console.log(JSON.stringify(materialize({check:process.argv.includes('--check')}), null, 2));
}
