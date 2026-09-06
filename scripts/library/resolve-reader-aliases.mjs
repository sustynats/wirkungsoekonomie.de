const SITE='https://wirkungsoekonomie.de';
export function resolveReaderAliases(html,route,aliases){
 const byRoute=new Map(aliases.map(a=>[a.from,a]));
 return html.replace(/(\bhref=)(["'])([^"']+)\2/gi,(tag,prefix,q,href)=>{
  let u;try{u=new URL(href,SITE+route);}catch{return tag;}
  if(u.origin!==SITE)return tag;
  const alias=byRoute.get(u.pathname);if(!alias)return tag;
  const target=alias.mode==='retire' && route===alias.to && alias.predecessor?alias.predecessor:alias.to;
  return prefix+q+target+(alias.mode==='rename'?u.hash:'')+q;
 });
}
