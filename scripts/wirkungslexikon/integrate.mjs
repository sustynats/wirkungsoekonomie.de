import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {ROOT,read,atomic,sha} from './model.mjs';
import {patchSearch} from './search-label.mjs';
import {loadAudienceTeasers,applyAudienceTeaser} from './audience-teasers.mjs';

export async function integrate({artifact,candidate,supportRoot=ROOT,proofFile=null,pruneSearch=true}={}) {
 const out=path.resolve(artifact), source=path.resolve(candidate);
 const data=read(path.join(source,'wirkungslexikon/daten.json'));
 if(data.entries.some(e=>e.pruefstatus!=='freigegeben'))throw Error('Unfreigegebene Karte im öffentlichen Artefakt');
 const all=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?all(path.join(dir,e.name)):e.isFile()?[path.join(dir,e.name)]:[]);
 const before=new Map(all(out).map(f=>[path.relative(out,f),sha(fs.readFileSync(f))]));
 if(!before.has('index.html')||fs.readFileSync(path.join(out,'CNAME'),'utf8').trim()!=='wirkungsoekonomie.de')throw Error('Vollständiger Produktionsbestand mit erwarteter Domain fehlt');
 const changed=[];const teasers=loadAudienceTeasers(supportRoot);
 for(const item of teasers)if(!fs.existsSync(path.join(out,item.path)))throw Error('Zielgruppen-Seite fehlt: '+item.path);
 // Remove only an earlier generated lexicon; revoked pages and social assets cannot survive.
 const previous=path.join(out,'wirkungslexikon/.generated.json');
 if(fs.existsSync(previous))for(const rel of read(previous).files){if(rel.includes('..')||path.isAbsolute(rel))throw Error('Ungültiger Lexikonpfad');fs.rmSync(path.join(out,'wirkungslexikon',rel),{force:true});}
 const sourceManifest=read(path.join(source,'wirkungslexikon/.generated.json'));
 if(sourceManifest.mode!=='public')throw Error('Nur ein öffentlicher Generatorbestand darf integriert werden');
 const deploymentFiles=sourceManifest.files.filter(rel=>rel!=='share-card.html');
 const files=deploymentFiles.map(rel=>{if(rel.includes('..')||path.isAbsolute(rel))throw Error('Ungültiger Artefaktpfad');return 'wirkungslexikon/'+rel;});
 files.push('assets/css/wirkungslexikon.css','assets/js/wirkungslexikon.mjs','assets/js/wirkungslexikon-init.mjs');
 files.push('assets/img/wirkungslexikon/titelbild-worte-wirken.png');
 for(const name of files){const from=path.join(source,name);const to=path.join(out,name);fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);changed.push(name);}
 for(const name of ['playfair-display-500.woff2','playfair-display-600.woff2','source-sans-3-400.woff2','source-sans-3-600.woff2','source-sans-3-700.woff2']){const f=path.join(source,'assets/fonts',name);const rel=path.relative(source,f);const dest=path.join(out,rel);if(!fs.existsSync(dest)){fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(f,dest);changed.push(rel);}}
 const standardFooter=/<footer\b(?=[^>]*class="(?:[^"]*\s)?(?:footer|site-footer)(?:\s[^"]*)?")[^>]*>[\s\S]*?<\/footer>/;
 const navLink='<a href="/wirkungslexikon/" data-wl-global="true">Wirkungslexikon</a>';
 const searchFile=path.join(out,'assets/js/search.js');
 const searchText=patchSearch(fs.readFileSync(searchFile,'utf8'));fs.writeFileSync(searchFile,searchText);
 const searchVersion=sha(searchText).slice(0,12);
 const hub='<section class="section" data-wl-hub="true"><div class="section-header"><p class="hero-kicker">Politische Sprache verstehen</p><h2>Wirkungslexikon politischer Sprache</h2><p>Begriffe, Bedeutungsverschiebungen und Wirkungspotenziale mit Quellen und klaren Evidenzgrenzen.</p><p><a class="btn btn-primary" href="/wirkungslexikon/">Wirkungslexikon öffnen</a></p></div></section>';
 const navProof=[];
 for(const f of all(out).filter(f=>f.endsWith('.html')&&!f.startsWith(path.join(out,'wirkungslexikon/')))){
  const old=fs.readFileSync(f,'utf8');let html=old;const navChanges=[];const insertNav=match=>{navChanges.push([match,match+navLink]);return match+navLink;};
  const oldFooter=html.match(standardFooter)?.[0];
  if(oldFooter){const anchors=[...oldFooter.matchAll(/<a\b[^>]*href="[^"\s]*wirkungslexikon\/"[^>]*>Wirkungslexikon<\/a>/g)];if(anchors.length>1){let kept=false;const hasCanonical=anchors.some(a=>!a[0].includes('data-wl-global'));const repaired=oldFooter.replace(/<a\b[^>]*href="[^"\s]*wirkungslexikon\/"[^>]*>Wirkungslexikon<\/a>/g,a=>{if(!a.includes('data-wl-global'))return a;if(hasCanonical||kept)return '';kept=true;return a;});html=html.replace(oldFooter,repaired);navChanges.push([oldFooter,repaired]);}}
  if(!html.match(standardFooter)?.[0].includes('>Wirkungslexikon</a>'))html=html.replace(/(<h[23][^>]*>Debatte &amp; Radar<\/h[23]>\s*<div class="footer-nav-links">)/,insertNav);
  if(path.relative(out,f)==='oeffentlicher-wirkungsraum/index.html'&&!old.includes('data-wl-hub'))html=html.replace('</main>',hub+'</main>');
  const searchUrls=[];
  html=html.replace(/src="([^"\s]*assets\/js\/search\.js)(?:\?[^"\s]*)?"/g,all=>{const prefix=all.match(/src="([^?\"]+)/)[1];const next='src="'+prefix+'?v='+searchVersion+'"';searchUrls.push([all,next]);return next;});
  const teaser=teasers.find(item=>item.path===path.relative(out,f));const teaserChange=teaser?applyAudienceTeaser(html,teaser):null;if(teaserChange)html=teaserChange.html;
  if(html!==old){let restored=html;if(teaserChange)restored=restored.replace(teaserChange.after,teaserChange.before);for(const [a,b]of navChanges.reverse())restored=restored.replace(b,a);if(!old.includes('data-wl-hub'))restored=restored.replace(hub,'');for(const [a,b]of searchUrls)restored=restored.replace(b,a);if(restored!==old)throw Error('Inhalt außerhalb der Navigation, freigegebenen Teaser oder Suchskriptversion würde verändert: '+f);fs.writeFileSync(f,html);navProof.push(path.relative(out,f));}
 }
 atomic(path.join(out,'wirkungslexikon/.generated.json'),{...sourceManifest,files:deploymentFiles});
 const pages=read(path.join(source,'wirkungslexikon/search-meta.json'));
 const sourceIndex=path.join(out,'assets/search/search-index.json');
 const searchModule=await import(pathToFileURL(path.join(supportRoot,'scripts/search/build-browser-search-index.mjs')).href);
 const prior=fs.existsSync(sourceIndex)?read(sourceIndex):searchModule.readBuiltSearchEntries?searchModule.readBuiltSearchEntries(out):[];
 if(!prior.length)throw Error('Vorhandener globaler Suchindex kann nicht gelesen werden');
 const added=pages.map(p=>{const slug=p.path.slice('/wirkungslexikon/'.length).replace(/\/$/,'');const e=data.entries.find(e=>e.slug===slug);return {id:'wirkungslexikon-'+(slug||'start'),title:p.title,url:p.path,description:p.description,body:e?['Wirkungslexikon',e.wirkungspotenzial.moegliche_veraenderung,e.bedeutung_und_kontext,e.akteur,e.psychologischer_effekt.name,...e.kategorien].join(' '):p.description,type:e?'Wirkungskarte':'Seite',section:'Wirkungslexikon',format:'HTML',tags:e?[...e.kategorien,e.korpus,e.akteur]:['Wirkungslexikon'],priority:65};});
 atomic(sourceIndex,[...prior.filter(e=>!String(e.url).startsWith('/wirkungslexikon/')),...added]);
 const routesFile=path.join(supportRoot,'scripts/lib/public-routes.mjs');
 const directoryPaths=new Set();
 if(fs.existsSync(routesFile)){
  const {writePublicRoutes}=await import(pathToFileURL(routesFile).href);writePublicRoutes(out);
  const directoryModule=path.join(supportRoot,'scripts/quality/build-public-area-directories.mjs');
  if(fs.existsSync(directoryModule)){
   const priorManifest=read(path.join(out,'assets/data/public-area-directories.json'));
   const selected=priorManifest.areas.filter(a=>['start','wirkungslexikon'].includes(a.area));
   const hubs=new Map(selected.map(a=>{const rel=a.hub.slice(1)+(a.hub.endsWith('/')?'index.html':'');return [rel,fs.readFileSync(path.join(out,rel),'utf8')];}));
   for(const a of selected)for(const p of a.generatedPages||[])directoryPaths.add(p.file);
   const {buildPublicAreaDirectories}=await import(pathToFileURL(directoryModule).href);
   const directories=buildPublicAreaDirectories(out,{onlyAreas:['start','wirkungslexikon']});
   const strip=s=>s.replace(/<section\b(?=[^>]*\bdata-public-area-directory=["']true["'])[^>]*>[\s\S]*?<\/section>/gi,'').replace(/\s+<\/main>/g,'</main>');
   for(const [rel,old]of hubs){if(strip(fs.readFileSync(path.join(out,rel),'utf8'))!==strip(old))throw Error('Verzeichnisaufbau würde redaktionellen Inhalt verändern: '+rel);directoryPaths.add(rel);}
   for(const a of directories.areas.filter(a=>['start','wirkungslexikon'].includes(a.area)))for(const p of a.generatedPages||[])directoryPaths.add(p.file);
   writePublicRoutes(out);
  }
 }
 // Reuse the actual finalized shared footer of the host artifact for late-generated pages.
 const sharedFooter=fs.readFileSync(path.join(out,'index.html'),'utf8').match(standardFooter)?.[0];
 if(!sharedFooter)throw Error('Gemeinsamer Site-Footer fehlt');
 const absoluteFooter=sharedFooter.replace(/(href|src)="(?!https?:|mailto:|tel:|#|\/)([^"']+)"/g,'$1="/$2"');
 for(const name of new Set([...deploymentFiles.filter(n=>n.endsWith('.html')).map(n=>'wirkungslexikon/'+n),...directoryPaths])){
  if(!name.endsWith('.html')||!fs.existsSync(path.join(out,name)))continue;
  const file=path.join(out,name);const old=fs.readFileSync(file,'utf8');
  const next=old.replace(standardFooter,absoluteFooter);if(next!==old)fs.writeFileSync(file,next);
 }
 if(searchModule.buildBrowserSearchIndex)searchModule.buildBrowserSearchIndex(out,{pruneFullIndex:pruneSearch});
 else searchModule.writeBrowserSearchIndex({sourcePath:sourceIndex,targetPath:path.join(out,'assets/search/search-browser-index.json')});
 const sitemapModule=path.join(supportRoot,'scripts/lib/public-sitemaps.mjs');
 if(fs.existsSync(sitemapModule)){
   const {buildPublicSitemaps}=await import(pathToFileURL(sitemapModule).href);buildPublicSitemaps(out);
 }else {
   const sm=path.join(out,'sitemap.xml');let sitemap=fs.readFileSync(sm,'utf8');
   if(sitemap.includes('<sitemapindex'))sitemap=sitemap.replace('</sitemapindex>','<sitemap><loc>https://wirkungsoekonomie.de/wirkungslexikon/sitemap.xml</loc></sitemap></sitemapindex>');
   else {sitemap=sitemap.replace(/<url\b[^>]*>[\s\S]*?<\/url>/g,node=>node.includes('https://wirkungsoekonomie.de/wirkungslexikon/')?'':node);sitemap=sitemap.replace('</urlset>',pages.map(p=>`<url><loc>https://wirkungsoekonomie.de${p.path}</loc></url>`).join('\n')+'\n</urlset>');}
   fs.writeFileSync(sm,sitemap);
 }
 const after=new Map(all(out).map(f=>[path.relative(out,f),sha(fs.readFileSync(f))]));
 const unexpected=[];
 const allowed=name=>name.startsWith('wirkungslexikon/')||name.startsWith('assets/search/')||name.startsWith('sitemaps/')||['assets/css/wirkungslexikon.css','assets/js/wirkungslexikon.mjs','assets/js/wirkungslexikon-init.mjs','assets/js/search.js','assets/data/public-routes.json','assets/data/public-area-directories.json','sitemap.xml'].includes(name)||directoryPaths.has(name)||name.startsWith('assets/img/wirkungslexikon/')||name.startsWith('assets/fonts/')&&!before.has(name)||navProof.includes(name);
 for(const name of new Set([...before.keys(),...after.keys()]))if(before.get(name)!==after.get(name)&&!allowed(name))unexpected.push(name);
 if(unexpected.length)throw Error('Unerwartete Änderungen: '+unexpected.join(', '));
 for(const f of all(path.join(out,'wirkungslexikon')).filter(f=>/\.(?:html|json|xml|mjs)$/.test(f))){const text=fs.readFileSync(f,'utf8');if(/\/Users\/|\/private\/tmp\/|\bgh[pousr]_[A-Za-z0-9_]{20,}/.test(text))throw Error('Privater Datenrest: '+f);}
 const proof={cards:data.entries.length,pages:pages.length,navigationPages:navProof.length,audienceTeasers:teasers.map(item=>item.path),unchangedFiles:[...before.keys()].filter(n=>before.get(n)===after.get(n)).length,changedFiles:[...new Set([...before.keys(),...after.keys()])].filter(n=>before.get(n)!==after.get(n)),unrelatedContentUnchanged:true,unexpectedChanges:unexpected};
 if(proofFile)atomic(proofFile,proof);
 return proof;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);const val=k=>args[args.indexOf(k)+1];
 const result=await integrate({artifact:val('--artifact'),candidate:val('--candidate'),supportRoot:args.includes('--support-root')?val('--support-root'):ROOT,proofFile:args.includes('--proof')?val('--proof'):null});console.log(JSON.stringify({...result,changedFiles:result.changedFiles.length},null,2));
}
