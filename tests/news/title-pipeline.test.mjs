import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { deflateSync } from "node:zlib";
import { IMAGE_CONFIG as C, chooseTitleImageMode, buildEditorialImagePrompt, digest, imageError } from "../../scripts/news/title-image/policy.mjs";
import { inspectImage, downloadImage } from "../../scripts/news/title-image/image-file.mjs";
import { checkHiggsfieldAvailability, createHiggsfieldAdapter, parseCliJson, generationResult, recoverSubmittedJob } from "../../scripts/news/title-image/higgsfield.mjs";
import { createTitleImagePipeline, publicTitleImage } from "../../scripts/news/title-image/pipeline.mjs";
import { renderTitleImageFromStory } from "../../scripts/news/title-image/index.mjs";
import { checkEditorialAsset, detectedWords } from "../../scripts/news/title-image/quality.mjs";

const STORY = { story_id: "wt-1234567890abcdef", title: "Neue Netzinfrastruktur", source_summary: "Die Netzagentur berichtet über ein neues Verfahren für den Ausbau der Stromnetze. Die vorgesehene Regelung betrifft die Planung und Genehmigung zusätzlicher Stromleitungen.", topic: ["Energie"], claims: [], analysis: { status: "Entwurf", analysis_type: "ex_ante", human: { relevance: "mittel" } } };
const MODEL = { type: "image", job_type: C.model, display_name: C.model_name, params: [{ name: "aspect_ratio", enum: ["16:9"] }, { name: "resolution", enum: ["2k"] }] };
function png(width = 1200, height = 675) {
  const chunk = (kind, bytes) => { const size = Buffer.alloc(4); size.writeUInt32BE(bytes.length); return Buffer.concat([size, Buffer.from(kind), bytes, Buffer.alloc(4)]); };
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height,4); header[8] = 8; header[9] = 6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk("IHDR", header), chunk("IDAT", deflateSync(Buffer.alloc((width * 4 + 1) * height))), chunk("IEND", Buffer.alloc(0))]);
}
function temp(t) { const dir = fs.mkdtempSync(path.join(os.tmpdir(), "woek-title-test-")); t.after(() => fs.rmSync(dir,{recursive:true,force:true})); return dir; }
const asset = () => { const bytes = png(); return { ...inspectImage(bytes), bytes, model: C.model, prompt_version: C.prompt_version, generated_at: "2026-09-04T00:00:00Z" }; };
function mockRun(calls, overrides = {}) {
  return async (args) => {
    calls.push(args);
    const command = args.slice(0,2).join(" ");
    if (overrides[command]) return overrides[command](args);
    if (args[0] === "version") return `higgsfield ${C.cli_version} (test)`;
    if (command === "account status") return JSON.stringify({ credits: 100 });
    if (command === "model get") return JSON.stringify(MODEL);
    if (command === "generate cost") return '{"credits":2}';
    if (command === "generate create") return '{"job_ids":["job-123456"]}';
    if (command === "generate wait") return '{"id":"job-123456","status":"completed","result_url":"https://d8j0ntlcm91z4.cloudfront.net/result.png"}';
    throw new Error(`Unexpected command ${command}`);
  };
}

test("title mode uses neutral summary, conservatively excludes sensitive and unclear stories", () => {
  assert.equal(chooseTitleImageMode(STORY).mode, "editorial");
  for (const word of ["Anschlag", "Kinder", "Opfer", "Ermittlungen", "Tatverdächtige", "Gewalt", "Todesfälle", "Putin", "Straftatvorwürfe"]) assert.equal(chooseTitleImageMode({ ...STORY, title: word }).mode, "impact_card", word);
  assert.equal(chooseTitleImageMode({ ...STORY, source_summary: "" }).mode, "impact_card");
  assert.equal(chooseTitleImageMode({ ...STORY, source_summary: "Eine allgemeine aktuelle Mitteilung berichtet über ein nicht genauer beschriebenes Thema ohne materielle Einzelheiten." }).mode, "impact_card");
});
test("editorial prompt includes individual neutral news and documented safe areas, never impact rhetoric", () => {
  const prompt = buildEditorialImagePrompt({ ...STORY, analysis: { summary: "EMOTIONAL_IMPACT_RHETORIC" } });
  assert.match(prompt, /Netzagentur/); assert.match(prompt, /42–96%/); assert.match(prompt, /10–82%/); assert.match(prompt, /0–64%/);
  assert.match(prompt, /No text/); assert.match(prompt, /no.*people/i); assert.doesNotMatch(prompt, /EMOTIONAL_IMPACT_RHETORIC/);
  assert.equal(buildEditorialImagePrompt({ ...STORY, title: "Ermittlungen" }), null);
});
test("health checks pinned binary, actual Pro identity, params and credits without generation", async () => {
  const calls = []; assert.equal((await checkHiggsfieldAvailability({run:mockRun(calls)})).model, "nano_banana_pro");
  assert.equal(calls.some((a) => a[0] === "generate"), false);
  await assert.rejects(checkHiggsfieldAvailability({run:mockRun([], {"model get":()=>JSON.stringify({...MODEL,job_type:"nano_banana_flash"})})}), {code:"HIGGSFIELD_MODEL_MISMATCH"});
  await assert.rejects(checkHiggsfieldAvailability({run:mockRun([], {"version":()=>"bad"})}), {code:"HIGGSFIELD_VERSION_MISMATCH"});
});
test("malformed CLI JSON and structured results are handled without URL guessing", () => {
  assert.throws(()=>parseCliJson("token secret is not JSON"), {code:"HIGGSFIELD_INVALID_JSON"});
  assert.equal(generationResult({job_ids:["abcdef"]}).id,"abcdef");
  assert.equal(generationResult([{id:"a",status:"completed",result_url:"https://higgsfield.ai/a.png"}]).url,"https://higgsfield.ai/a.png");
  assert.equal(generationResult({id:"a",params:{input_image:"https://higgsfield.ai/a.png"}}).url,undefined);
});
test("Higgsfield downloads and persists one original; repeated request spends nothing", async (t) => {
  const directory = temp(t), calls = [];
  const provider = createHiggsfieldAdapter({directory,run:mockRun(calls),download:async()=>asset(),quality:async()=>({version:"text-free-1",status:"passed"}),enabled:true});
  const first = await provider.generate(STORY), second = await provider.generate(STORY);
  assert.ok(Buffer.isBuffer(first.bytes)); assert.equal(second.reused,true);
  assert.equal(calls.filter((a)=>a[0]==="generate"&&a[1]==="create").length,1);
  assert.ok(fs.existsSync(path.join(directory,STORY.story_id,first.file)));
  assert.equal(JSON.parse(fs.readFileSync(path.join(directory,"credits.json"))).reservations.length,1);
});
test("disabled provider and changed cost never create a paid job", async (t) => {
  const directory=temp(t),calls=[];
  await assert.rejects(createHiggsfieldAdapter({directory,enabled:false}).generate(STORY),{code:"HIGGSFIELD_DISABLED"});
  await assert.rejects(createHiggsfieldAdapter({directory,enabled:true,run:mockRun(calls,{"generate cost":()=>'{"credits":99}'})}).generate(STORY),{code:"HIGGSFIELD_COST_CHANGED"});
  assert.equal(calls.some((a)=>a[1]==="create"),false);
});
test("ambiguous submit is durable and cannot create another paid job", async (t) => {
  const calls=[],directory=temp(t), run=mockRun(calls,{"generate create":()=>{throw imageError("HIGGSFIELD_TIMEOUT");},"generate list":()=>"[]"});
  const provider=createHiggsfieldAdapter({directory,enabled:true,run});
  await assert.rejects(provider.generate(STORY),{code:"HIGGSFIELD_TIMEOUT"});
  await assert.rejects(provider.generate(STORY),{code:"HIGGSFIELD_SUBMISSION_UNCERTAIN"});
  assert.equal(calls.filter((a)=>a[1]==="create").length,1);
});
test("only a unique exact-prompt new Pro job may recover a submit", async () => {
  const record={prompt_sha256:digest("matching"),generated_at:"2026-09-04T00:00:00Z"};
  const item={id:"unique-job",job_type:C.model,params:{prompt:"matching"},created_at:record.generated_at,status:"completed"};
  assert.equal((await recoverSubmittedJob(async()=>JSON.stringify([item]),record)).id,"unique-job");
  await assert.rejects(recoverSubmittedJob(async()=>JSON.stringify([item,item]),record),{code:"HIGGSFIELD_SUBMISSION_UNCERTAIN"});
});
test("download validates host, redirects, size and binary format", async () => {
  const bytes=png(); const downloaded=await downloadImage("https://higgsfield.ai/image.png",{lookupImpl:async()=>[{address:"1.1.1.1"}],fetchImpl:async()=>new Response(bytes)});
  assert.ok(Buffer.isBuffer(downloaded.bytes)); assert.equal(downloaded.width,1200);
  for(const url of ["file:///etc/passwd","https://127.0.0.1/x","https://evil.example/x","https://user:pass@higgsfield.ai/x"]) await assert.rejects(downloadImage(url),{code:"IMAGE_URL_NOT_ALLOWED"});
  await assert.rejects(downloadImage("https://higgsfield.ai/x",{lookupImpl:async()=>[{address:"127.0.0.1"}]}),{code:"IMAGE_URL_NOT_PUBLIC"});
  assert.throws(()=>inspectImage(Buffer.from("<svg>")),{code:"IMAGE_SIZE_INVALID"});
  assert.throws(()=>inspectImage(bytes.subarray(0,32)),{code:"IMAGE_FORMAT_INVALID"});
});
function worker(t, overrides={}) {
  return createTitleImagePipeline({root:temp(t),generate:async()=>asset(),raster:async(_svg,{width,height})=>({png:png(width,height)}),publish:async()=>({}),...overrides});
}
test("pipeline creates OG, wide and square, labels editorial, and reuses complete titles", async(t)=>{
  let generations=0,renders=0;
  const prepare=worker(t,{generate:async()=>{generations++;return asset();},raster:async(_svg,{width,height})=>{renders++;return {png:png(width,height)};}});
  const first=await prepare(STORY);
  assert.equal(first.title_image.mode,"editorial"); assert.equal(first.title_image.og.width,1200); assert.equal(first.title_image.wide.height,675); assert.equal(first.title_image.square.width,1080);
  assert.equal(publicTitleImage(first.title_image).label,"KI-generiertes Symbolbild");
  const second=await prepare({...STORY,title_image:first.title_image});
  assert.equal(second.report.title_reused,true); assert.equal(generations,1); assert.equal(renders,3);
});
test("sensitive stories and explicit cards-only skip Higgsfield",async(t)=>{
  const prepare=worker(t,{generate:async()=>{assert.fail("must not generate");}});
  assert.equal((await prepare({...STORY,title:"Angriff"})).title_image.mode,"impact_card");
  assert.equal((await prepare(STORY,{cardsOnly:true})).title_image.mode,"impact_card");
});
for(const code of ["HIGGSFIELD_AUTH_UNAVAILABLE","HIGGSFIELD_TIMEOUT","HIGGSFIELD_GENERATION_FAILED","HIGGSFIELD_DISABLED","IMAGE_DOWNLOAD_FAILED","IMAGE_FORMAT_INVALID"]){
  test(`${code} falls back to complete cards without changing news`,async(t)=>{
    const prepare=worker(t,{generate:async()=>{throw imageError(code);}}), before=JSON.stringify(STORY);
    const result=await prepare(STORY); assert.equal(result.title_image.mode,"impact_card"); assert.equal(result.title_image.fallback_reason,code); assert.ok(result.title_image.wide); assert.equal(JSON.stringify(STORY),before);
  });
}
test("rasterizer failure returns static fallback and never throws through the news gate",async(t)=>{
  const prepare=worker(t,{raster:async()=>{throw imageError("NO_RASTERIZER");}});
  const result=await prepare(STORY,{cardsOnly:true}); assert.equal(result.title_image.status,"fallback"); assert.equal(result.title_image.fallback_reason,"NO_RASTERIZER");
});
test("dry run cannot create images, publish assets or mutate stories",async(t)=>{
  const prepare=worker(t,{generate:async()=>assert.fail(),publish:async()=>assert.fail(),raster:async()=>assert.fail()});
  assert.equal((await prepare(STORY,{dryRun:true})).mode,"editorial");
});
test("web-wide variant preserves semantic HTML headline without repeating title inside image",()=>{
  const result=renderTitleImageFromStory(STORY,{size:"wide",fonts:"none",headlineVisible:false});
  assert.doesNotMatch(result.svg,/>Netzinfrastruktur<\/text>/); assert.match(result.svg,/WIRKUNGSTICKER/);
  assert.match(renderTitleImageFromStory(STORY,{size:"og",fonts:"none"}).svg,/>Netzinfrastruktur<\/text>/);
});
test("public image metadata excludes prompts, credentials, private paths and arbitrary URLs",()=>{
  const result=publicTitleImage({mode:"editorial",prompt:"secret",source_visual:{file:"/private/secret"},og:{url:"https://evil.example/x"}});
  assert.deepEqual(Object.keys(result).sort(),["label","mode"]);
});
test("OCR rejects generated labels and cannot silently pass without its checker",async()=>{
  const header="level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext\n";
  const tsv=header+"5\t1\t1\t1\t1\t1\t0\t0\t100\t50\t96\tCOMPANY\n";
  assert.deepEqual(detectedWords(tsv),["COMPANY"]);
  await assert.rejects(checkEditorialAsset("/unused",{run:async()=>({stdout:tsv})}),{code:"IMAGE_CONTAINS_TEXT"});
  await assert.rejects(checkEditorialAsset("/unused",{run:async()=>{throw new Error();}}),{code:"IMAGE_QUALITY_CHECK_UNAVAILABLE"});
  assert.equal((await checkEditorialAsset("/unused",{run:async()=>({stdout:header})})).status,"passed");
});

test("transient OCR failure retries the saved original, never another generation", async(t)=>{
  const directory=temp(t), calls=[]; let checks=0;
  const provider=createHiggsfieldAdapter({directory,enabled:true,run:mockRun(calls),download:async()=>asset(),quality:async()=>{
    if(!checks++) throw imageError("IMAGE_QUALITY_CHECK_UNAVAILABLE");
    return {version:"text-free-1",status:"passed"};
  }});
  await assert.rejects(provider.generate(STORY),{code:"IMAGE_QUALITY_CHECK_UNAVAILABLE"});
  assert.equal((await provider.generate(STORY)).reused,true);
  assert.equal(calls.filter((a)=>a[1]==="create").length,1);
});
test("permanent text rejection is not regenerated or repeatedly queued", async(t)=>{
  let calls=0;
  const prepare=worker(t,{generate:async()=>{calls++;throw imageError("IMAGE_CONTAINS_TEXT");}});
  const first=await prepare(STORY);
  const second=await prepare({...STORY,title_image:first.title_image});
  assert.equal(calls,1); assert.equal(second.title_image.retry_after,undefined);
});
test("reused fallback advances retry time to avoid queue starvation", async(t)=>{
  let clock="2026-09-04T00:00:00Z";
  const prepare=worker(t,{now:()=>clock,maxGenerations:10,generate:async()=>{throw imageError("HIGGSFIELD_TIMEOUT");}});
  const first=await prepare(STORY); clock="2026-09-04T01:00:00Z";
  const second=await prepare({...STORY,title_image:first.title_image});
  assert.equal(second.report.title_reused,true);
  assert.ok(second.title_image.retry_after > first.title_image.retry_after);
});
test("missing stored motif falls back to cards without creating a replacement",async(t)=>{
  const prepare=worker(t,{generate:async()=>assert.fail(),download:async()=>{throw imageError("IMAGE_DOWNLOAD_FAILED");}});
  const result=await prepare({...STORY,title_image:{source_visual:{url:"https://github.com/source.png",sha256:"a".repeat(64)}}});
  assert.equal(result.title_image.mode,"impact_card");assert.ok(result.title_image.wide);
});
test("editorial raster failure restarts all sizes as a coherent card",async(t)=>{
  let renders=0;
  const prepare=worker(t,{raster:async(_svg,{width,height})=>{if(!renders++)throw new Error("render");return {png:png(width,height)};}});
  const result=await prepare(STORY);
  assert.equal(result.title_image.mode,"impact_card"); assert.equal(renders,4);assert.ok(result.title_image.source_visual);
});
