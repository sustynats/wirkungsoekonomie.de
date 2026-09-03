import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(ROOT, 'woek-parlament-app');
const LEDGER_PATH = path.join(APP, 'data/state-programmes/fach-reviews/berlin-2026-bsw-v1.json');
const OUTPUT_PATH = path.join(APP, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p60-p63-explicit-v1.json');
const sha256 = (value) => createHash('sha256').update(value, 'utf8').digest('hex');
const ledger = JSON.parse(readFileSync(LEDGER_PATH, 'utf8'));

const snapshotSpecs = [
  { pdf_page: 60, issue_comment_id: 5458289664, file: 'berlin-2026-bsw-p60-authoritative-handoff.md' },
  { pdf_page: 61, issue_comment_id: 5458936303, file: 'berlin-2026-bsw-p61-authoritative-handoff.md' },
  { pdf_page: 62, issue_comment_id: 5458947619, file: 'berlin-2026-bsw-p62-authoritative-handoff.md' },
  { pdf_page: 63, issue_comment_id: 5458958905, file: 'berlin-2026-bsw-p63-authoritative-handoff.md' },
  { pdf_pages: [60, 61], issue_comment_id: 5461127780, file: 'berlin-2026-bsw-p60-p61-supplement-authoritative-handoff.md' },
];
const snapshots = snapshotSpecs.map(({ file, ...snapshot }) => {
  const relative = `woek-parlament-app/data/state-programmes/fach-reviews/${file}`;
  return {
    ...snapshot,
    issue: 240,
    issue_comment_url: `https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-${snapshot.issue_comment_id}`,
    path: relative,
    file_sha256: sha256(readFileSync(path.join(ROOT, relative), 'utf8')),
  };
});

const frozenObjects = [
  ...ledger.source_units.filter((item) => item.pdf_page >= 60 && item.pdf_page <= 63 && item.atom_count === 0).map((item) => ({
    object_id: item.source_unit_id,
    object_kind: 'SOURCE_UNIT',
    pdf_page: item.pdf_page,
    source_text_sha256: item.source_text_sha256,
    source_locator: item.source_locator,
    exact: item.source_excerpt,
  })),
  ...ledger.effect_atoms.filter((item) => item.pdf_page >= 60 && item.pdf_page <= 63).map((item) => ({
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
const set = (state, ...ids) => ids.forEach((object_id) => original.set(object_id, {
  object_id,
  authoritative_terminal_fach_state: state,
  counts_as_effect_object: state === 'EXPLICIT_FACH_APPROVED' || state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
  decision_kind: state,
}));

// The authoritative snapshots retain the exact non-effect subtype and reason.
// The executable handoff normalises those subtypes to the established terminal
// NON_EFFECT_CONTEXT_REVIEWED state without changing their zero-count semantics.
set('NON_EFFECT_CONTEXT_REVIEWED', ...sourceObjects.map((item) => item.object_id));

set('EXPLICIT_FACH_APPROVED',
  'BE-BSW-P62-U06-A03-6e7c271987d7',
  'BE-BSW-P62-U06-A04-6c6ff52d2f36',
  'BE-BSW-P62-U08-A04-7a5f5c71525a',
  'BE-BSW-P62-U08-A05-347df71a4f42',
  'BE-BSW-P62-U10-A02-508b4843a227',
  'BE-BSW-P63-U03-A02-86d4ce201792',
  'BE-BSW-P63-U03-A03-a85e5cbeb62f',
  'BE-BSW-P63-U03-A06-361036c542e8',
  'BE-BSW-P63-U05-A03-aa2c531c325e',
  'BE-BSW-P63-U07-A04-c058c0c243e4',
  'BE-BSW-P63-U10-A03-480aaa90e98a');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
  'BE-BSW-P61-U01-A03-d3e039147d4b',
  'BE-BSW-P61-U09-A02-47ba46b910ac',
  'BE-BSW-P62-U04-A05-17a5a4a53b80',
  'BE-BSW-P62-U04-A07-9d5bba59fff2',
  'BE-BSW-P63-U03-A04-418841cfc629',
  'BE-BSW-P63-U07-A02-932fa3244d4a',
  'BE-BSW-P63-U09-A01-0a1c232ebd07',
  'BE-BSW-P63-U09-A03-a49c35b80f07',
  'BE-BSW-P63-U10-A04-efc426c388d8');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED',
  'BE-BSW-P62-U02-A03-d8f51ba03955',
  'BE-BSW-P62-U10-A03-0cca4a571f8d',
  'BE-BSW-P63-U01-A01-2cc3c71a4c3f',
  'BE-BSW-P63-U01-A02-e75b991f5095',
  'BE-BSW-P63-U01-A03-6ba78fd90914');

const exactText = (id) => {
  const source = sourceObjects.find((item) => item.object_id === id);
  if (!source?.source_text) throw new Error(`${id}: exact source text unavailable`);
  return source.source_text;
};
const deterministic = [];
const addRecord = ({ prefix, parents, source_text, state, kind, object_kind = 'DETERMINISTIC_SEGMENTATION_REPLACEMENT', parent_joiner = '', source_span, source_span_basis }) => {
  const hash = sha256(source_text);
  const record = {
    object_id: `${prefix}-${hash.slice(0, 12)}`,
    object_kind,
    parent_object_ids: parents,
    ...(parent_joiner ? { parent_joiner } : {}),
    source_text,
    source_text_sha256: hash,
    source_span,
    source_span_basis,
    terminal_fach_state: state,
    counts_as_effect_object: state === 'EXPLICIT_FACH_APPROVED' || state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
    decision_kind: kind,
  };
  deterministic.push(record);
  return record;
};
const addSlice = (prefix, parent, needle, state, kind) => {
  const text = exactText(parent);
  const start = text.indexOf(needle);
  if (start < 0) throw new Error(`${parent}: slice not found: ${needle}`);
  return addRecord({
    prefix,
    parents: [parent],
    source_text: needle,
    state,
    kind,
    source_span: { start, end: start + needle.length },
    source_span_basis: 'UTF16_CODE_UNIT_OFFSETS_IN_EXACT_PARENT_SOURCE_TEXT',
  });
};
const addJoined = (prefix, parents, joiner, state, kind) => {
  const source_text = parents.map(exactText).join(joiner);
  return addRecord({
    prefix,
    parents,
    parent_joiner: joiner,
    source_text,
    state,
    kind,
    object_kind: 'DETERMINISTIC_CROSS_PAGE_SEMANTIC_REPLACEMENT',
    source_span: { start: 0, end: source_text.length },
    source_span_basis: 'UTF16_CODE_UNIT_OFFSETS_IN_EXACT_JOINED_PARENT_SOURCE_TEXT',
  });
};

addSlice('BE-BSW-P62-U02-A03-C01', 'BE-BSW-P62-U02-A03-d8f51ba03955', 'den öffentlichen Dienst für diese Berufsgruppen attraktiver zu machen', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'PUBLIC_SERVICE_ATTRACTIVENESS_INSTRUMENT_UNSPECIFIED');
addSlice('BE-BSW-P62-U02-A03-C02', 'BE-BSW-P62-U02-A03-d8f51ba03955', 'Ausbildungen zu fördern', 'EXPLICIT_FACH_APPROVED', 'PUBLIC_SERVICE_TRAINING_PROMOTION');
addSlice('BE-BSW-P62-U02-A03-C03', 'BE-BSW-P62-U02-A03-d8f51ba03955', 'die Konkurrenzen zur freien Wirtschaft und der Bundeswehr zu reduzieren', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'PUBLIC_SERVICE_COMPETITION_REDUCTION_INSTRUMENT_UNSPECIFIED');
addJoined('BE-BSW-P62P63-U10U01-M01', ['BE-BSW-P62-U10-A03-0cca4a571f8d', 'BE-BSW-P63-U01-A01-2cc3c71a4c3f'], ' ', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'FAX_RETIREMENT_REPLACEMENT_ARCHITECTURE_UNSPECIFIED');
addJoined('BE-BSW-P63-U01-M01', ['BE-BSW-P63-U01-A02-e75b991f5095', 'BE-BSW-P63-U01-A03-6ba78fd90914'], ' ', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'PALANTIR_VENDOR_REJECTION_PROCUREMENT_DELTA_UNSPECIFIED');

const replacements = new Map();
for (const record of deterministic) for (const parent of record.parent_object_ids) {
  if (!replacements.has(parent)) replacements.set(parent, []);
  replacements.get(parent).push(record.object_id);
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
const counts = [...original.values(), ...deterministic].reduce((acc, item) => {
  const state = normalize(item.authoritative_terminal_fach_state || item.terminal_fach_state);
  acc[state] += 1;
  return acc;
}, { EXPLICIT_FACH_APPROVED: 0, REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON: 0, NON_EFFECT_CONTEXT_REVIEWED: 0, SOURCE_UNIT_RECLASSIFIED_VERSIONED: 0 });
const active = counts.EXPLICIT_FACH_APPROVED + counts.REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON;
if (sourceObjects.length !== 92 || deterministic.length !== 5 || active !== 25 || counts.EXPLICIT_FACH_APPROVED !== 12 || counts.REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON !== 13 || counts.NON_EFFECT_CONTEXT_REVIEWED !== 67 || counts.SOURCE_UNIT_RECLASSIFIED_VERSIONED !== 5) {
  throw new Error(`set-wise count drift ${JSON.stringify({ source: sourceObjects.length, deterministic: deterministic.length, active, counts })}`);
}

const handoff = {
  schema_version: 'woek-explicit-fach-handoff-2.0',
  handoff_id: 'BE-BSW-P60-P63-EXPLICIT-FACH-2026-V1',
  base_main_commit: '434d6df341ec999f9bbdcde1532ab466756bacf1',
  artifact_id: ledger.artifact.artifact_id,
  artifact_sha256: ledger.artifact.artifact_sha256,
  artifact_byte_length: ledger.artifact.byte_length,
  artifact_page_count: ledger.artifact.page_count,
  controller: { issue: 241, issue_comment_id: 5475379459, issue_comment_url: 'https://github.com/sustynats/wirkungsoekonomie.de/issues/241#issuecomment-5475379459' },
  authoritative_markdowns: snapshots,
  source_objects: sourceObjects,
  original_records: [...original.values()],
  deterministic_records: deterministic,
  deterministic_open_children: [],
  coverage: {
    protected_fach_terminal_physical_scope: 'P1-P59',
    segmented_physical_pages: [60, 61, 62, 63],
    next_opaque_page_review_envelope_from: 64,
    next_opaque_page_review_envelope_through: 66,
    original_source_object_count: sourceObjects.length,
    original_terminal_record_count: sourceObjects.length,
    deterministic_terminal_record_count: deterministic.length,
    new_terminal_record_count: sourceObjects.length + deterministic.length,
    active_terminal_review_leaf_count: active,
    active_explicit_fach_approved_count: counts.EXPLICIT_FACH_APPROVED,
    active_reviewed_not_assessable_count: counts.REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON,
    versioned_parent_or_fragment_count: counts.SOURCE_UNIT_RECLASSIFIED_VERSIONED,
    new_exact_open_child_object_count: 0,
    terminal_status_counts: counts,
    gates: [
      'BE_BSW_P60_FACH_COMPLETE_PASS_SOURCE_BOUND_ZERO_ACTIVE_EFFECT_LEAVES',
      'BE_BSW_P60_P61_OMITTED_SOURCE_UNITS_FACH_COMPLETE_PASS_SOURCE_BOUND_7_OF_7',
      'BE_BSW_P61_FACH_COMPLETE_PASS_SOURCE_BOUND_ZERO_APPROVED_EFFECT_LEAVES',
      'BE_BSW_P62_FACH_COMPLETE_PASS_SOURCE_BOUND_OBJECT_LEVEL',
      'BE_BSW_P63_FACH_COMPLETE_PASS_SOURCE_BOUND_OBJECT_LEVEL',
    ],
  },
  constraints: { fach_inferred_from_source: false, dns_synthesized: false, recommendation_synthesized: false, score_synthesized: false, party_wide_judgement_synthesized: false, p64_page_envelope_closed: false, vercel_action_triggered: false },
};
const encoded = `${JSON.stringify(handoff, null, 2)}\n`;
if (process.argv.includes('--check')) {
  if (readFileSync(OUTPUT_PATH, 'utf8') !== encoded) throw new Error('P60-P63 handoff is not deterministic/current');
} else writeFileSync(OUTPUT_PATH, encoded);
console.log(JSON.stringify({ output: path.relative(ROOT, OUTPUT_PATH), counts, active, deterministic_ids: deterministic.map((item) => item.object_id), gates: handoff.coverage.gates }, null, 2));
