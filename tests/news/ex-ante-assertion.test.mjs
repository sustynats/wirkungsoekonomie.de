import test from 'node:test';
import assert from 'node:assert/strict';
import {assertsRealisedExAnteEffect} from '../../scripts/news/lib.mjs';
test('an explicit denial of realised transformation does not reject an ex ante assessment',()=>{
 assert.equal(assertsRealisedExAnteEffect({transformation_potential:'Bei wirksamer Umsetzung können Unterstützungsstrukturen verbessert werden; die aktuelle Ankündigung allein bewirkt diese Transformation noch nicht.'}),false);
});
test('negation cannot excuse a realised causal assertion elsewhere',()=>{
 for(const text of ['Die Maßnahme bewirkt nicht nur eine Entlastung.','Die Ankündigung bewirkt die Transformation noch nicht. Das Gesetz führt zu höheren Einkommen.','Die Ankündigung bewirkt die Transformation noch nicht, aber die Maßnahme hat die Kosten reduziert.'])assert.equal(assertsRealisedExAnteEffect({rationale:text}),true,text);
});
