import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {ROOT,atomic} from './model.mjs';
import {loadReferenceLinks} from './reference-links.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.WL_PLAYWRIGHT||'playwright');
const args=process.argv.slice(2),value=k=>args[args.indexOf(k)+1];
const base=args.includes('--base')?value('--base'):'http://127.0.0.1:8795';
const out=args.includes('--out')?path.resolve(value('--out')):path.join(ROOT,'outputs/wirkungslexikon/sdgplus-berichte-20261016/browser');
fs.mkdirSync(out,{recursive:true});
const blocks=loadReferenceLinks(),paths=[...new Set(blocks.flatMap(b=>b.paths))],rows=[],errors=[];
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
 const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>r.request().resourceType()==='media'?r.abort():r.continue());
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});
  for(const rel of paths){
   const response=await page.goto(base+'/'+rel.replace(/index\.html$/,''),{waitUntil:'domcontentloaded'});assert.equal(response.status(),200,rel);
   if(rel.startsWith('wirkungslexikon/'))await page.waitForFunction(()=>document.documentElement.dataset.wlReady==='true');
   for(const block of blocks.filter(b=>b.paths.includes(rel))){
    const section=page.locator('[data-wl-reference="'+block.id+'"]');assert.equal(await section.count(),1,block.id);assert.equal(await section.getAttribute('aria-labelledby'),block.id+'-title');
    assert.equal((await section.locator('h2,h3').first().textContent()).trim(),block.title);
    if(block.anchor)assert(await section.evaluate((el,anchor)=>!!el.closest('section[id="'+anchor+'"]'),block.anchor));
    for(const link of [...block.links,...block.items||[]]){const a=section.locator('a').filter({hasText:link.label}).first();assert.equal(await a.getAttribute('href'),link.href);assert((await a.textContent()).trim().length>5);}
    const box=await section.boundingBox();assert(box&&box.x>=-1&&box.x+box.width<=width+1,block.id+' fits '+width);
   }
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);assert.equal(overflow,false,rel+' overflow');
   let violations=[];
   if(process.env.WL_AXE_PATH){await page.addScriptTag({path:process.env.WL_AXE_PATH});violations=await page.evaluate(async()=> (await axe.run({include:[['[data-wl-reference]']]},{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})));assert.deepEqual(violations,[],rel);}
   rows.push({path:rel,width,blocks:blocks.filter(b=>b.paths.includes(rel)).map(b=>b.id),overflow,violations});
   if(['wirkungslexikon/index.html','verstehen/sdgs-sdgplus/index.html'].includes(rel)){await page.locator('[data-wl-reference]').first().scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,(rel.startsWith('wirkungslexikon/')?'LEXIKON':'SDGPLUS')+'-'+width+'.png')});}
  }
 }
 await page.goto(base+'/wirkungslexikon/');await page.waitForFunction(()=>document.documentElement.dataset.wlReady==='true');
 const quick=page.locator('a[href="#sdgplus-bezug"]');assert.equal(await quick.count(),1);await quick.focus();await page.keyboard.press('Enter');assert(page.url().endsWith('#sdgplus-bezug'));assert(await page.locator('#sdgplus-bezug-title').isVisible());
 const forward=page.locator('#sdgplus-bezug a');await forward.focus();await page.keyboard.press('Enter');await page.waitForURL('**/verstehen/sdgs-sdgplus/');
 const back=page.locator('#wirkungslexikon-sdgplus-praxis a[href="/wirkungslexikon/"]');await back.focus();await page.keyboard.press('Enter');await page.waitForURL('**/wirkungslexikon/');
 for(const block of blocks.filter(b=>b.anchor?.startsWith('sdgplus-')&&b.anchor!=='sdgplus-dossier')){await page.goto(base+'/verstehen/sdgs-sdgplus/#'+block.anchor);assert(await page.locator('#'+block.anchor).count());assert.equal(await page.locator('#'+block.anchor+' [data-wl-reference="'+block.id+'"]').count(),1);}
 await page.goto(base+'/suche.html?q=SDG%2B');await page.waitForFunction(()=>[...document.querySelectorAll('[data-search-results] a')].some(a=>a.getAttribute('href')?.startsWith('/wirkungslexikon/')),{},{timeout:30000});
 assert.deepEqual(errors,[]);
 atomic(path.join(out,'SDGPLUS_BROWSER_QA.json'),{status:'PASS',base,checkedAt:new Date().toISOString(),pages:paths.length,viewports:[390,1440],rows,keyboard:'Forward/back reference links and home quick link',anchors:7,globalSearch:'SDG+ finds lexicon',axe:!!process.env.WL_AXE_PATH,manualScreenreader:'NOT_PERFORMED',pageErrors:errors});
 console.log(JSON.stringify({status:'PASS',pages:paths.length,widths:2,anchors:7,axe:!!process.env.WL_AXE_PATH}));
}finally{await browser.close();}
