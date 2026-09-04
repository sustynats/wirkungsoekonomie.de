// Local-only acceptance fixture. Never copied into the public artifact or Oracle runtime.
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { PollStore,PollAbuseStore } from '../../ops/polls/backend/store.mjs';
import { createPollHandler } from '../../ops/polls/backend/api.mjs';
import { pollPage,indexPage,adminPage } from './pages.mjs';
const root=process.cwd(),port=Number(process.env.POLLS_TEST_PORT||8789),origin=`http://127.0.0.1:${port}`;
const directory=fs.mkdtempSync(path.join(root,'outputs/poll-acceptance-'));
const store=new PollStore({path:path.join(directory,'polls.sqlite'),pepper:'local-test-only-vote-pepper-not-a-secret'});
const abuse=new PollAbuseStore({path:path.join(directory,'abuse.sqlite'),pepper:'local-test-only-abuse-pepper-not-a-secret'});
store.create(JSON.parse(fs.readFileSync(path.join(root,'ops/polls/backend/first-poll.json'))));
const api=createPollHandler({store,abuse,origins:[origin],authorize:async req=>req.headers.authorization==='Bearer local-test-only'});
const types={'.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{
  try{
    if(await api(req,res))return;
    const url=new URL(req.url,origin);let html;
    if(url.pathname==='/__test__/login')html=`<!doctype html><html lang="de"><title>Lokale Testanmeldung</title><h1>Lokale Testanmeldung</h1><p>Nur diese temporäre Testdatenbank. Kein Zugriff auf produktive Umfragen.</p><button id="login">Testverwaltung öffnen</button><script>document.getElementById('login').onclick=()=>{localStorage.setItem('woek_community_auth','local-test-only');location.assign('/admin/umfragen/')}</script></html>`;
    else if(url.pathname==='/admin/umfragen/')html=adminPage(root);
    else if(url.pathname==='/umfragen/')html=indexPage(root,store.list());
    else if(/^\/umfragen\/[a-z0-9-]+\/$/.test(url.pathname)){const poll=store.get(url.pathname.split('/')[2],true);html=pollPage(root,poll);}
    if(html){
      // Do not generate external analytics events or send fixture votes to Production.
      html=html.replaceAll('data-poll-api="https://130.162.217.58.sslip.io"',`data-poll-api="${origin}"`).replace(/<script defer src="[^\"]+"><\/script>/g,'');
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(html);return;
    }
    const file=path.resolve(root,`.${decodeURIComponent(url.pathname)}`);
    if(!file.startsWith(`${root}/assets/`)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
  }catch(error){res.writeHead(error.status||500,{'Content-Type':'text/plain'});res.end(error.message);}
});
server.listen(port,'127.0.0.1',()=>console.log(`Local poll acceptance fixture: ${origin}/umfragen/ - admin test login: ${origin}/__test__/login`));
process.once('SIGTERM',()=>{server.close();store.close();abuse.close();});
