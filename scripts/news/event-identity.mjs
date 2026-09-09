// A specific proceeding + institution + event day, never a broad theme/person.
// Other topics continue through the existing conservative case identity rules.
export function explicitEventPlaces(item = {}) {
  const normalize = text => String(text || '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();
  const extract = value => [...new Set([...String(value || '').matchAll(/\b(?:[Ii]n|[Bb]ei|nahe)\s+([A-ZÄÖÜ][\p{L}-]+(?:\s+(?:am|an der|im)\s+[A-ZÄÖÜ][\p{L}-]+)?)/gu)]
    .map(match => normalize(match[1])))];
  const title = extract(item.title);
  return title.length ? title : extract(String(item.summary || '').slice(0,650));
}

export function structuredEventIdentity(item = {}) {
  const normalize = text => String(text || '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();
  const title = normalize(item.title);
  const text = `${title} ${normalize(item.summary)}`;
  const stamp = Date.parse(item.event_date || item.source_published_at || item.published_at || '');
  const publicationDay = Number.isFinite(stamp) ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(stamp) : null;
  // A concrete local safety event, not a whole border or publisher coverage.
  // No list of cities, countries, media brands or road numbers.
  const crossing = /\bgrenzubergang\w*\b/.test(text);
  const explosiveVehicle = /\bsprengstoff\w*\b/.test(text) && /\b(?:auto\w*|fahrzeug\w*|kontrolle|suchhunde|spurhunde)\b/.test(text);
  const activeIncident = /\b(?:gesperrt|sperrung|polizeieinsatz|festgenommen)\b/.test(text);
  const retrospectiveOrRepeated = /\b(?:ruckblick|jahrestag|prozess|urteil|vorjahr|damals)\b|\b(?:weiterer|zweiter|erneuter|neuer)\s+(?:vorfall|verdachtsfall|einsatz|sprengstofffund)\b/.test(text);
  if (publicationDay && crossing && explosiveVehicle && activeIncident && !retrospectiveOrRepeated) {
    const places = explicitEventPlaces(item);
    if (places.length === 1) {
      const roads = [...new Set([...text.matchAll(/\b(?:a\s*|autobahn\s+)(\d{1,3})\b/g)].map(match => match[1]))];
      if (roads.length > 1) return null;
      return { key: `border-safety:${places[0]}:explosive-vehicle:${publicationDay}`, institution: `border-safety:${places[0]}`,
        proceeding:'explosive-vehicle', day:publicationDay, roads, kind:'border_incident' };
    }
  }
  const institution = /\bbundestag\b/.test(text) ? 'bundestag' : /\bbundesrat\b/.test(text) ? 'bundesrat' : null;
  const plenary = /\bgeneraldebatte\b/.test(title)
    || (/\/dokumente\/textarchiv\//.test(item.url || '') && /-generaldebatte-/.test(item.url || ''))
    || (/\bbundestag live\b/.test(title) && /\bgeneraldebatte\b/.test(text));
  if (!institution || !plenary) return null;
  const explicit = text.match(/\b(\d{2})\.(\d{2})\.(20\d{2})\b/);
  const day = explicit ? `${explicit[3]}-${explicit[2]}-${explicit[1]}`
    : publicationDay;
  if (!day || !Number.isFinite(Date.parse(day))) return null;
  return { key: `${institution}:general-debate:${day}`, institution, proceeding: 'general-debate', day };
}
