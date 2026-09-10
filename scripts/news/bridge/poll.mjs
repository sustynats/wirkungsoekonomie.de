import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const directory = process.env.WOEK_NEWS_BRIDGE_DIRECTORY;
if (!directory || !path.isAbsolute(directory)) throw Error('BRIDGE_PRIVATE_DIRECTORY_REQUIRED');
const secret = fs.readFileSync(path.join(directory,'worker-token'),'utf8').trim();
const response = await fetch('http://127.0.0.1:8786/api/news-bridge', { method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
  body: JSON.stringify({ op: 'bridge.status', args: [] }), signal: AbortSignal.timeout(60000) });
if (!response.ok) throw Error('BRIDGE_POLL_FAILED');
const { result } = await response.json();
console.log(JSON.stringify(result));
if (result.ready.length) {
  const { stdout } = await promisify(execFile)('/usr/local/bin/woek-wirkungsticker-clock', [], {
    env: { ...process.env, WOEK_CLOCK_FORCE: 'true', WOEK_CLOCK_LANE: 'import' }, timeout: 90000, maxBuffer: 10000 });
  console.log(stdout.trim());
}
