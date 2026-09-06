import fs from 'node:fs';
import path from 'node:path';
import {escapeHtml as e} from './explainer-components.mjs';
export function applyStateBenchmarkUpdate(root='.'){
 const data=JSON.parse(fs.readFileSync('content/site/state-benchmark-update-2026-09-06.json','utf8'));
 const edition=JSON.parse(fs.readFileSync('assets/data/state-benchmark-edition-2026-09-06.json','utf8')).files[0];
 const marker='state-benchmark-update-20260906';
 const full=`<section class="section" id="staatliche-wirkungskontrolle-2026"><p class="hero-kicker">Fachliche Ergänzung · 6. September 2026</p><h2>${e(data.title)}</h2>${data.sections.map(s=>`<h3>${e(s.title)}</h3>${s.paragraphs.map(p=>`<p>${e(p)}</p>`).join('')}${s.sources.length?`<p class="meta-line">Belege: ${s.sources.map(n=>`<a href="${e(data.sources[n].url)}">${n+1}. ${e(data.sources[n].title)}</a>`).join(' · ')}</p>`:''}`).join('')}<p><a class="btn btn-secondary" href="${e(edition.url)}">Fachhinweis als PDF lesen (${edition.pages} Seiten)</a></p></section>`;
 const notice=`<aside class="publication-current-note"><p><strong>Fachliche Ergänzung vom 6. September 2026.</strong> Die Bundes-AAWU 2026 unterscheidet bereits Zielerreichung und ursächliche Wirkung. Der zusätzliche WÖk-Befund ist am konkreten Gegenstand nachzuweisen. <a href="/referenz/aktualisierung/#staatliche-wirkungskontrolle-2026">Einordnung und Beispiel lesen</a> · <a href="${e(edition.url)}">PDF-Fachhinweis</a></p></aside>`;
 const files=['referenz/aktualisierung/index.html','methodik/index.html','buch.html','referenz/index.html','werkzeuge/impact-controlling/index.html','bibliothek/eintraege/woemm-2-0/lesen/index.html','bibliothek/eintraege/woems-2-0/lesen/index.html'];
 for(const dir of fs.readdirSync(path.join(root,'referenz'))){if(/^kapitel-(017|037|038|039|061|062|065|090)-/.test(dir))files.push(`referenz/${dir}/index.html`);}
 for(const file of files){const p=path.join(root,file);if(!fs.existsSync(p))continue;let html=fs.readFileSync(p,'utf8');html=html.replace(new RegExp(`<!-- ${marker}:start -->[\\s\\S]*?<!-- ${marker}:end -->`,'g'),'');const block=`<!-- ${marker}:start -->${file==='referenz/aktualisierung/index.html'?full:notice}<!-- ${marker}:end -->`;html=html.replace('</main>',block+'</main>');fs.writeFileSync(p,html);}
 return files.length;
}
