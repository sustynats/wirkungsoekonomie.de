// Lossless, bounded repository storage. The small manifest is replaced last;
// every referenced part is content-addressed and verified before use.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const FORMAT = 'woek-newsroom-parts-1';
const RECORD_FORMAT = 'woek-newsroom-parts-2';
const LIMIT = 8 * 1024 * 1024;
const RECORD_LIMIT = 128 * 1024 * 1024;
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const atomic = (file, text) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temp, text);
  fs.renameSync(temp, file);
};

export function readNewsroom(file, fallback) {
  if (file instanceof URL) file = fileURLToPath(file);
  if (!fs.existsSync(file) && fallback !== undefined) return structuredClone(fallback);
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  return decodeNewsroom(manifest, part => fs.readFileSync(path.join(`${file}.parts`, `${part.sha256}.json`)));
}

// The same decoder also verifies parts read from an exact Git revision during
// publication conflict recovery. Never combine a manifest with current parts.
export function decodeNewsroom(manifest, readPart) {
  if (!manifest.storage_format) return manifest; // Legacy snapshots and recovery artifacts.
  newsroomParts(manifest); // Validate descriptors before reading any path.
  const readBytes = part => {
    const bytes = readPart(part);
    if (!Buffer.isBuffer(bytes) || bytes.length !== part.bytes || digest(bytes) !== part.sha256) throw Error('NEWSROOM_PART_CORRUPT');
    return bytes;
  };
  const result = {};
  const fields = new Set();
  for (const field of manifest.fields) {
    if (!field || typeof field.key !== 'string' || fields.has(field.key)) throw Error('NEWSROOM_FIELD_INVALID');
    fields.add(field.key);
    let value;
    if (field.kind === 'value') value = field.value;
    else {
      if (!['object', 'array'].includes(field.kind) || !Array.isArray(field.parts)) throw Error('NEWSROOM_PARTS_INVALID');
      value = field.kind === 'array' ? [] : {};
      for (const part of field.parts) {
        let rows;
        if (part.kind === 'record') {
          let length = 0;
          const chunks = part.parts.map(chunk => {
            const encoded = JSON.parse(readBytes(chunk).toString('utf8'));
            if (typeof encoded !== 'string') throw Error('NEWSROOM_RECORD_CORRUPT');
            const bytes = Buffer.from(encoded, 'base64');
            length += bytes.length;
            if (bytes.toString('base64') !== encoded || length > part.bytes) throw Error('NEWSROOM_RECORD_CORRUPT');
            return bytes;
          });
          const bytes = Buffer.concat(chunks);
          if (bytes.length !== part.bytes || digest(bytes) !== part.sha256) throw Error('NEWSROOM_RECORD_CORRUPT');
          rows = [JSON.parse(bytes.toString('utf8'))];
        } else rows = JSON.parse(readBytes(part).toString('utf8'));
        if (!Array.isArray(rows)) throw Error('NEWSROOM_PART_ROWS_INVALID');
        if (field.kind === 'array') for (const row of rows) value.push(row);
        else for (const row of rows) {
          if (!Array.isArray(row) || row.length !== 2 || typeof row[0] !== 'string' || Object.hasOwn(value, row[0])) throw Error('NEWSROOM_DUPLICATE_KEY');
          Object.defineProperty(value, row[0], { value: row[1], enumerable: true, configurable: true, writable: true });
        }
      }
      if (Object.keys(value).length !== field.count) throw Error('NEWSROOM_COUNT_MISMATCH');
    }
    Object.defineProperty(result, field.key, { value, enumerable: true, configurable: true, writable: true });
  }
  return result;
}

// Return only physical files, also for exact-revision publication recovery.
// Version 2 changes storage, never story/approval schemas or public exports.
export function newsroomParts(manifest) {
  if (![FORMAT, RECORD_FORMAT].includes(manifest?.storage_format) || !Array.isArray(manifest.fields)) throw Error('NEWSROOM_MANIFEST_INVALID');
  const parts = [];
  const valid = (part, limit) => part && /^[a-f0-9]{64}$/.test(part.sha256 || '')
    && Number.isSafeInteger(part.bytes) && part.bytes > 0 && part.bytes <= limit;
  for (const field of manifest.fields) {
    if (field?.kind === 'value') continue;
    if (!Array.isArray(field?.parts)) throw Error('NEWSROOM_PARTS_INVALID');
    for (const part of field.parts) {
      if (part?.kind === 'record') {
        if (manifest.storage_format !== RECORD_FORMAT || !valid(part, RECORD_LIMIT)
            || !Array.isArray(part.parts) || !part.parts.length || part.parts.length > part.bytes) throw Error('NEWSROOM_RECORD_INVALID');
        for (const chunk of part.parts) {
          if (chunk?.kind || !valid(chunk, LIMIT)) throw Error('NEWSROOM_PART_INVALID');
          parts.push(chunk);
        }
      } else {
        if (part?.kind || !valid(part, LIMIT)) throw Error('NEWSROOM_PART_INVALID');
        parts.push(part);
      }
    }
  }
  return parts;
}

export function writeNewsroom(file, value, { maxPartBytes = LIMIT } = {}) {
  if (file instanceof URL) file = fileURLToPath(file);
  if (!value || typeof value !== 'object' || Array.isArray(value) || !Number.isSafeInteger(maxPartBytes) || maxPartBytes < 64 || maxPartBytes > LIMIT) throw Error('NEWSROOM_STORE_INVALID');
  const manifest = { storage_format: FORMAT, fields: [] };
  const dir = `${file}.parts`;
  const keep = new Set();
  const save = bytes => {
    const sha256 = digest(bytes), name = `${sha256}.json`;
    const target = path.join(dir, name);
    // Reuse unchanged chunks, but never reuse damaged bytes.
    if (!fs.existsSync(target) || digest(fs.readFileSync(target)) !== sha256) atomic(target, bytes);
    keep.add(name);
    return {sha256, bytes: bytes.length};
  };
  for (const [key, data] of Object.entries(value)) {
    if (!data || typeof data !== 'object') { manifest.fields.push({ key, kind: 'value', value: data }); continue; }
    const kind = Array.isArray(data) ? 'array' : 'object';
    const rows = kind === 'array' ? data : Object.entries(data);
    const field = { key, kind, count: rows.length, parts: [] };
    let batch = [], size = 2;
    const flush = () => {
      if (!batch.length) return;
      const bytes = Buffer.from(`[${batch.join(',')}]`);
      field.parts.push(save(bytes));
      batch = []; size = 2;
    };
    for (const row of rows) {
      const text = JSON.stringify(row), bytes = Buffer.byteLength(text);
      if (bytes > RECORD_LIMIT) throw Error(`NEWSROOM_RECORD_TOO_LARGE:${key}`);
      if (bytes + 2 > maxPartBytes) {
        flush();
        // A living story can outgrow a file through its retained history.
        // Split the serialized bytes losslessly; base64 JSON leaves also allow
        // UTF-8 characters to cross boundaries without changing the content.
        const raw = Buffer.from(text), parts = [];
        const chunkBytes = Math.floor((maxPartBytes - 2) / 4) * 3;
        for (let offset = 0; offset < raw.length; offset += chunkBytes) {
          parts.push(save(Buffer.from(JSON.stringify(raw.subarray(offset, offset + chunkBytes).toString('base64')))));
        }
        field.parts.push({kind: 'record', sha256: digest(raw), bytes: raw.length, parts});
        manifest.storage_format = RECORD_FORMAT;
        continue;
      }
      if (size + bytes + (batch.length ? 1 : 0) > maxPartBytes) flush();
      size += bytes + (batch.length ? 1 : 0); batch.push(text);
    }
    flush(); manifest.fields.push(field);
  }
  atomic(file, `${JSON.stringify(manifest, null, 2)}\n`);
  // Remove only obsolete generated chunks after the manifest is durable.
  // Their former versions remain recoverable from Git / recovery artifacts.
  if (fs.existsSync(dir)) for (const name of fs.readdirSync(dir)) {
    if (/^[a-f0-9]{64}\.json$/.test(name) && !keep.has(name)) fs.unlinkSync(path.join(dir, name));
  }
  return manifest;
}

// Whitespace is not data: keep the other growing stores safely below the
// repository limit without changing their established JSON reader contract.
export function repositoryJson(value) {
  const compact = JSON.stringify(value);
  return `${Buffer.byteLength(compact) > 8 * 1024 * 1024 ? compact : JSON.stringify(value, null, 2)}\n`;
}

// Preserve the in-memory/legacy JSON contract for every caller. The canonical
// story catalog uses the already established lossless newsroom parts format;
// browser-facing exports remain ordinary JSON and are built independently.
export function readRepositoryJson(file) {
  const filename = file instanceof URL ? fileURLToPath(file) : file;
  return path.basename(filename) === 'stories.json'
    ? readNewsroom(filename) : JSON.parse(fs.readFileSync(filename, 'utf8'));
}
export function writeRepositoryJson(file, value) {
  const filename = file instanceof URL ? fileURLToPath(file) : file;
  if (path.basename(filename) === 'stories.json') return writeNewsroom(filename, value);
  atomic(filename, repositoryJson(value));
}
