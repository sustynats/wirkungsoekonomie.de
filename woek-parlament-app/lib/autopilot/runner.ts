import "server-only";

import { ensureDropboxFolders, uploadDropboxText } from "@/lib/dropbox/app-client";
import { processGovernmentDailyImpactIngest } from "@/lib/government/daily-impact-ingest";
import { processParliamentDaily } from "@/lib/parliament/daily-ingest";
import { berlinDateSlot } from "@/lib/parliament/daily-ingest-core";
import { lifecycleStateForElectionCycle, type ElectionCycleStatus } from "@/lib/autopilot/lifecycle";
import jurisdictionRegistryJson from "@/data/political-jurisdictions.json";
import sourceRegistryJson from "@/data/autopilot/source-registry.json";
import { processObservatorySourceMonitor } from "@/lib/observatory/source-monitor";
import { processStateElectionCalendar } from "@/lib/autopilot/state-election-monitor";
import { writeStateDailyDeliveries } from "@/lib/autopilot/state-daily-delivery";
import { processStateProgrammeMonitor } from "@/lib/autopilot/state-programme-monitor";

type DomainStatus = "OK" | "DEGRADED" | "BLOCKED";
type DomainHealth = { status: DomainStatus; last_run_at: string; detail: string };

type JurisdictionRegistry = {
  schema_version: string;
  as_of: string;
  jurisdictions: Array<{
    jurisdiction_id: string;
    jurisdiction_type: "FEDERAL" | "STATE" | "EU";
    name: string;
    active_term_id: string;
    active_government_term_id: string;
    government_lifecycle_state: string;
    government_monitoring_scope_start: string | null;
    election_cycle_state: string;
    next_election_date: string | null;
    source_status: string;
    source_health: string;
    monitoring_enabled: boolean;
  }>;
};

type SourceRegistry = {
  sources: Array<{ source_id: string; jurisdiction_id: string; institutional_role: string; name: string; base_url: string; access_type: string; adapter_status: string }>;
};

const root = "/WOEK/WOEK-AUTOPILOT";
const stateDailyRoot = "/WOEK/WOEK-LAENDER-DAILY";
const euDailyRoot = "/WOEK/WOEK-EU-DAILY";

type ElectionCycleRegistry = {
  cycles: Array<{
    election_cycle_id: string;
    jurisdiction_id: string;
    election_date: string;
    status: ElectionCycleStatus;
    election_cycle_state?: string;
    official_source_refs: string[];
    programme_collection_status: string;
    programme_analysis_status?: string;
    result_status: string;
    coalition_formation_status?: string;
    new_government_status?: string;
  }>;
};

function reconciledRegistry(registry: JurisdictionRegistry, electionCycles: ElectionCycleRegistry, checkedAt: string): JurisdictionRegistry {
  const cycles = new Map(electionCycles.cycles.map((entry) => [entry.jurisdiction_id, entry]));
  return {
    ...registry,
    as_of: checkedAt.slice(0, 10),
    jurisdictions: registry.jurisdictions.map((entry) => {
      const cycle = cycles.get(entry.jurisdiction_id);
      if (!cycle) return entry;
      return {
        ...entry,
        election_cycle_state: lifecycleStateForElectionCycle(cycle.status),
        next_election_date: cycle.election_date,
        last_election_check: checkedAt,
      };
    }),
  };
}

function statusForStateAdapters(registry: JurisdictionRegistry, sources: SourceRegistry): DomainHealth {
  const states = registry.jurisdictions.filter((entry) => entry.jurisdiction_type === "STATE");
  const activeStates = states.filter((entry) => entry.monitoring_enabled);
  const activeAdapterStates = new Set(sources.sources.filter((entry) => entry.adapter_status === "ACTIVE").map((entry) => entry.jurisdiction_id));
  const active = activeStates.filter((entry) => activeAdapterStates.has(entry.jurisdiction_id)).length;
  return {
    status: active > 0 && active === states.length ? "OK" : active > 0 ? "DEGRADED" : "BLOCKED",
    last_run_at: new Date().toISOString(),
    detail: `${active} von ${states.length} Länderjurisdiktionen besitzen einen vollständig freigegebenen amtlichen Adapter. Der statische Initialbestand ist kein operatives Monitoring.`,
  };
}

function statusForEuAdapters(sources: SourceRegistry): DomainHealth {
  const eu = sources.sources.filter((entry) => entry.jurisdiction_id === "EU");
  const active = eu.filter((entry) => entry.adapter_status === "ACTIVE").length;
  return {
    status: eu.length > 0 && active === eu.length ? "OK" : "DEGRADED",
    last_run_at: new Date().toISOString(),
    detail: `${active} von ${eu.length} definierten EU-Quellen sind als produktive Adapter freigegeben. Der EU-Backfill wird bis dahin nicht als vollständig ausgewiesen.`,
  };
}

function normalizedDomainStatus(result: unknown): DomainStatus {
  if (!result || typeof result !== "object") return "BLOCKED";
  const status = String((result as { status?: unknown }).status ?? "");
  if (/^(OK|COMPLETED|ALREADY_PROCESSED)$/.test(status)) return "OK";
  if (/^(NOT_CONFIGURED|BLOCKED|FAILED)$/.test(status)) return "BLOCKED";
  return "DEGRADED";
}

function resultDetail(label: string, result: unknown) {
  const status = result && typeof result === "object" ? String((result as { status?: unknown }).status ?? "unbekannt") : "unbekannt";
  return `${label}: ${status}`;
}

export async function processPoliticalAutopilot(now = new Date(), forceSlot: "AM" | "PM" | null = null) {
  const scheduled = berlinDateSlot(now);
  const berlin = forceSlot ? { ...scheduled, slot: forceSlot } : scheduled;
  if (!berlin.slot) return { status: "SKIPPED_OUTSIDE_SCHEDULE" as const, berlin_hour: berlin.hour };

  const electionCalendar = await processStateElectionCalendar(now);
  const registry = reconciledRegistry(
    jurisdictionRegistryJson as JurisdictionRegistry,
    { cycles: electionCalendar.cycles } as ElectionCycleRegistry,
    now.toISOString(),
  );
  const sourceRegistry = sourceRegistryJson as SourceRegistry;
  await ensureDropboxFolders([
    `${root}/CONTROL`, `${root}/REGISTRIES`, `${root}/LEDGERS`, `${root}/FEDERAL`, `${root}/STATES`, `${root}/EU`,
    `${stateDailyRoot}/CONTROL`, `${stateDailyRoot}/DELIVERIES`, `${stateDailyRoot}/FACHREVIEW`, `${stateDailyRoot}/ARCHIVE`, `${stateDailyRoot}/ledgers`,
    `${euDailyRoot}/CONTROL`, `${euDailyRoot}/DELIVERIES`, `${euDailyRoot}/FACHREVIEW`, `${euDailyRoot}/ARCHIVE`, `${euDailyRoot}/ledgers`,
  ]);

  const runId = `${berlin.date}-${berlin.slot}`;
  const runAt = now.toISOString();
  const [government, parliament, observatory] = await Promise.allSettled([
    processGovernmentDailyImpactIngest(),
    processParliamentDaily({ slot: berlin.slot, now }),
    processObservatorySourceMonitor(now),
  ]);
  const governmentResult = government.status === "fulfilled" ? government.value : { status: "FAILED", reason: government.reason instanceof Error ? government.reason.message : "Unbekannter Fehler" };
  const parliamentResult = parliament.status === "fulfilled" ? parliament.value : { status: "FAILED", reason: parliament.reason instanceof Error ? parliament.reason.message : "Unbekannter Fehler" };
  const observatoryResult = observatory.status === "fulfilled" ? observatory.value : { status: "FAILED", reason: observatory.reason instanceof Error ? observatory.reason.message : "Unbekannter Fehler" };
  const domains = {
    federal: { status: normalizedDomainStatus(governmentResult), last_run_at: runAt, detail: resultDetail("Bund", governmentResult) },
    parliament: { status: normalizedDomainStatus(parliamentResult), last_run_at: runAt, detail: resultDetail("Parlament", parliamentResult) },
    states: statusForStateAdapters(registry, sourceRegistry),
    eu: statusForEuAdapters(sourceRegistry),
    observatory: { status: normalizedDomainStatus(observatoryResult), last_run_at: runAt, detail: resultDetail("Wirkungsobservatorium", observatoryResult) },
  } satisfies Record<string, DomainHealth>;
  const values = Object.values(domains).map((entry) => entry.status);
  const overallStatus: DomainStatus = values.includes("BLOCKED") ? "BLOCKED" : values.includes("DEGRADED") ? "DEGRADED" : "OK";
  const nextElectionTriggers = registry.jurisdictions
    .filter((entry) => entry.next_election_date)
    .sort((a, b) => String(a.next_election_date).localeCompare(String(b.next_election_date)))
    .map((entry) => ({
      jurisdiction_id: entry.jurisdiction_id,
      name: entry.name,
      date: entry.next_election_date,
      government_lifecycle_state: entry.government_lifecycle_state,
      election_cycle_state: entry.election_cycle_state,
    }));
  const health = {
    schema_version: "1.0",
    run_id: runId,
    generated_at: runAt,
    overall_status: overallStatus,
    domains,
    last_verified_deployment_at: null,
    open_data_issues: 0,
    open_fach_reviews: 0,
    next_election_triggers: nextElectionTriggers,
    next_reality_checks: [],
    observatory: {
      last_observation_sync: runAt,
      last_evidence_review: null,
      last_reality_check_trigger: observatoryResult && typeof observatoryResult === "object" && Number((observatoryResult as { changes_detected?: unknown }).changes_detected ?? 0) > 0 ? runAt : null,
      open_reality_candidates: observatoryResult && typeof observatoryResult === "object" ? Number((observatoryResult as { changes_detected?: unknown }).changes_detected ?? 0) : 0,
      blocked_attributions: 0,
      source_failures: observatoryResult && typeof observatoryResult === "object" && Array.isArray((observatoryResult as { failures?: unknown }).failures) ? (observatoryResult as { failures: unknown[] }).failures.length : 1,
      stale_indicators: 0
    },
  };
  const programmeMonitor = await processStateProgrammeMonitor({ now, date: berlin.date, slot: berlin.slot });
  const stateDeliveries = await writeStateDailyDeliveries({
    jurisdictions: registry.jurisdictions,
    cycles: electionCalendar.cycles as ElectionCycleRegistry["cycles"],
    sources: sourceRegistry.sources,
    date: berlin.date,
    slot: berlin.slot,
    createdAt: runAt,
    programmeDeltas: programmeMonitor.deltas,
    programmeIssues: programmeMonitor.issues,
  });
  await Promise.all([
    uploadDropboxText(`${root}/REGISTRIES/political-jurisdictions.json`, `${JSON.stringify(registry, null, 2)}\n`),
    uploadDropboxText(`${root}/REGISTRIES/source-registry.json`, `${JSON.stringify(sourceRegistry, null, 2)}\n`),
    uploadDropboxText(`${root}/CONTROL/health.json`, `${JSON.stringify(health, null, 2)}\n`),
    uploadDropboxText(`${stateDailyRoot}/CONTROL/health.json`, `${JSON.stringify({ generated_at: runAt, domain: "STATES", ...domains.states }, null, 2)}\n`),
    uploadDropboxText(`${euDailyRoot}/CONTROL/health.json`, `${JSON.stringify({ generated_at: runAt, domain: "EU", ...domains.eu }, null, 2)}\n`),
    uploadDropboxText(`${root}/LEDGERS/AUTOPILOT-RUN-${runId}.json`, `${JSON.stringify({ run_id: runId, run_at: runAt, election_calendar: electionCalendar, government: governmentResult, parliament: parliamentResult, observatory: observatoryResult, programme_monitor: programmeMonitor, state_deliveries: stateDeliveries, daily_digest: { status: "SCHEDULED_SEPARATELY_AT_DAY_END" }, overall_status: overallStatus }, null, 2)}\n`),
  ]);
  return { status: overallStatus, run_id: runId, election_calendar: electionCalendar, domains, government: governmentResult, parliament: parliamentResult, observatory: observatoryResult, programme_monitor: programmeMonitor, state_deliveries: stateDeliveries, daily_digest: { status: "SCHEDULED_SEPARATELY_AT_DAY_END" as const } };
}
