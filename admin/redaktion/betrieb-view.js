// Was der Monitor gefunden hat, in Sätzen statt in Codes.
//
// Natalie am 16.09.2026: „Ich dachte, du hast ein permanentes Monitoring
// aufgesetzt bei jedem Schritt." Es lief - nur sichtbar war es nur bei einem
// neuen Vorfall und einmal am Tag. Diese Ansicht beantwortet die Frage „läuft
// es?" beim Hinsehen. Reine Darstellung: keine Entscheidung, keine Schaltfläche,
// die etwas auslöst.
const money = (value) => (Number.isFinite(value) ? `${value.toFixed(2)} USD` : 'unbekannt');
const count = (value) => (Number.isFinite(value) ? String(value) : '–');

export function betriebsAnzeige(status, { now = new Date().toISOString(), staleMinutes = 45 } = {}) {
  if (!status || !Number.isFinite(Date.parse(status.checked_at || ''))) {
    return { tone: 'unknown', headline: 'Noch kein Befund', dot: '·',
      lines: ['Der Monitor hat seit dem letzten Start der Ablage noch nichts hinterlegt. Bei der nächsten Prüfung steht hier ein Ergebnis.'], groups: [] };
  }
  const minutes = Math.max(0, Math.round((Date.parse(now) - Date.parse(status.checked_at)) / 60000));
  const stale = minutes > Math.max(1, staleMinutes);
  const failing = Array.isArray(status.failing) ? status.failing : [];
  const technical = failing.filter((check) => check.kind !== 'editorial');
  const editorial = failing.filter((check) => check.kind === 'editorial');
  const tone = stale ? 'stale' : technical.length ? 'alarm' : editorial.length ? 'hinweis' : 'ok';
  const headline = stale ? `Befund ist ${minutes} Minuten alt`
    : technical.length ? `${technical.length} Prüfung${technical.length === 1 ? '' : 'en'} rot`
    : editorial.length ? 'Läuft, mit redaktionellem Hinweis' : 'Alles läuft';
  const lines = [];
  lines.push(`${status.healthy} von ${status.checked} Prüfungen in Ordnung, geprüft vor ${minutes} Minuten.`);
  if (stale) lines.push('Der Monitor läuft alle 15 Minuten. Bleibt der Befund alt, hängt der Monitorlauf selbst.');
  for (const check of technical) lines.push(`Rot: ${check.name}. ${check.reason || ''}`.trim());
  for (const check of editorial) lines.push(`Hinweis: ${check.name}. ${check.reason || ''}`.trim());
  if (!failing.length && !stale) lines.push('Keine offene Störung, und die Selbstheilung musste nichts nachstarten.');
  if (status.recovery?.length) lines.push(`Selbstheilung: ${status.recovery.map((attempt) => `${attempt.workflow} (${attempt.status})`).join(', ')}.`);

  const groups = [];
  const throughput = status.throughput || {};
  groups.push({ title: 'Durchsatz', items: [
    ['Kontingent je Stunde', count(throughput.hourly_quota)],
    ['davon Meldungen in der letzten Stunde', count(throughput.stories_last_hour)],
    ['davon Nachbesprechungen und Analysen', count(throughput.editorial_drafts_last_hour)],
    ['freie Plätze', count(throughput.room_left)],
    ['im letzten Lauf veröffentlicht', count(throughput.published_last_run)],
    ['Nachbesserungen im letzten Lauf', count(throughput.repair_calls_last_run)],
  ] });
  const budget = status.budget || {};
  groups.push({ title: 'Budget', items: [
    ['diesen Monat', money(budget.month_usd)],
    ['heute', money(budget.today_usd)],
    ['technische Grenze', money(budget.limit_usd)],
    ['verbleibend', money(budget.remaining_usd)],
    ['Bremse', budget.paused ? 'greift gerade' : 'nicht aktiv'],
  ] });
  const delivery = status.delivery || {};
  groups.push({ title: 'Auslieferung', items: [
    ['öffentlich bestätigt', delivery.verified ? 'ja' : 'nein'],
    ['sichtbare Meldungen', count(delivery.visible_news)],
    ['letzte neue Meldung', delivery.last_new_at ? new Date(delivery.last_new_at).toLocaleString('de-DE') : '–'],
  ] });
  return { tone, headline, dot: tone === 'ok' ? '●' : tone === 'hinweis' ? '●' : '▲', lines, groups, minutes };
}
