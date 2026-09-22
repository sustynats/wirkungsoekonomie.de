import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function oversizedGitEntries(entries, limit = 95 * 1024 * 1024) {
  return entries.filter(entry => entry.bytes > limit);
}
export function checkStagedGitSize() {
  const run = args => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  const files = run(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']).split('\0').filter(Boolean);
  const large = oversizedGitEntries(files.map(file => ({ file, bytes: Number(run(['cat-file', '-s', `:${file}`]).trim()) })));
  if (large.length) throw Error(`GIT_FILE_SIZE_GUARD:${JSON.stringify(large)}`);
  console.log(`Git-Dateigrenze geprüft: ${files.length} Änderungen unter 95 MiB.`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) checkStagedGitSize();
