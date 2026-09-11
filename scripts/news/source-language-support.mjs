import { titleTokens } from './lib.mjs';

// Narrow lexical support for translated news, not a translation service or a
// factual verdict. Original source text is retained. Independent source-fidelity
// review, numeric evidence, subject-conflict and publisher checks still apply.
export const SOURCE_LANGUAGE_SUPPORT_VERSION = 'en-de-1';
const concepts = [
  ['attack', /\b(?:attack\w*|strike\w*|angriff\w*)\b/],
  ['fatality', /\b(?:kill\w*|death\w*|dead|getotet\w*|tot\w*|gestorben)\b/],
  ['injury', /\b(?:injur\w*|wounded|verletz\w*)\b/],
  ['family', /\b(?:family|families|familie\w*|eltern|parents)\b/],
  ['child', /\b(?:child\w*|kinder\w*)\b/],
  ['hospital', /\b(?:hospital\w*|krankenhaus\w*|krankenhauser\w*)\b/],
  ['police', /\b(?:police|polizei\w*)\b/],
  ['court', /\b(?:court\w*|gericht\w*)\b/],
  ['judgment', /\b(?:ruling\w*|verdict\w*|urteil\w*)\b/],
  ['government', /\b(?:government\w*|regierung\w*)\b/],
  ['budget', /\b(?:budget\w*|haushalt\w*|etat\w*)\b/],
  ['election', /\b(?:election\w*|wahl|wahlen|wahlgang)\b/],
  ['railway', /\b(?:railway\w*|train\w*|bahn\w*|zugverkehr)\b/],
  ['flood', /\b(?:flood\w*|hochwasser\w*|uberschwemm\w*)\b/],
  ['earthquake', /\b(?:earthquake\w*|erdbeben\w*)\b/],
];
const normalize = value => String(value || '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();
const matched = value => concepts.filter(([, pattern]) => pattern.test(normalize(value))).map(([key]) => key);
const eventConcepts = new Set(['attack', 'fatality', 'injury', 'judgment', 'election', 'flood', 'earthquake']);

export function crossLanguageSourceSupport(source, story) {
  const unsupported = { supported: false, version: SOURCE_LANGUAGE_SUPPORT_VERSION };
  if (!/^en(?:-|$)/i.test(source.language || '') || !/^de(?:-|$)/i.test(story.language || 'de')) return unsupported;
  const sourceTime = Date.parse(source.source_published_at || source.published_at || '');
  const storyTime = Date.parse(story.last_updated || story.published_at || story.event_detected_at || story.first_seen || '');
  if (!Number.isFinite(sourceTime) || !Number.isFinite(storyTime) || Math.abs(sourceTime - storyTime) > 48 * 3600000) return unsupported;
  const original = matched(`${source.title || ''} ${source.summary || ''}`);
  const translated = matched(`${story.title || ''} ${story.source_summary || ''}`);
  const sharedConcepts = original.filter(key => translated.includes(key));
  // A shared topic alone is insufficient: also require an unchanged title anchor
  // outside the bilingual vocabulary (e.g. an institution or place name).
  const anchors = titleTokens(source.title);
  const sharedAnchors = [...titleTokens(story.title)].filter(token => anchors.has(token) && matched(token).length === 0);
  return { ...unsupported, supported: sharedConcepts.length >= 3 && sharedConcepts.some(key => eventConcepts.has(key)) && sharedAnchors.length >= 1,
    shared_concepts: sharedConcepts, shared_title_anchors: sharedAnchors };
}
