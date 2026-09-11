import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DropboxTransport, loadDropboxCredentials } from './dropbox.mjs';
import { bridgePath, hash } from './contract.mjs';
import { PROCESSOR_VERSION, PROCESSOR_CONTRACT, PROCESSOR_SHARDS, PREFLIGHT_FOLDERS } from './processor.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const config = { version: PROCESSOR_VERSION, base_contract: 'contract-2026-09-10-bridge-3.json',
  activation: 'requires_verified_preflight_in_each_actual_automation_context',
  shards: PROCESSOR_SHARDS, assignment: 'unsigned_big_endian_sha256_utf8_full_job_id_modulo_3',
  preflight_folders: PREFLIGHT_FOLDERS, max_jobs: 10, run_budget_minutes: 20, reserve_minutes: 2,
  queue_warning_above: 10, queue_critical_above: 20,
  instructions: fs.readFileSync(new URL('../../../docs/news/BRIDGE-PROCESSORS.md', import.meta.url), 'utf8'),
  reference_implementation: fs.readFileSync(new URL('./processor.mjs', import.meta.url), 'utf8') };
const transport = new DropboxTransport({ credentials: loadDropboxCredentials(process.env.WOEK_NEWS_DROPBOX_CREDENTIALS, root) });
await transport.writeAtomic(bridgePath('98_CONFIG', PROCESSOR_CONTRACT), config);
console.log(JSON.stringify({ file: PROCESSOR_CONTRACT, sha256: hash(config) }));
