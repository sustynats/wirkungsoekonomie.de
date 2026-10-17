// Paid originals stay byte-identical on the runner. Only authenticated,
// encrypted copies may enter artifacts of this public repository.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash, createPublicKey, createPrivateKey, randomBytes, randomUUID,
  publicEncrypt, privateDecrypt, createCipheriv, createDecipheriv, constants} from 'node:crypto';
import {gzipSync, gunzipSync} from 'node:zlib';

const VERSION = 'woek-paid-raw-1';
const ALGORITHM = 'RSA-OAEP-SHA256+A256GCM';
const MAX_FILE_BYTES = 16 * 1024 * 1024;
const MAX_TOTAL_BYTES = 64 * 1024 * 1024;
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const defaultKey = new URL('../../_internal/chatgpt-bridge/public-key.pem', import.meta.url);
const oaep = {padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256'};
const aad = envelope => Buffer.from(JSON.stringify([VERSION, envelope.archive_id, envelope.key_id]));

export function archivePublicKey(pem) {
  const key = createPublicKey(pem);
  if (key.asymmetricKeyType !== 'rsa' || key.asymmetricKeyDetails.modulusLength < 3072) throw Error('RAW_ARCHIVE_KEY_INVALID');
  return {key, id: digest(key.export({format: 'der', type: 'spki'})).slice(0, 24)};
}

export function sealRawBytes(bytes, filename, pem) {
  if (!Buffer.isBuffer(bytes) || !bytes.length || bytes.length > MAX_FILE_BYTES
      || typeof filename !== 'string' || !/^[A-Za-z0-9_.-]+\.json$/.test(filename)) throw Error('RAW_ARCHIVE_INPUT_INVALID');
  const {key: publicKey, id} = archivePublicKey(pem);
  const key = randomBytes(32), nonce = randomBytes(12);
  const envelope = {archive_version: VERSION, algorithm: ALGORITHM, archive_id: randomUUID(), key_id: id};
  const cipher = createCipheriv('aes-256-gcm', key, nonce);
  cipher.setAAD(aad(envelope));
  const original = Buffer.from(JSON.stringify({filename, sha256: digest(bytes), bytes: bytes.length, data: bytes.toString('base64')}));
  const encrypted = Buffer.concat([cipher.update(gzipSync(original)), cipher.final(), cipher.getAuthTag()]);
  return {...envelope, wrapped_key: publicEncrypt({...oaep, key: publicKey}, key).toString('base64'),
    nonce: nonce.toString('base64'), ciphertext: encrypted.toString('base64')};
}

export function unsealRawBytes(envelope, pem) {
  try {
    if (envelope?.archive_version !== VERSION || envelope.algorithm !== ALGORITHM
        || !/^[a-f0-9-]{36}$/.test(envelope.archive_id || '')) throw Error();
    const privateKey = createPrivateKey(pem);
    const publicPem = createPublicKey(privateKey).export({type: 'spki', format: 'pem'});
    if (archivePublicKey(publicPem).id !== envelope.key_id) throw Error();
    const decode = text => {
      if (typeof text !== 'string') throw Error();
      const bytes = Buffer.from(text, 'base64');
      if (bytes.toString('base64') !== text) throw Error();
      return bytes;
    };
    const key = privateDecrypt({...oaep, key: privateKey}, decode(envelope.wrapped_key));
    const nonce = decode(envelope.nonce), encrypted = decode(envelope.ciphertext);
    if (key.length !== 32 || nonce.length !== 12 || encrypted.length < 17 || encrypted.length > MAX_TOTAL_BYTES) throw Error();
    const decipher = createDecipheriv('aes-256-gcm', key, nonce);
    decipher.setAAD(aad(envelope)); decipher.setAuthTag(encrypted.subarray(-16));
    const plain = gunzipSync(Buffer.concat([decipher.update(encrypted.subarray(0, -16)), decipher.final()]), {maxOutputLength: MAX_TOTAL_BYTES});
    const original = JSON.parse(plain);
    const bytes = decode(original.data);
    if (!/^[A-Za-z0-9_.-]+\.json$/.test(original.filename || '') || !bytes.length || bytes.length > MAX_FILE_BYTES
        || bytes.length !== original.bytes || digest(bytes) !== original.sha256) throw Error();
    return {filename: original.filename, bytes};
  } catch { throw Error('RAW_ARCHIVE_VERIFICATION_FAILED'); }
}

export function sealRawDirectory(source, destination, publicPem) {
  archivePublicKey(publicPem); // Validate even when no paid files exist.
  if (path.resolve(source) === path.resolve(destination)) throw Error('RAW_ARCHIVE_DESTINATION_INVALID');
  if (!fs.existsSync(source)) return {sealed_files: 0, original_bytes: 0};
  if (!fs.lstatSync(source).isDirectory() || fs.lstatSync(source).isSymbolicLink()) throw Error('RAW_ARCHIVE_SOURCE_INVALID');
  const names = fs.readdirSync(source).sort();
  if (names.length > 64) throw Error('RAW_ARCHIVE_FILE_LIMIT');
  let total = 0;
  const inputs = names.map(name => {
    const filename = path.join(source, name), stat = fs.lstatSync(filename);
    if (!stat.isFile() || stat.isSymbolicLink() || !/^[A-Za-z0-9_.-]+\.json$/.test(name)
        || !stat.size || stat.size > MAX_FILE_BYTES) throw Error('RAW_ARCHIVE_INPUT_INVALID');
    total += stat.size;
    if (total > MAX_TOTAL_BYTES) throw Error('RAW_ARCHIVE_SIZE_LIMIT');
    return {name, bytes: fs.readFileSync(filename)};
  });
  if (inputs.length) fs.mkdirSync(destination, {recursive: true, mode: 0o700});
  for (const [index, {name, bytes}] of inputs.entries()) {
    const envelope = sealRawBytes(bytes, name, publicPem);
    fs.writeFileSync(path.join(destination, `${String(index + 1).padStart(4, '0')}.sealed.json`), JSON.stringify(envelope) + '\n', {flag: 'wx', mode: 0o600});
  }
  return {sealed_files: inputs.length, original_bytes: total};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv[2] === '--check-key') {
      const {id} = archivePublicKey(fs.readFileSync(defaultKey));
      console.log(JSON.stringify({archive_key: id, status: 'valid_public_key'}));
    } else if (process.argv[2] === '--seal' && process.argv.length === 5) {
      console.log(JSON.stringify(sealRawDirectory(process.argv[3], process.argv[4], fs.readFileSync(defaultKey))));
    } else if (process.argv[2] === '--decrypt' && process.argv.length === 5) {
      const original = unsealRawBytes(JSON.parse(fs.readFileSync(process.argv[3])), process.env.CHATGPT_BRIDGE_PRIVATE_KEY);
      fs.mkdirSync(process.argv[4], {recursive: true, mode: 0o700});
      fs.writeFileSync(path.join(process.argv[4], original.filename), original.bytes, {flag: 'wx', mode: 0o600});
      console.log(JSON.stringify({restored_files: 1, original_bytes: original.bytes.length}));
    } else throw Error('RAW_ARCHIVE_ARGUMENTS_INVALID');
  } catch {
    // Never echo private filenames, plaintext, secret values or provider errors.
    console.error('RAW_ARCHIVE_OPERATION_FAILED'); process.exitCode = 1;
  }
}
