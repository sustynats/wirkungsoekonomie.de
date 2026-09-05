import test from "node:test";
import assert from "node:assert/strict";
import { sourceDue, annotateSourceItem, evidenceGroups, eventCompatibility, freshnessFor, sourceHealth, dueFollowups, validateNewsroomAnalysis, normalizeEvidenceExcerpts, nextDeepeningCheckpoint, sourceEvidenceSegments, resolveEvidenceReferences } from "../../scripts/news/newsroom.mjs";
import { newsBudget, costFromUsage, refreshBudgetFx } from "../../scripts/news/budget.mjs";
import { parseResearchApi, parseNewsSitemap, parseHtmlIndex, datedSource } from "../../scripts/news/source-adapters.mjs";
import { runWirkungsticker } from "../../scripts/news/run.mjs";
import { classifyItem, parseFeed } from "../../scripts/news/lib.mjs";

const now = "2026-09-03T12:00:00.000Z";
const source = { source_id: "test", publisher_id: "publisher", name: "Test", url: "https://example.org/", feed_url: "https://example.org/rss", enabled: true, source_type: "official_rss", primary_source: true, access: { status: "public", article: "metadata_only", cost_usd: 0 }, frequency_class: "high_frequency" };
const item = { source_id: "test", publisher_id: "publisher", url: "https://example.org/a", title: "Bund beschließt Klimagesetz zur Energieversorgung", summary: "Neue Regeln verändern Investitionen in Energie und Infrastruktur.", primary_source: true, published_at: now };
const proof = { source_id: item.source_id, url: item.url, excerpt: item.summary };
const analysis = { news_status: "preliminary", event_claims: [{ claim: "Die Quelle beschreibt neue Regeln für Energie und Infrastruktur.", status: "primary_source_claim", evidence: [proof] }], followups: [] };

test("material world news reaches editorial review without legislative keywords", () => {
  for (const title of [
    "US launches new military strikes in southern Iran",
    "Iran: Mindestens 15 Tote nach US-Attacken",
    "Federal judge blocks bid to abolish birthright citizenship",
    "Trumps Vorstoß gegen US-Geburtsrecht zunächst gestoppt",
    "Hackerangriff: Bürger-Daten könnten veröffentlicht werden",
    "Spritpreise: Iran-Krieg treibt Benzinpreise auf Höchststand",
    "Übernahme der Commerzbank betrifft Tausende Jobs",
  ]) assert.ok(classifyItem({ title }).score >= 30, title);
  assert.ok(classifyItem({ title: "Bundeskanzler telefoniert mit Staatspräsident" }).score < 30);
  assert.ok(classifyItem({ title: "Neue Farben für beliebten Haushaltshelfer" }).score < 30);
});

test("source cadence and bounded error backoff do not skip failed sources forever", () => {
  assert.equal(sourceDue(source, { last_attempt: "2026-09-03T11:50:00Z" }, now), false);
  assert.equal(sourceDue(source, { last_attempt: "2026-09-03T11:30:00Z" }, now), true);
  assert.equal(sourceDue(source, { last_attempt: "2026-09-03T11:30:00Z", last_error: "503", consecutive_failures: 2 }, now), false);
  assert.equal(sourceDue(source, { last_attempt: "2026-09-02T11:30:00Z", last_error: "503", consecutive_failures: 90 }, now), true);
  assert.equal(sourceDue(source, { governance_hold_until: "2026-09-04T12:00:00Z" }, now), false);
  assert.equal(sourceDue(source, { governance_hold_until: "2026-09-03T11:59:59Z" }, now), true);
});
test("publisher copies and attributed agency syndication are not independent evidence", () => {
  const a = annotateSourceItem({ ...item, summary: "Nach Angaben der Nachrichtenagentur Reuters gelten neue Regeln." }, source, now);
  const b = annotateSourceItem({ ...item, source_id: "b", url: "https://other.example/a", summary: "Reuters meldet einen Beschluss." }, { ...source, publisher_id: "other", source_id: "b" }, now);
  assert.equal(evidenceGroups([a, b]).possible_independent_origins, 1);
  assert.equal(evidenceGroups([item, { ...item, url: "https://example.org/second" }]).possible_independent_origins, 1);
  assert.equal(evidenceGroups([a, b]).independence_is_verified, false);
  assert.equal(a.agency_origin, "reuters");
  assert.equal(a.agency_origin_confidence, "high");
});
test("event stages and real locations remain distinct; publisher coverage is not event location", () => {
  assert.equal(eventCompatibility(item, { ...item, url: "https://other.example/a", geography: ["international"] }).same_event, true);
  assert.equal(eventCompatibility(item, { ...item, url: "https://example.org/b", title: "Bund plant Klimagesetz zur Energieversorgung" }).same_event, false);
  assert.equal(eventCompatibility({ ...item, event_geography: ["DE"] }, { ...item, url: "https://example.org/c", event_geography: ["FR"] }).same_event, false);
});
test("structured event facts join headline synonyms without joining a broad recurring topic", () => {
  const dw = { title: "Putin: Drei Tage Angriffspause während Ukraine-Verhandlungen", summary: "Die Ankündigung gilt nur für Kyjiw.", published_at: "2026-09-05T13:01:00Z" };
  const mdr = { title: "Ukraine-News: Putin verkündet dreitägigen Angriffsstopp auf Kiew", summary: "Putin kündigte an, drei Tage lang Kiew nicht anzugreifen.", published_at: "2026-09-05T13:53:00Z" };
  assert.deepEqual(eventCompatibility(dw, mdr), { same_event: true, related: true, reason: "structured_event_facts" });
  assert.equal(eventCompatibility(dw, { ...mdr, title: "Selenskyj besucht Kiew für neue Gespräche", summary: "Neue Verhandlungen in Kiew.", url: "https://example.org/other" }).same_event, false);
  assert.equal(eventCompatibility(dw, { ...mdr, title: "Putin verkündet zweitägigen Angriffsstopp auf Kiew", summary: "Zwei Tage Pause.", url: "https://example.org/two" }).same_event, false);
});
test("source health distinguishes stale content and missing publication dates from fetch failure", () => {
  assert.equal(sourceHealth(source, { source_status: { test: { last_success: now, latest_item: "2026-06-01" } } }, now).status, "stale_content");
  assert.equal(sourceHealth(source, { source_status: { test: { last_success: now } } }, now).content_warning, "NO_RELIABLE_PUBLICATION_DATE");
  assert.equal(sourceHealth({ ...source, enabled: false, access: { status: "pending" } }, {}, now).status, "pending");
});
test("freshness and follow-up dates schedule actual overdue work", () => {
  const story = { story_id: "s", first_seen: "2026-09-03T09:00:00Z", sources: [item], followups: [{ follow_up_date: "2026-09-03T10:00:00Z", status: "scheduled" }, { follow_up_date: "2026-09-01", status: "resolved" }] };
  assert.equal(freshnessFor(story, now).freshness_warning, "PUBLICATION_TARGET_EXCEEDED");
  assert.equal(dueFollowups([story], now).length, 1);
});
test("claim gate binds evidence to source identity, excerpt and numbers", () => {
  assert.deepEqual(validateNewsroomAnalysis(analysis, { sources: [item] }), []);
  const changed = structuredClone(analysis);
  changed.event_claims[0].claim = "Die Quelle nennt 99 Milliarden Euro.";
  assert.ok(validateNewsroomAnalysis(changed, { sources: [item] }).includes("CLAIM_NUMBER_NOT_IN_EVIDENCE"));
  changed.event_claims[0].evidence[0].url = "https://evil.example/";
  assert.ok(validateNewsroomAnalysis(changed, { sources: [item] }).includes("CLAIM_EVIDENCE_NOT_IN_SOURCE"));
});
test("long exact evidence is split without inventing text or weakening the source check", () => {
  const long = "Dies ist eine belegte Aussage im öffentlichen Quelltext. ".repeat(6).trim();
  const a = structuredClone(analysis); a.event_claims[0].evidence[0].excerpt = long;
  normalizeEvidenceExcerpts(a, { sources: [{ ...item, article_excerpt: long }] });
  assert.ok(a.event_claims[0].evidence.length > 1);
  assert.equal(a.event_claims[0].evidence.map((entry) => entry.excerpt).join(" "), long);
  assert.deepEqual(validateNewsroomAnalysis(a, { sources: [{ ...item, article_excerpt: long }] }), []);
});
test("evidence IDs resolve only known exact source passages and only downgrade unsupported certainty", () => {
  const media = { ...item, primary_source: false };
  const segments = sourceEvidenceSegments(media);
  const a = structuredClone(analysis);
  a.news_status = "confirmed";
  a.event_claims[0].evidence = [{ evidence_id: segments[1].evidence_id }];
  resolveEvidenceReferences(a, { sources: [media] });
  assert.equal(a.event_claims[0].evidence[0].excerpt, item.summary);
  assert.equal(a.event_claims[0].status, "single_source_claim");
  assert.equal(a.news_status, "preliminary");
  assert.deepEqual(validateNewsroomAnalysis(a, { sources: [media] }), []);
  a.event_claims[0].evidence = [{ evidence_id: "ev-invented" }];
  resolveEvidenceReferences(a, { sources: [media] });
  assert.ok(validateNewsroomAnalysis(a, { sources: [media] }).includes("CLAIM_EVIDENCE_NOT_IN_SOURCE"));
});
test("deepening uses the next Berlin checkpoint, never delays first publication", () => {
  assert.equal(nextDeepeningCheckpoint("2026-09-03T12:01:00Z"), "2026-09-03T14:00:00.000Z");
  assert.equal(nextDeepeningCheckpoint("2026-12-03T20:01:00Z"), "2026-12-04T06:00:00.000Z");
});
test("follow-up deadlines require a real excerpt, and media do not become primary by quoting officials", () => {
  const a = structuredClone(analysis);
  a.followups = [{ claim: "Die Regierung will die Umsetzung abschließen.", source_id: "test", expected_by: "2026-12-01", measurable_indicator: "Abschluss der Umsetzung" }];
  assert.ok(validateNewsroomAnalysis(a, { sources: [item] }).includes("FOLLOWUP_DATE_UNSUPPORTED"));
  a.followups[0].expected_by = null;
  assert.deepEqual(validateNewsroomAnalysis(a, { sources: [item] }), []);
  assert.ok(validateNewsroomAnalysis(a, { sources: [{ ...item, primary_source: false }] }).includes("CLAIM_PRIMARY_SOURCE_MISSING"));
  a.event_claims[0].status = "single_source_claim";
  assert.deepEqual(validateNewsroomAnalysis(a, { sources: [{ ...item, primary_source: false }] }), []);
});
test("public press-room HTML records keep per-article dates and do not read images", () => {
  const html = '<li class="article__item"><img data-src="https://image.example/a.jpg"><time datetime="2026-09-02"></time><h3 class="article__title"><a href="/release/">Studie</a></h3><p class="article__paragraph-text">Neue Daten</p></li>';
  const result = parseHtmlIndex(html, { ...source, html_layout: "pressroom_article_list", access: { html_index: true } });
  assert.equal(result[0].url, "https://example.org/release/"); assert.equal(result[0].published_at, "2026-09-02T00:00:00.000Z"); assert.equal(result[0].image, undefined);
});
test("Berlin press portal adapter reads only public table metadata", () => {
  const html = '<table><tr><th>Datum</th></tr><tr><td>04.09.2026</td><td><a href="/rbmskzl/aktuelles/pressemitteilungen/2026/pressemitteilung.1710705.php">Aktuelle Lage nach dem IKT-Vorfall im Landesnetz Berlin</a></td><td>Presse- und Informationsamt des Landes Berlin</td></tr></table>';
  const [result] = parseHtmlIndex(html, { ...source, url: "https://www.berlin.de/presse/", html_layout: "berlin_press_table", access: { html_index: true } });
  assert.equal(result.url, "https://www.berlin.de/rbmskzl/aktuelles/pressemitteilungen/2026/pressemitteilung.1710705.php");
  assert.equal(result.published_at, "2026-09-03T22:00:00.000Z");
  assert.equal(result.authority, "Presse- und Informationsamt des Landes Berlin");
  assert.equal(result.image, undefined);
});
test("Framer-Pressekarten werden über responsive Duplikate hinweg als eine Primärquelle gelesen", () => {
  const card = '<a href="./presse/umfrage-afd-regierung"><p>01/09/26</p><h2>Umfrage: AfD-Regierung und Nachwuchsjuristen</h2><p>Öffentliche Kurzbeschreibung der eigenen Umfrage.</p><p>Mehr erfahren</p></a>';
  const result = parseHtmlIndex(`${card}${card}`, { ...source, url: "https://www.jurafuchs.de/", html_layout: "framer_press_cards", access: { html_index: true } });
  assert.equal(result.length, 1);
  assert.equal(result[0].url, "https://www.jurafuchs.de/presse/umfrage-afd-regierung");
  assert.equal(result[0].published_at, "2026-09-01T06:00:00.000Z");
  assert.equal(result[0].summary, "Öffentliche Kurzbeschreibung der eigenen Umfrage.");
});
test("uncertain and single-origin claims cannot masquerade as confirmed", () => {
  const changed = structuredClone(analysis);
  changed.event_claims[0].status = "confirmed_claim";
  assert.ok(validateNewsroomAnalysis(changed, { sources: [item] }).includes("CLAIM_INDEPENDENCE_NOT_ESTABLISHED"));
  changed.event_claims[0].status = "single_source_claim";
  changed.news_status = "confirmed";
  assert.ok(validateNewsroomAnalysis(changed, { sources: [item] }).includes("CONFIRMED_STATUS_OVERCLAIM"));
  changed.event_claims[0].status = "primary_source_claim";
  assert.ok(validateNewsroomAnalysis(changed, { sources: [{ ...item, requires_corroboration: true }] }).includes("CLAIM_CRITICAL_SOURCE_UNCORROBORATED"));
});
test("25 EUR authorization retains tax and FX buffers; stale or invalid rates hold AI", () => {
  assert.equal(newsBudget({ rate_date: "2026-09-03", rate_usd_per_eur: 1.16 }, now).technical_limit_usd, 18.9);
  assert.ok(newsBudget({ rate_date: "2026-09-03", rate_usd_per_eur: 0.8 }, now).technical_limit_usd < 18.9);
  for (const fx of [null, { rate_date: "2026-08-01", rate_usd_per_eur: 1.16 }, { rate_date: "2026-09-04", rate_usd_per_eur: 1 }, { rate_date: "2026-09-03" }]) assert.equal(newsBudget(fx, now).technical_limit_usd, 0);
  assert.equal(newsBudget({ rate_date: "2026-09-03", rate_usd_per_eur: 1 }, now, 100).authorized_eur, 25);
});
test("actual usage is priced including cache and missing usage reserves conservatively", async () => {
  assert.equal(costFromUsage({ model: "gpt-5.4-mini", reported_usage: { input_tokens: 1000, output_tokens: 1000 } }, {}).estimated_cost_usd, 0.00525);
  assert.equal(costFromUsage({}, { estimated_cost_usd: 0.001 }).estimated_cost_usd, 0.25);
  assert.equal(costFromUsage({ cache_status: "hit" }, {}).estimated_cost_usd, 0);
  assert.equal(await refreshBudgetFx(null, now, async () => { throw new Error("offline"); }), null);
});
test("research API uses only open access, exposes DOI and does not pretend to review methodology", () => {
  const raw = JSON.stringify({ resultList: { result: [{ source: "MED", id: "123", title: "Climate health study", firstPublicationDate: "2026-09-02", isOpenAccess: "Y", doi: "10.1234/study", abstractText: "Observed association." }, { source: "MED", id: "456", title: "Closed study", isOpenAccess: "N" }] } });
  const records = parseResearchApi(raw, source);
  assert.equal(records.length, 1); assert.equal(records[0].research_metadata.doi, "10.1234/study");
  assert.match(records[0].research_metadata.verification_scope, /not a full/);
  assert.match(datedSource({ feed_url: "https://example.org/?from={since_date}&to={today}" }, now).feed_url, /2026-08-31.*2026-09-03/);
});
test("sitemap lastmod never substitutes for source publication time; HTML access must be explicit", () => {
  const [entry] = parseNewsSitemap('<urlset><url><loc>https://example.org/a</loc><news:title>News</news:title><lastmod>2026-09-03</lastmod></url></urlset>', source);
  assert.equal(entry.published_at, null);
  assert.throws(() => parseHtmlIndex('<html></html>', source), /NOT_AUTHORIZED/);
  const html = '<script type="application/ld+json">{"@type":"NewsArticle","headline":"News","url":"/a","datePublished":"2026-09-03"}</script>';
  assert.equal(parseHtmlIndex(html, { ...source, access: { html_index: true } })[0].published_at, "2026-09-03T00:00:00.000Z");
});

function fixture(overrides = {}) {
  return { dryRun: true, now, registry: { schema_version: "1.0", sources: [source], policy: {} }, state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: "4.0" }, storyStore: { stories: [] }, usage: { runs: [] }, newsroom: { source_items: {}, events: {}, event_sources: [], discovery_candidates: [] }, budgetFx: { rate_date: "2026-09-03", rate_usd_per_eur: 1.16 }, ...overrides };
}
test("all-source outage preserves successful cursor and reports degradation without throwing away state", async () => {
  let captured;
  const report = await runWirkungsticker(fixture({ state: { source_status: { test: { last_success: "2026-09-01T12:00:00Z" } }, seen_items: {}, pending_story_ids: [], relevance_filter_version: "4.0" }, fetchFeedImpl: async () => { throw new Error("HTTP_503"); }, fetchRetryDelayImpl: async () => {}, captureState: (value) => captured = value }));
  assert.equal(report.status, "degraded"); assert.equal(report.all_sources_failed, true);
  assert.equal(captured.state.source_status.test.last_success, "2026-09-01T12:00:00Z");
  assert.equal(captured.state.last_successful_run, undefined);
});
test("a restrictive robots change places the source on a renewable governance hold", async () => {
  let captured;
  const report = await runWirkungsticker(fixture({ fetchFeedImpl: async () => { throw new Error("ROBOTS_DISALLOWED"); }, captureState: (value) => captured = value }));
  assert.equal(report.source_failures, 1);
  assert.equal(captured.state.source_status.test.governance_hold_reason, "ROBOTS_DISALLOWED");
  assert.equal(captured.state.source_status.test.governance_hold_until, "2026-09-04T12:00:00.000Z");
  assert.equal(sourceHealth(source, captured.state, now).status, "governance_hold");
});
test("304 preserves latest content and a non-due source makes no network request", async () => {
  let calls = 0, captured;
  const prior = { last_success: "2026-09-03T11:00:00Z", latest_item: "2026-09-03T10:00:00Z", items: 5 };
  const state = { source_status: { test: prior }, seen_items: {}, pending_story_ids: [], relevance_filter_version: "4.0" };
  const report = await runWirkungsticker(fixture({ state, fetchFeedImpl: async () => { calls++; return { not_modified: true, final_url: source.feed_url }; }, captureState: (value) => captured = value }));
  assert.equal(report.sources_not_modified, 1); assert.equal(captured.state.source_status.test.items, 5); assert.equal(captured.state.source_status.test.latest_item, prior.latest_item);
  await runWirkungsticker(fixture({ state: captured.state, fetchFeedImpl: async () => { calls++; throw new Error("Must not fetch"); } }));
  assert.equal(calls, 1);
});
test("an unchanged feed item is discarded before clustering, AI cost and publication", async () => {
  const rss = `<rss><channel><item><title>${item.title}</title><link>${item.url}</link><description>${item.summary}</description><pubDate>Thu, 03 Sep 2026 12:00:00 GMT</pubDate></item></channel></rss>`;
  const seen = parseFeed(rss, source)[0];
  let aiCalls = 0, captured;
  const state = {
    source_status: {},
    seen_items: { [seen.item_id]: { source_id: seen.source_id, url: seen.url, content_hash: seen.content_hash, published_at: seen.published_at, last_seen: "2026-09-03T11:00:00.000Z" } },
    pending_story_ids: [],
    relevance_filter_version: "4.0",
  };
  const report = await runWirkungsticker(fixture({
    state,
    fetchFeedImpl: async () => ({ body: rss, final_url: source.feed_url }),
    callAiImpl: async () => { aiCalls += 1; throw new Error("AI must not receive a duplicate"); },
    captureState: (value) => { captured = value; },
  }));
  assert.equal(report.feed_entries_deduplicated, 1);
  assert.equal(report.story_clusters, 0);
  assert.equal(report.ai_stories, 0);
  assert.equal(report.ai_calls, 0);
  assert.equal(report.estimated_cost_usd, 0);
  assert.equal(report.public_changed, false);
  assert.equal(aiCalls, 0);
  assert.deepEqual(captured.storyStore.stories, []);
});
test("outage recovery uses the source cursor, not a newer global run cursor", async () => {
  const state = { last_successful_run: now, source_status: { test: { last_success: "2026-09-01T00:00:00Z" } }, seen_items: {}, pending_story_ids: [], relevance_filter_version: "4.0" };
  const rss = `<rss><channel><item><title>${item.title}</title><link>${item.url}</link><description>${item.summary}</description><pubDate>Wed, 02 Sep 2026 10:00:00 GMT</pubDate></item></channel></rss>`;
  const report = await runWirkungsticker(fixture({ state, fetchFeedImpl: async () => ({ body: rss, final_url: source.feed_url }), callAiImpl: async (stories) => ({ analyses: stories.map((story) => ({ story_id: story.story_id, publication_recommendation: false, rejection: { code: "insufficient_evidence", reason: "Der verfügbare Kurztext belegt den konkreten Nachrichtenkern noch nicht ausreichend." } })), model: "gpt-5.4-mini", reported_usage: { input_tokens: 100, output_tokens: 50 } }) }));
  assert.equal(report.feed_entries_new, 1); assert.equal(report.published_stories, 0); assert.equal(report.ai_batches_completed, 1);
});
