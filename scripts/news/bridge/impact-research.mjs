// Context research uses the same bounded public access path as discovery.
// No model, reader proxy, credentials, or paid provider is invoked here.
import { loadNewsRegistry } from '../registry.mjs';
import { fetchPublicArticle, extractArticleText } from '../lib.mjs';
import { safeUrl, hash, assertSchema } from './contract.mjs';
import {sourceAccess} from '../access-policy.mjs';
import {withRequestDeadline} from '../request-deadline.mjs';
export const RESEARCH_FUNCTIONS = ['event','mechanism','reference','counter_evidence'];
export const researchSourceSchema = {
  type: 'array', maxItems: 12, items: { type: 'object', additionalProperties: false,
    required: ['source_id','url','title','publisher','source_function','quote','supports'], properties: {
      source_id: { type:'string', pattern:'^research-[a-z0-9-]{3,100}$' }, url: { type:'string', format:'https-url', maxLength:4000 },
      title:{type:'string',minLength:8,maxLength:1000},publisher:{type:'string',minLength:2,maxLength:500},
      source_function:{enum:RESEARCH_FUNCTIONS},quote:{type:'string',minLength:40,maxLength:1200},
      supports:{type:'string',minLength:12,maxLength:2000}, published_at:{type:['string','null'],maxLength:80},
    },
  },
};
const comparable = value => String(value).normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
export async function verifyImpactResearch(bridge, candidates = [], existing = [], now, { root = process.cwd(), fetchDocument = fetchPublicArticle } = {}) {
  if (!Array.isArray(candidates) || candidates.length > 12) throw Error('IMPACT_RESEARCH_SOURCE_LIMIT');
  assertSchema(researchSourceSchema, candidates);
  if (!candidates.length) return [];
  const registry = loadNewsRegistry(root);
  const ids = new Set(existing.map(s=>s.source_id)), accepted = [];
  for (const candidate of candidates) {
    const url = safeUrl(candidate.url), hostname = new URL(url).hostname;
    if (ids.has(candidate.source_id) || !/^research-[a-z0-9-]{3,100}$/.test(candidate.source_id) || !RESEARCH_FUNCTIONS.includes(candidate.source_function)) throw Error('IMPACT_RESEARCH_SOURCE_ID_CONFLICT');
    ids.add(candidate.source_id);
    const original = registry.sources.find(s=>[s.url,s.feed_url].filter(Boolean).some(u=>new URL(u).hostname===hostname));
    const source = original || { source_id:candidate.source_id,url,feed_url:url,enabled:true,role:'B',
      access:{status:'public',article:'bounded_public_text',cost_usd:0,requires_login:false,requires_payment:false},
      rsl_url:new URL('/.well-known/rsl.xml',url).href };
    const access=sourceAccess(source,'article');
    if(!access.allowed)throw Error(access.reason);
    const fetchBounded=()=>withRequestDeadline(()=>fetchDocument({url},source,{...registry.policy,allow_public_pdf:true,respect_robots:true}),
      {timeoutMs:120000,code:'IMPACT_RESEARCH_REQUEST_TIMEOUT'});
    if(process.env.GITHUB_ACTIONS==='true')console.info(JSON.stringify({event:'impact_research',source_id:candidate.source_id,stage:'start'}));
    const cacheKey = `impact-research-document:${hash(url)}`;
    let document = await bridge.store.observation(cacheKey);
    if (!document || Date.parse(now)-Date.parse(document.at)>86400000) {
      const fetched = await fetchBounded();
      const text = fetched.extracted_from === 'public_pdf' ? fetched.body : extractArticleText(fetched.body,120000);
      // Only a bounded private excerpt is retained, never the complete document.
      const normalized = comparable(text), quote = comparable(candidate.quote);
      const at = normalized.indexOf(quote);
      if (quote.length < 40 || at < 0) throw Error('IMPACT_RESEARCH_QUOTE_NOT_FOUND');
      document = { at:now,url,final_url:fetched.final_url,content_hash:hash(text),
        excerpt: normalized.slice(Math.max(0,at-160),at+quote.length+320), excerpt_hash:hash(quote) };
      await bridge.store.observe(cacheKey,document);
    }
    if (!comparable(document.excerpt).includes(comparable(candidate.quote))) {
      // Different claims in the same document require their own verified excerpt.
      const fetched = await fetchBounded();
      const text = fetched.extracted_from === 'public_pdf' ? fetched.body : extractArticleText(fetched.body,120000);
      const full = comparable(text), quote = comparable(candidate.quote), at = full.indexOf(quote);
      if (quote.length<40 || at<0) throw Error('IMPACT_RESEARCH_QUOTE_NOT_FOUND');
      document = {at:now,url,final_url:fetched.final_url,content_hash:hash(text),excerpt:full.slice(Math.max(0,at-160),at+quote.length+320),excerpt_hash:hash(quote)};
      await bridge.store.observe(cacheKey,document);
    }
    accepted.push({source_id:candidate.source_id,url,title:candidate.title,publisher:candidate.publisher,
      source_role:candidate.source_function,source_function:candidate.source_function,summary:candidate.supports,
      article_excerpt:document.excerpt,published_at:candidate.published_at||null,retrieved_at:now,
      research_verification:{status:'source_text_verified',at:now,content_hash:document.content_hash,excerpt_hash:document.excerpt_hash},
    });
    if(process.env.GITHUB_ACTIONS==='true')console.info(JSON.stringify({event:'impact_research',source_id:candidate.source_id,stage:'verified'}));
  }
  return accepted;
}
