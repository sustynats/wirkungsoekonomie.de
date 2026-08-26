#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const ledgerPath = resolve(root, "data/state-programmes/fach-reviews/berlin-2026-bsw-v1.json");
const residualPath = resolve(root, "data/state-programmes/fach-content-residuals/berlin-2026-v2.json");
const ledgerBytes = readFileSync(ledgerPath);
const ledger = JSON.parse(ledgerBytes.toString("utf8"));
const residual = JSON.parse(readFileSync(residualPath, "utf8"));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const expectedProvenance = {
  approval_basis: "DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26",
  approval_authority: "PROJECT_OWNER_DELEGATED_PROTOCOL",
  review_mode: "SOURCE_BOUND_OBJECT_LEVEL",
  human_individual_record_review_claimed: false,
};

assert.equal(ledger.schema_version, "woek-programme-fach-decision-2026-08-26");
assert.equal(ledger.ledger_id, "BE-BSW-FULL-PROGRAMME-FACH-LEDGER-2026-V1");
assert.equal(ledger.party, "BSW");
assert.equal(ledger.artifact.artifact_id, "BE-AGH-2026-BSW-WAHLPROGRAMM");
assert.equal(ledger.artifact.artifact_sha256, "fd6fe2b9fbb69fc5a34451989c2a75feb14e893c172a20d7840bbe94f2161675");
assert.equal(ledger.artifact.byte_length, 757572);
assert.equal(ledger.artifact.page_count, 66);
assert.deepEqual(ledger.required_provenance, expectedProvenance);

assert.equal(ledger.protected_terminal_stock.length, 3);
assert.deepEqual(ledger.protected_terminal_stock.map((stock) => stock.source_range), [
  "PDF pages 1-5", "PDF pages 6-8", "PDF pages 9-13",
]);
assert.ok(ledger.protected_terminal_stock.every((stock) => stock.preservation_rule === "SET_WISE_REFERENCE_ONLY_NO_REINTERPRETATION"));
assert.equal(ledger.protected_terminal_stock.reduce((sum, stock) => sum + stock.accepted_source_objects, 0), 56);
assert.equal(ledger.protected_terminal_stock.reduce((sum, stock) => sum + stock.normalized_explicit_fach_approved, 0), 42);
for (const stock of ledger.protected_terminal_stock) {
  assert.equal(stock.accepted_terminal_records.length, stock.accepted_source_objects, `${stock.source_range}: protected record enumeration`);
  assert.equal(stock.accepted_terminal_records.filter((record) => record.terminal_status === "EXPLICIT_FACH_APPROVED").length, stock.normalized_explicit_fach_approved);
  assert.equal(new Set(stock.accepted_terminal_records.map((record) => record.record_id ?? record.ordinal)).size, stock.accepted_source_objects);
}

assert.equal(ledger.all_physical_page_coverage.length, 66);
assert.deepEqual(ledger.all_physical_page_coverage.map((page) => page.pdf_page), Array.from({ length: 66 }, (_, index) => index + 1));
assert.ok(ledger.all_physical_page_coverage.slice(0, 13).every((page) => page.coverage_mode === "PROTECTED_TERMINAL_SET_REFERENCE" && page.terminal_status === "PASS"));
assert.ok(ledger.all_physical_page_coverage.slice(13).every((page) => page.coverage_mode === "DETERMINISTIC_LOCAL_SOURCE_UNIT_LEDGER" && page.terminal_status === "PASS"));

assert.equal(ledger.page_coverage.length, 53);
assert.deepEqual(ledger.page_coverage.map((page) => page.pdf_page), Array.from({ length: 53 }, (_, index) => index + 14));
assert.equal(ledger.source_units.length, 470);
assert.equal(new Set(ledger.source_units.map((unit) => unit.source_unit_id)).size, 470);
assert.equal(ledger.effect_atoms.length, 896);
assert.equal(new Set(ledger.effect_atoms.map((atom) => atom.atom_id)).size, 896);
assert.equal(ledger.records.length, 1080);
assert.equal(new Set(ledger.records.map((record) => record.record_id)).size, 1080);

const sourceUnitById = new Map(ledger.source_units.map((unit) => [unit.source_unit_id, unit]));
const contextRecords = ledger.records.filter((record) => record.source_unit_class === "NON_EFFECT_CONTEXT");
assert.equal(contextRecords.length, 184);
assert.deepEqual(
  new Set(ledger.records.map((record) => record.record_id)),
  new Set([...contextRecords.map((record) => record.source_unit_id), ...ledger.effect_atoms.map((atom) => atom.atom_id)]),
);

for (const unit of ledger.source_units) {
  assert.ok(unit.pdf_page >= 14 && unit.pdf_page <= 66, `${unit.source_unit_id}: page outside delegated scope`);
  assert.equal(unit.artifact_id, ledger.artifact.artifact_id);
  assert.equal(unit.artifact_sha256, ledger.artifact.artifact_sha256);
  assert.match(unit.source_text_sha256, /^[a-f0-9]{64}$/);
  assert.ok(unit.source_text_length > 0);
  assert.ok(unit.source_unit_id.endsWith(unit.source_text_sha256.slice(0, 12)));
  assert.equal(unit.atom_count, unit.atom_ids.length);
  assert.equal(unit.reviewed_or_consumed, true);
  if (unit.effect_bearing) {
    assert.equal(unit.source_unit_class, "EFFECT_BEARING");
    assert.equal(unit.terminal_status, null, `${unit.source_unit_id}: terminal status belongs to atoms`);
    assert.ok(unit.atom_count >= 1, `${unit.source_unit_id}: effect unit has no atom`);
    assert.ok(unit.atom_ids.every((atomId) => ledger.effect_atoms.some((atom) => atom.atom_id === atomId && atom.source_unit_id === unit.source_unit_id)));
  } else {
    assert.equal(unit.source_unit_class, "NON_EFFECT_CONTEXT");
    assert.equal(unit.atom_count, 0);
    assert.deepEqual(unit.atom_ids, []);
    assert.equal(unit.terminal_status, "NON_EFFECT_CONTEXT_REVIEWED");
    assert.ok(unit.exact_reason.trim().length >= 120);
  }
}

for (const locator of ["14:5", "14:9", "15:8", "16:5", "17:4", "19:1", "22:2", "27:3", "40:14", "66:8"]) {
  const [pdfPage, sourceUnitOrdinal] = locator.split(":").map(Number);
  const unit = ledger.source_units.find((candidate) => candidate.pdf_page === pdfPage && candidate.source_unit_ordinal === sourceUnitOrdinal);
  assert.ok(unit, `Known multi-action source unit ${locator} missing`);
  assert.ok(unit.atom_count > 1, `Known multi-action source unit ${locator} collapsed to one atom`);
}
assert.ok(ledger.source_units.filter((unit) => unit.atom_count > 1).length >= 200, "Multi-action paragraph atomization unexpectedly collapsed");

const forbiddenGenericReasons = [/weitere prüfung erforderlich/i, /analyse unvollständig/i, /tbd/i, /todo/i];
const effectReasons = [];
const effectReasonCodes = new Set();
for (const record of ledger.effect_atoms) {
  assert.ok(record.pdf_page >= 14 && record.pdf_page <= 66, `${record.record_id}: page outside delegated scope`);
  assert.equal(record.artifact_id, ledger.artifact.artifact_id);
  assert.equal(record.artifact_sha256, ledger.artifact.artifact_sha256);
  assert.ok(sourceUnitById.has(record.source_unit_id), `${record.record_id}: orphan atom`);
  assert.match(record.source_locator, new RegExp(`physical PDF page ${record.pdf_page} of 66`));
  assert.match(record.atom_text_sha256, /^[a-f0-9]{64}$/);
  assert.ok(record.atom_text_length > 0);
  assert.equal(record.record_id, record.atom_id);
  assert.ok(record.atom_id.endsWith(record.atom_text_sha256.slice(0, 12)));
  assert.match(record.atom_id, /^BE-BSW-P\d{2}-U\d{2}-A\d{2}-[a-f0-9]{12}$/);
  assert.ok(record.source_excerpt.trim().length > 0);
  assert.ok(record.source_refs.includes(ledger.artifact.artifact_url));
  assert.ok(record.source_refs.includes(record.source_locator));
  for (const [key, value] of Object.entries(expectedProvenance)) assert.equal(record[key], value, `${record.record_id}: ${key}`);
  assert.equal(record.reviewed_or_consumed, true);
  assert.equal(record.source_unit_class, "EFFECT_BEARING");
  assert.equal(record.effect_bearing, true);
  assert.equal(record.terminal_status, "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON");
  assert.ok(record.policy_action.trim().length > 0);
  assert.ok(record.exact_reason_code.trim().length > 0);
  assert.ok(record.reviewed_exact_missing_fields.length >= 5, `${record.record_id}: missing-field decision is not finite`);
  assert.ok(record.exact_reason.trim().length >= 120, `${record.record_id}: exact reason is not finite/specific enough`);
  assert.match(record.exact_reason, new RegExp(`Atom ${record.pdf_page}:${record.source_unit_ordinal}:${record.atom_ordinal}`));
  assert.match(record.classification_rationale, /satz-\/teilsatzgebundener Claim/);
  for (const pattern of forbiddenGenericReasons) assert.doesNotMatch(record.exact_reason, pattern, `${record.record_id}: generic blocker`);
  effectReasons.push(record.exact_reason);
  effectReasonCodes.add(record.exact_reason_code);
  for (const field of [
    "affected_group_or_system", "baseline_or_reference_state", "mechanism", "potential_state_change",
    "impact_direction", "evidence_level", "competence_and_system_boundary", "time_horizon", "materiality",
    "uncertainty", "resilience_lockin_reversibility", "noncompensation_applicable", "noncompensation_reason",
  ]) assert.equal(record[field], null, `${record.record_id}: unsupported Fach field ${field}`);
  assert.equal(record.dns_mapping, "NOT_AVAILABLE");
  assert.equal(record.recommendation, "NOT_AVAILABLE");
  assert.deepEqual(record.sdg_mapping, []);
  assert.deepEqual(record.sdg_plus_mapping, []);
  assert.ok(!("GENUINE_FACH_REVIEW_REQUIRED" === record.terminal_status));
}
assert.equal(new Set(effectReasons).size, effectReasons.length, "Effect-atom exact reasons must be object-specific, not blanket duplicates");
assert.equal(effectReasonCodes.size, 16, "Expected all reviewed subject-specific missing-field profiles");

for (const page of ledger.page_coverage) {
  const units = ledger.source_units.filter((unit) => unit.pdf_page === page.pdf_page);
  const atoms = ledger.effect_atoms.filter((atom) => atom.pdf_page === page.pdf_page);
  assert.equal(units.length, page.source_unit_count, `page ${page.pdf_page}: source unit count`);
  assert.equal(units.filter((unit) => !unit.effect_bearing).length, page.non_effect_context_units);
  assert.equal(units.filter((unit) => unit.effect_bearing).length, page.effect_bearing_source_units);
  assert.equal(atoms.length, page.effect_bearing_atoms);
  assert.equal(page.reviewed_not_assessable, page.effect_bearing_atoms);
  assert.equal(page.explicit_fach_approved, 0);
  assert.equal(page.open_atoms, 0);
  assert.equal(page.page_coverage_pass, true);
  assert.deepEqual(page.source_unit_hashes, units.map((unit) => unit.source_text_sha256));
  assert.deepEqual(page.atom_ids, atoms.map((atom) => atom.atom_id));
}

const summary = ledger.programme_summary;
assert.equal(summary.expected_pages, 66);
assert.equal(summary.reviewed_pages, 66);
assert.equal(summary.unaccounted_pages, 0);
assert.equal(summary.newly_segmented_source_units, 470);
assert.equal(summary.newly_non_effect_context_units, 184);
assert.equal(summary.newly_effect_bearing_source_units, 286);
assert.equal(summary.newly_effect_bearing_atoms, 896);
assert.equal(summary.newly_reviewed_not_assessable, 896);
assert.equal(summary.total_accounted_source_objects, 1136);
assert.equal(summary.total_explicit_fach_approved, 42);
assert.equal(summary.total_reviewed_not_assessable_or_reclassified, 908);
assert.equal(summary.total_non_effect_context_or_non_counting_parent, 186);
assert.equal(summary.unclassified_source_units, 0);
assert.equal(summary.unterminated_effect_atoms, 0);
assert.equal(summary.programme_analysis_complete, true);
for (const gate of [
  "all_pages_accounted_for", "all_source_units_classified", "all_effect_bearing_atoms_terminal", "all_effect_bearing_units_have_terminal_fach_status",
  "no_silent_omissions", "no_generic_placeholder_as_approval", "all_approved_atoms_have_required_fach_fields",
]) assert.equal(summary[gate], true, `programme gate ${gate}`);
assert.equal(summary.source_fidelity, "PASS");
assert.equal(summary.coverage_manifest, "COMPLETE");

assert.equal(residual.matrix_id, "BE-FACH-CONTENT-RESIDUAL-2026-V2");
assert.equal(residual.status, "FINITE_RESIDUAL_MATERIALIZED_4_OF_12_PROGRAMMES_TERMINAL");
const ledgerPin = residual.source_pins.find((pin) => pin.path?.endsWith("berlin-2026-bsw-v1.json"));
assert.ok(ledgerPin, "Residual matrix does not pin the BSW ledger");
assert.equal(ledgerPin.sha256, sha256(ledgerBytes), "Residual matrix BSW ledger hash drifted");
const bsw = residual.programmes.find((programme) => programme.party === "BSW");
assert.ok(bsw);
assert.equal(bsw.artifact_sha256, ledger.artifact.artifact_sha256);
assert.equal(bsw.expected_pages, 66);
assert.equal(bsw.reviewed_pages, 66);
assert.equal(bsw.unaccounted_pages, 0);
assert.equal(bsw.terminal_source_objects, 1136);
assert.equal(bsw.genuine_fach_review_required, 0);
assert.equal(bsw.programme_analysis_complete, true);
assert.equal(bsw.coverage_manifest_pass, true);

const terminalProgrammes = residual.programmes.filter((programme) => programme.programme_analysis_complete);
assert.deepEqual(terminalProgrammes.map((programme) => programme.party).sort(), ["BSW", "DKP", "Die PARTEI", "SGP"].sort());
assert.equal(residual.summary.verified_final_programmes, 12);
assert.equal(residual.summary.programme_analysis_complete, 4);
assert.equal(residual.summary.programme_analysis_open, 8);
assert.equal(residual.programmes.reduce((sum, programme) => sum + programme.genuine_fach_review_required, 0), 1215);
assert.equal(residual.summary.remaining_genuine_fach_review_required, 1215);
assert.equal(residual.summary.silent_omissions, 0);
assert.deepEqual(residual.execution_order_remaining, [
  "SPD", "CDU", "FDP", "Volt", "Tierschutzpartei", "BÜNDNIS 90/DIE GRÜNEN", "AfD", "Die Linke",
]);
assert.equal(residual.release_policy.no_new_vercel_build, true);
assert.equal(residual.release_policy.parliament_release_approval, "NOT_GRANTED");

const artifactFlagIndex = process.argv.indexOf("--artifact");
if (artifactFlagIndex >= 0) {
  const artifactPath = process.argv[artifactFlagIndex + 1];
  assert.ok(artifactPath, "--artifact requires a path");
  execFileSync(process.execPath, [
    resolve(root, "scripts/quality/materialize-berlin-bsw-full-programme.mjs"),
    "--artifact", resolve(artifactPath),
    "--output", ledgerPath,
    "--check",
  ], { stdio: "inherit" });
}

console.log(JSON.stringify({
  status: "PASS",
  ledger: ledger.ledger_id,
  artifactSha256: ledger.artifact.artifact_sha256,
  reviewedPages: summary.reviewed_pages,
  newlySegmentedSourceUnits: summary.newly_segmented_source_units,
  newlyEffectBearingAtoms: summary.newly_effect_bearing_atoms,
  newlyReviewedNotAssessable: summary.newly_reviewed_not_assessable,
  newlyNonEffectContext: summary.newly_non_effect_context_units,
  protectedTerminalSourceObjects: summary.protected_terminal_source_objects,
  totalAccountedSourceObjects: summary.total_accounted_source_objects,
  programmeAnalysisComplete: summary.programme_analysis_complete,
  berlinTerminalProgrammes: residual.summary.programme_analysis_complete,
  berlinRemainingObjects: residual.summary.remaining_genuine_fach_review_required,
}));
