import test from 'node:test';
import assert from 'node:assert/strict';
import {stripEditorialHtmlNotes as clean} from '../../scripts/lib/public-editorial-cleanup.mjs';
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
