import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { publicScriptBody, learningScriptBody } from '../../scripts/academy/lib/public-script.mjs';
const rows = JSON.parse(fs.readFileSync('content/academy/v4-reader-publication.json')).readers;

test('all canonical scripts have a reader, source hash, unique route and valid local anchors', () => {
  assert.equal(rows.length, 178);assert.equal(new Set(rows.map(r=>r.route)).size,178);
  for (const row of rows) {
    const source = fs.readFileSync(row.source);
    assert.equal(createHash('sha256').update(source).digest('hex'),row.source_sha256,row.lecture_id);
    const html = fs.readFileSync(`${row.route}index.html`,'utf8');
    const article = /<article class="section narrow">([\s\S]*?)<\/article>/.exec(html)?.[1];
    assert.ok(article,row.lecture_id);
    assert.doesNotMatch(article,/NOT_PUBLICLY_ESTABLISHED|NOT_ASSESSED|FACH_ENDCONTENT|change_reason|document_status\s*=|CorrectAnswer|correct_answer|\*\*lecture_id/);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    for(const [,anchor] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(anchor),`${row.lecture_id}: #${anchor}`);
  }
});
test('seven corrected PDF editions are linked to their exact source identities', () => {
  const proof = JSON.parse(fs.readFileSync('reports/academy-20261014/pdf-build.json'));
  const pdfs = proof.files;
  assert.equal(proof.render_contract.length,4);
  for(const file of proof.render_contract) assert.equal(createHash('sha256').update(fs.readFileSync(file.file)).digest('hex'),file.sha256,`PDF renderer contract changed: ${file.file}`);
  assert.equal(pdfs.length,7);
  for (const pdf of pdfs) {
    const row = rows.find(r=>r.lecture_id===pdf.lecture_id);assert.ok(row?.corrected);
    assert.equal(row.source_sha256,pdf.source_sha256);
    assert.ok(row.pdf_url.endsWith('/'+row.pdf));
  }
});
test('protected questions never enter a public reader, while source-function teaching survives', () => {
  const source = '# Datenwelten und Quellenfunktionen\n\n## Einstieg\nBeobachtung ist keine Attribution.\n\n## Quiz mit Lösungen\nSECRET_ANSWER\n### Details\nSECRET_KEY\n\n## Quellen\nPrimärquelle.\n';
  const publicBody=publicScriptBody(source);assert.doesNotMatch(publicBody,/SECRET/);
  const display=learningScriptBody(publicBody);assert.match(display,/^# Datenwelten und Quellenfunktionen/);assert.match(display,/Beobachtung ist keine Attribution/);assert.match(display,/Primärquelle/);
});

test('source-function teaching survives while internal state labels become public language',()=>{
  const body=learningScriptBody('# Wirkungssprache\n\n## 3. Quellenfunktion\nEin Gesetz belegt seinen Inhalt, nicht seine Wirkung.\n\n## eNAP\nNOT_PUBLICLY_ESTABLISHED ist nicht NOT_ASSESSED.');
  assert.match(body,/Ein Gesetz belegt seinen Inhalt/);
  assert.match(body,/öffentlich nicht belegt ist nicht nicht geprüft/);
  assert.doesNotMatch(body,/NOT_PUBLICLY|NOT_ASSESSED/);
});
