import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { redaktionsauftraege, auftragsBefund, fehlerkennung, meldungsweg } from '../../scripts/ops/redaktionsauftraege.mjs';

const now = '2026-09-17T18:00:00.000Z';
const auftrag = (id, at, felder = {}) => ({ input: { job_id: id, job_type: 'editorial_request', request: { kind: 'opinion_analysis', brief: 'GEHEIMER AUFTRAGSTEXT' } },
  created_at: at, status: 'queued', intake: { owner: '1206956406805102593' }, ...felder });

const session = (rows, calls) => ({
  monitor: async () => { calls.push('monitor'); return { open_count: 3, open_personal_count: 1, oldest_open_minutes: 4321 }; },
  store: {
    acquire: async (...args) => { calls.push(`acquire:${args[1]}`); },
    release: async (ok) => { calls.push(`release:${ok}`); },
    all: async () => { calls.push('all'); return rows; },
    observation: async (key) => { calls.push('observation'); return key === 'github-attempt:woek-a' ? { status: 'draft_rejected', provider_called: true, version: 'redaktionsworker-5', error: 'EDITORIAL_MARKDOWN_DUPLICATE_TITLE · Der Titel „GEHEIMER AUFTRAGSTEXT" steht zweimal' } : null; },
    put: async () => { throw new Error('DIESER BEFUND DARF NICHTS SCHREIBEN'); },
    observe: async () => { throw new Error('DIESER BEFUND DARF NICHTS SCHREIBEN'); },
    editorialClaim: async () => { throw new Error('DIESER BEFUND DARF NICHTS FREIGEBEN'); },
  },
});

test('der Befund liest die Warteschlange und schreibt nichts', async () => {
  const calls = [];
  const ergebnis = await redaktionsauftraege({ session: session([auftrag('woek-a', '2026-09-14T09:00:00.000Z'), auftrag('woek-b', '2026-09-17T09:00:00.000Z', { status: 'acknowledged', accepted: true, completed_at: '2026-09-17T10:00:00.000Z' }),
    { input: { job_id: 'story-1', job_type: 'news_story' }, created_at: now }], calls), now });
  assert.deepEqual(calls.filter((call) => call !== 'observation'), ['monitor', 'acquire:import', 'all', 'release:true']);
  // Der Zustand, der einen Auftrag lautlos beendet: bezahlter Versuch, nichts
  // abgeliefert. Er steht im Vermerk zum Versuch, nicht im Auftrag.
  const verbraucht = ergebnis.auftraege.find((auftrag) => auftrag.job_id === 'woek-a');
  assert.deepEqual(verbraucht.versuch, { zustand: 'draft_rejected', bezahlter_aufruf: true, workerversion: 'redaktionsworker-5', verbraucht: true, grund: 'EDITORIAL_MARKDOWN_DUPLICATE_TITLE' });
  assert.equal(ergebnis.verbrauchte_auftraege, 1);
  assert.equal(ergebnis.auftraege.find((auftrag) => auftrag.job_id === 'woek-b').versuch, null);
  assert.equal(ergebnis.offene_auftraege, 1);
  assert.equal(ergebnis.auftraege.length, 2, 'nur Redaktionsauftraege, keine Nachrichtenakte');
  assert.deepEqual(ergebnis.auftraege.map((a) => a.job_id), ['woek-b', 'woek-a'], 'neueste zuerst');
  assert.equal(ergebnis.auftraege[1].stunden_alt, 81, 'das Alter macht einen liegengebliebenen Auftrag sichtbar');
});

// Die Laufprotokolle sind oeffentlich, Natalies Auftraege nicht.
test('kein Auftragstext verlaesst die private Warteschlange', async () => {
  const ergebnis = await redaktionsauftraege({ session: session([auftrag('woek-a', '2026-09-14T09:00:00.000Z')], []), now });
  assert.equal(JSON.stringify(ergebnis).includes('GEHEIMER AUFTRAGSTEXT'), false);
  assert.deepEqual(Object.keys(auftragsBefund(auftrag('woek-a', now), now)).sort(),
    ['abgeschlossen', 'angenommen', 'art', 'ausloeser', 'erstellt', 'fehler', 'fehlversuche', 'job_id', 'letzter_fehler', 'nachbesserungen', 'quittung', 'rueckgabe_von', 'stunden_alt', 'zustand']);
});

test('eine belegte Importspur macht den Befund nicht wertlos', async () => {
  const calls = [];
  const belegt = { monitor: async () => ({ open_count: 3, open_personal_count: 2, oldest_open_minutes: 10 }),
    store: { acquire: async () => { throw new Error('BRIDGE_RUN_LOCKED'); }, release: async () => calls.push('release') } };
  const ergebnis = await redaktionsauftraege({ session: belegt, now });
  assert.equal(ergebnis.warteschlange_unlesbar, 'BRIDGE_RUN_LOCKED');
  assert.equal(ergebnis.offene_auftraege, 2, 'die Zahl offener Auftraege kommt ohne Spur');
  assert.deepEqual(calls, [], 'eine nicht erhaltene Spur wird nicht freigegeben');
});

test('der Befund-Lauf hat seinen vollstaendigen Abhaengigkeitsbaum im sparse checkout', () => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/ops-redaktionsauftraege.yml'), 'utf8');
  const checkout = workflow.split('sparse-checkout: |')[1].split('sparse-checkout-cone-mode:')[0].trim().split('\n').map((line) => line.trim());
  const visited = new Set();
  const visit = (file) => {
    if (visited.has(file)) return;
    visited.add(file);
    assert.ok(checkout.includes(file), `Der Befund-Checkout vermisst ${file}`);
    for (const match of fs.readFileSync(path.join(root, file), 'utf8').matchAll(/(?:from\s*|import\s*\(\s*|import\s*)['"](\.[^'"]+\.mjs)['"]/g)) {
      visit(path.posix.normalize(path.posix.join(path.posix.dirname(file), match[1])));
    }
  };
  visit('scripts/ops/redaktionsauftraege.mjs');
});

// Der erste Lauf am 17.09.2026 zeigte 25 erledigte Auftraege von heute und
// gestern - und verdeckte damit genau die vier offenen, die aelter waren.
test('offene Auftraege stehen im Befund, auch wenn sie alt sind', async () => {
  const viele = Array.from({ length: 30 }, (_, i) => auftrag(`neu-${i}`, `2026-09-17T${String(i % 24).padStart(2, '0')}:00:00.000Z`, { status: 'accepted', accepted: true }));
  const alt = auftrag('alt-offen', '2026-09-11T08:00:00.000Z');
  const ergebnis = await redaktionsauftraege({ session: session([...viele, alt], []), now });
  assert.ok(ergebnis.auftraege.some((befund) => befund.job_id === 'alt-offen'), 'der alte offene Auftrag steht drin');
  assert.equal(ergebnis.auftraege.filter((befund) => befund.zustand === 'accepted').length, 10, 'von den erledigten reichen die zehn neuesten');
  assert.equal(ergebnis.auftraege[0].job_id, 'alt-offen', 'offene zuerst');
});

// Der Grund muss mitkommen - sonst weiss man, dass etwas scheiterte, aber
// nicht was. Er darf aber nichts vom Entwurf zeigen.
test('die Fehlerkennung kommt mit, das Detail bleibt drin', () => {
  assert.equal(fehlerkennung('EDITORIAL_MARKDOWN_DUPLICATE_TITLE · Der Titel steht zweimal'), 'EDITORIAL_MARKDOWN_DUPLICATE_TITLE');
  assert.equal(fehlerkennung('Unerwarteter Satz mit Auftragstext'), 'nicht als Kennung lesbar');
  assert.equal(fehlerkennung(''), null);
  assert.equal(fehlerkennung(undefined), null);
});

// Eine Rueckgabe mit Kommentar erzeugt einen Kind-Auftrag. Scheitert er an
// seinen Pruefungen, wird er abgesondert, und in der App steht der alte Eintrag
// fuer immer auf "mit Kommentar zurueckgegeben".
test('eine gescheiterte Ueberarbeitung zeigt Herkunft und Grund', () => {
  const kind = auftrag('woek-kind', '2026-09-14T20:33:02.000Z', { status: 'quarantined',
    intake: { review_parent: 'woek-eltern', trigger_type: 'manual_revision' },
    attempts: { intake: 3 }, last_error: { error_code: 'INTAKE_REVISION_SOURCE_INVALID' } });
  const befund = auftragsBefund(kind, now);
  assert.equal(befund.rueckgabe_von, 'woek-eltern');
  assert.equal(befund.letzter_fehler, 'INTAKE_REVISION_SOURCE_INVALID');
  assert.equal(befund.fehlversuche, 3);
});

// Bei Meldungen heisst "angenommen" nur: Recherche liegt vor. Ob daraus eine
// Meldung in der Freigabeliste wurde, steht im Meldungsauftrag (18.09.2026).
test('eine zurueckgegebene Meldung zeigt, wo ihr Meldungsweg steht', async () => {
  const kind = auftrag('woek-kind', '2026-09-18T09:47:54.000Z', { status: 'accepted', input: { job_id: 'woek-kind', job_type: 'editorial_request', request: { kind: 'news', brief: 'GEHEIMER AUFTRAGSTEXT' } },
    intake: { kind: 'news', review_parent: 'woek-eltern', news_research: { title: 'GEHEIMER AUFTRAGSTEXT' }, news_job_id: 'story-9', news_retry_at: '2026-09-18T10:00:00.000Z' } });
  const meldung = { input: { job_id: 'story-9', job_type: 'new_story' }, status: 'accepted', accepted: { record: { title: 'GEHEIMER AUFTRAGSTEXT' } }, semantic_review: { assessment: { publication_status: 'hold' } } };
  const holte = [];
  const sitzung = session([kind], []);
  sitzung.store.get = async (id) => { holte.push(id); return null; };
  const ergebnis = await redaktionsauftraege({ session: { ...sitzung, store: { ...sitzung.store, all: async () => [kind, meldung] } }, now });
  const befund = ergebnis.auftraege.find((a) => a.job_id === 'woek-kind');
  assert.deepEqual(befund.meldungsweg, { recherche: true, recherche_gestoppt: false, nachrecherche: null, meldung: 'accepted',
    meldung_quittung: null, meldung_bewertet: true, zweitpruefung: 'hold', bereits_berichtet: false, naechster_versuch: '2026-09-18T10:00:00.000Z' });
  assert.deepEqual(holte, [], 'was store.all schon liefert, wird nicht einzeln geholt');
  assert.equal(JSON.stringify(ergebnis).includes('GEHEIMER AUFTRAGSTEXT'), false);
  // Fehlt der Meldungsauftrag (archiviert), wird er einzeln gefragt.
  assert.equal(meldungsweg({ intake: { news_job_id: 'weg' } }, null).meldung, 'fehlt');
});
