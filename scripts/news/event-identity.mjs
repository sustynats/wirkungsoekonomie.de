// A specific proceeding + institution + event day, never a broad theme/person.
// Other topics continue through the existing conservative case identity rules.
export function structuredEventIdentity(item = {}) {
  const normalize = text => String(text || '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();
  const title = normalize(item.title);
  const text = `${title} ${normalize(item.summary)}`;
  const institution = /\bbundestag\b/.test(text) ? 'bundestag' : /\bbundesrat\b/.test(text) ? 'bundesrat' : null;
  const plenary = /\bgeneraldebatte\b/.test(title)
    || (/\/dokumente\/textarchiv\//.test(item.url || '') && /-generaldebatte-/.test(item.url || ''))
    || (/\bbundestag live\b/.test(title) && /\bgeneraldebatte\b/.test(text));
  if (!institution || !plenary) return null;
  const explicit = text.match(/\b(\d{2})\.(\d{2})\.(20\d{2})\b/);
  const stamp = Date.parse(item.event_date || item.source_published_at || item.published_at || '');
  const day = explicit ? `${explicit[3]}-${explicit[2]}-${explicit[1]}`
    : Number.isFinite(stamp) ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(stamp) : null;
  if (!day || !Number.isFinite(Date.parse(day))) return null;
  return { key: `${institution}:general-debate:${day}`, institution, proceeding: 'general-debate', day };
}
