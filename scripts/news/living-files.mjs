// Deterministic routing, before AI. A shared topic is never an event identity.
import { eventCompatibility } from "./newsroom.mjs";
const DAY = 86400000;
const time = (value) => Date.parse(value || "") || 0;
const normal = (value) => String(value || "").normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
const unique = (values) => [...new Set(values)];
const intersects = (a, b) => a.some((value) => b.includes(value));
const canonicalPlace = value => normal(value).replace(/^(?:kiew|kyiv)$/, "kyjiw");

// A named delegation, its destination and a short time window identify a
// visit. A war, an actor or a publication URL alone does not. Extract only
// the factual headline/lead, never an impact analysis or related-story text.
const DELEGATION = /\b(?:[A-Z]{2,4}[- ])?(?:Sondergesandt\w*|Gesandt\w*|Vermittler\w*|Unterhändler\w*|Unterhaendler\w*|Delegation)\b/i;
const VISIT = /\b(?:besuch\w*|gesprach\w*|gesandt\w*|vermittler\w*|unterhandler\w*|delegation|erwartet|eingetroffen|empfang\w*|empfangen|treffen|reisen?|kommen|angekommen)\b/;
const VISIT_OTHER_SUBJECT = /\b(?:angriff\w*|angriffspause\w*|angriffsstopp\w*|drohne\w*|waffenruhe|waffenstillstand|sanktion\w*|rucktritt\w*|abkommen|vereinbarung\w*|ergebnis\w*)\b/;
const REPEAT_VISIT = /\b(?:neu\w*|erneut\w*|weiter\w*|nachst\w*|zweite\w*)\s+(?:besuch|reise|treffen)\b/;

export function delegationNames(item) {
  const input = `${item.title || ""}. ${String(item.source_summary || item.summary || item.sources?.[0]?.summary || "").split(/\n\s*\n/)[0].slice(0, 650)}`;
  const names = input.match(/(?:Sondergesandt\w*|Gesandt\w*|Vermittler\w*|Unterhändler\w*|Unterhaendler\w*)\s+([A-ZÄÖÜ][\p{L}-]+(?:\s+[A-ZÄÖÜ][\p{L}-]+){0,2})\s+und\s+([A-ZÄÖÜ][\p{L}-]+(?:\s+[A-ZÄÖÜ][\p{L}-]+){0,2})/u)
    || input.match(/([A-ZÄÖÜ][\p{L}-]+(?:\s+[A-ZÄÖÜ][\p{L}-]+){0,2})\s+und\s+([A-ZÄÖÜ][\p{L}-]+(?:\s+[A-ZÄÖÜ][\p{L}-]+){0,2})\s+als\s+(?:Sondergesandt\w*|Gesandt\w*|Vermittler\w*|Unterhändler\w*|Unterhaendler\w*)/u);
  return names ? unique(names.slice(1).map(name => normal(name.split(/\s+/).at(-1)))).sort() : [];
}

export function diplomaticVisit(item) {
  const title = String(item.title || "");
  const lead = String(item.source_summary || item.summary || item.sources?.[0]?.summary || "").split(/\n\s*\n/)[0].slice(0, 650);
  const input = `${title}. ${lead}`;
  if (!DELEGATION.test(input) || !VISIT.test(normal(title)) || VISIT_OTHER_SUBJECT.test(normal(title))) return null;
  if (REPEAT_VISIT.test(normal(title))) return null;
  const people = delegationNames(item);
  if (people.length !== 2) return null;
  // Read the destination from the headline. A prior stop mentioned only in
  // the lead must not turn the Kyiv visit into the earlier Moscow meeting.
  const destinations = unique([...title.matchAll(/\b(?:in|nach)\s+([A-ZÄÖÜ][\p{L}-]+)\b/gu)]
    .map(match => canonicalPlace(match[1])).filter(place => !["gesprachen", "verhandlungen", "treffen", "der", "die", "dem", "den"].includes(place)));
  if (destinations.length !== 1) return null;
  return { people, destination: destinations[0], key: `${people.join("+")}:${destinations[0]}` };
}

export function sameDiplomaticVisit(a, b) {
  const left = diplomaticVisit(a), right = diplomaticVisit(b);
  const dated = item => time(item.first_seen || item.published_at || item.sources?.[0]?.published_at);
  return Boolean(left && right && left.key === right.key && !namedSubjectConflict(a, b)
    && dated(a) && dated(b) && Math.abs(dated(a) - dated(b)) <= 4 * DAY);
}

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

const PLACE_EXCLUSIONS = new Set("der die das dem den einem einer im am an auf aus bei bis durch fur gegen hinter in mit nach neben ober ohne seit uber um unter von vor wahrend wegen zu zum zur und oder sowie kraft folge zusammenhang vergleich blick zuge interview internet fernsehen".split(" "));
function placesIn(text) {
  // Only locative phrases, never publisher coverage or the origin of a letter ("aus NRW").
  const matches = String(text || "").matchAll(/\b(?:in|bei|nahe)\s+(?:der\s+Stadt\s+)?([A-ZÄÖÜ][\p{L}-]+(?:\s+(?:am|an der|im|ob der)\s+[A-ZÄÖÜ][\p{L}-]+)?)/gu);
  return unique([...matches].map((match) => canonicalPlace(match[1])).filter((place) => !PLACE_EXCLUSIONS.has(place)));
}
const COUNTRY_RULES = [
  ["DE", /\b(deutsch\w*|germany|german|bundesregierung|bundestag|bundesrat)\b/],
  ["FR", /\b(frankreich|franzos\w*|france|french)\b/],
  ["GB", /\b(grossbritannien|britisch\w*|united kingdom|britain|british)\b/],
  ["US", /\b(usa|us-amerik\w*|united states)\b/],
  ["IT", /\b(italien\w*|italy|italian)\b/],
];

const ELECTION_JURISDICTIONS = [
  ["baden-wurttemberg", /\bbaden[- ]wurttemberg\b/],
  ["bayern", /\bbayern\b/],
  ["berlin", /\bberlin(?:trend|-wahl)?\b/],
  ["brandenburg", /\bbrandenburg\b/],
  ["bremen", /\bbremen\b/],
  ["hamburg", /\bhamburg\b/],
  ["hessen", /\bhessen\b/],
  ["mecklenburg-vorpommern", /\bmecklenburg[- ]vorpommern\b/],
  ["niedersachsen", /\bniedersachsen\b/],
  ["nordrhein-westfalen", /\bnordrhein[- ]westfalen\b|\bnrw\b/],
  ["rheinland-pfalz", /\brheinland[- ]pfalz\b/],
  ["saarland", /\bsaarland\b/],
  ["sachsen-anhalt", /\bsachsen[- ]anhalt\b|\bmagdeburg\b/],
  ["sachsen", /\bsachsen\b(?![- ]anhalt)/],
  ["schleswig-holstein", /\bschleswig[- ]holstein\b/],
  ["thuringen", /\bthuringen\b/],
];

function electionJurisdictions(text) {
  const value = normal(text);
  if (!/\b(?:(?:bundestags|landtags|kommunal|europa|prasidentschafts|parlaments|regional|burgermeister|senats|neu)?wahl\w*|sonntagsfrage\w*)\b/.test(value)) return [];
  return ELECTION_JURISDICTIONS.filter(([, pattern]) => pattern.test(value)).map(([id]) => id);
}

// Named subjects, not shared actors or generic topic words. Used by both the
// ingestion guard and the presentation-only case files. No country/company
// allowlist; an ambiguous comparison must not bridge two different subjects.
export function namedSubjects(item) {
  // A sentence boundary prevents the final headline noun from becoming part
  // of a company's name at the start of the lead.
  const input = `${item.title || ""}. ${String(item.source_summary || item.summary || "").split(/\n\s*\n/)[0].slice(0, 650)}`;
  const normalized = normal(input);
  const conflictNames = value => unique([
    ...[...value.matchAll(/\b([\p{L}]+)[-–‑]krieg(?:s|es)?\b/gu)].map(match => match[1]),
    ...[...value.matchAll(/(?<![-–‑\p{L}])\b(?:angriffs)?krieg(?:s|es)?\s+(?:in|gegen)\s+(?:(?:der|die|den|das|dem)\s+)?([\p{L}]+)\b/gu)].map(match => match[1]),
  ]);
  const directConflicts = conflictNames(normalized);
  // If a short checked summary omits the conflict name, the leading source
  // may supply it. Never infer it from arbitrary context/related sources or
  // overwrite a subject already established by the story itself.
  const conflicts = directConflicts.length ? directConflicts : conflictNames(normal(`${item.sources?.[0]?.title || ""}. ${String(item.sources?.[0]?.summary || "").slice(0, 350)}`));
  const companies = unique([...input.matchAll(/\b([A-ZÄÖÜ][\p{L}\d-]+(?:\s+[A-ZÄÖÜ][\p{L}\d-]+){0,5})\s+(GmbH|AG|SE|Ltd\.?|Inc\.?)\b/gu)]
    .map(match => `${normal(match[1]).replace(/^(?:die|der|das|eine|ein)\s+/, "")}:${normal(match[2]).replace(/\./g, "")}`));
  return { conflicts, companies };
}

export function namedSubjectConflict(a, b) {
  const left = namedSubjects(a), right = namedSubjects(b);
  return ["conflicts", "companies"].some(key => left[key].length && right[key].length
    && (left[key].length !== 1 || right[key].length !== 1 || left[key][0] !== right[key][0]));
}

const PUBLIC_NETWORK = "(?:landes(?:it)?netz|verwaltungsnetz|it[- ]netz)";
const DEMONYM_PLACES = new Map([
  ["berliner", "berlin"], ["hamburger", "hamburg"], ["bremer", "bremen"],
  ["dresdner", "dresden"], ["munchner", "munchen"], ["kolner", "koln"],
  ["hannoveraner", "hannover"], ["frankfurter", "frankfurt"], ["stuttgarter", "stuttgart"],
  ["dusseldorfer", "dusseldorf"], ["potsdamer", "potsdam"], ["schweriner", "schwerin"],
  ["magdeburger", "magdeburg"], ["erfurter", "erfurt"], ["wiesbadener", "wiesbaden"],
  ["saarbrucker", "saarbrucken"], ["kieler", "kiel"], ["mainzer", "mainz"],
]);

function publicNetworkPlace(title, lead) {
  for (const value of [title, lead]) {
    const normalized = normal(value);
    const afterTarget = normalized.match(new RegExp(`\\b${PUBLIC_NETWORK}(?:\\s+(?:von|in))?\\s+([a-z][a-z-]{2,})\\b`))?.[1];
    if (afterTarget && !PLACE_EXCLUSIONS.has(afterTarget)) return afterTarget;
    const beforeTarget = normalized.match(new RegExp(`\\b([a-z][a-z-]{2,})\\s+${PUBLIC_NETWORK}\\b`))?.[1];
    if (beforeTarget) {
      if (DEMONYM_PLACES.has(beforeTarget)) return DEMONYM_PLACES.get(beforeTarget);
    }
  }
  return null;
}

export function fileSubject(item) {
  const title = String(item.title || "");
  const lead = String(item.summary || item.source_summary || "").split(/\n\s*\n/)[0].slice(0, 650);
  const text = normal(`${title} ${lead}`);
  const grid = /\b(umspannwerk\w*|stromnetz\w*|stromversorgung\w*|substation\w*)\b/.test(text);
  const response = /\b(schutz|sicherheitszentrum|sicherheitsvorkehrung\w*|schutzmassnahm\w*|schutzt|kritis-dachgesetz)\b/.test(normal(title));
  const incident = grid && /\b(sabotage\w*|angriff\w*|anschlag\w*|bekennerschreiben|verdachtiger gegenstand|attack\w*)\b/.test(text);
  const cyber = /\b(cyber\w*|hacker\w*|ransomware\w*|ikt[- ]vorfall\w*|datenabfluss\w*|datendiebstahl\w*)\b/.test(text);
  const networkPlace = cyber && new RegExp(`\\b${PUBLIC_NETWORK}\\b`).test(text) ? publicNetworkPlace(title, lead) : null;
  const titlePlaces = placesIn(title);
  const places = titlePlaces.length ? titlePlaces : placesIn(lead);
  const countries = unique([...(item.event_geography || []), ...COUNTRY_RULES.filter(([, pattern]) => pattern.test(text)).map(([code]) => code)]);
  const elections = unique(electionJurisdictions(`${title} ${lead}`));
  const election_stage = elections.length && /\b(?:umfrag\w*|wahlabsicht\w*)\b/.test(normal(title)) ? 'polling'
    : elections.length && /\b(?:hochrechnung\w*|wahlergebnis\w*|wahlsieg\w*|wahlniederlage\w*)\b/.test(normal(title)) ? 'result' : null;
  // Explicit object/place/date, not a general "energy" or "infrastructure" key.
  const kind = response ? "response" : incident ? "grid_incident" : networkPlace ? "cyber_incident" : "other";
  const directPlace = title.match(/\bUmspannwerk\s+([A-ZÄÖÜ][\p{L}-]+)/u)?.[1];
  const eventPlaces = networkPlace ? [networkPlace] : directPlace && !titlePlaces.length ? [normal(directPlace)] : unique([...places, ...(directPlace ? [normal(directPlace)] : [])]);
  const recurrence = /\b(?:zweiter|weiterer|neuer|erneuter)\s+(?:anschlag|angriff|sabotageversuch)\b/.test(normal(title));
  const multipleEvents = eventPlaces.length > 1 || /\b(anschlage|anschlagen|angriffe|angriffen|sabotageakte|sabotageakten|mehrere\w* tatorte)\b/.test(text);
  const key = !recurrence && !multipleEvents && eventPlaces.length === 1 && ["grid_incident", "cyber_incident"].includes(kind)
    ? `${kind}:${eventPlaces[0]}` : null;
  return { kind, places: eventPlaces, countries, elections, election_stage, recurrence, multipleEvents, key };
}

export function subjectConflict(a, b) {
  if (namedSubjectConflict(a, b)) return true;
  const visitA = diplomaticVisit(a), visitB = diplomaticVisit(b);
  if (visitA && visitB && visitA.key !== visitB.key) return true;
  if ((visitA && DELEGATION.test(b.title || "") && delegationNames(b).length !== 2)
    || (visitB && DELEGATION.test(a.title || "") && delegationNames(a).length !== 2)) return true;
  if ((visitA && (VISIT_OTHER_SUBJECT.test(normal(b.title)) || REPEAT_VISIT.test(normal(b.title))))
    || (visitB && (VISIT_OTHER_SUBJECT.test(normal(a.title)) || REPEAT_VISIT.test(normal(a.title))))) return true;
  const left = fileSubject(a), right = fileSubject(b);
  if (left.recurrence !== right.recurrence && left.kind === "grid_incident" && right.kind === "grid_incident") return true;
  // A report about several attacks cannot become the update of just one site,
  // even if its publisher reuses a formerly single-event article URL.
  if (left.multipleEvents !== right.multipleEvents && left.kind === "grid_incident" && right.kind === "grid_incident") return true;
  if (left.kind !== "other" && right.kind !== "other" && left.kind !== right.kind) return true;
  if (left.countries.length && right.countries.length && !intersects(left.countries, right.countries)) return true;
  if (left.elections.length && right.elections.length && !intersects(left.elections, right.elections)) return true;
  if (left.election_stage && right.election_stage && left.election_stage !== right.election_stage) return true;
  if (left.places.length && right.places.length && !intersects(left.places, right.places)) return true;
  return false;
}

export function livingFileMatch(item, story) {
  const left = fileSubject(item), right = fileSubject(story);
  if (subjectConflict(item, story)) return { score: 0, reason: "different_object_or_place" };
  if (sameDiplomaticVisit(item, story)) return { score: 0.98, reason: "same_delegation_destination_window" };
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
      // Defense in depth: even a stale/precomputed merge plan may not bypass
      // the current subject guard or create a conflict with retained members.
      const retained = (canonical.living_file?.merged_story_ids || []).map(memberId => byId.get(memberId)).filter(Boolean);
      if ([canonical, ...retained].some(member => subjectConflict(member, duplicate)
        || (diplomaticVisit(member) && diplomaticVisit(duplicate) && !sameDiplomaticVisit(member, duplicate)))) continue;
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
      for (const aliasId of duplicate.living_file?.merged_story_ids || []) {
        const alias = byId.get(aliasId);
        if (!alias || !isMerged(alias) || alias.retirement.canonical_story_ids.includes(canonical.story_id)) continue;
        alias.retirement_history = [...(alias.retirement_history || []), structuredClone(alias.retirement)];
        alias.retirement = { ...alias.retirement, canonical_story_ids: [canonical.story_id], canonical_stories: [...duplicate.retirement.canonical_stories] };
      }
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
    const matches = [];
    for (const other of active) {
      const matchesCanonical = (() => {
      if (other === canonical || used.has(other.story_id) || subjectConflict(canonical, other)) return false;
      const a = fileSubject(canonical), b = fileSubject(other);
      if (sameDiplomaticVisit(canonical, other)) return true;
      if (a.key && a.key === b.key && Math.abs(time(canonical.first_seen || canonical.published_at) - time(other.first_seen || other.published_at)) <= 7 * DAY) return true;
      const event = eventCompatibility(canonical.sources?.[0] || canonical, other.sources?.[0] || other);
      if (event.same_event && event.reason === "structured_event_facts") return true;
      const doc = documentKey(canonical.sources?.[0]?.url);
      const leftTerms = terms(canonical.title), rightTerms = terms(other.title);
      const shared = leftTerms.filter((word) => rightTerms.includes(word)).length;
      return Boolean(doc && doc === documentKey(other.sources?.[0]?.url) && a.places.length <= 1 && b.places.length <= 1
        && shared >= 3 && shared / Math.max(1, Math.min(leftTerms.length, rightTerms.length)) >= 0.75
        && Math.abs(time(canonical.first_seen || canonical.published_at) - time(other.first_seen || other.published_at)) <= 4 * DAY);
      })();
      if (matchesCanonical && matches.every(member => !subjectConflict(member, other)
        && !(diplomaticVisit(member) && diplomaticVisit(other) && !sameDiplomaticVisit(member, other)))) matches.push(other);
    }
    if (matches.length) {
      matches.forEach((story) => used.add(story.story_id));
      groups.push({ canonical_id: canonical.story_id, duplicate_ids: matches.map((story) => story.story_id), reason: "specific_object_or_leading_document" });
    }
  }
  return groups;
}

const RELATED_TOPICS = [
  ["grid-security", "Stromnetz und Schutz kritischer Infrastruktur", /\b(umspannwerk\w*|stromnetz[- ]sabotage|(?:sabotage|anschlag).{0,90}(?:stromnetz|stromversorgung)|stromversorgung.{0,90}(?:sabotage|anschlag)|kritis-dachgesetz|schutz kritischer infrastrukturen)\b/],
  ["care-training", "Ausbildung und Versorgung in Gesundheitsberufen", /\b(pflegeausbildung|gesundheitsberuf\w*|heilberuf\w*)\b/],
  ["heat-protection", "Hitzefolgen und Klimaanpassung", /\b(hitzeschutz|hitzewelle\w*|heatwaves?|hitzehilfe)\b/],
  ["fuel-prices", "Kraftstoffpreise und Mobilität", /\b(spritpreis\w*|benzinpreis\w*|e10|kraftstoffpreis\w*)\b/],
];
const TERMS_IGNORED = new Set("nach neue neuen einer eines werden sollen durch uber gegen unter jetzt mehr beim politik wirtschaft energie gesundheit europa gesellschaft deutschland meldung bericht berichtet regierung beschliesst beschlossen plant trump trumps donald supreme court federal judge gericht gerichts bundesverfassungsgericht bundesregierung bundestag bundesrat kommission prasident minister polizei".split(" "));
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
