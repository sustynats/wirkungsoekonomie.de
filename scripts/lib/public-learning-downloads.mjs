// Public, generated worksheets requested in the 20.10.2026 measurement brief.
// This is an exact list, not a general JSON/download-directory exception.
export const publicLearningDownloads = new Set([
  'assets/downloads/wirkung-messen/kii-arbeitsvorlage.json',
  'assets/downloads/wirkung-messen/kii-arbeitsvorlage.md',
  'assets/downloads/wirkung-messen/kii-mobilitaetskosten-lernbeispiel.json',
  'assets/downloads/wirkung-messen/kii-mobilitaetskosten-lernbeispiel.md',
]);
export function isPublicLearningDownload(value) {
  const clean=String(value || '').split(/[?#]/)[0].replace(/^\//,'').replace(/^_site\//,'');
  return publicLearningDownloads.has(clean);
}

export function protectPublicLearningDownloadLinks(html) {
  const prefix='WOEK_PUBLIC_WORKSHEET_LINK_';
  if (html.includes(prefix)) throw Error('Reserved public worksheet marker in source');
  const links=[];
  const content=html.replace(/<a\b([^>]*?)\shref\s*=\s*(["'])([^"']+)\2([^>]*)>[\s\S]*?<\/a>/gi,(match,before,_quote,href,after)=>{
    if (!isPublicLearningDownload(href) || /\shref\s*=/i.test(before+after)) return match;
    return `${prefix}${links.push(match)-1}_END`;
  });
  return {content,restore(value) {
    return value.replace(/WOEK_PUBLIC_WORKSHEET_LINK_(\d+)_END/g,(_,index)=>{
      const link=links[Number(index)];if (!link) throw Error('Unknown public worksheet marker');return link;
    });
  }};
}
