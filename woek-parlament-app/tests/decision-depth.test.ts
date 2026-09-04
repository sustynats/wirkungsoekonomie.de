import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { listPublishedCases } from "@/lib/cases";
import { decisionViews, resolveDecisionView, decisionReaderTitles, decisionReaderParagraphs, projectChain, questionCoverage, verifiedProcedureSteps } from "@/lib/presentation/decision-depth";

test("five canonical depths retain every old view alias without changing the decision route", () => {
  assert.deepEqual(decisionViews.map(view => view.label), ["Sachverhalt", "Wirkungsanalyse", "Evidenz & Grenzen", "Quellen", "Verlauf"]);
  for (const alias of ["wirkprofil", "wirkpfade", "normen"]) assert.equal(resolveDecisionView(alias), "wirkungsanalyse");
  for (const alias of ["berechnungen", "fachakte"]) assert.equal(resolveDecisionView(alias), "evidenz");
  assert.equal(resolveDecisionView("ueberblick"), "sachverhalt");
  assert.equal(resolveDecisionView("quellen"), "quellen");
  assert.equal(resolveDecisionView("invalid"), "sachverhalt");
  const source = readFileSync("app/entscheidungen/[slug]/page.tsx", "utf8");
  for (const view of decisionViews) assert.ok(source.includes(`data-decision-panel="${view.id}"`));
  assert.match(source, /<details id="decision-transparency"[^>]*open=\{ansicht === "fachakte"\}/);
  assert.match(source, /<CompletePublicationSource source=\{completePublication\} idPrefix="vollstaendige-fachakte"/);
});

test("reader modes use exact pre-existing editorial titles and cannot mutate Fach", () => {
  for (const item of listPublishedCases()) {
    const before = JSON.stringify(item);
    assert.deepEqual(decisionReaderTitles(item), { verstaendlich: item.plainTitle, fachlich: item.title });
    const paragraphs = decisionReaderParagraphs(item);
    if (paragraphs) {
      assert.equal(paragraphs.verstaendlich, item.publicWorkingAct?.editorialSummary?.keyStatement);
      assert.ok([item.publicWorkingAct?.overallPotential, item.publicWorkingAct?.editorialSummary?.keyStatement].includes(paragraphs.fachlich));
    }
    assert.equal(JSON.stringify(item), before);
  }
  const source = readFileSync("app/components/DecisionReader.tsx", "utf8");
  assert.match(source, /woek\.decision-reader\.v1/);
  assert.match(source, /aria-pressed/);
  assert.doesNotMatch(source, /fetch\(|@\/data\//);
  assert.equal(decisionReaderParagraphs({}), null);
});

test("stage evidence cannot be inferred from progress, chronology, score or a source count", () => {
  const stages = projectChain();
  assert.equal(stages.length, 4);
  assert.ok(stages.every(stage => stage.record === null));
  const record = { stage: "Umsetzung" as const, statement: "Exakter belegter Vollzug", sourceHref: "/pruefstandard/quellen/test", evidenceLabel: "Amtlicher Beleg" };
  assert.equal(projectChain([record])[1].record, record);
  assert.equal(projectChain([{ ...record, sourceHref: "" }])[1].record, null);
  assert.ok(projectChain([record]).filter(stage => stage.stage !== "Umsetzung").every(stage => stage.record === null));
  assert.doesNotMatch(readFileSync("lib/presentation/decision-depth.ts", "utf8"), /\.party|\.partei|\.score|\.parliamentaryStatus|\.lastUpdated/);
});

test("question and procedure metrics fail closed when explicit answer/source/date fields are missing", () => {
  assert.equal(questionCoverage(), null);
  assert.equal(questionCoverage([]), null);
  assert.equal(questionCoverage([{ id: "Q1", question: "Frage?", status: "ANSWERED", sourceHref: null }]), null);
  const unanswered = { id: "Q1", question: "Frage?", status: "OPEN" as const, sourceHref: null };
  assert.deepEqual(questionCoverage([unanswered]), { answered: 0, total: 1 });
  assert.equal(questionCoverage([unanswered, unanswered]), null);
  assert.equal(verifiedProcedureSteps(), null);
  assert.equal(verifiedProcedureSteps([{ id: "S1", label: "Beschluss", date: "2026-09-01", officialSourceHref: null }]), null);
  const future = [{ id: "S1", label: "Beratung", date: null, officialSourceHref: null }];
  assert.deepEqual(verifiedProcedureSteps(future), future);
});

test("all current SDG codes are represented exactly; unmapped is not asserted to mean unaffected", () => {
  const possible = new Set(Array.from({ length: 17 }, (_, index) => `SDG ${index + 1}`));
  for (const item of listPublishedCases()) for (const reference of (item.publicAssessment?.normativeMapping ?? item.publicWorkingAct?.normativeMapping)?.sdgItems ?? []) {
    assert.ok(possible.has(reference.code), `unrepresented canonical reference ${reference.code}`);
  }
  const source = readFileSync("app/components/DecisionEvidenceVisuals.tsx", "utf8");
  assert.match(source, /Nicht zugeordnet/);
  assert.match(source, /Rechtsbezüge – eigene Ebene/);
  assert.doesNotMatch(source, /unberührt|nicht betroffen/);
});
