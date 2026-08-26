import assert from 'node:assert/strict';
import test from 'node:test';

import {
  loadBerlinAfdReviewBundle,
  validateBerlinAfdReviewBundle,
} from '../scripts/quality/check-berlin-afd-fach-review.mjs';

test('Berlin AfD full-programme ledger closes all 99 pages and source-object terminals', () => {
  const summary = validateBerlinAfdReviewBundle(loadBerlinAfdReviewBundle());
  assert.deepEqual(summary, {
    artifact_sha256: '949b0c7cc193801c48fa5c859cb0088fae6ed8cb304d47c91bd5eb441af6bd35',
    reviewed_pages: 99,
    source_units: 128,
    effect_bearing_source_units: 36,
    non_effect_context_source_units: 92,
    multi_atom_source_units: 32,
    cross_page_source_units: 23,
    list_source_units: 13,
    list_effect_atoms: 205,
    effect_atoms: 865,
    explicit_fach_approved: 0,
    reviewed_not_assessable: 865,
    unterminated_effect_atoms: 0,
    logical_descriptor_sha256: '2a8f3fb7f7fe1b1ad77a23e60b0c0fa7cc29206d9c1134f25e4881d3c6dcf444',
    hook_descriptor_sha256: '8f4167956382895544e1397218eb807c8054affd3b63d8bd87c1bd099d6e220c',
    gate: 'PASS',
  });
});

test('Berlin AfD ledger rejects synthesized impact direction', () => {
  const bundle = loadBerlinAfdReviewBundle();
  bundle.effectAtoms[0].impact_direction = 'POSITIVE';
  assert.throws(
    () => validateBerlinAfdReviewBundle(bundle, { verifyLogicalDescriptor: false }),
    /forbidden synthesized impact_direction/,
  );
});

test('Berlin AfD ledger rejects a source-unit atom binding gap', () => {
  const bundle = loadBerlinAfdReviewBundle();
  const effectUnit = bundle.sourceUnits.find((unit) => unit.effect_bearing);
  effectUnit.atom_ids = effectUnit.atom_ids.slice(1);
  assert.throws(
    () => validateBerlinAfdReviewBundle(bundle, { verifyLogicalDescriptor: false }),
    /source-unit atom binding missing|effect unit has no atoms/,
  );
});

test('Berlin AfD ledger rejects a rewritten list-measure source binding', () => {
  const bundle = loadBerlinAfdReviewBundle();
  const listAtom = bundle.effectAtoms.find((atom) => atom.source_list_item);
  listAtom.source_sentence_normalized = `${listAtom.source_sentence_normalized} rewritten`;
  assert.throws(
    () => validateBerlinAfdReviewBundle(bundle, { verifyLogicalDescriptor: false }),
    /Expected values to be strictly equal/,
  );
});

test('Berlin AfD ledger rejects party-level judgement synthesis', () => {
  const bundle = loadBerlinAfdReviewBundle();
  bundle.effectAtoms[0].party_judgement = 'favourable';
  assert.throws(
    () => validateBerlinAfdReviewBundle(bundle, { verifyLogicalDescriptor: false }),
    /forbidden synthesized party_judgement/,
  );
});
