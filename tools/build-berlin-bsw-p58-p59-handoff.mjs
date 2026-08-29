import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(ROOT, 'woek-parlament-app');
const LEDGER_PATH = path.join(APP, 'data/state-programmes/fach-reviews/berlin-2026-bsw-v1.json');
const OUTPUT_PATH = path.join(APP, 'data/state-programmes/fach-reviews/berlin-2026-bsw-p58-p59-explicit-v1.json');
const sha256 = (value) => createHash('sha256').update(value, 'utf8').digest('hex');
const ledger = JSON.parse(readFileSync(LEDGER_PATH, 'utf8'));

const snapshotIds = new Map([[58, 5458180510], [59, 5458279554]]);
const snapshots = [...snapshotIds].map(([pdf_page, issue_comment_id]) => {
  const relative = `woek-parlament-app/data/state-programmes/fach-reviews/berlin-2026-bsw-p${pdf_page}-authoritative-handoff.md`;
  return {
    pdf_page,
    issue: 240,
    issue_comment_id,
    issue_comment_url: `https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-${issue_comment_id}`,
    path: relative,
    file_sha256: sha256(readFileSync(path.join(ROOT, relative), 'utf8')),
  };
});

const frozenObjects = [
  ...ledger.source_units.filter((item) => item.pdf_page >= 58 && item.pdf_page <= 59 && item.atom_count === 0).map((item) => ({
    object_id: item.source_unit_id,
    object_kind: 'SOURCE_UNIT',
    pdf_page: item.pdf_page,
    source_text_sha256: item.source_text_sha256,
    source_locator: item.source_locator,
    exact: item.source_excerpt,
  })),
  ...ledger.effect_atoms.filter((item) => item.pdf_page >= 58 && item.pdf_page <= 59).map((item) => ({
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

set('NON_EFFECT_CONTEXT_REVIEWED',
  'BE-BSW-P58-U04-c7d4652444e5', 'BE-BSW-P58-U07-2528f001c120', 'BE-BSW-P58-U08-b45ad54bd32b', 'BE-BSW-P58-U09-a2efcb52a0ce',
  'BE-BSW-P58-U01-A01-a13f434ceb40', 'BE-BSW-P58-U01-A02-3aa78bf6684b', 'BE-BSW-P58-U01-A03-51966982ab0d',
  'BE-BSW-P58-U02-A01-170ef19fc5e0', 'BE-BSW-P58-U02-A02-f43ae2db4683', 'BE-BSW-P58-U02-A04-62c12c0cac46',
  'BE-BSW-P58-U03-A01-65442046dc8c', 'BE-BSW-P58-U05-A01-b049cc3abf46', 'BE-BSW-P58-U05-A02-3e3cfe611d57',
  'BE-BSW-P58-U05-A04-db5644a987af', 'BE-BSW-P58-U05-A07-55450af49415', 'BE-BSW-P58-U06-A01-dd2f348d9757',
  'BE-BSW-P58-U06-A02-8f61a4dd9af5', 'BE-BSW-P58-U06-A03-acebad2b34ab', 'BE-BSW-P58-U10-A01-5fc236b715c2',
  'BE-BSW-P58-U10-A02-02794e903a6c', 'BE-BSW-P58-U10-A03-2cef6d87a95b', 'BE-BSW-P58-U10-A04-e3b5ba2e467f',
  'BE-BSW-P59-U01-52a33870afd2', 'BE-BSW-P59-U02-A01-7f6998b50632', 'BE-BSW-P59-U02-A02-71c03fe93841',
  'BE-BSW-P59-U03-A02-81e12c5fa39f', 'BE-BSW-P59-U03-A03-6090038e6b31');
set('EXPLICIT_FACH_APPROVED',
  'BE-BSW-P58-U02-A03-dd937ebf181a', 'BE-BSW-P58-U03-A02-86314c55d859', 'BE-BSW-P58-U03-A03-218fafbb63aa',
  'BE-BSW-P58-U05-A05-673ba574f3ab', 'BE-BSW-P58-U05-A06-f969a7bf199c', 'BE-BSW-P58-U06-A04-56f6b79bb780',
  'BE-BSW-P58-U10-A06-40fdbe99937c', 'BE-BSW-P59-U02-A03-df16cc02be7f', 'BE-BSW-P59-U03-A01-9c08bbb9cd16');
set('REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON', 'BE-BSW-P58-U01-A04-e5a00a5fb430', 'BE-BSW-P58-U10-A05-e122f3eb9b60');
set('SOURCE_UNIT_RECLASSIFIED_VERSIONED', 'BE-BSW-P58-U05-A03-9857baf83960', 'BE-BSW-P59-U02-A04-a33034210bec');

const exactText = (id) => {
  const source = sourceObjects.find((item) => item.object_id === id);
  if (!source?.source_text) throw new Error(`${id}: exact source text unavailable`);
  return source.source_text;
};
const deterministic = [];
const addAuthoritativeClause = (prefix, parent, source_text, source_segment, state) => {
  const parentText = exactText(parent);
  const start = parentText.indexOf(source_segment);
  if (start < 0) throw new Error(`${parent}: authoritative source segment not found: ${source_segment}`);
  const hash = sha256(source_text);
  deterministic.push({
    object_id: `${prefix}-${hash.slice(0, 12)}`,
    object_kind: 'DETERMINISTIC_SEGMENTATION_REPLACEMENT',
    parent_object_ids: [parent],
    source_text,
    source_text_sha256: hash,
    source_span: { start, end: start + source_segment.length },
    source_span_basis: 'AUTHORITATIVE_SEMANTIC_CLAUSE_NORMALIZATION_FROM_EXACT_PARENT_SPAN',
    reconstruction_mode: 'AUTHORITATIVE_SEMANTIC_CLAUSE_NORMALIZATION',
    source_segments: [{ parent_object_id: parent, start, end: start + source_segment.length, source_text: source_segment }],
    terminal_fach_state: state,
    counts_as_effect_object: state === 'EXPLICIT_FACH_APPROVED' || state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
    decision_kind: state,
  });
};
const addSlice = (prefix, parent, needle, state, relation = undefined) => {
  const text = exactText(parent);
  const start = text.indexOf(needle);
  if (start < 0) throw new Error(`${parent}: slice not found: ${needle}`);
  const hash = sha256(needle);
  deterministic.push({
    object_id: `${prefix}-${hash.slice(0, 12)}`,
    object_kind: 'DETERMINISTIC_SEGMENTATION_REPLACEMENT',
    parent_object_ids: [parent],
    source_text: needle,
    source_text_sha256: hash,
    source_span: { start, end: start + needle.length },
    source_span_basis: 'UTF16_CODE_UNIT_OFFSETS_IN_EXACT_PARENT_SOURCE_TEXT',
    terminal_fach_state: state,
    counts_as_effect_object: state === 'EXPLICIT_FACH_APPROVED' || state === 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON',
    decision_kind: state,
    ...(relation ? { relation } : {}),
  });
};
addAuthoritativeClause('BE-BSW-P58-U05-A03-C01', 'BE-BSW-P58-U05-A03-9857baf83960', 'Wir wollen klare, nachvollziehbare Regeln und konsequente Kontrolle.', 'Wir wollen klare, nachvollziehbare Regeln und konsequente Kontrolle', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON');
addAuthoritativeClause('BE-BSW-P58-U05-A03-C02', 'BE-BSW-P58-U05-A03-9857baf83960', 'Wir wollen günstige, niedrigschwellige Entsorgungsmöglichkeiten für alle.', 'günstige, niedrigschwellige Entsorgungsmöglichkeiten für alle.', 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON');
addSlice('BE-BSW-P59-U02-A04-C01', 'BE-BSW-P59-U02-A04-a33034210bec', 'Berlin braucht Mehrjahresförderungen statt Projektflickwerk', 'NON_EFFECT_IMPLEMENTATION_REFINEMENT_OF_STABLE_BASE_FINANCING_REVIEWED', 'REFINES=BE-BSW-P59-U02-A03-df16cc02be7f');
addSlice('BE-BSW-P59-U02-A04-C02', 'BE-BSW-P59-U02-A04-a33034210bec', 'einen Krisenfonds für Großeinsätze oder Beschlagnahmen', 'EXPLICIT_FACH_APPROVED');

const replacements = new Map();
for (const record of deterministic) for (const parent of record.parent_object_ids) {
  if (!replacements.has(parent)) replacements.set(parent, []);
  replacements.get(parent).push(record.object_id);
}
for (const [parent, ids] of replacements) original.get(parent).replacement_record_ids = ids;
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
if (sourceObjects.length !== 40 || deterministic.length !== 4 || active !== 14) throw new Error(`set-wise count drift ${JSON.stringify({ source: sourceObjects.length, deterministic: deterministic.length, active, counts })}`);

const handoff = {
  schema_version: 'woek-explicit-fach-handoff-2.0',
  handoff_id: 'BE-BSW-P58-P59-EXPLICIT-FACH-2026-V1',
  base_main_commit: '02c6c2588063e86689f7cb71c35099f6e4d45672',
  artifact_id: ledger.artifact.artifact_id,
  artifact_sha256: ledger.artifact.artifact_sha256,
  artifact_byte_length: ledger.artifact.byte_length,
  artifact_page_count: ledger.artifact.page_count,
  controller: { issue: 241, issue_comment_id: 5460667812, issue_comment_url: 'https://github.com/sustynats/wirkungsoekonomie.de/issues/241#issuecomment-5460667812' },
  authoritative_markdowns: snapshots,
  source_objects: sourceObjects,
  original_records: [...original.values()],
  deterministic_records: deterministic,
  deterministic_open_children: [],
  coverage: {
    protected_fach_terminal_physical_scope: 'P1-P57',
    segmented_physical_pages: [58, 59],
    next_opaque_page_review_envelope_from: 60,
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
    gates: ['BE_BSW_P58_FACH_COMPLETE_PASS_SOURCE_BOUND_AFTER_U05_A03_REPAIR', 'BE_BSW_P59_FACH_COMPLETE_PASS_SOURCE_BOUND_AFTER_U02_A04_REPAIR'],
  },
  constraints: { fach_inferred_from_source: false, dns_synthesized: false, recommendation_synthesized: false, score_synthesized: false, party_wide_judgement_synthesized: false, p60_page_envelope_closed: false, vercel_action_triggered: false },
};
const encoded = `${JSON.stringify(handoff, null, 2)}\n`;
if (process.argv.includes('--check')) {
  if (readFileSync(OUTPUT_PATH, 'utf8') !== encoded) throw new Error('P58-P59 handoff is not deterministic/current');
} else writeFileSync(OUTPUT_PATH, encoded);
console.log(JSON.stringify({ output: path.relative(ROOT, OUTPUT_PATH), counts, active, deterministic_ids: deterministic.map((item) => item.object_id), gates: handoff.coverage.gates }, null, 2));
