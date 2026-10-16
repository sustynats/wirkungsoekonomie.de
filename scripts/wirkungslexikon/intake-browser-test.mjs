import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {ROOT,atomic} from './model.mjs';
import {NarrativeInbox,createNarrativeHandler,REPORT_PATH} from './intake.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.WL_PLAYWRIGHT||'playwright');
const source=path.join(ROOT,'outputs/wirkungslexikon/public'),out=path.join(ROOT,'outputs/wirkungslexikon/narrative-intake-tests');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'wl-intake-browser-')),inbox=new NarrativeInbox(path.join(dir,'reports.sqlite')),messages=[];
fs.mkdirSync(out,{recursive:true});let intake;
const server=http.createServer(async(req,res)=>{
 if(req.url.startsWith(REPORT_PATH)&&await intake.handle(req,res))return;
 let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let f=path.resolve(source,'.'+name);
 if(!f.startsWith(source+path.sep)){res.writeHead(403);res.end();return;}
 if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
 if(!fs.existsSync(f)){res.writeHead(404);res.end();return;}
 const type={'.html':'text/html;charset=utf-8','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2','.png':'image/png','.svg':'image/svg+xml'}[path.extname(f)]||'application/octet-stream';res.writeHead(200,{'Content-Type':type});fs.createReadStream(f).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
intake=createNarrativeHandler({inbox,origins:[base],discord:{token:'test-only-bot-credential',recipient:'123456789012345678'},fetchImpl:async(url,options)=>{messages.push({url,options});return new Response(JSON.stringify({id:'234567890123456789'}),{status:200});}});
const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage(),errors=[],widths=[],violations=[];
page.on('pageerror',e=>errors.push(e.message));let offline=false;
await page.route('https://130.162.217.58.sslip.io'+REPORT_PATH,async route=>{
 if(offline){await route.abort('failed');return;}
 const response=await route.fetch({url:base+REPORT_PATH,headers:{...route.request().headers(),origin:base}});await route.fulfill({response});
});
try{
 for(const width of [360,390,768,820,1024,1280,1440]){
  await page.setViewportSize({width,height:900});await page.goto(base+'/wirkungslexikon/narrativ-melden/');await page.waitForFunction(()=>document.querySelector('#wl-narrative-report button[type=submit]')?.disabled===false);
  assert.equal(await page.locator('input[type=email],input[name=name]').count(),0);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);assert(!overflow);widths.push(width);
  if([390,1440].includes(width)){
   await page.addScriptTag({path:'/tmp/wl-axe.min.js'});const found=await page.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})));if(found.length)violations.push({width,violations:found});
   await page.screenshot({path:path.join(out,'FORM-'+width+'.png'),fullPage:true});
  }
 }
 await page.setViewportSize({width:390,height:844});
 const fill=async()=>{await page.locator('#narrative-term').fill('Technischer Testbegriff');await page.locator('#narrative-wording').fill('Expliziter Funktionstest: <script>window.bad=true</script> @everyone. '+('Vollständiger Wortlaut. '.repeat(200)));await page.locator('#narrative-source').fill('Öffentliche Testsendung, 16.10.2026, Minute 03:15');await page.locator('#narrative-date').fill('2026-10-16');await page.locator('#narrative-context').fill('Isolierter Test mit lokalem Discord-Ersatz. Kein echter Redaktionshinweis.');};
 await fill();await page.locator('#wl-narrative-report button[type=submit]').click();await page.getByText('Weitere Fundstelle melden',{exact:true}).waitFor();await intake.flush();
 assert.equal(inbox.all().length,1);assert(inbox.all()[0].notified_at);assert.equal(messages.length,2);assert.equal(await page.evaluate(()=>!!window.bad),false);
 const first=inbox.all()[0];assert((await messages[1].options.body.get('files[0]').text()).includes(first.body.wording));
 await page.getByText('Weitere Fundstelle melden',{exact:true}).click();await fill();offline=true;await page.locator('#wl-narrative-report button[type=submit]').click();await page.locator('#narrative-result[role=alert]').waitFor();assert.equal(await page.locator('#narrative-term').inputValue(),'Technischer Testbegriff');assert.equal(inbox.all().length,1);
 offline=false;await page.locator('#wl-narrative-report button[type=submit]').click();await page.getByText('Weitere Fundstelle melden',{exact:true}).waitFor();await intake.flush();assert.equal(inbox.all().length,2);
 const nojs=await browser.newContext({javaScriptEnabled:false}),plain=await nojs.newPage();await plain.goto(base+'/wirkungslexikon/narrativ-melden/');assert(await plain.locator('#wl-narrative-report button[type=submit]').isDisabled());assert(await plain.locator('noscript').isVisible());assert((await plain.locator('noscript').textContent()).includes('Zum direkten Absenden wird JavaScript benötigt.'));await nojs.close();
 assert.deepEqual(errors,[]);assert.deepEqual(violations,[]);
 atomic(path.join(out,'BROWSER_QA.json'),{status:'PASS',viewportWidths:widths,axeViolations:violations,anonymousNoContactFields:true,realLocalHttpToDurableSqlite:true,completeTextAttachment:true,onePrivateMessagePerReport:true,offlineInputRetainedAndRetried:true,noScriptExecution:true,noJavaScriptHonestFallback:true,pageErrors:errors,discord:'LOCAL_MOCK_NO_REAL_MESSAGE',manualScreenreader:'NOT_PERFORMED'});console.log('Narrative intake browser → HTTP → SQLite → Discord payload PASS');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await intake.close();inbox.close();fs.rmSync(dir,{recursive:true,force:true});}
