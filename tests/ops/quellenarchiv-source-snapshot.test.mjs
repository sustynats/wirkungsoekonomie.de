import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {loadSourceSnapshot} from '../../scripts/quellenarchiv/source-snapshot.mjs';

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-source-snapshot-'));
  t.after(() => fs.rmSync(dir, {recursive:true, force:true}));
  const snapshotPath = path.join(dir, 'sources.json');
  const original = '{"sources":[{"code":"Q-1","title":"Geprüfte Quelle"}]}\n';
  fs.writeFileSync(snapshotPath, original);
  const warnings = [];
  const logger = {log(){}, warn(value){warnings.push(value);}};
  const validate = data => {
    const ids = new Set();
    for (const source of data.sources) {
      if (!source.code || ids.has(source.code)) throw Error('SOURCE_ID_INVALID');
      ids.add(source.code);
    }
    return {...data, checked:true};
  };
  return {dir,snapshotPath,original,warnings,logger,validate,refresh:true,apiUrl:'https://example.test/sources'};
}

test('invalid API IDs never replace the valid snapshot; fallback remains validated', async t => {
  for (const sources of [[{code:''}], [{code:'Q-2'},{code:'Q-2'}]]) {
    const f = fixture(t);
    const result = await loadSourceSnapshot({...f, fetchImpl:async()=>({ok:true,json:async()=>({sources})})});
    assert.equal(result.checked,true);
    assert.equal(result.sources[0].code,'Q-1');
    assert.equal(fs.readFileSync(f.snapshotPath,'utf8'),f.original);
    assert.deepEqual(fs.readdirSync(f.dir),['sources.json']);
    assert.match(f.warnings[0],/SOURCE_ID_INVALID/);
  }
});

test('valid refresh persists original API data only after the complete validation succeeds', async t => {
  const f = fixture(t), incoming = {sources:[{code:'Q-1'},{code:'Q-2'}]};
  let validationCalls = 0;
  const result = await loadSourceSnapshot({...f,
    fetchImpl:async()=>({ok:true,json:async()=>incoming}),
    validate(data){validationCalls++;assert.equal(fs.readFileSync(f.snapshotPath,'utf8'),f.original);return f.validate(data);},
  });
  assert.equal(validationCalls,1);assert.equal(result.checked,true);
  assert.deepEqual(JSON.parse(fs.readFileSync(f.snapshotPath,'utf8')),incoming);
  assert.deepEqual(fs.readdirSync(f.dir),['sources.json']);
  assert.equal(f.warnings.length,0);
});

test('failed enrichment also preserves the original, not just syntactically invalid responses', async t => {
  const f=fixture(t);
  const result=await loadSourceSnapshot({...f,
    fetchImpl:async()=>({ok:true,json:async()=>({sources:[{code:'Q-2'}]})}),
    validate(data){if(!data.sources.some(s=>s.code==='Q-1'))throw Error('SUPPLEMENT_UNKNOWN_SOURCE');return f.validate(data);},
  });
  assert.equal(result.sources[0].code,'Q-1');
  assert.equal(fs.readFileSync(f.snapshotPath,'utf8'),f.original);
  assert.match(f.warnings[0],/SUPPLEMENT_UNKNOWN_SOURCE/);
});

test('offline build performs no request, and invalid or missing fallback still fails', async t => {
  const f=fixture(t);
  const result=await loadSourceSnapshot({...f,refresh:false,fetchImpl(){throw Error('UNEXPECTED_FETCH');}});
  assert.equal(result.checked,true);
  fs.writeFileSync(f.snapshotPath,'{"sources":[{}]}');
  await assert.rejects(loadSourceSnapshot({...f,fetchImpl:async()=>({ok:false,status:503})}),/SOURCE_ID_INVALID/);
  fs.unlinkSync(f.snapshotPath);
  await assert.rejects(loadSourceSnapshot({...f,fetchImpl:async()=>({ok:false,status:503})}),/ENOENT/);
});
