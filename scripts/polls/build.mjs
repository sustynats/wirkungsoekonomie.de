import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pollPage,indexPage,adminPage,retiredPage,SITE } from './pages.mjs';

export function renderPollFiles(root,catalog){
  const files=new Map();
  const write=(relative,html)=>files.set(relative,html);
  write('umfragen/index.html',indexPage(root,catalog.polls));
  write('admin/umfragen/index.html',adminPage(root));
  for(const poll of catalog.polls)write(`umfragen/${poll.slug}/index.html`,pollPage(root,poll));
  for(const slug of catalog.retired_slugs||[])write(`umfragen/${slug}/index.html`,retiredPage(root,slug));
  const sitemap=path.join(root,'sitemap.xml');
  if(fs.existsSync(sitemap)){
    let xml=fs.readFileSync(sitemap,'utf8');
    xml=xml.replace(/\s*<url>\s*<loc>https:\/\/wirkungsoekonomie\.de\/(?:umfragen\/|admin\/umfragen\/)[\s\S]*?<\/url>/g,'');
    const routes=['/umfragen/',...catalog.polls.filter(p=>p.status!=='archived').map(p=>`/umfragen/${p.slug}/`)];
    const nodes=routes.map(route=>`  <url><loc>${SITE}${route}</loc></url>`).join('\n');
    xml=xml.replace('</urlset>',`${nodes}\n</urlset>`);
    write('sitemap.xml',xml);
  }
  return files;
}
// Render/validate everything before touching the last known public snapshot.
// A failed sync must not leave half of a publication for the ticker job to commit.
export function writePollFiles(root,files){
  const previous=new Map(),changed=[];
  try {
    for(const [relative,content] of files){
      const target=path.join(root,relative),old=fs.existsSync(target)?fs.readFileSync(target):null;
      if(old?.toString('utf8')===content)continue;
      previous.set(relative,old);fs.mkdirSync(path.dirname(target),{recursive:true});
      changed.push(relative);fs.writeFileSync(target,content);
    }
  } catch(error){
    for(const relative of changed.reverse()){
      const target=path.join(root,relative),old=previous.get(relative);
      if(old===null){if(fs.existsSync(target))fs.unlinkSync(target);}else fs.writeFileSync(target,old);
    }
    throw error;
  }
}
export function buildPollPages(root,catalog){
  writePollFiles(root,renderPollFiles(root,catalog));
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const root=process.cwd(),source=path.join(root,'content/polls/public-catalog.json');
  if(!fs.existsSync(source))throw new Error('No public poll catalog: synchronize from the Oracle API first.');
  const catalog=JSON.parse(fs.readFileSync(source,'utf8'));
  buildPollPages(root,catalog);console.log(`Built survey index, editor and ${catalog.polls.length} public survey pages.`);
}
