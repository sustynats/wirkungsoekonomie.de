#!/usr/bin/env node

/**
 * Re-materialize the SPD terminal review ledger from its approved decision
 * records, but only after binding every source unit to the byte-pinned PDF.
 *
 * This script does not derive editorial decisions from programme text. The
 * versioned terminal records are the decision input; the PDF supplies the
 * independently verified page/block provenance. `--check` is write-free.
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
const LEDGER_DIR = path.join(
  APP_ROOT,
  'data/state-programmes/fach-reviews/berlin-2026-spd-v1',
);
const HOOK_PATH = path.join(
  APP_ROOT,
  'data/state-programmes/fach-coverage-hooks/berlin-2026-spd-v1.json',
);
const ARTIFACT_SHA256 = '379f8cfe51309c2782c88a74ef06777d9ef0c07d7c256ddf1d9f361111e6ffc9';
const ARTIFACT_BYTES = 663059;
const ARTIFACT_PAGES = 66;

const PYTHON_ARTIFACT_BINDING = String.raw`
import json
import re
import sys
import unicodedata

import fitz

artifact_path = sys.argv[1]
source_units = json.load(sys.stdin)
locator_re = re.compile(
    r"p(\d+):b(\d+)@([\d.-]+),([\d.-]+),([\d.-]+),([\d.-]+)"
)

def comparison_key(value):
    return "".join(
        character.casefold()
        for character in unicodedata.normalize("NFC", value)
        if character.isalnum()
    )

document = fitz.open(artifact_path)
if len(document) != 66:
    raise SystemExit(f"SPD artifact page-count mismatch: expected 66, got {len(document)}")

bound_refs = 0
bound_pages = set()
for unit in source_units:
    extracted = []
    for locator in unit["source_locator"].split(";"):
        match = locator_re.fullmatch(locator)
        if not match:
            raise SystemExit(f"{unit['source_unit_id']}: malformed source locator {locator}")
        page_number, one_based_block = map(int, match.group(1, 2))
        expected_bbox = tuple(map(float, match.group(3, 4, 5, 6)))
        if page_number < 1 or page_number > len(document):
            raise SystemExit(f"{unit['source_unit_id']}: locator page outside artifact")
        blocks = document[page_number - 1].get_text("dict", sort=False)["blocks"]
        block_index = one_based_block - 1
        if block_index < 0 or block_index >= len(blocks):
            raise SystemExit(f"{unit['source_unit_id']}: locator block outside artifact")
        block = blocks[block_index]
        if "lines" not in block:
            raise SystemExit(f"{unit['source_unit_id']}: locator resolves to a non-text block")
        if max(abs(float(actual) - expected) for actual, expected in zip(block["bbox"], expected_bbox)) > 0.03:
            raise SystemExit(f"{unit['source_unit_id']}: locator bounding box mismatch")
        extracted.append(" ".join(
            "".join(str(span.get("text", "")) for span in line.get("spans", []))
            for line in block.get("lines", [])
        ))
        bound_refs += 1
        bound_pages.add(page_number)

    expected_excerpt = comparison_key(unit["source_excerpt"].removesuffix("…"))
    actual_text = comparison_key(" ".join(extracted))
    if expected_excerpt not in actual_text and actual_text not in expected_excerpt:
        raise SystemExit(f"{unit['source_unit_id']}: source excerpt does not bind to located PDF text")

print(json.dumps({
    "artifact_pages": len(document),
    "bound_source_units": len(source_units),
    "bound_block_refs": bound_refs,
    "pages_with_source_units": len(bound_pages),
}, separators=(",", ":")))
`;

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
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

function serializeHook(hook) {
  const pretty = JSON.stringify(hook, null, 2);
  const expandedMatchKeys = [
    '    "match_keys": [',
    '      "party",',
    '      "artifact_id",',
    '      "artifact_sha256"',
    '    ]',
  ].join('\n');
  const compactMatchKeys = '    "match_keys": ["party", "artifact_id", "artifact_sha256"]';
  assert.ok(pretty.includes(expandedMatchKeys), 'SPD hook match-key contract changed');
  return `${pretty.replace(expandedMatchKeys, compactMatchKeys)}\n`;
}

function artifactBinding(artifactPath, sourceUnits) {
  const result = execFileSync(
    'python3',
    ['-c', PYTHON_ARTIFACT_BINDING, artifactPath],
    {
      encoding: 'utf8',
      input: JSON.stringify(sourceUnits),
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  return JSON.parse(result);
}

function expectedFiles(bundle) {
  const files = new Map();
  const refs = [
    ...bundle.manifest.source_unit_shards,
    ...bundle.manifest.effect_atom_shards,
  ];
  for (const ref of refs) {
    const target = path.join(LEDGER_DIR, ref.path);
    const parsed = JSON.parse(fs.readFileSync(target, 'utf8'));
    files.set(target, Buffer.from(`${JSON.stringify(parsed)}\n`, 'utf8'));
  }
  files.set(
    path.join(LEDGER_DIR, 'manifest.json'),
    Buffer.from(`${JSON.stringify(bundle.manifest)}\n`, 'utf8'),
  );
  files.set(HOOK_PATH, Buffer.from(serializeHook(bundle.hook), 'utf8'));
  return files;
}

export function materializeBerlinSpdReview({ artifact, check = false }) {
  const artifactBytes = fs.readFileSync(artifact);
  assert.equal(artifactBytes.length, ARTIFACT_BYTES, 'SPD artifact byte length mismatch');
  assert.equal(sha256(artifactBytes), ARTIFACT_SHA256, 'SPD artifact SHA-256 mismatch');

  const bundle = loadBerlinSpdReviewBundle();
  const validated = validateBerlinSpdReviewBundle(bundle);
  const binding = artifactBinding(artifact, bundle.sourceUnits);
  assert.equal(binding.artifact_pages, ARTIFACT_PAGES);
  assert.equal(binding.bound_source_units, bundle.sourceUnits.length);

  const files = expectedFiles(bundle);
  for (const [target, expectedBytes] of files) {
    if (check) {
      assert.ok(fs.existsSync(target), `determinism check failed: missing ${target}`);
      const actualBytes = fs.readFileSync(target);
      assert.equal(
        sha256(actualBytes),
        sha256(expectedBytes),
        `determinism check failed: byte mismatch for ${target}`,
      );
    } else {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, expectedBytes);
    }
  }

  return {
    mode: check ? 'DETERMINISM_CHECK' : 'MATERIALIZE',
    artifact_sha256: ARTIFACT_SHA256,
    artifact_pages: binding.artifact_pages,
    bound_source_units: binding.bound_source_units,
    bound_block_refs: binding.bound_block_refs,
    source_units: validated.source_units,
    effect_atoms: validated.effect_atoms,
    logical_descriptor_sha256: validated.logical_descriptor_sha256,
    hook_descriptor_sha256: validated.hook_descriptor_sha256,
    deterministic_files: files.size,
    gate: 'PASS',
  };
}

export function main() {
  const args = parseArgs(process.argv.slice(2));
  process.stdout.write(`${JSON.stringify(materializeBerlinSpdReview(args), null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
