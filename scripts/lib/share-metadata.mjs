// One final-build policy for old templates and newly generated pages alike.
// Only sharing metadata changes; editorial illustrations and custom covers stay.
export const BRAND_SHARE_IMAGE='https://wirkungsoekonomie.de/assets/img/brand/wirkungsoekonomie-share-v2.png';
export const BRAND_SHARE_ALT='Wirkungsökonomie - Mensch, Planet und Demokratie';
const site='https://wirkungsoekonomie.de';
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'");
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const attr=(tag,key)=>decode(tag.match(new RegExp(`\\s${key}\\s*=\\s*(["'])(.*?)\\1`,'i'))?.[2]||'');
const key=tag=>attr(tag,'property')||attr(tag,'name');
function generic(value){
  if(!value)return true;
  try{
    const url=new URL(value,site);
    return [site,'https://www.wirkungsoekonomie.de'].includes(url.origin) &&
      /^\/assets\/img\/generated\/hero-systemgrafik-wirkungsoekonomie\.(png|webp)$/.test(url.pathname);
  }catch{return false;}
}
export function normalizeShareMetadata(html){
  return html.replace(/<head\b[^>]*>[\s\S]*?<\/head>/i,head=>{
    // Do not read or rewrite HTML-looking strings in structured data/scripts.
    const parts=head.split(/(<(?:script|style)\b[^>]*>[\s\S]*?<\/(?:script|style)>)/gi);
    const tags=parts.filter((_,i)=>i%2===0).flatMap(part=>part.match(/<meta\b[^>]*>/gi)||[]);
    const values=new Map(tags.map(tag=>[key(tag),attr(tag,'content')]));
    const og=values.get('og:image'),tw=values.get('twitter:image');
    // Pages without any social metadata (e.g. machine mirrors) stay untouched.
    if(!tags.some(tag=>/^(og:|twitter:)/.test(key(tag))))return head;
    const nextOg=generic(og)?(!generic(tw)?tw:BRAND_SHARE_IMAGE):og;
    const nextTw=generic(tw)?nextOg:tw;
    const updates=new Map();
    if(generic(og))updates.set('og:image',nextOg);
    if(generic(tw))updates.set('twitter:image',nextTw);
    if(nextOg===BRAND_SHARE_IMAGE){
      for(const [name,value] of [['og:image:width','1200'],['og:image:height','630'],['og:image:type','image/png'],['og:image:alt',BRAND_SHARE_ALT]])updates.set(name,value);
    }
    if(nextTw===BRAND_SHARE_IMAGE){
      updates.set('twitter:image:alt',BRAND_SHARE_ALT);
      updates.set('twitter:card','summary_large_image');
    }
    if(generic(values.get('og:image:secure_url')) && values.has('og:image:secure_url'))updates.set('og:image:secure_url',nextOg);
    const emitted=new Set();
    const tagFor=(name,value)=>`<meta ${name.startsWith('og:')?'property':'name'}="${name}" content="${escape(value)}">`;
    let result=parts.map((part,i)=>i%2?part:part.replace(/<meta\b[^>]*>/gi,tag=>{
      const name=key(tag);
      if(!updates.has(name))return tag;
      if(emitted.has(name))return '';
      emitted.add(name);return tagFor(name,updates.get(name));
    })).join('');
    const missing=[...updates].filter(([name])=>!emitted.has(name)).map(([name,value])=>tagFor(name,value));
    if(missing.length)result=result.replace(/<\/head>/i,`${missing.join('\n')}\n</head>`);
    return result;
  });
}
