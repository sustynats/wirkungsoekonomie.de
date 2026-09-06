import fs from 'node:fs';
import crypto from 'node:crypto';
const manifest=JSON.parse(fs.readFileSync('assets/data/site-review-pdf-editions.json','utf8'));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if(manifest.files.length!==8 || !manifest.sourceHashes)throw new Error('Incomplete dated PDF release manifest');
const learning=JSON.parse(fs.readFileSync('assets/data/learning-editions-2026-09-06.json','utf8'));
if(learning.files.length!==2 || Object.keys(learning.sourceHashes).length<6) throw new Error('Learning editions incomplete');
const model=JSON.parse(fs.readFileSync('assets/data/model-explainer-edition-2026-09-06-v1-1.json','utf8'));
for(const [source,expected] of Object.entries(model.sourceHashes))if(hash(source)!==expected)throw new Error(`Model explainer PDF source changed: ${source}`);
for(const source of model.supersedesSources)if(!learning.sourceHashes[source]||!model.sourceHashes[source])throw new Error(`Invalid model source succession: ${source}`);
for(const edition of model.files)if(!edition.url.startsWith(`https://github.com/sustynats/wirkungsoekonomie.de/releases/download/${model.releaseTag}/`) || !/^[a-f0-9]{64}$/.test(edition.sha256) || edition.pages<1 || !learning.files.some(item=>item.filename===edition.supersedes))throw new Error('Invalid model edition metadata');
console.log('Model introduction v1.1: explicit source succession, prior edition preserved.');
for(const [source,expected] of Object.entries(learning.sourceHashes)) {
 if(model.supersedesSources.includes(source))continue;
 if(hash(source)!==expected) throw new Error(`Learning PDF source changed: ${source}. Publish a new dated edition.`);
}
for(const source of learning.supersedesSources) {
 if(!learning.sourceHashes[source] || !manifest.sourceHashes[source]) throw new Error(`Invalid source succession: ${source}`);
}
for(const edition of learning.files) {
 if(!edition.url.startsWith(`https://github.com/sustynats/wirkungsoekonomie.de/releases/download/${learning.releaseTag}/`) || !/^[a-f0-9]{64}$/.test(edition.sha256) || edition.sha256==='0'.repeat(64) || edition.pages<1) throw new Error('Invalid learning edition release metadata');
 if(edition.supersedes&&!manifest.files.some(item=>item.filename===edition.supersedes)) throw new Error('Missing historical predecessor');
}
console.log('Learning editions: 2 current PDFs, source succession and immutable metadata consistent.');
for(const source of manifest.sources) {
  // Historical release keeps its original manifest. Only explicitly replaced
  // live sources move to the new edition guard above; other guards stay active.
  if(learning.supersedesSources.includes(source)) continue;
  if(hash(source)!==manifest.sourceHashes[source])throw new Error(`PDF content changed: ${source}. Publish a new dated PDF edition and update its manifest before deployment.`);
}
for(const edition of manifest.files) {
  if(edition.source && hash(edition.source)!==edition.sourceSha256)throw new Error(`Historical PDF changed: ${edition.source}. Review the reading edition against the new source.`);
  if(!edition.url.startsWith(`https://github.com/sustynats/wirkungsoekonomie.de/releases/download/${manifest.releaseTag}/`) || !/^[a-f0-9]{64}$/.test(edition.sha256) || edition.pages<1)throw new Error(`Invalid PDF release metadata: ${edition.filename}`);
}
console.log('Dated PDFs: 8 editions, source contents and immutable release metadata consistent.');
const erratum=JSON.parse(fs.readFileSync('assets/data/publication-erratum-2026-09-06.json','utf8'));
for(const [source,expected] of Object.entries({...erratum.sourceHashes,...erratum.originalHashes})) {
  if(hash(source)!==expected)throw new Error(`Publication erratum source changed: ${source}. Publish a new dated erratum before deployment.`);
}
if(!erratum.url.startsWith(`https://github.com/sustynats/wirkungsoekonomie.de/releases/download/${erratum.releaseTag}/`) || !/^[a-f0-9]{64}$/.test(erratum.sha256) || erratum.pages<1)throw new Error('Invalid publication erratum metadata');
console.log('Additional historical-paper erratum: source contents and original PDF hashes consistent.');

const state=JSON.parse(fs.readFileSync('assets/data/state-benchmark-edition-2026-09-06.json','utf8'));
for(const [source,expected] of Object.entries(state.sourceHashes))if(hash(source)!==expected)throw new Error(`State benchmark PDF source changed: ${source}`);
for(const edition of state.files)if(!edition.url.includes(`/releases/download/${state.releaseTag}/`) || !/^[a-f0-9]{64}$/.test(edition.sha256) || edition.pages<1)throw new Error('Invalid state benchmark edition');
console.log('State benchmark PDF: immutable metadata and shared website content consistent.');
