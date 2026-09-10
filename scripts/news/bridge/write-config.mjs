import fs from 'node:fs';
import { inputSchema, outputSchema, visualSchema, bridgePath, hash } from './contract.mjs';
import { DropboxTransport, loadDropboxCredentials } from './dropbox.mjs';

const root = new URL('../../../', import.meta.url).pathname;
const transport = new DropboxTransport({ credentials: loadDropboxCredentials(process.env.WOEK_NEWS_DROPBOX_CREDENTIALS, root) });
const governance = fs.readFileSync(new URL('../../../AGENTS.md', import.meta.url), 'utf8');
const guide = fs.readFileSync(new URL('../../../content/documents/online/woek-begriffsleitfaden-fuehrend.inc', import.meta.url), 'utf8');
const configuration = { schema_version: '1.0', version: '2026-09-10-hourly-1', processing_mode: 'dropbox_chatgpt_bridge',
  visual_generation_provider: 'chatgpt_bridge', schedule: { discovery: 'HH:45', processing: 'HH:00 Europe/Berlin', import: 'HH:30' },
  instructions: fs.readFileSync(new URL('../../../docs/news/DROPBOX-CHATGPT-BRIDGE.md', import.meta.url), 'utf8'),
  governance: { agents_md: governance, leading_guide_html: guide, guide_version: '1.7' }, input_schema: inputSchema, output_schema: outputSchema, visual_schema: visualSchema };
// Versioned immutable configuration never overwrites a writer's instructions.
const name = `contract-${configuration.version}.json`;
await transport.writeAtomic(bridgePath('98_CONFIG', name), configuration);
console.log(JSON.stringify({ file: name, sha256: hash(configuration) }));
