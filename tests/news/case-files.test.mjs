import test from "node:test";
import assert from "node:assert/strict";
import { buildCaseFiles } from "../../scripts/news/case-files.mjs";
import { renderCaseFile } from "../../scripts/news/build.mjs";

const at = "2026-09-04T12:00:00Z";
const story = (id, title, summary, more = {}) => ({
  story_id: id, slug: id, title, source_summary: summary, topic: ["Energie"],
  published: true, listed: true, first_seen: more.first_seen || at,
  published_at: more.published_at || at, last_updated: more.last_updated || at,
  sources: [{ publisher: more.publisher || id, url: `https://example.org/${id}`, published_at: at }],
  analysis: { summary: `Kurzstand ${id}` }, ...more,
});

const caseStories = () => [
  story("one", "Sabotage an Umspannwerk in Jänschwalde", "Ein Bekennerschreiben nennt den Angriff auf das Stromnetz in Jänschwalde."),
  story("two", "Sabotage an Umspannwerken: Fahndung nach Verdächtigem", "Die Fahndung betrifft Bekennerschreiben zu Angriffen auf das Stromnetz und das Umspannwerk Jänschwalde.", { last_updated: "2026-09-04T13:00:00Z" }),
  story("three", "Umspannwerk-Sabotage: SEK sucht Verdächtigen", "Der SEK-Einsatz gehört zur Fahndung wegen der Bekennerschreiben und Angriffe auf Umspannwerke.", { last_updated: "2026-09-04T14:00:00Z" }),
];

test("a third securely connected development creates one retrospective case without mutating stories", () => {
  const stories = caseStories(), before = structuredClone(stories);
  assert.equal(buildCaseFiles(stories.slice(0, 2)).cases.length, 0);
  const grouped = buildCaseFiles(stories);
  assert.equal(grouped.cases.length, 1);
  assert.equal(grouped.cases[0].member_count, 3);
  assert.equal(grouped.visibleStories.length, 1);
  assert.equal(grouped.visibleStories[0].story_id, "three");
  assert.deepEqual(stories, before);
});

test("the newest material development represents the case and moves it to the top", () => {
  const unrelated = story("other", "Neue Windenergie-Ausschreibung veröffentlicht", "Die Ausschreibung betrifft Windparks auf See.", { last_updated: "2026-09-04T13:30:00Z" });
  const grouped = buildCaseFiles([...caseStories(), unrelated]);
  assert.deepEqual(grouped.visibleStories.map(item => item.story_id), ["three", "other"]);
  assert.equal(grouped.caseByStory.get("one").representative_id, "three");
});

test("shared broad words do not pull an unrelated attack into a case", () => {
  const cyber = story("cyber", "Hacker veröffentlichen Daten nach Angriff auf Landesnetz", "Nach dem Cyberangriff wurden Daten aus dem Berliner IT-Netz veröffentlicht.", { topic: ["Energie", "Digitalisierung"] });
  const grouped = buildCaseFiles([...caseStories(), cyber]);
  assert.equal(grouped.cases[0].member_count, 3);
  assert.ok(grouped.visibleStories.some(item => item.story_id === "cyber"));
});

test("the generic rules also recognize another recurring case without a hand-written exception", () => {
  const entries = [
    story("a", "Nordstern GmbH beantragt Insolvenzverfahren", "Die Nordstern GmbH hat ein Insolvenzverfahren beantragt.", { topic: ["Wirtschaft"] }),
    story("b", "Insolvenzverfahren: Gericht bestellt Verwalter für Nordstern GmbH", "Das Gericht hat im Insolvenzverfahren der Nordstern GmbH einen Verwalter bestellt.", { topic: ["Wirtschaft"], last_updated: "2026-09-05T10:00:00Z" }),
    story("c", "Nordstern GmbH: Gläubiger beraten im Insolvenzverfahren", "Gläubiger der Nordstern GmbH beraten den Fortgang des Insolvenzverfahrens.", { topic: ["Wirtschaft"], last_updated: "2026-09-05T12:00:00Z" }),
  ];
  const grouped = buildCaseFiles(entries);
  assert.equal(grouped.cases.length, 1);
  assert.equal(grouped.visibleStories.length, 1);
});

test("a strongly identified case can continue after a quiet month", () => {
  const entries = [
    story("a", "Nordstern GmbH beantragt Insolvenzverfahren", "Die Nordstern GmbH hat ein Insolvenzverfahren beantragt.", { topic: ["Wirtschaft"] }),
    story("b", "Insolvenzverfahren: Gericht bestellt Verwalter für Nordstern GmbH", "Das Gericht hat im Insolvenzverfahren der Nordstern GmbH einen Verwalter bestellt.", { topic: ["Wirtschaft"], first_seen: "2026-09-05T10:00:00Z", last_updated: "2026-09-05T10:00:00Z" }),
    story("c", "Nordstern GmbH: Gericht eröffnet Insolvenzverfahren", "Das Gericht eröffnet das Insolvenzverfahren der Nordstern GmbH.", { topic: ["Wirtschaft"], first_seen: "2026-10-06T12:00:00Z", last_updated: "2026-10-06T12:00:00Z" }),
  ];
  const grouped = buildCaseFiles(entries);
  assert.equal(grouped.cases.length, 1);
  assert.equal(grouped.visibleStories[0].story_id, "c");
});

test("case rendering exposes current state and the complete evidence-separated history", () => {
  const stories = caseStories();
  const grouped = buildCaseFiles(stories);
  const html = renderCaseFile(stories[2], grouped.cases[0]);
  assert.match(html, /Entwickelnde Nachrichtenlage/);
  assert.match(html, /3 zusammenhängende Entwicklungen/);
  assert.match(html, /Sabotage an Umspannwerk in Jänschwalde/);
  assert.match(html, /Einzelereignisse, Belege und Analysen bleiben getrennt/);
});
