import { createHash } from 'node:crypto';

// Normalize German number notation, never magnitude, units or arithmetic.
// A decimal comma remains decimal: 2,330 is NOT evidence for 2330.
// Original source excerpts are never rewritten.
export function numberTokens(value) {
  const text = String(value ?? "");
  const result = new Set();
  const pattern = /\b\d{1,3}(?:[ \u00a0\u202f]\d{3})+(?:[.,]\d+)?\b|\b\d{1,3}(?:\.\d{3})+(?:,\d+)?\b|\b\d+(?:[.,]\d+)?\b/g;
  for (const match of text.matchAll(pattern)) {
    let token = match[0].replace(/[ \u00a0\u202f]/g, "");
    const fractionalUnit = /^\s*(?:%|Prozent\b|Prozentpunkt|Grad\b)/i.test(text.slice(match.index + match[0].length));
    if (/^\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(token) && !fractionalUnit) token = token.replaceAll(".", "");
    token = token.replace(",", ".");
    const [whole, fraction] = token.split(".");
    const tail = (fraction || "").replace(/0+$/, "");
    result.add(`${whole.replace(/^0+(?=\d)/, "")}${tail ? `.${tail}` : ""}`);
  }
  return result;
}

// Only numeric tokens, never a mirrored article. Created AFTER source/claim
// validation, bound to that publication version and exact source identities.
export function numericEvidenceReceipt(candidate, version, now) {
  return { version: 1, analysis_version: version, checked_at: now,
    sources: candidate.sources.filter(source => source.article_excerpt).map(source => ({
      source_id: source.source_id, url: source.url, content_hash: source.content_hash || null,
      excerpt_hash: createHash('sha256').update(source.article_excerpt).digest('hex'),
      numbers: [...numberTokens(source.article_excerpt)],
    })) };
}

export function persistedNumericEvidence(story) {
  const receipt = story.numeric_evidence;
  if (receipt?.version !== 1 || receipt.analysis_version !== story.current_version || !receipt.checked_at) return [];
  return (receipt.sources || []).filter(proof => /^[a-f0-9]{64}$/.test(proof.excerpt_hash || '')
    && story.sources.some(source => source.source_id === proof.source_id && source.url === proof.url
      && (source.content_hash || null) === proof.content_hash))
    .flatMap(proof => Array.isArray(proof.numbers) ? proof.numbers.filter(n => typeof n === 'string' && /^\d+(?:\.\d+)?$/.test(n)) : []);
}
