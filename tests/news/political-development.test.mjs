import test from "node:test";
import assert from "node:assert/strict";
import { politicalDevelopmentFor, materialDevelopmentReview } from "../../scripts/news/political-development.mjs";
import { classifyItem, clusterItems } from "../../scripts/news/lib.mjs";
import { queuePriority } from "../../scripts/news/run.mjs";

const now = "2026-09-05T21:45:00Z";
const item = { title: "Kurz vor der Wahl: Spitzenkandidat lässt Kandidatur bei knapper Mehrheit offen", summary: "Die Entscheidung zur Wahl des Ministerpräsidenten soll erst nach der Wahl fallen.", published_at: "2026-09-05T06:23:00Z", url: "https://example.org/a", source_id: "test", content_hash: "a" };

test("candidacy uncertainty is a time-sensitive review signal, not a fact verdict", () => {
  assert.ok(politicalDevelopmentFor(item, now).signals.includes("candidacy_open"));
  assert.equal(politicalDevelopmentFor(item, now).time_sensitive, true);
  assert.ok(classifyItem(item, {}, now).score >= 48);
});
test("identical method across parties and publishers", () => {
  const scores = ["CDU", "AfD", "SPD", "Grüne", "Linke", "FDP", "BSW"].map(party => classifyItem({ ...item, title: `${party}: ${item.title}`, publisher: party }, {}, now).score);
  assert.equal(new Set(scores).size, 1);
});
test("no fresh urgency from old, undated or future articles", () => {
  for (const published_at of ["2026-09-02T06:23:00Z", undefined, "2026-09-07T06:23:00Z"]) assert.equal(politicalDevelopmentFor({ ...item, published_at }, now).time_sensitive, false);
});
test("routine campaign, sport and retrospective commentary are not breaking signals", () => {
  for (const title of ["Kurz vor der Wahl: Spitzenkandidat besucht Marktplatz", "Sport: Kandidatur zum Vereinspräsidenten offen", "Rückblick: Spitzenkandidat lässt Kandidatur vor der Wahl offen"]) assert.equal(politicalDevelopmentFor({ ...item, title, summary: "" }, now).signals.length, 0);
});
test("new or changed source in known event gets material-update review; unchanged input does not", () => {
  assert.equal(materialDevelopmentReview([item], [item], now).required, false);
  assert.equal(materialDevelopmentReview([item], [], now).required, true);
  const old = { ...item, title: "Spitzenkandidat will Ministerpräsident werden", summary: "Er strebt eine Regierung an.", content_hash: "old" };
  assert.equal(materialDevelopmentReview([item], [old], now).required, true);
  const story = { story_id: "existing", title: old.title, sources: [old], published: true, last_updated: now, first_seen: now };
  const clusters = clusterItems([item], [story], now);
  assert.equal(clusters[0].story_id, "existing");
  assert.equal(clusters[0].sources[0].content_hash, "a");
});
test("withdrawal, coalition change and election result receive same generic review", () => {
  for (const title of ["Vor Landtagswahl: Kandidatin zieht Kandidatur zurück", "Partei ändert Koalitionsaussage vor Wahl", "Wahlergebnis: Koalition verliert Mehrheit"]) assert.ok(politicalDevelopmentFor({ ...item, title, summary: "" }, now).signals.length);
});
test("later readiness statement receives review instead of preserving an older open answer", () => {
  const newer = { ...item, title: "Kurz vor der Wahl: Kandidatin will auch bei knapper Mehrheit regieren", summary: "Die Ministerpräsidenten-Kandidatin erklärt ihre Bereitschaft.", content_hash: "later-readiness", published_at: "2026-09-05T16:24:00Z" };
  assert.ok(politicalDevelopmentFor(newer, now).signals.includes("government_commitment"));
  assert.equal(materialDevelopmentReview([newer], [item], now).time_sensitive, true);
  assert.ok(classifyItem(newer, {}, now).score >= 48);
});
test("urgent review raises queue priority without changing evidence or publication gate", () => {
  const candidate = { preanalysis: { internal_relevance_score: 60 }, fresh: true };
  const urgent = { ...candidate, preanalysis: { ...candidate.preanalysis, material_development_review: { time_sensitive: true } } };
  assert.equal(queuePriority(urgent, now) - queuePriority(candidate, now), 72);
  assert.equal(candidate.preanalysis.internal_relevance_score, 60);
});
