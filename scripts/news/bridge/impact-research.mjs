// Context research uses the same bounded public access path as discovery.
// No model, reader proxy, credentials, or paid provider is invoked here.
import { loadNewsRegistry } from '../registry.mjs';
import { fetchPublicArticle, extractArticleText } from '../lib.mjs';
import { safeUrl, hash, assertSchema } from './contract.mjs';
import {sourceAccess} from '../access-policy.mjs';
import {withRequestDeadline} from '../request-deadline.mjs';
import { RESEARCH_FUNCTIONS, researchSourceSchema } from './research-source-schema.mjs';
export { RESEARCH_FUNCTIONS, researchSourceSchema } from './research-source-schema.mjs';
const comparable = value => String(value).normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
function sourceFailure(error, sourceId) {
  // Keep access refusals intact, but identify the supplementary source in the
  // private repair packet. No URL, document text or provider response is added.
  if (!/^(?:RSL_|ROBOTS_|ARTICLE_)[A-Z_0-9]{1,80}$/.test(error?.message || '')) return error;
  const contextual = new Error(`${error.message}:${sourceId}`, { cause: error });
  for (const key of ['retryable', 'http_status', 'retry_after_seconds']) {
    if (error[key] !== undefined) contextual[key] = error[key];
  }
  return contextual;
}
export async function verifyImpactResearch(bridge, candidates = [], existing = [], now, { root = process.cwd(), fetchDocument = fetchPublicArticle } = {}) {
  if (!Array.isArray(candidates) || candidates.length > 12) throw Error('IMPACT_RESEARCH_SOURCE_LIMIT');
  assertSchema(researchSourceSchema, candidates, '$.research_sources');
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
    // A supplementary source can be blocked while the original news source is
    // allowed. Keep the exact research ID in the repair request so the worker
    // does not mistakenly discard the event source or retry the wrong URL.
    if(!access.allowed)throw Error(`${access.reason}:${candidate.source_id}`);
    const fetchBounded=()=>withRequestDeadline(()=>fetchDocument({url},source,{...registry.policy,allow_public_pdf:true,respect_robots:true}),
      {timeoutMs:120000,code:'IMPACT_RESEARCH_REQUEST_TIMEOUT'})
      .catch(error=>{throw sourceFailure(error,candidate.source_id);});
    if(process.env.GITHUB_ACTIONS==='true')console.info(JSON.stringify({event:'impact_research',source_id:candidate.source_id,stage:'start'}));
    const cacheKey = `impact-research-document:${hash(url)}`;
    let document = await bridge.store.observation(cacheKey);
    if (!document || Date.parse(now)-Date.parse(document.at)>86400000) {
      const fetched = await fetchBounded();
      const text = fetched.extracted_from === 'public_pdf' ? fetched.body : extractArticleText(fetched.body,120000);
      // Only a bounded private excerpt is retained, never the complete document.
      const normalized = comparable(text), quote = comparable(candidate.quote);
      const at = normalized.indexOf(quote);
      if (quote.length < 40 || at < 0) throw Error(`IMPACT_RESEARCH_QUOTE_NOT_FOUND:${candidate.source_id}`);
      document = { at:now,url,final_url:fetched.final_url,content_hash:hash(text),
        excerpt: normalized.slice(Math.max(0,at-160),at+quote.length+320), excerpt_hash:hash(quote) };
      await bridge.store.observe(cacheKey,document);
    }
    if (!comparable(document.excerpt).includes(comparable(candidate.quote))) {
      // Different claims in the same document require their own verified excerpt.
      const fetched = await fetchBounded();
      const text = fetched.extracted_from === 'public_pdf' ? fetched.body : extractArticleText(fetched.body,120000);
      const full = comparable(text), quote = comparable(candidate.quote), at = full.indexOf(quote);
      if (quote.length<40 || at<0) throw Error(`IMPACT_RESEARCH_QUOTE_NOT_FOUND:${candidate.source_id}`);
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
