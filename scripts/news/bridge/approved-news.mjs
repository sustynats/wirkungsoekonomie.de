import {hash} from './contract.mjs';
import {validateAnalysis} from '../lib.mjs';
import {impactAssessmentErrors} from '../impact-assessment.mjs';
import {sourceIntegrityForStory} from '../source-integrity.mjs';
import {sameBridgeEvent} from './adapter.mjs';

export function validateApprovedNews(record){
 if(!record?.published||!record.analysis||record.impact_semantic_review?.status!=='ready')throw Error('EDITORIAL_NEWS_NATIVE_REVIEW_REQUIRED');
 const errors=[...validateAnalysis({...record.analysis,source_summary:record.source_summary},record,{persisted:true}),...impactAssessmentErrors(record.impact_assessment,record.sources,{required:true})];
 if(errors.length)throw Object.assign(Error('EDITORIAL_NEWS_VALIDATION_FAILED'),{issues:errors});
}
export function publicNewsEdition(review){
 const record=structuredClone(review.preview.news_record);validateApprovedNews(record);
 const edition={format:'approved_news',record,approval_hash:review.preview_hash};
 return {...edition,content_hash:hash(edition)};
}
export function importApprovedNews(edition,stories,registry,now){
 const {content_hash,...content}=edition;if(hash(content)!==content_hash)throw Error('EDITORIAL_NEWS_CHANGED');
 const record=structuredClone(edition.record);validateApprovedNews(record);
 if(stories.some(s=>s.editorial_approval_hash===edition.approval_hash))return {changed:false,stories};
 // No manual duplicate or silent replacement of a newer routine publication.
 if(stories.some(s=>s.published&&sameBridgeEvent(s,record)))throw Error('EDITORIAL_NEWS_ALREADY_PUBLISHED');
 const integrity=sourceIntegrityForStory(record,registry,stories,now);
 if(integrity.issues.length)throw Object.assign(Error('EDITORIAL_NEWS_SOURCE_CHANGED'),{issues:integrity.issues});
 record.editorial_approval_hash=edition.approval_hash;
 return {changed:true,stories:[...stories.filter(s=>s.story_id!==record.story_id),record]};
}
