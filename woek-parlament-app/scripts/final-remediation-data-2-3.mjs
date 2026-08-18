#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const generatedAt = process.env.WOEK_REMEDIATION_TIMESTAMP ?? new Date().toISOString();
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const ensure = (dir) => mkdirSync(dir, { recursive: true });
const write = (file, value) => { ensure(path.dirname(file)); writeFileSync(file, typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`); };
const writeJsonl = (file, values) => write(file, values.length ? `${values.map((value) => JSON.stringify(value)).join("\n")}\n` : "");

// States: preserve the static, source-based baseline, but stop representing it
// as an operational 16-state adapter fleet until such adapters exist.
const jurisdictionFile = path.join(root, "data", "political-jurisdictions.json");
const jurisdictionRegistry = JSON.parse(readFileSync(jurisdictionFile, "utf8"));
const states = jurisdictionRegistry.jurisdictions.filter((entry) => entry.jurisdiction_type === "STATE");
for (const state of states) {
  state.monitoring_enabled = false;
  state.source_status = "STATIC_INITIAL_DATASET_NO_OPERATIONAL_ADAPTER";
  state.source_health = "BLOCKED";
  state.operational_adapter_status = "NOT_IMPLEMENTED";
}
write(jurisdictionFile, jurisdictionRegistry);
write(path.join(root, "data", "autopilot", "audit", "2.3-remediated", "STATE-ADAPTER-STATUS.json"), {
  generated_at: generatedAt,
  states_registered: states.length,
  official_operational_adapters: 0,
  states_without_operational_adapter: states.map((entry) => entry.jurisdiction_id),
  publication_claim: "STATIC_INITIAL_DATASET_ONLY",
  operational_monitoring_claim_allowed: false,
  status: states.length === 16 ? "PASS_EXPLICIT_LIMITATION" : "FAIL",
});
const healthFile = path.join(root, "data", "generated", "autopilot-health.json");
const health = JSON.parse(readFileSync(healthFile, "utf8"));
health.generated_at = generatedAt;
health.overall_status = "BLOCKED";
health.domains.states = {
  status: "BLOCKED",
  last_run_at: generatedAt,
  detail: "0 von 16 Länderjurisdiktionen besitzen einen vollständig freigegebenen amtlichen Adapter. Sichtbar ist ausschließlich ein statischer Initialbestand.",
};
health.open_data_issues = Math.max(Number(health.open_data_issues ?? 0), 1);
write(healthFile, health);

// Legacy 28: retain their existing public archive, but exclude them explicitly
// from the 2.3 WÖkImpactCase count until the complete Fach sources are present.
const legacy = JSON.parse(readFileSync(path.join(root, "data", "public-working-acts.json"), "utf8"));
write(path.join(root, "data", "autopilot", "audit", "2.3-remediated", "LEGACY-28-EXCLUSION.json"), {
  generated_at: generatedAt,
  count: legacy.length,
  status: "EXCLUDED_FROM_WOEK_IMPACT_CASE_2_3_UNTIL_FULL_SOURCE",
  reason: "Die vollständigen führenden Legacy-Fachquellen für den 2.3-Source-vs.-View-Nachweis liegen nicht im kanonischen Übergabebestand.",
  routes_remain_historical_archive_only: true,
  cases: legacy.map((entry) => ({ slug: entry.slug, title: entry.plainTitle ?? entry.title })),
});

// Parliament handoff: supersede the incomplete zero-byte delivery with a
// complete fail-closed technical package. Unverified vote counts are zero and
// no vote is published or inferred.
const parliamentDir = path.join(root, "data", "parliament", "daily", "remediated", "2026-08-18-AM");
rmSync(parliamentDir, { recursive: true, force: true });
ensure(parliamentDir);
const emptyJsonl = [
  "PARLIAMENTARY-DELTA.jsonl",
  "UPCOMING-AGENDA.jsonl",
  "VOTE-EVENTS.jsonl",
  "INDIVIDUAL-VOTES.jsonl",
  "SOURCE-MANIFEST.jsonl",
  "RELATIONSHIP-DELTA.jsonl",
];
for (const name of emptyJsonl) write(path.join(parliamentDir, name), "");
write(path.join(parliamentDir, "OPEN-DATA-ISSUES.csv"), "issue_id,severity,status,description\nPARL-2026-08-18-AM-01,P0,EXCLUDED,Previous delivery was incomplete and contained no verifiable vote payload; all claimed vote counts are superseded by zero until official files exist.\n");
write(path.join(parliamentDir, "INGESTION-REPORT.md"), `# Parliament Daily 2026-08-18 AM - remediated\n\nStatus: COMPLETE_FAIL_CLOSED_DELIVERY\n\nDie frühere Übergabe war unvollständig und bestand lokal aus leeren Dateien. Sie wird nicht als valide Datenlieferung verwendet. Dieses vollständige Ersatzpaket publiziert keine unbestätigten Vorgänge oder Stimmen. VoteEvents = 0, IndividualVotes = 0. Keine Einzelstimme wurde aus Fraktionsverhalten rekonstruiert.\n`);
const payloadNames = [...emptyJsonl, "OPEN-DATA-ISSUES.csv", "INGESTION-REPORT.md"];
const files = Object.fromEntries(payloadNames.map((name) => [name, {
  sha256: sha256(readFileSync(path.join(parliamentDir, name))),
  bytes: readFileSync(path.join(parliamentDir, name)).length,
}]));
const manifest = {
  delivery_id: "PARLIAMENT-2026-08-18-AM-REMEDIATED",
  delivery_slot: "AM",
  created_at: generatedAt,
  supersedes_delivery: "2026-08-18-AM-INCOMPLETE",
  source_cursor_before: null,
  source_cursor_after: null,
  files,
  counts: { new_cases: 0, updated_cases: 0, upcoming_items: 0, vote_events: 0, individual_votes: 0, source_changes: 0, open_data_issues: 1 },
  package_sha256: sha256(JSON.stringify(files)),
  publication_status: "NO_PUBLIC_DATA_FROM_THIS_DELIVERY",
};
write(path.join(parliamentDir, "MANIFEST.json"), manifest);
// READY is intentionally the final file written.
write(path.join(parliamentDir, "READY.json"), {
  delivery_id: manifest.delivery_id,
  manifest_sha256: sha256(readFileSync(path.join(parliamentDir, "MANIFEST.json"))),
  ready_at: generatedAt,
  validation: "PASS_COMPLETE_FAIL_CLOSED_PACKAGE",
});

// Observatory: make the complete source -> observation -> outcome series ->
// EvidenceEvent -> RealityCheckCandidate chain machine-readable.
const observation = {
  observation_id: "OBS-DE-RHEIN-KAUB-2026-08-18-0700-R1",
  indicator_id: "PEGEL-KAUB-WASSERSTAND-CM",
  definition: "Amtlich veröffentlichter Wasserstand am Richtpegel Kaub; nicht mit Fahrwassertiefe gleichzusetzen.",
  unit: "cm",
  geography: "Deutschland / Rhein / Kaub",
  observation_period: "2026-08-18T07:00:00+02:00",
  observation_date: "2026-08-18",
  publication_date: "2026-08-18",
  value: 12,
  previous_value: null,
  baseline: 25,
  reference: "ELWIS-Stammdaten: NNW 25 cm am 22.10.2018; neue Rekordklassifikation bleibt bis amtlicher Validierung vorläufig.",
  source_ref: "https://www.pegelonline.wsv.de/gast/pegelinformationen?gewaesser=RHEIN&pegel=KAUB",
  source_function: "OUTCOME_DATA",
  data_quality: "HIGH",
  revision_status: "PROVISIONAL",
  revision: 1,
  valid_from: generatedAt,
  supersedes_observation_id: null,
};
writeJsonl(path.join(root, "data", "observatory", "public", "state-observations.jsonl"), [observation]);
const evidenceFile = path.join(root, "data", "observatory", "public", "evidence-events.jsonl");
const evidenceEvents = readFileSync(evidenceFile, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
for (const event of evidenceEvents) {
  if (event.evidence_event_id === "EVID-DE-RHEIN-KAUB-LOWWATER-2026-08-18-0700") event.state_observation_ids = [observation.observation_id];
}
writeJsonl(evidenceFile, evidenceEvents);
writeJsonl(path.join(root, "data", "observatory", "public", "outcome-series.jsonl"), [{
  outcome_series_id: "SERIES-DE-RHEIN-KAUB-WASSERSTAND",
  indicator_id: observation.indicator_id,
  definition: observation.definition,
  unit: observation.unit,
  geography: observation.geography,
  source_refs: [observation.source_ref],
  observation_ids: [observation.observation_id],
  status: "ACTIVE",
}]);
writeJsonl(path.join(root, "data", "observatory", "public", "external-shocks.jsonl"), [{
  external_shock_id: "SHOCK-DE-RHEIN-LOW-WATER-2026-08-18",
  shock_type: "LOW_WATER",
  title: "Außergewöhnliches Niedrigwasser am Rheinpegel Kaub",
  observation_date: "2026-08-18",
  geography: ["Deutschland", "Rhein", "Kaub"],
  source_refs: [observation.source_ref],
  attribution_status: "EXTERNAL_CONTEXT",
  object_type: "EXTERNAL_SHOCK",
}]);

console.log(JSON.stringify({ generated_at: generatedAt, states: states.length, legacy_excluded: legacy.length, parliament_delivery: manifest.delivery_id, observation: observation.observation_id }, null, 2));
