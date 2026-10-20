import fs from 'node:fs';
import path from 'node:path';

// Remove only insignificant JSON whitespace. Keep every string and number
// literal byte for byte, including integers beyond JavaScript's safe range.
export function compactJsonWhitespace(source) {
  JSON.parse(source);
  let quoted = false, escaped = false, start = 0;
  const parts = [];
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
      if (i > start) parts.push(source.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(source.slice(start));
  return parts.join('') + '\n';
}

export function compactPublicRuntimeJson(root) {
  // This generated runtime feed has no byte-bound publication contract.
  // Do not alter signed lexicon payloads, downloads or historical sources.
  const file = path.join(root, 'wirkungsticker/data/stories.json');
  if (!fs.existsSync(file)) return 0;
  const source = fs.readFileSync(file, 'utf8');
  const compact = compactJsonWhitespace(source);
  const savedBytes = Buffer.byteLength(source) - Buffer.byteLength(compact);
  if (compact !== source) fs.writeFileSync(file, compact);
  return savedBytes;
}
