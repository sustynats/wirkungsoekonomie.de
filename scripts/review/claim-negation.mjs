export function hasNegationNear(text, start, end) {
  const context = text.slice(Math.max(0, start - 130), Math.min(text.length, end + 130));
  if (/\b(?:nicht|nie|kein(?:e|en|em|er|es)?|weder|ohne|ausgeschlossen|verboten)\b/i.test(context)) return true;
  // A teaching text may quote the misconception, then immediately reject it.
  // An unrelated 'Falsch' farther away must not excuse an asserted definition.
  return /^[\s.,:;'"„“”«»\-–—]*(?:Falsch|Nein|Ebenfalls falsch)\b/i.test(text.slice(end, end + 50));
}
export function cleanClaimHtml(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&(?:amp|quot|apos|lt|gt);/gi, ' ')
    .replace(/\s+/g, ' ');
}
