// Routing evidence, not a legal or factual verification. Retain the court
// prefix and procedure suffix: a bare number/year is not a case identity.
function citations(item = {}) {
  const text = `${item.title || ''} ${item.summary || ''}`;
  const matches = text.matchAll(/\b([CTF])\s*[-\u2010-\u2015\u2212]\s*(\d{1,4})\s*\/\s*(\d{2})\b(?:\s+(P(?:\(R\))?|R|RX(?:-II)?)\b)?/g);
  return [...new Set([...matches].map(([, court, number, year, suffix]) =>
    `${court}-${number}/${year}${suffix ? ` ${suffix}` : ''}`))];
}

function urlContainsCitation(item, reference) {
  try {
    const url = new URL(item.url);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return false;
    // Only a complete path token can corroborate the other source's explicit
    // citation. Do not infer references from arbitrary numbers, queries or hashes.
    const token = reference.toLowerCase().replace(/[-/\s]/g, '');
    return url.pathname.toLowerCase().split(/[\/_-]/).includes(token);
  } catch { return false; }
}

export function courtCaseRelation(a = {}, b = {}) {
  const left = citations(a), right = citations(b);
  // A report discussing several cases cannot bridge their separate stories.
  if (left.length > 1 || right.length > 1) return { status: 'ambiguous' };
  if (left.length && right.length) return left[0] === right[0]
    ? { status: 'shared', reference: left[0], basis: 'explicit_citations' }
    : { status: 'different' };
  const reference = left[0] || right[0];
  if (reference && urlContainsCitation(left.length ? b : a, reference)) {
    return { status: 'shared', reference, basis: 'explicit_citation_and_url_token' };
  }
  return { status: 'unestablished' };
}
