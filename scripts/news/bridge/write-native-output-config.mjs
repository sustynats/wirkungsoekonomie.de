import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { DropboxTransport } from './dropbox.mjs';
import { bridgePath } from './contract.mjs';

export const PREVIOUS_NATIVE_TRANSPORT = 'processor-transport-20260912-6.json';
export const NATIVE_TRANSPORT = 'processor-transport-20260912-7.json';
export const NATIVE_PREDECESSOR_SHA256 = 'f166117f83f10403bf39630de4dd23c708247b3af33021a1572b4cf7db65e1e8';
const digest = text => createHash('sha256').update(text).digest('hex');

export function nativeOutputContract(previousText, expectedHash = NATIVE_PREDECESSOR_SHA256) {
  if (digest(previousText) !== expectedHash) throw Error('PROCESSOR_TRANSPORT_PREDECESSOR_CHANGED');
  const config = JSON.parse(previousText);
  const encryptedFallback = config.output_transport;
  config.schema_version = '4.2';
  config.version = '20260912-7';
  config.supersedes = PREVIOUS_NATIVE_TRANSPORT;
  config.output_transport = {
    type: 'native_dropbox_file_preferred',
    destination: '20_OUTPUT_READY/<job_id>.output.json',
    max_payload_bytes: encryptedFallback.max_payload_bytes,
    file_parameter: 'Use only the native upload tool file parameter for the actual completed conversation file. Never construct a download URL or file object. Keep exact original bytes and SHA256.',
    privacy: 'The complete JSON goes only to the existing private Dropbox bridge. Never place article plaintext or personal notes in GitHub, a public link, or an unrelated service.',
    integrity: 'After upload, require matching file size and a byte-identical download SHA256 or the Dropbox content_hash computed from the unchanged original. Merely seeing a filename or title is insufficient.',
    duplicate_rule: 'Freshly verify ACK, target absence, own original/repair claim and input_hash immediately before upload. Never overwrite existing output. An identical existing target can be verified without writing; different content is a conflict.',
    safety_rule: 'A tool safety/approval rejection stops external delivery of that specific output. Preserve it privately and report the real rejection. Do not retry it through the encrypted fallback or another route.',
    encrypted_fallback: encryptedFallback,
    fallback_scope: 'Existing encrypted v2 issue transport remains available only when native file upload is unavailable, not to circumvent a safety rejection. Transfer exact encoder bytes; no reconstructed or truncated ciphertext.',
  };
  config.probe_transport.editorial_outputs = 'native_private_dropbox_file_or_encrypted_bridge_version_2';
  config.probe_transport.native_file_probe = {
    destination: '20_OUTPUT_READY/<probe_id>.probe.json',
    payload: { probe_id: '<fresh probe_id>', test_only: true },
    rule: 'Use a freshly created actual conversation file containing exactly this inert payload. Native upload and exact readback must succeed in this actual context before selecting the native output path. No article data in probes.',
  };
  config.fresh_preflight[2] = 'Prefer an actual native Dropbox file upload of the newly created inert probe file containing exactly {probe_id,test_only:true}. Use only the genuine file parameter. If native upload is unavailable, the existing v1 GitHub probe or encrypted v2 probe remains allowed; a safety rejection must not be bypassed.';
  config.fresh_preflight[3] = 'For a native probe, retain its actual upload receipt and verify exact original bytes using download SHA256 or locally computed Dropbox content_hash plus size. For a GitHub probe, use the exact authorized issue title/body and compare the actual stored issue bytes.';
  config.fresh_preflight[4] = 'Read the newly written probe from Dropbox in THIS actual context and compare it with the unchanged original file. A GitHub probe additionally requires its actual Actions BRIDGE_DELIVERED receipt. PASS requires fresh reads AND verified write/readback; tool availability alone is insufficient.';
  config.fresh_preflight[7] = 'Create complete editorial output files and validate them against the job contract. Prefer the proven native private Dropbox file upload with exact readback/hash. Never overwrite an existing output. Use encrypted v2 fallback only within its stated scope; do not turn a safety rejection into an alternate delivery route.';
  config.fresh_preflight[8] = 'Claims are not delivery. Delivered means a verified native file receipt plus byte-identical Dropbox output, or actual Actions BRIDGE_DELIVERED plus identical output for the encrypted fallback. Publication and ACK remain independent server/import responsibilities.';
  config.fresh_preflight[9] = 'After the actual fresh probe/readback, send the unchanged scheduled processor_preflight report through the existing encrypted v2 issue transport. The server derives 95_LOGS and verifies the actual immutable probe. Use real scheduled occurrence/readback timestamps only. This small report never contains article text.';
  config.context_modes.manual = 'An explicitly requested manual batch requires the five real reads, a fresh unpredictable probe and proven native file write/readback or successful GitHub probe receipt plus own Dropbox readback. Process only the own shard after PASS. Never invent scheduled_for or send an automation report for a manual turn.';
  config.research_access_rule = 'Before proposing supplementary research_sources, check the current repository content/news/source-registry.json and media-registry.json including overrides for that URL host. Disabled or metadata-only research access cannot be used for automatic full-text quote verification. Seek permitted primary/public alternatives and update dependent evidence references truthfully. Do not infer that an original event source is disabled from a generic error affecting supplementary research. Importer access, robots, login and payment checks remain authoritative.';
  config.change_reason = 'A full 89217-byte editorial output was delivered unchanged by the native file connector on 2026-09-12 and independently hash-verified. The previous long encrypted issue text lost a complete 6000-character part. Prefer file transport; preserve encrypted small preflight reports, approvals, shards, existing files and access policy. No automatic approval or production-health claim follows from this configuration write.';
  return config;
}

export async function writeNativeOutputContract(transport, expectedHash = NATIVE_PREDECESSOR_SHA256) {
  const config = nativeOutputContract(await transport.read(bridgePath('98_CONFIG', PREVIOUS_NATIVE_TRANSPORT)), expectedHash);
  const destination = bridgePath('98_CONFIG', NATIVE_TRANSPORT), expected = `${JSON.stringify(config, null, 2)}\n`;
  await transport.writeAtomic(destination, config);
  if (await transport.read(destination) !== expected) throw Error('PROCESSOR_TRANSPORT_READBACK_MISMATCH');
  return { status: 'CONFIG_VERIFIED', file: NATIVE_TRANSPORT, bytes: Buffer.byteLength(expected), sha256: digest(expected), processor_health_changed: false };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const env = process.env;
  if (env.GITHUB_REF !== 'refs/heads/main') throw Error('PROCESSOR_TRANSPORT_TRUSTED_REF_REQUIRED');
  for (const name of ['DROPBOX_APP_KEY', 'DROPBOX_APP_SECRET', 'DROPBOX_REFRESH_TOKEN']) if (!env[name]) throw Error('PROCESSOR_TRANSPORT_CREDENTIALS_REQUIRED');
  const transport = new DropboxTransport({ credentials: { app_key: env.DROPBOX_APP_KEY, app_secret: env.DROPBOX_APP_SECRET, refresh_token: env.DROPBOX_REFRESH_TOKEN } });
  console.log(JSON.stringify(await writeNativeOutputContract(transport)));
}
