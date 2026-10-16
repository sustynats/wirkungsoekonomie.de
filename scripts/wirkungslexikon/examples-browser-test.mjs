import fs from 'node:fs';import {ROOT} from './model.mjs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.WL_PLAYWRIGHT||'playwright');
const root=ROOT,out=root+'/outputs/wirkungslexikon/v10';
const slugs=['ifr-gruppe-c-staatsangehorige-mit-migrationshintergrund','ifr-remigrationsmaximierung','ifr-self-deportation','offen-messermanner','offen-heizhammer','neue-wir-sind-das-stadtbild','afd-die-leistungsfahigkeit-der-krankenhauser-sicherstellen','afd-recht-auf-analoges-leben','neue-neutralitaet-als-symbolargument'];
const data=JSON.parse(fs.readFileSync(root+'/outputs/wirkungslexikon/public/wirkungslexikon/daten.json'));slugs.push(...data.entries.filter((e,i)=>i%13===0).map(e=>e.slug));
const browser=await chromium.launch({headless:true,channel:'chrome'});const results=[];fs.mkdirSync(out+'/screenshots',{recursive:true});
try{const p=await browser.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 for(const width of [360,390,768,1440])for(const slug of [...new Set(slugs)]){
  await p.setViewportSize({width,height:900});await p.goto((process.env.WL_EXAMPLES_BASE||'http://127.0.0.1:8801')+'/wirkungslexikon/'+slug+'/');await p.waitForFunction(()=>document.documentElement.dataset.wlReady==='true');
  assert.equal(await p.locator('#alltagsbeispiel .wl-example__label').textContent(),'Gedankenbeispiel - keine dokumentierte Begebenheit');
  assert(await p.locator('#alltagsbeispiel p:last-child').textContent());
  assert(await p.locator('#original a[href^="https://"]').count()>0);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth));
  if(width<=1100)assert(await p.evaluate(()=>document.querySelector('.wl-card-aside').getBoundingClientRect().y>document.querySelector('#alltagsbeispiel').getBoundingClientRect().y));
  const ids=await p.locator('.wl-path > .wl-node').evaluateAll(a=>a.slice(0,6).map(n=>n.id));assert.deepEqual(ids,['kurz-gesagt','alltagsbeispiel','wortwahl','gefuehle','betroffene','evidenz-kurz']);
  await p.addScriptTag({path:process.env.WL_AXE||'/tmp/wl-axe.min.js'});const axe=await p.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));assert.equal(axe.violations.length,0,JSON.stringify({slug,width,violations:axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))}));
  if(slugs.indexOf(slug)<9&&(width===390||width===1440)){await p.locator('#alltagsbeispiel').scrollIntoViewIfNeeded();await p.screenshot({path:out+'/screenshots/'+slug+'-'+width+'.png'});}
  results.push({slug,width,overflow:false,axeViolations:0,sectionsOrdered:true});
 }
 await p.goto((process.env.WL_EXAMPLES_BASE||'http://127.0.0.1:8801')+'/wirkungslexikon/offen-heizhammer/');await p.waitForFunction(()=>document.documentElement.dataset.wlReady==='true');await p.locator('.wl-audience-switch a').first().focus();await p.keyboard.press('Enter');assert.equal(new URL(p.url()).hash,'#alltagsbeispiel');
 const nojs=await browser.newContext({javaScriptEnabled:false});const n=await nojs.newPage();await n.goto((process.env.WL_EXAMPLES_BASE||'http://127.0.0.1:8801')+'/wirkungslexikon/offen-heizhammer/');assert(await n.locator('#alltagsbeispiel').isVisible());await nojs.close();
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser-tests.json',JSON.stringify({status:'PASS',routes:new Set(slugs).size,checks:results.length,results,keyboard:true,noJs:true,jsErrors:errors,manualScreenreader:false},null,2));console.log('PASS',results.length,'responsive card checks');
}finally{await browser.close();}
