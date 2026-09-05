import { createHash } from "node:crypto";
import { sourceAccess } from "./access-policy.mjs";

const hash = (value) => createHash("sha256").update(String(value)).digest("hex").slice(0, 20);
const ms = (value) => Date.parse(value || "") || 0;
const words = (value) => String(value || "").normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().match(/[\p{L}\d-]{3,}/gu) || [];
const ignored = new Set("der die das dem den des eine einer eines und oder aber auch nach fuer mit von vom zum zur the and for with from this that says said will uber wird neue neuen einer ein ist sind haben hat mehr werden einer als bis auf bei durch nicht sich new into about auch noch seine ihrer dieser sowie news".split(" "));
const tokens = (value) => new Set(words(value).filter((word) => !ignored.has(word)));
export const SOURCE_INTERVALS = Object.freeze({ realtime: 5, high_frequency: 15, regular: 60, slow_monitoring: 360 });

export function sourceDue(source, status = {}, now = new Date().toISOString()) {
  if (!sourceAccess(source).allowed) return false;
  const interval = Math.max(5, Number(source.poll_minutes || SOURCE_INTERVALS[source.frequency_class] || 15));
  const errorBackoff = Math.min(360, interval * 2 ** Math.min(5, Number(status.consecutive_failures || 0)));
  return ms(now) - ms(status.last_attempt) >= Math.max(interval, status.last_error ? errorBackoff : 0) * 60000;
}

export function annotateSourceItem(item, source, now) {
  const evidenceText = `${item.title} ${item.summary}`;
  const agency = evidenceText.match(/\b(reuters|dpa|afp)\b|\bAssociated Press\b|(?:^|[(/ ])AP(?:[)/]|\s*[-–])/i)?.[0]?.trim().replace(/[()/–-]/g, "").trim().toLowerCase();
  const publisherId = source.publisher_id || source.source_id;
  return {
    ...item,
    source_item_id: item.item_id || `item-${hash(item.url)}`,
    publisher_id: publisherId,
    publisher_kind: source.publisher_kind || (item.primary_source ? "institution" : "journalism"),
    source_role: source.source_role || (item.primary_source ? "institutional_statement" : "journalistic_report"),
    language: source.language || "de",
    geography: source.geography || ["DE"],
    research_lane: source.research_lane || (item.primary_source ? "primary" : "media"),
    requires_corroboration: Boolean(source.requires_corroboration),
    source_published_at: item.published_at,
    ingested_at: now,
    provenance: {
      origin: item.research_metadata?.doi ? `study:${item.research_metadata.doi.toLowerCase()}` : agency ? `agency:${agency === "associated press" ? "ap" : agency}` : `publisher:${publisherId}`,
      basis: agency ? "agency_attribution_in_available_text" : "publisher_only_origin_unverified",
      independence_established: false,
    },
  };
}

function sharedRun(a, b) {
  const left = words(a), right = words(b);
  const sequences = new Set(left.slice(0, -11).map((_, index) => left.slice(index, index + 12).join(" ")));
  return right.slice(0, -11).some((_, index) => sequences.has(right.slice(index, index + 12).join(" ")));
}

export function evidenceGroups(sources = []) {
  const parent = sources.map((_, index) => index);
  const root = (index) => parent[index] === index ? index : (parent[index] = root(parent[index]));
  const reasons = new Map();
  for (let i = 0; i < sources.length; i += 1) for (let j = 0; j < i; j += 1) {
    const a = sources[i], b = sources[j];
    const separateStudies = a.research_metadata?.doi && b.research_metadata?.doi && a.research_metadata.doi !== b.research_metadata.doi;
    const samePublisher = !separateStudies && (a.publisher_id || a.source_id) === (b.publisher_id || b.source_id);
    const sameOrigin = a.provenance?.origin && a.provenance.origin === b.provenance?.origin;
    const copied = sharedRun(`${a.title} ${a.summary}`, `${b.title} ${b.summary}`);
    if (samePublisher || sameOrigin || copied) {
      parent[root(i)] = root(j);
      const dependency = { source_ids: [a.source_id, b.source_id].sort(), reason: samePublisher ? "same_publisher" : sameOrigin ? "shared_origin" : "shared_wording_possible_syndication" };
      const key = JSON.stringify(dependency);
      const previous = reasons.get(key);
      if (previous) previous.document_pairs += 1;
      else reasons.set(key, { ...dependency, document_pairs: 1 });
    }
  }
  const groups = new Map();
  sources.forEach((source, index) => { const key = root(index); groups.set(key, [...(groups.get(key) || []), source.source_id]); });
  return { groups: [...groups.values()].map(ids => [...new Set(ids)]), possible_independent_origins: groups.size, independence_is_verified: false, dependencies: [...reasons.values()] };
}

const EVENT_TYPES = [
  ["judgment", /\b(urteil|gericht|court|ruling|verdict)\w*/i],
  ["enacted", /\b(in kraft|takes effect|enters into force)\b/i],
  ["adopted", /\b(beschlossen|beschließt|beschliesst|verabschiedet|approved|adopted|passes|passed)\b/i],
  ["proposal", /\b(entwurf|draft|proposal|proposes|vorschlag)\w*/i],
  ["research", /\b(studie|study|research|evaluation|daten zeigen|data show)\w*/i],
  ["incident", /\b(angriff|attack|earthquake|erdbeben|flood|hochwasser|outage|ausfall|explosion)\w*/i],
  ["announcement", /\b(announc|ankünd|ankuend|plant|plans)\w*/i],
];

// Headlines can describe one event with different compounds or spellings.
// These narrow observable facts supplement title similarity; one shared topic
// or person remains deliberately insufficient.
const EVENT_FACTS = [
  ["air_attack_pause", /\b(?:angriffspause|angriffsstopp|(?:stopp|pause)\w*\s+(?:der\s+)?(?:luft)?angriffe|nicht\s+anzugreifen)\b/i],
  ["ceasefire", /\b(?:waffenruhe|waffenstillstand|ceasefire)\b/i],
  ["data_publication", /\b(?:daten\w*\s+(?:im\s+darknet\s+)?veroffentlich|veroffentlich\w*\s+daten\w*\s+(?:im\s+)?darknet)\b/i],
];
const PLACE_ALIASES = [
  ["kyjiw", /\b(?:kiew|kyjiw|kyiv)\b/i],
];
const NUMBER_WORDS = new Map([["ein", "1"], ["einen", "1"], ["einem", "1"], ["eine", "1"], ["zwei", "2"], ["drei", "3"], ["vier", "4"], ["funf", "5"], ["sechs", "6"], ["sieben", "7"]]);
const TITLE_ANCHOR_IGNORED = new Set([...ignored, "ukraine", "russland", "krieg", "kiew", "kyjiw", "kyiv", "tage", "tagig", "dreitagigen"]);

function eventFacts(text, title) {
  const normalized = String(text || "").normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
  const durations = new Set();
  for (const match of normalized.matchAll(/\b(?:(\d+)|([a-z]+))(?:tagig\w*|\s+tage?n?)\b/g)) {
    const value = match[1] || NUMBER_WORDS.get(match[2]);
    if (value) durations.add(`${value}d`);
  }
  return {
    concepts: EVENT_FACTS.filter(([, pattern]) => pattern.test(normalized)).map(([name]) => name),
    places: PLACE_ALIASES.filter(([, pattern]) => pattern.test(normalized)).map(([name]) => name),
    durations: [...durations],
    anchors: [...tokens(title)].filter((term) => !TITLE_ANCHOR_IGNORED.has(term)),
  };
}

export function eventFingerprint(item) {
  const text = `${item.title || ""} ${item.summary || ""}`;
  const titleTerms = [...tokens(item.title)].sort();
  const entities = [...new Set((text.match(/\b(?:[A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+){1,3}|[A-Z]{2,8})\b/g) || []).map((value) => words(value).join(" ")))];
  const references = [...new Set(text.match(/\b(?:\d{4}\/\d{2,5}|\d{1,4}\/\d{2})\b/g) || [])];
  const doi = text.match(/\b10\.\d{4,9}\/[\w.();/:+-]+/i)?.[0]?.toLowerCase() || null;
  const eventType = EVENT_TYPES.find(([, pattern]) => pattern.test(text))?.[0] || "other";
  // Publisher coverage is not the location of the reported event.
  const facts = eventFacts(text, item.title);
  const fingerprint = { title_terms: titleTerms, entities, references, doi, event_type: eventType, geography: item.event_geography || [], day: (item.published_at || "").slice(0, 10), facts };
  return { ...fingerprint, id: `event-${hash(JSON.stringify(fingerprint))}` };
}

export function eventCompatibility(a, b) {
  const left = eventFingerprint(a), right = eventFingerprint(b);
  if (a.url && a.url === b.url) return { same_event: true, related: true, reason: "same_document" };
  const timeGap = Math.abs(ms(a.published_at) - ms(b.published_at));
  const reference = left.references.some((value) => right.references.includes(value)) || (left.doi && left.doi === right.doi);
  const shared = left.title_terms.filter((term) => right.title_terms.includes(term)).length;
  const similarity = shared / Math.max(1, Math.min(left.title_terms.length, right.title_terms.length));
  const sharedFacts = left.facts.concepts.filter((value) => right.facts.concepts.includes(value));
  const sharedPlaces = left.facts.places.filter((value) => right.facts.places.includes(value));
  const sharedDurations = left.facts.durations.filter((value) => right.facts.durations.includes(value));
  const sharedAnchors = left.facts.anchors.filter((value) => right.facts.anchors.includes(value));
  const structuredFactMatch = sharedFacts.length > 0 && sharedPlaces.length > 0 && sharedDurations.length > 0 && sharedAnchors.length > 0;
  const eventTypesDiffer = left.event_type !== "other" && right.event_type !== "other" && left.event_type !== right.event_type;
  const geographyConflict = left.geography.length && right.geography.length && !left.geography.some((region) => right.geography.includes(region));
  return {
    same_event: !eventTypesDiffer && !geographyConflict && timeGap <= 96 * 3600000 && (reference || structuredFactMatch || (shared >= 3 && similarity >= 0.72)),
    related: Boolean(reference || structuredFactMatch || (shared >= 3 && similarity >= 0.5)),
    reason: eventTypesDiffer ? "different_event_stage" : reference ? "shared_document_reference" : structuredFactMatch ? "structured_event_facts" : "entity_time_text_overlap",
  };
}

export function freshnessFor(story, now = new Date().toISOString()) {
  const sourceDates = (story.sources || []).map((source) => ms(source.source_published_at || source.published_at)).filter(Boolean);
  const sourceAt = Math.max(0, ...sourceDates);
  const firstSeen = ms(story.event_first_seen_at || story.first_seen);
  const detected = ms(story.event_detected_at) || firstSeen;
  const verification = ms(story.verification_started_at);
  const published = ms(story.published_at);
  const ready = ms(story.publish_ready_at);
  const age = sourceAt ? Math.max(0, (ms(now) - sourceAt) / 60000) : null;
  const target = { "sehr hoch": 30, hoch: 60, mittel: 120 }[story.preanalysis?.public_relevance || story.analysis?.importance] || 120;
  return {
    source_age_minutes: age,
    detection_delay_minutes: sourceAt && detected ? Math.max(0, (detected - sourceAt) / 60000) : null,
    verification_delay_minutes: ready && verification ? Math.max(0, (ready - verification) / 60000) : null,
    publication_delay_minutes: published && detected ? Math.max(0, (published - detected) / 60000) : null,
    queue_age_minutes: detected ? Math.max(0, (ms(now) - detected) / 60000) : null,
    target_publication_minutes: target,
    news_freshness_score: age === null ? null : Math.round(Math.max(0, 100 * (1 - age / (target * 4)))),
    freshness_warning: !published && detected && ms(now) - detected > target * 60000 ? "PUBLICATION_TARGET_EXCEEDED" : age !== null && age > 1440 ? "OLDER_SOURCE_RECHECK_REQUIRED" : null,
  };
}

export function sourceHealth(source, state, now) {
  const status = state?.source_status?.[source.source_id] || {};
  const access = sourceAccess(source);
  const interval = Math.max(5, source.poll_minutes || SOURCE_INTERVALS[source.frequency_class] || 15);
  const stale = Boolean(status.last_success) && ms(now) - ms(status.last_success) > Math.max(60, interval * 3) * 60000;
  const latestAgeLimit = Number(source.max_latest_item_age_hours || (source.research_lane === "media" ? 72 : source.frequency_class === "slow_monitoring" ? 2160 : 720));
  const staleContent = Boolean(status.latest_item) && ms(now) - ms(status.latest_item) > latestAgeLimit * 3600000;
  return {
    source_id: source.source_id, publisher_id: source.publisher_id || source.source_id,
    status: !access.allowed ? source.access?.status || "disabled" : status.last_error ? "disturbed" : stale ? "stale" : staleContent ? "stale_content" : status.last_success ? "active" : "configured_not_yet_verified",
    content_warning: staleContent ? "LATEST_ITEM_OLDER_THAN_EXPECTED" : status.last_success && !status.latest_item ? "NO_RELIABLE_PUBLICATION_DATE" : null,
    last_success: status.last_success || null, latest_item: status.latest_item || null,
    last_error: status.last_error || null, interval_minutes: interval,
    error_rate: status.attempts ? Number(((status.failures || 0) / status.attempts).toFixed(3)) : null,
  };
}

export function coverageReport(sources, stories) {
  const by = (field) => Object.fromEntries([...new Set(sources.flatMap((source) => source[field] || "unknown"))].map((value) => [value, sources.filter((source) => [source[field]].flat().includes(value)).length]));
  const published = stories.filter((story) => story.published && story.listed !== false);
  const origins = new Map();
  for (const story of published) for (const source of story.sources) {
    const origin = source.provenance?.origin || `publisher:${source.publisher_id || source.source_id}`;
    origins.set(origin, (origins.get(origin) || 0) + 1);
  }
  return { configured_sources: sources.length, by_lane: by("research_lane"), by_language: by("language"), by_geography: by("geography"), published_origin_counts: Object.fromEntries(origins), completeness: "Observed configured sources only; not the entire media landscape." };
}

export function dueFollowups(stories, now) {
  return stories.flatMap((story) => (story.followups || []).filter((followup) => !["resolved", "cancelled"].includes(followup.status) && ms(followup.follow_up_date) && ms(followup.follow_up_date) <= ms(now)).map((followup) => ({ ...followup, story_id: story.story_id })));
}

export function nextDeepeningCheckpoint(now) {
  const start = Math.floor(ms(now) / 3600000) * 3600000;
  for (let hour = 1; hour <= 25; hour++) {
    const candidate = new Date(start + hour * 3600000);
    const localHour = Number(new Intl.DateTimeFormat("en", { timeZone: "Europe/Berlin", hour: "numeric", hourCycle: "h23" }).format(candidate));
    if ([7, 12, 16, 20].includes(localHour)) return candidate.toISOString();
  }
  throw new Error("DEEPENING_CHECKPOINT_UNAVAILABLE");
}

export function discoveryCandidates(sources, knownSources, now) {
  const known = new Set(knownSources.map((source) => new URL(source.url).hostname));
  const urls = sources.flatMap((source) => String(source.article_excerpt || source.summary || "").match(/https:\/\/[^\s<>"']+/g) || []);
  return [...new Set(urls)].flatMap((url) => {
    try { const host = new URL(url).hostname; return known.has(host) ? [] : [{ id: `discovery-${hash(host)}`, url: `https://${host}/`, discovered_at: now, status: "quarantined", reason: "New publisher requires access, relevance and editorial review; never auto-enabled." }]; } catch { return []; }
  });
}

export function validateNewsroomAnalysis(analysis, story) {
  const errors = [];
  if (!new Set(["developing", "preliminary", "confirmed", "disputed", "corrected", "updated"]).has(analysis.news_status)) errors.push("NEWS_STATUS_REQUIRED");
  const claims = analysis.event_claims;
  if (!Array.isArray(claims) || !claims.length || claims.length > 6) return [...errors, "EVENT_CLAIMS_REQUIRED"];
  for (const claim of claims) {
    const statuses = new Set(["single_source_claim", "confirmed_claim", "disputed_claim", "primary_source_claim", "uncertain_claim"]);
    if (!claim || typeof claim.claim !== "string" || !claim.claim.trim() || !statuses.has(claim.status)) { errors.push("EVENT_CLAIM_INVALID"); continue; }
    if (!Array.isArray(claim.evidence) || !claim.evidence.length) { errors.push("CLAIM_EVIDENCE_REQUIRED"); continue; }
    const cited = [];
    for (const proof of claim.evidence) {
      const source = story.sources.find((entry) => entry.source_id === proof.source_id && entry.url === proof.url);
      const text = `${source?.title || ""} ${source?.summary || ""} ${source?.article_excerpt || ""}`.replace(/\s+/g, " ").toLowerCase();
      const quote = String(proof.excerpt || "").replace(/\s+/g, " ").trim().toLowerCase();
      if (!source || quote.length < 12 || quote.length > 240 || !text.includes(quote)) errors.push("CLAIM_EVIDENCE_NOT_IN_SOURCE");
      if (source) cited.push(source);
    }
    const groups = evidenceGroups(cited);
    const proofNumbers = new Set((claim.evidence.map((proof) => proof.excerpt || "").join(" ").match(/\b\d+(?:[.,]\d+)?\b/g) || []).map((number) => number.replace(".", ",")));
    for (const number of claim.claim.match(/\b\d+(?:[.,]\d+)?\b/g) || []) if (!proofNumbers.has(number.replace(".", ","))) errors.push("CLAIM_NUMBER_NOT_IN_EVIDENCE");
    if (claim.status === "confirmed_claim" && groups.possible_independent_origins < 2) errors.push("CLAIM_INDEPENDENCE_NOT_ESTABLISHED");
    if (claim.status === "primary_source_claim" && !cited.some((source) => source.primary_source)) errors.push("CLAIM_PRIMARY_SOURCE_MISSING");
    if (cited.some((source) => source.requires_corroboration) && !cited.some((source) => !source.requires_corroboration) && claim.status !== "uncertain_claim") errors.push("CLAIM_CRITICAL_SOURCE_UNCORROBORATED");
  }
  if (analysis.news_status === "confirmed" && claims.some((claim) => ["single_source_claim", "uncertain_claim", "disputed_claim"].includes(claim.status))) errors.push("CONFIRMED_STATUS_OVERCLAIM");
  if (!Array.isArray(analysis.followups)) errors.push("FOLLOWUPS_ARRAY_REQUIRED");
  else for (const followup of analysis.followups) {
    if (!followup.claim || !story.sources.some((source) => source.source_id === followup.source_id) || !followup.measurable_indicator) errors.push("FOLLOWUP_INVALID");
    if (followup.expected_by && !ms(followup.expected_by)) errors.push("FOLLOWUP_DATE_INVALID");
    if (followup.expected_by) {
      const source = story.sources.find((entry) => entry.source_id === followup.source_id);
      const available = `${source?.title || ""} ${source?.summary || ""} ${source?.article_excerpt || ""}`.replace(/\s+/g, " ").toLowerCase();
      const proof = String(followup.expected_by_evidence || "").replace(/\s+/g, " ").trim().toLowerCase();
      if (proof.length < 12 || proof.length > 240 || !available.includes(proof)) errors.push("FOLLOWUP_DATE_UNSUPPORTED");
    }
  }
  return [...new Set(errors)];
}

export function sourceEvidenceSegments(source) {
  const passages = [String(source.title || "").slice(0, 220), String(source.summary || "").slice(0, 720), String(source.article_excerpt || "").slice(0, 5000)];
  const excerpts = [];
  for (const passage of passages) {
    let remaining = passage.replace(/\s+/g, " ").trim();
    while (remaining.length > 240) {
      const boundary = remaining.lastIndexOf(" ", 220);
      const end = boundary >= 12 ? boundary : 220;
      excerpts.push(remaining.slice(0, end));
      remaining = remaining.slice(end).trim();
    }
    if (remaining.length >= 12) excerpts.push(remaining);
  }
  return [...new Set(excerpts)].map((excerpt) => ({ evidence_id: `ev-${hash(`${source.source_id}:${source.url}:${excerpt}`)}`, excerpt }));
}

export function resolveEvidenceReferences(analysis, story) {
  const catalog = new Map(story.sources.flatMap((source) => sourceEvidenceSegments(source).map(({ evidence_id, excerpt }) => [evidence_id, { source_id: source.source_id, url: source.url, excerpt }])));
  for (const claim of analysis?.event_claims || []) {
    if (!Array.isArray(claim.evidence)) continue;
    claim.evidence = claim.evidence.map((proof) => proof && Object.keys(proof).every((key) => key === "evidence_id") && catalog.has(proof.evidence_id) ? { ...catalog.get(proof.evidence_id) } : proof);
    // Conservatively reduce overclaimed source roles, never manufacture evidence.
    const cited = claim.evidence.map((proof) => story.sources.find((source) => source.source_id === proof?.source_id && source.url === proof?.url)).filter(Boolean);
    if (claim.status === "primary_source_claim" && cited.length && !cited.some((source) => source.primary_source)) claim.status = "single_source_claim";
  }
  if (analysis?.news_status === "confirmed" && analysis.event_claims?.some((claim) => ["single_source_claim", "uncertain_claim", "disputed_claim"].includes(claim.status))) analysis.news_status = analysis.event_claims.some((claim) => claim.status === "disputed_claim") ? "disputed" : "preliminary";
  if (analysis?.publication_depth === "initial" && !analysis.transformation_potential?.trim()) analysis.transformation_potential = "Aus den verfügbaren Quellen noch nicht ableitbar.";
  return analysis;
}

export function normalizeEvidenceExcerpts(analysis, story) {
  for (const claim of analysis?.event_claims || []) {
    if (!Array.isArray(claim.evidence)) continue;
    claim.evidence = claim.evidence.flatMap((proof) => {
      const source = story.sources.find((entry) => entry.source_id === proof.source_id && entry.url === proof.url);
      const original = String(proof.excerpt || "").replace(/\s+/g, " ").trim();
      const available = `${source?.title || ""} ${source?.summary || ""} ${source?.article_excerpt || ""}`.replace(/\s+/g, " ").toLowerCase();
      // Reformat an exact long excerpt into bounded contiguous pieces. Never
      // repair a paraphrase, missing source, invented number or mismatched URL.
      if (!source || original.length <= 240 || original.length > 1000 || !available.includes(original.toLowerCase())) return [proof];
      const chunks = [];
      let remaining = original;
      while (remaining.length > 220) {
        const end = remaining.lastIndexOf(" ", 200);
        if (end < 12) return [proof];
        chunks.push(remaining.slice(0, end)); remaining = remaining.slice(end).trim();
      }
      if (remaining.length < 12) return [proof];
      chunks.push(remaining);
      return chunks.map((excerpt) => ({ ...proof, excerpt }));
    });
  }
  return analysis;
}

export function persistClaimEvidence(analysis, story, now) {
  return (analysis.event_claims || []).map((claim, index) => ({
    claim_id: `${story.story_id}-v${Number(story.existing_story?.current_version || 0) + 1}-claim-${index + 1}`,
    story_id: story.story_id, claim: claim.claim, status: claim.status,
    source_id: claim.evidence[0].source_id,
    evidence: claim.evidence.map(({ source_id, url, excerpt }) => ({ source_id, url, excerpt_hash: hash(excerpt), checked_at: now })),
    verification_method: "AI claim review with deterministic source-excerpt and dependency checks; not independent real-world proof",
    checked_at: now,
  }));
}
