import assert from "node:assert/strict";
import test from "node:test";
import { applyOfficialResultPage, officialResultPageMatches, type StateElectionCycle, type StateElectionResultSource } from "@/lib/autopilot/state-election-results-core";

const cycle: StateElectionCycle = {
  election_cycle_id: "DE-BE-AGH-2026",
  jurisdiction_id: "DE-BE",
  election_date: "2026-09-20",
  election_cycle_state: "PROGRAMME_ANALYSIS",
  status: "PROGRAMMES_COLLECTING",
  official_source_refs: ["https://www.berlin.de/wahlen/"],
  programme_collection_status: "IN_PROGRESS",
  programme_analysis_status: "IN_REVIEW",
  result_status: "NOT_AVAILABLE",
  coalition_formation_status: "NOT_STARTED",
  new_government_status: "NOT_FORMED",
};

const source: StateElectionResultSource = {
  election_cycle_id: cycle.election_cycle_id,
  jurisdiction_id: cycle.jurisdiction_id,
  election_date: cycle.election_date,
  result_status: "PRELIMINARY",
  source_url: "https://www.berlin.de/wahlen/pressemitteilungen/2026/example.php",
  allowed_host: "www.berlin.de",
  required_markers: ["Vorläufiges Ergebnis festgestellt", "Zweitstimmenergebnis"],
};

test("official result markers advance a completed election without claiming a final result", () => {
  const result = applyOfficialResultPage({
    cycle,
    source,
    html: "<h1>Vorläufiges Ergebnis festgestellt</h1><p>Das Zweitstimmenergebnis liegt vor.</p>",
    today: "2026-09-23",
  });
  assert.equal(result.changed, true);
  assert.equal(result.cycle.status, "ELECTION_COMPLETE");
  assert.equal(result.cycle.election_cycle_state, "ELECTION_RESULT");
  assert.equal(result.cycle.result_status, "PRELIMINARY");
  assert.ok(result.cycle.official_source_refs.includes(source.source_url));
});

test("result transitions fail closed before election day or when a marker is absent", () => {
  assert.equal(applyOfficialResultPage({ cycle, source, html: "Vorläufiges Ergebnis festgestellt Zweitstimmenergebnis", today: "2026-09-19" }).changed, false);
  assert.equal(applyOfficialResultPage({ cycle, source, html: "Vorläufiges Ergebnis festgestellt", today: "2026-09-23" }).changed, false);
});

test("result sources must use the configured HTTPS host", () => {
  assert.equal(officialResultPageMatches({ ...source, source_url: "https://example.org/result", allowed_host: "www.berlin.de" }, "Vorläufiges Ergebnis festgestellt Zweitstimmenergebnis"), false);
});
