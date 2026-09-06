#!/usr/bin/env node
/** Finite lossless #240/5560493492 serializer. No programme-text classifier. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_ROOT, sha256, RNA, APPROVED } from './materialize-berlin-spd-p25.mjs';
export { APP_ROOT, sha256, RNA, APPROVED };
const DIR = 'data/state-programmes/fach-reviews/';
const LEDGER = `${DIR}berlin-2026-spd-v1/`;
export const HANDOFF = `${DIR}berlin-2026-spd-p26-authoritative-handoff.md`;
export const CONTROLLER = `${DIR}berlin-2026-spd-p26-controller.md`;
export const OUTPUT = `${DIR}berlin-2026-spd-p26-explicit-v1.json`;
export const SOURCE = `${DIR}berlin-2026-spd-p26-full-source-v1.json`;
export const COMMENT = 5560493492;
const read = name => fs.readFileSync(path.join(APP_ROOT, name), 'utf8');
const json = name => JSON.parse(read(name));
const sid = n => `BE-SPD-2026-SU-${String(n).padStart(4, '0')}`;
const aid = (n, a) => `${sid(n)}-A${String(a).padStart(2, '0')}`;
const pin = name => ({ path: `woek-parlament-app/${name}`, file_sha256: sha256(read(name)) });
const encode = value => `${JSON.stringify(value, null, 2)}\n`;

// Exact authorised parent + source-hash set. Ordinals add no semantics.
export const CHILDREN = [
  [305, null, 1, 'e520cce28451aadc96e75b1c67ddc033c608d2b38c14040b9991f3859551e36f'],
  [305, null, 2, 'b84646243b7b5264c401f5362cea9d74f300905cd4ab3dffda16c0d8599d6d4c'],
  [305, null, 3, 'b7dd37c3de2b1b3400e0206dbe1515eb816ab606a3ee09b98abc0b27aaa299b3'],
  [305, null, 4, '71248cbe35631f6775ef7e3754599df3e7f593037dbcce6f7ea1d4c5e9c86403'],
  [306, null, 1, '9d048a84278390532948e0ba55a0f1605b4fb9ff30023056884bbcb0dd52fea6'],
  [307, null, 1, '5a8397c8c20a28b0f662364cb2d26adaa5c7326538b19468e25f7154f0212176'],
  [310, null, 1, 'd1df1113b4f35aa12226990a3f23c81beb714d972bf0c4101b2b43a027cde74d'],
  [312, null, 1, '7bea65f223e7446cecc7566c110232d9a5ae280889228b0665b7368c98f527e3'],
  [314, null, 1, '1c1dbffca0699b45fee9fe4e2fd06d918a3f562dd056b8f42c0c30eb0823b0c9'],
  [314, null, 2, '1a244eca44aadf5662fd2b7f4358198afb0519f0170de34db4905cb9f96c5c2a'],
  [316, null, 1, 'f3345c3cec6597577f43b1d02040c0fee2dede4fe431aef96b5b94209e746a9c'],
  [316, null, 2, '05ed7c007adc8364b0fc676a1479de1548471281c29036ca324ef4857c727cbe'],
  [316, 1, 1, '1f88162bfdb5f14e825a3b0a6484e1cbf56ba5a30f47994399c3f408dc661452'],
  [316, 1, 2, '159c79f45670d29e1ee730a48fbe21569567f3652cc24012f9793d9f53a7b8d8'],
  [318, 2, 1, '4f5e17fb2dee8633b5284addf94cb4612baea5b6ad672aab3989b8f91d09aaf4'],
  [318, 2, 2, '942fe8b919703c56e1757d3454aa0da292d8c647db7521794107cc89714411bb'],
  [318, 2, 3, '68ab5039af418cfafa3c257f295b70d9bbb93b29276652d9ffa2a11f49f4d6ca'],
  [318, 2, 4, 'fa5c51daeb157db946800013ee3a3bf50661a20c0c7c7fa2b16ec49a8a764abc'],
  [318, 2, 5, '2947179abeba90f68dbd0bb9efbdbbe1501b6dee47f3018d76dc57fd7be0fc41'],
  [318, 2, 6, 'fa1ef0073bc4b4673a22d6141c153f8b8e313374b5877a9dddfc83633169bcda'],
  [318, 2, 7, 'e22c7a91870d25b37d61cc6d2578dfd222b1838f0f3bb583871848d325901469'],
  [318, null, 1, '70453721fea7ca93fe8892019e2034afed63ff0f3b7ce79c5737ec1ce310617d'],
  [318, null, 2, '2b13d789a7696e895f1e8e3561a6a46d87b5994cf885a022484ba7ccb9687d9f'],
  [318, 3, 1, '55c6bb7d8e5b2d5c987477f695218a7eacc35d54fa0359d6cdfe7a0a64bd04ad'],
  [318, 3, 2, '6cfdb1c0bc2b50446f22cebdd3d7e1c54b17fae662518e2b375f0278afbce85a'],
];

export function sourceCoverage(records) {
  const uncovered_source_spans = [], grammar_separators = [];
  for (const unit of records.filter(row => row.source_object_kind === 'SOURCE_UNIT')) {
    const leaves = unit.covered_by ? records.filter(row => row.source_unit_id === unit.object_id && row.object_id !== unit.object_id && !row.superseded_by) : [unit];
    const covered = new Uint8Array(unit.source_text.length);
    for (const leaf of leaves) {
      const start = unit.source_text.indexOf(leaf.source_text);
      assert.ok(start >= 0 && unit.source_text.indexOf(leaf.source_text, start + 1) === -1, `Non-unique source span: ${leaf.object_id}`);
      for (let i = start; i < start + leaf.source_text.length; i++) {
        assert.equal(covered[i], 0, `Overlapping source leaves: ${leaf.object_id}`);
        covered[i] = 1;
      }
    }
    for (let i = 0; i < covered.length;) {
      if (covered[i]) { i++; continue; }
      const start = i;
      while (i < covered.length && !covered[i]) i++;
      const text = unit.source_text.slice(start, i);
      if (/^[\s,;:.]*$/u.test(text)) continue;
      const row = { source_unit_id: unit.object_id, source_locator: unit.source_locator, source_span_utf16: [start, i], source_text: text, source_text_sha256: sha256(text) };
      // Exact conjunction between the seven explicitly selected A02 clauses.
      if (unit.object_id === sid(318) && text === ' und ') grammar_separators.push({ ...row, disposition: 'GRAMMATICAL_CONNECTOR_BETWEEN_EXPLICITLY_REVIEWED_CLAUSES_NOT_A_REVIEW_OBJECT' });
      else uncovered_source_spans.push({ ...row, status: 'SOURCE_SPAN_WITHOUT_EXPLICIT_FACH_AUTHORITY', counts_as_effect_object: null });
    }
  }
  return { uncovered_source_spans, grammar_separators };
}

export function buildP26() {
  const body = read(HANDOFF);
  assert.equal(sha256(body), '3a0b848ae9461bbd37b759ac001ac066f915f5a0bc9175d283af0cd6ad4601f6');
  assert.equal(sha256(read(`${LEDGER}manifest.json`)), '8711be87e5cc9965f78d799451e1c643422f512a4b2a5aa626caf9eb71b934d0');
  const manifest = json(`${LEDGER}manifest.json`);
  for (const ref of [...manifest.source_unit_shards, ...manifest.effect_atom_shards]) assert.equal(sha256(read(`${LEDGER}${ref.path}`)), ref.file_sha256);
  const units = json(`${LEDGER}source-units-p25-p30.json`).records.filter(row => row.pdf_page === 26);
  const atoms = json(`${LEDGER}effect-atoms-p25-p30.json`).records.filter(row => row.pdf_page === 26);
  assert.deepEqual(units.map(row => row.source_unit_id), Array.from({ length: 16 }, (_, i) => sid(303 + i)));
  const table = [...body.matchAll(/^\| `(BE-SPD-2026-SU-\d+)` \| `([^`]+)` \| `([a-f0-9]{64})` \| `([^`]+)` \|$/gm)];
  assert.deepEqual(table.map(row => row[1]), units.map(row => row.source_unit_id));
  const records = units.map(unit => {
    const row = table.find(match => match[1] === unit.source_unit_id);
    assert.equal(row[2], unit.source_locator);
    assert.equal(row[3], unit.source_text_sha256);
    assert.equal(sha256(row[4]), unit.source_text_sha256);
    return { object_id: unit.source_unit_id, source_unit_id: unit.source_unit_id, source_page: 26, pdf_pages: unit.pdf_pages, source_locator: unit.source_locator, source_text: row[4], source_text_sha256: unit.source_text_sha256, source_object_kind: 'SOURCE_UNIT' };
  });
  const byId = id => records.find(row => row.object_id === id);
  for (const atom of atoms) {
    assert.equal(sha256(atom.policy_action), atom.source_text_sha256);
    assert.ok(byId(atom.source_unit_id).source_text.includes(atom.policy_action));
    records.push({ object_id: atom.atom_id, source_unit_id: atom.source_unit_id, source_page: 26, pdf_pages: atom.pdf_pages, source_locator: atom.source_locator, source_text: atom.policy_action, source_text_sha256: atom.source_text_sha256, source_object_kind: 'SOURCE_ATOM' });
  }
  const section = n => body.split(`### \`SU${String(n).padStart(4, '0')}\``)[1].split(/\n### |\n## /)[0].trim();
  function excerpt(n, hash) {
    const s = section(n);
    const numbered = s.split(/(?=^\d+\. )/m);
    const blocks = numbered.filter(block => block.includes(hash));
    assert.equal(blocks.length, 1, `Missing/ambiguous explicit decision: ${n}/${hash}`);
    const block = blocks[0].trim();
    const childLine = block.split('\n').find(line => line.includes(hash) && /^\s+- /.test(line) && line.includes('→'));
    if (!childLine) return block;
    return childLine.trim();
  }
  function decide(row, text) {
    const state = text.match(/`(?:terminal_fach_state = )?(EXPLICIT_FACH_APPROVED|REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON|SOURCE_ATOM_VERSIONED_ZERO_COUNT|NON_EFFECT_[A-Z0-9_]+)`/)?.[1];
    assert.ok(state, `Missing explicit state: ${row.object_id}`);
    Object.assign(row, { terminal_fach_state: state, counts_as_effect_object: [RNA, APPROVED].includes(state), batch_issue_comment_id: COMMENT, fach_issue_comment_id: COMMENT, authoritative_fach_text: text, fach_source_sha256: sha256(text) });
    if (state === RNA) {
      row.exact_reason_code = text.match(/(?:reason code|code) `([^`]+)`/i)?.[1];
      row.exact_reason = text.match(/exact reason: ([^\n]+)/i)?.[1];
      assert.ok(row.exact_reason_code && row.exact_reason, `Missing exact RNAA: ${row.object_id}`);
    }
    if (state === APPROVED) {
      row.impact_direction = text.match(/`impact_direction = ([^`]+)`/)?.[1] ?? text.match(/`((?:STRONG_POSITIVE|POSITIVE|AMBIVALENT)_[^`]+)`/)?.[1];
      row.evidence_level = text.match(/`evidence_level = ([^`]+)`/)?.[1] ?? text.match(/evidence `([^`]+)`/i)?.[1];
      assert.ok(row.impact_direction && row.evidence_level, `Missing supplied grade: ${row.object_id}`);
    }
  }
  for (const [n, atom, ordinal, hash] of CHILDREN) {
    const text = excerpt(n, hash);
    const parentId = atom === null ? sid(n) : aid(n, atom);
    const unit = byId(sid(n));
    const clause = [307, 310, 312].includes(n) ? unit.source_text
      : [...text.matchAll(/`([^`]+)`/g)].map(match => match[1]).find(value => sha256(value) === hash);
    assert.ok(clause, `No exact authorised child text: ${n}/${hash}`);
    assert.equal(sha256(clause), hash);
    assert.ok(byId(parentId).source_text.includes(clause));
    const start = unit.source_text.indexOf(clause);
    const row = { object_id: `${parentId}-C${String(ordinal).padStart(2, '0')}-${hash.slice(0, 12)}`, source_unit_id: sid(n), parent_object_ids: [parentId], source_page: 26, pdf_pages: unit.pdf_pages, source_locator: unit.source_locator, source_span_utf16: [start, start + clause.length], source_text: clause, source_text_sha256: hash, source_object_kind: 'DETERMINISTIC_EXACT_SPAN_CHILD' };
    decide(row, text);
    if (n === 318 && atom === 2) row.shared_reality_check_verbatim = section(n).split('\n').find(line => line.includes('Common Reality Check for the A02 child set:')).trim();
    records.push(row);
  }
  for (const row of records.filter(row => row.source_object_kind === 'SOURCE_ATOM')) decide(row, excerpt(Number(row.source_unit_id.slice(-4)), row.source_text_sha256));
  for (const n of [303, 304, 308, 313, 315]) decide(byId(sid(n)), section(n));
  for (const parent of [aid(316, 1), aid(318, 2), aid(318, 3)]) byId(parent).superseded_by = records.filter(row => row.parent_object_ids?.includes(parent)).map(row => row.object_id);
  for (const unit of records.filter(row => row.source_object_kind === 'SOURCE_UNIT' && !row.terminal_fach_state)) Object.assign(unit, {
    terminal_fach_state: 'SOURCE_CONTAINER_ZERO_COUNT', counts_as_effect_object: false, batch_issue_comment_id: COMMENT,
    covered_by: records.filter(row => row.source_unit_id === unit.object_id && row.object_id !== unit.object_id).map(row => row.object_id),
  });
  const fullSource = { schema_version: 'woek-source-bound-full-text-1.0', artifact: manifest.ledger_metadata.artifact, extraction: { method: 'Verbatim #240/5560493492 canonical source table, independently hash/locator-bound to frozen final PDF ledger', source_unit_count: units.length, physical_scope: [26], excluded_previously_consumed_cross_page_objects: [sid(302)] }, source_units: records.filter(row => row.source_object_kind === 'SOURCE_UNIT').map(row => ({ source_unit_id: row.object_id, pdf_page: row.source_page, pdf_pages: row.pdf_pages, source_locator: row.source_locator, source_text_sha256: row.source_text_sha256, source_text: row.source_text })) };
  const coverage = sourceCoverage(records);
  const active = records.filter(row => row.counts_as_effect_object);
  const result = {
    schema_version: 'woek-explicit-fach-handoff-2.0', handoff_id: 'BE-SPD-P26-CANONICAL-EXPLICIT-FACH-2026-V1', base_main_commit: '7e9f676711af9cbfd6df7f8ddc3468e952c2ce00', artifact: manifest.ledger_metadata.artifact,
    authoritative_markdowns: [{ issue_comment_id: COMMENT, issue_comment_url: `https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-${COMMENT}`, ...pin(HANDOFF) }],
    controller: { issue_comment_id: 5560496111, issue_comment_url: 'https://github.com/sustynats/wirkungsoekonomie.de/issues/241#issuecomment-5560496111', ...pin(CONTROLLER) },
    archive_encoding: 'GitHub comment body preserved verbatim with one terminal LF',
    source_ledger: { ...pin(`${LEDGER}manifest.json`), disposition: 'SOURCE_SCAFFOLD_ONLY_NOT_FACH_AUTHORITY' }, full_source_proof: { path: `woek-parlament-app/${SOURCE}`, file_sha256: sha256(encode(fullSource)) },
    protected_source_files: fs.readdirSync(path.join(APP_ROOT, LEDGER)).sort().map(name => pin(`${LEDGER}${name}`)),
    protected_handoffs: [22, 23, 24, 25].map(p => pin(`${DIR}berlin-2026-spd-p${p}-explicit-v1.json`)),
    assessment_contract_verbatim: body.slice(body.indexOf('### Current-law'), body.indexOf('## Object-level')).trimEnd(),
    cross_object_guards_verbatim: body.slice(body.indexOf('## Batch-wide Fach guards'), body.indexOf('## Expected source-bound')).trimEnd(),
    terminal_records: records, grammar_separators: coverage.grammar_separators,
    coverage: {
      source_unit_ids: units.map(row => row.source_unit_id), original_atom_ids: atoms.map(row => row.atom_id), generated_child_ids: records.filter(row => row.parent_object_ids).map(row => row.object_id), active_terminal_review_leaf_ids: active.map(row => row.object_id),
      explicit_fach_approved_ids: active.filter(row => row.terminal_fach_state === APPROVED).map(row => row.object_id), reviewed_not_assessable_ids: active.filter(row => row.terminal_fach_state === RNA).map(row => row.object_id), zero_count_ids: records.filter(row => !row.counts_as_effect_object).map(row => row.object_id),
      uncovered_source_spans: coverage.uncovered_source_spans, remaining_p26_source_object_ids: coverage.uncovered_source_spans.map(row => row.source_unit_id),
      terminal_pages: coverage.uncovered_source_spans.length ? [] : [26], cross_page_objects_consumed_once: [], excluded_previously_consumed_cross_page_objects: [sid(302)],
      gate: coverage.uncovered_source_spans.length ? 'BE_SPD_2026_P26_FACH_INCOMPLETE_SOURCE_AUTHORITY_GAP' : 'BE_SPD_2026_P26_FACH_COMPLETE_PASS_SOURCE_BOUND_AFTER_LOSSLESS_MATERIALISATION',
      release_or_residual_activation_allowed: coverage.uncovered_source_spans.length === 0,
    },
    constraints: { fach_synthesized: false, protected_fach_or_source_overwritten: false, generic_delegated_rnaa_used_as_fach: false, dns_synthesized: false, recommendation_synthesized: false, score_synthesized: false, programme_terminal_claimed: false, vercel_action_triggered: false, p27_authorised: false },
  };
  result.descriptor_sha256 = sha256(JSON.stringify(result));
  return { result, fullSource };
}
export function materialize({ check = false } = {}) {
  const { result, fullSource } = buildP26();
  for (const [file, data] of [[SOURCE, fullSource], [OUTPUT, result]]) {
    if (check) assert.equal(read(file), encode(data));
    else fs.writeFileSync(path.join(APP_ROOT, file), encode(data));
  }
  return result.coverage;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.slice(2).every(arg => arg === '--check'));
  console.log(JSON.stringify(materialize({ check: process.argv.includes('--check') }), null, 2));
}
