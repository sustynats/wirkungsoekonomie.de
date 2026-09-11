// Shared by the static index generator and the browser; no full article download for searching.
export const searchWords = text => String(text || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/ß/g, 'ss').match(/[a-z0-9]{2,}/g) || [];
export const searchBucket = word => { let n = 0; for (const c of word) n = (n * 31 + c.charCodeAt(0)) >>> 0; return String(n % 128); };
const STOP = new Set('der die das den dem des ein eine einer eines einen einem und oder mit von vom zu zum zur im in am an auf fur ist sind wird werden was wie warum uber bei nach als auch es um beitrag artikel nachricht sendung folge'.split(' '));
export function searchTokens(text) {
  const words = [...new Set(searchWords(text).map(w => w.slice(0, 36)))];
  const useful = words.filter(w => !STOP.has(w));
  return (useful.length ? useful : words).slice(0, 12);
}
export function wordVariants(word) {
  const folded = word.replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u');
  return [...new Set([word, folded, ...(['ai', 'ki'].includes(word) ? ['ki', 'ai'] : [])])];
}
export function indexPrefixes(word) {
  const exactShort = new Set(['ki','ai','eu','us','un','uk','tv','it']);
  const prefixes = [];
  for (let length = 2; length <= Math.min(word.length, 36); length++) {
    const prefix = word.slice(0, length);
    if (!exactShort.has(prefix) || prefix === word) prefixes.push(prefix);
  }
  return prefixes;
}
export function matchesFilters(record, {type = 'alle', topic = 'alle', mode = 'suche'} = {}) {
  return (mode !== 'news' || record.type === 'news') && (mode !== 'analysen' || record.type !== 'news')
    && (type === 'alle' || record.type === type) && (topic === 'alle' || record.topics?.includes(topic));
}
export function sortSearchIds(ids, lookup, term = '', sort = 'relevanz') {
  const tokens = searchTokens(term);
  const score = record => {
    const title = searchWords(record.title).flatMap(wordVariants);
    return tokens.reduce((sum, token) => sum + (wordVariants(token).some(t => title.some(w => w.startsWith(t))) ? 10 : 0), 0);
  };
  return [...ids].sort((a, b) => (sort === 'relevanz' && tokens.length ? score(lookup.get(b)) - score(lookup.get(a)) : 0)
    || String(lookup.get(b).date).localeCompare(lookup.get(a).date) || a.localeCompare(b));
}
export async function findSearchIds({term, lookup, loadBucket, type, topic, mode, sort}) {
  const tokens = searchTokens(term), requests = new Map();
  const read = word => { const key = searchBucket(word); if (!requests.has(key)) requests.set(key, loadBucket(key)); return requests.get(key); };
  const lists = await Promise.all(tokens.map(async token => [...new Set((await Promise.all(wordVariants(token).map(async w => (await read(w))[w] || []))).flat())]));
  const ids = lists.length ? lists.reduce((a, b) => { const set = new Set(b); return a.filter(id => set.has(id)); }) : [...lookup.keys()];
  return sortSearchIds(ids.filter(id => lookup.has(id) && matchesFilters(lookup.get(id), {type, topic, mode})), lookup, term, sort);
}
