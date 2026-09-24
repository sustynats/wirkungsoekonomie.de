import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { loadManualEditorials, manualEdition } from '../../scripts/news/manual-editorial.mjs';
import { renderEditorialMarkdown } from '../../scripts/news/editorial-markdown.mjs';
import { editorialAnalysisPage } from '../../scripts/news/build.mjs';
import { checkManualPages } from '../../scripts/news/check-manual-pages.mjs';
import { assertAutomatable } from '../../scripts/news/manual-policy.mjs';
import { parseAuthoredVisual } from '../../assets/js/editorial-authored-visuals.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const editions=loadManualEditorials(root);
const newSlugs=['die-empoerungsfalle-cheema-mendel','orca-franziska-gaensler','code-null-florian-schwiecker'];
const manifest=JSON.parse(fs.readFileSync(path.join(root,'content/news/manual/editions.json')));
for(const slug of newSlugs) test(slug+': intact text, cover, safety, metadata and explicit accessible visual',t=>{
  const a=editions.find(a=>a.slug===slug);
  assert.equal(a.manual_only,true);assert.throws(()=>assertAutomatable(a),/AUTOMATION_FORBIDDEN/);
  const html=editorialAnalysisPage(a,undefined,{relatedAnalyses:editions});
  assert.equal((html.match(/data-authored-visual=/g)||[]).length,1);
  assert.doesNotMatch(html,/news-editorial-diagram/, 'Only the authored visual is rendered; rejected arrow examples remain prose.');
  assert.doesNotMatch(html,/WÖK_VISUAL|&lt;!--|\/undefined\//);
  assert.match(html,/aria-describedby="visual-[^"]+-note"/);
  assert.match(html,/Methodischer Hinweis/);assert.match(html,/vollständiger digitaler Buchtext lag der Redaktion nicht vor/);
  assert.match(html,/property="og:type" content="article"/);
  assert.match(html,/"@type":"Book"/);assert.match(html,/data-news-share-button/);
  assert.ok(html.includes(a.book.cover));assert.ok(html.includes(a.author.image));
  assert.notEqual(a.book.cover,a.author.image);
  assert.match(html,/href="\.\.\/\.\.\/analysen\/\?typ=book"/);
  assert.match(html,/rel="noopener noreferrer"/);
  if(slug!=='orca-franziska-gaensler')assert.match(html,/tabindex="0"><table class="data-table"/);
  if(slug==='code-null-florian-schwiecker')assert.match(html,/https:\/\/www.euspa.europa.eu\//);
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'woek-three-books-'));
  t.after(()=>fs.rmSync(temp,{recursive:true,force:true}));
  const target=path.join(temp,'wirkungsticker/analyse',slug,'index.html');
  fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,html);
  for(const asset of [a.author.image,a.book.cover]){const p=path.join(temp,asset);fs.mkdirSync(path.dirname(p),{recursive:true});fs.copyFileSync(path.join(root,asset),p);}
  assert.equal(checkManualPages(temp,[a]),1);
  fs.writeFileSync(target,html.replaceAll('Methodischer Hinweis','Entfernt'));
  assert.throws(()=>checkManualPages(temp,[a]),/PUBLISHED_TEXT_CHANGED/);
});
test('explicit visual markers reject unsupported types, duplicate IDs and malformed or executable syntax',()=>{
  const a=editions.find(a=>a.slug===newSlugs[0]);const block=a.body_markdown.match(/<!-- WÖK_VISUAL[\s\S]+?-->/)[0];
  assert.equal(parseAuthoredVisual(block).type,'system-loop');
  assert.throws(()=>parseAuthoredVisual(block.replace('system-loop','script')),/VISUAL_INVALID/);
  assert.throws(()=>parseAuthoredVisual(block.replace('positive_feedback: true','execute: true')),/VISUAL_INVALID/);
  assert.throws(()=>renderEditorialMarkdown(block+'\n\n'+block),/DUPLICATE_ID/);
  assert.throws(()=>renderEditorialMarkdown(block.replace('-->','')),/UNCLOSED/);
  assert.throws(()=>renderEditorialMarkdown('<!-- arbitrary -->'),/UNSUPPORTED_BLOCK/);
  assert.match(renderEditorialMarkdown(block.replace('Quellenprüfung','<script>alert(1)</script>')).html,/&lt;script&gt;/);
});
test('the three historical manuscripts and their rendered sections retain their exact original text',()=>{
  // Frozen against the pre-change baseline; also works in shallow CI checkouts.
  const original=[
    ['7ec3f6e4edb94b1e0536070e1f12c8575adc0b366531db64227ddca44ffe6f74','fadfcbe0a0aeb82f4f1a490bc8347d19cf7db43c5d50f1faa1d564aceb918411'],
    ['10954fb61c5f6a5bca1879a6d9a92b87679f8d16b51ea62036d463074e7b9305','1de99229a0654fe711daad8b115898c857c96cc2e06c7d27691be151e9d7f35e'],
    ['5c49b712b861780e9311397f44627a8db044391c7d21e85e2538a61da985f17d','ae13d2bb15006b823f9f5394782c13571bd3083cde2acbdd0cf16fdaad365045'],
  ];
  const hash=value=>createHash('sha256').update(value).digest('hex');
  for(const [index,record] of manifest.entries.slice(0,3).entries()){
    const current=fs.readFileSync(path.join(root,'content/news/manual',record.source_file),'utf8');
    assert.equal(hash(current),original[index][0]);
    assert.equal(hash(manualEdition(record,current).rendered.html),original[index][1]);
  }
});
