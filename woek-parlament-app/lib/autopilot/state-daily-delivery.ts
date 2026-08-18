import "server-only";

import { createHash } from "node:crypto";
import { downloadDropboxTextIfPresent, uploadDropboxText } from "@/lib/dropbox/app-client";

type StateJurisdiction = {
  jurisdiction_id: string;
  jurisdiction_type: "FEDERAL" | "STATE" | "EU";
  name: string;
  government_lifecycle_state: string;
  election_cycle_state: string;
  active_government_term_id: string;
  active_election_cycle_id?: string | null;
  next_election_date: string | null;
  source_status: string;
  source_health: string;
  monitoring_enabled: boolean;
};

type ElectionCycle = {
  election_cycle_id: string;
  jurisdiction_id: string;
  election_date: string;
  election_cycle_state?: string;
  status: string;
  official_source_refs: string[];
  programme_collection_status: string;
  programme_analysis_status?: string;
  result_status: string;
  coalition_formation_status?: string;
  new_government_status?: string;
};

type StateSource = {
  source_id: string;
  jurisdiction_id: string;
  institutional_role: string;
  name: string;
  base_url: string;
  access_type: string;
  adapter_status: string;
};

const deliveryRoot = "/WÖK/WOEK-LAENDER-DAILY/DELIVERIES";

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function jsonl(records: unknown[]) {
  return records.length ? `${records.map((record) => JSON.stringify(record)).join("\n")}\n` : "";
}

function issueCsv(jurisdiction: StateJurisdiction, sources: StateSource[], programmeIssues: Array<Record<string, unknown>>) {
  const active = sources.filter((source) => source.adapter_status === "ACTIVE");
  const rows = ["issue_id,jurisdiction_id,severity,code,detail,review_status"];
  if (active.length === 0) rows.push([
    `STATE-SOURCE-${jurisdiction.jurisdiction_id}`,
    jurisdiction.jurisdiction_id,
    "P0",
    "SOURCE_ADAPTER_NOT_AUTOMATED",
    `Für ${jurisdiction.name} ist noch kein eigenständiger amtlicher Regierungsadapter freigegeben. Der Lauf enthält deshalb keine behauptete Regierungsabdeckung.`,
    "MANUAL_EXCEPTION_REQUIRED",
  ].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","));
  for (const issue of programmeIssues) rows.push([
    `PROGRAMME-${String(issue.programme_source_id ?? "UNKNOWN")}`,
    jurisdiction.jurisdiction_id,
    "P0",
    String(issue.code ?? "PROGRAMME_SOURCE_ISSUE"),
    String(issue.detail ?? "Programmquelle konnte nicht vollständig verarbeitet werden."),
    "MANUAL_EXCEPTION_REQUIRED",
  ].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","));
  return `${rows.join("\n")}\n`;
}

function publicRunReport(jurisdiction: StateJurisdiction, sources: StateSource[], cycle: ElectionCycle | null, createdAt: string) {
  const active = sources.filter((source) => source.adapter_status === "ACTIVE");
  return `# WÖk-Länder-Delivery ${jurisdiction.jurisdiction_id}\n\n` +
    `- Erzeugt: ${createdAt}\n` +
    `- Land: ${jurisdiction.name}\n` +
    `- Regierungslebenszyklus: ${jurisdiction.government_lifecycle_state}\n` +
    `- Wahlzyklus: ${jurisdiction.election_cycle_state}\n` +
    `- Aktiver Wahlgegenstand: ${cycle?.election_cycle_id ?? "keiner"}\n` +
    `- Produktive amtliche Adapter: ${active.length} von ${sources.length}\n\n` +
    `## Abdeckungsgrenze\n\n` +
    (active.length > 0
      ? "Der Lauf enthält ausschließlich neue oder geänderte Datensätze, die über freigegebene Adapter ermittelt wurden. Leere Delta-Dateien bedeuten: in diesem Lauf kein verifizierter Delta-Datensatz.\n"
      : "Für dieses Land ist noch kein eigenständiger amtlicher Regierungsadapter produktiv freigegeben. Leere Delta-Dateien bedeuten deshalb ausdrücklich nicht, dass es keine Regierungshandlungen gab. Der Quellenstand bleibt DEGRADED und wird als offener Datenpunkt übergeben.\n") +
    `\nCodeX erzeugt in dieser Lieferung keine Wirkungsrichtung, keinen Partei- oder Personenscore und keine fachliche Kompetenz- oder Rechtsbewertung.\n`;
}

function stableFiles(jurisdiction: StateJurisdiction, sources: StateSource[], cycle: ElectionCycle | null, createdAt: string, programmeDeltas: Array<Record<string, unknown>>, programmeIssues: Array<Record<string, unknown>>) {
  const electionDelta = cycle ? [{
    change_type: "CURRENT_STATE",
    jurisdiction_id: jurisdiction.jurisdiction_id,
    election_cycle_id: cycle.election_cycle_id,
    election_date: cycle.election_date,
    election_cycle_state: cycle.election_cycle_state ?? jurisdiction.election_cycle_state,
    status: cycle.status,
    programme_collection_status: cycle.programme_collection_status,
    programme_analysis_status: cycle.programme_analysis_status ?? "OPEN",
    result_status: cycle.result_status,
    official_source_refs: cycle.official_source_refs,
  }] : [];
  const sourceManifest = sources.map((source) => ({ ...source, checked_at: createdAt, source_function: source.institutional_role }));
  return {
    "STATE-GOVERNMENT-DELTA.jsonl": "",
    "STATE-PARLIAMENT-DELTA.jsonl": "",
    "ELECTION-DELTA.jsonl": jsonl(electionDelta),
    "PROGRAMME-DELTA.jsonl": jsonl(programmeDeltas),
    "MANDATE-DELTA.jsonl": "",
    "LEGAL-ACTS.jsonl": "",
    "FEDERAL-COUNCIL-POSITIONS.jsonl": "",
    "IMPLEMENTATION-DELTA.jsonl": "",
    "SOURCE-MANIFEST.jsonl": jsonl(sourceManifest),
    "OPEN-DATA-ISSUES.csv": issueCsv(jurisdiction, sources, programmeIssues),
    "INGESTION-REPORT.md": publicRunReport(jurisdiction, sources, cycle, createdAt),
  };
}

async function writeOneStateDelivery(args: {
  jurisdiction: StateJurisdiction;
  cycle: ElectionCycle | null;
  sources: StateSource[];
  date: string;
  slot: "AM" | "PM";
  createdAt: string;
  programmeDeltas: Array<Record<string, unknown>>;
  programmeIssues: Array<Record<string, unknown>>;
}) {
  const { jurisdiction, cycle, sources, date, slot, createdAt, programmeDeltas, programmeIssues } = args;
  const folder = `${deliveryRoot}/${jurisdiction.jurisdiction_id}/${date}-${slot}`;
  const files = stableFiles(jurisdiction, sources, cycle, createdAt, programmeDeltas, programmeIssues);
  const fileEntries = Object.entries(files).map(([name, content]) => ({ name, sha256: sha256(content), bytes: Buffer.byteLength(content) }));
  const packageSha256 = sha256(fileEntries.map((file) => `${file.name}:${file.sha256}`).join("\n"));
  const existingReady = await downloadDropboxTextIfPresent(`${folder}/READY.json`);
  if (existingReady) {
    const parsed = JSON.parse(existingReady) as { package_sha256?: string };
    if (parsed.package_sha256 !== packageSha256) throw new Error(`CONTENT_CHANGED_AFTER_HANDOFF: ${folder}`);
    return { jurisdiction_id: jurisdiction.jurisdiction_id, status: "ALREADY_WRITTEN" as const, package_sha256: packageSha256 };
  }
  for (const [name, content] of Object.entries(files)) await uploadDropboxText(`${folder}/${name}`, content);
  const manifest = {
    schema_version: "2.0",
    delivery_id: `STATE-${jurisdiction.jurisdiction_id}-${date}-${slot}`,
    jurisdiction_id: jurisdiction.jurisdiction_id,
    delivery_slot: slot,
    created_at: createdAt,
    source_cursor_before: null,
    source_cursor_after: createdAt,
    coverage_status: sources.some((source) => source.adapter_status === "ACTIVE") ? "DEFINED_SOURCE_SCOPE" : "BEST_EFFORT_DEFINED_SOURCE_SCOPE",
    files: fileEntries,
    counts: {
      state_government_delta: 0,
      state_parliament_delta: 0,
      election_delta: cycle ? 1 : 0,
      programme_delta: programmeDeltas.length,
      mandate_delta: 0,
      legal_acts: 0,
      federal_council_positions: 0,
      implementation_delta: 0,
      open_data_issues: (sources.some((source) => source.adapter_status === "ACTIVE") ? 0 : 1) + programmeIssues.length,
    },
    package_sha256: packageSha256,
  };
  const manifestContent = `${JSON.stringify(manifest, null, 2)}\n`;
  await uploadDropboxText(`${folder}/MANIFEST.json`, manifestContent);
  await uploadDropboxText(`${folder}/READY.json`, `${JSON.stringify({
    delivery_id: manifest.delivery_id,
    ready_at: createdAt,
    manifest_sha256: sha256(manifestContent),
    package_sha256: packageSha256,
    fach_analysis_created: false,
  }, null, 2)}\n`);
  return { jurisdiction_id: jurisdiction.jurisdiction_id, status: "WRITTEN" as const, package_sha256: packageSha256 };
}

export async function writeStateDailyDeliveries(args: {
  jurisdictions: StateJurisdiction[];
  cycles: ElectionCycle[];
  sources: StateSource[];
  date: string;
  slot: "AM" | "PM";
  createdAt: string;
  programmeDeltas: Array<Record<string, unknown>>;
  programmeIssues: Array<Record<string, unknown>>;
}) {
  const results = [];
  for (const jurisdiction of args.jurisdictions.filter((entry) => entry.jurisdiction_type === "STATE" && entry.monitoring_enabled)) {
    const cycle = args.cycles.find((entry) => entry.jurisdiction_id === jurisdiction.jurisdiction_id) ?? null;
    const sources = args.sources.filter((entry) => entry.jurisdiction_id === jurisdiction.jurisdiction_id || entry.jurisdiction_id === "DE-ALL-STATES");
    const programmeDeltas = args.programmeDeltas.filter((entry) => entry.jurisdiction_id === jurisdiction.jurisdiction_id);
    const programmeIssues = args.programmeIssues.filter((entry) => entry.jurisdiction_id === jurisdiction.jurisdiction_id);
    results.push(await writeOneStateDelivery({ ...args, jurisdiction, cycle, sources, programmeDeltas, programmeIssues }));
  }
  return results;
}
