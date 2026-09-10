import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function bridgeSession(env = process.env) {
  const endpoint = env.WOEK_NEWS_BRIDGE_URL;
  const secret = env.WOEK_NEWS_BRIDGE_TOKEN;
  const runId = env.GITHUB_RUN_ID;
  if (!endpoint || !secret || !/^\d{1,20}$/.test(runId || '')) throw new Error('BRIDGE_REMOTE_CONFIG_REQUIRED');
  const url = new URL(endpoint);
  if (url.protocol !== 'https:' || url.hostname !== '130.162.217.58.sslip.io' || url.pathname !== '/api/news-bridge' || url.search || url.hash || url.username || url.password) throw new Error('BRIDGE_REMOTE_URL_INVALID');
  const owner = `${runId}:${env.GITHUB_RUN_ATTEMPT || '1'}`;
  async function request(op, args = []) {
    const response = await fetch(url, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(180000),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}`, 'X-Bridge-Owner': owner,
        'X-Bridge-Lane': env.WOEK_NEWS_BRIDGE_PHASE === 'discovery' ? 'discovery' : 'import' }, body: JSON.stringify({ op, args }) });
    const chunks = []; let size = 0;
    for await (const chunk of response.body) { size += chunk.length; if (size > 24 * 1024 * 1024) throw new Error('BRIDGE_RESPONSE_TOO_LARGE'); chunks.push(chunk); }
    let result; try { result = JSON.parse(Buffer.concat(chunks)); } catch { throw Object.assign(new Error('BRIDGE_REMOTE_INVALID_RESPONSE'), { retryable: response.status >= 500 }); }
    if (!response.ok || !result.ok) throw Object.assign(new Error(result.error || 'BRIDGE_REMOTE_UNAVAILABLE'), { retryable: response.status >= 500, ...(Number.isFinite(result.retry_after_seconds) ? { retry_after_seconds: result.retry_after_seconds } : {}) });
    return result.result;
  }
  const store = Object.fromEntries(['acquire','get','put','all','observe','observation','release','editorialClaim','editorialFinalize','editorialFailure'].map(op => [op, (...args) => request(`store.${op}`, args)]));
  const transport = Object.fromEntries(['list','read','metadata','move','writeAtomic','archive'].map(op => [op, (...args) => request(`dropbox.${op}`, args)]));
  transport.readBinary = async file => Buffer.from(await request('dropbox.readBinary', [file]), 'base64');
  return { store, transport, status: () => request('bridge.status'), monitor: () => request('bridge.monitor') };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { store } = bridgeSession();
  if (process.argv.includes('--release')) await store.release(process.env.BRIDGE_RUN_SUCCESS === 'true');
  else throw new Error('Use --release');
}
