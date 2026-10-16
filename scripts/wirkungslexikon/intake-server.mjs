import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {NarrativeInbox,createNarrativeHandler} from './intake.mjs';

process.umask(0o077);
const directory=process.env.WL_INTAKE_DIRECTORY,configFile=process.env.WL_INTAKE_DISCORD_CONFIG;
if(!path.isAbsolute(directory||'')||!path.isAbsolute(configFile||''))throw Error('PRIVATE_INBOX_CONFIGURATION_REQUIRED');
const discord=JSON.parse(fs.readFileSync(configFile,'utf8'));
const inbox=new NarrativeInbox(path.join(directory,'reports.sqlite'));
const intake=createNarrativeHandler({inbox,discord});
const server=http.createServer(async(req,res)=>{
 if(req.url==='/healthz'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end('{"ok":true,"service":"lexikon-narrative-inbox"}');return;}
 if(!await intake.handle(req,res)){res.writeHead(404,{'Cache-Control':'no-store'});res.end();}
});
server.requestTimeout=15000;server.headersTimeout=10000;server.maxRequestsPerSocket=100;
const timer=setInterval(()=>void intake.flush(),30000);timer.unref();
server.listen(Number(process.env.WL_INTAKE_PORT||8791),'127.0.0.1',()=>{console.log('LEXIKON_INBOX_READY');void intake.flush();});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{clearInterval(timer);server.close(async()=>{await intake.close();inbox.close();process.exit(0);});});
