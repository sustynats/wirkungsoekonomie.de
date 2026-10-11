const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'assets/js/two-shirts-calculations.js'),'utf8'),context);
const calc=context.WoekShirtDemo;
const data=JSON.parse(fs.readFileSync(path.join(root,'content/examples/two-shirts.json'),'utf8'));
const input={rate:20,quantities:[100,100],reserveFraction:.2,administrationCost:0,otherFunds:0,passThrough:1,eligibility:[false,true]};
const run=(patch={})=>calc.fundScenario(data.products,data.demo_policy,{...input,...patch});
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
test('both price movements derive from one budget rule, fixed costs and surplus',()=>{
 const x=run(),[a,b]=x.rows;
 near(a.oldGross,14.28);near(b.oldGross,16.66);near(a.buyerPayment,17.85);near(b.buyerPayment,14.26);
 assert.ok(a.buyerPayment>a.oldGross);assert.ok(b.buyerPayment<b.oldGross);
 near(a.cost,8);near(b.cost,10);near(a.actualSurplus,4);near(b.actualSurplus,4);
 near(x.revenue,300);near(x.reserve,60);near(x.paid,240);near(x.cashBalance,60);
 near(x.fundingGap,60);assert.equal(x.status,'budget-limited');
});
test('subsidy is consideration; VAT basis includes fund payment',()=>{
 const b=run().rows[1];near(b.buyerPayment+b.fundPayment,b.sellerGross);
 near(b.sellerGross,16.66);near(b.sellerNet,14);near(b.vatDue,2.66);
 assert.notEqual(b.vatDue,b.buyerPayment*.19/1.19);
});
test('partial and absent pass-through show buyer and producer effects separately',()=>{
 const partial=run({passThrough:.5}).rows[1],zero=run({passThrough:0}).rows[1];
 near(partial.buyerPayment,15.46);assert.ok(partial.actualSurplus>4);
 near(zero.buyerPayment,16.66);near(zero.passedRelief,0);assert.ok(zero.actualSurplus>4);
});
test('lost revenue cannot sustain former relief',()=>{
 const x=run({quantities:[0,100]});near(x.revenue,0);near(x.paid,0);near(x.rows[1].buyerPayment,16.66);near(x.fundingGap,300);
 const y=run({quantities:[10,100]});near(y.rows[1].fundPayment,.24);assert.ok(y.fundingGap>x.fundingGap*.9);
});
test('explicit other funds and administration costs enter the cash account once',()=>{
 const x=run({otherFunds:60,administrationCost:10});near(x.available,290);near(x.paid,290);near(x.cashBalance,60);
 const y=run({quantities:[0,100],administrationCost:10});assert.equal(y.status,'financing-open');near(y.cashGap,10);near(y.paid,0);near(y.cashBalance,-10);
});
test('failed protection or open profile cannot receive relief',()=>{
 const x=run({eligibility:[false,false]});near(x.paid,0);near(x.rows[1].buyerPayment,16.66);
 for(const value of [null,undefined,0,'true']) assert.throws(()=>run({eligibility:[false,value]}));
});
test('zero demand and quantity remain finite; no negative buyer payment',()=>{
 for(const quantities of [[0,0],[100,0]]) {const x=run({quantities});near(x.paid,0);assert.ok(Number.isFinite(x.cashBalance));}
 const x=run({rate:1000,otherFunds:1000000});assert.ok(x.rows.every(p=>p.buyerPayment>=0));
});
test('budget rounding never spends more than available',()=>{
 for(const quantities of [[1,3],[17,53],[100,999],[999,1]]) {
  const x=run({quantities});assert.ok(x.paid<=x.available+1e-9);assert.ok(x.unallocated>=0);
  near(x.cashBalance,x.reserve+x.unallocated);
 }
});
test('equal product data retain equal treatment across all teaching trade routes',()=>{
 for(const route of ['domestic','import-input','import-finished','intra-eu','direct-sale']) {
  near(calc.collectedForRoute(data.products[0],data.demo_policy,20,route,false),3);
  near(calc.collectedForRoute(data.products[0],data.demo_policy,20,route,true),0);
 }
});
test('missing, malformed and out-of-range inputs fail closed',()=>{
 for(const key of ['rate','quantities','reserveFraction','administrationCost','otherFunds','passThrough','eligibility']) {
  const bad={...input};delete bad[key];assert.throws(()=>calc.fundScenario(data.products,data.demo_policy,bad),key);
 }
 for(const bad of [{quantities:[1.5,1]},{reserveFraction:1.1},{otherFunds:-1},{passThrough:-.1},{rate:NaN},{rate:[]},{rate:{}}])assert.throws(()=>run(bad));
});
test('overflow and unsafe cent precision never produce a fictitious funded result',()=>{
 for(const bad of [{otherFunds:1e308},{administrationCost:1e308},{otherFunds:Number.MAX_SAFE_INTEGER/100}])assert.throws(()=>run(bad));
 const products=data.products.map(p=>({...p,mass_kg:1e300}));
 assert.throws(()=>calc.fundScenario(products,data.demo_policy,input));
});
