import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildAnalysisPrompt } from "../../scripts/news/lib.mjs";
import { backfillMediaImpact } from "../../scripts/news/backfill-media-impact.mjs";
import { MEDIA_ANALYSIS_VERSION, applySelfFrameRewrites, detectMediaImpactTrigger, mediaImpactValidationErrors, sanitizeMediaImpact } from "../../scripts/news/media-impact.mjs";
import { storyPage } from "../../scripts/news/build.mjs";

const source = (title, summary = title, extra = {}) => ({ source_id: "medium-a", publisher: "Testmedium", title, summary, url: "https://example.org/a", published_at: "2026-09-05T06:00:00Z", ...extra });
const story = (title, summary = title, sources = [source(title, summary)]) => ({ story_id: "wt-media-test", title, source_summary: `${summary}\n\nWeitere Einzelheiten bleiben offen.`, sources, claims: [{ claim_id: "c1", source_id: sources[0].source_id, claim: summary }], analysis: { summary, detail_summary: summary } });

function validMedia(overrides = {}) {
  return {
    relevant: true, relevance_level: "high", reason: "Eine politisch aufgeladene Bezeichnung steht prominent in der Vermittlung.",
    factual_core: "Nach Sabotageversuchen an Umspannwerken laufen Ermittlungen zu Tätern und Motiv weiter.",
    speaker_statement: { present: true, speaker: "Bundesinnenminister", statement: "Der Minister verwendet eine politische Bezeichnung für die mutmaßliche Motivation.", status: "interpretation" },
    framing: { detected: true, term: "Klimaextremismus", origin_in_story: "Bundesinnenminister", media_usage: "headline", attribution_quality: "eindeutig attribuiert", factual_status: "Aussage eines Akteurs", frame_type: ["Bedrohung", "Polarisierung"], political_history_relevant: false, political_history: "", political_history_evidence: [] },
    resonance: { resonance_space: "Die Verbindung kann unter bestimmten Bedingungen einen politischen Resonanzraum öffnen.", resonance_risk: "Die Wiederholung kann ein Zuordnungsrisiko verstärken.", normalization_potential: "Eine Normalisierung ist möglich, aber nicht belegt.", repetition_effect: "Wiederholung kann die Verfügbarkeit der Bezeichnung erhöhen.", trust_effect: "Eine Vertrauenswirkung bleibt offen.", polarization_potential: "Polarisierung ist ein mögliches Risiko.", discourse_effect: "Die Formulierung kann die Debatte verengen." },
    impact_path: { first_order: "Der Begriff wird mit dem Ereignis verbunden.", second_order: "Wiederholung kann Deutungsmuster verstärken.", third_order: "Diskursnormen könnten sich bei großer Wiederholung verändern." },
    evidence: { status: "medium", what_is_known: "Belegt sind Ereignis, Zitat und Platzierung.", what_is_inferred: "Der mögliche Resonanzpfad ist eine analytische Inferenz.", what_is_open: "Eine eingetretene gesellschaftliche Wirkung ist nicht belegt." },
    editorial_assessment: "Unabhängig von der Absicht besitzt die prominente Platzierung kommunikatives Wirkungspotenzial.",
    fact_first_reframe: { title: "Ermittlungen nach Sabotageversuchen an Umspannwerken dauern an", source_summary: "Nach Sabotageversuchen an deutschen Umspannwerken laufen Ermittlungen zu Tätern und Motiv weiter. Nach dem verfügbaren Bericht geht die Polizei derzeit von einem Einzeltäter aus; die Fahndung nach einem Verdächtigen dauert an. Außerdem wird ein Einsatz am Hambacher Forst beschrieben, bei dem Spezialkräfte einen auffälligen Lastwagen kontrollierten, die gesuchte Person jedoch nicht antrafen.\n\nBundesinnenminister Dobrindt verwendet für die mutmaßliche Motivation eine politisch aufgeladene Bezeichnung. Der Bericht nennt weitere Vorfälle in Brandenburg, Nordrhein-Westfalen und Sachsen sowie Funde von Spreng- oder Brandvorrichtungen in der Nähe von Umspannwerken. Ob die Ereignisse zusammenhängen, wer dafür verantwortlich ist und welches Motiv zugrunde liegt, ist nach dem vorliegenden Quellenstand nicht abschließend amtlich festgestellt. Umspannwerke zählen zur kritischen Infrastruktur.", summary: "Nach Sabotageversuchen laufen Ermittlungen; Täter und Motiv sind nicht abschließend geklärt. Die politische Bezeichnung wird dem Minister zugeschrieben.", detail_summary: "Nach Sabotageversuchen an Umspannwerken laufen die Ermittlungen weiter. Täter und Motiv sind nicht abschließend geklärt. Die politische Bezeichnung wird dem Minister zugeschrieben. Mögliche kommunikative Folgen bleiben analytische Inferenz. Eine gesellschaftlich eingetretene Wirkung ist nicht belegt." },
    self_frame_warning: true, source_comparison: { sufficient_basis: false, finding: "" }, ...overrides,
  };
}

test("neutrales Ereignis löst keinen Mediencheck aus", () => {
  assert.equal(detectMediaImpactTrigger(story("Bund veröffentlicht Monatsbericht", "Der Bericht enthält neue Daten zur Verwaltung.")).relevant, false);
});

test("englischsprachige politisch aufgeladene Meldungen nutzen dieselbe Vorprüfung", () => {
  assert.equal(detectMediaImpactTrigger(story("Minister calls protesters extremists", "The investigation is ongoing and the motive remains unknown.")).relevant, true);
});

test("sauber attribuiertes politisches Zitat bleibt Akteursaussage", () => {
  const item = story("Minister bezeichnet Sabotage als Klimaextremismus", "Der Minister verwendet den Begriff; die Ermittlungen dauern an.");
  const trigger = detectMediaImpactTrigger(item);
  assert.equal(trigger.relevant, true);
  const media = sanitizeMediaImpact(validMedia(), item, trigger).media_impact;
  assert.equal(media.speaker_statement.status, "interpretation");
  assert.equal(media.framing.attribution_quality, "eindeutig attribuiert");
});

test("politischer Begriff ohne Attribution erhält höhere Warnsignale", () => {
  const attributed = detectMediaImpactTrigger(story("Minister bezeichnet Sabotage als Klimaextremismus"));
  const unattributed = detectMediaImpactTrigger(story("Klimaextremismus bedroht die Stromversorgung"));
  assert.ok(unattributed.score > attributed.score);
  assert.ok(unattributed.reasons.includes("loaded_headline_without_clear_attribution"));
});

test("unklarer Ermittlungsstand wird als Auslassungssignal erkannt", () => {
  const trigger = detectMediaImpactTrigger(story("Täter verantwortlich für Angriff", "Die Ermittlungen laufen; Täter und Motiv sind noch unklar."));
  assert.ok(trigger.reasons.includes("uncertain_status_omitted_in_headline"));
});

test("eigene Überschrift beginnt nach Self-Frame-Rewrite mit dem Sachverhalt", () => {
  const item = story("Klimaextremismus bedroht Deutschland");
  const analysis = { source_summary: "Bundesinnenminister Dobrindt bezeichnet die Sabotageversuche als Klimaextremismus.", summary: "Klimaextremismus bedroht die Versorgung. Die Wirkung bleibt offen.", detail_summary: "Klimaextremismus bedroht die Versorgung. Weitere Fakten bleiben offen.", media_impact: validMedia() };
  const report = {};
  applySelfFrameRewrites(analysis, item, report);
  assert.match(item.title, /^Ermittlungen nach Sabotageversuchen/);
  assert.match(analysis.source_summary, /^Nach Sabotageversuchen/);
  assert.equal(report.self_frame_rewrites, 4);
});

test("korrekt attribuierter, aber akteurszentrierter Einstieg wird sachverhaltszentriert", () => {
  const item = story("Anschläge auf Umspannwerke – Dobrindt geht von Klimaextremismus aus");
  const analysis = { source_summary: "Bundesinnenminister Dobrindt hat die Sabotageversuche als Klimaextremismus bezeichnet.", summary: "Dobrindt ordnet die Sabotageversuche als Klimaextremismus ein.", detail_summary: "Nach den Sabotageversuchen laufen die Ermittlungen weiter.", media_impact: validMedia() };
  applySelfFrameRewrites(analysis, item, {});
  assert.match(analysis.source_summary, /^Nach Sabotageversuchen/);
  assert.match(analysis.summary, /^Nach Sabotageversuchen/);
  assert.match(item.title, /^Anschläge auf Umspannwerke/);
});

for (const [label, title] of [
  ["ideologisch linker Frame", "Aktivisten sprechen von Profitgier der Konzerne"],
  ["ideologisch rechter Frame", "Partei warnt vor linksgrüner Öko-Diktatur"],
  ["Regierungsframe", "Minister bezeichnet Protest als Klimaextremismus"],
  ["wirtschaftlicher Lobbyframe", "Verband warnt vor Jobvernichtung durch die Reform"],
]) test(`${label} nutzt dieselbe symmetrische Triggerlogik`, () => assert.equal(detectMediaImpactTrigger(story(title)).relevant, true));

test("fehlende Evidenz entfernt eine behauptete politische Herkunft", () => {
  const item = story("Klimaextremismus bedroht die Stromversorgung");
  const result = sanitizeMediaImpact(validMedia({ framing: { ...validMedia().framing, political_history_relevant: true, political_history: "Seit Jahren einer Strömung zuzurechnen.", political_history_evidence: ["https://unknown.example/history"] } }), item);
  assert.equal(result.media_impact.framing.political_history_relevant, false);
  assert.equal(result.media_impact.framing.political_history, "");
  assert.ok(result.dropped.includes("MEDIA_HISTORY_EVIDENCE_UNAVAILABLE"));
});

test("bekannte Verwendungsgeschichte bleibt nur mit gelieferter Quellenreferenz", () => {
  const item = story("Klimaextremismus bedroht die Stromversorgung");
  const media = validMedia({ framing: { ...validMedia().framing, political_history_relevant: true, political_history: "Die Verwendung ist in der gelieferten Originalaussage dokumentiert.", political_history_evidence: ["https://example.org/a"] } });
  const result = sanitizeMediaImpact(media, item);
  assert.equal(result.media_impact.framing.political_history_relevant, true);
  assert.deepEqual(result.media_impact.framing.political_history_evidence, ["https://example.org/a"]);
});

test("direkte und indirekte Zitate werden als prominente Akteursaussagen erkannt", () => {
  assert.ok(detectMediaImpactTrigger(story("Minister: „Klimaextremismus bedroht uns“")).relevant);
  assert.ok(detectMediaImpactTrigger(story("Minister bezeichnet Sabotage als Klimaextremismus")).relevant);
});

test("stärkere Überschrift als Teaser wird erkannt", () => {
  const trigger = detectMediaImpactTrigger(story("Klimaextremismus bedroht Deutschland", "Die Ermittlungen zu einer Sabotage dauern an."));
  assert.ok(trigger.reasons.includes("headline_body_gap"));
});

test("Self-Frame-Gate sperrt unsichere eigene Formulierung", () => {
  const item = story("Klimaextremismus bedroht Deutschland");
  const analysis = { media_analysis_version: MEDIA_ANALYSIS_VERSION, media_impact: validMedia(), source_summary: item.source_summary, summary: "Sachverhalt bleibt offen. Weitere Prüfung läuft.", detail_summary: "Sachverhalt bleibt offen." };
  assert.ok(mediaImpactValidationErrors(analysis, item).includes("MEDIA_SELF_FRAME_UNSAFE:title"));
});

test("Absichtszuschreibung wird abgewiesen", () => {
  const item = story("Minister bezeichnet Sabotage als Klimaextremismus");
  const media = validMedia({ editorial_assessment: "Das Medium will mit der Überschrift manipulieren." });
  const analysis = { media_analysis_version: MEDIA_ANALYSIS_VERSION, media_impact: media, source_summary: item.source_summary, summary: "Die Ermittlungen dauern an.", detail_summary: "Die Ermittlungen dauern an." };
  assert.ok(mediaImpactValidationErrors(analysis, item).includes("MEDIA_INTENT_ATTRIBUTION_NOT_ALLOWED"));
});

test("Wirkungspotenzial darf nicht als sichere Wirkung formuliert werden", () => {
  const item = story("Minister bezeichnet Sabotage als Klimaextremismus");
  const media = validMedia(); media.resonance.discourse_effect = "Die Überschrift schwächt die Demokratie.";
  const analysis = { media_analysis_version: MEDIA_ANALYSIS_VERSION, media_impact: media, source_summary: item.source_summary, summary: "Die Ermittlungen dauern an.", detail_summary: "Die Ermittlungen dauern an." };
  assert.ok(mediaImpactValidationErrors(analysis, item).includes("MEDIA_EFFECT_OVERCLAIM"));
});

test("Personen- und Medienhaus-Scores sind ausgeschlossen", () => {
  const item = story("Minister bezeichnet Sabotage als Klimaextremismus");
  const media = validMedia({ editorial_assessment: "Das Medium erhält einen Score von 25 Prozent." });
  const analysis = { media_analysis_version: MEDIA_ANALYSIS_VERSION, media_impact: media, source_summary: item.source_summary, summary: "Die Ermittlungen dauern an.", detail_summary: "Die Ermittlungen dauern an." };
  assert.ok(mediaImpactValidationErrors(analysis, item).includes("MEDIA_OUTLET_SCORE_NOT_ALLOWED"));
});

test("Medienvergleich braucht mindestens zwei Quellen", () => {
  const item = story("Klimaextremismus bedroht die Stromversorgung");
  const result = sanitizeMediaImpact(validMedia({ source_comparison: { sufficient_basis: true, finding: "Darstellungen weichen ab." } }), item);
  assert.equal(result.media_impact.source_comparison.sufficient_basis, false);
});

test("Medienvergleich bleibt bei zwei verschiedenen Darstellungen möglich", () => {
  const sources = [source("Klimaextremismus bedroht die Stromversorgung", "Die Ermittlungen laufen.", { publisher: "Medium A", publisher_id: "a" }), source("Ermittlungen nach Sabotage", "Ein Minister verwendet eine politische Bezeichnung.", { source_id: "medium-b", publisher: "Medium B", publisher_id: "b", url: "https://example.org/b" })];
  const item = story(sources[0].title, sources[0].summary, sources);
  const result = sanitizeMediaImpact(validMedia({ source_comparison: { sufficient_basis: true, finding: "Die Überschriften setzen unterschiedliche Schwerpunkte." } }), item);
  assert.equal(result.media_impact.source_comparison.sufficient_basis, true);
});

test("Prompt behandelt externe Texte als untrusted input und fordert Sachverhalt vor Frame", () => {
  const item = story("Minister bezeichnet Sabotage als Klimaextremismus");
  item.preanalysis = { filter_version: "4.0" };
  const prompt = buildAnalysisPrompt([item]);
  assert.match(prompt, /UNTRUSTED_SOURCE_DATA_BEGIN/);
  assert.match(prompt, /Sachverhalt vor Frame/);
  assert.match(prompt, /media_impact/);
});

test("Backfill ist idempotent, versioniert und protokolliert reale Nutzung", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "woek-media-backfill-"));
  fs.mkdirSync(path.join(root, "data/news"), { recursive: true });
  const production = JSON.parse(fs.readFileSync(new URL("../../data/news/stories.json", import.meta.url), "utf8"));
  const climate = structuredClone(production.stories.find((entry) => entry.slug.includes("klimaextremismus")));
  fs.writeFileSync(path.join(root, "data/news/stories.json"), JSON.stringify({ schema_version: "1.1", stories: [climate] }));
  fs.writeFileSync(path.join(root, "data/news/usage.json"), JSON.stringify({ schema_version: "1.0", runs: [] }));
  fs.writeFileSync(path.join(root, "data/news/state.json"), JSON.stringify({ budget_fx: { rate_usd_per_eur: 1.1, rate_date: "2026-09-05", checked_at: "2026-09-05T06:00:00Z" } }));
  let calls = 0;
  const callAiImpl = async () => { calls += 1; return { analyses: [{ story_id: climate.story_id, media_impact: validMedia() }], provider: "test", model: "gpt-5.4-mini", mode: "test", method_sources: [], prompt_chars: 3000, answer_chars: 3000, reported_usage: { input_tokens: 900, output_tokens: 700 }, request_attempts: 1 }; };
  const first = await backfillMediaImpact({ root, limit: 2, dryRun: false, now: "2026-09-05T07:00:00Z", callAiImpl, build: () => {} });
  assert.equal(first.completed, 1, JSON.stringify(first));
  const saved = JSON.parse(fs.readFileSync(path.join(root, "data/news/stories.json"))).stories[0];
  assert.equal(saved.current_version, climate.current_version + 1);
  assert.equal(saved.analysis.media_analysis_version, MEDIA_ANALYSIS_VERSION);
  assert.ok(saved.analysis.media_impact.relevant);
  const second = await backfillMediaImpact({ root, limit: 2, dryRun: false, now: "2026-09-05T07:05:00Z", callAiImpl, build: () => {} });
  assert.equal(second.candidates, 0, JSON.stringify({ second, stored: saved.analysis.media_trigger_fingerprint, current: detectMediaImpactTrigger(saved).fingerprint }));
  assert.equal(calls, 1);
  const logged = JSON.parse(fs.readFileSync(path.join(root, "data/news/usage.json"))).runs[0];
  assert.ok(logged.counts.media_check_tokens > 0);
  assert.ok(logged.ai.media_check_cost_usd > 0);
});

test("bestehende Legacy-Akten bleiben bis zum selektiven Backfill gültig", () => {
  const item = story("Klimaextremismus bedroht die Stromversorgung");
  assert.deepEqual(mediaImpactValidationErrors({ source_summary: item.source_summary }, item), []);
});

test("Detailseite zeigt den Check nur bei Relevanz und nach der Ereignisanalyse", () => {
  const production = JSON.parse(fs.readFileSync(new URL("../../data/news/stories.json", import.meta.url), "utf8"));
  const item = structuredClone(production.stories.find((entry) => entry.slug.includes("klimaextremismus")));
  item.analysis.media_impact = validMedia();
  const html = storyPage(item);
  assert.ok(html.includes("Medien- &amp; Sprachwirkung"));
  assert.ok(html.indexOf('id="medienwirkung"') > html.indexOf('id="folgencheck"'));
  assert.ok(html.indexOf("Belegter Sachverhalt") < html.indexOf("Sprachlicher Befund"));
  delete item.analysis.media_impact;
  assert.ok(!storyPage(item).includes('id="medienwirkung"'));
});
