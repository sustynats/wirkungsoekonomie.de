import { readFileSync } from "node:fs";
import path from "node:path";
import type { WoeKImpactCase } from "@/lib/government/daily-impact-ingest-core";

export function getApprovedParliamentDailyImpactCases() {
  const filename = path.join(process.cwd(), "data", "generated", "parliament-daily-impact-cases.jsonl");
  return readFileSync(filename, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as WoeKImpactCase);
}

export function getApprovedPoliticalImpactCase(id: string) {
  return getApprovedParliamentDailyImpactCases().find((record) => record.impact_case_id === id) ?? null;
}
