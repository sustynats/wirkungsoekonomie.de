import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderEditorialMarkdown} from '../../scripts/news/editorial-markdown.mjs';
import {arrowSteps,renderTextDiagram} from '../../scripts/news/editorial-diagrams.mjs';
import {auditEditorialVisuals} from '../../scripts/news/audit-editorial-visuals.mjs';
import {diagramLayouts,editorialDiagramLayout} from '../../scripts/news/editorial-diagram-layouts.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');

test('standalone and multiline chains render in the same shared Markdown path as private previews',()=>{
 for(const md of ['A → B → mögliche Folge','> **A → B → mögliche Folge**','A\n\n→ B\n\n→ mögliche Folge']){
  const html=renderEditorialMarkdown(md).html;
  assert.match(html,/data-editorial-explanatory-visual/);
  assert.match(html,/<ol>/);assert.match(html,/mögliche Folge/);assert.doesNotMatch(html,/<blockquote>/);
 }
});
test('ordinary text, one arrow, broken Markdown and unsafe input do not create misleading diagrams',()=>{
 assert.equal(arrowSteps('A → B'),null);
 assert.equal(arrowSteps('**A → B → C'),null);
 assert.equal(arrowSteps('https://example.org/a → B → C'),null);
 const html=renderTextDiagram({caption:'<script>',items:['<img onerror=x>'],mode:'comparison'},s=>s.replaceAll('<','&lt;'));
 assert.doesNotMatch(html,/<script>|<img/);
 assert.match(html,/&lt;script&gt;/);
});
test('table diagrams retain every cell, qualifier, source link and branch without inventing scores',()=>{
 const md='| Stufe | Folge | Grenze |\n|---|---|---|\n| A | Vielleicht B | [Quelle](https://example.org/) |\n| C | Risiko D | Offen |';
 const html=renderEditorialMarkdown(md,{tableDiagrams:{0:{mode:'steps',caption:'Bedingtes Modell',branch_last:true}}}).html;
 for(const value of ['Vielleicht B','Risiko D','Offen','https://example.org/','Alternativer Risikopfad'])assert.ok(html.includes(value));
 assert.equal((html.match(/Risiko D/g)||[]).length,1);
 assert.match(html,/<\/ol><div class="news-editorial-diagram__branch">/);
});
test('excerpts are verbatim, anchored before the final personal section and reject changed content',()=>{
 const opts={sectionDiagrams:[{section:'Kontext',caption:'Vergleich',mode:'comparison',items:['Ein belegter Satz.']}]};
 const html=renderEditorialMarkdown('## Kontext\n\nEin belegter Satz.\n\n## Meine Einordnung\n\nMein Fazit.',opts).html;
 assert.ok(html.indexOf('data-editorial-explanatory-visual')<html.indexOf('Meine Einordnung'));
 assert.throws(()=>renderEditorialMarkdown('## Kontext\n\nAnderer Satz.',opts),/EXCERPT_CHANGED/);
});
test('old layout never silently attaches to a changed approved manuscript',()=>{
 const entry=diagramLayouts.entries[0];
 assert.deepEqual(editorialDiagramLayout({slug:entry.slug,body_markdown:'Neue Fassung'}),{});
});
test('all 30 checked publications have real explanatory diagrams, not portraits or MPD meters',()=>{
 const rows=auditEditorialVisuals(root);
 assert.ok(rows.length>=86);
 assert.equal(diagramLayouts.entries.length,30);
 for(const entry of diagramLayouts.entries){
  const row=rows.find(r=>r.slug===entry.slug);
  assert.ok(row?.diagrams>0,entry.slug);
  assert.equal(row.layout_status,'bound',entry.slug);
 }
 // New editorial arrivals are reported by --check-latest, not a reason to
 // block unrelated automatic news releases with a moving historical fixture.
});
