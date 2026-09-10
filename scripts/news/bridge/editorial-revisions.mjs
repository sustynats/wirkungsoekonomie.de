import {hash} from './contract.mjs';
import {sendDiscord} from '../../ops/discord-monitor.mjs';
export function prepareEditorialRevisions({store,approval,now=()=>new Date().toISOString()}){
 let created=0;
 const records=approval.db.prepare("SELECT body FROM editorial_reviews WHERE json_extract(body,'$.status')='REVISION_REQUESTED'").all().map(r=>JSON.parse(r.body));
 for(const review of records){
  const parent=store.get(review.job_id);if(!parent)continue;
  const content={...parent.input.request,revision:{previous_preview:review.preview,previous_hash:review.preview_hash,comments:review.comments}};
  const inputHash=hash(content),id=parent.input.job_id.slice(0,20)+hash({type:'editorial_revision',parent:review.job_id,inputHash}).slice(0,24);
  if(store.get(id))continue;
  const input={...parent.input,job_id:id,input_hash:inputHash,created_at:now(),request:content};
  store.put({input,candidate:parent.candidate,status:'intake_prepared',created_at:now(),attempts:{},intake:{...parent.intake,review_parent:review.job_id,triggered_at:now(),triggered_by:review.owner}});
  store.observe('editorial-revision:'+id,{parent:review.job_id,preview_hash:review.preview_hash,created_at:now()});created++;
 }
 return created;
}

export async function notifyEditorialReviews({approval,store,config,fetchImpl=fetch}){
 if(!config?.token||!/^\d{15,22}$/.test(config.recipient||''))return;
 const records=approval.list(config.recipient).filter(r=>r.status==='AWAITING_FINAL_APPROVAL');
 for(const r of records){
  const key='editorial-notified:'+r.job_id+':'+r.preview_hash;if(store.observation(key)?.sent_at)continue;
  const previous=store.observation(key);if(previous?.retry_after&&Date.parse(previous.retry_after)>Date.now())continue;
  try{
   const content=`Neue Vorschau zur Freigabe: ${r.preview.title}\nText, Quellen und Bild liegen bereit. Bitte freigeben oder mit Kommentar zurückgeben:\nhttps://wirkungsoekonomie.de/admin/redaktion/#freigeben`;
   await sendDiscord({id:hash(key).slice(0,24),content},{...config,fetchImpl});store.observe(key,{sent_at:new Date().toISOString()});
  }catch{store.observe(key,{retry_after:new Date(Date.now()+15*60000).toISOString(),status:'NOTIFICATION_PENDING'});}
 }
}
