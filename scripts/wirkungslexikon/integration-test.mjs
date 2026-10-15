import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {ROOT,read,atomic} from './model.mjs';
import {loadAudienceTeasers} from './audience-teasers.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.WL_PLAYWRIGHT||'playwright');
const args=process.argv.slice(2),value=k=>args[args.indexOf(k)+1];
const artifact=path.resolve(args.includes('--artifact')?value('--artifact'):path.join(ROOT,'outputs/wirkungslexikon/release-candidate'));
const base=args.includes('--base')?value('--base'):'http://127.0.0.1:8797';
const out=path.resolve(args.includes('--out')?value('--out'):path.join(ROOT,'outputs/wirkungslexikon/integration-tests.json'));
const checks=[],issues=[];
const data=read(path.join(artifact,'wirkungslexikon/daten.json'));
const manifest=read(path.join(artifact,'wirkungslexikon/.generated.json'));
assert.equal(data.entries.length,132);assert.equal(manifest.mode,'public');
const resolveFile=url=>{let f=path.join(artifact,decodeURIComponent(url.pathname));if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');return f;};
for(const rel of manifest.files.filter(f=>f.endsWith('.html'))){
 const file=path.join(artifact,'wirkungslexikon',rel),html=fs.readFileSync(file,'utf8');
 const url=new URL('/wirkungslexikon/'+rel.replace(/index\.html$/,''),base);
 for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(/^(mailto:|tel:|data:|#)/.test(m[1]))continue;
  const link=new URL(m[1].replace(/&amp;/g,'&'),url);
  if(link.origin!==url.origin)continue;
  if(!fs.existsSync(resolveFile(link)))issues.push({page:rel,missing:link.pathname});
 }
}
assert.deepEqual(issues,[],'Every generated internal link and asset must exist in the full site');
checks.push({name:'All generated internal links and assets resolve against the complete production artifact',status:'PASS'});
const routes=read(path.join(artifact,'assets/data/public-routes.json'));
const routeText=JSON.stringify(routes);
for(const e of data.entries)assert(routeText.includes('/wirkungslexikon/'+e.slug+'/'));
for(const s of ['ifr-self-deportation','offen-fluchtlingswelle','afd-remigration'])assert(!routeText.includes('/wirkungslexikon/'+s+'/'));
const smFiles=fs.readdirSync(path.join(artifact,'sitemaps')).filter(n=>n.endsWith('.xml'));
const sitemap=smFiles.map(n=>fs.readFileSync(path.join(artifact,'sitemaps',n),'utf8')).join('');
for(const e of data.entries)assert(sitemap.includes('/wirkungslexikon/'+e.slug+'/'));
for(const s of ['ifr-self-deportation','offen-fluchtlingswelle','afd-remigration'])assert(!sitemap.includes('/wirkungslexikon/'+s+'/'));
checks.push({name:'Public route registry and sitemaps contain every approved card and exclude blocked routes',status:'PASS'});
const browser=await chromium.launch({headless:true,...(process.env.WL_CHROME_BIN?{executablePath:process.env.WL_CHROME_BIN}:{channel:'chrome'})});
try{
 const context=await browser.newContext();const page=await context.newPage();const errors=[],bad=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)bad.push({url:r.url(),status:r.status()});});
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});await page.goto(base+'/wirkungslexikon/');
  await page.waitForFunction(()=>document.documentElement.dataset.wlReady==='true');
  assert((await page.locator('.wl-results-count').textContent()).includes('132'));
  assert.equal(await page.locator('.wl-modebar').count(),0);
  assert.equal(await page.locator('a[href="/wirkungslexikon/redaktion/"]').count(),0);
  assert.equal(await page.locator('.site-header a[href="/wirkungslexikon/"]').count(),0);
  assert(await page.locator('footer a[href="/wirkungslexikon/"]').count()>0);
  if(width===390){await page.locator('.nav-toggle').click();assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'),'false');}
  await page.goto(base+'/wirkungslexikon/neue-merz-problem-im-stadtbild/');
  await page.waitForFunction(()=>document.documentElement.dataset.wlReady==='true');
  await page.locator('[data-share]').click();await page.waitForSelector('#dlg-share[open]');
  const img=page.locator('#dlg-share img');assert(await img.count()>0);
  await page.waitForFunction(()=>{const el=document.querySelector('#dlg-share img');return el?.complete&&el.naturalWidth>0;});
  await page.keyboard.press('Escape');
  await page.locator('[data-report]').first().click();
  assert.equal(await page.locator('[data-report-form] button[type="submit"]').textContent(),'E-Mail vorbereiten');
  await page.keyboard.press('Escape');
  assert(await page.locator('text=Tatsächlich beobachtete Wirkungen').count()>0);
  assert(await page.locator('text=Wirkungspotenzial').count()>0);
  const dims=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));assert(dims.scroll<=dims.client);
 }
 checks.push({name:'Full public artifact on mobile and desktop: data, navigation, evidence sections, social image and honest email feedback form',status:'PASS'});
 await page.emulateMedia({media:'print'});
 assert.equal(await page.locator('.site-header').isVisible(),false);
 assert.equal(await page.locator('.wl-actions').isVisible(),false);
 assert.equal(await page.locator('.wl-subnav').isVisible(),false);
 assert.equal(await page.locator('.skip-link').isVisible(),false);
 assert.equal(await page.locator('.wl-breadcrumb').isVisible(),false);
 assert(await page.locator('.wl-node').count()>0);
 const external=page.locator('a[href^="https://"]').first();
 assert((await external.evaluate(el=>getComputedStyle(el,'::after').content)).includes('https://'));
 await page.emulateMedia({media:'screen'});
 await page.setViewportSize({width:640,height:450});
 const reflow=await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth);assert(reflow);
 checks.push({name:'Print hides navigation/actions and exposes external URLs; 640 CSS-pixel reflow passes',status:'PASS'});
 await page.goto(base+'/suche.html?q=Stadtbild');
 await page.waitForFunction(()=>[...document.querySelectorAll('[data-search-results] a')].some(a=>a.getAttribute('href')?.includes('/wirkungslexikon/')),{},{timeout:30000});
 assert(await page.locator('[data-search-results] a[href*="/wirkungslexikon/"]').count()>0);
 const snippets=await page.locator('[data-search-results] article').evaluateAll(els=>els.filter(el=>el.querySelector('a[href^="/wirkungslexikon/"]')).map(el=>el.querySelector('p')?.textContent?.trim()));
 assert(snippets.length>0);assert(snippets.every(s=>s?.startsWith('Wirkungspotenzial:')));
 checks.push({name:'Existing global search finds lexicon cards through the regenerated lazy search index',status:'PASS'});
 const nojs=await browser.newContext({javaScriptEnabled:false});const p=await nojs.newPage();await p.goto(base+'/wirkungslexikon/');assert.equal(await p.locator('.wl-row').count(),132);await nojs.close();
 checks.push({name:'Public no-JavaScript A–Z list contains exactly 132 approved cards',status:'PASS'});
 const ap=await context.newPage();
 for(const item of loadAudienceTeasers()){
  const html=fs.readFileSync(path.join(artifact,item.path),'utf8');assert.equal((html.match(/data-wl-audience-teaser="true"/g)||[]).length,1);
  for(const width of [390,1440]){
   await ap.setViewportSize({width,height:900});await ap.goto(base+'/'+item.path,{waitUntil:'domcontentloaded'});
   const teaser=ap.locator('[data-wl-audience-teaser]');assert((await teaser.textContent()).includes('Ergänzendes Nachschlagewerk'));
   assert.equal(await teaser.locator('a').getAttribute('href'),item.href);
   const bounds=await teaser.boundingBox();assert(bounds&&bounds.x>=0&&bounds.x+bounds.width<=width+1,'Teaser fits viewport');
   assert.equal(await ap.locator('.site-header a[href="/wirkungslexikon/"]').count(),0);
  }
  assert.equal((await context.request.get(base+item.href)).status(),200);
 }
 await ap.close();checks.push({name:'Four audience portals show supplementary lexicon teasers with working links on mobile and desktop',status:'PASS'});
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);
 checks.push({name:'No uncaught errors or failing same-origin asset requests',status:'PASS'});
 atomic(out,{status:'PASS',cards:132,checks});console.log(JSON.stringify({status:'PASS',cards:132,checks}));
}finally{await browser.close();}
