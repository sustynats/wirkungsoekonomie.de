import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {writeContentPage} from '../lib/content-page.mjs';
import {escapeHtml as esc, ImpactProcess, ComparisonTable, ExampleCards, FeedbackLoop} from '../lib/explainer-components.mjs';
import {calculateDifference, formatLearningNumber as number} from '../../assets/js/measurement-learning.js';

export function worksheet(data, blank = false) {
  const [aBefore, aAfter, bBefore, bAfter] = data.learning.values;
  const dynamic = {
    baseline: {value:aBefore, unit:'%', status:'Modelliert: gesetzte Lernannahme; keine reale Erhebung'},
    target: {value:data.learning.target, unit:'%', note:data.learning.targetNote},
    counterfactual: {value:aBefore + bAfter - bBefore, unit:'%', status:'Modellierter Verlauf für A ohne Maßnahme, nur unter den Vergleichsannahmen'},
    observations: {values:{aBefore,aAfter,bBefore,bAfter}, unit:'%', status:'Modelliert: vier erfundene Lernannahmen; Mittelwerte individueller Haushaltsquoten'},
  };
  return {
    format:'Lokales KII-Arbeitsblatt', version:'1.0', date:data.date,
    title:blank ? 'KII-Steckbrief: leere Arbeitsvorlage' : 'KII-Steckbrief: Mobilitätskosten-Lernbeispiel',
    localExampleKey:blank ? null : 'lernbeispiel-mobilitaetskosten',
    registerEntry:false,
    note:'Lokales Arbeitsblatt, kein Zentralregister und keine Kennung aus dem WÖk-Masterregister. Unbekannte Werte bleiben null. Keine reale Erhebung und kein Kausalnachweis.',
    fields:data.profile.map(({key,label,value,valueFrom}) => ({key,label,value:blank ? null : valueFrom ? dynamic[valueFrom] : value})),
  };
}
export function valueText(value) {
  if (value === null || value === undefined) return 'Noch offen';
  if (typeof value !== 'object') return String(value);
  const labels={value:'Wert',unit:'Einheit',status:'Status',note:'Hinweis',values:'Lernwerte',id:'Registerkennung',aBefore:'A vorher',aAfter:'A nachher',bBefore:'B vorher',bAfter:'B nachher'};
  return Object.entries(value).map(([key,item]) => `${labels[key] || key}: ${valueText(item)}`).join('; ');
}
export function worksheetMarkdown(sheet) {
  return (`# ${sheet.title}\n\n${sheet.note}\n\nStand: ${sheet.date} | Formatversion: ${sheet.version}\n\nLokaler Beispielschlüssel: ${sheet.localExampleKey || 'Noch offen'}\n\n${sheet.fields.map(field => `## ${field.label}\n\n${field.value === null ? '' : valueText(field.value)}\n`).join('\n')}`).trimEnd()+'\n';
}
function comparison(data) {
  const max = Math.max(...data.learning.values,1);
  const groups = [
    {title:'Gruppe A mit Maßnahme',values:data.learning.values.slice(0,2)},
    {title:'Geeignete Vergleichsgruppe B',values:data.learning.values.slice(2)},
  ];
  return `<figure class="measurement-comparison"><p class="measurement-model-note"><strong>Modellrechnung mit erfundenen Werten</strong></p><div class="measurement-groups">${groups.map(group => `<div class="measurement-group"><h3>${esc(group.title)}</h3>${group.values.map((value,i) => `<div class="measurement-bar-row"><span>${i ? 'Nachher' : 'Vorher'}</span><span class="measurement-bar-track" aria-hidden="true"><span class="measurement-bar" style="width:${value/max*100}%"></span></span><strong>${number(value)} %</strong></div>`).join('')}</div>`).join('')}</div><figcaption>Mittlere individuelle Haushaltsquoten: A von ${number(data.learning.values[0])} auf ${number(data.learning.values[1])} %, B von ${number(data.learning.values[2])} auf ${number(data.learning.values[3])} %. Unterschied der Veränderungen: ${number(calculateDifference(data.learning.values).additional)} Prozentpunkte. Kein Kausalnachweis und kein Gesamturteil.</figcaption></figure>`;
}
function calculator(data) {
  return `<section class="measurement-calculator" aria-labelledby="learning-calculator-title"><h3 id="learning-calculator-title">Die vier Werte selbst verändern</h3><p id="learning-warning"><strong>Lernrechnung. Kein Kausalnachweis und kein Gesamturteil.</strong></p><p>Gib nichtnegative Kostenanteile ein. Werte über 100 % sind möglich, wenn Ausgaben das Einkommen übersteigen. Dezimalkomma und Dezimalpunkt sind zulässig.</p><div data-measurement-calculator hidden><div class="measurement-inputs">${data.learning.labels.map((label,i) => `<div><label for="learning-${i}">${esc(label)} (%)</label><input id="learning-${i}" data-learning-input type="text" inputmode="decimal" value="${data.learning.values[i]}" aria-describedby="learning-warning learning-error" autocomplete="off" spellcheck="false"></div>`).join('')}</div><p id="learning-error" data-learning-error role="alert" hidden></p><div data-learning-output aria-live="polite" aria-atomic="true"><dl class="measurement-results"><div><dt>Beobachteter Unterschied A</dt><dd><span data-learning-result="observed"></span> <span data-learning-unit="observed">Prozentpunkte</span></dd></div><div><dt>Vergleichsentwicklung B</dt><dd><span data-learning-result="comparison"></span> <span data-learning-unit="comparison">Prozentpunkte</span></dd></div><div><dt>Differenz E</dt><dd><span data-learning-result="additional"></span> <span data-learning-unit="additional">Prozentpunkte</span></dd></div></dl><p data-learning-interpretation></p></div><button class="btn btn-secondary" type="button" data-learning-reset>Auf Lernwerte zurücksetzen</button></div><noscript><p>Ohne JavaScript bleibt das vollständig gerechnete Beispiel oberhalb lesbar. Die Eingabefelder benötigen JavaScript.</p></noscript></section>`;
}
export function buildMeasurementPage() {
  const data = JSON.parse(fs.readFileSync('content/site/wirkung-messen.json','utf8'));
  const result = calculateDifference(data.learning.values);
  if (!result.valid) throw Error('Invalid learning assumptions');
  const filled = worksheet(data), blank = worksheet(data,true);
  const downloadDir = 'assets/downloads/wirkung-messen';
  fs.mkdirSync(downloadDir,{recursive:true});
  const downloads = [];
  for (const [name,sheet] of [['kii-mobilitaetskosten-lernbeispiel',filled],['kii-arbeitsvorlage',blank]]) {
    for (const format of ['json','md']) {
      const file = `${downloadDir}/${name}.${format}`;
      fs.writeFileSync(file,format === 'json' ? JSON.stringify(sheet,null,2)+'\n' : worksheetMarkdown(sheet));
      downloads.push(`<li><a href="/${file}" download>${sheet === filled ? 'Ausgefülltes Lernbeispiel' : 'Leere Arbeitsvorlage'} (${format === 'md' ? 'Markdown' : 'JSON'})</a></li>`);
    }
  }
  const faq = JSON.parse(fs.readFileSync('content/site/core-questions.json','utf8')).filter(item => data.faqIds.includes(item.id));
  if (faq.length !== data.faqIds.length) throw Error('Missing professional FAQ entries');
  const indicatorLabels = {question:'Messfrage',method:'Messvorschrift',unit:'Einheit',dataNeed:'Datenbedarf',observationTime:'Beobachtungszeit',comparison:'Vergleich',uncertainty:'Unsicherheit',limit:'Grenze'};
  const replacements = {
    TITLE:esc(data.title),SUBTITLE:esc(data.subtitle),PROCESS:ImpactProcess(data.process),KPI_COMPARISON:ComparisonTable(data.kpiComparison),
    INDICATORS:`<div class="measurement-indicators">${data.indicators.map(item => `<article class="card measurement-indicator" id="kii-${esc(item.id)}"><p class="card-kicker">${esc(item.dimension)}</p><h3>${esc(item.title)}</h3><p>${esc(item.question)}</p><details class="measurement-detail"><summary>Messvorschrift, Daten und Grenzen</summary><dl>${Object.entries(indicatorLabels).filter(([key]) => key !== 'question').map(([key,label]) => `<dt>${label}</dt><dd>${esc(item[key])}</dd>`).join('')}</dl><p>Quellenfunktion: ${item.sources.map(id=>`<a href="#quelle-${esc(id)}">${esc(data.sources.find(source=>source.id===id)?.title || (()=>{throw Error('Unknown source');})())}</a>`).join(' · ')}</p></details></article>`).join('')}</div>`,
    PROFILE:`<dl class="measurement-profile">${filled.fields.map(field=>`<div><dt>${esc(field.label)}</dt><dd>${esc(valueText(field.value))}</dd></div>`).join('')}</dl>`,
    DOWNLOADS:`<ul>${downloads.join('')}</ul>`,
    BASELINE:number(data.learning.values[0]),COUNTERFACTUAL:number(data.learning.values[0]+data.learning.values[3]-data.learning.values[2]),
    A_BEFORE:number(data.learning.values[0]),A_AFTER:number(data.learning.values[1]),B_BEFORE:number(data.learning.values[2]),B_AFTER:number(data.learning.values[3]),
    OBSERVED:number(result.observed),COMPARISON_CHANGE:number(result.comparison),ADDITIONAL:number(result.additional),
    COMPARISON:comparison(data),CALCULATOR:calculator(data),DECISIONS:ExampleCards(data.decisions),FEEDBACK:FeedbackLoop(data.feedback),
    FAQ:faq.map(item=>`<details class="measurement-detail" id="faq-${esc(item.id)}"><summary>${esc(item.question)}</summary><p>${esc(item.answer)}</p></details>`).join(''),
    SOURCES:`<ol class="measurement-sources">${data.sources.map(source=>`<li id="quelle-${esc(source.id)}"><p><a href="${esc(source.url)}">${esc(source.title)}</a></p><p>${esc(source.role)}</p></li>`).join('')}</ol>`,
  };
  let body=fs.readFileSync('content/site/wirkung-messen.inc','utf8').replace(/\{\{(\w+)\}\}/g,(_,key)=>replacements[key]??(()=>{throw Error('Unknown content field '+key);})());
  const structured = [
    {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Verstehen',item:'https://wirkungsoekonomie.de/verstehen/'},{'@type':'ListItem',position:2,name:'Wirkung messen und nachweisen',item:'https://wirkungsoekonomie.de'+data.route}]},
    {'@context':'https://schema.org','@type':'Article',headline:data.title,description:data.description,inLanguage:'de',author:{'@type':'Person',name:'Natalie Weber'},publisher:{'@type':'Organization',name:'Institut für Wirkungsökonomie'},mainEntityOfPage:'https://wirkungsoekonomie.de'+data.route},
    {'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(item=>({'@type':'Question',name:item.question,acceptedAnswer:{'@type':'Answer',text:item.answer}}))},
  ];
  body += `<script type="application/ld+json">${JSON.stringify(structured).replaceAll('<','\\u003c')}</script>`;
  writeContentPage({file:data.route.slice(1)+'index.html',title:data.title,description:data.description,section:'Verstehen',type:'Grundlagenerklärung',body,aliases:data.searchAliases,styles:['assets/css/measurement-learning.css'],modules:['assets/js/measurement-learning.js']});
  console.log('Measurement explanation and four worksheet downloads generated.');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) buildMeasurementPage();
