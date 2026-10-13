import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context=vm.createContext({});
vm.runInContext(fs.readFileSync('assets/js/impact-calculations.js','utf8'),context);
const C=context.WoekImpactCalculations;
const base=()=>({investment:100,annualDirectBenefit:200,annualTransformativeBenefit:0,
  annualHarm:0,annualOperatingCost:0,years:1,benefitDiscountRate:0,costDiscountRate:0,
  attribution:1,deadweight:0,displacement:0,uncertainty:0,
  scores:{mensch:0,planet:1,demokratie:0},dataQuality:.8,
  systemBoundaryDefined:true,attributionDefined:true});
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-8*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const monetary=['investment','annualDirectBenefit','annualTransformativeBenefit','annualHarm','annualOperatingCost','years','benefitDiscountRate','attribution','deadweight','displacement','uncertainty'];

for (const key of monetary) {
  test(`Missing ${key} must not become zero, full attribution or a chosen horizon`,()=>{
    const x=base(); delete x[key]; const r=C.calculateTSROI(x);
    assert.equal(r.status,'blocked');assert.equal(r.tsroi,null);assert.equal(r.ioi,null);
  });
  test(`Blank ${key} is not evidence`,()=>{
    const r=C.calculateTSROI({...base(),[key]:''});assert.equal(r.status,'blocked');
  });
}
for (const value of [undefined,null,'',NaN,Infinity,'abc',-4,4,.5]) {
  test(`Invalid FinalScore input ${String(value)} stays unassessed`,()=>{
    const r=C.calculateFinalScore({mensch:value,planet:1,demokratie:0});
    assert.equal(r.finalScore,null);assert.equal(r.status,'unassessed');
  });
}
test('A measured neutral field is distinct from an unassessed field',()=>{
  assert.equal(C.calculateFinalScore({mensch:0,planet:1,demokratie:1}).status,'neutral');
  assert.equal(C.calculateFinalScore({}).status,'unassessed');
});
for (const value of [undefined,null,'',NaN,Infinity,'abc']) {
  test(`Missing or invalid NWI component ${String(value)} blocks its output`,()=>{
    const r=C.calculateNWI({positive:value,negative:0,gatePassed:true});
    assert.equal(r.raw,null);assert.equal(r.nwi,null);assert.equal(r.status,'blocked');
  });
}
test('Explicit zero NWI remains a valid neutral profile, not unknown',()=>{
  const r=C.calculateNWI({positive:0,negative:0,gatePassed:true});
  assert.equal(r.nwi,0);assert.equal(r.status,'neutral');
});
test('Documented complete zero-discount case',()=>{
  const r=C.calculateTSROI(base());assert.equal(r.gate.passed,true);close(r.tsroi,2);
});
test('An explicitly documented zero resources base never returns a ratio',()=>{
  const r=C.calculateTSROI({...base(),investment:0});assert.equal(r.tsroi,null);
});
test('Red line cannot be bought out by an arbitrarily large positive benefit',()=>{
  const r=C.calculateTSROI({...base(),redLineActive:true,annualDirectBenefit:1e9});assert.equal(r.tsroi,null);
});
test('A critical negative profile blocks the positive ratio',()=>{
  const r=C.calculateTSROI({...base(),scores:{mensch:3,planet:-1,demokratie:3}});assert.equal(r.tsroi,null);
});
test('Higher harm cannot increase the raw ratio',()=>{
  close(C.calculateTSROI({...base(),annualHarm:50}).rawTsroi,1.5);
  assert.ok(C.calculateTSROI({...base(),annualHarm:51}).rawTsroi<1.5);
});
test('The conservative haircut reduces benefit and never reduces harm',()=>{
  const r=C.calculateTSROI({...base(),annualDirectBenefit:100,annualHarm:60,uncertainty:.2});
  close(r.lowerNetBenefitPv,20);close(r.harmPv,60);close(r.benefitPv,40);
});
test('A nonpositive conservative lower bound blocks publication',()=>{
  const r=C.calculateTSROI({...base(),annualDirectBenefit:100,annualHarm:60,uncertainty:.4});
  close(r.lowerNetBenefitPv,0);assert.equal(r.tsroi,null);
});
test('Benefit attribution must not reduce harms',()=>{
  const r=C.calculateTSROI({...base(),attribution:.5,annualHarm:50});
  close(r.directPv,100);close(r.harmPv,50);close(r.benefitPv,50);
});
test('Separate benefit and resource discount rates follow the documented formula',()=>{
  const r=C.calculateTSROI({...base(),years:2,annualOperatingCost:10,benefitDiscountRate:.05,costDiscountRate:.02});
  close(r.rawTsroi,(200/1.05+200/(1.05**2))/(100+10/1.02+10/(1.02**2)));
});
test('No transformative stream means T-SROI equals IOI in this model',()=>{
  const r=C.calculateTSROI(base());close(r.tsroi,r.ioi);
});
test('The documented transformative stream is additive rather than a free multiplier',()=>{
  const r=C.calculateTSROI({...base(),annualTransformativeBenefit:50});
  close(r.transformativePv,50);close(r.tsroi,2.5);close(r.ioi,2);
});
test('Lower data quality cannot improve a benefit or shrink a harm',()=>{
  const a=C.calculateTSROI({...base(),annualHarm:40,dataQuality:.9});
  const b=C.calculateTSROI({...base(),annualHarm:40,dataQuality:.4});
  close(a.harmPv,b.harmPv);close(a.benefitPv,b.benefitPv);assert.equal(b.tsroi,null);
});
test('Scaling all money flows preserves the dimensionless quotient',()=>{
  const a={...base(),annualHarm:20,annualOperatingCost:10};const b={...a};
  for(const k of ['investment','annualDirectBenefit','annualTransformativeBenefit','annualHarm','annualOperatingCost']) b[k]*=1000;
  close(C.calculateTSROI(a).tsroi,C.calculateTSROI(b).tsroi);
});
test('Published kitchen example independently reproduced',()=>{
  const r=C.calculateTSROI({...base(),investment:6000,annualDirectBenefit:16200,annualHarm:1000,
    annualOperatingCost:2000,benefitDiscountRate:.05,costDiscountRate:.05,uncertainty:.2});
  close(r.benefitPv,15200/1.05);close(r.costPv,6000+2000/1.05);
  close(r.tsroi,15200/8300);close(r.lowerNetBenefitPv,(16200*.8-1000)/1.05);
});
test('Published varying two-year cash-flow example independently reproduced, rounded to stated precision',()=>{
  const c=.8*.9*.95; const p1=(900000*c-90000)/1.05;const p2=(1200000*c-110000)/(1.05**2);
  assert.equal(Math.round(p1+p2),1145288);assert.equal(((p1+p2)/1e6).toFixed(2),'1.15');
});

const R=await import('../../scripts/review/consistency-20261009/reference-core.mjs');
const rules=JSON.parse(fs.readFileSync('content/grundlagen/reference-corrections-20261009.json','utf8'));
for(const e of rules.entries) {
  test(`Sourced correction ${e.paragraphId} preserves anchors and is idempotent`,()=>{
    const old=`<main><p id="${e.paragraphId}">${e.oldHtml}</p></main>`;
    const next=R.applyReferenceCorrections(old);
    assert.ok(next.includes(`id="${e.paragraphId}"`));assert.ok(next.includes(e.newHtml));
    assert.equal(R.applyReferenceCorrections(next),next);
  });
}
test('Unknown upstream wording requires review instead of being overwritten',()=>{
  const e=rules.entries[0];assert.throws(()=>R.applyReferenceCorrections(`<main><p id="${e.paragraphId}">A different upstream text.</p></main>`),/changed upstream/);
});
test('Action-plan/state note is dated, sourced and idempotent',()=>{
  const s=R.applyCurrentScopeNotice('<main><p>Historical original.</p></main>');
  assert.equal(R.applyCurrentScopeNotice(s),s);assert.ok(s.includes('30. September 2026'));
  assert.ok(s.includes('2009'));assert.ok(s.includes('bundesregierung.de'));
});
test('Core reference covers society without claiming complete measurement',()=>{
  const s=fs.readFileSync('content/grundlagen/WOEK_KERNREFERENZ.md','utf8');
  for(const t of ['Wirtschafts- und Gesellschaftsmodell','Medien','Mieten','Gesundheit','keine offizielle UN-Kategorie','keine sieben zeitlichen Stationen','alle für den jeweiligen Gegenstand relevanten Wirkungen']) assert.ok(s.includes(t),t);
});
