import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {minimiseSensitivePollHtml} from '../polls/privacy.mjs';
import {publicHtmlFiles} from '../lib/public-html.mjs';
import {renderSiteFooter,renderFooterNewsletter,renderFormerFooterLinks,pageBase} from '../lib/site-shell.mjs';

export function normalizeSiteFooter(before,base='',localNavigation=''){
  if (/<meta\b[^>]*http-equiv=["']refresh["']/i.test(before))return before;
  const footer=renderSiteFooter(base);
  const newsletter=/\bdata-woek-newsletter(?:\s|>)/.test(before);
  let after=before.replace(/<(div|aside) class="footer-newsletter-shell footer-grid(?: footer)?"[^>]*>\s*<section\b[\s\S]*?<\/section>\s*<\/\1>\s*/g,'')
    .replace(/<section\b[^>]*\bclass=["'][^"']*\bfooter-newsletter\b[^"']*["'][^>]*>[\s\S]*?<\/section>\s*/g,'')
    .replace(/<script\b[^>]*src=["'][^"']*assets\/js\/newsletter\.js[^"']*["'][^>]*><\/script>\s*/g,'');
  if(localNavigation)after=after.replace(/<nav\b[^>]*\bdata-footer-links-migration=["']rang24["'][^>]*>[\s\S]*?<\/nav>\s*/g,'');
  let component=(localNavigation?localNavigation+'\n':'')+footer+(newsletter?'\n'+renderFooterNewsletter(base):'');
  if(before.includes('name="woek-private-interaction"')){
    const marker='<meta name="woek-private-interaction">';
    component=minimiseSensitivePollHtml(marker+component).slice(marker.length).trimEnd();
  }
  const pattern=/<footer(?:\s+[^>]*\bclass=["'](?:[^"']*\s)?(?:footer|site-footer)(?:\s[^"']*)?["'][^>]*|\s*)>[\s\S]*?<\/footer>\s*/gi;
  const contentRanges=[...after.matchAll(/<(main|article)\b[^>]*>[\s\S]*?<\/\1>/gi)]
    .map(match=>[match.index,match.index+match[0].length]);
  let count=0;
  after=after.replace(pattern,(match,offset)=>{
    if(contentRanges.some(([start,end])=>offset>=start&&offset<end))return match;
    return ++count===1?component+'\n':'';
  });
  if(!count){
    if(/<\/body>/i.test(after))after=after.replace(/<\/body>/i,component+'\n</body>');
    else after+='\n'+component+'\n';
  }
  return minimiseSensitivePollHtml(after);
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const root=process.argv.includes('--artifact')?path.join(process.cwd(),'_site'):process.cwd();
  const prefixes=process.argv.slice(2).filter(arg=>arg.startsWith('--prefix=')).map(arg=>arg.slice(9));
  let changed=0;
  for(const file of publicHtmlFiles(root)){
    const relative=path.relative(root,file).replaceAll('\\','/');
    if(relative.startsWith('en/'))continue; // Zurückgestellte Sprachfassung: bisheriges Verhalten erhalten.
    if(prefixes.length && !prefixes.some(prefix=>relative.startsWith(prefix)))continue;
    const base=pageBase(relative);
    const before=fs.readFileSync(file,'utf8');
    let after=normalizeSiteFooter(before,base,renderFormerFooterLinks(relative,base));
    if(process.argv.includes('--artifact')){
      // The English edition is deliberately offline in the public artifact.
      after=after.replace(`<a href="${base}en/" data-nav-match="en/">English</a>\n`,'');
    }
    if(after!==before){fs.writeFileSync(file,after);changed++;}
  }
  console.log(`normalized site footers: ${changed}`);
}
