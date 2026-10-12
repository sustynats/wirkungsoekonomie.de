import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const generator = 'scripts/site/build-institut-projects.mjs';
const checker = 'scripts/quality/check-institut-projects.mjs';

test('fast ticker releases regenerate institute sources before footer, search and publication checks', () => {
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/deploy.yml'), 'utf8');
  const fast = workflow.match(/- name: Build ticker and search for fast update\n([\s\S]*?)(?=\n      - name:)/)?.[1];
  assert.ok(fast, 'the existing fast-release step must remain');
  assert.match(fast, /ticker_only == 'true'/);
  const generation = fast.indexOf(`node ${generator}`);
  assert.ok(generation > fast.indexOf('npm run news:build'), 'generate from current sources after news build');
  for (const command of ['npm run normalize:footer', 'npm run build:search', 'npm run news:validate']) {
    assert.ok(fast.indexOf(command) > generation, `${command} must see the regenerated pages`);
  }
  assert.match(workflow, /group: pages\s+[\s\S]*?cancel-in-progress: false/);
  assert.match(workflow, /Build public deploy artifact\n\s+run: npm run build:artifact/);
});

test('the existing generator repairs stale chronicle output without editing sources or news', t => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'ticker-institute-release-'));
  t.after(() => fs.rmSync(fixture, {recursive: true, force: true}));
  const inputs = [generator, checker, 'scripts/lib/content-page.mjs', 'scripts/lib/site-shell.mjs',
    'scripts/lib/explainer-components.mjs', 'scripts/lib/institut-projects.mjs',
    'content/institut/projects.json', 'content/institut/source-revisions.json',
    'assets/data/navigation.json', 'templates/content-page.html', 'templates/footer.html'];
  for (const file of inputs) {
    const target = path.join(fixture, file);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.copyFileSync(path.join(root, file), target);
  }
  const data = JSON.parse(fs.readFileSync(path.join(fixture, 'content/institut/projects.json'), 'utf8'));
  const routes = ['institut/projekte/', ...data.projects.map(p => `institut/projekte/${p.slug}/`)];
  fs.mkdirSync(path.join(fixture, 'assets/search'), {recursive: true});
  fs.writeFileSync(path.join(fixture, 'assets/search/search-index.json'), JSON.stringify(routes.map(url => ({url: `/${url}`}))));
  fs.writeFileSync(path.join(fixture, 'sitemap.xml'), '<urlset><url><loc>https://wirkungsoekonomie.de/wirkungsticker/</loc></url></urlset>');
  fs.mkdirSync(path.join(fixture, 'data/news'), {recursive: true});
  fs.writeFileSync(path.join(fixture, 'data/news/untouched.json'), '{"approved":false,"attempt":"started"}\n');
  const preserved = [...inputs, 'data/news/untouched.json'].map(file => [file, fs.readFileSync(path.join(fixture, file))]);
  const run = file => spawnSync(process.execPath, [file], {cwd: fixture, encoding: 'utf8', timeout: 10000});
  const generate = () => {
    const result = run(generator);
    assert.equal(result.status, 0, result.stderr);
  };
  generate();
  const page = path.join(fixture, 'institut/projekte/wirkungsportal-parlament/index.html');
  const current = 'Die Vorbereitung amtlicher Vorgänge und die getrennte Bearbeitung eigener Bewertungen wurden eingerichtet.';
  const html = fs.readFileSync(page, 'utf8');
  assert.ok(html.includes(current));
  fs.writeFileSync(page, html.replace(current, 'Importvorbereitung und redaktionelles Backend wurden im Repository umgesetzt.'));
  const stale = run(checker);
  assert.notEqual(stale.status, 0, 'the unchanged publication guard must reject stale source prose');
  assert.match(stale.stderr, /document prose lost in dokument-chronik/);
  generate();
  const repaired = run(checker);
  assert.equal(repaired.status, 0, repaired.stderr);
  assert.match(repaired.stdout, /9 complete documents/);
  const outputs = [...routes.map(route => `${route}index.html`), 'sitemap.xml'];
  const before = outputs.map(file => [file, fs.readFileSync(path.join(fixture, file))]);
  generate();
  for (const [file, bytes] of [...preserved, ...before]) {
    assert.deepEqual(fs.readFileSync(path.join(fixture, file)), bytes, `${file} must remain unchanged`);
  }
  assert.ok(fs.readFileSync(path.join(fixture, 'sitemap.xml'), 'utf8').includes('https://wirkungsoekonomie.de/wirkungsticker/'));
});
