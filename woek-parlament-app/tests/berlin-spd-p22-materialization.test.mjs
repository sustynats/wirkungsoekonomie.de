import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const residual = JSON.parse(readFileSync(
  'data/state-programmes/fach-content-residuals/berlin-2026-v3.json',
  'utf8',
));
const handoff = JSON.parse(readFileSync(
  'data/state-programmes/fach-reviews/berlin-2026-spd-p22-explicit-v1.json',
  'utf8',
));

test('Berlin SPD P22 stays canonical-source-bound under the subsequent P23/P24 overlays', () => {
  const spd = residual.programmes.find((programme) => programme.party === 'SPD');
  assert.ok(spd);
  assert.equal(spd.programme_analysis_complete, false);
  const protectedRecords = spd.terminal_objects.filter((item) => Number(item.object_id.match(/-SU-(\d+)/)?.[1]) <= 265);
  assert.equal(protectedRecords.length, 36);
  const protectedCounts = Object.fromEntries(['EXPLICIT_FACH_APPROVED', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'NON_EFFECT_CONTEXT_REVIEWED', 'SOURCE_UNIT_RECLASSIFIED_VERSIONED'].map((state) => [state, protectedRecords.filter((item) => item.fach_state === state).length]));
  assert.deepEqual(protectedCounts, {
    EXPLICIT_FACH_APPROVED: 16,
    REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 2,
    NON_EFFECT_CONTEXT_REVIEWED: 14,
    SOURCE_UNIT_RECLASSIFIED_VERSIONED: 4,
  });
  assert.equal(spd.remaining_review_envelope_count, 42);
  assert.deepEqual(
    spd.remaining_review_envelopes.map((item) => Number(item.source_locator.match(/PDF page (\d+)/)?.[1])),
    Array.from({ length: 42 }, (_, index) => index + 25),
  );
  assert.deepEqual(spd.protected_fach_scope.next_unreviewed_source_order_frontier, {
    physical_page: 25,
    source_unit_from: 'BE-SPD-2026-SU-0291',
  });
});

test('the eight corrected canonical bindings cannot regress to stale P22 source text', () => {
  const spd = residual.programmes.find((programme) => programme.party === 'SPD');
  const expectedHashes = new Map([
    ['BE-SPD-2026-SU-0248', '8c1db47c430eeb7d75b6036d2e5b627a5fb76f2d98ff1fd87581e15d2d7fa24f'],
    ['BE-SPD-2026-SU-0249', '10a6fd8fc5d67cdb2b35ca28152c496b4eb9c511940cd93a8bea2489de417090'],
    ['BE-SPD-2026-SU-0250', '95092915b5762d8d5fd222c87ca6dc2d262a0ffea434e8624481ba6344971ef3'],
    ['BE-SPD-2026-SU-0251', '41e0efb8d505ac48c7d2afa72c2827b8ed8bae5ffa9639a54998215650d6ed1e'],
    ['BE-SPD-2026-SU-0253', 'cda97d29abb17417afc4ec796b4366649eccaae8ebff45a2b4a3e93d28af2616'],
    ['BE-SPD-2026-SU-0258', '709124eb06bd224022e1d4013d352efdea3410395ac14bfad62a31796b40849a'],
    ['BE-SPD-2026-SU-0262', '1dc490cb6887167e90e239338b4d566cf0415be09c023dd11ac6c95bc497e10e'],
    ['BE-SPD-2026-SU-0265', 'd34e452e5f6a5dbb4dc2f9878aac0bafc242063dcb5670abb31c1fdc50a252a8'],
  ]);
  for (const [id, hash] of expectedHashes) {
    const record = spd.terminal_objects.find((item) => item.object_id === id);
    assert.equal(record?.source_text_sha256, hash, `${id}: corrected source binding drift`);
    assert.equal(record?.fach_handoff, 'https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5483568051');
  }
  assert.equal(
    spd.terminal_objects.find((item) => item.object_id === 'BE-SPD-2026-SU-0249').fach_state,
    'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
  );
});

test('deterministic P22 children retain bidirectional version lineage and exact hashes', () => {
  const spd = residual.programmes.find((programme) => programme.party === 'SPD');
  const children = spd.terminal_objects.filter(
    (item) => item.object_kind === 'DETERMINISTIC_SEGMENTATION_REPLACEMENT' && Number(item.object_id.match(/-SU-(\d+)/)?.[1]) <= 265,
  );
  assert.equal(children.length, 5);
  for (const child of children) {
    assert.ok(child.object_id.endsWith(child.source_text_sha256.slice(0, 12)));
    for (const parentId of child.parent_object_ids) {
      const parent = spd.terminal_objects.find((item) => item.object_id === parentId);
      assert.equal(parent?.fach_state, 'SOURCE_UNIT_RECLASSIFIED_VERSIONED');
      assert.equal(parent?.counts_as_effect_object, false);
      assert.ok(parent?.replacement_record_ids.includes(child.object_id));
    }
  }
  assert.equal(
    children.find((item) => item.object_id === 'BE-SPD-2026-SU-0265-C01-36c9f3353105').counts_as_effect_object,
    false,
  );
  assert.equal(
    children.find((item) => item.object_id === 'BE-SPD-2026-SU-0265-C02-f6f05f020690').fach_state,
    'EXPLICIT_FACH_APPROVED',
  );
  assert.equal(handoff.coverage.exact_open_child_object_count, 0);
});
