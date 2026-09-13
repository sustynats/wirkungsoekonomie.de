import test from 'node:test';
import assert from 'node:assert/strict';
import {sentenceCount} from '../../scripts/news/lib.mjs';
import {needsMediaReview,reviewedMediaRecord} from '../../scripts/news/bridge/media-review.mjs';
import {reviewResponseFormat} from '../../scripts/news/bridge/review-response-schema.mjs';
import {parsePacket} from '../../scripts/news/bridge/contract.mjs';

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
 assert.equal(format.name,'impact_review_bound_confirmation_v4');
 assert.ok(format.schema.required.includes('media_applicability'));
 const schema=format.schema.properties.media_applicability;
 assert.throws(()=>parsePacket(JSON.stringify({relevant:false,reason:'No'}),schema));
 assert.doesNotThrow(()=>parsePacket(JSON.stringify({relevant:false,reason:'Ein konkreter synthetischer Prüfbefund mit ausreichender Begründung.'}),schema));
 assert.equal(reviewResponseFormat({}).schema.properties.media_applicability,undefined);
});
