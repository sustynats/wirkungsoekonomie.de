import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { grundlage, nachrechercheJob, nachrecherche, RESEARCH_NOTE } from '../../scripts/news/nachrecherche.mjs';
import { manualRequest } from '../../scripts/news/redaktionsworker.mjs';
import { JOB_ID, hash } from '../../scripts/news/bridge/contract.mjs';

// Natalie am 18.09.2026: „auch hier nochmal recherchieren. Da findet sich was und
// dann live." Die angehaltene Ueberarbeitung der Oelkrise-Analyse hing an Reuters
// (401); frei lesbare Belege gab es (CNBC, NPR, Al Jazeera).
const eltern = 'wt_20260918T091011Z_6f31ec6a01ca595b7343b821';
const at = '2026-09-18T18:30:00.000Z';
const kommentare = [{ comment: 'GEHEIMER KOMMENTAR' }];
const korrektur = (felder = {}) => ({
  input: { job_id: 'wt_20260918T091011Z_d499d6e90d55c99c7d8e130a', job_type: 'editorial_request', input_hash: 'x', created_at: '2026-09-18T10:50:40Z',
    request: { kind: 'opinion_analysis', brief: 'Korrekturfassung von "Wenn der Ausweichweg ausfällt".', links: ['https://www.reuters.com/a', 'https://www.eia.gov/b'],
      revision: { previous_preview: { title: 'Wenn der Ausweichweg ausfällt' }, previous_hash: 'p', comments: kommentare } },
    instructions: 'Der Text dieser Korrekturfassung steht fest und wird nicht neu verfasst.' },
  candidate: { story_id: 'wt-oel' }, status: 'accepted', created_at: '2026-09-18T10:50:40Z',
  intake: { owner: '1206956406805102593', trigger_type: 'correction_version', review_parent: eltern,
    revision_target: { slug: 'wenn-der-ausweichweg-ausfallt', base_hash: 'b' }, revision_base: { slug: 'wenn-der-ausweichweg-ausfallt' }, editorial_hold: { code: 'SOURCE_VERIFICATION_REQUIRED' } },
  ...felder });
const neu = ['https://www.cnbc.com/2026/09/11/saudi-arabia-shut-down-east-west-crude-oil-pipeline.html', 'https://www.npr.org/2026/09/11/g-s1-142842/us-diesel-6-a-gallon'];

test('die Nachrecherche traegt die Rueckgabe mit: Kommentare, bisherige Fassung, Ziel der Korrektur', () => {
  const job = nachrechercheJob(eltern, korrektur(), { links: neu, at });
  assert.match(job.input.job_id, JOB_ID);
  assert.equal(job.input.job_id.slice(0, 20), eltern.slice(0, 20));
  assert.deepEqual(job.input.request.revision.comments, kommentare, 'Natalies Kommentare bleiben');
  assert.deepEqual(job.intake.revision_target, korrektur().intake.revision_target, 'eine Korrekturfassung bleibt eine Korrektur, kein zweiter Artikel');
  assert.equal(job.intake.trigger_type, 'correction_version', 'einordnung.mjs erkennt sie weiter als offene Korrektur');
  assert.equal(job.intake.review_parent, eltern, 'das Ergebnis landet in derselben Karte');
  assert.equal(job.intake.manual_research, true);
  assert.equal(manualRequest(job), true, 'Vorrang vor automatischen Vorschlaegen');
  assert.equal(job.intake.editorial_hold, undefined, 'der alte Halt gehoert nicht zum neuen Auftrag');
  assert.equal(job.status, 'queued');
  assert.equal(job.input.input_hash, hash(job.input.request));
  // Neue Quellen zuerst (der Worker liest die ersten sechs), eine bisherige bleibt fuer die Bindung.
  assert.deepEqual(job.input.request.links, [...neu, 'https://www.reuters.com/a', 'https://www.eia.gov/b']);
  assert.ok(job.input.request.brief.endsWith(RESEARCH_NOTE));
  assert.match(job.input.request.brief, /^Korrekturfassung von/);
});

test('die Grundlage ist die juengste Ueberarbeitung, ohne Quellen-Nachrecherchen', () => {
  const alt = korrektur({ created_at: '2026-09-17T10:00:00Z', input: { ...korrektur().input, job_id: 'wt_20260917T100000Z_aaaaaaaaaaaaaaaaaaaaaaaa' } });
  const reparatur = korrektur({ created_at: '2026-09-18T12:00:00Z', intake: { ...korrektur().intake, research_parent: 'x' },
    input: { ...korrektur().input, job_id: 'wt_20260918T120000Z_bbbbbbbbbbbbbbbbbbbbbbbb' } });
  const erste = { input: { job_id: eltern, job_type: 'editorial_request', request: { brief: 'b', links: [] } }, intake: {}, created_at: '2026-09-18T09:10:11Z' };
  assert.equal(grundlage([erste, alt, korrektur(), reparatur], eltern).input.job_id, korrektur().input.job_id);
  assert.equal(grundlage([erste], eltern), erste, 'ohne Ueberarbeitung der urspruengliche Auftrag');
  assert.equal(grundlage([], eltern), null);
});

test('ohne frei lesbare Quelle oder mit ungueltigem Ziel wird nichts eingereiht', () => {
  assert.throws(() => nachrechercheJob(eltern, korrektur(), { links: ['http://unsicher.example'], at }), /NACHRECHERCHE_LINKS_FEHLEN/);
  assert.throws(() => nachrechercheJob('kein-ziel', korrektur(), { links: neu, at }), /NACHRECHERCHE_ZIEL_UNGUELTIG/);
});

test('das Paket liegt im Postfach, bevor der Auftrag in der Ablage steht, und nichts Privates im Protokoll', async () => {
  const calls = [], files = new Map(), rows = [korrektur()];
  const session = {
    store: { acquire: async (...args) => calls.push(`acquire:${args[2]?.manualRunId}`), release: async (ok) => calls.push(`release:${ok}`),
      all: async () => rows, get: async (id) => rows.find((row) => row.input.job_id === id) || null,
      put: async (job) => { calls.push(`put:${files.has(`/WOEK/WIRKUNGSTICKER-CHATGPT-BRIDGE/00_INBOX/${job.input.job_id}.input.json`)}`); rows.push(job); } },
    transport: { writeAtomic: async (file, value) => { files.set(file, JSON.stringify(value)); calls.push('write'); }, read: async (file) => files.get(file) },
  };
  const env = { WOEK_RESEARCH_REVIEW: eltern, WOEK_RESEARCH_LINKS: neu.join(' '), GITHUB_RUN_ID: '42', GITHUB_RUN_ATTEMPT: '1' };
  const ergebnis = await nachrecherche({ session, env, now: () => at });
  assert.equal(ergebnis.status, 'queued');
  assert.equal(ergebnis.korrekturfassung, true);
  assert.deepEqual(calls, ['acquire:42:14', 'write', 'put:true', 'release:true']);
  assert.equal(JSON.stringify(ergebnis).includes('GEHEIM'), false);
  const nochmal = await nachrecherche({ session, env, now: () => at });
  assert.equal(nochmal.status, 'already_queued', 'zweimal gestartet reiht nicht zweimal ein');
});

test('der Workflow hat den vollstaendigen Abhaengigkeitsbaum im sparse checkout', () => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/nachrecherche.yml'), 'utf8');
  const checkout = workflow.split('sparse-checkout: |')[1].split('sparse-checkout-cone-mode:')[0].trim().split('\n').map((line) => line.trim());
  const visited = new Set();
  const visit = (file) => {
    if (visited.has(file)) return;
    visited.add(file);
    assert.ok(checkout.includes(file), `Der Nachrecherche-Checkout vermisst ${file}`);
    for (const match of fs.readFileSync(path.join(root, file), 'utf8').matchAll(/(?:from\s*|import\s*\(\s*|import\s*)['"](\.[^'"]+\.mjs)['"]/g)) {
      visit(path.posix.normalize(path.posix.join(path.posix.dirname(file), match[1])));
    }
  };
  visit('scripts/news/nachrecherche.mjs');
});

test('in der App steht die Nachrecherche als laufende Ueberarbeitung, nicht als angehalten', async () => {
  const { revisionStates } = await import('../../admin/redaktion/review-state.js');
  const job = nachrechercheJob(eltern, korrektur(), { links: neu, at });
  const alsAuftrag = (row) => ({ job_id: row.input.job_id, review_job_id: row.intake.review_parent, kind: row.input.request.kind, status: row.status,
    created_at: row.created_at, editorial_hold: row.intake.editorial_hold || null });
  const state = revisionStates([alsAuftrag(korrektur()), alsAuftrag(job)], [{ job_id: eltern, status: 'REVISION_REQUESTED' }]).get(eltern);
  assert.equal(state.state, 'working');
});
