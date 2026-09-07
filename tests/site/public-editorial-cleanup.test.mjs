import test from 'node:test';
import assert from 'node:assert/strict';
import {stripEditorialHtmlNotes as clean, stripAiTrackingParameters} from '../../scripts/lib/public-editorial-cleanup.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

test('tracking cleanup preserves question marks followed by HTML entities in all text contexts', () => {
 const html = '<p>&quot;Was hat sie getrieben?&quot; für zu klein. Warum?&#34; Wieso?&#x22; Wirklich?&rdquo; Frage?&amp;</p><script>const quote="Frage?&quot;";</script>';
 assert.equal(stripAiTrackingParameters(html), html);
 assert.equal(stripAiTrackingParameters(html + '<a href="https://example.org/?utm_source=chatgpt.com&topic=demokratie">Quelle</a>'), html + '<a href="https://example.org/?topic=demokratie">Quelle</a>');
});

test('tracking cleanup removes only AI parameters and repairs their own separators', () => {
 for (const [query, expected] of [
  ['?utm_source=chatgpt.com', ''],
  ['?utm_source=chatgpt.com#quelle', '#quelle'],
  ['?utm_source=chatgpt.com&x=1', '?x=1'],
  ['?utm_source=chatgpt.com&amp;x=1', '?x=1'],
  ['?x=1&amp;utm_source=chatgpt.com&amp;y=2', '?x=1&amp;y=2'],
  ['?x=1&utm_medium=openai', '?x=1'],
  ['?utm_source=chatgpt.com&utm_medium=openai&utm_campaign=claude&x=1', '?x=1'],
  ['?utm_source=chatgpt.com&amp;utm_medium=openai', ''],
  ['?utm_source=newsletter&x=1', '?utm_source=newsletter&x=1'],
  ['?utm_source=chatgpt.com.example&x=1', '?utm_source=chatgpt.com.example&x=1'],
 ]) {
  const input = `<a href="https://example.org/${query}">Quelle</a>`;
  const output = `<a href="https://example.org/${expected}">Quelle</a>`;
  assert.equal(stripAiTrackingParameters(input), output, query);
  assert.equal(stripAiTrackingParameters(output), output, 'idempotent: ' + query);
 }
});

test('editorial CLI preserves the real journal paragraph while cleaning the same file', () => {
 const article = fs.readFileSync(new URL('../../blog/sachsen-anhalt-wahlergebnis-signal-fuer-europa.html', import.meta.url), 'utf8');
 const paragraph = article.match(/<p>Genau deshalb halte ich die Frage[\s\S]*?<\/p>/)?.[0];
 assert.ok(paragraph?.includes('getrieben?&quot;'));
 assert.equal(stripAiTrackingParameters(paragraph), paragraph);
 const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-entity-regression-'));
 try {
  const fixture = path.join(temporary, 'index.html');
  fs.writeFileSync(fixture, paragraph + '<a href="https://example.org/?utm_source=chatgpt.com&amp;x=1">Quelle</a>');
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('../../scripts/quality/sanitize-public-editorial-residue.mjs', import.meta.url))], {cwd: temporary, encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(fixture, 'utf8'), paragraph + '<a href="https://example.org/?x=1">Quelle</a>');
 } finally {
  fs.rmSync(temporary, {recursive: true, force: true});
 }
});
test('production notes never consume preceding sections or inline content',()=>{
 const before='<section id="evidence"><h2>Nachweis</h2><p>Wichtiger fachlicher Inhalt.</p><p>Mehr <strong>Evidenz</strong>.</p>';
 const after='<h3 id="formula">Formel</h3><p>Bleibt erhalten.</p></section>';
 assert.equal(clean(before+'<p>Codex-Fassung: intern</p>'+after),before+after);
 assert.equal(clean('<p>Erklärung</p><aside>Source-Hash: abc</aside><p>Beispiel</p>'),'<p>Erklärung</p><p>Beispiel</p>');
});
test('subject-matter names and raw script literals are preserved',()=>{
 const html='<p>Claude ist ein KI-System. Der Codex Alimentarius ist ein Regelwerk.</p><script>const s="<p>Codex-Fassung</p>";</script>';
 assert.equal(clean(html),html);
});
