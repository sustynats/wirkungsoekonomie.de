import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {generateKeyPairSync} from 'node:crypto';
import {archivePublicKey, sealRawBytes, unsealRawBytes, sealRawDirectory} from '../../scripts/news/sealed-raw-output.mjs';

const keys = generateKeyPairSync('rsa', {modulusLength: 3072, publicKeyEncoding: {type: 'spki', format: 'pem'}, privateKeyEncoding: {type: 'pkcs8', format: 'pem'}});
const bytes = Buffer.from('{\n  "answer": "Nicht freigegebener Text — üöä", "usage": {"output_tokens": 37}\n}\n');

test('sealed paid originals restore exact bytes including whitespace and Unicode', () => {
  const envelope = sealRawBytes(bytes, 'test-original.json', keys.publicKey);
  assert.equal(envelope.key_id, archivePublicKey(keys.publicKey).id);
  assert.ok(!JSON.stringify(envelope).includes('freigegebener'));
  assert.ok(!JSON.stringify(envelope).includes('test-original.json'));
  assert.deepEqual(unsealRawBytes(envelope, keys.privateKey), {filename: 'test-original.json', bytes});
  assert.notEqual(sealRawBytes(bytes, 'test-original.json', keys.publicKey).ciphertext, envelope.ciphertext);
});

test('tampering with ciphertext, nonce, key binding or archive identity fails without plaintext', () => {
  const original = sealRawBytes(bytes, 'test.json', keys.publicKey);
  for (const field of ['ciphertext', 'nonce', 'wrapped_key', 'archive_id', 'key_id', 'algorithm', 'archive_version']) {
    const altered = {...original, [field]: 'changed'};
    assert.throws(() => unsealRawBytes(altered, keys.privateKey), error => error.message === 'RAW_ARCHIVE_VERIFICATION_FAILED');
  }
});

test('weak keys, traversal and oversized input are rejected', () => {
  const weak = generateKeyPairSync('rsa', {modulusLength: 2048}).publicKey.export({type: 'spki', format: 'pem'});
  assert.throws(() => archivePublicKey(weak), /RAW_ARCHIVE_KEY_INVALID/);
  for (const name of ['../test.json', '/test.json', 'test.txt']) assert.throws(() => sealRawBytes(bytes, name, keys.publicKey), /RAW_ARCHIVE_INPUT_INVALID/);
  assert.throws(() => sealRawBytes(Buffer.alloc(17 * 1024 * 1024), 'test.json', keys.publicKey), /RAW_ARCHIVE_INPUT_INVALID/);
});

test('directories retain every original unchanged and expose only sealed artifact files', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-sealed-raw-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const source = path.join(root, 'raw'), output = path.join(root, 'sealed');
  fs.mkdirSync(source); fs.writeFileSync(path.join(source, 'test.json'), bytes);
  assert.deepEqual(sealRawDirectory(source, output, keys.publicKey), {sealed_files: 1, original_bytes: bytes.length});
  assert.deepEqual(fs.readFileSync(path.join(source, 'test.json')), bytes);
  assert.deepEqual(fs.readdirSync(output), ['0001.sealed.json']);
  assert.deepEqual(unsealRawBytes(JSON.parse(fs.readFileSync(path.join(output, '0001.sealed.json'))), keys.privateKey).bytes, bytes);
  assert.throws(() => sealRawDirectory(source, output, keys.publicKey), /EEXIST/);
  assert.deepEqual(sealRawDirectory(path.join(root, 'missing'), path.join(root, 'other'), keys.publicKey), {sealed_files: 0, original_bytes: 0});
  fs.symlinkSync(path.join(source, 'test.json'), path.join(source, 'link.json'));
  assert.throws(() => sealRawDirectory(source, path.join(root, 'reject'), keys.publicKey), /RAW_ARCHIVE_INPUT_INVALID/);
  assert.ok(!fs.existsSync(path.join(root, 'reject')));
});

test('public workflows validate the key before paid work and never upload the plaintext directory', () => {
  for (const [file, paidStep] of [['redaktionsworker.yml', 'Draft open editorial requests'], ['wirkungsticker.yml', 'Import, analyze (one call per story)']]) {
    const workflow = fs.readFileSync(new URL(`../../.github/workflows/${file}`, import.meta.url), 'utf8');
    assert.ok(workflow.indexOf('sealed-raw-output.mjs --check-key') < workflow.indexOf(paidStep));
    assert.match(workflow, /id: sealed_raw/);
    assert.match(workflow, /steps\.sealed_raw\.outcome == 'success'/);
    assert.match(workflow, /path: \$\{\{ runner\.temp \}\}\/sealed-paid-output/);
    assert.ok(!/path:.*(?:ai-raw-output|editorial-raw-output)/.test(workflow));
  }
});
