import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchPublicArticle } from '../../scripts/news/lib.mjs';

const url = 'https://research.example.org/report.pdf';
const source = { source_id:'public-research', enabled:true, url, feed_url:url,
  access:{status:'public',article:'bounded_public_text',cost_usd:0,requires_login:false,requires_payment:false} };
const policy = { resolve_dns:false, allow_public_pdf:true, max_article_bytes:2000000, max_public_pdf_bytes:4000000 };
function fetchBody(size, type='application/pdf', declared=false) {
  // Invalid PDF signature deliberately stops before external text extraction.
  // Reaching ARTICLE_PDF_INVALID proves the complete bounded read succeeded.
  return async()=>new Response(new Uint8Array(size), {headers:{'content-type':type,
    ...(declared?{'content-length':String(size)}:{})}});
}
test('an explicit public PDF allowance admits 2-4 MB documents to signature validation', async()=>{
  await assert.rejects(fetchPublicArticle({url},source,policy,fetchBody(3711302)),/ARTICLE_PDF_INVALID/);
});
test('without a separate PDF allowance the article bound remains in force',async()=>{
  const {max_public_pdf_bytes,...unchanged}=policy;
  await assert.rejects(fetchPublicArticle({url},source,unchanged,fetchBody(3711302)),/FEED_TOO_LARGE/);
});
test('the hard PDF ceiling rejects declared and streamed overflow even if configured higher',async()=>{
  for(const declared of [true,false]) await assert.rejects(
    fetchPublicArticle({url},source,{...policy,max_public_pdf_bytes:8000000},fetchBody(4000001,'application/pdf',declared)),/FEED_TOO_LARGE/);
});
test('the PDF allowance does not enlarge HTML downloads or allow PDFs without opt-in',async()=>{
  await assert.rejects(fetchPublicArticle({url},source,policy,fetchBody(2000001,'text/html')),/FEED_TOO_LARGE/);
  await assert.rejects(fetchPublicArticle({url},source,{...policy,allow_public_pdf:false},fetchBody(100)),/ARTICLE_CONTENT_TYPE_INVALID/);
});
test('invalid PDF limits fail closed instead of silently disabling the size bound',async()=>{
  for(const limit of ['invalid',Infinity,0,-1]) await assert.rejects(
    fetchPublicArticle({url},source,{...policy,max_public_pdf_bytes:limit},fetchBody(100)),/ARTICLE_PDF_LIMIT_INVALID/);
});
test('a deliberately smaller PDF policy remains binding',async()=>{
  await assert.rejects(fetchPublicArticle({url},source,{...policy,max_public_pdf_bytes:1000},fetchBody(1001)),/FEED_TOO_LARGE/);
});
