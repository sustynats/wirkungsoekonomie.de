const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'assets/js/two-shirts-calculations.js'),'utf8'),context);
const c=context.WoekShirtDemo,d=JSON.parse(fs.readFileSync(path.join(root,'content/examples/two-shirts.json'),'utf8'));
const [a,b]=d.products,p=d.demo_policy;
const near=(x,y)=>assert.ok(Math.abs(x-y)<1e-9,`${x} != ${y}`);
for(const [label,prod,oldPrice,newPrice,tax] of [['A',a,14.28,17.85,3],['B',b,16.66,16.66,0]]){
 test(`${label}: material levy alone: before/after amounts are derived`,()=>{let x=c.compare(prod,p,20,0);near(x.oldGross,oldPrice);near(x.newGross,newPrice);near(x.levy,tax);near(x.margin,4);});
 test(`${label}: component cost total reconciles`,()=>near(c.sumStages(prod.cost_stages_eur),prod.cost_eur));
 test(`${label}: recycled and virgin material reconcile`,()=>{let x=c.material(prod);near(x.virgin+x.recycled,.2);near(prod.batch_recycled_kg/prod.batch_input_kg,prod.recycled_fraction);});
}
test('material levy alone: price reversal follows a common rule',()=>assert.ok(c.compare(a,p,20,0).newGross>c.compare(b,p,20,0).newGross));
test('zero tariff retains prior price ordering',()=>{near(c.compare(a,p,0,0).newGross,14.28);assert.ok(c.compare(a,p,0,0).newGross<c.compare(b,p,0,0).newGross);});
test('break-even tariff is 2 / 0.15',()=>near(c.compare(a,p,2/.15,0).newGross,c.compare(b,p,2/.15,0).newGross));
test('separate cost-saving scenario is distinct from fund relief',()=>near(c.compare(b,p,20,2).newGross,14.28));
test('common selling price generates A 3 and B 4',()=>{near(c.unitSurplus(a,p,20,14,0),3);near(c.unitSurplus(b,p,20,14,0),4);});
test('counterexample: worse material profile can remain profitable',()=>assert.ok(c.unitSurplus(a,p,20,14,0)>0));
test('lower selling price can make both loss-making',()=>{assert.ok(c.unitSurplus(a,p,20,7,0)<0);assert.ok(c.unitSurplus(b,p,20,7,0)<0);});
test('VAT rate is constant across products',()=>{for(const q of [a,b]){const x=c.compare(q,p,20,0);near(x.vatNew/x.newNet,.19);}});
test('no negative levy from high recycling share',()=>near(c.levy({...b,recycled_fraction:1},p,20).amount,0));
test('water values reconcile with ML conversion',()=>{near(c.waterPerProduct(a),30);near(c.waterPerProduct(b),15);});
test('emission stage sums reconcile',()=>{near(c.sumStages(a.climate_stages_kg),8);near(c.sumStages(b.climate_stages_kg),3.4);});
test('documented working wage classes: 50 -> -2; 90 -> +2',()=>{assert.equal(c.livingWageScore(50,100).score,-2);assert.equal(c.livingWageScore(90,100).score,2);});
for(const [val,want] of [[0,-3],[39,-3],[40,-2],[59,-2],[60,0],[79,0],[80,2],[94,2],[95,3],[100,3]])test(`working wage boundary ${val}%`,()=>assert.equal(c.livingWageScore(val,100).score,want));
test('do not invent missing fractional threshold rules',()=>assert.equal(c.livingWageScore(81,200).score,null));
for(const route of ['domestic','import-input','import-finished','intra-eu','direct-sale']){
 test(`origin neutrality in demo: ${route}`,()=>{near(c.collectedForRoute(a,p,20,route,false),3);near(c.collectedForRoute(b,p,20,route,false),0);});
 test(`no repeated same-module assessment: ${route}`,()=>near(c.collectedForRoute(a,p,20,route,true),0));
}
for(const v of [null,undefined,'',' ',NaN,Infinity,true,'abc'])test(`missing/invalid data do not become a zero: ${String(v)}`,()=>assert.throws(()=>c.levy({...a,recycled_fraction:v},p,20)));
for(const v of [-.1,1.1])test(`invalid recycled share ${v}`,()=>assert.throws(()=>c.levy({...a,recycled_fraction:v},p,20)));
test('negative tariff rejected',()=>assert.throws(()=>c.levy(a,p,-1)));
test('negative or excessive cost saving rejected',()=>{assert.throws(()=>c.compare(b,p,20,-1));assert.throws(()=>c.compare(b,p,20,11));});
test('water data inconsistency rejected',()=>assert.throws(()=>c.waterPerProduct({...a,water_discharge_ml:.2})));
test('unknown trading route rejected',()=>assert.throws(()=>c.collectedForRoute(a,p,20,'unknown',false)));
test('unprovided collection status rejected',()=>assert.throws(()=>c.collectedForRoute(a,p,20,'domestic',null)));
test('registry working scale exactly sourced, not claimed validated',()=>{const r=JSON.parse(fs.readFileSync(path.join(root,'content/examples/two-shirts-register-extract.json')));const i=r.items.find(x=>x.id==='WOK-S-101');assert.equal(i.thresholds,'≥95:+3; 80-94:+2; 60-79:0; 40-59:-2; <40:-3');assert.match(i.threshold_status,/validieren/);});
test('public explanation retains model status and discloses financing, protection and pass-through',()=>{const h=fs.readFileSync(path.join(root,'verstehen/zwei-t-shirts/index.html'),'utf8');for(const word of ['Kein Gesamtscore','Fonds','Schutz','Weitergabe','keine bereits geltenden WÖk-Pflichten','keine UN-Zertifizierung'])assert.ok(h.includes(word),word);assert.equal(h.includes('{{'),false);assert.doesNotMatch(h,/[\u2013\u2014]/);assert.match(h,/14,26/);assert.match(h,/17,85/);});
