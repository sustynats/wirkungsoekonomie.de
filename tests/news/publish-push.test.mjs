import test from "node:test";
import assert from "node:assert/strict";
import { publicationForFeed, publishDeployedNews } from "../../scripts/news/publish-push.mjs";
const item = { id: "https://wirkungsoekonomie.de/wirkungsticker/beispiel/", url: "https://wirkungsoekonomie.de/wirkungsticker/beispiel/", title: "Geprüfte Nachricht", date_published: "2026-09-04T10:00:00Z" };
const feed = { items: [item] };
const ok = extra => new Response(JSON.stringify({ok:true,failed:0,delivered:1,removed:0,...extra}));
test("queued publication is notified without depending on a later empty import report", async () => {
  let sent;
  await publishDeployedNews({feed,token:"test",fetchImpl:async (_url,request)=>{sent=JSON.parse(request.body);return ok({});}});
  assert.equal(sent.publicationId, `${item.id}@${item.date_published}`);
});
test("image and app revisions preserve deduplication identity; a material update changes it", () => {
  assert.deepEqual(publicationForFeed(feed),publicationForFeed({...feed,_woek_revision:"new-images",items:[{...item,image:"new.png"}]}));
  assert.notEqual(publicationForFeed(feed).publicationId,publicationForFeed({items:[{...item,date_modified:"2026-09-04T11:00:00Z"}]}).publicationId);
});
test("repeated feeds use durable receiver deduplication", async () => {
  const ids=new Set();let notifications=0;
  const fetchImpl=async (_url,request)=>{const {publicationId}=JSON.parse(request.body);const duplicate=ids.has(publicationId);ids.add(publicationId);if(!duplicate)notifications++;return ok({duplicate,delivered:duplicate?0:1});};
  await publishDeployedNews({feed,token:"test",fetchImpl});
  const second=await publishDeployedNews({feed,token:"test",fetchImpl});
  assert.equal(second.duplicate,true);assert.equal(notifications,1);
});
test("partial delivery retries retain the same publication identity", async () => {
  const ids=[];
  const result=await publishDeployedNews({feed,token:"test",sleep:async()=>{},fetchImpl:async (_url,request)=>{ids.push(JSON.parse(request.body).publicationId);return ok({failed:ids.length<3?1:0});}});
  assert.equal(result.failed,0);assert.equal(ids.length,3);assert.equal(new Set(ids).size,1);
});
test("empty feeds do not send and invalid dates never invent a fresh notification", async () => {
  assert.deepEqual(await publishDeployedNews({feed:{items:[]},fetchImpl:()=>assert.fail()}),{skipped:true});
  assert.throws(()=>publicationForFeed({items:[{...item,date_published:undefined}]}),/DATE_INVALID/);
});
