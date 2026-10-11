import test from 'node:test';
import assert from 'node:assert/strict';
import {stripEditorialHtmlNotes as clean, stripAiTrackingParameters, findPublicEditorialResidue} from '../../scripts/lib/public-editorial-cleanup.mjs';
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
  ['?utm_source=chatgpt.com&quot;', '&quot;'],
  ['?utm_source=chatgpt.com&#34;', '&#34;'],
  ['?utm_source=chatgpt.com&#x22;', '&#x22;'],
  ['?utm_source=chatgpt.com&rdquo;', '&rdquo;'],
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

test('software production callout is removed without consuming the score table or its funding conditions',()=>{
 const before='<section><h2>Bewerten</h2><table><tr><td>50 %</td><td>-2</td></tr></table>';
 const after='<p>Schutzverletzungen sperren die Entlastung.</p></section>';
 const note='<div class="callout">Reales Produktprofil, Arbeitskalibrierung und gesetzlicher Tarif sind drei verschiedene Dinge. Eine Software darf feste Regeln anwenden. Sie darf offene Regeln nicht selbst erfinden.</div>';
 assert.equal(clean(before+note+after),before+after);
 assert.deepEqual(findPublicEditorialResidue(before+after),[]);
 assert.equal(findPublicEditorialResidue(before+note+after).length,1);
});

test('reader cleanup retains historical identity, unknown evidence, privacy consent and actual technical topics',()=>{
 const html='<p>Arbeitsfassung v0.1 vom 6. Juni 2026. Die Ursache ist nicht belegt.</p><p>Das Backend der Ladeinfrastruktur braucht Datenschutz.</p><p>Für redaktionelle Ausgaben werden Öffnungen pseudonymisiert ausgewertet.</p><p>Cognitive Bias Codex</p><p>Policy Deployment for Successful TQM</p>';
 assert.equal(clean(html),html);
 assert.deepEqual(findPublicEditorialResidue(html),[]);
});

test('editorial wording changes preserve original anchors, adjacent evidence and the table structure',()=>{
 const html='<h2 id="28-redaktionshinweis-fuer-die-naechste-fassung">28. Redaktionshinweis für die nächste Fassung</h2><p>Für die nächste Fassung sollte das Dossier redaktionell neu sortiert werden: Quellen und Bezugslinien gehören an das Ende; ausgewählte Kapitel sollten stärker belegt werden.</p><p id="causal">Bedingte Wirkpfade bleiben ohne Nachweis offen.</p><table><tr><td>Begriffe</td><td>Glossarseiten und Toolseiten auf führende Definitionen bringen; IOOI/IOI-Suchkonflikt vermeiden; NWI-Platzhalter ersetzen.</td></tr></table>';
 const output=clean(html);
 assert.ok(output.includes('id="28-redaktionshinweis-fuer-die-naechste-fassung"'));
 assert.ok(output.includes('<p id="causal">Bedingte Wirkpfade bleiben ohne Nachweis offen.</p>'));
 assert.equal((output.match(/<td>/g)||[]).length,2);
 assert.deepEqual(findPublicEditorialResidue(output),[]);
 assert.equal(clean(output),output);
});

test('mixed inline lesson metadata retains prerequisites while replacing production and source placeholders',()=>{
 const input='<p><strong>Voraussetzung:</strong> MV1 <strong>Status:</strong> fachlicher Master in Ausarbeitung · vor Veröffentlichung redaktionell prüfen <strong>Quellen:</strong> WÖMS 2.0</p><ul><li><strong>Medienquelle:</strong> [Platzhalter]</li></ul>';
 const output=clean(input);
 assert.ok(output.includes('<strong>Voraussetzung:</strong> MV1'));
 assert.ok(output.includes('<strong>Quellen:</strong> WÖMS 2.0'));
 assert.ok(output.includes('Entwurf'));
 assert.deepEqual(findPublicEditorialResidue(output),[]);
});
