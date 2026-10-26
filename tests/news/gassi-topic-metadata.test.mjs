import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {applyReviewedGassiTopicClarification as apply,applyDocumentedGassiTopicClarification} from '../../scripts/news/clarify-gassi-topic.mjs';
import {storyPage} from '../../scripts/news/build.mjs';
import {syntheticPotentialAssessment} from './fixtures/impact21.mjs';
import {assessmentBasis,persistedImpactAssessmentErrors} from '../../scripts/news/migrate-impact-assessments.mjs';
import {classifyItem} from '../../scripts/news/lib.mjs';
import {renderTitleImage,SIZES} from '../../scripts/news/title-image/index.mjs';
import {measure} from '../../scripts/news/title-image/text.mjs';
import {MAGNITUDE} from '../../scripts/news/impact-assessment.mjs';
const hash=value=>createHash('sha256').update(value).digest('hex');
const at='2026-10-26T19:00:00.000Z';
function fixture(){
  const paragraph='Der synthetische Testbericht beschreibt einen Vorfall und ausdrücklich offene Einzelheiten. Er bestätigt weder tatsächliche Absichten noch eine eingetretene Wirkung. Der Quellenstand bleibt vorläufig und lässt keine weitergehenden Schlüsse zu. Diese Testbeschreibung ist keine neue Nachricht oder Wirkungsbewertung.';
  const source_summary=paragraph+'\n\n'+paragraph+'\n\n'+paragraph;
  const analysis={story_id:'wt-test-gassi',summary:'Ein synthetischer Vorfall betrifft öffentliche Information. Seine möglichen Folgen bleiben offen.',detail_summary:paragraph,
    why_relevant:'Ein Vorfall betrifft die öffentliche Einordnung.',status:'offen',analysis_type:'ex_ante',importance:'mittel',
    impact_potential:'Ein bedingter Informationspfad bleibt offen.',systemic_relevance:'Keine systemische Änderung belegt.',
    transformation_potential:'Keine strukturelle Änderung belegt.',resilience:'Weitere Klärung bleibt möglich.',
    evidence_level:'Ein synthetischer Quellenstand.',attribution:'Keine unabhängige Bestätigung.',
    ...Object.fromEntries(['impact_risks','mechanisms','first_order','second_order','third_order','side_effects','uncertainties','watch_next','reference_frameworks'].map(k=>[k,['Eine synthetische Annahme bleibt zu prüfen.']])),
    impact_assessment:syntheticPotentialAssessment(),publication_recommendation:true,
    publication_gate:{news_value:'new_evidence',materiality_factors:['affected_scope','duration'],exceptional_factor:'none',
      evidence_basis:'attributed_single_source',duplicate_status:'new_story',rationale:'Ein begrenzter synthetischer Sachstand mit ausdrücklich benannten Grenzen.'}};
  const story={story_id:'wt-test-gassi',title:'Synthetischer Vorfall beim Gassigehen',slug:'synthetischer-vorfall',published:true,listed:true,topic:['Energie'],
    published_at:'2026-10-26T16:43:18.405Z',updated_at:'2026-10-26T16:43:18.405Z',last_updated:'2026-10-26T16:43:18.405Z',
    current_version:1,content_hash:'paid-original',source_summary,analysis,
    sources:[{source_id:'official',publisher:'Synthetische Quelle',source_topic:'Gesellschaft',url:'https://official.example/story',
      title:'Synthetischer Vorfall beim Gassigehen',primary_source:true,
      summary:'Die synthetische Originalquelle nennt einen vorgegebenen Sachverhalt und dessen offene Einzelheiten.',content_hash:'source-hash'}],
    claims:[{claim_id:'c1',source_id:'official',claim:'Ein synthetischer Vorfall bleibt zugeschrieben.',status:'single_source_claim'}],
    source_integrity:{status:'verified',publication_status:'eligible',checked_at:'2026-10-26T16:44:00Z',issue_codes:[],warning_codes:[]},
    versions:[{version:1,source_summary,analysis:structuredClone(analysis),provider:'paid-original'}],
    publication_history:[{version:1,published_at:'2026-10-26T16:43:18.405Z',source_count:1}],
    title_image:{mode:'impact_card',og:{url:'https://example.org/original-immutable.png'},opaque:'retain'},
    original_potential_assessment:structuredClone(analysis.impact_assessment),impact_assessment:structuredClone(analysis.impact_assessment),
    paid_output_marker:{opaque:'preserve'},ai_retry:{retry_count:1,fingerprint:'paid'}};
  story.impact_assessment_basis=assessmentBasis(story);
  const reviewed={story_id:story.story_id,version:1,published_at:story.published_at,content_hash:story.content_hash,
    summary_sha256:hash(source_summary),corrected_topics:['Gesellschaft'],
    ...Object.fromEntries(['title','topic','analysis','sources','claims','versions','title_image'].map(k=>[`${k}_sha256`,hash(JSON.stringify(story[k]))]))};
  return{story,reviewed};
}
test('a hash-bound topic correction keeps every paid field and the first edition intact',()=>{
  const{story,reviewed}=fixture(),before=structuredClone(story),result=apply(story,reviewed,at);
  assert.equal(result.status,'applied',JSON.stringify({reason:result.reason,issues:result.issues}));const r=result.record;
  assert.deepEqual(story,before);assert.deepEqual(r.topic,['Gesellschaft']);assert.equal(r.current_version,2);
  for(const k of Object.keys(before).filter(k=>!['topic','versions','current_version','updated_at','last_updated','publication_history'].includes(k)))assert.deepEqual(r[k],before[k],k);
  assert.deepEqual(r.versions[0],before.versions[0]);assert.equal(r.versions[1].provider,null);assert.equal(r.versions[1].model,null);
  assert.deepEqual(r.corrections[0].previous_title_image,before.title_image);
  assert.deepEqual(persistedImpactAssessmentErrors(r),[]);assert.equal(r.impact_assessment_basis,before.impact_assessment_basis);
  const repeated=apply(r,reviewed,'2026-10-27T00:00:00Z');assert.equal(repeated.status,'already_applied');assert.deepEqual(repeated.record,r);
  const html=storyPage(r);assert.match(html,/Korrektur vom/);assert.match(html,/Gassigehen/);assert.match(html,/Version 1/);assert.match(html,/Version 2/);
});
test('changed input, open source gates, uncertain requests and manual editions all refuse the correction',()=>{
  for(const change of[
    s=>s.current_version++,s=>{s.source_summary+=' changed';},s=>{s.analysis.summary+=' changed';},s=>{s.topic=['Klima'];},
    s=>{s.content_hash='new';},s=>{s.sources[0].content_hash='new';},s=>{s.claims[0].claim+=' changed';},s=>{s.versions[0].provider='changed';},s=>{s.title_image.og.url+='changed';},
    s=>{s.updated_at=at;},s=>{s.provider_request_hold={};},s=>{s.pending_update={};},s=>{s.review_checkpoint={};},
    s=>{s.manual_only=true;},s=>{s.manual_authority=true;},s=>{s.format='Buch & Wirkung';},s=>{s.editorial_approval_hash='human';},
    s=>{s.listed=false;},s=>{s.retirement={};},s=>{s.source_integrity.warning_codes.push('OPEN');},
    s=>{s.source_integrity.checked_at='2027-01-01T00:00:00Z';},s=>{s.impact_assessment_basis='stale';},
  ]){const{story,reviewed}=fixture();change(story);const before=structuredClone(story);assert.equal(apply(story,reviewed,at).status,'held');assert.deepEqual(story,before);}
  const{story,reviewed}=fixture();assert.equal(apply(story,reviewed,'invalid').status,'held');
  assert.equal(apply(story,reviewed,'2026-10-25T00:00:00Z').status,'held');
  assert.deepEqual(applyDocumentedGassiTopicClarification([story],at),[]);
});

test('walking dogs is a society topic without changing relevance, evidence or other gates',()=>{
  for(const phrase of['Gassigehen','Gassi gehen','Gassigeher','Gassigeherin']){
    const item={title:`Synthetischer Vorfall beim ${phrase}`,summary:'Die Polizei nennt offene Einzelheiten.',categories:[],source_topic:'Gesellschaft'};
    const before=structuredClone(item),result=classifyItem(item,{topic:'Gesellschaft'});
    const control=classifyItem({...item,title:item.title.replace(phrase,'Spaziergang')},{topic:'Gesellschaft'});
    assert.deepEqual(result.topics,['Gesellschaft'],phrase);assert.deepEqual(result,control);assert.deepEqual(item,before);
  }
});
test('actual gas topics remain energy topics beside a dog-walking reference',()=>{
  for(const phrase of['Gaspreis','Gasleitung','Gasspeicher','Gasversorgung','Gasheizung','Gasförderung','Gaslieferung','Gasströme']){
    const item={title:`${phrase}: Synthetische Meldung`,summary:'Ein Hinweis erwähnt Gassigehen.',categories:[]};
    assert.ok(classifyItem(item,{topic:'Gesellschaft'}).topics.includes('Energie'),phrase);
  }
});
for(const size of Object.keys(SIZES))test(`long magnitude labels fit beside dimension names in ${size} cards`,()=>{
  const input={headline:'Synthetische Meldung',category:['Gesellschaft'],source:'Synthetische Quelle',date:'2026-10-26',mode:'impact_card',
    dimensions:{human:{magnitudeBars:0},planet:{magnitudeBars:0},democracy:{magnitudeBars:0}}};
  const {svg}=renderTitleImage(input,{size,fonts:'none'});
  const labels=new Map([...svg.matchAll(/<text ([^>]+)>(Mensch|Planet|Demokratie)<\/text>/g)].map(m=>[m[2],m[1]]));
  const attr=(text,name)=>Number(text.match(new RegExp(name+'="([^"]+)"'))?.[1]);
  const levels=[...svg.matchAll(/<g data-impact-level="([^"]+)"><title>([^<]+)<\/title><text ([^>]+)>([^<]*)<\/text><\/g>/g)];
  assert.equal(levels.length,3);
  for(const [,key,title,attrs,text]of levels){
    const label={human:'Mensch',planet:'Planet',democracy:'Demokratie'}[key],labelAttrs=labels.get(label);
    assert.ok(title.includes(MAGNITUDE[0]),'the complete contextual meaning remains in the SVG title');
    const labelRight=attr(labelAttrs,'x')+measure(label,'sans-600',attr(labelAttrs,'font-size'));
    const valueLeft=attr(attrs,'x')-measure(text,'sans-500',attr(attrs,'font-size'));
    assert.ok(valueLeft>=labelRight+5,`${key}: value must not overlap the dimension name`);
    assert.ok(Math.abs(attr(attrs,'y')-attr(labelAttrs,'y'))<1);
  }
});
