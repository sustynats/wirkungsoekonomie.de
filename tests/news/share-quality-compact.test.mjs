import test from 'node:test';
import assert from 'node:assert/strict';
import {articleShareCard,renderShareCard} from '../../scripts/news/share-image.mjs';
import {chromeRenderBatch} from '../../scripts/news/title-image/chrome-render.mjs';
import {findChrome} from '../../scripts/news/title-image/rasterize.mjs';
import {inspectImage} from '../../scripts/news/title-image/image-file.mjs';

const chrome=findChrome();
test('real compact share cards keep full dimensions and use less space than the previous encoding',
 {skip:!chrome,timeout:60000},async()=>{
  const article={'@type':'Article',url:'https://wirkungsoekonomie.de/wirkungsticker/analyse/test/',
   headline:'Wenn Verunsicherung politisch wird: Was eine öffentliche Debatte für Menschen und Demokratie bedeutet',
   articleSection:'Nachgesehen',author:{name:'Natalie Weber'}};
  const card=articleShareCard(article),design=renderShareCard(card);
  const [previous,compact]=await chromeRenderBatch([{...design,quality:88},design],{
   chrome,noSandbox:process.env.GITHUB_ACTIONS==='true'||process.env.WT_CHROME_NO_SANDBOX==='true'});
  for(const image of [previous,compact]){
   const info=inspectImage(image);
   assert.equal(info.mime,'image/jpeg');assert.equal(info.width,1200);assert.equal(info.height,630);
  }
  assert.ok(compact.length<previous.length,'the real raster must become smaller');
  assert.equal(articleShareCard({...article,dateModified:'2026-11-02T12:00:00Z'}).url,card.url,
   'routine metadata still reuses the same semantic card address');
 });
