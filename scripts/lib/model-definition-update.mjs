import fs from 'node:fs';
import path from 'node:path';
import {escapeHtml as e} from './explainer-components.mjs';
// A dated clarification of the model's scope. Historical text remains identifiable.
export function applyModelDefinitionUpdate(root='.') {
 const data=JSON.parse(fs.readFileSync('content/site/home-explainer.json','utf8'));
 const edition=JSON.parse(fs.readFileSync('assets/data/model-explainer-edition-2026-09-06-v1-2.json','utf8')).files[0];
 const marker='model-definition-20260906';
 const files=['wirkungsoekonomie.html','modell.html','verstehen.html','verstehen/index.html','so-wirkt-wirkungsoekonomie/index.html','methodik/index.html','referenz/index.html','referenz/aktualisierung/index.html','buch.html','begriffe/wirkungsoekonomie/index.html'];
 for(const file of files){
  const p=path.join(root,file);if(!fs.existsSync(p))continue;
  let html=fs.readFileSync(p,'utf8'); if(!/<main\b/.test(html))continue;
  html=html.replace(new RegExp(`<!-- ${marker}:start -->[\\s\\S]*?<!-- ${marker}:end -->`,'g'),'');
  const full=file==='referenz/aktualisierung/index.html';
  const content=full?`<section class="section" id="wirtschafts-und-gesellschaftsmodell"><p class="hero-kicker">Begriffliche Präzisierung · 6. September 2026</p><h2>Ein umfassendes Wirtschafts- und Gesellschaftsmodell</h2><p>${e(data.intro)}</p><p>${e(data.scope)}</p><p>Die aktuelle Einführungsfassung v1.2 macht diesen Gegenstandsbereich mit einem einfachen Schulweg-Beispiel ausdrücklich sichtbar. Frühere Bücher und Paper bleiben historisch unverändert; diese Präzisierung gehört zu ihrer aktuellen Einordnung.</p><p><a href="${e(edition.url)}">Aktuelle Einführung als PDF lesen (${edition.pages} Seiten)</a></p></section>`:`<aside class="publication-current-note"><p><strong>Wirtschaft und Gesellschaft zusammen denken.</strong> Die Wirkungsökonomie ist ein umfassendes Wirtschafts- und Gesellschaftsmodell. Sie verbindet wirtschaftliche Entscheidungen mit staatlichem Handeln, Institutionen und gesellschaftlichem Zusammenleben. <a href="/referenz/aktualisierung/#wirtschafts-und-gesellschaftsmodell">Definition und aktuelle PDF-Einführung</a></p></aside>`;
  const block=`<!-- ${marker}:start -->${content}<!-- ${marker}:end -->`;
  html=full?html.replace('</main>',block+'</main>'):html.replace(/(<main\b[^>]*>[\s\S]*?<\/section>)/,'$1'+block);
  if(file==='begriffe/wirkungsoekonomie/index.html') html=html.replace('Die Wirkungsökonomie ist ein Ordnungsmodell, das Wirtschaft, Staat, Kapital, Medien und gesellschaftliche Entscheidungen','Die Wirkungsökonomie ist ein umfassendes Wirtschafts- und Gesellschaftsmodell, das Wirtschaft, Staat, Kapital, Medien und gesellschaftliche Entscheidungen');
  fs.writeFileSync(p,html);
 }
 return files.length;
}
