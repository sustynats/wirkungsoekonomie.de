import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { ROOT, CONTENT, loadModel, publicData, read, atomic, sha } from './model.mjs';
import {digest} from './v9-store.mjs';
import {renderSiteFooter,renderFooterNewsletter} from '../lib/site-shell.mjs';
import {loadReferenceLinks,applyReferenceLinks} from './reference-links.mjs';
import { createLexicon } from '../../assets/js/wirkungslexikon.mjs';

export function build({mode='preview', out=path.join(ROOT,'outputs/wirkungslexikon',mode), model=null, assets=true, textOverrides={}, configExtras={}, extraPages=[], extraSubnav='', negativePublicationTest=false}={}) {
  if (!['preview','public'].includes(mode)) throw Error('Unbekannter Build-Modus');
  if(!model&&mode==='public'){const p=read(path.join(CONTENT,'publication-policy.json')).lexikon;if(p.version==='V9'&&p.released){const frozen=read(path.join(CONTENT,'publication-v9.json'));if(digest(frozen)!==p.payloadSha256)throw Error('V9_PAYLOAD_APPROVAL_MISMATCH');return build({...frozen,mode,out,assets});}}
  if(!model) {
    if(fs.existsSync(path.join(CONTENT,'wirkungslexikon_master_v3.json')))model=loadModel();
    else if(mode==='public'&&fs.existsSync(path.join(CONTENT,'published.json'))){const published=read(path.join(CONTENT,'published.json'));model={data:published,editorial:{history:published.publicationHistory||{},revision:published.publicationRevision||0},checksum:published.masterSha256};}
    else throw Error('Privater V3-Bestand fehlt; zuerst importieren.');
  }
  out = path.resolve(out);
  // Never allow a preview to land in a public root or the deployment artifact.
  if (mode === 'preview' && !out.startsWith(path.join(ROOT,'outputs/wirkungslexikon/') )) throw Error('Vorschau darf nur in outputs/wirkungslexikon liegen');
  const policy = read(path.join(CONTENT,'publication-policy.json'));
  if(mode==='public' && !(negativePublicationTest && model.data.entries.length===0 && out.startsWith(path.join(ROOT,'outputs/wirkungslexikon/'))) && (!policy.lexikon.released || policy.lexikon.person!=='Natalie Weber'))throw Error('Öffentliche Lexikonfreigabe fehlt');
  const data = mode==='public' ? publicData(model.data) : model.data;
  const py=spawnSync('python3',[path.join(ROOT,'scripts/wirkungslexikon/texts.py'),...(mode==='public'?['--public']:[])],{encoding:'utf8'});
  if(py.status!==0) throw Error(py.stderr);
  const texts={...JSON.parse(py.stdout),...textOverrides};
  const ui={...read(path.join(CONTENT,'texte/ui_texte.json')).lexikon,
    empty_results:'Zu dieser Suche gibt es derzeit keinen passenden Eintrag. Versuchen Sie einen anderen Begriff oder setzen Sie die Filter zurück.',
    disclaimer_pilot:undefined};
  const history = Object.fromEntries(Object.entries(model.editorial.history).filter(([slug])=>data.entries.some(e=>e.slug===slug)));
  const inventory=read(path.join(CONTENT,'bestandszahlen.json'));
  if(!inventory||inventory.originalCards!==180||inventory.uniqueCandidates!==inventory.newCandidates+inventory.priorCandidates-inventory.overlap||inventory.totalDistinct!==inventory.originalCards+inventory.uniqueCandidates||inventory.watchlistExcluded<0)throw Error('LEXIKON_BESTANDSZAHLEN_UNSTIMMIG');
  const config={mode,ui,texts,histories:Object.keys(history).length?history:(data.publicationHistory||{}),...configExtras,inventoryCounts:{totalDistinct:inventory.totalDistinct,uniqueCandidates:inventory.uniqueCandidates,asOf:inventory.asOf}};
  const full=createLexicon(model.data,{mode:'preview'});
  const strings=new Set();
  const walk=v=>{ if(typeof v==='string'&&full.isBoiler(v)) strings.add(v); else if(Array.isArray(v)) v.forEach(walk); else if(v&&typeof v==='object') Object.values(v).forEach(walk); };
  data.entries.forEach(walk);config.boilerTexts=[...strings];
  const referenceBlocks=loadReferenceLinks();config.referenceLinks=referenceBlocks.length>0;
  const wl=createLexicon(data,config);
  const esc=wl.esc;
  const site='https://wirkungsoekonomie.de';
  const target=path.join(out,'wirkungslexikon');
  fs.mkdirSync(target,{recursive:true});
  if(fs.existsSync(path.join(target,'.rendering.lock')))throw Error('Bildrendering läuft. Vorschauaufbau danach seriell ausführen.');
  // Delete only files previously owned by this generator (including revoked cards).
  const oldManifest=path.join(target,'.generated.json');
  const ownedFiles=new Set(fs.existsSync(oldManifest)?read(oldManifest).files:[]);
  const oldRuntime=path.join(target,'runtime.json'),oldShare=path.join(target,'share-card.html');
  const previousShare=fs.existsSync(oldShare)?fs.readFileSync(oldShare,'utf8'):null;
  const unchangedImages=new Map();
  if(fs.existsSync(oldManifest)&&fs.existsSync(oldRuntime)){
    const previous=read(oldRuntime);const same=new Set(data.entries.filter(e=>JSON.stringify(e)===JSON.stringify(previous.data.entries.find(o=>o.slug===e.slug))).map(e=>e.slug));
    if(previous.config.mode===mode)for(const rel of read(oldManifest).files)if(/^[a-z0-9-]+\/(og|portrait|square)\.png$/.test(rel)&&same.has(rel.split('/')[0])&&fs.existsSync(path.join(target,rel)))unchangedImages.set(rel,fs.readFileSync(path.join(target,rel)));
  }
  if(fs.existsSync(oldManifest)) for(const f of read(oldManifest).files) {
    if(f!=='.generated.json' && !f.includes('..') && !path.isAbsolute(f)) fs.rmSync(path.join(target,f),{force:true});
  }
  const written=[];
  function write(rel,body) { const file=path.join(target,rel); if(fs.existsSync(file) && !ownedFiles.has(rel)) throw Error(`Nicht übernommene Datei würde überschrieben: ${file}`); atomic(file,body);written.push(rel); }
  let nav=read(path.join(ROOT,'assets/data/navigation.json'));
  nav=structuredClone(nav);
  const group=nav.footerGroups.find(g=>g.title==='Debatte & Radar');
  if(group && !group.items.some(i=>i.href==='wirkungslexikon/')) group.items.push({label:'Wirkungslexikon',href:'wirkungslexikon/',match:['wirkungslexikon/']});
  const link=i=>`<a href="/${esc(i.href)}">${esc(i.label)}</a>`;
  let header=fs.readFileSync(path.join(ROOT,'templates/header.html'),'utf8').replaceAll('{{BASE}}','/');
  const footer=renderSiteFooter('/',nav).replace('<div class="footer-inner">','<div class="footer-inner">'+renderFooterNewsletter('/')).replace(/<a\b[^>]*href="\/en\/"[^>]*>English<\/a>/g,'');
  const subnav=`<nav class="wl-subnav" aria-label="Wirkungslexikon"><div class="wl-container wl-subnav__inner"><a class="wl-subnav__title" href="/wirkungslexikon/">Wirkungslexikon</a><div class="wl-subnav__links">
  <a href="/wirkungslexikon/">Übersicht</a><a href="/wirkungslexikon/#karten">Alle Karten</a><a href="/wirkungslexikon/narrativ-melden/">Narrativ melden</a><a href="/wirkungslexikon/kategorien/">Kategorien</a><a href="/wirkungslexikon/fuer-buerger/">Für Bürgerinnen und Bürger</a><a href="/wirkungslexikon/fuer-redaktionen/">Für Redaktionen</a><a href="/wirkungslexikon/fuer-wissenschaft/">Wissenschaft</a><a href="/wirkungslexikon/methodik/">Methodik</a>${extraSubnav}${mode==='preview'?'<a href="/wirkungslexikon/redaktion/">Redaktion</a>':''}</div></div></nav>`;
  const banner=mode==='preview'?`<div class="wl-preview-banner" role="region" aria-label="Redaktionsstatus"><strong>Geschützte Redaktionsvorschau</strong><span>${data.entries.length} Karten im Redaktionsbestand · ${data.entries.filter(e=>e.pruefstatus==='freigegeben').length} freigegeben · Stand ${esc(data.stand)}</span><span>Dauerhaftes Nachschlage- und Analysewerk · diese Vorschau ist nicht öffentlich</span></div>`:'';
  const template=fs.readFileSync(path.join(ROOT,'templates/wirkungslexikon.html'),'utf8');
  const styleVersion=sha(fs.readFileSync(path.join(ROOT,'assets/css/wirkungslexikon.css'))).slice(0,12);
  const scriptVersion=sha(['assets/js/wirkungslexikon.mjs','assets/js/wirkungslexikon-init.mjs'].map(rel=>fs.readFileSync(path.join(ROOT,rel),'utf8')).join('\n')).slice(0,12);
  const pages=[];
  function page(rel,title,html,entry=null) {
    const url=`${site}/wirkungslexikon/${rel}`;
    const description=entry ? `Wirkungspotenzial: ${entry.wirkungspotenzial.moegliche_veraenderung}` : 'Dauerhaftes wissenschaftlich fundiertes Nachschlage- und Analysewerk zu politischer Sprache, ihren Bedeutungsverschiebungen und Wirkungspotenzialen.';
    let meta='';
    if(mode==='public') {
      meta=`<link rel="canonical" href="${esc(url)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(url)}"><meta property="og:type" content="${entry?'article':'website'}">`;
      if(entry) meta+=`<meta property="og:image" content="${esc(url)}og.png"><meta property="og:image:alt" content="${esc('Wirkungspotenzial: '+entry.wirkungspotenzial.moegliche_veraenderung)}"><meta name="twitter:card" content="summary_large_image">`;
      const json=entry?{'@context':'https://schema.org','@type':'DefinedTerm',name:entry.begriff,description,identifier:entry.id,url,inDefinedTermSet:site+'/wirkungslexikon/',dateModified:entry.geprueft_am,citation:entry.quellen.map(q=>q.url)}:{'@context':'https://schema.org','@type':'DefinedTermSet',name:'Wirkungslexikon politischer Sprache',url};
      meta+=`<script type="application/ld+json">${JSON.stringify(json).replaceAll('<','\\u003c')}</script>`;
      meta+=`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Wirkungslexikon',item:site+'/wirkungslexikon/'},{'@type':'ListItem',position:2,name:title,item:url}]}).replaceAll('<','\\u003c')}</script>`;
    }
    const replacements={TITLE:esc(title),DESCRIPTION:esc(description),ROBOTS:mode==='preview'?'noindex, nofollow, noarchive':'index, follow',META:meta,HEADER:header,FOOTER:footer,SUBNAV:subnav,BANNER:banner,CONTENT:wl.rewriteRoutes(html),STYLE_VERSION:styleVersion,SCRIPT_VERSION:scriptVersion};
    const result=template.replace(/\{\{(\w+)\}\}/g,(_,key)=>replacements[key]??'');
    write(rel+'index.html',applyReferenceLinks(result,'wirkungslexikon/'+rel+'index.html',referenceBlocks).html);
    pages.push({path:'/wirkungslexikon/'+rel,title,description});
    if(entry) write(rel+'daten.json',entry);
  }
  // Complete static list is the no-JS fallback. Browser enhancement paginates later.
  page('','Wirkungslexikon politischer Sprache',wl.viewStart(new URLSearchParams({ansicht:'liste',anzahl:String(data.entries.length||24)})));
  page('narrativ-melden/','Narrativ melden',wl.viewNarrativeReport());
  page('kategorien/','Kategorien',wl.viewCategories());
  for(const c of wl.CATS) { const v=wl.viewCategory(c.slug);page(`kategorien/${c.slug}/`,v.title,v.html); }
  for(const a of wl.AREAS.filter(a=>mode==='preview'||!a.internal)) { const v=wl.viewArea(a.key,new URLSearchParams());page((a.key==='ifr'?'institut-fuer-remigration':a.key)+'/',v.title,v.html); }
  page('methodik/','Wie das Wirkungslexikon arbeitet',wl.viewMethodik());
  page('fuer-redaktionen/','Für Redaktionen',wl.viewRedaktionen());
  page('fuer-buerger/','Politische Sprache verstehen',`<div class="wl-container wl-prose wl-section-space"><span class="wl-eyebrow">Für Bürgerinnen und Bürger</span><h1>Politische Sprache verstehen</h1><p>Ein Wort kann dieselbe Sache in einem anderen Licht erscheinen lassen. Das Lexikon erklärt, wie sprachliche Bilder, Etiketten und Erzählungen unsere Wahrnehmung und Urteilsbildung beeinflussen können.</p><h2>So lesen Sie eine Karte</h2><ol><li>Prüfen Sie zuerst, wer den Ausdruck in welchem Zusammenhang verwendet hat.</li><li>Lesen Sie das Wirkungspotenzial: Welche Veränderung wäre unter welchen Bedingungen möglich?</li><li>Vergleichen Sie Ausgangsbedeutung und politischen Gebrauch, sofern beide belegt sind.</li><li>Prüfen Sie getrennt, was tatsächlich beobachtet wurde und welche anderen Ursachen in Betracht kommen.</li></ol><p>Eine mögliche psychologische Erklärung beweist noch keine Veränderung. Wiederholung, Likes und Reichweite zeigen Sichtbarkeit; sie messen keine gesellschaftlichen Einstellungen.</p><h2>Ein anschauliches Beispiel</h2><p>Wird eine sprachliche Praxis als „Zwang“ bezeichnet, kann das bei manchen Menschen Abwehr auslösen. Andere können widersprechen oder gleichgültig bleiben. Entscheidend sind Vorwissen, Kontext, tatsächliche Regeln und Gegenrede. Ob Einstellungen verändert wurden, muss gesondert untersucht werden.</p><p>Das Lexikon bewertet Begriffsverwendungen, keine Menschen. Es ist keine Wortverbotsliste.</p><p><a class="wl-btn" href="/wirkungslexikon/#karten">Begriffe entdecken</a> <a href="/wirkungslexikon/methodik/">Methodik verständlich erklärt</a></p></div>`);
  page('fuer-wissenschaft/','Für politische Analyse und Wissenschaft',texts.wissenschaft_v9 || `<div class="wl-container wl-prose wl-section-space"><span class="wl-eyebrow">Für politische Analyse und Wissenschaft</span><h1>Befunde nachvollziehen</h1><p>Alle Zugänge nutzen dieselben Fakten und wissenschaftlichen Standards. Diese Ansicht führt zu Quellenhierarchie, Wirkungshypothesen, Attribution und strukturierten Daten.</p><ul><li><a href="/wirkungslexikon/methodik/">Vollständige Methodik und Evidenzleiter A–F</a></li><li><a href="/wirkungslexikon/kategorien/">Begründete Kategorien und ihre Definitionen</a></li><li><a href="/wirkungslexikon/daten.json" download>Aktuell sichtbaren Datenbestand als JSON herunterladen</a></li></ul><h2>Zurechnung und Revisionsfähigkeit</h2><p>Jede Karte trennt Quellenbefund, Interpretation, Wirkungspotenzial und beobachtete Veränderungen. Allgemeine Mechanismen sind keine spezifischen Wirkungsnachweise. Attribution und Alternativerklärungen werden gesondert ausgewiesen.</p><p>Die Kartendetails enthalten Originalquellen und Fundstellen, Evidenzgrenzen, Version, Prüfdatum und einen Änderungsverlauf. Zitierformate und Einzelkarten-JSON stehen dort bereit. Unfreigegebene Daten sind keine zitierfähige öffentliche Publikation.</p><p><a class="wl-btn" href="/wirkungslexikon/#karten">Bestand untersuchen</a></p></div>`);
  for(const p of extraPages)page(p.rel,p.title,p.html);
  for(const e of data.entries) { const v=wl.viewCard(e.slug);page(e.slug+'/',v.title,v.html,e); }
  if(mode==='preview') page('redaktion/','Lexikonredaktion',configExtras.editorialHtml||`<div class="wl-container wl-section-space wl-editor"><span class="wl-eyebrow">Geschützte Redaktion</span><h1>Karten pflegen und prüfen</h1><p>Neue Belege, Kategorien, Bedeutungsverschiebungen, Potenziale und Wirkungsbefunde werden getrennt gepflegt. Jede Speicherung erzeugt eine neue Version mit Bearbeitung und Begründung. Veröffentlichung erfolgt über ein gesondertes Freigabeverfahren.</p><form id="wl-editor" class="wl-stack"><div class="wl-field"><label for="edit-slug">Wirkungskarte</label><select id="edit-slug" name="slug">${data.entries.map(e=>`<option value="${esc(e.slug)}">${esc(e.begriff)} · ${esc(wl.STATUS[e.pruefstatus]||e.pruefstatus)}</option>`).join('')}</select></div><div class="wl-field"><label for="edit-json">Vollständige Karte als JSON</label><textarea id="edit-json" name="entry" spellcheck="false" required></textarea></div><div class="wl-field"><label for="edit-reason">Begründung der Änderung</label><input id="edit-reason" name="reason" required minlength="10" maxlength="2000"></div><button class="wl-btn" type="submit">Neue Version speichern</button><p id="edit-result" role="status" aria-live="polite"></p></form><h2>Veröffentlichungsregeln</h2><p>Freigabe braucht Originalnachweis, abgeschlossene Quellen-, Kontext-, Kategorie-, Attributions- und juristische Prüfung sowie ausdrückliche Freigabe durch Natalie Weber. Das normale Redaktionskonto kann keine öffentliche Freigabe erteilen.</p><h2>Eingegangene Hinweise</h2><button class="wl-btn wl-btn--secondary" id="load-reports" type="button">Hinweise laden</button><pre class="wl-codebox" id="editor-reports"></pre><h2>Neue Karte anlegen</h2><p>Die CLI <code>editorial.mjs add</code> importiert eine vollständige neue Karte in den privaten Bestand. Bestehende IDs und stabile Permalinks bleiben unverändert. Der Quellenbestand des V3-Imports wird dabei erhalten.</p></div>`);
  write('daten.json',data);
  write('runtime.json',{data,config});
  write('search-index.json',data.entries.map(e=>({slug:e.slug,begriff:e.begriff,korpus:e.korpus,akteur:e.akteur,kategorien:e.kategorien,mechanismus:e.psychologischer_effekt.name,wirkungspotenzial:e.wirkungspotenzial.moegliche_veraenderung})));
  write('search-meta.json',pages);
  if(mode==='public') write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p=>`<url><loc>${site}${p.path}</loc></url>`).join('')}</urlset>`);
  let share=fs.readFileSync(path.join(ROOT,'templates/wirkungslexikon-share.html'),'utf8')
    .replace('src="data/lexikon-daten.js"','').replace('<script>\n(function(){', '<script type="module">\nconst prefix=location.pathname.startsWith("/public/")?"/public":"";const {data:WL_DATA,config}=await (await fetch(prefix+"/wirkungslexikon/runtime.json")).json();\n(function(){')
    .replace("||WL_DATA.entries.find(x=>x.slug==='neue-merz-problem-im-stadtbild')",'')
    .replace('  const esc=s=>',"  if(!e){document.getElementById('root').textContent='Karte nicht verfügbar';return;}\n  const esc=s=>")
    .replaceAll('fonts/','/assets/fonts/').replaceAll('img/signet.svg','/assets/img/brand/signet.svg')
    .replace('const body=(bv.urspruengliche_bedeutung&&bv.politisch_verwendete_bedeutung)',"const body=(bv.urspruengliche_bedeutung&&bv.politisch_verwendete_bedeutung&&bv.wirkung_vorher&&bv.wirkung_nachher&&e.quellen.length&&/^(nachgewiesene|sekundärbelegte|Originalbegriff)/.test(bv.status))")
    .replace("${esc(e.bedeutung_und_kontext)}", configExtras.v9?"${esc(e.bedeutung_und_kontext)}":"${esc(e.wirkungspotenzial.moegliche_veraenderung)}")
    .replace('(sekundär)',configExtras.v9?(mode==='preview'?'(V3-Prüfstatus; Review offen)':'(Quellenart siehe Karte)'):'(sekundär)')
    .replace('<p class="url">wirkungsoekonomie.de', '<p style="font-size:var(--fs-foot);line-height:1.35;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(e.wirkungspotenzial.moegliche_veraenderung)}</p><p class="url">wirkungsoekonomie.de')
    .replace('<i class="${lvl?\'b\':\'o\'}"></i>', '<i style="border:2.5px solid #34507A;background:linear-gradient(90deg,#34507A 50%,transparent 50%)"></i>')
    .replace("${lvl?`Beobachtet: ${esc(bw.typ)} (Stufe ${lvl}) – keine Einstellungsänderung gemessen`:'Keine spezifische Wirkung nachgewiesen'}",'Wirkungspotenzial · mögliche Veränderungen unter Bedingungen')
    .replace("const draft=e.pruefstatus!=='freigegeben'", "const draft=config.mode==='preview'||e.pruefstatus!=='freigegeben'")
    .replace('if(lvl) on[lvl]=true;',"if(lvl && (config.mode==='preview'||e.evidenzstufe_bestaetigt===lvl)) on[lvl]=true;");
  write('share-card.html',share);
  if(previousShare===share)for(const [rel,bytes]of unchangedImages){fs.writeFileSync(path.join(target,rel),bytes);written.push(rel);}
  write('.generated.json',{mode,masterSha256:model.checksum,revision:model.editorial.revision,entries:data.entries.length,files:[...written,'.generated.json']});
  if(assets) {
    for(const rel of ['assets/css/style.css','assets/css/wirkungslexikon.css','assets/js/wirkungslexikon.mjs','assets/js/wirkungslexikon-init.mjs','assets/js/site-navigation.js','assets/fonts','assets/img/brand','assets/img/wirkungslexikon']) {
      const dest=path.join(out,rel); fs.mkdirSync(path.dirname(dest),{recursive:true});fs.cpSync(path.join(ROOT,rel),dest,{recursive:true});
    }
    const newsletter=path.join(ROOT,'assets/js/newsletter.js');
    if(fs.existsSync(newsletter))fs.copyFileSync(newsletter,path.join(out,'assets/js/newsletter.js'));
  }
  atomic(path.join(out,'robots.txt'),mode==='preview'?'User-agent: *\nDisallow: /\n':'User-agent: *\nAllow: /\n');
  return {out,mode,cards:data.entries.length,pages:pages.length,masterSha256:model.checksum,revision:model.editorial.revision};
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
 const args=process.argv.slice(2);const mode=args.includes('--public')?'public':'preview'; const oi=args.indexOf('--out');
 console.log(JSON.stringify(build({mode,...(oi>=0?{out:args[oi+1]}:{})}),null,2));
}
