#!/usr/bin/env node
/** Lossless finite serialization of #240/5555260265 and its reaffirmed Fach only. */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIR = 'data/state-programmes/fach-reviews/';
const LEDGER = `${DIR}berlin-2026-spd-v1/`;
export const OUTPUT = `${DIR}berlin-2026-spd-p24-explicit-v1.json`;
export const SOURCE = `${DIR}berlin-2026-spd-p24-full-source-v1.json`;
export const HANDOFF = `${DIR}berlin-2026-spd-p24-authoritative-handoff.md`;
export const DELTA = `${DIR}berlin-2026-spd-p24-canonical-delta.md`;
const COMMENT = 5555260265;
const OLD_COMMENT = 5542647318;
export const RNA = 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON';
export const APPROVED = 'EXPLICIT_FACH_APPROVED';
export const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const read = name => fs.readFileSync(path.join(APP_ROOT, name), 'utf8');
const json = name => JSON.parse(read(name));
const sid = number => `BE-SPD-2026-SU-${String(number).padStart(4, '0')}`;
const aid = (number, atom) => `${sid(number)}-A${String(atom).padStart(2, '0')}`;
const pin = name => ({ path: `woek-parlament-app/${name}`, file_sha256: sha256(read(name)) });
const encode = value => `${JSON.stringify(value, null, 2)}\n`;

// This is an explicit authority index, not a source-text classifier. Every child
// hash and role below is supplied by the correction; no keyword-derived Fach.
const CHILDREN = [
  [282, null, 1, '43b9cfa19d54b5ab2f93b6647e92d19727e8d0f05e670fcda48f92b45698c3b4'],
  [282, null, 2, '4674b20cfa088d0f312f518dc1daa6a2cea223f6851cc79d8f2ef595d9888269'],
  [282, null, 3, 'afb0f61ac4fdda1f63520ac9621b5362d4e5bd936c6e1825dba5cd2df21461df'],
  [282, 1, 1, '6826764ade8e77a44c41ea75820bc6d307c1cccd56583d4e372680b77edf722f'],
  [282, 1, 2, '15e8b64ad2ae57dcaf42e0392f34fdf6176822d6adec5559bdf6f7aa9e2fcadc', true],
  [282, null, 4, '56555b172430706a43e9bb442e617e7a9605ffde210e97b0bd18b358bca7cfbb'],
  [283, null, 1, '50a2c0c5ae19b5d8d8107aec91cfbaeef845cc40671e381d9f9c15c5d526c504'],
  [283, null, 2, '3360690f24fd5cb8eaa960388ffbbe4ead103c87e954b5923d6cbaae8f12ad83'],
  [283, null, 3, '9af342d13ed3253fb9f51531c9eea9bb90fa74a2bc03d62c41e4c4029f01498a'],
  [284, null, 1, '3c7da2651418fa3faeb3f4eec421b3424d83c427976a169ff554046c820f6025', true],
  [284, null, 2, 'fa649438527d1b2e7e1c9c6abf443bc1a0ec5990294ff0ccf59bbbba325e7515'],
  [284, null, 3, '7cbafc2df0e63f2d8189faf25da67f5f5a1f0678c0d91af6979572ffe4db68ad'],
  [284, null, 4, 'e1e3a7409c87ff98d5278d45a13d84f3b3b2fcbff5b3a16e81e2243c0531cbc5'],
  [286, null, 1, '1378cddf27950085476a45f7beba1c8cfa3c9f84a48e40e97aa940ccf1bdd852'],
  [286, null, 2, '13772b13d7c1ca3350531acfcf18bd4e262030b93664212f6efc8215146e8a00'],
  [286, null, 3, 'a7a520c05132d8d55c6b9fa0a67a955677790d03440b128d13037cd532e824cd'],
  [286, null, 4, '0664a6e1e2db82defd124d4bb8c273199727857597936efd0303f4467afdb106'],
  [286, null, 5, 'b2b675478d555f013e8aad61affc38cf120a2f3f7a804c4378f85ea11147febd'],
  [286, null, 6, 'c2c5dfe3215bec10f436fc80d8f3f36f33b842ae901ad553ea8151d928d1cfaf', true],
  [289, null, 1, '957f5713684ad847fcea1db6e93f3003666e79adec56392e007082089ef2367c'],
  [290, 2, 1, '2890ebb9baa5df550a7ac2cbfa838e0710fba22b13a39d904f40a019657872f5', true],
  [290, 2, 2, 'c8f1adbdad42f64e19ad7dbf393d9e791b6250cf18e6078da8125916dc0fb8f1', true],
  [290, null, 1, '020da75857420806cb68400ce213331d5308c1342a8f319c36fa3b3ef1393fdc'],
  [290, null, 2, 'e358a2cd4b627637ea54c9e615247f11fb22667a566f73f32af7700eb6f8a42c'],
  [290, null, 3, 'e2e47a38699588dba3c656bd5ed0bd04531a7bc3d57a0acabb8d5544fc47cfe2'],
  [290, null, 4, 'cdb685c5704aecce6fe469ddf29294bbd6da3ca03bd0b4527ecff721f4c0398c'],
  [290, 3, 1, 'fcd945253a674e7b52446c792f765f63fac119e4e207fee9ffcd0d097561941c'],
  [290, 3, 2, 'd74226339accfab5c42df7d5b661d88e022a4e4bf1eeead9708f6c53efe5533d', true],
  [290, 3, 3, 'a29b5f3d1aa80cbd443343d77369f023c34b0595e2b17e3864fdd557e9b3940b', true],
  [290, 3, 4, '50dc82c65514deecbd0f1f0953aa1c0cfe128bf87006301b82a2318411e58328', true],
  [290, 3, 5, '1d34da094d12353585a4418f290975f3a730fc5ec69f09f1248d33c4e861ea4a', true],
  [290, null, 5, '5685ce8899445fea338ac6c5ebc3171b3efc1bd7d1cf24b72ff158b072b55aa1'],
];
const WITHDRAWN = [
  '79d7be251dcafbc4d171f9982a739634f6ea87df73391e1117b2d974638e65e1',
  'a7489f52c780510fd7cb054b4112ef0b02dc8387ea548c8aec9db8f86a2b8bf8',
  'd05d9c988afc85329f0babc958b3915e9d10c979a1ef75c775400ad942bfe56c',
  '2dcd9a52792a5ece1c1df062a6e414c8375426a4f96cfb335e431062a4fdf8e0',
  '149d9883a35e488a12c08075598055682187dfecdc3134f938990365bce15b3e',
  '5ca6f3588b34042e9652af970e60b982070a993df450d8622f6c3b8486a04600',
];

export function buildP24() {
  assert.equal(sha256(read(`${LEDGER}manifest.json`)), '8711be87e5cc9965f78d799451e1c643422f512a4b2a5aa626caf9eb71b934d0');
  const manifest = json(`${LEDGER}manifest.json`);
  for (const ref of [...manifest.source_unit_shards, ...manifest.effect_atom_shards]) assert.equal(sha256(read(`${LEDGER}${ref.path}`)), ref.file_sha256, `Protected ledger changed: ${ref.path}`);
  const units = json(`${LEDGER}source-units-p19-p24.json`).records.filter(row => row.pdf_page === 24);
  const atoms = json(`${LEDGER}effect-atoms-p19-p24.json`).records.filter(row => row.pdf_page === 24);
  const full = json(SOURCE);
  assert.deepEqual(units.map(row => row.source_unit_id), Array.from({ length: 10 }, (_, i) => sid(281 + i)));
  assert.deepEqual(full.source_units.map(row => row.source_unit_id), units.map(row => row.source_unit_id));
  assert.deepEqual(full.artifact, manifest.ledger_metadata.artifact);
  const body = read(DELTA);
  const old = read(HANDOFF);
  assert.equal(sha256(body), '02ee24b108839b9a0a261c173f1b86331660898148e23a78f6bec1a968e0db5f');
  assert.equal(sha256(old), '1c00a5e501231065a4ef3f4cd86ac99addaabe631c64fa97f4370d53ae01036c');
  const originals = new Map();
  for (const unit of units) {
    const source = full.source_units.find(row => row.source_unit_id === unit.source_unit_id);
    for (const field of ['source_locator', 'pdf_page', 'pdf_pages', 'source_text_sha256']) assert.deepEqual(source[field], unit[field]);
    assert.equal(sha256(source.source_text), unit.source_text_sha256);
    assert.ok(body.includes(unit.source_text_sha256) && body.includes(unit.source_locator));
    originals.set(unit.source_unit_id, { object_id: unit.source_unit_id, source_unit_id: unit.source_unit_id, source_page: 24, pdf_pages: unit.pdf_pages, source_locator: unit.source_locator, source_text: source.source_text, source_text_sha256: unit.source_text_sha256, source_object_kind: 'SOURCE_UNIT' });
  }
  for (const atom of atoms) {
    assert.equal(sha256(atom.policy_action), atom.source_text_sha256);
    assert.ok(originals.get(atom.source_unit_id).source_text.includes(atom.policy_action));
    originals.set(atom.atom_id, { object_id: atom.atom_id, source_unit_id: atom.source_unit_id, source_page: 24, pdf_pages: atom.pdf_pages, source_locator: atom.source_locator, source_text: atom.policy_action, source_text_sha256: atom.source_text_sha256, source_object_kind: 'SOURCE_ATOM' });
  }
  const generated = [];
  const decisions = new Map();
  const byId = id => originals.get(id) ?? generated.find(row => row.object_id === id);
  function deltaExcerpt(key) {
    const lines = body.split('\n');
    const indexes = lines.flatMap((line, i) => line.startsWith('- ') && line.includes(key) ? [i] : []);
    assert.equal(indexes.length, 1, `Missing/ambiguous exact correction binding: ${key}`);
    let end = indexes[0] + 1;
    while (end < lines.length && lines[end].startsWith('  ')) end++;
    return lines.slice(indexes[0], end).join('\n');
  }
  function oldExcerpt(hash) {
    const blocks = old.split('\n\n').filter(block => block.includes(hash));
    assert.equal(blocks.length, 1);
    let block = blocks[0];
    if ((block.match(/[a-f0-9]{64}/g) ?? []).length > 1) block = block.split('\n').find(line => line.includes(hash));
    const start = block.indexOf('- `terminal_fach_state');
    if (start >= 0) return block.slice(start);
    const arrow = block.indexOf('→');
    if (arrow >= 0) return block.slice(arrow + 2);
    // U7 Heerstraße's explicit inherited-context declaration precedes its RNAA.
    const inherited = block.indexOf('parent-context inheritance');
    assert.ok(inherited >= 0, `No bounded Fach excerpt: ${hash}`);
    return block.slice(inherited);
  }
  function decide(id, state, extra = {}) {
    assert.ok(byId(id));
    assert.ok(!decisions.has(id), `Duplicate decision: ${id}`);
    decisions.set(id, { terminal_fach_state: state, counts_as_effect_object: [RNA, APPROVED].includes(state), batch_issue_comment_id: COMMENT, ...extra });
  }
  function authoritative(id, inherited = false, key = byId(id).source_text_sha256) {
    const correction = deltaExcerpt(key);
    const state = correction.match(/`(EXPLICIT_FACH_APPROVED|REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON|NON_EFFECT_[A-Z_]+)`/)?.[1];
    assert.ok(state, `No explicit authority state: ${id}`);
    const text = inherited ? oldExcerpt(byId(id).source_text_sha256) : correction;
    assert.ok(text.includes(state), `Inherited Fach state contradicts correction: ${id}`);
    const extra = { authoritative_fach_text: text, correction_binding_text: correction, fach_issue_comment_id: inherited ? OLD_COMMENT : COMMENT, source_identity_authority: COMMENT, fach_source_sha256: sha256(text), inherited_fach_reaffirmed: inherited };
    for (const field of ['impact_direction', 'evidence_level', 'exact_reason_code']) {
      const value = text.match(new RegExp('`' + field + ' = ([^`]+)`'))?.[1];
      if (value) extra[field] = value;
    }
    if (state === RNA) {
      extra.exact_reason_code ??= text.match(/(?:reason code|code) `([A-Z0-9_]+)`/)?.[1];
      extra.exact_reason_code ??= correction.match(/`([A-Z0-9_]+(?:UNSPECIFIED|NOT_SPECIFIED|NOT_BOUND_IN_SOURCE))`/)?.[1];
      assert.ok(extra.exact_reason_code, `Missing finite reason code: ${id}`);
      // Entire verbatim object-specific decision is retained, including shared
      // references such as "for the same route-specific missing inputs".
      extra.exact_reason = text.match(/Exact reason: ([^\n]+)/)?.[1] ?? text;
    }
    if (state === APPROVED && !inherited) {
      extra.impact_direction = text.match(/`(POSITIVE_[^`]+)`/)?.[1];
      extra.evidence_level = text.match(/  - Evidence: `([^`]+)`/)?.[1] ?? text.match(/  - (Low-to-medium evidence[^\n]+)/)?.[1];
      assert.ok(extra.impact_direction && extra.evidence_level);
    }
    decide(id, state, extra);
  }
  for (const [unitNo, atomNo, ordinal, hash, inherited = false] of CHILDREN) {
    const parent = atomNo === null ? sid(unitNo) : aid(unitNo, atomNo);
    const excerpt = deltaExcerpt(hash);
    const beforeHash = excerpt.slice(0, excerpt.indexOf(hash));
    const text = [...beforeHash.matchAll(/`([^`]+)`/g)].at(-1)?.[1];
    assert.equal(sha256(text), hash, `Supplied exact clause/hash mismatch: ${hash}`);
    assert.ok(byId(parent).source_text.includes(text));
    const unit = originals.get(sid(unitNo));
    const start = unit.source_text.indexOf(text);
    assert.equal(unit.source_text.indexOf(text, start + 1), -1);
    const object_id = `${parent}-C${String(ordinal).padStart(2, '0')}-${hash.slice(0, 12)}`;
    generated.push({ object_id, source_unit_id: unit.object_id, parent_object_ids: [parent], source_page: 24, pdf_pages: unit.pdf_pages, source_locator: unit.source_locator, source_span_utf16: [start, start + text.length], source_text: text, source_text_sha256: hash, source_object_kind: 'DETERMINISTIC_EXACT_SPAN_CHILD' });
    authoritative(object_id, inherited);
  }
  for (const n of [281, 285, 287]) decide(sid(n), 'NON_EFFECT_STRUCTURAL_HEADING_REVIEWED', { authoritative_role_text: 'NON_EFFECT_STRUCTURAL_HEADING_REVIEWED' });
  for (const [unit, atom] of [[282, 2], [282, 3], [283, 1], [283, 2], [283, 3], [284, 1], [284, 2], [284, 5], [284, 6], [288, 1], [288, 2], [288, 3], [288, 4], [288, 5], [289, 1], [290, 1]]) authoritative(aid(unit, atom), true);
  authoritative(aid(286, 1), false, byId(aid(286, 1)).source_text);
  authoritative(aid(288, 6));
  authoritative(aid(289, 2));
  for (const parent of [aid(282, 1), aid(290, 2), aid(290, 3)]) {
    decide(parent, 'COMPOUND_PARENT_VERSIONED_ZERO_COUNT', { superseded_by: generated.filter(row => row.parent_object_ids.includes(parent)).map(row => row.object_id) });
  }
  for (const [unit, numbers, hash] of [[284, [3, 4], '3c7da2651418fa3faeb3f4eec421b3424d83c427976a169ff554046c820f6025'], [286, [2, 3], 'c2c5dfe3215bec10f436fc80d8f3f36f33b842ae901ad553ea8151d928d1cfaf']]) {
    const child = generated.find(row => row.source_text_sha256 === hash);
    child.replaces_object_ids = numbers.map(number => aid(unit, number));
    for (const parent of child.replaces_object_ids) decide(parent, 'SOURCE_FRAGMENT_VERSIONED_ZERO_COUNT', { superseded_by: [child.object_id] });
  }
  const objects = [...originals.values(), ...generated];
  for (const unit of units) if (!decisions.has(unit.source_unit_id)) decide(unit.source_unit_id, 'SOURCE_CONTAINER_COVERED_ZERO_COUNT', { covered_by: objects.filter(row => row.source_unit_id === unit.source_unit_id && row.object_id !== unit.source_unit_id).map(row => row.object_id) });
  assert.deepEqual([...decisions.keys()].sort(), objects.map(row => row.object_id).sort());
  const terminal_records = objects.map(row => ({ ...row, ...decisions.get(row.object_id) }));
  const active = terminal_records.filter(row => row.counts_as_effect_object);
  // Exact grammar separators left by the authority's three tram route clauses.
  // They are source coverage, not review objects and carry no Fach semantics.
  const grammar_separators = [
    ['e358a2cd4b627637ea54c9e615247f11fb22667a566f73f32af7700eb6f8a42c', ' sowie '],
    ['e2e47a38699588dba3c656bd5ed0bd04531a7bc3d57a0acabb8d5544fc47cfe2', ' und '],
  ].map(([hash, text]) => {
    const previous = generated.find(row => row.source_text_sha256 === hash);
    const start = previous.source_span_utf16[1];
    assert.equal(originals.get(sid(290)).source_text.slice(start, start + text.length), text);
    return { source_unit_id: sid(290), source_span_utf16: [start, start + text.length], source_text: text, source_text_sha256: sha256(text), disposition: 'GRAMMATICAL_CONNECTOR_BETWEEN_EXPLICITLY_REVIEWED_CLAUSES_NOT_A_REVIEW_OBJECT' };
  });
  const result = {
    schema_version: 'woek-explicit-fach-handoff-2.0', handoff_id: 'BE-SPD-P24-CANONICAL-EXPLICIT-FACH-2026-V1', base_main_commit: 'b97eaf1bdc079e44b25d9afc620e212f550540fd', artifact: manifest.ledger_metadata.artifact,
    authoritative_markdowns: [{ issue_comment_id: COMMENT, issue_comment_url: `https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-${COMMENT}`, ...pin(DELTA) }, { issue_comment_id: OLD_COMMENT, issue_comment_url: `https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-${OLD_COMMENT}`, ...pin(HANDOFF), disposition: 'ARCHIVE_ONLY_EXCEPT_EXACT_FACH_REAFFIRMED_BY_CANONICAL_DELTA' }],
    source_ledger: { ...pin(`${LEDGER}manifest.json`), logical_descriptor_sha256: manifest.logical_descriptor_sha256, disposition: 'SOURCE_SCAFFOLD_ONLY_NOT_FACH_AUTHORITY' }, full_source_proof: pin(SOURCE),
    protected_source_files: fs.readdirSync(path.join(APP_ROOT, LEDGER)).sort().map(name => pin(`${LEDGER}${name}`)),
    protected_handoffs: [22, 23].map(page => pin(`${DIR}berlin-2026-spd-p${page}-explicit-v1.json`)),
    source_relation_correction_verbatim: body.slice(body.indexOf('### 1.'), body.indexOf('### 2.')),
    common_baselines_verbatim: old.slice(old.indexOf('### Current official baseline'), old.indexOf('## 1.')),
    cross_object_guards_verbatim: old.slice(old.indexOf('## 9.'), old.indexOf('## 10.')),
    withdrawal_authority_verbatim: body.slice(body.indexOf('### 10.'), body.indexOf('### 11.')),
    withdrawn_non_source_objects: WITHDRAWN.map(hash => ({ source_text_sha256: hash, archive_issue_comment_id: OLD_COMMENT, disposition: 'WITHDRAWN_NON_SOURCE_OBJECT_NOT_MATERIALIZED', counts_as_effect_object: false })),
    terminal_records, grammar_separators,
    coverage: {
      source_unit_ids: units.map(row => row.source_unit_id), original_atom_ids: atoms.map(row => row.atom_id), generated_child_ids: generated.map(row => row.object_id), active_terminal_review_leaf_ids: active.map(row => row.object_id),
      explicit_fach_approved_ids: active.filter(row => row.terminal_fach_state === APPROVED).map(row => row.object_id), reviewed_not_assessable_ids: active.filter(row => row.terminal_fach_state === RNA).map(row => row.object_id), zero_count_ids: terminal_records.filter(row => !row.counts_as_effect_object).map(row => row.object_id),
      remaining_p24_source_object_ids: [], terminal_pages: [24], cross_page_objects_consumed_once: [sid(290)],
      unconsumed_successor_source_unit_ids: json(`${LEDGER}source-units-p25-p30.json`).records.filter(row => row.pdf_page === 25).map(row => row.source_unit_id),
      gate: 'BE_SPD_2026_P24_FACH_COMPLETE_PASS_SOURCE_BOUND_AFTER_LOSSLESS_MATERIALISATION',
    },
    constraints: { fach_synthesized: false, protected_fach_or_source_overwritten: false, generic_delegated_rnaa_used_as_fach: false, dns_synthesized: false, recommendation_synthesized: false, score_synthesized: false, programme_terminal_claimed: false, vercel_action_triggered: false },
  };
  assert.equal(result.coverage.unconsumed_successor_source_unit_ids[0], sid(291));
  result.descriptor_sha256 = sha256(JSON.stringify(result));
  return result;
}
export function materialize({ check = false } = {}) {
  const result = buildP24();
  if (check) assert.equal(read(OUTPUT), encode(result));
  else fs.writeFileSync(path.join(APP_ROOT, OUTPUT), encode(result));
  return Object.fromEntries(Object.entries(result.coverage).map(([key, value]) => [key, Array.isArray(value) ? value.length : value]));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.slice(2).every(arg => arg === '--check'));
  console.log(JSON.stringify(materialize({ check: process.argv.includes('--check') }), null, 2));
}
