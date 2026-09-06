import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { regionalCoverage } from "../../scripts/news/regional-coverage.mjs";
import { loadNewsRegistry, registryErrors } from "../../scripts/news/registry.mjs";
import { regionalCoverageSection } from "../../scripts/news/source-pages.mjs";
import { parseHtmlIndex } from "../../scripts/news/source-adapters.mjs";
import { classifyItem, parseFeed } from "../../scripts/news/lib.mjs";
import { annotateSourceItem, sourceDue } from "../../scripts/news/newsroom.mjs";

const registry = loadNewsRegistry(fileURLToPath(new URL("../../", import.meta.url)));
const now = "2026-09-06T10:00:00Z";
const healthyState = { source_status: Object.fromEntries(registry.sources.map(source => [source.source_id, { last_success: now, latest_item: now }])) };

test("all 16 states are explicit; national DE and adjacent broadcasting regions do not close gaps", () => {
  const result = regionalCoverage(registry, healthyState, now);
  assert.equal(result.rows.length, 16);
  assert.equal(new Set(result.rows.map(row => row.code)).size, 16);
  assert.equal(result.configured_states, 15);
  assert.equal(result.healthy_states, 15);
  assert.equal(result.journalistic_states, 13);
  assert.deepEqual(result.missing_states, ["DE-SL"]);
  assert.equal(result.rows.find(row => row.code === "DE-HB").sources.some(source => source.source_id === "ndr-info"), false);
  assert.equal(result.rows.find(row => row.code === "DE-SL").sources.some(source => source.source_id === "swr-aktuell"), false);
  const national = { ...registry.sources.find(source => source.source_id === "ndr-info"), federal_states: undefined, geography: ["DE"] };
  assert.equal(regionalCoverage({ sources: [national] }, healthyState, now).configured_states, 0);
});

test("fresh fetch, missing first run, stale fetch, governance hold and disabled source remain distinct", () => {
  const source = registry.sources.find(source => source.source_id === "bayern-landesregierung-presse");
  const run = status => regionalCoverage({ sources: [source] }, { source_status: { [source.source_id]: status } }, now).rows.find(row => row.code === "DE-BY");
  assert.equal(run({}).status, "awaiting_first_run");
  assert.equal(run({ last_success: now, latest_item: now }).status, "monitored");
  assert.equal(run({ last_success: "2026-09-05T01:00:00Z" }).status, "degraded");
  assert.equal(run({ last_success: now, governance_hold_until: "2026-09-07T00:00:00Z" }).status, "degraded");
  assert.equal(regionalCoverage({ sources: [{ ...source, enabled: false }] }, healthyState, now).configured_states, 0);
  assert.equal(regionalCoverage({ sources: [{ ...source, legal_use_status: "open" }] }, healthyState, now).configured_states, 0);
});

test("official fallback is not independent journalism and remains bounded hourly trial", () => {
  for (const id of ["bayern-landesregierung-presse", "bremen-senat-presse"]) {
    const source = registry.sources.find(source => source.source_id === id);
    assert.equal(source.trial_mode, true);
    assert.equal(source.poll_minutes, 60);
    assert.equal(source.primary_source, true);
    assert.equal(source.access.article, "metadata_only");
    assert.equal(sourceDue(source, {}, now), true);
    assert.equal(sourceDue(source, { last_attempt: "2026-09-06T09:30:00Z" }, now), false);
    const row = regionalCoverage({ sources: [source] }, healthyState, now).rows.find(row => row.configured);
    assert.equal(row.journalistic_source_healthy, false);
  }
  assert.equal(registry.sources.find(source => source.source_id === "br24-access").enabled, false);
});

test("registry rejects invalid or duplicated state assignments", () => {
  const source = registry.sources[0];
  assert.ok(registryErrors({ sources: [{ ...source, federal_states: ["DE"] }] }).some(error => error.startsWith("SOURCE_FEDERAL_STATES_INVALID")));
  assert.ok(registryErrors({ sources: [{ ...source, federal_states: ["DE-BY", "DE-BY"] }] }).some(error => error.startsWith("SOURCE_FEDERAL_STATES_INVALID")));
});

test("public regional overview lists every state and visibly marks official-only and missing access", () => {
  const html = regionalCoverageSection(registry, healthyState, now, value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;"));
  assert.equal((html.match(/data-federal-state=/g) || []).length, 16);
  assert.match(html, /amtliche Grundabdeckung/);
  assert.match(html, /Regionaler Zugang noch offen/);
  assert.match(html, /unabhängiger Regionalzugang noch offen/);
  assert.match(html, /href="bremen-senat\/"/);
});

test("Bremen adapter reads only dated press table metadata, decodes links, and rejects foreign or invalid rows", () => {
  const source = registry.sources.find(source => source.source_id === "bremen-senat-presse");
  const row = (day, url) => `<tr><td>${day}</td><td><a href="${url}">Klinikfinanzierung beschlossen</a></td><td>Gesundheitsressort</td></tr>`;
  const valid = row("04.09.2026", "detail.php?gsid=bremen146.c.123.de&amp;asl=bremen02.c.732.de");
  const html = `<a href="/photos">Foto</a><table class="bildboxtable">${valid}${valid}${row("31.02.2026", "detail.php?gsid=bremen146.c.124.de")}${row("04.09.2026", "https://other.example/detail.php?gsid=bremen146.c.125.de")}</table>`;
  const items = parseHtmlIndex(html, source);
  assert.equal(items.length, 1);
  assert.equal(items[0].url, "https://www.senatspressestelle.bremen.de/detail.php?gsid=bremen146.c.123.de&asl=bremen02.c.732.de");
  assert.equal(items[0].published_at, "2026-09-04T00:00:00.000Z");
  assert.equal(items[0].published_precision, "day");
  assert.equal(items[0].authority, "Gesundheitsressort");
  assert.equal(items[0].summary, "");
  assert.equal(items[0].image, undefined);
  assert.throws(() => parseHtmlIndex("<html>Changed layout</html>", source), /SCHEMA_CHANGED/);
  assert.throws(() => parseHtmlIndex(html, { ...source, access: {} }), /NOT_AUTHORIZED/);
});

test("regional prefilter rejects ceremonies but preserves material announcements and systemic incidents", () => {
  const source = registry.sources.find(source => source.source_id === "bayern-landesregierung-presse");
  for (const title of ["Sommerfest: Minister besucht Gesundheitszentrum", "Einladung zum Empfang für Wirtschaft und Pflege", "Bundesverdienstkreuz für ehrenamtliche Arbeit"]) {
    const item = annotateSourceItem({ title, summary: "", url: "https://www.bayern.de/test" }, source, now);
    assert.equal(item.selection_profile, "regional_materiality");
    assert.ok(classifyItem(item, item, now).score < 30, title);
  }
  for (const title of ["Beim Empfang: Land beschließt neues Förderprogramm für Pflege und Schulen", "Cyberangriff auf Stromversorgung und kritische Infrastruktur", "Minister besucht Klinik: Insolvenz gefährdet Gesundheitsversorgung von tausend Patienten", "Land verabschiedet Klimagesetz für kritische Infrastruktur"]) {
    assert.ok(classifyItem({ title }, source, now).score >= 30, title);
  }
});

test("Bayern RSS reuses bounded parser, keeps provenance and never stores an article-length feed body", () => {
  const source = registry.sources.find(source => source.source_id === "bayern-landesregierung-presse");
  const [item] = parseFeed(`<rss><channel><item><title>Pflegeprogramm</title><link>https://www.bayern.de/pflegeprogramm/</link><description>${"Rechercheauszug ".repeat(300)}</description><pubDate>Sun, 6 Sep 2026 05:58:03 +0100</pubDate></item></channel></rss>`, source);
  assert.equal(item.primary_source, true);
  assert.ok(item.summary.length <= 1600);
  assert.equal(item.published_at, "2026-09-06T04:58:03.000Z");
});
