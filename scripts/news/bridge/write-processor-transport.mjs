import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { DropboxTransport } from './dropbox.mjs';
import { bridgePath } from './contract.mjs';

export const PREVIOUS_TRANSPORT = 'processor-transport-20260911-5.json';
export const PROCESSOR_TRANSPORT = 'processor-transport-20260912-6.json';
export const PREVIOUS_SHA256 = 'd312a28081dec02d29e9a54fc3f22345386b321666ab0437b1782bb75b47fbe5';
const digest = text => createHash('sha256').update(text).digest('hex');

export function updateProbeContract(previousText, expectedHash = PREVIOUS_SHA256) {
  // Upgrade exactly the inspected immutable contract; an unknown predecessor
  // must be reviewed instead of silently changing another worker's policy.
  if (digest(previousText) !== expectedHash) throw Error('PROCESSOR_TRANSPORT_PREDECESSOR_CHANGED');
  const config = JSON.parse(previousText);
  config.schema_version = '4.1';
  config.version = '20260912-6';
  config.supersedes = PREVIOUS_TRANSPORT;
  config.probe_transport = {
    type: 'github_issue_probe', bridge_version: 1,
    scope: 'inert_capability_probe_only',
    job_id: 'preflight-<fresh unpredictable run id>',
    destination_filename: '<job_id>.probe.json',
    payload: { probe_id: '<job_id>', test_only: true },
    additional_payload_fields: false,
    editorial_outputs: 'encrypted_bridge_version_2_only',
    processor_reports: 'encrypted_bridge_version_2_only',
    proof: 'Fresh actual Actions BRIDGE_DELIVERED receipt plus identical Dropbox readback in the actual worker context. A probe alone does not attest scheduler readiness.',
  };
  config.fresh_preflight[2] = 'For the inert probe ONLY, use bridge_version=1 with exactly job_id, destination_filename=<job_id>.probe.json and payload={probe_id:job_id,test_only:true}. No personal data, article content, notes or credentials may occur in a probe. Encrypted v2 probes remain supported. The private key stays in GitHub secrets.';
  config.fresh_preflight[3] = 'Create the authorized GitHub issue with exactly [CHATGPT-BRIDGE] <probe_id> and the complete probe envelope. Read the issue body back and compare exact bytes before claiming success. Record its actual URL.';
  config.fresh_preflight[5] = 'If reading, authorized probe creation or write/readback fails: CHATGPT_DROPBOX_UNAVAILABLE; claim no jobs, move nothing, write no partial editorial output. Report exact missing capability.';
  config.context_modes.manual = config.context_modes.manual.replace('actual encrypted GitHub delivery receipt', 'actual GitHub probe delivery receipt (v1 inert probe or v2 encrypted probe)');
  config.change_reason = 'The receiver already permits only the exact inert v1 probe. Align the worker contract with that existing capability; editorial payloads and processor reports remain encrypted. No activation or health PASS is implied by this configuration update.';
  delete config.deployed_commit; // A configuration writer cannot attest a server deployment.
  return config;
}

export async function writeProcessorTransport(transport) {
  const previousText = await transport.read(bridgePath('98_CONFIG', PREVIOUS_TRANSPORT));
  const config = updateProbeContract(previousText);
  const destination = bridgePath('98_CONFIG', PROCESSOR_TRANSPORT);
  const expected = `${JSON.stringify(config, null, 2)}\n`;
  await transport.writeAtomic(destination, config);
  if (await transport.read(destination) !== expected) throw Error('PROCESSOR_TRANSPORT_READBACK_MISMATCH');
  return { status: 'CONFIG_VERIFIED', file: PROCESSOR_TRANSPORT, sha256: digest(expected), bytes: Buffer.byteLength(expected), processor_available: false };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const env = process.env;
  if (env.GITHUB_REF !== 'refs/heads/main') throw Error('PROCESSOR_TRANSPORT_TRUSTED_REF_REQUIRED');
  for (const name of ['DROPBOX_APP_KEY', 'DROPBOX_APP_SECRET', 'DROPBOX_REFRESH_TOKEN']) {
    if (!env[name]) throw Error('PROCESSOR_TRANSPORT_CREDENTIALS_REQUIRED');
  }
  const transport = new DropboxTransport({ credentials: { app_key: env.DROPBOX_APP_KEY, app_secret: env.DROPBOX_APP_SECRET, refresh_token: env.DROPBOX_REFRESH_TOKEN } });
  console.log(JSON.stringify(await writeProcessorTransport(transport)));
}
