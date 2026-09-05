import fs from 'node:fs';
import crypto from 'node:crypto';
const manifest=JSON.parse(fs.readFileSync('assets/data/site-review-pdf-editions.json','utf8'));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if(manifest.files.length!==8 || !manifest.sourceHashes)throw new Error('Incomplete dated PDF release manifest');
for(const source of manifest.sources) {
  if(hash(source)!==manifest.sourceHashes[source])throw new Error(`PDF content changed: ${source}. Publish a new dated PDF edition and update its manifest before deployment.`);
}
for(const edition of manifest.files) {
  if(edition.source && hash(edition.source)!==edition.sourceSha256)throw new Error(`Historical PDF changed: ${edition.source}. Review the reading edition against the new source.`);
  if(!edition.url.startsWith(`https://github.com/sustynats/wirkungsoekonomie.de/releases/download/${manifest.releaseTag}/`) || !/^[a-f0-9]{64}$/.test(edition.sha256) || edition.pages<1)throw new Error(`Invalid PDF release metadata: ${edition.filename}`);
}
console.log('Dated PDFs: 8 editions, source contents and immutable release metadata consistent.');
