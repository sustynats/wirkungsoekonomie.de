import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import { BridgeStore } from './store.mjs';
import { DropboxTransport, loadDropboxCredentials } from './dropbox.mjs';
import { JOB_ID } from './contract.mjs';

const directory = process.env.WOEK_NEWS_BRIDGE_DIRECTORY;
if (!directory || !path.isAbsolute(directory)) throw new Error('BRIDGE_PRIVATE_DIRECTORY_REQUIRED');
const store = new BridgeStore(path.join(directory, 'queue.sqlite'));
const transport = new DropboxTransport({ credentials: loadDropboxCredentials(path.join(directory, 'dropbox.json'), process.cwd()) });
const secret = fs.readFileSync(path.join(directory, 'worker-token'), 'utf8').trim();
if (secret.length < 40) throw new Error('BRIDGE_AUTH_SECRET_INVALID');
let busy = false;
const validOwner = value => /^\d{1,20}:\d{1,5}$/.test(value || '');
async function ownerCompleted(owner) {
  const [id] = owner.split(':');
  const response = await fetch(`https://api.github.com/repos/sustynats/wirkungsoekonomie.de/actions/runs/${id}`, { headers: { Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) return false; // Uncertain ownership never expires into another writer.
  const run = await response.json();
  return run.status === 'completed';
}
const operations = new Set(['store.acquire','store.release','store.get','store.put','store.all','store.observe','store.observation',
  'dropbox.list','dropbox.read','dropbox.readBinary','dropbox.metadata','dropbox.move','dropbox.writeAtomic','dropbox.archive']);
const server = http.createServer(async (req, res) => {
  const finish = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };
  const supplied = Buffer.from(req.headers.authorization || ''); const expected = Buffer.from(`Bearer ${secret}`);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) { finish(401, { ok: false, error: 'BRIDGE_UNAUTHORIZED' }); return; }
  if (req.method !== 'POST' || req.url !== '/api/news-bridge') { finish(404, { ok: false }); return; }
  if (busy) { finish(409, { ok: false, error: 'BRIDGE_OPERATION_BUSY' }); return; }
  busy = true;
  try {
    const owner = req.headers['x-bridge-owner'];
    if (!validOwner(owner)) throw new Error('BRIDGE_OWNER_INVALID');
    const chunks = []; let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > 3 * 1024 * 1024) throw new Error('BRIDGE_REQUEST_TOO_LARGE'); chunks.push(chunk); }
    const { op, args } = JSON.parse(Buffer.concat(chunks));
    if (!operations.has(op) || !Array.isArray(args) || args.length > 4) throw new Error('BRIDGE_OPERATION_INVALID');
    if (op === 'store.observe' && args[0] === 'remote-owner') throw new Error('BRIDGE_RESERVED_OBSERVATION');
    let current = store.observation('remote-owner');
    if (op === 'store.acquire') {
      if (current && current.owner !== owner) {
        if (!await ownerCompleted(current.owner)) throw new Error('BRIDGE_RUN_LOCKED');
        store.release(false); store.observe('remote-owner', null); current = null;
      }
      if (!current) { store.acquire(...args); store.observe('remote-owner', { owner, at: new Date().toISOString() }); }
      else if (!store.locked) store.acquire(...args); // process restart; same owning workflow only
      finish(200, { ok: true, result: true }); return;
    }
    if (!current || current.owner !== owner) throw new Error('BRIDGE_OWNER_MISMATCH');
    if (!store.locked && op !== 'store.release') throw new Error('BRIDGE_REACQUIRE_REQUIRED');
    if (op === 'store.get' && !JOB_ID.test(args[0]) || op === 'store.put' && !JOB_ID.test(args[0]?.input?.job_id)) throw new Error('BRIDGE_JOB_ID_INVALID');
    let result;
    if (op === 'store.release') { store.release(args[0] === true); store.observe('remote-owner', null); result = true; }
    else { const [target, method] = op.split('.'); result = await (target === 'store' ? store : transport)[method](...args); }
    if (op === 'dropbox.readBinary') result = result.toString('base64');
    finish(200, { ok: true, result: result ?? null });
  } catch (error) {
    const code = /^[A-Z_0-9:.-]{3,100}$/.test(error.message || '') ? error.message : 'BRIDGE_OPERATION_FAILED';
    finish(error.retryable ? 503 : 409, { ok: false, error: code });
  } finally { busy = false; }
});
server.requestTimeout = 180000;
server.listen(8786, '127.0.0.1');
for (const signal of ['SIGTERM','SIGINT']) process.on(signal, () => server.close(() => { store.close(); process.exit(0); }));
