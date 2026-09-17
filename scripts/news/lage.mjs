// Drei redaktionelle Lagen am Tag statt Stundenjagd (Natalie, 17.09.2026):
// gesammelt wird permanent, veroeffentlicht gebuendelt. Plan:
// docs/news/LAGEN-UMBAU.md
//
// Dieses Modul ist absichtlich rein: keine Dateien, kein Netz, kein Modell. Es
// rechnet Fenster, Kennungen, Eintraege und die Kopfzeile. Alles, was
// veroeffentlicht wird, laesst sich damit vorher pruefen.
import { berlinParts } from './lib.mjs';

export const LAGEN = [
  { slot: 'morgenlage', label: 'Morgenlage', hour: 6, fromHour: 18, fromPreviousDay: true,
    since: 'seit gestern Abend' },
  { slot: 'mittagslage', label: 'Mittagslage', hour: 12, fromHour: 6, fromPreviousDay: false,
    since: 'seit 6 Uhr' },
  { slot: 'abendlage', label: 'Abendlage', hour: 18, fromHour: 12, fromPreviousDay: false,
    since: 'seit 12 Uhr' },
];

// Obergrenze, keine Untergrenze. Eine Untergrenze waere ein Anreiz, kuenstlich
// Meldungen zu erzeugen - genau der Mechanismus, der abgeschafft wird.
export const MAX_ENTRIES = 15;

export function lageDefinition(slot) {
  return LAGEN.find((entry) => entry.slot === slot) || null;
}

// Der Zeitpunkt, an dem in Berlin eine bestimmte Stunde eines Tages beginnt.
// Sommerzeit wird nicht gerechnet, sondern geprueft: der Versatz, der beim
// Zurueckformatieren wieder dasselbe Datum und dieselbe Stunde ergibt, ist der
// richtige. 06/12/18 Uhr sind nie die doppelte Stunde einer Zeitumstellung.
export function berlinInstant(isoDate, hour) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(isoDate || '')) || !Number.isInteger(hour) || hour < 0 || hour > 23) return null;
  const stamp = `${isoDate}T${String(hour).padStart(2, '0')}:00:00`;
  for (const offset of ['+01:00', '+02:00']) {
    const at = Date.parse(`${stamp}${offset}`);
    if (!Number.isFinite(at)) continue;
    const parts = berlinParts(new Date(at));
    if (parts.isoDate === isoDate && parts.hourNumber === hour) return new Date(at).toISOString();
  }
  return null;
}

export function previousIsoDate(isoDate) {
  const at = Date.parse(`${isoDate}T12:00:00Z`);
  if (!Number.isFinite(at)) return null;
  return new Date(at - 86400000).toISOString().slice(0, 10);
}

// Das Fenster einer Lage, bezogen auf den Berliner Tag des Laufzeitpunkts.
export function lageWindow(slot, now) {
  const definition = lageDefinition(slot);
  const at = Date.parse(now);
  if (!definition || !Number.isFinite(at)) return null;
  const isoDate = berlinParts(new Date(at)).isoDate;
  const to = berlinInstant(isoDate, definition.hour);
  const fromDate = definition.fromPreviousDay ? previousIsoDate(isoDate) : isoDate;
  const from = fromDate ? berlinInstant(fromDate, definition.fromHour) : null;
  if (!to || !from) return null;
  return { slot, label: definition.label, since: definition.since, isoDate, from, to };
}

// Welche Lage ist zu diesem Zeitpunkt faellig? Ein Lauf, der sich verspaetet,
// gehoert weiter zu seiner Lage: von 06:00 bis vor 12:00 ist es die Morgenlage.
export function dueLage(now) {
  const at = Date.parse(now);
  if (!Number.isFinite(at)) return null;
  const hour = berlinParts(new Date(at)).hourNumber;
  const candidates = LAGEN.filter((entry) => hour >= entry.hour);
  // Vor 06:00 laeuft noch das Fenster der Abendlage des Vortags weiter; dann ist
  // keine Lage faellig, die Recherche sammelt weiter.
  return candidates.length ? candidates[candidates.length - 1].slot : null;
}

export function lageId(isoDate, slot) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(isoDate || '')) && lageDefinition(slot) ? `${isoDate}-${slot}` : null;
}

const releaseAt = (story) => Date.parse(story?.published_at || '');
const updateAt = (story) => Date.parse(story?.last_updated || story?.updated_at || story?.published_at || '');

// Maßgeblich ist die Herausgabezeit, nicht die Ereigniszeit. Am 17.09.2026 hat
// die Verwechslung beider Zeiten die Benachrichtigungen verschluckt; dieselbe
// Verwechslung wuerde hier eine Meldung aus dem Fenster fallen lassen, nur weil
// das Ereignis aelter ist als der Lauf.
// Natalies Auswahlformel vom 17.09.2026:
//   Neuigkeit x Materialitaet x MPD-Relevanz x Evidenz x Veraenderung
// Medienresonanz ist ausdruecklich KEIN Kriterium. Das ist keine Meinung gegen
// die Messung, sondern deckungsgleich mit ihr: veroeffentlichte und
// zurueckgehaltene Meldungen haben dieselbe Quellenbreite-Verteilung (je rund
// 83 % Einzelquelle). Quellenbreite ist damit kein Relevanzindikator und darf
// auch nicht als Hilfsgroesse einfliessen. Natalie: „Es duerfen aber
// insbesondere bei Technologie spannende Themen nicht unter den Tisch fallen,
// nur weil nicht alle Medien darueber berichten."
const EVIDENZ_GEWICHT = { high: 2, medium: 1, low: 0.5 };

// Themen, die im Bestand strukturell untergehen (gemessen am 17.09.2026:
// Technologie 3 und KI 3 Meldungen gegen Politik 106 und Geopolitik 80). Fuer
// sie sind Plaetze reserviert, damit sie nicht gegen lautere Politikthemen
// verlieren - aber nur mit belastbarer Wirkungsstaerke, nie als Quote.
export const RESERVIERTE_THEMEN = ['Technologie', 'KI', 'Digitalisierung', 'Wissenschaft', 'Forschung', 'Infrastruktur', 'Bildung'];
export const RESERVIERTE_PLAETZE = 2;
const RESERVE_MINDESTSTAERKE = 3;

export function lageRelevanz(story, { state = 'neu', window: fenster } = {}) {
  const dimensionen = Object.values(story?.impact_assessment?.dimensions || {});
  // Materialitaet und MPD-Relevanz: die staerkste modellierte Dimension traegt
  // die Nachrichtenlage. (Das Ergebnis der Bewertung bleibt unberuehrt - dort
  // gilt weiter Nichtkompensation.)
  const staerke = dimensionen.reduce((hoch, d) => Math.max(hoch, Number(d?.magnitude) || 0), 0);
  const evidenz = dimensionen.reduce((hoch, d) => Math.max(hoch, EVIDENZ_GEWICHT[d?.evidence] || 0), 0);
  const veraenderung = state === 'neu' ? 0.5 : 0.25;
  const von = Date.parse(fenster?.from), bis = Date.parse(fenster?.to);
  const at = Date.parse(story?.last_updated || story?.published_at || '');
  const neuigkeit = Number.isFinite(von) && Number.isFinite(bis) && bis > von && Number.isFinite(at)
    ? Math.min(1, Math.max(0, (at - von) / (bis - von))) : 0;
  return Number((staerke * 2 + evidenz + veraenderung + neuigkeit).toFixed(4));
}

const reserviert = (story) => (story?.topic || []).some((thema) => RESERVIERTE_THEMEN.includes(thema));

export function lageEntries({ stories = [], window: fenster, max = MAX_ENTRIES } = {}) {
  if (!fenster) return [];
  const from = Date.parse(fenster.from), to = Date.parse(fenster.to);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return [];
  const inWindow = (value) => Number.isFinite(value) && value > from && value <= to;
  const inhalte = stories
    .filter((story) => story?.published && story.slug)
    .map((story) => {
      const released = releaseAt(story), updated = updateAt(story);
      if (inWindow(released)) return { story, at: released, state: 'neu' };
      if (released < from && inWindow(updated)) return { story, at: updated, state: 'fortgeschrieben' };
      return null;
    })
    .filter(Boolean)
    .map((eintrag) => ({ ...eintrag, score: lageRelevanz(eintrag.story, { state: eintrag.state, window: fenster }) }));

  const grenze = Math.max(0, Number(max) || 0);
  const nachRelevanz = [...inhalte].sort((a, b) => b.score - a.score || b.at - a.at);
  const gewaehlt = nachRelevanz.slice(0, grenze);

  // Reservierte Themen: was sonst durch die Obergrenze faellt, aber belastbare
  // Wirkungsstaerke hat, verdraengt den schwaechsten Eintrag. Hoechstens zwei
  // Plaetze, und nie ohne Staerke - eine Quote waere wieder der alte Fehler.
  if (grenze > RESERVIERTE_PLAETZE) {
    const drin = new Set(gewaehlt.map((e) => e.story.story_id));
    const nachrueckend = nachRelevanz.filter((e) => !drin.has(e.story.story_id)
      && reserviert(e.story) && lageRelevanz(e.story, { state: e.state, window: fenster }) >= RESERVE_MINDESTSTAERKE);
    for (const kandidat of nachrueckend.slice(0, RESERVIERTE_PLAETZE)) {
      const schwaechster = [...gewaehlt].filter((e) => !reserviert(e.story)).sort((a, b) => a.score - b.score)[0];
      if (!schwaechster || schwaechster.score >= kandidat.score) break;
      gewaehlt.splice(gewaehlt.indexOf(schwaechster), 1, kandidat);
    }
  }

  // Angezeigt wird chronologisch: die Auswahl entscheidet die Relevanz, die
  // Reihenfolge die Zeit.
  return gewaehlt
    .sort((a, b) => b.at - a.at)
    .map(({ story, at, state, score }) => ({ story_id: story.story_id, slug: story.slug, title: story.title,
      state, at: new Date(at).toISOString(), score }));
}

// Deterministischer Text, kein Modellaufruf. Die Zahl ist gezaehlt, nicht
// geschaetzt, und null Entwicklungen sind eine Aussage, keine Leerstelle
// (Natalie: „Seit 12 Uhr gab es zu diesem großen Thema keine belastbare neue
// Entwicklung." ist journalistisch wertvoller als ein erfundener Artikel).
export function lageHeadline({ entries = [], window: fenster } = {}) {
  const since = fenster?.since || 'seit dem letzten Stand';
  if (!entries.length) return `Keine belastbare neue Entwicklung ${since}.`;
  if (entries.length === 1) return `Das ist die eine Entwicklung, die ${since} wirkungsrelevant geworden ist.`;
  return `Das sind die ${entries.length} Entwicklungen, die ${since} wirkungsrelevant geworden sind.`;
}

export function buildLage({ slot, now, stories = [], max = MAX_ENTRIES } = {}) {
  const fenster = lageWindow(slot, now);
  if (!fenster) return null;
  const entries = lageEntries({ stories, window: fenster, max });
  return {
    lage_id: lageId(fenster.isoDate, slot),
    slot, label: fenster.label, date: fenster.isoDate,
    window_from: fenster.from, window_to: fenster.to,
    stand: fenster.to,
    headline: lageHeadline({ entries, window: fenster }),
    counts: { total: entries.length, neu: entries.filter((e) => e.state === 'neu').length,
      fortgeschrieben: entries.filter((e) => e.state === 'fortgeschrieben').length },
    entries,
  };
}

// Die Ablage haelt die Lagen der letzten Tage. Derselbe Lauf zweimal ergibt
// dieselbe Lage (gleiche Kennung), es entsteht kein zweiter Eintrag - das ist
// die Voraussetzung dafuer, dass ein abgebrochener Lauf einfach wiederholt
// werden kann, ohne Doppelausgaben zu erzeugen.
export const KEEP_DAYS = 30;

export function upsertLage(store, lage, { keepDays = KEEP_DAYS, now = lage?.stand } = {}) {
  const vorher = Array.isArray(store?.lagen) ? store.lagen : [];
  if (!lage?.lage_id) return { schema_version: '1.0', updated_at: store?.updated_at || null, lagen: vorher };
  const ohne = vorher.filter((entry) => entry?.lage_id !== lage.lage_id);
  const cutoff = Date.parse(now || lage.stand) - Math.max(1, Number(keepDays) || KEEP_DAYS) * 86400000;
  const lagen = [...ohne, lage]
    .filter((entry) => Number.isFinite(Date.parse(entry?.stand)) && Date.parse(entry.stand) >= cutoff)
    .sort((a, b) => Date.parse(b.stand) - Date.parse(a.stand));
  return { schema_version: '1.0', updated_at: lage.stand, lagen };
}

// Die Reihenfolge auf der Oberflaeche: neueste Lage zuerst, und je Tag die drei
// Ausgaben in ihrer natuerlichen Folge.
export function lagenNachDatum(store) {
  const lagen = Array.isArray(store?.lagen) ? store.lagen : [];
  const tage = new Map();
  for (const lage of lagen) {
    if (!lage?.date) continue;
    if (!tage.has(lage.date)) tage.set(lage.date, []);
    tage.get(lage.date).push(lage);
  }
  return [...tage.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([date, eintraege]) => ({ date, lagen: eintraege.sort((a, b) => Date.parse(b.stand) - Date.parse(a.stand)) }));
}
