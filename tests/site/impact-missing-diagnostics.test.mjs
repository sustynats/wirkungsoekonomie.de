import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const sandbox={module:{exports:{}}};vm.runInNewContext(fs.readFileSync('assets/js/impact-calculations.js','utf8'),sandbox);const c=sandbox.module.exports;
const good={investment:6000,annualDirectBenefit:16200,annualTransformativeBenefit:0,annualHarm:1000,annualOperatingCost:2000,years:1,benefitDiscountRate:.05,costDiscountRate:.05,attribution:1,deadweight:0,displacement:0,uncertainty:.2,scores:{mensch:0,planet:2,demokratie:0},dataQuality:.8,systemBoundaryDefined:true,attributionDefined:true};
test('missing harm blocks raw monetary diagnostics, preserving explicit zero',()=>{
 const x=c.calculateTSROI({...good,annualHarm:undefined});assert.equal(x.tsroi,null);assert.equal(x.benefitPv,null);assert.equal(x.harmPv,null);assert.equal(x.rawTsroi,null);assert.equal(x.calculationComplete,false);
 const y=c.calculateTSROI({...good,annualHarm:0});assert.equal(y.harmPv,0);assert.equal(y.calculationComplete,true);
});
for(const value of [true,false,[],[1],{}])test(`non-number input ${JSON.stringify(value)} cannot impersonate neutral`,()=>{
 const x=c.calculateTSROI({...good,annualHarm:value});assert.equal(x.status,'blocked');assert.equal(x.benefitPv,null);
 assert.equal(c.calculateFinalScore({mensch:value,planet:0,demokratie:0}).status,'unassessed');
});
test('finite individual inputs cannot overflow into an approved ratio',()=>{
 const x=c.calculateTSROI({...good,annualDirectBenefit:1e308,annualTransformativeBenefit:1e308});assert.equal(x.status,'blocked');assert.equal(x.rawTsroi,null);assert.match(x.gate.explanation,/geschlossen/);
});
test('low quality preserves correctly computed harm diagnostics without issuing a ratio',()=>{
 const x=c.calculateTSROI({...good,dataQuality:.1});assert.equal(x.tsroi,null);assert.equal(x.calculationComplete,true);assert.ok(Math.abs(x.harmPv-1000/1.05)<1e-9);
});
