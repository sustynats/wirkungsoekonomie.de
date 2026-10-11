import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Exercise the production HTTP handler without sockets, credentials or external
// calls. Imports are supplied by in-memory boundary doubles, not another router.
const source=fs.readFileSync(new URL('../../scripts/news/bridge/server.mjs',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
const secret='fixture-'.repeat(8),owner='12345:1';
function harness({locked=true,currentOwner=owner}={}){
  let handler;const calls=[];
  class Store{
    constructor(_file,{lane}){this.lane=lane;this.locked=locked;}
    observation(){return currentOwner?{owner:currentOwner}:null;}
    editorialJobs(page){calls.push({method:'editorialJobs',lane:this.lane,page});return {page_version:1,items:[{input:{job_id:'fixture'}}],next_cursor:null};}
    close(){}
  }
  vm.runInNewContext(source,{
    http:{createServer(fn){handler=fn;return {listen(){},close(){}};}},
    fs:{readFileSync(){return secret;}},path:{isAbsolute:()=>true,join:(...parts)=>parts.join('/')},
    timingSafeEqual:(a,b)=>a.equals(b),BridgeStore:Store,DropboxTransport:class{},loadDropboxCredentials:()=>({}),
    JOB_ID:/^wt_/,outputStatus:()=>{},monitorStatus:()=>{},Buffer,AbortSignal,
    process:{env:{WOEK_NEWS_BRIDGE_DIRECTORY:'/private/fixture'},cwd:()=>'/fixture',on(){}},
    fetch:async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return Response.json({ok:true});},
  });
  return {calls,async request(op,args=[],{lane='import',auth=`Bearer ${secret}`,requestOwner=owner}={}){
    const req={method:'POST',url:'/api/news-bridge',headers:{authorization:auth,'x-bridge-lane':lane,'x-bridge-owner':requestOwner},
      async *[Symbol.asyncIterator](){yield Buffer.from(JSON.stringify({op,args}));}};
    let status,result;await handler(req,{writeHead(value){status=value;},end(body){result=JSON.parse(body);}});return {status,result};
  }};
}

test('editorialJobs is a journal read, not an editorial finalize action',async()=>{
  const h=harness(),page={page_size:20,after:''};
  const response=await h.request('store.editorialJobs',[page]);
  assert.equal(response.status,200);assert.equal(response.result.result.page_version,1);
  assert.deepEqual(JSON.parse(JSON.stringify(h.calls)),[{method:'editorialJobs',lane:'import',page}]);
});
test('only explicit claim, finalize and failure operations reach private actions',async()=>{
  for(const [op,action] of [['store.editorialClaim','claim'],['store.editorialFinalize','finalize'],['store.editorialFailure','failure']]){
    const h=harness(),response=await h.request(op,['fixture']);assert.equal(response.status,200);
    assert.deepEqual(h.calls,[{url:`http://127.0.0.1:8788/internal/${action}`,body:['fixture']}]);
    const wrongLane=harness();assert.equal((await wrongLane.request(op,[],{lane:'discovery'})).result.error,'EDITORIAL_IMPORT_LANE_REQUIRED');
    assert.equal(wrongLane.calls.length,0);
  }
});
test('editorial lookup preserves authorization and exclusive owner checks',async()=>{
  for(const [options,request,error] of [
    [{},{auth:'Bearer invalid'},'BRIDGE_UNAUTHORIZED'],
    [{},{requestOwner:'invalid'},'BRIDGE_OWNER_INVALID'],
    [{currentOwner:'67890:1'},{},'BRIDGE_OWNER_MISMATCH'],
    [{locked:false},{},'BRIDGE_REACQUIRE_REQUIRED'],
  ]){
    const h=harness(options),response=await h.request('store.editorialJobs',[{page_size:20,after:''}],request);
    assert.equal(response.result.error,error);assert.equal(h.calls.length,0);
  }
});
