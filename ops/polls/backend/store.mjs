import { DatabaseSync } from 'node:sqlite';
import { createHmac, randomUUID } from 'node:crypto';
import { mkdirSync, chmodSync } from 'node:fs';
import { dirname } from 'node:path';

export class PollError extends Error {
  constructor(message, status = 400, code = 'INVALID_INPUT') { super(message); this.status = status; this.code = code; }
}
export const STATUSES = ['draft', 'scheduled', 'active', 'paused', 'ended', 'archived'];
export const VISIBILITIES = ['always', 'after_vote', 'after_end'];
const SITE = 'https://wirkungsoekonomie.de';
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED = new Set(['vorschau', 'admin', 'api', 'index', 'ergebnisse']);
const TOKEN = /^[a-f0-9]{64}$/;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

function text(value, name, max, required = false) {
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new PollError(`${name}: ungültiger Text (maximal ${max} Zeichen).`);
  const clean = value.trim();
  if (required && !clean) throw new PollError(`${name} fehlt.`);
  return clean;
}
function date(value, name) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) throw new PollError(`${name}: Datum mit Zeitzone erforderlich.`);
  return new Date(value).toISOString();
}
export function safeUrl(value, image = false) {
  if (!value) return '';
  const input = text(value, image ? 'Titelbild' : 'Link', 1500);
  if (/[\s\\]/.test(input) || input.startsWith('//')) throw new PollError('Bitte eine gültige HTTPS-Adresse oder einen internen Pfad verwenden.');
  let url;
  try { url = new URL(input, SITE); } catch { throw new PollError('Ungültiger Link.'); }
  if (url.protocol !== 'https:' || url.username || url.password) throw new PollError('Nur HTTPS-Links oder interne Pfade sind erlaubt.');
  if (image && !(url.origin === SITE || (url.origin === 'https://github.com' && url.pathname.startsWith('/sustynats/wirkungsoekonomie.de/releases/download/')))) throw new PollError('Titelbilder bitte aus den eigenen Website-Dateien oder den WÖk-Veröffentlichungsdateien verlinken.');
  for (const key of [...url.searchParams.keys()]) if (/^utm_/i.test(key) || /^(fbclid|gclid)$/i.test(key)) url.searchParams.delete(key);
  return url.origin === SITE ? `${url.pathname}${url.search}${url.hash}` : url.href;
}
export function validatePoll(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new PollError('Umfragedaten fehlen.');
  const value = {
    title: text(input.title, 'Titel', 180, true),
    slug: text(input.slug, 'Slug', 100, true),
    intro: text(input.intro ?? '', 'Einleitung', 2500),
    question: text(input.question, 'Frage', 500, true),
    status: input.status ?? 'draft',
    starts_at: date(input.starts_at, 'Startdatum'),
    ends_at: date(input.ends_at, 'Enddatum'),
    results_visibility: input.results_visibility ?? 'after_vote',
    image: safeUrl(input.image ?? '', true),
    cta_text: text(input.cta_text ?? '', 'CTA-Text', 100),
    cta_url: safeUrl(input.cta_url ?? ''),
    further_url: safeUrl(input.further_url ?? ''),
    feedback_note: text(input.feedback_note ?? '', 'Hinweis nach Abstimmung', 400),
    social_description: text(input.social_description ?? '', 'Social-Beschreibung', 300),
    feedback_enabled: input.feedback_enabled === true || input.feedback_enabled === 1 ? 1 : 0,
  };
  if(input.feedback_enabled!==undefined&&![true,false,0,1].includes(input.feedback_enabled))throw new PollError('Ungültige Feedback-Einstellung.');
  if (!SLUG.test(value.slug) || RESERVED.has(value.slug)) throw new PollError('Slug: Kleinbuchstaben, Ziffern und einzelne Bindestriche verwenden.');
  if (!STATUSES.includes(value.status) || !VISIBILITIES.includes(value.results_visibility)) throw new PollError('Ungültiger Status oder Ergebnis-Modus.');
  if (!['ended','archived'].includes(value.status) && value.ends_at && value.starts_at && value.ends_at <= value.starts_at) throw new PollError('Das Enddatum muss nach dem Startdatum liegen.');
  if (value.status === 'scheduled' && !value.starts_at) throw new PollError('Eine geplante Umfrage braucht ein Startdatum.');
  if (Boolean(value.cta_text) !== Boolean(value.cta_url)) throw new PollError('CTA-Text und CTA-Link bitte gemeinsam ausfüllen.');
  if (!Array.isArray(input.options) || input.options.length < 2 || input.options.length > 8) throw new PollError('Bitte 2 bis 8 Antwortoptionen anlegen.');
  value.options = input.options.map((option, index) => {
    if (!option || typeof option !== 'object' || Array.isArray(option)) throw new PollError(`Antwort ${index + 1}: ungültige Option.`);
    return {
    id: typeof option.id === 'string' && UUID.test(option.id) ? option.id : randomUUID(),
    label: text(option.label, `Antwort ${index + 1}`, 240, true),
    sort_order: index,
  }; });
  if (new Set(value.options.map(o => o.id)).size !== value.options.length || new Set(value.options.map(o => o.label.toLocaleLowerCase('de'))).size !== value.options.length) throw new PollError('Antwortoptionen dürfen nicht doppelt vorkommen.');
  return value;
}
export function effectiveStatus(poll, now = Date.now()) {
  if (['draft', 'ended', 'archived'].includes(poll.status)) return poll.status;
  if (poll.ends_at && Date.parse(poll.ends_at) <= now) return 'ended';
  if (poll.status === 'paused') return 'paused';
  if (poll.starts_at && Date.parse(poll.starts_at) > now) return 'scheduled';
  return 'active';
}
export function canSeeResults(poll, voted, now = Date.now()) {
  return poll.results_visibility === 'always' || (poll.results_visibility === 'after_vote' && voted) || (poll.results_visibility === 'after_end' && ['ended', 'archived'].includes(effectiveStatus(poll, now)));
}
export function percentages(counts) {
  const total = counts.reduce((a, b) => a + b, 0);
  // One decimal place, largest remainder: display sums to exactly 100.0%.
  if (!total) return counts.map(() => 0);
  const tenths = counts.map(n => Math.floor(n * 1000 / total));
  const ranked = counts.map((n, i) => ({ i, remainder: n * 1000 / total - tenths[i] })).sort((a, b) => b.remainder - a.remainder || a.i - b.i);
  for (let left = 1000 - tenths.reduce((a, b) => a + b, 0), i = 0; i < left; i++) tenths[ranked[i].i]++;
  return tenths.map(n => n / 10);
}
function openDb(path) {
  if (path === ':memory:') throw new Error('Poll storage must be a persistent file. Use a temporary directory for tests.');
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path);
  chmodSync(path, 0o600);
  db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA secure_delete=ON;');
  return db;
}
const COLS = ['slug', 'title', 'intro', 'question', 'status', 'starts_at', 'ends_at', 'results_visibility', 'image', 'cta_text', 'cta_url', 'further_url', 'feedback_note', 'social_description', 'feedback_enabled'];
export class PollStore {
  constructor({ path, pepper, now = () => Date.now() }) {
    if (typeof pepper !== 'string' || pepper.length < 32) throw new Error('POLLS_TOKEN_PEPPER must contain at least 32 characters.');
    this.db = openDb(path); this.pepper = pepper; this.now = now;
    const version = this.db.prepare('PRAGMA user_version').get().user_version;
    if (version > 2) throw new Error('Poll database is newer than this release.');
    if (version < 1) this.db.exec(`BEGIN IMMEDIATE;
      CREATE TABLE polls (
        id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, intro TEXT NOT NULL,
        question TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('draft','scheduled','active','paused','ended','archived')),
        starts_at TEXT, ends_at TEXT, results_visibility TEXT NOT NULL CHECK(results_visibility IN ('always','after_vote','after_end')),
        image TEXT NOT NULL, cta_text TEXT NOT NULL, cta_url TEXT NOT NULL, further_url TEXT NOT NULL,
        feedback_note TEXT NOT NULL, published_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
        revision INTEGER NOT NULL DEFAULT 1, feedback_enabled INTEGER NOT NULL DEFAULT 0 CHECK(feedback_enabled=0)
      ) STRICT;
      CREATE TABLE poll_options (id TEXT PRIMARY KEY, poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
        label TEXT NOT NULL, sort_order INTEGER NOT NULL, UNIQUE(poll_id,id)) STRICT;
      CREATE TABLE votes (id TEXT PRIMARY KEY, poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
        option_id TEXT NOT NULL, anonymous_vote_identifier TEXT NOT NULL, created_at TEXT NOT NULL,
        UNIQUE(poll_id, anonymous_vote_identifier),
        FOREIGN KEY(poll_id,option_id) REFERENCES poll_options(poll_id,id) ON DELETE CASCADE) STRICT;
      CREATE INDEX votes_option ON votes(poll_id,option_id);
      CREATE TABLE retired_slugs (slug TEXT PRIMARY KEY, retired_at TEXT NOT NULL) STRICT;
      PRAGMA user_version=1; COMMIT;`);
    if(version<2)this.db.exec(`BEGIN IMMEDIATE;
      ALTER TABLE polls ADD COLUMN social_description TEXT NOT NULL DEFAULT '';
      ALTER TABLE polls DROP COLUMN feedback_enabled;
      ALTER TABLE polls ADD COLUMN feedback_enabled INTEGER NOT NULL DEFAULT 0 CHECK(feedback_enabled IN (0,1));
      CREATE UNIQUE INDEX votes_poll_identity ON votes(poll_id,id);
      CREATE TABLE poll_feedback (
        id TEXT PRIMARY KEY, poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
        vote_id TEXT NOT NULL UNIQUE, body TEXT NOT NULL CHECK(length(body)>0 AND length(body)<=1500),
        status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','read','archived')),
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
        FOREIGN KEY(poll_id,vote_id) REFERENCES votes(poll_id,id) ON DELETE CASCADE
      ) STRICT;
      CREATE INDEX feedback_poll_created ON poll_feedback(poll_id,created_at DESC,id DESC);
      PRAGMA user_version=2; COMMIT;`);
  }
  close() { this.db.close(); }
  transaction(fn) {
    this.db.exec('BEGIN IMMEDIATE');
    try { const result = fn(); this.db.exec('COMMIT'); return result; }
    catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  tokenHash(pollId, token) {
    if (typeof token !== 'string' || !TOKEN.test(token)) throw new PollError('Ungültige anonyme Abstimmungskennung.');
    return createHmac('sha256', this.pepper).update(`vote:${pollId}:${token}`).digest('hex');
  }
  get(id, bySlug = false) {
    const poll = this.db.prepare(`SELECT * FROM polls WHERE ${bySlug ? 'slug' : 'id'}=?`).get(id);
    if (!poll) throw new PollError('Diese Umfrage wurde nicht gefunden.', 404, 'NOT_FOUND');
    poll.options = this.db.prepare('SELECT id,label,sort_order FROM poll_options WHERE poll_id=? ORDER BY sort_order,id').all(poll.id);
    poll.effective_status = effectiveStatus(poll, this.now());
    return poll;
  }
  list(admin = false) {
    return this.db.prepare(`SELECT id FROM polls ${admin ? '' : 'WHERE published_at IS NOT NULL'} ORDER BY created_at DESC,id`).all().map(({id}) => {
      const poll = this.get(id);
      return admin ? { ...poll, results: this.results(poll) } : this.publicPoll(poll);
    });
  }
  publicPoll(poll) {
    // Explicit allowlist: never export voter IDs, per-vote timestamps or administration data.
    return Object.fromEntries(['id', ...COLS, 'options', 'published_at', 'created_at', 'updated_at', 'revision', 'effective_status'].map(key => [key, poll[key]]));
  }
  view(slug, token) {
    const poll = this.get(slug, true);
    if (!poll.published_at) throw new PollError('Diese Umfrage ist nicht veröffentlicht.', 404, 'NOT_FOUND');
    const vote = token ? this.db.prepare('SELECT id,option_id FROM votes WHERE poll_id=? AND anonymous_vote_identifier=?').get(poll.id, this.tokenHash(poll.id, token)) : undefined;
    const voted = Boolean(vote);
    const feedback_submitted=Boolean(vote&&this.db.prepare('SELECT id FROM poll_feedback WHERE vote_id=?').get(vote.id));
    return { poll: this.publicPoll(poll), voted, selected_option: vote?.option_id ?? null, feedback_submitted, results: canSeeResults(poll, voted, this.now()) ? this.results(poll) : null };
  }
  results(poll) {
    const rows = this.db.prepare('SELECT option_id,COUNT(*) AS count FROM votes WHERE poll_id=? GROUP BY option_id').all(poll.id);
    const counts = poll.options.map(o => Number(rows.find(row => row.option_id === o.id)?.count ?? 0));
    const pct = percentages(counts);
    return { total: counts.reduce((a, b) => a + b, 0), options: poll.options.map((o, i) => ({ ...o, count: counts[i], percentage: pct[i] })) };
  }
  create(input) {
    const value = validatePoll(input);
    return this.transaction(() => {
      this.checkSlug(value.slug);
      const id = randomUUID(), now = new Date(this.now()).toISOString();
      const published = ['scheduled', 'active'].includes(value.status) ? now : null;
      if (['ended', 'paused', 'archived'].includes(value.status)) throw new PollError('Neue Umfragen zunächst als Entwurf, geplant oder aktiv anlegen.');
      this.db.prepare(`INSERT INTO polls(id,${COLS.join(',')},published_at,created_at,updated_at) VALUES (${Array(COLS.length + 4).fill('?').join(',')})`).run(id, ...COLS.map(k => value[k]), published, now, now);
      this.insertOptions(id, value.options);
      return this.get(id);
    });
  }
  checkSlug(slug, id = '') {
    if (this.db.prepare('SELECT id FROM polls WHERE slug=? AND id<>?').get(slug, id) || this.db.prepare('SELECT slug FROM retired_slugs WHERE slug=?').get(slug)) throw new PollError('Dieser Slug ist bereits vergeben oder wurde dauerhaft stillgelegt.', 409, 'SLUG_CONFLICT');
  }
  insertOptions(id, options) {
    const statement = this.db.prepare('INSERT INTO poll_options(id,poll_id,label,sort_order) VALUES (?,?,?,?)');
    for (const option of options) statement.run(option.id, id, option.label, option.sort_order);
  }
  update(id, input) {
    return this.transaction(() => {
      const old = this.get(id);
      if (input?.revision !== old.revision) throw new PollError('Die Umfrage wurde inzwischen geändert. Bitte neu laden.', 409, 'REVISION_CONFLICT');
      const value = validatePoll({ ...old, ...input });
      if (old.published_at && (value.slug !== old.slug || value.status === 'draft')) throw new PollError('Veröffentlichte URLs bleiben stabil. Zum Unterbrechen bitte pausieren.');
      if (!old.published_at && ['paused', 'ended', 'archived'].includes(value.status) && value.status !== 'archived') throw new PollError('Dieser Status setzt eine veröffentlichte Umfrage voraus.');
      this.checkSlug(value.slug, id);
      const hasVotes = this.results(old).total > 0;
      if (hasVotes && (value.question !== old.question || value.options.length !== old.options.length || value.options.some(o => !old.options.some(p => p.id === o.id && p.label === o.label)))) throw new PollError('Nach der ersten Stimme bleiben Frage und Antworten unverändert. Bitte duplizieren, um eine neue Version zu starten.', 409, 'VOTES_EXIST');
      const now = new Date(this.now()).toISOString();
      if (['ended', 'archived'].includes(value.status) && old.published_at && (!value.ends_at || value.ends_at > now)) value.ends_at = now;
      const published = old.published_at ?? (['scheduled','active'].includes(value.status) ? now : null);
      this.db.prepare(`UPDATE polls SET ${COLS.map(k => `${k}=?`).join(',')},published_at=?,updated_at=?,revision=revision+1 WHERE id=?`).run(...COLS.map(k => value[k]), published, now, id);
      if (hasVotes) {
        for (const option of value.options) this.db.prepare('UPDATE poll_options SET sort_order=? WHERE id=? AND poll_id=?').run(option.sort_order, option.id, id);
      } else {
        this.db.prepare('DELETE FROM poll_options WHERE poll_id=?').run(id);
        this.insertOptions(id, value.options);
      }
      return this.get(id);
    });
  }
  duplicate(id) {
    const old = this.get(id);
    const suffix = randomUUID().slice(0, 8);
    return this.create({ ...old, title: `${old.title.slice(0, 165)} (Kopie)`, slug: `${old.slug.slice(0, 80)}-kopie-${suffix}`, status: 'draft', starts_at: null, ends_at: null, options: old.options.map(({label}) => ({label})) });
  }
  vote(slug, optionId, token) {
    this.transaction(() => {
      const poll = this.get(slug, true);
      if (!poll.published_at || poll.effective_status !== 'active') throw new PollError('Diese Umfrage nimmt gerade keine Stimmen an.', 409, 'NOT_ACTIVE');
      if (!poll.options.some(o => o.id === optionId)) throw new PollError('Bitte eine gültige Antwort auswählen.', 400, 'INVALID_OPTION');
      const hash = this.tokenHash(poll.id, token);
      if (this.db.prepare('SELECT id FROM votes WHERE poll_id=? AND anonymous_vote_identifier=?').get(poll.id, hash)) throw new PollError('Deine Stimme wurde bereits gespeichert.', 409, 'ALREADY_VOTED');
      this.db.prepare('INSERT INTO votes(id,poll_id,option_id,anonymous_vote_identifier,created_at) VALUES (?,?,?,?,?)').run(randomUUID(), poll.id, optionId, hash, new Date(this.now()).toISOString());
    });
    return this.view(slug, token);
  }
  feedback(slug,token,input){
    const body=text(input?.text,'Feedback',1500,true);
    return this.transaction(()=>{
      const poll=this.get(slug,true);
      if(!poll.published_at||!poll.feedback_enabled||['draft','archived','paused','scheduled'].includes(poll.effective_status))throw new PollError('Diese Umfrage nimmt gerade kein Feedback an.',409,'FEEDBACK_CLOSED');
      const vote=this.db.prepare('SELECT id FROM votes WHERE poll_id=? AND anonymous_vote_identifier=?').get(poll.id,this.tokenHash(poll.id,token));
      if(!vote)throw new PollError('Optionales Feedback ist nach Deiner Abstimmung möglich.',403,'VOTE_REQUIRED');
      if(this.db.prepare('SELECT id FROM poll_feedback WHERE vote_id=?').get(vote.id))return {feedback_submitted:true};
      const now=new Date(this.now()).toISOString();
      this.db.prepare('INSERT INTO poll_feedback(id,poll_id,vote_id,body,created_at,updated_at) VALUES(?,?,?,?,?,?)').run(randomUUID(),poll.id,vote.id,body,now,now);
      return {feedback_submitted:true};
    });
  }
  listFeedback(pollId,offset=0){
    this.get(pollId);
    if(!Number.isSafeInteger(offset)||offset<0||offset>1000000)throw new PollError('Ungültige Feedback-Seite.');
    const total=Number(this.db.prepare('SELECT COUNT(*) AS count FROM poll_feedback WHERE poll_id=?').get(pollId).count);
    const items=this.db.prepare(`SELECT f.id,f.body,f.status,f.created_at,f.updated_at,o.label AS selected_option
      FROM poll_feedback f JOIN votes v ON v.id=f.vote_id JOIN poll_options o ON o.id=v.option_id
      WHERE f.poll_id=? ORDER BY f.created_at DESC,f.id DESC LIMIT 50 OFFSET ?`).all(pollId,offset);
    return {items,total,next_offset:offset+items.length<total?offset+items.length:null};
  }
  updateFeedback(pollId,id,{status}={}){
    if(!['new','read','archived'].includes(status))throw new PollError('Ungültiger Feedback-Status.');
    const changed=this.db.prepare('UPDATE poll_feedback SET status=?,updated_at=? WHERE id=? AND poll_id=?').run(status,new Date(this.now()).toISOString(),id,pollId);
    if(!changed.changes)throw new PollError('Feedback nicht gefunden.',404);
    return {updated:true};
  }
  deleteFeedback(pollId,id,{confirmation}={}){
    if(confirmation!=='FEEDBACK LÖSCHEN')throw new PollError('Bitte das Löschen dieses Feedbacks bestätigen.');
    const changed=this.db.prepare('DELETE FROM poll_feedback WHERE id=? AND poll_id=?').run(id,pollId);
    if(!changed.changes)throw new PollError('Feedback nicht gefunden.',404);
    return {deleted:true};
  }
  delete(id, { revision, confirmation } = {}) {
    return this.transaction(() => {
      const poll = this.get(id);
      if (revision !== poll.revision || confirmation !== poll.title) throw new PollError('Zum Löschen bitte den aktuellen Titel bestätigen.', 409);
      if (poll.published_at) this.db.prepare('INSERT OR IGNORE INTO retired_slugs VALUES (?,?)').run(poll.slug, new Date(this.now()).toISOString());
      this.db.prepare('DELETE FROM polls WHERE id=?').run(id);
      return { deleted: true };
    });
  }
  deleteVotes(id, { revision, confirmation } = {}) {
    return this.transaction(() => {
      const poll = this.get(id);
      if (revision !== poll.revision || confirmation !== 'STIMMEN LÖSCHEN' || !['paused','ended','archived'].includes(poll.effective_status)) throw new PollError('Stimmen nur bei unterbrochener/beendeter Umfrage und ausdrücklicher Bestätigung löschen.', 409);
      const result = this.db.prepare('DELETE FROM votes WHERE poll_id=?').run(id);
      this.db.prepare('UPDATE polls SET revision=revision+1,updated_at=? WHERE id=?').run(new Date(this.now()).toISOString(), id);
      return { deleted_votes: Number(result.changes) };
    });
  }
  backup(path) { this.db.prepare('VACUUM INTO ?').run(path); chmodSync(path, 0o600); }
}

// Separate database; no address, user agent, vote choice or voter token is recorded here.
export class PollAbuseStore {
  constructor({ path, pepper, now = () => Date.now() }) {
    if (typeof pepper !== 'string' || pepper.length < 32) throw new Error('POLLS_ABUSE_PEPPER must contain at least 32 characters.');
    this.db = openDb(path); this.pepper = pepper; this.now = now;
    this.db.exec('CREATE TABLE IF NOT EXISTS windows (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL) STRICT; CREATE INDEX IF NOT EXISTS window_expiry ON windows(expires_at);');
    this.purge();
  }
  close() { this.db.close(); }
  purge() {
    const removed=this.db.prepare('DELETE FROM windows WHERE expires_at <= ?').run(this.now());
    if(removed.changes)this.db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
  }
  consume(address, scope, limit, durationMs) {
    const now = this.now(), bucket = Math.floor(now / durationMs), day = new Date(now).toISOString().slice(0, 10);
    const key = createHmac('sha256', this.pepper).update(`${day}:${scope}:${bucket}:${address}`).digest('hex');
    this.purge();
    const row = this.db.prepare('INSERT INTO windows(key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').get(key, (bucket + 1) * durationMs);
    if (row.count > limit) throw new PollError('Zu viele Anfragen. Bitte versuche es später erneut.', 429, 'RATE_LIMITED');
  }
}
