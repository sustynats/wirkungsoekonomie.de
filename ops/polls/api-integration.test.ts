// Copy to the EXISTING Oracle backend tests/pollsIntegration.test.ts.
import { it,expect } from 'vitest';
import { once } from 'node:events';
import { mkdtempSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import type { AddressInfo } from 'node:net';
import type { RuntimeConfig } from '../src/config.js';
import type { FactcheckService } from '../src/services/factcheckService.js';
import { startApiServer } from '../src/http/apiServer.js';

it('integrates real poll persistence before host CORS without breaking existing health',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'woek-host-polls-'));
  const values={POLLS_ENABLED:'true',POLLS_DATABASE_PATH:join(dir,'polls.sqlite'),POLLS_ABUSE_DATABASE_PATH:join(dir,'abuse.sqlite'),POLLS_TOKEN_PEPPER:'host-integration-private-test-only-'.repeat(2),POLLS_ABUSE_PEPPER:'host-integration-abuse-test-only-'.repeat(2)};
  const previous=Object.fromEntries(Object.keys(values).map(key=>[key,process.env[key]]));
  Object.assign(process.env,values);
  execFileSync(process.execPath,['polls/manage.mjs','seed'],{env:process.env});
  const server=startApiServer({} as FactcheckService,{apiPort:0,apiHost:'127.0.0.1',apiAllowedOrigins:['*'],token:'test-only',guildId:'1401888415318016020'} as unknown as RuntimeConfig);
  try{
    await once(server,'listening');const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    expect((await fetch(`${base}/healthz`)).status).toBe(200);
    expect((await fetch(`${base}/api/admin/polls`)).status).toBe(403);
    const response=await fetch(`${base}/api/polls/wirkungsticker-feedback`,{headers:{Origin:'https://wirkungsoekonomie.de'}});
    expect(response.status).toBe(200);expect(response.headers.get('access-control-allow-origin')).toBe('https://wirkungsoekonomie.de');
    const data=await response.json() as {results:null,poll:{options:{id:string}[]}};expect(data.results).toBe(null);
    expect((await fetch(`${base}/api/polls/wirkungsticker-feedback`,{headers:{Origin:'https://evil.test'}})).status).toBe(403);
    const vote=await fetch(`${base}/api/polls/wirkungsticker-feedback/vote`,{method:'POST',headers:{Origin:'https://wirkungsoekonomie.de','Content-Type':'application/json','X-Poll-Vote-Token':'a'.repeat(64)},body:JSON.stringify({option_id:data.poll.options[0]?.id})});
    expect(vote.status).toBe(201);expect(await vote.json()).toMatchObject({voted:true,results:{total:1}});
    expect((await fetch(`${base}/healthz`)).status).toBe(200);
  }finally{
    server.closeAllConnections();await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
    for(const [key,value] of Object.entries(previous)){if(value===undefined)delete process.env[key];else process.env[key]=value;}
    rmSync(dir,{recursive:true});
  }
});
