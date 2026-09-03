import assert from 'node:assert/strict';
import test from 'node:test';

import {
  loadBerlinGrueneReviewBundle,
  validateBerlinGrueneReviewBundle,
} from '../scripts/quality/check-berlin-gruene-fach-review.mjs';

test('Berlin GRUENE full-programme ledger closes every source object on all 256 physical pages', () => {
  assert.deepEqual(validateBerlinGrueneReviewBundle(loadBerlinGrueneReviewBundle()), {
    artifact_sha256: 'db07990ef613bf239691980873dbfaff3df98e07e8a27c5e05edc2363d9dade2',
    reviewed_pages: 256,
    source_units: 354,
    effect_bearing_source_units: 327,
    non_effect_context_source_units: 27,
    multi_page_source_units: 143,
    multi_atom_source_units: 324,
    effect_atoms: 4119,
    explicit_fach_approved: 0,
    reviewed_not_assessable: 4119,
    unterminated_effect_atoms: 0,
    logical_descriptor_sha256: 'b1e15d8a65cdeb099abdf28bc47ecbdf14e3bdc1bfea59eb9a75bc78979f98b8',
    hook_descriptor_sha256: '0e358c9a3084fd03909e99666a70e501531ecebcb4b6d8239b4e9ddf34ca1fdd',
    gate: 'PASS',
  });
});

test('Berlin GRUENE ledger rejects a synthetic direction on an RNAA atom', () => {
  const bundle = loadBerlinGrueneReviewBundle();
  bundle.effectAtoms[0].impact_direction = 'POSITIVE';
  assert.throws(
    () => validateBerlinGrueneReviewBundle(bundle, { verifyLogicalDescriptor: false }),
    /forbidden synthesized impact_direction/,
  );
});

test('Berlin GRUENE ledger rejects a lost child binding from a multi-action source unit', () => {
  const bundle = loadBerlinGrueneReviewBundle();
  const unit = bundle.sourceUnits.find((candidate) => candidate.atom_ids.length > 1);
  unit.atom_ids = unit.atom_ids.slice(1);
  assert.throws(
    () => validateBerlinGrueneReviewBundle(bundle, { verifyLogicalDescriptor: false }),
    /lost child binding|falsy value/,
  );
});

test('Berlin GRUENE ledger rejects hiding a dark Zukunftsprojekte box as context', () => {
  const bundle = loadBerlinGrueneReviewBundle();
  for (const unit of bundle.sourceUnits.filter((candidate) => candidate.pdf_pages.includes(42))) {
    unit.effect_bearing = false;
    unit.classification = 'NON_EFFECT_CONTEXT';
    unit.terminal_status = 'NON_EFFECT_CONTEXT_REVIEWED';
    unit.atom_ids = [];
    unit.exact_reason = `${unit.source_unit_id} mutation`;
  }
  assert.throws(
    () => validateBerlinGrueneReviewBundle(bundle, { verifyLogicalDescriptor: false }),
    /Zukunftsprojekte box page lost effect-bearing source|lost child binding|325 !== 327/,
  );
});
