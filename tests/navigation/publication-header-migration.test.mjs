import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {verifyPublicationHeaderMigration} from '../../scripts/lib/publication-header-migration.mjs';
const hash = text => crypto.createHash('sha256').update(text).digest('hex');

test('publication source extraction accepts only the header and the fixed import', () => {
  const before='const rate=20;\nconst page=`<header class="site-header"><a href="${base}index.html">Start</a></header><main>Fachlicher Inhalt</main>`;\n';
  const after="import {renderSiteHeader} from '../lib/site-shell.mjs';\n"+before.replace(/<header[\s\S]*?<\/header>/,"${renderSiteHeader(base, 'de')}");
  const record={beforeSha256:hash(before),afterSha256:hash(after)};
  assert.equal(verifyPublicationHeaderMigration(before,after,record),true);
  for(const changed of [after.replace('rate=20','rate=21'),after.replace('Fachlicher Inhalt','Anderer Inhalt'),after+'\nconst extra=1;']) {
    assert.equal(verifyPublicationHeaderMigration(before,changed,{...record,afterSha256:hash(changed)}),false);
  }
  assert.equal(verifyPublicationHeaderMigration(before,after,{...record,beforeSha256:'0'.repeat(64)}),false);
});

test('the original matches the leading PDF source and its explicit historical succession', () => {
  const source='scripts/portal/build-impact-controlling.mjs';
  const migration=JSON.parse(fs.readFileSync('assets/data/navigation-source-migrations-2026-10-10.json','utf8')).sources[source];
  const leading=JSON.parse(fs.readFileSync('assets/data/learning-editions-2026-09-06.json','utf8'));
  const historical=JSON.parse(fs.readFileSync('assets/data/site-review-pdf-editions.json','utf8'));
  assert.equal(leading.sourceHashes[source],migration.beforeSha256);
  assert.ok(leading.supersedesSources.includes(source));
  assert.match(historical.sourceHashes[source],/^[a-f0-9]{64}$/);
  assert.equal(verifyPublicationHeaderMigration(fs.readFileSync(migration.originalSource,'utf8'),fs.readFileSync(source,'utf8'),migration),true);
});
