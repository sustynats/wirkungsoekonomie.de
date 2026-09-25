import test from 'node:test';
import assert from 'node:assert/strict';
import {loadPersonalEditorials} from '../../scripts/news/personal-editorial.mjs';
import {applyApprovedEditorialRevisions} from '../../scripts/news/editorial-approved-revisions.mjs';
import {editorialAnalysisPage} from '../../scripts/news/build.mjs';

test('Thiel: author introduction replaces the obsolete deck across hero, body and share metadata',()=>{
 const originals=loadPersonalEditorials(process.cwd());
 const base=originals.find(a=>a.analysis_id==='woek-personal-39ecb068abaa3237');
 const updated=applyApprovedEditorialRevisions(originals,process.cwd(),{partial:true}).find(a=>a.analysis_id===base.analysis_id);
 const intro=base.body_markdown.split('\n\n')[1];
 assert.ok(intro.startsWith('Das Spannende an diesem Gespräch ist für mich nicht,'));
 assert.equal(updated.subtitle,intro);
 assert.equal(updated.teaser,intro);
 assert.equal(updated.body_markdown,base.body_markdown.split('\n\n').slice(2).join('\n\n'));
 assert.deepEqual(updated.sources,base.sources);
 assert.equal(updated.slug,base.slug);
 const html=editorialAnalysisPage(updated);
 assert.ok(!html.includes('Peter Thiel fordert von Politik und Demokratie Funktion.'));
 assert.ok(html.includes('<p class="hero-subtitle">'+intro+'</p>'));
 assert.ok(html.includes('property="og:description" content="'+intro+'"'));
 assert.ok(html.includes('name="description" content="'+intro+'"'));
 assert.ok(html.includes('Korrektur vom'));
 assert.ok(!updated.body_markdown.includes(intro),'the opening is visible once, not duplicated in the body');
});
