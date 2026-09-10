import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import { BRIDGE_ROOT, FOLDERS, MAX_BYTES, hash, bridgePath } from './contract.mjs';

export function allowedPath(value) {
  if (typeof value !== 'string' || !value.startsWith(`${BRIDGE_ROOT}/`) || value !== value.normalize('NFC')) throw new Error('BRIDGE_PATH_INVALID');
  const parts = value.slice(BRIDGE_ROOT.length + 1).split('/');
  if (!FOLDERS.includes(parts[0]) || parts.some(p => !/^[A-Za-z0-9_.-]{1,150}$/.test(p) || p.includes('..'))) throw new Error('BRIDGE_PATH_INVALID');
  if (parts[0] !== '40_ARCHIVE' && parts.length > 2 || parts[0] === '40_ARCHIVE' && parts.length > 6) throw new Error('BRIDGE_PATH_INVALID');
  return value;
}

async function boundedBody(response, limit = MAX_BYTES, binary = false) {
  if (Number(response.headers.get('content-length')) > limit) throw new Error('BRIDGE_FILE_TOO_LARGE');
  const parts = []; let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > limit) throw new Error('BRIDGE_FILE_TOO_LARGE');
    parts.push(Buffer.from(chunk));
  }
  const bytes = Buffer.concat(parts);
  return binary ? bytes : bytes.toString('utf8');
}

export function loadDropboxCredentials(file, repositoryRoot) {
  if (!file || !path.isAbsolute(file)) throw new Error('BRIDGE_CREDENTIALS_FILE_REQUIRED');
  const real = fs.realpathSync(file), repo = fs.realpathSync(repositoryRoot);
  if (real === repo || real.startsWith(`${repo}/`) || (fs.statSync(real).mode & 0o077)) throw new Error('BRIDGE_CREDENTIALS_NOT_PRIVATE');
  const credentials = JSON.parse(fs.readFileSync(real, 'utf8'));
  if (!credentials.app_key || !credentials.refresh_token) throw new Error('BRIDGE_OFFLINE_CREDENTIALS_REQUIRED');
  return credentials;
}

export class DropboxTransport {
  constructor({ credentials, fetchImpl = fetch, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) }) { this.credentials = credentials; this.fetch = fetchImpl; this.sleep = sleep; this.archiveFolders = new Map(); }
  async token() {
    if (this.accessToken && Date.now() < this.expiresAt) return this.accessToken;
    const { app_key, app_secret, refresh_token } = this.credentials;
    const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token, client_id: app_key,
      ...(app_secret ? { client_secret: app_secret } : {}) });
    const response = await this.fetch('https://api.dropboxapi.com/oauth2/token', { method: 'POST', body, redirect: 'error', signal: AbortSignal.timeout(20000) });
    if (!response.ok) {
      const temporary = response.status === 429 || response.status >= 500;
      const retryAfter = Number(response.headers.get('retry-after'));
      throw Object.assign(new Error(temporary ? `BRIDGE_DROPBOX_HTTP_${response.status}` : 'BRIDGE_DROPBOX_AUTH_FAILED'), {
        retryable: temporary,
        ...(temporary && Number.isFinite(retryAfter) && retryAfter > 0 ? { retry_after_seconds: retryAfter } : {}),
      });
    }
    const result = JSON.parse(await boundedBody(response, 20000));
    if (!result.access_token || !Number.isFinite(result.expires_in)) throw new Error('BRIDGE_DROPBOX_AUTH_INVALID');
    this.accessToken = result.access_token; this.expiresAt = Date.now() + (result.expires_in - 60) * 1000;
    return this.accessToken;
  }
  async request(endpoint, input, content, binary = false, attempt = 0) {
    const isContent = ['files/download', 'files/upload'].includes(endpoint);
    const response = await this.fetch(`https://${isContent ? 'content' : 'api'}.dropboxapi.com/2/${endpoint}`, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(45000),
      headers: { Authorization: `Bearer ${await this.token()}`,
        ...(this.credentials.root_namespace_id ? { 'Dropbox-API-Path-Root': JSON.stringify({ '.tag': 'root', root: this.credentials.root_namespace_id }) } : {}),
        ...(isContent ? { 'Dropbox-API-Arg': JSON.stringify(input), ...(content === undefined ? {} : { 'Content-Type': 'application/octet-stream' }) } : { 'Content-Type': 'application/json' }) },
      ...(isContent ? content === undefined ? {} : { body: content } : { body: JSON.stringify(input) }),
    });
    const raw = await boundedBody(response, binary && response.ok ? 12582912 : MAX_BYTES, binary && response.ok);
    if (!response.ok) {
      let code = '';
      try { code = JSON.parse(raw).error_summary || ''; } catch { /* Never log upstream payloads. */ }
      const retryHeader = response.headers.get('retry-after');
      const retrySeconds = retryHeader !== null && Number.isFinite(Number(retryHeader)) ? Math.max(0, Number(retryHeader)) : null;
      // Retry only an explicit refusal, never blindly replay an ambiguous write.
      // Longer provider windows are handed back to the durable scheduler.
      if (response.status === 429 && attempt < 2 && (retrySeconds === null || retrySeconds <= 20)) {
        await this.sleep(Math.max(500 * 2 ** attempt, (retrySeconds || 0) * 1000));
        return this.request(endpoint, input, content, binary, attempt + 1);
      }
      throw Object.assign(new Error(code.includes('not_found') ? 'BRIDGE_DROPBOX_NOT_FOUND' : code.includes('conflict') ? 'BRIDGE_DROPBOX_CONFLICT' : `BRIDGE_DROPBOX_HTTP_${response.status}`), {
        retryable: response.status === 429 || response.status >= 500,
        ...(retrySeconds !== null ? { retry_after_seconds: retrySeconds } : {}),
      });
    }
    return endpoint === 'files/download' ? raw : JSON.parse(raw);
  }
  async list(folder) {
    if (!FOLDERS.includes(folder)) throw new Error('BRIDGE_PATH_INVALID');
    let page = await this.request('files/list_folder', { path: `${BRIDGE_ROOT}/${folder}`, recursive: false, limit: 100 });
    const entries = [...page.entries]; let pages = 1;
    while (page.has_more) {
      if (++pages > 30) throw new Error('BRIDGE_LIST_LIMIT');
      page = await this.request('files/list_folder/continue', { cursor: page.cursor }); entries.push(...page.entries);
    }
    return entries;
  }
  async read(file) { return this.request('files/download', { path: allowedPath(file) }); }
  async readBinary(file) { return this.request('files/download', { path: allowedPath(file) }, undefined, true); }
  async metadata(file) {
    try { return await this.request('files/get_metadata', { path: allowedPath(file) }); }
    catch (error) { if (error.message === 'BRIDGE_DROPBOX_NOT_FOUND') return null; throw error; }
  }
  async move(from, to) {
    return this.request('files/move_v2', { from_path: allowedPath(from), to_path: allowedPath(to), autorename: false, allow_shared_folder: false });
  }
  async writeAtomic(file, value) {
    const body = `${JSON.stringify(value, null, 2)}\n`;
    if (Buffer.byteLength(body) > MAX_BYTES) throw new Error('BRIDGE_FILE_TOO_LARGE');
    return this.writeAtomicContent(file,body,false);
  }
  async writeBinaryAtomic(file, value) {
    if(!Buffer.isBuffer(value)||!value.length)throw new Error('BRIDGE_BINARY_REQUIRED');
    if(value.length>8*1024*1024)throw new Error('BRIDGE_FILE_TOO_LARGE');
    return this.writeAtomicContent(file,Buffer.from(value),true);
  }
  async writeAtomicContent(file,body,binary) {
    allowedPath(file);
    const identical = async target => binary ? body.equals(await this.readBinary(target)) : (await this.read(target)) === body;
    if (await this.metadata(file)) {
      if (!await identical(file)) throw new Error('BRIDGE_IMMUTABLE_FILE_CONFLICT');
      return;
    }
    // A complete upload is invisible to the worker until move_v2 succeeds.
    // Deterministic temp names make ambiguous upload/move responses recoverable.
    const digest=binary?createHash('sha256').update(file).update(body).digest('hex'):hash(file+body);
    const temp = bridgePath('98_CONFIG', `.upload-${digest}.tmp`);
    if (!await this.metadata(temp)) {
      try { await this.request('files/upload', { path: temp, mode: 'add', autorename: false, strict_conflict: true, mute: true }, body); }
      catch (error) { if (error.message !== 'BRIDGE_DROPBOX_CONFLICT') throw error; }
    }
    if (!await identical(temp)) throw new Error('BRIDGE_TEMP_CONTENT_MISMATCH');
    try { await this.move(temp, file); }
    catch (error) {
      if (error.message !== 'BRIDGE_DROPBOX_CONFLICT' || !await identical(file)) throw error;
    }
  }
  async archive(file, jobId, date) {
    if (!/^wt_\d{8}T\d{6}Z_[a-f0-9]{24}$/.test(jobId) || !/^\d{4}-\d\d-\d\d/.test(date)) throw new Error('BRIDGE_PATH_INVALID');
    if (!await this.metadata(file)) return;
    // Repeated optional files must not create/check the same folder tree.
    // Cache only confirmed directories, briefly, within this transport instance.
    for (const [key, at] of this.archiveFolders) if (Date.now() - at >= 300000) this.archiveFolders.delete(key);
    let folder = `${BRIDGE_ROOT}/40_ARCHIVE`;
    for (const segment of [...date.slice(0, 10).split('-'), jobId]) {
      folder += `/${segment}`;
      if (this.archiveFolders.has(folder)) continue;
      const existing = await this.metadata(folder);
      if (existing && existing['.tag'] !== 'folder') throw new Error('BRIDGE_ARCHIVE_FOLDER_CONFLICT');
      if (!existing) {
        try { await this.request('files/create_folder_v2', { path: folder, autorename: false }); }
        catch (error) {
          if (error.message !== 'BRIDGE_DROPBOX_CONFLICT') throw error;
          if ((await this.metadata(folder))?.['.tag'] !== 'folder') throw new Error('BRIDGE_ARCHIVE_FOLDER_CONFLICT');
        }
      }
      this.archiveFolders.set(folder, Date.now());
    }
    const target = `${folder}/${file.split('/').at(-1)}`;
    if (await this.metadata(target)) {
      if (!(await this.readBinary(file)).equals(await this.readBinary(target))) throw new Error('BRIDGE_ARCHIVE_CONFLICT');
      return; // Keep both on ambiguous recovery; never delete evidence.
    }
    try { await this.move(file, target); }
    catch (error) { this.archiveFolders.clear(); throw error; }
  }
}
