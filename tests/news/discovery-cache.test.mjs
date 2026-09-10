import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchDiscoverySource } from '../../scripts/news/bridge/discovery-cache.mjs';

const source = { source_id: 'publisher', url: 'https://example.org/rss', frequency_class: 'regular', access: {status:'public',cost_usd:0} };
const now='2026-09-10T12:00:00Z';
function fixture(){const values=new Map();return {values,store:{observation:async k=>values.get(k),observe:async(k,v)=>values.set(k,structuredClone(v))}};}
const response=()=>({source,fetched:{body:'<rss>private original response</rss>',etag:'first',final_url:source.url},items:[{item_id:'item-1',url:'https://example.org/1',title:'Original episode'}],fetchAttempts:1});

test('a completed source package survives interruption before job creation',async()=>{
  const {store,values}=fixture();await fetchDiscoverySource({store,source,now,fetchSource:async()=>response()});
  const again=await fetchDiscoverySource({store,source,now:'2026-09-10T12:15:00Z',fetchSource:async()=>{throw Error('network must not be called')}});
  assert.equal(again.cache_hit,true);assert.equal(again.items[0].item_id,'item-1');assert.equal(again.checked_at,now);
  assert.equal(values.values().next().value.result.fetched.body,undefined);
});
test('a 304 cannot discard a find whose earlier worker never enqueued it',async()=>{
  const {store}=fixture();await fetchDiscoverySource({store,source,now,fetchSource:async()=>response()});
  const next=await fetchDiscoverySource({store,source,now:'2026-09-10T13:00:00Z',fetchSource:async previous=>{
    assert.equal(previous.fetched.etag,'first');return {...response(),items:[],fetched:{not_modified:true,etag:'first'}};
  }});
  assert.equal(next.cache_hit,false);assert.equal(next.items[0].item_id,'item-1');
});
test('configuration changes invalidate cached packages and failed requests retain the last complete package',async()=>{
  const {store,values}=fixture();await fetchDiscoverySource({store,source,now,fetchSource:async()=>response()});
  const saved=structuredClone([...values]);
  await assert.rejects(fetchDiscoverySource({store,source,now:'2026-09-10T13:00:00Z',fetchSource:async()=>{throw Error('SOURCE_UNAVAILABLE')}}),/SOURCE_UNAVAILABLE/);
  assert.deepEqual([...values],saved);
  let fetched=false;await fetchDiscoverySource({store,source:{...source,url:'https://example.org/replaced'},now,fetchSource:async previous=>{assert.equal(previous,null);fetched=true;return response()}});
  assert.equal(fetched,true);
});
