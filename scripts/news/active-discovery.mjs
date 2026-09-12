import { fetchFeed, fetchPublicArticle, parseFeed, sha256, sanitizeFeedText, preAnalyzeStory } from './lib.mjs';
import { sourceAccess } from './access-policy.mjs';
import { annotateSourceItem } from './newsroom.mjs';
import { categoryCoverage, eventCategories, eventSignals, balanceEventQueue, COVERAGE_CATEGORIES } from './event-relevance.mjs';

const ms = value => Date.parse(value || '') || 0;
const host = value => { try { const url = new URL(value); return url.protocol === 'https:' ? url.hostname.replace(/^www\./, '') : null; } catch { return null; } };
export const DISCOVERY_LIMITS = Object.freeze({ indexes_per_run: 2, metadata_per_run: 2, candidates_per_run: 12, index_items: 120, interval_minutes: 60 });

// A query matrix over permission-reviewed public indexes, not an unlicensed
// search API or an indiscriminate full-web crawl. Empty categories run first.
export function discoveryQueries(stories, now) {
  const coverage = categoryCoverage(stories, now);
  return COVERAGE_CATEGORIES.map(category => ({ category, published_last_6h: coverage[category],
    purpose: coverage[category] ? 'cross_check_major_developments' : 'fill_observed_coverage_gap' }))
    .sort((a,b) => a.published_last_6h - b.published_last_6h);
}

export function extractDiscoveryMetadata(body, url, source) {
  const text = String(body);
  const meta = {};
  for (const match of text.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = Object.fromEntries([...match[0].matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(m => [m[1].toLowerCase(), m[2]]));
    if (attrs.property || attrs.name) meta[attrs.property || attrs.name] = attrs.content;
  }
  let article = null;
  const visit = value => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== 'object') return;
    const declaredUrl = typeof value.mainEntityOfPage === 'string' ? value.mainEntityOfPage : value.mainEntityOfPage?.['@id'] || value.url;
    if ([value['@type']].flat().some(type => ['NewsArticle', 'Article', 'ReportageNewsArticle'].includes(type))
      && (!declaredUrl || String(declaredUrl).split('#')[0].replace(/\/$/, '') === url.split('#')[0].replace(/\/$/, ''))) article ||= value;
    if (value['@graph']) visit(value['@graph']);
  };
  for (const match of text.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { visit(JSON.parse(match[1])); } catch { /* Missing/invalid metadata is a hold. */ }
  }
  const title = sanitizeFeedText(article?.headline || meta['og:title'] || '', 220);
  const summary = sanitizeFeedText(article?.description || meta.description || meta['og:description'] || '', 1000);
  const declaredDay = source.primary_source && source.official_endpoint_verified
    ? pressReleaseDay(text) : null;
  const rawDate = article?.datePublished || meta['article:published_time'] || declaredDay;
  // Never promote dateModified or sitemap lastmod to publication time.
  if (!title || !rawDate || !ms(rawDate)) return null;
  return { source_id: source.source_id, publisher: source.name, source_type: source.source_type,
    primary_source: Boolean(source.primary_source), source_priority: 0, source_topic: source.topic,
    title, summary, url, published_at: rawDate === declaredDay ? declaredDay : new Date(ms(rawDate)).toISOString(),
    ...(rawDate === declaredDay ? {published_precision:'day'} : {}), item_id: sha256(url),
    content_hash: sha256(`${title}:${summary}:${rawDate}`), categories: [] };
}

// An explicitly labelled release heading is publication evidence. Dates in
// paragraphs, URLs, update metadata or related links are not publication dates.
function pressReleaseDay(html) {
  const clean=String(html).replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
  const headings=[...clean.matchAll(/<h[12]\b[^>]*>([\s\S]*?)<\/h[12]>/gi)].map(m=>sanitizeFeedText(m[1],500).trim());
  const declarations=headings.filter(s=>/^Pressemitteilung\b/i.test(s));
  if(declarations.length!==1)return null;
  const m=declarations[0].match(/^Pressemitteilung(?:\s+Nr\.?\s+[\w/-]+)?\s+vom\s+(\d{1,2})\.\s+(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s+(20\d{2})$/i);
  if(!m)return null;
  const months=['januar','februar','märz','april','mai','juni','juli','august','september','oktober','november','dezember'];
  const day=`${m[3]}-${String(months.indexOf(m[2].toLowerCase())+1).padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  return Number.isFinite(Date.parse(day))&&new Date(day).toISOString().slice(0,10)===day?day:null;
}

export function agendaSignal(item) {
  const text = `${item.title} ${item.summary || ''}`;
  if (!/\b(?:generaldebatte|haushaltsdebatte|regierungserklärung|pressekonferenz|keynote|termin|wird\b.{0,35}\b(?:beraten|vorstellen)|berät\b|erwartet)\b/i.test(text)) return null;
  const explicit = text.match(/\b(\d{1,2})\.(\d{1,2})\.(20\d{2})\b/);
  const monthNames = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  const written = text.match(/\b(\d{1,2})\.\s+(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s+(20\d{2})\b/i);
  const date = explicit ? `${explicit[3]}-${explicit[2].padStart(2,'0')}-${explicit[1].padStart(2,'0')}`
    : written ? `${written[3]}-${String(monthNames.findIndex(m=>m.toLowerCase()===written[2].toLowerCase())+1).padStart(2,'0')}-${written[1].padStart(2,'0')}` : null;
  return { id: `agenda-${sha256(item.url).slice(0,20)}`, title: item.title, source_id: item.source_id, url: item.url,
    source_published_at: item.published_at, scheduled_date: date && ms(date) ? date : null,
    schedule_precision: date ? 'day' : 'not_established', status: 'watch_for_material_development',
    note: 'Agenda hint, not proof that an event occurred or an expected product was released.' };
}

export async function runActiveDiscovery({ registry, state, stories, now, fetchIndex = fetchFeed, fetchMetadata = fetchPublicArticle }) {
  const endpoints = registry.policy?.active_discovery?.endpoints || [];
  const queries = discoveryQueries(stories, now);
  const status = state.discovery_status ||= {};
  const result = { mode: 'bounded_public_index_search', queries, requests: 0, metadata_requests: 0, indexes: [], items: [], agenda: [], errors: [] };
  const due = endpoints.filter(endpoint => {
    const source = registry.sources.find(s => s.source_id === endpoint.source_id);
    return endpoint.enabled && endpoint.access_reviewed_at && source?.enabled && sourceAccess(source).allowed
      && ms(state.source_status?.[source.source_id]?.governance_hold_until) <= ms(now)
      && !['disabled', 'restricted'].includes(source.access?.status)
      && host(endpoint.url) && host(endpoint.url) === host(source.url)
      && ms(now) - ms(status[endpoint.id]?.last_attempt) >= DISCOVERY_LIMITS.interval_minutes * 60000;
  }).sort((a,b) => ms(status[a.id]?.last_attempt) - ms(status[b.id]?.last_attempt)).slice(0, DISCOVERY_LIMITS.indexes_per_run);
  const seenUrls = new Set(Object.values(state.seen_items || {}).map(item => item.url));
  const seenHashes = new Map(Object.values(state.seen_items || {}).map(item => [item.url,item.content_hash]));
  const pool = [];
  for (const endpoint of due) {
    const source = registry.sources.find(s => s.source_id === endpoint.source_id);
    const probe = { ...source, feed_url: endpoint.url, source_type: endpoint.type, max_items: DISCOVERY_LIMITS.index_items,
      etag: status[endpoint.id]?.etag, last_modified: status[endpoint.id]?.last_modified };
    status[endpoint.id] = { ...status[endpoint.id], last_attempt: now, source_id: source.source_id, url: endpoint.url };
    try {
      result.requests += 1;
      const response = await fetchIndex(probe, registry.policy);
      if (response.not_modified) { result.indexes.push({ id: endpoint.id, not_modified: true }); continue; }
      let items = parseFeed(response.body, probe).filter(item => host(item.url) === host(source.url));
      if (!items.length && endpoint.type === 'news_sitemap' && !/<!DOCTYPE|<!ENTITY/i.test(response.body)) {
        // A generic sitemap supplies only URLs. Resolve at most two permitted
        // article metadata records; lastmod is never treated as publication.
        const links = [...response.body.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m => ({ url:m[1].match(/<loc>([^<]+)<\/loc>/)?.[1]?.replace(/&amp;/g,'&'), modified:ms(m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]) }))
          .filter(row => row.url && host(row.url) === host(source.url) && !seenUrls.has(row.url))
          .sort((a,b)=>b.modified-a.modified).slice(0,20).map(row=>row.url);
        let endpointMetadataRequests = 0;
        const endpointMetadataLimit = Math.max(1, Math.floor(DISCOVERY_LIMITS.metadata_per_run / due.length));
        for (const url of links) {
          if (result.metadata_requests >= DISCOVERY_LIMITS.metadata_per_run || endpointMetadataRequests >= endpointMetadataLimit || source.access?.article !== 'bounded_public_text') break;
          result.metadata_requests += 1;
          endpointMetadataRequests += 1;
          try {
            const document = await fetchMetadata({ url }, source, registry.policy);
            const item = extractDiscoveryMetadata(document.body, document.final_url || url, source);
            if (item) items.push(item);
          } catch (error) { result.errors.push({ endpoint: endpoint.id, stage: 'metadata', error: String(error.message).slice(0,120) }); }
        }
      }
      if (!items.length) result.errors.push({ endpoint: endpoint.id, stage: 'extraction', error: 'NO_DATED_NEWS_METADATA' });
      const recent = items.filter(item => ms(item.published_at) >= ms(now)-48*3600000 && ms(item.published_at) <= ms(now)+600000);
      result.agenda.push(...recent.map(agendaSignal).filter(Boolean));
      const ordered = recent.map(item => ({ item, categories: eventCategories([item]), signals: eventSignals(item).signals }))
        .filter(row => row.signals.length || row.categories.length)
        .sort((a,b) => Number(b.signals.length > 0)-Number(a.signals.length > 0)
          || Math.min(...a.categories.map(c => queries.findIndex(q => q.category===c)), 10)-Math.min(...b.categories.map(c => queries.findIndex(q=>q.category===c)),10));
      pool.push(...ordered.filter(({item})=>seenHashes.get(item.url)!==item.content_hash).map(({item}) => ({
        ...annotateSourceItem(item, source, now), discovery_endpoint: endpoint.id, discovery_method: 'active_index_query', discovery_index_url: endpoint.url,
      })));
      Object.assign(status[endpoint.id], { last_success: now, items: recent.length, last_error: null, etag: response.etag, last_modified: response.last_modified });
      result.indexes.push({ id: endpoint.id, items: recent.length, chosen: result.items.filter(i=>i.discovery_endpoint===endpoint.id).length });
    } catch (error) {
      const message = String(error.message).slice(0,120);
      Object.assign(status[endpoint.id], { last_error: message });
      result.errors.push({ endpoint: endpoint.id, stage: 'fetch', error: message });
    }
  }
  const candidates=[...new Map(pool.map(item=>[item.url,item])).values()].map(item=>{
    const preanalysis=preAnalyzeStory({sources:[item]},now);
    return {story_id:item.url,item,selection_base_priority:preanalysis.internal_relevance_score + Math.max(0,10-(ms(now)-ms(item.published_at))/3600000),preanalysis};
  });
  result.items=balanceEventQueue(candidates,categoryCoverage(stories,now)).slice(0,DISCOVERY_LIMITS.candidates_per_run).map(candidate=>candidate.item);
  for (const index of result.indexes) index.chosen=result.items.filter(item=>item.discovery_endpoint===index.id).length;
  const agenda = [...(state.agenda_watch || []), ...result.agenda.map(item => ({ ...item, checked_at: now }))];
  state.agenda_watch = [...new Map(agenda.filter(item=>ms(item.checked_at)>=ms(now)-72*3600000).map(item => [item.id,item])).values()].slice(-100);
  return result;
}
