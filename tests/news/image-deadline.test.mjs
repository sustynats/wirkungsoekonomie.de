import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {generateEditorialVisual} from '../../scripts/news/title-image/pipeline.mjs';
import {downloadImage} from '../../scripts/news/title-image/image-file.mjs';

test('a stalled Higgsfield request exits through the fallback catch, never exit 13',()=>{
  const url=new URL('../../scripts/news/title-image/pipeline.mjs',import.meta.url).href;
  const script=`import {generateEditorialVisual} from ${JSON.stringify(url)};try{await generateEditorialVisual({story_id:'wt-0123456789abcdef'}, {endpoint:'https://example.org/render',token:'test',fetchImpl:()=>new Promise(()=>{}),timeoutMs:15});process.exitCode=2;}catch(error){if(error.message!=='HIGGSFIELD_REQUEST_TIMEOUT')throw error;console.log('fallback');}`;
  const child=spawnSync(process.execPath,['--input-type=module','-e',script],{env:{...process.env,WIRKUNGSTICKER_PROCESSING_MODE:'dropbox_chatgpt_bridge',VISUAL_GENERATION_PROVIDER:'higgsfield'},timeout:5000,encoding:'utf8'});
  assert.equal(child.status,0,child.stderr);assert.match(child.stdout,/fallback/);
});
test('image deadline includes stalled response bodies and DNS lookup',async()=>{
  const old=process.env.VISUAL_GENERATION_PROVIDER;process.env.VISUAL_GENERATION_PROVIDER='higgsfield';
  try {await assert.rejects(generateEditorialVisual({}, {endpoint:'https://example.org',token:'test',timeoutMs:15,fetchImpl:async()=>({ok:true,body:{async *[Symbol.asyncIterator](){await new Promise(()=>{});}}})}),/HIGGSFIELD_REQUEST_TIMEOUT/);}
  finally {if(old===undefined)delete process.env.VISUAL_GENERATION_PROVIDER;else process.env.VISUAL_GENERATION_PROVIDER=old;}
  await assert.rejects(downloadImage('https://github.com/example/image',{timeoutMs:15,lookupImpl:()=>new Promise(()=>{})}),/IMAGE_DOWNLOAD_TIMEOUT/);
});
