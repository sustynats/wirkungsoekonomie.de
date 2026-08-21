import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BRANCH = 'woek/st-cdu-source-manifest-p89-20260821';
const ref = process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_HEAD_REF || '';

if (ref !== BRANCH) {
  console.log(`[cdu-convergence-preview] skip on ref ${ref || '<unknown>'}`);
  process.exit(0);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '..');
const repoRoot = path.resolve(appRoot, '..');
const manifestRoot = path.join(
  repoRoot,
  'woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt',
);
const outRoot = path.join(appRoot, 'public', '__cdu-convergence');

console.log('[cdu-convergence-preview] running source-bound mechanical reconciliation');
execFileSync('python3', ['tools/run_st_cdu_convergence_preview.py'], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: process.env,
});

rmSync(outRoot, { recursive: true, force: true });
mkdirSync(outRoot, { recursive: true });

const wanted = readdirSync(manifestRoot).filter((name) =>
  /^ltw-2026-st-cdu-.*\.json$/.test(name),
);
for (const name of wanted) {
  cpSync(path.join(manifestRoot, name), path.join(outRoot, name));
}
const snapshotIndex = path.join(
  manifestRoot,
  'review-snapshots',
  'ltw-2026-st-cdu-review-snapshot-index-v1.json',
);
if (existsSync(snapshotIndex)) {
  cpSync(snapshotIndex, path.join(outRoot, 'ltw-2026-st-cdu-review-snapshot-index-v1.json'));
}
console.log(`[cdu-convergence-preview] exposed ${wanted.length} generated/current manifest JSON files for preview audit`);
