import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

// Local rebuild proof; no deployment, network generation or PDF re-export.
const env = {...process.env, SOURCE_DATE_EPOCH: process.env.SOURCE_DATE_EPOCH || '1787270400', WOEK_PDF_BUILD_MODE: 'verify'};
const imports = JSON.parse(fs.readFileSync('content/glossary/imports/begriffsleitfaden-v1.8.json', 'utf8'));
const files = [
  'public/data/glossary.terms.json', 'assets/js/glossaryTerms.js',
  'verstehen/wirkungsfenster/index.html', 'begriffe/wirkungsfenster/index.html',
  'modell.html', 'workflow.html', 'verstehen/index.html', 'methodik/index.html',
  'so-wirkt-wirkungsoekonomie/index.html', 'werkzeuge/impact-controlling/index.html',
  'methodenraum/gesamtbild/index.html', 'referenz/aktualisierung/index.html',
  'podcast/wirkung-ist-nicht-absicht/index.html',
  'source-assets/generated/WOeK_Begriffsleitfaden_fuehrend_v1.8.md',
  'content/documents/online/woek-begriffsleitfaden-fuehrend.inc',
  'content/documents/online/woek-begriffsleitfaden-v1.7.inc',
  ...imports.extensions.map(t => `begriffe/${t.termId}/index.html`),
  ...['f13', 'i06', 'e10', 'h02', 'h06', 'h07'].map(id => `methodenraum/methoden/${id}/index.html`),
];
const scripts = [
  'scripts/glossary/build-glossary-registry.mjs', 'scripts/glossary/build-glossary-pages.mjs',
  'scripts/site/build-methodik-explainer.mjs',
  'scripts/site/build-so-wirkt-wirkungsoekonomie.mjs', 'scripts/portal/build-impact-controlling.mjs',
  'scripts/methods/build-methodenraum-pages.mjs', 'scripts/site/build-reference-update.mjs',
  'scripts/podcast/build-podcast-pages.mjs',
  'scripts/site/build-wirkungsfenster.mjs',
];
function build() {
  for (const script of scripts) {
    execFileSync(process.execPath, [script], {env, stdio: 'pipe'});
    if (script === 'scripts/site/build-methodik-explainer.mjs') {
      assert.match(fs.readFileSync('methodik/index.html', 'utf8'), /id="wirkungsfenster"/, 'Methodik partial builds must retain the dated web addendum');
    }
  }
  execFileSync('python3', ['scripts/publications/build-begriffsleitfaden-v1.8.py'], {env, stdio: 'pipe'});
  return Object.fromEntries(files.map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
}
const first = build();
const second = build();
assert.deepEqual(second, first, 'Targeted generators must reach an idempotent state');
console.log(JSON.stringify({check: 'wirkungsfenster-rebuild', passes: 2, files: files.length, sourceDateEpoch: env.SOURCE_DATE_EPOCH, hashes: second}, null, 2));
