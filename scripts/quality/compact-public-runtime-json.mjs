import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Only fixed-path runtime catalogs, never manuscripts, approved editions,
// content-addressed shards/manifests, snapshots or downloadable originals.
// Source files remain unchanged; this runs after artifact generation only.
export const PUBLIC_RUNTIME_JSON = Object.freeze([
  'assets/data/woek-id-register.json',
  'assets/data/glossary-model.json',
  'assets/data/glossary-lookup.json',
  'assets/data/glossary-reference-index.json',
  'assets/data/glossary-relations.json',
  'assets/data/library-version-registry.json',
  'assets/data/library-source-details.json',
  'wirkungsticker/feed.json',
  'news/feed.json',
]);

export function compactJsonBytes(input) {
  if (!Buffer.isBuffer(input)) throw new TypeError('RUNTIME_JSON_BUFFER_REQUIRED');
  const decode = bytes => new TextDecoder('utf-8', {fatal: true, ignoreBOM: true}).decode(bytes);
  // Parse only to validate, NEVER stringify: that would change large integers,
  // number spelling, escaped strings or duplicate keys in existing documents.
  JSON.parse(decode(input));
  const output = Buffer.allocUnsafe(input.length);
  let length = 0, quoted = false, escaped = false;
  for (const byte of input) {
    if (quoted) {
      output[length++] = byte;
      if (escaped) escaped = false;
      else if (byte === 0x5c) escaped = true;
      else if (byte === 0x22) quoted = false;
    } else if (byte === 0x22) {
      quoted = true;
      output[length++] = byte;
    } else if (byte !== 0x20 && byte !== 0x09 && byte !== 0x0a && byte !== 0x0d) {
      output[length++] = byte;
    }
  }
  const compacted = output.subarray(0, length);
  JSON.parse(decode(compacted));
  return compacted;
}

function regularArtifactFile(root, relative) {
  let current = root;
  const parts = relative.split('/');
  for (const [index, part] of parts.entries()) {
    current = path.join(current, part);
    let stat;
    try { stat = fs.lstatSync(current); }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
    if (stat.isSymbolicLink()) throw Error(`RUNTIME_JSON_SYMLINK:${relative}`);
    if (index < parts.length - 1) {
      if (!stat.isDirectory()) throw Error(`RUNTIME_JSON_PARENT_INVALID:${relative}`);
    } else if (!stat.isFile() || stat.nlink !== 1) {
      throw Error(`RUNTIME_JSON_FILE_INVALID:${relative}`);
    }
  }
  return current;
}

export function compactPublicRuntimeJson(artifactRoot) {
  const root = path.resolve(artifactRoot);
  const stat = fs.lstatSync(root);
  if (path.basename(root) !== '_site' || stat.isSymbolicLink() || !stat.isDirectory()) {
    throw Error('RUNTIME_JSON_ARTIFACT_ROOT_REQUIRED');
  }
  // Validate every present candidate before changing any artifact file.
  const prepared = PUBLIC_RUNTIME_JSON.flatMap(relative => {
    const file = regularArtifactFile(root, relative);
    if (!file) return [];
    const original = fs.readFileSync(file);
    let compacted;
    try { compacted = compactJsonBytes(original); }
    catch { throw Error(`RUNTIME_JSON_INVALID:${relative}`); }
    return [{relative, file, original, compacted}];
  });
  const files = prepared.map(({relative, file, original, compacted}) => {
    if (!compacted.equals(original)) fs.writeFileSync(file, compacted);
    return {path: relative, before_bytes: original.length, after_bytes: compacted.length,
      saved_bytes: original.length - compacted.length};
  });
  return {files, saved_bytes: files.reduce((sum, file) => sum + file.saved_bytes, 0)};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 2) throw Error('RUNTIME_JSON_NO_PATH_OVERRIDE');
  const result = compactPublicRuntimeJson(path.join(process.cwd(), '_site'));
  console.log(`Public runtime JSON: ${result.saved_bytes} bytes of whitespace removed from ${result.files.length} catalogs; all tokens preserved.`);
}
