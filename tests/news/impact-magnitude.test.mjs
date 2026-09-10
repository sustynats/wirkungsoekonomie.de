import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMagnitude, pathwayMagnitudeErrors, aggregateMainPaths, FACTOR_KEYS } from '../../scripts/news/impact-magnitude.mjs';
const factors = values => Object.fromEntries(FACTOR_KEYS.map((key,i)=>[key,{value:values[i],rationale:'Synthetische Testannahme für diesen konkreten Wirkungsraum.',source_ids:['fixture']} ]));
const path = (direction, magnitude, extra={}) => ({ direction, magnitude, material:true, same_target:true, same_baseline:true, ...extra });

test('six-factor thresholds use exact sums, equal weights and no likelihood or evidence multiplier',()=>{
  for(const [sum,expected] of [[0,0],[1,1],[8,1],[9,2],[14,2],[15,3],[20,3],[21,4],[26,4],[27,5],[30,5]]) {
    let left=sum;const values=FACTOR_KEYS.map(()=>{const v=Math.min(5,left);left-=v;return v});
    const result=calculateMagnitude(factors(values));assert.equal(result.raw,sum/6);assert.equal(result.final,expected);
    assert.equal(calculateMagnitude(factors(values),{likelihood:'very_low',evidence:'low'}).final,expected);
  }
  assert.throws(()=>calculateMagnitude(factors([5,4,null,4,4,5])),/FACTORS_REQUIRED/);
});

test('a documented severe boundary cannot be averaged down by small reach',()=>{
  const p=path('negative',4,{temporal_status:'ex_post',magnitude_factors:factors([1,5,4,5,1,1]),
    protection_boundary:{decisive:true,rationale:'Die belegte Zustandsänderung verletzt das ausgewiesene Schutzgut irreversibel.',reference_frame:'Recht auf Leben und körperliche Unversehrtheit',source_ids:['fixture'],status:'observed'}});
  const sources=new Set(['fixture']);assert.deepEqual(pathwayMagnitudeErrors(p,sources),[]);
  assert.equal(calculateMagnitude(p.magnitude_factors).final,3);
  p.magnitude=3;assert.ok(pathwayMagnitudeErrors(p,sources).includes('IMPACT_MAGNITUDE_CALCULATION_MISMATCH'));
  p.magnitude=4;p.temporal_status='ex_ante';assert.ok(pathwayMagnitudeErrors(p,sources).includes('IMPACT_BOUNDARY_UNSUPPORTED'));
  p.protection_boundary.status='conditional';assert.deepEqual(pathwayMagnitudeErrors(p,sources),[]);
  p.protection_boundary.source_ids=['invented'];assert.ok(pathwayMagnitudeErrors(p,sources).includes('IMPACT_BOUNDARY_UNSUPPORTED'));
});

test('main paths determine balance and dominance without compensation by side risks',()=>{
  assert.deepEqual(aggregateMainPaths([path('open',4)]),{direction:'open',dominance:'none',magnitude:4,protection_boundary_decisive:false});
  assert.equal(aggregateMainPaths([path('negative',4),path('positive',3)]).dominance,'balanced');
  assert.equal(aggregateMainPaths([path('negative',4),path('positive',2)]).dominance,'dominant_negative');
  assert.equal(aggregateMainPaths([path('positive',5),path('negative',2)]).dominance,'dominant_positive');
  const result=aggregateMainPaths([path('positive',5),path('negative',4,{protection_boundary:{decisive:true}})]);
  assert.equal(result.direction,'negative');assert.equal(result.positive_paths_separate,true);
  assert.equal(result.magnitude,4,'the independent positive path neither compensates nor inflates the protected negative path');
  assert.throws(()=>aggregateMainPaths([path('negative',null)]),/MAIN_MAGNITUDE_REQUIRED/);
});

test('stored calculation is validated by values, independent of JSON property order',()=>{
  const p=path('negative',3,{temporal_status:'ex_ante',magnitude_factors:factors([3,3,3,3,3,3]),protection_boundary:{decisive:false,rationale:'Keine entscheidende Grenzverletzung im vorgegebenen Test.'}});
  p.magnitude_calculation=Object.fromEntries(Object.entries(calculateMagnitude(p.magnitude_factors)).reverse());
  assert.deepEqual(pathwayMagnitudeErrors(p,new Set(['fixture'])),[]);
  p.magnitude_calculation.raw=1;assert.ok(pathwayMagnitudeErrors(p,new Set(['fixture'])).includes('IMPACT_STORED_CALCULATION_MISMATCH'));
});
