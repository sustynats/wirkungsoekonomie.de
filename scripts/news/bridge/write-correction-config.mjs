import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DropboxTransport, loadDropboxCredentials } from './dropbox.mjs';
import { bridgePath, hash } from './contract.mjs';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const config={schema_version:'1.0',version:'correction-protocol-20260910-1',base_contract:'contract-2026-09-10-bridge-3.json',max_correction_rounds:2,instructions:fs.readFileSync(new URL('../../../docs/news/BRIDGE-CORRECTIONS.md',import.meta.url),'utf8')};
const transport=new DropboxTransport({credentials:loadDropboxCredentials(process.env.WOEK_NEWS_DROPBOX_CREDENTIALS,root)});
await transport.writeAtomic(bridgePath('98_CONFIG','correction-protocol-20260910-1.json'),config);
console.log(JSON.stringify({file:'correction-protocol-20260910-1.json',sha256:hash(config)}));
