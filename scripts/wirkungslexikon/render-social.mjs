import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {ROOT,read,atomic,sha} from './model.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.WL_PLAYWRIGHT||'playwright');
const mode=process.argv.includes('--public')?'public':'preview';
const dir=path.resolve(process.argv.includes('--out')?process.argv[process.argv.indexOf('--out')+1]:path.join(ROOT,'outputs/wirkungslexikon',mode));
const target=path.join(dir,'wirkungslexikon');const runtime=read(path.join(target,'runtime.json'));
const files=read(path.join(target,'.generated.json'));
const mime={'.html':'text/html','.json':'application/json','.mjs':'text/javascript','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{const raw=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(raw.includes('..')){res.writeHead(404);res.end();return;}const f=path.join(dir,raw);if(!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,...(process.env.WL_CHROME_BIN?{executablePath:process.env.WL_CHROME_BIN}:{channel:process.env.WL_BROWSER_CHANNEL||'chrome'})});
const origin='http://127.0.0.1:'+server.address().port;
const formats={og:{width:1200,height:630},portrait:{width:1080,height:1350},square:{width:1080,height:1080}};
const missing=process.argv.includes('--missing');
const queue=runtime.data.entries.filter(e=>!missing||Object.keys(formats).some(format=>!fs.existsSync(path.join(target,e.slug,format+'.png'))));
const renderedSlugs=new Set(queue.map(e=>e.slug));
const proofFile=path.join(dir,'social-proof.json');
const proofs=missing&&fs.existsSync(proofFile)?read(proofFile).images.filter(p=>!renderedSlugs.has(p.slug)&&runtime.data.entries.some(e=>e.slug===p.slug)):[];
try {
 await Promise.all(Array.from({length:4},async()=>{
  const page=await browser.newPage();
  while(queue.length){const e=queue.shift();
   for(const [format,size]of Object.entries(formats)){
    await page.setViewportSize(size);
    await page.goto(`${origin}/wirkungslexikon/share-card.html?slug=${encodeURIComponent(e.slug)}&format=${format}`,{waitUntil:'networkidle'});
    await page.locator('.card').waitFor();await page.evaluate(()=>document.fonts.ready);
    const el=page.locator('.card');const bounds=await el.boundingBox();
    if(Math.round(bounds.width)!==size.width||Math.round(bounds.height)!==size.height)throw Error('Falsche Social-Card-Maße: '+e.slug);
    const rel=e.slug+'/'+format+'.png';const f=path.join(target,rel);await el.screenshot({path:f});
    proofs.push({slug:e.slug,format,...size,sha256:sha(fs.readFileSync(f)),draft:mode==='preview'});
    if(!files.files.includes(rel))files.files.push(rel);
   }
  }
  await page.close();
 }));
 atomic(path.join(target,'.generated.json'),files);
 atomic(path.join(dir,'social-proof.json'),{mode,count:proofs.length,images:proofs});
 console.log(JSON.stringify({mode,cards:runtime.data.entries.length,renderedCards:renderedSlugs.size,images:proofs.length}));
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
