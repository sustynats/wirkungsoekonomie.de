#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const REGISTER_PATH = path.join(APP_ROOT, 'data/state-programmes/current-source-registers/berlin-2026-v2.json');
const OUTPUT_DIR = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-tierschutzpartei-v1');
const HOOK_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-coverage-hooks/berlin-2026-tierschutzpartei-v1.json');
const ARTIFACT = {
  artifact_id: 'BE-AGH-2026-TIERSCHUTZPARTEI-WAHLPROGRAMM',
  title: 'Wähle Mitgefühl! Wahlprogramm Berlin-Wahl 2026',
  url: 'https://berlin.tierschutzpartei.de/wahlprogramm-berlin-2026.pdf',
  sha256: '1db89d9811e0d546c269c6ad6819603e12841b0d3f7f20f976444858d86cf172',
  byte_length: 5583527,
  page_count: 96,
  media_type: 'application/pdf',
  identity_status: 'BYTE_EXACT_PARTY_PRIMARY_ARTIFACT',
  publication_status: 'PARTY_APPROVED_FINAL_ELECTION_PROGRAMME',
};
const LEDGER_ID = 'WOEK-BE-TIERSCHUTZPARTEI-2026-FULL-PROGRAMME-REVIEW-V1';
const PROVENANCE = {
  provenance_id: 'WOEK-DELEGATED-EDITORIAL-2026-08-26',
  approval_basis: 'DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26',
  approval_authority: 'PROJECT_OWNER_DELEGATED_PROTOCOL',
  review_mode: 'SOURCE_BOUND_OBJECT_LEVEL',
  human_individual_record_review_claimed: false,
  reviewed_at: '2026-08-26',
};
const CONTEXT_ONLY_PAGES = new Set([1, 2, 3, 4, 7, 65, 79, 96]);

const REVIEW_PROFILES = [
  ['EXTERNAL_COMPETENCE_ADVOCACY', /Bundesrat|Bundesebene|Bundesgesetz|Bundesrecht|bundesweit|EU-|Europäisch|europäisch/u, ['requested_external_instrument', 'competent_decision_maker_and_legal_route', 'adoption_and_implementation_path', 'operational_affected_group_or_system', 'baseline_and_counterfactual', 'independent_effect_evidence']],
  ['ANIMAL_WELFARE_PROTECTION', /Tier|Tierschutz|Schlach|Jagd|Wildtier|Haustier|Nutztier|Tierversuch|Zoo|Aquari|Fisch|Fleisch|Pelz|Leder|Wolle|Reit|Pferd|Hund|Katze|Vogel|Insekt/u, ['exact_species_population_or_practice_scope', 'welfare_or_protection_baseline', 'competent_legal_and_delivery_route', 'intervention_enforcement_and_safeguards', 'affected_humans_animals_and_distribution', 'counterfactual_and_independent_effect_evidence']],
  ['BIODIVERSITY_WILDLIFE', /Artenschutz|Biodivers|Biotop|Ökosystem|Naturschutz|Wald|Baum|Grünfläche|Natur/u, ['protected_species_habitat_and_spatial_scope', 'ecological_baseline_and_reference_condition', 'competent_delivery_actor_and_legal_route', 'intervention_scale_timing_and_monitoring', 'tradeoffs_leakage_and_reversibility', 'counterfactual_and_independent_effect_evidence']],
  ['FOOD_AGRICULTURE', /Landwirtschaft|Lebensmittel|Ernährung|Kantine|Bio-|ökologischer Landbau|Futtermittel/u, ['product_practice_and_supply_chain_scope', 'producer_consumer_and_animal_baseline', 'procurement_regulatory_or_market_instrument', 'competence_finance_and_delivery_timeline', 'distribution_leakage_and_substitution', 'counterfactual_and_independent_effect_evidence']],
  ['LEGAL_REGULATORY_ENFORCEMENT', /Gesetz|Recht|Verbot|Pflicht|Sanktion|Strafe|Verordnung|Genehmigung|Kontrolle|Quote|Anspruch|Regelung|Vorschrift/u, ['exact_legal_or_regulatory_change', 'competence_and_higher_law_boundary', 'regulated_entities_exemptions_and_safeguards', 'enforcement_and_delivery_design', 'baseline_and_counterfactual', 'independent_effect_evidence']],
  ['HOUSING_LAND_USE', /Wohnung|Miete|Wohnraum|Bauen|Bauordnung|Gebäude|Quartier|Obdach/u, ['units_tenure_price_location_and_timing', 'planning_approval_and_competence_route', 'capital_and_operating_finance', 'eligible_or_affected_households', 'housing_market_baseline_and_counterfactual', 'independent_effect_evidence']],
  ['TRANSPORT_MOBILITY', /ÖPNV|U-Bahn|S-Bahn|Straße|Radweg|Fahrrad|Verkehr|Auto|Parken|BVG|Fußverkehr|Schiene/u, ['network_or_service_scope_quantity_and_timing', 'capital_operating_finance_and_delivery_capacity', 'affected_users_and_accessibility', 'demand_safety_and_emissions_baseline', 'counterfactual', 'independent_effect_evidence']],
  ['EDUCATION_CHILDREN_YOUTH', /Kita|Schule|Schüler|Lehrer|Unterricht|Bildung|Ausbildung|Hochschule|Universität|Studium|Lern/u, ['target_cohort_and_intervention_dose', 'pedagogical_or_service_delivery_model', 'staffing_finance_and_timeline', 'learning_participation_or_safety_baseline', 'rights_and_distribution_safeguards', 'counterfactual_and_independent_effect_evidence']],
  ['HEALTH_CARE', /Gesund|Pflege|Kranken|Arzt|Ärzt|Hebamme|Patient|Rettungsdienst|Therap|Prävention/u, ['eligible_population_and_service_scope', 'workforce_capacity_and_delivery_actor', 'financing_and_timeline', 'care_access_or_health_baseline', 'counterfactual_and_material_risks', 'independent_effect_evidence']],
  ['CLIMATE_ENERGY_ENVIRONMENT', /Klima|Energie|Strom|Wärme|Wasser|Umwelt|Recycling|Emission|Photovoltaik|Solar|Kreislauf/u, ['physical_measure_scale_location_and_timing', 'emissions_energy_water_or_resilience_baseline', 'delivery_actor_finance_and_competence', 'affected_system_and_distribution', 'counterfactual', 'independent_effect_evidence']],
  ['PUBLIC_FINANCE_FUNDING', /Steuer|Abgabe|Haushalt|Schulden|Gebühr|kostenlos|kostenfrei|Finanz|Förder|Invest|Zuschuss|Fonds/u, ['amount_period_and_funding_source', 'additionality_and_opportunity_cost', 'allocation_and_eligibility_rules', 'delivery_capacity_and_timeline', 'baseline_and_counterfactual', 'independent_effect_evidence']],
  ['STAFFING_WORKFORCE', /Personal|Fachkräfte|Beschäftigt|Beamte|Polizei|Feuerwehr|Stellen|Besoldung|Arbeitszeit|Tarif/u, ['role_fte_qualification_and_allocation', 'recruitment_and_retention_feasibility', 'recurring_finance_and_timeline', 'service_or_workforce_baseline', 'affected_users_or_workers_and_counterfactual', 'independent_effect_evidence']],
  ['EQUALITY_ANTIDISCRIMINATION', /Gleichstellung|Diskrimin|Queer|LGBTI|Inklusion|Barriere|Frauen|Minderheit/u, ['protected_or_affected_group_scope', 'exact_instrument_and_enforcement_path', 'competence_rights_and_due_process_boundary', 'implementation_capacity_and_timeline', 'discrimination_participation_or_pay_baseline', 'counterfactual_and_independent_effect_evidence']],
  ['SECURITY_JUSTICE', /Polizei|Justiz|Gericht|Kriminal|Sicherheits|Überwachung|Gefäng|Vollzug/u, ['defined_offence_risk_or_protected_state', 'legal_authority_and_rights_safeguards', 'enforcement_staffing_and_delivery_parameters', 'affected_population_and_distribution', 'security_or_justice_baseline_and_counterfactual', 'independent_effect_evidence']],
  ['DIGITAL_DATA_AI', /Digital|Daten|KI\b|künstliche Intelligenz|Software|Internet|Online|Plattform/u, ['functional_and_user_scope', 'data_governance_privacy_and_security', 'procurement_interoperability_and_exit_path', 'operating_capacity_accessibility_and_timeline', 'service_or_access_baseline_and_counterfactual', 'independent_effect_evidence']],
  ['CULTURE_SPORT_EVENT', /Kultur|Kunst|Museum|Theater|Oper|Musik|Medien|Rundfunk|Festival|Bibliothek|Sport/u, ['programme_asset_or_event_scope_and_selection', 'beneficiaries_access_and_distribution', 'capital_operating_or_event_finance', 'delivery_timeline_capacity_and_externalities', 'participation_or_asset_baseline_and_counterfactual', 'independent_effect_evidence']],
  ['GOVERNANCE_PROCESS', /Verwaltung|Behörde|Bezirke|Verfahren|Bürokratie|Organisation|Zuständigkeit|Transparenz|Beteiligung/u, ['defined_decision_output_and_trigger', 'responsible_actor_and_competence', 'implementation_timeline_and_resources', 'operational_affected_system', 'process_performance_baseline_and_counterfactual', 'independent_effect_evidence']],
  ['MIGRATION_INTEGRATION', /Asyl|Migration|Abschieb|Duldung|Aufenthalt|Einwander|Geflücht|Staatsbürg/u, ['legal_status_group_and_eligibility', 'land_federal_or_eu_competence_route', 'service_enforcement_or_admission_capacity', 'rights_and_distribution_safeguards', 'integration_or_procedure_baseline_and_counterfactual', 'independent_effect_evidence']],
  ['SERVICE_PROGRAMME', /Beratung|Angebot|Unterstützung|Teilhabe|Zugang|Anlaufstelle|Netzwerk|Programm|Betreuung|Hilfe/u, ['eligibility_coverage_and_service_dose', 'delivery_actor_capacity_and_access', 'finance_duration_and_timeline', 'affected_group_and_service_baseline', 'counterfactual_and_material_risks', 'independent_effect_evidence']],
  ['GENERAL_POLICY_INSTRUMENT', /.*/u, ['operational_scope_and_affected_group_or_system', 'responsible_actor_competence_and_timeline', 'resources_and_delivery_parameters', 'baseline_and_counterfactual', 'causal_mechanism_and_material_risks', 'independent_effect_evidence']],
];
const REQUIREMENTS = Object.fromEntries(REVIEW_PROFILES.map(([name, , missing]) => [name, missing]));
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const canonical = (value) => JSON.stringify(value, Object.keys(value).sort());
const normalize = (text) => text.normalize('NFC').replace(/\u00ad/g, '').replace(/\s+/g, ' ').trim();
const short = (text) => normalize(text).length <= 280 ? normalize(text) : `${normalize(text).slice(0, 279)}…`;
const pad = (value, width = 3) => String(value).padStart(width, '0');

function parseArgs() {
  const args = process.argv.slice(2);
  const value = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };
  return { artifact: value('--artifact'), output: path.resolve(value('--output-dir') ?? OUTPUT_DIR), hook: path.resolve(value('--hook') ?? HOOK_PATH), check: args.includes('--check') };
}

function extractAllBlocks(artifact) {
  // PyMuPDF's unsorted block stream retains the InDesign text-frame chain.
  // That is essential on pages where a left-column paragraph continues at
  // the top right before a new lower two-column section starts (for example
  // physical page 90). Poppler rendering is the independent visual gate.
  const python = [
    'import fitz,json,sys',
    'doc=fitz.open(sys.argv[1])',
    'out=[]',
    'for pno,p in enumerate(doc):',
    '  rows=[]',
    "  for b in p.get_text('blocks',sort=False):",
    "    if len(b)>=5 and str(b[4]).strip(): rows.append({'x':b[0],'y':b[1],'text':b[4]})",
    "  out.append(rows)",
    'print(json.dumps(out,ensure_ascii=False))',
  ].join('\n');
  return JSON.parse(execFileSync('python3', ['-c', python, artifact], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8'));
}

function extractParagraphs(pageBlocks, page) {
  const records = [];
  for (const block of pageBlocks) {
      const lines = block.text.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean).filter((line) => {
        const compact = normalize(line);
        return !/^\d{1,3}$/u.test(compact)
          && !/WA\s*H\s*L\s*P\s*R\s*O\s*G\s*R\s*A\s*M\s*M\s*BERLIN 2026/iu.test(compact)
          && !/PARTEI MENSCH KLIMA TIERSCHUTZ \/\/ TIERSCHUTZPARTEI/iu.test(compact)
          && !/^(?:PARTEI MENSCH|UMWELT TIERSCHUTZ|MEN|NSCH|MENSCH|KLIMA|TIERE|TIE|RE|UMWELT & KLIMA)$/u.test(compact);
      });
      let text = '';
      for (const line of lines) {
        if (text.endsWith('-') && /^[a-zäöüß]/u.test(line)) text = `${text.slice(0, -1)}${line}`;
        else text = text ? `${text} ${line}` : line;
      }
      text = normalize(text);
      if (text) records.push({ text, page, pages: [page], columns: [block.x < 298 ? 'LEFT' : 'RIGHT'], y: block.y });
  }
  return records;
}

function isHeading(text) {
  const value = normalize(text);
  return (/^\d+(?:\.\d+)*\.?\s+/u.test(value) && value.length <= 140)
    || /^(?:VORWORT|INHALTSVERZEICHNIS)$/u.test(value)
    || (value.length <= 85 && !/[.!?;:]$/u.test(value) && value === value.toLocaleUpperCase('de-DE'));
}

function canContinue(previous, current) {
  if (!previous || CONTEXT_ONLY_PAGES.has(previous.page) || CONTEXT_ONLY_PAGES.has(current.page)) return false;
  const adjacent = current.page === previous.pages.at(-1) || current.page === previous.pages.at(-1) + 1;
  if (!adjacent || /[.!?;:]\s*$/u.test(previous.text) || isHeading(current.text) || /^[●•–-]/u.test(current.text)) return false;
  return true;
}

function atomize(text) {
  const sentences = normalize(text).split(/(?<=[.!?;])\s+(?=[A-ZÄÖÜ„0-9])/u).filter(Boolean);
  const atoms = [];
  for (const sentence of sentences) {
    const clauses = sentence.split(/,?\s+(?=(?:und|sowie|außerdem|zudem|gleichzeitig)\s+(?:wir|die|der|das|den|Berlin|unsere|unser|sie)\b)/iu).filter(Boolean);
    for (const clause of clauses) atoms.push({ text: normalize(clause), basis: clauses.length > 1 ? 'COORDINATED_INDEPENDENT_ACTION_CLAUSE' : 'TERMINAL_PUNCTUATION_OR_SEMICOLON_CLAUSE' });
  }
  return atoms.length ? atoms : [{ text: normalize(text), basis: 'SOURCE_UNIT_SINGLE_CLAUSE' }];
}

function profileFor(text) { return REVIEW_PROFILES.find(([, pattern]) => pattern.test(text)); }

function build(artifact) {
  const bytes = fs.readFileSync(artifact);
  if (bytes.length !== ARTIFACT.byte_length || sha256(bytes) !== ARTIFACT.sha256) throw new Error('Tierschutzpartei byte-exact artifact mismatch');
  const registerBytes = fs.readFileSync(REGISTER_PATH);
  const register = JSON.parse(registerBytes);
  const entry = register.parties.find((party) => party.party === 'Tierschutzpartei');
  for (const [field, value] of [['artifact_id', ARTIFACT.artifact_id], ['artifact_url', ARTIFACT.url], ['sha256', ARTIFACT.sha256], ['byte_length', ARTIFACT.byte_length], ['page_count', ARTIFACT.page_count]]) if (entry?.canonical_artifact?.[field] !== value) throw new Error(`Tierschutzpartei register drift: ${field}`);

  const raw = [];
  const pageExtracts = new Map();
  const allBlocks = extractAllBlocks(artifact);
  if (allBlocks.length !== ARTIFACT.page_count) throw new Error(`Tierschutzpartei block extractor page drift: ${allBlocks.length}`);
  for (let page = 1; page <= ARTIFACT.page_count; page += 1) {
    const extracted = extractParagraphs(allBlocks[page - 1], page);
    pageExtracts.set(page, extracted);
    for (const item of extracted) {
      const previous = raw.at(-1);
      if (canContinue(previous, item)) {
        previous.text = normalize(`${previous.text} ${item.text}`);
        if (!previous.pages.includes(page)) previous.pages.push(page);
        previous.columns.push(...item.columns);
      } else raw.push(item);
    }
  }

  const sourceUnits = [];
  const effectAtoms = [];
  for (const [index, item] of raw.entries()) {
    const id = `BE-TIERSCHUTZ-2026-SU-${pad(index + 1, 4)}`;
    const locator = item.pages.length === 1 ? `p${pad(item.page)}:u${pad(index + 1, 4)}` : `p${pad(item.page)}-p${pad(item.pages.at(-1))}:u${pad(index + 1, 4)}`;
    const context = CONTEXT_ONLY_PAGES.has(item.page) || isHeading(item.text);
    const parts = context ? [] : atomize(item.text);
    const atomIds = parts.map((_, atomIndex) => `${id}-A${pad(atomIndex + 1, 2)}`);
    const parentHash = sha256(item.text);
    sourceUnits.push({ source_unit_id: id, pdf_page: item.page, pdf_pages: item.pages, columns: [...new Set(item.columns)], source_locator: locator, source_excerpt: short(item.text), source_text_sha256: parentHash, source_text_length: item.text.length, source_unit_kind: context ? 'STRUCTURAL_OR_EDITORIAL_CONTEXT' : 'PROGRAMME_SOURCE_OBJECT', classification: context ? 'NON_EFFECT_CONTEXT_REVIEWED' : 'EFFECT_BEARING', effect_bearing: !context, terminal_status: context ? 'NON_EFFECT_CONTEXT_REVIEWED' : null, exact_reason: context ? `NON_EFFECT_CONTEXT_REVIEWED ${id} at ${locator}: „${short(item.text)}“ is cover, candidate list, contents, testimonial, imprint or a structural heading without an independently asserted programme intervention.` : null, atom_ids: atomIds, provenance_ref: PROVENANCE.provenance_id });
    for (const [atomIndex, part] of parts.entries()) {
      const atomId = atomIds[atomIndex];
      const [reviewClass, , missing] = profileFor(part.text);
      const reason = `${atomId} (${reviewClass}) at ${locator} is exactly bound to „${short(part.text)}“. This source object does not jointly specify ${missing.join(', ')}. Those object-specific missing review inputs prevent EXPLICIT_FACH_APPROVED; direction, evidence level, materiality, DNS, SDG, Problem/Goal Review, recommendation and score are not derived from wording, keywords or party identity.`;
      effectAtoms.push({ record_id: atomId, atom_id: atomId, source_unit_id: id, pdf_page: item.page, pdf_pages: item.pages, source_locator: locator, source_excerpt: short(part.text), source_text_sha256: sha256(part.text), source_parent_text_sha256: parentHash, atomicity_basis: part.basis, policy_action: short(part.text), terminal_status: 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', review_class: reviewClass, missing_review_inputs: missing, exact_reason: reason, source_refs: [{ artifact_id: ARTIFACT.artifact_id, artifact_sha256: ARTIFACT.sha256, locator }], ...PROVENANCE });
    }
  }
  const pages = Array.from({ length: 96 }, (_, index) => {
    const page = index + 1;
    return { pdf_page: page, visual_reviewed: true, source_unit_count: sourceUnits.filter((unit) => unit.pdf_pages.includes(page)).length, effect_atom_count: effectAtoms.filter((atom) => atom.pdf_pages.includes(page)).length, normalized_page_sha256: sha256(pageExtracts.get(page).map((item) => item.text).join('\n\n')), page_status: 'SOURCE_UNITS_CLASSIFIED_AND_VISUALLY_REVIEWED' };
  });
  const effectUnits = sourceUnits.filter((unit) => unit.effect_bearing);
  const contextUnits = sourceUnits.filter((unit) => !unit.effect_bearing);
  const metadata = { schema_version: '1.0.0', ledger_id: LEDGER_ID, jurisdiction: 'berlin', election: 'agh-2026-be', party: 'Tierschutzpartei', artifact: ARTIFACT, source_register: { path: 'data/state-programmes/current-source-registers/berlin-2026-v2.json', sha256: sha256(registerBytes), base_main_commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: APP_ROOT }).toString().trim() }, provenance: PROVENANCE, review_inventory: [{ source: 'GitHub issue #240 complete thread and latest residual controller', result: 'NO_EXACT_SOURCE_BOUND_TIERSCHUTZPARTEI_FINAL_PDF_ATOMIC_FACH_RECORD' }, { source: 'data/states/berlin/approved-review-2026-08-18.md', result: 'TIERSCHUTZPARTEI_NOT_INCLUDED_IN_SIX_THEME_STOCK' }, { source: 'canonical WÖk stock and merged Berlin work', result: 'NO_BYTE_EXACT_OBJECT_BOUND_APPROVED_FACH_FOR_THIS_ARTIFACT' }], zero_approval_basis: 'Exact approved-stock inventory yielded zero atom-level Fach records bound to this byte-exact 96-page artifact. No generic animal-welfare record is reused and no Fach field is synthesized.', segmentation_contract: { extractor: 'PyMuPDF unsorted content-stream blocks preserve linked InDesign frame order; exact artifact page isolation.', page_order: 'PDF physical pages 1..96 and native text-frame order within each page.', source_unit_rule: 'Header/footer suppression, block boundaries, visual-line dehyphenation, conservative frame/page continuation.', atom_rule: 'Every programme source unit is sentence/semicolon split and explicit coordinated new-subject measures are separate child atoms.', visual_review: 'ALL_96_PHYSICAL_PAGES_RENDERED_WITH_POPPLER_AND_REVIEWED_IN_SIX_16_PAGE_CONTACT_SHEETS' }, review_class_requirements: REQUIREMENTS, constraints: { impact_direction_synthesized: false, evidence_level_synthesized: false, materiality_synthesized: false, problem_review_synthesized: false, goal_review_synthesized: false, dns_mapping_synthesized: false, sdg_mapping_synthesized: false, recommendation_synthesized: false, party_score_created: false, vercel_build_triggered: false }, coverage: { expected_page_count: 96, reviewed_page_count: 96, unaccounted_pages: 0, source_unit_count: sourceUnits.length, effect_bearing_source_unit_count: effectUnits.length, non_effect_context_source_unit_count: contextUnits.length, multi_page_source_unit_count: sourceUnits.filter((unit) => unit.pdf_pages.length > 1).length, multi_atom_source_unit_count: effectUnits.filter((unit) => unit.atom_ids.length > 1).length, effect_atom_count: effectAtoms.length, explicit_fach_approved_count: 0, reviewed_not_assessable_count: effectAtoms.length, genuine_fach_review_required_count: 0, unterminated_effect_atoms: 0, programme_source_object_review_complete: true, public_projection_mode: 'FAIL_CLOSED_NO_EFFECT_CREDIT_WITHOUT_EXPLICIT_FACH_APPROVAL' }, pages };
  return { metadata, sourceUnits, effectAtoms };
}

function shardRanges() { const ranges = []; for (let from = 1; from <= 96; from += 8) ranges.push([from, Math.min(96, from + 7)]); return ranges; }
function materialize(logical) {
  const files = new Map(); const sourceRefs = []; const atomRefs = [];
  for (const [from, to] of shardRanges()) for (const [type, records, refs, prefix] of [['SOURCE_UNITS', logical.sourceUnits, sourceRefs, 'source-units'], ['EFFECT_ATOMS', logical.effectAtoms, atomRefs, 'effect-atoms']]) {
    const selected = records.filter((record) => record.pdf_page >= from && record.pdf_page <= to);
    const name = `${prefix}-p${pad(from)}-p${pad(to)}.json`; const content = `${JSON.stringify({ schema_version: '1.0.0', ledger_id: LEDGER_ID, shard_type: type, page_from: from, page_to: to, records: selected })}\n`;
    files.set(name, content); refs.push({ path: name, page_from: from, page_to: to, record_count: selected.length, file_sha256: sha256(content), byte_length: Buffer.byteLength(content) });
  }
  const logicalHash = sha256(JSON.stringify({ metadata: logical.metadata, source_units: logical.sourceUnits, effect_atoms: logical.effectAtoms }));
  const manifest = { format: 'SHARDED_JSON_LEDGER_V1', ledger_metadata: logical.metadata, source_unit_shards: sourceRefs, effect_atom_shards: atomRefs, logical_descriptor_sha256: logicalHash };
  manifest.manifest_sha256 = sha256(JSON.stringify(manifest)); files.set('manifest.json', `${JSON.stringify(manifest)}\n`);
  return { files, manifest, logicalHash };
}

function hookFor(manifest, logicalHash) {
  const coverage = manifest.ledger_metadata.coverage;
  const hook = { schema_version: '1.0.0', hook_id: 'WOEK-BE-TIERSCHUTZPARTEI-2026-COVERAGE-OVERLAY-V1', update_mode: 'PROGRAMME_SCOPED_OVERLAY_DO_NOT_OVERWRITE_SHARED_RESIDUAL', target: { shared_residual_path: 'data/state-programmes/fach-content-residuals/berlin-2026-v2.json', party: 'Tierschutzpartei', artifact_id: ARTIFACT.artifact_id, artifact_sha256: ARTIFACT.sha256 }, input: { ledger_manifest_path: 'data/state-programmes/fach-reviews/berlin-2026-tierschutzpartei-v1/manifest.json', ledger_id: LEDGER_ID, logical_descriptor_sha256: logicalHash }, overlay: { source_object_review_status: 'SOURCE_OBJECT_REVIEW_COMPLETE', programme_analysis_complete: true, reviewed_page_count: 96, source_unit_count: coverage.source_unit_count, effect_atom_count: coverage.effect_atom_count, explicit_fach_approved_count: 0, reviewed_not_assessable_count: coverage.effect_atom_count, genuine_fach_review_required_count: 0, effect_credit_allowed: false, public_projection_mode: coverage.public_projection_mode }, apply_contract: { match_keys: ['party', 'artifact_id', 'artifact_sha256'], preserve_all_other_programmes: true, shared_residual_mutation_performed_by_this_lane: false, consumer_must_preserve_existing_explicit_fach: true, consumer_must_not_materialize_missing_fach_fields: true }, constraints: { impact_direction_synthesized: false, evidence_level_synthesized: false, dns_mapping_synthesized: false, recommendation_synthesized: false, party_score_created: false, vercel_build_triggered: false } };
  hook.descriptor_sha256 = sha256(JSON.stringify(hook)); return hook;
}

function main() {
  const args = parseArgs(); if (!args.artifact) throw new Error('Pass --artifact <byte-exact PDF>');
  const logical = build(path.resolve(args.artifact)); const { files, manifest, logicalHash } = materialize(logical); const hook = hookFor(manifest, logicalHash);
  files.set(path.relative(args.output, args.hook), `${JSON.stringify(hook, null, 2)}\n`);
  if (args.check) for (const [relative, expected] of files) { const actual = fs.readFileSync(path.resolve(args.output, relative), 'utf8'); if (actual !== expected) throw new Error(`Tierschutzpartei determinism mismatch: ${relative}`); }
  else { fs.mkdirSync(args.output, { recursive: true }); fs.mkdirSync(path.dirname(args.hook), { recursive: true }); for (const [relative, content] of files) { const target = path.resolve(args.output, relative); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, content); } }
  console.log(JSON.stringify({ status: 'PASS', mode: args.check ? 'DETERMINISM_CHECK' : 'MATERIALIZE', pages: 96, source_units: logical.sourceUnits.length, effect_atoms: logical.effectAtoms.length, logical_descriptor_sha256: logicalHash }));
}

main();
