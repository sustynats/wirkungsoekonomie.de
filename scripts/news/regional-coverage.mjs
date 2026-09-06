import { sourceAccess } from "./access-policy.mjs";
import { sourceHealth } from "./newsroom.mjs";

export const FEDERAL_STATES = Object.freeze([
  ["DE-BW", "Baden-Württemberg"], ["DE-BY", "Bayern"], ["DE-BE", "Berlin"],
  ["DE-BB", "Brandenburg"], ["DE-HB", "Bremen"], ["DE-HH", "Hamburg"],
  ["DE-HE", "Hessen"], ["DE-MV", "Mecklenburg-Vorpommern"], ["DE-NI", "Niedersachsen"],
  ["DE-NW", "Nordrhein-Westfalen"], ["DE-RP", "Rheinland-Pfalz"], ["DE-SL", "Saarland"],
  ["DE-SN", "Sachsen"], ["DE-ST", "Sachsen-Anhalt"], ["DE-SH", "Schleswig-Holstein"],
  ["DE-TH", "Thüringen"],
]);

// Geographic remit is explicitly maintained in the existing source registry.
// Neither "DE" nor a national headline is proof of a dedicated regional radar.
export function regionalCoverage(registry, state = {}, now = new Date().toISOString()) {
  const rows = FEDERAL_STATES.map(([code, name]) => {
    const candidates = registry.sources.filter(source => source.federal_states?.includes(code));
    const sources = candidates.filter(source => source.enabled && source.role === "A"
      && sourceAccess(source).allowed && source.official_endpoint_verified
      && source.technical_access === "verified"
      && ["metadata_only", "metadata_syndication_allowed", "own_publication"].includes(source.legal_use_status))
      .map(source => ({
        source_id: source.source_id, publisher_id: source.publisher_id || source.source_id,
        name: source.name, scope: source.regional_coverage_kind || (source.primary_source ? "official_statements" : "journalism"),
        trial_mode: Boolean(source.trial_mode), ...sourceHealth(source, state, now),
      }));
    const active = sources.filter(source => source.status === "active");
    const firstRun = sources.some(source => source.status === "configured_not_yet_verified");
    return {
      code, name,
      status: active.length ? "monitored" : !sources.length ? "gap" : firstRun ? "awaiting_first_run" : "degraded",
      configured: sources.length > 0,
      journalistic_source_configured: sources.some(source => source.scope === "journalism"),
      journalistic_source_healthy: active.some(source => source.scope === "journalism"),
      sources,
      inactive_candidates: candidates.filter(source => !sources.some(entry => entry.source_id === source.source_id)).map(source => ({ source_id: source.source_id, publisher_id: source.publisher_id || source.source_id, name: source.name })),
    };
  });
  return {
    checked_at: now, required_states: FEDERAL_STATES.length,
    configured_states: rows.filter(row => row.configured).length,
    healthy_states: rows.filter(row => row.status === "monitored").length,
    journalistic_states: rows.filter(row => row.journalistic_source_configured).length,
    missing_states: rows.filter(row => row.status === "gap").map(row => row.code),
    degraded_states: rows.filter(row => row.status === "degraded").map(row => row.code),
    awaiting_first_run: rows.filter(row => row.status === "awaiting_first_run").map(row => row.code),
    // A known coverage gap is an editorial/configuration task, not a crashed run.
    review_required: rows.some(row => row.status !== "monitored" || !row.journalistic_source_healthy),
    rows,
  };
}
