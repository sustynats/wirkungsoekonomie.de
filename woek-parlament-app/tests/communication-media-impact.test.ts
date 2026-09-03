import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { getAllCommunicationMediaImpactRecords, getCommunicationMediaImpact } from "../lib/state-programmes/communication-media-impact";

const records = getAllCommunicationMediaImpactRecords();

test("all six approved Sachsen-Anhalt communication reviews are present and source-bound", () => {
  assert.equal(records.length, 6);
  assert.equal(new Set(records.map((record) => record.communication_review_id)).size, 6);
  assert.equal(new Set(records.map((record) => record.programme_source_key)).size, 6);
  for (const record of records) {
    assert.equal(getCommunicationMediaImpact(record.programme_source_key)?.communication_review_id, record.communication_review_id);
    assert.equal(record.patterns.length, 5);
    assert.ok(record.overview_assessment_label.length > 20);
    assert.ok(record.public_summary.length > 100);
    assert.ok(record.positive_potentials.length > 0);
    assert.ok(record.material_risks.length > 0);
    assert.ok(record.open_points.length > 0);
    const sources = new Set(record.source_refs.map((source) => new URL(source.url).toString()));
    for (const pattern of record.patterns) {
      assert.ok(sources.has(new URL(pattern.source_url).toString()), `${pattern.pattern_id} source must have an intermediary record`);
      assert.ok(pattern.first_order && pattern.second_order && pattern.third_order);
      assert.ok(pattern.falsification_recheck_trigger);
    }
  }
});

test("communication impact stays a separate, non-scoring, non-heuristic public axis", () => {
  const component = readFileSync(path.join(process.cwd(), "app/components/SaxonyAnhaltProgrammeAnalysisV3.tsx"), "utf8");
  assert.match(component, /data-woek-analysis-layer="COMMUNICATION_MEDIA_IMPACT"/);
  assert.match(component, /Zwei getrennte Achsen/);
  assert.match(component, /weder mit der Maßnahmenanalyse noch mit einer Parteigesamtnote verrechnet/);
  assert.doesNotMatch(component, /pattern\.frame_or_pattern/);
  assert.doesNotMatch(component, /record\.fach_status/);
  assert.doesNotMatch(component, /record\.assessment_icon_kind/);
});

test("restore-first audit documents history and fach gaps without invented assessments", () => {
  const audit = JSON.parse(readFileSync(path.join(process.cwd(), "data/state-programmes/communication-media-impact/restore-first-audit-20260820.json"), "utf8"));
  assert.equal(audit.invariants.restore_first_completed, true);
  assert.equal(audit.invariants.no_codex_generated_fach_assessment, true);
  assert.ok(audit.objects.some((item: { object_id: string; classification_before: string }) => item.object_id === "ltw-2026-st-afd" && item.classification_before === "HISTORICAL_APPROVED_RESTORE_REQUIRED"));
  assert.ok(audit.objects.some((item: { object_id: string; classification_after: string }) => item.object_id === "other-state-programmes" && item.classification_after === "GENUINELY_NOT_YET_ANALYSED"));
});
