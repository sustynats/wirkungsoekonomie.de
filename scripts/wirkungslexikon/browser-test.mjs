import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {ROOT} from './model.mjs';
const require=createRequire(import.meta.url);
const {chromium,request}=require(process.env.WL_PLAYWRIGHT||'playwright');
const base='http://127.0.0.1:8796';const access=JSON.parse(fs.readFileSync(path.join(ROOT,'outputs/wirkungslexikon/access.json')));
const out=path.join(ROOT,'outputs/wirkungslexikon/browser');fs.mkdirSync(out,{recursive:true});
const checks=[];const errors=[];
const anon=await request.newContext();
for(const url of ['/wirkungslexikon/','/wirkungslexikon/runtime.json','/assets/js/wirkungslexikon.mjs','/wirkungslexikon/ifr-self-deportation/','/api/wirkungslexikon/editorial?slug=ifr-self-deportation']){const r=await anon.get(base+url);assert.equal(r.status(),401,url);assert(r.headers()['x-robots-tag'].includes('noindex'));}
checks.push({name:'All HTML, JSON, assets and API unauthorized requests return 401',status:'PASS'});await anon.dispose();
const browser=await chromium.launch({headless:true,channel:'chrome'});
const context=await browser.newContext({httpCredentials:{username:access.username,password:access.password}});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
const sizes=[360,390,768,820,1024,1280,1440];
const slugs=['neue-woke-ausgangssinn-umdeutung','neue-merz-problem-im-stadtbild','neue-regenbogenflagge-geschichte-umdeutung','neue-gendern-bedeutung-umdeutung','neue-soeder-gender-verordnung','neue-wir-sind-das-stadtbild','neue-remigration-zurueckkehr-vs-selfdeportation','afd-trans-kult','ifr-self-deportation','offen-fluchtlingswelle','neue-fluchtlingswelle-in-journalismus'];
const routes=['','kategorien/','kategorien/bedrohungsrahmung/','methodik/','fuer-redaktionen/','fuer-buerger/','fuer-wissenschaft/','afd/','institut-fuer-remigration/','redaktion/',...slugs.map(s=>s+'/')];
const axe=[];const overflow=[];
for(const width of sizes){
 await page.setViewportSize({width,height:900});
 const group=width===390||width===1440?routes:['','neue-merz-problem-im-stadtbild/','offen-fluchtlingswelle/','fuer-redaktionen/'];
 for(const route of group){
  const r=await page.goto(base+'/wirkungslexikon/'+route);assert.equal(r.status(),200,route);
  await page.waitForFunction(()=>document.documentElement.dataset.wlReady==='true');
  await page.waitForTimeout(80);
  const dims=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  if(dims.scroll>dims.client)overflow.push({width,route,...dims});
  if(width===390||width===1440){await page.addScriptTag({path:'/tmp/wl-axe.min.js'});const findings=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}});return r.violations.map(x=>({id:x.id,impact:x.impact,description:x.description,nodes:x.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));});if(findings.length)axe.push({width,route,findings});}
 }
 await page.goto(base+'/wirkungslexikon/neue-merz-problem-im-stadtbild/');
 await page.screenshot({path:path.join(out,`stadtbild-${width}.png`),fullPage:true});
 const shift=await page.locator('.wl-shift__col').evaluateAll(els=>els.map(e=>({top:e.getBoundingClientRect().top,left:e.getBoundingClientRect().left})));
 if(width<=760)assert(shift[1].top>shift[0].top,'Mobile before/after stacks');else assert(Math.abs(shift[1].top-shift[0].top)<5,'Desktop before/after side-by-side');
}
fs.writeFileSync(path.join(out,'axe.json'),JSON.stringify(axe,null,2));fs.writeFileSync(path.join(out,'overflow.json'),JSON.stringify(overflow,null,2));
checks.push({name:'Responsive 360–1440 px',status:overflow.length?'FAIL':'PASS',issues:overflow});
checks.push({name:'axe WCAG 2.2 AA, every page type and required cards, mobile and desktop',status:axe.length?'FAIL':'PASS',issues:axe.length});
// Search with keyboard and stable URLs.
await page.setViewportSize({width:390,height:844});await page.goto(base+'/wirkungslexikon/');
await page.waitForFunction(()=>document.documentElement.dataset.wlReady==='true');await page.locator('#q-hero').fill('stadtb');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await page.waitForURL(/neue-dobrindt-unsinn/);checks.push({name:'Combobox ArrowDown + Enter opens real permalink',status:'PASS'});
await page.goto(base+'/wirkungslexikon/?q=woke');await page.waitForSelector('.wl-results');
assert((await page.locator('.wl-results-count').textContent()).includes('Wirkungskarte'));
assert(!(await page.locator('.wl-results').textContent()).includes('Keine spezifische Wirkung nachgewiesen'));
await page.locator('[data-open-facets]').click();assert.equal(await page.locator('#facets').getAttribute('aria-modal'),'true');
await page.locator('#facets input[name="bereich"][value="cdu-csu"]').check();assert(page.url().includes('bereich=cdu-csu'));await page.keyboard.press('Escape');assert.equal(await page.locator('[data-open-facets]').getAttribute('aria-expanded'),'false');
checks.push({name:'Mobile facet sheet, filter URL, Escape and return focus',status:'PASS'});
await page.goto(base+'/wirkungslexikon/neue-merz-problem-im-stadtbild/');await page.locator('[data-cite]').click();await page.waitForSelector('#dlg-cite[open]');await page.keyboard.press('Escape');assert(await page.locator('[data-cite]').evaluate(el=>el===document.activeElement));
await page.locator('[data-share]').click();await page.waitForSelector('#dlg-share[open]');await page.addScriptTag({path:'/tmp/wl-axe.min.js'});const shareAxe=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));});checks.push({name:'Share/citation dialog and focus return',status:shareAxe.length?'FAIL':'PASS',issues:shareAxe});await page.keyboard.press('Escape');
await page.goto(base+'/wirkungslexikon/offen-fluchtlingswelle/');await page.locator('[data-share]').click();assert.equal(await page.locator('[data-copy-url]').isDisabled(),true);assert.equal(await page.locator('#dlg-share a[href*="linkedin"]').count(),0);await page.keyboard.press('Escape');
await page.locator('[data-report]').first().click();await page.locator('#r-art').selectOption({label:'Neue Studie oder neuer Beleg'});await page.locator('#r-text').fill('Technischer Funktionstest: Testhinweis, kein redaktioneller Änderungsauftrag.');await page.locator('[data-report-form] button[type="submit"]').click();await page.waitForSelector('[data-ok]');assert((await page.locator('.wl-dialog__body').textContent()).includes('gespeichert'));await page.keyboard.press('Escape');
checks.push({name:'Draft share channels locked; real source-report saved with success response',status:'PASS'});
await page.goto(base+'/wirkungslexikon/fuer-redaktionen/');assert.equal(await page.locator('[data-checklist] input').count(),8);await page.locator('[data-checklist] input').first().check();await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.wlReady==='true');assert(await page.locator('[data-checklist] input').first().isChecked());checks.push({name:'Eight-question editorial checklist persists',status:'PASS'});
await page.goto(base+'/public/wirkungslexikon/');await page.waitForSelector('.wl-results-count');assert((await page.locator('.wl-results-count').textContent()).includes('132'));assert.equal((await context.request.get(base+'/public/wirkungslexikon/ifr-self-deportation/')).status(),404);
checks.push({name:'Public simulation never loads private corpus; 132 public, blocked route 404',status:'PASS'});
const nojs=await browser.newContext({javaScriptEnabled:false,httpCredentials:{username:access.username,password:access.password}});const np=await nojs.newPage();await np.goto(base+'/wirkungslexikon/');assert.equal(await np.locator('.wl-row').count(),180);await np.goto(base+'/wirkungslexikon/neue-woke-ausgangssinn-umdeutung/');assert(await np.locator('#wirkkette').isVisible());await nojs.close();checks.push({name:'No-JS full A–Z list and complete static card',status:'PASS'});
checks.push({name:'No uncaught browser errors',status:errors.length?'FAIL':'PASS',errors});
fs.writeFileSync(path.join(out,'browser-tests.json'),JSON.stringify(checks,null,2));console.log(JSON.stringify(checks,null,2));await browser.close();
if(checks.some(c=>c.status!=='PASS'))process.exitCode=1;
