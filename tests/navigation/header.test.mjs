import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {renderSiteHeader, renderSiteHeaderForSource, loadNavigation, pageBase, pageLocale} from '../../scripts/lib/site-shell.mjs';
import {publicHtmlFiles} from '../../scripts/lib/public-html.mjs';

test('one renderer follows navigation data and emits the current labels in order', () => {
  const nav = loadNavigation();
  const html = renderSiteHeader('../../', 'de', nav);
  let previous = -1;
  for (const item of nav.header) {
    const label = item.label.replaceAll('&', '&amp;');
    const position = html.indexOf(`>${label}</a>`, previous + 1);
    assert.ok(position > previous, `${item.label} missing or reordered`);
    previous = position;
    assert.ok(html.includes(`href="../../${item.href}"`));
  }
  const changed = structuredClone(nav);
  changed.header[0] = {...changed.header[0], label: 'Datenänderung', href: 'neuer-einstieg/'};
  assert.match(renderSiteHeader('', 'de', changed), /href="neuer-einstieg\/"[^>]*>Datenänderung/);
  assert.equal(nav.header[0].label, 'Verstehen');
});

test('Python bridge and the German generated cache use the same function', () => {
  const expected = renderSiteHeader('../../', 'de');
  const actual = execFileSync('python3', ['-c', "from scripts.lib.site_shell import render_site_header; print(render_site_header('../../'), end='')"], {encoding: 'utf8'});
  assert.equal(actual, expected);
  assert.equal(fs.readFileSync('templates/header.html', 'utf8').trimEnd(), renderSiteHeader('{{BASE}}', 'de'));
  assert.equal(pageBase('index.html'), '');
  assert.equal(pageBase('fuer/unternehmen/index.html'), '../../');
  assert.equal(pageLocale('en/library/index.html'), 'en');
});

test('source-shell readers preserve only locale and relative base, not a stale menu', () => {
  const stale='<html lang="de"><img src="../../assets/img/brand/signet.svg"><header class="site-header"><a>Altes Menü</a></header></html>';
  assert.equal(renderSiteHeaderForSource(stale),renderSiteHeader('../../','de'));
  const python=execFileSync('python3',['-c',"from scripts.lib.site_shell import render_site_header_for_source; print(render_site_header_for_source('<html lang=\"de\"><img src=\"../../assets/img/brand/signet.svg\"><header>Altes Menü</header></html>'),end='')"],{encoding:'utf8'});
  assert.equal(python,renderSiteHeader('../../','de'));
  assert.throws(()=>renderSiteHeaderForSource('<header>Ohne bekannten Pfad</header>'));
});

test('public inventory includes new pages and excludes implementation directories', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'navigation-fixture-'));
  try {
    for (const file of ['index.html', 'neue-seite/index.html', 'scripts/privat.html', '_site/alt.html', 'admin/privat.html']) {
      fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true});
      fs.writeFileSync(path.join(root, file), '<main>Fixture</main>');
    }
    assert.deepEqual(publicHtmlFiles(root).map(file => path.relative(root, file)), ['index.html', 'neue-seite/index.html']);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});
