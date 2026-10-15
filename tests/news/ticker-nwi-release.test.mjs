import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const normalizer = 'tools/apply_nwi_disambiguation.py';
const readers = [
  ...[1, 3, 4, 5, 9].map(version => `bibliothek/studienskripte/wirkungscontrolling-wc-v${version}/index.html`),
  ...[1, 3, 4, 5].map(version => `bibliothek/studienskripte/wirkungsmanagement-v${version}/index.html`),
];

test('fast releases apply existing NWI disambiguation after the shell and before search and unchanged gates', () => {
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/deploy.yml'), 'utf8');
  const fast = workflow.match(/- name: Build ticker and search for fast update\n([\s\S]*?)(?=\n      - name:)/)?.[1];
  assert.ok(fast);
  assert.match(fast, /ticker_only == 'true'/);
  const normalize = fast.indexOf(`python3 ${normalizer}`);
  assert.ok(normalize > fast.indexOf('npm run normalize:footer'));
  assert.ok(fast.indexOf('npm run build:search') > normalize);
  assert.ok(fast.indexOf('npm run news:validate') > normalize);
  assert.match(workflow, /Audit the generated release including new news routes\n\s+run: bash scripts\/ops\/audit-generated-release.sh/);
  assert.match(workflow, /group: pages\s+[\s\S]*?cancel-in-progress: false/);
  const audit = fs.readFileSync(path.join(root, 'scripts/ops/audit-generated-release.sh'), 'utf8');
  assert.match(audit, /audit-source-integrity\.mjs --strict/);
  assert.match(audit, /python3 tools\/check_state_sustainability_architecture\.py/);
});

test('the nine blocked historical readers get only the existing dated notice, idempotently', t => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'ticker-nwi-release-'));
  t.after(() => fs.rmSync(fixture, {recursive: true, force: true}));
  fs.mkdirSync(path.join(fixture, 'content/audits'), {recursive: true});
  const inputs = [normalizer, 'content/quellenarchiv/sources.json'];
  for (const relative of inputs) {
    const target = path.join(fixture, relative);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.copyFileSync(path.join(root, relative), target);
  }
  const originals = readers.map(relative => {
    const original = fs.readFileSync(path.join(root, relative), 'utf8');
    // A full build may already have attached the notice. Reproduce the exact
    // release blocker without changing any original publication bytes.
    const raw = original.replace(/<!-- WOEK:NWI-DISAMBIGUATION:START -->[\s\S]*?<!-- WOEK:NWI-DISAMBIGUATION:END -->\n?/, '');
    const target = path.join(fixture, relative);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, raw);
    return [relative, raw];
  });
  const source = fs.readFileSync(path.join(fixture, inputs[1]));
  const run = () => spawnSync('python3', [normalizer], {cwd: fixture, encoding: 'utf8', timeout: 20000});
  const first = run();
  assert.equal(first.status, 0, first.stderr);
  assert.equal(JSON.parse(first.stdout).historical_notices_added, 9);
  const results = originals.map(([relative, original]) => {
    const html = fs.readFileSync(path.join(fixture, relative), 'utf8');
    assert.match(html, /Begriffshinweis · 21\.08\.2026/);
    assert.match(html, /Der historische Text bleibt unverändert/);
    assert.match(html, /Nationaler Wohlfahrtsindex \(NWI\)/);
    assert.equal(html.replace(/<!-- WOEK:NWI-DISAMBIGUATION:START -->[\s\S]*?<!-- WOEK:NWI-DISAMBIGUATION:END -->\n?/, ''), original, relative);
    return [relative, html];
  });
  const second = run();
  assert.equal(second.status, 0, second.stderr);
  assert.equal(JSON.parse(second.stdout).historical_notices_added, 0);
  for (const [relative, html] of results) assert.equal(fs.readFileSync(path.join(fixture, relative), 'utf8'), html);
  assert.deepEqual(fs.readFileSync(path.join(fixture, inputs[1])), source, 'canonical source registry must not change');
});
