import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { listPublishedCases, formatDate, materialityLabel } from "@/lib/cases";
import { caseKindLabel, humanizeSystemValue } from "@/lib/presentation/labels";
import { parliamentaryOverviewAssessment } from "@/lib/presentation/overview-assessment";
import { factOnlyPublicMaturity, parliamentPublicMaturity } from "@/lib/presentation/public-maturity";
import { directionSymbols, effectPhases, findingExcerpt, projectImpactSignature } from "@/lib/presentation/impact-signature";

test("signature uses three orthogonal axes; no invented four-level evidence mapping", () => {
  const empty = factOnlyPublicMaturity("Testakte");
  for (const primary of ["FULL_ANALYSIS", "PARTIAL_EVIDENCE", "ATTRIBUTION_OPEN", "FACT_ONLY"] as const) {
    const signature = projectImpactSignature(null, { ...empty, primary });
    assert.equal(signature.evidence.grade, null);
    assert.equal(signature.maturity.phase, null);
    assert.equal(signature.direction.kind, "open");
  }
  assert.equal(effectPhases.length, 4);
  const model = readFileSync("lib/presentation/impact-signature.ts", "utf8");
  assert.doesNotMatch(model, /party|partei|score\s*[:=]|sentiment/i);
});

test("every published card/row stays <= 60 words; full canonical findings remain unchanged", () => {
  const words = (value: string) => [...new Intl.Segmenter("de", { granularity: "word" }).segment(value)].filter((item) => item.isWordLike).length;
  for (const item of listPublishedCases()) {
    const original = JSON.stringify(item);
    const assessment = parliamentaryOverviewAssessment(item);
    const signature = projectImpactSignature(assessment, parliamentPublicMaturity(item, assessment));
    const excerpt = assessment ? findingExcerpt(assessment.keyFinding) : "Faktenakte – WÖk-Einordnung offen.";
    assert.ok(Array.from(excerpt).length <= 140);
    if (assessment) assert.ok(assessment.keyFinding.startsWith(excerpt.replace(/…$/, "")));
    const visible = [caseKindLabel(item.kind), materialityLabel(item.materiality), item.plainTitle,
      assessment ? "Auszug" : "", excerpt, "Wirkungsrichtung", signature.direction.label,
      "Evidenz", signature.evidence.label, "Reifegrad", signature.maturity.label,
      humanizeSystemValue(item.parliamentaryStatus), "Aktualisiert", formatDate(item.lastUpdated), "Akte öffnen"].join(" ");
    assert.ok(words(visible) <= 60, `${item.slug}: ${words(visible)} words`);
    assert.equal(JSON.stringify(item), original);
  }
});

test("ambivalence is split; every direction has a visible word and symbol, never color alone", () => {
  assert.equal(directionSymbols.ambivalent, "↙↗");
  for (const symbol of Object.values(directionSymbols)) assert.ok(symbol.trim());
  const source = readFileSync("app/components/ImpactSignature.tsx", "utf8");
  for (const label of ["Wirkungsrichtung", "Evidenz", "Reifegrad"]) assert.ok(source.includes(`<dt>${label}</dt>`));
  assert.match(source, /\["left", "right"\]/);
  assert.match(source, /<span>\{direction.label\}<\/span>/);
  assert.doesNotMatch(source, /\btitle=/);
  assert.match(readFileSync("app/components/CaseRegisterRow.tsx", "utf8"), /variant="row"/);
});

test("short excerpts preserve Unicode characters and are explicitly excerpts, not rewritten findings", () => {
  assert.equal(findingExcerpt("Kurz."), "Kurz.");
  const text = "Maßnahme 🧭 unter ausdrücklich benannten Bedingungen und offenen Fragen.";
  const excerpt = findingExcerpt(text, 30);
  assert.ok(Array.from(excerpt).length <= 30);
  assert.ok(text.startsWith(excerpt.replace(/…$/, "")));
  assert.match(readFileSync("app/components/CaseCard.tsx", "utf8"), /Auszug:/);
});
