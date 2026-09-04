import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {PAGE_QUESTIONS,QUESTION_TOPICS,selectContextualQuestions as select,questionHeading,normalizedPath,isSafeQuestionLink} from '../../assets/js/contextual-questions.js';
const root=fileURLToPath(new URL('../../',import.meta.url));
test('unknown pages receive no generic Planwirtschaft/Social Credit fallback',()=>{
  assert.deepEqual(select({path:'/neu/',title:'Neuer Inhalt'}),[]);
  assert.deepEqual(select({path:'/impressum.html',title:'Impressum',headings:'Wirkungssteuer Demokratie ESG'}),[]);
});
test('page headings distinguish polls, articles, publications and glossary',()=>{
  assert.equal(questionHeading('/umfragen/wirkungsticker-feedback/'),'Fragen zu dieser Umfrage');
  assert.equal(questionHeading('/blog/2026-beitrag.html'),'Fragen zu diesem Beitrag');
  assert.equal(questionHeading('/begriffe/resilienz/'),'Fragen zu diesem Begriff');
  assert.equal(questionHeading('/bibliothek/mein-dossier/'),'Fragen zu dieser Veröffentlichung');
  assert.equal(questionHeading('/institut/'),'Fragen zu dieser Seite');
  assert.equal(normalizedPath('/begriffe/resilienz/index.html'),'/begriffe/resilienz/');
});
test('library recommendations do not depend on sections replaced by the full-library generator',()=>{
  const questions=select({path:'/bibliothek/'});
  assert.equal(questions.length,3);
  assert.ok(questions.every(q=>!q.href || !q.href.startsWith('/bibliothek/#')));
  assert.ok(questions.some(q=>q.href==='/buch/'));
  assert.ok(questions.some(q=>q.href==='/tools/'));
});
test('poll questions explain the actual configured visibility and optional private feedback',()=>{
  const base={path:'/umfragen/wirkungsticker-feedback/',title:'Wie überzeugt Euch der neue Wirkungsticker?'};
  const afterVote=select({...base,poll:{visibility:'after_vote',feedback:true}});
  assert.equal(afterVote.length,3);assert.match(afterVote[0].answer,/Danach siehst Du/);assert.match(afterVote[1].answer,/freiwillig, bleibt intern/);
  assert.match(afterVote[2].answer,/nicht die Meinung der gesamten Bevölkerung/);
  assert.match(select({...base,poll:{visibility:'always'}})[0].answer,/sofort/);
  assert.match(select({...base,poll:{visibility:'after_end'}})[0].answer,/erst nach ihrem Ende/);
  assert.doesNotMatch(select({...base,poll:{feedback:false}})[1].answer,/Kommentar/);
});
test('admin, English, noindex and FAQ pages do not get extra questions',()=>{
  for(const context of [{path:'/admin/umfragen/'},{path:'/_debug/test/'},{path:'/fragen/'},{path:'/faq/messen/'},{path:'/buch/',lang:'en'},{path:'/buch/',noindex:true}])assert.deepEqual(select(context),[]);
});
test('institute, book, academy and library get distinct verified destinations',()=>{
  for(const route of ['/institut/','/buch/','/akademie.html','/bibliothek/']){
    const questions=select({path:route,title:'Wirkungsökonomie'});
    assert.equal(questions.length,3);assert.ok(questions.every(q=>!q.label.includes('Planwirtschaft')));
  }
  assert.deepEqual(select({path:'/buch.html'}),select({path:'/buch/'}));
});
test('article selection uses the subject, not arbitrary full-body terms',()=>{
  const climate=select({path:'/blog/hitzeschutz.html',title:'Hitze und Klimaanpassung',headings:'Demokratie ESG'});
  const frames=select({path:'/blog/resignifikation.html',title:'Resignifikation und Framing'});
  const pricing=select({path:'/bibliothek/value-pricing/',title:'Value Pricing'});
  assert.equal(climate[0].href,'/begriffe/klimaanpassung/');
  assert.equal(frames[0].href,'/begriffe/resignifikation/');
  assert.equal(pricing[0].href,'/begriffe/value-based-pricing/');
  assert.equal(select({path:'/blog/wohlstandsverlust-preise-klimakrise.html',title:'Der Wohlstandsverlust, den unsere Preise nicht zeigen'})[0].href,'/begriffe/wohlstand/');
  assert.deepEqual(select({path:'/journal/anderes/',title:'Ein wichtiges Thema',headings:'ESG Demokratie Resilienz'}),[]);
});
test('short topic names cannot match inside unrelated words',()=>{
  assert.deepEqual(select({path:'/anweisung/',title:'Anweisung'}),[]);
});
test('page-authored questions precede glossary and topic links; duplicates and self-links removed',()=>{
  const result=select({path:'/begriffe/resilienz/',title:'Resilienz',pageQuestions:[{label:'Was ist hier entscheidend?',href:'#a'}],glossaryQuestions:[{label:'Was bedeutet Resilienz?',href:'#b'},{label:'Was bedeutet Resilienz?',href:'#b'}]});
  assert.equal(result[0].href,'#a');assert.equal(result[1].href,'#b');assert.equal(result.length,3);
  assert.ok(result.every(item=>item.href!=='/begriffe/resilienz/'));
});
test('explicit page configuration supports opt-out and rejects unsafe links',()=>{
  assert.deepEqual(select({path:'/buch/',override:[]}),[]);
  for(const href of ['javascript:alert(1)','//evil.example','/\\evil','data:text/html,test','https://external.example/'])assert.equal(isSafeQuestionLink(href),false);
  assert.deepEqual(select({path:'/neu/',override:[{label:'Klick?',href:'javascript:alert(1)'}]}),[]);
  assert.equal(select({path:'/neu/',override:[{label:'Wie funktioniert diese Seite?',answer:'Eine passende Erklärung.'}]}).length,1);
});
test('all editorial destinations exist, including fragment anchors',()=>{
  const entries=[...Object.values(PAGE_QUESTIONS).flat(),...QUESTION_TOPICS.flatMap(t=>t.questions)];
  for(const entry of entries){
    if(!entry.href)continue;
    const [route,fragment]=entry.href.split('#');
    const file=path.join(root,route.endsWith('/')?`${route}index.html`:route);
    assert.ok(fs.existsSync(file),`${entry.label}: missing ${route}`);
    if(fragment)assert.ok(new RegExp(`id=["']${fragment}["']`).test(fs.readFileSync(file,'utf8')),`Missing answer anchor: ${route}#${fragment}`);
  }
});
test('old universal fallback and wrong fixed headline are removed',()=>{
  const main=fs.readFileSync(path.join(root,'assets/js/main.js'),'utf8');
  assert.ok(!main.includes('Passende Fragen zum Begriff'));
  assert.ok(!main.includes('function getContextualQuestions()'));
  assert.match(main,/contextual-questions\.js/);
  const module=fs.readFileSync(path.join(root,'assets/js/contextual-questions.js'),'utf8');
  assert.ok(!module.includes('.innerHTML'));
});
