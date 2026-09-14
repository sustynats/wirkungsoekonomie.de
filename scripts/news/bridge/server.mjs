import fs from 'node:fs';
import path from 'node:path';
import { BridgeStore } from './store.mjs';
import { DropboxTransport, loadDropboxCredentials } from './dropbox.mjs';
import { createBridgeServer } from './server-handler.mjs';

const directory = process.env.WOEK_NEWS_BRIDGE_DIRECTORY;
if (!directory || !path.isAbsolute(directory)) throw new Error('BRIDGE_PRIVATE_DIRECTORY_REQUIRED');
const stores = Object.fromEntries(['discovery','import'].map(lane => [lane, new BridgeStore(path.join(directory, 'queue.sqlite'), { lane })]));
const transport = new DropboxTransport({ credentials: loadDropboxCredentials(path.join(directory, 'dropbox.json'), process.cwd()) });
const secret = fs.readFileSync(path.join(directory, 'worker-token'), 'utf8').trim();
if (secret.length < 40) throw new Error('BRIDGE_AUTH_SECRET_INVALID');
const server = createBridgeServer({ stores, transport, secret });
server.listen(8786, '127.0.0.1');
for (const signal of ['SIGTERM','SIGINT']) process.on(signal, () => server.close(() => { Object.values(stores).forEach(store => store.close()); process.exit(0); }));
