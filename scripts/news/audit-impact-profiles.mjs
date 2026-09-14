import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {publicImpactAssessment} from './impact-release.mjs';
import {impactResearchHealth} from './impact-research-health.mjs';
import {feedDate} from './feed-order.mjs';
import {buildCaseFiles} from './case-files.mjs';

export function auditImpactProfiles(records) {
  const active=records.filter(s=>s.published && s.analysis && s.listed!==false);
  const visible=buildCaseFiles(active).visibleStories.sort((a,b)=>Date.parse(feedDate(b))-Date.parse(feedDate(a)));
  const rows=visible.map((story,index)=>{
    const a=publicImpactAssessment(story), dims=story.impact_assessment?.dimensions || {};
    return {story_id:story.story_id,url:`https://wirkungsoekonomie.de/wirkungsticker/${story.slug}/`,
      source_date:feedDate(story),recent:index<50,profile_visible:Boolean(a),
      magnitudes:Object.fromEntries(['human','planet','democracy'].map(k=>[k,dims[k]?.magnitude ?? null])),
      all_open:Boolean(a) && ['human','planet','democracy'].every(k=>dims[k]?.magnitude===null),
      research_issues:impactResearchHealth(story.impact_assessment)};
  });
  const count=items=>({stories:items.length,profile_visible:items.filter(s=>s.profile_visible).length,
    missing_profile:items.filter(s=>!s.profile_visible).length,all_open:items.filter(s=>s.all_open).length,
    incomplete_research:items.filter(s=>s.research_issues.length).length});
  return {version:'2026-09-14-potential-research',active_stories:active.length,visible:count(rows),
    latest50:count(rows.filter(s=>s.recent)),
    // Review candidates, not automatic direction/score corrections.
    review_candidates:rows.filter(s=>!s.profile_visible || s.all_open || s.research_issues.length),rows};
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
  const report=auditImpactProfiles(JSON.parse(fs.readFileSync(path.join(root,'data/news/stories.json'))).stories);
  const output=process.argv.find(v=>v.startsWith('--output='))?.slice(9);
  if(output)fs.writeFileSync(path.resolve(output),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({active_stories:report.active_stories,visible:report.visible,latest50:report.latest50}));
}
