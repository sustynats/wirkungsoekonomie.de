import test from "node:test";
import assert from "node:assert/strict";
import { buildCaseFiles, caseContribution, caseIntegrityErrors } from "../../scripts/news/case-files.mjs";
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

test("general hybrid-risk reporting remains a standalone story, never a sabotage development", () => {
  const background = story("risk-report", "Bericht nennt wachsende Risiken durch Cyberangriffe, Desinformation, Spionage und Sabotage für Unternehmen", "Wirtschaftsforscher sehen laut Bericht wachsende hybride Risiken für Unternehmen. Schutzmaßnahmen für Stromnetz und Umspannwerke werden diskutiert.");
  const entries = [...caseStories(), background];
  const before = structuredClone(entries);
  const grouped = buildCaseFiles(entries);
  assert.equal(caseContribution(background).role, "background");
  assert.equal(grouped.caseByStory.has(background.story_id), false);
  assert.ok(grouped.visibleStories.some(item => item.story_id === background.story_id));
  assert.equal(grouped.cases[0].member_count, 3);
  for (const member of caseStories()) assert.doesNotMatch(renderCaseFile(member, grouped.cases[0]), /wachsende Risiken|risk-report/);
  assert.deepEqual(entries, before);
  assert.deepEqual(buildCaseFiles(entries).cases, grouped.cases);
});

test("background exclusion is topic- and actor-independent, including source-headline signals", () => {
  for (const [title, topic] of [
    ["Studie zu Angriffen auf demokratische Institutionen", "Politik"],
    ["Analyse der Proteste von Gewerkschaften", "Arbeit"],
    ["Umfrage zu Protesten von Wirtschaftsverbänden", "Wirtschaft"],
    ["Studie über Brandrisiken durch Klimawandel", "Klima"],
    ["Befragung zu Epidemien und Risiken für Pflegeheime", "Gesundheit"],
  ]) assert.equal(caseContribution(story("background", title, "", { topic: [topic] })).role, "background", title);
  const entry = story("source-background", "Jedes fünfte Unternehmen ist betroffen", "", { sources: [{ title: "Wachsende Risiken: Jedes fünfte Unternehmen spürt hybride Bedrohung" }] });
  assert.equal(caseContribution(entry).role, "background");
});

test("case-specific forensic findings and concrete reactions are not discarded as generic studies", () => {
  const finding = story("finding", "Gutachten bestätigt Sabotage am Umspannwerk Jänschwalde", "Das Gutachten bestätigt die Sabotage am Umspannwerk in Jänschwalde und den Angriff auf das Stromnetz.");
  const grouped = buildCaseFiles([...caseStories(), finding]);
  assert.notEqual(caseContribution(finding).role, "background");
  assert.ok(grouped.caseByStory.has(finding.story_id));
  const decision = story("decision", "Nach Gutachten: Regierung beschließt Schutz für Umspannwerke", "");
  assert.equal(caseContribution(decision).kind, "Entscheidung oder Maßnahme");
});

test("a general background report cannot bridge otherwise independent cases", () => {
  const otherCase = [
    story("cyber1", "Angriff auf Rechenzentrum Nordstadt", "Im Rechenzentrum Nordstadt wurden Verwaltungsdaten gestohlen."),
    story("cyber2", "Ermittlungen zum Cyberangriff auf Rechenzentrum Nordstadt", "Die Ermittlungen betreffen gestohlene Verwaltungsdaten im Rechenzentrum Nordstadt."),
    story("cyber3", "Angriff: Verwaltungsdaten aus Rechenzentrum Nordstadt veröffentlicht", "Die Daten aus dem Rechenzentrum Nordstadt wurden veröffentlicht."),
  ];
  const background = story("bridge", "Analyse zu Sabotage an Umspannwerken und Cyberangriff auf Rechenzentrum Nordstadt", "Die Fahndung am Umspannwerk Jänschwalde und die Verwaltungsdaten aus dem Rechenzentrum Nordstadt zeigen unterschiedliche Risiken.");
  const baseline = buildCaseFiles([...caseStories(), ...otherCase]);
  assert.equal(baseline.cases.length, 2);
  const result = buildCaseFiles([...caseStories(), ...otherCase, background]);
  assert.deepEqual(result.cases.map(entry => entry.members.map(member => member.story_id)), baseline.cases.map(entry => entry.members.map(member => member.story_id)));
  assert.equal(result.caseByStory.has("bridge"), false);
});

test("timeline labels separate demands, announcements and concrete measures", () => {
  for (const [title, expected] of [
    ["Angriffe auf Umspannwerke: Amprion-Chef will für Unternehmen mehr Befugnisse", "Forderung oder Position"],
    ["Nach Sabotage: Opposition fordert mehr Schutz für Umspannwerke", "Forderung oder Position"],
    ["Brandenburg plant Sicherheitszentrum nach Stromnetz-Sabotage", "Angekündigte Maßnahme"],
    ["Sabotage-Akte: Hessen erhöht Schutz für Umspannwerke", "Entscheidung oder Maßnahme"],
    ["Regierung beschließt Schutz für Umspannwerke", "Entscheidung oder Maßnahme"],
    ["Polizei ermittelt nach Sabotage an Umspannwerken", "Ermittlungsstand"],
  ]) assert.equal(caseContribution(story("label", title, "Der Bericht erläutert mögliche Schutzmaßnahmen und Gesetze.")).kind, expected, title);
  assert.notEqual(caseContribution(story("nouns", "Sabotage an Umspannwerk Jänschwalde", "Schutzmaßnahmen, Gesetz und Sicherheitskosten sind Teil des Hintergrunds.")).kind, "Entscheidung oder Maßnahme");
});

test("distinct named conflicts never merge through shared actors or cross-conflict background", () => {
  const make = (id, place, suffix = "") => story(id, `${place}-Krieg: US-Unterhändler beraten über Verhandlungen ${suffix}`, `US-Unterhändler beraten über Verhandlungen im ${place}-Krieg. Die ${place}delegation tagt in ${place}stadt.`, { topic: ["Geopolitik"] });
  // Deliberately equal wording except for the conflict; also covers future
  // names instead of encoding a special Iran/Ukraine membership correction.
  for (const [left, right] of [["Ukraine", "Iran"], ["Nordland", "Südland"]]) {
    const entries = [make("a1", left), make("a2", left, "beginnen"), make("a3", left, "beendet"), make("b1", right), make("b2", right, "beginnen"), make("b3", right, "beendet")];
    entries.push(story("bridge", `US-Unterhändler: Verhandlungen über ${left}-Krieg und ${right}-Krieg`, "Gemeinsame Akteure sind kein Beleg für dasselbe Ereignis.", { topic: ["Geopolitik"] }));
    const grouped = buildCaseFiles(entries);
    assert.equal(grouped.cases.length, 2);
    assert.equal(grouped.caseByStory.has("bridge"), false);
    assert.deepEqual(grouped.cases.map(c => c.member_count), [3, 3]);
    assert.notEqual(grouped.caseByStory.get("a1").case_id, grouped.caseByStory.get("b1").case_id);
  }
});

test("conflict names in alternate syntax or the factual lead preserve a valid case", () => {
  const entries = [
    story("a", "US-Unterhändler: Verhandlungen über Ukraine-Krieg in Moskau", "", { topic: ["Geopolitik"] }),
    story("b", "Krieg in der Ukraine: US-Unterhändler beraten in Moskau", "", { topic: ["Geopolitik"] }),
    story("c", "Verhandlungen: US-Unterhändler beraten in Moskau", "Die Gespräche betreffen ein Ende des Ukraine-Kriegs.", { topic: ["Geopolitik"] }),
  ];
  assert.equal(buildCaseFiles(entries).cases[0].member_count, 3);
});

test("acute bridge reports cannot join different incident objects, even with identical vocabulary", () => {
  const make = (id, place) => story(id, `Sabotage an Umspannwerk in ${place}: Fahndung läuft`, `Bekennerschreiben zum Angriff auf das Umspannwerk in ${place} beim Netzbetreiber ${place}werke; Ermittlungen und Fahndung laufen.`);
  const left = [make("a1", "Nordstadt"), make("a2", "Nordstadt"), make("a3", "Nordstadt")];
  const right = [make("b1", "Südstadt"), make("b2", "Südstadt"), make("b3", "Südstadt")];
  const bridge = story("z-bridge", "Sabotage an Umspannwerken: Fahndung läuft", "Bekennerschreiben zu Angriffen auf Umspannwerke in Nordstadt und in Südstadt bei den Netzbetreibern Nordstadtwerke und Südstadtwerke; Ermittlungen laufen.", { first_seen: "2026-09-05T12:00:00Z" });
  const entries = [...left, ...right, bridge], before = structuredClone(entries);
  const result = buildCaseFiles(entries);
  assert.equal(result.cases.length, 2);
  assert.equal(result.caseByStory.has(bridge.story_id), false);
  assert.ok(result.diagnostics.ambiguous_story_ids.includes(bridge.story_id));
  assert.equal(result.visibleStories.length, 3);
  assert.deepEqual(buildCaseFiles([...entries].reverse()).cases, result.cases);
  assert.deepEqual(entries, before);
  for (const group of result.cases) assert.deepEqual(caseIntegrityErrors(group, entries), []);
  const invalid = { members: entries.map(s => ({ story_id: s.story_id })), member_count: entries.length };
  assert.ok(caseIntegrityErrors(invalid, entries).some(error => error.startsWith("CASE_PAIR_INCOMPATIBLE")));
});

test("same case vocabulary cannot combine different companies or election jurisdictions", () => {
  for (const titles of [
    ["Nordstern GmbH: Insolvenzverfahren und Gläubigerversammlung", "Südstern GmbH: Insolvenzverfahren und Gläubigerversammlung"],
    ["Nordstern Energie GmbH: Insolvenzverfahren und Gläubigerversammlung", "Südstern Energie GmbH: Insolvenzverfahren und Gläubigerversammlung"],
    ["Landtagswahl in Sachsen-Anhalt: Regierungsbildung und Verhandlungen", "Landtagswahl in Sachsen: Regierungsbildung und Verhandlungen"],
  ]) {
    const entries = titles.flatMap((title, index) => [0, 1, 2].map(i => story(`${index}-${i}`, title, title, { topic: ["Politik", "Wirtschaft"] })));
    const result = buildCaseFiles(entries);
    assert.equal(result.cases.length, 2);
    assert.notEqual(result.caseByStory.get("0-0").case_id, result.caseByStory.get("1-0").case_id);
  }
});

test("time-window chains cannot silently extend a case beyond its maximum span", () => {
  const entries = ["2026-01-01", "2026-03-01", "2026-05-01"].map((date, i) => story(`month-${i}`, "Nordstern GmbH: Insolvenzverfahren und Gläubigerversammlung", "Die Nordstern GmbH durchläuft das Insolvenzverfahren.", { first_seen: date }));
  assert.equal(buildCaseFiles(entries).cases.length, 0);
  assert.equal(buildCaseFiles(entries).visibleStories.length, 3);
});

test("missing dates and known different recurring incidents remain standalone", () => {
  const entries = caseStories();
  const undated = story("undated", entries[0].title, entries[0].source_summary, { first_seen: "invalid", published_at: "invalid", last_updated: "invalid" });
  const repeat = story("repeat", "Weiterer Angriff an Umspannwerk in Jänschwalde", entries[0].source_summary);
  const result = buildCaseFiles([...entries, undated, repeat]);
  assert.equal(result.caseByStory.has("undated"), false);
  assert.equal(result.caseByStory.has("repeat"), false);
});

test("publication membership assertion rejects unknown, duplicate and incompatible members", () => {
  const entries = caseStories();
  const valid = buildCaseFiles(entries).cases[0];
  assert.deepEqual(caseIntegrityErrors(valid, entries), []);
  assert.ok(caseIntegrityErrors({ ...valid, members: [...valid.members, valid.members[0]] }, entries).includes("CASE_MEMBERSHIP_INVALID"));
  assert.ok(caseIntegrityErrors({ ...valid, members: [{ story_id: "missing" }] }, entries).includes("CASE_MEMBER_UNKNOWN:missing"));
});
