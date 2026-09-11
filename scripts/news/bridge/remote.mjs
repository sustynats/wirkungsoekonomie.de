import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withRequestDeadline } from '../request-deadline.mjs';

export function bridgeSession(env = process.env, { fetchImpl = fetch } = {}) {
  const endpoint = env.WOEK_NEWS_BRIDGE_URL;
  const secret = env.WOEK_NEWS_BRIDGE_TOKEN;
  const runId = env.GITHUB_RUN_ID;
  if (!endpoint || !secret || !/^\d{1,20}$/.test(runId || '')) throw new Error('BRIDGE_REMOTE_CONFIG_REQUIRED');
  const url = new URL(endpoint);
  if (url.protocol !== 'https:' || url.hostname !== '130.162.217.58.sslip.io' || url.pathname !== '/api/news-bridge' || url.search || url.hash || url.username || url.password) throw new Error('BRIDGE_REMOTE_URL_INVALID');
  const owner = `${runId}:${env.GITHUB_RUN_ATTEMPT || '1'}`;
  const readOperations = new Set(['store.get', 'store.all', 'store.impactStagingIndex', 'store.observation',
    'dropbox.list', 'dropbox.read', 'dropbox.readBinary', 'dropbox.metadata', 'bridge.status', 'bridge.monitor']);
  async function requestOnce(op, args) {
    return withRequestDeadline(async signal => {
    const response = await fetchImpl(url, { method: 'POST', redirect: 'error', signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}`, 'X-Bridge-Owner': owner,
        'X-Bridge-Lane': env.WOEK_NEWS_BRIDGE_PHASE === 'discovery' ? 'discovery' : 'import' }, body: JSON.stringify({ op, args }) });
    // Older Oracle releases return one array and ignore pagination arguments.
    // Keep that rolling-upgrade response bounded while new servers page jobs.
    const responseLimit = (op === 'store.all' ? 64 : 24) * 1024 * 1024;
    const chunks = []; let size = 0;
    for await (const chunk of response.body) { size += chunk.length; if (size > responseLimit) throw new Error('BRIDGE_RESPONSE_TOO_LARGE'); chunks.push(chunk); }
    let result; try { result = JSON.parse(Buffer.concat(chunks)); } catch { throw Object.assign(new Error('BRIDGE_REMOTE_INVALID_RESPONSE'), {
      retryable: response.status >= 500, http_status: response.status, operation: op, response_bytes: size,
      // Authentication/permission failures and writes must never be retried.
      read_retryable: response.status === 200 || response.status >= 500,
    }); }
    if (!response.ok || !result.ok) throw Object.assign(new Error(result.error || 'BRIDGE_REMOTE_UNAVAILABLE'), { retryable: response.status >= 500, ...(Number.isFinite(result.retry_after_seconds) ? { retry_after_seconds: result.retry_after_seconds } : {}) });
    return result.result;
    }, {timeoutMs:180000, code:'BRIDGE_REMOTE_TIMEOUT'});
  }
  async function request(op, args = []) {
    try { return await requestOnce(op, args); }
    catch (error) {
      if (!readOperations.has(op) || error.message !== 'BRIDGE_REMOTE_INVALID_RESPONSE' || !error.read_retryable) throw error;
      // One idempotent reread can recover a truncated gateway response. The
      // second failure remains a real run error; no stale/default result is used.
      console.warn(JSON.stringify({ event: 'bridge_read_retry', operation: op, http_status: error.http_status, response_bytes: error.response_bytes }));
      return requestOnce(op, args);
    }
  }
  const store = Object.fromEntries(['acquire','get','put','all','impactStagingIndex','observe','observation','release','editorialClaim','editorialFinalize','editorialFailure'].map(op => [op, (...args) => request(`store.${op}`, args)]));
  store.all = async () => {
    const jobs = [], cursors = new Set(); let after = '';
    for (;;) {
      const page = await request('store.all', [{ page_size: 20, after }]);
      if (Array.isArray(page) && !after) return page; // legacy server
      if (page?.page_version !== 1 || !Array.isArray(page.items)
        || page.items.length > 20 || !(page.next_cursor === null || typeof page.next_cursor === 'string')) throw Error('BRIDGE_QUEUE_PAGE_INVALID');
      jobs.push(...page.items);
      if (jobs.length > 10000) throw Error('BRIDGE_QUEUE_ITEM_LIMIT');
      if (page.next_cursor === null) return jobs;
      if (!page.items.length || !page.next_cursor || cursors.has(page.next_cursor)) throw Error('BRIDGE_QUEUE_CURSOR_INVALID');
      cursors.add(page.next_cursor); after = page.next_cursor;
    }
  };
  const transport = Object.fromEntries(['list','read','metadata','move','writeAtomic','archive'].map(op => [op, (...args) => request(`dropbox.${op}`, args)]));
  transport.readBinary = async file => Buffer.from(await request('dropbox.readBinary', [file]), 'base64');
  return { store, transport, status: () => request('bridge.status'), monitor: () => request('bridge.monitor') };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { store } = bridgeSession();
  if (process.argv.includes('--release')) await store.release(process.env.BRIDGE_RUN_SUCCESS === 'true');
  else throw new Error('Use --release');
}
