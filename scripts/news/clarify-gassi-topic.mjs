// Reviewed metadata correction. Paid text, assessments and history stay intact.
import {createHash} from 'node:crypto';
import {classifyItem, validateAnalysis} from './lib.mjs';
import {persistedImpactAssessmentErrors} from './migrate-impact-assessments.mjs';
import {unchangedCapacityReview} from './unchanged-capacity-review.mjs';
import {isManualEditorial} from './manual-policy.mjs';

const hash=value=>createHash('sha256').update(value).digest('hex');
const TYPE='gassi_topic_metadata_correction';
const REVIEWED=Object.freeze({
  story_id:'wt-1f89a8507cb2de84',version:1,published_at:'2026-10-26T16:43:18.405Z',
  content_hash:'2c2293954151fe10c34a86436b73b1e6c480c7920ca0c894222d5b962742ff2e',
  summary_sha256:'1f4c3c93d35480c7a7080688cacb2aa451e200da4ac4dff417ac66585ddaf4f5',
  analysis_sha256:'175de72ecc58693f7d740bfff05774342a832189150c897e2317e01781168958',
  sources_sha256:'015de63d5f2de2085f37ac16e8059c7c1fe9e12b0e19444145385c7e4643c0dd',
  claims_sha256:'3c90acc86e36a45f51c8b52802d13d845351aaa239d6cd924e83a484e85d830c',
  versions_sha256:'ec77e6142698377477f267c18e57ca2b97e84c8b1924ec7bd65f9e22e02cd823',
  topic_sha256:'b92d6ad6e94237c8abc02c11edcb81f932da1ee638c35f6870a94b33c2ad2461',
  title_sha256:'071ee7e4a09d7c271da594ed91e9b3f449de010940f6037787648da4f5f96274',
  title_image_sha256:'60aaf90227212efc78ab49408a3a784d296fa665e24422012c4d5106db255e1b',
  corrected_topics:['Gesellschaft'],
});

export function applyReviewedGassiTopicClarification(existing,reviewed,at) {
  const held=reason=>({record:existing,status:'held',reason});
  if(existing?.story_id!==reviewed.story_id)return{record:existing,status:'not_applicable'};
  if(existing.corrections?.some(c=>c.type===TYPE&&c.original_topic_sha256===reviewed.topic_sha256))return{record:existing,status:'already_applied'};
  if(!Number.isFinite(Date.parse(at))||Date.parse(at)<Date.parse(existing.updated_at))return held('CORRECTION_DATE_INVALID');
  if(!existing.published||existing.listed===false||existing.retirement||isManualEditorial(existing)||existing.manual_authority||existing.editorial_approval_hash
    ||!existing.analysis||!Array.isArray(existing.sources)||!Array.isArray(existing.versions)
    ||existing.provider_request_hold!=null||existing.review_checkpoint!=null
    ||(existing.pending_update!=null&&!unchangedCapacityReview(existing,at))
    ||existing.source_integrity?.status!=='verified'||existing.source_integrity.publication_status!=='eligible'
    ||!Array.isArray(existing.source_integrity.issue_codes)||existing.source_integrity.issue_codes.length
    ||!Array.isArray(existing.source_integrity.warning_codes)||existing.source_integrity.warning_codes.length
    ||!Number.isFinite(Date.parse(existing.source_integrity.checked_at))||Date.parse(existing.source_integrity.checked_at)>Date.parse(at))return held('CORRECTION_GATE_OPEN');
  if(existing.current_version!==reviewed.version||existing.content_hash!==reviewed.content_hash
    ||existing.published_at!==reviewed.published_at||existing.updated_at!==reviewed.published_at
    ||hash(existing.source_summary||'')!==reviewed.summary_sha256
    ||['title','topic','analysis','sources','claims','versions','title_image'].some(key=>hash(JSON.stringify(existing[key]??null))!==reviewed[`${key}_sha256`]))return held('CORRECTION_INPUT_CHANGED');
  const gassi=/\bgassi(?:geh\p{L}*)?\b/giu;
  if(!existing.sources.some(s=>/\bgassi(?:geh\p{L}*)?\b/iu.test(`${s.title||''} ${s.summary||''}`)))return held('CORRECTION_NOT_APPLICABLE');
  const derived=[...new Set(existing.sources.flatMap(s=>classifyItem({...s,
    title:(s.title||'').replace(gassi,' '),summary:(s.summary||'').replace(gassi,' ')},{topic:s.source_topic}).topics))];
  if(JSON.stringify(derived)!==JSON.stringify(reviewed.corrected_topics))return held('CORRECTION_TOPIC_NOT_ESTABLISHED');
  const errors=[...validateAnalysis({...existing.analysis,source_summary:existing.source_summary},existing,{validateSourceSummaryNumbers:false,persisted:true}),
    ...persistedImpactAssessmentErrors(existing)];
  if(errors.length)return{...held('CORRECTION_VALIDATION_FAILED'),issues:errors};
  const record=structuredClone(existing);
  record.topic=[...reviewed.corrected_topics];record.current_version++;record.updated_at=record.last_updated=at;
  record.versions.push({version:record.current_version,analyzed_at:at,content_hash:record.content_hash,
    title:record.title,topic:[...record.topic],source_summary:record.source_summary,analysis:structuredClone(record.analysis),claims:structuredClone(record.claims),
    source_versions:record.sources.map(({source_id,url,content_hash})=>({source_id,url,content_hash})),
    provider:null,model:null,mode:'topic_metadata_correction_no_generation',retained_analysis_version:reviewed.version,method_sources:[]});
  record.corrections=[...(existing.corrections||[]),{at,type:TYPE,original_topic_sha256:reviewed.topic_sha256,
    previous_title_image:structuredClone(existing.title_image||null),
    note:'Die erste Fassung war dem Themenfeld Energie zugeordnet, weil die automatische Zuordnung das Wort „Gassigehen“ fälschlich als Gasbezug erkannte. Das Themenetikett wurde auf Gesellschaft berichtigt. Nachrichtentext, Quellen, Claims und Wirkungsbewertung bleiben unverändert; die Erstfassung bleibt im Versionsverlauf erhalten. Es wurde keine neue KI-Analyse erzeugt.'}];
  record.publication_history=[...(existing.publication_history||[]),{version:record.current_version,published_at:at,source_count:record.sources.length,change:TYPE}];
  return{record,status:'applied'};
}

export function applyDocumentedGassiTopicClarification(stories,at) {
  const matches=stories.filter(s=>s.story_id===REVIEWED.story_id);
  if(!matches.length)return[];
  if(matches.length!==1)return[{story_id:REVIEWED.story_id,status:'held',reason:'STORY_ID_AMBIGUOUS'}];
  const result=applyReviewedGassiTopicClarification(matches[0],REVIEWED,at);
  if(result.status==='applied')stories[stories.indexOf(matches[0])]=result.record;
  return[{story_id:REVIEWED.story_id,status:result.status,
    cards_only:['applied','already_applied'].includes(result.status)&&result.record.versions?.at(-1)?.mode==='topic_metadata_correction_no_generation',
    ...(result.reason?{reason:result.reason}:{})}];
}
