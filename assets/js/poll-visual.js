import { el, button } from './polls.js';

export function zoomTransform(area) {
  const scale=area?.zoom||1, limit=50*(scale-1);
  const clamp=n=>Math.max(-limit,Math.min(limit,n));
  return {scale,x:clamp(scale*(50-(area?.x??50))),y:clamp(scale*(50-(area?.y??50)))};
}

function startVisual() {
  const dataNode=document.getElementById('vp-data');if(!dataNode)return;
  const data=JSON.parse(dataNode.textContent),$=id=>document.getElementById(id);
  const stage=$('vp-stage'),scenarioSelect=$('vp-scenario'),areaSelect=$('vp-area'),compareSelect=$('vp-compare');
  let scenario=data.scenarios[0],area=null,view='before',revealed=false,hotspots=false,voted=false,requestNumber=0;
  const scenarioName=s=>`${s.label}${revealed?` · ${s.party}`:''}`;
  function renderEnergy() {
    const target=$('vp-energy-content');if(!target)return;
    if(view==='before'){
      target.replaceChildren(el('p','Im Ausgangsbild ist links im Umland ein Umspannwerk zu sehen. Es verteilt Strom aus dem Verbundnetz und erzeugt selbst keinen. Wähle „Szenario“, um Erzeugung, Reserven und Kernenergieoptionen der jeweiligen Programmrichtung zu vergleichen.'));
      return;
    }
    const comparison=view==='pair'?data.scenarios.find(s=>s.id===compareSelect.value):null;
    const selected=comparison?[comparison,scenario]:[scenario];
    const panels=selected.map(s=>{
      const panel=el('section'),title=el('h4',scenarioName(s));
      const grid=el('dl',undefined,'vp-energy-grid');
      for(const [key,label] of [['renewables','Erneuerbare Erzeugung'],['fossil','Kohle, Gas und regelbare Kraftwerke'],['nuclear','Kernenergie: Ziel oder Option?'],['balancing','Netze, Speicher und Wärme']]){
        const row=el('div');row.append(el('dt',label),el('dd',s.energy[key]));grid.append(row);
      }
      const proof=el('p',`Programm von 2025 · PDF-Seiten ${s.topics.energie.pages.join(', ')}. `,'poll-notice');
      if(revealed){const a=el('a','Energiepassagen in der Originalquelle');a.href=`${s.source}#page=${s.topics.energie.pages[0]}`;a.target='_blank';a.rel='noopener noreferrer';proof.append(a);}
      else proof.append(document.createTextNode('Parteien und Quellen kannst Du unten bewusst anzeigen.'));
      panel.append(title,grid,proof);return panel;
    });
    const zoom=button('Energieanlagen im Bild vergrößern',()=>{selectArea('energie');stage.scrollIntoView({behavior:'auto',block:'center'});});
    target.replaceChildren(...panels,zoom);
  }
  function refreshNames() {
    for(const select of [scenarioSelect,compareSelect])for(const option of select.options){const s=data.scenarios.find(s=>s.id===option.value);if(s)option.textContent=scenarioName(s);}
    $('vp-right-caption').textContent=`${scenarioName(scenario)} · illustrative Umsetzung`;
    const comparison=data.scenarios.find(s=>s.id===compareSelect.value);
    $('vp-left-caption').textContent=view==='pair'&&comparison?`${scenarioName(comparison)} · illustrative Umsetzung`:'Gemeinsamer Ausgangszustand';
    $('vp-written-title').textContent=`${scenarioName(scenario)}: Was würde sich ändern?`;
    $('vp-legend').textContent=`Links: Ausgangsbild · Rechts: ${scenarioName(scenario)}`;
    renderEnergy();
  }
  function updateZoom() {
    const z=zoomTransform(area);
    stage.querySelectorAll('.vp-transform').forEach(layer=>{layer.style.transform=`translate(${z.x}%, ${z.y}%) scale(${z.scale})`;});
    stage.querySelectorAll('[data-vp-area]').forEach(b=>{
      const d=data.domains.find(d=>d.id===b.dataset.vpArea);
      const x=50+z.scale*(d.x-50)+z.x,y=50+z.scale*(d.y-50)+z.y;
      b.style.left=`${x}%`;b.style.top=`${y}%`;b.hidden=x<3||x>97||y<3||y>97;
      b.setAttribute('aria-pressed',String(d.id===area?.id));
    });
    areaSelect.value=area?.id||'';
    $('vp-reset').disabled=!area;
    stage.setAttribute('aria-label',area?`Vergrößerter Vergleich: ${area.title}`:'Stadt und Umland in Gesamtansicht');
    if(stage.getAttribute('aria-busy')!=='true')$('vp-image-status').textContent=area?`${area.title} vergrößert. Gleicher Ausschnitt in beiden Bildern.`:'Illustrativer Vergleich. Anlagen- und Gebäudezahlen sind keine Prognose.';
  }
  function selectArea(id,{focus=false}={}) {
    area=data.domains.find(d=>d.id===id)||null;updateZoom();
    if(area){const topic=$(`vp-topic-${area.id}`);topic.open=true;if(focus){const summary=topic.querySelector('summary');summary.focus({preventScroll:true});topic.scrollIntoView({behavior:'auto',block:'nearest'});}}
  }
  function renderTopics() {
    const open=new Set([...$('vp-topics').querySelectorAll('details[open]')].map(d=>d.id));
    const topics=data.domains.map(d=>{
      const t=scenario.topics[d.id],details=el('details');details.id=`vp-topic-${d.id}`;details.open=open.has(details.id)||d.id===area?.id;
      const summary=el('summary',d.title),question=el('p',d.question,'vp-question');
      details.append(summary,question);
      for(const [label,text] of [['Programmrichtung',t.programme],['Was das Bild übersetzt',t.scene],['Möglicher Wirkpfad',d.mechanism],['Bedingungen, Risiken und Verteilung',d.check]]){
        const p=el('p');p.append(el('strong',`${label}: `),document.createTextNode(text));details.append(p);
      }
      const proof=el('p',`Beleg: Programm von 2025, PDF-Seite${t.pages.length>1?'n':''} ${t.pages.join(', ')}. `,'poll-notice');
      if(revealed){const source=el('a',`${scenario.party}: Originalquelle öffnen`);source.href=`${scenario.source}#page=${t.pages[0]}`;source.target='_blank';source.rel='noopener noreferrer';proof.append(source);}
      else proof.append(document.createTextNode('Den Quellenlink und die Parteizuordnung kannst Du unten bewusst anzeigen.'));
      details.append(proof,button('Diesen Bereich im Bild vergrößern',()=>{selectArea(d.id);if(view==='before')setView('after');stage.scrollIntoView({behavior:'auto',block:'center'});}));return details;
    });
    const finance=el('details');finance.append(el('summary','Finanzierung und Umsetzung'),el('p',scenario.funding));
    const note=el('p','Die Zeichnungen zeigen ausgewählte Umsetzungsmöglichkeiten, nicht alle Folgen. Die wichtigsten Risiken stehen bei jedem Bereich; es gibt keine verrechnete Gesamtnote.','poll-notice');
    $('vp-topics').replaceChildren(...topics,finance,note);refreshNames();
  }
  async function updateImages() {
    const number=++requestNumber,comparison=view==='pair'?data.scenarios.find(s=>s.id===compareSelect.value):null;
    const left=comparison?.image||data.baseline,right=scenario.image;
    stage.setAttribute('aria-busy','true');$('vp-image-status').textContent='Vergleichsbild wird geladen …';
    const load=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve();img.onerror=reject;img.src=src;});
    try{
      await Promise.all([load(left),load(right)]);if(number!==requestNumber)return;
      $('vp-before').src=left;$('vp-before').alt=comparison?.alt||data.baselineAlt;
      $('vp-after').src=right;$('vp-after').alt=scenario.alt;
      stage.setAttribute('aria-busy','false');$('vp-image-status').textContent=area?`${area.title} vergrößert. Gleicher Ausschnitt in beiden Bildern.`:'Illustrativer Vergleich. Anlagen- und Gebäudezahlen sind keine Prognose.';
    }catch{if(number!==requestNumber)return;stage.setAttribute('aria-busy','false');stage.dataset.imageError='true';$('vp-image-status').textContent='Ein Bild konnte nicht geladen werden. Bitte nutze „Bild groß öffnen“ oder lade die Seite erneut. Die schriftlichen Details bleiben verfügbar.';}
    if(number===requestNumber)refreshNames();
  }
  function setView(next) {
    view=next;stage.dataset.view=view;stage.removeAttribute('data-image-error');
    document.querySelectorAll('[data-vp-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.vpView===view)));
    document.querySelector('.vp-wipe-control').hidden=view!=='wipe';document.querySelector('.vp-pair-choice').hidden=view!=='pair';$('vp-legend').hidden=view!=='wipe';
    document.querySelector('.vp-hotspots').hidden=!hotspots||view==='before';
    $('vp-image-link').href=view==='before'?data.baseline:scenario.image;
    updateZoom();refreshNames();updateImages();
  }
  function reveal() {
    if(revealed)return;revealed=true;refreshNames();renderTopics();
    const sources=$('vp-sources');sources.hidden=false;sources.replaceChildren(el('h3','Zuordnung und Primärquellen'));
    for(const s of data.scenarios){const p=el('p'),a=el('a',`${s.label} · ${s.party}: ${s.sourceTitle}`);a.href=s.source;a.target='_blank';a.rel='noopener noreferrer';p.append(a);sources.append(p);}
    sources.append(el('p','Seitenangaben zählen ab der ersten PDF-Seite, einschließlich Titelblatt. Geprüfter Programmstand: Bundestagswahl 2025; keine Behauptung über die spätere Regierungspraxis.','poll-notice'));
    $('vp-reveal').setAttribute('aria-expanded','true');$('vp-reveal').textContent='Parteien und Quellen sind sichtbar';$('vp-reveal').disabled=true;
    labelResults();
  }
  function labelResults() {
    if(!revealed)return;
    // Only replace display labels. Option IDs and recorded choices never change.
    document.querySelectorAll('#poll-ui .poll-option > span,#poll-ui .poll-result-label > span').forEach(node=>{
      const s=data.scenarios.find(s=>s.label===node.textContent);if(s)node.textContent=scenarioName(s);
    });
  }
  document.addEventListener('woek:poll-render',event=>{voted=event.detail.voted;if(voted)reveal();labelResults();});
  scenarioSelect.addEventListener('change',()=>{scenario=data.scenarios.find(s=>s.id===scenarioSelect.value);renderTopics();setView(view==='before'?'after':view);});
  compareSelect.addEventListener('change',()=>setView('pair'));
  areaSelect.addEventListener('change',()=>selectArea(areaSelect.value));
  document.querySelectorAll('[data-vp-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.vpView)));
  document.querySelectorAll('[data-vp-area]').forEach(b=>b.addEventListener('click',()=>selectArea(b.dataset.vpArea)));
  $('vp-wipe').addEventListener('input',event=>{const value=Number(event.target.value);stage.style.setProperty('--vp-wipe',`${value}%`);event.target.setAttribute('aria-valuetext',`${value} Prozent Ausgangsbild, ${100-value} Prozent Szenario`);});
  $('vp-reset').addEventListener('click',()=>selectArea(''));
  $('vp-hotspot-toggle').addEventListener('click',()=>{hotspots=!hotspots;$('vp-hotspot-toggle').setAttribute('aria-expanded',String(hotspots));$('vp-hotspot-toggle').textContent=hotspots?'Markierungen ausblenden':'Details entdecken';if(hotspots&&view==='before')setView('after');document.querySelector('.vp-hotspots').hidden=!hotspots;});
  $('vp-reveal').addEventListener('click',reveal);
  // Minimal shared-navigation behaviour without analytics, personal-room profiling,
  // service-worker registration or cross-page preference tracking on this poll.
  const nav=document.querySelector('.nav-toggle'),menu=$('site-nav');
    if(nav&&menu){nav.addEventListener('click',()=>{const expanded=nav.getAttribute('aria-expanded')!=='true';nav.setAttribute('aria-expanded',String(expanded));nav.setAttribute('aria-label',expanded?'Menü schließen':'Menü öffnen');menu.classList.toggle('open',expanded);document.body.classList.toggle('nav-is-open',expanded);});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.getAttribute('aria-expanded')==='true'){nav.click();nav.focus();}});}
  // The normal newsletter form uses main.js. On this sensitive page link out instead.
  const newsletter=document.querySelector('form[data-newsletter-form],.footer-newsletter form');
  if(newsletter){const a=el('a','Zum Wirkungsbrief anmelden','btn btn-secondary');a.href='/wirkungsradar/newsletter/';newsletter.replaceWith(a);}
  renderTopics();updateZoom();setView('before');
}
if(typeof document!=='undefined')startVisual();
