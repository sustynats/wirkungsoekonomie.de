import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { assessEditorialQuality, findGenericEditorialPatterns } from "@/lib/publication/editorial-quality.mjs";

const publicRecords = readFileSync("data/government/impact-cases/public-impact-records.jsonl", "utf8")
  .trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));

test("every published analysis passes all editorial P0 gates", () => {
  for (const record of publicRecords) {
    const result = assessEditorialQuality(record);
    assert.equal(result.status, "PASS", `${record.impact_case_id}: ${result.failed.join(", ")}`);
    assert.deepEqual(result.failed, []);
  }
});

test("generic or placeholder language fails closed", () => {
  const generic = {
    impact_case_id: "test-generic",
    editorial_summary: "Die Maßnahme hat Auswirkungen auf Mensch, Planet und Demokratie. Es gibt Chancen und Herausforderungen.",
    impact_core_summary: "Die Maßnahme kann verschiedene gesellschaftliche Folgen haben.",
    competence_status: "OPEN",
    reality_check_status: "NOT_YET_OBSERVABLE",
    impact_summary: { strongest_positive_potential: "positive Effekte sind möglich", main_risk_or_tradeoff: "Risiken sind ebenfalls möglich" },
    raw_record: { evidence_summary: { fact_evidence: "mittel", mechanism_evidence: "mittel", effect_evidence: "offen", uncertainty: "offen" } },
  };
  const result = assessEditorialQuality(generic);
  assert.equal(result.status, "FAIL");
  assert.equal(result.gates.NO_TEMPLATE_LANGUAGE, false);
});

test("interchangeable summaries trigger review instead of automatic rewriting", () => {
  const flags = findGenericEditorialPatterns([
    { impact_case_id: "a", editorial_summary: "Netzanschluss und Netzkapazität bestimmen den erneuerbaren Zubau und die Investitionssicherheit in regionalen Stromnetzen." },
    { impact_case_id: "b", editorial_summary: "Netzanschluss und Netzkapazität bestimmen den erneuerbaren Zubau und die Investitionssicherheit in regionalen Stromnetzen." },
  ]);
  assert.equal(flags[0]?.code, "GENERIC_EDITORIAL_PATTERN_DETECTED");
});
