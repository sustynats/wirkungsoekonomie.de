import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function oversizedGitEntries(entries, limit = 95 * 1024 * 1024) {
  return entries.filter(entry => entry.bytes > limit);
}
export function checkStagedGitSize() {
  const run = (args, options = {}) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, ...options });
  const files = run(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']).split('\0').filter(Boolean);
  if (!files.length) return console.log('Git-Dateigrenze geprüft: keine Änderungen.');
  // One batch instead of starting Git once for every generated page. Index
  // paths stay NUL-delimited, so spaces/newlines cannot change query meaning.
  const objects = new Map(run(['ls-files', '--stage', '-z']).split('\0').filter(Boolean).map(line => {
    const tab = line.indexOf('\t'), [mode, hash, stage] = line.slice(0, tab).split(' ');
    return [line.slice(tab + 1), stage === '0' ? hash : null];
  }));
  const hashes = files.map(file => objects.get(file));
  if (hashes.some(hash => !/^[a-f0-9]{40,64}$/.test(hash || ''))) throw Error('GIT_SIZE_INDEX_INVALID');
  const sizes = run(['cat-file', '--batch-check=%(objectsize)'], { input: `${hashes.join('\n')}\n` }).trim().split('\n').map(Number);
  if (sizes.length !== files.length || sizes.some(size => !Number.isSafeInteger(size) || size < 0)) throw Error('GIT_SIZE_RESULT_INVALID');
  const large = oversizedGitEntries(files.map((file, index) => ({ file, bytes: sizes[index] })));
  if (large.length) throw Error(`GIT_FILE_SIZE_GUARD:${JSON.stringify(large)}`);
  console.log(`Git-Dateigrenze geprüft: ${files.length} Änderungen unter 95 MiB.`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) checkStagedGitSize();
