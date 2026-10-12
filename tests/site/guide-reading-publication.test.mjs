import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {verifyGuideReadingEdition,matchesGuideReferenceSource} from '../../scripts/lib/guide-reading-publication.mjs';

function fixture(){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'woek-guide-proof-'));
  const copy=relative=>{
    const target=path.join(root,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(relative,target);
  };
  const manifestPath='assets/data/guide-reading-edition-2026-10-12.json';
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  const succession=manifest.sourceSuccession['content/site/reference-update.json'];
  const guidePath='content/grundlagen/guide-publication-current.json';
  const guide=JSON.parse(fs.readFileSync(guidePath,'utf8'));
  new Set([manifestPath,guidePath,succession.archive,succession.pdf,succession.visualReview,
    'content/site/reference-update.json',guide.source,guide.visualReview,
    ...Object.keys(manifest.sources),...manifest.files.map(file=>file.path)]).forEach(copy);
  return {root,manifestPath,manifest,succession,remove:()=>fs.rmSync(root,{recursive:true,force:true})};
}

test('the complete guide and reference publication verifies its actual reading source',()=>{
  assert.equal(verifyGuideReadingEdition().files.length,2);
  assert.equal(matchesGuideReferenceSource('content/site/reference-update.json','0'.repeat(64)),false);
  assert.equal(matchesGuideReferenceSource('content/site/another-source.json','d01f1c547d629bb3b303a65b1d37c0ccee521783f45b8a1f6a7d7f0b92286835'),false);
});
test('an altered overview or PDF cannot inherit the recorded review',()=>{
  for(const relative of ['content/site/reference-update.json','public/downloads/originals/WOeK_Grundlagen_Fachreferenzen_2026-10-12.pdf']){
    const f=fixture();try{fs.appendFileSync(path.join(f.root,relative),'changed');assert.throws(()=>verifyGuideReadingEdition(f.root),/changed/);}finally{f.remove();}
  }
});
test('incomplete visual coverage fails even when the proof file checksum is renewed',()=>{
  const f=fixture();try{
    const proofPath=path.join(f.root,f.succession.visualReview);
    const proof=JSON.parse(fs.readFileSync(proofPath,'utf8'));proof.reviewedPages=[1,2];
    fs.writeFileSync(proofPath,JSON.stringify(proof));
    f.succession.visualReviewSha256=crypto.createHash('sha256').update(fs.readFileSync(proofPath)).digest('hex');
    fs.writeFileSync(path.join(f.root,f.manifestPath),JSON.stringify(f.manifest));
    assert.throws(()=>verifyGuideReadingEdition(f.root),/complete source and visual/);
  }finally{f.remove();}
});
test('a preserved predecessor cannot be replaced by another source',()=>{
  const f=fixture();try{fs.writeFileSync(path.join(f.root,f.succession.archive),'other source');assert.throws(()=>verifyGuideReadingEdition(f.root),/predecessor changed/);}finally{f.remove();}
});
