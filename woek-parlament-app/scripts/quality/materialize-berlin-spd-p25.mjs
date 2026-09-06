#!/usr/bin/env node
/** Finite, verbatim #240/5558175710 serialization. Never a Fach classifier. */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIR = 'data/state-programmes/fach-reviews/';
const LEDGER = `${DIR}berlin-2026-spd-v1/`;
export const OUTPUT = `${DIR}berlin-2026-spd-p25-explicit-v1.json`;
export const SOURCE = `${DIR}berlin-2026-spd-p25-full-source-v1.json`;
export const HANDOFF = `${DIR}berlin-2026-spd-p25-authoritative-handoff.md`;
export const COMMENT = 5558175710;
export const RNA = 'REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON';
export const APPROVED = 'EXPLICIT_FACH_APPROVED';
export const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const read = name => fs.readFileSync(path.join(APP_ROOT, name), 'utf8');
const json = name => JSON.parse(read(name));
const sid = n => `BE-SPD-2026-SU-${String(n).padStart(4, '0')}`;
const aid = (n, a) => `${sid(n)}-A${String(a).padStart(2, '0')}`;
const pin = name => ({ path: `woek-parlament-app/${name}`, file_sha256: sha256(read(name)) });
const encode = value => `${JSON.stringify(value, null, 2)}\n`;

// These exact identities/parent boundaries come from the explicit handoff.
// Ordinal and hash suffix generation contributes no additional semantics.
const CHILDREN = [
  [291, null, 1, 'c65cfe146a8def2653295dd64a5d6cea6dccc35bf33fc4f720ebf677102d27cb'],
  [294, null, 1, '6e39c01ddd02d2548fa83940648f19fcb1c4cf11dd25bc100c11a153b4b90f35'],
  [294, null, 2, '35f58d70ed242d8643ade01405f47a64c75f503e9b78a470508ea016508a8d73'],
  [294, 1, 1, '4c103cadf0f8268ee15d9eb692b5644a7a5f04bba90fa9b60c46e795fa5e46a3'],
  [294, 1, 2, 'f22491ee0fe2af91bcfb97cee8d63c4519a02149e6220fabb3d2c403c64054e4'],
  [294, null, 3, '3e720cb974912ec011615d51b4be060319a9f347604dc852fbff8a192557196f'],
  [294, null, 4, 'a4c616d3086ea7f8ea094ae46d402015ab60fd1cdf68059905e6144921f170f2'],
  [294, null, 5, '4fd848b27f3a0191a702e1ddad3533d49b2770c8ea49afe95f21c58daa4f0f74'],
  [294, null, 6, 'e62d80d5c5f656e1834c0700154b368e8afa7d0bf250da709b30e9a22240a3e9'],
  [294, null, 7, '61ef06f0fdbfe098b953c2e25d8df1643366fcbb978ab49fa4397ab22fc0a7d5'],
  [298, null, 1, '71ae605b0875224a28e0685601c3ea58607474deaf74bcf69d4d03e3ce5a377c'],
  [298, 1, 1, 'dca48fc2047df0bd09ea5e36bb6de0893a038025060d8850ea2b6aab93b3336d'],
  [298, 1, 2, '3c7adca981431822c001ad287c9df6fbf8b8c35131bfe742bce78f52813002ea'],
  [298, null, 2, 'a1655d8e931dea92c7c1c4db58b32f0974354d1d2e405a7460519dc068c3e81a'],
  [298, null, 3, '92719a2584a720bd1212fc3775680c503e9c5eb517aad67713d64bb7b662cbc3'],
  [299, 6, 1, 'ffb78ed16a37b7f8d9a8d519530445711066b0119f357dff5b200974865b0689'],
  [299, 6, 2, 'be577700ead30600c9e35d4e70fb20cf9f31bc2b7edb9ef0a0dcff0a44d63569'],
  [302, null, 1, '40c8c940c38149686a526329e7d64cee644cdf964bf38f513f0ef8a2c82f9f65'],
];

export function sourceCoverage(records) {
  const uncovered = [];
  const connectors = [];
  for (const unit of records.filter(r => r.source_object_kind === 'SOURCE_UNIT')) {
    const leaves = unit.covered_by ? records.filter(r => r.source_unit_id === unit.object_id && r.object_id !== unit.object_id && !r.superseded_by) : [unit];
    const covered = new Uint8Array(unit.source_text.length);
    for (const leaf of leaves) {
      const start = unit.source_text.indexOf(leaf.source_text);
      assert.ok(start >= 0 && unit.source_text.indexOf(leaf.source_text, start + 1) === -1);
      for (let i = start; i < start + leaf.source_text.length; i++) {
        assert.equal(covered[i], 0, `Overlapping source leaves: ${unit.object_id}`);
        covered[i] = 1;
      }
    }
    for (let i = 0; i < covered.length;) {
      if (covered[i]) { i++; continue; }
      const start = i;
      while (i < covered.length && !covered[i]) i++;
      const text = unit.source_text.slice(start, i);
      if (/^[\s,;:.]*$/u.test(text)) continue;
      const base = { source_unit_id: unit.object_id, source_locator: unit.source_locator, source_unit_sha256: unit.source_text_sha256, source_span_utf16: [start, i], source_text: text, source_text_sha256: sha256(text) };
      // Finite exact grammar between the supplied BVG frame/actions; no role,
      // review decision or effect is manufactured for a connector.
      if (unit.object_id === sid(294) && [', etwa durch ', ' und '].includes(text)) connectors.push({ ...base, disposition: 'GRAMMATICAL_CONNECTOR_BETWEEN_EXPLICITLY_REVIEWED_CLAUSES_NOT_A_REVIEW_OBJECT' });
      else {
        const clause = text.trim();
        const clauseStart = start + text.indexOf(clause);
        uncovered.push({ ...base, source_span_utf16: [clauseStart, clauseStart + clause.length], source_text: clause, source_text_sha256: sha256(clause), status: 'SOURCE_SPAN_WITHOUT_EXPLICIT_FACH_AUTHORITY', counts_as_effect_object: null });
      }
    }
  }
  return { uncovered_source_spans: uncovered, grammar_separators: connectors };
}

export function buildP25() {
  assert.equal(sha256(read(`${LEDGER}manifest.json`)), '8711be87e5cc9965f78d799451e1c643422f512a4b2a5aa626caf9eb71b934d0');
  const manifest = json(`${LEDGER}manifest.json`);
  for (const ref of [...manifest.source_unit_shards, ...manifest.effect_atom_shards]) assert.equal(sha256(read(`${LEDGER}${ref.path}`)), ref.file_sha256);
  const full = json(SOURCE);
  const units = json(`${LEDGER}source-units-p25-p30.json`).records.filter(r => r.pdf_page === 25);
  const atoms = json(`${LEDGER}effect-atoms-p25-p30.json`).records.filter(r => r.pdf_page === 25);
  assert.deepEqual(units.map(r => r.source_unit_id), Array.from({ length: 12 }, (_, i) => sid(291 + i)));
  assert.deepEqual(full.source_units.map(r => r.source_unit_id), units.map(r => r.source_unit_id));
  assert.deepEqual(full.artifact, manifest.ledger_metadata.artifact);
  const body = read(HANDOFF);
  assert.equal(sha256(body), '9889ee1ba703a4f9959fca5f249f9013b586a0f56335f222e5511fe3152d5fa5');
  const records = [];
  for (const unit of units) {
    const source = full.source_units.find(r => r.source_unit_id === unit.source_unit_id);
    for (const key of ['pdf_page', 'pdf_pages', 'source_locator', 'source_text_sha256']) assert.deepEqual(source[key], unit[key]);
    assert.equal(sha256(source.source_text), unit.source_text_sha256);
    assert.ok(body.includes(unit.source_locator) && body.includes(unit.source_text_sha256));
    records.push({ object_id: unit.source_unit_id, source_unit_id: unit.source_unit_id, source_page: 25, pdf_pages: unit.pdf_pages, source_locator: unit.source_locator, source_text: source.source_text, source_text_sha256: unit.source_text_sha256, source_object_kind: 'SOURCE_UNIT' });
  }
  const byId = id => records.find(r => r.object_id === id);
  for (const atom of atoms) {
    assert.equal(sha256(atom.policy_action), atom.source_text_sha256);
    assert.ok(byId(atom.source_unit_id).source_text.includes(atom.policy_action));
    records.push({ object_id: atom.atom_id, source_unit_id: atom.source_unit_id, source_page: 25, pdf_pages: atom.pdf_pages, source_locator: atom.source_locator, source_text: atom.policy_action, source_text_sha256: atom.source_text_sha256, source_object_kind: 'SOURCE_ATOM' });
  }
  function section(n) {
    return body.split(`## \`SU${String(n).padStart(4, '0')}\``)[1]?.split('\n## ')[0].split('\n### Batch-wide')[0].trim();
  }
  function excerpt(n, hash) {
    const s = section(n);
    assert.ok(s);
    if (n === 296 || [293, 297, 300].includes(n)) return s.slice(s.indexOf('\n') + 1).trim();
    const lines = s.split('\n');
    const matches = lines.flatMap((line, i) => line.includes(hash) && /^\s*- /.test(line) ? [i] : []);
    assert.equal(matches.length, 1, `Missing/ambiguous authority: ${n}/${hash}`);
    const start = matches[0];
    const indent = lines[start].match(/^ */)[0].length;
    let end = start + 1;
    while (end < lines.length && (lines[end] === '' || lines[end].match(/^ */)[0].length > indent)) end++;
    return lines.slice(start, end).join('\n').trimEnd();
  }
  function decide(row, text) {
    const state = text.match(/`(EXPLICIT_FACH_APPROVED|REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON|SOURCE_ATOM_VERSIONED_ZERO_COUNT|NON_EFFECT_[A-Z_]+)`/)?.[1];
    assert.ok(state, `Missing explicit state: ${row.object_id}`);
    Object.assign(row, { terminal_fach_state: state, counts_as_effect_object: [RNA, APPROVED].includes(state), batch_issue_comment_id: COMMENT, fach_issue_comment_id: COMMENT, authoritative_fach_text: text, fach_source_sha256: sha256(text) });
    if (state === RNA) {
      row.exact_reason_code = text.match(/code `([^`]+)`/)?.[1];
      row.exact_reason = text.match(/Exact reason: ([^\n]+)/)?.[1];
      assert.ok(row.exact_reason_code && row.exact_reason);
    }
    if (state === APPROVED) {
      row.impact_direction = text.match(/`((?:STRONG_POSITIVE|POSITIVE|AMBIVALENT)_[^`]+)`/)?.[1];
      assert.ok(row.impact_direction);
      const evidence = text.match(/(?:Evidence|evidence):? `([^`]+)`/)?.[1];
      if (evidence) row.evidence_level = evidence;
      // No grade is invented when the authority supplies none (SU0299 A06 C02).
    }
  }
  for (const [n, a, ordinal, hash] of CHILDREN) {
    const text = excerpt(n, hash);
    const clause = [...text.slice(0, text.indexOf(hash)).matchAll(/`([^`]+)`/g)].at(-1)?.[1];
    assert.equal(sha256(clause), hash, `Exact supplied clause/hash mismatch: ${n}`);
    const parent = a === null ? sid(n) : aid(n, a);
    assert.ok(byId(parent).source_text.includes(clause));
    const unit = byId(sid(n));
    const start = unit.source_text.indexOf(clause);
    const row = { object_id: `${parent}-C${String(ordinal).padStart(2, '0')}-${hash.slice(0, 12)}`, source_unit_id: sid(n), parent_object_ids: [parent], source_page: 25, pdf_pages: unit.pdf_pages, source_locator: unit.source_locator, source_span_utf16: [start, start + clause.length], source_text: clause, source_text_sha256: hash, source_object_kind: 'DETERMINISTIC_EXACT_SPAN_CHILD' };
    decide(row, text);
    records.push(row);
  }
  for (const row of records.filter(r => r.source_object_kind === 'SOURCE_ATOM' || [sid(293), sid(297), sid(300)].includes(r.object_id))) decide(row, excerpt(Number(row.source_unit_id.slice(-4)), row.source_text_sha256));
  for (const parent of [aid(294, 1), aid(298, 1), aid(299, 6)]) byId(parent).superseded_by = records.filter(r => r.parent_object_ids?.includes(parent)).map(r => r.object_id);
  for (const unit of records.filter(r => r.source_object_kind === 'SOURCE_UNIT' && !r.terminal_fach_state)) Object.assign(unit, { terminal_fach_state: 'SOURCE_CONTAINER_ZERO_COUNT', counts_as_effect_object: false, batch_issue_comment_id: COMMENT, covered_by: records.filter(r => r.source_unit_id === unit.object_id && r.object_id !== unit.object_id).map(r => r.object_id) });
  const coverage = sourceCoverage(records);
  const active = records.filter(r => r.counts_as_effect_object);
  const result = {
    schema_version: 'woek-explicit-fach-handoff-2.0', handoff_id: 'BE-SPD-P25-CANONICAL-EXPLICIT-FACH-2026-V1', base_main_commit: '989b903b866ad17b16b18cc0b5f04becaa7787ba', artifact: manifest.ledger_metadata.artifact,
    authoritative_markdowns: [{ issue_comment_id: COMMENT, issue_comment_url: `https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-${COMMENT}`, ...pin(HANDOFF) }],
    controller: { issue_comment_id: 5558179043, issue_comment_url: 'https://github.com/sustynats/wirkungsoekonomie.de/issues/241#issuecomment-5558179043' },
    source_ledger: { ...pin(`${LEDGER}manifest.json`), disposition: 'SOURCE_SCAFFOLD_ONLY_NOT_FACH_AUTHORITY' }, full_source_proof: pin(SOURCE),
    protected_source_files: fs.readdirSync(path.join(APP_ROOT, LEDGER)).sort().map(name => pin(`${LEDGER}${name}`)),
    protected_handoffs: [22, 23, 24].map(p => pin(`${DIR}berlin-2026-spd-p${p}-explicit-v1.json`)),
    assessment_contract_verbatim: body.slice(body.indexOf('### Assessment contract'), body.indexOf('## `SU0291`')).trimEnd(),
    cross_object_guards_verbatim: body.slice(body.indexOf('### Batch-wide'), body.indexOf('### Required technical')).trimEnd(),
    terminal_records: records, grammar_separators: coverage.grammar_separators,
    coverage: {
      source_unit_ids: units.map(r => r.source_unit_id), original_atom_ids: atoms.map(r => r.atom_id), generated_child_ids: records.filter(r => r.parent_object_ids).map(r => r.object_id), active_terminal_review_leaf_ids: active.map(r => r.object_id),
      explicit_fach_approved_ids: active.filter(r => r.terminal_fach_state === APPROVED).map(r => r.object_id), reviewed_not_assessable_ids: active.filter(r => r.terminal_fach_state === RNA).map(r => r.object_id), zero_count_ids: records.filter(r => !r.counts_as_effect_object).map(r => r.object_id),
      uncovered_source_spans: coverage.uncovered_source_spans,
      terminal_pages: coverage.uncovered_source_spans.length ? [] : [25],
      cross_page_objects_consumed_once: [sid(302)],
      gate: coverage.uncovered_source_spans.length ? 'BE_SPD_2026_P25_FACH_INCOMPLETE_SOURCE_AUTHORITY_GAP' : 'BE_SPD_2026_P25_FACH_COMPLETE_PASS_SOURCE_BOUND_AFTER_LOSSLESS_MATERIALISATION',
      release_or_residual_activation_allowed: coverage.uncovered_source_spans.length === 0,
    },
    constraints: { fach_synthesized: false, protected_fach_or_source_overwritten: false, generic_delegated_rnaa_used_as_fach: false, dns_synthesized: false, recommendation_synthesized: false, score_synthesized: false, programme_terminal_claimed: false, vercel_action_triggered: false },
  };
  result.descriptor_sha256 = sha256(JSON.stringify(result));
  return result;
}
export function materialize({ check = false } = {}) {
  const result = buildP25();
  if (check) assert.equal(read(OUTPUT), encode(result));
  else fs.writeFileSync(path.join(APP_ROOT, OUTPUT), encode(result));
  return result.coverage;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.slice(2).every(arg => arg === '--check'));
  console.log(JSON.stringify(materialize({ check: process.argv.includes('--check') }), null, 2));
}
