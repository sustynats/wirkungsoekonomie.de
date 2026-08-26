#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ledgerPath = resolve(
  "data/state-programmes/fach-reviews/berlin-2026-cdu-v1.json",
);
const overlayPath = resolve(
  "data/state-programmes/fach-content-residuals/berlin-2026-cdu-terminal-overlay-v1.json",
);
const ledgerBytes = readFileSync(ledgerPath);
const ledger = JSON.parse(ledgerBytes.toString("utf8"));
const overlay = JSON.parse(readFileSync(overlayPath, "utf8"));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const provenance = {
  approval_basis: "DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26",
  approval_authority: "PROJECT_OWNER_DELEGATED_PROTOCOL",
  review_mode: "SOURCE_BOUND_OBJECT_LEVEL",
  human_individual_record_review_claimed: false,
};

assert.equal(ledger.schema_version, "woek-programme-fach-decision-2026-08-26");
assert.equal(ledger.ledger_id, "BE-CDU-FULL-PROGRAMME-FACH-LEDGER-2026-V1");
assert.equal(ledger.party, "CDU");
assert.equal(ledger.artifact.artifact_id, "BE-AGH-2026-CDU-REGIERUNGSPROGRAMM");
assert.equal(
  ledger.artifact.artifact_sha256,
  "ff27b8efafc426669f76ef71576a7cbce52bdb95fbb0cc2931afa7e11bbed455",
);
assert.equal(ledger.artifact.artifact_bytes_verified_sha256, ledger.artifact.artifact_sha256);
assert.equal(ledger.artifact.byte_length, 1_546_182);
assert.equal(ledger.artifact.page_count, 128);
assert.deepEqual(ledger.required_provenance, provenance);

assert.equal(ledger.all_physical_page_coverage.length, 128);
assert.deepEqual(
  ledger.all_physical_page_coverage.map((page) => page.pdf_page),
  Array.from({ length: 128 }, (_, index) => index + 1),
);
assert.equal(ledger.page_coverage.length, 128);
assert.equal(new Set(ledger.source_units.map((unit) => unit.source_unit_id)).size, ledger.source_units.length);
assert.equal(new Set(ledger.effect_atoms.map((atom) => atom.atom_id)).size, ledger.effect_atoms.length);
assert.equal(new Set(ledger.records.map((record) => record.record_id)).size, ledger.records.length);

const atomReferences = new Map(ledger.effect_atoms.map((atom) => [atom.atom_id, 0]));
for (const unit of ledger.source_units) {
  assert.ok(unit.source_text.trim().length > 0, `${unit.source_unit_id}: empty source unit`);
  assert.equal(unit.source_text_sha256, sha256(unit.source_text));
  assert.equal(unit.atom_count, unit.atom_ids.length);
  if (unit.source_unit_class === "EFFECT_BEARING") {
    assert.ok(unit.atom_ids.length >= 1, `${unit.source_unit_id}: effect unit without atom`);
    assert.equal(unit.context_kind, null);
  } else {
    assert.equal(unit.source_unit_class, "NON_EFFECT_CONTEXT");
    assert.deepEqual(unit.atom_ids, [], `${unit.source_unit_id}: context unit has atoms`);
    assert.ok(unit.context_kind);
  }
  for (const atomId of unit.atom_ids) {
    assert.ok(atomReferences.has(atomId), `${unit.source_unit_id}: missing bound atom ${atomId}`);
    atomReferences.set(atomId, atomReferences.get(atomId) + 1);
  }
}
assert.ok([...atomReferences.values()].every((count) => count === 1), "Every atom must bind to exactly one source unit");

for (const atom of ledger.effect_atoms) {
  assert.equal(atom.atom_text_sha256, sha256(atom.atom_text));
  assert.match(atom.atom_id, /^BE-CDU-P\d{3}-U\d{3}-A\d{2}-[a-f0-9]{12}$/);
  const unit = ledger.source_units.find((candidate) => candidate.source_unit_id === atom.source_unit_id);
  assert.ok(unit, `${atom.atom_id}: source unit missing`);
  assert.ok(unit.atom_ids.includes(atom.atom_id));
}

const rnaaReasons = [];
for (const record of ledger.records) {
  assert.deepEqual(
    {
      approval_basis: record.approval_basis,
      approval_authority: record.approval_authority,
      review_mode: record.review_mode,
      human_individual_record_review_claimed:
        record.human_individual_record_review_claimed,
    },
    provenance,
  );
  assert.equal(record.artifact_sha256, ledger.artifact.artifact_sha256);
  assert.ok(record.source_locator);
  assert.ok(record.source_refs.includes(`sha256:${ledger.artifact.artifact_sha256}`));
  if (record.source_unit_class === "EFFECT_BEARING") {
    assert.equal(record.terminal_status, "REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON");
    assert.ok(record.atom_id);
    assert.ok(record.policy_action.trim().length > 0);
    assert.equal(record.reviewed_exact_missing_fields.length, 1);
    assert.match(record.exact_reason, new RegExp(`PDF ${record.pdf_page}, Unit`));
    assert.match(record.exact_reason, /kleinste source-bound Blocker/);
    assert.doesNotMatch(record.exact_reason, /^Weitere Prüfung erforderlich\.?$/i);
    assert.equal(record.impact_direction, null);
    assert.equal(record.evidence_level, null);
    assert.equal(record.dns_mapping, "NOT_AVAILABLE");
    assert.equal(record.recommendation, "NOT_AVAILABLE");
    assert.deepEqual(record.sdg_mapping, []);
    assert.deepEqual(record.sdg_plus_mapping, []);
    rnaaReasons.push(record.exact_reason);
  } else {
    assert.equal(record.terminal_status, "NON_EFFECT_CONTEXT_REVIEWED");
    assert.equal(record.atom_id, null);
    assert.equal(record.policy_action, null);
  }
}
assert.equal(new Set(rnaaReasons).size, rnaaReasons.length, "RNAA reasons must be object-specific, not blanket duplicates");

for (const page of ledger.page_coverage) {
  const units = ledger.source_units.filter((unit) => unit.pdf_page === page.pdf_page);
  const atoms = ledger.effect_atoms.filter((atom) => atom.pdf_page === page.pdf_page);
  assert.equal(page.source_unit_count, units.length, `page ${page.pdf_page}: unit count`);
  assert.deepEqual(page.source_unit_ids, units.map((unit) => unit.source_unit_id));
  assert.equal(page.effect_atoms, atoms.length, `page ${page.pdf_page}: atom count`);
  assert.equal(page.terminal_effect_atoms, atoms.length);
  assert.equal(page.open_atoms, 0);
  assert.equal(page.page_read_fully, true);
  assert.equal(page.unit_atom_bindings_complete, true);
  assert.equal(page.page_coverage_pass, true);
}

const knownMultiMeasureUnits = [
  "Dazu gehören insbesondere der Abbau unnötiger Dokumentationspflichten",
  "Dazu gehören schnellere Informationswege zwischen Bezirken",
  "durch bessere Beleuchtung, übersichtliche Wegeführungen",
];
for (const anchor of knownMultiMeasureUnits) {
  const unit = ledger.source_units.find((candidate) => candidate.source_text.includes(anchor));
  assert.ok(unit, `Known multi-measure unit missing: ${anchor}`);
  assert.ok(unit.atom_ids.length >= 2, `${unit.source_unit_id}: independent measures were not atomized`);
}

// Guard high-risk grammatical forms that were explicitly reviewed across the
// programme.  These are effect-bearing even though they are not all phrased as
// "wir werden": inverted present tense, normative passive, cross-page
// continuation and current target/effect claims must not silently fall into
// context.
const knownEffectBearingAnchors = [
  "Gleichzeitig prüfen wir die Einrichtung eines zentralen Landesamtes",
  "ist die Strafverfolgung digital organisierter Drogenkriminalität",
  "Wir folgen dem Vorbild Nordrhein-Westfalens",
  "Dazu unterstützen wir bestehende Strukturen und Initiativen",
  "So verkürzen wir Wege, beschleunigen Verfahren",
  "Gleichzeitig gehen wir konsequent gegen unseriöse Vermittler",
  "Gleichzeitig bekennen wir uns klar zur Berliner Kinolandschaft",
];
for (const anchor of knownEffectBearingAnchors) {
  const unit = ledger.source_units.find((candidate) =>
    candidate.source_text.includes(anchor),
  );
  assert.ok(unit, `Known effect-bearing unit missing: ${anchor}`);
  assert.equal(
    unit.source_unit_class,
    "EFFECT_BEARING",
    `${unit.source_unit_id}: reviewed effect-bearing unit was classified as context`,
  );
  assert.ok(unit.atom_ids.length >= 1);
}

const crossPageEffectFragments = [
  "vestments und Risikokapitalinvestitionen verbessern",
  "sicht durch mehr Personal, klare Zuständigkeiten",
  "gungen für klinische Studien, Innovationstransfer",
];
for (const anchor of crossPageEffectFragments) {
  const unit = ledger.source_units.find((candidate) =>
    candidate.source_text.includes(anchor),
  );
  assert.ok(unit, `Cross-page effect fragment missing: ${anchor}`);
  assert.equal(unit.source_unit_class, "EFFECT_BEARING");
  assert.ok(unit.atom_ids.length >= 1);
}

const summary = ledger.programme_summary;
assert.deepEqual(
  {
    total_source_units: summary.total_source_units,
    non_effect_context_units: summary.non_effect_context_units,
    effect_bearing_source_units: summary.effect_bearing_source_units,
    effect_atoms: summary.effect_atoms,
    records: ledger.records.length,
  },
  {
    total_source_units: 2673,
    non_effect_context_units: 1021,
    effect_bearing_source_units: 1652,
    effect_atoms: 2041,
    records: 3062,
  },
  "Pinned CDU bytes must materialize to the reviewed exact cardinalities",
);
assert.equal(summary.expected_pages, 128);
assert.equal(summary.reviewed_pages, 128);
assert.equal(summary.unaccounted_pages, 0);
assert.equal(summary.total_source_units, ledger.source_units.length);
assert.equal(summary.effect_atoms, ledger.effect_atoms.length);
assert.equal(summary.reviewed_not_assessable, ledger.effect_atoms.length);
assert.equal(summary.explicit_fach_approved, 0);
assert.equal(summary.open_atoms, 0);
assert.equal(summary.unclassified_source_units, 0);
assert.equal(summary.unterminated_effect_atoms, 0);
assert.equal(summary.all_unit_atom_bindings_complete, true);
assert.equal(summary.programme_analysis_complete, true);
assert.equal(summary.source_fidelity, "PASS");
assert.equal(summary.coverage_manifest, "COMPLETE");

assert.equal(overlay.overlay_id, "BE-FACH-CONTENT-RESIDUAL-CDU-TERMINAL-2026-V1");
assert.equal(overlay.party, "CDU");
assert.equal(overlay.source_pin.sha256, sha256(ledgerBytes));
assert.equal(overlay.replace_programme_record.expected_pages, 128);
assert.equal(overlay.replace_programme_record.reviewed_pages, 128);
assert.equal(overlay.replace_programme_record.effect_atoms, summary.effect_atoms);
assert.equal(overlay.replace_programme_record.genuine_fach_review_required, 0);
assert.equal(overlay.replace_programme_record.programme_analysis_complete, true);
assert.equal(overlay.expected_delta_when_applied_once.remaining_genuine_fach_review_required, -128);
assert.equal(overlay.release_policy.no_new_vercel_build, true);
assert.equal(overlay.release_policy.parliament_release_approval, "NOT_GRANTED");

const artifactFlag = process.argv.indexOf("--artifact");
if (artifactFlag >= 0) {
  const artifact = process.argv[artifactFlag + 1];
  assert.ok(artifact, "--artifact requires the pinned CDU PDF path");
  execFileSync(
    process.execPath,
    [
      resolve("scripts/quality/materialize-berlin-cdu-full-programme.mjs"),
      "--artifact",
      resolve(artifact),
      "--check",
    ],
    { stdio: "inherit" },
  );
}

console.log(
  JSON.stringify({
    status: "PASS",
    ledger: ledger.ledger_id,
    artifactSha256: ledger.artifact.artifact_sha256,
    reviewedPages: summary.reviewed_pages,
    sourceUnits: summary.total_source_units,
    effectBearingUnits: summary.effect_bearing_source_units,
    effectAtoms: summary.effect_atoms,
    reviewedNotAssessable: summary.reviewed_not_assessable,
    nonEffectContext: summary.non_effect_context_units,
    programmeAnalysisComplete: summary.programme_analysis_complete,
  }),
);
