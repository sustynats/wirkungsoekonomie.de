import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const normalizer = 'scripts/site/normalize-site-header.mjs';

test('fast releases refresh the shared header before footer, search and unchanged publication gates', () => {
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/deploy.yml'), 'utf8');
  const fast = workflow.match(/- name: Build ticker and search for fast update\n([\s\S]*?)(?=\n      - name:)/)?.[1];
  assert.ok(fast);
  assert.match(fast, /ticker_only == 'true'/);
  const header = fast.indexOf(`node ${normalizer}`);
  assert.ok(header > fast.indexOf('node scripts/site/build-institut-projects.mjs'));
  for (const command of ['npm run normalize:footer', 'npm run build:search', 'npm run news:validate']) {
    assert.ok(fast.indexOf(command) > header, `${command} must see the current header`);
  }
  assert.match(workflow, /Audit the generated release including new news routes\n\s+run: bash scripts\/ops\/audit-generated-release.sh/);
  assert.match(workflow, /Build public deploy artifact\n\s+run: npm run build:artifact/);
  assert.match(workflow, /group: pages\s+[\s\S]*?cancel-in-progress: false/);
});

test('the existing header normalizer repairs the real historical shell gate without changing publication text', t => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'ticker-header-release-'));
  t.after(() => fs.rmSync(fixture, {recursive: true, force: true}));
  const inputs = [normalizer, 'scripts/lib/public-html.mjs', 'scripts/lib/site-shell.mjs',
    'scripts/site/render-site-shell.mjs', 'assets/data/navigation.json',
    'templates/footer-shell.html', 'templates/footer-newsletter.html'];
  for (const file of inputs) {
    const target = path.join(fixture, file);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.copyFileSync(path.join(root, file), target);
  }
  const preserved = inputs.map(file => [file, fs.readFileSync(path.join(fixture, file))]);
  const rel = 'wirkungsfelder/staat-recht-demokratie/wirkungshaushalt/index.html';
  const file = path.join(fixture, rel);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  const shell = spawnSync(process.execPath, ['scripts/site/render-site-shell.mjs', '--json', '--base=../../../'],
    {cwd: fixture, encoding: 'utf8', timeout: 10000});
  assert.equal(shell.status, 0, shell.stderr);
  const shared = JSON.parse(shell.stdout);
  const original = '<!doctype html><html lang="de"><head><link rel="stylesheet" href="../../../assets/css/style.css"></head><body>'
    + '<header class="site-header"><nav>Earlier navigation</nav></header>'
    + '<main><article><h1>Historical publication</h1><p>Original harm: 60 EUR, not 6 EUR.</p></article></main>'
    + shared.footer + '</body></html>';
  fs.writeFileSync(file, original);
  fs.writeFileSync(path.join(fixture, 'original.txt'), original);
  const check = (mode) => spawnSync('python3', ['-c', `
import sys
from pathlib import Path
sys.path.insert(0, ${JSON.stringify(path.join(root, 'tools'))})
from historical_navigation_shell import protected_publication
root = Path(${JSON.stringify(fixture)})
before = (root / 'original.txt').read_text()
after = (root / ${JSON.stringify(rel)}).read_text()
mode = ${JSON.stringify(mode)}
if mode == 'stale':
    try:
        protected_publication(before, after, ${JSON.stringify(rel)}, root)
    except AssertionError as error:
        assert 'Unverified global header' in str(error)
    else:
        raise AssertionError('The old header must fail the unchanged shell gate')
else:
    old, current = protected_publication(before, after, ${JSON.stringify(rel)}, root)
    assert old == current, 'Publication text and metadata must remain byte-identical'
    changed = after.replace('60 EUR', '6 EUR')
    old, current = protected_publication(before, changed, ${JSON.stringify(rel)}, root)
    assert old != current, 'The shell exemption must not hide a body change'
`], {cwd: fixture, encoding: 'utf8', timeout: 10000});
  const stale = check('stale');
  assert.equal(stale.status, 0, stale.stderr);
  const normalize = () => spawnSync(process.execPath, [normalizer], {cwd: fixture, encoding: 'utf8', timeout: 10000});
  const first = normalize();
  assert.equal(first.status, 0, first.stderr);
  assert.match(first.stdout, /normalized site headers: 1/);
  assert.ok(fs.readFileSync(file, 'utf8').includes(shared.header));
  const repaired = check('repaired');
  assert.equal(repaired.status, 0, repaired.stderr);
  const bytes = fs.readFileSync(file);
  const second = normalize();
  assert.equal(second.status, 0, second.stderr);
  assert.match(second.stdout, /normalized site headers: 0/);
  assert.deepEqual(fs.readFileSync(file), bytes);
  for (const [input, value] of preserved) assert.deepEqual(fs.readFileSync(path.join(fixture, input)), value);
});
