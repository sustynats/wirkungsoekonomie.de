import fs from "node:fs";
import path from "node:path";
import { sourceAccess } from "./access-policy.mjs";
import { FEDERAL_STATES } from "./regional-coverage.mjs";

export const SOURCE_GOVERNANCE_ROLES = Object.freeze(["A", "B", "C", "D", "E", "F"]);

const safeHost = (value) => {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ""); }
  catch { return null; }
};

function defaultGovernanceRole(source) {
  if (source.source_type === "excluded") return "F";
  if (source.enabled) return "A";
  if (source.primary_source) return "D";
  if (["agency_api", "media_discovery"].includes(source.source_type)) return "C";
  return "E";
}

export function normalizeSourceGovernance(source) {
  const role = source.role || defaultGovernanceRole(source);
  const accessStatus = source.access?.status || (source.enabled ? "public" : "open");
  const activeEndpoint = Boolean(source.enabled && source.feed_url && accessStatus === "public");
  return {
    ...source,
    publisher: source.publisher || source.name,
    canonical_domain: source.canonical_domain || safeHost(source.url),
    role,
    source_function: source.source_function || source.source_role || (source.primary_source ? "primary_evidence" : "journalism"),
    topics: source.topics || [source.topic].filter(Boolean),
    regions: source.regions || source.geography || [],
    languages: source.languages || [source.language || "de"],
    feed_type: source.feed_type || source.source_type || null,
    index_url: source.index_url || (source.source_type === "html_index" ? source.feed_url : null),
    api_url: source.api_url || (["europepmc_json", "woek_public_assessments_json"].includes(source.source_type) ? source.feed_url : null),
    official_endpoint_verified: source.official_endpoint_verified ?? activeEndpoint,
    endpoint_checked_at: source.endpoint_checked_at || null,
    robots_url: source.robots_url || null,
    robots_status: source.robots_status || (source.enabled ? "checked_at_runtime" : "open"),
    rsl_url: source.rsl_url || null,
    rsl_status: source.rsl_status || "open",
    terms_url: source.terms_url || source.access?.terms_url || null,
    terms_status: source.terms_status || (source.access?.terms_url ? "linked" : "open"),
    access_status: source.access_status || accessStatus,
    paywall_status: source.paywall_status || (source.access?.requires_payment ? "paywall" : "not_used"),
    login_required: source.login_required ?? Boolean(source.access?.requires_login),
    automation_allowed_status: source.automation_allowed_status || (activeEndpoint ? "metadata_only" : "open"),
    metadata_use_status: source.metadata_use_status || (activeEndpoint ? "allowed_for_research" : "open"),
    teaser_use_status: source.teaser_use_status || (activeEndpoint ? "bounded_research_input" : "open"),
    article_fetch_status: source.article_fetch_status || (source.access?.article === "bounded_public_text" ? "bounded_public_text" : "disabled"),
    technical_access: source.technical_access || (activeEndpoint ? "verified" : "open"),
    legal_use_status: source.legal_use_status || (activeEndpoint ? "metadata_only" : "open"),
    legal_confidence: source.legal_confidence || (activeEndpoint ? "medium" : "low"),
    legal_notes: source.legal_notes || source.access?.note || null,
    needs_manual_legal_review: source.needs_manual_legal_review ?? !activeEndpoint,
    commercial_restriction: source.commercial_restriction ?? null,
    private_use_restriction: source.private_use_restriction ?? null,
    cadence: source.cadence || source.frequency_class || "high_frequency",
    priority: Number(source.priority || 0),
    journalistic_source: source.journalistic_source ?? !source.primary_source,
    ngo_source: source.ngo_source ?? source.publisher_kind === "ngo",
    interest_source: source.interest_source ?? Boolean(source.requires_corroboration || source.publisher_kind === "ngo"),
    agency_provenance_possible: source.agency_provenance_possible ?? !source.primary_source,
    unique_information_score: source.unique_information_score ?? null,
    material_hit_probability: source.material_hit_probability ?? null,
    duplication_risk: source.duplication_risk ?? null,
    noise_risk: source.noise_risk ?? null,
    freshness_advantage: source.freshness_advantage ?? null,
    coverage_gap_closed: source.coverage_gap_closed || [],
    estimated_ai_load: source.estimated_ai_load ?? null,
    trial_mode: Boolean(source.trial_mode),
  };
}

export function loadNewsRegistry(root) {
  const base = JSON.parse(fs.readFileSync(path.join(root, "content/news/source-registry.json"), "utf8"));
  const extensionPath = path.join(root, "content/news/media-registry.json");
  const extension = fs.existsSync(extensionPath) ? JSON.parse(fs.readFileSync(extensionPath, "utf8")) : { sources: [] };
  const sources = [...base.sources, ...extension.sources].map((source) => ({
    publisher_id: source.source_id.startsWith("bundesregierung-") ? "bundesregierung" : source.source_id.startsWith("bundestag-") ? "bundestag" : source.source_id,
    publisher_kind: "institution", research_lane: "primary", language: "de", geography: ["DE"],
    frequency_class: "high_frequency",
    access: { status: "public", cost_usd: 0, requires_payment: false, requires_login: false, article: "bounded_public_text" },
    ...source,
    ...(extension.source_overrides?.[source.source_id] || {}),
  })).map((source) => source.source_type.startsWith("woek_") ? { ...source, publisher_kind: "own_publication", source_role: "own_publication", research_lane: "primary" } : source).map((source) => (extension.public_article_sources || []).includes(source.source_id) ? { ...source, access: { ...source.access, article: "bounded_public_text", note: "RSS-Metadaten zur Erkennung; bei ausgewählten relevanten Ereignissen begrenzten frei zugänglichen Originaltext flüchtig prüfen. Robots-Regeln, Login- und Paywall-Sperren gelten weiterhin. Keine Bilder oder Artikelkopien veröffentlichen." } } : source).map(normalizeSourceGovernance);
  return { ...base, sources, policy: { ...base.policy, ...extension.policy, news_access_budget_usd: 0, free_public_sources_only: true, paywall_bypass: false } };
}

export function registryErrors(registry) {
  const errors = [];
  const ids = new Set(), feeds = new Set();
  for (const source of registry.sources) {
    if (!/^[a-z0-9-]+$/.test(source.source_id || "") || !/^[a-z0-9-]+$/.test(source.publisher_id || "") || !source.name) errors.push(`SOURCE_INVALID:${source.source_id}`);
    if (ids.has(source.source_id)) errors.push(`SOURCE_ID_DUPLICATE:${source.source_id}`);
    ids.add(source.source_id);
    if (source.federal_states && (!Array.isArray(source.federal_states)
      || source.federal_states.some(code => !FEDERAL_STATES.some(([state]) => state === code))
      || new Set(source.federal_states).size !== source.federal_states.length)) errors.push(`SOURCE_FEDERAL_STATES_INVALID:${source.source_id}`);
    if (!SOURCE_GOVERNANCE_ROLES.includes(source.role)) errors.push(`SOURCE_GOVERNANCE_ROLE_INVALID:${source.source_id}`);
    if (source.enabled && source.role !== "A") errors.push(`SOURCE_ACTIVE_ROLE_INVALID:${source.source_id}`);
    if (source.enabled) {
      if (!source.feed_url) errors.push(`SOURCE_FEED_MISSING:${source.source_id}`);
      else if (feeds.has(source.feed_url)) errors.push(`SOURCE_FEED_DUPLICATE:${source.source_id}`);
      feeds.add(source.feed_url);
      const access = sourceAccess(source);
      if (!access.allowed) errors.push(`SOURCE_ACCESS_INVALID:${source.source_id}:${access.reason}`);
      if (!source.official_endpoint_verified || source.technical_access !== "verified") errors.push(`SOURCE_ENDPOINT_NOT_VERIFIED:${source.source_id}`);
      if (!["metadata_only", "metadata_syndication_allowed", "own_publication"].includes(source.legal_use_status)) errors.push(`SOURCE_LEGAL_USE_OPEN:${source.source_id}`);
    }
    for (const url of [source.url, source.feed_url].filter(Boolean)) {
      try { if (new URL(url).protocol !== "https:") throw new Error(); } catch { errors.push(`SOURCE_HTTPS_REQUIRED:${source.source_id}`); }
    }
  }
  return errors;
}

export function normalizeNewsRegistry(registry) {
  return { ...registry, sources: (registry?.sources || []).map(normalizeSourceGovernance) };
}
