#!/usr/bin/env node

/**
 * Reconcile the complete Berlin SPD source ledger with the canonical final PDF.
 *
 * This is deliberately Fach-neutral. It verifies source bytes, locators, source
 * text identities and atom membership, then emits a complete old-to-new
 * relation matrix. Layout-only PDF text-layer variants are enumerated without
 * changing letters, words or punctuation. `--check` is write-free.
 */

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  loadBerlinSpdReviewBundle,
  validateBerlinSpdReviewBundle,
} from './check-berlin-spd-fach-review.mjs';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUTPUT_DIR = path.join(
  APP_ROOT,
  'data/state-programmes/source-integrity',
);
const MATRIX_PATH = path.join(OUTPUT_DIR, 'berlin-2026-spd-canonical-parity-v1.json');
const RETURN_PATH = path.join(OUTPUT_DIR, 'berlin-2026-spd-fach-return-v1.json');

const ARTIFACT = {
  artifact_id: 'BE-AGH-2026-SPD-WAHLPROGRAMM',
  url: 'https://spd.berlin/media/2026/08/SPD_Berlin_Wahlprogramm_20260521-v4-1.pdf',
  sha256: '379f8cfe51309c2782c88a74ef06777d9ef0c07d7c256ddf1d9f361111e6ffc9',
  byte_length: 663059,
  page_count: 66,
};
const SOURCE_STOP = {
  issue: 240,
  issue_comment_id: 5466605879,
  issue_comment_url:
    'https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5466605879',
};
const RELATIONS = [
  'UNCHANGED_HASH_IDENTICAL',
  'TEXT_CHANGED_REVIEW_REQUIRED',
  'REMOVED',
  'ADDED',
  'BOUNDARY_CHANGED',
];

const PYTHON_EXTRACT = String.raw`
import json
import re
import sys

import fitz

artifact_path = sys.argv[1]
source_units = json.load(sys.stdin)
locator_re = re.compile(r"p(\d+):b(\d+)@([\d.-]+),([\d.-]+),([\d.-]+),([\d.-]+)")

document = fitz.open(artifact_path)
result = {}
for unit in source_units:
    groups = []
    refs = []
    for locator in unit["source_locator"].split(";"):
        match = locator_re.fullmatch(locator)
        if not match:
            raise SystemExit(f"{unit['source_unit_id']}: malformed locator {locator}")
        page_number, one_based_block = map(int, match.group(1, 2))
        expected_bbox = tuple(map(float, match.group(3, 4, 5, 6)))
        blocks = document[page_number - 1].get_text("dict", sort=False)["blocks"]
        block = blocks[one_based_block - 1]
        if "lines" not in block:
            raise SystemExit(f"{unit['source_unit_id']}: locator resolves to non-text block")
        if max(abs(float(actual) - expected) for actual, expected in zip(block["bbox"], expected_bbox)) > 0.03:
            raise SystemExit(f"{unit['source_unit_id']}: locator bounding box mismatch")
        groups.append([
            "".join(str(span.get("text", "")) for span in line.get("spans", []))
            for line in block.get("lines", [])
        ])
        refs.append({"page": page_number, "block": one_based_block})
    result[unit["source_unit_id"]] = {"line_groups": groups, "refs": refs}

print(json.dumps({"page_count": len(document), "units": result}, ensure_ascii=False, separators=(",", ":")))
`;

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => (
      `${JSON.stringify(key)}:${canonicalJson(value[key])}`
    )).join(',')}}`;
  }
  return JSON.stringify(value);
}

function normalizeWhitespace(value) {
  return value.normalize('NFC').replace(/\s+/gu, ' ').trim();
}

function comparisonKey(value) {
  return [...value.normalize('NFC')]
    .filter((character) => /[\p{L}\p{N}]/u.test(character))
    .join('')
    .toLocaleLowerCase('de-DE');
}

function parseArgs(argv) {
  let artifact;
  let check = false;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--artifact') {
      artifact = argv[index + 1];
      index += 1;
    } else if (argument === '--check') {
      check = true;
    } else {
      throw new Error(`unknown argument: ${argument}`);
    }
  }
  assert.ok(artifact, '--artifact is required');
  return { artifact: path.resolve(artifact), check };
}

function extractArtifact(artifactPath, sourceUnits) {
  return JSON.parse(execFileSync(
    'python3',
    ['-c', PYTHON_EXTRACT, artifactPath],
    {
      encoding: 'utf8',
      input: JSON.stringify(sourceUnits),
      maxBuffer: 64 * 1024 * 1024,
    },
  ));
}

function enumerateLineVariants(lineGroups) {
  const lines = lineGroups.flat();
  let variants = [{ text: lines[0] ?? '', operations: [] }];
  for (let index = 1; index < lines.length; index += 1) {
    const next = lines[index];
    const expanded = [];
    for (const variant of variants) {
      expanded.push({ text: `${variant.text} ${next}`, operations: variant.operations });
      if (variant.text.endsWith('-') && /^\p{Ll}/u.test(next)) {
        expanded.push({
          text: `${variant.text.slice(0, -1)}${next}`,
          operations: [...variant.operations, 'PDF_LINE_END_DEHYPHENATION'],
        });
      }
    }
    variants = expanded;
  }
  return variants;
}

function enumerateBinaryTextVariants(seed, regex, operation) {
  const matches = [...seed.text.matchAll(regex)];
  if (matches.length === 0) return [seed];
  let variants = [seed];
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const match = matches[index];
    const start = match.index;
    const end = start + match[0].length;
    const withoutSpace = `${match[1]})`;
    const withSpace = `${match[1]} )`;
    variants = variants.flatMap((variant) => [
      {
        text: `${variant.text.slice(0, start)}${withoutSpace}${variant.text.slice(end)}`,
        operations: variant.operations,
      },
      {
        text: `${variant.text.slice(0, start)}${withSpace}${variant.text.slice(end)}`,
        operations: [...variant.operations, operation],
      },
    ]);
  }
  return variants;
}

function canonicalCandidates(lineGroups) {
  const candidates = new Map();
  for (const lineVariant of enumerateLineVariants(lineGroups)) {
    const normalized = normalizeWhitespace(lineVariant.text);
    const tocVariants = normalized.includes('\b.')
      ? [
          { text: normalized, operations: lineVariant.operations },
          {
            text: normalized.replaceAll('\b.', '\b .'),
            operations: [...lineVariant.operations, 'PDF_TOC_BACKSPACE_SPACING'],
          },
        ]
      : [{ text: normalized, operations: lineVariant.operations }];
    for (const tocVariant of tocVariants) {
      const crossReferenceVariants = enumerateBinaryTextVariants(
        tocVariant,
        /(\(→ siehe Kapitel [^)]*?)\s*\)/gu,
        'PDF_CROSS_REFERENCE_CLOSE_SPACING',
      );
      for (const variant of crossReferenceVariants) {
        const text = normalizeWhitespace(variant.text);
        const operations = [...new Set(variant.operations)].sort();
        candidates.set(text, operations);
      }
    }
  }
  return [...candidates].map(([text, operations]) => ({ text, operations }));
}

function relationCounts(relations) {
  return Object.fromEntries(RELATIONS.map((relation) => [
    relation,
    relations.filter((item) => item.relation === relation).length,
  ]));
}

function withDescriptor(value) {
  const result = structuredClone(value);
  result.descriptor_sha256 = sha256(canonicalJson(result));
  return result;
}

function expectedOutputs(artifactPath) {
  const artifactBytes = fs.readFileSync(artifactPath);
  assert.equal(artifactBytes.length, ARTIFACT.byte_length, 'SPD artifact byte length mismatch');
  assert.equal(sha256(artifactBytes), ARTIFACT.sha256, 'SPD artifact SHA-256 mismatch');

  const bundle = loadBerlinSpdReviewBundle();
  validateBerlinSpdReviewBundle(bundle);
  const extracted = extractArtifact(artifactPath, bundle.sourceUnits);
  assert.equal(extracted.page_count, ARTIFACT.page_count, 'SPD artifact page count mismatch');

  const sourceTextByUnit = new Map();
  const sourceUnitRelations = bundle.sourceUnits.map((unit) => {
    const extraction = extracted.units[unit.source_unit_id];
    assert.ok(extraction, `${unit.source_unit_id}: canonical extraction missing`);
    const matches = canonicalCandidates(extraction.line_groups)
      .filter((candidate) => sha256(candidate.text) === unit.source_text_sha256);
    assert.ok(matches.length > 0, `${unit.source_unit_id}: no layout-neutral canonical hash match`);
    matches.sort((left, right) => (
      left.operations.length - right.operations.length
      || left.operations.join('|').localeCompare(right.operations.join('|'))
    ));
    const selected = matches[0];
    sourceTextByUnit.set(unit.source_unit_id, selected.text);
    return {
      object_type: 'SOURCE_UNIT',
      old_object_id: unit.source_unit_id,
      new_object_id: unit.source_unit_id,
      old_source_text_sha256: unit.source_text_sha256,
      new_source_text_sha256: sha256(selected.text),
      old_source_locator: unit.source_locator,
      new_source_locator: unit.source_locator,
      pdf_pages: unit.pdf_pages,
      canonical_normalization: selected.operations.length > 0
        ? selected.operations
        : ['NFC_WHITESPACE_ONLY'],
      relation: 'UNCHANGED_HASH_IDENTICAL',
    };
  });

  const effectAtomRelations = bundle.effectAtoms.map((atom) => {
    const canonicalAtomText = normalizeWhitespace(atom.policy_action);
    assert.equal(
      sha256(canonicalAtomText),
      atom.source_text_sha256,
      `${atom.atom_id}: atom text hash mismatch`,
    );
    const parentText = sourceTextByUnit.get(atom.source_unit_id);
    assert.ok(
      comparisonKey(parentText).includes(comparisonKey(canonicalAtomText)),
      `${atom.atom_id}: atom text is absent from canonical parent`,
    );
    return {
      object_type: 'EFFECT_ATOM',
      old_object_id: atom.atom_id,
      new_object_id: atom.atom_id,
      parent_source_unit_id: atom.source_unit_id,
      old_source_text_sha256: atom.source_text_sha256,
      new_source_text_sha256: sha256(canonicalAtomText),
      old_source_locator: atom.source_locator,
      new_source_locator: atom.source_locator,
      pdf_pages: atom.pdf_pages,
      relation: 'UNCHANGED_HASH_IDENTICAL',
    };
  });

  const relations = [...sourceUnitRelations, ...effectAtomRelations];
  const counts = relationCounts(relations);
  assert.equal(counts.UNCHANGED_HASH_IDENTICAL, relations.length);
  assert.equal(counts.TEXT_CHANGED_REVIEW_REQUIRED, 0);
  assert.equal(counts.REMOVED, 0);
  assert.equal(counts.ADDED, 0);
  assert.equal(counts.BOUNDARY_CHANGED, 0);

  const p22 = sourceUnitRelations.find((item) => item.old_object_id === 'BE-SPD-2026-SU-0252');
  assert.ok(p22);
  assert.equal(p22.old_source_text_sha256, 'c417236a63d0699d60ce0a849404ee969f2fe3ec357e6671f1a220002d890de9');

  const matrix = withDescriptor({
    schema_version: '1.0.0',
    matrix_id: 'WOEK-BE-SPD-2026-CANONICAL-PARITY-V1',
    generated_at: '2026-08-31',
    artifact: ARTIFACT,
    source_integrity_stop: SOURCE_STOP,
    relation_vocabulary: RELATIONS,
    regeneration_contract: {
      extractor: 'PyMuPDF unsorted text blocks pinned by page, block index and bounding box',
      source_unit_identity: 'NFC whitespace-normalized located text with enumerated layout-only variants',
      atom_identity: 'NFC whitespace-normalized policy_action SHA-256 plus full canonical-parent membership',
      allowed_layout_only_variants: [
        'PDF_LINE_END_DEHYPHENATION',
        'PDF_TOC_BACKSPACE_SPACING',
        'PDF_CROSS_REFERENCE_CLOSE_SPACING',
      ],
      semantic_rewrite_allowed: false,
      fach_fields_read_or_generated: false,
    },
    summary: {
      source_unit_count: sourceUnitRelations.length,
      effect_atom_count: effectAtomRelations.length,
      total_object_count: relations.length,
      relation_counts: counts,
      fach_return_object_count: 0,
      canonical_parity_gate: 'PASS_EXACT_ARTIFACT_ALL_OBJECTS_UNCHANGED_HASH_IDENTICAL',
    },
    p22_stop_resolution: {
      source_unit_id: 'BE-SPD-2026-SU-0252',
      source_text_sha256: p22.new_source_text_sha256,
      relation: p22.relation,
      exact_canonical_atom_ids: [
        'BE-SPD-2026-SU-0252-A03',
        'BE-SPD-2026-SU-0252-A04',
        'BE-SPD-2026-SU-0252-A05',
        'BE-SPD-2026-SU-0252-A06',
      ],
      result: 'CURRENT_LEDGER_ALREADY_CONTAINS_CANONICAL_FINAL_PLANNING_AND_PROCUREMENT_PLUS_LEITSTELLE_OBJECTS',
    },
    relations,
  });

  const fachReturn = withDescriptor({
    schema_version: '1.0.0',
    manifest_id: 'WOEK-BE-SPD-2026-CANONICAL-FACH-RETURN-V1',
    generated_at: '2026-08-31',
    artifact: ARTIFACT,
    source_integrity_stop: SOURCE_STOP,
    matrix: {
      path: 'data/state-programmes/source-integrity/berlin-2026-spd-canonical-parity-v1.json',
      descriptor_sha256: matrix.descriptor_sha256,
    },
    retention_rule: 'ONLY_UNCHANGED_HASH_IDENTICAL_OBJECTS_MAY_RETAIN_EXISTING_EXACT_FACH',
    protected_existing_fach_handoff_scope: {
      physical_pages: 'P1-P21',
      cross_page_object: 'BE-SPD-2026-SU-0247',
      technical_materialization_status: 'SEPARATE_LOSSLESS_HANDOFF_MATERIALIZATION_REQUIRED',
    },
    changed_or_new_canonical_objects_requiring_fach_review: [],
    removed_objects: [],
    next_unreviewed_source_order_frontier: {
      physical_page: 22,
      reason: 'P22 is the next source-order Fach frontier after canonical parity; it is not a source-version return object.',
    },
    summary: {
      changed_or_new_fach_return_count: 0,
      removed_count: 0,
      source_integrity_stop_status: 'CLEARED_CANONICAL_PARITY_PASS',
      fach_synthesis_performed: false,
    },
  });

  return new Map([
    [MATRIX_PATH, Buffer.from(`${JSON.stringify(matrix, null, 2)}\n`, 'utf8')],
    [RETURN_PATH, Buffer.from(`${JSON.stringify(fachReturn, null, 2)}\n`, 'utf8')],
  ]);
}

export function materializeBerlinSpdCanonicalParity({ artifact, check = false }) {
  const outputs = expectedOutputs(artifact);
  for (const [target, expected] of outputs) {
    if (check) {
      assert.ok(fs.existsSync(target), `missing deterministic output ${target}`);
      assert.equal(sha256(fs.readFileSync(target)), sha256(expected), `${target}: deterministic byte drift`);
    } else {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, expected);
    }
  }
  const matrix = JSON.parse(outputs.get(MATRIX_PATH));
  return {
    mode: check ? 'DETERMINISM_CHECK' : 'MATERIALIZE',
    artifact_sha256: ARTIFACT.sha256,
    source_units: matrix.summary.source_unit_count,
    effect_atoms: matrix.summary.effect_atom_count,
    total_objects: matrix.summary.total_object_count,
    relation_counts: matrix.summary.relation_counts,
    fach_return_objects: matrix.summary.fach_return_object_count,
    matrix_descriptor_sha256: matrix.descriptor_sha256,
    gate: matrix.summary.canonical_parity_gate,
  };
}

export function main() {
  const result = materializeBerlinSpdCanonicalParity(parseArgs(process.argv.slice(2)));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
