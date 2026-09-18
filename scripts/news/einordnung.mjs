// Die Einordnung automatisiert übernehmen - ohne bezahlten Aufruf.
//
// Natalie am 18.09.2026: "Meine Einordnung sollte automatisiert erfolgen. Wir
// hatten ja mal einen Prozess, wo ChatGPT mit eingebunden war. Wenn ChatGPT nur
// diese Antwort liefern muss, könnte der Prozess funktionieren."
//
// Genau deshalb funktioniert dieser Schnitt, wo die alte Bridge scheiterte
// (15.09.: 801 Meldungen in der Warteschlange, 276 Aufträge geclaimt und nie
// geliefert, Wirkungsbewertungen als insufficient_basis):
//   - Es wird nichts geclaimt. Bleibt die Antwort aus, ändert sich nichts.
//   - Fakten, Quellen und MPD bleiben bei der API. Übernommen wird ein Abschnitt.
//   - Der Beitrag ist längst veröffentlicht; die Einordnung kommt als
//     Korrekturfassung nach und erscheint in Natalies Freigabeliste.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withoutProcessNotes, processNoteFindings } from './editorial-markdown.mjs';
import { publishedEdition, stageCorrectionVersion, LANE_WAIT } from './korrekturfassung.mjs';
import { bridgeSession } from './bridge/remote.mjs';
import { acquireLane } from './bridge/acquire-lane.mjs';

export const EINORDNUNG_TITEL = '## Meine Einordnung';
// Die Notiz ist die Marke: an ihr erkennt die Arbeitsliste eine schon
// uebernommene Einordnung. Sie steht im Korrekturvermerk der Fassung und ist
// damit auch fuer die Leserin sichtbar - kein verstecktes Nebenfeld.
export const EINORDNUNG_NOTIZ = 'Die persönliche Einordnung wurde überarbeitet. Befund, Quellen und Wirkungsbewertung sind unverändert.';
export const EINORDNUNG_MIN = 300;
export const EINORDNUNG_MAX = 2600;

// Zahlen und Adressen sind Tatsachenbehauptungen. Eine Einordnung gewichtet das
// Belegte; sie darf nichts Neues belegen wollen. Was im Beitrag steht, darf sie
// aufgreifen - alles andere nicht.
const zahlen = (text) => [...String(text).matchAll(/\d[\d.,]*/g)].map((treffer) => treffer[0].replace(/[.,]$/, ''));

export function pruefeEinordnung(text, basis) {
  const roh = String(text || '').replace(/\r\n/g, '\n').trim();
  if (roh.length < EINORDNUNG_MIN) throw Object.assign(Error('EINORDNUNG_ZU_KURZ'), { detail: `${roh.length} Zeichen` });
  if (roh.length > EINORDNUNG_MAX) throw Object.assign(Error('EINORDNUNG_ZU_LANG'), { detail: `${roh.length} Zeichen` });
  const vermerke = processNoteFindings(roh);
  if (vermerke.length) throw Object.assign(Error('EDITORIAL_PROCESS_NOTE_IN_TEXT'), { detail: vermerke.join(' | ') });
  if (/https?:\/\/|\bwww\./i.test(roh)) throw Error('EINORDNUNG_QUELLE_IM_TEXT');
  if (/^#{1,6}\s/m.test(roh)) throw Error('EINORDNUNG_UEBERSCHRIFT_IM_TEXT');
  const bekannt = new Set(zahlen(basis));
  const neu = [...new Set(zahlen(roh))].filter((zahl) => !bekannt.has(zahl) && zahl.replace(/\D/g, '').length > 1);
  if (neu.length) throw Object.assign(Error('EINORDNUNG_NEUE_ZAHL'), { detail: neu.slice(0, 5).join(', ') });
  return roh;
}

// Ersetzt ausschliesslich den Abschnitt "Meine Einordnung". Alles davor - Befund,
// Quellen, Werkangaben - bleibt Zeichen fuer Zeichen stehen.
export function einordnungErsetzen(body, text) {
  const quelle = String(body || '').replace(/\r\n/g, '\n');
  const start = quelle.indexOf(EINORDNUNG_TITEL);
  if (start < 0) throw Error('EINORDNUNG_ABSCHNITT_FEHLT');
  const danach = quelle.slice(start + EINORDNUNG_TITEL.length);
  const naechster = danach.search(/\n##\s/);
  const schwanz = naechster < 0 ? '' : danach.slice(naechster);
  const geprueft = pruefeEinordnung(text, quelle.slice(0, start));
  return `${quelle.slice(0, start)}${EINORDNUNG_TITEL}\n\n${geprueft}${schwanz ? `\n${schwanz.replace(/^\n+/, '')}` : '\n'}`
    .replace(/\n{3,}/g, '\n\n').replace(/\s+$/, '');
}

// Eine offene Korrekturfassung je Beitrag. Natalie am 18.09.2026: "ChatGPT soll
// nur 1x taeglich laufen? Ich wuerde eher sagen stuendlich." Stuendlich heisst:
// solange eine Fassung in ihrer Freigabeliste wartet, steht der Beitrag weiter
// auf der Arbeitsliste - und ohne diese Sperre lieferte jede Stunde eine neue
// Fassung derselben Meldung in ihre Liste.
export async function offeneKorrektur(session, edition) {
  const rows = (await session?.store?.all?.()) || [];
  return rows.find((row) => row?.intake?.trigger_type === 'correction_version'
    && row.intake?.revision_target?.slug === edition.slug && !row.ack) || null;
}

export async function uebernehmeEinordnung({ session, slug, text, owner, root = '.', now = () => new Date().toISOString(), note = null }) {
  const edition = publishedEdition(slug, root);
  const wartend = await offeneKorrektur(session, edition);
  if (wartend) return { status: 'already_pending', slug: edition.slug, job_id: wartend.input?.job_id || null };
  const body = einordnungErsetzen(edition.body_markdown, text);
  // Der Filter laeuft auch hier: er ist die zweite Grenze, nicht die erste.
  if (processNoteFindings(withoutProcessNotes(body)).length) throw Error('EDITORIAL_PROCESS_NOTE_IN_TEXT');
  return stageCorrectionVersion(session, { slug: edition.slug, body, owner, root, now,
    note: note || EINORDNUNG_NOTIZ,
    brief: 'Übernahme einer überarbeiteten persönlichen Einordnung. Kein neuer Befund, keine neuen Quellen.' });
}

// Die oeffentliche Arbeitsliste: welche veroeffentlichten Beitraege warten noch
// auf Natalies Stimme. Oeffentlich lesbar, damit die Automatisierung auf ihrer
// Seite keine Zugangsdaten braucht - sie liest die Liste und den Beitrag.
// Woran erkennt die Liste eine schon uebernommene Einordnung? An der Notiz der
// Korrekturfassung. `revision > 1` war dafuer falsch: eine Ausgabe kann aus
// einem anderen Grund korrigiert worden sein und traegt dann weiter die alte
// Einordnung. Natalie am 18.09.2026 zum Meta-Urteil: "und die aktuellen haben
// ja auch bloedsinn drin" - es geht also nicht um die fehlenden, sondern um
// alle, die noch nicht ueberarbeitet sind.
export function uebernommeneEinordnungen(revisionen = []) {
  return new Set((revisionen || [])
    .filter((eintrag) => String(eintrag?.patch?.correction_note || '').startsWith(EINORDNUNG_NOTIZ.slice(0, 48)))
    .map((eintrag) => eintrag?.target?.slug || eintrag?.slug)
    .filter(Boolean));
}

export function offeneEinordnungen(editions = [], { revisionen = [], limit = 30 } = {}) {
  const fertig = uebernommeneEinordnungen(revisionen);
  return editions
    .filter((edition) => edition?.slug && edition.published_at && !fertig.has(edition.slug))
    .sort((a, b) => String(b.published_at).localeCompare(String(a.published_at)))
    .slice(0, limit)
    .map((edition) => ({ slug: edition.slug, titel: edition.title, art: edition.subtype,
      veroeffentlicht: edition.published_at,
      url: `https://wirkungsoekonomie.de/wirkungsticker/analyse/${edition.slug}/` }));
}

const SKIP = new Set(['BRIDGE_NOT_CONFIGURED', 'BRIDGE_LANE_BUSY', 'BRIDGE_UNREACHABLE', 'BRIDGE_REMOTE_CONFIG_REQUIRED']);

// Ein Lauf uebernimmt genau eine Einordnung. Die Spur ist dieselbe wie im
// Redaktionsworker; der Platz ist ein eigener, damit er keinem anderen Schritt
// den seinen wegnimmt.
export async function runEinordnung({ session = null, env = process.env, root = '.', now = () => new Date().toISOString(), laneWait = null } = {}) {
  const slug = env.WOEK_EINORDNUNG_SLUG, text = env.WOEK_EINORDNUNG_TEXT;
  if (!slug || !text) throw Error('EINORDNUNG_EINGABE_UNVOLLSTAENDIG');
  let store, transport;
  try { ({ store, transport } = session || bridgeSession(env)); }
  catch (error) { if (SKIP.has(error.message)) return { status: 'skipped', reason: error.message }; throw error; }
  let acquired = false;
  try { await acquireLane(() => store.acquire(now(), 'import', { manualRunId: `${env.GITHUB_RUN_ID || '0'}:${env.GITHUB_RUN_ATTEMPT || '1'}6` }), { ...LANE_WAIT, ...(laneWait || {}) }); acquired = true; }
  catch (error) { if (SKIP.has(error.message)) return { status: 'skipped', reason: error.message }; throw error; }
  try {
    // Wem der private Redaktionstisch gehoert, steht in einem echten
    // eingereichten Auftrag - nicht in einer Konfiguration und nicht im Code.
    const rows = await store.all();
    const reference = rows.find((row) => row?.input?.job_type === 'editorial_request');
    const owner = reference ? (await store.get(reference.input.job_id))?.intake?.owner : null;
    if (!/^\d{15,22}$/.test(owner || '')) return { status: 'owner_unknown' };
    return await uebernehmeEinordnung({ session: { store, transport }, slug, text, owner, root, now });
  } finally { if (acquired) await store.release(true).catch(() => {}); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // Eine Zeile, kein eingeruecktes JSON: der Workflow liest die letzte Zeile
  // fuer den Kommentar am Issue. Am 18.09.2026 war das "}" - drei erfolgreiche
  // Uebernahmen standen dort als EINORDNUNG_TECHNISCHER_FEHLER.
  try { console.log(JSON.stringify(await runEinordnung())); }
  catch (error) {
    console.error(JSON.stringify({ status: 'failed', error: /^[A-Z_0-9:.-]+$/.test(error?.message || '') ? error.message : 'EINORDNUNG_FEHLGESCHLAGEN',
      detail: String(error?.detail || '').slice(0, 120) || null }));
    process.exitCode = 1;
  }
}
