import { canonicalizeUrl, fetchPublicArticle, sanitizeFeedText, sha256 } from './lib.mjs';
import { sourceAccess } from './access-policy.mjs';

const VERSION = 'bundestag-hib-date-v1';
const PARSER_REVISION = 2;
const MAX_FETCHES = 3;
const RETRY_MS = 60 * 60 * 1000;
const fingerprint = item => sha256(JSON.stringify([item.url, item.title, item.summary, item.content_hash]));
const plain = value => sanitizeFeedText(value || '', 500).normalize('NFC').replace(/\s+/g, ' ').trim();
// RSS and HTML can use different quotation typography for the same heading.
// Preserve every word, number and quotation mark; this is not fuzzy matching.
const titleIdentity = value => plain(value).replace(/[„“”«»]/g, '"').replace(/[‚‘’‹›]/g, "'");
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map(m => [m[1].toLowerCase(), m[3]]));

function hibUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['www.bundestag.de', 'bundestag.de'].includes(url.hostname)
      && !url.username && !url.password && !url.port && !url.search && !url.hash
      && /^\/presse\/hib\/kurzmeldungen-\d+$/.test(url.pathname);
  } catch { return false; }
}

function validDay(value) {
  const match = String(value).match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;
  const day = `${match[3]}-${match[2]}-${match[1]}`;
  const timestamp = Date.parse(day);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === day ? day : null;
}

const berlinDay = now => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now));
function validCachedDay(value, now) {
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return Boolean(match && validDay(`${match[3]}.${match[2]}.${match[1]}`) === value && value <= berlinDay(now));
}

// Provider-specific metadata, not a generic search for a date somewhere in a
// page. Publication metadata, visible article date and exact title must agree.
export function publicationDateFromHib({ body, final_url }, item, now) {
  if (!hibUrl(item.url) || !hibUrl(final_url) || canonicalizeUrl(final_url) !== canonicalizeUrl(item.url)) return null;
  const html = String(body).replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map(m => attributes(m[0]));
  const dates = metas.filter(m => m.name?.toLowerCase() === 'date').map(m => validDay(m.content));
  const visible = [...html.matchAll(/<span\b([^>]*)>([\s\S]*?)<\/span>/gi)]
    .filter(m => /(?:^|\s)bt-date(?:\s|$)/.test(attributes(m[1]).class || '')).map(m => validDay(plain(m[2])));
  if (dates.length !== 1 || !dates[0] || visible.length !== 1 || visible[0] !== dates[0]) return null;
  const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => titleIdentity(m[1]));
  if (headings.length !== 1 || headings[0] !== titleIdentity(item.title)) return null;
  const canonical = [...head.matchAll(/<link\b[^>]*>/gi)].map(m => attributes(m[0])).filter(a => a.rel?.toLowerCase() === 'canonical');
  if (canonical.some(a => canonicalizeUrl(a.href, item.url) !== canonicalizeUrl(item.url))) return null;
  if (dates[0] > berlinDay(now)) return null;
  // A calendar date stays a calendar date; no invented publication time.
  return { published_at: dates[0], published_precision: 'day' };
}

export function createPublicationDateRecovery({ registry, state, now, fetchArticleImpl = fetchPublicArticle }) {
  const stats = { attempted: 0, verified: 0, cached: 0, held: 0, deferred: 0, failures: [] };
  const cache = state.source_publication_dates || (state.source_publication_dates = {});
  const byId = new Map(registry.sources.map(source => [source.source_id, source]));
  async function recover(sources) {
    const result = [];
    for (const item of sources) {
      const source = byId.get(item.source_id);
      const eligible = !item.published_at && !item.source_published_at && hibUrl(item.url)
        && source?.publication_date_adapter === VERSION && source.primary_source === true
        && source.enabled && source.role === 'A' && source.official_endpoint_verified === true
        && source.technical_access === 'verified' && ['metadata_only', 'metadata_syndication_allowed'].includes(source.legal_use_status)
        && sourceAccess(source, 'article').allowed;
      if (!eligible) { result.push(item); continue; }
      const key = sha256(item.url), itemFingerprint = fingerprint(item), saved = cache[key];
      let date = saved?.version === VERSION && saved.fingerprint === itemFingerprint
        && saved.status === 'verified' && saved.url === item.url && saved.published_precision === 'day'
        && validCachedDay(saved.published_at, now)
        && Number.isFinite(Date.parse(saved.checked_at)) && Date.parse(saved.checked_at) <= Date.parse(now) ? saved : null;
      if (date) stats.cached++;
      else if (saved?.version === VERSION && saved.parser_revision === PARSER_REVISION
          && saved.fingerprint === itemFingerprint && Date.parse(saved.retry_after || '') > Date.parse(now)) {
        stats.deferred++;
      } else if (stats.attempted < MAX_FETCHES) {
        stats.attempted++;
        let reason = 'PUBLICATION_METADATA_NOT_ESTABLISHED';
        try {
          const document = await fetchArticleImpl(item, source, registry.policy);
          const parsed = publicationDateFromHib(document, item, now);
          if (parsed) {
            date = { version: VERSION, parser_revision: PARSER_REVISION, status: 'verified', url: item.url, fingerprint: itemFingerprint, checked_at: now, ...parsed };
            cache[key] = date;
            stats.verified++;
          }
        } catch { reason = 'PUBLICATION_METADATA_FETCH_FAILED'; }
        if (!date) {
          cache[key] = { version: VERSION, parser_revision: PARSER_REVISION, status: 'open', url: item.url, fingerprint: itemFingerprint, checked_at: now, retry_after: new Date(Date.parse(now) + RETRY_MS).toISOString() };
          stats.held++;
          stats.failures.push({ source_id: item.source_id, url: item.url, reason });
        }
      } else stats.deferred++;
      result.push(date ? { ...item, published_at: date.published_at, source_published_at: date.published_at,
        published_precision: 'day', publication_date_evidence: { version: VERSION, url: date.url, checked_at: date.checked_at, fingerprint: itemFingerprint } } : item);
    }
    return result;
  }
  return { recover, stats };
}
