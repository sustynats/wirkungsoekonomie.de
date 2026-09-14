import test from 'node:test';
import assert from 'node:assert/strict';
import {sentenceCount} from '../../scripts/news/lib.mjs';
import {needsMediaReview,reviewedMediaRecord} from '../../scripts/news/bridge/media-review.mjs';
import {reviewResponseFormat} from '../../scripts/news/bridge/review-response-schema.mjs';
import {parsePacket} from '../../scripts/news/bridge/contract.mjs';
import {syntheticMediaReview} from './fixtures/media-review.mjs';
import {prepareApiJob} from '../../scripts/news/bridge/api-processor.mjs';

test('German calendar dates do not add sentences to a two-sentence news summary',()=>{
 for(const month of ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']){
  assert.equal(sentenceCount(`Die Frist endet am 28. ${month}. Die Folgen bleiben offen.`),2);
 }
 assert.equal(sentenceCount('Die Zahl beträgt 28. Die Folgen bleiben offen.'),2);
 assert.equal(sentenceCount('Am 3. März berichtet Dr. Weber über 3.000 Fälle. Das ist vorläufig.'),2);
 assert.equal(sentenceCount('Erster Satz. Zweiter Satz. Dritter Satz.'),3);
});
test('missing media classification is completed only by an explicit independent judgment',()=>{
 const record={media_review_required:true,analysis:{summary:'Unchanged text.',media_impact:null}};
 assert.equal(needsMediaReview(record),true);
 for(const output of [{},{media_applicability:{relevant:false,reason:''}},{media_applicability:{relevant:true,reason:'Ein substanzieller Mediencheck ist erforderlich und fehlt weiterhin.'}}])assert.throws(()=>reviewedMediaRecord(record,output),/MEDIA_/);
 const judgment={relevant:false,reason:'Unabhängiger synthetischer Prüfbefund: Der belegte Vorgang benötigt hier keinen eigenen Medienwirkungscheck.'};
 const result=reviewedMediaRecord(record,{media_applicability:judgment});
 assert.equal(record.analysis.media_impact,null);
 assert.deepEqual(result.analysis.media_impact,judgment);
 assert.equal(result.analysis.summary,record.analysis.summary);
 const existing={...record,analysis:{...record.analysis,media_impact:{relevant:true,reason:'Original assessment'}}};
 assert.equal(needsMediaReview(existing),false);
 assert.strictEqual(reviewedMediaRecord(existing,{media_applicability:judgment}),existing);
});
test('the generation schema requires a reasoned media decision when the original packet binds that obligation',()=>{
 const format=reviewResponseFormat({}, {mediaRequired:true});
 assert.equal(format.name,'impact_review_bound_confirmation_v5');
 assert.ok(format.schema.required.includes('media_applicability'));
 const schema=format.schema.properties.media_applicability;
 assert.throws(()=>parsePacket(JSON.stringify({relevant:false,reason:'No'}),schema));
 assert.doesNotThrow(()=>parsePacket(JSON.stringify({relevant:false,reason:'Ein konkreter synthetischer Prüfbefund mit ausreichender Begründung.'}),schema));
 assert.equal(reviewResponseFormat({}).schema.properties.media_applicability,undefined);
});

test('the second pass can complete a relevant media check, but cannot erase unsupported claims',()=>{
 const record={media_review_required:true,title:'Im Beispiel wird vor einer Katastrophe gewarnt',sources:[],analysis:{media_impact:null}};
 const media=syntheticMediaReview(), before=structuredClone(media);
 const result=reviewedMediaRecord(record,{media_applicability:media});
 assert.equal(result.analysis.media_impact.relevant,true);
 assert.equal(result.analysis.media_impact.public_explanation,media.public_explanation);
 assert.deepEqual(media,before);assert.equal(record.analysis.media_impact,null);
 for(const change of [m=>m.public_explanation='Too short',m=>{m.observed_impact.present=true;m.discourse_effect.impact_status='observed';},
  m=>{m.political_context.relevant=true;m.political_context.evidence=[{source:'invented',claim_supported:'Unsupported claim'}];},
  m=>{m.self_frame_check.rewrite_required=true;}]){
  const invalid=structuredClone(media);change(invalid);
  assert.throws(()=>reviewedMediaRecord(record,{media_applicability:invalid}),/MEDIA_/);
 }
});

test('generation checks the completed final record last and preserves the original packet',()=>{
 const packet={job_type:'impact_semantic_review',parent_job_id:'wt_20260913T120000Z_'+'e'.repeat(24),job_id:'wt_20260913T120000Z_'+'a'.repeat(24),input_hash:'b'.repeat(64),
  proposed_assessment:{},record:{media_review_required:true,analysis:{media_impact:null}},
  instructions:'Korrigiere ausschließlich impact_assessment, keine Originalnachricht oder persönliche Meinung. Gib das vollständige geprüfte impact_assessment zurück.'};
 const before=structuredClone(packet),prompt=JSON.parse(prepareApiJob(packet,{hash:'c'.repeat(64),instructions:'Independent review.'}).prompt);
 assert.deepEqual(packet,before);
 assert.match(prompt.final_version_rule,/ENDVERSION/);assert.match(prompt.final_version_rule,/bleibt.*fail/);
 assert.doesNotMatch(prompt.assignment.instructions,/ausschließlich impact_assessment/);
 assert.match(prompt.media_completion,/VOLLSTÄNDIGEN Mediencheck/);
 assert.equal(Object.keys(prompt.output_contract.response_format.schema.properties).at(-1),'review');
 assert.doesNotThrow(()=>parsePacket(JSON.stringify(syntheticMediaReview()),prompt.output_contract.response_format.schema.properties.media_applicability));
});

// The local protocol validator must enforce unions too; provider decoding is
// not a substitute for validating Dropbox or replayed responses.
test('local union validation rejects incomplete branches and preserves secret/key guards',()=>{
 const schema=reviewResponseFormat({}, {mediaRequired:true}).schema.properties.media_applicability;
 for(const invalid of [{relevant:true,reason:'A sufficiently long but incomplete relevant assessment.'},{relevant:false,reason:'short'},
  {relevant:false,reason:'A sufficiently long decision.',unexpected:'unbound data'}]){
  assert.throws(()=>parsePacket(JSON.stringify(invalid),schema),/BRIDGE_SCHEMA_INVALID/);
 }
 assert.throws(()=>parsePacket(JSON.stringify({relevant:false,reason:'A sufficiently long synthetic independent decision.',credentials:'secret'}),schema),/BRIDGE_UNSAFE_KEY/);
});
