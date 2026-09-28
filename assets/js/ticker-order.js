// One chronology for generated lists and browser-side filters/search.
const timestamp = value => Number.isFinite(Date.parse(value)) ? Date.parse(value) : -Infinity;
export const usesEpisodeOrder = type => ['listened', 'watched', 'media'].includes(type);
export function compareTickerRecords(a, b, type = 'alle') {
  const date = record => usesEpisodeOrder(type) ? record.episode_date || record.date : record.date;
  const key = record => String(record.url || record.id || '');
  return timestamp(date(b)) - timestamp(date(a))
    || timestamp(b.date) - timestamp(a.date)
    || (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0);
}
export function analysisOrderLabel(type = 'alle') {
  return usesEpisodeOrder(type)
    ? 'Neueste Originalfolge zuerst. Bei gleichem Folgendatum: neueste Einordnung zuerst. Ohne Folgendatum zählt die Veröffentlichung.'
    : 'Neueste Veröffentlichung zuerst. Aktualisierungen ändern die Reihenfolge nicht.';
}
