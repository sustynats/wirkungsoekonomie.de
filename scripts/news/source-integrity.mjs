import { createHash } from "node:crypto";
import { storySimilarity } from "./lib.mjs";
import { eventCompatibility } from "./newsroom.mjs";
import { fileSubject, livingFileMatch, subjectConflict } from "./living-files.mjs";

export const SOURCE_INTEGRITY_VERSION = "1.0";

const normalHost = (value) => {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ""); }
  catch { return ""; }
};
const relatedHost = (left, right) => Boolean(left && right && (left === right || left.endsWith(`.${right}`) || right.endsWith(`.${left}`)));
const registryHosts = (source = {}) => [...new Set([
  normalHost(source.url), normalHost(source.feed_url),
  ...(source.allowed_redirect_hosts || []).map((host) => normalHost(`https://${host}`)),
].filter(Boolean))];

function matchingRegistrySources(url, registry) {
  const host = normalHost(url);
  return (registry?.sources || []).filter((source) => registryHosts(source).some((candidate) => relatedHost(host, candidate)));
}

export function reconcileSourceIdentity(item, collectionSource, registry) {
  const host = normalHost(item?.url);
  if (!host || !collectionSource) return item;
  const secureUrl = String(item.url || "").replace(/^http:\/\//i, "https://");
  if (registryHosts(collectionSource).some((candidate) => relatedHost(host, candidate))) return secureUrl === item.url ? item : { ...item, url: secureUrl };
  const matches = matchingRegistrySources(item.url, registry);
  const publishers = [...new Map(matches.map((source) => [source.publisher_id || source.source_id, source])).values()];
  if (publishers.length !== 1) return item;
  const owner = publishers[0];
  return {
    ...item,
    url: secureUrl,
    collection_source_id: item.source_id,
    collection_publisher_id: item.publisher_id || collectionSource.publisher_id || collectionSource.source_id,
    source_id: owner.source_id,
    publisher: owner.name,
    source_type: owner.source_type,
    primary_source: Boolean(owner.primary_source),
    source_priority: Number(owner.priority || 0),
    source_topic: owner.topic,
    publisher_id: owner.publisher_id || owner.source_id,
    publisher_kind: owner.publisher_kind,
    source_role: owner.source_role || (owner.primary_source ? "institutional_statement" : "journalistic_report"),
    language: owner.language || item.language,
    geography: owner.geography || item.geography,
    research_lane: owner.research_lane || item.research_lane,
    requires_corroboration: Boolean(owner.requires_corroboration),
    agency_origin: item.agency_origin || "unknown",
    agency_origin_confidence: item.agency_origin_confidence || "unknown",
    provenance: {
      ...(item.provenance || {}),
      origin: item.agency_origin && item.agency_origin !== "unknown" ? `agency:${item.agency_origin}` : `publisher:${owner.publisher_id || owner.source_id}`,
      basis: item.agency_origin && item.agency_origin !== "unknown" ? "agency_attribution_in_available_text" : "publisher_resolved_from_registered_target_url",
      collection_source_id: item.source_id,
    },
  };
}

function highConfidenceSubjectConflict(source, story) {
  const left = fileSubject(source), right = fileSubject(story);
  if (left.elections.length && right.elections.length && !left.elections.some((value) => right.elections.includes(value))) return "different_election_jurisdiction";
  if (left.countries.length && right.countries.length && !left.countries.some((value) => right.countries.includes(value)) && storySimilarity(source.title, story.title) < 0.18) return "different_country";
  if (subjectConflict(source, story) && storySimilarity(source.title, story.title) < 0.18 && left.key && right.key && left.key !== right.key) return "different_concrete_incident";
  return null;
}

function semanticSupport(source, story) {
  const titleScore = storySimilarity(source.title, story.title);
  const contextScore = storySimilarity(`${source.title || ""} ${source.summary || ""}`, `${story.title || ""} ${story.source_summary || story.analysis?.summary || ""}`);
  const direct = eventCompatibility(source, { title: story.title, summary: story.source_summary || story.analysis?.summary, published_at: story.last_updated || story.published_at, event_geography: story.event_geography || [] });
  const references = (value) => new Set((String(value || "").match(/\b(?:[A-ZÄÖÜ]{2,}(?:-[\p{L}]+)*|[\p{L}-]+gesetz)\b/gu) || []).map((entry) => entry.toLowerCase()));
  const sourceReferences = references(`${source.title || ""} ${source.summary || ""} ${source.article_excerpt || ""}`);
  const storyReferences = references(`${story.title || ""} ${story.source_summary || story.analysis?.summary || ""}`);
  const sharedReference = [...sourceReferences].some((reference) => storyReferences.has(reference));
  const peer = (story.sources || []).some((other) => other !== source && !highConfidenceSubjectConflict(source, other)
    && (eventCompatibility(source, other).related
      || storySimilarity(source.title, other.title) >= 0.24
      || storySimilarity(`${source.title || ""} ${source.summary || ""}`, `${other.title || ""} ${other.summary || ""}`) >= 0.2
      || livingFileMatch(source, { ...story, sources: [other] }).score >= 0.98));
  return { supported: titleScore >= 0.18 || contextScore >= 0.2 || direct.related || sharedReference || peer, title_score: Number(titleScore.toFixed(3)), context_score: Number(contextScore.toFixed(3)), shared_reference: sharedReference, peer_support: peer };
}

export function sourceIntegrityForStory(story, registry, existingStories = [], now = new Date().toISOString()) {
  const registryById = new Map((registry?.sources || []).map((source) => [source.source_id, source]));
  const issues = [];
  const warnings = [];
  const checks = [];
  const nowMs = Date.parse(now);
  for (const source of story.sources || []) {
    const registrySource = registryById.get(source.source_id);
    const urlHost = normalHost(source.url);
    const publishedAt = Date.parse(source.source_published_at || source.published_at || "");
    const check = { source_id: source.source_id, url: source.url, publisher: source.publisher, title: source.title, status: "verified", checks: [] };
    const add = (code, detail) => { issues.push({ source_id: source.source_id, url: source.url, code, detail }); check.status = "open"; };
    if (!urlHost || !String(source.url || "").startsWith("https://")) add("SOURCE_URL_INVALID", "Die Quellen-URL ist nicht als öffentliche HTTPS-Adresse prüfbar.");
    if (!registrySource) add("SOURCE_REGISTRY_ID_UNKNOWN", "Die Quellen-ID ist im aktiven Register nicht vorhanden.");
    else {
      if (!registryHosts(registrySource).some((candidate) => relatedHost(urlHost, candidate))) add("SOURCE_PUBLISHER_URL_MISMATCH", "URL-Host und registrierter Publisher stimmen nicht überein.");
      if (source.publisher_id && source.publisher_id !== (registrySource.publisher_id || registrySource.source_id)) add("SOURCE_PUBLISHER_ID_MISMATCH", "Gespeicherter und registrierter Publisher stimmen nicht überein.");
      if (Boolean(source.primary_source) !== Boolean(registrySource.primary_source)) add("SOURCE_ROLE_MISMATCH", "Primär-/Sekundärquellenrolle widerspricht dem Register.");
    }
    if (!String(source.title || "").trim()) add("SOURCE_TITLE_MISSING", "Der extrahierte Quellentitel fehlt.");
    if (!Number.isFinite(publishedAt) || (Number.isFinite(nowMs) && publishedAt > nowMs + 10 * 60000)) add("SOURCE_PUBLICATION_DATE_INVALID", "Das Veröffentlichungsdatum fehlt, ist ungültig oder liegt unplausibel in der Zukunft.");
    const conflict = highConfidenceSubjectConflict(source, story);
    if (conflict) add("SOURCE_STORY_SUBJECT_CONFLICT", conflict);
    const semantic = semanticSupport(source, story);
    if (!semantic.supported) add("SOURCE_SEMANTIC_FIT_OPEN", `Titel-/Kontextpassung nicht ausreichend belegt (${semantic.title_score}/${semantic.context_score}).`);
    const conflictingReuse = (existingStories || []).filter((other) => other.story_id !== story.story_id && other.published && other.listed !== false
      && (other.sources || []).some((candidate) => candidate.url === source.url)
      && highConfidenceSubjectConflict(source, other));
    if (conflictingReuse.length) warnings.push({ source_id: source.source_id, url: source.url, code: "SOURCE_MUTABLE_URL_REUSED", detail: `Dieselbe veränderliche URL liegt in ${conflictingReuse.length} fachlich abweichenden Akte(n); die aktuelle Inhaltsübereinstimmung ist beim Abruf erneut zu prüfen.` });
    check.checks.push({ publisher_url: !issues.some((entry) => entry.url === source.url && /PUBLISHER|URL_INVALID/.test(entry.code)), semantic, subject_conflict: conflict, publication_date: Number.isFinite(publishedAt) ? new Date(publishedAt).toISOString() : null });
    checks.push(check);
  }
  if (!(story.sources || []).length) issues.push({ source_id: null, url: null, code: "SOURCE_MISSING", detail: "Die Story enthält keine Quelle." });
  const status = issues.length ? "open" : "verified";
  return {
    status,
    publication_status: status === "verified" ? "eligible" : "hold",
    version: SOURCE_INTEGRITY_VERSION,
    checked_at: now,
    source_count: (story.sources || []).length,
    issues,
    warnings,
    checks,
    fingerprint: createHash("sha256").update(JSON.stringify((story.sources || []).map((source) => [source.source_id, source.url, source.title, source.content_hash]))).digest("hex"),
  };
}

export function auditSourceIntegrity(stories, registry, now = new Date().toISOString()) {
  const reviewed = (stories || []).filter((story) => story.published && story.listed !== false);
  const results = reviewed.map((story) => ({ story_id: story.story_id, slug: story.slug, title: story.title, ...sourceIntegrityForStory(story, registry, reviewed, now) }));
  return {
    schema_version: "1.0",
    generated_at: now,
    gate_version: SOURCE_INTEGRITY_VERSION,
    stories_checked: results.length,
    sources_checked: results.reduce((sum, result) => sum + result.source_count, 0),
    passed: results.filter((result) => result.status === "verified").length,
    held: results.filter((result) => result.status === "open").length,
    warnings: results.reduce((sum, result) => sum + result.warnings.length, 0),
    findings: results.filter((result) => result.status === "open"),
    warning_findings: results.filter((result) => result.warnings.length).map((result) => ({ story_id: result.story_id, slug: result.slug, title: result.title, warnings: result.warnings })),
  };
}

export function sourceIntegrityRecord(result = {}) {
  return {
    status: result.status === "verified" ? "verified" : "open",
    publication_status: result.status === "verified" ? "eligible" : "hold",
    version: result.version || SOURCE_INTEGRITY_VERSION,
    checked_at: result.checked_at || null,
    fingerprint: result.fingerprint || null,
    issue_codes: [...new Set((result.issues || []).map((issue) => issue.code))],
    warning_codes: [...new Set((result.warnings || []).map((warning) => warning.code))],
  };
}
