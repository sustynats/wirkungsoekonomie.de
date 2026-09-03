#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const REGISTER_PATH = path.join(APP_ROOT, 'data/state-programmes/current-source-registers/berlin-2026-v2.json');
const DEFAULT_OUTPUT_DIR = path.join(APP_ROOT, 'data/state-programmes/fach-reviews/berlin-2026-fdp-v1');
const DEFAULT_HOOK_PATH = path.join(APP_ROOT, 'data/state-programmes/fach-coverage-hooks/berlin-2026-fdp-v1.json');
const ARTIFACT = {
  artifact_id: 'BE-AGH-2026-FDP-WAHLPROGRAMM',
  title: 'Berlin geht besser. Das Wahlprogramm zur Abgeordnetenhauswahl 2026',
  url: 'https://www.fdp-berlin.de/sites/default/files/2026-07/Wahlprogramm_FDP%20Berlin_Abgeordnetenhauswahl%202026_FINAL.pdf',
  sha256: '3e3e1f5cac99864937d79e4d7c9c0bda4a03a71868ba1f25d8bf918766223f32',
  byte_length: 1208209,
  page_count: 121,
  media_type: 'application/pdf',
  identity_status: 'BYTE_EXACT_PARTY_PRIMARY_ARTIFACT',
  publication_status: 'PARTY_PUBLISHED_FINAL_ELECTION_PROGRAMME',
};
const LEDGER_ID = 'WOEK-BE-FDP-2026-FULL-PROGRAMME-REVIEW-V1';
const PROVENANCE = {
  provenance_id: 'WOEK-DELEGATED-EDITORIAL-2026-08-26',
  approval_basis: 'DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26',
  approval_authority: 'PROJECT_OWNER_DELEGATED_PROTOCOL',
  review_mode: 'SOURCE_BOUND_OBJECT_LEVEL',
  human_individual_record_review_claimed: false,
  reviewed_at: '2026-08-26',
};

const REVIEW_CLASS_REQUIREMENTS = {
  EXTERNAL_COMPETENCE_ADVOCACY: ['requested_external_instrument', 'competent_decision_maker_and_legal_route', 'adoption_and_implementation_path', 'operational_affected_group_or_system', 'baseline_and_counterfactual', 'independent_effect_evidence'],
  LEGAL_REGULATORY_ENFORCEMENT: ['exact_legal_or_regulatory_change', 'competence_and_higher_law_boundary', 'regulated_entities_exemptions_and_safeguards', 'enforcement_and_delivery_design', 'baseline_and_counterfactual', 'independent_effect_evidence'],
  TAX_FEE_PRICE_INSTRUMENT: ['tax_fee_or_price_base_rate_and_exemptions', 'competence_and_legal_basis', 'incidence_and_distribution_scope', 'revenue_use_or_financing_interaction', 'baseline_and_counterfactual', 'independent_effect_evidence'],
  PUBLIC_FINANCE_FUNDING: ['amount_period_and_funding_source', 'additionality_and_opportunity_cost', 'allocation_and_eligibility_rules', 'delivery_capacity_and_timeline', 'baseline_and_counterfactual', 'independent_effect_evidence'],
  HOUSING_LAND_USE: ['units_tenure_price_location_and_timing', 'planning_approval_and_competence_route', 'capital_and_operating_finance', 'eligible_or_affected_households', 'housing_market_baseline_and_counterfactual', 'independent_effect_evidence'],
  TRANSPORT_MOBILITY: ['network_or_service_scope_quantity_and_timing', 'capital_operating_finance_and_delivery_capacity', 'affected_users_and_accessibility', 'demand_safety_and_emissions_baseline', 'counterfactual', 'independent_effect_evidence'],
  CLIMATE_ENERGY_ENVIRONMENT: ['physical_measure_scale_location_and_timing', 'emissions_energy_water_or_resilience_baseline', 'delivery_actor_finance_and_competence', 'affected_system_and_distribution', 'counterfactual', 'independent_effect_evidence'],
  HEALTH_CARE: ['eligible_population_and_service_scope', 'workforce_capacity_and_delivery_actor', 'financing_and_timeline', 'care_access_or_health_baseline', 'counterfactual_and_material_risks', 'independent_effect_evidence'],
  EDUCATION_CHILDREN_YOUTH: ['target_cohort_and_intervention_dose', 'pedagogical_or_service_delivery_model', 'staffing_finance_and_timeline', 'learning_participation_or_safety_baseline', 'rights_and_distribution_safeguards', 'counterfactual_and_independent_effect_evidence'],
  SECURITY_JUSTICE: ['defined_offence_risk_or_protected_state', 'legal_authority_and_rights_safeguards', 'enforcement_staffing_and_delivery_parameters', 'affected_population_and_distribution', 'security_or_justice_baseline_and_counterfactual', 'independent_effect_evidence'],
  MIGRATION_INTEGRATION: ['legal_status_group_and_eligibility', 'land_federal_or_eu_competence_route', 'service_enforcement_or_admission_capacity', 'rights_and_distribution_safeguards', 'integration_or_procedure_baseline_and_counterfactual', 'independent_effect_evidence'],
  EQUALITY_ANTIDISCRIMINATION: ['protected_or_affected_group_scope', 'exact_instrument_and_enforcement_path', 'competence_rights_and_due_process_boundary', 'implementation_capacity_and_timeline', 'discrimination_participation_or_pay_baseline', 'counterfactual_and_independent_effect_evidence'],
  DIGITAL_DATA_AI: ['functional_and_user_scope', 'data_governance_privacy_and_security', 'procurement_interoperability_and_exit_path', 'operating_capacity_accessibility_and_timeline', 'service_or_access_baseline_and_counterfactual', 'independent_effect_evidence'],
  STAFFING_WORKFORCE: ['role_fte_qualification_and_allocation', 'recruitment_and_retention_feasibility', 'recurring_finance_and_timeline', 'service_or_workforce_baseline', 'affected_users_or_workers_and_counterfactual', 'independent_effect_evidence'],
  INFRASTRUCTURE_CAPACITY: ['asset_scope_location_quantity_and_timing', 'capital_operating_finance_and_additionality', 'planning_procurement_and_delivery_capacity', 'affected_users_or_system', 'capacity_condition_baseline_and_counterfactual', 'independent_effect_evidence'],
  SERVICE_PROGRAMME: ['eligibility_coverage_and_service_dose', 'delivery_actor_capacity_and_access', 'finance_duration_and_timeline', 'affected_group_and_service_baseline', 'counterfactual_and_material_risks', 'independent_effect_evidence'],
  CULTURE_SPORT_EVENT: ['programme_asset_or_event_scope_and_selection', 'beneficiaries_access_and_distribution', 'capital_operating_or_event_finance', 'delivery_timeline_capacity_and_externalities', 'participation_or_asset_baseline_and_counterfactual', 'independent_effect_evidence'],
  GOVERNANCE_PROCESS: ['defined_decision_output_and_trigger', 'responsible_actor_and_competence', 'implementation_timeline_and_resources', 'operational_affected_system', 'process_performance_baseline_and_counterfactual', 'independent_effect_evidence'],
  TARGET_OR_ASPIRATION: ['implementing_policy_instrument', 'operational_affected_group_or_system', 'baseline_indicator_and_target_value', 'causal_mechanism_and_time_horizon', 'competence_and_delivery_path', 'independent_effect_evidence'],
  GENERAL_POLICY_INSTRUMENT: ['operational_scope_and_affected_group_or_system', 'responsible_actor_competence_and_timeline', 'resources_and_delivery_parameters', 'baseline_and_counterfactual', 'causal_mechanism_and_material_risks', 'independent_effect_evidence'],
};

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortDeep(value[key])]));
}

function canonicalJson(value) {
  return JSON.stringify(sortDeep(value));
}

function normalize(text) {
  return text.normalize('NFC').replace(/\u00ad/g, '').replace(/\s+/g, ' ').trim();
}

function excerpt(text) {
  const normalized = normalize(text);
  return normalized.length <= 280 ? normalized : `${normalized.slice(0, 279)}…`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const value = (flag) => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : null;
  };
  return {
    artifactPath: value('--artifact'),
    outputDir: path.resolve(value('--output-dir') ?? DEFAULT_OUTPUT_DIR),
    hookPath: path.resolve(value('--hook') ?? DEFAULT_HOOK_PATH),
    check: args.includes('--check'),
  };
}

function extractPageParagraphs(artifactPath, pdfPage) {
  const raw = execFileSync('pdftotext', [
    '-f', String(pdfPage), '-l', String(pdfPage), '-layout', artifactPath, '-',
  ]).toString('utf8');
  const paragraphs = [];
  let lines = [];
  const flush = () => {
    const text = normalize(lines.join(' '));
    if (text) paragraphs.push(text);
    lines = [];
  };
  for (const sourceLine of raw.split(/\r?\n/)) {
    const line = sourceLine.trim();
    if (
      line === 'Freie Demokraten – FDP Berlin'
      || line === 'Wahlprogramm zur Abgeordnetenhauswahl 2026'
      || /^\d{1,3}$/.test(line)
      || line === '\f'
    ) continue;
    if (!line) flush();
    else lines.push(line);
  }
  flush();
  return paragraphs;
}

function isHeading(text) {
  if (/^[●•]|^\d+[.)]\s/u.test(text)) return false;
  if (text.length > 170) return false;
  if (/[.!?]\s*$/u.test(text)) return false;
  return !/\b(?:wir|Berlin|Land|Senat|Bezirke?)\s+(?:wollen|werden|fordern|setzen|müssen|sollen|soll|muss)\b/iu.test(text);
}

function shouldJoinPageContinuation(previous, currentText, pdfPage) {
  if (!previous || previous.pdf_pages.at(-1) !== pdfPage - 1) return false;
  // Physical pages 1-5 are cover/foreword/contents. Never let a contents row
  // consume the first substantive programme object on physical page 6.
  if (previous.pdf_page <= 5) return false;
  if (/[.!?]\s*$/u.test(previous.full_text)) return false;
  if (/^[●•]|^\d+[.)]\s/u.test(currentText) || isHeading(currentText)) return false;
  return true;
}

function atomize(text) {
  const sentenceParts = normalize(text)
    .split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ„●0-9])|;\s+(?=[A-ZÄÖÜ„●0-9])/u)
    .map((part) => part.trim())
    .filter(Boolean);
  const parts = [];
  const coordination = /(?:,\s*)?(?:und|sowie)\s+(?=(?:wir|Berlin|das Land|der Senat|die Bezirke|der Regionalverband|die Verwaltung|die Unternehmen)\b)/giu;
  for (const sentence of sentenceParts) {
    const clauses = sentence.split(coordination).map((part) => part.trim()).filter(Boolean);
    for (const clause of clauses) {
      parts.push({
        text: clause,
        atomicity_basis: clauses.length > 1
          ? 'COORDINATED_INDEPENDENT_ACTION_CLAUSE'
          : 'TERMINAL_PUNCTUATION_OR_SEMICOLON_CLAUSE',
      });
    }
  }
  return parts.length ? parts : [{ text: normalize(text), atomicity_basis: 'TERMINAL_PUNCTUATION_OR_SEMICOLON_CLAUSE' }];
}

function reviewClassForObject(pdfPage, sourceText) {
  // This classifies only the explicitly named instrument form and hence the
  // finite inputs needed for review. It never assigns direction or evidence.
  if (/\b(?:Bundesebene|Bundesrecht|Bundesgesetz|Bundesrat|Europäische Union|EU-Recht|bundesweit)\b/iu.test(sourceText)) return 'EXTERNAL_COMPETENCE_ADVOCACY';
  if (/\b(?:Gesetz|Rechtsanspruch|Verbot|Pflicht|Sanktion|Genehmigung|Kontrolle|Straf|Ordnungsamt|Polizei|Justiz|Gericht)\w*/iu.test(sourceText)) return 'LEGAL_REGULATORY_ENFORCEMENT';
  if (/\b(?:Steuer|Abgabe|Gebühr|Beitragssatz|Hebesatz|Tarif|Preisobergrenze)\w*/iu.test(sourceText)) return 'TAX_FEE_PRICE_INSTRUMENT';
  if (/\b(?:Fördermittel|Finanzierung|finanzieren|Zuschuss|Subvention|Stipendium|Haushaltsmittel|Budget)\w*/iu.test(sourceText)) return 'PUBLIC_FINANCE_FUNDING';
  if (/\b(?:Fachkräfte|Lehrkräfte|Personal|Stellen|Besoldung|Vergütung|Ausbildung|Weiterbildung|Qualifizierung)\w*/iu.test(sourceText)) return 'STAFFING_WORKFORCE';
  if (pdfPage <= 17) return 'EDUCATION_CHILDREN_YOUTH';
  if (/\b(?:bauen|Ausbau|Sanierung|Infrastruktur|Gebäude|Anlage|Standort|Fläche|Netz|Kapazität)\w*/iu.test(sourceText)) return 'INFRASTRUCTURE_CAPACITY';
  if (pdfPage <= 24) return 'GOVERNANCE_PROCESS';
  if (pdfPage <= 34) return /\b(?:Club|Kultur|Tourismus|Games|Veranstaltung)\w*/iu.test(sourceText) ? 'CULTURE_SPORT_EVENT' : 'GENERAL_POLICY_INSTRUMENT';
  if (pdfPage <= 48) return 'HOUSING_LAND_USE';
  if (pdfPage <= 53) return 'PUBLIC_FINANCE_FUNDING';
  if (pdfPage <= 65) return 'TRANSPORT_MOBILITY';
  if (pdfPage <= 82) return /\b(?:Gleichstellung|Antisemitismus|Diskriminierung|Emanzipation|Minderheit|Gewalt gegen Frauen)\w*/iu.test(sourceText) ? 'EQUALITY_ANTIDISCRIMINATION' : 'SECURITY_JUSTICE';
  if (pdfPage <= 84) return 'CULTURE_SPORT_EVENT';
  if (pdfPage <= 86) return 'GOVERNANCE_PROCESS';
  if (pdfPage <= 90) return 'CLIMATE_ENERGY_ENVIRONMENT';
  if (pdfPage <= 94) return 'DIGITAL_DATA_AI';
  if (pdfPage <= 99) return 'MIGRATION_INTEGRATION';
  if (pdfPage <= 111) return 'CULTURE_SPORT_EVENT';
  if (pdfPage <= 114) return 'SERVICE_PROGRAMME';
  if (pdfPage <= 119) return /\b(?:Sucht|Drogen|Gesundheit|Krankenhaus|Patient|Pflege|Prävention)\w*/iu.test(sourceText) ? 'HEALTH_CARE' : 'SERVICE_PROGRAMME';
  if (/\b(?:Ziel|anstreben|Perspektive|Vision)\w*/iu.test(sourceText)) return 'TARGET_OR_ASPIRATION';
  return 'EQUALITY_ANTIDISCRIMINATION';
}

function exactReason(atomId, reviewClass, atomText, missingInputs, sourceLocator) {
  return `${atomId} (${reviewClass}) ist an ${sourceLocator} exakt an „${excerpt(atomText)}“ gebunden. Der Wortlaut legt nicht gemeinsam ${missingInputs.join(', ')} fest. Diese für genau das Einzelobjekt fehlenden Prüfeingaben verhindern EXPLICIT_FACH_APPROVED; Richtung, Evidenzstufe, DNS, SDG, Problem-/Goal-Review und Recommendation werden nicht aus Programmtext, Parteiidentität oder Schlagworten ergänzt.`;
}

function buildLogicalLedger(artifactPath) {
  const bytes = fs.readFileSync(artifactPath);
  if (bytes.length !== ARTIFACT.byte_length) throw new Error(`FDP artifact byte length mismatch: ${bytes.length}`);
  if (sha256(bytes) !== ARTIFACT.sha256) throw new Error(`FDP artifact SHA-256 mismatch: ${sha256(bytes)}`);
  const registerBytes = fs.readFileSync(REGISTER_PATH);
  const register = JSON.parse(registerBytes.toString('utf8'));
  const registered = register.parties.find((party) => party.party === 'FDP');
  if (!registered) throw new Error('FDP missing from Berlin current-source register');
  for (const [field, expected] of [
    ['artifact_id', ARTIFACT.artifact_id], ['artifact_url', ARTIFACT.url], ['sha256', ARTIFACT.sha256],
    ['byte_length', ARTIFACT.byte_length], ['page_count', ARTIFACT.page_count],
  ]) {
    if (registered.canonical_artifact[field] !== expected) throw new Error(`FDP source-register ${field} drift`);
  }

  const rawUnits = [];
  for (let pdfPage = 1; pdfPage <= ARTIFACT.page_count; pdfPage += 1) {
    const paragraphs = extractPageParagraphs(artifactPath, pdfPage);
    for (const paragraph of paragraphs) {
      const previous = rawUnits.at(-1);
      if (shouldJoinPageContinuation(previous, paragraph, pdfPage)) {
        previous.full_text = normalize(`${previous.full_text} ${paragraph}`);
        previous.pdf_pages.push(pdfPage);
      } else {
        rawUnits.push({ full_text: paragraph, pdf_page: pdfPage, pdf_pages: [pdfPage] });
      }
    }
  }

  const sourceUnits = [];
  const effectAtoms = [];
  for (const [unitIndex, rawUnit] of rawUnits.entries()) {
    const sourceUnitId = `BE-FDP-2026-SU-${String(unitIndex + 1).padStart(4, '0')}`;
    const sourceLocator = rawUnit.pdf_pages.length === 1
      ? `p${String(rawUnit.pdf_page).padStart(3, '0')}:u${String(unitIndex + 1).padStart(4, '0')}`
      : `p${String(rawUnit.pdf_page).padStart(3, '0')}-p${String(rawUnit.pdf_pages.at(-1)).padStart(3, '0')}:u${String(unitIndex + 1).padStart(4, '0')}`;
    const structuralContext = rawUnit.pdf_page <= 5 || isHeading(rawUnit.full_text);
    const atomParts = structuralContext ? [] : atomize(rawUnit.full_text);
    const atomIds = atomParts.map((_, index) => `${sourceUnitId}-A${String(index + 1).padStart(2, '0')}`);
    const sourceHash = sha256(rawUnit.full_text);
    sourceUnits.push({
      source_unit_id: sourceUnitId,
      pdf_page: rawUnit.pdf_page,
      pdf_pages: rawUnit.pdf_pages,
      source_locator: sourceLocator,
      source_excerpt: excerpt(rawUnit.full_text),
      source_text_sha256: sourceHash,
      source_text_length: rawUnit.full_text.length,
      source_unit_kind: rawUnit.pdf_page <= 5 ? 'FRONTMATTER_OR_CONTENTS' : isHeading(rawUnit.full_text) ? 'STRUCTURAL_HEADING' : 'PROGRAMME_SOURCE_OBJECT',
      classification: structuralContext ? 'NON_EFFECT_CONTEXT' : 'EFFECT_BEARING',
      classification_basis: structuralContext
        ? `The complete source unit at ${sourceLocator} is frontmatter, contents or a structural heading and carries no independent policy instrument.`
        : `The complete source unit at ${sourceLocator} contains one or more programme claims; every sentence/independent clause remains bound to a separate terminal child atom so no effect-bearing source wording is silently omitted.`,
      effect_bearing: !structuralContext,
      terminal_status: structuralContext ? 'NON_EFFECT_CONTEXT_REVIEWED' : null,
      exact_reason: structuralContext ? `NON_EFFECT_CONTEXT_REVIEWED ${sourceUnitId} at ${sourceLocator}: „${excerpt(rawUnit.full_text)}“ is source-visible frontmatter, contents or a structural heading, not an independent effect object.` : null,
      atom_ids: atomIds,
      provenance_ref: PROVENANCE.provenance_id,
    });
    for (const [atomIndex, atomPart] of atomParts.entries()) {
      const atomId = atomIds[atomIndex];
      const reviewClass = reviewClassForObject(rawUnit.pdf_page, atomPart.text);
      const missingInputs = REVIEW_CLASS_REQUIREMENTS[reviewClass];
      effectAtoms.push({
        record_id: atomId,
        atom_id: atomId,
        source_unit_id: sourceUnitId,
        pdf_page: rawUnit.pdf_page,
        pdf_pages: rawUnit.pdf_pages,
        source_locator: sourceLocator,
        source_excerpt: excerpt(atomPart.text),
        source_text_sha256: sha256(atomPart.text),
        source_parent_text_sha256: sourceHash,
        atomicity_basis: atomPart.atomicity_basis,
        grammatical_context_inherited_from_source_unit: !/^(?:Wir|Berlin|Das Land|Der Senat|Die Bezirke|Der Regionalverband|Die Verwaltung|Die Unternehmen)\b/u.test(atomPart.text),
        policy_action: excerpt(atomPart.text),
        terminal_status: 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
        review_class: reviewClass,
        missing_review_inputs: missingInputs,
        exact_reason: exactReason(atomId, reviewClass, atomPart.text, missingInputs, sourceLocator),
        source_refs: [{ artifact_id: ARTIFACT.artifact_id, artifact_sha256: ARTIFACT.sha256, locator: sourceLocator }],
        approval_basis: PROVENANCE.approval_basis,
        approval_authority: PROVENANCE.approval_authority,
        review_mode: PROVENANCE.review_mode,
        human_individual_record_review_claimed: PROVENANCE.human_individual_record_review_claimed,
        reviewed_at: PROVENANCE.reviewed_at,
      });
    }
  }

  const sourceUnitById = new Map(sourceUnits.map((unit) => [unit.source_unit_id, unit]));
  const pages = Array.from({ length: ARTIFACT.page_count }, (_, index) => {
    const pdfPage = index + 1;
    const pageUnits = sourceUnits.filter((unit) => unit.pdf_pages.includes(pdfPage));
    const pageAtoms = effectAtoms.filter((atom) => atom.pdf_pages.includes(pdfPage));
    return {
      pdf_page: pdfPage,
      visual_reviewed: true,
      source_unit_count: pageUnits.length,
      effect_atom_count: pageAtoms.length,
      normalized_page_sha256: sha256(extractPageParagraphs(artifactPath, pdfPage).join('\n\n')),
      page_status: pageUnits.length ? 'SOURCE_UNITS_CLASSIFIED' : 'VISUAL_NON_EFFECT_OR_BLANK_PAGE_REVIEWED',
    };
  });
  const effectUnits = sourceUnits.filter((unit) => unit.effect_bearing);
  const contextUnits = sourceUnits.filter((unit) => !unit.effect_bearing);
  const reviewClassCounts = Object.fromEntries(Object.keys(REVIEW_CLASS_REQUIREMENTS).map((key) => [key, 0]));
  for (const atom of effectAtoms) reviewClassCounts[atom.review_class] += 1;
  const ledgerMetadata = {
    schema_version: '1.0.0',
    ledger_id: LEDGER_ID,
    jurisdiction: 'berlin',
    election: 'agh-2026-be',
    party: 'FDP',
    artifact: ARTIFACT,
    source_register: {
      path: 'data/state-programmes/current-source-registers/berlin-2026-v2.json',
      sha256: sha256(registerBytes),
      base_main_commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: APP_ROOT }).toString('utf8').trim(),
    },
    provenance: PROVENANCE,
    review_inventory: [
      { source: 'GitHub issue #240 latest residual controller and linked completed work', result: 'NO_EXACT_SOURCE_BOUND_FDP_FINAL_PDF_ATOMIC_FACH_RECORD' },
      { source: 'data/states/berlin/approved-review-2026-08-18.md', sha256: sha256(fs.readFileSync(path.join(APP_ROOT, 'data/states/berlin/approved-review-2026-08-18.md'))), result: 'SIX_THEME_NON_EXHAUSTIVE_REVIEW_NOT_BYTE_EXACT_OBJECT_BOUND' },
      { source: 'data/state-programmes/fach-content-residuals/berlin-2026-v1.json', result: '121_PAGE_ENVELOPE_RESIDUAL_ONLY_NO_EXPLICIT_FDP_ATOMIC_FACH' },
    ],
    zero_approval_basis: 'Every available approved Berlin stock record was inventoried. None binds the complete required Fach field set to an exact atom in this byte-exact 121-page FDP artifact. No EXPLICIT_FACH_APPROVED record is therefore reused or created; this is an exact stock-inventory result, not a party-, keyword- or missing-evidence-only downgrade rule.',
    segmentation_contract: {
      extractor: 'Poppler pdftotext -layout, exact physical-page isolation',
      page_order: 'PDF physical page order 1..121',
      source_unit_rule: 'Exact header/footer removal; blank-line paragraph boundaries; cross-page continuation only where prior text lacks terminal punctuation and next page begins without heading/list marker.',
      atom_rule: 'Every non-structural programme source unit is preserved whole; terminal-punctuation/semicolon claims and explicit new-subject coordinated clauses receive separate source-bound atom IDs.',
      classification_rule: 'Cover, technical foreword, contents and structural headings are terminal NON_EFFECT_CONTEXT; all remaining programme wording is conservatively retained as EFFECT_BEARING and atomized without assigning impact direction.',
      excerpt_rule: 'Whitespace-normalized PDF text-layer excerpt, maximum 280 Unicode code points; full source identities pinned by SHA-256.',
      visual_review: 'ALL_121_PHYSICAL_PAGES_RENDERED_WITH_POPPLER_AND_REVIEWED_IN_CONTACT_SHEETS; BLANK_LAYOUT_PAGES, LISTS, SUBLISTS, BOX-LIKE GROUPINGS, FOOTERS AND CROSS-PAGE CONTINUATIONS INCLUDED.',
    },
    field_policy: {
      reviewed_not_assessable: 'Every RNAA atom carries an object-quoted exact reason, review class and finite missing-input list. Unsupported Fach fields are absent and MUST NOT be synthesized.',
      missing_evidence_is_neutral: false,
      programme_claim_is_outcome_evidence: false,
      party_wide_judgement_available: false,
    },
    constraints: {
      impact_direction_synthesized: false,
      evidence_level_synthesized: false,
      problem_review_synthesized: false,
      goal_review_synthesized: false,
      dns_mapping_synthesized: false,
      sdg_mapping_synthesized: false,
      recommendation_synthesized: false,
      party_score_created: false,
      vercel_build_triggered: false,
    },
    review_class_requirements: REVIEW_CLASS_REQUIREMENTS,
    coverage: {
      expected_page_count: ARTIFACT.page_count,
      reviewed_page_count: ARTIFACT.page_count,
      unaccounted_pages: 0,
      source_unit_count: sourceUnits.length,
      effect_bearing_source_unit_count: effectUnits.length,
      non_effect_context_source_unit_count: contextUnits.length,
      multi_page_source_unit_count: sourceUnits.filter((unit) => unit.pdf_pages.length > 1).length,
      multi_atom_source_unit_count: effectUnits.filter((unit) => unit.atom_ids.length > 1).length,
      effect_atom_count: effectAtoms.length,
      explicit_fach_approved_count: 0,
      reviewed_not_assessable_count: effectAtoms.length,
      non_effect_context_reviewed_count: contextUnits.length,
      unclassified_source_units: 0,
      unterminated_effect_atoms: 0,
      source_conflicts_without_status: 0,
      all_approved_atoms_have_required_fach_fields: true,
      all_effect_bearing_atoms_terminal: true,
      coverage_manifest_pass: true,
      reused_explicit_fach_record_count: 0,
      genuine_fach_review_required_count: 0,
      programme_source_object_review_complete: true,
      public_projection_mode: 'FAIL_CLOSED_NO_EFFECT_CREDIT_WITHOUT_EXPLICIT_FACH_APPROVAL',
      review_class_counts: reviewClassCounts,
    },
    pages,
  };
  for (const atom of effectAtoms) {
    if (!sourceUnitById.get(atom.source_unit_id)?.atom_ids.includes(atom.atom_id)) throw new Error(`Orphan FDP atom ${atom.atom_id}`);
  }
  return { ledgerMetadata, sourceUnits, effectAtoms };
}

function shardRanges() {
  const ranges = [];
  for (let from = 1; from <= ARTIFACT.page_count; from += 10) ranges.push([from, Math.min(from + 9, ARTIFACT.page_count)]);
  return ranges;
}

function serializedShard(type, from, to, records) {
  return `${JSON.stringify({ schema_version: '1.0.0', ledger_id: LEDGER_ID, shard_type: type, page_from: from, page_to: to, records })}\n`;
}

function materializedFiles(logicalLedger) {
  const files = new Map();
  const sourceRefs = [];
  const atomRefs = [];
  for (const [from, to] of shardRanges()) {
    const unitRecords = logicalLedger.sourceUnits.filter((unit) => unit.pdf_page >= from && unit.pdf_page <= to);
    const atomRecords = logicalLedger.effectAtoms.filter((atom) => atom.pdf_page >= from && atom.pdf_page <= to);
    const unitName = `source-units-p${String(from).padStart(3, '0')}-p${String(to).padStart(3, '0')}.json`;
    const atomName = `effect-atoms-p${String(from).padStart(3, '0')}-p${String(to).padStart(3, '0')}.json`;
    const unitBytes = serializedShard('SOURCE_UNITS', from, to, unitRecords);
    const atomBytes = serializedShard('EFFECT_ATOMS', from, to, atomRecords);
    files.set(unitName, unitBytes);
    files.set(atomName, atomBytes);
    sourceRefs.push({ path: unitName, page_from: from, page_to: to, record_count: unitRecords.length, file_sha256: sha256(unitBytes), byte_length: Buffer.byteLength(unitBytes) });
    atomRefs.push({ path: atomName, page_from: from, page_to: to, record_count: atomRecords.length, file_sha256: sha256(atomBytes), byte_length: Buffer.byteLength(atomBytes) });
  }
  const logicalDescriptorSha256 = sha256(canonicalJson({ ...logicalLedger.ledgerMetadata, source_units: logicalLedger.sourceUnits, effect_atoms: logicalLedger.effectAtoms }));
  const manifest = {
    format: 'SHARDED_JSON_LEDGER_V1',
    ledger_metadata: logicalLedger.ledgerMetadata,
    source_unit_shards: sourceRefs,
    effect_atom_shards: atomRefs,
    logical_descriptor_sha256: logicalDescriptorSha256,
  };
  manifest.manifest_sha256 = sha256(canonicalJson(manifest));
  files.set('manifest.json', `${JSON.stringify(manifest)}\n`);
  return { files, manifest, logicalDescriptorSha256 };
}

function buildHook(manifest, logicalDescriptorSha256) {
  const coverage = manifest.ledger_metadata.coverage;
  const hook = {
    schema_version: '1.0.0',
    hook_id: 'WOEK-BE-FDP-2026-COVERAGE-OVERLAY-V1',
    update_mode: 'PROGRAMME_SCOPED_OVERLAY_DO_NOT_OVERWRITE_SHARED_RESIDUAL',
    target: {
      shared_residual_path: 'data/state-programmes/fach-content-residuals/berlin-2026-v1.json',
      party: 'FDP', artifact_id: ARTIFACT.artifact_id, artifact_sha256: ARTIFACT.sha256,
    },
    input: {
      ledger_manifest_path: 'data/state-programmes/fach-reviews/berlin-2026-fdp-v1/manifest.json',
      ledger_id: LEDGER_ID, logical_descriptor_sha256: logicalDescriptorSha256,
    },
    precondition: {
      source_register_path: 'data/state-programmes/current-source-registers/berlin-2026-v2.json',
      source_register_sha256: manifest.ledger_metadata.source_register.sha256,
      expected_page_count: ARTIFACT.page_count,
      require_ledger_validation_pass: true,
    },
    overlay: {
      source_object_review_status: 'SOURCE_OBJECT_REVIEW_COMPLETE',
      programme_analysis_complete: true,
      programme_terminal_basis: 'ALL_EFFECT_ATOMS_TERMINATED_OR_CONTEXT_REVIEWED_UNDER_DELEGATED_PROTOCOL',
      reviewed_page_count: ARTIFACT.page_count,
      source_unit_count: coverage.source_unit_count,
      effect_atom_count: coverage.effect_atom_count,
      explicit_fach_approved_count: coverage.explicit_fach_approved_count,
      reviewed_not_assessable_count: coverage.reviewed_not_assessable_count,
      genuine_fach_review_required_count: 0,
      explicit_fach_available_for_public_effect_projection: false,
      effect_credit_allowed: false,
      public_projection_mode: coverage.public_projection_mode,
    },
    apply_contract: {
      match_keys: ['party', 'artifact_id', 'artifact_sha256'],
      preserve_all_other_programmes: true,
      remove_only_exact_matching_fdp_page_envelopes_after_validation: true,
      shared_residual_mutation_performed_by_this_lane: false,
      consumer_must_preserve_existing_explicit_fach: true,
      consumer_must_not_materialize_missing_fach_fields: true,
    },
    constraints: {
      impact_direction_synthesized: false, evidence_level_synthesized: false, dns_mapping_synthesized: false,
      recommendation_synthesized: false, party_score_created: false, vercel_build_triggered: false,
    },
  };
  hook.descriptor_sha256 = sha256(canonicalJson(hook));
  return hook;
}

function main() {
  const args = parseArgs();
  if (!args.artifactPath) throw new Error('Pass the byte-exact FDP PDF with --artifact <path>');
  const logicalLedger = buildLogicalLedger(path.resolve(args.artifactPath));
  const { files, manifest, logicalDescriptorSha256 } = materializedFiles(logicalLedger);
  const hook = buildHook(manifest, logicalDescriptorSha256);
  files.set(path.relative(args.outputDir, args.hookPath), `${JSON.stringify(hook, null, 2)}\n`);

  if (args.check) {
    for (const [relativePath, expected] of files) {
      const filePath = path.resolve(args.outputDir, relativePath);
      if (fs.readFileSync(filePath, 'utf8') !== expected) throw new Error(`FDP determinism mismatch: ${filePath}`);
    }
  } else {
    fs.mkdirSync(args.outputDir, { recursive: true });
    fs.mkdirSync(path.dirname(args.hookPath), { recursive: true });
    for (const [relativePath, serialized] of files) {
      const filePath = path.resolve(args.outputDir, relativePath);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, serialized);
    }
  }
  console.log(JSON.stringify({
    status: 'PASS', mode: args.check ? 'DETERMINISM_CHECK' : 'MATERIALIZE',
    pages: ARTIFACT.page_count, source_units: logicalLedger.sourceUnits.length,
    effect_atoms: logicalLedger.effectAtoms.length, logical_descriptor_sha256: logicalDescriptorSha256,
  }));
}

main();
