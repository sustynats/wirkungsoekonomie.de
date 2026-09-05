// Local review signals, never evidence of a political claim or an election result.
// No party, person or publisher receives a special weight.
const normalize = value => String(value || "").normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
const RULES = [
  ["candidacy_open", /\b(kandidatur|antreten|kandidieren|ministerprasident\w*)\b[^.!?]{0,130}\b(offen|ungewiss|nicht entschieden|erst nach der wahl|montag entscheiden)\b|\b(lasst|lassen|halt)\b[^.!?]{0,100}\boffen\b[^.!?]{0,100}\b(kandidatur|antreten|kandidieren|ministerprasident\w*)\b/],
  ["candidacy_withdrawal", /\b(zieht|ziehen)\b[^.!?]{0,65}\bkandidatur\b[^.!?]{0,35}\bzuruck\b|\b(verzichtet|verzichten)\b[^.!?]{0,60}\b(kandidatur|kandidieren)\b/],
  ["government_position", /\b(koalition\w*|regierungsbildung|regierungsanspruch|alleinregierung)\b[^.!?]{0,100}\b(offen|schliesst|ausgeschlossen|andert|relativiert|ruckt|knapp\w*)\b|\b(andert|relativiert|schliesst)\b[^.!?]{0,100}\b(koalition\w*|regierungsanspruch|regierung\w*)\b/],
  ["resignation", /\b(ruecktritt|rucktritt|regierungsbruch|koalitionsbruch|resigns?|coalition collapse)\b/],
  ["election_result", /\b(wahlergebnis|hochrechnung|vorlaufiges endergebnis|election result)\b/],
];

export function politicalDevelopmentFor(item, now = new Date().toISOString()) {
  const text = normalize(`${item.title || ""} ${item.summary || ""}`);
  const political = /\b(wahl\w*|parlament\w*|landtag\w*|regierung\w*|minister\w*|koalition\w*|election\w*|prime minister)\b/.test(text);
  const contextOnly = /\b(ruckblick|historisch\w*|vor \w+ jahren|was ware wenn|kommentar|meinung)\b/.test(normalize(item.title));
  const signals = political && !contextOnly ? RULES.filter(([, rule]) => rule.test(text)).map(([key]) => key) : [];
  const published = Date.parse(item.source_published_at || item.published_at || "");
  const age = Date.parse(now) - published;
  const recent = Number.isFinite(age) && age >= -600000 && age <= 24 * 3600000;
  const imminent = /\b(kurz|unmittelbar|einen tag|am vorabend)\s+vor\s+(?:der\s+)?(?:landtags)?wahl\b|\b(?:wahl\s+(?:ist\s+)?morgen|morgen\s+(?:wird\s+)?gewahlt|wahltag|wahlabend)\b/.test(text);
  return { signals, time_sensitive: signals.length > 0 && recent && imminent, basis: "local_review_signal_not_verified_fact" };
}

export function materialDevelopmentReview(sources, previousSources = [], now = new Date().toISOString()) {
  const previous = new Map(previousSources.map(source => [source.url, source]));
  const arrivals = sources.filter(source => {
    const old = previous.get(source.url);
    return !old || source.content_hash !== old.content_hash || source.title !== old.title || source.summary !== old.summary;
  });
  const findings = arrivals.map(source => ({ source_id: source.source_id, url: source.url, ...politicalDevelopmentFor(source, now) })).filter(finding => finding.signals.length);
  return { required: findings.length > 0, time_sensitive: findings.some(finding => finding.time_sensitive), findings };
}
