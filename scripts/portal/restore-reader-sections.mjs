import fs from 'node:fs';
import {stripEditorialHtmlNotes} from '../lib/public-editorial-cleanup.mjs';
const data=JSON.parse(fs.readFileSync('content/site/reader-section-restorations.json','utf8'));
let restored=0;
for(const page of data.pages){
 let html=fs.readFileSync(page.path,'utf8');
 for(const section of page.sections){
  if(html.includes(`id="${section.id}"`))continue;
  let recovered=stripEditorialHtmlNotes(section.html);
  // A surviving paragraph from the damaged section must occur once only.
  for(const p of recovered.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/g))if(html.includes(p[0]))html=html.replace(p[0],'');
  const before=section.before ? new RegExp(`<h[2-4]\\b[^>]*id="${section.before}"[^>]*>`) : /<\/article>\s*<\/section>/;
  if(!before.test(html))throw new Error(`Missing insertion point: ${page.path} ${section.id}`);
  html=html.replace(before,match=>recovered+'\n'+match);restored++;
 }
 fs.writeFileSync(page.path,html);
}
console.log(`Recovered ${restored} original sections.`);
// Repair sentences damaged by an earlier blanket removal of internal rank labels.
const replacements=[
 ['Die Bewertungslogik für arbeitet','Die Bewertungslogik für Übergänge und Implementierung arbeitet'],
 ['. muss beide Risiken','. Die Transformationsarchitektur muss beide Risiken'],
 ['. wendet diese Begriffslogik','. Die Transformationsarchitektur wendet diese Begriffslogik'],
 ['>Warum notwendig ist<','>Warum eine Transformationsarchitektur notwendig ist<'],
 ['Er schließt an an:','Er schließt an die digitale Wirkungsarchitektur an:'],
 ['Dieses Konzeptpapier beschreibt der Wirkungsökonomie:','Dieses Konzeptpapier beschreibt ein Wirkungsfeld der Wirkungsökonomie:'],
];
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):e.name==='index.html'?[`${dir}/${e.name}`]:[]);}
for(const file of walk('portale')){const before=fs.readFileSync(file,'utf8');let after=before;for(const [a,b] of replacements)after=after.replaceAll(a,b);if(after!==before)fs.writeFileSync(file,after);}
const journal='blog/ki-souveraenitaet-statt-abhaengigkeit-fable-moment.html';
const original=fs.readFileSync(journal,'utf8');
fs.writeFileSync(journal,original.replace('<li>Risiken der Gegenbewegung</li></ol>','</ol><h2 id="11-risiken-der-gegenbewegung">11. Risiken der Gegenbewegung</h2>'));
