import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const context=vm.createContext({});
vm.runInContext(fs.readFileSync('assets/js/kitchen-impact.js','utf8'),context);
vm.runInContext(fs.readFileSync('assets/js/impact-calculations.js','utf8'),context);
const calc=context.WoekKitchenImpact.calculateKitchen;
const base={before:100,after:60,comparisonBefore:100,comparisonAfter:90,days:180};
test('comparison separates observation and additional estimate',()=>{const r=calc(base);assert.equal(r.observed,40);assert.equal(r.additional,30);assert.equal(r.annual,5400);assert.equal(r.relative,40);});
test('identical trends yield no attributable difference',()=>{const r=calc({...base,comparisonAfter:60});assert.equal(r.additional,0);assert.equal(r.annual,0);});
test('adverse additional change keeps its sign',()=>{const r=calc({...base,after:95});assert.equal(r.additional,-5);assert.equal(r.annual,-900);});
test('zero baseline has no relative percentage',()=>assert.equal(calc({...base,before:0}).relative,null));
test('invalid and incomplete observations never become zero',()=>{for(const value of ['',null,undefined,NaN,Infinity,-1,1000001,'text'])assert.equal(calc({...base,after:value}).valid,false);});
test('annual projection needs a plausible whole number of days',()=>{for(const days of [0,367,1.5,''])assert.equal(calc({...base,days}).valid,false);assert.equal(calc({...base,days:366}).valid,true);});
test('course money example agrees with the existing T-SROI standard',()=>{
 const r=context.WoekImpactCalculations.calculateTSROI({investment:6000,annualDirectBenefit:16200,annualTransformativeBenefit:0,annualHarm:1000,annualOperatingCost:2000,years:1,benefitDiscountRate:.05,costDiscountRate:.05,attribution:1,deadweight:0,displacement:0,uncertainty:.2,scores:{mensch:0,planet:2,demokratie:0},dataQuality:.8,systemBoundaryDefined:true,attributionDefined:true});
 assert.equal(r.gate.passed,true);assert.ok(Math.abs(r.ioi-1.8313253012)<1e-8);assert.equal(r.tsroi,r.ioi);assert.ok(Math.abs(r.lowerNetBenefitPv-11390.476190476)<1e-8);
});
