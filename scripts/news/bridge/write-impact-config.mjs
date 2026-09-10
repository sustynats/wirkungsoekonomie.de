import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DropboxTransport, loadDropboxCredentials } from './dropbox.mjs';
import { bridgePath, hash } from './contract.mjs';
import { impactOutputSchema } from './impact.mjs';
import { semanticOutputSchema } from './semantic-review.mjs';
import { IMPACT_SCHEMA, IMPACT_DEFS, IMPACT_RULE, IMPACT_CONTRACT_FILE } from '../impact-assessment.mjs';
import { SEMANTIC_CHECKS } from '../impact-publication.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const config = {
  schema_version: '2.1', version: 'impact-assessment-contract-2.1-potential-1',
  base_contract: 'contract-2026-09-10-bridge-3.json',
  compatibility: 'Immutable old inputs and contracts retain their hashes. New impact jobs change only versioned impact metadata. Existing news, sources and personal author text stay intact.',
  native_analysis_shape: IMPACT_SCHEMA, $defs: IMPACT_DEFS, rules: IMPACT_RULE,
  job_types: { impact_reassessment: { output_schema: impactOutputSchema }, impact_semantic_review: { output_schema: semanticOutputSchema, checks: SEMANTIC_CHECKS } },
  instructions: fs.readFileSync(new URL('../../../docs/news/IMPACT-SEMANTICS-2.1.md', import.meta.url), 'utf8'),
};
if (process.argv.includes('--dry-run')) console.log(JSON.stringify({ file: IMPACT_CONTRACT_FILE, sha256: hash(config), config }, null, 2));
else {
  const transport = new DropboxTransport({ credentials: loadDropboxCredentials(process.env.WOEK_NEWS_DROPBOX_CREDENTIALS, root) });
  await transport.writeAtomic(bridgePath('98_CONFIG', IMPACT_CONTRACT_FILE), config);
  console.log(JSON.stringify({ file: IMPACT_CONTRACT_FILE, sha256: hash(config) }));
}
