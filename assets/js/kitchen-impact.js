(function(root) {
 'use strict';
 function calculateKitchen(input) {
  const names=['before','after','comparisonBefore','comparisonAfter','days'];
  const values={};
  for(const key of names) {
   const raw=input[key];
   if(raw===null || raw===undefined || String(raw).trim()==='' || !Number.isFinite(Number(raw)) || Number(raw)<0 || Number(raw)>1000000) return {valid:false,error:'Bitte trage für alle Mengen eine Zahl zwischen 0 und 1.000.000 ein.'};
   values[key]=Number(raw);
  }
  if(!Number.isInteger(values.days)||values.days<1||values.days>366) return {valid:false,error:'Die Zahl der Öffnungstage muss eine ganze Zahl zwischen 1 und 366 sein.'};
  const observed=values.before-values.after, comparison=values.comparisonBefore-values.comparisonAfter, additional=observed-comparison;
  return {valid:true,observed,comparison,additional,annual:additional*values.days,relative:values.before>0?observed/values.before*100:null,...values};
 }
 if(typeof module!=='undefined'&&module.exports) module.exports={calculateKitchen};
 root.WoekKitchenImpact={calculateKitchen};
 if(typeof document==='undefined')return;
 const container=document.querySelector('[data-kitchen-calculator]');if(!container)return;
 const form=container.querySelector('form'),steps=[...container.querySelectorAll('[data-course-step]')],result=container.querySelector('[data-course-result]'),error=container.querySelector('[data-course-error]'),back=container.querySelector('[data-course-back]'),next=container.querySelector('[data-course-next]');
 let step=0;
 const fmt=n=>n.toLocaleString('de-DE',{maximumFractionDigits:2});
 const values=()=>Object.fromEntries(['before','after','comparisonBefore','comparisonAfter','days'].map(key=>[key,form.elements[key].value]));
 form.elements.days.max='366';form.elements.days.min='1';form.elements.days.step='1';
 function validStep(){
  const invalid=[...steps[step].querySelectorAll('input')].find(x=>!x.checkValidity());
  if(invalid){error.textContent=step===2?'Bitte trage eine ganze Zahl von 1 bis 366 Öffnungstagen ein.':'Bitte trage gültige, nichtnegative Abfallmengen ein.';invalid.reportValidity();invalid.focus();return false;}error.textContent='';return true;
 }
 function render(){
  const r=calculateKitchen(values());
  if(!r.valid){result.textContent=r.error;return;}
  const a=r.additional;
  const observedText=r.observed<0?`${fmt(-r.observed)} kg mehr Abfall pro Tag`:`${fmt(r.observed)} kg weniger Abfall pro Tag`;
  if(step===0){result.textContent=`${fmt(r.before)} - ${fmt(r.after)} = ${fmt(r.observed)} kg: ${observedText}. Das ist die beobachtete Veränderung. Welcher Teil auf die Umstellung zurückgeht, ist damit noch offen.`;return;}
  const interpretation=a>0?`${fmt(a)} kg zusätzlich vermiedener Abfall pro Tag`:a<0?`${fmt(-a)} kg mehr Abfall pro Tag gegenüber der geschätzten Entwicklung ohne Umstellung`:'kein zusätzlicher Unterschied gegenüber der geschätzten Entwicklung ohne Umstellung';
  result.textContent=`(${fmt(r.before)} - ${fmt(r.after)}) - (${fmt(r.comparisonBefore)} - ${fmt(r.comparisonAfter)}) = ${fmt(a)} kg: ${interpretation}. `+(step===2?`${fmt(a)} × ${fmt(r.days)} = ${fmt(r.annual)} kg im Rechenjahr. Das ist eine Hochrechnung unter stabilen Bedingungen, keine gemessene Jahreswirkung. `:'')+'Die kausale Interpretation hängt von der Vergleichbarkeit ab; die Rechnung allein beweist sie nicht.';
 }
 function show(focus=false){steps.forEach((el,i)=>{el.hidden=i!==step;});container.querySelector('.course-controls').hidden=false;back.hidden=step===0;next.hidden=step===2;next.textContent=step===0?'Weiter zum Vergleich':'Weiter zur Jahresplanung';container.querySelector('[data-course-progress]').textContent=`Schritt ${step+1} von 3: ${['Beobachtung','Vergleich','Jahresplanung'][step]}`;render();if(focus){const legend=steps[step].querySelector('legend');legend.tabIndex=-1;legend.focus();}}
 next.addEventListener('click',()=>{if(validStep()){step=Math.min(2,step+1);show(true);}});
 back.addEventListener('click',()=>{error.textContent='';step=Math.max(0,step-1);show(true);});
 form.addEventListener('submit',event=>{event.preventDefault();if(validStep()&&step<2){step++;show(true);}});
 form.addEventListener('input',()=>{error.textContent='';render();});
 form.addEventListener('reset',()=>queueMicrotask(()=>{step=0;error.textContent='';show(true);}));
 show();
})(typeof globalThis!=='undefined'?globalThis:this);
