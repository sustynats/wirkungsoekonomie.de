import "server-only";

import staticCycles from "@/data/autopilot/election-cycles.json";
import { downloadDropboxTextIfPresent, uploadDropboxText } from "@/lib/dropbox/app-client";
import { parseOfficialStateElectionDates } from "@/lib/autopilot/election-calendar-core";

const calendarUrl = "https://www.bundeswahlleiterin.de/service/wahltermine.html";
const registryPath = "/WÖK/WOEK-AUTOPILOT/REGISTRIES/election-cycles.json";
type Cycle = (typeof staticCycles.cycles)[number] & { election_cycle_state?: string; programme_analysis_status?: string; coalition_formation_status?: string; new_government_status?: string };
type Registry = { schema_version: string; generated_at: string; cycles: Cycle[] };

function defaultCycle(row: ReturnType<typeof parseOfficialStateElectionDates>[number]): Cycle {
  return {
    election_cycle_id: `${row.jurisdiction_id}-${row.election_type === "Wahl zum Abgeordnetenhaus" ? "agh" : row.election_type === "Bürgerschaftswahl" ? "buergerschaft" : "landtag"}-${row.election_date.slice(0, 4)}`,
    jurisdiction_id: row.jurisdiction_id,
    election_date: row.election_date,
    election_cycle_state: "PRE_ELECTION_WATCH",
    status: "ANNOUNCED",
    official_source_refs: [calendarUrl],
    programme_collection_status: "NOT_STARTED",
    programme_analysis_status: "NOT_STARTED",
    result_status: "NOT_AVAILABLE",
    coalition_formation_status: "NOT_STARTED",
    new_government_status: "NOT_FORMED",
  } as Cycle;
}

export async function processStateElectionCalendar(now = new Date()) {
  const response = await fetch(calendarUrl, { cache: "no-store", headers: { "user-agent": "Institut-fuer-Wirkungsoekonomie-Wahlmonitor/1.0 (+https://parlament.wirkungsoekonomie.de/transparenz)" }, signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`Official election calendar failed (${response.status}).`);
  const detected = parseOfficialStateElectionDates(await response.text());
  if (!detected.length) throw new Error("Official election calendar contained no precisely dated state elections.");
  const remote = await downloadDropboxTextIfPresent(registryPath);
  const registry: Registry = remote ? JSON.parse(remote) as Registry : staticCycles as Registry;
  const byId = new Map(registry.cycles.map((cycle) => [cycle.election_cycle_id, cycle]));
  let created = 0; let changed = 0;
  for (const row of detected) {
    const candidate = defaultCycle(row);
    const prior = [...byId.values()].find((cycle) => cycle.jurisdiction_id === row.jurisdiction_id && cycle.election_date.slice(0, 4) === row.election_date.slice(0, 4));
    if (!prior) { byId.set(candidate.election_cycle_id, candidate); created += 1; continue; }
    if (prior.election_date !== row.election_date) {
      byId.set(prior.election_cycle_id, { ...prior, election_date: row.election_date, official_source_refs: [...new Set([...prior.official_source_refs, calendarUrl])] });
      changed += 1;
    }
  }
  const next: Registry = { schema_version: "1.0", generated_at: now.toISOString(), cycles: [...byId.values()].sort((a, b) => a.election_date.localeCompare(b.election_date)) };
  await uploadDropboxText(registryPath, `${JSON.stringify(next, null, 2)}\n`);
  return { status: "OK" as const, cycles: next.cycles, detected_precise_dates: detected.length, created, changed };
}
