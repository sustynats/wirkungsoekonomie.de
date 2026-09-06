import test from "node:test";
import assert from "node:assert/strict";
import { documentKey, fileSubject, namedSubjects, subjectConflict, livingFileMatch, duplicateGroups, mergeLivingFiles, relatedStories, diplomaticVisit } from "../../scripts/news/living-files.mjs";
import { anchoredSources, clusterItems, existingStoryMatch } from "../../scripts/news/lib.mjs";
import { renderRelatedStories } from "../../scripts/news/build.mjs";
import { runWirkungsticker, publishedRecord, repartitionOversizedSourceQueues } from "../../scripts/news/run.mjs";

const now = "2026-09-04T06:00:00Z";
const source = (title, url = "https://example.org/a", more = {}) => ({ title, url, source_id: "test", publisher_id: "test", publisher: "Test", primary_source: true, published_at: now, ...more });
const story = (id, title, more = {}) => ({ story_id: id, slug: id, title, source_summary: "", published: true, listed: true, published_at: now, last_updated: now, first_seen: now, sources: [source(title, `https://example.org/${id}`)], claims: [], analysis: { summary: title }, versions: [{ version: 1, analyzed_at: now }], current_version: 1, ...more });
const dormagen = story("dormagen", "Mutmaßlich Sabotage-Versuch an Umspannwerk in Dormagen");

test('an attached election background report cannot bridge polls into rallies', () => {
  const poll = story('poll', 'Vor der Landtagswahl: Sachsen-Anhalt und die Tücken der Umfragen');
  const rally = source('Landtagswahl: Tausende zu Kundgebungen vor Wahl in Sachsen-Anhalt erwartet', 'https://example.org/rally');
  poll.sources.push(rally); // Previously polluted persisted cluster.
  assert.deepEqual(anchoredSources(poll), [poll.sources[0]]);
  assert.equal(existingStoryMatch(rally, {story:poll,last_updated:now}, now), 0);
  assert.notEqual(clusterItems([rally], [poll], now)[0].story_id, poll.story_id);
  for (const input of [[poll.sources[0],rally], [rally,poll.sources[0]]]) assert.equal(clusterItems(input, [], now).length, 2);
});

test('a reused article URL cannot turn polling into an election result', () => {
  const poll = story('poll', 'Wahl in Sachsen-Anhalt: So stehen die Parteien in den Umfragen');
  const result = source('Wahl Sachsen-Anhalt: Hochrechnungen und Ergebnisse', poll.sources[0].url);
  assert.equal(subjectConflict(result,poll), true);
  assert.equal(livingFileMatch(result,poll).score, 0);
  assert.notEqual(clusterItems([result],[poll],now)[0].story_id, poll.story_id);
});

test('overgrown queue repair preserves publications, requeues every detached source and is idempotent', () => {
  for (const published of [true,false]) {
    const original = story('poll', 'Vor der Landtagswahl: Sachsen-Anhalt und die Tücken der Umfragen', {published});
    const other = source('Landtagswahl: Tausende zu Kundgebungen vor Wahl in Sachsen-Anhalt erwartet', 'https://example.org/rally');
    original.review_checkpoint = {sources:[...original.sources,other]};
    if (published) original.pending_update = {reason:'AI_INPUT_TOO_LARGE',sources:[...original.sources,other],quality_errors:['AI_INPUT_TOO_LARGE']};
    else { original.sources.push(other); original.pending_reason='AI_INPUT_TOO_LARGE'; }
    const before = structuredClone(original);
    const result = repartitionOversizedSourceQueues([original],now);
    assert.equal(result.changes.length,1);
    assert.deepEqual(result.requeued_sources,[other]);
    assert.deepEqual(original.queue_source_repartitions[0].detached_sources,[other]);
    assert.equal(original.review_checkpoint,undefined);
    for (const key of ['title','analysis','versions','published_at','current_version']) assert.deepEqual(original[key],before[key]);
    if (published) { assert.deepEqual(original.sources,before.sources); assert.deepEqual(original.claims,before.claims); }
    assert.deepEqual(repartitionOversizedSourceQueues([original],now),{changes:[],requeued_sources:[]});
    const rerouted = clusterItems(result.requeued_sources,[original],now);
    assert.notEqual(rerouted[0].story_id,original.story_id);
  }
});

test('a genuinely large single event is not split merely to fit the provider request', () => {
  const s=story('incident','Sabotage an Umspannwerk in Dormagen: Ermittlungen laufen',{published:false,pending_reason:'AI_INPUT_TOO_LARGE'});
  s.sources.push(...Array.from({length:40},(_,i)=>source(s.title,`https://example.org/incident-${i}`)));
  const before=structuredClone(s);
  assert.deepEqual(repartitionOversizedSourceQueues([s],now),{changes:[],requeued_sources:[]});
  assert.deepEqual(s,before);
});

const visit = (id, title, summary, more = {}) => story(id, title, {
  source_summary: summary, topic: ["Geopolitik"],
  sources: [source(title, `https://example.org/${id}`, { summary })], ...more,
});

test("same delegation and destination route spelling/headline variants before AI", () => {
  const entries = [
    visit("a", "Witkoff und Kushner erstmals in Kiew erwartet", "Die US-Gesandten Witkoff und Kushner kommen nach Gesprächen in Moskau nach Kiew."),
    visit("b", "Ukraine-News: US-Vermittler Witkoff und Kushner in Kiew empfangen", "Die US-Sondergesandten Steve Witkoff und Jared Kushner sind in Kiew eingetroffen."),
    visit("c", "Krieg in der Ukraine: US-Unterhändler in Kyjiw", "Die US-Unterhändler Jared Kushner und Steve Witkoff sind erstmals in Kyjiw eingetroffen."),
  ];
  for (const input of [entries, [...entries].reverse()]) {
    const groups = duplicateGroups(input);
    assert.equal(groups.length, 1);
    assert.equal(groups[0].duplicate_ids.length, 2);
    assert.equal(clusterItems(input.map(s => s.sources[0]), [], now).length, 1);
  }
  assert.equal(clusterItems([entries[1].sources[0]], [entries[0]], now)[0].story_id, "a");
  assert.equal(diplomaticVisit(entries[2]).destination, "kyjiw");
});

test("visit identity is generic, while one shared actor or a new city is insufficient", () => {
  const base = visit("base", "Unterhändler Anna Sommer und Tom Winter in Nordstadt erwartet", "Die Unterhändler Anna Sommer und Tom Winter besuchen Nordstadt.");
  const same = visit("same", "Gesandte Sommer und Winter in Nordstadt angekommen", "Die Gesandten Sommer und Winter führen Gespräche.");
  assert.equal(duplicateGroups([base, same]).length, 1);
  for (const [title, summary] of [
    ["Gesandte Sommer und Winter in Südstadt", "Die Gesandten Sommer und Winter sind in Südstadt."],
    ["Gesandte Sommer und Herbst in Nordstadt", "Die Gesandten Sommer und Herbst treffen ein."],
    ["Gesandte Sommer in Nordstadt erwartet", "Die Gesandte Anna Sommer reist in die Stadt."],
    ["Angriff in Nordstadt während Besuch der Gesandten", "Die Gesandten Sommer und Winter führen dort Gespräche."],
    ["Neuer Besuch: Gesandte Sommer und Winter in Nordstadt", "Die Gesandten Sommer und Winter kommen zurück."],
  ]) {
    const separate = visit("separate", title, summary);
    assert.equal(duplicateGroups([base, separate]).length, 0, title);
    assert.notEqual(clusterItems([separate.sources[0]], [base], now)[0].story_id, "base", title);
  }
});

test("visit windows use original event dates and cannot grow through pairwise chains", () => {
  const make = (id, date) => visit(id, "Gesandte Sommer und Winter in Nordstadt erwartet", "Die Gesandten Sommer und Winter führen Gespräche.", { first_seen: date, published_at: date, last_updated: date });
  assert.equal(duplicateGroups([make("a", "2026-09-01"), make("b", "2026-09-10")]).length, 0);
  assert.equal(duplicateGroups([make("a", "invalid"), make("b", "invalid")]).length, 0);
  const entries = [make("middle", "2026-09-05"), make("early", "2026-09-01"), make("late", "2026-09-09")];
  entries[0].living_file = { consolidations: [{ at: now }] };
  assert.equal(duplicateGroups(entries)[0].duplicate_ids.length, 1);
  mergeLivingFiles(entries, [{ canonical_id: "middle", duplicate_ids: ["early", "late"], reason: "stale-plan" }], now);
  assert.equal(entries.filter(s => s.listed === false).length, 1);
});

test("visit consolidation retains all checked texts and queues new source combinations", () => {
  const a = visit("a", "US-Vermittler Sommer und Winter in Nordstadt empfangen", "Die US-Vermittler Sommer und Winter sind eingetroffen.");
  const b = visit("b", "Gesandte Sommer und Winter erstmals in Nordstadt erwartet", "Die Gesandten Sommer und Winter reisen nach Nordstadt.");
  b.pending_update = { sources: [source("Neue Stellungnahme", "https://example.org/update")] };
  const entries = [a, b], before = structuredClone(entries);
  const groups = duplicateGroups(entries);
  assert.equal(mergeLivingFiles(entries, groups, now).length, 1);
  assert.deepEqual(duplicateGroups(entries), []);
  for (let i = 0; i < entries.length; i++) for (const field of ["title", "source_summary", "analysis", "claims", "sources", "versions", "published_at", "last_updated", "current_version"])
    assert.deepEqual(entries[i][field], before[i][field]);
  assert.equal(a.pending_update.sources.length, 3);
  assert.equal(clusterItems([b.sources[0]], entries, now)[0].story_id, "a");
});

test("article identity follows changed publisher slugs, not arbitrary IDs or query resources", () => {
  assert.equal(documentKey("https://www.stern.de/alt-38205422.html?utm_source=x#top"), documentKey("https://www.stern.de/neu-38205422.html"));
  assert.notEqual(documentKey("https://example.org/a?id=1"), documentKey("https://example.org/a?id=2"));
  assert.equal(documentKey("javascript:alert(1)"), "");
});
test("object, place and time distinguish follow-up from a different incident or response", () => {
  assert.equal(livingFileMatch(source("Polizei geht von Sabotage an Umspannwerk in Dormagen aus"), dormagen).score, 0.98);
  assert.equal(livingFileMatch(source("Polizei geht von Sabotage an Umspannwerk in Oldenburg aus"), dormagen).score, 0);
  assert.equal(livingFileMatch(source("Polizei geht von Sabotage an Umspannwerk in Dormagen aus", undefined, { published_at: "2026-10-01" }), dormagen).score, 0);
  assert.equal(subjectConflict(source("Hessen erhöht Schutz für Umspannwerke"), dormagen), true);
  assert.equal(fileSubject({ title: "Sabotage an Umspannwerk Jänschwalde", summary: "Das Schreiben wurde in Nordrhein-Westfalen abgeschickt." }).key, "grid_incident:janschwalde");
  assert.equal(fileSubject(source("Sabotage an Umspannwerk in Dormagen und weiterer Einsatz in Oldenburg")).key, null);
  assert.equal(livingFileMatch(source("Weiterer Angriff an Umspannwerk in Dormagen"), dormagen).score, 0);
});
test("known existing document is routed before high-priority unanchored batch entries", () => {
  const existing = story("old", "Erste Nachricht zum Stromnetz", { sources: [source("Erste Nachricht zum Stromnetz", "https://example.org/known")] });
  const items = [source("Polizei untersucht Sabotage an Umspannwerk in Dormagen", "https://example.org/new", { source_priority: 100 }), source("Polizei untersucht Sabotage an Umspannwerk in Dormagen", "https://example.org/known", { source_priority: 1 })];
  for (const input of [items, [...items].reverse()]) {
    const clusters = clusterItems(input, [existing], now);
    assert.equal(clusters.length, 1);
    assert.equal(clusters[0].story_id, "old");
    assert.equal(clusters[0].sources.length, 2);
  }
});
test("high title similarity and broad policy words cannot override different places", () => {
  const incoming = source("Mutmaßlich Sabotage-Versuch an Umspannwerk in Oldenburg");
  assert.notEqual(clusterItems([incoming], [dormagen], now)[0].story_id, "dormagen");
  const german = story("de", "Kommission genehmigt deutschen Kapazitätsmechanismus");
  assert.notEqual(clusterItems([source("Kommission genehmigt französischen Kapazitätsmechanismus")], [german], now)[0].story_id, "de");
});
test("different German election jurisdictions never become one event", () => {
  const saxonyAnhalt = source("Vor der Wahl: Stimmung in Sachsen-Anhalt", "https://example.org/sachsen-anhalt");
  const berlin = source("BerlinTrend kurz vor der Wahl: Stimmung vor der Berlin-Wahl", "https://example.org/berlin");
  assert.deepEqual(fileSubject(saxonyAnhalt).elections, ["sachsen-anhalt"]);
  assert.deepEqual(fileSubject(berlin).elections, ["berlin"]);
  assert.equal(subjectConflict(saxonyAnhalt, berlin), true);
  assert.equal(clusterItems([saxonyAnhalt, berlin], [], now).length, 2);
});

test("named company and conflict differences guard ingestion as well as stale merge plans", () => {
  for (const [a, b] of [
    ["Nordstern GmbH beantragt Insolvenzverfahren", "Südstern GmbH beantragt Insolvenzverfahren"],
    ["Nordstern Energie GmbH beantragt Insolvenzverfahren", "Südstern Energie GmbH beantragt Insolvenzverfahren"],
    ["Nordland-Krieg: US-Unterhändler beraten über Verhandlungen", "Südland-Krieg: US-Unterhändler beraten über Verhandlungen"],
  ]) {
    const canonical = story("canonical", a), other = story("other", b);
    const entries = [canonical, other], before = structuredClone(entries);
    assert.equal(subjectConflict(canonical, other), true);
    assert.deepEqual(duplicateGroups(entries), []);
    assert.equal(clusterItems([source(b)], [canonical], now).length, 1);
    assert.notEqual(clusterItems([source(b)], [canonical], now)[0].story_id, canonical.story_id);
    assert.deepEqual(mergeLivingFiles(entries, [{ canonical_id: "canonical", duplicate_ids: ["other"], reason: "stale_plan" }], now), []);
    assert.deepEqual(entries, before);
  }
});

test("company identities retain the full compound name, not a common industry suffix", () => {
  assert.deepEqual(namedSubjects({ title: "Die Nordstern Energie GmbH beantragt Insolvenzverfahren" }).companies, ["nordstern energie:gmbh"]);
  assert.deepEqual(namedSubjects({ title: "Gericht bestellt Verwalter für Nordstern Energie GmbH" }).companies, ["nordstern energie:gmbh"]);
  assert.deepEqual(fileSubject({ title: "Auswahl von Projekten in Sachsen" }).elections, []);
  assert.deepEqual(fileSubject({ title: "Landtagswahl in Sachsen" }).elections, ["sachsen"]);
});
test("consolidation is idempotent, preserves histories, queues review and routes aliases", () => {
  const canonical = structuredClone(dormagen);
  const duplicate = story("duplicate", "Polizei: Verdächtiger Gegenstand an Umspannwerk in Dormagen", { pending_update: { sources: [source("Sabotage in Dormagen", "https://example.org/pending")], reason: "AI_PROVIDER_UNAVAILABLE" }, followups: [{ followup_id: "f1", status: "scheduled" }] });
  const beforeCanonical = structuredClone(canonical), beforeDuplicate = structuredClone(duplicate);
  const stories = [canonical, duplicate];
  const groups = [{ canonical_id: canonical.story_id, duplicate_ids: [duplicate.story_id], reason: "test" }];
  assert.equal(mergeLivingFiles(stories, groups, now).length, 1);
  assert.equal(mergeLivingFiles(stories, groups, now).length, 0);
  for (const key of ["analysis", "claims", "versions", "current_version", "sources", "last_updated", "published_at"]) assert.deepEqual(canonical[key], beforeCanonical[key]);
  for (const key of ["analysis", "claims", "versions", "sources", "pending_update", "last_updated"]) assert.deepEqual(duplicate[key], beforeDuplicate[key]);
  assert.equal(duplicate.listed, false);
  assert.equal(canonical.pending_update.sources.length, 3);
  assert.equal(canonical.followups[0].origin_story_id, "duplicate");
  const clusters = clusterItems([source("Neuer Ermittlungsstand", duplicate.sources[0].url)], stories, now);
  assert.equal(clusters[0].story_id, canonical.story_id);
  assert.equal(clusters[0].existing_story, canonical);
});
test("automatic merging excludes other places, response policies and multi-event roundups", () => {
  const duplicate = story("dup", "Polizei geht von Sabotage an Umspannwerk in Dormagen aus");
  const separate = [story("elsewhere", "Sabotage an Umspannwerk in Oldenburg"), story("response", "Hessen erhöht Schutz für Umspannwerke"), story("roundup", "Sabotage an Umspannwerk in Dormagen und in Oldenburg")];
  const groups = duplicateGroups([dormagen, duplicate, ...separate]);
  assert.equal(groups.length, 1);
  assert.deepEqual([groups[0].canonical_id, ...groups[0].duplicate_ids].sort(), ["dormagen", "dup"].sort());
});

test("reports about the same public-network cyber incident become one living file", () => {
  const rbb = story("rbb", "Hackergruppe veröffentlicht Daten nach Angriff auf Berliner Landesnetz", {
    last_updated: "2026-09-04T18:08:49Z",
    sources: [source("Hackergruppe veröffentlicht Daten nach Angriff auf Berliner Landesnetz", "https://www.rbb24.de/politik/beitrag/2026/09/berlin-hacker-angriff-landesnetz-daten-veroeffentlicht.html")],
  });
  const dlf = story("dlf", "Cyberkriminalität - Hacker veröffentlichen nach Angriff Daten aus Berliner IT-Netz im Darknet - offenbar auch sicherheitsrelevante Informationen", {
    last_updated: "2026-09-04T17:35:19Z",
    sources: [source("Cyberkriminalität: Hacker veröffentlichen nach Angriff Daten aus Berliner IT-Netz", "https://www.deutschlandfunk.de/berlin-it-netz-cyberangriff-100.html")],
  });
  const official = source("Aktuelle Lage nach dem IKT-Vorfall im Landesnetz Berlin und der Veröffentlichung der gestohlenen Daten", "https://www.berlin.de/rbmskzl/aktuelles/pressemitteilungen/2026/pressemitteilung.1710705.php");
  assert.equal(fileSubject(rbb).key, "cyber_incident:berlin");
  assert.equal(fileSubject(dlf).key, "cyber_incident:berlin");
  assert.equal(fileSubject(official).key, "cyber_incident:berlin");
  assert.deepEqual(duplicateGroups([rbb, dlf]), [{ canonical_id: "rbb", duplicate_ids: ["dlf"], reason: "specific_object_or_leading_document" }]);
  assert.equal(clusterItems([official], [rbb], now)[0].story_id, "rbb");
  assert.equal(livingFileMatch(source("Cyberangriff auf Hamburger Landesnetz"), rbb).score, 0);
  assert.equal(fileSubject(source("Cyberangriff auf Berliner Krankenhausnetz")).key, null);
  assert.equal(fileSubject(source("Hacker melden Daten aus Landesnetz nach Ultimatum")).key, null);
});

test("synonymous headlines for the same dated event become one file before another live card is built", () => {
  const dw = story("dw", "Putin: Drei Tage Angriffspause während Ukraine-Verhandlungen", {
    first_seen: "2026-09-05T13:01:00Z", last_updated: "2026-09-05T14:17:03Z",
    sources: [source("Putin: Drei Tage Angriffspause während Ukraine-Verhandlungen", "https://www.dw.com/de/a-1", { published_at: "2026-09-05T13:01:00Z", summary: "Die Ankündigung gilt für drei Tage nur für Kyjiw." })],
  });
  const mdr = story("mdr", "Ukraine-News: Putin verkündet dreitägigen Angriffsstopp auf Kiew", {
    first_seen: "2026-09-05T13:53:00Z", last_updated: "2026-09-05T14:16:34Z",
    sources: [source("Ukraine-News: Putin verkündet dreitägigen Angriffsstopp auf Kiew", "https://www.mdr.de/nachrichten/a.html", { published_at: "2026-09-05T13:53:00Z", summary: "Putin kündigte an, drei Tage lang Kiew nicht anzugreifen." })],
  });
  assert.deepEqual(duplicateGroups([dw, mdr]), [{ canonical_id: "dw", duplicate_ids: ["mdr"], reason: "specific_object_or_leading_document" }]);
  assert.equal(clusterItems([dw.sources[0], mdr.sources[0]], [], "2026-09-05T14:00:00Z").length, 1);
});

test("subsequent consolidation resolves older aliases directly and preserves the old target history", () => {
  const a = structuredClone(dormagen), b = story("b", dormagen.title), c = story("c", dormagen.title);
  const stories = [a, b, c];
  mergeLivingFiles(stories, [{ canonical_id: "b", duplicate_ids: ["c"], reason: "first" }], now);
  mergeLivingFiles(stories, [{ canonical_id: "dormagen", duplicate_ids: ["b"], reason: "second" }], now);
  assert.deepEqual(a.living_file.merged_story_ids.sort(), ["b", "c"]);
  assert.deepEqual(c.retirement.canonical_story_ids, ["dormagen"]);
  assert.deepEqual(c.retirement_history[0].canonical_story_ids, ["b"]);
  assert.equal(clusterItems([source("Aktualisierung", c.sources[0].url)], stories, now)[0].story_id, "dormagen");
});

test("Jänschwalde, NRW and a shared investigation stay distinct but cross-linked", () => {
  const janschwalde = story("janschwalde", "Sabotage an Umspannwerk Jänschwalde: Bekennerschreiben aufgetaucht", {
    source_summary: "Nach dem Anschlag auf das Umspannwerk bei Jänschwalde ist ein Bekennerschreiben eingegangen. Seine Echtheit ist offen.",
  });
  const roundup = story("ard", "ARD-Informationen: Polizeibehörden halten Bekennerschreiben für authentisch", {
    source_summary: "Die Polizei hält die Bekennerschreiben zu den Sabotageakten auf die Stromversorgung für authentisch. Ein mutmaßlicher Alleintäter bekennt sich zu den Anschlägen in Jänschwalde und in Bergheim bei Köln.",
  });
  const corpus = [janschwalde, dormagen, roundup];
  const before = structuredClone(corpus);
  assert.equal(fileSubject(roundup).multipleEvents, true);
  assert.equal(fileSubject(roundup).key, null);
  assert.deepEqual(duplicateGroups(corpus), []);
  const incoming = source(roundup.title, roundup.sources[0].url, { summary: roundup.source_summary });
  const clustered = clusterItems([incoming], [janschwalde, dormagen], now);
  assert.notEqual(clustered[0].story_id, janschwalde.story_id);
  assert.notEqual(clustered[0].story_id, dormagen.story_id);
  assert.deepEqual(relatedStories(roundup, corpus).map((item) => item.story.story_id).sort(), ["dormagen", "janschwalde"]);
  assert.deepEqual(corpus, before, "a thematic link cannot copy facts, alter dates or merge stories");
  assert.equal(relatedStories(roundup, [roundup, story("supply", "Stromversorgung: Netzentgelte sinken")]).length, 0);
});

test("a known article URL cannot override newly widened multi-attack scope", () => {
  const incoming = source("Sabotage am Stromnetz: Ermittler prüfen mehrere Anschläge", dormagen.sources[0].url, {
    summary: "Nach dem Angriff in Dormagen untersucht die Polizei weitere Angriffe auf die Stromversorgung.",
  });
  assert.equal(livingFileMatch(incoming, dormagen).score, 0);
  assert.equal(subjectConflict(incoming, dormagen), true);
  assert.notEqual(clusterItems([incoming], [dormagen], now)[0].story_id, dormagen.story_id);
});
test("related links are capped, relevant, unique and never filled by shared category alone", () => {
  const relevant = Array.from({ length: 7 }, (_, i) => story(`related-${i}`, `Sicherheitsmaßnahmen für Umspannwerke ${i}`));
  const irrelevant = story("offshore", "Neue Ausschreibung für Windenergie auf See", { topic: ["Energie"] });
  const archived = story("archived", "Sabotage an Umspannwerk in Essen", { listed: false });
  const results = relatedStories(dormagen, [dormagen, ...relevant, irrelevant, archived]);
  assert.equal(results.length, 5);
  assert.ok(results.every(({ story }) => story.story_id.startsWith("related-")));
  assert.equal(relatedStories(dormagen, [dormagen, irrelevant]).length, 0);
  assert.equal(renderRelatedStories(dormagen, [dormagen, irrelevant]), "");
  assert.match(renderRelatedStories(dormagen, [dormagen, ...relevant]), /data-search-exclude/);
});

test("the same politician and court do not make separate legal questions a concrete topic", () => {
  const ballot = story("ballot", "Kongresswahlen: Trump zieht im Streit um Briefwahl erneut vor Supreme Court", { source_summary: "Donald Trump wendet sich im Streit um die Briefwahl an den Supreme Court." });
  const citizenship = story("citizenship", "Federal judge blocks Trump's new bid to abolish birthright citizenship citing Supreme Court precedent", { source_summary: "Donald Trump scheitert mit einem Vorstoß gegen das Geburtsortsprinzip." });
  assert.deepEqual(relatedStories(ballot, [ballot, citizenship]), []);
});

test("headless runs consolidate before AI and never retry a retired duplicate", async () => {
  const registrySource = { source_id: "test", publisher_id: "test", name: "Test", url: "https://example.org/", feed_url: "https://example.org/rss", enabled: true, source_type: "official_rss", primary_source: true, access: { status: "public", article: "metadata_only", cost_usd: 0 }, frequency_class: "high_frequency" };
  const canonical = structuredClone(dormagen);
  const duplicate = story("old", "Polizei geht von Sabotage an Umspannwerk in Dormagen aus", { last_updated: "2026-09-04T05:00:00Z", pending_update: { reason: "AI_PROVIDER_UNAVAILABLE", sources: [source("Sabotage an Umspannwerk in Dormagen", "https://example.org/new-source")] } });
  let captured, calls = [];
  const options = { dryRun: true, now, registry: { schema_version: "1.0", sources: [registrySource], policy: {} }, state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: "4.0" }, storyStore: { stories: [canonical, duplicate] }, usage: { runs: [] }, newsroom: { source_items: {}, events: {}, event_sources: [], discovery_candidates: [] }, budgetFx: { rate_date: "2026-09-04", rate_usd_per_eur: 1.16 }, fetchFeedImpl: async () => ({ not_modified: true, final_url: registrySource.feed_url }), callAiImpl: async (candidates) => { calls.push(...candidates.map((item) => item.story_id)); throw Object.assign(new Error("TEST_PROVIDER_UNAVAILABLE"), { requestAttempts: 0 }); }, captureState: (value) => { captured = value; } };
  const first = await runWirkungsticker(options);
  assert.deepEqual(calls, [canonical.story_id]);
  assert.equal(first.living_file_merges.length, 1);
  assert.equal(first.updated_stories, 0);
  assert.equal(first.published_stories, 0);
  assert.equal(first.public_changed, true);
  assert.deepEqual(captured.state.pending_story_ids, [canonical.story_id]);
  assert.equal(captured.storyStore.stories.find((item) => item.story_id === canonical.story_id).pending_update.consolidation, true);
  calls = [];
  const second = await runWirkungsticker({ ...options, ...captured });
  assert.deepEqual(calls, [canonical.story_id]);
  assert.equal(second.living_file_merges.length, 0);
  assert.equal(second.public_changed, false);
});

test("a verified update retains canonical URL/history and uses one new publication version", () => {
  const old = { ...structuredClone(dormagen), living_file: { merged_story_ids: ["old-alias"], consolidations: [{ story_id: "old-alias" }] }, publication_history: [{ version: 1, published_at: now }] };
  const at = "2026-09-04T07:00:00Z";
  const candidate = { ...old, existing_story: old, claims: [], topic: ["Energie"] };
  const next = publishedRecord(candidate, { summary: "Neue geprüfte Entwicklung", source_summary: "Neu", followups: [] }, { provider: "test", model: "test" }, at);
  assert.equal(next.slug, old.slug);
  assert.equal(next.published_at, old.published_at);
  assert.equal(next.last_updated, at);
  assert.equal(next.current_version, 2);
  assert.equal(next.versions.length, 2);
  assert.deepEqual(next.versions[0], old.versions[0]);
  assert.deepEqual(next.living_file, old.living_file);
  assert.equal(next.publication_history.length, 2);
});
