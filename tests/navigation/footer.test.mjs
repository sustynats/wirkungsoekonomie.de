import test from 'node:test';
import assert from 'node:assert/strict';
import {renderSiteFooter,renderFooterNewsletter,renderFormerFooterLinks,loadNavigation} from '../../scripts/lib/site-shell.mjs';
import {normalizeSiteFooter} from '../../scripts/site/normalize-site-footer.mjs';
import {assertPollScriptPolicy} from '../../scripts/polls/privacy.mjs';

test('footer uses navigation data once per destination',()=>{
  const navigation=loadNavigation();navigation.footerGroups[0].items[0].label='changed label';
  const footer=renderSiteFooter('../',navigation);
  assert.match(footer,/changed label/);
  const hrefs=[...footer.matchAll(/\bhref="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(hrefs.length,new Set(hrefs).size);
  assert.doesNotMatch(footer,/<form|<script|data-woek-newsletter/);
});
test('missing and old global footers become the same footer; article footer remains',()=>{
  const article='<main><article>Unchanged text<footer class="article-footer">Article source</footer></article></main>';
  const missing=normalizeSiteFooter('<body>'+article+'</body>','../');
  const old=normalizeSiteFooter('<body>'+article+'<footer class="site-footer">Old navigation</footer></body>','../');
  assert.equal(missing,old);assert.ok(missing.includes(article));
  assert.equal(normalizeSiteFooter(missing,'../'),missing);
});
test('unclassified article footer is retained byte for byte',()=>{
  const article='<main><article><p>Evidence and attribution</p><footer><a href="source.html">Source</a></footer></article></main>';
  const result=normalizeSiteFooter('<body>'+article+'</body>');
  assert.ok(result.includes(article));
  assert.equal((result.match(/<footer/g)||[]).length,2);
  assert.equal(normalizeSiteFooter(result),result);
});
test('existing release link survives both source-package and committed-page builds',()=>{
  const local=renderFormerFooterLinks('portale/index.html','../');
  assert.match(local,/href="\.\.\/website-1-0-release\/">Releasebericht/);
  const before='<body><main>Unchanged portal text</main>'+local+renderSiteFooter('../')+'</body>';
  const result=normalizeSiteFooter(before,'../',local);
  assert.equal((result.match(/data-footer-links-migration/g)||[]).length,1);
  assert.equal(normalizeSiteFooter(result,'../',local),result);
  assert.equal(renderFormerFooterLinks('umfragen/private/index.html','../../'),'');
});
test('private poll keeps shared footer without cross-page newsletter identity',()=>{
  const before='<head><meta name="woek-private-interaction" content="true"><meta name="referrer" content="no-referrer"></head><body><main>Private question</main>'+renderSiteFooter('/')+renderFooterNewsletter('/')+'<script type="module" src="/assets/js/poll-visual.js"></script></body>';
  const result=normalizeSiteFooter(before,'/');
  assertPollScriptPolicy(result,{sensitive:true});
  assert.ok(result.includes(renderSiteFooter('/')));
  assert.doesNotMatch(result,/footer-newsletter-form|data-woek-newsletter-welcome/);
  assert.match(result,/Zum Wirkungsbrief anmelden/);
  assert.equal(normalizeSiteFooter(result,'/'),result);
});
