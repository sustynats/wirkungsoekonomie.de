import test from 'node:test';
import assert from 'node:assert/strict';
import {assertsRealisedExAnteEffect} from '../../scripts/news/lib.mjs';
test('a model condition is not an observed effect, but the same assertion in an outcome remains checked',()=>{
 const text='Die Forderung führt zu konkreten parlamentarischen Entscheidungen.';
 const analysis={impact_assessment:{dimensions:{democracy:{primary_paths:[{condition:text}]}}}};
 assert.equal(assertsRealisedExAnteEffect(analysis),false);
 assert.equal(analysis.impact_assessment.dimensions.democracy.primary_paths[0].condition,text);
 analysis.impact_assessment.dimensions.democracy.primary_paths[0].rationale=text;
 assert.equal(assertsRealisedExAnteEffect(analysis),true);
 assert.equal(assertsRealisedExAnteEffect({summary:text}),true);
});
test('modelled path assumptions are not mistaken for observed outcomes',()=>{
 const analysis={impact_assessment:{dimensions:{human:{primary_paths:[{assumptions:'Öffentliche Debatte führt zu höherer Aufmerksamkeit für Finanzierungsregeln.'}]}}}};
 assert.equal(assertsRealisedExAnteEffect(analysis),false);
 assert.equal(analysis.impact_assessment.dimensions.human.primary_paths[0].assumptions.includes('führt zu'),true);
 analysis.impact_assessment.dimensions.human.primary_paths[0].rationale='Die Maßnahme hat die Kosten reduziert.';
 assert.equal(assertsRealisedExAnteEffect(analysis),true);
});
test('an explicit denial of realised transformation does not reject an ex ante assessment',()=>{
 assert.equal(assertsRealisedExAnteEffect({transformation_potential:'Bei wirksamer Umsetzung können Unterstützungsstrukturen verbessert werden; die aktuelle Ankündigung allein bewirkt diese Transformation noch nicht.'}),false);
});
test('negation cannot excuse a realised causal assertion elsewhere',()=>{
 for(const text of ['Die Maßnahme bewirkt nicht nur eine Entlastung.','Die Ankündigung bewirkt die Transformation noch nicht. Das Gesetz führt zu höheren Einkommen.','Die Ankündigung bewirkt die Transformation noch nicht, aber die Maßnahme hat die Kosten reduziert.'])assert.equal(assertsRealisedExAnteEffect({rationale:text}),true,text);
});

test('an explicitly negligible pathway does not claim that its effect happened',()=>{
 const text='Der Pfad kann folgenlos bleiben, wenn keine weiteren Informationen veröffentlicht werden oder die Veröffentlichung keine Zustandsänderung bewirkt.';
 const analysis={impact_assessment:{dimensions:{democracy:{primary_paths:[{negligibility_rationale:text}]}}}};
 assert.equal(assertsRealisedExAnteEffect(analysis),false);
 assert.equal(analysis.impact_assessment.dimensions.democracy.primary_paths[0].negligibility_rationale,text);
 for(const text of ['Solange die Maßnahme keine beobachtete Verbesserung bewirkt.', 'Falls der Eingriff keinen messbaren Rückgang bewirkt.', 'Wenn die Änderung keinerlei Wirkung entfaltet.'])assert.equal(assertsRealisedExAnteEffect({rationale:text}),false,text);
});
test('a denied effect never exempts a separate effect or a double negation',()=>{
 for(const text of [
  'Die Veröffentlichung bewirkt höhere Beteiligung, während die Frist keine Zustandsänderung bewirkt.',
  'Obwohl die Frist keine Zustandsänderung bewirkt, bewirkt die Veröffentlichung höhere Beteiligung.',
  'Die Änderung bewirkt eine Verbesserung und bewirkt höhere Beteiligung, während die Frist keine Zustandsänderung bewirkt.',
  'Kein Zweifel: Die Veröffentlichung bewirkt höhere Beteiligung.',
  'Die Änderung bewirkt nicht nur eine Verbesserung.',
  'Die Änderung hat die Kosten reduziert.',
  'Es stimmt nicht, dass die Veröffentlichung nicht keine Zustandsänderung bewirkt.',
 ])assert.equal(assertsRealisedExAnteEffect({rationale:text}),true,text);
});
