import test from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeVisuals, renderDimensionMeters, renderStatusTrack, renderImpactPath, renderAtAGlance, renderKeyFigures,
  renderChart, renderTimeline, renderAffectedGroups, renderIconSprite, renderIcon, topicIcon, relevanceLevel, publisherInitials,
  VISUALS_SCHEMA, VISUALS_PROMPT_RULES,
} from "../../scripts/news/visuals.mjs";

function story(overrides = {}) {
  return {
    story_id: "wt-test",
    slug: "test-akte",
    title: "Kapazitätsmechanismus genehmigt",
    topic: ["Energie", "Europa"],
    current_version: 2,
    last_updated: "2026-09-03T13:15:00.000Z",
    sources: [{
      source_id: "eu-kommission", publisher: "Europäische Kommission", primary_source: true, published_at: "2026-09-02T08:00:00.000Z",
      url: "https://ec.europa.eu/example",
      title: "Kommission genehmigt Kapazitätsmechanismus von bis zu 35,2 Mrd. EUR",
      summary: "Der Mechanismus umfasst 15,6 Mrd. EUR bis 35,2 Mrd. EUR und läuft ab Januar 2027 bis 2035. Zehn Millionen Euro sind für Prüfungen vorgesehen.",
    }],
    claims: [{ claim_id: "wt-test-claim-01", source_id: "eu-kommission", claim: "Die Kommission hat einen Kapazitätsmechanismus von bis zu 35,2 Mrd. EUR genehmigt." }, { claim_id: "timeline-start", source_id: "eu-kommission", claim: "Start ist Januar 2027." }, { claim_id: "timeline-end", source_id: "eu-kommission", claim: "Ende ist 2035." }, { claim_id: "pruefmittel", source_id: "eu-kommission", claim: "Prüfmittel: zehn Millionen Euro." }],
    analysis: {
      summary: "Die Kommission hat genehmigt. Wirkung ist offen.",
      status: "beschlossen", analysis_type: "ex_ante", importance: "hoch",
      human: { relevance: "hoch", rationale: "Versorgungssicherheit betrifft Haushalte." },
      planet: { relevance: "mittel", rationale: "Speicher können helfen." },
      democracy: { relevance: "offen", rationale: "Kontrolle bleibt zu prüfen." },
      mechanisms: ["Kapitalflüsse ändern sich"], first_order: ["Genehmigung als Output"], second_order: ["Investitionen möglich"], third_order: ["Systemumbau möglich"],
      publication_gate: { news_value: "binding_decision", materiality_factors: ["affected_scope", "systemic_relevance"], exceptional_factor: "none", evidence_basis: "primary_source_direct" },
    },
    versions: [{ version: 1, analyzed_at: "2026-09-02T10:00:00.000Z", analysis: { analysis_type: "ex_ante" } }],
    ...overrides,
  };
}

test("sanitizeVisuals akzeptiert nur quellengebundene Zahlen, Termine und Gruppen", () => {
  const { visuals, dropped } = sanitizeVisuals({
    key_figures: [
      { label: "Obergrenze", value: "35,2", unit: "Mrd. EUR", context: "Genehmigter Rahmen", claim_id: "wt-test-claim-01" },
      { label: "Erfunden", value: "99", unit: "Mrd. EUR", context: "steht nicht in der Quelle" },
      { label: "Prüfmittel", value: "zehn Millionen", unit: "Euro", context: "als Zahlwort in der Quelle" },
      { label: "Label mit fremder Zahl 42", value: "15,6", unit: "Mrd. EUR", context: "" },
    ],
    affected_groups: ["haushalte", "unternehmen", "aliens", "haushalte"],
    timeline: [{ date: "2027-01", label: "Start" }, { date: "2035", label: "Ende" }, { date: "2040", label: "nicht belegt" }, { date: "irgendwann", label: "x" }],
    tendency: { human: "chance", planet: "unsinn", democracy: "offen" },
    chart: { type: "bar", title: "Rahmen in Mrd. EUR", unit: "Mrd. EUR", points: [{ label: "Minimum", value: 15.6 }, { label: "Maximum", value: 35.2 }, { label: "Prüfung", value: 0.01 }] },
  }, story());
  assert.equal(visuals.key_figures.length, 2);
  assert.equal(visuals.key_figures[0].value, "35,2");
  assert.equal(visuals.key_figures[0].claim_id, "wt-test-claim-01");
  assert.equal(visuals.key_figures[1].value, "zehn Millionen");
  assert.deepEqual(visuals.affected_groups, ["haushalte", "unternehmen"]);
  assert.deepEqual(visuals.timeline.map((entry) => entry.date), ["2027-01", "2035"]);
  assert.deepEqual(visuals.tendency, { human: "chance", planet: "offen", democracy: "offen" });
  assert.equal(visuals.chart, undefined, "Diagramm mit unbelegtem Punkt fällt unter das Minimum und wird verworfen");
  assert.ok(dropped.some((reason) => reason.startsWith("KEY_FIGURE_UNSUPPORTED:99")));
  assert.ok(dropped.some((reason) => reason.startsWith("TIMELINE_UNSUPPORTED:2040")));
  assert.ok(dropped.includes("AFFECTED_GROUP_INVALID:aliens"));
  assert.ok(dropped.includes("CHART_INVALID"));
});

test("sanitizeVisuals blockiert nie und entfernt HTML", () => {
  assert.deepEqual(sanitizeVisuals(undefined, story()), { visuals: null, dropped: [] });
  assert.deepEqual(sanitizeVisuals("kaputt", story()), { visuals: null, dropped: ["VISUALS_NOT_OBJECT"] });
  const { visuals } = sanitizeVisuals({ key_figures: [{ label: "<b>Obergrenze</b>", value: "35,2", unit: "Mrd. EUR", context: "<script>x</script>" }] }, story());
  assert.equal(visuals.key_figures[0].label, "Obergrenze");
  assert.equal(visuals.key_figures[0].context, "x");
  assert.equal(sanitizeVisuals({ tendency: { human: "offen", planet: "offen", democracy: "offen" } }, story()).visuals, null);
});

function comparableChart() {
  const item = story();
  const points = [["2022", 15.6], ["2023", 35.2], ["2024", 38.4]].map(([label, value], index) => {
    const evidence_quote = `Investitionen ${label}: ${String(value).replace(".", ",")} Milliarden Euro.`;
    const claim_id = `chart-claim-${index}`;
    item.claims.push({ claim_id, claim: evidence_quote, source_id: "eu-kommission" });
    return { label, value, claim_id, evidence_quote };
  });
  return { item, chart: { type: "bar", title: "Investitionen im Vergleich", measure: "Investitionen", unit: "Mrd. EUR", points } };
}

test("Diagramm mit vergleichbarer Messgröße, Kategorie, Einheit und drei konkreten Belegen", () => {
  const { item, chart } = comparableChart();
  const { visuals, dropped } = sanitizeVisuals({ chart }, item);
  assert.deepEqual(dropped, []);
  assert.equal(visuals.chart.points.length, 3);
  const svg = renderChart(visuals);
  assert.match(svg, /<svg viewBox="0 0 640/);
  assert.match(svg, /35,2 Mrd\. EUR/);
  assert.match(svg, /<table>/);
  assert.deepEqual(sanitizeVisuals(visuals, item), { visuals, dropped: [] }, "erneuter Build erhält gültige Belegbindungen");
});

test("Jahreszahlen und bloßes Zahlenvorkommen sind keine Diagrammbelege", () => {
  const { visuals, dropped } = sanitizeVisuals({ chart: { type: "bar", title: "Rahmen", unit: "Mrd. EUR", points: [{ label: "Minimum", value: 15.6 }, { label: "Maximum", value: 35.2 }, { label: "Jahr", value: 2035 }] } }, story());
  assert.equal(visuals, null);
  assert.ok(dropped.includes("CHART_INVALID"));
});

for (const [name, change] of [
  ["fehlende konkrete Einheit", ({ chart }) => { chart.unit = "Einheit"; }],
  ["andere Größenordnung", ({ chart }) => { chart.unit = "Mio. EUR"; }],
  ["andere Messgröße", ({ chart }) => { chart.measure = "Rohstoffwert"; }],
  ["vertauschte Kategorien", ({ chart }) => { [chart.points[0].label, chart.points[1].label] = [chart.points[1].label, chart.points[0].label]; }],
  ["unbekannter Claim", ({ chart }) => { chart.points[0].claim_id = "andere-story"; }],
  ["fehlender Einzelbeleg", ({ chart }) => { delete chart.points[0].evidence_quote; }],
  ["erfundener Belegausschnitt", ({ chart }) => { chart.points[0].evidence_quote += " Erfunden."; }],
  ["Claim ohne zugehörige Quelle", ({ item }) => { item.claims.at(-3).source_id = "andere-story"; }],
  ["gemischte Einheiten", ({ item, chart }) => { chart.points[0].evidence_quote = item.claims.at(-3).claim = "Investitionen 2022: 15,6 Millionen Tonnen."; }],
  ["fehlender dritter Punkt", ({ chart }) => { chart.points.pop(); }],
  ["doppelte Kategorie", ({ chart }) => { chart.points[1] = { ...chart.points[0] }; }],
  ["Sammelzitat statt eindeutiger Zuordnung", ({ item, chart }) => {
    const quote = chart.points.map((point) => point.evidence_quote).join(" ");
    item.claims.at(-3).claim = quote;
    chart.points.forEach((point) => { point.evidence_quote = quote; point.claim_id = item.claims.at(-3).claim_id; });
  }],
]) {
  test(`Diagrammgate verwirft ${name}, behält andere visuelle Anker`, () => {
    const fixture = comparableChart();
    change(fixture);
    const { visuals, dropped } = sanitizeVisuals({ chart: fixture.chart, affected_groups: ["haushalte"] }, fixture.item);
    assert.equal(visuals.chart, undefined);
    assert.deepEqual(visuals.affected_groups, ["haushalte"]);
    assert.ok(dropped.includes("CHART_INVALID"));
  });
}

test("deterministische Anker aus dem Analyse-Schema", () => {
  const meters = renderDimensionMeters(story().analysis, { compact: true });
  assert.match(meters, /wt-dim--human" data-level="3"/);
  assert.match(meters, /wt-dim--democracy" data-level="0"/);
  assert.match(meters, /wt-meter--open/);
  assert.match(meters, /sr-only/);
  assert.equal((meters.match(/is-filled/g) || []).length, 5);
  assert.match(renderStatusTrack("beschlossen"), /is-current"[^>]*aria-current="step"[^>]*><span class="wt-track__dot"><\/span><span class="wt-track__label">Beschlossen/);
  assert.match(renderStatusTrack("laufende Entwicklung"), /wt-track--open/);
  const path = renderImpactPath(story().analysis);
  assert.match(path, /Erste Ordnung – unmittelbar/);
  assert.match(path, /data-order="3"/);
  const glance = renderAtAGlance(story(), { formatDate: (value) => String(value) });
  assert.match(glance, /1 Primärquelle/);
  assert.match(glance, /Betroffenenkreis/);
  assert.match(glance, /Verbindliche Entscheidung/);
  assert.match(glance, /Primärquelle direkt/);
  assert.equal(topicIcon(["Unbekannt", "Energie"]), "energie");
  assert.equal(topicIcon([]), "meldung");
  assert.equal(relevanceLevel("sehr hoch"), 4);
  assert.equal(publisherInitials("Bundesregierung kompakt"), "BK");
  assert.match(renderIconSprite(), /<symbol id="wt-i-mensch"/);
  assert.match(renderIcon("nicht-vorhanden"), /#wt-i-meldung/);
});

test("KI-Visuals werden nur gerendert, wenn vorhanden", () => {
  assert.equal(renderKeyFigures(null, story()), "");
  assert.equal(renderTimeline(null), "");
  assert.equal(renderAffectedGroups(null), "");
  const { visuals } = sanitizeVisuals({ key_figures: [{ label: "Obergrenze", value: "35,2", unit: "Mrd. EUR", context: "", claim_id: "wt-test-claim-01" }], affected_groups: ["haushalte"], timeline: [{ date: "2027-01", label: "Start" }] }, story());
  assert.match(renderKeyFigures(visuals, story()), /laut Europäische Kommission/);
  assert.match(renderAffectedGroups(visuals), /Haushalte/);
  assert.match(renderTimeline(visuals), /datetime="2027-01">Januar 2027/);
});

test("Prompt-Bausteine sind vorhanden", () => {
  assert.ok(VISUALS_SCHEMA.key_figures && VISUALS_SCHEMA.tendency && VISUALS_SCHEMA.chart);
  assert.ok(VISUALS_PROMPT_RULES.join(" ").includes("Zahlwort bleibt Zahlwort"));
});

test("Kennzahl mit veralteter Claim-ID wird nur bei eindeutigem aktuellem Beleg neu gebunden", () => {
  const item = story();
  const input = { key_figures: [{ label: "Rahmen", value: "35,2", unit: "Mrd. EUR", claim_id: "alte-version" }] };
  const result = sanitizeVisuals(input, item);
  assert.equal(result.visuals.key_figures[0].claim_id, "wt-test-claim-01");
  item.claims.push({ ...item.claims[0], claim_id: "zweiter-claim" });
  assert.equal(sanitizeVisuals(input, item).visuals, null, "keine willkürliche Zuordnung bei mehreren Treffern");
});

test("Kennzahlen koppeln Wert und Einheit; Termine koppeln Datum und Ereignis", () => {
  const item = story();
  assert.equal(sanitizeVisuals({ key_figures: [{ label: "Rahmen", value: "35,2", unit: "Millionen Euro", claim_id: "wt-test-claim-01" }] }, item).visuals, null);
  assert.equal(sanitizeVisuals({ timeline: [{ label: "Ende", date: "2027-01" }] }, item).visuals, null);
  assert.equal(sanitizeVisuals({ timeline: [{ label: "Start", date: "2027-02-31" }] }, item).visuals, null);
});
