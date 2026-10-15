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
  const parity = JSON.parse(fs.readFileSync('reports/academy-20261014/pdf-source-view-verification.json')).files;
  const contract = proof.compatible_render_contract ?? proof.render_contract;
  assert.equal(contract.length,4);
  for(const file of contract) assert.equal(createHash('sha256').update(fs.readFileSync(file.file)).digest('hex'),file.sha256,`PDF renderer contract changed: ${file.file}`);
  assert.equal(pdfs.length,7);
  for (const pdf of pdfs) {
    const row = rows.find(r=>r.lecture_id===pdf.lecture_id);assert.ok(row?.corrected);
    assert.equal(row.source_sha256,pdf.source_sha256);
    assert.ok(row.pdf_url.endsWith('/'+row.pdf));
    const binding=parity.find(x=>x.lecture_id===row.lecture_id);assert.equal(binding.pdf_sha256,pdf.sha256);
    const article=/<article class="section narrow">([\s\S]*?)<\/article>/.exec(fs.readFileSync(`${row.route}index.html`,'utf8'))[1];
    assert.equal(createHash('sha256').update(article).digest('hex'),binding.reader_article_sha256,'PDF article binding: '+row.lecture_id);
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


test('teaching labels and causal-chain assignments survive the metadata projection',()=>{
 const shown=learningScriptBody('# Lehre\n\n**lecture_id:** `X`\n**Produkt:** Gut.\n**Fehler:** Falsche Behauptung.\n**Korrektur:** Begründete Einordnung.\n**A:** Weiterbildung.\n**M:** Kompetenzzuwachs.\n**ΔZ:** Zustandsänderung.\n**R:** Gegenfaktum.\n**Arbeitsprodukt:** Ein Entscheidungsmemo.');
 assert.doesNotMatch(shown,/lecture_id/);
 for(const text of ['Gut.','Falsche Behauptung.','Begründete Einordnung.','Weiterbildung.','Kompetenzzuwachs.','Zustandsänderung.','Gegenfaktum.','Ein Entscheidungsmemo.'])assert.ok(shown.includes(text),text);
});
test('historical readers retain teaching and original routes without production scaffolding',async()=>{
 const {historicalPublicScriptBody,legacyParagraphFingerprint,historicalHtmlText}=await import('../../scripts/studienskripte/legacy-public-script.mjs');
 assert.notEqual(legacyParagraphFingerprint('A < B'),legacyParagraphFingerprint('A > B'));
 const cleaned=historicalPublicScriptBody('# Lehre\n## 3. Transkript (Gerüst)\nEine Scorecard ist ein Profil.\nDer Produktionsstandort ist ein Wirkungsraum.\n### 4.5 Chart-Spec\n```chart-spec\npreferred_asset: internal.svg\n```\n## V1-Finalisierung: Vertiefung\nWirkung bleibt relational.\n## 7. Tiefenskript-Erweiterung Sprint 9\nEin sinnvolles Beispiel.');
 assert.match(cleaned,/Eine Scorecard ist ein Profil/);assert.match(cleaned,/Der Produktionsstandort ist ein Wirkungsraum/);assert.match(cleaned,/Wirkung bleibt relational/);assert.match(cleaned,/Ein sinnvolles Beispiel/);assert.doesNotMatch(cleaned,/chart-spec|preferred_asset|Gerüst|Finalisierung|Sprint 9/i);
 const legacyAnchors=JSON.parse(fs.readFileSync('content/studienskripte/legacy-public-anchors.json')).readers;
 const legacy=JSON.parse(fs.readFileSync('content/studienskripte/index.json')).scripts.filter(x=>x.editorialStatus==='freigegeben');assert.equal(legacy.length,49);
 for(const row of legacy){const page=fs.readFileSync(`${row.publicPath}index.html`,'utf8');const oldParagraphs=new Map(legacyAnchors[row.slug].paragraphs.map(x=>[x.id,x]));for(const [,id,text]of page.matchAll(/<p\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/p>/g)){if(oldParagraphs.has(id))assert.equal(legacyParagraphFingerprint(historicalHtmlText(text)),oldParagraphs.get(id).fingerprint,`${row.slug}: retained paragraph #${id}`);}for(const id of legacyAnchors[row.slug].ids)assert.ok(page.includes(`id="${id}"`),`${row.slug}: retained #${id}`);assert.match(page,/Historische Lesefassung/);assert.match(page,/name="robots" content="noindex,follow"/);assert.match(page,/href="..\/v4\/"/);const visible=page.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,' ');assert.doesNotMatch(visible,/\bProduktionsstand\b|redaktionell freigegeben|Chart-Spec|Transkript \(Gerüst\)|Erklärgerüst|V1-Finalisierung|V1-Abschlussnotiz|Tiefenskript-Erweiterung Sprint|CorrectAnswer|App-Lane|Reader\/PDF\s+sollte|WÖK-CI-PDF/i);}
});
