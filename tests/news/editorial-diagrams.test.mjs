import test from 'node:test';
import { enhancePrivateEditorialHtml } from '../../assets/js/editorial-diagrams.js';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderEditorialMarkdown} from '../../scripts/news/editorial-markdown.mjs';
import {arrowSteps,renderTextDiagram} from '../../scripts/news/editorial-diagrams.mjs';
import {auditEditorialVisuals} from '../../scripts/news/audit-editorial-visuals.mjs';
import {diagramLayouts,editorialDiagramLayout} from '../../scripts/news/editorial-diagram-layouts.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');

test('authored labeled arrow blocks retain words in public and private renderers',()=>{
 const items=['**Zieldefinition**\n→ Drei ausdrücklich genannte Gruppen','**Staatliche Hebel**\n→ Verwaltung und Förderung','**Zu prüfende Folgen**\n→ Mögliche Vertrauensverluste'];
 const md=items.join('\n\n');
 const current=renderEditorialMarkdown(md).html;
 assert.equal((current.match(/news-systemic-node"/g)||[]).length,3);
 const legacy=items.map(x=>'<p>'+x.replace(/\*\*([^*]+)\*\*/,'<strong>$1</strong>')+'</p>').join('\n');
 const enhanced=enhancePrivateEditorialHtml(legacy);
 for(const html of [current,enhanced]){
  assert.match(html,/data-editorial-explanatory-visual/);
  for(const s of ['Drei ausdrücklich genannte Gruppen','Verwaltung und Förderung','Mögliche Vertrauensverluste'])assert.ok(html.includes(s));
  assert.match(html,/keine gemessenen Wirkungen/);
 }
 assert.equal(enhancePrivateEditorialHtml('<p>Eine normale Aussage.</p>'),'<p>Eine normale Aussage.</p>');
 const appendix=renderEditorialMarkdown('## Meine Einordnung\n\nMein Urteil.\n\n---\n\n### Wirkungskaskade für die Visualisierung\n\n'+md+'\n\n### Quellen und Dokumente\n\nDie Quelle.');
 assert.equal(appendix.sections.find(s=>s.title==='Meine Einordnung').html.includes('Zieldefinition'),false);
});

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
test('section IDs survive publication typography and missing anchors fail visibly',()=>{
 const diagram={sectionId:'kontext-und-folgen',mode:'comparison',items:['Ein belegter Satz.']};
 for(const dash of ['-','\u2013']){
  assert.match(renderEditorialMarkdown(`## Kontext ${dash} und Folgen\n\nEin belegter Satz.`,{sectionDiagrams:[diagram]}).html,/data-editorial-explanatory-visual/);
 }
 assert.throws(()=>renderEditorialMarkdown('## Anderer Abschnitt\n\nEin belegter Satz.',{sectionDiagrams:[diagram]}),/SECTION_NOT_FOUND/);
});
test('unchanged reviewed publications have real diagrams; later revisions remain publishable',()=>{
 const rows=auditEditorialVisuals(root);
 assert.ok(rows.every(row=>Number.isInteger(row.diagrams)&&row.diagrams>=0));
 assert.ok(diagramLayouts.entries.length>=30);
 for(const entry of diagramLayouts.entries){
  const row=rows.find(r=>r.slug===entry.slug);
  // Withdrawn or archived editions are not a reason to block other news.
  if(!row)continue;
  // A later, separately approved manuscript must not inherit its old layout
  // or stop the normal publication pipeline. The explicit visual audit reports
  // stale plans; the hash guard above leaves the new manuscript intact.
  if(row.layout_status==='stale')continue;
  if (!entry.typesetting_only) assert.ok(row?.diagrams>0,entry.slug);
  assert.equal(row.layout_status,'bound',entry.slug);
 }
 // New editorial arrivals are reported by --check-latest, not a reason to
 // block unrelated automatic news releases with a moving historical fixture.
});
