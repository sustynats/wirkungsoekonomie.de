import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderCorePriceSections} from '../../scripts/lib/core-price-reader.mjs';
import {findPublicEditorialResidue} from '../../scripts/lib/public-editorial-cleanup.mjs';

const source=fs.readFileSync(new URL('../../content/grundlagen/WOEK_KERNREFERENZ.md', import.meta.url),'utf8');

test('price reader retains both mechanisms, references and financial limits with real list structure',()=>{
  const html=renderCorePriceSections(source);
  assert.ok(html.includes('<ul>'));
  assert.equal((html.match(/<li>/g)||[]).length,2);
  for(const term of ['Differenzierte Wirkungsbelastung:','Aktive Entlastung durch den Wirkungsfonds:',
    '§§ 61 und 100','§ 10 Absatz 1','Derselbe Euro wird nicht gleichzeitig','keine vollständige Schadensfreiheit',
    'kein negativer Mehrwertsteuersatz','Null zusätzliche Wirkungssteuer ist noch keine Preissenkung'])
    assert.ok(html.includes(term),term);
  assert.deepEqual(findPublicEditorialResidue(html),[]);
  assert.ok(source.includes('Für das vom Nutzer festgelegte Produktbeispiel'));
});

test('changed or duplicate primary-source passages require a new review',()=>{
  assert.throws(()=>renderCorePriceSections(source.replace('Für den zuletzt festgelegten Umsetzungspfad','Für einen anderen Umsetzungspfad')),/wording changed/);
  assert.throws(()=>renderCorePriceSections(source+'\n### 9.1 Widerspruch\n'),/ambiguous/);
  assert.throws(()=>renderCorePriceSections(source.replace('### 9.3 ','### 9.7 ')),/Missing/);
});

test('public gate rejects internal user and implementation wording while keeping model and legal status',()=>{
  assert.equal(findPublicEditorialResidue('<p>Für das vom Nutzer festgelegte Produktbeispiel</p>').length,1);
  assert.equal(findPublicEditorialResidue('<p>Für den zuletzt festgelegten Umsetzungspfad</p>').length,1);
  assert.deepEqual(findPublicEditorialResidue('<p>Das Lernmodell ist kein geltender Steuertarif. Die rechtliche Gestaltung ist offen.</p>'),[]);
});
