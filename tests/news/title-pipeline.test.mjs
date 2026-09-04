import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { deflateSync } from "node:zlib";
import { runInNewContext } from "node:vm";
import { IMAGE_CONFIG as C, chooseTitleImageMode, buildEditorialImagePrompt, digest, imageError } from "../../scripts/news/title-image/policy.mjs";
import { inspectImage, downloadImage } from "../../scripts/news/title-image/image-file.mjs";
import { checkHiggsfieldAvailability, createHiggsfieldAdapter, parseCliJson, generationResult, recoverSubmittedJob } from "../../scripts/news/title-image/higgsfield.mjs";
import { createTitleImagePipeline, publicTitleImage } from "../../scripts/news/title-image/pipeline.mjs";
import { renderTitleImageFromStory } from "../../scripts/news/title-image/index.mjs";
import { checkEditorialAsset, detectedWords, VISUAL_GATE_VERSION } from "../../scripts/news/title-image/quality.mjs";
import { backfillTitleImages } from "../../scripts/news/title-image/backfill.mjs";
import { setGeneratedDocument, cleanupChromeProfile } from "../../scripts/news/title-image/chrome-render.mjs";

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
    if (command === "generate get") return '{"id":"job-123456","status":"queued"}';
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
  assert.match(prompt, /Netzagentur/); assert.match(prompt, /8–56%/); assert.match(prompt, /18–46%/); assert.match(prompt, /0–57%/);
  assert.match(prompt, /No text/); assert.match(prompt, /no.*people/i); assert.doesNotMatch(prompt, /EMOTIONAL_IMPACT_RHETORIC/);
  assert.equal(buildEditorialImagePrompt({ ...STORY, title: "Ermittlungen" }), null);
});
test("editorial subjects are concrete and topic-specific, not default abstract flows", () => {
  const care = { ...STORY, title: "Ausbildung in Gesundheitsberufen", source_summary: "Die Ausbildung in Gesundheitsberufen verzeichnet mehr Eintritte, zugleich aber auch mehr Abbrüche. Eine Auswertung der wirtschaftlichen Rahmenbedingungen soll die Ursachen beschreiben." };
  assert.equal(chooseTitleImageMode(care).topic, "care_training");
  const prompt = buildEditorialImagePrompt(care);
  assert.match(prompt, /clinical training room/);
  assert.match(prompt, /photographic-style/);
  assert.match(prompt, /Not an abstract drawing/);
  assert.match(prompt, /not a photograph of a real event/i);
  assert.match(prompt, /right 60–96% calm/);
  assert.equal(chooseTitleImageMode({ ...care, title: "Ermittlungen in Gesundheitsberufen" }).mode, "impact_card");
});
test("sensitive news can use an explicit neutral object without exposing incident context to image generation", () => {
  const story = { ...STORY, title: "Sabotage an Umspannwerk in Beispielstadt", source_summary: "Nach einer mutmaßlichen Sabotage an einem Umspannwerk ermittelt die Polizei gegen eine Person. Die Stromversorgung wird nach Angaben des Betreibers weiter aufrechterhalten." };
  assert.equal(chooseTitleImageMode(story).topic, "grid");
  assert.equal(chooseTitleImageMode(story).object_only, true);
  const prompt = buildEditorialImagePrompt(story);
  assert.match(prompt, /intact, generic electrical substation/);
  assert.doesNotMatch(prompt, /Beispielstadt|Sabotage|Polizei/);
  assert.equal(chooseTitleImageMode({ ...story, title: "Vorwürfe gegen eine Person" }).mode, "impact_card");
  const childcare = { ...story, title: "Kinderbetreuung bei der Bundeswehr", source_summary: "Die Kosten der Kinderbetreuung bei der Bundeswehr sind gestiegen. Die Meldung beschreibt die Finanzierung bestehender Betreuungsplätze in Kindertagesstätten." };
  assert.equal(chooseTitleImageMode(childcare).topic, "childcare");
  assert.match(buildEditorialImagePrompt(childcare), /empty generic daycare/);
  assert.doesNotMatch(buildEditorialImagePrompt(childcare), /Bundeswehr/);
  assert.equal(chooseTitleImageMode({ ...childcare, title: "Missbrauch von Kindern im Internet" }).mode, "impact_card");
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
  const provider = createHiggsfieldAdapter({directory,run:mockRun(calls),download:async()=>asset(),quality:async()=>({version:VISUAL_GATE_VERSION,status:"passed"}),enabled:true});
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
test("owner-approved image budget has no daily or monthly cap; balance and per-image price still gate creates", async (t) => {
  assert.equal(C.max_generations_per_day, undefined);
  assert.equal(C.max_credits_per_month, undefined);
  const directory = temp(t), calls = [];
  const reservations = Array.from({ length: 301 }, () => ({ at: "2026-09-04T00:00:00Z", credits: 2 }));
  fs.writeFileSync(path.join(directory, "credits.json"), JSON.stringify({ reservations }));
  const provider = createHiggsfieldAdapter({ directory, run: mockRun(calls), download: async () => asset(), quality: async () => ({ version: VISUAL_GATE_VERSION, status: "passed" }), enabled: true });
  await provider.generate(STORY);
  assert.equal(calls.filter(a => a[1] === "create").length, 1);
  assert.equal(JSON.parse(fs.readFileSync(path.join(directory, "credits.json"))).reservations.length, 302);
  const emptyCalls = [];
  await assert.rejects(createHiggsfieldAdapter({ directory: temp(t), enabled: true, run: mockRun(emptyCalls, { "account status": () => '{"credits":0}' }) }).generate(STORY), { code: "HIGGSFIELD_CREDITS_UNAVAILABLE" });
  assert.equal(emptyCalls.some(a => a[1] === "create"), false);
});
test("already paid job can finish even when remaining account balance is empty", async (t) => {
  const directory = temp(t), calls = [], folder = path.join(directory, STORY.story_id);
  fs.mkdirSync(folder);
  fs.writeFileSync(path.join(folder, "source-visual.json"), JSON.stringify({ status: "queued", job_id: "job-123456", prompt_version: C.prompt_version }));
  const provider = createHiggsfieldAdapter({ directory, enabled: true, run: mockRun(calls, { "account status": () => assert.fail("do not recheck balance for a paid job") }), download: async () => asset(), quality: async () => ({ version: VISUAL_GATE_VERSION, status: "passed" }) });
  assert.ok((await provider.generate(STORY)).bytes);
  assert.equal(calls.some(a => a[1] === "create"), false);
});
test("confirmed failed provider job permits one delayed replacement and then stops durably",async(t)=>{
  let clock="2026-09-04T09:00:00Z";
  const calls=[],directory=temp(t),run=mockRun(calls,{"generate get":()=>'{"id":"job-123456","status":"failed"}'});
  const options={directory,enabled:true,run,now:()=>clock};
  let provider=createHiggsfieldAdapter(options);
  await assert.rejects(provider.generate(STORY),{code:"HIGGSFIELD_JOB_RETRY_WAIT"});
  await assert.rejects(provider.generate(STORY),{code:"HIGGSFIELD_JOB_RETRY_WAIT"});
  assert.equal(calls.filter(a=>a[1]==="create").length,1);
  clock="2026-09-04T09:15:00Z";
  provider=createHiggsfieldAdapter(options); // A process restart must not reset the attempt budget.
  await assert.rejects(provider.generate(STORY),{code:"HIGGSFIELD_RETRY_EXHAUSTED"});
  await assert.rejects(createHiggsfieldAdapter(options).generate(STORY),{code:"HIGGSFIELD_RETRY_EXHAUSTED"});
  assert.equal(calls.filter(a=>a[1]==="create").length,2);assert.equal(calls.filter(a=>a[1]==="wait").length,0);
  const record=JSON.parse(fs.readFileSync(path.join(directory,STORY.story_id,"source-visual.json")));
  assert.equal(record.previous_attempts.length,1);
  assert.equal(JSON.parse(fs.readFileSync(path.join(directory,"credits.json"))).reservations.length,2);
});
test("confirmed provider failure can recover, but cancelled jobs never generate a replacement",async(t)=>{
  let clock="2026-09-04T09:00:00Z", failed=true;const calls=[],directory=temp(t);
  const provider=createHiggsfieldAdapter({directory,enabled:true,now:()=>clock,run:mockRun(calls,{"generate get":()=>JSON.stringify({id:"job-123456",status:failed?"failed":"queued"})}),download:async()=>asset(),quality:async()=>({version:VISUAL_GATE_VERSION,status:"passed"})});
  await assert.rejects(provider.generate(STORY),{code:"HIGGSFIELD_JOB_RETRY_WAIT"});
  failed=false;clock="2026-09-04T09:15:00Z";
  assert.ok((await provider.generate(STORY)).bytes);
  assert.equal((await provider.generate(STORY)).reused,true);
  assert.equal(calls.filter(a=>a[1]==="create").length,2);
  const cancelledCalls=[],cancelled=createHiggsfieldAdapter({directory:temp(t),enabled:true,run:mockRun(cancelledCalls,{"generate get":()=>'{"id":"job-123456","status":"cancelled"}'})});
  await assert.rejects(cancelled.generate(STORY),{code:"HIGGSFIELD_PREVIOUS_JOB_FAILED"});
  await assert.rejects(cancelled.generate(STORY),{code:"HIGGSFIELD_PREVIOUS_JOB_FAILED"});
  assert.equal(cancelledCalls.filter(a=>a[1]==="create").length,1);
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
test("render-only template update reuses original bytes without a paid provider call", async (t) => {
  const original = asset(); let downloads = 0;
  const prepare = worker(t, { allowGeneration: false, generate: async () => assert.fail("paid call forbidden"), download: async () => { downloads++; return original; } });
  const source = { url: "https://github.com/saved-original.png", sha256: original.sha256, prompt_version: "original-prompt" };
  const result = await prepare({ ...STORY, title_image: { mode: "editorial", template_version: "old", source_visual: source } });
  assert.equal(downloads, 1);
  assert.equal(result.report.higgsfield_called, false);
  assert.equal(result.report.source_reused, true);
  assert.equal(result.title_image.template_version, C.template_version);
  assert.equal(result.title_image.prompt_version, "original-prompt");
  assert.deepEqual(result.title_image.source_visual, source);
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
test("editorial panel is translucent while its readable content remains opaque",()=>{
  const {svg}=renderTitleImageFromStory(STORY,{size:"wide",mode:"editorial",fonts:"none",image:{src:`data:image/png;base64,${png().toString('base64')}`}});
  assert.match(svg, /data-impact-panel="true"[^>]*fill-opacity="0\.62"/);
  assert.doesNotMatch(svg, /<g[^>]*opacity="0\.62"/);
});
test("large inline originals use bounded CDP frames and reconstruct exactly",async()=>{
  const svg='<svg><image href="data:image/png;base64,'+'A'.repeat(8*1024*1024)+'"/></svg>';
  let rebuilt;
  const context={Image:class{},Blob:class{constructor(parts){rebuilt=parts.join('');}},URL:{createObjectURL:()=>"blob:local"},document:{body:{replaceChildren(image){assert.equal(image.src,"blob:local");}}}};let chunks=0;
  await setGeneratedDocument(async(method,params)=>{
    assert.ok(JSON.stringify(params).length<70000);
    if(method==="Page.setDocumentContent"){assert.match(params.html,/default-src 'none'/);assert.equal(params.frameId,"frame-test");return {};}
    chunks++;return {result:{value:runInNewContext(params.expression,context)}};
  },"frame-test",svg);
  assert.ok(chunks>120);assert.equal(rebuilt,svg);assert.equal(context.__wtSvg,undefined);
});
test("CDP document construction fails closed when browser evaluation fails",async()=>{
  await assert.rejects(setGeneratedDocument(async()=>({exceptionDetails:{}}),"frame","<svg/>"),/CHROME_DOCUMENT_INVALID/);
});
test("Linux profile cleanup retries and cannot discard a completed image",async()=>{
  const directory=path.join(os.tmpdir(),"wt-title-cdp-test"),warnings=[];
  await cleanupChromeProfile(directory,{remove:async(file,options)=>{
    assert.equal(file,directory);assert.equal(options.maxRetries,10);assert.equal(options.retryDelay,50);
    throw Object.assign(new Error("busy"),{code:"ENOTEMPTY"});
  },warn:value=>warnings.push(value)});
  assert.deepEqual(warnings,["CHROME_PROFILE_CLEANUP_DEFERRED"]);
  await assert.rejects(cleanupChromeProfile(os.tmpdir()),/CHROME_PROFILE_PATH_INVALID/);
});
test("public image metadata excludes prompts, credentials, private paths and arbitrary URLs",()=>{
  const result=publicTitleImage({mode:"editorial",prompt:"secret",source_visual:{file:"/private/secret"},og:{url:"https://evil.example/x"}});
  assert.equal(result,null);
});
test("OCR rejects generated labels and cannot silently pass without its checker",async()=>{
  const header="level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext\n";
  const tsv=header+"5\t1\t1\t1\t1\t1\t0\t0\t100\t50\t96\tCOMPANY\n";
  assert.deepEqual(detectedWords(tsv),["COMPANY"]);
  await assert.rejects(checkEditorialAsset("/unused",{run:async()=>({stdout:tsv})}),{code:"IMAGE_CONTAINS_TEXT"});
  await assert.rejects(checkEditorialAsset("/unused",{run:async()=>{throw new Error();}}),{code:"IMAGE_QUALITY_CHECK_UNAVAILABLE"});
  assert.equal((await checkEditorialAsset("/unused",{run:async()=>({stdout:header})})).status,"passed");
  await checkEditorialAsset("/unused",{run:async(_cmd,_args,options)=>{
    assert.equal(options.timeout,30000); assert.equal(options.env.OMP_THREAD_LIMIT,"1");
    return {stdout:header};
  }});
});

test("ambiguous sparse OCR requires block confirmation and remains fail-closed", async()=>{
  const header="level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext\n";
  const word=(text,confidence)=>header+`5\t1\t1\t1\t1\t1\t0\t0\t100\t50\t${confidence}\t${text}\n`;
  const calls=[];
  assert.equal((await checkEditorialAsset("/unused",{run:async(_cmd,args)=>{calls.push(args[5]);return {stdout:args[5]==="11"?word("NEI",65.68):header};}})).status,"passed");
  assert.deepEqual(calls,["11","6"]);
  await assert.rejects(checkEditorialAsset("/unused",{run:async(_cmd,args)=>({stdout:args[5]==="11"?word("NEI",65.68):word("nei",64)})}),{code:"IMAGE_CONTAINS_TEXT"});
  await assert.rejects(checkEditorialAsset("/unused",{run:async(_cmd,args)=>{if(args[5]==="6")throw new Error();return {stdout:word("NEI",65.68)};}}),{code:"IMAGE_QUALITY_CHECK_UNAVAILABLE"});
});
test("new OCR version rechecks an old rejection from saved bytes without another paid job",async(t)=>{
  const directory=temp(t),calls=[];let checks=0;
  const provider=createHiggsfieldAdapter({directory,enabled:true,run:mockRun(calls),download:async()=>asset(),quality:async()=>{checks++;return {version:VISUAL_GATE_VERSION,status:"passed"};}});
  const original=await provider.generate(STORY),journal=path.join(directory,STORY.story_id,"source-visual.json");
  const record=JSON.parse(fs.readFileSync(journal));record.quality_gate={version:"text-free-1",status:"rejected",reason:"IMAGE_CONTAINS_TEXT"};fs.writeFileSync(journal,JSON.stringify(record));
  const reused=await provider.generate(STORY);assert.equal(reused.reused,true);assert.equal(reused.sha256,original.sha256);assert.equal(checks,2);
  assert.equal(calls.filter(a=>a[1]==="create").length,1);
});
test("transient OCR failure retries the saved original, never another generation", async(t)=>{
  const directory=temp(t), calls=[]; let checks=0;
  const provider=createHiggsfieldAdapter({directory,enabled:true,run:mockRun(calls),download:async()=>asset(),quality:async()=>{
    if(!checks++) throw imageError("IMAGE_QUALITY_CHECK_UNAVAILABLE");
    return {version:VISUAL_GATE_VERSION,status:"passed"};
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
test("approved backfill persists only its bounded snapshot before the runtime deadline",async(t)=>{
  const root=temp(t);fs.mkdirSync(path.join(root,"data/news"),{recursive:true});fs.mkdirSync(path.join(root,"reports"));
  const stories=[0,1,2].map(n=>({...STORY,story_id:`wt-1234567890abcde${n}`,published:true}));
  const file=path.join(root,"data/news/stories.json");fs.writeFileSync(file,JSON.stringify({stories}));
  fs.writeFileSync(path.join(root,"reports/wirkungsticker-latest-run.json"),"{}");
  const result=await backfillTitleImages({root,limit:2,dryRun:false,maxDurationMs:0,prepare:()=>assert.fail("deadline must prevent work"),build:()=>{}});
  const saved=JSON.parse(fs.readFileSync(file));assert.equal(result.selected,0);
  assert.ok(saved.stories[0].title_image.retry_after);assert.ok(saved.stories[1].title_image.retry_after);assert.equal(saved.stories[2].title_image,undefined);
  assert.equal(publicTitleImage(saved.stories[0].title_image),null);
});

test("overlay-only backfill selects existing editorial images and preserves a failed render", async (t) => {
  const root = temp(t); fs.mkdirSync(path.join(root, "data/news"), { recursive: true }); fs.mkdirSync(path.join(root, "reports"));
  const original = { mode: "editorial", wide: { url: "old" }, source_visual: { sha256: "original" } };
  const stories = [
    { ...STORY, published: true, title_image: original },
    { ...STORY, story_id: "wt-1234567890abcdea", published: true, title_image: { mode: "impact_card" } },
    { ...STORY, story_id: "wt-1234567890abcdeb", published: true },
  ];
  const file = path.join(root, "data/news/stories.json"); fs.writeFileSync(file, JSON.stringify({ stories }));
  fs.writeFileSync(path.join(root, "reports/wirkungsticker-latest-run.json"), "{}");
  let calls = 0;
  const result = await backfillTitleImages({ root, limit: 20, dryRun: false, renderOnly: true, editorialOnly: true, build: () => {}, prepare: async () => {
    calls++; return { title_image: { mode: "impact_card" }, report: { status: "fallback" } };
  } });
  assert.equal(calls, 1); assert.equal(result.changed, 0); assert.equal(result.results[0].status, "preserved");
  assert.deepEqual(JSON.parse(fs.readFileSync(file)).stories, stories);
  await assert.rejects(backfillTitleImages({ root, editorialOnly: true }), /REQUIRES_RENDER_ONLY/);
});

test("explicit revision creates one replacement, retains history and then reuses it", async (t) => {
  const directory = temp(t), calls = [];
  const provider = createHiggsfieldAdapter({ directory, run: mockRun(calls), download: async () => asset(), quality: async () => ({ version: VISUAL_GATE_VERSION, status: "passed" }), enabled: true });
  await provider.generate(STORY);
  const journal = path.join(directory, STORY.story_id, "source-visual.json");
  const old = JSON.parse(fs.readFileSync(journal)); old.prompt_version = "old-prompt";
  fs.writeFileSync(journal, JSON.stringify(old));
  const refresh = { ...STORY, refresh_prompt_version: C.prompt_version };
  const replaced = await provider.generate(refresh);
  assert.equal(replaced.prompt_version, C.prompt_version);
  assert.equal((await provider.generate(refresh)).reused, true);
  assert.equal((await provider.generate(STORY)).prompt_version, C.prompt_version);
  assert.equal(calls.filter(a => a[1] === "create").length, 2);
  assert.ok(fs.readdirSync(path.dirname(journal)).some(name => name.startsWith("source-visual-history-")));
  await assert.rejects(provider.generate({ ...STORY, refresh_prompt_version: "unapproved" }), { code: "HIGGSFIELD_REFRESH_VERSION_INVALID" });
  assert.equal(calls.filter(a => a[1] === "create").length, 2);
});

test("uncertain replacement keeps old journal and cannot pay for a duplicate", async (t) => {
  const directory = temp(t), calls = [];
  const initial = createHiggsfieldAdapter({ directory, run: mockRun(calls), download: async () => asset(), quality: async () => ({ version: VISUAL_GATE_VERSION, status: "passed" }), enabled: true });
  await initial.generate(STORY);
  const journal = path.join(directory, STORY.story_id, "source-visual.json");
  const old = JSON.parse(fs.readFileSync(journal)); old.prompt_version = "old-prompt";
  fs.writeFileSync(journal, JSON.stringify(old));
  const provider = createHiggsfieldAdapter({ directory, enabled: true, run: mockRun(calls, { "generate create": () => { throw imageError("HIGGSFIELD_TIMEOUT"); }, "generate list": () => "[]" }) });
  const refresh = { ...STORY, refresh_prompt_version: C.prompt_version };
  await assert.rejects(provider.generate(refresh), { code: "HIGGSFIELD_TIMEOUT" });
  await assert.rejects(provider.generate(refresh), { code: "HIGGSFIELD_SUBMISSION_UNCERTAIN" });
  assert.deepEqual(JSON.parse(fs.readFileSync(journal)), old);
  assert.equal(calls.filter(a => a[1] === "create").length, 2);
});

test("queued replacement keeps all old public images until success and survives retries", async (t) => {
  const previous = (await worker(t)(STORY)).title_image;
  previous.source_visual.prompt_version = "old-prompt";
  const queued = { ...STORY, title_image: { ...previous, refresh_prompt_version: C.prompt_version, retry_after: "2026-01-01T00:00:00Z" } };
  const failed = await worker(t, { generate: async () => { throw imageError("HIGGSFIELD_TIMEOUT"); } })(queued);
  assert.deepEqual(publicTitleImage(failed.title_image), publicTitleImage(previous));
  assert.equal(failed.title_image.refresh_prompt_version, C.prompt_version);
  assert.ok(failed.title_image.retry_after);
  const succeeded = await worker(t, { generate: async story => { assert.equal(story.refresh_prompt_version, C.prompt_version); return asset(); } })({ ...STORY, title_image: failed.title_image });
  assert.equal(succeeded.title_image.refresh_prompt_version, undefined);
  assert.equal(succeeded.title_image.source_visual.prompt_version, C.prompt_version);
});

test("render-only and terminal replacement failures never discard a working title", async (t) => {
  const previous = (await worker(t)(STORY)).title_image;
  previous.source_visual.prompt_version = "old-prompt";
  const queued = { ...STORY, title_image: { ...previous, refresh_prompt_version: C.prompt_version, retry_after: "2026-01-01T00:00:00Z" } };
  const readonly = await worker(t, { allowGeneration: false, generate: async () => assert.fail() })(queued);
  assert.deepEqual(readonly.title_image, queued.title_image);
  const rejected = await worker(t, { generate: async () => { throw imageError("IMAGE_CONTAINS_TEXT"); } })(queued);
  assert.deepEqual(publicTitleImage(rejected.title_image), publicTitleImage(previous));
  assert.equal(rejected.title_image.refresh_prompt_version, undefined);
  assert.equal(rejected.title_image.retry_after, undefined);
});

test("explicit refresh snapshots eligible old images and newly visualisable cards, never changes article text", async (t) => {
  const root = temp(t); fs.mkdirSync(path.join(root, "data/news"), { recursive: true }); fs.mkdirSync(path.join(root, "reports"));
  const title = { mode: "editorial", wide: { url: "old" }, source_visual: { prompt_version: "old-prompt" } };
  const stories = [
    { ...STORY, published: true, title_image: title },
    { ...STORY, story_id: "wt-1234567890abcdea", published: true, title_image: { ...title, source_visual: { prompt_version: C.prompt_version } } },
    { ...STORY, story_id: "wt-1234567890abcdeb", published: true, title: "Ermittlungen", title_image: title },
    { ...STORY, story_id: "wt-1234567890abcdec", published: true, title_image: { mode: "impact_card" } },
    { ...STORY, story_id: "wt-1234567890abcded", published: true, title_image: { ...title, source_visual: { prompt_version: "woek-editorial-3-concrete" } } },
    { ...STORY, story_id: "wt-1234567890abcdee", published: true, title: "Ermittlungen", title_image: { mode: "impact_card", template_version: "old" } },
  ];
  const file = path.join(root, "data/news/stories.json"); fs.writeFileSync(file, JSON.stringify({ stories }));
  fs.writeFileSync(path.join(root, "reports/wirkungsticker-latest-run.json"), "{}");
  const before = fs.readFileSync(file, "utf8");
  const dry = await backfillTitleImages({ root, refreshEditorial: true, limit: 20 });
  assert.equal(dry.candidates, 3); assert.equal(dry.results[0].would_generate, true);
  assert.equal(dry.results[2].would_generate, false);
  assert.equal(fs.readFileSync(file, "utf8"), before);
  await backfillTitleImages({ root, refreshEditorial: true, dryRun: false, maxDurationMs: 0, limit: 20, build: () => {} });
  const saved = JSON.parse(fs.readFileSync(file)).stories;
  assert.equal(saved[0].title_image.refresh_prompt_version, C.prompt_version);
  assert.deepEqual(publicTitleImage(saved[0].title_image), publicTitleImage(stories[0].title_image));
  for (const i of [1, 2, 4]) assert.deepEqual(saved[i], stories[i]);
  assert.equal(saved[3].title_image.refresh_prompt_version, C.prompt_version);
  assert.equal(saved[5].title_image.refresh_prompt_version, undefined);
  assert.ok(saved[5].title_image.retry_after);
  assert.equal(saved[0].source_summary, STORY.source_summary);
  await assert.rejects(backfillTitleImages({ root, refreshEditorial: true, renderOnly: true }), /REFRESH_MODE_CONFLICT/);
});
