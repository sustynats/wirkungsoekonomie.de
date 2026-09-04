// Deterministic routing, before AI. A shared topic is never an event identity.
const DAY = 86400000;
const time = (value) => Date.parse(value || "") || 0;
const normal = (value) => String(value || "").normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
const unique = (values) => [...new Set(values)];
const intersects = (a, b) => a.some((value) => b.includes(value));

export function documentKey(value) {
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol)) return "";
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key);
    url.searchParams.sort();
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    // These publishers retain the article ID when the headline/slug changes.
    const id = host === "stern.de" ? url.pathname.match(/-(\d{7,})\.html$/)?.[1]
      : host === "spiegel.de" ? url.pathname.match(/-a-([a-f\d-]{36})(?:\.html)?$/i)?.[1]
        : host === "tagesspiegel.de" ? url.pathname.match(/-(\d{7,})\.html$/)?.[1] : null;
    return id ? `${host}:article:${id}` : `${host}${url.pathname.replace(/\/$/, "")}${url.search}`;
  } catch { return ""; }
}

const PLACE_EXCLUSIONS = new Set("der die das dem den einem einer kraft folge zusammenhang vergleich blick zuge interview internet fernsehen".split(" "));
function placesIn(text) {
  // Only locative phrases, never publisher coverage or the origin of a letter ("aus NRW").
  const matches = String(text || "").matchAll(/\b(?:in|bei|nahe)\s+(?:der\s+Stadt\s+)?([A-ZÄÖÜ][\p{L}-]+(?:\s+(?:am|an der|im|ob der)\s+[A-ZÄÖÜ][\p{L}-]+)?)/gu);
  return unique([...matches].map((match) => normal(match[1])).filter((place) => !PLACE_EXCLUSIONS.has(place)));
}
const COUNTRY_RULES = [
  ["DE", /\b(deutsch\w*|germany|german|bundesregierung|bundestag|bundesrat)\b/],
  ["FR", /\b(frankreich|franzos\w*|france|french)\b/],
  ["GB", /\b(grossbritannien|britisch\w*|united kingdom|britain|british)\b/],
  ["US", /\b(usa|us-amerik\w*|united states)\b/],
  ["IT", /\b(italien\w*|italy|italian)\b/],
];

export function fileSubject(item) {
  const title = String(item.title || "");
  const lead = String(item.summary || item.source_summary || "").split(/\n\s*\n/)[0].slice(0, 650);
  const text = normal(`${title} ${lead}`);
  const grid = /\b(umspannwerk\w*|stromnetz\w*|substation\w*)\b/.test(text);
  const response = /\b(schutz|sicherheitszentrum|sicherheitsvorkehrung\w*|schutzmassnahm\w*|schutzt|kritis-dachgesetz)\b/.test(normal(title));
  const incident = grid && /\b(sabotage\w*|angriff\w*|anschlag\w*|bekennerschreiben|verdachtiger gegenstand|attack\w*)\b/.test(text);
  const titlePlaces = placesIn(title);
  const places = titlePlaces.length ? titlePlaces : placesIn(lead);
  const countries = unique([...(item.event_geography || []), ...COUNTRY_RULES.filter(([, pattern]) => pattern.test(text)).map(([code]) => code)]);
  // Explicit object/place/date, not a general "energy" or "infrastructure" key.
  const kind = response ? "response" : incident ? "grid_incident" : "other";
  const directPlace = title.match(/\bUmspannwerk\s+([A-ZÄÖÜ][\p{L}-]+)/u)?.[1];
  const eventPlaces = directPlace && !titlePlaces.length ? [normal(directPlace)] : unique([...places, ...(directPlace ? [normal(directPlace)] : [])]);
  const recurrence = /\b(?:zweiter|weiterer|neuer|erneuter)\s+(?:anschlag|angriff|sabotageversuch)\b/.test(normal(title));
  return { kind, places: eventPlaces, countries, recurrence, key: !recurrence && kind === "grid_incident" && eventPlaces.length === 1 ? `grid_incident:${eventPlaces[0]}` : null };
}

export function subjectConflict(a, b) {
  const left = fileSubject(a), right = fileSubject(b);
  if (left.recurrence !== right.recurrence && left.kind === "grid_incident" && right.kind === "grid_incident") return true;
  if (left.kind !== "other" && right.kind !== "other" && left.kind !== right.kind) return true;
  if (left.countries.length && right.countries.length && !intersects(left.countries, right.countries)) return true;
  if (left.places.length && right.places.length && !intersects(left.places, right.places)) return true;
  return false;
}

export function livingFileMatch(item, story) {
  const left = fileSubject(item), right = fileSubject(story);
  if (subjectConflict(item, story)) return { score: 0, reason: "different_object_or_place" };
  const dates = (story.sources || []).map((source) => time(source.published_at)).filter(Boolean);
  const gap = Math.min(...[...dates, time(story.last_updated || story.published_at)].filter(Boolean).map((date) => Math.abs(time(item.published_at) - date)));
  if (left.key && left.key === right.key && gap <= 7 * DAY) return { score: 0.98, reason: "same_incident_object_place_window" };
  const key = documentKey(item.url);
  if (key && (story.sources || []).some((source) => documentKey(source.url) === key)) return { score: 1, reason: "known_document" };
  return { score: 0, reason: "no_strong_identity" };
}

export function isMerged(story) { return story.retirement?.reason_code === "MERGED_INTO_LIVING_FILE"; }

export function matchingStories(stories) {
  const byId = new Map(stories.map((story) => [story.story_id, story]));
  return stories.filter((story) => !isMerged(story)).map((story) => {
    const aliases = (story.living_file?.merged_story_ids || []).flatMap((id) => byId.get(id)?.sources || []);
    return aliases.length ? { ...story, sources: [...story.sources, ...aliases], routing_original: story } : story;
  });
}

function mergeSourceVersions(sources) {
  // Keep distinct exact URLs: published claim evidence is bound to that exact URL.
  const byUrl = new Map();
  for (const source of sources) {
    const previous = byUrl.get(source.url);
    if (!previous || time(source.published_at) >= time(previous.published_at)) byUrl.set(source.url, source);
  }
  return [...byUrl.values()];
}

export function mergeLivingFiles(stories, groups, now) {
  const changes = [];
  const byId = new Map(stories.map((story) => [story.story_id, story]));
  for (const group of groups) {
    const canonical = byId.get(group.canonical_id);
    if (!canonical?.published || canonical.listed === false) continue;
    for (const id of group.duplicate_ids) {
      const duplicate = byId.get(id);
      if (!duplicate || duplicate === canonical || isMerged(duplicate) || duplicate.listed === false) continue;
      const sources = mergeSourceVersions([...(canonical.pending_update?.sources || canonical.sources || []), ...(duplicate.sources || []), ...(duplicate.pending_update?.sources || [])]);
      // No claim/analysis/source is silently reinterpreted as already checked.
      canonical.pending_update = { detected_at: now, sources, reason: "AI_BUDGET_OR_BATCH_LIMIT", fresh: false, consolidation: true, quality_retry_count: 0 };
      canonical.living_file = {
        ...canonical.living_file,
        merged_story_ids: unique([...(canonical.living_file?.merged_story_ids || []), id, ...(duplicate.living_file?.merged_story_ids || [])]),
        consolidations: [...(canonical.living_file?.consolidations || []), { at: now, story_id: id, slug: duplicate.slug, title: duplicate.title, reason: group.reason }],
      };
      const followupIds = new Set((canonical.followups || []).map((entry) => entry.followup_id));
      canonical.followups = [...(canonical.followups || []), ...(duplicate.followups || []).filter((entry) => !followupIds.has(entry.followup_id)).map((entry) => ({ ...entry, origin_story_id: id }))];
      duplicate.listed = false;
      duplicate.retired_at = now;
      duplicate.retirement = {
        at: now, reason_code: "MERGED_INTO_LIVING_FILE", canonical_story_ids: [canonical.story_id],
        canonical_stories: [{ story_id: canonical.story_id, slug: canonical.slug, title: canonical.title }],
        note: "Diese Meldung beschreibt denselben Vorgang wie die verlinkte fortgeführte Wirkungsakte. Frühere Analysen und Quellen bleiben als historischer Stand erhalten. Zusätzliche Quellen werden vor einer inhaltlichen Aktualisierung erneut geprüft.",
      };
      duplicate.analysis_status = "mit fortgeführter Wirkungsakte zusammengeführt";
      changes.push({ story_id: id, canonical_story_id: canonical.story_id, reason: group.reason });
    }
  }
  return changes;
}

// Conservative automatic consolidation: only a specific incident identity, or
// the same leading article with compatible subjects. No transitive topic union.
export function duplicateGroups(stories) {
  const active = stories.filter((story) => story.listed !== false && !isMerged(story))
    .sort((a, b) => Number(Boolean(b.living_file?.consolidations?.length)) - Number(Boolean(a.living_file?.consolidations?.length)) || time(b.last_updated) - time(a.last_updated) || a.story_id.localeCompare(b.story_id));
  const used = new Set(), groups = [];
  for (const canonical of active) {
    if (!canonical.published || used.has(canonical.story_id)) continue;
    const matches = active.filter((other) => {
      if (other === canonical || used.has(other.story_id) || subjectConflict(canonical, other)) return false;
      const a = fileSubject(canonical), b = fileSubject(other);
      if (a.key && a.key === b.key && Math.abs(time(canonical.first_seen || canonical.published_at) - time(other.first_seen || other.published_at)) <= 7 * DAY) return true;
      const doc = documentKey(canonical.sources?.[0]?.url);
      const leftTerms = terms(canonical.title), rightTerms = terms(other.title);
      const shared = leftTerms.filter((word) => rightTerms.includes(word)).length;
      return Boolean(doc && doc === documentKey(other.sources?.[0]?.url) && a.places.length <= 1 && b.places.length <= 1
        && shared >= 3 && shared / Math.max(1, Math.min(leftTerms.length, rightTerms.length)) >= 0.75
        && Math.abs(time(canonical.first_seen || canonical.published_at) - time(other.first_seen || other.published_at)) <= 4 * DAY);
    });
    if (matches.length) {
      matches.forEach((story) => used.add(story.story_id));
      groups.push({ canonical_id: canonical.story_id, duplicate_ids: matches.map((story) => story.story_id), reason: "specific_object_or_leading_document" });
    }
  }
  return groups;
}

const RELATED_TOPICS = [
  ["grid-security", "Stromnetz und Schutz kritischer Infrastruktur", /\b(umspannwerk\w*|stromnetz[- ]sabotage|sabotage.{0,60}stromnetz|kritis-dachgesetz|schutz kritischer infrastrukturen)\b/],
  ["care-training", "Ausbildung und Versorgung in Gesundheitsberufen", /\b(pflegeausbildung|gesundheitsberuf\w*|heilberuf\w*)\b/],
  ["heat-protection", "Hitze, Klimaanpassung und Gesundheit", /\b(hitzeschutz|hitzewelle\w*|heatwaves?|hitzehilfe)\b/],
  ["fuel-prices", "Kraftstoffpreise und Mobilität", /\b(spritpreis\w*|benzinpreis\w*|e10|kraftstoffpreis\w*)\b/],
];
const TERMS_IGNORED = new Set("nach neue neuen einer eines werden sollen durch uber gegen unter jetzt mehr beim beim politik wirtschaft energie gesundheit europa gesellschaft deutschland meldung bericht berichtet regierung beschliesst beschlossen plant".split(" "));
const terms = (text) => unique((normal(text).match(/[a-z0-9]{4,}/g) || []).filter((word) => !TERMS_IGNORED.has(word)));
const relationText = (story) => `${story.title || ""} ${String(story.source_summary || "").split(/\n\s*\n/)[0].slice(0, 450)}`;

export function relatedStories(story, stories, limit = 5) {
  const active = stories.filter((item) => item.published && item.analysis && item.listed !== false && !isMerged(item));
  const topicKeys = (item) => RELATED_TOPICS.filter(([, , pattern]) => pattern.test(normal(`${item.title || ""} ${String(item.source_summary || "").split(/[.!?]\s/)[0].slice(0, 240)}`)));
  const leftTopics = topicKeys(story), left = terms(relationText(story));
  const frequency = new Map();
  for (const item of active) for (const word of terms(relationText(item))) frequency.set(word, (frequency.get(word) || 0) + 1);
  return active.filter((item) => item.story_id !== story.story_id).flatMap((item) => {
    const topics = topicKeys(item);
    const sharedTopic = leftTopics.find(([key]) => topics.some(([other]) => key === other));
    const shared = terms(relationText(item)).filter((word) => left.includes(word) && frequency.get(word) <= Math.max(3, active.length * 0.2));
    const titleShared = terms(item.title).filter((word) => terms(story.title).includes(word) && shared.includes(word));
    if (!sharedTopic && !(shared.length >= 3 && titleShared.length >= 2)) return [];
    return [{ story: item, reason: sharedTopic?.[1] || "Gemeinsamer konkreter Gegenstand", score: (sharedTopic ? 10 : 0) + Math.min(6, shared.length) }];
  }).sort((a, b) => b.score - a.score || time(b.story.last_updated) - time(a.story.last_updated) || a.story.story_id.localeCompare(b.story.story_id)).slice(0, Math.max(0, Math.min(5, limit)));
}
