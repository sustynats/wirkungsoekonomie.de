import crypto from 'node:crypto';
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v)).digest('hex');

export const EXAMPLE_FIELD='redaktion_v10_beispiel_und_erklaerung';
export function validateExample(value){
 for(const key of ['didaktisches_beispiel','direkte_erklaerung','emotionales_potenzial_als_hypothese','betroffene','was_der_satz_verschiebt']){
  if(typeof value?.[key]!=='string'||!value[key].trim())throw Error('EXAMPLE_FIELD_REQUIRED:'+key);
 }
 if(value.beispieltyp!=='ERFUNDENES_GEDANKENBEISPIEL_KEIN_REALER_FALL'||value.wirkungspotenzial_statt_nachweis!==true)throw Error('HYPOTHETICAL_EXAMPLE_REQUIRED');
 // These are immutable flags of the delivered proposal, not a human receipt.
 if(value.menschliche_einzelfreigabe!==false||value.technische_publikationsfreigabe!==false)throw Error('PROPOSAL_FLAGS_IMMUTABLE');
 return value;
}
export function assertExampleRelease(data,receipt){
 const entries=data.entries.filter(e=>e[EXAMPLE_FIELD]);
 if(!entries.length)return;
 if(!receipt||receipt.channel!=='direct_user_message'||receipt.person!=='Natalie Weber'||receipt.id!==data.exampleApproval||receipt.cards?.length!==180||entries.length!==180)throw Error('EXAMPLES_HUMAN_RELEASE_REQUIRED');
 const bySlug=new Map(receipt.cards.map(c=>[c.slug,c]));
 if(bySlug.size!==180)throw Error('EXAMPLES_DUPLICATE_APPROVAL');
 for(const entry of entries){
  validateExample(entry[EXAMPLE_FIELD]);const approved=bySlug.get(entry.slug);
  if(!approved||approved.id!==entry.id||approved.publicRevision!==digest(entry))throw Error('EXAMPLES_REVISION_APPROVAL_MISMATCH:'+entry.slug);
 }
}
