import { createHash } from 'node:crypto';

// German is the unchanged default for reader copy and unknown source languages.
// English grouping is accepted only with explicit source-language metadata.
// Never infer magnitude, units or arithmetic from a translated claim.
// Original source excerpts are never rewritten.
const numberLocale = language => typeof language === 'string' && /^en(?:[-_][a-z0-9]+)*$/i.test(language) ? 'en' : 'de';

export function numberTokens(value, language) {
  const text = String(value ?? "");
  const result = new Set();
  const english = numberLocale(language) === 'en';
  const pattern = english
    ? /\b\d{1,3}(?:[ \u00a0\u202f]\d{3})+(?:\.\d+)?\b|\b\d+(?:[.,]\d+)*\b/g
    : /\b\d{1,3}(?:[ \u00a0\u202f]\d{3})+(?:[.,]\d+)?\b|\b\d{1,3}(?:\.\d{3})+(?:,\d+)?\b|\b\d+(?:[.,]\d+)?\b/g;
  for (const match of text.matchAll(pattern)) {
    let token = match[0].replace(/[ \u00a0\u202f]/g, "");
    if (english) {
      if (/^\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(token)) token = token.replaceAll(',', '');
      else if (!/^\d+(?:\.\d+)?$/.test(token)) continue;
    } else {
      const fractionalUnit = /^\s*(?:%|Prozent\b|Prozentpunkt|Grad\b)/i.test(text.slice(match.index + match[0].length));
      if (/^\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(token) && !fractionalUnit) token = token.replaceAll(".", "");
      token = token.replace(",", ".");
    }
    const [whole, fraction] = token.split(".");
    const tail = (fraction || "").replace(/0+$/, "");
    result.add(`${whole.replace(/^0+(?=\d)/, "")}${tail ? `.${tail}` : ""}`);
  }
  return result;
}

export function sourceNumberTokens(source = {}, fields = ['title', 'summary', 'article_excerpt']) {
  return new Set(fields.flatMap(field => [...numberTokens(source[field], source.language)]));
}

export function evidenceNumberTokens(evidence, sources = []) {
  return new Set((Array.isArray(evidence) ? evidence : []).flatMap(proof => {
    const source = sources.find(entry => entry.source_id === proof?.source_id && entry.url === proof?.url);
    // Never trust a locale supplied by the model alongside its evidence.
    return [...numberTokens(proof?.excerpt, source?.language)];
  }));
}

// Only numeric tokens, never a mirrored article. Created AFTER source/claim
// validation, bound to that publication version and exact source identities.
export function numericEvidenceReceipt(candidate, version, now) {
  return { version: 1, analysis_version: version, checked_at: now,
    sources: candidate.sources.filter(source => source.article_excerpt).map(source => ({
      source_id: source.source_id, url: source.url, content_hash: source.content_hash || null,
      excerpt_hash: createHash('sha256').update(source.article_excerpt).digest('hex'),
      number_locale: numberLocale(source.language),
      numbers: [...sourceNumberTokens(source, ['article_excerpt'])],
    })) };
}

export function persistedNumericEvidence(story) {
  const receipt = story.numeric_evidence;
  if (receipt?.version !== 1 || receipt.analysis_version !== story.current_version || !receipt.checked_at) return [];
  return (receipt.sources || []).filter(proof => /^[a-f0-9]{64}$/.test(proof.excerpt_hash || '')
    && story.sources.some(source => source.source_id === proof.source_id && source.url === proof.url
      && (source.content_hash || null) === proof.content_hash
      && (proof.number_locale === undefined || proof.number_locale === numberLocale(source.language))))
    .flatMap(proof => Array.isArray(proof.numbers) ? proof.numbers.filter(n => typeof n === 'string' && /^\d+(?:\.\d+)?$/.test(n)) : []);
}
