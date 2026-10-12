import fs from 'node:fs';
import vm from 'node:vm';
import {writeContentPage} from '../lib/content-page.mjs';
import {escapeHtml as esc} from '../lib/explainer-components.mjs';
import {renderCorePriceSections} from '../lib/core-price-reader.mjs';
const d=JSON.parse(fs.readFileSync('content/examples/two-shirts.json','utf8'));
const box={module:{exports:{}}};vm.runInNewContext(fs.readFileSync('assets/js/two-shirts-calculations.js','utf8'),box);
const c=box.module.exports,p=d.demo_policy,f=p.fund;
const x=c.fundScenario(d.products,p,{rate:p.rate_eur_per_kg,quantities:f.quantities,reserveFraction:f.reserve_fraction,administrationCost:f.administration_cost_eur,otherFunds:f.other_funds_eur,passThrough:f.pass_through,eligibility:f.eligibility_assumed});
const euro=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(n);
const values={};
const reference=fs.readFileSync('content/grundlagen/WOEK_KERNREFERENZ.md','utf8');
const excerpts=renderCorePriceSections(reference);
writeContentPage({file:'verstehen/preise-und-wirkungsfonds/index.html',title:'Preise und Wirkungsfonds',description:'Wie Belastung, finanzierte Entlastung und Umsatzsteuer im Modell zusammenspielen.',section:'Verstehen',type:'Grundlage',body:`<div data-no-glossary><p class="hero-kicker">Wirtschaft einfach erklärt</p><h1>Preise und Wirkungsfonds</h1><p>Wie kann die bessere Alternative tatsächlich günstiger werden? Die WÖk verbindet Belastungen mit finanzierten Entlastungen. Hier stehen die Grundlagen des Modells; die konkrete Faserregel im T-Shirt-Beispiel ist eine Lehrannahme und kein geltender Steuertarif.</p>${excerpts}<section><h2>Quellen</h2><p>WÖk-Kernreferenz v1.1 vom 9. Oktober 2026, Abschnitte 9.1, 9.3 und 9.4. W1: Natalie Weber, Begriffsleitfaden v1.8 vom 1. Oktober 2026. W2/W3: Buchentwürfe Band I, Kapitel 22.11, und Band II, Kapitel 57.8, vom 1. Oktober 2026. W4: WStG 3.0, Gesamtneufassung 2026, ein Gesetzesentwurf des Modells.</p><p><a href="/bibliothek/wirkungssteuer-wstg-3-0/">WStG-3.0-Entwurf</a> · <a href="https://www.gesetze-im-internet.de/ustg_1980/__10.html">E7: § 10 Absatz 1 UStG</a></p><p><a href="../zwei-t-shirts/">Zum durchgerechneten T-Shirt-Beispiel</a></p></section></div>`});
for(const [i,id] of ['a','b'].entries())for(const [label,key] of [['old','oldGross'],['new','buyerPayment'],['cost','cost'],['levy','levy'],['fund','fundPayment'],['surplus','actualSurplus'],['vat','vatDue'],['seller','sellerGross'],['net','sellerNet']])values[`${label}_${id}`]=euro(x.rows[i][key]);
for(const [label,key] of [['revenue','revenue'],['other_funds','otherFunds'],['admin','administrationCost'],['reserve','reserve'],['paid','paid'],['gap','fundingGap'],['balance','cashBalance']])values[label]=euro(x[key]);
values.price_result=`A wird um ${euro(x.rows[0].priceChange)} teurer. B wird um ${euro(-x.rows[1].priceChange)} günstiger als B vorher.`;
values.fund_status=`Budget begrenzt: ${euro(x.fundingGap)} fehlen zur gewünschten vollen Entlastung. Ausgezahlt werden nur verfügbare Mittel.`;
values.sources=d.sources.map(s=>`<li id="s-${esc(s.id)}"><strong>${esc(s.id)} · ${s.url?`<a href="${esc(s.url)}">${esc(s.title)}</a>`:esc(s.title)}</strong><p>${esc(s.role)}</p></li>`).join('\n');
values.nace_table=`<div class="table-scroll"><table><caption>Tätigkeiten in NACE Rev. 2.1</caption><thead><tr><th scope="col">Im Beispiel</th><th scope="col">Code</th><th scope="col">Zuordnung und Grenze</th></tr></thead><tbody>${d.stages.map(s=>`<tr><td>${esc(s.name)}</td><td>${esc(s.nace)}</td><td>${esc(s.label)}${s.note?`<br><small>${esc(s.note)}</small>`:''}</td></tr>`).join('')}</tbody></table></div>`;
let body=fs.readFileSync('templates/examples/two-shirts.html','utf8').replace(/\{\{(\w+)\}\}/g,(_,key)=>{if(!(key in values))throw new Error(`Unresolved shirt token ${key}`);return values[key];}).replace(/[\u2011\u2013\u2014]/g,'-');
body=`<link rel="stylesheet" href="/assets/css/two-shirts.css"><div id="shirt-example">${body}</div><script id="example-data" type="application/json">${JSON.stringify(d).replaceAll('<','\\u003c')}</script><script src="/assets/js/two-shirts-calculations.js"></script><script src="/assets/js/two-shirts.js"></script>`;
writeContentPage({file:'verstehen/zwei-t-shirts/index.html',title:'Zwei T-Shirts: bessere Wirkung, andere Preise',description:'Ein einfaches Lernbeispiel erklärt Lieferkette, Wirkungsdaten, Belastung und echte Fondsentlastung. Mit nachvollziehbarer Preis- und Finanzierungsrechnung.',section:'Verstehen',type:'Erklärung',body});
// Keep the authored introduction intact and add a crawlable entry to its
// separately maintained economic example. No menu-label decision is involved.
const start='<!-- two-shirts-entry:start -->',end='<!-- two-shirts-entry:end -->';
const entry=`${start}<section class="section section-soft" id="preise-verstehen" aria-labelledby="preise-verstehen-title"><p class="hero-kicker">Wirtschaft einfach erklärt</p><h2 id="preise-verstehen-title">Wie werden bessere Alternativen bezahlbarer?</h2><p>Im T-Shirt-Beispiel verteuert eine gemeinsame Regel die stärker belastende Alternative. Ein finanzierter Wirkungsfonds entlastet die andere tatsächlich beim Kauf. Herstellungskosten und Stücküberschuss bleiben im ersten Vergleich gleich.</p><p><a class="btn btn-primary" href="/verstehen/zwei-t-shirts/">Die zwei T-Shirts durchrechnen</a></p><p class="meta-line">Offenes Lernmodell mit Finanzierung, Schutzbedingungen und Grenzen; kein geltender Steuertarif.</p></section>${end}`;
for(const file of ['index.html','verstehen/index.html']){
  let page=fs.readFileSync(file,'utf8').replace(/<!-- two-shirts-entry:start -->[\s\S]*?<!-- two-shirts-entry:end -->\s*/g,'');
  if(!page.includes('</main>'))throw new Error('Entry page has no main: '+file);
  page=page.replace('</main>',entry+'\n</main>');fs.writeFileSync(file,page);
}
console.log('Built two-sided shirt example with shared site templates and calculated static prices.');
