import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hasNegationNear,cleanClaimHtml} from '../../scripts/review/claim-negation.mjs';
const pattern=/Reichweite\s*(?:=|ist)\s*Wirkung/gi;
const findings=html=>{const text=cleanClaimHtml(html);return [...text.matchAll(pattern)].filter(m=>!hasNegationNear(text,m.index,m.index+m[0].length));};
test('explicitly rejected misconceptions in teaching are not asserted definitions',()=>{
 for(const rejection of ['Falsch.','Nein.'])assert.equal(findings(`<h3>„Reichweite = Wirkung.“</h3><p>${rejection}</p>`).length,0);
});
test('navigation labels do not duplicate a counterexample without its rejection',()=>{
 assert.equal(findings('<nav><a>Reichweite = Wirkung</a></nav><h3>Reichweite = Wirkung.</h3><p>Falsch.</p>').length,0);
});
test('actual contradictions remain blocked, even if another section calls something false',()=>{
 assert.equal(findings('<p>Reichweite ist Wirkung.</p>').length,1);
 assert.equal(findings('<p>Reichweite ist Wirkung. Jede erreichte Person bestätigt damit bereits den Erfolg einer Maßnahme. Das ist unsere Definition.</p><p>Falsch ist allein die fehlende Dokumentation.</p>').length,1);
 assert.equal(findings('<nav>Reichweite ist Wirkung</nav><p>Reichweite ist Wirkung.</p>').length,1);
});
