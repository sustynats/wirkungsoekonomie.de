import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {ROOT,atomic} from './model.mjs';

const require=createRequire(import.meta.url);
const {chromium}=require(process.env.WL_PLAYWRIGHT||'playwright');
const args=process.argv.slice(2),value=k=>args[args.indexOf(k)+1];
const base=args.includes('--base')?value('--base'):'http://127.0.0.1:8798';
const out=path.resolve(args.includes('--out')?value('--out'):path.join(ROOT,'outputs/wirkungslexikon/v9-usability'));
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.WL_CHROME_BIN?{executablePath:process.env.WL_CHROME_BIN}:{channel:'chrome'})});
const checks=[],measurements=[],errors=[],axeViolations=[];
const ready=page=>page.waitForFunction(()=>document.documentElement.dataset.wlReady==='true');
try{
 const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 for(const width of [360,390,768,820,1024,1280,1440]){
  await page.setViewportSize({width,height:width===390?844:900});
  assert.equal((await page.goto(base+'/wirkungslexikon/')).status(),200);await ready(page);await page.evaluate(()=>document.fonts.ready);
  const m=await page.evaluate(width=>{
   const y=s=>Math.round(document.querySelector(s).getBoundingClientRect().top+scrollY);
   const term=document.querySelector('.wl-results .wl-row__term,.wl-results .wl-tile__term');return {width,viewportHeight:innerHeight,search:y('#q-hero'),explorer:y('#karten'),firstTerm:y('.wl-results .wl-row__term,.wl-results .wl-tile__term'),firstTermBottom:Math.ceil(term.getBoundingClientRect().bottom+scrollY),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth};
  },width);measurements.push(m);
  assert.equal(m.overflow,false,`No horizontal overflow at ${width}px`);
  assert(m.search<500,`Search appears in first viewport at ${width}px`);
  assert(m.firstTermBottom<=m.viewportHeight,`First complete term is visible without scrolling at ${width}px: ${m.firstTermBottom}`);
  assert.equal(await page.locator('#einleitung').getAttribute('open'),null);
  assert.equal(await page.locator('form[role=search]').count(),1);
  if([360,390,1440].includes(width))await page.screenshot({path:path.join(out,'START-'+width+'.png')});
  if([390,1440].includes(width)&&process.env.WL_AXE_PATH){
   await page.addScriptTag({path:process.env.WL_AXE_PATH});
   const violations=await page.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})));
   if(violations.length)axeViolations.push({width,violations});
  }
 }
 checks.push('Search and first term in the initial viewport at seven widths; one search field; no horizontal overflow');
 await page.setViewportSize({width:390,height:844});
 const summary=page.locator('#einleitung > summary');await summary.focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('#einleitung').evaluate(el=>el.open),true);
 assert(await page.locator('#intro-title').isVisible());assert(await page.locator('text=Ein Lexikon, drei Zugänge').isVisible());
 await page.keyboard.press('Space');assert.equal(await page.locator('#einleitung').evaluate(el=>el.open),false);
 checks.push('Full introduction and three audience entrances open and close with the keyboard');
 await page.locator('#q-hero').fill('Remigration');await page.locator('form[data-search=hero] button[type=submit]').click();
 await page.waitForURL(/q=Remigration/);await page.waitForFunction(()=>document.activeElement?.id==='explorer-title');
 assert.equal(await page.locator('#q-hero').inputValue(),'Remigration');
 assert((await page.locator('.wl-results-count').textContent()).includes('im Begriff'));
 const target=await page.locator('#karten').evaluate(el=>({top:el.getBoundingClientRect().top,offset:parseFloat(getComputedStyle(el).scrollMarginTop)}));
 assert(Math.abs(target.top-target.offset)<=2,'Search moves to results below the sticky navigation');
 await page.locator('[data-open-facets]').click();await page.locator('.wl-facet[data-key=akteur] > summary').click();await page.locator('input[name=akteur]').first().check();
 await page.keyboard.press('Escape');assert.equal(await page.locator('[data-open-facets]').getAttribute('aria-expanded'),'false');
 assert.equal(await page.locator('#q-hero').inputValue(),'Remigration');
 await page.goBack();await page.goBack();assert.equal(await page.locator('#q-hero').inputValue(),'');
 checks.push('Search focuses and scrolls to results, mobile filters work, and browser history restores the search field');
 await page.goto(base+'/wirkungslexikon/?q=Remigration#karten');await ready(page);
 const first=page.locator('.wl-results .wl-row__term,.wl-results .wl-tile__term').first();
 assert((await first.boundingBox()).y<844,'A direct search URL lands at the results');
 for(const e of await page.locator('.wl-preview-potential').all())assert((await e.textContent()).includes('Wirkungspotenzial'));
 await page.goto(base+'/wirkungslexikon/');await ready(page);await page.locator('#q-hero').fill('stadtb');
 await page.waitForSelector('#sg-hero:not([hidden])');
 assert.equal(await page.locator('#sg-hero').evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.left+10,r.top+10)?.closest('#sg-hero')===el;}),true,'Suggestions are not clipped by the compact hero');
 await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await page.waitForURL(/neue-dobrindt-unsinn/);
 checks.push('Direct query links, potential labels and keyboard autocomplete still lead to the right cards');
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),staticPage=await nojs.newPage();
 await staticPage.goto(base+'/wirkungslexikon/');assert.equal(await staticPage.locator('.wl-row').count(),180);
 assert((await staticPage.locator('.wl-row__term').first().boundingBox()).y<844);
 await staticPage.locator('#einleitung > summary').click();assert(await staticPage.locator('#intro-title').isVisible());await nojs.close();
 checks.push('All 180 static card links and the native introduction remain accessible without JavaScript');
 assert.deepEqual(errors,[]);assert.deepEqual(axeViolations,[]);
 atomic(path.join(out,'USABILITY_QA.json'),{status:'PASS',base,checkedAt:new Date().toISOString(),measurements,checks,axe:{performed:!!process.env.WL_AXE_PATH,violations:axeViolations},pageErrors:errors,manualScreenreader:'NOT_PERFORMED'});
 console.log(JSON.stringify({status:'PASS',measurements,checks:checks.length,axe:!!process.env.WL_AXE_PATH}));
}finally{await browser.close();}
