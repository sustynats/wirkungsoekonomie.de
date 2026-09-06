// Publication text uses the ordinary ASCII hyphen consistently.
export function normalizePublicationTypography(text) {
  return String(text)
    .replace(/[\u2010-\u2015\u2212\u2e3a\u2e3b\ufe58\ufe63\uff0d]/g, '-')
    .replace(/&(?:ndash|mdash|hyphen|minus);/gi, '-')
    .replace(/&#(?:x0*(?:201[0-5]|2212|2e3[ab]|fe58|fe63|ff0d)|0*(?:820[8-9]|821[0-3]|8722|1183[4-5]|65112|65123|65293));/gi, '-');
}

export function hasNonstandardDash(text) {
  return normalizePublicationTypography(text) !== String(text);
}

// Preserve cryptographically bound input records; public artifacts are always formatted.
export function isFrozenPublicationSource(relativePath) {
  const normalizedPath = String(relativePath).replaceAll('\\', '/');
  if (normalizedPath.startsWith('docs/parlament/audits/mv-spd-p1-p54-authorities/')) return true;
  // Exact historical authority and hash-bound reference inventory: format
  // rendered output, never these evidence bytes.
  if ([
    'docs/parlament/audits/mv-spd-p1-p54-reference-inventory-2026-09-04.json',
    'docs/parlament/audits/mv-spd-p53-handoff-5474946653.md',
    'docs/parlament/audits/mv-spd-p53-binding-delta-5543580667.md',
    'docs/parlament/ux/p6-text-baseline-2026-09-04.json',
  ].includes(normalizedPath)) return true;
  // News summaries and snapshots carry editorial/content hashes. Normalize
  // their rendered pages, never the source bytes those reviews approved.
  return ['audit-manifests/', 'content/audits/sachsen-anhalt/', 'woek-parlament-app/data/', 'data/news/']
    .some(prefix => String(relativePath).replaceAll('\\', '/').startsWith(prefix));
}
