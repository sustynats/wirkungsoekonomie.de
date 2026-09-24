import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadPersonalEditorials, personalArticleBody} from './personal-editorial.mjs';
import {loadManualEditorials} from './manual-editorial.mjs';
import {applyApprovedEditorialRevisions} from './editorial-approved-revisions.mjs';
import {diagramLayouts,diagramBodyHash} from './editorial-diagram-layouts.mjs';

export function auditEditorialVisuals(root) {
  const data=JSON.parse(fs.readFileSync(path.join(root,'data/news/editorial-analyses.json'),'utf8'));
  const all=applyApprovedEditorialRevisions([...data.analyses,...loadPersonalEditorials(root),...loadManualEditorials(root)],root)
    .filter(a=>a.status==='published').sort((a,b)=>Date.parse(b.published_at)-Date.parse(a.published_at)||a.slug.localeCompare(b.slug));
  return all.map((a,i)=>{
    const html=a.format==='approved_editorial'?personalArticleBody(a):fs.readFileSync(path.join(root,'wirkungsticker/analyse',a.slug,'index.html'),'utf8');
    const layout=diagramLayouts.entries.find(e=>e.slug===a.slug);
    const diagrams=(html.match(/data-editorial-explanatory-visual/g)||[]).length+(a.sections||[]).filter(s=>s.visual&&!['reference_table','evidence_table'].includes(s.visual.type)).length;
    const tables=(html.match(/<table\b/g)||[]).length;
    return {rank:i+1,slug:a.slug,title:a.title,published_at:a.published_at,format:a.subtype||a.format,
      diagrams,tables,layout_status:layout?(layout.body_sha256===diagramBodyHash(a.body_markdown)?'bound':'stale'):'not_pinned',
      status:diagrams?'explanatory_visual_present':tables?'table_present_visual_review_open':'visual_review_open'};
  });
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const rows=auditEditorialVisuals(path.resolve(fileURLToPath(new URL('../../',import.meta.url))));
  console.log(JSON.stringify({total:rows.length,last_30_covered:rows.slice(0,30).every(r=>r.diagrams>0),rows},null,2));
  if(process.argv.includes('--check-latest')&&!rows.slice(0,30).every(r=>r.diagrams>0))process.exitCode=1;
}
