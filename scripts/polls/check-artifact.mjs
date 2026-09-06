import fs from 'node:fs';
import path from 'node:path';
import { loadExperience } from './visual.mjs';
const root=process.cwd(),artifact=path.join(root,'_site');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'content/polls/public-catalog.json'),'utf8'));
for(const file of ['assets/js/polls.js','assets/js/polls-admin.js','assets/css/polls.css','assets/img/brand/app-icon-512.png'])if(!fs.existsSync(path.join(artifact,file)))throw new Error(`Missing poll runtime asset: ${file}`);
const pages=['umfragen/index.html','admin/umfragen/index.html',...catalog.polls.map(p=>`umfragen/${p.slug}/index.html`)];
for(const page of pages){
  const html=fs.readFileSync(path.join(artifact,page),'utf8');
  if(!html.includes('type="module" src="/assets/js/polls'))throw new Error(`Poll module missing: ${page}`);
  if(html.includes('/assets/js/polls.mjs')||html.includes('/assets/js/polls-admin.mjs'))throw new Error('Private source suffix must not be used for public scripts.');
  for(const name of ['POLLS_TOKEN_PEPPER','POLLS_ABUSE_PEPPER','anonymous_vote_identifier','Bearer local-test-only'])if(html.includes(name))throw new Error(`Private poll value in ${page}`);
  const slug=page.match(/^umfragen\/([^/]+)\/index\.html$/)?.[1];
  const experience=slug&&loadExperience(root,slug);
  if(experience){
    if(!html.includes('name="woek-private-interaction"')||!html.includes('content="no-referrer"'))throw new Error(`Sensitive poll privacy markers missing: ${page}`);
    if(/<script\b[^>]*src="[^" ]*assets\/js\/(?:main|newsletter)\.js/.test(html)||html.includes('class="footer-newsletter-form"'))throw new Error(`Cross-page integration reintroduced on sensitive poll: ${page}`);
    for(const asset of ['assets/js/poll-visual.js','assets/css/poll-visual.css',experience.baseline,...experience.scenarios.map(s=>s.image)])if(!fs.existsSync(path.join(artifact,asset)))throw new Error(`Missing visual poll asset: ${asset}`);
    const data=html.match(/<script type="application\/json" id="vp-data">([\s\S]*?)<\/script>/)?.[1];
    if(!data||JSON.stringify(JSON.parse(data))!==JSON.stringify(experience))throw new Error(`Visual scenario data changed during publication: ${page}`);
  }
}
for(const privatePath of ['ops/polls','content/polls','scripts/polls','tests/polls'])if(fs.existsSync(path.join(artifact,privatePath)))throw new Error(`Private source directory published: ${privatePath}`);
for(const page of ['index.html','umfragen/index.html','admin/umfragen/index.html']){
  const html=fs.readFileSync(path.join(artifact,page),'utf8');
  const footer=html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0]||'';
  if(!/<a\b[^>]*href="(?:\.\.\/|\.\/|\/)*umfragen\/"[^>]*>Umfragen<\/a>/.test(footer))throw new Error(`Survey footer entry missing: ${page}`);
}
console.log(`Survey artifact passed: ${pages.length} pages, runtime assets, no private storage/source exposure.`);
