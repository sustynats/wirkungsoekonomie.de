import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const manifestPath='assets/data/guide-reading-edition-2026-10-12.json';
const sourcePath='content/site/reference-update.json';
const predecessorSha='d01f1c547d629bb3b303a65b1d37c0ccee521783f45b8a1f6a7d7f0b92286835';
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const fileAt=(root,relative)=>{
  const resolved=path.resolve(root,relative);
  if(!resolved.startsWith(path.resolve(root)+path.sep))throw new Error('Publication path escapes its source tree');
  return resolved;
};

export function verifyGuideReadingEdition(root=process.cwd()){
  const manifest=JSON.parse(fs.readFileSync(fileAt(root,manifestPath),'utf8'));
  const succession=manifest.sourceSuccession?.[sourcePath];
  if(!succession || Object.keys(manifest.sourceSuccession).length!==1 || succession.beforeSha256!==predecessorSha)
    throw new Error('Unknown reference overview predecessor');
  if(hash(fileAt(root,succession.archive))!==predecessorSha || hash(fileAt(root,sourcePath))!==succession.afterSha256)
    throw new Error('Reference overview source or immutable predecessor changed');
  if(hash(fileAt(root,succession.pdf))!==succession.pdfSha256 || hash(fileAt(root,succession.visualReview))!==succession.visualReviewSha256)
    throw new Error('Current reference PDF or its reviewed pages changed');
  const review=JSON.parse(fs.readFileSync(fileAt(root,succession.visualReview),'utf8'));
  if(review.status!=='PASS' || review.pdfSha256!==succession.pdfSha256 || review.sourceSha256!==succession.afterSha256 ||
      review.reviewedPages?.length!==review.pages || review.reviewedPages.some((page,i)=>page!==i+1) || review.sourceValuesChecked!==50)
    throw new Error('Reference overview lacks complete source and visual verification');
  for(const [source,expected]of Object.entries(manifest.sources))if(hash(fileAt(root,source))!==expected)
    throw new Error(`Reading-edition generator changed after verification: ${source}`);
  if(manifest.files.length!==2)throw new Error('Incomplete guide reading publication');
  if(!manifest.files.some(file=>file.path===succession.pdf && file.sha256===succession.pdfSha256 && file.pages===review.pages))
    throw new Error('Reference PDF page count or identity differs from its reviewed edition');
  for(const file of manifest.files){
    if(hash(fileAt(root,file.path))!==file.sha256 || !file.url.startsWith(`https://github.com/sustynats/wirkungsoekonomie.de/releases/download/${manifest.releaseTag}/`) || file.pages<1)
      throw new Error(`Reading PDF changed: ${file.path}`);
  }
  const guide=JSON.parse(fs.readFileSync(fileAt(root,'content/grundlagen/guide-publication-current.json'),'utf8'));
  const guideReview=JSON.parse(fs.readFileSync(fileAt(root,guide.visualReview),'utf8'));
  if(hash(fileAt(root,guide.source))!==guide.sourceSha256 || hash(fileAt(root,guide.visualReview))!==guide.visualReviewSha256 ||
      guideReview.status!=='PASS' || guideReview.pdfSha256!==guide.pdfSha256 || guideReview.sourceSha256!==guide.sourceSha256 ||
      guideReview.reviewedPages?.length!==guide.pages || guideReview.reviewedPages.some((page,i)=>page!==i+1) ||
      !manifest.files.some(file=>file.path===guide.pdf && file.sha256===guide.pdfSha256 && file.pages===guide.pages))
    throw new Error('Guide PDF no longer matches its reviewed reading source');
  return manifest;
}

export function matchesGuideReferenceSource(source,expected,root=process.cwd()){
  if(source!==sourcePath || expected!==predecessorSha)return false;
  verifyGuideReadingEdition(root);
  return true;
}
