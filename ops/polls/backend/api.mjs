import { isIP } from 'node:net';
import { PollStore, PollAbuseStore, PollError } from './store.mjs';

const PRODUCTION_ORIGINS = ['https://wirkungsoekonomie.de', 'https://www.wirkungsoekonomie.de'];
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
function json(response, status, value) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
  response.end(JSON.stringify(value));
}
export function clientAddress(request, trustProxy = false) {
  const remote = request.socket.remoteAddress || 'unknown';
  // Only the local TLS reverse proxy is trusted, and it must REPLACE X-Real-IP.
  const proxy = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote);
  const supplied = request.headers['x-real-ip'];
  return trustProxy && proxy && typeof supplied === 'string' && isIP(supplied) ? supplied : remote;
}
async function body(request) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers['content-type'] || '')) throw new PollError('JSON-Daten erwartet.', 415);
  let length = 0; const chunks = [];
  for await (const chunk of request) {
    length += chunk.length;
    if (length > 32_000) throw new PollError('Die Anfrage ist zu groß.', 413);
    chunks.push(chunk);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw new PollError('Ungültige JSON-Daten.'); }
}
export function discordAdminAuthorizer({ authenticate, token, guildId, adminIds = [] }) {
  async function discord(path) {
    const response = await fetch(`https://discord.com/api/v10${path}`, { headers: { Authorization: `Bot ${token}` }, signal: AbortSignal.timeout(8000) });
    if (response.status === 404 || response.status === 403) return null;
    if (!response.ok) throw new PollError('Die Admin-Berechtigung konnte gerade nicht geprüft werden. Bitte später erneut versuchen.', 503);
    return response.json();
  }
  return async request => {
    const session = await authenticate(request);
    if (!session?.sub || !/^\d{15,22}$/.test(session.sub)) return false;
    if (!guildId || !token) return false;
    // Signed community membership alone never grants editor access. Check current privileges.
    const member = await discord(`/guilds/${guildId}/members/${session.sub}`);
    if (!member) return false;
    if (adminIds.length) return adminIds.includes(session.sub);
    const guild = await discord(`/guilds/${guildId}`);
    if (guild?.owner_id === session.sub) return true;
    const roles = await discord(`/guilds/${guildId}/roles`);
    return Array.isArray(roles) && roles.some(role => member.roles?.includes(role.id) && (BigInt(role.permissions || '0') & 8n) === 8n);
  };
}
export function createPollHandler({ store, abuse, authorize, origins = PRODUCTION_ORIGINS, trustProxy = false, logger = console }) {
  return async (request, response) => {
    const url = new URL(request.url || '/', 'http://localhost');
    const pathname = url.pathname.replace(/\/$/, '');
    if (!(pathname === '/api/polls' || pathname.startsWith('/api/polls/') || pathname === '/api/admin/polls' || pathname.startsWith('/api/admin/polls/'))) return false;
    try {
      const origin = request.headers.origin;
      // Override the host application's broader CORS policy for this module.
      response.removeHeader('Access-Control-Allow-Origin');
      response.removeHeader('Access-Control-Allow-Credentials');
      response.setHeader('Vary', 'Origin');
      if (origin && !origins.includes(origin)) throw new PollError('Diese Herkunft ist nicht erlaubt.', 403, 'ORIGIN_REJECTED');
      if (origin) response.setHeader('Access-Control-Allow-Origin', origin);
      response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Poll-Vote-Token');
      if (request.method === 'OPTIONS') { response.writeHead(204); response.end(); return true; }
      if (!['GET','POST','PATCH','DELETE'].includes(request.method)) throw new PollError('Methode nicht erlaubt.', 405);
      if (request.method !== 'GET' && !origins.includes(origin)) throw new PollError('Die Browser-Herkunft muss bestätigt sein.', 403, 'ORIGIN_REJECTED');
      const address = clientAddress(request, trustProxy);
      abuse.consume(address, 'requests', 180, 60_000);
      if (pathname.startsWith('/api/admin/')) {
        abuse.consume(address, 'admin', 60, 60_000);
        if (!(await authorize(request))) throw new PollError('Bitte mit einem berechtigten WÖk-Administrationskonto anmelden.', 403, 'ADMIN_REQUIRED');
        if (pathname === '/api/admin/polls') {
          if (request.method === 'GET') json(response, 200, { ok: true, polls: store.list(true) });
          else if (request.method === 'POST') json(response, 201, { ok: true, poll: store.create(await body(request)) });
          else throw new PollError('Methode nicht erlaubt.', 405);
          return true;
        }
        const feedbackMatch=pathname.match(/^\/api\/admin\/polls\/([^/]+)\/feedback(?:\/([^/]+))?$/);
        if(feedbackMatch){
          const [,pollId,feedbackId]=feedbackMatch;
          if(!UUID.test(pollId)||(feedbackId&&!UUID.test(feedbackId)))throw new PollError('Ungültiger Feedback-Pfad.',404);
          if(!feedbackId&&request.method==='GET')json(response,200,{ok:true,...store.listFeedback(pollId,Number(url.searchParams.get('offset')||0))});
          else if(feedbackId&&request.method==='PATCH')json(response,200,{ok:true,...store.updateFeedback(pollId,feedbackId,await body(request))});
          else if(feedbackId&&request.method==='DELETE')json(response,200,{ok:true,...store.deleteFeedback(pollId,feedbackId,await body(request))});
          else throw new PollError('Methode nicht erlaubt.',405);
          return true;
        }
        const match = pathname.match(/^\/api\/admin\/polls\/([^/]+)(?:\/(duplicate|votes))?$/);
        if (!match || !UUID.test(match[1])) throw new PollError('Ungültiger Administrationspfad.', 404);
        const [, id, action] = match;
        if (action === 'duplicate' && request.method === 'POST') { await body(request); json(response, 201, { ok: true, poll: store.duplicate(id) }); }
        else if (action === 'votes' && request.method === 'DELETE') json(response, 200, { ok: true, ...store.deleteVotes(id, await body(request)) });
        else if (!action && request.method === 'GET') { const poll = store.get(id); json(response, 200, { ok: true, poll, results: store.results(poll) }); }
        else if (!action && request.method === 'PATCH') json(response, 200, { ok: true, poll: store.update(id, await body(request)) });
        else if (!action && request.method === 'DELETE') json(response, 200, { ok: true, ...store.delete(id, await body(request)) });
        else throw new PollError('Methode nicht erlaubt.', 405);
        return true;
      }
      if (pathname === '/api/polls' || pathname === '/api/polls/export') {
        if (request.method !== 'GET') throw new PollError('Methode nicht erlaubt.', 405);
        json(response, 200, { ok: true, schema_version: 1, polls: store.list(false) });
        return true;
      }
      const match = pathname.match(/^\/api\/polls\/([a-z0-9-]{1,100})(?:\/(vote|results|feedback))?$/);
      if (!match) throw new PollError('Umfrage nicht gefunden.', 404);
      const [, slug, action] = match;
      const token = request.headers['x-poll-vote-token'];
      if (token !== undefined && typeof token !== 'string') throw new PollError('Ungültige Abstimmungskennung.');
      if(action==='feedback'&&request.method==='POST'){
        abuse.consume(address,'feedback-minute',5,60000);
        abuse.consume(address,'feedback-hour',20,3600000);
        json(response,200,{ok:true,...store.feedback(slug,token,await body(request))});
      } else if (action === 'vote' && request.method === 'POST') {
        abuse.consume(address, 'votes-minute', 12, 60_000);
        abuse.consume(address, 'votes-hour', 60, 3_600_000);
        const input = await body(request);
        try { json(response, 201, { ok: true, ...store.vote(slug, input.option_id, token) }); }
        catch (error) {
          if (error.code !== 'ALREADY_VOTED') throw error;
          json(response, 409, { ok: false, code: error.code, error: error.message, ...store.view(slug, token) });
        }
      } else if ((!action || action === 'results') && request.method === 'GET') {
        const result = store.view(slug, token);
        json(response, 200, { ok: true, ...result });
      } else throw new PollError('Methode nicht erlaubt.', 405);
    } catch (error) {
      if (error instanceof PollError) {
        if (error.status === 429) response.setHeader('Retry-After', '60');
        json(response, error.status, { ok: false, error: error.message, code: error.code });
      } else {
        // Never log request headers, addresses, vote tokens, SQL values or raw errors.
        logger.error('Poll API: internal request failure');
        json(response, 503, { ok: false, error: 'Die Umfrage ist vorübergehend nicht erreichbar. Bitte versuche es erneut.', code: 'UNAVAILABLE' });
      }
    }
    return true;
  };
}
export function createPollApi({ authenticate, discordToken, guildId, env = process.env }) {
  if (env.POLLS_ENABLED !== 'true') return async () => false;
  const store = new PollStore({ path: env.POLLS_DATABASE_PATH || './data/polls/polls.sqlite', pepper: env.POLLS_TOKEN_PEPPER });
  const abuse = new PollAbuseStore({ path: env.POLLS_ABUSE_DATABASE_PATH || './data/polls/abuse.sqlite', pepper: env.POLLS_ABUSE_PEPPER });
  const cleanup = setInterval(() => { try { abuse.purge(); } catch { console.error('Poll API: anti-abuse cleanup failed'); } }, 5 * 60_000);
  cleanup.unref();
  const authorize = discordAdminAuthorizer({ authenticate, token: discordToken, guildId, adminIds: (env.POLLS_ADMIN_DISCORD_IDS || '').split(',').map(x => x.trim()).filter(Boolean) });
  const handler=createPollHandler({ store, abuse, authorize, trustProxy: env.POLLS_TRUST_LOCAL_PROXY === 'true' });
  handler.close=()=>{clearInterval(cleanup);store.close();abuse.close();};
  return handler;
}
